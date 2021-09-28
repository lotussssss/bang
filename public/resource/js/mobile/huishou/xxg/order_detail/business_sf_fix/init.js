!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessSfFix = tcb.mix(window.XXG.BusinessSfFix || {}, {
        data: null,
        $Wrap: null,
        init: init
    })

    function init(data, done) {
        // 设置提交更新订单时的默认备注
        data.order.memo = '丰修--修修哥'

        var $Wrap = $('.block-order-sf-fix-order')
        window.XXG.BusinessSfFix.data = data
        window.XXG.BusinessSfFix.$Wrap = $Wrap
        window.XXG.BusinessSfFix.render(data)
        window.XXG.BusinessCommon.eventBind(data)
        window.XXG.BusinessSfFix.eventBind(data)

        /***** 载入服务 *****/
        window.XXG.BusinessCommon.setupService([
            // 初始化用户隐私协议
            [window.XXG.ServicePrivacyProtocolSign, {
                data: data,
                init: function (next, final) {
                    console.log('路过隐私协议处理')
                    next()
                },
                callbackConfirmAgree: function () {
                    window.XXG.ServiceIntroAppDetect.actionShowSelect()
                }
            }],
            // 初始化隐私数据处理
            [window.XXG.ServicePrivateData, {
                data: data,
                init: function (next, final) {
                    var order = data.order
                    var servicePrivateData = data.servicePrivateData
                    var sfFixData = data.sfFixData
                    if (order.status == 12 && servicePrivateData.isHas && (sfFixData.__recycle || servicePrivateData.isMigrateFlow)) {
                        // 有隐私数据 && (是丰修纯回收 || 需要进入迁移隐私数据流程)

                        window.XXG.ServicePrivateData.renderServicePrivateDataBtn(data)
                        // window.XXG.ServicePrivateData.actionShowAlipayWithholding()
                        if (servicePrivateData.migrateFlag == 1 && !servicePrivateData.isPayed) {
                            // 需要迁移隐私数据 && 还未签约代扣或者支付成功，
                            // 那么直接展示出签约代扣的弹窗
                            window.XXG.ServicePrivateData.actionTriggerAlipayWithholding()
                        } else if (servicePrivateData.migrateFlag == 1
                            && servicePrivateData.isPayed
                            && !servicePrivateData.isMigrate
                            && !servicePrivateData.isVisitAgain) {
                            window.XXG.ServicePrivateData.actionDeliveredNewDeviceSoundPlay()

                            var text = '<div style="padding-bottom: 0.1rem;font-size: .13rem;line-height: 1.4;text-align: left;">' +
                                '客户转移数据：请<span style="color: #FE6E2C;">妥投新机</span>，' +
                                '引导用户<span style="color: #FE6E2C;">转移数据</span>旧手机留给用户，再次上门后<span style="color: #FE6E2C;">重新验机</span>' +
                                '<br><br><span style="color: #FE6E2C;">备注:<br>请小哥当面与客预约二次上门取旧机的时间</span></div>'
                            $('#SfFixVerificationCodeBarcode').before(text)
                        }
                        if (!$('.btn-old-deal-cancel.js-trigger-go-next').length) {
                            window.XXG.BusinessCommon.callbackReAssessSkuDiff = function () {
                                var $trigger = $('<a class="js-trigger-go-next" href="#">旧机不成交</a>').appendTo('body')
                                window.XXG.ServicePrivateData.actionTriggerOldDeviceCancel($trigger)
                                $trigger.remove()
                            }
                        }
                    }

                    console.log('路过隐私数据处理')
                    next()
                },
                // 二次上门扫码重新验机
                callbackScanReassessAgain: function () {
                    window.XXG.ServiceIntroAppDetect.actionShowDirectScan()
                }
            }],
            // 初始化上传图片
            [window.XXG.ServiceUploadPicture, {
                data: data,
                init: function (next, final) {
                    window.XXG.ServiceUploadPicture.fnQueueSubmitSuccess.push(
                        function (next, final) {
                            // 上传图片提交成功后
                            window.XXG.ServiceRemoteCheck.start()
                            next()
                        }
                    )
                    console.log('路过图片上传')
                    next()
                }
            }],
            // 初始化远程验机
            [window.XXG.ServiceRemoteCheck, {
                $target: $Wrap,
                addType: 'prepend',
                data: data,
                callbackStatusChangeBefore: function (serviceRemoteCheck, start, next) {
                    if (!start) {
                        // 非处是状态的change，那么粗暴点，刷新页面
                        return window.XXG.redirect()
                    }
                    if (serviceRemoteCheck.remote_check_flag_process == -1) {
                        // 驳回时，先清除当前ui内容，保留输出远程验机区域
                        window.XXG.ServiceRemoteCheck.render($Wrap, 'html')
                    } else {
                        // window.XXG.BusinessSfFix.render(data)
                        window.XXG.ServiceRemoteCheck.render($Wrap, 'prepend')
                    }
                    typeof next === 'function' && next()
                },
                callbackStatusChangeDone: function (serviceRemoteCheck, start) {
                    if (serviceRemoteCheck.remote_check_flag_process) {
                        // 开启远程验机之后，不在允许重新扫码
                        window.XXG.BusinessCommon.fnQueueTriggerReScanQRCode.push(function (e, $trigger, data, next, final) {
                            var tips = serviceRemoteCheck.remote_check_flag_process == 3
                                ? '已经完成远程验机，不能再重新扫码'
                                : '已经开启远程验机，不能再重新扫码'
                            window.XXG.BusinessCommon.helperShowAlertConfirm(null, tips)
                        })
                    }
                    if (data.servicePrivateData && data.servicePrivateData.isVisitAgain) {
                        // 隐私导数，二次上门，远程验机完成，不显示远程验机信息
                        window.XXG.ServiceRemoteCheck.actionHideBlockRemoteCheck()
                    }
                },
                // 初始化远程验机逻辑
                init: function (next, final) {
                    // 进入详情页之后，若还没有开启远程验机流程，那么不开启远程验机监听状态，
                    // 否则开启远程验机监听状态
                    var serviceRemoteCheck = data.serviceRemoteCheck
                    var order = data.order
                    // 支持远程验机，并且订单状态为12（已到达）
                    if (serviceRemoteCheck.remote_check_flag && order.status == 12) {
                        if (serviceRemoteCheck.remote_check_flag_process) {
                            // remote_check_flag_process为非0的值的时候，
                            // 表示远程验机状态已经开启，那么直接再次开启监听状态
                            window.XXG.ServiceRemoteCheck.start()
                        } else {
                            // remote_check_flag_process为0的值的时候，远程验机还没有开始，
                            // 那么进入开启远程验机提示流程（实际上是去传图），如果有一些非满足开启条件阻断，那么将无法开启，
                            // 例如 没有重新扫码，或者，不在远程验机时间内
                            window.XXG.BusinessCommon.actionServiceRemoteCheckShowStartTips(data)
                        }
                    }
                    console.log('路过远程验机')
                    next()
                }
            }],
            // 初始化引导APP检测
            [window.XXG.ServiceIntroAppDetect, {
                data: data,
                init: function (next, final) {
                    // var data = window.XXG.ServiceIntroAppDetect.rootData
                    // if (data.order.status == 11 && data.isIphone) {
                    //     // 订单状态为11 && 为iPhone
                    //     window.XXG.ServiceIntroAppDetect.render(data, $Wrap.find('.block-order-extend'))
                    // }
                    console.log('路过引导APP检测')
                    next()
                },
                callbackBeforeShowSelect: function (next) {
                    // 需要签约隐私协议，并且还没有签署，那么触发隐私协议签约逻辑，
                    // 否则进入正常逻辑
                    var data = window.XXG.ServiceIntroAppDetect.rootData
                    var servicePrivacyProtocol = data.servicePrivacyProtocol
                    if (servicePrivacyProtocol.isNeedSign
                        && !servicePrivacyProtocol.isSigned) {
                        window.XXG.ServicePrivacyProtocolSign.actionConfirmUserCleanDevice()
                    } else {
                        next()
                    }
                },
                callbackBeforeTriggerScanQRCode: function (next) {
                    var rootData = window.XXG.ServiceIntroAppDetect.rootData
                    var order = rootData.order
                    var servicePrivateData = rootData.servicePrivateData
                    if (servicePrivateData.isMigrateFlow
                        && servicePrivateData.migrateFlag == 1
                        && servicePrivateData.isPayed) {
                        // 迁移隐私数据流程 && 用户需要迁移数据 && 用户已经为迁移数据支付成功或者签约代扣成功
                        // 此种情况下扫码，表示二次上门，那么保存已经二次上门状态
                        window.XXG.ServicePrivateData.apiSavePrivateDataVisitAgain({
                            order_id: order.order_id
                        }, function () {
                            next()
                        })
                    } else {
                        next()
                    }
                }
            }],
            // 初始化无法扫码检测旧机，直接购买新机
            [window.XXG.ServiceCantScanBuyNew, {
                data: data,
                callbackConfirm: function () {
                    window.XXG.BusinessSfFix.actionSfFixFullPay(null, data)
                },
                init: function (next, final) {
                    var data = window.XXG.ServiceCantScanBuyNew.rootData
                    if (data.sfFixData.__re_new && data.order.status == 11) {
                        // 以旧换新 && 订单状态为11
                        window.XXG.ServiceCantScanBuyNew.render(data, $Wrap.find('.block-order-extend'))
                    }
                    console.log('路过无法扫码检测旧机，直接购买新机')
                    next()
                }
            }],
            // 初始化纯回收上门转邮寄
            [window.XXG.ServiceShangmenToYouji, {
                data: data,
                callbackConfirm: function (callback) {
                    window.XXG.ServiceShangmenToYouji.renderToYouji(data, $Wrap)
                    typeof callback === 'function' && callback()
                },
                init: function (next, final) {
                    window.XXG.BusinessCommon.fnQueueRenderDone.push(renderServiceShangmenToYouji)
                    renderServiceShangmenToYouji()

                    function renderServiceShangmenToYouji() {
                        if (window.XXG.ServiceShangmenToYouji.actionIsConverted()) {
                            window.XXG.ServiceShangmenToYouji.renderToYouji(data, $Wrap)
                        } else if (data.order.status == 11 && data.sfFixData.__recycle) {
                            // 丰修纯回收 && 订单状态为11才能上门转邮寄

                            // 新模式下，在点击【开始验机】按钮后的弹窗里才显示上门转邮寄的触发按钮，
                            // 所以此处不在输出触发入口
                            // window.XXG.ServiceShangmenToYouji.render(data, $Wrap.find('.block-order-extend'))
                        }
                    }

                    console.log('路过纯回收上门转邮寄')
                    next()
                }
            }],
            // 初始化新机激活
            [window.XXG.ServiceNewDeviceActivation, {
                data: data,
                init: function (next, final) {
                    // 是否需要新机激活
                    if (data.isNewDeviceNeedActivation) {
                        window.XXG.ServiceNewDeviceActivation.actionShow()
                    }

                    console.log('路过新机激活')
                    next()
                }
            }]
        ], function () {
            typeof done === 'function' && done()
        })
    }

}()
