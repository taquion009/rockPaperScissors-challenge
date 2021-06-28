const $score = document.getElementById("scode");
const $rules = document.getElementById("rules");
const $modal = document.getElementById("contrainer-modal");
const $close = document.getElementById("close");
const $home = document.getElementById("home");
const $battle = document.getElementById("battle");
const $multiplayerButton = document.querySelector("#button-multiplayer")
let score = 0

//modal
$rules.addEventListener("click", () => $modal.classList.toggle("oculto"));
$close.addEventListener("click", () => $modal.classList.toggle("oculto"));
$modal.addEventListener(
  "click",
  (e) => {
    e.stopPropagation();
    $modal === e.target ? $modal.classList.toggle("oculto") : null;
  },
  false
);


//logic player vs bot
//get result
const result = (text) => {
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
    $home.classList.remove("oculto");
    $battle.classList.add("oculto");
    $multiplayerButton.classList.remove("oculto");
  });
  return $result
};

//get rival
const rival = (selectRival, $rival, win) => {
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
  return $rival
};
//get player
const player = (movement, $player) => {
  $player.classList.remove("movementWait");
  $player.classList.add("movement");
  $player.classList.add(movement);
  $player.innerHTML += `
  <div class="container-img">
    <img src="./assets/img/icon-${movement}.svg" />
    </div>
  <h4>YOU PICKED</h4>
`;
  return $player
};

//control movement
const handleMovement = (movement) => {
  const move = ["rock","paper","scissors"]
  const selectRival = move[Math.ceil(Math.random() * 3 - 1)]
  const $div = document.createElement("div");
  const $rival = document.createElement("div");
  $rival.classList.add("movementWait");
  const $player = document.createElement("div");
  $player.classList.add("movement");
  $player.classList.add(movement);
  
  let win = ""
  let text = ""

  $battle.innerHTML = "";
  if(
    (movement === "rock" && selectRival === "scissors") ||
    (movement === "scissors" && selectRival === "paper") ||
    (movement === "paper" && selectRival === "rock")
  ){
    text = "YOU WIN"
    win = "win"
    score++
  }else if(movement === selectRival){
    text = "TIE"
    win = "tie"
  }else{
    text = "YOU LOSE"
    win = "lose"
    score--
  };

  $div.classList.add("contrainer-movement-select");
  $div.appendChild(player(movement, $player))
  $div.appendChild($rival)
  

  setTimeout(()=>{
    $div.appendChild(result(text));
    rival(selectRival, $rival, win)
    if(win === "win"){
      $player.classList.add("win")
      $player.querySelector(".container-img").addEventListener("animationend", (e)=>{
        e.target.style.boxShadow = "0px 0px 0px 2em rgb(204 204 204 / 15%), 0px 0px 0px 3em rgb(204 204 204 / 10%), 0px 0px 0px 4em rgb(204 204 204 / 5%)"

      }, false);
    }
    if(win === "lose"){
      $rival.classList.add("win")
      $rival.querySelector(".container-img").addEventListener("animationend", (e)=>{
        e.target.style.boxShadow = "0px 0px 0px 2em rgb(204 204 204 / 15%), 0px 0px 0px 3em rgb(204 204 204 / 10%), 0px 0px 0px 4em rgb(204 204 204 / 5%)"
        $rival.classList.remove("win")
      }, false);
    }
    $score.innerHTML = score
  },1000)

  $battle.appendChild($div);
  $home.classList.add("oculto");
  $battle.classList.remove("oculto");
  $multiplayerButton.classList.add("oculto");
};

//event movement
$home
  .querySelectorAll(".movement")
  .forEach((el) =>
    el.addEventListener("click", () => handleMovement(el.dataset.movement))
);

//rest multiplayer
$multiplayerButton.addEventListener("click", (e) => score = 0);

