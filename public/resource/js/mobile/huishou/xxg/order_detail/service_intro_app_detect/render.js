// 引导APP检测
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceIntroAppDetect = tcb.mix(window.XXG.ServiceIntroAppDetect || {}, {
        render: render,

        htmlServiceIntroAppDetectSelect: htmlServiceIntroAppDetectSelect,
        htmlServiceIntroAppDetectDirectScan: htmlServiceIntroAppDetectDirectScan,
        htmlServiceIntroAppDetectStep: htmlServiceIntroAppDetectStep,
        htmlServiceIntroAppScanStepGuide:htmlServiceIntroAppScanStepGuide
    })
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var renderHtml = window.XXG.BusinessCommon.renderHtml

    function render(data, $target, addType) {
        if (!($target && $target.length)) {
            return console.warn('$target必须存在')
        }
        var $Wrap = renderHtml(
            htmlTpl('#JsXxgOrderDetailServiceIntroAppDetectTpl', data),
            $target,
            addType || 'append'
        )
        return $Wrap
    }

    //=========== HTML输出 =============

    // 引导APP检测--方式选择
    function htmlServiceIntroAppDetectSelect() {
        var data = window.XXG.ServiceIntroAppDetect.rootData
        var isIphone = data.isIphone
        var isNotebook = data.isNotebook
        // 非一站式 && 纯回收，才支持上门转邮寄
        var isSupportShangmenToYouji = !data.isOneStopOrder && data.sfFixData.__recycle
        return htmlTpl('#JsXxgOrderDetailServiceIntroAppDetectSelectTpl', {
            isIphone: isIphone,
            isNotebook: isNotebook,
            isSupportShangmenToYouji: isSupportShangmenToYouji
        })
    }

    // 引导APP检测--直接扫码
    function htmlServiceIntroAppDetectDirectScan() {
        var data = window.XXG.ServiceIntroAppDetect.rootData
        var isIphone = data.isIphone
        var isNotebook = data.isNotebook
        return htmlTpl('#JsXxgOrderDetailServiceIntroAppDetectDirectScanTpl', {
            isIphone: isIphone,
            isNotebook: isNotebook
        })
    }

    // 引导APP检测--步骤引导
    function htmlServiceIntroAppDetectStep(type) {
        var data = window.XXG.ServiceIntroAppDetect.rootData
        var isIphone = data.isIphone
        var isMac = data.order
            && data.order.hs_model
            && data.order.hs_model.model
            && data.order.hs_model.model.model_name
            && RegExp(/.*mac.*/ig).test(data.order.hs_model.model.model_name || '')
        return htmlTpl('#JsXxgOrderDetailServiceIntroAppDetectStepTpl', {
            isIphone: isIphone,
            isMac: isMac,
            type: type
        })
    }

    // 引导APP检测--跳转到如何扫码引导
    function htmlServiceIntroAppScanStepGuide(type) {
        var data = window.XXG.ServiceIntroAppDetect.rootData
        var isIphone = data.isIphone
        var isMac = data.order
            && data.order.hs_model
            && data.order.hs_model.model
            && data.order.hs_model.model.model_name
            && RegExp(/.*mac.*/ig).test(data.order.hs_model.model.model_name || '')
        return htmlTpl('#JsXxgOrderDetailServiceIntroAppScanStepGuideTpl', {
            isIphone: isIphone,
            isMac: isMac,
            type: type
        })
    }

}()
