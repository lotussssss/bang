// 绑定事件
!function (global) {
    var Root = tcb.getRoot(),
        a = Root.Assess

    var pageEventMap = {
        assessBasic: __eventOnInnerPageAssessBasic,
        assessSpecial: __eventOnInnerPageAssessSpecial
    }

    a.event = function (event_key) {
        var
            event_fn = a.noop
        if (event_key) {
            event_fn = typeof pageEventMap[event_key] === 'function'
                ? pageEventMap[event_key]
                : event_fn
        }
        return event_fn
    }

    tcb.mix(a.event, {
        assessBasic: __eventOnInnerPageAssessBasic,
        assessSpecial: __eventOnInnerPageAssessSpecial,

        init: initEvent

    })


    // =================================================================
    // 公共接口 public
    // =================================================================

    function initEvent() {
        var $Target = a.getDoc()

        tcb.bindEvent($Target[0], {
            /**
             * 评估
             * @param e
             */
            '.btn-do-assess': function (e) {
                e.preventDefault()

                var $me = $(this)
                if ($me.hasClass('btn-disabled')) {
                    return
                }

                var query = tcb.queryUrl(window.location.search)
                var global_data = JSON.parse(tcb.html_decode(decodeURIComponent(query._global_data || '{}')))
                /**
                 * 活动--社群拼团
                 */
                if (query.from_page === 'pintuan') {
                    // console.log(global_data)
                    doGenerateAssessKeyForPintuan(global_data)
                    return
                }
                /**
                 * 美承以旧换新跳转逻辑：add by ljf@190820
                 * 判断query带shop_id就跳转到美承填写用户信息页
                 * @param shop_id
                 */
                if (global_data && global_data.shop_id) {
                    doGenerateAssessKeyForOld2New(global_data.shop_id, global_data.shopType)
                    return
                }

                var pure_hash = tcb.getPureHash(window.location.hash)

                switch (pure_hash) {
                    case '!/assess_quick':
                        // 专项评估页
                        __doAssessOnAssessQuick()
                        break
                    case '!/official_diff':
                        //__doAssessOnOfficialDiff()

                        __doAssessOnOnePage('!/official_diff') // 基础评估和专项评估在同一单页
                        break
                    default :
                        //// 基础评估页
                        //__doAssessOnAssessBasic()

                        __doAssessOnOnePage() // 基础评估和专项评估在同一单页
                        break
                }
            }
        })

        // 横竖屏切换
        // 暂时简单处理下吧。。
        a.$Win.on('orientationchange', function (e) {

            setTimeout(function () {
                var
                    b_height = a.$Btn.height(),
                    $Page = a.page.get()

                $Page.css({
                    'padding-bottom': b_height
                })

                // 重置页面高度
                a.resizeScrollInnerHeight()

            }, 1000)
        })
    }


    // =================================================================
    // 私有接口 private
    // =================================================================

    function __eventOnInnerPageAssessBasic($Target) {
        if (!($Target && $Target.length)) {
            return
        }
        if (!$Target.hasClass('.' + a.CLASS_NAME.block_model_basic_info)) {
            $Target = $Target.find('.' + a.CLASS_NAME.block_model_basic_info)
        }

        tcb.bindEvent($Target, {

            /**
             * 修改评估项
             * @param e
             */
            '.block-option-group .btn-action': function (e) {
                e.preventDefault()

                var
                    $me = $(this),
                    $TheGroup = $me.closest('.' + a.CLASS_NAME.block_option_group),
                    action = $me.attr('data-action'),
                    key = $me.attr('data-key')

                if (action === 'modify') {
                    a.eventHandle.__modifyOption($TheGroup, function () {

                        a.resizeScrollInnerHeight($TheGroup)
                    })
                }
            },

            /**
             * 选择评估项
             * @param e
             */
            '.block-option-group .option-item': function (e) {
                e.preventDefault()

                var
                    $Target = $(e.target),
                    $TheOption = $(this)

                // 防止点击过快
                if (a.util.is_lock('clicking_option')) {

                    return
                }
                // 加锁定状态
                a.util.lock('clicking_option')

                // 点击查看图文说明
                if ($Target.hasClass('icon-circle-solid-q')||$Target.hasClass('desc-thumb')) {

                    // 显示选项描述详情
                    __showOptionDesc($TheOption.attr('data-id'), $TheOption.attr('data-name'))

                    a.util.unlock('clicking_option')
                    return
                }

                // 是否选择机型
                var
                    is_model = $TheOption.attr('data-aver-price')
                        ? true
                        : false,
                    options = {
                        animate: true,
                        // 选中相关操作执行前,预处理回调函数
                        before: a.eventHandle.__doSelectOptionBefore,
                        // 选中之后的回调函数
                        after: a.eventHandle.__doSelectOptionAfter,
                        complete: function ($TheOption, $TheGroup) {
                            // 选中完成解锁
                            a.util.unlock('clicking_option')

                            // 设置评估进度
                            //a.doSetAssessProcess ()
                            a.doSetAssessProcess(true)
                        },
                        // 选中后回调执行延迟时间
                        delay: 210,
                        collapse: true,
                        collapse_duration: 200,
                        collapse_delay: 300,
                        scroll: true,
                        scroll_duration: 250,
                        scroll_delay: 100
                    }
                if (is_model) {
                    // 选择具体机器型号

                    options.before = a.eventHandle.__doSelectModelBefore
                    options.after = a.eventHandle.__doSelectModelAfter
                }

                // 选中评估选项, 并且进行下一项评估
                a.eventHandle.__doSelectOption($TheOption, options)

            }

        })

    }

    function __eventOnInnerPageAssessSpecial($Target) {
        if (!($Target && $Target.length)) {
            return
        }

        tcb.bindEvent($Target, {
            /**
             * 修改评估项
             * @param e
             */
            '.block-option-group .btn-action': function (e) {
                e.preventDefault()

                var
                    $me = $(this),
                    $TheGroup = $me.closest('.' + a.CLASS_NAME.block_option_group),
                    action = $me.attr('data-action'),
                    key = $me.attr('data-key')

                if (action === 'modify') {
                    a.eventHandle.__modifyOption($TheGroup, function () {
                        a.resizeScrollInnerHeight($TheGroup)
                    })
                }
            },

            /**
             * 选择评估项
             * @param e
             */
            '.block-option-group .option-item': function (e) {
                e.preventDefault()

                var
                    $Target = $(e.target),
                    $TheOption = $(this),
                    optionId = $Target.attr('data-id')

                // readonly不可点
                if ($Target.hasClass('option-item-readonly')) {
                    return
                }
                //
                if (['88', '12'].indexOf(optionId) !== -1) {
                    return
                }

                // 防止点击过快
                if (a.util.is_lock('clicking_option')) {
                    return
                }
                // 加锁定状态
                a.util.lock('clicking_option')

                // 点击查看图文说明
                if ($Target.hasClass('icon-circle-solid-q')||$Target.hasClass('desc-thumb')) {

                    // 显示选项描述详情
                    __showOptionDesc($TheOption.attr('data-id'), $TheOption.attr('data-name'))

                    a.util.unlock('clicking_option')
                    return
                }

                if ($TheOption.closest('.block-option-group-readonly').length) {
                    a.util.unlock('clicking_option')
                    return
                }

                // 是否选择机型
                var
                    is_mix = a.util.is_mix($TheOption),
                    options = {
                        animate: true,
                        // 选中相关操作执行前,预处理回调函数
                        before: a.eventHandle.__doSelectOptionBefore,
                        // 选中之后的回调函数
                        after: a.eventHandle.__doSelectOptionAfter,
                        complete: function ($TheOption, $TheGroup) {
                            // 选中完成解锁
                            a.util.unlock('clicking_option')
                            // 设置评估进度
                            a.doSetAssessProcess(true)

                            //var
                            //    where_am_i_except = ['partner_detect'],
                            //    where_am_i = tcb.queryUrl(window.location.search, 'whereami')
                            //
                            //if (window.__TPL_TYPE == 'detect') {
                            //    // app检测模板内执行即时评估
                            //
                            //    // 并且whereami的值不在 where_am_i_except 中
                            //    if (tcb.inArray (where_am_i, where_am_i_except) == -1) {
                            //
                            //        // 评估
                            //        __doAssess ()
                            //    }
                            //}

                        },
                        // 选中后回调执行延迟时间
                        delay: 210,

                        collapse: is_mix ? false : true,
                        collapse_duration: 200,
                        collapse_delay: 300,

                        scroll: true,
                        scroll_duration: 250,
                        scroll_delay: 100
                    }

                // 选中评估选项, 并且进行下一项评估
                a.eventHandle.__doSelectOption($TheOption, options)
            }

        })
    }

    // 执行评估
    function __doAssess(complete) {
        a.doAssess({
            error: function () {
                typeof complete === 'function' && complete()
            },
            fail: function () {
                typeof complete === 'function' && complete()
            },
            after: function (res) {
                if (res['errno']) {
                    $.dialog.toast(res['errmsg'], 2000)

                    a.$Btn.find('.' + a.CLASS_NAME.row_assess_price).html('').hide()
                } else {

                    //var
                    //    where_am_i_except = ['partner_detect'],
                    //    where_am_i = tcb.queryUrl(window.location.search, 'whereami')
                    //
                    //if (window.__TPL_TYPE == 'detect') {
                    //    // app检测模板内
                    //
                    //    // 并且whereami的值不在 where_am_i_except 中
                    //    if (tcb.inArray (where_am_i, where_am_i_except) == -1) {
                    //
                    //        // 有评估价格那么直接显示
                    //        if (res[ 'result' ] && res[ 'result' ][ 'pinggu_price' ] && res[ 'result' ][ 'pinggu_price' ] !== 'undefined') {
                    //            var
                    //                price = '评估价格：0元'
                    //            if (!res[ 'errno' ]) {
                    //                price = '评估价格：' + res[ 'result' ][ 'pinggu_price' ] + '元'
                    //            }
                    //            a.$Btn.find ('.' + a.CLASS_NAME.row_assess_price).html (price).show ()
                    //        } else {
                    //
                    //            a.$Btn.find ('.' + a.CLASS_NAME.row_assess_price).html ('').hide()
                    //        }
                    //
                    //    }
                    //}

                }
                typeof complete === 'function' && complete(res)
            }
        })
    }

    // 显示选项描述
    function __showOptionDesc(option_id, option_name) {
        var
            desc = a.util.getOptionDesc(option_id)

        if (!desc) {
            return
        }

        var
            html_fn = $.tmpl($.trim($('#JsMAssessOptionDescTpl').html())),
            html_st = html_fn({
                data: {
                    desc: desc,
                    option_name: option_name
                }
            })

        var
            dialogObj = tcb.showDialog(html_st, {
                className: 'assess-option-desc-wrap',
                middle: true
            })

        dialogObj.wrap.find('.dialog-close').addClass('iconfont icon-close')
    }

    function __doAssessOnAssessQuick() {
        var $BtnDoAssess = a.$Btn.find('.btn-do-assess')

        __buttonClickDownState($BtnDoAssess)

        if (a.valid.assess()) {
            // 评估
            __doAssess(function (res) {
                var result = res && res['result'] ? res['result'] : {},
                    assess_key = result['assess_key']

                if (assess_key) {
                    var query = tcb.queryUrl(window.location.search)
                    var params = {
                        'assess_key': assess_key
                    }
                    if (query['detect_key']) {
                        params['detect_key'] = query['detect_key']
                    }
                    if (query['pre_assess']) {
                        params['pre_assess'] = query['pre_assess']
                    }
                    var redirect_url = tcb.setUrl2(window.__REDIRECT_URL || '/m/pinggu_shop/', params)

                    __buttonReduceState($BtnDoAssess)

                    window.location.href = redirect_url
                } else {
                    //$.dialog.toast ('评估价格不正确，无法回收', 2000)

                    __buttonReduceState($BtnDoAssess)
                }
            })
        } else {

            __buttonReduceState($BtnDoAssess)
        }
    }

    /**
     * 供渠道生成Assess_key（美承以旧换新等业务）
     */
    function doGenerateAssessKeyForOld2New(shopId, shopType) {
        var $BtnDoAssess = a.$Btn.find('.btn-do-assess')

        __buttonClickDownState($BtnDoAssess)

        if (a.valid.assess()) {
            // 评估
            __doAssess(function (res) {
                var result = res && res['result'] ? res['result'] : {},
                    assess_key = result['assess_key']

                if (assess_key) {
                    var hash_url = tcb.setUrl('/' + (shopType ? shopType : 'mc') + '/fill-up-info', {
                        shop_id: shopId,
                        assess_key: assess_key
                    })
                    var _redirectUrl = tcb.setUrl2('/page/old2new/#' + hash_url)
                    __buttonReduceState($BtnDoAssess)
                    window.location.href = _redirectUrl
                    return
                } else {
                    __buttonReduceState($BtnDoAssess)
                    return
                }
            })
        } else {
            __buttonReduceState($BtnDoAssess)
        }
    }

    /**
     * 活动--社群拼团
     */
    function doGenerateAssessKeyForPintuan(query) {
        var $BtnDoAssess = a.$Btn.find('.btn-do-assess')

        __buttonClickDownState($BtnDoAssess)

        if (a.valid.assess()) {
            // 评估
            __doAssess(function (res) {
                var result = res && res['result'] ? res['result'] : {},
                    assess_key = result['assess_key']

                if (assess_key) {
                    var _redirectUrl = tcb.setUrl2('/pintuan/submit', {
                        assess_key: assess_key,
                        xxg_id: query.xxg_id,
                        activity_id: query.activity_id
                    })
                    __buttonReduceState($BtnDoAssess)
                    window.location.href = _redirectUrl
                    return
                } else {
                    __buttonReduceState($BtnDoAssess)
                    return
                }
            })
        } else {
            __buttonReduceState($BtnDoAssess)
        }
    }

    function __doAssessOnOfficialDiff() {
        if (!a.valid.assessBasic()) {
            return
        }

        var route = '!/assess_quick'

        a.router_inst.go(route)
    }

    function __doAssessOnAssessBasic() {
        if (!a.valid.assessBasic()) {
            return
        }

        var route = '!/assess_quick'
        if (!__compareWithOfficialData()) {
            route = '!/official_diff'
        }

        a.router_inst.go(route)
    }

    function __doAssessOnOnePage(route) {
        var $BtnDoAssess = a.$Btn.find('.btn-do-assess')

        __buttonClickDownState($BtnDoAssess)

        if (a.valid.assess()) {
            if (route != '!/official_diff' && !__compareWithOfficialData()) {
                __buttonReduceState($BtnDoAssess, 1000)
                return a.router_inst.go('!/official_diff')
            }

            // 评估
            __doAssess(function (res) {
                var result = res && res['result'] ? res['result'] : {},
                    assess_key = result['assess_key']

                if (assess_key) {
                    var query = tcb.queryUrl(window.location.search)
                    var params = {
                        'assess_key': assess_key
                    }
                    if (query['detect_key']) {
                        params['detect_key'] = query['detect_key']
                    }
                    if (query['pre_assess']) {
                        params['pre_assess'] = query['pre_assess']
                    }
                    var redirect_url = tcb.setUrl2(window.__REDIRECT_URL || '/m/pinggu_shop/', params)

                    __buttonReduceState($BtnDoAssess)

                    window.location.href = redirect_url
                } else {
                    //$.dialog.toast ('评估价格不正确，无法回收', 2000)

                    __buttonReduceState($BtnDoAssess)
                }
            })

        } else {

            __buttonReduceState($BtnDoAssess)
        }
    }

    function __buttonClickDownState($btn) {
        $btn.addClass('btn-disabled').removeClass('btn-yellow')
    }

    function __buttonReduceState($btn, delay_time) {
        if (typeof delay_time == 'undefined') {
            delay_time = 2000
        }
        delay_time = parseInt(delay_time, 10) || 0

        if (!delay_time) {
            return $btn.addClass('btn-yellow').removeClass('btn-disabled')
        }
        setTimeout(function () {
            $btn.addClass('btn-yellow').removeClass('btn-disabled')
        }, delay_time)
    }

    function __compareWithOfficialData() {
        var flag = true,
            officialData = $.parseJSON(window.__OFFICIAL_DATA) || {},
            skuCheckedComb = a.cache.doGetCheckedComb(true)

        tcb.each(officialData, function (key, val) {
            if (!val) {
                return true
            }
            switch (key) {
                case 'model_id':
                    val = tcb.isArray(val) ? val : [val]
                    tcb.inArray(a.cache.getModelId().toString(), val) == -1 && (flag = false)
                    break
                case 'capacity':
                case 'color':
                    val = val.toString()
                    tcb.inArray(val, skuCheckedComb) == -1 && (flag = false)
                    break
            }
        })

        return flag
    }
}(this)
