import { E } from "../frameWork/DOM.js";
import Myapp from "../helper/appInstance.js";
import { getSocket } from "../ws/wsHandler.js";
let isOn = false
export default function Chat() {
    const socket = getSocket();
    const name = Myapp.getGlobalState("name");

    const [chatMessages, setChatMessages] = Myapp.useState([]);
    const [hidden, setHidden] = Myapp.useState(false);
    if (!isOn) {
        socket.on("MessageHistory", (data) => {
            setChatMessages(data.Messages)
        })
        socket.on("chatMessage", (data) => {
            setChatMessages((prev) => [...prev, data]);
        });
    }
    function sendMessage(value) {
        if (!value.trim()) return;
        socket.emit("chatMessage", { from: name, text: value.trim() });
    }

    return E('div', { class: "chatContainer" }).childs(
        E('div', {
            class: "openClose",
            $click: () => {
                setHidden(!hidden())
            }
        }).childs(hidden() ? "open Chat" : "close chat"),
        E('div', {
            class: `chat spB df fc ${hidden() ? 'hidden' : ''}`,
        }).childs(
            E('div', { class: 'chat-messages strech gp16' }).childs(
                ...(chatMessages() || []).map(msg =>
                    E('div', {
                        class: `chat-msg ${msg.from === name ? 'me' : ''}`
                    }).childs(`${msg.from}:`, E("strong").childs(`${msg.text}`))
                )
            ),
            E('div', { class: 'chat-input df gp8' }).childs(
                E('input', {
                    attrs: { placeholder: 'Type a message...' },
                    $keydown: (e) => {
                        if (e.key === 'Enter') {
                            sendMessage(e.target.value);
                            e.target.value = '';
                        }
                    }
                }),
                E('button', {
                    $click: (e) => {
                        const input = e.target.previousSibling;
                        if (input.value.trim()) {
                            sendMessage(input.value.trim());
                            input.value = '';
                        }
                    }

                }).childs("send")
            )
        )
    )

}
