$ (function () {
    $('.trigger-show-video').on('click', function(e){
        e.preventDefault ()

        var html_fn = $.tmpl ($.trim ($ ('#JsVideoPlayerPanelTpl').html ())),
            html_st = html_fn ()

        tcb.showDialog (html_st, {
            className : 'video-player-panel'
        })
    })


});