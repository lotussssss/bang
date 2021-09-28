!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "全新国行iPhone XS，比官网低300元！",
        "desc": "支持以旧换新，iPhone XS 低价入手！",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname,
        "imgUrl": 'https://p5.ssl.qhimg.com/t01227562f0b4ce2df9.png',
        "success": tcb.noop, // 用户确认分享的回调
        "cancel": tcb.noop // 用户取消分享
    }

    if (typeof wx !== 'undefined') {
        wx.ready(function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage(wxData)
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline(wxData)
            //分享到QQ
            wx.onMenuShareQQ(wxData)
            //分享到QZone
            wx.onMenuShareQZone(wxData)
        })
    }

}()

