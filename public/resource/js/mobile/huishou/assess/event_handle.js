// 绑定事件
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    a.eventHandle = {}

    tcb.mix (a.eventHandle, {
        /**
         * 选中评估选项(不区分model和option,都调用此接口)
         */
        __doSelectOption : __doSelectOption,

        /**
         * 选择机型
         */
        __doSelectModelBefore : __doSelectModelBefore,
        __doSelectModelAfter  : __doSelectModelAfter,

        /**
         * 选择评估项
         */
        __doSelectOptionBefore : __doSelectOptionBefore,
        __doSelectOptionAfter  : __doSelectOptionAfter,

        /**
         * 设置下一个 SKU 评估组的显示状态[递归遍历所有的 SKU 组]
         */
        __setNextSkuGroupStatus : __setNextSkuGroupStatus,

        /**
         * 修改评估项
         */
        __modifyOption : __modifyOption

    })


    // =================================================================
    // 公共接口 public
    // =================================================================


    // 选中评估选项(不区分model和option,都调用此接口)
    function __doSelectOption ($TheOption, options) {
        if (!($TheOption && $TheOption.length)) {

            $.dialog.toast ('请选择正确的评估估项！')
            return
        }

        a.doSetOptionSelected ($TheOption, options)
    }

    // model before
    function __doSelectModelBefore ($TheOption, $TheGroup, options) {
        var
            model_id = $TheOption.attr ('data-id')

        if (model_id == a.cache.getModelId () && $TheOption.hasClass (a.CLASS_NAME.option_item_selected)) {
            // 选择的机器型号没有变化...那就啥也不需要干

            return a.util.lock ('option_selected')
        }

        // 设置具体机器型号
        a.cache.setModel (model_id)

        var
            $Model = a.$Model,
            model = a.cache.getModel (),
            model_name = model[ 'model_name' ],
            model_aver_price = model[ 'aver_price' ],
            model_icon = model[ 'icon' ]

        $Model.find ('.the-name').html (model_name)
        $Model.find ('.average-price-cnt').html ('￥' + model_aver_price)
        $Model.find ('.the-img').css ({
            'background-image' : 'url(' + tcb.imgThumbUrl(model_icon, 180, 180, 'edr') + ')'
        })
    }

    // model after
    function __doSelectModelAfter ($TheOption, $TheGroup, options) {
        if (a.util.is_lock ('option_selected')) {
            // 选择的机器型号没有变化...那就啥也不需要干

            return a.util.unlock ('option_selected')
        }

        var model_id = a.cache.getModelId ()

        var mem_id = a.cache (a.KEY_OPTIONS_MEM_DETECTED)

        // 如果mem_id存在
        if (mem_id){
            // 设置了 model id 之后, 进入下一步之前,
            // 存储 APP监测到的内存id到 cache 中
            a.cache.doCacheChecked ([ mem_id, [] ], true)
        }

        // 根据型号id,获取针对当前机型的评估项数据
        a.doGetAssessOptionsData (model_id, function () {
            // 重新输出SKU评估组之前，先干掉之前的
            $TheGroup.siblings().remove()

            // 选中机型，获取机型相关sku和评估组数据后，重新输出SKU评估组
            a.render ('assessSkuGroups') (+$TheGroup.attr('data-pos') + 1)

            // 前置展示的专有评估项组
            a.render ('assessPreSpecialGroups') ()
            a.render ('assessSpecialGroups') ()

            var $NextGroup = $TheGroup.next ()
            // 设置下一个 SKU 评估组的显示状态[递归遍历所有的 SKU 组]
            a.eventHandle.__setNextSkuGroupStatus ($NextGroup, {
                animate      : options[ 'animate' ],
                no_active    : false,
                delimiter_id : mem_id
            })

        })
    }

    // option before
    // 所做事情:
    //      1.将选中选项加入 checked comb
    function __doSelectOptionBefore ($TheOption, $TheGroup, options) {
        var
            the_option_id = $TheOption.attr ('data-id'),
            // 是否sku属性标识
            is_sku = a.util.is_sku ($TheOption),
            // 是否被选择
            is_checked = a.util.is_checked (the_option_id, is_sku),
            // 是否专有混合选项
            is_mix = a.util.is_mix ($TheOption)

        if (is_checked && $TheOption.hasClass (a.CLASS_NAME.option_item_selected) && !is_mix) {
            // 1.已经是被选中状态,
            // 2.非专有混合选项,
            // 不做前置处理直接返回了...

            return a.util.lock ('option_selected')
        }

        var
            $Options = $TheGroup.find ('.' + a.CLASS_NAME.option_item),
            options_except = [] // 非选中项的id列表

        if (is_mix) {
            // 专有混合选项
            var
                the_option_checked_id = is_mix,
                mix_comb = []
            // 遍历评估项,
            // 将mix option加入mix comb
            $Options.each (function (i, el) {
                var
                    $el = $ (el),
                    id = $el.attr ('data-id'),
                    checked_id = $el.attr ('data-checked-id'),
                    // 设置一个默认可用的checked id
                    mix_comb_id = checked_id

                if (id == the_option_id) {
                    // 被点击项

                    // 被点击项被点击之前为没有选中，
                    // 那么点击即为选中，所以将mix_comb_id设置为当前选项的id
                    if (!$el.hasClass (a.CLASS_NAME.option_item_selected)) {
                        mix_comb_id = the_option_id
                    }
                } else {
                    // 其他非当前点击项

                    if (checked_id == the_option_checked_id) {
                        // 默认选中id，与被点击项的默认checked id相同，
                        // 那么将值设置为空..便于跳过不加入mix comb
                        mix_comb_id = ''
                    } else if ($el.hasClass (a.CLASS_NAME.option_item_selected)) {
                        // 其他项，处于被选中状态，将其项id设置为mix_comb_id
                        mix_comb_id = id
                    }
                }

                // 选中项id在组合中不存在,那么将其添加进mix_comb
                if (mix_comb_id && tcb.inArray (mix_comb_id, mix_comb) === -1) {
                    mix_comb.push (mix_comb_id)
                }
            })
            the_option_id = mix_comb.join (',')
        } else {
            // 遍历评估项,将非选中的评估项id,加入非选中的选项id队列中
            $Options.each (function (i, el) {
                var
                    $el = $ (el),
                    id = $el.attr ('data-id')
                if (id != the_option_id) {

                    options_except.push (id)
                }
            })
        }

        // 进入下一步之前,
        // 存储当前选中评估项到 cache 中
        a.cache.doCacheChecked ([ the_option_id, options_except ], is_sku, is_mix)
    }

    // option after
    function __doSelectOptionAfter ($TheOption, $TheGroup, options) {
        if (a.util.is_lock ('option_selected')) {
            // $TheOption 已经是被选中状态,不做啥处理就返回了...

            return a.util.unlock ('option_selected')
        }

        // 是否sku属性标识
        var is_sku = a.util.is_sku ($TheOption)
        if (is_sku) {
            var
                option_id = $TheOption.attr ('data-id'),
                $NextGroup = $TheGroup.next ()

            // 设置下一个 SKU 评估组的显示状态[递归遍历所有的 SKU 组]
            a.eventHandle.__setNextSkuGroupStatus ($NextGroup, {
                animate      : options[ 'animate' ],
                no_active    : false,
                delimiter_id : option_id
            })
        }
    }

    // 修改评估项
    function __modifyOption ($TheGroup, callback) {

        a.doAnimateActiveGroup ($TheGroup, callback)
    }


    // 设置下一个 SKU 评估组的显示状态[递归遍历所有的 SKU 组]
    //      $NextGroup : 下一个开始的 SKU 组
    //      options : 获取评估组数据的参数
    function __setNextSkuGroupStatus ($NextGroup, options) {
        var
            animate = options[ 'animate' ] || false

        // 获取可展示的sku组集合
        var sku_groups = a.getSkuGroups ({
            no_active    : options[ 'no_active' ],
            delimiter_id : options[ 'delimiter_id' ]
        })

        var start = 0
        !function ($NextGroup) {
            if (!$NextGroup.length) {

                return
            }

            var sku_group = sku_groups[ start ]

            if (sku_group && sku_group.options && sku_group.options.length) {
                // 输出评估组有数据

                // 输出评估组内容
                var flag_not_show = false,
                    flag_fade_in = false

                a.render ('assessOptionGroupInner') ($NextGroup, sku_group, flag_not_show, flag_fade_in)

                if (sku_group.selected && sku_group.collapse) {
                    // 选中组，并且收起
                    // 无动画
                    a.doSetGroupSelected($NextGroup)
                }else if (animate) {
                    // 展开显示下一组评估组
                    // 有动画效果
                    a.doAnimateActiveGroup ($NextGroup)
                } else {
                    // 展开显示下一组评估组
                    // 无动画
                    a.doSetActiveGroup ($NextGroup)
                }

                if (sku_group.readonly) {
                    // 状态太只读，不可更改
                    $NextGroup.addClass('block-option-group-readonly')
                }

            } else {
                // 没有评估组数据,让评估组处于非激活状态
                a.doSetNoActiveGroup ($NextGroup)
            }

            start++

            arguments.callee ($NextGroup.next ())

        } ($NextGroup)

    }


    // =================================================================
    // 私有接口 private
    // =================================================================



} (this)
