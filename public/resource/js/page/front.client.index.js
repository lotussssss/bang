(function(){
	var dataListCache = {};
	var __pn = 0;
	var __totalPn = 0;
	var __isLoading = false;

	var contentBox = W('#merRepairWrap');

	/**
	 * 商家维修信息
	 * @param  {[type]} pn   [description]
	 * @param  {[type]} flag [description]
	 * @return {[type]}      [description]
	 */
	function asynMerRepair(pn,flag,gdata, initData){
		var	html = '';
		var param = getMerSelectParam();
			Object.mix(param, initData, true);
			param['pn'] = pn;				
			pageSize =param.pagesize;

		if(dataListCache[Object.encodeURIJson(param)]||gdata){
			W('.no-result').hide();
			var _data = dataListCache[Object.encodeURIJson(param)]||gdata;
			_data.tplHasShowWarn = W('.no-valid-warn').length==0? false : true; //是否已经加入了未认证警告
			var func = W("#merRepairTpl").html().trim().tmpl();
			html = func(_data);

			contentBox.insertAdjacentHTML( 'beforeend', html);

			flag && merRepairPager(Math.ceil(_data.page_count/pageSize));

		}else{
			showLoading(true);
			__isLoading =true;

			QW.Ajax.get('/at/shop?from=client&'+ Object.encodeURIJson(param),function(e){
				showLoading(false);
				__isLoading = false;

				var ret = e.evalExp();
				ret.tplHasShowWarn = W('.no-valid-warn').length==0? false : true; //是否已经加入了未认证警告

				if(parseInt(ret.errno)!==0 && __pn==0){
					W('.no-result').show();
				}else{
					if(ret.shop_data.length==0 && __pn==0){
						W('.no-result').show();
					}else{
						W('.no-result').hide();
						dataListCache[Object.encodeURIJson(param)] = ret;
						var func = W("#merRepairTpl").html().trim().tmpl();
						html = func(ret);
					}
				}

				contentBox.insertAdjacentHTML( 'beforeend', html);
				
				flag && merRepairPager(Math.ceil(ret.page_count/pageSize));

			});
		}


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
		var srid = location.href.queryUrl('service_id') || 0;		
		return {
			'city_id': cityselector.one('.sel-city').attr('code')||'',
			'area_id': cityselector.one('.sel-quxian').attr('code') || '',
			'quan_id': cityselector.one('.sel-shangquan').attr('code')||'',
			'service_id': srid,
			'type_id':W("#dianpuSort").attr('data-type'),						
			'pagesize':18
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

	//尝试获取位置并搜索
	function getLocationAndSearch(){
		resetParam();
		var addr = W('#addrSearchForm [name="cityname"]').val() + W('#addrSearchForm [name="areaname"]').val() + W('#addrSearchForm [name="addr"]').val()||search_addr; //模板中赋值
		getGeoPoi(addr, function(poi){
			__lngLat = poi;
			asynMerRepair(0,true);
		});
	}

	function init(){
		var urlarea = window.location.search.queryUrl('area_id');
		if(urlarea){
			asynMerRepair(0,true, null, {'area_id':urlarea});
		}else{
			asynMerRepair(0,true);
		}		

		//选择城市，刷新页面
		// selectCity('.citypanel_trigger');

		bindEvent();

        // 激活面板选择
        new bang.AreaSelect({
        	//when initial, set the default addr.
        	'data':{
	        	'areacode': window.location.search.queryUrl('area_id')||'',
	            'areaname': window.location.search.queryUrl('areaname')||''
            },
        	// 城市选择时触发
	        'onCitySelect': function(data){
	        	//reset form data
	        	W('#addrSearchForm [name="cityname"]').val( data.cityname );
	        	W('#addrSearchForm [name="city"]').val( data.citycode );	        	
	        	W('#addrSearchForm [name="areaname"]').val( '' );
	        	W('#addrSearchForm [name="area_id"]').val( '' );
	        	
	        	//set cookie.
	        	QW.Cookie.set('CITY_NAME', data.cityid+'|'+data.citycode+'|'+data.cityname,{'expires':30*24*3600*1000, 'domain':'.bang.360.cn', 'path':'/' });
	        	new Image().src = "/aj/qiehuan_city/?citycode=" + data.citycode;  //Do this make the browser city cookie change.

	        	//change the BREAD txt
	        	W('.search-tit .bread-city').html( data.cityname  );

	        	//get shop data.
	        	resetParam();
	        	asynMerRepair(0,true);	 
	        },
	        // 区县选择时触发
	        'onAreaSelect': function(data){
	        	//reset form data
	        	W('#addrSearchForm [name="cityname"]').val( data.cityname ||'' );
	        	W('#addrSearchForm [name="areaname"]').val( data.areaname ||'' );
	        	W('#addrSearchForm [name="area_id"]').val( data.areacode ||'' );

	        	resetParam();
	        	asynMerRepair(0,true);	        	
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
})();