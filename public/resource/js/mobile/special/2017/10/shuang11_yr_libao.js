;(function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "216元礼包免费送！",
        "desc": "邀好友 抢礼包，216元礼包等您来拿、数量有限先到先得！",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname + '?helpOpen_id=' + window._OPEN_ID,
        "imgUrl": 'https://p0.ssl.qhmsg.com/t01896d87dbde15d6cc.jpg',
        "success": shareSuccess, // 用户确认分享的回调
        "cancel": tcb.noop // 用户取消分享
    }
    function shareSuccess() {
        window.location.href = window.location.href
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


    $(function () {
        tcb.bindEvent(document.body,{
            // 点击分享给好友
            '.js-trigger-share': function (e) {
                e.preventDefault()

                // 触发显示分享引导
                window.Bang.ShareIntro.active({
                    img : 'https://p.ssl.qhimg.com/t01c5d992454e4a99d1.png',
                    ext_html: '<div style="padding-top:.1rem;font-size: .14rem;text-align: center;color: #fff;">点击分享，<br/>请好友帮您赢礼包</div>'
                })
            },
            // 点击助力
            '.js-trigger-help':function (e) {
                e.preventDefault()

                $.post('/youpin/doDouble11Help',{
                    'helpOpen_id': window._HELP_OPEN_ID
                },function (res) {
                    try{
                        res = JSON.parse(res)

                        if(!res.errno){
                            $.dialog.toast('助力成功！',3000)
                        }else{
                            $.dialog.toast(res.errmsg,3000)
                        }
                    }catch(e){
                        $.dialog.toast('系统错误，请刷新页面重试',3000)
                    }

                })
            }
        })

        // 中奖用户信息
        function renderLotteryUserList(){
            var html_st = ''

            for( var i=0; i<window._PRIZE_INFO.length; i++){
                html_st += '<div class="item">他们已领取：'+window._PRIZE_INFO[i]+'</div>'
            }

            var
                $list = $('.lottery-user-list'),
                $inner = $list.find('.lottery-user-list-inner')

            $inner.html(html_st)

            var
                h = $inner.find('.item').eq(0).height()

            setTimeout(function(){
                var arg = arguments;
                $inner.animate({'top': -h}, 800, function(){
                    $inner.find('.item').eq(0).appendTo($inner)

                    $inner.css({'top': 0})

                    setTimeout(arg.callee, 3000)
                })
            }, 3000)

        }
        renderLotteryUserList()
    })
})()
