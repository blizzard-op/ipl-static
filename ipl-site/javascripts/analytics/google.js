var googleAnalyticsEvent = {

    recordOutboundLink: function (e, link) {
        var url = link.href;
        // If the domains names are different, it assumes it is an external link
        // Be careful with this if you use subdomains
        if ( (url == "http://www.ign.com/") || (link.host != window.location.host)) {
            if (_gaq) {
                _gaq.push(['_trackEvent', 'Outbound Links', link.host, url]);
            }
            // Checks to see if the ctrl or command key is held down
            // which could indicate the link is being opened in a new tab
            if (e.metaKey || e.ctrlKey) {
                var newtab = true;
            }
            // If it is not a new tab, we need to delay the loading
            // of the new link for a just a second in order to give the
            // Google track event time to fully fire
            if (!newtab) {
                e.preventDefault();
                setTimeout('document.location = "' + url + '"', 100);
            }
        }
    }

};