let chatHash = "";
// RTCPeerConnection
let pc;
// RTCDataChannel
let dataChannel;
const configuration = {
  iceServers: [
    {
      url: "stun:stun.l.google.com:19302",
    },
  ],
};
// Scaledrone room used for signaling
let room;
// signaling Scaledrone
let drone;
// Scaledrone room name needs to be prefixed with 'observable-'
let roomName = "";
//Movement that the opponent selected.
let selectRival = "";
//Movement selected.
let movement = "";
//if the app is in multiplayer
let multiplayerState = false;

let intento = 0
let loader = null

//Element HTML
const $multiplayer = document.getElementById("multiplayer");
const $create = document.getElementById("create");
const $join = document.getElementById("join");
const $joinForm = document.getElementById("join-form");
const $contrainerJoin = document.getElementById("contrainer-join");
const $optionMultiplayer = document.getElementById("option-multiplayer");
const $back = document.getElementById("back");
const $backMultiplayer = document.getElementById("back-multiplayer");
const $closePlayer = document.getElementById("close-player");
const $homeMultiplayer = document.getElementById("home-multiplayer");
const $battleMltiplayer = document.getElementById("battle-multiplayer");
const $code = document.getElementById("code");
const $loader = document.getElementById("loader");
const $exit = document.getElementById("exit");
const $waitPlayer = document.getElementById("wait-player");
const $errorLoader = document.getElementById("error-loader");
const $contrainerModalMltiplayer = document.getElementById(
  "contrainer-modal-multiplayer"
);
const $player1 = document.getElementById("player-1");
const $name = document.querySelector("#name");
const $player2 = document.getElementById("player-2");

//reset hash
location.hash = "";

// seccion go back
$back.addEventListener("click", () => {
  $optionMultiplayer.classList.remove("oculto");
  $contrainerJoin.classList.add("oculto");
});

$loader.querySelector("button").addEventListener("click", () => {
  $loader.classList.add("oculto");
  clearInterval(loader)
  room.unsubscribe();
  drone.close();
});

$errorLoader.querySelector("button").addEventListener("click", () => {
  $loader.classList.add("oculto");
  $errorLoader.classList.add("oculto");
  clearInterval(loader)
  room.unsubscribe();
});

document.getElementById("close-multiplayer").addEventListener("click", () => {
  location.hash = "";
  $optionMultiplayer.classList.remove("oculto");
  $homeMultiplayer.classList.add("oculto");
  $multiplayer.style.padding = "2em";
  $multiplayer.style.margin = "2em auto auto auto";
  $contrainerModalMltiplayer.classList.add("oculto");
  $exit.classList.add("oculto");
});

const exit = () => {
  $optionMultiplayer.classList.remove("oculto");
  $homeMultiplayer.classList.add("oculto");
  $multiplayer.style.padding = "2em";
  $multiplayer.style.margin = "2em auto auto auto";
  $contrainerModalMltiplayer.classList.add("oculto");
  $battleMltiplayer.classList.add("oculto");
  $exit.classList.add("oculto");
  $closePlayer.classList.add("oculto");
  $waitPlayer.classList.add("oculto");
  $multiplayerButton.classList.remove("oculto");
  room.unsubscribe();
};
$exit.addEventListener("click", () => exit());
//Multiplayer
const multiplayer = (e) => {
  //reset
  score = 0;
  $code.innerHTML = "";
  $score.innerHTML = score;
  location.hash = "";

  //change from multiplayer to singleplayer or reverse
  if (multiplayerState) {
    $multiplayer.classList.add("oculto");
    $optionMultiplayer.classList.add("oculto");
    $homeMultiplayer.classList.add("oculto");
    $contrainerModalMltiplayer.classList.add("oculto");
    $exit.classList.add("oculto");
    $home.classList.remove("oculto");
    $waitPlayer.classList.add("oculto");
    $multiplayer.style.padding = "2em";
    $multiplayer.style.margin = "2em auto auto auto";
    if(room)room.unsubscribe();
    e.target.innerHTML = "MULTIPLAYER";
    multiplayerState = false;
  } else {
    $home.classList.add("oculto");
    $battle.classList.add("oculto");
    $optionMultiplayer.classList.remove("oculto");
    $multiplayer.classList.remove("oculto");
    e.target.innerHTML = "SINGLEPLAYER";
    multiplayerState = true;
  }
};
//if the name is true
const testName = () => {
  return !/^[a-z\d\s]{1,15}$/gi.test($name.value);
};
//Create room
$create.addEventListener("click", () => {
  if (testName()) return null;
  location.hash = Math.floor(Math.random() * 0xffffff).toString(16);
  $optionMultiplayer.classList.add("oculto");
  $homeMultiplayer.classList.remove("oculto");
  $contrainerModalMltiplayer.classList.remove("oculto");
  $multiplayer.style.padding = "0";
  $multiplayer.style.margin = "0 auto";
  $code.innerHTML = "code:" + location.hash.substring(1);
  $player1.innerHTML = $name.value;
  chatHash = location.hash.substring(1);
  startGame(false);
});

//join room
$join.addEventListener("click", () => {
  if (testName()) return null;
  $optionMultiplayer.classList.add("oculto");
  $contrainerJoin.classList.remove("oculto");
});
$joinForm.addEventListener("submit", async (e) => {
  location.hash = await e.target.codeRoom.value;
  chatHash = await location.hash.substring(1);
  $player1.innerHTML = $name.value;
  $loader.classList.remove("oculto");
  startGame(true);
});

//start game in multiplayer
const startGame = (join) => {
  if(join){
    loader = setTimeout(() => {
      if(intento > 5){
        clearInterval(loader)
        intento = 0
        $errorLoader.classList.remove("oculto");
        $loader.classList.add("oculto");
        return;
      }
      room.unsubscribe();
      console.log(intento + " intento")
      startGame(true);
      intento++
    }, 5000);
  }
  drone = new ScaleDrone("yiS12Ts5RdNhebyM");
  roomName = "observable-" + chatHash;

  // Wait for Scaledrone signaling server to connect
  drone.on("open", (error) => {
    if (error) {
      return console.error(error);
    }
    room = drone.subscribe(roomName);
    room.on("open", (error) => {
      if (error) {
        return console.error(error);
      }
    });
    // We're connected to the room and received an array of 'members'
    // connected to the room (including us). Signaling server is ready.
    room.on("members", (members) => {
      if (members.length >= 3) {
        return alert("The room is full");
      }
      // If we are the second user to connect to the room we will be creating the offer
      const isOfferer = members.length === 2;
      startWebRTC(isOfferer);
    });
  });
};

// Send signaling data via Scaledrone
function sendSignalingMessage(message) {
  drone.publish({
    room: roomName,
    message,
  });
}

function startWebRTC(isOfferer) {
  pc = new RTCPeerConnection(configuration);

  // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
  // message to the other peer through the signaling server
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignalingMessage({ candidate: event.candidate });
    }
  };

  if (isOfferer) {
    // If user is offerer let them create a negotiation offer and set up the data channel
    pc.onnegotiationneeded = () => {
      pc.createOffer(localDescCreated, (error) => console.error(error));
    };
    dataChannel = pc.createDataChannel("chat");
    setupDataChannel();
  } else {
    // If user is not the offerer let wait for a data channel
    pc.ondatachannel = (event) => {
      dataChannel = event.channel;
      setupDataChannel();
    };
  }
  startListentingToSignals();
}

// Hook up data channel event handlers
function setupDataChannel() {
  checkDataChannelState();
  dataChannel.onopen = checkDataChannelState;
  dataChannel.onclose = checkDataChannelState;
  dataChannel.onmessage = (event) =>
    insertMessageToDOM(JSON.parse(event.data), false);
  //if it exits the player
  room.on("member_leave", function (member) {
    $closePlayer.classList.remove("oculto");
    $waitPlayer.classList.add("oculto");
    $exit.classList.add("oculto");
    $backMultiplayer.addEventListener("click", () => {
      exit();
    });
  });
}

function checkDataChannelState() {
  if (dataChannel.readyState === "open") {
    clearInterval(loader)
    score = 0;
    $loader.classList.add("oculto");
    $exit.classList.remove("oculto");
    $multiplayerButton.classList.remove("oculto");
    $score.innerHTML = score;
    const data = {
      content: {
        name: document.querySelector("#name").value,
        momimiento: false,
      },
    };
    dataChannel.send(JSON.stringify(data));
  } else if (dataChannel.readyState === "closed") {
    $closePlayer.classList.remove("oculto");
    $waitPlayer.classList.add("oculto");
    $exit.classList.add("oculto");
    $backMultiplayer.addEventListener("click", () => {
      room.unsubscribe();
      $optionMultiplayer.classList.remove("oculto");
      $closePlayer.classList.add("oculto");
      $homeMultiplayer.classList.add("oculto");
      $battleMltiplayer.classList.add("oculto");
    });
  }
}

function startListentingToSignals() {
  // Listen to signaling data from Scaledrone
  room.on("data", (message, client) => {
    // Message was sent by us
    if (client.id === drone.clientId) {
      return;
    }
    if (message.sdp) {
      // This is called after receiving an offer or answer from another peer
      pc.setRemoteDescription(
        new RTCSessionDescription(message.sdp),
        () => {
          // When receiving an offer lets answer it
          if (pc.remoteDescription.type === "offer") {
            pc.createAnswer(localDescCreated, (error) => console.error(error));
          }
        },
        (error) => console.error(error)
      );
    } else if (message.candidate) {
      // Add the new ICE candidate to our connections remote description
      pc.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  });
}

function localDescCreated(desc) {
  pc.setLocalDescription(
    desc,
    () => sendSignalingMessage({ sdp: pc.localDescription }),
    (error) => console.error(error)
  );
}

function insertMessageToDOM(options, isFromMe) {
  if (isFromMe) return;
  if (options.content.name) {
    $optionMultiplayer.classList.add("oculto");
    $homeMultiplayer.classList.remove("oculto");
    $contrainerModalMltiplayer.classList.add("oculto");
    $optionMultiplayer.classList.add("oculto");
    $contrainerJoin.classList.add("oculto");
    $multiplayer.style.padding = "0";
    $multiplayer.style.margin = "0 auto";
    $player2.innerHTML = options.content.name;
  }
  if (options.content.momimiento) {
    selectRival = options.content.momimiento;
    $battle.innerHTML = "";
    if (selectRival && movement) {
      $waitPlayer.classList.add("oculto");
      handleBattle();
    }
  }
}

const $movement = document.querySelectorAll("#home-multiplayer .movement");
$movement.forEach((el) =>
  el.addEventListener("click", () =>
    handleMovementMultiplayer(el.dataset.movement)
  )
);
const handleMovementMultiplayer = (selectMovement) => {
  movement = selectMovement;
  const data = {
    content: {
      name: false,
      momimiento: movement,
    },
  };
  $waitPlayer.classList.remove("oculto");
  if (selectRival && movement) {
    $waitPlayer.classList.add("oculto");
    handleBattle();
  }
  dataChannel.send(JSON.stringify(data));
};

//get result
const resultMultiplayer = (text) => {
  const $result = document.createElement("div");
  $result.classList.add("result");
  $result.id = "result";
  const $h3 = document.createElement("h3");
  $h3.innerHTML = text;

  const $button = document.createElement("button");
  $button.innerHTML = "PLAY AGAIN";

  $result.appendChild($h3);
  $result.appendChild($button);
  //go back
  $result.querySelector("button").addEventListener("click", () => {
    $homeMultiplayer.classList.remove("oculto");
    $battleMltiplayer.classList.add("oculto");
    $multiplayerButton.classList.remove("oculto");
    $exit.classList.remove("oculto");
  });
  return $result;
};
//get rival
const rivalMultiplayer = ($rival) => {
  $rival.classList.remove("movementWait");
  $rival.classList.add("movement");
  $rival.classList.add(selectRival);
  $rival.innerHTML += `
  <div class="container-img">
  <img src="./assets/img/icon-${selectRival}.svg" />
  </div>
  <h4>THE HOUSE PICKED</h4>
  </div>
  `;
  return $rival;
};
//get player
const playerMultiplayer = ($player) => {
  $player.classList.remove("movementWait");
  $player.classList.add("movement");
  $player.classList.add(movement);
  $player.innerHTML += `
  <div class="container-img">
  <img src="./assets/img/icon-${movement}.svg" />
  </div>
  <h4>YOU PICKED</h4>
  `;
  return $player;
};

const $div = document.createElement("div");
const handleBattle = () => {
  $div.innerHTML = "";
  const $rival = document.createElement("div");
  $rival.classList.add("movementWait");
  const $player = document.createElement("div");
  $player.classList.add("movement");
  $player.classList.add(movement);
  $exit.classList.add("oculto");
  let win = "";
  let text = "";

  $battle.innerHTML = "";
  if (
    (movement === "rock" && selectRival === "scissors") ||
    (movement === "scissors" && selectRival === "paper") ||
    (movement === "paper" && selectRival === "rock")
  ) {
    text = "YOU WIN";
    win = "win";
    score++;
  } else if (movement === selectRival) {
    text = "TIE";
    win = "tie";
  } else {
    text = "YOU LOSE";
    win = "lose";
    score--;
  }

  $div.classList.add("contrainer-movement-select");
  $div.appendChild(playerMultiplayer($player));
  $div.appendChild($rival);

  setTimeout(() => {
    $div.appendChild(resultMultiplayer(text));
    rivalMultiplayer($rival, win);
    if (win === "win") {
      $player.classList.add("win");
      $player.querySelector(".container-img").addEventListener(
        "animationend",
        (e) => {
          e.target.style.boxShadow =
            "0px 0px 0px 2em rgb(204 204 204 / 15%), 0px 0px 0px 3em rgb(204 204 204 / 10%), 0px 0px 0px 4em rgb(204 204 204 / 5%)";
        },
        false
      );
    }
    if (win === "lose") {
      $rival.classList.add("win");
      $rival.querySelector(".container-img").addEventListener(
        "animationend",
        (e) => {
          e.target.style.boxShadow =
            "0px 0px 0px 2em rgb(204 204 204 / 15%), 0px 0px 0px 3em rgb(204 204 204 / 10%), 0px 0px 0px 4em rgb(204 204 204 / 5%)";
          $rival.classList.remove("win");
        },
        false
      );
    }

    $score.innerHTML = score;
    selectRival = "";
    movement = "";
  }, 1000);

  $battleMltiplayer.appendChild($div);
  $homeMultiplayer.classList.add("oculto");
  $battleMltiplayer.classList.remove("oculto");
  $multiplayerButton.classList.add("oculto");
};
//event multiplayer
$multiplayerButton.addEventListener("click", (e) => multiplayer(e));
