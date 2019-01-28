import { Injectable } from '@angular/core';
import { RtcService } from '../common/rtc.service';
import { ChatSocketService } from '../chat/chatSocket.service';

@Injectable({
  providedIn: 'root'
})
export class ChatRtcService {
  private rtcConnection: webkitRTCPeerConnection;

  constructor(
    private rtcService: RtcService,
    private chatSocketService: ChatSocketService
  ) { }

  //Sets up the settings for the WebRTC connection.
  public initiate() {
    this.rtcConnection = this.rtcService.setupConnection();
    //setup ice handling.
    this.rtcConnection.onicecandidate = event => {
      if (event.candidate) {
        this.sendSocket({
          type: "candidate",
          candidate: event.candidate
        });
      }
    }
  }


  //Send Messages through websocket.
  public sendSocket(message) {
    //sends a message to websocket
    console.log('Sending through Websocket for RTCConnection: ' + message+ ' For user: ');
    this.chatSocketService.messages.next(message);
  };
}
