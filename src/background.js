/*
The background process is responsible for opening Caret windows in response to
app launches, choosing a file in the Files app on Chrome OS, and external
messages.
*/

var mainWindow = null;
var pending = null;
var upgrading = false;
var files = [];
var commands = [];

var openWindow = function() {
  
  //if window exists, re-use it
  if (mainWindow) {
    //attach any new files to the window, and re-trigger "open from launch"
    mainWindow.contentWindow.launchData = files;
    mainWindow.focus();
    mainWindow.drawAttention();
    files = [];
    pending = null;
    return;
  }
  
  //otherwise, open a new window
  var defaults = {
    width: 800,
    height: 600,
    left: 50,
    top: 50
  };
  chrome.app.window.create("index.html", {
      bounds: defaults,
      id: "whitman:main",
      minWidth: 640,
      minHeight: 480
  }, function(win) {
    mainWindow = win;
    win.contentWindow.launchData = files;
    mainWindow.onClosed.addListener(function() {
      mainWindow = null;
      chrome.storage.local.remove("isOpen");
    });
    files = [];
    commands = [];
    pending = null;
    chrome.storage.local.set({isOpen: true});
  });
}

var launch = function(launchData) {
  if (launchData && launchData.items) files.push.apply(files, launchData.items);
  //we delay opening the actual window to give multiple file events time to fire
  if (pending !== null) return;
  //do not open windows when an upgrade is running
  if (upgrading) return;
  pending = setTimeout(openWindow, 250);
};
chrome.app.runtime.onLaunched.addListener(launch);

//relaunch on reboot, if the window was open at shutdown
chrome.app.runtime.onRestarted.addListener(function() {
  chrome.storage.local.get("isOpen", function(data) {
    if (data.isOpen) launch();
  });
});
