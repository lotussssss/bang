wx.ready(function(){
    var noop = function(){};
    var wxData = {};

    // 微信分享的数据
    wxData = {
        "title" : '双11狂欢提前启动，手快者得！',
        "desc" : '提前享受双11的价格，领券再省120元！苹果/三星/华为/小米/oppo/vivo/魅族/乐视品牌专场，天天爆品，不止5折！',
        "link" :  "http://bang.360.cn/youpin/erhuo",
        "imgUrl" : 'https://p.ssl.qhimg.com/t0112a8e707522a58b7.png',
        "success": noop, // 用户确认分享的回调
        "cancel": noop // 用户取消分享
    };
    // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
    wx.onMenuShareAppMessage(wxData);
    // 点击分享到朋友圈，会执行下面这个代码
    wx.onMenuShareTimeline(wxData);
    //分享到QQ
    wx.onMenuShareQQ(wxData);
});

$(function(){

    var _i = 0;//当做标记  每过一个活动的节点i++

    var is_weixin = window.is_weixin || false;//判断是否为微信打开

    var params = {
        meizu:{
            brand_id:[9,24],//魅族/乐视
            brand_separate_name:['魅族','乐视'],
            brand_separate_name2:['meizu','leshi'],
            bg_color:"#a9ca73",
            brand_name:'魅族/乐视',
            use_date:'10月25日-10月27日',
            coupon_params:{module_type:1,code_type:[50,100,120]}
        },
        vivo:{
            brand_id:[21,22],//vivo/oppo
            brand_separate_name:['vivo','oppo'],
            brand_separate_name2:['vivo','oppo'],
            bg_color:"#fd3f99",
            brand_name:'vivo/oppo',
            use_date:'10月28日-10月30日',
            coupon_params:{module_type:2,code_type:[50,100,120]}
        },
        huawei: {
            brand_id:[4,3],//华为/小米
            brand_separate_name:['华为','小米'],
            brand_separate_name2:['hauwei','xiaomi'],
            bg_color:"#fd7217",
            brand_name:'华为/小米',
            use_date:'10月31日-11月02日',
            coupon_params:{module_type:3,code_type:[50,100,120]}
        },
        sanxing: {
            brand_id:[1],//三星
            brand_separate_name:['三星'],
            brand_separate_name2:['sanxing'],
            bg_color:"#fdb900",
            brand_name:'三星',
            use_date:'11月03日-11月06日',
            coupon_params:{module_type:4,code_type:[50,100,120]}
        },
        iphone: {
            brand_id:[2],//苹果
            brand_separate_name:['苹果'],
            brand_separate_name2:['iphone'],
            bg_color:"#0a78cd",
            brand_name:'苹果',
            use_date:'11月07日-11月10日',
            coupon_params:{module_type:5,code_type:[50,100,120]}
        },
        kuanghuan: {
            bg_color:"#9c6bff",
            brand_name:'狂欢',
            use_date:'11月10日-11月22日',
            coupon_params:{module_type:6,code_type:[50,100,120]}
        }
    };
    var default_brand = ['meizu','vivo','huawei','sanxing','iphone','kuanghuan'];

    // 倒计时
    countDownTime();

    $('.block-header-inner .brand-name').html(params[default_brand[_i]]['brand_name']);
    // _i=5;
    var
        $current_activity = $($('.block-nav-brand a')[_i]),//根据日期确定的导航部分当前品牌
        $current_nav_data_li = $($('.block-nav-time li')[_i]),//根据日期确定的导航部分当前日期高亮
        $current_nav_data_span = $($('.block-nav-time span')[_i]),

        $triangle = $($('.block-nav-brand .triangle') [_i]),//根据日期确定的导航部分小三角的显示
        $block_coupon = $('.block-coupon'),//优惠券整体
        $coupon_title =$('.block-coupon-title .coppon-brand'),//优惠券标题
        $coupon_use_date = $('.block-coupon-time .use-time'),//优惠券使用日期

        $default_coupon = $('.block-coupon-bottom'),//优惠券
        $single_coupon = $('.block-coupon-bottom a'),//全部的优惠券

        $photo_entrance = $('.photo-entrance'),//狂欢图片入口
        $product_list_wrap = $('.product-list-wrap');//商品列表整体


        //根据日期控制点和线
        $current_activity.siblings('.line-and-dot').css({'display': 'block !important'});
        $current_activity.closest('li').nextAll().children('.line-and-dot').css({'display': 'none !important'});
        $current_activity.closest('li').prevAll('li').children('.line-and-dot').css({'display': 'block !important'});

        //根据日期控制节日日期高亮
        $current_nav_data_li.addClass('cur').siblings().removeClass('cur');
        $current_nav_data_span.addClass('cur').closest('li').siblings().children('span').removeClass('cur');

        //根据日期默认显示三角和活动优惠券
        triangleShow($triangle,default_brand[_i]);

        //根据日期设置优惠券默认背景色
        setCouponBackgroundColor($block_coupon,default_brand[_i]);

        //根据日期设置优惠券名称和使用日期
        setCouponNameAndUseDate(default_brand[_i]);

        //根据日期显示对应活动的优惠券 隐藏其他
        $($default_coupon[_i]).css('display','block').siblings('.block-coupon-bottom').css('display','none');

        if(_i<5){
            //根据日期设置默认品牌爆品专区
            setBaopinList(default_brand[_i]);
            //根据日期设置商品列表部分
            showAllActiveList(default_brand[_i]);
        }else {
            $photo_entrance.css('display','block');
            $product_list_wrap.css('display','none');
            $block_coupon.css('display','none');
        }

    // 首先判断是否为微信打开  如果为微信打开 查看用户已经存在的优惠券 有的话替换的页面中
    if(is_weixin) {
        $.get('/youpin/getYouhuiCode', function (res) {
            var
                res = JSON.parse(res),
                result = res['result'];

            if (!res['errno']) {
                for (var i = 0; i < result.length; i++) {
                    var item = result[i],
                        code_type = item.code_type,
                        module_id = item['module_id'],
                        code = item.code;
                    for (var j = 0; j < $single_coupon.length; j++) {
                        var
                            $single_coupon_item = $($single_coupon[j]),
                            data_id = $single_coupon_item.attr('data-id'),
                            data_code_type = $single_coupon_item.attr('data-code-type');
                        if (data_id == module_id && data_code_type == code_type) {
                            var coupon_str = '<div class="coupon-down-name">优惠券号码：</div><div class="coupon-number">' + code + '</div>';
                            $single_coupon_item.parent().html(coupon_str);
                        }
                    }
                }
            }
        });
    }

    //点击品牌
    $('.block-nav-brand').on('click','a',function (e) {
        e.preventDefault();
        var
            $me = $(this),
            brand_name = $me.attr('data-name');

                //控制小三角
                triangleShow($me.siblings('.triangle'),brand_name);

                //控制优惠券背景色
                 setCouponBackgroundColor($block_coupon,brand_name);

                //控制优惠券名称和使用日期
                setCouponNameAndUseDate(brand_name);

                //显示对应活动的优惠券 隐藏其他
                var index = params[brand_name]['coupon_params']['module_type']-1;
                $($default_coupon[index]).css('display','block').siblings('.block-coupon-bottom').css('display','none');



                if(brand_name == "kuanghuan"){
                    $photo_entrance.css('display','block');
                    $product_list_wrap.css('display','none');
                    $block_coupon.css('display','none');

                } else {
                    //根据品牌名称设置爆品专区
                    setBaopinList(brand_name);
                    //根据品牌加载所有商品列表
                    showAllActiveList(brand_name);
                    $photo_entrance.css('display','none');
                    $product_list_wrap.css('display','block');
                    $block_coupon.css('display','block');
                }

    });

    //点击优惠券
    $('.block-coupon-bottom').on('click','a',function (e) {
        e.preventDefault();
        var
            $me = $(this),
            data_id = $me.attr('data-id'),
            data_code_type = $me.attr('data-code-type'),
            coupon_params = {
                module_type:data_id,
                code_type:data_code_type
            };

            $.get('/youpin/doYouhuiCode',coupon_params,function (res) {

                res = JSON.parse(res);
                if (!res['errno']) {
                     showCouponWrap(res.result);
                    var coupon_str = '<div class="coupon-down-name">优惠券号码：</div><div class="coupon-number">'+res.result+'</div>';
                    $me.parent().html(coupon_str);
                }else {
                    showNoCouponWrap(res['errmsg'])
                }
            })
    });

    //点击狂欢图片入口中的图片
    $photo_entrance.on('click','a',function (e) {
        e.preventDefault();
        
        var
            $me = $(this),
            brand_name = $me.attr('data-name');

        if(brand_name == 'leshi'){
            brand_name = 'meizu';
        }else if(brand_name == 'oppo'){
            brand_name = 'vivo';
        }else if(brand_name == 'xiaomi'){
            brand_name = 'huawei';
        }

        $('.block-nav-brand [data-name='+brand_name+']').trigger("click");


    });

    //控制小三角显示
    function triangleShow($triangle,brand_name) {
        $triangle.css({
            'border-bottom':'.06rem solid '+params[brand_name]['bg_color'],
            'display':'inline-block'
        });
        $triangle.closest('li').siblings().children('.triangle').css('display','none');
    }

    //控制优惠券背景色
    function setCouponBackgroundColor($block_coupon,brand_name) {
        $block_coupon.css('background-color',params[brand_name]['bg_color'])
    }

    //控制优惠券名称和使用日期
    function setCouponNameAndUseDate(brand_name) {
        $coupon_title.html(params[brand_name]['brand_name']);
        $coupon_title.html(params[brand_name]['brand_name']);
        $coupon_use_date.html(params[brand_name]['use_date']);
    }


    //根据品牌名称获取爆品专区内容
    function setBaopinList(brand_name) {
        getProduct({
            'request_url':'/youpin/getExplosiveGoods',
            'request_data':{
                module_type: params[brand_name]['coupon_params']['module_type']
            },
            '$tpl':$("#JsMShuang11ProductListTpl"),
            'is_flash':false,
            'num':4,
            '$target':$(".js-baopin-product-list"),
            callback:function ($target){
            }
        });
    }


    //根据品牌名称显示出商品列表
    function showAllActiveList(brand_name,photo_used) {

        //根据品牌名称设置五折区
        var wuzhe_request_data = [
            {brand_id:params[brand_name]['brand_id'][0]},
            {brand_id:params[brand_name]['brand_id'][1]}
        ];
        setProductList(brand_name,'wuzhe','品牌五折区','doGetHalfOffList',wuzhe_request_data,photo_used);

        //根据品牌名称设置百元区
        var baiyuan_request_data = [
            {
                brand_id:params[brand_name]['brand_id'][0],
                price: 100
            },
            {
                brand_id:params[brand_name]['brand_id'][1],
                price: 100
            }
        ];
        setProductList(brand_name,'baiyuan','百元特惠区','aj_get_goods',baiyuan_request_data,photo_used);

        //根据品牌名称设置最新上架区
        var zuixin_request_data = [
            {
                brand_id:params[brand_name]['brand_id'][0],
            },
            {
                brand_id:params[brand_name]['brand_id'][1],
            }
        ];
        setProductList(brand_name,'zuixin','最新上架区','aj_get_goods',zuixin_request_data,photo_used);


    }

    /**
     *
     * 设置活动区模板  请求数据  设置商品列表
     * @param brand_name    品牌名称
     * @param active_name   活动名称（wuzhe，baiyuan,zuixin）
     * @param active_name_text  活动标题名（汉字）
     * @param request_url    请求地址
     * @param request_data      请求参数
     * @param photo_used      图片入口使用 1 代表brand_id第1个  2 代表brand_id第2个
     *
     */
    function setProductList(brand_name,active_name,active_name_text,request_url,request_data,photo_used) {
        var brand_separate_name2,brand_id,brand_separate_name;

        if(typeof photo_used == 'undefined'){
            brand_separate_name2 = params[brand_name]['brand_separate_name2'];
            brand_id=params[brand_name]['brand_id'];
            brand_separate_name=params[brand_name]['brand_separate_name'];

        }else if(photo_used == 1){
            brand_separate_name2 = [params[brand_name]['brand_separate_name2'][0]];
            brand_id= [params[brand_name]['brand_id'][0]];
            brand_separate_name=[params[brand_name]['brand_separate_name'][0]];
            request_data = [request_data[0]]
        }else if(photo_used == 2){
            brand_separate_name2 = [params[brand_name]['brand_separate_name2'][1]];
            brand_id= [params[brand_name]['brand_id'][1]];
            brand_separate_name=[params[brand_name]['brand_separate_name'][1]];
            request_data = [request_data[1]]
        }


        var data = {
            brand_id:brand_id,
            brand_separate_name:brand_separate_name,
            brand_separate_name2:brand_separate_name2,
            active_name: active_name,
            active_name_text:active_name_text,
            more: brand_id//'more'
        };

        var html_fn = $.tmpl($.trim($("#product_wrap_html").html())),
            str = html_fn(data);

        $('.block-'+active_name+' .block-inner').html(str);

        for(var i= 0; i<data.brand_separate_name2.length; i++) {
            getProduct({
                'request_url': '/youpin/' + request_url,
                'request_data':request_data[i],
                '$tpl': $("#JsMShuang11ProductListTpl"),
                'is_flash': false,
                'num': 8,
                '$target': $(".js-" + data.brand_separate_name2[i] + data.active_name + "-product-list"),
                callback:function ($target){
                    $('.js-leshiwuzhe-product-list').prev('.block-title').css('display','none');
                    $('.js-leshiwuzhe-product-list').next('.more').css('display','none');
                    $('.js-oppowuzhe-product-list').prev('.block-title').css('display','none');
                    $('.js-oppowuzhe-product-list').next('.more').css('display','none');
                }
            });
        }

    }

    //弹层小组件  用于优惠券弹出
    function showCouponWrap(coupon_number) {
        $('body').append('<div class="allWrap">' +
            '<div class="inner-Wrap">' +
            '<span>优惠券领取成功！</span>' +
            '<span>您的优惠券号码为：</span>' +
            '<span>'+coupon_number+'</span>' +
            // '<div class="confirm">确定</div>' +
            '</div>' +
            '</div>');
        $('.allWrap').css({
            'z-index':9,
            'position':'fixed',
            'top': 0,
            'left': 0,
            'bottom': 0,
            'right': 0,
            'background':'rgba(0,0,0,.5)',
        });
        $('.allWrap .inner-Wrap').css({
            'z-index': 99,
            'background-color': '#fff',
            'opacity': '.8',
            'width': '50%',
            'position':'absolute',
            'top':'25%',
            'left':'50%',
            'margin-left':'-25%'
        });
        $('.allWrap span').css({
            'display':'block',
            'padding': '.1rem 0',
            'text-align': 'center',
            'color':'#000'
        });
        // $('.confirm').css({
        //     'padding':'.05rem',
        //     'border-top':'1px solid #000',
        //     'text-align':'center'
        // });
        $('.allWrap').on('click',function () {
            $(this).remove()
        })

    }
    function showNoCouponWrap(content) {
        $('body').append('<div class="allWrap">' +
            '<div class="inner-Wrap">' +
            '<span>'+content+'</span>' +
            '</div>' +
            '</div>');
        $('.allWrap').css({
            'z-index':9,
            'position':'fixed',
            'top': 0,
            'left': 0,
            'bottom': 0,
            'right': 0,
            'background':'rgba(0,0,0,.5)',
        });
        $('.allWrap .inner-Wrap').css({
            'z-index': 99,
            'background-color': '#fff',
            'opacity': '.8',
            'width': '50%',
            'position':'absolute',
            'top':'25%',
            'left':'50%',
            'margin-left':'-25%'
        });
        $('.allWrap span').css({
            'display':'block',
            'padding': '.1rem 0',
            'text-align': 'center',
            'color':'#000'
        });
        $('.allWrap').on('click',function () {
            $(this).remove()
        })

    }

    // 倒计时
    function countDownTime(){
        var
            time_jiedian = ['2016/10/28','2016/10/31','2016/11/03','2016/11/07','2016/11/11','2016/11/13'],
            target_time = (new Date(time_jiedian[0]+' 00:00:00')).getTime(),

            current_time = window.CURRENT_TIME || Date.now();
        // 当前时间大于目标时间  目标时间变为下一个时间节点

        while(current_time>target_time){
            target_time = (new Date(time_jiedian[_i++]+' 00:00:00')).getTime();
        }
        _i = _i -1;
        $Target = $('.js-countdown');


        // 开启倒计时
        Bang.startCountdown(target_time, current_time,$Target, {
            start: function(){
                // 倒计时开始前
            },
            process: function(current_time){
                // 倒计时ing
            },
            end: function(){
                // 倒计时结束

                // do something at end
            }
        })

    }

    //通用输出模板变量
    function getProduct(obj){
        $.get(obj.request_url,obj.request_data, function(res){
            try{
                res = $.parseJSON(res);

                if (!res['errno']) {

                    var product_list = res[ 'result' ][ 'product_list' ] || res[ 'result' ][ 'good_list' ] || res[ 'result' ][ 'flash_list' ] || res[ 'result' ];
                    // 限制显示商品数量
                    product_list.splice(parseInt(obj.num, 10), 9999);

                    // 获取商品列表的html字符串
                    obj.is_today = obj.is_today || false;
                    var html_fn  = $.tmpl( $.trim(obj.$tpl.html())),
                        html_str = html_fn({
                            'list': product_list,
                            'is_flash': obj.is_flash,
                            'is_today': obj.is_today,
                            'huodong_name' : 'erhuo_jinqiu'
                        });

                    $.each(product_list, function (item, i)  {
                        tcb.preLoadImg(item['thum_img']);
                    });
                    // 输出数据
                    obj.$target.html(html_str);

                    setTimeout(function(){
                        tcb.lazyLoadImg({
                            'delay': 0,
                            'interval': 300 // 0:同时显示，其他时间表示实际时间间隔
                        }, obj.$target);
                    }, 300);
                    typeof obj['callback']==='function' && obj['callback'](obj.$target)

                } else {

                }

            } catch (ex){}

        });

    }


});

$.fn.prevAll = function(selector){
    var prevEls = [];
    var el = this[0];
    if(!el) return $([]);
    while (el.previousElementSibling) {
        var prev = el.previousElementSibling;
        if (selector) {
            if($(prev).is(selector)) prevEls.push(prev);
        }
        else prevEls.push(prev);
        el = prev;
    }
    return $(prevEls);
};

$.fn.nextAll = function (selector) {
    var nextEls = [];
    var el = this[0];
    if (!el) return $([]);
    while (el.nextElementSibling) {
        var next = el.nextElementSibling;
        if (selector) {
            if($(next).is(selector)) nextEls.push(next);
        }
        else nextEls.push(next);
        el = next;
    }
    return $(nextEls);
};
