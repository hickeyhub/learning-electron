const { app, BrowserWindow, BrowserView } = require("electron");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1536,
    height: 864,
    webPreferences: {
      webviewTag: true,
    },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    const view = new BrowserView({
      devTools: true,
    });
    win.setBrowserView(view);
    view.setBounds({ x: 0, y: 20, width: win.getBounds().width, height: win.getBounds().height });
    view.setAutoResize({ width: true, height: true });
    view.webContents.loadURL(url);
    return { action: "deny" };
  });
  win.loadURL("https://portaltest.ionrocking.com/");
};

app.whenReady().then(() => {
  createWindow();
});
