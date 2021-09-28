var wxData = {
    "title"   : '818 扒光节 烧到爽 扒到光',
    "desc"    : '818疯狂大促，超值大抢购！满减不断，优惠不断！有劵有优惠！减减减，减不停！天天爆品，不止5折！',
    "link"    : window.location.protocol + '//' + window.location.host + window.location.pathname,
    "imgUrl"  : 'https://p0.ssl.qhmsg.com/t01d26370bf58405d07.png',
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

$ (function () {
    var __Cache = {
        price       : 500,
        pn          : 0,
        page_size   : 8,
        productData : window.__PRODUCT_DATA || {}
    }

    function startCountdown () {
        var targettime = Date.parse ('2017-08-22'.replace (/-/g, '/')),
            curtime = window.__NOW || (new Date ()).getTime (),
            $target = $ ('.countdown')

        window.Bang.countdown_desc = ''
        window.Bang.startCountdown (targettime, curtime, $target, {})
    }

    function bindEvent () {

        var $win = tcb.getWin(),
            $tabList = $('.tab-list'),
            $tabListPlaceholder = $('.tab-list-placeholder'),
            scroll_top_critical = $tabList.offset().top

        tcb.bindEvent (document, {
            // 切换价格tab
            '.tab-item' : function (e) {
                e.preventDefault ()

                var $me = $ (this),
                    price = $me.attr ('data-price')

                __Cache.price = price
                __Cache.pn = 0

                $me.addClass ('cur')
                    .siblings ('.cur').removeClass ('cur')

                $ ('.btn-load-more').removeAttr('data-no-more').html ('加载更多')

                renderProductList ()

                $.scrollTo({
                    endY: scroll_top_critical
                })
            },
            // 加载更多
            '.btn-load-more': function(e){
                e.preventDefault()

                var $me = $(this)
                if ($me.attr('data-no-more')){
                    return
                }

                renderProductList (true)
            }
        })

        $win.on('scroll', function(e){
            var scroll_top = $win.scrollTop()

            if (scroll_top>scroll_top_critical){
                $tabListPlaceholder.show()
                $tabList.css({
                    'position' : 'fixed'
                })
            } else {
                $tabListPlaceholder.hide()
                $tabList.css({
                    'position' : 'static'
                })
            }
        })
    }

    // 输出商品列表
    function renderProductList (is_append) {
        var productList = __Cache.productData[ __Cache.price ],
            pn = __Cache.pn,
            pageSize = __Cache.page_size,
            count = productList && productList.length,
            renderList = productList.slice (pn * pageSize, (pn + 1) * pageSize)

        if (pn == (Math.ceil(count / pageSize) - 1)) {
            $ ('.btn-load-more').attr('data-no-more', '1').html ('没有更多了')
        }

        var html_fn = $.tmpl ($.trim ($ ('#JsM818ProductListTpl').html ())),
            html_st = html_fn ({
                col : 2,
                params : window.__PARAMS || {},
                productList : renderList
            })

        if (is_append){
            $ ('.block-3 .ui-sp-product-list-1').append(html_st)
        } else {
            $ ('.block-3 .ui-sp-product-list-1').html (html_st)
        }

        __Cache.pn++
    }

    function init () {
        startCountdown ()

        bindEvent ()

        renderProductList ()
    }

    init ()

})