{%extends file="layout/base_hsmer.tpl"%}
{%block name="block_title"%}回收价反哺{%/block%}
{%block name="block_css" append%}
{%/block%}

{%block name="block_body"%}
<div class="am-cf am-padding">
    <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">回收价反哺数据</strong>
        <small></small>
    </div>
</div>
<section class="am-panel am-panel-default am-margin">
    <header class="am-panel-hd">
        <h3 class="am-panel-title">反哺回收价格查询</h3>
    </header>

    {%if $error_msg != null%}
        <div class="am-panel-bd am-warning">
            <strong class="am-text-primary am-text-lg" style="color: red;">提示：{%$error_msg%}</strong>
        </div>
    {%/if%}

    <div class="am-panel-bd">
        <form class="am-form am-form-horizontal am-padding-0 am-cf" role="form">

            <div class="am-panel-bd">

                <div class="am-form-group am-u-sm-20">
                    <label for="pattern_id" class="am-u-sm-2 am-padding-0">反哺模式</label>
                    <select id="pattern_id" name="pattern_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                </div>

                <div class="am-form-group am-u-sm-20">
                    <label for="partner_id" class="am-u-sm-2 am-padding-0">反哺合作方</label>
                    <select id="partner_id" name="partner_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                </div>
            </div>

            <div class="am-panel-bd">

                <div class="am-form-group am-u-sm-20">
                    <label for="brand_id" class="am-u-sm-2 am-padding-0">品牌</label>
                    <select id="brand_id" name="brand_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                </div>

                <div class="am-form-group am-u-sm-20">
                    <label for="model_id" class="am-u-sm-2 am-padding-0">机型</label>
                    <select id="model_id" name="model_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                </div>
            </div>

            <div class="am-panel-bd">

                <div class="am-form-group am-u-sm-20">
                    <label for="sku_group_id" class="am-u-sm-2 am-padding-0">SKU组合</label>
                    <select id="sku_group_id" name="sku_group_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                </div>

                <div class="am-form-group am-u-sm-20">
                    <label for="level_id" class="am-u-sm-2 am-padding-0">等级</label>
                    <select id="level_id" name="level_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                </div>

            </div>

            <div class="am-panel-bd">

                <div class="am-form-group am-u-sm-20">
                    <button id="searchBtn" type="submit" class="am-btn am-btn-primary">精确查询（请指定全部条件）</button>
                </div>

            </div>
        </form>

        {%if $data_list != null%}
            <div class="am-panel-bd">
                <br/><label>【查询结果】</label>：{%count($data_list)%}件
                <br/>
                <br/><label>【查询条件】</label>：
                {%foreach $condition_list as $condition%}
                    {%$condition%}；&nbsp;
                {%/foreach%}

            </div>

            <div class="am-panel-bd">
                <label>
                    【质检选项价格加减规则】：
                </label>
                <table class="am-table am-table-bordered am-table-radius am-table-striped" style="width:70%">
                    <thead>
                    <tr>
                        <th width="5%;">序号</th>
                        <th width="75%;">质检选项价格加减规则</th>
                    </tr>
                    </thead>

                    <tbody>
                    {%foreach $rule_list as $num_rule => $rule%}
                        <tr>
                            <td>
                                {%$num_rule+1%}
                            </td>
                            <td>
                                {%$rule['content']%}
                            </td>
                        </tr>
                    {%/foreach%}
                    </tbody>
                </table>
            </div>

            <div class="am-panel-bd">
                <label>
                    <br/>
                    【质检选项组合，以及回收价格】：
                    <br/>
                    <p style="color:red;">注意：实际回收价格会取整，且加减1至2元</p>
                </label>

                <table class="am-table am-table-bordered am-table-radius am-table-striped" style="width:70%">

                    <thead>
                    <tr>
                        <th width="5%;">序号<br/>&nbsp;</th>
                        <th width="25%;">特殊质检选项组合<br/>&nbsp;</th>
                        <th width="10%;">反哺回收价格<br/>（单位：元）</th>
                        <th width="20%;">价格加减<br/>&nbsp;</th>
                        <th width="10%;">最终回收价格<br/>（单位：元）</th>
                    </tr>
                    </thead>

                    <tbody>
                    {%foreach $data_list as $num_data => $item%}
                        <tr>
                            <td>
                                {%$num_data+1%}
                            </td>
                            <td>
                                {%foreach $item.ruleInfo as $ruleItem%}
                                    &#9830;&nbsp;{%$ruleItem%}<br/>
                                {%/foreach%}
                            </td>
                            <td>
                                {%$item.fanbu_price%}
                            </td>
                            <td>
                                {%foreach $item.price_per as $perItem%}
                                    {%$perItem%}<br/>
                                {%/foreach%}
                            </td>
                            <td>
                                {%$item.huishou_price%}
                            </td>
                        </tr>
                    {%/foreach%}
                    </tbody>
                </table>
            </div>
        {%/if%}
    </div>
</section>
{%/block%}

{%block name="block_js" append%}
<script type="text/javascript">

    $(function () {
        var __patternList__ = {}    //
        var __modelList__ = {}    // 机型列表
        var __skuGroupList__ = {}    // 容量列表
        var __pattern_id = {%json_encode($smarty.get.pattern_id|default:'show_all')%}
        var __partner_id = {%json_encode($smarty.get.partner_id|default:'show_all')%}
        var __brand_id = {%json_encode($smarty.get.brand_id|default:'show_all')%}
        var __model_id = {%json_encode($smarty.get.model_id|default:'show_all')%}
        var __sku_group_id = {%json_encode($smarty.get.sku_group_id|default:'show_all')%}
        var __level_id = {%json_encode($smarty.get.level_id|default:'show_all')%};

        // 获取反哺模式
        function getHuishouPattern(callback) {
            $.ajax({
                url: '/hsmm/getPatternList',
                data: {
                    'param':1
                },
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
        };

        // 获取合作方
        function getHuishouPartner(pattern_id, callback) {
            $.ajax({
                url: '/hsmm/getPartnerList',
                data: {
                    'pattern_id':pattern_id
                },
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

        // 获取品牌
        function getHuishouBrand(callback) {
            $.ajax({
                url: '/hsmm/getHuishouBrand ',
                data: {
                    category_id: 1,
                },
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

        // 获取机型
        function getHuishouModel(brand_id, callback) {
            $.ajax({
                url: '/hsmm/getHuishouModel ',
                data: {
                    category_id: 1,
                    brand_id: brand_id
                },
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (res.errno === 0) {
                        __modelList__[brand_id] = res.result    // 缓存请求数据

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

        // 获取SKU
        function getHuishouSkuGroupListByModel(model_id, callback) {
            $.ajax({
                url: '/hsmm/getSkuGroupByModel',
                data: {
                    model_id: model_id
                },
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (res.errno === 0) {
                        __skuGroupList__[model_id] = res.result    // 缓存请求数据

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

        // 获取等级
        function getQualityLevel(callback) {
            $.ajax({
                url: '/hsmm/getQualityLevel ',
                dataType: 'json',
                type: 'get',
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


        // 渲染反哺模式列表
        function initPatternList() {
            var $ele_pattern = $('#pattern_id')
            var _html_str = '<option value="show_all">请选择反哺模式</option>'
            getHuishouPattern(function (res) {
                if (!$.isEmptyObject(res)) {
                    $.each(res, function (i, v) {
                        if (__pattern_id == i) {
                            _html_str += '<option selected value="' + i + '">' + v + '</option>'
                        } else {
                            _html_str += '<option value="' + i + '">' + v + '</option>'
                        }

                    })

                    $ele_pattern.html(_html_str)
                }
            })
        }


        // 渲染机型列表
        function initPartnerList(res) {
            var $ele_partner = $('#partner_id')
            var _html_str = '<option value="show_all">请选择合作方</option>'
            if (!$.isEmptyObject(res)) {
                $.each(res, function (i, v) {
                    if (__partner_id == i) {
                        _html_str += '<option selected value="' + i + '">' + v + '</option>'
                        $("[name='partner_name']").html(v)
                    } else {
                        _html_str += '<option value="' + i + '">' + v + '</option>'
                    }
                })

                $ele_partner.html(_html_str)
            }
        }

        // 渲染品牌列表
        function initBrandList() {
            var $ele_brand = $('#brand_id')
            var _html_str = '<option value="show_all">请选择品牌</option>'
            getHuishouBrand(function (res) {
                if (!$.isEmptyObject(res)) {
                    $.each(res, function (i, v) {
                        if (__brand_id == i) {
                            _html_str += '<option selected value="' + i + '">' + v + '</option>'
                        } else {
                            _html_str += '<option value="' + i + '">' + v + '</option>'
                        }

                    })

                    $ele_brand.html(_html_str)
                }
            })
        }

        // 渲染机型列表
        function initModelList(res) {
            var $ele_model = $('#model_id')
            var _html_str = '<option value="show_all">请选择机型</option>'
            if (!$.isEmptyObject(res)) {
                $.each(res, function (i, v) {
                    if (__model_id == i) {
                        _html_str += '<option selected value="' + i + '">' + v + '</option>'
                        $("[name='model_name']").html(v)
                    } else {
                        _html_str += '<option value="' + i + '">' + v + '</option>'
                    }
                })
                $ele_model.html(_html_str)
            }
        }

        // 渲染等级列表
        function initQualityLevel() {
            var $ele_level = $('#level_id')
            var _html_str = '<option value="show_all">请选择等级</option>'
            getQualityLevel(function (res) {
                if (!$.isEmptyObject(res)) {
                    $.each(res, function (i, v) {
                        if(v.category_id == 1){
                            if (__level_id == v.id) {
                                _html_str += '<option selected value="' + v.id + '">' + v.level_name + '</option>'
                                $("[name='level_name']").html(v.level_name)
                            } else {
                                _html_str += '<option value="' + v.id + '">' + v.level_name + '</option>'
                            }
                        }
                    })
                    $ele_level.html(_html_str)
                }
            })
        }


        // 渲染SKU列表
        function initSkuGroupList(res) {
            var $ele_sku_group = $('#sku_group_id')
            var _html_str = '<option value="show_all">请选择SKU</option>'
            if (!$.isEmptyObject(res)) {
                $.each(res, function (i, v) {
                    if (__sku_group_id == i) {
                        _html_str += '<option selected value="' + i + '">' + v + '</option>'
                        $("[name='sku_group_name']").html(v)
                    } else {
                        _html_str += '<option value="' + i + '">' + v + '</option>'
                    }
                })
                $ele_sku_group.html(_html_str)
            }
        }


        // 反哺模式列表改变事件
        function patternChangeEvent(val) {
            var _select_val = parseInt(val)
            var _pattern_data = {}

            if (!Number.isNaN(_select_val)) {
                // 这里做下判断,看是否有已经缓存的容量数据
                _pattern_data = __patternList__[_select_val]

                if (typeof _pattern_data === 'undefined') {
                    getHuishouPartner(_select_val, initPartnerList)
                } else {
                    initPartnerList(_pattern_data)
                }
            }
        }


        // 品牌改变事件
        function brandChangeEvent(val) {
            var _select_val = parseInt(val)
            var _model_data = {}

            if (!Number.isNaN(_select_val)) {
                // 这里做下判断,看是否有已经缓存的机型数据
                _model_data = __modelList__[_select_val]

                if (typeof _model_data === 'undefined') {
                    getHuishouModel(_select_val, initModelList)
                } else {
                    initModelList(_model_data)
                }
            }
        }

        // 机型列表改变事件
        function modelChangeEvent(val) {
            var _select_val = parseInt(val)
            var _sku_group_data = {}

            if (!Number.isNaN(_select_val)) {
                // 这里做下判断,看是否有已经缓存的容量数据
                _sku_group_data = __skuGroupList__[_select_val]

                if (typeof _sku_group_data === 'undefined') {
                    getHuishouSkuGroupListByModel(_select_val, initSkuGroupList)
                } else {
                    initSkuGroupList(_sku_group_data)
                }

            }
        }

        // 反哺模式事件绑定
        function bindEventPattern() {
            $('#pattern_id').on('change', function (e) {
                var _this = $(this)
                patternChangeEvent(_this.val())
            })
        }

        // 品牌事件绑定
        function bindEventBrand() {
            $('#brand_id').on('change', function (e) {
                var _this = $(this)
                brandChangeEvent(_this.val())
            })
        }

        // 机型列表事件绑定
        function bindEventModel() {
            $('#model_id').on('change', function (e) {
                var _this = $(this)
                modelChangeEvent(_this.val())
            })
        }

        function init() {
            initPatternList();
            initBrandList();
            initQualityLevel();
            bindEventPattern();
            bindEventBrand();
            bindEventModel();
        }

        init()

    });

</script>
{%/block%}