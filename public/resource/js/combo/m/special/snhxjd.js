;/**import from `/resource/js/component/m/shareintro.js` **/
(function(){
    window.Bang = window.Bang || {};

    var __options = {
        hash: '',
        img: '',
        ext_html: ''
    };
    /**
     * 分享引导
     */
    function activeShareIntro(options){
        __options = options || {};

        var $share_intro = $('.m-fenxiang-intro-wrap');
        if (!$share_intro.length) {
            var html_str = '<div class="m-fenxiang-intro-wrap">'
                +'<a class="m-fenxiang-intro-bg" href="#"></a>'
                +'<div class="m-fenxiang-intro-inner">' +
                '<a class="m-fenxiang-intro" href="#">' +
                '<img class="w100" src="'+(__options.img ? __options.img : 'https://p.ssl.qhimg.com/t010deb0787edd39c10.png')+'" alt=""/>';

            if (__options&&__options['ext_html']){
                html_str += __options['ext_html'];
            }
            html_str += '</a> </div> </div>';

            var mask_h = $('body').height(),
                window_h = $(window).height();
            if (mask_h<window_h){
                mask_h = window_h;
            }

            var $html_str = $(html_str);
            $html_str.appendTo('body').css({
                'height': mask_h
            });

            setTimeout(function(){
                var mask_h = $('body').height(),
                    window_h = $(window).height();
                if (mask_h<window_h){
                    mask_h = window_h;
                }
                $html_str.css({
                    'height': mask_h
                });
            }, 1000);

            $share_intro = $('.m-fenxiang-intro-wrap');
        }

        $(window).scrollTop(0);


        var $mainbody = $('.mainbody');
        if( $mainbody && $mainbody.length ){
            $mainbody.addClass('blur');
        }

        $share_intro.show();
    }
    /**
     * 关闭分享弹层
     */
    function closeShareIntro(){
        var $intro = $('.m-fenxiang-intro-wrap');
        if ($intro.length) {
            $intro.remove();
        }

        var hash = __options['hash'] || '';
        if (hash) {
            var hashs = tcb.parseHash(window.location.hash);
            // hashs的kv对象中拥有此hash
            if ( typeof hashs[hash]!=='undefined' ) {
                delete hashs[hash];
            }

            window.location.hash = $.param(hashs)
        }

        var $mainbody = $('.mainbody');
        if( $mainbody && $mainbody.length ){
            $mainbody.removeClass('blur');
        }
    }

    function init(){

        tcb.bindEvent({
            // 关闭分享引导
            '.m-fenxiang-intro-bg, .m-fenxiang-intro': function(e){
                e.preventDefault();
                closeShareIntro();
            }

        });

    }
    init();

    window.Bang.ShareIntro = {
        active: activeShareIntro,
        close: closeShareIntro
    };
}());

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

;/**import from `/resource/js/mobile/special/201612/snhxjd.js` **/
;!function(){
    var
        wxData = {
            "title"   : '1209来苏宁，0元拿家电',
            "desc"    : '旧手机换新家电，来苏宁百款家电0元搬回家',
            "link"    : window.location.protocol + '//' + window.location.host + '/m/sn1209',
            "imgUrl"  : 'https://p.ssl.qhimg.com/t0199d2a2257e7a09b2.png',
            "success" : tcb.noop, // 用户确认分享的回调
            "cancel"  : tcb.noop // 用户取消分享
        }

    if (typeof wx !== 'undefined'){
        // 微信分享
        wx.ready ( function () {

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            wx.onMenuShareAppMessage ( wxData )
            // 点击分享到朋友圈，会执行下面这个代码
            wx.onMenuShareTimeline ( wxData )
            //分享到QQ
            wx.onMenuShareQQ ( wxData )
        })

        if (tcb.validMobile(window.__mobile)){
            wxData.success = loginUserShareSuccess
        }
    }

    // 已登录用户分享成功
    function loginUserShareSuccess(){
        var
            mobile = window.__mobile

        window.location.href = window.location.protocol + '//' + window.location.host + '/m/luckDraw?user_mobile='+mobile
    }

    // dom ready
    $ (function () {
        var
            root = tcb.getRoot ()
            // 路由
            , Router = root.Router


        if ($ ('.page-hd-snhxjd').length) {
            // 活动首页

            // 生成路由实例
            window.router_inst = Router (window.route_map)
            // 初始化路由功能
            window.router_inst.init ()

        } else if ($ ('.page-hd-snhxjd-promo').length) {
            // 获取增值券的页面

            $('#FormCheckReceivePromo').on('submit', function(e){
                e.preventDefault()

                var
                    $form = $(this)

                if (!validFormCheckReceivePromo($form)){

                    return
                }

                //if (tcb.cache ('form-check-receive-promo-errmsg')) {
                //    if (tcb.cache('form-check-receive-promo-errno')=='10622'){
                //        // 已经领过优惠券，还未抽奖，显示引导提示分享
                //
                //        showShareIntro()
                //    } else {
                //        $.dialog.toast (tcb.cache ('form-check-receive-promo-errmsg'), 2000)
                //    }
                //    return
                //}

                $.ajax ({
                    type     : $form.attr('method'),
                    url      : $form.attr('action'),
                    data     : $form.serialize(),
                    dataType : 'json',
                    timeout  : 5000,
                    success  : function (res) {
                        var
                            $mobile = $form.find('[name="user_mobile"]'),
                            mobile = tcb.trim ($mobile.val ())

                        if (res['errno']){
                            // cache返回的错误信息，避免下次重复发送请求
                            //tcb.cache('form-check-receive-promo-mobile', res[ 'errmsg' ])
                            //tcb.cache('form-check-receive-promo-errmsg', res[ 'errmsg' ])
                            //tcb.cache('form-check-receive-promo-errno', res[ 'errno' ])

                            if (res['errno']=='10622' && window.__is_weixin){
                                // 已经领过优惠券，还未抽奖，显示引导提示分享

                                showShareIntro()

                                // 获取增值码提交成功，设置分享成功回调函数
                                window.__mobile = mobile
                                wxData.success = loginUserShareSuccess

                            } else {

                                $.dialog.toast (res[ 'errmsg' ], 2000)
                            }

                        } else {

                            showSubReceivePromo(mobile)
                        }
                    },
                    error    : function () {
                        $.dialog.toast ('系统错误，请刷新页面重试', 2000)
                    }
                })
            })

            function validFormCheckReceivePromo($form){
                if (!($form && $form.length)){
                    console.log('找不到表单')
                    return false
                }
                var
                    flag = true,
                    $mobile = $form.find('[name="user_mobile"]')

                if ($mobile && $mobile.length){
                    var mobile = tcb.trim($mobile.val())
                    if (!mobile || !tcb.validMobile(mobile)){
                        flag = false

                        $.errorAnimate($mobile)
                        setTimeout(function () {
                            $mobile.focus()
                        }, 300)
                    }
                }

                return flag
            }

            // 打开提交获取优惠码弹层
            function showSubReceivePromo(mobile){

                var
                    html_fn = $.tmpl (tcb.trim ($ ('#JsMSuNingHuanXinJiaDianSubReceivePromoTpl').html ())),
                    html_st = html_fn ({
                        user_mobile : mobile
                    })

                var
                    dialog = tcb.showDialog (html_st, {
                        className : 'sub-receive-promo-wrap',
                        withClose : true,
                        middle    : true
                    }),
                    $form = dialog.wrap.find ('form')

                // 绑定相关事件
                bindEventSubReceivePromo ($form)
            }

            function bindEventSubReceivePromo($form){
                // 提交获取优惠券表单
                $form.on('submit', function(e){
                    e.preventDefault()

                    var
                        $form = $(this)
                    if (!validFormSubReceivePromo($form)){
                        return
                    }

                    $.ajax ({
                        type     : $form.attr('method'),
                        url      : $form.attr('action'),
                        data     : $form.serialize(),
                        dataType : 'json',
                        timeout  : 5000,
                        success  : function (res) {

                            if (res[ 'errno' ]) {
                                return $.dialog.toast (res[ 'errmsg' ], 2000)
                            }

                            tcb.closeDialog()

                            if (window.__is_weixin){
                                // 触发显示分享引导
                                showShareIntro()

                                // 获取增值码提交成功，设置分享成功回调函数
                                var
                                    mobile = $form.find('[name="user_mobile"]').val()
                                window.__mobile = mobile
                                wxData.success = loginUserShareSuccess
                            } else {
                                $.dialog.toast('恭喜您，回收增值券领取成功！', 2000)
                            }
                        },
                        error    : function () {
                            $.dialog.toast('系统错误，请刷新页面重试', 2000)
                        }
                    })

                })
                // 获取手机验证码
                $form.find('.btn-get-sms-code').on('click', function(e){
                    e.preventDefault()

                    var
                        $me = $ (this),
                        $form = $me.closest ('form'),
                        $mobile = $form.find ('[name="user_mobile"]'),
                        $secode = $form.find ('[name="secode"]')

                    if (!validSeCode($me)) {
                        return
                    }

                    getSMSCode ({
                        'user_mobile' : $.trim($mobile.val ()),
                        'secode' : $.trim($secode.val ())
                    }, function (data) {
                        $me.addClass ('btn-get-sms-code-disabled').html ('60秒后再次发送')

                        tcb.distimeAnim (60, function (time) {
                            if (time <= 0) {
                                $me.removeClass ('btn-get-sms-code-disabled').html ('发送验证码')
                            } else {
                                $me.html (time + '秒后再次发送')
                            }
                        })
                    })
                })
                // 刷新图像验证码
                $form.find('.vcode-img').on('click', function(e){
                    var
                        $me = $(this),
                        $secode_img = $('.vcode-img'),
                        $secode = $('[name="secode"]'),
                        src = '/secode/?rands=' + Math.random ()

                    $secode_img.attr ('src', src)

                    $secode.val('')

                    $me.closest('.row').find('[name="secode"]').focus()
                })
            }
            // 验证获取优惠券表单提交
            function validFormSubReceivePromo ($Form) {
                var
                    flag = true

                if (!($Form && $Form.length)) {
                    flag = false
                } else {

                    var
                        $mobile = $Form.find ('[name="user_mobile"]'),
                        // 图像验证码
                        $secode = $Form.find ('[name="secode"]'),
                        // 短信验证码
                        $smscode = $Form.find ('[name="sms_code"]'),

                        mobile = $.trim ($mobile.val ()),
                        secode = $.trim ($secode.val ()),
                        smscode = $.trim ($smscode.val ())

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
                    if (!secode) {
                        $.errorAnimate ($secode)
                        $focus_el = $focus_el || $secode
                        err_msg = err_msg || '图片验证码不能为空'
                    }

                    // 验证短信验证码
                    if (!smscode) {
                        $.errorAnimate ($smscode)
                        $focus_el = $focus_el || $smscode
                        err_msg = err_msg || '短信验证码不能为空'
                    }

                    if (err_msg) {
                        flag = false

                        setTimeout (function () {
                            $focus_el && $focus_el.focus ()
                        }, 500)

                        $.dialog.toast (err_msg)
                    }
                }

                return flag
            }
            // 验证优惠码表单
            function validSeCode ($Target) {
                var
                    flag = true

                if (!($Target && $Target.length)) {
                    flag = false
                } else {

                    var
                        $Form = $Target.closest ('form'),
                        $mobile = $Form.find ('[name="user_mobile"]'),
                        $secode = $Form.find ('[name="secode"]'),

                        mobile = $.trim ($mobile.val ()),
                        secode = $.trim ($secode.val ())

                    if ($Target.hasClass ('btn-get-sms-code-disabled')) {
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
            // 获取手机验证码
            function getSMSCode (params, callback, error) {
                $.ajax ({
                    type     : 'POST',
                    url      : '/m/doSendSmscode/',
                    data     : params,
                    dataType : 'json',
                    timeout  : 5000,
                    success  : function (res) {

                        if (res[ 'errno' ]) {
                            return $.dialog.toast (res[ 'errmsg' ], 2000)
                        }
                        typeof callback === 'function' && callback (res[ 'result' ])
                    },
                    error    : function () {
                        typeof error === 'function' && error ()
                    }
                })
            }

            // 触发显示分享引导
            function showShareIntro(){
                // 触发显示分享引导
                window.Bang.ShareIntro.active({
                    img : 'https://p.ssl.qhimg.com/t01c5d992454e4a99d1.png',
                    ext_html: '<div style="padding: .1rem 0;font-size:.22rem;line-height: 1.2;color: #fffc00;">恭喜您成功领取<br>20元回收增值券</div>' +
                    '<div style="padding-top:.1rem;font-size: .14rem;text-align: center;color: #fff;">分享至好友群或朋友圈<br/>立即参加免费抽奖</div>'
                })
            }

        } else if ($('.page-hd-snhxjd_lottery').length){
            // 抽奖页面

            // 点击抽奖
            $ ('.lottery-btn').on ('click', function (e) {
                e.preventDefault ()

                var
                    $me = $(this),
                    mobile = tcb.trim (tcb.queryUrl (window.location.href, 'user_mobile'))

                if ($me.hasClass('lottery-btn-disabled')){
                    return
                }

                if (!tcb.validMobile (mobile)) {
                    return $.dialog.toast ('抽奖凭证丢失，无法抽奖', 2000)
                }

                $.ajax ({
                    type     : 'POST',
                    url      : '/m/doSubLuckDraw/',
                    data     : {
                        user_mobile : mobile
                    },
                    dataType : 'json',
                    timeout  : 5000,
                    success  : function (res) {

                        if (res[ 'errno' ]) {
                            $.dialog.toast (res[ 'errmsg' ], 2000)
                        } else {
                            window.location.href = window.location.href
                        }
                    },
                    error    : function () {
                        $.dialog.toast('系统错误，请刷新页面重试', 2000)
                    }
                })


            })

        }

    })

}()

// =================================================================
// 首页单页处理，选择品牌、机型等
// =================================================================
;!function () {
    var
        root = tcb.getRoot ()
        , Swipe = root.SwipeSection
        // 路由
        , Router = root.Router
        // 模拟的页面滑动
        , Scroll = root.scroll
        // 页面生成器
        , Page = root.page
        // 获取数据的方法
        , dataMap = {
            modelList : getModelList
        }
        // Page内容输出映射
        , renderMap = {
            modelList : renderModelList
        }
        // Page内容事件绑定映射表
        , eventMap = {}
        // 路由映射表
        , route_map = {
            /**
             * 首页
             * @param route_inst
             * @param route
             * @param direction
             * @param url
             * @param request
             */
            '!' : function (route_inst, route, direction, url, request) {

                // 清除品牌列表的滚动事件
                root.handle.cleanBrandScroll ()

                Swipe.backLeftSwipeSection ()
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
                Page.generateIds (url)

                var
                    $BrandContainer = getBrandContainer (), // 获取品牌容器
                    $ModelContainer = getModelContainer ()  // 获取型号容器

                if (!$BrandContainer.find ('.item').length) {
                    // 没有品牌输出，先输出品牌列表，然后再处理型号选择页面

                    getBrandList (function () {

                        setModelPage ({
                            url             : url,
                            // 数据（可以是页面输出数据，也可以是异步请求参数）
                            data            : {
                                step     : 0,
                                brand_id : request[ 'brand_id' ]
                            },
                            router_inst     : router_inst,
                            $BrandContainer : $BrandContainer,
                            $ModelContainer : $ModelContainer
                        })
                    })
                } else {

                    // 已经有品牌列表，直接处理型号页面
                    setModelPage ({
                        url             : url,
                        // 数据（可以是页面输出数据，也可以是异步请求参数）
                        data            : {
                            step     : 0,
                            brand_id : request[ 'brand_id' ]
                        },
                        router_inst     : router_inst,
                        $BrandContainer : $BrandContainer,
                        $ModelContainer : $ModelContainer
                    })

                }

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
                Page.generateIds (url)

                var
                    $BrandContainer = getBrandContainer (), // 获取品牌容器
                    $ModelContainer = getModelContainer ()  // 获取型号容器

                if (!$BrandContainer.find ('.item').length) {
                    // 没有品牌输出，先输出品牌列表，然后再处理型号选择页面

                    getBrandList (function () {

                        setModelPage ({
                            url             : url,
                            // 数据（可以是页面输出数据，也可以是异步请求参数）
                            data            : {
                                step     : 1,
                                brand_id : request[ 'brand_id' ],
                                model_id : request[ 'model_id' ]
                            },
                            router_inst     : router_inst,
                            $BrandContainer : $BrandContainer,
                            $ModelContainer : $ModelContainer
                        })
                    })
                } else {

                    // 已经有品牌列表，直接处理型号页面
                    setModelPage ({
                        url             : url,
                        // 数据（可以是页面输出数据，也可以是异步请求参数）
                        data            : {
                            step     : 1,
                            brand_id : request[ 'brand_id' ],
                            model_id : request[ 'model_id' ]
                        },
                        router_inst     : router_inst,
                        $BrandContainer : $BrandContainer,
                        $ModelContainer : $ModelContainer
                    })
                }

            }

        }

    // 加载render函数表
    Page.addRender (renderMap)
    // 加载event函数表
    Page.addEvent (eventMap)

    window.route_map = route_map

    // =================================================================
    // 功能函数
    // =================================================================

    // 获取品牌容器
    function getBrandContainer (complete) {
        var
            $BrandContainer = $ ('#BlockBrandList'),
            $ModelContainer = null
        if (!($BrandContainer && $BrandContainer.length)) {
            var
                $swipe = __getSwipe(),
                brand_model_html = $.tmpl ($.trim ($ ('#JsMSuNingHuanXinJiaDianSectionBrandModelTpl').html ())) ()

            $swipe.find ('.swipe-section-inner').html (brand_model_html)

            Swipe.doLeftSwipeSection (0, function () {

                typeof complete === 'function' && complete ()
            })

            $BrandContainer = $ ('#BlockBrandList')
            $ModelContainer = $ ('#BlockModelList')

            // 初始化页面滚动功能
            Scroll.init ($ModelContainer, {
                snapping   : true,
                scrollingX : true,
                bouncing   : false
            })
        }

        return $BrandContainer
    }

    // 获取机型容器
    function getModelContainer (complete) {
        var
            $ModelContainer = $ ('#BlockModelList')
        if (!($ModelContainer && $ModelContainer.length)) {
            var
                $swipe = __getSwipe(),
                brand_model_html = $.tmpl ($.trim ($ ('#JsMSuNingHuanXinJiaDianSectionBrandModelTpl').html ())) ()

            $swipe.find ('.swipe-section-inner').html (brand_model_html)

            Swipe.doLeftSwipeSection (0, function () {

                typeof complete === 'function' && complete ()
            })

            $ModelContainer = $ ('#BlockModelList')

            // 初始化页面滚动功能
            Scroll.init ($ModelContainer, {
                snapping   : true,
                scrollingX : true,
                bouncing   : false
            })

        }

        return $ModelContainer
    }

    function __getSwipe(){
        var
            $swipe = Swipe.getSwipeSection ('.section-brand-model'),
            $close = $swipe.find('.icon-close')

        $close.off()
        $close.on('click', function(e){
            e.preventDefault()

            Swipe.backLeftSwipeSection (function(){
                window.location.replace(window.location.href.split('#')[0])
                //window.location.href = window.location.href.split('#')[0]
            })
        })

        return $swipe
    }

    // 获取品牌列表
    function getBrandList(callback){
        var
            brandList = tcb.cache ('i_am_brand_list') || null

        tcb.loadingStart ()

        if (brandList) {
            typeof getBrandListSuccess === 'function' && getBrandListSuccess (brandList, callback)
        } else {
            __ajax ({
                type : 'GET',
                url  : '/m/doGetHuishouBrand/'
            }, function (data) {
                // 加入cache
                tcb.cache ('i_am_brand_list', data)

                typeof getBrandListSuccess === 'function' && getBrandListSuccess (data, callback)

            }, getBrandListError)
        }
    }
    // 获取品牌列表成功
    function getBrandListSuccess(data, callback){
        var
            $Target = $ ('#BlockBrandList .block-brand-list-inner')

        __htmlRender ({
            id : '',

            data : {
                brandList : data
            },

            $T            : $ ('#JsMSuNingHuanXinJiaDianBrandList'),
            $Target       : $Target,
            $The          : null,
            flag_clean    : true,
            flag_fade_in  : true,
            flag_not_show : false
        })

        $Target.css({
            'visibility' : 'visible'
        })

        tcb.loadingDone ()

        // 初始化品牌的滚动事件
        root.handle.initBrandScroll ()

        typeof callback==='function' && callback()
    }
    // 获取品牌列表失败
    function getBrandListError(){
        tcb.loadingDone ()

        $.dialog.toast ('请求超时，请重试')
    }


    // 设置机型展示页
    function setModelPage(options){

        Page.generator ({
            // 页面id
            id     : Page.getId (options.url),
            // 数据（可以是页面输出数据，也可以是异步请求参数）
            data   : options.data,
            target : options.$ModelContainer,
            // 页面输出函数,
            // 并且含有同名绑定事件
            render : 'modelList',

            complete : function ($The) {
                __setBrandUIStatus (options.data['brand_id'])

                // 页面进入
                Page.comeIn ($The, options.router_inst, function ($Enter) {
                    var
                        $Item = $Enter.find ('.item').eq (0)

                    Scroll.getInst ().setSnapSize ($Item.width (), $Item.height ())
                })
            }
        }, true)

    }
    // 获取/输出机型列表
    function renderModelList (options) {

        __commonModelListRender ({
            id          : options[ 'id' ],
            target      : options[ 'target' ],
            step        : options[ 'data' ][ 'step' ] || 0,
            data        : options[ 'data' ],
            data_method : 'modelList',
            request     : {
                id : options[ 'data' ][ 'brand_id' ]
            },
            complete    : options[ 'complete' ],
            event       : options[ 'event' ]

        })
    }

    // 获取机型列表
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
            }, function (data) {
                // 加入cache
                tcb.cache ('i_am_model_list_' + str_params, data)

                typeof callback === 'function' && callback (data)
            }, error)
        }

    }


    // 设置品牌ui状态
    function __setBrandUIStatus (brand_id) {
        var
            $BlockBrandList = $ ('#BlockBrandList'),
            $Items = $BlockBrandList.find ('.item'),
            $Item = $Items.filter ('[data-bid="' + brand_id + '"]')

        if (!($Item && $Item.length)) {
            $Item = $Items.first()
        }

        // 设置品牌被选中状态
        $Items.removeClass ('checked')
        $Item.addClass ('checked')
    }

    // =================================================================
    // 私有接口 private
    // =================================================================

    // 机型列表输出方法
    function __commonModelListRender (options) {
        var
            $Target = options[ 'target' ]
        if (!($Target && $Target.length)) {
            return
        }

        var step = parseInt (options[ 'step' ], 10) || 0

        tcb.loadingStart()

        dataMap[ options[ 'data_method' ] ] (options[ 'request' ], function (data) {
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

                    $T            : $ ('#JsMSuNingHuanXinJiaDianModelList'),
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
            if (flag_fade_in&&$The&&$The.length) {
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
    // 发起异步请求
    function __ajax (params, callback, error) {
        $.ajax ({
            type     : params[ 'type' ],
            url      : params[ 'url' ],
            data     : params[ 'data' ],
            dataType : 'json',
            timeout  : 5000,
            success  : function (res) {

                if (res[ 'errno' ]) {
                    $.dialog.toast (res[ 'errmsg' ], 2000)
                }
                typeof callback === 'function' && callback (res[ 'result' ])
            },
            error    : function () {
                typeof error === 'function' && error ()
            }
        })
    }

}()
// =================================================================
// 品牌列表滑动处理
// =================================================================
;!function (global) {
    var
        Root = tcb.getRoot ()

    Root.handle = Root.handle || {}

    tcb.mix (Root.handle, {

        initBrandScroll               : __initBrandScroll,
        cleanBrandScroll              : __cleanBrandScroll,
        getBrandScrollInst            : __getScrollInst,
        getBrandContainer             : __getContainer,
        getBrandInner                 : __getInner,
        resetBrandListScrollDimension : __setBrandListScrollDimension

    })


    // =================================================================
    // 公共接口 public
    // =================================================================


    // =================================================================
    // 私有接口 private
    // =================================================================

    var
        _Inst = null,
        _callback = null,
        $_Container = null,
        $_Inner = null

    function __cleanBrandScroll(){
        _Inst = null
        _callback = null
        $_Container = null
        $_Inner = null
    }

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
                style_css = '.page-index .block-model-list .item,.page-index .block-brand-list .item{height: ' + item_new_h + 'px;line-height: ' + item_new_h + 'px;}'
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

        // 绑定滚动事件
        $Container.on ('touchstart', function (e) {

            // flag设置为true表示滑动开始
            flag = true

            // 滑动开始
            inst.doTouchStart (e.touches, e.timeStamp)
        })

        $Doc.on ('touchmove', function (e) {
            if (flag) {
                e.preventDefault ()

                // 滑动ing
                inst.doTouchMove (e.touches, e.timeStamp)
            }
        }, {passive : false})

        $Doc.on ('touchend', function (e) {

            // 滑动ing
            inst.doTouchEnd (e.timeStamp)
            // flag重置为false，表示滑动结束
            flag = false
        })

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

                window.router_inst.trigger (true)
            }
        })
    }

} (this)

