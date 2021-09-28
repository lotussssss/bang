// 引导APP检测
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceIntroAppDetect = tcb.mix(window.XXG.ServiceIntroAppDetect || {}, {
        eventBind: eventBind,

        eventBindStep: eventBindStep
    })

    // 绑定事件
    function eventBind() {
        tcb.bindEvent({
            // 触发引导APP检测--方式选择
            '.js-trigger-service-intro-app-detect-select': function (e) {
                e.preventDefault()
                window.XXG.ServiceIntroAppDetect.callbackBeforeShowSelect(function () {
                    window.XXG.ServiceIntroAppDetect.actionShowSelect()
                })
            },
            // // 触发引导APP检测--帮验宝pad验机后扫码
            // '.js-trigger-service-intro-app-detect-pad-detect-scan': function (e) {
            //     e.preventDefault()
            //     window.XXG.BusinessCommon.helperCloseDialog()
            //
            //     var $me = $(this)
            //     window.XXG.ServiceIntroAppDetect.callbackBeforeTriggerScanQRCode(function () {
            //         window.XXG.ServiceIntroAppDetect.actionTriggerScanQRCode($me)
            //     })
            // },
            // 触发引导APP检测
            '.js-trigger-service-intro-app-detect': function (e) {
                e.preventDefault()
                window.XXG.BusinessCommon.helperCloseDialog()

                var $me = $(this)
                var type = $me.attr('data-type')
                window.XXG.ServiceIntroAppDetect.data.type = type
                window.XXG.ServiceIntroAppDetect.actionShowIntro()
            },
            // 扫码
            '.js-trigger-service-intro-app-scan': function (e) {
                e.preventDefault()

                var $me = $(this)
                var not_intro = $me.attr('data-not-intro')
                if (not_intro) {
                    window.XXG.BusinessCommon.helperCloseDialog()
                    window.XXG.ServiceIntroAppDetect.callbackBeforeTriggerScanQRCode(function () {
                        window.XXG.ServiceIntroAppDetect.actionTriggerScanQRCode($me)
                    })
                } else {
                    window.XXG.ServiceIntroAppDetect.actionCloseIntro(function () {
                        window.XXG.ServiceIntroAppDetect.callbackBeforeTriggerScanQRCode(function () {
                            window.XXG.ServiceIntroAppDetect.actionTriggerScanQRCode($me)
                        })
                    }, true)
                }
            }

        })
    }

    function eventBindStep($Wrap) {
        tcb.bindEvent($Wrap[0], {
            // 关闭滑层
            '.js-trigger-close-swipe': function (e) {
                e.preventDefault()
                window.XXG.ServiceIntroAppDetect.actionCloseIntro()
            },
            // 下一步
            '.js-trigger-service-intro-app-step-next': function (e) {
                e.preventDefault()
                var $me = $(this)
                var step = $me.attr('data-step')
                var $step = $me.closest('.step')
                $step.addClass('hide').next('.hide').removeClass('hide')

                var type = window.XXG.ServiceIntroAppDetect.data.type
                if (type === 'mini') {
                    if (step == 1) {
                        window.XXG.ServiceIntroAppDetect.actionStopSound()
                        window.XXG.ServiceIntroAppDetect.actionPlayVideoStep2()
                    } else if (step == 2) {
                        window.XXG.ServiceIntroAppDetect.actionStopVideo()
                        // 播放第3步声音
                        window.XXG.ServiceIntroAppDetect.actionPlaySoundStep3()
                    }
                }
            },
            // 上一步
            '.js-trigger-service-intro-app-step-prev': function (e) {
                e.preventDefault()
                var $me = $(this)
                var step = $me.attr('data-step')
                var $step = $me.closest('.step')
                $step.addClass('hide').prev('.hide').removeClass('hide')

                var type = window.XXG.ServiceIntroAppDetect.data.type
                if (type === 'mini') {
                    if (step == 3) {
                        window.XXG.ServiceIntroAppDetect.actionStopSound()
                        window.XXG.ServiceIntroAppDetect.actionPlayVideoStep2()
                    } else if (step == 2) {
                        window.XXG.ServiceIntroAppDetect.actionStopVideo()
                        // 播放第1步声音
                        window.XXG.ServiceIntroAppDetect.actionPlaySoundStep1()
                    }
                }
            },
            //    跳转扫码教程
            '.js-show-course-btn': function (e) {
                e.preventDefault()
                window.XXG.ServiceIntroAppDetect.actionShowScanGuide()
            }


        })
    }

}()
