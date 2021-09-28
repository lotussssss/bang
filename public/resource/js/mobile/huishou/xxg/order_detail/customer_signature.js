// 客户签字
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }

    $(function () {
        var __is_locked = false

        window.showPageCustomerSignature = showPageCustomerSignature
        window.showPageCustomerSignatureBeforeCallback = window.showPageCustomerSignatureBeforeCallback || function (next) {
            typeof next === 'function' && next()
        }

        var SwipeSection = window.Bang.SwipeSection

        tcb.bindEvent(document.body, {
            // 关闭弹层
            '.js-trigger-close-signature-swipe': function (e) {
                e.preventDefault()
                SwipeSection.backLeftSwipeSection()
            },

            '.js-trigger-scroll-to-platform-service-agreement': function (e) {
                e.preventDefault()
                $('.block-customer-agreement-content').scrollTo({
                    endY: 0
                })
                // $('#BlockTcbPlatformServiceAgreement').
            },
            '.js-trigger-scroll-to-huishou-trade-rules': function (e) {
                e.preventDefault()
                var $Content = $('.block-customer-agreement-content')
                var scrollTop = $Content.scrollTop()
                var offset = $Content.offset()
                var targetOffset = $('#BlockHuishouTradeRules').offset()
                $('.block-customer-agreement-content').scrollTo({
                    endY: targetOffset.top - offset.top + scrollTop
                })
            },

            // 签名并且确认阅读同意协议

            '.swipe-page-customer-signature .btn-submit': function (e) {
                e.preventDefault()
                var $me = $(this)
                if (__validSignature()) {
                    if (!$me.closest('.swipe-main-content').find('[name="agree_protocol"]').prop('checked')) {
                        return $.dialog.toast('请先阅读并并同意《同城帮服务协议》和《隐私政策》')
                    }
                    // 保存签名
                    var pointGroups = JSON.stringify(window.instSignaturePad.getStripPointGroups())
                    window.XXG.ajax({
                        type: 'POST',
                        url: tcb.setUrl('/huishou/doOrderSign'),
                        data: {
                            'orderId': window.__ORDER_ID,
                            'signature': pointGroups
                        },
                        success: function (res) {
                            if (res && !res.errno) {
                                if (window.isSuningShopPlusOutDate) {
                                    window.isSuningShopPlusOutDate(function (isOutDate) {
                                        if (isOutDate) {
                                            window.showDialogSuningShopPlusOutDate(function () {
                                                __signatureConfirm($me)
                                            })
                                        } else {
                                            __signatureConfirm($me)
                                        }
                                    })
                                } else {
                                    __signatureConfirm($me)
                                }
                            } else {
                                $.dialog.toast(res.errmsg)
                            }
                        },
                        error: function (err) {
                            $.dialog.toast('系统错误，请稍后重试')
                        }
                    })
                }
            },
            // 激活签名板

            '.swipe-page-customer-signature .js-trigger-active-customer-signature': function (e) {
                e.preventDefault()
                __openCustomerSignaturePad()
            },
            // 关闭签名板

            '.swipe-page-customer-signature .js-trigger-customer-signature-pad-close': function (e) {
                e.preventDefault()
                __closeCustomerSignaturePad()
            },
            // 清除签名

            '.swipe-page-customer-signature .btn-signature-clear': function (e) {
                e.preventDefault()
                __clearSignature()
            },
            // 确认签名

            '.swipe-page-customer-signature .btn-signature-confirm': function (e) {
                e.preventDefault()
                __confirmSignature()
            }
        })


        // ************
        // 处理函数
        // ************


        function showPageCustomerSignature() {
            // __is_locked = false
            // validSelectLockByImei ()
            window.showPageCustomerSignatureBeforeCallback(function () {
                var $swipe = SwipeSection.getSwipeSection('.swipe-page-customer-signature')
                var html_fn = $.tmpl(tcb.trim($('#JsMXxgOrderCustomerSignatureTpl').html())),
                    html_st = html_fn()
                SwipeSection.fillSwipeSection(html_st)
                var html_fn1 = $.tmpl(tcb.trim($('#JsTcbPlatformServiceAgreementTpl').html())),
                    html_st1 = html_fn1()
                var html_fn2 = $.tmpl(tcb.trim($('#JsHuishouTradeRulesTpl').html())),
                    html_st2 = html_fn2()
                $swipe.find('.block-customer-agreement-content').html(html_st1 + html_st2)
                SwipeSection.doLeftSwipeSection()
            })
        }

        function __openCustomerSignaturePad() {
            var $PadWrap = $('#CustomerSignaturePadWrap'),
                $BtnRow = $PadWrap.find('.customer-signature-pad-btn'),
                $Pad = $PadWrap.find('.customer-signature-pad'),
                $win = tcb.getWin(),
                w_width = $win.width(),
                w_height = $win.height()

            $PadWrap.css({
                display: 'block',
                width: w_width + 'px',
                height: w_height + 'px'
            })
            $Pad.css({
                width: (w_width - $BtnRow.height()) + 'px',
                height: w_height + 'px'
            })
            $BtnRow.css({
                width: w_height + 'px',
                right: '-' + (w_height - $BtnRow.height()) / 2 + 'px'
            })

            if (!window.instSignaturePad) {
                window.instSignaturePad = window.Bang.SignaturePad({
                    canvas: $('#CustomerSignaturePadCanvas'),
                    canvasConfig: {
                        penColor: '#000',
                        penSize: 3,
                        backgroundColor: '#cbcbcb'
                    },
                    flagAutoInit: true
                })
            }

            $BtnRow.css({
                transform: 'rotate(-90deg)'
            })
            tcb.js2AndroidSetDialogState(true, function () {
                __closeCustomerSignaturePad()
            })
        }

        function __closeCustomerSignaturePad() {
            var $PadWrap = $('#CustomerSignaturePadWrap'),
                $BtnRow = $PadWrap.find('.customer-signature-pad-btn')

            $PadWrap.hide()
            $BtnRow.css({
                transform: 'none'
            })
            tcb.js2AndroidSetDialogState(false)
        }

        function __rotateImg(img, deg, fn) {

            tcb.imageOnload(img, function (imgObj) {

                var w = imgObj.naturalHeight,
                    h = imgObj.naturalWidth

                var canvas = __createCanvas(w, h),
                    ctx = canvas.getContext('2d')

                ctx.save()
                ctx.translate(w, 0)
                ctx.rotate(deg * Math.PI / 180)
                ctx.drawImage(imgObj, 0, 0, h, w)
                ctx.restore()

                var newImg = ctx.canvas.toDataURL('image/jpeg')

                typeof fn === 'function' && fn(newImg)
            })
        }

        function __createCanvas(w, h) {
            var canvas = document.createElement('canvas')

            canvas.width = w
            canvas.height = h
            return canvas
        }

        function __validSignature() {
            var pointGroups
            var flag = true

            if (!window.instSignaturePad
                || !((pointGroups = window.instSignaturePad.getPointGroups()) && pointGroups[0] && pointGroups[0][0])) {
                flag = false
                $.dialog.toast('请先签名确认')
            }
            return flag
        }

        function __signatureConfirm($btn) {
            var order_id = $btn.attr('data-order-id')
            var status = $btn.attr('data-now-status')

            if (window.__IS_NEED_PAYINFO && window.__IS_NEED_PAYINFO[order_id] && !window.__IS_ONE_STOP_ORDER) {
                // 如果需要完善用户收款信息【并且是非一站式订单】，那么跳转到完善收款页面
                return window.XXG.redirect(tcb.setUrl('/m/scanAuth', {
                    orderId: $btn.attr('data-order-id')
                }), true)
            }

            var btn_text = $btn.html()
            window.XXG.ajax({
                url: tcb.setUrl('/m/aj_wancheng_order'),
                data: {
                    'order_id': order_id,
                    'status': status
                },
                beforeSend: function () {
                    if ($btn.hasClass('btn-disabled')) {
                        return false
                    }
                    $btn.addClass('btn-disabled').html('处理中...')
                },
                success: function (res) {
                    if (!res.errno) {
                        // 检查当前机器是否解锁
                        // if (__is_locked){
                        //     window.showPageLockedTips && window.showPageLockedTips ()
                        // } else {
                        window.__SHOW_CASH_FLAG = res.result.show_cash_flag
                        window.__ZJ_MOBILE_CALL_URL = res.result.zj_mobile_call_url || ''

                        window.showPageCustomerServiceComplete && window.showPageCustomerServiceComplete()
                        addFiveCodeIntoPage($('.swipe-page-customer-service-complete'), res.result.five_code || '')   // 逆向物流使用该方法
                        // }
                    } else {
                        $btn.removeClass('btn-disabled').html(btn_text)
                        $.dialog.toast(res.errmsg)
                    }
                },
                error: function (err) {
                    $btn.removeClass('btn-disabled').html(btn_text)
                    $.dialog.toast('系统错误，请稍后重试')
                }
            })
        }

        // 逆向物流,添加此方法,因为要求最后订单服务完成页要添加发货码,特写此方法
        function addFiveCodeIntoPage($ele, fivecode) {
            if (!$ele && !fivecode) return
            var $__ele = $ele,
                __fivecode = fivecode,
                __htmlStr = '<div style="color: #4a7;">订单发货码：' + __fivecode + '（请贴至手机后背）</div>'
            $__ele.find('.service-complete-desc').append(__htmlStr)
        }

        function validSelectLockByImei() {
            var max = 2,
                count = 0,
                imei = window.__ORDER_INFO.imei
            if (!imei) {
                return
            }

            function loop() {
                count++
                if (count > max || __is_locked) {
                    return
                }
                window.XXG.ajax({
                    url: tcb.setUrl('/m/selectLockByImei'),
                    data: {'imei': imei},
                    timeout: 30000,
                    beforeSend: function () {},
                    success: function (res) {
                        var has_status = false
                        try {
                            if (!res.errno) {
                                has_status = true
                                if (res.result == /*'unknown'*/'locked') {
                                    return __is_locked = true
                                }
                            }
                        } catch (ex) {}

                        return !has_status && loop()
                    },
                    error: function (err) {return loop()}
                })
            }

            loop()
        }

        function __clearSignature() {
            if (window.instSignaturePad && window.instSignaturePad.clearAll) {
                window.instSignaturePad.clearAll()

                var $trigger = $('.swipe-page-customer-signature .js-trigger-active-customer-signature')
                $trigger.css({
                    fontSize: '',
                    backgroundImage: ''
                })
            }
        }

        function __confirmSignature() {
            if (!window.instSignaturePad) {
                return
            }
            var pointGroups = window.instSignaturePad.getPointGroups()
            if (!(pointGroups && pointGroups[0] && pointGroups[0][0])) {
                return $.dialog.toast('请先签名').css({
                    transform: 'rotate(-90deg)'
                })
            }

            var dataUrl = window.instSignaturePad.toDataUrl('image/jpeg')

            __rotateImg(dataUrl, 90, function (img) {
                var $trigger = $('.swipe-page-customer-signature .js-trigger-active-customer-signature')

                $trigger.css({
                    fontSize: 0,
                    backgroundImage: 'url(' + img + ')'
                })
            })

            __closeCustomerSignaturePad()
        }
    })
}()
