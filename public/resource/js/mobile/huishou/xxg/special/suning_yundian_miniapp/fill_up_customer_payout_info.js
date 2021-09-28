!function () {
    // 修修哥顾客收款信息
    if (window.__PAGE !== 'xxg-special-suning-yundian-miniapp-fill-up-customer-payout-info') {
        return
    }

    $(function () {
        var $FormEditPayeeZfbInfo = $('#FormEditPayeeZfbInfo'),
            $FormEditPayeeBankInfo = $('#FormEditPayeeBankInfo')

        tcb.bindEvent(document.body, {
            // 选择打款方式
            '.tab-item': function (e) {
                e.preventDefault()

                var $me = $(this),
                    data_type = $me.attr('data-type')

                $me.addClass('cur').siblings('.cur').removeClass('cur')
                $('.payee-cont[data-type="' + data_type + '"]').show().siblings('.payee-cont').hide()

                $('[name="pay_method"]').val(data_type)
            },
            // 处理银行卡格式
            '#FormEditPayeeBankInfo [name="bank_no"]': {
                'keyup change': function (e) {
                    var $me = $(this)
                    $me.val($me.val().replace(/\D/g, ''))
                }
            },
            // 展示确认弹窗
            '.js-trigger-confirm-dialog': function (e) {
                e.preventDefault()

                var pay_method = $('[name="pay_method"]').val(),
                    payeeInfoList = []

                //打款方式：40支付宝；50网银
                if (pay_method == 40) {
                    var zfb_no = $FormEditPayeeZfbInfo.find('[name="bank_no"]').val(),
                        zfb_username = $FormEditPayeeZfbInfo.find('[name="bank_username"]').val()

                    payeeInfoList = [
                        ['收款方式', '支付宝'],
                        ['支付宝账号', zfb_no],
                        ['支付宝姓名', zfb_username]
                    ]

                    if (!validForm($FormEditPayeeZfbInfo)) {
                        return
                    }
                } else if (pay_method == 50) {
                    var bank_no = $FormEditPayeeBankInfo.find('[name="bank_no"]').val(),
                        bank_username = $FormEditPayeeBankInfo.find('[name="bank_username"]').val()

                    payeeInfoList = [
                        ['收款方式', '银行卡'],
                        ['开户行', $('[name="bank_name"]').val()],
                        ['开户行省份', $('[name="province"]').val()],
                        ['开户行城市', $('[name="city"]').val()],
                        ['开户账号', bank_no],
                        ['开户人姓名', bank_username]
                    ]

                    if (!validForm($FormEditPayeeBankInfo)) {
                        return
                    }
                }

                showDialogConfirmPayeeInfo(payeeInfoList)
            },
            // 提交表单
            '.js-trigger-submit': function (e) {
                e.preventDefault()

                var pay_method = $('[name="pay_method"]').val()

                if (pay_method == 40) {
                    $FormEditPayeeZfbInfo.trigger('submit')
                } else if (pay_method == 50) {
                    $FormEditPayeeBankInfo.trigger('submit')
                }
            },
            '.js-trigger-cancel': function (e) {
                e.preventDefault()

                tcb.closeDialog()
            }
        })

        // 开户行选择器
        function initBankNamePicker($Form) {
            var
                $bankName = $Form.find('[name="bank_name"]'),
                $trigger = $('.trigger-select-bank-name')

            var
                pickerData = []
            $.each(window.__BANKLIST || [], function (i, item) {
                pickerData.push({
                    id: i,
                    name: item
                })
            })

            Bang.Picker({
                // 实例化的时候自动执行init函数
                flagAutoInit: true,
                // 触发器
                selectorTrigger: $trigger,

                col: 1,
                data: [pickerData],
                dataPos: [0],

                // 回调函数(确认/取消)
                callbackConfirm: function (inst) {
                    var data = inst.options.data || [],
                        dataPos = inst.options.dataPos || [],
                        selectedData = data[0][dataPos[0]]

                    $trigger.find('.txt').html(selectedData['name'])
                    $bankName.val(selectedData['name'])
                },
                callbackCancel: null
            })
        }

        // 城市选择器
        function initCitySelect($Form) {

            var
                $trigger = $('.trigger-select-province-city-area'),
                province = $Form.find('.i-shipping-province').html() || '',
                city = $Form.find('.i-shipping-city').html() || '',
                area = $Form.find('.i-shipping-area').html() || '',
                options = {
                    // 实例化的时候自动执行init函数
                    flagAutoInit: true,
                    selectorTrigger: $trigger,
                    //selectorProvince : '[name="receiver_province_id"]',
                    //selectorCity     : '[name="receiver_city_id"]',
                    //selectorArea     : '[name="receiver_area_id"]',
                    province: province,
                    city: city,
                    area: area,
                    //show_city        : false,
                    show_area: false,
                    not_render: true,
                    callback_cancel: null,
                    callback_confirm: function (region) {
                        region = region || {}

                        $Form.find('[name="province"]').val(region['province'])
                        $Form.find('[name="city"]').val(region['city'])

                        var str = ''
                        // 设置省
                        str += '<span class="i-shipping-province">' + region['province'] + '</span>'
                        // 设置城市
                        str += ' <span class="i-shipping-city">' + region['city'] + '</span>'
                        $trigger.removeClass('default').find('.txt').html(str)
                    }
                }

            // 初始化省/市/区县选择器
            Bang.AddressSelect(options)
        }

        // 确认弹窗
        function showDialogConfirmPayeeInfo(data) {
            var html_str = $.tmpl($.trim($('#JsXxgSuningYundianMiniappFillUpCustomerPayoutInfoDialogTpl').html()))({
                    payeeInfoList: data
                }),
                config = {
                    withMask: true,
                    middle: true,
                    className: 'dialog-xxg-confirm-payee-info'
                }

            var dialog = tcb.showDialog(html_str, config)
        }

        // 验证表单
        function validForm($form) {
            var
                flag = true,
                pay_method = $form.find('[name="pay_method"]').val()

            if (pay_method == 40) {
                // 支付宝
                var
                    $zfb_no = $form.find('[name="bank_no"]'),
                    $zfb_username = $form.find('[name="bank_username"]')

                // 支付宝账号
                if ($zfb_no.length && !$.trim($zfb_no.val())) {
                    $.errorAnimate($zfb_no.focus())
                    flag = false
                }
                // 支付宝名
                if ($zfb_username.length && !$.trim($zfb_username.val())) {
                    $.errorAnimate(flag
                        ? $zfb_username.focus()
                        : $zfb_username)
                    flag = false
                }
            } else if (pay_method == 50) {
                // 银行卡
                var
                    $bank_no = $form.find('[name="bank_no"]'),
                    $bank_username = $form.find('[name="bank_username"]'),
                    $bank_name = $form.find('[name="bank_name"]'),
                    $bank_trigger = $form.find('.trigger-select-bank-name'),
                    $province = $form.find('[name="province"]'),
                    $city = $form.find('[name="city"]'),
                    $city_trigger = $form.find('.trigger-select-province-city-area')

                // 开户行
                if ($bank_name.length && !$.trim($bank_name.val())) {
                    $.errorAnimate($bank_trigger.focus())
                    flag = false
                }
                // 开户行省市
                if ($province.length && !$province.val()) {
                    $.errorAnimate(flag
                        ? $city_trigger.focus()
                        : $city_trigger)
                    flag = false
                }
                if ($city.length && !$city.val()) {
                    $.errorAnimate(flag
                        ? $city_trigger.focus()
                        : $city_trigger)
                    flag = false
                }
                // 开户账号
                if ($bank_no.length && !$.trim($bank_no.val())) {
                    $.errorAnimate(flag
                        ? $bank_no.focus()
                        : $bank_no)
                    flag = false
                }
                // 开户人姓名
                if ($bank_username.length && !$.trim($bank_username.val())) {
                    $.errorAnimate(flag
                        ? $bank_username.focus()
                        : $bank_username)
                    flag = false
                }

            }

            return flag
        }

        // 绑定提交表单事件
        function bindEventSubmitForm($form) {
            if (!($form && $form.length)) {
                return
            }

            $form.on('submit', function (e) {
                e.preventDefault()

                var $me = $(this)

                // 验证表单
                if (!validForm($me)) {
                    return
                }

                $.ajax({
                    type: 'POST',
                    url: $me.attr('action'),
                    data: $me.serialize(),
                    dataType: 'json',
                    timeout: 5000,
                    success: function (res) {
                        try {

                            if (!res['errno']) {
                                // 提交成功
                                $.dialog.toast('提交成功', 3000)
                                tcb.closeDialog()

                                setTimeout(function () {
                                    window.XXG.redirect(tcb.setUrl2('/m/hs_xxg_order', {
                                        order_id: window.__ORDER_ID
                                    }), true)
                                }, 2000)

                                return
                            } else {
                                $.dialog.toast(res['errmsg'], 3000)
                            }
                        } catch (ex) {
                            $.dialog.toast('返回异常，请刷新页面重试', 3000)
                        }
                    },
                    error: function () {
                        $.dialog.toast('返回异常，请刷新页面重试', 3000)
                    }
                })
            })
        }

        function init() {
            var pay_method = $('.tab-item.cur').attr('data-type')
            $('[name="pay_method"]').val(pay_method)

            initBankNamePicker($FormEditPayeeBankInfo)
            initCitySelect($FormEditPayeeBankInfo)

            bindEventSubmitForm($FormEditPayeeZfbInfo)
            bindEventSubmitForm($FormEditPayeeBankInfo)
        }

        init()
    })
}()
