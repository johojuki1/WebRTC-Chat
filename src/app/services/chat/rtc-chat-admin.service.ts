import { Injectable } from '@angular/core';
import { ChatSocketService } from './chatSocket.service';
import { SettingsService } from '../common/settings.service'
import { RtcService } from '../common/rtc.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { User } from '../../objects/user'

//Stores values that is retrived by subscribed functions.
var messagesOut: Subject<string> = new Subject<string>();

//Stores users used by software. These users are authenticated
var users: Array<User> = [];

//Stores users waiting to be authenticated
var waitingUsers: Array<User> = [];

//WaitingUsers on change variable.
var waitingUsersOnChange: Subject<String> = new Subject<string>();

@Injectable({
  providedIn: 'root'
})
export class RtcChatAdminService {

  eventCallback$ = messagesOut.asObservable(); // Stream
  waitingUsersEventCallback$ = waitingUsersOnChange.asObservable(); // Stream

  constructor(
    private chatSocketService: ChatSocketService,
    private rtcService: RtcService,
    private router: Router,
    private settingsService: SettingsService,
  ) {
  }

  //initiates the settings on the service.
  public initiateService() {
    //subscribe to chat socket. 
    try {
      this.subscribeToSocket();
      //inform user that room has been initiated.
    } catch (err) {
      //if socket does't exist, go back to choose chat screen.
      this.router.navigate(['chat']);
    }
  }

  //subscribes to the messages value in chatService
  subscribeToSocket() {
    this.chatSocketService.messages.subscribe(msg => {
      if (this.settingsService.getSubscribed("admin_chat")) {
        var message = JSON.parse(msg)
        //determine what to do with the replying message.
        switch (message.type) {
          case "offer":
            this.onOffer(message.offer, message.userId.id, message.userId.name);
            break;
          case "candidate":
            this.onCandidate(message.candidate, message.roomId);
            break;
          default:
            console.log("Message not recognised. (Chat admin service) " + message.type);
        }
      }
    });
  }

  //determines what happens when a user wants to call the administrator.
  async onOffer(offer, socketId: string, name: string) {
    //setup new user.
    let newUser: User;
    //setup username
    newUser = this.initiateUser(socketId, name);
    newUser = this.setupDataChannel(newUser);
    newUser.rtc.setRemoteDescription(new RTCSessionDescription(offer));
    var message;
    newUser.rtc.setLocalDescription(
      //wait for answer to be created, then send answer.
      await newUser.rtc.createAnswer()
        .then(event => {
          message = {
            type: "answer",
            answer: event,
            roomId: newUser.roomId,
          };
          this.socketMessage(message, socketId);
          return event;
        }))
    //send answer.
  }

  //Generates a new id for the user. Used for RTC communication.
  private assignId(): string {
    var newId;
    do {
      newId = Math.floor(Math.random() * 90000) + 10000;
    } while (users[newId] || waitingUsers[newId])
    return <string>newId;
  }

  //determines what happens when candidates are recieved.
  private onCandidate(candidate, roomId) {
    if (users[roomId]) {
      var cand = new RTCIceCandidate(candidate);
      users[roomId].rtc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  //send message through websocket.
  private socketMessage(message, socketId) {
    message.name = socketId;
    this.chatSocketService.sendMessage(message);
  }

  //Initiates a user object.
  initiateUser(socketId: string, name: string): User {
    var newUser = new User();
    //setup user object.
    //setup name. If name is empty, record'Anonymous' instead
    if (name.length == 0) {
      newUser.username = 'Anonymous';
    } else {
      newUser.username = name;
    }
    newUser.rtc = this.rtcService.setupConnection();
    newUser.socketId = socketId;
    newUser.roomId = this.assignId();
    //setup ice handling
    newUser.rtc.onicecandidate = event => {
      if (event.candidate) {
        this.socketMessage({
          type: "candidate",
          candidate: event.candidate
        }, socketId);
      }
    }
    //detects if user has disconnected and deletes user.
    newUser.rtc.oniceconnectionstatechange = event => {
      if (newUser.rtc.iceConnectionState == 'disconnected') {
        //check if user is in authenticated users.
        if (users[newUser.roomId]) {
          this.broadcastGeneralMessage(newUser.username + " has disconnected from the room.");
        }
        this.removeUser(newUser.roomId);
      }
    }
    return newUser;
  }

  private removeUser(roomId) {
    //first attempt to remove from users list.
    if (users[roomId]) {
      //close all socket connections.
      users[roomId].rtc.close;
      users[roomId].datachannel.close;
      //delete user.
      users.splice(users.indexOf(users[roomId]), 1, undefined);
      //users[roomId] = undefined;
      console.log("Admin - Authenticated user removed with id: " + roomId);
    }
    if (waitingUsers[roomId]) {
      //close all socket connections.
      waitingUsers[roomId].rtc.close;
      waitingUsers[roomId].datachannel.close;
      //delete user.
      waitingUsers.splice(waitingUsers.indexOf(waitingUsers[roomId]), 1, undefined);
      //waitingUsers[roomId] = undefined;
      console.log("Admin - Unauthenticated user removed with id: " + roomId);
    }
    waitingUsersOnChange.next("");
  }

  //Setup Data Channel.
  setupDataChannel(user: User): User {
    //create datachannel
    user.datachannel = user.rtc.createDataChannel(user.roomId, this.settingsService.getDataChannelOptions());

    //when datachannel opens, broadcast to all users.
    user.datachannel.onopen = event => {
      this.dataChannelOnOpen(user);
    }

    user.rtc.ondatachannel = event => {
      event.channel.onmessage = event => {
        this.manageRtcMessage(event.data, user.roomId)
      }
    }
    return user;
  }

  //determines what happens when datachannel first opens.
  dataChannelOnOpen(user: User) {
    //add to list of users
    waitingUsers[user.roomId] = user;
    console.log("Admin - Added user with id: " + user.roomId);
    //if the room is not manually authenticated and does not have password, authenticate user.
    if (!this.settingsService.getManAuth() && !this.settingsService.getPasswordRequired()) {
      this.authenticateUser(user.roomId);
    } else {
      this.sendGeneralMessage('Connected to room. Waiting for authentication.', user)
    }
  }

  //Authenticate user
  private authenticateUser(userId: string) {
    //get user from waiting list.
    var user = waitingUsers[userId];
    users[userId] = user;
    if (user == null) {
      console.log("Error during authentication: cannot find user.");
      return;
    }
    //delete user from waiting list.
    try {
      waitingUsers.splice(waitingUsers.indexOf(waitingUsers[userId]), 1, undefined);
      //add users to authenticated list.
      waitingUsersOnChange.next("");
    } catch (err) {
      this.removeUser(userId);
      console.log("Error during authentication: Failed to delete user form waiting list.");
      return;
    }

    //create request to send all old messages to new user.
    var sentMessage =
    {
      type: 'refresh-chatbox',
      id: user.roomId,
    }
    messagesOut.next(JSON.stringify(sentMessage));
    //broadcast news a new user has been authenticated.
    this.broadcastGeneralMessage(user.username + " has connected to the room.")
  }

  //used by component to send history of messages to user.
  public sendAllMessages(id: number, messageHistory) {
    //create request to send all old messages to new user.
    var sentMessage =
    {
      type: 'refresh-chatbox',
      messages: messageHistory,
    }
    users[id].datachannel.send(JSON.stringify(sentMessage));
  }

  //broadcast informational messages to users.
  private broadcastGeneralMessage(data: string) {
    var sentMessage =
    {
      type: 'general-message',
      message: {
        name: 'admin',
        message: data,
        type: 'info'
      },
    }
    //push message to yourself
    messagesOut.next(JSON.stringify(sentMessage));
    //send message to others.
    this.broadcast(JSON.parse(JSON.stringify(sentMessage)));
  }

  //send information to one user.
  private sendGeneralMessage(data: string, user: User) {
    var sentMessage =
    {
      type: 'general-message',
      message: {
        name: 'admin',
        message: data,
        type: 'info'
      },
    }
    user.datachannel.send(JSON.stringify(sentMessage));
  }

  //manage contents of WebRTC message.
  private manageRtcMessage(data, roomId) {
    var data = JSON.parse(data)
    switch (data.type) {
      //user has requested broadcast of message throughout group.
      case "chat-request":
        this.onMessageRequest(data.message, roomId);
        break;
      //user has sent password to admin for authentication.
      case "password":
        this.managePassword(data.password, roomId);
        break;
      //clase connection.
      case "connection-close":
        if (users[roomId]) {
          this.broadcastGeneralMessage(users[roomId].username + " has left the room.");
        }
        this.removeUser(roomId);
        break;
      default:
        console.log("RTC Message not recognised.");
    }
  }

  //manage password
  private managePassword(password, roomId) {
    //if user exists in waiting room.
    if (waitingUsers[roomId]) {
      //if password is the same.
      if (this.settingsService.getPassword() == password) {
        waitingUsers[roomId].passwordGiven = true;
        //authenticate only if manual authentication is inactive.
        if (!this.settingsService.getManAuth()) {
          this.authenticateUser(roomId);
        }
      } else {
        //if password given is incorrect.
        var sentMessage =
        {
          type: 'password-fail',
          message: {
            message: "Password incorrect. Disconnecting from room.",
          },
        }
        waitingUsers[roomId].datachannel.send(JSON.stringify(sentMessage));
        this.removeUser(roomId);
      }
    }
  }

  //send request made by admin.
  public sendAdminRtcMessage(data) {
    var sentMessage =
    {
      type: 'add-chat',
      message: {
        name: this.settingsService.getUserName() + '(admin)',
        message: data,
        type: 'text'
      },
    }
    //push message to yourself
    messagesOut.next(JSON.stringify(sentMessage));
    //send message to others.
    this.broadcast(JSON.parse(JSON.stringify(sentMessage)));
  }

  //determines what happns when a message is received.
  private onMessageRequest(message, roomId) {
    if (users[roomId]) {
      var sentMessage =
      {
        type: 'add-chat',
        message: {
          name: users[roomId].username,
          message: message,
          type: 'text'
        },
      }
      //push message to yourself
      messagesOut.next(JSON.stringify(sentMessage));
      //send message to others.
      this.broadcast(JSON.parse(JSON.stringify(sentMessage)));
    }
  }

  //broadcasts messages to all users.
  private broadcast(data: object) {
    users.forEach(function (value) {
      if (value != undefined) {
        try {
          console.log("Sending message to: " + value.roomId);
          value.datachannel.send(JSON.stringify(data));
        } catch (err) {
          console.log("Failed to send message to: " + value.roomId);
        }
      }
    })
  }

  //disconnects the WEBRtc connection.
  public disconnectRtc() {
    try {
      //inform users then disconnect connection.
      this.broadcastGeneralMessage(this.settingsService.getUserName() + " (admin) has left the room. All users are disconnected.");
    }
    catch (err) { }
    try {
      users.forEach(function (value) {
        //close all connections
        value.datachannel.close;
        value.rtc.close;
      })
      users = new Array<User>();
    } catch (err) { };
  }

  public showState() {
    users.forEach(function (value) {
      //close all connections
      console.log("Signalling State: " + value.rtc.signalingState);
      console.log("Ice Connection: " + value.rtc.iceConnectionState);
      console.log("Ice Gathering: " + value.rtc.iceGatheringState);
      console.log("Data channel: " + value.datachannel.readyState);
    })
  }

  public getWaitingUsersArray(): Array<User> {
    return waitingUsers;
  }

  //user authentication is manually accepted by admin.
  public authenticationAccept(roomId: string) {
    //check if user exists in waiting list.
    if (waitingUsers[roomId]) {
      //check if password is given by user if room is password protected.
      if (this.settingsService.getPasswordRequired()) {
        if (!waitingUsers[roomId].passwordGiven) {
          //if user hasnt given password, remove user.
          this.removeUser(roomId);
          return;
        }
      }
      //authenticate user.
      this.authenticateUser(roomId);
    } else {
      //if user cannot be found. Remove and display error.
      this.removeUser(roomId);
      console.log("Authentication Error: user requested cannot be found.");
    }
  }

  //user authentication is manually denied by admin.
  public authenticationDeny(roomId: string) {
    //check if user exists in waiting list.
    if (waitingUsers[roomId]) {
      var sentMessage =
      {
        type: 'auth-fail',
        message: {
          message: "Administator has denied access to room. Disconnected from room.",
        },
      }
      try {
        waitingUsers[roomId].datachannel.send(JSON.stringify(sentMessage));
      } catch (err) {
        console.log("Authentication Error: Datachannel connection is not open.");
      }
      this.removeUser(roomId);
    } else {
      //if user cannot be found. Remove and display error.
      this.removeUser(roomId);
      console.log("Authentication Error: user requested cannot be found.");
    }
  }
}
