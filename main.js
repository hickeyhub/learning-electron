const path = require("path");
const { app, BrowserWindow, BrowserView, ipcMain, Menu } = require("electron");

let win, view;
const createWindow = () => {
  win = new BrowserWindow({
    width: 1536,
    height: 864,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

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

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  createWindow();
  if (process.env.NODE_ENV === "development") {
    require("electron-reload")(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`),
    });
  }
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
