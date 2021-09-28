!function(){
    window.Bang = window.Bang || {}

    function playVideo($trigger){
        var $TriggerShowVideo = $trigger || $('.trigger-play-video')

        if ($TriggerShowVideo && $TriggerShowVideo.length){
            $TriggerShowVideo.on('click', function(e){
                e.preventDefault()

                var html_fn = $.tmpl($.trim($('#JsMCommonVideoPlayerPanelTpl').html())),
                    html_st = html_fn()

                tcb.showDialog(html_st, {
                    className : 'video-player-panel',
                    withClose : true,
                    middle : true
                })
            })
        }
    }

    window.Bang.playVideo = playVideo
}()