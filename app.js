// Atom Modules
var app = require('app'); // Module to control application life
var Menu = require('menu');
var MenuItem = require('menu-item');
var BrowserWindow = require('browser-window'); // Module to create native browser window
var ipc = require('ipc');
var mainWindow = null; // Global reference to the window object, if you don't the window will be closed automatically when the javascript object is GCed.

// NPM Modules


// App Modules
var pandora = require('./lib/pandora');

// Report crashes to our server
require('crash-reporter').start();

app.commandLine.appendSwitch('remote-debugging-port', '8315');

// Quite when all windows are closed
app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Connect to Pandora
  pandora.partnerAuth(function (success) {
    if (!success) {
      // Stop mainWindow creation
    }
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    'width': 300,
    'height': 460,
    'resizable': false
  });

  var menu = Menu.buildFromTemplate([{
    lable: 'Atom Shell',
    submenu: [{
      label: 'reload',
      accelerator: 'Ctrl+R',
      click: function() {
        mainWindow.reload();
      }
    }, {
      label: 'Toggle DevTools',
      accelerator: 'Alt+Ctrl+I',
      click: function() {
        mainWindow.toggleDevTools();
      }
    }]
  }]);

  Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/client/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

ipc.on('login', function (event, arg) {
  pandora.userAuth(arg.user, arg.pass, function (success) {
    event.sender.send('login-attempt', success);
  });
});
