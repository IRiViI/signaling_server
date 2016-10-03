function createWS(room_id,client_id,
  onReceiveRequestDescription,
  onReceiveAnswerDescription,
  onReceiveCandidate,
  onOpenCallback){

  var HOST = location.origin.replace(/^http/, 'ws')
  var ws = new WebSocket(HOST);
  var SETTINGS;

  SETTINGS = {
    room_id: room_id,
    client_id:client_id
  };

  ws.onopen = function(){
    var message = JSON.stringify({settings: SETTINGS});
    ws.send(message);
    onOpenCallback();
  };

  ws.onerror = function(error) {
    console.log('WebSocket Error: ' + error);
  };

  ws.onmessage = function(message){
    // Received data
    var data = JSON.parse(message.data);
    // If request description
    if  (data.requestDescription != null){
      var description = new RTCSessionDescription();
      description.type = data.requestDescription.type;
      description.sdp  = data.requestDescription.sdp;
      onReceiveRequestDescription(data.from_client_id,description);
    } 
    // If answer description
    else if (data.answerDescription != null){
      var description = new RTCSessionDescription();
      description.type = data.answerDescription.type;
      description.sdp  = data.answerDescription.sdp;
      onReceiveAnswerDescription(description);
    }
    // If candidate
    else if (data.candidate != null){
      var candidate = new RTCIceCandidate({
        sdpMLineIndex: data.candidate.sdpMLineIndex,
        candidate: data.candidate.candidate
      });
      onReceiveCandidate(candidate);
    }
    // Else
    else {
      console.log("Unprocessed Message");
    }
  }

  /**
  *   example data format: {requestDescription:description}
  *
  */
  ws.sendMessage = function(data,to){
    // Label data
    data.room_id = SETTINGS.room_id;
    data.from_client_id = SETTINGS.client_id;
    data.to_client_id = to;
    // Send message to server
    ws.send(JSON.stringify(data));
    console.log("Info: sendMessage, Message send");
    console.log(data);
  }

  return ws;
}

