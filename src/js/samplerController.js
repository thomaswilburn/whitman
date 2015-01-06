define([
  "application",
  "audio",
  "io",
  "track"
], function(app, audio, io) {
  app.controller("sampler", ["$scope", "$timeout", function($scope, $timeout) {

    var autosave = 5 * 1000;
    var songLength = 4 * 8;
    
    var tracks = $scope.tracks = [];
    var clock = $scope.clock = {
      index: -1,
      playing: false,
      timeout: null,
      tempo: 120
    };
    
    for (var i = 0; i < 4; i++) {
      $scope.tracks.push(audio.makeTrack(songLength));
    }

    var serialize = function() {
      return tracks.map(function(t) {
        return t.sequence.map(function(s) {
          return {
            active: s.active
          };
        });
      });
    };

    io.localLoad(function(err, song) {
      if (!song) return;
      song.forEach(function(track, i) {
        tracks[i].sequence = track;
      });
    });

    var persist = function() {
      var song = serialize();
      io.localSave(song, function() {
        setTimeout(persist, autosave);
      });
    };
    persist();
    
    var cycle = function() {
      clock.index++;
      clock.index = clock.index % tracks[0].sequence.length;
      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        if (track.sequence[clock.index].active) {
          track.trigger();
        }
      }
      if (clock.playing) clock.timeout = $timeout(cycle, 60 * 1000 / clock.tempo);
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
    
    $scope.seekZero = function() {
      clock.index = -1;
      clock.playing = false;
      if (clock.timeout) {
        $timeout.cancel(clock.timeout);
        clock.timeout = null;
      }
    };

    $scope.reset = function() {
      tracks.forEach(function(t) {
        t.reset();
      });
    };
    
    $scope.saveSong = function() {
      io.save(serialize(), function() {
        console.log("save complete");
      });
    };
    
    $scope.loadSong = function() {
      io.load(function(err, data) {
        data.forEach(function(track, i) {
          tracks[i].sequence = track;
        });
        $scope.$apply();
      });
    };
    
    window.addEventListener("keypress", function(e) {
      if (e.keyCode == 32) {
        $scope.playPause();
        $scope.$apply();
      }
    });
    
  }]);
})