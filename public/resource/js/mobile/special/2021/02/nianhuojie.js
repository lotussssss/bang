!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        'title': '年货节 - 牛气冲天，"机"来运转',
        'desc': '年货节狂欢大优惠，机不可失，买到就是赚到',
        'link': window.location.protocol + '//' + window.location.host + window.location.pathname,
        'imgUrl': 'https://p0.ssl.qhimg.com/t01bae803b5962ae2ac.png',
        'success': tcb.noop, // 用户确认分享的回调
        'cancel': tcb.noop // 用户取消分享
    }

    if (typeof wx !== 'undefined') {
        wx.ready(function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage && wx.onMenuShareAppMessage(wxData)
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline && wx.onMenuShareTimeline(wxData)
            //分享到QQ
            wx.onMenuShareQQ && wx.onMenuShareQQ(wxData)
            //分享到QZone
            wx.onMenuShareQZone && wx.onMenuShareQZone(wxData)

            wx.updateAppMessageShareData && wx.updateAppMessageShareData(wxData)
            wx.updateTimelineShareData && wx.updateTimelineShareData(wxData)
        })
    }

    $(function () {
        var __reload = false

        tcb.bindEvent(document.body, {
            // 领取优惠券
            '.js-trigger-get-coupon ': function (e) {
                e.preventDefault()

                var $me = $(this),
                    category_id = $me.attr('data-id')

                if ($me.hasClass('coupon-item-received')) {
                    return
                }

                $.post('/happynewyear/collectCoupons?type=single&category_id=' + category_id, function (res) {
                    if (!res['errno']) {
                        // 提示领取成功
                        $.dialog.toast('恭喜您，领取成功！', 2000)

                        $me.removeClass('js-trigger-get-coupon')
                        // $me.addClass('coupon-item-received')
                        $me.find('.coupon-btn').html('<i>去</i><i>使</i><i>用</i>')
                        $me.attr('href',tcb.setUrl(window.__MHOST2+'/youpin', window.__PARAMS))

                        if (__reload) {
                            setTimeout(function () {
                                window.location.reload()
                            }, 2000)
                        }
                    } else if (res['errno'] == 108) {
                        // 未登录
                        showCommonLoginPanel(function () {
                            setTimeout(function () {
                                __reload = true

                                tcb.closeDialog()
                                $me.trigger('click')
                            }, 10)
                        })
                    } else {
                        $.dialog.toast(res['errmsg'], 2000)

                        setTimeout(function () {
                            window.location.reload()
                        }, 2000)
                    }
                })
            }
        })

        function init() {
            renderFlashProductList()
            startCountdown()
        }

        init()

        // 登录
        function showCommonLoginPanel(success_cb) {
            tcb.showCommonLoginPanel({
                // action_url : '/youpin/aj_my_login',
                withClose: true,
                success_cb: success_cb
            })
        }

        // 输出秒杀商品数据
        function renderFlashProductList() {
            $.get('/youpin/doGetFlashSaleGoods', function (res) {
                if (!res.errno) {
                    var flash_list = res.result.flash_list || []
                    if (flash_list && flash_list.length > 0) {
                        var tmpl_fn = $.tmpl($.trim($('#JsMYoupinFlashProductListTpl').html())),
                            tmpl_str = tmpl_fn({
                                'flash_list': flash_list,
                                'params': window.__PARAMS
                            })

                        $('.flash-product-list').html(tmpl_str)

                        initScroll({
                            $container: $('.flash-container'),
                            item_class: '.p-item',
                            item_margin: '0.05',
                            inner_padding: '.1'
                        })
                    } else {
                        $('.block-flash-product').hide()
                    }
                }
            })
        }

        function initScroll(options) {
            var Root = tcb.getRoot(),
                ScrollFactory = Root.ScrollFactory,
                $container = options.$container,
                item_margin = options.item_margin || 0,
                inner_padding = options.inner_padding || 0

            var scroller

            if ($container && $container.length > 0) {

                var $containerInner = $container.find('.container-inner'),
                    $item = $container.find(options.item_class)

                tcb.lazyLoadImg(0, $container)  // 图片lazy

                scroller = new ScrollFactory({
                    $Container: $container,
                    $Inner: $containerInner,
                    options: {
                        scrollingX: true,
                        scrollingY: false
                    }
                })

                // 重置$containerInner宽度
                function resize() {
                    var inner_width = 0 // $containerInner 宽度
                    var html_font_size = (window.innerWidth > 720 ? 720 : window.innerWidth) * 100 / 320
                    tcb.each($item, function (i, item) {
                        var $item = $(item)
                        // item间margin
                        inner_width += $item.width() + item_margin * html_font_size
                    })
                    // 外部元素的padding
                    inner_width += inner_padding * html_font_size
                    $containerInner.css({
                        width: inner_width + 2 + 'px'//加2px避免rem计算有误差导致宽度不够
                    })
                    scroller.setDimensions()
                }

                resize()

            }
            return scroller
        }

        // 倒计时
        function startCountdown() {
            var $target = $('.block-flash-product .js-flash-countdown'),
                currentTime = Date.parse(window.curtime ? window.curtime.replace(/-/g, '/') : '') || Date.now(),
                NextDate = new Date(currentTime + 86400000),
                targetTime = (new Date(NextDate.getFullYear(), NextDate.getMonth(), NextDate.getDate())).getTime()

            function loopCountdown(tTime, cTime, $el) {
                Bang.startCountdown(tTime, cTime, $el, {
                    'end': function () {
                        cTime = tTime
                        tTime = cTime + 86400000

                        loopCountdown(tTime, cTime, $el)
                    }
                })
            }

            loopCountdown(targetTime, currentTime, $target)
        }
    })
}()
