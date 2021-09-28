// 支付收银台
$(function () {
    var $CurrentPage = $('.page-youpin-special-vip-plus-cashier')
    if (!($CurrentPage && $CurrentPage.length)) {
        return
    }

    // 支付方式映射表
    var pay_method_data = window.__PAY_METHOD_DATA

    function eventTrigger() {
        tcb.bindEvent(document.body, {
            // 选择支付方式
            '.row-pay': function (e) {
                e.preventDefault()

                checkedPayMethod($(this))
            },
            // 点击支付按钮
            '.btn-pay': function (e) {
                if ($('body').hasClass('page-disabled')) {
                    // 页面禁用,支付按钮不让点啦
                    return e.preventDefault()
                }
                var $me = $(this)
                var href = $me.attr('href'),
                    pay_method = $me.attr('data-pay-method')

                if (!tcb.isRealUrl(href)) {
                    href = $me.attr('data-url')
                }

                if (pay_method === 'WXPAY_APP') {
                    e.preventDefault()
                    return __callWXPayInApp(href)
                } else if (pay_method === 'suning_app') {
                    e.preventDefault()
                    return __callSuningPayInApp(href)
                } else {
                    window.location.href = href
                }
            }
        })

    }

    function checkedPayMethod($payMethodRow) {
        var pay_method = $payMethodRow.attr('data-pay-method'),
            // 支付方式详细数据
            the_method_data = pay_method_data[pay_method]

        if (!the_method_data) {
            return $.dialog.toast('支付方式不正确')
        }

        // 花呗以外的其他支付方式
        var $otherRows = $payMethodRow.siblings('.row-pay')

        $payMethodRow.find('.iconfont').addClass('icon-circle-tick')
        $otherRows.find('.icon-circle-tick').removeClass('icon-circle-tick')

        // 设置支付按钮属性状态
        __setPayBtnAttr($('.btn-pay'), pay_method)
    }

    // 设置支付按钮属性状态
    function __setPayBtnAttr($btn, pay_method, url) {
        var pay_params = {
                order_id: window.__ORDER_ID,
                pay_type: pay_method
            },
            href = $btn.attr('href')

        // 支付地址
        $btn.attr('data-pay-method', pay_method)
        if (tcb.isRealUrl(href)) {
            $btn.attr('href', tcb.setUrl2(url || href, pay_params))
        } else {
            $btn.attr('data-url', tcb.setUrl2(url || '/PlusMember/joinMemberPayment', pay_params))
        }
    }

    function __callWXPayInApp(request_url) {
        $.ajax({
            url: request_url,
            type: 'POST',
            dataType: 'json',
            success: function (res) {
                if (res && !res.errno) {
                    var data = {
                        partnerId: res.result.partnerid,
                        prepayId: res.result.prepayid,
                        nonceStr: res.result.noncestr,
                        timeStamp: res.result.timestamp,
                        package: res.result.package,
                        sign: res.result.sign
                    }

                    return tcb.js2AppInvokePayMethod(data)

                } else {
                    $.dialog.toast('系统错误，请稍后重试')
                }
            }
        })
    }

    function __callSuningPayInApp(request_url) {
        $.ajax({
            url: request_url,
            type: 'POST',
            dataType: 'json',
            success: function (res) {
                if (res && !res.errno) {
                    var data = res.result

                    return tcb.js2AppInvokeSuningPayMethod(data)

                } else {
                    $.dialog.toast('系统错误，请稍后重试')
                }
            }
        })
    }

    function init() {
        eventTrigger()

        window.js4AppFnPaySuccess = function () {
            var url = tcb.setUrl2(window.__M_HOST + 'liangpin_my/index')
            window.location.replace(url)
        }
    }

    init()
})
