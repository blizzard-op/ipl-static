disqus = {
    loadComments: function(id, title) {
        var secretkey = "sH4xuhCxZrVtZenGKO63mvAuRkJh5E6E0iSMscX4gtzQtGDhAICx00ORR4AbIxE7",
            publickey = "qP0lafw6mQbGwz39GrlmCOcxGwEG5orTtxa8X1aznoAjlzAOAVgKKckIggbdVulm";
        var req = $.ajax({
            url: "http://widgets.ign.com/disqus/comment/comment/ign-proleague/" + id + ".jsonp?secretkey=" + secretkey + "&publickey=" + publickey + "&url=" + document.location + "&title=" + title,
            dataType: 'jsonp',
            cache: true,
            jsonpCallback: 'getCachedComments'
        });
        req.success(function(data){
            $("#disqus_thread").append(data);
        });
        req.fail(function(a, b, c){
            console.log(a, b, c);
        });
    }
};