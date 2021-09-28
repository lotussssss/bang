// 远程验机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.ServiceRemoteCheck = tcb.mix(window.XXG.ServiceRemoteCheck || {}, {
        apiRemoteCheckAuth: apiRemoteCheckAuth,
        apiRemoteCheckOrderPush: apiRemoteCheckOrderPush,
        apiGetRemoteCheckOptions: apiGetRemoteCheckOptions
    })

    // 获取远程验机信息
    function apiGetRemoteCheckOptions(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl2('/m/getRemoteCheckProcess'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (err) {
                typeof fail === 'function' && fail(err)
            }
        })
    }

    // 远程验机校权
    function apiRemoteCheckAuth(url, data, callback, fail) {
        window.XXG.ajax({
            url: url,
            data: data,
            method: 'POST',
            xhrFields: {withCredentials: true},
            beforeSend: function () {},
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (err) {
                typeof fail === 'function' && fail(err)
            }
        })
    }

    // 将远程验机加入队列，并且获取远程验机id，
    function apiRemoteCheckOrderPush(url, data, callback, fail) {
        window.XXG.ajax({
            url: url,
            data: data,
            method: 'POST',
            xhrFields: {withCredentials: true},
            beforeSend: function () {},
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (err) {
                typeof fail === 'function' && fail(err)
            }
        })
    }

}()
