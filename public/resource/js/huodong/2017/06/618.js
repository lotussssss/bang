$ (function () {
    tcb.bindEvent(document.body,{
        '.date-list .date-item':function (e) {
            e.preventDefault()

            var $me = $(this)
            $me.addClass('cur').siblings('.cur').removeClass('cur')
            $('.block-tab-cont').eq($me.index()).show().siblings('.block-tab-cont').hide()
        },
        '.block-product-list-crazy-sale .p-item-disabled':function (e) {
            e.preventDefault()
        }
    })

    model_list = window.__MODEL_LIST
    countDown ($('.block-product-list-crazy-sale .countdown'), model_list)
    //倒计时
    function countDown ($countdown) {

        $countdown.each(function(){
            var $me = $(this)

            var start_time= Date.now () + window.__TIME_PADDING,

                nextDayObj = new Date(start_time+24*60*60*1000),
                next_day_year = nextDayObj.getFullYear(),
                next_day_month = nextDayObj.getMonth()+1,
                next_day_day = nextDayObj.getDate(),
                end_time = new Date (next_day_year+'/'+next_day_month+'/'+next_day_day).getTime ()

            Bang.startCountdown (end_time, start_time, $me, {
                'end' : function () {}
            })
        })
    }

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

    //苹果专区
    window.Bang.renderProductList({
        $target : $ (".js-ios-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/doGetProductListByBrand?brand_id=2',
        request_params : {
            page_size : 10
        },
        list_params: window.__PARAMS,
        col : 5,
        complete: function(result, $target){}
    })

    //安卓专区
    window.Bang.renderProductList({
        $target : $ (".js-android-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/doGetAndroidList',
        request_params : {
            page_size : 10
        },
        list_params: window.__PARAMS,
        col : 5,
        complete: function(result, $target){}
    })

    //分期免息
    window.Bang.renderProductList({
        $target : $ (".js-mianxi-product-list"),
        $tpl : $('#JsProductListVer1720Tpl'),
        request_url : '/youpin/doGetMianxiList',
        request_params : {
            page_size : 10
        },
        list_params: window.__PARAMS,
        col : 5,
        complete: function(result, $target){}
    })

    // 视频
    window.Bang.playVideo($('.trigger-play-video'))

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
                var html_str = $.tmpl($.trim($('#Js618LotteryUserList').html()))({
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
})