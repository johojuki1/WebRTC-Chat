import { Injectable } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { SettingsService } from '../services/settings.service';
import { Observable, Subject } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export interface Message {
  message: string;
}

@Injectable()
export class ChatService {
  public messages: Subject<Message>;

  constructor(
    private socketService: SocketService,
    private settingsService: SettingsService
  ) {
  }

  public connect() {
    this.messages = <Subject<Message>>this.socketService
      .connect(this.settingsService.getChatWebsocketURL())
      .map((response: MessageEvent): Message => {
        let data = JSON.parse(response.data);
        return {
          message: data
        }
      });
  }

  public disconnect() {
    this.socketService.disconnect();
  }
}
