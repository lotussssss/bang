wx.ready(function(){
    var noop = function(){};
    var wxData = {};

    // 微信分享的数据
    wxData = {
        "title" : '这个七夕有“套”“房” —— 同城帮七夕福利',
        "desc" : '同城帮七夕福利【杜蕾斯3只装0.1元兑换券 以及华住酒店339元大礼包】已为您备好，赶紧来领取吧！',
        "link" :  "http://bang.360.cn/huodong/qixi",
        "imgUrl" : 'https://p.ssl.qhimg.com/t01faaeee4669780099.jpg',
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
    // 九成新五折价
    function getWZJProduct(){
        var request_url = '/youpin/ehj_get_half_off_product?pn=0&num=4';
        $.get(request_url, function(res){
            try{
                res = $.parseJSON(res);
                if (res['errno'] == "0") {
                    var product_list = res['result']['product_list'];
                    var tpl_fn = $.tmpl($.trim($("#JsMQiXiProductListTpl").html())),
                        tpl_st = tpl_fn({
                            "list" : product_list
                        });
                    $('.js-wzj-product-list').html(tpl_st);
                }

            } catch (ex){}

        });
    }
    getWZJProduct();

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

