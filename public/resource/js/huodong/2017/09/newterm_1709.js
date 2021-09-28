$ (function () {
    // 分页
    function productPager (params, onPageChange) {
        params = params || {}

        var total = params.total || 0
        var page_size = params.page_size || 20
        var pn = params.pn || 0
        var $pages = params.$pages

        var page_num = Math.ceil (total / page_size)

        if (page_num == 1) {
            $pages.html ('')
            return
        }
        var pager = new tcb.Pager ($pages, page_num, pn)

        pager.on ('pageChange', onPageChange)
    }

    function loadProductList(params){
        var price = params.price
        var pn = params.pn || 0
        var page_size = params.page_size || 20
        var $target = params.$target
        var $pages = params.$pages

        window.Bang.renderProductList({
            $tpl : $('#JsProductListVer1720Tpl'),
            $target : $target,
            request_url : '/youpin/aj_get_goods',
            request_params : {
                pn : pn,
                price : price,
                page_size: page_size,
                not_brand:57
            },
            list_params: window.__PARAMS,
            col : 4,
            complete: function(result, $target){
                productPager({
                    pn : pn,
                    total : result['goods_count'],
                    page_size : page_size,
                    $pages : $pages
                }, function(e){
                    loadProductList({
                        pn: e.pn,
                        price: price,
                        $target : $target,
                        $pages : $pages
                    })

                    window.scrollTo(0, $target.offset().top-130);
                })
            }
        })

    }

    function init () {
        loadProductList({
            pn: 0,
            price: 1,
            $target : $('.block-product-list-0 .ui-sp-product-list-1'),
            $pages : $('.block-product-list-0 .pages')
        })
        loadProductList({
            pn: 0,
            price: 500,
            $target : $('.block-product-list-500 .ui-sp-product-list-1'),
            $pages : $('.block-product-list-500 .pages')
        })
        loadProductList({
            pn: 0,
            price: 1001,
            $target : $('.block-product-list-1000 .ui-sp-product-list-1'),
            $pages : $('.block-product-list-1000 .pages')
        })
        loadProductList({
            pn: 0,
            price: 2001,
            $target : $('.block-product-list-2000 .ui-sp-product-list-1'),
            $pages : $('.block-product-list-2000 .pages')
        })
    }

    init ()

})