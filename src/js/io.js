define(function() {
  
  var useChrome = chrome && chrome.fileSystem;
  
  var fileInput = document.createElement("input");
  fileInput.type = "file";
  
  var link = document.createElement("a");
  link.download = "masterpiece.jsong";
  
  var browser = {
    save: function(data, callback) {
      link.href = "data:application/javascript;base64," + btoa(JSON.stringify(data));
      link.click();
      callback();
    },
    load: function(callback) {
      fileInput.onchange = function() {
        var file = fileInput.files[0];
        var reader = new FileReader();
        reader.onload = function() {
          try {
            var data = JSON.parse(reader.result);
            callback(null, data);
          } catch (err) {
            callback("Unable to read the file.");
          }
        };
        reader.readAsText(file);
      };
      fileInput.click();
    },
    localSave: function(data, callback) {
      localStorage.setItem("song", JSON.stringify(data));
    },
    localLoad: function(callback) {
      callback(null, localStorage.song);
    }
  };
  
  var cros = {
    save: function(data, callback) {
      chrome.fileSystem.chooseEntry({
        type: "saveFile",
        suggestedName: "masterpiece.jsong",
      }, function(entry) {
        entry.createWriter(function(writer) {
          writer.onwriteend = function() {
            writer.onwriteend = callback;
            var blob = new Blob([data]);
            writer.write(blob);
          };
          writer.truncate(0);
        });
      });
    },
    load: function(callback) {
      chrome.fileSystem.chooseEntry({
        type: "openFile"
      }, function(entry) {
        var reader = new FileReader();
        reader.onload = function() {
          try {
            var data = JSON.parse(reader.result);
            callback(null, data);
          } catch(err) {
            callback("Unable to read the file.");
          }
        };
        entry.file(function(f) {
          reader.readAsText(f);
        });
      });
    },
    localSave: function(data, callback) {
      chrome.storage.local.set({ song: JSON.stringify(data) }, callback);
    },
    localLoad: function(callback) {
      chrome.storage.local.get("song", function(data) {
        callback(null, data.song);
      });
    }
  };
  
  if (useChrome) {
    return cros;
  }
  console.log("browser worked");
  return browser;
});