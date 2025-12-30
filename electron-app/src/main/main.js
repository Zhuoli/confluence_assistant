const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const ChatBot = require('../backend/chatbot');
const ConfigManager = require('../backend/config');

let mainWindow;
let chatBot;
let configManager;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        titleBarStyle: 'default',
        show: false
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Open DevTools in development
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    // Initialize configuration manager
    configManager = new ConfigManager();

    // Initialize chatbot
    try {
        chatBot = new ChatBot(configManager.getConfig());
    } catch (error) {
        console.error('Failed to initialize chatbot:', error);
    }

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers

ipcMain.on('check-config', (event) => {
    const config = configManager.getConfig();
    const configured = configManager.isConfigured();

    event.reply('config-status', { configured });
});

ipcMain.on('get-settings', (event) => {
    const config = configManager.getConfig();
    event.reply('settings-loaded', config);
});

ipcMain.on('save-settings', (event, settings) => {
    try {
        configManager.saveConfig(settings);

        // Reinitialize chatbot with new config
        chatBot = new ChatBot(settings);

        event.reply('settings-saved', true);
    } catch (error) {
        console.error('Failed to save settings:', error);
        event.reply('settings-saved', false);
    }
});

ipcMain.on('chat-message', async (event, data) => {
    const { message } = data;

    try {
        if (!chatBot) {
            throw new Error('ChatBot not initialized. Please configure settings first.');
        }

        const response = await chatBot.processMessage(message);

        event.reply('chat-response', { message: response });
    } catch (error) {
        console.error('Chat error:', error);
        event.reply('chat-error', { message: error.message });
    }
});
