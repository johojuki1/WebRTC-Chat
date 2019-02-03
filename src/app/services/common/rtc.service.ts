import { Injectable } from '@angular/core';
import { SettingsService } from '../common/settings.service';

@Injectable({
  providedIn: 'root'
})

export class RtcService {

  constructor(
    private settingsService: SettingsService,
  ) { }

  public setupConnection(): RTCPeerConnection {
    var servers = [
      {
        urls: this.settingsService.getIceServerURL()
      },
    ]
    if (this.settingsService.getTurn()) {
      servers.push(this.settingsService.getTurnServerURL());
    }
    var configuration = {
      "iceServers": servers,
      "optional": [{ RtpDataChannels: true }]
    };

    var myConnection = new RTCPeerConnection(configuration);
    console.log("RTCPeerConnection object was created");
    return myConnection;
  };
}
