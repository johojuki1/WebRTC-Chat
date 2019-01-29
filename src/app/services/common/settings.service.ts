import { Injectable } from '@angular/core';

//stores all settings of the program.
const WEBSOCKET_SERVER_URL = 'ws://10.0.0.4:9090';
const ICE_SERVER_URL = 'stun:stun.1.google.com:19302'

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  //stores variables that will be used by program.
  roomName: string;
  userName: string;
  userId: string;
  roomId: string;

  constructor() { }

  //get url of socket.
  public getChatWebsocketURL() {
    return WEBSOCKET_SERVER_URL;
  }

  //get url of ice servers.
  public getIceServerURL() {
    return ICE_SERVER_URL;
  }

  //Variable getters.
  public getRoomName() {
    return this.roomName;
  }

  public getUserName() {
    return this.userName;
  }

  public getRoomId() {
    return this.roomId;
  }

  public getUserId() {
    return this.userId;
  }

  //Variable Setters.
  public setRoomName(value: string) {
    this.roomName = value;
  }

  public setUserName(value: string) {
    this.userName = value;
  }

  public setRoomId(value: string) {
    this.roomId = value;
  }

  public setUserId(value:string) {
    this.userId = value;
  }
}
