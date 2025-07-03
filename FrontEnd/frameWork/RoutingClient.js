import { MyNewPatch, renderV } from "./DOM.js";

export default class App {
  constructor(rootId) {
    this.routes = new Map();
    this.root = document.getElementById(rootId) || document.body;
    this.hookStates = [];
    this.hookIndex = 0;
    this.currentDOMFunc = null;
    this.currentComponent = null;
    this.GlobalState = {};

    window.addEventListener("popstate", () => this.handleRoute());
  }

  setGlobalState = (key, newVal) => {
    this.GlobalState[key] = newVal;
    this.rerender();
  };

  getGlobalState = (key) => this.GlobalState[key];

  addRoute(path, handler) {
    this.routes.set(path, handler);
  }

  navigate(path) {
    history.pushState({}, "", path);
    this.handleRoute();
  }

  useState(initialValue) {
    const currentIndex = this.hookIndex;

    if (this.hookStates[currentIndex] === undefined) {
      this.hookStates[currentIndex] = initialValue;
    }

    const setState = (newVal) => {
      if (typeof newVal === "function") {
        this.hookStates[currentIndex] = newVal(this.hookStates[currentIndex]);
      } else {
        this.hookStates[currentIndex] = newVal;
      }
      this.rerender();
    };

    const getState = () => this.hookStates[currentIndex];
    this.hookIndex++;
    return [getState, setState];
  }

  rerender() {
    this.hookIndex = 0;
    const newVNode = this.currentDOMFunc();

    MyNewPatch(this.root, this.currentComponent, newVNode);
    this.currentComponent = newVNode;
  }

  handleRoute() {
    const path = window.location.pathname || "/";
    const handler = this.routes.get(path);

    this.root.innerHTML = "";

    let newVNode;

    if (!handler) {
      newVNode = {
        tag: "h1",
        props: {},
        children: ["404 Not Found"]
      };
    } else {
      if (typeof handler === "function") {
        this.currentDOMFunc = handler;
        newVNode = handler();
      } else {
        newVNode = {
          tag: "h1",
          props: {},
          children: ["Invalid route handler"]
        };
      }
    }

    this.root.appendChild(renderV(newVNode));
    this.currentComponent = newVNode;
  }

  render() {
    this.handleRoute();

    document.body.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (href && href.startsWith("/")) {
        e.preventDefault();
        this.navigate(href);
      }
    });
  }
}
