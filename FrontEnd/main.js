import Myapp from "./helper/appInstance.js";
import Start from "./components/start.js";
import Lobby from "./components/lobby.js";

Myapp.addRoute('/', Start);
Myapp.addRoute('/gameplay', GamePlay);
Myapp.addRoute('/lobby', Lobby);
Myapp.render(() => Myapp.handleRoute());