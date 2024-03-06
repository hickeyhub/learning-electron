import path from 'path';
const { app, BrowserWindow, BrowserView, ipcMain, Menu, dialog } = require("electron");

let win, view;
const createWindow = () => {
  win = new BrowserWindow({
    width: 1536,
    height: 864,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    win.webContents.loadURL(url);
    return { action: "deny" };
  });
  const template = [
    {
      label: "main renderer",
      click: () => {
        if (win.webContents.isDevToolsOpened()) {
          win.webContents.closeDevTools();
        } else {
          win.webContents.openDevTools();
        }
      },
    },
    {
      label: "view renderer",
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

  // Load the local URL for development or the local
  // html file for production
  console.log(app.isPackaged, process.env['ELECTRON_RENDERER_URL'])
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
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

  const [width, height] = win.getContentSize();

  view.setBounds({
    x: 0,
    y: 33,
    width: width,
    height: height - 33,
  });

  win.setBrowserView(view);

  view.webContents.setWindowOpenHandler(({ url }) => {
    view.webContents.loadURL(url);
    event.sender.send("add-tab", url);
    return { action: "deny" };
  });

  view.webContents.on("did-finish-load", () => {
    event.sender.send("set-tab-title", view.webContents.getTitle());
  });


  view.webContents.session.on("will-download", (event, item, webContents) => {
    const savePath = path.join(app.getPath('downloads'), item.getFilename());
    item.setSavePath(savePath);

    // 监听下载完成事件
    item.once('done', (event, state) => {
      if (state === 'completed') {
        // 文件下载成功，弹出提示框
        dialog.showMessageBox(win, {
          type: 'info',
          title: '文件下载',
          message: '文件已成功下载到：' + savePath,
        });
      } else {
        // 文件下载失败，弹出提示框
        dialog.showMessageBox(win, {
          type: 'error',
          title: '文件下载',
          message: '文件下载失败',
        });
      }
    });
  });

  view.setAutoResize({ width: true, height: true });

});

