// key常量
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    tcb.mix (a, {
        //
        // 常量值
        //


        //===================== 无 model_id 后缀 =======================

        KEY_MODEL_ID : 'key_model_id', // 具体评估机型id

        KEY_PRE_SPECIAL_GROUP_IDS : 'key_pre_special_group_ids', // 前置显示的专有评估组id集合

        KEY_OPTIONS_DETECTED        : 'key_options_detected',
        KEY_OPTIONS_SCREEN_DETECTED : 'key_options_screen_detected',
        KEY_OPTIONS_MEM_DETECTED    : 'key_options_mem_detected',
        KEY_MODELS                  : 'key_models', // 机型集合
        KEY_MODELS_COUNT            : 'key_models_count', // 机型集合数量

        KEY_STORAGE_ARRAY_DELIMITER  : '||', // storage中，数组和数组之间的分隔符
        KEY_STORAGE_LAST_ACTIVE_TIME : 'key_storage_last_active_time', // 最后存储storage的时间。用于恢复storage的时候判断storage是否过期

        KEY_FLAG_LOCKING : 'key_flag_locking', // 锁定中,作为临时标识符,使用锁定后需要及时解除锁定,以备后用

        KEY_ASSESSED_CACHE_KEYS_STORAGE : 'key_assessed_cache_keys_storage', // 锁定中,作为临时标识符,使用锁定后需要及时解除锁定,以备后用

        KEY_FLAG_IS_DETECT : 'key_flag_is_detect', // 是否检测流程


        //===================== END 无 model_id 后缀 =======================


        //===================== 有 model_id 后缀 =======================

        KEY_CHECKED_SKU_OPTION_ID_COMB         : 'key_checked_sku_option_id_comb',         // 选中的sku评估项id组合
        KEY_CHECKED_SKU_OPTION_ID_COMB_STORAGE : 'key_checked_sku_option_id_comb_storage', // 存储--选中的sku评估项id组合


        KEY_CHECKED_SPECIAL_OPTION_ID_COMB         : 'key_checked_special_option_id_comb',         // 选中的非sku评估项
        KEY_CHECKED_SPECIAL_OPTION_ID_COMB_STORAGE : 'key_checked_special_option_id_comb_storage', // 存储--选中的非sku评估项


        // sku评估项的数据key

        KEY_SKU_ATTR_MAP           : 'key_sku_attr_map',
        KEY_SKU_ATTR_CATE          : 'key_sku_attr_cate',
        KEY_SKU_ATTR_GROUP_BY_CATE : 'key_sku_attr_group_by_cate',


        // 专有评估项的数据key

        KEY_MIX_OPTIONS                    : 'key_mix_options',
        KEY_DEFAULT_CHECKED_MIX_OPTION_MAP : 'key_default_checked_mix_option_map',
        KEY_SPECIAL_OPTIONS_CATE           : 'key_special_options_cate',
        KEY_SPECIAL_OPTIONS_GROUP_LIST     : 'key_special_options_group_list',
        KEY_PRE_SPECIAL_OPTIONS_CATE       : 'key_pre_special_options_cate',
        KEY_PRE_SPECIAL_OPTIONS_GROUP_LIST : 'key_pre_special_options_group_list',

        KEY_FILTERED_DETECTED_OPTION_COMB : 'key_filtered_detected_option_comb',

        KEY_DEFAULT_CHECKED_SPECIAL_OPTION_ID_COMB : 'key_default_checked_special_option_id_comb',

        KEY_PRE_ASSESS_SPECIAL_OPTION_ID_COMB : 'key_pre_assess_special_option_id_comb', // 预评估的评估项id集合（不包括sku）
        KEY_PRE_ASSESS_SKU_OPTION_ID_COMB : 'key_pre_assess_sku_option_id_comb', // 预评估的评估项sku id集合（只有sku）
        KEY_PRE_ASSESS_SKU_LIST : 'key_pre_assess_sku_list', // 预评估的sku信息列表

        // sku属性在view中的序号存储key

        KEY_SKU_START_INDEX_IN_VIEW : 'key_sku_start_index_in_view',


        //===================== END 有 model_id 后缀 =======================

        CLASS_NAME : {
            block_assess_model : 'block-assess-model',
            block_btn          : 'block-btn',

            block_model_basic_info       : 'block-model-basic-info',
            block_model_special_info     : 'block-model-special-info',
            block_model_pre_special_info : 'block-model-pre-special-info',
            block_option_group           : 'block-option-group',
            block_option_group_selected  : 'block-option-group-selected',
            block_option_group_no_active : 'block-option-group-no-active',
            block_option_group_collapse  : 'block-option-group-collapse',

            row_option_group_tit : 'row-option-group-tit',
            row_option_box       : 'row-option-box',
            row_option_selected  : 'row-option-selected',
            row_assess_price     : 'row-assessed-price',

            col_desc : 'col-desc',

            option_item          : 'option-item',
            option_item_selected : 'option-item-selected'
        }


    })

} (this)
