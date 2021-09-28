// 订单详情服务--新机激活
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceNewDeviceActivation = tcb.mix(window.XXG.ServiceNewDeviceActivation || {}, {
        actionShow: actionShow,
        actionShowUploadFail: actionShowUploadFail,

        actionShowProgress: actionShowProgress,
        actionShowProcessBar: actionShowProcessBar,
        actionShowProcessBar100: actionShowProcessBar100
    })

    // 新机激活--展示拍照弹窗
    function actionShow() {
        var html_st = window.XXG.ServiceNewDeviceActivation.htmlServiceNewDeviceActivationUpload()
        var inst = window.XXG.BusinessCommon.helperShowDialog(html_st, {
            className: 'dialog-service-new-device-activation-upload',
            withClose: false
        })
        var $trigger = inst.wrap.find('.js-trigger-service-new-device-activation-take-photo-and-upload')
        var instProgress
        // 绑定拍照、上传事件
        window.XXG.ServiceNewDeviceActivation.eventBindTakePhotoAndUpload({
            $trigger: $trigger,
            is_silent: true,
            callback_upload_before: function (inst, img, next) {
                instProgress = window.XXG.ServiceNewDeviceActivation.actionShowProgress()
                next()
            },
            callback_upload_success: function (inst, data) {
                if (data && !data.errno) {
                    var rootData = window.XXG.ServiceNewDeviceActivation.rootData
                    var order_id = rootData.order.order_id
                    var img_url = data.result
                    window.XXG.ServiceNewDeviceActivation.apiSaveActivationEvidence({
                        order_id: order_id,
                        img_url: img_url
                    }, function () {
                        window.XXG.ServiceNewDeviceActivation.actionShowProcessBar100()
                        if (instProgress) {
                            instProgress.wrap.find('.the-title').html('完成！')
                        }
                        setTimeout(function () {
                            window.XXG.BusinessCommon.helperCloseDialog()
                            window.XXG.redirect()
                        }, 300)
                    }, function () {
                        window.XXG.ServiceNewDeviceActivation.actionShowUploadFail()
                    }, {
                        silent: true
                    })
                } else {
                    window.XXG.ServiceNewDeviceActivation.actionShowUploadFail()
                }
            },
            callback_upload_fail: function (inst, xhr, status, err) {
                window.XXG.ServiceNewDeviceActivation.actionShowUploadFail()
            }
        })
    }

    function actionShowUploadFail() {
        window.XXG.BusinessCommon.helperCloseDialog()

        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            window.XXG.ServiceNewDeviceActivation.actionShow()
        }, '上传出现错误，请重新上传', {
            noTitle: true,
            withoutClose: true,
            options: {
                btn: '好'
            }
        })
    }

    function actionShowProgress() {
        window.XXG.BusinessCommon.helperCloseDialog()

        var html_st = window.XXG.ServiceNewDeviceActivation.htmlServiceNewDeviceActivationUploadProgress()
        var inst = window.XXG.BusinessCommon.helperShowDialog(html_st, {
            className: 'dialog-service-new-device-activation-upload-progress',
            withClose: false
        })
        window.XXG.ServiceNewDeviceActivation.$processBar = inst.wrap.find('.upload-progress')
        window.XXG.ServiceNewDeviceActivation.actionShowProcessBar()
        return inst
    }

    function actionShowProcessBar() {
        var $processBar = window.XXG.ServiceNewDeviceActivation.$processBar
        if (!($processBar && $processBar.length)) {
            return
        }
        var $processBarInner = $processBar.find('.upload-progress-inner')
        $processBar.show()

        var percent_val = 25
        $processBarInner.css({'width': percent_val + '%'})

        setTimeout(function h() {
            percent_val += 6
            if (percent_val > 80) {
                return
            }
            if ($processBarInner.css('width') == '100%') {
                return
            }
            $processBarInner.css({'width': percent_val + '%'})

            if (percent_val < 100) {
                setTimeout(h, 500)
            }
        }, 500)
    }

    function actionShowProcessBar100() {
        var $processBar = window.XXG.ServiceNewDeviceActivation.$processBar
        if (!($processBar && $processBar.length)) {
            return
        }
        var $processBarInner = $processBar.find('.upload-progress-inner')
        $processBar.show()
        $processBarInner.css({'width': '100%'})
    }

}()
