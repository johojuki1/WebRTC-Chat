import { Component, OnInit } from '@angular/core';
import { ChatSocketService } from '../services/chat/chatSocket.service';
import { SettingsService } from '../services/common/settings.service'
import { RtcService } from '../services/common/rtc.service';
import { Router } from '@angular/router';


//connection to users.
var userRtc: webkitRTCPeerConnection;
var userId: string;

@Component({
  selector: 'app-admin-chat',
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.scss']
})
export class AdminChatComponent implements OnInit {

  constructor(
    private chatSocketService: ChatSocketService,
    private rtcService: RtcService,
    private router: Router,
    private settingsService: SettingsService,
  ) { }

  ngOnInit() {
    //subscribe to chat socket. 
    try {
      this.subscribe();
    } catch (err) {
      this.router.navigate(['chat']);
    }
    this.initiateRTC();
  }

  //subscribes to the messages value in chatService
  subscribe() {
    this.chatSocketService.messages.subscribe(msg => {
      console.log("Response from websocket: " + msg);
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

  private socketMessage(message) {
    console.log('new message from client to websocket: ', message);
    //connect room id to message. As roomId and admin's username is the same, roomid will identify admin.
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

  connectionState() {
    console.log(userRtc.iceConnectionState);
  }
}
