// 一些基本操作
!function () {
    if (window.__PAGE !== 'xxg-order-detail') {
        return
    }

    var __cacheAssessOptionsExempt = {}
    window.bindEventFormUpdateOrderInfo = __bindEventFormUpdateOrderInfo
    window.showPageCustomerSignatureBeforeCallback = __showPageCustomerSignatureBeforeCallback

    function __bindEventFormUpdateOrderInfo($form, $trigger) {
        if (!($form && $form.length)) {
            return
        }
        var trigger_text = $trigger.html()

        window.XXG.bindForm({
            $form: $form,
            before: function ($form, callback) {
                if (!__validUpdateOrderByGoNext($form)) {
                    return false
                }
                if ($trigger.hasClass('btn-disabled')) {
                    return false
                }
                if (window.__ORDER.sale_type == 3) {
                    // console.log(window.__DAODIAN_REACH_TIME);
                    if (window.__DAODIAN_REACH_TIME &&
                        (!window.__DAODIAN_REACH_TIME || window.__DAODIAN_REACH_TIME === '0000-00-00 00:00:00')) {
                        $.dialog.toast('请选择到店时间')
                        return false
                    }
                } else {
                    if (window.__IS_SHOW_DAODIAN_SERVER_TIME &&
                        (!window.__DAODIAN_SERVER_TIME || window.__DAODIAN_SERVER_TIME === '0000-00-00 00:00:00')) {
                        $.dialog.toast('请选择上门时间')
                        return false
                    }
                }
                if (!window.__IS_ONE_STOP_ORDER_CONTINUE
                    && window.__IS_ONE_STOP_ORDER && !window.__IS_ONE_STOP_ORDER_NO_DIFF && !window.__IS_ONE_STOP_ORDER_SUCCESS) {
                    var order_id = $form.find('[name="order_id"]').val()
                    window.SuningOneStopOrder.checkOneStopPriceLetThrough(order_id)
                    return false
                }
                $trigger.addClass('btn-disabled').html('处理中...')
                callback()
            },
            success: __successFillUp,
            //success: window.__IS_BEFORE_ARRIVE
            //    ? __successUpdateBeforeArrive
            //    : __successFillUp,
            error: function (res) {
                window.__SAMSUMG_SUBSIDY_5G = false
                $trigger.removeClass('btn-disabled').html(trigger_text)
                $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
            }
        })

        //function __successUpdateBeforeArrive(){
        //    $trigger.removeClass ('btn-disabled').html (trigger_text)
        //    __actionBeforeArrive($trigger)
        //}
        function __successFillUp() {
            window.__ORDER_INFO.imei = tcb.trim($form.find('[name="imei"]').val() || '')
            window.__ORDER_INFO.memo = tcb.trim($form.find('[name="memo"]').val() || '')
            // if (!window.__IS_XXG_APP_VERSION_BETA){
            //     return window.XXG.ajax ({
            //         url : tcb.setUrl ('/m/aj_wancheng_order'),
            //         data : {
            //             'order_id' : $trigger.attr ('data-order-id'),
            //             'status'   : $trigger.attr ('data-now-status')
            //         },
            //         success : function (res) {
            //             setTimeout(function(){
            //                 $trigger.removeClass ('btn-disabled').html (trigger_text)
            //             }, 400)
            //
            //             if (!res.errno) {
            //                 window.showPageCustomerServiceComplete && window.showPageCustomerServiceComplete ()
            //             } else {
            //                 $.dialog.toast (res.errmsg)
            //             }
            //         },
            //         error : function (err) {
            //             $trigger.removeClass ('btn-disabled').html (trigger_text)
            //             $.dialog.toast ('系统错误，请稍后重试')
            //         }
            //     })
            // } else {
            // 数据更新成功
            setTimeout(function () {
                $trigger.removeClass('btn-disabled').html(trigger_text)
            }, 400)

            var order_id = $form.find('[name="order_id"]').val()
            var price = $form.find('[name="price"]').val()

            if (window.__IS_ONE_STOP_ORDER_CONTINUE) {
                window.__IS_ONE_STOP_ORDER_CONTINUE = false
                window.SuningOneStopOrder.confirmGoToPriceDifference(order_id)
                return
            }

            var checked_need = false
            var checked_done = true
            if (window.__IS_NEEDED_MANAGER_CHECK) {
                checked_need = true
                if (!window.__IS_MANAGER_CHECK_SUCCESS) {
                    // 店长审核--暂未通过
                    checked_done = false
                }
            }
            if (window.__REMOTE_CHECK_FLAG) {
                checked_need = true
                if (window.__REMOTE_CHECK_FLAG_PROCESS != 3) {
                    // 远程验机--暂未通过
                    checked_done = false
                    if (!window.isRemoteCheckWorkTime()) {
                        return $.dialog.alert('服务时间为早9点至晚10点，请在此时间段内操作订单')
                    }
                }
            }
            if (checked_need && checked_done) {
                // 店长审核||远程验机，完成
                return window.isNeedCheckUnlocked(function (is_need_unlock) {
                    if (is_need_unlock) {
                        // 检查解锁状态
                        window.checkUnlocked(function () {
                            // 已解锁
                            window.showPageCustomerSignature && window.showPageCustomerSignature()
                        })
                    } else {
                        window.showPageCustomerSignature && window.showPageCustomerSignature()
                    }
                })
            }
            if (window.__IS_HUANBAOJI || !window.__IS_NEEDED_PIC) {
                // 环保机 || 不需要imei和传图
                return window.showPageCustomerSignature && window.showPageCustomerSignature()
            }

            window.isNeedCheckUnlocked(function (is_need_unlock) {
                if (is_need_unlock) {
                    window.addCheckUnlockQueue()
                }
            })
            if (window.__SAMSUMG_SUBSIDY_5G) {
                window.__SAMSUMG_SUBSIDY_5G = false
                window.location.href = tcb.setUrl2('/m/activity?orderId=' + order_id)
            } else {
                window.showPageUploadPicture && window.showPageUploadPicture({
                    order_id: order_id,
                    price: price,
                    category_id: window.__ORDER_INFO.category_id
                })
            }
            // }
        }

        $form.find('[name="price"]').on('input change', function (e) {
            var $me = $(this)
            var price = $me.val()

            e.type === 'change' && tcb.loadingStart()

            window.getFinalPriceStructure(price, function (add_price, sum_price) {
                if (add_price > -1) {
                    $('.price-structure-add-price').html(add_price > 0 ? '再+' + add_price + '元补贴' : '')
                }
                var bottomRowPriceHtml = /*'<div class="col shrink">成交价：'
                    + price
                    + (add_price > 0 ? ' 补贴:' + add_price : '')
                    + '</div>'
                    + */'<div class="col shrink"></div><div class="col auto marked">到手价：' + sum_price.toFixed(2) + '</div>'
                $('.row-btn .bottom-row-price')
                    .show()
                    .children('.grid').html(bottomRowPriceHtml)
                setTimeout(function () {
                    e.type === 'change' && tcb.loadingDone()
                }, 500)
            })
        })
    }

    // 验证下一步前的提交参数
    function __validUpdateOrderByGoNext($Form) {
        var flag = true,
            toast_text = '',
            $focus = null

        var $assessPrice = $('.row-order-assess-price .col-12-8'),
            $dealPrice = $Form.find('[name="price"]'),
            $dealImei = $Form.find('[name="imei"]'),
            $dealMemo = $Form.find('[name="memo"]')

        if ($dealPrice && $dealPrice.length) {
            var price = parseFloat(tcb.trim($dealPrice.val()))
            if (!price) {
                flag = false
                $focus = $focus || $dealPrice
                $dealPrice.closest('.row').shine4Error()
            }
        }
        if ($dealImei && $dealImei.length) {
            var imei = tcb.trim($dealImei.val())
            if (!imei) {
                flag = false
                $focus = $focus || $dealImei
                $dealImei.closest('.row').shine4Error()
            }
        }
        if ($dealMemo && $dealMemo.length) {
            var memo = tcb.trim($dealMemo.val())
            var assess_price = tcb.trim($assessPrice.html())
            if (price && parseFloat(price) != parseFloat(assess_price) && !memo) {
                flag = false
                $focus = $focus || $dealMemo
                $dealMemo.closest('.row').shine4Error()
                toast_text = '评估价和成交价不一致，请填写备注'
            }
        }

        if ($focus && $focus.length) {
            setTimeout(function () {
                $focus.focus()
            }, 200)
        }

        if (toast_text) {
            $.dialog.toast(toast_text, 2000)
        }

        return flag
    }

    // 显示签名前的回调逻辑
    function __showPageCustomerSignatureBeforeCallback(next) {
        var idCardInfo = window.__IDCARD_INFO__ || {}
        if (idCardInfo.realname_info
            && idCardInfo.realname_info.real_name
            && idCardInfo.realname_info.id_number) {
            return typeof next === 'function' && next()
        }

        var orderInfo = window.__ORDER_INFO || {}
        var $trigger = $('<a data-order-id="' + orderInfo.parent_id + '"></a>')
        __actionActiveFillUpIdCard($trigger, function () {
            typeof next === 'function' && next()
        })
    }

    // 填写身份证
    function __actionActiveFillUpIdCard($trigger, success) {
        if (!($trigger && $trigger.length)) {
            return
        }
        var idCardInfo = window.__IDCARD_INFO__ || {}
        var html_fn = $.tmpl($.trim($('#JsXxgEditIdNumTpl').html())),
            html_st = html_fn({
                parent_id: $trigger.attr('data-order-id'),
                real_name: (idCardInfo &&
                    idCardInfo.realname_info &&
                    idCardInfo.realname_info.real_name) || '',
                id_number: (idCardInfo &&
                    idCardInfo.realname_info &&
                    idCardInfo.realname_info.id_number) || '',
                is_force: idCardInfo.force_flag || false
            }),
            dialog = tcb.showDialog(html_st, {
                middle: true,
                withClose: false
            })
        dialog.mask.css({'z-index': tcb.zIndex()})
        dialog.wrap.css({'z-index': tcb.zIndex()})

        dialog.wrap.find('.js-trigger-edit-id-num-skip').on('click', function (e) {
            e.preventDefault()

            tcb.closeDialog()

            typeof success === 'function' && success()
        })
        window.XXG.bindForm({
            $form: dialog.wrap.find('form'),
            before: function ($form, next) {
                var errmsg = ''
                var $real_name = $form.find('[name="real_name"]'),
                    $id_num = $form.find('[name="id_num"]'),
                    real_name = tcb.trim($real_name.val()),
                    id_num = tcb.trim($id_num.val())
                if (!real_name) {
                    errmsg = errmsg || '请输入姓名'
                    $real_name.shine4Error()
                }
                if (!tcb.validIDCard(id_num)) {
                    errmsg = errmsg || '请输入正确的身份证格式'
                    $id_num.shine4Error()
                }
                if (errmsg) {
                    return $.dialog.toast(errmsg)
                }

                tcb.loadingStart()
                next()
            },
            success: function (res, $form) {
                var real_name = tcb.trim($form.find('[name="real_name"]').val())
                var id_number = tcb.trim($form.find('[name="id_num"]').val())
                $('.row-order-deal-customer-id-num .customer-info-name').html(real_name)
                $('.row-order-deal-customer-id-num .customer-info-idnum').html(id_number)
                var idCardInfo = window.__IDCARD_INFO__ || {}
                idCardInfo.force_flag = false
                idCardInfo.have_flag = true
                idCardInfo.realname_info = {
                    real_name: real_name,
                    id_number: id_number
                }
                window.__IDCARD_INFO__ = idCardInfo

                tcb.closeDialog()
                tcb.loadingDone()

                typeof success === 'function' && success()
                //setTimeout(function () {
                //    window.XXG.redirect()
                //}, 10)
            },
            error: function (res) {
                tcb.loadingDone()
                $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
            }
        })
    }

    $(function () {
        var $BlockOrderBaseInfo = $('.block-order-base-info'),
            $BlockOrderDealInfo = $('.block-order-deal-info')

        function init() {
            new ClipboardJS('.js-trigger-copy').on('success', function (e) {
                $.dialog.toast('复制成功：' + e.text)
            })
            __bindEvent()
            __setShowPicturesRowStatus()
        }

        init()

        // ************
        // 处理函数
        // ************

        function __bindEvent() {
            tcb.bindEvent($BlockOrderBaseInfo[0], {
                // 展开/收起 更多订单信息
                '.js-trigger-expand-n-collapse': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    $me.toggleClass('arrow-down arrow-up')
                    $me.siblings('.block-order-base-info-extend').slideToggle(200)
                }
            })

            tcb.bindEvent(document.body, {
                // 取消订单

                '.js-btn-cancel': function (e) {
                    e.preventDefault()
                    __actionActiveCancelOrder($(this))
                },
                // 下一步

                '.js-btn-go-next': function (e) {
                    e.preventDefault()
                    __actionActiveGoNextStep($(this))
                },
                // 扫描评估结果

                '.btn-scan-assess': function (e) {
                    e.preventDefault()
                    if (window.__IS_MANAGER_CHECK_SUCCESS) {
                        return $.dialog.toast('本订单已完成店长审核，不再支持修改验机结果')
                    } else if (window.__REMOTE_CHECK_FLAG_PROCESS == 3) {
                        return $.dialog.toast('本订单已完成远程验机，不再支持修改验机结果')
                    }
                    __actionScanAssess($(this))
                },
                // 查看回收手机参数详情

                '.btn-view-hs-detail': function (e) {
                    e.preventDefault()
                    __showOrderAssessOptions($(this))
                },
                // 查看免检订单回收手机参数详情

                '.btn-view-hs-detail-exempt': function (e) {
                    e.preventDefault()
                    __showOrderAssessOptionsExempt($(this))
                },
                // 查看回收手机SKU属性详情

                '.btn-view-hs-sku': function (e) {
                    e.preventDefault()
                    __showOrderAssessSku($(this))
                },
                // 修修哥单独填写备注

                '.btn-edit-memo': function (e) {
                    e.preventDefault()
                    __actionActiveFillUpMemo($(this))
                },
                // 填写身份证号

                '.btn-view-hs-idnum': function (e) {
                    e.preventDefault()
                    __actionActiveFillUpIdCard($(this))
                },
                // 显示imei条形码

                '.js-trigger-show-imei-bar-code': function (e) {
                    e.preventDefault()
                    __showImeiBarCode($(this))
                },
                //订单号转换为条形码
                '.js-trigger-show-order-id-bar-code': function (e) {
                    e.preventDefault()
                    __showImeiBarCode($(this), true)
                },
                // 显示顾客抽奖二维码

                '.js-trigger-show-customer-draw-qrcode': function (e) {
                    e.preventDefault()
                    __showCustomerDrawQRCode($(this))
                },
                // 显示苏宁礼品二维码

                '.js-trigger-show-suning-gift-card': function (e) {
                    e.preventDefault()
                    __showSuningGiftCardQrcode($(this))
                },
                // 展示机器细节图片

                '.js-trigger-show-pictures': function (e) {
                    e.preventDefault()
                    __showDetailPictures($(this))
                },
                // 合作方换新补贴

                '.js-trigger-show-partner-switch-phone-subsidies': function (e) {
                    e.preventDefault()
                    __showPartnerSwitchPhoneSubsidies($(this))
                },

                // 切换订单展示信息的tab
                '.row-order-deal-title-tab .tab-item': function (e) {
                    e.preventDefault()

                    var $me = $(this)

                    if ($me.hasClass('tab-item-checked')) {
                        return
                    }
                    $me.closest('.row-order-deal-title-tab')
                       .find('.tab-item-checked')
                       .removeClass('tab-item-checked')
                    $me.addClass('tab-item-checked')

                    if ($me.attr('data-remote-check')) {
                        $('.block-order-deal-info-check-info').show()
                        $('.block-order-deal-info-main').hide()
                    } else {
                        $('.block-order-deal-info-check-info').hide()
                        $('.block-order-deal-info-main').show()
                    }
                },
                '.js-trigger-active-remote-check-tab': function (e) {
                    e.preventDefault()

                    $('.row-order-deal-title-tab .tab-item').eq(1).trigger('click')
                },
                '.js-trigger-active-order-info-tab': function (e) {
                    e.preventDefault()

                    $('.row-order-deal-title-tab .tab-item').eq(0).trigger('click')
                },
                '#get_markup_price': function (e) {
                    e.preventDefault()
                    __actionGetMarkupPrice($(this))
                },
                // 修改免检加价
                '.js-trigger-edit-exempt-price': function (e) {
                    e.preventDefault()

                    var $me = $(this),
                        order_id = window.__ORDER_INFO.order_id,
                        $Form = $BlockOrderDealInfo.find('#FormUpdateOrderInfoByGoNext'),
                        $imei_inpt = $Form.find('[name="imei"]'),
                        imei = tcb.trim($imei_inpt.val() || ''),
                        price = $me.closest('.row-order-deal-exempt').find('[name="price"]').val()

                    if (!imei) {
                        $imei_inpt.closest('.row').shine4Error()
                    } else {
                        window.XXG.ajax({
                            type: 'POST',
                            url: '/Recycle/Engineer/Exempt/checkImeiAndPrice',
                            data: {
                                order_id: order_id,
                                imei: imei,
                                price: price
                            },
                            success: function (res) {
                                if (!res.errno) {
                                    $.dialog.alert('<div style="text-align: center;">加价成功！</div>', function () {
                                        window.XXG.redirect()
                                    })
                                } else {
                                    $.dialog.alert(res.errmsg)
                                }
                            },
                            error: function (err) {
                                $.dialog.toast('系统错误，请稍后重试')
                            }
                        })
                    }
                },
                // 关闭机型不一致弹窗
                '.close-different-model': function (e) {
                    e.preventDefault()
                    // var differentMask = $('.different-alert-model-mask')
                    // differentMask.hide()
                    window.XXG.redirect()
                }
            })
        }

        function __actionGetMarkupPrice($trigger, callback) {

            var order_id = $trigger.attr('data-order-id')
            window.XXG.ajax({
                url: '/m/aj_get_markup',
                data: {
                    order_id: order_id
                },
                success: function (res) {
                    //console.log(res['result']['add_price']);
                    if (!res.errno) {
                        $.dialog.alert('经理特权加价为：' + res['result']['add_price_float'], function () {
                            window.XXG.redirect()
                        })
                        //$.isFunction(callback) && callback(res)
                    } else {
                        $.dialog.toast(res.errmsg)
                    }
                },
                error: function (err) {
                    $.dialog.toast('系统错误，请稍后重试')
                }
            })
        }

        function __actionScanAssess($trigger) {
            var order_id = $trigger.attr('data-order-id')

            return tcb.js2AppInvokeQrScanner(true, function (result) {
                __orderDetailScanQRCodeSuccess(order_id, result)
            })
        }

        function __orderDetailScanQRCodeSuccess(order_id, result) {
            result = (result || '').split('|') || []

            // 根据二维码信息，获取重新评估的参数数据
            var data = __getReAssessDataByQRCode(order_id, result)
            if (!data) {
                return $.dialog.toast('二维码数据异常')
            }
            if (result[0] === 'ARC') {
                __doScanRePingguNotebook(data)
            } else {
                __doScanRePinggu(data)
            }
        }

        // 笔记本重新评估
        function __doScanRePingguNotebook(data) {
            __addNoteBookAutoCheckResult(
                data,
                function (model_id, pre_assess) {
                    var bindingArcRecordParams = {
                        order_id: data.order_id,
                        arc_assess_key: pre_assess
                    }
                    if (data.ignore_model_check === true) {
                        bindingArcRecordParams.ignore_model_check = true
                    }
                    __bindingArcRecord(bindingArcRecordParams, function () {
                        window.XXG.redirect()
                    })
                }
            )
        }

        function __addNoteBookAutoCheckResult(data, callback) {
            window.XXG.ajax({
                url: '/m/addNotebookAutoCheckResult',
                data: data,
                success: function (res) {
                    if (!(res && !res.errno)) {
                        var errmsg = (res && res.errmsg) || '系统错误，请稍后重试'
                        if (res && res.errno === 12014 && res.result && res.result.canChangeModelFlag) {
                            // 错误码 12014 代表订单机型 和 检测机型不一致 弹窗提示用户走再来一单重新下单
                            return __actionScanReassessErrorDiffModelCanChange(res, function () {
                                // 当选择【回收检测机型】时，
                                // 将请求参数增加ignore_model_check属性，并且设置为true
                                data.ignore_model_check = true
                                __addNoteBookAutoCheckResult(data, callback)
                            })
                        }
                        $('.sm-err-alert-model-mask').show()
                        $('.sm-err-alert-model-btn-upLoade').hide()
                        $('.sm-err-alert-model-btn-confirm').show()
                        if (res.errno === 19101 || res.errno === 19104) {
                            $('.sm-err-alert-model-btn-confirm').hide()
                            $('.sm-err-alert-model-btn-upLoade').show().attr('data-sequenceCode', res.result.sequenceCode)
                        } else if (res.errno === 19106) {
                            $('.sm-err-alert-model-mask').hide()
                            // 显卡缺失,请手动选择
                            window.XXG.showDialogAddNoteBookAutoCheckGraphicsCardSelect(res.result && res.result.graphicsCardId, function (graphicsCardId) {
                                data.graphicsCardId = graphicsCardId
                                __addNoteBookAutoCheckResult(data, callback)
                            })
                        } else {
                            $('.sm-err-alert-model-mask .sm-err-alert-model-content-text').html(errmsg)
                        }
                        return
                    }
                    var result = res.result || {}
                    if (result.modelId && result.assessKey) {
                        typeof callback === 'function' && callback(result.modelId, result.assessKey)
                    } else {
                        return $.dialog.toast('数据错误')
                    }
                },
                error: function (err) {
                    $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                }
            })
        }

        function __bindingArcRecord(data, callback) {
            window.XXG.ajax({
                url: '/m/bindingArcRecord',
                data: data,
                success: function (res) {
                    if (!(res && !res.errno)) {
                        return $.dialog.toast((res && res.errmsg) || '系统错误，请稍后重试')
                    }
                    typeof callback === 'function' && callback()
                },
                error: function (err) {
                    $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                }
            })
        }

        // 手机重新评估
        function __doScanRePinggu(data) {
            window.XXG.ajax({
                url: tcb.setUrl('/m/doScanRePinggu'),
                data: data,
                beforeSend: function () {},
                success: function (res) {
                    if (res && res.errno === 12014 && res.result && res.result.canChangeModelFlag) {
                        // 错误码 12014 代表订单机型 和 检测机型不一致 弹窗提示用户走再来一单重新下单
                        return __actionScanReassessErrorDiffModelCanChange(res, function () {
                            // 当选择【回收检测机型】时，
                            // 将请求参数增加ignore_model_check属性，并且设置为true
                            data.ignore_model_check = true
                            __doScanRePinggu(data)
                        })
                    }
                    var msg = (res && !res.errno)
                        ? '新的评估价为：' + res['result']
                        : (res && res['errmsg']) || '系统错误'
                    $.dialog.alert(msg, function () {
                        window.XXG.redirect()
                    })
                },
                error: function (err) {
                    $.dialog.toast((err && err.statusText) || '系统错误')
                }
            })
        }

        // 根据二维码信息，获取重新评估的参数数据
        function __getReAssessDataByQRCode(order_id, result) {
            result = result.join('|')
            result = (result || '').split('|') || []

            var data
            if (result[0] === 'ARM') {
                result.shift()
                try {
                    data = $.parseJSON(result.join(''))
                } catch (e) {}
            } else if (result[0] === 'ARC') {
                result.shift()
                data = {
                    encryptedStr: result.join('')
                }
            } else {
                data = {
                    assess_key: result[0] || '',
                    scene: result[1] || ''
                }
                if (result[1] === 'miniapp') {
                    data['imei'] = result[2] || '' //imei
                }
                if (result[4]) {
                    data['imei'] = result[2] //imei
                    data['encrypt_xxg_qid'] = result[4] //Pad登录的xxg
                }
            }
            if (data) {
                data['order_id'] = order_id
            }
            return data
        }

        window.test__doScanRePinggu = function (result) {
            var order_id = window.__ORDER_ID
            if (!order_id) {
                return console.error('当前页面没有order_id，无法继续')
            }
            __orderDetailScanQRCodeSuccess(order_id, result)
        }

        //扫码成功后  订单机型 和 检测机型不一致
        function __actionScanReassessErrorDiffModelCanChange(res, change_model_callback) {
            var html_fn = $.tmpl(tcb.trim($('#JsXxgOrderDetailReassessErrorDiffModelCanChangeTpl').html())),
                html_st = html_fn(res.result),
                $html_st = $(html_st).appendTo('body')

            $html_st.find('.order-model').css('background-color', '#f7f7f7')
            $html_st.find('.test-model').css('background-color', '#ffe9dd')

            $html_st.find('.js-trigger-not-change-model-reassess').on('click', function (e) {
                // 回收原机型，重新验机，
                // 直接刷新页面
                e.preventDefault()
                window.XXG.redirect()
            })
            $html_st.find('.js-trigger-confirm-change-model').on('click', function (e) {
                // 回收检测机型
                e.preventDefault()

                $html_st.remove()

                typeof change_model_callback === 'function' && change_model_callback()
            })
        }

        window.__actionScanReassessErrorDiffModelCanChange = __actionScanReassessErrorDiffModelCanChange

        // 触发下一步操作
        function __actionActiveGoNextStep($btn) {
            if (!($btn && $btn.length)) {
                return $.dialog.toast('$btn参数必须')
            }
            if ($btn.hasClass('btn-go-next-lock')) {
                return
            }
            var errMsg = ''
            if (!errMsg && window.__IS_FORCE_SCAN_BYB) {
                errMsg = '请先使用帮验宝验机，并扫码同步验机结果'
                return $.dialog.alert(errMsg)
            }
            if (!errMsg && window.__SUNING_YUNDIAN_MINIAPP_NEED_FILL_UP) {
                errMsg = '请完善用户收款信息。'
            }
            if (!errMsg && window.__IS_NEEDED_MANAGER_CHECK && window.__IS_MANAGER_CHECK_STARTED) {
                // 店长审核校验
                if (!window.__IS_MANAGER_CHECK_SUCCESS) {
                    // 审核没有通过，那么提示审核通过了之后之后再操作。
                    // 在此只是设置错误提示信息，还不做操作，
                    // 如果还有远程验机相关操作，那么先保证远程验机操作可以继续，例如远程验机被驳回，那么可以继续传图等
                    errMsg = '请等待审核通过再操作。'
                }
            }
            if (!errMsg && window.__REMOTE_CHECK_FLAG) {
                // 远程验机校验
                if (window.__REMOTE_CHECK_FLAG_PROCESS == -1) {
                    // 远程验机被驳回
                    window.remoteCheckUploadRejectPicturesubmitPicture()
                    return
                }
                // if (!errMsg && window.__REMOTE_CHECK_FLAG_PROCESS != 3) {
                //     errMsg = '请先等待远程验机完成。'
                // }
            }
            // if (!errMsg && window.__IDCARD_INFO__.force_flag !== null && (window.__IDCARD_INFO__.force_flag && !window.__IDCARD_INFO__.have_flag)) {
            //     // 校验是否填写身份证信息
            //     if (window.__IDCARD_INFO__.force_flag && !window.__IDCARD_INFO__.have_flag) {
            //         errMsg = '请填写顾客身份证后再提交。'
            //     }
            // }
            if (errMsg) {
                return $.dialog.toast(errMsg)
            }

            var act = $btn.attr('data-act')
            switch (act) {
                case 'jiedan':
                case 'chufa':
                case 'daoda':
                    // 上门修修哥开始服务前的操作
                    __actionBeforeArrive($btn)
                    break
                case 'fill-up-info':
                    // 填写完善旧机信息
                    $BlockOrderDealInfo.find('#FormUpdateOrderInfoByGoNext').trigger('submit')
                    break
                default :
                    break
            }
        }

        // 修修哥开始服务前的操作：1、接单；2、出发；3、到达
        function __actionBeforeArrive($btn) {
            var btn_text = $btn.html(),
                order_id = $btn.attr('data-order-id'),
                now_status = $btn.attr('data-now-status'),
                next_status = $btn.attr('data-next-status')

            window.XXG.ajax({
                url: tcb.setUrl('/m/aj_xxg_parent_status'),
                data: {
                    'parent_id': order_id,
                    'now_status': now_status,
                    'next_status': next_status
                },
                beforeSend: function () {
                    if ($btn.hasClass('btn-disabled')) {
                        return false
                    }
                    $btn.addClass('btn-disabled').html('处理中...')
                },
                success: function (res) {
                    if (!res.errno) {
                        window.XXG.redirect()
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

        // 激活订单取消弹窗
        function __actionActiveCancelOrder($btnCancel) {
            if ($btnCancel.hasClass('btn-disabled')) {
                return
            }

            var act = $btnCancel.attr('data-act')

            switch (act) {
                case 'cancel-refund':
                    // 取消订单，并且去退款
                    __actionCancelOrderAndRefund($btnCancel)
                    break
                default :
                    // 订单完成前，取消订单
                    __actionCancelOrderBeforeFinnish($btnCancel)
                    break
            }
        }

        // 订单完成前，取消订单
        function __actionCancelOrderBeforeFinnish($btnCancel) {
            var html_fn = $.tmpl($.trim($('#JsXxgCancelOrderTpl').html())),
                html_st = html_fn({
                    'order_id': $btnCancel.attr('data-order-id')
                }),
                dialog = tcb.showDialog(html_st, {middle: true})
            window.XXG.bindForm({
                $form: dialog.wrap.find('form'),
                before: function ($form, callback) {
                    var $xxg_memo = $form.find('[name="xxg_memo"]'),
                        xxg_memo = tcb.trim($xxg_memo.val())
                    if (!xxg_memo) {
                        $.dialog.toast('请输入取消原因')
                        return $xxg_memo.shine4Error()
                    }
                    tcb.loadingStart()
                    callback()
                },
                success: function () {
                    tcb.closeDialog()
                    setTimeout(function () {
                        window.XXG.redirect()
                    }, 10)
                },
                error: function (res) {
                    tcb.loadingDone()
                    $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                }
            })
        }

        // 取消订单，并且退款
        function __actionCancelOrderAndRefund($btnCancel) {
            var order_id = $btnCancel.attr('data-order-id'),
                refund_type = $btnCancel.attr('data-refund-type'),
                html_fn = $.tmpl($.trim($('#JsXxgCancelOrderAndRefundTpl').html())),
                html_st = html_fn({
                    'order_id': order_id
                }),
                dialog = tcb.showDialog(html_st, {middle: true})
            window.XXG.bindForm({
                $form: dialog.wrap.find('form'),
                before: function ($form, callback) {
                    var $xxg_memo = $form.find('[name="xxg_memo"]'),
                        xxg_memo = tcb.trim($xxg_memo.val())
                    if (!xxg_memo) {
                        $xxg_memo.attr('data-error-msg') && $.dialog.toast($xxg_memo.attr('data-error-msg'))
                        return $xxg_memo.shine4Error()
                    }
                    tcb.loadingStart()
                    callback()
                },
                success: function () {
                    tcb.closeDialog()
                    setTimeout(function () {
                        window.XXG.redirect(tcb.setUrl2('/Recycle/Engineer/CashierDesk', {
                            order_id: order_id,
                            business_id: refund_type
                        }))
                    }, 10)
                },
                error: function (res) {
                    tcb.loadingDone()
                    $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                }
            })
        }

        // 填写备注
        function __actionActiveFillUpMemo($trigger) {
            if (!($trigger && $trigger.length)) {
                return
            }
            var html_fn = $.tmpl($.trim($('#JsXxgEditMemoTpl').html())),
                html_st = html_fn({
                    'order_id': $trigger.attr('data-order-id'),
                    'content': tcb.html_decode($trigger.attr('data-content'))
                }),
                dialog = tcb.showDialog(html_st, {middle: true})
            window.XXG.bindForm({
                $form: dialog.wrap.find('form'),
                before: function ($form, callback) {
                    var $memo = $form.find('[name="memo"]'),
                        memo = tcb.trim($memo.val())
                    if (!memo) {
                        $memo.attr('data-error-msg') && $.dialog.toast($memo.attr('data-error-msg'))
                        return $memo.shine4Error()
                    }
                    tcb.loadingStart()
                    callback()
                },
                success: function (res, $form) {
                    var memo = tcb.trim($form.find('[name="memo"]').val())
                    $('.row-order-deal-memo .col-12-7').html(tcb.html_encode(memo))
                    $trigger.attr('data-content', memo)
                    tcb.closeDialog()
                    tcb.loadingDone()
                },
                error: function (res) {
                    tcb.loadingDone()
                    $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                }
            })
        }

        // imei条形码
        function __showImeiBarCode($trigger, $isOrderId) {
            if (!($trigger && $trigger.length)) {
                return
            }

            var order_id = $trigger.attr('data-order-id'),
                imei = $trigger.attr('data-imei'),
                parameter = {
                    type: 1,
                    orderId: order_id,
                    imei: imei
                }
            //如果是true 则生成订单号转换的条码！
            if ($isOrderId) {
                parameter.isOrderFlag = true
            }

            var img_url = tcb.setUrl('/aj/genBarCode', parameter)

            tcb.showDialog('<img style="height:1rem;width:100%;" src="' + img_url + '" alt="">', {
                className: 'dialog-imei-bar-code',
                withMask: true,
                middle: true
            })
        }

        function __showCustomerDrawQRCode($trigger) {
            if (!($trigger && $trigger.length)) {
                return
            }
            var qrcode = $trigger.attr('data-qrcode')
            var dialog_str = '<div style="margin: 0 auto;width: 2.88rem;height: 2.88rem;"><img src="' + qrcode + '" alt="" style="width:100%"></div>'
            tcb.showDialog(dialog_str, {
                className: 'qrcode-wrap',
                withMask: true,
                middle: true
            })
            tcb.statistic(['_trackEvent', 'xxg', '显示', '用户二维码', '1', ''])
        }

        function __showSuningGiftCardQrcode($trigger) {
            if (!($trigger && $trigger.length)) {
                return
            }
            var qrcode = tcb.cache('huodong-doCheckSuningCard')
            if (qrcode) {
                var dialog_str = '<div style="margin: 0 auto;width: 2.88rem;height: 3.3rem;">' +
                    '<div style="padding-top: .1rem;line-height: 2;font-size: .18rem;text-align: center;">请用户使用微信扫码领取</div>' +
                    '<img src="' + qrcode + '" alt="" style="width:100%"></div>'
                tcb.showDialog(dialog_str, {
                    className: 'qrcode-wrap',
                    withClose: true,
                    withMask: true,
                    middle: true
                })
            } else {
                var order_id = $trigger.attr('data-order-id')

                window.XXG.ajax({
                    url: '/huodong/doCheckSuningCard',
                    data: {
                        order_id: order_id
                    },
                    success: function (res) {
                        if (!res.errno) {
                            var gift_data = res.result || {}
                            var cardtype = gift_data.card_type
                            // 如果为苏宁礼品卡,则打开弹窗,显示二维码
                            if (cardtype == 1) {
                                qrcode = gift_data.qr_code
                                if (qrcode) {
                                    tcb.cache('huodong-doCheckSuningCard', qrcode)
                                }
                                var dialog_str = '<div style="margin: 0 auto;width: 2.88rem;height: 3.3rem;">' +
                                    '<div style="padding-top: .1rem;line-height: 2;font-size: .18rem;text-align: center;">请用户使用微信扫码领取</div>' +
                                    '<img src="' + qrcode + '" alt="" style="width:100%"></div>'
                                tcb.showDialog(dialog_str, {
                                    className: 'qrcode-wrap',
                                    withClose: true,
                                    withMask: true,
                                    middle: true
                                })
                            }
                        } else {
                            $.dialog.toast(res.errmsg)
                        }
                    }
                })
            }

            tcb.statistic(['_trackEvent', 'xxg', '显示', '苏宁礼品卡二维码', '1', ''])
        }

        function __showDetailPictures($trigger) {
            if (!($trigger && $trigger.length)) {
                return
            }
            __getPicture($trigger.attr('data-order-id'), function (res) {
                var result = res.result,
                    dialog_str = []
                for (var i = 0; i < result.length; i++) {
                    dialog_str.push('<img src="' + tcb.imgThumbUrl(result[i], 720, 720, 'edr') + '" style="width:100%">')
                }
                tcb.showDialog(dialog_str.join(''), {
                    className: 'dialog-order-detail-picture',
                    withMask: true,
                    middle: true
                })
            })
        }

        function __showPartnerSwitchPhoneSubsidies($trigger) {
            if (!($trigger && $trigger.length)) {
                return
            }
            var order_id = $trigger.attr('data-order-id')
            var data_type = $trigger.attr('data-type')
            var dialog_str = []
            $.each(window.__PARTNER_SWITCH_PHONE_SUBSIDIES_MODELS, function (modelId, modelName) {
                dialog_str.push('<a class="btn" href="/m/partnerSwitchPhoneSubsidies?orderId=' + order_id + '&model=' + modelName + '" data-type="' + data_type + '" style="font-size: .2rem;"> ' + modelName + ' </a>')
            })
            tcb.showDialog(dialog_str.join(''), {
                withMask: true,
                middle: true
            })
        }

        function __showOrderAssessOptions($trigger) {
            var order_id = $trigger.attr('data-order-id'),
                model_id = $trigger.attr('data-model-id'),
                assessResult = window.__SPECIAL_ASSESS,
                assessResultLast = window.__SPECIAL_REASSESS,
                assessGroup = window.__SPECIAL_GROUPS,
                assessResultByUser = [], // 用户的评估结果
                assessResultAtLast = []  // 最后一次，再次评估结果
            if (assessResult && assessResult[order_id]) {
                $.each(assessResult[order_id], function (i, item) {
                    assessResultByUser.push({
                        'name': item['name'],
                        'selected': item['select']
                    })
                })
            }

            if (assessResultLast && assessResultLast[order_id]) {
                $.each(assessResultLast[order_id], function (i, item) {
                    var change = assessResult[order_id][i] ? false : true
                    assessResultAtLast.push({
                        'name': item['name'],
                        'group': assessGroup[model_id][item['group']].sub,
                        'selected': item['select'],
                        'selected_id': item['id'],
                        'change': change,
                        'disable_change': !item['allowChange']
                    })
                })
            }
            var html_fn = $.tmpl($.trim($('#JsXxgViewHsDetailTpl').html())),
                html_st = html_fn({
                    'assessResultByUser': assessResultByUser,
                    'assessResultAtLast': assessResultAtLast,
                    'order_id': order_id,
                    'order_status': window.__ORDER_STATUS || 0
                })

            var dialogInst = tcb.showDialog(html_st, {
                withMask: true,
                middle: true
            })
            __bindEventFormEditAssessOptions(dialogInst.wrap.find('form'))
            __bindEventChangeCompareTab(dialogInst.wrap.find('.tab-list .item'))
        }

        // 重新评估回收手机参数
        function __bindEventFormEditAssessOptions($form) {
            if (!($form && $form.length)) {
                return
            }

            $form.on('submit', function (e) {
                e.preventDefault()
                $.getJSON('/m/aj_edit_options_new', $form.serialize(), function (res) {
                    if (!res['errno']) {
                        tcb.closeDialog()

                        if (window.__REMOTE_CHECK_FLAG) {
                            $.dialog.alert('重新评估成功！', function () {
                                window.XXG.redirect()
                            })
                        } else {
                            var new_price = res['result'] || 0
                            $.dialog.alert('重新评估价格为' + new_price + '元', function () {
                                window.XXG.redirect()
                            })
                        }

                        // __saveEditAssessPrice(new_price, function () {
                        //     $.dialog.alert('重新评估价格为' + new_price + '元', function () {
                        //         window.XXG.redirect()
                        //     })
                        // })
                        // window.getFinalPriceStructure(new_price, function () {
                        //     $.dialog.alert('重新评估价格为' + new_price + '元', function () {
                        //         window.XXG.redirect()
                        //     })
                        // })
                    } else {
                        $.dialog.toast(res['errmsg'])
                    }
                })
            })
        }

        function __showOrderAssessSku($trigger) {
            var order_id = $trigger.attr('data-order-id'),
                assessSku = window.__SKU_ASSESS,
                assessSkuLast = window.__SKU_REASSESS,
                skuGroups = window.__SKU_GROUPS,

                assessSkuByUser = [], // 用户的评估sku
                assessSkuAtLast = []  // 最后一次，再次评估sku

            if (assessSku && assessSku[order_id]) {
                $.each(assessSku[order_id], function (i, item) {
                    assessSkuByUser.push({
                        'selected': item['attr_valuename']
                    })
                })
            }

            if (assessSkuLast && assessSkuLast[order_id]) {
                $.each(assessSkuLast[order_id], function (i, item) {
                    var change = false
                    if (!(assessSku[order_id][i] && assessSku[order_id][i].attr_valueid == item.attr_valueid)) {
                        change = true
                    }
                    assessSkuAtLast.push({
                        'group': skuGroups[order_id][i],
                        'selected': item['attr_valuename'],
                        'selected_id': item['attr_valueid'],
                        'change': change
                    })
                })
            }

            var html_fn = $.tmpl($.trim($('#JsXxgViewHsSkuTpl').html())),
                html_st = html_fn({
                    'assessSkuByUser': assessSkuByUser,
                    'assessSkuAtLast': assessSkuAtLast,
                    'order_id': order_id,
                    'order_status': window.__ORDER_STATUS || 0
                }),
                dialogInst = tcb.showDialog(html_st, {
                    withMask: true,
                    middle: true
                })
            var sku_pc_auto_check = (window.__SKU_PC_AUTO_CHECK && window.__SKU_PC_AUTO_CHECK[order_id]) || []
            if (sku_pc_auto_check && sku_pc_auto_check.length && !window.__SKU_PC_AUTO_CHECK_FLAG[order_id]) {
                var $subSkuNew = dialogInst.wrap.find('#sub_sku_new')
                var $btnEditSku = $subSkuNew.find('.btn-edit-sku')
                var sku_pc_auto_check_html = []
                tcb.each(sku_pc_auto_check, function (i, val) {
                    sku_pc_auto_check_html.push('<div>' + val.group_name + '：' + val.group_value + '</div>')
                })
                sku_pc_auto_check_html = '<div class="pre-assess-sku-list" style="color: #f50;">' + sku_pc_auto_check_html.join('') + '</div>'
                if ($btnEditSku && $btnEditSku.length) {
                    $btnEditSku.before(sku_pc_auto_check_html)
                } else {
                    $subSkuNew.append(sku_pc_auto_check_html)
                }
            }
            __bindEventFormEditAssessSku(dialogInst.wrap.find('form'))
            __bindEventChangeCompareTab(dialogInst.wrap.find('.tab-list .item'))
        }

        // 重新评估回收手机SKU
        function __bindEventFormEditAssessSku($form) {
            if (!($form && $form.length)) {
                return
            }

            $form.on('submit', function (e) {
                e.preventDefault()
                $.getJSON('/m/aj_edit_sku_options_new', $form.serialize(), function (res) {
                    if (!res['errno']) {
                        tcb.closeDialog()

                        if (window.__REMOTE_CHECK_FLAG) {
                            $.dialog.alert('重新评估成功！', function () {
                                window.XXG.redirect()
                            })
                        } else {
                            var new_price = res['result'] || 0
                            $.dialog.alert('重新评估价格为' + new_price + '元', function () {
                                window.XXG.redirect()
                            })
                        }

                        // __saveEditAssessPrice(new_price, function () {
                        //     $.dialog.alert('重新评估价格为' + new_price + '元', function () {
                        //         window.XXG.redirect()
                        //     })
                        // })
                        // window.getFinalPriceStructure(new_price, function () {
                        //     $.dialog.alert('重新评估价格为' + new_price + '元', function () {
                        //         window.XXG.redirect()
                        //     })
                        // })
                    } else {
                        $.dialog.toast(res['errmsg'])
                    }
                })
            })
        }


        // 获取精细评估数据
        function __getOrderAssessOptionsExempt(callback) {
            $.get('/Recycle/Engineer/Exempt/getItem', {
                category_id: window.__ORDER_INFO.category_id,
                order_id: window.__ORDER_INFO.order_id
            }, function (res) {
                if (!res.errno) {
                    $.isFunction(callback) && callback(res.result)
                } else {
                    $.dialog.toast(res['errmsg'])
                }
            })
        }

        // 展示精细评估弹窗
        function __showOrderAssessOptionsExempt($trigger) {
            var order_id = $trigger.attr('data-order-id'),
                assessResult = window.__SPECIAL_ASSESS,
                assessResultByUser = [] // 用户的评估结果

            if (assessResult && assessResult[order_id]) {
                $.each(assessResult[order_id], function (i, item) {
                    assessResultByUser.push({
                        'name': item['name'],
                        'selected': item['select']
                    })
                })
            }
            __getOrderAssessOptionsExempt(function (resultData) {
                var assessOptionsList = resultData.item,
                    insetImgs = resultData.insetImgs
                var html_fn = $.tmpl($.trim($('#JsXxgViewHsDetailExemptEngineerTpl').html())),
                    html_st = html_fn({
                        'insetImgs': insetImgs,
                        'assessResultByUser': assessResultByUser,
                        'assessOptionsList': assessOptionsList,
                        'order_id': order_id,
                        'order_status': window.__ORDER_STATUS || 0/*,
                        'cacheAssessOptionsList': __cacheAssessOptionsExempt*/
                    })

                var dialogInst = tcb.showDialog(html_st, {
                    withMask: true,
                    middle: true
                })
                __bindEventFormEditAssessOptionsExempt(dialogInst.wrap.find('form'))
                __bindEventChangeCompareTab(dialogInst.wrap.find('.tab-list .item'))

                //设置筛选开始日期
                $('.js-trigger-pick-date').mdater({
                    // minDate : new Date(2015, 2, 10),
                    // cancleText:'',
                    confirmCallback: function ($trigger) {
                        // var name = $trigger.attr('name'),
                        //     val = $trigger.val()
                        // __cacheAssessOptionsExempt[name] = val
                    }
                })

                //设置筛选开始日期
                $('.js-trigger-get-phone-warranty-date').on('click', function () {
                    $.dialog.confirm('是否查询保修信息?', function () {
                        $.post('/Recycle/Engineer/Exempt/getIphoneInfo', {order_id: window.__ORDER_INFO.order_id}, function (res) {
                            if (!res['errno']) {
                                var baoxiu = res['result']['baoxiu_date']
                                $('input[name="item[item_2]"]').val(baoxiu)
                                baoxiu = baoxiu === '' ? '已过期' : baoxiu
                                $.dialog.alert('保修期: ' + baoxiu)
                            } else {
                                $.dialog.toast(res['errmsg'])
                            }
                        })
                    })
                })

                // 上傳圖片
                var $TriggerUpload = $('.js-trigger-UploadPicture')
                //检测图片是否有值，有值显示图片
                if (insetImgs) {

                    $('.oneImage').css('backgroundImage', 'url(' + insetImgs.board_img + ')')
                    $('.twoImage').css('backgroundImage', 'url(' + insetImgs.screen_img + ')')
                    return

                }
                window.TakePhotoUpload && new window.TakePhotoUpload({
                    $trigger: $TriggerUpload,
                    supportCapture: false,
                    callback_upload_success: function (inst, data) {
                        console.log('触发了上传图片的函数')
                        if (data && !data.errno) {
                            var $triggerCurrent = inst.$triggerCurrent
                            if (!($triggerCurrent && $triggerCurrent.length)) {
                                return
                            }
                            $triggerCurrent.css('backgroundImage', 'url(' + data.result + ')')
                            $triggerCurrent.closest('.trigger-wrap').find('input').val(data.result)
                            // $triggerCurrent.closest('.trigger-wrap').find('.js-trigger-DelPicture').css('display','inline-block')
                            console.log('---上传图片的地址---', data.result)
                        } else {
                            return $.dialog.toast((data && data.errmsg) || '系统错误')
                        }
                    },
                    callback_upload_fail: function (me, xhr, status, err) {
                        $.dialog.toast(xhr.statusText || '上传失败，请稍后再试')
                    }
                })

                //删除图片
                // $(".js-trigger-DelPicture").on("click",function(){
                //     console.log('删除图片')
                //     $('.js-trigger-UploadPicture').css('backgroundImage', '').closest('.trigger-wrap').find('.js-trigger-DelPicture').css('display','none')
                // });
            })
        }

        // 精细评估表单绑定事件
        function __bindEventFormEditAssessOptionsExempt($form) {
            if (!($form && $form.length)) {
                return
            }


            $form.on('submit', function (e) {
                e.preventDefault()
                if (!__validFormEditAssessOptionsExempt($form)) {
                    return $.dialog.alert('精细评估项不能为空')
                }


                if ($('.img-url-one').val().length > 0 && $('.img-url-two').val().length > 0) {

                    $.dialog.confirm('精细评估项提交后无法修改，请确认后提交', function () {
                        $.post('/Recycle/Engineer/Exempt/submit', $form.serialize(), function (res) {
                            if (!res['errno']) {
                                tcb.closeDialog()
                                var new_price = res['result']['price'] || 0
                                $.dialog.alert('精细评估价格为' + new_price + '元', function () {
                                    window.XXG.redirect()
                                })
                            } else {
                                $.dialog.toast(res['errmsg'])
                            }
                        })
                    })

                } else {
                    $.dialog.alert('请上传拆机照片再提交~')

                }


            })

            // 缓存用户评估结果
            // $form.find('select, input').on('change',function (e) {
            //     e.preventDefault()
            //
            //     var $me = $(this),
            //         type = $me.attr('type'),
            //         name = $me.attr('name'),
            //         val = $me.val()
            //
            //     if (type == 'checkbox') {
            //         if(!__cacheAssessOptionsExempt[name]){
            //             __cacheAssessOptionsExempt[name] = {}
            //         }
            //         __cacheAssessOptionsExempt[name][val] = $me.prop('checked') ? true : false
            //     } else {
            //         __cacheAssessOptionsExempt[name] = val
            //     }
            // })
        }

        // 验证精细评估项
        function __validFormEditAssessOptionsExempt($form) {
            var flag = true

            $form.find('select, input[type="text"]').each(function () {
                var $me = $(this)
                var $row = $me.closest('.row')

                if (!$me.val()) {
                    flag = false
                    $row.addClass('row-error')
                } else {
                    $row.removeClass('row-error')
                }
            })
            $form.find('.row').each(function () {
                var $checkbox = $(this).find('input[type="checkbox"]')

                if ($checkbox.length) {
                    var $row = $checkbox.closest('.row')
                    var $checked = $checkbox.filter(function () {
                        return $(this).prop('checked')
                    })

                    if (!$checked.length) {
                        flag = false
                        $row.addClass('row-error')
                    } else {
                        $row.removeClass('row-error')
                    }
                }
            })

            return flag

        }

        // 弹窗tab切换
        function __bindEventChangeCompareTab($tab) {
            $tab.on('click', function (e) {
                e.preventDefault()

                var $me = $(this)
                $me.addClass('item-cur').siblings('.item-cur').removeClass('item-cur')
                $me.parents('.dialog-inner').find('.tab-cont .item').eq($me.index()).show().siblings('.item').hide()
            })
        }

        // function __saveEditAssessPrice(price, callback) {
        //     window.getFinalPriceStructure(price, function () {
        //         var orderInfo = window.__ORDER_INFO || {}
        //         var order_id = orderInfo.order_id
        //         window.XXG.ajax({
        //             url: '/m/aj_up_order_info',
        //             data: {
        //                 order_id: order_id,
        //                 price: price
        //             },
        //             success: function (res) {
        //                 if (res && !res.errno) {
        //                     typeof callback === 'function' && callback()
        //                 } else {
        //                     $.dialog.toast((res && res.errmsg) || '系统错误，请稍后重试')
        //                 }
        //             },
        //             error: function (err) {
        //                 $.dialog.toast(err.statusText || '系统错误，请稍后重试')
        //             }
        //         })
        //     })
        // }

        function __getPicture(order_id, callback) {
            window.XXG.ajax({
                url: '/m/doGetPingzheng',
                data: {
                    order_id: order_id
                },
                success: function (res) {
                    if (!res.errno) {
                        $.isFunction(callback) && callback(res)
                    } else {
                        $.dialog.toast(res.errmsg)
                    }
                },
                error: function (err) {
                    //$.dialog.toast ('系统错误，请稍后重试')
                }
            })
        }

        function __setShowPicturesRowStatus() {
            var $triggerShowPictures = $('.js-trigger-show-pictures'),
                status = $triggerShowPictures.attr('data-now-status')
            if (status >= 13 && status < 50) {
                __getPicture($triggerShowPictures.attr('data-order-id'), function (res) {
                    if (res && res.result && res.result.length) {
                        $triggerShowPictures.closest('.row').show()
                    }
                })
            }
        }

    })

}()
