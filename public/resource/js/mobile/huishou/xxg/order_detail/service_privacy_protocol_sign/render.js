// 用户隐私协议
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivacyProtocolSign = tcb.mix(window.XXG.ServicePrivacyProtocolSign || {}, {
        // render: render,

        htmlServicePrivacyProtocolSign: htmlServicePrivacyProtocolSign
    })
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var renderHtml = window.XXG.BusinessCommon.renderHtml

    function render(data, $target, addType) {
        if (!($target && $target.length)) {
            return console.warn('$target必须存在')
        }
        var $Wrap = renderHtml(
            htmlTpl('#JsMXxgOrderDetailServicePrivacyProtocolSignTpl', data),
            $target,
            addType || 'html'
        )

        return $Wrap
    }

    //=========== HTML输出 =============

    // 签约隐私协议
    function htmlServicePrivacyProtocolSign(data) {
        data = data || {}
        var rootData = window.XXG.ServicePrivateData.rootData
        rootData.servicePrivacyProtocol.version = data.version
        rootData.servicePrivacyProtocol.content = data.content
        return htmlTpl('#JsMXxgOrderDetailServicePrivacyProtocolSignTpl', rootData)
    }

}()
