define([
  "application",
  "audio",
  "track"
], function(app, audio) {
  app.controller("sampler", ["$scope", "$timeout", function($scope, $timeout) {
    
    var tracks = $scope.tracks = [];
    var clock = $scope.clock = {
      index: -1,
      playing: false,
      timeout: null,
      tempo: 120
    };
    
    for (var i = 0; i < 4; i++) {
      $scope.tracks.push(audio.makeTrack(4 * 8));
    }
    
    var cycle = function() {
      clock.index++;
      clock.index = clock.index % tracks[0].sequence.length;
      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        if (track.sequence[clock.index].active) {
          track.trigger();
        }
      }
      if (clock.playing) clock.timeout = $timeout(cycle, 60 * 1000 / clock.tempo)
    };
    //clock.timeout = $timeout(cycle, 60 * 1000 / clock.tempo);
    
    $scope.playPause = function() {
      if (clock.playing) {
        clock.playing = false;
        if (clock.timeout) {
          $timeout.cancel(clock.timeout);
          clock.timeout = null;
        }
      } else {
        clock.playing = true;
        if (clock.index >= 0) clock.index--;
        cycle();
      }
    };
    
    $scope.reset = function() {
      clock.index = -1;
      clock.playing = false;
      if (clock.timeout) {
        $timeout.cancel(clock.timeout);
        clock.timeout = null;
      }
    };
    
    window.addEventListener("keypress", function(e) {
      if (e.keyCode == 32) {
        $scope.playPause();
        $scope.$apply();
      }
    });
    
  }]);
})