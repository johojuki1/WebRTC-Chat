import { Injectable } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ChatSocketService } from './chatSocket.service';
import { SettingsService } from '../common/settings.service'
import { RtcService } from '../common/rtc.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

//Stores values that is retrived by subscribed functions.
var messagesOut: Subject<string> = new Subject<string>();

@Injectable({
  providedIn: 'root'
})
export class RtcChatAdminService {

  private dataChannel: RTCDataChannel;
  private userRtc: webkitRTCPeerConnection;
  private userId: string;
  eventCallback$ = messagesOut.asObservable(); // Stream

  constructor(
    private chatSocketService: ChatSocketService,
    private rtcService: RtcService,
    private router: Router,
    private settingsService: SettingsService,
  ) {
  }

  //initiates the settings on the service.
  public initiateService() {
    //subscribe to chat socket. 
    try {
      this.subscribeToSocket();
    } catch (err) {
      //if socket does't exist, go back to choose chat screen.
      this.router.navigate(['chat']);
    }
    this.initiateRTC();
  }

  //subscribes to the messages value in chatService
  subscribeToSocket() {
    this.chatSocketService.messages.subscribe(msg => {
      var message = JSON.parse(JSON.stringify(msg.message))
      //determine what to do with the replying message.
      switch (message.type) {
        case "offer":
          this.onOffer(message.offer, message.userId);
          break;
        case "candidate":
          this.onCandidate(message.candidate);
          break;
        default:
          console.log("Message not recognised.");
      }
    });
  }

  //determines what happens when a user wants to call the administrator.
  async onOffer(offer, name) {
    this.userRtc.setRemoteDescription(new RTCSessionDescription(offer));
    this.userId = name;
    this.userRtc.setLocalDescription(
      await this.userRtc.createAnswer()
      .then(function (answer) {
        return answer;
      }))
    this.socketMessage({
      type: "answer",
      answer: this.userRtc.localDescription,
    });
  }

  //determines what happens when candidates are recieved.
  private onCandidate(candidate) {
    this.userRtc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  //send message through websocket.
  private socketMessage(message) {
    message.name = this.userId;
    this.chatSocketService.messages.next(message);
  }

  //Sets up the settings for the WebRTC connection.
  initiateRTC() {
    this.userRtc = this.rtcService.setupConnection();
    //setup ice handling.
    this.userRtc.onicecandidate = event => {
      if (event.candidate) {
        this.socketMessage({
          type: "candidate",
          candidate: event.candidate
        });
      }
    }
    this.setupDataChannel();
  }

  connectionState() {
    console.log(this.userRtc.iceConnectionState);
    console.log(this.userRtc.iceGatheringState);
    console.log(this.userRtc.signalingState);
    console.log(this.dataChannel.readyState);
  }

  //Setup Data Channel.
  setupDataChannel() {

    this.dataChannel = this.userRtc.createDataChannel("myDataChannel", this.settingsService.getDataChannelOptions());

    this.userRtc.ondatachannel = function (event) {
      event.channel.onopen = function () {
        event.channel.onmessage = event => {
          messagesOut.next(event.data);
        }
      }
    }
  }

  //Instructions

  //when a user clicks the send message button 
  sendMessage() {
    console.log("sending message");
    var val = 'test message from admin';
    this.dataChannel.send(val);
  };
}
