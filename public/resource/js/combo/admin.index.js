;/**import from `/resource/js/component/pager.js` **/
(function() {
	function Pager() {
		this.init.apply(this, arguments);
	};

	Pager.prototype = (function() {
		var getHtml = function(totalPages, currentPage) {
			totalPages = Math.min(99, totalPages);

			currentPage = parseInt(currentPage, 10) || 0;
			currentPage++;

			currentPage = Math.min(Math.max(1, currentPage), totalPages);

			var html = [];
			if(currentPage > 5 && totalPages > 10) {
				html.push('<a data-pn="0" href="#" class="first">首页</a>&nbsp;');
			}

			if(currentPage > 1) {
				html.push('<a data-pn="',currentPage - 2,'" href="#" class="pre">&#171;上一页</span></a>&nbsp;');
			}

			var min, max;
			if(currentPage > 5) {
				min = currentPage - 4;
				if(currentPage > totalPages - 5) {
					min = totalPages - 9;
				}
			} else {
				min = 1;
			}

			max = min + 9;
			min = Math.max(min, 1);
			max = Math.min(max, totalPages);


			for(var i = min; i <= max; i++) {
				if(i == currentPage) {
					html.push('<span>', i ,'</span>&nbsp;');
				} else {
					html.push('<a data-pn="', i - 1, '" href="#">', i, '</a>&nbsp;');
				}
			}

			if(currentPage < totalPages) {
				html.push('<a data-pn="', currentPage ,'" href="#" class="next">下一页&#187;</a>&nbsp;');
			}

			if(currentPage < totalPages - 5 && currentPage > 10) {
				html.push('<a data-pn="',totalPages - 1,'" href="#" class="last">尾页</a>');
			}

		    return html.join("");
		}; 

		return {
			init : function(el, totalPages, currentPage) {
				var instance = this;

				CustEvent.createEvents(this);

				W(el).undelegate('a', 'click');

				W(el).html(getHtml(totalPages, currentPage))
					.delegate('a', 'click', function(e) {
						e.preventDefault();
						var pn = this.getAttribute('data-pn') || 0;
						setTimeout(function(){W(el).html(getHtml(totalPages, pn));},50);  //some error while happen if no settimeout

						instance.fire('pageChange', {'pn' : pn-0});
					});
			}
		}
	})();

	QW.provide({'Pager' : Pager});
})();

;/**import from `/resource/js/page/admin.index.js` **/
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

