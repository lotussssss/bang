!function(){
    // 确保回收首页才执行
    if (window.__PAGE !== 'zhimacredit-index') {
        return
    }

    var SwipeSection = window.Bang.SwipeSection
    $(function () {
        var $win = tcb.getWin(),
            $blockTopBanner = $('.block-top-banner')
        $win.on('scroll load', function(e){
            var scroll_top = $win.scrollTop()

            if (scroll_top){
                $blockTopBanner.animate({
                    'background-color' : '#6c9'
                })
            } else {
                $blockTopBanner.css('background-color', '')
            }
        })

        $('.btn-show-zhimacredit-intro').on('click', function(e){
            e.preventDefault()

            var html_fn = $.tmpl( $.trim($('#JsMZhimaCreditHSCreditFAQTpl').html())),
                html_st = html_fn()

            SwipeSection.getSwipeSection('.swipe-section-block-long-text-help')
            SwipeSection.fillSwipeSection(html_st)
            setTimeout(function(){

                SwipeSection.doLeftSwipeSection(0, function(){})

            }, 1)
        })
    })
}()
