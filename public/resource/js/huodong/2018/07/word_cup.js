;
!function () {
    $(function () {
        var champion_id = '',
            third_id = ''

        tcb.bindEvent(document.body, {
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

                            window.__IS_JINGCAI = true
                        }else if (res['errno'] == 208) {
                            // 未登录
                            showCommonLoginPanel(function () {
                                _submitCupJingCai()
                            })
                        }else{
                            setTimeout(function () {
                                alert(res['errmsg'])
                                window.location.reload()
                            }, 0)
                        }
                    })
                }
                _submitCupJingCai()
            },
            // 关闭弹窗
            '.js-trigger-close':function (e) {
                e.preventDefault()

                tcb.closeDialog()
            }
        })

        // 登录
        function showCommonLoginPanel(success_cb) {
            tcb.showCommonLoginPanel({
                action_url : '/user/dologin',
                withClose : true,
                success_cb:success_cb
            })
        }
        // 提交确认弹窗
        function showSubmitConfirmDialog() {
            var html_str = $.tmpl($.trim($('#JsWordCupSubmitConfirmPanelTpl').html()))(),
                config = {
                    middle: true,
                    withClose : true,
                    className: 'submit-confirm-panel submit-panel'
                }
            tcb.showDialog(html_str, config)
        }
        // 提交成功弹窗
        function showSubmitSuccessDialog() {
            var html_str = $.tmpl($.trim($('#JsWordCupSubmitSuccessPanelTpl').html()))(),
                config = {
                    middle: true,
                    withClose : true,
                    className: 'submit-success-panel submit-panel'
                }
            tcb.showDialog(html_str, config)
        }
        // 提交失败弹窗
        function showSubmitFailDialog() {
            var html_str = $.tmpl($.trim($('#JsWordCupSubmitFailPanelTpl').html()))(),
                config = {
                    middle: true,
                    withClose : true,
                    className: 'submit-fail-panel submit-panel'
                }
            tcb.showDialog(html_str, config)
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