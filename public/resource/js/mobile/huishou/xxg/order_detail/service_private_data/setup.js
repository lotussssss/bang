// 隐私数据处理
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivateData = tcb.mix(window.XXG.ServicePrivateData || {}, {
        rootData: null,
        data: {
            type: ''
        },
        setup: setup,
        init: init
    })

    function setup(options) {
        options = options || {}
        window.XXG.ServicePrivateData.rootData = options.data || {}
        window.XXG.ServicePrivateData.callbackScanReassessAgain = options.callbackScanReassessAgain || tcb.noop
        window.XXG.ServicePrivateData.eventBind()
    }

    function init(next, final) {
        next()
    }

}()
