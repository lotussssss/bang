;/**import from `/resource/js/component/m/swipesection.js` **/
// swipe section
(function () {
    window.Bang = window.Bang || {}

    var noop = function () {}

    window.QUEUE = window.QUEUE || {}
    window.QUEUE_MAP = window.QUEUE_MAP || {}
    var
        flag_animating = false,
        _MAX_Z_INDEX = 10000,
        _MASK_Z_INDEX = 9999

    function pushQueue (target, queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        Queue.push (target);

        return Queue.length - 1;
    }

    function popQueue (queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        return Queue.pop ();
    }

    function shiftQueue (queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        return Queue.shift ();
    }

    function getQueueTargetBy (pos, queue_name) {
        pos = parseInt (pos, 10);
        pos = pos
            ? pos
            : 0;
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }

        return Queue[ pos ];
    }

    function getQueueLast (queue_name) {
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        var last = Queue.length - 1;

        return last > -1
            ? Queue[ last ]
            : null;
    }
    function getQueue(queue_name){
        queue_name = queue_name || 'experience_swipe_section';
        var Queue = window.QUEUE[ queue_name ];
        if (!$.isArray (Queue)) {
            Queue = [];
            window.QUEUE[ queue_name ] = Queue;
        }
        return Queue
    }

    function getSwipeSection (el) {
        var $el, class_str = '';
        if (el) {
            $el = $ (el);
            if (!($el && $el.length) && (typeof el === 'string')) {
                class_str = el.replace (/\./g, '');
            }
        }

        if (!($el && $el.length)) {
            var wrap_str = class_str
                ? '<section id="SwipeSection' + tcb.genRandomNum () + '" class="swipe-section pre-swipe-right-hide b-left ' + class_str + '"><a href="#" class="swipe-section-close iconfont icon-close"></a><div class="swipe-section-inner"></div></section>'
                : '<section id="SwipeSection' + tcb.genRandomNum () + '" class="swipe-section pre-swipe-right-hide b-left"><a href="#" class="swipe-section-close iconfont icon-close"></a><div class="swipe-section-inner"></div></section>';
            $el = $ (wrap_str).appendTo (document.body);

            // 关闭swipe secition
            $el.find ('.swipe-section-close').on ('click', function (e) {
                e.preventDefault ();

                backLeftSwipeSection ();
            });
        }

        // 将对象加入处理队列
        pushQueue ($el);

        return $el;
    }

    // 填充swipe section的内容
    function fillSwipeSection (html_str) {
        html_str = html_str
            ? html_str
            : '';
        var $swipe = getQueueLast ();
        if ($swipe && $swipe.length) {
            $swipe.find ('.swipe-section-inner').html (html_str);
        }
    }

    // 执行向左滑动
    function doLeftSwipeSection (percent, callback) {
        if (flag_animating) {
            // 滑动操作正在进行中,那么不再做下边操作,直接返回

            return
        }
        percent = parseFloat (percent)

        var // 内部元素的宽度
            inner_percent = percent
                ? 100 - percent
                : 100

        percent = percent
            ? percent + '%'
            : '0'
        inner_percent = inner_percent
            ? inner_percent + '%'
            : '100%'


        var $swipe = getQueueLast ();
        if ($swipe && $swipe.length) {
            var $body = $ (document.body);
            if (window.Bang.SwipeSection.ohidden && !$body.hasClass ('ohidden')) {
                $body.addClass ('ohidden');
            }

            showMask ()

            // 滑动之前将滑动标识设置为true,以用于表示在滑动ing,以方便其他的操作进行判断
            flag_animating = true

            $swipe.css ({
                'display' : 'block',
                'z-index' : _MAX_Z_INDEX++
            }).animate ({ 'translateX' : percent }, 500, 'ease', function () {

                // 滑动结束,释放滑动锁定标识
                flag_animating = false

                typeof callback === 'function' && callback ()
            })

            $swipe.find ('.swipe-section-inner').css ({
                'width' : inner_percent
            })
            $swipe.find ('.swipe-section-close').css ({
                'right' : percent
            })
            tcb.js2AndroidSetDialogState(true, function(){
                backLeftSwipeSection()
            })
        }
    }

    // 向左滑动的层，返回原处
    function backLeftSwipeSection (callback, flag_static) {
        if (flag_animating) {
            // 滑动操作正在进行中,那么不再做下边操作,直接返回

            return
        }

        var $swipe = popQueue ()
        if ($swipe && $swipe.length) {
            var $body = $ (document.body)
            if ($body.hasClass ('ohidden')) {
                $body.removeClass ('ohidden')
            }

            hideMask ()

            if (flag_static){
                typeof callback === 'function' && callback ()

                $swipe.remove ()
                $swipe = null
                return
            }
            $swipe.animate ({ 'translateX' : '100%' }, 300, 'ease', function () {
                typeof callback === 'function' && callback ()

                $swipe.remove ()
                $swipe = null
            })
            tcb.js2AndroidSetDialogState(false)
        }
    }

    // 除了最后一个，关闭其他显示的滑层
    function closeAllExceptLast () {
        if (flag_animating) {
            // 滑动操作正在进行中,那么不再做下边操作,直接返回

            return
        }
        var Queue = getQueue ()

        var $swipe
        while (Queue.length > 1) {
            $swipe = shiftQueue ()
            if ($swipe && $swipe.length) {
                $swipe.remove ()
                $swipe = null
                tcb.js2AndroidSetDialogState(false)
            }
        }
    }

    // 获取最后一个swipe section
    function getLastSwipeSection () {

        return getQueueLast ()
    }

    // 显示透明遮罩层
    function showMask () {
        var
            $Mask = $ ('#SwipeSectionMask')
        if (!($Mask && $Mask.length)) {
            var
                mask_css = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:' + _MASK_Z_INDEX + ';display: block;width: 100%;height: 100%;background:transparent;',
                mask_html = '<a id="SwipeSectionMask" href="#" style="' + mask_css + '"></a>'

            $Mask = $ (mask_html).appendTo (document.body);

            $Mask.on ('click', function (e) {
                e.preventDefault ()

                backLeftSwipeSection ()
            })
        }

        $Mask.show ()
    }

    // 隐藏透明遮罩层
    function hideMask () {
        var
            $Mask = $ ('#SwipeSectionMask')
        if ($Mask && $Mask.length) {

            $Mask.hide ()
        }
    }

    window.Bang.SwipeSection = {
        ohidden              : true,
        getSwipeSection      : getSwipeSection, /*获取swipe secition对象，加入队列queue*/
        fillSwipeSection     : fillSwipeSection, /*填充swipe section的内容*/
        doLeftSwipeSection   : doLeftSwipeSection, /*执行向左滑动*/
        backLeftSwipeSection : backLeftSwipeSection, /*向左滑动的层，返回原处*/
        closeAllExceptLast   : closeAllExceptLast,
        getLastSwipeSection  : getLastSwipeSection,
        getQueue : getQueue
    }

} ())


;/**import from `/resource/js/component/m/scroll.js` **/
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

;/**import from `/resource/js/component/m/router.js` **/
// 一个简单的路由
!function (global) {
    var
        Root = tcb.getRoot (),
        no_hash_placeholder = 'i_am_no_hash_placeholder',
        empty_url_placeholder = 'i_am_empty_url_placeholder',
        noop = function () {}

    Root.Router = Router

    /**
     * 一个简单的路由
     *
     * @param routes
     * @returns {Router}
     * @constructor
     */
    function Router (routes) {
        var
            me = this

        if (!(me instanceof Router)) {

            return new Router (routes)
        }

        // 路由列表
        me.routes = routes || {}
        me.route_prev = ''
        me.route_next = ''
        me.go_direction = 0

        // 历史路由(顺序记录)
        me.history = []
        // 当前的history位置
        me.the_step = 0

        me.force = false

        me.pure_url = window.location.href.split ('#')[ 0 ]

        // 设置没有hash的回调函数
        me.routes[ no_hash_placeholder ] = typeof me.routes[ '!' ] === 'function'
            ? me.routes[ '!' ]
            : noop

        //// 初始化
        //me.init ()
    }

    var
        prototype = {

            $Win   : null,
            getWin : function () {
                var
                    me = this,
                    $Win = me.$Win || tcb.getWin ()

                return me.$Win = $Win
            },

            init : function () {
                var
                    me = this

                me.bindEvent ()
                me.trigger ()

                return me
            },

            /**
             * hash change触发器
             */
            trigger : function (force) {
                var
                    me = this,
                    $Win = me.getWin ()

                me.force = !!force

                $Win.trigger ('hashchange')
            },

            /**
             * 添加路由
             * @param route
             * @param callback
             */
            add : function (route, callback) {
                var
                    me = this,
                    routes = me.routes

                routes[ route ] = typeof callback === 'function'
                    ? callback
                    : noop
            },

            /**
             * 将route加进历史url列表
             * @param route
             * @returns {number}
             */
            addHistory : function (route) {
                var
                    me = this,
                    history = me.history,
                    history_current = history[ history.length - 1 ],
                    history_back = history[ history.length - 2 ],
                    // url所去方向,0表示不变,-1表示回退,1表示前进
                    go_direction = 0,
                    // 停止标识,为false表示停止...
                    stop = true

                if (stop && route !== history_current) {
                    // 新hash和当前hash不一样,表示页面有变化

                    // 当前到达地址是root route,那么永远是返回

                    // 目标route为root route
                    // 那么只能是回退效果
                    if (stop && route === no_hash_placeholder) {
                        // 回退
                        go_direction = -1

                        // 只要是root route,只要是回退,就先干掉最后一个,将其加入next之中
                        me.route_next = history.pop () || ''

                        // 实际上不是回退
                        // 实际上是前进!
                        // 那么将route加进history,假装是回退...伪造ing
                        if (route !== history_back) {
                            history.push (route)
                        }
                        me.route_prev = history[ history.length - 2 ]
                            ? history[ history.length - 2 ]
                            : ''

                        stop = false
                    }
                    // 目标route不是root route
                    // 目标route不是root route
                    // 那么还需要根据history_current和history_back的值,
                    // 是否为root route来做一些确保性的效果
                    else {
                        // 切换前的route(history_current)为root route
                        // 那么妥妥的,必定为[前进]
                        if (stop && history_current === no_hash_placeholder) {
                            // 前进
                            go_direction = 1
                            // 前进的话next妥妥直接设置为空处理
                            me.route_next = ''

                            if (route === history_back) {
                                // 因为和history_back相等,
                                // 虽然是前进,但是实际上是伪装的前进
                                // 将history_current从history中干出来,
                                // 加到prev...用来冒充是prev

                                me.route_prev = history.pop ()
                            } else {
                                // 不等于history_back,那么就作为真实的前进,
                                // 将history_current付给prev,将route push进history
                                me.route_prev = history_current
                                history.push (route)
                            }
                            stop = false
                        } else {
                            // 当前history_current不为root route

                            // 那么,如果route等于回退的route,那么即是回退
                            // 此判断也暗示history_back!==root route
                            if (stop && route === history_back) {
                                // 回退
                                go_direction = -1

                                me.route_next = history.pop ()
                                me.route_prev = history[ history.length - 2 ]
                                    ? history[ history.length - 2 ]
                                    : ''
                                stop = false
                            }
                            // route!==history_back
                            // 即为前进
                            else {
                                if (stop) {
                                    // 前进
                                    go_direction = 1

                                    history.push (route)

                                    me.route_next = ''
                                    me.route_prev = history[ history.length - 2 ]
                                        ? history[ history.length - 2 ]
                                        : ''
                                    stop = false
                                }
                            }
                        }
                        // 切换前的history_back为root route
                        // 由于此流程之中route不为root route,
                        // 那么表示route!==history_back,那么肯定为前进
                        if (stop && history_back === no_hash_placeholder) {
                            // 前进
                            go_direction = 1

                            history.push (route)

                            me.route_next = ''
                            me.route_prev = history[ history.length - 2 ]
                                ? history[ history.length - 2 ]
                                : ''
                            stop = false
                        }
                        // history_back!==root route
                        else {
                            // route等于切换前的history_back
                            if (stop && route === history_back) {
                                // 如果当前为root route
                                // 那么,只当做是前进
                                if (stop && history_current === no_hash_placeholder) {
                                    // 前进
                                    go_direction = 1
                                    // 前进的话next妥妥直接设置为空处理
                                    me.route_next = ''

                                    // 因为和history_back相等,
                                    // 虽然是前进,但是实际上是伪装的前进
                                    // 将history_current从history中干出来,
                                    // 加到prev...用来冒充是prev

                                    me.route_prev = history.pop ()
                                    stop = false
                                }
                                // 否则就是回退
                                else {
                                    if (stop) {
                                        // 回退
                                        go_direction = -1

                                        me.route_next = history.pop ()
                                        me.route_prev = history[ history.length - 2 ]
                                            ? history[ history.length - 2 ]
                                            : ''
                                        stop = false
                                    }
                                }
                            } else {
                                if (stop) {
                                    // 前进
                                    go_direction = 1

                                    history.push (route)

                                    me.route_next = ''
                                    me.route_prev = history[ history.length - 2 ]
                                        ? history[ history.length - 2 ]
                                        : ''
                                    stop = false
                                }
                            }
                        }

                    }

                }
                me.go_direction = go_direction

                return go_direction
            },

            /**
             * 切换到指定route
             * @param route
             * @param replace
             */
            go : function (route, replace) {
                var
                    me = this

                route = route ? tcb.getPureHash (route) : ''

                if (replace) {

                    route = route
                        ? '#' + route
                        : ''
                    window.location.replace (me.pure_url + route)
                } else {
                    if (route) {
                        window.location.hash = route
                    } else {
                        window.location.href = me.pure_url
                    }
                }
            },

            /**
             * 解析url，获取到url对应的route和参数
             * @param url
             * @returns {{url: *, route: string, params: null}}
             */
            parser : function (url) {
                var
                    me = this,
                    ret = {
                        // 设置原始url为返回url，
                        // 后边还要做后续处理，如果不合法url将其强制设置为首页url
                        url    : url,
                        route  : no_hash_placeholder,
                        params : null
                    }

                url = url ? tcb.stripLastCharAt ('/', tcb.getPureHash (url)) : ''

                // url为空''或者'!'或者url不以!开头，
                // 那么将route为默认值保持不变，并且将url设置为默认值
                if (!url || url === '!' || url.charAt (0) !== '!') {
                    ret[ 'url' ] = empty_url_placeholder
                } else {

                    url = url.split ('/')

                    var
                        route_keys = me.list (),
                        route_key = '',
                        flag = true,
                        route_target = '',
                        params = null
                    for (var i = 0; i < route_keys.length; i++) {
                        // 将相等标识，默认设置为0
                        flag = true
                        route_key = route_keys[ i ].split ('/')
                        if (route_key.length === url.length) {

                            for (var j = 0; j < route_key.length; j++) {
                                // route_key的分段值和url对应位置不相等时，
                                // 再判断不相等位置是否为可变量，
                                // 若为可变量，则判断url的字段值是否和route的变量要求的格式是否相同@TODO，虽然这么说，但是此处并不判断值的格式
                                if (route_key[ j ] !== url[ j ]) {
                                    if (route_key[ j ].charAt (0) !== ':') {
                                        flag = false
                                        break
                                    }
                                    params = params || {}
                                    params[ route_key[ j ].substring (1) ] = url[ j ]
                                }
                            }
                        } else {
                            flag = false
                        }

                        if (flag) {

                            ret[ 'route' ] = route_keys[ i ]
                            ret[ 'params' ] = params
                            break
                        } else {
                            params = null
                        }

                    }
                }

                return ret
            },

            prev      : function () {
                return this.route_prev
            },
            next      : function () {
                return this.route_next

            },
            direction : function () {
                return this.go_direction
            },

            list : function () {
                var
                    me = this,
                    routes = me.routes,
                    keys = []
                for (var key in routes) {
                    if (routes.hasOwnProperty (key)) {
                        keys.push (key)
                    }
                }

                return keys
            },

            /**
             * 事件绑定
             */
            bindEvent : function () {
                var
                    me = this,
                    $Win = me.getWin ()

                $Win.on ({
                    // 切换url的hash，切换交互
                    'hashchange' : function (e) {
                        // 当前url没有hash,给其赋值一个占位的hash
                        var pure_hash = tcb.getPureHash () || no_hash_placeholder,
                            parser_data = me.parser (pure_hash)

                        // 将当前url hash添加到历史列表中
                        var
                            go_direction = me.addHistory (parser_data[ 'url' ]),
                            direction_map = {
                                '0'  : 'refresh',
                                '-1' : 'leave',
                                '1'  : 'enter'
                            }

                        // 页面有切换
                        if (go_direction || me.force) {
                            var
                                routeAction = me.routes[ parser_data[ 'route' ] ]

                            if (typeof routeAction === 'function') {

                                // 参数：route实例，对应的route，走向，url的参数
                                routeAction (me, parser_data[ 'route' ], direction_map[ go_direction ], parser_data[ 'url' ], parser_data[ 'params' ] || {})
                            }
                        }

                        // 每次执行完hashchange，都需要将force标识重置为false
                        me.force = false
                    }
                })
            }

        }

    // 将prototype变量值添加到Router原型链prototype
    for (var key in prototype) {

        Router.prototype[ key ] = prototype[ key ]
    }

} (this)

;/**import from `/resource/js/component/m/page.js` **/
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

;/**import from `/resource/js/component/m/slide.js` **/
// 滑动slide
(function () {

    window.Bang = window.Bang || {}

    var
    //============ 选择器 ============
    // 滑动模块最外层容器
    selector_wrap = '.slide-shower-wrap',
    // 滑动单元块
    selector_item = '.s-item',
    // 滑动导航标识点
    selector_nav = '.slide-nav',
    // 向左
    selector_go_left = '.slide-go-left',
    // 向右
    selector_go_right = '.slide-go-right',


    //============ 元素类class ============
    class_nav_cur = 'cur',
    class_item_hide = 's-item-hide',

    //============ 参数标识 ============
    // 隐藏nav
    data_hide_nav = 'data-hidenav',
    // 是否有滑动尾部(即不连续滑动)
    data_has_end = 'data-has-end',
    // 是否自动滑动
    data_auto = 'data-auto',
    // 开始位置
    data_start = 'data-start',
    // 滑动速度
    data_speed = 'data-speed'

    /**
     * 开启滑动功能
     * @param $slideWrap
     */
    function slide ( $slideWrap , callback) {
        var
            objSwipe = null

        $slideWrap = $slideWrap || $ ( selector_wrap );

        if ( !$slideWrap.length ) {
            return;
        }

        var
            $sitem = $slideWrap.find ( selector_item )
        if ( !$sitem.length ) {
            return;
        }

        var
            params = {
                hide_nav   : parseInt ( $slideWrap.attr ( data_hide_nav ), 10 ) || 0,
                auto       : parseInt ( $slideWrap.attr ( data_auto ), 10 ) || 0,
                startSlide : parseInt ( $slideWrap.attr ( data_start ), 10 ) || 0,
                speed      : parseInt ( $slideWrap.attr ( data_speed ), 10 ) || 400,
                continuous : !(parseInt ( $slideWrap.attr ( data_has_end ), 10 ) || 0)
            }

        // nav处理
        var
            $nav = $slideWrap.find ( selector_nav ),
            $nitem;
        if ( $nav.length ) {
            // 隐藏nav
            if ( params[ 'hide_nav' ] ) {
                $nav.hide ();
            }
            $nitem = $nav.children ();

            if ( !$nitem.length ) {
                var nav_item_str = '';
                for ( var i = 0; i < $sitem.length; i++ ) {
                    nav_item_str += i == 0 ? '<span class="' + class_nav_cur + '"></span>' : '<span></span>';
                }
                $nitem = $ ( nav_item_str ).appendTo ( $nav );
            }
        }
        // 滑动item数大于1个才有滑动效果
        if ( $sitem.length > 1 ) {
            $sitem.removeClass ( class_item_hide );
            //console.log ( params.continuous )

            // 初始化slide滑动
            objSwipe = Swipe ( $slideWrap[ 0 ], {
                startSlide      : params[ 'start' ],
                speed           : params[ 'speed' ],
                auto            : params[ 'auto' ],
                continuous      : params[ 'continuous' ],
                disableScroll   : false,
                stopPropagation : false,
                callback        : function ( index, element ) {

                    if ( $nitem && $nitem.length ) {
                        if ( $nitem.length < 3 && this.continuous ) {
                            $nitem.removeClass ( class_nav_cur ).eq ( index % $nitem.length ).addClass ( class_nav_cur );
                        }
                        else {
                            $nitem.removeClass ( class_nav_cur ).eq ( index ).addClass ( class_nav_cur );
                        }
                    }

                    typeof callback=='function' && callback()
                },
                transitionEnd   : function ( index, element ) {

                    // 设置左右滑动按钮初始化
                    setGoBtnStatus ()
                }
            } )

            // 设置左右滑动按钮初始化
            setGoBtnStatus ()

            var
            // 向左滑动按钮
            $GoLeft = $slideWrap.find ( selector_go_left ),
            // 向右滑动按钮
            $GoRight = $slideWrap.find ( selector_go_right )

            // 向左滑动
            $GoLeft.on ( 'click', function ( e ) {
                e.preventDefault ()

                objSwipe.next ()

            } )

            // 向右滑动
            $GoRight.on ( 'click', function ( e ) {
                e.preventDefault ()

                objSwipe.prev ()

            } )

            /**
             * 设置左右滑动按钮的状态
             */
            function setGoBtnStatus () {
                var
                // 向左滑动按钮
                $GoLeft = $slideWrap.find ( selector_go_left ),
                // 向右滑动按钮
                $GoRight = $slideWrap.find ( selector_go_right ),
                // 当前位置
                cur_pos = objSwipe.getPos (),
                // 所有数量
                all_num = objSwipe.getNumSlides ()

                if ( !($GoLeft.length && $GoRight.length) ) {
                    return
                }

                if ( cur_pos == 0 ) {
                    $GoRight.hide ()
                    $GoLeft.show ()
                }
                else if ( cur_pos == (all_num - 1) ) {
                    $GoRight.show ()
                    $GoLeft.hide ()
                }
                else {
                    $GoRight.show ()
                    $GoLeft.show ()
                }

            }
        }

        return objSwipe
    }


    //====================== Export ========================
    window.Bang.slide = slide

} ())

;/**import from `/resource/js/component/m/scrollFactory.js` **/
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

;/**import from `/resource/js/component/m/login_form_by_mobile.js` **/
!function () {
    var Bang = window.Bang = window.Bang || {};

    Bang.LoginFormByMobile = LoginFormByMobile

    function LoginFormByMobile (options, callback) {
        options = options || {}
        var
            form_action = options.form_action || '',
            selector_form = options.selector_form,
            selector_get_secode = options.selector_get_secode,
            selector_vcode_img = options.selector_vcode_img,
            class_get_secode_disabled = options.class_get_secode_disabled || 'getsecode-disabled',
            status_loading = options.status_loading || false

        var $LoginForm = $ (selector_form),
            $BtnSeCode = $LoginForm.find (selector_get_secode),
            $BtnVCode = $LoginForm.find (selector_vcode_img),

            $mobile = $LoginForm.find ('[name="mobile"]'),
            $pic_secode = $LoginForm.find ('[name="pic_secode"]'),
            $sms_type = $LoginForm.find ('[name="sms_type"]')

        if (!($LoginForm.length && $BtnSeCode.length && $BtnVCode.length && $mobile.length && $pic_secode.length)) {
            return
        }

        // 提交登录表单
        $LoginForm.on ('submit', function (e) {
            e.preventDefault ()

            if (!validMobileCheckOrderForm ($LoginForm)) {
                return
            }

            var __loading = false
            if (status_loading){
                tcb.loadingStart()
                __loading = true
            }
            $.post (form_action || $LoginForm.attr('action'), $LoginForm.serialize(), function (res) {
                tcb.loadingDone()
                __loading = false

                try{
                    res = $.parseJSON(res)

                    if (!res[ 'errno' ]) {
                        typeof callback === 'function' && callback(res)
                    } else {
                        alert (res.errmsg)
                    }
                } catch (ex){
                    alert ("抱歉，数据错误，请稍后再试")
                }
            })
            setTimeout(function () {
                if (__loading){
                    tcb.loadingDone()
                    __loading = false
                }
            }, 6000)
        })

        // 获取短信验证码
        $BtnSeCode.on ('click', function (e) {
            e.preventDefault ()

            if ($BtnSeCode.hasClass (class_get_secode_disabled)) {
                return false
            }

            if ($BtnVCode.attr ('data-out-date')) {
                $BtnVCode.trigger ('click')
            }

            // 验证登陆表单
            if (!validGetSmsCode ($LoginForm)) {
                return
            }

            var params = {
                'mobile'     : $.trim ($mobile.val ()),
                'pic_secode' : $.trim ($pic_secode.val ()),
                'sms_type'   : $.trim ($sms_type.val ())
            }

            $.post ('/aj/doSendSmsCode/', params, function (res) {
                try {

                    res = $.parseJSON(res)
                    if (res.errno) {

                        alert (res.errmsg)

                        $BtnSeCode.removeClass (class_get_secode_disabled)
                        $BtnVCode.trigger ('click')

                    } else {
                        var
                            tagName = $BtnSeCode[ 0 ].tagName.toLowerCase (),
                            btnText = tagName == 'input' ? $BtnSeCode.val () : $BtnSeCode.html ()

                        $BtnSeCode.addClass (class_get_secode_disabled)
                        $BtnVCode.attr ('data-out-date', '1')

                        tcb.distimeAnim (60, function (time) {
                            if (time <= 0) {
                                $BtnSeCode.removeClass (class_get_secode_disabled)
                                tagName == 'input' ? $BtnSeCode.val (btnText) : $BtnSeCode.html (btnText)
                            } else {
                                tagName == 'input' ? $BtnSeCode.val (time + '秒后再次发送') : $BtnSeCode.html (time + '秒后再次发送')
                            }
                        })
                    }
                } catch (ex) {
                    $BtnSeCode.removeClass (class_get_secode_disabled)
                    alert ("抱歉，数据错误，请稍后再试")
                }
            })
        })

        // 刷新图形验证码
        $BtnVCode.on ('click', function (e) {
            e.preventDefault ()

            var src = '/secode/?rands=' + Math.random ()

            $BtnVCode.attr ('src', src)

            $BtnVCode.attr ('data-out-date', '')

            var $pic_secode = $LoginForm.find ('[name="pic_secode"]')
            $pic_secode.focus ().val ('')
        })
    }


    // 验证获取手机短信验证码表单
    function validGetSmsCode ($Form) {
        if (!($Form && $Form.length)) {
            return false
        }
        var flag = true

        var $Mobile = $Form.find ('[name="mobile"]'),
            mobile_val = $.trim ($Mobile.val ())
        if (!tcb.validMobile (mobile_val)) {
            flag = false
            $.errorAnimate($Mobile.focus ())
        }

        var $PicSecode = $Form.find ('[name="pic_secode"]'),
            pic_secode_val = $.trim ($PicSecode.val ())
        if (!pic_secode_val) {
            $.errorAnimate($PicSecode)
            if (flag) {
                $PicSecode.focus ()
            }
            flag = false
        }

        return flag
    }

    // 验证手机号登录表单
    function validMobileCheckOrderForm ($Form) {
        if (!($Form && $Form.length)) {
            return false
        }
        var flag = true

        var $Mobile = $Form.find ('[name="mobile"]'),
            mobile_val = $.trim ($Mobile.val ())
        if (!tcb.validMobile (mobile_val)) {
            flag = false
            $.errorAnimate($Mobile.focus ())
        }

        var $PicSecode = $Form.find ('[name="pic_secode"]'),
            pic_secode_val = $.trim ($PicSecode.val ())
        if (!pic_secode_val) {
            $.errorAnimate($PicSecode)
            if (flag) {
                $PicSecode.focus ()
            }
            flag = false
        }

        var $Secode = $Form.find ('[name="secode"]'),
            secode_val = $.trim ($Secode.val ())
        if (!secode_val) {
            $.errorAnimate($Secode)
            if (flag) {
                $Secode.focus ()
            }
            flag = false
        }

        var $AgreeProtocol = $Form.find ('[name="agree_protocol"]')
        if ($AgreeProtocol.length) {
            var $AgreeProtocolLabel = $AgreeProtocol.closest('label'),
                agree_protocol_checked = $AgreeProtocol.prop('checked')
            if (!agree_protocol_checked) {
                $.errorAnimate($AgreeProtocolLabel)
                if (flag) {
                    $AgreeProtocolLabel.focus ()
                }
                $.dialog.toast('请勾选并阅读协议再登录/注册~')
                flag = false
            }
        }

        return flag
    }

} ()


;/**import from `/resource/js/mobile/huishou/inc/dialog.js` **/
var Dialog = (function(txt){
    function showMask(){
        return $('<div class="ui-dialog"></div>').appendTo('body').css({
            'position' : 'fixed',
            'top' : 0,
            'right' : 0,
            'bottom' : 0,
            'left' : 0,
            'z-index' : 11000,
            'background' : 'rgba(0,0,0, 0.7)',
            'font-size' : '14px'
        });
    }

    function show(txt){
        var box = showMask();
        var cntBox = $('<div class="dialog-content"><span class="close">x</span><div class="dialog-txt">'+txt+'</div></div>').appendTo(box).css({
            'position' : 'absolute',
            'left' : '10%',
            'right' : '10%',
            'top' : '20%',
            'min-height' : '160px',
            'max-height' : '600px',
            'background' : 'url(https://p.ssl.qhimg.com/t0112d6649a275a40cf.jpg) repeat 0 0',
            'border-radius' : '10px',
            'padding' : '20px',
            'color' : '#666',
            'line-height' : '1.8'
        });

        cntBox.find('.close').css({
            'position' : 'absolute',
            'top' : '-10px',
            'right' : '-10px',
            'width' : '20px',
            'height' : '20px',
            'line-height' : '20px',
            'border-radius' : '50%',
            'border' : '1px solid #ccc',
            'background' : 'url(https://p.ssl.qhimg.com/t0112d6649a275a40cf.jpg) repeat 0 0',
            'font-size' : '16px',
            'text-align' : 'center',
            'font-family' : 'arial',
            'color' : '#999'
        }).on('click', hide);

        return box;
    }

    function showBox(cnt){
        var box = showMask();
        return box.html(cnt);
    }

    function hide(){
        $('.ui-dialog').remove();
    }

    return{
        'show' : show,
        'showBox' : showBox,
        'hide' : hide
    }
})();


;/**import from `/resource/js/mobile/huishou/inc/bank_area_selector.js` **/
/**
 * 银行所在地选择
 * @return {[type]} [description]
 */
!function(){
    function bankAreaSelector(provenceBox, cityBox, filed, area){
        var
            me = this

        me.init(provenceBox, cityBox, filed, area)
    }

    function init(provenceBox, cityBox, filed, area){
        this._area = area;
        this.Wprovence = $(provenceBox);
        this.Wcity = $(cityBox);
        this.Wfiled = $(filed);

        this.showProvince()
        this.bindEvent()
    }

    function bindEvent(){
        var
            me = this

        me.Wprovence.on('change', function(e){
            var
                pval = $(this).val()
            if( pval >-1 ){

                me.showCity(pval)

            }
        })

        me.Wcity.on('change', function(e){
            me.setFiled()
        })
    }

    function showProvince(){
        var
            me = this,
            list = me._area.provinces,
            str = '<option value="-1">请选择银行所在地</option>'

        for(var i=0, n=list.length; i<n; i++){
            str += '<option value="'+i+'">'+list[i]+'</option>'
        }

        me.Wprovence.html( str )
    }

    function showCity(pid){
        var
            me = this,
            list = me._area.cities[pid]

        var str = ''
        for(var i=0, n=list.length; i<n; i++){
            str += '<option value="'+i+'">'+list[i]+'</option>'
        }

        me.Wcity.show().html( str )

        me.setFiled()
    }

    function setFiled(){
        var
            me = this,
            province_city = me.Wprovence.find('option[value="'+me.Wprovence.val()+'"]').html()
                + '|'
                + me.Wcity.find('option[value="'+me.Wcity.val()+'"]').html()

        me.Wfiled.val(province_city)
    }

    bankAreaSelector.prototype = {
        constructor : bankAreaSelector,
        init : init,
        bindEvent : bindEvent,
        showProvince : showProvince,
        showCity : showCity,
        setFiled : setFiled
    }

    window.bankAreaSelector = bankAreaSelector
}()

;/**import from `/resource/js/mobile/huishou/inc/user_of_prize.js` **/
$(function () {
    // 获取中奖列表信息
    function getLotteryTopList(){
        var
            $list = $('.block-user-of-prize-list')
        if (!($list && $list.length)){
            return
        }

        $.get ('/m/doGetUsersOfPrize', function (res) {
            res = $.parseJSON (res)


            if (!res[ 'errno' ] && res['result'] && res['result' ].length) {

                var
                    html_st = ''

                for(var i=0;i<res['result' ].length;i++){
                    html_st += '<div class="item"><span></span>用户&nbsp;'+res['result'][i]['phone']+'抽中了<span >'+res['result'][i]['amount']+'</span>元现金红包！</div>'
                }

                var
                    $inner = $list.find('.inner')

                $inner.html(html_st)

                // $('.block-user-of-prize-list').css('display','block')

                var
                    h = $inner.find('.item').eq(0).height()

                setTimeout(function(){
                    var arg = arguments;
                    $inner.animate({'top': -h}, 800, function(){
                        $inner.find('.item').eq(0).appendTo($inner)

                        $inner.css({'top': 0})

                        setTimeout(arg.callee, 2000)
                    })
                }, 2000)

            }
        })
    }
    getLotteryTopList()
})


;/**import from `/resource/js/mobile/huishou/inc/hs_hot_model.js` **/
$(function () {
    // 确保回收首页才执行
    if (window.__PAGE !== 'index') {
        return
    }
    // 回收首页热门回收机型
    var Root = tcb.getRoot (),
        ScrollFactory = Root.ScrollFactory

    var $Container = $('.block-hot-model')
    if($Container && $Container.length>0) {
        var $Inner = $Container.find('.hot-model-inner'),
            $Items = $Container.find('.model-item')
        $Items.removeClass('hidden')
        var SCROLL = new ScrollFactory({
            $Container: $Container,
            $Inner: $Inner,
            options: {
                scrollingX: true,
                scrollingY: false
            }
        })
        // 尺寸重置
        function resizeMsBlock() {
            var inner_width = 0
            $Items.removeClass('hidden')
            tcb.each($Items, function (i, item) {
                var $item = $(item)
                inner_width += $item.width() + .03 * (window.innerWidth > 720 ? 720 : window.innerWidth) * 100 / 320
            })
            $Inner.css({
                width: inner_width + 'px'
            })
            SCROLL.setDimensions()
        }

        resizeMsBlock()
    }
    //限时回收倒计时
    Bang.startCountdown (_END_TIME, _NOW_TIME,$('.js-block-hot-model-countdown'))

    tcb.bindEvent(document.body,{
        '.js-show-hs-rules':function(e){
            e.preventDefault()

            if(tcb.queryUrl(window.location.href, 'self_enterprise')=='dianxin' || tcb.queryUrl(window.location.href, 'self_enterprise')=='suningV'){
                var html_str = '<p class="rule-ctn">限时加价期间，用户回收指定手机型号，回收方式选择邮寄回收，完成旧机回收且最终质检价格大于500元，即可享受不同金额的现金补贴（金额以页面显示为准），补贴款随旧机款一并发放至用户收款账户内，即最终回收价=旧机实际估价+现金补贴</p> <a href="#" class="js-close-btn close-btn">我知道了</a>'
            }else{
                var html_str = '<p class="rule-ctn">限时加价期间，用户回收指定手机型号，回收方式选择邮寄回收或信用回收，完成旧机回收且最终质检价格大于500元，即可享受不同金额的现金补贴（金额以页面显示为准），补贴款随旧机款一并发放至用户收款账户内，即最终回收价=旧机实际估价+现金补贴</p> <a href="#" class="js-close-btn close-btn">我知道了</a>'
            }

            var config = {
                'withClose': true,
                'className': 'dialog-hs-rules',
                'middle':true
            };
            var dialog = tcb.showDialog(html_str, config)
            $('.js-close-btn').click(function (e) {
                e.preventDefault()
                tcb.closeDialog(dialog)
            })
        }
    })
})


;/**import from `/resource/js/mobile/huishou/inc/block_crazy_coupon.js` **/
!function () {
    if (!(window.__PAGE == 'index' || window.__PAGE == 'order')) {
        return
    }

    $(function(){
        // 回收首页热门回收机型
        var Root = tcb.getRoot (),
            ScrollFactory = Root.ScrollFactory

        //var $Container = $('.block-crazy-coupon')
        //if($Container && $Container.length>0) {
        //    var $Inner = $Container.find('.crazy-coupon-inner')
        //
        //    var instBlockCrazyCouponScroll = new ScrollFactory({
        //        $Container: $Container,
        //        $Inner: $Inner,
        //        options: {
        //            scrollingX: true,
        //            scrollingY: false
        //        }
        //    })
        //
        //    tcb.cache('INST_BLOCK_CRAZY_COUPON_SCROLL', instBlockCrazyCouponScroll)
        //}

        tcb.bindEvent({
            '.js-trigger-show-crazy-coupon-dialog' : function(e){
                e.preventDefault()

                if (!window.__IS_LOGIN){
                    return showLogin()
                }

                tcb.showDialog('', {
                    middle: true,
                    className: 'ui-dialog-crazy-coupon'
                })

                var statisticParams = [ '_trackEvent', 'm回收', '点击', 'index现金加价券限时疯抢', '1', '' ]

                if (window.__PAGE == 'order'){
                    statisticParams[3] = 'order现金加价券限时疯抢'
                }
                tcb.statistic(statisticParams)
            }
        })

        // 显示登录面板
        function showLogin () {
            var html_str = $.tmpl($.trim($('#JsMLoginFormByMobilePanelTpl').html()))({})
            var dialogInst = tcb.showDialog(html_str, {
                middle: true,
                className: 'm-hs-login-panel'
            })

            // 登录表单相关功能
            window.Bang.LoginFormByMobile({
                form_action: tcb.setUrl2('/user/dologin'),
                selector_form: dialogInst.wrap.find('form'),
                selector_get_secode: '.btn-get-sms-code',
                selector_vcode_img: '.vcode-img',
                class_get_secode_disabled: 'btn-get-sms-code-disabled'
            }, function (res) {
                window.__IS_LOGIN = true

                var assess_key = tcb.queryUrl(window.location.search, 'assess_key')

                if (assess_key){
                    $.ajax({
                        type     : 'post',
                        url      : tcb.setUrl2('/huishou/doUpUserMobile'),
                        data     : {
                            assess_key : assess_key
                        },
                        dataType : 'json',
                        timeout  : 5000,
                        success  : function (res) {},
                        error    : function () {}
                    })
                }

                tcb.closeDialog()
                $('.js-trigger-show-crazy-coupon-dialog').click()
            })

            var statisticParams = [ '_trackEvent', 'm回收', '点击', 'index-login现金加价券限时疯抢', '1', '' ]

            if (window.__PAGE == 'order'){
                statisticParams[3] = 'order-login现金加价券限时疯抢'
            }
            tcb.statistic(statisticParams)
        }

    })
}()

;/**import from `/resource/js/mobile/huishou/_common.js` **/
// 多页面使用js
$(function () {

    tcb.bindEvent(document.body, {
        /**
         * 屏幕功能重测
         * @param e
         */
        '.btn-action-reassess': function (e) {
            e.preventDefault()

            var
                $me = $(this),
                action = $me.attr('data-action'),
                key = $me.attr('data-key'),
                key_map_name = {
                    'screen_display': 'pushToColorView',
                    'screen_touch': 'pushToTouchView',
                    're_detect': 'pushToRedetectView'
                }

            if (action === 're-detect') {

                exeClientFunction(key_map_name[key])
            }
        },
        // 回收协议。回收常见问题
        '.js-trigger-show-agree-protocol, .view-agree-protocol': function (e) {
            e.preventDefault()

            var $me = $(this),
                $tpl, $tpl2,
                $target

            var tplId = $me.attr('data-tpl')
            if ($me.attr('data-bangmai') == 1) {
                $tpl = $('#HuishouBangmaiProtocolTpl')
            } else if ($me.attr('data-jiadian') == 1) {
                $tpl = $('#HuishouWhiteGoodsProtocolTpl')
            } else if ($me.attr('data-xxg-login') == 1) {
                $tpl = $('#JsXxgIntegrityRecoveryTpl')
            } else {
                $tpl = $('#HuishouProtocolTpl')
                if (tplId) {
                    $tpl2 = $('#' + tplId)
                }
            }

            var html_fn = $.tmpl($.trim($tpl.html())),
                html_str = html_fn({
                    no_content: !!tplId
                })

            var $dialog = Dialog.showBox(html_str)

            if ($me.attr('data-jiadian') == 1) {
                $target = $('.huishou-white-goods-protocol-panel')
            } else {
                $target = $('.huishou-protocol-panel')
            }

            if (tplId){
                $target.append($.tmpl($.trim($tpl2.html()))())
                if(tplId==='JsTcbPlatformServiceAgreementTpl') {
                    var $tpl3 = $('#JsHuishouTradeRulesTpl')
                    $target.append($.tmpl($.trim($tpl3.html()))())
                }
            }

            var root = tcb.getRoot()
            var ScrollFactory = root.ScrollFactory
            var $Container = $('.huishou-protocol-panel-wrap')
            var $Inner = $('.huishou-protocol-panel')
            if (ScrollFactory && $Container.length && $Inner.length) {
                new ScrollFactory({
                    $Container: $Container,
                    $Inner: $Inner,
                    options: {
                        scrollingX: false,
                        scrollingY: true,
                        bouncing: true
                    }
                })
            }

            $dialog.find('.close-btn').on('click', function (e) {

                e.preventDefault()
                Dialog.hide()
            })
        },
        '.block-btn': {
            // 底部按钮行，干掉滚动行为
            'touchmove': function (e) {
                e.preventDefault()

                return
            }
        },
        //用户信息入口:我的订单、在线客服
        'header .h-user-info-enter': function (e) {
            e.preventDefault()

            $('.h-user-info-wrap .h-user-info-cont').toggle()
        },
        //下单成功页 查看解锁教程
        '.show-course': function (e) {
            e.preventDefault()

            var brand_id = $(this).attr('data-brand_id')
            var course_instance = showCourse(brand_id)
            course_instance.show()
        },
        //下单成功页 预约快递
        '.show-yuyue-btn': function (e) {
            e.preventDefault()
            var
                order_id = $.queryUrl(window.location.href, 'order_id'), //'1701046319322003800'

                redirect_url = window.location.href

            // 普通邮寄回收

            YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {

                var
                    html_fn = $.tmpl(tcb.trim($('#JsMHSSchedulePickupPanelTpl').html())),
                    html_st = html_fn({
                        data: {
                            province: window.__Province['name'],
                            city: window.__City['name'],
                            area_list: res['area_list'] || [],
                            mobile: res['default_mobile'],
                            order_id: order_id,
                            url: redirect_url
                        }
                    })

                var
                    DialogObj = tcb.showDialog(html_st, {
                        className: 'schedule-pickup-panel',
                        withClose: false,
                        middle: true,
                        onClose: function () {
                            window.location.href = redirect_url
                        }
                    })

                // 绑定预约取件相关事件
                YuyueKuaidi.bindEventSchedulePickup(DialogObj.wrap, redirect_url)

            })

        },
        '.block-special-youku .js-trigger-youku-desc': function (e) {
            e.preventDefault()

            var html_str = $.tmpl($.trim($('#JsMHuiShouYoukuDescTpl').html()))({})
            var config = {
                withMask: true,
                middle: true,
                className: 'huishou-youku-desc-panel'
            }
            tcb.showDialog(html_str, config)
        },
        '.js-trigger-suning-2018-shuang11-promo': function (e) {
            e.preventDefault()
            var SwipeSection = window.Bang.SwipeSection

            SwipeSection.getSwipeSection()
            SwipeSection.fillSwipeSection('<div style="width: 100%;height: 5.942857142857143rem;background: url(//p1.ssl.qhimg.com/t010d5d47b60098b66e.jpg) no-repeat center;background-size: cover;"></div>')

            var $swipe = SwipeSection.getLastSwipeSection()
            $swipe.show()
            SwipeSection.doLeftSwipeSection(0)
        },
        '.js-trigger-suning-yundian-mini-back': function (e) {
            e.preventDefault()
            if (typeof wx !== 'undefined' && wx.miniProgram) {
                wx.miniProgram.navigateTo({url: '/pages/oldfornew/index/index'})
            } else {
                $.dialog.toast('请在小程序中打开此页！')
            }
        },
        '.js-trigger-suning-yundian-mini-goto-order-list': function (e) {
            e.preventDefault()
            if (typeof wx !== 'undefined' && wx.miniProgram) {
                wx.miniProgram.navigateTo({url: '/pages/oldfornew/order/order'})
            } else {
                $.dialog.toast('请在小程序中打开此页！')
            }
        },
        // 回退上一页
        '.js-trigger-go-back': function (e) {
            e.preventDefault()
            window.history.back()
        },
        // in浙江移动小程序--回退上一页
        '.js-trigger-zjyd-miniapp-back': function (e) {
            e.preventDefault()
            window.history.back()
        },
        // in浙江移动app--回退上一页
        '.js-trigger-zjyd-app-back': function (e) {
            e.preventDefault()
            window.history.back()
        },
        // in河南移动APP--关闭当前webview，返回首页
        '.js-trigger-xxg-hnyd-app-close': function (e) {
            e.preventDefault()
            tcb.js2AppInvokeGoBack()
        },
        // in河南移动app--回退上一页
        '.js-trigger-xxg-hnyd-app-back': function (e) {
            e.preventDefault()
            var query = tcb.queryUrl(window.location.search)
            if (query.partner_flag === 'hnyd_xxg') {
                // 如果query之中带有partner_flag === 'hnyd_xxg'，
                // 那么表示是从'/henanMobile/xxg'跳转过来的，
                // 所以填写完之后再重新跳回去
                window.location.replace(tcb.setUrl2('/henanMobile/xxg'))
            } else {
                tcb.js2AppInvokeGoBack()
            }
        }
    })

    //查看解锁教程
    var showCourse = (function () {
        var instance = null

        function ShowCourse(brand_name) {
            this.brand_imgs = {
                '10': 'https://p2.ssl.qhmsg.com/t015a0074e2c96c6fee.png',
                '0': 'https://p3.ssl.qhmsg.com/t019747712197cdf1f1.png',
                '20': 'https://p0.ssl.qhmsg.com/t015eb98d84e7ea3699.png',
                '13': 'https://p2.ssl.qhmsg.com/t01962686c92775f133.png'
            }
            this.brand_img = this.brand_imgs[brand_name]

            this.init()
        }

        ShowCourse.getInstance = function (brand_name) {
            if (!instance) {
                instance = new ShowCourse(brand_name)
            }
            return instance
        }
        ShowCourse.prototype = {
            constructor: ShowCourse,
            init: function () {
                this.creatEle()
                this.bindEvent()
            },
            creatEle: function () {
                var $course_wrap = $('<div class="course-wrap"></div>')
                var inner_str = '<a href="#" class="course-mask"></a><div class="course-inner"> <div class="img-wrap"><img src="' + this.brand_img + '" alt=""></div></div>'
                $course_wrap.html(inner_str)
                $(document.body).append($course_wrap)
            },
            bindEvent: function () {
                var self = this
                $('.course-mask').on('click', function (e) {
                    e.preventDefault()
                    self.hide()
                })
            },
            show: function () {
                setTimeout(function () {
                    $('.course-wrap').css({'display': 'block'})
                }, 1)
            },
            hide: function () {
                $('.course-wrap').css({'display': 'none'})
            }
        }
        return ShowCourse.getInstance
    })()

    /**
     * 执行客户端函数
     * @param fn_name
     */
    function exeClientFunction(fn_name) {
        var fn = function () {
            alert('我是' + fn_name + '，我还没有定义！')
        }

        if (window.webkit && window.webkit.messageHandlers
            && window.webkit.messageHandlers[fn_name] && window.webkit.messageHandlers[fn_name].postMessage) {
            return window.webkit.messageHandlers[fn_name].postMessage(null)
        } else if (window.client && typeof window.client[fn_name] === 'function') {
            return window.client[fn_name]()
        } else if (typeof window[fn_name] === 'function') {
            return window[fn_name]()
        }

        fn()
    }

    function setAndroidHtmlClass() {
        if (tcb.is_android) {
            $('html').addClass('android')
        }
    }

    setAndroidHtmlClass()

    function showSuningRecommendDialog() {
        return
        var query_from = tcb.queryUrl(window.location.search, 'from'),
            query_from_page = tcb.queryUrl(window.location.search, 'from_page')
        if (window.__PAGE != 'index') {
            return
        }
        if (!(query_from == 'SuningRecommended' || query_from_page == 'SnRecommended')) {
            return
        }
        var html_st = '<div class="main-cnt">旧机满500加50元<br/>' +
            '旧机满1000加100元<br/>' +
            '旧机满2000加200元<br/>' +
            '旧机满3000加300元</div>' +
            '<div class="desc">苏宁购华为产品用户专享<br/>' +
            '回收成功，享额外加价</div>' +
            '<a class="btn" href="javascript:tcb.closeDialog();">立即评估</a>'
        tcb.showDialog(html_st, {
            top: 30,
            left: 0,
            className: 'dialog-hs-suning-recommend'
        })
    }

    showSuningRecommendDialog()

    function isSuningShopPlusOutDate(callback) {
        if (window.__IS_XXG_IN_SUNING) {
            $.ajax({
                url: '/m/checkTheStatusOfShopkeepers',
                success: function (res) {
                    if (res && !res.errno) {
                        typeof callback === 'function' && callback(res.result)
                    } else {
                        $.dialog.toast((res && res.errmsg) || '系统错误')
                    }
                },
                fail: function (xhr) {
                    $.dialog.toast(xhr.status + ' : ' + xhr.statusText)
                }
            })
        } else {
            typeof callback === 'function' && callback(false)
        }
    }

    window.isSuningShopPlusOutDate = isSuningShopPlusOutDate

    function showDialogSuningShopPlusOutDate(fnContinue) {
        var html_st = '<h3 class="tit">重要提醒</h3>' +
            '<div class="cnt">店+登录超时。<br><br><span class="c5">如果您在店+APP内，请务必退出重新下单！否则无法参加任何苏宁活动。</span><br><br>如果您不在店+App，请继续完成订单。</div>' +
            '<div class="dialog-btn">' +
            '<a class="js-suning-shop-plus-out-date-btn-confirm btn btn-confirm" href="#">继续完成订单</a>' +
            '<a class="js-suning-shop-plus-out-date-btn-cancel btn btn-cancel" href="#">关闭弹窗</a>' +
            '</div>'
        var inst = tcb.showDialog(html_st, {
            className: 'dialog-suning-shop-plus-out-date',
            withClose: false,
            middle: true
        })
        inst.mask.addClass('dialog-suning-shop-plus-out-date-mask')
        inst.wrap.find('.js-suning-shop-plus-out-date-btn-confirm').on('click', function (e) {
            e.preventDefault()
            tcb.closeDialog()
            typeof fnContinue === 'function' && fnContinue()
        })
        inst.wrap.find('.js-suning-shop-plus-out-date-btn-cancel').on('click', function (e) {
            e.preventDefault()
            tcb.closeDialog()
        })
    }

    window.showDialogSuningShopPlusOutDate = showDialogSuningShopPlusOutDate

    function doMarkedAsYundian() {
        var max_count = 4
        var count = 0

        function loop(data) {
            if (count > max_count) {
                return
            }
            count++
            $.ajax({
                url: '/yigou/doMarkedAsYundian',
                data: data,
                success: function (res) {
                    if (res && !res.errno) {
                        if (tcb.supportSessionStorage()) {
                            sessionStorage.setItem('SUNING_YUNDIAN_MINIAPP_MARKED', '1')
                        } else {
                            max_count = 0
                            $.dialog.toast('您的环境不支持sessionStorage，将会导致功能异常！')
                        }
                    } else {
                        setTimeout(function () {
                            loop(data)
                        }, 300)
                    }
                },
                fail: function (xhr) {
                    setTimeout(function () {
                        loop(data)
                    }, 300)
                }
            })
        }

        if (window.__IS_SUNING_YUNDIAN_MINIAPP && !sessionStorage.getItem('SUNING_YUNDIAN_MINIAPP_MARKED')) {
            var query = tcb.queryUrl(window.location.search)
            if (!query.channel) {
                setTimeout(function () {
                    if (typeof wx !== 'undefined' && wx.miniProgram) {
                        wx.miniProgram.navigateTo({url: 'pages/oldfornew/index/index'})
                    }
                }, 2000)
                return $.dialog.toast('缺少场景参数channel，即将返回！')
            }
            var data = {
                channel: query.channel
            }
            if (tcb.supportSessionStorage()) {
                sessionStorage.setItem('SUNING_YUNDIAN_MINIAPP_PASSIVENESS', query.channel === 'passiveness' ? '1' : '')
            }
            query.regionNo && (data.regionNo = query.regionNo)
            query.toShopCode && (data.toShopCode = query.toShopCode)
            query.promotionUser && (data.promotionUser = query.promotionUser)

            loop(data)
        }
    }

    doMarkedAsYundian()
})

!function () {
    // 设置页面统计，
    // 统计规则：URL的pathname+query参数中的(from_page+partner_flag)
    function setStatistic() {
        var pathname = window.location.pathname,
            query = tcb.queryUrl(window.location.search),
            params = {}

        if (query['from_page']) {
            params['from_page'] = query['from_page']
        }
        if (query['partner_flag']) {
            params['partner_flag'] = query['partner_flag']
        }
        if (query['self_enterprise']) {
            params['self_enterprise'] = query['self_enterprise']
        }
        if (window.__IS_DAODIAN_BUDAN) {
            params['xxg'] = 1
        }

        var url = tcb.setUrl(pathname, params)

        tcb.statistic(['_trackPageview', url])
    }

    setStatistic()
}()


;/**import from `/resource/js/mobile/huishou/assess/_enter.js` **/
// 入口
!function (global) {
    var
        Root = tcb.getRoot (),
        a = {}

    Root.Assess = a

    tcb.mix (a, {

        $Doc : null,
        $Win : null,

        // 容器

        $Container : null,
        $Inner     : null,

        // 顶部商品详情
        // 底部按钮

        $Model      : null,
        modelHeight : 0,
        $Btn        : null,

        noop : tcb.noop,

        // 独立组件引入

        scroll : Root.scroll,// scroll

        router_inst : null,// 路由实例
        router      : Root.Router || {},// 路由

        // END 独立组件引入

        // 获取容器

        getContainer : function () {
            var
                me = this,
                $Container = me.$Container,
                containerId = 'Main'

            if ($Container && $Container.length) {

                return $Container
            }

            return me.$Container = $ ('#' + containerId)
        },

        getDoc : function () {
            var
                me = this,
                $Doc = me.$Doc

            if ($Doc && $Doc.length) {

                return $Doc
            }

            return me.$Doc = $ (document)
        },

        //做一些初始化操作[not DOM Ready]

        init  : function (options) {
            var
                before = typeof options[ 'before' ] === 'function'
                    ? options[ 'before' ]
                    : a.noop,
                after = typeof options[ 'after' ] === 'function'
                    ? options[ 'after' ]
                    : a.noop

            // DOM Ready之前执行
            // 注册路由等...
            before ()

            // DOM Ready
            a.ready (function () {
                var
                    model_id = a.cache.getModelId ()
                // 初始化时能直接获取到model_id,
                // 那么根据model_id获取评估相关数据
                // 若是只有一个机型,此处也能获取到model_id
                if (model_id) {
                    a.doGetAssessOptionsData (model_id, function () {
                        // DOM Ready之后执行
                        after ()
                    })
                } else {
                    // DOM Ready之后执行
                    after ()
                }
            })

            return this
        },
        /**
         * 做一些初始化操作
         */
        ready : function (callback) {

            $ (function () {
                var
                    $Doc = a.$Doc || $ (document),
                    $Win = a.$Win || $ (window)

                a.$Doc = $Doc
                a.$Win = $Win

                a.$Model = $Doc.find ('.' + a.CLASS_NAME.block_assess_model)
                a.$Btn = $Doc.find ('.' + a.CLASS_NAME.block_btn)

                a.modelHeight = a.$Model.height ()

                // 初始化事件绑定
                a.event.init ()

                typeof callback === 'function' && callback ()
            })

        }

    })

} (this)

;/**import from `/resource/js/mobile/huishou/assess/key.js` **/
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


;/**import from `/resource/js/mobile/huishou/assess/util.js` **/
// 工具方法
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    a.util = {}

    tcb.mix (a.util, {
        /**
         * 判断是否为检测流程,
         *      true：检测流程
         *      false：普通流程
         * @returns {*}
         */
        is_detect : function () {
            var
                is_detect_map = {
                    '1' : false,// 普通流程
                    '2' : true  // 检测流程
                },
                is_detect = a.cache (a.KEY_FLAG_IS_DETECT) || ''
            // 获取不到is_detect标识值，
            // 表示没有识别过是不是检测流程的评估，那么识别处理下
            if (!(is_detect && typeof is_detect_map[ is_detect ] !== 'undefined')) {
                var
                    detect_key = tcb.queryUrl (window.location.search, 'detect_key')

                is_detect = detect_key ? '2' : '1'
                a.cache (a.KEY_FLAG_IS_DETECT, is_detect)
            }

            return is_detect_map[ is_detect ]
        },
        /**
         * 数组去重
         * @param arr
         * @returns {Array}
         */
        numUnique : function (arr) {
            var
                ret = []

            for (var i = 0, n = arr.length; i < n; i++) {
                var _has = false
                for (var j = ret.length - 1; j >= 0; j--) {
                    if (ret[ j ] === arr[ i ]) {
                        _has = true
                        break
                    }
                }

                if (!_has) {
                    ret.push (arr[ i ])
                }
            }

            return ret
        },

        /**
         * 获取属性输出的列数
         * @param cate_id
         * @param is_sku
         * @returns {number}
         */
        getColNumByCateId : function (cate_id, is_sku) {
            is_sku = is_sku || false
            var
                col = 1,
                col_arr = [ 1,
                    2,
                    3 ], // 列数数组
                col_map = {
                    'mix' : col_arr[ 0 ], // 综合 2 列

                    'sku_2' : col_arr[ 0 ], // 容量 3 列
                    'sku_4' : col_arr[ 0 ], // 颜色 3 列
                    'sku_6' : col_arr[ 0 ],  // 渠道 1 列

                    '4'  : col_arr[ 0 ], // 保修情况 2 列
                    '26' : col_arr[ 0 ], // 新旧程度（边框外壳） 1 列
                    '32' : col_arr[ 0 ], // 屏幕外观 1 列
                    '34' : col_arr[ 0 ], // 账号密码 1 列
                    '18' : col_arr[ 0 ]  // 维修拆机史 2 列
                }

            col = col_map[ is_sku ? 'sku_' + cate_id : cate_id ] || col

            return col
        },

        /**
         * 判断$TheOption是否为sku选项
         * @param $TheOption
         * @returns {boolean}
         */
        is_sku : function ($TheOption) {
            var
                is_sku = false
            if ($TheOption) {
                if (typeof $TheOption !== 'object') {
                    var
                        option_id = $TheOption

                    $TheOption = $ ('.' + a.CLASS_NAME.option_item + '[data-id="' + option_id + '"]')
                }

                is_sku = $TheOption.closest ('.' + a.CLASS_NAME.block_model_basic_info).length
                    ? true
                    : false
            }

            return is_sku
        },

        /**
         * 判断选择项id是否已经被选中
         * @param option_id
         * @param is_sku
         * @returns {boolean}
         */
        is_checked : function (option_id, is_sku) {
            var
                is_checked = false,
                checked_comb = a.cache.doGetCheckedComb (is_sku)

            option_id = option_id.toString ()

            if (is_sku) {

                if (tcb.inArray (option_id, checked_comb) > -1) {
                    is_checked = true
                }
            } else {
                var
                    mix_special = checked_comb[ 0 ] || '',
                    special = checked_comb[ 1 ] || []

                if (tcb.inArray (option_id, mix_special.split (',')) > -1) {
                    // 混合专有选项
                    is_checked = true
                } else if (tcb.inArray (option_id, special) > -1) {
                    // 非混合专有选项
                    is_checked = true
                }
            }

            return is_checked
        },

        /**
         * 是否为混合评估项
         * @param $Option
         * @returns {boolean}
         */
        is_mix : function ($Option) {
            if (!($Option && $Option.length)) {
                return false
            }

            return $Option.attr ('data-checked-id')
        },

        /**
         * 锁定标识
         * @returns {*}
         */
        lock                 : function (key) {
            key = key
                ? '_' + key
                : ''

            return a.cache (a.KEY_FLAG_LOCKING + key, true)
        },
        unlock               : function (key) {
            key = key
                ? '_' + key
                : ''

            a.cache (a.KEY_FLAG_LOCKING + key, false)
        },
        is_lock              : function (key) {
            key = key
                ? '_' + key
                : ''

            return a.cache (a.KEY_FLAG_LOCKING + key)
        },
        resizeModelImg       : function ($imgs) {
            $imgs = $imgs || a.$Model.find ('.the-img img')

            $imgs.each (function () {
                var
                    me = this
                me.style.width = ''
                me.style.height = ''

                setTimeout (function () {
                    var
                        $img = $ (me),
                        img_width = $img.width (),
                        img_height = $img.height (),
                        max_size = Math.max (img_width, img_height)

                    tcb.setImgElSize ($img, max_size, max_size)
                }, 300)
            })
        },
        // 获取有描述信息的选项id集合
        getOptionDescIds   : function () {

            return [ '6', '62', '66', '68', '70', '72', '78', '80', '246', '82', '22', '26', '40'/*, '36', '108', '116' */]
        },
        // 获取所以选项描述信息
        getOptionDescAll : function () {

            return {
                // 1个月以上
                // '6': {
                //     img: ['https://p.ssl.qhimg.com/t0134b483f8fde986fe.png'],
                //     desc: ['iPhone手机可根据序列号或者IMEI号查询到保修情况，将序列号或IMEI号输入以下网址进行查询。\n查询地址：https://selfsolve.apple.com/agreementWarrantyDynamic.do?locale=zh_CN\n如何查看iPhone手机的序列号或IMEI号？\n在 “设置>通用>关于本机”中查看序列号或IMEI号，长按可复制。']
                // },

                // START 边框外壳
                // 全新手机
                '62': {
                    // img: ['https://p.ssl.qhimg.com/t01dbd8d82f6882dab7.png'],
                    img: ['https://p2.ssl.qhimg.com/t018357e25ac66d3878.png'],
                    desc: ['仅仅指未拆开过包装的手机。']
                },
                // 外壳完好
                '66': {
                    // img: [],
                    img: ['https://p5.ssl.qhimg.com/t012c03265a1dabbf79.png'],
                    desc: ['外观无任何磕伤，磨伤，划痕或瑕疵。']
                },
                // 外壳有划痕
                '68': {
                    // img: ['https://p2.ssl.qhimg.com/t0101c28965ecc81cf4.png'],
                    img: ['https://p5.ssl.qhimg.com/t012fc3f0ca2fe3b2da.png'],
                    desc: ['外壳边框或背板有明显划痕。']
                },
                // 外壳有磕碰或掉漆
                '70': {
                    // img: ['https://p3.ssl.qhimg.com/t0101a0ab22b9032d1c.png'],
                    img: ['https://p3.ssl.qhimg.com/t0176b53613010be294.png'],
                    desc: ['边框或者背板有磕碰角或裂痕，或出现掉漆现象。']
                },
                // 外壳碎裂
                '247': {
                    img: ['https://p2.ssl.qhimg.com/t01a0cfc483b4de63da.png'],
                    desc: []
                },
                // 机身变形或残裂
                '72': {
                    // img: ['https://p.ssl.qhimg.com/t0104b04fa105e9f7aa.png'],
                    img: ['https://p1.ssl.qhimg.com/t01515b7737b2003201.png'],
                    desc: ['机身的外壳有弯曲，变形或翘起，屏幕与外壳出现分离的现象。']
                },
                // END 边框外壳

                // START 屏幕外观
                // 无划痕/无使用痕迹
                '78': {
                    // img: [],
                    img: ['https://p0.ssl.qhimg.com/t01f1d79bd4efff2326.png'],
                    desc: ['手机未使用过或使用期间一直贴膜保护，屏幕在光照下无可见划痕或磨损。']
                },
                // 屏幕轻微划痕
                '80': {
                    // img: ['https://p3.ssl.qhimg.com/t0192cd49ac29dc86a0.png'],
                    img: ['https://p5.ssl.qhimg.com/t01ff45a8a443b4b51e.png'],
                    desc: [] // '在不贴膜的情况下，屏幕有轻微划痕。'
                },
                // 屏幕明显划痕
                '246': {
                    // img: ['https://p1.ssl.qhimg.com/t01175b34733385a942.png'],
                    img: ['https://p5.ssl.qhimg.com/t01c27b02cb616a0f20.png'],
                    desc: []
                },
                // 屏幕碎裂
                '82': {
                    // img: ['https://p.ssl.qhimg.com/t016d990d7b726de7f8.png'],
                    img: ['https://p5.ssl.qhimg.com/t0125773ad406dd5602.png'],
                    desc: ['屏幕有磕碰角,裂痕或碎裂。']
                },
                // END 屏幕外观

                // START 屏幕显示
                // 显示和触摸正常
                '20': {
                    img: ['https://p4.ssl.qhimg.com/t0115cfac59765d757c.png'],
                    desc: []
                },
                // 有坏点/亮点/色差
                '22': {
                    // img: ['https://p.ssl.qhimg.com/t01099af737252008e0.png'],
                    img: ['https://p5.ssl.qhimg.com/t01736f07e94c751c29.png'],
                    desc: ['1.屏幕上不可修复的单一颜色点或是一块区域，比如屏幕出现白斑或其他颜色斑点等；<br>2.在全屏纯黑色或白色背景下，屏幕出现亮点或者坏点情况；<br>3. 在纯色背景下，出现屏幕色差情况，以蓝色纯色背景图为例，顶部有明显色差。']
                },
                // 触摸异常/显示异常/非原装屏
                '26': {
                    // img: ['https://p.ssl.qhimg.com/t01236188bc143ba0ba.png'],
                    img: ['https://p2.ssl.qhimg.com/t012c6d5b3d0bea43fe.png'],
                    desc: ['屏幕出现触摸无反应，触摸失灵等情况；<br>液晶显示异常，屏幕出现漏液，错乱，严重老化等现象。']
                },
                // 透图/透字/烧屏
                '253': {
                    img: ['https://p1.ssl.qhmsg.com/t01ebe09a0304311cc9.png']
                },
                //修过主板/改容量
                '42': {
                    desc: ['扩容、换壳、主板盖章/贴签、黑纸坏、盖板开、飞线、无IMEI/与实际不符、电池更换/松动/撬痕、维修尾插/扬声器、内部螺丝/零件尾插螺丝/排线盖板螺丝确实或无法打开']
                },
                // 不显示
                // https://p0.ssl.qhimg.com/t01cbfdc984a5a8ff43.png
                // END 屏幕显示

                // START 维修拆机史
                // 修过小部件
                // '40': {
                //     img: ['https://p.ssl.qhimg.com/t01d8876df825617cb9.png'],
                //     desc: ['手机后盖螺丝有拆过，除主板外，维修过手机屏幕，扬声器，尾插等其他小部件。']
                // }
                // END 维修拆机史
            }
        },
        // 获取选项描述信息
        getOptionDesc : function (option_id) {

            var descMap = this.getOptionDescAll()

            return descMap[option_id] || null
        },

        /**
         * 生成评估组数据
         * @param groupData
         * @returns {{
         *      group_title: *,
         *      group_id: (*|string),
         *      options: *,
         *      selected: (*|string),
         *      selected_comb: (*|Array),
         *      col: number,
         *      is_sku: (*|boolean),
         *      no_active: *,
         *      no_outer: (*|boolean),
         *      mix: (*|boolean)
         *      }}
         */
        genGroupData : function (groupData) {
            var
                group_id = groupData[ 1 ] || '',
                mix = groupData[ 5 ][ 'mix' ] || false,
                is_sku = groupData[ 5 ][ 'is_sku' ] || false,
                col = a.util.getColNumByCateId (mix ? 'mix' : group_id, is_sku)

            return {
                // 标题
                group_title   : groupData[ 0 ],
                // id
                group_id      : group_id,
                // 选项集合
                options       : groupData[ 2 ],
                // 被选中的选项id
                selected      : groupData[ 3 ] || '',
                // 被选中的选项id组合
                selected_comb : groupData[ 4 ] || [],
                // 显示列
                col           : col,
                // 是否sku
                is_sku        : is_sku,
                // 不激活状态
                no_active     : groupData[ 5 ][ 'no_active' ],
                // 不要外部容器
                no_outer      : groupData[ 5 ][ 'no_outer' ] || false,
                // 聚合选项
                mix           : mix,
                // 只读不可修改
                readonly      : groupData[ 5 ][ 'readonly' ] || false,
                // 选中并收起
                collapse      : groupData[ 5 ][ 'collapse' ] || false
            }
        }

    })

} (this)


;/**import from `/resource/js/mobile/huishou/assess/valid.js` **/
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


;/**import from `/resource/js/mobile/huishou/assess/cache.js` **/
// 数据cache
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    a.cache = function (key, val) {

        return tcb.cache (key, val)
    }
    a.storage = {}

    // 缓存
    tcb.mix (a.cache, {

        ex : function (key, val) {
            var
                model_id = a.cache.getModelId ()

            key = key + '_' + model_id

            return model_id
                ? tcb.cache (key, val)
                : false
        },

        /**
         * 获取选中的型号信息
         * @returns {*}
         */
        getModel   : function (model_id) {
            var
                model = null,
                modelList = a.cache (a.KEY_MODELS)||[]

            model_id = model_id || a.cache (a.KEY_MODEL_ID)
            if (!model_id && a.storage.sessionStorage) {
                model_id = a.storage.sessionStorage.getItem (a.KEY_MODEL_ID)
            }

            if (!model_id) {
                // 找不到 model id , 如果 model list 只有一个型号, 直接使用

                if (modelList && modelList.length === 1) {
                    model = modelList[ 0 ]
                }

            } else {
                if (modelList && modelList.length === 1) {
                    model = modelList[ 0 ]
                } else {
                    for (var i = 0; i < modelList.length; i++) {

                        if (model_id == modelList[ i ][ 'model_id' ]) {

                            model = modelList[ i ]

                            break
                        }
                    }
                }
            }

            if (model){
                a.cache (a.KEY_MODEL_ID, model[ 'model_id' ])
                if (a.storage.sessionStorage) {
                    a.storage.sessionStorage.setItem (a.KEY_MODEL_ID, model[ 'model_id' ])
                }
            }

            return model
        },

        /**
         * 获取选中的型号id
         * @returns {*}
         */
        getModelId : function () {
            var
                model = null,
                model_id = a.cache (a.KEY_MODEL_ID)

            if (model_id || (model = a.cache.getModel (model_id))) {

                model_id = model_id || model[ 'model_id' ]
            }

            return model_id
        },
        // 设置选中的型号id
        setModel   : function (model_id) {
            var
                model = null,
                modelList = a.cache (a.KEY_MODELS),
                len = modelList.length

            if (modelList && len) {

                if (len === 1) {
                    model = modelList[ 0 ]
                } else {
                    for (var i = 0; i < len; i++) {
                        if (model_id == modelList[ i ][ 'model_id' ]) {
                            model = modelList[ i ]
                            break
                        }
                    }
                }
            }

            if (!model) {
                model_id = ''
            }

            a.cache (a.KEY_MODEL_ID, model_id)
            if (a.storage.sessionStorage) {
                a.storage.sessionStorage.setItem (a.KEY_MODEL_ID, model_id)

                // 切换model_id之后,全面恢复机器型号下的选中数据
                a.cache.doRecoverAssessData ()
            }

            return model_id
        },
        // 设置选中的型号id
        setModelId : function (model_id) {

            return a.cache.setModel (model_id)
        },

        // 缓存评估数据

        doCacheAssessed : __cacheAssessed,

        // 缓存评估数据

        doGetAssessed : __getAssessed,

        // 获取选中的评估项id组合

        doGetCheckedComb : doGetCheckedComb,

        // cache选中的评估项id(存储评估进度,不包含城市选择)

        doCacheChecked : doCacheChecked,

        // 直接添加选定项id组合到 cache 以及 storage

        doCacheCheckedComb : doCacheCheckedComb,

        //全面恢复存储在 storage 中的数据

        doRecoverAssessData : doRecoverAssessData,

        // 清除storage的缓存

        doCleanStorage : doCleanStorage

    })
    // 存储
    tcb.mix (a.storage, {

        sessionStorage : tcb.supportSessionStorage() ? window.sessionStorage : null,

        getItem : function (key) {
            var
                ret = '',
                model_id = a.cache.getModelId ()

            if (a.storage.sessionStorage) {

                ret = a.storage.sessionStorage.getItem (key + '_' + model_id)
            }
            return ret
        },
        setItem : function (key, val) {
            var
                ret = '',
                model_id = a.cache.getModelId ()

            if (a.storage.sessionStorage) {

                ret = a.storage.sessionStorage.setItem (key + '_' + model_id, val)
                a.storage.sessionStorage.setItem(a.KEY_STORAGE_LAST_ACTIVE_TIME, (new Date).getTime())
            }
            return ret
        }
    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    /**
     * 获取选中的评估项id组合
     *
     * @param is_sku
     * @returns {*}
     */
    function doGetCheckedComb (is_sku) {
        var
            checked_comb = null
        if (is_sku) {

            checked_comb = a.cache.ex (a.KEY_CHECKED_SKU_OPTION_ID_COMB) || []

            // 以下都是特殊条件特别处理
            if (checked_comb.length < 0) {
                var mem_id = a.cache (a.KEY_OPTIONS_MEM_DETECTED)

                checked_comb.push (mem_id)
            }
        } else {

            checked_comb = a.cache.ex (a.KEY_CHECKED_SPECIAL_OPTION_ID_COMB) || []

            // 以下都是特殊条件特别处理
            if (!(checked_comb[ 0 ] && checked_comb[ 0 ].length)) {
                checked_comb[ 0 ] = []
                // 默认选中的混合专有评估项的map
                var default_checked_mix_option_map = a.cache.ex (a.KEY_DEFAULT_CHECKED_MIX_OPTION_MAP)
                if (default_checked_mix_option_map) {
                    for (var group_id in default_checked_mix_option_map) {
                        if (default_checked_mix_option_map.hasOwnProperty (group_id)) {
                            // 将默认选中的混合评估项id,加入cache
                            checked_comb[ 0 ].push (default_checked_mix_option_map[ group_id ][ 'option_id' ])
                        }
                    }
                }
                checked_comb[ 0 ] = checked_comb[ 0 ].join (',')
            }
            if (!(checked_comb[ 1 ] && checked_comb[ 1 ].length)) {

                // 默认选中的专有评估项
                var default_checked_special = a.cache.ex (a.KEY_DEFAULT_CHECKED_SPECIAL_OPTION_ID_COMB)

                checked_comb[ 1 ] = default_checked_special
                    ? default_checked_special.split (',')
                    : []
            }
        }

        return a.cache.doCacheCheckedComb (checked_comb, is_sku)
    }

    /**
     * cache选中的评估项id(存储评估进度,不包含城市选择)
     *      支持 sessionStorage 时,同时使用 sessionStorage 进行更持久的存储
     *
     * @param options [选项id,[互斥的其他id]]
     * @param is_sku  是否sku属性
     * @param is_mix  是否mix混合评估项
     */
    function doCacheChecked (options, is_sku, is_mix) {
        var
            option_checked = options[ 0 ].toString (), // 选中的选项(string)
            options_except = options[ 1 ] instanceof Array
                ? options[ 1 ]
                : [],  // 其他非选中选项(array||undefined)
            checked_comb = null

        if (is_sku) {
            // 存储选中的sku评估项

            checked_comb = __cacheSkuAssessOptions (option_checked, options_except)

        } else {

            // 存储选中的专有评估项(聚合和非聚合)
            checked_comb = __cacheSpecialAssessOptions (option_checked, options_except, is_mix)
        }
        return checked_comb
    }

    /**
     * 直接添加评估结果集合到 cache 以及 storage
     *
     * @param checked_cache
     * @param is_sku
     */
    function doCacheCheckedComb (checked_cache, is_sku) {
        // 更新 checked_cache
        // 第三步: 确定新的 checked_cache 和 checked_storage 的关系,判断是否更新 checked_storage

        var
            checked_comb = null

        if (is_sku) {

            // 根据最新的checked_cache,更新cache
            checked_comb = a.cache.ex (a.KEY_CHECKED_SKU_OPTION_ID_COMB, checked_cache)

            if (a.storage.sessionStorage) {
                __storageSkuAssessOptions (checked_cache)
            }
        } else {

            // 根据最新的 checked_cache ,更新cache
            checked_comb = a.cache.ex (a.KEY_CHECKED_SPECIAL_OPTION_ID_COMB, checked_cache)

            // 第三步: 确定新的 checked_cache 和 checked_storage 的关系,判断是否更新 checked_storage
            if (a.storage.sessionStorage) {
                __storageSpecialAssessOptions (checked_cache)
            }
        }

        return checked_comb
    }

    /**
     * 全面恢复存储在 storage 中的数据
     * 同时处理一些默认数据的使用
     */
    function doRecoverAssessData () {
        if (!a.storage.sessionStorage) {
            // 不支持 sessionStorage

            return
        }

        // 恢复时间相对于之前活动时间超过2小时，
        // 直接干掉storage，然后返回
        var
            last_active_time = a.storage.sessionStorage.getItem(a.KEY_STORAGE_LAST_ACTIVE_TIME),
            duration_for_test = 0,
            duration = duration_for_test || 3600000
        if ((new Date).getTime()-last_active_time>duration){

            return a.cache.doCleanStorage()
        }

        var
            model_id = a.cache.getModelId ()
        // 没有获取到机型id,不还原任何存储数据
        if (!model_id) { return }

        var
            checked_storage = a.storage.getItem (a.KEY_CHECKED_SPECIAL_OPTION_ID_COMB_STORAGE) || '', // 选中的专有评估项
            checked_sku_storage = a.storage.getItem (a.KEY_CHECKED_SKU_OPTION_ID_COMB_STORAGE) || '',  // 选中的sku项
            // 默认选中的专有评估项
            default_checked_special = a.cache.ex (a.KEY_DEFAULT_CHECKED_SPECIAL_OPTION_ID_COMB)

        // 专有评估项
        if (checked_storage) {
            checked_storage = checked_storage.split (a.KEY_STORAGE_ARRAY_DELIMITER)

            // storage中有选中项,优先使用storage中的数据
            // 否则,若有默认选中项就用默认数据
            if (checked_storage[ 1 ]) {
                checked_storage[ 1 ] = checked_storage[ 1 ].split (',')
            } else {
                checked_storage[ 1 ] = default_checked_special
                    ? default_checked_special.split (',')
                    : []
            }

        } else {

            checked_storage = [ '',
                                default_checked_special
                                    ? default_checked_special.split (',')
                                    : [] ]

        }
        // sku评估项
        checked_sku_storage = checked_sku_storage
            ? checked_sku_storage.split (',')
            : []

        a.cache.doCacheCheckedComb (checked_storage)
        a.cache.doCacheCheckedComb (checked_sku_storage, true)

        __recoverAssessed ()

    }

    // 清除storage的缓存
    function doCleanStorage () {
        if (!a.storage.sessionStorage) {
            // 不支持 sessionStorage

            return
        }

        if (a.storage.sessionStorage.length) {
            var itemKeys = []
            for (var i = 0; i < a.storage.sessionStorage.length; i++) {
                var itemKey = a.storage.sessionStorage.key(i)
                if (itemKey && itemKey.indexOf('key_') === 0) {
                    itemKeys.push(itemKey)
                }
            }
            tcb.each(itemKeys, function (i, key) {
                a.storage.sessionStorage.removeItem(key)
            })
        }
        // a.storage.sessionStorage.clear ()
    }



    // =================================================================
    // 私有接口 private
    // =================================================================

    // cache 选中的sku评估项
    function __cacheSkuAssessOptions (checked, excepts) {
        var
            checked_cache = a.cache.doGetCheckedComb (true), // 缓存中--已选择的评估项(数组)
            excepts_pos = -1

        // 第一步: 遍历非选中的选项,确认存在于已选中的选项中的位置,不存在则为-1
        $.each (excepts, function (i, except_id) {
            var
                except_id_pos = tcb.inArray (except_id, checked_cache)
            if (except_id_pos > -1) {
                excepts_pos = except_id_pos
            }
        })

        // 第二步: 根据非选中的选项的位置excepts_pos,
        // 确定将checked加入cache中的方式,然后将checked加入其中
        if (excepts_pos === -1) {
            // 非选中的选项不存在于 cache 之中....

            // 再判断选中的选项在不在 cache 之中,在其中就不做处理,
            // 否则直接将选项push进 cache
            if (tcb.inArray (checked, checked_cache) === -1) {
                checked_cache.push (checked);
            }
        } else {
            // 非选中的选项存在于checked之中...

            // 从excepts_pos位置开始,干掉所有后边的数据,
            // 然后再将checked push到其中
            checked_cache.splice (excepts_pos)
            checked_cache.push (checked)
        }

        // 根据最新的checked_cache,更新 cache 并且更新 storage
        return a.cache.doCacheCheckedComb (checked_cache, true)
    }

    // storage 选中的sku评估项
    function __storageSkuAssessOptions (checked_cache) {
        var
            checked_storage // 存储中--选中的选项

        checked_storage = a.storage.getItem (a.KEY_CHECKED_SKU_OPTION_ID_COMB_STORAGE) || '' // 存储中--已选则评估项(逗号分割的字符串)
        checked_cache = checked_cache.join (',')

        if (checked_storage.indexOf (checked_cache) === 0) {

            var
                split_right = checked_storage.split (checked_cache)[ 1 ]
            // storage中当前checked_cache字符串右侧的字符串不为空,
            // 并且第一个字符不是逗号(,)表示cache在storage中没有缓存,
            // 那么将checked_cache更新storage
            if (split_right && split_right.charAt (0) !== ',') {
                checked_storage = checked_cache
                a.storage.setItem (a.KEY_CHECKED_SKU_OPTION_ID_COMB_STORAGE, checked_storage)
            }
        } else {
            // 完全无法匹配,直接更新storage

            checked_storage = checked_cache;
            a.storage.setItem (a.KEY_CHECKED_SKU_OPTION_ID_COMB_STORAGE, checked_storage)
        }
    }

    // cache 选中的专有评估项(聚合和非聚合)
    function __cacheSpecialAssessOptions (checked, excepts, is_mix) {
        var
            checked_cache = a.cache.doGetCheckedComb (), // [非sku评估项id]缓存中--已选择的评估项id组合(数组)
            excepts_pos = -1

        if (is_mix) {
            // [聚合评估项] is_mix为true

            // 选项值不相等,那么直接用新的选中选项组替换
            if (checked_cache[ 0 ] != checked) {

                checked_cache[ 0 ] = checked
            }
        } else {
            // [非聚合评估项] 非聚合的选项,checked选项为单个的选项id

            var
                checked_special_cache = checked_cache[ 1 ];

            // 第一步: 遍历非选中的选项,确认存在于已选中的选项中的位置,不存在则为-1
            $.each (excepts, function (i, except_id) {
                var
                    except_id_pos = tcb.inArray (except_id, checked_special_cache)
                if (except_id_pos > -1) {
                    excepts_pos = except_id_pos
                }
            })

            // 第二步: 根据非选中的选项的位置 excepts_pos ,
            // 确定将 checked 加入 cache 中的方式,然后将checked加入其中
            if (excepts_pos === -1) {
                // 非选中的选项不存在于 cache 之中....

                // 再判断选中的选项在不在 cache 之中,在其中就不做处理,
                // 否则直接将选项push进 cache
                if (tcb.inArray (checked, checked_special_cache) === -1) {
                    checked_special_cache.push (checked)
                }
            } else {
                // 非选中的选项存在于 cache 之中...

                // 在 excepts_pos 位置直接替换掉
                checked_special_cache.splice (excepts_pos, 1, checked);
            }
        }

        // 根据最新的checked_cache,更新 cache 并且更新 storage
        return a.cache.doCacheCheckedComb (checked_cache)
    }

    // storage 选中的专有评估项(聚合和非聚合)
    function __storageSpecialAssessOptions (checked_cache) {
        var
            checked_storage // 存储中--选中的选项

        // 非sku属性
        checked_storage = a.storage.getItem (a.KEY_CHECKED_SPECIAL_OPTION_ID_COMB_STORAGE) || '' // 存储中--已选则评估项(逗号分割的字符串)
        checked_cache = checked_cache[ 0 ] + a.KEY_STORAGE_ARRAY_DELIMITER + checked_cache[ 1 ].join (',')

        if (checked_storage.indexOf (checked_cache) === 0) {

            var
                split_right = checked_storage.split (checked_cache)[ 1 ]

            // storage 中当前 checked_cache 字符串右侧的字符串不为空,并且第一个字符不是逗号(,)那么将 checked_cache 更新storage
            if (split_right && split_right.charAt (0) !== ',') {
                checked_storage = checked_cache
                a.storage.setItem (a.KEY_CHECKED_SPECIAL_OPTION_ID_COMB_STORAGE, checked_storage);
            }
        } else {
            // 完全无法匹配,直接更新storage

            checked_storage = checked_cache
            a.storage.setItem (a.KEY_CHECKED_SPECIAL_OPTION_ID_COMB_STORAGE, checked_storage);
        }
    }

    // 缓存评估数据
    function __cacheAssessed (key, data) {

        a.cache (key, data)


        //__storageAssessed (key, data)
    }

    function __storageAssessed (key, data) {
        if (!a.storage.sessionStorage) {
            // 不支持 sessionStorage

            return
        }

        var
            assessed_cache_keys = a.storage.sessionStorage.getItem (a.KEY_ASSESSED_CACHE_KEYS_STORAGE)

        assessed_cache_keys = assessed_cache_keys ? assessed_cache_keys.split (a.KEY_STORAGE_ARRAY_DELIMITER) : []
        if (tcb.inArray (key, assessed_cache_keys) === -1) {
            assessed_cache_keys.push (key)
        }
        a.storage.sessionStorage.setItem (a.KEY_ASSESSED_CACHE_KEYS_STORAGE, assessed_cache_keys.join (a.KEY_STORAGE_ARRAY_DELIMITER))

        var
            storage_data = {
                errno        : data[ 'errno' ],
                errmsg       : data[ 'errmsg' ],
                assess_key   : data[ 'result' ] ? data[ 'result' ][ 'assess_key' ] : '',
                pinggu_price : data[ 'result' ] ? data[ 'result' ][ 'pinggu_price' ] : ''
            }
        a.storage.sessionStorage.setItem (key, $.param (storage_data))
    }

    function __recoverAssessed () {
        if (!a.storage.sessionStorage) {
            // 不支持 sessionStorage

            return
        }
        var
            assessed_cache_keys = a.storage.sessionStorage.getItem (a.KEY_ASSESSED_CACHE_KEYS_STORAGE)

        assessed_cache_keys = assessed_cache_keys ? assessed_cache_keys.split (a.KEY_STORAGE_ARRAY_DELIMITER) : []

        var
            storage_assessed_data = '',
            assessed_data = null
        for (var i = 0; i < assessed_cache_keys.length; i++) {
            storage_assessed_data = a.storage.sessionStorage.getItem (assessed_cache_keys[ i ])
            storage_assessed_data = tcb.queryUrl (storage_assessed_data)
            assessed_data = {
                errno  : parseInt(storage_assessed_data[ 'errno' ], 10)||0,
                errmsg : storage_assessed_data[ 'errmsg' ],
                result : ''
            }
            if (!assessed_data[ 'errno' ]) {
                assessed_data[ 'result' ] = {
                    assess_key   : storage_assessed_data[ 'assess_key' ],
                    pinggu_price : storage_assessed_data[ 'pinggu_price' ]
                }
            }
            a.cache (assessed_cache_keys[ i ], assessed_data)
        }
    }

    function __getAssessed (key) {

        return a.cache (key)
    }


} (this)


;/**import from `/resource/js/mobile/huishou/assess/handle_data.js` **/
// 数据处理函数
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    tcb.mix (a, {

        // 处理初始化数据

        handleInitData : handleInitData,

        // 根据型号id,获取针对当前机型的评估项数据

        doGetAssessOptionsData : doGetAssessOptionsData
    })

    // =================================================================
    // 公共接口 public
    // =================================================================

    // 处理初始化数据
    function handleInitData () {

        // 具体机型数据放在最前边处理
        __handleModelList ()

        __handleOptionsScreenDetected ()
        __handleOptionsDetected ()
        __handleOptionsMemDetected ()

        // 前置显示的专有评估组id集合
        // 4为保修期选项组
        // === sku评估组和专属评估组放入一页显示，那么不再需要前置专属评估组了 ===
        a.cache(a.KEY_PRE_SPECIAL_GROUP_IDS, ['4'])
    }

    // 根据型号id,获取针对当前机型的评估项数据
    // (默认系统已经cache了app自动检测过的选项,以及机型的内存属性项)
    function doGetAssessOptionsData (model_id, callback) {
        var optionsDetected = a.cache (a.KEY_OPTIONS_DETECTED) || '',
            optionsMemDetected = a.cache (a.KEY_OPTIONS_MEM_DETECTED) || ''

        var sku_ready = false,
            special_ready = false,
            countdown = 5000

        // 获取型号sku评估项
        a.getModelSkuOptions ({
            model_id           : model_id,
            memory_attr_val_id : optionsMemDetected
        }, function () {
            sku_ready = true
        })

        // 获取型号特有评估项
        a.getModelSpecialOptions ({
            model_id       : model_id,
            assess_options : optionsDetected
        }, function () {
            special_ready = true
        })

        // if (sku_ready && special_ready) {
        //     typeof callback === 'function' && callback ()
        // } else {
        //     countdown -= 100
        //     setTimeout (__ensureDataReady, 100)
        // }
        __ensureDataReady()

        // 确保数据获取成功
        function __ensureDataReady () {
            if (sku_ready && special_ready) {
                a.getNotebookAutoCheckData(function (data) {
                    if (data) {
                        // 获取笔记本验机数据，并且有数据

                        // 预评估的评估项id集合（不包括sku）
                        var specialOptionIdComb = []
                        // var skuList = [] // 去除输出预评估的sku信息
                        // 预评估的评估项sku id集合（只有sku）
                        var skuOptionIdComb = []
                        tcb.each(data.pingguList || {}, function (k, val) {
                            specialOptionIdComb.push(val.toString())
                        })
                        tcb.each(data.skuInfoList || {}, function (k, val) {
                            skuOptionIdComb.push(val.toString())
                        })
                        // tcb.each(data.skuList || {}, function (k, val) {
                        //     skuList.push(val)
                        // })
                        a.cache.ex(a.KEY_PRE_ASSESS_SPECIAL_OPTION_ID_COMB, specialOptionIdComb)
                        a.cache.ex(a.KEY_PRE_ASSESS_SKU_OPTION_ID_COMB, skuOptionIdComb)
                        // a.cache.ex(a.KEY_PRE_ASSESS_SKU_LIST, skuList)
                    }
                    typeof callback === 'function' && callback()
                })
            } else if (countdown < 0) {
                // 获取机型下数据失败了,那么先干掉cache的model_id,
                // 否则由于model_id被cache,就默认当作model_id相关的选项数据已经获取成功
                a.cache.setModelId('')

                $.dialog.toast('评估项获取失败，请重新尝试或刷新页面', 2000)

                return
            } else {
                countdown -= 10
                setTimeout(__ensureDataReady, 10)
            }
        }
    }


    // =================================================================
    // 私有接口 private
    // =================================================================

    // app检测过的检测项
    function __handleOptionsDetected () {
        var
            optionsDetected = global.__OPTIONS_DETECTED || ''

        a.cache (a.KEY_OPTIONS_DETECTED, optionsDetected)
    }

    // 屏幕功能检测结果
    // 有检测结果就正常存储，否则存储为空数组
    function __handleOptionsScreenDetected () {
        var
            ret = [],
            optionsScreenDetected = (!global.__OPTIONS_SCREEN_DETECTED || global.__OPTIONS_SCREEN_DETECTED === 'null')
                ? '[]'
                : global.__OPTIONS_SCREEN_DETECTED

        try {
            optionsScreenDetected = $.parseJSON (optionsScreenDetected)
        } catch (ex) {
            optionsScreenDetected = []
        }

        var
            screenDetectTypeMap = {
                screen_display : [ 0,
                                   '显示' ],
                screen_touch   : [ 1,
                                   '触摸' ]
            }

        $.each (optionsScreenDetected, function (k, item) {
            var
                index = screenDetectTypeMap[ k ][ 0 ],
                group_title = screenDetectTypeMap[ k ][ 1 ]

            ret[ index ] = {
                group_title : group_title,
                option_key  : k,
                option_name : item
            }
        })

        a.cache (a.KEY_OPTIONS_SCREEN_DETECTED, ret)
    }

    // 检测项：内存id
    function __handleOptionsMemDetected () {
        var optionsMemDetected = global.__OPTIONS_MEM_DETECTED || ''

        a.cache (a.KEY_OPTIONS_MEM_DETECTED, optionsMemDetected)
    }

    // 回收详细机型列表
    function __handleModelList () {
        var
            modelList = global.__MODEL_LIST || '[]',
            len = 0

        modelList = $.parseJSON (modelList)
        len = modelList ? modelList.length : 0

        // 机型列表
        a.cache (a.KEY_MODELS, modelList)
        // 机型列表的长度
        a.cache (a.KEY_MODELS_COUNT, len)
    }

} (this)


;/**import from `/resource/js/mobile/huishou/assess/handle_options.js` **/
// 评估项的处理
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    tcb.mix (a, {
        //
        // 接口方法
        //

        /**
         * 评估
         */
        doAssess : doAssess,

        /**
         * 获取型号sku选项
         */
        getModelSkuOptions : getModelSkuOptions,

        /**
         * 获取型号sku确定后的专有评估选项
         */
        getModelSpecialOptions : getModelSpecialOptions,

        /**
         * 获取sku组集合
         */
        getSkuGroups : getSkuGroups,

        /**
         * 获取专有评估组集合
         */
        getSpecialGroups : getSpecialGroups,

        /**
         * 获取前置专有评估组（当前只有 保修情况评估组）
         */
        getPreSpecialGroups : getPreSpecialGroups,

        getOfficialDiffData : getOfficialDiffData,

        // 获取笔记本自动验机数据
        getNotebookAutoCheckData : getNotebookAutoCheckData

    })

    // =================================================================
    // 公共接口 public
    // =================================================================

    /**
     * 执行评估
     * @param options
     */
    function doAssess (options) {
        var
            fail = typeof options[ 'fail' ] === 'function'
                ? options[ 'fail' ]
                : a.noop,
            before = typeof options[ 'before' ] === 'function'
                ? options[ 'before' ]
                : a.noop,
            after = typeof options[ 'after' ] === 'function'
                ? options[ 'after' ]
                : a.noop,
            error = typeof options[ 'error' ] === 'function'
                ? options[ 'error' ]
                : a.noop

        // 评估验证失败,不显示页面提示效果,
        // 执行失败回调
        if (!a.valid.assess (true)) {

            return fail ()
        }

        var checked_sku_comb = a.cache.doGetCheckedComb (true),
            sku_option_id_comb_map = a.cache.ex (a.KEY_SKU_ATTR_MAP) || {},

            checked_special_comb = a.cache.doGetCheckedComb (false),
            detected_special_comb = a.cache.ex (a.KEY_FILTERED_DETECTED_OPTION_COMB) || '',
            special_comb = []

        special_comb.push (checked_special_comb[ 0 ], checked_special_comb[ 1 ].join (','))
        if (detected_special_comb) {
            special_comb.push (detected_special_comb)
        }

        //sub_options:90,94,106,10,16,20,30,34,48,52,56,84,6,62,78,38
        //sku_group_id:121
        //model_id:8
        var data = {
                sku_group_id : sku_option_id_comb_map[ checked_sku_comb.join (',') ],
                sub_options  : special_comb.join (','),
                model_id     : a.cache.getModelId ()
            }
        if (window.__IMEI){
            data['imei'] = window.__IMEI
        }
        var query = tcb.queryUrl(window.location.search)
        var global_data = JSON.parse(tcb.html_decode(decodeURIComponent(query._global_data||'{}')))
        if (global_data && global_data.shop_id) {
            data['shop_id'] = global_data.shop_id
            data['apple_ces_hs'] = 1
        }
        if (query['pre_assess']) {
            data['arc_assess_key'] = query['pre_assess']
        }

        // 评估
        __assess (data, before, after, error)
    }

    // 获取型号sku选项
    // params : 获取sku选项组的参数,一共两个参数
    //          model_id -> 必选
    //          memory_attr_val_id -> 可选
    function getModelSkuOptions (params, callback, error) {
        var
            sku_attr_cate = a.cache.ex (a.KEY_SKU_ATTR_CATE)

        if (sku_attr_cate) {
            // 已经有了SKU评估项

            typeof callback === 'function' && callback ()
        } else {
            // 获取型号sku评估项
            __modelOptionsGetter ({
                type     : 'sku',
                params   : params,
                callback : callback,
                error    : error,
                handle   : __handleModelSkuOptions
            })
        }

    }

    // 获取型号sku确定后的专有评估选项
    // params : 获取专有选项组的参数,一共两个参数
    //          model_id -> 必选
    //          assess_options -> 可选
    function getModelSpecialOptions (params, callback, error) {
        var
            special_options_cate = a.cache.ex (a.KEY_SPECIAL_OPTIONS_CATE)

        if (special_options_cate) {
            // 已经有了SKU评估项

            typeof callback === 'function' && callback ()
        } else {
            __modelOptionsGetter ({
                type     : 'special',
                params   : params,
                callback : callback,
                error    : error,
                handle   : __handleModelSpecialOptions
            })
        }
    }


    // 获取sku组集合
    //      隐含信息为已经选中的sku评估项id的组合
    function getSkuGroups (options) {
        var
            delimiter_id = (options[ 'delimiter_id' ] || '').toString (), // 起始id
            no_active = options[ 'no_active' ] || false, // 是否激活
            checked_comb = a.cache.doGetCheckedComb (true) // 已经选择的sku评估项id组合
        // 预评估的评估项sku id集合（只有sku）
        var preAssessSkuOptionIdComb = a.cache.ex(a.KEY_PRE_ASSESS_SKU_OPTION_ID_COMB) || []

        // 【合并】已选中集合 和 预评估选中的集合
        checked_comb = __mergeSkuCheckedComb(checked_comb, preAssessSkuOptionIdComb)

        // 添加第一个sku组
        var sku_groups = __getFirstSkuGroup (checked_comb, {
                delimiter_id : delimiter_id,
                no_active    : no_active
            })

        // 根据已选的sku属性项组合,往sku组集合中添加更多的sku组(第一组之后的组)
        // 同时在最后做一些特定处理...
        // __addMoreSkuGroupsByCheckedComb 会导致checked_comb和sku_group直接被修改
        sku_groups = __addMoreSkuGroupsByCheckedComb (checked_comb, sku_groups, {
            delimiter_id : delimiter_id,
            no_active    : no_active
        })

        // 重新cache选中的sku属性项id组合
        a.cache.doCacheCheckedComb (checked_comb, true)

        return sku_groups
    }

    // 获取专有评估项
    function getSpecialGroups () {
        var checked_comb = a.cache.doGetCheckedComb (false),// 被选中的选项的组合,false表示special属性
            // 选项组的基本信息列表
            base_info_groups = a.cache.ex (a.KEY_SPECIAL_OPTIONS_CATE),
            // 组的选项集合列表
            options_list = a.cache.ex (a.KEY_SPECIAL_OPTIONS_GROUP_LIST),
            // 可输出的评估项组集合
            groups = [],
            // 混合专有选项
            mix_checked_comb = checked_comb[ 0 ] || '',
            // 专有选项
            special_checked_comb = checked_comb[ 1 ] || [],
            // 预评估选中的，专有选项 和 混合专有选项 集合
            special_n_mix_checked_pre_assess = a.cache.ex(a.KEY_PRE_ASSESS_SPECIAL_OPTION_ID_COMB) || []

        var _global_data = tcb.queryUrl(window.location.search, '_global_data'),
            forceCheckedSet = []
        if (_global_data){
            try{
                _global_data = JSON.parse(tcb.html_decode(decodeURIComponent(_global_data)))
                forceCheckedSet = _global_data['force_checked'] ? _global_data['force_checked'].toString().split(',') : forceCheckedSet
            }catch (ex){tcb.error(ex)}
        }
        if (special_n_mix_checked_pre_assess && special_n_mix_checked_pre_assess.length) {
            forceCheckedSet = forceCheckedSet.concat(special_n_mix_checked_pre_assess)
        }
        forceCheckedSet = a.util.numUnique(forceCheckedSet)

        $.each (base_info_groups, function (i, base_info_group) {
            // 评估组id存在于前置显示的专有评估组id集合内，直接跳过
            if (tcb.inArray (base_info_group[ 'options_cate_id' ].toString (), a.cache (a.KEY_PRE_SPECIAL_GROUP_IDS) || []) > -1) {
                return true
            }
            var
                options = options_list[ i ],
                selected_pos = -1,
                readonly = false,
                collapse = false
            // 由于专有选项的选中组合顺序，可能不是按照组的顺序排列的，
            // 所以需要遍历所有选项来确定是不是有选项在special_checked_comb中存在
            for (var ii = 0; ii < options.length; ii++) {
                selected_pos = tcb.inArray (options[ ii ][ 'option_id' ].toString (), special_checked_comb)
                if (selected_pos > -1) {
                    break
                }
            }
            // 再次遍历options，确认option是否在强制被选中的集合中，
            // 若是有被强制选中的option，那么将次option设置为选中，并且此评估组被设置为readonly状态
            for (var iii = 0; iii < options.length; iii++) {
                if (tcb.inArray (options[ iii ][ 'option_id' ].toString (), forceCheckedSet)>-1){
                    readonly = true
                    if (tcb.inArray(options[iii]['option_id'].toString(), special_n_mix_checked_pre_assess) > -1) {
                        collapse = true
                    }
                    if (selected_pos>-1){
                        special_checked_comb.splice(selected_pos, 1, options[ iii ][ 'option_id' ].toString ())
                    } else {
                        special_checked_comb.push(options[ iii ][ 'option_id' ].toString ())
                        selected_pos = special_checked_comb.length - 1
                    }
                    break
                }
            }
            groups.push (
                a.util.genGroupData ([
                    base_info_group[ 'options_cate_name' ],
                    base_info_group[ 'options_cate_id' ],
                    options,
                    selected_pos > -1 ? special_checked_comb[ selected_pos ] : '',
                    [],
                    {
                        is_sku    : false,
                        no_active : false,
                        readonly  : readonly,
                        collapse  : collapse
                    }
                ])
            )
        })

        // 多组混合选项集合
        var mix_options = a.cache.ex (a.KEY_MIX_OPTIONS),
            default_checked_mix_option_map = a.cache.ex (a.KEY_DEFAULT_CHECKED_MIX_OPTION_MAP),
            default_checked_pos = -1
        mix_checked_comb = mix_checked_comb.split (',')
        for (var i = 0; i < mix_options.length; i++) {
            mix_options[i]['option_id'] = mix_options[i]['option_id'].toString()
            // 先设置混合选项的默认被选中项的id，
            // 后续逻辑可能会重置checked_id
            mix_options[i]['checked_id'] = default_checked_mix_option_map[mix_options[i]['group_id']]['option_id'].toString()

            default_checked_pos = -1
            if (tcb.inArray(mix_options[i]['option_id'], forceCheckedSet) > -1) {
                default_checked_pos = tcb.inArray(mix_options[i]['checked_id'], mix_checked_comb)
                mix_options[i]['checked_id'] = mix_options[i]['option_id']
                if (default_checked_pos > -1) {
                    mix_checked_comb.splice(default_checked_pos, 1, mix_options[i]['checked_id'])
                }
                mix_options[i]['readonly'] = true
            } else if (tcb.inArray(mix_options[i]['checked_id'].toString(), forceCheckedSet) > -1) {
                default_checked_pos = tcb.inArray(mix_options[i]['option_id'], mix_checked_comb)
                if (default_checked_pos > -1) {
                    mix_checked_comb.splice(default_checked_pos, 1, mix_options[i]['checked_id'])
                }
                mix_options[i]['readonly'] = true
            }
        }

        // 将新的选中状态更新cache，以备评估时使用
        a.cache.doCacheCheckedComb ([mix_checked_comb.join(','), special_checked_comb], false)

        if (mix_options && mix_options.length){
            groups.push (
                a.util.genGroupData ([
                    '其他问题（可多选，如无问题请直接点立即评估）',
                    '',
                    mix_options,
                    '',
                    mix_checked_comb && mix_checked_comb.length ? mix_checked_comb : '',
                    {
                        mix       : true,
                        is_sku    : false,
                        no_active : false
                    }
                ])
            )
        }

        return groups
    }

    // 获取前置专有评估组（当前只有 保修情况评估组）
    function getPreSpecialGroups () {
        var
            checked_comb = a.cache.doGetCheckedComb (false),// 被选中的选项的组合,false表示special属性

            // 可输出选项组集合
            groups = [],
            // 专有选项
            special_checked_comb = checked_comb[ 1 ] || []

        // 获取前置专有评估组的基本信息
        var pre_special_base_info_groups = a.cache.ex (a.KEY_PRE_SPECIAL_OPTIONS_CATE) || [],
            // 获取前置专有评估组选项列表
            pre_special_options_list = a.cache.ex (a.KEY_PRE_SPECIAL_OPTIONS_GROUP_LIST) || []

        if (pre_special_base_info_groups && pre_special_base_info_groups.length) {

            $.each (pre_special_base_info_groups, function (i, base_info_group) {
                var
                    options = pre_special_options_list[ i ],
                    selected_pos = -1
                // 由于专有选项的选中组合顺序，可能不是按照组的顺序排列的，
                // 所以需要遍历所有选项来确定是不是有选项在special_checked_comb中存在
                for (var ii = 0; ii < options.length; ii++) {
                    selected_pos = tcb.inArray (options[ ii ][ 'option_id' ].toString (), special_checked_comb)
                    if (selected_pos > -1) {
                        break
                    }
                }
                groups.push (
                    a.util.genGroupData ([
                        base_info_group[ 'options_cate_name' ],
                        base_info_group[ 'options_cate_id' ],
                        options,
                        selected_pos > -1 ? special_checked_comb[ selected_pos ] : '',
                        [],
                        {
                            mix       : false,
                            is_sku    : false,
                            no_active : false
                        }
                    ])
                )
            })
        }

        return groups
    }

    // 获取用户选择评估项和官方不一致的数据列表（只针对苹果机）
    function getOfficialDiffData(){
        var ret = [
            {
                groupName          : '机型',
                groupKey           : 'model_id',
                optionSelectedName : '',
                optionOfficialName : ''
            },
            {
                groupName          : '容量',
                groupKey           : 'capacity',
                optionSelectedName : '',
                optionOfficialName : ''
            },
            {
                groupName          : '颜色',
                groupKey           : 'color',
                optionSelectedName : '',
                optionOfficialName : ''
            //},
            //{
            //    groupName          : '保修',
            //    groupKey           : '',
            //    optionSelectedName : '',
            //    optionOfficialName : ''
            }
        ]

        var modelId = a.cache.getModelId (),
            officialData = $.parseJSON (window.__OFFICIAL_DATA) || {},
            skuCheckedComb = a.cache.doGetCheckedComb (true) || [],
            modelData = a.cache.getModel (modelId)

        tcb.each (ret, function (i, item) {

            var key = item.groupKey

            if (!officialData[key]) {
                return true
            }

            switch (key) {
                case 'model_id': // 机型
                    officialData[ key ] = tcb.isArray (officialData[ key ]) ? officialData[ key ] : [ officialData[ key ] ]
                    item[ 'optionSelectedName' ] = item[ 'optionOfficialName' ] = modelData[ 'model_name' ]
                    if (tcb.inArray (modelId.toString(), officialData[ key ]) == -1) {
                        item[ 'optionOfficialName' ] = officialData[ 'model_name' ][ officialData[ key ][ 0 ] ]
                    }
                    break
                case 'capacity': // 容量
                    officialData[ key ] = officialData[ key ] && officialData[ key ].toString ()
                    item[ 'optionSelectedName' ] = item[ 'optionOfficialName' ] = __getSkuOptionNameById (skuCheckedComb[ 0 ])
                    if (tcb.inArray (officialData[ key ], skuCheckedComb) == -1) {
                        item[ 'optionOfficialName' ] = officialData[ 'capacity_name' ]
                    }
                    break
                case 'color': // 颜色
                    officialData[ key ] = officialData[ key ] && officialData[ key ].toString ()
                    item[ 'optionSelectedName' ] = item[ 'optionOfficialName' ] = __getSkuOptionNameById (skuCheckedComb[ 1 ])
                    if (tcb.inArray (officialData[ key ], skuCheckedComb) == -1) {
                        item[ 'optionOfficialName' ] = officialData[ 'color_name' ]
                    }
                    break
            }
        })

        return ret.filter(function (item) {
            return item.optionSelectedName && item.optionOfficialName
        })
    }

    // 获取笔记本验机数据，如果有预验机的assess key，那么获取，否则直接执行成功回调
    // params : assessKey
    function getNotebookAutoCheckData(callback) {
        var pre_assess = tcb.queryUrl(window.location.search, 'pre_assess')
        if (pre_assess) {
            var params = {
                assessKey: pre_assess
            }
            $.ajax({
                type: 'GET',
                url: tcb.setUrl2('/m/getNotebookAutoCheckData'),
                data: params,
                dataType: 'json',
                timeout: 5000,
                success: function (res) {
                    if (!res['errno']) {
                        typeof callback === 'function' && callback(res['result'])
                    } else {
                        $.dialog.toast(res['errmsg'])
                    }
                },
                error: function () {
                    typeof callback === 'function' && callback()
                }
            })
        } else {
            typeof callback === 'function' && callback()
        }
    }

    // =================================================================
    // 私有接口 private
    // =================================================================

    // 型号选项获取器(sku和special通用方法)
    function __modelOptionsGetter (options) {
        var
            type = options[ 'type' ],
            params = options[ 'params' ],
            callback = options[ 'callback' ],
            error = options[ 'error' ],
            handle = typeof options[ 'handle' ] === 'function'
                ? options[ 'handle' ]
                : function () {},

            model_id = params[ 'model_id' ],
            paramsData = null,
            url = ''

        if (!model_id) {

            $.dialog.toast ('没有获取到手机型号')

            return
        }

        switch (type) {
            case 'sku':
                var
                    memory_attr_val_id = params[ 'memory_attr_val_id' ] || ''

                paramsData = {
                    model_id : model_id
                }

                url = '/huishou/doGetSkuOptions'

                if (memory_attr_val_id) {
                    // 有默认的内存属性id

                    url = '/huishou/doGetSkuOptionsForApp'
                    paramsData[ 'memory_attr_val_id' ] = memory_attr_val_id
                    window.__IMEI && (paramsData[ 'imei' ] = window.__IMEI)
                }

                params = paramsData
                break
            case 'special':
                var
                    assess_options = params[ 'assess_options' ] || ''

                paramsData = {
                    model_id : model_id
                }

                url = '/huishou/doGetPingguGroup'

                if (assess_options) {
                    // 有已经检测过的评估项

                    url = '/huishou/doGetPingguGroupForApp'
                    paramsData[ 'assess_options' ] = assess_options
                    window.__IMEI && (paramsData[ 'imei' ] = window.__IMEI)
                }

                params = paramsData
                break
        }

        $.ajax ({
            type     : 'GET',
            url      : tcb.setUrl2(url),
            data     : params,
            dataType : 'json',
            timeout  : 5000,
            success  : function (res) {

                if (!res[ 'errno' ]) {

                    // 处理属性数据
                    handle (res[ 'result' ])

                    typeof callback === 'function' && callback ()

                } else {

                    $.dialog.toast (res[ 'errmsg' ])
                }

            },
            error    : function () {
                typeof error === 'function' && error ()
            }
        })

    }

    // 处理型号的sku数据，成为可用的格式
    function __handleModelSkuOptions (sku_data) {
        var sku_attr_map = {}, // sku属性组合到sku的唯一id的映射
            sku_attr_cate = [], // sku属性分类名称
            sku_attr_group_by_cate = [], // 根据每一个sku属性分类，组合sku属性
            sku_attr_group_by_cate_pushed_in = []

        var sku_data_list = sku_data[ 'list' ],
            sku_data_map = sku_data[ 'map' ]

        // 在自动验机的情况下，如果没有匹配的内存，那么mem_match 对应的值为false，干掉检测获取到的内存id
        // 在非检测情况下，mem_match没有定义，即为false，不影响此情况下的逻辑
        if (!sku_data['mem_match']){
            a.cache (a.KEY_OPTIONS_MEM_DETECTED, '')
        }

        // 遍历sku的id和属性组的k-v组合
        $.map (sku_data_list, function (item_group, key) {
            var attr_ids = [];

            // sku id的属性组合
            item_group.forEach (function (item, i, item_group) {
                attr_ids.push (item[ 'attr_valueid' ]);

                // 遍历第一个sku属性组的时候，将属性分类名称获取出来
                if (sku_attr_cate.length < item_group.length) {
                    sku_attr_cate.push ({
                        options_cate_id   : item[ 'attr_id' ],
                        options_cate_name : item[ 'attr_name' ]
                    });
                }

                // sku属性所在的位置项不是数组，那么初始化设置为空数组，以备往里添加数据项
                if (!(sku_attr_group_by_cate[ i ] instanceof Array)) {
                    sku_attr_group_by_cate[ i ] = [];
                }
                // 加到属性组内的属性，不再重复添加
                if (tcb.inArray (item[ 'attr_valueid' ], sku_attr_group_by_cate_pushed_in) == -1) {

                    sku_attr_group_by_cate_pushed_in.push (item[ 'attr_valueid' ]);
                    sku_attr_group_by_cate[ i ].push ({
                        option_id   : item[ 'attr_valueid' ],
                        option_name : item[ 'attr_valuename' ]
                    })
                }

            })

            // sku属性组合到sku的唯一id的映射
            var
                sku_attr_map_key = attr_ids.join (','),
                sku_attr_map_val = key

            sku_attr_map[ sku_attr_map_key ] = sku_attr_map_val

        })

        // 遍历sku分类属性组,进行排序
        $.each (sku_attr_group_by_cate, function (i, group) {
            var
                options_cate_id = sku_attr_cate[ i ][ 'options_cate_id' ] // 分类id
                , attr_sort = sku_data_map[ options_cate_id ] // 属性顺序

            var
                ext_index = 999

            group.sort (function (a, b) {
                var
                    a_index = tcb.inArray (+a[ 'option_id' ], attr_sort),
                    b_index = tcb.inArray (+b[ 'option_id' ], attr_sort)

                a_index = a_index === -1
                    ? ext_index
                    : a_index
                b_index = b_index === -1
                    ? ext_index
                    : b_index

                // 扩展索引每次比较完成之后都+1,这样可以实现不在排序数组中的值,按顺序依次加到最后
                ext_index++

                // 比较当前属性id在排序map中的顺序,map中靠前的提到前边(即相减小于0)(注意点:id需要化为整数,保持和map中的类型一致)
                return a_index - b_index
            })
        })

        a.cache.ex (a.KEY_SKU_ATTR_MAP, sku_attr_map)
        a.cache.ex (a.KEY_SKU_ATTR_CATE, sku_attr_cate)
        a.cache.ex (a.KEY_SKU_ATTR_GROUP_BY_CATE, sku_attr_group_by_cate)
    }

    // 处理型号的专有评估选项，成为可用的格式
    function __handleModelSpecialOptions (group_data) {
        var
            assessed = group_data[ 'assess_options' ] || '', // 已评估选项
            default_selected_options = group_data[ 'default_selected_options' ] || '', // 默认被选中的评估项
            assessGroup = group_data[ 'pinggu_group' ] // 评估组

        default_selected_options = tcb.trim(default_selected_options, ',')

        // 获取到的group_data[ 'pinggu_group' ]为空，
        // 表示普通回收，pinggu_group的列表直接存储在group_data之中，
        // 没有assess_options和default_selected_options，
        // 那么重新将group_data的值赋给assessGroup
        if (!(assessGroup && assessGroup.length)) {
            assessGroup = group_data
        }

        var
            combo_options = [], // 聚合评估选项
            combo_options_default = {}; // 聚合选项中被默认选择的选项

        var
            special_options_cate = [], // 专有评估选项分类名称、id
            special_options_group_list = [], // 专有评估选项组列表
            pre_special_options_cate = [],
            pre_special_options_group_list = []

        $.each (assessGroup, function (i, item) {
            var
                options
            if (item[ 'pinggu_group_juhe' ] == 1) {
                // 聚合选项

                options = item[ 'pinggu_group_options' ]

                if (options && options.length) {

                    options.forEach (function (options_item) {
                        if (options_item[ 'is_default' ] == 1) {
                            // 加入默认被选中的聚合组
                            var group_id = options_item[ 'group_id' ];

                            combo_options_default[ group_id ] = {
                                option_id   : options_item[ 'option_id' ],
                                option_name : options_item[ 'option_name' ]
                            };
                        } else {
                            // 其他没有被选中的聚合组
                            combo_options.push ({
                                group_id    : options_item[ 'group_id' ],
                                option_id   : options_item[ 'option_id' ],
                                option_name : options_item[ 'option_name' ]
                            })
                        }
                    })
                }
            }
            else {
                // 单独选项

                // 专有属性分类名称、id
                special_options_cate.push ({
                    options_cate_id   : item[ 'pinggu_group_id' ],
                    options_cate_name : item[ 'pinggu_group_name' ]
                })

                options = item[ 'pinggu_group_options' ]

                var
                    options_format = []
                if (options && options.length) {

                    options.forEach (function (options_item) {

                        options_format.push ({
                            option_id   : options_item[ 'option_id' ],
                            option_name : options_item[ 'option_name' ]
                        });
                    });
                }
                special_options_group_list.push (options_format)

                // 评估组id存在于前置显示的专有评估组id集合内，
                // 表示当前组是需要前置显示的专有评估组，那么将其加入前置显示的专有评估组cache之中
                if (tcb.inArray (item[ 'pinggu_group_id' ].toString (), a.cache (a.KEY_PRE_SPECIAL_GROUP_IDS) || []) > -1) {
                    pre_special_options_cate.push (special_options_cate[ special_options_cate.length - 1 ])
                    pre_special_options_group_list.push (special_options_group_list[ special_options_group_list.length - 1 ])
                }
            }

        })

        a.cache.ex (a.KEY_MIX_OPTIONS, combo_options)
        a.cache.ex (a.KEY_DEFAULT_CHECKED_MIX_OPTION_MAP, combo_options_default)

        a.cache.ex (a.KEY_SPECIAL_OPTIONS_CATE, special_options_cate)
        a.cache.ex (a.KEY_SPECIAL_OPTIONS_GROUP_LIST, special_options_group_list)

        a.cache.ex (a.KEY_PRE_SPECIAL_OPTIONS_CATE, pre_special_options_cate)
        a.cache.ex (a.KEY_PRE_SPECIAL_OPTIONS_GROUP_LIST, pre_special_options_group_list)

        // 根据app检测结果,过滤后的评估项组合
        a.cache.ex (a.KEY_FILTERED_DETECTED_OPTION_COMB, assessed)
        // 默认选中的专有评估项组合(不包括聚合选项)
        a.cache.ex (a.KEY_DEFAULT_CHECKED_SPECIAL_OPTION_ID_COMB, default_selected_options)

    }

    // 根据已选的sku属性项组合,往sku组集合中添加第一个sku组
    function __getFirstSkuGroup (checked_comb, options) {
        var
            no_active = options[ 'no_active' ] || false, // 是否激活

            // sku属性项集合列表
            sku_options_list = a.cache.ex (a.KEY_SKU_ATTR_GROUP_BY_CATE),
            // sku属性基本信息组列表
            sku_base_info_groups = a.cache.ex (a.KEY_SKU_ATTR_CATE),

            // 可输出的sku属性组集合
            sku_groups = []

        // 预评估的评估项sku id集合（只有sku）
        var preAssessSkuOptionIdComb = a.cache.ex(a.KEY_PRE_ASSESS_SKU_OPTION_ID_COMB) || []

        var
            sku_base_info_group = sku_base_info_groups[ 0 ]
        // 首先将第一组sku属性加到输出属性组中(第一组sku属性总是全量显示,并且必有)
        sku_groups.push (
            a.util.genGroupData ([
                sku_base_info_group[ 'options_cate_name' ],
                sku_base_info_group[ 'options_cate_id' ],
                sku_options_list[ 0 ],
                '',
                [],
                {
                    mix       : false,
                    is_sku    : true,
                    no_active : no_active
                }
            ])
        )
        //pos         : 0

        // 第一个选项组只有一个选项,那么!默认把它选中!!选中!!选中!!
        if (sku_options_list[ 0 ].length === 1) {

            checked_comb.splice (0, 1, sku_options_list[ 0 ][ 0 ][ 'option_id' ])
        }

        if (checked_comb[ 0 ]) {
            // 选中的sku属性项id第一项不为空,设置被选中的选项

            sku_groups[ 0 ][ 'selected' ] = checked_comb[ 0 ]
        }

        if (preAssessSkuOptionIdComb.indexOf(sku_groups[0]['selected']) > -1){
            sku_groups[0]['readonly'] = true
            sku_groups[0]['collapse'] = true
        }

        return sku_groups
    }

    // 根据已选的sku属性项组合,往sku组集合中添加更多的sku组(第一组之后的组)
    // 同时在最后做一些特定处理...
    function __addMoreSkuGroupsByCheckedComb (checked_comb, sku_groups, options) {
        // 已选中sku属性项组合
        checked_comb = checked_comb || []
        // sku属性组列表
        sku_groups = sku_groups || []

        var delimiter_id = (options[ 'delimiter_id' ] || '').toString (), // 起始id
            no_active = options[ 'no_active' ] || false // 是否激活

        // sku属性项集合列表
        var sku_options_list = a.cache.ex (a.KEY_SKU_ATTR_GROUP_BY_CATE),
            // sku属性项集合的数量
            sku_options_list_count = sku_options_list.length,
            // 用来过滤的id组合(即:被选中的sku属性id)
            filtered_id_comb = [],
            // 获取sku属性项id组合列表
            sku_option_id_comb_list = __getSkuOptionIdCombList (),
            // sku属性基本信息组列表
            sku_base_info_groups = a.cache.ex (a.KEY_SKU_ATTR_CATE)

        // 预评估的评估项sku id集合（只有sku）
        var preAssessSkuOptionIdComb = a.cache.ex(a.KEY_PRE_ASSESS_SKU_OPTION_ID_COMB) || []

        // 遍历选中的sku属性项id组合
        // ( 这个过程可能会直接修改到checked_comb对象本身 )
        $.each (checked_comb, function (i, checked_id) {

            // 遍历到sku属性组最后一个,那么没有下一个属性组,直接返回退出
            if (i == sku_options_list_count - 1) {
                return false
            }

            filtered_id_comb.push (checked_id)

            var
                next_sku_option_ids = [] // 下一个可用sku属性id集合
            // 遍历sku属性id组合列表, 获取下一个sku可用属性id
            $.each (sku_option_id_comb_list, function (i, id_comb) {
                var
                    filtered_id_comb_str = filtered_id_comb.join (',') + ',';

                if (id_comb.indexOf (filtered_id_comb_str) === 0) {
                    // id_comb 起始位置开始,能匹配到 filtered_id_comb_str

                    var id_str_tmp = id_comb.substring (filtered_id_comb_str.length)

                    id_str_tmp = id_str_tmp.split (',')[ 0 ]

                    // 下一个 sku 属性 id 内不包含此 id ,那么将此id加入其中
                    if (tcb.inArray (id_str_tmp, next_sku_option_ids) == -1) {

                        next_sku_option_ids.push (id_str_tmp)
                    }
                }
            })

            var
                next_sku_options_pos = i + 1, // 下一个sku属性集合位置
                // 过滤sku属性集合,过滤出可用的属性集合
                next_sku_options = sku_options_list[ next_sku_options_pos ].filter (function (option) {

                    return tcb.inArray (option[ 'option_id' ], next_sku_option_ids) > -1
                })

            // 下一个sku属性项集合有且只有一个选项,那么!默认把它选中!!选中!!选中!!
            if (next_sku_option_ids.length === 1 && next_sku_options.length === 1) {

                checked_comb.splice (next_sku_options_pos, 1, next_sku_option_ids[ 0 ])
            }

            var sku_base_info_group = sku_base_info_groups[ next_sku_options_pos ]

            var readonly = false
            var collapse = false
            if (preAssessSkuOptionIdComb.indexOf(checked_comb[ next_sku_options_pos ]) > -1){
                readonly = true
                collapse = true
            }
            sku_groups.push (
                a.util.genGroupData ([
                    sku_base_info_group[ 'options_cate_name' ],
                    sku_base_info_group[ 'options_cate_id' ],
                    next_sku_options,
                    checked_comb[ next_sku_options_pos ],
                    [],
                    {
                        mix: false,
                        is_sku: true,
                        no_active: no_active,
                        readonly: readonly,
                        collapse: collapse
                    }
                ])
            )

        })

        // 当sku_groups数量比默认的要少，那么补全
        $.each(sku_base_info_groups, function (i, sku_base_info_group) {
            if (sku_groups.length - 1 < i) {
                sku_groups.push(
                    a.util.genGroupData([
                        sku_base_info_group['options_cate_name'],
                        sku_base_info_group['options_cate_id'],
                        [],
                        '',
                        [],
                        {
                            mix: false,
                            is_sku: true,
                            no_active: no_active
                        }
                    ])
                )
            }
        })

        // 干掉 delimiter_id 选项,包括其之前的项
        var delimiter_id_index = tcb.inArray (delimiter_id, checked_comb),
            max_index = Math.max (delimiter_id_index, -1)
        if (max_index > -1) {

            sku_groups.splice (0, max_index + 1)
        } else {
            // max_pos为-1,则将其重置为0,以备下边设置pos编号使用
            max_index = 0
        }

        // 有默认的内存检测项，并且非第一个显示元素（即delimiter_id有值），
        // 那么需要预先将max_index加1，避免在普通评估下第二个开始的sku评估项序号错乱
        if (delimiter_id && !a.cache (a.KEY_OPTIONS_MEM_DETECTED)) {
            max_index++
        }

        // sku起始序号
        var pos = a.cache (a.KEY_SKU_START_INDEX_IN_VIEW)

        // 设置sku组显示序号
        for (var i = 0; i < sku_groups.length; i++) {
            sku_groups[ i ][ 'pos' ] = pos + max_index

            pos++
        }

        return sku_groups
    }

    // 合并两个sku选中的集合组
    function __mergeSkuCheckedComb(checkedCombTarget, checkedCombSource) {
        checkedCombTarget = checkedCombTarget || []
        checkedCombSource = checkedCombSource || []
        var ret = []
        // sku属性项集合列表
        var sku_options_list = a.cache.ex(a.KEY_SKU_ATTR_GROUP_BY_CATE) || []
        var isBreak = false
        tcb.each(sku_options_list, function (i, skuGroup) {
            if (isBreak) {
                return false
            }
            tcb.each(skuGroup || [], function (ii, sku) {
                if (checkedCombSource.indexOf(sku.option_id) > -1) {
                    ret.push(sku.option_id)
                    return false
                } else if (checkedCombTarget.indexOf(sku.option_id) > -1) {
                    ret.push(sku.option_id)
                    return false
                }
            })
            if (ret.length !== i + 1) {
                isBreak = true
            }
        })
        return ret
    }

    // 获取sku属性id组合列表
    function __getSkuOptionIdCombList () {
        var
            sku_option_id_comb_map = a.cache.ex (a.KEY_SKU_ATTR_MAP),
            sku_option_id_comb_list = [] // 存在的sku属性组合

        // 遍历sku属性和id的k-v映射表,
        // 获取sku属性组合列表
        $.each (sku_option_id_comb_map, function (k, v) {

            sku_option_id_comb_list.push (k)
        })

        return sku_option_id_comb_list
    }

    // 执行评估过程
    //sub_options:90,94,106,10,16,20,30,34,48,52,56,84,6,62,78,38
    //sku_group_id:121
    //model_id:8
    // ***** 去掉从cache中获取评估结果的功能，
    //       防止在苹果手机中向右滑动回退的时候，
    //       assess_key被用过了，从而导致assess_key失效的问题 *****
    function __assess (data, before, after, error) {
        before ()

        // var
        //     string_data = $.param (data),
        //     assessedData = a.cache.doGetAssessed (string_data)

        // if (assessedData) {
        //     after (assessedData)
        // } else {
            //var
            //    url_map = [
            //        '/huishou/doPinggu',
            //        '/huishou/doPingguForApp'
            //    ],
            //    url = a.util.is_detect () ? url_map[ 1 ] : url_map[ 0 ]
            var url = window.__TPL_TYPE_DATA['assess_url']

            $.ajax ({
                type     : 'POST',
                url      : tcb.setUrl2(url),
                data     : data,
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {
                    // // cache选中数据
                    // a.cache.doCacheAssessed (string_data, res)

                    after (res)
                },
                error    : function () {

                    error ()
                }
            })
        // }

    }

    // 根据sku的option_id获取对应的option_name
    function __getSkuOptionNameById (option_id) {
        var optionName = '',
            skuOptionGroupList = a.cache.ex (a.KEY_SKU_ATTR_GROUP_BY_CATE)

        tcb.each (skuOptionGroupList, function (i, optionList) {
            tcb.each (optionList, function (ii, theOption) {
                if (theOption[ 'option_id' ] == option_id) {
                    optionName = theOption[ 'option_name' ]
                }
            })
        })

        return optionName
    }

} (this)


;/**import from `/resource/js/mobile/huishou/assess/page.js` **/
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


;/**import from `/resource/js/mobile/huishou/assess/render.js` **/
// html输出方法
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    var
        pageRenderMap = {
            // 页面输出

            // 评估页---基本信息
            assessBasic   : renderAssessBasic,
            // 评估页---选择评估项和官方信息不一致的页面
            officialDiff  : renderOfficialDiff,
            // 评估页---专项评估页
            assessSpecial : renderAssessSpecial,

            // sku评估组
            assessSkuGroups : renderAssessSkuGroups,
            // 前置显示的专项评估组
            assessPreSpecialGroups : renderAssessPreSpecialGroups,
            // 专项评估组
            assessSpecialGroups : renderAssessSpecialGroups,


            // 页内组件输出

            // 输出评估选项组内部html
            assessOptionGroupInner : renderAssessOptionGroupInner,
            // 输出评估选项组列表html
            assessOptionGroupList  : renderAssessOptionGroupList
        }

    a.render = function (render_key) {
        var
            render_fn = a.noop
        if (render_key) {
            render_fn = typeof pageRenderMap[ render_key ] === 'function'
                ? pageRenderMap[ render_key ]
                : render_fn
        }
        return render_fn
    }

    tcb.mix (a.render, {})

    // =================================================================
    // 公共接口 public
    // =================================================================

    //************* 页面输出 ********************

    // 基本信息评估页
    function renderAssessBasic (id, data, event) {
        var $Target = a.getContainer (),
            $The = id ? $ ('#' + id) : null

        $The = __htmlRender ({
            id            : id || '',
            data          : data || {},
            $T            : $ ('#JsMInnerPageAssessBasicTpl'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : false
        })

        // 输出预评估的sku信息（如果存在的话）
        __renderPreAssessSkuInfo($The)

        // 输出屏幕检测信息
        __renderAssessScreenDetected ($The)
        // 输出评估基本信息
        __renderAssessBasicInfo ($The)
        // 输出前置的专有评估组结构
        __renderAssessPreSpecialInfoSkeleton ($The)
        // 输出专有评估组结构
        __renderAssessSpecialInfoSkeleton ($The)
        //// 输出评估按钮
        //__renderAssessBtnBlock ($The)

        var $BlockBtn = $ ('.' + a.CLASS_NAME.block_btn)
        //if (a.util.is_detect ()) {
        //    $BlockBtn.find ('.btn-do-assess').html ('立即评估')
        //} else {
        //    $BlockBtn.find ('.btn-do-assess').html ('下一步')
        //}
        $BlockBtn.find ('.btn-do-assess').html (window.__TPL_TYPE_DATA['assess_btn_text_step1'])
        $BlockBtn.show ()

        // 绑定事件
        typeof event === 'function' && event ($The)

        return $The
    }

    // 选择评估项和官方信息不一致的页面
    function renderOfficialDiff (id, data, event) {
        var
            $Target = a.getContainer (),
            $The = id ? $ ('#' + id) : null

        $The = __htmlRender ({
            id            : id || '',
            data          : data || {},
            $T            : $ ('#JsMInnerPageOfficialDiffTpl'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : false
        })

        a.$Btn.show()
            .find ('.btn-do-assess').html (window.__TPL_TYPE_DATA['assess_btn_text_step1'])

        // 绑定事件
        typeof event === 'function' && event ($The)

        return $The
    }

    // 专项评估页
    function renderAssessSpecial (id, data, event) {
        var
            $Target = a.getContainer (),
            $The = id ? $ ('#' + id) : null

        $The = __htmlRender ({
            id            : id || '',
            data          : {},
            $T            : $ ('#JsMInnerPageAssessSpecialTpl'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : false
        })

        // 输出评估基本信息
        __renderAssessSpecialInfo ($The, data, false, true)

        //// 输出评估按钮
        //__renderAssessBtnBlock ($The)

        var
            $BlockBtn = $ ('.' + a.CLASS_NAME.block_btn)
        //$BlockBtn.find ('.btn-do-assess').html ('立即评估')
        $BlockBtn.find ('.btn-do-assess').html (window.__TPL_TYPE_DATA['assess_btn_text_step2'])
        $BlockBtn.show ()

        // 绑定事件
        typeof event === 'function' && event ($The)

        return $The
    }


    //************* 页内组件输出 ********************

    // 输出sku评估组
    function renderAssessSkuGroups(pos, isClean) {
        var mem_id = a.cache(a.KEY_OPTIONS_MEM_DETECTED)
        var sku_groups = a.getSkuGroups({
                no_active: false,
                delimiter_id: mem_id
            }),
            $Target = $('.' + a.CLASS_NAME.block_model_basic_info + ' .block-inner')

        if (isClean) {
            // 只有isClean为true才清除$Target的内容
            $Target.removeClass('b-bottom').html('')
        }

        if (sku_groups && sku_groups.length) {
            // 输出评估组列表
            var $Groups = a.render('assessOptionGroupList')($Target, {
                groupList: sku_groups,
                pos: pos || 1
            }, false, true)

            $Groups.addClass('b-top')
        }
    }

    // 输出前置显示的专项评估组列表（当前只有 保修情况组）
    function renderAssessPreSpecialGroups () {
        // 前置展示的专有评估项组
        var pre_special_groups = a.getPreSpecialGroups (),
            $Target = $ ('.' + a.CLASS_NAME.block_model_pre_special_info + ' .block-inner')

        // 输出前置展示的专有评估项组之前，
        // 需要先清除之前节点内的html，避免重复添加，或者没有前置评估项组时显示的异常
        $Target.removeClass('b-bottom').html('')

        if (pre_special_groups && pre_special_groups.length) {
            var pos = $ ('.' + a.CLASS_NAME.block_model_basic_info + ' .block-option-group').last ().attr ('data-pos') - 0 + 1

            var $Groups = a.render ('assessOptionGroupList') ($Target, {
                groupList       : pre_special_groups,
                pos             : pos,
                optionDescIds : a.util.getOptionDescIds (),
                optionDescAll : a.util.getOptionDescAll ()
            }, false, true)

            $Groups.addClass ('b-top')
        }

    }

    // 输出专项评估组的组列表信息
    function renderAssessSpecialGroups(){
        var special_groups = a.getSpecialGroups (),
            $Target = $('.' + a.CLASS_NAME.block_model_special_info + ' .block-inner')

        $Target.removeClass('b-v-both').html('')

        if (special_groups && special_groups.length) {
            // 输出评估组列表
            var $Groups = a.render ('assessOptionGroupList') ($Target, {
                groupList : special_groups,
                pos : (+$ ('.block-option-group').last ().attr ('data-pos') + 1) || 1
            }, false, true)

            $Groups.addClass ('b-top')
        }
    }

    // 输出评估选项组内部html
    function renderAssessOptionGroupInner ($Target, data, flag_not_show, flag_fade_in) {
        if (!($Target && $Target.length)) {

            return
        }

        data = tcb.mix({}, data || {})
        data['no_outer'] = true

        var
            pos = data[ 'pos' ] || 1,
            groupList = [ data ]

        return __htmlRender ({
            data    : {
                groupList       : groupList,
                pos             : pos,
                optionDescIds : a.util.getOptionDescIds (),
                optionDescAll : a.util.getOptionDescAll ()
            },
            $T      : $ ('#JsMAssessOptionGroupTpl'),
            $Target : $Target,
            $The    : null,

            flag_clean    : true,
            flag_fade_in  : flag_fade_in,
            flag_not_show : flag_not_show
        })
    }

    // 输出评估选项组列表html
    function renderAssessOptionGroupList ($Target, data, flag_not_show, flag_fade_in) {
        if (!($Target && $Target.length)) {

            return
        }

        data = data || {}

        return __htmlRender ({
            data          : {
                groupList       : data[ 'groupList' ] || [],
                pos             : data[ 'pos' ],
                optionDescIds : a.util.getOptionDescIds (),
                optionDescAll : a.util.getOptionDescAll ()
            },
            $T            : $ ('#JsMAssessOptionGroupTpl'),
            $Target       : $Target,
            $The          : null,
            flag_clean    : false,
            flag_fade_in  : flag_fade_in,
            flag_not_show : flag_not_show
        })
    }

    // =================================================================
    // 私有接口 private
    // =================================================================


    // 输出html
    function __htmlRender (options) {
        options = options || {}

        var
            id = options[ 'id' ] || '', // 页面id
            data = options[ 'data' ], // 模板数据
            $T = options[ '$T' ], // 模板对象
            $Target = options[ '$Target' ], // 输出目标元素
            $The = options[ '$The' ],// 指定要干掉的元素
            flag_clean = options[ 'flag_clean' ] || false,// 输出前,先清除$Target的内容
            flag_fade_in = options[ 'flag_fade_in' ] || false,// 渐变显示,flag_not_show为false的时候,此参数忽略
            flag_not_show = options[ 'flag_not_show' ] || false // 不显示

        if (!($Target && $Target.length)) {
            return
        }

        if ($The && $The.length) {
            $The.remove ()
        }

        var
            html_fn = $.tmpl ($.trim ($T.html ())),
            html_st = html_fn ({
                id   : id,
                data : data
            })

        $The = $ (html_st)
        // 干掉那些非元素节点（如：文本节点）
        $The = $The.filter (function () {
            return this.nodeType == 1
        })

        // 先清除$Target的内容
        if (flag_clean) {
            $Target.html ('')
        }

        $Target.append ($The)

        if (flag_not_show) {
            // 隐藏输出

            $The.hide ()
        } else {
            if (flag_fade_in) {
                // 以fadein的方式显示出来

                $The
                    .css ({
                        'opacity' : 0
                    })
                    .animate ({ 'opacity' : 1 }, 200)
            }
        }

        return $The
    }



    // 输出屏幕检测信息
    function __renderAssessScreenDetected ($Page, flag_not_show) {
        var
            screenDetected = a.cache (a.KEY_OPTIONS_SCREEN_DETECTED)

        if (!(screenDetected && screenDetected.length)) {
            return
        }
        var
            $Target = $Page.find ('.block-assess-info'),
            $The = $Target.find ('.block-screen-function')

        __htmlRender ({
            data          : {
                screenDetected : screenDetected,
                pos            : 1
            },
            $T            : $ ('#JsMAssessScreenFunction'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : flag_not_show
        })
    }

    // 输出评估基本信息
    function __renderAssessBasicInfo ($Page, flag_not_show) {
        var
            basicInfo = [],// 基本评估信息
            models = a.cache (a.KEY_MODELS)

        // 机型数量大于1,将机型列表也加入评估选择项
        if (models.length > 1) {
            var
                options_model = []
            $.each (models, function (i, item) {
                options_model.push ({
                    option_id   : item[ 'model_id' ],
                    option_name : item[ 'model_name' ],
                    aver_price  : item[ 'aver_price' ]
                })
            })
            basicInfo.push (a.util.genGroupData ([
                '具体型号',
                '',
                options_model,
                '',
                [],
                {
                    is_sku    : false,
                    no_active : false
                }
            ]))
        }

        // sku属性基本信息组列表
        var
            sku_base_info_groups = a.cache.ex (a.KEY_SKU_ATTR_CATE) || [],
            mem_id = a.cache (a.KEY_OPTIONS_MEM_DETECTED) || ''
        $.each (sku_base_info_groups, function (i, cate) {
            // 第一项是容量，
            // 如果还有屏幕检测信息，表示通过app检测出了容量，那么不将其显示出来
            if (!(i === 0 && mem_id)) {
                basicInfo.push (
                    a.util.genGroupData ([
                        cate[ 'options_cate_name' ],
                        cate[ 'options_cate_id' ],
                        [],
                        '',
                        [],
                        {
                            is_sku    : true,
                            no_active : true
                        }
                    ])
                )
            }
        })
        // 没有获取到 sku属性基本信息组列表 ，表示当前还没有确定的机器型号，
        // 那么添加默认的sku显示属性
        if (!(sku_base_info_groups && sku_base_info_groups.length)) {
            if (!mem_id) {
                basicInfo.push(
                    a.util.genGroupData([
                        '容量',
                        '2',
                        [],
                        '',
                        [],
                        {
                            is_sku: true,
                            no_active: true
                        }
                    ])
                )
            }
            basicInfo.push (
                a.util.genGroupData ([
                    '颜色',
                    '4',
                    [],
                    '',
                    [],
                    {
                        is_sku    : true,
                        no_active : true
                    }
                ]),
                a.util.genGroupData ([
                    '渠道',
                    '6',
                    [],
                    '',
                    [],
                    {
                        is_sku    : true,
                        no_active : true
                    }
                ])
            )
        }

        var
            $Target = $Page.find ('.block-assess-info'),
            $The = $Target.find ('.' + a.CLASS_NAME.block_model_basic_info),
            screenDetected = a.cache (a.KEY_OPTIONS_SCREEN_DETECTED) || []

        __htmlRender ({
            data          : {
                basicInfo       : basicInfo,
                pos             : 1 + screenDetected.length,
                optionDescIds : a.util.getOptionDescIds (),
                optionDescAll : a.util.getOptionDescAll ()
            },
            $T            : $ ('#JsMAssessBasicInfo'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : flag_not_show
        })
    }

    // 输出评估按钮
    function __renderAssessBtnBlock ($Page, flag_not_show) {

        var
            $Target = $Page.find ('.block-assess-info'),
            $The = $Target.find ('.block-btn')

        __htmlRender ({
            data          : {},
            $T            : $ ('#JsMAssessBtnBlock'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : flag_not_show
        })
    }

    // 输出前置的专有评估组结构（根据选择的具体机型，最终可能会有内容，也可能会没有）
    function __renderAssessPreSpecialInfoSkeleton ($Page, flag_not_show) {
        var
            $Target = $Page.find ('.block-assess-info'),
            $The = $Target.find ('.' + a.CLASS_NAME.block_model_pre_special_info)

        $The = __htmlRender ({
            data          : {},
            $T            : $ ('#JsMAssessPreSpecialInfoTpl'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : flag_not_show
        })

        a.event.assessSpecial($The)
    }

    function __renderAssessSpecialInfoSkeleton ($Page, flag_not_show){
        var
            $Target = $Page.find ('.block-assess-info'),
            $The = $Target.find ('.' + a.CLASS_NAME.block_model_special_info)

        $The = __htmlRender ({
            data          : {},
            $T            : $ ('#JsMAssessSpecialInfoTpl'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : flag_not_show
        })

        a.event.assessSpecial($The)
    }

    // 输出专有评估组列表
    function __renderAssessSpecialInfo ($Page, data, flag_not_show, flag_fade_in) {
        var
            $Target = $Page.find ('.block-assess-info'),
            $The = $Target.find ('.' + a.CLASS_NAME.block_model_special_info)

        __htmlRender ({
            data          : {},
            $T            : $ ('#JsMAssessSpecialInfoTpl'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : flag_not_show
        })

        $Target = $Target.find ('.' + a.CLASS_NAME.block_model_special_info + ' .block-inner')

        // 输出评估组列表
        a.render ('assessOptionGroupList') ($Target, data, flag_not_show, flag_fade_in)
    }

    // 输出预评估的sku信息（如果存在的话）
    function __renderPreAssessSkuInfo($Page) {
        var skuList = a.cache.ex(a.KEY_PRE_ASSESS_SKU_LIST)
        if (!(skuList && skuList.length)) {
            return
        }
        var skuListHtml = []
        tcb.each(skuList, function (k, val) {
            skuListHtml.push('<div>' + val.group_name + '：' + val.group_value + '</div>')
        })
        skuListHtml = '<div class="pre-assess-sku-list">' + skuListHtml.join('') + '</div>'
        a.$Model.find('.row-assess-model-info').after(skuListHtml)

        a.modelHeight = a.$Model.height() - a.$Model.find('.block-process-status-bar').height()
        $Page.css({
            paddingTop: a.modelHeight
        })
    }

} (this)


;/**import from `/resource/js/mobile/huishou/assess/interact.js` **/
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


;/**import from `/resource/js/mobile/huishou/assess/event.js` **/
// 绑定事件
!function (global) {
    var Root = tcb.getRoot(),
        a = Root.Assess

    var pageEventMap = {
        assessBasic: __eventOnInnerPageAssessBasic,
        assessSpecial: __eventOnInnerPageAssessSpecial
    }

    a.event = function (event_key) {
        var
            event_fn = a.noop
        if (event_key) {
            event_fn = typeof pageEventMap[event_key] === 'function'
                ? pageEventMap[event_key]
                : event_fn
        }
        return event_fn
    }

    tcb.mix(a.event, {
        assessBasic: __eventOnInnerPageAssessBasic,
        assessSpecial: __eventOnInnerPageAssessSpecial,

        init: initEvent

    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    function initEvent() {
        var $Target = a.getDoc()

        tcb.bindEvent($Target[0], {
            /**
             * 评估
             * @param e
             */
            '.btn-do-assess': function (e) {
                e.preventDefault()

                var $me = $(this)
                if ($me.hasClass('btn-disabled')) {
                    return
                }

                var query = tcb.queryUrl(window.location.search)
                var global_data = JSON.parse(tcb.html_decode(decodeURIComponent(query._global_data || '{}')))
                /**
                 * 活动--社群拼团
                 */
                if (query.from_page === 'pintuan') {
                    // console.log(global_data)
                    doGenerateAssessKeyForPintuan(global_data)
                    return
                }
                /**
                 * 美承以旧换新跳转逻辑：add by ljf@190820
                 * 判断query带shop_id就跳转到美承填写用户信息页
                 * @param shop_id
                 */
                if (global_data && global_data.shop_id) {
                    doGenerateAssessKeyForOld2New(global_data.shop_id, global_data.shopType)
                    return
                }

                var pure_hash = tcb.getPureHash(window.location.hash)

                switch (pure_hash) {
                    case '!/assess_quick':
                        // 专项评估页
                        __doAssessOnAssessQuick()
                        break
                    case '!/official_diff':
                        //__doAssessOnOfficialDiff()

                        __doAssessOnOnePage('!/official_diff') // 基础评估和专项评估在同一单页
                        break
                    default :
                        //// 基础评估页
                        //__doAssessOnAssessBasic()

                        __doAssessOnOnePage() // 基础评估和专项评估在同一单页
                        break
                }
            }
        })

        // 横竖屏切换
        // 暂时简单处理下吧。。
        a.$Win.on('orientationchange', function (e) {

            setTimeout(function () {
                var
                    b_height = a.$Btn.height(),
                    $Page = a.page.get()

                $Page.css({
                    'padding-bottom': b_height
                })

                // 重置页面高度
                a.resizeScrollInnerHeight()

            }, 1000)
        })
    }


    // =================================================================
    // 私有接口 private
    // =================================================================

    function __eventOnInnerPageAssessBasic($Target) {
        if (!($Target && $Target.length)) {
            return
        }
        if (!$Target.hasClass('.' + a.CLASS_NAME.block_model_basic_info)) {
            $Target = $Target.find('.' + a.CLASS_NAME.block_model_basic_info)
        }

        tcb.bindEvent($Target, {

            /**
             * 修改评估项
             * @param e
             */
            '.block-option-group .btn-action': function (e) {
                e.preventDefault()

                var
                    $me = $(this),
                    $TheGroup = $me.closest('.' + a.CLASS_NAME.block_option_group),
                    action = $me.attr('data-action'),
                    key = $me.attr('data-key')

                if (action === 'modify') {
                    a.eventHandle.__modifyOption($TheGroup, function () {

                        a.resizeScrollInnerHeight($TheGroup)
                    })
                }
            },

            /**
             * 选择评估项
             * @param e
             */
            '.block-option-group .option-item': function (e) {
                e.preventDefault()

                var
                    $Target = $(e.target),
                    $TheOption = $(this)

                // 防止点击过快
                if (a.util.is_lock('clicking_option')) {

                    return
                }
                // 加锁定状态
                a.util.lock('clicking_option')

                // 点击查看图文说明
                if ($Target.hasClass('icon-circle-solid-q')||$Target.hasClass('desc-thumb')) {

                    // 显示选项描述详情
                    __showOptionDesc($TheOption.attr('data-id'), $TheOption.attr('data-name'))

                    a.util.unlock('clicking_option')
                    return
                }

                // 是否选择机型
                var
                    is_model = $TheOption.attr('data-aver-price')
                        ? true
                        : false,
                    options = {
                        animate: true,
                        // 选中相关操作执行前,预处理回调函数
                        before: a.eventHandle.__doSelectOptionBefore,
                        // 选中之后的回调函数
                        after: a.eventHandle.__doSelectOptionAfter,
                        complete: function ($TheOption, $TheGroup) {
                            // 选中完成解锁
                            a.util.unlock('clicking_option')

                            // 设置评估进度
                            //a.doSetAssessProcess ()
                            a.doSetAssessProcess(true)
                        },
                        // 选中后回调执行延迟时间
                        delay: 210,
                        collapse: true,
                        collapse_duration: 200,
                        collapse_delay: 300,
                        scroll: true,
                        scroll_duration: 250,
                        scroll_delay: 100
                    }
                if (is_model) {
                    // 选择具体机器型号

                    options.before = a.eventHandle.__doSelectModelBefore
                    options.after = a.eventHandle.__doSelectModelAfter
                }

                // 选中评估选项, 并且进行下一项评估
                a.eventHandle.__doSelectOption($TheOption, options)

            }

        })

    }

    function __eventOnInnerPageAssessSpecial($Target) {
        if (!($Target && $Target.length)) {
            return
        }

        tcb.bindEvent($Target, {
            /**
             * 修改评估项
             * @param e
             */
            '.block-option-group .btn-action': function (e) {
                e.preventDefault()

                var
                    $me = $(this),
                    $TheGroup = $me.closest('.' + a.CLASS_NAME.block_option_group),
                    action = $me.attr('data-action'),
                    key = $me.attr('data-key')

                if (action === 'modify') {
                    a.eventHandle.__modifyOption($TheGroup, function () {
                        a.resizeScrollInnerHeight($TheGroup)
                    })
                }
            },

            /**
             * 选择评估项
             * @param e
             */
            '.block-option-group .option-item': function (e) {
                e.preventDefault()

                var
                    $Target = $(e.target),
                    $TheOption = $(this),
                    optionId = $Target.attr('data-id')

                // readonly不可点
                if ($Target.hasClass('option-item-readonly')) {
                    return
                }
                //
                if (['88', '12'].indexOf(optionId) !== -1) {
                    return
                }

                // 防止点击过快
                if (a.util.is_lock('clicking_option')) {
                    return
                }
                // 加锁定状态
                a.util.lock('clicking_option')

                // 点击查看图文说明
                if ($Target.hasClass('icon-circle-solid-q')||$Target.hasClass('desc-thumb')) {

                    // 显示选项描述详情
                    __showOptionDesc($TheOption.attr('data-id'), $TheOption.attr('data-name'))

                    a.util.unlock('clicking_option')
                    return
                }

                if ($TheOption.closest('.block-option-group-readonly').length) {
                    a.util.unlock('clicking_option')
                    return
                }

                // 是否选择机型
                var
                    is_mix = a.util.is_mix($TheOption),
                    options = {
                        animate: true,
                        // 选中相关操作执行前,预处理回调函数
                        before: a.eventHandle.__doSelectOptionBefore,
                        // 选中之后的回调函数
                        after: a.eventHandle.__doSelectOptionAfter,
                        complete: function ($TheOption, $TheGroup) {
                            // 选中完成解锁
                            a.util.unlock('clicking_option')
                            // 设置评估进度
                            a.doSetAssessProcess(true)

                            //var
                            //    where_am_i_except = ['partner_detect'],
                            //    where_am_i = tcb.queryUrl(window.location.search, 'whereami')
                            //
                            //if (window.__TPL_TYPE == 'detect') {
                            //    // app检测模板内执行即时评估
                            //
                            //    // 并且whereami的值不在 where_am_i_except 中
                            //    if (tcb.inArray (where_am_i, where_am_i_except) == -1) {
                            //
                            //        // 评估
                            //        __doAssess ()
                            //    }
                            //}

                        },
                        // 选中后回调执行延迟时间
                        delay: 210,

                        collapse: is_mix ? false : true,
                        collapse_duration: 200,
                        collapse_delay: 300,

                        scroll: true,
                        scroll_duration: 250,
                        scroll_delay: 100
                    }

                // 选中评估选项, 并且进行下一项评估
                a.eventHandle.__doSelectOption($TheOption, options)
            }

        })
    }

    // 执行评估
    function __doAssess(complete) {
        a.doAssess({
            error: function () {
                typeof complete === 'function' && complete()
            },
            fail: function () {
                typeof complete === 'function' && complete()
            },
            after: function (res) {
                if (res['errno']) {
                    $.dialog.toast(res['errmsg'], 2000)

                    a.$Btn.find('.' + a.CLASS_NAME.row_assess_price).html('').hide()
                } else {

                    //var
                    //    where_am_i_except = ['partner_detect'],
                    //    where_am_i = tcb.queryUrl(window.location.search, 'whereami')
                    //
                    //if (window.__TPL_TYPE == 'detect') {
                    //    // app检测模板内
                    //
                    //    // 并且whereami的值不在 where_am_i_except 中
                    //    if (tcb.inArray (where_am_i, where_am_i_except) == -1) {
                    //
                    //        // 有评估价格那么直接显示
                    //        if (res[ 'result' ] && res[ 'result' ][ 'pinggu_price' ] && res[ 'result' ][ 'pinggu_price' ] !== 'undefined') {
                    //            var
                    //                price = '评估价格：0元'
                    //            if (!res[ 'errno' ]) {
                    //                price = '评估价格：' + res[ 'result' ][ 'pinggu_price' ] + '元'
                    //            }
                    //            a.$Btn.find ('.' + a.CLASS_NAME.row_assess_price).html (price).show ()
                    //        } else {
                    //
                    //            a.$Btn.find ('.' + a.CLASS_NAME.row_assess_price).html ('').hide()
                    //        }
                    //
                    //    }
                    //}

                }
                typeof complete === 'function' && complete(res)
            }
        })
    }

    // 显示选项描述
    function __showOptionDesc(option_id, option_name) {
        var
            desc = a.util.getOptionDesc(option_id)

        if (!desc) {
            return
        }

        var
            html_fn = $.tmpl($.trim($('#JsMAssessOptionDescTpl').html())),
            html_st = html_fn({
                data: {
                    desc: desc,
                    option_name: option_name
                }
            })

        var
            dialogObj = tcb.showDialog(html_st, {
                className: 'assess-option-desc-wrap',
                middle: true
            })

        dialogObj.wrap.find('.dialog-close').addClass('iconfont icon-close')
    }

    function __doAssessOnAssessQuick() {
        var $BtnDoAssess = a.$Btn.find('.btn-do-assess')

        __buttonClickDownState($BtnDoAssess)

        if (a.valid.assess()) {
            // 评估
            __doAssess(function (res) {
                var result = res && res['result'] ? res['result'] : {},
                    assess_key = result['assess_key']

                if (assess_key) {
                    var query = tcb.queryUrl(window.location.search)
                    var params = {
                        'assess_key': assess_key
                    }
                    if (query['detect_key']) {
                        params['detect_key'] = query['detect_key']
                    }
                    if (query['pre_assess']) {
                        params['pre_assess'] = query['pre_assess']
                    }
                    var redirect_url = tcb.setUrl2(window.__REDIRECT_URL || '/m/pinggu_shop/', params)

                    __buttonReduceState($BtnDoAssess)

                    window.location.href = redirect_url
                } else {
                    //$.dialog.toast ('评估价格不正确，无法回收', 2000)

                    __buttonReduceState($BtnDoAssess)
                }
            })
        } else {

            __buttonReduceState($BtnDoAssess)
        }
    }

    /**
     * 供渠道生成Assess_key（美承以旧换新等业务）
     */
    function doGenerateAssessKeyForOld2New(shopId, shopType) {
        var $BtnDoAssess = a.$Btn.find('.btn-do-assess')

        __buttonClickDownState($BtnDoAssess)

        if (a.valid.assess()) {
            // 评估
            __doAssess(function (res) {
                var result = res && res['result'] ? res['result'] : {},
                    assess_key = result['assess_key']

                if (assess_key) {
                    var hash_url = tcb.setUrl('/' + (shopType ? shopType : 'mc') + '/fill-up-info', {
                        shop_id: shopId,
                        assess_key: assess_key
                    })
                    var _redirectUrl = tcb.setUrl2('/page/old2new/#' + hash_url)
                    __buttonReduceState($BtnDoAssess)
                    window.location.href = _redirectUrl
                    return
                } else {
                    __buttonReduceState($BtnDoAssess)
                    return
                }
            })
        } else {
            __buttonReduceState($BtnDoAssess)
        }
    }

    /**
     * 活动--社群拼团
     */
    function doGenerateAssessKeyForPintuan(query) {
        var $BtnDoAssess = a.$Btn.find('.btn-do-assess')

        __buttonClickDownState($BtnDoAssess)

        if (a.valid.assess()) {
            // 评估
            __doAssess(function (res) {
                var result = res && res['result'] ? res['result'] : {},
                    assess_key = result['assess_key']

                if (assess_key) {
                    var _redirectUrl = tcb.setUrl2('/pintuan/submit', {
                        assess_key: assess_key,
                        xxg_id: query.xxg_id,
                        activity_id: query.activity_id
                    })
                    __buttonReduceState($BtnDoAssess)
                    window.location.href = _redirectUrl
                    return
                } else {
                    __buttonReduceState($BtnDoAssess)
                    return
                }
            })
        } else {
            __buttonReduceState($BtnDoAssess)
        }
    }

    function __doAssessOnOfficialDiff() {
        if (!a.valid.assessBasic()) {
            return
        }

        var route = '!/assess_quick'

        a.router_inst.go(route)
    }

    function __doAssessOnAssessBasic() {
        if (!a.valid.assessBasic()) {
            return
        }

        var route = '!/assess_quick'
        if (!__compareWithOfficialData()) {
            route = '!/official_diff'
        }

        a.router_inst.go(route)
    }

    function __doAssessOnOnePage(route) {
        var $BtnDoAssess = a.$Btn.find('.btn-do-assess')

        __buttonClickDownState($BtnDoAssess)

        if (a.valid.assess()) {
            if (route != '!/official_diff' && !__compareWithOfficialData()) {
                __buttonReduceState($BtnDoAssess, 1000)
                return a.router_inst.go('!/official_diff')
            }

            // 评估
            __doAssess(function (res) {
                var result = res && res['result'] ? res['result'] : {},
                    assess_key = result['assess_key']

                if (assess_key) {
                    var query = tcb.queryUrl(window.location.search)
                    var params = {
                        'assess_key': assess_key
                    }
                    if (query['detect_key']) {
                        params['detect_key'] = query['detect_key']
                    }
                    if (query['pre_assess']) {
                        params['pre_assess'] = query['pre_assess']
                    }
                    var redirect_url = tcb.setUrl2(window.__REDIRECT_URL || '/m/pinggu_shop/', params)

                    __buttonReduceState($BtnDoAssess)

                    window.location.href = redirect_url
                } else {
                    //$.dialog.toast ('评估价格不正确，无法回收', 2000)

                    __buttonReduceState($BtnDoAssess)
                }
            })

        } else {

            __buttonReduceState($BtnDoAssess)
        }
    }

    function __buttonClickDownState($btn) {
        $btn.addClass('btn-disabled').removeClass('btn-yellow')
    }

    function __buttonReduceState($btn, delay_time) {
        if (typeof delay_time == 'undefined') {
            delay_time = 2000
        }
        delay_time = parseInt(delay_time, 10) || 0

        if (!delay_time) {
            return $btn.addClass('btn-yellow').removeClass('btn-disabled')
        }
        setTimeout(function () {
            $btn.addClass('btn-yellow').removeClass('btn-disabled')
        }, delay_time)
    }

    function __compareWithOfficialData() {
        var flag = true,
            officialData = $.parseJSON(window.__OFFICIAL_DATA) || {},
            skuCheckedComb = a.cache.doGetCheckedComb(true)

        tcb.each(officialData, function (key, val) {
            if (!val) {
                return true
            }
            switch (key) {
                case 'model_id':
                    val = tcb.isArray(val) ? val : [val]
                    tcb.inArray(a.cache.getModelId().toString(), val) == -1 && (flag = false)
                    break
                case 'capacity':
                case 'color':
                    val = val.toString()
                    tcb.inArray(val, skuCheckedComb) == -1 && (flag = false)
                    break
            }
        })

        return flag
    }
}(this)


;/**import from `/resource/js/mobile/huishou/assess/event_handle.js` **/
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


;/**import from `/resource/js/mobile/huishou/assess/route_map.js` **/
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    a.route_map = {
        /**
         * 首页
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!' : function (route_inst, route, direction, url, request) {
            a.page.generateIds (url)

            __beforeRenderBasic ()

            // 输出页面
            // 并且将页面设为激活页面
            var $Page = a.page.generator ({
                    // 页面id
                    id     : a.page.getId (url),
                    // 页面数据
                    data   : {},
                    // 页面输出函数,
                    // 并且含有同名绑定事件
                    render : 'assessBasic'
                }, true)

            __afterRenderBasic ()

            setViewLayout()

            // 设置评估进度
            //a.doSetAssessProcess ()
            a.doSetAssessProcess (true)
            // 页面进入
            a.page.comeIn ($Page, route_inst, __completeComeInBasic)
        },

        '!/official_diff' : function (route_inst, route, direction, url, request) {
            a.page.generateIds (url)

            // 输出页面
            // 并且将页面设为激活页面
            var $Page = a.page.generator ({
                    // 页面id
                    id     : a.page.getId (url),
                    // 页面数据
                    data   : {
                        OfficialDiffList : a.getOfficialDiffData()
                    },
                    // 页面输出函数,
                    // 并且含有同名绑定事件
                    render : 'officialDiff'
                }, true)

            // 页面进入
            a.page.comeIn ($Page, route_inst, __completeComeInOfficialDiff)
        },

        /**
         * 快速评估页
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!/assess_quick' : function (route_inst, route, direction, url, request) {
            a.page.generateIds (url)

            // 获取不到机器型号id,直接返回评估首页,重新评估
            if (!a.cache.getModelId () || !a.valid.assessBasic ()) {
                a.router_inst.go ('')
                return
            }

            __beforeRenderSpecial ()

            var special_groups = a.getSpecialGroups ()

            // 输出专有评估项页面
            // 并且将页面设为激活页面
            var $Page = a.page.generator ({
                    // 页面id
                    id     : a.page.getId (url),
                    // 页面数据
                    data   : {
                        groupList : special_groups,
                        pos       : 1
                    },
                    // 页面输出函数,
                    // 并且含有同名绑定事件
                    render : 'assessSpecial'
                }, true)

            __afterRenderSpecial ()

            setViewLayout()

            // 设置评估进度
            a.doSetAssessProcess (true)

            // 评估
            a.doAssess ({
                fail  : function () {
                    console.log ('还没有选完评估项，别慌！')
                },
                after : function (res) {
                    if (res[ 'errno' ]) {
                        $.dialog.toast (res[ 'errmsg' ], 2000)

                        a.$Btn.find ('.' + a.CLASS_NAME.row_assess_price).html ('').hide()
                    } else {

                        var
                            where_am_i_except = ['partner_detect'],
                            where_am_i = tcb.queryUrl(window.location.search, 'whereami')

                        if (window.__TPL_TYPE == 'detect') {
                            // app检测模板内

                            // 并且whereami的值不在 where_am_i_except 中
                            if (tcb.inArray (where_am_i, where_am_i_except) == -1) {

                                // 有评估价格那么直接显示
                                if (res[ 'result' ] && res[ 'result' ][ 'pinggu_price' ] && res[ 'result' ][ 'pinggu_price' ]!=='undefined') {
                                    var
                                        price = '评估价格：0元'
                                    if (!res[ 'errno' ]) {
                                        price = '评估价格：' + res[ 'result' ][ 'pinggu_price' ] + '元'
                                    }
                                    a.$Btn.find ('.' + a.CLASS_NAME.row_assess_price).html (price).show ()
                                    var
                                        b_height = a.$Btn.height (),
                                        $Page = a.page.get ()

                                    $Page.css ({
                                        'padding-bottom' : b_height
                                    })
                                } else {

                                    a.$Btn.find ('.' + a.CLASS_NAME.row_assess_price).html ('').hide()
                                }

                            }
                        }

                    }
                }

            })

            // 页面进入
            a.page.comeIn ($Page, route_inst, __completeComeInSpecial)
        }
    }


    // =================================================================
    // 私有接口 private
    // =================================================================


    // basic输出前置函数
    function __beforeRenderBasic () {
        a.$Btn.show().find ('.' + a.CLASS_NAME.row_assess_price).hide ()
    }

    // basic输出后置函数
    function __afterRenderBasic () {
        var b_height = a.$Btn.height (),
            $Page = a.page.get ()

        $Page.css ({
            'padding-bottom' : b_height/0.56 /*此处padding-bottom正常是b_height，除以0.56是为了处理某些浏览器，尤其是iOS的Safari下vh的bug*/
        })
    }

    // 完成进入basic页
    function __completeComeInBasic ($Enter) {
        // 初始化Basic页面基础评估页面状态
        a.page.initBasicPage ($Enter)
    }


    // special输出前置函数
    function __beforeRenderSpecial () {
        a.$Btn.show()
    }

    // special输出后置函数
    function __afterRenderSpecial () {}

    // 完成进入special页
    function __completeComeInSpecial ($Enter) {
        $Enter.find ('.' + a.CLASS_NAME.block_option_group_selected).each (function () {
            var $SelectedGroup = $ (this)

            a.doAnimateGroupSelected ($SelectedGroup, function () {

                var
                    $Container = a.scroll.getContainer (),
                    $Inner = a.scroll.getInner (),
                    innerOffset = $Inner.offset (),

                    // 滚动位置
                    // 根据滚动位置设定新的内容虚拟高度(限定滚动的最大位置)
                    inner_height = Math.max ($Container.height (), innerOffset[ 'height' ])

                // 重置宽高,限定滚动范围
                a.scroll.setDimensions (0, 0, 0, inner_height)
            })
        })
    }

    function setViewLayout(){
        var $BlockHeader = $('#Header'),
            $BlockAssessModel = $('.'+a.CLASS_NAME.block_assess_model),
            $BlockMain = $('#Main')

        $BlockHeader.show()

        var header_height = $BlockHeader.height() || 0

        $BlockAssessModel.css({
            top : header_height
        })
        $BlockMain.css({
            top : header_height
        })
    }

    // 完成进入OfficialDiff页
    function __completeComeInOfficialDiff ($Enter) {
        //var $Container = a.scroll.getContainer (),
        //    $Inner = a.scroll.getInner (),
        //    innerOffset = $Inner.offset (),
        //
        //    // 滚动位置
        //    // 根据滚动位置设定新的内容虚拟高度(限定滚动的最大位置)
        //    inner_height = Math.max ($Container.height (), innerOffset[ 'height' ])
        //
        //// 重置宽高,限定滚动范围
        //a.scroll.setDimensions (0, 0, 0, inner_height)
    }

} (this)



;/**import from `/resource/js/mobile/huishou/assess/_start.js` **/
!function (global) {
    // 非评估页面,直接返回不做任何处理
    if (window.__PAGE!=='assess'){
        return
    }

    var
        Root = tcb.getRoot (),
        a = Root.Assess

    // 初始化评估页面
    // DOM READY at callback
    a.init ({
        // 前置处理
        before : function () {
            if (tcb.queryUrl(window.location.search, '_global_data')){
                // 修修哥手动检测，清除sessionStorage，避免重复检测时候选了不同默认值产生怪异情况
                a.cache.doCleanStorage()
            }
            // 处理初始化数据
            a.handleInitData ()
            // 恢复storage的评估数据
            // (确保在 a.handleInitData 之后执行,否则初始数据处理可能会有问题)
            a.cache.doRecoverAssessData ()

            // sku属性在view中的序号存储key
            var index_in_view = 1

            // 如果有屏幕检测项，加上屏幕检测项的项目数
            var
                screenDetected=a.cache(a.KEY_OPTIONS_SCREEN_DETECTED)
            if (screenDetected&&screenDetected.length){
                index_in_view += screenDetected.length
            }
            // 可选机型数量大于1，那么在加上选机型的步骤
            if (a.cache (a.KEY_MODELS_COUNT) > 1) {
                index_in_view += 1
            }
            // sku属性在view中的序号存储key
            a.cache (a.KEY_SKU_START_INDEX_IN_VIEW, index_in_view)
        },
        // DOM READY之后
        after  : function () {

            // 初始化页面滚动功能
            a.scroll.init (a.getContainer (),{
                scrollingX : true,
                bouncing   : false
            })

            // 生成路由实例
            a.router_inst = a.router(a.route_map)

            //======= 此处被干掉，直接将生成页面id的功能加入route_map中实现
            //// ***** hash路由情况下这很重要,用以将hash route和page建立映射*****
            //// 根据路由列表,生成路由地址和页面唯一的映射关系
            //a.page.generateIds(a.router_inst.list())

            // 初始化路由功能
            a.router_inst.init()
        }
    })

} (this)



;/**import from `/resource/js/mobile/huishou/order/_enter.js` **/
// 入口
!function (global) {
    var
        Root = tcb.getRoot (),
        o = {},
        a = Root.Assess

    Root.Order = o

    tcb.mix (o, {

        $Doc   : null,
        $Win   : null,
        getDoc : tcb.getDoc,
        getWin : tcb.getWin,

        // 容器

        $Container : null,
        $Inner     : null,

        // 顶部商品详情
        // 底部按钮

        $Model      : null,
        modelHeight : 0,
        $Btn        : null,

        noop : tcb.noop,

        // 独立组件引入

        scroll : Root.scroll,

        // END 独立组件引入

        // 获取容器

        getContainer : function () {
            var
                me = this,
                $Container = me.$Container,
                containerId = 'Main'

            if ($Container && $Container.length) {

                return $Container
            }

            return me.$Container = $ ('#' + containerId)
        },

        //做一些初始化操作[not DOM Ready]

        init : function (options) {
            var
                before = typeof options[ 'before' ] === 'function'
                    ? options[ 'before' ]
                    : o.noop,
                after = typeof options[ 'after' ] === 'function'
                    ? options[ 'after' ]
                    : o.noop

            // DOM Ready之前执行
            before ()

            // DOM Ready
            __ready (function () {

                // DOM Ready之后执行
                after ()
            })

            return this
        }
    })


    /**
     * 做一些dom ready之后的初始化操作
     */
    function __ready (callback) {
        $ (function () {
            var
                $Doc = o.getDoc (),
                $Win = o.getWin ()

            o.$Inner = $Doc.find ('.main-inner')

            // 初始化事件绑定
            o.event.init ()

            typeof callback === 'function' && callback ()
        })
    }
} (this)

;/**import from `/resource/js/mobile/huishou/order/valid.js` **/
// 验证
!function (global) {
    var
        Root = tcb.getRoot (),
        o = Root.Order

    o.valid = {}

    tcb.mix (o.valid, {

        seCode : validSeCode,

        checkLabel : validCheckLabel,

        shangMenForm : validShangMenForm,
        shangMenFormFengxiu : validShangMenFormFengxiu,
        youJiForm    : validYouJiForm,
        daoDianForm  : validDaoDianForm,
        daoDianBudanForm  : validDaoDianBudanForm,

        huanXinShangMenForm : validHuanXinShangMenForm,
        huanXinYouJiForm    : validHuanXinYouJiForm,
        huanXinDaoDianForm  : validHuanXinDaoDianForm,

        schedulePickupForm : validSchedulePickupForm,
        schedulePickupForm2 : validSchedulePickupForm2,

        xxgApplyGoodPriceForm : validXxgApplyGoodPriceForm,

        isSnMember : validIsSnMember

    })

    // =================================================================
    // 公共接口 public
    // =================================================================

    function validSeCode ($Target) {
        var
            flag = true

        if (!($Target && $Target.length)) {
            flag = false
        } else {

            var
                $Form = $Target.closest ('form'),
                $mobile = $Form.find ('[name="tel"]'),
                $secode = $Form.find ('[name="secode"]'),

                mobile = $.trim ($mobile.val ()),
                secode = $.trim ($secode.val ())

            if ($Target.hasClass ('hsbtn-vcode-dis')) {
                flag = false
            } else {
                var
                    $focus_el = null,
                    err_msg = ''

                // 验证手机号
                if (!mobile) {
                    $.errorAnimate ($mobile)
                    $focus_el = $focus_el || $mobile
                    err_msg = '手机号码不能为空'
                }
                else if (!tcb.validMobile (mobile)) {
                    $.errorAnimate ($mobile)
                    $focus_el = $focus_el || $mobile
                    err_msg = '手机号码格式错误'
                }

                // 验证图形验证码
                if (!secode){
                    $.errorAnimate ($secode)
                    $focus_el = $focus_el || $secode
                    err_msg = err_msg || '图片验证码不能为空'
                }

                if (err_msg) {
                    flag = false

                    setTimeout (function () {
                        $focus_el && $focus_el.focus ()
                    }, 500)

                    $.dialog.toast (err_msg)
                }

            }
        }

        return flag
    }

    function validCheckLabel ($Label) {
        var
            flag = true,
            $Checked = $Label.filter ('.row-hs-style-checked');
        if (!($Checked && $Checked.length)) {
            flag = false

            o.interact.scrollToTop ($Label.eq (0), true, function () {

                $.errorAnimate ($Label)
            })
        }

        return flag
    }

    function validShangMenForm ($Form) {
        var
            flag = true,
            mobile = $Form.find ('[name="tel"]'),
            secode = $Form.find ('[name="secode"]'),
            mcode = $Form.find ('[name="code"]'),
            addr = $Form.find ('[name="user_addr"]'),
            id_card = $Form.find ('[name="id_card"]'),
            agree_protocol_shangmen = $Form.find ('[name="agree_protocol"]'),
            $server_time = $Form.find('[name="server_time"]');
        var errmsg = ''

        var
            $focus_el = null
        //判断是否支持多种支付方式
        if(window.M_SHOW_OFFLINE_PAYOUT){
            var alipay = $Form.find ('[name="alipay_id"]'),
                alipay_name = $Form.find ('[name="alipay_name"]'),

                bank_name = $Form.find ('[name="bank_name"]'),
                bank_area = $Form.find ('[name="bank_area"]'),
                bank_num = $Form.find ('[name="pay_account"]'),
                bank_user = $Form.find ('[name="account_holder"]'),
                $wx_openid = $Form.find('[name="wx_openid"]'),
                $payout_method = $Form.find ('.payout-method-item').filter ('.b-radius-green');

            if ($payout_method.attr ('data-rel') == 'alipay') {
                // 支付宝收款
                $Form.find ('[name="pay_method"]').val ('alipay')

                if ($.trim (alipay.val ()).length == 0) {
                    $.errorAnimate (alipay)
                    $focus_el = $focus_el || alipay
                    flag = false
                }
                if ($.trim (alipay_name.val ()).length == 0) {
                    $.errorAnimate (alipay_name)
                    $focus_el = $focus_el || alipay_name
                    flag = false
                }

            }
            else if ($payout_method.attr ('data-rel') == 'bank') {
                // 银行卡收款
                $Form.find('[name="pay_method"]').val('bank')

                if (bank_name.val() == -1) {
                    $.errorAnimate(bank_name)
                    flag = false
                }
                if ($.trim(bank_area.val()).length == 0) {
                    $.errorAnimate($('.city-selector'))
                    flag = false
                }

                if ($.trim(bank_num.val()).length == 0) {
                    $.errorAnimate(bank_num)
                    $focus_el = $focus_el || bank_num
                    flag = false
                }

                if ($.trim(bank_user.val()).length == 0) {
                    $.errorAnimate(bank_user)
                    $focus_el = $focus_el || bank_user
                    flag = false
                }

            }
            else if ($payout_method.attr('data-rel') == 'wechat') {
                // 微信收款
                $Form.find('[name="pay_method"]').val('weixin')
                if (!$.trim($wx_openid.val())) {
                    flag = false
                    errmsg = '请用您的收款微信号扫描二维码'
                }
            }
        }

        // 上门时间
        if($server_time && $server_time.length && !$server_time.val()){
            $.errorAnimate( $server_time);
            $focus_el = $focus_el || $server_time;
            flag = false;
        }

        if (!tcb.validMobile (mobile.val ())) {
            $.errorAnimate (mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        // 图形验证码
        if (secode && secode.length) {
            if ($.trim (secode.val ()).length == 0) {
                $.errorAnimate (secode)
                $focus_el = $focus_el || secode
                flag = false
            }
        }

        if (mcode && mcode.length) {
            if ($.trim (mcode.val ()).length == 0) {
                $.errorAnimate (mcode)
                $focus_el = $focus_el || mcode
                flag = false
            }
        }

        if (addr && addr.length) {
            if ($.trim (addr.val ()).length == 0) {
                $.errorAnimate (addr)
                $focus_el = $focus_el || addr
                flag = false
            }
        }

        //验证身份证号码
        if (id_card && id_card.length) {
            if (!tcb.validIDCard ($.trim (id_card.val ()))) {
                $.errorAnimate (id_card)
                $focus_el = $focus_el || id_card
                flag = false
            }
        }

        // 回收常见问题
        if (agree_protocol_shangmen && agree_protocol_shangmen.length) {
            if (!agree_protocol_shangmen.prop ('checked')) {
                $.errorAnimate (agree_protocol_shangmen.closest ('label'))
                flag = false
            }
        }

        if (errmsg) {
            $.dialog.toast(errmsg, 2000)
        }
        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    function validShangMenFormFengxiu ($Form) {
        var flag = true,
            //手机号
            mobile = $Form.find ('[name="tel"]'),
            //图形验证码
            secode = $Form.find ('[name="secode"]'),
            //短信验证码
            mcode = $Form.find ('[name="code"]'),
            //地址
            addr = $Form.find ('[name="user_addr"]'),
            //协议
            agree_protocol_shangmen = $Form.find ('[name="agree_protocol"]'),

            alipay = $Form.find ('[name="alipay_id"]'),
            alipay_name = $Form.find ('[name="alipay_name"]'),

            bank_name = $Form.find ('[name="bank_name"]'),
            bank_area = $Form.find ('[name="bank_area"]'),
            bank_num = $Form.find ('[name="pay_account"]'),
            bank_user = $Form.find ('[name="account_holder"]');

        var $focus_el = null,
            $payout_method = $Form.find('.payout-method-item').filter('.b-radius-green')

        if (!tcb.validMobile (mobile.val ())) {
            $.errorAnimate (mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        // 图形验证码
        if (secode && secode.length) {
            if ($.trim (secode.val ()).length == 0) {
                $.errorAnimate (secode)
                $focus_el = $focus_el || secode
                flag = false
            }
        }

        if (mcode && mcode.length) {
            if ($.trim (mcode.val ()).length == 0) {
                $.errorAnimate (mcode)
                $focus_el = $focus_el || mcode
                flag = false
            }
        }

        if (addr && addr.length) {
            if ($.trim (addr.val ()).length == 0) {
                $.errorAnimate (addr)
                $focus_el = $focus_el || addr
                flag = false
            }
        }

        if ($payout_method.height() && $payout_method.attr ('data-rel') == 'alipay') {
            // 支付宝收款
            $Form.find ('[name="pay_method"]').val ('alipay')

            if ($.trim (alipay.val ()).length == 0) {
                $.errorAnimate (alipay)
                $focus_el = $focus_el || alipay
                flag = false
            }
            if ($.trim (alipay_name.val ()).length == 0) {
                $.errorAnimate (alipay_name)
                $focus_el = $focus_el || alipay_name
                flag = false
            }

        }
        else if ($payout_method.height() && $payout_method.attr ('data-rel') == 'bank'){
            // 银行卡收款
            $Form.find ('[name="pay_method"]').val ('bank')

            if (bank_name.val () == -1) {
                $.errorAnimate (bank_name)
                flag = false
            }
            if ($.trim (bank_area.val ()).length == 0) {
                $.errorAnimate ($ ('.city-selector'))
                flag = false
            }

            if ($.trim (bank_num.val ()).length == 0) {
                $.errorAnimate (bank_num)
                $focus_el = $focus_el || bank_num
                flag = false
            }

            if ($.trim (bank_user.val ()).length == 0) {
                $.errorAnimate (bank_user)
                $focus_el = $focus_el || bank_user
                flag = false
            }

        }

        // 回收常见问题
        if (agree_protocol_shangmen && agree_protocol_shangmen.length) {
            if (!agree_protocol_shangmen.prop ('checked')) {
                $.errorAnimate (agree_protocol_shangmen.closest ('label'))
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    function validYouJiForm ($Form) {
        var
            flag = true,
            username = $Form.find ('[name="saler_name"]'),
            mobile = $Form.find ('[name="tel"]'),
            $wx_openid = $Form.find('[name="wx_openid"]'),

            snpay = $Form.find ('[name="yifubao_id"]'),
            snpay_name = $Form.find ('[name="yifubao_name"]'),

            alipay = $Form.find ('[name="alipay_id"]'),
            alipay_name = $Form.find ('[name="alipay_name"]'),

            bank_name = $Form.find ('[name="bank_name"]'),
            bank_area = $Form.find ('[name="bank_area"]'),
            bank_num = $Form.find ('[name="pay_account"]'),
            bank_user = $Form.find ('[name="account_holder"]'),

            id_card = $Form.find ('[name="id_card"]'),
            secode = $Form.find ('[name="secode"]'),

            mcode = $Form.find ('[name="code"]'),

            agree_protocol_youji = $Form.find ('[name="agree_protocol"]')

        var errmsg = ''

        // 江苏移动
        if ('partner-jiangsu-yidong'==window.__TPL_TYPE){
            var $jiangsu_yidong_payout_method = $Form.find('.row-jiangsu-yidong-payout-method').filter(function(){
                return !$(this).hasClass('row-jiangsu-yidong-payout-method-disabled')
            })
            if (!$jiangsu_yidong_payout_method.find('.payout-method-radio-checked').length){
                $.errorAnimate ($jiangsu_yidong_payout_method)

                o.interact.scrollToTop ($Form.closest('.block-order-style'), true)

                return false
            }

            // 收款方式为萌鹿，那么不做验证，直接返回flag
            if ($Form.find('[name="pay_method"]').val()=='menglu'){
                return flag
            }
        }

        var
            $focus_el = null

        // 用户名（隐藏）
        if ($.trim (username.val ()).length == 0) {
            $.errorAnimate (username)
            $focus_el = $focus_el || username
            flag = false
        }

        var
            $payout_method = $Form.find ('.payout-method-item').filter ('.b-radius-green')

        // 验证收款方式

        if ($payout_method.attr ('data-rel') == 'snpay') {
            // 易付宝收款
            $Form.find ('[name="pay_method"]').val ('snpay')

            if ($.trim (snpay.val ()).length == 0) {
              $.errorAnimate (snpay)
              $focus_el = $focus_el || snpay
              flag = false
            }
            if ($.trim (snpay_name.val ()).length == 0) {
              $.errorAnimate (snpay_name)
              $focus_el = $focus_el || snpay_name
              flag = false
            }

        }
        else if ($payout_method.attr ('data-rel') == 'alipay') {
            // 支付宝收款
            $Form.find ('[name="pay_method"]').val ('alipay')

            if ($.trim (alipay.val ()).length == 0) {
                $.errorAnimate (alipay)
                $focus_el = $focus_el || alipay
                flag = false
            }
            if ($.trim (alipay_name.val ()).length == 0) {
                $.errorAnimate (alipay_name)
                $focus_el = $focus_el || alipay_name
                flag = false
            }

        }
        else if ($payout_method.attr ('data-rel') == 'bank'){
            // 银行卡收款
            $Form.find ('[name="pay_method"]').val ('bank')


            if (bank_name.val () == -1) {
                $.errorAnimate (bank_name)
                flag = false
            }

            if ($.trim (bank_area.val ()).length == 0) {
                $.errorAnimate ($ ('.city-selector'))
                flag = false
            }

            if ($.trim (bank_num.val ()).length == 0) {
                $.errorAnimate (bank_num)
                $focus_el = $focus_el || bank_num
                flag = false
            }

            if ($.trim (bank_user.val ()).length == 0) {
                $.errorAnimate (bank_user)
                $focus_el = $focus_el || bank_user
                flag = false
            }

        }
        else if ($payout_method.attr ('data-rel') == 'wechat') {
            // 微信收款
            $Form.find ('[name="pay_method"]').val ('weixin')
            if (!$.trim($wx_openid.val())) {
                flag = false
                errmsg = '请用您的收款微信号扫描二维码'
            }
        }

        // 手机号
        if (!tcb.validMobile ($.trim (mobile.val ()))) {
            $.errorAnimate (mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        // 图形验证码
        if (secode && secode.length) {
            if ($.trim (secode.val ()).length == 0) {
                $.errorAnimate (secode)
                $focus_el = $focus_el || secode
                flag = false
            }
        }

        // 短信验证码
        if (mcode && mcode.length) {
            if ($.trim (mcode.val ()).length == 0) {
                $.errorAnimate (mcode)
                $focus_el = $focus_el || mcode
                flag = false
            }
        }

        //验证身份证号码（个别活动）
        if (id_card && id_card.length) {
            if (!tcb.validIDCard ($.trim (id_card.val ()))) {
                $.errorAnimate (id_card)
                $focus_el = $focus_el || id_card
                flag = false
            }
        }

        // 回收常见问题
        if (agree_protocol_youji && agree_protocol_youji.length) {
            if (!agree_protocol_youji.prop ('checked')) {
                $.errorAnimate (agree_protocol_youji.closest ('label'))
                flag = false
            }
        }

        if (errmsg) {
            $.dialog.toast(errmsg, 2000)
        }
        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    // 验证到店提交表单
    function validDaoDianForm ($Form) {
        var
            flag = true,
            $shop_id = $Form.find ('[name="shop_id"]'),
            mobile = $Form.find ('[name="tel"]'),
            secode = $Form.find ('[name="secode"]'),
            mcode = $Form.find ('[name="code"]'),
            addr = $Form.find ('[name="user_addr"]'),
            id_card = $Form.find ('[name="id_card"]'),
            agree_protocol_shangmen = $Form.find ('[name="agree_protocol"]')

        var
            $focus_el = null

        // 到店门店
        if ($.trim ($shop_id.val ()).length == 0) {
            $.errorAnimate ($Form.find ('.daodian-addr-select-trigger'))
            flag = false
        }

        // 手机号
        if (!tcb.validMobile (mobile.val ())) {
            $.errorAnimate (mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        // 图形验证码
        if (secode && secode.length) {
            if ($.trim (secode.val ()).length == 0) {
                $.errorAnimate (secode)
                $focus_el = $focus_el || secode
                flag = false
            }
        }

        // 手机验证码
        if (mcode && mcode.length) {
            if ($.trim (mcode.val ()).length == 0) {
                $.errorAnimate (mcode)
                $focus_el = $focus_el || mcode
                flag = false
            }
        }

        // 用户地址，被隐藏字段
        if (addr && addr.length) {
            if ($.trim (addr.val ()).length == 0) {
                $.errorAnimate (addr)
                $focus_el = $focus_el || addr
                flag = false
            }
        }

        //验证身份证号码
        if (id_card && id_card.length) {
            if (!tcb.validIDCard ($.trim (id_card.val ()))) {
                $.errorAnimate (id_card)
                $focus_el = $focus_el || id_card
                flag = false
            }
        }

        // 回收常见问题
        if (agree_protocol_shangmen && agree_protocol_shangmen.length) {
            if (!agree_protocol_shangmen.prop ('checked')) {
                $.errorAnimate (agree_protocol_shangmen.closest ('label'))
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    // 验证到店补单提交表单
    function validDaoDianBudanForm ($Form) {
        var
            flag = true,
            mobile = $Form.find('[name="tel"]'),

            secode = $Form.find('[name="secode"]'),
            mcode = $Form.find('[name="code"]'),

            alipay = $Form.find('[name="alipay_id"]'),
            alipay_name = $Form.find('[name="alipay_name"]'),

            bank_name = $Form.find('[name="bank_name"]'),
            bank_area = $Form.find('[name="bank_area"]'),
            bank_num = $Form.find('[name="pay_account"]'),
            bank_user = $Form.find('[name="account_holder"]'),

            p_type = $Form.find('[name="p_type"]'),

            agree_protocol_shangmen = $Form.find('[name="agree_protocol"]')

        var $focus_el = null

        // 手机号
        if (p_type.val() == 2) {
            var reg=/^[5689]\d{7}$/;
            if (!reg.test(mobile.val())) {
                $.errorAnimate(mobile)
                $focus_el = $focus_el || mobile
                flag = false
                console.log('输入的手机号不匹配香港格式')
            }
        } else if (!tcb.validMobile(mobile.val())) {
            $.errorAnimate(mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        if (p_type.val() == 1) {
            // 图形验证码
            if (secode && secode.length) {
                if ($.trim(secode.val()).length == 0) {
                    $.errorAnimate(secode)
                    $focus_el = $focus_el || secode
                    flag = false
                }
            }
            if (mcode && mcode.length) {
                if ($.trim(mcode.val()).length == 0) {
                    $.errorAnimate(mcode)
                    $focus_el = $focus_el || mcode
                    flag = false
                }
            }
        }

        var withPayment = $Form.attr('data-with-payment') > 0 // true：表示需要支持支付，false：表示不需要支付
        var $payout_method = $Form.find ('.payout-method-item').filter ('.b-radius-green')

        // 验证收款方式
        if(!withPayment){}
        else if ($payout_method.attr ('data-rel') == 'alipay') {
            // 支付宝收款
            $Form.find ('[name="pay_method"]').val ('alipay')

            if ($.trim (alipay.val ()).length == 0) {
                $.errorAnimate (alipay)
                $focus_el = $focus_el || alipay
                flag = false
            }
            if ($.trim (alipay_name.val ()).length == 0) {
                $.errorAnimate (alipay_name)
                $focus_el = $focus_el || alipay_name
                flag = false
            }

        }
        else if ($payout_method.attr ('data-rel') == 'bank'){
            // 银行卡收款
            $Form.find ('[name="pay_method"]').val ('bank')


            if (bank_name.val () == -1) {
                $.errorAnimate (bank_name)
                flag = false
            }

            if ($.trim (bank_area.val ()).length == 0) {
                $.errorAnimate ($ ('.city-selector'))
                flag = false
            }

            if ($.trim (bank_num.val ()).length == 0) {
                $.errorAnimate (bank_num)
                $focus_el = $focus_el || bank_num
                flag = false
            }

            if ($.trim (bank_user.val ()).length == 0) {
                $.errorAnimate (bank_user)
                $focus_el = $focus_el || bank_user
                flag = false
            }

        }
        else if ($payout_method.attr ('data-rel') == 'wechat') {
            // 微信收款
            $Form.find ('[name="pay_method"]').val ('weixin')
        }
        else {
            $Form.find ('[name="pay_method"]').val ($payout_method.attr ('data-rel'))
        }

        // 回收常见问题
        if (agree_protocol_shangmen && agree_protocol_shangmen.length) {
            if (!agree_protocol_shangmen.prop ('checked')) {
                $.errorAnimate (agree_protocol_shangmen.closest ('label'))
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }


    // 验证换新上门
    function validHuanXinShangMenForm ($Form) {
        var
            flag = true,
            mobile = $Form.find ('[name="tel"]'),
            secode = $Form.find ('[name="secode"]'),
            mcode = $Form.find ('[name="code"]'),
            addr = $Form.find ('[name="user_addr"]'),
            id_card = $Form.find ('[name="id_card"]'),
            agree_protocol_shangmen = $Form.find ('[name="agree_protocol"]'),
            $server_time = $Form.find('[name="server_time"]');

        var
            $focus_el = null


        // 上门时间
        if($server_time && $server_time.length && !$server_time.val()){
            $.errorAnimate( $server_time);
            $focus_el = $focus_el || $server_time;
            flag = false;
        }

        if (!tcb.validMobile (mobile.val ())) {
            $.errorAnimate (mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        // 图形验证码
        if (secode && secode.length) {
            if ($.trim (secode.val ()).length == 0) {
                $.errorAnimate (secode)
                $focus_el = $focus_el || secode
                flag = false
            }
        }

        if (mcode && mcode.length) {
            if ($.trim (mcode.val ()).length == 0) {
                $.errorAnimate (mcode)
                $focus_el = $focus_el || mcode
                flag = false
            }
        }

        if (addr && addr.length) {
            if ($.trim (addr.val ()).length == 0) {
                $.errorAnimate (addr)
                $focus_el = $focus_el || addr
                flag = false
            }
        }

        //验证身份证号码
        if (id_card && id_card.length) {
            if (!tcb.validIDCard ($.trim (id_card.val ()))) {
                $.errorAnimate (id_card)
                $focus_el = $focus_el || id_card
                flag = false
            }
        }

        // 回收常见问题
        if (agree_protocol_shangmen && agree_protocol_shangmen.length) {
            if (!agree_protocol_shangmen.prop ('checked')) {
                $.errorAnimate (agree_protocol_shangmen.closest ('label'))
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    // 验证换新邮寄
    function validHuanXinYouJiForm ($Form) {
        var
            flag = true,
            user_name = $Form.find ('[name="user_name"]'),
            mobile = $Form.find ('[name="tel"]'),
            secode = $Form.find ('[name="secode"]'),
            mcode = $Form.find ('[name="code"]'),
            addr = $Form.find ('[name="user_addr"]'),
            id_card = $Form.find ('[name="id_card"]'),
            agree_protocol_shangmen = $Form.find ('[name="agree_protocol"]')

        var
            $focus_el = null

        if (user_name && user_name.length) {
            if ($.trim (user_name.val ()).length == 0) {
                $.errorAnimate (user_name)
                $focus_el = $focus_el || user_name
                flag = false
            }
        }

        if (!tcb.validMobile (mobile.val ())) {
            $.errorAnimate (mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        // 图形验证码
        if (secode && secode.length) {
            if ($.trim (secode.val ()).length == 0) {
                $.errorAnimate (secode)
                $focus_el = $focus_el || secode
                flag = false
            }
        }

        // 短信验证码
        if (mcode && mcode.length) {
            if ($.trim (mcode.val ()).length == 0) {
                $.errorAnimate (mcode)
                $focus_el = $focus_el || mcode
                flag = false
            }
        }

        if (addr && addr.length) {
            if ($.trim (addr.val ()).length == 0) {
                $.errorAnimate (addr)
                $focus_el = $focus_el || addr
                flag = false
            }
        }

        //验证身份证号码
        if (id_card && id_card.length) {
            if (!tcb.validIDCard ($.trim (id_card.val ()))) {
                $.errorAnimate (id_card)
                $focus_el = $focus_el || id_card
                flag = false
            }
        }

        // 回收常见问题
        if (agree_protocol_shangmen && agree_protocol_shangmen.length) {
            if (!agree_protocol_shangmen.prop ('checked')) {
                $.errorAnimate (agree_protocol_shangmen.closest ('label'))
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    // 验证换新到店
    function validHuanXinDaoDianForm ($Form) {
        var
            flag = true,
            $shop_id = $Form.find ('[name="shop_id"]'),
            mobile = $Form.find ('[name="tel"]'),
            secode = $Form.find ('[name="secode"]'),
            mcode = $Form.find ('[name="code"]'),
            addr = $Form.find ('[name="user_addr"]'),
            id_card = $Form.find ('[name="id_card"]'),
            agree_protocol_shangmen = $Form.find ('[name="agree_protocol"]')

        var
            $focus_el = null

        // 到店门店
        if ($.trim ($shop_id.val ()).length == 0) {
            $.errorAnimate ($Form.find ('.daodian-addr-select-trigger'))
            flag = false
        }

        // 手机号
        if (!tcb.validMobile (mobile.val ())) {
            $.errorAnimate (mobile)
            $focus_el = $focus_el || mobile
            flag = false
        }

        // 图形验证码
        if (secode && secode.length) {
            if ($.trim (secode.val ()).length == 0) {
                $.errorAnimate (secode)
                $focus_el = $focus_el || secode
                flag = false
            }
        }

        // 手机验证码
        if (mcode && mcode.length) {
            if ($.trim (mcode.val ()).length == 0) {
                $.errorAnimate (mcode)
                $focus_el = $focus_el || mcode
                flag = false
            }
        }

        // 用户地址，被隐藏字段
        if (addr && addr.length) {
            if ($.trim (addr.val ()).length == 0) {
                $.errorAnimate (addr)
                $focus_el = $focus_el || addr
                flag = false
            }
        }

        //验证身份证号码
        if (id_card && id_card.length) {
            if (!tcb.validIDCard ($.trim (id_card.val ()))) {
                $.errorAnimate (id_card)
                $focus_el = $focus_el || id_card
                flag = false
            }
        }

        // 回收常见问题
        if (agree_protocol_shangmen && agree_protocol_shangmen.length) {
            if (!agree_protocol_shangmen.prop ('checked')) {
                $.errorAnimate (agree_protocol_shangmen.closest ('label'))
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    // 验证换新到店
    function validSchedulePickupForm ($Form) {
        var
            flag = true,
            $express_username = $Form.find ('[name="express_username"]'),
            $express_tel = $Form.find ('[name="express_tel"]'),
            $express_area = $Form.find ('[name="express_area"]'),
            $express_useraddr = $Form.find ('[name="express_useraddr"]'),
            $express_time_alias = $Form.find ('[name="express_time_alias"]')

        var
            $focus_el = null

        // 选择区县
        if ($express_area && $express_area.length) {
            if ($.trim ($express_area.val ()).length == 0) {
                $.errorAnimate ($express_area)
                $focus_el = $focus_el || $express_area
                flag = false
            }
        }

        // 寄件人姓名
        if ($express_username && $express_username.length) {
            if ($.trim ($express_username.val ()).length == 0) {
                $.errorAnimate ($express_username)
                $focus_el = $focus_el || $express_username
                flag = false
            }
        }

        // 手机号
        if (!tcb.validMobile ($express_tel.val ())) {
            $.errorAnimate ($express_tel)
            $focus_el = $focus_el || $express_tel
            flag = false
        }

        // 详细地址
        if ($express_useraddr && $express_useraddr.length) {
            if ($.trim ($express_useraddr.val ()).length == 0) {
                $.errorAnimate ($express_useraddr)
                $focus_el = $focus_el || $express_useraddr
                flag = false
            }
        }

        // 取件时间
        if ($express_time_alias && $express_time_alias.length) {
            if ($.trim ($express_time_alias.val ()).length == 0) {
                $.errorAnimate ($express_time_alias)
                $focus_el = $focus_el || $express_time_alias
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    function validSchedulePickupForm2($Form) {
        var
            flag = true,
            $express_username = $Form.find('[name="express_username"]'),
            $express_tel = $Form.find('[name="express_tel"]'),
            $express_province = $Form.find('[name="express_province"]'),
            $express_city = $Form.find('[name="express_city"]'),
            $express_area = $Form.find('[name="express_area"]'),
            $city_trigger = $Form.find('.trigger-select-province-city-area'),
            $express_useraddr = $Form.find('[name="express_useraddr"]'),
            $express_time_alias = $Form.find('[name="express_time_alias"]')

        var
            $focus_el = null

        // 省市地区
        if ($city_trigger && $city_trigger.length) {
            if ($.trim($express_province.val()).length == 0 || $.trim($express_city.val()).length == 0 || $.trim($express_area.val()).length == 0) {
                $.errorAnimate($city_trigger)
                $focus_el = $focus_el || $city_trigger
                flag = false
            }
        }

        // 寄件人姓名
        if ($express_username && $express_username.length) {
            if ($.trim($express_username.val()).length == 0) {
                $.errorAnimate($express_username)
                $focus_el = $focus_el || $express_username
                flag = false
            }
        }

        // 手机号
        if (!tcb.validMobile($express_tel.val())) {
            $.errorAnimate($express_tel)
            $focus_el = $focus_el || $express_tel
            flag = false
        }

        // 详细地址
        if ($express_useraddr && $express_useraddr.length) {
            if ($.trim($express_useraddr.val()).length == 0) {
                $.errorAnimate($express_useraddr)
                $focus_el = $focus_el || $express_useraddr
                flag = false
            }
        }

        // 取件时间
        if ($express_time_alias && $express_time_alias.length) {
            if ($.trim($express_time_alias.val()).length == 0) {
                $.errorAnimate($express_time_alias)
                $focus_el = $focus_el || $express_time_alias
                flag = false
            }
        }

        setTimeout(function () {
            $focus_el && $focus_el.focus()
        }, 500)

        return flag
    }

    function validXxgApplyGoodPriceForm($Form){
        var flag = true,
            $target_price = $Form.find ('[name="target_price"]')

        var $focus_el = null

        if ($target_price && $target_price.length) {
            if ($.trim ($target_price.val ()).length == 0) {
                $.errorAnimate ($target_price)
                $focus_el = $focus_el || $target_price
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }

    // 检查是否苏宁会员
    function validIsSnMember(data, callback, options) {
        options = options || {}
        if (typeof options.silent === 'undefined') {
            options.silent = true
        }
        $.ajax({
            url: tcb.setUrl2('/huodong/isSnMember'),
            data: data,
            dataType: 'json',
            type: 'GET',
            success: function (res) {
                var flag = true
                var errmsg
                if (!(res && !res.errno)) {
                    flag = false
                    errmsg = (res && res.errmsg) || '系统错误'
                    !options.silent && $.dialog.toast(errmsg)
                }
                typeof callback === 'function' && callback(flag, errmsg)
            },
            error: function (err) {
                var flag = false
                var errmsg = (err && err.statusText) || '系统错误'
                !options.silent && $.dialog.toast(errmsg)
                typeof callback === 'function' && callback(flag, errmsg)
            }
        })
    }


    // =================================================================
    // 私有接口 private
    // =================================================================



} (this)


;/**import from `/resource/js/mobile/huishou/order/event.js` **/
// 绑定事件
!function (global) {
    window.__bankArea = {}
    window.__bankArea.provinces = ['北京', '上海', '天津', '重庆', '河北', '山西', '内蒙', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东',
        '广西', '海南', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '宁夏', '青海', '新疆', '香港', '澳门', '台湾']
    window.__bankArea.cities = [['东城', '西城', '朝阳', '丰台', '石景山', '海淀', '门头沟', '房山', '通州', '顺义', '昌平', '大兴', '平谷', '怀柔', '密云', '延庆'],
        ['黄浦', '卢湾', '徐汇', '长宁', '静安', '普陀', '闸北', '虹口', '杨浦', '闵行', '宝山', '嘉定', '浦东', '金山', '松江', '青浦', '南汇', '奉贤', '崇明'],
        ['和平', '东丽', '河东', '西青', '河西', '津南', '南开', '北辰', '河北', '武清', '红挢', '塘沽', '汉沽', '大港', '宁河', '静海', '宝坻', '蓟县'],
        ['万州', '涪陵', '渝中', '大渡口', '江北', '沙坪坝', '九龙坡', '南岸', '北碚', '万盛', '双挢', '渝北', '巴南', '黔江', '长寿', '綦江', '潼南', '铜梁', '大足', '荣昌',
            '壁山', '梁平', '城口', '丰都', '垫江', '武隆', '忠县', '开县', '云阳', '奉节', '巫山', '巫溪', '石柱', '秀山', '酉阳', '彭水', '江津', '合川', '永川', '南川'],
        ['石家庄', '邯郸', '邢台', '保定', '张家口', '承德', '廊坊', '唐山', '秦皇岛', '沧州', '衡水'],
        ['太原', '大同', '阳泉', '长治', '晋城', '朔州', '吕梁', '忻州', '晋中', '临汾', '运城'],
        ['呼和浩特', '鄂尔多斯', '包头', '乌海', '赤峰', '呼伦贝尔', '阿拉善', '哲里木', '兴安', '乌兰察布', '锡林郭勒', '巴彦淖尔', '伊克昭'],
        ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛'],
        ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城', '延边'],
        ['哈尔滨', '齐齐哈尔', '牡丹江', '佳木斯', '大庆', '绥化', '鹤岗', '鸡西', '黑河', '双鸭山', '伊春', '七台河', '大兴安岭'],
        ['南京', '镇江', '苏州', '南通', '扬州', '盐城', '徐州', '连云港', '常州', '无锡', '宿迁', '泰州', '淮安'],
        ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
        ['合肥', '芜湖', '蚌埠', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '滁州', '宿州', '池州', '淮南', '巢湖', '阜阳', '六安', '宣城', '亳州'],
        ['福州', '厦门', '莆田', '三明', '泉州', '漳州', '南平', '龙岩', '宁德'],
        ['南昌市', '景德镇', '九江', '鹰潭', '萍乡', '新余', '赣州', '吉安', '宜春', '抚州', '上饶'],
        ['济南', '青岛', '淄博', '枣庄', '东营', '烟台', '潍坊', '济宁', '泰安', '威海', '日照', '莱芜', '临沂', '德州', '聊城', '滨州', '菏泽'],
        ['郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店', '济源'],
        ['武汉', '宜昌', '荆州', '襄樊', '黄石', '荆门', '黄冈', '十堰', '恩施', '潜江', '天门', '仙桃', '随州', '咸宁', '孝感', '鄂州'],
        ['长沙', '常德', '株洲', '湘潭', '衡阳', '岳阳', '邵阳', '益阳', '娄底', '怀化', '郴州', '永州', '湘西', '张家界'],
        ['广州', '深圳', '珠海', '汕头', '东莞', '中山', '佛山', '韶关', '江门', '湛江', '茂名', '肇庆', '惠州', '梅州', '汕尾', '河源', '阳江', '清远', '潮州', '揭阳',
            '云浮'], ['南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '南宁地区', '柳州地区', '贺州', '百色', '河池'], ['海口', '三亚'],
        ['成都', '绵阳', '德阳', '自贡', '攀枝花', '广元', '内江', '乐山', '南充', '宜宾', '广安', '达川', '雅安', '眉山', '甘孜', '凉山', '泸州', '阿坝州', '遂宁', '巴中'],
        ['贵阳', '六盘水', '遵义', '安顺', '铜仁', '黔西南', '毕节', '黔东南', '黔南'],
        ['昆明', '大理', '曲靖', '玉溪', '昭通', '楚雄', '红河', '文山', '思茅', '西双版纳', '保山', '德宏', '丽江', '怒江', '迪庆', '临沧'],
        ['拉萨', '日喀则', '山南', '林芝', '昌都', '阿里', '那曲'], ['西安', '宝鸡', '咸阳', '铜川', '渭南', '延安', '榆林', '汉中', '安康', '商洛'],
        ['兰州', '嘉峪关', '金昌', '白银', '天水', '酒泉', '张掖', '武威', '定西', '陇南', '平凉', '庆阳', '临夏', '甘南'], ['银川', '石嘴山', '吴忠', '固原'],
        ['西宁', '海东', '海南', '海北', '黄南', '玉树', '果洛', '海西'],
        ['乌鲁木齐', '石河子', '克拉玛依', '伊犁', '巴音郭勒', '昌吉', '克孜勒苏柯尔克孜', '博尔塔拉', '吐鲁番', '哈密', '喀什', '和田', '阿克苏'], ['香港'], ['澳门'],
        ['台北', '高雄', '台中', '台南', '屏东', '南投', '云林', '新竹', '彰化', '苗栗', '嘉义', '花莲', '桃园', '宜兰', '基隆', '台东', '金门', '马祖', '澎湖'],
        ['北美洲', '南美洲', '亚洲', '非洲', '欧洲', '大洋洲', '火星']]

    // 订单提交后订单跳转地址的处理
    function __redirectUrlAfterSubmit(redirect_params, not_redirect_immediately) {
        // 订单提交成功后跳转地址
        var __order_submit_done_url = '/m/order_succ/'
        // if (window.__HDID) {
        //     __order_submit_done_url = '/m/hs_user_invoice/'
        // }
        if (window.__IS_ZMXY) {
            __order_submit_done_url = '/zhimacredit/orderSucc/'
            if (window.__FLAG_SUBMIT_REDIRECT_URL_OFFLINE && window.__SUBMIT_REDIRECT_URL_OFFLINE) {
                __order_submit_done_url = window.__SUBMIT_REDIRECT_URL_OFFLINE
            } else if (window.__SUBMIT_REDIRECT_URL) {
                __order_submit_done_url = window.__SUBMIT_REDIRECT_URL
            }

            var __daijiao = ''
            if (window.__IS_SELECTED_SF_PICKUP) {
                __daijiao = 'y'
            }
            __order_submit_done_url = tcb.setUrl2(__order_submit_done_url, {
                'daijiao': __daijiao
            })
        }

        __order_submit_done_url = tcb.setUrl2(__order_submit_done_url, redirect_params || {})
        if (not_redirect_immediately) {
            return __order_submit_done_url
        }
        window.location.href = __order_submit_done_url
    }

    var Root = tcb.getRoot(),
        o = Root.Order

    var renderEventMap = {
        // 页内组件输出

        // 输出评估检测报告
        assessDetectReport: bindEventAssessDetectReport,

        // 输出下单表单
        orderSubmit: bindEventOrderSubmit,

        // 到店列表事件
        daoDianShopList: bindEventSelectDaoDianShop,

        // 输出评估报告
        assessReport: bindEventAssessReport,

        xxgApplyGoodPrice: bindEventXxgApplyGoodPrice

    }

    o.event = function (event_key) {
        var
            event_fn = o.noop
        if (event_key) {
            event_fn = typeof renderEventMap[event_key] === 'function'
                ? renderEventMap[event_key]
                : event_fn
        }
        return event_fn
    }

    tcb.mix(o.event, {

        init: initEvent,
        // 单独绑定指定服务方式的下单事件
        shangMenOrderSubmit: __submitShangMenForm,
        shangMenOrderSubmitFengxiu: __submitShangMenFormFengxiu,
        youJiOrderSubmit: __submitYouJiForm,
        youJiOrderSubmitFengXiuSuNing: __submitYouJiFormFengXiuSuNing,
        daoDianOrderSubmit: __submitDaoDianForm,
        citySelectInst: null
    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    function initEvent() {
        var
            $Target = o.getDoc()

        tcb.bindEvent($Target[0], {
            /**
             * 苏宁回收红包二维码
             * @param e
             */
            '.js-show-hs-redpack': function (e) {
                e.preventDefault()
                doGetTuijianQrcode(function (res) {
                    var img_url = res.result
                    tcb.imageOnload(img_url, function (img_obj) {
                        var html_str = '<p class="redpack-tit"> <i class="icon-redpack"></i>请用户扫码领红包</p><image src="' + img_url + '"/><p style="color: #fff;width: 2rem;margin: .1rem auto;">注意：此二维码为动态二维码，如需二次扫码请关闭弹窗重新生成</p>'
                        tcb.showDialog(html_str, {
                            className: 'dialog-hs-redpack',
                            middle: true
                        })
                    })
                })
            },
            //苏宁线下门店，换新优惠，展示二维码
            '.js-show-hs-hxbt': function (e) {
                e.preventDefault()
                var html_str = $.tmpl($.trim($('#JsMXxgSuNingHxbtTpl').html()))({})
                // var config = {
                //                 //     withMask: true,
                //                 //     middle: true,
                //                 //     withClose : false,
                //                 // }
                // tcb.showDialog(html_str, config)
                $('body').append(html_str)
            },
            '.js-show-hs-tmall-redpack': function (e) {
                e.preventDefault()
                doGetTmallRedpackQrcode(function (res) {
                    var img_url = res.result
                    tcb.imageOnload(img_url, function (img_obj) {
                        var html_str = '<p class="redpack-tit"> <i class="icon-tmall-redpack"></i>请用户扫码领红包</p><image src="' + img_url + '"/><p style="color: #fff;width: 2rem;margin: .1rem auto;">注意：此二维码为动态二维码，如需二次扫码请关闭弹窗重新生成</p>'
                        tcb.showDialog(html_str, {
                            className: 'dialog-hs-redpack',
                            middle: true
                        })
                    })
                })
            },
            '.hxbt_button': function (e) {
                e.preventDefault()
                $('.mask').remove()

            },
            /**
             * 点击提交表单按钮
             * @param e
             */
            '#BtnSubmitOrderForm': function (e) {

                e.preventDefault()

                // 合作商内嵌app，
                // 没有下单表单，直接返回
                var
                    $BlockDetectPartnerOrderSubmit = $('.block-detect-partner-order-submit')
                if ($BlockDetectPartnerOrderSubmit && $BlockDetectPartnerOrderSubmit.length) {
                    o.interact.scrollToTop($BlockDetectPartnerOrderSubmit.eq(0), true)

                    return
                }

                var
                    $Label = $Target.find('.row-hs-style-check')

                if (!o.valid.checkLabel($Label)) {
                    return
                }

                var
                    $Form = $Label.filter('.row-hs-style-checked').closest('.block-order-style').find('form')

                if ($Form && $Form.length) {

                    // 触发表单提交
                    $Form.trigger('submit')
                }
            },

            /**
             * 以旧换新，删除旧机
             * @param e
             */
            '.product-item-old-del': function (e) {
                e.preventDefault()

                var
                    $me = $(this),
                    $Item = $me.closest('.product-item-old')

                // 删除旧机
                __deleteOldProduct($Item)
            },
            /**
             * 天猫kindle以旧换新下单页补贴说明提示
             * @param e
             */
            '.btn-butie-dialog-trigger': function (e) {
                e.preventDefault()

                var html_str = $.tmpl($.trim($('#JsMHdTmallKindleButieDetailsDialogTpl').html()))({})
                var config = {
                    withMask: true,
                    className: 'dialog-kindle-butie-details-wrap',
                    middle: true
                }
                tcb.showDialog(html_str, config)
            },

            /**
             * 显示评估报告
             * @param e
             */
            '.btn-show-assess-report': function (e) {
                e.preventDefault()

                // 输出店铺列表
                o.interact.swipeIn({
                    selector: '.assess-report-section',
                    data: {
                        assess_key: o.data.url_query['assess_key']
                    },
                    render: 'assessReport',
                    percent: 100,
                    complete: function () {}
                })

            },

            // suning spread 立即卖出
            '.btn-trigger-suning-spread-sale': function (e) {
                e.preventDefault()

                var html_fn = $.tmpl($.trim($('#JsMSuningSpreadZhimacreditOrderAuthPanelTpl').html())),
                    html_st = html_fn()

                var config = {
                    withMask: true,
                    className: 'dialog-suning-spread-zhimacredit-auth',
                    middle: true
                }
                tcb.showDialog(html_st, config)
            },
            '.btn-suning-spread-zhimacredit-auth': function (e) {
                $.dialog.toast('即将为您跳转支付宝app进行授权。<br>如果打开支付宝app失败，<br>您可点击“直接下单，回收成功后立即拿钱”~', 4000)
                setTimeout(function () {
                    $.dialog.toast('尝试打开支付宝app失败。<br>您可点击“直接下单，回收成功后立即拿钱”~', 2000)
                }, 4001)
            },
            // 价格申请
            '.js-trigger-xxg-apply-good-price': function (e) {
                e.preventDefault()

                o.interact.swipeIn({
                    selector: '.xxg-apply-good-price-section',
                    data: {
                        pinggu_price: $('#AssessedModelPrice').attr('data-price'),
                        assess_key: o.data.url_query['assess_key']
                    },
                    render: 'xxgApplyGoodPrice',
                    percent: 100,
                    complete: function () {

                    }
                })
            }
        })
    }

    //获取推荐红包动态二维码
    function doGetTuijianQrcode(callback) {
        $.ajax({
            url: '/m/doGetTuijianQrcode',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (!res.errno) {
                    typeof callback === 'function' && callback(res)
                } else {
                    $.dialog.toast(res.errmsg)
                }
            },
            fail: function (e) {
                $.dialog.toast('网络错误，请重试')
            }
        })
    }

    function doGetTmallRedpackQrcode(callback) {
        $.ajax({
            url: '/m/getTmallCouponsWechatQRCode',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (!res.errno) {
                    typeof callback === 'function' && callback(res)
                } else {
                    $.dialog.toast(res.errmsg)
                }
            },
            fail: function (e) {
                $.dialog.toast('网络错误，请重试')
            }
        })
    }

    // 评估检测报告输出后，绑定事件
    function bindEventAssessDetectReport($Target) {
        if (!($Target && $Target.length)) {
            return
        }

    }

    // 评估报告输出后，绑定事件
    function bindEventAssessReport($Target) {
        if (!($Target && $Target.length)) {
            return
        }

    }

    // 表单提交输出后，绑定事件
    function bindEventOrderSubmit($Target) {
        if (!($Target && $Target.length)) {
            return
        }

        // 江苏移动切换收款方式
        __payoutMethodChangeOfJiangSuYiDong($Target)

        // 绑定input通用方法
        __inputEvent($Target)

        // 初始化城市触发器
        __citySelect()

        // 选择服务时间
        __timeSelect()

        // 选择银行地区
        __bankAreaSelect()

        // 选择服务方式
        __checkServiceType($Target)

        // 绑定表单提交
        __submitShangMenForm($Target)
        __submitShangMenFormFengxiu($Target)
        __submitDaoDianForm($Target)
        __submitYouJiForm($Target)
        __submitYouJiFormFengXiuSuNing($Target)
        __submitDaoDianBudanForm($Target)

        // 使用优惠码
        __usePromo($Target)

        tcb.bindEvent($Target, {
            /**
             * 触发到店回收的门店选择
             * @param e
             */
            '.daodian-addr-select-trigger': function (e) {
                e.preventDefault()

                // 输出店铺列表
                o.interact.swipeIn({
                    selector: '.daodian-addr-select-section',
                    data: {
                        shop_list: window.__DaoDianShopList || []
                    },
                    render: 'daoDianShopList',
                    percent: 80,
                    complete: function () {
                        $('#SwipeSectionMask').css('backgroundColor', 'rgba(0, 0, 0, 0.3)')
                    }
                })
            },

            /**
             * 手机号码输入
             */
            '[name="tel"]': {
                'keyup change': function (e) {
                    var
                        $me = $(this),
                        mobile = $.trim($me.val())

                    if (!tcb.validMobileInput(mobile)) {
                        $me.val(mobile.replace(/\D/g, ''))
                    }
                }
            },

            /**
             * 处理银行卡格式
             */
            '[name="pay_account"]': {
                'keyup change': function (e) {
                    var
                        $me = $(this)
                    $me.val($me.val().replace(/\D/g, ''))
                }
            },

            /**
             * 刷新图片验证码
             * @param e
             */
            '.vcode-img': function (e) {
                var
                    $me = $(this),
                    $secode_img = $('.vcode-img'),
                    $secode = $('[name="secode"]'),
                    src = tcb.setUrl2('/secode/?rands=' + Math.random())

                $secode_img.attr('src', src).attr('data-out-date', '')

                $secode.val('')

                $me.closest('.row').find('[name="secode"]').focus()
            },

            /**
             * 手机验证码(上门、到店、邮寄)
             * @param e
             */
            '.btn-send-vcode': function (e) {
                e.preventDefault()

                var $me = $(this),
                    $form = $me.closest('form'),
                    $mobile = $form.find('[name="tel"]'),
                    $pic_secode = $form.find('[name="secode"]'),
                    $sms_type = $form.find('[name="sms_type"]'),
                    $vcode_img = $form.find('.vcode-img')

                if ($me.hasClass('hsbtn-vcode-dis')) {
                    return
                }

                if ($vcode_img.attr('data-out-date')) {
                    $vcode_img.trigger('click')
                }

                if (!o.valid.seCode($me)) {
                    return
                }

                var mobile = tcb.trim($mobile.val() || '')
                if (window.__IS_XXG_IN_SUNING && $me.attr('data-sn-member') != mobile) { // 苏宁店家APP内，下单前需要先校验手机号是否为苏宁会员
                    o.valid.isSnMember({mobile: mobile}, function (flag, errmsg) {
                        if (flag) {
                            // 表示为苏宁会员，校验通过
                            $me.attr('data-sn-member', mobile)
                            $me.trigger('click')
                        } else {
                            $.dialog.alert('<div class="grid column justify-center align-center">' +
                                '<div style="font-size: .14rem;color: #000;">不是有效的苏宁会员</div>' +
                                '<div style="padding: .08rem 0;text-align: center;">请让用户使用微信扫码注册会员<br>或返回修改手机号</div>' +
                                '<div style="width: 1.6rem;height: 1.6rem; background: transparent url(https://p0.ssl.qhimg.com/t01c4a767e6ac524a67.jpg) no-repeat center;background-size: contain;"></div>' +
                                '</div>', null, {
                                btn: '关闭'
                            })
                        }
                    })
                    return false
                }

                o.data.getSeCode({
                    'mobile': $.trim($mobile.val()),
                    'pic_secode': $.trim($pic_secode.val()),
                    'sms_type': $.trim($sms_type.val())
                }, function (data, errno) {
                    if (errno) {
                        $me.removeClass('hsbtn-vcode-dis')
                        $vcode_img.trigger('click')
                    } else {
                        $me.addClass('hsbtn-vcode-dis').html('60秒后再次发送')
                        $vcode_img.attr('data-out-date', '1')

                        tcb.distimeAnim(60, function (time) {
                            if (time <= 0) {
                                $me.removeClass('hsbtn-vcode-dis').html('发送验证码')
                            } else {
                                $me.html(time + '秒后再次发送')
                            }
                        })
                    }
                }, function () {
                    $.dialog.toast('系统错误，请稍后重试', 2000)
                })
            },

            /**
             * 切换邮寄回收收款方式（支付宝、银行卡、微信）
             * @param e
             */
            '.payout-method-item': function (e) {
                e.preventDefault()

                var
                    $me = $(this),
                    $Form = $me.closest('form')

                $Form.find('.payout-method-item.b-radius-green').removeClass('b-radius-green')
                $me.addClass('b-radius-green')

                var
                    $pay_info = $Form.find('.block-pay-info'),
                    $common_info = $Form.find('.block-common-info'),
                    rel = $me.attr('data-rel')

                if (rel == 'wechat') {
                    // 切换为微信收款

                    $('.row-hs-style-check .desc').text(' + 送现金红包')

                    if (window.__is_wechat && o.data.url_query['weixin_pay'] != '1' && !window.__is_daodian_qft_n_weixin) {
                        // 在微信内打开，并且没有weixin_pay=1（直接跳转到带weixin_pay参数为1的地址）
                        // 并且，非修修哥奇付通补单

                        window.location.href = tcb.setUrl2(window.location.href, {
                            'weixin_pay': '1',
                            'city_name': $('.trigger-select-city').attr('data-city')
                        })

                    } else {

                        // 非微信打开，或者 o.data.url_query['weixin_pay'] == '1'

                        if (!window.__is_wechat || window.__is_daodian_qft_n_weixin) {
                            // 非微信打开，o.data.url_query['weixin_pay']可能为'1'，也可能非'1'
                            // 或者，修修哥奇付通补单

                            $pay_info
                                .hide()
                                .filter(function () {return $(this).attr('data-for') === 'other-' + rel})
                                .show()
                                .find('.js-trigger-change-back-payout-account')
                                .hide()
                            $common_info.hide()

                        } else {
                            // 微信内打开 && o.data.url_query['weixin_pay'] == '1'
                            // 此处无 o.data.url_query['weixin_pay']为非'1'的情况，因为非'1'情况下，会提前跳转到 o.data.url_query['weixin_pay']为'1'的地址

                            $pay_info
                                .hide()
                                .filter(function () {return $(this).attr('data-for') === rel})
                                .show()
                            $common_info.show()
                        }

                    }

                } else {

                    if (__is_send_redpackage) {

                        $('.row-hs-style-check .desc').text('')
                    } else {
                        if (!__is_youji) {
                            $('.row-hs-style-check .desc').html('&nbsp;')
                        } else {
                            $('.row-hs-style-check .desc').text(' 满' + __reach_price + '+' + __add_price)
                        }

                    }


                    // 非微信收款，一切如旧

                    $pay_info
                        .hide()
                        .filter(function () {return $(this).attr('data-for') === rel})
                        .show()
                    $common_info.show()
                }

                o.interact.resizeScrollInnerHeight()
            },

            /**
             * 使用其他微信账号收款
             * @param e
             */
            '.js-trigger-change-payout-account': function (e) {
                e.preventDefault()

                var
                    $me = $(this),
                    $Form = $me.closest('form'),
                    $pay_info = $Form.find('.block-pay-info'),
                    $common_info = $Form.find('.block-common-info')

                $common_info.hide()
                $pay_info.hide()
                         .filter(function () {
                             return $(this).attr('data-for') === 'other-wechat'
                         }).show()
            },

            /**
             * 返回使用当前微信账号收款
             * @param e
             */
            '.js-trigger-change-back-payout-account': function (e) {
                e.preventDefault()

                var
                    $me = $(this),
                    $Form = $me.closest('form'),
                    $pay_info = $Form.find('.block-pay-info'),
                    $common_info = $Form.find('.block-common-info')

                $common_info.show()
                $pay_info.hide()
                         .filter(function () {
                             return $(this).attr('data-for') === 'wechat'
                         }).show()
            },
            /**
             * 点击按钮，改变p-type的值 1代表大陆 2代表香港
             * @param e
             */
            '.js-change-type': function (e) {
                e.preventDefault()
                var
                    $me = $(this),
                    $Form = $me.closest('form'),
                    $p_type = $Form.find('input[name="p_type"]'),
                    $mobile = $Form.find('input[name="tel"]'),
                    p_type = $p_type.val()
                $mobile.attr('maxlength') == '11' ? $mobile.attr('maxlength', '8') : $mobile.attr('maxlength', '11')
                $p_type.val(p_type == '1' ? '2' : '1')
                if ($p_type.val() == '1') {
                    $('.isShowImg_Phone').css('display', 'block')
                } else {
                    $('.isShowImg_Phone').css('display', 'none')
                }
            }
        })

    }


    // =================================================================
    // 私有接口 private
    // =================================================================

    // 江苏移动切换收款方式
    function __payoutMethodChangeOfJiangSuYiDong($Target) {
        var $PayoutMethod = $Target.find('.row-jiangsu-yidong-payout-method')

        if (!($PayoutMethod && $PayoutMethod.length)) {
            return
        }

        $PayoutMethod.on('click', function (e) {
            var $me = $(this)

            if ($me.hasClass('row-jiangsu-yidong-payout-method-disabled')) {
                return
            }

            var $Checked = $me.find('.payout-method-radio-checked')

            if ($Checked.length) {
                return
            }

            var $Form = $me.closest('form'),
                payout_method = $me.attr('data-pay-method')
            $Form.find('.block-sub-order-form').hide()
            $Form.find('[name="pay_method"]').val(payout_method)

            $PayoutMethod.find('.payout-method-radio-checked').removeClass('payout-method-radio-checked')
            $me.find('.payout-method-radio').addClass('payout-method-radio-checked')

            $me.find('.block-sub-order-form').show()

            setTimeout(function () {
                o.interact.scrollToTop($Form, true)
            }, 200)
        })
    }

    // 选择服务时间
    function __timeSelect() {
        // 选择服务时间
        var datetimeObj = new $.datetime('[name="server_time"]', {
            remote: tcb.setUrl2('/aj/doGetValidDateByRecovery'),
            noStyle: true
        })

        tcb.cache('SHANG_MEN_DATETIME_OBJ', datetimeObj)
    }

    // 选中到店店铺
    function bindEventSelectDaoDianShop($Target) {
        if (!($Target && $Target.length)) {
            return
        }

        $Target.find('.daodian-shop-item').on('click', function (e) {
            e.preventDefault()

            var
                $me = $(this),
                $trigger = $('.daodian-addr-select-trigger'),
                $row = $trigger.closest('.row-daodian-addr-select'),
                shop_id = $me.attr('data-id'),
                shop_price = $me.attr('data-price'),
                shop_tel = $me.attr('data-tel')

            $trigger.html($me.html()).removeClass('default')
            $row.addClass('selected')

            $('[name="shop_id"]').val(shop_id)

            var
                daodian_fare = shop_price ? '报销' + shop_price + '元路费' : ''

            $('#DaodianFare').html(daodian_fare)

            var
                daodian_addr = '<span class="hs-daodian-addr">下单后，请您带旧机到' + $me.find('.s-name').html() + '（' + $me.find('.s-addr').html() + '）'
            //if (shop_price) {
            //    daodian_addr += '，交易成功补贴' + shop_price + '元！'
            //}
            daodian_addr += '</span>'
            if (shop_tel) {
                daodian_addr += '<br> 360客服电话：<span style="color:#2e74d3" href="tel:' + shop_tel + '">' + shop_tel + '</span>'
            }
            $('#DaodianAddrTips').html(daodian_addr)

            // 关闭选择层
            o.interact.swipeOut()

        })

    }

    // 选择服务方式
    function __checkServiceType($Target) {
        var $checkLine = $Target.find('.row-hs-style-check')
        //回收类型切换效果
        $checkLine.on('click', function (e) {
            e.preventDefault()
            var $t = $(e.target),
                $me = $(this),
                $common_info = $me.closest('.block-order-shangmen').find('.block-common-info')

            if ($me.attr('data-no-click') == '1') {
                $.dialog.toast($me.attr('data-no-click-text') || '当前城市尚未开通上门回收', 3000)
                return
            }

            // 显示完整的上门地址弹窗
            if ($t.attr('id') === 'OrderShangMenArea' && !$t.attr('data-no-alert')) {
                e.stopPropagation()

                $.dialog.alert('<p>' + $t.html() + '</p>')

                return false
            }

            // 已经选中
            if ($me.hasClass('row-hs-style-checked')) {
                return false
            }

            var
                $next = $me.next(),
                $blockOrderStyle = $me.closest('.block-order-style'),
                $checked = $('.row-hs-style-checked')

            //// 切换到邮寄回收，刷新图形验证码
            //if ($me.closest ('.block-order-style').attr ('data-type') == '3') {
            //
            //    $ ('.vcode-img').attr ('src', '/secode/?rands=' + Math.random ())
            //}

            if (!($checked && $checked.length)) {
                // 第一次点击选择回收方式，刷新secode

                __refreshSeCode()
            } else {
                $checked.removeClass('row-hs-style-checked')
                $checked.find('.icon-circle')
                        .addClass('b-radius-circle')
                        .removeClass('icon-zhifuchenggong')
            }

            $('.block-order-form').hide()

            var service_type = $blockOrderStyle.attr('data-type')

            if (service_type == '5' || service_type == '404') {
                // 扫码回收
                $('.block-btn').hide()
            } else {
                $('.block-btn').show()
            }

            // 选择邮寄回收时默认选中微信支付
            // 如果存在苏宁小店的时候,则默认选中苏宁小店
            var suning_tuijian = $Target.find('.payout-method-snpay')

            if (service_type == '3' && !suning_tuijian.length) {
                $Target.find('.payout-method-wechat').trigger('click')
            }
            //如果点击的是上门，则显示公共选项
            if (service_type == '1') {
                $common_info.show()
            }
            //如果点击的是上门，而且此时上门支持微信、支付宝、银行卡支付，那么默认选择微信支付
            if (service_type == '1' && window.M_SHOW_OFFLINE_PAYOUT) {
                $Target.find('.payout-method-wechat').trigger('click')
            }

            // 显示动画
            $me.find('.icon-circle')
               .addClass('icon-zhifuchenggong')
               .removeClass('b-radius-circle')
            $me.addClass('row-hs-style-checked')
               .animate({
                   'opacity': 0
               }, 0, function () {
                   $me.animate({
                       'opacity': 1
                   }, 400)
               })
               .next().show()
               .animate({
                   'opacity': 0,
                   'translateY': '-' + $me.height() + 'px'
               }, 0, function () {

                   $next.animate({
                       'opacity': 1,
                       'translateY': '0'
                   }, 400, 'ease-in', function () {
                       setTimeout(function () {
                           //var $first = $next.find ('[type="text"],[type="tel"]').first ()

                           if (!$me.attr('data-no-scroll-to-top')) {
                               o.interact.scrollToTop($me, true, function () {
                                   //$first.focus ()
                               })
                           } else {
                               o.interact.resizeScrollInnerHeight()
                           }

                       }, 200)
                   })

               })
        })
        __userAddress()
    }

    //选择用户收获地址
    function __userAddress() {
        var
            options = {
                // 实例化的时候自动执行init函数
                flagAutoInit: true,
                selectorTrigger: '.user_address',
                not_render: true,
                callback_cancel: null,
                callback_confirm: function (region) {
                    //console.log(region)
                    $('[name="province"]').val(region['province_id'])
                    $('[name="city"]').val(region['city_id'])
                    $('[name="area"]').val(region['area_id'])
                    $('.user_address').text(region['province'] + '  ' + region['city'] + '  ' + region['area'])

                }
            }

        // 初始化省/市/区县选择器
        Bang.AddressSelect(options)
    }

    // 选择城市
    function __citySelect() {
        var $trigger = $('.trigger-select-city')

        // 禁止城市选择
        if ($trigger.hasClass('disabled')) {
            $trigger.on('click', function (e) {
                e.preventDefault()
                $.dialog.toast('无法切换城市', 2000)
            })
            return
        }

        var province = $trigger.attr('data-province') || '',
            city = $trigger.attr('data-city') || '',
            area = $trigger.attr('data-area') || '',
            options = {
                // 实例化的时候自动执行init函数
                flagAutoInit: true,
                selectorTrigger: '.trigger-select-city',
                province: province,
                city: city,
                area: area,
                show_city: true,
                show_area: true,
                not_render: true,
                callback_cancel: null
                // callback_confirm : function (region) {
                //     region = region || {}
                //
                //     var city = region['city'] || '',
                //         city_id = region['city_id'] || '',
                //         province = region['province'] || '',
                //         province_id = region['province_id'] || ''
                //
                //     // 城市切换没有任何变化，那么不做任何处理
                //     if ($trigger.attr ('data-city') === city) {
                //         return
                //     }
                //
                //     // 设置全局的省、市信息
                //     window.__Province['id'] = province_id
                //     window.__Province['name'] = province
                //     window.__Province['code'] = ''
                //     window.__City['id'] = city_id
                //     window.__City['name'] = city
                //     window.__City['code'] = ''
                //
                //     o.handle.citySelectDone ($trigger, region, function(){
                //         if(window.__IS_PARTNER_LIDIANHUISHOU&&window.__IS_SUPPORT_SHANGMEN){
                //             window.__TPL_TYPE_DATA['order_server_type_default']=1
                //         }else{
                //             window.__TPL_TYPE_DATA['order_server_type_default']=3
                //         }
                //         // 判断是否有需要默认被选中的服务方式，如若有，那么将其选中展开
                //         var order_server_type_default = window.__TPL_TYPE_DATA['order_server_type_default']
                //         if (order_server_type_default){
                //             if(window.__IS_PARTNER_FENGXIU_FENGXIU) {
                //                 var $noClick=$('.m-huishou-partner-fengxiu-suning .block-order-shangmen .row-hs-style-check')
                //                 var $adderssTips = $('#OrderShangMen')
                //                 if(city=='北京'){
                //                     $noClick.attr("data-no-click",'0')
                //                     $noClick.attr("data-no-click-text",'')
                //                     $adderssTips.html('限北京东城/西城/朝阳/海淀/通州区')
                //                 } else {
                //                     order_server_type_default = 3
                //                     // 如果默认定位的城市不是北京，那么给上门回收增加标识，不可点击
                //                     $noClick.attr("data-no-click",'1')
                //                     $noClick.attr("data-no-click-text",'当前城市尚未开通上门回收')
                //                     $adderssTips.html('当前城市尚未开通')
                //                 }
                //             }else if(window.__IS_PARTNER_LIDIANHUISHOU){
                //                 //离店回收
                //                 var $notClick=$('.m-huishou-partner-ldhs .block-order-shangmen .row-hs-style-check')
                //                 var $adderssTips = $('#OrderShangMenArea')
                //                 if(window.__IS_SUPPORT_SHANGMEN){
                //                     $notClick.attr("data-not-click",'0')
                //                     $notClick.attr("data-not-click-text",'')
                //                 } else {
                //                     order_server_type_default = 3
                //                     $notClick.attr("data-not-click",'1')
                //                     $notClick.attr("data-not-click-text",'当前城市尚未开通上门回收')
                //                     $adderssTips.show()
                //                     $adderssTips.html('当前城市尚未开通')
                //                 }
                //
                //             }
                //             var $BlockOrderStyle = $('.block-order-style[data-type="'+order_server_type_default+'"]'),
                //                 $RowHSStyleCheck = $BlockOrderStyle.find ('.row-hs-style-check')
                //
                //             if (!($RowHSStyleCheck && $RowHSStyleCheck.length && $RowHSStyleCheck.height())) {
                //                 return
                //             }
                //
                //             // 设置不将回收方式选择tab滚动到顶部
                //             $RowHSStyleCheck.attr('data-no-scroll-to-top', '1').trigger ('click')
                //
                //             setTimeout(function(){
                //                 $RowHSStyleCheck.attr('data-no-scroll-to-top', '')
                //             }, 1500)
                //         }
                //     })
                // }
            }

        if (window.__IS_SUNING_YUNDIAN_MINIAPP) {
            // 苏宁云店miniAPP
            options.show_area = false
            options.show_area = false
            options.flagStorage = false
            options.url_province = '/yigou/doGetYundianProvinceList'
            options.url_city_area = '/yigou/doGetYundianProvinceLinkage'
            // 初始化省/市/区县选择器
            o.event.citySelectInst = Bang.AddressSelect(options)
        } else {
            var clientLocation = window.__CLIENT_LOCATION || {}
            options.province = clientLocation && clientLocation.province && clientLocation.province.name
            options.city = clientLocation && clientLocation.city && clientLocation.city.name
            options.area = clientLocation && clientLocation.area && clientLocation.area.name
            options.selectorProvince = '[name="ad_province_code"]'
            options.selectorCity = '[name="ad_city_code"]'
            options.selectorArea = '[name="ad_area_code"]'
            options.flagAutoInit = false // 不做自动初始化
            // 初始化省/市/区县选择器
            o.event.citySelectInst = Bang.AddressSelect2(options)
        }
    }


    function __inputEvent($Target) {
        $Target.find('input').on({
            'focus': function (e) {
                var
                    $me = $(this),
                    type = $me.attr('type').toString().toLowerCase(),
                    types = [
                        'checkbox', 'radio', 'button', 'file', 'image', 'hidden', 'reset'
                    ]

                if (tcb.inArray(type, types) > -1) {
                    return
                }

                //$ ('.block-btn').hide ()

                o.interact.resizeScrollInnerHeight($me)
            },
            'blur': function (e) {
                //$ ('.block-btn').show ()

            }
        })
    }


    // 选择银行地区
    function __bankAreaSelect() {
        new bankAreaSelector('#provenceSelect', '#citySelect', '#YouJiSaleForm [name="bank_area"]', __bankArea)
        new bankAreaSelector('#provenceSelect_sm', '#citySelect_sm', '#ShangMenSaleForm [name="bank_area"]', __bankArea)
        new bankAreaSelector('#provenceSelect', '#citySelect', '#DaoDianBudanSaleForm [name="bank_area"]', __bankArea)
        new bankAreaSelector('#provenceSelect', '#citySelect', '#ShangMenSaleFormFengxiu [name="bank_area"]', __bankArea)
        new bankAreaSelector('#provenceSelect_fxsn', '#citySelect_fxsn', '#YouJiSaleFormFengXiuSuNing [name="bank_area"]', __bankArea)
    }

    function __usePromo($Target) {
        var
            $UsePromo = $Target.find('.use-promo-wrap')
        // 使用优惠码
        $UsePromo.forEach(function (el, i) {
            var wWrap = $(el)
            // 使用优惠码
            tcb.usePromo({
                'service_type': 2,
                'product_id': '',
                'price': $('#AssessedModelPrice').attr('data-price'),
                'request_params': {
                    assess_key: tcb.queryUrl(window.location.search, 'assess_key')
                },
                'wWrap': wWrap,
                'succ': function (youhuiPrice, min_sale_price, wWrap) {
                    wWrap.find('.promoYZ').html('优惠码有效，卖出可多收' + youhuiPrice + '元').removeClass('promo-fail').addClass('promo-succ')
                },
                'fail': function (wWrap) {

                },
                'onActive': function (wWrap) {
                    o.interact.resizeScrollInnerHeight()
                }
            })
        })
    }

    // 上门回收
    function __submitShangMenForm($Target) {
        var
            $Form = $Target.find('#ShangMenSaleForm')
        __bindFormSubmit({
            $form: $Form,
            $btn: $('#BtnSubmitOrderForm'),
            valid: window.__HDID ? 'huanXinShangMenForm' : 'shangMenForm',
            post: 'postShangMenForm',
            before: function ($Form) {
                var
                    $pay_channel = $Form.find('[name="pay_channel"]'),
                    $bank_name = $Form.find('[name="bank_name"]'),
                    $bank_area = $Form.find('[name="bank_area"]'),
                    $pay_account = $Form.find('[name="pay_account"]'),
                    $account_holder = $Form.find('[name="account_holder"]'),
                    $alipay_id = $Form.find('[name="alipay_id"]'),
                    $alipay_name = $Form.find('[name="alipay_name"]')

                if (!window.M_SHOW_OFFLINE_PAYOUT) {
                    // 银行卡收款
                    $bank_name.val('-1')
                    $bank_area.val('')
                    $pay_account.val('')
                    $account_holder.val('')
                    // 支付宝收款
                    $alipay_id.val('')
                    $alipay_name.val('')
                }

                // 将银行名称+银行地区的值，
                // 设置到支付通道
                $pay_channel.val($bank_name.val() + '|' + $bank_area.val())
            },
            after: function (data, errno) {
                if (errno) {
                    //$.dialog.toast ('系统异常，请重试')

                    return
                }

                // 将已经下单的assess_key存入sessionStorage以备用
                var assess_key = $Form.find('[name="assess_key"]').val()
                if (tcb.supportSessionStorage()) {
                    sessionStorage.setItem(assess_key, '1')
                }

                __redirectUrlAfterSubmit({
                    'order_id': data['parent_id']
                })
            }
        })
    }

    // 丰修上门回收
    function __submitShangMenFormFengxiu($Target) {
        var
            $Form = $Target.find('#ShangMenSaleFormFengxiu')
        __bindFormSubmit({
            $form: $Form,
            $btn: $('#BtnSubmitOrderForm'),
            valid: 'shangMenFormFengxiu',
            post: 'postShangMenForm',
            before: function ($Form) {
                var
                    $pay_channel = $Form.find('[name="pay_channel"]'),
                    $bank_name = $Form.find('[name="bank_name"]'),
                    $bank_area = $Form.find('[name="bank_area"]')

                // 将银行名称+银行地区的值，
                // 设置到支付通道
                $pay_channel.val($bank_name.val() + '|' + $bank_area.val())
            },
            after: function (data, errno) {
                if (errno) {
                    //$.dialog.toast ('系统异常，请重试')

                    return
                }

                // 将已经下单的assess_key存入sessionStorage以备用
                var assess_key = $Form.find('[name="assess_key"]').val()
                if (tcb.supportSessionStorage()) {
                    sessionStorage.setItem(assess_key, '1')
                }

                __redirectUrlAfterSubmit({
                    'order_id': data['parent_id']
                })

            }
        })
    }

    // 到店回收
    function __submitDaoDianForm($Target) {
        var
            $Form = $Target.find('#DaoDianSaleForm')
        __bindFormSubmit({
            $form: $Form,
            $btn: $('#BtnSubmitOrderForm'),
            valid: window.__HDID ? 'huanXinDaoDianForm' : 'daoDianForm',
            post: 'postDaoDianForm',
            before: function ($Form) {},
            after: function (data, errno) {
                if (errno) {
                    //$.dialog.toast ('系统异常，请重试')

                    return
                }

                // 将已经下单的assess_key存入sessionStorage以备用
                var assess_key = $Form.find('[name="assess_key"]').val()
                if (tcb.supportSessionStorage()) {
                    sessionStorage.setItem(assess_key, '1')
                }

                __redirectUrlAfterSubmit({
                    'order_id': data['parent_id']
                })
            }
        })
    }

    // 到店回收
    function __submitDaoDianBudanForm($Target) {
        var
            $Form = $Target.find('#DaoDianBudanSaleForm')
        __bindFormSubmit({
            $form: $Form,
            $btn: $('#BtnSubmitOrderForm'),
            valid: 'daoDianBudanForm',
            post: 'postDaoDianForm',
            before: __beforeSubmitDaoDianBuDanForm,
            afterValid: __afterValidDaoDianBuDanForm,
            after: __afterSubmitDaoDianBuDanForm
        })
    }

    // 邮寄回收表单
    function __submitYouJiForm($Target) {
        var
            $Form = $Target.find('#YouJiSaleForm')

        __bindFormSubmit({
            $form: $Form,
            $btn: $('#BtnSubmitOrderForm'),
            valid: window.__HDID ? 'huanXinYouJiForm' : 'youJiForm',
            post: 'postYouJiForm',
            before: function ($Form) {
                if (window.__HDID) {
                    // 以旧换新，不需要验证银行相关信息

                    return
                }
                var
                    $pay_channel = $Form.find('[name="pay_channel"]'),
                    $bank_name = $Form.find('[name="bank_name"]'),
                    $bank_area = $Form.find('[name="bank_area"]')

                // 将银行名称+银行地区的值，
                // 设置到支付通道
                $pay_channel.val($bank_name.val() + '|' + $bank_area.val())
            },
            afterValid: function ($Form) {
                if (window.__IS_GOLD_ORDER) {
                    if (window.__IS_GOLD_ORDER_CONTINUE) {
                        window.__IS_GOLD_ORDER_CONTINUE = false
                    } else {
                        return continueGoldEngineerOrderPayment($Form)
                    }
                }
            },
            after: function (data, errno) {
                if (errno) {
                    return
                }

                // 将已经下单的assess_key存入sessionStorage以备用
                var assess_key = $Form.find('[name="assess_key"]').val()
                if (tcb.supportSessionStorage()) {
                    sessionStorage.setItem(assess_key, '1')
                }

                var
                    order_id = data['parent_id'], //'1701046319322003800'
                    redirect_params = {
                        'order_id': order_id
                    },
                    redirect_url = __redirectUrlAfterSubmit(redirect_params, true)

                // if (window.__HDID){
                //     // 活动邮寄回收
                //
                //     window.location.href = redirect_url
                // } else {
                // 普通邮寄回收
                //againOneOrder   存在 表示是再来一单的订单  所以不用填地址
                if (typeof YuyueKuaidi !== 'undefined' && !data['againOneOrder'] && !window.__GOLD_ORDER_HIDE_POST_ADDRESS) {
                    YuyueKuaidi.getGuoGuoForm && YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {

                        var
                            html_fn = $.tmpl(tcb.trim($('#JsMHSSchedulePickupPanelTpl').html())),
                            html_st = html_fn({
                                data: {
                                    province: window.__Province['name'],
                                    city: window.__City['name'],
                                    area_list: res['area_list'] || [],
                                    mobile: res['default_mobile'],
                                    order_id: order_id,
                                    url: redirect_url
                                }
                            })

                        var
                            DialogObj = tcb.showDialog(html_st, {
                                className: 'schedule-pickup-panel',
                                withClose: false,
                                middle: true,
                                onClose: function () {
                                    window.location.href = redirect_url
                                }
                            })

                        // 绑定预约取件相关事件
                        YuyueKuaidi.bindEventSchedulePickup(DialogObj.wrap, redirect_url)

                    })
                } else {
                    window.location.href = redirect_url
                }
                // }

            }
        })

    }

    // 邮寄丰修 in苏宁引流 回收表单
    function __submitYouJiFormFengXiuSuNing($Target) {
        var
            $Form = $Target.find('#YouJiSaleFormFengXiuSuNing')

        __bindFormSubmit({
            $form: $Form,
            $btn: $('#BtnSubmitOrderForm'),
            valid: window.__HDID ? 'huanXinYouJiForm' : 'youJiForm',
            post: 'postYouJiForm',
            before: function ($Form) {
                if (window.__HDID) {
                    // 以旧换新，不需要验证银行相关信息

                    return
                }
                var
                    $pay_channel = $Form.find('[name="pay_channel"]'),
                    $bank_name = $Form.find('[name="bank_name"]'),
                    $bank_area = $Form.find('[name="bank_area"]')

                // 将银行名称+银行地区的值，
                // 设置到支付通道
                $pay_channel.val($bank_name.val() + '|' + $bank_area.val())
            },
            afterValid: function ($Form) {
                if (window.__IS_GOLD_ORDER) {
                    if (window.__IS_GOLD_ORDER_CONTINUE) {
                        window.__IS_GOLD_ORDER_CONTINUE = false
                    } else {
                        return continueGoldEngineerOrderPayment($Form)
                    }
                }
            },
            after: function (data, errno) {
                if (errno) {
                    return
                }

                // 将已经下单的assess_key存入sessionStorage以备用
                var assess_key = $Form.find('[name="assess_key"]').val()
                if (tcb.supportSessionStorage()) {
                    sessionStorage.setItem(assess_key, '1')
                }

                var
                    order_id = data['parent_id'], //'1701046319322003800'
                    redirect_params = {
                        'order_id': order_id
                    },
                    redirect_url = __redirectUrlAfterSubmit(redirect_params, true)

                // if (window.__HDID){
                //     // 活动邮寄回收
                //
                //     window.location.href = redirect_url
                // } else {
                // 普通邮寄回收

                if (typeof YuyueKuaidi !== 'undefined' && !data['againOneOrder']) {
                    YuyueKuaidi.getGuoGuoForm && YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {

                        var
                            html_fn = $.tmpl(tcb.trim($('#JsMHSSchedulePickupPanelTpl').html())),
                            html_st = html_fn({
                                data: {
                                    province: window.__Province['name'],
                                    city: window.__City['name'],
                                    area_list: res['area_list'] || [],
                                    mobile: res['default_mobile'],
                                    order_id: order_id,
                                    url: redirect_url
                                }
                            })

                        var
                            DialogObj = tcb.showDialog(html_st, {
                                className: 'schedule-pickup-panel',
                                withClose: false,
                                middle: true,
                                onClose: function () {
                                    window.location.href = redirect_url
                                }
                            })

                        // 绑定预约取件相关事件
                        YuyueKuaidi.bindEventSchedulePickup(DialogObj.wrap, redirect_url)

                    })
                } else {
                    window.location.href = redirect_url
                }
                // }

            }
        })

    }

    function continueGoldEngineerOrderPayment($Form) {
        var data = tcb.queryUrl($Form.serialize() || '') || {}
        var html_fn = $.tmpl(tcb.trim($('#JsMHSDialogGoldEngineerOrderPaymentTpl').html())),
            html_st = html_fn({
                data: data
            })
        var inst = tcb.showDialog(html_st, {
            className: 'dialog-gold-engineer-order-payment',
            middle: true
        })
        inst.wrap.find('.js-trigger-gold-engineer-payment-submit').on('click', function (e) {
            e.preventDefault()
            var $me = $(this)
            var $dialogInner = $me.closest('.dialog-inner')
            var $advance_payment_amount = $dialogInner.find('[name="advance_payment_amount"]')
            var advance_payment_amount = parseFloat(tcb.trim($advance_payment_amount.val()))
            var int_advance_payment_amount = parseInt(tcb.trim($advance_payment_amount.val()), 10)
            if (advance_payment_amount <= 0 || int_advance_payment_amount !== advance_payment_amount) {
                return $.dialog.toast('支付金额应为大于0的整数')
            }
            $.dialog.confirm(
                '<div class="row"><div class="col-left-fixed">支付金额：</div><div class="col-right">' + advance_payment_amount + '</div></div>' +
                '<div class="row"><div class="col-left-fixed">支付宝收款人：</div><div class="col-right">' + data.alipay_name + '</div></div>' +
                '<div class="row"><div class="col-left-fixed">支付宝收款账号：</div><div class="col-right">' + data.alipay_id + '</div></div>',
                function () {
                    $Form.find('[name="advance_payment_amount"]').val(advance_payment_amount)
                    window.__IS_GOLD_ORDER_CONTINUE = true
                    tcb.closeDialog()
                    $Form.trigger('submit')
                }
            )
        })
        return false
    }

    // 绑定表单提交事件
    function __bindFormSubmit(options) {
        var
            $Form = options['$form']
        if (!($Form && $Form.length)) {
            return //console.error ('表单都没有，提交个串串？')
        }
        $Form.on('submit', function (e) {
            e.preventDefault()

            var
                $me = $(this)

            // before
            if (typeof options['before'] === 'function') {
                if (options['before']($Form) === false) {
                    // before函数返回值绝等于 false 时，直接返回退出表单提交

                    return
                }
            }

            // 验证表单
            if (options['valid'] && !o.valid[options['valid']]($Form)) {

                return console.error('表单验证失败了，检查检查呗～')
            }

            // afterValid
            if (typeof options['afterValid'] === 'function') {
                if (options['afterValid']($Form) === false) {
                    // afterValid函数返回值绝等于 false 时，直接返回退出表单提交

                    return
                }
            }

            var
                $Btn = options['$btn'] || $('#BtnSubmitOrderForm'),
                default_btn_text = $Btn.val()

            $Btn.addClass('btn-disabled').val('提交中...')

            // 提交表单数据
            o.data[options['post']]($me, function (data, errno) {

                if (errno) {
                    $Btn.removeClass('btn-disabled').val(default_btn_text)
                }

                // after
                typeof options['after'] === 'function' && options['after'](data, errno)

            }, function () {

                $.dialog.toast('系统异常，请重试')

                $Btn.removeClass('btn-disabled').val(default_btn_text)
            })

        })
    }

    // 删除旧机
    function __deleteOldProduct($Item) {
        var
            assess_key = $Item.attr('data-assess-key')

        // 删除购物车内回收机器item
        $.post('/huishou/doDelCart', {'assess_key': assess_key}, function (res) {
            res = JSON.parse(res)

            if (!res['errno']) {

                var
                    $Sib = $Item.siblings('.product-item-old')

                // 购物车中还有其他机器
                if ($Sib.length > 0) {
                    var
                        res_obj = res['result'],

                        customer_pay = res_obj.new_machine_price, // 客户支付金额（负数表示我们需要支付给用户的金额）
                        new_product_price = $('#HuanXinNewProduct').attr('data-price'), // 新机价格
                        old_product_price = new_product_price - customer_pay, // 旧机价格
                        samsung_butie_price = $('.samsung-butie').attr('data-butie-price')//三星以旧换新补贴

                    // 如有三星补贴，客户支付价格减去补贴价，否则减0
                    customer_pay -= samsung_butie_price || 0

                    var
                        str = ''
                    if (customer_pay < 0) {
                        // 客户可获得金额

                        str = '除了全新' + res_obj.model_name + '外您还能获得： <span class="final-price" id="AssessedModelPrice" data-price="' + old_product_price + '">' + Math.abs(customer_pay) + '元 '
                        if (window.__HDID == '8') {
                            str = '除了' + res_obj.model_name + '外您还能获得： <span class="final-price" id="AssessedModelPrice" data-price="' + old_product_price + '">' + Math.abs(customer_pay) + '元 '
                        }
                    } else {
                        // 客户支出金额

                        str = '换个新' + res_obj.model_name + '仅需：<span class="final-price" id="AssessedModelPrice" data-price="' + old_product_price + '">' + customer_pay + '元</span>'
                        if (window.__HDID == '8') {
                            str = '换个' + res_obj.model_name + '仅需：<span class="final-price" id="AssessedModelPrice" data-price="' + old_product_price + '">' + customer_pay + '元</span>'
                        }
                    }
                    $('.final-price-desc').html(str)

                    // 根据城市，机器价格，[hdid]，设置可用服务方式
                    var $triggerSelectCity = $('.trigger-select-city')
                    var ad_province_code = $triggerSelectCity.attr('data-province-code'),
                        ad_city_code = $triggerSelectCity.attr('data-city-code'),
                        ad_area_code = $triggerSelectCity.attr('data-area-code'),
                        city_name = $triggerSelectCity.attr('data-city')
                    var params = {
                        city_name: city_name,
                        assess_price: $('#AssessedModelPrice').attr('data-price')
                    }
                    if (ad_city_code) {
                        params.ad_province_code = ad_province_code
                        params.ad_city_code = ad_city_code
                        params.ad_area_code = ad_area_code
                    }
                    o.handle.setServiceType(params)

                    $Item.css({
                        'height': $Item.height()
                    })

                    $Item.animate({
                        'opacity': 0,
                        'height': '0px'
                    }, 400, function () {
                        $Item.remove()
                        $('.btn-add-more').show()
                    })

                } else {
                    // 删除购物车内最后一台回收的机器
                    // 跳转到m优品，重新选择换新
                    var
                        m_host = window.__MHOST

                    if (o.data.url_query['newproductid']) {
                        window.location.href = tcb.setUrl2(
                            m_host + '/youpin/product',
                            {'product_id': o.data.url_query['newproductid']},
                            ['newproductid']
                        )
                    } else {
                        window.location.href = tcb.setUrl2('/m/hs')
                    }
                }
            }

        })
    }

    // 刷新图形验证码
    function __refreshSeCode() {
        if (window.__is_secode_refreshing) {
            return
        }
        window.__is_secode_refreshing = true
        setTimeout(function () {
            var src = tcb.setUrl2('/secode/?rands=' + Math.random())
            $('.vcode-img').attr('src', src)

            window.__is_secode_refreshing = false
        }, 1)
    }

    // 到店补单表单处理函数
    // 提交表单之前，包括验证表单之前
    function __beforeSubmitDaoDianBuDanForm($Form) {
        if (!window.__IS_BUDAN_WITH_PAYMENT || !(window.__is_daodian_qft_n_weixin || window.__is_daodian_yifubao)) {
            // 非奇付通、非易付宝打款，那么不需要填写，并且也不需要弹出任何打款提示框，所以。。
            // dao_dian_bu_dan_confirm必须设置为true，以保证直接提交而不是弹出打款确认框

            if (!window.__IS_XXG_IN_SUNING) { // 苏宁店家APP内忽略以上逻辑，因为还需要做后续验证
                tcb.cache('dao_dian_bu_dan_confirm', true)
            }
        } else {
            var
                $pay_channel = $Form.find('[name="pay_channel"]'),
                $bank_name = $Form.find('[name="bank_name"]'),
                $bank_area = $Form.find('[name="bank_area"]')

            // 将银行名称+银行地区的值，
            // 设置到支付通道
            //console.log($bank_area.val ())
            $pay_channel.val($bank_name.val() + '|' + $bank_area.val())
        }
    }

    // 验证表单之后
    function __afterValidDaoDianBuDanForm($Form) {
        var
            dao_dian_bu_dan_confirm = tcb.cache('dao_dian_bu_dan_confirm')
        if (dao_dian_bu_dan_confirm) {
            // 确认到店补单，那么直接返回true，继续执行表单提交操作
            return true
        }

        if (window.__IS_XXG_IN_SUNING) { // 苏宁店家APP内，下单前需要先校验手机号是否为苏宁会员
            var mobile = $Form.find('[name="tel"]').val() || ''
            o.valid.isSnMember({mobile: mobile}, function (flag, errmsg) {
                if (flag) {
                    // 表示为苏宁会员，校验通过
                    tcb.cache('dao_dian_bu_dan_confirm', true)
                    setTimeout(function () {
                        // 避免订单提交异常，延时3秒将 dao_dian_bu_dan_confirm 设置为false
                        tcb.cache('dao_dian_bu_dan_confirm', false)
                    }, 3000)

                    $Form.trigger('submit')
                } else {
                    $.dialog.alert('<div class="grid column justify-center align-center">' +
                        '<div style="font-size: .14rem;color: #000;">不是有效的苏宁会员</div>' +
                        '<div style="padding: .08rem 0;text-align: center;">请让用户使用微信扫码注册会员<br>或返回修改手机号</div>' +
                        '<div style="width: 1.6rem;height: 1.6rem; background: transparent url(https://p0.ssl.qhimg.com/t01c4a767e6ac524a67.jpg) no-repeat center;background-size: contain;"></div>' +
                        '</div>', null, {
                        btn: '关闭'
                    })
                }
            })
            return false
        }

        var pay_method = $Form.find('[name="pay_method"]').val()
        if (pay_method === 'unified') {
            return true
        }

        if (pay_method == 'bank') {
            var
                $bank_name = $Form.find('[name="bank_name"]'),
                $pay_account = $Form.find('[name="pay_account"]'),
                $account_holder = $Form.find('[name="account_holder"]')

            $.dialog.confirm(
                '<p style="font-size: 20px;">确认用户信息</p><br/>' +
                '<p style="color: #FF0202">旧机款将打到用户银行卡:</p>' +
                '<p style="color: #FF0202">姓名:' + $account_holder.val() + '</p>' +
                '<p style="color: #FF0202">银行:' + $bank_name.val() + '</p>' +
                '<p style="color: #FF0202">账号:' + $pay_account.val() + '</p>',
                function () {
                    tcb.cache('dao_dian_bu_dan_confirm', true)
                    setTimeout(function () {
                        // 避免订单提交异常，延时3秒将 dao_dian_bu_dan_confirm 设置为false
                        tcb.cache('dao_dian_bu_dan_confirm', false)
                    }, 3000)

                    $Form.trigger('submit')
                }
            )
        } else if (pay_method == 'alipay') {
            var
                $alipay_id = $Form.find('[name="alipay_id"]'),
                $alipay_name = $Form.find('[name="alipay_name"]')

            $.dialog.confirm(
                '<p style="font-size: 20px;">确认用户信息</p><br/>' +
                '<p style="color: #FF0202">旧机款将打到用户支付宝:</p>' +
                '<p style="color: #FF0202">支付宝账号:' + $alipay_id.val() + '</p>' +
                '<p style="color: #FF0202">支付宝用户名:' + $alipay_name.val() + '</p>',
                function () {
                    tcb.cache('dao_dian_bu_dan_confirm', true)
                    setTimeout(function () {
                        // 避免订单提交异常，延时3秒将 dao_dian_bu_dan_confirm 设置为false
                        tcb.cache('dao_dian_bu_dan_confirm', false)
                    }, 3000)

                    $Form.trigger('submit')
                }
            )
        } else if (pay_method == 'weixin') {
            // 补单，微信收款

            // 获取补单用户的wxopenid，
            // 必须确保获取成功才能提交订单做后续收款操作
            __getBuDanUserWXOpenid(o.data.url_query['assess_key'], function (data) {
                // 设置用户收款的wxopenid
                $Form.find('[name="wx_openid"]').val(data['open_id'])

                $.dialog.confirm(
                    '<p style="font-size: 20px;">确认用户信息</p><br/>' +
                    '<p style="color: #FF0202">旧机款将打到用户微信账号</p>' +
                    '<p style="color: #FF0202">微信昵称：' + data['wx_name'] + '</p>',
                    function () {
                        tcb.cache('dao_dian_bu_dan_confirm', true)
                        setTimeout(function () {
                            // 避免订单提交异常，延时3秒将 dao_dian_bu_dan_confirm 设置为false
                            tcb.cache('dao_dian_bu_dan_confirm', false)
                        }, 3000)

                        $Form.trigger('submit')
                    }
                )
            })

        }

        // 弹出确认信息框后，必须return false，以确保表单不被提交，只是弹出确认信息
        return false
    }

    // 提交表单之后
    function __afterSubmitDaoDianBuDanForm(data, errno) {
        if (errno) {
            //$.dialog.toast ('系统异常，请重试')

            return
        }

        var $Form = $('#DaoDianBudanSaleForm')
        // 将已经下单的assess_key存入sessionStorage以备用
        var assess_key = $Form.find('[name="assess_key"]').val()
        if (tcb.supportSessionStorage()) {
            sessionStorage.setItem(assess_key, '1')
        }

        __redirectUrlAfterSubmit({
            'order_id': data['parent_id']
        })
    }

    // 获取补单用户的wxopenid，
    // 必须确保获取成功才能提交订单做后续收款操作
    function __getBuDanUserWXOpenid(assess_key, callback) {
        if (!assess_key) {
            return $.dialog.toast('系统异常，请重试', 2000)
        }
        $.ajax({
            type: 'POST',
            url: tcb.setUrl2('/m/doGetBudanUserWxInfoByAssessKey'),
            data: {
                assess_key: assess_key
            },
            dataType: 'json',
            timeout: 5000,
            success: function (res) {

                if (res['errno']) {
                    return $.dialog.toast(res['errmsg'], 2000)
                }

                typeof callback === 'function' && callback(res['result'])
            },
            error: function () {
                $.dialog.toast('系统异常，请重试', 2000)
            }
        })
    }

    // 获取果果相关信息
    function __getGuoGuoForm(order_id, redirect_url, callback) {
        if (!order_id) {
            return $.dialog.toast('订单号不能为空', 2000)
        }

        $.ajax({
            type: 'GET',
            url: tcb.setUrl2('/huishou/doGetGuoguoForm'),
            data: {
                parent_id: order_id
            },
            dataType: 'json',
            timeout: 5000,
            success: function (res) {

                if (res['errno']) {
                    window.location.href = redirect_url

                    return //$.dialog.toast (res[ 'errmsg' ], 2000)
                }

                typeof callback === 'function' && callback(res['result'])
            },
            error: function () {
                window.location.href = redirect_url
                //$.dialog.toast ('系统异常，请重试', 2000)
            }
        })

    }

    // 绑定预约取件相关事件
    function __bindEventSchedulePickup($Target, redirect_url) {
        if (!($Target && $Target.length)) {
            return
        }
        var
            $time_trigger = $Target.find('[name="express_time_alias"]'),
            $form = $Target.find('form'),
            $btn = $Target.find('.btn-submit')

        // 选择上门取件时间
        new $.datetime($time_trigger, {
            remote: tcb.setUrl2('/huishou/doGetAbleExpressTimeTable'),
            noStyle: true
        })

        // 预约上门取件表单
        __bindFormSubmit({
            $form: $form,
            $btn: $btn,
            valid: 'schedulePickupForm',
            post: 'postSchedulePickupForm',
            before: function ($Form) {
                var
                    $express_time_alias = $Form.find('[name="express_time_alias"]'),
                    $express_time = $Form.find('[name="express_time"]')

                $express_time.val('')
                if ($express_time_alias && $express_time_alias.val()) {
                    var
                        date_time = $express_time_alias.val()

                    date_time = date_time.split('-')
                    if (date_time.length > 1) {
                        date_time.pop()
                    }
                    date_time = date_time.join('-')

                    $express_time.val(date_time)
                }
            },
            after: function (data, errno) {
                if (errno) {
                    return
                }

                __showSchedulePickupSuccess(redirect_url)
            }
        })

    }

    // 显示预约取件成功
    function __showSchedulePickupSuccess(redirect_url) {

        var
            html_fn = $.tmpl(tcb.trim($('#JsMHSSchedulePickupSuccessPanelTpl').html())),
            html_st = html_fn({
                data: {
                    url: redirect_url
                }
            })

        tcb.closeDialog()

        tcb.showDialog(html_st, {
            className: 'schedule-pickup-success-panel',
            withClose: false,
            middle: true
        })

    }

    function bindEventXxgApplyGoodPrice($Section) {
        var $Form = $Section.find('form')
        var $target_price = $Form.find('[name="target_price"]')
        var $assess_price = $Form.find('[name="pinggu_price"]')
        var target_price_remote = 0
        var target_price
        var assess_price

        __bindFormSubmit({
            $form: $Form,
            $btn: $Form.find('.btn'),
            valid: 'xxgApplyGoodPriceForm',
            post: 'postXxgApplyGoodPriceForm',
            before: function ($Form) {
                target_price_remote = 0
                target_price = parseFloat($target_price.val()) || 0
                assess_price = parseFloat($assess_price.val()) || 0
                if (!target_price || (target_price - assess_price > 0)) {
                    return
                }

                target_price_remote = target_price
                o.interact.swipeOut(function () {
                    o.handle.showXxgApplyGoodPriceCompletePanel({
                        target_price_remote: target_price_remote,
                        target_price: target_price,
                        assess_price: assess_price
                    })
                })
                return false
            },
            after: function (data, errno) {
                if (!errno) {
                    target_price_remote = data['target_price']
                }
                o.interact.swipeOut(function () {
                    o.handle.showXxgApplyGoodPriceCompletePanel({
                        target_price_remote: target_price_remote,
                        target_price: target_price,
                        assess_price: assess_price
                    })
                })
            }
        })
    }

}(this)


;/**import from `/resource/js/mobile/huishou/order/data.js` **/
// 获取数据的接口
!function (global) {
    var
        Root = tcb.getRoot(),
        o = Root.Order,
        // 1：上门，2：到店，3：邮寄
        serviceTypeMap = {
            '1': '',
            '2': '',
            '3': ''
        }
    o.data = {}

    tcb.mix(o.data, {
        getAssessDetectReport: getAssessDetectReport,
        getAssessReport: getAssessReport,
        getSeCode: getSeCode,

        getServiceType: getServiceType,

        postShangMenForm: postShangMenForm,
        postYouJiForm: postYouJiForm,
        postDaoDianForm: postDaoDianForm,
        postSchedulePickupForm: postSchedulePickupForm,
        postXxgApplyGoodPriceForm: postXxgApplyGoodPriceForm
    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    // 获取评估检测报告
    function getAssessDetectReport(params, callback, error) {

        __ajax({
            type: 'GET',
            url: tcb.setUrl2('/huishou/doGetDetectReport'),
            data: params
        }, callback, error)
    }

    // 获取评估报告
    function getAssessReport(params, callback, error) {

        __ajax({
            type: 'GET',
            //url  : '/huishou/doGetDetectReport',
            url: tcb.setUrl2('/m/doshowpinggudetail'),
            data: params
        }, callback, error)
    }

    // 获取检测报告
    function getSeCode(params, callback, error) {

        __ajax({
            type: 'POST',
            url: tcb.setUrl2('/aj/doSendSmscode/'),
            data: params
        }, callback, error)
    }

    // 根据城市，机器价格，[hdid]，获取可用服务方式
    function getServiceType(params, callback, error) {
        //在 Android 下，需要通过 WeixinJSBridge 对象将网页的字体大小设置为默认大小，并且重写设置字体大小的方法，让用户不能在该网页下设置字体大小。
        (function() {
            if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                handleFontSize();
            } else {
                if (document.addEventListener) {
                    document.addEventListener("WeixinJSBridgeReady", handleFontSize, false);
                } else if (document.attachEvent) {
                    document.attachEvent("WeixinJSBridgeReady", handleFontSize);
                    document.attachEvent("onWeixinJSBridgeReady", handleFontSize);
                }
            }
            function handleFontSize() {
                WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize' : 0 });
                WeixinJSBridge.on('menu:setfont', function() {
                    WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize' : 0 });
                });
            }
        })();
        __ajax({
            type: 'GET',
            url: tcb.setUrl2('/huishou/dogetshoppingtype/'),
            data: params
        }, callback, error)
    }


    function postShangMenForm($form, callback, error) {
        var
            request_url = tcb.setUrl2($form.attr('action'))

        __ajax({
            type: 'POST',
            url: request_url,
            data: $form.serialize()
        }, callback, error)

    }

    function postYouJiForm($form, callback, error) {
        var
            request_url = tcb.setUrl2($form.attr('action'))

        __ajax({
            type: 'POST',
            url: request_url,
            data: $form.serialize()
        }, callback, error)
    }

    // 提交到店表单
    function postDaoDianForm($form, callback, error) {
        if (window.isSuningShopPlusOutDate) {
            window.isSuningShopPlusOutDate(function (isOutDate) {
                if (isOutDate) {
                    window.showDialogSuningShopPlusOutDate(function () {
                        __postDaoDianForm($form, callback, error)
                    })
                } else {
                    __postDaoDianForm($form, callback, error)
                }
            })
        } else {
            __postDaoDianForm($form, callback, error)
        }
    }

    function __postDaoDianForm($form, callback, error) {
        var request_url = tcb.setUrl2($form.attr('action'))

        __ajax({
            type: 'POST',
            url: request_url,
            data: $form.serialize()
        }, callback, error)
    }

    // 提交预约上门取件表单
    function postSchedulePickupForm($form, callback, error) {
        var
            request_url = tcb.setUrl2($form.attr('action'))

        __ajax({
            type: 'POST',
            url: request_url,
            data: $form.serialize()
        }, callback, error)

    }

    function postXxgApplyGoodPriceForm($form, callback, error) {
        var
            request_url = tcb.setUrl2($form.attr('action'))

        __ajax({
            type: 'POST',
            url: request_url,
            data: $form.serialize()
        }, callback, error, true)

    }


    // =================================================================
    // 私有接口 private
    // =================================================================


    function __ajax(params, callback, error, no_error_toast) {
        $.ajax({
            type: params['type'],
            url: tcb.setUrl2(params['url']),
            data: params['data'],
            dataType: 'json',
            timeout: 15000,
            success: function (res) {

                if (res['errno']) {
                    !no_error_toast && $.dialog.toast(res['errmsg'], 2000)
                }
                typeof callback === 'function' && callback(res['result'], res['errno'])

            },
            error: function () {
                typeof error === 'function' && error()
            }
        })
    }

}(this)


;/**import from `/resource/js/mobile/huishou/order/handle.js` **/
// 获取数据的接口
!function (global) {
    var Root = tcb.getRoot (),
        o = Root.Order
    var TYPE_SHANGMEN = 1
    var TYPE_DAODIAN = 2
    var TYPE_YOUJI = 3

    o.handle = o.handle || {}

    tcb.mix (o.handle, {

        citySelectDone : citySelectDone,

        setServiceType : setServiceType,
        showXxgApplyGoodPriceCompletePanel : showXxgApplyGoodPriceCompletePanel
    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    // 根据城市，机器价格，[hdid]，设置可用服务方式
    function setServiceType(params, callback) {
        params = params || {}

        var city = params['city_name']
        if (params['ad_city_code']) {
            delete params['city_name']
        }
        if (!city) {
            $.dialog.toast('请先选择城市！')
            return
        }

        if (window.__HDID) {
            params['hdid'] = window.__HDID
        }

        if (window.__MODEL_ID) {
            params['model_id'] = window.__MODEL_ID
        }

        // 获取服务方式信息
        // 并根据获取到的信息，设置支持的服务方式
        o.data.getServiceType(params, function (data) {
            var daodian_shop_list = data['daodian'], // 到店店铺信息
                tel = data['def_post_info']['tel']//res['result']['tel'];

            //上门是否展示支付方式
            window.M_SHOW_OFFLINE_PAYOUT = data['show_offline_payout']

            window.__IS_SUPPORT_SHANGMEN = false
            var serviceTypesAble = [] // 可用的回收方式
            var serviceTypesShow = [] // 显示出来的回收方式
            var serviceTypesDisabled = [] // 禁止使用的回收方式
            tcb.each(data['huodong_show'] || [], function (i, type) {
                if (type === TYPE_SHANGMEN) {
                    if (data['show_offline']) {
                        window.__IS_SUPPORT_SHANGMEN = true
                        serviceTypesAble.push(type)
                        serviceTypesShow.push(type)
                    }
                } else {
                    serviceTypesAble.push(type)
                    serviceTypesShow.push(type)
                }
            })

            if (window.__IS_PARTNER_FENGXIU) {
                // 丰修

                // 上门不再显示支付方式
                // window.M_SHOW_OFFLINE_PAYOUT = false
                if (tcb.inArray(TYPE_SHANGMEN, serviceTypesShow) === -1) {
                    serviceTypesShow.push(TYPE_SHANGMEN)
                    serviceTypesDisabled.push(TYPE_SHANGMEN)
                    window.__TPL_TYPE_DATA['order_server_type_default'] = TYPE_YOUJI
                } else {
                    window.__TPL_TYPE_DATA['order_server_type_default'] = TYPE_SHANGMEN
                }
            } else if (window.__IS_PARTNER_LIDIANHUISHOU) {
                //离店回收

                // window.M_SHOW_OFFLINE_PAYOUT = false
                if (tcb.inArray(TYPE_SHANGMEN, serviceTypesShow) === -1) {
                    serviceTypesShow.push(TYPE_SHANGMEN)
                    serviceTypesDisabled.push(TYPE_SHANGMEN)
                    window.__TPL_TYPE_DATA['order_server_type_default'] = TYPE_YOUJI
                } else {
                    window.__TPL_TYPE_DATA['order_server_type_default'] = TYPE_SHANGMEN
                }
            }

            //上门是否展示支付方式
            if (window.M_SHOW_OFFLINE_PAYOUT) {
                $('.m-show-offline-payout').show()
                $('.block-common-info').css('padding-top', '0')
            } else {
                $('.m-show-offline-payout').hide()
                $('.block-common-info').css('padding-top', '0.08rem')
            }

            // 设置 上门 服务信息
            __setShangmenServiceTypeInfo({
                'city_name': city,
                'tel': tel
            }, tcb.inArray(TYPE_SHANGMEN, serviceTypesDisabled) !== -1)
            // 设置 邮寄 服务信息
            __setYoujiServiceTypeInfo({
                'tel': tel
            })
            // 设置 到店 服务信息
            __setDaodianServiceTypeInfo({
                'shop_list': daodian_shop_list
            })

            // 判断默认选中的服务方式是否在Disabled里边，
            // 若在里边，那么就可用的回收方式第一个作为默认显示
            if (window.__TPL_TYPE_DATA['order_server_type_default'] &&
                tcb.inArray(window.__TPL_TYPE_DATA['order_server_type_default'], serviceTypesDisabled) !== -1) {
                window.__TPL_TYPE_DATA['order_server_type_default'] = serviceTypesAble[0]
            }

            // 设置可用服务方式
            __setValidServiceType(serviceTypesShow, serviceTypesDisabled)

            // 重置滚动高度
            o.interact.resizeScrollInnerHeight()

            typeof callback === 'function' && callback()
        })
    }

    /**
     * 完成选择城市
     * @param $trigger 选择城市触发器
     * @param region   选中的省、市、省id、市id
     * @param callback 选择成功后的回调
     */
    function citySelectDone ($trigger, region, callback) {
        region = region || {}
        if (region['provinceCode']) {
            __citySelectDone2($trigger, region, callback)
        } else {
            __citySelectDone1($trigger, region, callback)
        }
    }

    function __citySelectDone1($trigger, region, callback) {
        var city = region['city'] || '',
            city_id = region['city_id'] || '',
            province = region['province'] || '',
            province_id = region['province_id'] || ''

        $trigger
            .attr('data-city', city)
            .attr('data-city-id', city_id)
            .attr('data-province', province)
            .attr('data-province-id', province_id)
            .find('.city-name').html(city)

        $('[name="city_name"]').val(city)
        $('.row-hs-style-checked').removeClass('row-hs-style-checked')
                                  .find('.icon-circle')
                                  .addClass('b-radius-circle')
                                  .removeClass('icon-zhifuchenggong')
        $('.block-order-form').hide()

        var params = {
            city_name: city,
            assess_price: $('#AssessedModelPrice').attr('data-price')
        }
        // 切换城市，设置服务方式
        setServiceType(params, callback)
    }

    function __citySelectDone2($trigger, region, callback) {
        var province = region['province'] || '',
            provinceCode = region['provinceCode'] || '',
            city = region['city'] || '',
            cityCode = region['cityCode'] || '',
            area = region['area'] || '',
            areaCode = region['areaCode'] || ''

        $trigger
            .attr('data-province', province)
            .attr('data-province-code', provinceCode)
            .attr('data-city', city)
            .attr('data-city-code', cityCode)
            .attr('data-area', area)
            .attr('data-area-code', areaCode)
            .find('.city-name').html([province, city, area].join(' '))

        $('[name="city_name"]').val(city)
        $('.row-hs-style-checked').removeClass('row-hs-style-checked')
                                  .find('.icon-circle')
                                  .addClass('b-radius-circle')
                                  .removeClass('icon-zhifuchenggong')
        $('.block-order-form').hide()

        var params = {
            ad_province_code: provinceCode,
            ad_city_code: cityCode,
            ad_area_code: areaCode,
            city_name: city,
            assess_price: $('#AssessedModelPrice').attr('data-price')
        }
        // 切换城市，设置服务方式
        setServiceType(params, callback)
    }

    function showXxgApplyGoodPriceCompletePanel(data){
        var html_fn = $.tmpl($.trim($('#JsMXxgApplyGoodPriceCompleteTpl').html())),
            html_st = html_fn()
        tcb.showDialog(html_st, {
            middle: true,
            withClose: false,
            className : 'xxg-apply-good-price-complete-dialog'
        })

        var delay = Math.random() * 25
        if (delay<5){
            delay += Math.random() * 5
        }
        setTimeout(function(){
            showXxgApplyGoodPriceCheckedResultPanel(data)
        }, delay*1000)
    }

    function showXxgApplyGoodPriceCheckedResultPanel(data){
        tcb.closeDialog()

        var html_fn = $.tmpl($.trim($('#JsMXxgApplyGoodPriceCheckedResultTpl').html())),
            html_st = html_fn({
                target_price_remote: data.target_price_remote,
                target_price: data.target_price,
                assess_price: data.assess_price,
                url: tcb.setUrl2('/m/hsModeHub', {}, ['_global_data'])
            })
        var dialogInst = tcb.showDialog(html_st, {
            middle: true,
            withClose: false,
            className : 'xxg-apply-good-price-checked-result-dialog'
        })

        dialogInst.wrap.find('.btn').on('click', function (e) {
            e.preventDefault()

            tcb.closeDialog()
        })
    }

    // =================================================================
    // 私有接口 private
    // =================================================================


    // 设置 到店 服务信息
    function __setDaodianServiceTypeInfo (data) {
        var shop_list = data[ 'shop_list' ] || []

        // 更新到店地址列表
        window.__DaoDianShopList = shop_list
    }

    // 设置 上门 服务信息
    function __setShangmenServiceTypeInfo(data, disabled) {
        // 设置上门范围区域
        var $ShangMenArea = $('#OrderShangMenArea')
        if ($ShangMenArea && $ShangMenArea.length) {
            if (disabled) {
                return $ShangMenArea.show().html('当前地区尚未开通')
            }

            var area = __getCityShangmenArea(data['city_name'])

            if (area) {
                $ShangMenArea.show().html(
                    /*data['city_name'].indexOf('北京') > -1
                        ? '限北京东城/西城/朝阳/海淀/通州区'
                        : */data['city_name'] + '&nbsp;' + area
                )
            } else {
                $ShangMenArea.hide().html(data['city_name'])
            }
            if (window.__IS_PARTNER_FENGXIU) {
                // 特别处理，丰修下不显示上门区域
                $ShangMenArea.hide()
            }
        }
    }

    // 设置 邮寄 服务信息
    function __setYoujiServiceTypeInfo (data) {
        // 貌似没啥要做的，就先这样放着吧
    }

    // 设置当前城市可用服务
    function __setValidServiceType (serviceTypesShow, serviceTypesDisabled) {
        var $ServiceTypes = $ ('.block-order-style'),
            $BlockTitle = $ServiceTypes.closest('.block-order').find('.block-tit')

        if (!serviceTypesShow || !serviceTypesShow.length) {
            serviceTypesShow = [404]
            $BlockTitle.hide()
            $('.block-btn').hide()
        }
        if (serviceTypesShow && serviceTypesShow[0] !== 404) {
            $BlockTitle.show()
            $('.block-btn').show()
        }

        var disabledTexts = {}
        disabledTexts[TYPE_SHANGMEN] = '当前城市尚未开通上门回收'
        disabledTexts[TYPE_DAODIAN] = '当前城市尚未开通到店回收'
        disabledTexts[TYPE_YOUJI] = '当前城市尚未开通邮寄回收'

        $ServiceTypes.each(function () {
            var $me = $(this),
                type = parseInt($me.attr('data-type'), 10),
                $rowCheck = $me.find('.row-hs-style-check')

            // type值为5表示扫码回收，不处理
            if (type != 5) {
                if (tcb.inArray(type, serviceTypesDisabled) === -1) {
                    $rowCheck
                        .attr('data-no-click', '')
                        .attr('data-no-click-text', '')
                } else {
                    $rowCheck
                        .attr('data-no-click', '1')
                        .attr('data-no-click-text', disabledTexts[type])
                }

                if (type == 2) {
                    $me.find('[name="shop_id"]').val('')
                    $me.find('.daodian-addr-select-trigger').addClass('default').html('选择门店')
                    $me.find('#DaodianFare').html('')
                    $me.find('#DaodianAddrTips').html('')
                }

                if (tcb.inArray(type, serviceTypesShow) > -1) {
                    $me.show()
                } else {
                    $me.hide()
                }
            }
        })
    }

    // 获取城市上门地区
    function __getCityShangmenArea(city_name) {
        var ret = '',
            shangmen_city_area = window.__ShangMenCityArea || []

        for (var i = 0; i < shangmen_city_area.length; i++) {
            if (city_name.indexOf(shangmen_city_area[i]['city']) > -1) {
                ret = shangmen_city_area[i]['tip']
            }
        }

        return ret
    }



} (this)


;/**import from `/resource/js/mobile/huishou/order/handle_change_new_product.js` **/
// 处理更换新机
!function (global) {
    var
        Root = tcb.getRoot (),
        o = Root.Order

    o.handle = o.handle || {}

    tcb.mix (o.handle, {

        initChangeNewProduct : initChangeNewProduct
    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    function initChangeNewProduct(){

        __bindEvent()
    }


    // =================================================================
    // 私有接口 private
    // =================================================================


    function __bindEvent(){
        var
            $Target = o.getDoc ()

        tcb.bindEvent ($Target[ 0 ], {

            // 修改需要换新的机器
            '.js-change-newproduct': function(e) {
                e.preventDefault();

                var
                    NewProductList = window.__NewProductList

                if ( !(NewProductList && NewProductList.length) ) {
                    return
                }

                var
                    product_list = []
                $.each(NewProductList, function (i, item) {
                    product_list.push({
                        'pid': item['show_info']['product_id'],
                        'name': item['show_info']['title'],
                        'img': item['show_info']['img_url_m'],
                        'price': item['price_diff']
                    })
                })

                var
                    html_str = $.tmpl ($.trim ($ ('#JsMHuanXinNewProductListTpl').html ())) ({
                        'product_list' : product_list
                    })
                tcb.showDialog(html_str, {
                    className: 'm-huanxin-new-product-list-wrap',
                    middle : true
                })
            },
            // 立即换新
            '.js-liji-huanxin': function(e){
                e.preventDefault();

                var
                    $me = $(this)

                var
                    pid = $me.attr('data-id'),
                    url_hash = $me.attr('href'),
                    product_title = $me.attr('data-title'),
                    img_name = $me.attr('data-img')

                if (!pid) {
                    return
                }
                var
                    request_url = tcb.setUrl ('/youpin/product', {
                        'product_id' : pid,
                        'ajax'       : '1'
                    })
                $.getJSON(request_url, function(res){
                    var selectedAttr = res['result']['product_attr'],
                        AttrGroup = [],
                        AttrList = [],
                        show_price, real_price;

                    var product_attr_hash = res['result']['attr_combine'],
                        product_attr_price_hash = res['result']['attr_combine_price'];
                    $.each(product_attr_hash, function(k,v){
                        product_attr_hash[k] = {
                            'product_id': v.split('product_id=')[1],
                            'show_price': product_attr_price_hash[k]['show_price'],
                            'real_price': product_attr_price_hash[k]['real_price']
                        };

                        AttrGroup.push(k.split(','));
                    })
                    CurProductAttrHash = product_attr_hash;
                    show_price = product_attr_price_hash[selectedAttr.join(',')]['show_price'];
                    real_price = product_attr_price_hash[selectedAttr.join(',')]['real_price'];

                    var
                        product_attr_storage,
                        product_attr_color,
                        product_attr_net,
                        product_attr_channel
                    $.each(res['result']['model_attr'], function(k, v){
                        var AttrList_sub = [];
                        switch (v['name']){
                            // 颜色
                            case '颜色':
                                product_attr_color = {
                                    'pos': k,
                                    'attr': [],
                                    'name': v['name']
                                };
                                var color_hash = {
                                    '灰色': ['https://p.ssl.qhimg.com/t01b7a462b8b1dd22a7.png', '深空灰'],
                                    '黑色': ['https://p.ssl.qhimg.com/t01cfdd766e6ad4ba75.png', '黑色'],
                                    '金色': ['https://p.ssl.qhimg.com/t015aff832d43be7134.png', '金色'],
                                    '银色': ['https://p.ssl.qhimg.com/t0182ce4f7ce773b011.png', '银色'],
                                    '白色': ['https://p.ssl.qhimg.com/t015e06ece9297f590a.png', '白色'],
                                    '粉色': ['https://p.ssl.qhimg.com/t014b734b4dbb07b1cc.png', '粉色'],
                                    '蓝色': ['https://p.ssl.qhimg.com/t0117c6bb967cc3c870.png', '蓝色'],
                                    '绿色': ['https://p.ssl.qhimg.com/t01902e76cea14ead02.png', '绿色']
                                };
                                $.each(v['attr'], function(kk, vv){
                                    var color_img  = 'https://p.ssl.qhimg.com/t015aff832d43be7134.png',
                                        color_name = vv;

                                    var color = color_hash[vv];
                                    if (color) {
                                        color_img  = color[0];
                                        color_name = color[1];
                                    }

                                    product_attr_color['attr'].push({
                                        'val':kk,
                                        'txt': color_name,
                                        'color_img': color_img
                                    });
                                    AttrList_sub.push(kk);
                                });
                                break;
                            // 容量
                            case '容量':
                                product_attr_storage = {
                                    'pos': k,
                                    'attr': [],
                                    'name': v['name']
                                };
                                $.each(v['attr'], function(kk, vv){
                                    vv = $.trim(vv.split('G')[0]);
                                    product_attr_storage['attr'].push({
                                        'val':kk,
                                        'txt': vv
                                    });
                                    AttrList_sub.push(kk);
                                });
                                break;
                            // 网络
                            case '网络':
                                product_attr_net = {
                                    'pos': k,
                                    'attr': [],
                                    'name': v['name']
                                };
                                $.each(v['attr'], function(kk, vv){
                                    product_attr_net['attr'].push({
                                        'val':kk,
                                        'txt': vv
                                    });
                                    AttrList_sub.push(kk);
                                });
                                break;
                            // 渠道
                            case '渠道':
                                product_attr_channel = {
                                    'pos': k,
                                    'attr': [],
                                    'name': v['name']
                                };
                                $.each(v['attr'], function(kk, vv){
                                    product_attr_channel['attr'].push({
                                        'val':kk,
                                        'txt': vv
                                    });
                                    AttrList_sub.push(kk);
                                });
                                break;
                        }

                        AttrList.push(AttrList_sub);
                    })

                    var img = img_name ? img_name : 'https://p.ssl.qhimg.com/t01e6226d691579c643.png';

                    var
                        param_data = {
                            'img'                  : img,
                            'url_hash'             : url_hash,
                            'product_id'           : pid,
                            'show_price'           : show_price,
                            'real_price'           : real_price,
                            'product_title'        : product_title,
                            'product_attr_storage' : product_attr_storage,
                            'product_attr_color'   : product_attr_color,
                            'product_attr_net'     : product_attr_net,
                            'product_attr_channel' : product_attr_channel
                        }
                    var
                        content_html = $.tmpl ($ ('#JsMHuanXinNewProductDetailTpl').html ()) (param_data)

                    tcb.closeDialog()

                    tcb.showDialog(content_html, {
                        className: 'm-huanxin-new-product-detail-wrap',
                        middle : true
                    })

                    __setProductAttrUi(selectedAttr, AttrGroup, AttrList)
                });
            },

            // 选择商品属性
            '.product-attr .item a': function(e){
                e.preventDefault();

                var
                    $me = $(this),
                    $cnt = $me.closest('.cnt')

                $cnt.find('.item a').removeClass('cur')
                $me.addClass('cur')

                // 设置属性组合商品id
                __setProductId()
            },

            // 去回收页面评估旧机，换新机
            '.goto-huanxinji-btn': function(e){
                e.preventDefault()

                var
                    $me = $(this),
                    url_hash = $me.attr('href'),
                    pid = $me.attr('data-pid')

                if (!pid){
                    tcb.errorBlink($('.product-attr .item a'))
                    return
                }

                // 根据当前URL和选中newproductid，修改URL地址，直接跳转到新的地址
                // 此处只能用tcb.setUrl，不能用tcb.setUrl2
                var
                    redirect_url = tcb.setUrl (window.location.href, {
                        'newproductid' : pid
                    })

                redirect_url = redirect_url.replace (/%2C/ig, ',')

                window.location.href = redirect_url
            }

        })

    }


    var CurProductAttrHash
    /**
     * 设置商品属性的ui状态
     * @param selectedAttr 当前选择商品属性
     * @param AttrGroup 所有可用属性组
     * @param AttrList 属性列表
     */
    function __setProductAttrUi(selectedAttr, AttrGroup, AttrList){
        var SelectableAttr = [],
            AttrGroup_itemstr = $.map(AttrGroup, function (item) {
                return item.join('')
            });

        var selectedAttr2 = __arrCombinedSequence(selectedAttr)
        $.each(AttrList, function(i, item){
            SelectableAttr[i] = [];

            $.each(item, function(i2, item2){
                $.each(selectedAttr2, function(si, sitem){
                    var temp_arr = [];

                    temp_arr = temp_arr.concat(sitem.slice(0, i), item2, sitem.slice(i+1));

                    if (tcb.arrContains(AttrGroup_itemstr, temp_arr.join('')) && !tcb.arrContains(SelectableAttr[i],item2)) {
                        SelectableAttr[i].push(item2);
                    }
                });
            });
        });
        // console.log(AttrGroup);

        var wPCate = $('.product-attr-line');
        wPCate.forEach(function(el, i){
            var $line = $(el),
                pos = parseInt($line.attr('data-pos'), 10);
            $(el).find('.item a').forEach(function(el){
                var wItem = $(el),
                    attr_id = wItem.attr('data-attrid');
                wItem.removeClass('cur').removeClass('disabled').removeClass('disabled-hover');// 移除状态
                // 设置那些不能被选择的属性
                if (!tcb.arrContains(SelectableAttr[pos], attr_id)) {
                    wItem.addClass('disabled');
                } else {
                    wItem.removeClass('disabled');
                }

                if(attr_id === selectedAttr[pos]){
                    wItem.addClass('cur');
                }
            });
        });
    }

    /**
     * 将数组转换成组合序列
     * @param  {[type]} TwoDimArr [description]
     * @return {[type]}              [description]
     */
    function __arrCombinedSequence(TwoDimArr){
        var ConvertedArr = [], // 转换后的二维数组
            TwoDimArr_safe = [],
            cc = 1; // 转换后的二维数组的数组长度

        $.each(TwoDimArr, function(i, arr){
            TwoDimArr_safe.push((arr instanceof Array) ? arr : [arr]);
        });

        $.each(TwoDimArr_safe, function(i, arr){
            cc = cc*arr.length;
        });

        var kk = 1;
        $.each(TwoDimArr_safe, function(i, arr){
            var len = arr.length;
            cc = cc/len;
            if (i==0) {
                $.each(arr, function(x, item){
                    for(var j=0; j<cc; j++){
                        ConvertedArr.push([item]);
                    }
                });
            } else {
                var pos = 0;
                for(var k=0; k<kk; k++){
                    $.each(arr, function(x, item){
                        for(var j=0; j<cc; j++){
                            ConvertedArr[pos].push(item);
                            pos++;
                        }
                    });
                }
            }
            kk = kk*len;
        });

        return ConvertedArr;
    }

    // 设置商品id
    function __setProductId(){
        var
            pid = '',
            attr = [ '', '', '', '' ]

        $ ('.product-attr-line').each (function (i, el) {
            var
                $me = $ (el),
                pos = parseInt ($me.attr ('data-pos'), 10),
                attr_id = $me.find ('.cur').attr ('data-attrid')

            attr[ pos ] = attr_id;
        })

        var
            $btn = $ ('.goto-huanxinji-btn'),
            attr_key = attr.join (','),
            show_price,
            real_price

        show_price = CurProductAttrHash[ attr_key ][ 'show_price' ]
        real_price = CurProductAttrHash[ attr_key ][ 'real_price' ]

        $ ('.dialog-wrap .show-price').html ('￥' + show_price)
        $ ('.dialog-wrap .real-price').html ('京东价￥' + real_price)

        pid = CurProductAttrHash[ attr_key ][ 'product_id' ]
        pid = pid ? pid : ''
        $btn.attr ('data-pid', pid)
    }


} (this)

;/**import from `/resource/js/mobile/huishou/order/interact.js` **/
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

;/**import from `/resource/js/mobile/huishou/order/render.js` **/
// html输出接口
!function (global) {
    var
        Root = tcb.getRoot (),
        o = Root.Order

    var
        renderMap = {

            // 页内组件输出

            // 输出检测报告
            assessDetectReport    : renderAssessDetectReport,

            // 输出下单表单
            orderSubmit     : renderOrderSubmit,

            // 输出app检测whereami的值为partner_detect时的模板
            detectPartnerOrderSubmit : renderDetectPartnerOrderSubmit,

            // 苏宁云店miniAPP被动模式qrcode
            suningYundianMiniQRCode : renderSuningYundianMiniQRCode,

            // 输出到店店铺列表
            daoDianShopList : renderDaoDianShopList,

            // 输出评估报告
            assessReport : renderAssessReport,

            // 修修哥申请价格
            xxgApplyGoodPrice : renderXxgApplyGoodPrice
        }

    o.render = function (options) {
        var
            target = options[ 'target' ] || null,
            render = options[ 'render' ],
            data = options[ 'data' ],
            complete = typeof options[ 'complete' ] === 'function' ? options[ 'complete' ] : this.noop
        var
            render_fn = this.noop,
            event_fn = o.event (render)
        if (render && typeof renderMap[ render ] === 'function') {
            render_fn = renderMap[ render ]
        }
        return render_fn ({
            data     : data,
            event    : event_fn,
            target   : target,
            complete : complete
        })
    }

    tcb.mix (o.render, {
        renderDaoDianShopList : renderDaoDianShopList
    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    // 输出评估检测报告
    function renderAssessDetectReport (options) {

        o.data.getAssessDetectReport (options[ 'data' ], function (data) {
            if (!data) {

                return options[ 'complete' ] ()
            }
            data = data || {}

            data[ 'icon_class_map' ] = {
                '0' : 'icon-option-ok',
                '1' : 'icon-option-none',
                '2' : 'icon-option-no_access',
                '3' : 'icon-option-none'
            }

            var $Target = options[ 'target' ] || $ ('.block-assess_report-cont'),
                $The = __htmlRender ({
                    data          : data,
                    tmpl_fn       : $.tmpl ($.trim ($ ('#JsMAssessDetectReportTpl').html ())),
                    $Target       : $Target,
                    $The          : null,
                    flag_clean    : false,
                    flag_fade_in  : true,
                    flag_not_show : false
                })

            // 输出检测信息与官方信息不一致时的提示
            var $PageOrderSubmit = $ ('.page-order_submit')
            if ($PageOrderSubmit && $PageOrderSubmit.length){
                var base_info = data['base_info'] || [],
                    official_info = data['official_info']||[],
                    flag_storage = true,
                    flag_color = true,
                    html_st = ''

                tcb.each(base_info, function(i, baseItem){
                    tcb.each(official_info, function(i, officialItem){
                        if (baseItem['name']==officialItem['name']){
                            if (!officialItem['value']){
                                return true
                            }
                            switch (baseItem['name']){
                                case '容量':
                                    baseItem['value']!=officialItem['value'] && (flag_storage=false)
                                    break
                                case '颜色':
                                    baseItem['value']!=officialItem['value'] && (flag_color=false)
                                    break
                            }
                        }
                    })
                })
                if (!flag_storage && !flag_color){
                    html_st = '<div style="margin:.1rem;padding:.1rem;background-color:#fffab0;color: #f00;">tip：检测到您手机容量、颜色与官网不符，继续提交，将按照更换手机容量和更换手机外壳的标准计算价格。</div>'
                } else if(!flag_storage){
                    html_st = '<div style="margin:.1rem;padding:.1rem;background-color:#fffab0;color: #f00;">tip：检测到您手机容量与官网不符，继续提交，将按照更换手机容量标准计算价格。</div>'
                } else if(!flag_color){
                    html_st = '<div style="margin:.1rem;padding:.1rem;background-color:#fffab0;color: #f00;">tip：检测到您手机颜色与官网不符，继续提交，将按照更换手机外壳标准计算价格。</div>'
                }

                html_st && $PageOrderSubmit.after(html_st)
            }
            // END 输出检测信息与官方信息不一致时的提示

            // 绑定事件
            options[ 'event' ] ($Target)

            // 完成回调
            options[ 'complete' ] ()
        }, function () {

            // 完成回调
            options[ 'complete' ] ()
        })
    }

    // 输出下单表单
    function renderOrderSubmit (options) {

        var
            $Target = options[ 'target' ] || $ ('.page-order_submit')

        __htmlRender ({
            data          : options[ 'data' ],
            tmpl_fn       : $.tmpl ($.trim ($ ('#JsMHuiShouOrderSubmit').html ())),
            $Target       : $Target,
            $The          : null,
            flag_clean    : false,
            flag_fade_in  : true,
            flag_not_show : false
        })

        // 绑定事件
        options[ 'event' ] ($Target)

        // 完成回调
        options[ 'complete' ] ()
    }

    // 输出下单表单
    function renderDetectPartnerOrderSubmit (options) {
        var $Target = options[ 'target' ] || $ ('.page-order_submit')

        __htmlRender ({
            data          : options[ 'data' ],
            tmpl_fn       : $.tmpl ($.trim ($ ('#JsMHuiShouDetectPartnerOrderSubmit').html ())),
            $Target       : $Target,
            $The          : null,
            flag_clean    : false,
            flag_fade_in  : true,
            flag_not_show : false
        })

        // 绑定事件
        options[ 'event' ] ($Target)

        // 完成回调
        options[ 'complete' ] ()
    }

    // 输出下单表单
    function renderSuningYundianMiniQRCode (options) {
        var $Target = options[ 'target' ] || $ ('.page-order_submit')

        __htmlRender ({
            data          : options[ 'data' ],
            tmpl_fn       : $.tmpl ($.trim ($ ('#JsMSuningYundianMiniQrcodeOrderSubmitTpl').html ())),
            $Target       : $Target,
            $The          : null,
            flag_clean    : false,
            flag_fade_in  : true,
            flag_not_show : false
        })

        // 绑定事件
        options[ 'event' ] ($Target)

        // 完成回调
        options[ 'complete' ] ()
    }

    // 输出到店地址列表
    function renderDaoDianShopList (options) {
        var
            $Target = options[ 'target' ]
        if (!($Target && $Target.length)) {
            return
        }
        __htmlRender ({
            data          : options[ 'data' ],
            tmpl_fn       : $.tmpl ($ ('#JsMHuiShouDaoDianShopListTpl').html ()),
            $Target       : $Target,
            $The          : null,
            flag_clean    : false,
            flag_fade_in  : true,
            flag_not_show : false
        })

        // 绑定事件
        options[ 'event' ] ($Target)
        // 完成回调
        options[ 'complete' ] ()
    }

    // 输出评估报告
    function renderAssessReport (options) {

        o.data.getAssessReport (options[ 'data' ], function (data) {
            if (!data) {

                return options[ 'complete' ] ()
            }
            data = data || {}

            data[ 'icon_class_map' ] = ['icon-option-none','icon-option-ok','icon-option-no_access']

            var $Target = options[ 'target' ],
                $The = __htmlRender ({
                    data          : data,
                    tmpl_fn       : $.tmpl ($.trim ($ ('#JsMAssessReportTpl').html ())),
                    $Target       : $Target,
                    $The          : null,
                    flag_clean    : false,
                    flag_fade_in  : true,
                    flag_not_show : false
                })

            // 绑定事件
            options[ 'event' ] ($Target)

            // 完成回调
            options[ 'complete' ] ()
        }, function () {

            // 完成回调
            options[ 'complete' ] ()
        })
    }

    // 输出评估报告
    function renderXxgApplyGoodPrice (options) {
        var $Target = options[ 'target' ]
        if (!($Target && $Target.length)) {
            return
        }
        __htmlRender ({
            data          : options[ 'data' ]||{},
            tmpl_fn       : $.tmpl ($ ('#JsMXxgApplyGoodPriceTpl').html ()),
            $Target       : $Target,
            $The          : null,
            flag_clean    : false,
            flag_fade_in  : true,
            flag_not_show : false
        })

        // 绑定事件
        options[ 'event' ] ($Target)
        // 完成回调
        options[ 'complete' ] ()
    }

    // =================================================================
    // 私有接口 private
    // =================================================================



    // 输出html
    function __htmlRender (options) {
        options = options || {}

        var
            id = options[ 'id' ] || '', // 页面id
            data = options[ 'data' ], // 模板数据
            tmpl_fn = options[ 'tmpl_fn' ], // 模板对象返回函数
            $Target = options[ '$Target' ], // 输出目标元素
            $The = options[ '$The' ],// 指定要干掉的元素
            flag_clean = options[ 'flag_clean' ] || false,// 输出前,先清除$Target的内容
            flag_fade_in = options[ 'flag_fade_in' ] || false,// 渐变显示,flag_not_show为false的时候,此参数忽略
            flag_not_show = options[ 'flag_not_show' ] || false // 不显示

        if (!($Target && $Target.length)) {
            return
        }

        if ($The && $The.length) {
            $The.remove ()
        }

        var
            html_fn = tmpl_fn,
            html_st = html_fn ({
                id   : id,
                data : data
            })

        $The = $ (html_st)
        // 干掉那些文本节点
        $The = $The.filter (function () {
            return this.nodeType == 1
        })

        // 先清除$Target的内容
        if (flag_clean) {
            $Target.html ('')
        }

        $Target.append ($The)

        if (flag_not_show) {
            // 隐藏输出

            $The.hide ()
        } else {
            if (flag_fade_in) {
                // 以fadein的方式显示出来

                $The
                    .css ({
                    'opacity' : 0
                })
                    .animate ({ 'opacity' : 1 }, 200)
            }
        }

        return $The
    }


} (this)


;/**import from `/resource/js/mobile/huishou/order/_start.js` **/
!function (global) {
    // 非下单页,直接返回不做任何处理
    if (window.__PAGE !== 'order') {

        return
    }

    var
        Root = tcb.getRoot(),
        o = Root.Order

    // 初始化评估页面
    // DOM READY at callback
    o.init({
        // 前置处理
        before: function () {
            o.data.url_query = tcb.queryUrl(window.location.search) || {}
            if (o.data.url_query['_global_data']) {
                try {
                    o.data.url_query['_global_data'] = $.parseJSON(tcb.html_decode(o.data.url_query['_global_data']))
                } catch (ex) {
                    o.data.url_query['_global_data'] = {}
                }
            }
        },
        // DOM READY之后
        after: function () {
            __setViewLayout()

            // 初始化页面滚动功能
            __initPageScroll()

            if (window.__IS_IN_FUWUDAO) {
                // 服务岛内
                // 输出评估报告
                return o.render({
                    data: {
                        assess_key: o.data.url_query['assess_key']
                    },
                    render: 'assessReport',
                    target: $('.main-inner-fuwudao'),
                    complete: function () {
                        // 重置滚动高度
                        o.interact.resizeScrollInnerHeight()
                    }
                })
            } else if (o.data.url_query['_global_data'] && o.data.url_query['_global_data']['view_assess_price'] && !window.__IS_LOW_RISK_PRICE) {
                // 价格预览模式

                var gold_order_html = !!window.__IS_GOLD_ENGINEER ? '<div class="row">' +
                    '<div class="col-12-1 iconfont icon-qian" style="color: #f84;"></div>' +
                    '<div class="col-12-9">预估经验值</div>' +
                    '<div class="col-12-2" style="text-align: right;">' + window.__GOLD_ORDER_ADD_PRICE + '</div>' +
                    '</div>' : ''

                $('.block-btn').hide()
                // if(window.__IS_XXG_IN_SUNING == '0'){

                $('.page-order_submit').html(gold_order_html +
                    '<div style="font-size: .16rem;text-align: center;line-height: 4;">' +
                    '如果用户同意报价，请点击“去回收”下单' +
                    '<a class="btn btn-yellow" style="margin:0 auto;display:block;width: .8rem;height: .3rem;line-height: .3rem;font-size: .12rem;color: #fff;" href="' + tcb.setUrl2('/m/hsModeHub', {}, ['_global_data']) + '" data-url-except="_global_data">去回收</a></div>')

                // }else{

                //     $('.page-order_submit').html(gold_order_html+
                //         '<div style="font-size: .16rem;text-align: center;line-height: 4;">' +
                //         '如果用户同意报价，请点击“去回收”下单' +
                //         '<a class="btn btn-yellow" style="margin:0 auto;display:block;width: .8rem;height: .3rem;line-height: .3rem;font-size: .12rem;color: #fff;" href="'+tcb.setUrl2('/m/hsModeHub', {}, ['_global_data'])+'" data-url-except="_global_data">去回收</a></div>' +
                //         '<div class="hxbt_wrap" style=" padding: .2rem .3rem;\n' +
                //         '    width: 85%;transform: translateY(.8rem);\n' +
                //         '    height: 2.5rem;\n' +
                //         '    background-color: #fff;\n' +
                //         '    border-radius: .2rem;\n' +
                //         '    margin: 0 auto;\n' +
                //         '    display: flex;\n' +
                //         '    flex-direction: column;\n' +
                //         '    align-items: center;">\n' +
                //         '            <div class="hxbt_title" style="font-size: .13rem;\n' +
                //         '    font-weight: bold;">用户扫码领取购新补贴券</div>\n' +
                //         '            <div class="hxbt_img" style="background-image: url(\'https://p4.ssl.qhimg.com/t01005f94b1e4e0bf88.png\');\n' +
                //         '    background-repeat: no-repeat;\n' +
                //         '    background-size: contain ;\n' +
                //         '    width: 80%;\n' +
                //         '    height: 1.5rem;\n' +
                //         '    display: flex;\n' +
                //         '    align-items: center;\n' +
                //         '    justify-content: center;\n' +
                //         '    background-position:center;\n' +
                //         '    margin: .2rem 0;"></div>\n' )
                // }

                return o.interact.resizeScrollInnerHeight()
            } else if (o.data.url_query['partner_flag'] == 'suning_spread'
                && o.data.url_query['suning_spread_display'] != 'normal') {
                // 苏宁推广 && 非正常显示

                __renderSuningSpread()
            } else if (o.data.url_query['self_enterprise'] === 'suning_store_share') {
                // 蘇寧雲店推廣
                $('.block-btn').hide()
                $('.page-order_submit').html('<div class="block-suning-store-share"><div class="suning-store-share-img"></div>请联系苏宁小店店员回收</div>')
            } else if (window.__IS_ZHEJIANG_YIDONG_MINIAPP) {
                // 浙江移动小程序
                $('.page-order_submit').hide()
            } else if (window.__IS_CHAOQIANG_STORE) {
                // cps-四川超强
                $('.block-btn').hide()
                $('.page-order_submit').html('<div class="block-chaoqiang-store-info">以上价格为预估价，具体测评请到星睿星耀门店进行！' +
                    '<br><br>' +
                    '现在参加以旧换新，还有高额购机补贴等着您！' +
                    '<br><br>' +
                    '详情咨询门店，公众号回复“门店”查看与您最近的门店。</div>')
            } else if (o.data.url_query['detect_key']) {
                // 有检测报告

                // 输出检测报告
                o.render({
                    data: {
                        detect_key: o.data.url_query['detect_key'],
                        assess_key: o.data.url_query['assess_key']
                    },
                    render: 'assessDetectReport',
                    complete: function () {

                        // 输出回收下单表单，
                        // 并且做一些输出后的后续处理
                        __renderOrderSubmit()

                        //$('#Main .main-inner').append('<div style="width: 100%;height: 2.3552rem;background: transparent url(//p.ssl.qhimg.com/t01244cf173ecf5e82a.png) no-repeat center/contain;"></div>')
                    }
                })
            } else if (window.__IS_GOLD_ORDER && window.__GOLD_ENGINEER_RE_PAY_URL) {
                // 是否金牌订单 && 金牌修修哥重新付款链接
                $('.block-btn').hide()
                var html_st = '<div class="block-gold-engineer-cant-create-order-tips">\n' +
                    '                <i class="iconfont icon-gantanhao icon-style"></i>\n' +
                    '                <div class="title">暂时无法创建金牌订单</div>\n' +
                    '                <div class="content">您还有系统垫付的金牌订单未还款，还款后可继续。</div>\n' +
                    '                <div class="content">\n' +
                    '                    <a href="' + window.__GOLD_ENGINEER_RE_PAY_URL + '" class="btn btn-submit">去还款</a>\n' +
                    '                </div>\n' +
                    '            </div>'
                $('.page-order_submit').html(html_st)
            } else {
                // 无检测报告

                // 输出回收下单表单，
                // 并且做一些输出后的后续处理
                __renderOrderSubmit()
            }

            if (window.__HDID) {
                // 以旧换新

                o.handle.initChangeNewProduct()
            }

            if (window.__IS_GOLD_ORDER) {
                __setupGoldOrderStaffs()
            }
        }
    })

    // 初始化页面滚动功能
    function __initPageScroll() {
        var
            $Container = o.getContainer(),
            $Inner = o.$Inner,
            innerOffset = $Inner.offset(),

            // 滚动位置
            // 根据滚动位置设定新的内容虚拟高度(限定滚动的最大位置)
            inner_height = Math.max($Container.height(), innerOffset['height'])

        o.scroll.init($Container, {
            scrollingX: true,
            bouncing: false
        })
        o.scroll.setInner($Inner)
        o.scroll.setRunning(__defaultAnimate)
        o.scroll.setDimensions(0, 0, 0, inner_height)
    }

    // 输出回收下单表单，
    // 并且做一些输出后的后续处理
    function __renderOrderSubmit() {
        var render_name = 'orderSubmit'
        if (o.data.url_query['whereami'] == 'partner_detect') {
            render_name = 'detectPartnerOrderSubmit'
        }
        if (tcb.supportSessionStorage()) {
            var isPassiveness = sessionStorage.getItem('SUNING_YUNDIAN_MINIAPP_PASSIVENESS')
            if (isPassiveness) {
                render_name = 'suningYundianMiniQRCode'
                $('.block-btn').hide()
            }
        }

        // 输出下单表单
        o.render({
            data: {},
            render: render_name,
            complete: function () {
                if (render_name == 'orderSubmit') {
                    var citySelectInst = o.event.citySelectInst
                    var $cityTrigger = citySelectInst.getTrigger()
                    if ($cityTrigger && $cityTrigger.length) {
                        // 有城市选择触发器，目前表示非补单订单，
                        // 触发选中指定城市的操作

                        // 设置确认选中的回调函数
                        citySelectInst.options.callback_confirm = __addressSelectConfirmCallback
                        // 没有自动初始化
                        if (!citySelectInst.options.flagAutoInit) {
                            // 设置下初始化后的回调
                            citySelectInst.options.callback_init = __addressSelectInitCallback
                            citySelectInst.init()
                        } else {
                            __triggerAddressSelectDone($cityTrigger)
                        }
                    } else {
                        // 没有城市选择器，表示为补单

                        __handleDaoDianBuDan()
                    }
                } else {
                    // 重置滚动高度
                    o.interact.resizeScrollInnerHeight()
                }
            }
        })
    }

    // 地址选择--初始化完成回调
    function __addressSelectInitCallback(region, $trigger) {
        $trigger.find('.city-name')
                .attr('data-province', region.province)
                .attr('data-province-code', region.provinceCode)
                .attr('data-city', region.city)
                .attr('data-city-code', region.cityCode)
                .attr('data-area', region.area)
                .attr('data-area-code', region.areaCode)
                .html([region.province, region.city, region.area].join(' '))
        __triggerAddressSelectDone($trigger, region)
    }

    // 地址选择--确认选择回调
    function __addressSelectConfirmCallback(region, $trigger, force) {
        region = region || {}
        // 包含 cityCode 表示为新的省市区县选择，
        // 那么精确到区县，否则只精确到城市
        if (region['cityCode']) {
            // 区县切换没有任何变化，那么不做任何处理
            if (!force && $trigger.attr('data-area') === region['area']) {
                return
            }
            window.__Province['name'] = region['province']
            window.__Province['code'] = region['provinceCode']
            window.__City['name'] = region['city']
            window.__City['code'] = region['cityCode']
            window.__Area['name'] = region['area']
            window.__Area['code'] = region['areaCode']
        } else {
            // 城市切换没有任何变化，那么不做任何处理
            if (!force && $trigger.attr('data-city') === region['city']) {
                return
            }
            window.__Province['id'] = region['province_id']
            window.__Province['name'] = region['province']
            window.__City['id'] = region['city_id']
            window.__City['name'] = region['city']
        }

        o.handle.citySelectDone($trigger, region, function () {
            var $BlockYouji = $('.block-order-youji'),
                $payMethodItem = $BlockYouji.find('.payout-method-item') || [] // 获取当前的付款方式的数组,不存在默认为空数组

            if (window.__IS_SUNING_YUNDIAN_MINIAPP) {
                // 苏宁云店小程序
                __expandDefaultOrderServer()

            } else if (window.__IS_PARTNER_FENGXIU) {
                // 丰修
                // if (window.__IS_PARTNER_FENGXIU_FENGXIU) {
                //     //丰修（支持上门加邮寄）
                //     var $ShangMenRowHSStyleCheck = $('.block-order-shangmen .row-hs-style-check')
                //     var $adderssTips = $('#OrderShangMen')
                //     if (region['city'].indexOf('北京') === 0) {
                //         window.__TPL_TYPE_DATA['order_server_type_default'] = 1
                //         $ShangMenRowHSStyleCheck
                //             .attr('data-no-click', '0')
                //             .attr('data-no-click-text', '')
                //         $adderssTips.html('限北京东城/西城/朝阳/海淀/通州区')
                //     } else {
                //         window.__TPL_TYPE_DATA['order_server_type_default'] = 3
                //         $ShangMenRowHSStyleCheck
                //             .attr('data-no-click', '1')
                //             .attr('data-no-click-text', '当前城市尚未开通上门回收')
                //         $adderssTips.html('当前城市尚未开通')
                //     }
                // }
                if (window.__IS_SUPPORT_SHANGMEN) {
                    var $adderssTips = $('#OrderShangMenArea')
                    $adderssTips
                        .show()
                        .attr('data-no-alert', 1)
                        .css({
                            'text-decoration': 'none'
                        })
                        .html('现场验机 现场付款')
                }
                __expandDefaultOrderServer()

            } else if (window.__IS_PARTNER_LIDIANHUISHOU) {
                // 离店回收
                var $ShangMenRowHSStyleCheck = $('.block-order-shangmen .row-hs-style-check')
                var $adderssTips = $('#OrderShangMenArea')
                if (window.__IS_SUPPORT_SHANGMEN) {
                    window.__TPL_TYPE_DATA['order_server_type_default'] = 1
                    $ShangMenRowHSStyleCheck
                        .attr('data-no-click', '0')
                        .attr('data-no-click-text', '')
                } else {
                    window.__TPL_TYPE_DATA['order_server_type_default'] = 3
                    $ShangMenRowHSStyleCheck
                        .attr('data-no-click', '1')
                        .attr('data-no-click-text', '当前城市尚未开通上门回收')
                    $adderssTips
                        .show()
                        .html('当前城市尚未开通')
                }
                __expandDefaultOrderServer()

            } else if (window.__is_wechat_pay_default && $BlockYouji && $BlockYouji.length) {
                // window.__is_wechat_pay_default为true，
                // 那么默认选中邮寄回收，并且收款方式定位在微信收款

                $BlockYouji.find('.row-hs-style-check').trigger('click')
                $BlockYouji.find('.payout-method-wechat').trigger('click')

                setTimeout(function () {
                    __refreshSeCode()
                }, 3000)

            } else if (window.__is_sn_pay_default && $BlockYouji && $BlockYouji.length) {
                // 苏宁小店回收
                // window.__is_sn_pay_default为true，

                // 那么默认选中邮寄回收，并且收款方式定位在苏宁收款
                $BlockYouji.find('.row-hs-style-check').trigger('click')
                $BlockYouji.find('.payout-method-snpay').trigger('click')

                setTimeout(function () {
                    __refreshSeCode()
                }, 3000)

            } else if ($payMethodItem.length === 1 && $BlockYouji && $BlockYouji.length) {
                // 这一步进行一个默认判断,如果只存在一个付款方式,则默认展开,并进行选中
                $BlockYouji.find('.row-hs-style-check').trigger('click')
                $BlockYouji.find('.payout-method-item').trigger('click')

                setTimeout(function () {
                    __refreshSeCode()
                }, 3000)

            } else {
                __expandDefaultOrderServer()
            }
        })
    }

    // 地址选择--确认选择完成
    function __triggerAddressSelectDone($cityTrigger, region) {
        if (!region) {
            var province = $cityTrigger.attr('data-province'),
                city = $cityTrigger.attr('data-city'),
                province_id = $cityTrigger.attr('data-province-id'),
                city_id = $cityTrigger.attr('data-city-id'),
                region = {
                    province: province,
                    city: city,
                    province_id: province_id,
                    city_id: city_id
                }
        }
        __addressSelectConfirmCallback(region, $cityTrigger, true)
    }

    // 展开默认选中的订单服务方式
    function __expandDefaultOrderServer() {
        // 判断是否有需要默认被选中的服务方式，如若有，那么将其选中展开
        var order_server_type_default = window.__TPL_TYPE_DATA['order_server_type_default']
        if (order_server_type_default) {
            var $BlockOrderStyle = $('.block-order-style[data-type="' + order_server_type_default + '"]'),
                $RowHSStyleCheck = $BlockOrderStyle.find('.row-hs-style-check')

            if (!($RowHSStyleCheck && $RowHSStyleCheck.length && $RowHSStyleCheck.height())) {
                return
            }
            // 设置不将回收方式选择tab滚动到顶部
            $RowHSStyleCheck.attr('data-no-scroll-to-top', '1').trigger('click')

            setTimeout(function () {
                $RowHSStyleCheck.attr('data-no-scroll-to-top', '')
            }, 1500)
            setTimeout(function () {
                if ($BlockOrderStyle.find('.vcode-img').length) {
                    __refreshSeCode()
                }
            }, 3000)
        }
    }

    // 处理到店补单相关
    function __handleDaoDianBuDan() {
        var $ServiceType = $('.block-order-style')
        $ServiceType.filter(function () {
            return $(this).attr('data-type') != '404'
        }).show()

        var $BlockBuDan = $('.block-order-daodian-budan')
        if ($BlockBuDan && $BlockBuDan.length) {
            var $RowHSStyleCheck = $BlockBuDan.find('.row-hs-style-check')
            $RowHSStyleCheck.attr('data-no-scroll-to-top', '1').trigger('click')
            setTimeout(function () {
                $RowHSStyleCheck.attr('data-no-scroll-to-top', '')
            }, 1500)

        //    门店回收加入沙漏验机功能相关逻辑
            __isNeedShaLouYanJi()
        }
    }

    function __refreshSeCode() {
        if (window.__is_secode_refreshing) {
            return
        }
        window.__is_secode_refreshing = true
        setTimeout(function () {
            $('.vcode-img')
                .attr('src', tcb.setUrl2('/secode/?rands=' + Math.random()))
            window.__is_secode_refreshing = false
        }, 1)
    }

    function __defaultAnimate(left, top, zoom, $el, setTranslateAndZoom) {

        setTranslateAndZoom($el[0], left, top, zoom)
    }

    function __setViewLayout() {
        var $BlockHeader = $('#Header'),
            $BlockMain = $('#Main')

        $BlockHeader.show()

        var header_height = $BlockHeader.height() || 0

        $BlockMain.css({
            paddingTop: header_height
        })
    }

    function __renderSuningSpread() {}

//    门店回收加入沙漏验机
    function __isNeedShaLouYanJi() {
        //    判断是否开启了沙漏验机功能
        var $Form = $('#DaoDianBudanSaleForm'),
            $imei = $Form.find('[name="imei"]').val(),
            subMitBtn = $('#BtnSubmitOrderForm')

        if(window.__FORCE_SHALOU_FLAG){
            //先将按钮变为  不可点击
            subMitBtn.attr('id','showSnModelBtn')
            var showSnModelBtn = $('#showSnModelBtn')
            showSnModelBtn.css({
                'background':'grey'
            })
            initShowSnModelBtn()
            if($imei){
                __getShaLouRePinggu($imei)
            }else{
                //    沒有imei 弹窗让用户输入  之后再调用查询接口
                $('.fill-in-the-sn-model-mask').show()
            }
        }
    }
    //查询接口
    function __getShaLouRePinggu(imei,sn) {
        //    调用查询接口
        var parameter = {}
        parameter.model_id = window.__MODEL_ID
        parameter.assess_key = o.data.url_query['assess_key']
        if(imei){
            parameter.imei= imei
        }
        if(sn){
            parameter.sn= sn
        }
        $.ajax({
            url: '/Recycle/Engineer/shalouRePinggu',
            type: 'GET',
            // 设置的是请求参数
            data: parameter,
            // 用于设置响应体的类型 注意 跟 data 参数没关系！！！
            dataType: 'json',
            success: function (res) {

                if(res && !res.errno){
                    console.log('----请求成功----',o.data.url_query['assess_key'],res.result.assess_key)
                    var showSnModelBtn = $('#showSnModelBtn')
                    showSnModelBtn.attr('id','BtnSubmitOrderForm').css({
                        'background':'#0b7'
                    }).unbind("click");
                    $('.fill-in-the-sn-model-mask').hide()
                    var $Form = $('#DaoDianBudanSaleForm')
                    $Form.find('input[name=assess_key]').val(res.result.assess_key)
                }else{

                    if(res.errno == 1990 && imei){
                        $('.fill-in-the-sn-model-mask').show()
                        $.dialog.toast('请使用序列号查询！', 3000)
                        return
                    }else if (res.errno == 1990 && sn){
                        $.dialog.toast('请更换序列号查询！', 3000)
                        return
                    }
                    $.dialog.toast(res['errmsg'], 3000)
                }

            },
            error:function (err) {
                $.dialog.toast(err['errmsg'], 3000)
            }
        })
    }

    function __setupGoldOrderStaffs() {
        if (window.__GOLD_ORDER_TIMEOUT_AT) {
            var now_time = (new Date).getTime() + (window.__NOW_PADDING || 0)
            var end_time = Date.parse((window.__GOLD_ORDER_TIMEOUT_AT || '').replace(/-/g, '/'))
            // var end_time = now_time + 5000
            var html_st = '<div class="block-gold-order-timeout-tile grid nowrap align-center justify-center">' +
                '<div class="col shrink">请15分钟内完成订单，过期价格失效</div>' +
                '<div class="col auto"><div class="countdown-gold-order-timeout"></div></div>' +
                '</div>'
            var $html_st = $(html_st).prependTo('.block-assess_report-product')
            var $countdown = $html_st.find('.countdown-gold-order-timeout')
            console.log(end_time > now_time, end_time, now_time, $countdown)
            Bang.startCountdown(end_time, now_time, $countdown, {
                end: function () {
                    // var html_st_timeout = '<div class="block-gold-order-timeout-alert">' +
                    //     '<div class="block-gold-order-timeout-alert-title"></div>' +
                    //     '<div class="block-gold-order-timeout-alert-content"></div>' +
                    //     '<div class="block-gold-order-timeout-alert-btn"><a class="btn" href="#">我知道了</a></div></div>'
                    // tcb.showDialog(html_st_timeout, {
                    //     withClose: false,
                    //     middle: true
                    // })
                }
            })
        }
    }

    $('.fill-in-the-sn-model-btn-confirm').on('click',function (e) {
        e.preventDefault();
        var serialNumber = $('.serial-number').val().trim()
        if(!serialNumber){
            $.dialog.toast('请输入设备序列号！', 3000)
            return
        }
        __getShaLouRePinggu('',serialNumber)
    })
    $('.fill-in-the-sn-model-wrap .icon-close').on('click',function (e) {
        e.preventDefault();
        $('.fill-in-the-sn-model-mask').hide()
    })
    function initShowSnModelBtn(){
        $('#showSnModelBtn').on('click',function (e) {
            e.preventDefault();
            $('.fill-in-the-sn-model-mask').show()
        })
    }

}(this)





;/**import from `/resource/js/mobile/huishou/index/_enter.js` **/
// 入口
!function (global) {
    var
        Root = tcb.getRoot (),
        i = {}

    Root.Index = i

    tcb.mix (i, {

        $Doc : null,
        $Win : null,

        // 容器

        $Container : null,
        $Inner     : null,

        noop : tcb.noop,

        // 独立组件引入

        page : Root.page,// 页面处理器

        scroll : Root.scroll,// scroll

        router_inst : null,// 路由实例
        router      : Root.Router || {},// 路由

        // END 独立组件引入

        // 获取容器

        getContainer : function () {
            var
                me = this,
                $Container = me.$Container,
                containerId = 'BlockModelList'

            if ($Container && $Container.length) {

                return $Container
            }

            return me.$Container = $ ('#' + containerId)
        },

        getDoc : function () {
            var
                me = this,
                $Doc = me.$Doc

            if ($Doc && $Doc.length) {

                return $Doc
            }

            return me.$Doc = $ (document)
        },

        //做一些初始化操作[not DOM Ready]

        init  : function (options) {
            var
                before = typeof options[ 'before' ] === 'function'
                    ? options[ 'before' ]
                    : i.noop,
                after = typeof options[ 'after' ] === 'function'
                    ? options[ 'after' ]
                    : i.noop

            // DOM Ready之前执行
            // 注册路由等...
            before ()

            // DOM Ready
            i.ready (function () {

                // DOM Ready之后执行
                after ()
            })

            return this
        },
        /**
         * 做一些初始化操作
         */
        ready : function (callback) {

            $ (function () {
                var
                    $Doc = i.$Doc || tcb.getDoc (),
                    $Win = i.$Win || tcb.getWin ()

                i.$Doc = $Doc
                i.$Win = $Win

                // 初始化事件绑定
                i.event.init ()

                typeof callback === 'function' && callback ()
            })

        }

    })

} (this)

;/**import from `/resource/js/mobile/huishou/index/data.js` **/
// 获取数据的接口
!function (global) {
    var
        Root = tcb.getRoot (),
        i = Root.Index

    i.data = {}

    tcb.mix (i.data, {
        modelList  : getModelList,
        searchList : getSearchList,
        notebookList : getNotebookList
    })


    // =================================================================
    // 公共接口 public
    // =================================================================


    function getModelList (params, callback, error) {
        var
            str_params = $.param (params),
            modelList = tcb.cache ('i_am_model_list_' + str_params) || null

        if (modelList) {
            typeof callback === 'function' && callback (modelList)
        } else {
            params[ 'mobile' ] = '1'
            params[ 'fromget' ] = 'm'
            __ajax ({
                type : 'GET',
                url  : '/huishou/getModels/',
                data : params
            }, function (data, errno) {
                if (errno==666){
                    return !tcb.queryUrl(window.location.search, '_random') && window.location.replace(tcb.setUrl(window.location.href, {
                        _random: Math.random()
                    }))
                }

                if (errno){
                    data = ''
                }

                // 加入cache
                tcb.cache ('i_am_model_list_' + str_params, data)

                typeof callback === 'function' && callback (data)
            }, error)
        }

    }

    function getSearchList (params, callback, error) {
        var
            str_params = $.param (params),
            modelList = tcb.cache ('i_am_model_list_' + str_params) || null

        if (modelList) {
            typeof callback === 'function' && callback (modelList)
        } else {
            params[ 'mobile' ] = '1'
            if(window.__IS_IN_YANJI_ANDROID){
                params['from_page'] = 'android_yanji'
            }
            __ajax ({
                type : 'GET',
                url  : '/huishou/aj_get_sj_search/',
                data : params
            }, function (data, errno) {
                if (errno){
                    data = ''
                }

                // 加入cache
                tcb.cache ('i_am_model_list_' + str_params, data)

                typeof callback === 'function' && callback (data)
            }, error)
        }

    }

    function getNotebookList (params, callback, error) {
        var
            str_params = $.param (params),
            modelList = tcb.cache ('i_am_notebook_list_' + str_params) || null

        if (modelList) {
            typeof callback === 'function' && callback (modelList)
        } else {
            params[ 'mobile' ] = '1'
            params[ 'category' ] = '10'
            __ajax ({
                type : 'GET',
                url  : '/huishou/getModels/',
                data : params
            }, function (data, errno) {
                if (errno){
                    data = ''
                }

                // 加入cache
                tcb.cache ('i_am_notebook_list_' + str_params, data)

                typeof callback === 'function' && callback (data)
            }, error)
        }
    }


    // =================================================================
    // 私有接口 private
    // =================================================================


    function __ajax (params, callback, error) {
        $.ajax ({
            type     : params[ 'type' ],
            url      : tcb.setUrl2(params[ 'url' ]),
            data     : params[ 'data' ],
            dataType : 'json',
            timeout  : 5000,
            success  : function (res) {

                if (res[ 'errno' ]) {
                    $.dialog.toast (res[ 'errmsg' ], 2000)
                }
                typeof callback === 'function' && callback (res[ 'result' ], res[ 'errno' ])
            },
            error    : function () {
                typeof error === 'function' && error ()
            }
        })
    }

} (this)

;/**import from `/resource/js/mobile/huishou/index/handle_brand_list.js` **/
// 品牌列表处理
!function (global) {
    var
        Root = tcb.getRoot (),
        i = Root.Index,
        __scrollY = true

    i.handle = i.handle || {}

    tcb.mix (i.handle, {

        initBrandScroll               : __initBrandScroll,
        getBrandScrollInst            : __getScrollInst,
        getBrandContainer             : __getContainer,
        getBrandInner                 : __getInner,
        setBrandScrollY               : setBrandScrollY,
        getBrandScrollY               : getBrandScrollY,
        resetBrandListScrollDimension : __setBrandListScrollDimension

    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    function setBrandScrollY(status) {
        __scrollY = !!status
    }
    function getBrandScrollY() {
        return !!__scrollY
    }

    // =================================================================
    // 私有接口 private
    // =================================================================

    var
        _Inst = null,
        _callback = null,
        $_Container = null,
        $_Inner = null

    // 初始化品牌列表的滚动
    function __initBrandScroll () {
        // 获取滚动实例
        __getScrollInst (__defaultAnimate, true)
        // 绑定品牌列表的事件
        __bindEvent ()
    }

    // 获取container
    function __getContainer () {

        if (!($_Container && $_Container.length)) {
            $_Container = $ ('#BlockBrandList')
        }

        return $_Container
    }

    // 获取inner
    function __getInner () {

        if (!($_Inner && $_Inner.length)) {
            $_Inner = __getContainer ().find ('.block-brand-list-inner')
        }

        return $_Inner
    }

    // 设置品牌列表的滚动尺寸
    function __setBrandListScrollDimension (clientWidth, clientHeight, contentWidth, contentHeight) {
        if ($ ('#BrandModelItemStyle').length){
            $ ('#BrandModelItemStyle').remove()
        }
        var
            inst = __getScrollInst (),

            $Container = __getContainer (),
            block_w = $Container.width (),
            block_h = $Container.height (),

            $Items = $Container.find ('.item'),
            $Item = $Items.eq (0),
            item_w = $Item.width (),
            item_h = $Item.height (),
            // item计算取整后的新高度
            item_new_h = item_h


        // 先根据默认设置的item高度，以及容器高度，
        // 获取跟默认高度最接近的显示的item数量的整数，
        // 由于新的item数量占满容器高度的时候，item的高度可能不为整数，
        // 为了避免非整数高度在某些浏览器不兼容，那么将新的item高度四舍五入成正整数，保持浏览器的兼容性，
        // 一切处理完成后再获取$Inner的高度，否则提前获取高度就会不准确
        if (!$ ('#BrandModelItemStyle').length) {
            var
                item_num_in_screen = block_h / item_h,
                item_num_in_screen_int = Math.round (item_num_in_screen)

            item_new_h = Math.round (block_h / item_num_in_screen_int)

            var
                style_css = '.block-model-list .item,.block-brand-list .item{height: ' + item_new_h + 'px;line-height: ' + item_new_h + 'px;}'
            $ ('<style id="BrandModelItemStyle" type="text/css"></style>').text (style_css).appendTo ('head');
        }

        var
            $Inner = __getInner (),
            inner_w = $Inner.width (),
            inner_h = $Inner.height ()

        clientWidth = typeof clientWidth != 'undefined' ? clientWidth : block_w
        clientHeight = typeof clientHeight != 'undefined' ? clientHeight : block_h
        contentWidth = typeof contentWidth != 'undefined' ? contentWidth : inner_w
        contentHeight = typeof contentHeight != 'undefined' ? contentHeight : inner_h

        inst.setSnapSize (item_w, item_new_h)
        inst.setDimensions (clientWidth, clientHeight, contentWidth, contentHeight)
    }

    // 获取滚动实例
    function __getScrollInst (animate_fn, flag_set_dimension) {

        if (_Inst) {

            if (typeof animate_fn === 'function') {
                // 设置滚动效果
                __setRunning (animate_fn)
            }

        } else {
            animate_fn = typeof animate_fn === 'function' ? animate_fn : __defaultAnimate

            _Inst = new Scroll (function (left, top, zoom) {
                // 此函数在滚动过程中实时执行，需要注意处理效率

                typeof _callback === 'function' && _callback (left, top, zoom)
            }, {
                snapping   : true,
                scrollingX : false,
                bouncing   : false
            })
            // 设置滚动效果
            __setRunning (animate_fn)
        }

        // 重置dimension
        if (flag_set_dimension) {
            __setBrandListScrollDimension ()
        }

        return _Inst
    }

    // 设置滚动的回调函数
    function __setRunning (callback) {
        var
            $Inner = __getInner ()

        _callback = function (left, top, zoom) {

            if (typeof callback === 'function') {

                callback (left, top, zoom, $Inner, tcb.setTranslateAndZoom)
            }
        }
    }

    // 默认滚动函数
    function __defaultAnimate (left, top, zoom, $el, setTranslateAndZoom) {

        setTranslateAndZoom ($el[ 0 ], left, top, zoom)
    }


    // 绑定事件
    function __bindEvent () {
        var
            $Doc = tcb.getDoc (),
            $Container = __getContainer (),

            inst = __getScrollInst (),
            // 用来标识在Container中的滑动
            flag = false

        if ('ontouchstart' in window) {
            // 绑定滚动事件
            $Container.on ('touchstart', function (e) {

                // flag设置为true表示滑动开始
                flag = true

                // 滑动开始
                inst.doTouchStart (e.touches, e.timeStamp)
            })

            $Doc.on ('touchmove', function (e) {
                if (!getBrandScrollY()){
                    return
                }
                if (flag) {
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
                if (!getBrandScrollY()){
                    return
                }
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

        var
            double_tap_last_time = Date.now (),
            $Items = $Container.find ('.item')

        // 品牌列表绑定事件
        $Items.on ({
            // 双击品牌刷新
            'doubleTap' : function (e) {
                var
                    now_time = Date.now ()
                if (now_time - double_tap_last_time < 2000) {
                    return
                }
                double_tap_last_time = now_time
                var
                    $me = $ (this),
                    url = $me.attr ('href')

                i.router_inst.trigger (true)
            }
        })
    }

} (this)

;/**import from `/resource/js/mobile/huishou/index/event.js` **/
// 绑定事件
!function (global) {
    var
        Root = tcb.getRoot (),
        i = Root.Index

    i.eventMap = {
        modelList : eventModelList
    }

    // 添加event到page

    i.event = {}

    tcb.mix (i.event, {

        init : initEvent

    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    function initEvent () {
        var $SearchForm =$('#brandSearchForm')

        // 搜索机型
        $SearchForm.on('submit', function(e){
            e.preventDefault()

            var $form = $(this),
                $keyword = $form.find('[name="keyword"]'),
                keyword = $.trim($keyword.val())

            if (!keyword){
                $.errorAnimate($keyword)

                setTimeout(function(){
                    $keyword.focus()
                }, 10)
                return
            }

            // 使用keyword前必须encode以下，
            // 避免iPhone的webview对于url中带中文时的解析错误问题
            i.router_inst.go('!/search/'+encodeURIComponent(keyword))
        })

        // 返回
        $SearchForm.find('.icon-back2').on('click', function(e){
            e.preventDefault()

            window.history.go(-1)
        })

        //用户评价滚动
        hotCommentSlide()
    }


    // =================================================================
    // 私有接口 private
    // =================================================================

    function eventModelList () {

    }
    function hotCommentSlide(){
        // 用户评价滚动
        var $userCommentListWrap = $('.user-comment-list-wrap')
        if ($userCommentListWrap && $userCommentListWrap.length){
            window.Bang.slide($userCommentListWrap)
        }
    }

} (this)

;/**import from `/resource/js/mobile/huishou/index/render.js` **/
// html输出方法
!function (global) {
    var
        Root = tcb.getRoot (),
        i = Root.Index
    i.renderMap = {
        brandList  : renderBrandList,
        modelList  : renderModelList,
        searchList : renderSearchList,
        notebookList : renderNotebookList,
        whiteGoodsList : renderWhiteGoodsList
    }


    // =================================================================
    // 公共接口 public
    // =================================================================

    function renderBrandList(options) {
        // if(window.location.search =='?from_page=fengxiu'){
        //     window.location.hash='!/brand/10'
        // }

        var $Target = options['target']
        if (!($Target && $Target.length)) {
            return
        }

        var $The = __htmlRender({
            id: options['id'],
            data: options['data'],
            $T: $('#JsMHuiShouBrandListTpl'),
            $Target: $Target,
            $The: null,
            flag_clean: true,
            flag_fade_in: false,
            flag_not_show: false
        })

        // 绑定事件
        options['event']($Target)
        // 完成回调
        options['complete']($The)
    }

    // 输出机型选择列表
    function renderModelList (options) {
        var requestData = {
            id : options[ 'data' ][ 'brand_id' ]
        }
        if (options['data']['pad']) {
            requestData['pad'] = options['data']['pad']
        }
        __commonModelListRender ({
            id          : options[ 'id' ],
            target      : options[ 'target' ],
            step        : options[ 'data' ][ 'step' ] || 0,
            data        : options[ 'data' ],
            data_method : 'modelList',
            request     : requestData,
            complete    : options[ 'complete' ],
            event       : options[ 'event' ]

        })
    }

    /**
     * 输出搜索列表
     * @param options
     */
    function renderSearchList (options) {
        var data = options['data'] || {}
        var requestParams = {
            keyword: data['keyword']
        }
        if (data['category_id']) {
            requestParams['category_id'] = data['category_id']
        }
        __commonModelListRender ({
            id          : options[ 'id' ],
            target      : options[ 'target' ],
            step        : 0,
            data        : options[ 'data' ],
            data_method : 'searchList',
            request     : requestParams,
            complete    : options[ 'complete' ],
            event       : options[ 'event' ]
        })
    }

    /**
     * 输出笔记本列表
     * @param options
     */
    function renderNotebookList (options) {

        __commonModelListRender ({
            id          : options[ 'id' ],
            target      : options[ 'target' ],
            step        : options[ 'data' ][ 'step' ] || 0,
            data        : options[ 'data' ],
            data_method : 'notebookList',
            request     : {
                id : options[ 'data' ][ 'brand_id' ]
            },
            complete    : options[ 'complete' ],
            event       : options[ 'event' ]
        })
    }

    // 获取家电机型列表
    function renderWhiteGoodsList(options) {
        var $Target = options[ 'target' ]
        if (!($Target && $Target.length)) {
            return
        }

        var $The = __htmlRender ({
            id : options[ 'id' ],

            data : {},

            $T            : $ ('#JsMHSWhiteGoodsModelListTpl'),
            $Target       : $Target,
            $The          : null,
            flag_clean    : false,
            flag_fade_in  : true,
            flag_not_show : false
        })

        // 绑定事件
        options[ 'event' ] ($Target)
        // 完成回调
        options[ 'complete' ] ($The)
    }

    // =================================================================
    // 私有接口 private
    // =================================================================

    function __commonModelListRender (options) {
        var
            $Target = options[ 'target' ]
        if (!($Target && $Target.length)) {
            return
        }

        var step = parseInt (options[ 'step' ], 10) || 0

        tcb.loadingStart()

        i.data[ options[ 'data_method' ] ] (options[ 'request' ], function (data) {
            if (!data) {

                return options[ 'complete' ] ()
            }
            var
                modelList = data[ 'data' ][ step ]

            if (step !== 0) {
                var
                    model_id = options[ 'data' ][ 'model_id' ],
                    modelListTemp = []
                for (var i = 0; i < modelList.length; i++) {
                    if (modelList[ i ][ 'pid' ] == model_id) {
                        modelListTemp.push (modelList[ i ])
                    }
                }
                modelList = modelListTemp
            }

            var
                $The = __htmlRender ({
                    id : options[ 'id' ],

                    data : {
                        modelList : modelList,
                        brand_id  : options[ 'data' ][ 'brand_id' ]
                    },

                    $T            : $ ('#JsMHuiShouModelList'),
                    $Target       : $Target,
                    $The          : null,
                    flag_clean    : false,
                    flag_fade_in  : true,
                    flag_not_show : false
                })

            // 绑定事件
            options[ 'event' ] ($Target)
            // 完成回调
            options[ 'complete' ] ($The)

            tcb.loadingDone()

        }, function () {

            tcb.loadingDone()

            $.dialog.toast('请求超时，请双击重试')

            // 完成回调
            options[ 'complete' ] ()
        })
    }

    // 输出html
    function __htmlRender (options) {
        options = options || {}

        var
            id = options[ 'id' ] || '', // 页面id
            data = options[ 'data' ], // 模板数据
            $T = options[ '$T' ], // 模板对象
            $Target = options[ '$Target' ], // 输出目标元素
            $The = options[ '$The' ],// 指定要干掉的元素
            flag_clean = options[ 'flag_clean' ] || false,// 输出前,先清除$Target的内容
            flag_fade_in = options[ 'flag_fade_in' ] || false,// 渐变显示,flag_not_show为false的时候,此参数忽略
            flag_not_show = options[ 'flag_not_show' ] || false // 不显示

        if (!($Target && $Target.length)) {
            return
        }

        if ($The && $The.length) {
            $The.remove ()
        }

        var
            html_fn = $.tmpl ($.trim ($T.html ())),
            html_st = html_fn ({
                id   : id,
                data : data
            })

        $The = $ (html_st)
        // 干掉那些文本节点
        $The = $The.filter (function () {
            return this.nodeType == 1
        })

        // 先清除$Target的内容
        if (flag_clean) {
            $Target.html ('')
        }

        $Target.append ($The)

        if (flag_not_show) {
            // 隐藏输出

            $The.hide ()
        } else {
            if (flag_fade_in) {
                // 以fadein的方式显示出来

                $The
                    .css ({
                    'opacity' : 0
                })
                    .animate ({ 'opacity' : 1 }, 200)
            }
        }

        return $The
    }

} (this)


;/**import from `/resource/js/mobile/huishou/index/route_map.js` **/
!function (global) {
    var
        Root = tcb.getRoot (),
        i = Root.Index

    i.route_map = {
        /**
         * 首页
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!' : function (route_inst, route, direction, url, request) {
            $('.block-sn-xd-912j').show()
            __setKeywordStatus ('')
            __setRecycleCateStatus('1')

            __renderBrandList('1')

            // 设置无品牌被选中的状态
            __setBrandNoneSelected()

            // 禁止scroll y轴移动 并设置container高度
            // if(window['__SHOW_INDEX_HOT_MODEL']){
            //     setTimeout(function () {
            //         var $brand_container = i.handle.getBrandContainer(),
            //             $brand_inner = i.handle.getBrandInner(),
            //             brand_scroller = i.handle.getBrandScrollInst()
                        // $items = $brand_inner.find('.item'),
                        // brand_inner_height= (Math.ceil($items.length/3))*$items.height()

                    // brand_scroller.options.scrollingY = false
                    // $brand_container.height(brand_inner_height)
                    // i.handle.setBrandScrollY(false)
                // },1)
            // }
            i.handle.setBrandScrollY(false)
        },

        /**
         * 进入品牌页，获取品牌机型列表
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!/brand/:brand_id' : function (route_inst, route, direction, url, request) {
            __setKeywordStatus ('')
            __setRecycleCateStatus('1')

            __renderBrandList('1')

            var _global_data = i.data.url_query['_global_data'] || {}
            var pad = _global_data['pad']

            i.page.generateIds (url)

            i.page.generator ({
                // 页面id
                id     : i.page.getId (url),
                // 数据（可以是页面输出数据，也可以是异步请求参数）
                data   : {
                    step     : 0,
                    brand_id : request[ 'brand_id' ],
                    pad      : pad
                },
                target : i.getContainer (),
                // 页面输出函数,
                // 并且含有同名绑定事件
                render : 'modelList',

                complete : function ($The) {
                    $('.block-sn-xd-912j').hide()
                    __setBrandStatus (request[ 'brand_id' ])

                    // 设置有品牌被选中的状态
                    __setBrandHasSelected()

                    __setModelListStatus ($The, '80%')

                    // 页面进入
                    i.page.comeIn ($The, route_inst, function ($Enter) {
                        var
                            $Item = $Enter.find ('.item').eq (0)

                        i.scroll.getInst ().setSnapSize ($Item.width (), $Item.height ())

                    })
                }
            }, true)

            // 恢复scroll y轴移动 并设置container高度
            // if(window['__SHOW_INDEX_HOT_MODEL']){//对非江苏移动页面进行处理
            //     var $brand_container = i.handle.getBrandContainer(),
            //         brand_scroller = i.handle.getBrandScrollInst()
                // $brand_container.height('auto')
                // brand_scroller.options.scrollingY = true
                // i.handle.setBrandScrollY(true)
            // }
            i.handle.setBrandScrollY(true)

        },

        /**
         * 选中机型大类，展示机型子类
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!/brand/:brand_id/pid/:model_id' : function (route_inst, route, direction, url, request) {

            __setKeywordStatus ('')
            __setRecycleCateStatus('1')

            __renderBrandList('1')

            var _global_data = i.data.url_query['_global_data'] || {}
            var pad = _global_data['pad']

            i.page.generateIds (url)

            i.page.generator ({
                // 页面id
                id     : i.page.getId (url),
                // 数据（可以是页面输出数据，也可以是异步请求参数）
                data   : {
                    step     : 1,
                    brand_id : request[ 'brand_id' ],
                    model_id : request[ 'model_id' ],
                    pad      : pad
                },
                target : i.getContainer (),
                // 页面输出函数,
                // 并且含有同名绑定事件
                render : 'modelList',

                complete : function ($The) {
                    $('.block-sn-xd-912j').hide()
                    __setBrandStatus (request[ 'brand_id' ])

                    // 设置有品牌被选中的状态
                    __setBrandHasSelected()

                    __setModelListStatus ($The, '80%')

                    // 页面进入
                    i.page.comeIn ($The, route_inst, function ($Enter) {
                        var
                            $Item = $Enter.find ('.item').eq (0)

                        i.scroll.getInst ().setSnapSize ($Item.width (), $Item.height ())

                    })
                }
            }, true)

            i.handle.setBrandScrollY(true)
        },

        /**
         * 搜索列表
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!/search/:keyword' : function (route_inst, route, direction, url, request) {

            __setKeywordStatus (request[ 'keyword' ])
            __setRecycleCateStatus()

            var $SearchForm = $('#brandSearchForm')
            var data = tcb.queryUrl($SearchForm.serialize())
            var show_index_recycle_cate = window.__SHOW_INDEX_RECYCLE_CATE || []
            if (!data.category_id && show_index_recycle_cate.length === 1) {
                data.category_id = show_index_recycle_cate[0]
            }

            i.page.generateIds (url)

            i.page.generator ({
                // 页面id
                id     : i.page.getId (url),
                // 数据（可以是页面输出数据，也可以是异步请求参数）
                data   : data,
                target : i.getContainer (),
                // 页面输出函数,
                // 并且含有同名绑定事件
                render : 'searchList',

                complete : function ($The) {
                    $('.block-sn-xd-912j').hide()
                    __setBrandStatus ('', true)

                    __setModelListStatus ($The, '100%')

                    i.handle.resetBrandListScrollDimension()
                    //setTimeout (i.handle.resetBrandListScrollDimension, 500)

                    // 页面进入
                    i.page.comeIn ($The, route_inst, function ($Enter) {
                        var
                            $Item = $Enter.find ('.item').eq (0)

                        i.scroll.getInst ().setSnapSize ($Item.width (), $Item.height ())

                    })
                }
            }, true)
        },

        /**
         * 笔记本回收
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!/notebook/brand/:brand_id' : function (route_inst, route, direction, url, request) {

            __setKeywordStatus ('')
            __setRecycleCateStatus('10')

            __renderBrandList('10')

            i.page.generateIds (url)

            i.page.generator ({
                // 页面id
                id     : i.page.getId (url),
                // 数据（可以是页面输出数据，也可以是异步请求参数）
                data   : {
                    step     : 0,
                    brand_id : request[ 'brand_id' ] || 10
                },
                target : i.getContainer (),
                // 页面输出函数,
                // 并且含有同名绑定事件
                render : 'notebookList',

                complete : function ($The) {
                    $('.block-sn-xd-912j').hide()
                    // __setBrandStatus ('', true)
                    //
                    // __setModelListStatus ($The, '100%')

                    __setBrandStatus (request[ 'brand_id' ])
                    // 设置有品牌被选中的状态
                    __setBrandHasSelected()

                    __setModelListStatus ($The, '80%')


                    // 页面进入
                    i.page.comeIn ($The, route_inst, function ($Enter) {
                        var
                            $Item = $Enter.find ('.item').eq (0)

                        i.scroll.getInst ().setSnapSize ($Item.width (), $Item.height ())

                    })
                }
            }, true)

            i.handle.setBrandScrollY(true)
        },
        /**
         * 笔记本回收
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!/notebook/brand/:brand_id/pid/:model_id' : function (route_inst, route, direction, url, request) {

            __setKeywordStatus ('')
            __setRecycleCateStatus('10')

            __renderBrandList('10')

            i.page.generateIds (url)

            i.page.generator ({
                // 页面id
                id     : i.page.getId (url),
                // 数据（可以是页面输出数据，也可以是异步请求参数）
                data   : {
                    step     : 1,
                    brand_id : request[ 'brand_id' ] || 10,
                    model_id : request[ 'model_id' ]
                },
                target : i.getContainer (),
                // 页面输出函数,
                // 并且含有同名绑定事件
                render : 'notebookList',

                complete : function ($The) {
                    $('.block-sn-xd-912j').hide()
                    // __setBrandStatus ('', true)
                    //
                    // __setModelListStatus ($The, '100%')

                    __setBrandStatus (request[ 'brand_id' ])
                    // 设置有品牌被选中的状态
                    __setBrandHasSelected()

                    __setModelListStatus ($The, '80%')

                    // 页面进入
                    i.page.comeIn ($The, route_inst, function ($Enter) {
                        var
                            $Item = $Enter.find ('.item').eq (0)

                        i.scroll.getInst ().setSnapSize ($Item.width (), $Item.height ())

                    })
                }
            }, true)

            i.handle.setBrandScrollY(true)
        },
        /**
         * 笔记本回收
         * @param route_inst
         * @param route
         * @param direction
         * @param url
         * @param request
         */
        '!/whitegoods' : function (route_inst, route, direction, url, request) {

            __setKeywordStatus ('')
            __setRecycleCateStatus('20')

            i.page.generateIds (url)

            i.page.generator ({
                // 页面id
                id     : i.page.getId (url),
                // 数据（可以是页面输出数据，也可以是异步请求参数）
                data   : {},
                target : i.getContainer (),
                // 页面输出函数,
                // 并且含有同名绑定事件
                render : 'whiteGoodsList',

                complete : function ($The) {
                    $('.block-sn-xd-912j').hide()
                    __setBrandStatus ('', true)

                    __setModelListStatus ($The, '100%')

                    // 页面进入
                    i.page.comeIn ($The, route_inst, function ($Enter) {})
                }
            }, true)
        }

    }


    // =================================================================
    // 私有接口 private
    // =================================================================

    function __setKeywordStatus (keyword) {
        var
            $SearchForm = $ ('#brandSearchForm')

        $SearchForm.find ('[name="keyword"]').val (decodeURIComponent (keyword || ''))

        if (keyword || 'partner-jiangsu-yidong'==window.__TPL_TYPE) {
            // 有搜索关键词，表示进入搜索页
            $SearchForm.find ('.icon-back2').show ()
            $SearchForm.find ('.input-radius-circle').css ({
                'margin-left' : '.44rem'
            })
        } else {
            $SearchForm.find ('.icon-back2').hide ()
            $SearchForm.find ('.input-radius-circle').css ({
                'margin-left' : '.12rem'
            })
        }
    }

    // 设置无品牌被选中的状态
    function __setBrandNoneSelected () {
        var
            $BlockModelList = i.getContainer (),
            $BlockBrandList = i.handle.getBrandContainer(),
            $BlockHeader = $('#Header'),
            $BlockTop = $('.block-top'),
            $BlockSearchBox = $('.block-search-box'),
            $BlockRecycleCateTab = $ ('.block-recycle-cate-tab'),
            $BlockUserOfPrize = $('.block-user-of-prize-list'),
            $BlockHotModel = $('.block-hot-model-wrap'),
            $BlockSpecialYouku = $('.block-special-youku'),
            $BlockUserComment = $('.block-user-comment'),
            $BlockHsPartner = $('.block-hs-partner')

        // 显示滑动图
        var
            $slideWrap = $BlockTop.find('.slide-shower-wrap').show(),
            slideInst = tcb.cache('keySlideInst')
        // 轮播图懒加载
        tcb.lazyLoadImg(100, $slideWrap)
        if (!slideInst){
            slideInst = Bang.slide($slideWrap)
            tcb.cache('keySlideInst', slideInst)
        }

        //显示用户中奖列表
        $BlockUserOfPrize.show()
        //显示热门机型
        $BlockHotModel.show()
        $BlockSpecialYouku.show()
        $BlockHsPartner.show()
        //显示用户评论
        $BlockUserComment.show()
        //显示现金加价，限时疯抢
        $('.block-crazy-coupon').show()
        var instBlockCrazyCouponScroll = tcb.cache('INST_BLOCK_CRAZY_COUPON_SCROLL')
        if (instBlockCrazyCouponScroll){
            instBlockCrazyCouponScroll.setDimensions()
        }

        // var top = $BlockHeader.height () + $BlockTop.height () + $BlockSearchBox.height () + $BlockRecycleCateTab.height ()
        //
        // //如果有中奖名单滚动部分，加在top上
        // if($BlockUserOfPrize && $BlockUserOfPrize.length !=0){
        //     top += $BlockUserOfPrize.height()
        // }
        // //如果有热门机型，加在top上
        // if($BlockHotModel && $BlockHotModel.length !=0){
        //     top += $BlockHotModel.height()
        // }
        //
        $BlockModelList.html ('').css ({
            // top   : top,
            width : '0'
        })

        $BlockBrandList
            .addClass ('inner-col-3').css ({
                // top     : top,
                width   : '100%',
                display : 'block',
                position: 'static'
            })
            .find ('.block-brand-list-inner').css ({
                'visibility' : 'visible'
            })
            .find ('.item').removeClass ('checked checked-prev checked-next')

        // 将所有尺寸置为0，避免由型号选择页面返回时品牌选择不置顶
        i.handle.resetBrandListScrollDimension (0, 0, 0, 0)
        // 延时设置滚动尺寸，避免动画效果的延时导致宽高检测不准确
        setTimeout (i.handle.resetBrandListScrollDimension, 500)
    }

    // 设置有品牌被选中的状态
    function __setBrandHasSelected(){
        var
            $BlockModelList = i.getContainer (),
            $BlockBrandList = i.handle.getBrandContainer()

        $BlockModelList.css ({
            width : '80%'
        })
        $BlockBrandList
            .removeClass ('inner-col-3').css ({
                width : '20%',
                position: 'absolute'
            })
            .find ('.block-brand-list-inner').css ({
                'visibility' : 'visible'
            })

        // 延时设置滚动尺寸，避免动画效果的延时导致宽高检测不准确
        setTimeout(function(){

            i.handle.resetBrandListScrollDimension()

            var
                inst = i.handle.getBrandScrollInst(),
                $Inner = i.handle.getBrandInner(),
                $checked = $BlockBrandList.find('.checked'),

                scroll_top_max = $Inner.height()-$BlockBrandList.height(),
                clicked_index = $checked.index(),
                scroll_top_target = $checked.height()*clicked_index

            // 目标滚动位置大于可滚动的最大值时，直接采用可滚动最大值作为目标滚动位置
            scroll_top_target = scroll_top_target>scroll_top_max ? scroll_top_max : scroll_top_target

            inst.scrollTo(0, scroll_top_target, true)

            //i.handle.removeBrandClickedInAttr()

        }, 100)
    }

    // 设置品牌列表的状态，选中指定品牌、或者隐藏品牌列表
    function __setBrandStatus (brand_id, hide_flag) {
        var
            $BlockBrandList = $ ('#BlockBrandList')
        if (hide_flag) {
            $BlockBrandList.hide ()
        } else {
            var
                $Items = $BlockBrandList.find ('.item'),
                $Item = $Items.filter ('[data-bid="' + brand_id + '"]')

            if (!($Item && $Item.length)) {
                $Item = $Items.filter ('[data-bid="0"]')
            }

            var $BlockHeader = $('#Header'),
                $BlockTop = $('.block-top'),
                $BlockSearchBox = $('.block-search-box'),
                $BlockRecycleCateTab = $('.block-recycle-cate-tab')

            // 显示滑动图
            $BlockTop.find('.slide-shower-wrap').hide()
            //隐藏用户中奖列表
            $('.block-user-of-prize-list').hide()
            //隐藏热门机型
            $('.block-hot-model-wrap').hide()
            $('.block-special-youku').hide()
            $('.block-hs-partner').hide()
            //隐藏用户评论
            $('.block-user-comment').hide()
            //隐藏现金加价，限时疯抢
            $('.block-crazy-coupon').hide()

            var top = $BlockHeader.height () + $BlockTop.height() + $BlockSearchBox.height() + $BlockRecycleCateTab.height()

            $BlockBrandList.css({
                top : top,
                display : 'block'
            })

            $Items.removeClass ('checked checked-prev checked-next')
            $Item.addClass ('checked')
            $Item.prev().addClass('checked-prev')
            $Item.next().addClass('checked-next')
        }
    }

    function __setModelListStatus ($Inner, width) {
        var
            $Container = i.scroll.getContainer (),
            $Item = $Inner.find ('.item').eq (0),
            innerOffset = $Inner.offset (),

            // 滚动位置
            // 根据滚动位置设定新的内容虚拟高度(限定滚动的最大位置)
            inner_height = Math.max ($Container.height (), innerOffset[ 'height' ])

        var $BlockHeader = $('#Header'),
            $BlockTop = $('.block-top'),
            $BlockSearchBox = $('.block-search-box'),
            $BlockRecycleCateTab = $('.block-recycle-cate-tab')

        // 隐藏滑动图
        $BlockTop.find('.slide-shower-wrap').hide()
        //隐藏用户中奖列表
        $('.block-user-of-prize-list').hide()
        //隐藏热门机型
        $('.block-hot-model-wrap').hide()
        $('.block-special-youku').hide()
        $('.block-hs-partner').hide()
        //隐藏用户评论
        $('.block-user-comment').hide()
        //隐藏现金加价，限时疯抢
        $('.block-crazy-coupon').hide()

        var top = $BlockHeader.height () + $BlockTop.height() + $BlockSearchBox.height() + $BlockRecycleCateTab.height()

        $Container.css ({
            top : top,
            width : width
        })

        i.scroll.setInner ($Inner)
        i.scroll.getInst ().setSnapSize ($Item.width (), $Item.height ())
        i.scroll.setDimensions (0, 0, 0, inner_height)
    }

    // 设置回收分类的状态
    function __setRecycleCateStatus(cate_id){
        var
            $BlockRecycleCateTab = $('.block-recycle-cate-tab'),
            $TabItem = $BlockRecycleCateTab.find('[data-cate-id="'+cate_id+'"]')
        if ($TabItem&&$TabItem.length){
            $BlockRecycleCateTab.show()
            $TabItem.addClass('item-selected').siblings('.item-selected').removeClass('item-selected')
        } else {
            $BlockRecycleCateTab.hide()
        }
    }

    function __renderBrandList(category_id) {
        var brandList = window.__BRAND_LIST_MOBILE||[]
        if (category_id=='10'){
            brandList = window.__BRAND_LIST_NOOTBOOK||[]
        } else {
            category_id = '1'
        }
        if (window.__IS_IN_YANJI_ANDROID && brandList && brandList[0] && brandList[0]['brand_id']=='10'){
            brandList.shift()
        }
        var _global_data = tcb.queryUrl(window.location.search, '_global_data'),
            showBrands = []
        if (_global_data){
            try{
                _global_data = JSON.parse(tcb.html_decode(decodeURIComponent(_global_data)))
                showBrands = _global_data['show_brands']
            }catch (ex){tcb.error(ex)}
        }

        i.renderMap.brandList({
            target: $('#BlockBrandList .block-brand-list-inner'),
            data: {
                category_id : category_id,
                brandList : showBrands&&showBrands.length ? brandList.filter(function(brandItem){return showBrands.indexOf(brandItem.brand_id)>-1}) : brandList
            },
            event: tcb.noop,
            complete: function () {
                i.handle.resetBrandListScrollDimension ()
            }
        })
    }

} (this)



;/**import from `/resource/js/mobile/huishou/index/_start.js` **/
!function (global) {
    // 确保回收首页才执行
    if (window.__PAGE !== 'index') {
        return
    }

    var
        Root = tcb.getRoot(),
        i = Root.Index

    // 初始化评估页面
    // DOM READY at callback
    i.init({
        // 前置处理
        before: function () {
            i.data.url_query = tcb.queryUrl(window.location.search) || {}
            if (i.data.url_query['_global_data']) {
                try {
                    i.data.url_query['_global_data'] = $.parseJSON(tcb.html_decode(i.data.url_query['_global_data']))
                } catch (ex) {
                    i.data.url_query['_global_data'] = {}
                }
            } else {
                i.data.url_query['_global_data'] = {}
            }

            // 加载render函数表
            i.page.addRender(i.renderMap)
            // 加载event函数表
            i.page.addEvent(i.eventMap)

        },
        // DOM READY之后
        after: function () {
            // 初始化品牌的滚动事件
            i.handle.initBrandScroll()

            // 初始化页面滚动功能
            i.scroll.init(i.getContainer(), {
                snapping: true,
                scrollingX: true,
                bouncing: false
            })

            // 生成路由实例
            i.router_inst = i.router(i.route_map)

            //// ***** hash路由情况下这很重要,用以将hash route和page建立映射*****
            //// 根据路由列表,生成路由地址和页面唯一的映射关系
            //i.page.generateIds (i.router_inst.list ())

            // if (window.__IS_SUNING_YUNDIAN_MINIAPP) {
            var hash = tcb.trim(tcb.trim(tcb.trim(window.location.hash, '#'), '!'), '/')
            if ((!hash || hash.indexOf('brand/')===-1) && i.data.url_query && i.data.url_query.brand_id) {
                hash = '#!/brand/' + i.data.url_query.brand_id
                i.data.url_query.pid && (hash += '/pid/' + i.data.url_query.pid)
                window.location.hash = hash
            } else if (!hash && window.__IS_PARTNER_FENGXIU && window.performance.navigation.type !== 2) {
                window.location.hash='#!/brand/10'
            }
            // }

            // 初始化路由功能
            i.router_inst.init()
        }
    })

}(this)



;/**import from `/resource/js/mobile/huishou/inc/yuyue_kuaidi.js` **/
var YuyueKuaidi = (function(){

    var
        Root = tcb.getRoot (),
        o = Root.Order

    // 获取果果相关信息
    function __getGuoGuoForm (order_id, redirect_url, callback) {
        if (!order_id) {
            return $.dialog.toast ('订单号不能为空', 2000)
        }

        $.ajax ({
            type     : 'GET',
            url      : tcb.setUrl2('/huishou/doGetGuoguoForm'),
            data     : {
                parent_id : order_id
            },
            dataType : 'json',
            timeout  : 5000,
            success  : function (res) {

                if (res[ 'errno' ]) {
                    window.location.href = redirect_url

                    return //$.dialog.toast (res[ 'errmsg' ], 2000)
                }

                typeof callback === 'function' && callback (res[ 'result' ])

                // 天机汇帮卖寄件地区选择改为省市区都可选
                window.__IS_TJH_BANGMAI && initCitySelect($('.form-schedule-pickup'))
            },
            error    : function () {
                window.location.href = redirect_url
                //$.dialog.toast ('系统异常，请重试', 2000)
            }
        })

    }

    // 城市选择器
    function initCitySelect($form) {

        var
            $trigger = $form.find('.trigger-select-province-city-area'),
            province = $form.find('.i-shipping-province').html() || '',
            city = $form.find('.i-shipping-city').html() || '',
            area = $form.find('.i-shipping-area').html() || '',
            options = {
                className: 'shipping-address-select-block-shop-register',
                // 实例化的时候自动执行init函数
                flagAutoInit: true,
                selectorTrigger: $trigger,
                selectorProvince: '',
                selectorCity: '',
                selectorArea: '',
                province: province,
                city: city,
                area: area,
                //show_city        : false,
                // show_area        : false,
                not_render: true,
                callback_on_show: null,
                callback_cancel: null,
                callback_confirm: function (region) {
                    region = region || {}

                    // $form.find('[name="express_province"]').val(region['provinceCode'])
                    // $form.find('[name="express_city"]').val(region['cityCode'])
                    // $form.find('[name="express_area"]').val(region['areaCode'])
                    $form.find('[name="express_province"]').val(region['province'])
                    $form.find('[name="express_city"]').val(region['city'])
                    $form.find('[name="express_area"]').val(region['area'])

                    var str = ''
                    // 设置省
                    str += '<span class="i-shipping-province">' + region['province'] + '</span>'
                    // 设置城市
                    str += ' <span class="i-shipping-city">' + region['city'] + '</span>'
                    // 设置区县
                    str += ' <span class="i-shipping-area">' + region['area'] + '</span>'
                    $trigger.removeClass('default').html(str)
                }
            }

        // 初始化省/市/区县选择器
        Bang.AddressSelect2(options)
    }

    // 绑定预约取件相关事件
    function __bindEventSchedulePickup ($Target, redirect_url) {
        if (!($Target && $Target.length)) {
            return
        }
        var
            $time_trigger = $Target.find('[name="express_time_alias"]'),
            $form = $Target.find('form'),
            $btn = $Target.find('.btn-submit')

        // 选择上门取件时间
        new $.datetime ($time_trigger, {
            remote  : tcb.setUrl2('/huishou/doGetAbleExpressTimeTable'),
            noStyle : true
        })

        // 预约上门取件表单
        __bindFormSubmit ({
            $form  : $form,
            $btn   : $btn,
            valid  : window.__IS_TJH_BANGMAI?'schedulePickupForm2':'schedulePickupForm',
            post   : 'postSchedulePickupForm',
            before : function ($Form) {
                var
                    $express_time_alias = $Form.find ('[name="express_time_alias"]'),
                    $express_time = $Form.find ('[name="express_time"]')

                $express_time.val('')
                if ($express_time_alias && $express_time_alias.val()){
                    var
                        date_time = $express_time_alias.val()

                    date_time = date_time.split('-')
                    if (date_time.length>1){
                        date_time.pop()
                    }
                    date_time = date_time.join('-')

                    $express_time.val(date_time)
                }
            },
            after  : function (data, errno) {
                if (errno) {
                    return
                }

                __showSchedulePickupSuccess(redirect_url)
            }
        })

    }

    // 显示预约取件成功
    function __showSchedulePickupSuccess (redirect_url) {

        var
            html_fn = $.tmpl (tcb.trim ($ ('#JsMHSSchedulePickupSuccessPanelTpl').html ())),
            html_st = html_fn ({
                data : {
                    url : redirect_url
                }
            })

        tcb.closeDialog()

        tcb.showDialog (html_st, {
            className : 'schedule-pickup-success-panel',
            withClose : false,
            middle    : true
        })

    }

    // 绑定表单提交事件
    function __bindFormSubmit (options) {
        var
            $Form = options[ '$form' ]
        if (!($Form && $Form.length)) {
            return //console.error ('表单都没有，提交个串串？')
        }
        $Form.on ('submit', function (e) {
            e.preventDefault ()

            var
                $me = $ (this)

            // before
            if (typeof options[ 'before' ] === 'function'){
                if (options[ 'before' ] ($Form)===false){
                    // before函数返回值绝等于 false 时，直接返回退出表单提交

                    return
                }
            }

            // 验证表单
            if (options[ 'valid' ] && !o.valid[ options[ 'valid' ] ] ($Form)) {

                return console.error ('表单验证失败了，检查检查呗～')
            }

            // afterValid
            if (typeof options[ 'afterValid' ] === 'function'){
                if (options[ 'afterValid' ] ($Form)===false){
                    // afterValid函数返回值绝等于 false 时，直接返回退出表单提交

                    return
                }
            }

            var
                $Btn = options[ '$btn' ] || $ ('#BtnSubmitOrderForm'),
                default_btn_text = $Btn.val()

            $Btn.addClass ('btn-disabled').val ('提交中...')
            // 提交表单数据
            o.data[ options[ 'post' ] ] ($me, function (data, errno) {

                if (errno) {
                    $Btn.removeClass ('btn-disabled').val (default_btn_text)
                }

                // after
                typeof options[ 'after' ] === 'function' && options[ 'after' ] (data, errno)

            }, function () {

                $.dialog.toast ('系统异常，请重试')

                $Btn.removeClass ('btn-disabled').val (default_btn_text)
            })

        })
    }


    return {
        getGuoGuoForm:__getGuoGuoForm,
        bindEventSchedulePickup:__bindEventSchedulePickup
    }
})();

