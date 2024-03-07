import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("ipc", {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel, listener) => {
    ipcRenderer.on(channel, listener);
  },
  once: (channel, listener) => {
    ipcRenderer.once(channel, listener);
  },
  invoke: (channel, data) => {
    return ipcRenderer.invoke(channel, data);
  },
});
