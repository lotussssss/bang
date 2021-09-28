$ (function () {

    //苹果专区
    window.Bang.renderProductList({
        $target : $ (".js-ios-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/doGetProductListByBrand?brand_id=2',
        request_params : {},
        col : 5,
        complete: function(result, $target){}
    })

    //安卓专区
    window.Bang.renderProductList({
        $target : $ (".js-android-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/doGetAndroidList',
        request_params : {},
        col : 5,
        complete: function(result, $target){}
    })

    //dell电脑
    window.Bang.renderProductList({
        $target : $ (".js-dell-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/doGetDellList',
        request_params : {},
        col : 5,
        complete: function(result, $target){}
    })

    //分期免息
    window.Bang.renderProductList({
        $target : $ (".js-mianxi-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/doGetMianxiList',
        request_params : {},
        col : 5,
        complete: function(result, $target){}
    })
});