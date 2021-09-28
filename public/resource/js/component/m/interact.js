// 执行交互效果
// 滚动效果依赖scroll组建
!function (global) {
    var
        Root = tcb.getRoot (),
        interact = {}

    // 添加到根作用域
    tcb.addToRoot ('interact', interact)

    tcb.mix (interact, {
        collapse : __collapse,
        expand   : __expand,
        scroll   : __scrollTo,
        resize   : __resize
    })

    // =================================================================
    // 公共接口 public
    // =================================================================



    // =================================================================
    // 私有接口 private
    // =================================================================


    /**
     * 收起组
     *
     * @param $TheGroup
     * @param options
     * @param callback
     * @private
     */
    function __collapse ($TheGroup, options, callback) {
        var
            active = options[ 'active' ], // 是否激活状态
            // 动画
            animate = options[ 'animate' ] || false,
            // 动画周期
            duration = options[ 'duration' ]

        // 收起(动画)
        if (animate) {

            __collapseAnimate ($TheGroup, {
                duration : duration,
                callback : callback
            }, active)
        }
        // 收起(静态)
        else {

            __collapseSilence ($TheGroup, active)

            typeof callback === 'function' && callback ()
        }
    }

    // 收起组(动画)
    function __collapseAnimate ($TheGroup, options, active) {
        if (!($TheGroup && $TheGroup.length)) {

            return
        }

        // 激活状态
        if (active) {
            __collapseAnimateActive ($TheGroup, options)
        }
        // 非激活状态
        else {
            __collapseAnimateNoActive ($TheGroup, options)
        }

    }

    // 收起组(动画)---激活状态
    function __collapseAnimateActive ($TheGroup, options) {
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
    function __collapseAnimateNoActive ($TheGroup, options) {
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
    function __collapseSilence ($TheGroup, active) {
        if (!($TheGroup && $TheGroup.length)) {

            return
        }

        // 激活状态
        if (active) {
            __collapseSilenceActive ($TheGroup)
        }
        // 非激活状态
        else {
            __collapseSilenceNoActive ($TheGroup)
        }
    }

    // 收起组(静态)---激活状态
    function __collapseSilenceActive ($TheGroup) {
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
    function __collapseSilenceNoActive ($TheGroup) {
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
    function __expand ($TheGroup, options, callback) {
        var
            animate = options[ 'animate' ] || false,// 动画
            // 动画周期
            duration = options[ 'duration' ]

        // 展开组(动画)
        if (animate) {

            __expandAnimate ($TheGroup, {
                duration : duration,
                callback : callback
            })
        }
        // 展开组(静态)
        else {

            __expandSilence ($TheGroup)

            typeof callback === 'function' && callback ()
        }

    }

    // 展开组(动画)
    function __expandAnimate ($TheGroup, options) {
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
    function __expandSilence ($TheGroup) {
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
    function __scrollTo ($TheGroup, animate, callback) {

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


    // 根据组重置dimension,
    // 返回组离页面顶部的距离
    function __resize ($TheGroup) {
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



} (this)