var wxData = {
    "title"   : '双节福利,iphone 7/7p 15天免费用',
    "desc"    : '国庆&中秋双节福利,iphone 7/7p 15天免费用,全场优品3折起先到先得！！',
    "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname,
    "imgUrl"  : 'https://p2.ssl.qhmsg.com/t01b5b0edb8bb02fcc4.jpg',
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
    tcb.bindEvent (document, {
        // 切换价格tab
        '.block-price-range .tab-item' : function (e) {
            e.preventDefault ()

            var $me = $ (this),
                price = $me.attr ('data-price'),
                $closest = $me.closest('.block-price-range')

            $me.addClass('cur').siblings('.cur').removeClass ('cur')

            var $url = $closest.find('.more'),
                url = $url.attr('href')

            url = tcb.setUrl(url, {
                price:price
            })
            $url.attr('href',url)

            var $target = $closest.find('.ui-sp-product-list-1')

            renderProductList (price,$target)
        },
        // 回到顶部
        '.btn-go-top': function(e){
            e.preventDefault()

            window.scrollTo(0, 0);

        }
    })

    // 输出商品列表
    function renderProductList (price,$target) {
        window.Bang.renderProductList({
            $tpl : $('#JsMProductListVer1720Tpl'),
            $target : $target,
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

    function init () {
        $('.block-price-range .tab-item').eq(0).trigger("click")
        $('.block-price-range .tab-item').eq(2).trigger("click")
    }

    init ()
})