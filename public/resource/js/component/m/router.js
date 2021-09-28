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