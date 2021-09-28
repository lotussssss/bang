// 无法扫码检测旧机，直接购买新机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceCantScanBuyNew = tcb.mix(window.XXG.ServiceCantScanBuyNew || {}, {
        callbackConfirm: null,
        rootData: null,
        setup: setup,
        init: init
    })

    function setup(options) {
        options = options || {}
        window.XXG.ServiceCantScanBuyNew.rootData = options.data || {}
        window.XXG.ServiceCantScanBuyNew.callbackConfirm = options.callbackConfirm || tcb.noop
        window.XXG.ServiceCantScanBuyNew.eventBind(options.data)
    }

    function init(next, final) {
        next()
    }

}()
