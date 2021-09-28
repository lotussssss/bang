// 页面相关函数
// 依赖于scroll
// 依赖于route
!function (global) {
    var
        Root = tcb.getRoot (),
        noop = tcb.noop,
        scroll = Root.scroll,
        page = {},

        // 私有变量
        p = {
            index     : 0,
            key_to_id : {},
            map       : {
                enter : null,
                leave : null
            },

            renderMap : {},
            render    : function (render_key) {
                var
                    render_fn = noop
                if (render_key && typeof this.renderMap[ render_key ] === 'function') {
                    render_fn = this.renderMap[ render_key ]
                }
                return render_fn
            },

            eventMap : {},
            event    : function (event_key) {
                var
                    event_fn = noop
                if (event_key && typeof this.eventMap[ event_key ] === 'function') {
                    event_fn = this.eventMap[ event_key ]
                }
                return event_fn
            },

            defaultAnimate : __defaultAnimate,

            $Page : null
        }

    // 添加到根作用域
    tcb.addToRoot ('page', page)

    tcb.mix (page, {

        generator : generator,

        generateIds : generateIds,
        getId       : getId,

        get : getPage,
        set : setPage,

        setRender : setRender,
        setEvent  : setEvent,

        addRender : addRender,
        addEvent  : addEvent,

        setEnter : setEnterPage,
        setLeave : setLeavePage,

        getEnter : getEnterPage,
        getLeave : getLeavePage,

        setDefaultAnimate : setDefaultAnimate,

        transitionPopIn  : transitionPopIn,
        transitionPopOut : transitionPopOut,

        silenceIn : silenceIn,

        /**
         * 页面进入,
         * 根据不同的进入方式,执行不同的动画,进入方式由route组建确定
         */
        comeIn : comeIn

    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    // 页面生成器
    function generator (options, active) {

        var
            $Page = null,
            id = options[ 'id' ],
            target = options[ 'target' ] || null,
            data = options[ 'data' ] || {},
            render = options[ 'render' ] || '',
            complete = typeof options[ 'complete' ] === 'function' ? options[ 'complete' ] : noop

        var
            render_fn = p.render (render),
            event_fn = p.event (render)
        if (typeof render_fn === 'function') {
            $Page = render_fn ({
                id       : id,
                data     : data,
                event    : event_fn,
                target   : target,
                complete : complete
            })
        }

        if ($Page && !active) {
            page.set ($Page)
        }

        return $Page
    }

    // 设置输出器
    function setRender (render_emit) {
        return p.render = render_emit
    }

    // 设置事件分发器
    function setEvent (event_emit) {
        return p.event = event_emit
    }

    // 添加render函数
    function addRender (render) {
        if (typeof render === 'function') {
            p.renderMap[ render.name ] = render
        } else if (typeof render === 'object') {
            for (var key in render) {
                if (render.hasOwnProperty (key) && typeof render[ key ] === 'function') {

                    p.renderMap[ key ] = render[ key ]
                }
            }
        }
    }

    // 添加event函数
    function addEvent (event) {
        if (typeof event === 'function') {
            p.eventMap[ event.name ] = event
        } else if (typeof event === 'object') {
            for (var key in event) {
                if (event.hasOwnProperty (key) && typeof event[ key ] === 'function') {

                    p.eventMap[ key ] = event[ key ]
                }
            }
        }
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
                p.key_to_id [ keys[ i ] ] = 'IAMPageGenerator' + p.index
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
     * 根据不同的进入方式,执行不同的动画,进入方式由route组件确定
     * @param $Enter
     * @param router_inst
     * @param callback
     * @param duration
     */
    function comeIn ($Enter, router_inst, callback, duration) {
        var
            $Leave = null,
            direction = router_inst.direction ()

        page.setEnter ($Enter)

        if (direction == 0) {
            // 刷新页面

            page.silenceIn({
                callback : callback
            })
        }
        else if (direction > 0) {
            // 前进
            var
                route_prev = router_inst.prev ()
            if (route_prev) {
                $Leave = page.get (route_prev) || null
                page.setLeave ($Leave)
            }
            // 页面滑入[从右到左]
            page.transitionPopIn ({
                duration : duration || 250,
                callback : callback
            })
        } else {
            // 回退
            var
                route_next = router_inst.next ()
            if (route_next) {
                $Leave = page.get (route_next) || null
                page.setLeave ($Leave)
            }
            // 页面滑出[从左到右]
            page.transitionPopOut ({
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
            $Leave = page.getLeave (),
            $Enter = page.getEnter ()
        if (!($Enter && $Enter.length)) {
            console.error ('请至少设置进入页面')
            return
        }
        direction = direction === 'out' ? 'out' : 'in'

        // 设置scroll的inner元素
        scroll.setInner ($Enter)

        var
            direction_class = direction === 'in'
                ? 'transition-pop-in-enter'
                : 'transition-pop-out-enter'
        $Enter.addClass (direction_class)

        var
            duration = options[ 'duration' ] || 500,
            callback = options[ 'callback' ] || '',

            inst = scroll.getInst (),

            orig_duration = inst.options.animationDuration,
            orig_client_width = inst.__clientWidth,
            orig_client_height = inst.__clientHeight,
            orig_content_width = inst.__contentWidth,
            orig_content_height = inst.__contentHeight

        inst.options.animationDuration = duration

        // 设置动画执行函数
        scroll.setRunning (function (left, top, zoom, $el, setTranslateAndZoom) {
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
        scroll.setDimensions (orig_client_width, orig_client_height, orig_content_width * 2, orig_content_height)
        // 设置滚动距离--执行切换..
        inst.scrollBy (orig_content_width, 0, true)
        // 页面切换完成
        setTimeout (function () {
            // 恢复动画时间
            inst.options.animationDuration = orig_duration

            //if ($Leave && $Leave.length) {
            //    $Leave.remove ()
            //}
            $Enter.removeClass (direction_class)
                // 直接干掉其他所有相邻节点，
                // 避免某些情况导致之前有不用的节点没有被正常移除
                .siblings ().remove ()

            // 动画执行完毕,
            // 将$Leave和$Enter移出map,$Enter加入当前page
            page.setEnter (null)
            page.setLeave (null)
            page.set ($Enter)

            // 重置动画
            scroll.setRunning (__defaultAnimate)
            // 设置页面新宽度
            scroll.setDimensions (orig_client_width, orig_client_height, orig_content_width, $Enter.height ())
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
     * 无动画进入
     * @param options
     */
    function silenceIn (options) {
        var
            $Enter = page.getEnter ()
        if (!($Enter && $Enter.length)) {
            console.error ('请至少设置进入页面')
            return
        }

        // 设置scroll的inner元素
        scroll.setInner ($Enter)

        var
            callback = options[ 'callback' ] || '',
            inst = scroll.getInst ()


        // 直接干掉其他所有相邻节点，
        // 避免某些情况导致之前有不用的节点没有被正常移除
        $Enter.siblings ().remove ()

        // 动画执行完毕,
        // 将$Leave和$Enter移出map,$Enter加入当前page
        page.setEnter (null)
        page.setLeave (null)
        page.set ($Enter)

        // 重置动画
        scroll.setRunning (__defaultAnimate)
        // 设置页面新宽度
        scroll.setDimensions (0, 0, 0, $Enter.height ())
        // 设置滚动位置,重置为0点
        inst.scrollTo (0, 0, false)

        typeof  callback === 'function' && callback ($Enter)
    }

    // 设置默认动画
    function setDefaultAnimate (animate) {
        if (typeof animate === 'function') {
            p.defaultAnimate = animate
        }
    }


    // =================================================================
    // 私有接口 private
    // =================================================================


    function __defaultAnimate (left, top, zoom, $el, setTranslateAndZoom) {

        setTranslateAndZoom ($el[ 0 ], left, top, zoom)
    }



} (this)