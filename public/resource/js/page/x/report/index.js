$(function () {
    var __company_id = window.COMPANY_ID,
        __company_name = window.COMPANY_NAME,
        __company_info = null,
        __tab_type = window.TAB_TYPE,
        // 订单--列表参数
        __order_params = {},
        // 信用订单--列表参数
        __order_params_credit = {},
        // 一站换新订单--列表参数
        __order_params_suning_one_stop = {},
        __order_status_map = {},
        __order_status_map_credit = {},
        __page_width,
        //将ID保存在数组，用于判断是否继续请求
        __arr=[],
        //获取下级列表的ID
        parameterId =null,
        //获取下级列表的签名
        parameterSign =null,
        //获取下级列表的数组
        parameterSignObj = {}

    var __$ReportTarget = $('.report-target')

    // 时间范围
    var ReportDaterange = function () {
        return {
            initReportDaterange: function () {
                if(!$.fn.daterangepicker){
                    return
                }

                var dataRangePickerParams = {
                    ranges: {
                        "今天": [moment(), moment()],
                        "昨天": [moment().subtract(1,"days"), moment().subtract(1,"days")],
                        "过去七天": [moment().subtract(6,"days"), moment()],
                        "最近30天": [moment().subtract(29,"days"), moment()],
                        "这个月": [moment().startOf("month"), moment().endOf("month")],
                        "上个月": [moment().subtract(1,"month").startOf("month"), moment().subtract(1,"month").endOf("month")]
                    },
                    locale: {
                        format: "YYYY年MM月DD日",
                        separator: " - ",
                        applyLabel: "确定",
                        cancelLabel: "取消",
                        fromLabel: "从",
                        toLabel: "到",
                        customRangeLabel: "自定义区间",
                        daysOfWeek: ["日", "一", "二", "三", "四", "五", "六"],
                        monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                        firstDay: 1
                    },
                    opens: "right",
                    //autoApply : true,
                    autoUpdateInput:true
                }

                var $ReportDateRange = $('#report-date-range')

                $ReportDateRange.daterangepicker(dataRangePickerParams, function (start, end, label) {
                    if("0" != $ReportDateRange.attr("data-display-range")){
                        $ReportDateRange.find('span').html(start.format("YYYY年MM月DD日") + " - " + end.format("YYYY年MM月DD日"))
                    }
                })

                $ReportDateRange.show()
            },
            initReportDateEvent: function () {
                var js_report_startdate = moment(),
                    js_report_enddate = moment()

                var $ReportDateRange = $('#report-date-range')

                //处理cookie
                if(Cookies&&Cookies.get("report_startDate")){
                    js_report_startdate = moment(Cookies.get("report_startDate"))
                    $ReportDateRange.data('daterangepicker').setStartDate(Cookies.get("report_startDate"))
                }
                if(Cookies&&Cookies.get("report_endDate")){
                    js_report_enddate = moment(Cookies.get("report_endDate"))
                    $ReportDateRange.data('daterangepicker').setEndDate(Cookies.get("report_endDate"))
                }

                //处理事件
                $ReportDateRange.on('apply.daterangepicker', function(ev, picker) {
                    if (!(js_report_startdate.format("YYYYMMDD") == moment(picker.startDate).format("YYYYMMDD")
                        && js_report_enddate.format("YYYYMMDD") == moment(picker.endDate).format("YYYYMMDD"))) {

                        //有变化，写cookie并刷新页面
                        Cookies && Cookies.set("report_startDate", picker.startDate.format('YYYY-MM-DD'))
                        Cookies && Cookies.set("report_endDate", picker.endDate.format('YYYY-MM-DD'))

                        //如果是今天，则清空cookie
                        if (moment().format('YYYY-MM-DD') == picker.startDate.format('YYYY-MM-DD')) {
                            Cookies && Cookies.set("report_startDate", '')
                        }
                        if (moment().format('YYYY-MM-DD') == picker.endDate.format('YYYY-MM-DD')) {
                            Cookies && Cookies.set("report_endDate", '')
                        }

                        js_report_startdate = moment(picker.startDate)
                        js_report_enddate = moment(picker.endDate)

                        //更新页面即可
                        uiUpdateMainContent()
                        // window.location.reload()
                    }
                })

                $ReportDateRange.find('span').html(moment(js_report_startdate).format("YYYY年MM月DD日") + " - " + moment(js_report_enddate).format("YYYY年MM月DD日"))
            },
            init: function () {
                this.initReportDaterange()
                this.initReportDateEvent()
            }
        }
    }()

    // 生成左侧树形分支机构html
    function generateGroupTreeHtml(data, is_root, group_id) {
        data = data || {}
        var class_ul = is_root ? 'jstree-container-ul jstree-children jstree-no-icons' : 'jstree-children'
        var html_st = ''
        html_st += '<ul class="' + class_ul + '" role="group">'
        for (var i in data) {
            // if (data[i] && data[i]['info']) {
            //     html_st += '<li>'
            //     html_st += '<a href=" " data-id="' + i + '">'
            //     html_st += '<span title="' + data[i]['info']['name'] + '">' + data[i]['info']['display_name'] + '</span>'
            //     html_st += '</a >'
            //     html_st += generateGroupTreeHtml(data[i]['nodes'], false, group_id)
            //     html_st += '</li>'
            // }

        //    -----------  new ---------------
            if (data[i] && data[i]['id']) {
                html_st += '<li>'
                html_st += '<a href=" " data-id="' + data[i]['id'] + '">'
                html_st += '<span title="' + data[i]['name'] + '">' + data[i]['display_name'] + '</span>'
                html_st += '</a >'
                // html_st += generateGroupTreeHtml(data[i]['nodes'], false, group_id)
                html_st += '</li>'
            }

        }
        html_st += '</ul>'
        return html_st
    }

    // 获取树形分支机构数据
    function getTreeData(callback,parameter) {
        if(!parameter){
            parameter = {}
        }
        $.ajax({
            type: 'GET',
            url: '/x/getTree',
            data:parameter,
            dataType: 'json',
            success: function (res) {
                if (res.errno) {
                    return
                }
                $.isFunction(callback) && callback(res.result.data,res.result.sign)
            }
        })
    }

    // 初始化树形分支机构
    function initTree(callback) {

        getTreeData(function (data,signObj) {
            Object.assign(parameterSignObj,signObj)
            // parameterSignObj = signObj
            var $Tree = $('#company_tree')

            $Tree.show()
            $Tree.html(generateGroupTreeHtml(data, true))
            // $Tree.html(generateGroupTreeHtml(data_1, true))
            $Tree.jstree({
                core: {themes: {responsive: !1},check_callback: true},
                types: {
                    "default": {icon: "fa fa-folder icon-state-warning"},
                    file: {icon: "fa fa-file icon-state-warning"}
                },
                plugins: ["types"]
            })
            var treeInst = $Tree.jstree(true)
            parameterId = data[0]['id']
            __company_name = data[0]['display_name']
            $Tree.on("select_node.jstree", function (e, data) {
                // treeInst.open_node(data.node)
                //
                var $node = $("#" + data.selected).find('a')
                //
                // __company_id = $node.attr('data-id')
                // __company_name = $node.find('span').attr('title')
                // __order_params = {}
                // __order_params_credit = {}
                // __order_params_suning_one_stop = {}
                //
                // uiUpdateMainContent()
                //
                // scrollToTop()
//------------------------------------
                parameterId = $node.attr('data-id') ? $node.attr('data-id') : data.selected[0]
                parameterSign = parameterSignObj[parameterId]
                //-------------------------------------
                if(__arr.indexOf(parameterId) == '-1'){
                    //    --------------------------------------new --------------------

                    getTreeData(function (nextData,nextSignObj) {
                            if(nextData && nextData.length>0){
                                Object.assign(parameterSignObj,nextSignObj)
                                for(j in nextData){
                                    $Tree.jstree('create_node', $('#'+data.selected[0]), { "text":nextData[j]['display_name'], "id":nextData[j]['id']}, 'last', false, false);
                                }
                                __arr.push(parameterId)
                                treeInst.open_node(data.node,function () {
                                })
                            }
                    },{company_id : parameterId,sign : parameterSign })
                }
                // treeInst.open_node(data.node,function () {
                //     console.log('打开了节点。。。')
                // })

                // var $node = $("#" + data.selected).find('a')

                __company_id = $node.attr('data-id') ? $node.attr('data-id') :data.selected[0]
                __company_name = $node.find('span').attr('title')? $node.find('span').attr('title') :data.node.text
                __order_params = {}
                __order_params_credit = {}
                __order_params_suning_one_stop = {}

                uiUpdateMainContent()

                scrollToTop()

            })
            treeInst.hide_icons()
            // if (__company_id==='') {
            //     $.each(data, function (k) {
            //         if (__company_id) return false
            //         __company_id = k
            //     })
            // }
            // var $Li = $Tree.find('[data-id="' + __company_id + '"]').closest('li')
            // treeInst.select_node($Li.attr('id'))

            if ($('body').width() > 991) {
                treeInst.open_node(treeInst.get_json())
            }

            $.isFunction(callback) && callback()
        })
    }

    function bindEvent() {
        // 切换tab
        $('.nav-tab-target').on('click', 'a', function (e) {
            e.preventDefault()

            var $me = $(this),
                $li = $me.closest('li')

            if ($li.hasClass('active')) {
                return
            }

            __tab_type = $me.attr('data-type')
            __order_params.page = 0
            __order_params_suning_one_stop.page = 0

            uiUpdateMainContent()
        })
    }

    // 更新右侧内容
    function uiUpdateMainContent() {
        loadingStart()

        renderNavTabs()

        switch (__tab_type) {
            case 'summary':
                renderSummaryData()
                break
            case 'orderlist':
                renderOrderListData()
                break
            case 'creditOrderlist':
                renderCreditOrderListData()
                break
            case 'toStoreOrderlist':
                renderToStoreOrderListData()
                break
            case 'toStoreIgnoreBaoXiaoOrderlist':
                renderToStoreOrderListData(1)
                break
            case 'goldEngineerOrderlist':
                renderGoldEngineerOrderListData()
                break
            case 'suningOneStopOrderList':
                renderSuningOneStopOrderListData()
                break
            case 'jiangsuMobileOrderList':
                renderJiangsuMobileOrderListData()
                break
            case 'checkOutOrderList':
                renderCheckOutOrderListData()
                break
        }
    }

    // 输出tab信息
    function renderNavTabs() {
        renderHtml({
            $tpl: $('#JsXReportNavTabTpl'),
            $target: $('.nav-tab-target'),
            data: {
                type: __tab_type,
                companyId: __company_id,
                companyName: __company_name
            }
        })
    }

    // 获取下属分支机构信息
    function getCompanyData(callback) {
        if (__company_info) {
            typeof callback == 'function' && callback(__company_info)
        } else {
            $.get('/x/companyInfo', function (res) {
                res = $.parseJSON(res)

                if (!res['errno'] && res['result']) {
                    __company_info = res['result']
                    typeof callback == 'function' && callback(res['result'])
                }
            })
        }
    }

    // 输出数据汇总
    function renderSummaryData() {
        var _parameterID = __company_id ? __company_id : parameterId
        $.get('/x/getFastInlet', {
            company_id: _parameterID
        }, function (res) {
            res = $.parseJSON(res)

            loadingDone()
            if (!res['errno']) {

                var report = res['result']['report'],
                    engineerInfo = res['result']['engineerInfo'],
                    yongjinRecord = res['result']['yongjinRecord'],
                    isSnChannel = res['result']['isSnChannel']
                // getCompanyData(function (company_info) {
                //     renderHtml({
                //         $tpl: $('#JsXReportSummaryTpl'),
                //         $target: __$ReportTarget,
                //         data: {
                //             totalReport : report['info']['statistic_content'],
                //             yongjinRecord : yongjinRecord,
                //             companyId : __company_id,
                //             updateTime : report['updateTime'],
                //             isSnChannel : isSnChannel
                //
                //         }
                //     })
                //     if(engineerInfo && !$.isEmptyObject(engineerInfo)){
                //         renderHtml({
                //             is_append: true,
                //             $tpl: $('#JsXReportXXGTpl'),
                //             $target: __$ReportTarget,
                //             data: {
                //                 engineerInfo: engineerInfo,
                //                 companyReport: report['list']
                //             }
                //         })
                //     }else {
                //         renderHtml({
                //             is_append: true,
                //             $tpl: $('#JsXReportCompanyListTpl'),
                //             $target: __$ReportTarget,
                //             data: {
                //                 companyInfo: company_info,
                //                 companyReport: report['list'],
                //                 lowTen : res['result']['lowTen'],
                //                 lowThanFifty : res['result']['lowThanFifty'],
                //                 isSnChannel : res['result']['isSnChannel'],
                //             }
                //         })
                //     }
                //
                //     reportTotalResize()
                //     ReportDaterange.init()
                //     summaryBindEvent()
                // })
            //    ------------------------new ---------------------

                    renderHtml({
                        $tpl: $('#JsXReportSummaryTpl'),
                        $target: __$ReportTarget,
                        data: {
                            totalReport : report['info']['statistic_content'],
                            yongjinRecord : yongjinRecord,
                            companyId : __company_id,
                            updateTime : report['updateTime'],
                            isSnChannel : isSnChannel

                        }
                    })
                    if(engineerInfo && !$.isEmptyObject(engineerInfo)){
                        renderHtml({
                            is_append: true,
                            $tpl: $('#JsXReportXXGTpl'),
                            $target: __$ReportTarget,
                            data: {
                                engineerInfo: engineerInfo,
                                companyReport: report['list']
                            }
                        })
                    }else {
                        if(__arr.length > 0){
                            renderHtml({
                                is_append: true,
                                $tpl: $('#JsXReportCompanyListTpl'),
                                $target: __$ReportTarget,
                                data: {
                                    companyReport: report['list'],
                                    lowTen : res['result']['lowTen'],
                                    lowThanFifty : res['result']['lowThanFifty'],
                                    isSnChannel : res['result']['isSnChannel'],
                                }
                            })
                        }
                    }

                    reportTotalResize()
                    ReportDaterange.init()
                    summaryBindEvent()

            } else {
                alert(res.errmsg)
            }
        })
    }

    function summaryBindEvent() {
        $('.js-trigger-check-company').on('click', function (e) {
            e.preventDefault()

            var $me = $(this),
                company_id = $me.attr('data-company-id')

            var $Tree = $('#company_tree'),
                $Li = $Tree.find('[data-id="'+company_id+'"]').closest('li')
            if($Tree.find('[data-id="'+company_id+'"]').length === 0){
                $Li = $Tree.find('[id="'+company_id+'"]').closest('li')
            }

            var treeInst = $Tree.jstree(true)

            treeInst.deselect_all()
            treeInst.select_node($Li.attr('id'))
        })
        $('.report-summary-list a').on('click', function (e) {
            var $me = $(this),
                data_type = $me.attr('data-type')

            if(!$me.hasClass('yongjin-record')){
                e.preventDefault()

                if (!data_type){
                    return
                }
                __tab_type = data_type

                __order_params.order_status = $me.attr('data-order-status')
                __order_params.is_equal = $me.attr('data-is-equal')

                uiUpdateMainContent()
            }

        })
    }

    // 输出订单明细信息
    function renderOrderListData() {
        if(__company_id == "" || __company_id == null || __company_id == undefined){
            alert('请点击左侧选择一个分支机构查看订单明细')
            loadingDone()
            return;
        }

        $.get('/x/getOrderList', {
            company_id : __company_id,
            sale_type : __order_params.sale_type || '',
            order_status : __order_params.order_status || '',
            is_equal : __order_params.is_equal || '',
            appeal_status : __order_params.appeal_status || '',
            page : __order_params.page ||0,
            order_id :  __order_params.order_id
        }, function (res) {
            res = $.parseJSON(res)

            loadingDone()
            if (!res['errno']) {

                var result = res['result']||{}

                __order_status_map = result['order_status'] || {}

                renderHtml({
                    $tpl: $('#JsXReportOrderListTpl'),
                    $target: __$ReportTarget,
                    data: {
                        company_id : __company_id,
                        order_list: result['order_list'] || {},
                        sale_type: result['sale_type'] || {},
                        plusInfo : result['plusInfo']|| {},
                        // order_status: result['order_status'] || {},
                        check_status: result['thirdPingguStatus'] || {},
                        appeal_status: result['appealStatusMap'] || {},
                        checked: {
                            sale_type : __order_params.sale_type || '',
                            order_status : __order_params.order_status || '',
                            check_status : __order_params.is_equal || '',
                            appeal_status : __order_params.appeal_status || ''
                        }
                    }
                })

                ReportDaterange.init()

                renderOrderStatusOptions()
                orderListBindEvent()

                var totalCounts = result['pageCount'],
                    pageSize = 15

                if(totalCounts){
                    pagination(totalCounts,pageSize)
                }
            }
        })
    }

    function renderOrderStatusOptions() {
        //处理默认状态
        var saleType = $('#sale_type').val()
        var options = '<option value="-1">请选择</option>'
        saleType > 0 && $.each(__order_status_map[saleType], function (value, name) {
            options += '<option value="' + value + '"' + (__order_params.order_status && __order_params.order_status==value ?' selected':'') + '>' + name + '</option>'
        })
        $('#order_status').html(options)
    }

    function orderListBindEvent() {
        // 切换服务方式
        $('#sale_type').on('change', function (e) {
            renderOrderStatusOptions()
        })
        // 根据筛选项搜索
        $('#search_btn').click(function () {
            var sale_type = $('#sale_type').val()
            var order_status = $('#order_status').val()
            var is_equal = $('#is_equal').val()
            var appeal_status = $('#appeal_status').val()

            __order_params = {
                sale_type : sale_type>-1?sale_type:'',
                order_status : order_status>-1?order_status:'',
                is_equal : is_equal>-1?is_equal:'',
                appeal_status : appeal_status>-1?appeal_status:'',
                order_id : $('#order_id').val()
            }

            uiUpdateMainContent()
        })
        // 下载
        $('#down_btn').click(function () {
            var sale_type = $('#sale_type').val()
            var order_status = $('#order_status').val()
            var is_equal = $('#is_equal').val()
            var company_id = $('#company_id').val()
            var appeal_status = $('#appeal_status').val()
            $.ajax({
                url: '/x/downOrderList',
                type: 'post',
                data: {
                    sale_type: sale_type > -1 ? sale_type : '',
                    order_status: order_status > -1 ? order_status : '',
                    is_equal: is_equal > -1 ? is_equal : '',
                    appeal_status: appeal_status > -1 ? appeal_status : '',
                    company_id: company_id
                },
                success: function (data) {
                    data = JSON.parse(data)
                    if (!data.errno) {
                        alert("下载结果会通过邮件发送给您，请耐心等待！");
                    } else {
                        alert(data.errmsg);
                    }
                }
            })
        })
        // 显示图片
        $('.show-imgs-btn').click(function () {
            var $this = $(this)
            var imgs_arr = $this.attr('data-imgs_arr').replace(/[\[|\]|"|\\]/g,'').split(',')
            var imgs_html = ''
            imgs_arr.forEach(function (item, i) {
                imgs_html+= '<img src="'+item+'" style="width:100%">'
            })
            $('#quality-imgs-modal').modal('show').find('.modal-body').html(imgs_html)
        })

        function showDiffPic() {
            $('.show-imgs-btn1').on('click', function () {
                var $this = $(this)
                var imgs_arr = $this.attr('data-imgs_arr').replace(/[\[|\]|"|\\]/g, '').split(',')
                var imgs_html = ''
                imgs_arr.forEach(function (item, i) {
                    imgs_html += '<img src="' + item + '" style="width:100%">'
                })
                $('#quality-imgs-modal').modal('show').find('.modal-body').html(imgs_html)
            })
        }
        // 显示评估差异弹窗
        $('.show-pinggu-btn').click(function (e) {
            e.preventDefault()

            var $this = $(this),
                pinggu_ids = $this.attr('data-pinggu-ids'),
                order_id = $this.attr('data-order-id'),
                model_id = $this.attr('data-model-id'),
                model_name = $this.attr('data-model-name'),
                data = {
                    pinggu_ids : pinggu_ids,
                    order_id : order_id,
                    model_id : model_id,
                    model_name : model_name
                }

            $.get('/x/getPingguThirdDiff',data,function (res) {
                res = $.parseJSON(res)

                if(!res['errno']){
                    var pingguHtml = res['result']
                    $('#pinggu-diff-modal').modal('toggle').find('.modal-body').html(pingguHtml)
                    showDiffPic()
                }
            })
        })

        // 申诉
        $(".differ_btn").click(function (){
            var $this = $(this)
            var orderId = $this.attr("orderId");
            var data = $this.attr('data')
            swal({
                    title: data,
                    text: '<span style="color:black;font-size:20px" onclick="swal.close();"><b>关闭请点击这里</b><span>',
                    type: "input",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "驳回",
                    cancelButtonText: "通过",
                    closeOnConfirm: false,
                    closeOnCancel: false,
                    inputPlaceholder: "输入驳回理由",
                    allowEscapeKey:false,
                    html: true
                },
                // 注意:确认按钮-驳回,取消按钮-通过
                function(isConfirm){
                    if (isConfirm !== false) {
                        var is_adopt = false;// 驳回
                        var fail_reason = isConfirm;// 驳回理由

                        if (fail_reason == '') {
                            swal.showInputError("驳回理由不能为空，请输入！");
                            return false;
                        }
                        if (fail_reason.length > 200) {
                            swal.showInputError("驳回理由不能超过200个文字，请重新输入！");
                            return false;
                        }
                    } else {
                        var is_adopt = true;// 通过
                        var fail_reason = '';
                    }
                    console.log(isConfirm, is_adopt, fail_reason);
                    $.ajax({
                        url: "/x/doDifferAppealStatus",
                        type: "post",
                        data: {
                            'order_id': orderId,
                            'is_adopt': is_adopt,
                            'fail_reason': fail_reason
                        },
                        success: function (data) {
                            data = JSON.parse(data)
                            if (!data.errno) {
                                if (is_adopt) {
                                    $("#differ_appeal_" + orderId).html("申诉通过");
                                    swal("SUCCESS!", "申诉已通过", "success");
                                } else {
                                    $("#differ_appeal_" + orderId).html("申诉驳回");
                                    swal("SUCCESS!", "申诉已驳回", "success");
                                }
                            } else {
                                swal("ERROR", "", "error");
                            }
                        },
                    });
                });
        })

        $('[data-toggle="tooltip"]').tooltip({
            html: true,
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow" style="border-left-color:#337ab7;"></div><div class="tooltip-inner" style="background-color: #337ab7;text-align:left;padding:15px;max-width:900px;"></div></div>'
        })
    }

    // 输出信用订单明细信息
    function renderCreditOrderListData() {
        $.get('/x/getCreditOrderList', {
            company_id : __company_id,
            sale_type : __order_params_credit.sale_type || '',
            order_status : __order_params_credit.order_status || ''
        }, function (res) {
            res = $.parseJSON(res)

            loadingDone()
            if (!res['errno']) {

                var result = res['result']||{}

                __order_status_map_credit = result['order_status'] || {}

                renderHtml({
                    $tpl: $('#JsXReportCreditOrderListTpl'),
                    $target: __$ReportTarget,
                    data: {
                        company_id : __company_id,
                        order_list: result['order_list'] || {},
                        sale_type: result['sale_type'] || {},
                        checked: {
                            sale_type : __order_params_credit.sale_type || '',
                            order_status : __order_params_credit.order_status || ''
                        }
                    }
                })

                ReportDaterange.init()

                renderCreditOrderStatusOptions()
                creditOrderListBindEvent()

                var totalCounts = result['pageCount'],
                    pageSize = 15

                if(totalCounts){
                    pagination(totalCounts,pageSize)
                }
            }
        })
    }

    function renderCreditOrderStatusOptions() {
        //处理默认状态
        var saleType = $('#sale_type').val()
        var options = '<option value="-1">请选择</option>'
        saleType > 0 && $.each(__order_status_map_credit[saleType], function (value, name) {
            options += '<option value="' + value + '"' + (__order_params_credit['order_status'] && __order_params_credit['order_status']==value ?' selected':'') + '>' + name + '</option>'
        })
        $('#order_status').html(options)
    }

    function creditOrderListBindEvent() {
        $('#sale_type').on('change', function (e) {
            renderCreditOrderStatusOptions()
        });

        $('#search_btn').click(function () {
            var sale_type = $('#sale_type').val()
            var order_status = $('#order_status').val()

            __order_params_credit = {
                sale_type: sale_type > -1 ? sale_type : '',
                order_status: order_status > -1 ? order_status : ''
            }

            uiUpdateMainContent()
        })

        $('.show-imgs-btn').click(function () {
            var $this = $(this)
            var imgs_arr = $this.attr('data-imgs_arr').replace(/[\[|\]|"|\\]/g, '').split(',')
            var imgs_html = ''
            imgs_arr.forEach(function (item, i) {
                imgs_html += '<img src="' + item + '" style="width:100%">'
            })
            $('#quality-imgs-modal').modal('toggle').find('.modal-body').html(imgs_html)
        })

        $(".differ_btn").click(function () {
            var $this = $(this)
            var orderId = $this.attr("orderId");
            var data = $this.attr('data')
            swal({
                    title: data,
                    text: '<span style="color:black;font-size:20px" onclick="swal.close();"><b>关闭请点击这里</b><span>',
                    type: "input",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "驳回",
                    cancelButtonText: "通过",
                    closeOnConfirm: false,
                    closeOnCancel: false,
                    inputPlaceholder: "输入驳回理由",
                    allowEscapeKey:false,
                    html: true
                },
                function (isConfirm) {
                    if (isConfirm !== false) {
                        var is_adopt = false;//驳回
                        var fail_reason = isConfirm;//驳回理由

                        if (fail_reason == '') {
                            swal.showInputError("驳回理由不能为空，请输入！");
                            return false;
                        }
                        if (fail_reason.length > 200) {
                            swal.showInputError("驳回理由不能超过200个文字，请重新输入！");
                            return false;
                        }
                    } else {
                        var is_adopt = true;//通过
                        var fail_reason = '';
                    }
                    console.log(isConfirm, is_adopt, fail_reason);
                    $.ajax({
                        url: "/x/doDifferAppealStatus",
                        type: "post",
                        data: {
                            'order_id': orderId,
                            'is_adopt': is_adopt,
                            'fail_reason': fail_reason
                        },
                        success: function (data) {
                            data = JSON.parse(data)
                            if (!data.errno) {
                                if (is_adopt) {
                                    $("#differ_appeal_" + orderId).html("申诉通过");
                                    swal("SUCCESS!", "申诉已通过", "success");
                                } else {
                                    $("#differ_appeal_" + orderId).html("申诉驳回");
                                    swal("SUCCESS!", "申诉已驳回", "success");
                                }
                            } else {
                                swal("ERROR", "", "error");
                            }
                        },
                    })
                })
        })

        $('[data-toggle="tooltip"]').tooltip({
            html: true,
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow" style="border-left-color:#337ab7;"></div><div class="tooltip-inner" style="background-color: #337ab7;text-align:left;padding:15px;max-width:900px;"></div></div>'
        })
    }

    // 输出待入库订单信息
    function renderToStoreOrderListData(ignore_baoxiao) {
        var params = {
            company_id: __company_id,
            page: __order_params.page || 0
        }
        if (ignore_baoxiao) {
            params.ignore_baoxiao = '1'
        }
        $.get('/x/getWaitInWarehouseOrderList', params, function (res) {
            loadingDone()

            res = $.parseJSON(res)

            if (!res['errno']) {
                var result = res['result']||{}

                renderHtml({
                    $tpl: $('#JsXToStoreOrderListTpl'),
                    $target: __$ReportTarget,
                    data: result
                })

                var totalCounts = result['pageCount'],
                    pageSize = 15

                if(totalCounts){
                    pagination(totalCounts,pageSize)
                }
            }
        })
    }

    // 输出金牌修修哥订单明细信息
    function renderGoldEngineerOrderListData() {
        $.get('/x/getGoldEngineerList', {
            company_id : __company_id,
            page: __order_params.page || 0
        }, function (res) {
            res = $.parseJSON(res)

            loadingDone()
            if (!res['errno']) {

                var result = res['result']||{}

                renderHtml({
                    $tpl: $('#JsXReportGoldEngineerOrderListTpl'),
                    $target: __$ReportTarget,
                    data: {
                        company_id : __company_id,
                        order_list: result['order_list'] || {},
                        xxg_list: result['xxg_list'] || {}
                    }
                })

                ReportDaterange.init()

                goldEngineerOrderListBindEvent()

                var totalCounts = result['pageCount'],
                    pageSize = 15

                if(totalCounts){
                    pagination(totalCounts,pageSize)
                }
            }
        })
    }

    function goldEngineerOrderListBindEvent() {
        // 下载
        $('.js-trigger-down-gold-engineer').click(function (e) {
            e.preventDefault()

            var company_id = $('#company_id').val()

            $.ajax({
                url: '/x/getGoldEngineerList',
                type: 'post',
                data: {
                    company_id: company_id,
                    down:1
                },
                success: function (data) {
                    data = $.parseJSON(data)
                    if (!data.errno) {
                        alert("下载结果会通过邮件发送给您，请耐心等待！");
                    } else {
                        alert(data.errmsg);
                    }
                }
            })
        })
    }

    /*****************************************/
    /************ 输出一站换新订单 **************/
    /*****************************************/

    // 输出一站换新订单
    function renderSuningOneStopOrderListData() {
        if (__company_id == '' || __company_id == null || __company_id == undefined) {
            alert('请点击左侧选择一个分支机构查看订单明细')
            loadingDone()
            return
        }
        $.get('/x/getOneStopOrderList', {
            company_id: __company_id,
            sale_type: __order_params.sale_type || '',
            order_id: __order_params.order_id || '',
            page: __order_params.page || 0
        }, function (res) {
            res = $.parseJSON(res)

            loadingDone()
            if (!res['errno']) {

                var result = res['result'] || {}

                renderHtml({
                    $tpl: $('#JsXReportSuningOneStopOrderListTpl'),
                    $target: __$ReportTarget,
                    data: {
                        company_id: __company_id,
                        order_list: result['order_list'] || {},
                        sale_type: result['sale_type_map'] || {},
                        order_id: result['order_id'] || {},
                        checked: {
                            sale_type: __order_params.sale_type || ''
                        }
                    }
                })

                ReportDaterange.init()
                orderListBindEvent()

                var totalCounts = result['pageCount'],
                    pageSize = 15

                if (totalCounts) {
                    pagination(totalCounts, pageSize)
                }
            }
        })
    }

    /********** END 输出一站换新订单 ************/

    /*****************************************/
    /************ 输出江苏移动订单 **************/
    /*****************************************/

    // 输出江苏移动订单
    function renderJiangsuMobileOrderListData() {
        if (__company_id == '' || __company_id == null || __company_id == undefined) {
            alert('请点击左侧选择一个分支机构查看订单明细')
            loadingDone()
            return
        }
        $.get('/x/getJsMobileOrderList?', {
            company_id: __company_id,
            page: __order_params.page || 0
        }, function (res) {
            res = $.parseJSON(res)

            loadingDone()
            if (!res['errno']) {

                var result = res['result'] || {}

                renderHtml({
                    $tpl: $('#JsXReportJiangsuMobileOrderListTpl'),
                    $target: __$ReportTarget,
                    data: {
                        company_id: __company_id,
                        order_list: result['order_list'] || {}
                    }
                })

                ReportDaterange.init()
                orderListBindEvent()

                var totalCounts = result['pageCount'],
                    pageSize = 15

                if (totalCounts) {
                    pagination(totalCounts, pageSize)
                }
            }
        })
    }

    /********** END 输出江苏移动订单 ************/

    /*****************************************/
    /************ 输出离店订单 **************/
    /*****************************************/

    // 输出离店订单
    function renderCheckOutOrderListData() {
        if (__company_id == '' || __company_id == null || __company_id == undefined) {
            alert('请点击左侧选择一个分支机构查看订单明细')
            loadingDone()
            return
        }
        $.get('/x/getCheckOutOrderList?', {
            company_id: __company_id,
            page: __order_params.page || 0
        }, function (res) {
            res = $.parseJSON(res)

            loadingDone()
            if (!res['errno']) {

                var result = res['result'] || {}

                renderHtml({
                    $tpl: $('#JsXReportCheckOutOrderListTpl'),
                    $target: __$ReportTarget,
                    data: {
                        company_id: __company_id,
                        order_list: result['order_list'] || {}
                    }
                })

                ReportDaterange.init()
                checkOutOrderListBindEvent()

                var totalCounts = result['pageCount'],
                    pageSize = 15

                if (totalCounts) {
                    pagination(totalCounts, pageSize)
                }
            }
        })
    }

    function checkOutOrderListBindEvent() {
        // 下载
        $('.js-trigger-down-check-out').click(function (e) {
            e.preventDefault()

            $.ajax({
                url: '/x/getCheckOutOrderList',
                type: 'get',
                data: {
                    company_id: __company_id,
                    page: __order_params.page || 0,
                    is_down:1
                },
                success: function (res) {
                    res = $.parseJSON(res)
                    if (!res.errno) {
                        alert("下载结果会通过邮件发送给您，请耐心等待！");
                    } else {
                        alert(res.errmsg);
                    }
                }
            })
        })
    }

    /********** END 输出离店订单 ************/

    // 返回顶部
    function scrollToTop() {
        setTimeout(function () {
            $('.scroll-to-top').click()
        }, 300)
    }

    function reportTotalResize(){
        var body_width = $('body').width()
        if (__page_width && __page_width == body_width) {
            // return
        }
        __page_width = body_width
        var $Tree = $('#company_tree')
        if ($Tree && $Tree.length) {
            var treeInst = $Tree.jstree(true)
            if ($('body').width() > 991) {
                //因为现在点一个节点后，所有的节点都打开了，所以暂时注释掉，以实现点哪个节点只打开点击节点的下一级
                // treeInst.open_node(treeInst.get_json())
            } else {
                treeInst.close_node(treeInst.get_json())
            }
        }

        var $ReportTotal = $('.report-total')
        if (!$ReportTotal.length){
            return
        }
        var containerWidth = $ReportTotal.width()
        if(containerWidth < 1400){
            $('.report-total>div').each(function(){
                $(this).removeClass('col-lg-2')
                $(this).removeClass('col-lg-3')
                // var thisclass = $(this).attr("class")
                // thisclass = 'col-lg-3 '+ thisclass
                // $(this).attr("class",thisclass)
            })
        }

        if(containerWidth < 1200){
            $('.report-total>div').each(function(){
                $(this).removeClass('col-lg-2')
                $(this).removeClass('col-lg-3')
            })
        }

        if(containerWidth < 800){
            $('.report-total>div').each(function(){
                $(this).removeClass('col-lg-2')
                $(this).removeClass('col-lg-3')
                $(this).removeClass('col-md-4')
            })
        }
    }

    function renderHtml(options) {
        var html_str = $.tmpl($.trim(options.$tpl.html()))({
            data: options.data
        })

        if (options.is_append) {
            options.$target.append(html_str)
        } else {
            options.$target.html(html_str)
        }
    }

    // 分页
    function pagination(totalCounts,pageSize) {
        $('#Paginator').jqPaginator({
            first: '<li class="first"><a href="javascript:;">首页</a></li>',
            prev: '<li class="prev"><a href="javascript:;">上一页</a></li>',
            next: '<li class="next"><a href="javascript:;">下一页</a></li>',
            last: '<li class="last"><a href="javascript:;">末页</a></li>',
            page: '<li class="page"><a href="javascript:;">{{page}}</a></li>',
            totalCounts: totalCounts,
            pageSize: pageSize,
            visiblePages: 10,
            currentPage: (__order_params.page||0)+1,
            onPageChange: function (num, type) {
                __order_params.page = num-1
                if (type=='init'){
                    return
                }
                uiUpdateMainContent()
            }
        })
    }

    // 开始加载
    function loadingStart(){
        var loading = $ ('.loading-anim-cover')

        if (loading.length == 0) {

            loading = $ ('<div class="loading-anim-cover" style="position: fixed;top: 0;left: 0;right: 0;bottom: 0;display: flex; flex-flow: column;justify-content: center;align-items: center; width: 100%;height: 100%;background: rgba(0, 0, 0, 0.4);">' +
                '<div class="loading-anim" style="width: 30px;height: 30px;background: url(https://p.ssl.qhimg.com/t015f3d5ddf0e5a1b71.png) no-repeat center/30px 30px; transform: rotate(0);transition: transform 600s;">' +
                '</div></div>').appendTo (document.body)
        }

        setTimeout (function () {
            loading.find ('.loading-anim').css ({ 'transform' : 'rotate(360000deg)' })
        }, 100);

        return loading
    }
    // 加载完成
    function loadingDone(){
        var loading = $ ('.loading-anim-cover')

        if(loading&&loading.length){
            loading.remove()
        }
    }

    $(window).resize(reportTotalResize)

    initTree(function () {

        uiUpdateMainContent()
        bindEvent()
    })

})
