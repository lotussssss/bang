$(function(){
    $(window).on('scroll load', function(){
        var ty_btn = $('.shine_iphone .ty-btn');
        var btn_top = $('.top-ty-btn').offset().top;
        if($(window).scrollTop()>btn_top){
            ty_btn.show();
        }else{
            ty_btn.hide();
        }
    });
});
wx.ready(function(){
    var noop = function(){};
    var wxData = {};

    // 微信分享的数据
    wxData = {
        "title" : '点亮iPhone，她本该如此！',
        "desc" : 'iPhone的logo能发光？再现苹果经典，闪耀与众不同！',
        "link" :  window.location.protocol+'//'+window.location.host+window.location.pathname,
        "imgUrl" : 'https://p.ssl.qhimg.com/t0105d1818ddf3a3d01.png',
        "success": noop, // 用户确认分享的回调
        "cancel": noop // 用户取消分享
    };

    // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
    wx.onMenuShareAppMessage(wxData);
    // 点击分享到朋友圈，会执行下面这个代码
    wx.onMenuShareTimeline(wxData);
    //分享到QQ
    wx.onMenuShareQQ(wxData);
});