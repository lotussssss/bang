{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">反哺回收基本设置</strong> /
            <small>状态、成本结构、净利 设置</small>
        </div>
    </div>

    <div class="am-g">
        <div class="am-u-md-12">
            <div class="am-g">
                <div>
                    <form class="am-form am-form-horizontal am-padding-0 am-cf" role="form" action="/hsmm/partnerBackFeedList">
                        <div class="am-u-md-2">
                            <div class="am-form-group am-u-sm-2">
                                <input type="text" class='am-form-field am-input-sm' name='keyword' id='keyword' style="width:200px;" value='{%$keyword%}' placeholder="请输入合作方名称或id"/>
                            </div>

                        </div>
                        <div class="am-form-group">
                            <input type="button" id="partnerSearch" class="am-btn am-btn-secondary am-btn-sm" value="模糊查询"/>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-g">
        <div class="am-u-sm-12 am-scrollable-horizontal">
            {%if $result_list %}
                <table class="am-table am-table-bordered am-table-striped">
                    <thead>
                    <tr>
                        <th>反哺模式</th>
                        <th>合作方名称(编号/ID)</th>
                        <th>状态与操作</th>
                        <th>成本结构设置</th>
                        <th>净利设置</th>
                    </tr>
                    </thead>
                    <tbody>
                    {%foreach $result_list as $val%}
                        <tr>
                            <td>{%$val['pattern_name']%}</td>
                            <td>{%$val['partner_name']%}&nbsp;({%$val['partner_id']%})</td>
                            <td>
                                {%if $val['pattern_id'] != '1' %}
                                    <input type="button" id="none" class="am-btn am-btn-default" value="无 权 操 作" disabled/>
                                {%else%}
                                    {%if in_array($val['partner_id'], $partner_id_list) %}
                                        <button type="button" class="am-btn am-btn-success change-flag am-btn-sm change_status" data-flag="1" data-partner_id="{%$val['partner_id']%}" data-to_status="0">反哺已启用，去停用</button>
                                    {%else%}
                                        <button type="button" class="am-btn am-btn-warning change-flag am-btn-sm change_status" data-flag="0" data-partner_id="{%$val['partner_id']%}" data-to_status="1">反哺已停用，去开启</button>
                                    {%/if%}
                                {%/if%}
                            </td>
                            <td>
                                <a class="edit-choice-type am-btn am-btn-primary am-btn-sm" href="/hsmm/partnerCost?rate_type=10&pattern_tab={%$val['pattern_id']%}&partner_id={%$val['partner_id']%}">2C成本结构</a>
                                &nbsp;&nbsp;&nbsp;
                                <a class="edit-choice-type am-btn am-btn-success am-btn-sm" href="/hsmm/partnerCost?rate_type=20&pattern_tab={%$val['pattern_id']%}&partner_id={%$val['partner_id']%}">2B成本结构</a>
                            </td>
                            <td>
                                <a class="edit-choice-type am-btn am-btn-primary am-btn-sm" href="/hsmm/priceSegmentNetprofit?pattern_tab={%$val['pattern_id']%}&partner_id={%$val['partner_id']%}">价位区间净利设置</a>
                                &nbsp;&nbsp;&nbsp;
                                <a class="edit-choice-type am-btn am-btn-success am-btn-sm" href="/hsmm/priceSegmentPartnerList?pattern_tab={%$val['pattern_id']%}&partner_id={%$val['partner_id']%}">零净利设置</a>
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

    <ul id="fenye" class="am-pagination am-pagination-centered">
        <li>
            <a href="/hsmm/partnerBackFeedList?keyword={%$smarty.get.keyword|default:''%}&pn=0">第一页</a>
        </li>
        <li>
            <a href="/hsmm/partnerBackFeedList?keyword={%$smarty.get.keyword|default:''%}&pn={%if $smarty.get.pn>0%}{%$smarty.get.pn-1%}{%else%}0{%/if%}">上一页</a>
        </li>
        <li>
            <a href="/hsmm/partnerBackFeedList?keyword={%$smarty.get.keyword|default:''%}&pn={%if $smarty.get.pn+1<$total%}{%$smarty.get.pn+1%}{%else%}{%($total-1>=0)?($total-1):0%}{%/if%}">下一页</a>
        </li>
        <li>
            <a href="/hsmm/partnerBackFeedList?keyword={%$smarty.get.keyword|default:''%}&pn={%($total-1>=0)?($total-1):0%}">最后一页</a>
        </li>
        <li>
            <div>总共有<span>{%$total_num%}</span>条数据</div>
        </li>
    </ul>

    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>

{%/block%}

{%block name="block_js" append%}
    <script src="/resource/other/assets/global/plugins/bootstrap-toastr/toastr.min.js"></script>
    <script type="text/javascript">
        $('#partnerSearch').on('click', function () {

            var url = location.href;
            url = url.split("?")[0];
            var keyword = $.trim($('#keyword').val());

            if(keyword != ''){
                url = url + '?keyword=' + keyword;
            }
            window.location.href = url;
        });

        var total = {%$total%};
        var pn={%$smarty.get.pn|default:0%},j=0,i=0;
        var li_list = "";
        if(pn>=total||pn<0) pn=total-1;
        var left = 0,right=0,lleft = 0,rright = 0;
        if(pn+2<total){
            right = pn+2;
        }else{
            right  = total;
            rright = 2-(total-pn-1);
        }
        if(pn-2>=0){
            left = pn-2;
        }else {
            left = 0;
            lleft = 2-pn;
        }
        var url = getUrl();
        for(i=(left-rright>=0?left-rright:0);i<pn;i++){
            li_list+="<li><a href='"+url+"&pn="+i+"'>"+(i+1)+"</a></li>"
        }
        li_list+="<li class='am-active'><a href='"+url+"&pn="+pn+"'>"+(pn+1)+"</a></li>";
        for(i=pn+1;i<=right+lleft&&i<total;i++){
            li_list+="<li><a href='"+url+"&pn="+i+"'>"+(i+1)+"</a></li>"
        }


        $("#fenye li").eq(1).after(li_list);

        function getUrl() {
            var url = location.href;
            var len = url.indexOf("?")!=-1?url.indexOf("?"):url.length;
            url = url.substring(0,len);
            url+="?keyword="+$('#keyword').val();

            return url;
        }


        $('.change_status').on('click', function () {

            var partner_id = $(this).data("partner_id");
            var to_status = $(this).data("to_status");

            var dataObj=new Object();

            dataObj.partner_id = partner_id;

            dataObj.to_status = to_status;

            $.ajax({
                url: '/hsmm/doUpdateBackFeedPartnerStatus',
                data: dataObj,
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (!res['errno']) {
                        newAlert('success', '提交成功');

                    } else {
                        newAlert('wrong', '提交失败', res.errmsg);
                    }
                    setTimeout( function(){ window.location.href = location.href;}, 1000);
                },
                error: function (res) {
                    newAlert('wrong', '操作失败', res.errmsg);
                    setTimeout( function(){ window.location.href = location.href;}, 1000);
                }
            });
        });

    </script>
{%/block%}