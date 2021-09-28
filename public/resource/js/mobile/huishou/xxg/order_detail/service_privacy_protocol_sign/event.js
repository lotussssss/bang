// 用户隐私协议
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }
    window.XXG = window.XXG || {}
    window.XXG.ServicePrivacyProtocolSign = tcb.mix(window.XXG.ServicePrivacyProtocolSign || {}, {
        eventBind: eventBind,
        eventBindPrivacyProtocolScroll: eventBindPrivacyProtocolScroll
    })

    // 绑定事件
    function eventBind() {
        var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
        tcb.bindEvent($Wrap[0], {
            // 关闭弹层
            '.js-trigger-service-privacy-protocol-sign-close': function (e) {
                e.preventDefault()
                window.XXG.ServicePrivacyProtocolSign.actionClosePrivacyProtocol()
            },

            // 签名并且确认同意隐私协议
            '.js-trigger-service-privacy-protocol-sign-confirm': function (e) {
                e.preventDefault()
                var $me = $(this)
                if ($me.hasClass('btn-disabled')) {
                    return
                }

                var version = $me.attr('data-version')
                window.XXG.ServicePrivacyProtocolSign.actionConfirmAgreePrivacyProtocol(version)
            },

            // 激活签名板
            '.js-trigger-service-privacy-protocol-sign-signature-pad-active': function (e) {
                e.preventDefault()
                window.XXG.ServicePrivacyProtocolSign.actionSignaturePadActive()
            },
            // 关闭签名板
            '.js-trigger-service-privacy-protocol-sign-signature-pad-close': function (e) {
                e.preventDefault()
                window.XXG.ServicePrivacyProtocolSign.actionSignaturePadClose()
            },
            // 清除签名
            '.js-trigger-service-privacy-protocol-sign-signature-clear': function (e) {
                e.preventDefault()
                window.XXG.ServicePrivacyProtocolSign.actionSignatureClear()
            },
            // 确认签名
            '.js-trigger-service-privacy-protocol-sign-signature-confirm': function (e) {
                e.preventDefault()
                window.XXG.ServicePrivacyProtocolSign.actionSignatureConfirm()
            }
        })
    }

    function eventBindPrivacyProtocolScroll() {
        var $Wrap = window.XXG.ServicePrivacyProtocolSign.$Wrap
        var $cont = $Wrap.find('.block-privacy-protocol .cont')
        $cont.on('scroll', function (e) {
            if (window.XXG.ServicePrivacyProtocolSign.actionPrivacyProtocolIsToEnd()) {
                return
            }
            var $cont = $(this)
            var $end = $cont.find('.block-privacy-protocol-end')

            var contOffset = $cont.offset()
            var endOffset = $end.offset()
            if ((endOffset.top - contOffset.top) <= contOffset.height) {
                window.XXG.ServicePrivacyProtocolSign.data.isRead = true
                window.XXG.ServicePrivacyProtocolSign.actionReleaseConfirmAgreeBtn()
            }
        })
    }
}()
