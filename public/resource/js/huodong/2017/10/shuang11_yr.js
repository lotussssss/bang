$ (function () {

    if ($('.tab-list .tab-item.cur').index()==0){
        setTimeout(function () {
            typeof renderLotteryUserList == 'function' && renderLotteryUserList()
        }, 300)
    }
    tcb.bindEvent(document.body,{
        '.tab-list .tab-item':function (e) {
            e.preventDefault()

            var $me = $(this)
            if($me.hasClass('disabled')){
                return
            }

            $me.addClass('cur').siblings('.cur').removeClass('cur')
            $('.block-tab-cont .tab-cont-item').eq($me.index()).show().siblings('.tab-cont-item').hide()

            if ($me.index() == 0) {
                typeof renderLotteryUserList == 'function' && renderLotteryUserList()
            }
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
    var flag_renderLotteryUserList_exc = false
    function renderLotteryUserList(){
        if (flag_renderLotteryUserList_exc){
            return
        }
        var $list_inner = $('.lottery-user-list-inner')
        if($list_inner && $list_inner.length){
            getData4LotteryUserList(function(list_arr){
                var html_str = $.tmpl($.trim($('#JsShuang11LotteryUserList').html()))({
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

    // renderLotteryUserList()

    // 输出商品列表
    function renderProductList (price) {
        window.Bang.renderProductList({
            $tpl : $('#JsProductListVer1720Tpl'),
            $target : $('.block-price-'+price+' .ui-sp-product-list-1'),
            request_url : '/youpin/aj_get_goods',
            request_params : {
                pn : 0,
                price : price,
                page_size: 8,
                not_brand:57
            },
            list_params: window.__PARAMS,
            col : 4,
            complete: function(result, $target){}
        })
    }

    renderProductList (1)
    renderProductList (500)
    renderProductList (1001)
    renderProductList (2001)

});