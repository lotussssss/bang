!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }
    window.__FINAL_PRICE_STRUCTURE_LIST = window.__FINAL_PRICE_STRUCTURE_LIST || {}

    window.renderOrderDealInfo = renderOrderDealInfo
    window.hideOrderDealInfo = hideOrderDealInfo
    window.isRemoteCheckWorkTime = isRemoteCheckWorkTime
    window.getRemoteCheckOptions = getRemoteCheckOptions
    window.getFinalPriceStructure = getFinalPriceStructure
    window.getAppleCesOrderInfo = getAppleCesOrderInfo
    window.showAppleCesOrderInfo = showAppleCesOrderInfo

    function renderOrderDealInfo() {
        var orderInfo = window.__ORDER_INFO || {}
        var idCardInfo = window.__IDCARD_INFO__ || {}
        var finalPriceStructure = window.__FINAL_PRICE_STRUCTURE_LIST[orderInfo.order_id] || {}

        var html_fn = $.tmpl($.trim($('#JsXxgOrderDealInfoTpl').html())),
            html_st = html_fn({
                _order_info: orderInfo,
                _remote_check: {
                    remote_check_flag: window.__REMOTE_CHECK_FLAG,
                    remote_check_flag_process: window.__REMOTE_CHECK_FLAG_PROCESS,
                    remote_check_options: window.__REMOTE_CHECK_OPTIONS,
                    remote_check_price: window.__REMOTE_CHECK_PRICE,
                    remote_check_remarks: window.__REMOTE_CHECK_REMARKS,
                    remote_check_timeout: window.__REMOTE_CHECK_TIMEOUT
                },
                _realname_info: {
                    real_name: (idCardInfo &&
                        idCardInfo.realname_info &&
                        idCardInfo.realname_info.real_name) || '',
                    id_number: (idCardInfo &&
                        idCardInfo.realname_info &&
                        idCardInfo.realname_info.id_number) || ''
                },
                _user_allowance: window.__USER_ALLOWANCE || {},
                _engineer_allowance: window.__ENGINEER_ALLOWANCE || {},
                _final_price_structure: finalPriceStructure
            }),
            $OrderDealInfo = $('.block-order-deal-info')

        $OrderDealInfo.html(html_st)
        $OrderDealInfo.show()

        renderDoneOrderDealInfo($OrderDealInfo)

        return $OrderDealInfo
    }

    // OrderDealInfo内的html渲染完毕，
    // 这里可以执行一些事件绑定
    function renderDoneOrderDealInfo($OrderDealInfo) {
        var $Form = $OrderDealInfo.find('#FormUpdateOrderInfoByGoNext')
        var $Btn = $('.btn-go-next')
        window.bindEventFormUpdateOrderInfo($Form, $Btn)
        window.imeiOcrInit($OrderDealInfo.find('.block-order-deal-info-main'))

        // 点击选择带单人员
        initTriggerDaidanStaff()
        // 选择上门时间
        initTriggerServerTime($OrderDealInfo.find('.js-trigger-edit-server-time'))

        $Form.find('[name="price"]').trigger('change')
    }

    function hideOrderDealInfo() {
        var $OrderDealInfo = $('.block-order-deal-info')
        $OrderDealInfo.hide()
    }

    // 判断是都在远程验机工作时间内
    function isRemoteCheckWorkTime() {
        var remote_check_work_time = window.__REMOTE_CHECK_WORK_TIME || {}
        var nowObj = new Date()
        var nowTimestamp = nowObj.getTime()
        var year = nowObj.getFullYear()
        var month = nowObj.getMonth() + 1
        var day = nowObj.getDate()
        var start = [year, month, day].join('/') + ' ' + remote_check_work_time.beginAt
        var end = [year, month, day].join('/') + ' ' + remote_check_work_time.endsAt

        return nowTimestamp >= (new Date(start)).getTime() &&
            nowTimestamp <= (new Date(end)).getTime()
    }

    function getRemoteCheckOptions(callback, remote_check_id) {
        if (tcb.cache('__getremoteCheckOptionsTimeout')) {
            return callback()
        }
        var params
        if (remote_check_id) {
            params = {
                remote_check_id: remote_check_id
            }
        }
        var url = tcb.setUrl2('/m/getRemoteCheckProcess', params || {
            order_id: tcb.queryUrl(window.location.search, 'order_id')
        })
        window.XXG.ajax({
            url: url,
            success: function (res) {
                if (!res) {
                    return setTimeout(function () {
                        getRemoteCheckOptions(callback)
                    }, 300)
                }
                typeof callback == 'function' && callback(res.result)
            },
            error: function () {
                setTimeout(function () {
                    getRemoteCheckOptions(callback)
                }, 300)
            }
        })
    }

    function getFinalPriceStructure(price, complete) {
        var orderInfo = window.__ORDER_INFO || {}
        var order_id = orderInfo.order_id
        window.XXG.ajax({
            url: '/m/doGenFinalPriceStructure',
            data: {
                orderId: order_id,
                price: price
            },
            success: function (res) {
                var add_price = -1
                var sum_price
                if (res && !res.errno) {
                    var result = res.result
                    add_price = result.add_price
                    sum_price = result.sum_price
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统错误，请稍后重试')
                }
                typeof complete === 'function' && complete(add_price, sum_price)
            },
            error: function (err) {
                $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                typeof complete === 'function' && complete(-1)
            }
        })
    }

    function showAppleCesOrderInfo(order_id) {
        getAppleCesOrderInfo(order_id, function (appleCesOrderInfo) {
            var bonus = parseInt(appleCesOrderInfo.subsidy_price, 10) || 0
            var realPrice = parseInt(appleCesOrderInfo.new_product_price * 100 - appleCesOrderInfo.hs_model_price * 100 - bonus * 100, 10) / 100
            var instalmentName = appleCesOrderInfo.loan_name || 'JD白条分期付款'
            var instalmentRate = appleCesOrderInfo.loan_rate || 0
            var instalmentPeriod = parseInt(appleCesOrderInfo.loan_rate_number, 10) || 0
            var instalmentPaymentPerPeriod = (instalmentPeriod
                ? parseInt(realPrice / instalmentPeriod * 100 + realPrice * instalmentRate * 100, 10) / 100
                : realPrice).toFixed(2)
            var $BlockOrderBaseInfoAppleCesOrderInfo = $('#BlockOrderBaseInfoAppleCesOrderInfo')
            if ($BlockOrderBaseInfoAppleCesOrderInfo && $BlockOrderBaseInfoAppleCesOrderInfo.length) {
                $BlockOrderBaseInfoAppleCesOrderInfo.remove()
                $BlockOrderBaseInfoAppleCesOrderInfo = null
            }
            var html_st = '<div id="BlockOrderBaseInfoAppleCesOrderInfo">'
            html_st += '<div class="row row-order-id-barcode" style="text-align: center"><svg id="XxgOrderDetailOrderIdBarcode"></svg></div>'
            html_st += '<div class="row"><div class="col-12-4">新机编码</div><div class="col-12-8">' + appleCesOrderInfo.new_product_id + '</div></div>'
            html_st += '<div class="row"><div class="col-12-4">新机型号</div><div class="col-12-8">' + appleCesOrderInfo.new_product_name + '</div></div>'
            html_st += '<div class="row"><div class="col-12-4">新机价格</div><div class="col-12-8">¥ ' + appleCesOrderInfo.new_product_price + '</div></div>'
            if (appleCesOrderInfo.coupon_code) {
                html_st += '<div class="row"><div class="col-12-4">促销码</div><div class="col-12-8">' + appleCesOrderInfo.coupon_code + '</div></div>'
            }
            if (!window.__REMOTE_CHECK_FLAG || window.__REMOTE_CHECK_FLAG_PROCESS == 3) {
                html_st += '<div class="row"><div class="col-12-4">抵扣金额</div><div class="col-12-8">- ¥ ' + appleCesOrderInfo.hs_model_price + '</div></div>'
                if (bonus) {
                    html_st += '<div class="row"><div class="col-12-4">换新补贴</div><div class="col-12-8">￥ ' + bonus + '</div></div>'
                }
                html_st += '<div class="row"><div class="col-12-4">换购价格</div><div class="col-12-8 c5">' + (realPrice > 0 ? '¥ ' + realPrice : '- ¥ ' + Math.abs(realPrice)) + '</div></div>'
                if (instalmentPeriod && realPrice > 0) {
                    html_st += '<div class="row"><div class="col-12-4">' + instalmentName + '</div><div class="col-12-8">￥ ' + instalmentPaymentPerPeriod + ' x ' + instalmentPeriod + '期</div></div>'
                }
            }
            html_st += '</div>'
            $('.block-order-base-info .row-order-status').after(html_st)
            JsBarcode('#XxgOrderDetailOrderIdBarcode', order_id, {
                height: 80
            })
        })
    }

    function getAppleCesOrderInfo(order_id, success) {
        if (!window.__APPLE_CES_ORDER_FLAG) {
            return
        }
        var appleCesOrderInfo = null
        // var appleCesOrderInfo = tcb.cache('XXG_CACHE_APPLE_CES_ORDER_INFO')
        // if (appleCesOrderInfo) {
        //     typeof success == 'function' && success(appleCesOrderInfo)
        // } else {
        window.XXG.ajax({
            url: '/xxgHs/doGetAppleCesOrderInfo',
            method: 'GET',
            data: {
                order_id: order_id
            },
            success: function (res) {
                if (!res || res.errno) {
                    return $.dialog.alert(res.errmsg)
                }
                appleCesOrderInfo = res.result || {}
                tcb.cache('XXG_CACHE_APPLE_CES_ORDER_INFO', appleCesOrderInfo)
                typeof success == 'function' && success(appleCesOrderInfo)
            },
            error: function (err) {
                return $.dialog.alert(err.statusText)
            }
        })
        // }
    }

    // 点击选择带单人员
    function initTriggerDaidanStaff() {
        // var pickerData = window.__DAIDANSTAFFLIST,
        var pickerData = [],
            $trigger = $('.js-trigger-daidan-staff')
        if (!$trigger.attr('data-flag')) {
            return
        }
        var qid = $trigger.find('.daidan-staff-name').attr('data-qid')
        var pos = 0

        tcb.each(window.__DAIDANSTAFFLIST || [], function (i, item) {
            pickerData.push({
                id: item['qid'],
                name: item['name']
            })
            if (qid == item['qid']) {
                pos = i
            }
        })

        Bang.Picker({
            // 实例化的时候自动执行init函数
            flagAutoInit: true,
            // 触发器
            selectorTrigger: $trigger,

            col: 1,
            data: [pickerData],
            dataTitle: ['请选择带单人员'],
            dataPos: [pos],

            // 回调函数(确认/取消)
            callbackConfirm: function (inst) {
                var data = inst.options.data || [],
                    dataPos = inst.options.dataPos || [],
                    selectedData = data[0][dataPos[0]],

                    $trigger = inst.getTrigger(),
                    order_id = $trigger.attr('data-order-id'),
                    qid = selectedData.id

                $trigger.find('.daidan-staff-name').attr('data-qid', qid)

                $.get('/m/setWithASingleRecord', {
                    orderId: order_id,
                    qid: qid
                }, function (res) {
                    if (!res.errno) {
                        inst.getTrigger().find('.daidan-staff-name').html(selectedData.name)
                    } else {
                        $.dialog.toast(res.errmsg)
                    }
                })

                tcb.js2AndroidSetDialogState(false)
            },
            callbackCancel: null
        })
    }

    // 选择上门时间
    function initTriggerServerTime($trigger) {
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

                if (window.__IS_SHOW_DAODIAN_SERVER_TIME) {
                    // 到店时间选择
                    var tips = '<div style="text-align: center">注意：您填写的时间将短信通知用户！</div>'
                    $.dialog.confirm(tips, function () {
                        updateServerTime(serverTime, function () {
                            $trigger.closest('.row').find('.col-server-time').html(serverTime)
                            $.dialog.toast('填写成功，已短信通知用户预约时间', 3000)
                        })
                    })
                } else {
                    // 普通上门时间选择
                    updateServerTime(serverTime, function () {
                        setTimeout(function () {
                            window.XXG.redirect()
                        }, 10)
                    })
                }
            },
            callbackCancel: null
        })
    }

    function updateServerTime(serverTime, callback) {
        var params = {
            order_id: window.__ORDER_ID,
            datetime: serverTime
        }
        tcb.loadingStart()
        window.XXG.ajax({
            url: tcb.setUrl2('/m/changeOrderToHomeDate', params),
            success: function (res) {
                tcb.loadingDone()
                if (!res.errno) {
                    window.__DAODIAN_SERVER_TIME = serverTime
                    window.__DAODIAN_REACH_TIME = serverTime
                    typeof callback === 'function' && callback()
                } else {
                    $.dialog.toast(res.errmsg)
                }
            },
            error: function (res) {
                tcb.loadingDone()
                $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
            }
        })
    }

    $(function () {
        var order_id = tcb.queryUrl(window.location.search, 'order_id')

        tcb.loadingStart()

        if (window.__REMOTE_CHECK_FLAG_PROCESS) {
            // 进入详情页只是，若还没有开启远程验机流程，那么不开启远程验机监听状态，
            // 否则开启远程验机监听状态
            window.remoteCheckListenStart(order_id)
        } else {
            renderOrderDealInfo()
        }

        showAppleCesOrderInfo(order_id)

        setTimeout(function () {
            tcb.loadingDone()
        }, 500)
    })

}()
