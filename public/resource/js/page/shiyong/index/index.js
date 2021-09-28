$ (function () {
    var
        $PageIndex = $ ('.page-shiyong-index')
    if (!($PageIndex && $PageIndex.length)) {
        return
    }

    var
        Zu = window.Zu

    // 展示商品选择UI界面
    function showProductUI (modelBucketData, product_title_short) {
        var
            productDefault = modelBucketData[ 'product_default' ],
            product_id = productDefault[ 'product_id' ],
            UIData = {
                // 商品基本信息[默认选中第一组]
                'product'             : productDefault,
                // 属性组
                'attr_groups'         : modelBucketData[ 'attr_groups' ],
                // 推荐租期
                'treaty_days_promo'   : modelBucketData[ 'treaty_days_promo' ],
                // 默认选中租期
                'treaty_days_default' : modelBucketData[ 'treaty_days_promo' ][ 0 ][ 'day' ],
                // 租期
                'treaty_days'         : modelBucketData[ 'treaty_days' ],
                // 商品短名称
                'product_title_short' : product_title_short
            }

        // 输出商品ui
        Zu.renderProductUI (UIData)

        var // 选中的属性组合
            selectedAttrGroup = modelBucketData[ 'product_map_attr' ][ product_id ],
            // 所有属性组合
            allAttrGroup = modelBucketData[ 'product_attr_group' ],
            // 所有属性列表
            allAttrList = modelBucketData[ 'attr_group_ids' ]

        // 设置商品属性ui状态
        Zu.setProductAttrUI (selectedAttrGroup, allAttrGroup, allAttrList)

        // 设置商品ui状态信息
        Zu.setProductUIStatusData ({
            // 选中的属性组合
            selectedAttrGroup : selectedAttrGroup,
            // 所有属性组合
            allAttrGroup      : allAttrGroup,
            // 所有属性列表
            allAttrList       : allAttrList,
            // 商品数据
            productData       : productDefault,
            // 选中的租期方案
            selectedTreatyDay : UIData[ 'treaty_days_default' ],
            // 商品有无库存
            productNoneStock  : productDefault[ 'stock_nums' ] > 0
                ? false
                : true
        })
    }

    // 绑定首页事件
    tcb.bindEvent (document.body, {
        // 抢租指定型号手机
        '.liji-qiangzu'      : function (e) {
            e.preventDefault ()

            var
                $me = $ (this),
                model_id = $me.attr ('data-id')

            if ($me.hasClass('liji-qiangzu-disabled')){

                return
            }

            // 设置型号id
            Zu.setModelId (model_id)
            // 异步获取商品列表
            Zu.getModelBucketDataAsync (function (modelBucketData) {

                showProductUI (modelBucketData, $me.attr ('data-title'))

                $me.closest ('.block').fadeOut ()
            })

            //// 添加事件统计
            //var
            //    statistic_event_category = 'pc租赁',
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

        },
        // 返回重选型号
        '.btn-go-back-model' : function (e) {
            e.preventDefault ()

            $ ('.block0').fadeIn ()
            //$('.block1 .block-inner').html('')
        }
    })

    // 绑定商品相关交互
    Zu.bindProductEvent ()

    //// 提前获取商品信息....免得点击的时候才请求导致交互滞后
    //var
    //    PRODUCT_LIST = window._PRODUCT_LIST || []
    //$.each(PRODUCT_LIST, function(i, item){
    //    Zu.setModelId (item['model_id'])
    //
    //    Zu.getModelBucketDataAsync ()
    //})
    //Zu.setModelId (6)
    //Zu.getModelBucketDataAsync (function () {
    //    Zu.setModelId (8)
    //
    //    Zu.getModelBucketDataAsync (function () {
    //
    //    })
    //})

})