;
!function () {
    var
        rollingInst,

        wxData = {
            "title": "月末清仓日，大牌手机1元秒杀！",
            "desc": "1元秒杀、大额优惠尽在同城帮，还有超低折扣商品等你来拿！",
            "link": window.location.protocol + '//' + window.location.host + window.location.pathname,
            "imgUrl": 'https://p1.ssl.qhmsg.com/t0186fe1273a26dad0f.png',
            "success": tcb.noop, // 用户确认分享的回调
            "cancel": tcb.noop // 用户取消分享
        }

    if (typeof wx !== 'undefined') {
        // 微信分享
        wx.ready(function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage(wxData)
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline(wxData)
            //分享到QQ
            wx.onMenuShareQQ(wxData)
        })
    }
    // 设置支持App分享
    function __appSetShareSupport() {
        // 设置分享的数据
        tcb.js2AppSetShareData(wxData)

        // 设置支持的分享方式，不传任何参数，那么表示支持默认的分享方式
        tcb.js2AppSetShareSupport({
            'onMenuCopyUrl': 0
        })
    }

    __appSetShareSupport()


    $(function () {
        tcb.bindEvent(document.body, {
            // 登录
            '.js-trigger-login': function (e) {
                e.preventDefault()

                showCommonLoginPanel(function () {
                    setTimeout(function () {
                        window.location.reload()
                    }, 100)
                })
            },

            // 领取优惠券
            '.js-trigger-get-coupon': function (e) {
                e.preventDefault()

                var $me = $(this),
                    data_coupon_id = $me.attr('data-coupon-id')

                if ($me.hasClass('btn-to-use')) {
                    return
                }
                $.get('/youpinfulishe/doLuckdrawFuli?fuli_id=' + data_coupon_id, function (res) {
                    res = $.parseJSON(res)
                    if (!res['errno']) {
                        // 领券成功
                        $.dialog.toast('恭喜您，领取成功！', 2000)

                        $me.attr('href', tcb.setUrl(window.__MHOST + 'youpin', window.__PARAMS))
                            .addClass('btn-to-use').removeClass('js-trigger-get-coupon')
                            .html('去使用 >')

                        // $me.closest('.coupon-item').append('<span class="label-got"></span>')
                    } else if (res['errno'] == 10710) {
                        // 未登录
                        showCommonLoginPanel(function () {
                            setTimeout(function () {
                                window.location.reload()
                            }, 10)
                        })
                    } else {
                        $.dialog.toast(res['errmsg'], 2000)
                    }
                })
            }
        })

        // 热销爆款
        window.Bang.renderProductList({
            $tpl: $('#JsMClearanceSaleProductListTpl'),
            $target: $('.js-hot-product-list'),
            request_url: '/youpin/doGetDaShuaiMaiProductList',
            request_params: {
                pn: 0,
                page_size: 20
            },
            list_params: {
                'from_page': 'dashuaimai'
            },
            // col : 3,
            complete: function (result, $target) {
                var $Items = $target.find('.item'),
                    width = $Items.eq(0).width()
                $Items.css({
                    width: width
                })
                $target.css({
                    width: $Items.length * width
                })
            }
        })
        // 超值折扣
        window.Bang.renderProductList({
            $tpl: $('#JsMClearanceSaleProductListTpl'),
            $target: $('.js-discount-product-list'),
            request_url: '/youpin/doGetDaShuaiMaiProductList?orderby_desc=false',
            request_params: {
                pn: 0,
                page_size: 20
            },
            list_params: {
                'from_page': 'dashuaimai'
            },
            // col : 3,
            complete: function (result, $target) {
                var $Items = $target.find('.item'),
                    width = $Items.eq(0).width()
                $Items.css({
                    width: width
                })
                $target.css({
                    width: $Items.length * width
                })
            }
        })
        // 更多优惠
        window.Bang.renderProductList({
            $tpl: $('#JsMRecommendProductListTpl'),
            $target: $('.js-recommend-product-list'),
            request_url: '/youpin/doGetSuggestProductList',
            request_params: {
                pn: 0,
                page_size: 3
            },
            list_params: {
                'from_page': 'fulishe_tuijian'
            },
            col: 1,
            complete: function (result, $target) {
            }
        })


        // 登录
        function showCommonLoginPanel(success_cb) {
            tcb.showCommonLoginPanel({
                action_url: '/youpin/aj_my_login',
                withClose: true,
                success_cb: function (res) {
                    // 登录后的公共操作
                    var mobile = $('.ui-common-login-dialog [name="mobile"]').val()
                    mobile = mobile.substring(0, 3) + '****' + mobile.substring(7)
                    $('.js-trigger-login').html(mobile)

                    success_cb(res)
                }
            })
        }


        var _CurrentTime = window.__NOW || Date.now(),
            _Today = new Date(_CurrentTime),
            // _TargetTime = _CurrentTime + 10 * 1000,
            _TargetTime = Date.parse(_Today.getFullYear() + '/' + (_Today.getMonth() + 1) + '/' + _Today.getDate() + ' ' + window.FULI_FLASH_SALE_START_TIME),
            _Tomorrow = _TargetTime + 2 * 60 * 60 * 1000

        // 1元秒杀
        function setupFlash() {

            if (_CurrentTime < _TargetTime) {
                // 未开始
                startFlashCountdown(_CurrentTime, _TargetTime)
            } else {
                // 已开始
                setupFlashProduct()
            }

            bindFlashEvent()
        }

        // 秒杀开始前处理
        function startFlashCountdown(currentTime, targetTime) {
            var $jsBlockFlashGoodsCountdown = $('.block-flash .js-coupon-countdown').show()
            Bang.startCountdown(targetTime, currentTime, $jsBlockFlashGoodsCountdown, {
                'process': function (curtime) {
                    if (targetTime - curtime < 10000) {
                        if (getLuck()) {
                            return
                        }
                        setLucky(0)
                    }
                },
                'end': function () {
                    $jsBlockFlashGoodsCountdown.hide()
                    setupFlashProduct()
                }
            })
        }

        // 秒杀中处理
        function setupFlashProduct() {
            var luuuuuuck = getLuck(),
                $Items = $('.flash-product-list').children('.item')

            if (!luuuuuuck) {
                setLucky(0)
                luuuuuuck = getLuck()
            }
            if (luuuuuuck == '1') {
                function loop() {
                    $.ajax({
                        type: 'GET',
                        url: '/youpinfulishe/getFlashSaleStatus',
                        dataType: 'json',
                        error: function () {
                            setTimeout(loop, 1000)
                        },
                        success: function (res) {
                            if (res.errno) {
                                return setTimeout(loop, 1000)
                            }
                            var finish = true,
                                result = res.result || {}
                            tcb.each(result, function (k, v) {
                                var $i = $Items.filter(function () {
                                        //return ($(this).data('num') - 1) / 2 == k
                                        return $(this).data('id') == k
                                    })
                                        .data('status', v.flash_status),
                                    $btn = $i.find('.btn')

                                $i.data('num', v.product_id*2+1)

                                if (v.flash_status == 'saling') {
                                    finish = false
                                    $btn.removeClass('btn-disabled').html('去抢购 >')
                                } else {
                                    $btn.addClass('btn-disabled').html('已抢光')
                                }
                            })

                            if (!finish) {
                                setTimeout(loop, 1000)
                            }
                        }
                    })
                }

                loop()
            } else {
                $Items.each(function (el) {
                    var $me = $(this),
                        delay = 400 + Math.random() * 300
                    setTimeout(function () {
                        $me.data('status', 'finish').find('.btn').addClass('btn-disabled').html('已抢光')
                    }, delay)
                })
            }
        }

        function bindFlashEvent() {
            $('.flash-product-list .item').on('click', function (e) {
                e.preventDefault()

                var $me = $(this)
                if ($me.data('status') != 'saling') {
                    return
                }
                window.location.href = tcb.setUrl(window.__MHOST + 'youpin/product/' + (($me.data('num') - 1) / 2) + '.html', window.__PARAMS)
            })
        }

        function getLuck() {
            return $.fn.cookie('luuuuuuck')
        }

        // 选取幸运状态
        function setLucky(precent) {
            // 距开始还有10秒,摇一摇筛选可点进秒杀的用户
            // 0%的用户拥有抢购机会
            var luuuuuuck = roll(precent)
            $.fn.cookie('luuuuuuck', luuuuuuck, {expires: new Date(_Tomorrow)})
        }

        function roll(percent) {
            var chance = '-1'
            if (Math.abs(.5 - Math.random()) * 100 < percent / 2) {
                chance = '1'
            }
            return chance
        }

        setupFlash()

    })

}()