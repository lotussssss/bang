!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFixOneStopOrder = tcb.mix(window.XXG.BusinessSfFixOneStopOrder || {}, {
        eventBind: eventBind,
        eventTriggerFormUpdateOrderInfoSfFixOneStop: eventTriggerFormUpdateOrderInfoSfFixOneStop
    })
    var getCache = window.XXG.BusinessSfFixOneStopOrder.getCache
    var setCache = window.XXG.BusinessSfFixOneStopOrder.setCache

    // 丰修一站式换新---事件绑定
    function eventBind(data) {
        if (eventBind.__bind) {
            return
        }
        eventBind.__bind = true

        if (typeof __fnGoNext === 'function') {
            window.XXG.BusinessCommon &&
            window.XXG.BusinessCommon.eventBind &&
            window.XXG.BusinessCommon.eventBind.fnQueueGoNext &&
            window.XXG.BusinessCommon.eventBind.fnQueueGoNext.push(__fnGoNext)
        }
        tcb.bindEvent({})
    }

    // 事件--下一步（将会被加入的下一步的事件队列里）
    function __fnGoNext(e, $trigger, data) {
        var isContinue = true
        if (!__validGoNext($trigger)) {
            return false
        }
        var act = $trigger.attr('data-act')
        switch (act) {
            // start 丰修一站式
            case 'sf-fix-suning-one-stop-confirm-trade-in':
                // 丰修一站式换新--确认换新（无差价直接换新，有差价先补差，再换新）
                isContinue = false
                window.XXG.BusinessSfFixOneStopOrder.actionSfFixOneStopOrderConfirmTradeIn($trigger, data)
                break
            case 'trigger-sf-fix-suning-one-stop-full-pay':
                // 丰修一站式换新--触发旧机不成交（全款购机）
                isContinue = false
                window.XXG.BusinessSfFixOneStopOrder.actionTriggerSfFixOneStopOrderFullPay($trigger, data)
                break
            case 'sf-fix-suning-one-stop-full-pay':
                // 丰修一站式换新--旧机不成交（全款购机）
                isContinue = false
                window.XXG.BusinessSfFixOneStopOrder.actionSfFixOneStopOrderFullPay()
                break
            case 'sf-fix-suning-one-stop-return-new':
                // 丰修一站式换新--退回新机（旧不卖，新不买）
                isContinue = false
                window.XXG.BusinessSfFixOneStopOrder.actionSfFixOneStopOrderReturnNew($trigger, data)
                break
            // end 丰修一站式
        }
        return isContinue
    }

    function __validGoNext($trigger) {
        if ($trigger && $trigger.length && $trigger.hasClass('btn-go-next-lock')) {
            return
        }
        return true
    }

    // 丰修一站式换新--触发订单更新
    function eventTriggerFormUpdateOrderInfoSfFixOneStop($btn, data) {
        var $Form = window.XXG.BusinessCommon.$FormUpdateOrderInfo || null
        if (!($Form && $Form.length)) {
            return
        }

        var order_id = $btn.attr('data-order-id')

        $Form.trigger('submit', [
            function () {
                if (getCache('hasBalance') &&
                    !getCache('isTcbPay') &&
                    !getCache('continueBalance') &&
                    !getCache('isPaySuccess')) { // [在此逻辑下默认就是一站式，所以此处不再需要显示的判断是否一站式] && 需要补差 && 非同城帮补差 && 非继续补差状态 && 未补差成功
                    window.XXG.BusinessSfFixOneStopOrder.apiCheckOneStopPriceLetThrough({
                        order_id: order_id
                    }, function (valid) {
                        if (valid) { // 可以正常补差
                            window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                                setCache({
                                    continueBalance: true
                                })
                                window.XXG.BusinessSfFixOneStopOrder.eventTriggerFormUpdateOrderInfoSfFixOneStop($btn, data)
                            }, '请确认验机是否无误，进入补差后将不可更改选项', {
                                title: '即将进入补差'
                            })
                        } else { // 异常情况，订单操作终止
                            window.XXG.BusinessCommon.helperShowAlertConfirm(null, '由于补贴款大于冻结款，所以无法继续完成订单', {
                                title: '补贴款大于冻结款'
                            })
                        }
                    })
                    return false
                }

                return true
            },
            function (res, $form, $trigger) {
                if (getCache('continueBalance')) {
                    setCache({
                        continueBalance: false
                    })
                    window.XXG.BusinessSfFixOneStopOrder.actionSfFixOneStopOrderSupplement($btn, data)
                    return
                }

                // 已经补差完成 或者 不需要补差，那么直接完成订单
                tcb.loadingStart()
                window.XXG.BusinessCommon.apiFinishOrder($btn, function () {
                    tcb.loadingDone()
                    // window.XXG.BusinessSfFixOneStopOrder.helperShowOrderSuccessPanel(data, function () {
                        window.XXG.redirect()
                    // })
                }, function () {
                    tcb.loadingDone()
                })
            }
        ])
    }

}()
