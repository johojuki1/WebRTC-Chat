import { Component, OnInit } from '@angular/core';
import { RtcChatAdminService } from '../services/chat/rtc-chat-admin.service';

@Component({
  selector: 'app-admin-chat',
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.scss']
})

export class AdminChatComponent implements OnInit {
  constructor(
    private rtcChatAdminService: RtcChatAdminService,
  ) { }

  ngOnInit() {
    this.rtcChatAdminService.initiateService();
    this.subscribeRTCMessage();
  }

  private subscribeRTCMessage() {
    this.rtcChatAdminService.eventCallback$.subscribe(data => {
      console.log("Message Recieved from User: " + data);
    })
  }

  public connectionState() { 
    this.rtcChatAdminService.connectionState();
  }

  public sendMessage() {
    this.rtcChatAdminService.sendMessage();
  }

}
