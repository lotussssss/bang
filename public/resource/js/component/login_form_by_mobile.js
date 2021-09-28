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
            class_get_secode_disabled = options.class_get_secode_disabled || 'getsecode-disabled'

        var $LoginForm = W (selector_form),
            $BtnSeCode = $LoginForm.query (selector_get_secode),
            $BtnVCode = $LoginForm.query (selector_vcode_img),

            $mobile = $LoginForm.query ('[name="mobile"]'),
            $pic_secode = $LoginForm.query ('[name="pic_secode"]'),
            $sms_type = $LoginForm.query ('[name="sms_type"]')

        if (!($LoginForm.length&&$BtnSeCode.length&&$BtnVCode.length&&$mobile.length&&$pic_secode.length&&$sms_type.length)){
            return
        }

        // 提交登录表单
        $LoginForm.on ('submit', function (e) {
            e.preventDefault ()

            if (!validMobileCheckOrderForm ($LoginForm)) {
                return
            }

            QW.Ajax.post (form_action || $LoginForm.attr('action'), this, function (res) {
                try{
                    res = JSON.parse (res)

                    if (!res[ 'errno' ]) {
                        typeof callback === 'function' && callback(res)
                    } else {
                        alert (res.errmsg)
                    }
                } catch (ex){
                    alert ("抱歉，数据错误，请稍后再试")
                }
            })
        })

        // 获取短信验证码
        $BtnSeCode.on ('click', function (e) {
            e.preventDefault ()

            if ($BtnSeCode.hasClass (class_get_secode_disabled)) {
                return false
            }

            if ($BtnVCode.attr ('data-out-date')) {
                $BtnVCode.fire ('click')
            }

            // 验证登陆表单
            if (!validGetSmsCode ($LoginForm)) {
                return
            }

            var params = {
                'mobile'     : $mobile.val ().trim (),
                'pic_secode' : $pic_secode.val ().trim (),
                'sms_type'   : $sms_type.val ().trim ()
            }

            QW.Ajax.post ('/aj/doSendSmsCode/', params, function (res) {
                try {

                    res = QW.JSON.parse (res)
                    if (res.errno) {

                        alert (res.errmsg)

                        $BtnSeCode.removeClass (class_get_secode_disabled)
                        $BtnVCode.fire ('click')

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

            var $pic_secode = $LoginForm.query ('[name="pic_secode"]')
            $pic_secode.focus ().val ('')
        })
    }


    // 验证获取手机短信验证码表单
    function validGetSmsCode (wForm) {
        if (!(wForm && wForm.length)) {
            return false;
        }
        var flag = true;

        var wMobile = wForm.query ('[name="mobile"]'),
            mobile_val = wMobile.val ().trim ();
        if (!tcb.validMobile (mobile_val)) {
            flag = false;
            wMobile.shine4Error ().focus ();
        }

        var wPicSecode = wForm.query ('[name="pic_secode"]'),
            pic_secode_val = wPicSecode.val ().trim ();
        if (!pic_secode_val) {
            if (flag) {
                wPicSecode.shine4Error ().focus ();
            } else {
                wPicSecode.shine4Error ();
            }
            flag = false;
        }

        return flag;
    }

    // 验证手机号登录表单
    function validMobileCheckOrderForm (wForm) {
        if (!(wForm && wForm.length)) {
            return false;
        }
        var flag = true;

        var wMobile = wForm.query ('[name="mobile"]'),
            mobile_val = wMobile.val ().trim ();
        if (!tcb.validMobile (mobile_val)) {
            flag = false;
            wMobile.shine4Error ().focus ();
        }

        var wPicSecode = wForm.query ('[name="pic_secode"]'),
            pic_secode_val = wPicSecode.val ().trim ();
        if (!pic_secode_val) {
            if (flag) {
                wPicSecode.shine4Error ().focus ();
            } else {
                wPicSecode.shine4Error ();
            }
            flag = false;
        }

        var wSecode = wForm.query ('[name="secode"]'),
            secode_val = wSecode.val ().trim ();
        if (!secode_val) {
            if (flag) {
                wSecode.shine4Error ().focus ();
            } else {
                wSecode.shine4Error ();
            }
            flag = false;
        }

        var $AgreeProtocol = wForm.query ('[name="agree_protocol"]')
        if ($AgreeProtocol.length) {
            var $AgreeProtocolLabel = $AgreeProtocol.ancestorNode('label'),
                agree_protocol_checked = $AgreeProtocol.attr('checked')
            if (!agree_protocol_checked) {
                $AgreeProtocolLabel.shine4Error ()
                if (flag) {
                    $AgreeProtocolLabel.focus ()
                }
                setTimeout(function () {
                    alert('请勾选并阅读协议再登录/注册~')
                },500)
                flag = false
            }
        }

        return flag;
    }

} ()
