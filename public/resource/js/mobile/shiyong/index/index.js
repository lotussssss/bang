$ (function () {
    var
        $PageIndex = $ ('.page-shiyong-index')
    if (!($PageIndex && $PageIndex.length)) {
        return
    }

    var
        Zu = window.Zu

    // 事件绑定
    tcb.bindEvent ('.page-shiyong-index', {
        // 属性选择弹层触发器
        '.js-attr-selected-trigger' : function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                model_id = $me.attr ('data-id')

            if($me.find('.btn-rent-disabled').length){
                return
            }

            // 设置型号id
            Zu.setModelId (model_id)
            // 异步获取商品列表
            Zu.getModelBucketDataAsync (function (modelBucketData) {


                Zu.showProductUI (modelBucketData, $me.attr ('data-title'))

            })

            //// 添加事件统计
            //var
            //    statistic_event_category = 'H5租赁',
            //    statistic_event_action = '',
            //    statistic_event_label = ''
            //if (model_id == '6') {
            //    statistic_event_action = '租6s'
            //    statistic_event_label = '点击“立即抢租”6s'
            //} else {
            //    statistic_event_action = '租6sp'
            //    statistic_event_label = '点击“立即抢租”6sP'
            //}
            //
            //var
            //    statistic_event = [ '_trackEvent',
            //                        statistic_event_category,
            //                        statistic_event_action,
            //                        statistic_event_label,
            //                        '',
            //                        '' ]
            //tcb.statistic (statistic_event)
        }

    })

    //// 提前获取商品信息....免得点击的时候才请求导致交互滞后
    //var
    //    PRODUCT_LIST = window._PRODUCT_LIST || []
    //$.each(PRODUCT_LIST, function(i, item){
    //    Zu.setModelId (item['model_id'])
    //
    //    Zu.getModelBucketDataAsync ()
    //})
    //
    //Zu.setModelId (6)
    //Zu.getModelBucketDataAsync (function () {
    //    Zu.setModelId (8)
    //
    //    Zu.getModelBucketDataAsync (function () {
    //
    //    })
    //})

})