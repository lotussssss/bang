// 微信分享
!function(){
    var wxData = {
        "title"   : '聪明花钱，0元拿iPhone！',
        "desc"    : '说出你聪明花钱的态度或小故事，即可参与瓜分60万大奖，还有机会0元拿iPhone！',
        "link"    : window.location.protocol + '//' + window.location.host + '/youpin/huodong?_from=share',
        "imgUrl"  : 'https://p0.ssl.qhmsg.com/t019fb34c4310e605e6.png',
        "success" : shareSuccess, // 用户确认分享的回调
        "cancel"  : tcb.noop // 用户取消分享
    }
    if (typeof wx !== 'undefined'){
        // 海报制作成功页 + 我的排行榜页，
        // 分享内容为我的投票页，其他页面直接分享
        if (window.__WX_OPEN_ID){
            wxData.title = '就差你的助力！'
            wxData.desc = '因为我们都有一颗对聪明花钱乐于探索的心！'
            wxData.link = window.location.protocol + '//' + window.location.host + '/youpin/cmhqShareFriend?cmhq_opid='+window.__WX_OPEN_ID+'&_from=share'

            if (window.__PAGE=='2017-06-brand-promotion-create-succ'){
                // 海报制作成功页
                wxData.success = function(){
                    window.location.href = '/youpin/cmhqAfterShare?_from=share'
                }
            }
        }

        // 微信分享
        wx.ready ( function () {
            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage ( wxData )
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline ( wxData )
            //分享到QQ
            wx.onMenuShareQQ ( wxData )
            //分享到QZone
            wx.onMenuShareQZone ( wxData )
        })
    }
    // 已登录用户分享成功
    function shareSuccess(){
        window.Bang.ShareIntro.close()
    }
}()