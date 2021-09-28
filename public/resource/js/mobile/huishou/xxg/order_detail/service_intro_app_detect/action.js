// 引导APP检测
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServiceIntroAppDetect = tcb.mix(window.XXG.ServiceIntroAppDetect || {}, {
        actionTriggerScanQRCode: actionTriggerScanQRCode,
        actionShowSelect: actionShowSelect,
        actionShowDirectScan: actionShowDirectScan,
        actionShowIntro: actionShowIntro,
        actionCloseIntro: actionCloseIntro,
        actionPlaySoundSequence: actionPlaySoundSequence,
        actionPlaySound: actionPlaySound,
        actionStopSound: actionStopSound,
        actionPlaySoundStep1: actionPlaySoundStep1,
        actionPlaySoundStep3: actionPlaySoundStep3,
        actionPlayVideo: actionPlayVideo,
        actionStopVideo: actionStopVideo,
        actionDisposeVideo: actionDisposeVideo,
        actionPlayVideoStep2: actionPlayVideoStep2,
        actionShowScanGuide:actionShowScanGuide
    })
    var SwipeSection = window.Bang.SwipeSection
    var __soundSrc = [
        ['https://s5.ssl.qhres2.com/static/f3a763e9f5bd69f7.mp3'],// v5
        ['https://s5.ssl.qhres2.com/static/d925aea4c12bac43.mp3'],// v6
        ['https://s4.ssl.qhres2.com/static/b2ae25d7ffab080f.mp3'] // v7
    ]
    var __videoSrc = [
        [{
            src: 'https://s0.ssl.qhres2.com/static/86b2403a6c3f8151.mp4',
            type: 'video/mp4'
        }]
    ]
    var __videoInstPlaying = null

    function actionTriggerScanQRCode($trigger) {
        var rootData = window.XXG.BusinessCommon.rootData
        var order = rootData.order
        if (order.status == 11) {
            $trigger
                .attr('data-order-id', order.order_id)
                .attr('data-now-status', '11')
                .attr('data-next-status', '12')
        }
        window.XXG.BusinessCommon.actionScanQRCode($trigger)
    }

    // 引导APP检测--方式选择
    function actionShowSelect() {
        var html_st = window.XXG.ServiceIntroAppDetect.htmlServiceIntroAppDetectSelect()
        window.XXG.BusinessCommon.helperShowDialog(html_st, {
            className: 'dialog-service-intro-app-detect-select'
        })
    }

    // 引导APP检测--直接扫码
    function actionShowDirectScan() {
        var html_st = window.XXG.ServiceIntroAppDetect.htmlServiceIntroAppDetectDirectScan()
        window.XXG.BusinessCommon.helperShowDialog(html_st, {
            withClose: false,
            className: 'dialog-service-intro-app-detect-direct-scan'
        })
    }

    function actionShowIntro() {
        var $swipe = SwipeSection.getSwipeSection('.swipe-page-service-intro-app-detect')
        var type = window.XXG.ServiceIntroAppDetect.data.type
        var html_st = window.XXG.ServiceIntroAppDetect.htmlServiceIntroAppDetectStep(type)
        SwipeSection.fillSwipeSection(html_st)
        SwipeSection.doLeftSwipeSection(0, function () {
            if (type === 'mini') {
                window.XXG.ServiceIntroAppDetect.actionPlaySoundStep1()
            }
        })
        // 绑定相关事件
        window.XXG.ServiceIntroAppDetect.eventBindStep($swipe)
    }
    //修修哥如何扫码下载引导页
    function actionShowScanGuide() {
        // var $swipe = SwipeSection.getSwipeSection('.swipe-page-service-intro-app-detect')
        var $swipe = SwipeSection.getSwipeSection('.swipe-page-service-intro-app-detect-scan-step-guide')
        var type = window.XXG.ServiceIntroAppDetect.data.type
        var html_st = window.XXG.ServiceIntroAppDetect.htmlServiceIntroAppScanStepGuide(type)
        SwipeSection.fillSwipeSection(html_st)
        SwipeSection.doLeftSwipeSection(0, function () {
        })
        // 绑定相关事件
        window.XXG.ServiceIntroAppDetect.eventBindStep($swipe)
    }

    function actionCloseIntro(callback, flag_static) {
        var type = window.XXG.ServiceIntroAppDetect.data.type
        if (type === 'mini') {
            window.XXG.ServiceIntroAppDetect.actionStopSound()
            window.XXG.ServiceIntroAppDetect.actionDisposeVideo()
        }
        SwipeSection.backLeftSwipeSection(callback, flag_static)
    }

    function actionPlayVideo(src) {
        var player = __videoInstPlaying
        if (player) {
            player.src(src)
            player.load()
            player.play()
            return
        }
        player = videojs('ServiceIntroAppDetectStep2Video', {
            sources: src,
            preload: 'auto',
            controls: true,
            bigPlayButton: false,
            controlBar: {
                volumePanel: {
                    // 非行内音量（即为：纵向）
                    inline: false,
                    volumeControl: {
                        vertical: true
                    }
                },
                currentTimeDisplay: false,
                durationDisplay: false,
                progressControl: {
                    seekBar: {
                        loadProgressBar: false,
                        mouseTimeDisplay: false,
                        playProgressBar: true
                    }
                },
                remainingTimeDisplay: false,
                customControlSpacer: false,
                pictureInPictureToggle: false,
                fullscreenToggle: true
            }
        }, function () {
            this.load()
            this.play()
        })
        __videoInstPlaying = player
    }

    function actionStopVideo() {
        if (__videoInstPlaying) {
            __videoInstPlaying.reset()
        }
    }

    function actionDisposeVideo() {
        if (__videoInstPlaying) {
            __videoInstPlaying.dispose()
            __videoInstPlaying = null
        }
    }

    function actionPlayVideoStep2() {
        window.XXG.ServiceIntroAppDetect.actionPlayVideo(__videoSrc[0])
    }

    function actionPlaySoundStep1() {
        window.XXG.ServiceIntroAppDetect.actionPlaySoundSequence([__soundSrc[0], __soundSrc[1]], 5000)
    }

    function actionPlaySoundStep3() {
        window.XXG.ServiceIntroAppDetect.actionPlaySound(__soundSrc[2])
    }

    function actionPlaySoundSequence(srcArr, delay, callback) {
        var optionsQueue = []
        tcb.each(srcArr, function (src) {
            optionsQueue.push({
                src: src,
                repeat: 2,
                interval: 3000,
                delay: delay
            })
        })
        window.XXG.BusinessCommon.soundPlaySequence(optionsQueue, callback)
    }

    function actionPlaySound(src, callback) {
        window.XXG.BusinessCommon.soundPlay({
            src: src,
            repeat: 2,
            interval: 3000,
            callback: callback
        })
    }

    function actionStopSound() {
        window.XXG.BusinessCommon.soundStop()
    }

}()
