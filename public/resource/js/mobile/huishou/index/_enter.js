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