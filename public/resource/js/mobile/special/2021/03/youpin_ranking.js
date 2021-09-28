!function () {
    var wxData = {}

    // 微信分享的数据
    wxData = {
        'title': '优品排行-精选好物 享生活态度',
        'desc': '精选好物排行大优惠，机不可失，买到就是赚到',
        'link': window.location.protocol + '//' + window.location.host + window.location.pathname,
        'imgUrl': 'https://p5.ssl.qhimg.com/t016f878a293038c1a6.png',
        'success': tcb.noop, // 用户确认分享的回调
        'cancel': tcb.noop // 用户取消分享
    }

    if (typeof wx !== 'undefined') {
        wx.ready(function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage && wx.onMenuShareAppMessage(wxData)
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline && wx.onMenuShareTimeline(wxData)
            //分享到QQ
            wx.onMenuShareQQ && wx.onMenuShareQQ(wxData)
            //分享到QZone
            wx.onMenuShareQZone && wx.onMenuShareQZone(wxData)

            wx.updateAppMessageShareData && wx.updateAppMessageShareData(wxData)
            wx.updateTimelineShareData && wx.updateTimelineShareData(wxData)
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
            // 切换tab
            '.block-tab .tab-item': function (e) {
                e.preventDefault()

                var $me = $(this),
                    category_id = $me.attr('data-category-id')

                $me.addClass('tab-item-active').siblings('.tab-item').removeClass('tab-item-active')
                renderRankingProductList(category_id)
            },
            // 处理小程序中商品跳转链接
            '.block-product-list .p-item': function (e) {
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

        // 输出优品排行商品数据
        function renderRankingProductList(category_id) {
            $.get('/overAllForSell/listActivity?category_id=' + category_id, function (res) {
                if (!res.errno) {
                    var product_list = res.result || []
                    if (product_list && product_list.length > 0) {
                        var tmpl_fn = $.tmpl($.trim($('#JsMYoupinRankingProductListTpl').html())),
                            tmpl_str = tmpl_fn({
                                'product_list': product_list,
                                'params': window.__PARAMS
                            })

                        $('.block-product-list').html(tmpl_str)
                    } else {
                        $('.block-product-list').hide()
                    }
                }
            })
        }

        function init() {
            $('.block-tab .tab-item').eq(0).trigger('click')
        }

        init()
    })
}()
