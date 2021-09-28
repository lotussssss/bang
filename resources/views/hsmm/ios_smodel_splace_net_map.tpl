{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">苹果机型销售地与网络制式映射</strong> /
            <small>苹果机型销售地与网络制式映射</small>
        </div>
    </div>
    <div class="am-g">
        <div class="am-u-md-12">
            <div class="am-g">

            </div>

        </div>

    </div>
    <div class="am-panel am-panel-default">
        <div class="am-panel-bd">
            <form class="am-form am-form-horizontal am-padding-0 am-cf" role="form">
                <div class="am-form-group am-u-sm-2">
                    <input type="text" class='am-form-field am-input-sm' name='supervision_model' id='supervision_model' value='{%$smarty.get.supervision_model%}' placeholder="监管型号搜索"/>
                </div>

                <div class="am-form-group am-u-sm-2">
                    <input type="text" class='am-form-field am-input-sm' name='sale_place' id='sale_place' value='{%$smarty.get.sale_place%}' placeholder="销售地搜索"/>
                </div>
                <div class="am-form-group am-u-sm-2">
                    <button id="searchBtn" type="submit" class="am-btn am-btn-primary">搜索</button>
                </div>

                <div class="am-form-group am-u-sm-4">
                    <button data-am-modal="{target: '#modal-model-add', closeViaDimmer: 0}" type="button" class="am-btn am-btn-success">添加苹果机型销售地与网络制式映射</button>
                </div>
            </form>
        </div>
    </div>
    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-g">
        <div class="am-u-sm-12 am-scrollable-horizontal">
            {%if $net_map%}
                <table class="am-table am-table-bd am-table-striped am-text-nowrap">
                    <thead>
                    <tr>
                        <th>监管型号</th>
                        <th>销售地</th>
                        <th>网络制式对应品类</th>
                        <th>网络制式评估项id</th>
                        <th>网络制式评估项</th>
                    </tr>
                    </thead>
                    <tbody>
                    {%foreach $net_map as $key => $val%}
                        <tr>
                            <td>{%$val->supervision_model%}</td>
                            <td>{%$val->sale_place%}</td>
                            <td>
                                {%if $network_list[$val->network_id]['group_id'] == 70%}
                                    手机
                                {%elseif $network_list[$val->network_id]['group_id'] == 77%}
                                    Pad
                                {%else%}
                                    --
                                {%/if%}
                            </td>
                            <td>{%$val->network_id%}</td>
                            <td>{%$network_list[$val->network_id]['option_name']%}</td>
                            <td>
                                <button data-map_id="{%$val->id%}" type="button" class="am-btn am-btn-danger delete_map">删除</button>
                            </td>
                        </tr>
                    {%/foreach%}
                    </tbody>
                </table>
                {%$net_map->render('vendor.pagination.amazeui')|no_escape%}
            {%else%}
                <div class="am-alert">
                    没有可显示数据
                </div>
            {%/if%}

        </div>
    </div>
    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-modal am-modal-prompt" tabindex="-1" id="modal-model-add">
        <div class="am-modal-dialog">
            <form class="am-form am-form-horizontal" method="post" action="/hsmm/doAddIosSmodelSplaceNetMap/">
                <div class="am-modal-hd">
                    添加苹果机型销售地与网络制式映射<br/>
                    请确认好其应该映射"Pad"品类还是手机品类（与国斌沟通明确）
                    <a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
                </div>

                <div class="am-modal-bd">
                    <div class="am-form-group am-form-error">
                        <label class="am-u-sm-3 am-form-label" for="supervision_model">监管型号</label>
                        <div class="am-u-sm-9">
                            <input name="supervision_model" id="supervision_model" placeholder="监管型号" type="input" class="am-form-field"/>
                        </div>
                    </div>

                    <div class="am-form-group am-form-error">
                        <label class="am-u-sm-3 am-form-label" for="sale_place">销售地</label>
                        <div class="am-u-sm-9">
                            <input name="sale_place" id="sale_place" placeholder="销售地" type="input" class="am-form-field"/>
                        </div>
                    </div>

                    <div class="am-form-group am-form-error">
                        <label class="am-u-sm-3 am-form-label" for="color_id">网络制式ID</label>
                        <div class="am-u-sm-9">
                            <select name="network_id" id="color_id" class="network_id" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}">
                                <option value="0" selected>选择网络制式ID</option>
                                {%foreach $network_list as $netId=>$netObj%}
                                    {%$groupName = ''%}
                                    {%if $netObj['group_id'] == 70 %}
                                        {%$groupName = '手机'%}
                                    {%elseif $netObj['group_id'] == 77 %}
                                        {%$groupName = 'Pad'%}
                                    {%/if%}
                                    {%if $netObj['show_status'] == 10%}
                                        <option value="{%$netId%}">品类：{%$groupName%} - {%$netObj['option_name']%}</option>
                                    {%/if%}
                                {%/foreach%}
                            </select>
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
{%/block%}

{%block name="block_js" append%}
    <script type="text/javascript">
        $('.delete_map').on('click', function () {

            var map_id = $(this).data("map_id");

            delMap(map_id)
        });

        function delMap(map_id) {
            $.ajax({
                url: '/hsmm/doDelIosSmodelSplaceNetMap/',
                async: true,
                data: {
                    map_id: + map_id,
                },
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (!res['errno']) {
                        newAlert('success', '处理成功', '删除成功');
                        window.location.reload()
                    } else {
                        newAlert('wrong', '删除失败', '请求失败,请重试');
                    }
                },
                error: function (res) {
                    newAlert('wrong', '删除失败', '请求失败,请重试');
                }
            });
        }


        // 表单提交
        $('.from-submit').on('click', function (e) {
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
                            newAlert('success', '苹果机型销售地与网络制式映射管理', '操作成功<br/>' + res.errmsg, function () {
                                window.location.reload();
                            });
                        } else {
                            newAlert('wrong', '苹果机型销售地与网络制式映射管理', '操作失败<br/>' + res.errmsg);
                        }
                    },
                    error: function (res) {
                        newAlert('wrong', '苹果机型销售地与网络制式映射管理', '请求失败,请重试');
                    }
                });
            });
        });


    </script>
{%/block%}