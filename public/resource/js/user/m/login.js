// 通用登录页
$(function () {
    var
        $LoginForm = $('#loginForm'),
        $BtnGetCode = $LoginForm.find('.btn-get-sms-code'),
        $BtnVcodeImg = $LoginForm.find('.vcode-img')
    // 登录
    $LoginForm.on('submit', function (e) {
        e.preventDefault();
        // var destUrl = "{%$destUrl%}";
        var destUrl = $.queryUrl(window.location.search, 'destUrl') || '/liangpin_my/index'
        destUrl = decodeURIComponent(destUrl)

        if (!validSubmitForm($LoginForm)) {
            return
        }

        $.post($(this).attr('action'), $(this).serialize(), function (rs) {
            rs = JSON.parse(rs);

            if (rs.errno) {
                alert('抱歉，登录错误。' + rs.errmsg);
            } else {
                $.dialog.toast('登录成功~');

                try {
                    myApp.loginSucc();
                } catch (ex) {
                }

                setTimeout(function () {
                    destUrl && ( window.location.replace(destUrl) );
                }, 800);
            }
        })
    })

    // 获取短信验证码
    $BtnGetCode.on('click', function (e) {
        e.preventDefault()
        var $me = $(this);

        if ($me.hasClass('waiting')) {
            return;
        }

        if ($BtnVcodeImg.attr('data-out-date')) {
            $BtnVcodeImg.trigger('click')
        }

        if (!validGetSmSCode($LoginForm)) {
            return
        }

        var $mobile = $LoginForm.find('[name="mobile"]'),
            $pic_secode = $LoginForm.find('[name="pic_secode"]'),
            $sms_type = $LoginForm.find('[name="sms_type"]'),

            mobile = $.trim($mobile.val()),
            pic_secode = $.trim($pic_secode.val()),
            sms_type = $.trim($sms_type.val())

        $me.addClass('waiting')

        var params = {
            'mobile': mobile,
            'pic_secode': pic_secode,
            'sms_type': sms_type
        }
        $.post('/aj/doSendSmscode', params, function (rs) {
            try {
                rs = JSON.parse(rs);
                if (rs.errno) {
                    $.dialog.toast(rs.errmsg);
                    $me.removeClass('waiting');
                    $BtnVcodeImg.trigger('click');
                } else {
                    $.dialog.toast('验证码发送成功');
                    $BtnVcodeImg.attr('data-out-date', '1');
                    tcb.distimeAnim(60, function (time) {
                        if (time > 0) {
                            $me.html('等待' + time + '秒');
                        } else {
                            $me.html('获取验证码');
                            $me.removeClass('waiting');
                        }
                    })
                }
            } catch (ex) {
                $me.removeClass('waiting');
                alert("抱歉，数据错误，请稍后再试");
            }
        });
    })

    //刷新图片验证码
    $BtnVcodeImg.on('click', function (e) {
        var src = '/secode/?rands=' + Math.random();
        $BtnVcodeImg.attr('src', src);
        $BtnVcodeImg.attr('data-out-date', '');
        var $pic_secode = $LoginForm.find('[name="pic_secode"]');
        $pic_secode.focus().val('');
    })

    // 验证登录表单
    function validSubmitForm($Form) {
        var
            flag = true
        if (!($Form && $Form.length)) {
            flag = false
        } else {

            var $mobile = $Form.find('[name="mobile"]'),
                $pic_secode = $Form.find('[name="pic_secode"]'),
                $secode = $Form.find('[name="secode"]'),
                $agree_protocol = $Form.find('[name="agree_protocol"]'),
                $agree_protocol_label = $agree_protocol.closest('label'),

                mobile = $.trim($mobile.val()),
                pic_secode = $.trim($pic_secode.val()),
                secode = $.trim($secode.val()),
                agree_protocol = $agree_protocol.prop('checked')

            var
                $focus_el = null,
                err_msg = ''

            // 验证手机号
            if (!mobile) {
                $.errorAnimate ($mobile)
                $focus_el = $focus_el || $mobile
                err_msg = '手机号码不能为空'
            }
            else if (!tcb.validMobile (mobile)) {
                $.errorAnimate ($mobile)
                $focus_el = $focus_el || $mobile
                err_msg = err_msg ||'手机号码格式错误'
            }

            // 验证图片验证码
            if (!pic_secode) {
                $.errorAnimate ($pic_secode)
                $focus_el = $focus_el || $pic_secode
                err_msg = err_msg || '图片验证码不能为空'
            }

            // 验证短信验证码
            if (!secode) {
                $.errorAnimate ($secode)
                $focus_el = $focus_el || $secode
                err_msg = err_msg || '短信验证码不能为空'
            }

            // 验证协议
            if (!agree_protocol) {
                $.errorAnimate ($agree_protocol_label)
                $focus_el = $focus_el || $agree_protocol_label
                err_msg = err_msg || '请勾选并阅读协议再登录/注册~'
            }

            if (err_msg) {
                flag = false

                setTimeout (function () {
                    $focus_el && $focus_el.focus ()
                }, 500)

                $.dialog.toast (err_msg)
            }
        }

        return flag
    }

    function validGetSmSCode($Form) {
        var $mobile = $Form.find('[name="mobile"]'),
            $pic_secode = $Form.find('[name="pic_secode"]'),

            mobile = $.trim($mobile.val()),
            pic_secode = $.trim($pic_secode.val()),
            $focus_el = null,
            valid_flag = true

        if (!tcb.validMobile(mobile)) {
            $.errorAnimate($mobile)
            $focus_el = $focus_el || $mobile
        }
        if (!pic_secode) {
            $.errorAnimate($pic_secode)
            $focus_el = $focus_el || $pic_secode
        }

        if ($focus_el) {
            valid_flag = false

            setTimeout (function () {
                $focus_el && $focus_el.focus ()
            }, 500)
        }

        return valid_flag
    }
});
