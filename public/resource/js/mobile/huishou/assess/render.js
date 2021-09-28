// html输出方法
!function (global) {
    var
        Root = tcb.getRoot (),
        a = Root.Assess

    var
        pageRenderMap = {
            // 页面输出

            // 评估页---基本信息
            assessBasic   : renderAssessBasic,
            // 评估页---选择评估项和官方信息不一致的页面
            officialDiff  : renderOfficialDiff,
            // 评估页---专项评估页
            assessSpecial : renderAssessSpecial,

            // sku评估组
            assessSkuGroups : renderAssessSkuGroups,
            // 前置显示的专项评估组
            assessPreSpecialGroups : renderAssessPreSpecialGroups,
            // 专项评估组
            assessSpecialGroups : renderAssessSpecialGroups,


            // 页内组件输出

            // 输出评估选项组内部html
            assessOptionGroupInner : renderAssessOptionGroupInner,
            // 输出评估选项组列表html
            assessOptionGroupList  : renderAssessOptionGroupList
        }

    a.render = function (render_key) {
        var
            render_fn = a.noop
        if (render_key) {
            render_fn = typeof pageRenderMap[ render_key ] === 'function'
                ? pageRenderMap[ render_key ]
                : render_fn
        }
        return render_fn
    }

    tcb.mix (a.render, {})

    // =================================================================
    // 公共接口 public
    // =================================================================

    //************* 页面输出 ********************

    // 基本信息评估页
    function renderAssessBasic (id, data, event) {
        var $Target = a.getContainer (),
            $The = id ? $ ('#' + id) : null

        $The = __htmlRender ({
            id            : id || '',
            data          : data || {},
            $T            : $ ('#JsMInnerPageAssessBasicTpl'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : false
        })

        // 输出预评估的sku信息（如果存在的话）
        __renderPreAssessSkuInfo($The)

        // 输出屏幕检测信息
        __renderAssessScreenDetected ($The)
        // 输出评估基本信息
        __renderAssessBasicInfo ($The)
        // 输出前置的专有评估组结构
        __renderAssessPreSpecialInfoSkeleton ($The)
        // 输出专有评估组结构
        __renderAssessSpecialInfoSkeleton ($The)
        //// 输出评估按钮
        //__renderAssessBtnBlock ($The)

        var $BlockBtn = $ ('.' + a.CLASS_NAME.block_btn)
        //if (a.util.is_detect ()) {
        //    $BlockBtn.find ('.btn-do-assess').html ('立即评估')
        //} else {
        //    $BlockBtn.find ('.btn-do-assess').html ('下一步')
        //}
        $BlockBtn.find ('.btn-do-assess').html (window.__TPL_TYPE_DATA['assess_btn_text_step1'])
        $BlockBtn.show ()

        // 绑定事件
        typeof event === 'function' && event ($The)

        return $The
    }

    // 选择评估项和官方信息不一致的页面
    function renderOfficialDiff (id, data, event) {
        var
            $Target = a.getContainer (),
            $The = id ? $ ('#' + id) : null

        $The = __htmlRender ({
            id            : id || '',
            data          : data || {},
            $T            : $ ('#JsMInnerPageOfficialDiffTpl'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : false
        })

        a.$Btn.show()
            .find ('.btn-do-assess').html (window.__TPL_TYPE_DATA['assess_btn_text_step1'])

        // 绑定事件
        typeof event === 'function' && event ($The)

        return $The
    }

    // 专项评估页
    function renderAssessSpecial (id, data, event) {
        var
            $Target = a.getContainer (),
            $The = id ? $ ('#' + id) : null

        $The = __htmlRender ({
            id            : id || '',
            data          : {},
            $T            : $ ('#JsMInnerPageAssessSpecialTpl'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : false
        })

        // 输出评估基本信息
        __renderAssessSpecialInfo ($The, data, false, true)

        //// 输出评估按钮
        //__renderAssessBtnBlock ($The)

        var
            $BlockBtn = $ ('.' + a.CLASS_NAME.block_btn)
        //$BlockBtn.find ('.btn-do-assess').html ('立即评估')
        $BlockBtn.find ('.btn-do-assess').html (window.__TPL_TYPE_DATA['assess_btn_text_step2'])
        $BlockBtn.show ()

        // 绑定事件
        typeof event === 'function' && event ($The)

        return $The
    }


    //************* 页内组件输出 ********************

    // 输出sku评估组
    function renderAssessSkuGroups(pos, isClean) {
        var mem_id = a.cache(a.KEY_OPTIONS_MEM_DETECTED)
        var sku_groups = a.getSkuGroups({
                no_active: false,
                delimiter_id: mem_id
            }),
            $Target = $('.' + a.CLASS_NAME.block_model_basic_info + ' .block-inner')

        if (isClean) {
            // 只有isClean为true才清除$Target的内容
            $Target.removeClass('b-bottom').html('')
        }

        if (sku_groups && sku_groups.length) {
            // 输出评估组列表
            var $Groups = a.render('assessOptionGroupList')($Target, {
                groupList: sku_groups,
                pos: pos || 1
            }, false, true)

            $Groups.addClass('b-top')
        }
    }

    // 输出前置显示的专项评估组列表（当前只有 保修情况组）
    function renderAssessPreSpecialGroups () {
        // 前置展示的专有评估项组
        var pre_special_groups = a.getPreSpecialGroups (),
            $Target = $ ('.' + a.CLASS_NAME.block_model_pre_special_info + ' .block-inner')

        // 输出前置展示的专有评估项组之前，
        // 需要先清除之前节点内的html，避免重复添加，或者没有前置评估项组时显示的异常
        $Target.removeClass('b-bottom').html('')

        if (pre_special_groups && pre_special_groups.length) {
            var pos = $ ('.' + a.CLASS_NAME.block_model_basic_info + ' .block-option-group').last ().attr ('data-pos') - 0 + 1

            var $Groups = a.render ('assessOptionGroupList') ($Target, {
                groupList       : pre_special_groups,
                pos             : pos,
                optionDescIds : a.util.getOptionDescIds (),
                optionDescAll : a.util.getOptionDescAll ()
            }, false, true)

            $Groups.addClass ('b-top')
        }

    }

    // 输出专项评估组的组列表信息
    function renderAssessSpecialGroups(){
        var special_groups = a.getSpecialGroups (),
            $Target = $('.' + a.CLASS_NAME.block_model_special_info + ' .block-inner')

        $Target.removeClass('b-v-both').html('')

        if (special_groups && special_groups.length) {
            // 输出评估组列表
            var $Groups = a.render ('assessOptionGroupList') ($Target, {
                groupList : special_groups,
                pos : (+$ ('.block-option-group').last ().attr ('data-pos') + 1) || 1
            }, false, true)

            $Groups.addClass ('b-top')
        }
    }

    // 输出评估选项组内部html
    function renderAssessOptionGroupInner ($Target, data, flag_not_show, flag_fade_in) {
        if (!($Target && $Target.length)) {

            return
        }

        data = tcb.mix({}, data || {})
        data['no_outer'] = true

        var
            pos = data[ 'pos' ] || 1,
            groupList = [ data ]

        return __htmlRender ({
            data    : {
                groupList       : groupList,
                pos             : pos,
                optionDescIds : a.util.getOptionDescIds (),
                optionDescAll : a.util.getOptionDescAll ()
            },
            $T      : $ ('#JsMAssessOptionGroupTpl'),
            $Target : $Target,
            $The    : null,

            flag_clean    : true,
            flag_fade_in  : flag_fade_in,
            flag_not_show : flag_not_show
        })
    }

    // 输出评估选项组列表html
    function renderAssessOptionGroupList ($Target, data, flag_not_show, flag_fade_in) {
        if (!($Target && $Target.length)) {

            return
        }

        data = data || {}

        return __htmlRender ({
            data          : {
                groupList       : data[ 'groupList' ] || [],
                pos             : data[ 'pos' ],
                optionDescIds : a.util.getOptionDescIds (),
                optionDescAll : a.util.getOptionDescAll ()
            },
            $T            : $ ('#JsMAssessOptionGroupTpl'),
            $Target       : $Target,
            $The          : null,
            flag_clean    : false,
            flag_fade_in  : flag_fade_in,
            flag_not_show : flag_not_show
        })
    }

    // =================================================================
    // 私有接口 private
    // =================================================================


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
        // 干掉那些非元素节点（如：文本节点）
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



    // 输出屏幕检测信息
    function __renderAssessScreenDetected ($Page, flag_not_show) {
        var
            screenDetected = a.cache (a.KEY_OPTIONS_SCREEN_DETECTED)

        if (!(screenDetected && screenDetected.length)) {
            return
        }
        var
            $Target = $Page.find ('.block-assess-info'),
            $The = $Target.find ('.block-screen-function')

        __htmlRender ({
            data          : {
                screenDetected : screenDetected,
                pos            : 1
            },
            $T            : $ ('#JsMAssessScreenFunction'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : flag_not_show
        })
    }

    // 输出评估基本信息
    function __renderAssessBasicInfo ($Page, flag_not_show) {
        var
            basicInfo = [],// 基本评估信息
            models = a.cache (a.KEY_MODELS)

        // 机型数量大于1,将机型列表也加入评估选择项
        if (models.length > 1) {
            var
                options_model = []
            $.each (models, function (i, item) {
                options_model.push ({
                    option_id   : item[ 'model_id' ],
                    option_name : item[ 'model_name' ],
                    aver_price  : item[ 'aver_price' ]
                })
            })
            basicInfo.push (a.util.genGroupData ([
                '具体型号',
                '',
                options_model,
                '',
                [],
                {
                    is_sku    : false,
                    no_active : false
                }
            ]))
        }

        // sku属性基本信息组列表
        var
            sku_base_info_groups = a.cache.ex (a.KEY_SKU_ATTR_CATE) || [],
            mem_id = a.cache (a.KEY_OPTIONS_MEM_DETECTED) || ''
        $.each (sku_base_info_groups, function (i, cate) {
            // 第一项是容量，
            // 如果还有屏幕检测信息，表示通过app检测出了容量，那么不将其显示出来
            if (!(i === 0 && mem_id)) {
                basicInfo.push (
                    a.util.genGroupData ([
                        cate[ 'options_cate_name' ],
                        cate[ 'options_cate_id' ],
                        [],
                        '',
                        [],
                        {
                            is_sku    : true,
                            no_active : true
                        }
                    ])
                )
            }
        })
        // 没有获取到 sku属性基本信息组列表 ，表示当前还没有确定的机器型号，
        // 那么添加默认的sku显示属性
        if (!(sku_base_info_groups && sku_base_info_groups.length)) {
            if (!mem_id) {
                basicInfo.push(
                    a.util.genGroupData([
                        '容量',
                        '2',
                        [],
                        '',
                        [],
                        {
                            is_sku: true,
                            no_active: true
                        }
                    ])
                )
            }
            basicInfo.push (
                a.util.genGroupData ([
                    '颜色',
                    '4',
                    [],
                    '',
                    [],
                    {
                        is_sku    : true,
                        no_active : true
                    }
                ]),
                a.util.genGroupData ([
                    '渠道',
                    '6',
                    [],
                    '',
                    [],
                    {
                        is_sku    : true,
                        no_active : true
                    }
                ])
            )
        }

        var
            $Target = $Page.find ('.block-assess-info'),
            $The = $Target.find ('.' + a.CLASS_NAME.block_model_basic_info),
            screenDetected = a.cache (a.KEY_OPTIONS_SCREEN_DETECTED) || []

        __htmlRender ({
            data          : {
                basicInfo       : basicInfo,
                pos             : 1 + screenDetected.length,
                optionDescIds : a.util.getOptionDescIds (),
                optionDescAll : a.util.getOptionDescAll ()
            },
            $T            : $ ('#JsMAssessBasicInfo'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : flag_not_show
        })
    }

    // 输出评估按钮
    function __renderAssessBtnBlock ($Page, flag_not_show) {

        var
            $Target = $Page.find ('.block-assess-info'),
            $The = $Target.find ('.block-btn')

        __htmlRender ({
            data          : {},
            $T            : $ ('#JsMAssessBtnBlock'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : flag_not_show
        })
    }

    // 输出前置的专有评估组结构（根据选择的具体机型，最终可能会有内容，也可能会没有）
    function __renderAssessPreSpecialInfoSkeleton ($Page, flag_not_show) {
        var
            $Target = $Page.find ('.block-assess-info'),
            $The = $Target.find ('.' + a.CLASS_NAME.block_model_pre_special_info)

        $The = __htmlRender ({
            data          : {},
            $T            : $ ('#JsMAssessPreSpecialInfoTpl'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : flag_not_show
        })

        a.event.assessSpecial($The)
    }

    function __renderAssessSpecialInfoSkeleton ($Page, flag_not_show){
        var
            $Target = $Page.find ('.block-assess-info'),
            $The = $Target.find ('.' + a.CLASS_NAME.block_model_special_info)

        $The = __htmlRender ({
            data          : {},
            $T            : $ ('#JsMAssessSpecialInfoTpl'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : flag_not_show
        })

        a.event.assessSpecial($The)
    }

    // 输出专有评估组列表
    function __renderAssessSpecialInfo ($Page, data, flag_not_show, flag_fade_in) {
        var
            $Target = $Page.find ('.block-assess-info'),
            $The = $Target.find ('.' + a.CLASS_NAME.block_model_special_info)

        __htmlRender ({
            data          : {},
            $T            : $ ('#JsMAssessSpecialInfoTpl'),
            $Target       : $Target,
            $The          : $The,
            flag_not_show : flag_not_show
        })

        $Target = $Target.find ('.' + a.CLASS_NAME.block_model_special_info + ' .block-inner')

        // 输出评估组列表
        a.render ('assessOptionGroupList') ($Target, data, flag_not_show, flag_fade_in)
    }

    // 输出预评估的sku信息（如果存在的话）
    function __renderPreAssessSkuInfo($Page) {
        var skuList = a.cache.ex(a.KEY_PRE_ASSESS_SKU_LIST)
        if (!(skuList && skuList.length)) {
            return
        }
        var skuListHtml = []
        tcb.each(skuList, function (k, val) {
            skuListHtml.push('<div>' + val.group_name + '：' + val.group_value + '</div>')
        })
        skuListHtml = '<div class="pre-assess-sku-list">' + skuListHtml.join('') + '</div>'
        a.$Model.find('.row-assess-model-info').after(skuListHtml)

        a.modelHeight = a.$Model.height() - a.$Model.find('.block-process-status-bar').height()
        $Page.css({
            paddingTop: a.modelHeight
        })
    }

} (this)
