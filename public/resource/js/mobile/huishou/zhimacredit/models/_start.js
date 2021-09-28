!function (global) {
    if (window.__PAGE !== 'zhimacredit-models') {
        return
    }

    var
        Root = tcb.getRoot (),
        i = Root.Index

    // 初始化评估页面
    // DOM READY at callback
    i.init ({
        // 前置处理
        before : function () {
            i.data.url_query = tcb.queryUrl (window.location.search) || {}
            if (i.data.url_query['_global_data']){
                try{
                    i.data.url_query['_global_data'] = $.parseJSON(tcb.html_decode(i.data.url_query['_global_data']))
                } catch(ex){
                    i.data.url_query['_global_data'] = {}
                }
            } else {
                i.data.url_query['_global_data'] = {}
            }

            // 加载render函数表
            i.page.addRender (i.renderMap)
            // 加载event函数表
            i.page.addEvent (i.eventMap)

        },
        // DOM READY之后
        after  : function () {
            // 初始化品牌的滚动事件
            i.handle.initBrandScroll()

            // 初始化页面滚动功能
            i.scroll.init (i.getContainer (), {
                snapping   : true,
                scrollingX : true,
                bouncing   : false
            })

            // 生成路由实例
            i.router_inst = i.router (i.route_map)

            //// ***** hash路由情况下这很重要,用以将hash route和page建立映射*****
            //// 根据路由列表,生成路由地址和页面唯一的映射关系
            //i.page.generateIds (i.router_inst.list ())

            // 初始化路由功能
            i.router_inst.init ()

        }
    })

} (this)

