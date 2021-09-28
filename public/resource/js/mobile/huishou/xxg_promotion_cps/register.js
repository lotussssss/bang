!function () {
    if (window.__PAGE != 'xxg-promotion-cps-register') {
        return
    }


    // DOM Ready
    $ (function () {
        var $Form = $ ('#FormRegisterPromotionCPSXxg'),
            $FormRow = $Form.find ('.row'),
            $TriggerPicCodeImg = $Form.find ('.js-trigger-pic-code-img'),
            $BtnTriggerGetSMSCode = $Form.find ('.btn-trigger-get-sms-code'),
            btn_trigger_get_sms_code_disabled = 'btn-trigger-get-sms-code-disabled'

        var $Name = $Form.find ('[name="xxg_name"]'),
            $Mobile = $Form.find ('[name="mobile"]'),
            $PicCode = $Form.find ('[name="pic_code"]'),
            $SmsType = $Form.find ('[name="sms_type"]'),
            $SmsCode = $Form.find ('[name="code"]'),
            $IsSuning = $Form.find ('[name="is_suning"]'),
            $CityName = $Form.find ('[name="city_name"]'),
            $ShopName = $Form.find ('[name="shop_name"]'),
            $ShopId = $Form.find ('[name="shop_id"]'),
            $SupervisorMobile = $Form.find ('[name="supervisor_mobile"]')

        var __Cache = {
            ShopPickerData : []
        }

        // 提交推荐修修哥注册表单
        $Form.on ('submit', function (e) {
            e.preventDefault ()

            var $form = $ (this)
            if (!validRegisterForm ($form)) {
                return
            }

            var $BtnSubmit = $form.find ('[type="submit"]')
            if ($BtnSubmit.hasClass ('btn-disabled')) {
                return
            }
            $BtnSubmit.addClass ('btn-disabled')

            $.ajax ({
                type     : 'POST',
                url      : $form.attr ('action'),
                data     : $form.serialize (),
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {
                    if (!res[ 'errno' ]) {
                        window.location.href = tcb.setUrl2('/m/spreadHuishou')
                    } else {
                        $.dialog.toast (res[ 'errmsg' ])
                    }
                    $BtnSubmit.removeClass ('btn-disabled')
                },
                error    : function () {
                    $.dialog.toast ('网络/系统异常，请刷新页面重试')
                    $BtnSubmit.removeClass ('btn-disabled')
                }
            })

        })

        $TriggerPicCodeImg.on ('click', function (e) {
            e.preventDefault ()

            var $me = $TriggerPicCodeImg,
                src = tcb.setUrl2('/secode/?rands=' + Math.random ())

            $me.attr ('src', src)

            $me.attr ('data-out-date', '')

            var $PicCode = $Form.find ('[name="pic_code"]')
            $PicCode.focus ().val ('')
        })

        $BtnTriggerGetSMSCode.on ('click', function (e) {
            e.preventDefault ()

            var $me = $BtnTriggerGetSMSCode
            if ($me.hasClass (btn_trigger_get_sms_code_disabled)) {
                return false
            }

            if ($TriggerPicCodeImg.attr ('data-out-date')) {
                $TriggerPicCodeImg.trigger ('click')
            }

            if (!validGetSmsCode ($Form)) {
                return
            }

            var params = {
                'mobile'     : tcb.trim ($Mobile.val ()),
                'pic_secode' : tcb.trim ($PicCode.val ()),
                'sms_type'   : tcb.trim ($SmsType.val ())
            }

            $.post (tcb.setUrl2('/aj/doSendSmsCode/'), params, function (res) {
                try {

                    res = $.parseJSON (res)
                    if (res.errno) {

                        $.dialog.toast (res.errmsg)

                        $me.removeClass (btn_trigger_get_sms_code_disabled)
                        $TriggerPicCodeImg.trigger ('click')

                    } else {
                        var tagName = $me[ 0 ].tagName.toLowerCase (),
                            btnText = tagName == 'input' ? $me.val () : $me.html ()

                        $me.addClass (btn_trigger_get_sms_code_disabled)
                        $TriggerPicCodeImg.attr ('data-out-date', '1')

                        tcb.distimeAnim (60, function (time) {
                            if (time <= 0) {
                                $me.removeClass (btn_trigger_get_sms_code_disabled)
                                tagName == 'input' ? $me.val (btnText) : $me.html (btnText)
                            } else {
                                tagName == 'input' ? $me.val (time + '秒后再次发送') : $me.html (time + '秒后再次发送')
                            }
                        })
                    }
                } catch (ex) {
                    $me.removeClass (btn_trigger_get_sms_code_disabled)
                    $.dialog.toast ('抱歉，数据错误，请稍后再试')
                }
            })
        })

        // 切换是否苏宁门店
        $IsSuning.on ('click', function (e) {
            var $me = $ (this)

            if ($me.val () == '1') {
                $ ('.block-xxg-register-suning').show ()
            } else {
                $ ('.block-xxg-register-suning').hide ()
            }
        })

        // 点击row的非input，那么将焦点聚焦到input上
        $FormRow.on ('click', function (e) {
            var $me = $ (this),
                target = e.target

            if (target.nodeName.toLowerCase () == 'input') {
                return
            }

            var $focusInput = $me.find ('input').filter (function () {
                return $ (this).attr ('type') != 'hidden'
            }).eq (0)

            if ($focusInput.prop ('readonly')) {
                $focusInput.click ()
            } else {
                $focusInput.focus ()
            }
        })

        // 选择城市
        function citySelector ($selectorTrigger) {
            if (!($selectorTrigger && $selectorTrigger.length)){
                return
            }

            var province = $selectorTrigger.attr ('data-province') || '',
                city = $selectorTrigger.attr ('data-city') || '',
                area = '',
                options = {
                    // 实例化的时候自动执行init函数
                    flagAutoInit     : true,
                    selectorTrigger  : $selectorTrigger,
                    province         : province,
                    city             : city,
                    area             : area,
                    //show_city        : false,
                    show_area        : false,
                    not_render       : true,
                    callback_cancel  : null,
                    callback_confirm : function (region) {
                        region = region || {}

                        var city = region[ 'city' ] || '',
                            city_id = region[ 'city_id' ] || '',
                            province = region[ 'province' ] || '',
                            province_id = region[ 'province_id' ] || ''

                        // 城市切换没有任何变化，那么不做任何处理
                        if ($selectorTrigger.attr ('data-city') === city) {
                            return
                        }

                        $selectorTrigger
                            .attr ('data-city', city)
                            .attr ('data-city-id', city_id)
                            .attr ('data-province', province)
                            .attr ('data-province-id', province_id)
                            .val (city)

                        $ShopName.val('')
                        $ShopId.val('')

                        tcb.loadingStart()
                        getShopListByCityName(city, function(shopList){
                            if (!(shopList && shopList.length)) {
                                $ShopName.attr ('data-disabled-picker', '1')
                                $.dialog.toast ('抱歉，当前城市没有苏宁门店')
                            } else {
                                $ShopName.removeAttr ('data-disabled-picker')
                            }
                            return tcb.loadingDone()
                        })
                    }
                }

            // 初始化省/市/区县选择器
            Bang.AddressSelect (options)
        }
        citySelector ($CityName)

        // 选择门店
        function shopSelector ($selectorTrigger) {
            var pickerData = __Cache.ShopPickerData

            // 选择区县
            window.Bang.Picker ({
                flagAutoInit    : true,
                flagFilter      : true,
                selectorTrigger : $selectorTrigger,
                col             : 1,
                data            : pickerData,
                dataPos         : [ 0 ],
                dataTitle       : ['选择门店'],
                callbackTriggerBefore : function (inst) {
                    if (!(pickerData && pickerData.length == 1 && pickerData[ 0 ])) {
                        $.dialog.toast ('请先选择城市')
                        return false
                    }
                },
                callbackConfirm : function (inst) {
                    inst.getTrigger ().val (inst.options.data[ 0 ][ inst.options.dataPos[ 0 ] ].name)
                    $ShopId.val(inst.options.data[ 0 ][ inst.options.dataPos[ 0 ] ].id)
                },
                callbackCancel  : null
            })
        }
        shopSelector ($ShopName)

        // 根据城市名称，获取商店列表
        function getShopListByCityName (cityName, callback) {
            var shopList = []
            $.get ('/m/doGetShopListByCityName', { city_name : cityName }, function (res) {
                try {
                    res = $.parseJSON (res)

                    tcb.each (res.result, function (i, item) {
                        shopList.push ({
                            id   : item.shop_id,
                            name : item.shop_name
                        })
                    })

                    __Cache.ShopPickerData[0] = (shopList && shopList.length) ? shopList : null

                    $.isFunction(callback) && callback(__Cache.ShopPickerData[0])
                } catch (ex) {
                    $.isFunction(callback) && callback()
                }
            })
        }

        // 验证注册表单
        function validRegisterForm ($form) {
            var flag = true,
                $errorTarget = null

            // 修修哥姓名
            if (!tcb.trim ($Name.val ())) {
                flag = false
                $errorTarget = $errorTarget || $Name
                $Name.shine4Error ()
            }
            // 修修哥电话
            if (!tcb.validMobile (tcb.trim ($Mobile.val ()))) {
                flag = false
                $errorTarget = $errorTarget || $Mobile
                $Mobile.shine4Error ()
            }
            // 图片验证码
            if (!tcb.trim ($PicCode.val ())) {
                flag = false
                $errorTarget = $errorTarget || $PicCode
                $PicCode.shine4Error ()
            }
            // 短信验证码
            if (!tcb.trim ($SmsCode.val ())) {
                flag = false
                $errorTarget = $errorTarget || $SmsCode
                $SmsCode.shine4Error ()
            }

            // 是否苏宁门店
            var $IsSuningChecked = $IsSuning.filter (function () {
                return $ (this).prop ('checked')
            })
            if (!$IsSuningChecked.length || $IsSuningChecked.val () != '1') {
                flag = false
                $IsSuning.closest ('label').shine4Error ()

                //选中非苏宁
                if ($IsSuningChecked.val () == '0') {
                    $.dialog.toast ('暂不支持非苏宁门店人员推荐回收')
                }
            }

            // 店铺城市
            if (!tcb.trim ($CityName.val ())) {
                flag = false
                $errorTarget = $errorTarget || $CityName
                $CityName.shine4Error ()
            }
            // 店铺名称
            if (!tcb.trim ($ShopName.val ())) {
                flag = false
                $errorTarget = $errorTarget || $ShopName
                $ShopName.shine4Error ()
            }

            // 督导电话如果有输入，那么验证手机号格式是否合法
            if (tcb.trim ($SupervisorMobile.val ()) && !tcb.validMobile (tcb.trim ($SupervisorMobile.val ()))) {
                flag = false
                $errorTarget = $errorTarget || $SupervisorMobile
                $SupervisorMobile.shine4Error ()
            }

            if ($errorTarget && $errorTarget.length) {
                setTimeout (function () {
                    $errorTarget.focus ()
                }, 300)
            }

            return flag
        }

        // 验证获取手机短信验证码表单
        function validGetSmsCode ($form) {
            if (!($form && $form.length)) {
                return false
            }
            var flag = true,
                $errorTarget = null

            var mobile_val = tcb.trim ($Mobile.val ())
            if (!tcb.validMobile (mobile_val)) {
                flag = false
                $errorTarget = $errorTarget || $Mobile
                $Mobile.shine4Error ()
            }

            var pic_code_val = tcb.trim ($PicCode.val ())
            if (!pic_code_val) {
                flag = false
                $errorTarget = $errorTarget || $PicCode
                $PicCode.shine4Error ()
            }

            if ($errorTarget && $errorTarget.length) {
                setTimeout (function () {
                    $errorTarget.focus ()
                }, 300)
            }

            return flag
        }

    })

} ()
