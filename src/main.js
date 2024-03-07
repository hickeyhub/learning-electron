import 'electron-tabs'
const tabGroup = document.querySelector("tab-group");

const readyHandler = (tab) => {
  tab.webview.addEventListener('dom-ready', () => {
    ipc.send('getWebContents', tab.webview.getWebContentsId())
    tab.setTitle(tab.webview.getTitle());
  });
}

tabGroup.addTab({
  title: "",
  src: "https://portal.ionrocking.com",
  active: true,
  closable: false,
  webviewAttributes: {
    allowpopups: true
  },
  ready: readyHandler
});

ipc.on('newWindow', (ev, url) => {
  tabGroup.addTab({
    title: "",
    src: url,
    active: true,
    webviewAttributes: {
      allowpopups: true
    },
    ready: readyHandler
  });
});



