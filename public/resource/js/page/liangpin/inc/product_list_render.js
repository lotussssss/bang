;
!function () {
    window.Bang = window.Bang || {}

    function renderProductList (options) {
        var
            defaults = {
                // 输出目标位置
                $target        : '',
                // 输出模板
                $tpl           : '',
                // 商品请求地址
                request_url    : '',
                // 请求的参数，页码和也没数量是基本参数，还可以包括任何其他参数
                request_params : {
                    // 页码
                    pn        : 0,
                    // 每页数量
                    page_size : 20
                },
                // 开启图片懒加载
                lazy_load      : true,
                // 显示列数
                col            : 5,
                // 指定的商品列表的key（用于处理不同接口返回的列表数据的key不一样的情况）
                list_key       : '',
                // 失败回调函数
                fail           : tcb.noop,
                // 输出完成执行
                complete       : tcb.noop
            }

        options = tcb.mix (defaults, options, true)

        var
            $target = W (options.$target),
            $tpl = W (options.$tpl)

        if ( !($target && $target.length && $tpl && $tpl.length)){
            return tcb.warn('$target：'+options.$target+'，或者$tpl：'+options.$tpl+'，不存在，无法正确执行')
        }

        options.col = parseInt(options.col, 10) || 5

        options.request_params = options.request_params || {}
        options.request_params[ 'pn' ] = parseInt (options.request_params[ 'pn' ], 10) || 0
        options.request_params[ 'page_size' ] = parseInt (options.request_params[ 'page_size' ], 10) || 20

        // 获取商品数据
        getProductData (options.request_url, options.request_params, function (result) {
            var
                product_list = null

            if (options.list_key) {
                // 根据指定的key在商品中获取商品列表

                product_list = result[options.list_key]
            }
            product_list = product_list ? product_list : result[ 'product_list' ] || result[ 'good_list' ]

            // 如果返回的数据超过限定的每页数量，那么干掉多余的
            product_list.splice (options.request_params[ 'page_size' ], 9999)

            var
                product_list_html = getProductHtml ($tpl, {
                    good_list : product_list,
                    col       : options.col
                })

            renderProductListHtml ($target, product_list_html, options.lazy_load)

            // 输出完成
            typeof options.complete === 'function' && options.complete (result, $target)

        }, options.fail)
    }

    // 获取商品列表的html字符串
    function getProductHtml ($tpl, data) {
        data = data || {}
        // 商品列表
        data[ 'good_list' ] = data[ 'good_list' ] || []
        // 商品列
        data[ 'col' ] = data[ 'col' ] || 5

        tcb.each (data[ 'good_list' ], function (i, item) {
            // 如果返回的商品图片是字符串格式，那么做个特殊处理
            if (typeof item[ 'thum_img' ] === 'string') {

                var thum_img = tcb.imgThumbUrl2 (item[ 'thum_img' ], 300, 300, 'edr')
                item[ 'thum_img' ] = {
                    'big' : thum_img,
                    'mid' : thum_img,
                    'min' : thum_img,
                    'old' : thum_img
                }
                tcb.preLoadImg (thum_img)
            }
        })

        var html_fn = $tpl.html ().trim ().tmpl ()

        return html_fn (data)
    }

    // 输出商品列表的html
    function renderProductListHtml ($target, html_str, lazy_load) {
        $target.html (html_str);

        if (lazy_load) {
            setTimeout (function () {
                tcb.lazyLoadImg (0, $target)
            }, 300)
        }
    }

    // 获取热销机型列表
    function getProductData (url, params, success, fail) {
        if (!url) {
            return console.error ('这里有个商品列表异步请求没有传入url')
        }

        // 请求商品数据
        QW.Ajax.get (url, params, function (res) {
            res = JSON.parse (res)

            if (!res[ 'errno' ]) {

                typeof success === 'function' && success (res[ 'result' ])

            } else {
                typeof fail === 'function' && fail (res)
            }
        })

    }

    //====================== Export ========================
    window.Bang.renderProductList = renderProductList

} ()