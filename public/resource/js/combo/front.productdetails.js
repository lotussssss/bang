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

;/**import from `/resource/js/component/placeholder.js` **/
(function(){

	function PlaceHolder(){

		this.init.apply(this,arguments);
	}

	PlaceHolder.prototype = (function(){

		return {

			init:function(element){

				var instance = this;
				CustEvent.createEvents(this);

				var _placeholder = '';
					this.element = W(element);

				if(instance.element && !("placeholder" in document.createElement("input")) && 
					(_placeholder = instance.element.attr("placeholder"))){

			        var eleLabel = W('<label for="'+this.element.attr('id')+'"></label>').addClass('ele4phtips')[0];
			        
			        //插入创建的label元素节点
			        instance.element.parentNode().insertBefore(eleLabel, instance.element[0]);
			        
			        //方法
			        var funOpacity = function(ele, opacity) {
				            if (ele.style.opacity) {
				                ele.style.opacity = opacity / 100;
				            } else {
				                ele.style.filter = "Alpha(opacity="+ opacity +")";    
				            }
				        }, 
				        opacityLabel = function() {
				            if (!instance.element.val()) {
				                funOpacity(eleLabel, 0);
				                eleLabel.innerHTML = _placeholder;
				            } else {
				                eleLabel.innerHTML = "";    
				            }
				        };
			        
			        instance.element
			        	.on('keyup',function(){
			        		opacityLabel(); 
			        	})
			        	.on('focus',function(){
			        		opacityLabel();
			        	})
			        	.on('blur',function(){
			        		if (!instance.element.val()) {
			                funOpacity(eleLabel, 100);
			                eleLabel.innerHTML = _placeholder;  
			            }
			        	})
			        
			        //样式初始化
			        if (!instance.element.val()) { eleLabel.innerHTML = _placeholder; }

				}

			}
		}

	}());

	QW.provide({'PlaceHolder':PlaceHolder});

}())

;/**import from `/resource/js/include/shop.func.js` **/
var shopFunc = shopFunc || (function(){

	function getPrdText(obj){
		var _this = obj;
		var url = window.location.href.replace(/(&|\?)?inclient=\d/ig, '');
		var pname = _this.attr('data-pname');
		var sname = _this.attr('data-sname');
		var txt = pname +'-'+ sname +'-'+ '360同城帮电脑维修' + '，详情请访问： ' +url;

		return txt;
	}

	function getShopText(obj){
		var _this = obj;
		var url = window.location.href.replace(/(&|\?)?inclient=\d/ig, '');		
		var sname = _this.attr('data-sname');
		var txt = sname +'-'+ '360同城帮电脑维修' + '，详情请访问： ' +url;

		return txt;
	}

	function getText(obj, type){
		var txt;
		if(type == 'product'){
			txt = getPrdText(obj);
		}else{
			txt = getShopText(obj);
		}

		return txt;
	}

	function getMsgText(obj, type){
		return obj.attr('data-msgtxt');		
	}

	function getData(obj, type){
		var _this = obj;

		if(type == 'product'){
			var pid = _this.attr('data-pid');
			var sid = _this.attr('data-sid');

			return { 'product_id' : pid, 'shop_id' : sid }
		}else{						
			var sid = _this.attr('data-sid');

			return { 'shop_id' : sid }
		}		
	}
	
	function shareLink(obj, type){
		
		var txt = getText(obj, type);
		if( typeof(_inclient)!='undefined' && _inclient ){
			var btn = [
				{
					txt: "复制",
					fn: function(){
						try{
							textarea[0].select(); 
	 						document.execCommand("Copy");
	 						alert('复制成功~');
						}catch(ex){
							alert('抱歉，复制失败，请使用 Ctrl+C 进行复制');
						}
					},
					cls: "ok"
				}, {
					txt: "关闭",
					fn: function(){
						return true;
					}
				}
			];

		}else{
			var btn = [
				{
					txt: "关闭",
					fn: function(){
						return true;
					}
				}
			];
		}

		var panel = tcb.panel("分享",'<div style="padding:10px"><h3 style="font-size:14px;font-weight:bold;margin-bottom: 8px;">复制当前商品信息分享给好友：</h3><textarea style="width:350px; height:76px;padding:5px; border:1px solid #CCCCCC;">'+txt+'</textarea></div>', {'width':380, 'height':220, 'wrapId':"panel-shareLink", 'btn': btn });

		var textarea = W(panel.oBody).one('textarea');
		textarea.on('mouseover', function(){
			setSelectRange( this, 0, this.value.length );
		});
		
	}

	function _sendToPhone(obj, type){
		
		var data = getData(obj, type);
		var txt = getMsgText(obj, type);

		var panel = tcb.panel("发送到手机",'<div style="padding:10px 20px;" class="clearfix"><div style="float:left; width:190px;"><div style="color:#666;border:1px solid #ccc; background:#FCFADE; padding:5px;height: 112px; overflow-y:auto">'+txt+'</div></div><div style="float:right; width:140px;"><h3 style="font-size:14px;font-weight:bold;margin-bottom: 8px;color:#777;">请输入您的手机号码</h3><form><input name="user-tel" style="width:130px; height:20px;padding:5px; border:1px solid #CCCCCC;"><div style="line-height:30px; color:#999;">每个用户每日限发送3次</div><input class="btn-send2phone" type="submit" value="确定发送" ></form></div></div>', {'width':380, 'height':180, 'btn_name': '关闭','wrapId':"panel-sendLink"}, function(){return true;});

		var form = W(panel.oBody).one('form');
		form.on('submit', function(e){
			e.preventDefault();

			var tel = W(this).one('[name="user-tel"]');			

			if( tel.val() !='' && /\d{11}/.test(tel.val()) ){
				data.mobile = tel.val();

				var url = '/aj/fen_xiang';

				QW.Ajax.post( url, data, function(data){
					var rs = JSON.parse( data );
					if(rs.errno == 0){
						alert('发送成功~');
					}else{
						alert('抱歉，出错了，请稍后再试。'+ rs.errmsg);
					}
				});
			}else{
				tel.shine4Error().focus();
			}
		});
	}

	function sendToPhone(obj, type){
		//必须登录
		QHPass.when.signIn(function(){
			_sendToPhone(obj, type);
		});		
	}

	//设置textarea的选中区域 
	function setSelectRange( textarea, start, end ) { 
		if ( typeof textarea.createTextRange != 'undefined' )// IE 
		{ 
			var range = textarea.createTextRange(); 
			// 先把相对起点移动到0处 
			range.moveStart( "character", 0) 
			range.moveEnd( "character", 0); 
			range.collapse( true); // 移动插入光标到start处 
			range.moveEnd( "character", end); 
			range.moveStart( "character", start); 
			range.select(); 
		}else if ( typeof textarea.setSelectionRange != 'undefined' ){
			textarea.setSelectionRange(start, end); 
			textarea.focus(); 
		}
	} 

	return{
		'shareLink' : shareLink,
		'sendToPhone' : sendToPhone
	}
})();




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

;/**import from `/resource/js/page/front.productdetails.js` **/

	(function(){
        document.domain = "360.cn";
		function init_load()
		{
			var len = W(".p-service li").length;			
			if (len == 1)
			{
				W(".p-service li").item(0).fire('click');
			}
		}
		
        var fix_position_top;
		function fixPosition(element){

			fix_position_top = element.getXY()[1];
	        W(window).on('scroll', function() {
	            var scrolls = document.body.scrollTop||document.documentElement.scrollTop;
	            if (scrolls > fix_position_top) {
	                if (window.XMLHttpRequest) {
	                    element.css({
	                        'position': 'fixed',
	                        'z-index':10000,
	                        'top': 0
	                    }); 
	                    element.addClass("nav-fixed");
	                      
	                } else {
	                    element.css({
	                    	'position': 'absolute',
	                    	'z-index':10000,
	                        'top': scrolls
	                    }); 
	                    element.addClass("nav-fixed");   
	                }
	                W("#imShow").show();
	            }else {
	                element.css({
	                    position: 'absolute',
	                    top: fix_position_top
	                });   
	               element.removeClass("nav-fixed"); 
	                W("#imShow").hide();
	            }                       
	        });
		}
        function resetFixPositionTop(wEl){
            fix_position_top = wEl.getXY()[1];
        }

		fixPosition(W('.tit-container'));


		var dataListCache = {};
		//获得用户评价
		function asynUserComment(pn,flag){
			//type = type|| "";
			pn = pn || 0;
			flag = flag|| false;

			var html = "",
				item;
			
			var params =  "pagesize=10&shop_id="+shop_id+"&pn="+pn+"&itemid="+product_id+"&product_id="+product_idd;

			var domTpl = W('#userCommentDetailTpl').length  ? W('#userCommentDetailTpl') :W('#userCommentDetailTpl2')

			if(dataListCache[params]){

				var _data = dataListCache[params];
				flag&&userCommentPager(Math.ceil(_data.page.comm_total/_data.page.pagesize));
				var func = domTpl.html().trim().tmpl();
				html = func(_data);
				W("#userComment").html(html);

			}else{
				loadJsonp(BASE_ROOT + "ajproduct/getitem_pingjia/?"+ params,function(ret){
					if(parseInt(ret.errno,10)!==0){
						html = '<div class="li-nodata">该商品暂无评价。</div>';
					}else{
						
						if(ret.result.length==0){
							html='<div class="li-nodata">该商品暂无评价。</div>';
						}else{
	                        if (ret['result'] && ret['result'].length) {
	                            ret['result'].forEach(function(item){
	                                item['order_id'] = item['order_id'].replace(/^(\d{9})\d+(\d{4})$/, '$1******$2');
	                            });
	                        }

							dataListCache[params] = ret;
							flag&&userCommentPager(Math.ceil(ret.page.comm_total/ret.page.pagesize));
							var func = domTpl.html().trim().tmpl();
							html = func(ret);
						}

					}

					W("#userComment").html(html);

				})

			}	
			
		}
		function userCommentPager(pagenum){
			if(pagenum==1){
				W('#userCommentPager .pages').html('');
				return;
			}
			var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
		    var pager = new Pager(W('#userCommentPager .pages'), pagenum, pn);

		    pager.on('pageChange', function(e) {
		        asynUserComment(e.pn);
		    });
		}

		function showShopDetail(){
			var content = W('#shopInfoTpl').html().trim().tmpl();
			content = content({});

			var config = {
				"withMask": true,
				"posCenter": true,
				"className":"shopinfo-box", 
				"header": '<a href="#" class="close-pop-btn pngfix">关闭</a>',
                "body": content
			}

			var panel = new QW.BasePanel(config);

            panel.show(null, null);

            W(panel.oHeader).one('.close-pop-btn').on('click', function(e){
            	e.preventDefault();
            	panel.hide();
            });
		}

		var shopinfoTimer = null;
		function showShopDetailFloat(show, rect){			
			var box = W('.shopinfo-box-float');
			if( !box.length ){
				var content = W('#shopInfoTpl').html().trim().tmpl();
				content = content({});

				box = W('<div class="shopinfo-box-float"></div>').addClass('shopinfo-box').appendTo(　W('body') ).html( content );

				box.on('mouseenter', function(e){
					showShopDetailFloat(true);
				});

				box.on('mouseleave', function(e){
					showShopDetailFloat(false);
				});
			}

			if(show){
				if( shopinfoTimer ){ clearTimeout( shopinfoTimer ); shopinfoTimer=null; }

				box.show();

				if(rect){
					box.css({
						'left' : rect.left - 200,
						'top' :  rect.top +20
					});
				}
			}else{
				var timer = setTimeout( function(){box.hide();}, 300);
				shopinfoTimer = timer;				
			}

		}
		
		asynUserComment(0,true);

        var PriceCache = {
            'price': [],
            'm_price': []
        };
		tcb.bindEvent(document.body,{
			'.search-hot-word a':function(e){
				e.preventDefault();
				W(".search-hot-word").query('a').removeClass('curr');
				W(this).addClass('curr');
				W('.tcb-top-search input[name="stype"]').val( W(this).attr('data-type') );
				W('.ac_wrap').hide();

				var typeid = W(this).attr('data-type')||0;
	            var defKeyword = ['上门安装调试路由器', '系统安装', '笔记本除尘清灰', '手机刷机', '打印机维修', '服务器检测' ];
	            var ckey = defKeyword[typeid];
	            W('#360tcb_so').val(ckey).attr('data-default', ckey);
			},
			'.agreement a' : function(e) {
				e.preventDefault();
				var panel = tcb.alert("360同城帮用户服务协议", W('#showUserProtocalTpl').html(), {'width':695}, function(){
		                panel.hide();
		            });
			},
			'.btn-offline':function(e){
				e.preventDefault();
			},

			'#buy_number':{
	            'keyup':function(){
	                var val = W("#buy_number").val()||"";
	                if(val&& /^[0-9]*[1-9][0-9]*$/.test(val)){
	                	val = val.substr(0,4);
	                    if(val<1){
	                    		W("#numberTips").show().fadeOut(2000);
	                        W("#buy_number").val(1)
	                        
	                    }else if(val>1000){
	                    	 W("#numberTips").show().fadeOut(2000);
	                    	 W("#buy_number").val(1000)
	                    	
	                    }
	                    
	                }else{
	                    if(val){
	                    	 W("#numberTips").show().fadeOut(2000);
	                        W("#buy_number").val(1)
	                       
	                    }  
	                }
	                
	            }
	        },
			'.mod-buy-number .ico_add':function(e){
				e.preventDefault(); 
				if(W("#buy_number").val()>999){
					W("#numberTips").show().fadeOut(2000);
					W("#buy_number").val(1000)
				}else{
					W("#buy_number").val(~~W("#buy_number").val()+1)
				}
				
			},
			'.mod-buy-number .ico_sub':function(e){
				e.preventDefault();
				if(W("#buy_number").val()>1){
					W("#buy_number").val(~~W("#buy_number").val()-1)
				}
				
			},
            // 选择服务方式
			'.p-service ul li':function(e){
				e.preventDefault();
				var me  = W(this);
				clearInterval(timer);
				W('.p-service').query('li').removeClass('blinkbg');

				me.ancestorNode('ul').query('li').removeClass('cur');
				me.addClass('cur');

                // 设置服务方式
                W('[name="o_server_method"]').val(me.query('em').attr('data-type'));

                // 多属性分类下，此cache有效
                if (PriceCache['price'].length) {
                    // 设置商品价格
                    setProductPrice(PriceCache['price'], PriceCache['m_price']);
                    W(".service-p-msg-info").hide();
                    return;
                }

				var price = parseFloat(W("#product_price_o").val());
                if (price>=0) {
                    price = price*100;
                    var fee = W('.p-service .cur').query('em').html()*100;
                    var all_money = (price +fee)/100 + '';
                    if(/^\d*\.\d$/.test(all_money)){
                        all_money = all_money +"0";
                    }else if(/^\d*$/.test(all_money)){
                        all_money = all_money +".00";
                    }
                    W("#product_price").html(all_money);
                }
				W(".service-p-msg-info").hide();
			},
            // 选择分类
            '.p-cate ul li':function(e){
                e.preventDefault();
                var me  = W(this);

                var kk = me.ancestorNode('ul').siblings('label').html();
                if (timerList && timerList[kk]) {
                    clearInterval(timerList[kk]);
                }

                var wCurCate = me.ancestorNode('.p-cate');
                // 多属性（分类）
                if(product_attr_info&&product_attr_info.length){
                    // 不能被选择状态~
                    if (me.hasClass('disabled-selected')) {
                        return;
                    }
                    var selectedAttr = [];
                    // 点击已被选中状态的li
                    if (me.hasClass('cur')) {
                        me.removeClass('cur');
                    } 
                    // 点击没有被选中的li
                    else {
                        me.ancestorNode('ul').query('li').removeClass('blinkbg').removeClass('cur');
                        me.addClass('cur');
                    }
                    var wPCate = W('.p-cate');
                    wPCate.forEach(function(el, i){
                        var wItem = W(el),
                            wCur = wItem.query('.cur');
                        if (wCur.length) {
                            selectedAttr[i] = wCur.attr('attr-id');
                        } else {
                            selectedAttr[i] = [];
                            wItem.query('li').forEach(function(l){
                                selectedAttr[i].push(W(l).attr('attr-id'));
                            });
                        }
                    });
                    setProductAttrUi(selectedAttr, AttrGroup, AttrList);
                    var attrGroup2 = [],
                        AttrGroup_itemstr = AttrGroup.map(function(item){return item.join('');});
                    arrCombinedSequence(selectedAttr).forEach(function(a){
                        a = a.join('');
                        if (AttrGroup_itemstr.contains(a)) {
                            attrGroup2.push(a);
                        }
                    });

                    var price_arr = [],
                        m_price_arr = [];
                    product_attr_info.forEach(function(item){
                        if(attrGroup2.contains(item['attr_id'])){
                            price_arr.push(item['price']);
                            m_price_arr.push(item['m_price']);
                        }
                    });
                    PriceCache['price'] = price_arr;
                    PriceCache['m_price'] = m_price_arr;

                    // 设置商品价格
                    setProductPrice(price_arr, m_price_arr);
                    W(".cate-p-msg-info").hide();
                    return;
                }

                var wLis = me.ancestorNode('ul').query('li');
                wLis.removeClass('blinkbg').removeClass('cur');
                me.addClass('cur');

                var n_price = parseFloat(wLis.filter('.cur').attr('attr-price'));
                if (n_price>=0) {
                    W("#product_price_o").val(n_price);
                    n_price = n_price*100;
                    var wCurService = W(".p-service .cur"),
                        fee = 0;
                    if (wCurService && wCurService.length) {
                        fee = wCurService.query('em').html()*100;
                    }
                    var all_money = (n_price + fee)/100 + '';
                    if(/^\d*\.\d$/.test(all_money)){
                        all_money = all_money +"0";
                    }else if(/^\d*$/.test(all_money)){
                        all_money = all_money +".00";
                    }
                    W("#product_price").html(all_money);
                }
                W(".cate-p-msg-info").hide();
            },            
			'#p-tab-list li':function(e){
				e.preventDefault();
				var me  = W(this),
					id = me.attr('data-id');
				me.ancestorNode('ul').query('li').removeClass('curr');
				me.addClass('curr');
				W('.tab-wrap').hide();
				W("#"+id).show();

			},
			'a.see-phone':function(e){
				e.preventDefault();
				//W("#detail").addClass('detail show');
				W(this).siblings(".xd-baozhang-tip").show();
				W(this).hide();
				var tel = W(this).attr('data-tel');
				W('.contact strong').html(tel);
				new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=product" +( typeof(_inclient)!='undefined'&&_inclient ? '&inclient=1' : '' );
			},
			//分享
			'#shareShop' : function(e){
				e.preventDefault();	
				var _this = W(this);
				shopFunc.shareLink(_this, 'product');
			},
			//发送到手机
			'#sendToPhone' : function(e){
				e.preventDefault();	
				var _this = W(this);
				shopFunc.sendToPhone(_this, 'product');
			},
			'#viewBigMap': function(e){
				e.preventDefault();

				new bigMap().show(W(this).attr('data-shopid'), window._inclient? true : false);

			},
			'.show-real-mobile' : function(e){
				e.preventDefault();
				var tel = W(this).attr('data-tel');
				W(this).siblings('.mobile-box').html( tel + '&nbsp;&nbsp;<span href="#" class="buy-pay-offline">免费登记预约信息，服务遇问题360同城帮先赔</span>' ).addClass('real-tel').addClass('pngfix').attr('title', W(this).attr('title'));
				W(this).hide();
				new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpudetail";
			},
			'.show-shop-info' : function(e){
				e.preventDefault();
				showShopDetail();
			},
            // 显示完整的评论内容
            '.comment-content-more': function(e){
                e.preventDefault();

                var wMe = W(this),
                    wP = wMe.parentNode('p');

                wP.html(wP.attr('title').encode4Html()).css({
                    'height': 'auto'
                });
            },
            '.hot-sale .pre-page' : function(e){
            	e.preventDefault();
            	var bst = W('.hot-sale .sale-prd')[0].scrollTop;
            	var stepDs = W('.hot-sale .sale-prd').getRect().height;
            	if(bst> 0){
            		W('.hot-sale .sale-prd').animate({ scrollTop: bst-stepDs }, 300);
            	}
            },
            '.hot-sale .next-page' : function(e){
            	e.preventDefault();

            	var bst = W('.hot-sale .sale-prd')[0].scrollTop;
            	var stepDs = W('.hot-sale .sale-prd').getRect().height;
            	if(1){
            		W('.hot-sale .sale-prd').animate({ scrollTop: bst+stepDs }, 300);
            	}
            },
            '.dp-more-info' : {
            	'mouseenter' : function(e){
            		var w_this = W(this);
            		showShopDetailFloat(true, w_this.getRect() );
            	},
            	'mouseleave' : function(e){
            		showShopDetailFloat(false);
            	}
            },
            '.product-memory-more-attr': function(e){
                e.preventDefault();

                W('.p-cate').show();
                W(this).hide();

                // 重新设置下边商品详情tab的位置
                W('.tit-container').css({
                    'position': 'static'
                });
                resetFixPositionTop(W('.tit-container'));
            },
            // 切换服务方式
            '.p-buy-info2-nav-li': function(e){
                e.preventDefault();

                var wMe = W(this);

                if (wMe.hasClass('disabled')) {
                    return ;
                }
                wMe.addClass('selected').siblings().removeClass('selected');

                W('.p-buy-info2-cont li').hide().item(wMe.attr('data-index')).show();
            },
            // 选择支付方式
            '.pay-method': function(e){
                var wMe = W(this);

                if (wMe.val()=='wangyin') {
                    W('.bank-selector-wrap').show();
                } else {
                    W('.bank-selector-wrap').hide();
                }
            },
            // 切换
            '.p-buy-info3-nav li': function(e){
                e.preventDefault();

                var wMe  = W(this);

                if (wMe.hasClass('disabled-selected')) {
                    return;
                }

                var kk = wMe.ancestorNode('ul').siblings('label').html();
                if (timerList && timerList[kk]) {
                    clearInterval(timerList[kk]);
                }

                var wLis = wMe.ancestorNode('ul').query('li');
                wLis.removeClass('blinkbg').removeClass('cur');
                wMe.addClass('cur');

                var ind = wMe.attr('data-index');
                if (ind=='0') {
                    W('.p-buy-info2-cont-buy-form').hide();
                    W('.p-buy-info2-cont-pay-form').show();
                    W('.p-buy-info3-item1-desc').show();
                    W('.p-buy-info3-item2-desc').hide();
                } else {
                    W('.p-buy-info2-cont-pay-form').hide();
                    W('.p-buy-info2-cont-buy-form').show();
                    W('.p-buy-info3-item1-desc').hide();
                    W('.p-buy-info3-item2-desc').show();
                }

            },
            '.p-buy-info2-cont-ipt': {
                'focus': function(e){
                    var wMe = W(this),
                        val = wMe.val().trim(),
                        def_text = wMe.attr('placeholder');

                    wMe.removeClass('default-text');

                    if (val==def_text) {
                        wMe.val('');
                    }
                },
                'blur': function(e){
                    var wMe = W(this),
                        val = wMe.val().trim(),
                        def_text = wMe.attr('placeholder');

                    if (!val || val==def_text) {
                        wMe.addClass('default-text').val(def_text);
                    }
                }
            }
		});
        // 提交订单
        W('.p-buy-info2-cont-pay-form, .p-buy-info2-cont-buy-form').on('submit', function(e){
            e.preventDefault();
            var flag = true;
            var wMe = W(this);

            // 服务方式
            var wServerMethod = wMe.query('[name="o_server_method"]'),
                server_method = wServerMethod.val();
            if (!server_method) {
                W(".service-p-msg-info").show();
                var wS = W('.p-service'),
                    list = wS.query('li');
                list.addClass('blinkbg');

                var n = 0;

                var kk = wS.query('label').html();
                if (timerList[kk]) {
                    clearInterval(timerList[wS.query('label').html()]);
                }
                timerList[kk] = setInterval(function(){
                    n %2 ? list.removeClass('blinkbg'):list.addClass('blinkbg');
                    n = n +1;
                    if(n> 9){
                        clearInterval(timerList[kk]);
                        n = 0;
                    }
                    
                },180);
                flag = false;
            }
            // 价格
            var price = W('#product_price').html().trim();
            wMe.query('[name="o_summoney"]').val(parseInt(price)>0 ? price : 0);

            // 银行代码
            var wPayMethod = wMe.query('.pay-method:checked');
            if (wPayMethod.length) {
                var pay_method = wPayMethod.val();
                wMe.query('[name="bank_code"]').val(pay_method == 'wangyin' ? wMe.one('.bank-selector').val() : pay_method);
            }

            // 设置商品属性id
            var attr_id = W('.p-cate').map(function(el, i){
                var wP = W(el),
                    wCur = wP.query('.cur');
                if (wCur.length) {
                    return wCur.attr('attr-id');
                } else {
                    var list2 = wP.query('li');
                    list2.addClass('blinkbg');

                    var n2 = 0;

                    var kk = wP.query('label').html();
                    if (timerList[kk]) {
                        clearInterval(timerList[wP.query('label').html()]);
                    }
                    timerList[kk] = setInterval(function(){
                        n2 %2 ? list2.removeClass('blinkbg'):list2.addClass('blinkbg');
                        n2 = n2 +1;
                        if(n2> 9){
                            clearInterval(timerList[kk]);
                            n2 = 0;
                        }
                    },180);

                    flag = false;
                }
            }).join('');
            if (attr_id) {
                wMe.query('[name="attrid"]').val(attr_id);
            }

            // 手机
            var wTel = wMe.one('[name="buyer_mobile"]');
            if(wTel.val().trim()==wTel.attr('placeholder') || wTel.val().trim() == '' || !tcb.validMobile(wTel.val())){
                wTel.shine4Error();
                wTel.focus();
                return false;
            }

            if (flag) {
                // if (window._inclient && wMe.one('[name="pay_method"]').val()==1) {
                //     var url = attr_id 
                //             ? BASE_ROOT + "torder/info/?itemid="+W('#PProducrId').val()+"&from=details_product&num="+W('#buy_number').val() +"&met="+ server_method + '&paymode=' + wMe.one('[name="pay_method"]').val() + '&attrid=' + attr_id 
                //             : BASE_ROOT + "torder/info/?itemid="+W('#PProducrId').val()+"&from=details_product&num="+W('#buy_number').val() +"&met="+ server_method + '&paymode=' + wMe.one('[name="pay_method"]').val() ;
                //     location.href= url + '&inclient=1' + ( QW.Cookie.get('C_RUNIN_LDS')==1? '&inludashi=1' : '');
                // } else {
                    QW.Ajax.post(this, function(data){
                        data = QW.JSON.parse(data);
                        if (data['errno']==0) {
                            var order_id = data.result;

                            //如果是手机支付，不跳转
                            if(pay_method == 'mobile'){
                                var qrCodeSrc = BASE_ROOT + 'torder/qrcode/?order_id=' + order_id;
                                tcb.alert("手机支付宝",'<div style="padding:10px;"><h2 style="font-weight:bold; text-align:center">请用手机扫描下面的二维码进行支付</h2><div style="text-align:center"><img style="background:url(https://p.ssl.qhimg.com/t017ee3be501e423c98.gif) no-repeat center" width="220" height="220" src="'+qrCodeSrc+'"></div></div>', {
                                    width:300,
                                    height:350
                                }, function(){return true});

                                return; 
                            }
                            
                            //如果是微信支付，不跳转
                            if(pay_method == 'WXPAY_JS'){
                                var qrCodeSrc = BASE_ROOT + 'torder/qrcode/?order_id=' + order_id;
                                tcb.alert("微信支付",'<div style="padding:10px;"><h2 style="font-weight:bold; text-align:center">请用手机扫描下面的二维码进行支付</h2><div style="text-align:center"><img style="background:url(https://p.ssl.qhimg.com/t017ee3be501e423c98.gif) no-repeat center" width="220" height="220" src="'+qrCodeSrc+'&type=weixin"></div></div>', {
                                    width:300,
                                    height:350
                                }, function(){return true});

                                return; 
                            }

                            // 客户端在线支付
                            if (window._inclient && wMe.one('[name="pay_method"]').val()==1) {
                                window.open(document.payForm.action + '?order_id=' + order_id);

                                //弹开付款页面，打开未付款订单页
                                window.location.href = BASE_ROOT + 'torder/detail/?order_id=' + order_id + '&inclient=1#waitpay';

                                return;
                            }

                            document.payForm.order_id.value = order_id;
                            document.payForm.submit();
                        } else {
                            alert(data['errmsg']);
                        }
                    });
                // }
            }

        });
        
        /**
         * 设置商品价格
         * @param {[type]} price_arr   [平台售价]
         * @param {[type]} m_price_arr [门店价]
         */
        function setProductPrice(price_arr, m_price_arr){
            var max_price = parseFloat(Math.max.apply(null, price_arr)),
                min_price = parseFloat(Math.min.apply(null, price_arr)),
                m_max_price =  parseFloat(Math.max.apply(null, m_price_arr)),
                m_min_price =  parseFloat(Math.min.apply(null, m_price_arr));

            // 服务方式中附加的服务费
            var wCurService = W(".p-service .cur"),
                fee = 0;
            if (wCurService && wCurService.length) {
                fee = wCurService.query('em').html()*100;
            }

            W("#product_price_o").val(max_price);

            var price = '',
                m_price = '';
            // 单一价格
            if (max_price==min_price) {
                max_price = (max_price*100 + fee)/100 + '';
                m_max_price = (m_max_price*100 + fee)/100 + '';
                if(/^\d*\.\d$/.test(max_price)){
                    max_price   = max_price +"0";
                    m_max_price = m_max_price+"0";
                }else if(/^\d*$/.test(max_price)){
                    max_price   = max_price +".00";
                    m_max_price = m_max_price+".00";
                }
                price = max_price;
                m_price = m_max_price;
            }
            // 价格区间
            else {
                max_price = (max_price*100 + fee)/100 + '';
                min_price = (min_price*100 + fee)/100 + '';
                m_max_price = (m_max_price*100 + fee)/100 + '';
                m_min_price = (m_min_price*100 + fee)/100 + '';
                if(/^\d*\.\d$/.test(max_price)){
                    max_price   = max_price +"0";
                    min_price   = min_price +"0";
                    m_max_price = m_max_price+"0";
                    m_min_price = m_min_price+"0";
                }else if(/^\d*$/.test(max_price)){
                    max_price   = max_price +".00";
                    min_price   = min_price +".00";
                    m_max_price = m_max_price+".00";
                    m_min_price = m_min_price+".00";
                }
                price = min_price + '-' + max_price;
                m_price = m_min_price + '-' + m_max_price;
            }
            W("#product_price").html(price);
            W('.price-orig del').html('¥'+m_price);
        }

        /**
         * 设置商品属性的ui状态
         * @param {[type]} selectedAttr [description]
         */
        function setProductAttrUi(selectedAttr, AttrGroup, AttrList){
            var SelectableAttr = [],
                AttrGroup_itemstr = AttrGroup.map(function(item){return item.join('');});

            var selectedAttr2 = arrCombinedSequence(selectedAttr);
            AttrList.forEach(function(item, i){
                SelectableAttr[i] = [];

                item.forEach(function(item2, i2){
                    selectedAttr2.forEach(function(sitem){
                        var temp_arr = [];

                        temp_arr = temp_arr.concat(sitem.slice(0, i), item2, sitem.slice(i+1));

                        if (AttrGroup_itemstr.contains(temp_arr.join('')) && !SelectableAttr[i].contains(item2)) {
                            SelectableAttr[i].push(item2);
                        }
                    });
                });
            });

            var wPCate = W('.p-cate');
            wPCate.forEach(function(el, i){
                W(el).query('li').forEach(function(eli){
                    var wLi = W(eli),
                        attr_id = wLi.attr('attr-id');
                    // 设置那些不能被选择的属性
                    if (!SelectableAttr[i].contains(attr_id)) {
                        wLi.addClass('disabled-selected');
                    } else {
                        wLi.removeClass('disabled-selected');
                    }

                    if(attr_id === selectedAttr[i]){
                        wLi.addClass('cur');
                    }
                });
            });
        }
        /**
         * 将数组转换成组合序列
         * @param  {[type]} TwoDimArr [description]
         * @return {[type]}              [description]
         */
        function arrCombinedSequence(TwoDimArr){
            var ConvertedArr = [], // 转换后的二维数组
                cc = 1; // 转换后的二维数组的数组长度

            var TwoDimArr_safe = TwoDimArr.map(function(arr){
                return (arr instanceof Array) ? arr : [arr];
            });
            TwoDimArr_safe.forEach(function(arr){
                cc = cc*arr.length;
            });

            var kk = 1;
            TwoDimArr_safe.forEach(function(arr, i){
                var len = arr.length;
                cc = cc/len;
                if (i==0) {
                    arr.forEach(function(item){
                        for(var j=0; j<cc; j++){
                            ConvertedArr.push([item]);
                        }
                    });
                } else {
                    var pos = 0;
                    for(var k=0; k<kk; k++){
                        arr.forEach(function(item){
                            for(var j=0; j<cc; j++){
                                ConvertedArr[pos].push(item);
                                pos++;
                            }
                        });
                    }
                }
                kk = kk*len;
            });

            return ConvertedArr;
        }

        Dom.ready(function(){
            init_load();

            // 此条件在多属性选择情况下有效
            if(product_attr_info&&product_attr_info.length){
                var AttrGroup = product_attr_info.map(function(item){
                    return item['attr_info']['group'];
                });
                var AttrList = [];
                QW.ObjectH.map(product_attr_list, function(item){
                    AttrList.push(QW.ObjectH.keys(item['attr']));
                });

                window.AttrGroup = AttrGroup;
                window.AttrList = AttrList;

                var attr_index = recommend_attr ? parseInt(recommend_attr) : 0;
                attr_index = attr_index ? attr_index : 0;
                if (product_attr_info[attr_index]['attr_info']) {
                    var selectedAttr = product_attr_info[attr_index]['attr_info']['group'];

                    setProductAttrUi(selectedAttr, AttrGroup, AttrList);
                
                    PriceCache['price'] = [product_attr_info[attr_index]['price']];
                    PriceCache['m_price'] = [product_attr_info[attr_index]['m_price']];
                }
            }

        });
	}());

