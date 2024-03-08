import path from 'path';
import { app, BrowserWindow, Menu, dialog, ipcMain, webContents } from "electron";

ipcMain.on('getWebContents', (ev, id) => {
  const wc = webContents.fromId(id);
  wc.setWindowOpenHandler(({ url }) => {
    ev.sender.send('newWindow', url);
    return { action: 'deny' };
  });
});

const createWindow = () => {
  let win = new BrowserWindow({
    width: 1536,
    height: 864,
    icon: path.join(__dirname, '../renderer/assets/icon.ico'),
    webPreferences: {
      webviewTag: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  Menu.setApplicationMenu(null);

  // Load the local URL for development or the local
  // html file for production
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // win.webContents.session.on("will-download", (event, item, webContents) => {
  //   const savePath = path.join(app.getPath('downloads'), item.getFilename());
  //   item.setSavePath(savePath);

  //   // 监听下载完成事件
  //   item.once('done', (event, state) => {
  //     if (state === 'completed') {
  //       // 文件下载成功，弹出提示框
  //       dialog.showMessageBox(win, {
  //         type: 'info',
  //         title: '文件下载',
  //         message: '文件已成功下载到：' + savePath,
  //       });
  //     } else {
  //       // 文件下载失败，弹出提示框
  //       dialog.showMessageBox(win, {
  //         type: 'error',
  //         title: '文件下载',
  //         message: '文件下载失败',
  //       });
  //     }
  //   });
  // });
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


