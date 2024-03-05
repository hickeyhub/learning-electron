import Sortable from "sortablejs";

if (!document) {
  throw Error("electron-tabs module must be called in renderer process");
}

const CLASSNAMES = {
  ROOT: "etabs",
  NAV: "nav",
  TABS: "tabs",
  TAB: "tab",
  BUTTONS: "buttons",
};

var activeHandle = null;

function emit(emitter, type, args) {
  if (type === "ready") {
    emitter.isReady = true;
  } else if (type === "active") {
    activeHandle(args);
  }
  emitter.dispatchEvent(new CustomEvent(type, { detail: args }));
}

function on(emitter, type, fn, options) {
  if (type === "ready" && emitter.isReady === true) {
    fn.apply(emitter, [emitter]);
  } else {
    if (type === "active") {
      activeHandle = fn;
    }
  }
  emitter.addEventListener(type, (e) => fn.apply(emitter, e.detail), options);
}

class TabGroup extends HTMLElement {
  buttonContainer;
  isReady;
  newTabId;
  options;
  shadow;
  tabContainer;
  tabs;

  constructor() {
    super();

    this.isReady = false;

    // Options
    this.options = {
      closeButtonText: this.getAttribute("close-button-text") || "&#215;",
      defaultTab: { title: "New Tab", active: true },
      newTabButton: !!this.getAttribute("new-tab-button") === true || false,
      newTabButtonText: this.getAttribute("new-tab-button-text") || "&#65291;",
      sortable: !!this.getAttribute("sortable") === true || false,
      visibilityThreshold:
        Number(this.getAttribute("visibility-threshold")) || 0,
    };

    this.tabs = [];
    this.newTabId = 0;

    this.createComponent();
    this.initVisibility();
    if (this.options.sortable) {
      this.initSortable();
    }

    this.emit("ready", this);
  }

  emit(type, ...args) {
    return emit(this, type, args);
  }

  on(type, fn) {
    return on(this, type, fn);
  }

  once(type, fn) {
    return on(this, type, fn, { once: true });
  }

  createComponent() {
    const shadow = this.attachShadow({ mode: "open" });
    this.shadow = shadow;

    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", CLASSNAMES.ROOT);

    const tabgroup = document.createElement("nav");
    tabgroup.setAttribute("class", CLASSNAMES.NAV);
    wrapper.appendChild(tabgroup);

    const tabContainer = document.createElement("div");
    tabContainer.setAttribute("class", CLASSNAMES.TABS);
    tabgroup.appendChild(tabContainer);
    this.tabContainer = tabContainer;

    const buttonContainer = document.createElement("div");
    buttonContainer.setAttribute("class", CLASSNAMES.BUTTONS);
    tabgroup.appendChild(buttonContainer);
    this.buttonContainer = buttonContainer;

    if (this.options.newTabButton) {
      const button = this.buttonContainer.appendChild(
        document.createElement("button")
      );
      button.innerHTML = this.options.newTabButtonText;
      button.addEventListener(
        "click",
        this.addTab.bind(this, undefined),
        false
      );
    }

    // 导入样式
    const style = document.createElement("style");
    style.textContent = `
      @import "./components/tabs/style.css";
      /* 在这里添加 Shadow DOM 中的样式 */
    `;

    shadow.appendChild(style);
    shadow.appendChild(wrapper);
  }

  initVisibility() {
    function toggleTabsVisibility(tab, tabGroup) {
      const visibilityThreshold = tabGroup.options.visibilityThreshold;
      const el = tabGroup.tabContainer.parentElement;
      if (tabGroup.tabs.length >= visibilityThreshold) {
        el.classList.add("visible");
      } else {
        el.classList.remove("visible");
      }
    }

    this.on("tab-added", toggleTabsVisibility);
    this.on("tab-removed", toggleTabsVisibility);
    toggleTabsVisibility(null, this);
  }

  initSortable() {
    const createNewSortable = () => {
      const options = Object.assign(
        {
          direction: "horizontal",
          animation: 150,
          swapThreshold: 0.2,
        },
        this.options.sortableOptions
      );
      new Sortable(this.tabContainer, options);
    };

    if (Sortable) {
      createNewSortable();
    } else {
      document.addEventListener("DOMContentLoaded", createNewSortable);
    }
  }

  setDefaultTab(tab) {
    this.options.defaultTab = tab;
  }

  addTab(args = this.options.defaultTab) {
    if (typeof args === "function") {
      args = args(this);
    }
    const id = this.newTabId;
    this.newTabId++;
    const tab = new Tab(this, id, args);
    this.tabs.push(tab);
    // Don't call tab.activate() before a tab is referenced in this.tabs
    if (args.active === true) {
      tab.activate();
    }
    this.emit("tab-added", tab, this);
    return tab;
  }

  getTab(id) {
    for (let i in this.tabs) {
      if (this.tabs[i].id === id) {
        return this.tabs[i];
      }
    }
    return null;
  }

  getTabByPosition(position) {
    const fromRight = position < 0;
    for (let i in this.tabs) {
      if (this.tabs[i].getPosition(fromRight) === position) {
        return this.tabs[i];
      }
    }
    return null;
  }

  getTabByRelPosition(position) {
    position = this.getActiveTab().getPosition() + position;
    if (position <= 0) {
      return null;
    }
    return this.getTabByPosition(position);
  }

  getNextTab() {
    return this.getTabByRelPosition(1);
  }

  getPreviousTab() {
    return this.getTabByRelPosition(-1);
  }

  getTabs() {
    return this.tabs.slice();
  }

  eachTab(fn) {
    this.getTabs().forEach(fn);
  }

  getActiveTab() {
    if (this.tabs.length === 0) return null;
    return this.tabs[0];
  }

  setActiveTab(tab) {
    this.removeTab(tab);
    this.tabs.unshift(tab);
    this.emit("tab-active", tab, this);
  }

  removeTab(tab, triggerEvent = false) {
    const id = tab.id;
    const index = this.tabs.findIndex((t) => t.id === id);
    this.tabs.splice(index, 1);
    if (triggerEvent) {
      this.emit("tab-removed", tab, this);
    }
  }

  activateRecentTab() {
    if (this.tabs.length > 0) {
      this.tabs[0].activate();
    }
  }
}

class Tab extends EventTarget {
  badge;
  closable;
  element;
  icon;
  iconURL;
  id;
  isClosed;
  isReady;
  spans;
  tabGroup;
  title;
  src;

  constructor(tabGroup, id, args) {
    super();
    this.badge = args.badge;
    this.closable = args.closable === false ? false : true;
    this.icon = args.icon;
    this.iconURL = args.iconURL;
    this.id = id;
    this.isClosed = false;
    this.isReady = false;
    this.spans = {};
    this.tabGroup = tabGroup;
    this.title = args.title;
    this.src = args.src;

    this.initTab();

    if (args.visible !== false) {
      this.show();
    }
    if (typeof args.ready === "function") {
      args.ready(this);
    } else {
      this.emit("ready", this);
    }
  }

  emit(type, ...args) {
    return emit(this, type, args);
  }

  on(type, fn) {
    return on(this, type, fn);
  }

  once(type, fn) {
    return on(this, type, fn, { once: true });
  }

  initTab() {
    const tab = (this.element = document.createElement("div"));
    tab.classList.add(CLASSNAMES.TAB);
    for (let el of ["icon", "title", "badge", "close"]) {
      const span = tab.appendChild(document.createElement("span"));
      span.classList.add(`${CLASSNAMES.TAB}-${el}`);
      this.spans[el] = span;
    }

    this.setTitle(this.title);
    this.setBadge(this.badge);
    this.setIcon(this.iconURL, this.icon);
    this.initTabCloseButton();
    this.initTabClickHandler();

    this.tabGroup.tabContainer.appendChild(this.element);
  }

  initTabCloseButton() {
    const container = this.spans.close;
    if (this.closable) {
      const button = container.appendChild(document.createElement("button"));
      button.innerHTML = this.tabGroup.options.closeButtonText;
      button.addEventListener("click", this.close.bind(this, false), false);
    }
  }

  initTabClickHandler() {
    // Mouse up
    const tabClickHandler = function (e) {
      if (this.isClosed) return;
      if (e.which === 2) {
        this.close();
      }
    };
    this.element.addEventListener("mouseup", tabClickHandler.bind(this), false);
    // Mouse down
    const tabMouseDownHandler = function (e) {
      if (this.isClosed) return;
      if (e.which === 1) {
        if (e.target.matches("button")) return;
        this.activate();
      }
    };
    this.element.addEventListener(
      "mousedown",
      tabMouseDownHandler.bind(this),
      false
    );
  }

  setTitle(title) {
    if (this.isClosed) return;
    const span = this.spans.title;
    span.innerHTML = title;
    span.title = title;
    this.title = title;
    this.emit("title-changed", title, this);
    return this;
  }

  getTitle() {
    if (this.isClosed) return;
    return this.title;
  }

  setBadge(badge) {
    if (this.isClosed) return;
    const span = this.spans.badge;
    this.badge = badge;

    if (badge) {
      span.innerHTML = badge.text;
      span.classList.add(badge.classname);
      span.classList.remove("hidden");
    } else {
      span.classList.add("hidden");
    }

    this.emit("badge-changed", badge, this);
  }

  getBadge() {
    if (this.isClosed) return;
    return this.badge;
  }

  setIcon(iconURL, icon) {
    if (this.isClosed) return;
    this.iconURL = iconURL;
    this.icon = icon;
    const span = this.spans.icon;
    if (iconURL) {
      span.innerHTML = `<img src="${iconURL}" />`;
      this.emit("icon-changed", iconURL, this);
    } else if (icon) {
      span.innerHTML = `<i class="${icon}"></i>`;
      this.emit("icon-changed", icon, this);
    }

    return this;
  }

  getIcon() {
    if (this.isClosed) return;
    if (this.iconURL) return this.iconURL;
    return this.icon;
  }

  setPosition(newPosition) {
    const tabContainer = this.tabGroup.tabContainer;
    const length = tabContainer.childElementCount;
    const thisPosition = this.getPosition();
    const tabs = Array.from(tabContainer.children);
    tabs.splice(thisPosition, 1);

    if (newPosition < 0) {
      newPosition += length;
      if (newPosition < 0) {
        newPosition = 0;
      }
    }

    if (newPosition < length) {
      tabContainer.insertBefore(this.element, tabs[newPosition]);
    } else {
      tabContainer.appendChild(this.element);
    }

    return this;
  }

  getPosition(fromRight = false) {
    let position = 0;
    let tab = this.element;
    while ((tab = tab.previousSibling) != null) position++;

    if (fromRight === true) {
      position -= this.tabGroup.tabContainer.childElementCount;
    }

    return position;
  }

  activate() {
    if (this.isClosed) return;
    const activeTab = this.tabGroup.getActiveTab();
    if (activeTab) {
      activeTab.element.classList.remove("active");
      activeTab.emit("inactive", activeTab);
    }
    this.tabGroup.setActiveTab(this);
    this.element.classList.add("active");
    this.emit("active", this);
    return this;
  }

  show(flag = true) {
    if (this.isClosed) return;
    if (flag) {
      this.element.classList.add("visible");
      this.emit("visible", this);
    } else {
      this.element.classList.remove("visible");
      this.emit("hidden", this);
    }
    return this;
  }

  hide() {
    return this.show(false);
  }

  hasClass(classname) {
    return this.element.classList.contains(classname);
  }

  close(force) {
    const abortController = new AbortController();
    const abort = () => abortController.abort();
    this.emit("closing", this, abort);

    const abortSignal = abortController.signal;
    if (this.isClosed || (!this.closable && !force) || abortSignal.aborted)
      return;

    this.isClosed = true;
    const tabGroup = this.tabGroup;
    tabGroup.tabContainer.removeChild(this.element);
    const activeTab = this.tabGroup.getActiveTab();
    tabGroup.removeTab(this, true);

    this.emit("close", this);

    if (activeTab.id === this.id) {
      tabGroup.activateRecentTab();
    }
  }
}

customElements.define("tab-group", TabGroup);
