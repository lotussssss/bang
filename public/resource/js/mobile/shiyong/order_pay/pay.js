// 订单支付
$ (function () {
    var
        $PageOrderPay = $ ('.page-order-pay')
    if (!($PageOrderPay && $PageOrderPay.length)) {
        return
    }

    // 处理分期数据
    $.each (window.Installment, function (bank_code, item) {
        var
            install = [],
            hb_rate = item[ 'hb_rate' ],
            payment = item[ 'payment' ],
            rate = item[ 'rate' ],
            // 支付总金额(包含手续费)
            total_pay = item[ 'payAmount' ],
            // 总的手续费
            total_fee = item[ 'payRate' ],
            k = 0

        $.each (hb_rate, function (stage, rate_val) {
            var
                pay_params = {
                    order_id : window.ORDER_ID,
                    bank_code : bank_code,
                    hb_by_stages : stage
                }

            install.push ({
                'stage'     : stage,
                // 总额(包含手续费)
                'total_pay' : tcb.formatMoney(total_pay[k], 2, 0),
                // 每一期分期费用(包含手续费)
                'per_pay'   : tcb.formatMoney(payment[k], 2, 0),
                // 总手续费
                'total_fee' : tcb.formatMoney(total_fee[k], 2, 0),
                // 每一期手续费
                'per_fee'   : tcb.formatMoney(rate[k], 2, 0),
                // 支付url
                'pay_url': tcb.setUrl('/shiyong/subpay', pay_params)
            })

            k++
        })

        window.Installment[ bank_code ] = install
    })

    var
        Swipe = Bang.SwipeSection,
        // 支付方式列表
        pay_type_arr = [ 'WXPAY_JS',
                         'alipay',
                         'alipay_hb',
                         'hdfk' ],
        // 支付方式映射表
        pay_type_map = {
            'WXPAY_JS'  : {},
            'alipay'   : {},
            'alipay_hb' : {
                installment : true
            },
            'hdfk'      : {}
        },
        // 分期付款数据表
        installment_map = window.Installment

    tcb.bindEvent (document.body, {
        // 选择支付方式
        '.row-pay'                         : function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                pay_type = $me.attr ('data-pay-type')

            if (tcb.inArray (pay_type, pay_type_arr) == -1) {
                // 获取到的支付方式不在支付方式数组表中,将第一个支付方式当作默认支付方式

                pay_type = pay_type_arr[ 0 ]
            }

            var // 支付方式详细数据
                pay_type_data = pay_type_map[ pay_type ]

            // 支持分期
            if (pay_type_data[ 'installment' ]) {
                // 花呗分期

                window.location.hash = 'pay_type=' + pay_type
                return
            }

            var
                $other_rows = $me.siblings ('.row-pay')

            $me.find ('.iconfont').addClass ('icon-circle-tick')
            $other_rows.find ('.icon-circle-tick').removeClass ('icon-circle-tick')


            if (typeof pay_type_map[ pay_type ] !== 'undefined') {
                // 花呗以外的其他支付方式

                var
                    pay_params = {
                        order_id : window.ORDER_ID,
                        bank_code : pay_type
                    }
                // 支付地址
                $('.btn-pay').attr ('href', tcb.setUrl('/shiyong/subpay', pay_params))
            }

        },
        // 选择花呗分期方式
        '.block-hua-bei .row-radio-select' : function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                $swipe = $me.closest ('.swipe-section'),
                // 分期数据位置
                pos = parseInt($me.attr('data-pos'), 10) || 0,
                // 支付方式
                pay_type = $me.attr('data-pay-type'),
                // 当前选择分期数据
                installment = installment_map[pay_type][pos]

            // 设置被选中状态
            $me.siblings ('.row-radio-select').find ('.icon-circle-tick').removeClass ('icon-circle-tick')
            $me.find ('.iconfont').addClass ('icon-circle-tick')

            // 分期总额
            $swipe.find ('.final-price-inner').html ('￥' + installment['total_pay'])
            // 手续费
            $swipe.find ('.final-price-service-fee').html ('含手续费：￥' + installment['total_fee'])
            // 支付地址
            $swipe.find ('.btn-pay').attr ('href', installment['pay_url'])
        },
        // 点击支付按钮
        '.btn-pay': function(e){

            if ($('body').hasClass('page-disabled')){
                // 页面禁用,支付按钮不让点啦

                e.preventDefault()

                return
            }
        }
    })

    $ (window).on ({
        'hashchange load' : function (e) {
            var
                hash = tcb.parseHash (),
                pay_type = hash
                    ? hash[ 'pay_type' ]
                    : ''

            if (tcb.inArray (pay_type, pay_type_arr) == -1) {
                // 获取到的支付方式不在支付方式数组表中,将第一个支付方式当作默认支付方式

                pay_type = pay_type_arr[ 0 ]
            }

            var // 支付方式详细数据
                pay_type_data = pay_type_map[ pay_type ]

            if (pay_type_data[ 'installment' ]) {

                // 打开花呗分期panel
                openHuaBeiPanel (pay_type)

            } else {

                // 关闭花呗分期panel
                closeHuaBeiPanel ()
            }
        }
    })

    // 打开花呗分期panel
    function openHuaBeiPanel (pay_type) {
        // 花呗

        var
            html_fn = $.tmpl ($.trim ($ ('#JsShiYongHuaBeiPanelTpl').html ())),
            html_st = html_fn ({
                pay_type: pay_type,
                installment_arr : installment_map[ pay_type ],
                total_pay       : installment_map[ pay_type ][ 0 ][ 'total_pay' ],
                total_fee       : installment_map[ pay_type ][ 0 ][ 'total_fee' ],
                pay_url         : installment_map[ pay_type ][ 0 ][ 'pay_url' ]
            })

        Swipe.getSwipeSection ('.hua-bei-panel')
        Swipe.fillSwipeSection (html_st)

        var
            $swipe = Swipe.getLastSwipeSection ()
        $swipe.show ();

        Swipe.doLeftSwipeSection (0)

        $swipe.find ('.bnt-close-swipe-section').on ('click', function (e) {
            e.preventDefault ()

            if (window.history.length > 1) {
                // history记录的长度大于1,那么直接回退

                window.history.go (-1)
            } else {
                // 否则就将hash强制设置为空字符串

                window.location.hash = ''
            }
        })

    }

    // 关闭花呗分期panel
    function closeHuaBeiPanel () {
        Swipe.backLeftSwipeSection ()
    }

    // 开启倒计时
    function startPayCountdown () {
        var wCountdown = $ ('.js-pay-countdown');
        if (wCountdown && wCountdown.length) {
            wCountdown.forEach (function (el, i) {
                var
                    $El = $ (el),
                    // 服务器当前时间(精确到毫秒)
                    current_time = window.current_time || (new Date ()).getTime (),
                    order_time = $El.attr ('data-order-time') || '', // 下单时间
                    locked_time = (window.locked_time || 900) * 1000; // 订单锁定时间段（即：从下单到关闭订单的时间段）

                // 下单时间
                order_time = Date.parse (order_time.replace (/-/g, '/')) || 0

                var // 订单关闭时间
                    lock_endtime = order_time + locked_time

                // 当前时间与下单时间的时间差，大于锁定时间，那么表示订单已经关闭，不再倒计时
                if (current_time > lock_endtime) {
                    // 给body上加disabled,用来禁止某些操作
                    $('body').addClass('page-disabled')

                    // 倒计时到期，关闭订单
                    $El.closest ('.row-pay-countdown').html ('交易关闭')

                    $ ('.btn-pay').addClass ('btn-disabled')

                    return
                }

                // 初始化倒计时
                Bang.startCountdown (lock_endtime, current_time, $El, {
                    'end' : function () {
                        // 给body上加disabled,用来禁止某些操作
                        $('body').addClass('page-disabled')

                        // 倒计时到期，关闭订单
                        $El.closest ('.row-pay-countdown').html ('交易关闭')

                        $ ('.btn-pay').addClass ('btn-disabled')
                    }
                })

            })
        }

    }



    // 开启倒计时
    startPayCountdown ()
})