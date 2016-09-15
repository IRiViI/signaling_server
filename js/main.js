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
      if (!event || !event.candidate) {
        console.log("incorrected candidate")
        return;
      }
      ws.sendMessage({candidate:event.candidate},to_client_id_text.value);
      console.log("onicecandidate");
    };
  }
  pc.oniceconnectionstatechange = function(event) {
    // console.dir(event);
    if (pc.iceconnectionstate === "failed" ||
        pc.iceconnectionstate === "disconnected" ||
        pc.iceconnectionstate === "closed") {
      //console.log(event);
    };
    console.log("oniceconnectionstatechange");
  }

  function getUserMediaSuccess(stream){
    localVideo.srcObject = stream;
    window.localStream = localStream = stream;
    pc.addStream(localStream);
    function gotRemoteStream(event){
      window.remoteStream = remoteVideo.srcObject = event.stream;
      console.log("gotRemoteStream");
    }
    pc.onaddstream = gotRemoteStream;
  }
  function getUserMediaFailure(error){
    console.log("getUserMediaFail:");
    console.log(error);
  }
  window.navigator.getUserMedia(
    configuration,
    getUserMediaSuccess,
    getUserMediaFailure);
}

sendWebRTCRequest = function(){
  function offerSuccesful(desc){
    ws.sendMessage({requestDescription:desc},to_client_id_text.value);
    var desc2 = JSON.parse(JSON.stringify(desc));
    var desc3 = new RTCSessionDescription();
    desc3.type = desc2.type;
    desc3.sdp  = desc2.sdp;
    console.log(desc3);
    pc.setLocalDescription(desc3,
        setLocalSuccesful,
        setLocalFailure);
    console.log("offerSuccesful");
  }
  function offerFailure(error){
    console.log("offerFailure:");
    console.log(error);
  }
  pc.createOffer(
    offerSuccesful,
    offerFailure,
    offerOptions);
  console.log("sendWebRTCRequest");
}

processRequestDescription = function(requestDescription){
  function onSetRemoteSuccesful(event){
    continueRequest();
  }
  console.log(requestDescription);
  pc.setRemoteDescription(
    requestDescription,
    onSetRemoteSuccesful,
    onSetRemoteFailure);

  continueRequest = function (){
    function anwerSuccesful(answerDescription){
      console.log("anwerSuccesful");
      ws.sendMessage({answerDescription:answerDescription},to_client_id_text.value);
      pc.setLocalDescription(
        answerDescription,
        setLocalSuccesful,
        setLocalFailure);
    }
    function answerFailure(error){
      console.log("answerFailure");
      console.log(error);
    }
    pc.createAnswer(anwerSuccesful,answerFailure)
    console.log(requestDescription);
  }
}

processAnswerDescription = function(answerDescription){
  function onSetRemoteSuccesful(event){
    console.log("onSetRemoteSuccesful");
    console.log(event);
  }
  pc.setRemoteDescription(
    answerDescription,
    onSetRemoteSuccesful,
    onSetRemoteFailure);
  console.log(answerDescription);
}


processReceiveCandidate = function(candidate){
  function onIceSuccesful(event){
    console.log("onIceSuccesful");
    console.log(event);
  }
  function onIceFailure(error){
    console.log("onIceFailure");
    console.log(error);
  }
  pc.addIceCandidate(
    new RTCIceCandidate(candidate),
    onIceSuccesful,
    onIceFailure);
  console.log("addIceCandidate");
  console.log(candidate);
}


function setLocalSuccesful(event){
  console.log("setLocalSuccesful:");
  console.log(event);
}
function setLocalFailure(error){
  console.log("setLocalFailure:");
  consoel.log(error);
}
function onSetRemoteFailure(error){
  console.log("onSetRemoteFailure");
  console.log(error);
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