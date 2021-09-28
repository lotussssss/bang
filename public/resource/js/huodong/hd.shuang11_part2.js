$ (function () {

    // 点击切换专场tab
    $ ('.tab-list li').click (function (e) {
        e.preventDefault();
        var me = $ (this),
            tab_desc = $ ('.tab-desc'),
            tab_index = me.index (),
            target_tab_desc = tab_desc.eq (tab_index);

        if (target_tab_desc.is (':visible')) {
            return;
        }

        tab_desc.hide ();
        target_tab_desc.show ();

        if (tab_index >0) {
            renderAllProductList (tab_index);
            $ ('.block-11-11').hide ();
            $ ('.block-product').show ();
        } else {
            $ ('.block-11-11').show ();
            $ ('.block-product').hide ();
            //狂欢秒杀
            renderSeckillProductList();
        }

    })
    //点击双11狂欢8个品牌跳转至对应专场
    $('.brand-pic-list li').click(function (e){
        e.preventDefault();
        var me = $(this),
            brand_pic_index = me.attr('data-index');

            $('.tab-list li').eq(brand_pic_index).trigger("click");
    })
    //点击领取优惠券
    $('.tab-desc .coupon a').click(function (e){
        e.preventDefault();
        var me = $(this);
        tcb.showDialog('<div class="qrcode"><img src="https://p.ssl.qhimg.com/t01dff727a668d625a5.png" alt=""/></div><div class="qrcode-txt">微信扫码，立即领取优惠券</div>', 'coupon-qrcode');
    })

    // 事件绑定
    tcb.bindEvent(document.body, {
        // 点击商品
        '.product-list a': function(e){
            var me = $(this);

            // 商品有已抢光标签，那么不让跳转
            if (me.find('.p-label-soldout').length) {
                e.preventDefault();

                return;
            }
        }

    });
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
                    obj.is_today = obj.is_today || false;
                    var html_fn = $.tmpl ($.trim (obj.$tpl.html ())),
                        html_str = html_fn ({
                            'list'     : product_list,
                            'is_flash' : obj.is_flash,
                            'is_today' : obj.is_today,
                            'huodong_name' : 'shuang11',
                            'com_price_tit': obj.com_price_tit,
                            'price_tit': obj.price_tit
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

                    typeof obj[ 'callback' ] === 'function' && obj[ 'callback' ] (obj.$target,product_list)
                } else {

                }

            } catch (ex) {}

        });

    }
    /**
     * 输出商品模型（一个专区里一个品牌的商品，包括标题和商品列表）
     * @param $target 输出目标$对象
     * @param data    输出数据
     */
    function renderProductModule($target, data){
        if (!($target&&$target.length)){
            return
        }
        data = data || [{
            'title' : '',
            'url' : '',
            'class_name' : ''
        }];

        var
            html_fn = $.tmpl($.trim( $('#JsShuang11ProductModuleTpl').html() )),
            html_st = html_fn({
                'module_list': data
            });

        $target.html(html_st);
    }

    /**
     * 输出一个专场的所有商品
     * @param module_type 专场id，区分专场
     * 1 ： 魅族、乐视
       2 ： vivo、oppo
       3 ： 华为、小米
       4 ： 三星
       5 ： 苹果
     */
    function renderAllProductList(module_type){
        var
            special_list = window.SPECIAL_LIST || [], //专场列表数据（来自tpl）
            special_data = special_list[module_type ],  //tab切换到的专场数据
            brand_info = special_data['brand_info'] //品牌名和brand_id

        //爆品专区
        getProduct ({
            'request_url' : '/youpin/getExplosiveGoods?module_type='+module_type,
            '$tpl'        : $ ("#JsProductList161111Tpl"),
            'is_flash'    : false,
            'num'         : 5,
            '$target'     : $ (".js-hot-product-list"),
            'com_price_tit':'新机价：',
            'price_tit':'优品价'
        })

        //按品牌+专区组织的数据
        var
            module_half_data = [],
            module_100_data = [],
            module_new_data = []
        for(var i = 0; i<brand_info.length; i++){
            module_half_data.push({
                'title' : brand_info[i][0]+'品牌5折区',
                'url' : '/youpin/search?brand_id='+brand_info[i][1],
                'class_name' : 'js-product-list-half-'+brand_info[i][1]
            })
            module_100_data.push({
                'title' : brand_info[i][0]+'百元特惠',
                'url' : '/youpin/search?brand_id='+brand_info[i][1],
                'class_name' : 'js-product-list-100-'+brand_info[i][1]
            })
            module_new_data.push({
                'title' : brand_info[i][0]+'最新上架',
                'url' : '/youpin/search?brand_id='+brand_info[i][1],
                'class_name' : 'js-product-list-new-'+brand_info[i][1]
            })
        }
        //品牌5折区
        renderProductModule( $('.block3'), module_half_data)
        //百元特惠专区
        renderProductModule( $('.block4'), module_100_data)
        //最新上架专区
        renderProductModule( $('.block5'), module_new_data)


        for(var i = 0; i<brand_info.length; i++){

            //品牌5折区
            getProduct ({
                'request_url' : '/youpin/doGetHalfOffList?brand_id='+brand_info[i][1],
                '$tpl'        : $ ("#JsProductList161111Tpl"),
                'is_flash'    : false,
                'num'         : 10,
                '$target'     : $ (".js-product-list-half-"+brand_info[i][1]),
                'com_price_tit':'新机价：',
                'price_tit':'优品价'
            });

            //百元特惠专区
            getProduct ({
                'request_url' : '/youpin/aj_get_goods?price=100&brand_id='+brand_info[i][1],
                '$tpl'        : $ ("#JsProductList161111Tpl"),
                'is_flash'    : false,
                'num'         : 10,
                '$target'     : $ (".js-product-list-100-"+brand_info[i][1]),
                'com_price_tit':'新机价：',
                'price_tit':'优品价'
            });

            //最新上架专区
            getProduct ({
                'request_url' : '/youpin/aj_get_goods?brand_id='+brand_info[i][1],
                '$tpl'        : $ ("#JsProductList161111Tpl"),
                'is_flash'    : false,
                'num'         : 10,
                '$target'     : $ (".js-product-list-new-"+brand_info[i][1]),
                'com_price_tit':'新机价：',
                'price_tit':'优品价'
            });
        }

    }
    //狂欢秒杀
    function renderSeckillProductList(){
        getProduct ({
            'request_url' : '/youpin/aj_get_flash_sale_goods',
            '$tpl'        : $ ("#JsProductList161111Tpl"),
            'is_flash'    : true,
            'num'         : 10,
            '$target'     : $ (".js-seckill-product-list"),
            'com_price_tit':'新机价：',
            'price_tit':'秒杀价',
            callback:function ($target,product_list){
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
                                        me.hide().parent('.item a').append('<span class="p-label-soldout"><img src="https://p.ssl.qhimg.com/t01c26442fb2f8c9618.png" alt=""></span>');
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
                                me.hide().parent('.item a').append('<span class="p-label-soldout"><img src="https://p.ssl.qhimg.com/t01c26442fb2f8c9618.png" alt=""></span>');
                            }
                        });

                    }
                    else {
                        me.hide().parent('.item a').append('<span class="p-label-soldout"><img src="https://p.ssl.qhimg.com/t01c26442fb2f8c9618.png" alt=""></span>');
                    }
                });
            }
        });
    }
    //页面初始化
    function init(){
        $('.tab-list li').first().trigger("click")
    }
    init();
});
