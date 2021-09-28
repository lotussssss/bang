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
                    obj.com_price_tit = obj.com_price_tit || '新机价：';
                    obj.price_tit = obj.price_tit || '优品价';

                    var html_fn = $.tmpl ($.trim (obj.$tpl.html ())),
                        html_str = html_fn ({
                            'list'     : product_list,
                            'is_flash' : obj.is_flash,
                            'huodong_name' : 'liangpin_jobs',
                            'com_price_tit':obj.com_price_tit,
                            'price_tit':obj.price_tit
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
    //iPhone7系列
    getProduct ({
        'request_url' : '/youpin/aj_get_goods?pn=0&model_ids=678,660 ',
        '$tpl'        : $("#JsProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 5,
        '$target'     : $ (".js-iPhone7-product-list")
    });
    //iPhone6系列
    getProduct ({
        'request_url' : '/youpin/aj_get_goods?pn=0&model_ids=97,98,261,276',
        '$tpl'        : $("#JsProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 10,
        '$target'     : $ (".js-iPhone6-product-list")
    });
    //iPad系列
    getProduct ({
        'request_url' : '/youpin/aj_get_goods?keyword=pad',
        '$tpl'        : $("#JsProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 5,
        '$target'     : $ (".js-pad-product-list")
    });
    //经典小屏专区
    getProduct ({
        'request_url' : '/youpin/aj_get_goods?pn=0&model_ids=3,5,518',
        '$tpl'        : $("#JsProductListVer17Tpl"),
        'is_flash'    : false,
        'num'         : 5,
        '$target'     : $ (".js-iPhone5-product-list")
    });

});