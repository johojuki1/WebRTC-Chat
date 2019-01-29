import { Component, OnInit } from '@angular/core';
import { ChatSocketService } from '../services/chat/chatSocket.service';
import { RtcChatUserService } from '../services/chat/rtc-chat-user.service';
import { SettingsService } from '../services/common/settings.service'
import { Router } from '@angular/router';

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
  }

  public connectionState() {
    this.rtcChatUserService.connectionState();
  }

  public sendMessage() {
    this.rtcChatUserService.sendMessage();
  }
}
