{%extends file="layout/base_hsmer.tpl"%}
{%block name="block_title"%}销售价拟合{%/block%}
{%block name="block_css" append%}
{%/block%}

{%block name="block_body"%}
<div class="am-cf am-padding">
    <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">销售价拟合</strong>
        <small></small>
    </div>
</div>
<section class="am-panel am-panel-default am-margin">
    <header class="am-panel-hd">
        <h3 class="am-panel-title">销售价拟合数据下载</h3>
    </header>

    {%if $error_msg != null%}
        <div class="am-panel-bd am-warning">
            <strong class="am-text-primary am-text-lg" style="color: red;">提示：{%$error_msg%}</strong>
        </div>
    {%/if%}

    <div class="am-panel-bd">
        <form class="am-form am-form-horizontal am-padding-0 am-cf" role="form">
            <div class="am-input-group am-input-group-sm am-datepicker-date am-u-md-2" data-am-datepicker="{format: 'yyyy-mm-dd', viewMode: 'days'}">
                <input type="text" id="start_date" name="day[]" class="am-form-field" placeholder="{%if !empty($smarty.get.day[0])%}{%$smarty.get.day[0]%}{%else%}起始日期{%/if%}" value="{%$smarty.get.day[0]%}" readonly>
                <span class="am-input-group-btn am-datepicker-add-on">
                    <button class="am-btn am-btn-default" type="button"><span class="am-icon-calendar"></span></button>
                </span>
            </div>

            <div class="am-input-group am-input-group-sm am-datepicker-date am-u-md-2" data-am-datepicker="{format: 'yyyy-mm-dd', viewMode: 'days'}">
                <input type="text" id="end_date" name="day[]" class="am-form-field" placeholder="{%if !empty($smarty.get.day[1])%}{%$smarty.get.day[1]%}{%else%}结束日期{%/if%}" value="{%$smarty.get.day[1]%}" readonly>
                <span class="am-input-group-btn am-datepicker-add-on">
                    <button class="am-btn am-btn-default" type="button"><span class="am-icon-calendar"></span></button>
                </span>
            </div>

            <div>
                <input type="button" class="am-btn am-btn-secondary am-btn-sm default-form-export-ajax" data-flag="10" value="按日期范围下载（友商格式）"/>
                <input type="button" class="am-btn am-btn-secondary am-btn-sm default-form-export-ajax" data-flag="20" value="按日期范围下载（默认格式）"/>
            </div>


            <form class="am-form am-form-horizontal am-padding-0 am-cf" role="form">
                <div class="am-panel-bd">

                    <div class="am-form-group am-u-sm-20">
                        <label for="brand_id" class="am-u-sm-2 am-padding-0">品牌</label>
                        <select id="brand_id" name="brand_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                    </div>

                    <div class="am-form-group am-u-sm-20">
                        <label for="model_id" class="am-u-sm-2 am-padding-0">机型</label>
                        <select id="model_id" name="model_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                    </div>
                </div>

                <div class="am-panel-bd">

                    <div class="am-form-group am-u-sm-20">
                        <label for="capacity_id" class="am-u-sm-2 am-padding-0">容量</label>
                        <select id="capacity_id" name="capacity_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                    </div>

                    <div class="am-form-group am-u-sm-20">
                        <label for="level_id" class="am-u-sm-2 am-padding-0">等级</label>
                        <select id="level_id" name="level_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                    </div>

                </div>

                <div class="am-panel-bd">

                    <div class="am-form-group am-u-sm-20">
                        <label for="warranty_status" class="am-u-sm-2 am-padding-0">保修状态</label>
                        <select id="warranty_status" name="warranty_status" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                    </div>

                    <div class="am-form-group am-u-sm-20">
                        <label for="channel_id" class="am-u-sm-2 am-padding-0">渠道</label>
                        <select id="channel_id" name="channel_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                    </div>

                </div>

                <div class="am-panel-bd">

                    <div class="am-form-group am-u-sm-20">
                        <button id="searchBtn" type="submit" class="am-btn am-btn-primary">精确查询（请指定全部条件）</button>
                    </div>

                </div>
            </form>


            {%if $list != null%}
                <div class="am-panel-bd">
                    <big><br/>查询结果：{%count($list)%}件</big>
                </div>
                <div class="am-panel-bd">

                    <table class="am-table am-table-bordered am-table-radius am-table-striped">

                        <thead>
                        <tr>
                            <th width="10%;">日期</th>
                            <th width="15%;">机型</th>
                            <th width="10%;">容量</th>
                            <th width="10%;">等级</th>
                            <th width="10%;">保修状态</th>
                            <th width="10%;">渠道</th>
                            <th width="10%;">拟合销售价格</th>
                            <th width="35%;">备注</th>
                        </tr>
                        </thead>

                        <tbody>
                        {%foreach $list as $item%}
                            <tr>
                                <td>
                                    {%$item.sold_day%}
                                </td>
                                <td name="model_name">
                                    {%$item.model_id%}
                                </td>
                                <td name="capacity_name">
                                    {%$item.capacity_id%}
                                </td>
                                <td name="level_name">
                                    {%$item.quality_level_id%}
                                </td>
                                <td name="warranty_name">
                                    {%$item.warranty_status%}
                                </td>
                                <td name="channel_name">
                                    {%$item.channel_id%}
                                </td>
                                <td>
                                    {%fen2yuan($item.sold_price_fen)%}
                                </td>
                                <td style="word-break:break-all;">
                                    {%*{%$item.memo%}*%}
                                    {%foreach explode("\t", $item.memo) as $memoLine%}
                                        {%if $memoLine != ''%}
                                            {%$memoLine%}<br/>
                                        {%/if%}
                                    {%/foreach%}
                                </td>
                            </tr>
                        {%/foreach%}
                        </tbody>
                    </table>
                </div>
            {%/if%}
        </form>
    </div>
</section>
{%/block%}

{%block name="block_js" append%}
<script type="text/javascript">

    function buttonExportAllFormAjax(submitButton, $flag = 10) {
        var exportAllUrl = '/hsmm/downloadSalePriceFit';
        var $form = $(submitButton).closest('form');
        var action = '';
        var params = '';
        if (typeof exportAllUrl != 'undefined' && exportAllUrl) {
            action = exportAllUrl;
            params = $form.serialize() + '&export=1&flag=' + $flag;
        } else {
            action = $form.attr('action');
            params = $form.serialize() + '&export=1&flag=' + $flag;
        }
        submitForm(action, params);
    }

    $('.default-form-export-ajax').on('click', function (e) {
        e.preventDefault();
        let $buttonExportForm = $(this);
        let $flag = $(this).data('flag');
        disabledSubmitButton($buttonExportForm);
        buttonExportAllFormAjax($buttonExportForm, $flag);
    });


    $(function () {
        var __modelList__ = {}    // 机型列表
        var __capacityList__ = {}    // 容量列表
        var __brand_id = {%json_encode($smarty.get.brand_id|default:'show_all')%}
        var __model_id = {%json_encode($smarty.get.model_id|default:'show_all')%}
        var __capacity_id = {%json_encode($smarty.get.capacity_id|default:'show_all')%}
        var __level_id = {%json_encode($smarty.get.level_id|default:'show_all')%}
        var __channel_id = {%json_encode($smarty.get.channel_id|default:'show_all')%}
        var __warranty_status = {%json_encode($smarty.get.warranty_status|default:'show_all')%}

            // 获取品牌
            function getHuishouBrand(callback) {
                $.ajax({
                    url: '/hsmm/getHuishouBrand ',
                    data: {
                        category_id: 1,
                    },
                    dataType: 'json',
                    type: 'POST',
                    success: function (res) {
                        if (res.errno === 0) {
                            if (typeof callback === 'function') {
                                callback(res.result)
                            }
                        } else {
                            newAlert('wrong', '管理后台', '操作失败<br/>' + res.errmsg);
                        }
                    },
                    error: function (res) {
                        newAlert('wrong', '管理后台', '请求失败,请重试<br/>' + res.errmsg);
                    }
                })
            }

        // 获取机型
        function getHuishouModel(brand_id, callback) {
            $.ajax({
                url: '/hsmm/getHuishouModel ',
                data: {
                    category_id: 1,
                    brand_id: brand_id
                },
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (res.errno === 0) {
                        __modelList__[brand_id] = res.result    // 缓存请求数据

                        if (typeof callback === 'function') {
                            callback(res.result)
                        }
                    } else {
                        newAlert('wrong', '管理后台', '操作失败<br/>' + res.errmsg);
                    }
                },
                error: function (res) {
                    newAlert('wrong', '管理后台', '请求失败,请重试<br/>' + res.errmsg);
                }
            })
        }

        // 获取容量
        function getHuishouCapacityListByModel(model_id, callback) {
            $.ajax({
                url: '/hsmm/getHuishouCapacityListByModel',
                data: {
                    model_id: model_id
                },
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (res.errno === 0) {
                        __capacityList__[model_id] = res.result    // 缓存请求数据

                        if (typeof callback === 'function') {
                            callback(res.result)
                        }
                    } else {
                        newAlert('wrong', '管理后台', '操作失败<br/>' + res.errmsg);
                    }
                },
                error: function (res) {
                    newAlert('wrong', '管理后台', '请求失败,请重试<br/>' + res.errmsg);
                }
            })
        }

        // 获取等级
        function getQualityLevel(callback) {
            $.ajax({
                url: '/hsmm/getQualityLevel ',
                dataType: 'json',
                type: 'get',
                success: function (res) {
                    if (res.errno === 0) {
                        if (typeof callback === 'function') {
                            callback(res.result)
                        }
                    } else {
                        newAlert('wrong', '管理后台', '操作失败<br/>' + res.errmsg);
                    }
                },
                error: function (res) {
                    newAlert('wrong', '管理后台', '请求失败,请重试<br/>' + res.errmsg);
                }
            })
        }

        // 获取渠道
        function getQualityChannel(callback) {
            $.ajax({
                url: '/hsmm/getQualitychannel ',
                dataType: 'json',
                type: 'get',
                success: function (res) {
                    if (res.errno === 0) {
                        if (typeof callback === 'function') {
                            callback(res.result)
                        }
                    } else {
                        newAlert('wrong', '管理后台', '操作失败<br/>' + res.errmsg);
                    }
                },
                error: function (res) {
                    newAlert('wrong', '管理后台', '请求失败,请重试<br/>' + res.errmsg);
                }
            })
        }


        function getWarranty() {
            return {'0':'过保', '1':'在保'};
        }

        // 渲染品牌列表
        function initBrandList() {
            var $ele_brand = $('#brand_id')
            var _html_str = '<option value="show_all">请选择品牌</option>'
            getHuishouBrand(function (res) {
                if (!$.isEmptyObject(res)) {
                    $.each(res, function (i, v) {
                        if (__brand_id == i) {
                            _html_str += '<option selected value="' + i + '">' + v + '</option>'
                        } else {
                            _html_str += '<option value="' + i + '">' + v + '</option>'
                        }

                    })

                    $ele_brand.html(_html_str)
                }
            })
        }

        // 渲染机型列表
        function initModelList(res) {
            var $ele_brand = $('#model_id')
            var _html_str = '<option value="show_all">请选择机型</option>'
            if (!$.isEmptyObject(res)) {
                $.each(res, function (i, v) {
                    if (__model_id == i) {
                        _html_str += '<option selected value="' + i + '">' + v + '</option>'
                        $("[name='model_name']").html(v)
                    } else {
                        _html_str += '<option value="' + i + '">' + v + '</option>'
                    }
                })

                $ele_brand.html(_html_str)
            }
        }

        // 渲染等级
        function initQualityLevel() {
            var $ele_brand = $('#level_id')
            var _html_str = '<option value="show_all">请选择等级</option>'
            getQualityLevel(function (res) {
                if (!$.isEmptyObject(res)) {
                    $.each(res, function (i, v) {
                        if(v.category_id == 1){
                            if (__level_id == v.id) {
                                _html_str += '<option selected value="' + v.id + '">' + v.level_name + '</option>'
                                $("[name='level_name']").html(v.level_name)
                            } else {
                                _html_str += '<option value="' + v.id + '">' + v.level_name + '</option>'
                            }
                        }
                    })

                    $ele_brand.html(_html_str)
                }
            })
        }

        // 渲染渠道
        function initQualityChannel() {
            var $ele_brand = $('#channel_id')
            var _html_str = '<option value="show_all">请选择渠道</option>'
            getQualityChannel(function (res) {
                if (!$.isEmptyObject(res)) {
                    $.each(res, function (i, v) {
                        if (__channel_id == v.id) {
                            _html_str += '<option selected value="' + v.id + '">' + v.attribute_val + '</option>'
                            $("[name='channel_name']").html(v.attribute_val)
                        } else {
                            _html_str += '<option value="' + v.id + '">' + v.attribute_val + '</option>'
                        }
                    })

                    $ele_brand.html(_html_str)
                }
            })
        }

        // 渲染容量
        function initcapacity(res) {
            var $ele_brand = $('#capacity_id')
            var _html_str = '<option value="show_all">请选择容量</option>'
            if (!$.isEmptyObject(res)) {
                $.each(res, function (i, v) {
                    if (__capacity_id == i) {
                        _html_str += '<option selected value="' + i + '">' + v + '</option>'
                        $("[name='capacity_name']").html(v)
                    } else {
                        _html_str += '<option value="' + i + '">' + v + '</option>'
                    }
                })

                $ele_brand.html(_html_str)
            }
        }

        // 渲染等级
        function initWarranty() {
            var $ele_warranty = $('#warranty_status')
            var _html_str = '<option value="show_all">请选择保修状态</option>'
            var res = getWarranty();
            if (!$.isEmptyObject(res)) {
                $.each(res, function (i, v) {
                    if (__warranty_status == i) {
                        _html_str += '<option selected value="' + i + '">' + v + '</option>'
                        $("[name='warranty_name']").html(v)
                    } else {
                        _html_str += '<option value="' + i + '">' + v + '</option>'
                    }
                })

                $ele_warranty.html(_html_str)
            }
        }

        // 品牌改变事件
        function brandChangeEvent(val) {
            var _select_val = parseInt(val)
            var _model_data = {}

            if (!Number.isNaN(_select_val)) {
                // 这里做下判断,看是否有已经缓存的机型数据
                _model_data = __modelList__[_select_val]

                if (typeof _model_data === 'undefined') {
                    getHuishouModel(_select_val, initModelList)
                } else {
                    initModelList(_model_data)
                }
            }
        }

        // 机型列表改变事件
        function modelChangeEvent(val) {
            var _select_val = parseInt(val)
            var _capacity_data = {}

            if (!Number.isNaN(_select_val)) {
                // 这里做下判断,看是否有已经缓存的容量数据
                _capacity_data = __capacityList__[_select_val]

                if (typeof _capacity_data === 'undefined') {
                    getHuishouCapacityListByModel(_select_val, initcapacity)
                } else {
                    initcapacity(_capacity_data)
                }

            }
        }

        // 品牌事件绑定
        function bindEventBrand() {
            $('#brand_id').on('change', function (e) {
                var _this = $(this)
                brandChangeEvent(_this.val())
            })
        }

        // 机型列表事件绑定
        function bindEventModel() {
            $('#model_id').on('change', function (e) {
                var _this = $(this)
                modelChangeEvent(_this.val())
            })
        }

        // 批量上传
        function uploadFileEvent() {
            // 清空选择文件
            function clearInputFiles($fileList) {
                var $_list = $fileList || {}
                $fileList.siblings().children('form')[0].reset()
                $fileList.html('')
            }

            $('#batchCapacityAddFile').on('change', function () {
                var fileNames = '';
                $.each(this.files, function () {
                    fileNames += '<span class="am-badge">' + this.name + '</span> ';
                });
                $('#batchCapacityFileList').html(fileNames);
            });

            // 容量等级价格文件提交
            $('#batchCapacitySubmit').on('click', function () {
                var $_upload_date = $('#upload_date').val();
                var $_input = $('#batchCapacityAddFile')[0]
                if ($_input.files.length < 1) {
                    alert('请选择文件后再上传')
                    return
                }
                if($_upload_date == ''){
                    alert('请填写上传日期')
                    return
                }
                var $_formData = new FormData($('#batchCapacityForm')[0])
                $.ajax({
                    type: 'post',
                    url: "/hsmm/batchUpFriendPrice?upload_date="+$_upload_date,
                    data: $_formData,
                    cache: false,
                    processData: false,
                    contentType: false,
                }).success(function (data) {
                    var $modal = $('#resultModal')

                    if (data.errno == 0) {
                        newAlert('success', '上传结果', '批量导入成功<br><br>注意：上传【9-人工调整销售价】后，10分钟内生效！');
                    } else {
                        newAlert('wrong', '上传结果', '批量导入失败,失败原因:<br>' + data.errmsg);
                    }
                    clearInputFiles($('#batchCapacityFileList'))
                    $('#modal-model-batch-capacity-add').modal('close')

                }).error(function (err) {

                    newAlert('wrong', '上传结果', '导入失败,系统错误!');
                    clearInputFiles($('#batchCapacityFileList'))
                    $('#modal-model-batch-capacity-add').modal('close')

                });
            })
        }

        function init() {
            initBrandList()
            initQualityLevel()
            initQualityChannel();
            initWarranty()
            bindEventBrand()
            bindEventModel()
            uploadFileEvent()
        }

        init()

    });

</script>
{%/block%}