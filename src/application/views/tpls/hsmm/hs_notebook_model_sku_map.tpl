{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">{%$attributeName%}属性映射</strong>
            <small></small>
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
                    <input type="text" class='am-form-field am-input-sm' name='attribute_value_map_name' id='attribute_value_map_name' value='{%$smarty.get.attribute_value_map_name%}' placeholder="映射属性搜索"/>
                </div>
                <div class="am-form-group am-u-sm-2">
                    <input type="text" class='am-form-field am-input-sm' name='attribute_value_id' id='attribute_value_id' value='{%$smarty.get.attribute_value_id%}' placeholder="属性ID搜索"/>
                </div>
                <div class="am-form-group am-u-sm-2">
                    <button id="searchBtn" type="submit" class="am-btn am-btn-primary">搜索</button>
                </div>
                <div class="am-form-group am-u-sm-2">
                    <button data-am-modal="{target: '#modal-model-add', closeViaDimmer: 0}" type="button" class="am-btn am-btn-success">添加</button>
                </div>
                <div class="am-form-group am-u-sm-4">
                    <input type="hidden" name='attribute_id' id='attribute_id' value='{%$smarty.get.attribute_id%}'/>
                </div>
            </form>
        </div>

    </div>
    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-g">
        <div class="am-u-sm-12 am-scrollable-horizontal">
            {%if $model_attr_value_name_map%}
                <table class="am-table am-table-bd am-table-striped am-text-nowrap">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>属性值</th>
                        <th>映射属性值</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {%foreach $model_attr_value_name_map as $key => $val%}
                        <tr>
                            <td>{%$val->attribute_value_id%}</td>
                            <td>{%$val->AttributeValue->attribute_val%}</td>
                            <td>{%str_replace(' ','&nbsp;',$val->attribute_value_map_name)%}</td>
                            <td>
                                <button data-model_map_id="{%$val->id%}" type="button" class="am-btn am-btn-success delete_model_map">删除</button>
                            </td>
                        </tr>
                    {%/foreach%}
                    </tbody>
                </table>
                {%$model_attr_value_name_map->render('vendor.pagination.amazeui')|no_escape%}
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
            <form method="post" action="/hsmm/addNotebookModelAttrMap/">
                <div class="am-modal-hd">添加{%$attributeName%}</div>
                <div class="am-modal-bd">
                    <input name="attribute_id" class="am-modal-prompt-input" value="{%$smarty.get.attribute_id%}" type="hidden" />
                    <input name="attribute_value_id" placeholder="属性Id" type="input" class="am-modal-prompt-input"/>
                    <input name="attribute_val" placeholder="映射属性值" type="input" class="am-modal-prompt-input"/>
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

        $('.delete_model_map').on('click', function () {

            var model_map_id = $(this).data("model_map_id");

            delModelMap(model_map_id)
        });

        function delModelMap(model_map_id) {
            $.ajax({
                url: '/hsmm/doDelModelAttr/',
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
                            newAlert('wrong', '机型映射管理', '操作失败<br/>' + res.errmsg, function () {
                                window.location.reload();
                            });
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