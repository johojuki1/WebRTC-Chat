import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';
import * as Rx from 'rxjs';

@Injectable()
export class SocketService {

  private ws: WebSocket
  private socketStatus: Subject<string> = new Subject<string>();
  eventCallback$ = this.socketStatus.asObservable();

  constructor(
  ) { }

  private subject: Rx.Subject<MessageEvent>;

  //used by external programs to connect with websocket.
  public connect(url): Rx.Subject<MessageEvent> {
    this.subject = this.create(url);
    console.log("Successfully connected to socket: " + url);
    return this.subject;
  }

  private create(url): Rx.Subject<MessageEvent> {
    this.ws = new WebSocket(url);
    this.ws.onopen = event => { this.socketStatus.next("connected") };
    let observable = Rx.Observable.create(
      (obs: Rx.Observer<MessageEvent>) => {
        this.ws.onmessage = obs.next.bind(obs);
        this.ws.onerror = obs.error.bind(obs);
        this.ws.onclose = event => { this.socketStatus.next("disconnected"); obs.complete.bind(obs); }
        return this.ws.close.bind(this.ws);
      });
    let observer = {
      next: (data: Object) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(data));
        }
      }
    }
    return Rx.Subject.create(observer, observable);
  }

  //disconnects client from the socket.
  public disconnect() {
    this.ws.close;
    //initiate subject.
  }
}
