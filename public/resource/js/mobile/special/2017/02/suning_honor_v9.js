// 苏宁荣耀
$ (function () {
    var
        Bang = window.Bang || {}

    tcb.lazyLoadImg ({
        delay    : 1,
        interval : 1
    })

    var
        starttime = Date.parse ('2017/02/27 18:00:00'),
        curtime = window._now_time || (new Date ()).getTime ()
    Bang.startCountdown (starttime, curtime, $ ('.js-countdown-release-list'), {
        'end' : function () {

        }
    })

    // 申请补贴
    $ ('.trigger-btn-apply').on ('click', function (e) {
        e.preventDefault ()

        // 展示申请面板
        showApplyPanel ()
    })
    // 了解更多note7
    // $ ('.trigger-btn-get-more-about-note7').on ('click', function (e) {
    //     e.preventDefault ()
    //
    //     Bang.SwipeSection.getSwipeSection ()
    //
    //     var
    //         st = '<div class="block-intro">' +
    //             '<img class="w100" src="https://p.ssl.qhimg.com/t01d403a62ade52b866.jpg">' +
    //             '<img class="w100" src="https://p.ssl.qhimg.com/t01d8386bf9eb635afc.jpg">' +
    //             '<img class="w100" src="https://p.ssl.qhimg.com/t01be167ca2e836083f.jpg">' +
    //             '<img class="w100" src="https://p.ssl.qhimg.com/t01792e91d7a2760dc0.jpg">' +
    //             '<img class="w100" src="https://p.ssl.qhimg.com/t01211a3afdce561620.jpg">' +
    //             '<img class="w100" src="https://p.ssl.qhimg.com/t01969f239502dabb38.jpg">' +
    //             '<img class="w100" src="https://p.ssl.qhimg.com/t015947217b4c713057.jpg">' +
    //             '</div>' +
    //             '<div class="block-intro-btn">' +
    //             '<div class="row">' +
    //             '<div class="col-2-1"><a class="btn btn-apply" href="#">立即报名</a></div>' +
    //             '<div class="col-2-1"><a class="btn btn-go-back" href="#">返回</a></div>' +
    //             '</div>' +
    //             '</div>'
    //
    //     Bang.SwipeSection.fillSwipeSection (st)
    //
    //     Bang.SwipeSection.doLeftSwipeSection ()
    //
    //     // 申请补贴
    //     $ ('.block-intro-btn .btn-apply').on ('click', function (e) {
    //         e.preventDefault ()
    //
    //         // 展示申请面板
    //         showApplyPanel ()
    //     })
    //
    //
    //     $ ('.block-intro-btn .btn-go-back').on ('click', function (e) {
    //         e.preventDefault ()
    //
    //         Bang.SwipeSection.backLeftSwipeSection ()
    //     })
    // })

    // 绑定申请表单相关事件
    function bindApplyFormEvent ($Form) {
        $Form = $ ($Form)
        if (!($Form && $Form.length)) {
            return
        }

        var
            $OldModel = $Form.find ('[name="old_model"]'),
            $OldModelSelect = $Form.find ('.select-recycle-mobile'),
            $OldModelSelectTrigger = $Form.find ('.trigger-select-recycle-mobile'),
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
                url      : $me.attr ('action') || '/huanxin/doSubSuningInfo',
                data     : $me.serialize (),
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {
                    try {
                        res = typeof res == 'string'
                            ? $.parseJSON (res)
                            : res;

                        if (!res[ 'errno' ]) {

                            // 申请提交成功
                            showApplySuccessPanel ()

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

        // 城市选择
        initCitySelect ($Form)

        // 机型选择
        initModelPicker($Form)
        //// 选择旧机型
        //$OldModel.on ('click', function () {
        //    var
        //        $me = $ (this)
        //
        //    if ($me.prop ('readonly')) {
        //
        //        triggerOpenSelectList ($ ('.select-recycle-mobile'))
        //    }
        //})
        //$OldModelSelectTrigger.on ('click', function (e) {
        //    e.preventDefault ()
        //
        //    triggerOpenSelectList ($ ('.select-recycle-mobile'))
        //})

        // 选中指定旧机机型型号
        //$OldModelSelect.on ('change', function (e) {
        //    var
        //        $me = $ (this),
        //        val = $me.val ()
        //
        //    if (val) {
        //        if(val=='other'){
        //            $OldModel.prop ('readonly', false).prop ('placeholder', '请手动输入旧机型号')
        //
        //            setTimeout (function () {
        //                $OldModel.focus ()
        //            }, 100)
        //
        //            val =''
        //        }else {
        //            $OldModel.prop ('readonly', true).prop ('placeholder', '选择旧机型号')
        //        }
        //
        //    } else {
        //        $OldModel.prop ('readonly', true).prop ('placeholder', '选择旧机型号')
        //    }
        //
        //    $OldModel.val (val)
        //})

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
            //getSecode (mobile, $ (this), '/aj/send_lpsecode')// [接口废弃]此处js已无处使用

        })

        // 切换图形验证码
        $BtnVCode.on ('click', function (e) {
            e.preventDefault ()

            var
                src = '/secode/?rands=' + Math.random ()

            $ (this).attr ('src', src)
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

        //request_url = (request_url || '/aj/sendsecode/') + '?mobile=' + encodeURIComponent (mobile) // [接口废弃]此处js已无处使用
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

    // 验证登陆表单
    function validForm ($form) {
        var
            flag = true

        var
            $city = $form.find ('[name="city"]'),
            $city_trigger = $form.find ('.trigger-select-province-city-area'),
            $old_model = $form.find ('[name="old_model"]'),
            $username = $form.find ('[name="username"]'),
            $mobile = $form.find ('[name="mobile"]'),
            $pic_secode = $form.find ('[name="pic_secode"]'),
            $secode = $form.find ('[name="secode"]')

        // 城市
        if ($city.length && !$city.val ()) {
            $.errorAnimate ($city_trigger.focus ())
            flag = false
        }
        // 旧机型
        if ($old_model.length && !$old_model.val ()) {
            $.errorAnimate (flag
                ? $old_model.focus ()
                : $old_model)
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

    // 展示申请面板
    function showApplyPanel () {
        var
            st = $.tmpl ($ ('#JsSuningHonorV9ApplyPanelTpl').html ()) (),
            theDialog = tcb.showDialog (st, 'suning-honor-v9-apply-panel'),
            $Form = theDialog.wrap.find ('form')

        // 绑定事件
        bindApplyFormEvent ($Form)
    }

    // 展示申请成功面板
    function showApplySuccessPanel () {
        var
            st = $.tmpl ($ ('#JsSuningHonorV9ApplySuccessPanelTpl').html ()) ()

        tcb.showDialog (st, 'suning-honor-v9-apply-panel')
    }

    function initModelPicker($Form){
        var
            $OldModel = $Form.find ('[name="old_model"]')

        var
            pickerData = []
        $.each(window._modelArr||[], function(i, item){
            pickerData.push({
                id : i,
                name : item
            })
        })
        pickerData.push({
            id: 'other',
            name: '其他机型'
        })
        Bang.Picker({
            // 实例化的时候自动执行init函数
            flagAutoInit     : true,
            // 触发器
            selectorTrigger  : '.trigger-old-model-readonly, .trigger-select-recycle-mobile',

            col: 1,
            data: [pickerData],
            dataPos: [0],

            // 回调函数(确认/取消)
            callbackConfirm : function(inst){
                var data = inst.options.data || [],
                    dataPos = inst.options.dataPos || [],
                    selectedData = data[ 0 ][ dataPos[ 0 ] ]

                if (selectedData['id']=='other'){
                    $OldModel
                        .prop('data-disabled-picker', '1')
                        .prop ('readonly', false).prop ('placeholder', '请手动输入旧机型号')
                        .val('')

                    setTimeout (function () {
                        $OldModel.focus ()
                    }, 100)
                } else {
                    $OldModel
                        .prop('data-disabled-picker', '')
                        .prop ('readonly', true).prop ('placeholder', '选择旧机型号')
                        .val(selectedData['name'])
                }
            },
            callbackCancel  : null
        })
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
            "title"   : "荣耀新机半价购！报名抢！",
            "desc"    : "报名抢荣耀新机v9半价购名额！苏宁到店以旧换新，还有更多惊喜！",
            "link"    : window.location.href,
            "imgUrl"  : 'https://p2.ssl.qhmsg.com/t0153f3cf527c2e8a88.png',
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
