import { E } from '../frameWork/DOM.js';
import { connectWebSocket } from '../ws/wsHandler.js';
import Myapp from '../helper/appInstance.js';

export default function Start() {
   
    const [Nickname, SetNickname] = Myapp.useState('');
    const [Error, SetError] = Myapp.useState('');

    function handleNickname() {
        const nick = Nickname().trim();
        if (!nick) {
            SetError("Please enter a nickname.");
            return;
        }
        SetError('');
        connectWebSocket(nick);
        Myapp.navigate('/chat');
    }

    return E('div', { class: 'modal-backdrop' }).childs(
        E('div', { class: 'modal' }).childs(
            E('h3', {}, 'Enter your nickname'),
            E('input', {
                class: 'nickname-input',
                placeholder: 'Your nickname...',
                value: Nickname(),
                $input: (e) => SetNickname(e.target.value),
                $keydown: (e) => {
                    if (e.key === "Enter") {
                        handleNickname();
                    }
                }
            }),
            Error() ? E('p', { class: 'error-message' }, Error()) : null,
            E('button', {
                class: 'confirm-nickname',
                $click: () => {handleNickname()},
            }).childs('Confirm')
        )
    );
}