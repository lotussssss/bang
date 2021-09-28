
{%block name="block_css" append%}
        </div>
    </div>


    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-g">
        <div class="am-u-sm-12 am-scrollable-horizontal">
            {%if $all_brand%}
                <table class="am-table am-table-bd am-table-striped am-text-nowrap">
                    <thead>
                    <tr>
                        <th>品牌ID</th>
                        <th>品牌名称</th>
                        <th>是否启用</th>
                        <th>操作</th>

                    {%foreach $all_brand as $key => $val%}
                        <tr>

                                <td>{%$val['id']%}</td>
                                <td>{%$val['alias_name']%}</td>
                                <td><img src="{%$val["hs_brand_detail"]['icon_url']%}" width="50px" height="50px"></td>
                                <td>{%$val["hs_brand_detail"]['hot']%}</td>
                                <td>{%if $val["hs_brand_detail"]['hs_status']==10 %}
                                        启用
                                    {%else%}
                                        禁用
                                    {%/if%}
                                </td>
                                <td><button data-brand_id="{%$val['id']%}" data-icon="{%$val["hs_brand_detail"]['icon']%}" data-hot="{%$val["hs_brand_detail"]['hot']%}" data-status="{%$val["hs_brand_detail"]['hs_status']%}" data-am-modal="{target: '#modal-brand-edit', closeViaDimmer: 0}" type="button" class="am-btn am-btn-success edit_brand">编辑</button></td>

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



    widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-modal am-modal-prompt" tabindex="-1" id="modal-brand-edit">
                <div class="am-modal-bd">

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
                    <input type="hidden" name="brand_id" id="edit_brand_id" value=""/>
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

            $(".edit_brand").on('click', function () {

                var brand_id = $(this).data("brand_id");
                var icon = $(this).data("icon");
                var hot = $(this).data("hot");
                var status = $(this).data("status");

                $("#edit_icon").val(icon);
                $("#edit_hot").val(hot);
                $("#edit_brand_id").val('fuck_zero_'+brand_id);
                if( status == 10 ){
                    $("#hs_status_on").uCheck('check');
                    $("#hs_status_off").uCheck('uncheck');
                }else{
                    $("#hs_status_off").uCheck('check');
                    $("#hs_status_on").uCheck('uncheck');
                }

                console.log(hot);
            });

        })

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
                            newAlert('success', '品牌管理', '操作成功', function () {
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

        function toConfirm(onConfirmCallback) {
            return newConfirm('warning', '品牌管理', '是否进行操作 ?', onConfirmCallback);
        }
    </script>
{%/block%}
