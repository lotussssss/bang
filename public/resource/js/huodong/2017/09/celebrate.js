$ (function () {
    tcb.bindEvent (document, {
        // 切换价格tab
        '.block-price-range .tab-item' : function (e) {
            e.preventDefault ()

            var $me = $ (this),
                price = $me.attr ('data-price')

            $me.addClass('cur').siblings('.cur').removeClass ('cur')

            var $url = $('.block-price-range .more'),
                url = $url.attr('href')

            url = tcb.setUrl(url, {
                price:price
            })
            $url.attr('href',url)

            renderProductList (price)
        }
    })

    // 输出商品列表
    function renderProductList (price) {
        window.Bang.renderProductList({
            $tpl : $('#JsProductListVer1720Tpl'),
            $target : $('.block-price-range .ui-sp-product-list-1'),
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

    function init () {
        $('.block-price-range .tab-item').eq(0).trigger("click")
    }

    init ()

})