// 验证
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    a.valid = {}

    tcb.mix (a.valid, {

        assess        : validAssess,
        assessBasic   : validAssessBasic,
        assessSpecial : validAssessSpecial

    })

    // =================================================================
    // 公共接口 public
    // =================================================================

    // 基本评估项验证
    function validAssessBasic (no_interact) {
        no_interact = !!no_interact

        var $BasicGroups = $ ('.' + a.CLASS_NAME.block_model_basic_info)
                .find ('.' + a.CLASS_NAME.block_option_group),
            $PreSpecialGroups = $ ('.' + a.CLASS_NAME.block_model_pre_special_info)
                .find ('.' + a.CLASS_NAME.block_option_group),
            $GroupErrorFirst = null,
            flag = true

        //=======================
        // sku基本评估项验证
        //=======================
        // 验证组长度为0,表示直接刷新页面进入,还没有显示内容,
        // 那么直接验证cache中的数据对不对
        if (!$BasicGroups.length) {
            var
                checked_sku_comb = a.cache.doGetCheckedComb(true),
                sku_option_id_comb_map = a.cache.ex (a.KEY_SKU_ATTR_MAP) || {}
            // 没有获取到sku id
            if (!sku_option_id_comb_map[ checked_sku_comb.join (',') ]) {
                flag = false
            }
        } else {
            $BasicGroups.each (function () {
                var
                    $Group = $ (this)
                // 评估组没有被选中项,那么提示没中选的地方
                if (!$Group.find ('.' + a.CLASS_NAME.option_item_selected).length) {
                    flag = false

                    $GroupErrorFirst = $GroupErrorFirst || $Group

                    if (!no_interact) {
                        var
                            $Options = $Group.find ('.' + a.CLASS_NAME.option_item)
                        $Options.shine4Error ()
                    }
                }
            })
        }

        //=======================
        // 前置显示的专有评估项验证
        //=======================
        if (!$PreSpecialGroups.length) {
            var
                checked_special_comb = a.cache.doGetCheckedComb(false),
                pre_special_options_list = a.cache.ex (a.KEY_PRE_SPECIAL_OPTIONS_GROUP_LIST) || []
            if (!checked_special_comb.length) {
                flag = false
            } else {
                // 遍历前置的专有评估项组合列表
                $.each(pre_special_options_list, function(i, options){
                    var
                        no_checked = true
                    // 遍历评估项组合
                    $.each(options, function(ii, option){
                        if ( tcb.inArray(option['option_id' ].toString(), checked_special_comb[1])>-1 ){
                            no_checked = false
                        }
                    })
                    if (no_checked){
                        flag = false
                        return false
                    }
                })
            }
        } else {
            $PreSpecialGroups.each (function () {
                var
                    $Group = $ (this)
                // 评估组没有被选中项,那么提示没中选的地方
                if (!$Group.find ('.' + a.CLASS_NAME.option_item_selected).length) {
                    flag = false

                    $GroupErrorFirst = $GroupErrorFirst || $Group

                    if (!no_interact) {
                        var
                            $Options = $Group.find ('.' + a.CLASS_NAME.option_item)
                        $Options.shine4Error ()
                    }
                }
            })
        }


        // no_interact为false，并且第一个错误组节点存在，
        // 那么滚动到第一个错误项的位置
        if (!no_interact && $GroupErrorFirst && $GroupErrorFirst.length) {
            var
                inst = a.scroll.getInst (),
                // 滚动位置
                scroll_top_pos = a.resizeScrollInnerHeight ($GroupErrorFirst)
            inst.scrollTo (0, scroll_top_pos, true)
        }

        return flag
    }

    // 专有评估项验证
    function validAssessSpecial (no_interact) {
        no_interact = !!no_interact

        var
            $Groups = $ ('.' + a.CLASS_NAME.block_model_special_info)
                .find ('.' + a.CLASS_NAME.block_option_group),
            $GroupErrorFirst = null,
            flag = true

        // 验证组长度为0,表示直接刷新页面进入,还没有显示内容,
        // 那么直接验证cache中的数据对不对
        if (!$Groups.length) {
            var
                checked_special_comb = a.cache.doGetCheckedComb(false),
                special_options_list = a.cache.ex (a.KEY_SPECIAL_OPTIONS_GROUP_LIST) || []
            if (!checked_special_comb.length) {
                flag = false
            } else {
                if (!checked_special_comb[ 0 ]
                    || !(checked_special_comb[ 1 ] && checked_special_comb[ 1 ].length === special_options_list.length)) {
                    flag = false
                }
            }
        }

        $Groups.each (function () {
            var
                $Group = $ (this)
            // 评估组为非混合选项组,并且没有被选中项,
            // 那么提示没中选的地方
            if (!$Group.attr ('data-mix')
                && !$Group.find ('.' + a.CLASS_NAME.option_item_selected).length) {
                flag = false

                $GroupErrorFirst = $GroupErrorFirst || $Group

                if (!no_interact) {
                    var
                        $Options = $Group.find ('.' + a.CLASS_NAME.option_item)
                    $Options.shine4Error ()
                }
            }
        })

        if (!no_interact && $GroupErrorFirst && $GroupErrorFirst.length) {
            var
                inst = a.scroll.getInst (),
                // 滚动位置
                scroll_top_pos = a.resizeScrollInnerHeight ($GroupErrorFirst)
            inst.scrollTo (0, scroll_top_pos, true)
        }

        return flag
    }

    // 执行评估
    function validAssess (no_interact) {
        var
            flag = true

        // 验证基本评估项 和 专有评估项
        if (!a.valid.assessBasic (no_interact) || !a.valid.assessSpecial (no_interact)) {
            flag = false
        }

        return flag
    }


    // =================================================================
    // 私有接口 private
    // =================================================================



} (this)
