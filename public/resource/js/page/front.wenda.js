function formatTime(t) {
	var delta = SERVER_TIME - t,
		str;

	if(delta <= 0) {
		str = '1秒前';
	} else {
		if(delta > 172800) {
			str = (new Date(t * 1000)).format('YYYY.MM.dd');
		} else if(delta >=86400) {
			str = '昨天';
		} else {
			if(delta < 60) {
				str = '1分钟前';
			} else if(delta < 3600) {
				str = Math.floor(delta/60) + '分钟前';
			} else if(delta < 18000) {
				str = Math.floor(delta/3600) + '小时前';
			} else {
				str = '今天';
			}
		}
	}
	return str;
};



(function(){
	var currentCid,
		pageSize = 15,
		currentPage = 0,
		isHome = false;

	var CateList = {1:[{"n":"电脑知识","p":1,"c":15},{"n":"互联网","p":1,"c":16},{"n":"操作系统","p":1,"c":17},{"n":"软件","p":1,"c":18},{"n":"硬件","p":1,"c":19},{"n":"编程开发","p":1,"c":20},{"n":"360产品","p":1,"c":21},{"n":"电脑安全","p":1,"c":22},{"n":"资源分享","p":1,"c":23},{"n":"笔记本电脑","p":1,"c":24}],15:[{"n":"电脑配置","p":15,"c":174},{"n":"电脑日常维护","p":15,"c":175}],16:[{"n":"上网问题","p":16,"c":176},{"n":"新浪","p":16,"c":177},{"n":"腾讯","p":16,"c":178}],17:[{"n":"Windows XP","p":17,"c":179},{"n":"windows 7","p":17,"c":180},{"n":"Windows Vista","p":17,"c":181},{"n":"Windows 8","p":17,"c":572}],18:[{"n":"办公软件","p":18,"c":182},{"n":"网络软件","p":18,"c":183},{"n":"图像处理","p":18,"c":184},{"n":"系统软件","p":18,"c":185},{"n":"多媒体软件","p":18,"c":186}],19:[{"n":"硬盘","p":19,"c":187},{"n":"显示设备","p":19,"c":188},{"n":"CPU","p":19,"c":189},{"n":"显卡","p":19,"c":190},{"n":"内存","p":19,"c":191},{"n":"主板","p":19,"c":192},{"n":"键盘/鼠标","p":19,"c":193}],20:[{"n":"C/C++语言","p":20,"c":194},{"n":"C#/.NET语言","p":20,"c":195},{"n":"VC++语言","p":20,"c":196},{"n":"JAVA语言","p":20,"c":197},{"n":"数据库","p":20,"c":198},{"n":"VB","p":20,"c":199},{"n":"汇编语言","p":20,"c":200}],21:[{"n":"360安全卫士","p":21,"c":201},{"n":"360杀毒","p":21,"c":202},{"n":"360安全浏览器","p":21,"c":203},{"n":"360极速浏览器","p":21,"c":204},{"n":"360安全桌面","p":21,"c":205},{"n":"360云盘","p":21,"c":206},{"n":"360电脑专家","p":21,"c":207},{"n":"360企业版","p":21,"c":208},{"n":"360压缩","p":21,"c":209},{"n":"360驱动大师","p":21,"c":210},{"n":"360硬件大师","p":21,"c":211},{"n":"360游戏保险箱","p":21,"c":212},{"n":"360系统急救箱","p":21,"c":213},{"n":"360手机卫士","p":21,"c":214},{"n":"360手机助手","p":21,"c":215},{"n":"360手机浏览器","p":21,"c":216},{"n":"360pad浏览器","p":21,"c":217},{"n":"360手机桌面","p":21,"c":218},{"n":"360省电王","p":21,"c":219},{"n":"360安全通讯录","p":21,"c":220},{"n":"360手机云盘","p":21,"c":221},{"n":"360手机优化大师","p":21,"c":222},{"n":"360跑分王","p":21,"c":223},{"n":"360其他产品","p":21,"c":224}]};

	var getParentCateList = (function() {
		var list = {};

		for(var pid in CateList) {
			for(var i = 0; i < CateList[pid].length; i++) {
				var item = CateList[pid][i];
				list[item.c] = item;
			}
		}

		return function(cid) {
			if(cid == 1) {
				return [];
			}

			var item = list[cid],
				result = [item];

			while(item && item.p != 1) {
				item = list[item.p];
				result.push(item);
			}

			return result;
		}
	})();

	function buildCrumbList(cid) {
		if(!W('#crumbList').length) {
			return;
		}

		var html = ['<a href="/">同城帮</a> &gt; '];

		if(cid == 1) {
			html.push('问答中心 &gt; ');
		} else {
			html.push('<a href="#" data-cid="1">问答中心</a> &gt; ');
		}

		var list = getParentCateList(cid).reverse();

		list.forEach(function(item) {
			if(item.c == currentCid) {
				html.push(item.n,' &gt; ');
			} else {
				html.push('<a data-cid="',item.c,'" href="#">',item.n,'</a> &gt; ');
			}
		});

		W('#crumbList').html(html.join('').replace(/ &gt; $/, ''));
	};

	function buildCateList(cid) {
		if(!W('#cateList').length) {
			return;
		}

		var html = [],
			data = CateList[cid];

		if(data) {
			data.forEach(function(item) {
				if(item.c == currentCid) {
					html.push('<li><span>',item.n,'</span></li>');
				} else {
					html.push('<li><a data-cid="',item.c,'" href="#">',item.n,'</a></li>');
				}
			});
			W('#cateList').html(html.join(''));
		} else {
			var list = getParentCateList(cid);
			if(!list || list.length < 1) {
				throw new Exception('err');
			}

			buildCateList(list[0].p);
		}
	};

	var itemListCache = {};
	function buildItemList(cid) {
		var build = function(data) {
			var func, html;

			if(isHome) {
				func = W("#tplItemForIndex").html().trim().tmpl();
			} else {
				func = W("#tplItem").html().trim().tmpl();
			}

			html = func(data);

			W('#itemList').html(html);

			var pages = parseInt(data.total / pageSize);

			if(data.total % pageSize != 0) {
				pages++;
			}

			if(!W('#itemListPager').length) {
				return;
			}

			var pager = new Pager(W('#itemListPager .pages'), pages, currentPage);
		    pager.on('pageChange', function(e) {
		    	currentPage = e.pn;
		    	buildItemList(currentCid);
		    	if(!isHome) {
		    		location.hash = '!cid=' + currentCid + '&pn=' + currentPage;
		    	}
		    	window.scrollTo(0, W('#itemList').getXY()[1]);
		    });
		};

		var params = 'page=' + (currentPage+1) + '&cid=' + currentCid + '&pagesize=' + pageSize;

		if(itemListCache[params]) {
			build(itemListCache[params]);
		} else {
			Ajax.get('/ajask/get_asklist/?' + params, function(e) {
				var ret = e.evalExp();

				var data = ret.result.data;
				itemListCache[params] = data;
				build(data);
			});
		}
	};

	function buildAll(cid) {
		cid = cid || currentCid;

		buildCateList(cid);
		buildCrumbList(cid);
		buildItemList(cid);

	};


	W('#cateList, #crumbList, #itemList').delegate('a[data-cid]', 'click', function(e) {
		e.preventDefault();

		currentCid = parseInt(W(this).attr('data-cid'), 10);
		currentPage = 0;
		
		buildAll(currentCid);

		location.hash = '!cid=' + currentCid;
		window.scrollTo(0, 0);
	});

 	var listOpenItem = null;

	tcb.bindEvent('.mod-wenda', {
		'#itemList .wenda-item' : {
			'mouseenter' : function() {
				var el = W(this);
				!el.hasClass('open') && el.addClass('hover');
			},
			'mouseleave' : function() {
				W(this).removeClass('hover');
			}
		},
		'#itemList .tit' : function(e) {
			e.preventDefault();
			var el = W(this),
				li = el.parentNode('li');

			if(li.hasClass('open')) {
				li.query('.btn-unfold').click();
				listOpenItem = null;
			} else {
				if(listOpenItem && li !== listOpenItem) {
					listOpenItem.removeClass('open').query('.result').hide();
				}
				listOpenItem = li;

				var body = W(Browser.webkit?document.body:document.documentElement);

				if(li.query('.result').length < 1) {
					var id = li.attr('data-askid');
					Ajax.get('/ajask/get_askinfo/?askid=' + id, function(e) {
						if(li.query('.result').length) {
							li.query('.result').slideDown(150, null, Easing.easeOutStrong);
							body.animate({'scrollTop' : li.getXY()[1]}, 150, null, Easing.easeOutStrong);
							return;
						}

						var ret = e.evalExp(),
							data = ret.result.data,
							func,
							newEl;

						if(isHome) {
							func = W('#tplItemDetailForIndex').html().tmpl();
						} else {
							func = W('#tplItemDetail').html().tmpl();
						}

						newEl = W(func(data).trim());
						li.appendChild(newEl);
						body.animate({'scrollTop' : li.getXY()[1]}, 150, null, Easing.easeOutStrong);

						if(Browser.ie6) {
							var innerHeight = newEl.query('.cont').getRect().height;
							if(200 > innerHeight) {
								newEl.query('.cont-unit').css('height', innerHeight + 100);
							}
						}
					});
				} else {
					li.query('.result').slideDown(150, null, Easing.easeOutStrong);
					body.animate({'scrollTop' : li.getXY()[1]}, 150, null, Easing.easeOutStrong);
				}
				
				li.addClass('open').removeClass('hover');
			}
		},
		'#itemList .btn-unfold' : function(e) {
			e.preventDefault();
			var el = W(this),
				li = el.parentNode('li');

			li.query('.result').slideUp(150, function() {
					li.removeClass('open');
				}, Easing.easeOutStrong);
		},
		'.daily-ranking .tab-1 a':function(e){
			e.preventDefault();
			W('.daily-ranking .tab-1 li').removeClass('active');
			W(this).ancestorNode('li').addClass('active');
			if(W(this).ancestorNode('li').hasClass('last')){
				W('.daily-ranking .total-list').show()
				W('.daily-ranking .day-list').hide();
			}else{
				W('.daily-ranking .total-list').hide()
				W('.daily-ranking .day-list').show();
			}

		}
	});

	window.initWenda = function(_isHome, _pageSize) { //isHome == true表示这是首页，否则是问答频道页
		isHome = !!_isHome;
		pageSize = _pageSize || pageSize;

		try {
			var hash = location.hash.replace('#!', '');

			currentCid = parseInt(hash.queryUrl('cid'), 10) || 1,
			currentPage = parseInt(hash.queryUrl('pn'), 10) || 0;

			buildAll();
		}catch(e) {
			currentCid = 1;
			currentPage = 0;
			buildAll();
		}
	};
})();