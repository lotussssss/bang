$(function () {
    tcb.bindEvent(document.body, {
        // 领取优惠券
        '.js-trigger-get-coupon ':function (e) {
            e.preventDefault()

            var $me = $(this),
                data_coupon_amount = $me.attr('data-coupon-amount')

            $.get('/youpin/doGetCouponCode?coupon_id=2&coupon_code='+data_coupon_amount, function (res) {
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
        },
        // 抢神券
        '.js-trigger-get-shenquan':function (e) {
            e.preventDefault()

            var $me = $(this)
            // showcouponPanel('恭喜您，领取成功！')

            if($me.hasClass('btn-not-start')||$me.hasClass('btn-end')){
                return
            }
            $.get('/youpin/doGetFixedTimeCouponCode?fixed_coupon_id=2', function (res) {
                res = $.parseJSON(res)
                if (!res['errno']) {
                    // 显示抢神券成功面板
                }else if (res['errno'] == 734){
                    // 显示已抢过神券面板
                    showcouponPanel('您已领取')
                }else if (res['errno'] == 108) {
                    // 未登录
                    mobileLogin($me)
                }else{
                    alert(res['errmsg'])
                }
            })
        },
        // 点击租机商品弹出二维码
        '.block-zuji a':function (e) {
            e.preventDefault()

            var config = {
                withMask: true,
                className: 'zuji-ewm-panel'
            }
            tcb.showDialog('<div class="zuji-cont"><img src="https://p4.ssl.qhmsg.com/t01770f8b3c524e8f91.png" alt=""></div>', config)
        }
    })

    
    // 登录
    function mobileLogin($obj) {
        var html_str = $.tmpl($.trim($('#JsKaixuejiLoginPanelTpl').html()))({})
        var config = {
            withMask: true,
            className: 'kaixueji-login-panel'
        }
        tcb.showDialog(html_str, config)

        // 登录表单相关功能
        window.Bang.LoginFormByMobile({
            form_action: '/youpin/aj_my_login',
            selector_form: $('#KaixuejiLoginForm'),
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
        var html_str = $.tmpl($.trim($('#JsKaixuejiCouponPanel').html()))({
            txt:txt
        })
        var config = {
            withMask: true,
            className: 'coupon-panel'
        }
        tcb.showDialog(html_str, config)
    }

    // 输出商品列表
    window.Bang.renderProductList({
        $tpl : $('#JsZuJiProductListTpl'),
        $target : $('.block-zuji .ui-sp-product-list-1'),
        request_url : '/youpin/aj_get_goods?price=3500',
        request_params : {
            pn : 0,
            page_size: 4
        },
        list_params: window.__PARAMS,
        col : 4,
        complete: function(result, $target){}
    })
    window.Bang.renderProductList({
        $tpl : $('#JsNewProductListTpl'),
        $target : $('.block-new .ui-sp-product-list-1'),
        request_url : '/youpin/aj_get_goods',
        request_params : {
            pn : 0,
            page_size: 4
        },
        list_params: window.__PARAMS,
        col : 4,
        complete: function(result, $target){}
    })

});