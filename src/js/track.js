define([
  "application",
  "text!_track.html"
], function(app, template) {

  app.directive("track", function() {
    return {
      restrict: "E",
      template: template,
      scope: {
        track: "=data",
        clock: "="
      },
      link: function(scope, element, attr) {
        scope.status = "Empty";
        scope.lowpass = 22000;
        scope.volume = 100;
        
        var fileInput = angular.element(element[0].querySelector("[type=file]"));
        fileInput.on("change", function() {
          scope.status = "Loading";
          var file = this.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function() {
            scope.track.load(reader.result, function() {
              scope.status = "Ready";
              scope.track.filename = file.name;
              scope.$apply();
            });
          }
          reader.readAsArrayBuffer(file);
        });
        
        scope.$watch("lowpass", function() {
          scope.track.filter.frequency.value = scope.lowpass * 1;
        });
        
        scope.$watch("volume", function() {
          scope.track.amp.gain.value = scope.volume / 100;
        })
      }
    }
  });
});