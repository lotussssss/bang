{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_title"%}价位段净利额调整{%/block%}

{%block name="block_css" append%}
    <link rel="stylesheet" href="/resource/other/assets/global/plugins/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="/resource/other/assets/global/plugins/bootstrap-editable/bootstrap-editable/css/bootstrap-editable.css">
    <link rel="stylesheet" href="/resource/other/assets/global/plugins/bootstrap-toastr/toastr.min.css">
    <style>
        #editTable .table-title-tr th:nth-child(4) {
            width: 15% !important;
        }
        #editTable .table-empty {
            font-style: normal;
            border-bottom-color: #b0b0b0;
            color: #b0b0b0;
        }
    </style>
{%/block%}
{%* 声明一个变量,存放filed_id及对应的filed_type *%}
{%$_tmpFieldMap=array()%}
{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf">
            <strong class="am-text-primary am-text-lg">合作方成本</strong>
            /
            <b>【价位区间/净利金额】反哺模式列表</b>
        </div>
    </div>
    <hr>

    <div class="am-panel am-panel-default">
        <div class="am-panel-bd">
            <form class="am-form am-form-horizontal am-padding-0 am-cf" role="form" action="/hsmm/priceSegmentPartnerList">
                <div class="am-form-group am-u-sm-2">
                    <input type="text" class='am-form-field am-input-sm' name='keyword' id='keyword' value='{%$keyword%}' placeholder="请输入合作方名称或id"/>
                </div>
                <div class="am-form-group">
                    <input type="button" id="partnerSearch" class="am-btn am-btn-secondary am-btn-sm" value="模糊查询"/>
                </div>
            </form>
        </div>
    </div>

    <section class="am-margin">
        <table id="editTable" class="am-table am-table-bordered am-table-striped am-table-centered" style="width: 95%">
            {%foreach $group_pattern_tab_map as $tabId => $tabItems%}
                <tr class="table-title-tr">
                    <th class="am-primary" style="width: 14%;color: black;"><span size="3">价格反哺模式</span></th>
                    <th class="am-primary" style="width: 12%;color: black;"><span size="3">子模式名称</span></th>
                    <th class="am-primary" style="width: 12%;color: black;"><span size="3">设置【价位区间/净利金额】</span></th>
                    <th class="am-primary" style="width: 10%;color: black;"><span size="3">设置【零净利金额】</span></th>
                    <th class="am-primary" style="width: 54%;color: black;"><span size="3">设置【零净利金额】（指定等级）</span></th>
                </tr>
                {%if count($tabItems) == 1%}
                    <tr class="table-title-tr">
                        <td style="width: 8%;background-color:lightgoldenrodyellow">
                            <span size="3">
                                价格反哺模式 【 {%$tabId%} 】<br/><b>{%$pattern_id_name_map[$tabId]%}</b>
                            </span>
                        </td>
                        {%foreach $tabItems as $partnerId => $partnerName%}
                            <td style="vertical-align: middle;"><span size="3">{%$partnerName%}&nbsp;({%$partnerId%})</span></td>
                            <td style="vertical-align: middle;">
                                <a class="edit-choice-type am-btn am-btn-primary am-btn-sm" href="/hsmm/priceSegmentNetprofit?pattern_tab={%$tabId%}&partner_id={%$partnerId%}">去设置</a>
                            </td>
                            <td style="vertical-align: middle;">

                                {%if !empty($zero_netprofit_map[$tabId][$partnerId]) %}
                                    <button type="button" class="am-btn am-btn-success change-flag am-btn-sm change_status" data-flag="1" data-tab_id="{%$tabId%}" data-partner_id="{%$partnerId%}" data-to_status="20">已开启，去关闭</button>
                                {%else%}
                                    <button type="button" class="am-btn am-btn-warning change-flag am-btn-sm change_status" data-flag="0" data-tab_id="{%$tabId%}" data-partner_id="{%$partnerId%}" data-to_status="10">已关闭，去开启</button>
                                {%/if%}
                            </td>
                            <td>
                                {%$i = 1%}
                                {%foreach $level_list as $levelId => $levelName%}

                                    <label class="am-checkbox-inline">
                                        {%if in_array($levelId, $zero_netprofit_map[$tabId][$partnerId]) %}
                                            <input type="checkbox" id="select_level_{%$tabId%}_{%$partnerId%}" name="select_level_{%$tabId%}_{%$partnerId%}" class="" value="{%$levelId%}" checked>{%$levelName%}
                                        {%else%}
                                            <input type="checkbox" id="select_level_{%$tabId%}_{%$partnerId%}" name="select_level_{%$tabId%}_{%$partnerId%}" class="" value="{%$levelId%}">{%$levelName%}
                                        {%/if%}
                                    </label>

                                    {%if $i++ % 11 == 0%}
                                        <br/>
                                    {%/if%}

                                {%/foreach%}
                            </td>
                        {%/foreach%}
                    </tr>
                {%else%}
                    <tr style="background-color:lightgoldenrodyellow">
                        <td rowspan="{%count($tabItems) + 1%}" style="width: 10px;background-color:lightgoldenrodyellow">
                            <span size="3">
                                价格反哺模式 【 {%$tabId%} 】<br/><b>{%$pattern_id_name_map[$tabId]%}</b>
                            </span>
                        </td>
                    </tr>
                    {%foreach $tabItems as $partnerId => $partnerName%}
                        <tr class="table-title-tr">
                            <td style="vertical-align: middle;"><span size="3">{%$partnerName%}&nbsp;({%$partnerId%})</span></td>
                            <td style="vertical-align: middle;">
                                <a class="edit-choice-type am-btn am-btn-primary am-btn-sm" href="/hsmm/priceSegmentNetprofit?pattern_tab={%$tabId%}&partner_id={%$partnerId%}">去设置</a>
                            </td>
                            <td style="vertical-align: middle;">
                                {%if !empty($zero_netprofit_map[$tabId][$partnerId])%}
                                    <button type="button" class="am-btn am-btn-success change-flag am-btn-sm change_status" data-flag="1" data-tab_id="{%$tabId%}" data-partner_id="{%$partnerId%}" data-to_status="20">已开启，去关闭</button>
                                {%else%}
                                    <button type="button" class="am-btn am-btn-warning change-flag am-btn-sm change_status" data-flag="0" data-tab_id="{%$tabId%}" data-partner_id="{%$partnerId%}" data-to_status="10">已关闭，去开启</button>
                                {%/if%}
                            </td>
                            <td style="vertical-align: middle;">
                                {%$i = 1%}
                                {%foreach $level_list as $levelId => $levelName%}

                                    <label class="am-checkbox-inline">
                                        {%if in_array($levelId, $zero_netprofit_map[$tabId][$partnerId]) %}
                                            <input type="checkbox" id="select_level_{%$tabId%}_{%$partnerId%}" name="select_level_{%$tabId%}_{%$partnerId%}" class="" value="{%$levelId%}" checked>{%$levelName%}
                                        {%else%}
                                            <input type="checkbox" id="select_level_{%$tabId%}_{%$partnerId%}" name="select_level_{%$tabId%}_{%$partnerId%}" class="" value="{%$levelId%}">{%$levelName%}
                                        {%/if%}
                                    </label>

                                    {%if $i++ % 11 == 0%}
                                        <br/>
                                    {%/if%}

                                {%/foreach%}
                            </td>
                        </tr>
                    {%/foreach%}
                {%/if%}
            {%/foreach%}
        </table>
    </section>
{%/block%}

{%block name="block_js" append%}
    <script src="/resource/other/assets/global/plugins/bootstrap/js/bootstrap.min.js"></script>
    <script src="/resource/other/assets/global/plugins/bootstrap-editable/bootstrap-editable/js/bootstrap-editable.js"></script>
    <script src="/resource/other/assets/global/plugins/bootstrap-toastr/toastr.min.js"></script>
    <script type="text/javascript"></script>
{%/block%}

{%block name="block_js" append%}
    <script type="text/javascript">
        $(function () {
            // 容量等级价格文件提交
            $('#partnerSearch').on('click', function () {

                var url = location.href;
                url = url.split("?")[0];
                var keyword = $.trim($('#keyword').val());

                if(keyword != ''){
                    url = url + '?keyword=' + keyword;
                }
                window.location.href = url;
            })


            $('.change_status').on('click', function () {

                var tab_id = $(this).data("tab_id");
                var partner_id = $(this).data("partner_id");
                var to_status = $(this).data("to_status");

                var dataObj=new Object();

                dataObj.tab_id = tab_id;

                dataObj.partner_id = partner_id;

                dataObj.to_status = to_status;

                var chk_box_name = 'select_level_' + tab_id + '_'+ partner_id;

                var len = $("#"+chk_box_name+":checked").length;

                if(len <= 0 && to_status == 10){
                    toastr.error('操作失败<br/>' + '请选择等级');
                    return;
                }

                var levels = '';
                $("#"+chk_box_name+":checked").each(function () {
                    len--;
                    //alert(this.value);
                    levels += this.value;
                    if(len > 0){
                        levels += ',';
                    }
                });

                dataObj.levels = levels;

                $.ajax({
                    url: '/hsmm/doUpdateZeroNetprofit',
                    //async: true,
                    data: dataObj,
                    dataType: 'json',
                    type: 'POST',
                    success: function (res) {
                        if (!res['errno']) {
                            toastr.success('提交成功!')

                        } else {
                            toastr.error('操作失败<br/>' + res.errmsg)
                        }
                        setTimeout( function(){ window.location.href = location.href;}, 2000);
                    },
                    error: function (res) {
                        toastr.error('请求失败,请重试<br/>' + res.errmsg)
                        setTimeout( function(){ window.location.href = location.href;}, 2000);
                    }
                });
            });
        });

    </script>
{%/block%}