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

