// 秒杀&清仓活动页
!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        'title': '每日秒杀捡漏，尾货清仓大甩卖',
        'desc': '【捡漏】每日更新特价秒杀二手机，限时直降，领券到手更优惠！',
        'link': window.location.protocol + '//' + window.location.host + window.location.pathname,
        'imgUrl': 'https://p5.ssl.qhimg.com/t017057b9739e574f09.png',
        'success': tcb.noop, // 用户确认分享的回调
        'cancel': tcb.noop // 用户取消分享
    }

    if (typeof wx !== 'undefined') {
        wx.ready(function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage(wxData)
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline(wxData)
            //分享到QQ
            wx.onMenuShareQQ(wxData)
            //分享到QZone
            wx.onMenuShareQZone(wxData)
        })
    }

    // 设置支持App分享
    function __appSetShareSupport() {
        // 设置分享的数据
        tcb.js2AppSetShareData(wxData)

        // 设置支持的分享方式，不传任何参数，那么表示支持默认的分享方式
        var shareSupport = {
            'onMenuCopyUrl': 0
        }
        if (window.__IS_YOUPIN_APP_ANDROID_SHADOW_ERSHOUSHOUJI) {
            shareSupport['onMenuShareTimeline'] = 0
            shareSupport['onMenuShareAppMessage'] = 0
        }
        tcb.js2AppSetShareSupport(shareSupport)
    }

    __appSetShareSupport()

    $(function () {
        // 向webview传数据
        function miniProgramWebviewReady() {
            // 判断是否在小程序中
            if (window.__wxjs_environment === 'miniprogram') {
                wx.miniProgram.postMessage({
                    data: {
                        wxData: wxData
                    }
                })
            }
        }

        // 判断小程序内js的SDK是否已加载成功，未成功添加监听成功的函数，成功执行miniProgramWebviewReady
        if (!window.WeixinJSBridge || !WeixinJSBridge.invoke) {
            document.addEventListener('WeixinJSBridgeReady', miniProgramWebviewReady, false)
        } else {
            miniProgramWebviewReady()
        }

        tcb.bindEvent(document.body, {
            // 处理小程序中商品跳转链接
            '.flash-product-list .p-item': function (e) {
                e.preventDefault()

                var $me = $(this),
                    url = $me.attr('data-href'),
                    miniapp_url = ''

                if (window.__wxjs_environment === 'miniprogram') {
                    var url_query = tcb.queryUrl(url)

                    if ((/.*\/youpin\/product\/\d+\.html.*/).test(url)) {

                        var product_id = url.split('.html')[0].split('/').pop()
                        miniapp_url = '/pages/detail/detail?product_id=' + product_id
                    } else {
                        miniapp_url = '/pages/search-result/search-result'
                    }

                    wx.miniProgram.navigateTo({
                        url: tcb.setUrl(miniapp_url, url_query)
                    })
                } else {
                    window.location.href = url
                }
            }
        })

        // 输出秒杀商品数据
        function renderFlashProductList() {
            $.get('/youpin/doGetFlashSaleGoods', function (res) {
                if (!res.errno) {
                    var flash_list = res.result.flash_list || []
                    if (flash_list && flash_list.length > 0) {
                        var tmpl_fn = $.tmpl($.trim($('#JsMYoupinFlashProductListTpl').html())),
                            tmpl_str = tmpl_fn({
                                'flash_list': flash_list
                                // 'params': window.__PARAMS
                            })

                        $('.flash-product-list').html(tmpl_str)

                        initScroll({
                            $container: $('.flash-container'),
                            item_class: '.p-item',
                            // item_margin: '0.05',
                            inner_padding: '.1'
                        })
                    } else {
                        $('.block-flash').hide()
                    }
                }
            })
        }

        function initScroll(options) {
            var Root = tcb.getRoot(),
                ScrollFactory = Root.ScrollFactory,
                $container = options.$container,
                item_margin = options.item_margin || 0,
                inner_padding = options.inner_padding || 0

            var scroller

            if ($container && $container.length > 0) {

                var $containerInner = $container.find('.container-inner'),
                    $item = $container.find(options.item_class),
                    $flashNav = $container.find('.flash-nav'),
                    $flashNavInner = $flashNav.find('.inner')

                var container_width = 0, // $container 宽度
                    inner_width = 0, // $containerInner 宽度
                    nav_width = 0, // $flashNav 宽度
                    nav_inner_width = 0 // $flashNavInner 宽度

                tcb.lazyLoadImg(0, $container)  // 图片lazy

                scroller = new ScrollFactory({
                    $Container: $container,
                    $Inner: $containerInner,
                    options: {
                        scrollingX: true,
                        scrollingY: false
                    },
                    afterTouchStart: function (e) {
                        container_width = $container.width()
                        inner_width = $containerInner.width()
                        nav_width = $flashNav.width()
                        nav_inner_width = $flashNavInner.width()
                        // console.log(container_width, inner_width, nav_width, nav_inner_width)
                    },
                    running: function (left, top, zoom, $el, setTranslateAndZoom) {
                        setTranslateAndZoom($el[0], left, top, zoom)

                        //滚动条nav
                        $flashNavInner.css('left', left / (inner_width - container_width) * (nav_width - nav_inner_width) + 'px')
                    }
                })

                // 重置$containerInner宽度
                function resize() {
                    // var inner_width = 0 // $containerInner 宽度
                    var html_font_size = (window.innerWidth > 720 ? 720 : window.innerWidth) * 100 / 320
                    tcb.each($item, function (i, item) {
                        var $item = $(item)
                        // item间margin
                        inner_width += $item.width() + item_margin * html_font_size
                    })
                    // 外部元素的padding
                    inner_width += inner_padding * html_font_size
                    $containerInner.css({
                        width: inner_width + 2 + 'px'//加2px避免rem计算有误差导致宽度不够
                    })
                    scroller.setDimensions()
                }

                resize()

            }
            return scroller
        }

        // 倒计时
        function startCountdown() {
            var $target = $('.block-flash .js-flash-countdown'),
                currentTime = Date.parse(window.curtime ? window.curtime.replace(/-/g, '/') : '') || Date.now(),
                NextDate = new Date(currentTime + 86400000),
                targetTime = (new Date(NextDate.getFullYear(), NextDate.getMonth(), NextDate.getDate())).getTime()

            function loopCountdown(tTime, cTime, $el) {
                Bang.startCountdown(tTime, cTime, $el, {
                    'end': function () {
                        cTime = tTime
                        tTime = cTime + 86400000

                        loopCountdown(tTime, cTime, $el)
                    }
                })
            }

            loopCountdown(targetTime, currentTime, $target)
        }

        function init() {
            renderFlashProductList()
            startCountdown()
        }

        init()

        var __Cache = {
            pn: 0,
            page_size: 10,

            maxPage: -1,
            is_loading: false,
            is_end: false,
            is_force_load: true
        }

        // 尾货清仓商品列表
        loadProductList()

        function loadProductList() {
            var $win = tcb.getWin(),
                $body = $('body'),
                $tpl = $('#JsMHdClearanceSaleProductListTpl'),
                $target = $('.clearance-sale-product-list')

            $win.on('scroll load', tcb.runDelay(function (e) {
                var cacheData = __Cache

                var // 补偿值
                    fix_padding = 120,
                    // 加载更多的临界值[滚动条位置+窗口高度+补偿值]
                    loading_threshold = $win.scrollTop() + $win.height() + fix_padding

                if (loading_threshold < $body[0].scrollHeight && !cacheData['is_force_load']) {
                    return
                }

                cacheData['is_force_load'] = false

                if (cacheData['is_loading'] || cacheData['is_end']) {
                    return
                }
                cacheData['is_loading'] = true
                addProductLoadingHtml($target)
                window.Bang.renderProductList({
                    $tpl: $tpl,
                    $target: $target,
                    request_url: window.__MHOST2 + '/huodong/doGetDaShuaiMaiProductList',
                    request_params: {
                        pn: cacheData['pn'],
                        page_size: cacheData['page_size']
                    },
                    col: 1,
                    list_params: window.__PARAMS,
                    is_append: true,
                    lazy_load: false,
                    complete: function (result, $target) {
                        cacheData['is_loading'] = false

                        if (__Cache['maxPage'] == -1) {
                            __Cache['maxPage'] = Math.ceil(50 / cacheData['page_size']) - 1
                        }
                        __Cache['pn'] = cacheData['pn'] + 1

                        if (__Cache['pn'] > __Cache['maxPage'] || !__Cache['maxPage']) {
                            __Cache['is_end'] = true
                            addProductNoMoreHtml($target)
                        }

                        removeProductLoadingHtml($target)
                    }
                })
            }, 150, 300))

            // 添加商品加载ing的html显示
            function addProductLoadingHtml($target, is_prev) {
                $target = $target || $('body')
                var direction_class = is_prev ? 'list-loading-prev' : 'list-loading-next'

                var $Loading = $target.find('.' + direction_class)
                if ($Loading && $Loading.length) {
                    return $Loading
                }
                var
                    img_html = '<img class="list-loading-img" src="https://p.ssl.qhimg.com/t01ba5f7e8ffb25ce89.gif" style="width: .2rem;">',
                    loading_html = '<div class="list-loading ' + direction_class + '" style="margin: .12rem 0;color: #fff;text-align: center;">' + img_html + '<span class="list-loading-txt">加载中...</span></div>'

                return is_prev ? $(loading_html).prependTo($target) : $(loading_html).appendTo($target)
            }

            // 移除商品加载ing的html
            function removeProductLoadingHtml($target, is_prev) {
                $target = $target || $('body')
                var direction_class = is_prev ? 'list-loading-prev' : 'list-loading-next'

                var $Loading = $target.find('.' + direction_class)
                if ($Loading && $Loading.length) {
                    $Loading.remove()
                }
            }

            // 添加商品 没有更多 的html显示
            function addProductNoMoreHtml($target) {
                $target = $target || $('body')

                var $NoMore = $target.find('.row-product-no-more')

                if ($NoMore && $NoMore.length) {
                    return
                }
                var no_more_html = '<div style="margin: .12rem 0;color: #fff;text-align: center;">抱歉，这里没有找到更多商品了~ </div>'

                $target.append(no_more_html)
            }

        }

        // 清仓场次信息
        function getTimeListData(now) {
            if (!now) {
                return console.log('当前时间必须有')
            }
            var nowDate = new Date(now),
                year = nowDate.getFullYear(),
                month = nowDate.getMonth(),
                day = nowDate.getDate(),
                today0 = (new Date(year, month, day)).getTime(),
                today8 = today0 + 8 * 60 * 60 * 1000,
                today14 = today0 + 14 * 60 * 60 * 1000,
                today18 = today0 + 18 * 60 * 60 * 1000,
                today22 = today0 + 22 * 60 * 60 * 1000,
                today_arr = [
                    {
                        time: today8,
                        textTime: '8:00',
                        textDesc: '即将开始',
                        status: 1
                    },
                    {
                        time: today14,
                        textTime: '14:00',
                        textDesc: '即将开始',
                        status: 1
                    },
                    {
                        time: today18,
                        textTime: '18:00',
                        textDesc: '即将开始',
                        status: 1
                    },
                    {
                        time: today22,
                        textTime: '22:00',
                        textDesc: '即将开始',
                        status: 1
                    }
                ],
                hot_pos = -1

            tcb.each(today_arr, function (i, item) {
                if (now < item.time && hot_pos === -1) {
                    if (i == 0) {
                        hot_pos = today_arr.length - 1
                    } else {
                        hot_pos = i - 1
                    }
                }
            })

            var target_time = today_arr[0].time

            if (hot_pos === -1) {
                hot_pos = today_arr.length - 1
                target_time = target_time + 24 * 60 * 60 * 1000
            }
            today_arr[hot_pos].textDesc = '抢购中'
            today_arr[hot_pos].status = 0
            target_time = today_arr[hot_pos + 1]
                ? today_arr[hot_pos + 1].time
                : target_time

            while (hot_pos--) {
                today_arr[hot_pos].textDesc = '已售罄'
                today_arr[hot_pos].status = -1
            }

            return {
                timeList: today_arr,
                target_time: target_time
            }
        }

        function renderTimeListData(now) {
            now = now || window.__NOW || (new Date()).getTime() //|| (new Date(2017,11,17,21,59,50)).getTime()

            var timeListData = getTimeListData(now),
                timeList = timeListData['timeList'],
                target_time = timeListData['target_time']

            var html_fn = $.tmpl(tcb.trim($('#JsMHdClearanceSaleCountdownTabTpl').html())),
                html_st = html_fn({
                    timeList: timeList
                })

            $('.tab-list').html(html_st)

            Bang.startCountdown(target_time, now, $('#CountdownId'), {
                end: function () {
                    __Cache['pn'] = 0
                    __Cache['maxPage'] = -1
                    __Cache['is_loading'] = false
                    __Cache['is_end'] = false
                    __Cache['is_force_load'] = true

                    var $win = tcb.getWin()
                    $win.trigger('load')
                    renderTimeListData(target_time)
                }
            })
        }

        renderTimeListData()
    })
}()
