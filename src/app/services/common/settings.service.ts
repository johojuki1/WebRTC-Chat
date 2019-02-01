import { Injectable } from '@angular/core';

//stores all settings of the program.
const WEBSOCKET_SERVER_URL = 'ws://58.173.98.139:9090';
const ICE_SERVER_URL = 'stun:stun.1.google.com:19302'

const DATA_CHANNEL_OPTIONS = {
  ordered: false, // do not guarantee order
  maxPacketLifeTime: 3000, // in milliseconds
  reliable:true
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  //stores variables that will be used by program.
  //Name of room.
  private roomName: string;
  //User's current name.
  private userName: string;
  //Socket ID of the user.
  private userId: string;
  //ID of room, same as admin Id.
  private roomId: string;
  //Name of admin of room.
  private adminName: string;

  constructor() {
    this.adminName = '';
   }

  //get url of socket.
  public getChatWebsocketURL() {
    return WEBSOCKET_SERVER_URL;
  }

  //get url of ice servers.
  public getIceServerURL() {
    return ICE_SERVER_URL;
  }

  public getDataChannelOptions(){
    return DATA_CHANNEL_OPTIONS;
  }

  //functions for controlling stored variables
  public reset (){
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

  public getAdminName() {
    return this.adminName;
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

  public setAdminName(value:string) {
    this.adminName = value;
  }
}
