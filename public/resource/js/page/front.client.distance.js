(function(){
	var __areaSel;

	var dataListCache = {};
	var __pn = 0;
	var __totalPn = 0;
	var __isLoading = false;
	var __lngLat = null;

	var contentBox = W('#merRepairWrap');

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

			var durl = __lngLat ? '/client/aj_distance/?from=client&' : '/client/search/?async=1&'; //如果没有解析到地址，进行关键字搜索
			var searchType = __lngLat ? 'poi' : 'keyword';

			QW.Ajax.get(durl + Object.encodeURIJson(param),function(e){
				showLoading(false);
				__isLoading = false;

				var ret = e.evalExp();
				ret.shop_data = ret.data || [];
				ret._searchType = searchType;
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
			'area_id': '',
			'quan_id': '',
			'service_id': srid,
			'type_id':W("#dianpuSort").val(),						
			'pagesize':10,
			'lng' : __lngLat? __lngLat.lng : '',
			'lat' : __lngLat? __lngLat.lat : '',
			'keyword' : search_addr||'' //模板中赋值
		}

	}

	function bindEvent(){
		tcb.bindEvent(document.body, {
            // 显示地图
			'.show-map': function(e){
                e.preventDefault();

                var el = W(this);

                new bigMap().show( el.attr('data-shopid'), true );
			},
            // 显示完整号码
            '#showBigMap .pop-window .tel a': function(e){
                e.preventDefault();

                var wMe = W(this),
                    tel = wMe.attr('data-tel');

                wMe.siblings('.tel-num').html(tel);
                wMe.hide();
                wMe.siblings('.tel-tip').show();

                var shop_id = wMe.attr('shop-id');
                new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpu_map1&inclient=1";
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
		__lngLat = null;	
		contentBox.html('');

	}

	//获取poi
	function getGeoPoi(addr, callback){
        var mapBox = W('<div id="geoMapBox"></div>').appendTo( W('body') ).hide();
        var _map = new AMap.Map("geoMapBox"); 
        // 加载地理编码插件 
        _map.plugin(["AMap.Geocoder"], function() {
            MGeocoder = new AMap.Geocoder({
                city : W('.area-box-sel').html() || '',
                radius: 1000,
                extensions: "all"
            });
            //返回地理编码结果
            AMap.event.addListener(MGeocoder, "complete", function(datas){
                var pos = null;
                if(datas && datas['resultNum'] > 0 ){
                    pos = {
                        'lng': datas['geocodes'][0]['location']['lng'],
                        'lat': datas['geocodes'][0]['location']['lat']
                    }                    
                }

                callback(pos);
            });
            //逆地理编码
            MGeocoder.getLocation(addr);
        });
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
		getLocationAndSearch();

		// 激活面板选择
        __areaSel = new bang.AreaSelect({
        	//when initial, set the default addr.
        	'data':{
	        	'areacode': window.location.search.queryUrl('area_id')||'',
	            'areaname': window.location.search.queryUrl('areaname')||''
            },
        	//don't show Shangquan
        	'hasquan' : false,
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

	        	//清空当前搜索项
	        	W('#addrSearchForm [name="addr"]').val(''); 
	        	//切换区县
	        	doAddrSearch();
	        },
	        // 区县选择时触发
	        'onAreaSelect': function(data){
	        	//reset form data
	        	W('#addrSearchForm [name="cityname"]').val( data.cityname ||'' );
	        	W('#addrSearchForm [name="areaname"]').val( data.areaname ||'' );
	        	W('#addrSearchForm [name="area_id"]').val( data.areacode ||'' );

	        	//清空当前搜索项
	        	W('#addrSearchForm [name="addr"]').val(''); 
	        	//切换区县
	        	doAddrSearch();	        	
	        },
	        // 商圈选择时触发
	        'onQuanSelect': function(data){
	        	
	        }
        });

		bindEvent();  

		initAddrSearch('#addrSearchForm .addr-ipt');    
	}

	init();
})();