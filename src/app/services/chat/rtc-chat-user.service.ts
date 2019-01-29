import { Injectable } from '@angular/core';
import { ChatSocketService } from './chatSocket.service';
import { RtcService } from '../common/rtc.service';
import { SettingsService } from '../common/settings.service'
import { Router } from '@angular/router';
import { Subject } from 'rxjs';


//connection to chat admin
var adminRtc;
var dataChannel;
var messagesOut: Subject<string> = new Subject<string>();

@Injectable({
  providedIn: 'root'
})
export class RtcChatUserService {

  eventCallback$ = messagesOut.asObservable(); // Stream

  constructor(
    private chatSocketService: ChatSocketService,
    private router: Router,
    private rtcService: RtcService,
    private settingsService: SettingsService,
  ) {
  }

  //functions to run to initiate service.
  initiateService() {
    //subscribe to chat socket. 
    try {
      this.subscribe();
    } catch (err) {
      this.router.navigate(['chat']);
    };
    this.initiateRTC();
    this.openDataChannel();
    this.sendOffer();
  }

  //Sets up the settings for the WebRTC connection.
  initiateRTC() {
    adminRtc = this.rtcService.setupConnection();
    //setup ice handling.
    adminRtc.onicecandidate = event => {
      if (event.candidate) {
        this.socketMessage({
          type: "candidate",
          candidate: event.candidate
        });
      }
    }
  }

  //Make an offer to admin.
  async sendOffer() {
    await adminRtc.createOffer({
      offerToReceiveAudio: true
    })
      .then(function (offer) {
        adminRtc.setLocalDescription(offer);
      })
    this.socketMessage({
      type: 'offer',
      offer: adminRtc.localDescription,
      userId: this.settingsService.getUserId(),
    });
  }

  //when an answer is recieved.
  private onAnswer(answer) {
    adminRtc.setRemoteDescription(new RTCSessionDescription(answer))
    console.log(adminRtc.getConfiguration())
  }

  //determines what happens when candidates are recieved.
  private onCandidate(candidate) {
    adminRtc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  //sends a message to websocket
  private socketMessage(message) {
    //connect room id to message. As roomId and admin's username is the same, roomid will identify admin.
    message.name = this.settingsService.getRoomId();
    this.chatSocketService.messages.next(message);
  }

  //subscribes to the messages value in chatService
  subscribe() {
    this.chatSocketService.messages.subscribe(msg => {
      var message = JSON.parse(JSON.stringify(msg.message))
      //determine what to do with the replying message.
      switch (message.type) {
        case "answer":
          this.onAnswer(message.answer);
          break;
        case "candidate":
          this.onCandidate(message.candidate);
          break;
        default:
          console.log("Message not recognised.");
      }
    });
  }

  connectionState() {
    console.log(adminRtc.iceConnectionState);
    console.log(adminRtc.iceGatheringState);
    console.log(adminRtc.signalingState);
    console.log(dataChannel.readyState);
  }

  //creating data channel 
  openDataChannel() {

    dataChannel = adminRtc.createDataChannel("myDataChannel", this.settingsService.getDataChannelOptions());

    adminRtc.ondatachannel = function (event) {
      event.channel.onopen = function () {
        event.channel.onmessage = event => {
          messagesOut.next(event.data);
        };
      };
    };
  }

  //when a user clicks the send message button 
  sendMessage() {
    console.log("sending message");
    var val = 'test message from user.';
    dataChannel.send(val);
  };
}