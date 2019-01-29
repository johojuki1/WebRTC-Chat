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
  }

  public connectionState() {
    this.rtcChatAdminService.connectionState();
  }

  public sendMessage() {
    this.rtcChatAdminService.sendMessage();
  }

}
