import { Injectable } from '@angular/core';

//stores all settings of the program.
//const WEBSOCKET_SERVER_URL = 'wss://jonathan-ho.com:9090';
const WEBSOCKET_SERVER_URL = 'ws://localhost:9090';
const ICE_SERVER_URL = 'stun:stun.1.google.com:19302'
const TURN_SERVER_URL = {
  urls: "turn:numb.viagenie.ca",
  username: "johogames@hotmail.com",
  credential: "Control1"
}

const DATA_CHANNEL_OPTIONS = {
  ordered: false, // do not guarantee order
  maxPacketLifeTime: 3000, // in milliseconds
  reliable: true
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
  //describes which page the user is currently viewing/
  private socketSubscribed: string;
  //describes whether turn servers should be used.
  private turn: boolean;
  //describes whether room requires password.
  private passwordRequired: boolean;
  //value of password.
  private password: string;
  //describes whether room requires manual authentication.
  private manAuth: boolean;

  constructor() {
    this.adminName = '';
    this.turn = true;
    this.passwordRequired = false;
  }

  //get url of socket.
  public getChatWebsocketURL() {
    return WEBSOCKET_SERVER_URL;
  }

  //get url of ice servers.
  public getIceServerURL() {
    return ICE_SERVER_URL;
  }
  //get turn server
  public getTurnServerURL() {
    return TURN_SERVER_URL;
  }

  public getDataChannelOptions() {
    return DATA_CHANNEL_OPTIONS;
  }

  //functions for controlling stored variables
  public reset() {
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

  public getSubscribed(string): boolean {
    if (string === this.socketSubscribed) {
      return true;
    } else {
      return false;
    }
  }

  public getTurn(): boolean {
    return this.turn;
  }

  public getPasswordRequired(): boolean {
    return this.passwordRequired;
  }

  public getPassword(): string {
    return this.password;
  }

  public getManAuth(): boolean {
    return this.manAuth;
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

  public setUserId(value: string) {
    this.userId = value;
  }

  public setAdminName(value: string) {
    this.adminName = value;
  }

  public setSubscribed(value: string) {
    this.socketSubscribed = value;
  }

  public setTurn(bool: boolean) {
    this.turn = bool;
  }

  public setPasswordRequired(bool: boolean) {
    this.passwordRequired = bool;
  }

  public setPassword(value: string) {
    this.password = value;
  }

  public setManAuth(bool: boolean) {
    this.manAuth = bool;
  }
}
