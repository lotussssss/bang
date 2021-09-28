{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">回收价格参考</strong> /
            <small>回收价格参考第三方数据导入</small>
        </div>
    </div>
    <div class="am-form">
        <fieldset>
            <legend>导入第三方数据</legend>
            <div class="am-form-group">
                <label for="doc-ta-1">只把价格数据复制到文本框</label>
                <textarea name="third_party_data" class="text-rendering: optimizeLegibility;" rows="11" id="third_party_data"></textarea>
            </div>
            <p><button type="button" class="am-btn am-btn-default" id="third_party_sumbmit">提交</button> &nbsp; <span><a href="downXlsx">下载导入数据模板表格</a></span></p>
        </fieldset>
    </div>
    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>

{%/block%}

{%block name="block_js" append%}
    <script type="text/javascript">
        // 表单提交
        $("#third_party_sumbmit").click(function (){
            $.ajax({
                url: '/hsmm/doImportThirdPartyData',
                type: 'POST',
                data: {third_party_data:$("#third_party_data").val()},
                success: function (data) {
                    var ret = $.parseJSON(data);
                    if(ret["errno"]==0&&ret["result"]!=""){
                        alert("部分数据未导入成功！现给出失败数据行数：\n"+ret["result"]);
                    }else if(ret["errno"]==0){
                        alert("数据导入成功！请注意检查数据是否导入正确");
                    }else{
                        alert(ret["errmsg"]);
                    }
                },
                errno: function () {
                    alert("系统错误");
                }
            });
        });
    </script>
{%/block%}