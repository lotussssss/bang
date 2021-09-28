// 引导APP检测
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceIntroAppDetect = tcb.mix(window.XXG.ServiceIntroAppDetect || {}, {
        rootData: null,
        data: {
            type: ''
        },
        callbackBeforeSelect: null,
        setup: setup,
        init: init
    })

    function setup(options) {
        options = options || {}
        window.XXG.ServiceIntroAppDetect.rootData = options.data || {}
        window.XXG.ServiceIntroAppDetect.callbackBeforeShowSelect = options.callbackBeforeShowSelect || callbackBeforeShowSelect
        window.XXG.ServiceIntroAppDetect.callbackBeforeTriggerScanQRCode = options.callbackBeforeTriggerScanQRCode || callbackBeforeTriggerScanQRCode
        window.XXG.ServiceIntroAppDetect.eventBind()
    }

    function init(next, final) {
        next()
    }

    function callbackBeforeShowSelect(next) {
        next()
    }

    function callbackBeforeTriggerScanQRCode(next) {
        next()
    }

}()
