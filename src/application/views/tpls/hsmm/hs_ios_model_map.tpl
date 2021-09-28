{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">苹果机型映射</strong> /
            <small>苹果机型映射</small>
        </div>
    </div>
    <div class="am-g">
        <div class="am-u-md-12">
            <div class="am-g">

            </div>

        </div>

    </div>
    <div class="am-panel am-panel-default">
        <div class="am-panel-bd">
            <form class="am-form am-form-horizontal am-padding-0 am-cf" role="form">
                <div class="am-form-group am-u-sm-2">
                    <input type="text" class='am-form-field am-input-sm' name='model' id='model' value='{%$smarty.get.model%}' placeholder="model搜索"/>
                </div>

                <div class="am-form-group am-u-sm-2">
                    <input type="text" class='am-form-field am-input-sm' name='hs_model_id' id='hs_model_id' value='{%$smarty.get.hs_model_id%}' placeholder="机型id搜索"/>
                </div>
                <div class="am-form-group am-u-sm-2">
                    <select name="HsModel@hs_status" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}">
                        <option value="0" selected>机型是否已经下架</option>
                        <option value="10" {%if $smarty.get['HsModel@hs_status'] == '10' %}selected{%/if%}>上架</option>
                        <option value="20" {%if $smarty.get['HsModel@hs_status'] == '20' %}selected{%/if%}>下架</option>
                    </select>
                </div>
                <div class="am-form-group am-u-sm-2">
                    <button id="searchBtn" type="submit" class="am-btn am-btn-primary">搜索</button>
                </div>

                <div class="am-form-group am-u-sm-4">
                    <input type="button" class="am-btn am-btn-danger am-btn-sm default-form-export-ajax" value="下载IOS全量数据"/>
                    <button data-am-modal="{target: '#modal-model-add', closeViaDimmer: 0}" type="button" class="am-btn am-btn-success">添加机型映射</button>
                </div>
            </form>
        </div>
    </div>
    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-g">
        <div class="am-u-sm-12 am-scrollable-horizontal">
            {%if $model_map%}
                <table class="am-table am-table-bd am-table-striped am-text-nowrap">
                    <thead>
                    <tr>
                        <th>model</th>
                        <th>model_name</th>
                        <th>lcd检测状态</th>
                        <th>原彩检测状态</th>
                        <th>品类</th>
                        <th>model_id</th>
                    </tr>
                    </thead>
                    <tbody>
                    {%foreach $model_map as $key => $val%}
                        <tr {%if $val->HsModel->hs_status == 20%}class="am-danger"{%/if%}>
                            <td>{%$val->model%}</td>
                            <td>{%$val->model_name%}</td>
                            <td>
                                {%foreach $flag_map as $flag=>$flagName%}
                                    <label><input type="radio" name="lcd_flag_{%$val->id%}" value="{%$flag%}" {%if $flag == $val->lcd_flag%}checked{%/if%} data-lcd-id={%$val->id%} class="changeLcdFlag">{%$flagName%}</label>
                                {%/foreach%}
                            </td>
                            <td>
                                {%foreach $flag_map as $flag=>$flagName%}
                                <label><input type="radio" name="original_color_flag_{%$val->id%}" value="{%$flag%}" {%if $flag == $val->original_color_flag%}checked{%/if%} data-color-id={%$val->id%} class="changeColorFlag">{%$flagName%}</label>
                                {%/foreach%}
                            </td>
                            <td>
                                {%$category_map[$val->category_id]%}
                            </td>
                            <td>{%$val->hs_model_id%}</td>
                            <td>
                                <button data-model_map_id="{%$val->id%}" type="button" class="am-btn am-btn-success delete_model_map">删除</button>
                            </td>
                        </tr>
                    {%/foreach%}
                    </tbody>
                </table>
                {%$model_map->render('vendor.pagination.amazeui')|no_escape%}
            {%else%}
                <div class="am-alert">
                    没有可显示数据
                </div>
            {%/if%}

        </div>
    </div>
    <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
    <div class="am-modal am-modal-prompt" tabindex="-1" id="modal-model-add">
        <div class="am-modal-dialog">
            <form method="post" id="addIosModeForm" action="/hsmm/doAddIosModelMap/">
                <div class="am-modal-hd">添加机型</div>
                <div class="am-modal-bd">

                    <input name="model" placeholder="MODEL" type="input" class="am-modal-prompt-input"/>
                    <input name="model_name" placeholder="MODEL_NAME" type="input" class="am-modal-prompt-input"/>
                    <input name="hs_model_id" placeholder="同城帮机型ID" type="input" class="am-modal-prompt-input"/>
                    <div class="am-g">
                        <div class="am-u-md-4">lcd检测状态</div>
                        <div class="am-u-md-8" style="text-align: left;">
                            {%foreach $flag_map as $flag=>$flagName%}
                            <label style="margin-right: 10px;"><input type="radio" name="lcd_flag" value="{%$flag%}" {%if $flag == 0%}checked{%/if%} >{%$flagName%}</label>
                            {%/foreach%}
                        </div>
                    </div>
                    <div class="am-g">
                        <div class="am-u-md-4">原彩检测状态</div>
                        <div class="am-u-md-8" style="text-align: left;">
                            {%foreach $flag_map as $flag=>$flagName%}
                            <label style="margin-right: 10px;"><input type="radio" name="original_color_flag" value="{%$flag%}" {%if $flag == 0%}checked{%/if%} >{%$flagName%}</label>
                            {%/foreach%}
                        </div>
                    </div>
                </div>
                <div class="am-modal-footer">
                    <span class="am-modal-btn" data-am-modal-cancel>取消</span>
                    <span class="am-modal-btn from-submit" data-am-modal-confirm>提交</span>
                </div>
            </form>
        </div>
    </div>
{%/block%}

{%block name="block_js" append%}
    <script>
        window.xxx = {%json_encode($model_map|default:[])%};
        window.ooo = {%json_encode($flag_map|default:[])%};
    </script>
    <script type="text/javascript">
        console.log('---',xxx)
        console.log('---!!!',window.ooo)
        var exportUrl = '/hsmm/downloadModelMap?osType=Ios';

        $('.delete_model_map').on('click', function () {

            var model_map_id = $(this).data("model_map_id");

            delModelMap(model_map_id)
        });

        function delModelMap(model_map_id) {
            $.ajax({
                url: '/hsmm/doDelModelMap/',
                async: true,
                data: {
                    model_map_id: +model_map_id,
                    os_type: 'Ios',
                },
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (!res['errno']) {
                        newAlert('success', '处理成功', '删除成功');
                    } else {
                        newAlert('wrong', '删除失败', '请求失败,请重试');
                    }
                },
                error: function (res) {
                    newAlert('wrong', '删除失败', '请求失败,请重试');
                }
            });
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
                            newAlert('success', 'IOS机型管理', '操作成功<br/>' + res.errmsg, function () {
                                $('#addIosModeForm')[0].reset()
                                window.location.reload();
                            });

                        } else {
                            $('#addIosModeForm')[0].reset()
                            newAlert('wrong', 'IOS机型管理', '操作失败<br/>' + res.errmsg);
                        }
                    },
                    error: function (res) {
                        $('#addIosModeForm')[0].reset()
                        newAlert('wrong', 'IOS机型管理', '请求失败,请重试');
                    }
                });
            });
        });

    //    LCD 开关
        $('.changeLcdFlag').on('change',function (e) {
        //   1.先记录下radio改变后的值
            var changeVal = $(this).val(),
                id = $(this).attr('data-lcd-id'),
                parameter = {id:id,value:changeVal,type:'lcd_flag'},
                confirmContent = '确认更改LCD检测状态吗 ?',
                type = 'lcd_flag'
            changeSwitch(confirmContent,parameter,changeVal,type,id)
        })
        //原彩检测开关
        $('.changeColorFlag').on('change',function (e) {
            //   1.先记录下radio改变后的值
            var changeVal = $(this).val(),
                id = $(this).attr('data-color-id'),
                parameter = {id:id,value:changeVal,type:'original_color_flag'},
                confirmContent = '确认更改原彩检测状态吗 ?',
                type = 'original_color_flag'
            changeSwitch(confirmContent,parameter,changeVal,type,id)
        })
        //打开开关的方法
        function changeSwitch(confirmContent,parameter,changeVal,type,id){
            //    2.弹框让用户确认   newConfirm为全局confirm弹窗   第一个参数是提示类型，第二个是弹窗title,第三个是弹窗内容，第三和第四个是确认和取消的回调函数
            newConfirm('warning', 'IOS机型管理', confirmContent, function () {
                console.log('确认了')
                //    3.在这里发请求改变状态，并刷新页面
                $.ajax({
                    url: '/hsmm/doModifyIosFlag/',//这里填接口的地址
                    async: true,
                    data: parameter,
                    dataType: 'json',
                    type: 'POST',// POST or  GET
                    success: function (res) {
                        if (!res.errno) {
                            newAlert('success', 'IOS机型管理', '操作成功<br/>' + res.errmsg, function () {
                                window.location.reload();
                            });
                        } else {
                            newAlert('wrong', 'IOS机型管理', '操作失败<br/>' + res.errmsg);
                            //    4.在这里将radio的状态设置回去  因为点的时候已经改变了状态
                            if(parseInt(changeVal) === 10){
                                $("input[name="+type+"_"+id+"][value='0']").prop("checked",true);
                            }else{
                                $("input[name="+type+"_"+id+"][value='10']").prop("checked",true);
                            }
                        }
                    },
                    error: function (err) {
                        newAlert('wrong', 'IOS机型管理', '请求失败,请重试');
                    }
                });

            },function () {
                //    4.在这里将radio的状态设置回去  因为点的时候已经改变了状态
                if(parseInt(changeVal) === 10){
                    $("input[name="+type+"_"+id+"][value='0']").prop("checked",true);
                }else{
                    $("input[name="+type+"_"+id+"][value='10']").prop("checked",true);
                }

            });
        }
        // $('#modal-model-add').on('closed.modal.amui', function() {
        //     $('#addIosModeForm')[0].reset()
        // });
        var $confirm = $('#modal-model-add');
        var $cancelBtn = $confirm.find('[data-am-modal-cancel]');

        $cancelBtn.off('click.cancel.modal.amui').on('click', function() {
            $('#addIosModeForm')[0].reset()
        });


    </script>
{%/block%}
