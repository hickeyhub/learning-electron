import 'electron-tabs'
const tabGroup = document.querySelector("tab-group");

const readyHandler = (tab) => {
  tab.webview.addEventListener('dom-ready', () => {
    ipc.send('getWebContents', tab.webview.getWebContentsId())
    tab.setTitle(tab.webview.getTitle());
  });

  tab.webview.addEventListener('context-menu', (e) => {
    const { x, y } = e;
    const id = tab.webview.getWebContentsId();
    ipc.send('show-context-menu', { id, x, y });
  });
}

tabGroup.addTab({
  title: "",
  src: `https://portal.ionrocking.com/index.html?v=${Date.now()}`,
  // src: "http://localhost:8080",
  active: true,
  closable: false,
  webviewAttributes: {
    allowpopups: true,
  },
  ready: readyHandler
});

ipc.on('newWindow', (ev, url) => {
  tabGroup.addTab({
    title: "",
    src: url,
    active: true,
    webviewAttributes: {
      allowpopups: true,
    },
    ready: readyHandler
  });
});



