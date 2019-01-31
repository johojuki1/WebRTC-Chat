import { Injectable } from '@angular/core';
import { SocketService } from '../common/socket.service';
import { SettingsService } from '../common/settings.service';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

export interface Message {
  message: string;
}

@Injectable()
export class ChatSocketService {
  public messages: Subject<string> = new Subject<string>();

  constructor(
    public socketService: SocketService,
    private settingsService: SettingsService
  ) {
    this.subscribeData();
  }

  //connect to websocket.
  public connect() {
    this.socketService.connect(this.settingsService.getChatWebsocketURL());
  }

  //Subscribe to chat socket.
  private subscribeData() {
    this.socketService.dataCallback$.subscribe(data => {
      console.log("New data from websocket: " + data);
      this.messages.next(data);
    })
  }

  public sendMessage(data) {
    this.socketService.send(data);
  }

  public disconnect() {
    this.socketService.disconnect();
  }
}
