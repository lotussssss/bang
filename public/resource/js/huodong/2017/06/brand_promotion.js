$ (function () {
    // 滚动用户评论的数据
    function rollCommentsList(){
        var $list_inner = $('.comments-list-inner')
        if($list_inner && $list_inner.length){
            var $list_comments_item = $list_inner.find('.row'),
                list_inner_row_height = $list_comments_item.first().height()

            // 大于6条中奖信息才滚滚滚
            if($list_comments_item.length>6){
                (function(){
                    var arg = arguments
                    $list_inner.animate({'top': -list_inner_row_height}, 1200, function(){
                        $list_inner.find('.row').first().appendTo($list_inner)
                        $list_inner.css({'top': 0})

                        setTimeout(arg.callee, 3000)
                    })
                }())
            }

        }
    }

    rollCommentsList()

    //轮播插件初始化
    $('.roundabout_box .roundabout-holder').roundabout({
        duration: 500,
        minScale: 0.7,
        autoplay: true,
        // autoplay: false,
        autoplayDuration: 5000,
        minOpacity: 0,
        maxOpacity: 1,
        reflect: false,
        startingChild: 0,
        autoplayInitialDelay: 2000,
        autoplayPauseOnHover: true,
        // autoplayPauseOnHover: false,
        enableDrag: true,
        childSelector: ".roundabout-moveable-item",
        btnNext: ".btn-next",
        btnPrev: ".btn-prev",
        // 非必要情况，此参数必须设置为false，
        // 避免在IE下当轮播不在窗口内时，轮播的时候页面滚动条会自动弹到轮播的位置
        triggerFocusEvents: false
    })

    $('.roundabout_box').hover(
        function (e) {
            $('.btn-switch').show()
        },
        function () {
            $('.btn-switch').hide()
        })
    // $('.roundabout_box .btn-prev').hover(
    //     function () {
    //         $(this).css('background-image','url(https://p3.ssl.qhmsg.com/t01086805a0b83a4018.png)')
    //     },
    //     function () {
    //         $(this).css('background-image','url(https://p0.ssl.qhmsg.com/t01624e42c2b5e4a1d6.png)')
    //     })
    // $('.roundabout_box .btn-next').hover(
    //     function () {
    //         $(this).css('background-image','url(https://p0.ssl.qhmsg.com/t011f5a197568751f88.png)')
    //     },
    //     function () {
    //         $(this).css('background-image','url(https://p0.ssl.qhmsg.com/t0169c6ce3d7043d873.png)')
    //     })
})