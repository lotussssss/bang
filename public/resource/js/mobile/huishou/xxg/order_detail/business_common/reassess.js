!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        reassessShowOrderAssessDetail: showOrderAssessDetail,
        reassessShowOrderAssessOptions: showOrderAssessOptions,
        reassessShowOrderAssessSku: showOrderAssessSku,
        reassessGetOrderAssessDetail: getOrderAssessDetail
    })

    function __sortSpecialGroups(groups) {
        var ret = []
        tcb.each(groups, function (i, group) {
            ret.push(group)
        })
        ret.sort(function (a, b) {
            return +a.group > +b.group ? 1 : -1
        })
        return ret
    }

    function __getAssessOptionsData(order_id, model_id) {
        var assessResult = __sortSpecialGroups(window.__SPECIAL_ASSESS[order_id] || {}),
            assessResultLast = __sortSpecialGroups(window.__SPECIAL_REASSESS[order_id] || {}),
            assessGroup = (window.__SPECIAL_GROUPS || {})[model_id] || {},

            assessResultByUser = [], // 用户的评估结果
            assessResultAtLast = []  // 最后一次，再次评估结果
        if (assessResult && assessResult.length) {
            $.each(assessResult, function (i, item) {
                assessResultByUser.push({
                    'name': item['name'],
                    'selected': item['select']
                })
            })
        }

        if (assessResultLast && assessResultLast.length) {
            $.each(assessResultLast, function (i, item) {
                var change = (assessResult[i] && assessResult[i]['select'] === item['select']) ? false : true
                assessResultAtLast.push({
                    'name': item['name'],
                    'group': assessGroup[item['group']].sub,
                    'selected': item['select'],
                    'selected_id': item['id'],
                    'change': change
                })
            })
        }

        return [assessResultByUser, assessResultAtLast]
    }

    function __getAssessSkuData(order_id) {
        var assessSku = (window.__SKU_ASSESS || {})[order_id],
            assessSkuLast = (window.__SKU_REASSESS || {})[order_id],
            skuGroups = (window.__SKU_GROUPS || {})[order_id],

            assessSkuByUser = [], // 用户的评估sku
            assessSkuAtLast = []  // 最后一次，再次评估sku
        var nameMap = {
            2: '容量',
            4: '颜色',
            6: '渠道',
            10: '处理器',
            12: '内存',
            14: '硬盘',
            16: '显卡'
        }
        if (assessSku) {
            $.each(assessSku, function (i, item) {
                assessSkuByUser.push({
                    'name': nameMap[i],
                    'selected': item['attr_valuename']
                })
            })
        }

        if (assessSkuLast) {
            $.each(assessSkuLast, function (i, item) {
                var change = false
                if (!(assessSku[i] && assessSku[i].attr_valueid == item.attr_valueid)) {
                    change = true
                }
                assessSkuAtLast.push({
                    'name': nameMap[i],
                    'group': skuGroups[i],
                    'selected': item['attr_valuename'],
                    'selected_id': item['attr_valueid'],
                    'change': change,
                    'disable_change': !item['allowChange']
                })
            })
        }

        return [assessSkuByUser, assessSkuAtLast]
    }

    function getOrderAssessDetail(order_id, model_id) {
        var assessOptionsData = __getAssessOptionsData(order_id, model_id),
            assessSkuData = __getAssessSkuData(order_id)
        var assessDetailByUser = [].concat(assessSkuData[0], assessOptionsData[0]),
            assessDetailAtLast = [].concat(assessSkuData[1], assessOptionsData[1])
        var assessDetail = {
            data: [],
            diffCount: 0,
            sameCount: 0,
            count: 0
        }
        var diffCount = 0
        tcb.each(assessDetailAtLast, function (i, item) {
            // if (item.name === '屏幕显示') {
            //     item.selected = '显示触摸正常'
            //     item.change = true
            // }
            var _item = {
                name: item.name,
                lastSelected: item.selected
            }
            if (item.change && assessDetailByUser[i] && item.selected !== assessDetailByUser[i].selected) {
                _item.change = item.change
                _item.userSelected = assessDetailByUser[i].selected
                diffCount++
            }
            assessDetail.data.push(_item)
        })
        assessDetail.diffCount = diffCount
        assessDetail.sameCount = assessDetail.data.length - diffCount
        assessDetail.count = assessDetail.data.length
        return assessDetail
    }

    function showOrderAssessDetail($trigger) {
        var order_id = $trigger.attr('data-order-id'),
            model_id = $trigger.attr('data-model-id')

        var assessOptionsData = __getAssessOptionsData(order_id, model_id),
            assessSkuData = __getAssessSkuData(order_id)
        var assessDetailByUser = [].concat(assessSkuData[0], assessOptionsData[0]),
            assessDetailAtLast = [].concat(assessSkuData[1], assessOptionsData[1])
        var html_fn = $.tmpl($.trim($('#JsXxgViewHsAssessDetailTpl').html())),
            html_st = html_fn({
                'assessDetailAtLast': assessDetailAtLast,
                'assessDetailByUser': assessDetailByUser
            })
        var dialogInst = tcb.showDialog(html_st, {
            withMask: true,
            middle: true
        })
        __bindEventChangeCompareTab(dialogInst.wrap.find('.tab-list .item'))
    }

    function showOrderAssessOptions($trigger) {
        var order_id = $trigger.attr('data-order-id'),
            model_id = $trigger.attr('data-model-id')
        var assessOptionsData = __getAssessOptionsData(order_id, model_id)
        var html_fn = $.tmpl($.trim($('#JsXxgViewHsDetailTpl').html())),
            html_st = html_fn({
                'assessResultByUser': assessOptionsData[0],
                'assessResultAtLast': assessOptionsData[1],
                'order_id': order_id,
                'order_status': window.__ORDER_STATUS || 0
            })

        var dialogInst = tcb.showDialog(html_st, {
            withMask: true,
            middle: true
        })
        __bindEventFormEditAssessOptions(dialogInst.wrap.find('form'))
        __bindEventChangeCompareTab(dialogInst.wrap.find('.tab-list .item'))
    }

    // 重新评估回收手机参数
    function __bindEventFormEditAssessOptions($form) {
        if (!($form && $form.length)) {
            return
        }
        $form.on('submit', function (e) {
            e.preventDefault()
            $.getJSON('/m/aj_edit_options_new', $form.serialize(), function (res) {
                if (!res['errno']) {
                    tcb.closeDialog()
                    var new_price = res['result'] || 0
                    $.dialog.alert('<div class="grid align-center justify-center">重新评估价格为' + new_price + '元</div>', function () {
                        window.XXG.redirect()
                    })
                } else {
                    $.dialog.toast(res['errmsg'])
                }
            })
        })
    }

    function showOrderAssessSku($trigger) {
        var order_id = $trigger.attr('data-order-id')
        var assessSkuData = __getAssessSkuData(order_id)
        var html_fn = $.tmpl($.trim($('#JsXxgViewHsSkuTpl').html())),
            html_st = html_fn({
                'assessSkuByUser': assessSkuData[0],
                'assessSkuAtLast': assessSkuData[1],
                'order_id': order_id,
                'order_status': window.__ORDER_STATUS || 0
            }),
            dialogInst = tcb.showDialog(html_st, {
                withMask: true,
                middle: true
            })
        var sku_pc_auto_check = (window.__SKU_PC_AUTO_CHECK && window.__SKU_PC_AUTO_CHECK[order_id]) || []
        if (sku_pc_auto_check && sku_pc_auto_check.length && !window.__SKU_PC_AUTO_CHECK_FLAG[order_id]) {
            var $subSkuNew = dialogInst.wrap.find('#sub_sku_new')
            var $btnEditSku = $subSkuNew.find('.btn-edit-sku')
            var sku_pc_auto_check_html = []
            tcb.each(sku_pc_auto_check, function (i, val) {
                sku_pc_auto_check_html.push('<div>' + val.group_name + '：' + val.group_value + '</div>')
            })
            sku_pc_auto_check_html = '<div class="pre-assess-sku-list" style="color: #f84;">' + sku_pc_auto_check_html.join('') + '</div>'
            if ($btnEditSku && $btnEditSku.length) {
                $btnEditSku.before(sku_pc_auto_check_html)
            } else {
                $subSkuNew.append(sku_pc_auto_check_html)
            }
        }
        __bindEventFormEditAssessSku(dialogInst.wrap.find('form'))
        __bindEventChangeCompareTab(dialogInst.wrap.find('.tab-list .item'))
    }

    // 重新评估回收手机SKU
    function __bindEventFormEditAssessSku($form) {
        if (!($form && $form.length)) {
            return
        }

        $form.on('submit', function (e) {
            e.preventDefault()
            $.getJSON('/m/aj_edit_sku_options_new', $form.serialize(), function (res) {
                if (!res['errno']) {
                    tcb.closeDialog()
                    var new_price = res['result'] || 0
                    $.dialog.alert('<div class="grid align-center justify-center">重新评估价格为' + new_price + '元</div>', function () {
                        window.XXG.redirect()
                    })
                } else {
                    $.dialog.toast(res['errmsg'])
                }
            })
        })
    }

    // 弹窗tab切换
    function __bindEventChangeCompareTab($tab) {
        $tab.on('click', function (e) {
            e.preventDefault()

            var $me = $(this)
            $me.addClass('item-cur').siblings('.item-cur').removeClass('item-cur')
            $me.parents('.dialog-inner').find('.tab-cont .item').eq($me.index()).show().siblings('.item').hide()
        })
    }

}()
