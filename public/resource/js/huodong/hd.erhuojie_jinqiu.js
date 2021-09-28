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
                    obj.is_today = obj.is_today || false;
                    var html_fn = $.tmpl ($.trim (obj.$tpl.html ())),
                        html_str = html_fn ({
                            'list'     : product_list,
                            'is_flash' : obj.is_flash,
                            'is_today' : obj.is_today,
                            'huodong_name' : 'erhuo_jinqiu'
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
    //今日秒杀
    getProduct ({
        'request_url' : '/youpin/aj_get_flash_sale_goods',
        '$tpl'        : $ ("#JsCountdownProductTpl"),
        'is_flash'    : false,
        'num'         : 2,
        '$target'     : $ (".js-miaosha-product-list")
    });
    //机皇专区
    getProduct ({
        'request_url' : '/youpin/dogettopproductlist',
        '$tpl'        : $ ("#JsNewErhuojieProductListTpl"),
        'is_flash'    : false,
        'num'         : 10,
        '$target'     : $ (".js-top-product-list"),
        callback      : function ($target) {
            $target.find ('.item').append ('<span class="p-label"><img class="w100" src="https://p.ssl.qhimg.com/t01a26cf153e4d72119.png" alt=""/></span>');
        }
    });
    //百元特惠专区
    getProduct ({
        'request_url' : '/youpin/aj_get_goods?price=100',
        '$tpl'        : $ ("#JsNewErhuojieProductListTpl"),
        'is_flash'    : false,
        'num'         : 10,
        '$target'     : $ (".js-lowprice-product-list"),
        callback      : function ($target) {
            var
                $item = $target.find ('.item')

            //CEO推荐
            $item.eq(1).append ('<span class="p-label"><img class="w100" src="https://p.ssl.qhimg.com/t01a985d1c88db4c6f2.png" alt=""/></span>');
            //本月热销
            $item.eq(3).append ('<span class="p-label"><img class="w100" src="https://p.ssl.qhimg.com/t0145744c6ec9e7a4c0.png" alt=""/></span>');
            //今日必抢
            $item.eq(5).append ('<span class="p-label"><img class="w100" src="https://p.ssl.qhimg.com/t0103559d87930aa7a9.png" alt=""/></span>');
        }
    });
    //超大容量专区
    getProduct ({
        'request_url' : '/youpin/doGetLargeStorageList',
        '$tpl'        : $ ("#JsNewErhuojieProductListTpl"),
        'is_flash'    : false,
        'num'         : 10,
        '$target'     : $ (".js-large-product-list")
    });
    //国货精品专区
    getProduct ({
        'request_url' : '/youpin/doGetGuohuoList',
        '$tpl'        : $ ("#JsNewErhuojieProductListTpl"),
        'is_flash'    : false,
        'num'         : 10,
        '$target'     : $ (".js-guohuo-product-list")
    });

    /*导航条--开始绝对定位在头部*/
    //var tab_box = $('.tab-box'),
    //    tab_placeholder = $('.tab-placeholder'),
    //    tab_top = tab_box.offset().top,
    //    tab_box_h = tab_box.height(),
    //    tab_bottom = $('.block5').offset().top - tab_box_h-33;
    //
    //$(window).on('scroll',function(){
    //    var scroll_top = $(window).scrollTop();
    //    if(scroll_top>tab_top && scroll_top<tab_bottom+33){
    //        tab_box.addClass('fixed');
    //        tab_placeholder.css('display','block');
    //        tab_box.css('top',0);
    //    }else if(scroll_top>=tab_bottom+33){
    //        tab_box.removeClass('fixed');
    //        tab_placeholder.css('display','none');
    //        tab_box.css('top',tab_bottom);
    //    }else{
    //        tab_box.removeClass('fixed');
    //        tab_placeholder.css('display','none');
    //        tab_box.css('top',tab_top-33);
    //    }
    //});

    /*END导航条--开始绝对定位在头部*/
    var tab_box = $ ('.tab-box'),
        tab_box_h = tab_box.height (),

        tab_top = tab_box.offset ().top,//专区1
        tab_bottom = $ ('.block6').offset ().top - tab_box_h,

        scroll_point2 = $ ('.block3').offset ().top - tab_box_h,//专区2
        scroll_point3 = $ ('.block4').offset ().top - tab_box_h,//专区3
        scroll_point4 = $ ('.block5').offset ().top - tab_box_h,
        flag_click_scrolling = false;

    $ (window).on ('scroll load', function () {
        var
            scroll_top = $ (window).scrollTop (),
            tab_pos = 0

        if (tab_bottom < 2000) {

            tab_bottom = $ ('.block6').offset ().top - tab_box_h

            scroll_point2 = $ ('.block3').offset ().top - tab_box_h
            scroll_point3 = $ ('.block4').offset ().top - tab_box_h
            scroll_point4 = $ ('.block5').offset ().top - tab_box_h
        }

        if (scroll_top >= tab_top && scroll_top <= tab_bottom) {

            tab_box.addClass ('fixed').css ({
                'top' : 0
            })

            if (scroll_top < scroll_point2) {
                tab_pos = 0
            } else if (scroll_top < scroll_point3) {
                tab_pos = 1
            } else if (scroll_top < scroll_point4) {
                tab_pos = 2
            } else {
                tab_pos = 3
            }

            if (!flag_click_scrolling) {
                // 非点击滚动时才设置选中指定tab

                setTabSelected (tab_pos)
            }

        } else if (scroll_top > tab_bottom) {
            tab_box.removeClass ('fixed').css ('top', tab_bottom - 33);
        } else {
            tab_box.removeClass ('fixed').css ('top', tab_top - 33);
        }
    });

    $ ('.tab-list li').hover (function () {
        setTabSelected ($ (this).index ())
    })

    tcb.bindEvent (document.body, {
        '.tab-list li' : function () {
            var me = $ (this);
            var pos = me.attr ("data-pos");
            var scrolls = pos == '2' ? $ (".block" + pos).offset ().top : $ (".block" + pos).offset ().top - tab_box_h;

            flag_click_scrolling = true

            $ ("html,body").animate ({ scrollTop : scrolls }, '500', function () {
                flag_click_scrolling = false
            })
        }
    });

    // 设置选中的tab位置
    function setTabSelected (pos) {
        pos = pos || 0
        pos = parseInt (pos, 10) || 0

        var
            $TabItem = $ ('.tab-list li')

        $TabItem.eq (pos).addClass ('cur').siblings ('.cur').removeClass ('cur')
    }

    // 今日秒杀
    function startFlashAtToday(){
        // 今日秒杀倒计时
        var
            TodayDate = new Date(),
            today_year = TodayDate.getFullYear(),
            today_month = TodayDate.getMonth()+1,
            today_day = TodayDate.getDate(),
            today_target = (new Date(today_year+'/'+today_month+'/'+today_day+' 14:00:00')).getTime(),

            current_time = window.CURRENT_TIME || Date.now(),
            // 今天的目标时间大于当前时间，那么今天的目标时间作为倒计时终点，否则第二天的同一时间作为终点
            target_time = today_target>current_time ? today_target : today_target+24*60*60*1000,
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
    // 今日秒杀
    startFlashAtToday()

});
