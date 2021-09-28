wx.ready(function(){
    var noop = function(){};
    var wxData = {};

    // 微信分享的数据
    wxData = {
        "title" : '同城帮优品电信专场',
        "desc" : '买IFREE青春版，送2500MB流量啦！',
        "link" :  window.location.protocol+'//'+window.location.host+window.location.pathname,
        "imgUrl" : 'https://p.ssl.qhimg.com/t01e08dc8b00ff4f983.jpg',
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

    var Cache = {
        flag_loading: false,
        page_max: 0,
        pn : 1
    };

    function getTelecomareaProduct(){
        if (Cache.flag_loading){
            return;
        }
        var request_url = '/youpin/doTelecomArea';
        var params = {
            pn: Cache['pn']
        };

        Cache.flag_loading = true;

        $.get(request_url,params,function(res){
            try{
                res = $.parseJSON(res);

                if (!res['errno']) {
                    var product_list = res['result']['list'];

                    var html_fn  = $.tmpl( $.trim($('#JsMteleComareaProductListTpl').html())),
                        html_str = html_fn({
                            'list': product_list
                        });

                    $('.product-list').append(html_str);

                    if (!Cache.page_max) {
                        Cache.page_max = Math.ceil(res['result']['count']['count']/8);
                    }

                    Cache['pn']++;

                    if (Cache['pn']==Cache.page_max) {
                        $('.product-list').append('<div class="p-item-wrap-nomore">抱歉。这里没有找到更多商品了~ </div>');
                    }

                } else {

                }

                Cache.flag_loading = false;
            } catch (ex){
                Cache.flag_loading = false;
            }

        });

    }

    $(window).on('scroll load', function(e){
        if( $(window).scrollTop() + $(window).height() + 200 > $('body')[0].scrollHeight && ( (Cache['pn']<Cache.page_max) || !Cache.page_max ) ){
            getTelecomareaProduct();
        }
    });

});