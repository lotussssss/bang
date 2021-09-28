!function (global) {
    // 添加到根作用域
    tcb.addToRoot ('ScrollFactory', ScrollFactory)

    // scroll工厂类
    function ScrollFactory(options){
        var me = this

        if (!(me instanceof ScrollFactory)) {

            return new ScrollFactory (options)
        }
        var defaults = {
            $Container : null,
            $Inner     : null,
            running    : function (left, top, zoom, $el, setTranslateAndZoom) {
                setTranslateAndZoom ($el[ 0 ], left, top, zoom)
            },
            options    : null,
            afterTouchStart : null,
            afterTouchEnd : null
        }

        me.__options = tcb.mix(defaults, options)
        if (!(this.__options.$Container && this.__options.$Container.length)) {
            return console.error ('请先设置scroll的$Container')
        }
        if (!(this.__options.$Inner && this.__options.$Inner.length)) {
            return console.error ('请先设置scroll的$Inner')
        }

        me.__inst = null
        me.__running = null

        // 设置滚动时的回调函数
        me.setRunning(me.__options.running)

        me.init(me.__options.options)
    }

    var __prototype = {
        init : init,

        getContainer : getContainer,
        setContainer : setContainer,
        getInner : getInner,
        setInner : setInner,

        getInst    : getInst,
        setRunning : setRunning,

        setPosition   : setPosition,
        setDimensions : setDimensions
    }

    // 将prototype变量值添加到原型链prototype
    for (var __prop in __prototype) {
        if (__prototype.hasOwnProperty(__prop)) {
            ScrollFactory.prototype[ __prop ] = __prototype[ __prop ]
        }
    }

    // 初始化scroll实例，并且绑定事件
    function init (options) {
        var me = this,
            defaults = {
                // 禁止横向滚动
                scrollingX : false,
                // 禁止纵向滚动
                scrollingY : false,
                // 不要回弹
                bouncing   : false
            }

        options = tcb.mix(defaults, options||{})

        me.getInst (options)

        me.setDimensions()

        __bindEvent (me)
    }

    function getContainer () {return this.__options.$Container}
    function setContainer ($Container, $Inner) {
        var me = this
        me.__options.$Container = $Container
        me.__options.$Inner = $Inner

        me.setRunning (me.__options.running)
        me.setDimensions()

        __bindEvent (me)

        return me.__options.$Container
    }
    function getInner () {return this.__options.$Inner}
    function setInner ($Inner) {
        var me = this
        me.__options.$Inner = $Inner

        me.setRunning (me.__options.running)
        me.setDimensions()

        return me.__options.$Inner
    }

    // 获取实例
    function getInst (options) {
        var me = this,
            inst = me.__inst

        if (inst) { return inst }

        // 生成一个scroll实例
        inst = new Scroll (function (left, top, zoom) {
            // 此函数在滚动过程中实时执行，需要注意处理效率

            typeof me.__running === 'function' && me.__running (left, top, zoom)
        }, options)

        return me.__inst = inst
    }
    // 设置滚动时的回调函数
    function setRunning (callback) {
        var me = this,
            $Inner = me.getInner ()

        me.__running = function (left, top, zoom) {

            if (typeof callback === 'function') {

                callback (left, top, zoom, $Inner, tcb.setTranslateAndZoom)
            }
        }
    }
    function setPosition (left, top) {
        var me = this,
            inst = me.getInst ()

        left = left || 0
        top = top || 0

        inst.setPosition (left, top)
    }
    function setDimensions (main_width, main_height, inner_width, inner_height) {
        var me = this,
            $Container = me.getContainer (),
            $Inner = me.getInner (),
            inst = me.getInst ()

        main_width = main_width || $Container.width ()
        main_height = main_height || $Container.height ()
        inner_width = inner_width || Math.max ($Inner.width (), main_width)
        inner_height = inner_height || Math.max ($Inner.height (), main_height)

        // 设置容器尺寸
        inst.setDimensions (main_width, main_height, inner_width, inner_height)
    }

    // =================================================================
    // 私有接口 private
    // =================================================================

    // 绑定事件
    function __bindEvent (me) {
        var //$Doc = tcb.getDoc (),
            $Container = me.getContainer (),
            inst = me.getInst (),
            // 用来标识在Container中的滑动
            //flag = false,
            // 触摸点位置
            touch_point = null,
            touch_direction = ''

        // 绑定滚动事件
        $Container.on ('touchstart', __touchStart)
        $Container.on ('touchmove', __touchMove, {passive : false})
        $Container.on ('touchend', __touchEnd)

        function __touchStart(e){
            e.stopPropagation()
            // flag设置为true表示滑动开始
            //flag = true

            // 设置触摸点在屏幕上的位置
            touch_point = [ e.touches[ 0 ].clientX, e.touches[ 0 ].clientY ]

            // 滑动开始
            inst.doTouchStart (e.touches, e.timeStamp)

            typeof me.__options.afterTouchStart==='function' && me.__options.afterTouchStart()
        }
        function __touchMove(e) {
            //if (flag){
                if (!touch_direction) {
                    // 此处做简单处理，只根据方向移动差值处理；
                    // 更精细的方式应该是根据比例系数判断，不同的比例系数区域可以确定是x、y或者斜着滑动；

                    // 滑动时候如果横向x方向移动的坐标大于纵向y坐标，那么表示是手指滑动方向为横向x方向
                    if (Math.abs (e.touches[ 0 ].clientX - touch_point[ 0 ]) - Math.abs (e.touches[ 0 ].clientY - touch_point[ 1 ]) > 0) {
                        touch_direction = 'x'
                    } else {
                        touch_direction = 'y'
                    }
                }

                var flag_move = false

                if (inst.options.scrollingX && inst.options.scrollingY) {
                    // 开启x和y两个方向的滑动

                    flag_move = true
                } else if (inst.options.scrollingX && touch_direction=='x') {
                    // 只开启了x方向滑动

                    flag_move = true
                } else if (inst.options.scrollingY && touch_direction=='y') {
                    // 只开启了y方向滑动

                    flag_move = true
                }

                if (flag_move){
                    e.preventDefault ()
                    // 滑动ing
                    inst.doTouchMove (e.touches, e.timeStamp)
                }

            //}
        }
        function __touchEnd(e) {
            //if (flag){
                // 滑动完成
                inst.doTouchEnd (e.timeStamp)

                touch_point = null
                touch_direction = ''

                // flag重置为false，表示滑动结束
                //flag = false
                typeof me.__options.afterTouchEnd==='function' && me.__options.afterTouchEnd()
                //$Doc.off({
                //    touchmove : __touchMove,
                //    touchend : __touchEnd
                //})
            //}
        }
    }


} (this)