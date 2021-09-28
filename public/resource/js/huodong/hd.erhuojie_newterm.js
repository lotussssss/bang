$(function(){
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
        '$tpl':$("#JsNewErhuojieProductListTpl"),
        'is_flash':false,
        'num':4,
        '$target':$(".js-qjyj-product-list")
    });
    //超值主流专区
    getProduct({
        'request_url':'/youpin/aj_get_goods?price=2000&not_brand=50',
        '$tpl':$("#JsNewErhuojieProductListTpl"),
        'is_flash':false,
        'num':4,
        '$target':$(".js-czzl-product-list")
    });
    //千元精品专区
    getProduct({
        'request_url':'/youpin/aj_get_goods?price=1000&not_brand=50',
        '$tpl':$("#JsNewErhuojieProductListTpl"),
        'is_flash':false,
        'num':4,
        '$target':$(".js-qyjp-product-list")
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
    var tab_box = $('.tab-box'),
        tab_placeholder = $('.tab-placeholder'),
        tab_box_h = tab_box.height(),
        tab_top = $('.block3').offset().top- tab_box_h,
        tab_bottom = $('.block5').offset().top - tab_box_h,
        scroll_point2 = $('.block4').offset().top - tab_box_h,
        flag_click_scrolling = false

    $(window).on('scroll load',function(){
        var
            scroll_top = $(window).scrollTop(),
            tab_pos = 0

        if(scroll_top>=tab_top && scroll_top<=tab_bottom){
            if (scroll_top==tab_bottom){
                // 千元精品
                tab_pos = 3
            }
            else if (scroll_top>=scroll_point2){
                // 超值主流
                tab_pos = 2
            } else {
                // 旗舰优价
                tab_pos = 1
            }
            tab_box.show().addClass('fixed').css('top',0);
            tab_placeholder.css('display','block');

            if (!flag_click_scrolling){
                // 非点击滚动时才设置选中指定tab

                setTabSelected(tab_pos)
            }

        }else if(scroll_top>tab_bottom){
            tab_box.hide().removeClass('fixed').css('top',tab_bottom-33);
            tab_placeholder.css('display','none');
        }else{
            tab_box.hide().removeClass('fixed').css('top',tab_top-33);
            tab_placeholder.css('display','none');
        }
    });

    $ ('.tab-list li').hover (function () {
        setTabSelected ($ (this).index ())
    })

    tcb.bindEvent(document.body,{
        '.tab-list li':function(){
            var me = $(this);
            var pos = me.attr("data-pos");
            var scrolls = $(".block" + pos).offset().top - tab_box_h;

            flag_click_scrolling = true

            $("html,body").animate({scrollTop:scrolls}, '500', function(){
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

});
