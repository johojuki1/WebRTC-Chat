import { Injectable } from '@angular/core';
import { ChatSocketService } from './chatSocket.service';
import { RtcService } from '../common/rtc.service';
import { SettingsService } from '../common/settings.service'
import { Router } from '@angular/router';
import { Subject } from 'rxjs';


var messagesOut: Subject<string> = new Subject<string>();

@Injectable({
  providedIn: 'root'
})
export class RtcChatUserService {

  eventCallback$ = messagesOut.asObservable(); // Stream
  private roomId: string;
  private adminRtc: RTCPeerConnection;
  private dataChannel: RTCDataChannel;
  private localDesc;


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
    this.adminRtc = this.rtcService.setupConnection();
    //setup ice handling.
    this.adminRtc.onicecandidate = event => {
      if (event.candidate && this.roomId) {
        this.socketMessage({
          type: "candidate",
          candidate: event.candidate,
          roomId: this.roomId
        });
      }
    }
  }

  //Make an offer to admin.
  async sendOffer() {
    this.localDesc =
      await this.adminRtc.createOffer({
        offerToReceiveAudio: true
      })
        //wait for response then send offer.
        .then(event => {
          this.socketMessage({
            type: 'offer',
            offer: event,
            userId: {
              id: this.settingsService.getUserId(),
              name: this.settingsService.getUserName(),
            }
          });
          return event;
        })
  }

  //when an answer is recieved. Also assigns an id from administrator.
  private onAnswer(answer, assignedId) {
    this.adminRtc.setLocalDescription(this.localDesc);
    this.adminRtc.setRemoteDescription(new RTCSessionDescription(answer))
    this.roomId = assignedId;
  }

  //determines what happens when candidates are recieved.
  private onCandidate(candidate) {
    this.adminRtc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  //sends a message to websocket
  private socketMessage(message) {
    //connect room id to message. As roomId and admin's username is the same, roomid will identify admin.
    message.name = this.settingsService.getRoomId();
    this.chatSocketService.sendMessage(message);
  }

  //subscribes to the messages value in chatService
  subscribe() {
    this.chatSocketService.messages.subscribe(msg => {
      var message = JSON.parse(msg);
      //determine what to do with the replying message.
      switch (message.type) {
        case "answer":
          this.onAnswer(message.answer, message.roomId);
          break;
        case "candidate":
          this.onCandidate(message.candidate);
          break;
        case "connect-failed":
          alert("Connection failed. Room not found.")
          this.router.navigateByUrl('chat');
          break;
        default:
          console.log("Message not recognised.");
      }
    });
  }

  //creating data channel 
  openDataChannel() {

    this.dataChannel = this.adminRtc.createDataChannel("myDataChannel", this.settingsService.getDataChannelOptions());

    this.adminRtc.ondatachannel = event => {
      //once the channel is open disconnect form socket.
      event.channel.onopen = event => {
        this.chatSocketService.disconnect();
      };
      event.channel.onmessage = event => {
        messagesOut.next(event.data);
      };
    };
  }

  //when a user clicks the send message button 
  sendRtcMessage(message) {
    console.log("sending message: " + message);
    this.dataChannel.send(JSON.stringify(message));
  };

  //disconnects the WEBRtc connection.
  public disconnectRtc() {
    try {
      this.dataChannel.close();
      this.adminRtc.close();
      this.dataChannel = new RTCDataChannel();
      this.adminRtc = new RTCPeerConnection();
    } catch (err) { };
  }

  public showState() {
    //close all connections
    console.log("Signalling State: " + this.adminRtc.signalingState);
    console.log("Ice Connection: " + this.adminRtc.iceConnectionState);
    console.log("Ice Gathering: " + this.adminRtc.iceGatheringState);
    console.log("Data channel: " + this.dataChannel.readyState);
  }
}