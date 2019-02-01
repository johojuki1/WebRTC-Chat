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
    var configuration = {
      "iceServers": [
        {
          urls: this.settingsService.getIceServerURL()
        },
        {
          urls: "turn:numb.viagenie.ca",
          username: "johogames@hotmail.com",
          credential: "Control1"
  }
      ],
  "optional": [{ RtpDataChannels: true }]
};

var myConnection = new RTCPeerConnection(configuration);
console.log("RTCPeerConnection object was created");
return myConnection;
  };
}
