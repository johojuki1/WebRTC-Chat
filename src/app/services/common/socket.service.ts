import { Injectable } from '@angular/core';
import * as Rx from 'rxjs';

@Injectable()
export class SocketService {

  private ws: WebSocket

  constructor() { }

  private subject: Rx.Subject<MessageEvent>;

  //used by external programs to connect with websocket.
  public connect(url): Rx.Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log("Successfully connected: " + url);
    }
    return this.subject;
  }

  private create(url): Rx.Subject<MessageEvent> {
    this.ws = new WebSocket(url)
    let observable = Rx.Observable.create(
      (obs: Rx.Observer<MessageEvent>) => {
        this.ws.onmessage = obs.next.bind(obs);
        this.ws.onerror = obs.error.bind(obs);
        this.ws.onclose = obs.complete.bind(obs);
        return this.ws.close.bind(this.ws);
      })
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
  public disconnect(){
    if (this.subject) {
      this.ws.close();
      //initiate subject.
      this.subject = null;
    }
  }
}
