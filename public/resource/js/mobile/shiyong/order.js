// 下单页面
$(function(){
    var $PageOrder = $('.page-shiyong-order');
    if (!$PageOrder.length){
        return;
    }

    var _MAX_ZINDEX = 10000;
    function getSwipeSection(el){
        var $el, class_str='';
        if (el){
            $el = $(el);
            if ( !($el && $el.length) && (typeof el==='string') ){
                class_str = el.replace(/\./g, '');
            }
        }

        if ( !($el && $el.length) ) {
            var wrap_str = class_str
                    ? '<section id="SwipeSection'+tcb.genRandomNum()+'" class="swipe-section pre-swipe-right-hide '+class_str+'"></section>'
                    : '<section id="SwipeSection'+tcb.genRandomNum()+'" class="swipe-section pre-swipe-right-hide"></section>';
            $el = $(wrap_str).appendTo(document.body);
        }

        return $el;
    }
    function doLeftSwipeSection($swipe, percent){
        percent = parseFloat(percent);
        percent = percent ? percent+'%' : '0';

        //showSwipeSectionMask();

        $swipe.css({
            'display': 'block',
            'z-index': _MAX_ZINDEX++
        }).animate({'translateX': percent}, 300);
    }
    function showSwipeSectionMask(){
        var $mask = $('#SwipeSectionMask');
        if (!$mask.length) {
            $mask = $('<a class="swipe-section-mask" id="SwipeSectionMask"></a>');
            $mask.appendTo('body');

            $mask.on('click', function(e){
                e.preventDefault();

                hideSwipeSectionMask($mask);
            });
        }
        $mask.css({
            'display': 'block',
            'height': $('body').height()
        });
        return $mask;
    }
    function hideSwipeSectionMask($mask){
        var $mask = $mask || $('#SwipeSectionMask');
        if (!$mask.length) {
            return ;
        }
        $mask.hide();
    }

    // 省市地区切换
    (function(){
        var flag_getall = true;/*根据省一次性获取所有的城市和区县信息*/
        var CacheProvinceList = [],
            CacheCityList = {},
            CacheAreaList = {};
        var $ProviceSelect,// = $('[name="receiver_province_id"]'),
            $CityList,// = $('[name="receiver_city_id"]'),
            $AreaList;// = $('[name="receiver_area_id"]');
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
            var html_str = [],
                selected_province_name = selected_name,
                selected_province_id='';

            // 传入的是省份id
            if (parseInt(selected_name, 10)){
                selected_province_name = '';
                selected_province_id = selected_name;
            }

            html_str.push('<div class="province-city-area-list" data-type="province"><div class="tit">选择省份</div>');
            $.each(data, function(i, item){
                html_str.push('<a href="#" ');
                if (selected_province_name && selected_province_name==item['province_name']){
                    html_str.push('class="selected" ');
                }
                if (selected_province_id && selected_province_id==item['province_id']){
                    html_str.push('class="selected" ');
                }
                html_str.push('data-id="', item['province_id'], '">', item['province_name'], '</a>');
            });
            html_str.push('</div>');

            html_str = html_str.join('');

            $ProviceSelect = getSwipeSection($ProviceSelect);
            $ProviceSelect.html(html_str);

            return $ProviceSelect;
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
        function setCityHtml(data, selected_id){
            data = data || [];
            var html_str = [];

            html_str.push('<div class="province-city-area-list" data-type="city"><div class="tit">选择城市</div>');
            $.each(data, function(i, item){
                html_str.push('<a href="#" ');
                if (selected_id && selected_id==item['city_id']){
                    html_str.push('class="selected" ');
                }
                html_str.push('data-id="', item['city_id'], '">', item['city_name'], '</a>');
            });
            html_str.push('</div>');

            html_str = html_str.join('');

            $CityList = getSwipeSection($CityList);
            $CityList.html(html_str);

            return $CityList;
        }
        // 设置地区html
        function setAreaHtml(data, selected_id){
            data = data || [];
            var html_str = [];

            html_str.push('<div class="province-city-area-list" data-type="area"><div class="tit">选择区县</div>');
            $.each(data, function(i, item){
                html_str.push('<a href="#" ');
                if (selected_id && selected_id==item['area_id']){
                    html_str.push('class="selected" ');
                }
                html_str.push('data-id="', item['area_id'], '">', item['area_name'], '</a>');
            });
            html_str.push('</div>');

            html_str = html_str.join('');

            $AreaList = getSwipeSection($AreaList);
            $AreaList.html(html_str);

            return $AreaList;
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


        var selected_province = null,
            selected_city = null,
            selected_area = null;
        // 选中省、市、区县
        function selectedProvinceCityArea(last_step){
            hideProvinceCityArea(last_step);

            var str = '';
            if (selected_province && selected_province.length){
                $('[name="receiver_province_id"]').val(selected_province[0]);
                str += selected_province[1]+' ';
            } else {
                $('[name="receiver_province_id"]').val('');
            }
            if (selected_city && selected_city.length){
                $('[name="receiver_city_id"]').val(selected_city[0]);
                str += selected_city[1]+' ';
            } else {
                $('[name="receiver_city_id"]').val('');
            }
            if (selected_area && selected_area.length){
                $('[name="receiver_area_id"]').val(selected_area[0]);
                str += selected_area[1]+' ';
            } else {
                $('[name="receiver_area_id"]').val('');
            }
            $('.receiver-province-city-area').removeClass('default').html(str);
        }
        // 隐藏省、市、区县选择面板
        function hideProvinceCityArea(last_step){
            switch (last_step) {
                case 'province':
                    hideProvince();
                    break;
                case 'city':
                    hideCity();
                    break;
                case 'area':
                    hideArea();
                    break;
                default :
                    if ($ProviceSelect && $ProviceSelect.length){
                        $ProviceSelect.animate({'translateX':'100%'}, 300, function(){
                            //$ProviceSelect.hide();
                            $ProviceSelect.remove();
                            $ProviceSelect = null;
                        });
                    }
                    if ($CityList && $CityList.length){
                        $CityList.animate({'translateX':'100%'}, 300, function(){
                            //$CityList.hide();
                            $CityList.remove();
                            $CityList = null;
                        });
                    }
                    if ($AreaList && $AreaList.length){
                        $AreaList.animate({'translateX':'100%'}, 300, function(){
                            //$AreaList.hide();
                            $AreaList.remove();
                            $AreaList = null;
                        });
                    }
                    break;
            }
        }
        function hideProvince(){
            if ($ProviceSelect && $ProviceSelect.length){
                $ProviceSelect.animate({'translateX':'100%'}, 300, function(){
                    //$ProviceSelect.hide();
                    $ProviceSelect.remove();
                    $ProviceSelect = null;
                });
            }
            if ($CityList && $CityList.length){
                $CityList.remove();
                $CityList = null;
                //$CityList.css({
                //    'display': 'none',
                //    'transform': 'translateX(100%)'
                //});
            }
            if ($AreaList && $AreaList.length){
                $AreaList.remove();
                $AreaList = null;
                //$AreaList.css({
                //    'display': 'none',
                //    'transform': 'translateX(100%)'
                //});
            }
        }
        function hideCity(){
            if ($ProviceSelect && $ProviceSelect.length){
                $ProviceSelect.remove();
                $ProviceSelect = null;
                //$ProviceSelect.css({
                //    'display': 'none',
                //    'transform': 'translateX(100%)'
                //});
            }
            if ($CityList && $CityList.length){
                $CityList.animate({'translateX':'100%'}, 300, function(){
                    //$CityList.hide();
                    $CityList.remove();
                    $CityList = null;
                });
            }
            if ($AreaList && $AreaList.length){
                $AreaList.remove();
                $AreaList = null;
                //$AreaList.css({
                //    'display': 'none',
                //    'transform': 'translateX(100%)'
                //});
            }
        }
        function hideArea(){
            if ($ProviceSelect && $ProviceSelect.length){
                $ProviceSelect.remove();
                $ProviceSelect = null;
                //$ProviceSelect.css({
                //    'display': 'none',
                //    'transform': 'translateX(100%)'
                //});
            }
            if ($CityList && $CityList.length){
                $CityList.remove();
                $CityList = null;
                //$CityList.css({
                //    'display': 'none',
                //    'transform': 'translateX(100%)'
                //});
            }
            if ($AreaList && $AreaList.length){
                $AreaList.animate({'translateX':'100%'}, 300, function(){
                    //$AreaList.hide();
                    $AreaList.remove();
                    $AreaList = null;
                });
            }
        }

        function init(){

            tcb.bindEvent({
                // 切换省、市、地区
                '.receiver-province-city-area': function(e){
                    e.preventDefault();

                    var $me = $(this),
                        province_id = $('[name="receiver_province_id"]').val();

                    selected_province = null;
                    selected_city = null;
                    selected_area = null;

                    getProvinceList(function(province_list){

                        var _default_city_name = window.city_name;

                        if (!province_id) {
                            province_id = getProvinceIdByName(_default_city_name, province_list);
                        }
                        // 设置城市html
                        var $Provice = setProvinceHtml(province_list, province_id);
                        doLeftSwipeSection($Provice, 30);
                    });

                },
                // 选择省、市、地区
                '.province-city-area-list a': function(e){
                    e.preventDefault();

                    var $me = $(this),
                        $list = $me.closest('.province-city-area-list'),
                        data_id = $me.attr('data-id'),
                        data_name = $.trim( $me.html() ),
                        data_type = $list.attr('data-type');

                    // 添加选中状态
                    $me.addClass('selected').siblings('.selected').removeClass('selected');

                    // 选择省
                    if (data_type==='province'){
                        selected_province = [data_id, data_name];
                        getCityAreaList(data_id, function(city_list, area_list){
                            // 有下级城市列表，显示列表，否则直接选中
                            if (city_list && city_list.length){
                                // 城市
                                var $City = setCityHtml(city_list);

                                doLeftSwipeSection($City, 30);
                            } else {
                                selectedProvinceCityArea(data_type);
                            }
                        });
                    }

                    // 选择市
                    if (data_type==='city'){
                        selected_city = [data_id, data_name];
                        getAreaList(data_id, function(area_list){
                            // 有下级区县列表，显示列表，否则直接选中
                            if (area_list && area_list.length) {
                                // 城市
                                var $Area = setAreaHtml(area_list);

                                doLeftSwipeSection($Area, 30);
                            } else {
                                selectedProvinceCityArea(data_type);
                            }
                        });

                    }

                    // 选择区县
                    if (data_type==='area'){
                        selected_area = [data_id, data_name];

                        selectedProvinceCityArea(data_type);
                    }
                }
            });

            $(document.body).on('click', function(e){
                var target = e.target,
                    $target = $(target);

                // 隐藏省市区县选择面板
                if ( !($target.hasClass('receiver-province-city-area') || $target.closest('.province-city-area-list').length) ){
                    hideProvinceCityArea();
                }
            });
        }
        init();
    }());

    // 订单提交
    (function(){
        var SwipeSection = window.Bang.SwipeSection;

        // 订单表单提交
        $('#SubmitOrderForm').on('submit', function(e){
            e.preventDefault();

            var $form = $(this);

            // 验证表单
            if (!validOrderForm($form)){
                return ;
            }

            $.post($form.attr('action'), $form.serialize(), function(res){
                res = $.parseJSON(res);

                if (!res['errno']){
                    var result = res['result'],
                        order_id = result['order_id'];

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
                $receiver_province_id = $form.find('[name="receiver_province_id"]'),
                $receiver_province_city_area = $form.find('.receiver-province-city-area'),
                $receiver_address = $form.find('[name="receiver_address"]'),
                $receiver_mobile = $form.find('[name="receiver_mobile"]'),
                $agreement = $form.find('.agreement-checkbox'),
                $btn = $('.btn-prd-buy')

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
            // 所在地区
            if ( !($receiver_province_id&&$receiver_province_id.length&&$.trim($receiver_province_id.val())) ) {
                if ($receiver_province_id&&$receiver_province_id.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $receiver_province_city_area;
                    setTimeout(function(){
                        $receiver_province_city_area.shine4Error();
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
            // 验证是否选中服务协议
            if ( !($agreement&&$agreement.length&& $agreement.hasClass('sim-checkbox-checked') ) ) {
                if ($agreement&&$agreement.length) {
                    $firt_error_el = $firt_error_el ? $firt_error_el : $agreement;
                    setTimeout(function(){
                        $agreement.closest('.block').shine4Error();
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
                var $row = $firt_error_el.closest('.row');
                var $inner = $('#mainbody .mainbody-inner');

                $('#mainbody').scrollTo({
                    endY: $row.offset()['top']-$inner.offset()['top']-10,
                    duration: delay+delay_fix,
                    callback: function(){
                        setTimeout(function(){
                            if ($receiver_province_city_area===$firt_error_el){
                                if ( !$('.swipe-section').length ){
                                    $firt_error_el.trigger('click');
                                }
                            } else {
                                $firt_error_el.focus();
                            }

                        }, delay);
                    }
                });
            }

            return flag;
        }

        // 显示租用协议
        function showAgreement(){
            var
                html_fn = $.tmpl( $.trim($('#JsMZuAgreementConfirmTpl').html())),
                html_st = html_fn()

            SwipeSection.getSwipeSection()
            SwipeSection.fillSwipeSection(html_st)

            var
                $swipe = SwipeSection.getLastSwipeSection()

            $swipe.show()
            setTimeout(function(){

                $swipe.find('.mobile-experience-agreement').css({
                    height: $swipe.height()
                });

                SwipeSection.doLeftSwipeSection(0, function(){
                    $swipe.find('.mobile-experience-agreement').css({
                        height: $swipe.height()
                    })
                })
            }, 1)
        }
        // 关闭租用协议
        function closeAgreement(){

            SwipeSection.backLeftSwipeSection()
        }

        tcb.bindEvent({
            // 显示租机服务协议
            '.trigger-show-zu-agreement': function(e){
                e.preventDefault()

                showAgreement()
            },
            // 提交表单
            '.btn-prd-buy': function(e){
                e.preventDefault()

                var
                    $form = $('#SubmitOrderForm')
                if (!validOrderForm($form)){
                    return ;
                }

                $form.submit()
            },
            // 不同意租用协议
            '.btn-prd-buy-cancel': function(e){
                e.preventDefault();

                $('.agreement-checkbox').removeClass('sim-checkbox-checked')
                $('.btn-prd-buy').addClass('btn-disabled')

                closeAgreement()
            },
            // 同意租用协议
            '.btn-prd-buy-confirm': function(e){
                e.preventDefault();

                $('.agreement-checkbox').addClass('sim-checkbox-checked')
                $('.btn-prd-buy').removeClass('btn-disabled')

                closeAgreement()
            }
        })

        // 点击服务协议
        $('.agreement-checkbox').on('click', function(e){
            var
                $me = $(this)

            if (!$me.hasClass('sim-checkbox-checked')){
                // 选中服务协议

                $me.addClass('sim-checkbox-checked')
                $('.btn-prd-buy').removeClass('btn-disabled')
            } else {

                $me.removeClass('sim-checkbox-checked')
                $('.btn-prd-buy').addClass('btn-disabled')
            }
        })

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