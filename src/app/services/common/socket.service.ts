import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';
import * as Rx from 'rxjs';

@Injectable()
export class SocketService {

  private subject: Subject<string> = new Subject<string>();
  private ws: WebSocket
  private socketStatus: Subject<string> = new Subject<string>();
  eventCallback$ = this.socketStatus.asObservable();
  dataCallback$ = this.subject.asObservable();

  constructor(
  ) { }

  //used by external programs to connect with websocket.
  public connect(url): Subject<string> {
    //check if websocket already exits, if it does, close it.
    if (this.ws) {
      this.ws.close();
    }
    this.create(url);
    console.log("Successfully connected to socket: " + url);
    return this.subject;
  }

  //returns state of the websocket.
  public wsState(): Number {
    if (!this.ws) {
      return -1
    } else {
      return this.ws.readyState;
    }
  }

  //setup websocket.
  private create(url) {
    this.ws = new WebSocket(url);
    this.ws.onopen = event => {
      this.socketStatus.next("connected")
    };
    this.ws.onclose = event => {
      this.socketStatus.next("disconnected")
    };
    this.ws.onmessage = event => {
      this.subject.next(event.data)
    };
  }

  //sends data on websocket.
  public send(data) {
    var sentData = JSON.stringify(data);
    this.ws.send(sentData);
  }

  //disconnects client from the socket.
  public disconnect() {
    try {
      this.ws.close();
     } catch (err) {};
  }
}