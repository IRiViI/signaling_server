'use strict';

var startButton = document.getElementById('startButton');
var callButton = document.getElementById('callButton');
var hangupButton = document.getElementById('hangupButton');
startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

var hostText = document.getElementById('host');
var yourIDText = document.getElementById('yourID');
var theirIDText = document.getElementById('theirID');
var roomNumberText = document.getElementById('roomNumber');

var startTime;
var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');

var hostAdress = "ws://localhost:8080";
var hostAdress = "ws://81.204.186.36:8080";

var localStream;
var pc;
var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};
var servers = { "iceServers": [
    {url:'stun:stun.l.google.com:19302'},
    {url: 'turn:numb.viagenie.ca', username:"rckvink@gmail.com", credential:"[80S37b98^+7N<e"}
  ] };

var ws;

var toID = 1;
var fromID = 2;
var roomNumber = 1;

localVideo.addEventListener('loadedmetadata', function() {});
remoteVideo.addEventListener('loadedmetadata', function() {});

function createWS(hostAdress,id){
  var ws = new WebSocket(hostAdress);
  ws.onopen = function(){
    var message = {room: roomNumber, id: id, host: false};
    ws.send(JSON.stringify(message));
  }
  ws.onerror = function(error) {
    console.log('WebSocket Error: ' + error);
  };
  ws.onmessage = function(message){
    var request = JSON.parse(message.data);
    // Process request
    if (request.description != null){ // if description is included
      pc.setRemoteDescription(request.description);
      function anwerSuccesful(desc){
        ws.send(JSON.stringify({answerDescription: desc, to: toID}));
        pc.setLocalDescription(desc);
      }
      pc.createAnswer().then(anwerSuccesful);
      console.log(request.description);
    } else if (request.candidate != null){ // if candidate is included
      console.log(request.candidate);
      pc.addIceCandidate(new RTCIceCandidate(request.candidate))
    } else if (request.answerDescription != null){
      pc.setRemoteDescription(request.answerDescription);
    } else if (request.message != null){ // if message is included
      console.log(request.message);
    }
  };
  return ws;
}

function start() {

  refreshSettings();
  console.log(fromID + " " + toID + " " + hostAdress);

  ws = createWS(hostAdress,fromID);

  window.pc = pc = new RTCPeerConnection(servers);
  pc.onicecandidate = function(e){
    if (e.candidate != null){
      ws.send(JSON.stringify({candidate: e.candidate, to: toID}));
    };
    console.log("On ice candidate response pc1"); 
  }

  function getUserMediaSuccess(stream){
    localVideo.srcObject = stream;
    window.localStream = localStream = stream;
    pc.addStream(localStream);

    function gotRemoteStream(e){
      window.remoteStream = remoteVideo.srcObject = e.stream;
      console.log("Got remote stream");
    }
    pc.onaddstream = gotRemoteStream;
  }
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true
  }).then(getUserMediaSuccess);
}

function refreshSettings(){
  hostAdress = "ws://" + hostText.value;
  toID = theirIDText.value;
  fromID = yourIDText.value;
  roomNumber = roomNumberText.value;
}

function call() {
  function offerSuccesful(desc){
    ws.send(JSON.stringify({description: desc,to: toID}));
    pc.setLocalDescription(desc);
  }
  pc.createOffer(offerOptions).then(offerSuccesful);
}
function hangup() {
  var message = {roomState: true};
  ws.send(JSON.stringify(message));
  console.log("hangup");
}



