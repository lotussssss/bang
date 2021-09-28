{%extends file="layout/base_hsmer.tpl"%}
{%block name="block_title"%}价位段净利额调整{%/block%}
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
            <b>【价位区间/净利金额】调整</b>
        </div>
    </div>
    <div class="am-cf am-padding">
        <div>
            <strong><font size="5">价格反哺模式：{%$pattern_id_name_map[$tab_id]%}</font></strong>
        </div>
        <div>
            <strong><font size="5">子模式名称：{%$group_pattern_tab_map[$tab_id][$partner_id]%}&nbsp;({%$partner_id%})</font></strong>
        </div>
        <div>
            &nbsp;
        </div>
        <div>
            <a href="/hsmm/doEditSegmentPrice?pattern_tab={%$tab_id%}&partner_id={%$partner_id%}"
               class="am-btn am-btn-success"
               id="import_btn" >【价位区间/净利金额】设置</a>
        </div>
    </div>
    <hr>
    <section class="am-margin">
        <table id="editTable" class="am-table am-table-bordered am-table-striped am-table-centered" style="width: 50%">
            <tr class="table-title-tr">
                <th style="width: 100px;">序号</th>
                <th style="width: 100px;">价位段（单位：元）<br/>(左：大于等于，右：小于)</th>
                <th style="width: 100px;">净利额（单位：元）</th>
            </tr>
            {%*{%foreach $netprofit_list as $netprofitItem%}*%}
            {%foreach from=$netprofit_list key=myId item=netprofit_item name=myNumber%}
                <tr>
                    {%*<td>{%netprofit_item['segment_title']%}</td>*%}
                    <td>{%$smarty.foreach.myNumber.iteration%}</td>
                    <td>
                        {%if $smarty.foreach.myNumber.last eq '1'%}
                            {%$netprofit_item['min_price']|fen2yuan%}元&nbsp;以上
                        {%else%}
                            {%$netprofit_item['min_price']|fen2yuan%}元&nbsp;至&nbsp;{%$netprofit_item['max_price']|fen2yuan%}元
                        {%/if%}

                    </td>
                    <td>
                        <a class="edit-choice-type" href="javascript:;"
                           data-id="{%$netprofit_item['id']%}"
                           data-tab="{%$netprofit_item['pattern_tab']%}"
                           data-partner="{%$netprofit_item['partner_id']%}">{%$netprofit_item['netprofit']|fen2yuan%}</a>
                    </td>
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
                    var html = $('<div>').text(value.netprofitValue).html();
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
                        netprofitValue: html
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
                    this.$input.filter('[name="netprofit_value"]').val(value.netprofitValue);
                },

                /**
                 Returns value of input.

                 @method input2value()
                 **/
                input2value: function () {
                    return {
                        netprofitValue: this.$input.filter('[name="netprofit_value"]').val()
                    };
                },

                /**
                 Activates input: sets focus on the first field.

                 @method activate()
                 **/
                activate: function () {
                    this.$input.filter('[name="netprofit_value"]').focus();
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
                tpl: '<div class="editable-cost-value"><label><span>数值: </span><input type="text" name="netprofit_value" class="form-control input-small"></label></div>',

                inputclass: ''
            });

            $.fn.editabletypes.customer = Customer;

        }(window.jQuery));


        $(".edit_segment_price").on('click', function () {

            window.open('/hsmm/doEditSegmentPrice');

        });
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
                    var _val = Number(value)
                },
                success: function (data, value) {
                    var _val = Number(value)
                    var _data = {}
                    if (!checkVal(_val)) {
                        _data['segment_id'] = $(this).attr('data-id'),
                        _data['netprofit_value'] = _val

                        // 请求更新数据
                        handleUpSegmentNetprofit(_data, function () {
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
                    var _val = v['netprofitValue'] || ''
                    if (checkVal(_val)) {
                        return '请输入非负数（小数2位）'
                    }
                    var _tmpNum = Number(_val);
                    if(_tmpNum > 1000){
                        return '净利金额过大'
                    }
                },
                display: function (value) {
                    var _valData = value || {}
                    var _val = Number(_valData['netprofitValue'])
                },
                success: function (data, value) {
                    var _valData = value || {}
                    var _val = Number(_valData['netprofitValue'])
                    var _data = {}
                    if (!checkVal(_val)) {
                        _data['segment_id']  = $(this).attr('data-id'),
                        _data['pattern_tab'] = $(this).attr('data-tab'),
                        _data['partner_id']  = $(this).attr('data-partner'),
                        _data['netprofit_value'] = _val

                        // 请求更新数据
                        handleUpSegmentNetprofit(_data, function () {
                            window.location.reload()
                        })
                    }
                }
            }).on('shown', function (e, editable) {
                var _this = $(this)
            });

            // 更新数据
            function handleUpSegmentNetprofit (data, success, err) {
                $.ajax({
                    url: '/hsmm/upPriceSegmentNetprofit',
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