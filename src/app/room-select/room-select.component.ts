import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { Subscriber } from 'rxjs';

@Component({
  selector: 'app-room-select',
  templateUrl: './room-select.component.html',
  styleUrls: ['./room-select.component.scss']
})

export class RoomSelectComponent implements OnInit {

  constructor(private chatService: ChatService) {
  }

  ngOnInit() {

  }

  //requests a connection with websocket.
  connect() {
    console.log('Connecting to websocket');
    this.chatService.connect();
    this.subscribe();
  }

  //disconnects with connected websocket.
  disconnect() {
    console.log('Disconnecting from websocket');
    this.chatService.disconnect();
  }

  //request availabel rooms from websocket.
  requestRooms() {
    this.sendMsg(
      {
        type: 'request-rooms',
      }
    )
  }

  //Create available rooms
  createRoom() {
    this.sendMsg(
      {
        type: 'create-room',
        name: 'New Room',
        adminName: 'James'
      }
    )
  }

  //sends a message to websocket
  private sendMsg(message) {
    console.log('new message from client to websocket: ', message);
    this.chatService.messages.next(message);
  }

  //subscribes to the messages value in chatService
  private subscribe() {
    this.chatService.messages.subscribe(msg => {
      console.log("Response from websocket: " + msg);
    });
  }
}