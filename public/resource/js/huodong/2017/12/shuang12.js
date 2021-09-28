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
                    alert(res['errmsg'])
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
                    $goldenEggsWrap.addClass('had-broken-egg')

                    // 锤子隐藏,金蛋停止摇动
                    $goldenEggsWrap.find('.hammer').hide()
                    $goldenEggsWrap.find('.egg-pic').removeClass('egg-shake')
                    // 被点击的蛋碎掉
                    $me.find('.egg-pic').attr('src', 'https://p1.ssl.qhmsg.com/t01b463d104cccdeb91.png')

                    // 显示中奖面板
                    setTimeout(function () {
                        showGoldenEggsBingoPanel()
                    }, 500)
                } else if (res['errno'] == 292) {
                    // 已参加
                    showGoldenEggsJoinedPanel()
                } else if (res['errno'] == 108) {
                    // 未登录
                    shuang12Login($me)
                }else{
                    alert(res['errmsg'])
                }
            })
        }
    })

    // 移入移出金蛋
    $('.lottery-golden-eggs .item-egg').hover(function () {
        var $me = $(this)

        if ($goldenEggsWrap.hasClass('had-broken-egg')) {
            return
        }

        $goldenEggsWrap.find('.hammer').hide()
        $me.find('.hammer').show()
        setTimeout(function () {
            $goldenEggsWrap.find('.egg-pic').removeClass('egg-shake')
        }, 500)
    }, function () {
        if ($goldenEggsWrap.hasClass('had-broken-egg')) {
            return
        }

        $goldenEggsWrap.find('.hammer').hide()
        setTimeout(function () {
            $goldenEggsWrap.find('.egg-pic').addClass('egg-shake')
        }, 500)
    })

    // 输出中奖用户的数据
    function renderLotteryUserList() {
        var $list_inner = $('.lottery-user-list-inner'),
            list_arr = window.__LOTTERY_USER_LIST

        if ($list_inner && $list_inner.length) {
            var html_str = $.tmpl($.trim($('#JsShuang12LotteryUserList').html()))({
                'list': list_arr
            })
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

                        setTimeout(arg.callee, 3000)
                    })
                }())
            }

        }
    }

    renderLotteryUserList()
    
    // 双12登录
    function shuang12Login($obj) {
        var html_str = $.tmpl($.trim($('#JsShuang12LoginPanelTpl').html()))({})
        var config = {
            withMask: true,
            className: 'shuang12-login-panel-wrap'
        }
        tcb.showDialog(html_str, config)

        // 登录表单相关功能
        window.Bang.LoginFormByMobile({
            form_action: '/youpin/aj_my_login',
            selector_form: $('#Shuang12LoginForm'),
            selector_get_secode: '.shuang12-login-panel-getsecode',
            selector_vcode_img: '.vcode-img',
            class_get_secode_disabled: 'shuang12-login-panel-getsecode-disabled'
        }, function (res) {
            tcb.closeDialog()
            setTimeout(function () {
                $obj.trigger('click')
            }, 200)
        })
    }
    // 显示抢神券成功面板
    function showShenquanGotPanel() {
        var html_str = $.tmpl($.trim($('#JsShuang12ShenquanGotPanel').html()))({})
        var config = {
            withMask: true,
            className: 'shuang12-shenquan-panel'
        }
        tcb.showDialog(html_str, config)
    }
    // 显示已抢过神券面板
    function showShenquanJoinedPanel() {
        var html_str = $.tmpl($.trim($('#JsShuang12ShenquanJoinedPanel').html()))({})
        var config = {
            withMask: true,
            className: 'shuang12-shenquan-panel'
        }
        tcb.showDialog(html_str, config)
    }
    // 显示砸金蛋中奖面板
    function showGoldenEggsBingoPanel() {
        var html_str = $.tmpl($.trim($('#JsShuang12GoldenEggsBingoPanel').html()))({})
        var config = {
            withMask: true,
            className: 'shuang12-golden-eggs-panel'
        }
        tcb.showDialog(html_str, config)
    }
    // 显示砸金蛋已参加面板
    function showGoldenEggsJoinedPanel() {
        var html_str = $.tmpl($.trim($('#JsShuang12GoldenEggsJoinedPanel').html()))({})
        var config = {
            withMask: true,
            className: 'shuang12-golden-eggs-panel'
        }
        tcb.showDialog(html_str, config)
    }

});