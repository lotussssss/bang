;
!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "1212砸免单、抢神券",
        "desc": "同城帮1212砸免单、抢神券，疯陪到底！",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
        "imgUrl": 'https://p0.ssl.qhmsg.com/t01569c4b2a4b1df134.jpg',
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

    $(function () {
        var $goldenEggsWrap = $('.lottery-golden-eggs')

        tcb.bindEvent(document.body, {
            // 抢神券
            '.js-trigger-get-shenquan':function (e) {
                e.preventDefault()

                var $me = $(this)
                if($me.hasClass('btn-disabled')){
                    return
                }
                $.get('/youpin/doGetDoubleTCode', function (res) {
                    res = $.parseJSON(res)
                    if (!res['errno']) {
                        // 显示抢神券成功面板
                        showShenquanGotPanel()
                    }else if (res['errno'] == 734){
                        // 显示已抢过神券面板
                        showShenquanJoinedPanel()
                    }else if (res['errno'] == 108) {
                        // 未登录
                        shuang12Login($me)
                    }else{
                        $.dialog.toast(res['errmsg'], 2000)
                    }
                })
            },
            // 点击金蛋
            '.lottery-golden-eggs .item-egg': function (e) {
                e.preventDefault()

                var $me = $(this)
                $.get('/youpin/doZaJinDan', function (res) {
                    res = $.parseJSON(res)
                    if (!res['errno']) {
                        // 中奖

                        // 蛋停止摇晃
                        $goldenEggsWrap.find('.egg-pic').removeClass('egg-shake')
                        // 锤子显示一会后隐藏
                        $me.find('.hammer').show()
                        setTimeout(function () {
                            $me.find('.hammer').hide()
                            // 被点击的蛋碎掉
                            $me.find('.egg-pic').attr('src', 'https://p1.ssl.qhmsg.com/t01b463d104cccdeb91.png')
                        }, 2500)

                        // 显示中奖面板
                        setTimeout(function () {
                            showGoldenEggsBingoPanel()
                        }, 3300)
                    } else if (res['errno'] == 292) {
                        // 已参加
                        showGoldenEggsJoinedPanel()
                    } else if (res['errno'] == 108) {
                        // 未登录
                        shuang12Login($me)
                    }else{
                        $.dialog.toast(res['errmsg'], 2000)
                    }
                })
            }
        })

        // 获取中奖列表信息
        function renderLotteryUserList(){
            var
                html_st = '',
                list_arr = window.__LOTTERY_USER_LIST

            for(var i=0;i<list_arr.length;i++){
                html_st += '<div class="item"><span>●</span>'+list_arr[i]+'</div>'
            }

            var
                $list = $('.lottery-user-list'),
                $inner = $list.find('.lottery-user-list-inner')

            $inner.html(html_st)

            var
                h = $inner.find('.item').eq(0).height()

            setTimeout(function(){
                var arg = arguments;
                $inner.animate({'top': -h}, 300, function(){
                    $inner.find('.item').eq(0).appendTo($inner)

                    $inner.css({'top': 0})

                    setTimeout(arg.callee, 3000)
                })
            }, 3000)

        }
        renderLotteryUserList()

        // 双12登录
        function shuang12Login($obj) {
            var html_str = $.tmpl($.trim($('#JsMShuang12LoginPanelTpl').html()))({})
            var config = {
                middle: true,
                className: 'shuang12-login-panel'
            }
            tcb.showDialog(html_str, config)

            // 登录表单相关功能
           window.Bang.LoginFormByMobile({
                form_action: '/youpin/aj_my_login',
                selector_form: $('#Shuang12MLoginForm'),
                selector_get_secode: '.btn-get-sms-code',
                selector_vcode_img: '.vcode-img',
                class_get_secode_disabled: 'btn-get-sms-code-disabled'
            }, function (res) {
                tcb.closeDialog()
                setTimeout(function () {
                    $obj.trigger('click')
                }, 200)
            })
        }
        // 显示抢神券成功面板
        function showShenquanGotPanel() {
            var html_str = $.tmpl($.trim($('#JsMShuang12ShenquanGotPanel').html()))({})
            var config = {
                middle: true,
                className: 'shuang12-shenquan-panel'
            }
            tcb.showDialog(html_str, config)
        }
        // 显示已抢过神券面板
        function showShenquanJoinedPanel() {
            var html_str = $.tmpl($.trim($('#JsShuang12ShenquanJoinedPanel').html()))({})
            var config = {
                middle: true,
                className: 'shuang12-shenquan-panel'
            }
            tcb.showDialog(html_str, config)
        }
        // 显示砸金蛋中奖面板
        function showGoldenEggsBingoPanel() {
            var html_str = $.tmpl($.trim($('#JsMShuang12GoldenEggsBingoPanel').html()))({})
            var config = {
                middle    : true,
                className: 'shuang12-golden-eggs-panel'
            }
            tcb.showDialog(html_str, config)
        }
        // 显示砸金蛋已参加面板
        function showGoldenEggsJoinedPanel() {
            var html_str = $.tmpl($.trim($('#JsMShuang12GoldenEggsJoinedPanel').html()))({})
            var config = {
                middle    : true,
                className: 'shuang12-golden-eggs-panel'
            }
            tcb.showDialog(html_str, config)
        }
    })

} ()