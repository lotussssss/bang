// 远程验机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.ServiceRemoteCheck = tcb.mix(window.XXG.ServiceRemoteCheck || {}, {
        $Wrap: null,
        data: null,
        rootData: null,
        callbackStatusChangeDone: null,
        callbackStatusChangeBefore: null,
        setup: setup,
        init: init,
        start: start,
        setData: setData,
        getData: getData
    })

    function setup(options) {
        options = options || {}
        window.XXG.ServiceRemoteCheck.data = (options.data && options.data.serviceRemoteCheck) || {}
        window.XXG.ServiceRemoteCheck.rootData = options.data || {}
        window.XXG.ServiceRemoteCheck.callbackStatusChangeDone = options.callbackStatusChangeDone || tcb.noop
        window.XXG.ServiceRemoteCheck.callbackStatusChangeBefore = options.callbackStatusChangeBefore || tcb.noop
        window.XXG.ServiceRemoteCheck.eventBind(options.data)
        window.XXG.ServiceRemoteCheck.render(options.$target, options.addType)
        // window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus()
    }

    function init(next, final) {
        next()
    }

    function start(is_force_auth) {
        var rootData = window.XXG.ServiceRemoteCheck.rootData
        var order_id = rootData.order && rootData.order.order_id
        if (!order_id) {
            return console.warn('完犊子，订单id丢失了，快检查下是不是参数传错了！')
        }
        window.XXG.ServiceRemoteCheck.actionStartListen(order_id, is_force_auth)
    }

    function setData(key, val) {
        if (typeof key === 'object') {
            tcb.each(key, function (k, v) {
                k += ''
                v = k === 'remote_check_timeout' ? v * 1000 : v
                window.XXG.ServiceRemoteCheck.data[k] = v
                window['__' + k.toUpperCase()] = v
            })
        } else {
            key += ''
            val = key === 'remote_check_timeout' ? val * 1000 : val
            window.XXG.ServiceRemoteCheck.data[key] = val
            window['__' + key.toUpperCase()] = val
        }
    }

    function getData(key) {
        return key
            ? window.XXG.ServiceRemoteCheck.data[key]
            : window.XXG.ServiceRemoteCheck.data
    }

}()
