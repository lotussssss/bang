!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        'title': '同城帮中秋国庆节，二手也放价~ 享三期免息，还有700元优惠券待领取！！立戳>>',
        'desc': '二手大放价，金秋专享购！',
        'link': window.location.protocol + '//' + window.location.host + window.location.pathname,
        'imgUrl': 'https://p4.ssl.qhimg.com/t0183138f9e12f31f6d.png',
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
        var __reload = false,
            justify_height = 8,
            clicking_lock = false,
            tabScroller

        tcb.bindEvent(document.body, {
            // 领取红包
            '.js-trigger-get-hongbao ': function (e) {
                e.preventDefault()

                var $me = $(this)

                if ($me.hasClass('hongbao-item-received')) {
                    return
                }

                $.post('/ypdouble/getReadPack', function (res) {
                    if (!res['errno']) {
                        // 提示领取成功
                        $.dialog.toast('恭喜您，领取成功！', 2000)

                        $me.addClass('hongbao-item-received').find('.hongbao-btn').html('已领取')
                        $me.find('.hongbao-numbers .num').html(window.__READ_PACK_NUMBERS + 1)

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

                var $me = $(this)

                if ($me.hasClass('btn-disabled')) {
                    return
                }

                $.post('/ypdouble/getCoupon', function (res) {
                    if (!res['errno']) {
                        // 提示领取成功
                        $.dialog.toast('恭喜您，领取成功！', 2000)

                        $me.addClass('btn-disabled').html('已领取')

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

                clicking_lock = true

                var $me = $(this),
                    target_selector = $me.attr('data-target'),
                    $target = $(target_selector),
                    tab_height = $('.block-product-tab').height(),
                    header_placeholder_height = $('.header-placeholder').height() || 0

                if (!$target.length) return

                activeProductTabItem($me)

                $.scrollTo({
                    endY: Math.ceil($target.offset().top - tab_height - header_placeholder_height - justify_height),
                    callback: function () {
                        setTimeout(function () {
                            clicking_lock = false
                        }, 100)
                    }
                })
            }
        })

        function init() {
            renderFlashProductList()
            startCountdown()
            tabScroller = initScroll({
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

        function isProductTabItemActived($item) {
            return $item.hasClass('tab-item-active')
        }

        function scrollSwitchProductList() {
            var scroll_top = $(window).scrollTop(),
                $block_product_tab = $('.block-product-tab'),
                $tab_container = $block_product_tab.find('.product-tab-container'),
                tab_top = $block_product_tab.offset().top,
                tab_height = $block_product_tab.height(),
                $block_product_list = $('.block-product-list'),
                header_placeholder_height = $('.header-placeholder').height() || 0

            // tab吸顶
            if (scroll_top >= (tab_top - header_placeholder_height)) {
                $tab_container.addClass('fixed').css('top', header_placeholder_height)
            } else {
                $tab_container.removeClass('fixed')
            }

            // 点击tab时不执行滚动页面切换列表对应tab
            if (clicking_lock) {
                return
            }

            // 页面滚动，滚动条所在列表区间对应tab激活
            tcb.each($block_product_list, function (i, item) {
                var $item = $(item),
                    $active_block_product_list_top = Math.ceil($item.offset().top - tab_height - header_placeholder_height - justify_height),
                    $active_block_product_list_bottom = Math.ceil($item.next().height() && $item.next().offset().top - tab_height - header_placeholder_height - justify_height)

                if (scroll_top >= $active_block_product_list_top && scroll_top < $active_block_product_list_bottom) {
                    var $active_tab = $block_product_tab.find('.tab-item').eq(i)
                    if (isProductTabItemActived($active_tab)) {
                        return
                    }
                    activeProductTabItem($active_tab)

                    // 可视的完整tab最多个数
                    var visible_tab_max = Math.floor($(window).width() / $active_tab.width())
                    if (tabScroller) {
                        var inst = tabScroller.getInst()
                        if (i >= visible_tab_max) {
                            inst.scrollTo($active_tab.width() * (i + 1 - visible_tab_max), 0, true)
                        } else {
                            inst.scrollTo(0)
                        }
                    }
                }
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
