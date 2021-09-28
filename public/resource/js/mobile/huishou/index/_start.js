!function (global) {
    // 确保回收首页才执行
    if (window.__PAGE !== 'index') {
        return
    }

    var
        Root = tcb.getRoot(),
        i = Root.Index

    // 初始化评估页面
    // DOM READY at callback
    i.init({
        // 前置处理
        before: function () {
            i.data.url_query = tcb.queryUrl(window.location.search) || {}
            if (i.data.url_query['_global_data']) {
                try {
                    i.data.url_query['_global_data'] = $.parseJSON(tcb.html_decode(i.data.url_query['_global_data']))
                } catch (ex) {
                    i.data.url_query['_global_data'] = {}
                }
            } else {
                i.data.url_query['_global_data'] = {}
            }

            // 加载render函数表
            i.page.addRender(i.renderMap)
            // 加载event函数表
            i.page.addEvent(i.eventMap)

        },
        // DOM READY之后
        after: function () {
            // 初始化品牌的滚动事件
            i.handle.initBrandScroll()

            // 初始化页面滚动功能
            i.scroll.init(i.getContainer(), {
                snapping: true,
                scrollingX: true,
                bouncing: false
            })

            // 生成路由实例
            i.router_inst = i.router(i.route_map)

            //// ***** hash路由情况下这很重要,用以将hash route和page建立映射*****
            //// 根据路由列表,生成路由地址和页面唯一的映射关系
            //i.page.generateIds (i.router_inst.list ())

            // if (window.__IS_SUNING_YUNDIAN_MINIAPP) {
            var hash = tcb.trim(tcb.trim(tcb.trim(window.location.hash, '#'), '!'), '/')
            if ((!hash || hash.indexOf('brand/')===-1) && i.data.url_query && i.data.url_query.brand_id) {
                hash = '#!/brand/' + i.data.url_query.brand_id
                i.data.url_query.pid && (hash += '/pid/' + i.data.url_query.pid)
                window.location.hash = hash
            } else if (!hash && window.__IS_PARTNER_FENGXIU && window.performance.navigation.type !== 2) {
                window.location.hash='#!/brand/10'
            }
            // }

            // 初始化路由功能
            i.router_inst.init()
        }
    })

}(this)

