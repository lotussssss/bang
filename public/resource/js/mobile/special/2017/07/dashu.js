;
!function () {
    var wxData = {
        "title"   : '大暑降温计划！天热价格凉！',
        "desc"    : '天热不要紧！手机价更低！同城帮让你吹着空调玩手机~领券最高再省108元！天天爆品，不止5折！',
        "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname,
        "imgUrl"  : 'https://p4.ssl.qhmsg.com/t01c9f3d68616e87513.jpg',
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
        //今日秒杀
        window.Bang.renderProductList({
            $target : $ (".js-flash-product-list"),
            $tpl : $('#JsMFlashProductListVer1720Tpl'),
            request_url : '/youpin/doGetFlashSaleGoods',
            request_params : {
               page_size : 4
            },
            list_key: 'flash_list',
            list_params: window.__PARAMS,
            col : 4,
            complete: function(result, $target){}
        })
    })

} ()