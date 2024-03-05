const { app, BrowserWindow, BrowserView, ipcMain, Menu } = require("electron");

let win, view;
const createWindow = () => {
  win = new BrowserWindow({
    width: 1536,
    height: 864,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  debugger;
  win.webContents.setWindowOpenHandler(({ url }) => {
    win.webContents.loadURL(url);
    return { action: "deny" };
  });
  const template = [
    {
      label: "toggle devtools",
      click: () => {
        if (view.webContents.isDevToolsOpened()) {
          view.webContents.closeDevTools();
        } else {
          view.webContents.openDevTools();
        }
      },
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.on("tab-active", (event, url) => {
  view.webContents.loadURL(url);
});

ipcMain.on("ready", (event, arg) => {
  view = new BrowserView();
  win.setBrowserView(view);
  view.setBounds({
    x: 0,
    y: 33,
    width: win.getBounds().width,
    height: win.getBounds().height - 33,
  });

  view.webContents.setWindowOpenHandler(({ url }) => {
    view.webContents.loadURL(url);
    event.sender.send("add-tab", url);
    return { action: "deny" };
  });

  view.webContents.on("did-finish-load", () => {
    event.sender.send("set-tab-title", view.webContents.getTitle());
  });
  view.setAutoResize({ width: true, height: true });
});

