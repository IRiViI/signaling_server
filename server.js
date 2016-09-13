'use strict';

// Create server
const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

// List with all the clients of the server
var connections = [];
var rooms = [];

// What to do if someone connects with server
wss.on('connection', function connection(ws) {

    // New logging
    console.log("Someone just logged in.");

    ws.on('message', function incoming(message) {

        // New message
        var request = JSON.parse(message);
        console.log('received: %s', message);

        // Join room
        if(request.room != null && request.id != null && request.host != null){
            var member = getClient(ws);
            if (member == null) {
                console.log("New member");
            } else {
                connections.splice(member,1); // Remove connection
                console.log("Existing member");
            }
            connections.push({ws: ws, id: request.id, room: request.room, user: request.host});
        }
        // Send data to member
        else if(request.candidate != null || request.description != null || request.answerDescription != null){
            var idTo = findID(request.to);
            if (idTo != null) {
                connections[idTo].ws.send(message);
            } else {
                console.log("Error: id does not exist");
            }
        }
        // Ask used rooms
        else if(request.roomState != null){
            updateRoomStates();
            console.log(rooms);
        }
        // Send message
        else if(request.message != null){
            var idTo = findID(request.to);
            if (idTo != null) {
                connections[idTo].ws.send(message);
                console.log(request.message);
            } else {
                console.log("Error: id does not exist");
            }
        }

    });

    // What to do if someone leaves the socket /o\
    ws.on('close',function(){
        for(var i = 0; i < connections.length; i++) {
            if (connections[i].ws==ws){
                connections.splice(i,1); // Remove connection
                console.log("Some one left");
            }
        }
    });

    // Inform the users
    for(var i = 0; i < connections.length; i++) {
        connections[i].ws.send(JSON.stringify({message: "Someone joined the club ^^"}));
    }
});

// Find matching id
function findID(to){
    for(var i = 0; i < connections.length; i++) {
        if (connections[i].id==to){
            console.log("Found one!");
            return i;
        }
    }
    return null;
}

// Find client
function getClient(ws){
    for(var i = 0; i < connections.length; i++) {
        if (connections[i].ws==ws){
            return i;
        }
    }
    return null;
}

// Update the rooms
function updateRoomStates(){
    var tmp = [];
    for(var i = 0; i < connections.length; i++) {
        var added = false;
        for(var j = 0; j < tmp.length; j++) {
            if (connections[i].room == tmp[j].room){
                tmp[j].count++;
                added = true;
            }
        }
        if (!added){
            tmp.push({room:connections[i].room, count: 1});
        }
    }
    rooms = tmp;
    return null;
}