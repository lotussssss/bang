{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">回收评估组选项管理</strong> /
            <small>回收评估组选项管理</small>
        </div>
    </div>

    <div class="am-g">
        <div class="am-u-md-12">
            <div class="am-g">
                <form action="/hsmm/optionlist" method="get">
                    <div class="am-u-md-2">
                        <select name="category_id" id="select_category_id" placeholder="选择品类" data-am-selected="{btnSize: 'sm',btnStyle:'default',maxHeight: 300,searchBox: 1}">
                            <option selected value="0">选择品类</option>
                            {%foreach $categoryMap as $categoryId => $categoryName%}
                                {%if $categoryId==($smarty.get.category_id|default:1)%}
                                    <option value="{%$categoryId%}" selected>{%$categoryName%}</option>
                                {%else%}
                                    <option value="{%$categoryId%}">{%$categoryName%}</option>
                                {%/if%}
                            {%/foreach%}
                        </select>
                    </div>
                    <div class="am-u-md-2">
                        <button type="submit" class="am-btn am-btn-default" id="search_btn" >查询</button>
                    </div>
                    <div class="am-u-md-8">

                    </div>
                </form>

            </div>
        </div>
        <div class="am-panel-bd">
            <div>
                <a class="am-badge am-badge-danger am-round">Tips1：</a>
                1. 组内权重值在0-255之间，值越大权重越高；
                2. 权重表明同一选项组中同时出现多个选项，则权重高的选项生效;
                3. 只有王丹有权限修改选项，其他人只能改权重😪😇😇😇;
            </div>

            <div>
                <a class="am-badge am-badge-danger am-round">Tips2：</a>
                1. 排序值在0——255之间，，排序值越大越展示越靠前;
            </div>
        </div>
    </div>


    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-g">
        <div class="am-u-sm-12 am-scrollable-horizontal">
            {%if $groupOptions%}
                {%foreach $groupOptions as $groupId=>$groupInfo%}
                    <div class="am-panel am-panel-secondary">
                        <div class="am-panel-hd">{%$groupInfo['group_name']%}</div>
                        {%foreach $groupInfo['options'] as $optionId=>$optionInfo%}
                            <div class="am-panel-bd">
                                <div class="am-g">
                                    <form action="/hsmm/doUpdatePingguOption" method="post">
                                        <div class="am-u-md-4">
                                            <div class="am-u-md-4">
                                            optionId: {%$optionId%}
                                            </div>
                                            <div class="am-u-md-8">
                                            选项：<input type="text" class="" name="option_name" value="{%$optionInfo['option_name']%}"/>
                                            </div>
                                        </div>


                                        <div class="am-u-md-3">
                                            组内权重：
                                            <input type="text" class="" name="option_rank" value="{%$optionInfo['option_rank']%}"/>
                                        </div>

                                        <div class="am-u-md-3">
                                            组内排序：
                                            <input type="text" class="" name="hot" value="{%$optionInfo['hot']%}"/>
                                        </div>

                                        <div class="am-u-md-2">
                                            <input type="hidden" class="" name="option_id" value="{%$optionId%}"/>
                                            <span class="am-btn am-btn-danger from-submit">保存评估选项</span>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        {%/foreach%}
                    </div>
                {%/foreach%}
            {%else%}
                <div class="am-alert">
                    没有可显示数据
                </div>
            {%/if%}

        </div>
    </div>


{%/block%}

{%block name="block_js" append%}
    <script type="text/javascript">
        $(function () {
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
                                newAlert('success', '评估项管理', '操作成功<br/>' + res.errmsg, function () {
                                    window.location.reload();
                                });
                            } else {
                                newAlert('wrong', '评估项管理', '操作失败<br/>' + res.errmsg);
                            }
                        },
                        error: function (res) {
                            newAlert('wrong', '评估项管理', '请求失败,请重试');
                        }
                    });
                });
            });
        });
    </script>
{%/block%}