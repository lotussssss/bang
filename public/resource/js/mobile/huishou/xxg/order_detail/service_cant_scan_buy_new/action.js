// 无法扫码检测旧机，直接购买新机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceCantScanBuyNew = tcb.mix(window.XXG.ServiceCantScanBuyNew || {}, {
        actionCantScanBuyNew: actionCantScanBuyNew
    })

    // 无法检测旧机，直接购买新机
    function actionCantScanBuyNew(data) {
        var order = data.order || {}
        var status = order.status
        var order_id = order.order_id
        window.XXG.BusinessCommon.helperShowConfirm('用户明确表示直接购买新机么？', {
            noTitle: true,
            options: {
                className: 'dialog-confirm-cant-scan-buy-new',
                textConfirm: '已明确表示购买新机',
                lock: 10
            },
            callbackConfirm: function () {
                if (status == 11) {
                    var $btn = $('<a href="#" data-order-id="' + order_id + '" data-now-status="11" data-next-status="12"></a>')
                    tcb.loadingStart()
                    window.XXG.BusinessCommon.apiActionBeforeArrive($btn,
                        function () {
                            tcb.loadingDone()
                            order.status = 12
                            window.XXG.ServiceCantScanBuyNew.callbackConfirm &&
                            window.XXG.ServiceCantScanBuyNew.callbackConfirm()
                        },
                        function () {
                            tcb.loadingDone()
                        }
                    )
                } else if (status == 12) {
                    window.XXG.ServiceCantScanBuyNew.callbackConfirm &&
                    window.XXG.ServiceCantScanBuyNew.callbackConfirm()
                } else {
                    $.dialog.toast('订单状态异常')
                }
                // window.XXG.redirect()
            }
        })
    }

}()
