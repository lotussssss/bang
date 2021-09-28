// 纯回收上门转邮寄
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceShangmenToYouji = tcb.mix(window.XXG.ServiceShangmenToYouji || {}, {
        actionShowServiceShangmenToYoujiReasonList: actionShowServiceShangmenToYoujiReasonList,
        actionCloseServiceShangmenToYoujiReasonList: actionCloseServiceShangmenToYoujiReasonList,
        actionConfirmServiceShangmenToYouji: actionConfirmServiceShangmenToYouji,
        actionIsConverted: actionIsConverted
    })

    function actionShowServiceShangmenToYoujiReasonList() {
        var html_st = window.XXG.ServiceShangmenToYouji.htmlReasonList()
        var inst = window.XXG.BusinessCommon.helperShowDialog(html_st, {
            withClose: true,
            fromBottom: true
        })
        // 绑定相应事件
        window.XXG.ServiceShangmenToYouji.eventBindSelectReason(inst.wrap)
    }

    function actionCloseServiceShangmenToYoujiReasonList() {
        window.XXG.BusinessCommon.helperCloseDialog()
    }

    function actionConfirmServiceShangmenToYouji() {
        if (tcb.supportLocalStorage()) {
            var storage = window.localStorage
            var rootData = window.XXG.ServiceShangmenToYouji.rootData
            var order_id = rootData.order && rootData.order.order_id
            if (order_id) {
                storage.setItem('service-shangmen-to-youji-' + order_id, 1)
            }
        }
    }

    function actionIsConverted() {
        if (tcb.supportLocalStorage()) {
            var storage = window.localStorage
            var rootData = window.XXG.ServiceShangmenToYouji.rootData
            var order_id = rootData.order && rootData.order.order_id
            if (order_id) {
                return !!storage.getItem('service-shangmen-to-youji-' + order_id, 1)
            }
        }
        return false
    }

}()
