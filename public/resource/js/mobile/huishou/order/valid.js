// 验证
!function (global) {
    var
        Root = tcb.getRoot (),
        o = Root.Order

    o.valid = {}

    tcb.mix (o.valid, {

        seCode : validSeCode,

        checkLabel : validCheckLabel,

        shangMenForm : validShangMenForm,
        shangMenFormFengxiu : validShangMenFormFengxiu,
        youJiForm    : validYouJiForm,
        daoDianForm  : validDaoDianForm,
        daoDianBudanForm  : validDaoDianBudanForm,

        huanXinShangMenForm : validHuanXinShangMenForm,
        huanXinYouJiForm    : validHuanXinYouJiForm,
        huanXinDaoDianForm  : validHuanXinDaoDianForm,

        schedulePickupForm : validSchedulePickupForm,
        schedulePickupForm2 : validSchedulePickupForm2,

        xxgApplyGoodPriceForm : validXxgApplyGoodPriceForm,

        isSnMember : validIsSnMember

    })

    // =================================================================
    // 公共接口 public
    // =================================================================

    function validSeCode ($Target) {
        var
            flag = true

        if (!($Target && $Target.length)) {
            flag = false
        } else {

            var
                $Form = $Target.closest ('form'),
                $mobile = $Form.find ('[name="tel"]'),
                $secode = $Form.find ('[name="secode"]'),

                mobile = $.trim ($mobile.val ()),
                secode = $.trim ($secode.val ())

            if ($Target.hasClass ('hsbtn-vcode-dis')) {
                flag = false
            } else {
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
                    err_msg = '手机号码格式错误'
                }

                // 验证图形验证码
                if (!secode){
                    $.errorAnimate ($secode)
                    $focus_el = $focus_el || $secode
                    err_msg = err_msg || '图片验证码不能为空'
                }

                if (err_msg) {
                    flag = false

                    setTimeout (function () {
                        $focus_el && $focus_el.focus ()
                    }, 500)

                    $.dialog.toast (err_msg)
                }

            }
        }

        return flag
    }

    function validCheckLabel ($Label) {
        var
            flag = true,
            $Checked = $Label.filter ('.row-hs-style-checked');
        if (!($Checked && $Checked.length)) {
            flag = false

            o.interact.scrollToTop ($Label.eq (0), true, function () {

                $.errorAnimate ($Label)
            })
        }

        return flag
    }

    function validShangMenForm ($Form) {
        var
            flag = true,
            mobile = $Form.find ('[name="tel"]'),
            secode = $Form.find ('[name="secode"]'),
            mcode = $Form.find ('[name="code"]'),
            addr = $Form.find ('[name="user_addr"]'),
            id_card = $Form.find ('[name="id_card"]'),
            agree_protocol_shangmen = $Form.find ('[name="agree_protocol"]'),
            $server_time = $Form.find('[name="server_time"]');
        var errmsg = ''

        var
            $focus_el = null
        //判断是否支持多种支付方式
        if(window.M_SHOW_OFFLINE_PAYOUT){
            var alipay = $Form.find ('[name="alipay_id"]'),
                alipay_name = $Form.find ('[name="alipay_name"]'),

                bank_name = $Form.find ('[name="bank_name"]'),
                bank_area = $Form.find ('[name="bank_area"]'),
                bank_num = $Form.find ('[name="pay_account"]'),
                bank_user = $Form.find ('[name="account_holder"]'),
                $wx_openid = $Form.find('[name="wx_openid"]'),
                $payout_method = $Form.find ('.payout-method-item').filter ('.b-radius-green');

            if ($payout_method.attr ('data-rel') == 'alipay') {
                // 支付宝收款
                $Form.find ('[name="pay_method"]').val ('alipay')

                if ($.trim (alipay.val ()).length == 0) {
                    $.errorAnimate (alipay)
                    $focus_el = $focus_el || alipay
                    flag = false
                }
                if ($.trim (alipay_name.val ()).length == 0) {
                    $.errorAnimate (alipay_name)
                    $focus_el = $focus_el || alipay_name
                    flag = false
                }

            }
            else if ($payout_method.attr ('data-rel') == 'bank') {
                // 银行卡收款
                $Form.find('[name="pay_method"]').val('bank')

                if (bank_name.val() == -1) {
                    $.errorAnimate(bank_name)
                    flag = false
                }
                if ($.trim(bank_area.val()).length == 0) {
                    $.errorAnimate($('.city-selector'))
                    flag = false
                }

                if ($.trim(bank_num.val()).length == 0) {
                    $.errorAnimate(bank_num)
                    $focus_el = $focus_el || bank_num
                    flag = false
                }

                if ($.trim(bank_user.val()).length == 0) {
                    $.errorAnimate(bank_user)
                    $focus_el = $focus_el || bank_user
                    flag = false
                }

            }
            else if ($payout_method.attr('data-rel') == 'wechat') {
                // 微信收款
                $Form.find('[name="pay_method"]').val('weixin')
                if (!$.trim($wx_openid.val())) {
                    flag = false
                    errmsg = '请用您的收款微信号扫描二维码'
                }
            }
        }

        // 上门时间
        if($server_time && $server_time.length && !$server_time.val()){
            $.errorAnimate( $server_time);
            $focus_el = $focus_el || $server_time;
            flag = false;
        }

        if (!tcb.validMobile (mobile.val ())) {
            $.errorAnimate (mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        // 图形验证码
        if (secode && secode.length) {
            if ($.trim (secode.val ()).length == 0) {
                $.errorAnimate (secode)
                $focus_el = $focus_el || secode
                flag = false
            }
        }

        if (mcode && mcode.length) {
            if ($.trim (mcode.val ()).length == 0) {
                $.errorAnimate (mcode)
                $focus_el = $focus_el || mcode
                flag = false
            }
        }

        if (addr && addr.length) {
            if ($.trim (addr.val ()).length == 0) {
                $.errorAnimate (addr)
                $focus_el = $focus_el || addr
                flag = false
            }
        }

        //验证身份证号码
        if (id_card && id_card.length) {
            if (!tcb.validIDCard ($.trim (id_card.val ()))) {
                $.errorAnimate (id_card)
                $focus_el = $focus_el || id_card
                flag = false
            }
        }

        // 回收常见问题
        if (agree_protocol_shangmen && agree_protocol_shangmen.length) {
            if (!agree_protocol_shangmen.prop ('checked')) {
                $.errorAnimate (agree_protocol_shangmen.closest ('label'))
                flag = false
            }
        }

        if (errmsg) {
            $.dialog.toast(errmsg, 2000)
        }
        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    function validShangMenFormFengxiu ($Form) {
        var flag = true,
            //手机号
            mobile = $Form.find ('[name="tel"]'),
            //图形验证码
            secode = $Form.find ('[name="secode"]'),
            //短信验证码
            mcode = $Form.find ('[name="code"]'),
            //地址
            addr = $Form.find ('[name="user_addr"]'),
            //协议
            agree_protocol_shangmen = $Form.find ('[name="agree_protocol"]'),

            alipay = $Form.find ('[name="alipay_id"]'),
            alipay_name = $Form.find ('[name="alipay_name"]'),

            bank_name = $Form.find ('[name="bank_name"]'),
            bank_area = $Form.find ('[name="bank_area"]'),
            bank_num = $Form.find ('[name="pay_account"]'),
            bank_user = $Form.find ('[name="account_holder"]');

        var $focus_el = null,
            $payout_method = $Form.find('.payout-method-item').filter('.b-radius-green')

        if (!tcb.validMobile (mobile.val ())) {
            $.errorAnimate (mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        // 图形验证码
        if (secode && secode.length) {
            if ($.trim (secode.val ()).length == 0) {
                $.errorAnimate (secode)
                $focus_el = $focus_el || secode
                flag = false
            }
        }

        if (mcode && mcode.length) {
            if ($.trim (mcode.val ()).length == 0) {
                $.errorAnimate (mcode)
                $focus_el = $focus_el || mcode
                flag = false
            }
        }

        if (addr && addr.length) {
            if ($.trim (addr.val ()).length == 0) {
                $.errorAnimate (addr)
                $focus_el = $focus_el || addr
                flag = false
            }
        }

        if ($payout_method.height() && $payout_method.attr ('data-rel') == 'alipay') {
            // 支付宝收款
            $Form.find ('[name="pay_method"]').val ('alipay')

            if ($.trim (alipay.val ()).length == 0) {
                $.errorAnimate (alipay)
                $focus_el = $focus_el || alipay
                flag = false
            }
            if ($.trim (alipay_name.val ()).length == 0) {
                $.errorAnimate (alipay_name)
                $focus_el = $focus_el || alipay_name
                flag = false
            }

        }
        else if ($payout_method.height() && $payout_method.attr ('data-rel') == 'bank'){
            // 银行卡收款
            $Form.find ('[name="pay_method"]').val ('bank')

            if (bank_name.val () == -1) {
                $.errorAnimate (bank_name)
                flag = false
            }
            if ($.trim (bank_area.val ()).length == 0) {
                $.errorAnimate ($ ('.city-selector'))
                flag = false
            }

            if ($.trim (bank_num.val ()).length == 0) {
                $.errorAnimate (bank_num)
                $focus_el = $focus_el || bank_num
                flag = false
            }

            if ($.trim (bank_user.val ()).length == 0) {
                $.errorAnimate (bank_user)
                $focus_el = $focus_el || bank_user
                flag = false
            }

        }

        // 回收常见问题
        if (agree_protocol_shangmen && agree_protocol_shangmen.length) {
            if (!agree_protocol_shangmen.prop ('checked')) {
                $.errorAnimate (agree_protocol_shangmen.closest ('label'))
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    function validYouJiForm ($Form) {
        var
            flag = true,
            username = $Form.find ('[name="saler_name"]'),
            mobile = $Form.find ('[name="tel"]'),
            $wx_openid = $Form.find('[name="wx_openid"]'),

            snpay = $Form.find ('[name="yifubao_id"]'),
            snpay_name = $Form.find ('[name="yifubao_name"]'),

            alipay = $Form.find ('[name="alipay_id"]'),
            alipay_name = $Form.find ('[name="alipay_name"]'),

            bank_name = $Form.find ('[name="bank_name"]'),
            bank_area = $Form.find ('[name="bank_area"]'),
            bank_num = $Form.find ('[name="pay_account"]'),
            bank_user = $Form.find ('[name="account_holder"]'),

            id_card = $Form.find ('[name="id_card"]'),
            secode = $Form.find ('[name="secode"]'),

            mcode = $Form.find ('[name="code"]'),

            agree_protocol_youji = $Form.find ('[name="agree_protocol"]')

        var errmsg = ''

        // 江苏移动
        if ('partner-jiangsu-yidong'==window.__TPL_TYPE){
            var $jiangsu_yidong_payout_method = $Form.find('.row-jiangsu-yidong-payout-method').filter(function(){
                return !$(this).hasClass('row-jiangsu-yidong-payout-method-disabled')
            })
            if (!$jiangsu_yidong_payout_method.find('.payout-method-radio-checked').length){
                $.errorAnimate ($jiangsu_yidong_payout_method)

                o.interact.scrollToTop ($Form.closest('.block-order-style'), true)

                return false
            }

            // 收款方式为萌鹿，那么不做验证，直接返回flag
            if ($Form.find('[name="pay_method"]').val()=='menglu'){
                return flag
            }
        }

        var
            $focus_el = null

        // 用户名（隐藏）
        if ($.trim (username.val ()).length == 0) {
            $.errorAnimate (username)
            $focus_el = $focus_el || username
            flag = false
        }

        var
            $payout_method = $Form.find ('.payout-method-item').filter ('.b-radius-green')

        // 验证收款方式

        if ($payout_method.attr ('data-rel') == 'snpay') {
            // 易付宝收款
            $Form.find ('[name="pay_method"]').val ('snpay')

            if ($.trim (snpay.val ()).length == 0) {
              $.errorAnimate (snpay)
              $focus_el = $focus_el || snpay
              flag = false
            }
            if ($.trim (snpay_name.val ()).length == 0) {
              $.errorAnimate (snpay_name)
              $focus_el = $focus_el || snpay_name
              flag = false
            }

        }
        else if ($payout_method.attr ('data-rel') == 'alipay') {
            // 支付宝收款
            $Form.find ('[name="pay_method"]').val ('alipay')

            if ($.trim (alipay.val ()).length == 0) {
                $.errorAnimate (alipay)
                $focus_el = $focus_el || alipay
                flag = false
            }
            if ($.trim (alipay_name.val ()).length == 0) {
                $.errorAnimate (alipay_name)
                $focus_el = $focus_el || alipay_name
                flag = false
            }

        }
        else if ($payout_method.attr ('data-rel') == 'bank'){
            // 银行卡收款
            $Form.find ('[name="pay_method"]').val ('bank')


            if (bank_name.val () == -1) {
                $.errorAnimate (bank_name)
                flag = false
            }

            if ($.trim (bank_area.val ()).length == 0) {
                $.errorAnimate ($ ('.city-selector'))
                flag = false
            }

            if ($.trim (bank_num.val ()).length == 0) {
                $.errorAnimate (bank_num)
                $focus_el = $focus_el || bank_num
                flag = false
            }

            if ($.trim (bank_user.val ()).length == 0) {
                $.errorAnimate (bank_user)
                $focus_el = $focus_el || bank_user
                flag = false
            }

        }
        else if ($payout_method.attr ('data-rel') == 'wechat') {
            // 微信收款
            $Form.find ('[name="pay_method"]').val ('weixin')
            if (!$.trim($wx_openid.val())) {
                flag = false
                errmsg = '请用您的收款微信号扫描二维码'
            }
        }

        // 手机号
        if (!tcb.validMobile ($.trim (mobile.val ()))) {
            $.errorAnimate (mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        // 图形验证码
        if (secode && secode.length) {
            if ($.trim (secode.val ()).length == 0) {
                $.errorAnimate (secode)
                $focus_el = $focus_el || secode
                flag = false
            }
        }

        // 短信验证码
        if (mcode && mcode.length) {
            if ($.trim (mcode.val ()).length == 0) {
                $.errorAnimate (mcode)
                $focus_el = $focus_el || mcode
                flag = false
            }
        }

        //验证身份证号码（个别活动）
        if (id_card && id_card.length) {
            if (!tcb.validIDCard ($.trim (id_card.val ()))) {
                $.errorAnimate (id_card)
                $focus_el = $focus_el || id_card
                flag = false
            }
        }

        // 回收常见问题
        if (agree_protocol_youji && agree_protocol_youji.length) {
            if (!agree_protocol_youji.prop ('checked')) {
                $.errorAnimate (agree_protocol_youji.closest ('label'))
                flag = false
            }
        }

        if (errmsg) {
            $.dialog.toast(errmsg, 2000)
        }
        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    // 验证到店提交表单
    function validDaoDianForm ($Form) {
        var
            flag = true,
            $shop_id = $Form.find ('[name="shop_id"]'),
            mobile = $Form.find ('[name="tel"]'),
            secode = $Form.find ('[name="secode"]'),
            mcode = $Form.find ('[name="code"]'),
            addr = $Form.find ('[name="user_addr"]'),
            id_card = $Form.find ('[name="id_card"]'),
            agree_protocol_shangmen = $Form.find ('[name="agree_protocol"]')

        var
            $focus_el = null

        // 到店门店
        if ($.trim ($shop_id.val ()).length == 0) {
            $.errorAnimate ($Form.find ('.daodian-addr-select-trigger'))
            flag = false
        }

        // 手机号
        if (!tcb.validMobile (mobile.val ())) {
            $.errorAnimate (mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        // 图形验证码
        if (secode && secode.length) {
            if ($.trim (secode.val ()).length == 0) {
                $.errorAnimate (secode)
                $focus_el = $focus_el || secode
                flag = false
            }
        }

        // 手机验证码
        if (mcode && mcode.length) {
            if ($.trim (mcode.val ()).length == 0) {
                $.errorAnimate (mcode)
                $focus_el = $focus_el || mcode
                flag = false
            }
        }

        // 用户地址，被隐藏字段
        if (addr && addr.length) {
            if ($.trim (addr.val ()).length == 0) {
                $.errorAnimate (addr)
                $focus_el = $focus_el || addr
                flag = false
            }
        }

        //验证身份证号码
        if (id_card && id_card.length) {
            if (!tcb.validIDCard ($.trim (id_card.val ()))) {
                $.errorAnimate (id_card)
                $focus_el = $focus_el || id_card
                flag = false
            }
        }

        // 回收常见问题
        if (agree_protocol_shangmen && agree_protocol_shangmen.length) {
            if (!agree_protocol_shangmen.prop ('checked')) {
                $.errorAnimate (agree_protocol_shangmen.closest ('label'))
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    // 验证到店补单提交表单
    function validDaoDianBudanForm ($Form) {
        var
            flag = true,
            mobile = $Form.find('[name="tel"]'),

            secode = $Form.find('[name="secode"]'),
            mcode = $Form.find('[name="code"]'),

            alipay = $Form.find('[name="alipay_id"]'),
            alipay_name = $Form.find('[name="alipay_name"]'),

            bank_name = $Form.find('[name="bank_name"]'),
            bank_area = $Form.find('[name="bank_area"]'),
            bank_num = $Form.find('[name="pay_account"]'),
            bank_user = $Form.find('[name="account_holder"]'),

            p_type = $Form.find('[name="p_type"]'),

            agree_protocol_shangmen = $Form.find('[name="agree_protocol"]')

        var $focus_el = null

        // 手机号
        if (p_type.val() == 2) {
            var reg=/^[5689]\d{7}$/;
            if (!reg.test(mobile.val())) {
                $.errorAnimate(mobile)
                $focus_el = $focus_el || mobile
                flag = false
                console.log('输入的手机号不匹配香港格式')
            }
        } else if (!tcb.validMobile(mobile.val())) {
            $.errorAnimate(mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        if (p_type.val() == 1) {
            // 图形验证码
            if (secode && secode.length) {
                if ($.trim(secode.val()).length == 0) {
                    $.errorAnimate(secode)
                    $focus_el = $focus_el || secode
                    flag = false
                }
            }
            if (mcode && mcode.length) {
                if ($.trim(mcode.val()).length == 0) {
                    $.errorAnimate(mcode)
                    $focus_el = $focus_el || mcode
                    flag = false
                }
            }
        }

        var withPayment = $Form.attr('data-with-payment') > 0 // true：表示需要支持支付，false：表示不需要支付
        var $payout_method = $Form.find ('.payout-method-item').filter ('.b-radius-green')

        // 验证收款方式
        if(!withPayment){}
        else if ($payout_method.attr ('data-rel') == 'alipay') {
            // 支付宝收款
            $Form.find ('[name="pay_method"]').val ('alipay')

            if ($.trim (alipay.val ()).length == 0) {
                $.errorAnimate (alipay)
                $focus_el = $focus_el || alipay
                flag = false
            }
            if ($.trim (alipay_name.val ()).length == 0) {
                $.errorAnimate (alipay_name)
                $focus_el = $focus_el || alipay_name
                flag = false
            }

        }
        else if ($payout_method.attr ('data-rel') == 'bank'){
            // 银行卡收款
            $Form.find ('[name="pay_method"]').val ('bank')


            if (bank_name.val () == -1) {
                $.errorAnimate (bank_name)
                flag = false
            }

            if ($.trim (bank_area.val ()).length == 0) {
                $.errorAnimate ($ ('.city-selector'))
                flag = false
            }

            if ($.trim (bank_num.val ()).length == 0) {
                $.errorAnimate (bank_num)
                $focus_el = $focus_el || bank_num
                flag = false
            }

            if ($.trim (bank_user.val ()).length == 0) {
                $.errorAnimate (bank_user)
                $focus_el = $focus_el || bank_user
                flag = false
            }

        }
        else if ($payout_method.attr ('data-rel') == 'wechat') {
            // 微信收款
            $Form.find ('[name="pay_method"]').val ('weixin')
        }
        else {
            $Form.find ('[name="pay_method"]').val ($payout_method.attr ('data-rel'))
        }

        // 回收常见问题
        if (agree_protocol_shangmen && agree_protocol_shangmen.length) {
            if (!agree_protocol_shangmen.prop ('checked')) {
                $.errorAnimate (agree_protocol_shangmen.closest ('label'))
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }


    // 验证换新上门
    function validHuanXinShangMenForm ($Form) {
        var
            flag = true,
            mobile = $Form.find ('[name="tel"]'),
            secode = $Form.find ('[name="secode"]'),
            mcode = $Form.find ('[name="code"]'),
            addr = $Form.find ('[name="user_addr"]'),
            id_card = $Form.find ('[name="id_card"]'),
            agree_protocol_shangmen = $Form.find ('[name="agree_protocol"]'),
            $server_time = $Form.find('[name="server_time"]');

        var
            $focus_el = null


        // 上门时间
        if($server_time && $server_time.length && !$server_time.val()){
            $.errorAnimate( $server_time);
            $focus_el = $focus_el || $server_time;
            flag = false;
        }

        if (!tcb.validMobile (mobile.val ())) {
            $.errorAnimate (mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        // 图形验证码
        if (secode && secode.length) {
            if ($.trim (secode.val ()).length == 0) {
                $.errorAnimate (secode)
                $focus_el = $focus_el || secode
                flag = false
            }
        }

        if (mcode && mcode.length) {
            if ($.trim (mcode.val ()).length == 0) {
                $.errorAnimate (mcode)
                $focus_el = $focus_el || mcode
                flag = false
            }
        }

        if (addr && addr.length) {
            if ($.trim (addr.val ()).length == 0) {
                $.errorAnimate (addr)
                $focus_el = $focus_el || addr
                flag = false
            }
        }

        //验证身份证号码
        if (id_card && id_card.length) {
            if (!tcb.validIDCard ($.trim (id_card.val ()))) {
                $.errorAnimate (id_card)
                $focus_el = $focus_el || id_card
                flag = false
            }
        }

        // 回收常见问题
        if (agree_protocol_shangmen && agree_protocol_shangmen.length) {
            if (!agree_protocol_shangmen.prop ('checked')) {
                $.errorAnimate (agree_protocol_shangmen.closest ('label'))
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    // 验证换新邮寄
    function validHuanXinYouJiForm ($Form) {
        var
            flag = true,
            user_name = $Form.find ('[name="user_name"]'),
            mobile = $Form.find ('[name="tel"]'),
            secode = $Form.find ('[name="secode"]'),
            mcode = $Form.find ('[name="code"]'),
            addr = $Form.find ('[name="user_addr"]'),
            id_card = $Form.find ('[name="id_card"]'),
            agree_protocol_shangmen = $Form.find ('[name="agree_protocol"]')

        var
            $focus_el = null

        if (user_name && user_name.length) {
            if ($.trim (user_name.val ()).length == 0) {
                $.errorAnimate (user_name)
                $focus_el = $focus_el || user_name
                flag = false
            }
        }

        if (!tcb.validMobile (mobile.val ())) {
            $.errorAnimate (mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        // 图形验证码
        if (secode && secode.length) {
            if ($.trim (secode.val ()).length == 0) {
                $.errorAnimate (secode)
                $focus_el = $focus_el || secode
                flag = false
            }
        }

        // 短信验证码
        if (mcode && mcode.length) {
            if ($.trim (mcode.val ()).length == 0) {
                $.errorAnimate (mcode)
                $focus_el = $focus_el || mcode
                flag = false
            }
        }

        if (addr && addr.length) {
            if ($.trim (addr.val ()).length == 0) {
                $.errorAnimate (addr)
                $focus_el = $focus_el || addr
                flag = false
            }
        }

        //验证身份证号码
        if (id_card && id_card.length) {
            if (!tcb.validIDCard ($.trim (id_card.val ()))) {
                $.errorAnimate (id_card)
                $focus_el = $focus_el || id_card
                flag = false
            }
        }

        // 回收常见问题
        if (agree_protocol_shangmen && agree_protocol_shangmen.length) {
            if (!agree_protocol_shangmen.prop ('checked')) {
                $.errorAnimate (agree_protocol_shangmen.closest ('label'))
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    // 验证换新到店
    function validHuanXinDaoDianForm ($Form) {
        var
            flag = true,
            $shop_id = $Form.find ('[name="shop_id"]'),
            mobile = $Form.find ('[name="tel"]'),
            secode = $Form.find ('[name="secode"]'),
            mcode = $Form.find ('[name="code"]'),
            addr = $Form.find ('[name="user_addr"]'),
            id_card = $Form.find ('[name="id_card"]'),
            agree_protocol_shangmen = $Form.find ('[name="agree_protocol"]')

        var
            $focus_el = null

        // 到店门店
        if ($.trim ($shop_id.val ()).length == 0) {
            $.errorAnimate ($Form.find ('.daodian-addr-select-trigger'))
            flag = false
        }

        // 手机号
        if (!tcb.validMobile (mobile.val ())) {
            $.errorAnimate (mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        // 图形验证码
        if (secode && secode.length) {
            if ($.trim (secode.val ()).length == 0) {
                $.errorAnimate (secode)
                $focus_el = $focus_el || secode
                flag = false
            }
        }

        // 手机验证码
        if (mcode && mcode.length) {
            if ($.trim (mcode.val ()).length == 0) {
                $.errorAnimate (mcode)
                $focus_el = $focus_el || mcode
                flag = false
            }
        }

        // 用户地址，被隐藏字段
        if (addr && addr.length) {
            if ($.trim (addr.val ()).length == 0) {
                $.errorAnimate (addr)
                $focus_el = $focus_el || addr
                flag = false
            }
        }

        //验证身份证号码
        if (id_card && id_card.length) {
            if (!tcb.validIDCard ($.trim (id_card.val ()))) {
                $.errorAnimate (id_card)
                $focus_el = $focus_el || id_card
                flag = false
            }
        }

        // 回收常见问题
        if (agree_protocol_shangmen && agree_protocol_shangmen.length) {
            if (!agree_protocol_shangmen.prop ('checked')) {
                $.errorAnimate (agree_protocol_shangmen.closest ('label'))
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    // 验证换新到店
    function validSchedulePickupForm ($Form) {
        var
            flag = true,
            $express_username = $Form.find ('[name="express_username"]'),
            $express_tel = $Form.find ('[name="express_tel"]'),
            $express_area = $Form.find ('[name="express_area"]'),
            $express_useraddr = $Form.find ('[name="express_useraddr"]'),
            $express_time_alias = $Form.find ('[name="express_time_alias"]')

        var
            $focus_el = null

        // 选择区县
        if ($express_area && $express_area.length) {
            if ($.trim ($express_area.val ()).length == 0) {
                $.errorAnimate ($express_area)
                $focus_el = $focus_el || $express_area
                flag = false
            }
        }

        // 寄件人姓名
        if ($express_username && $express_username.length) {
            if ($.trim ($express_username.val ()).length == 0) {
                $.errorAnimate ($express_username)
                $focus_el = $focus_el || $express_username
                flag = false
            }
        }

        // 手机号
        if (!tcb.validMobile ($express_tel.val ())) {
            $.errorAnimate ($express_tel)
            $focus_el = $focus_el || $express_tel
            flag = false
        }

        // 详细地址
        if ($express_useraddr && $express_useraddr.length) {
            if ($.trim ($express_useraddr.val ()).length == 0) {
                $.errorAnimate ($express_useraddr)
                $focus_el = $focus_el || $express_useraddr
                flag = false
            }
        }

        // 取件时间
        if ($express_time_alias && $express_time_alias.length) {
            if ($.trim ($express_time_alias.val ()).length == 0) {
                $.errorAnimate ($express_time_alias)
                $focus_el = $focus_el || $express_time_alias
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    function validSchedulePickupForm2($Form) {
        var
            flag = true,
            $express_username = $Form.find('[name="express_username"]'),
            $express_tel = $Form.find('[name="express_tel"]'),
            $express_province = $Form.find('[name="express_province"]'),
            $express_city = $Form.find('[name="express_city"]'),
            $express_area = $Form.find('[name="express_area"]'),
            $city_trigger = $Form.find('.trigger-select-province-city-area'),
            $express_useraddr = $Form.find('[name="express_useraddr"]'),
            $express_time_alias = $Form.find('[name="express_time_alias"]')

        var
            $focus_el = null

        // 省市地区
        if ($city_trigger && $city_trigger.length) {
            if ($.trim($express_province.val()).length == 0 || $.trim($express_city.val()).length == 0 || $.trim($express_area.val()).length == 0) {
                $.errorAnimate($city_trigger)
                $focus_el = $focus_el || $city_trigger
                flag = false
            }
        }

        // 寄件人姓名
        if ($express_username && $express_username.length) {
            if ($.trim($express_username.val()).length == 0) {
                $.errorAnimate($express_username)
                $focus_el = $focus_el || $express_username
                flag = false
            }
        }

        // 手机号
        if (!tcb.validMobile($express_tel.val())) {
            $.errorAnimate($express_tel)
            $focus_el = $focus_el || $express_tel
            flag = false
        }

        // 详细地址
        if ($express_useraddr && $express_useraddr.length) {
            if ($.trim($express_useraddr.val()).length == 0) {
                $.errorAnimate($express_useraddr)
                $focus_el = $focus_el || $express_useraddr
                flag = false
            }
        }

        // 取件时间
        if ($express_time_alias && $express_time_alias.length) {
            if ($.trim($express_time_alias.val()).length == 0) {
                $.errorAnimate($express_time_alias)
                $focus_el = $focus_el || $express_time_alias
                flag = false
            }
        }

        setTimeout(function () {
            $focus_el && $focus_el.focus()
        }, 500)

        return flag
    }

    function validXxgApplyGoodPriceForm($Form){
        var flag = true,
            $target_price = $Form.find ('[name="target_price"]')

        var $focus_el = null

        if ($target_price && $target_price.length) {
            if ($.trim ($target_price.val ()).length == 0) {
                $.errorAnimate ($target_price)
                $focus_el = $focus_el || $target_price
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    // 检查是否苏宁会员
    function validIsSnMember(data, callback, options) {
        options = options || {}
        if (typeof options.silent === 'undefined') {
            options.silent = true
        }
        $.ajax({
            url: tcb.setUrl2('/huodong/isSnMember'),
            data: data,
            dataType: 'json',
            type: 'GET',
            success: function (res) {
                var flag = true
                var errmsg
                if (!(res && !res.errno)) {
                    flag = false
                    errmsg = (res && res.errmsg) || '系统错误'
                    !options.silent && $.dialog.toast(errmsg)
                }
                typeof callback === 'function' && callback(flag, errmsg)
            },
            error: function (err) {
                var flag = false
                var errmsg = (err && err.statusText) || '系统错误'
                !options.silent && $.dialog.toast(errmsg)
                typeof callback === 'function' && callback(flag, errmsg)
            }
        })
    }


    // =================================================================
    // 私有接口 private
    // =================================================================



} (this)
