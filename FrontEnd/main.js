import Myapp from "./helper/appInstance.js";
import Start from "./components/start.js";
import Lobby from "./components/lobby.js";
import Game from "./components/game.js";

Myapp.addRoute('/', Start);
Myapp.addRoute('/lobby', Lobby);
Myapp.addRoute('/game', Game);
Myapp.render(() => Myapp.handleRoute());