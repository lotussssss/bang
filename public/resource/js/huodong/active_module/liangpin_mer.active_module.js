!(function () {
    //如果是编辑页面 显示已经选择的视图
    if(_is_edit){
        $.ajax({
            url:'/liangpin_mer/doGetModularViewsList',
            method: 'POST',
            data:{activity_id:_active_id},
            success: function (res) {
                res = JSON.parse(res)
                if(!res.errno){
                    renderAllSelectViews(res['result']['modular_views_list']['pc'],'.show-selected-view-data-pc')
                    renderAllSelectViews(res['result']['modular_views_list']['m'],'.show-selected-view-data-m')
                }else {
                    console.log(res.errmsg)
                }
            }
        })
    }
    //如果是列表页直接来到编辑页  自动定位到模块选择部分
    if(_form=='add_page'){
        var scroll_top = $('.select-module').offset().top
        $("html, body").animate({
            scrollTop: scroll_top-50 }, {duration: 100,easing: "swing"});
    }

    //绑定事件
    tcb.bindEvent(document.body,{
        //模块列表tab栏
        '.select-module a' : function (e) {
            e.preventDefault()
            var $me = $(this),
                $me_parent = $me.parent(),
                $data_flag = $me_parent.attr('data-flag')

            $me_parent.addClass('active').siblings('.active').removeClass('active')

            $('.module-detail li[data-flag='+$data_flag+']').addClass('active').siblings('.active').removeClass('active')
        },
        //已选模块列表tab栏
        '.select-show-module a' : function (e) {
            e.preventDefault()
            var $me = $(this),
                $me_parent = $me.parent(),
                $data_flag = $me_parent.attr('data-flag')

            $me_parent.addClass('active').siblings('.active').removeClass('active')

            $('.show-module-detail li[data-flag='+$data_flag+']').addClass('active').siblings('.active').removeClass('active')
        },
        //商品列表模块视图中选择数据
        '.product-data-for-choose [type="radio"]': function (e) {
            //列表模块 数据选择部分 为单选  设置隐藏input 传递出数据的name
            var $me = $(this)
            $('#lock_data_name').val($me.attr('data-name'))
            $('#lock_data_zhname').val($me.attr('data-zhname'))
        },
        //模块列表中每个视图
        '.module-detail .module-item': function () {
            var $me = $(this),
                $module_name = $me.attr('data-module-name'), //要是用的模块的名字
                $view_name = $me.attr('data-view-name'),//要是用的视图的名字
                //组装编辑视图的模板-->在edit_active_module.tpl文件中要有对应的模板
                module_name_for_used = '#Js_tpl_for_'+$module_name+'_'+$view_name

            //展示编辑视图的弹框
            showEditModule(module_name_for_used)

            //给两个隐藏input赋值
            $('.edit-module-wrap [name="modular_name"]').val($module_name)
            $('.edit-module-wrap [name="view_name"]').val($view_name)

        },
        //提交活动基本信息
        '#submit-base-info':function (e) {
            e.preventDefault()
            var $me = $(this)
            submitFormInfo($me, function (res) {
                if(res.errno){
                    alert(res.errmsg)
                }else {


                    if(_is_edit){
                        alert('编辑成功，请继续选择模块和视图')
                    }else {
                        alert('添加成功，请继续选择模块和视图')
                        window.location.href = '/liangpin_mer/editActivityInfo?from=add_page&activity_id='+_active_id
                    }

                }
            })
        },
        //提交活动视图信息
        '#submit-view-info': function (e) {
            e.preventDefault()
            var $me = $(this)
            submitFormInfo($me, function (res) {
                if(res.errno){
                    alert(res.errmsg)
                }else {
                    alert('添加视图成功')
                    //关闭视图编辑弹框
                    tcb.closeDialog()
                    //展示所有视图列表
                    requestAllSelectViews(function (res) {
                        renderAllSelectViews(res['result']['modular_views_list']['pc'],'.show-selected-view-data-pc')
                        renderAllSelectViews(res['result']['modular_views_list']['m'],'.show-selected-view-data-m')
                    })
                }
            })
        },
        //已选模块中的修改
        '.edit-view-btn': function (e) {
            e.preventDefault()
            var $me = $(this),
                $view_id = $me.attr('data-id'),
                $module_name = $me.attr('data-module-name'), //要是用的模块的名字
                $view_name = $me.attr('data-view-name'),//要是用的视图的名字
                //组装编辑视图的模板-->在edit_active_module.tpl文件中要有对应的模板
                module_name_for_used = '#Js_tpl_for_'+$module_name+'_'+$view_name

            //展示编辑视图的弹框
            showEditModule(module_name_for_used)
            // 编辑弹框填入已选信息
            $.get('/liangpin_mer/doGetModularViewsInfo',{id:$view_id},function (res) {
                res = JSON.parse(res)
                if(!res.errno){
                    for(var key in res['result']){
                        var $receive_item = $('.edit-module-wrap [name='+key+']')
                        if($receive_item && $receive_item.length>0){
                            if(key == 'data_content'){

                                for(var i=0; i<$receive_item.length; i++){
                                    var $me = $($receive_item[i])
                                    if($me.attr('data-name') == res['result']['data_name'] && $me.val() == res['result']['data_content']){
                                        $me.attr('checked','checked')
                                    }
                                }
                            }else if(key == 'fit_name'){
                                for(var i=0; i<$receive_item.length; i++){
                                    var $me = $($receive_item[i])
                                    if($me.val() == res['result']['fit_name']){
                                        $me.attr('checked','checked')
                                    }
                                }
                            }else{
                                $receive_item.val(res['result'][key])
                            }
                        }
                    }
                }else {
                    console.log(res.errmsg)
                }
            })




            //给表单添加data-id属性   用于提交时判断是 新增提交 还是 修改提交
            $('.edit-module-wrap form').attr('data-id',$view_id)

            //给两个隐藏input赋值
            $('.edit-module-wrap [name="modular_name"]').val($module_name)
            $('.edit-module-wrap [name="view_name"]').val($view_name)
        },
        //删除已选视图
        '.del-view-btn': function (e) {
            e.preventDefault()
            var $me = $(this),
                $me_tr = $me.closest("tr"),
                $view_id = $me.attr('data-id')
            var is_del = window.confirm('确定删除当前视图吗？')
            if(is_del){
                $.post('/liangpin_mer/doCancelModularViews',{id: $view_id},function (res) {
                    res = JSON.parse(res)
                    if(!res.errno){
                        $me_tr.remove()
                        alert('删除视图成功')
                    }
                })
            }
        },
        //关闭视图编辑按钮
        '.close-view-btn': function(e){
            e.preventDefault()
            //关闭视图编辑弹框
            tcb.closeDialog()
        },
        '.clear-cache-btn': function (e) {
            e.preventDefault()
            $.post('/liangpin_mer/doCancelActivityCache',{activity_id:_active_id},function (res) {
                res = JSON.parse(res)
                if(!res.errno){
                    alert('活动页缓存已经清除！')
                }
            })
        }
    })


    //显示编辑视图的弹层
    function showEditModule(module_name) {
        var insert_html = $(module_name).html()

        var html_str = '<div class="edit-module-wrap"><div class="h3 text-center">编辑模块</div> <form action="/liangpin_mer/doAddModularInfo" method="post">  <div class="fit-name"><label class="radio-inline"> <input type="radio" name="fit_name"  id="fit_name"   value="pc"> pc </label><label class="radio-inline"> <input type="radio" name="fit_name"  id="fit_name"   value="m"> m端 </label></div>'+insert_html+'<div class="bottom-btn"><input type="button" class="btn btn-success btn-default" id="submit-view-info" value="确定"> <input type="button" class="btn btn-warning btn-default close-view-btn" value="取消"> </div> </form> </div>'

        tcb.showDialog(html_str,{
            'className': '',
            'withClose': true,
            'middle': true
        });
    }

    //提交表单  $el 为提交按钮
    function submitFormInfo($el, callback, url) {
        if(!($el && $el.length)){return}
        var $form = $el.closest('form'),
            _method = $form.attr('method') || 'GET',
            _url = url || $form.attr('action') || '',
            _data = transQueryArrToObj($form.serializeArray()),
            _view_id = $form.attr('data-id')

        if(_view_id){//如果有_view_id代表是修改  否则代表是新增
            _url = '/liangpin_mer/doEditActivityModularViewsInfo'
            _data.id = _view_id
            $.ajax({
                url: _url,
                method: _method,
                data: _data,
                success:function (res) {
                    res= typeof res =='string'? JSON.parse(res):res
                    typeof callback === 'function' && callback(res)
                }
            })
        }else {
            if(!_url){return}
            $.ajax({
                url: _url,
                method: _method,
                data: _data,
                success:function (res) {
                    res= typeof res =='string'? JSON.parse(res):res
                    typeof callback === 'function' && callback(res)
                }
            })
        }
    }

    //请求所有已经添加的视图
    function requestAllSelectViews(callback) {
        $.ajax({
            url: '/liangpin_mer/doGetModularViewsList',
            method: 'GET',
            data: {activity_id: _active_id},
            success: function (res) {
                res = JSON.parse(res)
                if(!res.errno){
                    typeof callback === 'function' && callback(res)
                }else {
                    console.log(res.errmsg)
                }
            }
        })
    }

    //根据请求的数据展示视图的列表
    function renderAllSelectViews(res,target) {
        var views_data_str = ''
        if(!$.isArray(res)){return}
        for(var i= 0; i< res.length; i++){
            var view_item_info = res[i]
            var tpl_name_for_show = 'Js_tpl_for_show_'+ view_item_info['modular_name']+ '_'+view_item_info['views_name']

            var html_fn = $.tmpl($.trim($('#'+tpl_name_for_show).html())),
                html_str = html_fn({
                    id:res[i]['id'],
                    sort_by:res[i]['sort_by'],
                    modular_zhname:res[i]['modular_zhname'],
                    modular_name:res[i]['modular_name'],
                    views_name:res[i]['views_name'],
                    views_zhname:res[i]['views_zhname'],
                    views_data: res[i]['views_data'],
                })
            views_data_str += html_str
        }
        $(target).html(views_data_str)
    }

    //将query数组转换成对象
    function transQueryArrToObj(queryArr) {
        queryArr = queryArr || []
        var query_obj = {activity_id: _active_id } //附加上活动id
        for(var i= 0; i< queryArr.length; i++){
            var query_item= queryArr[i]
            if(query_item['name'].slice(-2) == '[]'){
                query_obj[query_item['name']] = query_obj[query_item['name']] || []
                query_obj[query_item['name']].push(query_item['value'])
            }else {
                query_obj[query_item['name']] = query_item['value']
            }
        }
        return query_obj
    }
    //校验input是否为空
    function confirmInoutNotEmpty() {

    }

    //日历插件
    $(function () {
        $('#datetimepicker1').datetimepicker({
            format: "yyyy-mm-dd",
            //minDate: '2016-7-1'
            minView: 'month',
            autoclose: true,
            todayBtn: true,
            language:'zh-CN'
        });
        $('#datetimepicker2').datetimepicker({
            format: "yyyy-mm-dd",
            //minDate: '2016-7-1'
            minView: 'month',
            autoclose: true,
            // todayBtn: false,
            language:'zh-CN'
        });
    });
})()