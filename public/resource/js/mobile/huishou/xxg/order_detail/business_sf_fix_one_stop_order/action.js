!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFixOneStopOrder = tcb.mix(window.XXG.BusinessSfFixOneStopOrder || {}, {
        actionSfFixOneStopOrderConfirmTradeIn: actionSfFixOneStopOrderConfirmTradeIn,
        actionTriggerSfFixOneStopOrderFullPay: actionTriggerSfFixOneStopOrderFullPay,
        actionSfFixOneStopOrderFullPay: actionSfFixOneStopOrderFullPay,
        actionSfFixOneStopOrderSupplement: actionSfFixOneStopOrderSupplement,
        actionSfFixOneStopOrderReturnNew: actionSfFixOneStopOrderReturnNew
    })
    var getCache = window.XXG.BusinessSfFixOneStopOrder.getCache
    var setCache = window.XXG.BusinessSfFixOneStopOrder.setCache

    // 丰修一站式--确认换新（无差价直接正常流程换新，有差价先补差，再换新）
    function actionSfFixOneStopOrderConfirmTradeIn($btn, data) {
        if (getCache('isTcbPay')) {
            // 如果是同城帮支付（同城帮补差）
            // 【先弹窗提示给用户打款，然后直接提交更新订单信息表单，并且成功之后完成订单】
            var tips = '完成服务后<br>补差金额将发放至用户易付宝账户'
            var title = '已告知顾客，下一步'
            window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                window.XXG.BusinessSfFixOneStopOrder.eventTriggerFormUpdateOrderInfoSfFixOneStop($btn, data)
            }, tips, {
                title: title
            })
        } else {
            // 需要用户补差价【先让用户补差款，然后提交更新订单信息表单，再完成订单】
            // 或者不需要补差价【直接提交更新订单信息表单，并且成功之后完成订单】
            window.XXG.BusinessSfFixOneStopOrder.eventTriggerFormUpdateOrderInfoSfFixOneStop($btn, data)
        }
    }

    // 丰修一站式换新--触发旧机不成交（全款购机）
    function actionTriggerSfFixOneStopOrderFullPay($btn, data) {
        window.XXG.BusinessCommon.actionShowCityManagerInfo($btn, data, __actionTriggerSfFixOneStopOrderFullPay)
    }

    function __actionTriggerSfFixOneStopOrderFullPay($btn, data) {
        var html_fn = $.tmpl($.trim($('#JsMXxgOrderDetailBusinessSfFixOneStopOrderFullPayTpl').html())),
            html_st = html_fn(data)
        tcb.showDialog(html_st, {
            withClose: true,
            fromBottom: true
        })
    }

    // 丰修一站式换新--旧机不成交（全款购机）
    function actionSfFixOneStopOrderFullPay() {
        var rootData = window.XXG.BusinessCommon.rootData
        var order_id = rootData.order.order_id
        // 获取全款购新的支付地址，
        // 如果返回的支付地址为空，那么表示不需要补款购新，并且同时旧机已经被取消，直接刷新页面
        window.XXG.BusinessSfFixOneStopOrder.callbackBeforeFullPay(function (paymentUrl) {
            if (!paymentUrl) {
                return window.XXG.redirect()
            }
            paymentUrl = tcb.setUrl2(paymentUrl/*'/xxgHs/fullAmountPay'*/, {
                order_id: order_id,
                inner_iframe: true
            })
            tcb.closeDialog()
            tcb.showDialog('<iframe frameborder="0" src="' + paymentUrl + '" style="overflow-y: auto;width: 100%;height: 20rem;max-height: 85vh;">', {
                fromBottom: true,
                onClose: function () {
                    __stopCheckSuningOneStopFullPayment()
                }
            })
            __startCheckSuningOneStopFullPayment({
                'order_id': order_id
            }, function () {
                tcb.closeDialog()
                __stopCheckSuningOneStopFullPayment()
                window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                    // 由于全款购新支付成功后会自动取消旧机订单，
                    // 所以此处只需显示全款购新成功提示页，然后确认后刷新页面即可
                    // window.XXG.BusinessSfFixOneStopOrder.helperShowOrderFullPaySuccessPanel(rootData, function () {
                        window.XXG.redirect()
                    // })
                }, '恭喜您支付成功！', {
                    withoutClose: true
                })
            })
        })
    }

    // 丰修一站式换新--确认换新（无差价直接换新，有差价先补差，再换新）
    function actionSfFixOneStopOrderSupplement($btn, data) {
        var order_id = $btn.attr('data-order-id')
        var paymentUrl = tcb.setUrl2('/xxgHs/supplementAmountPay', {
            order_id: order_id,
            inner_iframe: true
        })
        tcb.showDialog('<iframe frameborder="0" src="' + paymentUrl + '" style="overflow-y: auto;width: 100%;height: 20rem;max-height: 85vh;">', {
            fromBottom: true,
            onClose: function () {
                __stopCheckSuningOneStopSupplement()
            }
        })
        __startCheckSuningOneStopSupplement({
            'order_id': order_id
        }, function () {
            tcb.closeDialog()
            __stopCheckSuningOneStopSupplement()
            window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                setCache({
                    isPaySuccess: true
                })
                window.XXG.BusinessSfFixOneStopOrder.eventTriggerFormUpdateOrderInfoSfFixOneStop($btn, data)
            }, '恭喜您支付成功！', {
                withoutClose: true
            })
        })
    }

    var checkPaymentHandler = null
    var isStoppedCheckPayment = false

    // 丰修一站式换新--检查用户是否全款购机完成
    function __startCheckSuningOneStopFullPayment(data, callback) {
        isStoppedCheckPayment = false

        function loop() {
            if (isStoppedCheckPayment) {
                return __stopCheckSuningOneStopFullPayment()
            }
            window.XXG.BusinessSfFixOneStopOrder.apiGetSfFixSuningOneStopFullPaymentStatus(data,
                function (res) {
                    var isPayment = res
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

    function __stopCheckSuningOneStopFullPayment() {
        isStoppedCheckPayment = true
        if (checkPaymentHandler) {
            clearTimeout(checkPaymentHandler)
            checkPaymentHandler = null
        }
    }

    // 丰修一站式换新--检查用户是否补差完成
    function __startCheckSuningOneStopSupplement(data, callback) {
        isStoppedCheckPayment = false

        function loop() {
            if (isStoppedCheckPayment) {
                return __stopCheckSuningOneStopSupplement()
            }
            window.XXG.BusinessSfFixOneStopOrder.apiGetSfFixSuningOneStopSupplementStatus(data,
                function (res) {
                    var isPayment = res
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

    function __stopCheckSuningOneStopSupplement() {
        isStoppedCheckPayment = true
        if (checkPaymentHandler) {
            clearTimeout(checkPaymentHandler)
            checkPaymentHandler = null
        }
    }

    // 丰修一站式换新--退回新机（旧不卖，新不买）
    function actionSfFixOneStopOrderReturnNew($btn, data) {
        // 一站式订单修修哥不能手动取消订单，
        // 所以此处无法取消订单，只能提示
        tcb.closeDialog()
        window.XXG.BusinessCommon.helperShowAlertConfirm(null, '新机拒收退回，请提示用户到苏宁易购取消订单')
        return
        // window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
        //     var order = data.order
        //     tcb.loadingStart()
        //     window.XXG.BusinessCommon.apiCloseOrder({
        //         order_id: order.order_id,
        //         xxg_memo: '丰修一站式--退回新机'
        //     }, function () {
        //         tcb.closeDialog()
        //         tcb.loadingDone()
        //
        //         window.XXG.BusinessSfFixOneStopOrder.helperShowOrderCancelPanel(data, function () {
        //             window.XXG.redirect()
        //         })
        //     }, function () {
        //         tcb.loadingDone()
        //     })
        // }, '请确认取消订单，并将新机退回')
    }

}()
