(function($){

    // DOM Ready
    $(function(){

        var tap_flag = false; // 标识是否执行了tap
        var $ShopMain = $('#ShopMain'),
            $TinfoMain = $('#TinfoMain');

        // 获取共享地理位置信息
        getCurrentPosition();

        // 提交支付
        $ShopMain.on('tap click', '.shop-content-paybutton', function(e){
            e.preventDefault();

            var $me = $(this);
            // tap触发的时候，标识tap_flag为true
            if (e.type==='tap') {
                tap_flag = true;
            }
            if (tap_flag) {
                tap_flag = false;
                return false;
            }
            if ($me.hasClass('disabled-button')) {
                return false;
            }
            var money = $('#SumMoney').val();
            if(!validMoney(money)){
                return false;
            }

            $me.addClass('disabled-button');

            var search_str = parseUrlQuery(document.location.search);

            document.location.href = BASE_ROOT + 'm/qtinfo/?itemid='+$('[name="product_id"]').val()+'&money='+money+'&pg='+search_str['pg'] + '&buyer_mobile='+$('#buyerMobile').val() + '&promo_code=' + $('#promoCode').val();
            // var params = getOrderPostParam();
            // if(!$.fn.cookie('Q')){
            //     // 未登录
            //     // var destUrl = document.location.protocol+'//'+document.location.host+document.location.pathname+'?shopid='+$('#ShopName').attr('shopid')+'&m='+money;
            //     // document.location.href = BASE_ROOT+'m/userlogin/?destUrl='+encodeURIComponent(destUrl);
            //     var post_url = BASE_ROOT+'torder/confirm';
            //     postRedirect(post_url, params);
            // }
            // else {
            //     // 已登录
            //     var request_url = BASE_ROOT+'torder/confirm';
            //     $.post(request_url, params, function(respData){
            //         // 订单提交成功
            //         // console.log(respData);
            //         if (!respData['errno']) {
            //             var orderid = respData['result'];

            //             document.location.href = BASE_ROOT+'m/subpay/?order_id='+orderid;
            //         } else {
            //             alert(respData['errmsg']);
            //         }
            //     }, 'json');
            // }
        });
        // 活动详情收起/展开
        $ShopMain.on('tap click', '.huodong, .huodong-detail-hide', function(e){
            e.preventDefault();

            var $me = $(this);
            // tap触发的时候，标识tap_flag为true
            if (e.type==='tap') {
                tap_flag = true;
            }
            if (tap_flag) {
                tap_flag = false;
                return false;
            }

            var $detail = $ShopMain.find('.huodong-detail');
            if ($detail.hasClass('none')) {
                $detail.removeClass('none');
            } else {
                $detail.addClass('none');
            }
        });
        $ShopMain.on('click', '#getOffCode', function(e){
            e.preventDefault();
            var mobile = __CURR_USER_MOBILE;
            if(!mobile){
                var mobile = prompt("请输入您的手机号码，优惠码将以短信的形式下发到您的手机：");
                if( mobile === null){
                    return;
                }
                if(!mobile || !/^\d{11}$/.test(mobile)){   
                    alert('请输入正确的手机号码');
                    return;
                }

                $('#buyerMobile').val( mobile );
            }

            $.post('/aj/get_youhuiquan/', { 'shopid': $('#ShopId').val(), 'buyer_mobile' : mobile}, function(data){
                data = $.parseJSON(data);
                if(data.errno){
                    alert('抱歉，出错了。' + data.errmsg);
                }else{
                    alert('优惠码已成功的下发到您的手机，请注意查收');
                }
            });


        });

        $ShopMain.on('click', '.show-promo', function(e){
            $('.hide-promo').show();
            $(this).hide();
            $('#promoCode').show().focus();
        }); 
        $ShopMain.on('click', '.hide-promo', function(e){
            $('.show-promo').show();
            $(this).hide();
            $('#promoCode').hide();
        }); 
        // // 未登录用户，填写手机号后确认支付！
        // $ShopMain.on('tap click', '.mobile-confirm', function(e){
        //     e.preventDefault();

        //     var $me = $(this);
        //     // tap触发的时候，标识tap_flag为true
        //     if (e.type==='tap') {
        //         tap_flag = true;
        //     }
        //     if (tap_flag) {
        //         tap_flag = false;
        //         return false;
        //     }
        //     if ($me.hasClass('disabled-button')) {
        //         return false;
        //     }

        //     var mobile = $('#UserMobile').val();
        //     if (!mobile) {
        //         alert('手机号不能为空！');
        //         return false;
        //     }
        //     if(!validMobile(mobile)){
        //         alert('手机号格式有误！');
        //         return false;
        //     }
        //     $me.addClass('disabled-button');

        //     document.location.href = BASE_ROOT+'m/subpay/?'+getMobileConfirmParam();

        // });

        /**
         * 点击获取更多商品
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        $ShopMain.on('tap click', '.get-more-product', function(e){
            e.preventDefault();

            var $me = $(this);
            // tap触发的时候，标识tap_flag为true
            if (e.type==='tap') {
                tap_flag = true;
            }
            if (tap_flag) {
                tap_flag = false;
                return false;
            }

            var $hideItem = $ShopMain.find('.product-list').children('.none');

            $hideItem.removeClass('none');
            $me.hide();
        });
        
        // 提交支付
        $TinfoMain.on('tap click', '.mobile-confirm-button', function(e){
            e.preventDefault();

            var $me = $(this);
            // tap触发的时候，标识tap_flag为true
            if (e.type==='tap') {
                tap_flag = true;
            }
            if (tap_flag) {
                tap_flag = false;
                return false;
            }
            if ($me.hasClass('disabled-button')) {
                return false;
            }

            var money = $('#SumMoney').val();
            if(!validMoney(money)){
                return false;
            }
            var mobile = $('#UserMobile').val();
            if(!validMobile(mobile)){
                return false;
            }
 
            $me.addClass('disabled-button');

            var params = getOrderPostParam();
            var request_url = BASE_ROOT+'torder/confirm';
            $.post(request_url, params, function(respData){
                // 订单提交成功
                // console.log(respData);
                if (!respData['errno']) {
                    var orderid = respData['result'];

                    document.location.href = BASE_ROOT+'m/subpay/?order_id='+orderid;
                } else {
                    alert(respData['errmsg']);
                }
            }, 'json');

        });

        // 退出登录
        $('.user-logout').on('click', function(e){
            e.preventDefault();

            var request_url = BASE_ROOT+'user/logout/?from=wap';
            $.get(request_url, function(){
                QHPass.signOut( QHPass.__loginDefaultFun );
            });
        })

        // type类型为number和tel的时候，强制只能输入数字
        $('[type="number"], [type="tel"]').on({
            'keyup': function(e){
                var $me = $(this),
                    num = $me.val();

                var n_num = isInvalidTypingNum(num);
                if (n_num!==false) {
                    $me.val(n_num);
                }
            }
        });
        // type为text，并且pattern为\d*的时候，强制只能输入数字和小数点（没细化到只允许输入一个小数点）
        $('[type="text"]').on({
            'keyup': function(e){
                var $me = $(this),
                    m = $me.val();

                if ($me.attr('pattern')==='\\d*') {
                    var n_m = isInvalidTypingMoney(m);
                    if (n_m!==false) {
                        $me.val(n_m);
                    }
                }

            }
        });

        // 设置获取更多行的高度
        setMoreLineHeight();
        function setMoreLineHeight(){
            var $more = $('.more-line a');
            if (!$more.length) {
                return ;
            }
            var more_height = $more.height(),
                more_top    = $more.offset()['top'],
                body_height = $('body').height();
            if (body_height>(more_top+more_height+1)) {
                $more.height(body_height-more_top-1);
            }
        }
    });
    /**
     * 检验正在输入的数字是否非法，非法返回正常值，合法返回false
     * @param  {[type]} num [description]
     * @return {[type]}     [description]
     */
    function isInvalidTypingNum(num){
        var ret = num;

        ret = num.replace(/[^\d]/g, '');
        if (num===ret) {
            ret = false;
        }

        return ret;
    }
    /**
     * 检验正在输入的金额是否非法，非法返回正常值，合法返回false
     * @param  {[type]} m [description]
     * @return {[type]}   [description]
     */
    function isInvalidTypingMoney(m){
        var ret = m;

        ret = m.replace(/[^\d\.]/g, '');
        if (m===ret) {
            ret = false;
        }

        return ret;
    }
    /**
     * 验证金额的正确性
     * @param  {[type]} m [description]
     * @return {[type]}   [description]
     */
    function validMoney(m){
        var flag = false;

        var r_price = /^(0|([1-9]\d*))(\.\d{1,2})?$/; // 判断是否为价格，正整数或者浮点小数
        m = $.trim(m);
        if (!r_price.test(m)) {
            alert('请输入正确金额，正整数或者最多带两位小数！');
        } else {
            flag = true;
        }

        return flag;
    }
    /**
     * 验证手机号格式正确性
     * @param  {[type]} m [description]
     * @return {[type]}   [description]
     */
    function validMobile(m){
        var flag = false;

        var r_mobile = /^1[3458]\d{9}$/; // 判断是否为手机号
        m = $.trim(m);

        if (!m) {
            alert('手机号不能为空！');
        }
        else if(!r_mobile.test(m)){
            alert('手机号格式有误！');
        } else {
            flag = true;
        }

        return flag;
    }
    /**
     * 获取订单提交参数
     * @return {[type]} [description]
     */
    function getOrderPostParam(){
        var params = {
            'buyer_mobile': $('[name="buyer_mobile"]').val(),
            'details_product': '',
            'is_ckpostkey': 0,
            'liuyan': '',
            'o_product_num': $('[name="o_product_num"]').val(),
            'o_server_method': $('[name="o_server_method"]').val(),
            'o_summoney': $('#SumMoney').val(),
            'pay_method': 1,
            'postkey': $('[name="postkey"]').val(),
            'product_id': $('[name="product_id"]').val(),
            'from_page': $('[name="from_page"]').val(),
            'from_app': 'wap',
            'promo_code' : $('[name="promo_code"]').val(),
            'o_money' : $('[name="o_money"]').val()
        };

        return params;
    }
    /**
     * 获取手机确认的参数
     * @return {[type]} [description]
     */
    function getMobileConfirmParam(){
        var params = 'mobile='+$('#UserMobile').val()+'&order_id='+$('[name="order_id"]').val()+'&subfrom='+$('[name="subfrom"]').val()+'&postkey='+$('[name="postkey"]').val();

        return params;
    }
    /**
     * 获取共享地理位置信息
     * @return {[type]} [description]
     */
    function getCurrentPosition(){
        if ($('#ShopMain').length && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(locationSuccess, locationError,{
                // 指示浏览器获取高精度的位置，默认为false
                enableHighAcuracy: true
                // 指定获取地理位置的超时时间，默认不限时，单位为毫秒
                ,timeout: 5000
                // 最长有效期，在重复获取地理位置时，此参数指定多久再次获取位置。
                // ,maximumAge: 3000
            });
        }
    }
    /**
     * 成功获取到当前地理位置信息
     * @param  {[type]} position [description]
     * @return {[type]}          [description]
     */
    function locationSuccess(position){
        var coords = position.coords;

        var request_url = BASE_ROOT+'aj/get_shop2user_juli/?shop_id='+$('#ShopId').val()+'&lng='+coords.longitude+'&lat='+coords.latitude;
        $.get(request_url, function(respData){
            if (!respData['errno']&&respData['data']) {
                var juli = parseFloat(respData['data']);
                if (juli) {
                    juli = juli>1000 
                        ? (Math.round(juli/10)/100)+'千米'
                        : (Math.round(juli*100)/100)+'米';
                    $('.distance').html(juli).show();
                }
            }
        }, 'json');
    }
    // 没有获取到当前位置信息
    function locationError(error){
        // do nothing
    }
    /**
     * 以post形式将参数提交到新的页面
     * @param  {[type]} action [description]
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    function postRedirect(action, params) {
        var id = Math.random();
        document.write('<form id="post' + id + '" name="post'+ id +'" action="' + action + '" method="post">');
        for (var key in params) {
            document.write('<input type="hidden" name="' + key + '" value="' + params[key] + '" />');
        }
        document.write('</form>');   
        document.getElementById('post' + id).submit();
    }

    /**
     * 解析URL的query串为json格式数据
     * @param  {[type]} query_str [description]
     * @return {[type]}           [description]
     */
    function parseUrlQuery(query_str){
        var ret = {};
        if(typeof query_str !== 'string'){
            return query_str;
        }
        if (query_str.indexOf('?')===0) {
            query_str = query_str.substring(1);
        }
        query_str = query_str.split('&');
        $.each(query_str, function(i, item){
            item = item.split('=');
            ret[item[0]] = item[1];
        });

        return ret;
    }

}(Zepto));