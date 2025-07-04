import { E } from "../frameWork/DOM.js";
import { connectWebSocket, getSocket } from "../ws/wsHandler.js";
import Myapp from "../helper/appInstance.js";

export default function Start() {
  // If user already has a name, redirect immediately
  let sock = getSocket()
  if (sock && sock.connected) {
    Myapp.navigate("/lobby")
  }
  // if (Myapp.getGlobalState("name")) {
  //   Myapp.root.innerHTML = ""
  //   Myapp.navigate("/lobby");
  //   return
  // }

  // Local state for input value, initialized from global state or empty
  let inputValue = Myapp.getGlobalState("name") || "";
  const error = Myapp.getGlobalState("error") || "";

  function handleNickname() {
    const nick = inputValue.trim();
    if (!nick) {
      Myapp.setGlobalState("error", "Please enter a nickname.");
      return;
    }
    connectWebSocket(nick);
    Myapp.setGlobalState("name", nick);
    Myapp.navigate("/lobby");
  }

  return E("div", { class: "modal-backdrop" }).childs(
    E("div", { class: "modal" }).childs(
      E("h3", {}, "Enter your nickname"),
      E("input", {
        class: "nickname-input",
        placeholder: "Your nickname...",
        value: inputValue,
        $input: (e) => {
          inputValue = e.target.value;  // Update local input value only
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

