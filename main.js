const path = require("path");
const {
  app,
  BrowserWindow,
  //BrowserView, ipcMain,
  Menu,
} = require("electron");
// const reload = require("electron-reload");

let win;
// let view;
const createWindow = () => {
  win = new BrowserWindow({
    width: 1536,
    height: 864,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const template = [
    {
      label: "go home",
      click: () => {
        win.webContents.loadURL("https://portal.ionrocking.com");
      },
    },
    {
      label: "toggle devtools",
      click: () => {
        if (win.webContents.isDevToolsOpened()) {
          win.webContents.closeDevTools();
        } else {
          win.webContents.openDevTools();
        }
      },
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  win.webContents.setWindowOpenHandler(({ url }) => {
    win.webContents.loadURL(url);
    return { action: "deny" };
  });

  win.loadURL("https://portal.ionrocking.com");
};

app.whenReady().then(() => {
  createWindow();

  // reload(__dirname, {
  //   electron: path.join(__dirname, "node_modules", ".bin", "electron"),
  //   forceHardReset: true,
  // });
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

// ipcMain.on("tab-active", (event, url) => {
//   view.webContents.loadURL(url);
// });

// ipcMain.on("ready", (event, arg) => {
//   view = new BrowserView();
//   win.setBrowserView(view);
//   view.setBounds({
//     x: 0,
//     y: 33,
//     width: win.getBounds().width,
//     height: win.getBounds().height - 33,
//   });

//   view.webContents.setWindowOpenHandler(({ url }) => {
//     event.sender.send("add-tab", url);
//     view.webContents.loadURL(url);
//     return { action: "deny" };
//   });

//   view.setAutoResize({ width: true, height: true });
//   view.webContents.loadURL("https://portaltest.ionrocking.com");
// });
