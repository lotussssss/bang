!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        $FormUpdateOrderInfo: null,
        fnQueueTriggerReScanQRCode: [],
        fnQueueRenderDone: [],

        eventBind: eventBind,
        eventBindFormUpdateOrderInfo: eventBindFormUpdateOrderInfo,
        eventBindPickupServerTime: eventBindPickupServerTime,
        eventBindCancelOrderAndRefund: eventBindCancelOrderAndRefund,
        eventBindFormSfFixReturn: eventBindFormSfFixReturn,
        eventBindCopy: eventBindCopy,
        eventBindDeviceResetAndUploadPhoto: eventBindDeviceResetAndUploadPhoto,

        eventTriggerRenderDone: eventTriggerRenderDone,
        eventTriggerFormUpdateOrderInfo: eventTriggerFormUpdateOrderInfo,
        eventTriggerFormUpdateOrderInfoGoNext: eventTriggerFormUpdateOrderInfoGoNext
    })

    // 根据触发器绑定代理事件，只能执行一次
    function eventBind(data) {
        if (eventBind.__bind) {
            return
        }
        eventBind.__bind = true
        tcb.bindEvent({
            // 展开/收起 更多订单信息
            '.js-trigger-expand-n-collapse': function (e) {
                e.preventDefault()
                var $me = $(this)
                var $orderDeal = $me.closest('.block-order-deal')
                if (!$orderDeal.length) {
                    return
                }
                $me.toggleClass('arrow-down arrow-up')
                $orderDeal.find('.block-order-base-info-extend').slideToggle(200)
            },
            // 手动更新成交价
            '.js-trigger-update-deal-price': function (e) {
                e.preventDefault()
                var order = data.order
                if (parseFloat(order.final_price) > 0) {
                    window.XXG.BusinessCommon.eventTriggerFormUpdateOrderInfo()
                } else {
                    window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                        window.XXG.BusinessCommon.eventTriggerFormUpdateOrderInfo()
                    }, '价格提交后将不能再更改评估项！')
                }
            },
            // 订单下一步
            '.js-trigger-go-next': function (e) {
                e.preventDefault()
                var $me = $(this)
                var fnQueueGoNext = window.XXG.BusinessCommon.eventBind.fnQueueGoNext || []
                // 遍历执行下一步的函数队列
                tcb.each(fnQueueGoNext, function (i, fn) {
                    if (fn(e, $me, data) === false) {
                        // 如果事件队列中某一个返回false，那么退出执行队列
                        return false
                    }
                })
            },
            // 显示评估详情
            '.js-trigger-sf-fix-show-assess-detail': function (e) {
                e.preventDefault()
                window.XXG.BusinessCommon.reassessShowOrderAssessDetail($(this))
            },
            // 重新扫码
            '.js-trigger-re-scan-qrcode': function (e) {
                e.preventDefault()
                var $me = $(this)
                var fnQueueTriggerReScanQRCode = [].concat(window.XXG.BusinessCommon.fnQueueTriggerReScanQRCode || [],
                    function () {
                        window.XXG.BusinessCommon.actionReScanQRCode($me, data)
                    }
                )
                // 遍历执行下一步的函数队列
                !function executeFnQueue(fnQueue, fn_final) {
                    if (!fnQueue.length) {
                        return typeof fn_final === 'function' && fn_final()
                    }
                    var fn = fnQueue.shift()
                    // 如果事件队列中某一个函数不执行下一个的回调时退出执行队列
                    fn(e, $me, data, function () {
                        executeFnQueue(fnQueue, fn_final)
                    }, function (isStop) {
                        !isStop && typeof fn_final === 'function' && fn_final()
                    })
                }(fnQueueTriggerReScanQRCode)
            },
            // 查看回收手机参数详情
            '.js-trigger-show-assess-options': function (e) {
                e.preventDefault()
                window.XXG.BusinessCommon.reassessShowOrderAssessOptions($(this))
            },
            // 查看回收手机SKU属性详情
            '.js-trigger-show-assess-sku': function (e) {
                e.preventDefault()
                window.XXG.BusinessCommon.reassessShowOrderAssessSku($(this))
            },
            // 展开收起评估结果
            '.js-trigger-toggle-order-detail-assess-item': function (e) {
                e.preventDefault()
                var $me = $(this)
                var $inner = $me.find('span')
                var $assessItemSame = $me.closest('.block-assess-detail').find('.assess-item-same')
                var $assessItemSameTip = $me.closest('.block-assess-detail').find('.assess-item-same-tip')

                if ($inner.hasClass('arrow-down')) {
                    $inner.removeClass('arrow-down').addClass('arrow-up').html('收起')
                    $assessItemSame.show()
                    $assessItemSameTip.length && $assessItemSameTip.hide()
                } else {
                    $inner.removeClass('arrow-up').addClass('arrow-down').html('查看全部')
                    $assessItemSame.hide()
                    $assessItemSameTip.length && $assessItemSameTip.show()
                }
                $.scrollTo({
                    endY: $('.block-order-deal').offset()['top']
                })
            },
            // 扫码获取物流单号
            '.js-trigger-scan-express-no': function (e) {
                e.preventDefault()
                var $me = $(this)
                window.XXG.BusinessCommon.scanQRCode(function (str) {
                    $me.siblings('input').val(str)
                })
            },
            //   用户重新下单 走再来一单流程
            //     '.js-re-order':function (e) {
            //         e.preventDefault()
            //         var differentMask = $('.different-alert-model-mask'),
            //             differentOrderId = $(this).attr('data-different-order-id'),
            //             differentPhone = $(this).attr('data-different-phone')
            //         //关掉当前页面弹窗
            //         differentMask.hide()
            //         window.location.href = tcb.setUrl('/m/hs_xxg_order_list', {"source_page":"zlyd"});
            //             var mask = $('.zlyd-alert-model-mask'),
            //                 zlydSuccess = $('.zlyd-alert-model-mask .zlyd-success')
            //             $('.zlyd-alert-model .zlyd-user-information span').html(differentPhone)
            //             $('.zlyd-alert-model-btn-confirm').attr('href','/huishou/confirmAgainOneOrder?order_id='+differentOrderId)
            //             zlydSuccess.show()
            //             mask.show()
            //
            //
            //     },
            // 关闭机型不一致弹窗
            '.close-different-model': function (e) {
                e.preventDefault()
                // var differentMask = $('.different-alert-model-mask')
                // differentMask.hide()
                window.XXG.redirect()
            },
            '.js-trigger-reload-express-info': function (e) {
                e.preventDefault()
                var $me = $(this)
                var $icon = $me.find('.icon-reload-express-info')
                $icon.off()
                $icon.on('transitionend', function (e) {
                    console.log(111)
                    $icon.css({
                        'transition': 'none',
                        'transform': 'rotate(0deg)'
                    })
                })
                $icon.css({
                    'transition': 'transform 1.2s',
                    'transform': 'rotate(360deg)'
                })
            },
            '.js-trigger-order-xxg-trace': function (e) {
                var $me = $(this)
                var order_id = $me.attr('data-order-id')
                var scene = $me.attr('data-tap-scene')
                window.XXG.BusinessCommon.apiOrderXxgTrace({order_id: order_id, scene: scene})
            }
        })
    }

    // 设置 fnQueueGoNext
    eventBind.fnQueueGoNext = [__fnGoNext]

    // 事件--下一步
    function __fnGoNext(e, $trigger, data) {
        var isContinue = true
        if (!__validGoNext($trigger)) {
            return false
        }
        var act = $trigger.attr('data-act')
        switch (act) {
            case 'jiedan':
                // 接单
                isContinue = false
                window.XXG.BusinessCommon.actionJieDan($trigger, data)
                break
            case 'chufa':
                // 出发
                isContinue = false
                window.XXG.BusinessCommon.actionChuFa($trigger)
                break
            case 'fill-up-info':
                // 填写完善旧机信息
                isContinue = false
                window.XXG.BusinessCommon.actionFillUpInfo($trigger, data)
                break
            case 'cancel-refund':
                // 取消订单，并且去退款
                isContinue = false
                window.XXG.BusinessCommon.actionTriggerCancelAndRefund($trigger, data)
                break
            case 'scan-qrcode':
                // 扫码同步验机信息
                isContinue = false
                window.XXG.BusinessCommon.actionScanQRCode($trigger, data)
                break
            case 'cant-scan-qrcode':
                // 无法自动验机
                isContinue = false
                window.XXG.BusinessCommon.actionCantScanQRCode($trigger)
                break
            case 'trigger-remote-check-upload-picture':
                // 触发远程验机传图
                isContinue = false
                window.XXG.BusinessCommon.actionServiceRemoteCheckShowStartTips(data)
                break
            default:
                break
        }

        return isContinue
    }

    function __validGoNext($trigger) {
        if ($trigger && $trigger.length && $trigger.hasClass('btn-go-next-lock')) {
            return
        }
        var errMsg = ''
        if (!errMsg && window.__SUNING_YUNDIAN_MINIAPP_NEED_FILL_UP) {
            errMsg = '请完善用户收款信息。'
        }
        if (!errMsg && window.__IS_NEEDED_MANAGER_CHECK && window.__IS_MANAGER_CHECK_STARTED) {
            // 店长审核校验
            if (!window.__IS_MANAGER_CHECK_SUCCESS) {
                // 审核没有通过，那么提示审核通过了之后之后再操作。
                // 在此只是设置错误提示信息，还不做操作，
                // 如果还有远程验机相关操作，那么先保证远程验机操作可以继续，例如远程验机被驳回，那么可以继续传图等
                errMsg = '请等待审核通过再操作。'
            }
        }
        // if (!errMsg && window.__IDCARD_INFO__.force_flag !== null && (window.__IDCARD_INFO__.force_flag && !window.__IDCARD_INFO__.have_flag)) {
        //     // 校验是否填写身份证信息
        //     if (window.__IDCARD_INFO__.force_flag && !window.__IDCARD_INFO__.have_flag) {
        //         errMsg = '请填写顾客身份证后再提交。'
        //     }
        // }
        if (errMsg) {
            $.dialog.toast(errMsg)
            return
        }
        return true
    }

    // 绑定更新订单信息表单
    function eventBindFormUpdateOrderInfo($form, $trigger, callback) {
        if (!($form && $form.length)) {
            return
        }
        window.XXG.BusinessCommon.$FormUpdateOrderInfo = $form

        var trigger_text = $trigger.html()

        window.XXG.bindForm({
            $form: $form,
            before: function ($form, next, before_cb) {
                if (!__validUpdateOrderByGoNext($form)) {
                    return false
                }
                if ($trigger.hasClass('btn-disabled')) {
                    return false
                }
                if (typeof before_cb === 'function' && !before_cb($form)) {
                    return false
                }

                $trigger.addClass('btn-disabled').html('处理中...')
                tcb.loadingStart()
                next()
            },
            success: function (res, $form, success_cb) {
                tcb.loadingDone()
                var imei = tcb.trim($form.find('[name="imei"]').val() || '')
                var memo = tcb.trim($form.find('[name="memo"]').val() || '')
                window.__ORDER.imei = window.__ORDER_INFO.imei = imei
                window.__ORDER.memo = window.__ORDER_INFO.memo = memo

                // 数据更新成功
                setTimeout(function () {
                    $trigger.removeClass('btn-disabled').html(trigger_text)
                }, 400)

                if (typeof success_cb === 'function') {
                    success_cb(res, $form, $trigger)
                } else {
                    typeof callback === 'function' && callback()
                }

                // return window.showPageCustomerSignature && window.showPageCustomerSignature()
            },
            error: function (res, error_cb) {
                tcb.loadingDone()
                window.__SAMSUMG_SUBSIDY_5G = false
                $trigger.removeClass('btn-disabled').html(trigger_text)
                if (typeof error_cb === 'function') {
                    return error_cb(res)
                }
                $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
            }
        })

        function __bindPriceEvent($form) {
            var $price = $form.find('[name="price"]')
            var $order_id = $form.find('[name="order_id"]')
            $price.on('input change', function () {
                var $me = $(this)
                var price = $me.val()
                var order_id = $order_id.val()
                window.XXG.BusinessCommon.apiGetFinalPriceStructure({
                    orderId: order_id,
                    price: price
                }, null, null, function (add_price) {
                    if (add_price > -1) {
                        $('.price-structure-add-price').html(add_price > 0 ? '再+' + add_price + '元补贴' : '')
                    }
                })
            })
        }

        __bindPriceEvent($form)
    }

    // 验证下一步前的提交参数
    function __validUpdateOrderByGoNext($Form) {
        var flag = true,
            toast_text = '',
            $focus = null

        var $assessPrice = $('.row-order-assess-price .col-12-8'),
            $dealPrice = $Form.find('[name="price"]'),
            $dealImei = $Form.find('[name="imei"]'),
            $dealMemo = $Form.find('[name="memo"]')

        if ($dealPrice && $dealPrice.length) {
            var price = parseFloat(tcb.trim($dealPrice.val()))
            if (!price) {
                flag = false
                $focus = $focus || $dealPrice
                $dealPrice.closest('.form-item-row').shine4Error()
            }
        }
        if ($dealImei && $dealImei.length) {
            var imei = tcb.trim($dealImei.val())
            if (!imei) {
                flag = false
                $focus = $focus || $dealImei
                $dealImei.closest('.form-item-row').shine4Error()
            }
        }
        if ($dealMemo && $dealMemo.length) {
            var memo = tcb.trim($dealMemo.val())
            var assess_price = tcb.trim($assessPrice.html())
            if (price && parseFloat(price) != parseFloat(assess_price) && !memo) {
                flag = false
                $focus = $focus || $dealMemo
                $dealMemo.closest('.form-item-row').shine4Error()
                toast_text = '评估价和成交价不一致，请填写备注'
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

    // 选择上门服务时间
    function eventBindPickupServerTime($trigger) {
        var order_id = $trigger.attr('data-order-id')
        var pickerData = []
        tcb.each(window.__ALLOW_SERVER_TIME__ || [], function (i, item) {
            pickerData.push({
                id: i,
                name: item
            })
        })

        var pos = 0

        Bang.Picker({
            // 实例化的时候自动执行init函数
            flagAutoInit: true,
            // 触发器
            selectorTrigger: $trigger,

            col: 1,
            data: [pickerData],
            dataTitle: ['请选择时间'],
            dataPos: [pos],

            callbackTriggerBefore: function () {
                if (!(pickerData && pickerData.length)) {
                    $.dialog.toast('抱歉选择时间缺失，无法选择', 3000)
                    return false
                }
            },
            // 回调函数(确认/取消)
            callbackConfirm: function (inst) {
                var data = inst.options.data || [],
                    dataPos = inst.options.dataPos || [],
                    selectedData = data[0][dataPos[0]],
                    serverTime = selectedData.name
                var requestData = {
                    order_id: order_id,
                    datetime: serverTime
                }
                if (window.__IS_SHOW_DAODIAN_SERVER_TIME) {
                    // 到店时间选择
                    var tips = '<div style="text-align: center">注意：您填写的时间将短信通知用户！</div>'
                    window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
                        __updateServerTime(requestData, function () {
                            window.__DAODIAN_SERVER_TIME = serverTime
                            $.dialog.toast('填写成功，已短信通知用户预约时间', 3000)
                            $trigger.closest('.row').find('.col-server-time').html(serverTime)
                        })
                    }, tips)
                } else {
                    // 普通上门时间选择
                    __updateServerTime(requestData, function () {
                        setTimeout(function () {
                            window.XXG.redirect()
                        }, 10)
                    })
                }
            },
            callbackCancel: null
        })
    }

    function __updateServerTime(data, callback) {
        tcb.loadingStart()
        window.XXG.BusinessCommon.apiUpdateServerTime(data, function (res) {
            tcb.loadingDone()
            typeof callback === 'function' && callback(res)
        }, function () {
            tcb.loadingDone()
        })
    }

    // 取消订单，并且退款
    function eventBindCancelOrderAndRefund($form, $trigger, callback) {
        window.XXG.bindForm({
            $form: $form,
            before: function ($form, next) {
                var $xxg_memo = $form.find('[name="xxg_memo"]'),
                    xxg_memo = tcb.trim($xxg_memo.val())
                if (!xxg_memo) {
                    $xxg_memo.attr('data-error-msg') && $.dialog.toast($xxg_memo.attr('data-error-msg'))
                    return $xxg_memo.shine4Error()
                }
                tcb.loadingStart()
                next()
            },
            success: function () {
                tcb.loadingDone()
                typeof callback === 'function' && callback()
            },
            error: function (res) {
                tcb.loadingDone()
                $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
            }
        })
    }

    // 绑定丰修退回新机和寄回旧机的快递表单
    function eventBindFormSfFixReturn($Form, $trigger, callback) {
        if (!($Form && $Form.length)) {
            return
        }

        $Form.find('[name="mail_no"]').on('input change', function (e) {
            var $me = $(this),
                val = $me.val()

            val = val.replace(/[^\dA-Za-z]/g, '').toUpperCase()
            $me.val(val)
        })

        var trigger_text = $trigger.html()

        window.XXG.bindForm({
            $form: $Form,
            before: function ($Form, callback) {
                if (!__validFormSfFixReturn($Form)) {
                    return false
                }
                if ($trigger.hasClass('btn-disabled')) {
                    return false
                }
                $trigger.addClass('btn-disabled').html('处理中...')
                callback()
            },
            success: function (res) {
                typeof callback === 'function' && callback(res)
            },
            error: function (res) {
                $trigger.removeClass('btn-disabled').html(trigger_text)
                $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
            }
        })
    }

    function __validFormSfFixReturn($Form) {
        var flag = true,
            toast_text = '',
            $focus = null

        var $company_name = $Form.find('[name="company_name"]'),
            $mail_no = $Form.find('[name="mail_no"]')

        if ($company_name && $company_name.length) {
            var company_name = tcb.trim($company_name.val())
            if (!company_name) {
                flag = false
                $focus = $focus || $company_name
                $company_name.closest('.form-item-row').shine4Error()
            }
        }
        if ($mail_no && $mail_no.length) {
            var mail_no = tcb.trim($mail_no.val())

            if (!mail_no) {
                flag = false
                $focus = $focus || $mail_no
                $mail_no.closest('.form-item-row').shine4Error()
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

    // 绑定复制事件
    function eventBindCopy($el) {
        $el.each(function () {
            new ClipboardJS(this).on('success', function (e) {
                $.dialog.toast('复制成功：' + (e.text.replace(/\\n/ig, '<br>')))
            })
        })
    }

    // 绑定设备重置图片上传相关事件
    function eventBindDeviceResetAndUploadPhoto(next, final) {
        var $wrap = $('.block-device-reset-and-upload-photo')
        if (!$wrap.length) {
            return
        }

        var $trigger_show_big = $wrap.find('.js-trigger-show-big-figure-picture')
        var $trigger = $wrap.find('.js-trigger-device-reset-and-upload-photo')
        var $trigger_submit = $wrap.find('.js-trigger-submit-device-reset-and-upload-photo')
        var inst = new window.TakePhotoUpload({
            $trigger: $trigger,
            callback_upload_success: function (inst, data) {
                // console.log('触发了上传图片的函数')
                if (data && !data.errno) {
                    var $triggerCurrent = inst.$triggerCurrent
                    if (!($triggerCurrent && $triggerCurrent.length)) {
                        return
                    }
                    // console.log(inst, data)
                    $triggerCurrent.css('backgroundImage', 'url(' + data.result + ')')
                    $triggerCurrent.find('div').hide()
                    $trigger_submit.attr('data-img', data.result)
                } else {
                    return $.dialog.toast((data && data.errmsg) || '系统错误')
                }
            },
            callback_upload_fail: function (me, xhr, status, err) {
                $.dialog.toast(xhr.statusText || '上传失败，请稍后再试')
            }
        })

        $trigger_show_big.on('click', function (e) {
            e.preventDefault()

            var $me = $(this)
            var img_url = $me.attr('data-big')
            var $big = $('<div class="grid column justify-center align-center" style="position: fixed;top: 0;right: 0;bottom: 0;left: 0;background-color: rgba(0,0,0,0.5);">' +
                '<div class="col" style="padding-top:100%;background: transparent url(' + img_url + ') no-repeat center;background-size: contain;"></div>' +
                '</div>')
            $big.appendTo('body')
            $big.on('click', function (e) {
                e.preventDefault()
                $big.remove()
            })
        })
        $trigger_submit.on('click', function (e) {
            e.preventDefault()

            var $me = $(this)
            if ($me.attr('data-is-clicking')) {
                return
            }
            var img_url = $me.attr('data-img')
            if (!img_url) {
                return $.dialog.toast('请拍照上传还原后照片')
            }
            $me.attr('data-is-clicking', '1')
            var rootData = window.XXG.BusinessCommon.rootData
            var order_id = rootData.order.order_id
            window.XXG.BusinessCommon.apiGetMobileRestoreSituation({
                order_id: order_id,
                img_url: img_url
            }, function (res) {
                var result = res.result || {}
                if (!result.adoptFlag) {
                    $me.attr('data-is-clicking', '')
                    $.dialog.toast('照片有误，请重新上传！')
                    var $triggerCurrent = inst.$triggerCurrent
                    if (!($triggerCurrent && $triggerCurrent.length)) {
                        return
                    }
                    // console.log(inst, data)
                    $triggerCurrent.css('backgroundImage', '')
                    $triggerCurrent.find('div').show()
                    $trigger_submit.attr('data-img', '')
                    return
                }
                setTimeout(function () {
                    window.XXG.redirect()
                }, 10)
            }, function () {
                $me.attr('data-is-clicking', '')
            })
        })

        next()
    }

    /*********** TRIGGER ***********/
    function eventTriggerRenderDone(fn_final) {
        var fnQueueRenderDone = [].concat(window.XXG.BusinessCommon.fnQueueRenderDone || [])
        // 遍历执行下一步的函数队列
        !function executeFnQueue(fnQueue, fn_final) {
            if (!fnQueue.length) {
                return typeof fn_final === 'function' && fn_final()
            }
            var fn = fnQueue.shift()
            // 如果事件队列中某一个函数不执行下一个的回调时退出执行队列
            fn(function () {
                executeFnQueue(fnQueue, fn_final)
            }, function (isStop) {
                !isStop && typeof fn_final === 'function' && fn_final()
            })
        }(fnQueueRenderDone, fn_final)
    }

    // 触发订单更新-更新完成后直接刷新页面
    function eventTriggerFormUpdateOrderInfo() {
        var $Form = window.XXG.BusinessCommon.$FormUpdateOrderInfo || null
        if (!($Form && $Form.length)) {
            return
        }
        $Form.trigger('submit', [
            null,
            function (res, $form, $trigger) {
                window.XXG.redirect()
            }
        ])
    }

    // 触发订单更新-更新完成进入通用流程下一步
    function eventTriggerFormUpdateOrderInfoGoNext() {
        var $Form = window.XXG.BusinessCommon.$FormUpdateOrderInfo || null
        if (!($Form && $Form.length)) {
            return
        }
        $Form.trigger('submit', [
            function ($form) {
                if (window.__IS_SHOW_DAODIAN_SERVER_TIME &&
                    (!window.__DAODIAN_SERVER_TIME || window.__DAODIAN_SERVER_TIME === '0000-00-00 00:00:00')) {
                    $.dialog.toast('请选择上门时间')
                    return false
                }

                return true
            },
            function (res, $form, $trigger) {
                var order_id = $form.find('[name="order_id"]').val()
                var price = $form.find('[name="price"]').val()

                var checked_need = false
                var checked_done = true
                if (window.__IS_NEEDED_MANAGER_CHECK) {
                    checked_need = true
                    if (!window.__IS_MANAGER_CHECK_SUCCESS) {
                        // 店长审核--暂未通过
                        checked_done = false
                    }
                }
                if (window.__REMOTE_CHECK_FLAG) {
                    checked_need = true
                    if (window.__REMOTE_CHECK_FLAG_PROCESS != 3) {
                        // 远程验机--暂未通过
                        checked_done = false
                    }
                }
                if (checked_need && checked_done) {
                    // 店长审核||远程验机，完成
                    return window.isNeedCheckUnlocked(function (is_need_unlock) {
                        if (is_need_unlock) {
                            // 检查解锁状态
                            window.checkUnlocked(function () {
                                // 已解锁
                                window.showPageCustomerSignature && window.showPageCustomerSignature()
                            })
                        } else {
                            window.showPageCustomerSignature && window.showPageCustomerSignature()
                        }
                    })
                }
                if (window.__IS_HUANBAOJI || !window.__IS_NEEDED_PIC) {
                    // 环保机 || 不需要imei和传图
                    return window.showPageCustomerSignature && window.showPageCustomerSignature()
                }

                window.isNeedCheckUnlocked(function (is_need_unlock) {
                    if (is_need_unlock) {
                        window.addCheckUnlockQueue()
                    }
                })
                if (window.__SAMSUMG_SUBSIDY_5G) {
                    window.__SAMSUMG_SUBSIDY_5G = false
                    window.location.href = tcb.setUrl2('/m/activity?orderId=' + order_id + '&subsidyType=' + window.__SAMSUNG__ACTIVITY_INFO['5G']['subsidyType'])
                } else {
                    // 显示上传图片界面
                    window.XXG.ServiceUploadPicture.show()
                    // window.showPageUploadPicture && window.showPageUploadPicture({
                    //     order_id: order_id,
                    //     price: price
                    // })
                }
            }
        ])
    }

}()
