$ (function () {
    tcb.bindEvent(document.body,{
        // 黑五秒杀tab切换
        '.tab-list .tab-item':function (e) {
            e.preventDefault()

            var $me = $(this)

            $me.addClass('cur').siblings('.cur').removeClass('cur')
            $me.closest('.block-tab').find('.tab-cont a').eq($me.index()).show().siblings('a').hide()
        }
    })

    // 输出商品列表
    function renderProductList (price) {
        window.Bang.renderProductList({
            $tpl : $('#JsProductListVer1720Tpl'),
            $target : $('.block-price-'+price+' .ui-sp-product-list-1'),
            request_url : '/youpin/aj_get_goods',
            request_params : {
                pn : 0,
                price : price,
                page_size: 8,
                not_brand:57
            },
            list_params: window.__PARAMS,
            col : 4,
            complete: function(result, $target){}
        })
    }

    renderProductList (1)
    renderProductList (500)
    renderProductList (1000)
    renderProductList (1500)
    renderProductList (2001)

});