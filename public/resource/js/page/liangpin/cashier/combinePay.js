!function () {
    try {
        window.__MERGE_FIRST_INFO = typeof window.__MERGE_FIRST_INFO == 'string'
            ? $.parseJSON(window.__MERGE_FIRST_INFO)
            : {}
    } catch (e) {
        window.__MERGE_FIRST_INFO = {}
    }
    var pay_first_type = window.__MERGE_FIRST_INFO['pay_first_type']
    var CombinePayData = {
        is_merge_pay: (window.__IS_MERGE_PAY == '1') || false,
        type: pay_first_type ?
            pay_first_type == 'WXPAY_JS' ?
                'wxpay' :
                pay_first_type :
            'wxpay',
        first_pay_price: window.__MERGE_FIRST_INFO['pay_first_price'] || '',
        first_pay_success: (window.__MERGE_FIRST_INFO['pay_first_status'] == '1') || false,
        hbfq_info: null
    }
    // CombinePayData.is_merge_pay = true
    // CombinePayData.type = 'wxpay'
    // CombinePayData.first_pay_price = 2222
    // CombinePayData.first_pay_success = false

    // 设置组合支付数据和状态
    function setupCombinePay() {
        var $CombinePayBlock = $('.combine-pay-block')
        var $CaPayDescription = $CombinePayBlock.find('.ca-pay-description')
        var type = CombinePayData.type || 'wxpay'
        CombinePayData.type = type
        combinePayCheck($CaPayDescription.filter('.ca-pay-description-' + type))
        if (CombinePayData.first_pay_success) {
            $CombinePayBlock.find('.combine-pay-step-1').addClass('step-1-finished')
            $('.cashier-tab li').filter(function () {
                return $(this).attr('data-type') !== 'combinePay'
            }).addClass('disabled')

            if (!CombinePayData.hbfq_info) {
                combinePayFinishFirstPay()
            }
        }
    }

    // 初始化组合支付相关逻辑
    function initCombinePay() {
        var $CombinePayBlock = $('.combine-pay-block')
        var $PayStep1 = $CombinePayBlock.find('.combine-pay-step-1')
        var $PayStep2 = $CombinePayBlock.find('.combine-pay-step-2')

        // 选择第一笔支付方式
        $PayStep1.on('click', '.js-trigger-ca-pay-description ', function (e) {
            e.preventDefault()
            if ($CombinePayBlock.find('.combine-pay-step-1').hasClass('step-1-finished')) {
                return
            }
            combinePayCheck($(this))
        })
        // 输入第一笔付款金额
        $PayStep1.on('click', '.js-trigger-combine-pay-enter-amount-confirm', function (e) {
            e.preventDefault()
            var $me = $(this),
                $input = $me.siblings('input'),
                first_pay_price = parseFloat(tcb.trim($input.val())) || 0
            if (!combinePayValidFirstPayPrice(first_pay_price, $input)) {
                return
            }

            CombinePayData.first_pay_price = first_pay_price

            var type = CombinePayData.type
            combinePayCheck($CombinePayBlock.find('.ca-pay-description-' + type))
        })
        // 重新输入第一笔付款金额
        $PayStep1.on('click', '.js-trigger-combine-pay-re-enter', function (e) {
            e.preventDefault()

            $CombinePayBlock.find('.ca-pay-save-enter-amount').show().siblings().hide()
        })
        // 用户手动确认完成第一笔支付
        $PayStep1.on('click', '.js-trigger-combine-pay-confirm', function (e) {
            e.preventDefault()
            var $me = $(this)
            combinePayFinishFirstPay(
                function (result) {
                    setupCombinePay()
                },
                function (errmsg) {
                    var $error = $me.closest('.ca-pay-save-after-enter-amount').find('.error')
                    $error.html(errmsg)
                }
            )
        })
        // 去支付
        $PayStep1.on('click', '.js-trigger-combine-pay-go-to-pay', function (e) {
            e.preventDefault()
            var first_pay_price = CombinePayData.first_pay_price
            if (!combinePayValidFirstPayPrice(first_pay_price)) {
                return alert('没有获取到支付金额，请重新输入！')
            }
            var $form = $('#FormCombinePayAlipay')
            var input_html = ''
            input_html += '<input type="hidden" name="order_id" value="' + window.__ORDER_ID + '">'
            input_html += '<input type="hidden" name="bank_code" value="' + (CombinePayData.type == 'wxpay' ? 'WXPAY_JS' : CombinePayData.type) + '">'
            input_html += '<input type="hidden" name="merge" value="1">'
            input_html += '<input type="hidden" name="step" value="1">'
            input_html += '<input type="hidden" name="first_pay_price" value="' + first_pay_price + '">'
            $form.html(input_html)

            CombinePayData.is_merge_pay = true

            combinePayShowFirstConfirmPanel()

            $form.submit()
        })
    }

    function combinePayCheck($label) {
        if (!($label && $label.length)) {
            return
        }
        var $CombinePayBlock = $('.combine-pay-block')
        var type = $label.attr('data-type')
        CombinePayData.type = type

        $label.addClass('checked').siblings('.checked').removeClass('checked')

        var first_pay_price = CombinePayData.first_pay_price
        var first_pay_success = CombinePayData.first_pay_success
        if (first_pay_price && first_pay_success) {
            $CombinePayBlock.find('.ca-pay-save-pay-success').show()
                            .siblings().hide()
            $CombinePayBlock.find('.ca-pay-save-pay-success .money-mod b').html('¥' + first_pay_price)
        } else if (first_pay_price) {
            $CombinePayBlock.find('.ca-pay-save-after-enter-amount-for-' + type).show()
                            .siblings().hide()
            $CombinePayBlock.find('.ca-pay-save-after-enter-amount .money-mod b').html('¥' + first_pay_price)
            if (type == 'wxpay') {
                combinePayGetWXPayQRCode()
            }
        } else {
            $CombinePayBlock.find('.ca-pay-save-enter-amount').show()
                            .siblings().hide()
        }
    }

    function combinePayGetWXPayQRCode() {
        var order_id = window.__ORDER_ID
        var first_pay_price = CombinePayData.first_pay_price
        var params = {
            merge: 1,
            step: 1,
            order_id: order_id,
            first_pay_price: first_pay_price
        }
        var url = tcb.setUrl('/youpin/getPayCode', params)
        $('.ca-pay-save-after-enter-amount-for-wxpay .pay-mod-scan').html('<img src="' + url + '">')
    }

    function combinePayValidFirstPayPrice(first_pay_price, $input) {
        first_pay_price = first_pay_price || 0
        var flag = true
        var msg = ''
        var total = parseFloat(window.__TOTAL_AMOUNT)
        if (first_pay_price <= 0) {
            flag = false
            msg = '第一笔付款金额不能小于0'
        } else if (first_pay_price >= total) {
            flag = false
            msg = '第一笔付款金额不能大于' + total
        }

        if ($input && $input.length) {
            var $errorTips = $input.siblings('.enter-amount-error-tips')
            if (!flag) {
                $errorTips.css('visibility', 'visible').html(msg)
            } else {
                $errorTips.css('visibility', 'hidden')
            }
        }

        return flag
    }

    function combinePayFinishFirstPay(success, fail) {
        var params = {
            order_id: window.__ORDER_ID,
            step: 1
        }
        $.get('/youpin/getMergePayStatus', params, function (res) {
            try {
                res = $.parseJSON(res)
            } catch (e) {}

            if (!res.errno) {
                CombinePayData.first_pay_success = true
                CombinePayData.hbfq_info = res.result
                combinePaySetupHBFQHtml()

                typeof success == 'function' && success(res.result)
            } else {
                typeof fail == 'function' && fail(res.errmsg)
            }
        })
    }

    function combinePaySetupHBFQHtml() {
        var hb_info = CombinePayData.hbfq_info

        var html_fn = $.tmpl(tcb.trim($('#JsYouPinCashierCombinePayHBFQTpl').html())),
            html_st = html_fn({
                hbicon: ['three', 'six', 'twelve'],
                hbperiod: [3, 6, 12],
                myperiods: 3,
                payment: hb_info.payment,
                payAmount: hb_info.payAmount,
                rate: hb_info.rate,
                payRate: hb_info.payRate
            })

        var $ColRight = $('.combine-pay-step-2 .col-right')
        $ColRight.html(html_st)

        var $li = $ColRight.find('.pay-period-list li')
        var $checked = $li.filter('.active')
        combinePaySetPeriodToTalAmount($checked)

        $li.on('click', function (e) {
            e.preventDefault()
            var $me = $(this)
            $me.addClass('active')
               .siblings().removeClass('active')

            combinePaySetPeriodToTalAmount($me)
        })

        $ColRight.find('.js-trigger-alipay-hb').on('click', function (e) {
            e.preventDefault()

            combinePayShowSecondConfirmPanel()

            $('#FormCombinePayAlipayHB').submit()
        })
    }

    function combinePaySetPeriodToTalAmount($checked) {
        if (!($checked && $checked.length)) {
            return
        }
        var amount = +$checked.attr('amount') //分期总额:
        var payrate = +$checked.attr('payrate') //含手续费
        var period = +$checked.attr('period') //付款分期数
        var rate = +$checked.attr('rate')
        var $CombinePayPeriodTotalAmount = $('#CombinePayPeriodTotalAmount')
        var $CombinePayPeriodPayRate = $('#CombinePayPeriodPayRate')

        if (rate == 0) {
            $CombinePayPeriodPayRate.html('¥0（已减免：<del>' + payrate + '</del>元）')
        } else {
            $CombinePayPeriodPayRate.html('¥' + payrate)
        }
        $CombinePayPeriodTotalAmount.html('¥' + amount)

        $('#CombinePayAlipayHBStages').val(period)
    }

    function combinePayShowFirstConfirmPanel() {
        var payPanel = tcb.panel('', $('#LiangpinPaymentConfirmPanelTpl').html(), {
            'className': 'liangpin-payment-confirm-panel-wrap'
        })
        $(payPanel.oWrap).off('click').on('click', 'span', function (e) {
            var pay = $(e.target).attr('data-hoom')
            var $error = $('.liangpin-payment-confirm-panel-wrap').find('.error')
            switch (pay) {
                case 'close' :
                    payPanel.hide()
                    break
                case 'finish' :
                    combinePayFinishFirstPay(
                        function () {
                            payPanel.hide()
                            setupCombinePay()
                        },
                        function (errmsg) {
                            $error.html(errmsg)
                        }
                    )
                    break
                case 'reset' :
                    combinePayFinishFirstPay(
                        function () {
                            payPanel.hide()
                            setupCombinePay()
                        },
                        function () {
                            payPanel.hide()
                        }
                    )
                    break
            }
        })
    }

    function combinePayShowSecondConfirmPanel() {
        var payPanel = tcb.panel('', $('#LiangpinPaymentConfirmPanelTpl').html(), {
            'className': 'liangpin-payment-confirm-panel-wrap'
        })
        $(payPanel.oWrap).off('click').on('click', 'span', function (e) {
            var pay = $(e.target).attr('data-hoom')
            var order_id = window.__ORDER_ID
            var $error = $('.liangpin-payment-confirm-panel-wrap').find('.error')
            switch (pay) {
                case 'close' :
                    payPanel.hide()
                    break
                case 'finish' :
                    getOrderStatus(order_id, function (errno, errmsg) {
                        if (errno == '0') {
                            window.location.href = '/liangpin_my/order_detail/?order_id=' + order_id + '&paysuccess=1'
                        } else {
                            $error.html(errmsg)
                        }
                    })
                    break
                case 'reset' :
                    getOrderStatus(order_id, function (errno, errmsg) {
                        if (errno == '0') {
                            window.location.href = '/liangpin_my/order_detail/?order_id=' + order_id + '&paysuccess=1'
                        } else {
                            payPanel.hide()
                        }
                    })
                    break
            }
        })
    }

    //获取订单状态
    function getOrderStatus(order_id, callback) {
        $.ajax({
            url: '/youpin/getOrderStatus?order_id=' + order_id,
            dataType: 'json',
            error: function () {
                setTimeout(function () {
                    getOrderStatus(order_id, callback)
                }, 5000)
            },
            success: function (data) {
                callback && callback(data.errno, data.errmsg)
            }
        })
    }

    window.YouPinCombinePay = {
        setupCombinePay: setupCombinePay
    }

    $(function () {
        var $CombinePayBlock = $('.combine-pay-block')
        if (!($CombinePayBlock && $CombinePayBlock.length)) {
            return
        }
        initCombinePay()

        if (CombinePayData.is_merge_pay) {
            setupCombinePay()
        }
    })
}()
