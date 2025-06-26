import { E } from "../frameWork/DOM.js";
import { connectWebSocket } from "../ws/wsHandler.js";
import Myapp from "../helper/appInstance.js";

export default function Start() {
  // Get the global states
  const name = Myapp.getGlobalState("name") || "";
  const error = Myapp.getGlobalState("error") || "";

  function handleNickname() {
    const nick = Myapp.getGlobalState("name");
    if (!nick) {
      Myapp.setGlobalState("error", "Please enter a nickname.");
      return;
    }
    connectWebSocket(nick);
    Myapp.navigate("/lobby");
  }

  return E("div", { class: "modal-backdrop" }).childs(
    E("div", { class: "modal" }).childs(
      E("h3", {}, "Enter your nickname"),
      E("input", {
        class: "nickname-input",
        placeholder: "Your nickname...",
        value: name,
        $input: (e) => Myapp.setGlobalState("name", e.target.value),
        $keydown: (e) => {
          if (e.key === "Enter") {
            handleNickname();
          }
        },
      }),
      error ? E("p", { class: "error-message" },).childs(error) : null,
      E("button", {
        class: "confirm-nickname",
        $click: () => {
          handleNickname();
        },
      }).childs("Confirm")
    )
  );
}