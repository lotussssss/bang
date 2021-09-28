;(function () {
    wx.ready (function () {
        var wxData = {}

        // 微信分享的数据
        wxData = {
            "title"   : "中秋节礼包免费送！",
            "desc"    : "邀请好友助力，赢价值409元大礼包！",
            "link"    : window.location.protocol + '//' + window.location.host + '/wechathuodong/zhongQiuJieShareFriend?op_id='+_op_id,
            "imgUrl"  : 'https://p0.ssl.qhmsg.com/t01eff0afa507fb3c38.png',
            "success" : redireactPage, // 用户确认分享的回调
            "cancel"  : tcb.noop // 用户取消分享
        }

        // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
        wx.onMenuShareAppMessage (wxData)
        // 点击分享到朋友圈，会执行下面这个代码
        wx.onMenuShareTimeline (wxData)
        //分享到QQ
        wx.onMenuShareQQ (wxData)
        //分享到QZone
        wx.onMenuShareQZone (wxData)

        function redireactPage() {
            window.location.href = '/wechathuodong/zhongQiuJieAfterShare?op_id='+_op_id
        }
    })
})()