$ (function () {

    // 点击切换专场tab
    $ ('.tab-list li').click (function (e) {
        e.preventDefault();
        var me = $ (this),
            tab_desc = $ ('.tab-desc'),
            tab_index = me.index (),
            target_tab_desc = tab_desc.eq (tab_index)

        if (target_tab_desc.is (':visible')) {
            return
        }

        tab_desc.hide ()
        target_tab_desc.show ()

        if (tab_index < 5) {
            renderAllProductList (tab_index + 1);
            $ ('.block-11-11').hide ();
            $ ('.block-product').show ();
        } else {
            $ ('.block-11-11').show ();
            $ ('.block-product').hide ();
        }

    })
    //点击双11狂欢8个品牌跳转至对应专场
    $('.brand-pic-list li').click(function (e){
        e.preventDefault();
        var me = $(this),
            brand_pic_index = me.attr('data-index')

            $('.tab-list li').eq(brand_pic_index).trigger("click")
    })
    //点击领取优惠券
    $('.tab-desc .coupon a').click(function (e){
        e.preventDefault();
        var me = $(this)
        tcb.showDialog('<div class="qrcode"><img src="https://p.ssl.qhimg.com/t01dff727a668d625a5.png" alt=""/></div><div class="qrcode-txt">微信扫码，立即领取优惠券</div>', 'coupon-qrcode')
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
                            'com_price_tit':'新机价：',
                            'price_tit':'优品价'
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

                    typeof obj[ 'callback' ] === 'function' && obj[ 'callback' ] (obj.$target)
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
        }]

        var
            html_fn = $.tmpl($.trim( $('#JsShuang11ProductModuleTpl').html() )),
            html_st = html_fn({
                'module_list': data
            })

        $target.html(html_st)
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
            '$target'     : $ (".js-hot-product-list")
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
                '$target'     : $ (".js-product-list-half-"+brand_info[i][1])
            });

            //百元特惠专区
            getProduct ({
                'request_url' : '/youpin/aj_get_goods?price=100&brand_id='+brand_info[i][1],
                '$tpl'        : $ ("#JsProductList161111Tpl"),
                'is_flash'    : false,
                'num'         : 10,
                '$target'     : $ (".js-product-list-100-"+brand_info[i][1])
            });

            //最新上架专区
            getProduct ({
                'request_url' : '/youpin/aj_get_goods?brand_id='+brand_info[i][1],
                '$tpl'        : $ ("#JsProductList161111Tpl"),
                'is_flash'    : false,
                'num'         : 10,
                '$target'     : $ (".js-product-list-new-"+brand_info[i][1])
            });
        }

    }
    //页面初始化
    function init(){
        var tab_index = $('.tab-desc:visible').index();//index()取同级元素位置，tab-desc前有tab-list
        if (tab_index < 5) {
            renderAllProductList (tab_index + 1);
            $ ('.block-11-11').hide ();
            $ ('.block-product').show ();
        } else {
            $ ('.block-11-11').show ();
            $ ('.block-product').hide ();
        }
        setCountDown(tab_index+1);
    }
    // 专场倒计时
    function setCountDown(index){
        var
            special_list = window.SPECIAL_LIST || [], //专场列表数据（来自tpl）
            cur_special_list = special_list[index],
            curDate = new Date(),
            end_year = curDate.getFullYear(),
            end_month = cur_special_list['end_month'],
            end_day = cur_special_list['end_day'],
            target_time = (new Date(end_year+'/'+end_month+'/'+end_day+' 23:59:59')).getTime(),
            current_time = window.CURRENT_TIME || Date.now(),
            $Target = $('.js-countdown')
        // 开启秒杀倒计时
        Bang.startCountdown(target_time, current_time, $Target, {
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
    init();
});
