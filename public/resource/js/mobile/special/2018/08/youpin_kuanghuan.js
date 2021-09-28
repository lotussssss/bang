;
!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "优品狂欢购物节",
        "desc": "优品手机1折起，怎么算都划算！1元iPhone，等你来抢！",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
        "imgUrl": 'https://p3.ssl.qhmsg.com/t01a29da055d79ea0c6.png',
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

                if($me.hasClass('coupon-item-disabled')){
                    return
                }

                $.get('/youpin/doGetCouponCode?coupon_id=4&coupon_code='+coupon_code, function (res) {
                    // res = $.parseJSON(res)
                    if (!res['errno']) {
                        // 提示领券成功
                        alert('恭喜您，领取成功！')

                        $me.addClass('coupon-item-disabled').find('.coupon-btn').html('已<br>领<br>取')

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

                                $me.trigger('click')
                            }, 10)
                        })
                    }else{
                        alert(res['errmsg'])
                    }
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
        window.Bang.renderProductList({
            $tpl : $('#JsMYouxuanProductListTpl'),
            $target : $('.block-youxuan .ui-sp-product-list-1'),
            request_url : '/huodong/doYpBuyDay',
            request_params : {
                pn : 0,
                page_size: 4
            },
            list_key: 'yx',
            list_params: window.__PARAMS,
            col : 2,
            complete: function(result, $target){}
        })
        window.Bang.renderProductList({
            $tpl : $('#JsMRecommendProductListTpl'),
            $target : $('.block-recommend .ui-sp-product-list-1'),
            request_url : '/youpin/aj_get_goods',
            request_params : {
                pn : 0,
                page_size: 8
            },
            list_params: window.__PARAMS,
            col : 2,
            complete: function(result, $target){}
        })
    })
} ()