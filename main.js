import { E } from "./frameWork/DOM.js";
import { App } from "./frameWork/RoutingClient.js";

let myapp = new App("game");

const [getNicknames, setNicknames] = myapp.useState([]);

const [getNicknameInput, setNicknameInput] = myapp.useState("");

const [getModalOpen, setModalOpen] = myapp.useState(false);


const socket = new WebSocket('ws://localhost:3000');



function handleRandomRoom() {
    console.log('Joining random room...');
    setModalOpen(true);
}

function handleNicknameConfirm() {
    const nickname = getNicknameInput().trim();
    if (nickname !== "") {
        const newNickname = {
            name: nickname,
            id: Date.now()
        };
        setNicknames([...getNicknames(), newNickname]);
        setNicknameInput(""); // clear input
        setModalOpen(false);  // close modal
        console.log("All nicknames:", getNicknames());
    }
}

function NicknameModal() {
    return E('div', { class: 'modal-backdrop' }).childs(
        E('div', { class: 'modal' }).childs(
            E('h3', {}, 'Enter your nickname'),
            E('input', {
                class: 'nickname-input',
                placeholder: 'Your nickname...',
                value: getNicknameInput(),
                $input: (e) => setNicknameInput(e.target.value),
                $keydown: (e) => {
                    if (e.key === "Enter") handleNicknameConfirm();
                }
            }),
            E('button', {
                class: 'confirm-nickname',
                $click: handleNicknameConfirm
            }).childs('Confirm')
        )
    );
}

function home() {
    return E('div', { class: 'rooms-container' }).childs(
        E('h2', { class: 'game-name' }).childs('BOMBER FUCKING MAN'),
        E('button', {
            class: 'join-random-room',
            $click: handleRandomRoom
        }).childs('Join Random Room'),

        // Show modal if open
        getModalOpen() && NicknameModal(),

        // Show list of nicknames (optional)
        ...getNicknames().map(n =>
            E('div', { class: 'nickname-item' }, n.name)
        )
    );
}

socket.addEventListener('open', () => {
    console.log('Connected to server');

    // Example: send movement
    socket.send(JSON.stringify({ type: 'move', direction: 'up' }));

    // Example: send chat
    socket.send(JSON.stringify({ type: 'chat', message: 'Hi!' }));
});

socket.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    console.log('Received:', msg);

    // Now you can update the game state based on msg.type, etc.
});


myapp.addRoute('/', home);

myapp.render(() => myapp.handleRoute());
