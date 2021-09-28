!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        helperNowTime: helperNowTime,
        helperShowDialog: helperShowDialog,
        helperCloseDialog: helperCloseDialog,
        helperShowAlertConfirm: helperShowAlertConfirm,
        helperShowConfirm: helperShowConfirm
    })

    var NOW_PADDING = window.__NOW - Date.now()

    function helperNowTime() {
        return window.__NOW = Date.now() + NOW_PADDING
    }

    function helperShowDialog(content, options) {
        options = tcb.mix({
            middle: true
        }, options || {})
        options.className = options.className
            ? [options.className, 'dialog-xxg-order-detail-v2020'].join(' ')
            : 'dialog-xxg-order-detail-v2020'
        if (options.fromBottom) {
            delete options.middle
        }
        return tcb.showDialog(content, options)
    }

    function helperCloseDialog(dialogInst) {
        tcb.closeDialog(dialogInst)
    }

    // 确认提示
    function helperShowAlertConfirm(callback, content, options) {
        callback = typeof callback === 'function' ? callback : tcb.noop
        options = options || {}
        var title = options.title || ''
        var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderDetailBusinessCommonAlertConfirmTpl').html())),
            html_st = html_fn({
                content: content,
                title: title,
                noWrap: options.noWrap || false,
                className: options.className || '',
                noTitle: options.noTitle || false
            })
        var $alert = $.dialog.alert(html_st, callback, options.options)
        !options.withoutClose && $alert.find('.close').show()
        return $alert
    }

    // 确认、取消提示
    function helperShowConfirm(content, options) {
        var callbackConfirm = typeof options.callbackConfirm === 'function' ? options.callbackConfirm : tcb.noop
        var callbackCancel = typeof options.callbackCancel === 'function' ? options.callbackCancel : tcb.noop
        options = options || {}
        var title = options.title || ''
        var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderDetailBusinessCommonAlertConfirmTpl').html())),
            html_st = html_fn({
                content: content,
                title: title,
                noWrap: options.noWrap || false,
                className: options.className || '',
                noTitle: options.noTitle || false
            })
        return $.dialog.confirm(html_st, callbackConfirm, callbackCancel, options.options)
    }

}()

