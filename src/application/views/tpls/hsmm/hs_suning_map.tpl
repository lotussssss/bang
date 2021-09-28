{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">苏宁机型管理</strong> /
            <small>苏宁机型管理</small>
        </div>
    </div>
    <div class="am-g">
        <div class="am-u-md-12">
            <div class="am-g">

            </div>

        </div>

    </div>
    <div class="am-panel am-panel-default">
        <div class="am-panel-bd">当前选择: 回收机型管理
            <strong id="brand_name"></strong>
            苏宁机型管理
            <strong id="category_name"></strong>
        </div>
        <form method="get">
            <div class="am-panel-bd">
                <div class="am-g">
                    <div class="am-u-sm-3">
                        <button data-am-modal="{target: '#modal-model-add', closeViaDimmer: 0}" type="button" class="am-btn am-btn-success">添加机型映射</button>
                    </div>
                    <div class="am-u-sm-3">
                        <input type="text" name="partner_model_id" value='{%$smarty.get.partner_model_id%}' placeholder="合作方机型ID"/>
                    </div>
                    <div class="am-u-sm-3">
                        <input type="text" name="model_id" value='{%$smarty.get.model_id%}' placeholder="同城帮机型ID"/>
                    </div>
                    <div class="am-u-sm-3">
                        <div class="am-g">
                            <div class="am-u-sm-6">
                                <select name="hsModel@hs_status" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}">
                                    {%foreach $huishouStatusArr as $statusValue => $statusName%}
                                        <option {%if $smarty.get['hsModel@hs_status'] == $statusValue%}selected{%/if%} value="{%$statusValue%}">{%$statusName%}</option>
                                    {%/foreach%}
                                </select>
                            </div>
                            <div class="am-u-sm-6">
                                <input type="submit" class="am-btn am-btn-default am-btn-sm" value="查询">
                            </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-g">
        <div class="am-u-sm-12 am-scrollable-horizontal">
            {%if $list%}
                <table class="am-table am-table-bd am-table-striped am-text-nowrap">
                    <thead>
                    <tr>
                        <th>合作方机型ID</th>
                        <th>同城帮机型ID</th>
                        <th>同城帮机型名称</th>
                        <th>同城帮机型回收状态</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {%foreach $list as $val%}
                        <tr>
                            <td>{%$val->partner_model_id%}</td>
                            <td>{%$val->model_id%}</td>
                            <td>{%$val->hsModel->Model->model_name%}</td>
                            <td>
                                <a href="/hsmm/hsmodelmanage?brand_id={%$val->hsModel->brand_id%}&category_id={%$val->hsModel->Model->category_id%}&model_group_id={%$val->hsModel->model_group_id%}" target="_blank">{%$huishouStatusArr[$val->hsModel->hs_status]%}</a>
                            </td>
                            <td>
                                <button data-model_map_id="{%$val->id%}" type="button" class="am-btn am-btn-success delete_model_map">删除</button>
                            </td>
                        </tr>
                    {%/foreach%}
                    </tbody>
                </table>
                {%$list->render('vendor.pagination.amazeui')|no_escape%}
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
            <form method="post" action="/hsmm/suningManageHandle/">
                <div class="am-modal-hd">添加机型</div>
                <div class="am-modal-bd">

                    <input name="partner_model_id" id="partner_model_id" placeholder="合作方机型ID" type="input" class="am-modal-prompt-input"/>
                    <input name="model_id" id="model_id" placeholder="同城帮机型ID" type="input" class="am-modal-prompt-input"/>

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

        $('#show_danger_list').on('click', function () {
            var url = '/hsmm/appModelMapList?filter_danger=1';
            location.href = url;
        });

        $('#show_all_list').on('click', function () {
            var url = '/hsmm/appModelMapList';
            location.href = url;
        });

        $('.delete_model_map').on('click', function () {
            var model_map_id = $(this).data("model_map_id");

            delModelMap(model_map_id)
        });

        function delModelMap(model_map_id) {
            $.ajax({
                url: '/hsmm/doDelsuningMan/',
                async: true,
                data: {
                    model_map_id: +model_map_id,
                },
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (!res['errno']) {
                        newAlert('success', '处理成功', '删除成功', function () {
                            window.location.reload();
                        });
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

                if ($('#partner_model_id').val() == '' || $('#model_id').val() == '') {
                    newAlert('wrong', '苏宁机型管理', '缺少参数');
                    return false;
                }

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
                            newAlert('success', '苏宁机型管理', '操作成功<br/>' + res.errmsg, function () {
                                window.location.reload();
                            });
                        } else {
                            newAlert('wrong', '苏宁机型管理', '操作失败<br/>' + res.errmsg);
                        }
                    },
                    error: function (res) {
                        newAlert('wrong', '苏宁机型管理', '请求失败,请重试');
                    }
                });
            });
        });


    </script>
{%/block%}