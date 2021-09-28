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
