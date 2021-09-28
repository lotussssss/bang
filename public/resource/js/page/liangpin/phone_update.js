Dom.ready ( function () {
    // 商品缓存
    var CacheProduct = {
        "pn"      : 0, // 当前页码
        "max_pn"  : 0, // 最大页码
        "loading" : false // 是否正在加载商品
    };

    // 初始化获取商品列表
    getProductList();

    tcb.bindEvent(document.body, {

        // 商品交互
        '.buy-first-list .prd-item, .huishou-first-list .item': {
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.addClass('prd-item-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.removeClass('prd-item-hover');
            }
        }

    })

    /**
     * 根据当前参数获取商品列表
     */
    function getProductList () {
        var
            request_url = '/youpin/doGetExchangeList',
            params = {
                pn : CacheProduct[ 'pn' ]
            }

        setLoadingStatus ( true );

        var
            Product = CacheProduct[ 'pn_' + CacheProduct[ 'pn' ] ]

        if ( Product ) {

            renderProductListHtml ( Product[ 'product' ], W ( '#BuyFirstList' ), Product[ 'pn' ] );

            setMaxPageNum ( Product[ 'page_count' ] )
            setPageNum ( Product[ 'pn' ] + 1 )

            productPager ( Product[ 'pn' ], Product[ 'page_count' ] )

            setLoadingStatus ( false );
        }
        else {
            QW.Ajax.get ( request_url, params, function ( res ) {
                //try{
                res = JSON.parse ( res );

                if ( !res[ 'errno' ] ) {
                    var
                        result = res[ 'result' ]

                    var
                        pn = result[ 'pn' ]

                    var
                        product_datas = {
                            'good_list' : result[ 'list' ],
                            'col'       : 6
                        }
                    renderProductListHtml ( product_datas, W ( '#BuyFirstList' ), pn );

                    CacheProduct[ 'pn_' + CacheProduct[ 'pn' ] ] = {
                        'pn'         : pn,
                        'page_count' : result[ 'page_count' ],
                        'product'    : product_datas
                    };

                    setMaxPageNum ( result[ 'page_count' ] );
                    setPageNum ( pn + 1 );

                    productPager ( pn, result[ 'page_count' ] );
                }

                //} catch (ex){ }

                setLoadingStatus ( false );
            } );
        }
    }


    /**
     * 获取组装后的产品列表html
     * @param product_datas
     * @returns {string}
     */
    function getProductListHtml ( product_datas ) {
        var html = '';

        var tmpl_fn = W ( '#JsPhoneUpdateProductItemTpl' ).html ().trim ().tmpl ();

        html = tmpl_fn ( product_datas );

        return html;
    }

    /**
     * 输出商品列表的html
     * @param product_datas
     * @param $wrap
     * @param pn
     */
    function renderProductListHtml ( product_datas, $wrap, pn ) {
        if ( typeof pn === 'undefined' ) {
            if ( QW.ObjectH.isArrayLike ( $wrap ) ) {
                pn = 0;
            }
            else {
                pn = parseInt ( $wrap );
                pn = pn ? pn : 0;
                $wrap = null;
            }
        }

        var
            html_str = getProductListHtml ( product_datas );

        $wrap.html ( html_str );
    }


    /**
     * 判断是否正在加载商品列表
     * @returns {*}
     */
    function isLoading () {
        return CacheProduct[ 'loading' ];
    }

    /**
     * 设置加载状态
     * @param status
     */
    function setLoadingStatus ( status ) {
        CacheProduct[ 'loading' ] = status ? true : false;
    }

    /**
     * 获取总页码数
     * @returns {*}
     */
    function getMaxPageNum () {
        return CacheProduct[ 'max_pn' ];
    }

    /**
     * 设置最大的页码
     * @param product_total
     */
    function setMaxPageNum ( product_total, flag_pn ) {
        product_total = parseInt ( product_total, 10 ) || 0;
        if ( flag_pn ) {
            CacheProduct[ 'max_pn' ] = product_total;
        }
        else {
            CacheProduct[ 'max_pn' ] = product_total ? Math.ceil ( product_total / 12 ) : 0;
        }
    }

    /**
     * 获取当前页码
     * @returns {number}
     */
    function getPageNum () {
        return CacheProduct.pn || 0;
    }

    /**
     * 设置当前页码
     * @param num
     */
    function setPageNum ( num ) {
        CacheProduct.pn = num || 0;
    }

    /**
     * 重置当前页码为0
     */
    function resetPageNum () {
        setPageNum ( 0 );
    }

    /**
     * 商品列表分页
     * @return {[type]} [description]
     */
    function productPager ( pn, page_count ) {
        pn = pn || 0;
        page_count = page_count || 1

        var
            wPages = W ( '.pagination .pages' )
        if ( page_count == 1 ) {

            wPages.html ( '' )

        }
        else {
            var
                pager = new Pager ( wPages, page_count, pn )

            pager.on ( 'pageChange', function ( e ) {

                setPageNum ( e.pn )
                getProductList ()

                window.scrollTo ( 0, W ( '.buy-first-tit' ).getXY ()[ 1 ] )
            } )
        }
    }


} )