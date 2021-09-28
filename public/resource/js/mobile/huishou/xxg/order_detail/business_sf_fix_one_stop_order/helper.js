!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFixOneStopOrder= tcb.mix(window.XXG.BusinessSfFixOneStopOrder|| {}, {
        helperShowOrderSuccessPanel: helperShowOrderSuccessPanel,
        helperShowOrderFullPaySuccessPanel: helperShowOrderFullPaySuccessPanel,
        helperShowOrderCancelPanel: helperShowOrderCancelPanel,
    })

    // 回收成功
    function helperShowOrderSuccessPanel(data, callback) {
        var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderDetailBusinessSfFixOneStopOrderSuccessTpl').html())),
            html_st = html_fn(data || {})
        var dialogInst = tcb.showDialog(html_st, {
            withClose: false,
            fromBottom: true
        })
        var $wrap = dialogInst.wrap
        new ClipboardJS($wrap.find('.js-trigger-copy-the-text')[0]).on('success', function (e) {
            $.dialog.toast('复制成功：' + (e.text.replace(/\\n/ig, '<br>')))
        })

        $wrap.find('.btn-confirm').on('click', function (e) {
            e.preventDefault()
            tcb.closeDialog()

            typeof callback === 'function' && callback()
        })
    }

    // 全款购新成功
    function helperShowOrderFullPaySuccessPanel(data, callback) {
        var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderDetailBusinessSfFixOneStopOrderFullPaySuccessTpl').html())),
            html_st = html_fn(data || {})
        var dialogInst = tcb.showDialog(html_st, {
            withClose: false,
            fromBottom: true
        })
        dialogInst.wrap.find('.btn-confirm').on('click', function (e) {
            e.preventDefault()
            tcb.closeDialog()

            typeof callback === 'function' && callback()
        })
    }

    // 订单取消提示【退新机，不卖旧机】
    function helperShowOrderCancelPanel(data, callback) {
        var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderDetailBusinessSfFixOneStopOrderCancelTpl').html())),
            html_st = html_fn(data || {})
        var dialogInst = tcb.showDialog(html_st, {
            withClose: false,
            fromBottom: true
        })
        dialogInst.wrap.find('.btn-confirm').on('click', function (e) {
            e.preventDefault()
            tcb.closeDialog()

            typeof callback === 'function' && callback()
        })
    }

}()

