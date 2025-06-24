import { MyNewPatch, renderV } from "./DOM.js"

export default class App {
  constructor(rootId) {
    this.routes = new Map()
    this.root = document.getElementById(rootId) || document.body
    this.hookStates = []
    this.hookIndex = 0
    this.currentDOMFunc = null
    this.currentComponent = null

    window.addEventListener("popstate", () => this.handleRoute())
  }

  addRoute(path, handler) {
    this.routes.set(path, handler)
  }

  navigate(path) {
    history.pushState({}, "", path)
    this.handleRoute()
  }

  useState(initialValue) {
    const currentIndex = this.hookIndex
    if (this.hookStates[currentIndex] === undefined) {
      this.hookStates[currentIndex] = initialValue
    }

    const setState = newVal => {
      this.hookStates[currentIndex] = newVal
      this.rerender()
    }

    const getState = () => this.hookStates[currentIndex]
    this.hookIndex++
    return [getState, setState]
  }

  rerender() {
    this.hookIndex = 0
    const newVNode = this.currentDOMFunc()
    
    MyNewPatch(this.root, this.currentComponent, newVNode)
    this.currentComponent = newVNode
  }

  handleRoute() {
    const path = window.location.pathname || "/"
    const handler = this.routes.get(path)

    this.root.innerHTML = ""

    if (!handler) {
      this.root.innerHTML = "<h1>404 Not Found</h1>"
      return
    }

    if (typeof handler === "function") {
      this.currentDOMFunc = handler
      this.currentComponent = handler()
    }

    this.root.appendChild(renderV(this.currentComponent))
  }

  render() {
    console.log("App is rendering" , this.routes);
    
    this.handleRoute()
    document.body.addEventListener("click", e => {
      const a = e.target.closest("a")
      if (!a) return
      const href = a.getAttribute("href")
      if (href && href.startsWith("/")) {
        e.preventDefault()
        this.navigate(href)
      }
    })
  }
}
