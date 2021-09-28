;
!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        "title": "11.11狂欢大礼免费送",
        "desc": "全场畅享礼, 11.11狂欢大礼等您来拿！",
        "link": window.location.protocol + '//' + window.location.host + window.location.pathname ,
        "imgUrl": 'https://p3.ssl.qhmsg.com/t01ffc32a6e42094885.png',
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
            // 11.11必买清单 点击加载更多
            '.trigger-btn-get-more':function (e) {
                e.preventDefault()

                var me = $(this),
                    tr = me.closest('.block-buy-list').find('tr')

                tr.show()
                me.css({'background-color':'#ddd','cursor':'default','color':'#fff'})
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