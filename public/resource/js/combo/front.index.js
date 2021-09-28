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

;/**import from `/resource/js/page/front.index.js` **/
/**
 * 首页逻辑
 */
(function(){
    var __lngLat = {};

	var hoverHandler = null;
	//是否在二级子页面
	var IS_SUBAREA_PAGE = window.location.search.indexOf('target=blank') > -1 ? true : false;

    var cur_point = [0, 0]; // 当前的鼠标点
    var critical_point = [0, 0]; // 临界位置鼠标点
    var cc = 0; // 用于mousemove的计数器
    var t111; // 延时handler

	tcb.bindEvent(document.body, { 
		'.search-hot-word a':function(e){            
			e.preventDefault();            
			W(".search-hot-word").query('a').removeClass('curr');
			W(this).addClass('curr');
			W('.tcb-top-search input[name="stype"]').val(  W(this).attr('data-type') );
			W('.ac_wrap').hide();

            /*var typeid = W(this).attr('data-type')||0;
            var defKeyword = ['上门安装调试路由器', '系统安装', '笔记本除尘清灰', '手机刷机', '打印机维修', '服务器检测' ];
            var ckey = defKeyword[typeid];
            W('#360tcb_so').val(ckey).attr('data-default', ckey);*/
		},
		'.ba-info  a.ba-close':function(e){
			e.preventDefault();
			W('.ba-info').hide();
		},
		/****目前不要了---- '#feedback_show':function(e){
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

		},*/
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
			asynMerRepair(0,true);
			
		},
		//类型，按成交量，好评数切换
		'.repair-info .sort-type li a':function(e){
			e.preventDefault();
			W('.repair-info .sort-type li').removeClass('active');
			W(this).ancestorNode('li').addClass('active');
			//切换查询的函数
			asynMerRepair(0,true);
			
		},
		//在线，非在线切换
		'.repair-info .filter-check input':function(e){
			//切换查询的函数 在线状态
			asynMerRepair(0,true);
		},
		//商家好评类型切换
		'.positive-comments .tab-2 a':function(e){
			e.preventDefault();
			W('.positive-comments .tab-2 li').removeClass('active');
			W(this).ancestorNode('li').addClass('active');
			//切换查询的函数  商家好评
			asynMerComment(cur_citycode,W(this).attr('data-type'),0,true);
		},
		//点击城市
		'.dl-area-wrap .has-first a':function(e){
			e.preventDefault();

			var lists = W(".area-list .has-sub").query('.item-hd');
			lists.forEach(function(item,i){
				W(item).removeClass('curr');
			})

			W(this).addClass('curr');
			W("#detailTag").attr('data-curcode','')
				.html('')
			//切换查询的函数
			asynMerRepair(0,true);

		},
		//列表模式
		'a.btn-mode-list':function(e){
			e.preventDefault();
			// W(this).hide();
			// W("a.btn-mode-map").show();
			// W('#mode_list').show();
			// W('#mode_map').hide();
			asynMerRepair(0,true);
		},
		//地图模式
		'a.btn-mode-map':function(e){
			e.preventDefault();
			// W(this).hide();
			// W("a.btn-mode-list").show();
			// W('#mode_list').hide();
			// W('#mode_map').show();
			showMap(0, true,true);
		},
		//选择城市区县
		'.area-list-mini .item>a':function(e){
			/*e.preventDefault();

			W(this).parentNode('.area-list').query('.curr').removeClass('curr');
			W(this).addClass('curr');

			W('.sub-area-list .currsub').removeClass('currsub');
			//cleanAddrSearch();
			//切换查询的函数
			asynMerRepair(0,true);*/
		},
		//选择商圈后的结果
		'.sub-area-list a.shangquan':function(e){
			e.preventDefault();

			W(this).parentNode('.sub-area-list').query('.currsub').removeClass('currsub');
			W(this).addClass('currsub');

			cleanAddrSearch();
			//切换查询的函数
			asynMerRepair(0,true);
		},
		'.location-list .item-quxian':function(e){
			e.preventDefault();
			var target = e.target;
			W('.location-list .item-quxian').removeClass('curr');
			W(this).addClass('curr');
			
			W("#detailTag")
				.attr('data-curcode',W(this).attr('data-code'));

			W(this).parentNode('.location-list').hide();
			W(this).parentNode('.location-select').one('.now-location').html( W(this).one('span').html() );

			//切换查询的函数
			asynMerRepair(0,true);
		},
		'.location-select':{
			'mouseenter': function(e){
				W(this).one('.location-list').css('top', W(this).getSize().height - 2).show();
			},
			'mouseleave' : function(e){
				W(this).one('.location-list').hide();
			}
		},		
        // 分类列表的交互
        '.cate-wrap':{
            'mousemove': function(e){
                // 当前的鼠标位置
                cur_point = [e.pageX, e.pageY];

                var wMe = W(this);

                var target = e.target,
                    wTarget = W(target);
                var wTop = wTarget.parentNode('.cate-top');
                // 鼠标放在顶级分类上边
                if(wTop.length){
                    var wSub = wTop.nextSibling('.cate-sub'),
                        wLis = wTop.query('>li');

                    // var is_in = true;
                    var is_in = isInnerArea(critical_point, cur_point, wSub);
                    if (!is_in) {

                        // 目标元素为li元素本身
                        var wLi = target.nodeName.toLowerCase()==='li' 
                                ? wTarget
                                : wTarget.parentNode('li');

                        activeCateSelected(wLi, wLis, wSub, wTop, wMe);
                    }

                } else {
                    var wTitle = wTarget.hasClass('cate-title') ? wTarget : wTarget.parentNode('.cate-title');
                    // 鼠标放在分类标题上
                    if (wTitle.length) {
                        var wSpan = wTitle.query('span');
                        if(wSpan.length){
                            wSpan.removeClass('icon-arrow-down').addClass('icon-arrow-up');
                        }
                        wTop = wTitle.siblings('.cate-top');
                        wTop.show();
                    }
                }

            },
            'mouseover': function(e){
                // 移入元素的临界点
                critical_point = [e.pageX, e.pageY];
                var wMe = W(this);

                var target = e.target,
                    wTarget = W(target);
                var wTop = wTarget.parentNode('.cate-top');

                clearTimeout(t111);
                // 鼠标放在顶级分类上边
                if(wTop.length){
                    var wSub = wTop.nextSibling('.cate-sub'),
                        wLis = wTop.query('>li');

                    t111 = setTimeout(function(){

                        // 目标元素为li元素本身
                        var wLi = target.nodeName.toLowerCase()==='li' 
                                ? wTarget
                                : wTarget.parentNode('li');

                        activeCateSelected(wLi, wLis, wSub, wTop, wMe);
                    }, 300);

                }

            },
            'mouseleave': function(e){
                var wMe = W(this),
                	wSub = wMe.query('.cate-sub'),
                    wTop = wMe.query('.cate-top');

                clearTimeout(t111);

                wSub.animate({'width':'0px'}, 100, function(){
                    wSub.hide();
                	var wLis = wMe.query('.cate-top li');
	                wLis.removeClass('green');
                    // 在arae-page页面隐藏
                    if (wTop.hasClass('area-page-flag')) {
                        wTop.hide();
                        var wSpan = wMe.query('.cate-title span');
                        wSpan.length && wSpan.removeClass('icon-arrow-up').addClass('icon-arrow-down');
                    }
                });
            }
        },
        // 获取更多区县列表
        '.area-list-more':{
            'mouseenter': function(e){
                var wMe = W(this),
                    wUl = wMe.query('ul');
                if (!wUl.length) { return false;}

                wUl.show();
                wMe.query('.more-txt span').removeClass('icon-arrow-down').addClass('icon-arrow-up');
            },
            'mouseleave': function(e){
                var wMe = W(this),
                    wUl = wMe.query('ul');
                if (!wUl.length) { return false;}
                wUl.hide();
                wMe.query('.more-txt span').removeClass('icon-arrow-up').addClass('icon-arrow-down');
            }
        },
        // 大家都在问-换一换
        '.top-ask-change': function(e){
            var wMe = W(this),
                pos = parseInt(wMe.attr('pos'), 10);
            var oTopAsk = oTopAskList[pos],
                top_ask_list = '';
            if (QW.ObjectH.isObject(oTopAsk)) {
                oTopAsk.forEach(function(item, i){
                    if (item['url']) {
                        top_ask_list += '<a class="tip'+(i+1)+'" href="'+item['url']+'" target="_blank" style="color:'
                                     +  item['border']+';border:solid 1px '+item['border']+';background-color:'+item['bg']+';">'+item['name']+'</a>';

                    } else {
                        top_ask_list += '<a class="tip'+(i+1)+'" href="/search/?ie=utf-8&f=tcb&from=index_ask&keyword='
                                     +  encodeURIComponent(item['name'])+'" target="_blank" style="color:'
                                     +  item['border']+';border:solid 1px '+item['border']+';background-color:'+item['bg']+';">'+item['name']+'</a>';
                    }
                });
                var wList = wMe.siblings('.list');
                wList.html(top_ask_list);
                wList.query('a').forEach(function(el, i){
                    W(el).animate({'left': oTopAsk[i]['pos'][0], 'top': oTopAsk[i]['pos'][1]}, 1000, function(){}, QW.Easing.bounceOut);
                });
                pos++;
                if (pos===3) {
                    pos = 0;
                }
                wMe.attr('pos', pos);
            }
        },
        // 切换品牌维修店logo
        '.pinpai-logo-tab li': {
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.addClass('pinpai-logo-tab-cur').siblings('li').removeClass('pinpai-logo-tab-cur');
                W('.'+wMe.attr('target-block')).show().siblings('div').hide();
            }
        },
        //更多品牌
        '.logo-ctr-more' : function(e){
            e.preventDefault();
            if( W('.pinpai-logo-content1').css('display') !='none'){
                W('.pinpai-logo-content1-full').show();
            }else if( W('.pinpai-logo-content2').css('display') !='none'){
                W('.pinpai-logo-content2-full').show();
            }
        },
        //收起更多品牌
        '.logo-ctr-less' : function(e){
            e.preventDefault();

            W('.pinpai-logo-content1-full').hide();
            W('.pinpai-logo-content2-full').hide();
        }
	});
/**
 * 判断是否在区域之中
 * @param  {[type]}  critical_point 临界点
 * @param  {[type]}  cur_point      当前鼠标位置
 * @param  {[type]}  wSub           [description]
 * @return {Boolean}                [description]
 */
function isInnerArea(critical_point, cur_point, wSub){
    var flag = false;

    var rect = wSub.getRect(),
        sub_x = rect.left, // 子菜单框左顶点x
        sub_y = rect.top,  // 子菜单框左顶点y
        sub_h  = rect.height, // 子菜单框高度
        cr_x = critical_point[0], // 临界点x
        cr_y = critical_point[1], // 临界点y
        cu_x = cur_point[0], // 当前点x
        cu_y = cur_point[1]; // 当前点y

    var w = sub_x - cr_x; // 临界点到子菜单的距离

    // 鼠标在临界点的右边、或者重合 开始计算
    if (cr_x <= cu_x) {
        // 在临界点之上
        if (cr_y<cu_y) {
            if( !((cu_x-cr_x)/(cu_y-cr_y) < w/(sub_y+sub_h-cr_y)) ){
                flag = true;
            }
        }
        // 在临界点之下
        else if(cr_y>cu_y) {
            if ( !((cu_x-cr_x)/(cr_y-cu_y) < w/(cr_y-sub_y)) ) {
                flag = true;
            }
        }
        else {
            flag = true;
        }
    }

    return flag;
}
/**
 * 激活分类条的选择
 * @param  {[type]} wLi  [description]
 * @param  {[type]} wLis [description]
 * @param  {[type]} wSub [description]
 * @param  {[type]} wTop [description]
 * @param  {[type]} wMe  [description]
 * @return {[type]}      [description]
 */
function activeCateSelected(wLi, wLis, wSub, wTop, wMe){

    wLis.removeClass('green');
    wLi.addClass('green');
    
    var pos = 0; // 鼠标放置的cate位置
    wLis.forEach(function(el, i){
        // 获取鼠标放置的LI的位置
        if(el===W(wLi)[0]){
            pos = i;
        }
    });

    var wSubUl = wSub.query('>ul');
    wSubUl.hide();
    if (wSubUl.item(pos)) {
        wSubUl.item(pos).show();
        wSub.show();

        var top = 0, height = 0;
        var wLi_offset  = wLi.getRect(),
            wTop_offset = wTop.getRect(),
            wMe_offset  = wMe.getRect();
        var h1, h2, h3, h4;
        h1 = wLi_offset['top'] - wTop_offset['top'];
        h2 = wLi_offset['height']*2;
        if(h1>=h2){
            h3  = wLi_offset['top'] - wMe_offset['top'];
            top = h3 - h2 - 2;
        }

        var doc_scroll_top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        if (doc_scroll_top>34) {
            top = (doc_scroll_top - 34)>top ? (doc_scroll_top - 34) : top;
        }
        height = wMe_offset['height'] - top - 42;

        wSub.css({
            'width' : '420px',
            'height': height+'px',
            'top'   : top+'px'
        });
    }
}


    // 大家都在问-换一换的数据
    var oTopAskList = [
            [
                {
                    'name': '电脑没声音，检测维修',
                    'border': '#004305',
                    'bg': '#f9ffef',
                    'pos': ['0px', '0px']
                },
                {
                    'name': '系统安装',
                    'border': '#801e2a',
                    'bg': '#F9E3E5',
                    'pos': ['145px', '0']
                },                
                {
                    'name': '显示器花屏、暗屏、黑屏维修',
                    'border': '#8b4620',
                    'bg': '#FAE6DC',
                    'pos': ['220px', '0']
                },
                {
                    'name': '29.9元笔记本除尘清洁',
                    'border': '#536200',
                    'bg': '#F1F6D8',
                    'pos': ['400px', '0'],
                    'url': '/huodong/qinghui/?fromvisit=index'
                },
                {
                    'name': '电脑自动关机，无法开机',
                    'border': '#015e08',
                    'bg': '#EEFBE7',
                    'pos': ['0', '40px']
                },
                {
                    'name': '数据硬盘丢失，文件恢复',
                    'border': '#3b3b3b',
                    'bg': '#F1F1F1',
                    'pos': ['170px', '40px']
                },
                {
                    'name': 'usb无法识别',
                    'border': '#805603',
                    'bg': '#F7EEDC',
                    'pos': ['354px', '40px']
                },
                {
                    'name': '硬盘坏道修复',
                    'border': '#395f7a',
                    'bg': '#E1EDF6',
                    'pos': ['443px', '40px']
                }
            ],
            [
                {
                    'name': '手机密码忘了怎么解锁',
                    'border': '#19631f',
                    'bg': '#E7F2D5',
                    'pos': ['0', '0']
                },
                {
                    'name': '键盘失灵',
                    'border': '#801e2a',
                    'bg': '#F9E3E5',
                    'pos': ['140px', '0']
                },
                {
                    'name': '手机数据恢复',
                    'border': '#902e3a',
                    'bg': '#F9E3E5',
                    'pos': ['210px', '0']
                },            
                {
                    'name': '电脑温度高，除尘清灰',
                    'border': '#536200',
                    'bg': '#F1F6D8',
                    'pos': ['306px', '0']
                },
                {
                    'name': '运行很慢',
                    'border': '#8b4620',
                    'bg': '#FAE6DC',
                    'pos': ['450px', '0']
                },
                {
                    'name': '玩游戏卡',
                    'border': '#015e08',
                    'bg': '#EEFBE7',
                    'pos': ['0', '40px']
                },
                {
                    'name': '经常蓝屏',
                    'border': '#805603',
                    'bg': '#F7EEDC',
                    'pos': ['100px', '40px']
                },
                {
                    'name': '驱动安装',
                    'border': '#395f7a',
                    'bg': '#E1EDF6',
                    'pos': ['200px', '40px']
                },
                {
                    'name': '电脑系统故障远程维修',
                    'border': '#395c8a',
                    'bg': '#E1EDF6',
                    'pos': ['300px', '40px']
                }, 
                {
                    'name': '风扇噪音大',
                    'border': '#03623f',
                    'bg': '#E3FDF4',
                    'pos': ['450px', '40px']
                }
            ],
            [
                {
                    'name': '打印机无法打印',
                    'border': '#8b4620',
                    'bg': '#FAE6DC',
                    'pos': ['0', '0']
                },
                {
                    'name': '系统不好用',
                    'border': '#805603',
                    'bg': '#F7EEDC',
                    'pos': ['108px', '0']
                },
                {
                    'name': '显示花屏',
                    'border': '#19631f',
                    'bg': '#E7F2D5',
                    'pos': ['188px', '0']
                },
                {
                    'name': '死机重启',
                    'border': '#801e2a',
                    'bg': '#F9E3E5',
                    'pos': ['260px', '0']
                },
                {
                    'name': '硬盘文件误删',
                    'border': '#692faa',
                    'bg': '#E1EDF6',
                    'pos': ['340px', '0']
                },
                {
                    'name': '手机越狱',
                    'border': '#598f8a',
                    'bg': '#E1EDF6',
                    'pos': ['450px', '0']
                },                
                {
                    'name': '软件报错',
                    'border': '#536200',
                    'bg': '#F1F6D8',
                    'pos': ['0', '40px']
                },
                {
                    'name': '频繁死机',
                    'border': '#3b3b3b',
                    'bg': '#F1F1F1',
                    'pos': ['70px', '40px']
                },
                {
                    'name': '风扇清理',
                    'border': '#015e08',
                    'bg': '#EEFBE7',
                    'pos': ['140px', '40px']
                },
                {
                    'name': 'SD卡数据恢复',
                    'border': '#395f7a',
                    'bg': '#E1EDF6',
                    'pos': ['300px', '40px']
                }
                ,
                {
                    'name': '网页打不开',
                    'border': '#398f7a',
                    'bg': '#E1EDF6',
                    'pos': ['210px', '40px']
                }                                
                ,
                {
                    'name': '手机刷机root',
                    'border': '#493f9a',
                    'bg': '#E1EDF6',
                    'pos': ['420px', '40px']
                }
            ]
        ];

	var dataListCache = {};

	/**
	 * 获得商家进行过滤的参数
	 */
	function getMerSelectParam(){

		var area_id = W('.area-list .curr').attr('data-code') || 0;
		var quan_id = W('.sub-area-list .currsub').attr('data-code') || 0;

		return {
			'city_id':cur_citycode,
			'area_id':area_id,
			'quan_id':quan_id,
			'service_id':W(".area-wrap .tab-2 li.active a").attr('data-type'),
			'type_id':W(".repair-info .sort-type li.active a").attr('data-type'),
			'online':W(".repair-info #cb_1")[0].checked? 'on':'off',
            'cuxiao':W(".repair-info #cb_2")[0].checked? 'on':'off',
            'is_bzj':W(".repair-info #cb_3")[0].checked? '1':'0',
			'tag':tag,
			'pagesize':15,
            'lng' : __lngLat? __lngLat.lng : '',
            'lat' : __lngLat? __lngLat.lat : ''
		}

	}
	function modifyUrl(){
		var s_id = W(".area-wrap .tab-2 .active a").attr('data-type');

		W("#merRepairWrap .figure-h a").forEach(function(item){
			var _href = W(item).attr('href');
			if (s_id == undefined)
			{
				s_id = '';
			}
            if (_href.indexOf('/c/help')===-1) {
                W(item).attr('href',_href+"&service_id="+s_id);
            } else {
                W(item).attr('href',_href);
            }
		})
	}

	/**
	 * 商家维修信息
	 * @param  {[type]} pn   [description]
	 * @param  {[type]} flag [description]
	 * @return {[type]}      [description]
	 */
	function asynMerRepair(pn,flag,gdata){
		var	html = '',
			pageSize =15 ;
		var param = getMerSelectParam();
			param['pn'] = pn;
			
		//将推荐提示隐藏还原
		W("#recommendTips").hide();

		if(dataListCache[Object.encodeURIJson(param)]||gdata){
			var _data = dataListCache[Object.encodeURIJson(param)]||gdata;
            _data['shop_data'].forEach(function(el){
                if (el['shop_ico'].indexOf('pinpailogo')==-1) {
                    el['shop_ico'] = tcb.imgThumbUrl(el['shop_ico'], 140, 140);
                }
            });
			var func = W("#merRepairTplIndex").html().trim().tmpl();
			html = func(_data);
			W('#merRepairWrap').html(html);
			if(_data.recommend_dianpu){
				W("#recommendTips").show();
			}
			//优化内容，去店铺页url修改
			modifyUrl();
			duiqi();
			flag && merRepairPager(Math.ceil(_data.page_count/pageSize));

            //赋值给全局变量，给地图使用
            window.__currListData = _data;

            //区县页面右侧地图
            try{ W('#shopMiniMap').length>0 && _showMiniMap( ); }catch(ex){}
		}else{
			QW.Ajax.get('/at/shop?'+ Object.encodeURIJson(param),function(e){
				var ret = e.evalExp();
				if(parseInt(ret.errno)!==0){
					html =  '<li class="no-data-merrepair">抱歉，暂时没有找到符合您要求的店铺</li>';
				}else{
					if(ret.shop_data.length==0){
						html =  '<li class="no-data-merrepair">抱歉，暂时没有找到符合您要求的店铺</li>';
					}else{
                        ret['shop_data'].forEach(function(el){
                            if (el['shop_ico'].indexOf('pinpailogo')==-1) {
                                el['shop_ico'] = tcb.imgThumbUrl(el['shop_ico'], 140, 140);
                            }
                        });
						dataListCache[Object.encodeURIJson(param)] = ret;
						var func = W("#merRepairTplIndex").html().trim().tmpl();
						html = func(ret);
					}
				}
				if(ret.recommend_dianpu){
					W("#recommendTips").show();
				}

				W('#merRepairWrap').html(html);
				_showSearchTip();
				//优化内容，去店铺页url修改
				modifyUrl();
				duiqi();
				flag && merRepairPager(Math.ceil(ret.page_count/pageSize));

                //赋值给全局变量，给地图使用
                window.__currListData = ret;

                //区县页面右侧地图
                try{ W('#shopMiniMap').length>0 && _showMiniMap( ); }catch(ex){}
			});
		}
		
	}
	/**
	 * 异步获取商家好评信息
	 * @param  {[type]} addr [description]
	 * @param  {[type]} type [description]
	 * @param  {[type]} pn   [description]
	 * @return {[type]}      [description]
	 */
	function asynMerComment(cur_citycode,type,pn,flag){
		//不在显示评论
		if( true || IS_SUBAREA_PAGE ){
			return;
		}

		pn 	 = pn||0;
		type = type|| '';
		var html = '',
			pagesize = 4;
		var params = 'service_id='+type+'&city_id='+cur_citycode+'&pn='+pn+'&pagesize=4';
		
		if(dataListCache[params]){
			var _data = dataListCache[params];
			var func = W("#merCommentTpl").html().trim().tmpl();
			html = func(_data);
			W('#merCommentWrap').html(html);
			if(_data.total>3){
				W("#merCommentAndTop").show();
			}
			flag && merCommentPager(Math.ceil(_data.total/pagesize));
		}else{
			QW.Ajax.get('/at/comment?'+ params ,function(e){
				var ret = e.evalExp(),
					data = ret.result;
				if(parseInt(ret.errno)!==0){
					html =   '<li class="li-nodata ">抱歉，暂时没有找到符合您要求的好评</li>';
				}else{
					if(data.total==0){
						html =   '<li class="li-nodata">抱歉，暂时没有找到符合您要求的好评</li>';
					}else{
                        if (data['list'] && data['list'].length) {
                            data['list'].forEach(function(item){
                                item['order_id'] = item['order_id'].replace(/^(\d{9})\d+(\d{4})$/, '$1******$2');
                            });
                        }
						dataListCache[params] = data;
						var func = W("#merCommentTpl").html().trim().tmpl();
						html = func(data);
					}

				}
				if(data.total>3){
					W("#merCommentAndTop").show();
				}
				W('#merCommentWrap').html(html);
				flag && merCommentPager(Math.ceil(data.total/pagesize));
			});	
			
		}
		
		
		
	}

	function duiqi(){
        return ;
        //目前不用了。。如果长时间不用了，就删除。 20140410 by sv
		if(IS_SUBAREA_PAGE){//2级区县页面
            var wInfoBd = W('#js-repair-info .bd'),
                wRankBd = W('#js-shop-rank .bd');
            if (wInfoBd.length && wRankBd.length) {
                //reset
                wInfoBd.css({height:'auto'})
                wRankBd.css({height:'auto'})

                var _right_top = W('.subarea-map').getSize().height + parseInt( W('.subarea-map').css('margin-bottom') ),
                    _height = wInfoBd.getSize().height,
                    _height_right = _right_top + wRankBd.getSize().height ;

                if(_height>_height_right){
                    wRankBd.css({height:_height-18 - _right_top,overflow:'hidden'})
                }else{
                    wInfoBd.css({height:_height_right,overflow:'hidden'})
                }
            }
		}else{
			//reset
            var wInfoBd = W('#js-repair-info .bd'),
                wRankBd = W('#js-shop-rank .bd');
            if (wInfoBd.length && wRankBd.length) {
                wInfoBd.css({height:'auto'})
                wRankBd.css({height:'auto'})

                var _height =wInfoBd.getSize().height,
                    _height_right = wRankBd.getSize().height;

                if(_height>_height_right){
                    wRankBd.css({height:_height-18,overflow:'hidden'})
                }else{
                    wInfoBd.css({height:_height_right,overflow:'hidden'})
                }
            }
		}

	}
	/**
	 * 商家维修分页
	 * @return {[type]} [description]
	 */
	function merRepairPager(pagenum, id, callback){



		var id = id || 'merRepairPager';
		if(pagenum==1){
			W('#'+id+' .pages').hide().html('');
			duiqi();
			return;
		}

		W('#'+id+' .pages').show();
		duiqi();

		var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
	    var pager = new Pager(W('#'+id+' .pages'), pagenum, pn);

	    pager.on('pageChange', function(e) {
	    	callback = callback || asynMerRepair;
 			callback(e.pn,false,false);
 			if(id != "merRepairMapPager"){
 				window.scrollTo(0, W('.repair-info').getXY()[1]-102);
 			}
 			
	    });
	}
	/**
	 * 商家好评分页
	 * @return {[type]} [description]
	 */
	function merCommentPager(pagenum){
		if(pagenum==1){
			W('#merCommentPager .pages').html('');
			return;
		}
		var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
	    var pager = new Pager(W('#merCommentPager .pages'), pagenum, pn);

	    pager.on('pageChange', function(e) {
	    	var type =W(".positive-comments li.active a").attr('data-type');
 			asynMerComment(cur_citycode,type,e.pn,false);
 			window.scrollTo(0, W('.positive-comments').getXY()[1]);
	    });
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

	        W(selector).ancestorNodes('.subtit').firstChild('strong').html( city_name );

            var redirect_url = "http://" +location.host +"/at/?" + city,
                query_params = location.search.queryUrl();
            if (query_params['target']==='blank') {
                redirect_url += '&target=blank';
            }
	        location.href = redirect_url;
	    });
	}

	/**
	 * 对商圈结果进行排序
	 * @param  {[type]} result [description]
	 * @return {[type]}        [description]
	 */
	function sortResult(result) {
        var results = [];
        for(var id in result) {
            var name = result[id];
            results.push({id : parseInt(id, 10), name : name});
        }

        results.sort(function(o1, o2) {
            if(o1.id > o2.id) {
                return 1;
            } else if(o1.id < o2.id) {
                return -1;
            } else {
                return 0;
            }
        });

        return results;
    };


    function createBigMap(p_flag){
        //如果是分页，那么就不用再去创建了。
        if(p_flag){
            var panel = tcb.alert("地图模式", W("#mode_mapTpl").html(), {'width':688, btn_name: '关闭',wrapId:"panel-modeMapindex"}, function(){
                map = null;
                return true;
            });
        }
        //reset
        try{map.destroy()}catch(ex){}
        document.getElementById("mode_map_container").innerHTML = "";

        map = new AMap.Map("mode_map_container",{
            view: new AMap.View2D({//创建地图二维视口
               zoom:11,
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
        });

        return map;
    }
    /**
     * 显示大地图，仅在网站首页生效，一次显示300数据
     * @param  {[type]} pn     [description]
     * @param  {[type]} flag   [description]
     * @param  {[type]} p_flag [description]
     * @return {[type]}        [description]
     */
    function showMap(pn, flag,p_flag){

    	var map = createBigMap(p_flag);

		var param = getMerSelectParam();
		var pageSize = window.location.search.indexOf('target=blank')>-1? 15 : 300;  //首页300，二级页15
			param.pagesize = pageSize;
			param['pn'] = pn | 0;

		QW.Ajax.get('/at/shop?'+ Object.encodeURIJson(param),function(e){
			var ret = e.evalExp(),
				data = ret.shop_data;
			if(parseInt(ret.errno)!==0){
				return alert("获取数据异常，请重试")
			}else{
				data.forEach(function(item, i){
					if( !item.map_longitude || !item.map_latitude){ return false; }
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
						offset:new AMap.Pixel(70,-280),
						content:W('#indexMapInfoTpl').html().tmpl({
							shop_name: item.shop_name,
							addr: item.addr_detail,
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
					if(i == 0){
						//infoWindow.open(map, marker.getPosition());
						map.setCenter(new AMap.LngLat(item.map_longitude, item.map_latitude))
					}
				})
			}
			if(ret.recommend_dianpu){
				//W("#maprecommendTips").show();
				W("#merRepairMapPager").hide();
			}
			flag && merRepairPager(Math.ceil(ret.page_count/pageSize), 'merRepairMapPager', showMap);
		});
    }

    //根据搜索的结果显示地图数据
    function showMapByRs(data){
        var data = data || (window.__currListData && window.__currListData.shop_data );

        var map = createBigMap(true);

        data.forEach(function(item, i){
            //if (i) {return};
            var marker = new AMap.Marker({
                id:"mapMarker"+i,
                position:new AMap.LngLat(item.map_longitude, item.map_latitude), 
                icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
                offset:{x:-13,y:-36} 
            });
            map.addOverlays(marker);

            var infoWindow = new AMap.InfoWindow({
                isCustom: true,
                autoMove: true,
                offset:new AMap.Pixel(-100,-300),
                content:W('#indexMapInfoTpl').html().tmpl({
                    shop_name: item.shop_name,
                    addr: item.addr_detail,
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
            if(i == 0){
                //infoWindow.open(map, marker.getPosition());
                map.setCenter(new AMap.LngLat(item.map_longitude, item.map_latitude))
            }
        });
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

    function talkProAutoHeight(){
    	
    }

    //冻结搜索框完整版
    function fixedToSearchBox(){
        return false;

        /*=========================目前不要了 2014.07.18===========================*/

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

    //首页搜索结果提示
    function indexSearchTip(){

    	if(window.location.search.length > 1){
    		_showSearchTip();
		}
		
    }

    function _showSearchTip(){
		var tip = W('.index-search-tip');

		if( W('#merRepairWrap').one('li').attr('id') != "recommendTips" && W('#merRepairWrap .no-data-merrepair').length ==0){//第一个li不是提示信息，说明有数据
			tip.show();	
			tip.one('.stip-img').attr('src', tip.one('.stip-img').attr('src') ); //为了让gif重新闪烁，重置src
		}else{//无数据，隐藏
			tip.hide();
		}

		duiqi();
	}

	/**
	 * 城市切换后，显示提醒小人
	 * @return {[type]} [description]
	 */
	function cityChangedNotice(){
		if(window.location.href.indexOf('/at/') > -1 && document.referrer.indexOf( BASE_ROOT )>-1){
			W('.hd-area-info .citychange-notice').show();
			W('.hd-area-info .citychange-notice img').attr('src', W('.hd-area-info .citychange-notice img').attr('src'));
			setTimeout( function(){
				W('.hd-area-info .citychange-notice').hide();
			}, 4200);
		}
	}

	//右侧问卷
	function showWenJuan(){
	    var wjTip;

	    wjTip = W('<a href="http://www.diaochapai.com/survey744508" target="_blank" class="index-right-wenjuan"></a>').appendTo( W('body') );
	        
	    _autoTipPos();

	    function _autoTipPos(){
	        
	        W(window).on('load', _autoPos);
	        W(window).on('resize', _autoPos);

	        _autoPos();
	    }  

	    function _autoPos(){
	        wjTip.css('left', (Dom.getDocRect().width - W('.doc-bd').getRect().width)/2 + W('.doc-bd').getRect().width + 9);
	    }  
	}

    /**
     * 入口
     * @return {[type]} [description]
     */
    function init(){

    	//点击其他地方，商圈消失
		W(document).click(function(e) {
			var target = e.target;
			if(W(target)&&W(target).hasClass('item-hd')){
				return;
			}
			W('.area-list li').removeClass('hover');
		})

		//选择城市，刷新页面
		selectCity('.citypanel_trigger');

		IS_SUBAREA_PAGE ? asynMerRepair(0,true) : asynMerRepair(0,true,merdata);
		asynMerComment(cur_citycode,'','',true);
		feedbackCountNumber();
		fixedToSearchBox();
		indexSearchTip();
		talkProAutoHeight();
		//cityChangedNotice();
		//不要了///showWenJuan();
    }

    init();

    /**
     * 大家都在问的小块块的移动动画
     * @return {[type]}
     */
    function askTipsAnimate(){
        var pos_arr = [];
        oTopAskList[0].forEach(function(item, i){
            pos_arr.push(item['pos']);
        });
        // var pos_arr = [
        //     ['15px', '3px'],
        //     ['196px', '-2px'],
        //     ['345px', '5px'],
        //     ['445px', '-7px'],
        //     ['600px', '-2px'],
        //     ['30px', '39px'],
        //     ['140px', '40px'],
        //     ['314px', '45px'],
        //     ['465px', '33px'],
        //     ['540px', '41px']
        // ];
        var wTips = W('.top-ask .list a');
        wTips.forEach(function(el, i){
            var wMe = W(el);
            wMe.animate({'left': pos_arr[i][0], 'top': pos_arr[i][1]}, 1000, function(){}, QW.Easing.bounceOut);
        });

    }
    /**
     * 添加顶部子分类
     */
    function addSubCate(){
        var subData = [
            // 组装机、一体机、品牌机
            [
                {
                    'title':'主机', 
                    'data' :[[
                                {'title':'频繁死机','url':'','classes': ''},
                                {'title':'自动重启','url':'','classes': ''},
                                {'title':'开机报警','url':'','classes': ''},
                                {'title':'经常蓝屏','url':'','classes': ''},
                                {'title':'温度高噪音大','url':'','classes': 'gr-font'}
                            ], 
                            [
                                {'title':'接口不能用','url':'','classes': ''},
                                {'title':'电脑自动关机','url':'','classes': ''},
                                {'title':'键盘失灵','url':'','classes': ''},
                                {'title':'USB无法识别','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'显示器', 
                    'data' :[[
                                {'title':'显示花屏','url':'','classes': 'gr-font'},
                                {'title':'显示器自动黑屏','url':'','classes': ''},
                                {'title':'显示蓝屏','url':'','classes': 'gr-font'},
                                {'title':'开机不亮','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'系统', 
                    'data' :[[
                                {'title':'运行慢','url':'','classes': 'gr-font'},
                                {'title':'网页打不开','url':'','classes': ''},
                                {'title':'不能上网','url':'','classes': ''},
                                {'title':'系统报错','url':'','classes': ''},
                                {'title':'系统安装 ','url':'','classes': ''}//,
                                // {'title':'驱动安装 ','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'软件', 
                    'data' :[[
                                {'title':'玩游戏卡','url':'','classes': ''},
                                {'title':'软件安装','url':'','classes': ''},
                                {'title':'软件无法下载','url':'','classes': ''},
                                {'title':'软件报错','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'清洁保养', 
                    'data' :[[
                                {'title':'笔记本保养','url':'','classes': ''},
                                {'title':'台式机保养','url':'','classes': ''},
                                {'title':'电脑温度高','url':'','classes': ''},
                                {'title':'风扇噪音大','url':'','classes': ''}
                            ],[
                                {'title':'风扇清理','url':'','classes': ''},
                                {'title':'上散热硅脂','url':'','classes': ''},
                                {'title':'电脑散热保养','url':'','classes': ''},
                                {'title':'笔记本除尘清洁','url':'','classes': 'gr-font'}
                            ]]
                },
                {
                    'title':'其他', 
                    'data' :[[
                                {'title':'电脑没声音','url':'','classes': ''},
                                {'title':'不能打字','url':'','classes': ''},
                                {'title':'一体机维修','url':'','classes': ''},
                                // {'title':'u盘无法格式化','url':'','classes': ''},
                                {'title':'文件丢失','url':'','classes': ''}
                            ]]
                }
            ],
            // 笔记本电脑、上网本
            /*[
                {
                    'title':'主机', 
                    'data' :[[
                                {'title':'频繁死机','url':'','classes': ''},
                                {'title':'开机不亮','url':'','classes': ''},
                                {'title':'自动重启','url':'','classes': ''},
                                {'title':'开机报警','url':'','classes': ''},
                                {'title':'经常蓝屏','url':'','classes': ''}
                            ], 
                            [
                                {'title':'温度高噪音大','url':'','classes': ''},
                                {'title':'接口不能用','url':'','classes': ''},
                                {'title':'键盘失灵','url':'','classes': ''},
                                {'title':'usb无法识别','url':'','classes': 'gr-font'}
                            ]]
                },
                {
                    'title':'显示屏', 
                    'data' :[[
                                {'title':'显示花屏','url':'','classes': ''},
                                {'title':'显示器自动黑屏','url':'','classes': ''},
                                {'title':'显示蓝屏','url':'','classes': 'gr-font'}
                            ]]
                },
                {
                    'title':'系统', 
                    'data' :[[
                                {'title':'文件丢失','url':'','classes': ''},
                                {'title':'网页打不开','url':'','classes': ''},
                                {'title':'运行很慢','url':'','classes': ''},
                                {'title':'不能上网','url':'','classes': ''},
                                {'title':'软件报错','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'其他', 
                    'data' :[[
                                {'title':'没有声音','url':'','classes': ''},
                                {'title':'不能打字','url':'','classes': ''},
                                {'title':'上门安装调试路由器','url':'/huodong/luyouqi/?fromvisit=cate','classes': 'gr-font'}
                            ]]
                }
            ],*/
            // 手机、平板电脑、pad
            [
                {
                    'title':'设备', 
                    'data' :[[
                                {'title':'无法开机','url':'','classes': ''},
                                {'title':'手机解锁','url':'','classes': ''},
                                {'title':'手机进水','url':'','classes': ''},
                                {'title':'wifi不能用','url':'','classes': ''},
                                {'title':'没声音','url':'','classes': ''}
                            ], 
                            [
                                {'title':'屏幕碎了','url':'','classes': ''},
                                {'title':'死机重启','url':'','classes': ''},
                                {'title':'平板电脑维修','url':'','classes': ''},
                                {'title':'pad维修','url':'','classes': 'gr-font'}
                            ]]
                },
                {
                    'title':'系统', 
                    'data' :[[
                                {'title':'手机越狱','url':'','classes': 'gr-font'},
                                {'title':'刷机root','url':'','classes': ''},
                                {'title':'系统不好用','url':'','classes': ''},                                
                                {'title':'软件安装','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'其他',
                    'data' :[[
                                {'title':'手机数据丢失','url':'','classes': ''}
                            ]]
                }
            ],
            // 系统安装、软件异常
            /*[
                {
                    'title':'系统', 
                    'data' :[[
                                {'title':'系统安装','url':'','classes': ''},
                                {'title':'系统报错','url':'','classes': ''},
                                {'title':'驱动安装','url':'','classes': ''},
                                {'title':'玩游戏卡','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'软件', 
                    'data' :[[
                                {'title':'软件安装','url':'','classes': ''},
                                {'title':'软件无法下载','url':'','classes': ''},
                                {'title':'软件报错','url':'','classes': ''}
                            ]]
                // },
                // {
                //     'title':'路由器',
                //     'data':[[
                //                 {'title':'上门安装调试', 'url':'','classes': 'gr-font'}
                //            ]]
                }
            ],*/
            // 数据丢失、文件误删
            /*[
                {
                    'title':'主机数据', 
                    'data' :[[
                                {'title':'硬盘修复工具','url':'','classes': ''},
                                {'title':'硬盘坏道修复','url':'','classes': 'gr-font'},
                                {'title':'硬盘数据丢失','url':'','classes': ''},
                                {'title':'回收站数据恢复','url':'','classes': ''}
                            ], 
                            [
                                {'title':'硬盘文件误删','url':'','classes': 'gr-font'}
                            ]]
                },
                {
                    'title':'外设数据', 
                    'data' :[[
                                {'title':'U盘数据恢复','url':'','classes': ''},
                                {'title':'手机平板数据丢失','url':'','classes': ''},
                                {'title':'SD卡数据恢复','url':'','classes': 'gr-font'},
                                {'title':'数据库恢复','url':'','classes': ''}
                            ]]
                }
            ],*/
            // 打印机、投影仪、扫描仪
            [
                {
                    'title':'数据丢失', 
                    'data' :[[
                                {'title':'误删除','url':'','classes': 'gr-font'},
                                {'title':'硬盘修复工具','url':'','classes': ''},
                                {'title':'硬盘坏道修复','url':'','classes': ''},
                                {'title':'硬盘数据丢失','url':'','classes': ''},
                                {'title':'U盘数据恢复','url':'','classes': ''}
                            ], 
                            [
                                {'title':'回收站数据恢复','url':'','classes': ''},
                                {'title':'手机平板数据丢失','url':'','classes': ''},
                                {'title':'SD卡数据恢复','url':'','classes': 'gr-font'},
                                {'title':'数据库恢复','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'办公外设', 
                    'data' :[[
                                {'title':'打印机维修','url':'','classes': 'gr-font'},
                                {'title':'不能打印','url':'','classes': ''},
                                {'title':'惠普打印机','url':'','classes': ''},
                                {'title':'佳能打印机','url':'','classes': ''},
                                {'title':'卡纸','url':'','classes': ''}
                            ], 
                            [
                                {'title':'打印机不能共享','url':'','classes': ''},
                                {'title':'打印机无法打印','url':'','classes': ''},
                                {'title':'检测不到打印机','url':'','classes': ''}
                            ], 
                            [
                                {'title':'打印机复印机加粉','url':'','classes': ''},
                                {'title':'投影仪维修','url':'','classes': ''},
                                {'title':'扫描仪维修','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'服务器检修', 
                    'data' :[[
                                {'title':'服务器维护','url':'','classes': ''},
                                {'title':'服务器数据异常','url':'','classes': ''},
                                {'title':'服务器不能工作','url':'','classes': ''},
                                {'title':'服务器检测','url':'','classes': 'gr-font'}
                            ]]
                },
                {
                    'title':'其他', 
                    'data' :[[
                                {'title':'路由器调试','url':'','classes': ''},
                                {'title':'键盘失灵','url':'','classes': ''}
                            ]]
                }
            ]/*,
            // 电脑温度高、除尘清洁
            [
                {
                    'title':'电脑清洁', 
                    'data' :[[
                                {'title':'笔记本保养','url':'','classes': ''},
                                {'title':'台式机保养','url':'','classes': ''},
                                {'title':'电脑温度高','url':'','classes': ''},
                                {'title':'风扇噪音大','url':'','classes': ''}
                            ],
                            [
                                {'title':'29.9元笔记本除尘清洁','url':'','classes': 'gr-font'},
                            ]]
                },
                {
                    'title':'设备保养', 
                    'data' :[[
                                {'title':'风扇清理','url':'','classes': ''},
                                {'title':'上散热硅脂','url':'','classes': ''},
                                {'title':'电脑散热保养','url':'','classes': ''}
                            ]]
                }
            ],
            // 服务器检修
            [
                {
                    'title':'服务器', 
                    'data' :[[
                                {'title':'服务器维护','url':'','classes': ''},
                                {'title':'服务器数据异常','url':'','classes': ''},
                                {'title':'服务器不能工作','url':'','classes': ''},
                                {'title':'服务器检测','url':'','classes': 'gr-font'}
                            ]]
                }
            ]*/

        ];
        var wSub = W('.cate-sub'),
            li_str = [];
        // 遍历问题分类的详细信息
        subData.forEach(function(data){
            li_str.push('<ul style="display:none;">');
            data.forEach(function(o){
                li_str.push('<li class="clearfix"><h3>',o.title,'</h3><div class="cate-sub-cnt">');
                o.data.forEach(function(list){
                    // li_str.push('<p>');
                    list.forEach(function(item){
                    	if (item['url']) {
                    		li_str.push('<a bk="cate-sub" target="_blank" href="',item['url'],'"',(item['classes']?' class="'+item['classes']+'"':''),'>',item['title'],'</a><wbr>');
                    	} else {
                    		li_str.push('<a bk="cate-sub" target="_blank" href="/search/?ie=utf-8&f=tcb&from=index_cate&keyword=',encodeURIComponent(item['title']),'"',(item['classes']?' class="'+item['classes']+'"':''),'>',item['title'],'</a><wbr>');
                    	}
                    });
                    // li_str.push('</p>');
                });
                li_str.push('</div></li>');
            });
            li_str.push('</ul>');
        });
        li_str = li_str.join('');
        wSub.html(li_str);
    }
    /**
     * 初始化轮播广告
     * @return {[type]} [description]
     */
    function initSlider(){
        var wSlideWrap = W('.slide-wrap'),
            wA = wSlideWrap.query('.slide-main a');
        var liHtml = '';
        wA.forEach(function(el, i){ liHtml += '<li class="pngfix '+(i==0? 'cur' : '')+'">'+i+'</li>'; });
        W('.slide-nav').html(liHtml);
        var wLis = wSlideWrap.query('.slide-nav li');
        wSlideWrap
            .on('mouseover', function(e){
                var target = e.target;
                if (target.nodeName.toLowerCase()==='li') {
                    var wTarget = W(target),
                        pos = 0;
                    // 鼠标停留在非当前幻灯的nav上，那么需要切换到相应的幻灯~
                    if(!wTarget.hasClass('cur')){
                        wLis.removeClass('cur');
                        wLis.forEach(function(el, i, wL){
                            if (el===target) {
                                pos = i;
                                wL.item(i).addClass('cur');
                            }
                        });
                        wA.hide();
                        wA.item(pos) && wA.item(pos).show();
                    }
                }
                clearTimeout(h1);
                clearTimeout(h2);
            })
            .on('mouseout', function(){
                autoSlide();
            });
        var h1, h2,
            t1 = 8000,
            t2 = 5000;
        /**
         * 自动切换
         * @return {[type]} [description]
         */
        function autoSlide(){
            h1 = setTimeout(function(){
                var wCur = wLis.filter('.cur'),
                    pos = 0;

                wLis.forEach(function(el, i){
                    if (el===W(wCur)[0]) {
                        pos = i;
                    }
                });
                wLis.removeClass('cur');
                pos++;
                if (pos>=wLis.length) {
                    pos = 0;
                }
                wLis.item(pos) && wLis.item(pos).addClass('cur');
                wA.hide();
                wA.item(pos) && wA.item(pos).show();
                if (h1) {
                    var arg = arguments,
                        t = pos===0 ? t1 : t2; // cur在第一个位置的时候用t1作为延时，否则用t2
                    h2 = setTimeout(function(){
                        arg.callee();
                    }, t);
                }
            }, t1);            
        }
        autoSlide();
    }

    function showRightMap(){
    	var wel = W('#shopMiniMap');
    	if( wel.length == 0 ){ return }

    	W('#viewBigMap').on('click', function(e){
    		e.preventDefault();
            var isSecondPage = window.location.search.indexOf('target=blank')>-1;            
    		showMapByRs(  );
            if(isSecondPage){ W('#merRepairMapPager').css({'height':0, 'visibility':'hidden'}); } //在二级页面隐藏翻页。
    	});

    	//这里不调用地图显示，显示策略在列表数据回调中触发
        //_showMiniMap();

    }

    var rightMap;
    function _showMiniMap( data ){
        var data = data || (window.__currListData && window.__currListData.shop_data );
		//初始化地图
		var el = W('#shopMiniMap');
		//reset
        try{ rightMap.destroy()}catch(ex){}
		W("#shopMiniMap").html('');

		rightMap = new AMap.Map("#shopMiniMap",{
            view: new AMap.View2D({//创建地图二维视口
               zoom:11,
               rotation:0
            })
        }); 

		data.forEach(function(item, i){
            //if (i) {return};
            var marker = new AMap.Marker({
                id:"mapMarker"+i,
                position:new AMap.LngLat(item.map_longitude, item.map_latitude), 
                icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
                offset:{x:-13,y:-36} 
            });
            rightMap.addOverlays(marker);

            if(i == 0){
                //infoWindow.open(map, marker.getPosition());
                rightMap.setCenter(new AMap.LngLat(item.map_longitude, item.map_latitude))
            }
        });

	}

    /**
     * 初始化查看更多地区
     * @return {[type]} [description]
     */
    function initMoreArea(){
        var wMore = W('.area-list-more'),
            wUl = wMore.query('ul');
        if (!wUl.length) { return false;}
        if (!wUl.query('li').length) {
            var wItem = wMore.siblings('.area-list').query('li'),
                wFirstItem = wItem.first();
            if (!wFirstItem) {return false;}
            wItem.forEach(function(el, i){
                var wCur = W(el);
                if ((wCur.xy()[1] - wFirstItem.xy()[1])>10) {
                    wCur.appendTo(wUl);
                }
            });
            // 没有任何区域添加到wUl中，那么就将wUl移除掉
            if (!wUl.query('li').length) {
                wUl.removeNode();
                wMore.css('visibility', 'hidden');
            }
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
            asynMerRepair(0,true);
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

    /**
     * 下方的slide
     * @return {[type]} [description]
     */
    function topBotSlider(){
        var box = W('.top-slide-bot');
        if(!box.length){ return ;}

        var itemNum = box.query('.s-b-list li').length,
            itemWid = box.query('.s-b-list li').item(0).getRect().width,
            boxWid = 3*itemWid,
            innerBox = box.one('.slide-bot-inner'),
            iList = box.one('.s-b-list');

        iList.css('width',  itemNum*itemWid );
        //innerBox.css('width',  boxWid-1 );

        box.delegate('.s-btn-prev', 'click', function(e){
            e.preventDefault();
            var sleft = innerBox[0].scrollLeft;
            innerBox.animate({scrollLeft :  sleft- boxWid }, 500, function(){}, QW.Easing.easeBoth);
        });

        box.delegate('.s-btn-next', 'click', function(e){
            e.preventDefault();
            var sleft = innerBox[0].scrollLeft;
            innerBox.animate({scrollLeft : sleft + boxWid }, 500, function(){}, QW.Easing.easeBoth);
        });
    }

    Dom.ready(function(){
        // 执行大家都在问的动画
        setTimeout( function(){ W('.top-ask-change').fire('click') }, 10);
        // 添加顶部子分类
        addSubCate();
        // 初始化轮播广告
        initSlider();
        topBotSlider();

        //区县页面右侧地图
        showRightMap();

        // 初始化查看更多区县功能
        initMoreArea();        

        //位置搜索过滤
        initAddrSearch('#addrSearchForm .addr-ipt'); 
    });
})();

function showShopGrade( grade ){
    var icon = Math.min(Math.ceil(grade/5), 4);
    var icon_num = (grade-1)%5 + 1;
    var str = '';
    for(var i=0; i<icon_num; i++){
        str +='<span class="icon icon-dj icon-dj-'+icon+'"></span>';
    }
    return str;
}


;/**import from `/resource/js/include/yuyue.js` **/
tcb.Yuyue = (function(){
    var subscribe_obj = null; // 预约维修面板对象；

    tcb.bindEvent(document.body, { 

        // 激活区县的选择
        '#SubscribeWrap .select-area': function(e){
            e.preventDefault();
            var wMe = W(this);
            wMe.siblings('.area-select-pannel').fadeIn();
        },
        // 区县选择面板的相关点击操作
        '#SubscribeWrap .area-select-pannel': function(e){
            e.preventDefault();
            var wMe = W(this),
                target = e.target,
                wTarget = W(target);
            // 关闭区县选择列表
            if (wTarget.hasClass('close')) {
                wMe.hide();
            }
            // 选择区县
            if (wTarget[0].nodeName.toLowerCase()==='a') {
                var area_name = wTarget.html();
                W('#SubscribeWrap .select-area b').html(area_name);
                W('#SubscribeWrap [name="addr_area"]').val(area_name);
                wMe.hide();
                wMe.parentNode('div').siblings('.errmsg').css({'visibility':'hidden'});
            }
        },
        // 提交维修预约单
        '#SubscribeWrap .btnsubmit': {
            // 'click': function(e){
            //     e.preventDefault();
            // },
            'click': function(e){
                e.preventDefault();                
                var oSubscribeWrap = W('#SubscribeWrap'),
                    oCityCode = oSubscribeWrap.query('[name="sub_city_code"]'),  // 城市id
                    oAddrCity = oSubscribeWrap.query('[name="addr_city"]'),      // 城市
                    oAddrArea = oSubscribeWrap.query('[name="addr_area"]'),      // 区县
                    oAddrDetail = oSubscribeWrap.query('[name="addr_detail"]'),  // 详细地址
                    oDetail = oSubscribeWrap.query('[name="detail"]'),  // 问题描述
                    oDate = oSubscribeWrap.query('[name="date"]'),      // 期望服务日期
                    oType = oSubscribeWrap.query('[name="type"]'),      // 服务方式
                    //oPrice = oSubscribeWrap.query('[name="price"]'),    // 期望服务价格
                    oMobile = oSubscribeWrap.query('[name="mobile"]'),  // 手机
                    wCaptcha = oSubscribeWrap.query('[name="mobile_captcha"]'),  // 手机验证码
                    oAutoSms = oSubscribeWrap.query('[name="auto_sms"]'), // 自动发送到商家
                    error_flag = false,
                    date = oDate.val(),
                    type = oType.filter(':checked').val(),
                    price, addr_city, addr_area, addr_detail, detail, mobile,
                    wErrmsg_temp;

                wErrmsg_temp = oAddrCity.parentNode('div').siblings('.errmsg')
                if(!(addr_city = oAddrCity.val())){
                    wErrmsg_temp.html('请选择您的方位');
                    wErrmsg_temp.css({'visibility':'visible'});
                    error_flag = true;
                } else {
                    wErrmsg_temp.css({'visibility':'hidden'});
                    error_flag = false;
                }
                wErrmsg_temp = oAddrArea.parentNode('div').siblings('.errmsg');
                // 没有选择区县
                // if((addr_area=oAddrArea.val())==='选择区县'){
                if(!(addr_area=oAddrArea.val())){
                    if(!error_flag && oAddrArea.siblings('.sel-quxian').isVisible()){
                        wErrmsg_temp.html('请选择您的方位');
                        wErrmsg_temp.css({'visibility':'visible'});
                        error_flag = true;
                    }
                } else {
                    if(!error_flag){
                        wErrmsg_temp.css({'visibility':'hidden'});
                    }
                }
                // 没有选择商圈
                if(!(addr_detail=oAddrDetail.val())){
                    if(!error_flag && oAddrArea.siblings('.sel-shangquan').isVisible()){
                        wErrmsg_temp.html('请选择您的方位');
                        wErrmsg_temp.css({'visibility':'visible'});
                        error_flag = true;
                    }
                } else {
                    if(!error_flag){
                        wErrmsg_temp.css({'visibility':'hidden'});
                    }
                }
                /*if(!(addr_detail = oAddrDetail.val())){
                    if(!error_flag){
                        oAddrDetail.siblings('.errmsg').show().html('请填写您的方位信息');
                        error_flag = true;
                    }
                    oAddrDetail.focus();
                } else {
                    if(getLength(addr_detail)>22){
                        if(!error_flag){
                            oAddrDetail.siblings('.errmsg').show().html('详细地址要小于22个字符');
                            error_flag = true;
                        }
                        oAddrDetail.focus();
                    }
                    if(!error_flag){
                        oAddrDetail.siblings('.errmsg').hide().html('');
                    }
                }*/
                wErrmsg_temp = oDetail.siblings('.errmsg');
                detail = oDetail.val();
                if(!detail||detail==='请简要描述您的问题，如“我的电脑使用过程中频繁死机”'){
                    wErrmsg_temp.html('请填写您遇到的问题');
                    wErrmsg_temp.css({'visibility':'visible'});
                    if(!error_flag){
                        oDetail.val('');
                        oDetail.focus();
                    }
                    error_flag = true;
                } else {
                    if(getLength(detail)>150){
                        wErrmsg_temp.html('问题描述要小于150个字符');
                        wErrmsg_temp.css({'visibility':'visible'});
                        if(!error_flag){
                            oDetail.focus();
                        }
                        error_flag = true;
                    } else {
                        wErrmsg_temp.css({'visibility':'hidden'});
                    }
                }
                // 期望时间
                /*wErrmsg_temp = oDate.siblings('.errmsg');
                date = oDate.val();
                if (!date) {
                    wErrmsg_temp.html('请选择预约时间');
                    wErrmsg_temp.css({'visibility':'visible'});
                    error_flag = true;
                } else {
                    wErrmsg_temp.css({'visibility':'hidden'});
                }*/
                // 期望价格
                /*wErrmsg_temp = oPrice.siblings('.errmsg');
                price = oPrice.val();
                if (!price) {
                    wErrmsg_temp.html('请选择期望价格');
                    wErrmsg_temp.css({'visibility':'visible'});
                    error_flag = true;
                } else {
                    wErrmsg_temp.css({'visibility':'hidden'});
                }*/
                // 手机
                wErrmsg_temp = oMobile.siblings('.errmsg');
                mobile = oMobile.val();
                if (!mobile||mobile==='请正确填写您的号码') {
                    wErrmsg_temp.html('请填写您的号码');
                    wErrmsg_temp.css({'visibility':'visible'});
                    if(!error_flag){
                        oMobile.val('');
                        oMobile.focus();
                    }
                    error_flag = true;
                }
                else if(!tcb.validMobile(mobile)){
                    wErrmsg_temp.html('您输入的号码有误，请重新输入');
                    wErrmsg_temp.css({'visibility':'visible'});
                    if(!error_flag){
                        oMobile.focus();
                        oMobile[0].select();
                    }
                    error_flag = true;
                } else {
                    wErrmsg_temp.css({'visibility':'hidden'});
                }
                // 手机验证码(// 暂时忽略异步的回调)
                validCaptcha(wCaptcha, function(flag){
                    if (!error_flag) {
                        if (!flag) {
                            wCaptcha.focus();
                            wCaptcha[0].select();
                            error_flag = true;
                        }
                    }
                    if(error_flag){
                        return false;
                    }

                    var userAddress = addr_city+addr_area+addr_detail;
                    //逆地理编码查询回调
                    getLocationRange(userAddress, function(poi){
                        var auto_sms = oAutoSms.attr('checked') ? oAutoSms.val() : 0;

                        var request_url = '/yuyue/sub/',
                            postData = {
                                'sub_city_code': oCityCode.val()||'7',
                                'city': addr_city||"",
                                'area': addr_area||"",
                                'addr_detail': addr_detail||"",
                                'weixiu_desc': detail,
                                'qiwan_weixiu_date': date||"",
                                'server_method': type||"",
                                'qiwan_amount': price||"",
                                'mobile': mobile,
                                'secode': wCaptcha.val(),
                                'user_poi' : poi||'',
                                'auto_sms': auto_sms
                            };
                        QW.Ajax.post(request_url, postData, function(responseText){
                            try{
                                var response = QW.JSON.parse(responseText);
                                if(response['errno']){
                                    alert(response['errmsg']);
                                } else {
                                    W('#SubscribeWrap .mod-sucess-cont').show();
                                    if (auto_sms) {
                                        W('#SubscribeWrap .mod-sucess-cont').query('.auto_sms').show();
                                    } else {
                                        W('#SubscribeWrap .mod-sucess-cont').query('.not_auto_sms').show();
                                    }
                                    
                                    W('#SubscribeWrap .mod-sucess-cont').siblings('.mod-form-area').hide();
                                }
                            } catch (e){}
                        });
                    });
                    
                });
            }
        },
        // 故障描述框相关事件
        '#SubscribeWrap [name="detail"]': {
            'focus': function(e){
                var wMe = W(this),
                    detail = wMe.val();
                if (wMe.hasClass('color1')&&detail==='请简要描述您的问题，如“我的电脑使用过程中频繁死机”') {
                    wMe.val('');
                }
                wMe.removeClass('color1');
            },
            'blur': function(e){
                var oDetail = W(this),
                    detail = '',
                    wErrmsg = oDetail.siblings('.errmsg');

                if(!(detail = oDetail.val())){
                    oDetail.val('请简要描述您的问题，如“我的电脑使用过程中频繁死机”');
                    oDetail.addClass('color1');
                    wErrmsg.html('请填写您遇到的问题').css({'visibility':'visible'});
                } else {
                    if(getLength(detail)>150){
                        wErrmsg.html('故障描述要小于150个字符');
                        wErrmsg.css({'visibility':'visible'});
                    } else {
                        wErrmsg.css({'visibility':'hidden'});
                    }
                }
            }
        },
        // 验证手机号
        '#SubscribeWrap [name="mobile"]': {
            'focus': function(){
                var oMobile = W(this),
                    mobile = oMobile.val();
                if (oMobile.hasClass('color1')&&mobile==='请正确填写您的号码') {
                    oMobile.val('');
                }
                oMobile.removeClass('color1');
                oMobile.siblings('.errmsg').addClass('normalmsg').css('visibility', 'visible').html('验证码将以短信的形式发送到您的手机');
            },
            'blur': function(e){
                var oMobile = W(this);
                oMobile.siblings('.errmsg').removeClass('normalmsg');
                validMobile(oMobile);
            }
        },
        // 选择服务价格
        '#SubscribeWrap .price-list': function(e){
            var wMe = W(this),
                target = e.target,
                wTarget = W(target);
            if (target.nodeName.toLowerCase() === 'li') {
                wTarget.siblings().removeClass('actived');
                wTarget.addClass('actived');
                wMe.siblings('[name="price"]').val(wTarget.attr('value'));
                wMe.siblings('.errmsg').css({'visibility':'hidden'});
            }
        },
        // 选择日期
        '#SubscribeWrap .date-list': function(e){
            var wMe = W(this),
                target = e.target,
                wTarget = W(target);
            if (target.nodeName.toLowerCase() === 'li') {
                wTarget.siblings().removeClass('actived');
                wTarget.addClass('actived');
                wMe.siblings('[name="date"]').val( wTarget[0].getAttribute('value') );
                wMe.siblings('.errmsg').css({'visibility':'hidden'});
            }
        },
        // 验证码校验
        '#SubscribeWrap [name="mobile_captcha"]': {
            'focus': function(e){
                var wMe = W(this),
                    captcha = wMe.val();
                if (captcha==='请填写验证码') {
                    wMe.removeClass('color1').val('');
                    wMe.siblings('.errmsg').addClass('normalmsg').html('请查看手机短信').css('visibility', 'visible');
                }
            },
            'blur': function(e){
                var wMe = W(this);
                wMe.siblings('.errmsg').removeClass('normalmsg');
                validCaptcha(wMe);
            }
        },
        // 点击获取验证码
        '#SubscribeWrap .get-mobile_captcha': {
            'click': function(e){
                var wMe = W(this),
                    oMobile = wMe.siblings('[name="mobile"]'),
                    mobile = oMobile.val();
                
                if (validMobile(oMobile)) {
                    // 验证手机号格式的合法性&&可以发送
                    if (!wMe.hasClass('disabled')) {
                        wMe.addClass('disabled');
                        var txt = wMe.html(),
                            s = 60, h1, h2;
                        h1 = setTimeout(function(){
                            var arg = arguments;
                            wMe.html('剩余 '+s+' 秒');
                            if (s) {
                                s--;
                                h2 = setTimeout(function(){
                                    arg.callee();
                                }, 1000);
                            } else {
                                wMe.removeClass('disabled').html('重发验证码');
                            }
                        }, 10);
                        //var request_url = '/aj/sendsecode/',// [接口废弃]此处js是用的tpl已无Action引用
                        //    params = {
                        //        'mobile': mobile
                        //    };
                        //QW.Ajax.post(request_url, params, function(responseText){
                        //    try{
                        //        var response = QW.JSON.parse(responseText);
                        //        if (response['errcode']=='1000') {
                        //
                        //        } else {
                        //            clearTimeout(h1);
                        //            clearTimeout(h2);
                        //            wMe.removeClass('disabled').html('重发验证码');
                        //            wMe.siblings('.errmsg').removeClass('normalmsg').html(response['errmsg']).css('visibility','visible');
                        //        }
                        //    } catch(ex){}
                        //});
                    }
                } else {
                    oMobile.focus();
                }
            }
        },
        // 收不到验证码文字提示
        '#SubscribeWrap .mobile_captcha-tip': {
            'mouseenter': function(e){
                var wMe = W(this);
                wMe.siblings('.mobile_captcha-tip-block').show();
            },
            'mouseleave': function(e){
                var wMe = W(this);
                wMe.siblings('.mobile_captcha-tip-block').hide();
            }
        }
    });
    
    //初始化
    function init(){
        //直接在页面中显示，不需要处理浮层窗口等。
        var date_str = '',
            timestamp = (new Date()).getTime(),
            i = 0;
        while(i<3){
            if(i){
                timestamp += 86400000;
            }
            var oDate = new Date(timestamp);

            date_str += '<li value="'+(oDate.getFullYear())+'-'+(oDate.getMonth()+1)+'-'+oDate.getDate()+'">'+(oDate.getMonth()+1)+'月'+oDate.getDate()+'日</li>';

            i++;
        }
        var subscribe_func = W('#subscribeTpl').html().trim().tmpl(),
            subscribe_str = subscribe_func({"date":date_str});

        W('#SubscribeWrap').html( subscribe_str );
        // cur_cityname 为全局变量
        var city_name = cur_cityname;
        // W('#SubscribeWrap .select-city b').html(city_name);
        // W('#SubscribeWrap [name="addr_city"]').val(city_name);

        var city_code = cur_citycode,
            city_id = cur_cityid;
        W('#citySelector110 .sel-city').attr('code', city_code);
        W('#citySelector110 .sel-city .sel-txt').html(city_name).attr('data-code', city_code);
        W('#SubscribeWrap [name="addr_city"]').val(city_name);
        W('#SubscribeWrap [name="sub_city_code"]').val(city_id);
        // 激活面板选择
        new AreaSelect({
            'wrap': '#citySelector110',
            // 城市选择时触发
            'onCitySelect': function(data){
                W('#citySelector110 .sel-city').attr('code', data.citycode);
                W('#citySelector110 .sel-city .sel-txt').html(data.cityname).attr('data-code', data.citycode);
                W('#SubscribeWrap [name="sub_city_code"]').val(data.cityid);
                W('#SubscribeWrap [name="addr_city"]').val(data.cityname);
                W('#SubscribeWrap [name="addr_area"]').val('');
                W('#SubscribeWrap [name="addr_detail"]').val('');
            },
            // 区县选择时触发
            'onAreaSelect': function(data){
                if (typeof data.areaname!=='undefined') {
                    W('#SubscribeWrap [name="addr_area"]').val(data.areaname);
                } else {
                    W('#SubscribeWrap [name="addr_area"]').val('');
                }
                // 存在商圈
                if(W('#citySelector110 .sel-shangquan').isVisible()){
                    W('#SubscribeWrap [name="addr_detail"]').removeAttr('disabled').val('');
                } 
                else {//  不存在商圈
                    W('#SubscribeWrap [name="addr_detail"]').attr('disabled', 'disabled').val('');
                }
                
            },
            // 商圈选择时触发
            'onQuanSelect': function(data){
                if (typeof data.quanname!=='undefined') {
                    W('#SubscribeWrap [name="addr_detail"]').val(data.quanname);
                } else {
                    W('#SubscribeWrap [name="addr_detail"]').val('');
                }
            }
        });

        // // 根据当前的城市，获取当前的区县
        // // cur_citycode 为全局变量
        // getArea(cur_citycode);
        // // 选择城市
        // var cityPanel = new CityPanel('#SubscribeWrap .select-city');
        // cityPanel.on('selectCity', function(e) {
        //     var city = e.city.trim(),
        //         name = e.name.trim();

        //     var trigger = this.trigger;
        //     trigger.query('b').html(name);
        //     trigger.siblings('[name="addr_city"]').val(name);

        //     getArea(city, function(){
        //         trigger.siblings('[name="addr_area"]').val('');
        //         trigger.siblings('.select-area').query('b').html('选择区县')
        //     });
        // });
    }
    
    /**
     * 验证手机号的合法性
     * @param  {[type]} wMobile [description]
     * @return {[type]}         [description]
     */
    function validMobile(wMobile){
        var mobile  = wMobile.val(),
            wErrmsg = wMobile.siblings('.errmsg'),
            flag = false;
        if (!mobile||mobile==='请正确填写您的号码') {
            wErrmsg.html('请填写您的号码');
            wErrmsg.css({'visibility':'visible'});
            wMobile.val('请正确填写您的号码').addClass('color1');
            // wMobile.focus();
        }
        else if(!tcb.validMobile(mobile)){
            wErrmsg.html('您输入的号码有误，请重新输入');
            wErrmsg.css({'visibility':'visible'});
            wMobile.focus();
            wMobile[0].select();
        } else {
            flag = true;
            wErrmsg.css({'visibility':'hidden'});
        }
        return flag;
    }
    /**
     * 验证手机验证码
     * @param  {[type]} wCaptcha [description]
     * @return {[type]}          [description]
     */
    function validCaptcha(wCaptcha, callback){
        var captcha = wCaptcha.val(),
            captcha_reg = /^\d{6}$/,
            wErrmsg = wCaptcha.siblings('.errmsg');
        // 验证码为空
        if (!captcha) {
            wCaptcha.addClass('color1').val('请填写验证码');
            wErrmsg.html('验证码填写错误').css('visibility', 'visible');
            typeof callback === 'function' && callback(false);
        }
        // 验证码格式不对
        else if (!captcha_reg.test(captcha)){
            // wCaptcha.focus();
            // wCaptcha[0].select();
            wErrmsg.html('验证码填写错误').css('visibility', 'visible');
            typeof callback === 'function' && callback(false);
        }
        // 格式对了，校验是不是真实的..
        else {
            // 基本格式通过验证（请求服务器验证）
            var request_url = '/aj/cksecode/',
                params = {
                    'mobile': W('#SubscribeWrap [name="mobile"]').val(),
                    'secode': wCaptcha.val()
                };
            if (params.mobile==='请正确填写您的号码') {
                params.mobile = '';
            }
            wErrmsg.css('visibility', 'hidden');
            QW.Ajax.post(request_url, params, function(responseText){
                try{
                    var response = QW.JSON.parse(responseText);
                    if (response['errcode']=='1000') {
                        // do nothing
                        typeof callback === 'function' && callback(true);
                    } else {
                        wErrmsg.html(response['errmsg']||'&nbsp;').css('visibility', 'visible');
                        typeof callback === 'function' && callback(false);
                    }
                } catch(ex){typeof callback === 'function' && callback(false)}
            });
        }
    }

    /**
     * 获取城市的区县
     * @param  {[type]}   city     [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function getArea(city, callback){

        var request_url = '/aj/get_area/?citycode='+city;
        QW.Ajax.get(request_url, function(responseText){
            try{
                var area_list = QW.JSON.parse(responseText)['result'];

                var options_str = '';
                QW.ObjectH.map(area_list, function(v, k){
                    options_str += '<a href="javascript:;">'+v+'</a>';
                });
                W('#SubscribeWrap .area-select-pannel .area-select-list').html(options_str);

                var wArea= W('#SubscribeWrap .select-area');
                if (options_str) {
                    // W('#SubscribeWrap .area-select-pannel').fadeIn();
                    wArea.show();
                } else {
                    // W('#SubscribeWrap .area-select-pannel').hide();
                    wArea.hide();
                }

                typeof callback === 'function' && callback();
            } catch (e){typeof callback === 'function' && callback();}
        });
    }

    /**
     * 获取字符串长度;
     * @param str
     * @returns {number}
     */
    function  getLength(str) {
        var len = str.length; 
        var reLen = 0; 
        for (var i = 0; i<len; i++) {        
            if (str.charCodeAt(i)<27 || str.charCodeAt(i)>126){ 
                // 全角    
                reLen += 2; 
            }
            else {
                reLen++; 
            }
        }
        return Math.ceil(reLen/2);
    }

    /**
     * 根据用户的填写的位置，转换为坐标。
     * @param  {[type]} adrr [description]
     * @return {[type]}      [description]
     */
    function getLocationRange(addr, callback){

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

                callback(pos ? getBounds(pos, 5000) : '');
            });
            //逆地理编码
            MGeocoder.getLocation(addr);
        });
    }

    /**
     * 根据中心点和半径换算查询范围
     * @param  {[type]} latLng 坐标对象{lng:经度,  lat:纬度 } //如北京， 116经度，38纬度
     * @param  {[type]} radius 半径，单位米
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
 * 区域选择
 * @param {[type]} options [description]
 */
function AreaSelect(options){
    var defaults = {
        'wrap': '#citySelector110',
        'autoinit': true,
        'onInit': function(){},
        // 城市选择时触发
        'onCitySelect': function(data){},
        // 区县选择时触发
        'onAreaSelect': function(data){},
        // 商圈选择时触发
        'onQuanSelect': function(data){}
    }
    options = options || {};
    options = QW.ObjectH.mix(defaults, options, true);

    var me = this;
    me.options = options; // 配置项
    me.data = {}; // 用于回调中的参数

    var fn = AreaSelect.prototype;
    if (typeof fn.eventBind === 'undefined') {

        /**
         * 设置data
         * @param {[type]} key  [description]
         * @param {[type]} val  [description]
         * @param {[type]} flag [description]
         */
        fn.setData = function(key, val, flag){
            var me = this;

            if (QW.ObjectH.isObject(key)) {
                flag = val;
                val = null;
            } 
            else if (QW.ObjectH.isString(key)) {
                key = {
                    key:val
                };
            } else {
                return;
            }

            if (flag) {
                me.data = key;
            } else{
                me.data = QW.ObjectH.mix(me.data, key, true);
            }
        }
        /**
         * 根据key删除data中的数据
         */
        fn.deleteData = function(key){
            var me = this;

            var data = me.data;
            if (QW.ObjectH.isArray(key)) {
                QW.ObjectH.map(key, function(v){
                    if(typeof data[v] !== 'undefined'){
                        delete data[v];
                    }
                });
            }
            if (QW.ObjectH.isString(key)) {
                if (typeof data[key] !== 'undefined') {
                    delete data[key];
                }
            }
        }
        /**
         * 获取区县信息
         * @param  {[type]} citycode [description]
         * @return {[type]}          [description]
         */
        fn.getArea = function(citycode){
            var me = this;
            var url = 'http://' + location.host +'/aj/get_area/?citycode='+citycode;

            // 移除商圈选择
            me._removeAreaTrigger();
            me._removeQuanTrigger();
            QW.Ajax.get(url, function(responseText){
                try{
                    var area_list = QW.JSON.parse(responseText)['result'];

                    var options_str = '';
                    if (QW.ObjectH.isObject(area_list)) {
                        QW.ObjectH.map(area_list, function(v, k){
                            options_str += '<a href="javascript:;" code="'+k+'">'+v+'</a>';
                        });
                    }

                    if (options_str) {
                        options_str = '<a href="javascript:;">全部区县</a>' + options_str;

                        var wAreaTrigger = me._getAreaTrigger();
                        wAreaTrigger.show();
                        wAreaTrigger.query('.select-list').html(options_str);
                    }
                } catch (e){}
            });
        }
        /**
         * 获取商圈信息
         * @param  {[type]} citycode [description]
         * @param  {[type]} areacode [description]
         * @return {[type]}          [description]
         */
        fn.getQuan = function(citycode, areacode){
            var me = this;
            var url = 'http://' + location.host +'/aj/get_areaquan/?citycode='+citycode+'&areacode='+areacode;

            // 移除商圈选择
            me._removeQuanTrigger();
            QW.Ajax.get(url, function(responseText){
                try{
                    var area_list = QW.JSON.parse(responseText)['result'];

                    var options_str = '';
                    if (QW.ObjectH.isObject(area_list)) {
                        QW.ObjectH.map(area_list, function(v, k){
                            options_str += '<a href="javascript:;" code="'+k+'">'+v+'</a>';
                        });
                    }

                    if (options_str) {
                        options_str = '<a href="javascript:;">全部商圈</a>' + options_str;

                        var wQuanTrigger = me._getQuanTrigger();
                        wQuanTrigger.show();
                        wQuanTrigger.query('.select-list').html(options_str);
                    }
                } catch (e){}
            });
        }
        /**
         * 获取组件的最外层的对象；
         * @return {[type]} [description]
         */
        fn.getWrap = function(){
            var me = this;
            if (me.wWrap) {
                return me.wWrap;
            }
            var wWrap = QW.ObjectH.isObject(me.options['wrap']) ? me.options['wrap'] : W(me.options['wrap']);

            return me.wWrap = wWrap;
        }
        /**
         * 获取城市触发器
         * @return {[type]} [description]
         */
        fn._getCityTrigger = function(){
            var me = this;
            if (me.wCityTrigger) {
                return me.wCityTrigger;
            }
            var wWrap = me.getWrap(),
                wCityTrigger = wWrap.query('.sel-city');

            return me.wCityTrigger = wCityTrigger;
        }
        /**
         * 获取区县触发器
         * @return {[type]} [description]
         */
        fn._getAreaTrigger = function(){
            var me = this;
            if (me.wAreaTrigger) {
                return me.wAreaTrigger;
            }
            var wWrap = me.getWrap(),
                wAreaTrigger = wWrap.query('.sel-quxian');
            if (!wAreaTrigger.length) {
                var tpl = W('#ClientAreaTpl').html().trim();
                wAreaTrigger = W(tpl);
                me.getWrap().appendChild(wAreaTrigger);
            }

            return me.wAreaTrigger = wAreaTrigger;
        }
        /**
         * 移除区县
         * @return {[type]} [description]
         */
        fn._removeAreaTrigger = function(){
            var me = this;

            var wAreaTrigger = me._getAreaTrigger();

            wAreaTrigger.removeNode();
            delete me.wAreaTrigger;
        }
        /**
         * 获取商圈触发器
         * @return {[type]} [description]
         */
        fn._getQuanTrigger = function(){
            var me = this;
            if (me.wQuanTrigger) {
                return me.wQuanTrigger;
            }
            var wWrap = me.getWrap(),
                wQuanTrigger = wWrap.query('.sel-shangquan');
            if (!wQuanTrigger.length) {
                var tpl = W('#ClientQuanTpl').html().trim();
                wQuanTrigger = W(tpl);
                me.getWrap().appendChild(wQuanTrigger);
            }

            return me.wQuanTrigger = wQuanTrigger;
        }
        /**
         * 移除商圈
         * @return {[type]} [description]
         */
        fn._removeQuanTrigger = function(){
            var me = this;

            var wQuanTrigger = me._getQuanTrigger();

            wQuanTrigger.removeNode();
            delete me.wQuanTrigger;
        }

        /**
         * 选择城市
         * @return {[type]} [description]
         */
        fn._selectCity = function(){
            var me = this;

            var wCityTrigger = me._getCityTrigger(),
                cityPanel = new CityPanel(wCityTrigger);

            cityPanel.on('selectCity', function(e) {
                var code = e.city.trim(),
                    name = e.name.trim(),
                    cityid = e.cityid.trim();

                wCityTrigger.attr('code', code);
                wCityTrigger.one('.sel-txt').html(name);

                // 选择城市的时候获取区县
                me.getArea(code);

                // 设置data
                me.setData({
                    'cityid': cityid,
                    'citycode': code,
                    'cityname': name
                }, true);
                var data = me.data;
                // 选择城市的时候调用此回调
                if(typeof me.options.onCitySelect === 'function'){
                    me.options.onCitySelect(data);
                }
            });
        }
        /**
         * 绑定事件
         * @return {[type]} [description]
         */
        fn.eventBind = function(){
            var me = this;
            var wWrap = me.getWrap();

            // 激活城市选择
            me._selectCity();
            // 外层对象上绑定事件
            wWrap.on('click', function(e){
                var wMe = W(this),
                    target = e.target,
                    wTarget = W(target);

                var wAreaTrigger = me._getAreaTrigger(),
                    wQuanTrigger = me._getQuanTrigger();
                // 激活区县选择
                if (wAreaTrigger.contains(target)||wAreaTrigger[0]===target) {
                    var wPanel = wAreaTrigger.query('.select-pannel');
                    wPanel.fadeIn(100);

                    // 关闭区县选择列表
                    if (wTarget.hasClass('close')) {
                        wPanel.hide();
                    }
                    // 选择区县
                    if (wTarget[0].nodeName.toLowerCase()==='a') {
                        var code = wTarget.attr('code'),
                            name = wTarget.html();
                        if (code) {
                            wAreaTrigger.attr('code', code);
                            wAreaTrigger.query('.sel-txt').html(name);
                            // 设置data
                            me.setData({
                                'areacode': code,
                                'areaname': name
                            });
                        } else {
                            wAreaTrigger.attr('code', '');
                            wAreaTrigger.query('.sel-txt').html('选择区县');
                            me.deleteData(['areacode', 'areaname']);
                        }

                        wPanel.hide();

                        // 删除商圈data
                        me.deleteData(['quancode', 'quanname']);
                        var data = me.data;
                        // 选择区县的时候获取商圈
                        me.getQuan(data['citycode'], code);
                        // 选择区县的时候调用此回调
                        if (typeof me.options.onAreaSelect === 'function') {
                            me.options.onAreaSelect(data);
                        }
                    }
                }
                // 激活商圈选择
                else if(wQuanTrigger.contains(target)||wQuanTrigger[0]===target){
                    var wPanel = wQuanTrigger.query('.select-pannel');
                    wPanel.fadeIn(100);

                    // 关闭商圈选择列表
                    if (wTarget.hasClass('close')) {
                        wPanel.hide();
                    }
                    // 选择商圈
                    if (wTarget[0].nodeName.toLowerCase()==='a') {
                        var code = wTarget.attr('code'),
                            name = wTarget.html();
                        if (code) {
                            wQuanTrigger.attr('code', code);
                            wQuanTrigger.query('.sel-txt').html(name);
                            // 设置data
                            me.setData({
                                'quancode': code,
                                'quanname': name
                            });
                        } else {
                            wQuanTrigger.attr('code', '');
                            wQuanTrigger.query('.sel-txt').html('选择商圈');
                            me.deleteData(['quancode', 'quanname']);
                        }

                        wPanel.hide();

                        var data = me.data;
                        // console.log(data)
                        // 选择商圈的时候调用此回调
                        if (typeof me.options.onQuanSelect === 'function') {
                            me.options.onQuanSelect(data);
                        }
                    }
                }
            });
            // body上的绑定事件，面板失去焦点的时候关闭面板
            W(document.body).on('click', function(e){
                var target = e.target,
                    wTarget = W(target);

                var wAreaTrigger = me._getAreaTrigger();
                if (!(wAreaTrigger.contains(target)||wAreaTrigger[0]===target)) {
                    wAreaTrigger.query('.select-pannel').hide();
                }

                var wQuanTrigger = me._getQuanTrigger();
                if (!(wQuanTrigger.contains(target)||wQuanTrigger[0]===target)) {
                    wQuanTrigger.query('.select-pannel').hide();
                }
            });
        }
        /**
         * 初始化调用
         * @return {[type]} [description]
         */
        fn.init = function(){
            var me = this;

            me.eventBind();

            var wCityTrigger = me._getCityTrigger(),
                code = wCityTrigger.attr('code'),
                name = wCityTrigger.query('.sel-txt').html();
            me.setData({
                'citycode': code,
                'cityname': name
            });
            me.getArea(code);
            if(typeof me.options.onInit === 'function'){
                me.options.onInit();
            }
        }
    }
    // 初始化
    me.options.autoinit && me.init();
}

    //入口
    return{
        init : init
    }
})();

//为其他页面提供调用接口
(function(){
    var subTip;
    var subscribe_obj = null;

    var appTip;

    var erweimaTip;

    //在主体内容右侧显示预约功能
    function showRightSubscribe(){

        subTip = W('.subscribe-service');
        if( subTip.length == 0 ){
            subTip = W('<div class="right-subscribe-service"><a href="#" bk="yuyue-float" class="ss-clickplace subscribe-service"></a><a href="#" class="ss-close"></a></div>').appendTo( W('body') );

            
            subTip.query('.ss-close').on('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                subTip.hide();            
            });
            // 二维码
            erweimaTip = W('<div class="right-erweima"></div>').appendTo( W('body') );

            //FML，very bad...
            appTip =  W('<div class="right-phoneapp-tip"><a target="_blank" href="http://hr.bang.360.cn/" bk="app-float" class="phoneapp-tip"></a></div>').appendTo( W('body') );       
            appTip.hide(); //！！！隐藏，暂时不要了。
            _autoRightYuyuePos();
        }

        try{
            subTip.bind('click', function(e){
                e.preventDefault();
                _showYuyue();
            });
        }catch(ex){}

        W('body').delegate('#SubscribeWrap .close-pop-btn', 'click', function(){
            if(subscribe_obj != null){
                subscribe_obj.close();
            }
        });

    }

    function _autoRightYuyuePos(){
            
        W(window).on('load', _autoPos);
        W(window).on('resize', _autoPos);

        _autoPos();
    }  

    function _autoPos(){
        try{ subTip.css('left', (Dom.getDocRect().width - W('.doc-bd').getRect().width)/2 + W('.doc-bd').getRect().width + 10);}catch(ex){}

        try{ appTip.css('left', (Dom.getDocRect().width - W('.doc-bd').getRect().width)/2 + W('.doc-bd').getRect().width + 10);}catch(ex){}

        try{ erweimaTip.css('left', (Dom.getDocRect().width - W('.doc-bd').getRect().width)/2 + W('.doc-bd').getRect().width + 10);}catch(ex){}
    }  

    
    var PanelManager = QW.PanelManager;
    /**
     * 预约维修服务面板
     * @constructor
     */
    function SubscribePanel(options){
        var me = this;

        me.wrapId = 'SubscribeWrap'; // 包裹器的id
        me.content = '';
        me._rendered = false;   // 自动输出
        me.withMask = true;     // 遮罩
        me.posCenter = true;    // 显示在中间
        me.posAdjust = true;
        me.keyEsc = true;
        me._reopen = false;     // 重新打开
        me.oWrap = null;

        QW.ObjectH.mix(me, options, 1);

        var fn = SubscribePanel.prototype;
        if(typeof me.open==='undefined'){

            fn.render = function(){
                var me = this;

                if(!W('#'+me.wrapId).length) {
                    var oWrap = QW.DomU.createElement("div");
                    oWrap.style.display = 'none';
                    oWrap.style.position = 'absolute';
                    me.oWrap = oWrap;
                    if (me.wrapId) oWrap.id = me.wrapId;

                    oWrap.innerHTML = me.content;

                    document.body.insertBefore(oWrap, document.body.firstChild);
                } else {
                    if(me._reopen){
                        me.oWrap.innerHTML = me.content;
                    }
                }
            }

            /**
             * 打开面板
             */
            fn.open = function(){
                var me = this;

                me._rendered = true;
                me._reopen = false;
                PanelManager.showPanel(me);
            }
            /**
             * 重新打开面板
             */
            fn.reopen = function(){
                var me = this;

                me._rendered = true;
                me._reopen = true;
                PanelManager.showPanel(me);
            }
            /**
             * 关闭面板
             */
            fn.close = function(){
                var me = this;

                PanelManager.hidePanel(me);
            }
            /**
             * 关闭面板,close的别名
             */
            fn.hide = function(){
                this.close();
            }
        }
    }

    window.showRightSubscribe = showRightSubscribe;

    //显示预约窗口
    function _showYuyue(){
        if(subscribe_obj === null){
            subscribe_obj = new SubscribePanel({
                content : '<div class="close-pop-btn pngfix" style="width:30px; height:30px;background:url(https://p.ssl.qhimg.com/t0192f1144bb7a81086.png) no-repeat scroll -1px 0;position:absolute;top:-3px; right:-8px;cursor:pointer;"></div><iframe src="'+BASE_ROOT+'yuyue?win=PanelManager" allowtransparency="true" frameborder="0" scrolling="no" width=585 height=508></iframe>'
            });

            subscribe_obj.open();
        }else{
            subscribe_obj.reopen();
        }
    }

    window.openYuyueWindow = _showYuyue;

})();

Dom.ready(function(){
    if(typeof(__inYuyuePage)=="undefined" || !__inYuyuePage){//不在预约frame中时触发。
        showRightSubscribe();
    }
});
