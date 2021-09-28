// 修修哥通用支付平台
!function () {
    if (window.__PAGE != 'xxg-normal-cashier-desk') {
        return
    }

    $(function () {
        var
                // 支付方式列表
                pay_type_arr = ['WXPAY_JS', 'alipay'],
                // 支付方式映射表
                pay_type_map = {
                    'WXPAY_JS': {},
                    'alipay': {}
                }

        tcb.bindEvent(document.body, {
            // 选择支付方式
            '.row-pay': function (e) {
                e.preventDefault();
                var $me = $(this),
                        pay_type = $me.attr('data-pay-type');
                if (tcb.inArray(pay_type, pay_type_arr) == -1) {
                    // 获取到的支付方式不在支付方式数组表中,将第一个支付方式当作默认支付方式
                    pay_type = pay_type_arr[0]
                }
                var $other_rows = $me.siblings('.row-pay');
                $me.find('.iconfont').addClass('icon-circle-tick');
                $other_rows.find('.icon-circle-tick').removeClass('icon-circle-tick');
                if (typeof pay_type_map[pay_type] !== 'undefined') {
                    var pay_params = {
                        order_id: window.__ORDER_ID,
                        pay_type: pay_type,
                        business_id: window.__BUSINESS_ID,
                        scan: window.__SCAN
                    };
                    // 支付地址
                    $('.btn-pay').attr('href', tcb.setUrl2('/Recycle/Engineer/CashierDesk/submit', pay_params))
                }
            },
            // 点击支付按钮
            '.btn-pay': function (e) {
                if ($('body').hasClass('page-disabled')) {
                    // 页面禁用,支付按钮不让点啦
                    return e.preventDefault()
                }
            },
            '.js-trigger-show-customer-draw-qrcode': function (e) {
                e.preventDefault();
                __showCustomerDrawQRCode($(this))
            },
            '.js-trigger-finish-pay': function (e) {
                e.preventDefault();
                __finishPay($(this))
            }
        })

        function __showCustomerDrawQRCode($trigger) {
            if (!($trigger && $trigger.length)) {
                return
            }
            var qrcode = $trigger.attr('data-qrcode');
            var dialog_str = '<img src="' + qrcode + '" alt=""><div class="tips"><a class="btn btn-success js-trigger-finish-pay" href="#">已完成付款</a></div>';

            tcb.showDialog(dialog_str, {
                className: 'qrcode-wrap',
                withMask: true,
                middle: true
            });
            tcb.statistic(['_trackEvent', 'xxg', '显示', '支付二维码', '1', ''])
        }

        function __finishPay($trigger) {
            if (!($trigger && $trigger.length)) {
                return
            }
            window.XXG.ajax({
                url: '/Recycle/Engineer/CashierDesk/status',
                data: {
                    order_id: window.__ORDER_ID,
                    business_id: window.__BUSINESS_ID
                },
                success: function (res) {
                    if (!res.errno) {
                        if (res.result) {
                            $.dialog.alert('支付成功!', function () {
                                window.history.back(-1);
                            })
                        } else {
                            $.dialog.alert('付款还未完成,请继续完成付款');
                        }
                    } else {
                        $.dialog.toast(res.errmsg)
                    }
                }
            })
        }
    })
}()
