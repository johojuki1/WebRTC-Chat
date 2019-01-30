import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RtcChatAdminService } from '../services/chat/rtc-chat-admin.service';
import { SettingsService } from '../services/common/settings.service'
import { Message } from '../objects/message'

@Component({
  selector: 'app-admin-chat',
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.scss']
})

export class AdminChatComponent implements OnInit {

  inputBoxValue: string;
  private messageList: Array<Message> = [];
  textAreaChat: string = '';

  constructor(
    private rtcChatAdminService: RtcChatAdminService,
    private settingsService: SettingsService,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.rtcChatAdminService.initiateService();
    this.subscribeRTCMessage();
  }

  private subscribeRTCMessage() {
    this.rtcChatAdminService.eventCallback$.subscribe(data => {
      console.log("Message Recieved from User: " + data);
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
        break;
      //informational messages sent yb admin.
      case "general-message":
        //cast message into message object.
        var chatMessage: Message = <Message>JSON.parse(JSON.stringify(message.message));
        this.messageList.push(chatMessage);
        this.textAreaChat = chatMessage.message + '\n' + this.textAreaChat;
        break;
      default:
        console.log("RTC Message not recognised.");
    }
    try {
      this.ref.detectChanges();
    } catch (error) { }
  }

  private createChatString(message: Message): string {
    var newMessageString = message.name + ': ' + message.message + '\n'
    return newMessageString;
  }

  public connectionState() {
    this.rtcChatAdminService.connectionState();
  }

  getRoomName(): string {
    return this.settingsService.getRoomName();
  }

  //instructions for when admin wants to send a message.
  public sendMessage() {
    if (this.inputBoxValue.length > 0) {
      this.rtcChatAdminService.sendAdminRtcMessage(this.inputBoxValue)
      this.inputBoxValue = '';
    }
  }

  //determiens what happens when enter is pressed. last character is deleted and send is fired.
  onKeyEnter() {
    this.inputBoxValue = this.inputBoxValue.substring(0, this.inputBoxValue.length - 1);
    this.sendMessage();
  }

}
