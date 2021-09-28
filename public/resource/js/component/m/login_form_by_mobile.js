!function () {
    var Bang = window.Bang = window.Bang || {};

    Bang.LoginFormByMobile = LoginFormByMobile

    function LoginFormByMobile (options, callback) {
        options = options || {}
        var
            form_action = options.form_action || '',
            selector_form = options.selector_form,
            selector_get_secode = options.selector_get_secode,
            selector_vcode_img = options.selector_vcode_img,
            class_get_secode_disabled = options.class_get_secode_disabled || 'getsecode-disabled',
            status_loading = options.status_loading || false

        var $LoginForm = $ (selector_form),
            $BtnSeCode = $LoginForm.find (selector_get_secode),
            $BtnVCode = $LoginForm.find (selector_vcode_img),

            $mobile = $LoginForm.find ('[name="mobile"]'),
            $pic_secode = $LoginForm.find ('[name="pic_secode"]'),
            $sms_type = $LoginForm.find ('[name="sms_type"]')

        if (!($LoginForm.length && $BtnSeCode.length && $BtnVCode.length && $mobile.length && $pic_secode.length)) {
            return
        }

        // 提交登录表单
        $LoginForm.on ('submit', function (e) {
            e.preventDefault ()

            if (!validMobileCheckOrderForm ($LoginForm)) {
                return
            }

            var __loading = false
            if (status_loading){
                tcb.loadingStart()
                __loading = true
            }
            $.post (form_action || $LoginForm.attr('action'), $LoginForm.serialize(), function (res) {
                tcb.loadingDone()
                __loading = false

                try{
                    res = $.parseJSON(res)

                    if (!res[ 'errno' ]) {
                        typeof callback === 'function' && callback(res)
                    } else {
                        alert (res.errmsg)
                    }
                } catch (ex){
                    alert ("抱歉，数据错误，请稍后再试")
                }
            })
            setTimeout(function () {
                if (__loading){
                    tcb.loadingDone()
                    __loading = false
                }
            }, 6000)
        })

        // 获取短信验证码
        $BtnSeCode.on ('click', function (e) {
            e.preventDefault ()

            if ($BtnSeCode.hasClass (class_get_secode_disabled)) {
                return false
            }

            if ($BtnVCode.attr ('data-out-date')) {
                $BtnVCode.trigger ('click')
            }

            // 验证登陆表单
            if (!validGetSmsCode ($LoginForm)) {
                return
            }

            var params = {
                'mobile'     : $.trim ($mobile.val ()),
                'pic_secode' : $.trim ($pic_secode.val ()),
                'sms_type'   : $.trim ($sms_type.val ())
            }

            $.post ('/aj/doSendSmsCode/', params, function (res) {
                try {

                    res = $.parseJSON(res)
                    if (res.errno) {

                        alert (res.errmsg)

                        $BtnSeCode.removeClass (class_get_secode_disabled)
                        $BtnVCode.trigger ('click')

                    } else {
                        var
                            tagName = $BtnSeCode[ 0 ].tagName.toLowerCase (),
                            btnText = tagName == 'input' ? $BtnSeCode.val () : $BtnSeCode.html ()

                        $BtnSeCode.addClass (class_get_secode_disabled)
                        $BtnVCode.attr ('data-out-date', '1')

                        tcb.distimeAnim (60, function (time) {
                            if (time <= 0) {
                                $BtnSeCode.removeClass (class_get_secode_disabled)
                                tagName == 'input' ? $BtnSeCode.val (btnText) : $BtnSeCode.html (btnText)
                            } else {
                                tagName == 'input' ? $BtnSeCode.val (time + '秒后再次发送') : $BtnSeCode.html (time + '秒后再次发送')
                            }
                        })
                    }
                } catch (ex) {
                    $BtnSeCode.removeClass (class_get_secode_disabled)
                    alert ("抱歉，数据错误，请稍后再试")
                }
            })
        })

        // 刷新图形验证码
        $BtnVCode.on ('click', function (e) {
            e.preventDefault ()

            var src = '/secode/?rands=' + Math.random ()

            $BtnVCode.attr ('src', src)

            $BtnVCode.attr ('data-out-date', '')

            var $pic_secode = $LoginForm.find ('[name="pic_secode"]')
            $pic_secode.focus ().val ('')
        })
    }


    // 验证获取手机短信验证码表单
    function validGetSmsCode ($Form) {
        if (!($Form && $Form.length)) {
            return false
        }
        var flag = true

        var $Mobile = $Form.find ('[name="mobile"]'),
            mobile_val = $.trim ($Mobile.val ())
        if (!tcb.validMobile (mobile_val)) {
            flag = false
            $.errorAnimate($Mobile.focus ())
        }

        var $PicSecode = $Form.find ('[name="pic_secode"]'),
            pic_secode_val = $.trim ($PicSecode.val ())
        if (!pic_secode_val) {
            $.errorAnimate($PicSecode)
            if (flag) {
                $PicSecode.focus ()
            }
            flag = false
        }

        return flag
    }

    // 验证手机号登录表单
    function validMobileCheckOrderForm ($Form) {
        if (!($Form && $Form.length)) {
            return false
        }
        var flag = true

        var $Mobile = $Form.find ('[name="mobile"]'),
            mobile_val = $.trim ($Mobile.val ())
        if (!tcb.validMobile (mobile_val)) {
            flag = false
            $.errorAnimate($Mobile.focus ())
        }

        var $PicSecode = $Form.find ('[name="pic_secode"]'),
            pic_secode_val = $.trim ($PicSecode.val ())
        if (!pic_secode_val) {
            $.errorAnimate($PicSecode)
            if (flag) {
                $PicSecode.focus ()
            }
            flag = false
        }

        var $Secode = $Form.find ('[name="secode"]'),
            secode_val = $.trim ($Secode.val ())
        if (!secode_val) {
            $.errorAnimate($Secode)
            if (flag) {
                $Secode.focus ()
            }
            flag = false
        }

        var $AgreeProtocol = $Form.find ('[name="agree_protocol"]')
        if ($AgreeProtocol.length) {
            var $AgreeProtocolLabel = $AgreeProtocol.closest('label'),
                agree_protocol_checked = $AgreeProtocol.prop('checked')
            if (!agree_protocol_checked) {
                $.errorAnimate($AgreeProtocolLabel)
                if (flag) {
                    $AgreeProtocolLabel.focus ()
                }
                $.dialog.toast('请勾选并阅读协议再登录/注册~')
                flag = false
            }
        }

        return flag
    }

} ()
