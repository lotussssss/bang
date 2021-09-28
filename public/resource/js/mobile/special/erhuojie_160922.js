wx.ready(function(){
    var noop = function(){};
    var wxData = {};

    // 微信分享的数据
    wxData = {
        "title" : '机皇直降100元，全场顺丰包邮！',
        "desc" : '同城帮优品周年庆，全场手机特惠，旗舰机、百元机、大容量、国货精品，总有一款适合你！',
        "link" :  "http://bang.360.cn/youpin/erhuo",
        "imgUrl" : 'https://p.ssl.qhimg.com/t012148fe632cdaa478.jpg',
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
    var tab_box = $('.tab-list'),
        tab_box_offset = tab_box.offset(),
        tab_top = Math.floor(tab_box_offset.top),
        tab_box_h = Math.floor(tab_box_offset.height),
        tab_bottom = Math.floor($('.block6').offset().top - tab_box_h),

        scroll_point2 = Math.floor($ ('.block3').offset ().top - tab_box_h),
        scroll_point3 = Math.floor($ ('.block4').offset ().top - tab_box_h),
        scroll_point4 = Math.floor($ ('.block5').offset ().top - tab_box_h),
        flag_click_scrolling = false

    $(window).on('scroll',function(){

        if (tab_bottom < 2000) {

            tab_bottom = Math.floor($ ('.block6').offset ().top - tab_box_h)

            scroll_point2 = Math.floor($ ('.block3').offset ().top - tab_box_h)
            scroll_point3 = Math.floor($ ('.block4').offset ().top - tab_box_h)
            scroll_point4 = Math.floor($ ('.block5').offset ().top - tab_box_h)
        }

        var
            scroll_top = $(window).scrollTop(),
            tab_pos = 0

        if(scroll_top>=tab_top && scroll_top<=tab_bottom){
            tab_box.addClass('fixed').css('top',0)

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

        }else if(scroll_top>tab_bottom){
            tab_box.removeClass('fixed');
            tab_box.css('top',tab_bottom);
        }else{
            tab_box.removeClass('fixed');
            tab_box.css('top',tab_top);
        }
    });

    $('.tab-list li').click(function(){
        var me = $(this);
        var pos = me.attr("data-pos");

        flag_click_scrolling = true

        $.scrollTo({
            endY : Math.floor($(".block" + pos).offset().top-tab_box_h),
            duration: 800,
            callback: function(){
                flag_click_scrolling = false
            }
        })
        me.addClass('cur').siblings('.cur').removeClass('cur');
    });

    // 设置选中的tab位置
    function setTabSelected (pos) {
        pos = pos || 0
        pos = parseInt (pos, 10) || 0

        var
            $TabItem = $ ('.tab-list li')

        $TabItem.eq (pos).addClass ('cur').siblings ('.cur').removeClass ('cur')
    }


    //通用输出模板变量
    function getProduct(obj){
        $.get(obj.request_url, function(res){
            try{
                res = $.parseJSON(res);

                if (!res['errno']) {

                    var product_list = res['result']['product_list']||res['result']['good_list']||res['result'];
                    // 限制显示商品数量
                    product_list.splice(parseInt(obj.num, 10), 9999);

                    // 获取商品列表的html字符串
                    obj.is_today = obj.is_today || false;
                    var html_fn  = $.tmpl( $.trim(obj.$tpl.html())),
                        html_str = html_fn({
                            'list': product_list,
                            'is_flash': obj.is_flash,
                            'is_today': obj.is_today,
                            'huodong_name' : 'erhuo_160922'
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

    //机皇专区
    getProduct({
        'request_url':'/youpin/dogettopproductlist',
        '$tpl':$("#JsMNewErhuojieProductListTpl"),
        'is_flash':false,
        'num':10,
        '$target':$(".js-top-product-list"),
        callback:function ($target){
            $target.find('.item').append('<span class="p-label"><img class="w100" src="https://p.ssl.qhimg.com/t01a26cf153e4d72119.png" alt=""/></span>');
        }
    });
    //百元特惠专区
    getProduct({
        'request_url':'/youpin/aj_get_goods?price=100',
        '$tpl':$("#JsMNewErhuojieProductListTpl"),
        'is_flash':false,
        'num':10,
        '$target':$(".js-lowprice-product-list"),
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
    getProduct({
        'request_url':'/youpin/doGetLargeStorageList',
        '$tpl':$("#JsMNewErhuojieProductListTpl"),
        'is_flash':false,
        'num':10,
        '$target':$(".js-large-product-list")
    });
    //国货精品专区
    getProduct({
        'request_url':'/youpin/doGetGuohuoList',
        '$tpl':$("#JsMNewErhuojieProductListTpl"),
        'is_flash':false,
        'num':10,
        '$target':$(".js-guohuo-product-list")
    });

});
