!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFixOneStopOrder = tcb.mix(window.XXG.BusinessSfFixOneStopOrder || {}, {
        apiGetOneStopOrderInfo: apiGetOneStopOrderInfo,
        apiCheckOneStopPriceLetThrough: apiCheckOneStopPriceLetThrough,
        apiGetSfFixSuningOneStopFullPaymentStatus: apiGetSfFixSuningOneStopFullPaymentStatus,
        apiGetSfFixSuningOneStopSupplementStatus: apiGetSfFixSuningOneStopSupplementStatus
    })
    var getCache = window.XXG.BusinessSfFixOneStopOrder.getCache
    var setCache = window.XXG.BusinessSfFixOneStopOrder.setCache

    // 获取一站式换新机信息
    function apiGetOneStopOrderInfo(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/xxgHs/getOneStopOrderInfo'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    var result = res.result
                    var diffPrice = result.diffPrice || {}
                    var buyInfo = result.buyInfo || null
                    var suning_one_stop_notice_customer = tcb.queryUrl(window.location.search)['suning_one_stop_notice_customer']

                    var hasBalance = !!diffPrice.price
                    setCache({
                        hasBalance: hasBalance,
                        isTcbPay: hasBalance && !diffPrice.beacon,
                        // buyInfo存在，并且属性1或2或18或19或20有值，或者query中suning_one_stop_notice_customer有值，表示客户支付成功
                        isPaySuccess: !!((buyInfo && (buyInfo[1] || buyInfo[2] || buyInfo[18] || buyInfo[19] || buyInfo[20])) || suning_one_stop_notice_customer)
                    })
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

    // 校验一站式换新金额允许继续（差异款是否大于冻结款）
    function apiCheckOneStopPriceLetThrough(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl2('/xxgHs/checkOneStopPriceLetThrough'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(true)
                } else {
                    typeof callback === 'function' && callback(false)
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
                typeof fail === 'function' && fail()
            }
        })
    }

    // 获取一站式换新机，全款购新补差扫码支付结果查询接口
    // 返回值 isPayment
    function apiGetSfFixSuningOneStopFullPaymentStatus(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/xxgHs/fullAmountSuc'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(true)
                } else {
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                typeof fail === 'function' && fail()
            }
        })
    }

    // 获取一站式换新机，用户支付补差扫码支付结果查询接口
    // 返回值 isPayment
    function apiGetSfFixSuningOneStopSupplementStatus(data, callback, fail) {
        window.XXG.ajax({
            url: tcb.setUrl('/xxgHs/oneStopSupplementSuc'),
            data: data,
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    typeof callback === 'function' && callback(true)
                } else {
                    typeof fail === 'function' && fail()
                }
            },
            error: function (err) {
                typeof fail === 'function' && fail()
            }
        })
    }

}()
