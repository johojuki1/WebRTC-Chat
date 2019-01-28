import { Component, OnInit } from '@angular/core';
import { ChatSocketService } from '../services/chat/chatSocket.service';
import { RtcService } from '../services/common/rtc.service';
import { SettingsService } from '../services/common/settings.service'
import { Router } from '@angular/router';

//connection to chat admin
var adminRtc

@Component({
  selector: 'app-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.scss']
})

export class UserChatComponent implements OnInit {

  constructor(
    private chatSocketService: ChatSocketService,
    private router: Router,
    private rtcService: RtcService,
    private settingsService: SettingsService,
  ) {

  }

  ngOnInit() {
    //subscribe to chat socket. 
    try {
      this.subscribe();
    } catch (err) {
      this.router.navigate(['chat']);
    };
    this.initiateRTC();
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
    await adminRtc.createOffer()
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
  }

  //determines what happens when candidates are recieved.
  private onCandidate(candidate) {
    adminRtc.addIceCandidate(new RTCIceCandidate(candidate)); 
  }

  //sends a message to websocket
  private socketMessage(message) {
    console.log('new message from client to websocket: ', message);
    //connect room id to message. As roomId and admin's username is the same, roomid will identify admin.
    message.name = this.settingsService.getRoomId();
    this.chatSocketService.messages.next(message);
  }

  //subscribes to the messages value in chatService
  subscribe() {
    this.chatSocketService.messages.subscribe(msg => {
      console.log("Response from websocket: " + msg);
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
  }
}
