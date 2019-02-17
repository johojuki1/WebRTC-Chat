import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RtcChatUserService } from '../services/chat/rtc-chat-user.service'
import { SettingsService } from '../services/common/settings.service'
import { Message } from '../objects/message'


@Component({
  selector: 'app-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.scss']
})

export class UserChatComponent implements OnInit, OnDestroy {

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
    this.settingsService.setSubscribed("user_chat");
  }

  ngOnDestroy() {
    this.rtcChatUserService.disconnectRtc();
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
        chatMessage.message = chatMessage.message.replace("\n", "");
        this.textAreaChat = this.createChatString(chatMessage) + this.textAreaChat;
        break;
      case "general-message":
        //cast message into message object.
        var chatMessage: Message = <Message>JSON.parse(JSON.stringify(message.message));
        this.messageList.push(chatMessage);
        this.textAreaChat = '->   ' + chatMessage.message + '\n' + this.textAreaChat;
        break;
      case "refresh-chatbox":
        //reset the chat box with values provided by administrator.
        this.messageList = <Array<Message>>JSON.parse(JSON.stringify(message.messages));
        this.textAreaChat = '';
        this.messageList.forEach(message => {
          if (message.type === 'info') {
            this.textAreaChat = '->   ' + message.message + '\n' + this.textAreaChat;
          } else {
            this.textAreaChat = this.createChatString(message) + this.textAreaChat;
          }
        })
        break;
      case "password-fail":
        var chatMessage: Message = <Message>JSON.parse(JSON.stringify(message.message));
        this.textAreaChat = '->   ' + chatMessage.message + '\n' + this.textAreaChat;
        this.rtcChatUserService.disconnectRtc();
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

  public sendMessage() {
    if (this.inputBoxValue.length > 0 && this.inputBoxValue !== "\n") {
      //remove all newline symbols incase any were missed.
      this.inputBoxValue = this.inputBoxValue.replace("\n", "");
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

  showState() {
    this.rtcChatUserService.showState();
  }
}
