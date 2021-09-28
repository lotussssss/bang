// 订单详情服务--新机激活
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceNewDeviceActivation = tcb.mix(window.XXG.ServiceNewDeviceActivation || {}, {

        htmlServiceNewDeviceActivationUpload: htmlServiceNewDeviceActivationUpload,
        htmlServiceNewDeviceActivationUploadProgress: htmlServiceNewDeviceActivationUploadProgress,
    })
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var renderHtml = window.XXG.BusinessCommon.renderHtml


    //=========== HTML输出 =============

    // 新机激活--拍照弹窗
    function htmlServiceNewDeviceActivationUpload() {
        return htmlTpl('#JsXxgOrderDetailServiceNewDeviceActivationUploadTpl')
    }

    // 新机激活--拍照上传进度条
    function htmlServiceNewDeviceActivationUploadProgress() {
        return htmlTpl('#JsXxgOrderDetailServiceNewDeviceActivationUploadProgressTpl')
    }

}()
