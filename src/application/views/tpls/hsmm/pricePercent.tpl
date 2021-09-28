{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf">
            <strong class="am-text-primary am-text-lg">回收报价比例调整</strong>
            <span class="am-badge am-badge-success">共{%$list->total()%}</span>
        </div>
    </div>
    <div class="am-g">
        <div class="am-u-md-12">
            <form action="/hsmm/pricePercent" method="get">
                <div class="am-g">
                    <div class="am-u-md-2">
                        <select class="origin" id="origin_filter" name="origin" data-am-selected="{btnSize: 'sm', maxHeight: 300, btnWidth: '100%'}">
                            <option value="show_all" {%if $smarty.get.origin === 'show_all'%}selected{%/if%}>不区分来源</option>
                            {%foreach $originNameMap as $value => $name%}
                                <option value="{%$value%}" {%if $smarty.get.origin === (string)$value%}selected{%/if%}>{%$name%}</option>
                            {%/foreach%}
                        </select>
                    </div>
                    <div class="am-u-md-2">
                        <select id="category_filter" name="category_id" data-am-selected="{btnSize: 'sm', maxHeight: 300, btnWidth: '100%'}">
                            <option value="show_all" {%if $smarty.get.category_id === 'show_all'%}selected{%/if%}>不区分品类</option>
                            <option value="-1" {%if $smarty.get.category_id === '-1'%}selected{%/if%}>所有</option>
                            {%foreach $categoryNameMap as $value => $name%}
                                <option value="{%$value%}" {%if $smarty.get.category_id === (string)$value%}selected{%/if%}>{%$name%}</option>
                            {%/foreach%}
                        </select>
                    </div>
                    <div class="am-u-md-2">
                        <select id="brand_filter" name="brand_id" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}">
                            <option value="show_all" {%if $smarty.get.brand_id === 'show_all'%}selected{%/if%}>不区分品牌</option>
                            <option value="-1" {%if $smarty.get.brand_id === '-1'%}selected{%/if%}>所有</option>
                            {%foreach $brandNameMap as $value => $name%}
                                <option value="{%$value%}" {%if $smarty.get.brand_id === (string)$value%}selected{%/if%}>{%$name%}</option>
                            {%/foreach%}
                        </select>
                    </div>
                    <div class="am-u-md-2">
                        <select id="model_filter" name="model_id" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}">
                            <option value="show_all" {%if $smarty.get.model_id === 'show_all'%}selected{%/if%}>不区分型号</option>
                            <option value="-1" {%if $smarty.get.model_id === '-1'%}selected{%/if%}>所有</option>
                        </select>
                    </div>
                    <div class="am-u-md-2">
                        <select id="skugroup_filter" name="skugroup_id" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}">
                            <option value="show_all" {%if $smarty.get.skugroup_id === 'show_all'%}selected{%/if%}>不区分SKU</option>
                            <option value="-1" {%if $smarty.get.skugroup_id === '-1'%}selected{%/if%}>所有</option>
                        </select>
                    </div>
                    <div class="am-u-md-2">
                        <select id="limit" name="limit" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}">
                            {%foreach $limitMap as $value%}
                                <option value="{%$value%}" {%if $smarty.get.limit === (string)$value%}selected{%/if%}>每页 {%$value%} 条</option>
                            {%/foreach%}
                        </select>
                    </div>
                </div>
                <br/>
                <div class="am-g">
                    <div class="am-u-md-2">
                        <div class="am-btn-group" data-am-button>
                            <label class="am-btn am-btn-sm am-btn-primary">
                                <input type="checkbox" name="origin_extend_filter" value="1"{%if $smarty.get.origin_extend_filter%} checked{%/if%}> 来源扩展信息筛选
                            </label>
                        </div>
                    </div>
                    <div class="origin_extend_1 am-u-md-4" id="origin_extend_1" hidden>
                        <div class="am-g">
                            <div class="am-u-md-6">
                                <select id="partner" class="partner" name="origin_extend[partner]" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}" placeholder="所有">
                                    <option value="show_all"{%if $smarty.get.origin_extend.partner == 'show_all'%} selected {%/if%}>不区分合作方</option>
                                    <option value="-1"{%if $smarty.get.origin_extend.partner == '-1'%} selected {%/if%}>所有</option>
                                    {%foreach $partnerNameMap as $value => $name%}
                                        <option value="{%$value%}"{%if $smarty.get.origin_extend.partner == $value%} selected {%/if%}>{%$name%} ({%$value%})</option>
                                    {%/foreach%}
                                </select>
                            </div>
                            <div class="am-u-md-6">
                                <select id="activity" class="activity" name="origin_extend[activity]" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}" placeholder="所有">
                                    <option value="show_all"{%if $smarty.get.origin_extend.activity == 'show_all'%} selected {%/if%}>不区分活动</option>
                                    <option value="-1"{%if $smarty.get.origin_extend.activity == '-1'%} selected {%/if%}>所有</option>
                                    {%foreach $originExtendSelfActivityNameMap as $value => $name%}
                                        <option value="{%$value%}"{%if $smarty.get.origin_extend.activity == $value%} selected {%/if%}>{%$name%} ({%$value%})</option>
                                    {%/foreach%}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="origin_extend_3 am-u-md-6 am-u-end" id="origin_extend_3" hidden>
                        <div class="am-g">
                            <div class="am-u-md-4">
                                <select id="scene_type" class="scene_type" name="origin_extend[sceneType]" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}" placeholder="所有">
                                    <option value="show_all"{%if $smarty.get.origin_extend.sceneType == 'show_all'%} selected {%/if%}>不区分场景</option>
                                    <option value="-1"{%if $smarty.get.origin_extend.sceneType == '-1'%} selected {%/if%}>所有</option>
                                    {%foreach $idleFishSceneTypeNameMap as $value => $name%}
                                        <option value="{%$value%}"{%if $smarty.get.origin_extend.sceneType == $value%} selected {%/if%}>{%$name%} ({%$value%})</option>
                                    {%/foreach%}
                                </select>
                            </div>
                            <div class="am-u-md-4">
                                <input id="channel" name="origin_extend[channel]" type="text" class="am-form-field am-input-sm channel" placeholder="渠道" disabled="disabled" value="{%$smarty.get.origin_extend.channel%}">
                            </div>
                            <div class="am-u-md-4">
                                <input id="sub_channel" name="origin_extend[subChannel]" type="text" class="am-form-field am-input-sm sub_channel" placeholder="子渠道" disabled="disabled" value="{%$smarty.get.origin_extend.subChannel%}">
                            </div>
                        </div>
                    </div>
                </div>
                <br/>
                <div class="am-g">
                    <div class="am-u-md-2 am-u-md-offset-10">
                        <button type="submit" class="am-btn am-btn-sm am-btn-default" id="search_btn">查询</button>
                        <button type="button" class="am-btn am-btn-sm am-btn-default default-form-export-ajax">导出</button>
                        <button type="button" class="am-btn am-btn-sm am-btn-primary" id="add_price_percent_btn">新增/更新</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-g">
        <div class="am-u-sm-12 am-scrollable-horizontal">
            {%if empty($list)%}
                <p class="no-result">没有符合条件的记录！</p>
            {%else%}
                <table class="am-table am-table-bd am-table-striped am-text-nowrap am-table-bordered am-text-xs">
                    <thead>
                    <tr>
                        <th>Id</th>
                        <th>来源</th>
                        <th>来源扩展限制</th>
                        <th>品类</th>
                        <th>品牌</th>
                        <th>型号</th>
                        <th>SKU</th>
                        <th>报价比例</th>
                        <th>状态</th>
                        <th>创建时间</th>
                        <th>修改时间</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {%foreach $list as $item%}
                        <tr>
                            <td>
                                <label class="am-checkbox">
                                    <input type="checkbox" class="batch_id_select" value="{%$item.id%}" data-am-ucheck>{%$item.id%}
                                </label>
                            </td>
                            <td class="{%$item.origin_class%}">{%$item.origin_name%}</td>
                            <td>
                                <strong class="am-text-danger">{%$item.origin_extend_show%}</strong>
                            </td>
                            <td>{%object_get($item,'category.name','所有')%}</td>
                            <td>{%object_get($item,'brand.alias_name','所有')%}</td>
                            <td>{%object_get($item,'model.model_name','所有')%}</td>
                            <td>{%object_get($item,'sku_name','所有')%}</td>
                            <td>
                                <div class="am-input-group price-percent-show" id="price_percent_show_{%$item.id%}">
                                    <input type="number" class="am-form-field am-input-sm" value="{%$item.price_percent%}" readonly/>
                                    <span class="am-input-group-btn">
                                        <button type="button" class="am-btn am-btn-warning am-btn-sm show_edit" data-id="{%$item.id%}">修改</button>
                                    </span>
                                </div>

                                <div class="am-input-group am-hide price-percent-edit" id="price_percent_edit_{%$item.id%}">
                                    <input type="number" class="am-form-field am-input-sm" id="price_percent_{%$item.id%}" value="{%$item.price_percent%}"/>
                                    <span class="am-input-group-btn">
                                        <button type="button" class="am-btn am-btn-danger am-btn-sm edit_percent" data-id="{%$item.id%}">提交</button>
                                    </span>
                                </div>
                            </td>
                            <td>{%$item.flag_name%}</td>
                            <td>{%$item.created_at%}</td>
                            <td>{%$item.updated_at%}</td>
                            <td>
                                <div class="am-btn-group am-btn-group-sm">
                                    {%if $item.flag%}
                                        <button type="button" class="am-btn am-btn-warning change-flag" data-flag="0" data-cid="{%$item.id%}">关闭</button>
                                    {%else%}
                                        <button type="button" class="am-btn am-btn-success change-flag" data-flag="1" data-cid="{%$item.id%}">开启</button>
                                    {%/if%}
                                    <button type="button" class="am-btn am-btn-danger delete" data-cid="{%$item.id%}">删除</button>
                                </div>
                            </td>
                        </tr>
                    {%/foreach%}
                    <tr>
                        <td colspan="12">
                            <div class="am-btn-group am-btn-group-sm">
                                <button type="button" class="am-btn am-btn-success batch-select" data-select="true">全选/取消</button>
                                <button type="button" class="am-btn am-btn-danger batch-delete">批量删除</button>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
                {%$list->render('vendor.pagination.amazeui')|no_escape%}
            {%/if%}
        </div>
    </div>
    <div class="am-modal am-modal-no-btn" tabindex="-1" id="add_price_percent">
        <div class="am-modal-dialog">
            <div class="am-modal-hd">新增/更新报价比例
                <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
            </div>
            <div class="am-modal-bd">
                <form class="am-form" action="/hsmm/pricePercentAdd">
                    <div class="am-g">
                        <div class="am-u-md-3"><label for="origin">订单来源</label></div>
                        <div class="am-u-md-9">
                            <select class="origin" id="origin_add" name="origin" data-am-selected="{btnSize: 'sm', maxHeight: 300, btnWidth: '100%'}">
                                {%foreach $originNameMap as $value => $name%}
                                    <option value="{%$value%}">{%$name%}</option>
                                {%/foreach%}
                            </select>
                        </div>
                    </div>
                    <hr/>
                    <div class="am-g origin_extend_1" hidden>
                        <div class="am-u-md-3"><label for="partner">合作方</label></div>
                        <div class="am-u-md-9">
                            <select id="partner" class="partner" name="origin_extend[partner]" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}" placeholder="所有">
                                <option value="">所有</option>
                                {%foreach $partnerNameMap as $value => $name%}
                                    <option value="{%$value%}">{%$name%} ({%$value%})</option>
                                {%/foreach%}
                            </select>
                        </div>
                        <div class="am-u-md-3"><label for="activity">活动</label></div>
                        <div class="am-u-md-9">
                            <select id="activity" class="activity" name="origin_extend[activity]" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}" placeholder="所有">
                                <option value="">所有</option>
                                {%foreach $originExtendSelfActivityNameMap as $value => $name%}
                                    <option value="{%$value%}">{%$name%} ({%$value%})</option>
                                {%/foreach%}
                            </select>
                        </div>
                    </div>
                    <div class="am-g origin_extend_3" hidden>
                        <div class="am-u-md-3"><label for="scene_type">场景</label></div>
                        <div class="am-u-md-9">
                            <select id="scene_type" class="scene_type" name="origin_extend[sceneType]" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}" placeholder="所有">
                                <option value="">所有</option>
                                {%foreach $idleFishSceneTypeNameMap as $value => $name%}
                                    <option value="{%$value%}">{%$name%} ({%$value%})</option>
                                {%/foreach%}
                            </select>
                        </div>
                        <div class="am-u-md-3"><label for="channel">Channel</label></div>
                        <div class="am-u-md-9">
                            <input id="channel" name="origin_extend[channel]" type="text" class="channel" placeholder="渠道" disabled="disabled">
                        </div>
                        <div class="am-u-md-3"><label for="sub_channel">SubChannel</label></div>
                        <div class="am-u-md-9">
                            <input id="sub_channel" name="origin_extend[subChannel]" type="text" class="sub_channel" placeholder="子渠道" disabled="disabled">
                        </div>
                    </div>
                    <hr/>
                    <div id="model_select" class="am-tabs" data-am-tabs="{noSwipe: 1}">
                        <ul class="am-tabs-nav am-nav am-nav-tabs">
                            <li class="am-active"><a href="#single">普通</a></li>
                            <li><a href="#multiple">批量</a></li>
                        </ul>
                        <div class="am-tabs-bd am-tabs-bd-ofv">
                            <div class="am-tab-panel am-fade am-in am-active" id="single">
                                <div class="am-g">
                                    <div class="am-u-md-3"><label for="category">品类</label></div>
                                    <div class="am-u-md-9"><select id="category" name="category_id" data-am-selected="{btnSize: 'sm', maxHeight: 300, btnWidth: '100%'}">
                                            <option value="-1">所有</option>
                                            {%foreach $categoryNameMap as $value => $name%}
                                                <option value="{%$value%}">{%$name%}</option>
                                            {%/foreach%}
                                        </select>
                                    </div>
                                </div>
                                <div class="am-g">
                                    <div class="am-u-md-3"><label for="brand">品牌</label></div>
                                    <div class="am-u-md-9">
                                        <select id="brand" name="brand_id" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}">
                                            <option value="-1">所有</option>
                                            {%foreach $brandNameMap as $value => $name%}
                                                <option value="{%$value%}">{%$name%}</option>
                                            {%/foreach%}
                                        </select>
                                    </div>
                                </div>
                                <div class="am-g">
                                    <div class="am-u-md-3"><label for="model">型号</label></div>
                                    <div class="am-u-md-9">
                                        <select id="model" name="model_id" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}">
                                            <option value="-1">所有</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="am-g">
                                    <div class="am-u-md-3"><label for="skugroup">SKU</label></div>
                                    <div class="am-u-md-9">
                                        <select id="skugroup" name="skugroup_id" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}">
                                            <option value="-1">所有</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="am-g">
                                    <div class="am-u-md-3"><label for="percent">报价比例</label></div>
                                    <div class="am-u-md-9">
                                        <input id="percent" name="price_percent" type="number" class="" placeholder="报价比例" value="100">
                                    </div>
                                </div>
                            </div>
                            <div class="am-tab-panel am-fade" id="multiple">
                                <label for="multiple_model">格式:<ins>机型Id,skuGroupId,报价比例</ins>(一行一个)</label>
                                <textarea id="multiple_model" name="model_ids" class="" rows="7"></textarea>
                            </div>
                        </div>
                    </div>
                    <hr/>
                    <input id="multiple_add" name="multiple_add" type="hidden" value="0">
                    <button type="submit" class="am-btn am-btn-default default-form-submit-confirm">提交</button>
                </form>
            </div>
        </div>
    </div>
{%/block%}

{%block name="block_js" append%}
    <script type="text/javascript">
        var modelId = '{%$smarty.get.model_id%}';
        var skuGroupId = '{%$smarty.get.skugroup_id%}';
        let ignoreData = ['-1', 'show_all'];
        var exportUrl = '/hsmm/pricePercentExport';

        $(function () {
            $('.origin').on('change', function (e) {
                let $extendDomMap = {
                    '1': [
                        $('.partner'),
                        $('.activity'),
                    ],
                    '2': [],
                    '3': [
                        $('.scene_type'),
                        $('.channel'),
                        $('.sub_channel'),
                    ]
                };
                let index = $(this).val();
                $.each($extendDomMap, function (id, extendDom) {
                    if (index === id) {
                        $('.origin_extend_' + id).prop('hidden', false);
                        $.each(extendDom, function (k, dom) {
                            dom.prop('disabled', false);
                        })
                    } else {
                        $('.origin_extend_' + id).prop('hidden', true);
                        $.each(extendDom, function (k, dom) {
                            dom.prop('disabled', true);
                        })
                    }
                });
            });
            $('#model_select').find('a').on('opened.tabs.amui', function (e) {
                if ($(this).text() === '普通') {
                    $('#multiple_add').val(0);
                } else {
                    $('#multiple_add').val(1);
                }
            });
            $('#model_filter').on('change', function (e) {
                let $categoryId = $('#category_filter').val();
                let $brandId = $('#brand_filter').val();
                let $modelId = $('#model_filter').val();
                let $skuGroup = $('#skugroup_filter');
                getSku($categoryId, $brandId, $modelId, $skuGroup);
            });
            $('#brand_filter').on('change', function (e) {
                let $categoryId = $('#category_filter').val();
                let $brandId = $('#brand_filter').val();
                let $model = $('#model_filter');
                getModel($categoryId, $brandId, $model);
            });
            $('#category_filter').on('change', function (e) {
                let $categoryId = $('#category_filter').val();
                let $brandId = $('#brand_filter').val();
                let $model = $('#model_filter');
                getModel($categoryId, $brandId, $model);
            });
            $('#category').on('change', function (e) {
                let $categoryId = $('#category').val();
                let $brand = $('#brand');
                if ($categoryId === '-1') {
                    $brand.val('-1');
                    $brand.trigger('changed.selected.amui');
                }
                let $brandId = $brand.val();
                let $model = $('#model');
                getModel($categoryId, $brandId, $model);
            });
            $('#brand').on('change', function (e) {
                let $categoryId = $('#category').val();
                let $brandId = $('#brand').val();
                let $model = $('#model');
                if ($brandId === '-1') {
                    $model.val('-1');
                    $model.trigger('changed.selected.amui');
                }
                getModel($categoryId, $brandId, $model);
            });
            $('#model').on('change', function (e) {
                let $categoryId = $('#category').val();
                let $brandId = $('#brand').val();
                let $modelId = $('#model').val();
                let $skuGroup = $('#skugroup');
                if ($modelId === '-1') {
                    $skuGroup.val('-1');
                    $skuGroup.trigger('changed.selected.amui');
                }
                getSku($categoryId, $brandId, $modelId, $skuGroup);
            });
            $('.change-flag').on('click', function (e) {
                let $cid = $(this).data('cid');
                let $flag = $(this).data('flag');
                toConfirm(function () {
                    submitForm('/hsmm/pricePercentChangeFlag', {cid: $cid, flag: $flag});
                });
            });
            $('.delete').on('click', function (e) {
                let $cid = $(this).data('cid');
                toConfirm(function () {
                    submitForm('/hsmm/pricePercentDelete', {cid: $cid});
                });
            });
            $('#add_price_percent_btn').on('click', function () {
                $('#add_price_percent').modal();
                $('#origin_add').trigger('change');
            });
            $('.show_edit').on('click', function () {
                let $id = $(this).data('id');
                $('.price-percent-edit').addClass('am-hide');
                $('.price-percent-show').removeClass('am-hide');
                $('#price_percent_edit_' + $id).removeClass('am-hide');
                $('#price_percent_show_' + $id).addClass('am-hide');
            });
            $('.edit_percent').on('click', function () {
                let $id = $(this).data('id');
                let $pricePercent = $('#price_percent_' + $id).val();
                var $button = $(this);
                toConfirm(function () {
                    disabledSubmitButton($button);
                    var action = '/hsmm/pricePercentEditById';
                    var params = {
                        multiple_edit: 0,
                        id: $id,
                        price_percent: $pricePercent
                    };
                    submitForm(action, params, function () {
                        window.location.reload();
                        $('.price-percent-edit').addClass('am-hide');
                        $('.price-percent-show').removeClass('am-hide');
                    });
                });
            });
            $('.batch-select').on('click', function () {
                let select = $(this).data('select');
                $('.batch_id_select').prop('checked', select);
                $(this).data('select', !select);
            });
            $('.batch-delete').on('click', function () {
                let batchDeleteIds = [];
                $('.batch_id_select:checked').each(function () {
                    batchDeleteIds.push($(this).val());
                });
                return newConfirm('warning', '管理后台', '即将删除以下ID的数据,请确认!!!<br/>' + batchDeleteIds.join(' , '), function () {
                    submitForm('/hsmm/pricePercentBatchDelete', {cids: batchDeleteIds});
                });
            });

            init();
        });

        function init() {
            $('#origin_filter').trigger('change');
            $('#category_filter').trigger('change');
            $('#brand_filter').trigger('change');
            $('#model_filter').trigger('change');
        }

        function getModel($categoryId, $brandId, $model) {
            if ($categoryId !== '0' && $.inArray($brandId, ignoreData) === -1) {
                $.ajax({
                    url: '/hsmm/pricePercentGetModel',
                    data: {
                        category_id: $categoryId,
                        brand_id: $brandId
                    },
                    dataType: 'json',
                    type: 'POST',
                    success: function (res) {
                        if (res.errno === 0) {
                            $model.empty();
                            $model.append($(`<option value="show_all">不区分型号</option><option value="-1">所有</option>`));
                            $.each(res.result, function (value, name) {
                                selectedFlag = value == modelId ? "selected" : "";
                                $model.append($(`<option value="${value}" ${selectedFlag}>${value} - ${name}</option>`));
                            })
                        } else {
                            newAlert('wrong', '管理后台', '操作失败<br/>' + res.errmsg);
                        }
                    },
                    error: function (res) {
                        newAlert('wrong', '管理后台', '请求失败,请重试<br/>' + res.errmsg);
                    }
                });
            }
        }

        function getSku($categoryId, $brandId, $modelId, $skuGroup) {
            if ($categoryId !== '0' && $.inArray($brandId, ignoreData) === -1 && $.inArray($modelId, ignoreData) === -1) {
                $.ajax({
                    url: '/hsmm/pricePercentGetSku',
                    data: {
                        category_id: $categoryId,
                        brand_id: $brandId,
                        model_id: $modelId
                    },
                    dataType: 'json',
                    type: 'POST',
                    success: function (res) {
                        if (res.errno === 0) {
                            $skuGroup.empty();
                            $skuGroup.append($(`<option value="show_all">不区分SKU</option><option value="-1">所有</option>`));
                            $.each(res.result, function (value, name) {
                                selectedFlag = value == skuGroupId ? "selected" : "";
                                $skuGroup.append($(`<option value="${value}" ${selectedFlag}>${value} - ${name}</option>`));
                            })
                        } else {
                            newAlert('wrong', '管理后台', '操作失败<br/>' + res.errmsg);
                        }
                    },
                    error: function (res) {
                        newAlert('wrong', '管理后台', '请求失败,请重试<br/>' + res.errmsg);
                    }
                });
            }
        }
    </script>
{%/block%}