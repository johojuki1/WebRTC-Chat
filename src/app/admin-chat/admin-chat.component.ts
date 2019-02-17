import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RtcChatAdminService } from '../services/chat/rtc-chat-admin.service';
import { SettingsService } from '../services/common/settings.service'
import { ChatSocketService } from '../services/chat/chatSocket.service'
import { Message } from '../objects/message'
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-chat',
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.scss']
})

export class AdminChatComponent implements OnInit, OnDestroy {

  private messageList: Array<Message> = [];
  inputBoxValue: string;
  textAreaChat: string = '';
  private socketStatus: string = 'connected';

  constructor(
    private rtcChatAdminService: RtcChatAdminService,
    private settingsService: SettingsService,
    private chatSocketService: ChatSocketService,
    private ref: ChangeDetectorRef,
    private router: Router,
  ) { }

  ngOnInit() {
    //check if admin name is set, if it is it means user is in wrong place. Redirect.
    if (this.settingsService.getAdminName().length != 0) {
      this.router.navigateByUrl('chat');
    } else {
      this.rtcChatAdminService.initiateService();
      this.subscribeRTCMessage();
      this.subscribeSocketStatus();
    }
    this.settingsService.setSubscribed("admin_chat");
  }

  ngOnDestroy() {
  }

  //subscribes to the messges recieved form webRTC connection.
  private subscribeRTCMessage() {
    this.rtcChatAdminService.eventCallback$.subscribe(data => {
      this.manageMessages(data);
    })
  }

  //subscribes to the status of the socket. Connected or disconnected.
  private subscribeSocketStatus() {
    this.chatSocketService.socketService.eventCallback$.subscribe(data => {
      console.log("Socket Status Changed " + data);
      this.socketStatus = data;
      //if socket status is connected, attempt to list room. Only do this if admin name does not exist.
      if (this.socketStatus === "connected" && this.settingsService.getAdminName().length == 0) {
        var message: any = {
          type: 'create-room',
          name: this.settingsService.getRoomName(),
          adminName: this.settingsService.getUserName(),
          requiresPassword: this.settingsService.getPasswordRequired(),
          manAuth: this.settingsService.getManAuth(),
        }
        this.chatSocketService.sendMessage(message);
      }
      this.refreshPage();
    })
  }

  //manage received webRTC messages.
  private manageMessages(data) {
    var message = JSON.parse(data)
    //determine what to do with the replying message.
    switch (message.type) {
      case "add-chat":
        //cast message into message object.
        var chatMessage: Message = <Message>JSON.parse(JSON.stringify(message.message));
        this.messageList.push(chatMessage);
        //remove all newline symbols incase any were missed.
        chatMessage.message = chatMessage.message.replace("\n", "");
        this.textAreaChat = this.createChatString(chatMessage) + this.textAreaChat;
        break;
      //informational messages sent yb admin.
      case "general-message":
        //cast message into message object.
        var chatMessage: Message = <Message>JSON.parse(JSON.stringify(message.message));
        this.messageList.push(chatMessage);
        this.textAreaChat = '->   ' + chatMessage.message + '\n' + this.textAreaChat;
        break;
      //new user has connected, message history is requested.
      case "refresh-chatbox":
        this.rtcChatAdminService.sendAllMessages(message.id, this.messageList);
        break;
      default:
        console.log("RTC Message not recognised.");
    }
    this.refreshPage()
  }

  //Creates the string viewed by users.
  private createChatString(message: Message): string {
    var newMessageString = message.name + ': ' + message.message + '\n'
    return newMessageString;
  }

  //gets the name of the room.
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

  //force page to refresh.
  private refreshPage() {
    try {
      this.ref.detectChanges();
    } catch (error) { }
  }

  getSocketButtonColour(): string {
    switch (this.socketStatus) {
      case "connected":
        return 'green';
      case "disconnected":
        return 'red';
      default:
        return "yellow";
    }
  }

  getSocketText(): string {
    switch (this.socketStatus) {
      case "connected":
        return "Disconnect from Server";
      case "disconnected":
        return "Connect to Server";
      default:
        return "ERROR";
    }
  }

  toggleSocket() {
    switch (this.socketStatus) {
      case "connected":
        this.chatSocketService.disconnect();
        break;
      case "disconnected":
        this.chatSocketService.connect();
        break;
      default:
        console.log("Error occured when toggling socket.");
    }
  }

  showState() {
    this.rtcChatAdminService.showState();
  }
}
