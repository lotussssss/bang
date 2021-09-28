!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFix = tcb.mix(window.XXG.BusinessSfFix || {}, {
        actionSfFixConfirmReceivedNewDevice: doConfirmReceivedNewDevice,
        actionSfFixConfirmTradeIn: doSfFixConfirmTradeIn,
        actionTriggerSfFixFullPay: doTriggerSfFixFullPay,
        actionSfFixFullPay: doSfFixFullPay,
        actionSfFixReturnNew: doSfFixReturnNew,
        actionSfFixConfirm: doSfFixConfirm,
        actionSfFixCancelOrder: doSfFixCancelOrder
    })

    // 确认新机收货
    function doConfirmReceivedNewDevice($btn) {
        var order_id = $btn.attr('data-order-id')
        tcb.loadingStart()
        // 先确认收到新机，再更新订单状态
        window.XXG.BusinessSfFix.apiSfFixConfirmNewDeviceReceived(order_id,
            function () {
                window.XXG.BusinessCommon.apiActionBeforeArrive($btn,
                    function () {
                        window.XXG.redirect()
                    },
                    function () {
                        tcb.loadingDone()
                    }
                )
            },
            function () {
                tcb.loadingDone()
            }
        )
    }

    // 丰修--确认换新（无差价直接换新，有差价先补差，再换新）
    function doSfFixConfirmTradeIn($btn, data) {
        // if (!__validFinalPrice(data)) {
        //     // 还未提交成交价
        //     return
        // }
        var $Form = $('#FormUpdateOrderInfoByGoNext')
        if (!__validSfFixConfirm($Form)) {
            return
        }
        var formData = $Form.serialize()
        // var order = data.order
        // var params = {
        //     'order_id': order.order_id,
        //     'only_new': 0,
        //     'price': order.final_price,
        //     'imei': order.imei
        // }
        var params = tcb.queryUrl(formData)
        delete params.memo
        params.price = parseInt(params.price, 10)
        params.only_new = 0
        tcb.loadingStart()
        window.XXG.BusinessSfFix.apiSfFixPayment(params, function (res) {
            var paymentUrl = res && res.paymentUrl
            if (paymentUrl) {
                tcb.loadingDone()
                tcb.showDialog('<iframe frameborder="0" src="' + paymentUrl + '" style="overflow-y: auto;width: 100%;height: 20rem;max-height: 85vh;">', {
                    fromBottom: true,
                    onClose: function () {
                        __stopCheckPayment()
                    }
                })
                __startCheckPayment({
                    'order_id': params.order_id
                }, function () {
                    tcb.closeDialog()
                    __stopCheckPayment()
                    window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                        window.XXG.redirect()
                    }, '恭喜您支付成功！', {
                        withoutClose: true
                    })
                })
            } else {
                // 无需补差直接完成
                window.XXG.redirect()
                tcb.loadingDone()
                // window.XXG.BusinessCommon.apiFinishOrder($btn, function (res_finish) {
                //     window.XXG.redirect()
                //     tcb.loadingDone()
                //     // window.__SHOW_CASH_FLAG = res.result.show_cash_flag
                //     // window.showPageCustomerServiceComplete && window.showPageCustomerServiceComplete()
                // }, function () {
                //     tcb.loadingDone()
                // })
            }
        }, function () {
            tcb.loadingDone()
        })
    }

    // 验证是否已经有了成交价
    function __validFinalPrice(data) {
        var flag = true
        var order = data.order
        if (!(parseFloat(order.final_price) > 0)) {
            // 还未提交成交价
            flag = false
        }
        if (!flag) {
            window.XXG.BusinessCommon.helperShowAlertConfirm(null, '请先确认提交成交价')
            $('.row-order-deal-price').shine4Error()
        }
        return flag
    }

    // 验证下一步前的提交参数
    function __validSfFixConfirm($Form) {
        var flag = true,
            toast_text = '',
            $focus = null

        var $price = $Form.find('[name="price"]'),
            $imei = $Form.find('[name="imei"]')

        if ($imei && $imei.length) {
            var imei = tcb.trim($imei.val())
            if (!imei) {
                flag = false
                $focus = $focus || $imei
                toast_text = '请输入imei号'
                $imei.closest('.form-item-row').shine4Error()
            }
        }

        if ($price && $price.length) {
            var price = parseFloat(tcb.trim($price.val()))
            if (!price) {
                flag = false
                $focus = $focus || $price
                $price.closest('.form-item-row').shine4Error()
            }
        }

        if ($focus && $focus.length) {
            setTimeout(function () {
                $focus.focus()
            }, 200)
        }

        if (toast_text) {
            $.dialog.toast(toast_text, 2000)
        }

        return flag
    }

    // 丰修以旧换新--触发旧机不成交（全款购机）
    function doTriggerSfFixFullPay($btn, data) {
        window.XXG.BusinessCommon.actionShowCityManagerInfo($btn, data, __doTriggerSfFixFullPay)
    }

    function __doTriggerSfFixFullPay($btn, data) {
        var html_fn = $.tmpl($.trim($('#JsMXxgOrderDetailBusinessSfFixFullPayTpl').html())),
            html_st = html_fn(data)
        tcb.showDialog(html_st, {
            withClose: true,
            fromBottom: true
        })
    }

    // 丰修--旧机不成交（全款购机）
    function doSfFixFullPay($btn, data) {
        var order = data.order
        var params = {
            'order_id': order.order_id,
            'only_new': 1,
            'price': '',
            'imei': ''
        }
        tcb.loadingStart()
        window.XXG.BusinessSfFix.apiSfFixPayment(params, function (res) {
            tcb.loadingDone()
            var paymentUrl = res && res.paymentUrl
            if (paymentUrl) {
                tcb.closeDialog()
                tcb.showDialog('<iframe frameborder="0" src="' + paymentUrl + '" style="overflow-y: auto;width: 100%;height: 20rem;max-height: 85vh;">', {
                    fromBottom: true,
                    onClose: function () {
                        __stopCheckPayment()
                    }
                })
                __startCheckPayment({
                    'order_id': params.order_id
                }, function () {
                    tcb.closeDialog()
                    __stopCheckPayment()
                    window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                        window.XXG.redirect()
                    }, '恭喜您支付成功！', {
                        withoutClose: true
                    })
                })
            } else {
                $.dialog.toast('没有获取到支付信息，请重试！')
            }
        }, function () {
            tcb.loadingDone()
        })
    }


    var checkPaymentHandler = null
    var isStoppedCheckPayment = false

    // 丰修--检查用户是否全款购机完成
    function __startCheckPayment(data, callback) {
        isStoppedCheckPayment = false

        function loop() {
            if (isStoppedCheckPayment) {
                return __stopCheckPayment()
            }
            window.XXG.BusinessSfFix.apiGetSfFixPaymentStatus(data,
                function (res) {
                    var isPayment = res && res.isPayment
                    if (isPayment) {
                        typeof callback === 'function' && callback()
                    } else {
                        checkPaymentHandler = setTimeout(loop, 3000)
                    }
                },
                function () {
                    checkPaymentHandler = setTimeout(loop, 3000)
                }
            )
        }

        loop()
    }

    function __stopCheckPayment() {
        isStoppedCheckPayment = true
        if (checkPaymentHandler) {
            clearTimeout(checkPaymentHandler)
            checkPaymentHandler = null
        }
    }

    // 丰修--退回新机（旧不卖，新不买）
    function doSfFixReturnNew($btn, data) {
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            var order = data.order
            tcb.loadingStart()
            window.XXG.BusinessCommon.apiCloseOrder({
                order_id: order.order_id,
                xxg_memo: '丰修--退回新机'
            }, function () {
                tcb.closeDialog()
                window.XXG.redirect()
            }, function () {
                tcb.loadingDone()
            })
        }, '请确认订单不成交，退回新机<br>确认后订单状态不可变更')
    }

    // 丰修纯上门回收--确认回收
    function doSfFixConfirm($btn, data) {
        var $Form = $('#FormUpdateOrderInfoByGoNext')
        if (!__validSfFixConfirm($Form)) {
            return
        }
        var order = data.order
        var formData = $Form.serialize()

        if (data.isNeedPayInfo) {
            // 如果需要完善用户收款信息【并且是非一站式订单】，那么跳转到完善收款页面
            tcb.loadingStart()
            return window.XXG.BusinessCommon.apiUpdateOrder(formData, function () {
                window.XXG.redirect(tcb.setUrl2('/m/scanAuth', {
                    orderId: order.order_id
                }), true)
                tcb.loadingDone()
            }, function () {
                tcb.loadingDone()
            })
        } else {
            window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                tcb.loadingStart()
                window.XXG.BusinessCommon.apiUpdateOrder(formData, function () {
                    window.XXG.BusinessCommon.apiFinishOrder($btn, function () {
                        window.XXG.redirect()
                        tcb.loadingDone()
                    }, function () {
                        tcb.loadingDone()
                    })
                }, function () {
                    tcb.loadingDone()
                })
            }, '请确认旧机成交<br>确认后订单状态不可变更<br><span class="marked">确认后将会给用户打款</span>', {
                options: {
                    lock: 4
                }
            })
        }
    }

    // 丰修纯上门回收--取消订单
    function doSfFixCancelOrder($btn, data) {
        window.XXG.BusinessCommon.actionShowCityManagerInfo($btn, data, __doSfFixCancelOrder)
    }

    function __doSfFixCancelOrder($btn, data) {
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            var order = data.order
            tcb.loadingStart()
            window.XXG.BusinessCommon.apiCloseOrder({
                order_id: order.order_id,
                xxg_memo: '丰修纯回收--取消订单'
            }, function () {
                window.XXG.redirect()
            }, function () {
                tcb.loadingDone()
            })
        }, '请确认旧机不成交<br>确认后订单状态不可变更')
    }

}()
