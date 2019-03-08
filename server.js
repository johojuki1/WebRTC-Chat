/*
//SSL 

var fs = require('fs');

// read ssl certificate
var privateKey = fs.readFileSync('cert/_.jonathan-ho.com_private_key.key', 'utf8');
var certificate = fs.readFileSync('cert/jonathan-ho.com_ssl_certificate.cer', 'utf8');
var ca = fs.readFileSync('cert/-.jonathan-ho.com_ssl_certificate_INTERMEDIATE.cer', 'utf8')

var credentials = { key: privateKey, cert: certificate, ca:ca };
var https = require('https');
https.globalAgent.options.ca = require('ssl-root-cas/latest').create();

//pass in your credentials to create an https server
var httpsServer = https.createServer(credentials);
httpsServer.listen(9090);

//SSL
*/

//require our websocket library 
var WebSocketServer = require('ws').Server;

//creating a websocket server at port 9090 
var wss = new WebSocketServer({ port: 9090 });
//class declorations
//declare room class
class Room {
    constructor(adminId, name, adminName, requiresPassword, manAuth) {
        this.adminId = adminId;
        this.name = name;
        this.adminName = adminName;
        this.requiresPassword = requiresPassword;
        this.manAuth = manAuth;
    }

    set adminId(value) {
        this._adminId = value;
    }

    get adminId() {
        return this._adminId;
    }

    set name(value) {
        this._name = value;
    }

    get name() {
        return this._name;
    }

    set adminName(value) {
        this._adminName = value;
    }

    get adminName() {
        return this._adminName;
    }

    set requiresPassword(value) {
        this._requiresPassword = value;
    }

    get requiresPassword() {
        return this._requiresPassword;
    }

    set manAuth(value) {
        this._manAuth = value;
    }

    get manAuth() {
        return this._manAuth;
    }
}

//all connected to the server users
var users = {};

//all connected rooms to server
var rooms = {};

//socket for outputting server logs.
var logSocket;

//when a user connects to our sever 
wss.on('connection', function (connection) {

    //Create a new user item.
    connection.id = assignId();
    users[connection.id] = connection;
    //Tell user connection was successiful.
    sendTo(connection, {
        type: "connection",
        id: connection.id,
        success: "true",
    });
    outputLog("User connected with id " + users[connection.id].id);

    //when server gets a message from a connected user 
    connection.on('message', function (message) {
        var data;

        //accepting only JSON messages 
        try {
            data = JSON.parse(message);
        } catch (e) {
            outputLog("Invalid JSON");
            data = {};
        }

        //switching type of the user message.
        switch (data.type) {
            //Signalling functions.
            case "offer":
                //for ex. UserA wants to call UserB 
                outputLog("Sending offer to: " + data.name);

                //if UserB and requested room exists then send him offer details 
                var conn = users[data.name];

                if (conn != null && rooms[data.name] != null) {
                    //setting that UserA connected with UserB 
                    connection.otherName = data.name;

                    sendTo(conn, {
                        type: "offer",
                        offer: data.offer,
                        userId: data.userId,
                    });
                } else {
                    sendTo(connection, {
                        type: "connect-failed",
                    });
                }

                break;

            case "answer":
                outputLog("Sending answer to: " + data.name);
                //for ex. UserB answers UserA 
                var conn = users[data.name];

                if (conn != null) {
                    connection.otherName = data.name;
                    sendTo(conn, {
                        type: "answer",
                        answer: data.answer,
                        roomId: data.roomId,
                    });
                }

                break;

            case "candidate":
                var conn = users[data.name];

                if (conn != null) {
                    sendTo(conn, {
                        type: "candidate",
                        candidate: data.candidate,
                        roomId: data.roomId
                    });
                }

                break;

            //when a user tries to create a room.
            case "create-room":
                //checks if connection already has an active room.
                if (rooms[connection.id]) {
                    sendTo(connection, {
                        type: "create-room",
                        success: false,
                        message: "This connection already has an active room."
                    });
                } else {
                    //create a room under the specifications within the message.
                    rooms[connection.id] = new Room(connection.id, data.name, data.adminName, data.requiresPassword, data.manAuth);
                    outputLog("New room created with id: " + rooms[connection.id].adminId + " and name: " + rooms[connection.id].name);
                    //if room is successifully created, inform client.
                    sendTo(connection, {
                        type: "create-room",
                        success: true,
                        message: "Room successifully created."
                    });
                }
                break;
            //when a user tries to remove a room
            case "remove-room":
                //checks if connection has an active room.
                if (rooms[connection.id]) {
                    outputLog("Room deleted with id: " + rooms[connection.id].adminId + " and name: " + rooms[connection.id].name);
                    delete rooms[connection.id];
                }
                break;
            //when a user requests a list of available rooms
            case "request-rooms":
                //returns all available rooms
                sendTo(connection, {
                    type: "room-list",
                    message: rooms
                })
                break;
            //when a user requests the connection for server logs.
            case "get-server-logs":
                //pass socket to logSocket.
                outputLog("User " + connection.id + " has moved to log socket.");
                logSocket = connection;
                //remove the user.
                closeConnection(connection);
                break;
            default:
                sendTo(connection, {
                    type: "error",
                    message: "Command not found: " + data.type
                });

                break;
        }

    });

    //if close command is requested, close the connection.
    connection.on("close", function () {
        closeConnection(connection);
    });

    //if error on connection is detected, close the connection.
    connection.on('error', function () {
        closeConnection(connection);
    });
});

//closes connection, removes registered user connected, removes registered rooms connected. 
function closeConnection(connection) {
    if (connection.id) {
        try {
            if (users[connection.id]) {
                delete users[connection.id];
                outputLog("User has been removed: " + connection.id)
            }
        } catch (err) {
            outputLog("Error while removing user:" + connection.id)
        }
        try {
            if (rooms[connection.id]) {
                outputLog("Room deleted with id: " + rooms[connection.id].adminId + " and name: " + rooms[connection.id].name);
                delete rooms[connection.id];
            }
        } catch (err) {
            outputLog("Error while removing room:" + connection.id)
        }
    }
}

function outputLog(message) {
    console.log(message)
    //send through to log socket.
    try {
        logSocket.send(message);
    } catch (err) { };
}

function assignId() {
    var newId;
    newId = Math.floor(Math.random() * 90000) + 10000;
    if (users[newId]) {
    } else {
        return newId;
    }
}

function sendTo(connection, message) {
    connection.send(JSON.stringify(message));
}