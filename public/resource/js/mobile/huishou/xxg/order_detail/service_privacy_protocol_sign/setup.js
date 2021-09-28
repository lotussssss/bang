// 用户隐私协议
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivacyProtocolSign = tcb.mix(window.XXG.ServicePrivacyProtocolSign || {}, {
        rootData: null,
        data: {
            isRead: false,
            signature: ''
        },
        $Wrap: null,
        callbackConfirmAgree: null,
        setup: setup,
        init: init
    })

    // 显示拍照上传页
    function setup(options) {
        options = options || {}
        var rootData = options.data || {}
        window.XXG.ServicePrivacyProtocolSign.rootData = rootData
        window.XXG.ServicePrivacyProtocolSign.callbackConfirmAgree = options.callbackConfirmAgree || tcb.noop
    }

    function init(next, final) {
        next()
    }

}()
