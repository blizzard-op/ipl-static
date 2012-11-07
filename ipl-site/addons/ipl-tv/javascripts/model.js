var Model = function() {
  this.sideBarVisible = ko.observable(false);
  this.layout = ko.observable("two");
  this.sideBarContent = ko.observable();
  this.liveChannelsJSON = ko.observableArray([]);
  this.calid = ko.observable("1u5m1559a5rlih3tr8jqp4kgac");
  this.chatchannel = ko.observable("ignproleague");
  this.setSideBar = function(id) {
    if (this.sideBarContent() !== id || !this.sideBarVisible()) {
      this.sideBarVisible(true).sideBarContent(id);
    } else {
      this.sideBarVisible(false).sideBarContent(false);
    }
  };
};
viewModel = new Model();
ko.applyBindings(viewModel);

/** click handlers **/
$("#sidebar-controls a:not('.feedback')").on("click", function(evt){
  if (this.className !== "videos"){
    evt.preventDefault();
    viewModel.setSideBar($(this).data("sidebar"));
  }
});
$("#sidebar-controls a.feedback").on("click", function(evt){
  evt.preventDefault();
  UserVoice.showPopupWidget();
});

$("#schedule").on("click", ".calendar", function(evt){
  evt.preventDefault();
  viewModel.calid($(this).data("calid"));
});
$("#chat").on("click", ".chat", function(evt){
  evt.preventDefault();
  viewModel.chatchannel(ko.dataFor(this).name);
});

$("aside").on("webkitTransitionEnd", function(evt){
  //this chunk of code is a work around for chrome not resizing
  //the way I expected after sidebar toggling
  if (!viewModel.sideBarVisible()) {
    if (viewModel.layout() === "one") {
      $("#video-container").width("100%").height("100%").width("initial").height("initial");
    } else if (viewModel.layout() === "stacked") {
      $(".player-wrapper").width("auto").width("initial");
    }
  }
});

viewModel.layout.subscribe(function(newValue){
  // window resize seems to get around chrome not liking to resize players when one switches layouts
  $(window).resize();
});

// adds fade animation to sidebar tabs
ko.bindingHandlers.fadeVisible = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();
        $(element).toggle(ko.utils.unwrapObservable(value));
    },
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        if (ko.utils.unwrapObservable(value)) {
           $(element).fadeIn(null, viewModel.updateChat);
        } else {
           $(element).fadeOut();
        }
    }
};