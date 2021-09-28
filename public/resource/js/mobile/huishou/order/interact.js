// 执行交互效果
!function (global) {
    var
        Root = tcb.getRoot (),
        o = Root.Order

    o.interact = {
        collapse    : __collapseGroup,
        expand      : __expandGroup,
        scrollToTop : __scrollToTop,
        swipeIn     : __swipeIn,
        swipeOut    : __swipeOut
    }

    tcb.mix (o.interact, {

        resizeScrollInnerHeight : resizeScrollInnerHeight

    })


    // =================================================================
    // 公共接口 public
    // =================================================================


    // 根据组重置dimension,
    // 返回组离页面顶部的距离
    function resizeScrollInnerHeight ($Target) {
        var
            $Container = o.scroll.getContainer (),
            $Inner = o.scroll.getInner (),

            target_pos = 0,
            inner_padding_top = 0,//parseInt($Inner.css('padding-top'), 10) || 0,

            innerOffset = $Inner.offset ()

        if ($Target && $Target.length) {
            var
                groupOffset = $Target.offset ()

            // 滚动位置(算上inner的padding-top)
            target_pos = groupOffset[ 'top' ] - (innerOffset[ 'top' ] + inner_padding_top)
        }
        // 根据滚动位置设定新的内容虚拟高度(限定滚动的最大位置)
        var inner_height = Math.max ($Container.height () + target_pos, innerOffset[ 'height' ])

        o.scroll.setDimensions (0, 0, 0, inner_height)

        return target_pos
    }


    // =================================================================
    // 私有接口 private
    // =================================================================

    // 将选项设置为选中状态
    function __setOptionSelectedStatus ($TheOption, $TheGroup) {
        var
            option_name = $TheOption.html (),
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
     * 将元素滚动置顶
     * @param $Target
     * @param animate
     * @param callback
     * @private
     */
    function __scrollToTop ($Target, animate, callback) {

        animate = !!animate || false

        var
            inst = o.scroll.getInst (),
            // 滚动位置
            scroll_top_pos = o.interact.resizeScrollInnerHeight ($Target)

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

    function __swipeIn (options) {
        if (tcb.cache ('swipe-section')) {

            return tcb.cache ('swipe-section', null)
        }

        var
            s = window.Bang.SwipeSection,
            selector = options[ 'selector' ],
            complete = options[ 'complete' ],
            data = options[ 'data' ] || {},
            render = options[ 'render' ] || '',
            percent = options[ 'percent' ],

            $swipe = s.getSwipeSection (selector)

        tcb.cache ('swipe-section', $swipe)

        o.render ({
            data     : data,
            render   : render,
            target   : $swipe.find ('.swipe-section-inner'),

            // 完成内容输出
            complete : function () {
                $swipe.show ()

                setTimeout (function () {
                    percent = Math.min (Math.abs (parseInt (percent, 10)) || 100)

                    s.doLeftSwipeSection (100 - percent, function(){

                        tcb.cache ('swipe-section', null)

                        typeof complete==='function'&&complete()
                    })

                }, 0)
            }

        })
    }

    function __swipeOut (callback) {
        var
            s = window.Bang.SwipeSection

        s.backLeftSwipeSection (callback)

        if (tcb.cache ('swipe-section')) {

            tcb.cache ('swipe-section', null)
        }
    }



} (this)