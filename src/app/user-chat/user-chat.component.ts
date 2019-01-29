import { Component, OnInit } from '@angular/core';
import { ChatSocketService } from '../services/chat/chatSocket.service';
import { RtcChatUserService } from '../services/chat/rtc-chat-user.service';
import { SettingsService } from '../services/common/settings.service'
import { Router } from '@angular/router';
import { Subscriber } from 'rxjs';

@Component({
  selector: 'app-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.scss']
})

export class UserChatComponent implements OnInit {

  constructor(
    private rtcChatUserService: RtcChatUserService,
  ) {
  }

  ngOnInit() {
    this.rtcChatUserService.initiateService();
    this.subscribeRTCMessage();
  }

  private subscribeRTCMessage() {
    this.rtcChatUserService.eventCallback$.subscribe(data => {
      console.log("Message Recieved from Admin: " + data);
    })
  }

  public connectionState() {
    this.rtcChatUserService.connectionState();
  }

  public sendMessage() {
    this.rtcChatUserService.sendMessage();
  }
}
