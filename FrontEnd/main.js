import Myapp from "./helper/appInstance.js";
import Start from "./components/start.js";

Myapp.addRoute('/', Start);
Myapp.render(() => Myapp.handleRoute());