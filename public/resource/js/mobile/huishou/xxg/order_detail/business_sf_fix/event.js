!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFix = tcb.mix(window.XXG.BusinessSfFix || {}, {
        eventBind: eventBind
    })

    // 丰修一站式换新---事件绑定
    function eventBind(data) {
        if (eventBind.__bind) {
            return
        }
        eventBind.__bind = true

        if (typeof __fnGoNext === 'function') {
            window.XXG.BusinessCommon &&
            window.XXG.BusinessCommon.eventBind &&
            window.XXG.BusinessCommon.eventBind.fnQueueGoNext &&
            window.XXG.BusinessCommon.eventBind.fnQueueGoNext.push(__fnGoNext)
        }
        tcb.bindEvent({})
    }

    // 事件--下一步（将会被加入的下一步的事件队列里）
    function __fnGoNext(e, $trigger, data) {
        var isContinue = true
        if (!__validGoNext($trigger)) {
            return false
        }
        var act = $trigger.attr('data-act')
        switch (act) {
            // start 丰修
            case 'confirm-received-new-device':
                // 确认新机收货
                isContinue = false
                window.XXG.BusinessSfFix.actionSfFixConfirmReceivedNewDevice($trigger)
                break
            case 'sf-fix-confirm-trade-in':
                // 丰修--确认换新（无差价直接换新，有差价先补差，再换新）
                isContinue = false
                window.XXG.BusinessSfFix.actionSfFixConfirmTradeIn($trigger, data)
                break
            case 'trigger-sf-fix-full-pay':
                // 丰修--触发旧机不成交（全款购机）
                isContinue = false
                window.XXG.BusinessSfFix.actionTriggerSfFixFullPay($trigger, data)
                break
            case 'sf-fix-full-pay':
                // 丰修--旧机不成交（全款购机）
                isContinue = false
                window.XXG.BusinessSfFix.actionSfFixFullPay($trigger, data)
                break
            case 'sf-fix-return-new':
                // 丰修--退回新机（旧不卖，新不买）
                isContinue = false
                window.XXG.BusinessSfFix.actionSfFixReturnNew($trigger, data)
                break
            case 'sf-fix-confirm':
                // 丰修纯上门回收--确认回收
                isContinue = false
                window.XXG.BusinessSfFix.actionSfFixConfirm($trigger, data)
                break
            case 'sf-fix-cancel-order':
                // 丰修纯上门回收--取消订单
                isContinue = false
                window.XXG.BusinessSfFix.actionSfFixCancelOrder($trigger, data)
                break
            // end 丰修
        }
        return isContinue
    }

    function __validGoNext($trigger) {
        if ($trigger && $trigger.length && $trigger.hasClass('btn-go-next-lock')) {
            return
        }
        return true
    }

}()
