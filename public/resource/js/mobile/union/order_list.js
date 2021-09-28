// 订单列表
!function () {
    if (window.__PAGE != 'order-list') {
        return
    }

    $ (function () {
        var $win = tcb.getWin (),
            $body = $ ('body'),
            $FormSearchOrder = $ ('#FormSearchOrder'),
            $OrderList = $ ('.block-order-list'),
            __Cache = tcb.cache (window.__PAGE, {
                page    : 1,
                orderid : '',
                mobile  : '',
                type    : 1,

                maxPage       : 0,
                is_loading    : false,
                is_end        : false,
                is_force_load : true
            })

        function init () {
            bindEvent ()
        }

        function bindEvent () {
            $win.on ('scroll load', tcb.runDelay (function (e) {
                var cacheData = tcb.cache (window.__PAGE)

                var // 补偿值
                    fix_padding = 120,
                    // 加载更多的临界值[滚动条位置+窗口高度+补偿值]
                    loading_threshold = $win.scrollTop () + $win.height () + fix_padding

                if (loading_threshold < $body[ 0 ].scrollHeight && !cacheData[ 'is_force_load' ]) {
                    return
                }

                cacheData[ 'is_force_load' ] = false

                if (cacheData[ 'is_loading' ] || cacheData[ 'is_end' ]) {
                    return
                }
                cacheData[ 'is_loading' ] = true
                addProductLoadingHtml ($OrderList)
                getOrderList ({
                    page    : cacheData[ 'page' ],
                    orderid : cacheData[ 'orderid' ],
                    mobile  : cacheData[ 'mobile' ],
                    type    : cacheData[ 'type' ]
                }, function (ajaxData) {
                    cacheData[ 'is_loading' ] = false

                    if (!__Cache[ 'maxPage' ]) {
                        __Cache[ 'maxPage' ] = Math.ceil (ajaxData[ 'total' ] / ajaxData[ 'per_page' ])
                    }
                    __Cache[ 'page' ] = cacheData[ 'page' ] + 1

                    if (__Cache[ 'page' ] > __Cache[ 'maxPage' ] || !__Cache[ 'maxPage' ]) {
                        __Cache[ 'is_end' ] = true
                        addProductNoMoreHtml ($OrderList)
                    }

                    removeProductLoadingHtml ($OrderList)
                })

            }, 150, 300))

            $FormSearchOrder.on ('submit', function (e) {
                e.preventDefault ()

                var $input = $FormSearchOrder.find ('[name="keyword"]'),
                    keyword = tcb.trim ($input.val ())
                //if ($input && !tcb.trim($input.val())){
                //    return $input.shine4Error()
                //}

                // 重置数据
                __restCacheData ()

                if (tcb.validMobile (keyword)) {
                    __Cache[ 'orderid' ] = ''
                    __Cache[ 'mobile' ] = keyword
                } else {
                    __Cache[ 'orderid' ] = keyword
                    __Cache[ 'mobile' ] = ''
                }

                $win.trigger ('load')
            })

            var $Input = $FormSearchOrder.find('input'),
                $X = $FormSearchOrder.find('.icon-circle-solid-error')
            $Input.on('change input', function(e){
                var $me = $(this),
                    val = $me.val()

                if (val){
                    $X.show()
                } else {
                    $X.hide()
                }
            })
            $X.on('click', function(e){
                e.preventDefault()

                $Input.val('')
                $X.hide()

                var cacheData = tcb.cache (window.__PAGE)

                if (cacheData[ 'orderid' ] || cacheData[ 'mobile' ]) {
                    // 重置数据
                    __restCacheData ()

                    __Cache[ 'orderid' ] = ''
                    __Cache[ 'mobile' ] = ''

                    $win.trigger ('load')
                }
            })

            tcb.bindEvent ({
                '.row-fragment-tab .tab-item' : function (e) {
                    e.preventDefault ()

                    var $me = $ (this)
                    if ($me.hasClass ('selected') || __Cache[ 'is_loading' ]) {
                        return
                    }

                    $me.addClass ('selected').siblings ('.selected').removeClass ('selected')

                    // 重置数据
                    __restCacheData ()

                    __Cache[ 'type' ] = $me.attr ('data-type')

                    if (__Cache[ 'type' ]=='1'){
                        $('.block-search .col-12-8').css({
                            'width': '100%'
                        })
                        $('.block-search .col-12-4').css({
                            'display': 'none'
                        })
                    } else {
                        $('.block-search .col-12-8').css({
                            'width': '66.6666666666666666%'
                        })
                        $('.block-search .col-12-4').css({
                            'display': 'block'
                        })
                    }

                    $win.trigger ('load')
                },

                '.btn-trigger-confirm, .btn-trigger-offline-replacement-order': function(e){
                    e.preventDefault ()

                    var $me = $(this)

                    var html_fn = $.tmpl (tcb.trim ($ ('#JsMUnionOrderConfirmShipTpl').html ())),
                        html_st = html_fn ({
                            order_id : $me.attr('data-order-id') || ''
                        })

                    var dialogInst = tcb.showDialog(html_st, {
                        className : 'dialog-order-confirm-ship',
                        middle : true
                    })

                    bindFormConfirmShipSubmit(dialogInst['wrap'].find('form'))
                }
            })
        }

        function getOrderList (params, callback) {
            params = params || {}
            $.ajax ({
                type     : 'GET',
                url      : '/union/getOrderList',
                data     : params,
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {

                    if (res[ 'errno' ]) {
                        return $.dialog.toast (res[ 'errmsg' ], 2000)
                    }

                    var result = res.result,
                        renderData = {
                            type : params['type']||'1',
                            OrderList       : result.data,
                            OrderStatusDesc : result.order_status_desc
                        }
                    renderOrderList (renderData, $OrderList, params.page > 1 ? true : false)

                    $.isFunction (callback) && callback (result)
                },
                error    : function () {
                    $.dialog.toast ('系统错误，请刷新页面重试', 2000)
                }
            })
        }

        function renderOrderList (renderData, $target, is_append) {
            if (!($target && $target.length)) {
                return tcb.error ('$target不能为空')
            }
            var html_fn = $.tmpl (tcb.trim ($ ('#JsMUnionOrderListItemTpl').html ())),
                html_st = html_fn (renderData)

            if (is_append) {
                return $target.append (html_st)
            }
            return $target.html (html_st)
        }

        // 添加商品加载ing的html显示
        function addProductLoadingHtml ($target, is_prev) {
            $target = $target || $ ('body')
            var direction_class = is_prev ? 'list-loading-prev' : 'list-loading-next'

            var $Loading = $target.find ('.' + direction_class)
            if ($Loading && $Loading.length) {
                return $Loading
            }
            var
                img_html = '<img class="list-loading-img" src="https://p.ssl.qhimg.com/t01ba5f7e8ffb25ce89.gif">', loading_html = '<div class="list-loading ' + direction_class + '">' + img_html + '<span class="list-loading-txt">加载中...</span></div>'

            return is_prev ? $ (loading_html).prependTo ($target) : $ (loading_html).appendTo ($target)
        }

        // 移除商品加载ing的html
        function removeProductLoadingHtml ($target, is_prev) {
            $target = $target || $ ('body')
            var direction_class = is_prev ? 'list-loading-prev' : 'list-loading-next'

            var $Loading = $target.find ('.' + direction_class)
            if ($Loading && $Loading.length) {
                $Loading.remove ()
            }
        }

        // 添加商品 没有更多 的html显示
        function addProductNoMoreHtml ($target) {
            $target = $target || $ ('body')

            var $NoMore = $target.find ('.row-product-no-more')

            if ($NoMore && $NoMore.length) {
                return
            }
            var no_more_html = '<div style="padding: .12rem 0;color: #999;text-align: center;">抱歉。这里没有找到更多商品了~ </div>'

            $target.append (no_more_html)
        }

        function __restCacheData () {
            __Cache[ 'page' ] = 1
            __Cache[ 'maxPage' ] = 0
            __Cache[ 'is_loading' ] = false
            __Cache[ 'is_end' ] = false
            __Cache[ 'is_force_load' ] = true
        }

        function bindFormConfirmShipSubmit($Form){
            if (!($Form && $Form.length)) {
                return tcb.error ('$Form不能少')
            }

            $Form.on ('submit', function (e) {
                e.preventDefault ()

                var $me = $ (this)
                if (!validFormConfirmShip ($me)) {
                    return
                }

                $.ajax ({
                    type     : $me.attr ('method'),
                    url      : $me.attr ('action'),
                    data     : $me.serialize (),
                    dataType : 'json',
                    timeout  : 5000,
                    success  : function (res) {
                        if (res[ 'errno' ]) {
                            return $.dialog.toast (res[ 'errmsg' ], 2000)
                        }

                        window.location.href = window.location.href
                    },
                    error    : function (err) {
                        $.dialog.toast (err, 2000)
                    }
                })
            })
        }

        function validFormConfirmShip ($Form) {
            var flag = true,
                $focus = null

            var $imei = $Form.find ('[name="imei"]'),
                $customphone = $Form.find ('[name="customphone"]'),
                $price = $Form.find ('[name="price"]')

            if (!tcb.trim ($imei.val ())) {
                flag = false
                $focus = $focus || $imei
                $imei.shine4Error ()
            }
            if (!tcb.validMobile (tcb.trim ($customphone.val ()))) {
                flag = false
                $focus = $focus || $customphone
                $customphone.shine4Error ()
            }
            if ($price && $price.length && !tcb.trim ($price.val ())) {
                flag = false
                $focus = $focus || $price
                $price.shine4Error ()
            }

            if ($focus && $focus.length) {
                setTimeout (function () {
                    $focus.focus ()
                }, 300)
            }

            return flag
        }

        init ()
    })
} ()