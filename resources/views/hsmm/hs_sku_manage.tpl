{%extends file="layout/base_hsmer.tpl"%}
{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf">
            <strong class="am-text-primary am-text-lg">回收机型</strong>
            /
            <small>SKU管理</small>
            /
            <strong>{%$model_detail.model_name%}</strong>
        </div>
    </div>
    <div class="am-g">
        <div class="am-u-md-12">
            <div class="am-panel am-panel-primary">
                <div class="am-panel-hd">
                    <strong>待同步回收SKU</strong>
                </div>
                <div class="am-panel-bd">
                    <form action="/hsmm/doAddSku" method="post">
                        <table class="am-table am-table-bordered am-table-radius">
                            <thead>
                            <tr>
                                <th>SKU id</th>
                                {%foreach $attribute_item as $key=>$value%}
                                    <th>{%$value%}</th>
                                {%/foreach%}
                                <th>copySku</th>
                                <th>基准价</th>
                            </tr>
                            </thead>
                            <tbody>
                            {%foreach $unBindHsPriceSkuLists as $skuGroup%}
                                <tr>
                                    <td>{%$skuGroup['sku_group_id']%}</td>
                                    {%foreach $skuGroup['sku_group'] as $attr%}
                                        <td>{%$attr['attribute_value']['sy_alias']%}</td>
                                    {%/foreach%}
                                    <td>
                                        <select name="copy_from_sku[]" data-am-selected="{btnSize: 'sm', maxHeight: 300, btnWidth: '100%'}">
                                            <option value="0">选择copySku</option>
                                            {%foreach $sku_options as $sku%}
                                                <option value="{%$sku['sku_groupid']%}">
                                                    {%foreach $sku['sku_group_detail'] as $detail%}
                                                        {%$detail['attr_valuename']%}
                                                    {%/foreach%}
                                                </option>
                                            {%/foreach%}
                                        </select>
                                    </td>
                                    <td>
                                        <input type="number" class="am-form-field am-input-sm" name="basic_price[]" value="">
                                        <input type="hidden" name="sku_group_id[]" value="{%$skuGroup['sku_group_id']%}">
                                    </td>
                                </tr>
                            {%/foreach%}
                            </tbody>
                            <tfoot>
                            <tr>
                                <td colspan="{%count($attribute_item) + 3%}" class="am-text-right">
                                    <input type="hidden" name="model_id" value="{%$model_id%}">
                                    <button type="submit" class="am-btn am-btn-primary am-btn-sm default-form-submit-confirm">确定</button>
                                </td>
                            </tr>
                            </tfoot>
                        </table>
                    </form>
                </div>
            </div>
            {%if $levelMap%}
                <div class="am-panel am-panel-warning">
                    <div class="am-panel-hd">质检等级价格百分比设置</div>
                    <div class="am-panel-bd">
                        <form action="/hsmm/doEditQualityLevelPrice" method="post" class="am-form">
                            <table class="am-table am-table-bd  am-table-bordered am-table-hover">
                                <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>等级</th>
                                    <th>
                                        <ul class="am-avg-md-{%count($capacityList)+1%}">
                                            <li>
                                                <label style="margin: .5rem">报价百分比</label>
                                            </li>
                                            {%foreach $capacityList as $id => $name%}
                                                <li>
                                                    <label style="margin: .5rem">{%$name%}</label>
                                                </li>
                                            {%/foreach%}
                                        </ul>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {%foreach $levelMap as $levelId => $item %}
                                    <tr>
                                        <td>{%$levelId%}</td>
                                        <td>{%$item->level_name%}</td>
                                        <td>
                                            <ul class="am-avg-md-{%count($capacityList)+1%}">
                                                <li>
                                                    <div class="am-input-group am-input-group-sm" style="margin: .5rem">
                                                        <input type="number" class="am-form-field" name="level_price_per[{%$levelId%}]" value="{%$levelPricePerMap[$levelId]->base_price_per|default:0%}"/>
                                                        <span class="am-input-group-label">%</span>
                                                    </div>
                                                </li>
                                                {%foreach $capacityList as $id => $name %}
                                                    <li>
                                                        <div class="am-input-group am-input-group-sm" style="margin: .5rem">
                                                            <input type="number" class="am-form-field" name="quality_level_{%$id%}[{%$levelId%}]" value="{%$levelCapacityPricePerMap[$levelId][$id]|default:0%}"/>
                                                            <span class="am-input-group-label">%</span>
                                                        </div>
                                                    </li>
                                                {%/foreach%}
                                            </ul>
                                        </td>
                                    </tr>
                                {%/foreach%}
                                </tbody>
                                <tfoot>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th>
                                        <ul class="am-avg-md-{%count($capacityList)+1%}">
                                            <li>
                                                <span class="am-btn am-btn-success am-btn-sm update_from-submit">更新价格百分比</span>
                                                {%if $capacityList%}
                                                    <span class="am-btn am-btn-success am-btn-sm update_empty_from-submit">更新并清空容量百分比</span>
                                                {%/if%}
                                            </li>
                                            {%foreach $capacityList as $id => $name %}
                                                <li>
                                                    <span class="am-btn am-btn-success am-btn-sm update_attr_capacity_from-submit" attr_capacity="{%$id%}">更新价格百分比</span>
                                                </li>
                                            {%/foreach%}
                                        </ul>
                                    </th>
                                </tr>
                                </tfoot>
                            </table>
                            <input type="hidden" name="model_id" value="{%$model_id%}">
                        </form>
                    </div>
                </div>
            {%/if%}
            <div class="am-panel am-panel-success">
                <div class="am-panel-hd">
                    <strong>已有SKU</strong>
                </div>
                <div class="am-panel-bd form-edit-sku">
                    <table class="am-table am-table-bordered am-table-radius">
                        <thead>
                        <th>属性组ID</th>
                        {%foreach $attribute_item as $key=>$value%}
                            <th class="js-btn-sort" data-sort-id="{%$key%}" style="cursor: pointer;">
                                {%$value%}
                                <span class="am-icon-sort-down" style="display: none;"></span>
                            </th>
                        {%/foreach%}
                        <th>基准价(单位元)</th>
                        <th>更改回收状态</th>
                        <th>操作</th>
                        </thead>
                        <tbody class="js-sku-list">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div class="am-modal am-modal-prompt" tabindex="-1" id="modal-pinggu-options-edit">
        <div class="am-modal-dialog">
            <form method="post" action="/hsmm/doEditPingguOptionPrice/">
                <div class="am-modal-hd">编辑评估项价格</div>
                <div class="am-modal-bd">
                    <table class="am-table am-table-bordered am-table-radius">
                        <thead>
                        <th>评估项</th>
                        <th>价格</th>
                        <th>百分比</th>
                        {%foreach $pinggu_group as $key=>$value %}
                            <tr class="am-active" align="center">
                                <td><strong>{%$value.pinggu_group_name%}</strong></td>
                                <td colspan="2"></td>
                            </tr>
                            {%foreach $value.pinggu_group_options as $k=>$v%}
                                <tr align="center">
                                    <td>{%$v.option_name%}</td>
                                    <td><input type="text" class="am-form-field edit_pinggu_option_value" name="pinggu_option_{%$v.option_id%}[]" id="{%$v.option_id%}_price" data-option_id="{%$v.option_id%}" placeholder="影响价格"></td>
                                    <td><input type="text" class="am-form-field edit_pinggu_option_value" name="pinggu_option_{%$v.option_id%}[]" id="{%$v.option_id%}_per" data-option_id="{%$v.option_id%}" placeholder="影响百分比"></td>
                                </tr>
                            {%/foreach%}
                        {%/foreach%}
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
                <div class="am-modal-footer">
                    <input type="hidden" name="model_id" id="edit_option_model_id" value=""/>
                    <input type="hidden" name="sku_group_id" id="edit_option_sku_group_id" value=""/>
                    <span class="am-modal-btn" data-am-modal-cancel>取消</span>
                    <span class="am-modal-btn from-submit" data-am-modal-confirm>提交</span>
                </div>
            </form>
        </div>
    </div>
    <div class="am-modal am-modal-confirm" tabindex="-1" id="modal-pinggu-options-edit-all">
        <div class="am-modal-dialog">
            <form method="post" action="/hsmm/doEditAllPingguOptionPrice/">
                <div class="am-modal-hd">批量编辑评估项价格</div>
                <div class="am-modal-bd">
                    <table class="am-table am-table-bordered am-table-radius">
                        <thead>
                        <tr>
                            <th>评估项</th>
                            <th>价格</th>
                            <th>百分比</th>
                        </tr>
                        </thead>
                        <tbody>
                        {%foreach $pinggu_group as $key=>$value %}
                            <tr class="am-active" align="center">
                                <td><strong>{%$value.pinggu_group_name%}</strong></td>
                                <td colspan="2"></td>
                            </tr>
                            {%foreach $value.pinggu_group_options as $k=>$v%}
                                <tr align="center">
                                    <td>{%$v.option_name%}</td>
                                    <td>
                                        <input type="text" class="am-form-field edit_pinggu_option_value" name="pinggu_option_{%$v.option_id%}[]" id="{%$v.option_id%}_price" data-option_id="{%$v.option_id%}" placeholder="影响价格">
                                    </td>
                                    <td>
                                        <input type="text" class="am-form-field edit_pinggu_option_value" name="pinggu_option_{%$v.option_id%}[]" id="{%$v.option_id%}_per" data-option_id="{%$v.option_id%}" placeholder="影响百分比">
                                    </td>
                                </tr>
                            {%/foreach%}
                        {%/foreach%}

                        <tr class="am-active" align="center">
                            <td><strong>有值才更新,没值不更新!</strong></td>
                            <td colspan="2">(不钩选,则空值做为0处理)</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td colspan="2">
                                <label class="am-checkbox-inline">
                                    <input type="checkbox" name="changeOnlyValue" class="am-checkbox" value="10" checked="checked">有值才更新
                                </label>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <input type="hidden" name="sku_group_ids" value="{%foreach $sku_options as $key=>$value %}{%$value.sku_groupid%},{%/foreach%}">
                    <input type="hidden" name="model_id" id="edit_all_option_model_id" value="{%$model_id%}"/>
                </div>
                <div class="am-modal-footer">
                    <span class="am-modal-btn" data-am-modal-cancel>取消</span>
                    <span class="am-modal-btn from-submit" data-am-modal-confirm>提交</span>
                </div>
            </form>
        </div>
    </div>
    <div class="am-modal am-modal-confirm" tabindex="-1" id="modal-modify-price">
        <div class="am-modal-dialog">
            <form id="batch-modify-price" action="/hsmm/doUpdateBasePrice" class="am-form" data-am-validator>
                <div class="am-modal-hd">批量修改基准价
                    <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
                </div>
                <div class="am-modal-bd">
                    <input type="hidden" name="model_id" value="{%$model_id%}">
                    {%foreach $sku_attr_list as $key=>$attr_item%}
                        <div class="am-g">
                            <div class="am-u-md-2">
                                <label class="am-form-label">{%$attr_item['attr_name']%}：</label>
                            </div>
                            <div class="am-u-md-10">
                                <div class="am-form-group am-text-left check-group">
                                    <span class="check-all am-btn am-btn-success am-btn-xs">全部</span>
                                    {%foreach $attr_item['attr_list'] as $item%}
                                        <label class="am-checkbox-inline">
                                            <input class="check-self" type="checkbox" value="{%$item['attr_valueid']%}" name="sku_attr_list[{%$attr_item['attr_id']%}][]" checked> {%$item['attr_valuename']%}
                                        </label>
                                    {%/foreach%}
                                </div>
                            </div>
                        </div>
                    {%/foreach%}
                    <div class="am-g">
                        <div class="am-u-md-2">
                            <label>操作： </label>
                        </div>
                        <div class="am-u-md-10">
                            <div class="am-form-group am-text-left">
                                <label class="am-radio-inline">
                                    <input type="radio" value="10" name="price_type" required checked> 更改基准价
                                </label>
                                <label class="am-radio-inline">
                                    <input type="radio" value="20" name="price_type"> 增加基准价（+）
                                </label>
                                <label class="am-radio-inline">
                                    <input type="radio" value="30" name="price_type"> 减少基准价（-）
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="am-g">
                        <div class="am-u-md-2">
                            <label>价格：</label>
                        </div>
                        <div class="am-u-md-10">
                            <div class="am-form-group">
                                <input type="number" class="am-form-field" name="price" placeholder="输入价格" required/>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="am-modal-footer">
                    <span class="am-modal-btn" data-am-modal-cancel>取消</span>
                    <span class="am-modal-btn from-submit" data-am-modal-confirm>提交</span>
                </div>
            </form>

        </div>
    </div>
    <script type="text/html" id="JsHsmmSkuListTpl">
        {for(var i=0; i<$sku_list.length; i++)}
        {js var item = $sku_list[i]}
        <tr class="am-text-center">
            <td>{item.sku_groupid}</td>
            {for(var j in $attribute_item_map)}
            {js var detail_item=item.sku_group_detail[j]}
            <td>{detail_item.attr_valuename}</td>
            {/for}
            <td>
                <form action="/hsmm/doUpdateSkuPrice" method="post">
                    <input type="hidden" name="sku_group_id" value="{item.sku_groupid}">
                    <input type="hidden" name="model_id" value="{item.model_id}">
                    <div class="am-input-group am-input-group-sm am-input-group-warning">
                        <input type="number" class="am-form-field" name="price" placeholder="{item.standard_price}" value="{item.standard_price}">
                        <span class="am-input-group-btn">
                            <button type="submit" class="am-btn am-btn-warning from-submit">保存基准价</button>
                        </span>
                    </div>
                </form>
            </td>
            <td>
                <form action="/hsmm/doUpdateSkuPriceStatus" method="post">
                    <input type="hidden" name="sku_group_id" value="{item.sku_groupid}">
                    <input type="hidden" name="model_id" value="{item.model_id}">
                    <label class="am-radio-inline">
                        <input type="radio" class="recycle-status recycle-status-enable" name="to_status" value="10" data-am-ucheck data-skugroup="{item.sku_groupid}" {if(item.status== 10)}checked{/if}> 启用
                    </label>
                    <label class="am-radio-inline">
                        <input type="radio" class="recycle-status recycle-status-disable" name="to_status" value="50" data-am-ucheck data-skugroup="{item.sku_groupid}" {if(item.status== 50)}checked{/if}> 禁用
                    </label>
                    <button type="submit" class="am-btn am-btn-warning am-btn-sm from-submit">提交</button>
                </form>
            </td>
            <td>
                {if($pinggu_group&&$pinggu_group.length)}
                <button data-model_id="{item.model_id}" data-sku_group_id="{item.sku_groupid}" type="button" class="am-btn am-btn-warning am-btn-sm edit_pinggu_options">设置评估项价格</button>
                {else}
                -
                {/if}
            </td>
        </tr>
        {/for}
        <tr class="am-text-center am-danger">
            <td>批量操作</td>
            {for(var j in $attribute_item_map)}
            <td>-</td>
            {/for}
            <td>
                <span class="am-btn am-btn-danger am-btn-sm am-btn-edit-all-base-price">批量修改基准价</span>
            </td>
            <td>
                <label class="am-radio-inline">
                    <input type="radio" name="batchRecycleStatus" data-am-ucheck onclick="$('.recycle-status-enable').prop('checked', true);"> 全部启用
                </label>
                <label class="am-radio-inline">
                    <input type="radio" name="batchRecycleStatus" data-am-ucheck onclick="$('.recycle-status-disable').prop('checked', true);"> 全部禁用
                </label>
                <button data-model_id="{$model_id}" type="button" class="am-btn am-btn-danger am-btn-sm edit_all_recycle_status">批量更改回收状态</button>
            </td>
            <td>
                {if($pinggu_group&&$pinggu_group.length)}
                <button data-model_id="{$model_id}" type="button" class="am-btn am-btn-danger am-btn-sm edit_all_pinggu_options">批量设置评估项价格</button>
                {else}
                -
                {/if}
            </td>
        </tr>
    </script>
{%/block%}

{%block name="block_js" append%}
    <script>
        window.__PINGGU_GROUP ={%json_encode($pinggu_group|default:[])%};
        window.__MODEL_ID ={%json_encode($model_id|default:'')%};
    </script>
    <script src="/resource/js/lib/jquery/jquery.tmpl.js"></script>
    <script type="text/javascript">
        var _len = 1;
        var deltr = function (index) {
            $("tr[id='" + index + "']").remove();//删除当前行
        }
        $(".edit_sku").on('click', function () {
            var model_id = $(this).data("model_id");
            window.open('/hsmm/hsSkuManage?model_id=' + model_id)
        });
        // 更新价格百分比
        $('.update_from-submit').on('click', function (e) {
            e.preventDefault();
            var $this = $(this);
            disabledSubmitButton($this);
            var $form = $this.closest('form');
            var action = $form.attr('action');
            var params = $form.serialize();
            params = params + '&cancel=false';
            submitForm(action, params);
        });

        // 更新&清空价格百分比
        $('.update_empty_from-submit').on('click', function (e) {
            e.preventDefault();
            var $form = $(this).closest('form');
            var action = $form.attr('action');
            var params = $form.serialize();
            newConfirm('warning', '管理', '是否同时清空by容量的报价比例 ?', function () {
                resAjxjRequest(action, params);
            });
        });
        // 更新容量报价百分比
        $('.update_attr_capacity_from-submit').on('click', function (e) {
            e.preventDefault();
            var $form = $(this).closest('form');
            var attr_capacity = $(this).attr("attr_capacity");
            newConfirm('warning', '管理', '是否进行操作该容量报价百分比 ?', function () {
                var params = $form.serialize() + '&attr_capacity=' + attr_capacity;
                var action = '/hsmm/CapacityLevelPrice';
                resAjxjRequest(action, params);
            });
        });

        function bindEvent($wrap) {
            $wrap = $wrap || $('body')
            // 表单提交
            $wrap.find('.from-submit').on('click', function (e) {
                e.preventDefault();
                var $form = $(this).closest('form');
                toConfirm(function () {
                    var action = $form.attr('action');
                    var params = $form.serialize();
                    $.ajax({
                        url: action,
                        async: true,
                        data: params,
                        dataType: 'json',
                        type: 'POST',
                        success: function (res) {
                            if (!res.errno) {
                                newAlert('success', '管理', '操作成功<br/>' + res.errmsg, function () {
                                    window.location.reload();
                                });
                            } else {
                                newAlert('wrong', '管理', '操作失败<br/>' + res.errmsg);
                                window.location.reload();
                            }
                        },
                        error: function (res) {
                            newAlert('wrong', '管理', '请求失败,请重试');
                            window.location.reload();
                        }
                    });
                });
            });

            // 设置评估项价格
            $('.edit_pinggu_options').on('click', function (e) {
                e.preventDefault()
                $("#modal-pinggu-options-edit input[type=text]").val('');
                var model_id = $(this).data("model_id");
                var sku_group_id = $(this).data("sku_group_id");
                $("#edit_option_model_id").val(model_id);
                $("#edit_option_sku_group_id").val(sku_group_id);
                $.ajax({
                    url: '/hsmm/doGetPingguOptions/',
                    async: true,
                    data: {
                        model_id: +model_id,
                        sku_group_id: +sku_group_id,
                    },
                    dataType: 'json',
                    type: 'POST',
                    success: function (res) {
                        if (!res['errno']) {
                            for (var i in res['result']) {
                                $("#" + res['result'][i]['option_id'] + "_price").val(res['result'][i]['price']);
                                $("#" + res['result'][i]['option_id'] + "_per").val(res['result'][i]['price_per']);
                            }
                            $('#modal-pinggu-options-edit').modal({
                                closeViaDimmer: 0,
                                width: 800
                            });
                        } else {
                            newAlert('wrong', '获取评估信息失败', '请求失败,请重试');
                        }
                    },
                    error: function (res) {
                        newAlert('wrong', '获取评估信息失败', '请求失败,请重试');
                    }
                });
            });

            // 批量设置评估项价格
            $('.edit_all_pinggu_options').on('click', function (e) {
                e.preventDefault()
                $('#modal-pinggu-options-edit-all').modal({
                    closeViaDimmer: 0,
                    width: 800
                })
            })

            $('.edit_all_recycle_status').on('click', function (e) {
                e.preventDefault();
                let data = [];
                $('.recycle-status:checked').each(function () {
                    let $this = $(this);
                    data.push($this.data('skugroup') + ':' + $this.val());
                });
                let $submitButton = $(this);
                toConfirm(function () {
                    disabledSubmitButton($submitButton);
                    submitForm('/hsmm/doBatchUpdateSkuPriceStatus', {
                        modelId: window.__MODEL_ID,
                        data: data
                    });
                });
            });

            // 批量修改基准价
            $('.am-btn-edit-all-base-price').on('click', function (e) {
                e.preventDefault()
                $('#modal-modify-price').modal({
                    closeViaDimmer: 0,
                    width: 800
                })
            })
        }

        bindEvent()

        function toConfirm(onConfirmCallback) {
            return newConfirm('warning', '管理', '是否进行操作 ?', onConfirmCallback);
        }

        function resAjxjRequest(action, params) {
            $.ajax({
                url: action,
                async: true,
                data: params,
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (!res.errno) {
                        newAlert('success', '管理', '操作成功<br/>' + res.errmsg, function () {
                            window.location.reload();
                        });
                    } else {
                        newAlert('wrong', '管理', '操作失败<br/>' + res.errmsg, function () {
                            window.location.reload();
                        });
                    }
                },
                error: function (res) {
                    newAlert('wrong', '管理', '请求失败,请重试');
                    window.location.reload();
                }
            });
        }

        function getSkuList(sort) {
            var model_id = $('[name = "model_id"]').val()
            $.get('/hsmm/getInfoBySku', {
                model_id: model_id,
                sort: sort || 0
            }, function (res) {
                res = $.parseJSON(res)

                if (!res.errno) {
                    var sku_list = res.result.options;
                    var attribute_item_map = res.result.attributeItemMap;

                    var html_fn = $.tmpl($.trim($('#JsHsmmSkuListTpl').html())),
                            html_str = html_fn({
                                attribute_item_map: attribute_item_map,
                                sku_list: sku_list,
                                model_id: window.__MODEL_ID,
                                pinggu_group: window.__PINGGU_GROUP
                            })

                    $('.js-sku-list').html(html_str)

                    bindEvent($('.form-edit-sku'))
                }
            })
        }

        getSkuList()
        // 排序
        $('.js-btn-sort').on('click', function (e) {
            e.preventDefault()

            var $me = $(this),
                    sort = $me.attr('data-sort-id')

            getSkuList(sort)

            $('.js-btn-sort .am-icon-sort-down').hide()
            $me.find('.am-icon-sort-down').show()
        })

    </script>
    <script>
        ;(function () {

            //更改质检等级对应价格的表单提交
            $('#quality_price_form').on('submit', function (e) {
                e.preventDefault()
                var $this = $(this)

                $this.closest('.am-modal-dialog').hide()

                newConfirm('warning', '管理', '是否进行操作 ?', function () {
                    $.ajax({
                        type: 'GET',
                        url: $this.attr('action'),
                        data: decodeURI($this.serialize()),
                        success: function (res) {
                            res = JSON.parse(res)
                            if (!res.errno) {
                                newAlert('success', '管理', '操作失败<br/>' + res.errmsg, function () {
                                    window.location.reload();
                                });
                            } else {
                                newAlert('success', '管理', '操作成功<br/>' + '成功修改报价百分比', function () {
                                    window.location.reload();
                                });

                            }
                        }
                    })
                }, function () {
                    window.location.reload()
                })
            })

            //批量修改基准价表单
            $('#batch-modify-price').on('submit', function (e) {
                e.preventDefault()
                var $this = $(this)

                $this.closest('.am-modal-dialog').hide()

                newConfirm('warning', '管理', '是否进行操作 ?', function () {
                    $.ajax({
                        type: 'GET',
                        url: $this.attr('action'),
                        data: decodeURI($this.serialize()),
                        success: function (res) {
                            res = JSON.parse(res)
                            if (!res.errno) {

                                newAlert('success', '管理', '操作成功<br/>' + '成功修改' + res.result['sucNum'] + '条，失败' + res.result['failNum'] + '条', function () {
                                    window.location.reload();
                                });

                            } else {
                                newAlert('success', '管理', '操作成功<br/>' + res.errmsg, function () {
                                    window.location.reload();
                                });
                            }
                        }
                    })
                }, function () {
                    window.location.reload()
                })
            })

            var $check_groups = $('#batch-modify-price').find('.check-group')
            for (var i = 0; i < $check_groups.length; i++) {
                Select($check_groups[i])
            }

            //全选
            function Select(container) {
                var $container = $(container),
                        $check_all = $container.find('.check-all'),
                        $check_selfs = $container.find('.check-self')

                $check_all.click(function () {
                    $check_selfs.prop('checked', true)
                })
            }
        })()
    </script>
{%/block%}
