;
!function () {
    var

        wxData = {
            "title": "新用户0元购",
            "desc": "同城帮发福利，新用户0元白拿，快来薅羊毛啦！找好手机，就来同城帮！",
            "link": window.location.protocol + '//' + window.location.host + window.location.pathname,
            "imgUrl": 'https://p5.ssl.qhimg.com/t01bbd83cef549c305b.png',
            "success": tcb.noop, // 用户确认分享的回调
            "cancel": tcb.noop // 用户取消分享
        }

    if (typeof wx !== 'undefined') {
        // 微信分享
        wx.ready(function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage(wxData)
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline(wxData)
            //分享到QQ
            wx.onMenuShareQQ(wxData)
        })
    }
    // 设置支持App分享
    function __appSetShareSupport() {
        // 设置分享的数据
        tcb.js2AppSetShareData(wxData)

        // 设置支持的分享方式，不传任何参数，那么表示支持默认的分享方式
        tcb.js2AppSetShareSupport({
            'onMenuCopyUrl': 0
        })
    }

    __appSetShareSupport()

}()