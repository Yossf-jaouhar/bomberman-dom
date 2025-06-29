let hookStates = [];
let hookIndex = 0;

let currentComponent = null;
let currentDOMFunc = null;
let root = null;

// Hook system
export function UseState(initialValue) {
  const currentIndex = hookIndex;

  if (hookStates[currentIndex] === undefined) {
    hookStates[currentIndex] = initialValue;
  }

  function setState(newVal) {
    hookStates[currentIndex] = newVal;
    rerender();
  }

  const getState = () => hookStates[currentIndex];

  hookIndex++;
  return [getState, setState];
}

// Rendering entry point
export function Render(input) {
  hookIndex = 0;
  root = document.querySelector(".app");

  if (typeof input === "function") {
    currentDOMFunc = input;
    currentComponent = input();
    return renderV(currentComponent);
  } else {
    return renderV(input);
  }
}

// Trigger virtual DOM re-render
function rerender() {
  hookIndex = 0;
  const newVNode = currentDOMFunc();
  MyNewPatch(root, currentComponent, newVNode);
  currentComponent = newVNode;
}

// Virtual DOM element creator
export function E(tag, props = {}) {
  return {
    tag,
    props,
    key: props.key || null,
    children: [],
    childs(...children) {
      const normalize = (child) => {
        if (typeof child === "function") return normalize(child());
        if (Array.isArray(child)) return child.flatMap(normalize);
        return child;
      };
      this.children.push(...children.flatMap(normalize));
      return this;
    },
  };
}

// Create real DOM from virtual DOM
export function renderV(vnode) {
  if (vnode === null || vnode === undefined) {
    return document.createTextNode('');
  }

  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(vnode);
  }

  if (typeof vnode === "function") {
    return renderV(vnode());
  }

  const isSVG = ["svg", "circle", "rect", "path"].includes(vnode.tag);
  const el = isSVG
    ? document.createElementNS("http://www.w3.org/2000/svg", vnode.tag)
    : document.createElement(vnode.tag);

  for (const [key, value] of Object.entries(vnode.props || {})) {
    if (key.startsWith("$")) {
      el.addEventListener(key.slice(1), value);
    } else if (key === "checked") {

      // console.log("key", key, value);
      el.checked = value;
    } else {
      el.setAttribute(key, value);
    }
  }

  for (const child of vnode.children || []) {
    el.appendChild(renderV(child));
  }

  return el;
}

// Patch DOM using virtual diff
export function MyNewPatch(root, oldN, newN, pos = 0) {
  // Handle primitive nodes (text or numbers)
  if (typeof oldN === "string" || typeof oldN === "number" ||
    typeof newN === "string" || typeof newN === "number") {
    if (oldN !== newN) {
      root.replaceChild(renderV(newN), root.childNodes[pos]);
    }
    return;
  }

  // New node only
  if (!oldN) {
    root.appendChild(renderV(newN));
    return;
  }

  // Old node only (remove it)
  if (!newN) {
    if (root.childNodes[pos]) {
      root.removeChild(root.childNodes[pos]);
    }
    return;
  }

  // Different tag: replace whole node
  if (oldN.tag !== newN.tag) {
    root.replaceChild(renderV(newN), root.childNodes[pos]);
    return;
  }

  const domNode = root.childNodes[pos];
  if (!domNode) return;

  // Sync props
  const oldProps = oldN.props || {};
  const newProps = newN.props || {};

  for (const [key, newVal] of Object.entries(newProps)) {
    const oldVal = oldProps[key];

    if (newVal !== oldVal && !key.startsWith("$")) {
      if (key === "value" && domNode.value !== newVal) {
        domNode.value = newVal;
      } else if (key === "checked") {
        domNode.checked = newVal;
      } else {
        domNode.setAttribute(key, newVal);
      }
    }
  }

  // Remove old props no longer in newProps
  for (const key of Object.keys(oldProps)) {
    if (!(key in newProps)) {
      if (key === "checked") {
        domNode.checked = false;
      } else {
        domNode.removeAttribute(key);
      }
    }
  }

  // Sync children
  const oldChildren = oldN.children || [];
  const newChildren = newN.children || [];

  const allChildrenKeyed = newChildren.every(child => child?.props?.key !== undefined);

  if (allChildrenKeyed) {
    const oldKeyMap = new Map();
    oldChildren.forEach((child, i) => {
      const key = child?.props?.key;
      if (key !== undefined) {
        oldKeyMap.set(key, [child, i]);
      }
    });

    const usedIndices = new Set();
    newChildren.forEach((newChild, newIdx) => {
      // console.log('----0-0----',newChild, newIdx)
      const key = newChild?.props?.key;
      if (key !== undefined && oldKeyMap.has(key)) {
        const [matchedOld, oldIdx] = oldKeyMap.get(key);
        usedIndices.add(oldIdx);

        MyNewPatch(domNode, matchedOld, newChild, oldIdx);
      } else {

        MyNewPatch(domNode, undefined, newChild, newIdx);
      }
    });

    oldChildren.forEach((oldChild, i) => {
      const key = oldChild?.props?.key;
      if (key !== undefined && !newChildren.find(c => c?.props?.key === key)) {
        MyNewPatch(domNode, oldChild, undefined, i);
      }
    });
  } else {
    // Fallback to index-based diffing
    const max = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < max; i++) {
      MyNewPatch(domNode, oldChildren[i], newChildren[i], i);
    }
  }
}