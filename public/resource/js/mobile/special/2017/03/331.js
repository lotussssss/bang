wx.ready(function () {
    var wxData = {};

    // 微信分享的数据
    wxData = {
        "title": '【买买买的好时机】 iPhone新机发布，老机价格跳水，价格低至3折。',
        "desc": 'iPhone中国红发布，特惠机型限时抢购，支持分期付：iPhone6 plus 降至1980元，iPhone se  降至1699元，华为 P9 Plus降至2480元...',
        "link": window.location.protocol+'//'+window.location.host+window.location.pathname,
        "imgUrl": 'https://p.ssl.qhimg.com/t011c8a0edb0148a67b.png',
        "success": tcb.noop, // 用户确认分享的回调
        "cancel": tcb.noop // 用户取消分享
    };
    // 用户点开右上角popup菜单后，点击分享给好友，会执行下  面这个代码
    wx.onMenuShareAppMessage(wxData);
    // 点击分享到朋友圈，会执行下面这个代码
    wx.onMenuShareTimeline(wxData);
    //分享到QQ
    wx.onMenuShareQQ(wxData);
    //分享到QQ空间
    wx.wx.onMenuShareQZone(wxData);
});


$(function () {
    //苹果专区
    window.Bang.renderProductList({
        $target : $ (".js-ios-product-list"),
        $tpl : $('#JsMProductListVer1720Tpl'),
        request_url : '/youpin/doGetProductListByBrand?brand_id=2',
        request_params : {},
        col : 2,
        complete: function(result, $target){}
    })

    //安卓专区
    window.Bang.renderProductList({
        $target : $ (".js-android-product-list"),
        $tpl : $('#JsMProductListVer1720Tpl'),
        request_url : '/youpin/doGetAndroidList',
        request_params : {},
        col : 2,
        complete: function(result, $target){}
    })

    //dell电脑
    window.Bang.renderProductList({
        $target : $ (".js-dell-product-list"),
        $tpl : $('#JsMProductListVer1720Tpl'),
        request_url : '/youpin/doGetDellList',
        request_params : {},
        col : 2,
        complete: function(result, $target){}
    })

    //分期免息
    window.Bang.renderProductList({
        $target : $ (".js-mianxi-product-list"),
        $tpl : $('#JsMProductListVer1720Tpl'),
        request_url : '/youpin/doGetMianxiList',
        request_params : {},
        col : 2,
        complete: function(result, $target){}
    })

})