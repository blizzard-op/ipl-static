(function() {
	if (typeof COMSCORE == "undefined") {
	    window.COMSCORE = {}
	}
	if (typeof COMSCORE.Beacon == "undefined") {
	    COMSCORE.Beacon = {}
	}
	if (typeof _comscore != "object") {
	    window._comscore = []
	}
	COMSCORE.beacon = function (j) {
	    try {
	        if (!j) {
	            return
	        }
	        var h = 2.2,
	            g = j.options || {},
	            u = {
	                doc: g.doc || document,
	                nav: g.nav || navigator,
	                win: g.win || window
	            },
	            b = 512,
	            m = 64,
	            w = "scorecardresearch",
	            n = 2147483647,
	            f = (new Date()).getTime(),
	            t = function (z) {
	                var A = encodeURIComponent || escape;
	                return A(z)
	            },
	            p = function (e, z) {
	                if (z) {
	                    e = e.substr(0, z)
	                }
	                return e
	            },
	            s = function () {
	                return u.doc.location.protocol == "https:"
	            },
	            d = function (e) {
	                return typeof e == "undefined"
	            },
	            o = function (e, z) {
	                if (e == null) {
	                    return ""
	                }
	                return p(t(e), z)
	            },
	            a = function (e, z, B, A) {
	                return z != null && z.toString().length > 0 ? [e, "=", A ? p(z, B) : o(z, B), "&"].join("") : ""
	            },
	            v = function (e) {
	                return Math.round(Math.random() * (e || n))
	            },
	            y = function () {
	                if (+j.c1 != 2) {
	                    return
	                }
	                if (/msie\s[^0-6]|firefox|chrome/i.test(u.nav.userAgent)) {
	                    return
	                }
	                var e = k(w);
	                if (g.fpc_optout) {
	                    if (e) {
	                        q(w, e, u.doc.domain, -1)
	                    }
	                    return "optout"
	                }
	                if (!u.nav.cookieEnabled) {
	                    return "disabled"
	                }
	                if (!e) {
	                    e = (function () {
	                        var D = function (G, F, E) {
	                            F = G && G[F] ? G[F] : "-";
	                            return E ? D(F, E) : F
	                        },
	                            A = [D(u.win, "navigator", "userAgent"), D(u.win, "screen", "width"), D(u.win, "screen", "height"), D(u.doc, "cookie"), D(u.doc, "referrer"), D(u.loc, "href"), D(u.win, "history", "length")].join("-");
	                        var C = 2166136261;
	                        for (var B = 0, z = A.length; B < z; B++) {
	                            C ^= A.charCodeAt(B);
	                            C *= 16777619
	                        }
	                        return [v() ^ C & n, v(), f].join("-")
	                    })();
	                    q(w, e, u.doc.domain);
	                    e = k(w)
	                }
	                return e
	            },
	            k = function (e) {
	                if (d(u.doc.cookie) || d(u.doc.cookie.match)) {
	                    return
	                }
	                var z = u.doc.cookie.match("(?:^|;)\\s*" + e + "=([^;]*)");
	                return z ? z[1] : null
	            },
	            q = function (e, A, z, B) {
	                if (!A) {
	                    return
	                }
	                B = B != null ? B : 730;
	                B *= 86400000;
	                u.doc.cookie = e + "=" + A + "; domain=." + z + "; path=/; expires=" + (new Date(f + B)).toGMTString()
	            },
	            c = function (e) {
	                if (+j.c1 != 2) {
	                    return
	                }
	                if (!e) {
	                    return
	                }
	                if (g.force_script_extension || (e.width == 2 && e.height > v(100))) {
	                    var A = u.doc.createElement("script"),
	                        z = u.doc.getElementsByTagName("script")[0],
	                        B = [l.script_extension_url, "?", a("c2", j.c2)];
	                    B = B.join("").replace(/&$/, "");
	                    if (z) {
	                        A.src = B;
	                        A.async = true;
	                        z.parentNode.insertBefore(A, z)
	                    } else {
	                        u.doc.write(unescape("%3Cscript src='" + B + "'%3E%3C/script%3E"))
	                    }
	                }
	            },
	            l = {
	                beacon_url: (s() ? "https://sb" : "http://b") + ".scorecardresearch.com/",
	                script_extension_url: (s() ? "https" : "http") + "://app.scorecardresearch.com/s2e/invite"
	            };
	        if (g.dest) {
	            l.beacon_url = g.dest.beacon_url || l.beacon_url;
	            l.script_extension_url = g.dest.script_extension_url || l.script_extension_url
	        }
	        var i = [l.beacon_url, "b?", a("c1", j.c1), a("c2", j.c2), a("rn", v()), a("c12", y()), a("c7", (function () {
	            if (g.filter_urls) {
	                return
	            }
	            var e = u.doc.location.href,
	                z = b;
	            if (g.url_append) {
	                z = b - t(["?", g.url_append].join("")).length;
	                e = o(e, z) + t([/\?/.test(e) ? "&" : "?", g.url_append].join(""))
	            } else {
	                e = o(e, b)
	            }
	            return e
	        })(), b, true), a("c3", j.c3), a("c4", j.c4, b), a("c5", j.c5), a("c6", j.c6), a("c10", j.c10), a("c11", j.c11), a("c15", j.c15), a("c16", j.c16), a("c8", u.doc.title, m), a("c9", !g.filter_urls ? u.doc.referrer : "", b), a("cv", h), a("cs", "js"), a("r", j.r, b)];
	        i = i.join("").replace(/&$/, "");
	        i = i.length > 2080 ? i.substr(0, 2075) + "&ct=1" : i;
	        if (/(BlackBerry.*?\/([1-3]\.|4\.[0-5]))|OpenWeb/.test(u.nav.userAgent)) {
	            i = i.replace(/\/b\?/, "/p?");
	            u.doc.write("<img src='" + i + "' />")
	        } else {
	            var x = new Image();
	            x.onload = function () {
	                c(this)
	            };
	            x.onerror = function () {
	                c(this)
	            };
	            x.src = i
	        }
	        if (typeof g.subscribe == "function") {
	            g.subscribe(i)
	        }
	        return i
	    } catch (r) {}
	};
	COMSCORE.purge = function (a) {
	    try {
	        var c = [],
	            f, b;
	        a = a || _comscore;
	        for (b = a.length - 1; b >= 0; b--) {
	            f = COMSCORE.beacon(a[b]);
	            a.splice(b, 1);
	            if (f) {
	                c.push(f)
	            }
	        }
	        return c
	    } catch (d) {}
	};
	COMSCORE.purge();
})();


var comscoreEvent = {
    _comscoreData: {
	   c1:2,                 
	   c2:"3000068",             
	   c3:"",             
	   c4:"http://www.ign.com/ipl",             
	   c5:"",                
	   c6:"",                
	   c15:""
	},
	
	fireVideoAndPageView: function () {
		comscoreEvent.firePageView();
		comscoreEvent.fireVideoView();
	},
	
    firePageView: function () {
        var fireData = this._comscoreData;
        fireData.c1 = 2; // This is a page view
        fireData.c4 = window.location.href;
        COMSCORE.beacon(fireData);
    },

    fireVideoView: function (videoUrl) {
        if (typeof this._comscoreData != 'undefined') {
            var fireData = this._comscoreData;
            fireData.c1 = 1; // This is a video view
            fireData.c4 = videoUrl || window.location.href;
            COMSCORE.beacon(fireData);
        }
    }
}