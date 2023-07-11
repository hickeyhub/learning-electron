const { app, BrowserWindow } = require("electron");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1536,
    height: 864,
  });

  win.loadURL("https://portal.ionrocking.com/");
};

app.whenReady().then(() => {
  createWindow();
});
