// html输出接口
!function (global) {
    var
        Root = tcb.getRoot (),
        o = Root.Order

    var
        renderMap = {

            // 页内组件输出

            // 输出检测报告
            assessDetectReport    : renderAssessDetectReport,

            // 输出下单表单
            orderSubmit     : renderOrderSubmit,

            // 输出app检测whereami的值为partner_detect时的模板
            detectPartnerOrderSubmit : renderDetectPartnerOrderSubmit,

            // 苏宁云店miniAPP被动模式qrcode
            suningYundianMiniQRCode : renderSuningYundianMiniQRCode,

            // 输出到店店铺列表
            daoDianShopList : renderDaoDianShopList,

            // 输出评估报告
            assessReport : renderAssessReport,

            // 修修哥申请价格
            xxgApplyGoodPrice : renderXxgApplyGoodPrice
        }

    o.render = function (options) {
        var
            target = options[ 'target' ] || null,
            render = options[ 'render' ],
            data = options[ 'data' ],
            complete = typeof options[ 'complete' ] === 'function' ? options[ 'complete' ] : this.noop
        var
            render_fn = this.noop,
            event_fn = o.event (render)
        if (render && typeof renderMap[ render ] === 'function') {
            render_fn = renderMap[ render ]
        }
        return render_fn ({
            data     : data,
            event    : event_fn,
            target   : target,
            complete : complete
        })
    }

    tcb.mix (o.render, {
        renderDaoDianShopList : renderDaoDianShopList
    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    // 输出评估检测报告
    function renderAssessDetectReport (options) {

        o.data.getAssessDetectReport (options[ 'data' ], function (data) {
            if (!data) {

                return options[ 'complete' ] ()
            }
            data = data || {}

            data[ 'icon_class_map' ] = {
                '0' : 'icon-option-ok',
                '1' : 'icon-option-none',
                '2' : 'icon-option-no_access',
                '3' : 'icon-option-none'
            }

            var $Target = options[ 'target' ] || $ ('.block-assess_report-cont'),
                $The = __htmlRender ({
                    data          : data,
                    tmpl_fn       : $.tmpl ($.trim ($ ('#JsMAssessDetectReportTpl').html ())),
                    $Target       : $Target,
                    $The          : null,
                    flag_clean    : false,
                    flag_fade_in  : true,
                    flag_not_show : false
                })

            // 输出检测信息与官方信息不一致时的提示
            var $PageOrderSubmit = $ ('.page-order_submit')
            if ($PageOrderSubmit && $PageOrderSubmit.length){
                var base_info = data['base_info'] || [],
                    official_info = data['official_info']||[],
                    flag_storage = true,
                    flag_color = true,
                    html_st = ''

                tcb.each(base_info, function(i, baseItem){
                    tcb.each(official_info, function(i, officialItem){
                        if (baseItem['name']==officialItem['name']){
                            if (!officialItem['value']){
                                return true
                            }
                            switch (baseItem['name']){
                                case '容量':
                                    baseItem['value']!=officialItem['value'] && (flag_storage=false)
                                    break
                                case '颜色':
                                    baseItem['value']!=officialItem['value'] && (flag_color=false)
                                    break
                            }
                        }
                    })
                })
                if (!flag_storage && !flag_color){
                    html_st = '<div style="margin:.1rem;padding:.1rem;background-color:#fffab0;color: #f00;">tip：检测到您手机容量、颜色与官网不符，继续提交，将按照更换手机容量和更换手机外壳的标准计算价格。</div>'
                } else if(!flag_storage){
                    html_st = '<div style="margin:.1rem;padding:.1rem;background-color:#fffab0;color: #f00;">tip：检测到您手机容量与官网不符，继续提交，将按照更换手机容量标准计算价格。</div>'
                } else if(!flag_color){
                    html_st = '<div style="margin:.1rem;padding:.1rem;background-color:#fffab0;color: #f00;">tip：检测到您手机颜色与官网不符，继续提交，将按照更换手机外壳标准计算价格。</div>'
                }

                html_st && $PageOrderSubmit.after(html_st)
            }
            // END 输出检测信息与官方信息不一致时的提示

            // 绑定事件
            options[ 'event' ] ($Target)

            // 完成回调
            options[ 'complete' ] ()
        }, function () {

            // 完成回调
            options[ 'complete' ] ()
        })
    }

    // 输出下单表单
    function renderOrderSubmit (options) {

        var
            $Target = options[ 'target' ] || $ ('.page-order_submit')

        __htmlRender ({
            data          : options[ 'data' ],
            tmpl_fn       : $.tmpl ($.trim ($ ('#JsMHuiShouOrderSubmit').html ())),
            $Target       : $Target,
            $The          : null,
            flag_clean    : false,
            flag_fade_in  : true,
            flag_not_show : false
        })

        // 绑定事件
        options[ 'event' ] ($Target)

        // 完成回调
        options[ 'complete' ] ()
    }

    // 输出下单表单
    function renderDetectPartnerOrderSubmit (options) {
        var $Target = options[ 'target' ] || $ ('.page-order_submit')

        __htmlRender ({
            data          : options[ 'data' ],
            tmpl_fn       : $.tmpl ($.trim ($ ('#JsMHuiShouDetectPartnerOrderSubmit').html ())),
            $Target       : $Target,
            $The          : null,
            flag_clean    : false,
            flag_fade_in  : true,
            flag_not_show : false
        })

        // 绑定事件
        options[ 'event' ] ($Target)

        // 完成回调
        options[ 'complete' ] ()
    }

    // 输出下单表单
    function renderSuningYundianMiniQRCode (options) {
        var $Target = options[ 'target' ] || $ ('.page-order_submit')

        __htmlRender ({
            data          : options[ 'data' ],
            tmpl_fn       : $.tmpl ($.trim ($ ('#JsMSuningYundianMiniQrcodeOrderSubmitTpl').html ())),
            $Target       : $Target,
            $The          : null,
            flag_clean    : false,
            flag_fade_in  : true,
            flag_not_show : false
        })

        // 绑定事件
        options[ 'event' ] ($Target)

        // 完成回调
        options[ 'complete' ] ()
    }

    // 输出到店地址列表
    function renderDaoDianShopList (options) {
        var
            $Target = options[ 'target' ]
        if (!($Target && $Target.length)) {
            return
        }
        __htmlRender ({
            data          : options[ 'data' ],
            tmpl_fn       : $.tmpl ($ ('#JsMHuiShouDaoDianShopListTpl').html ()),
            $Target       : $Target,
            $The          : null,
            flag_clean    : false,
            flag_fade_in  : true,
            flag_not_show : false
        })

        // 绑定事件
        options[ 'event' ] ($Target)
        // 完成回调
        options[ 'complete' ] ()
    }

    // 输出评估报告
    function renderAssessReport (options) {

        o.data.getAssessReport (options[ 'data' ], function (data) {
            if (!data) {

                return options[ 'complete' ] ()
            }
            data = data || {}

            data[ 'icon_class_map' ] = ['icon-option-none','icon-option-ok','icon-option-no_access']

            var $Target = options[ 'target' ],
                $The = __htmlRender ({
                    data          : data,
                    tmpl_fn       : $.tmpl ($.trim ($ ('#JsMAssessReportTpl').html ())),
                    $Target       : $Target,
                    $The          : null,
                    flag_clean    : false,
                    flag_fade_in  : true,
                    flag_not_show : false
                })

            // 绑定事件
            options[ 'event' ] ($Target)

            // 完成回调
            options[ 'complete' ] ()
        }, function () {

            // 完成回调
            options[ 'complete' ] ()
        })
    }

    // 输出评估报告
    function renderXxgApplyGoodPrice (options) {
        var $Target = options[ 'target' ]
        if (!($Target && $Target.length)) {
            return
        }
        __htmlRender ({
            data          : options[ 'data' ]||{},
            tmpl_fn       : $.tmpl ($ ('#JsMXxgApplyGoodPriceTpl').html ()),
            $Target       : $Target,
            $The          : null,
            flag_clean    : false,
            flag_fade_in  : true,
            flag_not_show : false
        })

        // 绑定事件
        options[ 'event' ] ($Target)
        // 完成回调
        options[ 'complete' ] ()
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
            tmpl_fn = options[ 'tmpl_fn' ], // 模板对象返回函数
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
            html_fn = tmpl_fn,
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
