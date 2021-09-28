// 签字板
!function (global) {
    var Bang = window.Bang = window.Bang || {}

    Bang.SignaturePad = function (options) {

        return new SignaturePad(options)
    }

    var __penSizeMap = {
        1: 4.5,
        2: 4.25,
        3: 4,
        4: 3.75,
        5: 3.5,
        6: 3.25,
        7: 3,
        8: 2.75,
        9: 2.5,
        10: 2.25,
        11: 2.2,
        12: 2.15,
        13: 2.1,
        14: 2.05,
        15: 2,
        16: 1.95,
        17: 1.9,
        18: 1.85,
        19: 1.8,
        20: 1.75,
        21: 1.7,
        22: 1.65,
        23: 1.6,
        24: 1.55,
        25: 1.5,
        26: 1.48,
        27: 1.46,
        28: 1.44,
        29: 1.42,
        30: 1.4,
        31: 1.38,
        32: 1.36,
        33: 1.34,
        34: 1.32,
        35: 1.3,
        36: 1.28,
        37: 1.26,
        38: 1.24,
        39: 1.22,
        40: 1.2,
        41: 1.18,
        42: 1.16,
        43: 1.14,
        44: 1.12,
        45: 1.1,
        46: 1.08,
        47: 1.06,
        48: 1.04,
        49: 1.02,
        50: 1
    }

    function SignaturePad(options) {
        options = options || {}
        var me = this,
            defaults = {
                canvas: null,
                canvasConfig: {
                    penColor: '#000',
                    penSize: 3,
                    penSizeMap: null,
                    backgroundColor: '#fff',
                    onStart: null,
                    onEnd: null
                },
                flagAutoInit: true,
                readOnly: false
            },
            pointGroups = []

        options = tcb.mix(defaults, options, true)

        me.options = options
        me.__pointGroups = pointGroups
        me.$canvas = null
        me.__penSize = options.canvasConfig.penSize || 3
        me.__penColor = options.canvasConfig.penColor || '#000'
        me.__ctx = null
        me.__offset = null
        me.__penSizeMap = options.penSizeMap || __penSizeMap
        me.__maxLineWidth = __getMaxLineWidth.apply(me)

        if (!options.canvas || !((me.$canvas = $(options.canvas)) && me.$canvas.length)) {
            return tcb.error('canvas参数必须，并且元素必须存在')
        }
        // 设置canvas的宽高
        __setSize(me.$canvas)

        // 确保签字的颜色值为rgb格式的数组,eg. [0, 0, 0]
        me.__penColor = __ensureRgb(me.__penColor || '#000')
        me.__ctx = me.$canvas[0].getContext('2d')

        if (options.flagAutoInit) {
            me.init()
        }
    }

    SignaturePad.prototype = {
        constructor: SignaturePad,

        init: init,
        draw: draw,
        clear: clear,
        clearAll: clearAll,
        toDataUrl: toDataUrl,
        getPointGroups: getPointGroups,
        getStripPointGroups: getStripPointGroups
    }


    function init() {
        var me = this,
            options = me.options

        me.clearAll()

        !options.readOnly &&
        __bindEvent.apply(me)
    }

    function draw(pointGroups) {
        if (!(pointGroups && pointGroups.length)) {
            return
        }
        var me = this
        pointGroups.forEach(function (group) {
            if (!(group && group.length)) return
            if (group.length === 1) {
                __drawDot.apply(me, group[0])
            } else {
                group.forEach(function (point, i) {
                    if (i === 0) return
                    var lastPoint = point
                    var newPoint = group[i - 1]
                    // 划线
                    __draw.apply(me, [newPoint, lastPoint])
                })
            }
        })
    }

    function clear() {
        var me = this,
            options = me.options,
            $canvas = me.$canvas,
            ctx = me.__ctx

        ctx.fillStyle = options.canvasConfig.backgroundColor || 'rgba(0,0,0,0)'
        ctx.clearRect(0, 0, $canvas[0].width, $canvas[0].height)
        ctx.fillRect(0, 0, $canvas[0].width, $canvas[0].height)
    }

    function clearAll() {
        var me = this

        me.clear()
        return me.__pointGroups = []
    }

    function toDataUrl(type) {
        var me = this,
            args = Array.prototype.slice.call(arguments)

        if (!type) {
            type = 'image/jpeg'

            args = [type]
        }

        return me.__ctx.canvas.toDataURL.apply(me.__ctx.canvas, args)
    }

    function getPointGroups() {
        var me = this

        return me.__pointGroups
    }

    function getStripPointGroups() {
        var me = this,
            pointGroups = me.__pointGroups,
            ret = []

        pointGroups.forEach(function (group) {
            ret.push([])
            group.forEach(function (point) {
                ret[ret.length - 1].push({
                    delta: point.delta,
                    xDraw: point.xDraw,
                    yDraw: point.yDraw
                })
            })
        })

        return ret
    }

    function __bindEvent() {
        var me = this,
            options = me.options,
            $canvas = me.$canvas,
            $win = tcb.getWin(),
            $doc = tcb.getDoc()

        // 鼠标事件
        var onCanvasMouseDown = function (e) {

                __strokeStart.apply(me, [e.pageX, e.pageY, e.timeStamp])

                $canvas.on('mousemove', onCanvasMouseMove)
                $doc.on('mouseup', onCanvasMouseUp)
            },
            onCanvasMouseMove = function (e) {
                __strokeUpdate.apply(me, [e.pageX, e.pageY, e.timeStamp])
            },
            onCanvasMouseUp = function (e) {

                __strokeEnd.apply(me, [e.pageX, e.pageY, e.timeStamp])

                $canvas.off('mousemove', onCanvasMouseMove)
                $doc.off('mouseup', onCanvasMouseUp)
            },

            // 触摸事件
            onCanvasTouchStart = function (e) {
                if (e.touches.length == 1) {
                    e.preventDefault()

                    __strokeStart.apply(me, [e.touches[0].pageX, e.touches[0].pageY, e.timeStamp])

                    $canvas.on('touchmove', onCanvasTouchMove, {passive: false})
                    $canvas.on('touchend', onCanvasTouchEnd)
                }
            },
            onCanvasTouchMove = function (e) {
                if (e.touches.length == 1) {
                    e.preventDefault()

                    __strokeUpdate.apply(me, [e.touches[0].pageX, e.touches[0].pageY, e.timeStamp])
                }
            },
            onCanvasTouchEnd = function (e) {
                if (e.touches.length === 0) {
                    e.preventDefault()

                    __strokeEnd.apply(me)

                    $canvas.off('touchmove', onCanvasTouchMove)
                    $canvas.off('touchend', onCanvasTouchEnd)
                }
            },

            onCanvasResize = function () {
                var $wrap = $canvas.parent()
                $canvas[0].width = $wrap.width()
                $canvas[0].height = $wrap.height()
            }

        $canvas.on('mousedown', onCanvasMouseDown)
        $canvas.on('touchstart', onCanvasTouchStart)
        //$win.on('resize', onCanvasResize)

        //onCanvasResize()
    }

    // 根据点划线
    function __draw(newPoint, lastPoint) {
        if (!(newPoint && lastPoint)) {
            return
        }

        var me = this,
            ctx = me.__ctx,
            penColor = me.__penColor,
            penSizeMap = me.__penSizeMap,
            penSize = me.__penSize,
            maxLineWidth = me.__maxLineWidth

        var lineWidth = penSizeMap[newPoint.delta] + penSize / maxLineWidth

        ctx.beginPath()

        // 绘制主线条的半透明背景边缘
        ctx.strokeStyle = __makeStrokeStyle(penColor, 0.35)
        ctx.lineWidth = lineWidth + 2
        ctx.lineCap = 'butt'
        ctx.lineJoin = 'miter'

        ctx.moveTo(lastPoint.xDraw, lastPoint.yDraw)
        ctx.lineTo(newPoint.xDraw, newPoint.yDraw)
        ctx.stroke()

        // 绘制主线
        ctx.strokeStyle = __makeStrokeStyle(penColor, 1)
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.moveTo(lastPoint.xDraw, lastPoint.yDraw)
        ctx.lineTo(newPoint.xDraw, newPoint.yDraw)
        ctx.stroke()
    }

    function __drawDot(newPoint) {
        if (!newPoint) {
            return
        }

        var me = this,
            ctx = me.__ctx,
            penColor = me.__penColor,
            penSizeMap = me.__penSizeMap,
            penSize = me.__penSize,
            maxLineWidth = me.__maxLineWidth,
            dotSize = penSizeMap[newPoint.delta] + penSize / maxLineWidth

        ctx.beginPath()
        ctx.arc(newPoint.xDraw, newPoint.yDraw, dotSize / 2, 0, 2 * Math.PI, false)
        ctx.fillStyle = __makeStrokeStyle(penColor, 1)
        ctx.closePath()
        ctx.fill()
    }

    function __strokeStart(pageX, pageY, time) {
        var me = this

        // 添加新组
        __addGroupToPointGroups.apply(me)

        var newPoint = __generatePoint.apply(me, [pageX, pageY, time])
        // 添加进pointGroup
        __addPointToPointGroups.apply(me, [newPoint])
    }

    // 更新线条
    function __strokeUpdate(pageX, pageY, time) {
        var me = this

        var lastPoint = __getLastPoint.apply(me)
        if (!lastPoint) {
            lastPoint = __generatePoint.apply(me, [pageX, pageY, time])
            // 添加进pointGroup
            __addPointToPointGroups.apply(me, [lastPoint])
        }

        var newPoint = __generatePoint.apply(me, [pageX, pageY, time])
        // 添加进pointGroup
        __addPointToPointGroups.apply(me, [newPoint])

        // 划线
        __draw.apply(me, [newPoint, lastPoint])
    }

    function __strokeEnd(pageX, pageY, time) {
        var me = this,
            lastGroup = __getLastGroup.apply(me)

        if (!(lastGroup && lastGroup.length)) {
            return
        }

        if (lastGroup.length === 1) {
            __drawDot.apply(me, lastGroup)
        }
    }

    // 获取最大划线宽度
    function __getMaxLineWidth() {
        var me = this,
            penSizeMap = me.__penSizeMap,
            maxLineWidth = 0
        for (var key in penSizeMap) {
            maxLineWidth = Math.max(maxLineWidth, penSizeMap[key])
        }
        return maxLineWidth
    }

    // 获取最后一个点
    function __getLastPoint() {
        var me = this,
            pointGroups = me.__pointGroups || [],
            points = pointGroups.length ? pointGroups[pointGroups.length - 1] : []

        return points.length ? points[points.length - 1] : null
    }

    // 获取最后一个组
    function __getLastGroup() {
        var me = this,
            pointGroups = me.__pointGroups || []

        return pointGroups.length ? pointGroups[pointGroups.length - 1] : null
    }

    // 生成一个点
    function __generatePoint(pageX, pageY, time) {
        var me = this,
            lastPoint = __getLastPoint.apply(me),
            offset = __getOffset.apply(me),
            x = pageX - offset.left,
            y = pageY - offset.top,
            xDraw = x,
            yDraw = y,
            xDelta = 0,
            yDelta = 0,
            delta = 0

        if (lastPoint) {
            delta = Math.abs(lastPoint.x - x)
            if (lastPoint.delta && (2 <= Math.abs(lastPoint.delta - delta))) {
                delta = (lastPoint.delta < delta)
                    ? (lastPoint.delta + 1)
                    : (lastPoint.delta - 1)
            }

            xDelta = (lastPoint.xDelta + (lastPoint.xDraw - x) * .08) * .7
            xDraw = lastPoint.xDraw - xDelta

            yDelta = (lastPoint.yDelta + (lastPoint.yDraw - y) * .08) * .7
            yDraw = lastPoint.yDraw - yDelta
        }

        return {
            x: x,
            y: y,
            xDraw: xDraw,
            yDraw: yDraw,
            xDelta: xDelta,
            yDelta: yDelta,
            delta: delta || 1//,
            // time   : time || new Date ().getTime ()//,
            //div    : .08,
            //ease   : .7
        }
    }

    // 为pointGroups添加一个新的空组
    function __addGroupToPointGroups() {
        var me = this,
            pointGroups = me.__pointGroups = me.__pointGroups || []

        return pointGroups.push([])
    }

    // 将点加入pointGroups
    function __addPointToPointGroups(point) {
        var me = this,
            pointGroups = me.__pointGroups = me.__pointGroups || [],
            points = pointGroups.length ? pointGroups[pointGroups.length - 1] : [],
            lastPoint = __getLastPoint.apply(me)

        if (!pointGroups.length) {
            pointGroups.push(points)
        }
        if (!__isPointEqual(point, lastPoint)) {
            points.push(point)
        }

        return pointGroups
    }

    // 比较是否为同一个点
    function __isPointEqual(point1, point2) {
        return point1 && point2
            && point1.x === point2.x
            && point1.y === point2.y
            && point1.xDraw === point2.xDraw
            && point1.yDraw === point2.yDraw
            && point1.xDelta === point2.xDelta
            && point1.yDelta === point2.yDelta
            && point1.delta === point2.delta
        //&& point1.time === point2.time
    }

    // 获取canvas相对页面的offset
    function __getOffset() {
        var me = this,
            $canvas = me.$canvas

        if (!me.__offset) {
            me.__offset = $canvas.offset()
        }

        return me.__offset
    }

    function __setSize($canvas) {
        var $wrap = $canvas.parent()
        $canvas[0].width = $wrap.width()
        $canvas[0].height = $wrap.height()
    }

    function __makeStrokeStyle(penColor, opacity) {
        opacity = opacity || 1

        return 'rgba(' + penColor[0] + ', ' + penColor[1] + ', ' + penColor[2] + ',  ' + opacity + ')'
    }

    function __ensureRgb(color) {
        var colorsArray = [0, 0, 0]
        if (/^#./.test(color)) {
            colorsArray = __hexToRgbArray(color)
        } else if (/^rgb\(./.test(color)) {
            colorsArray = color.substring(4, color.length - 1)
                               .replace(/ /g, '')
                               .split(',')
        } else if (/^rgba\(./.test(color)) {
            colorsArray = color.substring(5, color.length - 1)
                               .replace(/ /g, '')
                               .split(',')
            colorsArray.pop()
        } else if (Object.prototype.toString.call(color) === '[object Array]') {
            colorsArray = color
        }

        return colorsArray
    }

    function __hexToRgbArray(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b
        })

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
            ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
            : [0, 0, 0]
    }

}(this)
