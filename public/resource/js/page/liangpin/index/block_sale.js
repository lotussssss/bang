// 甩货专区
$(function () {
    var __Cache = {
        productList : null,
        price       : 500,
        pn          : 0,
        page_size   : 10
    }

    function bindEvent () {
        tcb.bindEvent (document, {
            // 切换价格tab
            '.block-sale .tab-list .tab-item' : function (e) {
                e.preventDefault ()

                var $me = $ (this),
                    price = $me.attr ('data-price')

                __Cache.price = price
                __Cache.pn = 0

                $me.addClass ('cur').siblings ('.cur').removeClass ('cur')

                renderProductList ()
            }
        })
    }

    // 获取商品列表
    function getProductList(callback) {
        if (__Cache.productList){
            typeof callback==='function' && callback(__Cache.productList)
        } else {
            $.get('/youpin/getActivityProductList', function (res) {
                res = $.parseJSON(res)

                if(!res['errno']){
                    __Cache.productList = res.result

                    typeof callback==='function' && callback(__Cache.productList)
                }
            })
        }
    }

    // 输出商品列表
    function renderProductList () {
        getProductList(function (productList) {
            productList = productList[__Cache.price]
            var pn = __Cache.pn,
                pageSize = __Cache.page_size,
                count = productList && productList.length,
                renderList = productList.slice (pn * pageSize, (pn + 1) * pageSize)

            var html_fn = $.tmpl ($.trim ($ ('#JsSaleProductListTpl').html ())),
                html_st = html_fn ({
                    col : 5,
                    params : {
                        from_page:'0-1000'
                    },
                    productList : renderList
                })

            $ ('.block-sale .js-sale-product-list').html (html_st)

            productPager (count, pn, pageSize)
        })
    }

    // 分页
    function productPager (total, pn, page_size) {
        page_size = page_size || 8
        pn = pn || 0

        var page_num = Math.ceil (total / page_size)

        var wPages =  W('.pagination .pages2')
        if (page_num == 1) {
            wPages.html ('')
            return
        }
        var pager = new Pager (wPages, page_num, pn)
        pager.on ('pageChange', function (e) {

            __Cache.pn = e.pn

            renderProductList ()

            window.scrollTo(0, $('.block-sale .tab-list').offset()['top']-10)
        })
    }

    function init () {
        bindEvent ()

        renderProductList ()
    }

    if ($ ('.block-sale .js-sale-product-list').length){
        init ()
    }
})