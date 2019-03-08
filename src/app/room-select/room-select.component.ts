import { Component, OnInit } from '@angular/core';
import { ChatSocketService } from '../services/chat/chatSocket.service';
import { SettingsService } from '../services/common/settings.service'
import { Room } from '../objects/room'
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { RtcChatUserService } from '../services/chat/rtc-chat-user.service'
import { RtcChatAdminService } from '../services/chat/rtc-chat-admin.service'

@Component({
  selector: 'app-room-select',
  templateUrl: './room-select.component.html',
  styleUrls: ['./room-select.component.scss']
})

export class RoomSelectComponent implements OnInit {

  rooms: Array<Room>;

  constructor(
    private chatSocketService: ChatSocketService,
    private settingsService: SettingsService,
    private dialog: MatDialog,
    private router: Router,
    private chatUserService: RtcChatUserService,
    private chatAdminService: RtcChatAdminService,
  ) {
  }

  ngOnInit() {
    //reset all settings.
    this.settingsService.reset();
    //first attempt to remove all RTC connections.
    this.chatUserService.disconnectRtc();
    this.chatAdminService.disconnectRtc();
    //attempt to connect to socket.
    this.connect();
    this.settingsService.setSubscribed("main_menu");
  }

  //QUICK CREATE ROOM FOR TESTING
  quickCreateRoom() {
    this.settingsService.setRoomName('testRoom');
    this.settingsService.setUserName('testUsername');
    this.sendMsg(
      {
        type: 'create-room',
        name: 'testRoom',
        adminName: 'testUsername',
      }
    )
  }

  //requests a connection with websocket.
  connect() {
    console.log('Connecting to websocket');
    this.chatSocketService.connect();
    this.subscribe();
  }

  //request availabel rooms from websocket.
  requestRooms() {
    this.sendMsg(
      {
        type: 'request-rooms',
      }
    )
  }

  //enters a selected room.
  enterRoom(id: string, name: string) {
    this.settingsService.setRoomId(id);
    this.settingsService.setRoomName(name);
  }

  //sends a message to websocket
  private sendMsg(message) {
    console.log('Sending Data from client', message);
    this.chatSocketService.sendMessage(message);
  }

  //subscribes to the messages value in chatService
  private subscribe() {
    this.chatSocketService.messages.subscribe(msg => {
      var message = JSON.parse(msg)
      //check if user is looking at the correct page.
      if (this.settingsService.getSubscribed("main_menu")) {
        //determine what to do with the replying message.
        switch (message.type) {
          //A new list of available rooms is sent from server.
          case "room-list":
            var roomList: Array<Room>;
            roomList = [];
            Object.keys(message.message).forEach(function (key) {
              let tmpRoom = new Room();
              tmpRoom.init(message.message[key]._adminId, message.message[key]._adminName, message.message[key]._name, message.message[key]._requiresPassword, message.message[key]._manAuth);
              roomList.push(tmpRoom);
            });
            this.refreshRoomList(roomList);
            break;

          //server replies connection is successiful
          case "connection":
            if (message.success) {
              this.settingsService.setUserId(message.id);
              this.requestRooms();
            }
            break;

          //server replies if room creation is successiful.
          case "create-room":
            if (message.success) {
              //Navigate to administrator chat room.
              this.router.navigateByUrl('chat/admin', { skipLocationChange: true });
            }
            break;

          default:
            console.log("Message not recognised.");
        }
      };
    });
  }

  //Refreshes the list of rooms visible to user.
  private refreshRoomList(roomList: Array<Room>) {
    this.rooms = roomList;
  }

  //Functions for the room creation dialog.
  openRoomCreatorDialog(): void {
    this.dialog.open(CreateRoomDialog, {
      width: '250px',
      disableClose: true,
    });
  }

  //Functions for the room entry dialog.
  openRoomEntryDialog(id: string): void {
    //find the room then set relevant variables.
    if (this.rooms[id]) {
      //store room information in settings.
      this.settingsService.setRoomId(this.rooms[id].adminId);
      this.settingsService.setRoomName(this.rooms[id].roomName);
      this.settingsService.setAdminName(this.rooms[id].adminName);
      this.settingsService.setManAuth(this.rooms[id].manual);
      this.settingsService.setPasswordRequired(this.rooms[id].password);
      //open room entry dialog.
      this.dialog.open(EnterRoomDialog, {
        width: '250px',
        disableClose: true,
      });
    }
  }

  //returns the correct icon based on password requirements
  getPasswordIcon(passRequired: boolean): string {
    if (passRequired) {
      return "lock"
    } else {
      return "lock_open"
    }
  }

  //returns correct string based on manual authentication requirements
  getManAuth(manAuth: boolean): string {
    if (manAuth) {
      return "MANUAL"
    } else {
      return "AUTO"
    }
  }
}

@Component({
  selector: 'create-room-dialog',
  templateUrl: 'create-room-dialog.component.html',
})

export class CreateRoomDialog {

  public requiresPassword = false;
  public manAuth = false;

  constructor(
    public dialogRef: MatDialogRef<CreateRoomDialog>,
    private settingsService: SettingsService,
    private chatSocketService: ChatSocketService,
  ) { }

  //response if the user decides to press create room button.
  onCreate(room: string, name: string, password: string): void {
    //make sure room name and administrator name is more than 3 characters.
    if (room.length > 2 && name.length > 2) {
      //set room settings.
      this.settingsService.setRoomName(room);
      this.settingsService.setUserName(name);
      this.settingsService.setPasswordRequired(this.requiresPassword);
      this.settingsService.setManAuth(this.manAuth);
      //if password is required, save password.
      if (this.requiresPassword) {
        this.settingsService.setPassword(password);
      }
      //Clear administrator name;
      this.settingsService.setAdminName('');
      //send command to create room.
      this.sendMsg(
        {
          type: 'create-room',
          name: room,
          adminName: name,
          requiresPassword: this.requiresPassword,
          manAuth: this.manAuth,
        }
      )
      this.dialogRef.close();
    } else {
      alert("Room name, username and password must be longer than 3 characters.");
    }
  }

  //sends a message to websocket
  private sendMsg(message) {
    console.log('New message from client to websocket: ', message);
    this.chatSocketService.sendMessage(message);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'enter-room-dialog',
  templateUrl: 'enter-room-dialog.component.html',
})
export class EnterRoomDialog {

  constructor(
    public dialogRef: MatDialogRef<EnterRoomDialog>,
    private settingsService: SettingsService,
    private router: Router,
  ) { }

  //return if password is required for the room or not.
  getPasswordRequired(): boolean {
    return this.settingsService.getPasswordRequired();
  }

  //response if the user decides to press create room button.
  onEnter(name: string, password: string): void {
    this.settingsService.setUserName(name);
    //check if password is required. If so store user's password.
    if (this.settingsService.getPasswordRequired()) {
      this.settingsService.setPassword(password);
    }
    this.dialogRef.close();
    this.router.navigateByUrl('chat/user', { skipLocationChange: true });
  }

  onCancel(): void {
    this.settingsService.setRoomId('');
    this.settingsService.setUserName('');
    this.settingsService.setManAuth(false);
    this.settingsService.setPasswordRequired(false);
    this.dialogRef.close();
  }
}