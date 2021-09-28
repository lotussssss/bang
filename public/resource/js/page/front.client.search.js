Dom.ready(function(){
	var dataListCache = {};
	var __pn = 0;
	var __totalPn = 0;
	var __isLoading = false;

	var contentBox = W('#jsSearchResult');

	/**
	 * 商家维修信息
	 * @param  {[type]} pn   [description]
	 * @param  {[type]} flag [description]
	 * @return {[type]}      [description]
	 */
	function asynMerRepair(pn,flag,gdata){
		var	html = '';
		var param = getMerSelectParam();
			param['pn'] = pn;
			pageSize =param.pagesize;

		if(dataListCache[Object.encodeURIJson(param)]||gdata){
			try{
				W('.no-result').hide();
				var _data = dataListCache[Object.encodeURIJson(param)]||gdata;
				_data.tplHasShowWarn = W('.no-valid-warn').length==0? false : true; //是否已经加入了未认证警告
				var func = W("#merRepairTpl").html().trim().tmpl();
				html = func(_data);

				contentBox.insertAdjacentHTML( 'beforeend', html);
				getShopExpert( _data );

				flag && merRepairPager(Math.ceil(_data.page_count/pageSize));

				checkShowRelPrj(_data);
			}catch(ex){}

		}else{
			showLoading(true);
			__isLoading =true;

			QW.Ajax.get('/client/search/?async=1&'+ Object.encodeURIJson(param),function(e){
				showLoading(false);
				__isLoading = false;

				var ret = e.evalExp();
				
				ret.shop_data = ret.data;
				ret._showProductMode = getMerSelectParam().show_mode;
				ret.tplHasShowWarn = W('.no-valid-warn').length==0? false : true; //是否已经加入了未认证警告

				if(!ret.shop_data && __pn==0){
					W('.no-result').show();
				}else{
					if(ret.shop_data.length==0 && __pn==0){
						W('.no-result').show();
					}else{
						W('.no-result').hide();
						dataListCache[Object.encodeURIJson(param)] = ret;
						var func = W("#merRepairTpl").html().trim().tmpl();
						html = func(ret);

						getShopExpert( ret );
					}
				}

				contentBox.insertAdjacentHTML( 'beforeend', html);
				
				flag && merRepairPager(Math.ceil(ret.page_count/pageSize));

				checkShowRelPrj(ret);

			});
		}


	}

	/**
	 * 获取在线专家
	 * @param  {[type]} ret [description]
	 * @return {[type]}      [description]
	 */
	function getShopExpert( ret ){
		//在鲁大师客户端中不触发此功能
		if( QW.Cookie.get('C_RUNIN_LDS') ){
			return;
		}

		var shopids = ret.data.map( function(el){ return el.shop_id; } );
		QW.Ajax.get( '/aj/get_zjinfo/?shop_ids=' + shopids.join(','), function(rs){
			var data = QW.JSON.parse(rs);
			if(!data.errno){
				var experts = data.result;
				for(var i=0, n=Math.min(1, experts.length); i<n; i++ ){
					var item = experts[i];					
					W('#jsSearchResult .shop-expert[data-shopid="'+item.shop_id+'"]').appendChild(
						W('<a href="#" class="e-a-box lunch-expert '+item.zj_qid+'" data-eid="'+item.zj_qid+'" title="'+item.zj_name+'"></a>')
					);
				}
			}
		} );
	}

	/**
	 * 商家维修分页
	 * @return {[type]} [description]
	 */
	function merRepairPager(pagenum){

		__totalPn = pagenum;
	}

	/**
	 * 获得商家进行过滤的参数
	 */
	function getMerSelectParam(){
		var cityselector = W('#citySelector');
		return {
			'city_id': cityselector.one('.sel-city').attr('code')||'',
			'area_id': cityselector.one('.sel-quxian').attr('code')||'',
			'quan_id': cityselector.one('.sel-shangquan').attr('code')||'',
			'service_id': location.href.queryUrl('service_id') || 0,
			'type_id':W("#dianpuSort").attr('data-type'),			
			'keyword':keyword,
			'pagesize':18,
			'show_mode' : W('.search-modes .curr').attr('data-mode') || 'product',
			'tag_id' : W('.search-rel-projects').attr('data-tid') || W('.search-rel-projects .tag-item.curr').attr('data-tid') || 0
		}

	}

	function bindEvent(){
		tcb.bindEvent(document.body, { 						
			'.sort-type-list' : {
				'click' : function(e){

					if( W(this).one('.dianpu-sort').css('display')=='none' ){
						W(this).one('.dianpu-sort').show();
					}else{
						W(this).one('.dianpu-sort').hide();
					}
				}
			},
			'.dianpu-sort li' : function(e){				
				if( W(this).hasClass('active') ){
					//do nothing..					
				}else{
					W(this).addClass('active').siblings('.active').removeClass('active');
					//W('.dianpu-sort').hide();
					W('#dianpuSort').html( W(this).html().trim() ).attr('data-type', W(this).attr('data-type') );

					resetParam();
					asynMerRepair(0,true);	
				}			
			},
			'.search-modes .mode-item' : function(e){
				if( W(this).hasClass('curr') ){
					//do nothing..	
				}else{
					W(this).addClass('curr').siblings('.curr').removeClass('curr');					

					resetParam();
					asynMerRepair(0,true);	
				}
			},
			//查看图文方案
			'.see-pt-prj' : function(e){
				e.preventDefault();
				var url  = W(this).attr('data-url');
				if(url){
					var config = {
						width : 710,
						height: 420
					};
					url += (url.indexOf('?')>-1? '&' : '?') + 'from=tcbclient&keyword='+keyword;
					tcb.panel('图文方案', '<iframe width="710" height="387" src="'+url+'" scrolling="auto" frameborder="0"></iframe>', config);
				}
			},
			//搜索结果中tag点击
			'.dp-item .tag-item' : function(e){
				e.preventDefault();
				var tid = W(this).attr('data-tid');
				W('.search-rel-projects').attr('data-tid', tid);

				var nowTag = W('.search-rel-projects .tag-item[data-tid='+tid+']');

				if(nowTag.length > 0){
					nowTag.fire('click');	
				}else{
					
					setTimeout(function(){ 
						resetParam();
						asynMerRepair(0, true);				
					} , 50);
				}
			},
			//启动专家咨询
			'#jsSearchResult .lunch-expert' : function(e){
				e.preventDefault();			

				try{
					//总部嵌入的页面需要调用此方法！！！
	        		window.external.FolkStartConsult( W(this).attr('data-eid') );
	        	}catch(ex){
	        		alert("抱歉，出错了，请您更新或安装360安全卫士。");
	        	}
			}
		});

		W('body').bind('click', function(e){			
			if( W('.sort-type-list .dianpu-sort').css('display')!='none' && !(W('.sort-type-list').contains(e.target) ||   W('.sort-type-l')[0] == e.target) ){
				W('.sort-type-list .dianpu-sort').hide();
			}
		});

		W('.page-client .client-body').bind('scroll', function(e){
			var dpArea = W(this).one('.dianpu-area');
			var boxST = W(this).attr('scrollTop');
			var boxCH = W(this).getRect().height;

			if( !__isLoading && (__pn < __totalPn-1) && (boxCH + boxST +50 >= dpArea.getRect().height) ){
				__pn++;				
				asynMerRepair(__pn, true);

			}
		});

		W('#addrSearchForm').bind('submit', function(e){
			e.preventDefault();
			var _this = this;
			var ipt = W(this).one('[name="addr"]');
			var txt = ipt.val();
			if( txt =='' || txt == ipt.attr('data-default') ){
				/*ipt.focus();
				if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(ipt);*/
				ipt.val('');
				W(this).attr('action', '/client/findshop'); //没有输入地址时跳转到区县筛选	
				setTimeout( function(){ W(_this)[0].submit(); },100);
			}else{
				W(this).attr('action', '/client/distance');
				setTimeout( function(){ W(_this)[0].submit(); },100);
			}
		});
	}

	function showLoading(isshow){
		var loadHTML = W("#loadingTpl").html();
		if(isshow){
			W('.dianpu-area').one('.loading-content').show();
		}else{
			W('.dianpu-area').one('.loading-content').hide();
		}
	}

	function resetParam(){

		__pn = 0;
		__totalPn = 0;
		__isLoading = false;
		contentBox.html('');

	}

	/**
	 * 设置搜索后的默认值
	 */
	function setValue(){
		var _iptvalue = keyword||W("#360tcb_so").attr('data-default');
		if(!W("#360tcb_so").val()){
			W("#360tcb_so").val(decodeURIComponent(_iptvalue));
		}
	}

	function initAddrSearch(obj){
		new AddrSuggest(obj, {
			'showNum' : 6,
			'onSelect' : doAddrSearch,
			'requireCity' : function(){ return W('#citySelector .sel-city .sel-txt').html() || '' }
		});
	}

	function doAddrSearch(txt){		
		W('#addrSearchForm').fire('submit');
	}

	//更多tag
	var _hasBindShowTagEvt = false;
	function checkShowRelPrj(data){
		var box = W('.search-rel-projects');	

		if(!Object.isArray(data.tag_list) || data.tag_list.length == 0){
			box.hide();
			//调整搜索结果区域高度
			W('.client-body').removeClass('height403');
			return;
		}else{
			box.show();
			var oldTid = W('.search-rel-projects .tag-item.curr').attr('data-tid')||0;
			data.selectTagId = oldTid;
			//调整搜索结果区域高度
			W('.client-body').addClass('height403');
			box.one('.prj-num').html( data.tag_list.length );
			box.one('.s-projects-box').html('');
			box.one('.s-moreshow').html('');
		}
		
		var func = W("#searchRelPrjTpl").html().trim().tmpl();
		var	html = func(data);

		box.one('.s-projects-box').html( html );

		var moreshow = box.one('.s-moreshow');

		var baseTop = box.query('.s-projects-box .tag-item').first().getRect().top;

		var tags = box.query('.s-projects-box .tag-item');
		
		for(var i=0, n=tags.length; i<n; i++){
			if( tags.item(i).getRect().top - baseTop >10 ){
				moreshow.append( tags[i] );
			}
		}

		if( moreshow.query('.tag-item').length>0  ){
			box.one('.s-opr-more').show();
		}else{
			box.one('.s-opr-more').hide();
		}
		

		//绑定事件
		if(! _hasBindShowTagEvt){

			_hasBindShowTagEvt = true;

			box.delegate('.s-opr-more', 'click', function(e){
				e.preventDefault();
				W(this).hide();
				box.one('.s-opr-less').show();
				moreshow.show();
			});

			box.delegate('.s-opr-less', 'click', function(e){
				e.preventDefault();
				W(this).hide();
				box.one('.s-opr-more').show();
				moreshow.hide();
			});

			W('body').on('click', function(e){
				if(moreshow.css('display')!='none' && e.target != box.one('.s-opr-more')[0] && !box.one('.s-opr-more').contains(e.target) ){
					box.one('.s-opr-less').hide();
					box.one('.s-opr-more').show();
					moreshow.hide();
				}
			});		

			box.delegate('.tag-item', 'click', function(e){
				e.preventDefault();					
				if( W(this).hasClass('curr') ){
					return false;
				}else{
					box.attr('data-tid','');
					box.query('.tag-item.curr').removeClass('curr');
					W(this).addClass('curr');
					resetParam();
					asynMerRepair(0,true);
				}
			});

		}
		
	}

	function init(){
		asynMerRepair(0,true);

		bindEvent();

		// 激活面板选择
        new AreaSelect({
        	// 城市选择时触发
	        'onCitySelect': function(data){
	        	QW.Cookie.set('CITY_NAME',data.cityid+'|'+data.citycode+'|'+data.cityname,{'expires':30*24*3600*1000, 'domain':'.bang.360.cn', 'path':'/' });
	        	resetParam();
	        	asynMerRepair(0,true);
	        	//异步请求可以修改城市。所以这里不用调整修改城市了。
	        	/*var whref = window.location.href.replace(/(\&|\?)city_id=\w+/ig,'').replace(/(\&|\?)city=\w+/ig,'');
	        	window.location.href =  whref + (whref.indexOf('?')>-1?'&':'?' ) +'city_id=' + data.citycode;*/
	        },
	        // 区县选择时触发
	        'onAreaSelect': function(data){
	        	resetParam();
	        	asynMerRepair(0,true);	        	
	        	W('.search-tit .bread-city').html( data.cityname + (data.areaname? "-" + data.areaname : '') );
	        },
	        // 商圈选择时触发
	        'onQuanSelect': function(data){
	        	resetParam();
	        	asynMerRepair(0,true);
	        	W('.search-tit .bread-city').html( data.cityname + "-" + data.areaname + (data.quanname? "-" + data.quanname : '') );
	        }
        });
		
		initAddrSearch('#addrSearchForm .addr-ipt');		
	}

	init();
});