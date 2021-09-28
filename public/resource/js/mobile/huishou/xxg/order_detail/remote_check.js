// 远程验机
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }

    var NOW_PADDING = window.__NOW - Date.now()
    var startCountdown = Bang.startCountdown
    var openBiggerShow = Bang.openBiggerShow
    var wsInst
    var __checkWaitingCountdownStopHandle
    var __checkingCountdownStopHandle
    var __flag_stop = true

    function remoteCheckListenStart(order_id, is_force_auth) {
        remoteCheckListenClose()

        if (!window.__REMOTE_CHECK_FLAG) {
            // 不支持远程验机，直接返回不做任何处理
            return
        }
        if (!window.__REMOTE_CHECK_AUTH) {
            return $.dialog.alert('无法获取远程验机的权证，无法开启远程验机，请重试')
        }

        try {
            if (!is_force_auth && window.__REMOTE_CHECK_ID) {
                __startLoopCheck(window.__REMOTE_CHECK_ID)
            } else {
                __remoteCheckAuth(function () {
                    __remoteOrderPush(order_id, function () {
                        __startLoopCheck(window.__REMOTE_CHECK_ID)
                    })
                })
            }
        } catch (e) {
            return $.dialog.alert(e.message || '远程验机通道建立失败，请重试')
        }
    }

    function remoteCheckListenClose() {
        __stopLoopCheck()
    }

    function setRemoteCheckStatus() {
        if (typeof __checkWaitingCountdownStopHandle == 'function') {
            __checkWaitingCountdownStopHandle()
            __checkWaitingCountdownStopHandle = null
        }
        if (typeof __checkingCountdownStopHandle == 'function') {
            __checkingCountdownStopHandle()
            __checkingCountdownStopHandle = null
        }
        // 值为空 或者 0，表示还没有开启验机流程
        if (!window.__REMOTE_CHECK_FLAG_PROCESS) {
            remoteCheckListenClose()
            hideBlockRemoteCheck()
            return
        }

        if (window.__REMOTE_CHECK_FLAG_PROCESS == -1) {
            // 驳回
            remoteCheckReject()
            return window.hideOrderDealInfo()
        } else if (window.__REMOTE_CHECK_FLAG_PROCESS == 1) {
            // 判断时间
            if (window.__REMOTE_CHECK_TIMEOUT > window.__NOW) {
                // 等待审核中
                remoteCheckWaiting()
            } else {
                // 等待超时
                remoteCheckWaitingOutTime()
            }
            // 黑名单用户,超过特定时间只能明天下单
            if (window.__REMOTE_CHECK_TOMORROW) {
                remoteCheckTomorrow()
            }
        } else if (window.__REMOTE_CHECK_FLAG_PROCESS == 2) {
            // 审核中
            remoteChecking()
        } else if (window.__REMOTE_CHECK_FLAG_PROCESS == 3) {
            // 审核成功
            remoteCheckSuccess()
        }

        if (window.__REMOTE_CHECK_FLAG_PROCESS == 3) {
            // 审核成功
            var orderInfo = window.__ORDER_INFO || {}
            var finalPriceStructure = window.__FINAL_PRICE_STRUCTURE_LIST[orderInfo.order_id] || {}
            var add_price_flag = finalPriceStructure.add_price_flag
            var price_setup = parseInt(orderInfo.final_price, 10) // 已经设置过的价格
            var price = price_setup || window.__REMOTE_CHECK_PRICE

            if (add_price_flag) {
                if (orderInfo.status < 13
                    && !price_setup) {
                    // 条件说明：
                    // 1、远程验机完成
                    // 2、有加价标识
                    // 3、订单还未完成
                    // 4、还未设置final_price（当final_price大于0的时候，表示xxg编辑、保存过成交，那么不再使用远程验机价）
                    getFinalPriceStructure(price, function (add_price, sum_price) {
                        if (add_price > -1) {
                            finalPriceStructure.pinggu_price = price
                            finalPriceStructure.add_price = add_price
                            finalPriceStructure.sum_price = sum_price
                            window.__FINAL_PRICE_STRUCTURE_LIST[orderInfo.order_id] = finalPriceStructure
                        }
                        window.renderOrderDealInfo()
                    })
                } else {
                    window.renderOrderDealInfo()
                }
            } else {
                finalPriceStructure.pinggu_price = price
                finalPriceStructure.add_price = 0
                finalPriceStructure.sum_price = price
                window.__FINAL_PRICE_STRUCTURE_LIST[orderInfo.order_id] = finalPriceStructure

                window.renderOrderDealInfo()
            }
        } else {
            window.renderOrderDealInfo()
        }
    }

    // 远程验机等待ing
    function remoteCheckWaiting() {
        var $BlockOrderRemoteCheck = renderRemoteCheckOptions({
            check_tip: '预计<span class="remote-check-countdown"></span>分钟内处理',
            check_tip_desc: '已提交审核，请您稍候'
        })
        setUIButtonStatus(1)
        showBlockRemoteCheck()

        var $countdown = $BlockOrderRemoteCheck.find('.remote-check-countdown')
        var timeout = window.__REMOTE_CHECK_TIMEOUT
        __checkWaitingCountdownStopHandle = startCountdown(timeout, nowTime(), $countdown, {
            end: function () {
                remoteCheckWaitingOutTime()
            }
        })
    }

    // 远程验机等待超时
    function remoteCheckWaitingOutTime() {
        renderRemoteCheckOptions({
            check_tip: '正在加急处理，请耐心等待!',
            check_tip_desc: '已提交审核，请您稍候'
        })
        setUIButtonStatus(1)
        showBlockRemoteCheck()
        // 判断时间
        if (window.__REMOTE_CHECK_TIMEOUT > nowTime()) {
            setRemoteCheckStatus()
        }
    }

    // 远程验机ing
    function remoteChecking() {
        var $BlockOrderRemoteCheck = renderRemoteCheckOptions({
            check_tip: '预计<span class="remote-check-countdown"></span>分钟内完成',
            check_tip_desc: '审核人员正在处理，请您稍候'
        })
        setUIButtonStatus(1)
        showBlockRemoteCheck()

        var $countdown = $BlockOrderRemoteCheck.find('.remote-check-countdown')
        var timeout = window.__REMOTE_CHECK_TIMEOUT
        __checkingCountdownStopHandle = startCountdown(timeout, nowTime(), $countdown, {
            end: function () {
                // remoteCheckingOutTime()
            }
        })
    }

    // 远程验机超时
    function remoteCheckingOutTime() {
        remoteCheckListenClose()
        setUIButtonStatus(2)
        showBlockRemoteCheck()
        window.__REMOTE_CHECK_FLAG_PROCESS = 3
        nowTime()
        setRemoteCheckStatus()
    }

    // 远程验机被驳回
    function remoteCheckReject() {
        remoteCheckListenClose()
        setUIButtonStatus(3)

        var orderInfo = window.__ORDER_INFO || {}
        window.apiGetUploadPictureShootRule({
            categoryId: orderInfo.category_id
        }, function (res) {
            var uploadList = res.result || []
            var _uploadKeySet = []
            var _uploadKeyMap = {}
            tcb.each(uploadList, function (i, item) {
                _uploadKeySet.push(item.name)
                _uploadKeyMap[i+1] = item.name
            })
            var uploadKeySet = _uploadKeySet
            var uploadKeyMap = _uploadKeyMap

            var $Block = renderRemoteCheckReject({
                remote_check_remarks: window.__REMOTE_CHECK_REMARKS,
                remote_check_tagging_imgs: window.__REMOTE_CHECK_TAGGING_IMGS || {},
                uploadList: uploadList
            })
            showBlockRemoteCheck()
            window.remoteCheckUploadRejectPictureInit($Block, window.__REMOTE_CHECK_TAGGING_IMGS || {}, uploadKeySet, uploadKeyMap)
        })
    }

    // 远程验机成功
    function remoteCheckSuccess() {
        remoteCheckListenClose()

        var orderInfo = window.__ORDER_INFO || {}
        var remote_check_options = window.__REMOTE_CHECK_OPTIONS || []
        var remote_check_tagging_imgs = window.__REMOTE_CHECK_TAGGING_IMGS || {}
        var remote_check_remarks = window.__REMOTE_CHECK_REMARKS || ''
        var isSuccessPerfect = true
        tcb.each(remote_check_options, function (i, item) {
            if (!item.succ) {
                isSuccessPerfect = false
            }
        })
        tcb.each(remote_check_tagging_imgs, function (i, item) {
            if (item) {
                isSuccessPerfect = false
            }
        })

        setUIButtonStatus(2)
        if (isSuccessPerfect) {
            // 完美通过审核
            renderRemoteCheckSuccessPerfect({
                remote_check_options: remote_check_options,
                remote_check_remarks: remote_check_remarks
            })
        } else {
            // 审核通过，但是有差异项
            renderRemoteCheckSuccessDiff({
                remote_check_options: remote_check_options,
                remote_check_remarks: remote_check_remarks,
                remote_check_tagging_imgs: remote_check_tagging_imgs
            })
        }
        showBlockRemoteCheck()
        window.showAppleCesOrderInfo && window.showAppleCesOrderInfo(orderInfo.order_id)
        // window.renderOrderDealInfo()
    }

    // 黑名单用户超过特定时间段,只可明天下单,修改页面文案
    function remoteCheckTomorrow() {
        remoteCheckListenClose()
        renderRemoteCheckOptions({
            check_tip: '超出订单提交时间,请在工作时间提交',
            check_tip_desc: '请在规定时间内提交订单,其余时间不接单'
        })
        setUIButtonStatus(1)
        showBlockRemoteCheck()
    }

    // 远程验机校权
    function __remoteCheckAuth(callback) {
        if (!window.__REMOTE_CHECK_API) {
            return $.dialog.alert('无法获取接口服务器信息，请服务器管理员')
        }
        var request_url = window.__REMOTE_CHECK_API + '/RemoteCheck/Common/auth'
        window.XXG.ajax({
            url: request_url,
            method: 'POST',
            data: {
                'auth_token': window.__REMOTE_CHECK_AUTH,
                'auth': 1
            },
            xhrFields: {withCredentials: true},
            success: function (res) {
                if (!res || res.errno) {
                    return $.dialog.alert(res.errmsg || '系统错误，暂时无法提供远程验机服务')
                }
                typeof callback == 'function' && callback(res)
            },
            error: function (err) {
                return $.dialog.alert(err.statusText || '系统错误，暂时无法提供远程验机服务')
            }
        })
    }

    // 将远程验机加入队列，并且获取远程验机id，赋值给window.__REMOTE_CHECK_ID
    function __remoteOrderPush(order_id, callback) {
        if (!window.__REMOTE_CHECK_API) {
            return $.dialog.alert('无法获取接口服务器信息，请服务器管理员')
        }

        var request_url = window.__REMOTE_CHECK_API + '/RemoteCheck/Engineer/orderPush'
        window.XXG.ajax({
            url: request_url,
            method: 'POST',
            data: {
                'order_id': order_id
            },
            xhrFields: {withCredentials: true},
            success: function (res) {
                if (!res || res.errno) {
                    return $.dialog.alert(res.errmsg || '系统错误，暂时无法提供远程验机服务')
                }
                if (res && res.data && res.data.check_id) {
                    window.__REMOTE_CHECK_ID = res.data.check_id
                }
                typeof callback == 'function' && callback(res)
            },
            error: function (err) {
                return $.dialog.alert(err.statusText || '系统错误，暂时无法提供远程验机服务')
            }
        })
    }

    // 循环检测远程验机状态和数据
    function __startLoopCheck(remote_check_id) {
        __flag_stop = false

        var delay = 2000

        function loop() {
            if (__flag_stop) return

            wsInst = setTimeout(loop, delay)
            checking(function (remoteCheck) {
                if (window.__REMOTE_CHECK_FLAG_PROCESS != remoteCheck.remote_check_flag_process) {
                    setRemoteCheck(remoteCheck)
                    setRemoteCheckStatus()
                    // if (!wsInst) {
                    //     __flag_stop = false
                    //     wsInst = setTimeout(loop, delay)
                    // }
                }
            }, remote_check_id)
        }

        function checking(callback, remote_check_id) {
            window.getRemoteCheckOptions(function (remoteCheck) {
                if (!remoteCheck) return
                typeof callback == 'function' && callback(remoteCheck)
            }, remote_check_id)
        }

        function setRemoteCheck(remoteCheck) {
            window.__REMOTE_CHECK_OPTIONS = remoteCheck.remote_check_options
            window.__REMOTE_CHECK_FLAG_PROCESS = remoteCheck.remote_check_flag_process
            window.__REMOTE_CHECK_TIMEOUT = remoteCheck.remote_check_timeout * 1000
            window.__REMOTE_CHECK_REMARKS = remoteCheck.remote_check_remarks
            window.__REMOTE_CHECK_PRICE = remoteCheck.remote_check_price
            window.__REMOTE_CHECK_TAGGING_IMGS = remoteCheck.remote_check_tagging_imgs
        }

        checking(function (remoteCheck) {
            setRemoteCheck(remoteCheck)
            setRemoteCheckStatus()
            loop()
        }, remote_check_id)
        // setRemoteCheckStatus()
    }

    // 停止循环检测
    function __stopLoopCheck() {
        __flag_stop = true
        if (wsInst) {
            clearTimeout(wsInst)
            wsInst = null
        }
    }

    function setUIButtonStatus(type) {
        var $btnNext = $('.js-btn-go-next')

        switch (type) {
            case 1:
                // 审核中
                $btnNext
                    .addClass('btn-go-next-lock')
                    .html('审核中...')
                break
            case 2:
                // 远程验机成功/超时
                $btnNext
                    .removeClass('btn-go-next-lock')
                    .html('完成订单')
                break
            case 3:
                // 驳回
                $btnNext
                    .removeClass('btn-go-next-lock')
                    .html('重新提交')
                break
            case 4:
                // 将按钮文案恢复到默认状态
                $btnNext
                    .removeClass('btn-go-next-lock')
                    .html($btnNext.attr('data-default-text'))
                break
            default:
                // 记录按钮的默认文案
                $btnNext.attr('data-default-text', $btnNext.html())
        }
        return $btnNext
    }

    function renderRemoteCheckOptions(data) {
        var html_fn = $.tmpl(tcb.trim($('#JsXxgRemoteCheckOptionsTpl').html())),
            html_st = html_fn(data),
            $BlockOrderRemoteCheck = $('#BlockOrderRemoteCheck')

        $BlockOrderRemoteCheck.html(html_st)

        return $BlockOrderRemoteCheck.children().eq(0)
    }

    function renderRemoteCheckSuccessPerfect(data) {
        var html_fn = $.tmpl(tcb.trim($('#JsXxgRemoteCheckSuccessPerfectTpl').html())),
            html_st = html_fn(data),
            $BlockOrderRemoteCheck = $('#BlockOrderRemoteCheck')

        $BlockOrderRemoteCheck.html(html_st)

        return $BlockOrderRemoteCheck.children().eq(0)
    }

    function renderRemoteCheckSuccessDiff(data) {
        var remote_check_tagging_imgs = []
        tcb.each(data.remote_check_tagging_imgs || {}, function (k, v) {
            remote_check_tagging_imgs.push(v)
        })
        data.remote_check_tagging_imgs = remote_check_tagging_imgs

        var html_fn = $.tmpl(tcb.trim($('#JsXxgRemoteCheckSuccessDiffTpl').html())),
            html_st = html_fn(data),
            $BlockOrderRemoteCheck = $('#BlockOrderRemoteCheck')

        $BlockOrderRemoteCheck.html(html_st)

        setTimeout(function () {
            var $imgs = $BlockOrderRemoteCheck.find('.js-trigger-show-big-img')
            var $cols = $BlockOrderRemoteCheck.find('.row-picture .col-2-1')
            var $pics = $BlockOrderRemoteCheck.find('.row-picture .col-2-1 .pic')
            if ($imgs.length) {
                var s = $cols.eq(0).width() - 1
                openBiggerShow($imgs)
                $cols.css({
                    'width': s,
                    'height': s
                })
                $pics.css({
                    'line-height': (s * .96) + 'px'
                })
                tcb.setImgElSize($imgs, s * .96 * .9, s * .96 * .9)
            }
        }, 300)

        return $BlockOrderRemoteCheck.children().eq(0)
    }

    function renderRemoteCheckReject(data) {
        var html_fn = $.tmpl(tcb.trim($('#JsXxgRemoteCheckRejectTpl').html())),
            html_st = html_fn(data),
            $BlockOrderRemoteCheck = $('#BlockOrderRemoteCheck')

        $BlockOrderRemoteCheck.html(html_st)

        return $BlockOrderRemoteCheck.children().eq(0)
    }

    function showBlockRemoteCheck() {
        $('#BlockOrderRemoteCheck').show()
    }

    function hideBlockRemoteCheck() {
        $('#BlockOrderRemoteCheck').hide()
    }

    function nowTime() {
        return window.__NOW = Date.now() + NOW_PADDING
    }

    function bindEvent() {
        // 绑定事件
        tcb.bindEvent({
            // 刷新验机状态
            '.js-trigger-refresh-check-status': function (e) {
                e.preventDefault()

                var $me = $(this),
                    refreshCount = $me.attr('data-refresh-count')

                if ($me.attr('data-refreshing')) {
                    return
                }
                if (refreshCount > 2) {
                    return $.dialog.toast('请不要频繁刷新', 2000)
                }
                refreshCount = (parseInt(refreshCount) || 0) + 1

                $me.attr('data-refresh-count', refreshCount)
                $me.attr('data-refreshing', 1)

                tcb.loadingStart()
                $me.css({opacity: .5})

                setTimeout(function () {
                    $me.css({opacity: 1})
                    $me.attr('data-refreshing', '')
                    tcb.loadingDone()
                }, 2000)
            }
        })
    }

    function init() {
        bindEvent()
        setUIButtonStatus()
    }

    init()
    window.remoteCheckListenStart = remoteCheckListenStart
}()
