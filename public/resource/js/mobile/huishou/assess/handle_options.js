// 评估项的处理
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    tcb.mix (a, {
        //
        // 接口方法
        //

        /**
         * 评估
         */
        doAssess : doAssess,

        /**
         * 获取型号sku选项
         */
        getModelSkuOptions : getModelSkuOptions,

        /**
         * 获取型号sku确定后的专有评估选项
         */
        getModelSpecialOptions : getModelSpecialOptions,

        /**
         * 获取sku组集合
         */
        getSkuGroups : getSkuGroups,

        /**
         * 获取专有评估组集合
         */
        getSpecialGroups : getSpecialGroups,

        /**
         * 获取前置专有评估组（当前只有 保修情况评估组）
         */
        getPreSpecialGroups : getPreSpecialGroups,

        getOfficialDiffData : getOfficialDiffData,

        // 获取笔记本自动验机数据
        getNotebookAutoCheckData : getNotebookAutoCheckData

    })

    // =================================================================
    // 公共接口 public
    // =================================================================

    /**
     * 执行评估
     * @param options
     */
    function doAssess (options) {
        var
            fail = typeof options[ 'fail' ] === 'function'
                ? options[ 'fail' ]
                : a.noop,
            before = typeof options[ 'before' ] === 'function'
                ? options[ 'before' ]
                : a.noop,
            after = typeof options[ 'after' ] === 'function'
                ? options[ 'after' ]
                : a.noop,
            error = typeof options[ 'error' ] === 'function'
                ? options[ 'error' ]
                : a.noop

        // 评估验证失败,不显示页面提示效果,
        // 执行失败回调
        if (!a.valid.assess (true)) {

            return fail ()
        }

        var checked_sku_comb = a.cache.doGetCheckedComb (true),
            sku_option_id_comb_map = a.cache.ex (a.KEY_SKU_ATTR_MAP) || {},

            checked_special_comb = a.cache.doGetCheckedComb (false),
            detected_special_comb = a.cache.ex (a.KEY_FILTERED_DETECTED_OPTION_COMB) || '',
            special_comb = []

        special_comb.push (checked_special_comb[ 0 ], checked_special_comb[ 1 ].join (','))
        if (detected_special_comb) {
            special_comb.push (detected_special_comb)
        }

        //sub_options:90,94,106,10,16,20,30,34,48,52,56,84,6,62,78,38
        //sku_group_id:121
        //model_id:8
        var data = {
                sku_group_id : sku_option_id_comb_map[ checked_sku_comb.join (',') ],
                sub_options  : special_comb.join (','),
                model_id     : a.cache.getModelId ()
            }
        if (window.__IMEI){
            data['imei'] = window.__IMEI
        }
        var query = tcb.queryUrl(window.location.search)
        var global_data = JSON.parse(tcb.html_decode(decodeURIComponent(query._global_data||'{}')))
        if (global_data && global_data.shop_id) {
            data['shop_id'] = global_data.shop_id
            data['apple_ces_hs'] = 1
        }
        if (query['pre_assess']) {
            data['arc_assess_key'] = query['pre_assess']
        }

        // 评估
        __assess (data, before, after, error)
    }

    // 获取型号sku选项
    // params : 获取sku选项组的参数,一共两个参数
    //          model_id -> 必选
    //          memory_attr_val_id -> 可选
    function getModelSkuOptions (params, callback, error) {
        var
            sku_attr_cate = a.cache.ex (a.KEY_SKU_ATTR_CATE)

        if (sku_attr_cate) {
            // 已经有了SKU评估项

            typeof callback === 'function' && callback ()
        } else {
            // 获取型号sku评估项
            __modelOptionsGetter ({
                type     : 'sku',
                params   : params,
                callback : callback,
                error    : error,
                handle   : __handleModelSkuOptions
            })
        }

    }

    // 获取型号sku确定后的专有评估选项
    // params : 获取专有选项组的参数,一共两个参数
    //          model_id -> 必选
    //          assess_options -> 可选
    function getModelSpecialOptions (params, callback, error) {
        var
            special_options_cate = a.cache.ex (a.KEY_SPECIAL_OPTIONS_CATE)

        if (special_options_cate) {
            // 已经有了SKU评估项

            typeof callback === 'function' && callback ()
        } else {
            __modelOptionsGetter ({
                type     : 'special',
                params   : params,
                callback : callback,
                error    : error,
                handle   : __handleModelSpecialOptions
            })
        }
    }


    // 获取sku组集合
    //      隐含信息为已经选中的sku评估项id的组合
    function getSkuGroups (options) {
        var
            delimiter_id = (options[ 'delimiter_id' ] || '').toString (), // 起始id
            no_active = options[ 'no_active' ] || false, // 是否激活
            checked_comb = a.cache.doGetCheckedComb (true) // 已经选择的sku评估项id组合
        // 预评估的评估项sku id集合（只有sku）
        var preAssessSkuOptionIdComb = a.cache.ex(a.KEY_PRE_ASSESS_SKU_OPTION_ID_COMB) || []

        // 【合并】已选中集合 和 预评估选中的集合
        checked_comb = __mergeSkuCheckedComb(checked_comb, preAssessSkuOptionIdComb)

        // 添加第一个sku组
        var sku_groups = __getFirstSkuGroup (checked_comb, {
                delimiter_id : delimiter_id,
                no_active    : no_active
            })

        // 根据已选的sku属性项组合,往sku组集合中添加更多的sku组(第一组之后的组)
        // 同时在最后做一些特定处理...
        // __addMoreSkuGroupsByCheckedComb 会导致checked_comb和sku_group直接被修改
        sku_groups = __addMoreSkuGroupsByCheckedComb (checked_comb, sku_groups, {
            delimiter_id : delimiter_id,
            no_active    : no_active
        })

        // 重新cache选中的sku属性项id组合
        a.cache.doCacheCheckedComb (checked_comb, true)

        return sku_groups
    }

    // 获取专有评估项
    function getSpecialGroups () {
        var checked_comb = a.cache.doGetCheckedComb (false),// 被选中的选项的组合,false表示special属性
            // 选项组的基本信息列表
            base_info_groups = a.cache.ex (a.KEY_SPECIAL_OPTIONS_CATE),
            // 组的选项集合列表
            options_list = a.cache.ex (a.KEY_SPECIAL_OPTIONS_GROUP_LIST),
            // 可输出的评估项组集合
            groups = [],
            // 混合专有选项
            mix_checked_comb = checked_comb[ 0 ] || '',
            // 专有选项
            special_checked_comb = checked_comb[ 1 ] || [],
            // 预评估选中的，专有选项 和 混合专有选项 集合
            special_n_mix_checked_pre_assess = a.cache.ex(a.KEY_PRE_ASSESS_SPECIAL_OPTION_ID_COMB) || []

        var _global_data = tcb.queryUrl(window.location.search, '_global_data'),
            forceCheckedSet = []
        if (_global_data){
            try{
                _global_data = JSON.parse(tcb.html_decode(decodeURIComponent(_global_data)))
                forceCheckedSet = _global_data['force_checked'] ? _global_data['force_checked'].toString().split(',') : forceCheckedSet
            }catch (ex){tcb.error(ex)}
        }
        if (special_n_mix_checked_pre_assess && special_n_mix_checked_pre_assess.length) {
            forceCheckedSet = forceCheckedSet.concat(special_n_mix_checked_pre_assess)
        }
        forceCheckedSet = a.util.numUnique(forceCheckedSet)

        $.each (base_info_groups, function (i, base_info_group) {
            // 评估组id存在于前置显示的专有评估组id集合内，直接跳过
            if (tcb.inArray (base_info_group[ 'options_cate_id' ].toString (), a.cache (a.KEY_PRE_SPECIAL_GROUP_IDS) || []) > -1) {
                return true
            }
            var
                options = options_list[ i ],
                selected_pos = -1,
                readonly = false,
                collapse = false
            // 由于专有选项的选中组合顺序，可能不是按照组的顺序排列的，
            // 所以需要遍历所有选项来确定是不是有选项在special_checked_comb中存在
            for (var ii = 0; ii < options.length; ii++) {
                selected_pos = tcb.inArray (options[ ii ][ 'option_id' ].toString (), special_checked_comb)
                if (selected_pos > -1) {
                    break
                }
            }
            // 再次遍历options，确认option是否在强制被选中的集合中，
            // 若是有被强制选中的option，那么将次option设置为选中，并且此评估组被设置为readonly状态
            for (var iii = 0; iii < options.length; iii++) {
                if (tcb.inArray (options[ iii ][ 'option_id' ].toString (), forceCheckedSet)>-1){
                    readonly = true
                    if (tcb.inArray(options[iii]['option_id'].toString(), special_n_mix_checked_pre_assess) > -1) {
                        collapse = true
                    }
                    if (selected_pos>-1){
                        special_checked_comb.splice(selected_pos, 1, options[ iii ][ 'option_id' ].toString ())
                    } else {
                        special_checked_comb.push(options[ iii ][ 'option_id' ].toString ())
                        selected_pos = special_checked_comb.length - 1
                    }
                    break
                }
            }
            groups.push (
                a.util.genGroupData ([
                    base_info_group[ 'options_cate_name' ],
                    base_info_group[ 'options_cate_id' ],
                    options,
                    selected_pos > -1 ? special_checked_comb[ selected_pos ] : '',
                    [],
                    {
                        is_sku    : false,
                        no_active : false,
                        readonly  : readonly,
                        collapse  : collapse
                    }
                ])
            )
        })

        // 多组混合选项集合
        var mix_options = a.cache.ex (a.KEY_MIX_OPTIONS),
            default_checked_mix_option_map = a.cache.ex (a.KEY_DEFAULT_CHECKED_MIX_OPTION_MAP),
            default_checked_pos = -1
        mix_checked_comb = mix_checked_comb.split (',')
        for (var i = 0; i < mix_options.length; i++) {
            mix_options[i]['option_id'] = mix_options[i]['option_id'].toString()
            // 先设置混合选项的默认被选中项的id，
            // 后续逻辑可能会重置checked_id
            mix_options[i]['checked_id'] = default_checked_mix_option_map[mix_options[i]['group_id']]['option_id'].toString()

            default_checked_pos = -1
            if (tcb.inArray(mix_options[i]['option_id'], forceCheckedSet) > -1) {
                default_checked_pos = tcb.inArray(mix_options[i]['checked_id'], mix_checked_comb)
                mix_options[i]['checked_id'] = mix_options[i]['option_id']
                if (default_checked_pos > -1) {
                    mix_checked_comb.splice(default_checked_pos, 1, mix_options[i]['checked_id'])
                }
                mix_options[i]['readonly'] = true
            } else if (tcb.inArray(mix_options[i]['checked_id'].toString(), forceCheckedSet) > -1) {
                default_checked_pos = tcb.inArray(mix_options[i]['option_id'], mix_checked_comb)
                if (default_checked_pos > -1) {
                    mix_checked_comb.splice(default_checked_pos, 1, mix_options[i]['checked_id'])
                }
                mix_options[i]['readonly'] = true
            }
        }

        // 将新的选中状态更新cache，以备评估时使用
        a.cache.doCacheCheckedComb ([mix_checked_comb.join(','), special_checked_comb], false)

        if (mix_options && mix_options.length){
            groups.push (
                a.util.genGroupData ([
                    '其他问题（可多选，如无问题请直接点立即评估）',
                    '',
                    mix_options,
                    '',
                    mix_checked_comb && mix_checked_comb.length ? mix_checked_comb : '',
                    {
                        mix       : true,
                        is_sku    : false,
                        no_active : false
                    }
                ])
            )
        }

        return groups
    }

    // 获取前置专有评估组（当前只有 保修情况评估组）
    function getPreSpecialGroups () {
        var
            checked_comb = a.cache.doGetCheckedComb (false),// 被选中的选项的组合,false表示special属性

            // 可输出选项组集合
            groups = [],
            // 专有选项
            special_checked_comb = checked_comb[ 1 ] || []

        // 获取前置专有评估组的基本信息
        var pre_special_base_info_groups = a.cache.ex (a.KEY_PRE_SPECIAL_OPTIONS_CATE) || [],
            // 获取前置专有评估组选项列表
            pre_special_options_list = a.cache.ex (a.KEY_PRE_SPECIAL_OPTIONS_GROUP_LIST) || []

        if (pre_special_base_info_groups && pre_special_base_info_groups.length) {

            $.each (pre_special_base_info_groups, function (i, base_info_group) {
                var
                    options = pre_special_options_list[ i ],
                    selected_pos = -1
                // 由于专有选项的选中组合顺序，可能不是按照组的顺序排列的，
                // 所以需要遍历所有选项来确定是不是有选项在special_checked_comb中存在
                for (var ii = 0; ii < options.length; ii++) {
                    selected_pos = tcb.inArray (options[ ii ][ 'option_id' ].toString (), special_checked_comb)
                    if (selected_pos > -1) {
                        break
                    }
                }
                groups.push (
                    a.util.genGroupData ([
                        base_info_group[ 'options_cate_name' ],
                        base_info_group[ 'options_cate_id' ],
                        options,
                        selected_pos > -1 ? special_checked_comb[ selected_pos ] : '',
                        [],
                        {
                            mix       : false,
                            is_sku    : false,
                            no_active : false
                        }
                    ])
                )
            })
        }

        return groups
    }

    // 获取用户选择评估项和官方不一致的数据列表（只针对苹果机）
    function getOfficialDiffData(){
        var ret = [
            {
                groupName          : '机型',
                groupKey           : 'model_id',
                optionSelectedName : '',
                optionOfficialName : ''
            },
            {
                groupName          : '容量',
                groupKey           : 'capacity',
                optionSelectedName : '',
                optionOfficialName : ''
            },
            {
                groupName          : '颜色',
                groupKey           : 'color',
                optionSelectedName : '',
                optionOfficialName : ''
            //},
            //{
            //    groupName          : '保修',
            //    groupKey           : '',
            //    optionSelectedName : '',
            //    optionOfficialName : ''
            }
        ]

        var modelId = a.cache.getModelId (),
            officialData = $.parseJSON (window.__OFFICIAL_DATA) || {},
            skuCheckedComb = a.cache.doGetCheckedComb (true) || [],
            modelData = a.cache.getModel (modelId)

        tcb.each (ret, function (i, item) {

            var key = item.groupKey

            if (!officialData[key]) {
                return true
            }

            switch (key) {
                case 'model_id': // 机型
                    officialData[ key ] = tcb.isArray (officialData[ key ]) ? officialData[ key ] : [ officialData[ key ] ]
                    item[ 'optionSelectedName' ] = item[ 'optionOfficialName' ] = modelData[ 'model_name' ]
                    if (tcb.inArray (modelId.toString(), officialData[ key ]) == -1) {
                        item[ 'optionOfficialName' ] = officialData[ 'model_name' ][ officialData[ key ][ 0 ] ]
                    }
                    break
                case 'capacity': // 容量
                    officialData[ key ] = officialData[ key ] && officialData[ key ].toString ()
                    item[ 'optionSelectedName' ] = item[ 'optionOfficialName' ] = __getSkuOptionNameById (skuCheckedComb[ 0 ])
                    if (tcb.inArray (officialData[ key ], skuCheckedComb) == -1) {
                        item[ 'optionOfficialName' ] = officialData[ 'capacity_name' ]
                    }
                    break
                case 'color': // 颜色
                    officialData[ key ] = officialData[ key ] && officialData[ key ].toString ()
                    item[ 'optionSelectedName' ] = item[ 'optionOfficialName' ] = __getSkuOptionNameById (skuCheckedComb[ 1 ])
                    if (tcb.inArray (officialData[ key ], skuCheckedComb) == -1) {
                        item[ 'optionOfficialName' ] = officialData[ 'color_name' ]
                    }
                    break
            }
        })

        return ret.filter(function (item) {
            return item.optionSelectedName && item.optionOfficialName
        })
    }

    // 获取笔记本验机数据，如果有预验机的assess key，那么获取，否则直接执行成功回调
    // params : assessKey
    function getNotebookAutoCheckData(callback) {
        var pre_assess = tcb.queryUrl(window.location.search, 'pre_assess')
        if (pre_assess) {
            var params = {
                assessKey: pre_assess
            }
            $.ajax({
                type: 'GET',
                url: tcb.setUrl2('/m/getNotebookAutoCheckData'),
                data: params,
                dataType: 'json',
                timeout: 5000,
                success: function (res) {
                    if (!res['errno']) {
                        typeof callback === 'function' && callback(res['result'])
                    } else {
                        $.dialog.toast(res['errmsg'])
                    }
                },
                error: function () {
                    typeof callback === 'function' && callback()
                }
            })
        } else {
            typeof callback === 'function' && callback()
        }
    }

    // =================================================================
    // 私有接口 private
    // =================================================================

    // 型号选项获取器(sku和special通用方法)
    function __modelOptionsGetter (options) {
        var
            type = options[ 'type' ],
            params = options[ 'params' ],
            callback = options[ 'callback' ],
            error = options[ 'error' ],
            handle = typeof options[ 'handle' ] === 'function'
                ? options[ 'handle' ]
                : function () {},

            model_id = params[ 'model_id' ],
            paramsData = null,
            url = ''

        if (!model_id) {

            $.dialog.toast ('没有获取到手机型号')

            return
        }

        switch (type) {
            case 'sku':
                var
                    memory_attr_val_id = params[ 'memory_attr_val_id' ] || ''

                paramsData = {
                    model_id : model_id
                }

                url = '/huishou/doGetSkuOptions'

                if (memory_attr_val_id) {
                    // 有默认的内存属性id

                    url = '/huishou/doGetSkuOptionsForApp'
                    paramsData[ 'memory_attr_val_id' ] = memory_attr_val_id
                    window.__IMEI && (paramsData[ 'imei' ] = window.__IMEI)
                }

                params = paramsData
                break
            case 'special':
                var
                    assess_options = params[ 'assess_options' ] || ''

                paramsData = {
                    model_id : model_id
                }

                url = '/huishou/doGetPingguGroup'

                if (assess_options) {
                    // 有已经检测过的评估项

                    url = '/huishou/doGetPingguGroupForApp'
                    paramsData[ 'assess_options' ] = assess_options
                    window.__IMEI && (paramsData[ 'imei' ] = window.__IMEI)
                }

                params = paramsData
                break
        }

        $.ajax ({
            type     : 'GET',
            url      : tcb.setUrl2(url),
            data     : params,
            dataType : 'json',
            timeout  : 5000,
            success  : function (res) {

                if (!res[ 'errno' ]) {

                    // 处理属性数据
                    handle (res[ 'result' ])

                    typeof callback === 'function' && callback ()

                } else {

                    $.dialog.toast (res[ 'errmsg' ])
                }

            },
            error    : function () {
                typeof error === 'function' && error ()
            }
        })

    }

    // 处理型号的sku数据，成为可用的格式
    function __handleModelSkuOptions (sku_data) {
        var sku_attr_map = {}, // sku属性组合到sku的唯一id的映射
            sku_attr_cate = [], // sku属性分类名称
            sku_attr_group_by_cate = [], // 根据每一个sku属性分类，组合sku属性
            sku_attr_group_by_cate_pushed_in = []

        var sku_data_list = sku_data[ 'list' ],
            sku_data_map = sku_data[ 'map' ]

        // 在自动验机的情况下，如果没有匹配的内存，那么mem_match 对应的值为false，干掉检测获取到的内存id
        // 在非检测情况下，mem_match没有定义，即为false，不影响此情况下的逻辑
        if (!sku_data['mem_match']){
            a.cache (a.KEY_OPTIONS_MEM_DETECTED, '')
        }

        // 遍历sku的id和属性组的k-v组合
        $.map (sku_data_list, function (item_group, key) {
            var attr_ids = [];

            // sku id的属性组合
            item_group.forEach (function (item, i, item_group) {
                attr_ids.push (item[ 'attr_valueid' ]);

                // 遍历第一个sku属性组的时候，将属性分类名称获取出来
                if (sku_attr_cate.length < item_group.length) {
                    sku_attr_cate.push ({
                        options_cate_id   : item[ 'attr_id' ],
                        options_cate_name : item[ 'attr_name' ]
                    });
                }

                // sku属性所在的位置项不是数组，那么初始化设置为空数组，以备往里添加数据项
                if (!(sku_attr_group_by_cate[ i ] instanceof Array)) {
                    sku_attr_group_by_cate[ i ] = [];
                }
                // 加到属性组内的属性，不再重复添加
                if (tcb.inArray (item[ 'attr_valueid' ], sku_attr_group_by_cate_pushed_in) == -1) {

                    sku_attr_group_by_cate_pushed_in.push (item[ 'attr_valueid' ]);
                    sku_attr_group_by_cate[ i ].push ({
                        option_id   : item[ 'attr_valueid' ],
                        option_name : item[ 'attr_valuename' ]
                    })
                }

            })

            // sku属性组合到sku的唯一id的映射
            var
                sku_attr_map_key = attr_ids.join (','),
                sku_attr_map_val = key

            sku_attr_map[ sku_attr_map_key ] = sku_attr_map_val

        })

        // 遍历sku分类属性组,进行排序
        $.each (sku_attr_group_by_cate, function (i, group) {
            var
                options_cate_id = sku_attr_cate[ i ][ 'options_cate_id' ] // 分类id
                , attr_sort = sku_data_map[ options_cate_id ] // 属性顺序

            var
                ext_index = 999

            group.sort (function (a, b) {
                var
                    a_index = tcb.inArray (+a[ 'option_id' ], attr_sort),
                    b_index = tcb.inArray (+b[ 'option_id' ], attr_sort)

                a_index = a_index === -1
                    ? ext_index
                    : a_index
                b_index = b_index === -1
                    ? ext_index
                    : b_index

                // 扩展索引每次比较完成之后都+1,这样可以实现不在排序数组中的值,按顺序依次加到最后
                ext_index++

                // 比较当前属性id在排序map中的顺序,map中靠前的提到前边(即相减小于0)(注意点:id需要化为整数,保持和map中的类型一致)
                return a_index - b_index
            })
        })

        a.cache.ex (a.KEY_SKU_ATTR_MAP, sku_attr_map)
        a.cache.ex (a.KEY_SKU_ATTR_CATE, sku_attr_cate)
        a.cache.ex (a.KEY_SKU_ATTR_GROUP_BY_CATE, sku_attr_group_by_cate)
    }

    // 处理型号的专有评估选项，成为可用的格式
    function __handleModelSpecialOptions (group_data) {
        var
            assessed = group_data[ 'assess_options' ] || '', // 已评估选项
            default_selected_options = group_data[ 'default_selected_options' ] || '', // 默认被选中的评估项
            assessGroup = group_data[ 'pinggu_group' ] // 评估组

        default_selected_options = tcb.trim(default_selected_options, ',')

        // 获取到的group_data[ 'pinggu_group' ]为空，
        // 表示普通回收，pinggu_group的列表直接存储在group_data之中，
        // 没有assess_options和default_selected_options，
        // 那么重新将group_data的值赋给assessGroup
        if (!(assessGroup && assessGroup.length)) {
            assessGroup = group_data
        }

        var
            combo_options = [], // 聚合评估选项
            combo_options_default = {}; // 聚合选项中被默认选择的选项

        var
            special_options_cate = [], // 专有评估选项分类名称、id
            special_options_group_list = [], // 专有评估选项组列表
            pre_special_options_cate = [],
            pre_special_options_group_list = []

        $.each (assessGroup, function (i, item) {
            var
                options
            if (item[ 'pinggu_group_juhe' ] == 1) {
                // 聚合选项

                options = item[ 'pinggu_group_options' ]

                if (options && options.length) {

                    options.forEach (function (options_item) {
                        if (options_item[ 'is_default' ] == 1) {
                            // 加入默认被选中的聚合组
                            var group_id = options_item[ 'group_id' ];

                            combo_options_default[ group_id ] = {
                                option_id   : options_item[ 'option_id' ],
                                option_name : options_item[ 'option_name' ]
                            };
                        } else {
                            // 其他没有被选中的聚合组
                            combo_options.push ({
                                group_id    : options_item[ 'group_id' ],
                                option_id   : options_item[ 'option_id' ],
                                option_name : options_item[ 'option_name' ]
                            })
                        }
                    })
                }
            }
            else {
                // 单独选项

                // 专有属性分类名称、id
                special_options_cate.push ({
                    options_cate_id   : item[ 'pinggu_group_id' ],
                    options_cate_name : item[ 'pinggu_group_name' ]
                })

                options = item[ 'pinggu_group_options' ]

                var
                    options_format = []
                if (options && options.length) {

                    options.forEach (function (options_item) {

                        options_format.push ({
                            option_id   : options_item[ 'option_id' ],
                            option_name : options_item[ 'option_name' ]
                        });
                    });
                }
                special_options_group_list.push (options_format)

                // 评估组id存在于前置显示的专有评估组id集合内，
                // 表示当前组是需要前置显示的专有评估组，那么将其加入前置显示的专有评估组cache之中
                if (tcb.inArray (item[ 'pinggu_group_id' ].toString (), a.cache (a.KEY_PRE_SPECIAL_GROUP_IDS) || []) > -1) {
                    pre_special_options_cate.push (special_options_cate[ special_options_cate.length - 1 ])
                    pre_special_options_group_list.push (special_options_group_list[ special_options_group_list.length - 1 ])
                }
            }

        })

        a.cache.ex (a.KEY_MIX_OPTIONS, combo_options)
        a.cache.ex (a.KEY_DEFAULT_CHECKED_MIX_OPTION_MAP, combo_options_default)

        a.cache.ex (a.KEY_SPECIAL_OPTIONS_CATE, special_options_cate)
        a.cache.ex (a.KEY_SPECIAL_OPTIONS_GROUP_LIST, special_options_group_list)

        a.cache.ex (a.KEY_PRE_SPECIAL_OPTIONS_CATE, pre_special_options_cate)
        a.cache.ex (a.KEY_PRE_SPECIAL_OPTIONS_GROUP_LIST, pre_special_options_group_list)

        // 根据app检测结果,过滤后的评估项组合
        a.cache.ex (a.KEY_FILTERED_DETECTED_OPTION_COMB, assessed)
        // 默认选中的专有评估项组合(不包括聚合选项)
        a.cache.ex (a.KEY_DEFAULT_CHECKED_SPECIAL_OPTION_ID_COMB, default_selected_options)

    }

    // 根据已选的sku属性项组合,往sku组集合中添加第一个sku组
    function __getFirstSkuGroup (checked_comb, options) {
        var
            no_active = options[ 'no_active' ] || false, // 是否激活

            // sku属性项集合列表
            sku_options_list = a.cache.ex (a.KEY_SKU_ATTR_GROUP_BY_CATE),
            // sku属性基本信息组列表
            sku_base_info_groups = a.cache.ex (a.KEY_SKU_ATTR_CATE),

            // 可输出的sku属性组集合
            sku_groups = []

        // 预评估的评估项sku id集合（只有sku）
        var preAssessSkuOptionIdComb = a.cache.ex(a.KEY_PRE_ASSESS_SKU_OPTION_ID_COMB) || []

        var
            sku_base_info_group = sku_base_info_groups[ 0 ]
        // 首先将第一组sku属性加到输出属性组中(第一组sku属性总是全量显示,并且必有)
        sku_groups.push (
            a.util.genGroupData ([
                sku_base_info_group[ 'options_cate_name' ],
                sku_base_info_group[ 'options_cate_id' ],
                sku_options_list[ 0 ],
                '',
                [],
                {
                    mix       : false,
                    is_sku    : true,
                    no_active : no_active
                }
            ])
        )
        //pos         : 0

        // 第一个选项组只有一个选项,那么!默认把它选中!!选中!!选中!!
        if (sku_options_list[ 0 ].length === 1) {

            checked_comb.splice (0, 1, sku_options_list[ 0 ][ 0 ][ 'option_id' ])
        }

        if (checked_comb[ 0 ]) {
            // 选中的sku属性项id第一项不为空,设置被选中的选项

            sku_groups[ 0 ][ 'selected' ] = checked_comb[ 0 ]
        }

        if (preAssessSkuOptionIdComb.indexOf(sku_groups[0]['selected']) > -1){
            sku_groups[0]['readonly'] = true
            sku_groups[0]['collapse'] = true
        }

        return sku_groups
    }

    // 根据已选的sku属性项组合,往sku组集合中添加更多的sku组(第一组之后的组)
    // 同时在最后做一些特定处理...
    function __addMoreSkuGroupsByCheckedComb (checked_comb, sku_groups, options) {
        // 已选中sku属性项组合
        checked_comb = checked_comb || []
        // sku属性组列表
        sku_groups = sku_groups || []

        var delimiter_id = (options[ 'delimiter_id' ] || '').toString (), // 起始id
            no_active = options[ 'no_active' ] || false // 是否激活

        // sku属性项集合列表
        var sku_options_list = a.cache.ex (a.KEY_SKU_ATTR_GROUP_BY_CATE),
            // sku属性项集合的数量
            sku_options_list_count = sku_options_list.length,
            // 用来过滤的id组合(即:被选中的sku属性id)
            filtered_id_comb = [],
            // 获取sku属性项id组合列表
            sku_option_id_comb_list = __getSkuOptionIdCombList (),
            // sku属性基本信息组列表
            sku_base_info_groups = a.cache.ex (a.KEY_SKU_ATTR_CATE)

        // 预评估的评估项sku id集合（只有sku）
        var preAssessSkuOptionIdComb = a.cache.ex(a.KEY_PRE_ASSESS_SKU_OPTION_ID_COMB) || []

        // 遍历选中的sku属性项id组合
        // ( 这个过程可能会直接修改到checked_comb对象本身 )
        $.each (checked_comb, function (i, checked_id) {

            // 遍历到sku属性组最后一个,那么没有下一个属性组,直接返回退出
            if (i == sku_options_list_count - 1) {
                return false
            }

            filtered_id_comb.push (checked_id)

            var
                next_sku_option_ids = [] // 下一个可用sku属性id集合
            // 遍历sku属性id组合列表, 获取下一个sku可用属性id
            $.each (sku_option_id_comb_list, function (i, id_comb) {
                var
                    filtered_id_comb_str = filtered_id_comb.join (',') + ',';

                if (id_comb.indexOf (filtered_id_comb_str) === 0) {
                    // id_comb 起始位置开始,能匹配到 filtered_id_comb_str

                    var id_str_tmp = id_comb.substring (filtered_id_comb_str.length)

                    id_str_tmp = id_str_tmp.split (',')[ 0 ]

                    // 下一个 sku 属性 id 内不包含此 id ,那么将此id加入其中
                    if (tcb.inArray (id_str_tmp, next_sku_option_ids) == -1) {

                        next_sku_option_ids.push (id_str_tmp)
                    }
                }
            })

            var
                next_sku_options_pos = i + 1, // 下一个sku属性集合位置
                // 过滤sku属性集合,过滤出可用的属性集合
                next_sku_options = sku_options_list[ next_sku_options_pos ].filter (function (option) {

                    return tcb.inArray (option[ 'option_id' ], next_sku_option_ids) > -1
                })

            // 下一个sku属性项集合有且只有一个选项,那么!默认把它选中!!选中!!选中!!
            if (next_sku_option_ids.length === 1 && next_sku_options.length === 1) {

                checked_comb.splice (next_sku_options_pos, 1, next_sku_option_ids[ 0 ])
            }

            var sku_base_info_group = sku_base_info_groups[ next_sku_options_pos ]

            var readonly = false
            var collapse = false
            if (preAssessSkuOptionIdComb.indexOf(checked_comb[ next_sku_options_pos ]) > -1){
                readonly = true
                collapse = true
            }
            sku_groups.push (
                a.util.genGroupData ([
                    sku_base_info_group[ 'options_cate_name' ],
                    sku_base_info_group[ 'options_cate_id' ],
                    next_sku_options,
                    checked_comb[ next_sku_options_pos ],
                    [],
                    {
                        mix: false,
                        is_sku: true,
                        no_active: no_active,
                        readonly: readonly,
                        collapse: collapse
                    }
                ])
            )

        })

        // 当sku_groups数量比默认的要少，那么补全
        $.each(sku_base_info_groups, function (i, sku_base_info_group) {
            if (sku_groups.length - 1 < i) {
                sku_groups.push(
                    a.util.genGroupData([
                        sku_base_info_group['options_cate_name'],
                        sku_base_info_group['options_cate_id'],
                        [],
                        '',
                        [],
                        {
                            mix: false,
                            is_sku: true,
                            no_active: no_active
                        }
                    ])
                )
            }
        })

        // 干掉 delimiter_id 选项,包括其之前的项
        var delimiter_id_index = tcb.inArray (delimiter_id, checked_comb),
            max_index = Math.max (delimiter_id_index, -1)
        if (max_index > -1) {

            sku_groups.splice (0, max_index + 1)
        } else {
            // max_pos为-1,则将其重置为0,以备下边设置pos编号使用
            max_index = 0
        }

        // 有默认的内存检测项，并且非第一个显示元素（即delimiter_id有值），
        // 那么需要预先将max_index加1，避免在普通评估下第二个开始的sku评估项序号错乱
        if (delimiter_id && !a.cache (a.KEY_OPTIONS_MEM_DETECTED)) {
            max_index++
        }

        // sku起始序号
        var pos = a.cache (a.KEY_SKU_START_INDEX_IN_VIEW)

        // 设置sku组显示序号
        for (var i = 0; i < sku_groups.length; i++) {
            sku_groups[ i ][ 'pos' ] = pos + max_index

            pos++
        }

        return sku_groups
    }

    // 合并两个sku选中的集合组
    function __mergeSkuCheckedComb(checkedCombTarget, checkedCombSource) {
        checkedCombTarget = checkedCombTarget || []
        checkedCombSource = checkedCombSource || []
        var ret = []
        // sku属性项集合列表
        var sku_options_list = a.cache.ex(a.KEY_SKU_ATTR_GROUP_BY_CATE) || []
        var isBreak = false
        tcb.each(sku_options_list, function (i, skuGroup) {
            if (isBreak) {
                return false
            }
            tcb.each(skuGroup || [], function (ii, sku) {
                if (checkedCombSource.indexOf(sku.option_id) > -1) {
                    ret.push(sku.option_id)
                    return false
                } else if (checkedCombTarget.indexOf(sku.option_id) > -1) {
                    ret.push(sku.option_id)
                    return false
                }
            })
            if (ret.length !== i + 1) {
                isBreak = true
            }
        })
        return ret
    }

    // 获取sku属性id组合列表
    function __getSkuOptionIdCombList () {
        var
            sku_option_id_comb_map = a.cache.ex (a.KEY_SKU_ATTR_MAP),
            sku_option_id_comb_list = [] // 存在的sku属性组合

        // 遍历sku属性和id的k-v映射表,
        // 获取sku属性组合列表
        $.each (sku_option_id_comb_map, function (k, v) {

            sku_option_id_comb_list.push (k)
        })

        return sku_option_id_comb_list
    }

    // 执行评估过程
    //sub_options:90,94,106,10,16,20,30,34,48,52,56,84,6,62,78,38
    //sku_group_id:121
    //model_id:8
    // ***** 去掉从cache中获取评估结果的功能，
    //       防止在苹果手机中向右滑动回退的时候，
    //       assess_key被用过了，从而导致assess_key失效的问题 *****
    function __assess (data, before, after, error) {
        before ()

        // var
        //     string_data = $.param (data),
        //     assessedData = a.cache.doGetAssessed (string_data)

        // if (assessedData) {
        //     after (assessedData)
        // } else {
            //var
            //    url_map = [
            //        '/huishou/doPinggu',
            //        '/huishou/doPingguForApp'
            //    ],
            //    url = a.util.is_detect () ? url_map[ 1 ] : url_map[ 0 ]
            var url = window.__TPL_TYPE_DATA['assess_url']

            $.ajax ({
                type     : 'POST',
                url      : tcb.setUrl2(url),
                data     : data,
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {
                    // // cache选中数据
                    // a.cache.doCacheAssessed (string_data, res)

                    after (res)
                },
                error    : function () {

                    error ()
                }
            })
        // }

    }

    // 根据sku的option_id获取对应的option_name
    function __getSkuOptionNameById (option_id) {
        var optionName = '',
            skuOptionGroupList = a.cache.ex (a.KEY_SKU_ATTR_GROUP_BY_CATE)

        tcb.each (skuOptionGroupList, function (i, optionList) {
            tcb.each (optionList, function (ii, theOption) {
                if (theOption[ 'option_id' ] == option_id) {
                    optionName = theOption[ 'option_name' ]
                }
            })
        })

        return optionName
    }

} (this)
