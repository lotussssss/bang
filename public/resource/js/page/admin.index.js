Dom.ready(function(){
    var noticeListCache = {};
        total_page = window.notice_total_page;

    var NoticeListTpl_func = W('#NoticeListTpl').html().trim().tmpl(),
         notice_wrap = W('.notice-list .tab-content ul');

    var pager = new Pager(W('.notice-pager p'), total_page, 0);
    // 切换分页
    pager.on('pageChange', function(n){
        var pn = n.pn,
            request_url = '/mer/search',
            params = {
                'pn': pn+1
            };
        if(noticeListCache[pn]){
            var notice_str = NoticeListTpl_func({
                'notice_list':noticeListCache[pn]
            });
            notice_wrap.html(notice_str);
        } else {
            QW.Ajax.get(request_url, params, function(responceText){
                try{
                    var responce = QW.JSON.parse(responceText);
                    if(!responce.errno){
                        noticeListCache[pn] = responce.result;
                        var notice_str = NoticeListTpl_func({
                            'notice_list':noticeListCache[pn]
                        });
                        notice_wrap.html(notice_str);
                    } else {
                        alert(responce.errmsg);
                    }
                } catch (e){alert('系统错误！');}
            });
        }
    });
});
