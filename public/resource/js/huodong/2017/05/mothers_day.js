$ (function () {
    $('.trigger-play-video').on('click', function(e){
        e.preventDefault ()

        var html_fn = $.tmpl ($.trim ($ ('#JsMothersDayVideoPlayerPanelTpl').html ())),
            html_st = html_fn ()

        tcb.showDialog (html_st, {
            className : 'video-player-panel'
        })
    })

    //苹果专区
    window.Bang.renderProductList({
        $target : $ (".js-ios-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/doGetProductListByBrand?brand_id=2',
        request_params : {
            page_size : 8
        },
        list_params: {
            from : 'mothers_day'
        },
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
        list_params: {
            from : 'mothers_day'
        },
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
        list_params: {
            from : 'mothers_day'
        },
        col : 4,
        complete: function(result, $target){}
    })
});