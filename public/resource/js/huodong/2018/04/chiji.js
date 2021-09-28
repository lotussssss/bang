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
                // res = $.parseJSON(res)
                if (!res['errno']) {
                    // 提示领券成功
                    alert('恭喜您，领取成功！')

                    $me.css('background-image','https://p0.ssl.qhmsg.com/t01101cc28a1075134a.png').addClass('btn-disabled')
                }else if (res['errno'] == 108) {
                    // 未登录
                    showCommonLoginPanel(function () {
                        setTimeout(function () {
                            window.location.reload()
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

});