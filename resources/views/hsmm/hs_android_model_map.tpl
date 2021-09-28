{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">安卓机型映射</strong> /
            <small>安卓机型映射</small>
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
                    <input type="text" class='am-form-field am-input-sm' name='model' id='model' value='{%$smarty.get.model%}' placeholder="model_name搜索"/>
                </div>

                <div class="am-form-group am-u-sm-2">
                    <input type="text" class='am-form-field am-input-sm' name='hs_model_id' id='hs_model_id' value='{%$smarty.get.hs_model_id%}' placeholder="机型id搜索"/>
                </div>
                <div class="am-form-group am-u-sm-2">
                    <select name="HsModel@hs_status" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}">
                        <option value="0" selected>机型是否已经下架</option>
                        <option value="10" {%if $smarty.get['HsModel@hs_status'] == '10' %}selected{%/if%}>上架</option>
                        <option value="20" {%if $smarty.get['HsModel@hs_status'] == '20' %}selected{%/if%}>下架</option>
                    </select>
                </div>
                <div class="am-form-group am-u-sm-2">
                    <button id="searchBtn" type="submit" class="am-btn am-btn-primary">搜索</button>
                </div>

                <div class="am-form-group am-u-sm-4">
                    <input type="button" class="am-btn am-btn-danger am-btn-sm default-form-export-ajax" value="下载Android全量数据"/>
                    <button data-am-modal="{target: '#modal-model-add', closeViaDimmer: 0}" type="button" class="am-btn am-btn-success">添加机型映射</button>
                </div>
            </form>
        </div>

    </div>
    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-g">
        <div class="am-u-sm-12 am-scrollable-horizontal">
            {%if $model_map%}
                <table class="am-table am-table-bd am-table-striped am-text-nowrap">
                    <thead>
                    <tr>
                        <th>brand_name</th>
                        <th>marketing_name</th>
                        <th>model_name</th>
                        <th>model_id</th>
                        <th>品类名称</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {%foreach $model_map as $key => $val%}
                        <tr {%if $val->HsModel->hs_status == 20%}class="am-danger"{%/if%}>
                            <td>{%$val->brand_name%}</td>
                            <td>{%$val->marketing_name%}</td>
                            <td>{%$val->model%}</td>
                            <td>{%$val->hs_model_id%}</td>
                            <td>{%$category_map[$val->category_id]%}</td>
                            <td>
                                <button data-model_map_id="{%$val->id%}" type="button" class="am-btn am-btn-success delete_model_map">删除</button>
                            </td>
                        </tr>
                    {%/foreach%}
                    </tbody>
                </table>
                {%$model_map->render('vendor.pagination.amazeui')|no_escape%}
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
            <form method="post" action="/hsmm/doAddAndroidModelMap/">
                <div class="am-modal-hd">添加机型</div>
                <div class="am-modal-bd">

                    <input name="brand_name" placeholder="BRAND_NAME" type="input" class="am-modal-prompt-input"/>
                    <input name="marketing_name" placeholder="MARKETING_NAME" type="input" class="am-modal-prompt-input"/>
                    <input name="model_name" placeholder="MODEL_NAME" type="input" class="am-modal-prompt-input"/>
                    <input name="model_id" placeholder="同城帮机型ID" type="input" class="am-modal-prompt-input"/>

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
        var exportUrl = '/hsmm/downloadModelMap?osType=Android';

        $('.delete_model_map').on('click', function () {

            var model_map_id = $(this).data("model_map_id");

            delModelMap(model_map_id)
        });

        function delModelMap(model_map_id) {
            $.ajax({
                url: '/hsmm/doDelModelMap/',
                async: true,
                data: {
                    model_map_id: +model_map_id,
                    os_type: 'Android',
                },
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (!res['errno']) {
                        newAlert('success', '处理成功', '删除成功');
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
                            newAlert('success', '机型映射管理', '操作成功<br/>' + res.errmsg, function () {
                                window.location.reload();
                            });
                        } else {
                            newAlert('wrong', '机型映射管理', '操作失败<br/>' + res.errmsg);
                        }
                    },
                    error: function (res) {
                        newAlert('wrong', '机型映射管理', '请求失败,请重试');
                    }
                });
            });
        });


    </script>
{%/block%}