var start_button = document.getElementById('startButton');
var call_button = document.getElementById('callButton');
var hangup_button = document.getElementById('hangupButton');

start_button.onclick = start;
call_button.onclick = call;
hangup_button.onclick = hangup;

var from_client_id_text = document.getElementById('from_client_id');
var to_client_id_text = document.getElementById('to_client_id');
var room_id_text = document.getElementById('room_id');

var ws;

function start(){
  startSignalingServer();
}

function call(){
  sendWebRTCRequest();
  //ws.sendMessage({requestDescription:"hello"},to_client_id_text.value);
}

function hangup(){
	
}

// Signaling server

startSignalingServer = function(){
  ws = createWS(room_id_text.value,from_client_id_text.value,
  onReceiveRequestDescription,
  onReceiveAnswerDescription,
  onReceiveCandidate,
  onOpenWs);
}

onReceiveRequestDescription = function (requestDescription){
  console.log("rDesc");
  processRequestDescription(requestDescription);
}

onReceiveAnswerDescription = function (answerDescription){
  console.log("aDesc");
  processAnswerDescription(answerDescription);
}

onReceiveCandidate = function (candidate){
  console.log("can");
  processReceiveCandidate(candidate);
}

onOpenWs = function(){
  console.log("ws");
  startWebRTC();
}

// WebRTC 

var pc;
var localStream;
var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');

var servers = { 
  "iceServers": [
    {url:'stun:stun.l.google.com:19302'},
    {url: 'turn:numb.viagenie.ca', username:"rckvink@gmail.com", credential:"[80S37b98^+7N<e"}
  ] 
};

var configuration = {
    audio: false,
    video: true
  };

var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

startWebRTC = function(){
  window.pc = pc = new window.RTCPeerConnection(servers);
  pc.onicecandidate = function(event){
    if (event.candidate != null){
      ws.sendMessage({candidate:event.candidate},to_client_id_text.value);
    };
  }
  pc.oniceconnectionstatechange = function(event) {
    console.log(event);
    if (pc.iceconnectionstate === "failed" ||
        pc.iceconnectionstate === "disconnected" ||
        pc.iceconnectionstate === "closed") {
      console.log(event);
    };
  }

  function getUserMediaSuccess(stream){
    localVideo.srcObject = stream;
    window.localStream = localStream = stream;
    pc.addStream(localStream);

    function gotRemoteStream(event){
      window.remoteStream = remoteVideo.srcObject = event.stream;
      console.log("Got remote stream");
    }
    pc.onaddstream = gotRemoteStream;
  }
  window.navigator.getUserMedia(configuration,getUserMediaSuccess,function(error){console.log("error")});
}

sendWebRTCRequest = function(){
  function offerSuccesful(desc){
    ws.sendMessage({requestDescription:desc},to_client_id_text.value);
    pc.setLocalDescription(desc);
  }
  console.log(pc);
  pc.createOffer(offerOptions).then(offerSuccesful);
}

processRequestDescription = function(requestDescription){
  pc.setRemoteDescription(requestDescription);
  function anwerSuccesful(answerDescription){
    ws.sendMessage({answerDescription:answerDescription},to_client_id_text.value);
    pc.setLocalDescription(answerDescription);
  }
  function answerFailure(error){
    console.log(error);
  }
  pc.createAnswer(anwerSuccesful,answerFailure)
  console.log(requestDescription);
}

processAnswerDescription = function(answerDescription){
  pc.setRemoteDescription(answerDescription);
  console.log(answerDescription);
}


processReceiveCandidate = function(candidate){
  pc.addIceCandidate(new RTCIceCandidate(candidate));
  console.log(candidate);
}


/*


    // Process request
    if (request.description != null){ // if description is included
      pc.setRemoteDescription(request.description);
      function anwerSuccesful(desc){
        ws.send(JSON.tsringify({answerDescription: desc, to: toID}));
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

  */