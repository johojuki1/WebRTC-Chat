import { Component, OnInit, Inject } from '@angular/core';
import { ChatSocketService } from '../services/chat/chatSocket.service';
import { SettingsService } from '../services/common/settings.service'
import { Room } from '../objects/room'
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';

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
  ) {
  }

  ngOnInit() {
    this.connect();
  }

  //QUICK CREATE ROOM FOR TESTING
  quickCreateRoom() {
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

  //disconnects with connected websocket.
  disconnect() {
    console.log('Disconnecting from websocket');
    this.chatSocketService.disconnect();
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
  enterRoom(id:string, name:string) {
    this.settingsService.setRoomId(id);
    this.settingsService.setRoomName(name);
  }

  //sends a message to websocket
  private sendMsg(message) {
    console.log('new message from client to websocket: ', message);
    this.chatSocketService.messages.next(message);
  }

  //subscribes to the messages value in chatService
  private subscribe() {
    this.chatSocketService.messages.subscribe(msg => {
      console.log("Response from websocket: " + msg);
      var message = JSON.parse(JSON.stringify(msg.message))

      //determine what to do with the replying message.
      switch (message.type) {

        //A new list of available rooms is sent from server.
        case "room-list":
          var roomList: Array<Room>;
          roomList = [];
          Object.keys(message.message).forEach(function (key) {
            let tmpRoom = new Room();
            tmpRoom.init(message.message[key]._adminId, message.message[key]._adminName, message.message[key]._name);
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
            this.router.navigate(['chat/admin']);
          }
          break;

        default:
          console.log("Message not recognised.");
      }
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
    });
  }

  //Functions for the room entry dialog.
  openRoomEntryDialog(id: string, name: string): void {
    //store room information in settings.
    this.settingsService.setRoomId(id);
    this.settingsService.setUserName(name);
    //open room entry dialog.
    this.dialog.open(EnterRoomDialog, {
      width: '250px',
    });
  }
}

@Component({
  selector: 'create-room-dialog',
  templateUrl: 'create-room-dialog.component.html',
})

export class CreateRoomDialog {

  constructor(
    public dialogRef: MatDialogRef<CreateRoomDialog>,
    private settingsService: SettingsService,
    private chatSocketService: ChatSocketService,) { }

  //response if the user decides to press create room button.
  onCreate(room: string, name: string): void {
    this.settingsService.setRoomName(room);
    this.settingsService.setUserName(name);
    //send command to create room.
    this.sendMsg(
      {
        type: 'create-room',
        name: room,
        adminName: name,
      }
    )
    this.dialogRef.close();
  }

  //sends a message to websocket
  private sendMsg(message) {
    console.log('new message from client to websocket: ', message);
    this.chatSocketService.messages.next(message);
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
  ) {}

  //response if the user decides to press create room button.
  onEnter(name: string): void {
    this.settingsService.setUserName(name);
    this.dialogRef.close();
    this.router.navigate(['chat/user']);
  }

  onCancel(): void {
    this.settingsService.setRoomId('');
    this.settingsService.setUserName('');
    this.dialogRef.close();
  }
}