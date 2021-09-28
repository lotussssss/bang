var YuyueKuaidi = (function(){

    var
        Root = tcb.getRoot (),
        o = Root.Order

    // 获取果果相关信息
    function __getGuoGuoForm (order_id, redirect_url, callback) {
        if (!order_id) {
            return $.dialog.toast ('订单号不能为空', 2000)
        }

        $.ajax ({
            type     : 'GET',
            url      : tcb.setUrl2('/huishou/doGetGuoguoForm'),
            data     : {
                parent_id : order_id
            },
            dataType : 'json',
            timeout  : 5000,
            success  : function (res) {

                if (res[ 'errno' ]) {
                    window.location.href = redirect_url

                    return //$.dialog.toast (res[ 'errmsg' ], 2000)
                }

                typeof callback === 'function' && callback (res[ 'result' ])

                // 天机汇帮卖寄件地区选择改为省市区都可选
                window.__IS_TJH_BANGMAI && initCitySelect($('.form-schedule-pickup'))
            },
            error    : function () {
                window.location.href = redirect_url
                //$.dialog.toast ('系统异常，请重试', 2000)
            }
        })

    }

    // 城市选择器
    function initCitySelect($form) {

        var
            $trigger = $form.find('.trigger-select-province-city-area'),
            province = $form.find('.i-shipping-province').html() || '',
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

                    // $form.find('[name="express_province"]').val(region['provinceCode'])
                    // $form.find('[name="express_city"]').val(region['cityCode'])
                    // $form.find('[name="express_area"]').val(region['areaCode'])
                    $form.find('[name="express_province"]').val(region['province'])
                    $form.find('[name="express_city"]').val(region['city'])
                    $form.find('[name="express_area"]').val(region['area'])

                    var str = ''
                    // 设置省
                    str += '<span class="i-shipping-province">' + region['province'] + '</span>'
                    // 设置城市
                    str += ' <span class="i-shipping-city">' + region['city'] + '</span>'
                    // 设置区县
                    str += ' <span class="i-shipping-area">' + region['area'] + '</span>'
                    $trigger.removeClass('default').html(str)
                }
            }

        // 初始化省/市/区县选择器
        Bang.AddressSelect2(options)
    }

    // 绑定预约取件相关事件
    function __bindEventSchedulePickup ($Target, redirect_url) {
        if (!($Target && $Target.length)) {
            return
        }
        var
            $time_trigger = $Target.find('[name="express_time_alias"]'),
            $form = $Target.find('form'),
            $btn = $Target.find('.btn-submit')

        // 选择上门取件时间
        new $.datetime ($time_trigger, {
            remote  : tcb.setUrl2('/huishou/doGetAbleExpressTimeTable'),
            noStyle : true
        })

        // 预约上门取件表单
        __bindFormSubmit ({
            $form  : $form,
            $btn   : $btn,
            valid  : window.__IS_TJH_BANGMAI?'schedulePickupForm2':'schedulePickupForm',
            post   : 'postSchedulePickupForm',
            before : function ($Form) {
                var
                    $express_time_alias = $Form.find ('[name="express_time_alias"]'),
                    $express_time = $Form.find ('[name="express_time"]')

                $express_time.val('')
                if ($express_time_alias && $express_time_alias.val()){
                    var
                        date_time = $express_time_alias.val()

                    date_time = date_time.split('-')
                    if (date_time.length>1){
                        date_time.pop()
                    }
                    date_time = date_time.join('-')

                    $express_time.val(date_time)
                }
            },
            after  : function (data, errno) {
                if (errno) {
                    return
                }

                __showSchedulePickupSuccess(redirect_url)
            }
        })

    }

    // 显示预约取件成功
    function __showSchedulePickupSuccess (redirect_url) {

        var
            html_fn = $.tmpl (tcb.trim ($ ('#JsMHSSchedulePickupSuccessPanelTpl').html ())),
            html_st = html_fn ({
                data : {
                    url : redirect_url
                }
            })

        tcb.closeDialog()

        tcb.showDialog (html_st, {
            className : 'schedule-pickup-success-panel',
            withClose : false,
            middle    : true
        })

    }

    // 绑定表单提交事件
    function __bindFormSubmit (options) {
        var
            $Form = options[ '$form' ]
        if (!($Form && $Form.length)) {
            return //console.error ('表单都没有，提交个串串？')
        }
        $Form.on ('submit', function (e) {
            e.preventDefault ()

            var
                $me = $ (this)

            // before
            if (typeof options[ 'before' ] === 'function'){
                if (options[ 'before' ] ($Form)===false){
                    // before函数返回值绝等于 false 时，直接返回退出表单提交

                    return
                }
            }

            // 验证表单
            if (options[ 'valid' ] && !o.valid[ options[ 'valid' ] ] ($Form)) {

                return console.error ('表单验证失败了，检查检查呗～')
            }

            // afterValid
            if (typeof options[ 'afterValid' ] === 'function'){
                if (options[ 'afterValid' ] ($Form)===false){
                    // afterValid函数返回值绝等于 false 时，直接返回退出表单提交

                    return
                }
            }

            var
                $Btn = options[ '$btn' ] || $ ('#BtnSubmitOrderForm'),
                default_btn_text = $Btn.val()

            $Btn.addClass ('btn-disabled').val ('提交中...')
            // 提交表单数据
            o.data[ options[ 'post' ] ] ($me, function (data, errno) {

                if (errno) {
                    $Btn.removeClass ('btn-disabled').val (default_btn_text)
                }

                // after
                typeof options[ 'after' ] === 'function' && options[ 'after' ] (data, errno)

            }, function () {

                $.dialog.toast ('系统异常，请重试')

                $Btn.removeClass ('btn-disabled').val (default_btn_text)
            })

        })
    }


    return {
        getGuoGuoForm:__getGuoGuoForm,
        bindEventSchedulePickup:__bindEventSchedulePickup
    }
})();
