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