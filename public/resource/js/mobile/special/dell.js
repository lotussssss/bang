wx.ready(function(){
    var noop = function(){};
    var wxData = {};

    // 微信分享的数据
    wxData = {
        "title" : 'Dell直供官方翻新机，低至6折！',
        "desc" : 'Dell官方翻新机专场，低至6折，全场Dell商品还能享受折上再减50元的优惠，赶紧来抢货吧,先到先得！',
        "link" :  "http://bang.360.cn/youpin/dell",
        "imgUrl" : 'https://p.ssl.qhimg.com/t01215d8605035437c7.png',
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
    tcb.bindEvent(document.body,{
        '.nav-tab a':function(){
            var me  = $(this);
            var cur = "cur";
            me.addClass(cur).siblings().removeClass(cur);
            //$('.nav-tab-desc li').eq($(this).index()).addClass(cur).siblings().removeClass(cur);
            var data_pos = me.attr('data-pos');
            $.scrollTo({
                endY : $('.pos' + data_pos).offset().top - 10,
                duration: 800
            })
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
                    var tpl_fn = $.tmpl($.trim($("#JsmDellProductListTpl").html())),
                        tpl_st = tpl_fn({
                            "list" : product_list
                        });
                    $('.js-wzj-product-list').html(tpl_st);
                }

            } catch (ex){}

        });
    }
    getWZJProduct();
});
