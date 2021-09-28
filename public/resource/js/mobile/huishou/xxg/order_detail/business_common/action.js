!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        actionJieDan: doJieDan,
        actionChuFa: doChuFa,
        actionFillUpInfo: doFillUpInfo,
        actionTriggerCancelAndRefund: doTriggerCancelAndRefund,
        actionScanQRCode: actionScanQRCode,
        actionReScanQRCode: actionReScanQRCode,
        __test_actionScanQRCode: __test_actionScanQRCode,
        __test_actionReScanQRCode: __test_actionReScanQRCode,
        actionCantScanQRCode: doCantScanQrcode,
        actionServiceRemoteCheckShowStartTips: actionServiceRemoteCheckShowStartTips,
        actionLoopExpressInfo: actionLoopExpressInfo,
        actionStartDeliveryExpressCountdown: actionStartDeliveryExpressCountdown,
        actionShowCityManagerInfo: actionShowCityManagerInfo
    })
    var startCountdown = Bang.startCountdown

    // 更新订单状态
    function __actionApiActionBeforeArrive($btn, success) {
        tcb.loadingStart()
        window.XXG.BusinessCommon.apiActionBeforeArrive($btn,
            function (result) {
                setTimeout(function () {
                    tcb.loadingDone()
                }, 1000)
                if (typeof success === 'function') {
                    success(result)
                } else if (success === true) {
                    window.XXG.redirect()
                }
            },
            function () {
                tcb.loadingDone()
            }
        )
    }

    // 接单
    function doJieDan($btn, data) {
        var text = '接单后无法取消<br>请联系用户上门服务'
        if (data.oneStopData.__sf_fix || data.sfFixData.__re_new) {
            text = '接单后无法取消<br>收到新机后请联系用户上门服务'
        }
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            __actionApiActionBeforeArrive($btn, true)
        }, text)
    }

    // 出发
    function doChuFa($btn) {
        __actionApiActionBeforeArrive($btn, true)
    }

    // 提交价格等表单信息，然后到下一步操作
    function doFillUpInfo($btn, data) {
        window.XXG.BusinessCommon.eventTriggerFormUpdateOrderInfoGoNext($btn, data)
    }

    // 取消订单，并且退款
    function doTriggerCancelAndRefund($btn, data) {
        var order_id = $btn.attr('data-order-id'),
            refund_type = $btn.attr('data-refund-type'),
            html_fn = $.tmpl($.trim($('#JsXxgCancelOrderAndRefundTpl').html())),
            html_st = html_fn({
                'order_id': order_id
            }),
            dialogInst = tcb.showDialog(html_st, {
                withClose: true,
                middle: true
                // fromBottom: true
            })
        var $Form = dialogInst.wrap.find('form')
        window.XXG.BusinessCommon.eventBindCancelOrderAndRefund($Form, $btn, function () {
            tcb.closeDialog()
            setTimeout(function () {
                window.XXG.redirect(tcb.setUrl2('/Recycle/Engineer/CashierDesk', {
                    order_id: order_id,
                    business_id: refund_type
                }))
            }, 10)
        })
    }

    // 扫码同步验机信息
    function actionScanQRCode($btn) {
        // var rootData = window.XXG.BusinessCommon.rootData
        // var order_id = rootData.order.order_id
        var now_status = $btn.attr('data-now-status')
        var next_status = $btn.attr('data-next-status')
        // 如果按钮上存在当前status，和下一个目标status，
        // 那么需要执行BeforeArrive逻辑，更新订单状态
        var isChangeStatus = !!(now_status && next_status)

        __scanQRCodeReassess(
            // 扫码成功
            function (params, isNotebook) {
                isChangeStatus
                    ? __actionApiActionBeforeArrive($btn, function () {
                        __actionScanQRCodeSuccess({
                            params: params,
                            isNotebook: isNotebook
                        })
                    })
                    : __actionScanQRCodeSuccess({
                        params: params,
                        isNotebook: isNotebook
                    })
            },
            // 扫码失败
            function () {
                // 扫码失败，表示当前环境没有可用的扫码功能，
                // 那么直接略过，当做【无法自动验机】处理
                isChangeStatus
                    ? __actionApiActionBeforeArrive($btn, function () {
                        __actionScanQRCodeFail(true)
                    })
                    : __actionScanQRCodeFail(true)
            }
        )
    }

    // 重新扫码同步验机信息
    function actionReScanQRCode() {
        __scanQRCodeReassess(
            // 扫码成功
            function (params, isNotebook) {
                __actionScanQRCodeSuccess({
                    params: params,
                    isNotebook: isNotebook
                })
            },
            // 扫码失败
            function () {
                // 扫码失败，表示当前环境没有可用的扫码功能，
                // 那么直接略过，当做【无法自动验机】处理
                __actionScanQRCodeFail()
            }
        )
    }

    function __test_actionScanQRCode(resultStr) {
        var $btn = $('<a href="#">测试测试</a>')
        var rootData = window.XXG.BusinessCommon.rootData
        var order = rootData.order
        var order_id = order.order_id
        if (order.status == 11) {
            $btn
                .attr('data-order-id', order_id)
                .attr('data-now-status', '11')
                .attr('data-next-status', '12')
        }
        var now_status = $btn.attr('data-now-status')
        var next_status = $btn.attr('data-next-status')
        // 如果按钮上存在当前status，和下一个目标status，
        // 那么需要执行BeforeArrive逻辑，更新订单状态
        var isChangeStatus = !!(now_status && next_status)
        var result = (resultStr || '').split('|') || []
        var params = window.XXG.BusinessCommon.scanGetReAssessDataByQRCode(order_id, result)
        var isNotebook = result[0] === 'ARC'
        isChangeStatus
            ? __actionApiActionBeforeArrive($btn, function () {
                __actionScanQRCodeSuccess({
                    params: params,
                    isNotebook: isNotebook
                })
            })
            : __actionScanQRCodeSuccess({
                params: params,
                isNotebook: isNotebook
            })
    }

    // 重新扫码同步验机信息
    function __test_actionReScanQRCode(resultStr) {
        var rootData = window.XXG.BusinessCommon.rootData
        var order_id = rootData.order.order_id
        var result = (resultStr || '').split('|') || []
        var params = window.XXG.BusinessCommon.scanGetReAssessDataByQRCode(order_id, result)
        var isNotebook = result[0] === 'ARC'
        __actionScanQRCodeSuccess({
            params: params,
            isNotebook: isNotebook
        })
    }

    // 扫码成功
    function __actionScanQRCodeSuccess(options) {
        options = options || {}
        var rootData = window.XXG.BusinessCommon.rootData
        var params = options.params,
            success = options.success,
            fail = options.fail

        if (options.isNotebook) {
            // 笔记本扫码成功
            return __actionScanQRCodeSuccessNotebook(options)
        }

        tcb.loadingStart()
        window.XXG.BusinessCommon.apiDoScanRePinggu(params, function (res) {
            tcb.loadingDone()
            if (res && res.errno === 12014) {
                // 错误码 12014 代表订单机型 和 检测机型不一致 弹窗提示用户走再来一单重新下单
                __actionScanReassessErrorDiffModel(res, options)
            } else if (res && res.errno === 12015) {
                // 扫码重新评估，SKU不同
                __actionScanReassessErrorDiffSku(res.result || [])
            } else {
                if (typeof success === 'function') {
                    success()
                } else {
                    var msg = (res && !res.errno)
                        ? (rootData.serviceRemoteCheck.remote_check_flag ? '扫码同步成功！' : '新的评估价为：' + res['result'])
                        : (res && res.errmsg) || '系统错误'
                    window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                        window.XXG.redirect()
                    }, msg, {
                        withoutClose: true
                    })
                }
            }
        }, function (err) {
            tcb.loadingDone()
            typeof fail === 'function' && fail(err)
        })
    }

    // 【笔记本】扫码成功
    function __actionScanQRCodeSuccessNotebook(options) {
        options = options || {}
        var params = options.params,
            success = options.success,
            fail = options.fail
        tcb.loadingStart()
        window.XXG.BusinessCommon.apiAddNotebookAutoCheckResult(params, function (res) {
            if (res && !res.errno) {
                var result = res.result || {}
                if (result.modelId && result.assessKey) {
                    var bindingArcRecordParams = {
                        order_id: params.order_id,
                        arc_assess_key: result.assessKey
                    }
                    if (params.ignore_model_check === true) {
                        bindingArcRecordParams.ignore_model_check = true
                    }
                    return window.XXG.BusinessCommon.apiBindingArcRecord(bindingArcRecordParams, function (res) {
                        tcb.loadingDone()
                        if (typeof success === 'function') {
                            success()
                        } else {
                            var msg = (res && !res.errno)
                                ? '扫码同步成功！'
                                : (res && res.errmsg) || '系统错误'
                            window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                                window.XXG.redirect()
                            }, msg, {
                                withoutClose: true
                            })
                        }
                    }, function (err) {
                        tcb.loadingDone()
                        typeof fail === 'function' && fail(err)
                    })
                }
                res.errmsg = '数据错误'
            }
            tcb.loadingDone()
            // ['errno' => 19101, 'errmsg' => '笔记本机型映射不存在']
            // ['errno' => 19104, 'errmsg' => '笔记本SKU映射不存在']
            // ['errno' => 19106, 'errmsg' => '显卡缺失,请手动选择']
            // ['errno' => 12014, 'errmsg' => '验机机型和本订单回收机型不一致，请重新检验']
            if (res.errno === 12014 && res.result && res.result.canChangeModelFlag) {
                // 可以修改机型，进入此流程
                __actionScanReassessErrorDiffModel(res, options)
            } else if (res.errno === 19101 || res.errno === 19104) {
                res.result &&
                res.result.sequenceCode &&
                window.XXG.BusinessCommon.apiAutoCheckModelNotMatchNotice({
                    sequenceCode: res.result.sequenceCode
                }, null, null, {
                    silent: true
                })
                window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                    window.XXG.redirect()
                }, '验机结果同步处理延迟！请您稍等2-3分钟后再次尝试扫码', {
                    withoutClose: true
                })
            } else if (res.errno === 19106) {
                // 显卡缺失,请手动选择
                window.XXG.showDialogAddNoteBookAutoCheckGraphicsCardSelect(res.result && res.result.graphicsCardId, function (graphicsCardId) {
                    options.params = options.params || {}
                    options.params.graphicsCardId = graphicsCardId
                    __actionScanQRCodeSuccessNotebook(options)
                })
            } else {
                $.dialog.toast((res && res.errmsg) || '系统错误')
            }
        }, function (err) {
            tcb.loadingDone()
            typeof fail === 'function' && fail(err)
        })
    }

    //扫码成功后  订单机型 和 检测机型不一致 弹窗提示用户走再来一单重新下单
    function __actionScanReassessErrorDiffModel(res, options) {
        var result = res.result || {}
        if (result.canChangeModelFlag) {
            // canChangeModelFlag为true，表示支持更新机型，
            // 那么进入更新机型的流程
            return __actionScanReassessErrorDiffModelCanChange(res, options)
        }

        var differentModel = $('.different-alert-model-mask'),
            orderModelName = $('.different-alert-model-mask .order-model-name'),
            testModelName = $('.different-alert-model-mask .test-model-name')
        orderModelName.html(res.result.orderModelName)
        testModelName.html(res.result.assessModelName)
        differentModel.show()

        //播放提示音频
        var playNum = 1,
            timer,
            sound = new Howl({
                src: ['https://s5.ssl.qhres2.com/static/92875ec4bcd43b0d.mp3'],
                onend: function () {
                    //间隔两秒 再放一次。。。。。。
                    if (playNum === 1) {
                        timer = setTimeout(function () {
                            playNum++
                            sound.play()
                        }, 2000)
                    } else {
                        clearTimeout(timer)
                    }
                }
            })
        sound.play()
    }

    function __actionScanReassessErrorDiffModelCanChange(res, options) {
        var html_fn = $.tmpl(tcb.trim($('#JsXxgOrderDetailReassessErrorDiffModelCanChangeTpl').html())),
            html_st = html_fn(res.result),
            $html_st = $(html_st).appendTo('body')

        $html_st.find('.order-model').css('background-color', '#f7f7f7')
        $html_st.find('.test-model').css('background-color', '#ffe9dd')

        $html_st.find('.js-trigger-not-change-model-reassess').on('click', function (e) {
            // 回收原机型，重新验机，
            // 直接刷新页面
            e.preventDefault()
            window.XXG.redirect()
        })
        $html_st.find('.js-trigger-confirm-change-model').on('click', function (e) {
            // 回收检测机型
            e.preventDefault()

            $html_st.remove()

            options.params = options.params || {}
            // 当选择【回收检测机型】时，
            // 将请求参数增加ignore_model_check属性，并且设置为true
            options.params.ignore_model_check = true

            __actionScanQRCodeSuccess(options)
        })
    }

    // window.__actionScanReassessErrorDiffModelCanChange = __actionScanReassessErrorDiffModelCanChange

    // 扫码重新评估，SKU不同
    function __actionScanReassessErrorDiffSku(result) {
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            if (typeof window.XXG.BusinessCommon.callbackReAssessSkuDiff === 'function') {
                window.XXG.BusinessCommon.callbackReAssessSkuDiff()
            } else {
                $('.btn-old-deal-cancel.js-trigger-go-next')
                    .trigger('click')
            }
        }, window.XXG.BusinessCommon.htmlTpl('#JsMXxgOrderDetailBusinessCommonSkuNotMatchTpl', result), {
            withoutClose: true,
            noWrap: true,
            className: 'dialog-order-detail-sku-not-match',
            title: '检测到该回收手机与上一次检测的不一致，交易取消',
            options: {
                btn: '旧机不成交'
            }
        })
    }

    // 扫码失败
    function __actionScanQRCodeFail(refresh) {
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            refresh && window.XXG.redirect()
        }, '无法自动验机，请联系客服！！！<br>手动<span class="marked">修改评估项</span>，<span class="marked">修改SKU</span>', {
            withoutClose: true
        })
    }

    // 调起扫码，重新评估
    function __scanQRCodeReassess(callback, fail) {
        var rootData = window.XXG.BusinessCommon.rootData
        var order_id = rootData.order.order_id

        return window.XXG.BusinessCommon.scanQRCode(function (resultStr) {
            var result = (resultStr || '').split('|') || []
            var params = window.XXG.BusinessCommon.scanGetReAssessDataByQRCode(order_id, result)
            typeof callback === 'function' && callback(params, result[0] === 'ARC')
        }, fail)
    }

    // 无法自动验机
    function doCantScanQrcode($btn) {
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            __actionApiActionBeforeArrive($btn, true)
        }, '无法自动验机，请联系客服<br>手动<span class="marked">修改评估项</span>，<span class="marked">修改SKU</span>')
    }

    // 展示开始远程验机弹窗提示
    function actionServiceRemoteCheckShowStartTips(data) {
        if (!window.XXG.ServiceRemoteCheck.actionIsRemoteCheckWorkTime()) {
            // 不在远程验机时间内，那么弹出提示
            return window.XXG.BusinessCommon.helperShowAlertConfirm(null, '服务时间为早9点至晚10点，请在此时间段内操作订单')
        } else if (data.isScannedReAssess || data.serviceRemoteCheck.remote_check_flag_process) {
            // 已经扫码重新评估 || 已经进入了远程验机流程
            window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                window.XXG.ServiceUploadPicture.show()
            }, '是否开始智能验机？', {
                // withoutClose: true,
                options: {
                    btn: '开始'
                }
            })
        } else {
            window.XXG.BusinessCommon.helperShowAlertConfirm(null, '请先扫码评估！')
        }
    }

    function actionLoopExpressInfo(data) {
        var order = data.order || {}
        if (order.status == 13 && !(order.send_out && (order.send_out.logistics_mail_no || order.send_out.logistics_express_status_fail))) {
            // 订单服务完成，但是还没有快递单号，那么轮询获取快递信息，获取到了之后刷新页面
            var loopDone = false

            function loopExpressInfo() {
                if (loopDone) {
                    return
                }
                window.XXG.BusinessCommon.apiGetOrderExpressInfo({order_id: order.order_id}, function (res) {
                    if (res && res.express && (res.express.express_id || res.express.express_status_fail)) {
                        loopDone = true
                        if (res.express.express_id) {
                            order.send_out = {
                                logistics_mail_no: res.express.express_id,
                                logistics_company_name: res.express.express_name
                            }
                        } else if (res.express.express_status_fail) {
                            order.send_out = {
                                logistics_express_status_fail: res.express.express_status_fail
                            }
                        }
                        window.XXG.redirect()
                    }
                }, null, {silent: 1})
                setTimeout(loopExpressInfo, 2000)
            }

            loopExpressInfo()
        }
    }

    function actionStartDeliveryExpressCountdown(data) {
        var $countdown = $('.delivery-express-countdown')
        if (!$countdown.length) {
            return
        }
        var order = data.order || {}
        var newstatus_time = order.newstatus_time || ''
        var now_time = window.XXG.BusinessCommon.helperNowTime()
        // var end_time = now_time + 2 * 60 * 1000
        var end_time = Date.parse(newstatus_time.replace(/-/g, '/')) + 10 * 60 * 1000
        if (end_time <= now_time) {
            return
        }
        startCountdown(end_time, now_time, $countdown, {
            end: function () {
                window.XXG.redirect()
            }
        })
    }

    // 丰修上门回收--显示城市督导信息
    function actionShowCityManagerInfo($btn, data, callback) {
        var order = data.order || {}
        var serviceRemoteCheck = data.serviceRemoteCheck || {}

        if (serviceRemoteCheck.remote_check_flag && serviceRemoteCheck.remote_check_flag_process == 3) {
            window.XXG.BusinessCommon.apiGetCityManagerInfo({
                order_id: order.order_id
            }, function (res) {
                var info = res.info || {}
                var html_st = window.XXG.BusinessCommon.htmlBusinessCommonDialogCityManager({info: info})
                var dialogInst = window.XXG.BusinessCommon.helperShowDialog(html_st, {
                    withClose: true
                })
                dialogInst.wrap.find('.js-trigger-sf-fix-re-cancel-order').on('click', function (e) {
                    e.preventDefault()

                    window.XXG.BusinessCommon.helperCloseDialog(dialogInst)

                    $.isFunction(callback) && callback($btn, data)
                })
            }, function () {
                $.isFunction(callback) && callback($btn, data)
            })
        } else {
            $.isFunction(callback) && callback($btn, data)
        }
    }
}()
