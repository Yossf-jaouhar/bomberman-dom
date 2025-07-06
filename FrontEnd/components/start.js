import { E } from "../frameWork/DOM.js";
import { connectWebSocket, isSocketConnected } from "../ws/wsHandler.js";
import Myapp from "../helper/appInstance.js";
import { getSocket } from "../ws/wsHandler.js";

export default function Start() {
  if (isSocketConnected()) {
    console.log("connected already !  redirecting ...");
    Myapp.navigate("/lobby")
  }
  let inputValue = Myapp.getGlobalState("name") || "";
  const error = Myapp.getGlobalState("error") || "";

  function handleNickname() {
    const nick = inputValue.trim();
    if (!nick) {
      Myapp.setGlobalState("error", "Please enter a nickname.");
      return;
    }

    connectWebSocket(nick).then((connected) => {
      if (connected) {
        Myapp.setGlobalState("name", nick);
        console.log("is connected:", isSocketConnected());
        Myapp.navigate("/lobby");
      } else {
        console.log("Failed to connect.");
        Myapp.setGlobalState("error", "Could not connect to server.");
      }
    });
  }


  return E("div", { class: "modal-backdrop" }).childs(
    E("div", { class: "modal" }).childs(
      E("h3", {}, "Enter your nickname"),
      E("input", {
        class: "nickname-input",
        placeholder: "Your nickname...",
        value: inputValue,
        $input: (e) => {
          inputValue = e.target.value;
        },
        $keydown: (e) => {
          if (e.key === "Enter") {
            handleNickname();
          }
        },
      }),
      error ? E("p", { class: "error-message" }).childs(error) : null,
      E("button", {
        class: "confirm-nickname",
        $click: () => {
          handleNickname();
        },
      }).childs("Confirm")
    )
  );
}

