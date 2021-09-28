$ (function () {
    //通用输出模板变量
    function getProduct (obj) {
        $.get (obj.request_url, function (res) {
            try {
                res = $.parseJSON (res);

                if (!res[ 'errno' ]) {

                    var product_list = res[ 'result' ][ 'product_list' ] || res[ 'result' ][ 'good_list' ] || res[ 'result' ][ 'flash_list' ] || res[ 'result' ];
                    // 限制显示商品数量
                    product_list.splice (parseInt (obj.num, 10), 9999);

                    // 获取商品列表的html字符串
                    obj.com_price_tit = obj.com_price_tit || '新机价：';
                    obj.price_tit = obj.price_tit || '优品价';

                    var html_fn = $.tmpl ($.trim (obj.$tpl.html ())),
                        html_str = html_fn ({
                            'list'     : product_list,
                            'is_flash' : obj.is_flash,
                            'huodong_name' : 'erhuojie_1703',
                            'com_price_tit':obj.com_price_tit,
                            'price_tit':obj.price_tit
                        });

                    $.each (product_list, function (item, i) {
                        tcb.preLoadImg (item[ 'thum_img' ]);
                    });
                    // 输出数据
                    obj.$target.html (html_str);

                    setTimeout (function () {
                        tcb.lazyLoadImg ({
                            'delay'    : 0,
                            'interval' : 300 // 0:同时显示，其他时间表示实际时间间隔
                        }, obj.$target);
                    }, 300);

                    typeof obj[ 'callback' ] === 'function' && obj[ 'callback' ] (obj.$target, product_list)
                } else {

                }

            } catch (ex) {}

        });
    }
    //苹果专区
    getProduct ({
        'request_url' : '/youpin/doGetProductListByBrand?brand_id=2',
        '$tpl'        : $("#JsProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 10,
        '$target'     : $ (".js-ios-product-list")
    });
    //安卓专区
    getProduct ({
        'request_url' : '/youpin/doGetAndroidList',
        '$tpl'        : $("#JsProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 10,
        '$target'     : $ (".js-android-product-list")
    });
    //dell电脑
    getProduct ({
        'request_url' : '/youpin/doGetDellList',
        '$tpl'        : $("#JsProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 10,
        '$target'     : $ (".js-dell-product-list")
    });
    //分期免息
    getProduct ({
        'request_url' : '/youpin/doGetMianxiList',
        '$tpl'        : $("#JsProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 10,
        '$target'     : $ (".js-mianxi-product-list")
    });
    //限时秒杀
    getProduct ({
        'request_url' : '/youpin/doGetFlashSaleGoods',
        '$tpl'        : $ ("#JsProductListVer17Tpl"),
        'is_flash'    : true,
        'num'         : 5,
        '$target'     : $ (".js-flash-product-list"),
        'price_tit':'秒杀价',
        callback: function ($target, product_list) {
            countDown($target, product_list)
        }
    });
    //倒计时
    function countDown($target,product_list){
        $target.find('.countdown').each(function (index){
            var me = $(this),
                product = product_list[index],
                current_time = window.CURRENT_TIME || Date.now(),
                flash_start_time = new Date(product['flash_start_time'].replace(/-/g, '/')).getTime(),
                flash_end_time = new Date(product['flash_end_time'].replace(/-/g, '/')).getTime();

            //抢购未开始
            if (!product['flash_saling'] && current_time<flash_start_time) {
                //Bang.countdown_desc = '距开始';
                me.addClass('countdown-start-prev')
                    .attr('data-descbefore', '距开始')

                Bang.startCountdown(flash_start_time, current_time, me, {
                    'end': function(){
                        //Bang.countdown_desc = '距结束';
                        me.removeClass('countdown-start-prev')
                            .attr('data-descbefore', '距结束')
                        Bang.startCountdown(flash_end_time, flash_start_time, me, {
                            'end': function(){
                                me.hide().parents('.item').find('.p-label-soldout').show();
                            }
                        });
                    }
                });
            }
            // 抢购进行中
            else if (product['flash_saling']==1 && product['flash_status']=='saling' && current_time<flash_end_time) {
                //Bang.countdown_desc = '距结束';
                me.removeClass('countdown-start-prev')
                    .attr('data-descbefore', '距结束');
                Bang.startCountdown(flash_end_time, current_time, me, {
                    'end': function(){
                        me.hide().parents('.item').find('.p-label-soldout').show();
                    }
                });
            }
            else {
                me.hide().parents('.item').find('.p-label-soldout').show();
            }
        });
    }

});