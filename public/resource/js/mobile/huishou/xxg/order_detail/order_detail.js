// 修修哥订单详情页
!function(){
    if (window.__PAGE!=='xxg-order-detail'){
        return
    }

    $(function(){
        window.xxgEditForm = xxgEditForm
        if (tcb.queryUrl(window.location.search, 'uploadPicture') && window.__ORDER_INFO.status != 13) {
            window.showPageUploadPicture && window.showPageUploadPicture({
                order_id: window.__ORDER_INFO.parent_id,
                price: window.__ORDER_INFO.final_price,
                category_id: window.__ORDER_INFO.category_id
            })
        }

        tcb.bindEvent(document.body, {
            // 工程师订单操作
            '.btn-parent-order-act': function(e){
                e.preventDefault()

                var $me = $(this),
                    act = $me.attr('data-act'),
                    parent_id = $me.attr('data-id'),
                    now_status = $me.attr('data-status'),
                    next_status= $me.attr('next-status')


                if ($me.hasClass('btn-disabled')) {
                    return
                }

                var txt = $me.html()
                $me.addClass('btn-disabled').html('处理中...')

                var request_url = tcb.setUrl('/m/aj_xxg_parent_status', {
                    'parent_id': parent_id,
                    'now_status': now_status,
                    'next_status': next_status
                })

                $.getJSON(request_url, function(res){
                    if (!res.errno) {
                        window.location.reload()
                    } else {
                        alert(res.errmsg)
                        $me.removeClass('btn-disabled').html(txt)
                    }
                })
            },

            // 工程师订单操作
            '.btn-order-act': function(e){
                e.preventDefault()

                var $me = $(this),
                    act = $me.attr('data-act'),
                    order_id = $me.attr('data-id'),
                    status = $me.attr('data-status'),
                    txt, request_url

                if ($me.hasClass('btn-disabled')) {
                    return
                }

                if (act=='quxiao'){
                    var params_data = {
                            'order_id' : order_id
                        },
                        html_str = $.tmpl( $.trim($('#JsXxgCancelOrderTpl').html()) )(params_data)

                    var config = {
                        withMask: true,
                        middle: true
                    }

                    var dialog = tcb.showDialog(html_str, config)

                    xxgEditForm(dialog.wrap.find('form'))

                    return
                }

                if(act == 'wancheng'){
                    txt = $me.html()
                    $me.addClass('btn-disabled').html('处理中...')

                    request_url = tcb.setUrl('/m/aj_wancheng_order', {
                        'order_id': order_id,
                        'status': status
                    })

                    $.getJSON(request_url, function(res){
                        if (!res.errno) {
                            window.__SHOW_CASH_FLAG = res.result.show_cash_flag

                            var msg = '<p style="font-size: .12rem">确定服务完成</p><p style="color: #FF0202">'
                            switch (window.__CHANNEL_TYPE) {
                                case 2:
                                    msg = '旧机款将发放至用户下单的易付宝或银行卡账户.'
                                    break
                                case 3:
                                    msg = '旧机款将以"支付宝红包"形式,发放至用户下单的支付宝账户.'
                                    break
                            }
                            msg += '由于近期价格波动较大,回收完成后,请尽快将手机邮寄给同城帮对应地址!</p>'
                            $.dialog.alert(msg, function () {
                                window.location.reload()
                            })
                        } else {
                            alert(res.errmsg)
                            $me.removeClass('btn-disabled').html(txt)
                        }
                    })
                } else {
                    txt = $me.html()
                    $me.addClass('btn-disabled').html('处理中...')

                    request_url = tcb.setUrl('/m/aj_xxg_status', {
                        'order_id': order_id,
                        'status': status
                    })

                    $.getJSON(request_url, function(res){
                        if (!res.errno) {
                            window.location.reload()
                        } else {
                            alert(res.errmsg)
                            $me.removeClass('btn-disabled').html(txt)
                        }
                    })
                }
            },
            // 编辑成交价
            '.btn-edit-final-price': function(e){
                e.preventDefault()

                var $me = $(this),
                    $order_id = $me.attr('data-value')

                var params_data = {
                        'order_id':$order_id
                    },
                    html_str = $.tmpl( $.trim($('#JsXxgEditFinalPriceTpl').html()) )(params_data)

                var config = {
                    withMask: true,
                    middle: true
                }

                var dialog = tcb.showDialog(html_str, config)

                xxgEditForm(dialog.wrap.find('form'))
            },
            // 编辑IMEI号
            '.btn-edit-imei': function(e){
                e.preventDefault()

                var $me = $(this),
                    $order_id = $me.attr('data-value')

                var params_data = {
                        'order_id':$order_id
                    },
                    html_str = $.tmpl( $.trim($('#JsXxgEditImeiTpl').html()) )(params_data)

                var config = {
                    withMask: true,
                    middle: true
                }

                var dialog = tcb.showDialog(html_str, config)

                xxgEditForm(dialog.wrap.find('form'))

            },
            // 编辑发票
            '.btn-edit-invoice': function (e) {
                e.preventDefault()

                var $me = $(this)

                var params_data = {
                        'invoice_title': $me.attr('data-invoice_title'),
                        'invoice_addr': $me.attr('data-invoice_addr'),
                        'invoice_name': $me.attr('data-invoice_name')
                    },
                    html_str = $.tmpl( $.trim($('#JsXxgEditInvoiceTpl').html()) )(params_data)

                var config = {
                    withMask: true,
                    middle: true
                }

                var dialog = tcb.showDialog(html_str, config)

                xxgEditForm(dialog.wrap.find('form'))

            },

            // 编辑手机号
            '.btn-edit-chongzhimobile': function(e){
                e.preventDefault()

                var $me = $(this)

                var html_str = $.tmpl( $.trim($('#JsXxgEditMobileTpl').html()) )()
                var config = {
                    withMask: true,
                    middle: true
                }
                var dialog = tcb.showDialog(html_str, config)

                xxgEditForm(dialog.wrap.find('form'), function($form, callback){
                    var $mobile = $form.find('[name="mobile"]'),
                        mobile = $mobile.val()

                    if (!tcb.validMobile(mobile)) {
                        $.errorAnimate($mobile.focus())
                        return
                    }
                })

            },

            // 填写快递单号
            '.btn-view-hs-express': function(e){
                e.preventDefault()

                var $me = $(this),
                    order_id = $me.attr('data-value')

                var params_data = {
                        'order_id':order_id
                    },
                    html_str = $.tmpl( $.trim($('#JsXxgEditExpressTpl').html()) )(params_data)

                var config = {
                    withMask: true,
                    middle: true
                }

                var dialog = tcb.showDialog(html_str, config)
                xxgEditForm(dialog.wrap.find('form'))
            },

            // 填写新机imei
            '.btn-view-hs-newproductimei, .js-trigger-add-new-product-imei': function(e){
                e.preventDefault()

                var $me = $(this),
                    parent_id = $me.attr('data-value')

                var params_data = {
                        'parent_id':parent_id
                    },
                    html_str = $.tmpl( $.trim($('#JsXxgEditNewProductImeiTpl').html()) )(params_data)

                var config = {
                    withMask: true,
                    middle: true
                }

                var dialog = tcb.showDialog(html_str, config)
                xxgEditForm(dialog.wrap.find('form'))
            },
            '.js-get-my-prize':function(e) {
                e.preventDefault()
                var $me = $(this)
                var order_id = $.queryUrl(window.location.href)['order_id']
                $.post('/m/doGetSuningDoubleTwelverize', {'order_id': order_id}, function (res) {
                    res = JSON.parse(res)
                    if (res.errno) {
                        $.dialog.toast(res.errmsg, 2000)
                    } else {
                        showPrizeDialog(res['result'])
                    }
                })
            },
            '.samsung-5g':function(e) {
                e.preventDefault()
                window.__SAMSUMG_SUBSIDY_5G = true
                $('.js-btn-go-next').trigger('click')
            },
            '.yzs-btn-cancel':function (e) {
                e.preventDefault()
                $.dialog.confirm('<div style="text-align: center;font-weight: 600;">提示</div>' +
                    '<div style="height:.8rem;display: flex;align-items: center;justify-content: center;">您确定未拿到旧机吗？</div>',
                    function () {
                        var order_id = $.queryUrl(window.location.href)['order_id'],
                         $confirm_wrap= $('.confirm-wrap')
                        // window.location.href="/Recycle/Engineer/CashierDesk?order_id="+order_id+"&business_id=3"
                        $.post('/m/notReceivedMobileToEngineer', {'order_id': order_id}, function (res) {
                            res = JSON.parse(res)
                            if (res.errno) {
                                $.dialog.toast(res.errmsg, 2000)
                            } else {
                                if(res.result.jump){
                                    window.location.href = res.result.jump
                                }else{
                                    $.dialog.toast('操作成功！', 2000)
                                }
                                //    请求成功，隐藏确认框
                                $confirm_wrap.css('display','none')
                            }
                        })
                    }
                )
            },
            '.yzs-btn-confirm':function (e) {
                e.preventDefault()
                $.dialog.confirm('<div style="text-align: center;font-weight: 600;">提示</div>' +
                    '<div style="height:.8rem;display: flex;align-items: center;justify-content: center;">您确定拿到旧机了吗？</div>',
                    function () {
                    var $confirm_wrap= $('.confirm-wrap')
                        var order_id = $.queryUrl(window.location.href)['order_id']
                        $.post('/m/confirmReceivedMobileToEngineer', {'order_id': order_id}, function (res) {
                            res = JSON.parse(res)
                            if (res.errno) {
                                $.dialog.toast(res.errmsg, 2000)
                            } else {
                            //    请求成功，隐藏确认框
                                $confirm_wrap.css('display','none')
                            }
                        })
                    }
                )
            },
            '.user-evaluation, .js-trigger-invite-user-evaluation':function (e) {
                e.preventDefault()
                var _this = $(this)
                if (_this.hasClass('user-btn-disabled')) {
                    return
                }
                var order_id = $.queryUrl(window.location.href)['order_id']
                $.post('/m/oneStopInvteCommentsToUser', {'order_id': order_id}, function (res) {
                    res = JSON.parse(res)
                    if (res.errno) {
                        $.dialog.toast(res.errmsg, 2000)
                    } else {
                        //    请求成功，隐藏确认框
                        $.dialog.toast('短信发送成功！', 2000)
                        _this.addClass('user-btn-disabled');
                    }
                })

            }


        })


        // 获取奖励红包
        function showPrizeDialog (params) {
            params = params || {}
            var html_fn = $.tmpl ($.trim ($ ('#JsPrizeDialogTpl').html ())),
                html_st = html_fn ({
                    prize:params
                })

            var dialogInst = tcb.showDialog (html_st, {
                className : 'prize-success-dialog',
                withClose : true,
                top:120
            })

            $('.js-use-it').on('click',function (e) {
                e.preventDefault()
                dialogInst.mask.remove()
                dialogInst.wrap.remove()
            })

            $('#js-prize-wrap').html('<p>抽奖结果：'+params['prize_alis']+'</p>')
        }

        // 修修哥编辑订单信息表单
        function xxgEditForm($form, before_submit, after_submit){
            $form.on('submit', function(e){
                e.preventDefault()

                var $form = $(this)

                if (!notEqualDefaultVal($form)){
                    return window.location.reload()
                }

                // 订单提交前执行
                if (typeof before_submit!=='function') {
                    before_submit = function($form, callback){
                        typeof callback==='function' && callback()
                    }
                }
                // 订单提交后执行
                if (typeof after_submit!=='function') {
                    after_submit = function(){return true}
                }

                before_submit($form, function(){
                    $.post($form.attr('action'), $form.serialize(), function(res){
                        res = $.parseJSON(res)

                        // 表单提交后执行，返回true继续执行默认行为，false不执行后续操作
                        if (after_submit(res)) {
                            if (!res.errno) {
                                window.location.reload()
                            } else {
                                alert(res.errmsg)
                            }
                        }
                    })

                })
            })

        }

        // 比较是否和默认值不相等
        function notEqualDefaultVal($form){
            // 默认相等
            var flag = false

            var $input = $form.find('input,textarea')

            $input.forEach(function(item, i){
                var $item = $(item),
                    default_val = $item.attr('data-default')

                // 默认值不为空字符串,并且默认值和修改后的值不相等，设置flag为true，表示有不相等的值，可以正常提交表单
                if (default_val) {
                    if (default_val!==$item.val()) {
                        flag = true
                    }
                } else {
                    // 确保是空字符串，而不是未定义状态或者null
                    if (default_val===''&&$item.val()){
                        flag = true
                    }
                }
            })

            return flag
        }

    })
}()
