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
    onOpenCallback;
  };

  ws.onerror = function(error) {
    console.log('WebSocket Error: ' + error);
  };

  ws.onmessage = function(message){
    // Received data
    var data = JSON.parse(message.data);
    // If request description
    if  (data.requestDescription != null){
      onReceiveRequestDescription(data.requestDescription);
    } 
    // If answer description
    else if (data.answerDescription != null){
      onReceiveAnswerDescription(data.answerDescription);
    }
    // If candidate
    else if (data.candidate != null){
      onReceiveCandidate(data.candidate);
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
    console.log(SETTINGS);
    // Label data
    data.room_id = SETTINGS.room_id;
    data.from_client_id = SETTINGS.client_id;
    data.to_client_id = to;
    // Send message to server
    ws.send(JSON.stringify(data));
    console.log("Info: sendMessage, Message send");
  }

  return ws;
}

