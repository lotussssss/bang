!function () {
    // 修修哥河南移动
    if (window.__PAGE !== 'xxg-special-henan-yidong-register') {
        return
    }

    $(function () {
        var SwipeSection = window.Bang.SwipeSection

        var $FormShopRegister = $('#FormShopRegister'),
            $FormXxgRegister = $('#FormXxgRegister'),
            $FormPlatformSign = $('#FormPlatformSign'),
            bankList = [
                '招商银行',
                '中国工商银行',
                '中国建设银行',
                '中国农业银行',
                '中国银行',
                '交通银行',
                '中国民生银行',
                '平安银行',
                '中信银行',
                '华夏银行',
                '兴业银行',
                '中国邮政储蓄银行',
                '中国光大银行',
                '上海银行',
                '北京银行',
                '渤海银行',
                '宁波银行'
            ]

        // 开户行选择器
        function initBankNamePicker($form) {
            var
                $bankName = $form.find('[name="bankName"]'),
                $trigger = $form.find('.trigger-select-bank-name')

            var
                pickerData = []
            $.each(bankList || [], function (i, item) {
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
        function initCitySelect($form) {

            var
                $trigger = $form.find('.trigger-select-province-city-area'),
                province = '河南' || $form.find('.i-shipping-province').html() || '',
                city = $form.find('.i-shipping-city').html() || '',
                area = $form.find('.i-shipping-area').html() || '',
                options = {
                    className: 'shipping-address-select-block-shop-register',
                    // 实例化的时候自动执行init函数
                    flagAutoInit: true,
                    selectorTrigger: $trigger,
                    selectorProvince: '',
                    selectorCity: '',
                    selectorArea: '',
                    province: province,
                    city: city,
                    area: area,
                    //show_city        : false,
                    // show_area        : false,
                    not_render: true,
                    callback_on_show: null,
                    callback_cancel: null,
                    callback_confirm: function (region) {
                        region = region || {}

                        $form.find('[name="province"]').val(region['provinceCode'])
                        $form.find('[name="city"]').val(region['cityCode'])
                        $form.find('[name="area"]').val(region['areaCode'])

                        var str = ''
                        // 设置省
                        str += '<span class="i-shipping-province">' + region['province'] + '</span>'
                        // 设置城市
                        str += ' <span class="i-shipping-city">' + region['city'] + '</span>'
                        // 设置区县
                        str += ' <span class="i-shipping-area">' + region['area'] + '</span>'
                        $trigger.removeClass('default').find('.txt').html(str)
                    }
                }

            // 初始化省/市/区县选择器
            Bang.AddressSelect2(options)
        }

        function initCitySelect2($form) {

            var
                $trigger = $form.find('.trigger-select-province-city-area'),
                province = $form.find('.i-shipping-province').html() || '',
                city = $form.find('.i-shipping-city').html() || '',
                options = {
                    // 实例化的时候自动执行init函数
                    flagAutoInit: true,
                    selectorTrigger: $trigger,
                    selectorProvince: '',
                    selectorCity: '',
                    selectorArea: '',
                    province: province,
                    city: city,
                    //show_city        : false,
                    show_area: false,
                    not_render: true,
                    callback_cancel: null,
                    callback_confirm: function (region) {
                        region = region || {}

                        $form.find('[name="province"]').val(region['province'])
                        $form.find('[name="city"]').val(region['city'])

                        var str = ''
                        // 设置省
                        str += '<span class="i-shipping-province">' + region['province'] + '</span>'
                        // 设置城市
                        str += ' <span class="i-shipping-city">' + region['city'] + '</span>'
                        $trigger.removeClass('default').find('.txt').html(str)
                    }
                }

            // 初始化省/市/区县选择器
            Bang.AddressSelect2(options)
        }

        // 验证图片验证码
        function validSeCode($target) {
            var
                flag = true

            if (!($target && $target.length)) {
                flag = false
            } else {

                var
                    $form = $target.closest('form'),
                    $mobile = $form.find('[name="mobile"]'),
                    $secode = $form.find('[name="secode"]'),

                    mobile = $.trim($mobile.val()),
                    secode = $.trim($secode.val())

                if ($target.hasClass('btn-get-sms-code-disabled')) {
                    flag = false
                } else {
                    var
                        $focus_el = null,
                        err_msg = ''

                    // 验证手机号
                    if (!mobile) {
                        $.errorAnimate($mobile)
                        $focus_el = $focus_el || $mobile
                        err_msg = '手机号码不能为空'
                    } else if (!tcb.validMobile(mobile)) {
                        $.errorAnimate($mobile)
                        $focus_el = $focus_el || $mobile
                        err_msg = '手机号码格式错误'
                    }

                    // 验证图片验证码
                    if (!secode) {
                        $.errorAnimate($secode)
                        $focus_el = $focus_el || $secode
                        err_msg = err_msg || '图片验证码不能为空'
                    }

                    if (err_msg) {
                        flag = false

                        setTimeout(function () {
                            $focus_el && $focus_el.focus()
                        }, 500)

                        $.dialog.toast(err_msg)
                    }

                }
            }

            return flag
        }

        // 获取短信验证码
        function getSMSCode(params, callback, error) {
            $.ajax({
                type: 'POST',
                url: '/m/doSendSmscode/',
                data: params,
                dataType: 'json',
                timeout: 5000,
                success: function (res) {

                    if (res['errno']) {
                        typeof error === 'function' && error()
                        return $.dialog.toast(res['errmsg'], 2000)
                    }
                    typeof callback === 'function' && callback(res['result'])
                },
                error: function () {
                    typeof error === 'function' && error()
                }
            })
        }

        // 验证门店注册表单
        function validFormShopRegister($form) {
            var
                flag = true,
                err_msg = '',
                $focus_el = null

            var
                $shopname = $form.find('[name="shopname"]'),
                $province = $form.find('[name="province"]'),
                $city = $form.find('[name="city"]'),
                $area = $form.find('[name="area"]'),
                $city_trigger = $form.find('.trigger-select-province-city-area'),
                $address = $form.find('[name="address"]'),
                $mobile = $form.find('[name="mobile"]'),
                $secode = $form.find('[name="secode"]'),
                $code = $form.find('[name="code"]'),
                $agree_protocol = $form.find('[name="agreeProtocol"]'),
                $agree_protocol_label = $agree_protocol.closest('label'),

                shopname = $.trim($shopname.val()),
                province = $.trim($province.val()),
                city = $.trim($city.val()),
                area = $.trim($area.val()),
                address = $.trim($address.val()),
                mobile = $.trim($mobile.val()),
                secode = $.trim($secode.val()),
                code = $.trim($code.val()),
                agree_protocol_checked = $agree_protocol.prop('checked')

            // 门店名称
            if (!shopname) {
                $.errorAnimate($shopname)
                $focus_el = $focus_el || $shopname
                err_msg = '请输入门店名称'
            }

            // 省市地区
            if (!province || !city || !area) {
                $.errorAnimate($city_trigger)
                $focus_el = $focus_el || $city_trigger
                err_msg = err_msg || '请选择省市地区'
            }

            // 详细地址
            if (!address) {
                $.errorAnimate($address)
                $focus_el = $focus_el || $address
                err_msg = err_msg || '请输入街道门牌信息'
            }

            // 手机号
            if (!mobile) {
                $.errorAnimate($mobile)
                $focus_el = $focus_el || $mobile
                err_msg = err_msg || '请输入电话号码'
            } else if (!tcb.validMobile(mobile)) {
                $.errorAnimate($mobile)
                $focus_el = $focus_el || $mobile
                err_msg = err_msg || '手机号码格式错误'
            }

            // 图片验证码
            if (!secode) {
                $.errorAnimate($secode)
                $focus_el = $focus_el || $secode
                err_msg = err_msg || '请输入图片验证码'
            }

            // 短信验证码
            if (!code) {
                $.errorAnimate($code)
                $focus_el = $focus_el || $code
                err_msg = err_msg || '请输入短信验证码'
            }

            // 协议
            if (!agree_protocol_checked) {
                $.errorAnimate($agree_protocol_label)
                $focus_el = $focus_el || $agree_protocol
                err_msg = err_msg || '请勾选并阅读协议'
            }

            if (err_msg) {
                flag = false

                setTimeout(function () {
                    $focus_el && $focus_el.focus()
                }, 500)

                $.dialog.toast(err_msg)
            }
            return flag
        }

        // 验证店员注册表单
        function validFormXxgRegister($form) {
            var
                flag = true,
                err_msg = '',
                $focus_el = null

            var
                $name = $form.find('[name="username"]'),
                $idCard = $form.find('[name="idCard"]'),
                $mobile = $form.find('[name="mobile"]'),
                $secode = $form.find('[name="secode"]'),
                $code = $form.find('[name="code"]'),
                $bankName = $form.find('[name="bankName"]'),
                $bank_trigger = $form.find('.trigger-select-bank-name'),
                $province = $form.find('[name="province"]'),
                $city = $form.find('[name="city"]'),
                $city_trigger = $form.find('.trigger-select-province-city-area'),
                $bankBranchName = $form.find('[name="bankBranchName"]'),
                $bankNo = $form.find('[name="bankNo"]'),

                name = $.trim($name.val()),
                idCard = $.trim($idCard.val()),
                mobile = $.trim($mobile.val()),
                secode = $.trim($secode.val()),
                code = $.trim($code.val()),
                bankName = $.trim($bankName.val()),
                province = $.trim($province.val()),
                city = $.trim($city.val()),
                bankBranchName = $.trim($bankBranchName.val()),
                bankNo = $.trim($bankNo.val())

            // 姓名
            if (!name) {
                $.errorAnimate($name)
                $focus_el = $focus_el || $name
                err_msg = '请输入姓名'
            }

            // 身份证号
            if (!idCard) {
                $.errorAnimate($idCard)
                $focus_el = $focus_el || $idCard
                err_msg = err_msg || '请输入身份证号'
            } else if (!tcb.validIDCard(idCard)) {
                $.errorAnimate($idCard)
                $focus_el = $focus_el || $idCard
                err_msg = err_msg || '身份证号格式错误'
            }

            // 手机号
            if (!mobile) {
                $.errorAnimate($mobile)
                $focus_el = $focus_el || $mobile
                err_msg = err_msg || '请输入电话号码'
            } else if (!tcb.validMobile(mobile)) {
                $.errorAnimate($mobile)
                $focus_el = $focus_el || $mobile
                err_msg = err_msg || '手机号码格式错误'
            }

            // 图片验证码
            if (!secode) {
                $.errorAnimate($secode)
                $focus_el = $focus_el || $secode
                err_msg = err_msg || '请输入图片验证码'
            }

            // 短信验证码
            if (!code) {
                $.errorAnimate($code)
                $focus_el = $focus_el || $code
                err_msg = err_msg || '请输入短信验证码'
            }

            // 开户行
            if (!bankName) {
                $.errorAnimate($bank_trigger)
                $focus_el = $focus_el || $bank_trigger
                err_msg = err_msg || '请选择您的开户行'
            }

            // 省市
            if (!province || !city) {
                $.errorAnimate($city_trigger)
                $focus_el = $focus_el || $city_trigger
                err_msg = err_msg || '请选择银行所在地'
            }

            // 支行
            if (!bankBranchName) {
                $.errorAnimate($bankBranchName)
                $focus_el = $focus_el || $bankBranchName
                err_msg = err_msg || '请输入支行名称'
            }

            // 银行卡号
            if (!bankNo) {
                $.errorAnimate($bankNo)
                $focus_el = $focus_el || $bankNo
                err_msg = err_msg || '请输入您的银行卡号'
            }

            if (err_msg) {
                flag = false

                setTimeout(function () {
                    $focus_el && $focus_el.focus()
                }, 500)

                $.dialog.toast(err_msg)
            }
            return flag
        }

        // 验证平台签约表单
        function validFormPlatformSign($form) {
            var
                flag = true,
                err_msg = '',
                $focus_el = null

            var
                $idName = $form.find('[name="idName"]'),
                $idNo = $form.find('[name="idNo"]'),
                $bankName = $form.find('[name="bankName"]'),
                $bank_trigger = $form.find('.trigger-select-bank-name'),
                $province = $form.find('[name="province"]'),
                $city = $form.find('[name="city"]'),
                $city_trigger = $form.find('.trigger-select-province-city-area'),
                $bankBranchName = $form.find('[name="bankBranchName"]'),
                $bankNo = $form.find('[name="bankNo"]'),
                $mobile = $form.find('[name="mobile"]'),

                idName = $.trim($idName.val()),
                idNo = $.trim($idNo.val()),
                bankName = $.trim($bankName.val()),
                province = $.trim($province.val()),
                city = $.trim($city.val()),
                bankBranchName = $.trim($bankBranchName.val()),
                bankNo = $.trim($bankNo.val()),
                mobile = $.trim($mobile.val())

            // 姓名
            if (!idName) {
                $.errorAnimate($idName)
                $focus_el = $focus_el || $idName
                err_msg = '请输入您的真实姓名'
            }

            // 身份证号
            if (!idNo) {
                $.errorAnimate($idNo)
                $focus_el = $focus_el || $idNo
                err_msg = err_msg || '请输入身份证号'
            } else if (!tcb.validIDCard(idNo)) {
                $.errorAnimate($idNo)
                $focus_el = $focus_el || $idNo
                err_msg = err_msg || '身份证号格式错误'
            }

            // 开户行
            if (!bankName) {
                $.errorAnimate($bank_trigger)
                $focus_el = $focus_el || $bank_trigger
                err_msg = err_msg || '请选择您的开户行'
            }

            // 省市
            if (!province || !city) {
                $.errorAnimate($city_trigger)
                $focus_el = $focus_el || $city_trigger
                err_msg = err_msg || '请选择银行所在地'
            }

            // 支行
            if (!bankBranchName) {
                $.errorAnimate($bankBranchName)
                $focus_el = $focus_el || $bankBranchName
                err_msg = err_msg || '请输入支行名称'
            }

            // 银行卡号
            if (!bankNo) {
                $.errorAnimate($bankNo)
                $focus_el = $focus_el || $bankNo
                err_msg = err_msg || '请输入您的银行卡号'
            }

            // 手机号
            if (!mobile) {
                $.errorAnimate($mobile)
                $focus_el = $focus_el || $mobile
                err_msg = err_msg || '请输入电话号码'
            } else if (!tcb.validMobile(mobile)) {
                $.errorAnimate($mobile)
                $focus_el = $focus_el || $mobile
                err_msg = err_msg || '手机号码格式错误'
            }

            if (err_msg) {
                flag = false

                setTimeout(function () {
                    $focus_el && $focus_el.focus()
                }, 500)

                $.dialog.toast(err_msg)
            }
            return flag
        }

        // 绑定提交表单事件
        function bindEventSubmitForm($form, validFn) {
            if (!($form && $form.length)) {
                return
            }

            $form.on('submit', function (e) {
                e.preventDefault()

                var
                    $me = $(this)

                // 验证表单
                if (!validFn($me)) {
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

                                setTimeout(function () {
                                    window.location.reload()
                                }, 3000)
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

            // 获取短信验证码
            $form.find('.btn-get-sms-code').on('click', function (e) {
                e.preventDefault()

                var
                    $me = $(this),
                    $mobile = $form.find('[name="mobile"]'),
                    $secode = $form.find('[name="secode"]')

                if (!validSeCode($me)) {
                    return
                }

                getSMSCode({
                    'user_mobile': $.trim($mobile.val()),
                    'secode': $.trim($secode.val())
                }, function (data) {
                    $me.addClass('btn-get-sms-code-disabled').html('发送成功')
                    setTimeout(function () {

                        $me.html('60秒后再次发送')

                        tcb.distimeAnim(60, function (time) {
                            if (time <= 0) {
                                $me.removeClass('btn-get-sms-code-disabled').html('发送验证码')
                            } else {
                                $me.html(time + '秒后再次发送')
                            }
                        })

                    }, 1000)

                }, function () {
                    $form.find('.vcode-img').trigger('click')
                })
            })

            // 刷新图片验证码
            $form.find('.vcode-img').on('click', function (e) {
                var
                    $secode_img = $form.find('.vcode-img'),
                    $secode = $form.find('[name="secode"]'),
                    src = '/secode/?rands=' + Math.random()

                $secode_img.attr('src', src)

                $secode.val('').focus()
            })
        }

        function showProtocol() {
            var html_fn = $.tmpl(tcb.trim($('#JsMHenanMobileRegisterProtocolTpl').html())),
                html_str = html_fn()
            SwipeSection.getSwipeSection('.swipe-section-register-protocol')
            SwipeSection.fillSwipeSection(html_str)
            SwipeSection.doLeftSwipeSection()
        }

        function init() {
            initCitySelect($FormShopRegister)
            bindEventSubmitForm($FormShopRegister, validFormShopRegister)

            initBankNamePicker($FormXxgRegister)
            initCitySelect2($FormXxgRegister)
            bindEventSubmitForm($FormXxgRegister, validFormXxgRegister)

            // initBankNamePicker($FormPlatformSign)
            // initCitySelect2($FormPlatformSign)
            // bindEventSubmitForm($FormPlatformSign, validFormPlatformSign)
        }

        init()

        tcb.bindEvent(document.body, {
            // 展开弹层
            '.js-trigger-show-protocol': function (e) {
                e.preventDefault()

                showProtocol()
            },
            // 关闭弹层
            '.js-trigger-close-protocol': function (e) {
                e.preventDefault()

                SwipeSection.backLeftSwipeSection()
            }
        })

    })
}()
