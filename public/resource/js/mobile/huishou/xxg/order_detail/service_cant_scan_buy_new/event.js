// 无法扫码检测旧机，直接购买新机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceCantScanBuyNew = tcb.mix(window.XXG.ServiceCantScanBuyNew || {}, {
        eventBind: eventBind
    })

    // 绑定事件
    function eventBind(data) {
        tcb.bindEvent({
            // 触发直接购买新机
            '.js-trigger-service-cant-scan-buy-new': function (e) {
                e.preventDefault()
                window.XXG.ServiceCantScanBuyNew.actionCantScanBuyNew(data)
            }
        })
    }

}()
