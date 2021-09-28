!function () {
    if (window.__PAGE !== 'xxg-special-user-pay') {
        return
    }

    $(function () {
        $('.btn-switch-payment').on('click', function (e) {
            e.preventDefault()

            var $blockAlipay = $('.block-alipay'),
                $blockWechat = $('.block-wechat')

            if ($blockAlipay.height()) {
                $blockWechat.show()
                $blockAlipay.hide()
            } else if ($blockWechat.height()) {
                $blockAlipay.show()
                $blockWechat.hide()
            }
        })

        var timerHandler
        var orderId = tcb.queryUrl(window.location.search, 'orderId')

        // showConfirmDialog({
        //     headimgurl:'https://s.gravatar.com/avatar/8cb07ae4cf42101cf2885feea4780abc?size=50&default=retro',
        //     nickname:'小火车'
        // })

        heartBeat()

        function heartBeat() {
            window.XXG.ajax({
                url: '/m/getAuthUserInfo',
                data: {
                    orderId: orderId
                },
                beforeSend: function () {
                },
                success: function (res) {
                    if (!res.errno) {
                        showConfirmDialog(res.result || {})
                    }
                },
                error: function (err) {}
            })
            timerHandler = setTimeout(heartBeat, 3500)
        }

        function showConfirmDialog(result) {
            var nickname = result.nickname,
                headimgurl = result.headimgurl,
                html_str = '<div class="tit">请和用户确认收款账号</div><div class="grid nowrap align-center justify-center">'
            if (headimgurl) {
                html_str += '<div class="col auto"><img src=' + headimgurl + ' alt=""></div>'
            }
            if (nickname) {
                html_str += '<div class="payee-col col auto"><div class="payee">' + nickname + '</div><div>收款人</div></div>'
            }
                html_str += '</div>'
            if (headimgurl || nickname) {
                // 获取到用户信息停止轮询
                clearTimeout(timerHandler)

                $.dialog.confirm(html_str, function () {
                    //点击确定收款
                    window.XXG.ajax({
                        url: '/m/xxgConfirmPaymentInfo',
                        data: {
                            orderId: orderId
                        },
                        success: function (res) {
                            if (!res.errno || res.errno == 19200) {
                                // 订单服务完成
                                window.XXG.ajax({
                                    url: '/m/aj_wancheng_order',
                                    data: {
                                        order_id: orderId,
                                        status: window.__STATUS
                                    },
                                    success: function (res) {
                                        if (!res.errno) {
                                            window.XXG.redirect(tcb.setUrl2('/m/hs_xxg_order', {
                                                order_id: orderId
                                            }), true)
                                        } else {
                                            heartBeat()
                                            $.dialog.toast(res.errmsg)
                                        }
                                    }
                                })
                            } else {
                                heartBeat()
                                $.dialog.toast(res.errmsg)
                            }
                        }
                    })
                }, function () {
                    // 点击取消
                    window.XXG.ajax({
                        url: '/m/xxgCancelPaymentInfo',
                        data: {
                            orderId: orderId
                        },
                        success: function (res) {
                            if (!res.errno) {
                                heartBeat()
                            } else {
                                $.dialog.toast(res.errmsg)
                            }
                        }
                    })
                })
                $('.ui-btn-succ').val('确认打款')
            }
        }
    })

}()
