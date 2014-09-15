define(function() {
  
  var context = new AudioContext();
  
  var wilhelm;
  var request = new XMLHttpRequest();
  request.open("GET", "WilhelmScream.wav");
  request.responseType = "arraybuffer";
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      wilhelm = buffer;
    });
  };
  request.send();
  
  var Track = function(length) {
    this.filename = null;
    this.buffer = null;
    this.amp = context.createGain();
    this.amp.connect(context.destination);
    this.filter = context.createBiquadFilter();
    this.filter.connect(this.amp);
    this.sequence = [];
    for (var i = 0; i < length; i++) {
      this.sequence.push({
        active: false
      });
    }
  };
  Track.prototype = {
    trigger: function() {
      if (this.buffer) {
        var source = context.createBufferSource();
        source.buffer = this.buffer;
        var filter = this.filter;
        source.connect(filter);
        source.start();
      } else {
        var filter = this.filter;
        var lfo = context.createOscillator();
        lfo.connect(filter);
        lfo.start();
        setTimeout(function() { lfo.stop() }, 40);
      }
    },
    load: function(buffer, c) {
      var self = this;
      context.decodeAudioData(buffer, function(audio) {
        self.buffer= audio;
        if (c) c();
      });
    }
  }
  
  return {
    makeTrack: function(length) {
      return new Track(length || 8);
    },
    playScream: function() {
      if (!wilhelm) return;
      var source = context.createBufferSource();
      source.buffer = wilhelm;
      source.connect(context.destination);
      source.start(0);
    }
  }
  
});