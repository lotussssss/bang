;
!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "同城帮黑五价到",
        "desc": "黑五价到, 全场满减优惠, 更有iphone手机半价租 ",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
        "imgUrl": 'https://p0.ssl.qhmsg.com/t018fdb6fa766b040e0.jpg',
        "success": tcb.noop, // 用户确认分享的回调
        "cancel": tcb.noop // 用户取消分享
    }

    if (typeof wx !== 'undefined') {
        wx.ready(function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage(wxData)
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline(wxData)
            //分享到QQ
            wx.onMenuShareQQ(wxData)
            //分享到QZone
            wx.onMenuShareQZone(wxData)
        })
    }

    $(function () {
        tcb.bindEvent(document.body,{
            // 黑五秒杀tab切换
            '.tab-list .tab-item':function (e) {
                e.preventDefault()

                var $me = $(this)

                $me.addClass('cur').siblings('.cur').removeClass('cur')
                $me.closest('.block-tab').find('.tab-cont a').eq($me.index()).show().siblings('a').hide()
            }
        })

        // 输出商品列表
        function renderProductList (price) {
            window.Bang.renderProductList({
                $tpl : $('#JsMProductListVer1720Tpl'),
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
        renderProductList (1000)
        renderProductList (1500)
        renderProductList (2001)
    })

} ()