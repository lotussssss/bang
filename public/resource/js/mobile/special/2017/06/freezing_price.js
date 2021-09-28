;
!function () {
    var wxData = {
        "title"   : '隔代机，冰点价！手快者得！',
        "desc"    : '冰点尖叫大促，领券最高再省108元！天天爆品，不止5折！',
        "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname,
        "imgUrl"  : 'https://p2.ssl.qhmsg.com/t0177cdb8b06d064173.png',
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

} ()