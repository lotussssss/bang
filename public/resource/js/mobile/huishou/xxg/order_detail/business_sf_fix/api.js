!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFix = tcb.mix(window.XXG.BusinessSfFix || {}, {
        apiSfFixConfirmNewDeviceReceived: apiSfFixConfirmNewDeviceReceived,
        apiSfFixPayment: apiSfFixPayment,
        apiSfFixReturn: apiSfFixReturn,
        apiGetSfFixPaymentStatus: apiGetSfFixPaymentStatus
    })

    // 确认新机收货
    function apiSfFixConfirmNewDeviceReceived(order_id, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/m/sfFixConfirmNewDeviceReceived'),
            data: {'order_id': order_id},
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 补差款/全款购新
    // 返回值 paymentUrl
    function apiSfFixPayment(data, callback, fail) {
        // var data = {
        //     'order_id': order_id,
        //     'only_new': '',
        //     'price': '',
        //     'imei': ''
        // }
        window.XXG.ajax({
            url: tcb.setUrl('/m/sfFixPayment'),
            type: 'POST',
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 新机/旧机退回
    function apiSfFixReturn(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/m/sfFixReturn'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 丰修扫码支付结果查询接口
    // 返回值 isPayment
    function apiGetSfFixPaymentStatus(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/m/getSfFixPaymentStatus'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    // $.dialog.toast((res && res.errmsg) || '系统错误')
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                // $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

}()
