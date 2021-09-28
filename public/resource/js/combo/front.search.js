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


;/**import from `/resource/js/page/front.search.js` **/
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
