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

    //苹果专区
    window.Bang.renderProductList({
        $target : $ (".js-ios-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/doGetProductListByBrand?brand_id=2',
        request_params : {
            page_size : 8
        },
        list_params: window.__PARAMS,
        col : 4,
        complete: function(result, $target){}
    })

    //安卓专区
    window.Bang.renderProductList({
        $target : $ (".js-android-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/doGetAndroidList',
        request_params : {
            page_size : 8
        },
        list_params: window.__PARAMS,
        col : 4,
        complete: function(result, $target){}
    })

    //分期免息
    window.Bang.renderProductList({
        $target : $ (".js-mianxi-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/doGetMianxiList',
        request_params : {
            page_size : 8
        },
        list_params: window.__PARAMS,
        col : 4,
        complete: function(result, $target){}
    })

    // 视频
    window.Bang.playVideo($('.trigger-play-video'))
})