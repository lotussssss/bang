;
!function () {
    var wxData = {
        "title"   : '端午节买手机，送价值128元大礼包！',
        "desc"    : '过个聪明的端午节，买手机送价值128元大礼包！分期免息最高再省500元！',
        "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname,
        "imgUrl"  : 'https://p2.ssl.qhmsg.com/t01487dee38a41cd7dd.png',
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
        //今日秒杀
        window.Bang.renderProductList({
            $target : $ (".js-flash-product-list"),
            $tpl : $('#JsMFlashProductListVer1720Tpl'),
            request_url : '/youpin/doGetFlashSaleGoods',
            request_params : {
                page_size : 4
            },
            list_key: 'flash_list',
            list_params: {
                from : 'duanwujie'
            },
            col : 4,
            complete: function(result, $target){}
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
                from : 'duanwujie'
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
                from : 'duanwujie'
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
                from : 'duanwujie'
            },
            col : 2,
            complete: function(result, $target){}
        })

        // 视频
        window.Bang.playVideo($('.trigger-play-video'))
    })
} ()