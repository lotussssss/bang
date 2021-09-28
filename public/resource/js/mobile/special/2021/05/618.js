!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        'title': '同城帮优品618狂欢节，最高帮你省千元！',
        'desc': '买二手机，上同城帮优品',
        'link': window.location.protocol + '//' + window.location.host + window.location.pathname,
        'imgUrl': 'https://p0.ssl.qhimg.com/t010963c4e7a2e81853.png',
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
            // 领取红包
            '.js-trigger-get-hongbao ': function (e) {
                e.preventDefault()

                var $me = $(this)

                if ($me.hasClass('hongbao-item-received')) {
                    return
                }

                $.post('/yp618/getReadPack', function (res) {
                    if (!res['errno']) {
                        // 提示领取成功
                        $.dialog.toast('恭喜您，领取成功！', 2000)

                        $me.addClass('hongbao-item-received')

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
            },
            // 领取优惠券
            '.js-trigger-get-coupon ': function (e) {
                e.preventDefault()

                var $me = $(this),
                    category_id = $me.attr('data-id')

                if ($me.hasClass('coupon-item-received')) {
                    return
                }

                $.post('/yp618/getCoupon?category_id=' + category_id, function (res) {
                    if (!res['errno']) {
                        // 提示领取成功
                        $.dialog.toast('恭喜您，领取成功！', 2000)

                        $me.addClass('coupon-item-received')
                        $me.find('.coupon-btn').html('已领取')

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
            },
            // 点击切换商品专区tab
            '.product-tab-list .tab-item': function (e) {
                e.preventDefault()

                var $me = $(this),
                    target_selector = $me.attr('data-target'),
                    $target = $(target_selector),
                    tab_height = $('.block-product-tab').height()
                if (!$target.length) return

                activeProductTabItem($me)

                $.scrollTo({
                    endY: $target.offset().top - tab_height - 8,
                    callback: function () {
                        // clicking_lock = false
                    }
                })
            }
        })

        function init() {
            renderFlashProductList()
            startCountdown()
            initScroll({
                $container: $('.product-tab-container'),
                item_class: '.tab-item'
            })
            $(window).on('load scroll', scrollSwitchProductList)
            setTimeout(scrollSwitchProductList, 400)
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

        // 切换商品专区tab
        function activeProductTabItem($item) {
            $item.addClass('tab-item-active')
                .siblings('.tab-item-active').removeClass('tab-item-active')
        }

        function scrollSwitchProductList() {
            var scroll_top = $(window).scrollTop(),
                $block_product_tab = $('.block-product-tab'),
                $tab_container = $block_product_tab.find('.product-tab-container'),
                tab_top = $block_product_tab.offset().top

            if (tab_top <= scroll_top) {
                $tab_container.addClass('fixed')
            } else {
                $tab_container.removeClass('fixed')
            }
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

            if ($container && $container.length > 0) {

                var $containerInner = $container.find('.container-inner'),
                    $item = $container.find(options.item_class)

                tcb.lazyLoadImg(0, $container)  // 图片lazy

                var scroller = new ScrollFactory({
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
