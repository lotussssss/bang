// 纯回收上门转邮寄
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceShangmenToYouji = tcb.mix(window.XXG.ServiceShangmenToYouji || {}, {
        eventBind: eventBind,
        eventBindSelectReason: eventBindSelectReason
    })

    // 绑定事件
    function eventBind() {
        tcb.bindEvent({
            // 触发上门转邮寄选择框
            '.js-trigger-service-shangmen-to-youji': function (e) {
                e.preventDefault()
                window.XXG.BusinessCommon.helperCloseDialog()
                window.XXG.ServiceShangmenToYouji.actionShowServiceShangmenToYoujiReasonList()
            }
        })
    }

    function eventBindSelectReason($wrap) {
        $wrap.find('.js-trigger-service-shangmen-to-youji-select-reason').on('click', function (e) {
            e.preventDefault()
            var $me = $(this)
            $me.addClass('reason-item-selected').siblings('.reason-item-selected').removeClass('reason-item-selected')
        })
        $wrap.find('.js-trigger-service-shangmen-to-youji-submit').on('click', function (e) {
            e.preventDefault()
            var $me = $(this)
            var $reasonList = $me.closest('.service-shangmen-to-youji-reason-list')
            var $selected = $reasonList.find('.reason-item-selected')
            if ($selected && $selected.length) {
                window.XXG.ServiceShangmenToYouji.actionCloseServiceShangmenToYoujiReasonList()
                return window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                    tcb.loadingStart()
                    window.XXG.ServiceShangmenToYouji.actionConfirmServiceShangmenToYouji()
                    window.XXG.ServiceShangmenToYouji.callbackConfirm(function () {
                        setTimeout(function () {
                            tcb.loadingDone()
                        }, 1000)
                    })
                }, '告知客户，旧机将邮寄到检测中心<br>进行检测，检测后会有客服联系打款', {
                    noTitle: true,
                    // withoutClose: true,
                    options: {
                        btn: '已告知用户，将本订单转为邮寄'
                    }
                })
            }
            $reasonList.find('.js-trigger-service-shangmen-to-youji-select-reason').shine4Error()
            $.dialog.toast('请选择原因')
        })
    }
}()
