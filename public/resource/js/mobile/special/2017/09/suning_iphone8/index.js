;(function () {
    wx.ready (function () {
        var wxData = {}

        // 微信分享的数据
        wxData = {
            "title"   : "砍时间 首发拿iPhone!",
            "desc"    : "我要换iPhone新品，跪求砍我一刀！",
            "link"    : window.location.protocol + '//' + window.location.host + '/wechathuodong/suningIphone8ShareFriend?op_id='+_op_id,
            "imgUrl"  : 'https://p1.ssl.qhmsg.com/t017100b221973cccb1.png',
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
            window.location.href = '/wechathuodong/suningIphone8AfterShare?op_id='+_op_id
        }
    })
})()
;(function(){
    var Bang = window.Bang || {}


    tcb.bindEvent({

    })


})()