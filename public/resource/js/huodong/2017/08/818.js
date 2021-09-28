$ (function () {
    var __Cache = {
        price       : 500,
        pn          : 0,
        page_size   : 12,
        productData : window.__PRODUCT_DATA || {}
    }

    function startCountdown () {
        var targettime = Date.parse ('2017-08-22'.replace (/-/g, '/')),
            curtime = window.__NOW || (new Date ()).getTime (),
            $target = $ ('.countdown')

        window.Bang.startCountdown (targettime, curtime, $target, {})
    }

    function bindEvent () {
        tcb.bindEvent (document, {
            // 切换价格tab
            '.tab-price-range a' : function (e) {
                e.preventDefault ()

                var $me = $ (this),
                    price = $me.attr ('data-price')

                __Cache.price = price
                __Cache.pn = 0

                $me.addClass ('selected')
                    .closest ('.col-12-4').siblings ('.col-12-4')
                    .find ('.selected').removeClass ('selected')

                renderProductList ()
            }
        })
    }

    // 输出商品列表
    function renderProductList () {
        var productList = __Cache.productData[ __Cache.price ],
            pn = __Cache.pn,
            pageSize = __Cache.page_size,
            count = productList && productList.length,
            renderList = productList.slice (pn * pageSize, (pn + 1) * pageSize)

        var html_fn = $.tmpl ($.trim ($ ('#Js818ProductListTpl').html ())),
            html_st = html_fn ({
                col : 4,
                params : window.__PARAMS || {},
                productList : renderList
            })

        $ ('.block-3 .ui-sp-product-list-1').html (html_st)

        productPager (count, pn, pageSize)
    }

    // 分页
    function productPager (total, pn, page_size) {
        page_size = page_size || 12
        pn = pn || 0

        var page_num = Math.ceil (total / page_size)

        var wPages = $ ('.pagination .pages')
        if (page_num == 1) {
            wPages.html ('')
            return
        }
        var pager = new tcb.Pager (wPages, page_num, pn)
        pager.on ('pageChange', function (e) {

            __Cache.pn = e.pn

            renderProductList ()

            window.scrollTo(0, $('.tab-price-range').offset()['top']-10)
        })
    }

    function init () {
        startCountdown ()

        bindEvent ()

        renderProductList ()
    }

    init ()

})