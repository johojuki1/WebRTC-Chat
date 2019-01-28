import { Injectable } from '@angular/core';

const WEBSOCKET_SERVER_URL = 'ws://localhost:9090';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(
  ) {  }

  public getChatWebsocketURL() {
    return WEBSOCKET_SERVER_URL;
  }
}
