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




;/**import from `/resource/js/page/front.pinpai.js` **/
(function(){
    var __lngLat = { lng: tcb.html_encode(location.search.queryUrl('lng'))||0, lat:tcb.html_encode(location.search.queryUrl('lat'))||0 };



    // 初始化
    Dom.ready(function(){

    	var JuBaoPanel = null;

        // 事件绑定
        tcb.bindEvent(document.body, {
            // 切换顶部搜索tab
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
            // 选择维修类别
            '.pinpai-search-cate a':function(e){
                e.preventDefault();

                W(this).parentNode('li').addClass('actived').siblings('li').removeClass('actived');

                // 切换查询的函数
                doSearch(true);
            },
            // 选择城市区县
            '.pinpai-search-area a':function(e){
                e.preventDefault();

                W(this).parentNode('li').addClass('actived').siblings('li').removeClass('actived');

                // 选择区县后，清除位置搜索结果
                cleanAddrSearch();
                // 切换查询的函数
                doSearch(true);
            },
            // 显示更多区县
            '.pinpai-nearby-item .shop-area': {
                'mouseenter':function(e){
                    W(this).addClass('shop-area-hover');
                },
                'mouseleave' : function(e){
                    W(this).removeClass('shop-area-hover');
                }
            },
            // 显示商家大地图
            '.shop-map': function(e){
                e.preventDefault();

                var el = W(this);

                new bigMap().show( el.attr('data-shopid'), typeof(_inclient)!='undefined' && _inclient );
            },
            //显示官方商家列表的地图展示
            '.shop-ditu-viewbig' : function(e){
                e.preventDefault();
                showBigMap();
            },
            // 显示真实电话号码
            '.show-real-tel': function(e){
                e.preventDefault();

                var wMe = W(this),
                    wTel = wMe.siblings('.shop-short-tel');
                wTel.html(wTel.attr('real-tel'));
                wMe.hide();

                var tel = wTel.attr('real-tel');
                var shop_id = wTel.attr('data-shopid');
                new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=pinpai"+ ( location.href.indexOf('pinpai/shop')>-1? '_shop' : '' ) +( typeof(_inclient)!='undefined'&&_inclient ? '&inclient=1' : '' );
            },
            //分享商家
            '#shareShop' : function(e){
                e.preventDefault();
                var _this = W(this);
                shopFunc.shareLink(_this, 'shop');
            },
            //发送到手机
            '#sendToPhone' : function(e){
                e.preventDefault();
                var _this = W(this);
                shopFunc.sendToPhone(_this, 'shop');
            },
            //举报
            '#JuBaoButton' : function(e){
                e.preventDefault();

                var jubao_func = W('#JuBaoPanelTpl_pinpai').html().trim().tmpl(),
                    jubao_str = jubao_func();

                JuBaoPanel = tcb.panel('举报该信息', jubao_str, {
                    'wrapId': 'JuBaoPanel',
                    'width': 577
                });
            },
            // 提交举报表单
            '.sub_jubao': function(e){
                var wJubaoid = W('[name="jubaoid"]').filter(':checked'),
                    wProgram_desc = W('[name="program_desc"]'),
                    wLink_phone = W('[name="link_phone"]');

                var program_desc = wProgram_desc.val(),
                    link_phone = wLink_phone.val();
                // 验证jubaoid
                // 验证问题描述
                // 验证联系电话
                if (!validJubaoId(wJubaoid) || !validProgramDesc(wProgram_desc) || !validLinkPhone(wLink_phone)) {
                    return ;
                }

                var params = {
                    'jubaoid': wJubaoid.val(),
                    'shopid': shop_id,
                    'qid': host_qid,
                    'program_desc': program_desc,
                    'link_phone': link_phone
                };
                var request_url = base_url+'aj/jubaoshop/?'+QW.ObjectH.encodeURIJson(params);
                QW.loadJsonp(request_url, function(response){
                    if (response['errno']==0) {
                        // JuBaoPanel.hide();

                        var jubao_func2 = W('#JuBaoPanel2Tpl_pinpai').html().trim().tmpl(),
                        jubao_str2 = jubao_func2();

                        var JuBaoPanel2 = tcb.panel('举报该信息', jubao_str2, {
                            'wrapId': 'JuBaoPanel2',
                            'width': 268
                        });
                        JuBaoPanel2.on('beforehide', function(){
                            JuBaoPanel.hide();
                        });
                   }
                });
            },
            // 举报描述
            '.program_desc': {
                'focus': function(e){
                    var wMe = W(this);

                    if (wMe.hasClass('unactived')) {
                        wMe.removeClass('unactived').val('');
                    }
                },
                'blur': function(e){
                    var wMe = W(this);

                    if (wMe.val().trim()==='') {
                        wMe.addClass('unactived').val(wMe.attr('textholder'));
                    }
                }
            },
            // 联系电话
            '.link_phone': {
                'focus': function(e){
                    var wMe = W(this);

                    if (wMe.hasClass('unactived')) {
                        wMe.removeClass('unactived').val('');
                    }
                },
                'blur': function(e){
                    var wMe = W(this);

                    if (wMe.val().trim()==='') {
                        wMe.addClass('unactived').val(wMe.attr('textholder'));
                    }
                }
            }
        });

        // 初始化
        init();
    });
    /**
     * 入口
     * @return {[type]} [description]
     */
    function init(){
        //选择城市，刷新页面
        selectCity('.citypanel_trigger');

        setValue();
        //初始化小地图
        if (typeof weixiuDataJson!=='undefined') {
            initMiniMap();
        }
        initShopMinMap();
        //冻结搜索框
        // fixedToSearchBox();

        //位置搜索过滤
        initAddrSearch('#addrSearchForm .addr-ipt');
    }

    //展示商家列表的小地图
    function initMiniMap(wrap, isShowPop){
        var currQuxian = W('.pinpai-search-area ul li.actived');
        var isQuexian = !! currQuxian.attr('data-code');
        wrap = wrap || "ShopDituWrap";
        var wrapDom = document.getElementById(wrap);

        if(! wrapDom){return false;}

        var poiList = weixiuDataJson || [];

        //设置地图中心
        var selAddr = W('.top-hd-area .area-box-sel').html() + '市'  + (isQuexian ? currQuxian.one('a').html() : '');
        getGeoPoi( selAddr, function(poi){

            var map = new AMap.Map( wrap , {
                view: new AMap.View2D({//创建地图二维视口
                   center : new AMap.LngLat(poi.lng, poi.lat),
                   zoom:isQuexian? 10 : 9,
                   rotation:0
                })
            } );

            try{
                for(var i=0, n=poiList.length; i<n; i++){

                    (function(item){

                        var marker = new AMap.Marker({
                            id:"mapMarker_"+Math.ceil(Math.random()*10000),
                            position:new AMap.LngLat(item.map_longitude, item.map_latitude),
                            icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
                            offset:{x:-13,y:-36}
                        });
                        marker.setMap(map);

                        if(isShowPop){
                            var infoWindow = new AMap.InfoWindow({
                                isCustom: true,
                                autoMove: true,
                                offset:new AMap.Pixel(70,-280),
                                content:W('#pinpaiMapInfoTpl').html().tmpl({
                                    shop_name: item.shop_name,
                                    addr: item.addr_detail,
                                    service_tags: item.main.subByte(40,'...'),
                                    shop_addr: item.shop_addr
                                })
                            });

                            AMap.event.addListener(marker, "click", function(){
                                //try{ tcbMonitor.__log({cid:'pp-map-marker-click',ch:''}); }catch(ex){}
                                infoWindow.open(map, marker.getPosition())
                            });
                        }
                    })(poiList[i]);

                }

                W(document.body).delegate('.mode-map a.close', 'click', function(e){
                    e.preventDefault();
                    map.clearInfoWindow();
                });
            }catch(e){}

        });
    }
    //展示商家列表的大地图
    function showBigMap(){
        var wrap = "ShopDituBigWrap";
        var panel = tcb.alert("商铺地图", '<div id="'+wrap+'" style="width:695px;height:410px"></div>', {'width':695, 'btn_name': '关闭'}, function(){
                return true;
            });

        initMiniMap(wrap, true);
    }

    //展示单个商家小地图
    function initShopMinMap(){

        if(W('#ShopDituWrap2').length == 0){ return false;}

        var el = W('#ShopDituWrap2');

        var item = {
            lng : el.attr('data-lng'),
            lat : el.attr('data-lat')
        }
        try{
            var center = new AMap.LngLat(item.lng, item.lat);
            var map = new AMap.Map( "ShopDituWrap2" ,{
                view: new AMap.View2D({//创建地图二维视口
                   center : center,
                   zoom:11,
                   rotation:0
                })
            });
            var marker = new AMap.Marker({
                id:"mapMarker",
                position:new AMap.LngLat(item.lng, item.lat),
                icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
                offset:{x:-13,y:-36}
            });
            marker.setMap(map);
        }catch(e){}
    }

    function validJubaoId(wObj){
        var flag = true;
        if (!wObj.length) {
            alert('请选择举报内容');
            flag = false;
        }
        return flag;
    }
    function validProgramDesc(wObj){
        var flag = true;
        if (wObj.hasClass('unactived')) {
            alert('请填写问题描述');
            flag = false;
        }
        return flag;
    }
    function validLinkPhone(wObj){
        var flag = true;
        if (wObj.hasClass('unactived')) {
            alert('请填写问题联系电话');
            flag = false;
        }
        else if (!tcb.validMobile(wObj.val())) {
            alert('手机号码填写不正确');
            flag = false;
        }
        return flag;
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

            var city_name = e.city.trim();

            var url = window.location.href.replace(/&city_code=[\w]/ig, '').replace(/&area_id=\w+/, '') + '&city_code=' + city_name;

            location.href = url;
        });
    }
    /**
     * 执行位置搜索
     * @param  {[type]} flag [description]
     * @param  {[type]} step [description]
     * @return {[type]}      [description]
     */
    function doSearch(flag,step){
        var params = getParam();

        flag && (params['pn'] = 0);

        location.href = "http://" +location.host +location.pathname + '?'+Object.encodeURIJson(params);
    }
    /**
     * 获得过滤的参数
     */
    function getParam(){
        var pagenum = location.href.queryUrl('pn');
        var classify_id = W('.pinpai-search-cate .actived').attr('data-code') || 0;
        var area_id = W('.pinpai-search-area .actived').attr('data-code') || 0;
        var wAddript = W('#addrSearchForm .addr-ipt'),
            addr = wAddript.val()==wAddript.attr('data-default') ? '' : wAddript.val();

        return {
            'name': location.href.queryUrl('name'), // 品牌名
            'pinpai_type': location.href.queryUrl('pinpai_type'),// 品牌类型（电脑or手机）
            'city_id': cur_citycode,    // 当前城市id
            'area_id': area_id,         // 当前区县id
            'classify_id': classify_id, // 维修类别id
            'pn': pagenum ? pagenum : 0,// 分页
            'keyword': keyword,         // 搜索关键词
            'pagesize': 15,             // 显示数量
            'lng' : __lngLat ? __lngLat.lng : '', // 经度
            'lat' : __lngLat ? __lngLat.lat : '', // 纬度
            'addr' : addr // 搜索地址
        }
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
    // //控制表头
    // function fixedHead(){
    //     if(W("#modBoxHead").length==0|| W(".search-mod-hd").length==0) return;

    //     var scrollY=Dom.getDocRect().scrollY,
    //         obj = W("#modBoxHead"),
    //         tableY = W(".search-mod-hd").getXY()[1];

    //     if(scrollY>tableY){
    //          if(QW.Browser.ie6){
    //             obj.css({
    //                 'position':'absolute',
    //                 'top':scrollY,
    //                 'width':'960px'
    //             }).show();
    //          }else{
    //             obj.css({
    //                 'position':'fixed',
    //                 'top':0,
    //                 'width':'960px'
    //             }).show()
    //          }
    //     }else{
    //          obj.hide();
    //     }
    // }
    // W(window).on('scroll', fixedHead);
    // W(window).on('resize', fixedHead);

    // //冻结搜索框完整版
    // function fixedToSearchBox(){
    //     if( W('#doc-menubar .tcb-top-search').length>0 ){

    //         function autoFixedTopSearch(){
    //             var tbH = W('#doc-topbar').getSize().height;
    //             var dST = document.documentElement.scrollTop || document.body.scrollTop;
    //             var dmH = W('#doc-menubar').getSize().height;

    //             W('#doc-menubar-fixed').css('height', dmH);
    //             if( dST>= tbH ){
    //                 if( W('#doc-menubar-fixed').css('display') == 'none' ){
    //                     //把搜索框区域浮动条中
    //                     W('#doc-menubar').query('>.in').appendTo( W('#doc-menubar-fixed').html('') );
    //                     W('.hd-search-info form input[name="_isfix"]').val(1);
    //                     W('#doc-menubar-fixed').show();
    //                     W('#doc-menubar').css('visibility', 'hidden');
    //                     W(".search-click-here").hide();
    //                 }
    //             }else{
    //                 if( W('#doc-menubar-fixed').css('display') != 'none' ){
    //                     //将搜索框区域放回去
    //                     W('#doc-menubar').appendChild(W('#doc-menubar-fixed').query('>.in'));
    //                     W('.hd-search-info form input[name="_isfix"]').val(0);
    //                     W('#doc-menubar').css('visibility', 'visible');
    //                     W('#doc-menubar-fixed').hide();
    //                     W(".search-click-here").show();
    //                 }
    //             }
    //         }

    //         W(window).on('scroll', autoFixedTopSearch);
    //         W(window).on('onload', autoFixedTopSearch);
    //         W(window).on('resize', autoFixedTopSearch);
    //     }
    // }
    /**
     * 绑定位置搜索框
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
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
    /**
     * 根据poi搜索
     * @param  {[type]} poi [description]
     * @return {[type]}     [description]
     */
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
    /**
     * 获取poi，执行回调
     * @param  {[type]}   addr     [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
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
    /**
     * 清除位置搜索状态
     * @return {[type]} [description]
     */
    function cleanAddrSearch(){
        __lngLat = null;
        W('#addrSearchForm .addr-ipt').val('');
    }
    /**
     * 清除城市区县商圈选择状态
     * @return {[type]} [description]
     */
    function cleanCitySel(){
        W('.pinpai-search-area li').removeClass('actived').first().addClass('actived');
    }
}());

