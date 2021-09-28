$ (function () {
    //今日秒杀
    window.Bang.renderProductList({
        $target : $ (".js-flash-product-list"),
        $tpl : $('#JsFlashProductListVer1720Tpl'),
        request_url : '/youpin/doGetFlashSaleGoods',
        request_params : {
            page_size : 4
        },
        list_key: 'flash_list',
        list_params: window.__PARAMS,
        col : 4,
        complete: function(result, $target){}
    })

    tcb.bindEvent(document.body,{
        '.tab-list .tab-item':function (e) {
            e.preventDefault()

            var $me = $(this)
            $me.addClass('cur').siblings('.cur').removeClass('cur')
            $me.closest('.block-inner').find('.tab-cont .ui-sp-product-list-1').eq($me.index()).show().siblings('.tab-cont .ui-sp-product-list-1').hide()
        }
    })


    // 获取中奖用户的数据
    function getData4LotteryUserList(callback){
        var request_url = '/youpin/doGetLotteryTopList'
        $.get(request_url, function(res){
            var list_arr = []
            res = $.parseJSON(res)

            if (!res['errno']) {
                list_arr = res['result']
            }

            typeof callback==='function' && callback(list_arr)
        })
    }
    // 输出中奖用户的数据
    function renderLotteryUserList(){
        var $list_inner = $('.lottery-user-list-inner')
        if($list_inner && $list_inner.length){
            getData4LotteryUserList(function(list_arr){
                var html_str = $.tmpl($.trim($('#JsSummerVacationLotteryUserList').html()))({
                    'list': list_arr
                })
                $list_inner.html(html_str)

                var $list_lottery_item = $list_inner.find('.lottery-item'),
                    list_inner_row_height = $list_lottery_item.first().height()

                // 大于8条中奖信息才滚滚滚
                if($list_lottery_item.length>8){
                    (function(){
                        var arg = arguments
                        $list_inner.animate({'top': -list_inner_row_height}, 1200, function(){
                            $list_inner.find('.lottery-item').first().appendTo($list_inner)
                            $list_inner.css({'top': 0})

                            setTimeout(arg.callee, 2000)
                        })
                    }())
                }
            })

        }
    }

    renderLotteryUserList()

});