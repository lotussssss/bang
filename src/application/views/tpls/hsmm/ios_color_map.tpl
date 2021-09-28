{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">苹果机型颜色映射</strong> /
            <small>苹果机型颜色映射</small>
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
                    <input type="text" class='am-form-field am-input-sm' name='model_name' id='model_name' value='{%$smarty.get.model_name%}' placeholder="model_name搜索"/>
                </div>

                <div class="am-form-group am-u-sm-2">
                    <input type="text" class='am-form-field am-input-sm' name='color_str' id='color_str' value='{%$smarty.get.color_str%}' placeholder="color_str搜索"/>
                </div>
                <div class="am-form-group am-u-sm-2">
                    <button id="searchBtn" type="submit" class="am-btn am-btn-primary">搜索</button>
                </div>

                <div class="am-form-group am-u-sm-4">
                    <button data-am-modal="{target: '#modal-model-add', closeViaDimmer: 0}" type="button" class="am-btn am-btn-success">添加机型颜色映射</button>
                </div>
            </form>
        </div>
    </div>
    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-g">
        <div class="am-u-sm-12 am-scrollable-horizontal">
            {%if $color_map%}
                <table class="am-table am-table-bd am-table-striped am-text-nowrap">
                    <thead>
                    <tr>
                        <th>model_name</th>
                        <th>color_str</th>
                        <th>color_id</th>
                        <th>color_name</th>
                        <th>品类名称</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {%foreach $color_map as $key => $val%}
                        <tr>
                            <td>{%$val->model_name%}</td>
                            <td>{%$val->color_str%}</td>
                            <td>{%$val->color_id%}</td>
                            <td>
                                {%if $val->category_id == 1%}
                                    {%$color_attr_list[$val->color_id]%}
                                {%elseif $val->category_id == 2%}
                                    {%$pad_color_attr_list[$val->color_id]%}
                                {%else%}
                                    --
                                {%/if%}
                            </td>
                            <td>{%$category_map[$val->category_id]%}</td>
                            <td>
                                <button data-color_map_id="{%$val->id%}" type="button" class="am-btn am-btn-danger delete_color_map">删除</button>
                            </td>
                        </tr>
                    {%/foreach%}
                    </tbody>
                </table>
                {%$color_map->render('vendor.pagination.amazeui')|no_escape%}
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
            <form class="am-form am-form-horizontal" method="post" action="/hsmm/doAddIosColorMap/">
                <div class="am-modal-hd">
                    添加颜色映射<a href="javascript: void(0)" class="am-close am-close-spin" data-am-modal-close>&times;</a>
                    关于品类Pad会进行拆分，具体咨询国斌，未通知之前都用手机品类
                </div>
                <div class="am-modal-bd">
                    <div class="am-form-group am-form-error">
                        <label class="am-u-sm-3 am-form-label" for="model_name">机型名称</label>
                        <div class="am-u-sm-9">
                            <input name="model_name" placeholder="机型名称" type="input" class="am-form-field"/>
                        </div>
                    </div>

                    <div class="am-form-group am-form-error">
                        <label class="am-u-sm-3 am-form-label" for="color_str">颜色字符</label>
                        <div class="am-u-sm-9">
                            <input name="color_str" placeholder="COLOR_STR" type="input" class="am-form-field"/>
                        </div>
                    </div>

                    <div class="am-form-group am-form-error">
                        <label class="am-u-sm-3 am-form-label" for="color_id">选择品类</label>
                        <div class="am-u-sm-9">
                            <select name="category_id" class="category_id" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}">
                                <option value="0" selected>选择品类</option>
                                {%foreach $valid_category_ids as $categoryId%}
                                    <option value="{%$categoryId%}">{%$category_map[$categoryId]%}</option>
                                {%/foreach%}
                            </select>
                        </div>
                    </div>

                    <div class="am-form-group am-form-error">
                        <label class="am-u-sm-3 am-form-label" for="color_id">颜色ID</label>
                        <div class="am-u-sm-9">
                            <select name="color_id" class="color_id" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}">
                                <option value="0" selected>选择颜色ID</option>

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

        window.mobile_color_list = {%$color_attr_list|json_encode|no_escape%};
        window.pad_color_list = {%$pad_color_attr_list|json_encode|no_escape%};

        $('.delete_color_map').on('click', function () {

            var color_map_id = $(this).data("color_map_id");

            delMap(color_map_id)
        });

        $('.category_id').on('change', function () {
            let categoryId = $(this).val();

            $('.color_id').html('');
            $('.color_id').append('<option value="0">选择颜色ID</option>')

            //手机
            if(categoryId == 1) {
                $.each(window.mobile_color_list, function(id, name) {
                    $('.color_id').append(`<option value="${id}">${name}</option>`)
                });
            }

            //Pad
            if(categoryId == 2){
                $.each(window.pad_color_list, function(id, name) {
                    $('.color_id').append(`<option value="${id}">${name}</option>`)
                });
            }

            $('.color_id').trigger('changed.selected.amui');
        });

        function delMap(color_map_id) {

            $.ajax({
                url: '/hsmm/doDelIosColorMap/',
                async: true,
                data: {
                    color_map_id: +color_map_id,
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
                            newAlert('success', 'IOS机型颜色映射管理', '操作成功<br/>' + res.errmsg, function () {
                                window.location.reload();
                            });
                        } else {
                            newAlert('wrong', 'IOS机型颜色映射管理', '操作失败<br/>' + res.errmsg);
                        }
                    },
                    error: function (res) {
                        newAlert('wrong', 'IOS机型颜色映射管理', '请求失败,请重试');
                    }
                });
            });
        });


    </script>
{%/block%}