;
!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "春节购机送大礼啦！",
        "desc": "同城帮优品春节不打烊，更有好礼相送，快来领取您的专属春节礼包吧！",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
        "imgUrl": 'https://p0.ssl.qhmsg.com/t0139bb0747c015d574.png',
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
            // 抢神券
            '.js-trigger-get-coupon ':function (e) {
                e.preventDefault()

                var $me = $(this),
                    data_coupon_amount = $me.attr('data-coupon-amount')

                $.get('/youpin/doGetCouponCode?coupon_id=1&coupon_code='+data_coupon_amount, function (res) {
                    res = $.parseJSON(res)
                    if (!res['errno']) {
                        // 显示领券成功面板
                        showcouponPanel('恭喜您，领取成功！')
                    }else if (res['errno'] == 734){
                        // 显示已领券面板
                        showcouponPanel('您已领取')
                    }else if (res['errno'] == 108) {
                        // 未登录
                        mobileLogin($me)
                    }else{
                        $.dialog.toast(res['errmsg'], 2000)
                    }
                })
            }
        })

        // 登录
        function mobileLogin($obj) {
            var html_str = $.tmpl($.trim($('#JsMSpringFestivalLoginPanelTpl').html()))({})
            var config = {
                middle: true,
                className: 'spring-festival-login-panel'
            }
            tcb.showDialog(html_str, config)

            // 登录表单相关功能
           window.Bang.LoginFormByMobile({
                form_action: '/youpin/aj_my_login',
                selector_form: $('#SpringFestivalMLoginForm'),
                selector_get_secode: '.btn-get-secode',
                selector_vcode_img: '.vcode-img',
                class_get_secode_disabled: 'btn-get-secode-disabled'
            }, function (res) {
                tcb.closeDialog()
                setTimeout(function () {
                    $obj.trigger('click')
                }, 200)
            })
        }
        // 显示优惠券面板
        function showcouponPanel(txt) {
            var html_str = $.tmpl($.trim($('#JsMSpringFestivalCouponPanel').html()))({
                txt:txt
            })
            var config = {
                withMask: true,
                middle: true,
                className: 'coupon-panel'
            }
            tcb.showDialog(html_str, config)
        }

    })

} ()