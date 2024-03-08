import 'electron-tabs'
const tabGroup = document.querySelector("tab-group");

const readyHandler = (tab) => {
  tab.webview.addEventListener('dom-ready', () => {
    ipc.send('getWebContents', tab.webview.getWebContentsId())
    tab.setTitle(tab.webview.getTitle());
  });

  tab.webview.addEventListener('context-menu', (e) => {
    if (tab.webview.isDevToolsOpened()) {
      if (window.confirm('close devtools?')) {
        tab.webview.closeDevTools();
      }
    } else {
      if (window.confirm('open devtools?')) {
        tab.webview.openDevTools();
      }
    }
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



