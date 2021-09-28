;
!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "升级装备不加钱，今晚吃鸡更刺激",
        "desc": "专业吃鸡设备，底价，品质优选！",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
        "imgUrl": 'https://p3.ssl.qhmsg.com/t011d5bbf85597bfeda.png',
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
        tcb.bindEvent(document.body, {
            // 领取优惠券
            '.js-trigger-get-coupon ':function (e) {
                e.preventDefault()

                var $me = $(this),
                    coupon_code = $me.attr('data-coupon-code')

                if($me.hasClass('btn-disabled')){
                    return
                }

                $.get('/youpin/doGetCouponCode?coupon_id=3&coupon_code='+coupon_code, function (res) {
                    res = $.parseJSON(res)
                    if (!res['errno']) {
                        // 提示领券成功
                        $.dialog.toast('恭喜您，领取成功！', 2000)

                        $me.css('background-image','https://p0.ssl.qhmsg.com/t01101cc28a1075134a.png').addClass('btn-disabled')
                    }else if (res['errno'] == 108) {
                        // 未登录
                        showCommonLoginPanel(function () {
                            setTimeout(function () {
                                window.location.reload()
                            }, 10)
                        })
                    }else{
                        $.dialog.toast(res['errmsg'], 2000)
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
    })
} ()