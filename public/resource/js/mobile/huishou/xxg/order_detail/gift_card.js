!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }

    function init() {
        __bindEvent()
    }

    function __bindEvent() {
        tcb.bindEvent(document.body, {
            // 调到苏宁礼品卡/以旧换新相关地址
            '.js-trigger-goto-suning-gift-card-addr,.js-trigger-goto-suning-huanxin-addr': function (e) {
                e.preventDefault()
                var order_id = $(this).attr('data-order-id')
                window.XXG.ajax({
                    url: '/xxgHs/getGiftCardJumpAddr',
                    type: 'POST',
                    data: {
                        order_id: order_id
                    },
                    success: function (res) {
                        if (!res.errno) {
                            var redirectUrl = res.result && res.result.result
                            if (!redirectUrl) {
                                return $.dialog.toast('系统错误，请稍后重试')
                            }
                            return window.XXG.redirect(redirectUrl)
                        }
                        return $.dialog.toast(res.errmsg)
                    },
                    error: function (err) {
                        $.dialog.toast('系统错误，请稍后重试')
                    }
                })
            },
            // 预售补贴逻辑
            '.js-trigger-subscribe-suning-gift-card': function (e) {
                e.preventDefault()
                var html_fn = $.tmpl($.trim($('#JsSuningSubscribeCard').html())),
                        html_st = html_fn({
                            'orderId': $(this).attr('data-order-id')
                        }),
                        dialog = tcb.showDialog(html_st, {middle: true})
                window.XXG.bindForm({
                    $form: dialog.wrap.find('form'),
                    before: function ($form, callback) {
                        tcb.loadingStart()
                        callback()
                    },
                    success: function () {
                        tcb.closeDialog()
                        setTimeout(function () {
                            window.XXG.redirect()
                        }, 10)
                    },
                    error: function (res) {
                        tcb.loadingDone()
                        $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                    }
                })
            },

            // 显示苏宁礼品二维码
            '.js-trigger-show-suning-gift-card': function (e) {
                e.preventDefault()
                __showSuningGiftCardQrcode($(this))
            }
        })
    }

    function __showSuningGiftCardQrcode($trigger) {
        if (!($trigger && $trigger.length)) {
            return
        }
        var qrcode = tcb.cache('huodong-doCheckSuningCard')
        if (qrcode) {
            var dialog_str = '<div style="margin: 0 auto;width: 2.88rem;height: 3.3rem;">' +
                '<div style="padding-top: .1rem;line-height: 2;font-size: .18rem;text-align: center;">请用户使用微信扫码领取</div>' +
                '<img src="' + qrcode + '" alt="" style="width:100%"></div>'
            tcb.showDialog(dialog_str, {
                className: 'qrcode-wrap',
                withClose: true,
                withMask: true,
                middle: true
            })
        } else {
            var order_id = $trigger.attr('data-order-id')

            window.XXG.ajax({
                url: '/huodong/doCheckSuningCard',
                data: {
                    order_id: order_id
                },
                success: function (res) {
                    if (!res.errno) {
                        var gift_data = res.result || {}
                        var cardtype = gift_data.card_type
                        // 如果为苏宁礼品卡,则打开弹窗,显示二维码
                        if (cardtype == 1) {
                            qrcode = gift_data.qr_code
                            if (qrcode) {
                                tcb.cache('huodong-doCheckSuningCard', qrcode)
                            }
                            var dialog_str = '<div style="margin: 0 auto;width: 2.88rem;height: 3.3rem;">' +
                                '<div style="padding-top: .1rem;line-height: 2;font-size: .18rem;text-align: center;">请用户使用微信扫码领取</div>' +
                                '<img src="' + qrcode + '" alt="" style="width:100%"></div>'
                            tcb.showDialog(dialog_str, {
                                className: 'qrcode-wrap',
                                withClose: true,
                                withMask: true,
                                middle: true
                            })
                        }
                    } else {
                        $.dialog.toast(res.errmsg)
                    }
                }
            })
        }

        tcb.statistic(['_trackEvent', 'xxg', '显示', '苏宁礼品卡二维码', '1', ''])
    }

    $(function () {
        init()
    })

}()
