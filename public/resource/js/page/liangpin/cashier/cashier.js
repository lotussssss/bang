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

