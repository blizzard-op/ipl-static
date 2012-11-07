var LivePlayer = function(slug, index) {
  var self = this;
  this.index = ko.observable(index);
  this.slug = ko.observable(slug);
  this.idNum = Math.floor(Math.random()*1000000);
  this.containerId = ko.computed(function(){
    return 'playerContrainer'+self.idNum;
  });
  this.container = function() {return $('#'+self.containerId());};
  this.flashObject = function() {return self.container().find('object:first');};
  this.quality = ko.observable({text: "Best", value: 4});
  this.playing = ko.observable(true);
  this.volume = ko.observable(50);
  this.muted = ko.observable(false);
  this.inactiveMute = ko.observable(true);
  this.jtvPlayer = false;
  this.qualityText = [{text: "240p", value: 0}, {text: "360p", value: 1}, {text: "480p", value: 2}, {text: "Best", value: 4}];
  this.active = ko.observable(false);
  this.load = function() {
    var swf = "http://esports.ign.com/assets/IPL_JTV_Player.swf",
      html = '<object type="application/x-shockwave-flash" data=' + swf + ' width="160" height="90" id="' + self.containerId() + 'Object" style="visibility: visible; width: 100%; height: 100%; margin-top: 0.8125px; position: relative; "><param name="flashvars" value="&start_volume=50&channel=' + self.slug() + '&hostname=www.justin.tv&auto_play=true&enable_javascript=true&consumer_key=96OPe6EWesFs5PdLgQzxA"><param name="allowFullScreen" value="true"><param name="allowScriptAccess" value="always"><param name="allowNetworking" value="all"><param name="wmode" value="opaque"><param name="name" value="jtv_flash"><param name="id" value="jtv_flash"><param name="bgcolor" value="#000000"></object>';
        self.flashObject().replaceWith(html);
    var franchiseSlug = self.videoObject().franchise_slug || 'all';
    _gaq.push(['_trackEvent', 'Live Play', franchiseSlug, self.videoObject().description]);
    self.init();
  };

   
  this.currentVolume = ko.computed(function() {
        return (self.muted() || self.inactiveMute()) ? 0 : self.volume();
    });
    this.getObjectFromSlug = function(slug) {
        for(var i = 0; i < viewModel.liveChannels().length; i++) {
            if(slug === viewModel.liveChannels()[i].slug) {
                return viewModel.liveChannels()[i];
            }
        }
        return  {name: slug, slug: slug, display_name: slug};
    };
  this.videoObject = ko.computed(function() {
    return self.getObjectFromSlug(self.slug());
  });
  this.title = ko.computed(function(){
    return self.videoObject().display_name || self.videoObject().name;
  });
  
  this.playPause = function() {
    self.playing(!self.playing());
  };
  this.muteUnmute = function() {
    if(self.currentVolume()) {
      self.muted(true);
    } else {
      self.muted(false);
      self.inactiveMute(false);
    }
  };
  
  this.init = function(){
      self.container().find('input[type=range]').rangeinput({
        progress : true,
        value : self.muted() ? 0 : self.volume(),
        onSlide: function(ev, i) {
          if(i != 0 && i != self.volume(i)) {
            self.muted(false);
            self.inactiveMute(false);
            self.volume(i);
          } else if(!self.muted() && !self.inactiveMute()) {
            self.muted(true);
            self.volume(75);
          }
        }
      });
      self.setSlider();
      self.dropdowns();
      self.jtvPlayer = (navigator.appName.indexOf("Microsoft") != -1) ? window[self.flashObject().attr('id')] : document[self.flashObject().attr('id')];
      if(self.jtvPlayer && typeof(self.jtvPlayer.change_volume) === 'function') {
        self.jtvPlayer.change_volume(self.currentVolume());
        self.jtvPlayer.set_quality(self.quality().value);
      }
      self.playing(true);
    };
    var counter = 0;
    var objectTimer = setInterval(function() {
      counter++;
      if (self.jtvPlayer && typeof(self.jtvPlayer.change_volume)) {
        $(window).resize();
      }
      if (counter === 50) {
        clearInterval(objectTimer);
      }
    }, 50);
  };
    this.resize = function(widthAndHeight) {
    if(self.jtvPlayer && typeof(self.jtvPlayer.change_volume) === 'function'){
      self.jtvPlayer.resize_player(widthAndHeight.width, widthAndHeight.height);
    }
  };
  this.currentVolume.subscribe(function(){
    self.setSlider();
    if(self.jtvPlayer && typeof(self.jtvPlayer.change_volume) === 'function') {
      self.jtvPlayer.change_volume(self.currentVolume());
    }
  });
  this.playing.subscribe(function() {
    if(self.jtvPlayer && typeof(self.jtvPlayer.resume_video) === 'function') {
      self.playing() ? self.jtvPlayer.resume_video() : self.jtvPlayer.pause_video();
    }
  });
  this.videoObject.subscribe(function() {
    if(self.jtvPlayer && typeof(self.jtvPlayer.play_live) === 'function') {
      self.jtvPlayer.play_live(self.videoObject().slug);
      self.jtvPlayer.change_volume(self.currentVolume());
    }
  });
  this.quality.subscribe(function(q) {
  if(self.jtvPlayer && typeof(self.jtvPlayer.set_quality) === 'function') {
        self.jtvPlayer.set_quality(self.quality().value);
      }
    });
    this.active.subscribe(function() {
      self.inactiveMute(!self.active());
    });
};