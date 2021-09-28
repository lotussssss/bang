;
!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "1212年终大促",
        "desc": "优品红包大放送，海量手机低价抢购！",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
        "imgUrl": 'https://p5.ssl.qhimg.com/t01a24e62d6dcd0dd28.png',
        "success": tcb.noop, // 用户确认分享的回调
        "cancel": tcb.noop // 用户取消分享
    }

    if (typeof wx !== 'undefined') {
        wx.ready(function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage(wxData)
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline(wxData)
            //分享到QQ
            wx.onMenuShareQQ(wxData)
            //分享到QZone
            wx.onMenuShareQZone(wxData)
        })
    }

    $(function () {
        var __reload = false

        tcb.bindEvent(document.body, {
            // 领取优惠券
            '.js-trigger-get-coupon ':function (e) {
                e.preventDefault()

                var $me = $(this),
                    coupon_code = $me.attr('data-coupon-code')

                if($me.hasClass('coupon-item-received')){
                    return
                }

                $.get('/youpin/doGetDoubleElevenCouponCode?activity_id=5&coupon_code='+coupon_code, function (res) {
                    if (!res['errno']) {
                        // 提示领券成功
                        alert('恭喜您，领取成功！')

                        $me.addClass('coupon-item-received')
                        $me.append('<div class="coupon-cover"></div>')

                        if (__reload){
                            setTimeout(function () {
                                window.location.reload()
                            }, 300)
                        }
                    }else if (res['errno'] == 108) {
                        // 未登录
                        showCommonLoginPanel(function () {
                            setTimeout(function () {
                                __reload = true

                                tcb.closeDialog()
                                $me.trigger('click')
                            }, 10)
                        })
                    }else{
                        alert(res['errmsg'])

                        setTimeout(function () {
                            window.location.reload()
                        }, 300)
                    }
                })
            },
            // 领取神券
            '.js-trigger-get-shenquan ':function (e) {
                e.preventDefault()

                var $me = $(this),
                    coupon_code = $me.attr('data-shenquan-code')

                if($me.hasClass('shenquan-item-received')){
                    return
                }

                $.get('/youpin/doGetDoubleElevenCouponCode?activity_id=5&coupon_code='+coupon_code, function (res) {
                    if (!res['errno']) {
                        // 提示领券成功
                        alert('恭喜您，领取成功！')

                        $me.addClass('shenquan-item-received')
                        $me.append('<div class="shenquan-cover"></div>')

                        if (__reload){
                            setTimeout(function () {
                                window.location.reload()
                            }, 300)
                        }
                    }else if (res['errno'] == 108) {
                        // 未登录
                        showCommonLoginPanel(function () {
                            setTimeout(function () {
                                __reload = true

                                tcb.closeDialog()
                                $me.trigger('click')
                            }, 10)
                        })
                    }else{
                        alert(res['errmsg'])

                        setTimeout(function () {
                            window.location.reload()
                        }, 300)
                    }
                })
            },
            // 领取红包
            '.js-trigger-get-hongbao ':function (e) {
                e.preventDefault()

                var $me = $(this),
                    redpacket_id = $me.attr('data-hongbao-code')

                if($me.hasClass('hongbao-item-received')){
                    return
                }

                $.get('/youpin/doReceiveDoubleRedPacketCode?activity_id=5&redpacket_id='+redpacket_id, function (res) {
                    if (!res['errno']) {
                        // 提示领券成功
                        alert('恭喜您，领取成功！')

                        $me.addClass('hongbao-item-received')
                        $me.append('<div class="hongbao-cover"></div>')

                        if (__reload){
                            setTimeout(function () {
                                window.location.reload()
                            }, 300)
                        }
                    }else if (res['errno'] == 108) {
                        // 未登录
                        showCommonLoginPanel(function () {
                            setTimeout(function () {
                                __reload = true

                                tcb.closeDialog()
                                $me.trigger('click')
                            }, 10)
                        })
                    }else{
                        alert(res['errmsg'])

                        setTimeout(function () {
                            window.location.reload()
                        }, 300)
                    }
                })
            },
            '.brand-tab-list .tab-item':function (e) {
                e.preventDefault()

                var $me = $(this),
                    brand_id = $me.attr('data-brand-id')

                $me.addClass('cur').siblings('a').removeClass('cur')

                // 输出商品列表
                window.Bang.renderProductList({
                    $tpl : $('#JsMShuang12ProductListTpl'),
                    $target : $('.block-shuang12-product .ui-sp-product-list-1'),
                    request_url : '/youpin/aj_get_goods',
                    request_params : {
                        pn : 0,
                        page_size: 8,
                        brand_id:brand_id
                    },
                    list_params: window.__PARAMS,
                    col : 2,
                    complete: function(result, $target){}
                })
            }
        })

        // 登录
        function showCommonLoginPanel(success_cb) {
            tcb.showCommonLoginPanel({
                // action_url : '/youpin/aj_my_login',
                withClose : true,
                success_cb:success_cb
            })
        }

        // 输出商品列表
        window.Bang.renderProductList({
            $tpl : $('#JsMBaokuanProductListTpl'),
            $target : $('.block-baokuan .ui-sp-product-list-1'),
            request_url : '/huodong/doYpBuyDay',
            request_params : {
                pn : 0,
                page_size: 4
            },
            list_key: 'bao',
            list_params: window.__PARAMS,
            col : 2,
            complete: function(result, $target){}
        })

        // 秒杀商品倒计时
        function startCountdown() {
            var $target = $('.block-flash .js-countdown'),
                currentTime = window.CURRENT_TIME || Date.now(),
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

        // 神券倒计时
        function startShenquanCountdown() {
            var $target = $('.block-shenquan .js-countdown-shenquan'),
                currentTime = window.CURRENT_TIME || Date.now(),
                dateObj = new Date(currentTime),
                targetTime

            // 每个整点前十分钟可领取
            if(dateObj.getMinutes()>=10){
                targetTime = (new Date(dateObj.getFullYear(),dateObj.getMonth(),dateObj.getDate(), dateObj.getHours()+1,0,0)).getTime()
            }else{
                targetTime = (new Date(dateObj.getFullYear(),dateObj.getMonth(),dateObj.getDate(), dateObj.getHours(),10,0)).getTime()
            }

            Bang.startCountdown(targetTime, currentTime, $target,{
                'end':function () {
                    setTimeout(function () {
                        window.location.reload()
                    }, 300)
                }
            })
        }

        function init() {
            $('.brand-tab-list .tab-item').first().trigger('click')
            startCountdown()
            startShenquanCountdown()
        }
        init()
    })
} ()