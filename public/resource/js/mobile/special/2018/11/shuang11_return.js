;
!function () {
  var wxData = {}

  // 微信分享的数据
  wxData = {
    "title": "同城帮超级回血日",
    "desc": "全场加价10%！剁手不吃土，回收迎福利",
    "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
    "imgUrl": 'https://p2.ssl.qhmsg.com/t01f4965b4ed42aa6c2.png',
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