!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }

    window.SuningOneStopOrder = {
        checkOneStopPriceLetThrough: checkOneStopPriceLetThrough,
        confirmGoToPriceDifference: confirmGoToPriceDifference
    }

    // 获取一站式换新机信息
    function getOneStopOrderInfo(order_id) {
        window.XXG.ajax({
            url: tcb.setUrl('/xxgHs/getOneStopOrderInfo'),
            data: {'order_id': order_id},
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    var result = res.result
                    var diffPrice = result.diffPrice || {}
                    var buyInfo = result.buyInfo || null
                    var suning_one_stop_notice_customer = tcb.queryUrl(window.location.search)['suning_one_stop_notice_customer']
                    window.__IS_ONE_STOP_ORDER_TCB_PAY = !diffPrice.beacon
                    window.__IS_ONE_STOP_ORDER_NO_DIFF = !diffPrice.price
                    // buyInfo存在，并且属性1或2或18或19或20有值，或者query中suning_one_stop_notice_customer有值，表示客户支付成功
                    window.__IS_ONE_STOP_ORDER_SUCCESS = !!((buyInfo && (buyInfo[1] || buyInfo[2] || buyInfo[18] || buyInfo[19] || buyInfo[20])) || suning_one_stop_notice_customer)
                    var $rowBtnSuningOneStopOrder = $('.row-btn-suning-one-stop-order')
                    $rowBtnSuningOneStopOrder.show()
                    if (window.__IS_ONE_STOP_ORDER_SUCCESS) {
                        $rowBtnSuningOneStopOrder.find('.col-12-5').hide()
                        $rowBtnSuningOneStopOrder.find('.col-12-7').css('width', '100%')
                    }
                    renderOneStopOrderInfo(result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误')
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
            }
        })
    }

    // 校验一站式换新金额允许继续（差异款是否大于冻结款）
    function checkOneStopPriceLetThrough(order_id) {
        window.XXG.ajax({
            url: tcb.setUrl('/xxgHs/checkOneStopPriceLetThrough'),
            data: {'order_id': order_id},
            beforeSend: function () {},
            success: function (res) {
                if (res && !res.errno) {
                    var html_fn = $.tmpl($.trim($('#JsMXxgSuningOneStopOrderConfirmTpl').html()))
                    var html_st = html_fn({
                        order_id: order_id
                    })
                    tcb.showDialog(html_st, {
                        middle: true
                    })
                } else {
                    var html_fn = $.tmpl($.trim($('#JsMXxgSuningOneStopOrderTooMuchThanLockedTpl').html()))
                    var html_st = html_fn()
                    tcb.showDialog(html_st, {
                        middle: true
                    })
                    // $.dialog.toast((res && res.errmsg) || '系统错误')
                }
            },
            error: function (err) {
                $.dialog.toast((err && err.statusText) || '系统错误')
            }
        })
    }

    function renderOneStopOrderInfo(data) {
        // data = {
        //     'suningOneStopOrder': {
        //         'productName': 'iPhone 11 金色 64G 全网通',
        //         'userMobile': '13520065308',
        //         'suningOrderId': '123456',
        //         'suningOrderStatus': '已下单22',
        //         'statusUpdateTime': null
        //     },
        //     'diffPrice': {
        //         'price': 734,
        //         'subsidyPrice': 100,
        //         'beacon': true
        //     },
        //     'buyInfo': {
        //         'id': 1,
        //         'pay_id': '1909264714754679290',
        //         'order_id': '1909236207230131770',
        //         'supplement_type': '1',
        //         'pay_type': 'alipay',
        //         'pay_status': '10',
        //         'pay_price': '73400',
        //         'seller_id': '2019052365376141',
        //         'pay_desc': '',
        //         'created_at': '2019-10-15 17:16:28',
        //         'updated_at': '2019-10-15 17:16:28'
        //     }
        // }
        data = data || {}
        data.orderInfo = window.__ORDER_INFO || {}
        var html_fn = $.tmpl($.trim($('#JsMXxgOrderSuningOneStopOrderTpl').html())),
            html_st = html_fn(data),
            $BlockOrderOneStopOrder = $('.block-order-suning-one-stop-order')

        $BlockOrderOneStopOrder.show().html(html_st)
        $BlockOrderOneStopOrder.find('.js-trigger-copy-the-text').each(function () {
            new ClipboardJS(this).on('success', function (e) {
                $.dialog.toast('复制成功：' + e.text)
            })
        })
    }

    function confirmGoToPriceDifference(order_id) {
        var url = tcb.setUrl2('/xxgHs/supplementAmountPay', {
            order_id: order_id
        })
        window.location.href = url
    }

    function bindEvent() {
        tcb.bindEvent({
            // 全款购机
            '.js-trigger-suning-one-stop-full-pay': function (e) {
                e.preventDefault()
                if (window.__IS_SHOW_DAODIAN_SERVER_TIME &&
                    (!window.__DAODIAN_REACH_TIME || window.__DAODIAN_REACH_TIME === '0000-00-00 00:00:00')) {
                    return $.dialog.toast('请选择到店时间')
                }
                var $me = $(this)
                var order_id = $me.attr('data-order-id')
                var url = tcb.setUrl2('/xxgHs/fullAmountPay', {
                    order_id: order_id
                })
                window.location.href = url
            },
            // 确认进入补差价
            '.js-trigger-suning-one-stop-order-confirm-submit': function (e) {
                e.preventDefault()
                tcb.closeDialog()
                window.__IS_ONE_STOP_ORDER_CONTINUE = true
                $('#FormUpdateOrderInfoByGoNext').trigger('submit')
            },
            // 取消进入补差价
            '.js-trigger-suning-one-stop-order-confirm-cancel': function (e) {
                e.preventDefault()
                tcb.closeDialog()
            }
        })
    }

    function init() {
        if (!window.__IS_ONE_STOP_ORDER || window.__IS_SF_FIX_ONE_STOP_ORDER) {
            return
        }
        // DOM Ready
        $(function () {
            var order_id = window.__ORDER_ID
            bindEvent()
            getOneStopOrderInfo(order_id)
        })
    }

    init()
}()
