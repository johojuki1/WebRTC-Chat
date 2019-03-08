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
  public adminRtc: RTCPeerConnection;
  private dataChannel: RTCDataChannel;
  private storedCandidates: Array<RTCIceCandidate>;

  constructor(
    private chatSocketService: ChatSocketService,
    private router: Router,
    private rtcService: RtcService,
    private settingsService: SettingsService,
  ) {
  }

  //functions to run to initiate service.
  initiateService() {
    this.storedCandidates = [];
    this.roomId = '';
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
      if (event.candidate) {
        //if id exists, send the candidate.
        if (this.roomId.length === 0)
          this.storedCandidates.push(event.candidate);
        //if it does not, store candidate.
        else {
          this.sendCandidate(event.candidate);
        }
      };
    }
  }


  sendCandidate(candidate) {
    this.socketMessage({
      type: "candidate",
      candidate: candidate,
      roomId: this.roomId
    });
  }

  //Make an offer to admin.
  async sendOffer() {
    this.adminRtc.setLocalDescription(
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
    )
  }

  //when an answer is recieved. Also assigns an id from administrator.
  private onAnswer(answer, assignedId) {
    this.roomId = assignedId;
    //send all stored candidates.
    this.storedCandidates.forEach(value => {
      this.socketMessage({
        type: "candidate",
        candidate: value,
        roomId: this.roomId
      })
    })
    this.adminRtc.setRemoteDescription(new RTCSessionDescription(answer))
  }

  //determines what happens when candidates are recieved.
  private onCandidate(candidate) {
    this.adminRtc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  //sends a message to websocket
  socketMessage(message) {
    //connect room id to message. As roomId and admin's username is the same, roomid will identify admin.
    message.name = this.settingsService.getRoomId();
    this.chatSocketService.sendMessage(message);
  }

  //subscribes to the messages value in chatService
  subscribe() {
    this.chatSocketService.messages.subscribe(msg => {
      if (this.settingsService.getSubscribed("user_chat")) {
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
            console.log("Message not recognised. User Service");
        }
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
        this.managePassword();
      };
      event.channel.onmessage = event => {
        messagesOut.next(event.data);
      };
    };
  }

  //checks if password is required and sends registered password.
  private managePassword() {
    //send password if required.
    if (this.settingsService.getPasswordRequired) {
      this.sendRtcMessage(
        {
          type: 'password',
          password: this.settingsService.getPassword(),
        }, true)
    }
  }

  //when a user clicks the send message button 
  //error boolean determines if error should show on send failure.
  sendRtcMessage(message, error: boolean) {
    console.log("sending message: " + message);
    try {
      this.dataChannel.send(JSON.stringify(message));
    } catch (err) {
      if (error) {
        console.log("Failed to send message to admin.");
        var sentMessage =
        {
          type: 'general-message',
          message: {
            name: 'admin',
            message: "Message failed to send.",
            type: 'info'
          },
        }
        messagesOut.next(JSON.stringify(sentMessage));
      }
    }
  };

  //disconnects the WEBRtc connection.
  public disconnectRtc() {
    try {
      //inform server to close the rtc connection.
      this.sendRtcMessage(
        {
          type: 'connection-close',
        }, false)
      //close the connection.
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