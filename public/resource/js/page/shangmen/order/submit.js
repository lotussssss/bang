// 订单提交
Dom.ready (function () {
    // 提交自营订单
    if (!W('.page-shangmen-order').length) {

        return
    }

    // 下单表单
    W ('#formOrder').on ('submit', function (e) {
        e.preventDefault ();

        var wForm = W (this);

        // 表单处于不可用状态
        if (tcb.isFormDisabled(wForm)){

            return false
        }
        // 将表单置于不可用状态
        tcb.setFormDisabled(wForm)

        //var bank_code = W(this).one('.bank-code');
        //var selPay = W(this).one('[name="pay_method"]:checked').val();
        var serviceType = wForm.query ('[name="service_type"]:checked').val()
        // 验证订单表单
        if (!validOrderForm (wForm)) {

            // 释放表单的不可用状态
            tcb.releaseFormDisabled(wForm)

            return false
        }

        // 防止另外两个信息同时提交，找出其他两个隐藏的预约信息框，input框均置为disabled
        wForm.query ('.yyinfo-box').filter (function (el) {
            return !W (el).isVisible ();
        }).query ('input').attr ('disabled', true);

        // 提交预约表单
        QW.Ajax.post (this.action, this, function (rs) {
            try {
                rs = JSON.parse (rs);

                if (!rs.errno) {
                    var
                        result = rs.result,
                        url = '/shangmen/pay_succ',
                        need_pay = result[ 'need_pay' ] == '1'
                            ? true
                            : false;

                    if (need_pay) {
                        url = '/shangmen/needPay'
                    }

                    // window.location.href = url+'?order_id=' + rs.result.order_id;
                    if(serviceType == 2){
                        var
                            order_id = rs.result.order_id,

                            redirect_url = url+'?order_id=' + rs.result.order_id;
                        YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {
                            var
                                html_fn = $('#JsSMSchedulePickupPanelTpl').html().trim().tmpl(),
                                html_st = html_fn ({
                                    data : {
                                        province : '',
                                        city     : res['city_name'] || window.__CITY_NAME,
                                        area_list : res['area_list']||[],
                                        user_name   : res['user_name'],
                                        mobile   : res['default_mobile'],
                                        express_addr   : res['express_addr'],
                                        order_id : order_id,
                                        url : redirect_url
                                    }
                                })

                            var
                                DialogObj = tcb.showDialog (html_st, {
                                    className : 'schedule-pickup-panel',
                                    withClose : false,
                                    middle    : true,
                                    // onClose:function () {
                                    //     window.location.href = redirect_url
                                    // }
                                })

                            // 绑定预约取件相关事件
                            YuyueKuaidi.bindEventSchedulePickup (DialogObj.wrap, redirect_url)

                        })
                    }else{
                        window.location.href = url+'?order_id=' + rs.result.order_id;
                    }

                } else {
                    alert ("抱歉，出错了。" + rs.errmsg);

                    // 释放表单的不可用状态
                    tcb.releaseFormDisabled(wForm)
                }

                W ('.yyinfo-box input').attr ('disabled', false);
            } catch (ex) {
                W ('.yyinfo-box input').attr ('disabled', false);

                alert ("系统错误请刷新重试");

                // 释放表单的不可用状态
                tcb.releaseFormDisabled(wForm)

            }
        })

    })

    $ (function () {
        $ ('.reload_secode').on ('click', function (e) {
            $ (".secode_img").attr ('src', '/secode/?rands=' + Math.random ())
        });
    });

    // 验证订单表单数据
    function validOrderForm (wForm) {
        wForm = wForm || W ('#formOrder');

        var flag = true;
        // 服务内容扩展信息验证（服务名称/品牌/型号等）
        var wExtendinfo = wForm.query ('.curr-prd-box-extendinfo');
        if (wExtendinfo && wExtendinfo.length) {
            var wSelect = wExtendinfo.query ('select');
            wSelect.forEach (function (el) {
                var wCur = W (el);
                if (!wCur.val ()) {
                    wCur.shine4Error ();
                    flag = false;
                }
            });
        }

        // 验证服务
        var wServiceType = wForm.query ('[name="service_type"]'),
            disabled_count = 0;
        wServiceType.forEach (function (el) {
            if (W (el).attr ('disabled')) {
                disabled_count++;
            }
        });
        if (disabled_count >= wServiceType.length) {
            flag = false;

            wServiceType.ancestorNode ('label').shine4Error ();
        }

        // 验证选定的服务方式的预约信息表单
        var wServiceTypeChecked = W ('.service-type:checked');
        // 没有选中任何服务方式
        if (!wServiceTypeChecked.length) {
            if (flag) {
                wServiceType.ancestorNode ('label').shine4Error ();
            }
            flag = false;
        }
        // 上门维修
        else if (wServiceTypeChecked.val () == 1) {
            flag = validShangmenInfo (flag, wForm);
        }
        // 邮寄维修
        else if (wServiceTypeChecked.val () == 2) {
            flag = validYoujiInfo (flag, wForm);
        }
        // 到店维修
        else if (wServiceTypeChecked.val () == 3) {
            flag = validDaodianInfo (flag, wForm);
        }

        // 服务声明，显示、并且没有勾选
        var wFwsmProtocol = wForm.one ('[name="fwsm"]');
        var wFwsmProtocolLine = wFwsmProtocol.ancestorNode ('.service-agreement');
        if (wFwsmProtocolLine.isVisible () && !wFwsmProtocol.attr ('checked')) {
            wFwsmProtocolLine.shine4Error ();
            flag = false;
        }

        return flag;
    }

    // 验证上门信息
    function validShangmenInfo (flag, wForm) {
        var wAddr = wForm.one ('.yyinfo-box-sm [name="sm_addr"]'), // 上门地址
            wTime = wForm.one ('.yyinfo-box-sm [name="sm_time"]'), // 上门时间
            wMobile = wForm.one ('.yyinfo-box-sm [name="buyer_mobile"]'),// 联系电话
            wCode = wForm.one ('.yyinfo-box-sm [name="sms_code"]');// 短信验证码

        // 上门地址
        if (wAddr.val ().trim () == '') {
            wAddr.shine4Error ();
            flag = false;
        }
        // 上门时间
        if (wTime.val ().trim () == '') {
            wTime.shine4Error ();
            flag = false;
        }
        // 预约手机号
        if (!tcb.validMobile (wMobile.val ())) {
            wMobile.shine4Error ();
            flag = false;
        }
        // 短信验证码
        if (wCode.val ().trim () == '') {
            wCode.shine4Error ();
            flag = false;
        }

        return flag;
    }

    // 验证到店信息
    function validDaodianInfo (flag, wForm) {
        var wAddr = wForm.query ('.yyinfo-box-dd [name="dd_addr"]'), // 到店地址
            wTime = wForm.one ('.yyinfo-box-dd [name="sm_time"]'), // 到店时间
            wMobile = wForm.one ('.yyinfo-box-dd [name="buyer_mobile"]'), // 预约手机号
            wCode = wForm.one ('.yyinfo-box-dd [name="sms_code"]');// 短信验证码

        // 到店地址
        var wAddrSelected = wAddr.filter (function (el) {
            return W (el).attr ('checked');
        });
        if (!wAddrSelected.length) {
            wAddr.ancestorNode ('label').shine4Error ();
            flag = false;
        }
        // 到店时间
        if (wTime.val ().trim () == '') {
            wTime.shine4Error ();
            flag = false;
        }
        // 预约手机号
        if (!tcb.validMobile (wMobile.val ().trim ())) {
            wMobile.shine4Error ();
            flag = false;
        }
        // 短信验证码
        if (wCode.val ().trim () == '') {
            wCode.shine4Error ();
            flag = false;
        }

        return flag;
    }

    // 验证邮寄信息
    function validYoujiInfo (flag, wForm) {
        var wStat = wForm.one(".addr-stations"),    //维修站点
            wAddr = wForm.one ('.yyinfo-box-yj [name="sm_addr"]'), // 回寄地址
            wName = wForm.one ('.yyinfo-box-yj [name="sm_receiver"]'), // 收件人姓名
            wMobile = wForm.one ('.yyinfo-box-yj [name="buyer_mobile"]'), // 预约手机号
            wCode = wForm.one ('.yyinfo-box-yj [name="sms_code"]');// 短信验证码
        //维修站点
        if(wStat.query(".active").length === 0){
            wStat.query("li").shine4Error ();
            flag = false;
        }
        // 回寄地址
        if (wAddr.val ().trim () == '') {
            wAddr.shine4Error ();
            flag = false;
        }
        // 收件人姓名
        if (wName.val ().trim () == '') {
            wName.shine4Error ();
            flag = false;
        }
        // 预约手机号
        if (!tcb.validMobile (wMobile.val ())) {
            wMobile.shine4Error ();
            flag = false;
        }
        // 短信验证码
        if (wCode.val ().trim () == '') {
            wCode.shine4Error ();
            flag = false;
        }

        return flag;
    }

})
