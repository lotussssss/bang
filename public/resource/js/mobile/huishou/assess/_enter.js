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