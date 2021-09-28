// 订单支付
;
(function () {
    var
        Bang = window.Bang = window.Bang || {}

    //事件
    function initEvent () {
        var
            hidden = "hidden",
            active = "active",
            disabled = "disabled"

        var
            $cashier = $ (".cashier-bd"),
            $opt = $ (".ca-opt-info"),
            $mod = $ (".cashier-mod"),
            $tab = $ (".cashier-tab"),
            $form = $ ("#pay_form"),
            $bank = $ ("#bank_code"),
            $period = $ (".pay-period-list"),
            $stages = $ ("#hb_by_stages"),
            $payrate = $ ("#payrate"),
            $button = $ (".pay-button"),
            $button_wx = $ (".pay-button-wx")

        // 切换支付方式tab
        $tab.on ("click", "li", function () {
            var
                me = $ (this)

            var
                type = me.attr ("data-type"),
                mod = me.attr ("data-mod")

            $tab.find ("li").removeClass (active);
            $mod.addClass (hidden);
            $ ("." + mod + "-block").removeClass (hidden);
            $tab.find ("li[data-mod='" + mod + "']").addClass (active);
            $bank.val (type)

            if (type == "alipay_hb") {
                // 花呗分期

                var sel = $period.find ("." + active);
                var period = sel.attr ("period") * 1; //付款分期数
                var amount = sel.attr ("amount") * 1;//分期总额
                var payrate = sel.attr ("payrate") * 1;//含手续费
                $ ("#amount").html ("¥" + amount);
                $payrate.html ("¥" + payrate);
                $stages.val (period)

            } else {

                $stages.val ("");
                $payrate.html ("");
            }
        })

        // 切换分期方案 hbfq
        $period.on ("click", "li", function () {
            var
                $me = $ (this)

            $me.siblings ().removeClass (active)
            $me.addClass (active)

            var
                amount = $me.attr ("amount") * 1,     //分期总额
                pay_rate = $me.attr ("payrate") * 1,  //含手续费
                period = $me.attr ("period") * 1      //付款分期数

            $ ("#amount").html ("¥" + amount)
            $payrate.html ("¥" + pay_rate)
            $stages.val (period)
        })

        // 查看订单详情
        $opt.on ("click", function () {
            $cashier.slideToggle (500);
        })

        // 微信已完成支付
        $button_wx.on ("click", function () {
            var
                $me = $ (this)
            if ($me.hasClass (disabled)) {
                window.alert ('因超时未支付，该订单已关闭');
                return
            }

            var
                order_id = $ ("#order_id").val ()

            getOrderStatus (order_id, function (errno, errmsg) {
                var
                    $error = $me.parent ().find (".error")
                if (errno == "0") {

                    window.location.replace ('/shiyong/paysuc?order_id=' + order_id);
                } else {
                    $error.html (errmsg);
                }
            });
        })

        // 立即支付
        $button.on ("click", function () {
            var
                $me = $ (this)

            if ($me.hasClass (disabled)) {
                window.alert ('因超时未支付，该订单已关闭');
                return;
            }
            //花呗分期付款
            if ($.trim ($ ("#bank_code").val ()) == "alipay_hb" && $period.find ("." + active).length == 0) {
                window.alert ('请选择一种分期方式');
                return;
            }
            var
                channel = $bank.val ()
            if (channel != "hdfk") {
                var
                    payPanel = tcb.showDialog($.trim( $ ("#JsPaymentConfirmPanelTpl").html () ), {
                        className: 'common-payment-confirm-panel-wrap',
                        withClose: false
                    })

                payPanel.wrap.off ("click").on ("click", "span", function (e) {
                    var
                        pay = $ (e.target).attr ("data-hoom"),
                        order_id = $ ("#order_id").val ()

                    var
                        $error = payPanel.wrap.find (".error");

                    switch (pay) {
                        case "close" :

                            tcb.closeDialog()

                            break
                        case "finish" :

                            getOrderStatus (order_id, function (errno, errmsg) {
                                if (errno == "0") {

                                    window.location.replace ('/shiyong/paysuc?order_id=' + order_id)
                                } else {
                                    $error.html (errmsg)
                                }
                            })

                            break
                        case "reset" :
                            getOrderStatus (order_id, function (errno, errmsg) {
                                if (errno == "0") {

                                    window.location.replace ('/shiyong/paysuc?order_id=' + order_id)
                                } else {
                                    tcb.closeDialog()
                                }
                            })

                            break
                    }

                })

            }
            $form.submit ()
        })
    }

    //订单倒计时
    function initCountDown () {
        var
            $status = $ (".ca-status-mod")
        if ( !($status && $status.length)){
            return
        }

        var
            now = $status.attr ("now").replace (/-/g, "/"),   //当前服务器时间
            begin = $status.attr ("begin").replace (/-/g, "/"), //订单创建时间
            pid = $status.attr ("pid"),                      //商品ID
            cur_time = (new Date (now).getTime () || new Date ().getTime ()) * 1,
            lock_time = (new Date (begin).getTime ()) * 1 + (window.locked_time || 900)*1000

        if (lock_time > cur_time) {
            Bang.startCountdown (lock_time, cur_time, $ ("#countdown"), {
                //倒计时结束
                "end" : function () {
                    window.location.reload ();
                }
            })
        }
    }

    //初始数据
    function initData () {
        var
            bank = $ ("#bank_code").val ()

        var
            $period = $ (".pay-period-list")

        if (bank == "alipay_hb") {
            // 默认支付为 花呗分期

            var
                sel = $period.find (".active")

            var
                amount = sel.attr ("amount") * 1,  //分期总额:
                pay_rate = sel.attr ("payrate") * 1 //含手续费

            $ ("#amount").html ("¥" + amount)
            $ ("#payrate").html ("¥" + pay_rate)
        }
    }

    // 获取订单状态
    function getOrderStatus (order_id, callback) {
        $.ajax ({
            url      : "/shiyong/getOrderStatus?order_id=" + order_id,
            dataType : 'json',
            error    : function () {
                setTimeout (function () {

                    getOrderStatus (order_id, callback);
                }, 5000);
            },
            success  : function (data) {
                callback && callback (data.errno, data.errmsg)
            }
        });
    }

    $ (function () {

        var
            $PageOrderPay = $ ('.page-order-pay')
        if (!($PageOrderPay && $PageOrderPay.length)) {
            return
        }

        initCountDown ()
        initEvent ()
        initData ()

    })

} ())

