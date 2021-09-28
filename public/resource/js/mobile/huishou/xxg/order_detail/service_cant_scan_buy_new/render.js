// 无法扫码检测旧机，直接购买新机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceCantScanBuyNew = tcb.mix(window.XXG.ServiceCantScanBuyNew || {}, {
        render: render
    })
    var htmlTpl = window.XXG.BusinessCommon.htmlTpl
    var renderHtml = window.XXG.BusinessCommon.renderHtml

    function render(data, $target, addType) {
        if (!($target && $target.length)) {
            return console.warn('$target必须存在')
        }
        var $Wrap = renderHtml(
            htmlTpl('#JsXxgOrderDetailServiceCantScanBuyNewTpl', data),
            $target,
            addType || 'append'
        )
        return $Wrap
    }

    //=========== HTML输出 =============

}()
