// 预约快递面板
(function(){



    // 获取果果相关信息
    function getGuoGuoForm (order_id, redirect_url, callback) {
        if (!order_id) {
            return alert ('订单号不能为空')
        }

        $.get ('/shangmen/getOrderExpressInfo/', { order_id : order_id }, function (rs) {
            rs = QW.JSON.parse (rs);

            if (!rs.errno) {
                typeof callback === 'function' && callback (rs[ 'result' ])
            } else {
                // window.location.href = redirect_url
                alert ("抱歉，出错了。" + rs.errmsg);
            }
        })
    }
    // 绑定预约取件相关事件
    function bindEventSchedulePickup ($Target, redirect_url) {
        if (!($Target && $Target.length)) {
            return
        }
        var
            $time_trigger = $Target.query('[name="express_time_alias"]'),
            $address_trigger = $Target.query('[name="express_useraddr"]'),
            $form = $Target.query('form'),
            $btn = $Target.query('.btn-submit')

        // 选择上门取件时间
        new DateTime($time_trigger, {
            remote: '/huishou/doGetAbleExpressTimeTable',
            onSelect : function(e){ }
        })

        if(AddrSuggest && typeof AddrSuggest=='function'){
            // 地址联想
            new AddrSuggest($address_trigger, {
                'showNum' : 6,
                'requireCity' : function(){ return W('.city-sel').html().trim(); }
            })
        }

        // 预约上门取件表单
        $form.on('submit', function(e){
            e.preventDefault()

            if (formSchedulePickupBefore($form)===false){
                return
            }

            if (!formSchedulePickupValid($form)){
                return
            }

            var
                default_btn_text = $btn.val()

            $btn.addClass ('btn-disabled').val ('提交中...')

            if($form.attr('submiting')=='1'){
                return
            }
            $form.attr('submiting', '1')
            var params = {
                express_yuyue_time:$form.query('[name="express_time"]').val(),
                express_mobile:$form.query('[name="express_tel"]').val(),
                express_username:$form.query('[name="express_username"]').val(),
                express_useraddr:$form.query('[name="express_useraddr"]').val(),
                order_id:$form.query('[name="parent_id"]').val(),
                express_cityname:$form.query('[name="express_cityname"]').val(),
                express_area:$form.query('[name="express_area"]').val(),
            }

            $.post($form.attr('action'), params, function(rs){
                try{
                    $form.attr('submiting', '')

                    rs = QW.JSON.parse(rs)

                    //成功
                    if(rs.errno == 0){

                        if (!rs.result) {
                            $btn.removeClass ('btn-disabled').val (default_btn_text)
                        }

                        // 预约成功
                        __showSchedulePickupSuccess (redirect_url)

                    }else{
                        $btn.removeClass ('btn-disabled').val (default_btn_text)

                        // 预约失败
                        __showSchedulePickupFail (redirect_url)
                    }
                } catch (ex){

                    $btn.removeClass ('btn-disabled').val (default_btn_text)

                    // 预约失败
                    __showSchedulePickupFail (redirect_url)

                    $form.attr('submiting', '')
                }
            })
        })
    }

    function formSchedulePickupBefore($Form){
        var
            $express_time_alias = $Form.query ('[name="express_time_alias"]'),
            $express_time = $Form.query('[name="express_time"]')

        $express_time.val ($express_time_alias.val ())
        // if ($express_time_alias && $express_time_alias.val ()) {
        //     var
        //         date_time = $express_time_alias.val ()
        //
        //     date_time = date_time.split ('-')
        //     if (date_time.length > 1) {
        //         date_time.pop ()
        //     }
        //     date_time = date_time.join ('-')
        //
        //     $express_time.val (date_time)
        // }
    }
    function formSchedulePickupValid($Form){
        var
            flag = true,
            $express_username = $Form.query ('[name="express_username"]'),
            $express_tel = $Form.query('[name="express_tel"]'),
            $express_area = $Form.query('[name="express_area"]'),
            $express_useraddr = $Form.query('[name="express_useraddr"]'),
            $express_time_alias = $Form.query('[name="express_time_alias"]')

        var
            $focus_el = null

        // 寄件人姓名
        if ($express_username && $express_username.length) {
            if (tcb.trim ($express_username.val ()).length == 0) {
                $express_username.shine4Error()
                $focus_el = $focus_el || $express_username
                flag = false
            }
        }

        // 手机号
        if (!tcb.validMobile ($express_tel.val ())) {
            $express_tel.shine4Error()
            $focus_el = $focus_el || $express_tel
            flag = false
        }

        // 区县
        if ($express_area && $express_area.length) {
            if (tcb.trim ($express_area.val ()).length == 0) {
                $express_area.shine4Error()
                $focus_el = $focus_el || $express_area
                flag = false
            }
        }

        // 详细地址
        if ($express_useraddr && $express_useraddr.length) {
            if (tcb.trim ($express_useraddr.val ()).length == 0) {
                $express_useraddr.shine4Error()
                $focus_el = $focus_el || $express_useraddr
                flag = false
            }
        }

        // 取件时间
        if ($express_time_alias && $express_time_alias.length) {
            if (tcb.trim ($express_time_alias.val ()).length == 0) {
                $express_time_alias.shine4Error()
                $focus_el = $focus_el || $express_time_alias
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }
    function formSchedulePickupAfter(data, redirect_url){
        if (!data) {
            return
        }

        __showSchedulePickupSuccess (redirect_url)
    }
    // 显示预约取件成功
    function __showSchedulePickupSuccess (redirect_url) {

        var
            html_fn = W('#JsSMSchedulePickupSuccessPanelTpl').html ().trim().tmpl(),
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
    // 显示预约取件失败
    function __showSchedulePickupFail (redirect_url) {

        var
            html_fn = W('#JsSMSchedulePickupFailPanelTpl').html ().trim().tmpl(),
            html_st = html_fn ({
                data : {
                    url : redirect_url
                }
            })

        tcb.closeDialog()

        tcb.showDialog (html_st, {
            className : 'schedule-pickup-fail-panel',
            withClose : false,
            middle    : true
        })

    }


    window.YuyueKuaidi = window.YuyueKuaidi || {}

    tcb.mix(window.YuyueKuaidi, {
        getGuoGuoForm: getGuoGuoForm,
        bindEventSchedulePickup:bindEventSchedulePickup
    })

}())