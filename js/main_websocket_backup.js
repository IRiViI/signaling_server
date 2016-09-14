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
  // Create websocket
	ws = createWS(room_id_text.value,from_client_id_text.value,
  onReceiveRequestDescription,
  onReceiveAnswerDescription,
  onReceiveCandidate,
  onWsConnect);
}

function call(){
  ws.sendMessage({requestDescription:"hello"},to_client_id_text.value);
}

function hangup(){
	

}
onReceiveRequestDescription = function (requestDescription){
  console.log("rDesc");
}

onReceiveAnswerDescription = function (answerDescription){
  console.log("aDesc");
}

onReceiveCandidate = function (candidate){
  console.log("can");
}

onWsConnect = function() {

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