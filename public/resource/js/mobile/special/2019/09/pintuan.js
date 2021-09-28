;
!function () {
    var wxData = {}
    var url_query = tcb.queryUrl(window.location.search),
        share_param = {
        xxg_id: url_query.xxg_id,
        activity_id: url_query.activity_id
    }
    if (window.__ORDER_ID) {
        share_param.order_id = window.__ORDER_ID
    }

    // 微信分享的数据
    if(window.__SHARE_FLAG=='share'){
        wxData = {
            "title": "旧手机助力加价，帮我多卖25%！",
            "desc": "大家一起薅羊毛~",
            "link": tcb.setUrl(window.location.protocol + '//' + tcb.trim(window.location.host, '/') + '/pintuan/awaypage', share_param),
            "imgUrl": 'https://p1.ssl.qhimg.com/t01d10da695209797b3.jpg',
            "success": shareSuccess, // 用户确认分享的回调
            "cancel": tcb.noop // 用户取消分享
        }
    }else {
       wxData = {
           "title": "苏宁小店新添手机回收业务，开业酬宾加价20%！",
           "desc": "彩蛋在后面，有惊喜呦~",
           "link": tcb.setUrl(window.location.protocol + '//' + tcb.trim(window.location.host, '/') + '/pintuan/homepage', share_param),
           "imgUrl": 'https://p1.ssl.qhimg.com/t01d10da695209797b3.jpg',
           "success": tcb.noop, // 用户确认分享的回调
           "cancel": tcb.noop // 用户取消分享
       }
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

    function shareSuccess(){
        window.Bang.ShareIntro.close()
    }

    $(function () {

        tcb.bindEvent(document.body, {
            // 点击"喊人来加价"
            '.js-trigger-share': function (e) {
                e.preventDefault()

                showShareIntro()
            },
            //查看我的奖品
            '.js-trigger-help':function (e) {
                e.preventDefault()

                var $me = $(this)

                $.get('/pintuan/doTuanHelp',{
                    'order_id':window.__ORDER_ID
                },function (res) {
                    if (!res['errno']) {
                        $.dialog.toast(res['errmsg'], 2000)

                        setTimeout(function () {
                            window.location.reload()
                        },2000)
                    }else{
                        $.dialog.toast(res['errmsg'], 2000)
                    }
                })
            }
        })

        // 触发显示分享引导
        function showShareIntro(){
            // 触发显示分享引导
            window.Bang.ShareIntro.active({
                img : 'https://p3.ssl.qhimg.com/t01c2b8ed7a1330d715.png'/*,
                ext_html: '<div style="padding-top:.1rem;font-size: .14rem;text-align: center;color: #fff;">分享至好友群或朋友圈<br/>立即再抽一次</div>'*/
            })
        }

        // 活动倒计时
        function startCountdown () {
            var targettime = Date.parse (window.__HD_TARGET_TIME.replace (/-/g, '/')),
                curtime = window.__CURRENT_TIME || (new Date ()).getTime (),
                $target = $ ('.js-countdown')

            window.Bang.startCountdown (targettime, curtime, $target, {})
        }
        // startCountdown ()

        // 助力倒计时
        function startHelpCountdown () {
            var targettime = Date.parse (window.__HELP_TARGET_TIME.replace (/-/g, '/')),
                curtime = window.__CURRENT_TIME || (new Date ()).getTime (),
                $target = $ ('.js-countdown-help')

            window.Bang.startCountdown (targettime, curtime, $target, {})
        }
        startHelpCountdown ()

        // 输出中奖用户的数据
        function renderLotteryUserList() {
            $.get('/pintuan/getRadioInfo?xxg_id=78549192&activity_id=2',function (res) {
                if (!res.errno && res.result.radio_info){
                    var $list_inner = $('.lottery-user-list-inner'),
                        list_arr = res.result.radio_info

                    var html_str = $.tmpl($.trim($('#JsMRadioInfoList').html()))({
                        list :list_arr
                    })

                    if ($list_inner && $list_inner.length) {
                        $list_inner.html(html_str)

                        var $list_lottery_item = $list_inner.find('.lottery-item'),
                            list_inner_row_height = $list_lottery_item.first().height()

                        // 大于0条中奖信息才滚滚滚
                        if ($list_lottery_item.length > 0) {
                            (function () {
                                var arg = arguments
                                $list_inner.animate({'top': -list_inner_row_height}, 800, function () {
                                    $list_inner.find('.lottery-item').first().appendTo($list_inner)
                                    $list_inner.css({'top': 0})

                                    setTimeout(arg.callee, 5000)
                                })
                            }())
                        }
                    }
                }

            })
        }

        renderLotteryUserList()
    })
} ()
