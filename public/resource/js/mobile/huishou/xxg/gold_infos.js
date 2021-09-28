// 修修哥订单列表
!function () {
    if (window.__PAGE !== 'xxg-gold-infos') {
        return
    }

    $(function () {
        // 订单列表相关信息
        var __PageCache = {
            pn: 1,
            is_loading: false,
            is_end: false,
            load_padding: 50,
            cur_date: '' // 存放某一笔订单的下单时间
        }

        // 设置订单状态切换tab的滚动
        function setTabScroll() {
            //tab滑动
            var inst = new Scroll(function (left, top, zoom) {
                        // 此函数在滚动过程中实时执行，需要注意处理效率

                        __defaultAnimate(left, top, zoom, $BlockTabListInner, tcb.setTranslateAndZoom)
                    }, {
                        scrollingY: false,
                        bouncing: false,
                        snapping: false
                    }),
                    $BlockTabList = $('.block-tab-list'),
                    $BlockTabListInner = $BlockTabList.find('.tab-list-inner'),
                    $SelectedItem = $BlockTabList.find('.item-cur'),
                    $Doc = tcb.getDoc(),
                    // 用来标识在Container中的滑动
                    flag = false

            inst.setDimensions($BlockTabList.width(), $BlockTabList.height(), $BlockTabListInner.width(), $BlockTabListInner.height())
            if ($SelectedItem.offset()) {
                inst.scrollTo($SelectedItem.offset().left - $BlockTabListInner.offset().left, 0, true)
            }

            // 绑定滚动事件
            $BlockTabList.on('touchstart', function (e) {
                // flag设置为true表示滑动开始
                flag = true
                // 滑动开始
                inst.doTouchStart(e.touches, e.timeStamp)
            })

            $Doc.on('touchmove', function (e) {
                if (flag) {
                    e.preventDefault()
                    // 滑动ing
                    inst.doTouchMove(e.touches, e.timeStamp)
                }
            }, {passive: false})

            $Doc.on('touchend', function (e) {
                // 滑动ing
                inst.doTouchEnd(e.timeStamp)
                // flag重置为false，表示滑动结束
                flag = false
            })
        }

        // 默认滚动函数
        function __defaultAnimate(left, top, zoom, $el, setTranslateAndZoom) {
            setTranslateAndZoom($el[0], left, top, zoom)
        }

        //获取及输出订单列表
        function getGoldOrderList(options) {
            options = options || {}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                    params = {
                        page: pn
                    }
            // 加载中
            __PageCache.is_loading = true
            $.get('/m/getGoldOrders', params, function (res) {
                res = $.parseJSON(res)
                if (!res['errno']) {
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()
                    var result = res['result'];
                    var order_list = result['data'],
                            $List
                    if (order_list && order_list.length) {
                        var html_fn = $.tmpl($.trim($('#JsGoldOrderListTpl').html())),
                                html_str = html_fn({
                                    'list': order_list
                                })
                        var $html_str = $(html_str)
                        $List = $('.block-gold-content')
                        $html_str.appendTo($List)
                        // 添加加载ing的html显示
                        uiAddLoadingHtml($List)
                        __PageCache.pn = pn
                    }
                    if (result['current_page'] >= result['last_page']) {
                        __PageCache.is_end = true
                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()
                        $List = $List || $('.block-gold-content')
                        uiAddNoMoreHtml($List)
                    }
                }
                // 加载完成
                __PageCache.is_loading = false
            })
        }

        //获取及输出订单列表
        function getGoldAssessList(options) {
            options = options || {}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                    params = {
                        page: pn
                    }
            // 加载中
            __PageCache.is_loading = true
            $.get('/m/getGoldAssesses', params, function (res) {
                res = $.parseJSON(res)
                if (!res['errno']) {
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()
                    var result = res['result'];
                    var order_list = result['data'],
                            $List
                    if (order_list && order_list.length) {
                        var html_fn = $.tmpl($.trim($('#JsGoldAssessListTpl').html())),
                                html_str = html_fn({
                                    'list': order_list
                                })
                        var $html_str = $(html_str)
                        $List = $('.block-gold-content')
                        $html_str.appendTo($List)
                        // 添加加载ing的html显示
                        uiAddLoadingHtml($List)
                        __PageCache.pn = pn
                    }
                    if (result['current_page'] >= result['last_page']) {
                        __PageCache.is_end = true
                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()
                        $List = $List || $('.block-gold-content')
                        uiAddNoMoreHtml($List)
                    }
                }
                // 加载完成
                __PageCache.is_loading = false
            })
        }

        //获取及输出订单列表
        function getGoldAddress(options) {
            __PageCache.is_loading = true
            $.get('/m/getGoldAddress', {}, function (res) {
                res = $.parseJSON(res)
                if (!res['errno']) {
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()
                    var address = res['result'],
                            $List
                    var html_fn = $.tmpl($.trim($('#JsGoldAddressManagerTpl').html())),
                            html_str = html_fn({
                                'address': address
                            })
                    var $html_str = $(html_str)
                    $List = $('.block-gold-content')
                    $html_str.appendTo($List)
                    initAddressSelect()
                    // 添加加载ing的html显示
                    uiAddLoadingHtml($List)
                    __PageCache.is_end = true
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()
                }
                // 加载完成
                __PageCache.is_loading = false
            })

        }

        // 添加没有更多商品的html显示
        function uiAddNoMoreHtml($target) {
            var html_st = '<div class="ui-no-more" id="UINoMore">已经没有更多内容~</div>'
            $target = $target || $('body')
            $target.append(html_st)
        }

        // 添加加载ing的html显示
        function uiAddLoadingHtml($target) {
            var $Loading = $('#UILoading')
            if ($Loading && $Loading.length) {
                return
            }
            var img_html = '<img class="ui-loading-img" src="https://p.ssl.qhimg.com/t01ba5f7e8ffb25ce89.gif">',
                    loading_html = '<div class="ui-loading" id="UILoading">' + img_html + '<span class="ui-loading-txt">加载中...</span></div>'
            $target = $target || $('body')
            $target.append(loading_html)
        }

        // 移除加载ing的html
        function uiRemoveLoadingHtml() {
            var $Loading = $('#UILoading')
            if ($Loading && $Loading.length) {
                $Loading.remove()
            }
        }

        // 绑定事件
        function bindEvent() {
            tcb.bindEvent(document.body, {
                // 还款
                '.js-trigger-xxg-repayment': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var url = $me.attr('data-url')
                    window.__IS_NEEDED_REFRESH = true
                    window.XXG.redirect(tcb.setUrl2(url))
                },
                // 苏宁礼品卡
                '.js-trigger-xxg-suning-gift-card': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var order_id = $me.attr('data-order-id')
                    window.XXG.ajax({
                        url: tcb.setUrl2('/xxgHs/getGiftCardJumpAddr'),
                        type: 'POST',
                        data: {
                            order_id: order_id
                        },
                        success: function (res) {
                            if (res.errno) {
                                $.dialog.toast(res['errmsg'], 2000)
                            } else {
                                if (res.result.result) {
                                    window.__IS_NEEDED_REFRESH = true
                                    window.XXG.redirect(tcb.setUrl2(res.result.result))
                                } else {
                                    $.dialog.toast(res['errmsg'], 2000)
                                }
                            }
                        },
                        error: function (err) {
                            $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                        }
                    })
                },
                // 金牌代叫快递
                '.js-trigger-xxg-edit-express': function (e) {
                    e.preventDefault()

                    var order_id = $(this).attr('data-order-id'),
                            is_edit = $(this).attr('data-act') === 'edit',
                            redirect_url = window.location.href

                    // 普通邮寄回收
                    YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {
                        var html_fn = $.tmpl(tcb.trim($('#JsMHSSchedulePickupPanelTpl').html())),
                                html_st = html_fn({
                                    data: {
                                        province: window.__Province['name'],
                                        city: window.__City['name'],
                                        area_list: res['area_list'] || [],
                                        mobile: res['default_mobile'],
                                        order_id: order_id,
                                        url: redirect_url
                                    }
                                })

                        var DialogObj = tcb.showDialog(html_st, {
                            className: 'schedule-pickup-panel',
                            withClose: false,
                            middle: true,
                            onClose: function () {
                                window.location.href = redirect_url
                            }
                        })

                        if (is_edit) {
                            var userName = $('.form-schedule-pickup input[name="express_username"]'),
                                    userTel = $('.form-schedule-pickup input[name="express_tel"]'),
                                    userRegion = $('.form-schedule-pickup input[name="express_useraddr"]'),
                                    userTime = $('.form-schedule-pickup input[name="express_time_alias"]'),
                                    regionWrap = $('.form-schedule-pickup .region-wrap'),
                                    btnWrap = $('.form-schedule-pickup .kuaidi-btn-wrap'),
                                    changeTimeForm = $('.form-schedule-pickup')
                            regionWrap.remove()
                            btnWrap.css('margin-top', '.4rem')
                            changeTimeForm.attr('action', '/huishou/doUpdateExpressTime')
                            userName.val(res.express_username).attr({readonly: 'true'})
                            userTel.val(res.express_tel).attr({readonly: 'true'})
                            userRegion.val(res.user_addr).attr({readonly: 'true'})
                            userTime.val(res.express_time)
                        }

                        // 绑定预约取件相关事件
                        YuyueKuaidi.bindEventSchedulePickup(DialogObj.wrap, redirect_url)
                    })
                },
                // 重叫快递
                '.js-trigger-xxg-retry-call-express': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var order_id = $me.attr('data-order-id')
                    window.XXG.ajax({
                        url: tcb.setUrl2('/m/goldOrderRetryCallExpress'),
                        type: 'POST',
                        data: {
                            order_id: order_id
                        },
                        success: function (res) {
                            if (res.errno) {
                                $.dialog.toast(res['errmsg'], 2000)
                            } else {
                                $.dialog.toast('操作成功!', 2000)
                            }
                        },
                        error: function (err) {
                            $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                        }
                    })
                },
                // 上传还原图片
                '.js-trigger-xxg-need-privacy-clearance': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var order_id = $me.attr('data-order-id')
                    var brand_id = $me.attr('data-brand-id')
                    window.__IS_NEEDED_REFRESH = true
                    window.XXG.redirect(tcb.setUrl2('/page/huishou-jinpai/#/uploadResetPhoto', {
                        order_id: order_id,
                        brand_id: brand_id
                    }))
                },
                // 查看质检
                '.js-trigger-xxg-show-quality-report': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var order_id = $me.attr('data-order-id')
                    window.XXG.redirect(tcb.setUrl2('/m/userQuality', {order_id: order_id, goldInfos: 1}))
                },
                // 去下单
                '.js-trigger-xxg-create-order': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var assess_key = $me.attr('data-assess-key')
                    window.__IS_NEEDED_REFRESH = true
                    var targetUrl = '/m/goldUseToolsOrder?assess_key=' + assess_key
                    window.XXG.redirect(tcb.setUrl2('/m/goldHideJump', {target_url: targetUrl}))
                },
                // 查看评估
                '.js-trigger-xxg-view-assess': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var assess_key = $me.attr('data-assess-key')
                    var targetUrl = '/page/huishou-jinpai/?_global_data=%7B%22is_gold_engineer%22%3A1%7D#/remoteCheck?redirect=1&assess_key=' + assess_key
                    window.__IS_NEEDED_REFRESH = true
                    window.XXG.redirect(tcb.setUrl2('/m/goldHideJump', {target_url: targetUrl}))
                },
                // 金修扫码搜索
                '.js-trigger-jinpai-scan-express-no': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    if (!tcb.js2AppInvokeQrScanner(true, function (result) {
                        result = tcb.trim(result || '')
                        if (result) {
                            var $form = $me.closest('form')
                            var $express_id = $form.find('[name="express_id"]')
                            $express_id.val(encodeURIComponent(result))
                            $form.trigger('submit')
                        }
                    })) {
                        console.error('扫码呼起失败，你想想是不是哪里错了？')
                    }
                },
                // 地址管理
                '.js-trigger-xxg-address-manager': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var $form = $me.closest('form')
                    window.XXG.ajax({
                        url: tcb.setUrl2($form.attr('action')),
                        type: 'POST',
                        data: $form.serialize(),
                        success: function (res) {
                            if (res.errno) {
                                $.dialog.toast(res['errmsg'], 2000)
                            } else {
                                $.dialog.toast('操作成功!', 2000)
                                setTimeout(function () {
                                    window.location.reload()
                                }, 300)
                            }
                        },
                        error: function (err) {
                            tcb.loadingDone()
                            $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                        }
                    })
                },
                // 发货
                '.js-trigger-xxg-sendout': function (e) {
                    e.preventDefault()
                    $(this).parent().hide();
                    $.dialog.toast('发货成功!')
                }
            })

            // 金修快递搜索
            $('form.form-jinpai-xxg-express-search').on('submit', function (e) {
                        e.preventDefault()

                        var $form = $(this)
                        tcb.loadingStart()
                        window.XXG.ajax({
                            url: tcb.setUrl2('/m/searchGoldOrderWaitExpress'),
                            type: 'POST',
                            data: $form.serialize(),
                            success: function (res) {
                                tcb.loadingDone()

                                if (res.errno) {
                                    $.dialog.toast(res['errmsg'], 2000)
                                } else {
                                    // 加载中
                                    __PageCache.is_loading = true
                                    // 移除商品加载ing的html
                                    uiRemoveLoadingHtml()
                                    var item = res.result,
                                            $List
                                    var html_fn = $.tmpl($.trim($('#JsGoldExpressSearchTpl').html())),
                                            html_str = html_fn({
                                                'item': item
                                            })
                                    // var $html_str = $(html_str)
                                    $List = $('.block-gold-content')
                                    // $html_str.appendTo($List)
                                    $List.html(html_str)
                                    // 加载完成
                                    __PageCache.is_loading = false
                                }
                            },
                            error: function (err) {
                                $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                            }
                        })
                    }
            )

            var $win = tcb.getWin(),
                    $body = $('body'),
                    //可见区域的高度
                    viewH = $win.height(),
                    scrollHandler = function (e) {
                        // 已经滚动加载完所有订单，那么干掉滚动事件
                        if (__PageCache.is_end) {
                            return $win.off('scroll', scrollHandler)
                        }
                        // 加载中，不再重复执行加载
                        if (__PageCache.is_loading) {
                            return
                        }
                        //可滚动内容的高度(此值可变，只能放在scroll滚动时动态获取)
                        var scrollH = $body[0].scrollHeight,
                                // 计算可滚动最大高度，即滚动到时了最底部
                                maxSH = scrollH - viewH,
                                //滚动条向上滚出的高度
                                st = $win.scrollTop()

                        if (st >= (maxSH - __PageCache.load_padding)) {
                            curPageStatusReq({
                                pn: __PageCache.pn + 1
                            })
                        }
                    }
            $win.on('scroll', scrollHandler)
        }

        // 判断当前页面的订单状态,请求不同接口
        function curPageStatusReq(options) {
            var type = tcb.queryUrl(window.location.search, 'type')
            if (type === '1') {
                getGoldAssessList(options)
            } else if (type === '2') {
            } else if (type === '3') {
                getGoldAddress(options);
            } else {
                getGoldOrderList(options)
            }
        }

        function initAddressSelect() {
            var $trigger = $('.trigger-select-city')
            var clientLocation = window.__CLIENT_LOCATION || {},
                    province = $trigger.attr('data-province') || clientLocation && clientLocation.province && clientLocation.province.name,
                    city = $trigger.attr('data-city') || clientLocation && clientLocation.city && clientLocation.city.name,
                    area = $trigger.attr('data-area') || clientLocation && clientLocation.area && clientLocation.area.name,
                    options = {
                        selectorTrigger: '.trigger-select-city',
                        province: province,
                        city: city,
                        area: area,
                        callback_cancel: null,
                        selectorProvince: '[name="province_code"]',
                        selectorCity: '[name="city_code"]',
                        selectorArea: '[name="area_code"]'
                    }
            // 初始化省/市/区县选择器
            Bang.AddressSelect2(options)
        }

        // 页面初始化入口函数
        function init() {
            // 设置订单状态切换tab的滚动
            setTabScroll()
            // 绑定事件
            bindEvent()
            // 当前页面数据加载请求
            curPageStatusReq()
        }

        init()
    })
}()
