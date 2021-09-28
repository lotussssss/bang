{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">回收价格参考</strong> /
            <small>回收价格参考系统</small>
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
                        <button type="submit" class="am-btn am-btn-default" id="search_btn" >查询</button>
                        <button type="button" class="am-btn am-btn-default" id="download_btn" >下载</button>
                        <a href="/hsmm/thirdPartyImport" class="am-btn am-btn-default" id="import_btn" >导入</a>
                    </div>
                </div>
            </div>

        </div>

    </div>

    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-g">
        <div class="am-u-sm-12 am-scrollable-horizontal">
            {%if $hs_refer_price_list %}
                <table class="am-table am-table-bordered am-table-striped am-table-centered">
                    <thead>
                    <tr>
                        <th>日期</th>
                        <th>品牌</th>
                        <th>机型</th>
                        <th>渠道</th>
                        <th>容量</th>
                        <th>颜色</th>
                        <th>回收量</th>
                        <th>出售量</th>
                        <th>库存量</th>
                        <th>评估量</th>
                        <th>订单量</th>
                        <th>同城帮-在保-优品售价</th>
                        <th>同城帮-过保-优品售价</th>
                        <th>同城帮-在保-基准价</th>
                        <th>同城帮-过保-基准价</th>
                        <th>同城帮-回收-一口价</th>
                        <th>爱回收-在保-基准价</th>
                        <th>爱回收-过保-基准价</th>
                        <th>爱回收-回收-一口价</th>
                        <th>牛宝网-在保-基准价</th>
                        <th>牛宝网-过保-基准价</th>
                        <th>牛宝网-回收-一口价</th>
                    </tr>
                    </thead>
                    <tbody>
                    {%foreach $hs_refer_price_list as $val%}
                        <tr>
                            <td>{%$val['create_date']%}</td>
                            <td>{%$val['brand_name']%}</td>
                            <td>{%$val['model_name']%}</td>
                            <td>{%$val['channel']%}</td>
                            <td>{%$val['capacity']%}</td>
                            <td>{%$val['color']%}</td>
                            <td>{%$val['hs_nums']%}</td>
                            <td>{%$val['sale_nums']%}</td>
                            <td>{%$val['stock_nums']%}</td>
                            <td>{%$val['assess_count']%}</td>
                            <td>{%$val['order_count']%}</td>
                            <td>{%$val['lp_under_warranty']%}</td>
                            <td>{%$val['lp_after_warranty']%}</td>
                            <td>{%$val['hs_under_warranty']%}</td>
                            <td>{%$val['hs_after_warranty']%}</td>
                            <td>{%$val['hs_one_price']%}</td>
                            {%foreach $val["third_party_price_list"] as $thirdPrice%}
                                <td>{%$thirdPrice%}</td>
                            {%/foreach%}
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
        <li><a href="/hsmm/hsReferPrice?model_id={%$smarty.get.model_id|default:0%}&start_date={%$smarty.get.start_date|default:$lastdate%}&end_date={%$smarty.get.end_date|default:$lastdate%}&pn=0">第一页</a></li>
        <li><a href="/hsmm/hsReferPrice?model_id={%$smarty.get.model_id|default:0%}&start_date={%$smarty.get.start_date|default:$lastdate%}&end_date={%$smarty.get.end_date|default:$lastdate%}&pn={%if $smarty.get.pn>0%}{%$smarty.get.pn-1%}{%else%}0{%/if%}">上一页</a></li>
        {%*<li class="am-active"><a href="#">1</a></li>*%}
        <li><a href="/hsmm/hsReferPrice?model_id={%$smarty.get.model_id|default:0%}&start_date={%$smarty.get.start_date|default:$lastdate%}&end_date={%$smarty.get.end_date|default:$lastdate%}&pn={%if $smarty.get.pn+1<$total%}{%$smarty.get.pn+1%}{%else%}{%($total-1>=0)?($total-1):0%}{%/if%}">下一页</a></li>
        <li><a href="/hsmm/hsReferPrice?model_id={%$smarty.get.model_id|default:0%}&start_date={%$smarty.get.start_date|default:$lastdate%}&end_date={%$smarty.get.end_date|default:$lastdate%}&pn={%($total-1>=0)?($total-1):0%}">最后一页</a></li>
        <li>
            <div>总共有<span>{%$total_num%}</span>条数据</div>
        </li>
    </ul>

    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>

{%/block%}

{%block name="block_js" append%}
    <script type="text/javascript">
        // 查询
        $("#search_btn").click(function (){
            var url = getUrl();
            window.location.href=url;
        });
        //下载
        $("#download_btn").click(function (){
            var stdate = $("input[name='start_date']").val();
            var endate = $("input[name='end_date']").val();
            if(stdate>endate){
                alert("时间选择有误！");
                return;
            }
            window.location = "/hsmm/downloadHsReferPrice?model_id="+$('#model_id option:selected').val()+"&start_date="+stdate+"&end_date="+endate;
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
            url+="?model_id="+$('#model_id option:selected').val();
            var stdate = $("input[name='start_date']").val();
            var endate = $("input[name='end_date']").val();
            if(stdate<=endate){
                url+="&start_date="+stdate;
                url+="&end_date="+endate;
            }
            return url;
        }

    </script>
{%/block%}