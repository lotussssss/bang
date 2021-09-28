// 修修哥，取消订单、补差价，退款支付平台
!function(){
    if (window.__PAGE != 'xxg-engineer-refund-cashier-desk') {
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
                var
                    $me = $(this),
                    pay_type = $me.attr('data-pay-type');
                if (tcb.inArray(pay_type, pay_type_arr) == -1) {
                    // 获取到的支付方式不在支付方式数组表中,将第一个支付方式当作默认支付方式
                    pay_type = pay_type_arr[0]
                }
                var
                    $other_rows = $me.siblings('.row-pay');
                $me.find('.iconfont').addClass('icon-circle-tick');
                $other_rows.find('.icon-circle-tick').removeClass('icon-circle-tick');
                if (typeof pay_type_map[pay_type] !== 'undefined') {
                    var pay_params = {
                        order_id: window.__ORDER_ID,
                        pay_type: pay_type,
                        refund_type: window.__REFUND_TYPE
                    };
                    // 支付地址
                    $('.btn-pay').attr('href', tcb.setUrl2('/m/submitEngineerRefundPay', pay_params))
                }
            },
            // 点击支付按钮
            '.btn-pay': function (e) {
                if ($('body').hasClass('page-disabled')) {
                    // 页面禁用,支付按钮不让点啦
                    return e.preventDefault()
                }
            }
        })
    })

}()
