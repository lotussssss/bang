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

;/**import from `/resource/js/page/admin.grade.js` **/
Dom.ready(function(){
	/*一级tab点击*/
	W('.grade-tab .tab-item').on('click', function(e){
		e.preventDefault();

		W(this).addClass('on').siblings('.on').removeClass('on');

		var tab = W(this).attr('data-rel');

		W('.show-section').hide();

		W('.show-section[data-for="'+tab+'"]').show();
	});

	/*二级tab点击*/
	W('.section-tab li').on('click', function(e){
		e.preventDefault();
		var seclist = W(this).parentNode('.section-tab').siblings('.section-detail');

		W(this).addClass('on').siblings('.on').removeClass('on');

		var tab = W(this).attr('data-rel');

		seclist.query('.sub-section').hide();

		seclist.query('.sub-section[data-for="'+tab+'"]').show();

		var tabarr = tab.split(/\-/);
		var box = seclist.query('.sub-section[data-for="'+tab+'"]').one('.data-show-box')
		var url = '/mer_info/jifenmingxi/?flag='+tabarr[0]+'&tab='+tabarr[1]+'&pagesize=10&pn=#{pn}';

		getAjaxData( box,  url, 0 , true );
	});

	var dataListCache = {};
	//url='/mer_info/jifenmingxi/?flag=1&tab=0&pagesize=10&pn=#{pn}';
	function getAjaxData(showBox, url, pn, isCreatePager){				
		pn = pn || 0;
		var reqUrl = url.replace(/(#\{pn\})/, pn),
			reqParams = reqUrl.split('?')[1];
		showBox = W(showBox);

		if( dataListCache && dataListCache[ encodeURIComponent(reqParams) ] ){
			var c_data = dataListCache[ encodeURIComponent(reqParams) ];

			var func = W('#jiFenDetailTpl').html().trim().tmpl();
			var html = func( c_data );
			showBox.html( html );

		}else{
			QW.Ajax.get(reqUrl, function(data){
				data = JSON.parse(data);

				var c_data = data.result;

				if(c_data.total == 0){
					showBox.html('<div style="text-align:center; font-size:14px; padding:10px;">暂无记录</div>');
				}else{						
					var func = W('#jiFenDetailTpl').html().trim().tmpl();
					var html = func( c_data );
					showBox.html( html );

					isCreatePager && showPager( Math.ceil( c_data.total/10), W(showBox).siblings('.pagination') , function(c_pn){
						getAjaxData(showBox, url, c_pn);
					});

					dataListCache[ encodeURIComponent(reqParams) ] = c_data;
				}
			});
		}
	}

	/**
	 * 分页
	 * @return {[type]} [description]
	 */
	function showPager(pagenum, box, callback){

		box = W(box);

		if(pagenum==1){
			box.one('.pages').hide().html('');
			return;
		}

		box.one('.pages').show();

		var pn = 0;
	    var pager = new Pager(box.one('.pages'), pagenum, pn);

	    pager.on('pageChange', function(e) {
 			callback && callback(e.pn);
	    });
	}

	//选中第一个tab
	W('.grade-tab li').item(0).fire('click');
	//选中第一个tab的子tab
	W('.show-section').item(0).one('.section-tab li').first().fire('click');
	W('.show-section').item(1).one('.section-tab li').first().fire('click');

	function checkNewRights(){
		//每次升级权限增加值。 格式： [升级级数，新增权限数];
		var rightsRiseList = [[1,1],[3,3],[6,4],[11,6],[16,5]];
		var riseNum = 0;
		var last_level = QW.Cookie.get('LAST_LEVEL') || 0;

		var now_level = window.__curr_level||0;

		if( last_level <3 && now_level>=3 && now_level<6 ){
			riseNum = rightsRiseList[1][1];
		}else{
			if( Math.ceil( now_level/5 ) - Math.ceil( last_level/5 ) > 0 ){
				for(var i=rightsRiseList.length-1; i>=0; i-- ){
					if( now_level >= rightsRiseList[i][0] ){
						riseNum = rightsRiseList[i][1];
						break;
					}
				}
			}
		}

		showNewRights(riseNum);

		W('.grade-tab [data-rel="tequan"]').on('click', function(e){
			showNewRights(0);
			QW.Cookie.set('LAST_LEVEL',now_level, { expires:30*24*3600*1000*12*5 });
		});
	}

	function showNewRights(num){
		var box = W('.new-rights-num');
		if(box.length==0){
			box = W('<div class="new-rights-num"><span class="num-left"></span><span class="num-center"></span><span class="num-right"></span></div>').appendTo( W('.grade-tab [data-rel="tequan"]') );
		}
		if(!num){
			box.hide();
		}else{
			box.show().one('.num-center').html( num );
		}
	}

	//检测是否升级并有新特权出现。
	checkNewRights();
});
