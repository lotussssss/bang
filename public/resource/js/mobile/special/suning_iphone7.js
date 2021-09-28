// 苏宁note7
$ (function () {
    var
        Bang = window.Bang || {}

    tcb.lazyLoadImg ({
        delay    : 1,
        interval : 1
    })


    // 申请补贴
    $ ('.trigger-btn-apply').on ('click', function (e) {
        e.preventDefault ()

        // 展示申请面板
        showApplyPanel ()
    })

    // 绑定申请预约表单相关事件
    function bindApplyFormEvent ($Form) {
        $Form = $ ($Form)
        if (!($Form && $Form.length)) {
            return
        }

        var
            $Mobile = $Form.find ('[name="mobile"]'),
            $BtnSeCode = $Form.find ('.btn-get-secode'),
            $BtnVCode = $Form.find ('.vcode-img')

        // 提交申请表单
        $Form.on ('submit', function (e) {
            e.preventDefault ()

            var
                $me = $ (this)

            // 判断是否处于可提交状态
            if (tcb.isFormDisabled ($me)) {
                return
            }

            // 验证表单
            if (!validForm ($me)) {
                return
            }

            // 以上验证全部通过，锁定表单，设置为不可再提交的锁定状态
            tcb.setFormDisabled ($me)

            $.ajax ({
                type     : 'POST',
                url      : $me.attr ('action') || '/huanxin/doSubPhone7Info',
                data     : $me.serialize (),
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {
                    //try {
                        res = typeof res == 'string'
                            ? $.parseJSON (res)
                            : res;

                        if (!res[ 'errno' ]) {
                            if (res['result']>1){

                                tcb.releaseFormDisabled ($me)

                                $.dialog.alert('您已经成功预约，您是'+res['result']+'位预约用户')
                            } else {
                                var
                                    num = window._count-0+1

                                // 申请提交成功
                                showApplySuccessPanel ({
                                    num:num
                                })
                            }

                            return
                        } else {
                            $BtnVCode.trigger('click')
                            $.dialog.toast (res[ 'errmsg' ], 3000)
                        }
                    //} catch (ex) {
                    //    $.dialog.toast ('返回异常，请刷新页面重试', 3000)
                    //}

                    tcb.releaseFormDisabled ($me);
                },
                error    : function () {
                    $BtnVCode.trigger('click')
                    $.dialog.toast ('返回异常，请刷新页面重试', 3000)
                    tcb.releaseFormDisabled ($me);
                }
            });

        })

        // 城市选择
        initCitySelect ($Form)

        // 获取短信验证码
        $BtnSeCode.on ('click', function (e) {
            e.preventDefault ()

            var
                $mobile = $Mobile,
                mobile = $.trim ($mobile.val ())

            if (!tcb.validMobile (mobile)) {

                $.errorAnimate ($mobile.focus ());
                return
            }

            // 发送验证码
            //getSecode (mobile, $ (this), '/aj/send_lpsecode')// [接口废弃]此处js是用的tpl已无Action引用

        })

        // 切换图形验证码
        $BtnVCode.on ('click', function (e) {
            e.preventDefault ()

            var
                src = '/secode/?rands=' + Math.random ()

            $ (this).attr ('src', src)
        })

    }

    // 绑定插队表单相关事件
    function bindChaduiFormEvent ($Form) {
        $Form = $ ($Form)
        if (!($Form && $Form.length)) {
            return
        }

        var
            $OldModel = $Form.find ('[name="old_model"]'),
            $OldModelSelect = $Form.find ('.select-recycle-mobile'),
            $OldModelSelectTrigger = $Form.find ('.trigger-select-recycle-mobile'),
            $Btn = $Form.find ('.btn-apply-huanxin')

        // 提交申请表单
        $Form.on ('submit', function (e) {
            e.preventDefault ()

            var
                $me = $ (this)

            // 判断是否处于可提交状态
            if (tcb.isFormDisabled ($me)) {
                return
            }

            // 验证表单
            if (!validChaduiForm ($me)) {
                return
            }

            // 以上验证全部通过，锁定表单，设置为不可再提交的锁定状态
            tcb.setFormDisabled ($me)

            $.ajax ({
                type     : 'POST',
                url      : $me.attr ('action') || '/huanxin/upPhone7ModelInfo',
                data     : $me.serialize (),
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {
                    try {
                        res = typeof res == 'string'
                            ? $.parseJSON (res)
                            : res;

                        if (!res[ 'errno' ]) {
                            var
                                num = res['result']||window._count-500

                            // 申请以旧换新提交成功
                            showApplyHuanXinSuccessPanel ({
                                num:num
                            })

                            return
                        } else {
                            $.dialog.toast (res[ 'errmsg' ], 3000)
                        }
                    } catch (ex) {
                        $.dialog.toast ('返回异常，请刷新页面重试', 3000)
                    }

                    tcb.releaseFormDisabled ($me);
                },
                error    : function () {
                    $.dialog.toast ('返回异常，请刷新页面重试', 3000)
                    tcb.releaseFormDisabled ($me);
                }
            });

        })

        // 选择旧机型
        $OldModel.on ('click', function () {
            var
                $me = $ (this)

            if ($me.prop ('readonly')) {

                triggerOpenSelectList ($ ('.select-recycle-mobile'))
            }
        })
        $OldModelSelectTrigger.on ('click', function (e) {
            e.preventDefault ()

            triggerOpenSelectList ($ ('.select-recycle-mobile'))
        })
        // 选中指定旧机机型型号
        $OldModelSelect.on ('change', function (e) {
            var
                $me = $ (this),
                val = $me.val ()

            if (val) {
                $OldModel.prop ('readonly', true).prop ('placeholder', '选择旧机型号')
            } else {
                $OldModel.prop ('readonly', false).prop ('placeholder', '请手动输入旧机型号')

                setTimeout (function () {
                    $OldModel.focus ()
                }, 100)
            }

            if (val!=='请选择'){
                $OldModel.val (val)
            }
        })
        // 提交表单
        $Btn.on ('click', function (e) {
            e.preventDefault ()

            $Form.trigger ('submit')
        })

    }

    // 向手机发送验证码
    function getSecode (mobile, $el, request_url) {
        if (!mobile) {
            return false;
        }
        if ($el && $el.length && $el.hasClass ('btn-get-secode-disabled')) {
            return false;
        }

        //request_url = (request_url || '/aj/sendsecode/') + '?mobile=' + encodeURIComponent (mobile) // [接口废弃]此处js是用的tpl已无Action引用
        //
        //$.get (request_url, function (res) {
        //    res = $.parseJSON (res);
        //
        //    if (res[ 'errno' ]) {
        //        alert (res[ 'errmsg' ]);
        //    } else {
        //        if ($el && $el.length) {
        //            var txt = $el.html (),
        //                txt2 = '秒后再发送';
        //            $el.addClass ('btn-get-secode-disabled').html ('60' + txt2);
        //
        //            tcb.distimeAnim (60, function (time) {
        //                if (time <= 0) {
        //                    $el.removeClass ('btn-get-secode-disabled').html (txt);
        //                } else {
        //                    $el.html (time + txt2);
        //                }
        //            });
        //        }
        //    }
        //})

        return true
    }

    // 验证预约表单
    function validForm ($form) {
        var
            flag = true

        var
            $city = $form.find ('[name="city"]'),
            $city_trigger = $form.find ('.trigger-select-province-city-area'),
            $username = $form.find ('[name="username"]'),
            $mobile = $form.find ('[name="mobile"]'),
            $pic_secode = $form.find ('[name="pic_secode"]'),
            $secode = $form.find ('[name="secode"]')

        // 城市
        if ($city.length && !$city.val ()) {
            $.errorAnimate ($city_trigger.focus ())
            flag = false
        }

        // 用户名
        if ($username.length && !$username.val ()) {
            $.errorAnimate (flag
                ? $username.focus ()
                : $username)
            flag = false
        }

        // 下单电话
        if ($mobile.length && !tcb.validMobile ($mobile.val ())) {
            $.errorAnimate (flag
                ? $mobile.focus ()
                : $mobile)
            flag = false
        }

        // 图片验证码
        if ($pic_secode.length && !$pic_secode.val ()) {
            $.errorAnimate (flag
                ? $pic_secode.focus ()
                : $pic_secode)
            flag = false
        }

        // 手机验证码
        if ($secode.length && !$secode.val ()) {
            $.errorAnimate (flag
                ? $secode.focus ()
                : $secode)
            flag = false
        }

        return flag
    }

    // 验证插队表单
    function validChaduiForm ($form) {
        var
            flag = true

        var $old_model = $form.find ('[name="old_model"]')

        // 旧机型
        if ($old_model.length && !$old_model.val ()) {
            $.errorAnimate (flag
                ? $old_model.focus ()
                : $old_model)
            flag = false
        }
        return flag
    }


    // 展示申请面板
    function showApplyPanel () {
        var
            st = $.tmpl ($ ('#JsSuningIphone7ApplyPanelTpl').html ()) (),
            theDialog = tcb.showDialog (st, 'suning-iphone7-apply-panel'),
            $Form = theDialog.wrap.find ('form')

        // 绑定事件
        bindApplyFormEvent ($Form)
    }

    // 展示申请成功面板
    function showApplySuccessPanel (data) {
        data = data ||{}
        data['num'] = (data['num']||0).toString().split('')

        var
            st = $.tmpl ($ ('#JsSuningIphone7ApplySuccessPanelTpl').html ()) (data),
            theDialog = tcb.showDialog (st, 'suning-iphone7-apply-panel'),
            $Form = theDialog.wrap.find ('form')

        // 绑定事件
        bindChaduiFormEvent ($Form)
    }

    // 展示申请成功面板
    function showApplyHuanXinSuccessPanel (data) {
        data = data ||{}
        data['num'] = (data['num']||0).toString().split('')

        var
            st = $.tmpl ($ ('#JsSuningIphone7ApplyHuanXinSuccessPanelTpl').html ()) (data)

        tcb.showDialog (st, 'suning-iphone7-apply-panel')
    }


    function initCitySelect ($Form) {

        var
            province = $Form.find ('.i-shipping-province').html () || '',
            city = $Form.find ('.i-shipping-city').html () || '',
            area = $Form.find ('.i-shipping-area').html () || '',
            options = {
                // 实例化的时候自动执行init函数
                flagAutoInit     : true,
                selectorTrigger  : '.trigger-select-province-city-area',
                //selectorProvince : '[name="receiver_province_id"]',
                //selectorCity     : '[name="receiver_city_id"]',
                //selectorArea     : '[name="receiver_area_id"]',
                province         : province,
                city             : city,
                area             : area,
                //show_city        : false,
                show_area        : false,
                callback_cancel  : null,
                callback_confirm : function (region) {
                    region = region || {}
                    //var
                    //    province_city_area = Array.prototype.join.call (arguments, ' ')

                    var
                        province_city_area = []
                    region[ 'province' ] && province_city_area.push (region[ 'province' ])
                    region[ 'city' ] && province_city_area.push (region[ 'city' ])
                    region[ 'area' ] && province_city_area.push (region[ 'area' ])

                    $Form.find ('[name="city"]').val (province_city_area.join(' '))
                }
            }

        // 初始化省/市/区县选择器
        Bang.AddressSelect (options)
    }

    // js触发打开select选择列表
    function triggerOpenSelectList (elem) {
        if (document.createEvent) {
            var e = document.createEvent ("MouseEvents");
            e.initMouseEvent ("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            elem[ 0 ].dispatchEvent (e);
        } else if (elem[ 0 ].fireEvent) {
            elem[ 0 ].fireEvent ("onmousedown");
        }
    }



    // 验证表单是否可提交
    function isFormDisabled ($form) {
        var flag = false;

        if (!$form.length) {
            return true;
        }
        if ($form.hasClass ('form-disabled')) {
            flag = true;
        }

        return flag;
    }

    tcb.isFormDisabled = tcb.isFormDisabled || isFormDisabled;

    // 设置表单不可提交
    function setFormDisabled ($form) {
        if (!$form.length) {
            return;
        }
        $form.addClass ('form-disabled');
    }

    tcb.setFormDisabled = tcb.setFormDisabled || setFormDisabled;

    // 设置表单可提交
    function releaseFormDisabled ($form) {
        if (!$form.length) {
            return;
        }
        $form.removeClass ('form-disabled');
    }

    tcb.releaseFormDisabled = tcb.releaseFormDisabled || releaseFormDisabled;

})

;
(function () {
    wx.ready (function () {
        var noop = function () {};
        var wxData = {};

        // 微信分享的数据
        wxData = {
            "title"   : "抢先预订iPhone7！更有3大特权等你来领！",
            "desc"    : "苏宁联合同城帮，正式开启iPhone7预约！参与以旧换新，再享新机优先购买、旧机限时加价等3大特权！",
            "link"    : window.location.href,
            "imgUrl"  : 'https://p.ssl.qhimg.com/t01506bfb5be80ba611.png',
            "success" : noop, // 用户确认分享的回调
            "cancel"  : noop // 用户取消分享
        };

        // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
        wx.onMenuShareAppMessage (wxData);
        // 点击分享到朋友圈，会执行下面这个代码
        wx.onMenuShareTimeline (wxData);
        //分享到QQ
        wx.onMenuShareQQ (wxData);
    });

} ())
