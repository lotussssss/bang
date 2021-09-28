var wxData = {
    "title"   : '开学不吃土，五折买手机！',
    "desc"    : '开学季超值大抢购！买买买买不停，开学不吃土！满减不断，优惠不断！天天爆品，不止5折！',
    "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname,
    "imgUrl"  : 'https://p0.ssl.qhmsg.com/t0125ad166752cfcef2.jpg',
    "success" : tcb.noop, // 用户确认分享的回调
    "cancel"  : tcb.noop // 用户取消分享
}

if (typeof wx !== 'undefined'){
    // 微信分享
    wx.ready ( function () {

        // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
        wx.onMenuShareAppMessage ( wxData )
        // 点击分享到朋友圈，会执行下面这个代码
        wx.onMenuShareTimeline ( wxData )
        //分享到QQ
        wx.onMenuShareQQ ( wxData )
    })
}

$(function(){
    var $list0_500 = $('.block-product-list-1 .ui-sp-product-list-1'),
        $list500_1000 = $('.block-product-list-500 .ui-sp-product-list-1'),
        $list1000_2000 = $('.block-product-list-1001 .ui-sp-product-list-1'),
        $list2000_ = $('.block-product-list-2001 .ui-sp-product-list-1'),

        $listSet = [$list0_500, $list500_1000, $list1000_2000, $list2000_]

    // 绑定事件
    tcb.bindEvent(document.body, {
        // 加载更多
        '.btn-load-more' : function (e) {
            e.preventDefault ()

            var $me = $ (this),
                pos = parseInt ($me.attr ('data-pos'), 10) || 0,
                pn = $me.attr ('data-pn'),
                price = $me.attr ('data-price')

            if ($me.hasClass('btn-no-more')){
                return
            }

            loadProductList ({
                pn        : pn,
                price     : price,
                $target   : $listSet[ pos ],
                is_append : true
            })
        },
        '.btn-go-top': function(e){
            e.preventDefault()

            window.scrollTo(0, 0);

        }
    })

    function loadProductList(params){
        var price = params.price
        var pn = params.pn || 0
        var page_size = params.page_size || 20
        var $target = params.$target
        var is_append = params.is_append

        window.Bang.renderProductList ({
            $tpl           : $ ('#JsMProductListVer1720Tpl'),
            $target        : $target,
            request_url    : '/youpin/aj_get_goods',
            request_params : {
                pn        : pn,
                price     : price,
                page_size : page_size,
                not_brand:57
            },
            list_params: window.__PARAMS,
            col            : 2,
            is_append      : is_append,
            complete       : function (result, $target) {
                if (!(result && result.good_list && result.good_list.length)) {
                    return $target.siblings ('.btn-load-more').addClass('btn-no-more').html('没有更多了')
                }
                $target.siblings ('.btn-load-more').attr ('data-pn', pn - 0 + 1)
            }
        })
    }

    loadProductList({
        pn: 0,
        price: 1,
        $target : $list0_500
    })
    loadProductList({
        pn: 0,
        price: 500,
        $target : $list500_1000
    })
    loadProductList({
        pn: 0,
        price: 1001,
        $target : $list1000_2000
    })
    loadProductList({
        pn: 0,
        price: 2001,
        $target : $list2000_
    })
})