import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RtcService {

  constructor() { }

  public setupConnection(): webkitRTCPeerConnection {
    var configuration = { 
      "iceServers": [{ urls: "stun:stun.1.google.com:19302" }] 
   }; 
 
   var myConnection = new webkitRTCPeerConnection(configuration); 
   console.log("RTCPeerConnection object was created"); 
   console.log(myConnection); 
   return myConnection;
  };
}
