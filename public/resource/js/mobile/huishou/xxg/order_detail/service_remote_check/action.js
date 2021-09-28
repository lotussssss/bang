// 远程验机
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.ServiceRemoteCheck = tcb.mix(window.XXG.ServiceRemoteCheck || {}, {
        actionStartListen: actionStartListen,
        actionCloseListen: actionCloseListen,
        actionSetRemoteCheckStatus: actionSetRemoteCheckStatus,
        actionRemoteCheckReject: actionRemoteCheckReject,
        actionRemoteCheckWaiting: actionRemoteCheckWaiting,
        actionRemoteCheckWaitingOutTime: actionRemoteCheckWaitingOutTime,
        actionRemoteCheckTomorrow: actionRemoteCheckTomorrow,
        actionRemoteChecking: actionRemoteChecking,
        actionRemoteCheckingOutTime: actionRemoteCheckingOutTime,
        actionRemoteCheckSuccess: actionRemoteCheckSuccess,
        actionShowBlockRemoteCheck: actionShowBlockRemoteCheck,
        actionHideBlockRemoteCheck: actionHideBlockRemoteCheck,
        actionGetRemoteCheckOptions: actionGetRemoteCheckOptions,
        actionSetupUploadRejectPicture: actionSetupUploadRejectPicture,
        actionRemoteCheckRejectReSubmit: actionRemoteCheckRejectReSubmit,
        actionIsRemoteCheckWorkTime: actionIsRemoteCheckWorkTime
    })

    var startCountdown = Bang.startCountdown
    var wsInst
    var __checkWaitingCountdownStopHandle
    var __checkingCountdownStopHandle
    var __flag_stop = true

    function actionStartListen(order_id, is_force_auth) {
        window.XXG.ServiceRemoteCheck.actionCloseListen()

        var data = window.XXG.ServiceRemoteCheck.getData()

        if (!data.remote_check_flag) {
            // 不支持远程验机，直接返回不做任何处理
            return
        }
        if (!data.remote_check_auth) {
            return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                '无法获取远程验机的权证，无法开启远程验机，请重试',
                {withoutClose: true}
            )
        }

        try {
            if (!is_force_auth && data.remote_check_id) {
                __startLoopCheck(data.remote_check_id)
            } else {
                __remoteCheckAuth(function () {
                    __remoteOrderPush(order_id, function () {
                        __startLoopCheck(data.remote_check_id)
                    })
                })
            }
        } catch (e) {
            return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                e.message || '远程验机通道建立失败，请重试',
                {withoutClose: true}
            )
        }
    }

    function actionCloseListen() {
        __stopLoopCheck()
    }

    // 远程验机校权
    function __remoteCheckAuth(callback) {
        var data = window.XXG.ServiceRemoteCheck.getData()
        if (!data.remote_check_api) {
            return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                '无法获取接口服务器信息，请服务器管理员',
                {withoutClose: true}
            )
        }
        window.XXG.ServiceRemoteCheck.apiRemoteCheckAuth(
            data.remote_check_api + '/RemoteCheck/Common/auth',
            {
                'auth_token': data.remote_check_auth,
                'auth': 1
            },
            function (res) {
                if (!res || res.errno) {
                    return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                        res.errmsg || '系统错误，暂时无法提供远程验机服务',
                        {withoutClose: true}
                    )
                }
                typeof callback == 'function' && callback(res)
            },
            function (err) {
                return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                    err.statusText || '系统错误，暂时无法提供远程验机服务',
                    {withoutClose: true}
                )
            }
        )
    }

    // 将远程验机加入队列，并且获取远程验机id，赋值给data.remote_check_id
    function __remoteOrderPush(order_id, callback) {
        var data = window.XXG.ServiceRemoteCheck.getData()
        if (!data.remote_check_api) {
            return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                '无法获取接口服务器信息，请服务器管理员',
                {withoutClose: true}
            )
        }
        window.XXG.ServiceRemoteCheck.apiRemoteCheckOrderPush(
            data.remote_check_api + '/RemoteCheck/Engineer/orderPush',
            {
                'order_id': order_id
            },
            function (res) {
                if (!res || res.errno) {
                    return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                        res.errmsg || '系统错误，暂时无法提供远程验机服务',
                        {withoutClose: true}
                    )
                }
                if (res && res.data && res.data.check_id) {
                    window.XXG.ServiceRemoteCheck.setData({
                        remote_check_id: res.data.check_id
                    })
                }
                typeof callback == 'function' && callback(res)
            },
            function (err) {
                return window.XXG.BusinessCommon.helperShowAlertConfirm(null,
                    err.statusText || '系统错误，暂时无法提供远程验机服务',
                    {withoutClose: true}
                )
            }
        )
    }

    // 循环检测远程验机状态和数据
    function __startLoopCheck(remote_check_id) {
        __flag_stop = false

        var delay = 2000

        function loop(start) {
            if (__flag_stop) return

            wsInst = setTimeout(loop, delay)
            checking(function (remoteCheck) {
                var remote_check_flag_process = window.XXG.ServiceRemoteCheck.getData('remote_check_flag_process')
                var remote_check_flag_process_latest = remoteCheck.remote_check_flag_process
                if (start || (remote_check_flag_process != remote_check_flag_process_latest)) {
                    window.XXG.ServiceRemoteCheck.setData(remoteCheck)
                    window.XXG.ServiceRemoteCheck.actionSetRemoteCheckStatus(start)
                }
            }, remote_check_id)
        }

        function checking(callback, remote_check_id) {
            window.XXG.ServiceRemoteCheck.actionGetRemoteCheckOptions(function (remoteCheck) {
                if (!remoteCheck) return
                typeof callback == 'function' && callback(remoteCheck)
            }, remote_check_id)
        }

        loop(true)
    }

    // 停止循环检测
    function __stopLoopCheck() {
        __flag_stop = true
        if (wsInst) {
            clearTimeout(wsInst)
            wsInst = null
        }
    }

    // 设置远程验机状态
    function actionSetRemoteCheckStatus(start) {
        if (typeof __checkWaitingCountdownStopHandle == 'function') {
            __checkWaitingCountdownStopHandle()
            __checkWaitingCountdownStopHandle = null
        }
        if (typeof __checkingCountdownStopHandle == 'function') {
            __checkingCountdownStopHandle()
            __checkingCountdownStopHandle = null
        }

        var data = window.XXG.ServiceRemoteCheck.getData()
        window.XXG.ServiceRemoteCheck.callbackStatusChangeBefore(data, start, function () {
            switch (data.remote_check_flag_process) {
                case -1: // 驳回
                    window.XXG.ServiceRemoteCheck.actionRemoteCheckReject()
                    break
                case 1: // 正在排队
                    if (data.remote_check_tomorrow) {
                        // 黑名单用户,超过特定时间只能明天下单
                        window.XXG.ServiceRemoteCheck.actionRemoteCheckTomorrow()
                    } else if (data.remote_check_timeout > window.XXG.BusinessCommon.helperNowTime()) {
                        // 判断时间
                        // 等待审核中
                        window.XXG.ServiceRemoteCheck.actionRemoteCheckWaiting()
                    } else {
                        // 等待超时
                        window.XXG.ServiceRemoteCheck.actionRemoteCheckWaitingOutTime()
                    }
                    break
                case 2: // 审核中
                    window.XXG.ServiceRemoteCheck.actionRemoteChecking()
                    break
                case 3: // 审核成功
                    window.XXG.ServiceRemoteCheck.actionRemoteCheckSuccess()
                    break
                default:
                    // 值为空 或者 0，表示还没有开启验机流程
                    if (!data.remote_check_flag_process) {
                        window.XXG.ServiceRemoteCheck.actionCloseListen()
                        window.XXG.ServiceRemoteCheck.actionHideBlockRemoteCheck()
                    }
            }

            window.XXG.ServiceRemoteCheck.callbackStatusChangeDone(data, start)
        })
    }

    // 远程验机等待ing
    function actionRemoteCheckWaiting() {
        var $BlockOrderRemoteCheck = window.XXG.ServiceRemoteCheck.renderRemoteCheckOptions({
            check_tip: '预计<span class="remote-check-countdown"></span>分钟内处理',
            check_tip_desc: '已提交审核，请您稍候'
        })
        window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus(1)
        window.XXG.ServiceRemoteCheck.actionShowBlockRemoteCheck()

        var data = window.XXG.ServiceRemoteCheck.getData()
        var timeout = data.remote_check_timeout
        var $countdown = $BlockOrderRemoteCheck.find('.remote-check-countdown')
        __checkWaitingCountdownStopHandle = startCountdown(timeout, window.XXG.BusinessCommon.helperNowTime(), $countdown, {
            end: function () {
                window.XXG.ServiceRemoteCheck.actionRemoteCheckWaitingOutTime()
            }
        })
    }

    // 远程验机等待超时
    function actionRemoteCheckWaitingOutTime() {
        window.XXG.ServiceRemoteCheck.renderRemoteCheckOptions({
            check_tip: '正在加急处理，请耐心等待!',
            check_tip_desc: '已提交审核，请您稍候'
        })
        window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus(1)
        window.XXG.ServiceRemoteCheck.actionShowBlockRemoteCheck()
        // 判断时间
        var data = window.XXG.ServiceRemoteCheck.getData()
        if (data.remote_check_timeout > window.XXG.BusinessCommon.helperNowTime()) {
            window.XXG.ServiceRemoteCheck.actionSetRemoteCheckStatus()
        }
    }

    // 远程验机ing
    function actionRemoteChecking() {
        var $BlockOrderRemoteCheck = window.XXG.ServiceRemoteCheck.renderRemoteCheckOptions({
            check_tip: '预计<span class="remote-check-countdown"></span>分钟内完成',
            check_tip_desc: '审核人员正在处理，请您稍候'
        })
        window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus(1)
        window.XXG.ServiceRemoteCheck.actionShowBlockRemoteCheck()

        var data = window.XXG.ServiceRemoteCheck.getData()
        var timeout = data.remote_check_timeout
        var $countdown = $BlockOrderRemoteCheck.find('.remote-check-countdown')
        __checkingCountdownStopHandle = startCountdown(timeout, window.XXG.BusinessCommon.helperNowTime(), $countdown, {
            end: function () {
                // window.XXG.ServiceRemoteCheck.actionRemoteCheckingOutTime()
            }
        })
    }

    // 远程验机超时
    function actionRemoteCheckingOutTime() {
        window.XXG.ServiceRemoteCheck.actionCloseListen()
        window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus(2)
        window.XXG.ServiceRemoteCheck.actionShowBlockRemoteCheck()
        window.XXG.ServiceRemoteCheck.setData({
            remote_check_flag_process: 3
        })
        window.XXG.BusinessCommon.helperNowTime()
        window.XXG.ServiceRemoteCheck.actionSetRemoteCheckStatus()
    }

    // 远程验机被驳回
    function actionRemoteCheckReject() {
        window.XXG.ServiceRemoteCheck.actionCloseListen()
        var rootData = window.XXG.ServiceRemoteCheck.rootData || {}
        var order = rootData.order || {}
        window.XXG.ServiceUploadPicture.apiGetUploadPictureShootRule({
            categoryId: order.category_id
        }, function (res) {
            var uploadList = res.result || []
            var _uploadKeySet = []
            var _uploadKeyMap = {}
            tcb.each(uploadList, function (i, item) {
                _uploadKeySet.push(item.name)
                _uploadKeyMap[i + 1] = item.name
            })
            uploadKeySet = _uploadKeySet
            uploadKeyMap = _uploadKeyMap

            var $Block = window.XXG.ServiceRemoteCheck.renderRemoteCheckReject({
                remote_check_remarks: window.XXG.ServiceRemoteCheck.getData('remote_check_remarks'),
                remote_check_tagging_imgs: window.XXG.ServiceRemoteCheck.getData('remote_check_tagging_imgs') || {},
                uploadList: uploadList
            })
            window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus(3)
            window.XXG.ServiceRemoteCheck.actionShowBlockRemoteCheck()
            window.XXG.ServiceRemoteCheck.actionSetupUploadRejectPicture($Block, window.XXG.ServiceRemoteCheck.getData('remote_check_tagging_imgs') || {})
        })
    }

    // 远程验机成功
    function actionRemoteCheckSuccess() {
        window.XXG.ServiceRemoteCheck.actionCloseListen()

        var remote_check_options = window.XXG.ServiceRemoteCheck.getData('remote_check_options') || []
        var remote_check_tagging_imgs = window.XXG.ServiceRemoteCheck.getData('remote_check_tagging_imgs') || {}
        var remote_check_remarks = window.XXG.ServiceRemoteCheck.getData('remote_check_remarks') || ''
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

        window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus(2)
        if (isSuccessPerfect) {
            // 完美通过审核
            window.XXG.ServiceRemoteCheck.renderRemoteCheckSuccessPerfect({
                remote_check_options: remote_check_options,
                remote_check_remarks: remote_check_remarks
            })
        } else {
            // 审核通过，但是有差异项
            window.XXG.ServiceRemoteCheck.renderRemoteCheckSuccessDiff({
                remote_check_options: remote_check_options,
                remote_check_remarks: remote_check_remarks,
                remote_check_tagging_imgs: remote_check_tagging_imgs
            })
        }
        window.XXG.ServiceRemoteCheck.actionShowBlockRemoteCheck()
    }

    // 黑名单用户超过特定时间段,只可明天下单,修改页面文案
    function actionRemoteCheckTomorrow() {
        window.XXG.ServiceRemoteCheck.actionCloseListen()
        window.XXG.ServiceRemoteCheck.renderRemoteCheckOptions({
            check_tip: '超出订单提交时间,请在工作时间提交',
            check_tip_desc: '请在规定时间内提交订单,其余时间不接单'
        })
        window.XXG.ServiceRemoteCheck.renderSetUIButtonStatus(1)
        window.XXG.ServiceRemoteCheck.actionShowBlockRemoteCheck()
    }


    function actionShowBlockRemoteCheck() {
        window.XXG.ServiceRemoteCheck.$Wrap.show()
    }

    function actionHideBlockRemoteCheck() {
        window.XXG.ServiceRemoteCheck.$Wrap.hide()
    }

    // 获取远程验机状态
    function actionGetRemoteCheckOptions(callback, remote_check_id) {
        if (tcb.cache('__getRemoteCheckOptionsTimeout')) {
            return callback()
        }
        var params = {
            order_id: tcb.queryUrl(window.location.search, 'order_id')
        }
        if (remote_check_id) {
            params = {
                remote_check_id: remote_check_id
            }
        }
        window.XXG.ServiceRemoteCheck.apiGetRemoteCheckOptions(params, function (res) {
            if (!res) {
                return setTimeout(function () {
                    window.XXG.ServiceRemoteCheck.actionGetRemoteCheckOptions(callback)
                }, 300)
            }
            typeof callback == 'function' && callback(res.result)
        }, function (err) {
            setTimeout(function () {
                window.XXG.ServiceRemoteCheck.actionGetRemoteCheckOptions(callback)
            }, 300)
        })
    }

    var uploadRejectPictureMap = {}
    var uploadKeySet = []
    var uploadKeyMap = {}
    // var uploadKeySet = ['pingzheng1', 'pingzheng2', 'pingzheng3', 'pingzheng4']
    // var uploadKeyMap = {
    //     1: 'pingzheng1',
    //     2: 'pingzheng2',
    //     3: 'pingzheng3',
    //     4: 'pingzheng4'
    // }

    // 装载远程验机被驳回后重新传图验机的功能
    function actionSetupUploadRejectPicture($wrap, remote_check_tagging_imgs) {
        uploadRejectPictureMap = {}
        tcb.each(remote_check_tagging_imgs, function (k) {
            uploadRejectPictureMap[uploadKeyMap[k]] = ''
        })
        var $trigger = $wrap.find('.js-trigger-upload-picture')
        new window.TakePhotoUpload({
            $trigger: $trigger,
            supportCustomCamera: true,
            callback_upload_success: function (inst, data) {
                console.log('触发了上传图片的函数')
                if (data && !data.errno) {
                    var $triggerCurrent = inst.$triggerCurrent
                    if (!($triggerCurrent && $triggerCurrent.length)) {
                        return
                    }
                    $triggerCurrent.css('backgroundImage', 'url(' + data.result + ')')
                    $triggerCurrent.closest('.trigger-wrap').find('.tip-upload-picture').hide()
                    uploadRejectPictureMap[$triggerCurrent.attr('data-for')] = data.result
                } else {
                    return $.dialog.toast((data && data.errmsg) || '系统错误')
                }
            },
            callback_upload_fail: function (me, xhr, status, err) {
                $.dialog.toast(xhr.statusText || '上传失败，请稍后再试')
            }
        })


        // __bindEvent($wrap)
        // __bindEventUploadPicture($wrap.find('.trigger-invoke-camera'))
    }

    // 提交重新上传图片
    function actionRemoteCheckRejectReSubmit($trigger, data) {
        if (!window.XXG.ServiceRemoteCheck.actionIsRemoteCheckWorkTime()) {
            // 不在远程验机时间内，那么弹出提示
            return window.XXG.BusinessCommon.helperShowAlertConfirm(null, '服务时间为早9点至晚10点，请在此时间段内操作订单')
        }
        var order = data.order
        var order_id = order.order_id
        var params = {
            order_id: order_id
        }
        var flag = true
        tcb.each(uploadRejectPictureMap, function (k, v) {
            if (!v) {
                return flag = false
            }
            params[k] = v
        })
        if (!flag) {
            return $.dialog.toast('请重新上传所有的驳回照片')
        }
        tcb.loadingStart()
        window.XXG.ServiceUploadPicture.apiGetPicture(order_id, function (res) {
            if (res.errno) {
                return tcb.loadingDone()
            }
            var imgs = res.result || []
            tcb.each(imgs, function (i, img) {
                if (!params[uploadKeySet[i]]) {
                    params[uploadKeySet[i]] = img
                }
            })
            window.XXG.ServiceUploadPicture.apiUpdatePicture(params, function () {
                tcb.loadingDone()
                setTimeout(function () {
                    window.XXG.ServiceRemoteCheck.start(true)
                    tcb.loadingDone()
                }, 1000)
            }, function () {
                tcb.loadingDone()
            })
        })
    }

    // 判断是都在远程验机工作时间内
    function actionIsRemoteCheckWorkTime() {
        var data = window.XXG.ServiceRemoteCheck.getData()

        var remote_check_work_time = data.remote_check_work_time || {}
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
}()
