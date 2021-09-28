// 隐私数据处理
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivateData = tcb.mix(window.XXG.ServicePrivateData || {}, {
        actionTriggerOldDeviceCancel: actionTriggerOldDeviceCancel,
        actionTriggerNoMigrateFlowRecycle: actionTriggerNoMigrateFlowRecycle,
        actionTriggerTradeIn: actionTriggerTradeIn,
        actionTriggerTradeInAgain: actionTriggerTradeInAgain,
        // actionConfirmRecycle: actionConfirmRecycle,
        // actionConfirmTradeIn: actionConfirmTradeIn,
        actionTriggerScanReassessAgain: actionTriggerScanReassessAgain,
        actionTriggerCloseOneStopOrder: actionTriggerCloseOneStopOrder,
        actionTriggerMigrate: actionTriggerMigrate,
        actionConfirmMigrate: actionConfirmMigrate,
        actionTriggerCleaned: actionTriggerCleaned,
        actionConfirmCleaned: actionConfirmCleaned,
        actionTriggerMigrateAndCleaned: actionTriggerMigrateAndCleaned,
        actionConfirmMigrateAndCleaned: actionConfirmMigrateAndCleaned,
        actionTriggerAlipayWithholding: actionTriggerAlipayWithholding,
        actionShowAlipayWithholding: __actionShowAlipayWithholding,
        actionShowMigrateFullPay: actionShowMigrateFullPay,
        actionCheckPayStatus: actionCheckPayStatus,
        actionDeliveredNewDeviceSoundPlay: actionDeliveredNewDeviceSoundPlay
    })
    var __soundSrc = [
        ['https://s2.ssl.qhres2.com/static/43acd60a191d35da.mp3'],// v2
        ['https://s0.ssl.qhres2.com/static/8b265c58fdddc771.mp3'],// v5
        ['https://s2.ssl.qhres2.com/static/66a46fc230f1cefd.mp3'],// v6
        ['https://s5.ssl.qhres2.com/static/5243bb96d5dfcbeb.mp3'] // v7
    ]

    // 触发旧机取消
    function actionTriggerOldDeviceCancel($btn) {
        var rootData = window.XXG.ServicePrivateData.rootData
        window.XXG.BusinessCommon.actionShowCityManagerInfo($btn, rootData, __actionTriggerOldDeviceCancel)
    }
    function __actionTriggerOldDeviceCancel($trigger) {
        if ($trigger.attr('data-locking')) {
            return
        }
        $trigger.attr('data-locking', 1)
        var rootData = window.XXG.ServicePrivateData.rootData
        var sfFixData = rootData.sfFixData
        var isOneStopOrder = rootData.isOneStopOrder
        var act
        if (isOneStopOrder) {
            // 丰修一站式
            act = 'trigger-sf-fix-suning-one-stop-full-pay'
        } else if (sfFixData.__recycle) {
            // 丰修纯回收
            act = 'sf-fix-cancel-order'
        }
        if (act) {
            $trigger
                .attr('data-act', act)
                .attr('data-locking', '')
            $trigger.trigger('click')
            return
        }
        // @TODO 其他合作方可能的取消订单方式
        // var html_fn = $.tmpl($.trim($('#JsMXxgOrderDetailServicePrivateDataOldDeviceCancelTpl').html())),
        //     html_st = html_fn(rootData)
        // window.XXG.BusinessCommon.helperShowDialog(html_st, {
        //     withClose: true,
        //     fromBottom: true,
        //     onClose: function () {
        //         $trigger.attr('data-locking', '')
        //     }
        // })
    }

    // 有隐私数据，非导数流程，触发回收（包括纯回收 或者 以旧换新，也包括一站式换新）
    function actionTriggerNoMigrateFlowRecycle() {
        var rootData = window.XXG.ServicePrivateData.rootData
        if (rootData.isOneStopOrder) {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-suning-one-stop-confirm-trade-in')
        } else if (rootData.sfFixData.__re_new) {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm-trade-in')
        } else {
            // window.XXG.ServicePrivateData.actionTriggerCleaned('sf-fix-confirm')
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm')
        }
    }

    // 触发以旧换新
    function actionTriggerTradeIn() {
        var rootData = window.XXG.ServicePrivateData.rootData
        if (rootData.servicePrivateData.migrateFlag == 2) {
            // 用户已经选择了无需迁移隐私数据
            if (rootData.isOneStopOrder) {
                window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-suning-one-stop-confirm-trade-in')
            } else if (rootData.sfFixData.__re_new) {
                window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm-trade-in')
            } else {
                window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm')
            }
            return
        } else if (rootData.servicePrivateData.migrateFlag == 1) {
            // 用户已经选择了需要迁移隐私数据
            window.XXG.ServicePrivateData.actionTriggerAlipayWithholding(true)
            return
        }

        // 以下为：用户还未选择过是否需要迁移隐私数据

        if (rootData.isOneStopOrder) {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-suning-one-stop-confirm-trade-in')
        } else if (rootData.sfFixData.__re_new) {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm-trade-in')
        } else {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm')
        }
    }

    // // 触发以旧换新
    // function actionTriggerTradeIn() {
    //     var rootData = window.XXG.ServicePrivateData.rootData
    //     if (rootData.servicePrivateData.migrateFlag == 2) {
    //         // 用户已经选择了无需迁移隐私数据
    //         __actionConfirmNotNeedMigrate()
    //         return
    //     } else if (rootData.servicePrivateData.migrateFlag == 1) {
    //         // 用户已经选择了需要迁移隐私数据
    //         window.XXG.ServicePrivateData.actionTriggerAlipayWithholding(true)
    //         return
    //     }
    //
    //     // 以下为：用户还未选择过是否需要迁移隐私数据
    //
    //     // 开始播放提示音
    //     __actionSoundPlay(__soundSrc[1])
    //     var html_st = window.XXG.ServicePrivateData.htmlServicePrivateDataDialogConfirmMigrate()
    //     window.XXG.BusinessCommon.helperCloseDialog()
    //     var dialogInst = window.XXG.BusinessCommon.helperShowDialog(html_st, {
    //         className: 'service-private-data-dialog-confirm-migrate',
    //         withClose: false
    //     })
    //     var $dialog = dialogInst.wrap
    //     var $second = $dialog.find('.confirm-countdown-second')
    //     var $btn = $dialog.find('.btn')
    //     tcb.distimeAnim(6, function (time) {
    //         $second.html(time)
    //         if (time <= 0) {
    //             $btn.removeClass('btn-disabled')
    //         }
    //     })
    //     $btn.on('click', function (e) {
    //         e.preventDefault()
    //         var $me = $(this)
    //         if ($me.hasClass('btn-disabled')) {
    //             return
    //         }
    //         // 停止播放提示音
    //         __actionSoundStop()
    //
    //         var isNeedMigrate = !!$me.attr('data-migrate')
    //         tcb.loadingStart()
    //         var rootData = window.XXG.ServicePrivateData.rootData
    //         var data = {
    //             order_id: rootData.order.order_id,
    //             migrationFlag: isNeedMigrate ? 1 : 2
    //         }
    //         window.XXG.ServicePrivateData.apiSavePrivateDataNeedMigrate(data,
    //             function () {
    //                 rootData.servicePrivateData.migrateFlag = data.migrationFlag // 设置是否需要迁移隐私数据
    //                 window.XXG.BusinessCommon.helperCloseDialog(dialogInst)
    //                 tcb.loadingDone()
    //                 if (isNeedMigrate) {
    //                     // 需要迁移隐私数据
    //                     __actionConfirmNeedMigrate()
    //                 } else {
    //                     // 不需要迁移隐私数据
    //                     __actionConfirmNotNeedMigrate()
    //                 }
    //             },
    //             function () {
    //                 tcb.loadingDone()
    //             }
    //         )
    //
    //     })
    // }
    //
    // 确认需要迁移隐私数据
    function __actionConfirmNeedMigrate() {
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            window.XXG.ServicePrivateData.actionTriggerAlipayWithholding(true)
        }, '新机将会妥投，旧手机将留给用户转移数据，需再次上门回收。' +
            '<span style="color: #fe5800;">请小哥当面与客户预约二次上门取旧机的时间</span>', {
            noTitle: true,
            withoutClose: true,
            options: {
                btn: '好'
            }
        })
    }

    // 确认不需要迁移隐私数据
    function __actionConfirmNotNeedMigrate() {
        __actionTriggerCleanedAndConfirmTradeIn()
    }

    // 触发清除隐私数据 && 触发真实换新补差
    function __actionTriggerCleanedAndConfirmTradeIn() {
        var rootData = window.XXG.ServicePrivateData.rootData
        if (rootData.isOneStopOrder) {
            // 一站式订单
            return window.XXG.ServicePrivateData.actionTriggerCleaned('sf-fix-suning-one-stop-confirm-trade-in')
        }

        // @TODO 非一站式的继续补差
    }

    // 触发代扣弹窗
    function actionTriggerAlipayWithholding(refresh) {
        window.XXG.ServicePrivateData.actionCheckPayStatus(function () {
            // 已经支付，直接刷新页面
            window.XXG.BusinessCommon.helperCloseDialog()
            refresh && window.XXG.redirect()
        }, function () {
            tcb.loadingStart()
            var rootData = window.XXG.ServicePrivateData.rootData
            var data = {
                order_id: rootData.order.order_id
            }
            // 获取支付宝代扣url
            window.XXG.ServicePrivateData.apiGetPrivateDataAlipayWithholdingInfo(data,
                function (result) {
                    tcb.loadingDone()
                    var url = result.alipay_url
                    __actionShowAlipayWithholding(url)
                }, function () {
                    tcb.loadingDone()
                }
            )
        })
    }

    // 检查用户是否已经支付
    function actionCheckPayStatus(payed_callback, waiting_pay_callback) {
        tcb.loadingStart()
        var rootData = window.XXG.ServicePrivateData.rootData
        var data = {
            order_id: rootData.order.order_id
        }
        // 获取用户支付状态
        window.XXG.ServicePrivateData.apiGetPrivateDataUserPayStatus(data,
            function (result) {
                tcb.loadingDone()
                var isPay = result.pay_flag
                if (isPay) {
                    typeof payed_callback === 'function' && payed_callback()
                } else {
                    typeof waiting_pay_callback === 'function' && waiting_pay_callback()
                }
            }, function () {
                tcb.loadingDone()
                typeof waiting_pay_callback === 'function' && waiting_pay_callback()
            },
            {
                silent: true
            }
        )
    }

    function __actionShowAlipayWithholding(url) {
        __actionSoundPlay(__soundSrc[2])
        // url = 'https://bang.360.cn/alipayWithhold?businessId=1&businessUid=42389789537798453798&scan=1&ext=1'
        // url = 'https://payauth.alipay.com/appAssign.htm?alipay_exterface_invoke_assign_target=invoke_6531ea32e245e98704d05fa5af46a0b5_uid80&alipay_exterface_invoke_assign_sign=f_juli_jz_u3_q3%2Ba_q4_frwp_t_kl8_a2_nm_wj_ev_m_a_syj_ol9_b_c_nbx_w_kx_e_l_j4_frg%3D%3D#/'
        var html_st = window.XXG.ServicePrivateData.htmlServicePrivateDataDialogAlipayWithholding({
            url: url
        })
        window.XXG.BusinessCommon.helperCloseDialog()
        window.XXG.BusinessCommon.helperShowDialog(html_st, {
            className: 'service-private-data-dialog-alipay-withholding',
            withClose: false
        })
    }

    // 显示迁移隐私数据全款支付页面
    function actionShowMigrateFullPay() {
        // 停止播放提示音
        __actionSoundStop()

        var rootData = window.XXG.ServicePrivateData.rootData
        var order_id = rootData.order.order_id
        var paymentUrl = tcb.setUrl2('/Recycle/Engineer/Migration/fullAmountPay', {
            order_id: order_id,
            inner_iframe: true
        })
        var html_st = '<iframe frameborder="0" src="' + paymentUrl + '" style="overflow-y: auto;width: 100%;height: 20rem;max-height: 85vh;">'
        window.XXG.BusinessCommon.helperCloseDialog()
        window.XXG.BusinessCommon.helperShowDialog(html_st, {
            fromBottom: true,
            onClose: function () {
                __stopCheckMigrateFullPay()
            }
        })
        __startCheckMigrateFullPay({
            'order_id': order_id
        }, function () {
            tcb.closeDialog()
            __stopCheckMigrateFullPay()
            window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                window.XXG.redirect()
            }, '恭喜您支付成功！', {
                withoutClose: true
            })
        })
    }

    var checkPaymentHandler = null
    var isStoppedCheckPayment = false

    function __startCheckMigrateFullPay(data, callback) {
        isStoppedCheckPayment = false

        function loop() {
            if (isStoppedCheckPayment) {
                return __stopCheckMigrateFullPay()
            }
            window.XXG.ServicePrivateData.actionCheckPayStatus(function () {
                // 支付成功
                typeof callback === 'function' && callback()
            }, function () {
                // 未检查到支付成功（或者接口出错）
                checkPaymentHandler = setTimeout(loop, 3000)
            })
        }

        loop()
    }

    function __stopCheckMigrateFullPay() {
        isStoppedCheckPayment = true
        if (checkPaymentHandler) {
            clearTimeout(checkPaymentHandler)
            checkPaymentHandler = null
        }
    }

    // 触发二次上门以旧换新
    function actionTriggerTradeInAgain() {
        // __actionTriggerCleanedAndConfirmTradeIn()
        var rootData = window.XXG.ServicePrivateData.rootData
        if (rootData.isOneStopOrder) {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-suning-one-stop-confirm-trade-in')
        } else if (rootData.sfFixData.__re_new) {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm-trade-in')
        } else {
            window.XXG.ServicePrivateData.actionTriggerMigrateAndCleaned('sf-fix-confirm')
        }
    }

    // // 确认纯回收
    // function actionConfirmRecycle() {
    //
    // }
    //
    // // 确认以旧换新
    // function actionConfirmTradeIn() {
    //
    // }

    // 触发二次上门扫码重新验机
    function actionTriggerScanReassessAgain() {
        window.XXG.ServicePrivateData.callbackScanReassessAgain()
    }

    // 触发二次上门之前关闭一站式订单
    function actionTriggerCloseOneStopOrder($btn, data){
        window.XXG.BusinessCommon.actionShowCityManagerInfo($btn, data, __actionTriggerCloseOneStopOrder)
    }

    function __actionTriggerCloseOneStopOrder() {
        window.XXG.BusinessCommon.helperShowConfirm('确定结束订单么？', {
            noTitle: true,
            options: {
                textCancel: '取消',
                textConfirm: '结束'
            },
            callbackConfirm: function () {
                var rootData = window.XXG.BusinessCommon.rootData
                var data = {
                    order_id: rootData.order.order_id
                }
                tcb.loadingStart()
                window.XXG.ServicePrivateData.apiSavePrivateDataCloseOneStopOrder(data, function () {
                    tcb.loadingDone()
                    window.XXG.redirect()
                }, function () {
                    tcb.loadingDone()
                })
            }
        })
    }

    // 触发数据迁移
    function actionTriggerMigrate() {
        var html_st = window.XXG.ServicePrivateData.htmlServicePrivateDataDialogStartMigrate()
        window.XXG.BusinessCommon.helperShowDialog(html_st)
    }

    // 确认数据迁移
    function actionConfirmMigrate() {
        var rootData = window.XXG.ServicePrivateData.rootData
        var order_id = rootData.order.order_id
        tcb.loadingStart()
        window.XXG.ServicePrivateData.apiSavePrivateDataMigrated({order_id: order_id},
            function () {
                setTimeout(function () {
                    tcb.loadingDone()
                }, 1000)
                window.XXG.BusinessCommon.helperCloseDialog()
                window.XXG.redirect()
            },
            function () {
                tcb.loadingDone()
            }
        )
    }

    // 触发已清除隐私数据
    function actionTriggerCleaned(confirmAct) {
        // 开始播放提示音
        __actionSoundPlay(__soundSrc[0])
        var html_st = window.XXG.ServicePrivateData.htmlServicePrivateDataDialogCleanPrivateData({
            confirmAct: confirmAct || ''
        })
        window.XXG.BusinessCommon.helperCloseDialog()
        window.XXG.BusinessCommon.helperShowDialog(html_st, {
            // withClose: false
        })
    }

    // 触发转移、已清除隐私数据
    function actionTriggerMigrateAndCleaned(confirmAct) {
        // 开始播放提示音
        __actionSoundPlay(__soundSrc[0])
        var html_st = window.XXG.ServicePrivateData.htmlServicePrivateDataDialogMigrateAndCleanPrivateData({
            confirmAct: confirmAct || ''
        })
        window.XXG.BusinessCommon.helperCloseDialog()
        var dialogInst = window.XXG.BusinessCommon.helperShowDialog(html_st, {
            withClose: false
        })
        var rootData = window.XXG.ServicePrivateData.rootData
        var isMigrateFlow = rootData.servicePrivateData.isMigrateFlow
        var migrateFlag = rootData.servicePrivateData.migrateFlag
        var isVisitAgain = rootData.servicePrivateData.isVisitAgain
        if (isMigrateFlow && !migrateFlag && !isVisitAgain) {
            var $dialog = dialogInst.wrap
            var $btn = $dialog.find('.btn')
            var btn_text = $btn.html()
            var delay = 5
            $btn.html('<div class="confirm-countdown grid nowrap justify-center align-baseline">' +
                '<div class="confirm-countdown-second">' + delay + '</div>' +
                '<div class="confirm-countdown-symbol">s</div></div>' + btn_text)
            $btn.addClass('btn-disabled btn-go-next-lock')
            var $second = $btn.find('.confirm-countdown-second')
            tcb.distimeAnim(delay, function (time) {
                $second.html(time)
                if (time <= 0) {
                    $btn.removeClass('btn-disabled btn-go-next-lock').html(btn_text)
                }
            })
        }
    }

    // 确认已清除隐私数据
    function actionConfirmCleaned($trigger) {
        if ($trigger.attr('data-locking')) {
            return
        }
        $trigger.attr('data-locking', 1)
        var act = $trigger.attr('data-combine-act')
        if (act) {
            $trigger
                .attr('data-act', act)
                .attr('data-combine-act', '')
                .attr('data-locking', '')
            $trigger.trigger('click')
        }
        // 停止播放提示音
        __actionSoundStop()

        window.XXG.BusinessCommon.helperCloseDialog()
    }

    // 确认迁移、清除隐私数据
    function actionConfirmMigrateAndCleaned($trigger) {
        if ($trigger.attr('data-locking')) {
            return
        }
        $trigger.attr('data-locking', 1)

        var rootData = window.XXG.ServicePrivateData.rootData
        var act = $trigger.attr('data-combine-act')
        var isMigrateFlow = rootData.servicePrivateData.isMigrateFlow
        var migrateFlag = rootData.servicePrivateData.migrateFlag
        var isVisitAgain = rootData.servicePrivateData.isVisitAgain
        if (!isMigrateFlow || migrateFlag || isVisitAgain) {
            // 非数据迁移流程 || 已经确认过【需要迁移：1】或者【不需要迁移：2】 || 二次验机
            if (act) {
                $trigger
                    .attr('data-act', act)
                    .attr('data-combine-act', '')
                    .attr('data-locking', '')
                $trigger.trigger('click')
            }
            // 停止播放提示音
            __actionSoundStop()

            window.XXG.BusinessCommon.helperCloseDialog()
        } else {
            // 还未确认过，需要先确认
            var isNeedMigrate = !!$trigger.attr('data-migrate')
            tcb.loadingStart()
            var data = {
                order_id: rootData.order.order_id,
                migrationFlag: isNeedMigrate ? 1 : 2
            }
            // 确认选择【需要迁移：1】或者【不需要迁移：2】
            window.XXG.ServicePrivateData.apiSavePrivateDataNeedMigrate(data,
                function () {
                    rootData.servicePrivateData.migrateFlag = data.migrationFlag // 设置是否需要迁移隐私数据
                    tcb.loadingDone()
                    // 停止播放提示音
                    __actionSoundStop()

                    if (isNeedMigrate) {
                        // 需要迁移隐私数据
                        window.XXG.BusinessCommon.helperCloseDialog()
                        __actionConfirmNeedMigrate()
                    } else {
                        // 不需要迁移隐私数据
                        if (act) {
                            $trigger
                                .attr('data-act', act)
                                .attr('data-combine-act', '')
                                .attr('data-locking', '')
                            $trigger.trigger('click')
                        }
                        window.XXG.BusinessCommon.helperCloseDialog()
                    }
                },
                function () {
                    tcb.loadingDone()
                }
            )
        }
    }

    // 播放提示音提示妥投新机
    function actionDeliveredNewDeviceSoundPlay() {
        __actionSoundPlay(__soundSrc[3])
    }

    function __actionSoundPlay(src) {
        window.XXG.BusinessCommon.soundPlay({
            src: src,
            repeat: 2,
            interval: 500
        })
    }

    function __actionSoundStop() {
        window.XXG.BusinessCommon.soundStop()
    }

}()
