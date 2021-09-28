Dom.ready(function(){
    // 貌似没地方再用了，先直接return吧
    return
    //============== 都在买啥 ==============
    // 输出大家都在买啥的html
    function renderDouZaiMaiSha(){

        // 买买买了啥滚动滚动.
        var wMaishaListInner = W('.maisha-list-inner');
        if(wMaishaListInner && wMaishaListInner.length){

            getData4DouZaiMaiSha(function(list_arr){

                var html_str = W('#JsDouZaiMaiShaTpl').html().trim().tmpl()({
                    'list': list_arr
                });

                wMaishaListInner.html(html_str);

                var wMaishaListInnerItem = wMaishaListInner.query('.row');
                // 大于8条才滚
                if(wMaishaListInnerItem.length>8){
                    var rect = wMaishaListInnerItem.first().getRect();
                    (function(){
                        var arg = arguments;
                        wMaishaListInner.animate({'top': -rect['height']}, 800, function(){
                            wMaishaListInner.firstChild('.row').appendTo(wMaishaListInner);
                            wMaishaListInner.css({'top': 0});

                            setTimeout(arg.callee, 2000);
                        });
                    }());
                }
            });

        }
    }
    // 获取都在买啥的数据
    function getData4DouZaiMaiSha(callback){
        var request_url = '/youpin/aj_what_to_by',
            request_params = {
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
    renderDouZaiMaiSha();


})