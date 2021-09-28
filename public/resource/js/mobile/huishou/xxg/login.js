!function () {
    if (!(window.__PAGE == 'xxg-login' || window.__PAGE == 'xxg-suning-bind-mobile')) {
        return
    }

    $ (function () {

        var $FormLogin = $ ('#FormLogin'),
            $BtnGetSmsCode = $FormLogin.find ('.btn-get-sms-code'),
            //图片验证码 (img)
            $VcodeImg = $FormLogin.find ('.vcode-img'),
            //图片验证码 (input)
            $PicSecode = $FormLogin.find ('[name="pic_secode"]'),
            $MobileZone = $FormLogin.find('[name="mobile_zone"]')//手机号国际码

        function initMobielZonePicker($Form){
            var pickerData = []
            $.get('/aj/doGetMobileZone',function (res) {
                if(!res.errno){
                    var mobile_zone_list = res.result

                    $.each(mobile_zone_list||{}, function(i, item){
                        pickerData.push({
                            id : i,
                            name : i+' '+item
                        })
                    })
                    Bang.Picker({
                        // 实例化的时候自动执行init函数
                        flagAutoInit     : true,
                        // 触发器
                        selectorTrigger  : $('.trigger-select-mobile-zone'),

                        col: 1,
                        data: [pickerData],
                        dataPos: [0],

                        // 回调函数(确认/取消)
                        callbackConfirm : function(inst){
                            var data = inst.options.data || [],
                                dataPos = inst.options.dataPos || [],
                                col = 0,
                                selectedData = data[ col ][ dataPos[ col] ]

                            $MobileZone.val(selectedData['id'])
                            $('.trigger-select-mobile-zone').html(selectedData['id'])
                        },
                        callbackCancel  : null
                    })
                }else {
                    $.dialog.toast (res.errmsg)
                }
            })
        }
        if($MobileZone&&$MobileZone.length){
            initMobielZonePicker($FormLogin)
        }

        $FormLogin.on ('submit', function (e) {
            e.preventDefault ()
            var $me = $FormLogin
            if ($me.attr('data-loading') || !__validLoginForm ($me)) {
                return
            }
            $me.attr('data-loading', '1')
            tcb.loadingStart()

            var dest_url = $me.find ('[name="dest_url"]').val () || '',
                from_page = $me.find ('[name="from_page"]').val () || ''

            $.post ($me.attr ('action'), $me.serialize (), function (res) {
                try {
                    res = $.parseJSON (res)

                    if (!res[ 'errno' ]) {

                        // 通知客户端登录成功
                        tcb.js2AppSetLoginSuccess (tcb.trim ($me.find ('[name="tel"]').val ()))

                        setTimeout (function () {
                            var secode = $me.find ('[name="secode"]').val ()

                            if (dest_url) {
                                // 这里的逻辑：
                                // 登录的时候secode为`999999`，表示为guest模式登录，
                                // 那么如果回跳地址包含`/m/hsXxgOption`，那么将其替换成`/m/hsXxgGuestOption`后再跳转，
                                // secode不是`999999`的时候，表示有正常管理权限的xxg登录，
                                // 如果回跳地址包含`/m/hsXxgGuestOption`，那么将其替换成`/m/hsXxgOption`后再跳转；
                                dest_url = decodeURIComponent (dest_url)
                                if (secode == '999999' && dest_url.indexOf ('/m/hsXxgOption') > -1) {

                                    dest_url = dest_url.replace ('/m/hsXxgOption', '/m/hsXxgGuestOption')
                                } else if (secode != '999999' && dest_url.indexOf ('/m/hsXxgGuestOption') > -1) {
                                    dest_url = dest_url.replace ('/m/hsXxgGuestOption', '/m/hsXxgOption')
                                }
                                return window.location.replace (dest_url)

                            }

                            if (secode == '999999') {
                                //
                                return window.location.replace (tcb.setUrl ('/m/hsXxgGuestOption', {
                                    from_page : from_page
                                }))

                            }

                            return window.location.replace (tcb.setUrl ('/m/hsXxgOption', {
                                from_page : from_page
                            }))

                        }, 100)
                    } else {
                        tcb.loadingDone()
                        $.dialog.toast (res.errmsg)
                        $me.removeAttr('data-loading')
                    }
                } catch (ex) {
                    tcb.loadingDone()
                    $.dialog.toast ("抱歉，数据错误，请稍后再试")
                    $me.removeAttr('data-loading')
                }
            })
        })



        // 获取短信验证码
        $BtnGetSmsCode.on ('click', function (e) {
            e.preventDefault ()

            var $me = $BtnGetSmsCode,
                $Form = $FormLogin

            if ($me.hasClass ('hsbtn-vcode-dis')) {
                return
            }

            if (!__validGetSmsCode ($Form)) {
                return
            }

            $me.addClass ('hsbtn-vcode-dis');

            var $mobile = $Form.find ('[name="tel"]'),
                $pic_secode = $Form.find ('[name="pic_secode"]'),
                $sms_type = $Form.find ('[name="sms_type"]'),
                $mobile_zone = $Form.find ('[name="mobile_zone"]'),
                url = '/aj/doSendXXGSmsCode',
                params = {}

                if($MobileZone&&$MobileZone.length){
                    params = {
                        'mobile'     : $mobile.val ().trim (),
                        'pic_secode' : $pic_secode.val ().trim (),
                        'sms_type'   : $sms_type.val ().trim (),
                        'mobile_zone'   : $mobile_zone.val ().trim ()
                    }
                }else {
                    params = {
                        'mobile'     : $mobile.val ().trim (),
                        'pic_secode' : $pic_secode.val ().trim (),
                        'sms_type'   : $sms_type.val ().trim ()
                    }
                }

            $.post (url, params, function (data) {
                data = JSON.parse (data);

                if (data.errno) {
                    $.dialog.toast (data.errmsg, 2000)
                    $me.removeClass ('hsbtn-vcode-dis')
                    $VcodeImg.click ()
                } else {
                    $me.html ('60秒后再次发送')
                    tcb.distimeAnim (60, function (time) {
                        if (time <= 0) {
                            $me.removeClass ('hsbtn-vcode-dis').html ('发送验证码')
                        } else {
                            $me.html (time + '秒后再次发送')
                        }
                    })
                }
            })
        })
        // 图片验证码刷新
        $VcodeImg.on ('click', function (e) {
            var $me = $VcodeImg,
                src = tcb.setUrl2('/ClosedLoop/captcha/?rands=' + Math.random ())
            $me.attr ('src', src)

            $PicSecode.val ('')
            $PicSecode.focus ()
        })

        // 验证获取手机短信验证码表单
        function __validGetSmsCode ($Form) {
            if (!($Form && $Form.length)) {
                return false
            }
            var flag = true

            var $Mobile = $Form.find ('[name="tel"]'),
                mobile_val = $Mobile.val ().trim ()



            if($MobileZone&&$MobileZone.length){

                if($MobileZone.val()=='+852'){
                    // 验证香港手机号
                    if(!(mobile_val&&/^[5689]\d{7}$/.test(mobile_val))){
                        flag = false
                        $Mobile.shine4Error ().focus ()
                    }
                }else {
                    if (!tcb.validMobile (mobile_val.substring(0, 11))) {
                        // 验证手机号，截取前11位来验证，
                        // 因为在正常手机号后，可能会带上尾号进行不同权限区分

                        flag = false
                        $Mobile.shine4Error ().focus ()
                    }
                }

            }else {
                if (!tcb.validMobile (mobile_val.substring(0, 11))) {
                    // 验证手机号，截取前11位来验证，
                    // 因为在正常手机号后，可能会带上尾号进行不同权限区分

                    flag = false
                    $Mobile.shine4Error ().focus ()
                }
            }

            var $PicSecode = $Form.find ('[name="pic_secode"]'),
                pic_secode_val = $PicSecode.val ().trim ()
            if (!pic_secode_val) {
                $PicSecode.shine4Error ()
                if (flag) {
                    $PicSecode.focus ()
                }
                flag = false
            }

            return flag
        }

        // 验证手机号登录表单
        function __validLoginForm ($Form) {
            if (!($Form && $Form.length)) {
                return false
            }
            var flag = true,
                $focus = null

            // var $PicSecode = $Form.find ('[name="pic_secode"]'),
            //     pic_secode_val = tcb.trim ($PicSecode.val ())
            // if (!pic_secode_val) {
            //     flag = false
            //     $focus = $focus || $PicSecode
            //     $PicSecode.shine4Error ()
            // }



            //判断是否勾选了协议
            var $checkbox = $Form.find('.agree_checkbox')
            if($checkbox && $checkbox.length){
                if (!$checkbox.is(':checked')){
                    $('.agree_label').shine4Error ().focus ()
                    flag=false
                }
            }

            if ($focus && $focus.length) {
                setTimeout (function () {
                    $focus.focus ()
                }, 300)
            }
            var loginType= $('#FormLogin').find ('[name="loginType"]').val ()
           if(loginType&&loginType=='mobile'){

               var $PicSecode = $Form.find ('[name="pic_secode"]'),
                   pic_secode_val = tcb.trim ($PicSecode.val ())
               if (!pic_secode_val) {
                   flag = false
                   $focus = $focus || $PicSecode
                   $PicSecode.shine4Error ()
               }
               var $Secode = $Form.find ('[name="secode"]'),
                   secode_val = tcb.trim ($Secode.val ())
               if (!secode_val) {
                   flag = false
                   $focus = $focus || $Secode
                   $Secode.shine4Error ()
               }

               var $Mobile = $Form.find ('[name="tel"]'),
                   mobile_val = tcb.trim ($Mobile.val ())
               if($MobileZone&&$MobileZone.length){

                   if($MobileZone.val()=='+852'){
                       // 验证香港手机号
                       if(!(mobile_val&&/^[5689]\d{7}$/.test(mobile_val))){
                           flag = false
                           $focus = $focus || $Mobile
                           $Mobile.shine4Error ()
                       }
                   }else {
                       if (!tcb.validMobile (mobile_val.substring(0, 11))) {
                           // 验证手机号，截取前11位来验证，
                           // 因为在正常手机号后，可能会带上尾号进行不同权限区分

                           flag = false
                           $focus = $focus || $Mobile
                           $Mobile.shine4Error ()
                       }
                   }

               }else {
                   if (!tcb.validMobile (mobile_val.substring(0, 11))) {
                       // 验证手机号，截取前11位来验证，
                       // 因为在正常手机号后，可能会带上尾号进行不同权限区分

                       flag = false
                       $focus = $focus || $Mobile
                       $Mobile.shine4Error ()
                   }
               }


           }else if(loginType&&loginType=='user'){


               var $user_name = $Form.find ('[name="user_name"]'),
                   user_name = tcb.trim ($user_name.val ())
               if (!user_name) {
                   flag = false
                   $focus = $focus || $user_name
                   $user_name.shine4Error ()
               }


               var $password = $Form.find ('[name="password"]'),
                   password = tcb.trim ($password.val ())
               if (!password) {
                   flag = false
                   $focus = $focus || $password
                   $password.shine4Error ()
               }



           }else{
               var $Mobile = $Form.find ('[name="tel"]'),
                   mobile_val = tcb.trim ($Mobile.val ())
               if($MobileZone&&$MobileZone.length){

                   if($MobileZone.val()=='+852'){
                       // 验证香港手机号
                       if(!(mobile_val&&/^[5689]\d{7}$/.test(mobile_val))){
                           flag = false
                           $focus = $focus || $Mobile
                           $Mobile.shine4Error ()
                       }
                   }else {
                       if (!tcb.validMobile (mobile_val.substring(0, 11))) {
                           // 验证手机号，截取前11位来验证，
                           // 因为在正常手机号后，可能会带上尾号进行不同权限区分

                           flag = false
                           $focus = $focus || $Mobile
                           $Mobile.shine4Error ()
                       }
                   }

               }else {
                   if (!tcb.validMobile (mobile_val.substring(0, 11))) {
                       // 验证手机号，截取前11位来验证，
                       // 因为在正常手机号后，可能会带上尾号进行不同权限区分

                       flag = false
                       $focus = $focus || $Mobile
                       $Mobile.shine4Error ()
                   }
               }

           }


            return flag
        }
    })

} ()
