// 页面相关函数
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess,

        // 私有变量
        p = {
            index     : 0,
            key_to_id : {},
            map       : {
                enter : null,
                leave : null
            },
            $Page     : null
        }

    a.page = {}

    tcb.mix (a.page, {

        generator : generator,

        generateIds : generateIds,
        getId       : getId,

        get : getPage,
        set : setPage,

        setEnter : setEnterPage,
        setLeave : setLeavePage,

        getEnter : getEnterPage,
        getLeave : getLeavePage,

        transitionPopIn  : transitionPopIn,
        transitionPopOut : transitionPopOut,

        /**
         * 页面进入,
         * 根据不同的进入方式,执行不同的动画,进入方式由route组建确定
         */
        comeIn : comeIn,


        // 页面初始化

        initBasicPage : initBasicPage

    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    // 页面生成器
    function generator (options, active) {
        var
            $Page = null,
            id = options[ 'id' ],
            data = options[ 'data' ] || {},
            render = options[ 'render' ] || ''

        var
            render_fn = a.render (render),
            event_fn = a.event (render)
        if (typeof render_fn === 'function') {

            $Page = render_fn (id, data, event_fn)
        }

        return !!active ? a.page.set ($Page) : $Page
    }

    /**
     * 根据key集合,生成key和页面唯一标识符的映射表,方便以后根据key来索引页面
     * @param keys
     */
    function generateIds (keys) {
        keys = typeof keys === 'string' ? [ keys ] : keys
        keys = keys instanceof Array ? keys : []

        for (var i = 0; i < keys.length; i++) {
            // 只有key没有映射才添加,
            // 否则就不再添加或者覆盖,直接跳过不处理
            if (!p.key_to_id [ keys[ i ] ]) {
                p.index++
                p.key_to_id [ keys[ i ] ] = 'AssessInnerPage' + p.index
            }
        }
    }

    /**
     * 根据key获取页面id
     * @param key
     * @returns {string}
     */
    function getId (key) {
        var
            page_id = ''
        if (key) {
            page_id = p.key_to_id[ key ] || ''
        }
        return page_id
    }

    function getPage (key) {
        var
            $Page = null
        // 根据key获取页面
        if (key) {
            var
                page_id = p.key_to_id[ key ]
            if (page_id) {
                $Page = $ ('#' + page_id)
                $Page = $Page && $Page.length ? $Page : null
            }
        } else {
            if (!(p.$Page && p.$Page.length)) {
                console.error ('获取不到当前页面，请先设置页面')
                return
            }
            $Page = p.$Page
        }

        return $Page
    }

    function setPage ($Page) {return p.$Page = $Page}

    function setEnterPage ($Enter) {return p.map.enter = $Enter}

    function setLeavePage ($Leave) {return p.map.leave = $Leave}

    function getEnterPage () {return p.map.enter}

    function getLeavePage () {return p.map.leave}

    /**
     * 页面进入,
     * 根据不同的进入方式,执行不同的动画,进入方式由route组建确定
     * @param $Enter
     * @param router_inst
     * @param callback
     * @param duration
     */
    function comeIn ($Enter, router_inst, callback, duration) {
        var
            $Leave = null,
            direction = router_inst.direction ()

        a.page.setEnter ($Enter)

        if (direction > 0) {
            // 前进
            var
                route_prev = router_inst.prev ()
            if (route_prev) {
                $Leave = a.page.get (route_prev) || null
                a.page.setLeave ($Leave)
            }
            // 页面滑入[从右到左]
            a.page.transitionPopIn ({
                duration : duration || 250,
                callback : callback
            })
        } else {
            // 回退
            var
                route_next = router_inst.next ()
            if (route_next) {
                $Leave = a.page.get (route_next) || null
                a.page.setLeave ($Leave)
            }
            // 页面滑出[从左到右]
            a.page.transitionPopOut ({
                duration : duration || 250,
                callback : callback
            })
        }
    }

    /**
     * 页面滑入方法,[根据传入参数区别从右到左(滑入),还是从左到右(滑出)]
     *      进出页面参数位置,根据进出方向位置设定
     * @param direction
     * @param options
     */
    function transitionPop (direction, options) {
        var
            $Leave = a.page.getLeave (),
            $Enter = a.page.getEnter ()
        if (!($Enter && $Enter.length)) {
            console.error ('请至少设置进入页面')
            return
        }
        direction = direction === 'out' ? 'out' : 'in'

        // 设置scroll的inner元素
        a.scroll.setInner ($Enter)

        var
            direction_class = direction === 'in'
                ? 'transition-pop-in-enter'
                : 'transition-pop-out-enter'
        $Enter.addClass (direction_class)

        var
            duration = options[ 'duration' ] || 500,
            callback = options[ 'callback' ] || '',

            inst = a.scroll.getInst (),

            orig_duration = inst.options.animationDuration,
            orig_client_width = inst.__clientWidth,
            orig_client_height = inst.__clientHeight,
            orig_content_width = inst.__contentWidth,
            orig_content_height = inst.__contentHeight

        inst.options.animationDuration = duration

        // 设置动画执行函数
        a.scroll.setRunning (function (left, top, zoom, $el, setTranslateAndZoom) {
            var
                enter_left = direction === 'in'
                    ? left - orig_content_width
                    : orig_content_width - left,
                leave_left = direction === 'in'
                    ? left
                    : -left
            // 页面进入
            setTranslateAndZoom ($Enter[ 0 ], enter_left, 0, zoom)
            // 页面离开
            if ($Leave && $Leave.length) {
                setTranslateAndZoom ($Leave[ 0 ], leave_left, top, zoom)
            }
        })
        // 设置尺寸,用于页面切换(页面切换后再重置)
        a.scroll.setDimensions (orig_client_width, orig_client_height, orig_content_width * 2, orig_content_height)
        // 设置滚动距离--执行切换..
        inst.scrollBy (orig_content_width, 0, true)
        // 页面切换完成
        setTimeout (function () {
            // 恢复动画时间
            inst.options.animationDuration = orig_duration

            if ($Leave && $Leave.length) {
                $Leave.remove ()
            }
            $Enter.removeClass (direction_class)

            // 动画执行完毕,
            // 将$Leave和$Enter移出map,$Enter加入当前page
            a.page.setEnter (null)
            a.page.setLeave (null)
            a.page.set ($Enter)

            // 重置动画
            a.scroll.setRunning (__defaultAnimate)
            // 设置页面新宽度
            a.scroll.setDimensions (orig_client_width, orig_client_height, orig_content_width, $Enter.height ())
            // 设置滚动位置,重置为0点
            inst.scrollTo (0, 0, false)

            typeof  callback === 'function' && callback ($Enter)

        }, inst.options.animationDuration)

    }

    /**
     * 页面滑入[从右到左]
     *      进出页面参数位置,根据进出方向位置设定
     * @param options
     */
    function transitionPopIn (options) {
        transitionPop ('in', options)
    }

    /**
     * 页面滑出[从左到右]
     *      进出页面参数位置,根据进出方向位置设定
     * @param options
     */
    function transitionPopOut (options) {
        transitionPop ('out', options)
    }


    /**
     * 初始化基础评估页面状态
     * @param $Enter
     */
    function initBasicPage ($Enter) {
        var
            model_id = a.cache.getModelId ()

        // 页面初始化输出时，
        // 机型已经选中
        if (model_id) {

            var
                $FirstGroup = $Enter
                    .find ('.' + a.CLASS_NAME.block_model_basic_info)
                    .find ('.' + a.CLASS_NAME.block_option_group).eq (0)

            if (a.cache (a.KEY_MODELS_COUNT) > 1) {
                // 机型数量大于1个

                var $ModelGroup = $FirstGroup,
                    $ModelOption = $ModelGroup.find ('.' + a.CLASS_NAME.option_item + '[data-id="' + model_id + '"]')

                a.eventHandle.__doSelectOption ($ModelOption, {
                    animate  : false,
                    // 选中相关操作执行前,预处理回调函数
                    before   : a.eventHandle.__doSelectModelBefore,
                    // 选中之后的回调函数
                    after    : a.eventHandle.__doSelectModelAfter,
                    collapse : false,
                    scroll   : false
                })

            } else {
                // 机型数量为1
                // 继续设置 SKU 评估组的显示状态

                //======= TEST START =======
                // var pos = +$FirstGroup.attr('data-pos')
                // $Enter
                //     .find ('.' + a.CLASS_NAME.block_model_basic_info)
                //     .find ('.' + a.CLASS_NAME.block_option_group)
                //     .remove()
                // a.render ('assessSkuGroups') (pos)
                // // 重新输出SKU评估组后，重新获取第一个评估组
                // $FirstGroup = $Enter
                //     .find('.' + a.CLASS_NAME.block_model_basic_info)
                //     .find('.' + a.CLASS_NAME.block_option_group).eq(0)
                //======= TEST END =======

                // 前置展示的专有评估项组
                a.render ('assessPreSpecialGroups') ()
                a.render ('assessSpecialGroups') ()

                var $OptionGroup = $FirstGroup,
                    mem_id = a.cache (a.KEY_OPTIONS_MEM_DETECTED)

                // 设置下一个 SKU 评估组的显示状态[递归遍历所有的 SKU 组]
                a.eventHandle.__setNextSkuGroupStatus ($OptionGroup, {
                    animate      : false,
                    no_active    : false,
                    delimiter_id : mem_id
                })
            }

            var
                $Container = a.scroll.getContainer (),
                $Inner = a.scroll.getInner (),
                innerOffset = $Inner.offset (),

                // 滚动位置
                // 根据滚动位置设定新的内容虚拟高度(限定滚动的最大位置)
                inner_height = Math.max ($Container.height (), innerOffset[ 'height' ])

            a.scroll.setDimensions (0, 0, 0, inner_height)
        }
    }



    // =================================================================
    // 私有接口 private
    // =================================================================


    function __defaultAnimate (left, top, zoom, $el, setTranslateAndZoom) {
        var
            $Model = a.$Model
        if ($Model && $Model.length) {
            var m_top = top
            if (a.modelHeight < top) {
                m_top = a.modelHeight
            }
            setTranslateAndZoom ($Model[ 0 ], left, m_top, zoom)
        }
        setTranslateAndZoom ($el[ 0 ], left, top, zoom)
    }



} (this)
