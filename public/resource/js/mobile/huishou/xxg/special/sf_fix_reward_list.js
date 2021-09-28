!function () {
    if (window.__PAGE !== 'xxg-special-sf-fix-reward-list') {
        return
    }

    $(function () {
        var cacheData = {
            'pn': 1,
            'loading': false,
            'no_more': false,
            'last_month': ''
        }

        // 输出提成汇总
        function renderRewardSummary() {
            var $block_top = $('.block-top'),
                $block_list = $('.block-list'),
                $block_none = $('.block-none')

            $.get('/xxgHs/doGetSfFixBonusAggregation', function (res) {
                if (!res.errno && res.result) {
                    if (res.result.all) {
                        $block_top.show()
                        $block_list.show()

                        var tmpl_fn = $.tmpl($.trim($('#JsXxgSfFixRewardSummaryTpl').html())),
                            tmpl_str = tmpl_fn({
                                data: res.result
                            })
                        $block_top.html(tmpl_str)
                    } else {
                        $block_none.show()
                    }
                }
            })
        }

        renderRewardSummary()

        // 获取提成列表数据
        function getRewardList(callback) {
            if (cacheData.no_more || cacheData.loading) {
                return
            }
            cacheData.loading = true

            var params = {
                page: cacheData.pn
            }
            $.get('/xxgHs/doGetSfFixBonusList', params, function (res) {
                cacheData.loading = false

                if (!res.errno && res.result) {
                    var result = res.result,
                        list = result.data || [],
                        pn_max = result.page,
                        data = {
                            list: list,
                            last_month: cacheData.last_month
                        }

                    $.isFunction(callback) && callback(data)

                    if (cacheData.pn === pn_max) {
                        cacheData.no_more = true
                        var $target = $('.block-list')
                        uiAddNoMoreHtml($target)
                    }

                    cacheData.pn++
                    cacheData.last_month = list.length && list[list.length - 1].month
                }
            })
        }

        // 添加提成列表
        function appendRewardList() {
            getRewardList(function (data) {
                var tmpl_fn = $.tmpl($.trim($('#JsXxgSfFixRewardListTpl').html())),
                    tmpl_str = tmpl_fn({
                        list: data.list,
                        last_month: data.last_month
                    })

                var $target = $('.block-list')
                $target.append(tmpl_str)
            })
        }

        // 添加没有更多商品的html显示
        function uiAddNoMoreHtml($target) {
            var html_st = '<div class="ui-no-more" id="UINoMore">已经没有更多内容~</div>'

            $target = $target || $('body')

            $target.append(html_st)
        }

        $(window).on('load scroll', function () {
            // 滚动条滚动的高度 + 可视窗口的高度 >= 文档的高度
            if ($(window).scrollTop() + $(window).height() >= $('body')[0].scrollHeight) {
                appendRewardList()
            }
        })
    })
}()
