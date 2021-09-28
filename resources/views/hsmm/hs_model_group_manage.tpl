{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">回收机型</strong> /
            <small>机型组管理</small>
        </div>
    </div>

    <div class="am-g">
        <div class="am-u-md-6 am-padding-vertical">
            <form class="am-g" action="/hsmm/hsmodelgroupmanage" method="get">
                <div class="am-u-md-5">
                    <select name="brand_id" placeholder="选择品牌" data-am-selected="{btnSize: 'sm',btnStyle:'default',maxHeight: 500,searchBox: 1}">
                        <option selected value="0">选择品牌</option>
                        {%foreach $huishou_brand as $k => $v%}
                            {%if $v.id==($smarty.get.brand_id|default:10)%}
                                <option value="{%$v.brand_id%}" selected>{%$v.name%}</option>
                            {%else%}
                                <option value="{%$v.brand_id%}">{%$v.name%}</option>
                            {%/if%}
                        {%/foreach%}
                    </select>
                </div>
                <div class="am-u-md-5">
                    <select name="category_id" placeholder="选择类别" data-am-selected="{btnSize: 'sm',btnStyle:'default'}">
                        <option selected value="0">选择类别</option>
                        {%foreach $all_category as $k => $v%}
                            {%if $v.id==($smarty.get.category_id|default:1)%}
                                <option value="{%$v.id%}" selected>{%$v.name%}</option>
                            {%else%}
                                <option value="{%$v.id%}">{%$v.name%}</option>
                            {%/if%}
                        {%/foreach%}
                    </select>
                </div>
                <div class="am-u-md-2">
                    <button type="submit" class="am-btn am-btn-default" id="search_btn">查询</button>
                </div>
            </form>
        </div>
        <div class="am-u-md-6 am-padding-vertical">
        </div>
    </div>
    <div class="am-panel am-panel-default">
        <div class="am-panel-bd">当前选择: 品牌
            {%foreach $huishou_brand as $k => $v%}
                {%if $v.id==($smarty.get.brand_id|default:10) %}
                    <strong>{%$v.name%}</strong>
                {%/if%}
            {%/foreach%}
            类别
            {%foreach $all_category as $k => $v%}
               {%if $v.id==($smarty.get.category_id|default:1)%}
                    <strong>{%$v.name%}</strong>
                {%/if%}
            {%/foreach%}
        </div>
    </div>
    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-g">
        <div class="am-u-sm-12 am-scrollable-horizontal">
            {%if $all_model_group%}
                <table class="am-table am-table-bd am-table-striped am-text-nowrap">
                    <thead>
                    <tr>
                        <th>机型组ID</th>
                        <th>机型组名</th>
                        <th>ICON图</th>
                        <th>品牌排序值</th>
                        <th>回收状态</th>
                        <th>操作</th>

                    </tr>
                    </thead>
                    <tbody>
                    {%foreach $all_model_group as $key => $val%}
                        <tr>

                            <td>{%$val['id']%}</td>
                            <td>{%$val['group_name']%}</td>
                            <td><img src="{%$val["hs_model_group_detail"]['icon_url']%}" height="50px"></td>
                            <td>{%$val["hs_model_group_detail"]['brand_hot']%}</td>
                            <td>{%if $val["hs_model_group_detail"]['hs_status']==10 %}
                                    启用
                                {%else%}
                                    禁用
                                {%/if%}
                            </td>
                            <td>
                                <button data-model_group_id="{%$val['id']%}" data-icon-url="{%$val["hs_model_group_detail"]['icon_url']%}" data-icon="{%$val["hs_model_group_detail"]['icon']%}" data-brand_hot="{%$val["hs_model_group_detail"]['brand_hot']%}" data-status="{%$val["hs_model_group_detail"]['hs_status']%}" data-am-modal="{target: '#modal-brand-edit', closeViaDimmer: 0}" type="button" class="am-btn am-btn-success edit_brand">编辑</button>
                            </td>

                        </tr>
                    {%/foreach%}
                    </tbody>
                </table>
            {%else%}
                <div class="am-alert">
                    没有可显示数据
                </div>
            {%/if%}

        </div>
    </div>
    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-modal am-modal-prompt" tabindex="-1" id="modal-brand-edit">
        <div class="am-modal-dialog">
            <form method="post" action="/hsmm/doEditModelGroup/">
                <div class="am-modal-hd">编辑品牌信息</div>
                <div class="am-modal-bd">
                    <div class="am-modal-actions-header am-fl" style="height: 100px;line-height: 100px;text-align: center;margin-left:43px;">
                        <a href="javascript:;" class="add-head-imgs" style="padding-left: 24px;color: #666;">立即上传
                            {%*<span id="swfu-placeholder"><!–swfupload文件选择按钮占位符，执行下面的js后，这里将被替换成swfupload上传按钮–></span>*%}</a>
                        {%*<input id="swfu_btn" type="button" style="display: none" onclick="swfu.startUpload();" value="点我上传更新图片" />*%}
                        <span class="am-no-img" id="no-img-sp"></span>
                    </div>
                    <input id="edit_icon" name="icon" placeholder="编辑icon" type="input" class="am-modal-prompt-input"/>
                    <input id="edit_hot" name="brand_hot" placeholder="编辑排序值" type="input" class="am-modal-prompt-input"/>


                    <div class="am-form-group">

                        <label class="am-radio-inline">
                            <input type="radio" name="hs_status" value="10" id="hs_status_on" data-am-ucheck> 启用
                        </label>
                        <label class="am-radio-inline">
                            <input type="radio" name="hs_status" value="20" id="hs_status_off" data-am-ucheck> 禁用
                        </label>
                    </div>


                </div>
                <div class="am-modal-footer">
                    <input type="hidden" name="model_group_id" id="edit_model_group_id" value=""/>
                    <span class="am-modal-btn" data-am-modal-cancel>取消</span>
                    <span class="am-modal-btn from-submit" data-am-modal-confirm>提交</span>
                </div>
            </form>
        </div>
    </div>


{%/block%}

{%block name="block_js" append%}
    <script type="text/javascript">
        $(function () {
            // 初始化图片上传
            initUploadImage('.add-head-imgs', {
                onBeforeUpload: function () {
                    $('.am-no-img').html('<img src="https://p.ssl.qhimg.com/t012736d21e3607dab3.gif">')
                },
                onUploadSuccess: function (id, data) {
                    data = data || {
                        errno: 999
                    }
                    if (data['errno'] == 0) {
                        $('#edit_icon').val(data['picsrc_name'])
                        $('.am-no-img').html('<img style="width: 80px;height: 80px;" src="' + data['picsrc'] + '">')
                    } else {
                        alert('上传失败，请重新尝试')
                    }
                }
            })
            // 编辑
            $(".edit_brand").on('click', function () {

                var model_group_id = $(this).data("model_group_id");
                var icon = $(this).data("icon");
                var brand_hot = $(this).data("brand_hot");

                var status = $(this).data("status");
                $("#no-img-sp").html("<img src="+$(this).data("icon-url")+" width='100%' height='100%'>");
                $("#edit_icon").val(icon);
                $("#edit_hot").val(brand_hot);
                $("#edit_model_group_id").val( model_group_id);
                if (status == 10) {
                    $("#hs_status_on").uCheck('check');
                    $("#hs_status_off").uCheck('uncheck');
                } else {
                    $("#hs_status_off").uCheck('check');
                    $("#hs_status_on").uCheck('uncheck');
                }

            });

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
                                newAlert('success', '', '操作成功'+ res.errmsg, function () {
                                    window.location.reload();
                                });
                            } else {
                                newAlert('wrong', '', '操作失败<br/>' + res.errmsg);
                            }
                        },
                        error: function (res) {
                            newAlert('wrong', '', '请求失败,请重试');
                        }
                    });
                });
            });

            function toConfirm(onConfirmCallback) {
                return newConfirm('warning', '', '是否进行操作 ?', onConfirmCallback);
            }
        })
    </script>
{%/block%}
