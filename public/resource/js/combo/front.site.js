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

;/**import from `/resource/js/component/expertchat.js` **/
ExpertChat={
	ieobj:null,
	chromobj:null,
	version:0,
	isupdate:0,
	retval:0,
	pTime:0,
	pNum:0,
	wdExists:0,
	cmdparam : '',
	safetime : null,
	plugCheckTime : 1200,
	/**
	 * 把插件html注入的页面中。可以在页面onload前执行。
	 * @return {[type]} [description]
	 */
	initPulgin : function(){
		W('<div style="height:0;overflow:hidden" data-type="x-360-jishi-chat"><embed type="application/x-360-jishi" width="0" height="0" id="jishichromeplugin"></embed><object classid="CLSID:EB8FDC66-F8AB-4D4C-8D96-4E0458EF819D" id="jishiieplugin"></object></div>').appendTo( W('body') );
		ExpertChat.pluginTimer();	
	},
	/**
	 * 启动聊天
	 * @param  {[type]} eid   专家qid
	 * @param  {string} state 专家状态
	 * @param  {TEL} tel   电话号码，可以在专家不在线时，出现拨打电话提示
	 * @return {[type]}       [description]
	 */
	startChat : function(eid, state, tel){
		state = state || '';
		if(W('[data-type="x-360-jishi-chat"]').length == 0){						

			ExpertChat.initPulgin();
			setTimeout(function(){  ExpertChat.startChat(eid, state, tel); }, ExpertChat.plugCheckTime);
			return ;
		}

		if(state && state.toUpperCase()=='OFFLINE')
		{
			if(tel){
				ExpertChat.offlineDialog(tel);
			}else{
				alert("抱歉，当前专家不在线");
			}
			
		}else{
			try{
				window.external.folk_start_consult(""+eid+"");
			}catch(ex){
				if(ExpertChat.exists())
				{
					ExpertChat.cmdparam="/folkproblem=0 /searchfolkpage="+eid+" /consultfolk="+eid+"";	
					ExpertChat.CheckPluginFunc(eid)	
				}
				else
				{	
					ExpertChat.installDialog();
				}
			}
		}		
	},
	//先异步查询状态，在吊起聊天
	startChatByAjax : function(eid, tel){
		loadJsonp( (BASE_ROOT||'') + '/aj/expert_isonline/?qid=' + eid, function(rs){
			if(rs.errno == 0 && rs.result && rs.result.state){
				ExpertChat.startChat(eid);
			}else{
				ExpertChat.startChat(eid, 'OFFLINE', tel);
			}
		});	
	},
	offlineDialog : function(tel){
		if(W('[data-dig="360-jishi-offline"]').length>0 && W('[data-dig="360-jishi-offline"]').css('display')!='none'){
			return;
		}
		var telStr = tel? '你可以直接电话咨询，<br>联系电话：<span style="color:#62A52A">'+tel+'</span><br>或者向其他在线专家咨询。' : '您可以向其他在线专家咨询。';

		if( window.__inclient ){//暂无接口，先不出按钮。
			tcb.panel("提示", '<div style="padding:20px 20px 0 20px; font-size:14px;line-height:1.8;" data-dig="360-jishi-offline">该专家不在线，'+telStr+'</div>', { 'width':320, 'height':150, 'btn_name' : '找其他专家'});
		}else{
			tcb.alert("提示", '<div style="padding:20px 20px 0 20px; font-size:14px;line-height:1.8;" data-dig="360-jishi-offline">该专家不在线，'+telStr+'</div>', { 'width':320, 'height':180, 'btn_name' : '找其他专家'}, function(){
	            ExpertChat.cmdparam="/folkproblem=0 /searchfolkpage=电脑手机";
				ExpertChat.CheckPluginFunc("0");       
	            return true;
	        });
		}
		
	},
	installDialog : function(){
		if(W('[data-dig="360-jishi-install"]').length>0 && W('[data-dig="360-jishi-install"]').css('display')!='none'){
			return;
		}

		tcb.alert("提示", '<div style="padding:20px 20px 5px 20px; font-size:14px;" data-dig="360-jishi-install">您需要加载并安装最新的插件工具才能使用本功能。<br>安装完毕后请关闭本页面后重新打开。<br>如仍无法打开咨询窗口，请使用IE浏览器打开此网址。</div>', { 'width':380, 'height':180, 'btn_name' : '下载插件'}, function(){
            window.open('http://jishi.360.cn/360ExpertPlugin.exe');
            return true;
        });
	},
	installWD : function(){
		tcb.alert(
			"提示", 
			'<div style="padding:20px; font-size:14px;" data-dig="360-jishi-installwd">您需要安装最新版360安全卫士。<br>安装完毕后请关闭本页面后重新打开。</div>', { 
			'width':380, 'height':170, 'btn_name' : '点击下载'}, 
			function(){
	            window.open('http://down.360safe.com/instbeta.exe');
	            return true;
		    }
	    );
	},
	CheckPluginFunc : function(eid){
		if(ExpertChat.wdExists)
		{
			ExpertChat.startClient(eid);			
		}
		else if(ExpertChat.exists())
		{
			var version=ExpertChat.version.replace(/\./g,"");
			var update=ExpertChat.update();
			if(update)
			{
				ExpertChat.installDialog();
				ExpertChat.startClient(eid);
				if(ExpertChat.safetime) clearTimeout(ExpertChat.safetime);
				ExpertChat.safetime=setTimeout(function(){location.reload();},120000);
			}
			else if(version>=1002)
			{
				ExpertChat.startClient(eid);						
			}
			else
			{
				ExpertChat.installDialog();
			}
		}
		else 
		{
			ExpertChat.installDialog();
		}
	},
	pluginTimer:function()
	{
		if(ExpertChat.pTime) clearInterval(ExpertChat.pTime);
		ExpertChat.pTime=setInterval(function(){
			ExpertChat.pNum+=1;	
			if(ExpertChat.exists() || ExpertChat.pNum > 50)
			{
				clearInterval(ExpertChat.pTime);
				ExpertChat.pNum=0;	
			}
		},200);
	},
	exists:function()
	{
		var retval=false;
		if(window.wdextcmd && typeof wdextcmd.CallDiagScanWithParam != 'unknown' && wdextcmd.CallDiagScanWithParam) 
		{
			retval=true;
			ExpertChat.wdExists=1;
			
		}
		else if(typeof external == 'object')
		{
			try{
				external.AppCmd(external.GetSID(window),"","wdroute","hasapp","dsdlg",function(i1,s1){
					if (i1==1) 
					{
						ExpertChat.retval=true;
						ExpertChat.wdExists=1;
					}
					else
					{
						ExpertChat.retval=false;
						ExpertChat.wdExists=0;	
					}	
				});
				retval=ExpertChat.retval;
				
			}
			catch(e)
			{
				retval=ExpertChat.pluginExists();
					
			}
		}
		else
		{
			retval=ExpertChat.pluginExists();	
		}
		return 	retval;	
	},
	pluginExists:function()
	{
		var retval=false;			
		try{
			ExpertChat.ieobj=document.getElementById("jishiieplugin");
			ExpertChat.version=ExpertChat.ieobj.GetVersion();
			retval=true;		
		}catch(e)
		{
			
			try{
				ExpertChat.chromobj=document.getElementById("jishichromeplugin");
				ExpertChat.version=ExpertChat.chromobj.GetVersion();
				var a=ExpertChat.chromobj.GetVersion();
				if(a)
				{
					retval=true;
				}
				else
				{
					retval=false;	
				}
			}catch(e)
			{
				retval=false;	
			}		
		}	
		return retval;
	},
	startClient:function(eid)
	{		

		if(ExpertChat.cmdparam==0)
		{
			var extParam="/folkproblem=0 /searchfolkpage="+eid+" /consultfolk="+eid+"";;	
		}
		else if(eid==0)
		{
			var extParam=ExpertChat.cmdparam;	
		}
		else
		{
			var extParam=ExpertChat.cmdparam;	
		}
		if(window.wdextcmd && typeof wdextcmd.CallDiagScanWithParam != 'unknown' && wdextcmd.CallDiagScanWithParam) 
		{
			try
			{
				window.wdextcmd.CallDiagScanWithParam(""+extParam+"");
			}
			catch(e)
			{
				ExpertChat.pluginStart(extParam);	
			}
		}
		else if(typeof external == 'object')
		{
			try{
					external.AppCmd(external.GetSID(window),"","wdroute","hasapp","dsdlg",function(i1,s1)
					{
						if (i1 == 1) 
						{
							try{
									external.AppCmd(external.GetSID(window),"","wdroute","callapp->dsdlg",''+extParam+'', function(i1,s1){});
								}
								catch(ex)
								{
									ExpertChat.pluginStart(extParam);	
								}		
						}
						else
						{
							ExpertChat.pluginStart(extParam);	
						}	
					});
			}
			catch(e)
			{
				ExpertChat.pluginStart(extParam);	
			}	
		}
		else
		{
			ExpertChat.pluginStart(extParam);	
		}
	},
	pluginStart:function(eid)
	{
		try{
			if(!ExpertChat.ieobj)
				ExpertChat.ieobj=document.getElementById("jishiieplugin");
			ExpertChat.ieobj.RunClient(''+eid+'');			
		}catch(e)
		{
			try
			{
				ExpertChat.chromobj=document.getElementById("jishichromeplugin");
				ExpertChat.chromobj.RunClient(''+eid+'');	
			}catch(e)
			{
				
			}		
		}	
	},
	update:function()
	{
		try{
			if(!ExpertChat.ieobj)
				ExpertChat.ieobj=document.getElementById("jishiieplugin");
			ExpertChat.isupdate=ExpertChat.ieobj.IsNeedUpdate();		
		}catch(e)
		{
			try
			{
				ExpertChat.chromobj=document.getElementById("jishichromeplugin");
				ExpertChat.isupdate=ExpertChat.chromobj.IsNeedUpdate();		
			}catch(e)
			{
				ExpertChat.isupdate=0;	
			}		
		}
		return ExpertChat.isupdate;	
	},
    startClientByParams:function(params) {
        var extParam = '';
        if(ExpertChat.cmdparam==0) {
            extParam = " /folkproblem=0 /tab=3";
            extParam += params['query'] ?  " /searchfolkpage="+params['query'] : '';
            extParam += params['eid'] ?  " /consultfolk="+params['eid'] : '';
        }
        else {
            extParam = ExpertChat.cmdparam;   
        }
        if(window.wdextcmd && typeof wdextcmd.CallDiagScanWithParam != 'unknown' && wdextcmd.CallDiagScanWithParam) {
            try
            {
                window.wdextcmd.CallDiagScanWithParam(""+extParam+"");
            }
            catch(e)
            {
                ExpertChat.pluginStart(extParam);   
            }
        }
        else if(typeof external == 'object') {
            try{
                external.AppCmd(external.GetSID(window),"","wdroute","hasapp","dsdlg",function(i1,s1) {
                    if (i1 == 1) {
                        try{
                            external.AppCmd(external.GetSID(window),"","wdroute","callapp->dsdlg",''+extParam+'', function(i1,s1){});
                        }
                        catch(ex) {
                            ExpertChat.pluginStart(extParam);   
                        }
                    }
                    else {
                        ExpertChat.pluginStart(extParam);   
                    }
                });
            }
            catch(e) {
                ExpertChat.pluginStart(extParam);   
            }
        }
        else {
            ExpertChat.pluginStart(extParam);   
        }
    },
    /**
     * 先异步查询状态，在吊起聊天
     * @param  {[type]} params 可包含参数eid, query, tel等
     * @return {[type]}        [description]
     */
    startChatByAjax2 : function(params){
        params = params || {};
        var eid = params['eid'],
            tel = params['tel'];
        if (!eid) {
            return;
        }
        loadJsonp( (BASE_ROOT||'') + '/aj/expert_isonline/?qid=' + eid, function(rs){

            if(rs.errno == 0 && rs.result && rs.result.state){
                (function(){
                    if(W('[data-type="x-360-jishi-chat"]').length == 0){
                        ExpertChat.initPulgin();
                        setTimeout(arguments.callee, ExpertChat.plugCheckTime);
                        return ;
                    }
                    if(ExpertChat.exists()) {
                        ExpertChat.startClientByParams(params);
                    }
                    else {
                        ExpertChat.installDialog();
                    }
                }());

            }else{
                ExpertChat.offlineDialog(tel);
            }
        }); 
    },

    checkAndStart:function(eid)
	{
		try{
			//先试试看有木有window接口存在
			window.external.folk_start_consult(""+eid+"");
		}catch(ex){
			//如果没有控件，要先加载。如果想减少启动延时，可以使用  initPulgin 方法提前加载
			if(W('[data-type="x-360-jishi-chat"]').length == 0){						

				ExpertChat.initPulgin();
				setTimeout(function(){  ExpertChat.checkAndStart(eid); }, ExpertChat.plugCheckTime);
				return ;
			}

			ExpertChat.cmdparam=0;	
			if(ExpertChat.wdExists)
			{
				
				ExpertChat.startClient(eid);
			}
			else if(ExpertChat.exists())
			{
				var version=ExpertChat.version.replace(/\./g,"");
				var update=ExpertChat.update();
				if(update)
				{
					installWD();
			
				}
				else if(version==1002)
				{
					ExpertChat.startClient(eid);
				}
				else
				{
					ExpertChat.installDialog();
				}
			}
			else 
			{
				ExpertChat.installDialog();		
			}
		}
	},

    checkAndStartFamily:function(eid, consultdefwords) {

        try{
            //如果没有控件，要先加载。如果想减少启动延时，可以使用  initPulgin 方法提前加载
            if(W('[data-type="x-360-jishi-chat"]').length == 0){

                ExpertChat.initPulgin();
                setTimeout(function(){  ExpertChat.checkAndStartFamily(eid, consultdefwords); }, 1500);
                return ;
            }

            ExpertChat.cmdparam=0;
            var cmdparam = "/folkproblem=0 /searchfolkpage="+eid+" /consultfolk="+eid+" /consultdefwords="+consultdefwords+"";
            if(ExpertChat.wdExists) {
                ExpertChat.cmdparam=cmdparam;
                ExpertChat.startClient();
            }
            else if(ExpertChat.exists()) {
                var version=ExpertChat.version.replace(/\./g,"");
                var update=ExpertChat.update();
                if(update) {
                    installWD();
                }
                else if(version==1002) {
                    ExpertChat.cmdparam=cmdparam;
                    ExpertChat.startClient();
                }
                else {
                    ExpertChat.installDialog();
                }
            }
            else {
                ExpertChat.installDialog();
            }
        }catch(ex){}

    }


};	




;/**import from `/resource/js/page/front.site.js` **/
Dom.ready(function(){

    /**
     * 点击统计
     * @param  {string} type 点击的类型
     * @return {[type]}      [description]
     */
    function clickLog(type){
        new Image().src="/aj/gshopzixun/?ctype="+type+"&from=" + (window.location.pathname);
    }
    // 打点
    function initClickLogUV(params){
        var defaults = {
            'f': window.location.href
        };
        params = params || {};
        params = QW.ObjectH.mix(defaults, params);

        tcb.bindEvent(document.body, {
            'a, .js-log-click': {
                'mousedown': function(e){
                    var me = e.target,
                        wMe = W(me),
                        val = wMe.val(),
                        str = wMe.html();
                    // class名称
                    params['cn'] = me.className;
                    // a标签的href值
                    params['ah'] = wMe.attr('href');
                    // 点击区域的内容
                    params['c'] = wMe.attr('title');
                    if (!params['c']) {
                        params['c'] = val ? val : (str ? str : '');
                    }
                    // 唯一logid
                    params['i'] = wMe.attr('id');
                    if (!params['i']) {
                        params['i'] = wMe.attr('logid') ? wMe.attr('logid') : '';
                    }

                    var encode_params = typeof params=='string' ? params : Object.encodeURIJson(params);

                    var request_url = BASE_ROOT+'aj/gshopmo/?'+encode_params;
                    QW.Ajax.get(request_url,function(){});
                }
            }
        });
    }
    initClickLogUV();

    function getMendianList(){
        var citycode = W('.site-shuju-mendian-city').attr('data-code'),
            keyword = window.g_keyword,
            pagesize = 12;

        var request_url = BASE_ROOT + 'client/search/?async=1&city_id='+citycode+'&area_id=&quan_id=&service_id=0&type_id=0&keyword='+keyword+'&pagesize='+pagesize+'&show_mode=product&tag_id=0&pn=0';
        QW.Ajax.get(request_url, function(responceText){
            // try{
                var res = QW.JSON.parse(responceText);
                if (res['errno']==0) {
                    t_html = '';
                    if (res['data']&&res['data'].length) {
                        var data_params = {
                            'shop_data' : res['data']
                        };
                        var t_fn = W('#MendianItemTpl').html().trim().tmpl();
                        
                        t_html = t_fn(data_params);
                    }

                    var wMendianMore = W('.site-shuju-mendian-more, .site-shuju-mendian-more2'),
                        more_url = wMendianMore.attr('href').replace(/city_id=[^&]*/, 'city_id='+citycode);
                    wMendianMore.attr('href', more_url);

                    // t_html = '';
                    if (!t_html) {
                        t_html = '<div class="site-list-noitem"><span>抱歉，当前地区没找到解决<em>“'+keyword+'”</em>问题的门店，请点击<a href="'+more_url+'">更多</a>查找</span></div>';
                    }

                    W('.site-shuju-mendian-list').html(t_html);
                    W('.site-shuju-mendian-total-count').html(res['countnum'] ? '门店('+res['countnum']+'个)' : '门店');

                } else {}
            // }catch(ex){}
        });
    }
    getMendianList();


    var playerPanel;

    tcb.bindEvent(document.body, {
        // 搜索框操作
        '.address-search-form-ipt': {
            'focus': function(e){
                var wMe = W(this);

                if(wMe.hasClass('inactived')){
                    wMe.removeClass('inactived').val('');
                }
            },
            'blur': function(e){
                var wMe = W(this),
                    default_val = wMe.attr('default-value');

                if (wMe.val().trim()===''||default_val===wMe.val()) {
                    wMe.addClass('inactived').val(default_val);
                }
            }
        },
        //查看地图
        '.see-map': function(e){
            e.preventDefault();
            var el = W(this);

            new bigMap().show( el.attr('data-shopid') );
            
        },
        // 专家咨询/电话咨询
        '.zj-go-talk' : function(e){
            e.preventDefault();
            var wMe = W(this),
                qid = wMe.attr('data-id'),
                tel = wMe.attr('data-tel');

            // 在线且有专家
            if (qid && qid!=0) {
                if (ExpertChat&&ExpertChat.startChatByAjax) {
                    ExpertChat.startChatByAjax(qid, tel);

                    wMe.hasClass('zj-go-t2')? clickLog('zj_talk_expert') : clickLog('zj_talk_shop');
                }
            } else {
                tcb.panel('', '<div class="shop-phone-view-pannel"><div class="line"><span>店铺名称：</span><span>'+wMe.attr('data-shopname')+'</span></div><div class="line"><span>联系电话：</span><span class="lc1">'+wMe.attr('data-tel')+'</span></div><div style="height:30px;"></div><div class="line"><span class="lc2">联系我时，请说是在360同城帮看到的，谢谢！</span></div></div>', { 'width':380, 'height':180}, function(){return true;});

                var request_url = BASE_ROOT+'aj/gshopmo/?from='+W('#FromPageName').val()+'&shopid='+wMe.attr('data-shopid')+'&PT=zixun&mobile='+wMe.attr('data-tel');
                QW.Ajax.get(request_url,function(){});

                clickLog('zj_tel');

            }

        },
        '.play-video' : function(e){
            e.preventDefault();
            var config = {
                width:640,
                height:432,
                withMask: false,
                dragable: true
            }

            if(playerPanel && playerPanel.show){
                playerPanel.show();
            }else{
                playerPanel = tcb.panel(W('.play-video-text').html(), '<embed src="http://player.youku.com/player.php/sid/XNjkzODk0NDQw/v.swf" allowFullScreen="true" quality="high" width="640" height="400" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" flashvars="isAutoPlay=true"></embed>', config);
            }
        },
        '.site-left-nav a': function(e){
            e.preventDefault();

            // var target = e.target;
            // if (target.nodeName.toLowerCase()!=='a') {
            //     return false;
            // }

            var wT = W(this),
                pos = wT.attr('data-pos'),
                top_val = 0;

            var jieshao_top = W('.site-shuju-jieshao-left .site-h2').getRect()['top'],
                // gonglue_top = W('.site-shuju-gonglue .site-h2').getRect()['top'],
                // zhuanjia_top = W('.site-shuju-zhuanjia .site-h2').getRect()['top'],
                // mendian_top = W('.site-shuju-mendian .site-h2').getRect()['top'],
                footer_top = W('#doc-footer').getRect()['top'];
            var wGonglue  = W('.site-shuju-gonglue .site-h2'),
                wZhuanjia = W('.site-shuju-zhuanjia .site-h2'),
                wMendian  = W('.site-shuju-mendian .site-h2'),
                gonglue_top, zhuanjia_top, mendian_top;
            if (wGonglue.length) {
                gonglue_top  = wGonglue.getRect()['top'];
            }
            if (wZhuanjia.length) {
                zhuanjia_top = wZhuanjia.getRect()['top'];
            }
            if (wMendian.length) {
                mendian_top = wMendian.getRect()['top'];
            }
            switch(pos){
                case '1':
                    top_val = jieshao_top;
                    break;
                case '2':
                    top_val = gonglue_top;
                    break;
                case '3':
                    top_val = zhuanjia_top;
                    break;
                case '4':
                    top_val = mendian_top;
                    break;
                case '5':
                    top_val = footer_top;
                    break;
            }
            setScrollTop(top_val);
        },
        '.site-shuju-gonglue-kuaisujiejue-btn': function(e){
            e.preventDefault();

            var zhuanjia_top = W('.site-shuju-zhuanjia .site-h2').getRect()['top'];

            setScrollTop(zhuanjia_top);
        }

    });

    // 附近位置搜素
    W('#AddressSearchForm').on('submit', function(e){
        e.preventDefault();

        var wMe = W(this),
            wQueryInput = wMe.query('.address-search-form-ipt')
            search_query = wQueryInput.val().trim();
        
        new bigMap().getGeoPoi(search_query, function(d){

            if (!d) {
                alert('没有查找到您搜索的位置！');
                wQueryInput.val('').focus();
                return;
            }
            var request_url = window.location.pathname + '?isajax=json&lng='+d.lng+'&lat='+d.lat;
            QW.Ajax.post(request_url, function(resData){
                resData = typeof resData==='string' ? QW.JSON.parse(resData) : resData;
                if (!resData['errno']) {

                    var shop_lists = resData['result'];
                    if (shop_lists.length) {
                        var pos = 0,
                            dividend = 2,
                            item_len = shop_lists.length;

                        pos = item_len%dividend ? (item_len-item_len%dividend) : (item_len-dividend);

                        var item_fn   = W('#UserCardItem4').html().trim().tmpl(),
                            item_html = item_fn({
                                'card_items': shop_lists,
                                'pos': pos,
                                'dividend': dividend
                            });
                        var wList = W('.mb-right-a .card-list');
                        item_html = item_html+'<div class="card-item-nomore"><a href="'+BASE_ROOT+'search/?_isfix=0&ie=utf-8&f=tcb&stype=0&keyword=数据恢复&lng='+d.lng+'&lat='+d.lat+'&addr='+search_query+'" target="_blank">更多实体店铺&gt;&gt;</a></div>';
                        wList.html(item_html);
                    }

                } else {
                    alert(resData['msg']);
                }
            });

        });

    });
    
    //poi suggestion
    new AddrSuggest(W('#AddressSearchForm [name="address_search"]'), {
        'showNum' : 8,
        'onSelect' : function(txt){ setTimeout( function(){ W('#AddressSearchForm').fire('submit') }, 100); },
        'requireCity' : function(){ return W('.area-box-sel').html() || '' }
    });

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
            // console.log(e)
            W('.site-shuju-mendian-city').html(e.name.trim()).attr('data-code', e.city.trim());
            getMendianList();
            // location.href ="http://" +location.host + location.pathname + '?citycode='+e.city.trim();
        });
    }
    selectCity('.site-shuju-mendian-city-changebtn');


    /**
     * 获取滚动条的高度
     * @return {[type]} [description]
     */
    function getScrollTop(){
        var scrolltop = 0;
        if(window.pageYOffset){//这一条滤去了大部分， 只留了IE678
            scrolltop = window.pageYOffset;
        }else if(document.documentElement.scrollTop ){//IE678 的非quirk模式
            scrolltop = document.documentElement.scrollTop;
        }else if(document.body.scrollTop){//IE678 的quirk模式
            scrolltop = document.body.scrollTop;
        }

        return scrolltop;
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
    var wSiteLeftNav = W('.site-left-nav'),
        wSiteLeftNavA = wSiteLeftNav.query('a'),
        s_val = 30,
        c_val = W('.site-shuju-jieshao .site-h2').getRect()['top'];
    var wGonglue  = W('.site-shuju-gonglue .site-h2'),
        wZhuanjia = W('.site-shuju-zhuanjia .site-h2'),
        wMendian  = W('.site-shuju-mendian .site-h2'),
        gonglue_top, zhuanjia_top, mendian_top;
    if (wGonglue.length) {
        gonglue_top  = wGonglue.getRect()['top'];
    }
    if (wZhuanjia.length) {
        zhuanjia_top = wZhuanjia.getRect()['top'];
    }
    if (wMendian.length) {
        mendian_top = wMendian.getRect()['top'];
    }
    /**
     * 设置顶部tab的位置
     */
    function setBodyMenuPos(){
        var s_top = getScrollTop();
        
        if (s_top>c_val) {
            wSiteLeftNav.css({
                'top': s_top-c_val+s_val
            });
            if (s_top<gonglue_top) {
                wSiteLeftNavA.removeClass('cur').item(0).addClass('cur');
            } else if (s_top<zhuanjia_top) {
                wSiteLeftNavA.removeClass('cur').item(1).addClass('cur');
            } else if (s_top<mendian_top) {
                wSiteLeftNavA.removeClass('cur').item(2).addClass('cur');
            } else {
                wSiteLeftNavA.removeClass('cur').item(3).addClass('cur');
            }
        } else {
            wSiteLeftNav.css({
                'top': s_val
            });
            wSiteLeftNavA.removeClass('cur').item(0).addClass('cur');
        }
    }
    if (wSiteLeftNav.length) {
        W(window).on('scroll', setBodyMenuPos);
        setBodyMenuPos();
    }

});
