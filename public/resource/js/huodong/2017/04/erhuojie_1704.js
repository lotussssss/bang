$ (function () {
    //苹果专区
    window.Bang.renderProductList({
        $target : $ (".js-ios-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/doGetProductListByBrand?brand_id=2',
        request_params : {
            page_size : 8
        },
        col : 4,
        complete: function(result, $target){}
    })

    //安卓专区
    window.Bang.renderProductList({
        $target : $ (".js-android-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/doGetAndroidList',
        request_params : {
            page_size : 8
        },
        col : 4,
        complete: function(result, $target){}
    })

    //分期免息
    window.Bang.renderProductList({
        $target : $ (".js-mianxi-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/doGetMianxiList',
        request_params : {
            page_size : 8
        },
        col : 4,
        complete: function(result, $target){}
    })

    // 获取中奖用户的数据
    function getData4LotteryUserList(callback){
        var request_url = '/youpin/doGetLotteryTopList';
        $.get(request_url, function(res){
            var list_arr = [];
            res = $.parseJSON(res);

            if (!res['errno']) {
                list_arr = res['result'];
            }

            typeof callback==='function' && callback(list_arr);
        });
    }
    // 输出中奖用户的数据
    function renderLotteryUserList(){
        var $list_inner = $('.lottery-user-list-inner');
        if($list_inner && $list_inner.length){
            getData4LotteryUserList(function(list_arr){
                var html_str = $.tmpl($.trim($('#JsLotteryUserList').html()))({
                    'list': list_arr
                });
                $list_inner.html(html_str);

                var $list_lottery_item = $list_inner.find('.lottery-item'),
                    list_inner_row_height = $list_lottery_item.first().height();

                // 大于3条中奖信息才滚滚滚
                if($list_lottery_item.length>3){
                    (function(){
                        var arg = arguments;
                        $list_inner.animate({'top': -list_inner_row_height}, 1200, function(){
                            $list_inner.find('.lottery-item').first().appendTo($list_inner);
                            $list_inner.css({'top': 0});

                            setTimeout(arg.callee, 2000);
                        });
                    }());
                }
            });

        }
    }

    renderLotteryUserList();

});