Dom.ready(function(){

    $('.touble-sup li').on('mouseenter',function () {
        var $me = $(this)
        $me.addClass('cur').siblings('.cur').removeClass('cur')
        var $index = $me.index()
        var $touble_subs = $('.touble-sub li')
        $touble_subs.removeClass('cur')
        $touble_subs.eq($index).addClass('cur')
    })
    $('.touble-sub  a').on('mouseenter',function (e) {
        e.preventDefault()
        $(this).addClass('hover')
    }).on('mouseleave',function (e) {
        $(this).removeClass('hover')
    })

})