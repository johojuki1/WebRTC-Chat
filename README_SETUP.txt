This file simple setup information for the chat system.

The chat system requires a 2 server setup. 
    1. Angular website server - includes all contents of the capstone-chat folder. Serves website to users.
                                Needs to be compiled before use.
    2. javascript server - Is the server.js file in the root of the chapstone-chat folder.
                            Deploys signalling service and webSocket.

This program has been created utilising:
    1. Coded and can be compiled with Visual Studio Code.   https://code.visualstudio.com/
    2. Angular server is deployed with Apache HTTP server.  https://httpd.apache.org/
    3. Javascript Node server is deployed utilsing Node commands. https://nodejs.org/en/
It should also be able to be compiled/deployed utilising any other compatable software.

SETUP INSTRUCTIONS
1. Deploy the Node server utilising "server.js" in the root directory of the capstone-chat folder.
2. After the "server.js" file is deployed, the angular server application needs to be updated with the web address of the node server.
    a. Find correct connectable web address of the node server.
    b. Open "settings.service.ts" located from Root directory in src/services/common.
    c. All changable settings are CONSTANTS at the top of the file.
    d. Change WEBSOCKET_SERVER_URL to the address of the node server.
    e. Change TURN_SERVER_URL if more TURN servers are required. Initially there is only 1 TURN server account that can host 1 TURN client.
3. Compile the Angular Server.
4. Deploy Angular server with perferred server of choice.

NOTE
1. Since it's still under development, WebRTC is constantly undergoing change. Current version is confirmed working with Chrome Version 72.0.3626.121 and Firefox Version 65.0.2
2. At one point, Chrome removed WebRTC's functonality for direct peer-to-peer if the web connection is not HTTPs.
    You may have to setup HTTPs for both the Node server and Angular server. 
    The code for setting up HTTPs for the node server is commented out at the top of the server.js file.
    You will have to confirm and secure your own security certificate.

First is the javascript server: server.js located in the  