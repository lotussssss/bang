!function () {
    if (window.__PAGE != 'xxg-user-info') {
        return
    }
    $ (function () {
        tcb.bindEvent (document.body, {
            // 设置上下班
            '.js-btn-is-work': function (e) {
                e.preventDefault();
                __actionSetIsWork($(this))
            },
        })
        // 激活订单取消弹窗
        function __actionSetIsWork($btn) {
            if ($btn.hasClass('btn-disabled')) {
                return
            }
            var params = {
                is_work: $btn.data('flag')
            }
            var url = tcb.setUrl2('/m/changeEngineerWork', params)
            tcb.loadingStart()
            window.XXG.ajax({
                url: url,
                success: function (res) {
                    tcb.loadingDone()
                    if (!res.errno) {
                        setTimeout(function () {
                            window.XXG.redirect()
                        }, 10)
                    } else {
                        $.dialog.toast(res.errmsg)
                    }
                },
                error: function (res) {
                    tcb.loadingDone()
                    $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                }
            })
        }
    })
} ()