{%extends file="layout/base_hsmer.tpl"%}
{%block name="block_title"%}Top机型回收数据表{%/block%}
{%block name="block_css" append%}
{%/block%}

{%block name="block_body"%}
    <section class="am-panel am-panel-default am-margin">
        <header class="am-panel-hd">
            <h3 class="am-panel-title">Top机型回收数据表</h3>
        </header>
        <div class="am-panel-bd">
            <form class="am-form am-form-horizontal am-padding-0 am-cf" role="form">
                <div class="am-form-group am-u-sm-2">
                    <label for="model_id" class="am-u-sm-2 am-padding-0">机型</label>
                    <select id="model_id" name="model_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                </div>

                <div class="am-form-group am-u-sm-2">
                    <label for="capacity_id" class="am-u-sm-2 am-padding-0">容量</label>
                    <select id="capacity_id" name="capacity_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                </div>

                <div class="am-form-group am-u-sm-4">
                    <label for="channel_id" class="am-u-sm-2 am-padding-0">合作方</label>
                    <select id="channel_id" name="channel_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}">
                        {%foreach $channelArr as $channelId=>$channelName%}
                            {%if $channelId==($smarty.get.channel_id|default:1)%}
                                <option value="{%$channelId%}" selected>{%$channelName%}</option>
                            {%else%}
                                <option value="{%$channelId%}">{%$channelName%}</option>
                            {%/if%}
                        {%/foreach%}
                    </select>
                </div>

                <div class="am-form-group am-u-sm-4">
                    <div class="am-u-sm-6">
                        <button id="searchBtn" type="submit" class="am-btn am-btn-primary">搜索</button>
                    </div>
                </div>
            </form>

            {%if empty($saleList)%}
                <p class="no-result">没有符合条件的记录！</p>
            {%else%}
                <table class="am-table am-table-bordered am-table-radius am-table-striped">
                    <thead>
                    <tr>
                        <th>等级</th>
                        <th>最近7天销售均价</th>
                        <th>最近7天销售数量</th>
                        <th>回收价</th>
                        <th>回收预期利润率</th>
                        <th>回收预期利润额</th>
                    </tr>
                    </thead>

                    <tbody>
                    {%foreach $qualityArr as $qualityId=>$qualityObj%}
                        <tr>
                            <td>
                                {%$qualityObj->level_name%}
                            </td>

                            {%if !isset($saleList[$qualityId])%}
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            {%else%}
                                {%$recyclePrice = intval(ceil(fen2yuan_filter_zero($priceList[$qualityId]['price'])))%}
                                <td>{%fen2yuan_filter_zero($saleList[$qualityId]['avgSoldPrice'])%}</td>
                                <td>{%$saleList[$qualityId]['num']%}</td>
                                <td>{%$recyclePrice%}</td>
                                <td>{%$priceList[$qualityId]['expectProfitPercent']%}%</td>
                                <td>{%number_format($recyclePrice * $priceList[$qualityId]['expectProfitPercent'] / 100, 2)%}</td>
                            {%/if%}
                        </tr>
                    {%/foreach%}
                    </tbody>
                </table>
            {%/if%}
        </div>
    </section>
{%/block%}

{%block name="block_js" append%}
    <script type="text/javascript">
        var exportUrl = '/hsmm/downloadTopSaleData';
        $(function () {
            var __capacityList__ = {}    // 容量列表
            var __model_id = {%json_encode($smarty.get.model_id|default:'')%}
            var __capacity_id = {%json_encode($smarty.get.capacity_id|default:'')%}


                // 获取机型
                function getHuishouModel(callback) {
                    $.ajax({
                        url: '/hsmm/getTopSaleModelList ',
                        data: {},
                        dataType: 'json',
                        type: 'POST',
                        success: function (res) {
                            if (res.errno === 0) {
                                if (typeof callback === 'function') {
                                    callback(res.result)
                                }
                            } else {
                                newAlert('wrong', '管理后台', '操作失败<br/>' + res.errmsg);
                            }
                        },
                        error: function (res) {
                            newAlert('wrong', '管理后台', '请求失败,请重试<br/>' + res.errmsg);
                        }
                    })
                }

            // 获取容量
            function getHuishouCapacityListByModel(model_id, callback) {
                $.ajax({
                    url: '/hsmm/getHuishouCapacityListByModel',
                    data: {
                        model_id: model_id
                    },
                    dataType: 'json',
                    type: 'POST',
                    success: function (res) {
                        if (res.errno === 0) {
                            __capacityList__[model_id] = res.result    // 缓存请求数据

                            if (typeof callback === 'function') {
                                callback(res.result)
                            }
                        } else {
                            newAlert('wrong', '管理后台', '操作失败<br/>' + res.errmsg);
                        }
                    },
                    error: function (res) {
                        newAlert('wrong', '管理后台', '请求失败,请重试<br/>' + res.errmsg);
                    }
                })
            }


            // 渲染机型列表
            function initModelList() {
                var $ele_model = $('#model_id')
                var _html_str = '<option value="">请选择机型</option>'
                getHuishouModel(function (res) {
                    if (!$.isEmptyObject(res)) {
                        $.each(res, function (i, v) {
                            if (__model_id == i) {
                                _html_str += '<option selected value="' + i + '">' + v + '</option>'
                            } else {
                                _html_str += '<option value="' + i + '">' + v + '</option>'
                            }

                        })

                        $ele_model.html(_html_str)
                    }
                });
            }

            // 渲染容量
            function initcapacity(res) {
                var $ele_capacity = $('#capacity_id')
                var _html_str = '<option value="">请选择容量</option>'
                if (!$.isEmptyObject(res)) {
                    $.each(res, function (i, v) {
                        if (__capacity_id == i) {
                            _html_str += '<option selected value="' + i + '">' + v + '</option>'
                        } else {
                            _html_str += '<option value="' + i + '">' + v + '</option>'
                        }
                    })

                    $ele_capacity.html(_html_str)
                }
            }

            // 机型列表改变事件
            function modelChangeEvent(val) {
                var _select_val = parseInt(val)
                var _capacity_data = {}

                if (!Number.isNaN(_select_val)) {
                    // 这里做下判断,看是否有已经缓存的容量数据
                    _capacity_data = __capacityList__[_select_val]

                    if (typeof _capacity_data === 'undefined') {
                        getHuishouCapacityListByModel(_select_val, initcapacity)
                    } else {
                        initcapacity(_capacity_data)
                    }

                }
            }

            // 机型列表事件绑定
            function bindEventModel() {
                $('#model_id').on('change', function (e) {
                    var _this = $(this)
                    modelChangeEvent(_this.val())
                })
            }

            function init() {
                initModelList()
                bindEventModel()
            }

            init()

        });

    </script>
{%/block%}