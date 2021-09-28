$(function () {
    var $Inner = $('.mainbody-inner')
    var __order_id = tcb.queryUrl(window.location.search, 'order_id')
    var __type = tcb.queryUrl(window.location.search, 'type')
    var __huodong_name = window.__HUODONG_INFO['huodong_name'] || ''
    var __defaut_pay_method = '40'// 40：支付宝；50：银行卡

    function renderFormSubmit(data) {
        var html_fn = $.tmpl(tcb.trim($('#JsXunjieFormSubmitAllowanceAccountTpl').html())),
            html_st = html_fn(data)

        $Inner.html(html_st)

        var $Form = $Inner.find('form')
        var $BlockPayInfo = $Form.find('.block-pay-info')

        if (data.pay_method == '40') {
            renderFormSubmitAlipay($BlockPayInfo, data)
        } else if (data.pay_method == '50') {
            renderFormSubmitBank($BlockPayInfo, data)
        }

        bindFormAllowance($Form)
    }

    function renderFormSubmitAlipay($target, data) {
        var html_fn = $.tmpl(tcb.trim($('#JsXunjieFormSubmitAllowanceAccountAlipayTpl').html())),
            html_st = html_fn(data)

        $target.html(html_st)
    }

    function renderFormSubmitBank($target, data) {
        var html_fn = $.tmpl(tcb.trim($('#JsXunjieFormSubmitAllowanceAccountBankTpl').html())),
            html_st = html_fn(data)

        $target.html(html_st)

        var inst = new bankAreaSelector('#provenceSelect', '#citySelect', '', __bankArea)
        inst.setFiled = function () {
            var me = this
            var province = me.Wprovence.find('option[value="' + me.Wprovence.val() + '"]').html()
            var city = me.Wcity.find('option[value="' + me.Wcity.val() + '"]').html()

            $target.find('[name="province"]').val(province)
            $target.find('[name="city"]').val(city)
        }
    }

    function renderAllowanceAccountInfo(data) {
        var html_fn = $.tmpl(tcb.trim($('#JsXunjieAllowanceAccountInfoTpl').html())),
            html_st = html_fn(data)

        $Inner.html(html_st)

        $Inner.find('.js-trigger-refresh').on('click', function (e) {
            e.preventDefault()
            var $me = $(this)
            if ($me.attr('data-disabled')) {
                return
            }
            $me.attr('data-disabled', 1)
            init(function () {
                $me.attr('data-disabled', '')
            })
        })
    }

    function bindFormAllowance($Form) {
        $Form.on('submit', function (e) {
            e.preventDefault()

            if ($Form.attr('data-disabled')) {
                return
            }
            $Form.attr('data-disabled', 1)

            if (!_validForm($Form)) {
                return $Form.attr('data-disabled', '')
            }
            tcb.loadingStart()

            var url = $Form.attr('action')
            var data = $Form.serialize()

            apiSubmitAllowanceBankInfo(url, data, function () {
                init(function () {
                    $Form.attr('data-disabled', '')
                    setTimeout(function () {
                        tcb.loadingDone()
                    }, 100)
                })
            }, function () {
                $Form.attr('data-disabled', '')
                setTimeout(function () {
                    tcb.loadingDone()
                }, 100)
            })
        })

        $Form.find('.tab-item').on('click', function (e) {
            e.preventDefault()

            var $me = $(this)
            if ($me.hasClass('active')) {
                return
            }

            tcb.loadingStart()

            var $BlockPayInfo = $me.closest('form').find('.block-pay-info')
            var pay_method = $me.attr('data-type')

            if (pay_method == '40') {
                renderFormSubmitAlipay($BlockPayInfo, {})
            } else if (pay_method == '50') {
                renderFormSubmitBank($BlockPayInfo, {})
            }

            $me.addClass('active').siblings('.active').removeClass('active')

            setTimeout(function () {
                tcb.loadingDone()
            }, 100)
        })
    }

    function _validForm($Form) {
        var flag = true,
            toast_text = ''

        var $payMethod = $Form.find('[name="pay_method"]')
        var $bankUserName = $Form.find('[name="bank_username"]')
        var $bankNo = $Form.find('[name="bank_no"]')
        var $bankName = $Form.find('[name="bank_name"]')
        var $province = $Form.find('[name="province"]')
        var $provinceTrigger = $Form.find('#provenceSelect')
        var $city = $Form.find('[name="city"]')
        var $cityTrigger = $Form.find('#citySelect')

        var pay_method = $payMethod.val()
        if (pay_method == 50) {
            // 网银
            if ($bankName.val() == -1) {
                flag = false
                $bankName.shine4Error()
                toast_text = toast_text ? toast_text : '请选择开户行'
            }
            if (!$province.val()) {
                flag = false
                $provinceTrigger.shine4Error()
                toast_text = toast_text ? toast_text : '请选择开户省份'
            }
            if (!$city.val()) {
                flag = false
                $cityTrigger.shine4Error()
                toast_text = toast_text ? toast_text : '请选择开户城市'
            }
            if (!$bankNo.val()) {
                flag = false
                $bankNo.shine4Error()
                toast_text = toast_text ? toast_text : '请输入银行账号'
            }
            if (!$bankUserName.val()) {
                flag = false
                $bankUserName.shine4Error()
                toast_text = toast_text ? toast_text : '请输入开户姓名'
            }
        } else if (pay_method == 40) {
            // 支付宝
            if (!$bankUserName.val()) {
                flag = false
                $bankUserName.shine4Error()
                toast_text = toast_text ? toast_text : '请填写支付宝姓名'
            }
            if (!$bankNo.val()) {
                flag = false
                $bankNo.shine4Error()
                toast_text = toast_text ? toast_text : '请填写支付宝账号'
            }
        }

        toast_text && $.dialog.toast(toast_text, 2000)

        return flag
    }

    function apiDoGetUserSubsidy(orderId, type, success, fail) {
        $.ajax({
            url: '/m/doGetUserSubsidy',
            data: {orderId: orderId, type: type},
            dataType: 'json',
            success: function (res) {
                if (res && !res.errno) {
                    typeof success == 'function' && success(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统异常请重试')
                    // typeof success == 'function' && success()
                    typeof fail == 'function' && fail()
                }
            },
            error: function (xhr) {
                $.dialog.toast(xhr.status + ' : ' + xhr.statusText)
                typeof fail == 'function' && fail()
            }
        })
    }

    function apiSubmitAllowanceBankInfo(url, data, success, fail) {
        $.ajax({
            url: url,
            data: data,
            dataType: 'json',
            success: function (res) {
                if (res && !res.errno) {
                    typeof success == 'function' && success(res.result)
                } else {
                    $.dialog.toast((res && res.errmsg) || '系统异常请重试')
                    typeof fail == 'function' && fail()
                }
            },
            error: function (xhr) {
                $.dialog.toast(xhr.status + ' : ' + xhr.statusText)
                typeof fail == 'function' && fail()
            }
        })
    }

    function init(complete) {
        var orderId = __order_id
        var type = __type
        var pay_method = __defaut_pay_method

        tcb.loadingStart()

        apiDoGetUserSubsidy(orderId, type, function (res) {
            if (!res) {
                // 添加账号
                renderFormSubmit({
                    huodong_name: __huodong_name,
                    url: '/m/doSetUserSubsidyBankInfo',
                    order_id: orderId,
                    type: type,
                    fail: false,
                    pay_method: pay_method
                })
            } else {
                res = res || {}
                var cash_info = res.showCashInfo || {}
                var bank_info = res.showBankField || []
                // cash_info.status = 10
                if (cash_info.status == 10) {
                    // 打款成功
                    renderAllowanceAccountInfo({
                        cash_info: cash_info,
                        bank_info: bank_info
                    })
                } else if (cash_info.status == 9) {
                    // 打款失败
                    renderFormSubmit({
                        huodong_name: __huodong_name,
                        url: '/m/doUpdateUserSubsidyBankInfo',
                        order_id: orderId,
                        type: type,
                        fail_reason: cash_info.fail_reason || '打款失败请重新填写',
                        fail: true,
                        pay_method: pay_method
                    })
                } else {
                    // 打款ing
                    renderAllowanceAccountInfo({
                        cash_info: cash_info,
                        bank_info: bank_info
                    })
                }
            }

            setTimeout(function () {
                tcb.loadingDone()
            }, 100)
            typeof complete == 'function' && complete()
        }, function () {
            setTimeout(function () {
                tcb.loadingDone()
            }, 100)
            typeof complete == 'function' && complete()
        })
    }

    init()
})
