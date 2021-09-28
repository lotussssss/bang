;(function () {


    var Bang = window.Bang || {}
    tcb.bindEvent({
        '.js-trigger-share': function (e) {
            e.preventDefault()
            // 触发显示分享引导
            Bang.ShareIntro.active({
                img : 'https://p.ssl.qhimg.com/t01c5d992454e4a99d1.png',
                ext_html: '<div style="position: absolute;top: .2rem;left: 1rem;font-size: .14rem;text-align: center;color: #fff;">点击分享，<br/>请好友帮您赢礼包</div>'
            })
        },
        '.js-trigger-show-coupon': function (e) {
            e.preventDefault()
            var str = '<div><a href="#" class="js-trigger-close-coupon-dialog close-coupon"></a></div>'
            tcb.showDialog(str,{
                'className': 'coupon-dialog',
                'withClose': true,
                'middle': true
            })
        },
        '.js-trigger-close-coupon-dialog': function (e) {
            e.preventDefault()
            tcb.closeDialog($('.coupon-dialog'))
        }
    })

    lazyLoadBg ({
        delay    : 1,
        interval : 1
    })

    getLotteryTopList()


    function lazyLoadBg(options, $target) {
        if (typeof options==='number') {
            options = {
                'delay': options
            }
        }
        options = options || {}

        options = $.extend({
            'delay': 1,
            'interval': 0 // 0:同时显示，其他时间表示实际时间间隔
        }, options)

        var delay = options['delay'] || 1, // 毫秒
            interval = options['interval'] || 0 // 图片加载顺序间隔

        var _time = 0;
        setTimeout(function(){

            var $els
            if ($target && $target.length){
                var $target_el = $target.filter(function(i){
                    return $(this).attr('data-lazybg')
                })
                if ($target_el && $target_el.length){
                    if ($target_el.length===$target.length){
                        $els = $target_el;
                    } else {
                        $els = $target.find('[data-lazybg]').filter(function(i){
                            return $(this).attr('data-lazybg')
                        }).concat($target_el)
                    }
                } else {
                    $els = $target.find('[data-lazybg]').filter(function(i){
                        return $(this).attr('data-lazybg')
                    })
                }
            } else {
                $els = $('[data-lazybg]').filter(function(i){
                    return $(this).attr('data-lazybg')
                })
            }

            $els.each(function(i, el){
                var $el = $(el),
                    src = $el.attr('data-lazybg')

                if (tcb.isRealUrl(src)) {
                    if (interval) {
                        setTimeout(function(){

                            $el.css({
                                'opacity': 0,
                                'background': 'transparent url('+src+') no-repeat center 0',
                                'background-size' : 'cover'
                            })
                            $el.removeAttr('data-lazybg')
                            $el.animate({
                                'opacity': 1
                            }, interval)

                        }, _time)

                        _time += interval
                    } else {

                        $el.css({
                            'opacity': 0,
                            'background': 'transparent url('+src+') no-repeat center 0',
                            'background-size' : 'cover'
                        })
                        $el.removeAttr('data-lazybg')
                        $el.animate({
                            'opacity': 1
                        }, 300)
                    }
                }
            })

        }, delay)
    }
    // 获取中奖列表信息
    function getLotteryTopList(){

        var
            html_st = ''

        for(var i=0;i<_phone_list.length;i++){
            html_st += '<div class="item">他们已领取：'+_phone_list[i]+'成功获得409元大礼包</div>'
        }

        var
            $list = $('.js-block-reward-list'),
            $inner = $list.find('.inner')

        $inner.html(html_st)

        var
            h = $inner.find('.item').eq(0).height()

        setTimeout(function(){
            var arg = arguments;
            $inner.animate({'top': -h}, 800, function(){
                $inner.find('.item').eq(0).appendTo($inner)

                $inner.css({'top': 0})

                setTimeout(arg.callee, 2000)
            })
        }, 2000)
    }
})()