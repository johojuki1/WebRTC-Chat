import { Injectable } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ChatSocketService } from './chatSocket.service';
import { SettingsService } from '../common/settings.service'
import { RtcService } from '../common/rtc.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

var userRtc;
var userId: string;
var dataChannel: RTCDataChannel;
var messagesOut: Subject<string> = new Subject<string>();

@Injectable({
  providedIn: 'root'
})
export class RtcChatAdminService {

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
    userRtc.setRemoteDescription(new RTCSessionDescription(offer));
    await userRtc.createAnswer()
      .then(function (answer) {
        userRtc.setLocalDescription(answer);
        userId = name;
      })
    this.socketMessage({
      type: "answer",
      answer: userRtc.localDescription,
    });
  }

  //determines what happens when candidates are recieved.
  private onCandidate(candidate) {
    userRtc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  //send message through websocket.
  private socketMessage(message) {
    message.name = userId;
    this.chatSocketService.messages.next(message);
  }

  //Sets up the settings for the WebRTC connection.
  initiateRTC() {
    userRtc = this.rtcService.setupConnection();
    //setup ice handling.
    userRtc.onicecandidate = event => {
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
    console.log(userRtc.iceConnectionState);
    console.log(userRtc.iceGatheringState);
    console.log(userRtc.signalingState);
    console.log(dataChannel.readyState);
  }

  //Setup Data Channel.
  setupDataChannel() {

    dataChannel = userRtc.createDataChannel("myDataChannel", this.settingsService.getDataChannelOptions());

    userRtc.ondatachannel = function (event) {
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
    dataChannel.send(val);
  };
}
