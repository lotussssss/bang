// 订单详情服务--新机激活
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceNewDeviceActivation = tcb.mix(window.XXG.ServiceNewDeviceActivation || {}, {
        apiSaveActivationEvidence: apiSaveActivationEvidence
    })

    /**
     * 保存新机激活拍照证据
     * @param data
     *      {
     *          order_id	订单号	Y	string	-
     *          img_url	所拍照片	Y	string	-
     *      }
     * @param callback
     * @param fail
     * @param options
     */
    function apiSaveActivationEvidence(data, callback, fail, options) {
        options = options || {}
        window.XXG.ajax({
            url: tcb.setUrl2('/xxgHs/doSaveActivationEvidence'),
            data: data,
            type: 'POST',
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(res.result)
                } else {
                    var errmsg = (res && res.errmsg) || '系统错误'
                    !options.silent && $.dialog.toast(errmsg)
                    typeof fail === 'function' && fail(errmsg)
                }
            },
            error: function (err) {
                var errmsg = (err && err.statusText) || '系统错误'
                !options.silent && $.dialog.toast(errmsg)
                typeof fail === 'function' && fail(errmsg)
            }
        })
    }

}()
