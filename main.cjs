const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Keeps your sleek custom title bar
    backgroundColor: '#ffffff',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs') 
    }
  });

  // Try loading port 8080, if it fails, try 5173
  mainWindow.loadURL('http://localhost:8080').catch(() => {
    console.log("Port 8080 not found, trying 5173...");
    mainWindow.loadURL('http://localhost:5173').catch(err => {
      console.log("Could not find the Vite server! Make sure 'npm run dev' is running.");
    });
  });

  // Window Controls
  ipcMain.on('minimize-window', () => mainWindow.minimize());
  ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  ipcMain.on('close-window', () => mainWindow.close());
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});