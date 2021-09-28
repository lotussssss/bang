// 纯回收上门转邮寄
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceShangmenToYouji = tcb.mix(window.XXG.ServiceShangmenToYouji || {}, {
        callbackConfirm: null,
        rootData: null,
        setup: setup,
        init: init
    })

    function setup(options) {
        options = options || {}
        window.XXG.ServiceShangmenToYouji.rootData = options.data || {}
        window.XXG.ServiceShangmenToYouji.callbackConfirm = options.callbackConfirm || tcb.noop
        window.XXG.ServiceShangmenToYouji.eventBind()
    }

    function init(next, final) {
        next()
    }

}()
