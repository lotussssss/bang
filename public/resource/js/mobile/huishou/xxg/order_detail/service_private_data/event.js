// 隐私数据处理
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivateData = tcb.mix(window.XXG.ServicePrivateData || {}, {
        eventBind: eventBind
    })

    // 绑定事件
    function eventBind() {
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

        tcb.bindEvent({
            // 检查隐私转移前支付状态
            '.js-trigger-service-private-data-check-pay-status': function (e) {
                e.preventDefault()
                window.XXG.ServicePrivateData.actionCheckPayStatus(function () {
                    // 代扣签约成功，直接刷新页面
                    window.XXG.BusinessCommon.helperCloseDialog()
                    window.XXG.redirect()
                }, function () {
                    // 还未代扣签约成功，toast提示
                    $.dialog.toast('请等待，还未成功签约代扣！')
                })
            },
            // 切换成全款购新
            '.js-trigger-service-private-data-full-pay': function (e) {
                e.preventDefault()
                window.XXG.ServicePrivateData.actionCheckPayStatus(function () {
                    $.dialog.toast('已经成功签约代扣，无需支付差额！')
                    setTimeout(function () {
                        window.XXG.BusinessCommon.helperCloseDialog()
                        window.XXG.redirect()
                    }, 1000)
                }, function () {
                    window.XXG.BusinessCommon.helperCloseDialog()
                    // 切换为支付差额
                    window.XXG.ServicePrivateData.actionShowMigrateFullPay()
                })
            }
        })
    }

    // 事件--下一步（将会被加入的下一步的事件队列里）
    function __fnGoNext(e, $trigger, data) {
        var isContinue = true
        if (!__validGoNext($trigger)) {
            return false
        }
        var act = $trigger.attr('data-act')
        switch (act) {
            case 'service-private-data-trigger-old-device-cancel':
                // 触发旧机不成交
                isContinue = false
                window.XXG.ServicePrivateData.actionTriggerOldDeviceCancel($trigger, data)
                break
            case 'service-private-data-trigger-no-migrate-flow-recycle':
                // 有隐私数据，非导数流程，触发回收（包括纯回收 或者 以旧换新）
                isContinue = false
                window.XXG.ServicePrivateData.actionTriggerNoMigrateFlowRecycle($trigger, data)
                break
            case 'service-private-data-trigger-trade-in':
                // 导数流程--触发以旧换新
                isContinue = false
                window.XXG.ServicePrivateData.actionTriggerTradeIn($trigger, data)
                break
            case 'service-private-data-trigger-trade-in-again':
                // 导数流程--触发二次上门以旧换新
                isContinue = false
                window.XXG.ServicePrivateData.actionTriggerTradeInAgain($trigger, data)
                break
            case 'service-private-data-trigger-scan-reassess-again':
                // 触发二次上门扫码重新验机
                isContinue = false
                window.XXG.ServicePrivateData.actionTriggerScanReassessAgain($trigger, data)
                break
            case 'service-private-data-trigger-close-one-stop-order':
                // 触发二次上门之前关闭一站式订单
                isContinue = false
                window.XXG.ServicePrivateData.actionTriggerCloseOneStopOrder($trigger, data)
                break
            case 'service-private-data-trigger-migrate':
                // 触发数据迁移
                isContinue = false
                window.XXG.ServicePrivateData.actionTriggerMigrate($trigger, data)
                break
            case 'service-private-data-confirm-migrate':
                // 确认数据迁移
                isContinue = false
                window.XXG.ServicePrivateData.actionConfirmMigrate($trigger, data)
                break
            // case 'service-private-data-confirm-cleaned':
            //     // 确认已清除隐私数据
            //     isContinue = false
            //     window.XXG.ServicePrivateData.actionConfirmCleaned($trigger, data)
            //     break
            case 'service-private-data-migrate-and-clean':
                // 迁移、清除隐私数据
                isContinue = false
                window.XXG.ServicePrivateData.actionConfirmMigrateAndCleaned($trigger, data)
                break
        }
        return isContinue
    }

    function __validGoNext($trigger) {
        if ($trigger && $trigger.length && $trigger.hasClass('btn-go-next-lock')) {
            return
        }
        return true
    }

}()
