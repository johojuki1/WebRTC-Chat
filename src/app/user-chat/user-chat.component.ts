import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RtcChatUserService } from '../services/chat/rtc-chat-user.service'
import { SettingsService } from '../services/common/settings.service'
import { Message } from '../objects/message'
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.scss']
})

export class UserChatComponent implements OnInit {

  inputBoxValue: string;
  private messageList: Array<Message> = [];
  textAreaChat: string = '';

  constructor(
    private rtcChatUserService: RtcChatUserService,
    private settingsService: SettingsService,
    private ref: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.inputBoxValue = '';
    this.rtcChatUserService.initiateService();
    this.subscribeRTCMessage();
  }

  private subscribeRTCMessage() {
    this.rtcChatUserService.eventCallback$.subscribe(data => {
      console.log("Message Recieved from Admin: " + data);
      this.manageMessages(data);
    })
  }

  private manageMessages(data) {
    var message = JSON.parse(data)
    //determine what to do with the replying message.
    switch (message.type) {
      case "add-chat":
        //cast message into message object.
        var chatMessage: Message = <Message>JSON.parse(JSON.stringify(message.message));
        this.messageList.push(chatMessage);
        this.textAreaChat = this.createChatString(chatMessage) + this.textAreaChat;
        try {
          this.ref.detectChanges();
        } catch (error) { }
        break;
      default:
        console.log("RTC Message not recognised.");
    }
  }

  private createChatString(message: Message): string {
    var newMessageString = message.name + ': ' + message.message + '\n'
    return newMessageString;
  }

  public connectionState() {
    this.rtcChatUserService.connectionState();
  }

  public sendMessage() {
    if (this.inputBoxValue.length > 0) {
      this.rtcChatUserService.sendRtcMessage(
        {
          type: 'chat-request',
          message: this.inputBoxValue,
        })
      this.inputBoxValue = '';
    }
  }

  //determiens what happens when enter is pressed. last character is deleted and send is fired.
  onKeyEnter() {
    this.inputBoxValue = this.inputBoxValue.substring(0, this.inputBoxValue.length - 1);
    this.sendMessage();
  }

  getRoomName(): string {
    return this.settingsService.getRoomName();
  }

  getAdminName(): string {
    return this.settingsService.getAdminName();
  }
}
