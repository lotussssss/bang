// 订单预约快递
$(function(){

    var $Form = $('.form-schedule-pickup')

    bindEvent($Form)


    function bindEvent($Form){
        var $time_trigger = $Form.find('[name="yuyue_time_alias"]'),
            $BtnSeCode = $Form.find('.btn-get-secode'),
            $BtnVCode = $Form.find('.vcode-img'),
            $btn = $Form.find('.btn-submit')

        // 选择上门取件时间
        new $.datetime ($time_trigger, {
            remote  : tcb.setUrl2('/huishou/doGetAbleExpressTimeTable'),
            noStyle : true,
            onSelect : function(val){
                $Form.find('[name="yuyue_time"]').val(val)
            }
        })
        var pickerData = []
        tcb.each(window.AREA_LIST||[], function(i, item){
            pickerData.push({
                id : item.area_id,
                name : item.area_name
            })
        })
        // 选择区县
        window.Bang.Picker({
            flagAutoInit     : true,
            selectorTrigger  : $Form.find('[name="city_area"]'),
            col: 1,
            data: [pickerData],
            dataPos: [0],
            callbackConfirm : function(inst){
                inst.getTrigger ().val (inst.options.data[ 0 ][ inst.options.dataPos[ 0 ] ].name)
            },
            callbackCancel  : null
        })

        $Form.on('submit', function(e){
            e.preventDefault()

            if (!__validSchedulePickupForm($Form)){
                return
            }

            var request_url = tcb.setUrl2 ($Form.attr ('action'))

            __ajax({
                type : 'POST',
                url  : tcb.setUrl2(request_url),
                data : $Form.serialize ()
            }, function(result, errno){
                if (errno){
                    return
                }
                window.location.href = window.location.href
            })
        })

        var class_get_secode_disabled = 'btn-get-secode-disabled',
            $mobile = $Form.find('[name="mobile"]'),
            $pic_secode = $Form.find('[name="pic_secode"]'),
            $sms_type = $Form.find('[name="sms_type"]')
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
            if (!__validGetSmsCode ($Form)) {
                return
            }

            var params = {
                'mobile'     : $.trim ($mobile.val ()),
                'pic_secode' : $.trim ($pic_secode.val ()),
                'sms_type'   : $.trim ($sms_type.val ())
            }

            $.post (tcb.setUrl2('/aj/doSendSmsCode/'), params, function (res) {
                try {

                    res = $.parseJSON(res)
                    if (res.errno) {

                        $.dialog.toast(res.errmsg)

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
                    $.dialog.toast ("抱歉，数据错误，请稍后再试")
                }
            })
        })
        // 刷新图形验证码
        $BtnVCode.on ('click', function (e) {
            e.preventDefault ()

            var src = tcb.setUrl2('/secode/?rands=' + Math.random ())

            $BtnVCode.attr ('src', src)

            $BtnVCode.attr ('data-out-date', '')

            var $pic_secode = $Form.find ('[name="pic_secode"]')
            $pic_secode.focus ().val ('')
        })
    }

    // 验证获取手机短信验证码表单
    function __validGetSmsCode (wForm) {
        if (!(wForm && wForm.length)) {
            return false
        }
        var flag = true

        var wMobile = wForm.find ('[name="mobile"]'),
            mobile_val = $.trim (wMobile.val ())
        if (!tcb.validMobile (mobile_val)) {
            flag = false
            $.errorAnimate(wMobile.focus ())
        }

        var wPicSecode = wForm.find ('[name="pic_secode"]'),
            pic_secode_val = $.trim (wPicSecode.val ())
        if (!pic_secode_val) {
            $.errorAnimate(wPicSecode)
            if (flag) {
                wPicSecode.focus ()
            }
            flag = false
        }

        return flag
    }

    function __validSchedulePickupForm ($Form) {
        var flag = true,
            $city_name = $Form.find ('[name="city_name"]'),
            $city_area = $Form.find ('[name="city_area"]'),
            $user_addr = $Form.find ('[name="user_addr"]'),
            $user_name = $Form.find ('[name="user_name"]'),
            $yuyue_time_alias = $Form.find ('[name="yuyue_time_alias"]'),
            $mobile = $Form.find ('[name="mobile"]'),
            $sms_code = $Form.find ('[name="sms_code"]')

        var $focus_el = null

        // 选择区县
        if ($city_area && $city_area.length) {
            if ($.trim ($city_area.val ()).length == 0) {
                $.errorAnimate ($city_area)
                $focus_el = $focus_el || $city_area
                flag = false
            }
        }
        // 详细地址
        if ($user_addr && $user_addr.length) {
            if ($.trim ($user_addr.val ()).length == 0) {
                $.errorAnimate ($user_addr)
                $focus_el = $focus_el || $user_addr
                flag = false
            }
        }
        // 寄件人姓名
        if ($user_name && $user_name.length) {
            if ($.trim ($user_name.val ()).length == 0) {
                $.errorAnimate ($user_name)
                $focus_el = $focus_el || $user_name
                flag = false
            }
        }
        // 取件时间
        if ($yuyue_time_alias && $yuyue_time_alias.length) {
            if ($.trim ($yuyue_time_alias.val ()).length == 0) {
                $.errorAnimate ($yuyue_time_alias)
                $focus_el = $focus_el || $yuyue_time_alias
                flag = false
            }
        }

        // 手机号
        if (!tcb.validMobile ($mobile.val ())) {
            $.errorAnimate ($mobile)
            $focus_el = $focus_el || $mobile
            flag = false
        }
        // 短信验证
        if ($sms_code && $sms_code.length) {
            if ($.trim ($sms_code.val ()).length == 0) {
                $.errorAnimate ($sms_code)
                $focus_el = $focus_el || $sms_code
                flag = false
            }
        }


        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    function __ajax (params, callback, error) {
        $.ajax ({
            type     : params[ 'type' ],
            url      : tcb.setUrl2(params[ 'url' ]),
            data     : params[ 'data' ],
            dataType : 'json',
            timeout  : 5000,
            success  : function (res) {

                if (res[ 'errno' ]) {
                    $.dialog.toast (res[ 'errmsg' ], 2000)
                }
                typeof callback === 'function' && callback (res[ 'result' ], res[ 'errno' ])
            },
            error    : function () {
                typeof error === 'function' && error ()
            }
        })
    }
})