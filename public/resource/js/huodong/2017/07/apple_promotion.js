$ (function () {
    //iPhone7
    window.Bang.renderProductList({
        $target : $ (".js-iPhone7-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/aj_get_goods?pn=0&model_ids=660',
        request_params : {
            page_size : 8
        },
        list_params: window.__PARAMS,
        col : 4,
        complete: function(result, $target){}
    })
    //iPhone6
    window.Bang.renderProductList({
        $target : $ (".js-iPhone6-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/aj_get_goods?pn=0&model_ids=97',
        request_params : {
            page_size : 8
        },
        list_params: window.__PARAMS,
        col : 4,
        complete: function(result, $target){}
    })
    //iPhone5
    window.Bang.renderProductList({
        $target : $ (".js-iPhone5-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/aj_get_goods?pn=0&model_ids=3',
        request_params : {
            page_size : 8
        },
        list_params: window.__PARAMS,
        col : 4,
        complete: function(result, $target){}
    })

});