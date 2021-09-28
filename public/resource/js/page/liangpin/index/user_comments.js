//优品首页用户晒单
Dom.ready(function(){
    // 输出用户晒单的html
    function renderUserComments(){
        var wListInner = W('.user-comments-list-inner');
        if(wListInner && wListInner.length){
            getData4UserComments(function(list_arr){
                var html_str = W('#JsUserCommentsTpl').html().trim().tmpl()({
                    'list': list_arr
                });
                wListInner.html(html_str);

                var wListInnerItem = wListInner.query('.row');
                // 大于3条才滚滚滚
                if(wListInnerItem.length>3){
                    var rect = wListInnerItem.first().getRect();
                    (function(){
                        var arg = arguments;
                        wListInner.animate({'top': -rect['height']}, 1200, function(){
                            wListInner.firstChild('.row').appendTo(wListInner);
                            wListInner.css({'top': 0});

                            setTimeout(arg.callee, 4000);
                        });
                    }());
                }
            });

        }
    }
    // 获取用户晒单的数据
    function getData4UserComments(callback){
        var request_url = '/youpin/aj_user_tan',
            request_params = {
                'starlevel': 5,
                'limit': 20
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
    renderUserComments();
})