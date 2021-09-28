// 拍照上传
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceUploadPicture = tcb.mix(window.XXG.ServiceUploadPicture || {}, {
        // data: null,
        rootData: null,
        fnQueueSubmitSuccess: [],
        setup: setup,
        init: init,
        show: show,
    })

    // 显示拍照上传页
    function setup(options) {
        options = options || {}
        var rootData = options.data || {}
        window.XXG.ServiceUploadPicture.rootData = rootData
    }

    function init(next, final) {
        next()
    }

    function show() {
        window.XXG.ServiceUploadPicture.actionShow()
    }

}()
