/*
 * Scroll
 *
 * modified from http://github.com/zynga/scroller
 */

/**
 * Generic animation class with support for dropped frames both optional easing and duration.
 *
 * Optional duration is useful when the lifetime is defined by another condition than time
 * e.g. speed of an animating object, etc.
 *
 * Dropped frame logic allows to keep using the same updater logic independent from the actual
 * rendering. This eases a lot of cases where it might be pretty complex to break down a state
 * based on the pure time difference.
 */
!function (global) {
    var
        Root = global.Bang = global.Bang || {}

    var time = Date.now || function () {
            return +new Date ();
        }
    var desiredFrames = 60;
    var millisecondsPerSecond = 1000;
    var running = {};
    var counter = 1;

    // Create namespaces
    if (!global.core) {
        global.core = { effect : {} };

    } else if (!core.effect) {
        core.effect = {};
    }

    core.effect.Animate = {

        /**
         * A requestAnimationFrame wrapper / polyfill.
         *
         * @param callback {Function} The callback to be invoked before the next repaint.
         * @param root {HTMLElement} The root element for the repaint
         */
        requestAnimationFrame : (function () {

            // 检查requestAnimationFrame的支持情况
            var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame;
            var isNative = !!requestFrame;

            if (requestFrame && !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test (requestFrame.toString ())) {
                isNative = false;
            }

            if (isNative) {
                return function (callback, root) {
                    requestFrame (callback, root)
                };
            }

            var TARGET_FPS = 60;
            var requests = {};
            var requestCount = 0;
            var rafHandle = 1;
            var intervalHandle = null;
            var lastActive = +new Date ();

            return function (callback, root) {
                var callbackHandle = rafHandle++;

                // Store callback
                requests[ callbackHandle ] = callback;
                requestCount++;

                // Create timeout at first request
                if (intervalHandle === null) {

                    intervalHandle = setInterval (function () {

                        var time = +new Date ();
                        var currentRequests = requests;

                        // Reset data structure before executing callbacks
                        requests = {};
                        requestCount = 0;

                        for (var key in currentRequests) {
                            if (currentRequests.hasOwnProperty (key)) {
                                currentRequests[ key ] (time);
                                lastActive = time;
                            }
                        }

                        // Disable the timeout when nothing happens for a certain
                        // period of time
                        if (time - lastActive > 2500) {
                            clearInterval (intervalHandle);
                            intervalHandle = null;
                        }

                    }, 1000 / TARGET_FPS);
                }

                return callbackHandle;
            };

        }) (),

        /**
         * 停止指定的动画
         *
         * @param id {Integer} 唯一的动画ID
         * @return {Boolean} 动画是否停止成功
         */
        stop : function (id) {
            var
                cleared = running[ id ] != null
            if (cleared) {
                running[ id ] = null
            }

            return cleared
        },

        /**
         * 指定动画是否还处于运行之中
         *
         * @param id {Integer} 唯一的动画ID
         * @return {Boolean} 动画是否还处于运行之中
         */
        isRunning : function (id) {
            return running[ id ] != null
        },

        /**
         * 动画开始
         *
         * @param stepCallback {Function} Pointer to function which is executed on every step.
         *   Signature of the method should be `function(percent, now, virtual) { return continueWithAnimation; }`
         * @param verifyCallback {Function} Executed before every animation step.
         *   Signature of the method should be `function() { return continueWithAnimation; }`
         * @param completedCallback {Function}
         *   Signature of the method should be `function(droppedFrames, finishedAnimation) {}`
         * @param duration {Integer} Milliseconds to run the animation
         * @param easingMethod {Function} Pointer to easing function
         *   Signature of the method should be `function(percent) { return modifiedValue; }`
         * @param root {Element ? document.body} Render root, when available. Used for internal
         *   usage of requestAnimationFrame.
         * @return {Integer} Identifier of animation. Can be used to stop it any time.
         */
        start : function (stepCallback, verifyCallback, completedCallback, duration, easingMethod, root) {

            var start = time ();
            var lastFrame = start;
            var percent = 0;
            var dropCounter = 0;
            var id = counter++;

            if (!root) {
                root = document.body;
            }

            // Compacting running db automatically every few new animations
            if (id % 20 === 0) {
                var newRunning = {};
                for (var usedId in running) {
                    newRunning[ usedId ] = true;
                }
                running = newRunning;
            }

            // 帧函数，按指定的微秒时间调用
            var step = function (virtual) {

                // Normalize virtual value
                var render = virtual !== true;

                // 获取当前时间
                var now = time ()

                // 下一帧动画执行之前，执行验证
                if (!running[ id ] || (verifyCallback && !verifyCallback (id))) {

                    running[ id ] = null;
                    completedCallback && completedCallback (desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)), id, false);
                    return;

                }

                // For the current rendering to apply let's update omitted steps in memory.
                // This is important to bring internal state variables up-to-date with progress in time.
                if (render) {

                    var droppedFrames = Math.round ((now - lastFrame) / (millisecondsPerSecond / desiredFrames)) - 1;
                    for (var j = 0; j < Math.min (droppedFrames, 4); j++) {
                        step (true);
                        dropCounter++;
                    }

                }

                // 计算percent的值
                if (duration) {
                    percent = (now - start) / duration;
                    if (percent > 1) {
                        percent = 1;
                    }
                }

                // 执行帧回调函数
                var
                    value = easingMethod
                        ? easingMethod (percent)
                        : percent
                if ((stepCallback (value, now, render) === false || percent === 1) && render) {
                    running[ id ] = null;
                    completedCallback && completedCallback (desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)), id, percent === 1 || duration == null);
                } else if (render) {
                    lastFrame = now;
                    core.effect.Animate.requestAnimationFrame (step, root);
                }
            }

            // 标识动画正在运行ing
            running[ id ] = true

            // 初始化动画第一帧
            core.effect.Animate.requestAnimationFrame (step, root);

            // 返回动画唯一id
            return id
        }
    }
} (this)

var Scroll;

!function () {
    var NOOP = function () {};

    Scroll = function (callback, options) {

        this.__callback = callback;

        this.options = {
            // 开启横向滚动
            scrollingX              : true,
            // 开启纵向滚动
            scrollingY              : true,
            // 开启减速、回弹、缩放、滚动的动画
            animating               : true,
            // 滚动、缩放的动画时间周期
            animationDuration       : 250,
            // 开启回弹
            bouncing                : true,
            // 锁定开始的轴向
            locking                 : true,
            // 开启分页模式
            paging                  : false,
            // 开启滑动的像素格子模式
            snapping                : false,
            // 开启缩放模式，通过api，手指，或者鼠标滚轮
            zooming                 : false,
            // 最小缩放级别
            minZoom                 : 0.5,
            // 最大缩放级别
            maxZoom                 : 3,
            // 增减滚动速度
            speedMultiplier         : 1,
            // 滚动完成回调函数
            scrollingComplete       : NOOP,
            // 到达边界的减速变化量
            penetrationDeceleration : 0.03,
            // 到达边界的加速变化量
            penetrationAcceleration : 0.08

        };

        for (var key in options) {
            this.options[ key ] = options[ key ];
        }

    };


    // Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // Open source under the BSD License.

    /**
     * @param pos {Number} position between 0 (start of effect) and 1 (end of effect)
     **/
    var easeOutCubic = function (pos) {
        return (Math.pow ((pos - 1), 3) + 1);
    };

    /**
     * @param pos {Number} position between 0 (start of effect) and 1 (end of effect)
     **/
    var easeInOutCubic = function (pos) {
        if ((pos /= 0.5) < 1) {
            return 0.5 * Math.pow (pos, 3);
        }

        return 0.5 * (Math.pow ((pos - 2), 3) + 2);
    };


    var members = {

        /*
         ---------------------------------------------------------------------------
         状态属性
         ---------------------------------------------------------------------------
         */
        // {Boolean} 单指触摸
        __isSingleTouch             : false,
        // {Boolean} 触摸事件是否在处理中
        __isTracking                : false,
        // {Boolean} 减速动画是否完成
        __didDecelerationComplete   : false,
        // {Boolean} 是否有缩放/旋转手势，手势开始时设置为true，级别高于拖拽
        __isGesturing               : false,
        // {Boolean} 移动一段距离后设置为true。注意：在不被其他情况（如click）打断的情况下移动一段距离才被视为有效。
        __isDragging                : false,
        // {Boolean} 减速ing，没再触摸和拖拽。
        __isDecelerating            : false,
        // {Boolean} 移动ing。Smoothly animating the currently configured change
        __isAnimating               : false,


        /*
         ---------------------------------------------------------------------------
         尺寸/维度等属性
         ---------------------------------------------------------------------------
         */
        // {Integer} 离document的左边距离
        __clientLeft                : 0,
        // {Integer} 离document的顶部距离
        __clientTop                 : 0,
        // {Integer} 外层宽度
        __clientWidth               : 0,
        // {Integer} 外层高度
        __clientHeight              : 0,
        // {Integer} 内容宽度
        __contentWidth              : 0,
        // {Integer} 内容高度
        __contentHeight             : 0,
        // {Integer} 内容的snapping宽度
        __snapWidth                 : 100,
        // {Integer} 内容的snapping高度
        __snapHeight                : 100,
        // {Integer} 刷新区域高度
        __refreshHeight             : null,
        // {Boolean} 是否启用刷新功能
        __refreshActive             : false,
        // {Function} 刷新激活的回调函数
        __refreshActivate           : null,
        // {Function} 刷新取消的回调函数
        __refreshDeactivate         : null,
        // {Function} 刷新开始的回调函数
        __refreshStart              : null,
        // {Number} 缩放级别
        __zoomLevel                 : 1,
        // {Number} 横向滚动位置（x-axis 最左侧为0点）
        __scrollLeft                : 0,
        // {Number} 纵向滚动位置（y-axis 最顶部为0点）
        __scrollTop                 : 0,
        // {Number} 横向最大滚动位置
        __maxScrollLeft             : 0,
        // {Number} 纵向最大滚动位置
        __maxScrollTop              : 0,
        // {Number} 横向滚动的目标位置
        __scheduledLeft             : 0,
        // {Number} 纵向滚动的目标位置
        __scheduledTop              : 0,
        // {Number} 缩放的目标级别
        __scheduledZoom             : 0,


        /*
         ---------------------------------------------------------------------------
         最终位置
         ---------------------------------------------------------------------------
         */
        // {Number} 横向滑动起始位置
        __lastTouchLeft             : null,
        // {Number} 纵向滑动起始位置
        __lastTouchTop              : null,
        // {Date} 结束滑动的时间戳，用于限定减速范围
        __lastTouchMove             : null,
        // {Array} 位置列表，每个状态均有[left, top, timestamp]三个值
        __positions                 : null,


        /*
         ---------------------------------------------------------------------------
         减速支持
         ---------------------------------------------------------------------------
         */
        // {Integer} 横向最小减速位置
        __minDecelerationScrollLeft : null,
        // {Integer} 纵向最小减速位置
        __minDecelerationScrollTop  : null,
        // {Integer} 横向最大减速位置
        __maxDecelerationScrollLeft : null,
        // {Integer} 纵向最大减速位置
        __maxDecelerationScrollTop  : null,
        // {Number} 横向减速度
        __decelerationVelocityX     : null,
        // {Number} 纵向减速度
        __decelerationVelocityY     : null,


        /*
         ---------------------------------------------------------------------------
         公共接口API
         ---------------------------------------------------------------------------
         */

        /**
         * Configures the dimensions of the client (outer) and content (inner) elements.
         * Requires the available space for the outer element and the outer size of the inner element.
         * All values which are falsy (null or zero etc.) are ignored and the old value is kept.
         *
         * @param clientWidth {Integer ? null} Inner width of outer element
         * @param clientHeight {Integer ? null} Inner height of outer element
         * @param contentWidth {Integer ? null} Outer width of inner element
         * @param contentHeight {Integer ? null} Outer height of inner element
         */
        setDimensions : function (clientWidth, clientHeight, contentWidth, contentHeight) {

            var self = this;

            // Only update values which are defined
            if (clientWidth === +clientWidth) {
                self.__clientWidth = clientWidth;
            }

            if (clientHeight === +clientHeight) {
                self.__clientHeight = clientHeight;
            }

            if (contentWidth === +contentWidth) {
                self.__contentWidth = contentWidth;
            }

            if (contentHeight === +contentHeight) {
                self.__contentHeight = contentHeight;
            }

            // Refresh maximums
            self.__computeScrollMax ();

            // Refresh scroll position
            self.scrollTo (self.__scrollLeft, self.__scrollTop, true);

        },


        /**
         * Sets the client coordinates in relation to the document.
         *
         * @param left {Integer ? 0} Left position of outer element
         * @param top {Integer ? 0} Top position of outer element
         */
        setPosition : function (left, top) {

            var self = this;

            self.__clientLeft = left || 0;
            self.__clientTop = top || 0;

        },


        /**
         * Configures the snapping (when snapping is active)
         *
         * @param width {Integer} Snapping width
         * @param height {Integer} Snapping height
         */
        setSnapSize : function (width, height) {

            var self = this;

            self.__snapWidth = width;
            self.__snapHeight = height;

        },


        /**
         * Activates pull-to-refresh. A special zone on the top of the list to start a list refresh whenever
         * the user event is released during visibility of this zone. This was introduced by some apps on iOS like
         * the official Twitter client.
         *
         * @param height {Integer} Height of pull-to-refresh zone on top of rendered list
         * @param activateCallback {Function} Callback to execute on activation. This is for signalling the user about a refresh is about to happen when he release.
         * @param deactivateCallback {Function} Callback to execute on deactivation. This is for signalling the user about the refresh being cancelled.
         * @param startCallback {Function} Callback to execute to start the real async refresh action. Call {@link #finishPullToRefresh} after finish of refresh.
         */
        activatePullToRefresh : function (height, activateCallback, deactivateCallback, startCallback) {

            var self = this;

            self.__refreshHeight = height;
            self.__refreshActivate = activateCallback;
            self.__refreshDeactivate = deactivateCallback;
            self.__refreshStart = startCallback;

        },


        /**
         * Starts pull-to-refresh manually.
         */
        triggerPullToRefresh : function () {
            // Use publish instead of scrollTo to allow scrolling to out of boundary position
            // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
            this.__publish (this.__scrollLeft, -this.__refreshHeight, this.__zoomLevel, true);

            if (this.__refreshStart) {
                this.__refreshStart ();
            }
        },


        /**
         * Signalizes that pull-to-refresh is finished.
         */
        finishPullToRefresh : function () {

            var self = this;

            self.__refreshActive = false;
            if (self.__refreshDeactivate) {
                self.__refreshDeactivate ();
            }

            self.scrollTo (self.__scrollLeft, self.__scrollTop, true);

        },


        /**
         * Returns the scroll position and zooming values
         *
         * @return {Map} `left` and `top` scroll position and `zoom` level
         */
        getValues : function () {

            var self = this;

            return {
                left : self.__scrollLeft,
                top  : self.__scrollTop,
                zoom : self.__zoomLevel
            };

        },


        /**
         * Returns the maximum scroll values
         *
         * @return {Map} `left` and `top` maximum scroll values
         */
        getScrollMax : function () {

            var self = this;

            return {
                left : self.__maxScrollLeft,
                top  : self.__maxScrollTop
            };

        },


        /**
         * Zooms to the given level. Supports optional animation. Zooms
         * the center when no coordinates are given.
         *
         * @param level {Number} Level to zoom to
         * @param animate {Boolean ? false} Whether to use animation
         * @param originLeft {Number ? null} Zoom in at given left coordinate
         * @param originTop {Number ? null} Zoom in at given top coordinate
         * @param callback {Function ? null} A callback that gets fired when the zoom is complete.
         */
        zoomTo : function (level, animate, originLeft, originTop, callback) {

            var self = this;

            if (!self.options.zooming) {
                throw new Error ("Zooming is not enabled!");
            }

            // Add callback if exists
            if (callback) {
                self.__zoomComplete = callback;
            }

            // Stop deceleration
            if (self.__isDecelerating) {
                core.effect.Animate.stop (self.__isDecelerating);
                self.__isDecelerating = false;
            }

            var oldLevel = self.__zoomLevel;

            // Normalize input origin to center of viewport if not defined
            if (originLeft == null) {
                originLeft = self.__clientWidth / 2;
            }

            if (originTop == null) {
                originTop = self.__clientHeight / 2;
            }

            // Limit level according to configuration
            level = Math.max (Math.min (level, self.options.maxZoom), self.options.minZoom);

            // Recompute maximum values while temporary tweaking maximum scroll ranges
            self.__computeScrollMax (level);

            // Recompute left and top coordinates based on new zoom level
            var left = ((originLeft + self.__scrollLeft) * level / oldLevel) - originLeft;
            var top = ((originTop + self.__scrollTop) * level / oldLevel) - originTop;

            // Limit x-axis
            if (left > self.__maxScrollLeft) {
                left = self.__maxScrollLeft;
            } else if (left < 0) {
                left = 0;
            }

            // Limit y-axis
            if (top > self.__maxScrollTop) {
                top = self.__maxScrollTop;
            } else if (top < 0) {
                top = 0;
            }

            // Push values out
            self.__publish (left || 0, top || 0, level, animate);

        },


        /**
         * Zooms the content by the given factor.
         *
         * @param factor {Number} Zoom by given factor
         * @param animate {Boolean ? false} Whether to use animation
         * @param originLeft {Number ? 0} Zoom in at given left coordinate
         * @param originTop {Number ? 0} Zoom in at given top coordinate
         * @param callback {Function ? null} A callback that gets fired when the zoom is complete.
         */
        zoomBy : function (factor, animate, originLeft, originTop, callback) {

            var self = this;

            self.zoomTo (self.__zoomLevel * factor, animate, originLeft, originTop, callback);

        },


        /**
         * Scrolls to the given position. Respect limitations and snapping automatically.
         *
         * @param left {Number?null} Horizontal scroll position, keeps current if value is <code>null</code>
         * @param top {Number?null} Vertical scroll position, keeps current if value is <code>null</code>
         * @param animate {Boolean?false} Whether the scrolling should happen using an animation
         * @param zoom {Number?null} Zoom level to go to
         */
        scrollTo : function (left, top, animate, zoom) {

            var self = this;

            // 停止减速
            if (self.__isDecelerating) {
                core.effect.Animate.stop (self.__isDecelerating);
                self.__isDecelerating = false;
            }

            // Correct coordinates based on new zoom level
            if (zoom != null && zoom !== self.__zoomLevel) {

                if (!self.options.zooming) {
                    throw new Error ("Zooming is not enabled!");
                }

                left *= zoom;
                top *= zoom;

                // Recompute maximum values while temporary tweaking maximum scroll ranges
                self.__computeScrollMax (zoom);

            } else {

                // Keep zoom when not defined
                zoom = self.__zoomLevel;

            }

            if (!self.options.scrollingX) {

                left = self.__scrollLeft;

            } else {

                if (self.options.paging) {
                    left = Math.round (left / self.__clientWidth) * self.__clientWidth;
                } else if (self.options.snapping) {
                    left = Math.round (left / self.__snapWidth) * self.__snapWidth;
                }

            }

            if (!self.options.scrollingY) {

                top = self.__scrollTop;

            } else {

                if (self.options.paging) {
                    top = Math.round (top / self.__clientHeight) * self.__clientHeight;
                } else if (self.options.snapping) {
                    top = Math.round (top / self.__snapHeight) * self.__snapHeight;
                }

            }

            // Limit for allowed ranges
            left = Math.max (Math.min (self.__maxScrollLeft, left), 0);
            top = Math.max (Math.min (self.__maxScrollTop, top), 0);

            // Don't animate when no change detected, still call publish to make sure
            // that rendered position is really in-sync with internal data
            if (left === self.__scrollLeft && top === self.__scrollTop) {
                animate = false;
            }

            // Publish new values
            if (!self.__isTracking) {
                self.__publish (left || 0, top || 0, zoom, animate);
            }

        },


        /**
         * Scroll by the given offset
         *
         * @param left {Number ? 0} Scroll x-axis by given offset
         * @param top {Number ? 0} Scroll x-axis by given offset
         * @param animate {Boolean ? false} Whether to animate the given change
         */
        scrollBy : function (left, top, animate) {

            var self = this;

            var startLeft = self.__isAnimating
                ? self.__scheduledLeft
                : self.__scrollLeft;
            var startTop = self.__isAnimating
                ? self.__scheduledTop
                : self.__scrollTop;

            self.scrollTo (startLeft + (left || 0), startTop + (top || 0), animate);

        },



        /*
         ---------------------------------------------------------------------------
         EVENT CALLBACKS
         ---------------------------------------------------------------------------
         */

        /**
         * Mouse wheel handler for zooming support
         */
        doMouseZoom : function (wheelDelta, timeStamp, pageX, pageY) {

            var self = this;
            var change = wheelDelta > 0
                ? 0.97
                : 1.03;

            return self.zoomTo (self.__zoomLevel * change, false, pageX - self.__clientLeft, pageY - self.__clientTop);

        },


        /**
         * 触摸开始（滚动预备～）
         */
        doTouchStart : function (touches, timeStamp) {

            // Array-like check is enough here
            if (touches.length == null) {
                throw new Error ("Invalid touch list: " + touches);
            }

            if (timeStamp instanceof Date) {
                timeStamp = timeStamp.valueOf ();
            }
            if (typeof timeStamp !== "number") {
                throw new Error ("Invalid timestamp value: " + timeStamp);
            }

            var self = this;

            // Reset interruptedAnimation flag
            self.__interruptedAnimation = true;

            // Stop deceleration
            if (self.__isDecelerating) {
                core.effect.Animate.stop (self.__isDecelerating);
                self.__isDecelerating = false;
                self.__interruptedAnimation = true;
            }

            // Stop animation
            if (self.__isAnimating) {
                core.effect.Animate.stop (self.__isAnimating);
                self.__isAnimating = false;
                self.__interruptedAnimation = true;
            }

            // Use center point when dealing with two fingers
            var currentTouchLeft, currentTouchTop;
            var isSingleTouch = touches.length === 1;
            if (isSingleTouch) {
                currentTouchLeft = touches[ 0 ].pageX;
                currentTouchTop = touches[ 0 ].pageY;
            } else {
                currentTouchLeft = Math.abs (touches[ 0 ].pageX + touches[ 1 ].pageX) / 2;
                currentTouchTop = Math.abs (touches[ 0 ].pageY + touches[ 1 ].pageY) / 2;
            }

            // Store initial positions
            self.__initialTouchLeft = currentTouchLeft;
            self.__initialTouchTop = currentTouchTop;

            // Store current zoom level
            self.__zoomLevelStart = self.__zoomLevel;

            // Store initial touch positions
            self.__lastTouchLeft = currentTouchLeft;
            self.__lastTouchTop = currentTouchTop;

            // Store initial move time stamp
            self.__lastTouchMove = timeStamp;

            // Reset initial scale
            self.__lastScale = 1;

            // Reset locking flags
            self.__enableScrollX = !isSingleTouch && self.options.scrollingX;
            self.__enableScrollY = !isSingleTouch && self.options.scrollingY;

            // Reset tracking flag
            self.__isTracking = true;

            // Reset deceleration complete flag
            self.__didDecelerationComplete = false;

            // Dragging starts directly with two fingers, otherwise lazy with an offset
            self.__isDragging = !isSingleTouch;

            // Some features are disabled in multi touch scenarios
            self.__isSingleTouch = isSingleTouch;

            // Clearing data structure
            self.__positions = [];

        },


        /**
         * Touch move handler for scrolling support
         */
        doTouchMove : function (touches, timeStamp, scale) {

            // Array-like check is enough here
            if (touches.length == null) {
                throw new Error ("Invalid touch list: " + touches);
            }

            if (timeStamp instanceof Date) {
                timeStamp = timeStamp.valueOf ();
            }
            if (typeof timeStamp !== "number") {
                throw new Error ("Invalid timestamp value: " + timeStamp);
            }

            var self = this;

            // Ignore event when tracking is not enabled (event might be outside of element)
            if (!self.__isTracking) {
                return;
            }


            var currentTouchLeft, currentTouchTop;

            // Compute move based around of center of fingers
            if (touches.length === 2) {
                currentTouchLeft = Math.abs (touches[ 0 ].pageX + touches[ 1 ].pageX) / 2;
                currentTouchTop = Math.abs (touches[ 0 ].pageY + touches[ 1 ].pageY) / 2;
            } else {
                currentTouchLeft = touches[ 0 ].pageX;
                currentTouchTop = touches[ 0 ].pageY;
            }

            var positions = self.__positions;

            // Are we already is dragging mode?
            if (self.__isDragging) {

                // Compute move distance
                var moveX = currentTouchLeft - self.__lastTouchLeft;
                var moveY = currentTouchTop - self.__lastTouchTop;

                // Read previous scroll position and zooming
                var scrollLeft = self.__scrollLeft;
                var scrollTop = self.__scrollTop;
                var level = self.__zoomLevel;

                // Work with scaling
                if (scale != null && self.options.zooming) {

                    var oldLevel = level;

                    // Recompute level based on previous scale and new scale
                    level = level / self.__lastScale * scale;

                    // Limit level according to configuration
                    level = Math.max (Math.min (level, self.options.maxZoom), self.options.minZoom);

                    // Only do further compution when change happened
                    if (oldLevel !== level) {

                        // Compute relative event position to container
                        var currentTouchLeftRel = currentTouchLeft - self.__clientLeft;
                        var currentTouchTopRel = currentTouchTop - self.__clientTop;

                        // Recompute left and top coordinates based on new zoom level
                        scrollLeft = ((currentTouchLeftRel + scrollLeft) * level / oldLevel) - currentTouchLeftRel;
                        scrollTop = ((currentTouchTopRel + scrollTop) * level / oldLevel) - currentTouchTopRel;

                        // Recompute max scroll values
                        self.__computeScrollMax (level);

                    }
                }

                if (self.__enableScrollX) {

                    scrollLeft -= moveX * this.options.speedMultiplier;
                    var maxScrollLeft = self.__maxScrollLeft;

                    if (scrollLeft > maxScrollLeft || scrollLeft < 0) {

                        // Slow down on the edges
                        if (self.options.bouncing) {

                            scrollLeft += (moveX / 2 * this.options.speedMultiplier);

                        } else if (scrollLeft > maxScrollLeft) {

                            scrollLeft = maxScrollLeft;

                        } else {

                            scrollLeft = 0;

                        }
                    }
                }

                // Compute new vertical scroll position
                if (self.__enableScrollY) {

                    scrollTop -= moveY * this.options.speedMultiplier;
                    var maxScrollTop = self.__maxScrollTop;

                    if (scrollTop > maxScrollTop || scrollTop < 0) {

                        // Slow down on the edges
                        if (self.options.bouncing) {

                            scrollTop += (moveY / 2 * this.options.speedMultiplier);

                            // Support pull-to-refresh (only when only y is scrollable)
                            if (!self.__enableScrollX && self.__refreshHeight != null) {

                                if (!self.__refreshActive && scrollTop <= -self.__refreshHeight) {

                                    self.__refreshActive = true;
                                    if (self.__refreshActivate) {
                                        self.__refreshActivate ();
                                    }

                                } else if (self.__refreshActive && scrollTop > -self.__refreshHeight) {

                                    self.__refreshActive = false;
                                    if (self.__refreshDeactivate) {
                                        self.__refreshDeactivate ();
                                    }

                                }
                            }

                        } else if (scrollTop > maxScrollTop) {

                            scrollTop = maxScrollTop;

                        } else {

                            scrollTop = 0;

                        }
                    }
                }

                // Keep list from growing infinitely (holding min 10, max 20 measure points)
                if (positions.length > 60) {
                    positions.splice (0, 30);
                }

                // Track scroll movement for decleration
                positions.push (scrollLeft, scrollTop, timeStamp);

                // Sync scroll position
                self.__publish (scrollLeft, scrollTop, level);

                // Otherwise figure out whether we are switching into dragging mode now.
            } else {

                var minimumTrackingForScroll = self.options.locking
                    ? 3
                    : 0;
                var minimumTrackingForDrag = 5;

                var distanceX = Math.abs (currentTouchLeft - self.__initialTouchLeft);
                var distanceY = Math.abs (currentTouchTop - self.__initialTouchTop);

                self.__enableScrollX = self.options.scrollingX && distanceX >= minimumTrackingForScroll;
                self.__enableScrollY = self.options.scrollingY && distanceY >= minimumTrackingForScroll;

                positions.push (self.__scrollLeft, self.__scrollTop, timeStamp);

                self.__isDragging = (self.__enableScrollX || self.__enableScrollY) && (distanceX >= minimumTrackingForDrag || distanceY >= minimumTrackingForDrag);
                if (self.__isDragging) {
                    self.__interruptedAnimation = false;
                }

            }

            // Update last touch positions and time stamp for next event
            self.__lastTouchLeft = currentTouchLeft;
            self.__lastTouchTop = currentTouchTop;
            self.__lastTouchMove = timeStamp;
            self.__lastScale = scale;

        },


        /**
         * Touch end handler for scrolling support
         */
        doTouchEnd : function (timeStamp) {

            if (timeStamp instanceof Date) {
                timeStamp = timeStamp.valueOf ();
            }
            if (typeof timeStamp !== "number") {
                throw new Error ("Invalid timestamp value: " + timeStamp);
            }

            var self = this;

            // Ignore event when tracking is not enabled (no touchstart event on element)
            // This is required as this listener ('touchmove') sits on the document and not on the element itself.
            if (!self.__isTracking) {
                return;
            }

            // Not touching anymore (when two finger hit the screen there are two touch end events)
            self.__isTracking = false;

            // Be sure to reset the dragging flag now. Here we also detect whether
            // the finger has moved fast enough to switch into a deceleration animation.
            if (self.__isDragging) {

                // Reset dragging flag
                self.__isDragging = false;

                // Start deceleration
                // Verify that the last move detected was in some relevant time frame
                if (self.__isSingleTouch && self.options.animating && (timeStamp - self.__lastTouchMove) <= 100) {

                    // Then figure out what the scroll position was about 100ms ago
                    var positions = self.__positions;
                    var endPos = positions.length - 1;
                    var startPos = endPos;

                    // Move pointer to position measured 100ms ago
                    for (var i = endPos; i > 0 && positions[ i ] > (self.__lastTouchMove - 100); i -= 3) {
                        startPos = i;
                    }

                    // If start and stop position is identical in a 100ms timeframe,
                    // we cannot compute any useful deceleration.
                    if (startPos !== endPos) {

                        // Compute relative movement between these two points
                        var timeOffset = positions[ endPos ] - positions[ startPos ];
                        var movedLeft = self.__scrollLeft - positions[ startPos - 2 ];
                        var movedTop = self.__scrollTop - positions[ startPos - 1 ];

                        // Based on 50ms compute the movement to apply for each render step
                        self.__decelerationVelocityX = movedLeft / timeOffset * (1000 / 60);
                        self.__decelerationVelocityY = movedTop / timeOffset * (1000 / 60);

                        // How much velocity is required to start the deceleration
                        var minVelocityToStartDeceleration = self.options.paging || self.options.snapping
                            ? 4
                            : 1;

                        // Verify that we have enough velocity to start deceleration
                        if (Math.abs (self.__decelerationVelocityX) > minVelocityToStartDeceleration || Math.abs (self.__decelerationVelocityY) > minVelocityToStartDeceleration) {

                            // Deactivate pull-to-refresh when decelerating
                            if (!self.__refreshActive) {
                                self.__startDeceleration (timeStamp);
                            }
                        } else {
                            self.options.scrollingComplete ();
                        }
                    } else {
                        self.options.scrollingComplete ();
                    }
                } else if ((timeStamp - self.__lastTouchMove) > 100) {
                    self.options.scrollingComplete ();
                }
            }

            // If this was a slower move it is per default non decelerated, but this
            // still means that we want snap back to the bounds which is done here.
            // This is placed outside the condition above to improve edge case stability
            // e.g. touchend fired without enabled dragging. This should normally do not
            // have modified the scroll positions or even showed the scrollbars though.
            if (!self.__isDecelerating) {

                if (self.__refreshActive && self.__refreshStart) {

                    // Use publish instead of scrollTo to allow scrolling to out of boundary position
                    // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
                    self.__publish (self.__scrollLeft, -self.__refreshHeight, self.__zoomLevel, true);

                    if (self.__refreshStart) {
                        self.__refreshStart ();
                    }

                } else {

                    if (self.__interruptedAnimation || self.__isDragging) {
                        self.options.scrollingComplete ();
                    }
                    self.scrollTo (self.__scrollLeft, self.__scrollTop, true, self.__zoomLevel);

                    // Directly signalize deactivation (nothing todo on refresh?)
                    if (self.__refreshActive) {

                        self.__refreshActive = false;
                        if (self.__refreshDeactivate) {
                            self.__refreshDeactivate ();
                        }

                    }
                }
            }

            // Fully cleanup list
            self.__positions.length = 0;

        },



        /*
         ---------------------------------------------------------------------------
         私有接口API
         ---------------------------------------------------------------------------
         */

        /**
         * Applies the scroll position to the content element
         *
         * @param left {Number} Left scroll position
         * @param top {Number} Top scroll position
         * @param animate {Boolean?false} Whether animation should be used to move to the new coordinates
         */
        __publish : function (left, top, zoom, animate) {

            var self = this;

            // Remember whether we had an animation, then we try to continue based on the current "drive" of the animation
            var wasAnimating = self.__isAnimating;
            if (wasAnimating) {
                core.effect.Animate.stop (wasAnimating);
                self.__isAnimating = false;
            }

            if (animate && self.options.animating) {

                // Keep scheduled positions for scrollBy/zoomBy functionality
                self.__scheduledLeft = left;
                self.__scheduledTop = top;
                self.__scheduledZoom = zoom;

                var oldLeft = self.__scrollLeft;
                var oldTop = self.__scrollTop;
                var oldZoom = self.__zoomLevel;

                var diffLeft = left - oldLeft;
                var diffTop = top - oldTop;
                var diffZoom = zoom - oldZoom;

                var step = function (percent, now, render) {

                    if (render) {

                        self.__scrollLeft = oldLeft + (diffLeft * percent);
                        self.__scrollTop = oldTop + (diffTop * percent);
                        self.__zoomLevel = oldZoom + (diffZoom * percent);

                        // Push values out
                        if (self.__callback) {
                            self.__callback (self.__scrollLeft, self.__scrollTop, self.__zoomLevel);
                        }

                    }
                };

                var verify = function (id) {
                    return self.__isAnimating === id;
                };

                var completed = function (renderedFramesPerSecond, animationId, wasFinished) {
                    if (animationId === self.__isAnimating) {
                        self.__isAnimating = false;
                    }
                    if (self.__didDecelerationComplete || wasFinished) {
                        self.options.scrollingComplete ();
                    }

                    if (self.options.zooming) {
                        self.__computeScrollMax ();
                        if (self.__zoomComplete) {
                            self.__zoomComplete ();
                            self.__zoomComplete = null;
                        }
                    }
                };

                // When continuing based on previous animation we choose an ease-out animation instead of ease-in-out
                self.__isAnimating = core.effect.Animate.start (step, verify, completed, self.options.animationDuration, wasAnimating
                    ? easeOutCubic
                    : easeInOutCubic);

            } else {

                self.__scheduledLeft = self.__scrollLeft = left;
                self.__scheduledTop = self.__scrollTop = top;
                self.__scheduledZoom = self.__zoomLevel = zoom;

                // Push values out
                if (self.__callback) {
                    self.__callback (left, top, zoom);
                }

                // Fix max scroll ranges
                if (self.options.zooming) {
                    self.__computeScrollMax ();
                    if (self.__zoomComplete) {
                        self.__zoomComplete ();
                        self.__zoomComplete = null;
                    }
                }
            }
        },


        /**
         * Recomputes scroll minimum values based on client dimensions and content dimensions.
         */
        __computeScrollMax : function (zoomLevel) {

            var self = this;

            if (zoomLevel == null) {
                zoomLevel = self.__zoomLevel;
            }

            self.__maxScrollLeft = Math.max ((self.__contentWidth * zoomLevel) - self.__clientWidth, 0);
            self.__maxScrollTop = Math.max ((self.__contentHeight * zoomLevel) - self.__clientHeight, 0);

        },



        /*
         ---------------------------------------------------------------------------
         减速动画支持
         ---------------------------------------------------------------------------
         */

        /**
         * 开始减速。当手指离开触摸，并且速度足够，切换到减速模式。
         */
        __startDeceleration : function (timeStamp) {

            var self = this;

            if (self.options.paging) {
                // 分页模式

                var scrollLeft = Math.max (Math.min (self.__scrollLeft, self.__maxScrollLeft), 0);
                var scrollTop = Math.max (Math.min (self.__scrollTop, self.__maxScrollTop), 0);
                var clientWidth = self.__clientWidth;
                var clientHeight = self.__clientHeight;

                // We limit deceleration not to the min/max values of the allowed range, but to the size of the visible client area.
                // Each page should have exactly the size of the client area.
                // 设置横向最小减速位置、纵向最小减速位置
                // 设置横向最大减速位置、纵向最大减速位置
                self.__minDecelerationScrollLeft = Math.floor (scrollLeft / clientWidth) * clientWidth;
                self.__minDecelerationScrollTop = Math.floor (scrollTop / clientHeight) * clientHeight;
                self.__maxDecelerationScrollLeft = Math.ceil (scrollLeft / clientWidth) * clientWidth;
                self.__maxDecelerationScrollTop = Math.ceil (scrollTop / clientHeight) * clientHeight;

            } else {

                self.__minDecelerationScrollLeft = 0;
                self.__minDecelerationScrollTop = 0;
                self.__maxDecelerationScrollLeft = self.__maxScrollLeft;
                self.__maxDecelerationScrollTop = self.__maxScrollTop;

            }

            // Wrap class method
            var step = function (percent, now, render) {
                self.__stepThroughDeceleration (render);
            };

            // 最小保持减速速度
            var minVelocityToKeepDecelerating = self.options.snapping
                ? 4
                : 0.001;

            // 检测是否需要继续动画步骤，
            // 如果足够慢到用户无法察觉，停止所有减速
            var verify = function () {
                var shouldContinue = Math.abs (self.__decelerationVelocityX) >= minVelocityToKeepDecelerating || Math.abs (self.__decelerationVelocityY) >= minVelocityToKeepDecelerating;
                if (!shouldContinue) {
                    self.__didDecelerationComplete = true;
                }
                return shouldContinue;
            };
            // 完成
            var completed = function (renderedFramesPerSecond, animationId, wasFinished) {
                self.__isDecelerating = false;
                if (self.__didDecelerationComplete) {
                    // 减速完成
                    self.options.scrollingComplete ();
                }

                // 此处修复最终滚到的边界位置，如果snapping激活，那么移动到栅格的边界点
                self.scrollTo (self.__scrollLeft, self.__scrollTop, self.options.snapping);
            };

            // 开始减速动画，并且开启减速ing的标识
            self.__isDecelerating = core.effect.Animate.start (step, verify, completed);

        },


        /**
         * 减速动画的时时执行函数
         *
         * @param inMemory {Boolean?false} Whether to not render the current step, but keep it in memory only. Used internally only!
         */
        __stepThroughDeceleration : function (render) {

            var self = this;

            //
            // 计算下一个滚动的位置
            //

            // 根据当前减速速度，设置最新的减速位置
            var scrollLeft = self.__scrollLeft + self.__decelerationVelocityX;
            var scrollTop = self.__scrollTop + self.__decelerationVelocityY;


            //
            // 无bouncing的硬界限滚动位置
            //

            if (!self.options.bouncing) {
                // 设置修复后的纵、横滚动位置
                //      计算方式：1、先取最大减速位置和计算的目标位置中的最小值；
                //               2、再取其与最小减速位置的最大值，最终结果就是修复后的滚动目标位置。
                // 纵、横减速度均设置为0

                var
                    scrollLeftFixed = Math.max (Math.min (self.__maxDecelerationScrollLeft, scrollLeft), self.__minDecelerationScrollLeft)
                if (scrollLeftFixed !== scrollLeft) {
                    scrollLeft = scrollLeftFixed
                    self.__decelerationVelocityX = 0
                }

                var
                    scrollTopFixed = Math.max (Math.min (self.__maxDecelerationScrollTop, scrollTop), self.__minDecelerationScrollTop)
                if (scrollTopFixed !== scrollTop) {
                    scrollTop = scrollTopFixed
                    self.__decelerationVelocityY = 0
                }

            }


            //
            // 更新滚动位置
            //

            if (render) {

                self.__publish (scrollLeft, scrollTop, self.__zoomLevel);

            } else {
                // 设置横向、纵向滚动位置

                self.__scrollLeft = scrollLeft;
                self.__scrollTop = scrollTop;

            }


            //
            // 减速
            //

            // 迭代的过程中减速（不支持分页）
            if (!self.options.paging) {

                // 阻力因子（模拟自然滑动减速）
                var frictionFactor = 0.95;

                self.__decelerationVelocityX *= frictionFactor;
                self.__decelerationVelocityY *= frictionFactor;

            }


            //
            // 支持bouncing
            //

            if (self.options.bouncing) {

                // 横向、纵向超出值
                var scrollOutsideX = 0;
                var scrollOutsideY = 0;

                // This configures the amount of change applied to deceleration/acceleration when reaching boundaries
                var penetrationDeceleration = self.options.penetrationDeceleration;
                var penetrationAcceleration = self.options.penetrationAcceleration;

                // Check limits
                if (scrollLeft < self.__minDecelerationScrollLeft) {
                    scrollOutsideX = self.__minDecelerationScrollLeft - scrollLeft;
                } else if (scrollLeft > self.__maxDecelerationScrollLeft) {
                    scrollOutsideX = self.__maxDecelerationScrollLeft - scrollLeft;
                }

                if (scrollTop < self.__minDecelerationScrollTop) {
                    scrollOutsideY = self.__minDecelerationScrollTop - scrollTop;
                } else if (scrollTop > self.__maxDecelerationScrollTop) {
                    scrollOutsideY = self.__maxDecelerationScrollTop - scrollTop;
                }

                // Slow down until slow enough, then flip back to snap position
                if (scrollOutsideX !== 0) {
                    if (scrollOutsideX * self.__decelerationVelocityX <= 0) {
                        self.__decelerationVelocityX += scrollOutsideX * penetrationDeceleration;
                    } else {
                        self.__decelerationVelocityX = scrollOutsideX * penetrationAcceleration;
                    }
                }

                if (scrollOutsideY !== 0) {
                    if (scrollOutsideY * self.__decelerationVelocityY <= 0) {
                        self.__decelerationVelocityY += scrollOutsideY * penetrationDeceleration;
                    } else {
                        self.__decelerationVelocityY = scrollOutsideY * penetrationAcceleration;
                    }
                }
            }
        }
    }

    // 将members变量值添加到原型链prototype
    for (var key in members) {
        Scroll.prototype[ key ] = members[ key ]
    }

} ()

