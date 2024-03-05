import './components/tabs/style.css'
import './components/tabs/index.js'

const tabGroup = document.querySelector("tab-group");
var currentTab = null;
ipc.send("ready", "ready:ok");

tabGroup.on("active", (tab) => {
  ipc.send("tab-active", tab[0].src);
  currentTab = tab;
});

tabGroup.addTab({
  title: "经营管理中心",
  src: "https://portaltest.ionrocking.com/",
  active: true,
  closable: false,
});

tabGroup.on("tab-added", (tab) => {
  currentTab = tab;
});

ipc.on("add-tab", (src) => {
  tabGroup.addTab({
    title: "",
    src: src,
    active: true,
  });
});

ipc.on("set-tab-title", (title) => {
  if (currentTab && !currentTab.setTitle) return;
  currentTab.setTitle(title);
});