{%extends file="layout/base_kucun.mer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
    <div class="am-g am-padding">
        <div class="am-u-md-8 am-u-md-offset-2">
            <div class="am-panel am-panel-default">
                <div class="am-panel-hd">常用功能</div>
                <div class="am-panel-bd">
                    <div class="am-g">
                        <div class="am-u-md-2">
                            <a class="am-btn am-btn-default" href="/Kc_mer/partList/">配件库存</a>
                        </div>
                        <div class="am-u-md-2">
                            <a class="am-btn am-btn-default" href="/Kc_mer/partListImport/">配件库存/数据导入</a>
                        </div>
                        <div class="am-u-md-2">
                            <a class="am-btn am-btn-default" href="/Kc_mer/editParts/">配件库存/状态编辑</a>
                        </div>
                        <div class="am-u-md-2 am-u-end">
                            <a class="am-btn am-btn-default" href="/Kc_mer/transferList/">配件库存/流转查询</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="am-panel am-panel-default">
                <div class="am-panel-hd">最近操作人</div>
                <div class="am-panel-bd">
                    <div class="am-g">
                        {%foreach $operating_record as $value%}
                            <div class="am-u-md-6">
                                <span class="am-text-sm">[{%$value['create_time']%}] {%$value['name']%}({%$value['qid']%})</span>
                            </div>
                        {%/foreach%}
                    </div>
                </div>
            </div>
        </div>
    </div>
{%/block%}

{%block name="block_js" append%}
{%/block%}
