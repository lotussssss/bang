// 修修哥订单列表
!function () {
    if (window.__PAGE !== 'xxg-order-list') {
        return
    }

    $(function () {

        // 订单列表相关信息
        var __PageCache = {
            pn: 0,
            pn_max: 0,
            page_size: 20,
            is_loading: false,
            is_end: false,
            load_padding: 50,
            cur_date: '', // 存放某一笔订单的下单时间
            is_manual_mail: !!tcb.queryUrl(window.location.search, 'manualMail') // 是否是手动发货页
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
        function getXxgOrderList(options) {
            options = options || {}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                page_size = options.page_size || __PageCache.page_size,
                params = {
                    pn: pn,
                    page_size: page_size
                },
                order_mobile_id = tcb.queryUrl(window.location.search, 'order_mobile_id'),
                search_status = tcb.queryUrl(window.location.search, 'search_status'),
                search_status_sets = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '110', '120']

            search_status = tcb.inArray(search_status, search_status_sets) > -1 ? search_status : 0
            params['search_status'] = search_status

            if (order_mobile_id) {
                params['order_mobile_id'] = order_mobile_id
            }

            // 加载中
            __PageCache.is_loading = true
            $.get('/m/doGetXxgOrderList', params, function (res) {
                // try {
                res = $.parseJSON(res)

                if (!res['errno']) {
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()

                    var order_list = res['result']['order_list'],
                        total_count = res['result']['total'],
                        $List

                    if (!__PageCache.pn_max) {

                        __PageCache.pn_max = Math.floor(total_count / __PageCache.page_size)
                    }

                    if (order_list && order_list.length) {
                        var html_fn = $.tmpl($.trim($('#JsXxgOrderListTpl').html())),
                            html_str = html_fn({
                                'list': order_list
                            })

                        var $html_str = $(html_str)
                        $List = $('.block-order-list')
                        $html_str.appendTo($List)
                        // $List.append(html_str)
                        var $CopyBtn = $html_str.find('.js-trigger-copy-the-text')
                        if (ClipboardJS.isSupported()) {
                            $CopyBtn.each(function () {
                                new ClipboardJS(this).on('success', function (e) {
                                    $.dialog.toast('复制成功：' + e.text)
                                })
                            })
                        } else {
                            $CopyBtn.hide()
                        }

                        // 添加加载ing的html显示
                        uiAddLoadingHtml($List)

                        __PageCache.pn = pn
                    }

                    if (__PageCache.pn >= __PageCache.pn_max) {
                        __PageCache.is_end = true

                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()
                        $List = $List || $('.block-order-list')
                        uiAddNoMoreHtml($List)
                    }

                    orderItemEvent()
                }
                // }catch (ex){}

                // 加载完成
                __PageCache.is_loading = false
            })
        }

        //再来一单需求 给每个订单绑定事件
        function orderItemEvent() {

            $('.js-test-order-satisfy-zlyd').on('click', function () {
                var order_id = $(this).attr('data-order-id'),
                    againOneOrderIsUsable = $(this).attr('data-again-one-order-is-usable'),
                    zlydSuccess = $('.zlyd-alert-model .zlyd-success'),
                    zlydErr = $('.zlyd-alert-model .zlyd-err'),
                    tel = $(this).attr('data-tel'),
                    address = $(this).attr('data-address'),
                    errText = $('.zlyd-err .zlyd-err-text'),
                    zlydMask = $('.zlyd-alert-model-mask')

                if (tel) {
                    $('.zlyd-alert-model .zlyd-user-information span').html(tel)
                }
                if (address) {
                    $('.zlyd-alert-model .zlyd-user-address').html(address)
                }
                $('.zlyd-alert-model-btn-confirm').attr('href', '/huishou/confirmAgainOneOrder?order_id=' + order_id)
                zlydMask.show()
                if (againOneOrderIsUsable == 10) {
                    zlydSuccess.show()
                    zlydErr.hide()
                } else if (againOneOrderIsUsable == 20) {
                    zlydSuccess.hide()
                    zlydErr.show()
                } else if (againOneOrderIsUsable == 30) {
                    errText.html('仅现场回收订单，才可使用再来一单功能哦')
                    zlydSuccess.hide()
                    zlydErr.show()
                }
            })
        }

        // 门店发货列表
        function getMenDianFahuo(options) {
            options = options || {}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                page_size = options.page_size || __PageCache.page_size,
                params = {
                    pn: pn,
                    page_size: page_size
                },
                order_mobile_id = tcb.queryUrl(window.location.search, 'order_mobile_id'),
                search_status = tcb.queryUrl(window.location.search, 'search_status'),
                search_status_sets = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90']

            search_status = tcb.inArray(search_status, search_status_sets) > -1 ? search_status : 0
            params['search_status'] = search_status

            if (order_mobile_id) {
                params['order_mobile_id'] = order_mobile_id
            }

            // 加载中
            __PageCache.is_loading = true
            $.get('/m/doGetXxgFahuo', params, function (res) {
                // try {
                res = $.parseJSON(res)

                if (!res['errno']) {
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()

                    var order_list = res['result']['order']['order_list'],
                        total_count = res['result']['order']['total'],
                        $List

                    // 发货信息
                    var express_status = res['result']['express']['status'],
                        express_fivecode = res['result']['express']['fiveCode'],
                        refreshButtonFlag = res['result']['express']['flushFlag'],
                        $expressStatus
                    if (express_status) {
                        var express_html_fn = $.tmpl($.trim($('#JsXxgStoreDelivery').html())),
                            express_html_str = express_html_fn({
                                'express_status': express_status,
                                'express_fivecode': express_fivecode,
                                'refresh_button_flag': refreshButtonFlag
                            })
                        express_html_str = tcb.trim(express_html_str || '')

                        $expressStatus = $('.__xxg-mendianfahuo')
                        express_html_str
                            ? $expressStatus.html(express_html_str).show()
                            : $expressStatus.hide()
                        doRefreshExpressStatus()  // 刷新快递
                    }

                    if (!__PageCache.pn_max) {

                        __PageCache.pn_max = Math.floor(total_count / __PageCache.page_size)
                    }

                    // console.log(order_list.length)
                    if (order_list.length > 0) {
                        // $('#mendianManual').show()
                        $('#MendianFahuoBtns').show()
                    }

                    if (order_list && order_list.length) {
                        var html_fn = $.tmpl($.trim($('#JsXxgOrderListTpl').html())),
                            html_str = html_fn({
                                'list': order_list
                            })

                        $List = $('.block-order-list')
                        $List.append(html_str)

                        // 添加加载ing的html显示
                        uiAddLoadingHtml($List)

                        __PageCache.pn = pn
                    }

                    if (__PageCache.pn >= __PageCache.pn_max) {
                        __PageCache.is_end = true

                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()
                        $List = $List || $('.block-order-list')
                        uiAddNoMoreHtml($List)
                    }
                }
                // }catch (ex){}

                // 加载完成
                __PageCache.is_loading = false
            })
        }

        // 门店订单列表
        function getMendianOrderList(options) {
            options = options || {}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                page_size = options.page_size || __PageCache.page_size,
                params = {
                    pn: pn,
                    page_size: page_size
                },
                order_mobile_id = tcb.queryUrl(window.location.search, 'order_mobile_id')

            params['search_status'] = 100

            if (order_mobile_id) {
                params['order_mobile_id'] = order_mobile_id
            }

            // 加载中
            __PageCache.is_loading = true
            $.get('/m/doGetXxgMenDianOrderList', params, function (res) {
                // try {
                res = $.parseJSON(res)

                if (!res['errno']) {
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()

                    var order_list = res['result']['order_list'],
                        total_count = res['result']['total'],
                        $List

                    if (!__PageCache.pn_max) {

                        __PageCache.pn_max = Math.floor(total_count / __PageCache.page_size)
                    }

                    if (order_list && order_list.length) {
                        var html_fn = $.tmpl($.trim($('#JsXxgOrderListTpl').html())),
                            __cur_date = __PageCache.cur_date, // 当前列表第一条的创建时间
                            html_str = html_fn({
                                'list': order_list,
                                'cur_date': __cur_date.split(' ')[0]
                            })
                        $List = $('.block-order-list')
                        $List.append(html_str)

                        // 记录上次数据的最后一条记录的日期
                        __PageCache.cur_date = order_list[order_list.length - 1].create_time || ''

                        // 添加加载ing的html显示
                        uiAddLoadingHtml($List)

                        __PageCache.pn = pn
                    }

                    if (__PageCache.pn >= __PageCache.pn_max) {
                        __PageCache.is_end = true

                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()
                        $List = $List || $('.block-order-list')
                        uiAddNoMoreHtml($List)
                    }
                }
                // }catch (ex){}

                // 加载完成
                __PageCache.is_loading = false
            })
        }

        // 手动发货列表
        function getManualList(options) {
            options = options || {}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                page_size = 50 // 产品要求改成一次请求50条 options.page_size || __PageCache.page_size,
            params = {
                pn: pn,
                page_size: page_size
            },
                order_mobile_id = tcb.queryUrl(window.location.search, 'order_mobile_id')

            params['search_status'] = 20 // 待发货状态码

            if (order_mobile_id) {
                params['order_mobile_id'] = order_mobile_id
            }

            // 加载中
            __PageCache.is_loading = true
            $.get('/m/doGetmanualList', params, function (res) {
                // try {
                res = $.parseJSON(res)

                if (!res['errno']) {
                    // 移除商品加载ing的html
                    uiRemoveLoadingHtml()

                    var order_list = res['result']['order_list'],
                        total_count = res['result']['total'],
                        $List

                    if (!__PageCache.pn_max) {

                        __PageCache.pn_max = Math.floor(total_count / page_size)
                    }

                    if (order_list && order_list.length) {
                        var html_fn = $.tmpl($.trim($('#JsXxgOrderListTpl').html())),
                            html_str = html_fn({
                                'list': order_list
                            })

                        $List = $('.block-order-list')
                        $List.append(html_str)

                        // 添加加载ing的html显示
                        uiAddLoadingHtml($List)

                        __PageCache.pn = pn
                    }

                    if (__PageCache.pn >= __PageCache.pn_max) {
                        __PageCache.is_end = true

                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()
                        $List = $List || $('.block-order-list')
                        uiAddNoMoreHtml($List)
                    }
                }
                // }catch (ex){}

                // 加载完成
                __PageCache.is_loading = false
            })
        }

        // 获取预约单订单列表
        function getXxgYuYueDanOrderList(options) {
            options = options || {}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 1,
                params = {
                    page: pn
                }

            // 加载中
            __PageCache.is_loading = true
            var url = '/m/getShopSubscribeOrder'
            window.XXG.ajax({
                url: url,
                data: params,
                success: function (res) {
                    if (!res['errno']) {
                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()

                        var order_list = res['result']['data'],
                            total_count = res['result']['total'],
                            page_size = res['result']['per_page'] || __PageCache.page_size,
                            $List

                        if (!__PageCache.pn_max) {
                            __PageCache.pn_max = Math.floor(total_count / page_size)
                        }

                        if (order_list && order_list.length) {
                            var html_fn = $.tmpl($.trim($('#JsXxgYuYueDanOrderListTpl').html())),
                                html_str = html_fn({
                                    'list': order_list
                                })

                            var $html_str = $(html_str)
                            $List = $('.block-order-list')
                            $html_str.appendTo($List)

                            // 添加加载ing的html显示
                            uiAddLoadingHtml($List)

                            __PageCache.pn = pn
                        }

                        if (__PageCache.pn >= __PageCache.pn_max) {
                            __PageCache.is_end = true

                            // 移除商品加载ing的html
                            uiRemoveLoadingHtml()
                            $List = $List || $('.block-order-list')
                            uiAddNoMoreHtml($List)
                        }
                    }

                    // 加载完成
                    __PageCache.is_loading = false
                },
                error: function (err) {
                    $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                }
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
            var
                $Loading = $('#UILoading')

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
            var
                $Loading = $('#UILoading')

            if ($Loading && $Loading.length) {

                $Loading.remove()
            }
        }

        // 页面checkbox的事件
        function handleCheckboxEvent(e) {
            var event = e || {}
            var has_checked = false
            var checkedListLength = __getBatchExpressDeliveryCheckedOrdersData()['names'].length || 0
            $('.xxg_batch_express_delivery').each(function () {
                if ($(this).get(0).checked) {
                    has_checked = true
                }
            })
            var $btn = $('.xxg_batch_express_delivery_btn')
            var $countELe = $('#fahuoTotalCount')
            if (has_checked) {
                $btn.removeAttr('disabled').removeClass('fahuo-btn-disabled')
                $countELe.html(checkedListLength)
            } else {
                $btn.attr('disabled', 'disabled').addClass('fahuo-btn-disabled')
                $countELe.html(checkedListLength)
            }
        }

        // 绑定事件
        function bindEvent() {
            tcb.bindEvent(document.body, {
                //批量发货/批量填写快递单号
                //checkbox事件
                '.xxg_batch_express_delivery': function (e) {
                    handleCheckboxEvent()
                    setAllCheckListStatus()
                },
                // 修修哥批量发货提交快递单号
                '.xxg_batch_express_delivery_btn': function (e) {
                    if (!$(this).prop('disabled')) {  // 如果按钮不是禁用状态,执行发货弹窗等事件
                        e.preventDefault()
                        __actionActiveBatchExpressDelivery()
                    } else {  // 按钮时禁用状态,弹出提示文字
                        $.dialog.toast('请至少选择1个订单进行发货')
                    }
                },
                // 手动发货页面,底部的悬浮全选按钮
                '._all_checkbox': function (e) {
                    doAllCheckList()
                },
                '.block-order-list .item': __handleClickOrderList,
                // 预约单，触发接单
                '.js-trigger-xxg-yuyuedan-jiedan': function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var order_id = $me.attr('data-order-id')
                    var $alert = $.dialog.alert('<div class="grid justify-center" style="font-size: .14rem;">确认接单？</div>', function () {
                        window.XXG.redirect(tcb.setUrl2('/m/hs_xxg_order', {order_id: order_id}))
                    }, {})
                    $alert.find('.close').show()
                },
                // 预约上门取件
                '.js-trigger-xxg-select-schedule-pickup-time': function (e) {
                    e.preventDefault()
                    var schedulePickupTimeData = getSchedulePickupTimeData()
                    var html_fn = $.tmpl(tcb.trim($('#JsDialogXXGSelectSchedulePickupTimeTpl').html())),
                        html_st = html_fn({
                            schedulePickupTimeData: schedulePickupTimeData
                        })
                    var dialogInst = tcb.showDialog(html_st, {
                        className: 'dialog-xxg-select-schedule-pickup-time',
                        fromBottom: true
                    })
                    var $wrap = dialogInst.wrap

                    var selected_day = ''
                    var selected_time = ''
                    // 选择日期
                    $wrap.find('.the-day>.col').on('click', function (e) {
                        e.preventDefault()
                        var $me = $(this)
                        if ($me.hasClass('selected')) {
                            return
                        }
                        $me.addClass('selected').siblings('.selected').removeClass('selected')
                        var index = +$me.attr('data-index') || 0
                        var data = schedulePickupTimeData[index]
                        var html_time = ''
                        tcb.each(data.time || [], function (i, item) {
                            html_time += ['<a class="col auto" href="#" data-time="', item.value, '">', item.text, '</a>'].join('')
                        })
                        $wrap.find('.the-time').html(html_time)

                        selected_day = $me.attr('data-day')
                        selected_time = ''
                    })
                    // 选择时间
                    $wrap.find('.the-time').on('click', '.col', function (e) {
                        e.preventDefault()
                        var $me = $(this)
                        if ($me.hasClass('selected')) {
                            return
                        }
                        $me.addClass('selected').siblings('.selected').removeClass('selected')

                        selected_time = $me.attr('data-time')
                    })
                    // 确认提交
                    $wrap.find('.js-trigger-xxg-confirm-schedule-pickup-time').on('click', function (e) {
                        e.preventDefault()
                        if (!(selected_day && selected_time)) {
                            return $.dialog.toast('请选择日期和时间！')
                        }
                        var selected = [selected_day, selected_time].join(' ')

                        submitSchedulePickupTime(selected, function () {
                            tcb.closeDialog(dialogInst)
                            return $.dialog.toast('请等待上门取件，顺丰上门取件后请手动填写订单号', 3000)
                        })
                    })
                    // 默认选中第一个日期
                    $wrap.find('.the-day>.col').eq(0).trigger('click')
                }
            })

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
                        setAllCheckListStatus(false)
                    }
                }
            $win.on('scroll', scrollHandler)
        }

        var pickupTimeHour = {
            start: 9,
            end: 18
        }

        // 获取取件时间数据
        function getSchedulePickupTimeData() {
            var now_padding = window.__NOW_PADDING || 0
            var now = (new Date).getTime() + now_padding
            var nowDate = new Date(now)
            var tomorrowDate = new Date(now + 24 * 60 * 60 * 1000)
            var today_text = '今天'
            var tomorrow_text = '明天'
            var hour = nowDate.getHours()
            if (hour < pickupTimeHour.start) {
                hour = pickupTimeHour.start
            } else if (hour >= pickupTimeHour.end) {
                hour = pickupTimeHour.start
                nowDate = new Date(now + 24 * 60 * 60 * 1000)
                tomorrowDate = new Date(now + 24 * 60 * 60 * 1000 * 2)
                today_text = '明天'
                tomorrow_text = '后天'
            } else {
                hour += 1
            }
            var today = getSchedulePickupTimeDataByDate(nowDate, hour, today_text)
            var tomorrow = getSchedulePickupTimeDataByDate(tomorrowDate, pickupTimeHour.start, tomorrow_text)

            return [today, tomorrow]
        }

        function getSchedulePickupTimeDataByDate(dateObj, hour_start, text) {
            var time = []
            while (pickupTimeHour.end - hour_start > -1) {
                time.push({
                    text: [[hour_start, '00'].join(':'), [hour_start + 1, '00'].join(':')].join(' - '),
                    value: [fix2Length(hour_start), '00', '00'].join(':')
                })
                hour_start++
            }

            return {
                text: text,
                value: [dateObj.getFullYear(), fix2Length(dateObj.getMonth() + 1), fix2Length(dateObj.getDate())].join('-'),
                time: time
            }
        }

        /**
         * 修复为2个字符长度，长度不足以前置0补齐;
         * @return {[type]} [description]
         */
        function fix2Length(str){
            str = str.toString();
            return str.length < 2 ? '0' + str : str;
        }

        // 提交预约上门取件
        function submitSchedulePickupTime(send_time, callback) {
            window.XXG.ajax({
                url: '/xxgHs/doShopCallCourier',
                type: 'POST',
                data: {
                    send_time: send_time
                },
                success: function (res) {
                    if (!(res && !res.errno)) {
                        var errmsg = (res && res.errmsg) || '系统错误，请稍后重试'
                        return $.dialog.toast(errmsg)
                    }
                    typeof callback === 'function' && callback()
                },
                error: function (err) {
                    $.dialog.toast(err.statusText || '系统错误，请稍后重试')
                }
            })
        }


        // 修修哥编辑订单信息表单
        function xxgEditForm($form, valid_submit, before_submit, after_submit) {
            $form.on('submit', function (e) {
                e.preventDefault()

                var $form = $(this)

                if (typeof valid_submit === 'function' && !valid_submit($form)) {
                    return false
                }

                if (!notEqualDefaultVal($form)) {
                    window.location.reload()
                    return
                }

                // 订单提交前执行
                if (typeof before_submit !== 'function') {
                    before_submit = function ($form, callback) {
                        typeof callback === 'function' && callback()
                    }
                }
                // 订单提交后执行
                if (typeof after_submit !== 'function') {
                    after_submit = function () {return true}
                }

                before_submit($form, function () {
                    $.post($form.attr('action'), $form.serialize(), function (res) {
                        res = $.parseJSON(res)

                        // 表单提交后执行，返回true继续执行以下默认操作，false不执行以下操作
                        if (after_submit(res)) {
                            if (!res.errno) {
                                window.location.reload()
                            } else {
                                alert(res.errmsg)
                            }
                        }
                    })

                })
            })

        }

        // 比较是否和默认值不相等
        function notEqualDefaultVal($form) {
            // 默认相等
            var flag = false

            var $input = $form.find('input,textarea')

            $input.forEach(function (item, i) {
                var $item = $(item),
                    default_val = $item.attr('data-default')

                // 默认值不为空字符串,并且默认值和修改后的值不相等，设置flag为true，表示有不相等的值，可以正常提交表单
                if (default_val) {
                    if (default_val !== $item.val()) {
                        flag = true
                    }
                } else {
                    // 确保是空字符串，而不是未定义状态或者null
                    if (default_val === '' && $item.val()) {
                        flag = true
                    }
                }
            })

            return flag
        }

        function __handleClickOrderList(e) {
            var $target = $(e.target),
                $me = $(this),
                order_id = $me.attr('data-order-id')

            if ($target.hasClass('btn-view-check-info')) {
                //验机详情跳转链接
                e.preventDefault()

                return window.XXG.redirect(tcb.setUrl2('/m/hsXXGThirdPingguNotEqualOrderDetail', {
                    order_id: order_id
                }))
            } else if ($target.hasClass('btn-edit-complaint')) {
                //填写验机差异申诉原因
                e.preventDefault()

                var html_st = $.tmpl($.trim($('#JsXxgEditComplaintTpl').html()))({
                        'order_id': order_id
                    }),
                    dialog = tcb.showDialog(html_st, {
                        withMask: true,
                        middle: true
                    })
                window.XXG.bindForm({
                    $form: dialog.wrap.find('form'),
                    before: function ($form, callback) {
                        __validFormOrderAppeal($form) && callback()
                    },
                    success: function () {
                        // 数据更新成功
                        window.XXG.redirect()
                    },
                    error: function (res) {
                        $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                    }
                })
            }
        }

        // 验证订单申诉表单
        function __validFormOrderAppeal($form) {
            var flag = true

            var $appeal_reason = $form.find('[name="appeal_reason"]'),
                appeal_reason_val = $.trim($appeal_reason.val())

            if (!appeal_reason_val) {
                flag = false
                $.errorAnimate($appeal_reason.focus())
            }
            return flag
        }

        function __actionActiveBatchExpressDelivery() {
            //取选中数据
            var ordersData = __getBatchExpressDeliveryCheckedOrdersData(),
                html_st = __getBatchExpressDeliveryPanelHtml(ordersData['ids'], ordersData['names'], ordersData['fivecodes'], ordersData['xxgName']),
                dialog = tcb.showDialog(html_st, {
                    withMask: true,
                    middle: true
                })
            window.XXG.bindForm({
                $form: dialog.wrap.find('form'),
                before: function ($form, callback) {
                    __validFormBatchExpressDelivery($form) && callback()
                },
                success: function () {
                    // 数据更新成功
                    window.XXG.redirect()
                },
                error: function (res) {
                    $.dialog.toast(res && res.errmsg ? res.errmsg : '系统错误，请稍后重试')
                }
            })
        }

        function __getBatchExpressDeliveryCheckedOrdersData() {
            var orderIds = [],
                orderNames = [],
                orderFiveCode = [],
                orderxgName = []
            $('.xxg_batch_express_delivery').each(function () {
                var $me = $(this)
                if ($me[0].checked) {
                    orderIds.push($me.attr('data-orderid'))
                    orderNames.push($me.attr('data-ordername'))
                    orderFiveCode.push($me.attr('data-fivecode'))
                    orderxgName.push($me.attr('data-xxgName'))
                }
            })
            return {
                ids: orderIds,
                names: orderNames,
                fivecodes: orderFiveCode,
                xxgName: orderxgName
            }
        }

        function __getBatchExpressDeliveryPanelHtml(orderIds, orderNames, orderFiveCode, orderxgName) {
            var html_st = $.tmpl($.trim($('#JsXxgEditExpressTpl').html()))(),
                $tmpHtml = $('<div>' + html_st + '</div>'),
                $tmpForm = $tmpHtml.find('form'),
                _htmlList = '', // 机器列表
                _html = ''  // 结构

            for (var i in orderNames) { // 遍历生成列表结构
                _htmlList += '<li class="fahuo-item"><div class="fahuo-item-text">'
                    + orderNames[i]
                    + '<span class="five-code">('
                    + orderFiveCode[i]
                    + ')</span></div><span>'
                    + orderxgName[i]
                    + '</span></li>'
            }
            // 元素结构
            _html = '<div class="row"><div class="fahuo-title"><span class="title-text">发货物品：</span><span>共计 '
                + orderNames.length
                + ' 件</span></div><ul class="fahuo-list">'
                + _htmlList
                + '</ul></div>'
            // 插入页面
            $tmpForm.prepend(_html)
                    .attr('action', '/m/doBatchSubExpressInfo')
                    .attr('method', 'post')
            $tmpForm.find('[name="parent_id"]').attr('name', 'parent_ids').val(orderIds.join(','))

            return $tmpHtml.html()
        }

        function __validFormBatchExpressDelivery($form) {
            var flag = true

            var $express_id = $form.find('[name="express_id"]'),
                express_id = $.trim($express_id.val())

            if (!express_id) {
                flag = false
                $.dialog.toast('快递单号不能为空')
                $.errorAnimate($express_id.focus())
            }
            return flag
        }

        // 设置全选按钮的状态, status = true (选中) / false (未选中)
        function setAllCheckListStatus(status) {
            var $checkEle = $('._all_checkbox')
            if ($checkEle.length === 0) return
            if (typeof status === 'undefined') {
                $checkEle.get(0).checked = handleCompareListCount()
            } else {
                $checkEle.get(0).checked = status
            }

        }

        // 判断当前选中的元素与页面元素是否相等
        function handleCompareListCount() {
            // 已选择的列表数量
            var checkedListLength = __getBatchExpressDeliveryCheckedOrdersData()['names'].length || 0
            // 页面上的 checkbox 数量
            var eleListLength = $('.xxg_batch_express_delivery').length || 0
            return checkedListLength === eleListLength
        }

        // 手动发货--全选按钮/取消全选
        function doAllCheckList() {
            if (!handleCompareListCount()) { // 选择的列表数不等于页面元素的数,可以直接全选
                $('.xxg_batch_express_delivery').each(function () {
                    var $me = $(this)
                    $me[0].checked = true
                })
            } else {  // 反之,全选取消
                $('.xxg_batch_express_delivery').each(function () {
                    var $me = $(this)
                    $me[0].checked = false
                })
            }
            handleCheckboxEvent()
        }

        // 页面数据重置
        function resetPageData() {
            __PageCache = {
                pn: 0,
                pn_max: 0,
                page_size: 20,
                is_loading: false,
                is_end: false,
                load_padding: 50
            }
            $('.block-order-list').html('')
            $('.__xxg-mendianfahuo').hide().html('')
        }

        // 请求刷新快递状态
        function getRefreshExpressStatus() {
            $.get('/m/doGetXxgFahuoStatus', function (res) {
                res = $.parseJSON(res)
                if (res['errno']) {
                    $.dialog.toast(res['errmsg'])
                }
                init()  // 初始化
            })
        }

        // 刷新快递状态
        function doRefreshExpressStatus() {
            var $ele = $('#refreshExpressStatus')
            $ele.on('click', function (e) {
                var $eleTarget = e.target
                var flag = $eleTarget.dataset.disabled || ''
                flag = eval(flag) // 字符串转 Boolean
                if (flag) {
                    resetPageData() // 先重置数据
                    getRefreshExpressStatus() // 在请求刷新接口
                } else {
                    $.dialog.toast('请稍后刷新')
                }
            })
        }

        // 判断当前页面的订单状态,请求不同接口
        function curPageStatusReq(options) {
            var curStatus = tcb.queryUrl(window.location.search, 'search_status')
            var xxg_shop_manager = window.__XXG_SHOP_MANAGER || false
            if (curStatus === 'yuyuedan') {
                // 预约单
                getXxgYuYueDanOrderList(options)
            } else if (curStatus === '90') {
                // 如果是门店发货或者门店订单页,单独处理
                // 门店发货
                getMenDianFahuo(options)
            } else if (curStatus === '100' && xxg_shop_manager) {
                // 店长身份,可以看到门店订单列表
                getMendianOrderList(options)
            } else if (__PageCache.is_manual_mail) {
                getManualList(options)
            } else {
                getXxgOrderList(options)
            }
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

        if (!__PageCache.is_manual_mail) {  // 不是手动发货页时,执行初始化
            init()
        } else {  // 手动发货,执行的初始化
            // 绑定事件
            bindEvent()
            curPageStatusReq()
        }
    })

}()
