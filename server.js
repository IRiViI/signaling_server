'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

 const server = express()
	.use(express.static(__dirname + '/js'))
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

 /*

 const server = express();
	server.use(express.static(__dirname + '/js'));
  	server.use((req, res) => res.sendFile(INDEX) );
  	server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const server = express()
  	.use((req, res) => res.sendFile(INDEX) )
  	.listen(PORT, () => console.log(`Listening on ${ PORT }`));

  	*/


var room_list = [];

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', function(){
    onClose(ws);
  });

  ws.on('message',function(message){
    onMessage(ws,message);
  });
});

function onMessage(ws,message){
  // Get data
  var data = JSON.parse(message);
  // If settings received
  if (data.settings != null){
    onReceiveSettings(ws,data.settings);
  } 
  // If something else is received
  else{
    // Check if the messenger is the person who he/she/it tells he/she it is.
    var isCorrectFromClient = checkFromClient(ws,data.room_id,data.from_client_id);
    // Check if the receiver is correct
    var isCorrectToClient = checkToClient(data.room_id,data.to_client_id);
    // Check if the conent of the message is correct
    var isCorrectData = checkData(data);
    // If the message met the criteria
    if (isCorrectFromClient && 
      isCorrectToClient &&
      isCorrectData){
      sendMessageToClient(message,data.room_id,data.to_client_id);
    } else {
      console.log("WARNING: onMessage, Someone send an incorrect request");
    }
  }
}

function checkData(data){
  if (data.requestDescription != null ||
    data.answerDescription != null ||
    data.candidate != null){
    return true;
  } else {
    console.log(data);
    console.log("WARNING: checkData, content of message is invalid");
    return false;
  }
}

function sendMessageToClient(message,room_id,to_client_id){
  var room = getRoomByID(room_id);
  var to_client = getClientByID(room,to_client_id);
  to_client.ws.send(message);
}

function checkFromClient(ws,room_id,client_from_id){
  // Get room
  var room = getRoomByID(room_id);
  if (room!=null){
    // Get client
    var client = getClientByID(room,client_from_id);
    if (client!=null){
      if (client.ws==ws){
        // If the client matches the description
        return true;
      } else {
        // If information incorrect
        console.log("WARNING: checkRequest, Someone is not the person he says he is");
      }
    } else {
      // If client not found
      console.log("WARNING: checkRequest, Someone says he is a non existing person");
    }
  } else {
    console.log("WARNING: checkRequest, room does not exist")
  }
  return false;
}

function checkToClient(room_id,client_to_id){
  // Get room
  var room = getRoomByID(room_id);
  if (room != null){
    // Get client
    var client = getClientByID(room,client_to_id);
    if (client != null){
      return true;
    }
  } else {
    console.log("WARNING: checkToClient, The person someone is looking for does not exist");
    return false;
  }
}

function getRoomByID(room_id){
  console.log(room_id);
  var t_room = room_list.length;
  for (var i_room = 0; i_room < t_room; i_room++){
    var room = room_list[i_room];
    if (room.room_id == room_id){
      return room;
    }
  }
  return null;
}

function getClientByID(room,client_id){
  var t_client = room.client_list.length;
  for (var i_client = 0; i_client < t_client; i_client++){
    var client = room.client_list[i_client];
    if (client.client_id == client_id){
      return client;
    }
  }
  return null;
}

function onReceiveSettings(ws,settings){
  var room_id = parseInt(settings.room_id);
  var client_id = parseInt(settings.client_id);
  var i_room = findRoom(room_id);
  if (i_room == null){
    createRoom(room_id);
    i_room = room_list.length-1;
  }
  addClientToRoom(ws,i_room,client_id);
}

function findRoom(room_id){
  var t_room = room_list.length;
  for (var i_room = 0; i_room < t_room; i_room++){
    var room = room_list[i_room];
    if (room.room_id = room_id){
      return i_room;
    }
  }
  return null;
}

function createRoom(room_id){
  var room = {room_id:room_id,client_list:[]};
  room_list.push(room);
}

function addClientToRoom(ws,i_room,client_id){
  var client = {ws:ws,client_id:client_id};
  room_list[i_room].client_list.push(client);
}

function onClose(ws){
  // Find client
  var client_info = findClientWS(ws);
  if (client_info.room!=null){
    // Remove client
    room_list[client_info.room].client_list.splice(client_info.client,1);
    console.log("INFO: onClose, client removed");
  } else{
    console.log("WARNING: onClose, client not found");
  }
}

function findClientWS(ws){
  // Total number of rooms
  var t_room = room_list.length;
  // For every room
  for (var i_room = 0; i_room < t_room; i_room++){
    // get room
    var room = room_list[i_room];
    // Total number of clients
    var t_client = room.client_list.length;
    // for every client
    for (var i_client = 0; i_client < t_client; i_client++){
      // Check if the ws match
      var client = room.client_list[i_client];
      if (client.ws == ws){
        return {room:i_room,
          client:i_client,
          room_id:room.room_id,
          client_id:client.client_id
        };
      }
    }
  }
  return {room:null,client:null};
}

/*
setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);


function onRequestDescription(requestDescription){
  console.log(requestDescription);
}

function onReceiveAnswerDescription(answerDescription){
  console.log(answerDescription);
}

function onReceiveCandidate(candidate){
  console.log(candidate);
}


if (data.requestDescription != null){
onRequestDescription(data.requestDescription);
} 

else if (data.answerDescription != null){
onReceiveAnswerDescription(data.answerDescription);
} 

else if (data.candidate != null){
onReceiveCandidate(data.candidate);
} 

*/

