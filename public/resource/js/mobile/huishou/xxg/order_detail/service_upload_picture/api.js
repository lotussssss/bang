// 拍照上传
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceUploadPicture = tcb.mix(window.XXG.ServiceUploadPicture || {}, {
        apiGetPicture: apiGetPicture,
        apiUpdatePicture: apiUpdatePicture,
        apiGetUploadPictureShootRule: apiGetUploadPictureShootRule
    })

    // 获取指定order_id已经上传的图片
    function apiGetPicture(order_id, callback) {
        window.XXG.ajax({
            url: '/m/doGetPingzheng',
            data: {
                order_id: order_id
            },
            success: function (res) {
                if (!res.errno) {
                    $.isFunction(callback) && callback(res)
                } else {
                    $.dialog.toast(res.errmsg)
                }
            },
            error: function (err) {
                $.dialog.toast('系统错误，请稍后重试')
            }
        })
    }

    function apiUpdatePicture(data, callback, fail) {
        window.XXG.ajax({
            url: '/m/doUpdatePingzheng',
            type: 'POST',
            data: data,
            success: function (res) {
                if (!res.errno) {
                    $.isFunction(callback) && callback(res)
                } else {
                    $.dialog.toast(res.errmsg)
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 获取上传图片的规则列表
    function apiGetUploadPictureShootRule(data, callback, fail) {
        window.XXG.ajax({
            url: '/Recycle/Engineer/getShootRule',
            data: data,
            success: function (res) {
                if (!res.errno) {
                    $.isFunction(callback) && callback(res)
                } else {
                    $.dialog.toast(res.errmsg)
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

}()
