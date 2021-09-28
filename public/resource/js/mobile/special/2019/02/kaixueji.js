;
!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "开学季，换新机，装备大升级！",
        "desc": "全场手机2折起，聪明花钱就在同城帮！",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
        "imgUrl": 'https://p2.ssl.qhimg.com/t012ac7b34c62b5d7cd.png',
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

                $.get('/youpin/doGetActivityCouponCode?activity_id=6&coupon_code='+coupon_code, function (res) {
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
            $tpl : $('#JsMKaixuejiProductListTpl'),
            $target : $('.block-zheshangzhe-product .ui-sp-product-list-1'),
            request_url : '/youpin/aj_get_goods',
            request_params : {
                pn : 0,
                page_size: 4,
                search_type: 1,
                is_fold_up_index: 2
            },
            // list_key: 'bao',
            list_params: window.__PARAMS,
            col : 2,
            complete: function(result, $target){}
        })
    })
} ()
