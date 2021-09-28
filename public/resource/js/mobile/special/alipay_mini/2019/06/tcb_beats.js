;(function () {
    // 非 小程序租机页面,直接返回
    if (window.__PAGE !== 'alipay-mini-2019-06-tcb-beats') {
        return
    }

    // 判断是否为支付宝小程序内使用,默认为 false(非小程序内部)
    var isAlipayClient = window.__isAlipayClient || ''

    // 底部立即评估按钮
    $('.pinggu-btn').on('click', function (e) {
        // 是支付宝小程序内部,则跳转调用支付宝小程序方法
        if (isAlipayClient) {

            my.navigateTo({url: '/pages/model/model'})

        } else {  // 非支付宝小程序内部

            window.location.href = 'https://ds.alipay.com/i/index.htm?iframeSrc=alipays%3A%2F%2Fplatformapi%2Fstartapp%3FappId%3D2018071760672313'

        }
    })

})()