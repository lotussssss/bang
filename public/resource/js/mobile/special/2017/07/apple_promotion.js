;
!function () {
    var wxData = {
        "title"   : '苹果家族大狂欢！手快者得！还在等什么?',
        "desc"    : '苹果家族大狂欢！领券最高再省108元！天天爆品，不止5折！',
        "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname,
        "imgUrl"  : 'https://p3.ssl.qhmsg.com/t019c956997f89db662.png',
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
    $(function () {
        //iPhone7
        window.Bang.renderProductList({
            $target : $ (".js-iPhone7-product-list"),
            $tpl : $('#JsMProductListVer1720Tpl'),
            request_url : '/youpin/aj_get_goods?pn=0&model_ids=660',
            request_params : {
                page_size : 8
            },
            list_params: window.__PARAMS,
            col : 2,
            complete: function(result, $target){}
        })
        //iPhone6
        window.Bang.renderProductList({
            $target : $ (".js-iPhone6-product-list"),
            $tpl : $('#JsMProductListVer1720Tpl'),
            request_url : '/youpin/aj_get_goods?pn=0&model_ids=97',
            request_params : {
                page_size : 8
            },
            list_params: window.__PARAMS,
            col : 2,
            complete: function(result, $target){}
        })
        //iPhone5
        window.Bang.renderProductList({
            $target : $ (".js-iPhone5-product-list"),
            $tpl : $('#JsMProductListVer1720Tpl'),
            request_url : '/youpin/aj_get_goods?pn=0&model_ids=3',
            request_params : {
                page_size : 8
            },
            list_params: window.__PARAMS,
            col : 2,
            complete: function(result, $target){}
        })
    })

} ()