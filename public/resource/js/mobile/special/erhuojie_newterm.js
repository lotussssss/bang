wx.ready(function(){
    var noop = function(){};
    var wxData = {};

    // 微信分享的数据
    wxData = {
        "title" : '开学啦！赶紧带走您的“新”手机和“新”电脑吧！最多省300元哦！',
        "desc" : 'iPhone6、iPhone6P预售减200元，Dell专享100元优惠券，这么多开学季优惠，赶紧买买买！',
        "link" :  "http://bang.360.cn/youpin/xinxueqi",
        "imgUrl" : 'https://p.ssl.qhimg.com/t011826f50b08b73b7b.jpg',
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
        tab_placeholder = $('.nav-tab-placeholder'),
        tab_top = tab_box.offset().top,
        tab_box_h = tab_box.offset().height,
        tab_bottom = $('.block5').offset().top - tab_box_h;

    $(window).on('scroll',function(){
        tab_bottom = $('.block5').offset().top - tab_box_h;

        var scroll_top = $(window).scrollTop();
        if(scroll_top>tab_top && scroll_top<tab_bottom){
            tab_box.addClass('fixed');
            //tab_placeholder.css('display','block');
            tab_box.css('top',0);
        }else if(scroll_top>=tab_bottom){
            tab_box.removeClass('fixed');
            //tab_placeholder.css('display','none');
            tab_box.css('top',tab_bottom);
        }else{
            tab_box.removeClass('fixed');
            //tab_placeholder.css('display','none');
            tab_box.css('top',tab_top);
        }
    });
    //通用输出模板变量
    function getProduct(obj){
        $.get(obj.request_url, function(res){
            try{
                res = $.parseJSON(res);

                if (!res['errno']) {

                    var product_list = res['result']['product_list']||res['result']['good_list'];
                    // 限制显示商品数量
                    product_list.splice(parseInt(obj.num, 10), 9999);

                    // 获取商品列表的html字符串
                    obj.is_today = obj.is_today || false;
                    var html_fn  = $.tmpl( $.trim(obj.$tpl.html())),
                        html_str = html_fn({
                            'list': product_list,
                            'is_flash': obj.is_flash,
                            'is_today': obj.is_today
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

                } else {

                }

            } catch (ex){}

        });

    }

    //旗舰优价专区
    getProduct({
        'request_url':'/youpin/aj_get_goods?price=3000&not_brand=50',
        '$tpl':$("#JsMNewErhuojieProductListTpl"),
        'is_flash':false,
        'num':4,
        '$target':$(".js-qjyj-product-list")
    });
    //超值主流专区
    getProduct({
        'request_url':'/youpin/aj_get_goods?price=2000&not_brand=50',
        '$tpl':$("#JsMNewErhuojieProductListTpl"),
        'is_flash':false,
        'num':4,
        '$target':$(".js-czzl-product-list")
    });
    //千元精品专区
    getProduct({
        'request_url':'/youpin/aj_get_goods?price=1000&not_brand=50',
        '$tpl':$("#JsMNewErhuojieProductListTpl"),
        'is_flash':false,
        'num':4,
        '$target':$(".js-qyjp-product-list")
    });

    $('.tab-list li').click(function(){
        var me = $(this);
        var pos = me.attr("data-pos");

        $.scrollTo({
            endY : $(".block" + pos).offset().top-tab_box_h,
            duration: 800
        })
        me.addClass('cur').siblings('.cur').removeClass('cur');
    });

});

