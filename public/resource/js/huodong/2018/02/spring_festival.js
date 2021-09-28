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
                    alert(res['errmsg'])
                }
            })
        }
    })
    
    // 登录
    function mobileLogin($obj) {
        var html_str = $.tmpl($.trim($('#JsSpringFestivalLoginPanelTpl').html()))({})
        var config = {
            withMask: true,
            className: 'spring-festival-login-panel'
        }
        tcb.showDialog(html_str, config)

        // 登录表单相关功能
        window.Bang.LoginFormByMobile({
            form_action: '/youpin/aj_my_login',
            selector_form: $('#SpringFestivalLoginForm'),
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
        var html_str = $.tmpl($.trim($('#JsSpringFestivalCouponPanel').html()))({
            txt:txt
        })
        var config = {
            withMask: true,
            className: 'coupon-panel'
        }
        tcb.showDialog(html_str, config)
    }

});