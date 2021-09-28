// 苏宁note7 vipshop
;
(function () {
    wx.ready (function () {
        var noop = function () {};
        var wxData = {};

        // 微信分享的数据
        wxData = {
            "title"   : "三星Galaxy Note7以旧换新，到店有礼！",
            "desc"    : "苏宁与同城帮联合推出：三星Galaxy Note7到店以旧换新，补贴1000元，再享6重大礼！",
            "link"    : window.location.href,
            "imgUrl"  : 'https://p.ssl.qhimg.com/t0110cda9b8c00eb42f.png',
            "success" : noop, // 用户确认分享的回调
            "cancel"  : noop // 用户取消分享
        };

        // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
        wx.onMenuShareAppMessage (wxData);
        // 点击分享到朋友圈，会执行下面这个代码
        wx.onMenuShareTimeline (wxData);
        //分享到QQ
        wx.onMenuShareQQ (wxData);
    });

} ());
