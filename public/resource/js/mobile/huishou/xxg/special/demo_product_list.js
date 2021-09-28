!function () {
    if (window.__PAGE !== 'xxg-special-demo-product-list') {
        return
    }

    $(function () {
        var cacheData = {
            'pn': 1,
            'loading': false,
            'no_more': false
        }

        // 输出筛选项
        function renderSearchOption(callback) {
            $.post('/m/getNewMachineSearchOption', function (res) {
                if (!res.errno && res.result) {
                    var result = res.result,
                        sale_channel_list = result.sale_channel,
                        shop_list = result.shop_list,
                        shopPickerData = [[{
                            id: '',
                            name: '选择门店'
                        }]]

                    tcb.each(shop_list, function (i, item) {
                        shopPickerData[0].push({
                            id: i,
                            name: item
                        })
                    })
                    $.isFunction(callback) && callback(shopPickerData)

                    var html_channel = '<option value="">渠道合作方</option>',
                        $target_channel = $('[name="channel_id"]')
                    if ($target_channel && $target_channel.length) {
                        tcb.each(sale_channel_list, function (i, item) {
                            html_channel += '<option value="' + i + '">' + item + '</option>'
                        })
                        $target_channel.html(html_channel)
                    }
                }
            })
        }

        // 选择门店
        function shopSelector($selectorTrigger, pickerData) {
            window.Bang.Picker({
                flagAutoInit: true,
                flagFilter: true,
                selectorTrigger: $selectorTrigger,
                col: 1,
                data: pickerData,
                dataPos: [0],
                dataTitle: ['选择门店'],
                callbackConfirm: function (inst) {
                    inst.getTrigger().val(inst.options.data[0][inst.options.dataPos[0]].name)
                    $('[name="shop_id"]').val(inst.options.data[0][inst.options.dataPos[0]].id)
                },
                callbackCancel: null
            })
        }

        // 筛选
        function submitFormSearch() {
            var $form = $('.form-search')
            $form.on('submit', function () {
                var channel_id = $('[name="channel_id"]').val(),
                    shop_id = $('[name="shop_id"]').val()

                if (!channel_id && !shop_id) {
                    return
                }
                cacheData.pn = 1
                cacheData.no_more = false
                cacheData.channel_id = channel_id
                cacheData.shop_id = shop_id

                appendDemoProductList()
            })
        }

        // 获取演示机列表数据
        function getDemoProductList(callback) {
            if (cacheData.no_more || cacheData.loading) {
                return
            }
            cacheData.loading = true

            var params = {
                page: cacheData.pn,
                channel_id: cacheData.channel_id,
                shop_id: cacheData.shop_id
            }
            $.post('/m/getNewMachineList', params, function (res) {
                cacheData.loading = false

                if (!res.errno && res.result) {
                    var result = res.result,
                        list = result.goods_list || []

                    if (list.length) {
                        $.isFunction(callback) && callback(list)
                        cacheData.pn++
                    } else {
                        var $target = $('.block-list')
                        cacheData.no_more = true

                        if (cacheData.pn == 1) {
                            $target.html('<div class="item-none">暂无数据</div>')
                        } else {
                            uiAddNoMoreHtml($target)
                        }
                    }
                }
            })
        }

        // 添加演示机列表
        function appendDemoProductList() {
            getDemoProductList(function (list) {
                var html_fn = $.tmpl($.trim($('#JsXxgDemoProductListTpl').html())),
                    html_str = html_fn({
                        list: list
                    })

                var $target = $('.block-list')
                if (cacheData.pn == 1) {
                    $target.html(html_str)
                } else {
                    $target.append(html_str)
                }
            })
        }

        // 添加没有更多商品的html显示
        function uiAddNoMoreHtml($target) {
            var html_st = '<div class="ui-no-more" id="UINoMore">已经没有更多内容~</div>'

            $target = $target || $('body')

            $target.append(html_st)
        }

        // 展示评估弹窗
        function showDialogAssess(list, id) {
            var html_fn = $.tmpl($.trim($('#JsXxgDemoProductAssessTpl').html())),
                html_str = html_fn({
                    list: list
                })
            var config = {
                withMask: true,
                className: 'dialog-assess-wrap',
                middle: true
            }
            tcb.showDialog(html_str, config)
            submitFormAssess(id)
        }

        // 提交评估表单
        function submitFormAssess(id) {
            var $form = $('.form-assess')

            $form.on('submit', function () {
                if (!validFormAssess($form)) {
                    return false
                }

                var params = $form.serialize() + '&id=' + id

                $.post($form.attr('action'), params, function (res) {
                    if (!res.errno) {
                        $.dialog.toast('提交成功！', 2000)
                        setTimeout(function () {
                            tcb.closeDialog()
                        }, 500)
                    } else {
                        $.dialog.toast(res.errmsg, 2000)
                    }
                })
            })
        }

        // 验证评估表单
        function validFormAssess($form) {
            var flag = true,
                $focus = null

            $form.find('select').each(function () {
                var $me = $(this)
                var $row = $me.closest('.col')

                if (!$me.val()) {
                    flag = false
                    $focus = $focus || $me
                    $row.shine4Error()
                    $.dialog.toast('请选择', 2000)
                }
            })

            return flag
        }

        tcb.bindEvent(document.body, {
            '.js-trigger-show-dialog': function (e) {
                e.preventDefault()

                var $me = $(this),
                    id = $me.attr('data-id')

                $.post('/m/getNewMachineOptionInfo', {
                    id: id
                }, function (res) {
                    if (!res.errno) {
                        var list = res.result.option || []

                        showDialogAssess(list, id)
                    } else {
                        $.dialog.toast(res.errmsg, 2000)
                    }
                })
            }
        })

        function init() {
            $(window).on('load scroll', function () {
                // 滚动条滚动的高度 + 可视窗口的高度 >= 文档的高度
                if ($(window).scrollTop() + $(window).height() >= $('body')[0].scrollHeight) {
                    appendDemoProductList()
                }
            })

            renderSearchOption(function (shopPickerData) {
                shopSelector($('[name="shop_name"]'), shopPickerData)
            })

            submitFormSearch()
        }

        init()
    })
}()
