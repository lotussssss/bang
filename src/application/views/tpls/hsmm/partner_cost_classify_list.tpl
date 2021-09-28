{%extends file="layout/base_hsmer.tpl"%}
{%block name="block_title"%}合作方成本结构{%/block%}
{%block name="block_css" append%}
    <link rel="stylesheet" href="/resource/other/assets/global/plugins/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet"
          href="/resource/other/assets/global/plugins/bootstrap-editable/bootstrap-editable/css/bootstrap-editable.css">
    <link rel="stylesheet" href="/resource/other/assets/global/plugins/bootstrap-toastr/toastr.min.css">
    <style>
        #editTable .table-title-tr th:nth-child(4) {
            width: 12% !important;
        }

        #editTable .table-empty {
            font-style: normal;
            border-bottom-color: #b0b0b0;
            color: #b0b0b0;
        }
    </style>
{%/block%}
{%* 声明一个变量,存放filed_id及对应的filed_type *%}
{%$_tmpFieldMap=array()%}
{%block name="block_body"%}
    <div class="am-cf am-padding">
        <div class="am-fl am-cf">
            <strong class="am-text-primary am-text-lg">合作方成本</strong>
            /
            <b>合作方成本结构</b>
        </div>
    </div>
    <hr>
    <section class="am-margin">
        <table id="editTable" class="am-table am-table-bordered am-table-centered" style="width: 70%">

            <tr class="table-title-tr">
                <th class="am-primary" style="width: 20%;color: black;">成本结构【渠道分类名称】</th>
                <th class="am-primary" style="width: 60%;color: black;">成本结构【渠道分类等级描述】</th>
                <th class="am-primary" style="width: 20%;color: black;">设置【成本结构】</th>
            </tr>

            {%foreach $cost_type_list as $rateTypeId => $rateTypeName%}
                <tr>
                    <td>{%$rateTypeName%}</td>
                    <td style="text-align: left;">{%$desc_list[$rateTypeId]%}</td>
                    <td><a href="/hsmm/partnerCost?rate_type={%$rateTypeId%}">去设置</a></td>
                </tr>
            {%/foreach%}

        </table>
    </section>
{%/block%}

{%block name="block_js" append%}
    <script src="/resource/other/assets/global/plugins/bootstrap/js/bootstrap.min.js"></script>
    <script src="/resource/other/assets/global/plugins/bootstrap-editable/bootstrap-editable/js/bootstrap-editable.js"></script>
    <script src="/resource/other/assets/global/plugins/bootstrap-toastr/toastr.min.js"></script>
    <script>
        // 自定义编辑弹窗
        (function ($) {
            "use strict";

            var Customer = function (options) {
                this.init('customer', options, Customer.defaults);
            };

            //inherit from Abstract input
            $.fn.editableutils.inherit(Customer, $.fn.editabletypes.abstractinput);

            $.extend(Customer.prototype, {
                /**
                 Renders input from tpl

                 @method render()
                 **/
                render: function () {
                    this.$input = this.$tpl.find('input');
                    this.$select = this.$tpl.find('select');
                },

                /**
                 Default method to show value in element. Can be overwritten by display option.

                 @method value2html(value, element)
                 **/
                value2html: function (value, element) {
                    if (!value) {
                        $(element).empty();
                        return;
                    }
                    var html = $('<div>').text(value.costValue).html() + ', ' + $('<div>').text(value.costValueType).html();
                    $(element).html(html);
                },

                /**
                 Gets value from element's html

                 @method html2value(html)
                 **/
                html2value: function (html) {
                    /*
                      you may write parsing method to get value by element's html
                      e.g. "Moscow, st. Lenina, bld. 15" => {city: "Moscow", street: "Lenina", building: "15"}
                      but for complex structures it's not recommended.
                      Better set value directly via javascript, e.g.
                      editable({
                          value: {
                              city: "Moscow",
                              street: "Lenina",
                              building: "15"
                          }
                      });
                    */
                    return {
                        costValueType: 0,
                        costValue: html
                    };
                },

                /**
                 Converts value to string.
                 It is used in internal comparing (not for sending to server).

                 @method value2str(value)
                 **/
                value2str: function (value) {
                    var str = '';
                    if (value) {
                        for (var k in value) {
                            str = str + k + ':' + value[k] + ';';
                        }
                    }
                    return str;
                },

                /*
                 Converts string to value. Used for reading value from 'data-value' attribute.

                 @method str2value(str)
                */
                str2value: function (str) {
                    /*
                    this is mainly for parsing value defined in data-value attribute.
                    If you will always set value by javascript, no need to overwrite it
                    */
                    return str;
                },

                /**
                 Sets value of input.

                 @method value2input(value)
                 @param {mixed} value
                 **/
                value2input: function (value) {
                    if (!value) {
                        return;
                    }
                    this.$input.filter('[name="cost_value"]').val(value.costValue);
                    this.$select.filter('[name="cost_value_type"]').val(value.costValueType);
                },

                /**
                 Returns value of input.

                 @method input2value()
                 **/
                input2value: function () {
                    return {
                        costValue: this.$input.filter('[name="cost_value"]').val(),
                        costValueType: this.$select.filter('[name="cost_value_type"]').val()
                    };
                },

                /**
                 Activates input: sets focus on the first field.

                 @method activate()
                 **/
                activate: function () {
                    this.$input.filter('[name="cost_value"]').focus();
                },

                /**
                 Attaches handler to submit form in case of 'showbuttons=false' mode

                 @method autosubmit()
                 **/
                autosubmit: function () {
                    this.$input.keydown(function (e) {
                        if (e.which === 13) {
                            $(this).closest('form').submit();
                        }
                    });
                }
            });

            Customer.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
                tpl: '<div class="editable-cost-value"><label><span>数值: </span><input type="text" name="cost_value" class="form-control input-small"></label></div>' +
                    '<div class="editable-cost-value-type"><label><span>类型: </span><select name="cost_value_type" class="form-control input-mini"><option value="0">价格(元)</option><option value="1">百分比(%)</option></select></label></div>',

                inputclass: ''
            });

            $.fn.editabletypes.customer = Customer;

        }(window.jQuery));
    </script>
    <script type="text/javascript">
        $(function () {

            /**
             * 校验数值
             * @param val
             * @returns {boolean}   校验通过,返回 false , 不通过返回 true
             */
            function checkVal (val) {
                var _tmp = Number(val)
                return (isNaN(_tmp) || _tmp < 0)
            }

            // 初始化编辑表格(普通编辑表格)
            $('#editTable td a.edit-normal').editable({
                type: 'text',
                disabled: false,
                emptytext: '添加数据',
                emptyclass: 'table-empty',
                mode: 'popup',
                placement: 'left',
                validate: function (v) {
                    if (checkVal(v)) {
                        return '请输入非负数'
                    }
                },
                display: function (value) {
                    var _field_type = Number.parseInt($(this).attr('data-cost_value_type'))
                    var _val = Number(value)
                    // 判断一下类型,对应的末尾是否追加%
                    if (!checkVal(_val) && _field_type === 1) {
                        $(this).text(_val + '%');
                    } else {
                        $(this).text(_val)
                    }
                },
                success: function (data, value) {
                    var _val = Number(value)
                    var _data = {}
                    if (!checkVal(_val)) {
                        _data['pattern_tab_id'] = $(this).attr('data-pattern_tab_id')
                        _data['partner_id'] = $(this).attr('data-partner_id')
                        _data['field_id'] = $(this).attr('data-field_id')
                        _data['cost_value_type'] = $(this).attr('data-cost_value_type')
                        _data['cost_value'] = _val

                        // 请求更新数据
                        handleUpPartnerCost(_data, function () {
                            window.location.reload()
                        })
                    }
                }
            })

            // 初始化编辑表格(带选择数据类型)
            $('#editTable td a.edit-choice-type').editable({
                type: 'customer',
                disabled: false,
                emptytext: '添加数据',
                emptyclass: 'table-empty',
                mode: 'popup',
                placement: 'left',
                validate: function (v) {
                    var _val = v['costValue'] || ''
                    if (checkVal(_val)) {
                        return '请输入非负整数'
                    }
                },
                display: function (value) {
                    var _valData = value || {}
                    var _field_type = $(this).attr('data-cost_value_type')
                    var _val = Number(_valData['costValue'])
                    // 判断一下类型,对应的末尾是否追加%
                    if (!checkVal(_val) && Number.parseInt(_field_type) === 1) {
                        $(this).text(_val + '%');
                    } else {
                        $(this).text(_val)
                    }
                },
                success: function (data, value) {
                    var _valData = value || {}
                    var _val = Number(_valData['costValue'])
                    var _data = {}
                    if (!checkVal(_val)) {
                        _data['pattern_tab_id'] = $(this).attr('data-pattern_tab_id')
                        _data['partner_id'] = $(this).attr('data-partner_id')
                        _data['field_id'] = $(this).attr('data-field_id')
                        _data['cost_value_type'] = _valData['costValueType']
                        _data['cost_value'] = _val

                        // 提交数据前,修改标签data数据
                        $(this).attr('data-cost_value_type', _valData['costValueType'])

                        // 请求更新数据
                        handleUpPartnerCost(_data, function () {
                            window.location.reload()
                        })
                    }
                }
            }).on('shown', function (e, editable) {
                var _this = $(this)
                var _type = _this.attr('data-cost_value_type')

                // 判断一下,如果默认是未选择,则默认给初始值为第一个
                if (Number.parseInt(_type) === 2) {
                    editable.input.$select.val(0);
                } else {
                    editable.input.$select.val(_type);
                }
            });

            // 更新数据
            function handleUpPartnerCost (data, success, err) {
                $.ajax({
                    url: '/hsmm/upPartnerCost ',
                    data: data,
                    dataType: 'json',
                    type: 'POST',
                    success: function (res) {
                        if (res.errno === 0) {
                            toastr.success('提交成功!')
                            if (typeof success === 'function') {
                                success(res.result)
                            }
                        } else {

                            toastr.error('操作失败<br/>' + res.errmsg)
                            if (typeof err === 'function') {
                                err(res)
                            }
                        }
                    },
                    error: function (res) {
                        toastr.error('请求失败,请重试<br/>' + res.errmsg)
                        if (typeof err === 'function') {
                            err(res)
                        }
                    }
                })
            }

        });

    </script>
{%/block%}