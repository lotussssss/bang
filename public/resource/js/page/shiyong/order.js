// 下单页面
$(function(){
    var $PageOrder = $('.page-shiyong-order');
    if (!$PageOrder.length){
        return;
    }

    // 省市地区切换
    (function(){
        var flag_getall = true;/*根据省一次性获取所有的城市和区县信息*/
        var CacheProvinceList = [],
            CacheCityList = {},
            CacheAreaList = {};
        var $ProviceSelect = $('[name="receiver_province_id"]'),
            $CityList = $('[name="receiver_city_id"]'),
            $AreaList = $('[name="receiver_area_id"]');
        // 获取省份列表
        function getProvinceList(callback){
            var province_list = CacheProvinceList;
            if (province_list && province_list.length) {
                if ($.isFunction(callback)){
                    callback(province_list);
                }
            } else {
                var request_url = '/aj/doGetProvinceList';

                $.get(request_url, function(res){
                    res = $.parseJSON(res);

                    if (!res['errno']){

                        var result = res['result'];
                        CacheProvinceList = result;

                        if ($.isFunction(callback)){
                            callback(result);
                        }
                    } else {
                        // do nothing
                    }
                });
            }
        }
        // 设置省份html
        function setProvinceHtml(data, selected_name){
            var html_str = [];

            $.each(data, function(i, item){
                html_str.push('<option value="', item['province_id'], '"');
                if (selected_name===item['province_name']){
                    html_str.push(' selected');
                }
                html_str.push('>', item['province_name'], '</option>');
            });

            html_str = html_str.join('');
            $ProviceSelect.html(html_str);
            if (html_str){
                $ProviceSelect.show();
            } else {
                $ProviceSelect.hide()
            }
        }
        // 获取城市、地区列表
        function getCityAreaList(province_id, callback){
            if (!province_id){
                return ;
            }
            var city_list = CacheCityList[province_id];
            if (city_list && city_list.length) {
                if ($.isFunction(callback)){
                    getAreaList(city_list[0]['city_id'], function(area_list){
                        callback(city_list, area_list);
                    });
                }
            } else {
                var request_url = '/aj/doGetProvinceLinkage?province_id='+province_id;

                city_list = [];
                $.get(request_url, function(res){
                    res = $.parseJSON(res);

                    if (!res['errno']){

                        var result = res['result'];

                        $.each(result['city_list'], function(i, item){
                            city_list.push({
                                city_id: item['city_id'],
                                city_name: item['city_name']
                            });

                            // 区县cache
                            CacheAreaList[item['city_id']] = (item['area_list']&&item['area_list'].length)
                                ? item['area_list']
                                : [];
                        });
                        // 城市cache
                        CacheCityList[province_id] = city_list;

                        if ($.isFunction(callback)){
                            var area_list = [];
                            if (city_list && city_list.length){
                                area_list = CacheAreaList[city_list[0]['city_id']];
                            }
                            callback(city_list, area_list);
                        }
                    } else {
                        callback([], []);
                        // do nothing
                    }
                });

            }
        }
        // 设置城市html
        function setCityHtml(data, selected_name){
            data = data || [];
            var html_str = [];

            $.each(data, function(i, item){
                html_str.push('<option value="', item['city_id'], '"');
                if (selected_name===item['city_name']){
                    html_str.push(' selected');
                }
                html_str.push('>', item['city_name'], '</option>');
            });

            html_str = html_str.join('');
            $CityList.html(html_str);
            if (html_str){
                $CityList.show();
            } else {
                $CityList.hide()
            }
        }
        // 设置地区html
        function setAreaHtml(data, selected_name){
            data = data || [];
            var html_str = [];

            $.each(data, function(i, item){
                html_str.push('<option value="', item['area_id'], '"');
                if (selected_name===item['area_name']){
                    html_str.push(' selected');
                }
                html_str.push('>', item['area_name'], '</option>');
            });

            html_str = html_str.join('');
            $AreaList.html(html_str);
            if (html_str){
                $AreaList.show();
            } else {
                $AreaList.hide()
            }
        }

        // 获取城市列表
        function getCityList(province_id, callback){
            if (!province_id){
                return ;
            }
            var city_list = CacheCityList[province_id];
            if (city_list && city_list.length) {
                if ($.isFunction(callback)){
                    getAreaList(city_list[0]['city_id'], function(area_list){
                        callback(city_list, area_list);
                    });
                }
            } else {
                var request_url = '/aj/doGetCityList?province_id='+province_id;

                $.get(request_url, function(res){
                    res = $.parseJSON(res);

                    if (!res['errno']){
                        CacheCityList[province_id] = res['result'];

                        if ($.isFunction(callback)){
                            city_list = CacheCityList[province_id];

                            if (city_list && city_list.length) {
                                getAreaList(city_list[0]['city_id'], function(area_list){
                                    callback(city_list, area_list);
                                });
                            }
                        }
                    } else {
                        // do nothing
                    }
                });
            }
        }
        // 获取城市列表
        function getAreaList(city_id, callback){
            if (!city_id){
                return ;
            }
            var area_list = CacheAreaList[city_id];
            if (area_list && area_list.length) {
                if ($.isFunction(callback)){
                    callback(area_list);
                }
            } else {
                var request_url = '/aj/doGetAreaList?city_id='+city_id;

                $.get(request_url, function(res){
                    res = $.parseJSON(res);

                    if (!res['errno']){

                        CacheAreaList[city_id] = res['result'];

                        if ($.isFunction(callback)){
                            callback(CacheAreaList[city_id]);
                        }
                    } else {
                        // do nothing
                    }
                });
            }
        }

        // 根据省份名称，获取省份id
        function getProvinceIdByName(province_name, province_list){
            if ( !(province_name && $.isArray(province_list)) ) {
                return ;
            }
            var province_id;
            $.each(province_list, function(i, item){
                if (province_name==item['province_name']){
                    province_id = item['province_id'];

                    return false;
                }
            });

            return province_id;
        }

        function init(){

            getProvinceList(function(province_list){
                // 获取省份信息
                // 设置初始化省

                var _default_city_name = window.city_name;

                setProvinceHtml(province_list, _default_city_name);

                var province_id = getProvinceIdByName(_default_city_name, province_list);
                if (province_id) {
                    getCityAreaList(province_id, function(city_list, area_list){
                        // 城市
                        setCityHtml(city_list);

                        // 区县
                        setAreaHtml(area_list);
                    });
                }
            });

            tcb.bindEvent(document.body, {
                // 切换省
                '[name="receiver_province_id"]': {
                    change: function(e){
                        var $me = $(this),
                            province_id = $me.val();

                        getCityAreaList(province_id, function(city_list, area_list){
                            // 城市
                            setCityHtml(city_list);

                            // 区县
                            setAreaHtml(area_list);
                        });
                    }
                },
                // 切换城市
                '[name="receiver_city_id"]': {
                    change: function(e){
                        var $me = $(this),
                            city_id = $me.val();

                        getAreaList(city_id, function(area_list){
                            // 区县
                            setAreaHtml(area_list);
                        });
                    }
                }
            });
        }
        init();
    }());

    // 订单提交
    (function(){
        // 订单表单提交
        var
            $SubmitOrderForm = $('#SubmitOrderForm')

        $SubmitOrderForm.on('submit', function(e){
            e.preventDefault();

            var $form = $(this);

            // 验证表单
            if (!validOrderForm($form)){
                return ;
            }

            $.post($form.attr('action'), $form.serialize(), function(res){
                res = $.parseJSON(res);

                if (!res['errno']){
                    var
                        result = res['result'],
                        order_id = result['order_id']

                    window.location.href = '/shiyong/cashier?order_id='+order_id;
                } else {
                    alert(res['errmsg']);
                    // do nothing
                }
            });

        });

        // 验证订单提交表单
        function validOrderForm($form){
            if ( !($form&&$form.length) ){
                return false;
            }

            var flag = true,
                $firt_error_el = null,
                delay = 120,
                delay_fix = -20;

            var $mobile = $form.find('[name="buyer_mobile"]'),
                $sms_code = $form.find('[name="sms_code"]'),
                $receiver_name = $form.find('[name="receiver_name"]'),
                $receiver_address = $form.find('[name="receiver_address"]'),
                $receiver_mobile = $form.find('[name="receiver_mobile"]'),
                $agreement = $form.find('[name="agreement"]'),
                $btn = $form.find('.btn-submit')

            // 验证手机号
            if ( !($mobile&&$mobile.length&&tcb.validMobile($.trim($mobile.val()))) ) {
                if ($mobile&&$mobile.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $mobile;
                    setTimeout(function(){
                        $mobile.shine4Error();
                    }, delay);
                }
                flag = false;
            }
            // 验证短信验证码
            if ( !($sms_code&&$sms_code.length&&$.trim($sms_code.val())) ) {
                if ($sms_code&&$sms_code.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $sms_code;
                    setTimeout(function(){
                        $sms_code.shine4Error();
                    }, delay);
                }
                flag = false;
            }
            // 验证收货人姓名
            if ( !($receiver_name&&$receiver_name.length&&$.trim($receiver_name.val())) ) {
                if ($receiver_name&&$receiver_name.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $receiver_name;
                    setTimeout(function(){
                        $receiver_name.shine4Error();
                    }, delay);
                }
                flag = false;
            }
            // 验证详细地址
            if ( !($receiver_address&&$receiver_address.length&&$.trim($receiver_address.val())) ) {
                if ($receiver_address&&$receiver_address.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $receiver_address;
                    setTimeout(function(){
                        $receiver_address.shine4Error();
                    }, delay);
                }
                flag = false;
            }
            // 验证收货人手机号
            if ( !($receiver_mobile&&$receiver_mobile.length&&tcb.validMobile($.trim($receiver_mobile.val()))) ) {
                if ($receiver_mobile&&$receiver_mobile.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $receiver_mobile;
                    setTimeout(function(){
                        $receiver_mobile.shine4Error();
                    }, delay);
                }
                flag = false;
            }
            // 验证是否选中服务协议
            if ( !($agreement&&$agreement.length&& $agreement.prop('checked') ) ) {
                if ($agreement&&$agreement.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $agreement;
                    setTimeout(function(){
                        $agreement.closest('.agreement-row').shine4Error();
                    }, delay);
                }
                flag = false;
            }
            // 验证提交按钮是否可用..
            if ( !($btn&&$btn.length&& !$btn.hasClass('btn-disabled') ) ) {
                if ($btn&&$btn.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $btn;
                }
                flag = false;
            }

            if (!flag) {
                var $step_block = $firt_error_el.closest('.step-block');

                $(document.body).animate({
                    'scrollTop': $step_block.offset()['top']
                }, delay+delay_fix, function(){
                    $firt_error_el.focus();
                });
            }

            return flag;
        }

        // 显示租用协议
        function showAgreement(){
            var
                html_fn = $.tmpl( $.trim($('#JsMZuAgreementConfirmTpl').html())),
                html_st = html_fn()

            tcb.showDialog(html_st, 'mobile-experience-agreement-wrap')
        }

        tcb.bindEvent(document.body, {
            // 点击服务协议
            '[name="agreement"]': function(e){
                var
                    $me = $(this)

                if ($me.prop('checked')){
                    // 选中服务协议

                    $('.btn-submit').removeClass('btn-disabled')
                } else {

                    $('.btn-submit').addClass('btn-disabled')
                }
            },
            // 显示租机服务协议
            '.trigger-show-zu-agreement': function(e){
                e.preventDefault()

                showAgreement()
            },
            //// 提交订单
            //'.submit-order-form .btn-submit': function(e){
            //    e.preventDefault();
            //
            //    var $form = $('#SubmitOrderForm');
            //    if (!validOrderForm($form)){
            //        return ;
            //    }
            //
            //    var html_str = $.tmpl( $.trim($('#JsMZuAgreementConfirmTpl').html()) );
            //
            //    tcb.showDialog(html_str, 'mobile-experience-agreement-wrap');
            //},
            // 不同意租用协议
            '.btn-prd-buy-cancel': function(e){
                e.preventDefault();

                $('[name="agreement"]').removeAttr('checked')
                $('.btn-submit').addClass('btn-disabled')

                tcb.closeDialog()
            },
            // 同意租用协议
            '.btn-prd-buy-confirm': function(e){
                e.preventDefault();

                $('[name="agreement"]').prop('checked', 'checked')
                $('.btn-submit').removeClass('btn-disabled')

                tcb.closeDialog()
            }
        });

    }());
    // 其他
    (function(){

        tcb.bindEvent(document.body, {
            // 手机号输入
            '#MobileOrderMobile': {
                'blur': function(e){
                    var $me = $(this),
                        mobile = $.trim( $me.val() );

                    if (tcb.validMobile(mobile)){
                        var $receiver_mobile = $('[name="receiver_mobile"]'),
                            receiver_mobile = $.trim( $receiver_mobile.val() );
                        if ( !tcb.validMobile(receiver_mobile) ){

                            $receiver_mobile.val(mobile);
                        }
                    }
                }
            },
            // 切换支付方式
            '.pay-label': function(e){
                var $me = $(this);

                if ($me.hasClass('pay-label-checked')) {
                    return ;
                }

                $me.addClass('pay-label-checked').siblings('.pay-label-checked').removeClass('pay-label-checked');
                $me.find('[name="pay_type"]').trigger('click');
            },
            // 获取短信验证码
            '#SubmitOrderForm .get-mobile-order-secode': function(e){
                e.preventDefault ();

                var $BtnSeCode = $ (this)

                if ($BtnSeCode.hasClass ('get-mobile-order-secode-disabled')) {
                    return
                }

                var $LoginForm = $BtnSeCode.closest ('form'),
                    $BtnVCode = $LoginForm.find ('.vcode-img')

                if ($BtnVCode.attr ('data-out-date')) {
                    $BtnVCode.trigger ('click')
                }

                if (!validGetSmsCode ($LoginForm)) {
                    return
                }

                var
                    $mobile = $LoginForm.find ('[name="buyer_mobile"]'),
                    $pic_secode = $LoginForm.find ('[name="pic_secode"]'),
                    $sms_type = $LoginForm.find ('[name="sms_type"]')

                var request_url = '/aj/doSendSmsCode',
                    params = {
                        'mobile'     : $.trim ($mobile.val ()),
                        'pic_secode' : $.trim ($pic_secode.val ()),
                        'sms_type'   : $.trim ($sms_type.val ())
                    }
                $.post (request_url, params, function (res) {

                    res = $.parseJSON (res);
                    if (res[ 'errno' ]) {
                        alert (res[ 'errmsg' ])

                        $BtnSeCode.removeClass ('get-mobile-order-secode-disabled')
                        $BtnVCode.trigger ('click')

                    } else {

                        $BtnSeCode.addClass ('get-mobile-order-secode-disabled').html ('60秒后再次发送');
                        tcb.distimeAnim (60, function (time) {
                            if (time <= 0) {
                                $BtnSeCode.removeClass ('get-mobile-order-secode-disabled').html ('获取验证码');
                            } else {
                                $BtnSeCode.html (time + '秒后再次发送');
                            }
                        })
                    }

                })
            },
            // 刷新图形验证码
            '#SubmitOrderForm .vcode-img': function(e){
                e.preventDefault ()

                var $BtnVCode = $(this),
                    $LoginForm = $BtnVCode.closest('form')

                var src = '/secode/?rands=' + Math.random ()

                $BtnVCode.attr ('src', src)

                $BtnVCode.attr ('data-out-date', '')

                var $pic_secode = $LoginForm.find ('[name="pic_secode"]')
                $pic_secode.focus ().val ('')
            }
        })

        // 验证获取手机短信验证码表单
        function validGetSmsCode (wForm) {
            if (!(wForm && wForm.length)) {
                return false
            }
            var flag = true

            var wMobile = wForm.find ('[name="buyer_mobile"]'),
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

    }());
});