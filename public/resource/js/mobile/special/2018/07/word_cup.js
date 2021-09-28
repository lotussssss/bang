;
!function () {
    var wxData = {},
        champion_team = window.__CHAMPION_TEAM

    // 微信分享的数据
    wxData = {
        "title": "稳了！今年的冠军就是"+getChampion()+"，不服来辩！",
        "desc": "竞猜世界杯，加价赢不停！",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
        "imgUrl": 'https://p0.ssl.qhmsg.com/t0138c2835e97ead4c0.jpg',
        "success": shareSuccess, // 用户确认分享的回调
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
    // 设置支持App分享
    function __appSetShareSupport(){
        // 设置分享的数据
        tcb.js2AppSetShareData(wxData)

        // 设置支持的分享方式，不传任何参数，那么表示支持默认的分享方式
        tcb.js2AppSetShareSupport ({
            'onMenuCopyUrl' : 0
        })
    }
    __appSetShareSupport()

    var first_share_flag = false
    // 已登录用户分享成功
    function shareSuccess(){
        // 首次分享弹窗提示
        if(first_share_flag){
            showShareSuccessDialog()
        }
        // 分享成功回调
        $.get('/huodong/doCupShare',function (res) {
            res = $.parseJSON(res)

            if(!res['errno']&&res['result']){
                var beishu = res['result']['beishu']

                $('.guess-beishu').html(beishu)
                first_share_flag = false
            }
        })
        window.Bang.ShareIntro.close()
    }
    // 首次分享成功弹窗
    function showShareSuccessDialog() {
        var html_str = $.tmpl($.trim($('#JsMWordCupShareSuccessPanelTpl').html()))(),
            config = {
                middle: true,
                withClose : true,
                className: 'share-success-panel submit-panel'
            }
        tcb.showDialog(html_str, config)
    }
    // 获取冠军队名
    function getChampion() {
        return champion_team || $('.block-guess-champion .team-name').eq(0).html()
    }

    function updateWxData(k, v) {
        wxData[k] = v
    }

    $(function () {
        var champion_id = '',
            third_id = ''

        tcb.bindEvent(document.body, {
            // 登录
            '.js-trigger-login':function (e) {
                e.preventDefault()

                var $me = $(this)
                if($me.hasClass('disabled')){
                    return
                }

                showCommonLoginPanel(function () {
                    setTimeout(function () {
                        window.location.reload()
                    },100)
                })
            },
            // 选择球队
            '.guess-item':function (e) {
                e.preventDefault()

                if(window.__IS_JINGCAI){
                    return
                }
                var $me = $(this),
                    team_champion_id = $me.attr('data-champion-id'),
                    team_third_id = $me.attr('data-third-id')

                $me.addClass('cur').siblings('.cur').removeClass('cur')

                team_champion_id && (champion_id = team_champion_id)
                team_third_id && (third_id = team_third_id)
            },
            // 点击提交按钮
            '.js-trigger-submit':function (e) {
                e.preventDefault()

                var $me = $(this)

                if(champion_id&&third_id){
                    showSubmitConfirmDialog()
                }else{
                    showSubmitFailDialog()
                }
            },
            // 点击确认提交
            '.js-trigger-confirm':function (e) {
                e.preventDefault()

                function _submitCupJingCai() {
                    $.post('/huodong/doCupJingCai',{
                        champion_id :champion_id,
                        third_id : third_id

                    }, function (res) {
                        res = $.parseJSON(res)

                        tcb.closeDialog()

                        if (!res['errno']) {
                            // 提交成功弹窗
                            showSubmitSuccessDialog()

                            first_share_flag = true
                            window.__IS_JINGCAI = true

                            champion_team = $('[data-champion-id="'+champion_id+'"]').find('.team-name').html()
                            updateWxData('title', "稳了！今年的冠军就是"+getChampion()+"，不服来辩！")

                            $('.js-trigger-submit').addClass('js-trigger-share').removeClass('js-trigger-submit').html('邀请好友 奖励翻倍')
                        }else if (res['errno'] == 208) {
                            // 未登录
                            showCommonLoginPanel(function () {
                                _submitCupJingCai()
                            })
                        }else{
                            $.dialog.toast(res['errmsg'], 2000)
                            setTimeout(function () {
                                window.location.reload()
                            }, 2000)
                        }
                    })
                }
                _submitCupJingCai()
            },
            // 关闭弹窗
            '.js-trigger-close':function (e) {
                e.preventDefault()

                tcb.closeDialog()
            },
            // 分享
            '.js-trigger-share':function (e) {
                e.preventDefault()

                tcb.closeDialog()
                // 触发显示分享引导
                showShareIntro()
            }
        })

        // 登录
        function showCommonLoginPanel(success_cb) {
            tcb.showCommonLoginPanel({
                action_url : '/user/dologin',
                withClose : true,
                success_cb : function (res) {
                    // 登录后的公共操作
                    var mobile = $('.ui-common-login-dialog [name="mobile"]').val()
                    mobile = mobile.substring(0,3)+'****'+mobile.substring(7)
                    $('.js-trigger-login').html(mobile).addClass('disabled')

                    success_cb(res)
                }
            })
        }
        // 提交确认弹窗
        function showSubmitConfirmDialog() {
            var html_str = $.tmpl($.trim($('#JsMWordCupSubmitConfirmPanelTpl').html()))(),
                config = {
                    middle: true,
                    withClose : true,
                    className: 'submit-confirm-panel submit-panel'
                }
            tcb.showDialog(html_str, config)
        }
        // 提交成功弹窗
        function showSubmitSuccessDialog() {
            var html_str = $.tmpl($.trim($('#JsMWordCupSubmitSuccessPanelTpl').html()))(),
                config = {
                    middle: true,
                    withClose : true,
                    className: 'submit-success-panel submit-panel'
                }
            tcb.showDialog(html_str, config)
        }
        // 提交失败弹窗
        function showSubmitFailDialog() {
            var html_str = $.tmpl($.trim($('#JsMWordCupSubmitFailPanelTpl').html()))(),
                config = {
                    middle: true,
                    withClose : true,
                    className: 'submit-fail-panel submit-panel'
                }
            tcb.showDialog(html_str, config)
        }
        // 触发显示分享引导
        function showShareIntro(){
            // 触发显示分享引导
            window.Bang.ShareIntro.active({
                img : 'https://p0.ssl.qhmsg.com/t01685eb9db600d05c8.png',
                ext_html: '<div style="padding-top:.1rem;font-size: .16rem;text-align: center;color: #fff;">邀请好友奖励翻倍<br>点击右上角分享哦！</div>'
            })
        }
        // 倒计时
        function startCountdown () {
            var targettime = Date.parse (window.__TARGETTIME.replace (/-/g, '/')),
                curtime = window.__NOW || (new Date ()).getTime (),
                $target = $ ('.js-countdown')

            window.Bang.startCountdown (targettime, curtime, $target, {})
        }
        startCountdown ()
    })
} ()