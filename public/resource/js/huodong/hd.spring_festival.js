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
    //给爱人的新年新机
    getProduct ({
        'request_url' : '/youpin/doGetMoreThanJiuChengList',
        '$tpl'        : $ ("#JsProductList161111Tpl"),
        'is_flash'    : false,
        'num'         : 10,
        '$target'     : $ (".js-over95new-product-list")
    });
    //给老妈的iPad
    getProduct ({
        'request_url' : '/youpin/aj_get_goods?keyword=pad',
        '$tpl'        : $ ("#JsProductList161111Tpl"),
        'is_flash'    : false,
        'num'         : 10,
        '$target'     : $ (".js-pad-product-list")
    });
    //给孩子的新电脑
    getProduct ({
        'request_url' : '/youpin/doGetDellList',
        '$tpl'        : $ ("#JsProductList161111Tpl"),
        'is_flash'    : false,
        'num'         : 10,
        '$target'     : $ (".js-dell-product-list")
    });
    //美颜拍照手机
    getProduct ({
        'request_url' : '/youpin/doGetBeautyList',
        '$tpl'        : $ ("#JsProductList161111Tpl"),
        'is_flash'    : false,
        'num'         : 10,
        '$target'     : $ (".js-beauty-product-list")
    });
    //新品推荐
    getProduct ({
        'request_url' : '/youpin/aj_get_goods',
        '$tpl'        : $ ("#JsProductList161111Tpl"),
        'is_flash'    : false,
        'num'         : 10,
        '$target'     : $ (".js-recommend-product-list")
    });

});