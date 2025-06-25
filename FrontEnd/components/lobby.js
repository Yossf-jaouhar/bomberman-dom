import { E } from "../frameWork/DOM.js";
import Myapp from "../helper/appInstance.js";
export default function Lobby() {
    let name = Myapp.getGlobalState('name');
    if (!name) {
        Myapp.navigate('/');
        return
    }
    let [nOfPlayers, setNoOfPlayers] = Myapp.useState(1);
    let [counter, setCounter] = Myapp.useState(5);
    return E('div', { class: 'lobby' }).childs(
        E('h1', {}).childs(`${nOfPlayers()}/4`),
        E('p',  {}).childs(`players`),
        E('h2', {}).childs(`Waiting cancels after : ${counter()}s ...`),
        E('h3', {}).childs(`game starts after : 3s ...`),
    );
}