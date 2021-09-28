!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title"   : '有人哭着要原价买我用了两年的手机！',
        "desc"    : '是不是疯了！',
        "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname+'?from_page=tcb_fenxiang&op_id='+(window.__OPEN_ID || tcb.queryUrl(window.location.search, 'op_id')),
        "imgUrl"  : 'https://p4.ssl.qhmsg.com/t012c2549fb5cd6ac85.jpg',
        "success" : tcb.noop, // 用户确认分享的回调
        "cancel"  : tcb.noop // 用户取消分享
    }
    if (typeof wx !== 'undefined') {
        wx.ready (function () {
            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage (wxData)
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline (wxData)
            //分享到QQ
            wx.onMenuShareQQ (wxData)
            //分享到QZone
            wx.onMenuShareQZone (wxData)
        })
    }
} ()
