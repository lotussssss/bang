;
(function () {
    var objSwipe = null,

        flag_get_promo_product_list = '_flag_get_promo_product_list',
        flag_no_more_promo_product_list = '_flag_no_more_promo_product_list',
        flag_page_num_promo_product_list = '_flag_page_num_promo_product_list',

        noop = function () {},
        wxData = {
            "title"   : '手机升级服务来了，支持iphone全系手机！',
            "desc"    : '安卓换苹果，iPhone16G升级64G，更有超值百元苹果手机等你拿！',
            "link"    : window.location.href,
            "imgUrl"  : 'https://p.ssl.qhimg.com/t019eb093fcb28a3f71.jpg',
            "success" : noop, // 用户确认分享的回调
            "cancel"  : noop // 用户取消分享
        }

    if (typeof wx !== 'undefined') {
        // 微信分享
        wx.ready (function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage (wxData);
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline (wxData);
            //分享到QQ
            wx.onMenuShareQQ (wxData);
        })
    }


    // DOM Ready
    $ ( function () {

        // 升级方式切换slide
        objSwipe = window.Bang.slide ( $ ( '.slide-shower-wrap' ), function () {

            var
                pos = objSwipe.getPos ()

            // 切换slide之后定位到相应位置的tab
            $ ( '.upgrade-type-tab .tab-item' ).filter ( function () {
                return !$ ( this ).hasClass ( 'cur' )
            } ).first ().addClass ( 'cur' ).siblings ( '.cur' ).removeClass ( 'cur' )

            // 方式1,lock加载列表
            if ( pos == 0 ) {
                doLock ( flag_get_promo_product_list )

                $ ( '#PromoProductList' ).hide ()
            }
            else {
                doFree ( flag_get_promo_product_list )

                $ ( '#PromoProductList' ).show ()
            }

        } )

        // 绑定事件
        tcb.bindEvent ( document.body, {

            // 升级方式切换tab
            '.upgrade-type-tab .tab-item' : function ( e ) {
                e.preventDefault ()

                var
                    $me = $ ( this )

                if ( $me.hasClass ( 'cur' ) ) {

                    return
                }

                var
                    type = parseInt ( $me.attr ( 'data-type' ), 10 ) || 0

                type = type > 1 ? 0 : type

                objSwipe.slide ( type )

            }
        } )


        var
            h_header = $ ( '#header' ).height (),
            h_top_nav = $ ( '.top-nav' ).height (),
            h_cover_img = $ ( '.img-cover' ).height (),
            h_upgrade_type_tab = $('.upgrade-type-tab' ).height ()

        // 向下滚动时加载更多商品
        $ ( window ).on ( 'scroll load', function ( e ) {

            var
                $win = $ ( window ),
                win_scroll_top = $win.scrollTop (),
                win_height = $win.height (),
                $body = $ ( 'body' )
                // 补偿值
                , fix_padding = 1
                // 加载更多的临界值[滚动条位置+窗口高度+补偿值]
                , loading_threshold = win_scroll_top + win_height + fix_padding

            // 滚动条位置大于封面图片的高度~固定tab和步骤条
            if (win_scroll_top>=h_cover_img){
                $('.upgrade-type-tab' ).css({
                    'position': 'fixed',
                    'top': h_header+h_top_nav-1
                })
                $('.upgrade-type-tab-placeholder' ).show()
                //$('.upgrade-step-by-step' ).css({
                //    'position': 'fixed',
                //    'top': h_header+h_top_nav+h_upgrade_type_tab
                //})
                //$('.upgrade-step-by-step-placeholder' ).show()
            } else {
                // 小于高度

                $('.upgrade-type-tab' ).css({
                    'position': 'static'
                })
                $('.upgrade-type-tab-placeholder' ).hide()
            }

            // 滚动条+补偿值大于页面高度 && 并且没有显示无更多商品
            if ( e.type == 'load'
                || (loading_threshold > $body[ 0 ].scrollHeight && !isNoMore ( flag_no_more_promo_product_list )) ) {


                var
                    pn = getPageNum ()
                // 获取推荐先购买,后回收商品列表
                getPromoProductList ( pn, function ( data ) {

                    setTimeout ( function () {

                        // 移除商品加载ing的html
                        removeProductLoadingHtml ()

                        data = data || {}

                        var
                            list = data[ 'list' ],
                            html_fn = $.tmpl ( $.trim ( $ ( '#JsPhoneUpdatePromoProductListTpl' ).html () ) ),
                            html_st = html_fn ( {
                                list : list
                            } )

                        var
                            $List = $ ( '#PromoProductList' )

                        $List.append ( html_st )

                        data[ 'pn' ]++

                        if ( data[ 'page_count' ] == data[ 'pn' ] ) {

                            // 没有更多商品了
                            setNoMore ( flag_no_more_promo_product_list )
                            addNoMoreHtml ( $List )
                        }
                        else {

                            addProductLoadingHtml ( $List )
                        }

                        setPageNum ( data[ 'pn' ] )

                        var
                            swipe_pos = objSwipe.getPos ()
                        if ( swipe_pos == 0 ) {

                            doLock ( flag_get_promo_product_list )
                        }

                    }, 100 )

                } )


            }

        } )

        tcb.bindEvent(document.body, {
            // 常见问题
            '.block-float-right-bottom .btn-show-qa': function(e){
                e.preventDefault()

                var
                    html_fn = $.tmpl( $.trim( $('#JsPhoneUpdateQATpl' ).html() ) ),
                    html_st = html_fn({})

                tcb.showDialog(html_st, {
                    className : 'phone-update-qa-dialog'
                })
            },
            // top
            '.block-float-right-bottom .btn-go-top': function(e){
                e.preventDefault()

                $.scrollTo({
                    endY: 0
                })
            }
        })

    } )

    // 获取推荐先购买,后回收商品列表
    function getPromoProductList ( pn, callback ) {
        pn = parseInt ( pn, 10 ) || 0

        if ( isLock ( flag_get_promo_product_list ) ) {
            return
        }

        var
            request_url = '/youpin/doGetExchangeList',
            params = {
                pn : pn
            }

        doLock ( flag_get_promo_product_list )
        $.ajax ( {
            type     : 'GET',
            url      : request_url,
            data     : params,
            dataType : 'json',
            timeout  : 5000,
            success  : function ( res ) {
                try {
                    res = typeof res == 'string' ? $.parseJSON ( res ) : res

                    if ( !res[ 'errno' ] ) {

                        typeof callback === 'function' && callback ( res[ 'result' ] )

                    }
                    else {
                        $.dialog.toast ( '抱歉，出错了。' + res[ 'errmsg' ] )
                    }
                } catch ( ex ) {
                    $.dialog.toast ( '返回异常，请重试~' )
                }

                doFree ( flag_get_promo_product_list )
            },
            error    : function () {
                $.dialog.toast ( '返回异常，请重试' )

                doFree ( flag_get_promo_product_list )
            }

        } )

    }

    // 获取当前页码
    function getPageNum () {

        return tcb.cache ( flag_page_num_promo_product_list ) || 0;
    }

    // 设置当前页码
    function setPageNum ( pn ) {
        pn = parseInt ( pn, 10 ) || 0

        return tcb.cache ( flag_page_num_promo_product_list, pn )
    }

    // 设置没有更多状态
    function setNoMore ( flag ) {
        flag = flag || 'default_no_more_flag'

        return doLock ( flag )
    }

    // 没有更多
    function isNoMore ( flag ) {
        flag = flag || 'default_no_more_flag'

        return isLock ( flag )
    }

    // 添加商品加载ing的html显示
    function addNoMoreHtml ( $target ) {
        var
            $NoMore = $ ( '#ProductNoMore' )

        if ( $NoMore && $NoMore.length ) {

            return
        }
        var
            loading_html = '<div id="ProductNoMore" style="margin: .10rem 0;float: left;width: 100%;text-align: center;color: #666;font-size: .12rem;">' +
                '<span class="product-no-more-txt">没有更多商品了~</span>' +
                '</div>'

        $target = $target || $ ( 'body' )

        $target.append ( loading_html )
    }


    // 锁定tag
    function doLock ( flag ) {
        flag = flag || 'default_lock_flag'

        var
            lock_list = tcb.cache ( 'LOCK_FLAG' )
        if ( !lock_list ) {

            lock_list = {}

            tcb.cache ( 'LOCK_FLAG', lock_list )
        }

        return lock_list[ flag ] = true
    }

    // 判断tag是否被锁定
    function isLock ( flag ) {
        flag = flag || 'default_lock_flag'

        var
            lock_list = tcb.cache ( 'LOCK_FLAG' )
        if ( !lock_list ) {

            lock_list = {}

            tcb.cache ( 'LOCK_FLAG', lock_list )
        }

        return !!lock_list[ flag ]
    }

    // 释放tag锁定状态
    function doFree ( flag ) {
        flag = flag || 'default_lock_flag'

        var
            lock_list = tcb.cache ( 'LOCK_FLAG' )
        if ( !lock_list ) {

            lock_list = {}

            tcb.cache ( 'LOCK_FLAG', lock_list )
        }

        return lock_list[ flag ] = false
    }

    // 添加商品加载ing的html显示
    function addProductLoadingHtml ( $target ) {
        var
            $Loading = $ ( '#ProductLoading' )

        if ( $Loading && $Loading.length ) {

            return
        }
        var
            img_html = '<img class="product-loading-img" src="https://p.ssl.qhimg.com/t01ba5f7e8ffb25ce89.gif">',
            loading_html = '<div class="product-loading" id="ProductLoading">' + img_html + '<span class="product-loading-txt">加载中...</span></div>'

        $target = $target || $ ( 'body' )

        $target.append ( loading_html )
    }

    // 移除商品加载ing的html
    function removeProductLoadingHtml () {
        var
            $Loading = $ ( '#ProductLoading' )

        if ( $Loading && $Loading.length ) {

            $Loading.remove ()
        }
    }

} ())