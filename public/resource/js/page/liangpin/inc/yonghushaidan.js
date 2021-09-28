Dom.ready(function(){
    // 没有地方使用了，直接return
    return
    //============== 用户晒单 ==============
    // 输出用户晒单的html
    function renderYongHuShaiDan(){

        var wListInner = W('.shaidan-list');
        if(wListInner && wListInner.length){

            getData4YongHuShaiDan(function(list_arr){

                var html_str = W('#JsYongHuShaiDanTpl').html().trim().tmpl()({
                    'list': list_arr
                });

                if (html_str.trim()) {
                    wListInner.html(html_str);

                    wListInner.ancestorNode('.cont-block-model').show();
                } else {
                    wListInner.ancestorNode('.cont-block-model').hide();
                }
            });

        }
    }
    // 获取用户晒单的数据
    function getData4YongHuShaiDan(callback){
        var request_url = '/youpin/aj_user_tan',
            request_params = {
                'starlevel': 5,
                'limit': 6
            };
        QW.Ajax.get(request_url, request_params, function(res){
            var list_arr = [];
            res = JSON.parse(res);

            if (!res['errno']) {
                list_arr = res['result'];
            }

            typeof callback==='function' && callback(list_arr);
        });
    }
    renderYongHuShaiDan();


})