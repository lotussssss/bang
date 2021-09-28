$ (function () {
    //今日秒杀
    window.Bang.renderProductList({
        $target : $ (".js-flash-product-list"),
        $tpl : $('#JsFlashProductListVer1720Tpl'),
        request_url : '/youpin/doGetFlashSaleGoods',
        request_params : {
            page_size : 4
        },
        list_key: 'flash_list',
        list_params: window.__PARAMS,
        col : 4,
        complete: function(result, $target){}
    })

});