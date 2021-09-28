;
!function () {
    var wxData = {
            "title"   : '一份献给天下母亲的礼物',
            "desc"    : '母亲节到了，给母亲换台手机吧！大屏智能机给母亲带来更精彩的生活~回收旧手机更有红包领~',
            "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname,
            "imgUrl"  : 'https://p3.ssl.qhmsg.com/t01e37132ed64d11dfe.png',
            "success" : tcb.noop, // 用户确认分享的回调
            "cancel"  : tcb.noop // 用户取消分享
        }

    if (typeof wx !== 'undefined'){
        // 微信分享
        wx.ready ( function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage ( wxData )
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline ( wxData )
            //分享到QQ
            wx.onMenuShareQQ ( wxData )
        })
    }

    $ (function () {
        $('.trigger-play-video').on('click', function(e){
            e.preventDefault ()

            var html_fn = $.tmpl ($.trim ($ ('#JsMMothersDayVideoPlayerPanelTpl').html ())),
                html_st = html_fn ()

            tcb.showDialog (html_st, {
                className : 'video-player-panel',
                withClose : true,
                middle : true
            })
        })

        //苹果专区
        window.Bang.renderProductList({
            $target : $ (".js-ios-product-list"),
            $tpl : $('#JsMProductListVer1720Tpl'),
            request_url : '/youpin/doGetProductListByBrand?brand_id=2',
            request_params : {
                page_size : 8
            },
            list_params: {
                from : 'mothers_day'
            },
            col : 2,
            complete: function(result, $target){}
        })

        //安卓专区
        window.Bang.renderProductList({
            $target : $ (".js-android-product-list"),
            $tpl : $('#JsMProductListVer1720Tpl'),
            request_url : '/youpin/doGetAndroidList',
            request_params : {
                page_size : 8
            },
            list_params: {
                from : 'mothers_day'
            },
            col : 2,
            complete: function(result, $target){}
        })

        //分期免息
        window.Bang.renderProductList({
            $target : $ (".js-mianxi-product-list"),
            $tpl : $('#JsMProductListVer1720Tpl'),
            request_url : '/youpin/doGetMianxiList',
            request_params : {
                page_size : 8
            },
            list_params: {
                from : 'mothers_day'
            },
            col : 2,
            complete: function(result, $target){}
        })

    })
} ()