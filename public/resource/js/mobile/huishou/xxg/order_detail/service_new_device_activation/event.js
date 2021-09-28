// 订单详情服务--新机激活
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceNewDeviceActivation = tcb.mix(window.XXG.ServiceNewDeviceActivation || {}, {
        eventBind: eventBind,

        eventBindTakePhotoAndUpload: eventBindTakePhotoAndUpload
    })

    // 绑定事件
    function eventBind() {
        tcb.bindEvent({})
    }

    function eventBindTakePhotoAndUpload(options) {
        new window.TakePhotoUpload(options)
    }

}()
