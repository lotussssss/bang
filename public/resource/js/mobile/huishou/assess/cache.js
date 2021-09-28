// 数据cache
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    a.cache = function (key, val) {

        return tcb.cache (key, val)
    }
    a.storage = {}

    // 缓存
    tcb.mix (a.cache, {

        ex : function (key, val) {
            var
                model_id = a.cache.getModelId ()

            key = key + '_' + model_id

            return model_id
                ? tcb.cache (key, val)
                : false
        },

        /**
         * 获取选中的型号信息
         * @returns {*}
         */
        getModel   : function (model_id) {
            var
                model = null,
                modelList = a.cache (a.KEY_MODELS)||[]

            model_id = model_id || a.cache (a.KEY_MODEL_ID)
            if (!model_id && a.storage.sessionStorage) {
                model_id = a.storage.sessionStorage.getItem (a.KEY_MODEL_ID)
            }

            if (!model_id) {
                // 找不到 model id , 如果 model list 只有一个型号, 直接使用

                if (modelList && modelList.length === 1) {
                    model = modelList[ 0 ]
                }

            } else {
                if (modelList && modelList.length === 1) {
                    model = modelList[ 0 ]
                } else {
                    for (var i = 0; i < modelList.length; i++) {

                        if (model_id == modelList[ i ][ 'model_id' ]) {

                            model = modelList[ i ]

                            break
                        }
                    }
                }
            }

            if (model){
                a.cache (a.KEY_MODEL_ID, model[ 'model_id' ])
                if (a.storage.sessionStorage) {
                    a.storage.sessionStorage.setItem (a.KEY_MODEL_ID, model[ 'model_id' ])
                }
            }

            return model
        },

        /**
         * 获取选中的型号id
         * @returns {*}
         */
        getModelId : function () {
            var
                model = null,
                model_id = a.cache (a.KEY_MODEL_ID)

            if (model_id || (model = a.cache.getModel (model_id))) {

                model_id = model_id || model[ 'model_id' ]
            }

            return model_id
        },
        // 设置选中的型号id
        setModel   : function (model_id) {
            var
                model = null,
                modelList = a.cache (a.KEY_MODELS),
                len = modelList.length

            if (modelList && len) {

                if (len === 1) {
                    model = modelList[ 0 ]
                } else {
                    for (var i = 0; i < len; i++) {
                        if (model_id == modelList[ i ][ 'model_id' ]) {
                            model = modelList[ i ]
                            break
                        }
                    }
                }
            }

            if (!model) {
                model_id = ''
            }

            a.cache (a.KEY_MODEL_ID, model_id)
            if (a.storage.sessionStorage) {
                a.storage.sessionStorage.setItem (a.KEY_MODEL_ID, model_id)

                // 切换model_id之后,全面恢复机器型号下的选中数据
                a.cache.doRecoverAssessData ()
            }

            return model_id
        },
        // 设置选中的型号id
        setModelId : function (model_id) {

            return a.cache.setModel (model_id)
        },

        // 缓存评估数据

        doCacheAssessed : __cacheAssessed,

        // 缓存评估数据

        doGetAssessed : __getAssessed,

        // 获取选中的评估项id组合

        doGetCheckedComb : doGetCheckedComb,

        // cache选中的评估项id(存储评估进度,不包含城市选择)

        doCacheChecked : doCacheChecked,

        // 直接添加选定项id组合到 cache 以及 storage

        doCacheCheckedComb : doCacheCheckedComb,

        //全面恢复存储在 storage 中的数据

        doRecoverAssessData : doRecoverAssessData,

        // 清除storage的缓存

        doCleanStorage : doCleanStorage

    })
    // 存储
    tcb.mix (a.storage, {

        sessionStorage : tcb.supportSessionStorage() ? window.sessionStorage : null,

        getItem : function (key) {
            var
                ret = '',
                model_id = a.cache.getModelId ()

            if (a.storage.sessionStorage) {

                ret = a.storage.sessionStorage.getItem (key + '_' + model_id)
            }
            return ret
        },
        setItem : function (key, val) {
            var
                ret = '',
                model_id = a.cache.getModelId ()

            if (a.storage.sessionStorage) {

                ret = a.storage.sessionStorage.setItem (key + '_' + model_id, val)
                a.storage.sessionStorage.setItem(a.KEY_STORAGE_LAST_ACTIVE_TIME, (new Date).getTime())
            }
            return ret
        }
    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    /**
     * 获取选中的评估项id组合
     *
     * @param is_sku
     * @returns {*}
     */
    function doGetCheckedComb (is_sku) {
        var
            checked_comb = null
        if (is_sku) {

            checked_comb = a.cache.ex (a.KEY_CHECKED_SKU_OPTION_ID_COMB) || []

            // 以下都是特殊条件特别处理
            if (checked_comb.length < 0) {
                var mem_id = a.cache (a.KEY_OPTIONS_MEM_DETECTED)

                checked_comb.push (mem_id)
            }
        } else {

            checked_comb = a.cache.ex (a.KEY_CHECKED_SPECIAL_OPTION_ID_COMB) || []

            // 以下都是特殊条件特别处理
            if (!(checked_comb[ 0 ] && checked_comb[ 0 ].length)) {
                checked_comb[ 0 ] = []
                // 默认选中的混合专有评估项的map
                var default_checked_mix_option_map = a.cache.ex (a.KEY_DEFAULT_CHECKED_MIX_OPTION_MAP)
                if (default_checked_mix_option_map) {
                    for (var group_id in default_checked_mix_option_map) {
                        if (default_checked_mix_option_map.hasOwnProperty (group_id)) {
                            // 将默认选中的混合评估项id,加入cache
                            checked_comb[ 0 ].push (default_checked_mix_option_map[ group_id ][ 'option_id' ])
                        }
                    }
                }
                checked_comb[ 0 ] = checked_comb[ 0 ].join (',')
            }
            if (!(checked_comb[ 1 ] && checked_comb[ 1 ].length)) {

                // 默认选中的专有评估项
                var default_checked_special = a.cache.ex (a.KEY_DEFAULT_CHECKED_SPECIAL_OPTION_ID_COMB)

                checked_comb[ 1 ] = default_checked_special
                    ? default_checked_special.split (',')
                    : []
            }
        }

        return a.cache.doCacheCheckedComb (checked_comb, is_sku)
    }

    /**
     * cache选中的评估项id(存储评估进度,不包含城市选择)
     *      支持 sessionStorage 时,同时使用 sessionStorage 进行更持久的存储
     *
     * @param options [选项id,[互斥的其他id]]
     * @param is_sku  是否sku属性
     * @param is_mix  是否mix混合评估项
     */
    function doCacheChecked (options, is_sku, is_mix) {
        var
            option_checked = options[ 0 ].toString (), // 选中的选项(string)
            options_except = options[ 1 ] instanceof Array
                ? options[ 1 ]
                : [],  // 其他非选中选项(array||undefined)
            checked_comb = null

        if (is_sku) {
            // 存储选中的sku评估项

            checked_comb = __cacheSkuAssessOptions (option_checked, options_except)

        } else {

            // 存储选中的专有评估项(聚合和非聚合)
            checked_comb = __cacheSpecialAssessOptions (option_checked, options_except, is_mix)
        }
        return checked_comb
    }

    /**
     * 直接添加评估结果集合到 cache 以及 storage
     *
     * @param checked_cache
     * @param is_sku
     */
    function doCacheCheckedComb (checked_cache, is_sku) {
        // 更新 checked_cache
        // 第三步: 确定新的 checked_cache 和 checked_storage 的关系,判断是否更新 checked_storage

        var
            checked_comb = null

        if (is_sku) {

            // 根据最新的checked_cache,更新cache
            checked_comb = a.cache.ex (a.KEY_CHECKED_SKU_OPTION_ID_COMB, checked_cache)

            if (a.storage.sessionStorage) {
                __storageSkuAssessOptions (checked_cache)
            }
        } else {

            // 根据最新的 checked_cache ,更新cache
            checked_comb = a.cache.ex (a.KEY_CHECKED_SPECIAL_OPTION_ID_COMB, checked_cache)

            // 第三步: 确定新的 checked_cache 和 checked_storage 的关系,判断是否更新 checked_storage
            if (a.storage.sessionStorage) {
                __storageSpecialAssessOptions (checked_cache)
            }
        }

        return checked_comb
    }

    /**
     * 全面恢复存储在 storage 中的数据
     * 同时处理一些默认数据的使用
     */
    function doRecoverAssessData () {
        if (!a.storage.sessionStorage) {
            // 不支持 sessionStorage

            return
        }

        // 恢复时间相对于之前活动时间超过2小时，
        // 直接干掉storage，然后返回
        var
            last_active_time = a.storage.sessionStorage.getItem(a.KEY_STORAGE_LAST_ACTIVE_TIME),
            duration_for_test = 0,
            duration = duration_for_test || 3600000
        if ((new Date).getTime()-last_active_time>duration){

            return a.cache.doCleanStorage()
        }

        var
            model_id = a.cache.getModelId ()
        // 没有获取到机型id,不还原任何存储数据
        if (!model_id) { return }

        var
            checked_storage = a.storage.getItem (a.KEY_CHECKED_SPECIAL_OPTION_ID_COMB_STORAGE) || '', // 选中的专有评估项
            checked_sku_storage = a.storage.getItem (a.KEY_CHECKED_SKU_OPTION_ID_COMB_STORAGE) || '',  // 选中的sku项
            // 默认选中的专有评估项
            default_checked_special = a.cache.ex (a.KEY_DEFAULT_CHECKED_SPECIAL_OPTION_ID_COMB)

        // 专有评估项
        if (checked_storage) {
            checked_storage = checked_storage.split (a.KEY_STORAGE_ARRAY_DELIMITER)

            // storage中有选中项,优先使用storage中的数据
            // 否则,若有默认选中项就用默认数据
            if (checked_storage[ 1 ]) {
                checked_storage[ 1 ] = checked_storage[ 1 ].split (',')
            } else {
                checked_storage[ 1 ] = default_checked_special
                    ? default_checked_special.split (',')
                    : []
            }

        } else {

            checked_storage = [ '',
                                default_checked_special
                                    ? default_checked_special.split (',')
                                    : [] ]

        }
        // sku评估项
        checked_sku_storage = checked_sku_storage
            ? checked_sku_storage.split (',')
            : []

        a.cache.doCacheCheckedComb (checked_storage)
        a.cache.doCacheCheckedComb (checked_sku_storage, true)

        __recoverAssessed ()

    }

    // 清除storage的缓存
    function doCleanStorage () {
        if (!a.storage.sessionStorage) {
            // 不支持 sessionStorage

            return
        }

        if (a.storage.sessionStorage.length) {
            var itemKeys = []
            for (var i = 0; i < a.storage.sessionStorage.length; i++) {
                var itemKey = a.storage.sessionStorage.key(i)
                if (itemKey && itemKey.indexOf('key_') === 0) {
                    itemKeys.push(itemKey)
                }
            }
            tcb.each(itemKeys, function (i, key) {
                a.storage.sessionStorage.removeItem(key)
            })
        }
        // a.storage.sessionStorage.clear ()
    }



    // =================================================================
    // 私有接口 private
    // =================================================================

    // cache 选中的sku评估项
    function __cacheSkuAssessOptions (checked, excepts) {
        var
            checked_cache = a.cache.doGetCheckedComb (true), // 缓存中--已选择的评估项(数组)
            excepts_pos = -1

        // 第一步: 遍历非选中的选项,确认存在于已选中的选项中的位置,不存在则为-1
        $.each (excepts, function (i, except_id) {
            var
                except_id_pos = tcb.inArray (except_id, checked_cache)
            if (except_id_pos > -1) {
                excepts_pos = except_id_pos
            }
        })

        // 第二步: 根据非选中的选项的位置excepts_pos,
        // 确定将checked加入cache中的方式,然后将checked加入其中
        if (excepts_pos === -1) {
            // 非选中的选项不存在于 cache 之中....

            // 再判断选中的选项在不在 cache 之中,在其中就不做处理,
            // 否则直接将选项push进 cache
            if (tcb.inArray (checked, checked_cache) === -1) {
                checked_cache.push (checked);
            }
        } else {
            // 非选中的选项存在于checked之中...

            // 从excepts_pos位置开始,干掉所有后边的数据,
            // 然后再将checked push到其中
            checked_cache.splice (excepts_pos)
            checked_cache.push (checked)
        }

        // 根据最新的checked_cache,更新 cache 并且更新 storage
        return a.cache.doCacheCheckedComb (checked_cache, true)
    }

    // storage 选中的sku评估项
    function __storageSkuAssessOptions (checked_cache) {
        var
            checked_storage // 存储中--选中的选项

        checked_storage = a.storage.getItem (a.KEY_CHECKED_SKU_OPTION_ID_COMB_STORAGE) || '' // 存储中--已选则评估项(逗号分割的字符串)
        checked_cache = checked_cache.join (',')

        if (checked_storage.indexOf (checked_cache) === 0) {

            var
                split_right = checked_storage.split (checked_cache)[ 1 ]
            // storage中当前checked_cache字符串右侧的字符串不为空,
            // 并且第一个字符不是逗号(,)表示cache在storage中没有缓存,
            // 那么将checked_cache更新storage
            if (split_right && split_right.charAt (0) !== ',') {
                checked_storage = checked_cache
                a.storage.setItem (a.KEY_CHECKED_SKU_OPTION_ID_COMB_STORAGE, checked_storage)
            }
        } else {
            // 完全无法匹配,直接更新storage

            checked_storage = checked_cache;
            a.storage.setItem (a.KEY_CHECKED_SKU_OPTION_ID_COMB_STORAGE, checked_storage)
        }
    }

    // cache 选中的专有评估项(聚合和非聚合)
    function __cacheSpecialAssessOptions (checked, excepts, is_mix) {
        var
            checked_cache = a.cache.doGetCheckedComb (), // [非sku评估项id]缓存中--已选择的评估项id组合(数组)
            excepts_pos = -1

        if (is_mix) {
            // [聚合评估项] is_mix为true

            // 选项值不相等,那么直接用新的选中选项组替换
            if (checked_cache[ 0 ] != checked) {

                checked_cache[ 0 ] = checked
            }
        } else {
            // [非聚合评估项] 非聚合的选项,checked选项为单个的选项id

            var
                checked_special_cache = checked_cache[ 1 ];

            // 第一步: 遍历非选中的选项,确认存在于已选中的选项中的位置,不存在则为-1
            $.each (excepts, function (i, except_id) {
                var
                    except_id_pos = tcb.inArray (except_id, checked_special_cache)
                if (except_id_pos > -1) {
                    excepts_pos = except_id_pos
                }
            })

            // 第二步: 根据非选中的选项的位置 excepts_pos ,
            // 确定将 checked 加入 cache 中的方式,然后将checked加入其中
            if (excepts_pos === -1) {
                // 非选中的选项不存在于 cache 之中....

                // 再判断选中的选项在不在 cache 之中,在其中就不做处理,
                // 否则直接将选项push进 cache
                if (tcb.inArray (checked, checked_special_cache) === -1) {
                    checked_special_cache.push (checked)
                }
            } else {
                // 非选中的选项存在于 cache 之中...

                // 在 excepts_pos 位置直接替换掉
                checked_special_cache.splice (excepts_pos, 1, checked);
            }
        }

        // 根据最新的checked_cache,更新 cache 并且更新 storage
        return a.cache.doCacheCheckedComb (checked_cache)
    }

    // storage 选中的专有评估项(聚合和非聚合)
    function __storageSpecialAssessOptions (checked_cache) {
        var
            checked_storage // 存储中--选中的选项

        // 非sku属性
        checked_storage = a.storage.getItem (a.KEY_CHECKED_SPECIAL_OPTION_ID_COMB_STORAGE) || '' // 存储中--已选则评估项(逗号分割的字符串)
        checked_cache = checked_cache[ 0 ] + a.KEY_STORAGE_ARRAY_DELIMITER + checked_cache[ 1 ].join (',')

        if (checked_storage.indexOf (checked_cache) === 0) {

            var
                split_right = checked_storage.split (checked_cache)[ 1 ]

            // storage 中当前 checked_cache 字符串右侧的字符串不为空,并且第一个字符不是逗号(,)那么将 checked_cache 更新storage
            if (split_right && split_right.charAt (0) !== ',') {
                checked_storage = checked_cache
                a.storage.setItem (a.KEY_CHECKED_SPECIAL_OPTION_ID_COMB_STORAGE, checked_storage);
            }
        } else {
            // 完全无法匹配,直接更新storage

            checked_storage = checked_cache
            a.storage.setItem (a.KEY_CHECKED_SPECIAL_OPTION_ID_COMB_STORAGE, checked_storage);
        }
    }

    // 缓存评估数据
    function __cacheAssessed (key, data) {

        a.cache (key, data)


        //__storageAssessed (key, data)
    }

    function __storageAssessed (key, data) {
        if (!a.storage.sessionStorage) {
            // 不支持 sessionStorage

            return
        }

        var
            assessed_cache_keys = a.storage.sessionStorage.getItem (a.KEY_ASSESSED_CACHE_KEYS_STORAGE)

        assessed_cache_keys = assessed_cache_keys ? assessed_cache_keys.split (a.KEY_STORAGE_ARRAY_DELIMITER) : []
        if (tcb.inArray (key, assessed_cache_keys) === -1) {
            assessed_cache_keys.push (key)
        }
        a.storage.sessionStorage.setItem (a.KEY_ASSESSED_CACHE_KEYS_STORAGE, assessed_cache_keys.join (a.KEY_STORAGE_ARRAY_DELIMITER))

        var
            storage_data = {
                errno        : data[ 'errno' ],
                errmsg       : data[ 'errmsg' ],
                assess_key   : data[ 'result' ] ? data[ 'result' ][ 'assess_key' ] : '',
                pinggu_price : data[ 'result' ] ? data[ 'result' ][ 'pinggu_price' ] : ''
            }
        a.storage.sessionStorage.setItem (key, $.param (storage_data))
    }

    function __recoverAssessed () {
        if (!a.storage.sessionStorage) {
            // 不支持 sessionStorage

            return
        }
        var
            assessed_cache_keys = a.storage.sessionStorage.getItem (a.KEY_ASSESSED_CACHE_KEYS_STORAGE)

        assessed_cache_keys = assessed_cache_keys ? assessed_cache_keys.split (a.KEY_STORAGE_ARRAY_DELIMITER) : []

        var
            storage_assessed_data = '',
            assessed_data = null
        for (var i = 0; i < assessed_cache_keys.length; i++) {
            storage_assessed_data = a.storage.sessionStorage.getItem (assessed_cache_keys[ i ])
            storage_assessed_data = tcb.queryUrl (storage_assessed_data)
            assessed_data = {
                errno  : parseInt(storage_assessed_data[ 'errno' ], 10)||0,
                errmsg : storage_assessed_data[ 'errmsg' ],
                result : ''
            }
            if (!assessed_data[ 'errno' ]) {
                assessed_data[ 'result' ] = {
                    assess_key   : storage_assessed_data[ 'assess_key' ],
                    pinggu_price : storage_assessed_data[ 'pinggu_price' ]
                }
            }
            a.cache (assessed_cache_keys[ i ], assessed_data)
        }
    }

    function __getAssessed (key) {

        return a.cache (key)
    }


} (this)
