{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}

    <style>
        #editTable .table-title-tr th:nth-child(4) {
            width: 12% !important;
        }

        #editTable .table-empty {
            font-style: normal;
            border-bottom-color: #b0b0b0;
            color: #b0b0b0;
        }
    </style>
{%/block%}
{%$_tmpFieldMap=array()%}
{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf">
            <strong class="am-text-primary am-text-lg">合作方成本</strong>
            /
            <b>【价位区间/净利金额】设置</b>
        </div>
    </div>
    <div class="am-cf am-padding">
        <div>
            <strong><font size="5">价格反哺模式：{%$pattern_id_name_map[$tab_id]%}</font></strong>
        </div>
        <div>
            <strong><font size="5">子模式名称：{%$group_pattern_tab_map[$tab_id][$partner_id]%}&nbsp;({%$partner_id%})</font></strong>
        </div>
    </div>
    <div class="am-g">
        <div class="am-u-md-12">
            <div class="am-panel am-panel-primary" style="width: 70%">
                <div class="am-panel-hd">
                    <strong>价位区间/净利金额</strong>
                </div>
                <div class="am-panel-bd form-edit-sku">

                    <form method="post" id="segment_manage_form">

                        <table class="am-table am-table-bordered am-table-radius" id="segment_price_table">

                            <thead>
                            <tr>
                                <td>序号</td>
                                <td style="width: 35%">价格区间金额（单位：元）<br/>(左：大于等于，右：小于)</td>
                                <td>净利金额（单位：元）</td>
                                <td>删除价位区间</td>
                            </tr>

                            {%foreach from=$netprofit_list key=myId item=netprofit_item name=myNumber%}
                                <tr>
                                    <td>{%$smarty.foreach.myNumber.iteration%}</td>
                                    <td>
                                        <input type="text" name="min_price[]" class="input-small" style="width:100px;" value="{%$netprofit_item['min_price']|fen2yuan%}" maxlength="20"> ～
                                        {%if $smarty.foreach.myNumber.last eq '1'%}
                                            <input type="text" name="max_price[]" class="input-small" style="width:120px;background-color: slategray;" value="{%$netprofit_item['max_price']|fen2yuan%}" maxlength="20" readonly=true>
                                        {%else%}
                                            <input type="text" name="max_price[]" class="input-small" style="width:120px;" value="{%$netprofit_item['max_price']|fen2yuan%}" maxlength="20">
                                        {%/if%}

                                    </td>
                                    <td>
                                        <input type="text" name="netprofit[]" class="input-small" style="width:120px;" value="{%$netprofit_item['netprofit']|fen2yuan%}" maxlength="20">
                                    </td>
                                    <td>
                                        <button type="button" class="am-btn am-btn-success am-btn-sm del_segment_line">删除该价位区间</button>
                                    </td>
                                </tr>
                            {%/foreach%}

                            </thead>
                        </table>
                        <input type="hidden" name="pattern_tab" value="{%$tab_id%}"/>
                        <input type="hidden" name="partner_id" value="{%$partner_id%}"/>
                        <tbody>
                        <tr>
                            <td class="am-text-right">
                                <button type="button" class="am-btn am-btn-success am-btn-sm add_segment_line">【价位区间/净利金额】新增</button>
                            </td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td class="am-text-right">
                                <span class="am-btn am-btn-primary am-btn-sm" id="submit_segment_manage">提交设置</span>
                            </td>
                        </tr>
                        </tbody>
                    </form>
                </div>
            </div>
        </div>
    </div>
{%/block%}

{%block name="block_js" append%}

    <script type="text/javascript">
        $(".add_segment_line").on('click', function () {

            current_line_num = $("#segment_price_table > thead > tr").length - 1;
            new_line_num = current_line_num + 1;

            new_line = '<tr>';
            new_line+= '<td>' + new_line_num + '</td>';
            new_line+= '<td><input type="text" name="min_price[]" class="input-small" style="width:100px;" value="" maxlength="20">';
            new_line+= ' ～ ';
            new_line+= '<input type="text" name="max_price[]" class="input-small" value="1000000.00" style="width:120px;background-color: slategray;" maxlength="20"></td>';
            new_line+= '<td><input type="text" name="netprofit[]" class="input-small" style="width:120px;" value="" maxlength="20"></td>';
            new_line+= '<td><button type="button" class="am-btn am-btn-success am-btn-sm del_segment_line">删除该价位区间</button></td>';
            new_line+= '</tr>';

            $("#segment_price_table thead").append(new_line);

            current_line_num  = $("#segment_price_table > thead > tr").length - 1;
            $last_second_line = current_line_num - 1;
            if($last_second_line > 0){
                $('#segment_price_table').find('tr').eq($last_second_line).find('td').eq(1).find("input[type='text']")[1]['value'] = '';
                $('#segment_price_table').find('tr').eq($last_second_line).find('td').eq(1).find("input[type='text']").eq(1).attr("readonly",false);
                $('#segment_price_table').find('tr').eq($last_second_line).find('td').eq(1).find("input[type='text']").eq(1).attr("style",'width:120px;');
            }
            $('#segment_price_table').find('tr').eq(current_line_num).find('td').eq(1).find("input[type='text']").eq(1).attr("readonly",true);
            $('#segment_price_table').find('tr').eq(current_line_num).find('td').eq(1).find("input[type='text']").eq(1).attr("style",'width:120px;background-color: slategray;');

            $("#segment_price_table thead").find("tr").find('td:last').on("click", function(){

                $(this).closest('tr').remove();
                sort();
                $last_second_line = current_line_num - 1;
                console.log(current_line_num, $last_second_line);
                if($last_second_line > 0){
                    $('#segment_price_table').find('tr').eq(current_line_num).find('td').eq(1).find("input[type='text']")[1]['value'] = '1000000.00';
                    $('#segment_price_table').find('tr').eq(current_line_num).find('td').eq(1).find("input[type='text']").eq(1).attr("readonly",true);
                    $('#segment_price_table').find('tr').eq(current_line_num).find('td').eq(1).find("input[type='text']").eq(1).attr("style",'width:120px;background-color: slategray;');
                }
            });
        });


        $(".del_segment_line").on('click', function () {

            $(this).closest('tr').remove();
            sort();
            current_line_num = $("#segment_price_table > thead > tr").length - 1;
            if(current_line_num > 1){
                $('#segment_price_table').find('tr').eq(current_line_num).find('td').eq(1).find("input[type='text']")[1]['value'] = '1000000.00';
                $('#segment_price_table').find('tr').eq(current_line_num).find('td').eq(1).find("input[type='text']").eq(1).attr("readonly",true);
                $('#segment_price_table').find('tr').eq(current_line_num).find('td').eq(1).find("input[type='text']").eq(1).attr("style",'width:120px;background-color: slategray;');
            }
        });


        function sort(){
            current_line_num = $("#segment_price_table > thead > tr").length - 1;

            for(i=1; i<=current_line_num; i++){
                $('#segment_price_table').find('tr').eq(i).find('td:first').html(i);
            }
        }


        $("#submit_segment_manage").on('click', function (e) {

            e.preventDefault();

            newConfirm('warning', '管理', '是否操作 ?', function () {
                //var $form = $(this).closest('form');
                //var params = $form.serialize();
                var params = $('#segment_manage_form').serializeArray();
                console.log(params);
                var action = '/hsmm/doSubmitSegmentPrice';
                resAjxjRequest(action, params);
            });

        });


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
                        });
                    }
                },
                error: function (res) {
                    newAlert('wrong', '管理', '请求失败,请重试');
                }
            });
        }
    </script>
{%/block%}
