const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('manoprotectDesktop', {
  platform: process.platform,
  version: require('./package.json').version,
  appName: 'ManoProtect CRA'
});
