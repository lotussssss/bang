$(function () {
    var __reload = false

    tcb.bindEvent(document.body, {
        // 领取优惠券
        '.js-trigger-get-coupon ':function (e) {
            e.preventDefault()

            var $me = $(this),
                coupon_code = $me.attr('data-coupon-code')

            $.get('/youpin/doGetNianuojieCouponCode?activity_id=6&coupon_code='+coupon_code, function (res) {
                if (!res['errno']) {
                    // 提示领券成功
                    alert('恭喜您，领取成功！')

                    $me.removeClass('js-trigger-get-coupon')
                    $me.find('.coupon-btn').html('去使用')
                    $me.attr('href',tcb.setUrl('/youpin', window.__PARAMS))

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
        $tpl : $('#JsNianhuojieProductListTpl'),
        $target : $('.block-zheshangzhe-product .ui-sp-product-list-1'),
        request_url : '/youpin/aj_get_goods',
        request_params : {
            pn : 0,
            page_size: 8
        },
        // list_key: 'bao',
        list_params: window.__PARAMS,
        col : 4,
        complete: function(result, $target){}
    })
});
