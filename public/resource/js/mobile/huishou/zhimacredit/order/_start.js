!function (global) {
    // 非下单页,直接返回不做任何处理
    if (window.__PAGE !== 'zhimacredit-order') {

        return
    }

    var Root = tcb.getRoot (),
        o = Root.Order

    // 初始化评估页面
    // DOM READY at callback
    o.init ({
        // 前置处理
        before : function () {
            o.data.url_query = tcb.queryUrl (window.location.search)
        },
        // DOM READY之后
        after  : function () {}
    })

} (this)



