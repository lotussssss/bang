!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title"   : '2年内的旧机，苏宁按购机价原价收了！',
        "desc"    : '还有蓝牙音箱，手环，400元回收券，120限时加价券……等你来抽！',
        "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname+'?from_page=sn_fenxiang&op_id='+(window.__OPEN_ID || tcb.queryUrl(window.location.search, 'op_id')),
        "imgUrl"  : 'https://p3.ssl.qhmsg.com/t01dbd2b3b0b05f6a8b.png',
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
