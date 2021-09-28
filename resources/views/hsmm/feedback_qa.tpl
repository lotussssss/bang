{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
<div class="am-cf am-padding">
    <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">问题反馈</strong> /
        <small>修修哥问题反馈</small>
    </div>
</div>

<div class="am-g">
    <div class="am-u-md-12">
        <div class="am-g">
            <div>
                <div class="am-u-md-2">
                    <select name="model_id" id="model_id" placeholder="选择类别" data-am-selected="{btnSize: 'sm',btnStyle:'default'}">
                        <option selected value="0">选择机型</option>
                        {%foreach $hs_model_desc as $modelId => $modeldesc%}
                        {%if $modelId==$smarty.get.model_id%}
                        <option value="{%$modelId%}" selected>{%$modeldesc.model_name%}</option>
                        {%else%}
                        <option value="{%$modelId%}">{%$modeldesc.model_name%}</option>
                        {%/if%}
                        {%/foreach%}
                    </select>
                </div>

                <div  class="am-input-group am-datepicker-date am-u-md-2" data-am-datepicker="{format: 'yyyy-mm-dd'}">
                    <input type="text" value="{%$smarty.get.start_date|default:$lastdate%}" name="start_date" class="am-form-field" placeholder="开始日期" readonly>
                    <span class="am-input-group-btn am-datepicker-add-on">
                        <button class="am-btn am-btn-default" type="button"><span class="am-icon-calendar"></span> </button>
                      </span>
                </div>
                <div  class="am-input-group am-datepicker-date am-u-md-2" data-am-datepicker="{format: 'yyyy-mm-dd'}">
                    <input type="text" value="{%$smarty.get.end_date|default:$lastdate%}" name="end_date" class="am-form-field" placeholder="结束日期" readonly>
                    <span class="am-input-group-btn am-datepicker-add-on">
                        <button class="am-btn am-btn-default" type="button"><span class="am-icon-calendar"></span> </button>
                      </span>
                </div>
                <div class="am-u-md-6">
                    <button type="button" class="am-btn am-btn-default" id="search_btn" >查询</button>
                    <button type="button" class="am-btn am-btn-default" id="download_btn" >下载</button>
                </div>
            </div>
        </div>

    </div>

</div>

<hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
<div class="am-g">
    <div class="am-u-sm-12 am-scrollable-horizontal">
        {%if $feedback_list[0] %}
        <table class="am-table am-table-bordered am-table-striped am-table-centered">
            <thead>
            <tr>
                <th>反馈时间</th>
                <th>反馈标签</th>
                <th>反馈内容</th>
                <th>修修哥账号</th>
                <th>修修哥名称</th>
                <th>机型名称</th>
                <th>SKU</th>
                <th>报价</th>
                <th>评估信息</th>
            </tr>
            </thead>
            <tbody>
            {%foreach $feedback_list as $val%}
            <tr>
                <td>{%$val->created_at%}</td>
                <td>{%$feedback_qa_map[$val->question_tag]%}</td>
                <td>{%$val->question_desc%}</td>
                <td>{%$val->xxg_mobile%}</td>
                <td>{%$val['XxgInfo']->name%}</td>
                <td>{%$val->model_name%}</td>
                <td>{%$val->sku_name%}</td>
                <td>{%$val['AssessKey']->show_price%}</td>
                <td>{%$val->pinggu_option%}</td>
            </tr>
            {%/foreach%}
            </tbody>
        </table>
        <ul class="am-pagination am-pagination-centered">
            <li class="previous {%($feedback_list->currentPage() == 1) ? ' am-disabled' : ''%}">
                <a href="{%$feedback_list->url(1)|no_escape%}"><i class="chevron left icon">&laquo;</i></a>
            </li>
            {%for $i = 1; $i <= $feedback_list->lastPage(); $i++ %}
                <li class="{%($feedback_list->currentPage() == $i) ? ' am-active' : ''%}">
                    <a href="{%$feedback_list->url($i)|no_escape%}">{%$i%}</a>
                </li>
            {%/for%}
            <li class="next {%($feedback_list->currentPage() == $feedback_list->lastPage()) ? ' disabled' : '' %}">
                <a href="{%$feedback_list->url($feedback_list->currentPage()+1)|no_escape%}">
                    <i class="chevron right icon">&raquo;</i>
                </a>
            </li>
        </ul>
        {%else%}
        <div class="am-alert">
            没有可显示数据
        </div>
        {%/if%}
    </div>
</div>

<hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>

{%/block%}

{%block name="block_js" append%}
<script type="text/javascript">
    $(document).ready(function() {
        // 查询
        $("#search_btn").on('click', function () {
            var url = getUrl();
            window.location.href = url;
        });
    });
    //下载
    $("#download_btn").click(function (){
        var stdate = $("input[name='start_date']").val();
        var endate = $("input[name='end_date']").val();
        if(stdate>endate){
            alert("时间选择有误！");
            return;
        }
        window.location = "/hsmm/downQuestionFeedback?model_id="+$('#model_id option:selected').val()+"&start_date="+stdate+"&end_date="+endate;
    });

    function getUrl() {
        var url = location.href;
        var len = url.indexOf("?")!=-1?url.indexOf("?"):url.length;
        url = url.substring(0,len);
        var modelId = $('#model_id option:selected').val()
        if (modelId != 0) {
            url+="?model_id="+modelId;
        }
        var stdate = $("input[name='start_date']").val();
        var endate = $("input[name='end_date']").val();
        if(stdate<=endate && stdate != "" && endate != ""){
            url+="&start_date="+stdate;
            url+="&end_date="+endate;
        }
        return url;
    }

</script>
{%/block%}