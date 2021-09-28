;
!function (global) {
    var
        tcb = global.tcb = global.tcb || {},
        mix = tcb.mix,
        inArray = tcb.inArray

    tcb.addCustomEventHandle = addCustomEventHandle


    /**
     * @class CustomEvent 自定义事件
     * @param {object} target 事件所属对象，即：是哪个对象的事件。
     * @param {string} type 事件类型。备用。
     * @param {object} eventArgs (Optional) 自定义事件参数
     * @returns {CustomEvent} 自定义事件
     */
    function CustomEvent (target, type, eventArgs) {
        this.target = target
        this.type = type

        //这里的设计自定义事件和dom事件一样，必须要尊重target和type，即不能让eventArgs覆盖掉target和type，否则很难管理
        mix (this, eventArgs || {})
    }

    mix (CustomEvent.prototype, {
        /**
         * @property {Object} target CustomEvent的target
         */
        target : null,

        /**
         * @property {Object} currentTarget CustomEvent的currentTarget，即事件派发者
         */
        currentTarget : null,

        /**
         * @property {String} type CustomEvent的类型
         */
        type : null,

        /**
         * @property {boolean} returnValue fire方法执行后的遗留产物。(建议规则:对于onbeforexxxx事件，如果returnValue===false，则不执行该事件)。
         */
        returnValue : undefined,

        /**
         * 设置event的返回值为false。
         * @method preventDefault
         * @returns {void} 无返回值
         */
        preventDefault : function () {

            this.returnValue = false
        }
    })


    /**
     * 自定义事件处理方法
     *
     * @type {{on: Function, off: Function, fire: Function}}
     */
    var CustomEventHandle = {

        /**
         * 添加监控
         * @method on
         * @param {Function} target
         * @param {string} sEvent 事件名称。
         * @param {Function} fn 监控函数，在CustomEvent fire时，this将会指向oScope，而第一个参数，将会是一个 CustomEvent 对象。
         * @return {boolean} 是否成功添加监控。例如：重复添加监控，会导致返回false.
         */
        on : function (target, sEvent, fn) {
            var
                cbs = target.__listeners && target.__listeners[ sEvent ]

            if (!cbs) {
                createEventListeners (target, sEvent)

                cbs = target.__listeners && target.__listeners[ sEvent ]
            }
            if (inArray (fn, cbs) > -1) {
                return false
            }
            cbs.push (fn)

            return true
        },

        /**
         * 取消监控
         * @method off
         * @param {Function} target
         * @param {string} sEvent 事件名称。
         * @param {Function} fn 监控函数
         * @return {boolean} 是否有效执行un.
         */
        off : function (target, sEvent, fn) {
            var cbs = target.__listeners && target.__listeners[ sEvent ]
            if (!cbs) {
                return false
            }
            if (fn) {
                var idx = inArray (fn, cbs)
                if (idx < 0) {
                    return false
                }
                cbs.splice (idx, 1)
            } else {
                cbs.length = 0
            }

            return true
        },

        /**
         * 事件触发。触发事件时，在监控函数里，this将会指向oScope，而第一个参数，将会是一个 CustomEvent 对象，与Dom3的listener的参数类似。<br/>
         如果this.target['on'+this.type],则也会执行该方法,与HTMLElement的独占模式的事件(如el.onclick=function(){alert(1)})类似.<br/>
         如果createEvents的事件类型中包含"*"，则所有事件最终也会落到on("*").
         * @method fire
         * @param {Function} target
         * @param {string | sEvent} sEvent 自定义事件，或事件名称。 如果是事件名称，相当于传new CustomEvent(this,sEvent,eventArgs).
         * @param {object} eventArgs (Optional) 自定义事件参数
         * @return {boolean} 以下两种情况返回false，其它情况下返回true.
         1. 所有callback(包括独占模式的onxxx)执行完后，CustomEvent.returnValue===false
         2. 所有callback(包括独占模式的onxxx)执行完后，CustomEvent.returnValue===undefined，并且独占模式的onxxx()的返回值为false.
         */
        fire : function (target, sEvent, eventArgs) {
            var
                cEvent
            if (sEvent instanceof CustomEvent) {
                cEvent = mix (sEvent, eventArgs)
                sEvent = sEvent.type
            } else {
                cEvent = new CustomEvent (target, sEvent, eventArgs)
            }

            var cbs = target.__listeners && target.__listeners[ sEvent ]
            if (!cbs) {
                createEventListeners (target, sEvent)
                cbs = target.__listeners && target.__listeners[ sEvent ]
            }
            if (sEvent != "*") {
                cbs = cbs.concat (target.__listeners[ "*" ] || [])
            }

            cEvent.returnValue = undefined //去掉本句，会导致静态 CustomEvent 的returnValue向后污染
            cEvent.currentTarget = target

            var obj = cEvent.currentTarget
            if (obj && obj[ 'on' + cEvent.type ]) {
                var retDef = obj[ 'on' + cEvent.type ].call (obj, cEvent) //对于独占模式的返回值，会弱影响event.returnValue
            }

            for (var i = 0; i < cbs.length; i++) {
                cbs[ i ].call (obj, cEvent)
            }
            return cEvent.returnValue !== false && (retDef !== false || cEvent.returnValue !== undefined)
        }

    }

    /**
     * 为一个对象添加一系列事件，并添加on/un/fire三个方法<br/>
     * 添加的事件中自动包含一个特殊的事件类型"*"，这个事件类型没有独占模式，所有事件均会落到on("*")事件对应的处理函数中
     *
     * @param {Object} target 事件所属对象，即：是哪个对象的事件。
     * @param {String|Array} types 事件名称。
     * @returns {Object} target
     */
    function createEventListeners (target, types) {
        types = types || []

        if (typeof types == "string") {
            types = types.split (",")
        }

        var
            listeners = target.__listeners
        if (!listeners) {
            listeners = target.__listeners = {}
        }
        for (var i = 0; i < types.length; i++) {
            listeners[ types[ i ] ] = listeners[ types[ i ] ] || [] //可以重复create，而不影响之前的listeners.
        }
        listeners[ '*' ] = listeners[ "*" ] || [];

        return target
    }

    /**
     * 给target赋予可以使用自定义事件的功能
     *
     * @param target
     * @param types
     * @returns {*}
     * @constructor
     */
    function addCustomEventHandle (target, types) {

        // 为target创建一个 __listeners 的hash
        createEventListeners (target, types)

        var methodized = new function () {};

        for (var fn_name in CustomEventHandle) {
            var fn = CustomEventHandle[ fn_name ]

            if (fn instanceof Function) {
                methodized[ fn_name ] = (function(fn){

                    return function () {

                        return fn.apply (null, [ this ].concat ([].slice.call (arguments)))
                    }

                }(fn))
            }

        }
        return mix (target, methodized, true) //尊重对象本身的on。
    }


} (window)