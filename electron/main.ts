import { app, BrowserWindow, Menu, screen, Tray } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width: 300,
    height: 350,
    show: false,
    titleBarStyle: 'hidden',
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.on('close', (event) => {
    event.preventDefault()
    win?.hide()
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

function createTray() {
  const menuTemplate = [
    {
      id: 'quit',
      label: 'Fechar',
      click: () => {
        app.quit()
      }
    }
  ]

  const iconPath = path.join(process.env.VITE_PUBLIC, '../src/assets/logo.png')
  const tray = new Tray(iconPath)

  const contextMenu = Menu.buildFromTemplate(menuTemplate)
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (win?.isVisible()) {
      win.hide()
    } else {
      win?.show()
      win?.focus()
    }
    toggleWindowPosition(tray)
  })
}

function toggleWindowPosition(tray: Tray) {
  if (win) {
    const trayBounds = tray.getBounds() //Posição e tamanho do trray
    const primaryDisplay = screen.getPrimaryDisplay()
    const displayBounds = primaryDisplay.bounds
    const windowBounds = win.getBounds() //Posição e tamanho da janela

    //Calcula a posição X centralizada em relação ao ícone da tray
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - windowBounds.width / 2)

    //Coloca a janela logo abaixo da tray
    const y = Math.round(trayBounds.y - windowBounds.height)

    const finalX = Math.max(0, Math.min(x, displayBounds.width - windowBounds.width))
    const finalY = Math.max(0, Math.min(y, displayBounds.height - windowBounds.height))

    win.setPosition(finalX, finalY, false)
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
  createTray()
})
