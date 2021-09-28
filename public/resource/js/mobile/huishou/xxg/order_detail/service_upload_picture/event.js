// 拍照上传
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceUploadPicture = tcb.mix(window.XXG.ServiceUploadPicture || {}, {
        eventBind: eventBind,
        eventBindTakePhotoUpload: eventBindTakePhotoUpload,
        eventBindFormXxgOrderSubmitPicture: eventBindFormXxgOrderSubmitPicture
    })

    // 绑定事件
    function eventBind($wrap) {
        tcb.bindEvent($wrap[0], {
            // 关闭上传弹层
            '.js-trigger-close-upload-swipe': function (e) {
                e.preventDefault()
                window.XXG.ServiceUploadPicture.actionClose()
            },

            // 删图
            '.js-trigger-del-picture': function (e) {
                e.preventDefault()
                window.XXG.ServiceUploadPicture.actionDelPicture($(this))
            }
        })
    }

    // 绑定图片提交表单
    function eventBindFormXxgOrderSubmitPicture($form) {
        window.XXG.bindForm({
            $form: $form,
            before: function ($form, callback) {
                tcb.loadingStart()
                if (__validFormXxgOrderSubmitPicture($form)) {
                    callback()
                } else {
                    tcb.loadingDone()
                }
            },
            success: function () {
                var fnQueueSubmitSuccess = [].concat(window.XXG.ServiceUploadPicture.fnQueueSubmitSuccess || [],
                    function () {
                        setTimeout(function () {
                            tcb.loadingDone()
                            window.XXG.ServiceUploadPicture.actionClose()
                        }, 1500)
                    }
                )
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
                }(fnQueueSubmitSuccess)
            },
            error: function (res) {
                tcb.loadingDone()
                $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
            }
        })
    }

    function __validFormXxgOrderSubmitPicture($form) {
        var flag = true

        var $uploadPingzheng = $form.find('.hidden-upload-pingzheng')
        $uploadPingzheng.each(function () {
            var $me = $(this)
            var upload_picture = tcb.trim($me.val())
            if ($me && $me.length && !upload_picture) {
                flag = false
                $('[data-for="' + $me.attr('name') + '"]').closest('.trigger-wrap').find('.trigger-upload-picture-cover').shine4Error()
            }
        })

        if (!flag) {
            $.dialog.toast('请上传所有的照片！', 2000)
        }

        return flag
    }

    // 拍照 并 上传图片
    function eventBindTakePhotoUpload($trigger) {
        new window.TakePhotoUpload({
            $trigger: $trigger,
            supportCustomCamera: true,
            callback_upload_before: function (inst, img, next) {
                img = typeof img === 'string' ? img : window.URL.createObjectURL(img)
                var $triggerCurrent = inst.$triggerCurrent
                var $processBar = $triggerCurrent.siblings('.fake-upload-progress')

                window.XXG.ServiceUploadPicture.actionSetUploadingPicture($triggerCurrent, img)
                window.XXG.ServiceUploadPicture.actionShowProcessBar($processBar)

                next()
            },
            callback_upload_success: function (inst, data) {
                var $triggerCurrent = inst.$triggerCurrent
                var $processBar = $triggerCurrent.siblings('.fake-upload-progress')
                if (data && !data.errno) {
                    window.XXG.ServiceUploadPicture.actionShowProcessBar100($processBar)
                    window.XXG.ServiceUploadPicture.actionSetUploadedPicture($triggerCurrent, data.result)
                } else {
                    window.XXG.ServiceUploadPicture.actionDelPicture($triggerCurrent.siblings('.js-trigger-del-picture'))
                    return $.dialog.toast((data && data.errmsg) || '系统错误')
                }
            },
            callback_upload_fail: function (inst, xhr, status, err) {
                var $triggerCurrent = inst.$triggerCurrent
                window.XXG.ServiceUploadPicture.actionDelPicture($triggerCurrent.siblings('.js-trigger-del-picture'))
                $.dialog.toast(xhr.statusText || '上传失败，请稍后再试')
            }
        })
    }
}()
