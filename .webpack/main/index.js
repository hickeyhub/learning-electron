/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("electron");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
const { app, BrowserWindow, BrowserView, ipcMain, Menu } = __webpack_require__(/*! electron */ "electron");

let win, view;
const createWindow = () => {
  win = new BrowserWindow({
    width: 1536,
    height: 864,
    webPreferences: {
      preload: 'E:\\learn\\oms-ion\\.webpack\\renderer\\main_window\\preload.js',
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
  win.loadURL('http://localhost:3000/main_window');
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


})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map