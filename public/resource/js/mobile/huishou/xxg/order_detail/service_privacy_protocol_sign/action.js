// 用户隐私协议
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivacyProtocolSign = tcb.mix(window.XXG.ServicePrivacyProtocolSign || {}, {
        actionConfirmUserCleanDevice: actionConfirmUserCleanDevice,
        actionShowPrivacyProtocol: actionShowPrivacyProtocol,
        actionSetPrivacyProtocolReadCountdown: actionSetPrivacyProtocolReadCountdown,
        actionClosePrivacyProtocol: actionClosePrivacyProtocol,
        actionPrivacyProtocolIsToEnd: actionPrivacyProtocolIsToEnd,
        actionReleaseConfirmAgreeBtn: actionReleaseConfirmAgreeBtn,
        actionConfirmAgreePrivacyProtocol: actionConfirmAgreePrivacyProtocol,
        actionSignaturePadActive: actionSignaturePadActive,
        actionSignaturePadClose: actionSignaturePadClose,
        actionSignatureClear: actionSignatureClear,
        actionSignatureConfirm: actionSignatureConfirm
    })
    var SwipeSection = window.Bang.SwipeSection
    var instSignaturePad
    var __soundSrc = [
        ['https://s0.ssl.qhres2.com/static/35709c0402637b92.mp3']// v1
    ]

    // 询问用户是否已清空手机
    function actionConfirmUserCleanDevice() {
        window.XXG.BusinessCommon.soundPlay({
            src: __soundSrc[0],
            repeat: 2,
            interval: 500
        })
        window.XXG.BusinessCommon.helperShowAlertConfirm(function () {
            window.XXG.BusinessCommon.soundStop()
            window.XXG.ServicePrivacyProtocolSign.actionShowPrivacyProtocol()
        }, '询问客户是否已清空手机？', {
            noTitle: true,
            withoutClose: true,
            options: {
                btn: '我已询问'
            }
        })
    }

    // 显示隐私协议签署界面
    function actionShowPrivacyProtocol() {
        tcb.loadingStart()
        window.XXG.ServicePrivacyProtocolSign.apiGetPrivacyProtocol(function (result) {
            tcb.loadingDone()
            var $swipe = SwipeSection.getSwipeSection('.swipe-page-service-privacy-protocol-sign')
            var html_st = window.XXG.ServicePrivacyProtocolSign.htmlServicePrivacyProtocolSign(result)
            SwipeSection.fillSwipeSection(html_st)
            SwipeSection.doLeftSwipeSection()
            window.XXG.ServicePrivacyProtocolSign.$Wrap = $swipe
            window.XXG.ServicePrivacyProtocolSign.data.isRead = false

            if (window.XXG.ServicePrivacyProtocolSign.actionPrivacyProtocolIsToEnd()) {
                window.XXG.ServicePrivacyProtocolSign.actionReleaseConfirmAgreeBtn()
            } else {
                window.XXG.ServicePrivacyProtocolSign.actionSetPrivacyProtocolReadCountdown()
            }
            window.XXG.ServicePrivacyProtocolSign.eventBind()
            window.XXG.ServicePrivacyProtocolSign.eventBindPrivacyProtocolScroll()
        }, function () {
            tcb.loadingDone()
        })
    }

    // 设置隐私协议阅读倒计时
    function actionSetPrivacyProtocolReadCountdown() {
        var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
        var $btn = $Wrap.find('.js-trigger-service-privacy-protocol-sign-confirm')
        var text_default = $btn.html()
        $btn.html('请仔细阅读，5秒')

        var delay = 5
        tcb.distimeAnim(delay, function (time) {
            $btn.html('请仔细阅读，' + time + '秒')
            if (time <= 0) {
                $btn.html(text_default)
                window.XXG.ServicePrivacyProtocolSign.data.isRead = true
                window.XXG.ServicePrivacyProtocolSign.actionReleaseConfirmAgreeBtn()
            }
        })
    }

    // 关闭隐私协议签署界面
    function actionClosePrivacyProtocol() {
        instSignaturePad = null
        window.XXG.ServicePrivacyProtocolSign.$Wrap = null

        SwipeSection.backLeftSwipeSection()
    }

    // 隐私协议是否已经滚动到底部
    function actionPrivacyProtocolIsToEnd() {
        var isRead = !!window.XXG.ServicePrivacyProtocolSign.data.isRead
        if (isRead) {
            return true
        }
        var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
        var $cont = $Wrap.find('.block-privacy-protocol .cont')
        var $contInner = $Wrap.find('.block-privacy-protocol .cont-inner')
        if ($contInner.height() <= $cont.height()) {
            isRead = true
        }
        window.XXG.ServicePrivacyProtocolSign.data.isRead = isRead

        return isRead
    }

    // 确认同意隐私协议
    function actionConfirmAgreePrivacyProtocol(version) {
        var rootData = window.XXG.ServicePrivacyProtocolSign.rootData
        var data = {
            order_id: rootData.order.order_id,
            version: version,
            signature: window.XXG.ServicePrivacyProtocolSign.data.signature
        }
        tcb.loadingStart()
        // 保存签名
        window.XXG.ServicePrivacyProtocolSign.apiAgreePrivacyProtocol(data, function () {
            tcb.loadingDone()
            // 设置已经签约隐私协议
            window.XXG.ServicePrivacyProtocolSign.rootData.servicePrivacyProtocol.isSigned = true
            // 关闭隐私协议界面
            window.XXG.ServicePrivacyProtocolSign.actionClosePrivacyProtocol()
            // 确认同意隐私协议回调函数
            window.XXG.ServicePrivacyProtocolSign.callbackConfirmAgree()
        }, function () {
            tcb.loadingDone()
        })
    }

    // 激活签名板
    function actionSignaturePadActive() {
        __openCustomerSignaturePad()
    }

    // 激活签名板
    function actionSignaturePadClose() {
        __closeCustomerSignaturePad()
    }

    // 清除签名
    function actionSignatureClear() {
        __clearSignature()
    }

    // 确认签名
    function actionSignatureConfirm() {
        __confirmSignature()
    }

    // 符合条件的情况下释放同意隐私协议按钮的锁定状态
    function actionReleaseConfirmAgreeBtn() {
        var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
        var $btn = $Wrap.find('.js-trigger-service-privacy-protocol-sign-confirm')
        if (__validSignAndRead(true)) {
            $btn.removeClass('btn-disabled')
        } else {
            $btn.addClass('btn-disabled')
        }
    }

    function __openCustomerSignaturePad() {
        var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
        var $PadWrap = $Wrap.find('.customer-signature-pad-wrap'),
            $BtnRow = $PadWrap.find('.customer-signature-pad-btn'),
            $Pad = $PadWrap.find('.customer-signature-pad'),
            $win = tcb.getWin(),
            w_width = $win.width(),
            w_height = $win.height()

        $PadWrap.css({
            display: 'block',
            width: w_width + 'px',
            height: w_height + 'px'
        })
        $Pad.css({
            width: (w_width - $BtnRow.height()) + 'px',
            height: w_height + 'px'
        })
        $BtnRow.css({
            width: w_height + 'px',
            right: '-' + (w_height - $BtnRow.height()) / 2 + 'px'
        })

        if (!instSignaturePad) {
            instSignaturePad = window.Bang.SignaturePad({
                canvas: $Wrap.find('.customer-signature-pad-canvas'),
                canvasConfig: {
                    penColor: '#000',
                    penSize: 3,
                    backgroundColor: '#cbcbcb'
                },
                flagAutoInit: true
            })
        }

        $BtnRow.css({
            transform: 'rotate(-90deg)'
        })
        tcb.js2AndroidSetDialogState(true, function () {
            __closeCustomerSignaturePad()
        })
    }

    function __closeCustomerSignaturePad() {
        var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
        var $PadWrap = $Wrap.find('.customer-signature-pad-wrap'),
            $BtnRow = $PadWrap.find('.customer-signature-pad-btn')

        $PadWrap.hide()
        $BtnRow.css({
            transform: 'none'
        })
        tcb.js2AndroidSetDialogState(false)
        window.XXG.ServicePrivacyProtocolSign.actionReleaseConfirmAgreeBtn()
    }

    function __rotateImg(img, deg, fn) {

        tcb.imageOnload(img, function (imgObj) {

            var w = imgObj.naturalHeight,
                h = imgObj.naturalWidth

            var canvas = __createCanvas(w, h),
                ctx = canvas.getContext('2d')

            ctx.save()
            ctx.translate(w, 0)
            ctx.rotate(deg * Math.PI / 180)
            ctx.drawImage(imgObj, 0, 0, h, w)
            ctx.restore()

            var newImg = ctx.canvas.toDataURL('image/jpeg')

            typeof fn === 'function' && fn(newImg)
        })
    }

    function __createCanvas(w, h) {
        var canvas = document.createElement('canvas')

        canvas.width = w
        canvas.height = h
        return canvas
    }

    function __validSignAndRead(silent) {
        var signature = window.XXG.ServicePrivacyProtocolSign.data.signature
        var flag = true
        var msg = ''
        if (!msg && !window.XXG.ServicePrivacyProtocolSign.actionPrivacyProtocolIsToEnd()) {
            flag = false
            msg = '请阅读完成隐私协议，并将协议滑动到底部'
        }
        if (!msg && !signature) {
            flag = false
            msg = '请先签名确认'
        }

        if (msg && !silent) {
            $.dialog.toast(msg)
        }
        return flag
    }


    function __clearSignature() {
        if (instSignaturePad && instSignaturePad.clearAll) {
            instSignaturePad.clearAll()

            var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
            var $trigger = $Wrap.find('.js-trigger-service-privacy-protocol-sign-signature-pad-active')
            $trigger.css({
                fontSize: '',
                backgroundImage: ''
            })

            window.XXG.ServicePrivacyProtocolSign.data.signature = ''
        }
    }

    function __confirmSignature() {
        if (!instSignaturePad) {
            return
        }
        var pointGroups = instSignaturePad.getPointGroups()
        if (!(pointGroups && pointGroups[0] && pointGroups[0][0])) {
            return $.dialog.toast('请先签名').css({
                transform: 'rotate(-90deg)'
            })
        }

        var dataUrl = instSignaturePad.toDataUrl('image/jpeg')

        __rotateImg(dataUrl, 90, function (img) {
            var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
            var $trigger = $Wrap.find('.js-trigger-service-privacy-protocol-sign-signature-pad-active')
            $trigger.css({
                fontSize: 0,
                backgroundImage: 'url(' + img + ')'
            })
        })

        window.XXG.ServicePrivacyProtocolSign.data.signature = JSON.stringify(instSignaturePad.getStripPointGroups())

        __closeCustomerSignaturePad()
    }

}()
