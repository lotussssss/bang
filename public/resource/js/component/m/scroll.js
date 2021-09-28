!function (global) {
    var
        Root = tcb.getRoot (),
        noop = tcb.noop,
        scroll = {}
    var
        s = {
            inst                : null,
            callback            : noop,
            // 设置元素的translate和zoom，若不支持translate，使用margin替代
            setTranslateAndZoom : tcb.setTranslateAndZoom
        }

    // 添加到根作用域
    tcb.addToRoot ('scroll', scroll)

    tcb.mix (scroll, {
        getDoc : tcb.getDoc,
        getWin : tcb.getWin,
        $Win   : null,
        $Doc   : null,

        $Container : null,
        $Inner     : null,

        getContainer : function () {return this.$Container},

        getInner : function () {
            if (!(this.$Inner && this.$Inner.length)) {
                return console.error ('请先设置scroll的inner页面')
            }
            return this.$Inner
        },
        setInner : function ($Inner) {return this.$Inner = $Inner},

        getInst    : getInst,
        setRunning : setRunning,

        setPosition   : setPosition,
        setDimensions : setDimensions,

        init : init

    })
    // 获取实例
    function getInst (options) {
        var inst = s.inst

        if (inst) { return inst }

        // 生成一个scroll实例
        inst = new Scroll (function (left, top, zoom) {
            // 此函数在滚动过程中实时执行，需要注意处理效率

            typeof s.callback === 'function' && s.callback (left, top, zoom)
        }, options)

        return s.inst = inst
    }

    function setRunning (callback) {
        var
            $Inner = scroll.getInner ()

        s.callback = function (left, top, zoom) {

            if (typeof callback === 'function') {

                callback (left, top, zoom, $Inner, s.setTranslateAndZoom)
            }
        }
    }

    function setPosition (left, top) {
        var
            inst = scroll.getInst ()

        left = left || 0
        top = top || 0

        inst.setPosition (left, top)
    }

    function setDimensions (main_width, main_height, inner_width, inner_height) {
        var
            $Container = scroll.getContainer (),
            $Inner = scroll.getInner (),
            inst = scroll.getInst ()

        main_width = main_width || $Container.width ()
        main_height = main_height || $Container.height ()
        inner_width = inner_width || Math.max ($Inner.width (), main_width)
        inner_height = inner_height || Math.max ($Inner.height (), main_height)

        // 设置容器尺寸
        inst.setDimensions (main_width, main_height, inner_width, inner_height)
    }

    function init ($Container, options) {
        if (!($Container && $Container.length)) {

            return
        }

        scroll.$Doc = scroll.getDoc ()
        scroll.$Win = scroll.getWin ()
        scroll.$Container = $Container

        options = options || {
            // 禁止横向滚动
            scrollingX : true,
            // 不要回弹
            bouncing   : false
        }

        var inst = scroll.getInst (options)

        __bindEvent ()

        return inst
    }

    // =================================================================
    // 私有接口 private
    // =================================================================

    // 绑定事件
    function __bindEvent () {
        var
            $Doc = scroll.getDoc (),
            $Container = scroll.getContainer (),
            inst = scroll.getInst (),
            // 用来标识在Container中的滑动
            flag = false

        if ('ontouchstart' in window) {
            // 绑定滚动事件
            $Container.on ('touchstart', function (e) {
                //// 滑动开始点位在表单元素上，直接返回，不执行滑动操作
                //if (e.target.tagName.match (/input|textarea|select/i)) {
                //    return
                //}

                // flag设置为true表示滑动开始
                flag = true

                // 滑动开始
                inst.doTouchStart (e.touches, e.timeStamp)

            })

            $Doc.on ('touchmove', function (e) {
                if (flag){
                    e.preventDefault ()

                    // 滑动ing
                    inst.doTouchMove (e.touches, e.timeStamp)
                }
            }, {passive : false})

            $Doc.on ('touchend', function (e) {
                if (flag){
                    // 滑动完成
                    inst.doTouchEnd (e.timeStamp)
                    // flag重置为false，表示滑动结束
                    flag = false
                }
            })
            $Doc.on ('touchcancel', function (e) {
                if (flag){
                    // 滑动完成
                    inst.doTouchEnd (e.timeStamp)
                    // flag重置为false，表示滑动结束
                    flag = false
                }
            })
        } else {
            function __clickPreventDefault(e){
                e.preventDefault()
            }
            var flag_mousemoveing = false,
                start_time = 0,
                start_y = 0,
                counter_mousemoveing = 0,
                $targetItem = null
            // 绑定滚动事件
            $Container.on ('mousedown', function (e) {

                // flag设置为true表示滑动开始
                flag = true

                // 滑动开始
                inst.doTouchStart ([ { pageX : e.pageX, pageY : e.pageY } ], e.timeStamp)
                // 设置滑动起始时间、点
                start_time = e.timeStamp
                start_y = e.pageY
                $targetItem = $(e.target).closest('a')
            })

            $Doc.on ('mousemove', function (e) {
                if (flag) {
                    e.preventDefault ()

                    // 滑动ing
                    inst.doTouchMove ([ { pageX : e.pageX, pageY : e.pageY } ], e.timeStamp)

                    if (!flag_mousemoveing && !counter_mousemoveing) {
                        $Container.on ('click', __clickPreventDefault)
                    }

                    if (counter_mousemoveing > 2) {
                        if ((e.timeStamp - start_time) > 6 && Math.abs (e.pageY - start_y) > 2) {
                            flag_mousemoveing = true
                        } else {
                            $Container.off ('click', __clickPreventDefault)
                            $targetItem && $targetItem.length && $targetItem.trigger('click')
                        }
                    } else {
                        // counter_mousemoveing还是0的时候执行timeout
                        !counter_mousemoveing && setTimeout (function () {
                            if (counter_mousemoveing < 3) {// 移动事件执行次数小于3次，那么表示没移动！
                                $Container.off ('click', __clickPreventDefault)
                                $targetItem && $targetItem.length && $targetItem.trigger('click')
                            }
                        }, 200)
                    }

                    counter_mousemoveing++
                    if (counter_mousemoveing>99){
                        counter_mousemoveing = 3
                    }
                }
            })

            $Doc.on ('mouseup', function (e) {
                if (flag){
                    // 滑动完成
                    inst.doTouchEnd (e.timeStamp)
                    // flag重置为false，表示滑动结束
                    flag = false
                    flag_mousemoveing = false
                    start_time = 0
                    start_y = 0
                    counter_mousemoveing = 0

                    setTimeout(function(){
                        $Container.off('click', __clickPreventDefault)
                    }, 500)
                }

            })
        }
    }


} (this)