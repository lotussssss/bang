!function(){
    if (window.__PAGE !== 'xxg-special-shop-youji-hs') {
        return
    }

    // 订单列表相关信息
    var __PageCache = {
        pn : 0,
        pn_max : 0,
        page_size: 20,
        is_loading: false,
        is_end: false,
        load_padding: 50
    }

    $ (function () {

        //获取及输出订单列表
        function getShopYoujiHsXxgOrderList(options) {
            options = options ||{}
            var pn = parseInt(options.pn || __PageCache.pn, 10) || 0,
                page_size = options.page_size || __PageCache.page_size,
                params = {
                    pn: pn,
                    page_size: page_size
                },
                order_mobile_id = tcb.queryUrl(window.location.search, 'order_mobile_id'),
                search_status = tcb.queryUrl(window.location.search, 'search_status'),
                search_status_sets = ['0', '10', '20', '30', '40']

            search_status = tcb.inArray(search_status, search_status_sets) > -1 ? search_status : 0
            params['search_status'] = search_status

            if(order_mobile_id){
                params['order_mobile_id'] = order_mobile_id
            }

            // 加载中
            __PageCache.is_loading = true
            $.get('/m/doGetXxgOrderListForYouji',params,function (res) {
                try {
                    res = $.parseJSON(res)

                    if(!res['errno']){
                        // 移除商品加载ing的html
                        uiRemoveLoadingHtml()

                        var order_list = res['result']['order_list' ],
                            total_count = res['result']['total' ],
                            $List

                        if (!__PageCache.pn_max){

                            __PageCache.pn_max = Math.floor(total_count/__PageCache.page_size)
                        }

                        if (order_list && order_list.length){
                            var html_fn = $.tmpl($.trim($('#JsShopYoujiHsXxgOrderListTpl').html())),
                                html_str = html_fn({
                                    'list':order_list
                                })

                            $List = $('.block-order-list')
                            $List.append(html_str)

                            // 添加加载ing的html显示
                            uiAddLoadingHtml($List)

                            __PageCache.pn = pn
                        }

                        if (__PageCache.pn>=__PageCache.pn_max){
                            __PageCache.is_end = true

                            // 移除商品加载ing的html
                            uiRemoveLoadingHtml()
                            $List = $List || $('.block-order-list')
                            uiAddNoMoreHtml($List)
                        }
                    }
                }catch (ex){}

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
            var
                $Loading = $('#UILoading')

            if ($Loading && $Loading.length) {

                return
            }
            var
                img_html = '<img class="ui-loading-img" src="https://p.ssl.qhimg.com/t01ba5f7e8ffb25ce89.gif">',
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

        // 绑定事件
        function bindEvent(){

            var $win = tcb.getWin (),
                $body = $ ('body'),
                //可见区域的高度
                viewH = $win.height (),
                scrollHandler = function (e) {
                    // 已经滚动加载完所有订单，那么干掉滚动事件
                    if (__PageCache.is_end){
                        return $win.off('scroll', scrollHandler)
                    }
                    // 加载中，不再重复执行加载
                    if (__PageCache.is_loading){
                        return
                    }
                    //可滚动内容的高度(此值可变，只能放在scroll滚动时动态获取)
                    var scrollH = $body[ 0 ].scrollHeight,
                        // 计算可滚动最大高度，即滚动到时了最底部
                        maxSH = scrollH - viewH,
                        //滚动条向上滚出的高度
                        st = $win.scrollTop ()

                    if (st >= (maxSH - __PageCache.load_padding)){
                        getShopYoujiHsXxgOrderList({
                            pn : __PageCache.pn+1
                        })
                    }
                }
            $win.on ('scroll', scrollHandler)
        }


        // 页面初始化入口函数
        function init(){
            // 绑定事件
            bindEvent()

            // 加载首页
            getShopYoujiHsXxgOrderList()
        }
        init()

    })

}()