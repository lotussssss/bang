{%extends file="layout/base_hsmer.tpl"%}
{%block name="block_title"%}友商报价列表{%/block%}
{%block name="block_css" append%}
{%/block%}

{%block name="block_body"%}
<div class="am-cf am-padding">
    <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">友商报价</strong> /
        <small>友商报价列表</small>
    </div>
</div>
<section class="am-panel am-panel-default am-margin">
    <header class="am-panel-hd">
        <h3 class="am-panel-title">友商报价下载</h3>
    </header>
    <div class="am-panel-bd">
        <form class="am-form am-form-horizontal am-padding-0 am-cf" role="form">
            <div class="am-input-group am-input-group-sm am-datepicker-date am-u-md-2" data-am-datepicker="{format: 'yyyy-mm-dd', viewMode: 'days'}">
                <input type="text" id="start_date" name="day[]" class="am-form-field" placeholder="{%if !empty($smarty.get.day[0])%}{%$smarty.get.day[0]%}{%else%}上传数据起始日期{%/if%}" value="{%$smarty.get.day[0]%}" readonly>
                <span class="am-input-group-btn am-datepicker-add-on">
                                <button class="am-btn am-btn-default" type="button"><span class="am-icon-calendar"></span></button>
                            </span>
            </div>

            <div class="am-input-group am-input-group-sm am-datepicker-date am-u-md-2" data-am-datepicker="{format: 'yyyy-mm-dd', viewMode: 'days'}">
                <input type="text" id="end_date" name="day[]" class="am-form-field" placeholder="{%if !empty($smarty.get.day[1])%}{%$smarty.get.day[1]%}{%else%}上传数据结束日期{%/if%}" value="{%$smarty.get.day[1]%}" readonly>
                <span class="am-input-group-btn am-datepicker-add-on">
                            <button class="am-btn am-btn-default" type="button"><span class="am-icon-calendar"></span></button>
                        </span>
            </div>

            <div>
                <input type="button" class="am-btn am-btn-secondary am-btn-sm default-form-export-ajax" value="按日期下载"/>
                <input type="button" class="am-btn am-btn-danger am-btn-sm default-form-export-all-ajax" value="下载当前全量数据"/>
            </div>
        </form>
    </div>
</section>
<section class="am-panel am-panel-default am-margin">
    <header class="am-panel-hd">
        <h3 class="am-panel-title">友商报价列表</h3>
    </header>
    <div class="am-panel-bd">
        <form class="am-form am-form-horizontal am-padding-0 am-cf" role="form">
            <div class="am-g">
                <div class="am-form-group am-u-sm-2">
                    <label for="friend_id" class="am-u-sm-2 am-padding-0">友商</label>
                    <select id="friend_id" name="friend_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}">
                        <option value="show_all">请选择友商</option>
                        {%foreach $friendMap as $key=>$value%}
                            <option {%if $smarty.get.friend_id == $key%}selected{%/if%} value="{%$key%}">{%$value%}</option>
                        {%/foreach%}
                    </select>
                </div>

                <div class="am-form-group am-u-sm-2">
                    <label for="brand_id" class="am-u-sm-2 am-padding-0">品牌</label>
                    <select id="brand_id" name="brand_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                </div>

                <div class="am-form-group am-u-sm-2">
                    <label for="model_id" class="am-u-sm-2 am-padding-0">机型</label>
                    <select id="model_id" name="model_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                </div>

                <div class="am-form-group am-u-sm-2">
                    <label for="capacity_id" class="am-u-sm-2 am-padding-0">容量</label>
                    <select id="capacity_id" name="capacity_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                </div>

                <div class="am-form-group am-u-sm-2">
                    <label for="channel_id" class="am-u-sm-2 am-padding-0">渠道</label>
                    <select id="channel_id" name="channel_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                </div>

                <div class="am-form-group am-u-sm-2">
                    <label for="level_id" class="am-u-sm-2 am-padding-0">等级</label>
                    <select id="level_id" name="level_id" class="am-u-sm-10" data-am-selected="{maxHeight: 400, searchBox: -1}"></select>
                </div>
            </div>
            <div class="am-g">
                <div class="am-form-group am-u-sm-10"></div>
                <div class="am-form-group am-u-sm-2">
                    <button id="searchBtn" type="submit" class="am-btn am-btn-primary">搜索</button>
                    <div class="am-u-sm-6 am-md-text-right">
                        <a href="javascript:;" class="am-btn am-btn-success" data-am-modal="{target: '#modal-model-batch-capacity-add', closeViaDimmer: 0}">批量上传</a>
                    </div>
                </div>
            </div>
        </form>

        {%if $list->total() == 0%}
        <p class="no-result">没有符合条件的记录！</p>
        {%else%}
        <table class="am-table am-table-bordered am-table-radius am-table-striped">
            <thead>
            <tr>
                <th>友商</th>
                <th>机型</th>
                <th>容量</th>
                <th>渠道</th>
                <th>等级</th>
                <th>保修状态</th>
                <th>价格</th>
                <th>设置时间</th>
            </tr>
            </thead>

            <tbody>
            {%foreach $list as $item%}
            <tr>
                <td>
                    {%$friendMap[$item.friend_id]%}
                </td>
                <td>
                    {%$item.modelInfo.model_name%}
                </td>
                <td>
                    {%$item.capacityInfo.hs_alias%}
                </td>
                <td>
                    {%$item.channelInfo.hs_alias%}
                </td>
                <td>
                    {%$item.levelInfo.level_name%}
                </td>
                <td>
                    {%$warrantyStatusMap[$item.warranty_status]%}
                </td>
                <td>
                    {%$item.price_yuan%}
                </td>
                <td>
                    {%$item.updated_at%}
                </td>
            </tr>
            {%/foreach%}
            </tbody>
        </table>
        {%$list->render('vendor.pagination.amazeui')|no_escape%}
        {%/if%}
    </div>
</section>
<div class="am-modal am-modal-prompt" tabindex="-1" id="modal-model-batch-capacity-add">
    <div class="am-modal-dialog">
        <div class="am-modal-hd">报价批量修改</div>
        <hr data-am-widget="divider" style="" class="am-divider am-divider-default"/>
        <div class="am-modal-bd">
            <div class="am-padding-bottom">
                <a class="am-btn am-btn-default" href="/resource/other/bad_friend_price_template.xlsx?v=20190702" target="_blank">模板下载</a>
            </div>
            <div class="am-panel am-panel-default">
                <div class="am-panel-bd">
                    <div class="am-input-group am-input-group-sm am-datepicker-date am-u-md-6" data-am-datepicker="{format: 'yyyy-mm-dd', viewMode: 'days'}">
                        <input type="text" id="upload_date" name="upload_date" class="am-form-field" placeholder="请填写上传日期" value="" readonly>
                        <span class="am-input-group-btn am-datepicker-add-on">
                                <button class="am-btn am-btn-default" type="button"><span class="am-icon-calendar"></span></button>
                            </span>
                    </div>
                    <div class="am-form-group am-form-file">
                        <button type="button" class="am-btn am-btn-danger am-btn-sm">
                            <i class="am-icon-cloud-upload"></i> 选择要上传的文件
                        </button>
                        <form id="batchCapacityForm" enctype="multipart/form-data">
                            <input id="batchCapacityAddFile" type="file" name="files[]" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
">
                        </form>
                    </div>
                    <div id="batchCapacityFileList"></div>
                </div>
            </div>
            <div class="am-margin-vertical">
                <button id="batchCapacitySubmit" type="button" class="am-btn am-btn-success">上传</button>
            </div>
        </div>
        <div class="am-modal-footer">
            <span class="am-modal-btn" data-am-modal-cancel>关闭</span>
        </div>
    </div>
</div>
{%/block%}

{%block name="block_js" append%}
<script type="text/javascript">

    var exportUrl = '/hsmm/downloadBadriendPriceHistory';
    var exportAllUrl = '/hsmm/downloadBadriendPrice';

    function buttonExportAllFormAjax(submitButton) {
        var $form = $(submitButton).closest('form');
        var action = '';
        var params = '';
        if (typeof exportAllUrl != 'undefined' && exportAllUrl) {
            action = exportAllUrl;
            params = $form.serialize();
        } else {
            action = $form.attr('action');
            params = $form.serialize() + '&export=1';
        }
        submitForm(action, params);
    }

    $('.default-form-export-all-ajax').on('click', function (e) {
        e.preventDefault();
        let $buttonExportForm = $(this);
        disabledSubmitButton($buttonExportForm);
        buttonExportAllFormAjax($buttonExportForm);
    });

    $(function () {
        var __modelList__ = {}    // 机型列表
        var __capacityList__ = {}    // 容量列表
        var __channelList__ = {}    // 容量列表
        var __brand_id = {%json_encode($smarty.get.brand_id|default:'show_all')%}
        var __model_id = {%json_encode($smarty.get.model_id|default:'show_all')%}
        var __capacity_id = {%json_encode($smarty.get.capacity_id|default:'show_all')%}
        var __channel_id = {%json_encode($smarty.get.channel_id|default:'show_all')%}
        var __level_id = {%json_encode($smarty.get.level_id|default:'show_all')%}

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

        // 获取渠道
        function getHuishouChannelListByModel(model_id, callback) {
            $.ajax({
                url: '/hsmm/getHuishouChannelListByModel',
                data: {
                    model_id: model_id
                },
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (res.errno === 0) {
                        __channelList__[model_id] = res.result    // 缓存请求数据

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
                        if (__level_id == v.id) {
                            _html_str += '<option selected value="' + v.id + '">' + v.level_name + '</option>'
                        } else {
                            _html_str += '<option value="' + v.id + '">' + v.level_name + '</option>'
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
                    } else {
                        _html_str += '<option value="' + i + '">' + v + '</option>'
                    }
                })

                $ele_brand.html(_html_str)
            }
        }

        // 渲染渠道
        function initchannel(res) {
            var $ele_brand = $('#channel_id')
            var _html_str = '<option value="show_all">请选择渠道</option>'
            if (!$.isEmptyObject(res)) {
                $.each(res, function (i, v) {
                    if (__channel_id == i) {
                        _html_str += '<option selected value="' + i + '">' + v + '</option>'
                    } else {
                        _html_str += '<option value="' + i + '">' + v + '</option>'
                    }
                })

                $ele_brand.html(_html_str)
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
        function modelChangeCapacityEvent(val) {
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

        // 机型列表改变事件
        function modelChangeChannelEvent(val) {
            var _select_val = parseInt(val)
            var _channel_data = {}

            if (!Number.isNaN(_select_val)) {
                // 这里做下判断,看是否有已经缓存的容量数据
                _channel_data = __channelList__[_select_val]

                if (typeof _channel_data === 'undefined') {
                    getHuishouChannelListByModel(_select_val, initchannel)
                } else {
                    initchannel(_channel_data)
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
                modelChangeCapacityEvent(_this.val());
                modelChangeChannelEvent(_this.val());
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
            bindEventBrand()
            bindEventModel()
            uploadFileEvent()
        }

        init()

    });

</script>
{%/block%}