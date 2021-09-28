// 提交订单
Dom.ready(function(){


    // 验证商品订单提交表单
    function validProductSubOrderForm(wForm){
        if (!(wForm&&wForm.length)) {
            return false;
        }
        var flag = true;

        var wMobileOrder = W('.mobile-order-block');
        if (wMobileOrder.length) {
            var wOrderMobile = W('#MobileOrderMobile'),
                mobile_val = wOrderMobile.val().trim();
            if(!tcb.validMobile(mobile_val)){
                flag = false;
                wOrderMobile.shine4Error().focus();
            }

            var wOrderSecode = W('#MobileOrderSecode'),
                secode_val = wOrderSecode.val().trim();
            if (!secode_val) {
                if (flag) {
                    wOrderSecode.shine4Error().focus();
                } else {
                    wOrderSecode.shine4Error();
                }
                flag = false;
            }
            if (!flag) {
                return flag;
            }
            W('[name="buyer_mobile"]').val(mobile_val);
            W('[name="secode"]').val(secode_val);
        }
        // 收货信息id
        var wYjid = wForm.query('#ProductYJId');
        if (!(wYjid&&wYjid.length&&wYjid.val().trim())) {
            flag = false;
            var wAddAddrInfoForm = W('#AddAddrInfoForm');
            if (wAddAddrInfoForm.length) {
                tcb.setScrollTop(wAddAddrInfoForm.getRect().top-50);
                wAddAddrInfoForm.query('.add-addr-submit').click();
            } else {
                alert('请选择收货人信息');
                tcb.setScrollTop(W('.addrinfo-block-wrap').getRect().top);
            }
            return flag;
        }

        // // 收货信息id
        // var wBankCode = wForm.query('[name="bank_code"]');
        // if (!(wBankCode&&wBankCode.length&&wBankCode.val().trim())) {
        //     flag = false;
        //     var wBankLine = W('.line-bank');
        //     if (wBankLine.length) {
        //         tcb.setScrollTop(wBankLine.getRect().top-42);
        //         tcb.errorBlink(wBankLine.query('li'));
        //     } else {
        //         alert('请选择支付方式');
        //         tcb.setScrollTop(wBankLine.getRect().top-42);
        //     }
        //     return flag;
        // }


        return flag;
    }
    // 提交订单
    var wProductSubOrderForm = W('#LiangpinProductSubOrderForm');
    if (wProductSubOrderForm.length) {

        wProductSubOrderForm.on('submit', function(e){
            e.preventDefault();

            var
                wMe = W(this)
            // 表单处于不可用状态
            if (tcb.isFormDisabled(wMe)){

                return false
            }
            // 将表单置于不可用状态
            tcb.setFormDisabled(wMe)

            if(!validProductSubOrderForm(wMe)){

                // 释放表单的不可用状态
                tcb.releaseFormDisabled(wMe)

                return false
            }

            // 提交异步表单
            tcb.ajax({
                url: wMe[0],
                method: 'post',
                onsucceed: function(res){
                    try {
                        res = JSON.parse (res)

                        if (!res.errno) {

                            var
                                result = res.result,
                                order_id = result.order_id

                            // var
                            //     bank_code_map = [
                            //         // 手机支付宝
                            //         'mobile',
                            //         // 微信扫码支付
                            //         'WXPAY_JS',
                            //         // 货到付款
                            //         'hdfk',
                            //         // 其他支付方式
                            //         'other'
                            //     ],
                            //     bank_code_map_handle = {
                            //         // 手机支付宝
                            //         'mobile'   : OrderSuccessAtMobile,
                            //         // 微信扫码支付
                            //         'WXPAY_JS' : OrderSuccessAtWXPay,
                            //         // 货到付款
                            //         'hdfk'     : OrderSuccessAtHDFK,
                            //         // 其他支付方式
                            //         'other'    : OrderSuccessAtDefault
                            //     },
                            //     // 支付方式代码
                            //     bank_code = wMe.query ('[name="bank_code"]').val ()
                            //
                            // if (tcb.inArray (bank_code, bank_code_map) == -1) {
                            //     bank_code = bank_code_map[ bank_code_map.length - 1 ]
                            // }
                            //
                            // // 执行指定支付方式的处理函数
                            // bank_code_map_handle[ bank_code ] (result)

                            var params = {
                                order_id : order_id
                                },
                                huabei_stage = tcb.queryUrl(window.location.search, 'huabei_stage')
                            if (huabei_stage){
                                params['huabei_stage'] = huabei_stage
                            }
                            window.location.href = tcb.setUrl('/youpin/cashier', params)

                            //location.href = tcb.setUrl('/youpin/subpay/?order_id='+res.result.order_id, {"from": tcb.queryUrl(location.href,'from')});
                        } else {
                            alert (res.errmsg)

                            tcb.releaseFormDisabled (wMe)
                        }
                    } catch (ex) {
                        alert ('系统异常，请刷新页面重试')

                        tcb.releaseFormDisabled (wMe)
                    }
                },
                ontimeout: function(){
                    alert ('系统超时，请刷新页面重试')

                    tcb.releaseFormDisabled (wMe)
                },
                onerror: function(){
                    alert ('系统异常，请刷新页面重试')

                    tcb.releaseFormDisabled (wMe)
                }
            })

        })

    }

    // 开始支付倒计时
    function startPayCountdown(wCountdown){
        var
            curtime = (new Date()).getTime(),
            remain_time = window.remain_time || window.locked_time || 1800; // 倒计时剩余时间

        var lock_endtime = curtime + remain_time*1000;

        Bang.startCountdown(lock_endtime, curtime, wCountdown, {
            'end': function(){
                window.location.reload();
            }
        })
    }
    // 验证支付是否成功
    function validPaySuccess ( order_id, callback ) {
        order_id = order_id || ''

        var
            request_url = '/youpin/doGetPaystatus?order_id='+order_id

        QW.Ajax.get ( request_url, function ( res ) {
            var
            // 支付成功标识
            success_flag = false

            try{
                res = JSON.parse ( res )

                if ( !res[ 'errno' ] ) {

                    var
                        result = res[ 'result' ]

                    if ( result['payStatus']=='1'){
                        success_flag = true
                    }

                    typeof callback === 'function' && callback ( success_flag )

                }
                else {
                    //typeof callback === 'function' && callback ( success_flag )

                    alert ( res[ 'errmsg' ] )
                }

            } catch (ex){

                //typeof callback === 'function' && callback ( success_flag )

            }

        } )
    }

    // 订单提交成功[微信支付]
    function OrderSuccessAtWXPay (result) {
        var
            order_id = result[ 'order_id' ],
            qrCodeSrc = '/youpin/qrcode/?order_id=' + order_id + '&weixin_pay=1'

        var
            html_str = '<div style="padding:10px 10px 0 10px;">'
                + '<div class="pay-countdown js-pay-countdown clearfix" '
                + 'data-descbefore="您只剩" '
                + 'data-descbehind="支付时间" '
                + 'data-daytxt="" '
                + 'data-hourtxt="小时" data-minutetxt="分" data-secondtxt="秒"></div>'
                + '<h2 style="font-weight:bold; text-align:center">请用手机扫描下面的二维码进行支付</h2>'
                + '<div style="text-align:center">'
                + '<img style="background:url(https://p.ssl.qhimg.com/t017ee3be501e423c98.gif) no-repeat center" width="220" height="220" src="' + qrCodeSrc + '">'
                + '</div>'
                + '<div id="WXPayNotSuccessTip" style="display:none;text-align:center;color: #f30;">还未收到您的付款，请稍候再试</div>'
                + '</div>';

        var
            query = tcb.queryUrl (location.href),
            redirect_params = {
                order_id   : order_id,
                from       : query[ 'from' ],
                iframe     : query[ 'iframe' ]
            },
            alertObj = tcb.alert ("微信支付", html_str, {
                btn_name : '已完成支付',
                width    : 300//,
                //height:350
            }, function () {

                validPaySuccess (order_id, function (success) {

                    if (success) {
                        // 支付成功

                        redirect_params['paysuccess'] = 1

                        window.location.href = tcb.setUrl ('/liangpin_my/order_detail', redirect_params)
                    }
                    else {
                        // 未支付成功
                        W ('#WXPayNotSuccessTip').show ()
                    }

                })

                // return false取消关闭panel功能
                return false
            })

        // 关闭弹层跳转到订单详情页面
        alertObj.on ("afterhide", function () {

            window.location.href = tcb.setUrl ('/liangpin_my/order_detail', redirect_params)
        })

        var
            wCountdown = W ('.js-pay-countdown')

        // 开始支付倒计时
        startPayCountdown (wCountdown)

    }

    // 订单提交成功[手机支付]
    function OrderSuccessAtMobile (result) {
        var
            order_id = result[ 'order_id' ],
            qrCodeSrc = '/youpin/qrcode/?order_id=' + order_id

        var
            html_str = '<div style="padding:10px;">' +
                '<h2 style="font-weight:bold; text-align:center">请用手机扫描下面的二维码进行支付</h2>' +
                '<div style="text-align:center">' +
                '<img style="background:url(https://p.ssl.qhimg.com/t017ee3be501e423c98.gif) no-repeat center" width="220" height="220" src="' + qrCodeSrc + '">' +
                '</div></div>'

        var
            query = tcb.queryUrl (location.href),
            redirect_params = {
                order_id   : order_id,
                from       : query[ 'from' ],
                iframe     : query[ 'iframe' ]
            },
            alertObj = tcb.alert ("手机支付宝", html_str, {
            width  : 300,
            height : 350
        }, function () {return true})

        // 关闭弹层跳转到订单详情页面
        alertObj.on ("afterhide", function () {

            window.location.href = tcb.setUrl ('/liangpin_my/order_detail', redirect_params)
        })

    }

    // 订单提交成功[货到付款]
    function OrderSuccessAtHDFK (result) {
        var
            order_id = result[ 'order_id' ],
            tmpl_fn = W ('#JsLiangpinOrderSuccessHDFKPanelTpl').html ().trim ().tmpl (),
            tmpl_st = tmpl_fn ({
                'order_id'         : order_id,
                'order_price'      : result[ 'real_amount' ],
                'customer_name'    : result[ 'yj_receiver' ],
                'customer_mobile'  : result[ 'yj_mobile' ],
                'customer_address' : result[ 'yj_addr' ],
                'url_redirect'     : tcb.setUrl ('/youpin')
            });

        var
            query = tcb.queryUrl (location.href),
            redirect_params = {
                order_id   : order_id,
                from       : query[ 'from' ],
                iframe     : query[ 'iframe' ]
            },
            alertObj = tcb.panel ('', tmpl_st, { 'className' : 'liangpin-pay-confirm-panel-wrap' });

        // 关闭弹层跳转到订单详情页面
        alertObj.on ("afterhide", function () {

            window.location.href = tcb.setUrl ('/liangpin_my/order_detail', redirect_params)
        })

    }

    // 订单提交成功[默认方式提交成功]
    function OrderSuccessAtDefault (result) {

        var
            order_id = result['order_id' ],
            query = tcb.queryUrl (location.href),
            redirect_params = {
                order_id   : order_id,
                from       : query[ 'from' ],
                iframe     : query[ 'iframe' ]
            },
            tmpl_data = {
                'order_id'         : result[ 'order_id' ],
                'order_price'      : result[ 'real_amount' ],
                'customer_name'    : result[ 'yj_receiver' ],
                'customer_mobile'  : result[ 'yj_mobile' ],
                'customer_address' : result[ 'yj_addr' ],
                'url_mod_order'    : tcb.setUrl ('/liangpin_my/order_detail', redirect_params),
                'url_pay_order'    : tcb.setUrl ('/youpin/subpay', redirect_params)
            },
            tmpl_fn = W ('#LiangpinPayConfirmPanelTpl').html ().trim ().tmpl (),
            tmpl_st = tmpl_fn (tmpl_data),
            alertObj = tcb.panel ('', tmpl_st, { 'className' : 'liangpin-pay-confirm-panel-wrap' })

        // 关闭弹层跳转到订单详情页面
        alertObj.on ("afterhide", function () {

            window.location.href = tmpl_data['url_mod_order']
        })

        var
            wCountdown = W ('.js-pay-countdown')

        // 开始支付倒计时
        startPayCountdown (wCountdown)

    }

    
})
