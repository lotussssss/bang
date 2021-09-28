/**
 * 搜索
 */
(function(){
	var __lngLat = { lng: tcb.html_encode(location.search.queryUrl('lng'))||0, lat:tcb.html_encode(location.search.queryUrl('lat'))||0 };

	var hoverHandler = null;
	tcb.bindEvent(document.body, {
		'.search-hot-word a':function(e){
			e.preventDefault();
			W(".search-hot-word").query('a').removeClass('curr');
			W(this).addClass('curr');
			W('.tcb-top-search input[name="stype"]').val( W(this).attr('data-type') );
			W('.ac_wrap').hide();
		},
		'.ba-info .ba-close' : function(e){
			W(this).parentNode('.ba-info').hide();
			e.preventDefault();

		},
		'#feedback_show':function(e){
			e.preventDefault();
			if(W(this).hasClass('tit-show')){
				W(this).replaceClass('tit-show','tit-hide');
				W('#wentifankui').animate({'right':'0px','width':'40px'})
			}else{
				W("#fdTips").show();
				W("#fed_err_msg").html('还可以输入<span class="pipstxt"><i>120</i></span>个字')
				W(this).replaceClass('tit-hide','tit-show');
				W('#wentifankui').animate({'right':'0px','width':'476px'});
			}

		},
		'#feedback_send':function(){
			var textval = W("#fedbacktxt").val().replace(/\r\f\n\t/,'');
	    	var number = Math.floor((240 - textval.byteLen())/2);
	    	if(number<0||!textval){
	    		W("#fedbacktxt").shine4Error().focus();
	    		return;

	    	}
			var url = 'http://logs.helpton.com/webclient/bang_feedback.html?'+
				+ 'datetime='+new Date().getTime()+'&txt=' +encodeURIComponent(W("#fedbacktxt").val());

			var img = new Image(),
		        key = '360tcbfankui_log_' + Math.floor(Math.random() *
		              2147483648).toString(36);

		    window[key] = img;

		    img.onload = img.onerror = img.onabort = function() {

		      img.onload = img.onerror = img.onabort = null;

		      window[key] = null;

		      img = null;
		    };

		    img.src = url;

		    W("#feedback_result").show();
		    W("#fedbacktxt").val('');
		    setTimeout(function(){
		    	W('#feedback_show').replaceClass('tit-show','tit-hide');
				W('#wentifankui').animate({'right':'-440px'})
				W("#feedback_result").hide();
			},2000)

		},
		//按照服务类型切换
		'.area-wrap .tab-2 a':function(e){
			e.preventDefault();
			W('.area-wrap  .tab-2 li').removeClass('active');
			W(this).ancestorNode('li').addClass('active');
			//切换查询的函数
			doSearch(false);

		},
		//类型，按成交量，好评数切换
		'.search-mod-hd .mod-box4 li':function(e){

			e.preventDefault();
			W('.search-mod-hd .mod-box4 li').removeClass('curr');
			W(this).addClass('curr');
			//切换查询的函数
			doSearch(false);

		},
		//选择城市区县
		'.area-list .item>a':function(e){
			e.preventDefault();

			W(this).parentNode('.area-list').query('.curr').removeClass('curr');
			W(this).addClass('curr');

			W('.sub-area-list .currsub').removeClass('currsub');
			cleanAddrSearch();
			//切换查询的函数
			doSearch(true);
		},
		//选择商圈后的结果
		'.sub-area-list a.shangquan':function(e){
			e.preventDefault();

			W(this).parentNode('.sub-area-list').query('.currsub').removeClass('currsub');
			W(this).addClass('currsub');

			cleanAddrSearch();
			//切换查询的函数
			doSearch(true);
		},
		'.mod-search-page .prev':function(e){
			e.preventDefault();
			var currentpage = ~~W(".current-Page").html(),
				allpages = ~~W(".all-Pages").html();
			if(currentpage==1)return;
			if(currentpage<=allpages && currentpage >1){
				doSearch(false,'prev');
			}



		},

		'.mod-search-page .next':function(e){
			e.preventDefault();

			var currentpage = ~~W(".current-Page").html(),
				allpages = ~~W(".all-Pages").html();
			if(currentpage==allpages) return;
			if(currentpage<allpages){
				doSearch(false,'next');
			}

		},
		'.mod-search-page input.shangmen':function(e) {
			e.preventDefault();

			W('.mod-search-page input.shangmen').attr('checked',W(this).attr('checked'));

			doSearch(true);
		},
		'.mod-search-page input.online':function(e) {
			e.preventDefault();

			W('.mod-search-page input.online').attr('checked',W(this).attr('checked'));

			doSearch(true);
		},
		'.mod-search-page input.cuxiao':function(e) {
			e.preventDefault();

			W('.mod-search-page input.cuxiao').attr('checked',W(this).attr('checked'));

			doSearch(true);
		},
		'.mod-search-page input.bzj':function(e) {
			e.preventDefault();

			W('.mod-search-page input.bzj').attr('checked',W(this).attr('checked'));

			doSearch(true);
		},
		//商圈切换，鼠标效果。
		'.xxxx-area-list .has-sub':{
			'mouseenter':function(e){
				var target = e.relatedTarget,
					that =W(this);
				clearTimeout(hoverHandler);
				hoverHandler = setTimeout(function(){
					if(target&&!W(target).hasClass('shangquan')){
						var length = that.query('.sub .shangquan').length;
						if(length<10){
							that.query('.sub').css('width',50*length);
						}
						W('.area-list li').removeClass('hover').css('z-index','9');
						that.addClass('hover').css('z-index','99');
						var right = W('.area-list').getSize().width + W('.area-list').getXY()[0]-that.getXY()[0],
							subWith = W(".area-list .hover .sub").getSize().width,
							offset  = right - subWith;
						if(offset<0){
							W(".area-list .hover .sub").css('left',offset);
						}

					}
				},200);
			},
			'mouseleave':function(e){

				var target = e.relatedTarget;
				clearTimeout(hoverHandler);
				if(target&& !W('.area-list').contains(target)){
					W('.area-list li').removeClass('hover')
				}

			}

		},
		'.nobd-cont .btn-go' : function(e){
			e.preventDefault();
			try{ W('.subscribe-service').fire('click'); }catch(ex){}
		},
        // 显示更多区县
        '.search-res-list .srv-area': {
            'mouseenter':function(e){
                var wMe = W(this),
                    xy  = wMe.xy();
                if (wMe.query('.dp-area-list').length) {
                    var wClone = wMe.cloneNode(true);

                    W('#AreaDetailTip').html('').appendChild(wClone[0]).css({
                        'left': xy[0],
                        'top': xy[1]- (QW.Browser.ie && QW.Browser.ie-0 <=7?  0 : 0) ,
                        'display': 'block'
                    });
                }
            }
        },
        // 隐藏更多区县
        '#AreaDetailTip': {
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.hide();
            }
        },
        '.s-projects-box .tag-item' : function(e){
        	e.preventDefault();
			if( W(this).hasClass('curr') ){
				return false;
			}else{
				W('.s-projects-box').query('.tag-item.curr').removeClass('curr');
				W(this).addClass('curr');
				doSearch(true);
			}
        },
        //查看地图
        '.see-map': function(e){
			e.preventDefault();
			var el = W(this);

			new bigMap().show( el.attr('data-shopid') );

		},
        // 切换品牌维修店logo
        '.pinpai-logo-tab li': {
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.addClass('pinpai-logo-tab-cur').siblings('li').removeClass('pinpai-logo-tab-cur');
                W('.'+wMe.attr('target-block')).show().siblings('div').hide();
            }
        },
        //地图模式
		'a.btn-mode-map':function(e){
			e.preventDefault();
			showMap();
		}

	});

	//搜索结果
	function doSearch(flag,step){
		var params = getParam();
		if(step=="next"){
			params['pn']  = ~~params['pn'] + 1;
			params['type_id']  = location.href.queryUrl('type_id');
		}else if(step=="prev"){
			params['pn']  = ~~params['pn'] - 1;
			params['type_id']  = location.href.queryUrl('type_id');
		}
		flag && (params['pn'] = 0);

		location.href = "http://" +location.host +location.pathname + '?'+Object.encodeURIJson(params);
	}

	function feedbackCountNumber(){

    	W("#fedbacktxt").on('keyup,paste',function(){

    		if(W(this).val()){
    			W("#fdTips").hide();
    		}else{
    			W("#fdTips").show();
    		}
    		var textval = W("#fedbacktxt").val().replace(/\r\f\n\t/,'');
	    	var number = Math.floor((240 - textval.byteLen())/2);

	    	if(number>=0){
	    		W("#fed_err_msg").html('还可以输入<span class="pipstxt"><i>'+number+'</i></span>个字')
	    	}else{
	    		W("#fed_err_msg").html('您已经超过<span class="pipstxt"><i style="color:red">'+(~number)+'</i></span>个字')
	    	}
    	})

    	W("#fdTips").click(function(){
    		W("#fedbacktxt").focus();
    	})


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

	        var keyword = decodeURIComponent(location.href.queryUrl('keyword')||'');

	        location.href ="http://" +location.host +location.pathname +"?city_id=" + city +"&f=tcb&keyword=" + encodeURIComponent(keyword);
	    });
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
	/**
	 * 获得过滤的参数
	 */
	function getParam(){

		var pagenum = location.href.queryUrl('pn');
		var area_id = W('.area-list .curr').attr('data-code') || 0;
		var quan_id = W('.sub-area-list .currsub').attr('data-code') || 0;

		return {
			'city_id':cur_citycode,
			'area_id':area_id,
			'quan_id':quan_id ,
			'service_id':W(".area-wrap .tab-2 li.active a").attr('data-type'),
			'type_id':W(".search-mod-hd .mod-box4 li.curr").attr('data-type'),
			'shangmen':W(".mod-search-page #_checkbox_shangmen").attr('checked') ? '1':'0',
			'pn':pagenum,
			'keyword':keyword,
			'pagesize':15,
			'online':W(".mod-search-page #_checkbox_isonline").attr('checked') ? '1':'0',
			'cuxiao':W(".mod-search-page #_checkbox_cuxiao").attr('checked') ? 'on':'off',
			'is_bzj':W(".mod-search-page #_checkbox_bzj").attr('checked') ? '1':'0',
			'tag_id' : W('.s-projects-box .tag-item.curr').attr('data-tid')||0,
			'lng' : __lngLat? __lngLat.lng : '',
			'lat' : __lngLat? __lngLat.lat : '',
			'addr' : W('#addrSearchForm .addr-ipt').val()
		}

	}
	//控制表头
	function fixedHead(){
		if(W("#modBoxHead").length==0|| W(".search-mod-hd").length==0) return;

		var scrollY=Dom.getDocRect().scrollY,
			obj = W("#modBoxHead"),
			tableY = W(".search-mod-hd").getXY()[1];

		if(scrollY>tableY){
			 if(QW.Browser.ie6){
			 	obj.css({
			 		'position':'absolute',
			 		'top':scrollY,
			 		'width':'960px'
			 	}).show();
			 }else{
			 	obj.css({
			 		'position':'fixed',
			 		'top':0,
			 		'width':'960px'
			 	}).show()
			 }
		}else{
			 obj.hide();
		}
	}

	W(window).on('scroll', fixedHead);
    W(window).on('resize', fixedHead);

	    /**
     * 入口
     * @return {[type]} [description]
     */
    function init(){

		//选择城市，刷新页面
		selectCity('.citypanel_trigger');

		setValue();

		W(".search-list-pad img").forEach(function(item){
			if((W(item).attr('src')||'').indexOf('search')>-1){
				W(item).attr('src','https://p.ssl.qhimg.com/t0131ae47242942e138.png')
			}
		})

		feedbackCountNumber();
		//冻结搜索框
		fixedToSearchBox();

		//位置搜索过滤
		initAddrSearch('#addrSearchForm .addr-ipt');
    }

    init();

	/**
	 * 搜索结果的小喇叭提示，chrome有bug，需要再次刷新图片src
	 * @return {[type]} [description]
	 */
    function fixChromeGifBug(){
    	if(W('.search-msg-info .stip-img').length>0){
    		W('.search-msg-info .stip-img').attr('src', W('.search-msg-info .stip-img').attr('src') );
    	}
    }
    fixChromeGifBug();

    //冻结搜索框
    /*function fixedToSearchBox(){
    	if( W('#doc-menubar .tcb-top-search').length>0 ){
	    	W(window).on('scroll', autoFixedTopSearch);
			W(window).on('onload', autoFixedTopSearch);
			W(window).on('resize', autoFixedTopSearch);
			function autoFixedTopSearch(){
			    var dmH = W('#doc-menubar').getSize().height;
			    var tbH = W('#doc-topbar').getSize().height;
			    var dmfH = 68;
			    var dST = document.documentElement.scrollTop || document.body.scrollTop;
			    if( dST >= ( dmH + tbH - dmfH) ){
			        if( W('#doc-menubar-fixed').css('display') == 'none' ){
			        	//把搜索框放到浮动条中
			        	W('#doc-menubar').query('.hd-search-info form').appendTo( W('#doc-menubar-fixed .hd-search-info').html('') );
			        	W('.hd-search-info form input[name="_isfix"]').val(1);
			            W('#doc-menubar-fixed').show();
			            W('#doc-menubar').css('visibility', 'hidden');
			            if(!QW.Browser.ie6){
			            	W('#doc-menubar-fixed').css('top' , 0 - dmfH );
			            	W('#doc-menubar-fixed').animate({ 'top': 0} , 300, function(){}, QW.Easing.easeBothStrong);
			            }
			            W(".search-click-here").hide();
			        }
			    }else{
			        if( W('#doc-menubar-fixed').css('display') != 'none' ){
			        	//将搜索框放回去
			        	W('#doc-menubar .hd-search-info').appendChild(W('#doc-menubar-fixed').query('.hd-search-info form'));
			        	W('.hd-search-info form input[name="_isfix"]').val(0);
			            W('#doc-menubar').css('visibility', 'visible');
			            W('#doc-menubar-fixed').hide();
			            W(".search-click-here").show();
	    			}
			    }
			}
		}
    }*/

    //冻结搜索框完整版
    function fixedToSearchBox(){
    	if( W('#doc-menubar .tcb-top-search').length>0 ){

			function autoFixedTopSearch(){
				var tbH = W('#doc-topbar').getSize().height;
				var dST = document.documentElement.scrollTop || document.body.scrollTop;
				var dmH = W('#doc-menubar').getSize().height;

				W('#doc-menubar-fixed').css('height', dmH);
				if( dST>= tbH ){
					if( W('#doc-menubar-fixed').css('display') == 'none' ){
			        	//把搜索框区域浮动条中
			        	W('#doc-menubar').query('>.in').appendTo( W('#doc-menubar-fixed').html('') );
			        	W('.hd-search-info form input[name="_isfix"]').val(1);
			            W('#doc-menubar-fixed').show();
			            W('#doc-menubar').css('visibility', 'hidden');
			            W(".search-click-here").hide();
			        }
				}else{
					if( W('#doc-menubar-fixed').css('display') != 'none' ){
			        	//将搜索框区域放回去
			        	W('#doc-menubar').appendChild(W('#doc-menubar-fixed').query('>.in'));
			        	W('.hd-search-info form input[name="_isfix"]').val(0);
			            W('#doc-menubar').css('visibility', 'visible');
			            W('#doc-menubar-fixed').hide();
			            W(".search-click-here").show();
	    			}
				}
			}

			W(window).on('scroll', autoFixedTopSearch);
			W(window).on('onload', autoFixedTopSearch);
			W(window).on('resize', autoFixedTopSearch);
		}
    }

    //绑定位置搜索框
    function initAddrSearch(obj){
    	W('#addrSearchForm').bind('submit', function(e){
			e.preventDefault();
			var _this = this;
			var ipt = W(this).one('[name="addr"]');
			var txt = ipt.val();
			if( txt =='' || txt == ipt.attr('data-default') ){
				ipt.focus();
				if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(ipt);
			}else{
				getGeoPoi(txt, searchByPoi);
			}
		});

		W('#addrSearchForm').one('[name="addr"]').on('focus', function(){ W('.addr-search-err').hide(); });

		new AddrSuggest(obj, {
			'showNum' : 6,
			'onSelect' : function(txt){ getGeoPoi(txt, searchByPoi); },
			'requireCity' : function(){ return W('.area-box-sel').html() || '' }
		});
	}

	function searchByPoi(poi){
		if(poi == null){
			W('.addr-search-err').show();
		}else{
			W('.addr-search-err').hide();
			__lngLat = poi;
			cleanCitySel();
			doSearch(true);
		}
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

	//清楚位置搜索状态
	function cleanAddrSearch(){
		__lngLat = null;
		W('#addrSearchForm .addr-ipt').val('');
	}

	//清除城市区县商圈选择状态
	function cleanCitySel(){
		W('.area-list .item-hd').removeClass('curr').first().addClass('curr');
		W('.sub-area-list .currsub').removeClass('currsub');
	}

	function showMap(pn){

    	var panel = tcb.alert("地图模式", W("#mode_mapTpl2").html(), {'width':688, btn_name: '关闭',wrapId:"panel-modeMapindex"}, function(){
            map = null;
            return true;
    	});
		//reset
		document.getElementById("mode_map_container").innerHTML = "";

		map = new AMap.Map("mode_map_container",{
            view: new AMap.View2D({//创建地图二维视口
               zoom:10,
               rotation:0
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
		})

		//直接从页面中获取变量显示结果
		var data = SEARCH_RS_JSON.shop_data;

		data.forEach(function(item, i){
			if(i == 0){
				map.setCenter(new AMap.LngLat(item.map_longitude, item.map_latitude))
			}

			var marker = new AMap.Marker({
	            id:"mapMarker"+i,
	            position:new AMap.LngLat(item.map_longitude, item.map_latitude),
	            icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
	            offset:{x:-13,y:-36}
	        });
	        marker.setMap(map);

	        var infoWindow = new AMap.InfoWindow({
				isCustom: true,
				autoMove: true,
				offset:new AMap.Pixel(70,-290),
				content:W('#indexMapInfoTpl2').html().tmpl({
					shop_name: item.shop_name,
					addr: item.addr_detail || item.s_addr_detail,
					service_tags: item.main.subByte(40, '...'), //item.service_tags.subByte(40,'...'),
					qid: item.qid,
					shop_addr: item.shop_addr,
					online_txt: item.is_online == "on" ? "立即咨询" : "离线留言"
				}),
				size: new AMap.Size(349, 204)
			});
			if(item.recommend==1){
				//W("#maprecommendTips").show();
			}
			AMap.event.addListener(marker, "click", function(){
                //try{ tcbMonitor.__log({cid:'map-marker-click',ch:''}); }catch(ex){}
				infoWindow.open(map, marker.getPosition())
			})
		});
    }

})();

(function(){
    var wRightEnter;

    // 在搜索页右侧显示 维修 和 优品入口
    function showRightLiangpinEnter(){

        wRightEnter = W('.right-liangpin-enter');
        if( wRightEnter.length == 0 ){
            wRightEnter = W('<div class="right-liangpin-enter"><a href="/xiu" class="enter-xiu" target="_blank"></a><a href="/youpin" class="enter-liangpin" target="_blank"></a></div>').appendTo( W('body') );

            _autoRightLiangpinEnterPos();
        }
    }
    function _autoRightLiangpinEnterPos(){

        W(window).on('load', _autoPos);
        W(window).on('resize', _autoPos);

        _autoPos();
    }

    function _autoPos(){
        try{ wRightEnter.css('left', (Dom.getDocRect().width - W('.doc-bd').getRect().width)/2 + W('.doc-bd').getRect().width + 10);}catch(ex){}

        try{ wRightEnter.css('left', (Dom.getDocRect().width - W('.doc-bd').getRect().width)/2 + W('.doc-bd').getRect().width + 10);}catch(ex){}
    }


    Dom.ready(function(){
        showRightLiangpinEnter();
    });

}());
