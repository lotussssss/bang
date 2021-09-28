{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">回收机型</strong> /
            <small>型号管理</small>
        </div>
    </div>
    <div class="am-g">
        <div class="am-u-md-7 am-padding-vertical">
            <form class="am-g" action="/hsmm/hsmodelmanage" method="get">
                <div class="am-u-md-10">
                    <div class="am-u-md-4">
                        <select name="brand_id" id="select_brand_id" placeholder="选择品牌" data-am-selected="{btnSize: 'sm',btnStyle:'default',maxHeight: 300,searchBox: 1}">
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
                    <div class="am-u-md-4">
                        <select name="category_id" id="select_category_id" placeholder="选择类别" data-am-selected="{btnSize: 'sm',btnStyle:'default'}">
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
                    <div class="am-u-md-4">
                        <select name="model_group_id" id="select_model_group_id" placeholder="选择机型组" data-am-selected="{btnSize: 'sm',btnStyle:'default',maxHeight: 300,searchBox: 1}">
                            <option selected value="0">选择机型组</option>
                        </select>
                    </div>
                </div>
                <div class="am-u-md-2">
                    <button type="submit" class="am-btn am-btn-default" id="search_btn">查询</button>
                </div>
            </form>
        </div>
        <div class="am-u-md-5 am-padding-vertical">
            <button type="submit" class="am-btn am-btn-default am-margin-left" id="add_model_group_btn" data-am-modal="{target: '#modal-model-batch-capacity-add', closeViaDimmer: 0}">容量等级修改</button>
            <button type="submit" class="am-btn am-btn-default am-margin-left" id="add_model_group_btn" data-am-modal="{target: '#modal-model-batch-price-add', closeViaDimmer: 0}">电脑基准价修改</button>
            <button type="submit" class="am-btn am-btn-default am-margin-left" id="add_model_group_btn" data-am-modal="{target: '#modal-model-batch-level-price-add', closeViaDimmer: 0}">等级价格修改</button>
        </div>
    </div>
    <div class="am-panel am-panel-default">
        <div class="am-panel-bd">当前选择: 品牌
            <strong id="brand_name"></strong>
            类别
            <strong id="category_name"></strong>
            机型组
            <strong id="model_group_name"></strong>
        </div>
        <div class="am-panel-bd">
            <button data-am-modal="{target: '#modal-model-add', closeViaDimmer: 0}" type="button" class="am-btn am-btn-success">添加机型</button>
        </div>
    </div>
    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-g">
        <div class="am-u-sm-12 am-scrollable-horizontal">
            {%if $bang_models%}
                <table class="am-table am-table-bd am-table-striped am-text-nowrap">
                    <thead>
                    <tr>
                        <th>机型ID</th>
                        <th>机型名</th>
                        <th>ICON图</th>
                        <th>品牌排序值</th>
                        <th>回收状态</th>
                        <th>操作</th>
                        <th>评估组设置</th>
                        <th>SKU管理</th>

                    </tr>
                    </thead>
                    <tbody>
                    {%foreach $bang_models as $key => $val%}
                        <tr>

                            <td>{%$val['id']%}</td>
                            <td>{%$val['model_name']%}</td>
                            <td><img src="{%$val["hs_model_detail"]['icon_url']%}" height="50px"></td>
                            <td>{%$val["hs_model_detail"]['hot']%}</td>
                            <td>{%if $val["hs_model_detail"]['hs_status']==10 %}
                                    启用
                                {%else%}
                                    禁用
                                {%/if%}
                            </td>
                            <td>
                                <button data-model_id="{%$val['id']%}" data-icon-url="{%$val["hs_model_detail"]['icon_url']%}" data-icon="{%$val["hs_model_detail"]['icon']%}" data-hot="{%$val["hs_model_detail"]['hot']%}" data-status="{%$val["hs_model_detail"]['hs_status']%}"
                                        data-am-modal="{target: '#modal-model-edit', closeViaDimmer: 0}" type="button" class="am-btn am-btn-success edit_model">编辑
                                </button>
                            </td>
                            <td>
                                {%if !empty($val["hs_model_detail"])%}
                                    <button data-model_id="{%$val['id']%}" type="button" class="am-btn am-btn-success edit_pinggu_group">设置评估组</button>
                                {%/if%}
                            </td>
                            <td>
                                {%if !empty($val["hs_model_detail"])%}
                                    <a href="/hsmm/hsSkuManage?model_id={%$val['id']%}" target="_blank" class="am-btn am-btn-success">SKU编辑</a>
                                {%/if%}
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
    <div class="am-modal am-modal-prompt" tabindex="-1" id="modal-model-edit">
        <div class="am-modal-dialog">
            <form method="post" action="/hsmm/doEditModel/">
                <div class="am-modal-hd">编辑品牌信息</div>
                <div class="am-modal-bd">
                    <div class="am-modal-actions-header am-fl" style="height: 100px;line-height: 100px;text-align: center;margin-left:43px;">
                        <a href="javascript:;" class="add-head-imgs" style="padding-left: 24px;color: #666;">立即上传
                            {%*<span id="swfu-placeholder"><!–swfupload文件选择按钮占位符，执行下面的js后，这里将被替换成swfupload上传按钮–></span>*%}</a>
                        {%*<input id="swfu_btn" type="button" style="display: none" onclick="swfu.startUpload();" value="点我上传更新图片"/>*%}
                        <span class="am-no-img" id="no-img-sp"></span>
                    </div>
                    <input id="edit_icon" name="icon" placeholder="编辑icon" type="input" class="am-modal-prompt-input"/>
                    <input id="edit_hot" name="hot" placeholder="编辑排序值" type="input" class="am-modal-prompt-input"/>
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
                    <input type="hidden" name="model_id" id="edit_model_id" value=""/>
                    <span class="am-modal-btn" data-am-modal-cancel>取消</span>
                    <span class="am-modal-btn from-submit" data-am-modal-confirm>提交</span>
                </div>
            </form>
        </div>
    </div>
    <div class="am-modal am-modal-prompt" tabindex="-1" id="modal-pinggu-group-edit">
        <div class="am-modal-dialog">
            <form method="post" data-name="edit-pinggu-group" action="/hsmm/doEditPingguGroup/">
                <div class="am-modal-hd">编辑评估组</div>
                <div class="am-modal-bd">
                    <table class="am-table am-table-bordered am-table-compact am-text-nowrap am-text-left">
                        <tr>
                            <th>评估项</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                        <tr>
                            <td></td>
                            <td>
                                <div class="am-btn-group am-btn-group-xs">
                                    <button type="button" class="am-btn am-btn-success" onclick="$(this).parents('table').find(':radio[value=10]').uCheck('check')">开启</button>
                                    <button type="button" class="am-btn am-btn-danger" onclick="$(this).parents('table').find(':radio[value=20]').uCheck('check')">禁用</button>
                                </div>
                            </td>
                            <td></td>
                        </tr>
                        {%foreach $all_pinggu_group as $key=>$value %}
                            <tr>
                                <td>{%$value.group_name%}</td>
                                <td>
                                    <label class="am-radio-inline am-success">
                                        <input type="radio" name="group_{%$value.id%}" value="10" data-am-ucheck> 开启
                                    </label>
                                    <label class="am-radio-inline am-danger">
                                        <input type="radio" name="group_{%$value.id%}" value="20" data-am-ucheck> 禁用
                                    </label>
                                </td>
                                <td>
                                    <button type="button" class="am-btn am-btn-xs am-btn-warning am-hide edit-network" id="edit-network-{%$value.id%}" data-group-id="{%$value.id%}">编辑</button>
                                </td>
                            </tr>
                        {%/foreach%}
                    </table>

                </div>
                <div class="am-modal-footer">
                    <input type="hidden" name="model_id" id="edit_pinggu_model_id" value=""/>
                    <span class="am-modal-btn" data-am-modal-cancel>取消</span>
                    <span class="am-modal-btn from-submit" data-am-modal-confirm>提交</span>
                </div>
            </form>
        </div>
    </div>
    <div class="am-modal am-modal-prompt" tabindex="-1" id="modal-model-add">
        <div class="am-modal-dialog">
            <form method="post" action="/hsmm/doAddModel/">
                <div class="am-modal-hd">添加机型</div>
                <div class="am-modal-bd">

                    <input id="edit_icon" name="add_model_group_id" placeholder="机型组id" type="input" class="am-modal-prompt-input"/>
                    <input id="edit_hot" name="add_model_name" placeholder="机型名称" type="input" class="am-modal-prompt-input"/>

                </div>
                <div class="am-modal-footer">
                    <span class="am-modal-btn" data-am-modal-cancel>取消</span>
                    <span class="am-modal-btn from-submit" data-am-modal-confirm>提交</span>
                </div>
            </form>
        </div>
    </div>
    <div class="am-modal am-modal-prompt" tabindex="-1" id="network-model-content">
        <div class="am-modal-dialog">
            <form method="post" action="/hsmm/doEditLegoOptions" id="network-model-form">
                <div class="am-modal-hd">编辑网络制式</div>
                <div class="am-modal-bd">
                    <table class="am-table am-table-bordered am-table-compact am-text-nowrap am-text-left">
                        <thead>
                        <tr>
                            <th>名称</th>
                            <th>是否开启</th>
                            <th>设为默认值</th>
                        </tr>
                        </thead>
                        <tbody>
                        {%*js输出*%}
                        </tbody>
                    </table>
                </div>
                <div class="am-modal-footer">
                    <span class="am-modal-btn" data-am-modal-cancel>取消</span>
                    <span class="am-modal-btn network-model-form-submit" data-am-modal-confirm>提交</span>
                </div>
            </form>
        </div>
    </div>
    {%* 容量等级价格修改弹窗 *%}
    <div class="am-modal am-modal-prompt" tabindex="-1" id="modal-model-batch-capacity-add">
        <div class="am-modal-dialog">
            <div class="am-modal-hd">容量等级价格批量修改</div>
            <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
            <div class="am-modal-bd">
                <ul class="am-avg-md-4">
                    {%foreach $haveLevelCategory as $v%}
                        <li>
                            <a class="am-btn am-btn-default am-btn-block" href="/hsmm/batchUpModelCapacityLevelPerTemplate?category_id={%$v.id%}" target="_blank">{%$v.name%}模板</a>
                        </li>
                    {%/foreach%}
                </ul>
                <div class="am-panel am-panel-default">
                    <div class="am-panel-bd">
                        <div class="am-form-group am-form-file">
                            <button type="button" class="am-btn am-btn-danger am-btn-sm">
                                <i class="am-icon-cloud-upload"></i> 选择要上传的文件
                            </button>
                            <form id="batchCapacityForm" enctype="multipart/form-data">
                                <input id="batchCapacityAddFile" type="file" name="files[]" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
">
                            </form>
                        </div>
                        <div id="batchCapacityFileList"></div>
                    </div>
                </div>
                <div class="am-margin-vertical">
                    <button id="batchCapacitySubmit" type="button" class="am-btn am-btn-success">上传</button>
                </div>
            </div>
            <div class="am-modal-footer">
                <span class="am-modal-btn" data-am-modal-cancel>关闭</span>
            </div>
        </div>
    </div>
    {%* 基准价修改弹窗 *%}
    <div class="am-modal am-modal-prompt" tabindex="-1" id="modal-model-batch-price-add">
        <div class="am-modal-dialog">
            <div class="am-modal-hd">基准价批量管理</div>
            <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
            <div class="am-modal-bd">
                <div class="am-g">
                    <div class="am-padding-bottom">
                        <a class="am-btn am-btn-default" href="/resource/other/base_price_template.xlsx" target="_blank">模板下载</a>
                    </div>
                    <div class="am-panel am-panel-default">
                        <div class="am-panel-bd">
                            <div class="am-form-group am-form-file">
                                <button type="button" class="am-btn am-btn-danger am-btn-sm">
                                    <i class="am-icon-cloud-upload"></i> 选择要上传的文件
                                </button>
                                <form id="batchPriceAddFileForm" enctype="multipart/form-data">
                                    <input id="batchPriceAddFile" type="file" name="files[]" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
">
                                </form>
                            </div>
                            <div id="batchPriceFileList"></div>
                        </div>
                    </div>
                    <div class="am-margin-vertical">
                        <button id="batchPriceSubmit" type="submit" class="am-btn am-btn-success">上传</button>
                    </div>
                </div>
            </div>
            <div class="am-modal-footer">
                <span class="am-modal-btn" data-am-modal-cancel>关闭</span>
            </div>
        </div>
    </div>
    {%* 等级价修改弹窗 *%}
    <div class="am-modal am-modal-prompt" tabindex="-1" id="modal-model-batch-level-price-add">
        <div class="am-modal-dialog">
            <div class="am-modal-hd">等级价批量管理</div>
            <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
            <div class="am-modal-bd">
                <ul class="am-avg-md-4">
                    {%foreach $haveLevelCategory as $v%}
                        <li>
                            <a class="am-btn am-btn-default am-btn-block" href="/hsmm/batchUpModelLevelPerTemplate?category_id={%$v.id%}" target="_blank">{%$v.name%}模板</a>
                        </li>
                    {%/foreach%}
                </ul>
                <hr/>
                <div class="am-panel am-panel-default">
                    <div class="am-panel-bd">
                        <div class="am-form-group am-form-file">
                            <button type="button" class="am-btn am-btn-danger am-btn-sm">
                                <i class="am-icon-cloud-upload"></i> 选择要上传的文件
                            </button>
                            <form id="batchLevelPriceAddFileForm" enctype="multipart/form-data">
                                <input id="batchLevelPriceAddFile" type="file" name="files[]" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
    ">
                            </form>
                        </div>
                        <div id="batchLevelPriceFileList"></div>
                    </div>
                </div>
                <div class="am-margin-vertical">
                    <button id="batchLevelPriceSubmit" type="submit" class="am-btn am-btn-success">上传</button>
                </div>
            </div>
            <div class="am-modal-footer">
                <span class="am-modal-btn" data-am-modal-cancel>关闭</span>
            </div>
        </div>
    </div>
    {%* 上传结果,弹窗 *%}
    <div class="am-modal am-modal-prompt" tabindex="-1" id="resultModal">
        <div class="am-modal-dialog">
            <div class="am-modal-hd">上传结果</div>
            <div class="am-modal-bd">
                <div class="am-panel-bd" id="resultModalContent"></div>
            </div>
            <div class="am-modal-footer">
                <span class="am-modal-btn" data-am-modal-cancel>关闭</span>
            </div>
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

            $(".edit_model").on('click', function () {
                var model_id = $(this).data("model_id");
                var icon = $(this).data("icon");
                var hot = $(this).data("hot");
                var status = $(this).data("status");
                $("#no-img-sp").html("<img src=" + $(this).data("icon-url") + " width='100%' height='100%'>");
                $("#edit_icon").val(icon);
                $("#edit_hot").val(hot);
                $("#edit_model_id").val(model_id);
                if (status == 10) {
                    $("#hs_status_on").uCheck('check');
                    $("#hs_status_off").uCheck('uncheck');
                } else {
                    $("#hs_status_off").uCheck('check');
                    $("#hs_status_on").uCheck('uncheck');
                }
            });
        });

        $('#select_category_id').change(function () {
            var select_category_val = $('#select_category_id').val();
            var select_brand_val = $('#select_brand_id').val();
            getModelGroup(select_category_val, select_brand_val);
        });

        $('#select_brand_id').change(function () {
            var select_category_val = $('#select_category_id').val();
            var select_brand_val = $('#select_brand_id').val();
            getModelGroup(select_category_val, select_brand_val);
        });

        //网络制式 开启
        $('.edit-network').click(function () {
            let groupId = $(this).data('group-id');
            let modelId = $('#edit_pinggu_model_id').val();
            getPingguGroup(modelId, function (res) {
                var lego_pinggu_group = res['result']['lego_pinggu_group']
                var lego_pinggu_option = res['result']['lego_pinggu_option']
                renderNetworkModelContent(lego_pinggu_group[groupId], lego_pinggu_option[groupId], groupId, modelId)
                $('#network-model-content [type=checkbox]').change(function () {
                    var $this = $(this)
                    var $radio = $this.closest('tr').find('input:radio')
                    if ($this.prop('checked')) {
                        $radio.removeAttr('disabled')
                    } else {
                        $radio.attr({'disabled': true, 'checked': false})
                    }
                })
                $('#network-model-content').modal()
            })
        })

        function getModelGroup(select_category_val, select_brand_val) {
            var modelGroupId = {%$smarty.get.model_group_id|default:4414%};
            $.ajax({
                url: '/hsmm/doGetModelGroup/',
                async: true,
                data: {
                    brand_id: 'zero_' + select_brand_val,
                    category_id: select_category_val,
                },
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (!res['errno']) {
                        var $selected = $('#select_model_group_id');
                        $selected.empty();
                        for (var i in res['result']) {
                            if (modelGroupId == res['result'][i]['id']) {
                                $selected.append('<option selected value="' + res['result'][i]['id'] + '"> ' + res['result'][i]['group_name'] + '</option>');
                            } else {
                                $selected.append('<option value="' + res['result'][i]['id'] + '"> ' + res['result'][i]['group_name'] + '</option>');
                            }
                        }
                        $("#model_group_name").html($("#select_model_group_id").find("option:selected").text());
                    } else {
                    }
                },
                error: function (res) {

                }
            });
        }

        $('.edit_pinggu_group').on('click', function () {
            var model_id = $(this).data("model_id");
            $("#edit_pinggu_model_id").val(model_id);
            getPingguGroup(model_id, function (res) {
                $("#modal-pinggu-group-edit input:radio[value='20']").uCheck('check');
                $('.edit-network').addClass('am-hide');
                $.each(res.result.pinggu_group, function (index, value) {
                    $(`#modal-pinggu-group-edit input:radio[name='group_${value}'][value='10']`).uCheck('check');
                });
                $.each(res.result.lego_pinggu_group, function (index) {
                    $(`#edit-network-${index}`).removeClass('am-hide');
                });
                $('#modal-pinggu-group-edit').modal({
                    closeViaDimmer: false
                });
            })
        });

        function getPingguGroup(model_id, callback) {
            $.ajax({
                url: '/hsmm/doGetPingguGroup/',
                async: true,
                data: {
                    model_id: +model_id,
                },
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (!res['errno']) {
                        typeof callback === 'function' && callback(res)
                    } else {
                        newAlert('wrong', '获取评估信息失败', '请求失败,请重试');
                    }
                },
                error: function (res) {
                    newAlert('wrong', '获取评估信息失败', '请求失败,请重试');
                }
            });
        }

        //添加网络制式表单内容
        function renderNetworkModelContent(networkGroup, networkOption, groupId, modelId) {
            var strArr = []
            for (let i in networkGroup) {
                var name = networkGroup[i]
                var openFlag = false
                var defaultOpenFlag = false
                if (networkOption && networkOption['option_ids']) {
                    for (var j = 0; j < networkOption['option_ids'].length; j++) {
                        if (i === networkOption['option_ids'][j]) {
                            openFlag = true
                            break
                        }
                    }
                }
                if (networkOption && networkOption['default_option_id']) {
                    if (i === networkOption['default_option_id']) {
                        defaultOpenFlag = true
                    }
                }
                var checkboxChecked = openFlag ? 'checked' : ''
                var radioChecked = defaultOpenFlag ? 'checked' : ''
                var radioDisabled = !openFlag ? 'disabled' : ''
                strArr.push(`<tr>`)
                strArr.push(`<td>${name}</td>`)
                strArr.push(`<td><label class="am-checkbox-inline"><input ${checkboxChecked} type="checkbox" name="option_ids[]" value="${i}" data-am-ucheck>开启 </label></td>`)
                strArr.push(`<td><label class="am-radio-inline"><input type="radio" ${radioChecked} ${radioDisabled} name="default_option_id" value="${i}" data-am-ucheck>是</label></td>`)
                strArr.push(`</tr>`)
            }
            strArr.push(`<input type="hidden" name="model_id" value="${modelId}">`)
            strArr.push(`<input type="hidden" name="group_id" value="${groupId}"/>`)
            $('#network-model-content tbody').html(strArr.join(''))
            $('#network-model-content tbody input:checkbox, input:radio').uCheck();
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
                            newAlert('success', '品牌管理', '操作成功<br/>' + res.errmsg, function () {
                                window.location.reload();
                            });
                        } else {
                            newAlert('wrong', '品牌管理', '操作失败<br/>' + res.errmsg);
                        }
                    },
                    error: function (res) {
                        newAlert('wrong', '品牌管理', '请求失败,请重试');
                    }
                });
            });
        });

        // 网络制式 表单提交
        $('.network-model-form-submit').on('click', function (e) {
            e.preventDefault();
            var $form = $(this).closest('form');
            newConfirm('warning', '品牌管理', '是否进行操作 ?', function () {
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
                            alert('操作成功')
                        } else {
                            newAlert('wrong', '品牌管理', '操作失败<br/>' + res.errmsg);
                        }
                    },
                    error: function (res) {
                        newAlert('wrong', '品牌管理', '请求失败,请重试');
                    }
                });
            })
        });

        function toConfirm(onConfirmCallback) {
            return newConfirm('warning', '品牌管理', '是否进行操作 ?', onConfirmCallback);
        }

        $("#brand_name").html($("#select_brand_id").find("option:selected").text());
        $("#category_name").html($("#select_category_id").find("option:selected").text());

        var select_category_val = $('#select_category_id').val();
        var select_brand_val = $('#select_brand_id').val();
        getModelGroup(select_category_val, select_brand_val);

        // 容量等级价格文件选择
        $('#batchCapacityAddFile').on('change', function () {
            var fileNames = '';
            $.each(this.files, function () {
                fileNames += '<span class="am-badge">' + this.name + '</span> ';
            });
            $('#batchCapacityFileList').html(fileNames);
        });

        // 基准价批量修改文件选择
        $('#batchPriceAddFile').on('change', function () {
            var fileNames = '';
            $.each(this.files, function () {
                fileNames += '<span class="am-badge">' + this.name + '</span> ';
            });
            $('#batchPriceFileList').html(fileNames);
        });

        // 等级价格批量修改文件选择
        $('#batchLevelPriceAddFile').on('change', function () {
            var fileNames = '';
            $.each(this.files, function () {
                fileNames += '<span class="am-badge">' + this.name + '</span> ';
            });
            $('#batchLevelPriceFileList').html(fileNames);
        });

        // 清空选择文件
        function clearInputFiles($fileList) {
            var $_list = $fileList || {}
            $fileList.siblings().children('form')[0].reset()
            $fileList.html('')
        }

        // 容量等级价格文件提交
        $('#batchCapacitySubmit').on('click', function () {
            var $_input = $('#batchCapacityAddFile')[0]
            if ($_input.files.length < 1) {
                alert('请选择文件后再上传!')
                return
            }
            var $_formData = new FormData($('#batchCapacityForm')[0])
            $.ajax({
                type: 'post',
                url: "/hsmm/batchUpCapacity",
                data: $_formData,
                cache: false,
                processData: false,
                contentType: false,
            }).success(function (data) {
                var $modal = $('#resultModal')

                if (data.errno == 0) {
                    $('#resultModalContent').html('批量导入成功!')
                } else {
                    $('#resultModalContent').html('批量导入失败,失败原因:<br>' + data.errmsg)
                }
                clearInputFiles($('#batchCapacityFileList'))
                $('#modal-model-batch-capacity-add').modal('close')
                $modal.modal({
                    closeViaDimmer: false
                })

            }).error(function (err) {

                var $modal = $('#resultModal')
                $('#resultModalContent').html('导入失败,系统错误!')
                clearInputFiles($('#batchCapacityFileList'))
                $('#modal-model-batch-capacity-add').modal('close')
                $modal.modal({
                    closeViaDimmer: false
                })

            });
        })

        // 容量等级价格文件提交
        $('#batchPriceSubmit').on('click', function () {
            var $_input = $('#batchPriceAddFile')[0]
            if ($_input.files.length < 1) {
                alert('请选择文件后再上传!')
                return
            }

            var $_formData = new FormData($('#batchPriceAddFileForm')[0])
            $.ajax({
                type: 'post',
                url: "/hsmm/batchUpBasePrice",
                data: $_formData,
                cache: false,
                processData: false,
                contentType: false,
            }).success(function (data) {
                var $modal = $('#resultModal')

                if (data.errno == 0) {
                    $('#resultModalContent').html('批量导入成功!')
                } else {
                    $('#resultModalContent').html('批量导入失败,失败原因:<br>' + data.errmsg)
                }
                clearInputFiles($('#batchPriceFileList'))
                $('#modal-model-batch-price-add').modal('close')
                $modal.modal({
                    closeViaDimmer: false
                })

            }).error(function (err) {

                var $modal = $('#resultModal')
                $('#resultModalContent').html('导入失败,系统错误!')
                clearInputFiles($('#batchPriceFileList'))
                $('#modal-model-batch-price-add').modal('close')
                $modal.modal({
                    closeViaDimmer: false
                })

            });
        })


        // 容量等级价格文件提交
        $('#batchLevelPriceSubmit').on('click', function () {
            var $_input = $('#batchLevelPriceAddFile')[0]
            if ($_input.files.length < 1) {
                alert('请选择文件后再上传!')
                return
            }

            var $_formData = new FormData($('#batchLevelPriceAddFileForm')[0])
            $.ajax({
                type: 'post',
                url: "/hsmm/batchUpModelLevelPer",
                data: $_formData,
                cache: false,
                processData: false,
                contentType: false,
            }).success(function (data) {
                var $modal = $('#resultModal')

                if (data.errno == 0) {
                    $('#resultModalContent').html('批量导入成功!')
                } else {
                    $('#resultModalContent').html('批量导入失败,失败原因:<br>' + data.errmsg)
                }
                clearInputFiles($('#batchLevelPriceFileList'))
                $('#modal-model-batch-level-price-add').modal('close')
                $modal.modal({
                    closeViaDimmer: false
                })

            }).error(function (err) {

                var $modal = $('#resultModal')
                $('#resultModalContent').html('导入失败,系统错误!')
                clearInputFiles($('#batchLevelPriceFileList'))
                $('#modal-model-batch-level-price-add').modal('close')
                $modal.modal({
                    closeViaDimmer: false
                })

            });
        })

    </script>
{%/block%}
