;/**import from `/resource/js/page/liangpin/tinfo/login.js` **/
// 优品下单页面，登陆
$ ( function () {

    // 登录表单相关功能
    window.Bang.LoginFormByMobile({
        form_action: '/youpin/aj_my_login',
        selector_form: W('#JsTInfoMobileLoginForm'),
        selector_get_secode: '.user-mobile-check-order-panel-getsecode',
        selector_vcode_img: '.vcode-img',
        class_get_secode_disabled: 'user-mobile-check-order-panel-getsecode-disabled'
    }, function(res){
        window.location.href = window.location.href
    })

    // 下单页面登录面板的关闭按钮
    var $BackClose = W('#JsTInfoMobileLoginForm').ancestorNodes('.tinfo-login-panel').query('.btn-go-back-close')
    if ($BackClose && $BackClose.length){
        $BackClose.on('click', function(e){
            e.preventDefault();

            window.history.back();

            setTimeout(function(){
                var query = tcb.queryUrl(window.location.search),
                    product_id = query['product_id'];

                window.location.href = tcb.setUrl2('/youpin/product/'+product_id+'.html', {})
            }, 1000);
        });
    }
} )

;/**import from `/resource/js/page/liangpin/cashier/combinePay.js` **/
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


;/**import from `/resource/js/page/liangpin/cashier/cashier.js` **/
/**
 * @fileOverview 优品支付业务逻辑
 * @author qinguangdong
 * @version 1.1.0
 */
;(function () {
    var $ = window.jQuery
    var W = window.W
    var Bang = window.Bang = window.Bang || {}

    //事件
    function initEvent() {
        var hidden = 'hidden',
            active = 'active',
            disabled = 'disabled'
        var $cashier = $('.cashier-bd'),
            $opt = $('.ca-opt-info'),
            $mod = $('.cashier-mod'),
            $tab = $('.cashier-tab'),
            $form = $('#pay_form'),
            $bank = $('#bank_code'),
            $period = $('.pay-period-list'),
            $stages = $('#hb_by_stages'),
            $stages_jdiou = $('#jd_by_stages'),
            $payrate = $('#payrate'),
            $button = $('.pay-button'),
            $button_wx = $('.pay-button-wx')
        //tab
        $tab.on('click', 'li', function () {

            var me = $(this)
            if (me.hasClass('disabled')) {
                return
            }
            var type = me.attr('data-type')
            var mod = me.attr('data-mod')
            $tab.find('li').removeClass(active)
            $mod.addClass(hidden)
            $('.' + mod + '-block').removeClass(hidden)
            $tab.find('li[data-mod=\'' + mod + '\']').addClass(active)
            $bank.val(type)
            if (type == 'alipay_hb') {

                var sel = $period.find('.' + active)
                var period = sel.attr('period') * 1 //付款分期数
                var amount = sel.attr('amount') * 1//分期总额
                var payrate = sel.attr('payrate') * 1//含手续费
                var rate = sel.attr('rate')

                if (rate == 0) {
                    $payrate.html('¥0（已减免：<del>' + payrate + '</del>元）')
                } else {
                    $payrate.html('¥' + payrate)
                }
                $('#amount').html('¥' + amount)
                $stages.val(period)
                $stages_jdiou.val('')
            } else if (type == 'suning_scan') {
                if ($('#suning_scan_qrcode')[0].src.length <= 0) {
                    $('#suning_scan_qrcode').attr('src', $('#suning_scan_qrcode').data('url'))
                }

                $stages.val('')
                $stages_jdiou.val('')
                $payrate.html('')
            } else if (type == 'combinePay') {
                window.YouPinCombinePay.setupCombinePay()
                $stages.val('')
                $stages_jdiou.val('')
                $payrate.html('')
            } else if(type =='jd_iou'){
                var sel = $period.find('.' + active)[1]
                var period = $(sel).attr('period') * 1 //付款分期数
                var amount = $(sel).attr('amount') * 1//分期总额
                var payrate = $(sel).attr('payrate') * 1//含手续费
                var $jdiou_payrate=$('#jdiou_payrate')
                $jdiou_payrate.html('¥' + payrate)
                $('#jdiou_amount').html('¥' + amount)
                $stages.val('')
                $stages_jdiou.val(period)
            } else {
                $stages.val('')
                $stages_jdiou.val('')
                $payrate.html('')
            }
        })
        //hbfq
        $period.on('click', 'li', function () {
            var me = $(this)
            $('.cashier-tab li').each(function(){
                if($(this).attr("class")=="active"){
                    if($(this).text().trim()=='花呗分期'){
                    //   之前的逻辑
                        me.siblings().removeClass(active)
                        me.addClass(active)
                        var amount = me.attr('amount') * 1     //分期总额
                        var payrate = me.attr('payrate') * 1 //含手续费
                        var period = me.attr('period') * 1 //付款分期数
                        var rate = me.attr('rate')
                        $('#amount').html('¥' + amount)

                        if (rate == 0) {
                            $payrate.html('¥0（已减免：<del>' + payrate + '</del>元）')
                        } else {
                            $payrate.html('¥' + payrate)
                        }

                        $stages.val(period)
                        $stages_jdiou.val('')
                    }else{
                    //    白条的逻辑
                        me.siblings().removeClass(active)
                        me.addClass(active)
                        var amount = me.attr('amount') * 1     //分期总额
                        var payrate = me.attr('payrate') * 1 //含手续费
                        var period = me.attr('period') * 1 //付款分期数
                        // var rate = me.attr('rate')
                        $('#jdiou_amount').html('¥' + amount)
                        $('#jdiou_payrate').html('¥' + payrate)
                        // if (rate == 0) {
                        //     $('#jdiou_payrate').html('¥0（已减免：<del>' + payrate + '</del>元）')
                        // } else {
                        //     $('#jdiou_payrate').html('¥' + payrate)
                        // }
                        $stages.val('')
                        $stages_jdiou.val(period)
                    }
                }
            })

        })
        //order
        $opt.on('click', function () {
            $cashier.slideToggle(500)
        })
        //微信已完成支付
        $button_wx.on('click', function () {
            var me = $(this)
            if (me.hasClass(disabled)) {
                window.alert('因超时未支付，该订单已关闭')
                return
            }
            var order_id = $('#order_id').val()
            getOrderStatus(order_id, function (errno, errmsg) {
                var $error = me.parent().find('.error')
                if (errno == '0') {
                    window.location.href = '/liangpin_my/order_detail/?order_id=' + order_id + '&paysuccess=1'
                } else {
                    $error.html(errmsg)
                }
            })
        })
        //立即充值
        $button.on('click', function () {
            var me = $(this)
            if (me.hasClass(disabled)) {
                window.alert('因超时未支付，该订单已关闭')
                return
            }
            //花呗分期付款
            if ($.trim($('#bank_code').val()) == 'alipay_hb' && $period.find('.' + active).length == 0) {
                window.alert('请选择一种分期方式')
                return
            }
            var channel = $bank.val()
            if (channel != 'hdfk') {
                var payPanel = tcb.panel('', $('#LiangpinPaymentConfirmPanelTpl').html(), {
                    'className': 'liangpin-payment-confirm-panel-wrap'
                })
                $(payPanel.oWrap).off('click').on('click', 'span', function (e) {
                    var pay = $(e.target).attr('data-hoom')
                    var order_id = $('#order_id').val()
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
            $form.submit()
        })

    //    京东白条支付
    //     $('.pay-button_jdiou').on('click', function () {
    //         var me = $(this)
    //         if (me.hasClass(disabled)) {
    //             window.alert('因超时未支付，该订单已关闭')
    //             return
    //         }
    //         console.log('222')
    //         // console.log('id',$form.find().val(),'bank_code','hb_by_stages')
    //         $form.submit()
    //     //$("input[name='bank_code']")
    //     //$form.find()
    //
    //     })
    }

    //订单倒计时
    function initCountDown() {
        var $status = $('.ca-status-mod')
        var now = $status.attr('now').replace(/-/g, '/'),   //当前服务器时间
            begin = $status.attr('begin').replace(/-/g, '/'), //订单创建时间
            pid = $status.attr('pid'),                      //商品ID
            curtime = (new Date(now).getTime() || new Date().getTime()) * 1,
            locktime = (new Date(begin).getTime()) * 1 + 900000
        if (locktime > curtime) {
            Bang.startCountdown(locktime, curtime, $('#countdown'), {
                //倒计时结束
                'end': function () {
                    window.location.reload()
                }
            })
        }
    }

    //初始数据
    function initData() {
        var bank = $('#bank_code').val()
        var $period = $('.pay-period-list')
        $('#suning_scan_qrcode').error(function () {
            $(this).attr('src', 'https://p2.ssl.qhmsg.com/t011ee2bfa713d0c8a6.png')
        })
        if (bank == 'alipay_hb') {
            var sel = $period.find('.active')
            var amount = sel.attr('amount') * 1//分期总额:
            var payrate = sel.attr('payrate') * 1//含手续费
            var rate = sel.attr('rate')

            if (rate == 0) {
                $('#payrate').html('¥0（已减免：<del>' + payrate + '</del>元）')
            } else {
                $('#payrate').html('¥' + payrate)
            }
            $('#amount').html('¥' + amount)
        }
        if (bank == 'suning_scan') {
            $('#suning_scan_qrcode').attr('src', $('#suning_scan_qrcode').data('url'))
        }
    }

    //重置登录框置
    function initLogin() {
        var $LoginPanel = W('.tinfo-login-panel')
        if ($LoginPanel && $LoginPanel.length) {
            var
                rect = $LoginPanel.getRect(),
                width = rect['width'],
                win_rect = QW.DomU.getDocRect(),
                win_width = win_rect['width'],
                doc_width = win_rect['scrollWidth'],
                doc_height = win_rect['scrollHeight'],
                left = (win_width - width) / 2
            if (left > 0) {
                $LoginPanel.css({
                    'left': left,
                    'margin': '0'
                })
            }
            var $LoginPanelMask = W('.tinfo-login-cover')
            $LoginPanelMask.css({
                'width': doc_width,
                'height': doc_height
            })
        }
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

    $(function () {
        initCountDown()
        initEvent()
        initLogin()
        initData()
    })
}())


