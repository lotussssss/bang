;/**import from `/resource/js/component/citypanel.js` **/
(function() {
	function CityPanel() {
		this.init.apply(this, arguments);
	};

	CityPanel.prototype = (function() {
		return {
			init : function(trigger) {
				var instance = this;
				CustEvent.createEvents(this);

                if(!CityPanel.prototype._documentBind){
                	W(window).on('resize', function(e){
                		//窗口大小变化时重新触发
                		if(instance.container.css('display')!="none"){
	                		setTimeout(function(){
	                			try{ W(trigger).fire('click'); }catch(ex){}
	                		}, 100);
                		}
                	});
                    W(document).on('keydown', function(e) {
                        if(e.keyCode == 27) {
                            instance.container.hide();
                            instance.fire('close');
                        }
                    }).on('click', function(e) {
                            var flag = false;
                            CityPanel.prototype._triggerList.forEach(function(tri){
                                tri.forEach(function(el) {
                                    var trigger = W(el);

                                    if(trigger[0] == e.target || trigger.contains(e.target)) {
                                        flag = true;
                                    }
                                });
                            });

                            if( !flag && (!instance.container[0] == e.target || !instance.container.contains(e.target)) ) {

                                instance.container.fadeOut(150);
                                instance.fire('close');
                            }
                        });
                    CityPanel.prototype._documentBind = true;
                }

				this.container = W('#city_list')
					.delegate('.close', 'click', function(e) {
							e.preventDefault();

							instance.container.hide();
							instance.fire('close');
						})
					.delegate('.filter_bar a', 'click', function(e) {
							e.preventDefault();

							var el = W(this),
								letter = el.html().trim();

							if(el.hasClass('current')) return;

							instance.container.query('.filter_bar a').removeClass('current');
							instance.container.query('.city_wrap p').hide();
							el.addClass('current');
							instance.container.query('.city_wrap p.' + letter).show();
						});

				this.trigger = W(trigger).click(function(e) {
                    e.preventDefault();

                    var pos = W(this).getRect();
                    //是否关闭一直出现
                    if(W(this).attr('data-close')=='hide'){
                        W('#city_list .city_close').hide();
                    }else{
                        W('#city_list .city_close').show();
                    }
                    if (W(this).attr('x-offset')) {
                        instance.container
                        .css({'left' : pos.left - W(this).attr('x-offset'), 'top' : pos.height + pos.top + 5})
                        .fadeIn(150);
                    }
                    else if( W(this).attr('data-floatright') ){
                        instance.container
                        .css({'left' : pos.left - 380, 'top' : pos.height + pos.top + 5})
                        .fadeIn(150);
                    }else{
                        instance.container
                        .css({'left' : pos.left, 'top' : pos.height + pos.top + 5})
                        .fadeIn(150);
                    }

                    //修正IE7下相关bug。IE7，360IE模式下，父级还有position:fixed, 上面的pos.top的值获取不正确，需要修正。需要把posisiton为fixed的父级点传到data-parentfixed参数里。如data-parentfixed="#doc-menubar-fixed"
                    if( W(this).attr('data-parentfixed') ){
                        var pf =W(this).ancestorNode( W(this).attr('data-parentfixed') );
                        var poffsettop =  W(this).attr('data-parenttop')-0 || 30;
                        var scrTop = document.documentElement.scrollTop || document.body.scrollTop;

                        if( pf.length>0 && pf.css('position')=='fixed' &&  scrTop > 0 && pos.top<scrTop+ poffsettop  ){
                            instance.container.css('top',   pos.height + pos.top + 5 + scrTop);
                        }
                    }

                    instance.fire('onShow');

                    instance.container
                        .undelegate('p a')
                        .delegate('p a', 'click', function(e) {
                            e.preventDefault();

                            var name = this.innerHTML,
                                city = this.getAttribute('data-city'),
                                cityid = this.getAttribute('cityid');
                            if(!name || !city) return;

                            instance.fire('selectCity', {'name' : name, 'city' : city, 'cityid': cityid});
                            instance.container.hide();
                        });
                });
                // 将trigger添加到所有的trigger列表里
                CityPanel.prototype._triggerList.push(this.trigger);
			},
            _triggerList: [],
            _documentBind: false // 是否已经写过了document的事件绑定
		}
	})();

	QW.provide({'CityPanel' : CityPanel});
})();

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

;/**import from `/resource/js/component/addr_suggest.js` **/
function AddrSuggest( obj, conf){
	if(W( obj ).length==0){ return null; }
	conf = conf || {};

	this.obj = W( obj );
    this.curObj = null;
	this.data = null;
	this.suglist = null;
	this.defsug = null;
	this.showNum = conf.showNum || 10; //sug列表项数量
	this.onSelect = conf.onSelect || null; //选中某项时的回调
	this.requireCity = conf.requireCity || function() { return '';}  //当前城市获取回调
	this.noDefSug = conf.noDefSug || false;  //是否不显示默认提示？
	this.zIndex = conf.zIndex||999;

	this._cacheData = {};

	var mapObj;
	var _this = this;

	this.init = function(){
		var _this = this;
		if( !(AMap && AMap.Map) ){
			setTimeout(function(){ _this.init() }, 300);
			return false;
		}

		var _tmpdiv = "aMapContainer" + Math.ceil(Math.random()*10000);
		W('<div id="'+_tmpdiv+'"></div>').appendTo( W('body') ).hide();

		mapObj = new AMap.Map( _tmpdiv );

		this.createDropList();
		this.createDefSug();

		this.showDefaultTxt();

		this.bindEvent();
	}

	this.bindEvent = function(){
		var _obj = this.obj;

		_obj.on('focus', function(){
            var wMe = W(this),
                deftxt = wMe.attr('data-default')||'';

            _this.setCurObj(wMe);

			_this.resetSugListPos(_this.suglist);
			_this.resetSugListPos(_this.defsug);

			if( deftxt == wMe.val() ){
                wMe.val('');
				if(!_this.noDefSug){
					_this.defsug.show().css({
                        'z-index' : tcb.zIndex()
                    })
				}
			}else if(wMe.val().length>0){
				_this.fetchSug( wMe.val() );
				_this.defsug.hide()
			}
            wMe.removeClass('default');
		});

		_obj.on('blur', function(){
            var wMe = W(this),
                txt = wMe.val(),
                deftxt = wMe.attr('data-default')||'';

            if(txt =='' &&  deftxt){
                wMe.val( deftxt );
                txt = deftxt;
			}
			setTimeout(function(){ _this.suglist.hide(); } ,160);
            if (txt==deftxt) {
                wMe.addClass('default');
            }
            _this.defsug.hide();
		});

		_obj.on('keyup', function(e){
            var wMe = W(this),
                deftxt = wMe.attr('data-default')||'';

            _this.setCurObj(wMe);

            if(e.keyCode == 38){
				_this.selectItem(-1);
			}else if(e.keyCode == 40){
				_this.selectItem(1);
			}else if(e.keyCode == 13){				
				var nowsel = _this.suglist.one('.on');
				if( nowsel.length>0 ){
					nowsel.fire('click');
				}
			}else{
				if( wMe.val()!='' && wMe.val()!= deftxt ){
					_this.fetchSug( wMe.val() );
					_this.defsug.hide();
				}else{
					_this.suglist.hide();

					if(!_this.noDefSug){
						_this.defsug.show().css({
                            'z-index' : tcb.zIndex()
                        })
					}
				}
			}
		});	

		_obj.on('input', function(e){
            var wMe = W(this),
                deftxt = wMe.attr('data-default')||'';

            _this.setCurObj(wMe);

            if(e.keyCode == 38){
				_this.selectItem(-1);
			}else if(e.keyCode == 40){
				_this.selectItem(1);
			}else if(e.keyCode == 13){				
				var nowsel = _this.suglist.one('.on');
				if( nowsel.length>0 ){					
					nowsel.fire('click');
				}
			}else{
				if( wMe.val()!='' && wMe.val()!= deftxt ){
					_this.fetchSug( wMe.val() );
					_this.defsug.hide();
				}else{
					_this.suglist.hide();

					if(!_this.noDefSug){
						_this.defsug.show().css({
                            'z-index' : tcb.zIndex()
                        })
					}
				}
			}
		});	

		_obj.on('keypress', function(e){
			if(e.keyCode == 13){ //如果当前有选中项，就阻止默认表单提交事件。（在keyup事件中处理具体选中流程）
				var nowsel = _this.suglist.one('.on');
				if( nowsel.length>0 ){
					e.preventDefault();
				}
			}
		});		

		_this.suglist.delegate('.ui-addrsug-sugitem', 'click', function(e){
			var name = W(this).attr('data-name');
			var wholename = W(this).attr('data-whole');

            var _curObj = _this.getCurObj();

            _curObj.val( wholename );
			if(_this.suglist && _this.suglist.css('display')!='none'){
				_this.suglist.hide();
			}
			if(_this.onSelect){
				_this.onSelect(wholename);
			}
		});
	};

    // 显示默认文字
	this.showDefaultTxt = function(){
		var _obj = this.obj;
        if (_obj && _obj.length>0) {
            _obj.forEach(function(el, i){
                var wEl = W(el);
                var deftxt = wEl.attr('data-default')||'';
                if( wEl.val()=='' &&  deftxt){
                    wEl.val( deftxt );
                }
                wEl.addClass('default');
            });
        }
	};
    // 获取当前obj
    this.getCurObj = function() {
        return this.curObj || this.obj;
    };
    // 获取当前obj
    this.setCurObj = function(curObj) {
        this.curObj = curObj || this.obj;

        return this.curObj;
    };

	this.fetchSug = function(txt){
		try{
			var cData = _this._cacheData[ encodeURIComponent(_this.requireCity()+'-'+txt) ];
			if(cData){
				_this.gotData(cData);
			}else{
				//加载输入提示插件  
			    mapObj.plugin(["AMap.Autocomplete"], function() {  
			        var autoOptions = {
			            city: _this.requireCity() //城市，默认全国  
			        };
			        var auto = new AMap.Autocomplete(autoOptions);
			        //查询成功时返回查询结果  
			        AMap.event.addListener(auto,"complete", function(data){ 
			        	_this._cacheData[ encodeURIComponent(_this.requireCity()+'-'+txt) ]=data;
			        	_this.gotData(data);
			        });
			        auto.search(txt);
			    });
		    }
		}catch(ex){//Something wrong was here, but I can't find it out. So, Try-Catch it.

		}
	}

	this.gotData = function(data){		
		if(data && data.tips){
			_this.render( data.tips );
		}else{
			_this.suglist.hide();
		}
	}

	this.createDropList = function(){
		var suglist = W('<div class="ui-addrsug-suglist">').appendTo( W('body') ).hide()

		this.suglist = suglist;

		this.resetSugListPos(suglist);
	}

	this.resetSugListPos = function( suglist){
        var cur_obj = _this.getCurObj();

		var rect = cur_obj.getRect();
		var setWidth = cur_obj.attr('data-sugwidth')-0;

		suglist.css({
			'position' : 'absolute',
			'z-index' : tcb.zIndex(),
			'width' :  setWidth || rect.width,
			'left' : rect.left,
			'top' : rect.top + rect.height + 2
		});
	}

	this.render = function( data ){
		if(data.length > 0){
			var str = '';
			for( var i=0, n=Math.min( data.length, this.showNum ); i<n; i++ ){
				var item = data[i];
				str += '<div class="ui-addrsug-sugitem" data-name="'+item.name+'" data-whole="'+item.district+item.name+'"><b>'+item.name+'</b><span>'+item.district+'</span></div>';
			}
			this.suglist.show().html( str ).css({
                'z-index' : tcb.zIndex()
            })
		}else{
			this.suglist.hide();
		}
	}

	this.selectItem = function(direc){
		var now = this.suglist.one('.on');			
		if(!direc || direc==1){			
			if(now.length == 0){
				this.suglist.query('.ui-addrsug-sugitem:first-child').addClass('on');
			}else{
				now.removeClass('on');
				var next = now.nextSibling('.ui-addrsug-sugitem');				
				next.length > 0 ? next.addClass('on') : this.suglist.query('.ui-addrsug-sugitem:first-child').addClass('on');	
			}
		}else{
			if(now.length == 0){
				this.suglist.query('.ui-addrsug-sugitem:last-child').addClass('on');
			}else{
				now.removeClass('on');
				var prev = now.previousSibling('.ui-addrsug-sugitem');
				prev.length > 0 ? prev.addClass('on') : this.suglist.query('.ui-addrsug-sugitem:last-child').addClass('on');				
			}
		}
	}

	/**
	 * 默认提示
	 * @return {[type]} [description]
	 */
	this.createDefSug = function(){
		var txt = "可以搜索您所在的小区、写字楼或标志性建筑";
		var suglist = W('<div class="ui-addrsug-defsug">').appendTo( W('body') ).hide()

		W('<div class="ui-addrsug-defitem"></div>').html(txt).appendTo(suglist);

		this.defsug = suglist;

		this.resetSugListPos(suglist);
	}

	this.init();
}


;/**import from `/resource/js/include/bigmap.js` **/
//查看大地图
var bigMap = function(defaultCity){
	this.defCity = defaultCity;
	var tplStr = '<div class="mode-map"><div class="pop-window">	<div class="pop-hd">		<h2 class="tit">{$shop_name}</h2>		<a href="#" class="close" title="关闭"></a>	</div>	<div class="pop-bd">		{if($main)}<p title="{$main}">主营：{$main}</p>{/if}	<p title="{$addr}">地址：{$addr}</p>		<p>电话：<span class="tel-num">{$omit_tel}</span> <a class="show-full-tel" href="#" data-tel="{$mobile||$fixed_mobile}" shop-id="{$shop_id}">查看完整号码&gt;&gt;</a><span style="color: #4BAC20; display: none;margin:0 0 0 10px;" class="tel-tip">在线付款，360担保，更安全</span></p>		{if(typeof(QIM)!="undefined" && $seller_qid)}<p class="t-a-r" style="margin-top:10px;"><a href="#" class="btn btn-green qim-go-talk" data-id="{$seller_qid}">		{if($is_online=="on")}		立即咨询		{else}离线留言{/if}		</a></p>{/if}		<div class="arr"></div>	</div></div></div>';

	var currShopPoi = null;
	var isSmall = false;

	this.show = function(shopid, ismall){//只传入商家的店铺id，然后异步获取数据
		var mapPopId = "showBigMap_" + Math.ceil(Math.random()*100000);

		var panel = createShowPop(mapPopId, ismall);

        isSmall = ismall;
        
        var dataUrl =  ( BASE_ROOT ||'http://bang.360.cn/') + 'aj/get_shopinfo/?shopid='+shopid;

        loadJsonp(dataUrl, function(data){
        	var shopData = data.result;
        	currShopPoi = shopData.map_longitude +','+ shopData.map_latitude;

			try{
				shopData.omit_tel = hideTelNum( shopData.mobile || shopData.fixed_mobile );

		        var center = new AMap.LngLat(shopData.map_longitude, shopData.map_latitude);
		        var map = new AMap.Map(mapPopId,{
		            view: new AMap.View2D({//创建地图二维视口
                       center: center,
                       zoom:13,
                       rotation:0
                    })
		        }); 
		        map.plugin(["AMap.ToolBar","AMap.OverView","AMap.Scale"],function(){
		        	//加载鹰眼
		            var overview = new AMap.OverView();
		            map.addControl(overview);
		            //加载工具条
		            var toolbar = new AMap.ToolBar(-100,0);
		            toolbar.autoPosition=false;
		            map.addControl(toolbar);
		            //加载比例尺
		            var scale = new AMap.Scale();
		            map.addControl(scale);
		        });
		        //点标注
		        var marker = new AMap.Marker({
		            id:"mapMarker",
		            zIndex : 99,
		            position:new AMap.LngLat(shopData.map_longitude, shopData.map_latitude), 
		            icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
		            offset:{x:-13,y:-36} 
		        });
		        marker.setMap(map);
		        //信息显示
		        var fun_html = tplStr.tmpl();
		        var infoWindow = new AMap.InfoWindow({
					isCustom: true,
					autoMove: true,
					offset:new AMap.Pixel(70, isSmall?-220 : -286),
					content: fun_html(shopData)
				});
                AMap.event.addListener(marker,'click',function(){ //鼠标点击marker弹出自定义的信息窗体
                     infoWindow.open(map, marker.getPosition());	
                });
				infoWindow.open(map, marker.getPosition());
				W(document.body).delegate('.mode-map a.close', 'click', function(e){
					e.preventDefault();
					map.clearInfoWindow();
				});			

				//点击在线聊天时关闭弹出层
				W(document.body).delegate('.qim-go-talk', 'click', function(){
					try{ panel.hide(); }catch(ex){}
				});

				//获取周围的商家
				getAroundShop({'lng':shopData.map_longitude , 'lat':shopData.map_latitude}, map);

				W( '#'+mapPopId ).delegate('.show-full-tel', 'click', function(e){
					e.preventDefault();
					showFullTelNum( W(this) );
				});
			}catch(e){}
        });
		


		
	}

	function createShowPop(mapPopId, ismall){
		if(ismall){
			var panel = tcb.alert("商铺地图", '<div id="'+mapPopId+'" style="width:626px;height:375px"></div>', {'width':626, 'btn_name': '关闭'}, function(){
	            return true;
	        });
		}else{

	        var panel = tcb.alert("商铺地图", '<div id="'+mapPopId+'" style="width:695px;height:410px"></div>', {'width':695, 'btn_name': '关闭'}, function(){
	            return true;
	        });
		}

		return panel;
	}

	function getAroundShop(poi, map){
		var bounds = getBounds(poi, 5000);

		var params = Object.encodeURIJson({
			region : bounds,
			cityid : QW.Cookie.get('cid'),
			number : 10
		});

		QW.loadJsonp( (BASE_ROOT ||'http://bang.360.cn/') + 'ajmap/getdefshop/?jsoncallback=%callbackfun%&' + params, function(data){
			showAroundShop(data, map);
		} );
	}

	function showAroundShop(data, map){
		if(data.status=='E0' && data.poi && data.poi.length>0){
			for(var i=0, n=data.poi.length; i<n; i++){
				var shop = data.poi[i];

				if(currShopPoi == shop.x+','+shop.y){ continue; }

				(function(shop){					
					try{						
						var datainfo = {
							shop_name : shop.shop_name,
							main : shop.service_desc,
							addr : shop.addr_detail,
							mobile : shop.tel,
							omit_tel : hideTelNum(shop.tel)
						};
						//点标注
				        var marker = new AMap.Marker({
				            id:"mapMarker" + i,
				            position:new AMap.LngLat(shop.x, shop.y), 
				            icon:{stc:"https://p.ssl.qhimg.com/t01a55fed81341959b4.png"}.stc,
				            offset:{x:-13,y:-36} 
				        });
				        marker.setMap(map);

				        //信息显示
				        var fun_html = tplStr.tmpl();
				        var infoWindow = new AMap.InfoWindow({
							isCustom: true,
							autoMove: true,
							offset:new AMap.Pixel(70, isSmall?-220 : -286),
							content: fun_html(datainfo)
						});

					    AMap.event.addListener(marker,'click',function(){ //鼠标点击marker弹出自定义的信息窗体
                             infoWindow.open(map, marker.getPosition());	
                        });	
					}catch(ex){}
				})(shop);
			}
			
		}
	}

	/**
     * 根据中心点和半径换算查询范围
     * @param  {[type]} latLng [description]
     * @param  {[type]} radius [description]
     * @return {[type]}        [description]
     */
    function getBounds(latLng, radius){
        var latitude = latLng.lat-0;

        var longitude = latLng.lng-0;

        var degree = (24901 * 1609) / 360.0;

        var raidusMile = radius;

        var dpmLat = 1 / degree;

        var radiusLat = dpmLat * raidusMile;

        var minLat = latitude - radiusLat;

        var maxLat = latitude + radiusLat;

        var mpdLng = degree * Math.cos(latitude * (Math.PI / 180));

        var dpmLng = 1 / mpdLng;

        var radiusLng = dpmLng * raidusMile;

        var minLng = longitude - radiusLng;

        var maxLng = longitude + radiusLng;

        return [ [minLng, minLat ].join(',') , [maxLng, maxLat].join(',') ].join(';');       
    }

    /**
     * 隐藏部分电话号码
     * @param  {num} tel 电话号码
     * @return {[type]}     [description]
     */
    function hideTelNum(tel){
	    if(!tel) return '';
	    return tel.replace(/(\d{3})(\d{4})(\d{4})/, "$1****$3").replace(/(\d+\-)?(\d+)\d{4}/, "$1$2****");
	}


	function showFullTelNum(obj){
		var wMe = obj,
            tel = wMe.attr('data-tel');

        wMe.siblings('.tel-num').html(tel);
        wMe.hide();
        wMe.siblings('.tel-tip').show();

        var shop_id = wMe.attr('shop-id');
        new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=bigmap" + (typeof(_inclient)!='undefined' && _inclient ? '&inclient=1' : '');
	}

	//获取poi
	this.getGeoPoi = function(addr, callback){
		var defCity = this.defCity;
		
		var MGeocoder = new AMap.Geocoder({
			'city' : defCity || W('.area-box-sel').html() || ''
		});
		MGeocoder.geocode(addr, function(poi){
            var userPoi = null;

            if(poi.list && poi.list.length >0 ){//如果有多个结果，只care第一个。
                userPoi = { lng: poi.list[0].x , lat:poi.list[0].y };
            }

            callback(userPoi);
        }); 
	}

}

;/**import from `/resource/js/huodong/hd.neicunshengji.js` **/
Dom.ready(function(){
    // 打点
    function clickmark(params){
        var encode_params = typeof params=='string' ? params : Object.encodeURIJson(params);

        var request_url = BASE_ROOT+'aj/gshopmo/?'+encode_params;
        QW.Ajax.get(request_url,function(){});
    }
    /**
     * 选择城市
     * @return {[type]} [description]
     */
    function selectCity(selector){

        if(!W(selector).length) return false;
        
        var cityPanel = new CityPanel(selector);

        cityPanel.on('close', function(e) {
            
        });

        cityPanel.on('selectCity', function(e) {
            city = e.city.trim();

            var city_name = e.name.trim();

            location.href ="http://" +location.host + location.pathname + "?city=" + city;
        });
    }
    selectCity(".city_trigger");

    tcb.bindEvent(document.body, {
        // 显示区县选择面板
        '.shangquan-select': function(e){
            var wAreapanel = W(this).siblings('.area-select-pannel');
            wAreapanel.fadeIn(100);
        },
        // 区县选择面板
        '.area-select-pannel': function(e){
            e.preventDefault();
            var wMe = W(this),
                wTarget = W(e.target),
                _box = wMe.parentNode('.section-body');
            // 关闭区县选择列表
            if (wTarget.hasClass('close')) {
                wMe.hide();
            }
            // 选择区县
            if (wTarget[0].nodeName.toLowerCase()==='a') {
                var area_name = wTarget.html(),
                    area_id = wTarget.attr('areaid');
                wMe.hide();
                wMe.siblings('.shangquan-select').query('.now-shangquan').html(area_name).attr('data-areaid', area_id||'');

                // 加载商家列表
                _box.one('.addr-sug-place').val('').focus().blur();
                _box.attr('data-poi', ''); //清空坐标
                LoadShopList(_box, 0, true);
            }
        },
        // 立即升级
        '.hd-neicun-lijishengji-btn': function(e){
            e.preventDefault();

            var wHeaderContent3 = W('.header-content3'),
                rect = wHeaderContent3.getRect();

            setScrollTop(rect['top']);

            clickmark({
                'from': W('#FromPageName').val(),
                'cId': 'hd-neicun-lijishengji-btn'
            });
        },
        // 电话咨询
        '.phone-shop-n': function(e){
            e.preventDefault();

            var wMe = W(this);

            tcb.panel('', '<div class="shop-phone-view-pannel"><div class="line"><span>店铺名称：</span><span>'+wMe.attr('data-shopname')+'</span></div><div class="line"><span>联系电话：</span><span class="lc1">'+wMe.attr('data-tel')+'</span></div><div style="height:30px;"></div><div class="line"><span class="lc2">联系我时，请说是在360同城帮看到的，谢谢！</span></div></div>', { 'width':380, 'height':180}, function(){return true;});

            clickmark({
                'from': W('#FromPageName').val(),
                'shopid': wMe.attr('data-shopid'),
                'PT': 'zixun',
                'mobile': wMe.attr('data-tel')
            });
        },
        '.see-shop-map' : function(e){
            e.preventDefault();
            var el = W(this);

            new bigMap().show( el.attr('data-shopid') );
        },
        '.play-video' : function(e){
            e.preventDefault();
            var config = {
                width:640,
                height:432
            }

            if(window.playerPanel && playerPanel.show){
                playerPanel.show();
            }else{
                playerPanel = tcb.panel('电脑清灰过程&效果', '<embed src="http://player.youku.com/player.php/sid/XNjUyNDc0MTY0/v.swf" allowFullScreen="true" quality="high" width="640" height="400" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" flashvars="isAutoPlay=true"></embed>', config);                    
            }
        },
        '.dp-list .dp-item': function(e){
            if( e.target.tagName.toUpperCase()=='A'){
                return;
            }

            window.open( W(this).one('.btn-buy').attr('href') );                
        }
    });
    
    W(document.body).on('click', function(e){
        var target = e.target,
            wTarget = W(target);

        if (!(wTarget.ancestorNode('.area-select-pannel').length 
                || wTarget.hasClass('area-select-pannel')
                || wTarget.ancestorNode('.shangquan-select').length 
                || wTarget.hasClass('shangquan-select'))) {
            W('.area-select-pannel').hide();
        }
    });

    /**
     * 加载商家列表
     * @param {[type]} pn [description]
     */
    function LoadShopList(box, pn, flag){
        var _box = W(box);
        var page_size = 12;

        var prdType = _box.attr('data-prdtype');
        var dataUrl = '';
        switch(prdType){
            case "qinghui" : dataUrl='/huodong/ajluyouqi/?huodong_type=2&'; break;
            case "neicun" : dataUrl='/client_recommend/aj_memoryShop?datatype=neicun&'; break;
            case "yingpan" : dataUrl='/search/?async=1&service_id=0&type_id=0&tag_id=0&keyword='+encodeURI('固态硬盘')+'&from=memory&'; break;  //FML.从搜索获取数据。
        }

        var params = getShopListParam( _box );

        if( prdType=='yingpan' ){
            params.city_id = params.citycode;
            params.area_id = params.areaid;
        }

        var encode_params = Object.encodeURIJson( params );
        var request_url = dataUrl + encode_params;
        if (pn) {
            request_url += '&pn='+pn;
        }

        var _lngLat = _box.attr('data-poi');

        if( _lngLat ){

            try{
                _lngLat = QW.JSON.parse(_lngLat);

                request_url += '&lng='+ _lngLat.lng + '&lat=' + _lngLat.lat;
            }catch(ex){}
        }

        QW.Ajax.get(request_url, function(responceText){
            var responce = QW.JSON.parse(responceText);

            //转换搜索的数据格式
            if( prdType=='yingpan' && !responce.result ){
                responce.result = { 
                    'total' : responce.page_count,
                    'lists' : Object.isArray(responce.data)? responce.data : Object.values(responce.data)
                }
            }else if(prdType=='qinghui'){
                responce.result = { 
                    'total' : page_size,
                    'lists' : responce.result.slice(0, page_size)
                }
            }
            
            var shop_data = {'shop_data' : responce['result']['lists'], 'data_type' : prdType};

            var shop_fn = W('#ShopListTpl').html().trim().tmpl(),
                shop_html = shop_fn(shop_data);

            if( (shop_html.length==0 || shop_html.trim().length==0) ){
                if(responce.result.total == 0){
                    _box.one('.dp-list').html('<p style="padding:30px; text-align:center; font-size:14px; color:#fff">抱歉，此区域暂无商家。</p>');
                }else{
                    _box.one('.dp-list').html('<p style="padding:30px; text-align:center; font-size:14px; color:#fff">没有更多内容了。</p>');
                }
            }else{
                _box.one('.dp-list').html(shop_html);
            }            

            flag && ShopListPager(Math.ceil(responce['result']['total']/page_size), _box);

            _box.one('.rs-shop-num').html(responce.result.total);

        });
    }

    /**
     * 设置滚动条高度
     * @param {[type]} top_val [description]
     */
    function setScrollTop(top_val){
        top_val = top_val ? top_val : 0;
        if (typeof window.pageYOffset!=='undefined') {
            window.pageYOffset = top_val;
        }
        document.documentElement.scrollTop = top_val;
        document.body.scrollTop = top_val;
    }
    /**
     * 商家维修分页
     * @return {[type]} [description]
     */
    function ShopListPager(pagenum, box, callback, flag){
        var _box = W(box);
        if(pagenum==1){
            _box.one('.pagination .pages').hide().html('');
            return;
        }

        _box.one('.pagination .pages').show();

        var pager = new Pager(_box.one('.pagination .pages'), pagenum, 0);

        pager.on('pageChange', function(e) {
            callback = callback || LoadShopList;
            callback(_box, e.pn);

            !flag && setScrollTop( _box.one('.search-result').getRect()['top']- W('.float-menu').getRect().height );
        });
    }

    function createBigMap(p_flag){
        //如果是分页，那么就不用再去创建了。
        if(p_flag){
            var panel = tcb.alert("地图模式", W("#HdNeiCunShengJiModeMapTpl").html(), {'width':688, btn_name: '关闭',wrapId:"panel-modeMapindex"}, function(){
                map = null;
                return true;
            });
        }
        //reset
        try{map.destroy()}catch(ex){}
        document.getElementById("mode_map_container").innerHTML = "";

        map = new AMap.Map("mode_map_container",{
            view: new AMap.View2D({//创建地图二维视口               
               zoom:11               
            })
        }); 
        map.plugin(["AMap.ToolBar","AMap.OverView","AMap.Scale"],function(){
            var overview = new AMap.OverView();
            map.addControl(overview);
            var toolbar = new AMap.ToolBar(-100,0);
            toolbar.autoPosition=false;
            map.addControl(toolbar);
            var scale = new AMap.Scale();
            map.addControl(scale);
        });
        W(document.body).delegate('#panel-modeMapindex span.close', 'click', function(e){
            try{
                e.preventDefault();
                map.clearInfoWindow();
                map = null;
            }catch(e){

            }
            
        })

        W(document.body).delegate('.mode-map a.close', 'click', function(e){    
            e.preventDefault();
            map.clearInfoWindow();

        })
        

        //点击在线聊天时关闭弹出层
        W(document.body).delegate('.qim-go-talk', 'click', function(){
            panel.hide();
            map = null;
        });

        return map;
    }

    /**
     * 获取商店商品列表
     * @return {[type]} [description]
     */
    function getShopListParam(box){
        var _box = W(box);
        var ret = {
            'citycode': cur_citycode,
            'areaid': _box.one('.now-shangquan').attr('data-areaid') || 0,
            'pagesize' : 12
        }

        return ret;
    }

    //地址自动完成
    function initAddrSearch(){
        new AddrSuggest('.section-qinghui .addr-sug-place', {          
            'showNum' : 6,
            'onSelect' : function(txt){ getGeoPoi(txt, searchByPoi, '.section-qinghui'); },
            'requireCity' : function(){ return W('.city_trigger .now-city').html() ||'' }
        });

        new AddrSuggest('.section-neicun .addr-sug-place', {          
            'showNum' : 6,
            'onSelect' : function(txt){ getGeoPoi(txt, searchByPoi, '.section-neicun'); },
            'requireCity' : function(){ return W('.city_trigger .now-city').html() ||'' }
        });

        new AddrSuggest('.section-yingpan .addr-sug-place', {          
            'showNum' : 6,
            'onSelect' : function(txt){ getGeoPoi(txt, searchByPoi, '.section-yingpan'); },
            'requireCity' : function(){ return W('.city_trigger .now-city').html() ||'' }
        });

        W('.addr-search-form').bind('submit', function(e){
            e.preventDefault();
            var _this = W(this);
            var _box = _this.parentNode('.section-body');
            var ipt = W(this).one('[name="addr"]');
            var txt = ipt.val();
            if( txt =='' || txt == ipt.attr('data-default') ){
                ipt.focus();
                if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(ipt);              
            }else{
                getGeoPoi(txt, searchByPoi, _box);
                _this.one('.error').hide();
            }
        });

        function doSearch(box){
            LoadShopList(box, 0, true);
        }        

        //获取poi
        function getGeoPoi(addr, callback, box){
            var mapBox = W('<div id="geoMapBox"></div>').appendTo( W('body') ).hide();
            var _map = new AMap.Map("geoMapBox"); 
            // 加载地理编码插件 
            _map.plugin(["AMap.Geocoder"], function() {
                MGeocoder = new AMap.Geocoder({
                    city : _box.one('.now-city').html() || '',
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

                    callback(pos, box);
                });
                //逆地理编码
                MGeocoder.getLocation(addr);
            });
        }

        function searchByPoi(poi, box){
            var _box = W(box);
            if(poi == null){
                _box.one('.addr-search-form .error').show();
            }else{
                _box.one('.addr-search-form .error').hide();
                
                _box.attr('data-poi', QW.JSON.stringify(poi));
                doSearch(_box);
            }
        }
    }

    /**
     * 浮动菜单
     * @return {[type]} [description]
     */
    function fixedFloatMenu(){
        var menu = W('.float-menu');
        var timer;
        function _fixMenu(){            
            var oTop = W('.float-menu-place').getRect().top;

            if( Dom.getDocRect().scrollY > oTop ){
                !menu.hasClass('menu-fixed') && menu.addClass('menu-fixed');
            }else{
                menu.hasClass('menu-fixed') && menu.removeClass('menu-fixed');
            }

            var secList = W('.section-body');

            if(timer) clearTimeout(timer);

            timer = setTimeout( function(){
                for(var i=0, n=secList.length; i<n; i++){
                    var item = secList.item(i);
                    var itemMenu = W('.float-menu>li[data-for="'+item.attr('data-prdtype')+'"]');
                    var sTop = item.getRect().top;
                    if( Dom.getDocRect().scrollY > (sTop - W('.float-menu').getRect().height - 20) ){
                        itemMenu.addClass('on').siblings('.on').removeClass('on');
                    }
                }
            }, 100);
        }

        W(window).on('scroll', _fixMenu);
        W(window).on('laod', _fixMenu);
        W(window).on('resize', _fixMenu);

        menu.delegate('>li', 'click', function(){
            W(this).addClass('on').siblings('.on').removeClass('on');

            var go = W(this).attr('data-for');

            var disTop = W('.section-body[data-prdtype="'+go+'"]').getRect().top - W('.float-menu').getRect().height - 10;

            tcb.gotoTop.goPlace(disTop);
        });
    }
    

    // 加载商家列表
    LoadShopList('.section-qinghui', 0, true);
    setTimeout(function(){ LoadShopList('.section-neicun', 0, true); } , 1000);
    setTimeout(function(){ LoadShopList('.section-yingpan', 0, true);} , 2000);

    initAddrSearch();

    fixedFloatMenu();
});

/**
 * 统一处理显示页面等级星星
 * @param  {[type]} grade [description]
 * @return {[type]}       [description]
 */
function showShopGrade( grade ){
    var icon = Math.min(Math.ceil(grade/5), 4);
    var icon_num = (grade-1)%5 + 1;
    var str = '';
    for(var i=0; i<icon_num; i++){
        str +='<span class="icon icon-dj icon-dj-'+icon+'"></span>';
    }
    return str;
}

function dealDistance(dis){
    if( dis< 1000){
        return dis + '米';
    }else{
        return (dis/1000).toFixed(2) + '公里';
    }
}
