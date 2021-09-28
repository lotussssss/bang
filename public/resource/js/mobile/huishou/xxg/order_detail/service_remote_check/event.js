// 远程验机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.ServiceRemoteCheck = tcb.mix(window.XXG.ServiceRemoteCheck || {}, {
        eventBind: eventBind
    })

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
        // 绑定事件
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
            case 'service-remote-check-reject-re-submit':
                // 提交远程验机驳回后重新传的照片
                isContinue = false
                window.XXG.ServiceRemoteCheck.actionRemoteCheckRejectReSubmit($trigger, data)
                break
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
