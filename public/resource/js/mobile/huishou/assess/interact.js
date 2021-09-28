// 执行交互效果
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    var
        interact = {
            group : {
                collapse : __collapseGroup,
                expand   : __expandGroup,
                scroll   : __scrollGroupToTop
            },
            page  : {}
        }

    tcb.mix (a, {
        interact: interact,

        doSetOptionSelected : doSetOptionSelected,

        doAnimateGroupSelected : doAnimateGroupSelected,
        doSetGroupSelected     : doSetGroupSelected,

        doAnimateActiveGroup : doAnimateActiveGroup,
        doSetActiveGroup     : doSetActiveGroup,

        doAnimateNoActiveGroup : doAnimateNoActiveGroup,
        doSetNoActiveGroup     : doSetNoActiveGroup,

        resizeScrollInnerHeight : resizeScrollInnerHeight,

        doSetAssessProcess : doSetAssessProcess
    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    // 执行选项被选中
    //  options参数:
    //      animate  {Boolean} 动画效果
    //      before   {Function} 选中之前
    //      after    {Function} 选中之后(指定的delay时间,没有delay参数,则用默认的延迟时间)
    //      complete {Function} 选中完成
    //      delay    {Number} after延迟执行时间
    function doSetOptionSelected ($TheOption, options) {
        if (!($TheOption && $TheOption.length)) {

            return
        }

        // 评估组
        var $TheGroup = $TheOption.closest ('.' + a.CLASS_NAME.block_option_group),

            // 是否要动画
            animate = options[ 'animate' ] || false,
            // 选中前
            before = options[ 'before' ] || a.noop,
            // 选中后
            after = options[ 'after' ] || a.noop,
            // 选中完成(各种动画执行完毕等等..)
            complete = options[ 'complete' ] || a.noop,

            // 延时(无动画效果时,此参数无效)
            delay = parseInt (options[ 'delay' ], 10) || 300

        // 回调函数-选中前(包括option的基本状态设置之前)
        typeof before === 'function' && before ($TheOption, $TheGroup, options)

        // 将选项设置为选中状态
        __setOptionSelectedStatus ($TheOption, $TheGroup)

        // 没有动画,所有动画效果,包括延时,均失效
        if (!animate) {

            //选中选项(静态)
            __selectOptionSilence ($TheGroup, {
                collapse : options[ 'collapse' ],
                scroll   : options[ 'scroll' ]
            })

            // 回调函数--选中延时之后...
            typeof after === 'function' && after ($TheOption, $TheGroup, options)

            // 回调函数-选中完成
            typeof complete === 'function' && complete ($TheOption, $TheGroup, options)

        } else {
            // 执行选中动画,返回动画最终执行时间
            // 选中选项(动画)
            var complete_delay = __selectOptionAnimate ($TheGroup,
                {
                    callback : function () {
                        // 回调函数-选中完成(动画结束)
                        typeof complete === 'function' && complete ($TheOption, $TheGroup, options)
                    },

                    collapse          : options[ 'collapse' ],
                    collapse_duration : options[ 'collapse_duration' ],
                    collapse_delay    : options[ 'collapse_delay' ],
                    scroll            : options[ 'scroll' ],
                    scroll_duration   : options[ 'scroll_duration' ],
                    scroll_delay      : options[ 'scroll_delay' ]
                })

            var after_delay = Math.min (complete_delay, delay)
            // 回调执行延迟时间
            setTimeout (function () {
                // 回调函数--选中延时之后...
                typeof after === 'function' && after ($TheOption, $TheGroup, options)
            }, after_delay)
        }

    }

    // 选中选项(动画)
    function __selectOptionAnimate ($TheGroup, options) {
        var
            default_collapse_duration = 200, // 默认收起延时时间
            default_collapse_delay = 300, // 默认收起延时时间
            default_scroll_duration = 250, // 默认滚动周期
            default_scroll_delay = 210, // 默认滚动延时

            // 各种动画执行完毕等等..
            callback = options[ 'callback' ],

            // 收起
            collapse = options[ 'collapse' ] || false,
            // 收起动画周期
            collapse_duration = parseInt (options[ 'collapse_duration' ], 10) || default_collapse_duration,
            // 延迟开始收起时间
            collapse_delay = parseInt (options[ 'collapse_delay' ], 10) || default_collapse_delay,

            // 滚动
            scroll = options[ 'scroll' ] || false,
            // 滚动动画周期
            scroll_duration = a.scroll.getInst ().options.animationDuration || default_scroll_duration,
            // 延迟开始滚动时间
            scroll_delay = parseInt (options[ 'scroll_delay' ], 10) || default_scroll_delay

        // 收起组,延迟执行收起
        if (collapse) {
            setTimeout (function () {
                // 收起选项组
                interact.group.collapse ($TheGroup, {
                    active   : true,
                    animate  : true,
                    duration : collapse_duration
                })
            }, collapse_delay)
            // 有收起动画时,需要将收起延时collapse_delay加到滚动延时scroll_delay之上
            scroll_delay += collapse_delay
        } else {
            collapse_duration = 0
            collapse_delay = 0
        }
        // 延迟执行滚动
        if (scroll) {
            setTimeout (function () {
                // 将选项组滚动置顶
                interact.group.scroll ($TheGroup, true)
            }, scroll_delay)
        } else {
            scroll_duration = 0
            scroll_delay = 0
        }

        // 完成时间取动画最终结束的时间
        var complete_delay = Math.max (scroll_delay + scroll_duration, collapse_delay + collapse_duration)
        setTimeout (function () {

            // 回调函数-选中完成
            typeof callback === 'function' && callback ()

        }, complete_delay)

        return complete_delay
    }

    // 选中选项(静态)
    function __selectOptionSilence ($TheGroup, options) {
        // 收起,默认收起
        var
            collapse = options[ 'collapse' ] || false,
            // 滚动,默认滚动
            scroll = options[ 'scroll' ] || false

        // 收起
        if (collapse) {
            interact.group.collapse ($TheGroup, {
                active   : true,
                animate  : false,
                duration : 0
            })
        }
        // 滚动置顶
        if (scroll) {
            interact.group.scroll ($TheGroup, false)
        }

    }


    //======= 选定评估组 =======
    // 执行选项组项被选中后的动画效果
    function doAnimateGroupSelected ($TheGroup, callback, duration) {
        if (!($TheGroup && $TheGroup.length)) {

            return
        }
        interact.group.collapse ($TheGroup, {
            active   : true,
            animate  : true,
            duration : duration || 200
        }, callback)
    }

    // 执行选项组项被选中后的状态变化
    function doSetGroupSelected ($TheGroup) {
        if (!($TheGroup && $TheGroup.length)) {

            return
        }

        interact.group.collapse ($TheGroup, {
            active   : true,
            animate  : false,
            duration : 0
        })
    }


    function doAnimateOptionsModify ($TheGroup, callback, delay) {

    }

    //======= 激活评估组 =======
    // 激活指定评估组(有动画效果)
    function doAnimateActiveGroup ($TheGroup, callback, duration) {
        if (!($TheGroup && $TheGroup.length)) {

            return
        }
        // 展开选项组
        interact.group.expand ($TheGroup, {
            animate  : true,
            duration : duration || 200
        }, callback)
    }

    // 激活指定评估组(无动画效果)
    function doSetActiveGroup ($TheGroup, callback) {
        if (!($TheGroup && $TheGroup.length)) {

            return
        }
        // 展开选项组
        interact.group.expand ($TheGroup, {
            animate : false
        }, callback)
    }


    //======= 不激活评估组 ========
    // 设定评估组不激活(有动画效果)
    function doAnimateNoActiveGroup ($TheGroup, callback, duration) {
        if (!($TheGroup && $TheGroup.length)) {

            return
        }

        // 回调执行延迟时间
        duration = parseInt (duration || 210, 10) || 210

        interact.group.collapse ($TheGroup, {
            active   : false,
            animate  : true,
            duration : duration
        }, callback)

    }

    // 设定评估组不激活(无动画效果)
    function doSetNoActiveGroup ($TheGroup, callback) {
        if (!($TheGroup && $TheGroup.length)) {

            return
        }

        // 非激活,收起状态
        interact.group.collapse ($TheGroup, {
            active  : false,
            animate : false
        }, callback)

    }


    // 根据组重置dimension,
    // 返回组离页面顶部的距离
    function resizeScrollInnerHeight ($TheGroup) {
        var
            $Container = a.scroll.getContainer (),
            $Inner = a.scroll.getInner (),

            scroll_top_pos = 0,
            inner_padding_top = 0,//parseInt($Inner.css('padding-top'), 10) || 0,

            innerOffset = $Inner.offset ()

        if ($TheGroup && $TheGroup.length) {
            var
                groupOffset = $TheGroup.offset ()

            // 滚动位置(算上inner的padding-top)
            scroll_top_pos = groupOffset[ 'top' ] - (innerOffset[ 'top' ] + inner_padding_top)
        }
        // 根据滚动位置设定新的内容虚拟高度(限定滚动的最大位置)
        var inner_height = Math.max ($Container.height () + scroll_top_pos, innerOffset[ 'height' ])

        a.scroll.setDimensions (0, 0, 0, inner_height)

        return scroll_top_pos
    }


    // =================================================================
    // 私有接口 private
    // =================================================================

    // 将选项设置为选中状态
    function __setOptionSelectedStatus ($TheOption, $TheGroup) {
        var
            option_name = $TheOption.attr ('data-name'),
            is_mix = a.util.is_mix ($TheOption)

        if (is_mix) {
            var
                default_checked_id = $TheOption.attr ('data-checked-id')
            if ($TheOption.hasClass (a.CLASS_NAME.option_item_selected)) {
                // 已经被选中,取消选中状态
                $TheOption
                    .removeClass (a.CLASS_NAME.option_item_selected)
            } else {
                // 设置选中状态
                $TheOption
                    .addClass (a.CLASS_NAME.option_item_selected)
                    .siblings ('[data-checked-id="' + default_checked_id + '"]')
                    .removeClass (a.CLASS_NAME.option_item_selected)

            }
        } else {

            // 设置选中状态
            $TheOption
                .addClass (a.CLASS_NAME.option_item_selected)
                .siblings ()
                .removeClass (a.CLASS_NAME.option_item_selected)

            // 更新选中项显示内容
            $TheGroup.find ('.' + a.CLASS_NAME.col_desc).html (option_name)

        }
    }


    /**
     * 收起组
     *
     * @param $TheGroup
     * @param options
     * @param callback
     * @private
     */
    function __collapseGroup ($TheGroup, options, callback) {
        var
            active = options[ 'active' ], // 是否激活状态
            // 动画
            animate = options[ 'animate' ] || false,
            // 动画周期
            duration = options[ 'duration' ]

        // 收起(动画)
        if (animate) {

            __collapseGroupAnimate ($TheGroup, {
                duration : duration,
                callback : callback
            }, active)
        }
        // 收起(静态)
        else {

            __collapseGroupSilence ($TheGroup, active)

            typeof callback === 'function' && callback ()
        }
    }

    // 收起组(动画)
    function __collapseGroupAnimate ($TheGroup, options, active) {
        if (!($TheGroup && $TheGroup.length)) {

            return
        }

        // 激活状态
        if (active) {
            __collapseGroupAnimateActive ($TheGroup, options)
        }
        // 非激活状态
        else {
            __collapseGroupAnimateNoActive ($TheGroup, options)
        }

    }

    // 收起组(动画)---激活状态
    function __collapseGroupAnimateActive ($TheGroup, options) {
        var
            callback = options[ 'callback' ],
            duration = options[ 'duration' ] || 200

        $TheGroup
            .addClass (a.CLASS_NAME.block_option_group_selected)
            .css (
            {
                'height' : $TheGroup.height ()
            })
            .animate (
            {
                'opacity' : 0.4,
                'height'  : '.44rem'
            }, duration, function () {
                var
                    $RowSelected = $TheGroup.find ('.' + a.CLASS_NAME.row_option_selected)

                $RowSelected.siblings ().hide ()
                $RowSelected.css ({
                    'display'     : 'block',
                    'line-height' : '.5rem'
                }).animate ({ 'line-height' : '.44rem' }, 200)

                $TheGroup.animate ({ 'opacity' : 1 }, 100)

                typeof callback === 'function' && callback ()
            })
    }

    // 收起组(动画)---非激活状态
    function __collapseGroupAnimateNoActive ($TheGroup, options) {
        var
            callback = options[ 'callback' ],
            duration = options[ 'duration' ] || 200

        $TheGroup
            .css (
            {
                'height' : $TheGroup.height ()
            })
            .animate (
            {
                'opacity' : 0.4,
                'height'  : '.36rem'
            }, duration, function () {
                var
                    $RowTit = $TheGroup.find ('.' + a.CLASS_NAME.row_option_group_tit)

                $RowTit.show ()
                    .siblings ().hide ()

                $TheGroup
                    .removeClass (a.CLASS_NAME.block_option_group_selected)
                    .addClass (a.CLASS_NAME.block_option_group_no_active)
                    .animate ({ 'opacity' : 1 }, 100)

                typeof callback === 'function' && callback ()
            })
    }

    // 收起组(静态)
    function __collapseGroupSilence ($TheGroup, active) {
        if (!($TheGroup && $TheGroup.length)) {

            return
        }

        // 激活状态
        if (active) {
            __collapseGroupSilenceActive ($TheGroup)
        }
        // 非激活状态
        else {
            __collapseGroupSilenceNoActive ($TheGroup)
        }
    }

    // 收起组(静态)---激活状态
    function __collapseGroupSilenceActive ($TheGroup) {
        $TheGroup
            .removeClass (a.CLASS_NAME.block_option_group_no_active)
            .addClass (a.CLASS_NAME.block_option_group_selected)
            //.addClass (a.CLASS_NAME.block_option_group_collapse)
            .css (
            {
                'height' : '.44rem'
            })

        var
            $RowSelected = $TheGroup.find ('.' + a.CLASS_NAME.row_option_selected)

        $RowSelected.css (
            {
                'display'     : 'block',
                'line-height' : '.44rem'
            })
            .siblings ().hide ()
    }

    // 收起组(静态)---非激活状态
    function __collapseGroupSilenceNoActive ($TheGroup) {
        $TheGroup
            .removeClass (a.CLASS_NAME.block_option_group_selected)
            .addClass (a.CLASS_NAME.block_option_group_no_active)
            .css (
            {
                'height' : '.36rem'
            })

        var
            $RowTit = $TheGroup.find ('.' + a.CLASS_NAME.row_option_group_tit)

        $RowTit.show ()
            .siblings ().hide ()
    }



    /**
     * 展开组
     * @param $TheGroup
     * @param options
     * @param callback
     * @private
     */
    function __expandGroup ($TheGroup, options, callback) {
        var
            animate = options[ 'animate' ] || false,// 动画
            // 动画周期
            duration = options[ 'duration' ]

        // 展开组(动画)
        if (animate) {

            __expandGroupAnimate ($TheGroup, {
                duration : duration,
                callback : callback
            })
        }
        // 展开组(静态)
        else {

            __expandGroupSilence ($TheGroup)

            typeof callback === 'function' && callback ()
        }

    }

    // 展开组(动画)
    function __expandGroupAnimate ($TheGroup, options) {
        var
            callback = options[ 'callback' ],
            duration = options[ 'duration' ] || 200

        var
            $RowSelected = $TheGroup.find ('.' + a.CLASS_NAME.row_option_selected),
            $Siblings = $RowSelected.siblings (),
            target_height = 0

        $RowSelected.hide ()
        $Siblings.show ()

        // 计算目标滚动的 高度
        $Siblings.each (function () {
            var
                $el = $ (this)

            target_height += $el.height ()
        })

        $TheGroup
            .css (
            {
                'opacity' : 0.4,
                'height'  : '.44rem'
            })
            .animate (
            {
                'opacity' : 1,
                'height'  : target_height
            }, duration, function () {

                $TheGroup
                    .removeClass (a.CLASS_NAME.block_option_group_selected)
                    .removeClass (a.CLASS_NAME.block_option_group_no_active)

                typeof callback === 'function' && callback ()
            })
    }

    // 展开组(静态)
    function __expandGroupSilence ($TheGroup) {
        var
            $RowSelected = $TheGroup.find ('.' + a.CLASS_NAME.row_option_selected)

        $RowSelected.hide ()
            .siblings ().show ()

        $TheGroup
            .css (
            {
                'opacity' : 1,
                'height'  : 'auto'
            })
            .removeClass (a.CLASS_NAME.block_option_group_selected)
            .removeClass (a.CLASS_NAME.block_option_group_no_active)
    }



    /**
     * 将组滚动置顶
     * @param $TheGroup
     * @param animate
     * @param callback
     * @private
     */
    function __scrollGroupToTop ($TheGroup, animate, callback) {

        animate = !!animate || false

        var
            inst = a.scroll.getInst (),
            // 滚动位置
            scroll_top_pos = a.resizeScrollInnerHeight ($TheGroup)

        // 滚动到指定位置
        inst.scrollTo (0, scroll_top_pos, animate)

        if (animate) {
            setTimeout (function () {
                // 完成滚动
                typeof callback === 'function' && callback (inst.options.animationDuration)
            }, inst.options.animationDuration)
        } else {
            // 完成滚动
            typeof callback === 'function' && callback (0)
        }
    }


    // 设置评估进度
    function doSetAssessProcess (is_special) {
        var
            step = __getAssessStep (),
            step_cur = __getAssessedStep (is_special),
            percent = Math.ceil ((step_cur / step) * 100)

        percent = percent > 99 ? 99 : percent

        if (!percent) {
            step = 11
            step_cur = 5
            percent = Math.ceil ((step_cur / step) * 100)
        }

        // 设置评估进度
        $ ('.block-process-status-bar .block-inner').css ({
            'width' : percent + '%'
        })
    }

    // 获取评估总步数
    function __getAssessStep () {
        var
            step = 0,
            sku_attr_cate = a.cache.ex (a.KEY_SKU_ATTR_CATE) || [],
            special_options_cate = a.cache.ex (a.KEY_SPECIAL_OPTIONS_CATE) || [],
            mix_len = 1,
            screenDetected = a.cache (a.KEY_OPTIONS_SCREEN_DETECTED) || []

        step = step
        + sku_attr_cate.length
        + special_options_cate.length + mix_len
        + screenDetected.length
        + 3

        return step
    }

    // 获取当前已经评估步数
    function __getAssessedStep (is_special) {
        var
            step = 0,
            model_id = a.cache.getModelId (),
            checked_sku_comb = a.cache.doGetCheckedComb(true),
            checked_special_comb = a.cache.doGetCheckedComb(false),
            screenDetected = a.cache (a.KEY_OPTIONS_SCREEN_DETECTED) || []

        if (model_id) {

            step += 3
            + checked_sku_comb.length
            + screenDetected.length

            if (is_special) {
                step = checked_special_comb[ 0 ] ? step + 1 : step
                step = (checked_special_comb[ 1 ] && checked_special_comb[ 1 ].length)
                    ? step + checked_special_comb[ 1 ].length
                    : step
            }
        }

        return step
    }



} (this)
