define(function() {
  
  var useChrome = chrome && chrome.filesystem;
  
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
            callback(data);
          } catch (err) {
            callback("Unable to read the file.");
          }
        }
        reader.readAsText(file);
      }
      fileInput.click();
    }
  };
  
  var cros = {
    save: function(data, callback) {
      
    },
    load: function(callback) {
      
    }
  };
  
  return useChrome ? cros : browser;
  
});