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

;/**import from `/resource/js/component/suggest.js` **/
/**!
搜索
*/
(function(){
	var loadJs = function(url) {
		var head = document.getElementsByTagName('head')[0] || document.documentElement,
			script = document.createElement('script'),
			done = false;
		script.src = url;
		script.charset = 'utf-8';
		script.onerror = script.onload = script.onreadystatechange = function() {
			if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				done = true;
				head.removeChild(script);
			}
		};
		head.insertBefore(script, head.firstChild);
	},

	mix=function(des, src){
		for(var i in src){
			des[i] = src[i];
		}
		return des;
	},
	//DomU=QW.DomU,
	createElement=function (tagName, property) {
		return mix(document.createElement(tagName),property);
	},
	//EventH=QW.EventH,
	target=function(e) {
		e=e||window.event;
		return e.target || e.srcElement;
	},
	keyCode=function(e) {
		e=e||window.event;
		return e.which || e.keyCode || e.charCode;
	},
	preventDefault=function(e) {
		e=e||window.event;
		e.preventDefault && e.preventDefault() || (e.returnValue = false); 
	},
	//CustEvent=QW.CustEvent,
	//NodeH=QW.NodeH,
	hasClass=function(el, cn) {
		return new RegExp('(?:^|\\s)' +cn+ '(?:\\s|$)','i').test(el.className);
	},
	addClass=function  (el, cn) {
		if (!hasClass(el, cn)) {
			el.className = (el.className + ' '+cn).replace(/^\s+|\s+$/g,'');
		}
	},
	removeClass=function  (el, cn) {
		if (hasClass(el, cn)) {
			el.className = el.className.replace(new RegExp('(?:\\s|^)' +cn+ '(?:\\s|$)','i'),' ').replace(/^\s+|\s+$/g,"");
		}
	},
	//setStyle=NodeH.setStyle,
	//getXY=NodeH.getXY, 由于getXY的兼容代码很长，所以无依赖化时，稍稍调整下，不用位置，而改用dom结构来定位
	ancestorNode=function(el,tagName,topEl){
		do{
			if(el.tagName==tagName) return el;
		}while(el!=topEl && (el=el.parentNode))
		return null;
	},
	on=function (element, name, handler) {
		element.addEventListener ? element.addEventListener(name, handler, false) : element.attachEvent('on' + name, handler);
	},
	isIe=(/msie/i).test(navigator.userAgent);



	/**
	 *@class ComboBox 可输入下拉框 
	*/
	function ComboBox(opts){
		mix(this,opts);
		this.render();
	}

	ComboBox.prototype={
		/*
		*参数
		*/
		width:0,
		oText: null,//text-input对象
		itemsData:null,//items数据，array，需要在refreshData方法里进行设值
		/*
		*开放的变量，readOnly的
		*/
		oMenu:null,
		oWrap:null,
		selectedIndex:-1,//当前选中项
		filteredValue:"",//过滤值。过滤动作已完成
		filteringValue:"",//过滤值。过滤动作正在进行（因为有时过滤是异步的）
		acValue:"",//通过自动完成得到的值 
		closed:false,//suggest是否处于关闭状态。－－由suggest自身决定
		/*
		*方法
		*/
		show: function(){
			if( this.oMenu.childNodes.length){
				this.oWrap.style.display="";
			}
		},
		hide: function(){
			this.oWrap.style.display="none";
		},
		ishide : function(){
			return this.oWrap.style.display==="none";
		},
		refreshItems: function(rtype){
			var me=this;
			var data=me.itemsData;
			if(data && !data.__isItemsDataRendered){ //加上属性“__isItemsDataRendered”以标志data是否已经render成html
				var html=[];
				for(var i=0;i<data.length;i++){
					if(rtype=="hot"){
						var num = i+1;
						if(i<3){
							html.push('<li acValue="'+data[i][0].replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"><em>'+num+'</em>'+data[i][1]+'</li>');
						}else{
							html.push('<li acValue="'+data[i][0].replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"><em class="gray">'+num+'</em>'+data[i][1]+'</li>');	
						}
						
						
					}else{
						html.push('<li acValue="'+data[i][0].replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'">'+data[i][1]+'</li>');	
					}
					
				}
				me.oMenu.innerHTML = (html.join("").replace(/(<\w+)/g,'$1 unselectable="on"'));
				if(data.length) me.show();
				else me.hide();
				me.filteredValue=me.filteringValue;
				me.acValue="";
				me.selectedIndex=-1;
				data.__isItemsDataRendered=true;
			}
		},
		/*
		refreshData:function(){
			this.itemsData=["refreshData一定要重写！"];
		},
		*/
		setSelectedIndex:function(idx,needBlur){
			var me=this;
			var rows=me.oMenu.childNodes;
			if(rows.length){
				if(me.selectedIndex>-1) removeClass(rows[me.selectedIndex],"selected");
				idx=(idx+rows.length+1)%(rows.length+1);
				if(idx==rows.length){
					me.acValue=me.oText.value=me.filteringValue;//这里用filteringValue，而不用filteredValue，是因为有时itemsData是静态的（例如，不用过滤功能的单纯ComboBox）
					idx=-1;
				}
				else {
					me.acValue=me.oText.value=rows[idx].getAttribute("acValue");
					addClass(rows[idx],"selected");
				}
			}
			else{
				idx=-1;
			}
			me.selectedIndex=idx;
		},
		refreshPos : function(oWrap, oPos){
			oWrap.style.top=oPos.offsetHeight + 4 + 'px';
			oWrap.style.left=oPos.offsetLeft - 3 +'px';
		},
		render: function(){
			var me=this;
			if(me._rendered) return ;
			me._rendered=true;
			var innerHtml = '<div class=ac_wrap_inner><div class=ac_menu_ctn><ul class=ac_menu></ul></div></div>';

			if((/msie[ \/os]*6\./ig).test(navigator.userAgent)) innerHtml = '<iframe class="ac_bgIframe"></iframe>' + innerHtml;
			var oWrap=createElement("div",{className:"ac_wrap",innerHTML:innerHtml.replace(/(<\w+)/g,'$1 unselectable="on"')});
			//var b=document.body;
			//b.insertBefore(oWrap,b.firstChild);
			var oText=me.oText,
				oPos = me.oPos || oText;
			oPos.parentNode.insertBefore(oWrap,oPos);//为了减少定位麻烦，改用dom位置来定位
			var oMenu=me.oMenu=oWrap.getElementsByTagName("ul")[0];
			oText.setAttribute("autoComplete","off");//一定要用setAttrubute，否则会导致在firefox里半输入状态下执行oText.blur()时会抛出无法捕捉的异常。
			var w=(me.oText.getAttribute('suggestWidth')-0 || oPos.offsetWidth) + 4 +"px"; //支持suggestWidth属性来设置suggest的宽度
			if(isIe) oWrap.style.width=w;
			else oWrap.style.minWidth=w;
			me.refreshPos(oWrap, oPos);
			me.oWrap=oWrap;
			me.hide();
			on(me.oText,"dblclick",function(e){//监控oText的事件
				//if(!oText.value) return;
				//if(me.closed=!me.closed) me.hide();
				//me.show();
			});
			on(me.oText,"keydown",function(e){//监控oText的事件
				clearInterval(me._refreshTimer);
				me._refreshTimer=setInterval(function(){
					if(isMouseDown) return false;
					var val=oText.value;
					if(!val){
						me.acValue=me.filteringValue=me.filteredValue="";
						me.hide();
						me.closed=false;//吸收google suggest的策略：如果suggest被关闭，用户将oText清空，这时会将suggest打开。
					}
					else if(!me.closed){
						if(val != me.filteredValue && val != me.filteringValue && val != me.acValue){
							me.filteringValue=val;
							me.refreshData();
						}
						if(me.itemsData){
							me.refreshItems();
						}
					}
				},100);

				var kCode=keyCode(e);
				var dir=0;
				switch(kCode){
					case 40 : dir=1;break;
					case 38 : dir=-1;break;
					case 27 : if(!me.closed){me.hide();me.closed=true;preventDefault(e)} break;//隐藏suggest
					//case 13 : me.hide();me.onenter && me.onenter(); break;//隐藏suggest
				}
				if(dir && oText.value){
					preventDefault(e);
					if(oWrap.style.display=="none"){
						me.show();
						me.closed=false;
					}
					else{
						me.setSelectedIndex(me.selectedIndex+dir);
					}
				}
			});
			on(me.oText,"focus",function(e){//监控oText的事件
				//if(!me.closed) me.show();
				me.refreshPos(oWrap, oPos);
				var CLEAR_DEFAULT_SEARCH = window.location.href.indexOf('/search')>-1?false : true;
				var _val = me.oText.getAttribute('data-default');
				if(_val == me.oText.value && CLEAR_DEFAULT_SEARCH)me.oText.value = '';
				me.oText.className = me.oText.className.replace(/\s?default\s?/g, '');
				//拥有已输入内容时，开启suggest
				if(me.oText.value.length > 0){
					me.show();
					clearInterval(me._refreshTimer);
					me._refreshTimer=setInterval(function(){
						if(isMouseDown) return false;
						var val=oText.value;
						if(!val){
							me.acValue=me.filteringValue=me.filteredValue="";
							me.hide();
							me.closed=false;//吸收google suggest的策略：如果suggest被关闭，用户将oText清空，这时会将suggest打开。
						}
						else if(!me.closed){
							if(val != me.filteredValue && val != me.filteringValue && val != me.acValue){
								me.filteringValue=val;
								me.refreshData();
							}
							if(me.itemsData){
								me.refreshItems();
							}
						}
					},100);
				}
				
			});
			on(me.oText,"blur",function(e){//监控oText的事件
				me.hide();
				var _default = me.oText.getAttribute('data-default');
				if(!me.oText.value && _default){
					me.oText.value = _default;
					me.oText.className += ' default';
				}
				clearInterval(me._refreshTimer);
			});
			var isMouseDown ,
				mouseDownTimer;
			oWrap.onmousedown=function(e){//监控oWrap的事件
				preventDefault(e); // 阻止输入框失焦
				//if(isIe){oText.setCapture();setTimeout(function(){oText.releaseCapture();},10);} //解决“IE下，半输入状态时不能点击选项”的问题
				clearTimeout(mouseDownTimer);//以下三句解决“半输入状态时不能点击选项”的问题
				isMouseDown = true;
				mouseDownTimer = setTimeout(function(){isMouseDown=false;},2000);
			};
			oMenu.onclick=function(e){//监控oMenu的事件
				var el=target(e);
				var li=ancestorNode(el,"LI",oMenu);
				if(li) {
					oText.blur();//Firefox下半输入法输入时，选择item，console有错，无法catch，并且不影响运行。
					setTimeout(function(){oText.focus();},10);//解决“半输入状态时不能点击选项”的问题
					var rowIndex=0,
						preLi=li;
					while(preLi = preLi.previousSibling) rowIndex++;
					me.setSelectedIndex(rowIndex,true);
					me.hide();
					me.onselectitem && me.onselectitem();
				}
			};
			oMenu.onmouseover=function(e){//监控oMenu的事件
				var el=target(e);
				var li=ancestorNode(el,"LI",oMenu);
				if(li) addClass(li,"hover");
			};
			oMenu.onmouseout=function(e){//监控oMenu的事件
				var el=target(e);
				var li=ancestorNode(el,"LI",oMenu);
				if(li) removeClass(li,"hover");
			};
			/**
			oWrap.getElementsByTagName("a")[0].onclick=function(e){//监控close按钮的事件
				me.closed=true;
				me.hide();
				preventDefault(e);
			};
			**/
		}
	}

	window.suggest = function (data){
		var ar=[],
			menuData=data.result||[],
			kw=oText.value;
		for(var i=0;i<menuData.length;i++){
			var key=menuData[i].word|| menuData[i],
				val=key;
			if(kw && val.indexOf(kw)==0){
				val=kw+'<b>'+val.substr(kw.length)+'</b>';
			}
			if(key)	ar.push([key,val]);
		}
		cb.itemsData=ar;

		if(data.query){
			dataCache[data.query] = data;
		}
	};

	window.hotSuggest = function (data){
		var ar=[],
			menuData=data.result||[],
			kw=oText.value;
		for(var i=0;i<menuData.length;i++){
			var key=menuData[i].word|| menuData[i],
				val=key;
			if(kw && val.indexOf(kw)==0){
				val=kw+'<b>'+val.substr(kw.length)+'</b>';
			}
			if(key)	ar.push([key,val]);
		}
		cb.itemsData=ar;
		cb.refreshItems('hot');
		W(".search-click-here").hide();
		
	};
	var oText = document.getElementById('360tcb_so'),
		dataCache={};
	//oText.offsetParent.style.position = 'relative';
	var cb=new ComboBox({oText:oText,
		onselectitem:function(){
			var els = oText.form.elements;
			for(var i =0;i<els.length;i++){
				if(els[i].type=='submit') {
					els[i].click();

					return;
				}
			}
		},
		refreshData:function(){
			var data = dataCache[oText.value];
			if (data){
				suggest(data);
			}else {
				loadJs('http://suggest.bang.360.cn/suggest?word='+encodeURIComponent(this.oText.value)+'&category='+cid+'&encodein=utf-8&encodeout=utf-8&format=json&callback=window.suggest&t='+Math.random())

			}
		}

	});

	//点击搜索框右边箭头出搜索
	function __hotSearch(){
		var _type = W('.search-hot-word a.curr').attr('data-type')||0;
		
		loadJs(BASE_ROOT + '/aj/get_skeylist/?id='+_type +'&callback=window.hotSuggest')
	}

	W(".hd-search-wrap").delegate('.icon_clickhere','click',function(e){
		e.preventDefault();
		if( cb.ishide() ){
			W(this).addClass('selected');
			__hotSearch();
		}else{
			W(this).removeClass('selected');
			cb.hide();
		}
	})

	W('body').click(function(e){
		var tar = e.target;
		if(W(tar).ancestorNode(".ac_wrap") && W(tar).attr('id')!='360tcb_so' && !W(tar).hasClass('icon_clickhere')){
			W('.hd-search-wrap .icon_clickhere').removeClass('selected');
			cb.hide();
			//if( W('#doc-menubar-fixed').css('display')=="none" ) W(".search-click-here").show();
		}
	})

	W('#360tcb_so').on('focus', function(){
		var _this = this;
		setTimeout(function(){
			if(W(_this).val().length==0  ){			
				//W(".hd-search-wrap .icon_clickhere").fire('click');
				__hotSearch();			
			}
		}, 10);
	});
})();

;/**import from `/resource/js/component/bottomtip.js` **/
var BottomTip = BottomTip || (function(){    
    var tip = null, offsettop = 0;

    function show(txt, otop){

        if(QW.Browser.ie6){ return;} // Don't suport IE6.

        txt = txt || '';
        offsettop = otop || 0;
        tip = $('<div class="ui-bottom-tip"><div class="tip-content">'+txt+'</div><span class="tip-close" title="点击关闭">x</span></div>').appendTo('body');

        bindEvent();
    }

    function posBotTip(){
        if(tip == null){ return; }

        var st = document.body.scrollTop || document.documentElement.scrollTop;
        if(st > offsettop && tip.css('display')=='none'){
            tip.slideDown(300);
        }else if(st <= offsettop && tip.css('display')!='none'){
            tip.slideUp(300);
        }
    }

    function bindEvent(){
        W(window).on('scroll', posBotTip);
        W(window).on('load', posBotTip);
        W(window).on('resize', posBotTip);

        tip.find('.tip-close').on('click', function(e){
            e.preventDefault();
            tip.remove();
            tip = null;
        });
    }

    return {
        show : show
    }
})();

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




;/**import from `/resource/js/page/front.fangan.js` **/

Dom.ready(function(){

    function getJsonData(){
        if(W('#shopShowBox').length == 0){return;}
        var surl = '/client/search/';
        QW.Ajax.get(surl, {'keyword' : keyword, 'async' : 1}, function( text ){
            var data = JSON.parse(text);
            if(!data.data){
                W('#shopShowBox').html('抱歉，未找到符合条件的商家');
                return false;
            }
            data.shop_data = data.data;
            if(data.shop_data.length ==0){
                W('.dp-list-box').hide();
            }
            var tpl = W('#searchDPListTpl').html().tmpl();
            var dptxt = tpl(data);
            W('#shopShowBox').html( dptxt );
        });
    }

    W('.promise-logo').bind('mouseenter', function(e){
        var target = W(this).attr('data-to');
        W('.promise-cnt').hide();
        W('.promise-cnt[data-for="'+target+'"]').show();
    });

    //tab切换
    W('.ques-list-box .menu-item').on('click', function(e){
        e.preventDefault();
        var w_this = W(this);
        if(w_this.hasClass('curr')){
            return;
        }

        w_this.addClass('curr').siblings('.curr').removeClass('curr');
        var rel = w_this.attr('data-rel');
        W('.ques-list-box .ques-table').hide();
        W('.ques-list-box .ques-table[data-for="'+rel+'"]').show();
    });    

    W('body').delegate('.dp-info-tel', 'click', function(e){
        e.preventDefault();
        var wMe = W(this);

        tcb.panel('', '<div class="shop-phone-view-pannel"><div class="line"><span>店铺名称：</span><span>'+wMe.attr('data-shopname')+'</span></div><div class="line"><span>联系电话：</span><span class="lc1">'+wMe.attr('data-tel')+'</span></div><div style="height:30px;"></div><div class="line"><span class="lc2">联系我时，请说是在360同城帮看到的，谢谢！</span></div></div>', { 'width':380, 'height':180}, function(){return true;});
    });

    W('body').delegate('.dp-info-ept', 'click', function(e){
        e.preventDefault();
        var wMe = W(this);
        var eid = wMe.attr('data-eid');

        var panel = tcb.alert('使用服务', '<div style="padding:10px;font-size:14px;text-align:center;color:#f60"><img src="https://p.ssl.qhimg.com/t01d621a8109b7524b5.gif" width="24"> 服务启动中，请稍后...</div>', {width:300, height:126,btn_name:'知道啦'}, function(){return true;});
        //fater 5s, close the PANEL.
        setTimeout(function(){panel.hide();}, 5000);
        
        ExpertChat.checkAndStart(eid);
    });    
    
    getJsonData();
});

