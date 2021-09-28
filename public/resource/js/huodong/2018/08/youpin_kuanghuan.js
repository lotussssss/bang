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

                            tcb.closeDialog()
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
        $tpl : $('#JsBaokuanProductListTpl'),
        $target : $('.block-baokuan .ui-sp-product-list-1'),
        request_url : '/huodong/doYpBuyDay',
        request_params : {
            pn : 0,
            page_size: 4
        },
        list_key: 'bao',
        list_params: window.__PARAMS,
        col : 4,
        complete: function(result, $target){}
    })
    window.Bang.renderProductList({
        $tpl : $('#JsYouxuanProductListTpl'),
        $target : $('.block-youxuan .ui-sp-product-list-1'),
        request_url : '/huodong/doYpBuyDay',
        request_params : {
            pn : 0,
            page_size: 4
        },
        list_key: 'yx',
        list_params: window.__PARAMS,
        col : 4,
        complete: function(result, $target){}
    })
    window.Bang.renderProductList({
        $tpl : $('#JsRecommendProductListTpl'),
        $target : $('.block-recommend .ui-sp-product-list-1'),
        request_url : '/youpin/aj_get_goods',
        request_params : {
            pn : 0,
            page_size: 8
        },
        list_params: window.__PARAMS,
        col : 4,
        complete: function(result, $target){}
    })
});