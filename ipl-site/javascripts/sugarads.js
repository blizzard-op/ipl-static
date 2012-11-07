SugarAds = {
    adDivCssClassName: "sugarad",
    adDivIdPrefix: "sugarad-",
    adIframeIdSuffix: "-iframe",
    adDivWidthAttrib: "data-sugar-ad_width",
    adDivHeightAttrib: "data-sugar-ad_height",
    analytics: false,
    fifurl: "/sugarfif.html?9",
    urlRandLength: 12,
    urlRandNum: 0,
    adsData: {},
    adCreatives: {},
    adJsUrls: {},
    stitialOverlayId: "sugarad-stitial-overlay",
    stitialHtmlElementClass: "sugarad-stitial-open",
    stitialTimeout: 10000,
    stitialAdType: false,
    adServer: "ignadwrapper",
    adServers: {
        ignadwrapper: {
            getUrl: function (b, k) {
                var f = b.adsData;
                var a = "http://wrapper.ign.com/services/ads/pagetype/" + f.pagetype + "/sizes/" + k.toString() + ".js?callback=?";
                var e = document.location;
                if (e.search.indexOf("special") != -1) {
                    var l = e.search.substr(1).split("&");
                    for (var g = 0, h = l.length; g < h; g++) {
                        if (l[g].indexOf("special") != -1) {
                            a += "&" + l[g]
                        }
                    }
                }
                for (var d in f) {
                    if (d == "pagetype") {
                        continue
                    }
                    var c = f[d];
                    if (b._isArray(c)) {
                        for (var g = 0, h = c.length; g < h; g++) {
                            a += "&" + d + "=" + encodeURIComponent(c[g])
                        }
                    } else {
                        a += "&" + d + "=" + encodeURIComponent(c)
                    }
                }
                var j = document.referrer;
                if (j != "") {
                    a += "&r=" + encodeURIComponent(j)
                }
                return a
            },
            jsonpCallback: function (a, b) {
                return function (f) {
                    var d = "prestitial";
                    for (var e = 0, c = f.length; e < c; e++) {
                        if (f[e].size.substr(-7) == "stitial") {
                            if (f[e].impressionTracker == false) {
                                a.stitialAdType = d;
                                a.adCreatives[d] = f[e].creative
                            } else {
                                a.adCreatives[d] = ""
                            }
                        } else {
                            a.adCreatives[f[e].size] = f[e].creative
                        }
                    }
                    a._fetchAdsCallback(b)
                }
            }
        },
        dfp: {
            getUrl: function (b, a) {
                return "http://example.com/ads/" + b.toString() + ".jsonp"
            },
            jsonpCallback: function (a, b) {
                return function (c) {}
            }
        }
    },
    renderAds: function (a) {
        if (typeof a == "string") {
            a = new Array(a)
        }
        if (this.adServer != false) {
            this._renderAdCreatives(a)
        } else {
            this._renderAdJsUrls(a)
        }
    },
    showStitial: function () {
        var b = document.getElementsByTagName("html")[0];
        var a = document.getElementById(this.stitialOverlayId);
        b.className = this.stitialHtmlElementClass;
        a.style.display = "block";
        this.stitialSetTimeout = setTimeout((function (c) {
            return function () {
                c.hideStitial()
            }
        })(this), this.stitialTimeout)
    },
    hideStitial: function () {
        clearTimeout(this.stitialSetTimeout);
        var b = document.getElementsByTagName("html")[0];
        var a = document.getElementById(this.stitialOverlayId);
        b.className = "";
        a.style.display = "none";
        this.renderAdsDelayedByStitial()
    },
    renderAdsDelayedByStitial: function () {},
    setFifDim: function (c, a, b) {
        if (typeof a == "number") {
            c.fifwidth = a
        }
        if (typeof b == "number") {
            c.fifheight = b
        }
    },
    fifOnload: function (b) {
        var a = new Date().getTime();
        if (this.analytics) {
            _gaq.push(["_trackEvent", "Sugar Ads", b.frameElement.adtype, b.frameElement.adjsurl, a - b.sugarTimerStart])
        }
        this._stylizeAdContainer(b)
    },
    _stylizeAdContainer: function (b) {
        var a = b.frameElement;
        if (a.fifwidth == 0 && a.fifheight == 0 && a.parentNode.style.display != "none") {
            a.parentNode.style.display = "none"
        } else {
            a.style.cssText += ";width:" + a.fifwidth + "px;height:" + a.fifheight + "px;";
            a.parentNode.style.cssText = "width:" + a.fifwidth + "px;height:auto;display:block;"
        }
    },
    _flushAndPlaceAds: function (d) {
        for (var c = 0, a = d.length; c < a; c++) {
            var b = d[c];
            if (this.adServer == false && !(b in this.adJsUrls)) {
                this._warn('Failed to render sugar ad. No ad js url has been defined for ad type "' + b + '".');
                continue
            }
            if (this.adServer != false && !(b in this.adCreatives)) {
                this._warn('Failed to render sugar ad. No ad creative has been defined for ad type "' + b + '".');
                continue
            }
            this._createAndAppendFriendlyIframe(b)
        }
    },
    _createAndAppendFriendlyIframe: function (b) {
        var d = this.adDivIdPrefix + b;
        var f = document.getElementById(d);
        if (typeof f == "undefined" || f == null) {
            this._warn('Failed to render sugar ad. No dom element with id "' + d + '" exists.');
            return false
        }
        var e = document.getElementById(d + this.adIframeIdSuffix);
        if (typeof e != "undefined" && e != null && typeof e.fifheight != "undefined" && e.fifheight != null) {
            f.style.height = e.fifheight + "px"
        }
        f.innerHTML = "";
        if (this.adServer != false && this.adCreatives[b] == "") {
            delete this.adCreatives[b];
            return
        }
        var a = d + this.adIframeIdSuffix;
        var c = document.createElement("iframe");
        c.id = a;
        c.name = a;
        c.src = this.fifurl;
        c.style.border = "0px";
        c.width = 0;
        c.height = 0;
        c.scrolling = "no";
        c.seamless = "seamless";
        c.fifwidth = f.getAttribute(this.adDivWidthAttrib);
        c.fifheight = f.getAttribute(this.adDivHeightAttrib);
        c.adtype = b;
        if (this.adServer != false) {
            c.adcreative = this.adCreatives[b];
            delete this.adCreatives[b]
        } else {
            c.adjsurl = this.adJsUrls[b]
        }
        if (navigator.userAgent.indexOf("MSIE") != -1) {
            c.frameBorder = "0";
            c.allowTransparency = "true"
        }
        f.appendChild(c)
    },
    _renderAdCreatives: function (d) {
        var c = [];
        for (var b = 0, a = d.length; b < a; b++) {
            if (!(d[b] in this.adCreatives)) {
                c.push(d[b])
            }
        }
        if (c.length > 0) {
            this._jsonp(this.adServers[this.adServer].getUrl(this, c), this.adServers[this.adServer].jsonpCallback(this, d))
        } else {
            this._fetchAdsCallback(d)
        }
    },
    _renderAdJsUrls: function (a) {
        this._randomizeAdJsUrls();
        this._flushAndPlaceAds(a)
    },
    _fetchAdsCallback: function (e) {
        if (this.stitialAdType != false) {
            var d = [];
            for (var c = 0, b = e.length; c < b; c++) {
                var a = e[c];
                if (a != this.stitialAdType) {
                    d.push(a)
                }
            }
            this.renderAdsDelayedByStitial = (function (f) {
                return function () {
                    f._flushAndPlaceAds(d)
                }
            })(this);
            this._flushAndPlaceAds([this.stitialAdType]);
            this.stitialAdType = false;
            this.showStitial()
        } else {
            this._flushAndPlaceAds(e)
        }
    },
    _randomizeAdJsUrls: function () {
        if (this.urlRandNum == 0) {
            this.urlRandNum = Math.floor(Math.random() * Math.pow(10, this.urlRandLength))
        } else {
            this.urlRandNum++
        }
        var e = "sugar-rand";
        var d = e + "=" + this.urlRandNum;
        var c = new RegExp(e + "=\\d{" + this.urlRandLength + "}", "g");
        for (adType in this.adJsUrls) {
            var f = this.adJsUrls[adType];
            var b = f.match(c);
            if (b != null) {
                this.adJsUrls[adType] = f.replace(b[0], d)
            } else {
                var a = f.search(/\?/);
                if (a != -1) {
                    this.adJsUrls[adType] = f.replace("?", "?" + d + "&")
                } else {
                    this.adJsUrls[adType] = f.replace(/&*$/, "&" + d)
                }
            }
        }
    },
    _jsonp: function (b, d) {
        if (b.indexOf("=?") == -1) {
            this._warn("The sugar jsonp url must specify the callback function in the query string i.e. callback=?");
            return
        }
        if (typeof d != "function") {
            this._warn("The sugar jsonp callback must be a function");
            return
        }
        var a = "jsonp" + Math.floor(Math.random() * 10000000000);
        window[a] = function (f) {
            d(f);
            try {
                delete window[a]
            } catch (g) {
                window[a] = undefined
            }
        };
        var c = document.createElement("script");
        c.src = b.split("=?").join("=" + a);
        document.getElementsByTagName("head")[0].appendChild(c)
    },
    _isArray: function (a) {
        return Object.prototype.toString.call(a) === "[object Array]"
    },
    _warn: function (a) {
        if (window.console && console.warn) {
            console.warn(a)
        }
    }
};