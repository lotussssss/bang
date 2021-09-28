wx.ready(function () {
    var noop = function () {
    };
    var wxData = {};

    // 微信分享的数据
    wxData = {
        "title": '女王驾到，全场3.7折起！',
        "desc": '同城帮优品，女王精选专场，3.7折起！领取女王券最高再减200元！',
        "link": "http://bang.360.cn/youpin/erhuo",
        "imgUrl": 'https://p0.ssl.qhmsg.com/t01d74b280755f79838.jpg',
        "success": noop, // 用户确认分享的回调
        "cancel": noop // 用户取消分享
    };
    // 用户点开右上角popup菜单后，点击分享给好友，会执行下  面这个代码
    wx.onMenuShareAppMessage(wxData);
    // 点击分享到朋友圈，会执行下面这个代码
    wx.onMenuShareTimeline(wxData);
    //分享到QQ
    wx.onMenuShareQQ(wxData);
});


;(function () {

    //通用输出模板变量
    function getProduct(obj) {
        $.get(obj.request_url,function (res) {
            try {
                res = $.parseJSON(res);

                if (!res['errno']) {

                    var product_list =res['result']['product_list'] || res['result']['good_list'] || res['result']['flash_list'] || res['result'];
                    // 限制显示商品数量
                    product_list.splice(parseInt(obj.num, 10), 9999);

                    // 获取商品列表的html字符串
                    obj.com_price_tit = obj.com_price_tit || '新机价：';
                    obj.price_tit = obj.price_tit || '优品价';

                    var html_fn = $.tmpl($.trim(obj.$tpl.html())),
                        html_str = html_fn({
                            'list': product_list,
                            'is_flash': obj.is_flash,
                            'huodong_name': 'nvwangjie',
                            'com_price_tit':obj.com_price_tit,
                            'price_tit':obj.price_tit
                        });

                    $.each(product_list, function (item, i) {
                        tcb.preLoadImg(item['thum_img']);
                    });
                    // 输出数据  判断是追加还是替换
                    if (obj.is_append) {
                        obj.$target.append(html_str);
                    } else {
                        obj.$target.html(html_str);
                    }


                    setTimeout(function () {
                        tcb.lazyLoadImg({
                            'delay': 0,
                            'interval': 300 // 0:同时显示，其他时间表示实际时间间隔
                        }, obj.$target);
                    }, 300);
                    typeof obj['callback'] === 'function' && obj['callback'](obj.$target, product_list,obj.request_data)

                } else {

                }

            } catch (ex) {
            }

        });

    }
    //1000~1500元
    getProduct ({
        'request_url' : '/youpin/aj_get_goods?price=1000',
        '$tpl'        : $("#JsMProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 8,
        '$target'     : $ (".js-less1500-product-list")
    });
    //1500~2000元
    getProduct ({
        'request_url' : '/youpin/aj_get_goods?price=1500',
        '$tpl'        : $("#JsMProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 8,
        '$target'     : $ (".js-less2000-product-list")
    });
    //2000~3000元
    getProduct ({
        'request_url' : '/youpin/aj_get_goods?price=2000',
        '$tpl'        : $("#JsMProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 8,
        '$target'     : $ (".js-less3000-product-list")
    });
    //3000元以上
    getProduct ({
        'request_url' : '/youpin/aj_get_goods?price=3000',
        '$tpl'        : $("#JsMProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 8,
        '$target'     : $ (".js-more3000-product-list")
    });
    //分期免息
    getProduct ({
        'request_url' : '/youpin/doGetMianxiList',
        '$tpl'        : $("#JsMProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 8,
        '$target'     : $ (".js-mianxi-product-list")
    });

})()