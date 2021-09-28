!function (global) {
    // 非评估页面,直接返回不做任何处理
    if (window.__PAGE!=='assess'){
        return
    }

    var
        Root = tcb.getRoot (),
        a = Root.Assess

    // 初始化评估页面
    // DOM READY at callback
    a.init ({
        // 前置处理
        before : function () {
            if (tcb.queryUrl(window.location.search, '_global_data')){
                // 修修哥手动检测，清除sessionStorage，避免重复检测时候选了不同默认值产生怪异情况
                a.cache.doCleanStorage()
            }
            // 处理初始化数据
            a.handleInitData ()
            // 恢复storage的评估数据
            // (确保在 a.handleInitData 之后执行,否则初始数据处理可能会有问题)
            a.cache.doRecoverAssessData ()

            // sku属性在view中的序号存储key
            var index_in_view = 1

            // 如果有屏幕检测项，加上屏幕检测项的项目数
            var
                screenDetected=a.cache(a.KEY_OPTIONS_SCREEN_DETECTED)
            if (screenDetected&&screenDetected.length){
                index_in_view += screenDetected.length
            }
            // 可选机型数量大于1，那么在加上选机型的步骤
            if (a.cache (a.KEY_MODELS_COUNT) > 1) {
                index_in_view += 1
            }
            // sku属性在view中的序号存储key
            a.cache (a.KEY_SKU_START_INDEX_IN_VIEW, index_in_view)
        },
        // DOM READY之后
        after  : function () {

            // 初始化页面滚动功能
            a.scroll.init (a.getContainer (),{
                scrollingX : true,
                bouncing   : false
            })

            // 生成路由实例
            a.router_inst = a.router(a.route_map)

            //======= 此处被干掉，直接将生成页面id的功能加入route_map中实现
            //// ***** hash路由情况下这很重要,用以将hash route和page建立映射*****
            //// 根据路由列表,生成路由地址和页面唯一的映射关系
            //a.page.generateIds(a.router_inst.list())

            // 初始化路由功能
            a.router_inst.init()
        }
    })

} (this)

