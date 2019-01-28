//require our websocket library 
var WebSocketServer = require('ws').Server;

//creating a websocket server at port 9090 
var wss = new WebSocketServer({ port: 9090 });
//class declorations
//declare room class
class Room {
    constructor(adminId, name, adminName) {
        this.adminId = adminId;
        this.name = name;
        this.adminName = adminName;
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
}

//all connected to the server users
var users = {};

//all connected rooms to server
var rooms = {};

//when a user connects to our sever 
wss.on('connection', function (connection) {

    //Create a new user item.
    connection.id = assignId();
    users[connection.id] = connection;
    console.log("User connected with id " + users[connection.id].id);

    //when server gets a message from a connected user 
    connection.on('message', function (message) {
        console.log("Recieved message from user: " + connection.id)
        var data;

        //accepting only JSON messages 
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.log("Invalid JSON");
            data = {};
        }

        //switching type of the user message 
        switch (data.type) {
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
                    rooms[connection.id] = new Room(connection.id, data.name, data.adminName);
                    console.log("New room created with id: " + rooms[connection.id].adminId + " and name: " + rooms[connection.id].name);
                }
                break;
            //when a user requests a list of available rooms
            case "request-rooms":
                //returns all available rooms
                sendTo(connection, rooms)
                break;
            default:
                sendTo(connection, {
                    type: "error",
                    message: "Command not found: " + data.type
                });

                break;
        }

    });

    //if close command is requeisted, close the connection.
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
        if (users[connection.id]) {
            delete users[connection.id];
            console.log("User has been removed: " + connection.id)
        }
        if (rooms[connection.id]) {
            console.log("Room deleted with id: " + rooms[connection.id].adminId + " and name: " + rooms[connection.id].name);
            delete rooms[connection.id];
        }
    }
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