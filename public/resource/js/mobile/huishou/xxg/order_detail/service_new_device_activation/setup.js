// 订单详情服务--新机激活
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceNewDeviceActivation = tcb.mix(window.XXG.ServiceNewDeviceActivation || {}, {
        rootData: null,
        $processBar: null,
        setup: setup,
        init: init
    })

    function setup(options) {
        options = options || {}
        window.XXG.ServiceNewDeviceActivation.rootData = options.data || {}
        window.XXG.ServiceNewDeviceActivation.eventBind()
    }

    function init(next, final) {
        next()
    }

}()
