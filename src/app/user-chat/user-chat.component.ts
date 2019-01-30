import { Component, OnInit } from '@angular/core';
import { RtcChatUserService } from '../services/chat/rtc-chat-user.service'
import { SettingsService } from '../services/common/settings.service'
import { Router } from '@angular/router';
import { Subscriber } from 'rxjs';

@Component({
  selector: 'app-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.scss']
})

export class UserChatComponent implements OnInit {

  inputBoxValue: string = '';

  constructor(
    private rtcChatUserService: RtcChatUserService,
    private settingsService: SettingsService,
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
    this.rtcChatUserService.sendRtcMessage(
      {
        type: 'chat-request',
        message: this.inputBoxValue,
      })
    this.inputBoxValue = '';
  }

  getRoomName(): string {
    return this.settingsService.getRoomName();
  }

  getAdminName(): string {
    return this.settingsService.getAdminName();
  }
}
