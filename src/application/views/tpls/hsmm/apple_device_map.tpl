{%extends file="layout/base_hsmer.tpl"%}

{%block name="block_css" append%}
{%/block%}

{%block name="body_ext"%} class="page-shiyong"{%/block%}

{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf"><strong class="am-text-primary am-text-lg">苹果设备SN映射</strong> /
            <small>苹果设备SN映射</small>
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
                    <select name="category_id" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '100%'}">
                        <option value="1" {%if $smarty.get['category_id'] == '1' %}selected{%/if%}>手机</option>
                        <option value="2" {%if $smarty.get['category_id'] == '2' %}selected{%/if%}>平板</option>
                    </select>
                </div>
                <div class="am-form-group am-u-sm-2">
                    <input type="text" class='am-form-field am-input-sm' name='sn' id='sn' value='{%$smarty.get.sn%}' placeholder="SN码"/>
                </div>
                <div class="am-form-group am-u-sm-2">
                    <input type="text" class='am-form-field am-input-sm' name='identifier' id='identifier' value='{%$smarty.get.identifier%}' placeholder="苹果设备标识符"/>
                </div>
                <div class="am-form-group am-u-sm-2">
                    <input type="text" class='am-form-field am-input-sm' name='model_id' id='model_id' value='{%$smarty.get.model_id%}' placeholder="机型ID搜索"/>
                </div>
                <div class="am-form-group am-u-sm-2">
                    <button id="searchBtn" type="submit" class="am-btn am-btn-primary">搜索</button>
                </div>
                <div class="am-form-group am-u-sm-2">
                    <button data-am-modal="{target: '#modal-model-add', closeViaDimmer: 0}" type="button" class="am-btn am-btn-success">添加SN映射</button>
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
                        <th>SN</th>
                        <th>苹果设备标识符</th>
                        <th>机型ID</th>
                        <th>机型名</th>
                        <th>容量</th>
                        <th>颜色</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {%foreach $model_map as $key => $val%}
                        <tr>
                            <td>{%$val->sn%}</td>
                            <td>{%$val->identifier%}</td>
                            <td>{%$val->model_id%}</td>
                            <td>{%$hs_ios_model_map[$val->model_id]%}</td>
                            <td>{%$capacity_map[$val->capacity_id]%}</td>
                            <td>{%$color_map[$val->color_id]%}</td>
                            <td>
                                <button data-apple_device_id="{%$val->id%}" type="button" class="am-btn am-btn-success delete_model_map">删除</button>
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
            <form method="post" action="/hsmm/doAddAppleDeviceMap/">
                <div class="am-modal-hd">添加SN映射</div>
                <div class="am-modal-bd">
                    <select id="category" name="category" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '80%'}">
                        <option value="0" selected >选择品类</option>
                        <option value="1" >手机</option>
                        <option value="2" >平板</option>
                    </select>
                    <input name="sn" placeholder="SN码" type="input" class="am-modal-prompt-input"/>
                    <input name="identifier" placeholder="苹果设备标识符" type="input" class="am-modal-prompt-input"/>
                    <input name="model_id" placeholder="同城帮机型ID" type="input" class="am-modal-prompt-input"/>
                    <select id="capacity_id" name="capacity_id" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '80%'}"></select>
                    <select id="color_id" name="color_id" data-am-selected="{btnSize: 'sm', searchBox: 1, maxHeight: 300, btnWidth: '80%'}"></select>
                </div>
                <div class="am-modal-footer">
                    <span class="am-modal-btn" data-am-modal-cancel>取消</span>
                    <span class="am-modal-btn from-submit" data-am-modal-confirm>提交</span>
                </div>
            </form>
        </div>
    </div>

    <div class="am-modal am-modal-prompt" tabindex="-1" id="modal-sku-add">

</div>
{%/block%}

{%block name="block_js" append%}
    <script type="text/javascript">

        var __capacityColorList__ = {}    // 容量颜色列表

        $('.delete_model_map').on('click', function () {

            var apple_device_id = $(this).data("apple_device_id");

            delModelMap(apple_device_id)
        });

        function delModelMap(apple_device_id) {
            $.ajax({
                url: '/hsmm/doDelAppleDeviceMap/',
                async: true,
                data: {
                    apple_device_id: +apple_device_id,
                },
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (!res['errno']) {
                        newAlert('success', '处理成功', '删除成功', function () {
                            window.location.reload();
                        });
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
                            newAlert('success', 'SN映射管理', '操作成功<br/>' + res.errmsg, function () {
                                window.location.reload();
                            });
                        } else {
                            newAlert('wrong', 'SN映射管理', '操作失败<br/>' + res.errmsg);
                        }
                    },
                    error: function (res) {
                        newAlert('wrong', 'SN映射管理', '请求失败,请重试');
                    }
                });
            });
        });

        // 品类事件绑定
        function bindEventCategory() {
            $('#category').on('change', function (e) {
                var _this = $(this)
                categoryChangeCategory(_this.val())
            })
        }

        // 品类改变事件
        function categoryChangeCategory(val) {
            var _select_val = parseInt(val)
            if(_select_val == 0){
                alert("请选择品类");
            }
            var _capacityColorData = {}

            if (!Number.isNaN(_select_val)) {
                // 这里做下判断,看是否有已经缓存的机型数据
                _capacityColorData = __capacityColorList__

                if (typeof _capacityData === 'undefined') {
                    getCapacityColor(_select_val, initcapacity)
                    getCapacityColor(_select_val, initcolor)
                } else {
                    initcapacity(_capacityColorData)
                    initcolor(_capacityColorData)
                }
            }
        }

        // 渲染容量
        function initcapacity(res) {
            res = res.capacityMap;
            var $ele_brand = $('#capacity_id')
            var _html_str = '<option value="show_all">请选择容量</option>'
            if (!$.isEmptyObject(res)) {
                $.each(res, function (i, v) {
                    _html_str += '<option value="' + i + '">' + v + '</option>'
                })

                $ele_brand.html(_html_str)
            }
        }

        // 渲染颜色
        function initcolor(res) {
            res = res.colorMap;
            var $ele_brand = $('#color_id')
            var _html_str = '<option value="show_all">请选择颜色</option>'
            if (!$.isEmptyObject(res)) {
                $.each(res, function (i, v) {
                    _html_str += '<option value="' + i + '">' + v + '</option>'
                })

                $ele_brand.html(_html_str)
            }
        }


        // 获取机型
        function getCapacityColor(category_id, callback) {
            $.ajax({
                url: '/hsmm/doGetAppleDeviceCapacityColor',
                data: {
                    category_id: category_id,
                },
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (res.errno === 0) {
                        __capacityColorList__ = res.result    // 缓存请求数据

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

        bindEventCategory();
    </script>
{%/block%}