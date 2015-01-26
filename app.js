// Atom Modules
var app = require('app'); // Module to control application life
var BrowserWindow = require('browser-window'); // Module to create native browser window

// NPM Modules


// App Modules
var pandora = require('./lib/pandora');
$username = '';
$password = '';

// Report crashes to our server
require('crash-reporter').start();

// Global reference to the window object, if you don't the window will be closed automatically when the javascript object is GCed.
var mainWindow = null;

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
    if (success) {
      pandora.userAuth($username, $password, function (success) {
        console.log(success);
      });
    }
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 320, height: 450});

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
