// 数据处理函数
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    tcb.mix (a, {

        // 处理初始化数据

        handleInitData : handleInitData,

        // 根据型号id,获取针对当前机型的评估项数据

        doGetAssessOptionsData : doGetAssessOptionsData
    })

    // =================================================================
    // 公共接口 public
    // =================================================================

    // 处理初始化数据
    function handleInitData () {

        // 具体机型数据放在最前边处理
        __handleModelList ()

        __handleOptionsScreenDetected ()
        __handleOptionsDetected ()
        __handleOptionsMemDetected ()

        // 前置显示的专有评估组id集合
        // 4为保修期选项组
        // === sku评估组和专属评估组放入一页显示，那么不再需要前置专属评估组了 ===
        a.cache(a.KEY_PRE_SPECIAL_GROUP_IDS, ['4'])
    }

    // 根据型号id,获取针对当前机型的评估项数据
    // (默认系统已经cache了app自动检测过的选项,以及机型的内存属性项)
    function doGetAssessOptionsData (model_id, callback) {
        var optionsDetected = a.cache (a.KEY_OPTIONS_DETECTED) || '',
            optionsMemDetected = a.cache (a.KEY_OPTIONS_MEM_DETECTED) || ''

        var sku_ready = false,
            special_ready = false,
            countdown = 5000

        // 获取型号sku评估项
        a.getModelSkuOptions ({
            model_id           : model_id,
            memory_attr_val_id : optionsMemDetected
        }, function () {
            sku_ready = true
        })

        // 获取型号特有评估项
        a.getModelSpecialOptions ({
            model_id       : model_id,
            assess_options : optionsDetected
        }, function () {
            special_ready = true
        })

        // if (sku_ready && special_ready) {
        //     typeof callback === 'function' && callback ()
        // } else {
        //     countdown -= 100
        //     setTimeout (__ensureDataReady, 100)
        // }
        __ensureDataReady()

        // 确保数据获取成功
        function __ensureDataReady () {
            if (sku_ready && special_ready) {
                a.getNotebookAutoCheckData(function (data) {
                    if (data) {
                        // 获取笔记本验机数据，并且有数据

                        // 预评估的评估项id集合（不包括sku）
                        var specialOptionIdComb = []
                        // var skuList = [] // 去除输出预评估的sku信息
                        // 预评估的评估项sku id集合（只有sku）
                        var skuOptionIdComb = []
                        tcb.each(data.pingguList || {}, function (k, val) {
                            specialOptionIdComb.push(val.toString())
                        })
                        tcb.each(data.skuInfoList || {}, function (k, val) {
                            skuOptionIdComb.push(val.toString())
                        })
                        // tcb.each(data.skuList || {}, function (k, val) {
                        //     skuList.push(val)
                        // })
                        a.cache.ex(a.KEY_PRE_ASSESS_SPECIAL_OPTION_ID_COMB, specialOptionIdComb)
                        a.cache.ex(a.KEY_PRE_ASSESS_SKU_OPTION_ID_COMB, skuOptionIdComb)
                        // a.cache.ex(a.KEY_PRE_ASSESS_SKU_LIST, skuList)
                    }
                    typeof callback === 'function' && callback()
                })
            } else if (countdown < 0) {
                // 获取机型下数据失败了,那么先干掉cache的model_id,
                // 否则由于model_id被cache,就默认当作model_id相关的选项数据已经获取成功
                a.cache.setModelId('')

                $.dialog.toast('评估项获取失败，请重新尝试或刷新页面', 2000)

                return
            } else {
                countdown -= 10
                setTimeout(__ensureDataReady, 10)
            }
        }
    }


    // =================================================================
    // 私有接口 private
    // =================================================================

    // app检测过的检测项
    function __handleOptionsDetected () {
        var
            optionsDetected = global.__OPTIONS_DETECTED || ''

        a.cache (a.KEY_OPTIONS_DETECTED, optionsDetected)
    }

    // 屏幕功能检测结果
    // 有检测结果就正常存储，否则存储为空数组
    function __handleOptionsScreenDetected () {
        var
            ret = [],
            optionsScreenDetected = (!global.__OPTIONS_SCREEN_DETECTED || global.__OPTIONS_SCREEN_DETECTED === 'null')
                ? '[]'
                : global.__OPTIONS_SCREEN_DETECTED

        try {
            optionsScreenDetected = $.parseJSON (optionsScreenDetected)
        } catch (ex) {
            optionsScreenDetected = []
        }

        var
            screenDetectTypeMap = {
                screen_display : [ 0,
                                   '显示' ],
                screen_touch   : [ 1,
                                   '触摸' ]
            }

        $.each (optionsScreenDetected, function (k, item) {
            var
                index = screenDetectTypeMap[ k ][ 0 ],
                group_title = screenDetectTypeMap[ k ][ 1 ]

            ret[ index ] = {
                group_title : group_title,
                option_key  : k,
                option_name : item
            }
        })

        a.cache (a.KEY_OPTIONS_SCREEN_DETECTED, ret)
    }

    // 检测项：内存id
    function __handleOptionsMemDetected () {
        var optionsMemDetected = global.__OPTIONS_MEM_DETECTED || ''

        a.cache (a.KEY_OPTIONS_MEM_DETECTED, optionsMemDetected)
    }

    // 回收详细机型列表
    function __handleModelList () {
        var
            modelList = global.__MODEL_LIST || '[]',
            len = 0

        modelList = $.parseJSON (modelList)
        len = modelList ? modelList.length : 0

        // 机型列表
        a.cache (a.KEY_MODELS, modelList)
        // 机型列表的长度
        a.cache (a.KEY_MODELS_COUNT, len)
    }

} (this)
