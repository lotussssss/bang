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

;/**import from `/resource/js/component/datetime.js` **/
var DateTime = function(el, config){
	var styleCss = '.ui-datetime{position:absolute;z-index:9000;left:0;top:0;width:260px;background:#fff;border:1px solid #ccc;}.ui-datetime .date-box{border-bottom:1px solid #bbb}.ui-datetime .time-box{}.ui-datetime .date-item,.ui-datetime .time-item{display:inline-block;_zoom:1;padding:5px;border:1px solid #ddd;white-space:nowrap;word-break:keep-all;cursor:pointer; margin:4px;}.ui-datetime .date-curr{border-color:#81C900;background-color:#FAF2DB}.ui-datetime .time-curr{border-color:#81C900;background-color:#FAF2DB}.ui-datetime .date-disabled,.ui-datetime .time-disabled{border-color:#eee;background:#f0f0f0; color:#aaa;cursor:not-allowed;}';

    var _this = this;
	this.box = null;
	this.el = null;
	this.conf = Object.mix({
        remote: '',
        remoteDateTime: [],
		dateList : [ {'text' : (new Date().getMonth()+1) +'-'+ (new Date().getDate()), 'value':(new Date().getMonth()+1) +'-'+ (new Date().getDate())} ],
		timeList : [{'text':'09:00', 'value':'09:00'}, 
					{'text':'10:00', 'value':'10:00'}, 
					{'text':'11:00', 'value':'11:00'}, 
					{'text':'12:00', 'value':'12:00'}, 
					{'text':'13:00', 'value':'13:00'}, 
					{'text':'14:00', 'value':'14:00'}, 
					{'text':'15:00', 'value':'15:00'}, 
					{'text':'16:00', 'value':'16:00'}, 
					{'text':'17:00', 'value':'17:00'}, 
					{'text':'18:00', 'value':'18:00'}],
		onSelect : function(){ }
	}, config, true);

	this.init = function(el, config){
		el = W(el);
		this.el = el;

		if(el.attr('type') != 'text'){
			return;
		}

		Dom.insertCssText(styleCss);

        var _this = this;
        this.__create(function(wBox){

            el.on('focus', function(){
                _this.show();
            });

            W(document.body).on('click', function(e){
                if( e.target != _this.el[0] && e.target != wBox[0] && !wBox.contains(e.target) ){
                    _this.hide();
                }
            });

            // 日期选择
            wBox.delegate('.date-item', 'click', function(){
                var wMe = W(this);
                if (wMe.hasClass('date-disabled')) {
                    return ;
                }

                wMe.addClass('date-curr').siblings('.date-curr').removeClass('date-curr');
                if (_this.conf.remote && _this.conf.remoteTime) {
                    // 远程获取的数据
                    var timelist = _this.conf.remoteTime[wMe.attr('data-value')];

                    wBox.query('.time-box').html( __genTimeHtml(timelist) );
                } else {

                    wBox.query('.time-item').removeClass('time-curr').removeClass('time-disabled');
                }
                var today = DateTime.getDateList(0, 1)[0],
                    now = (new Date().getHours());

                if( wMe.attr('data-value') == today.value ){//如果选的是今天，就要禁止掉已经过期的时间点
                    wBox.query('.time-item').forEach(function(el){
                        var w_this = W(el);
                        if( w_this.attr('data-value').split(':')[0]-0 <= now ){
                            w_this.addClass('time-disabled');
                        }
                    });
                }

            });

            // 时间选择
            wBox.delegate('.time-item', 'click', function(){
                if( W(this).hasClass('time-disabled') ){
                    return false;
                }

                W(this).addClass('time-curr').siblings('.time-curr').removeClass('time-curr');
                if( wBox.one('.date-curr').length>0 ){
                    _this.select();
                }
            });

        });

	}
    // 生成日期选择容器
	this.__create = function(callback){
        var me = this;
        var remote = me.conf.remote;
        if (remote) {

            me.getRemoteDateTime(function(remoteDateTime){
                remoteDateTime = remoteDateTime || [];
                var dateTimeHtml = __genDateTimeHtml(remoteDateTime, me.conf.remoteTime);
                var date_str = dateTimeHtml[0],
                    time_str = dateTimeHtml[1];

                var wBox = W('<div class="ui-datetime"><div class="date-box">'+date_str+'</div><div class="time-box">'+time_str+'</div></div>').appendTo(W('body')).hide();
                me.box = wBox;
                if (typeof callback === 'function') {
                    callback(wBox)
                }
            });

        } else {
            var dstr = '';
            var tstr = '';
            var dlist = me.conf.dateList;
            for(var i=0, n=dlist.length; i<n; i++){
                dstr += '<span class="date-item '+(n===1? 'date-curr' : '')+'" data-value="'+dlist[i].value+'">'+dlist[i].text+'</span>';
            }

            var tlist = me.conf.timeList;
            for(var i=0, n=tlist.length; i<n; i++){
                tstr += '<span class="time-item" data-value="'+tlist[i].value+'">'+tlist[i].text+'</span>';
            }

            var wBox = W('<div class="ui-datetime"><div class="date-box">'+dstr+'</div><div class="time-box">'+tstr+'</div></div>').appendTo(W('body')).hide();
            me.box = wBox;
            if (typeof callback === 'function') {
                callback(wBox)
            }
        }
	}

    // 生成date和time的html
    function __genDateTimeHtml(remoteDateTime, remoteTime) {
        remoteDateTime = remoteDateTime || [];
        var len = remoteDateTime.length;

        var date_str = '',
            time_str = '';
        remoteDateTime.forEach(function(item, i){
            // 日期
            var date = item['date'];
            date_str += '<span class="date-item'+(len===1? ' date-curr' : '')+(date['is_able'] ? '' : ' date-disabled')+'" data-value="'+date['value']+'">'+date['text']+'</span>';

            remoteTime[date['value']] = item['time'];

            if (!i) {
                // 时间
                time_str = __genTimeHtml(item['time']);
            }
        });

        return [date_str, time_str];
    }
    // 产生时间html
    function __genTimeHtml(timelist) {
        var time_html = '';
        if (timelist.length){
            timelist.forEach(function(item, i){
                time_html += '<span class="time-item'+(item['is_able'] ? '' : ' time-disabled')+'" data-value="'+item['value']+'">'+item['text']+'</span>';
            });
        }

        return time_html;
    }
    // 重置远程请求url
    this.resetRemote = function(remote, reset_succ_callback){
        remote = remote || '';

        this.conf.remote = remote;

        this.resetBoxHtml(reset_succ_callback);
    }
    // 重置box内的日期选择
    this.resetBoxHtml = function(reset_succ_callback){
        var me = this;

        me.getRemoteDateTime(function(remoteDateTime){
            remoteDateTime = remoteDateTime || [];
            var dateTimeHtml = __genDateTimeHtml(remoteDateTime, me.conf.remoteTime);
            var date_str = dateTimeHtml[0],
                time_str = dateTimeHtml[1];

            var wBox = me.box;
            if (wBox && wBox.length) {
                wBox.query('.date-box').html(date_str);
                wBox.query('.time-box').html(time_str);

                typeof reset_succ_callback==='function' && reset_succ_callback(wBox, remoteDateTime);
            }

        });
    };
    // 获取远程日期、时间数据
    this.getRemoteDateTime = function(callback) {
        var me = this;
        var remote = me.conf.remote;

        QW.Ajax.get(remote, function(res){
            res = JSON.parse(res);

            if (!res['errno']) {
                me.conf.remoteTime = {};
                me.conf.remoteDateTime = res['result'];

                if (typeof callback === 'function') {

                    callback(me.conf.remoteDateTime);
                }
            } else {
                // @do nothing
            }
        });
    };

	this.select = function(){
		var val = this.box.query('.date-curr').attr('data-value') +' '+ this.box.query('.time-curr').attr('data-value');
		this.el.val( val );
		this.hide();
		if(typeof(this.conf.onSelect)=='function') this.conf.onSelect(val);
	};

	this.show = function(){
		var elRect= this.el.getRect();
        var sugwidth = this.el.attr('data-sugwidth')-0;

		this.box.css({
			'left' : elRect.left,
			'top' : elRect.top + elRect.height-1,
			'width' : sugwidth || elRect.width-2,
            'z-index' : tcb.zIndex ()
		}).show();
	};

	this.hide = function(){
		this.box.hide();
	};

	this.init(el, config);
};

/**
 * 获取日期列表
 * @param  {int} from    从哪天开始，0为今天，1为明天，以此类推。
 * @param  {int} dateNum 要返回的天数
 * @return {[type]}         [description]
 */
DateTime.getDateList = function(from, dateNum){
	var DAY_ARR = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
	from = from || 0;
	dateNum = dateNum || 1;
	var dateArr = [];
	for(var i=0; i<dateNum; i++){
		var nextDay = new Date( new Date().getTime() + 1000*60*60*24*(from+i) );
		var month = nextDay.getMonth() + 1;
		var date = nextDay.getDate(); 
		var day = nextDay.getDay();
		var year = nextDay.getFullYear();
		var dtxt = year + '-' + (month<10 ? ('0'+month) : month)+'-'+( date<10? ('0' + date): date );
		var dayTxt = DAY_ARR[day];
		if( from+i  == 0 ){ 
			dayTxt = '今天';
		}else if(from+i==1){
			dayTxt = '明天';
		}else if(from+i==2){
			dayTxt = '后天';
		}

		dateArr.push(  { 'text': dayTxt+'　'+dtxt, 'value' : dtxt } );
	}

	return dateArr;				
};

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

;/**import from `/resource/js/component/jquery/address_select2.js` **/
;(function () {
    var Bang = window.Bang = window.Bang || {}
    Bang.AddressSelect2 = function (trigger, options) {
        return new AddressSelect2(trigger, options)
    }

    function supportLocalStorage() {
        var testKey = 'test',
            storage = window.localStorage
        try {
            storage.setItem(testKey, 'testValue')
            storage.removeItem(testKey)
            return true
        } catch (error) {
            return false
        }
    }

    function __cache(key, val) {
        window.__Cache = window.__Cache || {}
        if (typeof val !== 'undefined') {
            window.__Cache[key] = val
        }
        return window.__Cache[key]
    }

    var isSupportLocalStorage = supportLocalStorage()
    var isSupportJSON = (typeof JSON != 'undefined') && (typeof JSON.stringify == 'function') && (typeof JSON.parse == 'function') ? true : false

    var defaults = {
        // 实例化的时候自动执行init函数
        flagAutoInit: true,
        flagStorage: true,

        container: 'body',
        width: 360,
        height: 'auto',

        url_province: '/api/BasicServer/AdministrativeDivisions/province',
        url_city: '/api/BasicServer/AdministrativeDivisions/city',
        url_district: '/api/BasicServer/AdministrativeDivisions/area',

        // 默认的省、市、区县
        province: '',
        city: '',
        district: '',
        provinceCode: '',
        cityCode: '',
        districtCode: '',

        // 显示级别
        level: 'district', // province表示显示到省，city表示显示到市，district表示显示到区县
        // 默认输出选择的省市区县
        not_render: false,

        onInit: null,
        onShow: null,
        onConfirm: null
    }
    var  // cache省列表
        CacheProvinceList = [],
        // cache市列表
        CacheCityList = {},
        // cache区县列表
        CacheDistrictList = {}

    function AddressSelect2(trigger, options) {
        this.$trigger = $(trigger)
        this.$dropdown = null
        this.options = $.extend({}, defaults, $.isPlainObject(options) && options)
        this.options.onInit = $.isFunction(this.options.onInit) ? this.options.onInit : function () {}
        this.options.onShow = $.isFunction(this.options.onShow) ? this.options.onShow : function () {}
        this.options.onConfirm = $.isFunction(this.options.onConfirm) ? this.options.onConfirm : function () {}
        this.active = false
        this.dems = []

        if (!this.options.flagStorage) {
            this.CacheProvinceList = []
            this.CacheCityList = {}
            this.CacheAreaList = {}
        }

        if (this.options.flagAutoInit) {
            this.init()
        }
    }

    AddressSelect2.prototype = {
        constructor: AddressSelect2,
        init: function () {
            var me = this
            this.options.flagStorage && __restoreData()
            this.defineDems()
            // 获取 $trigger 上的数据，如果有值那么设置到选中值中
            this.setSelectedData(this.getTriggerData())
            this.initData(function (region) {
                me.setSelectedData(region, true)
                me.setTriggerData()
                me.render(region)
                me.bind()
                me.options.onInit(region, me)
            })
            this.active = true
        },
        // 数据初始化
        initData: function (callback) {
            var me = this
            var default_province = me.options.province || '',
                default_city = me.options.city || '',
                default_district = me.options.district || ''

            // 设置默认选中省份城市区县
            me.getProvinceCityDistrictListByName(default_province, default_city, default_district,
                function (region) {
                    $.isFunction(callback) && callback(region, me.$trigger)
                }
            )
        },
        getTriggerData: function () {
            var $trigger = this.$trigger
            var region = {}
            $.each(this.dems, $.proxy(function (i, type) {
                region[type] = $trigger.data(type) || ''
                region[type + 'Code'] = $trigger.data(type + '-code') || ''
            }, this))

            return region
        },
        setTriggerData: function () {
            var $trigger = this.$trigger
            var region = this.getSelectedData()
            $.each(this.dems, $.proxy(function (i, type) {
                $trigger.data(type, region[type] || '')
                $trigger.data(type + '-code', region[type + 'Code'] || '')
            }, this))
        },
        // 设置选中数据
        setSelectedData: function (region, force) {
            var type
            if (typeof region === 'string') {
                type = region
                region = force
                force = false
            }
            if (type && region.name && region.code) {
                var pos = this.dems.indexOf(type)
                $.each(this.dems, $.proxy(function (i, type) {
                    if (i === pos) {
                        this.options[type] = region.name
                        this.options[type + 'Code'] = region.code
                    } else if (i > pos) {
                        this.options[type] = ''
                        this.options[type + 'Code'] = ''
                    }
                }, this))
            } else {
                $.each(this.dems, $.proxy(function (i, type) {
                    if (region[type]) {
                        this.options[type] = region[type]
                        this.options[type + 'Code'] = region[type + 'Code']
                    } else if (force) {
                        this.options[type] = ''
                        this.options[type + 'Code'] = ''
                    }
                }, this))
            }
        },
        getSelectedData: function () {
            var region = {}
            $.each(this.dems, $.proxy(function (i, type) {
                region[type] = this.options[type] || ''
                region[type + 'Code'] = this.options[type + 'Code'] || ''
            }, this))
            return region
        },
        // 输出省市区县选择面板
        render: function (region) {
            region = region || {}
            var html_dropdown = '<div class="city-picker-dropdown">' +
                '<div class="city-select-wrap">' +
                '<div class="city-select-tab">' +
                '<a class="active' + (region.province ? ' selected' : '') + '" data-count="province" data-default-text="省份">' + (region.province || '省份') + '</a>' +
                (this.includeDem('city') ? '<a data-count="city" ' + (region.city ? 'class="selected"' : '') + ' data-default-text="城市">' + (region.city || '城市') + '</a>' : '') +
                (this.includeDem('district') ? '<a data-count="district" ' + (region.district ? 'class="selected"' : '') + ' data-default-text="区县">' + (region.district || '区县') + '</a>' : '') +
                '</div>' +
                '<div class="city-select-content">' +
                '<div class="city-select province" data-count="province"></div>' +
                (this.includeDem('city') ? '<div class="city-select city" data-count="city">请先选择省份</div>' : '') +
                (this.includeDem('district') ? '<div class="city-select district" data-count="district">请先选择城市</div>' : '') +
                '</div></div>'

            this.$trigger.addClass('js-trigger-address-select')
            this.$dropdown = $(html_dropdown).appendTo(this.options.container)

            var $selects = this.$dropdown.find('.city-select')
            var $tabs = this.$dropdown.find('.city-select-tab > a')
            $.each(this.dems, $.proxy(function (i, type) {
                this['$' + type] = $selects.filter('.' + type + '')
                this['$' + type + 'Tab'] = $tabs.filter('[data-count="' + type + '"]')
            }, this))
        },

        defineDems: function () {
            var stop = false
            $.each(['province', 'city', 'district'], $.proxy(function (i, type) {
                if (!stop) {
                    this.dems.push(type)
                }
                if (type === this.options.level) {
                    stop = true
                }
            }, this))
        },

        includeDem: function (type) {
            return $.inArray(type, this.dems) !== -1
        },

        getPosition: function () {
            var offset = this.$trigger.offset()
            var size = this.getSize(this.$trigger)
            return {
                top: offset.top || 0,
                left: offset.left || 0,
                width: size.width,
                height: size.height
            }
        },

        getSize: function ($dom) {
            var $wrap, $clone, sizes
            if (!$dom.is(':visible')) {
                $wrap = $('<div />').appendTo($('body'))
                $wrap.css({
                    'position': 'absolute !important',
                    'visibility': 'hidden !important',
                    'display': 'block !important'
                })

                $clone = $dom.clone().appendTo($wrap)

                sizes = {
                    width: $clone.outerWidth(),
                    height: $clone.outerHeight()
                }

                $wrap.remove()
            } else {
                sizes = {
                    width: $dom.outerWidth(),
                    height: $dom.outerHeight()
                }
            }

            return sizes
        },

        bind: function () {
            var me = this

            $(document).on('click', (this._mouteclick = function (e) {
                var $target = $(e.target)
                var $dropdown, $trigger
                if ($target.is('.js-trigger-address-select')) {
                    $trigger = $target
                } else if ($target.is('.js-trigger-address-select *')) {
                    $trigger = $target.closest('.js-trigger-address-select')
                }
                if ($target.is('.city-picker-dropdown')) {
                    $dropdown = $target
                } else if ($target.is('.city-picker-dropdown *')) {
                    $dropdown = $target.parents('.city-picker-dropdown')
                }
                if ((!$trigger && !$dropdown) ||
                    ($trigger && $trigger.get(0) !== me.$trigger.get(0)) ||
                    ($dropdown && $dropdown.get(0) !== me.$dropdown.get(0))) {
                    me.close(true)
                }
            }))

            this.$trigger
                .on('click', function (e) {
                    e.preventDefault()

                    me.setSelectedData(me.getTriggerData())
                    if (me.$dropdown.is(':visible')) {
                        me.close()
                    } else {
                        me.open()
                    }
                })

            this.$dropdown
                .on('click', '.city-select a', function (e) {
                    e.preventDefault()
                    var $me = $(this)
                    var $select = $me.parents('.city-select')
                    var $active = $select.find('a.active')
                    var last = $select.next().length === 0

                    if ($active[0] !== $me[0]) {
                        $active.removeClass('active')
                        $me.addClass('active')
                        var selected = {
                            name: $me.attr('title'),
                            code: $me.data('code')
                        }
                        var type = $select.data('count')
                        me.setSelectedData(type, selected)

                        me['$' + type + 'Tab'].html(selected.name).addClass('selected')
                    }

                    $me.trigger('change.addressSelect2')
                    if (last) {
                        me.close()
                        me.setTriggerData()
                        me.options.onConfirm(me.getSelectedData(), me, $active[0] === $me[0])
                    }
                })
                .on('click', '.city-select-tab a', function (e) {
                    e.preventDefault()
                    if (!$(this).hasClass('active')) {
                        var type = $(this).data('count')
                        me.tab(type)
                    }
                })

            if (this.$province) {
                this.$province.on('change.addressSelect2', (this._changeProvince = $.proxy(function () {
                    this.output('city')
                    this.output('district')
                    this.tab('city')
                }, this)))
            }

            if (this.$city) {
                this.$city.on('change.addressSelect2', (this._changeCity = $.proxy(function () {
                    this.output('district')
                    this.tab('district')
                }, this)))
            }
        },

        unbind: function () {
            $(document).off('click', this._mouteclick)

            this.$trigger.off('click')
            this.$trigger.off('mousedown')

            this.$dropdown.off('click')
            this.$dropdown.off('mousedown')

            if (this.$province) {
                this.$province.off('change.addressSelect2', this._changeProvince)
            }

            if (this.$city) {
                this.$city.off('change.addressSelect2', this._changeCity)
            }
        },

        open: function (type) {
            type = type || 'province'

            var position = this.getPosition()
            this.$dropdown.css({
                width: this.options.width || '360',
                top: position.top + position.height,
                left: position.left
            })

            $.each(this.dems, $.proxy(function (i, type) {
                this.output(type)
            }, this))
            this.tab(type)
            this.$trigger.addClass('open').addClass('focus')
            this.$dropdown.show()
            this.options.onShow(this)
        },

        close: function (blur) {
            this.$dropdown.hide()
            this.$trigger.removeClass('open')
            if (blur) {
                this.$trigger.removeClass('focus')
            }
        },

        output: function (type) {
            var me = this
            var options = me.options
            var $select = me['$' + type]
            var $tab = me['$' + type + 'Tab']

            if (!$select || !$select.length) {
                return
            }

            var selected = {
                name: options[type] || '',
                code: options[type + 'Code'] || ''
            }
            if (selected.code && selected.name) {
                $tab.html(selected.name)
                    .addClass('selected')
            } else {
                $tab.html($tab.data('default-text'))
                    .removeClass('selected')
            }

            var region = me.getSelectedData()
            switch (type) {
                case 'district':
                    region.cityCode &&
                    me.getDistrictList(region.cityCode, function (data) {
                        $select.html(me.getListHtml(data, selected))
                    })
                    break
                case 'city':
                    region.provinceCode &&
                    me.getCityList(region.provinceCode, function (data) {
                        $select.html(me.getListHtml(data, selected))
                    })
                    break
                case 'province':
                default:
                    me.getProvinceList(function (data) {
                        $select.html(me.getListHtml(data, selected))
                    })
            }
        },

        getListHtml: function (data, selected) {
            selected = selected || {}
            var list = []
            list.push('<dl class="clearfix"><dd>')

            $.each(data, function (i, n) {
                list.push(
                    '<a href="#"' +
                    ' title="' + (n.name || '') + '"' +
                    ' data-code="' + (n.code || '') + '"' +
                    ' class="' +
                    (+n.code === +selected.code ? ' active' : '') +
                    '">' +
                    n.name +
                    '</a>')
            })
            list.push('</dd></dl>')

            return list.join('')
        },

        tab: function (type) {
            var $selects = this.$dropdown.find('.city-select')
            var $tabs = this.$dropdown.find('.city-select-tab > a')
            var $select = this['$' + type]
            var $tab = this.$dropdown.find('.city-select-tab > a[data-count="' + type + '"]')
            if ($select) {
                $selects.hide()
                $select.show()
                $tabs.removeClass('active')
                $tab.addClass('active')
            }
        },

        destroy: function () {
            this.unbind()
            this.$trigger.removeClass('js-trigger-address-select')
            this.$dropdown.remove()
        },

        // 省份列表
        getProvinceList: function (callback) {
            var me = this
            var options = me.options
            var url_province = options.url_province
            var province_list = __getProvinceListByCache(me)

            if (province_list && province_list.length) {
                $.isFunction(callback) && callback(province_list)
            } else {
                if (isLoading('KEY_GLOBAL_LOADING_PROVINCE')) {
                    return
                }
                setLoading(true, 'KEY_GLOBAL_LOADING_PROVINCE')

                $.ajax({
                    url: url_province,
                    type: 'GET',
                    dataType: 'json',
                    success: function (res) {
                        if (!res['errCode']) {
                            var data = res['data']
                            if (!$.isArray(data)) {
                                var _data = []
                                $.each(data, function (code, name) {
                                    _data.push({
                                        code: code,
                                        name: name
                                    })
                                })
                                data = _data
                            }
                            __storeProvinceList(data, me)

                            $.isFunction(callback) && callback(data)
                        } else {
                            // do nothing
                        }
                    },
                    complete: function () {
                        setLoading(false, 'KEY_GLOBAL_LOADING_PROVINCE')
                    }
                })
            }
        },
        // 城市列表
        getCityList: function (provinceCode, callback) {
            if (!provinceCode) {
                return
            }
            var me = this
            var options = me.options
            var url_city = options.url_city
            var city_list = __getCityListByCache(provinceCode, me)
            if (city_list && city_list.length) {
                $.isFunction(callback) && callback(city_list)
            } else {
                if (isLoading('KEY_GLOBAL_LOADING_CITY')) {
                    return
                }
                setLoading(true, 'KEY_GLOBAL_LOADING_CITY')

                $.ajax({
                    url: url_city,
                    type: 'GET',
                    data: {
                        provinceCode: provinceCode
                    },
                    dataType: 'json',
                    success: function (res) {
                        if (!res['errCode']) {
                            var data = res['data']
                            if (!$.isArray(data)) {
                                var _data = []
                                $.each(data, function (code, name) {
                                    _data.push({
                                        code: code,
                                        name: name
                                    })
                                })
                                data = _data
                            }
                            __storeCityList(provinceCode, data, me)

                            $.isFunction(callback) && callback(data)
                        } else {
                            // do nothing
                        }
                    },
                    complete: function () {
                        setLoading(false, 'KEY_GLOBAL_LOADING_CITY')
                    }
                })
            }
        },
        // 区县列表
        getDistrictList: function (cityCode, callback) {
            if (!cityCode) {
                return
            }
            var me = this
            var options = me.options
            var url_district = options.url_district
            var district_list = __getDistrictListByCache(cityCode, me)

            if (district_list && district_list.length) {
                $.isFunction(callback) && callback(district_list)
            } else {
                if (isLoading('KEY_GLOBAL_LOADING_DISTRICT')) {
                    return
                }
                setLoading(true, 'KEY_GLOBAL_LOADING_DISTRICT')

                $.ajax({
                    url: url_district,
                    type: 'GET',
                    data: {cityCode: cityCode},
                    dataType: 'json',
                    success: function (res) {
                        if (!res['errCode']) {
                            var data = res['data']
                            if (!$.isArray(data)) {
                                var _data = []
                                $.each(data, function (code, name) {
                                    _data.push({
                                        code: code,
                                        name: name
                                    })
                                })
                                data = _data
                            }
                            __storeDistrictList(cityCode, data, me)

                            $.isFunction(callback) && callback(data)
                        } else {
                            // do nothing
                        }
                    },
                    complete: function () {
                        setLoading(false, 'KEY_GLOBAL_LOADING_DISTRICT')
                    }
                })
            }
        },
        // 根据省市区县名称，获取省市区县信息（包括编码）以及列表
        getProvinceCityDistrictListByName: function (province, city, district, callback) {
            var me = this
            var region = {}
            var provinceCityDistrict = {}
            // 获取省份列表
            me.getProvinceList(function (provinceList) {
                var provinceCode = __getProvinceCodeByName(province, provinceList)
                provinceCityDistrict.provinceList = provinceList
                region.province = province
                region.provinceCode = provinceCode

                if (me.includeDem('city') && provinceCode) {
                    // 获取城市列表
                    me.getCityList(provinceCode, function (cityList) {
                        var cityCode = __getCityCodeByName(city, cityList)
                        provinceCityDistrict.cityList = cityList
                        region.city = city
                        region.cityCode = cityCode

                        if (me.includeDem('district') && cityCode) {
                            // 获取区县列表
                            me.getDistrictList(cityCode, function (districtList) {
                                var districtCode = __getDistrictCodeByName(district, districtList)
                                provinceCityDistrict.districtList = districtList
                                region.district = district
                                region.districtCode = districtCode

                                // 执行回调
                                $.isFunction(callback) && callback(region, provinceCityDistrict)
                            })
                        } else {
                            // 执行回调
                            $.isFunction(callback) && callback(region, provinceCityDistrict)
                        }
                    })
                } else {
                    // 执行回调
                    $.isFunction(callback) && callback(region, provinceCityDistrict)
                }
            })
        }
    }

    //================= private ===================

    function __restoreData() {
        if (isSupportLocalStorage && isSupportJSON) {
            var storage = window.localStorage

            CacheProvinceList = JSON.parse(storage.getItem('TCB_HS_ProvinceList2') || '[]')
            CacheCityList = JSON.parse(storage.getItem('TCB_HS_CityList2') || '{}')
            CacheDistrictList = JSON.parse(storage.getItem('TCB_HS_DistrictList2') || '{}')
        }
    }

    // 存储省份列表
    function __storeProvinceList(ProvinceList, inst) {
        if (!(ProvinceList && ProvinceList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheProvinceList = ProvinceList
        }
        CacheProvinceList = ProvinceList
        if (isSupportLocalStorage && isSupportJSON) {
            var storage = window.localStorage
            storage.setItem('TCB_HS_ProvinceList2', JSON.stringify(CacheProvinceList))
        }
        return CacheProvinceList
    }

    // 存储城市列表
    function __storeCityList(provinceCode, CityList, inst) {
        if (!(CityList && CityList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheCityList[provinceCode] = CityList
        }
        CacheCityList[provinceCode] = CityList
        if (isSupportLocalStorage && isSupportJSON) {
            var storage = window.localStorage
            storage.setItem('TCB_HS_CityList2', JSON.stringify(CacheCityList))
        }

        return CacheCityList[provinceCode]
    }

    // 存储区县列表
    function __storeDistrictList(cityCode, DistrictList, inst) {
        if (!(DistrictList && DistrictList.length)) {
            return
        }
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheDistrictList[cityCode] = DistrictList
        }
        CacheDistrictList[cityCode] = DistrictList
        if (isSupportLocalStorage && isSupportJSON) {
            var storage = window.localStorage
            storage.setItem('TCB_HS_DistrictList2', JSON.stringify(CacheDistrictList))
        }
        return CacheDistrictList[cityCode]
    }

    // cache中获取省份列表
    function __getProvinceListByCache(inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheProvinceList
        }
        return CacheProvinceList
    }

    // cache中获取城市列表
    function __getCityListByCache(provinceCode, inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheCityList[provinceCode]
        }
        return CacheCityList[provinceCode]
    }

    // cache中获取区县列表
    function __getDistrictListByCache(cityCode, inst) {
        var options = inst.options || {}
        var flagStorage = options.flagStorage
        if (!flagStorage) {
            return inst.CacheDistrictList[cityCode]
        }
        return CacheDistrictList[cityCode]
    }

    // 根据省份名称，获取省份code
    function __getProvinceCodeByName(province_name, province_list) {
        if (!(province_name && $.isArray(province_list))) {
            return
        }
        var provinceCode
        $.each(province_list, function (i, item) {
            if (province_name == item['name']) {
                provinceCode = item['code']

                return false
            }
        })

        return provinceCode
    }

    // 根据城市名称，获取城市code
    function __getCityCodeByName(city_name, city_list) {
        if (!(city_name && $.isArray(city_list))) {
            return
        }
        var cityCode
        $.each(city_list, function (i, item) {
            if (city_name == item['name']) {
                cityCode = item['code']

                return false
            }
        })

        return cityCode
    }

    // 根据城市名称，获取区县code
    function __getDistrictCodeByName(district_name, district_list) {
        if (!(district_name && $.isArray(district_list))) {
            return
        }
        var districtCode
        $.each(district_list, function (i, item) {
            if (district_name == item['name']) {
                districtCode = item['code']

                return false
            }
        })

        return districtCode
    }

    /**
     * 加载中
     * @returns {boolean}
     */
    function isLoading(key) {
        key = key || 'KEY_GLOBAL_LOADING'
        return __cache(key)
            ? true
            : false
    }

    /**
     * 设置加载状态
     * @param flag
     * @returns {boolean}
     */
    function setLoading(flag, key) {
        flag = flag
            ? true
            : false
        key = key || 'KEY_GLOBAL_LOADING'

        return __cache(key, flag)
    }

}())


;/**import from `/resource/js/lib/idangerous.swiper.js` **/
var Swiper = function (selector, params) {
    'use strict';

    /*=========================
      A little bit dirty but required part for IE8 and old FF support
      ===========================
    */
    if (!document.body.outerHTML && document.body.__defineGetter__) {
        if (HTMLElement) {
            var element = HTMLElement.prototype;
            if (element.__defineGetter__) {
                element.__defineGetter__('outerHTML', function () { return new XMLSerializer().serializeToString(this); });
            }
        }
    }

    if (!window.getComputedStyle) {
        window.getComputedStyle = function (el, pseudo) {
            this.el = el;
            this.getPropertyValue = function (prop) {
                var re = /(\-([a-z]){1})/g;
                if (prop === 'float') prop = 'styleFloat';
                if (re.test(prop)) {
                    prop = prop.replace(re, function () {
                        return arguments[2].toUpperCase();
                    });
                }
                return el.currentStyle[prop] ? el.currentStyle[prop] : null;
            };
            return this;
        };
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) { return i; }
            }
            return -1;
        };
    }
    if (!document.querySelectorAll) {
        if (!window.jQuery) return;
    }
    function $$(selector, context) {
        if (document.querySelectorAll)
            return (context || document).querySelectorAll(selector);
        else
            return jQuery(selector, context);
    }

    /*=========================
      Check for correct selector
      ===========================*/
    if (typeof selector === 'undefined') return;

    if (!(selector.nodeType)) {
        if ($$(selector).length === 0) return;
    }

     /*=========================
      _this
      ===========================*/
    var _this = this;

     /*=========================
      Default Flags and vars
      ===========================*/
    _this.touches = {
        start: 0,
        startX: 0,
        startY: 0,
        current: 0,
        currentX: 0,
        currentY: 0,
        diff: 0,
        abs: 0
    };
    _this.positions = {
        start: 0,
        abs: 0,
        diff: 0,
        current: 0
    };
    _this.times = {
        start: 0,
        end: 0
    };

    _this.id = (new Date()).getTime();
    _this.container = (selector.nodeType) ? selector : $$(selector)[0];
    _this.isTouched = false;
    _this.isMoved = false;
    _this.activeIndex = 0;
    _this.centerIndex = 0;
    _this.activeLoaderIndex = 0;
    _this.activeLoopIndex = 0;
    _this.previousIndex = null;
    _this.velocity = 0;
    _this.snapGrid = [];
    _this.slidesGrid = [];
    _this.imagesToLoad = [];
    _this.imagesLoaded = 0;
    _this.wrapperLeft = 0;
    _this.wrapperRight = 0;
    _this.wrapperTop = 0;
    _this.wrapperBottom = 0;
    _this.isAndroid = navigator.userAgent.toLowerCase().indexOf('android') >= 0;
    var wrapper, slideSize, wrapperSize, direction, isScrolling, containerSize;

    /*=========================
      Default Parameters
      ===========================*/
    var defaults = {
        eventTarget: 'wrapper', // or 'container'
        mode : 'horizontal', // or 'vertical'
        touchRatio : 1,
        speed : 300,
        freeMode : false,
        freeModeFluid : false,
        momentumRatio: 1,
        momentumBounce: true,
        momentumBounceRatio: 1,
        slidesPerView : 1,
        slidesPerGroup : 1,
        slidesPerViewFit: true, //Fit to slide when spv "auto" and slides larger than container
        simulateTouch : true,
        followFinger : true,
        shortSwipes : true,
        longSwipesRatio: 0.5,
        moveStartThreshold: false,
        onlyExternal : false,
        createPagination : true,
        pagination : false,
        paginationElement: 'span',
        paginationClickable: false,
        paginationAsRange: true,
        resistance : true, // or false or 100%
        scrollContainer : false,
        preventLinks : true,
        preventLinksPropagation: false,
        noSwiping : false, // or class
        noSwipingClass : 'swiper-no-swiping', //:)
        initialSlide: 0,
        keyboardControl: false,
        mousewheelControl : false,
        mousewheelControlForceToAxis : false,
        useCSS3Transforms : true,
        // Autoplay
        autoplay: false,
        autoplayDisableOnInteraction: true,
        autoplayStopOnLast: false,
        //Loop mode
        loop: false,
        loopAdditionalSlides: 0,
        // Round length values
        roundLengths: false,
        //Auto Height
        calculateHeight: false,
        //Apply CSS for width and/or height
        cssWidthAndHeight: false, // or true or 'width' or 'height'
        //Images Preloader
        updateOnImagesReady : true,
        //Form elements
        releaseFormElements : true,
        //Watch for active slide, useful when use effects on different slide states
        watchActiveIndex: false,
        //Slides Visibility Fit
        visibilityFullFit : false,
        //Slides Offset
        offsetPxBefore : 0,
        offsetPxAfter : 0,
        offsetSlidesBefore : 0,
        offsetSlidesAfter : 0,
        centeredSlides: false,
        //Queue callbacks
        queueStartCallbacks : false,
        queueEndCallbacks : false,
        //Auto Resize
        autoResize : true,
        resizeReInit : false,
        //DOMAnimation
        DOMAnimation : true,
        //Slides Loader
        loader: {
            slides: [], //array with slides
            slidesHTMLType: 'inner', // or 'outer'
            surroundGroups: 1, //keep preloaded slides groups around view
            logic: 'reload', //or 'change'
            loadAllSlides: false
        },
        // One way swipes
        swipeToPrev: true,
        swipeToNext: true,
        //Namespace
        slideElement: 'div',
        slideClass: 'swiper-slide',
        slideActiveClass: 'swiper-slide-active',
        slideVisibleClass: 'swiper-slide-visible',
        slideDuplicateClass: 'swiper-slide-duplicate',
        wrapperClass: 'swiper-wrapper',
        paginationElementClass: 'swiper-pagination-switch',
        paginationActiveClass: 'swiper-active-switch',
        paginationVisibleClass: 'swiper-visible-switch'
    };
    params = params || {};
    for (var prop in defaults) {
        if (prop in params && typeof params[prop] === 'object') {
            for (var subProp in defaults[prop]) {
                if (! (subProp in params[prop])) {
                    params[prop][subProp] = defaults[prop][subProp];
                }
            }
        }
        else if (! (prop in params)) {
            params[prop] = defaults[prop];
        }
    }
    _this.params = params;
    if (params.scrollContainer) {
        params.freeMode = true;
        params.freeModeFluid = true;
    }
    if (params.loop) {
        params.resistance = '100%';
    }
    var isH = params.mode === 'horizontal';

    /*=========================
      Define Touch Events
      ===========================*/
    var desktopEvents = ['mousedown', 'mousemove', 'mouseup'];
    if (_this.browser.ie10) desktopEvents = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp'];
    if (_this.browser.ie11) desktopEvents = ['pointerdown', 'pointermove', 'pointerup'];

    _this.touchEvents = {
        touchStart : _this.support.touch || !params.simulateTouch  ? 'touchstart' : desktopEvents[0],
        touchMove : _this.support.touch || !params.simulateTouch ? 'touchmove' : desktopEvents[1],
        touchEnd : _this.support.touch || !params.simulateTouch ? 'touchend' : desktopEvents[2]
    };

    /*=========================
      Wrapper
      ===========================*/
    for (var i = _this.container.childNodes.length - 1; i >= 0; i--) {
        if (_this.container.childNodes[i].className) {
            var _wrapperClasses = _this.container.childNodes[i].className.split(/\s+/);
            for (var j = 0; j < _wrapperClasses.length; j++) {
                if (_wrapperClasses[j] === params.wrapperClass) {
                    wrapper = _this.container.childNodes[i];
                }
            }
        }
    }

    _this.wrapper = wrapper;
    /*=========================
      Slide API
      ===========================*/
    _this._extendSwiperSlide = function  (el) {
        el.append = function () {
            if (params.loop) {
                el.insertAfter(_this.slides.length - _this.loopedSlides);
            }
            else {
                _this.wrapper.appendChild(el);
                _this.reInit();
            }

            return el;
        };
        el.prepend = function () {
            if (params.loop) {
                _this.wrapper.insertBefore(el, _this.slides[_this.loopedSlides]);
                _this.removeLoopedSlides();
                _this.calcSlides();
                _this.createLoop();
            }
            else {
                _this.wrapper.insertBefore(el, _this.wrapper.firstChild);
            }
            _this.reInit();
            return el;
        };
        el.insertAfter = function (index) {
            if (typeof index === 'undefined') return false;
            var beforeSlide;

            if (params.loop) {
                beforeSlide = _this.slides[index + 1 + _this.loopedSlides];
                if (beforeSlide) {
                    _this.wrapper.insertBefore(el, beforeSlide);
                }
                else {
                    _this.wrapper.appendChild(el);
                }
                _this.removeLoopedSlides();
                _this.calcSlides();
                _this.createLoop();
            }
            else {
                beforeSlide = _this.slides[index + 1];
                _this.wrapper.insertBefore(el, beforeSlide);
            }
            _this.reInit();
            return el;
        };
        el.clone = function () {
            return _this._extendSwiperSlide(el.cloneNode(true));
        };
        el.remove = function () {
            _this.wrapper.removeChild(el);
            _this.reInit();
        };
        el.html = function (html) {
            if (typeof html === 'undefined') {
                return el.innerHTML;
            }
            else {
                el.innerHTML = html;
                return el;
            }
        };
        el.index = function () {
            var index;
            for (var i = _this.slides.length - 1; i >= 0; i--) {
                if (el === _this.slides[i]) index = i;
            }
            return index;
        };
        el.isActive = function () {
            if (el.index() === _this.activeIndex) return true;
            else return false;
        };
        if (!el.swiperSlideDataStorage) el.swiperSlideDataStorage = {};
        el.getData = function (name) {
            return el.swiperSlideDataStorage[name];
        };
        el.setData = function (name, value) {
            el.swiperSlideDataStorage[name] = value;
            return el;
        };
        el.data = function (name, value) {
            if (typeof value === 'undefined') {
                return el.getAttribute('data-' + name);
            }
            else {
                el.setAttribute('data-' + name, value);
                return el;
            }
        };
        el.getWidth = function (outer, round) {
            return _this.h.getWidth(el, outer, round);
        };
        el.getHeight = function (outer, round) {
            return _this.h.getHeight(el, outer, round);
        };
        el.getOffset = function () {
            return _this.h.getOffset(el);
        };
        return el;
    };

    //Calculate information about number of slides
    _this.calcSlides = function (forceCalcSlides) {
        var oldNumber = _this.slides ? _this.slides.length : false;
        _this.slides = [];
        _this.displaySlides = [];
        for (var i = 0; i < _this.wrapper.childNodes.length; i++) {
            if (_this.wrapper.childNodes[i].className) {
                var _className = _this.wrapper.childNodes[i].className;
                var _slideClasses = _className.split(/\s+/);
                for (var j = 0; j < _slideClasses.length; j++) {
                    if (_slideClasses[j] === params.slideClass) {
                        _this.slides.push(_this.wrapper.childNodes[i]);
                    }
                }
            }
        }
        for (i = _this.slides.length - 1; i >= 0; i--) {
            _this._extendSwiperSlide(_this.slides[i]);
        }
        if (oldNumber === false) return;
        if (oldNumber !== _this.slides.length || forceCalcSlides) {

            // Number of slides has been changed
            removeSlideEvents();
            addSlideEvents();
            _this.updateActiveSlide();
            if (_this.params.pagination) _this.createPagination();
            _this.callPlugins('numberOfSlidesChanged');
        }
    };

    //Create Slide
    _this.createSlide = function (html, slideClassList, el) {
        slideClassList = slideClassList || _this.params.slideClass;
        el = el || params.slideElement;
        var newSlide = document.createElement(el);
        newSlide.innerHTML = html || '';
        newSlide.className = slideClassList;
        return _this._extendSwiperSlide(newSlide);
    };

    //Append Slide
    _this.appendSlide = function (html, slideClassList, el) {
        if (!html) return;
        if (html.nodeType) {
            return _this._extendSwiperSlide(html).append();
        }
        else {
            return _this.createSlide(html, slideClassList, el).append();
        }
    };
    _this.prependSlide = function (html, slideClassList, el) {
        if (!html) return;
        if (html.nodeType) {
            return _this._extendSwiperSlide(html).prepend();
        }
        else {
            return _this.createSlide(html, slideClassList, el).prepend();
        }
    };
    _this.insertSlideAfter = function (index, html, slideClassList, el) {
        if (typeof index === 'undefined') return false;
        if (html.nodeType) {
            return _this._extendSwiperSlide(html).insertAfter(index);
        }
        else {
            return _this.createSlide(html, slideClassList, el).insertAfter(index);
        }
    };
    _this.removeSlide = function (index) {
        if (_this.slides[index]) {
            if (params.loop) {
                if (!_this.slides[index + _this.loopedSlides]) return false;
                _this.slides[index + _this.loopedSlides].remove();
                _this.removeLoopedSlides();
                _this.calcSlides();
                _this.createLoop();
            }
            else _this.slides[index].remove();
            return true;
        }
        else return false;
    };
    _this.removeLastSlide = function () {
        if (_this.slides.length > 0) {
            if (params.loop) {
                _this.slides[_this.slides.length - 1 - _this.loopedSlides].remove();
                _this.removeLoopedSlides();
                _this.calcSlides();
                _this.createLoop();
            }
            else _this.slides[_this.slides.length - 1].remove();
            return true;
        }
        else {
            return false;
        }
    };
    _this.removeAllSlides = function () {
        var num = _this.slides.length;
        for (var i = _this.slides.length - 1; i >= 0; i--) {
            _this.slides[i].remove();
            if (i === num - 1) {
                _this.setWrapperTranslate(0);
            }
        }
    };
    _this.getSlide = function (index) {
        return _this.slides[index];
    };
    _this.getLastSlide = function () {
        return _this.slides[_this.slides.length - 1];
    };
    _this.getFirstSlide = function () {
        return _this.slides[0];
    };

    //Currently Active Slide
    _this.activeSlide = function () {
        return _this.slides[_this.activeIndex];
    };

    /*=========================
     Wrapper for Callbacks : Allows additive callbacks via function arrays
     ===========================*/
    _this.fireCallback = function () {
        var callback = arguments[0];
        if (Object.prototype.toString.call(callback) === '[object Array]') {
            for (var i = 0; i < callback.length; i++) {
                if (typeof callback[i] === 'function') {
                    callback[i](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                }
            }
        } else if (Object.prototype.toString.call(callback) === '[object String]') {
            if (params['on' + callback]) _this.fireCallback(params['on' + callback], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        } else {
            callback(arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        }
    };
    function isArray(obj) {
        if (Object.prototype.toString.apply(obj) === '[object Array]') return true;
        return false;
    }

    /**
     * Allows user to add callbacks, rather than replace them
     * @param callback
     * @param func
     * @return {*}
     */
    _this.addCallback = function (callback, func) {
        var _this = this, tempFunc;
        if (_this.params['on' + callback]) {
            if (isArray(this.params['on' + callback])) {
                return this.params['on' + callback].push(func);
            } else if (typeof this.params['on' + callback] === 'function') {
                tempFunc = this.params['on' + callback];
                this.params['on' + callback] = [];
                this.params['on' + callback].push(tempFunc);
                return this.params['on' + callback].push(func);
            }
        } else {
            this.params['on' + callback] = [];
            return this.params['on' + callback].push(func);
        }
    };
    _this.removeCallbacks = function (callback) {
        if (_this.params['on' + callback]) {
            _this.params['on' + callback] = null;
        }
    };

    /*=========================
      Plugins API
      ===========================*/
    var _plugins = [];
    for (var plugin in _this.plugins) {
        if (params[plugin]) {
            var p = _this.plugins[plugin](_this, params[plugin]);
            if (p) _plugins.push(p);
        }
    }
    _this.callPlugins = function (method, args) {
        if (!args) args = {};
        for (var i = 0; i < _plugins.length; i++) {
            if (method in _plugins[i]) {
                _plugins[i][method](args);
            }
        }
    };

    /*=========================
      Windows Phone 8 Fix
      ===========================*/
    if ((_this.browser.ie10 || _this.browser.ie11) && !params.onlyExternal) {
        _this.wrapper.classList.add('swiper-wp8-' + (isH ? 'horizontal' : 'vertical'));
    }

    /*=========================
      Free Mode Class
      ===========================*/
    if (params.freeMode) {
        _this.container.className += ' swiper-free-mode';
    }

    /*==================================================
        Init/Re-init/Resize Fix
    ====================================================*/
    _this.initialized = false;
    _this.init = function (force, forceCalcSlides) {
        var _width = _this.h.getWidth(_this.container, false, params.roundLengths);
        var _height = _this.h.getHeight(_this.container, false, params.roundLengths);
        if (_width === _this.width && _height === _this.height && !force) return;

        _this.width = _width;
        _this.height = _height;

        var slideWidth, slideHeight, slideMaxHeight, wrapperWidth, wrapperHeight, slideLeft;
        var i; // loop index variable to avoid JSHint W004 / W038
        containerSize = isH ? _width : _height;
        var wrapper = _this.wrapper;

        if (force) {
            _this.calcSlides(forceCalcSlides);
        }

        if (params.slidesPerView === 'auto') {
            //Auto mode
            var slidesWidth = 0;
            var slidesHeight = 0;

            //Unset Styles
            if (params.slidesOffset > 0) {
                wrapper.style.paddingLeft = '';
                wrapper.style.paddingRight = '';
                wrapper.style.paddingTop = '';
                wrapper.style.paddingBottom = '';
            }
            wrapper.style.width = '';
            wrapper.style.height = '';
            if (params.offsetPxBefore > 0) {
                if (isH) _this.wrapperLeft = params.offsetPxBefore;
                else _this.wrapperTop = params.offsetPxBefore;
            }
            if (params.offsetPxAfter > 0) {
                if (isH) _this.wrapperRight = params.offsetPxAfter;
                else _this.wrapperBottom = params.offsetPxAfter;
            }

            if (params.centeredSlides) {
                if (isH) {
                    _this.wrapperLeft = (containerSize - this.slides[0].getWidth(true, params.roundLengths)) / 2;
                    _this.wrapperRight = (containerSize - _this.slides[_this.slides.length - 1].getWidth(true, params.roundLengths)) / 2;
                }
                else {
                    _this.wrapperTop = (containerSize - _this.slides[0].getHeight(true, params.roundLengths)) / 2;
                    _this.wrapperBottom = (containerSize - _this.slides[_this.slides.length - 1].getHeight(true, params.roundLengths)) / 2;
                }
            }

            if (isH) {
                if (_this.wrapperLeft >= 0) wrapper.style.paddingLeft = _this.wrapperLeft + 'px';
                if (_this.wrapperRight >= 0) wrapper.style.paddingRight = _this.wrapperRight + 'px';
            }
            else {
                if (_this.wrapperTop >= 0) wrapper.style.paddingTop = _this.wrapperTop + 'px';
                if (_this.wrapperBottom >= 0) wrapper.style.paddingBottom = _this.wrapperBottom + 'px';
            }
            slideLeft = 0;
            var centeredSlideLeft = 0;
            _this.snapGrid = [];
            _this.slidesGrid = [];

            slideMaxHeight = 0;
            for (i = 0; i < _this.slides.length; i++) {
                slideWidth = _this.slides[i].getWidth(true, params.roundLengths);
                slideHeight = _this.slides[i].getHeight(true, params.roundLengths);
                if (params.calculateHeight) {
                    slideMaxHeight = Math.max(slideMaxHeight, slideHeight);
                }
                var _slideSize = isH ? slideWidth : slideHeight;
                if (params.centeredSlides) {
                    var nextSlideWidth = i === _this.slides.length - 1 ? 0 : _this.slides[i + 1].getWidth(true, params.roundLengths);
                    var nextSlideHeight = i === _this.slides.length - 1 ? 0 : _this.slides[i + 1].getHeight(true, params.roundLengths);
                    var nextSlideSize = isH ? nextSlideWidth : nextSlideHeight;
                    if (_slideSize > containerSize) {
                        if (params.slidesPerViewFit) {
                            _this.snapGrid.push(slideLeft + _this.wrapperLeft);
                            _this.snapGrid.push(slideLeft + _slideSize - containerSize + _this.wrapperLeft);
                        }
                        else {
                            for (var j = 0; j <= Math.floor(_slideSize / (containerSize + _this.wrapperLeft)); j++) {
                                if (j === 0) _this.snapGrid.push(slideLeft + _this.wrapperLeft);
                                else _this.snapGrid.push(slideLeft + _this.wrapperLeft + containerSize * j);
                            }
                        }
                        _this.slidesGrid.push(slideLeft + _this.wrapperLeft);
                    }
                    else {
                        _this.snapGrid.push(centeredSlideLeft);
                        _this.slidesGrid.push(centeredSlideLeft);
                    }
                    centeredSlideLeft += _slideSize / 2 + nextSlideSize / 2;
                }
                else {
                    if (_slideSize > containerSize) {
                        if (params.slidesPerViewFit) {
                            _this.snapGrid.push(slideLeft);
                            _this.snapGrid.push(slideLeft + _slideSize - containerSize);
                        }
                        else {
                            if (containerSize !== 0) {
                                for (var k = 0; k <= Math.floor(_slideSize / containerSize); k++) {
                                    _this.snapGrid.push(slideLeft + containerSize * k);
                                }
                            }
                            else {
                                _this.snapGrid.push(slideLeft);
                            }
                        }

                    }
                    else {
                        _this.snapGrid.push(slideLeft);
                    }
                    _this.slidesGrid.push(slideLeft);
                }

                slideLeft += _slideSize;

                slidesWidth += slideWidth;
                slidesHeight += slideHeight;
            }
            if (params.calculateHeight) _this.height = slideMaxHeight;
            if (isH) {
                wrapperSize = slidesWidth + _this.wrapperRight + _this.wrapperLeft;
                if (!params.cssWidthAndHeight || params.cssWidthAndHeight === 'height') {
                    wrapper.style.width = (slidesWidth) + 'px';
                }
                if (!params.cssWidthAndHeight || params.cssWidthAndHeight === 'width') {
                    wrapper.style.height = (_this.height) + 'px';
                }
            }
            else {
                if (!params.cssWidthAndHeight || params.cssWidthAndHeight === 'height') {
                    wrapper.style.width = (_this.width) + 'px';
                }
                if (!params.cssWidthAndHeight || params.cssWidthAndHeight === 'width') {
                    wrapper.style.height = (slidesHeight) + 'px';
                }
                wrapperSize = slidesHeight + _this.wrapperTop + _this.wrapperBottom;
            }

        }
        else if (params.scrollContainer) {
            //Scroll Container
            wrapper.style.width = '';
            wrapper.style.height = '';
            wrapperWidth = _this.slides[0].getWidth(true, params.roundLengths);
            wrapperHeight = _this.slides[0].getHeight(true, params.roundLengths);
            wrapperSize = isH ? wrapperWidth : wrapperHeight;
            wrapper.style.width = wrapperWidth + 'px';
            wrapper.style.height = wrapperHeight + 'px';
            slideSize = isH ? wrapperWidth : wrapperHeight;

        }
        else {
            //For usual slides
            if (params.calculateHeight) {
                slideMaxHeight = 0;
                wrapperHeight = 0;
                //ResetWrapperSize
                if (!isH) _this.container.style.height = '';
                wrapper.style.height = '';

                for (i = 0; i < _this.slides.length; i++) {
                    //ResetSlideSize
                    _this.slides[i].style.height = '';
                    slideMaxHeight = Math.max(_this.slides[i].getHeight(true), slideMaxHeight);
                    if (!isH) wrapperHeight += _this.slides[i].getHeight(true);
                }
                slideHeight = slideMaxHeight;
                _this.height = slideHeight;

                if (isH) wrapperHeight = slideHeight;
                else {
                    containerSize = slideHeight;
                    _this.container.style.height = containerSize + 'px';
                }
            }
            else {
                slideHeight = isH ? _this.height : _this.height / params.slidesPerView;
                if (params.roundLengths) slideHeight = Math.ceil(slideHeight);
                wrapperHeight = isH ? _this.height : _this.slides.length * slideHeight;
            }
            slideWidth = isH ? _this.width / params.slidesPerView : _this.width;
            if (params.roundLengths) slideWidth = Math.ceil(slideWidth);
            wrapperWidth = isH ? _this.slides.length * slideWidth : _this.width;
            slideSize = isH ? slideWidth : slideHeight;

            if (params.offsetSlidesBefore > 0) {
                if (isH) _this.wrapperLeft = slideSize * params.offsetSlidesBefore;
                else _this.wrapperTop = slideSize * params.offsetSlidesBefore;
            }
            if (params.offsetSlidesAfter > 0) {
                if (isH) _this.wrapperRight = slideSize * params.offsetSlidesAfter;
                else _this.wrapperBottom = slideSize * params.offsetSlidesAfter;
            }
            if (params.offsetPxBefore > 0) {
                if (isH) _this.wrapperLeft = params.offsetPxBefore;
                else _this.wrapperTop = params.offsetPxBefore;
            }
            if (params.offsetPxAfter > 0) {
                if (isH) _this.wrapperRight = params.offsetPxAfter;
                else _this.wrapperBottom = params.offsetPxAfter;
            }
            if (params.centeredSlides) {
                if (isH) {
                    _this.wrapperLeft = (containerSize - slideSize) / 2;
                    _this.wrapperRight = (containerSize - slideSize) / 2;
                }
                else {
                    _this.wrapperTop = (containerSize - slideSize) / 2;
                    _this.wrapperBottom = (containerSize - slideSize) / 2;
                }
            }
            if (isH) {
                if (_this.wrapperLeft > 0) wrapper.style.paddingLeft = _this.wrapperLeft + 'px';
                if (_this.wrapperRight > 0) wrapper.style.paddingRight = _this.wrapperRight + 'px';
            }
            else {
                if (_this.wrapperTop > 0) wrapper.style.paddingTop = _this.wrapperTop + 'px';
                if (_this.wrapperBottom > 0) wrapper.style.paddingBottom = _this.wrapperBottom + 'px';
            }

            wrapperSize = isH ? wrapperWidth + _this.wrapperRight + _this.wrapperLeft : wrapperHeight + _this.wrapperTop + _this.wrapperBottom;
            if (parseFloat(wrapperWidth) > 0 && (!params.cssWidthAndHeight || params.cssWidthAndHeight === 'height')) {
                wrapper.style.width = wrapperWidth + 'px';
            }
            if (parseFloat(wrapperHeight) > 0 && (!params.cssWidthAndHeight || params.cssWidthAndHeight === 'width')) {
                wrapper.style.height = wrapperHeight + 'px';
            }
            slideLeft = 0;
            _this.snapGrid = [];
            _this.slidesGrid = [];
            for (i = 0; i < _this.slides.length; i++) {
                _this.snapGrid.push(slideLeft);
                _this.slidesGrid.push(slideLeft);
                slideLeft += slideSize;
                if (parseFloat(slideWidth) > 0 && (!params.cssWidthAndHeight || params.cssWidthAndHeight === 'height')) {
                    _this.slides[i].style.width = slideWidth + 'px';
                }
                if (parseFloat(slideHeight) > 0 && (!params.cssWidthAndHeight || params.cssWidthAndHeight === 'width')) {
                    _this.slides[i].style.height = slideHeight + 'px';
                }
            }

        }

        if (!_this.initialized) {
            _this.callPlugins('onFirstInit');
            if (params.onFirstInit) _this.fireCallback(params.onFirstInit, _this);
        }
        else {
            _this.callPlugins('onInit');
            if (params.onInit) _this.fireCallback(params.onInit, _this);
        }
        _this.initialized = true;
    };

    _this.reInit = function (forceCalcSlides) {
        _this.init(true, forceCalcSlides);
    };

    _this.resizeFix = function (reInit) {
        _this.callPlugins('beforeResizeFix');

        _this.init(params.resizeReInit || reInit);

        // swipe to active slide in fixed mode
        if (!params.freeMode) {
            _this.swipeTo((params.loop ? _this.activeLoopIndex : _this.activeIndex), 0, false);
            // Fix autoplay
            if (params.autoplay) {
                if (_this.support.transitions && typeof autoplayTimeoutId !== 'undefined') {
                    if (typeof autoplayTimeoutId !== 'undefined') {
                        clearTimeout(autoplayTimeoutId);
                        autoplayTimeoutId = undefined;
                        _this.startAutoplay();
                    }
                }
                else {
                    if (typeof autoplayIntervalId !== 'undefined') {
                        clearInterval(autoplayIntervalId);
                        autoplayIntervalId = undefined;
                        _this.startAutoplay();
                    }
                }
            }
        }
        // move wrapper to the beginning in free mode
        else if (_this.getWrapperTranslate() < -maxWrapperPosition()) {
            _this.setWrapperTransition(0);
            _this.setWrapperTranslate(-maxWrapperPosition());
        }

        _this.callPlugins('afterResizeFix');
    };

    /*==========================================
        Max and Min Positions
    ============================================*/
    function maxWrapperPosition() {
        var a = (wrapperSize - containerSize);
        if (params.freeMode) {
            a = wrapperSize - containerSize;
        }
        // if (params.loop) a -= containerSize;
        if (params.slidesPerView > _this.slides.length && !params.centeredSlides) {
            a = 0;
        }
        if (a < 0) a = 0;
        return a;
    }

    /*==========================================
        Event Listeners
    ============================================*/
    function initEvents() {
        var bind = _this.h.addEventListener;
        var eventTarget = params.eventTarget === 'wrapper' ? _this.wrapper : _this.container;
        //Touch Events
        if (! (_this.browser.ie10 || _this.browser.ie11)) {
            if (_this.support.touch) {
                bind(eventTarget, 'touchstart', onTouchStart);
                bind(eventTarget, 'touchmove', onTouchMove);
                bind(eventTarget, 'touchend', onTouchEnd);
            }
            if (params.simulateTouch) {
                bind(eventTarget, 'mousedown', onTouchStart);
                bind(document, 'mousemove', onTouchMove);
                bind(document, 'mouseup', onTouchEnd);
            }
        }
        else {
            bind(eventTarget, _this.touchEvents.touchStart, onTouchStart);
            bind(document, _this.touchEvents.touchMove, onTouchMove);
            bind(document, _this.touchEvents.touchEnd, onTouchEnd);
        }

        //Resize Event
        if (params.autoResize) {
            bind(window, 'resize', _this.resizeFix);
        }
        //Slide Events
        addSlideEvents();
        //Mousewheel
        _this._wheelEvent = false;
        if (params.mousewheelControl) {
            if (document.onmousewheel !== undefined) {
                _this._wheelEvent = 'mousewheel';
            }
            if (!_this._wheelEvent) {
                try {
                    new WheelEvent('wheel');
                    _this._wheelEvent = 'wheel';
                } catch (e) {}
            }
            if (!_this._wheelEvent) {
                _this._wheelEvent = 'DOMMouseScroll';
            }
            if (_this._wheelEvent) {
                bind(_this.container, _this._wheelEvent, handleMousewheel);
            }
        }

        //Keyboard
		function _loadImage(img) {
			var image, src;
			var onReady = function () {
				if (typeof _this === 'undefined' || _this === null) return;
				if (_this.imagesLoaded !== undefined) _this.imagesLoaded++;
				if (_this.imagesLoaded === _this.imagesToLoad.length) {
					_this.reInit();
					if (params.onImagesReady) _this.fireCallback(params.onImagesReady, _this);
				}
			};

			if (!img.complete) {
				src = (img.currentSrc || img.getAttribute('src'));
				if (src) {
					image = new Image();
					image.onload = onReady;
					image.onerror = onReady;
					image.src = src;
				} else {
					onReady();
				}

			} else {//image already loaded...
				onReady();
			}
		}

		if (params.keyboardControl) {
			bind(document, 'keydown', handleKeyboardKeys);
		}
		if (params.updateOnImagesReady) {
			_this.imagesToLoad = $$('img', _this.container);

			for (var i = 0; i < _this.imagesToLoad.length; i++) {
				_loadImage(_this.imagesToLoad[i]);
			}
		}
    }

    //Remove Event Listeners
    _this.destroy = function (removeStyles) {
        var unbind = _this.h.removeEventListener;
        var eventTarget = params.eventTarget === 'wrapper' ? _this.wrapper : _this.container;
        //Touch Events
        if (! (_this.browser.ie10 || _this.browser.ie11)) {
            if (_this.support.touch) {
                unbind(eventTarget, 'touchstart', onTouchStart);
                unbind(eventTarget, 'touchmove', onTouchMove);
                unbind(eventTarget, 'touchend', onTouchEnd);
            }
            if (params.simulateTouch) {
                unbind(eventTarget, 'mousedown', onTouchStart);
                unbind(document, 'mousemove', onTouchMove);
                unbind(document, 'mouseup', onTouchEnd);
            }
        }
        else {
            unbind(eventTarget, _this.touchEvents.touchStart, onTouchStart);
            unbind(document, _this.touchEvents.touchMove, onTouchMove);
            unbind(document, _this.touchEvents.touchEnd, onTouchEnd);
        }

        //Resize Event
        if (params.autoResize) {
            unbind(window, 'resize', _this.resizeFix);
        }

        //Init Slide Events
        removeSlideEvents();

        //Pagination
        if (params.paginationClickable) {
            removePaginationEvents();
        }

        //Mousewheel
        if (params.mousewheelControl && _this._wheelEvent) {
            unbind(_this.container, _this._wheelEvent, handleMousewheel);
        }

        //Keyboard
        if (params.keyboardControl) {
            unbind(document, 'keydown', handleKeyboardKeys);
        }

        //Stop autoplay
        if (params.autoplay) {
            _this.stopAutoplay();
        }
        // Remove styles
        if (removeStyles) {
            _this.wrapper.removeAttribute('style');
            for (var i = 0; i < _this.slides.length; i++) {
                _this.slides[i].removeAttribute('style');
            }
        }
        // Plugins
        _this.callPlugins('onDestroy');

        // Check jQuery/Zepto data
        if (window.jQuery && window.jQuery(_this.container).data('swiper')) {
            window.jQuery(_this.container).removeData('swiper');
        }
        if (window.Zepto && window.Zepto(_this.container).data('swiper')) {
            window.Zepto(_this.container).removeData('swiper');
        }

        //Destroy variable
        _this = null;
    };

    function addSlideEvents() {
        var bind = _this.h.addEventListener,
            i;

        //Prevent Links Events
        if (params.preventLinks) {
            var links = $$('a', _this.container);
            for (i = 0; i < links.length; i++) {
                bind(links[i], 'click', preventClick);
            }
        }
        //Release Form Elements
        if (params.releaseFormElements) {
            var formElements = $$('input, textarea, select', _this.container);
            for (i = 0; i < formElements.length; i++) {
                bind(formElements[i], _this.touchEvents.touchStart, releaseForms, true);
                if (_this.support.touch && params.simulateTouch) {
                    bind(formElements[i], 'mousedown', releaseForms, true);
                }
            }
        }

        //Slide Clicks & Touches
        if (params.onSlideClick) {
            for (i = 0; i < _this.slides.length; i++) {
                bind(_this.slides[i], 'click', slideClick);
            }
        }
        if (params.onSlideTouch) {
            for (i = 0; i < _this.slides.length; i++) {
                bind(_this.slides[i], _this.touchEvents.touchStart, slideTouch);
            }
        }
    }
    function removeSlideEvents() {
        var unbind = _this.h.removeEventListener,
            i;

        //Slide Clicks & Touches
        if (params.onSlideClick) {
            for (i = 0; i < _this.slides.length; i++) {
                unbind(_this.slides[i], 'click', slideClick);
            }
        }
        if (params.onSlideTouch) {
            for (i = 0; i < _this.slides.length; i++) {
                unbind(_this.slides[i], _this.touchEvents.touchStart, slideTouch);
            }
        }
        //Release Form Elements
        if (params.releaseFormElements) {
            var formElements = $$('input, textarea, select', _this.container);
            for (i = 0; i < formElements.length; i++) {
                unbind(formElements[i], _this.touchEvents.touchStart, releaseForms, true);
                if (_this.support.touch && params.simulateTouch) {
                    unbind(formElements[i], 'mousedown', releaseForms, true);
                }
            }
        }
        //Prevent Links Events
        if (params.preventLinks) {
            var links = $$('a', _this.container);
            for (i = 0; i < links.length; i++) {
                unbind(links[i], 'click', preventClick);
            }
        }
    }
    /*==========================================
        Keyboard Control
    ============================================*/
    function handleKeyboardKeys(e) {
        var kc = e.keyCode || e.charCode;
        if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
        if (kc === 37 || kc === 39 || kc === 38 || kc === 40) {
            var inView = false;
            //Check that swiper should be inside of visible area of window
            var swiperOffset = _this.h.getOffset(_this.container);
            var scrollLeft = _this.h.windowScroll().left;
            var scrollTop = _this.h.windowScroll().top;
            var windowWidth = _this.h.windowWidth();
            var windowHeight = _this.h.windowHeight();
            var swiperCoord = [
                [swiperOffset.left, swiperOffset.top],
                [swiperOffset.left + _this.width, swiperOffset.top],
                [swiperOffset.left, swiperOffset.top + _this.height],
                [swiperOffset.left + _this.width, swiperOffset.top + _this.height]
            ];
            for (var i = 0; i < swiperCoord.length; i++) {
                var point = swiperCoord[i];
                if (
                    point[0] >= scrollLeft && point[0] <= scrollLeft + windowWidth &&
                    point[1] >= scrollTop && point[1] <= scrollTop + windowHeight
                ) {
                    inView = true;
                }

            }
            if (!inView) return;
        }
        if (isH) {
            if (kc === 37 || kc === 39) {
                if (e.preventDefault) e.preventDefault();
                else e.returnValue = false;
            }
            if (kc === 39) _this.swipeNext();
            if (kc === 37) _this.swipePrev();
        }
        else {
            if (kc === 38 || kc === 40) {
                if (e.preventDefault) e.preventDefault();
                else e.returnValue = false;
            }
            if (kc === 40) _this.swipeNext();
            if (kc === 38) _this.swipePrev();
        }
    }

    _this.disableKeyboardControl = function () {
        params.keyboardControl = false;
        _this.h.removeEventListener(document, 'keydown', handleKeyboardKeys);
    };

    _this.enableKeyboardControl = function () {
        params.keyboardControl = true;
        _this.h.addEventListener(document, 'keydown', handleKeyboardKeys);
    };

    /*==========================================
        Mousewheel Control
    ============================================*/
    var lastScrollTime = (new Date()).getTime();
    function handleMousewheel(e) {
        var we = _this._wheelEvent;
        var delta = 0;

        //Opera & IE
        if (e.detail) delta = -e.detail;
        //WebKits
        else if (we === 'mousewheel') {
            if (params.mousewheelControlForceToAxis) {
                if (isH) {
                    if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY)) delta = e.wheelDeltaX;
                    else return;
                }
                else {
                    if (Math.abs(e.wheelDeltaY) > Math.abs(e.wheelDeltaX)) delta = e.wheelDeltaY;
                    else return;
                }
            }
            else {
                delta = e.wheelDelta;
            }
        }
        //Old FireFox
        else if (we === 'DOMMouseScroll') delta = -e.detail;
        //New FireFox
        else if (we === 'wheel') {
            if (params.mousewheelControlForceToAxis) {
                if (isH) {
                    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) delta = -e.deltaX;
                    else return;
                }
                else {
                    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) delta = -e.deltaY;
                    else return;
                }
            }
            else {
                delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? - e.deltaX : - e.deltaY;
            }
        }

        if (!params.freeMode) {
            if ((new Date()).getTime() - lastScrollTime > 60) {
                if (delta < 0) _this.swipeNext();
                else _this.swipePrev();
            }
            lastScrollTime = (new Date()).getTime();

        }
        else {
            //Freemode or scrollContainer:
            var position = _this.getWrapperTranslate() + delta;

            if (position > 0) position = 0;
            if (position < -maxWrapperPosition()) position = -maxWrapperPosition();

            _this.setWrapperTransition(0);
            _this.setWrapperTranslate(position);
            _this.updateActiveSlide(position);

            // Return page scroll on edge positions
            if (position === 0 || position === -maxWrapperPosition()) return;
        }
        if (params.autoplay) _this.stopAutoplay(true);

        if (e.preventDefault) e.preventDefault();
        else e.returnValue = false;
        return false;
    }
    _this.disableMousewheelControl = function () {
        if (!_this._wheelEvent) return false;
        params.mousewheelControl = false;
        _this.h.removeEventListener(_this.container, _this._wheelEvent, handleMousewheel);
        return true;
    };

    _this.enableMousewheelControl = function () {
        if (!_this._wheelEvent) return false;
        params.mousewheelControl = true;
        _this.h.addEventListener(_this.container, _this._wheelEvent, handleMousewheel);
        return true;
    };

    /*=========================
      Grab Cursor
      ===========================*/
    if (params.grabCursor) {
        var containerStyle = _this.container.style;
        containerStyle.cursor = 'move';
        containerStyle.cursor = 'grab';
        containerStyle.cursor = '-moz-grab';
        containerStyle.cursor = '-webkit-grab';
    }

    /*=========================
      Slides Events Handlers
      ===========================*/

    _this.allowSlideClick = true;
    function slideClick(event) {
        if (_this.allowSlideClick) {
            setClickedSlide(event);
            _this.fireCallback(params.onSlideClick, _this, event);
        }
    }

    function slideTouch(event) {
        setClickedSlide(event);
        _this.fireCallback(params.onSlideTouch, _this, event);
    }

    function setClickedSlide(event) {

        // IE 6-8 support
        if (!event.currentTarget) {
            var element = event.srcElement;
            do {
                if (element.className.indexOf(params.slideClass) > -1) {
                    break;
                }
                element = element.parentNode;
            } while (element);
            _this.clickedSlide = element;
        }
        else {
            _this.clickedSlide = event.currentTarget;
        }

        _this.clickedSlideIndex     = _this.slides.indexOf(_this.clickedSlide);
        _this.clickedSlideLoopIndex = _this.clickedSlideIndex - (_this.loopedSlides || 0);
    }

    _this.allowLinks = true;
    function preventClick(e) {
        if (!_this.allowLinks) {
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
            if (params.preventLinksPropagation && 'stopPropagation' in e) {
                e.stopPropagation();
            }
            return false;
        }
    }
    function releaseForms(e) {
        if (e.stopPropagation) e.stopPropagation();
        else e.returnValue = false;
        return false;

    }

    /*==================================================
        Event Handlers
    ====================================================*/
    var isTouchEvent = false;
    var allowThresholdMove;
    var allowMomentumBounce = true;
    function onTouchStart(event) {
        if (params.preventLinks) _this.allowLinks = true;
        //Exit if slider is already was touched
        if (_this.isTouched || params.onlyExternal) {
            return false;
        }

        // Blur active elements
        var eventTarget = event.target || event.srcElement;
        if (document.activeElement && document.activeElement !== document.body) {
            if (document.activeElement !== eventTarget) document.activeElement.blur();
        }

        // Form tag names
        var formTagNames = ('input select textarea').split(' ');

        // Check for no swiping
        if (params.noSwiping && (eventTarget) && noSwipingSlide(eventTarget)) return false;
        allowMomentumBounce = false;
        //Check For Nested Swipers
        _this.isTouched = true;
        isTouchEvent = event.type === 'touchstart';

        // prevent user enter with right and the swiper move (needs isTouchEvent)
        if (!isTouchEvent && 'which' in event && event.which === 3) {
            _this.isTouched = false;
            return false;
        }

        if (!isTouchEvent || event.targetTouches.length === 1) {
            _this.callPlugins('onTouchStartBegin');
            if (!isTouchEvent && !_this.isAndroid && formTagNames.indexOf(eventTarget.tagName.toLowerCase()) < 0) {

                if (event.preventDefault) event.preventDefault();
                else event.returnValue = false;
            }

            var pageX = isTouchEvent ? event.targetTouches[0].pageX : (event.pageX || event.clientX);
            var pageY = isTouchEvent ? event.targetTouches[0].pageY : (event.pageY || event.clientY);

            //Start Touches to check the scrolling
            _this.touches.startX = _this.touches.currentX = pageX;
            _this.touches.startY = _this.touches.currentY = pageY;

            _this.touches.start = _this.touches.current = isH ? pageX : pageY;

            //Set Transition Time to 0
            _this.setWrapperTransition(0);

            //Get Start Translate Position
            _this.positions.start = _this.positions.current = _this.getWrapperTranslate();

            //Set Transform
            _this.setWrapperTranslate(_this.positions.start);

            //TouchStartTime
            _this.times.start = (new Date()).getTime();

            //Unset Scrolling
            isScrolling = undefined;

            //Set Treshold
            if (params.moveStartThreshold > 0) {
                allowThresholdMove = false;
            }

            //CallBack
            if (params.onTouchStart) _this.fireCallback(params.onTouchStart, _this, event);
            _this.callPlugins('onTouchStartEnd');

        }
    }
    var velocityPrevPosition, velocityPrevTime;
    function onTouchMove(event) {
        // If slider is not touched - exit
        if (!_this.isTouched || params.onlyExternal) return;
        if (isTouchEvent && event.type === 'mousemove') return;

        var pageX = isTouchEvent ? event.targetTouches[0].pageX : (event.pageX || event.clientX);
        var pageY = isTouchEvent ? event.targetTouches[0].pageY : (event.pageY || event.clientY);

        //check for scrolling
        if (typeof isScrolling === 'undefined' && isH) {
            isScrolling = !!(isScrolling || Math.abs(pageY - _this.touches.startY) > Math.abs(pageX - _this.touches.startX));
        }
        if (typeof isScrolling === 'undefined' && !isH) {
            isScrolling = !!(isScrolling || Math.abs(pageY - _this.touches.startY) < Math.abs(pageX - _this.touches.startX));
        }
        if (isScrolling) {
            _this.isTouched = false;
            return;
        }

        // One way swipes
        if (isH) {
            if ((!params.swipeToNext && pageX < _this.touches.startX) || ((!params.swipeToPrev && pageX > _this.touches.startX))) {
                return;
            }
        }
        else {
            if ((!params.swipeToNext && pageY < _this.touches.startY) || ((!params.swipeToPrev && pageY > _this.touches.startY))) {
                return;
            }
        }

        //Check For Nested Swipers
        if (event.assignedToSwiper) {
            _this.isTouched = false;
            return;
        }
        event.assignedToSwiper = true;

        //Block inner links
        if (params.preventLinks) {
            _this.allowLinks = false;
        }
        if (params.onSlideClick) {
            _this.allowSlideClick = false;
        }

        //Stop AutoPlay if exist
        if (params.autoplay) {
            _this.stopAutoplay(true);
        }
        if (!isTouchEvent || event.touches.length === 1) {

            //Moved Flag
            if (!_this.isMoved) {
                _this.callPlugins('onTouchMoveStart');

                if (params.loop) {
                    _this.fixLoop();
                    _this.positions.start = _this.getWrapperTranslate();
                }
                if (params.onTouchMoveStart) _this.fireCallback(params.onTouchMoveStart, _this);
            }
            _this.isMoved = true;

            // cancel event
            if (event.preventDefault) event.preventDefault();
            else event.returnValue = false;

            _this.touches.current = isH ? pageX : pageY;

            _this.positions.current = (_this.touches.current - _this.touches.start) * params.touchRatio + _this.positions.start;

            //Resistance Callbacks
            if (_this.positions.current > 0 && params.onResistanceBefore) {
                _this.fireCallback(params.onResistanceBefore, _this, _this.positions.current);
            }
            if (_this.positions.current < -maxWrapperPosition() && params.onResistanceAfter) {
                _this.fireCallback(params.onResistanceAfter, _this, Math.abs(_this.positions.current + maxWrapperPosition()));
            }
            //Resistance
            if (params.resistance && params.resistance !== '100%') {
                var resistance;
                //Resistance for Negative-Back sliding
                if (_this.positions.current > 0) {
                    resistance = 1 - _this.positions.current / containerSize / 2;
                    if (resistance < 0.5)
                        _this.positions.current = (containerSize / 2);
                    else
                        _this.positions.current = _this.positions.current * resistance;
                }
                //Resistance for After-End Sliding
                if (_this.positions.current < -maxWrapperPosition()) {

                    var diff = (_this.touches.current - _this.touches.start) * params.touchRatio + (maxWrapperPosition() + _this.positions.start);
                    resistance = (containerSize + diff) / (containerSize);
                    var newPos = _this.positions.current - diff * (1 - resistance) / 2;
                    var stopPos = -maxWrapperPosition() - containerSize / 2;

                    if (newPos < stopPos || resistance <= 0)
                        _this.positions.current = stopPos;
                    else
                        _this.positions.current = newPos;
                }
            }
            if (params.resistance && params.resistance === '100%') {
                //Resistance for Negative-Back sliding
                if (_this.positions.current > 0 && !(params.freeMode && !params.freeModeFluid)) {
                    _this.positions.current = 0;
                }
                //Resistance for After-End Sliding
                if (_this.positions.current < -maxWrapperPosition() && !(params.freeMode && !params.freeModeFluid)) {
                    _this.positions.current = -maxWrapperPosition();
                }
            }
            //Move Slides
            if (!params.followFinger) return;

            if (!params.moveStartThreshold) {
                _this.setWrapperTranslate(_this.positions.current);
            }
            else {
                if (Math.abs(_this.touches.current - _this.touches.start) > params.moveStartThreshold || allowThresholdMove) {
                    if (!allowThresholdMove) {
                        allowThresholdMove = true;
                        _this.touches.start = _this.touches.current;
                        return;
                    }
                    _this.setWrapperTranslate(_this.positions.current);
                }
                else {
                    _this.positions.current = _this.positions.start;
                }
            }

            if (params.freeMode || params.watchActiveIndex) {
                _this.updateActiveSlide(_this.positions.current);
            }

            //Grab Cursor
            if (params.grabCursor) {
                _this.container.style.cursor = 'move';
                _this.container.style.cursor = 'grabbing';
                _this.container.style.cursor = '-moz-grabbin';
                _this.container.style.cursor = '-webkit-grabbing';
            }
            //Velocity
            if (!velocityPrevPosition) velocityPrevPosition = _this.touches.current;
            if (!velocityPrevTime) velocityPrevTime = (new Date()).getTime();
            _this.velocity = (_this.touches.current - velocityPrevPosition) / ((new Date()).getTime() - velocityPrevTime) / 2;
            if (Math.abs(_this.touches.current - velocityPrevPosition) < 2) _this.velocity = 0;
            velocityPrevPosition = _this.touches.current;
            velocityPrevTime = (new Date()).getTime();
            //Callbacks
            _this.callPlugins('onTouchMoveEnd');
            if (params.onTouchMove) _this.fireCallback(params.onTouchMove, _this, event);

            return false;
        }
    }
    function onTouchEnd(event) {
        //Check For scrolling
        if (isScrolling) {
            _this.swipeReset();
        }
        // If slider is not touched exit
        if (params.onlyExternal || !_this.isTouched) return;
        _this.isTouched = false;

        //Return Grab Cursor
        if (params.grabCursor) {
            _this.container.style.cursor = 'move';
            _this.container.style.cursor = 'grab';
            _this.container.style.cursor = '-moz-grab';
            _this.container.style.cursor = '-webkit-grab';
        }

        //Check for Current Position
        if (!_this.positions.current && _this.positions.current !== 0) {
            _this.positions.current = _this.positions.start;
        }

        //For case if slider touched but not moved
        if (params.followFinger) {
            _this.setWrapperTranslate(_this.positions.current);
        }

        // TouchEndTime
        _this.times.end = (new Date()).getTime();

        //Difference
        _this.touches.diff = _this.touches.current - _this.touches.start;
        _this.touches.abs = Math.abs(_this.touches.diff);

        _this.positions.diff = _this.positions.current - _this.positions.start;
        _this.positions.abs = Math.abs(_this.positions.diff);

        var diff = _this.positions.diff;
        var diffAbs = _this.positions.abs;
        var timeDiff = _this.times.end - _this.times.start;

        if (diffAbs < 5 && (timeDiff) < 300 && _this.allowLinks === false) {
            if (!params.freeMode && diffAbs !== 0) _this.swipeReset();
            //Release inner links
            if (params.preventLinks) {
                _this.allowLinks = true;
            }
            if (params.onSlideClick) {
                _this.allowSlideClick = true;
            }
        }

        setTimeout(function () {
            //Release inner links
            if (typeof _this === 'undefined' || _this === null) return;
            if (params.preventLinks) {
                _this.allowLinks = true;
            }
            if (params.onSlideClick) {
                _this.allowSlideClick = true;
            }
        }, 100);

        var maxPosition = maxWrapperPosition();

        //Not moved or Prevent Negative Back Sliding/After-End Sliding
        if (!_this.isMoved && params.freeMode) {
            _this.isMoved = false;
            if (params.onTouchEnd) _this.fireCallback(params.onTouchEnd, _this, event);
            _this.callPlugins('onTouchEnd');
            return;
        }
        if (!_this.isMoved || _this.positions.current > 0 || _this.positions.current < -maxPosition) {
            _this.swipeReset();
            if (params.onTouchEnd) _this.fireCallback(params.onTouchEnd, _this, event);
            _this.callPlugins('onTouchEnd');
            return;
        }

        _this.isMoved = false;

        //Free Mode
        if (params.freeMode) {
            if (params.freeModeFluid) {
                var momentumDuration = 1000 * params.momentumRatio;
                var momentumDistance = _this.velocity * momentumDuration;
                var newPosition = _this.positions.current + momentumDistance;
                var doBounce = false;
                var afterBouncePosition;
                var bounceAmount = Math.abs(_this.velocity) * 20 * params.momentumBounceRatio;
                if (newPosition < -maxPosition) {
                    if (params.momentumBounce && _this.support.transitions) {
                        if (newPosition + maxPosition < -bounceAmount) newPosition = -maxPosition - bounceAmount;
                        afterBouncePosition = -maxPosition;
                        doBounce = true;
                        allowMomentumBounce = true;
                    }
                    else newPosition = -maxPosition;
                }
                if (newPosition > 0) {
                    if (params.momentumBounce && _this.support.transitions) {
                        if (newPosition > bounceAmount) newPosition = bounceAmount;
                        afterBouncePosition = 0;
                        doBounce = true;
                        allowMomentumBounce = true;
                    }
                    else newPosition = 0;
                }
                //Fix duration
                if (_this.velocity !== 0) momentumDuration = Math.abs((newPosition - _this.positions.current) / _this.velocity);

                _this.setWrapperTranslate(newPosition);

                _this.setWrapperTransition(momentumDuration);

                if (params.momentumBounce && doBounce) {
                    _this.wrapperTransitionEnd(function () {
                        if (!allowMomentumBounce) return;
                        if (params.onMomentumBounce) _this.fireCallback(params.onMomentumBounce, _this);
                        _this.callPlugins('onMomentumBounce');

                        _this.setWrapperTranslate(afterBouncePosition);
                        _this.setWrapperTransition(300);
                    });
                }

                _this.updateActiveSlide(newPosition);
            }
            if (!params.freeModeFluid || timeDiff >= 300) _this.updateActiveSlide(_this.positions.current);

            if (params.onTouchEnd) _this.fireCallback(params.onTouchEnd, _this, event);
            _this.callPlugins('onTouchEnd');
            return;
        }

        //Direction
        direction = diff < 0 ? 'toNext' : 'toPrev';

        //Short Touches
        if (direction === 'toNext' && (timeDiff <= 300)) {
            if (diffAbs < 30 || !params.shortSwipes) _this.swipeReset();
            else _this.swipeNext(true, true);
        }

        if (direction === 'toPrev' && (timeDiff <= 300)) {
            if (diffAbs < 30 || !params.shortSwipes) _this.swipeReset();
            else _this.swipePrev(true, true);
        }

        //Long Touches
        var targetSlideSize = 0;
        if (params.slidesPerView === 'auto') {
            //Define current slide's width
            var currentPosition = Math.abs(_this.getWrapperTranslate());
            var slidesOffset = 0;
            var _slideSize;
            for (var i = 0; i < _this.slides.length; i++) {
                _slideSize = isH ? _this.slides[i].getWidth(true, params.roundLengths) : _this.slides[i].getHeight(true, params.roundLengths);
                slidesOffset += _slideSize;
                if (slidesOffset > currentPosition) {
                    targetSlideSize = _slideSize;
                    break;
                }
            }
            if (targetSlideSize > containerSize) targetSlideSize = containerSize;
        }
        else {
            targetSlideSize = slideSize * params.slidesPerView;
        }
        if (direction === 'toNext' && (timeDiff > 300)) {
            if (diffAbs >= targetSlideSize * params.longSwipesRatio) {
                _this.swipeNext(true, true);
            }
            else {
                _this.swipeReset();
            }
        }
        if (direction === 'toPrev' && (timeDiff > 300)) {
            if (diffAbs >= targetSlideSize * params.longSwipesRatio) {
                _this.swipePrev(true, true);
            }
            else {
                _this.swipeReset();
            }
        }
        if (params.onTouchEnd) _this.fireCallback(params.onTouchEnd, _this, event);
        _this.callPlugins('onTouchEnd');
    }


    /*==================================================
        noSwiping Bubble Check by Isaac Strack
    ====================================================*/
    function hasClass(el, classname) {
        return el && el.getAttribute('class') && el.getAttribute('class').indexOf(classname) > -1;
    }
    function noSwipingSlide(el) {
        /*This function is specifically designed to check the parent elements for the noSwiping class, up to the wrapper.
        We need to check parents because while onTouchStart bubbles, _this.isTouched is checked in onTouchStart, which stops the bubbling.
        So, if a text box, for example, is the initial target, and the parent slide container has the noSwiping class, the _this.isTouched
        check will never find it, and what was supposed to be noSwiping is able to be swiped.
        This function will iterate up and check for the noSwiping class in parents, up through the wrapperClass.*/

        // First we create a truthy variable, which is that swiping is allowd (noSwiping = false)
        var noSwiping = false;

        // Now we iterate up (parentElements) until we reach the node with the wrapperClass.
        do {

            // Each time, we check to see if there's a 'swiper-no-swiping' class (noSwipingClass).
            if (hasClass(el, params.noSwipingClass))
            {
                noSwiping = true; // If there is, we set noSwiping = true;
            }

            el = el.parentElement;  // now we iterate up (parent node)

        } while (!noSwiping && el.parentElement && !hasClass(el, params.wrapperClass)); // also include el.parentElement truthy, just in case.

        // because we didn't check the wrapper itself, we do so now, if noSwiping is false:
        if (!noSwiping && hasClass(el, params.wrapperClass) && hasClass(el, params.noSwipingClass))
            noSwiping = true; // if the wrapper has the noSwipingClass, we set noSwiping = true;

        return noSwiping;
    }

    function addClassToHtmlString(klass, outerHtml) {
        var par = document.createElement('div');
        var child;

        par.innerHTML = outerHtml;
        child = par.firstChild;
        child.className += ' ' + klass;

        return child.outerHTML;
    }


    /*==================================================
        Swipe Functions
    ====================================================*/
    _this.swipeNext = function (runCallbacks, internal) {
        if (typeof runCallbacks === 'undefined') runCallbacks = true;
        if (!internal && params.loop) _this.fixLoop();
        if (!internal && params.autoplay) _this.stopAutoplay(true);
        _this.callPlugins('onSwipeNext');
        var currentPosition = _this.getWrapperTranslate().toFixed(2);
        var newPosition = currentPosition;
        if (params.slidesPerView === 'auto') {
            for (var i = 0; i < _this.snapGrid.length; i++) {
                if (-currentPosition >= _this.snapGrid[i].toFixed(2) && -currentPosition < _this.snapGrid[i + 1].toFixed(2)) {
                    newPosition = -_this.snapGrid[i + 1];
                    break;
                }
            }
        }
        else {
            var groupSize = slideSize * params.slidesPerGroup;
            newPosition = -(Math.floor(Math.abs(currentPosition) / Math.floor(groupSize)) * groupSize + groupSize);
        }
        if (newPosition < -maxWrapperPosition()) {
            newPosition = -maxWrapperPosition();
        }
        if (newPosition === currentPosition) return false;
        swipeToPosition(newPosition, 'next', {runCallbacks: runCallbacks});
        return true;
    };
    _this.swipePrev = function (runCallbacks, internal) {
        if (typeof runCallbacks === 'undefined') runCallbacks = true;
        if (!internal && params.loop) _this.fixLoop();
        if (!internal && params.autoplay) _this.stopAutoplay(true);
        _this.callPlugins('onSwipePrev');

        var currentPosition = Math.ceil(_this.getWrapperTranslate());
        var newPosition;
        if (params.slidesPerView === 'auto') {
            newPosition = 0;
            for (var i = 1; i < _this.snapGrid.length; i++) {
                if (-currentPosition === _this.snapGrid[i]) {
                    newPosition = -_this.snapGrid[i - 1];
                    break;
                }
                if (-currentPosition > _this.snapGrid[i] && -currentPosition < _this.snapGrid[i + 1]) {
                    newPosition = -_this.snapGrid[i];
                    break;
                }
            }
        }
        else {
            var groupSize = slideSize * params.slidesPerGroup;
            newPosition = -(Math.ceil(-currentPosition / groupSize) - 1) * groupSize;
        }

        if (newPosition > 0) newPosition = 0;

        if (newPosition === currentPosition) return false;
        swipeToPosition(newPosition, 'prev', {runCallbacks: runCallbacks});
        return true;

    };
    _this.swipeReset = function (runCallbacks) {
        if (typeof runCallbacks === 'undefined') runCallbacks = true;
        _this.callPlugins('onSwipeReset');
        var currentPosition = _this.getWrapperTranslate();
        var groupSize = slideSize * params.slidesPerGroup;
        var newPosition;
        var maxPosition = -maxWrapperPosition();
        if (params.slidesPerView === 'auto') {
            newPosition = 0;
            for (var i = 0; i < _this.snapGrid.length; i++) {
                if (-currentPosition === _this.snapGrid[i]) return;
                if (-currentPosition >= _this.snapGrid[i] && -currentPosition < _this.snapGrid[i + 1]) {
                    if (_this.positions.diff > 0) newPosition = -_this.snapGrid[i + 1];
                    else newPosition = -_this.snapGrid[i];
                    break;
                }
            }
            if (-currentPosition >= _this.snapGrid[_this.snapGrid.length - 1]) newPosition = -_this.snapGrid[_this.snapGrid.length - 1];
            if (currentPosition <= -maxWrapperPosition()) newPosition = -maxWrapperPosition();
        }
        else {
            newPosition = currentPosition < 0 ? Math.round(currentPosition / groupSize) * groupSize : 0;
            if (currentPosition <= -maxWrapperPosition()) newPosition = -maxWrapperPosition();
        }
        if (params.scrollContainer)  {
            newPosition = currentPosition < 0 ? currentPosition : 0;
        }
        if (newPosition < -maxWrapperPosition()) {
            newPosition = -maxWrapperPosition();
        }
        if (params.scrollContainer && (containerSize > slideSize)) {
            newPosition = 0;
        }

        if (newPosition === currentPosition) return false;

        swipeToPosition(newPosition, 'reset', {runCallbacks: runCallbacks});
        return true;
    };

    _this.swipeTo = function (index, speed, runCallbacks) {
        index = parseInt(index, 10);
        _this.callPlugins('onSwipeTo', {index: index, speed: speed});
        if (params.loop) index = index + _this.loopedSlides;
        var currentPosition = _this.getWrapperTranslate();
        if (!isFinite(index) || index > (_this.slides.length - 1) || index < 0) return;
        var newPosition;
        if (params.slidesPerView === 'auto') {
            newPosition = -_this.slidesGrid[index];
        }
        else {
            newPosition = -index * slideSize;
        }
        if (newPosition < - maxWrapperPosition()) {
            newPosition = - maxWrapperPosition();
        }

        if (newPosition === currentPosition) return false;

        if (typeof runCallbacks === 'undefined') runCallbacks = true;
        swipeToPosition(newPosition, 'to', {index: index, speed: speed, runCallbacks: runCallbacks});
        return true;
    };

    function swipeToPosition(newPosition, action, toOptions) {
        var speed = (action === 'to' && toOptions.speed >= 0) ? toOptions.speed : params.speed;
        var timeOld = + new Date();

        function anim() {
            var timeNew = + new Date();
            var time = timeNew - timeOld;
            currentPosition += animationStep * time / (1000 / 60);
            condition = direction === 'toNext' ? currentPosition > newPosition : currentPosition < newPosition;
            if (condition) {
                _this.setWrapperTranslate(Math.ceil(currentPosition));
                _this._DOMAnimating = true;
                window.setTimeout(function () {
                    anim();
                }, 1000 / 60);
            }
            else {
                if (params.onSlideChangeEnd) {
                    if (action === 'to') {
                        if (toOptions.runCallbacks === true) _this.fireCallback(params.onSlideChangeEnd, _this, direction);
                    }
                    else {
                        _this.fireCallback(params.onSlideChangeEnd, _this, direction);
                    }

                }
                _this.setWrapperTranslate(newPosition);
                _this._DOMAnimating = false;
            }
        }

        if (_this.support.transitions || !params.DOMAnimation) {
            _this.setWrapperTranslate(newPosition);
            _this.setWrapperTransition(speed);
        }
        else {
            //Try the DOM animation
            var currentPosition = _this.getWrapperTranslate();
            var animationStep = Math.ceil((newPosition - currentPosition) / speed * (1000 / 60));
            var direction = currentPosition > newPosition ? 'toNext' : 'toPrev';
            var condition = direction === 'toNext' ? currentPosition > newPosition : currentPosition < newPosition;
            if (_this._DOMAnimating) return;

            anim();
        }

        //Update Active Slide Index
        _this.updateActiveSlide(newPosition);

        //Callbacks
        if (params.onSlideNext && action === 'next' && toOptions.runCallbacks === true) {
            _this.fireCallback(params.onSlideNext, _this, newPosition);
        }
        if (params.onSlidePrev && action === 'prev' && toOptions.runCallbacks === true) {
            _this.fireCallback(params.onSlidePrev, _this, newPosition);
        }
        //'Reset' Callback
        if (params.onSlideReset && action === 'reset' && toOptions.runCallbacks === true) {
            _this.fireCallback(params.onSlideReset, _this, newPosition);
        }

        //'Next', 'Prev' and 'To' Callbacks
        if ((action === 'next' || action === 'prev' || action === 'to') && toOptions.runCallbacks === true)
            slideChangeCallbacks(action);
    }
    /*==================================================
        Transition Callbacks
    ====================================================*/
    //Prevent Multiple Callbacks
    _this._queueStartCallbacks = false;
    _this._queueEndCallbacks = false;
    function slideChangeCallbacks(direction) {
        //Transition Start Callback
        _this.callPlugins('onSlideChangeStart');
        if (params.onSlideChangeStart) {
            if (params.queueStartCallbacks && _this.support.transitions) {
                if (_this._queueStartCallbacks) return;
                _this._queueStartCallbacks = true;
                _this.fireCallback(params.onSlideChangeStart, _this, direction);
                _this.wrapperTransitionEnd(function () {
                    _this._queueStartCallbacks = false;
                });
            }
            else _this.fireCallback(params.onSlideChangeStart, _this, direction);
        }
        //Transition End Callback
        if (params.onSlideChangeEnd) {
            if (_this.support.transitions) {
                if (params.queueEndCallbacks) {
                    if (_this._queueEndCallbacks) return;
                    _this._queueEndCallbacks = true;
                    _this.wrapperTransitionEnd(function (swiper) {
                        _this.fireCallback(params.onSlideChangeEnd, swiper, direction);
                    });
                }
                else {
                    _this.wrapperTransitionEnd(function (swiper) {
                        _this.fireCallback(params.onSlideChangeEnd, swiper, direction);
                    });
                }
            }
            else {
                if (!params.DOMAnimation) {
                    setTimeout(function () {
                        _this.fireCallback(params.onSlideChangeEnd, _this, direction);
                    }, 10);
                }
            }
        }
    }

    /*==================================================
        Update Active Slide Index
    ====================================================*/
    _this.updateActiveSlide = function (position) {
        if (!_this.initialized) return;
        if (_this.slides.length === 0) return;
        _this.previousIndex = _this.activeIndex;
        if (typeof position === 'undefined') position = _this.getWrapperTranslate();
        if (position > 0) position = 0;
        var i;
        if (params.slidesPerView === 'auto') {
            var slidesOffset = 0;
            _this.activeIndex = _this.slidesGrid.indexOf(-position);
            if (_this.activeIndex < 0) {
                for (i = 0; i < _this.slidesGrid.length - 1; i++) {
                    if (-position > _this.slidesGrid[i] && -position < _this.slidesGrid[i + 1]) {
                        break;
                    }
                }
                var leftDistance = Math.abs(_this.slidesGrid[i] + position);
                var rightDistance = Math.abs(_this.slidesGrid[i + 1] + position);
                if (leftDistance <= rightDistance) _this.activeIndex = i;
                else _this.activeIndex = i + 1;
            }
        }
        else {
            _this.activeIndex = Math[params.visibilityFullFit ? 'ceil' : 'round'](-position / slideSize);
        }

        if (_this.activeIndex === _this.slides.length) _this.activeIndex = _this.slides.length - 1;
        if (_this.activeIndex < 0) _this.activeIndex = 0;

        // Check for slide
        if (!_this.slides[_this.activeIndex]) return;

        // Calc Visible slides
        _this.calcVisibleSlides(position);

        // Mark visible and active slides with additonal classes
        if (_this.support.classList) {
            var slide;
            for (i = 0; i < _this.slides.length; i++) {
                slide = _this.slides[i];
                slide.classList.remove(params.slideActiveClass);
                if (_this.visibleSlides.indexOf(slide) >= 0) {
                    slide.classList.add(params.slideVisibleClass);
                } else {
                    slide.classList.remove(params.slideVisibleClass);
                }
            }
            _this.slides[_this.activeIndex].classList.add(params.slideActiveClass);
        } else {
            var activeClassRegexp = new RegExp('\\s*' + params.slideActiveClass);
            var inViewClassRegexp = new RegExp('\\s*' + params.slideVisibleClass);

            for (i = 0; i < _this.slides.length; i++) {
                _this.slides[i].className = _this.slides[i].className.replace(activeClassRegexp, '').replace(inViewClassRegexp, '');
                if (_this.visibleSlides.indexOf(_this.slides[i]) >= 0) {
                    _this.slides[i].className += ' ' + params.slideVisibleClass;
                }
            }
            _this.slides[_this.activeIndex].className += ' ' + params.slideActiveClass;
        }

        //Update loop index
        if (params.loop) {
            var ls = _this.loopedSlides;
            _this.activeLoopIndex = _this.activeIndex - ls;
            if (_this.activeLoopIndex >= _this.slides.length - ls * 2) {
                _this.activeLoopIndex = _this.slides.length - ls * 2 - _this.activeLoopIndex;
            }
            if (_this.activeLoopIndex < 0) {
                _this.activeLoopIndex = _this.slides.length - ls * 2 + _this.activeLoopIndex;
            }
            if (_this.activeLoopIndex < 0) _this.activeLoopIndex = 0;
        }
        else {
            _this.activeLoopIndex = _this.activeIndex;
        }
        //Update Pagination
        if (params.pagination) {
            _this.updatePagination(position);
        }
    };
    /*==================================================
        Pagination
    ====================================================*/
    _this.createPagination = function (firstInit) {
        if (params.paginationClickable && _this.paginationButtons) {
            removePaginationEvents();
        }
        _this.paginationContainer = params.pagination.nodeType ? params.pagination : $$(params.pagination)[0];
        if (params.createPagination) {
            var paginationHTML = '';
            var numOfSlides = _this.slides.length;
            var numOfButtons = numOfSlides;
            if (params.loop) numOfButtons -= _this.loopedSlides * 2;
            for (var i = 0; i < numOfButtons; i++) {
                paginationHTML += '<' + params.paginationElement + ' class="' + params.paginationElementClass + '"></' + params.paginationElement + '>';
            }
            _this.paginationContainer.innerHTML = paginationHTML;
        }
        _this.paginationButtons = $$('.' + params.paginationElementClass, _this.paginationContainer);
        if (!firstInit) _this.updatePagination();
        _this.callPlugins('onCreatePagination');
        if (params.paginationClickable) {
            addPaginationEvents();
        }
    };
    function removePaginationEvents() {
        var pagers = _this.paginationButtons;
        if (pagers) {
            for (var i = 0; i < pagers.length; i++) {
                _this.h.removeEventListener(pagers[i], 'click', paginationClick);
            }
        }
    }
    function addPaginationEvents() {
        var pagers = _this.paginationButtons;
        if (pagers) {
            for (var i = 0; i < pagers.length; i++) {
                _this.h.addEventListener(pagers[i], 'click', paginationClick);
            }
        }
    }
    function paginationClick(e) {
        var index;
        var target = e.target || e.srcElement;
        var pagers = _this.paginationButtons;
        for (var i = 0; i < pagers.length; i++) {
            if (target === pagers[i]) index = i;
        }
        if (params.autoplay) _this.stopAutoplay(true);
        _this.swipeTo(index);
    }
    _this.updatePagination = function (position) {
        if (!params.pagination) return;
        if (_this.slides.length < 1) return;
        var activePagers = $$('.' + params.paginationActiveClass, _this.paginationContainer);
        if (!activePagers) return;

        //Reset all Buttons' class to not active
        var pagers = _this.paginationButtons;
        if (pagers.length === 0) return;
        for (var i = 0; i < pagers.length; i++) {
            pagers[i].className = params.paginationElementClass;
        }

        var indexOffset = params.loop ? _this.loopedSlides : 0;
        if (params.paginationAsRange) {
            if (!_this.visibleSlides) _this.calcVisibleSlides(position);
            //Get Visible Indexes
            var visibleIndexes = [];
            var j; // lopp index - avoid JSHint W004 / W038
            for (j = 0; j < _this.visibleSlides.length; j++) {
                var visIndex = _this.slides.indexOf(_this.visibleSlides[j]) - indexOffset;

                if (params.loop && visIndex < 0) {
                    visIndex = _this.slides.length - _this.loopedSlides * 2 + visIndex;
                }
                if (params.loop && visIndex >= _this.slides.length - _this.loopedSlides * 2) {
                    visIndex = _this.slides.length - _this.loopedSlides * 2 - visIndex;
                    visIndex = Math.abs(visIndex);
                }
                visibleIndexes.push(visIndex);
            }

            for (j = 0; j < visibleIndexes.length; j++) {
                if (pagers[visibleIndexes[j]]) pagers[visibleIndexes[j]].className += ' ' + params.paginationVisibleClass;
            }

            if (params.loop) {
                if (pagers[_this.activeLoopIndex] !== undefined) {
                    pagers[_this.activeLoopIndex].className += ' ' + params.paginationActiveClass;
                }
            }
            else {
                if (pagers[_this.activeIndex]) pagers[_this.activeIndex].className += ' ' + params.paginationActiveClass;
            }
        }
        else {
            if (params.loop) {
                if (pagers[_this.activeLoopIndex]) pagers[_this.activeLoopIndex].className += ' ' + params.paginationActiveClass + ' ' + params.paginationVisibleClass;
            }
            else {
                if (pagers[_this.activeIndex]) pagers[_this.activeIndex].className += ' ' + params.paginationActiveClass + ' ' + params.paginationVisibleClass;
            }
        }
    };
    _this.calcVisibleSlides = function (position) {
        var visibleSlides = [];
        var _slideLeft = 0, _slideSize = 0, _slideRight = 0;
        if (isH && _this.wrapperLeft > 0) position = position + _this.wrapperLeft;
        if (!isH && _this.wrapperTop > 0) position = position + _this.wrapperTop;

        for (var i = 0; i < _this.slides.length; i++) {
            _slideLeft += _slideSize;
            if (params.slidesPerView === 'auto')
                _slideSize  = isH ? _this.h.getWidth(_this.slides[i], true, params.roundLengths) : _this.h.getHeight(_this.slides[i], true, params.roundLengths);
            else _slideSize = slideSize;

            _slideRight = _slideLeft + _slideSize;
            var isVisibile = false;
            if (params.visibilityFullFit) {
                if (_slideLeft >= -position && _slideRight <= -position + containerSize) isVisibile = true;
                if (_slideLeft <= -position && _slideRight >= -position + containerSize) isVisibile = true;
            }
            else {
                if (_slideRight > -position && _slideRight <= ((-position + containerSize))) isVisibile = true;
                if (_slideLeft >= -position && _slideLeft < ((-position + containerSize))) isVisibile = true;
                if (_slideLeft < -position && _slideRight > ((-position + containerSize))) isVisibile = true;
            }

            if (isVisibile) visibleSlides.push(_this.slides[i]);

        }
        if (visibleSlides.length === 0) visibleSlides = [_this.slides[_this.activeIndex]];

        _this.visibleSlides = visibleSlides;
    };

    /*==========================================
        Autoplay
    ============================================*/
    var autoplayTimeoutId, autoplayIntervalId;
    _this.startAutoplay = function () {
        if (_this.support.transitions) {
            if (typeof autoplayTimeoutId !== 'undefined') return false;
            if (!params.autoplay) return;
            _this.callPlugins('onAutoplayStart');
            if (params.onAutoplayStart) _this.fireCallback(params.onAutoplayStart, _this);
            autoplay();
        }
        else {
            if (typeof autoplayIntervalId !== 'undefined') return false;
            if (!params.autoplay) return;
            _this.callPlugins('onAutoplayStart');
            if (params.onAutoplayStart) _this.fireCallback(params.onAutoplayStart, _this);
            autoplayIntervalId = setInterval(function () {
                if (params.loop) {
                    _this.fixLoop();
                    _this.swipeNext(true, true);
                }
                else if (!_this.swipeNext(true, true)) {
                    if (!params.autoplayStopOnLast) _this.swipeTo(0);
                    else {
                        clearInterval(autoplayIntervalId);
                        autoplayIntervalId = undefined;
                    }
                }
            }, params.autoplay);
        }
    };
    _this.stopAutoplay = function (internal) {
        if (_this.support.transitions) {
            if (!autoplayTimeoutId) return;
            if (autoplayTimeoutId) clearTimeout(autoplayTimeoutId);
            autoplayTimeoutId = undefined;
            if (internal && !params.autoplayDisableOnInteraction) {
                _this.wrapperTransitionEnd(function () {
                    autoplay();
                });
            }
            _this.callPlugins('onAutoplayStop');
            if (params.onAutoplayStop) _this.fireCallback(params.onAutoplayStop, _this);
        }
        else {
            if (autoplayIntervalId) clearInterval(autoplayIntervalId);
            autoplayIntervalId = undefined;
            _this.callPlugins('onAutoplayStop');
            if (params.onAutoplayStop) _this.fireCallback(params.onAutoplayStop, _this);
        }
    };
    function autoplay() {
        autoplayTimeoutId = setTimeout(function () {
            if (params.loop) {
                _this.fixLoop();
                _this.swipeNext(true, true);
            }
            else if (!_this.swipeNext(true, true)) {
                if (!params.autoplayStopOnLast) _this.swipeTo(0);
                else {
                    clearTimeout(autoplayTimeoutId);
                    autoplayTimeoutId = undefined;
                }
            }
            _this.wrapperTransitionEnd(function () {
                if (typeof autoplayTimeoutId !== 'undefined') autoplay();
            });
        }, params.autoplay);
    }
    /*==================================================
        Loop
    ====================================================*/
    _this.loopCreated = false;
    _this.removeLoopedSlides = function () {
        if (_this.loopCreated) {
            for (var i = 0; i < _this.slides.length; i++) {
                if (_this.slides[i].getData('looped') === true) _this.wrapper.removeChild(_this.slides[i]);
            }
        }
    };

    _this.createLoop = function () {
        if (_this.slides.length === 0) return;
        if (params.slidesPerView === 'auto') {
            _this.loopedSlides = params.loopedSlides || 1;
        }
        else {
            _this.loopedSlides = Math.floor(params.slidesPerView) + params.loopAdditionalSlides;
        }

        if (_this.loopedSlides > _this.slides.length) {
            _this.loopedSlides = _this.slides.length;
        }

        var slideFirstHTML = '',
            slideLastHTML = '',
            i;
        var slidesSetFullHTML = '';
        /**
                loopedSlides is too large if loopAdditionalSlides are set.
                Need to divide the slides by maximum number of slides existing.

                @author        Tomaz Lovrec <tomaz.lovrec@blanc-noir.at>
        */
        var numSlides = _this.slides.length;
        var fullSlideSets = Math.floor(_this.loopedSlides / numSlides);
        var remainderSlides = _this.loopedSlides % numSlides;
        // assemble full sets of slides
        for (i = 0; i < (fullSlideSets * numSlides); i++) {
            var j = i;
            if (i >= numSlides) {
                var over = Math.floor(i / numSlides);
                j = i - (numSlides * over);
            }
            slidesSetFullHTML += _this.slides[j].outerHTML;
        }
        // assemble remainder slides
        // assemble remainder appended to existing slides
        for (i = 0; i < remainderSlides;i++) {
            slideLastHTML += addClassToHtmlString(params.slideDuplicateClass, _this.slides[i].outerHTML);
        }
        // assemble slides that get preppended to existing slides
        for (i = numSlides - remainderSlides; i < numSlides;i++) {
            slideFirstHTML += addClassToHtmlString(params.slideDuplicateClass, _this.slides[i].outerHTML);
        }
        // assemble all slides
        var slides = slideFirstHTML + slidesSetFullHTML + wrapper.innerHTML + slidesSetFullHTML + slideLastHTML;
        // set the slides
        wrapper.innerHTML = slides;

        _this.loopCreated = true;
        _this.calcSlides();

        //Update Looped Slides with special class
        for (i = 0; i < _this.slides.length; i++) {
            if (i < _this.loopedSlides || i >= _this.slides.length - _this.loopedSlides) _this.slides[i].setData('looped', true);
        }
        _this.callPlugins('onCreateLoop');

    };

    _this.fixLoop = function () {
        var newIndex;
        //Fix For Negative Oversliding
        if (_this.activeIndex < _this.loopedSlides) {
            newIndex = _this.slides.length - _this.loopedSlides * 3 + _this.activeIndex;
            _this.swipeTo(newIndex, 0, false);
        }
        //Fix For Positive Oversliding
        else if ((params.slidesPerView === 'auto' && _this.activeIndex >= _this.loopedSlides * 2) || (_this.activeIndex > _this.slides.length - params.slidesPerView * 2)) {
            newIndex = -_this.slides.length + _this.activeIndex + _this.loopedSlides;
            _this.swipeTo(newIndex, 0, false);
        }
    };

    /*==================================================
        Slides Loader
    ====================================================*/
    _this.loadSlides = function () {
        var slidesHTML = '';
        _this.activeLoaderIndex = 0;
        var slides = params.loader.slides;
        var slidesToLoad = params.loader.loadAllSlides ? slides.length : params.slidesPerView * (1 + params.loader.surroundGroups);
        for (var i = 0; i < slidesToLoad; i++) {
            if (params.loader.slidesHTMLType === 'outer') slidesHTML += slides[i];
            else {
                slidesHTML += '<' + params.slideElement + ' class="' + params.slideClass + '" data-swiperindex="' + i + '">' + slides[i] + '</' + params.slideElement + '>';
            }
        }
        _this.wrapper.innerHTML = slidesHTML;
        _this.calcSlides(true);
        //Add permanent transitionEnd callback
        if (!params.loader.loadAllSlides) {
            _this.wrapperTransitionEnd(_this.reloadSlides, true);
        }
    };

    _this.reloadSlides = function () {
        var slides = params.loader.slides;
        var newActiveIndex = parseInt(_this.activeSlide().data('swiperindex'), 10);
        if (newActiveIndex < 0 || newActiveIndex > slides.length - 1) return; //<-- Exit
        _this.activeLoaderIndex = newActiveIndex;
        var firstIndex = Math.max(0, newActiveIndex - params.slidesPerView * params.loader.surroundGroups);
        var lastIndex = Math.min(newActiveIndex + params.slidesPerView * (1 + params.loader.surroundGroups) - 1, slides.length - 1);
        //Update Transforms
        if (newActiveIndex > 0) {
            var newTransform = -slideSize * (newActiveIndex - firstIndex);
            _this.setWrapperTranslate(newTransform);
            _this.setWrapperTransition(0);
        }
        var i; // loop index
        //New Slides
        if (params.loader.logic === 'reload') {
            _this.wrapper.innerHTML = '';
            var slidesHTML = '';
            for (i = firstIndex; i <= lastIndex; i++) {
                slidesHTML += params.loader.slidesHTMLType === 'outer' ? slides[i] : '<' + params.slideElement + ' class="' + params.slideClass + '" data-swiperindex="' + i + '">' + slides[i] + '</' + params.slideElement + '>';
            }
            _this.wrapper.innerHTML = slidesHTML;
        }
        else {
            var minExistIndex = 1000;
            var maxExistIndex = 0;

            for (i = 0; i < _this.slides.length; i++) {
                var index = _this.slides[i].data('swiperindex');
                if (index < firstIndex || index > lastIndex) {
                    _this.wrapper.removeChild(_this.slides[i]);
                }
                else {
                    minExistIndex = Math.min(index, minExistIndex);
                    maxExistIndex = Math.max(index, maxExistIndex);
                }
            }
            for (i = firstIndex; i <= lastIndex; i++) {
                var newSlide;
                if (i < minExistIndex) {
                    newSlide = document.createElement(params.slideElement);
                    newSlide.className = params.slideClass;
                    newSlide.setAttribute('data-swiperindex', i);
                    newSlide.innerHTML = slides[i];
                    _this.wrapper.insertBefore(newSlide, _this.wrapper.firstChild);
                }
                if (i > maxExistIndex) {
                    newSlide = document.createElement(params.slideElement);
                    newSlide.className = params.slideClass;
                    newSlide.setAttribute('data-swiperindex', i);
                    newSlide.innerHTML = slides[i];
                    _this.wrapper.appendChild(newSlide);
                }
            }
        }
        //reInit
        _this.reInit(true);
    };

    /*==================================================
        Make Swiper
    ====================================================*/
    function makeSwiper() {
        _this.calcSlides();
        if (params.loader.slides.length > 0 && _this.slides.length === 0) {
            _this.loadSlides();
        }
        if (params.loop) {
            _this.createLoop();
        }
        _this.init();
        initEvents();
        if (params.pagination) {
            _this.createPagination(true);
        }

        if (params.loop || params.initialSlide > 0) {
            _this.swipeTo(params.initialSlide, 0, false);
        }
        else {
            _this.updateActiveSlide(0);
        }
        if (params.autoplay) {
            _this.startAutoplay();
        }
        /**
         * Set center slide index.
         *
         * @author        Tomaz Lovrec <tomaz.lovrec@gmail.com>
         */
        _this.centerIndex = _this.activeIndex;

        // Callbacks
        if (params.onSwiperCreated) _this.fireCallback(params.onSwiperCreated, _this);
        _this.callPlugins('onSwiperCreated');
    }

    makeSwiper();
};

Swiper.prototype = {
    plugins : {},

    /*==================================================
        Wrapper Operations
    ====================================================*/
    wrapperTransitionEnd : function (callback, permanent) {
        'use strict';
        var a = this,
            el = a.wrapper,
            events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
            i;

        function fireCallBack(e) {
            if (e.target !== el) return;
            callback(a);
            if (a.params.queueEndCallbacks) a._queueEndCallbacks = false;
            if (!permanent) {
                for (i = 0; i < events.length; i++) {
                    a.h.removeEventListener(el, events[i], fireCallBack);
                }
            }
        }

        if (callback) {
            for (i = 0; i < events.length; i++) {
                a.h.addEventListener(el, events[i], fireCallBack);
            }
        }
    },

    getWrapperTranslate : function (axis) {
        'use strict';
        var el = this.wrapper,
            matrix, curTransform, curStyle, transformMatrix;

        // automatic axis detection
        if (typeof axis === 'undefined') {
            axis = this.params.mode === 'horizontal' ? 'x' : 'y';
        }

        if (this.support.transforms && this.params.useCSS3Transforms) {
            curStyle = window.getComputedStyle(el, null);
            if (window.WebKitCSSMatrix) {
                // Some old versions of Webkit choke when 'none' is passed; pass
                // empty string instead in this case
                transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
            }
            else {
                transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
                matrix = transformMatrix.toString().split(',');
            }

            if (axis === 'x') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m41;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[12]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[4]);
            }
            if (axis === 'y') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m42;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[13]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[5]);
            }
        }
        else {
            if (axis === 'x') curTransform = parseFloat(el.style.left, 10) || 0;
            if (axis === 'y') curTransform = parseFloat(el.style.top, 10) || 0;
        }
        return curTransform || 0;
    },

    setWrapperTranslate : function (x, y, z) {
        'use strict';
        var es = this.wrapper.style,
            coords = {x: 0, y: 0, z: 0},
            translate;

        // passed all coordinates
        if (arguments.length === 3) {
            coords.x = x;
            coords.y = y;
            coords.z = z;
        }

        // passed one coordinate and optional axis
        else {
            if (typeof y === 'undefined') {
                y = this.params.mode === 'horizontal' ? 'x' : 'y';
            }
            coords[y] = x;
        }

        if (this.support.transforms && this.params.useCSS3Transforms) {
            translate = this.support.transforms3d ? 'translate3d(' + coords.x + 'px, ' + coords.y + 'px, ' + coords.z + 'px)' : 'translate(' + coords.x + 'px, ' + coords.y + 'px)';
            es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = translate;
        }
        else {
            es.left = coords.x + 'px';
            es.top  = coords.y + 'px';
        }
        this.callPlugins('onSetWrapperTransform', coords);
        if (this.params.onSetWrapperTransform) this.fireCallback(this.params.onSetWrapperTransform, this, coords);
    },

    setWrapperTransition : function (duration) {
        'use strict';
        var es = this.wrapper.style;
        es.webkitTransitionDuration = es.MsTransitionDuration = es.msTransitionDuration = es.MozTransitionDuration = es.OTransitionDuration = es.transitionDuration = (duration / 1000) + 's';
        this.callPlugins('onSetWrapperTransition', {duration: duration});
        if (this.params.onSetWrapperTransition) this.fireCallback(this.params.onSetWrapperTransition, this, duration);

    },

    /*==================================================
        Helpers
    ====================================================*/
    h : {
        getWidth: function (el, outer, round) {
            'use strict';
            var width = window.getComputedStyle(el, null).getPropertyValue('width');
            var returnWidth = parseFloat(width);
            //IE Fixes
            if (isNaN(returnWidth) || width.indexOf('%') > 0 || returnWidth < 0) {
                returnWidth = el.offsetWidth - parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-left')) - parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-right'));
            }
            if (outer) returnWidth += parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-left')) + parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-right'));
            if (round) return Math.ceil(returnWidth);
            else return returnWidth;
        },
        getHeight: function (el, outer, round) {
            'use strict';
            if (outer) return el.offsetHeight;

            var height = window.getComputedStyle(el, null).getPropertyValue('height');
            var returnHeight = parseFloat(height);
            //IE Fixes
            if (isNaN(returnHeight) || height.indexOf('%') > 0 || returnHeight < 0) {
                returnHeight = el.offsetHeight - parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-top')) - parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-bottom'));
            }
            if (outer) returnHeight += parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-top')) + parseFloat(window.getComputedStyle(el, null).getPropertyValue('padding-bottom'));
            if (round) return Math.ceil(returnHeight);
            else return returnHeight;
        },
        getOffset: function (el) {
            'use strict';
            var box = el.getBoundingClientRect();
            var body = document.body;
            var clientTop  = el.clientTop  || body.clientTop  || 0;
            var clientLeft = el.clientLeft || body.clientLeft || 0;
            var scrollTop  = window.pageYOffset || el.scrollTop;
            var scrollLeft = window.pageXOffset || el.scrollLeft;
            if (document.documentElement && !window.pageYOffset) {
                //IE7-8
                scrollTop  = document.documentElement.scrollTop;
                scrollLeft = document.documentElement.scrollLeft;
            }
            return {
                top: box.top  + scrollTop  - clientTop,
                left: box.left + scrollLeft - clientLeft
            };
        },
        windowWidth : function () {
            'use strict';
            if (window.innerWidth) return window.innerWidth;
            else if (document.documentElement && document.documentElement.clientWidth) return document.documentElement.clientWidth;
        },
        windowHeight : function () {
            'use strict';
            if (window.innerHeight) return window.innerHeight;
            else if (document.documentElement && document.documentElement.clientHeight) return document.documentElement.clientHeight;
        },
        windowScroll : function () {
            'use strict';
            if (typeof pageYOffset !== 'undefined') {
                return {
                    left: window.pageXOffset,
                    top: window.pageYOffset
                };
            }
            else if (document.documentElement) {
                return {
                    left: document.documentElement.scrollLeft,
                    top: document.documentElement.scrollTop
                };
            }
        },

        addEventListener : function (el, event, listener, useCapture) {
            'use strict';
            if (typeof useCapture === 'undefined') {
                useCapture = false;
            }

            if (el.addEventListener) {
                el.addEventListener(event, listener, useCapture);
            }
            else if (el.attachEvent) {
                el.attachEvent('on' + event, listener);
            }
        },

        removeEventListener : function (el, event, listener, useCapture) {
            'use strict';
            if (typeof useCapture === 'undefined') {
                useCapture = false;
            }

            if (el.removeEventListener) {
                el.removeEventListener(event, listener, useCapture);
            }
            else if (el.detachEvent) {
                el.detachEvent('on' + event, listener);
            }
        }
    },
    setTransform : function (el, transform) {
        'use strict';
        var es = el.style;
        es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = transform;
    },
    setTranslate : function (el, translate) {
        'use strict';
        var es = el.style;
        var pos = {
            x : translate.x || 0,
            y : translate.y || 0,
            z : translate.z || 0
        };
        var transformString = this.support.transforms3d ? 'translate3d(' + (pos.x) + 'px,' + (pos.y) + 'px,' + (pos.z) + 'px)' : 'translate(' + (pos.x) + 'px,' + (pos.y) + 'px)';
        es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = transformString;
        if (!this.support.transforms) {
            es.left = pos.x + 'px';
            es.top = pos.y + 'px';
        }
    },
    setTransition : function (el, duration) {
        'use strict';
        var es = el.style;
        es.webkitTransitionDuration = es.MsTransitionDuration = es.msTransitionDuration = es.MozTransitionDuration = es.OTransitionDuration = es.transitionDuration = duration + 'ms';
    },
    /*==================================================
        Feature Detection
    ====================================================*/
    support: {

        touch : (window.Modernizr && Modernizr.touch === true) || (function () {
            'use strict';
            return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
        })(),

        transforms3d : (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
            'use strict';
            var div = document.createElement('div').style;
            return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
        })(),

        transforms : (window.Modernizr && Modernizr.csstransforms === true) || (function () {
            'use strict';
            var div = document.createElement('div').style;
            return ('transform' in div || 'WebkitTransform' in div || 'MozTransform' in div || 'msTransform' in div || 'MsTransform' in div || 'OTransform' in div);
        })(),

        transitions : (window.Modernizr && Modernizr.csstransitions === true) || (function () {
            'use strict';
            var div = document.createElement('div').style;
            return ('transition' in div || 'WebkitTransition' in div || 'MozTransition' in div || 'msTransition' in div || 'MsTransition' in div || 'OTransition' in div);
        })(),

        classList : (function () {
            'use strict';
            var div = document.createElement('div');
            return 'classList' in div;
        })()
    },

    browser : {

        ie8 : (function () {
            'use strict';
            var rv = -1; // Return value assumes failure.
            if (navigator.appName === 'Microsoft Internet Explorer') {
                var ua = navigator.userAgent;
                var re = new RegExp(/MSIE ([0-9]{1,}[\.0-9]{0,})/);
                if (re.exec(ua) !== null)
                    rv = parseFloat(RegExp.$1);
            }
            return rv !== -1 && rv < 9;
        })(),

        ie10 : window.navigator.msPointerEnabled,
        ie11 : window.navigator.pointerEnabled
    }
};

/*=========================
  jQuery & Zepto Plugins
  ===========================*/
if (window.jQuery || window.Zepto) {
    (function ($) {
        'use strict';
        $.fn.swiper = function (params) {
            var firstInstance;
            this.each(function (i) {
                var that = $(this);
                var s = new Swiper(that[0], params);
                if (!i) firstInstance = s;
                that.data('swiper', s);
            });
            return firstInstance;
        };
    })(window.jQuery || window.Zepto);
}

// CommonJS support
if (typeof(module) !== 'undefined') {
    module.exports = Swiper;

// requirejs support
} else if (typeof define === 'function' && define.amd) {
    define([], function () {
        'use strict';
        return Swiper;
    });
}


;/**import from `/resource/js/component/jquery/address_select.js` **/
// 省市地区切换
;
(function () {
    var
        Bang
            = window.Bang
            = window.Bang || {}

    var
        defaults = {
            // 根据省一次性获取所有的城市和区县信息
            //flagGetAll       : false,
            // 实例化的时候自动执行init函数
            flagAutoInit     : true,
            selectorProvince : '[name="receiver_province_id"]',
            selectorCity     : '[name="receiver_city_id"]',
            selectorArea     : '[name="receiver_area_id"]',
            province         : '',
            city             : '',
            area             : ''
        },
        // cache省列表
        CacheProvinceList = [],
        // cache市列表
        CacheCityList = {},
        // cache区县列表
        CacheAreaList = {}

    function AddressSelect ( options ) {
        var
            me = this

        options = $.extend ( {}, defaults, options )

        me.options = options

        if ( me.options.flagAutoInit ) {

            me.init ()
        }
    }

    // 设置原型方法
    AddressSelect.prototype = {

        constructor : AddressSelect,

        getProvinceSelect : getProvinceSelect,
        getCitySelect     : getCitySelect,
        getAreaSelect     : getAreaSelect,

        setProvinceHtml : setProvinceHtml,
        setCityHtml     : setCityHtml,
        setAreaHtml     : setAreaHtml,
        addSelectInner  : addSelectInner,

        getProvinceList : getProvinceList,
        getCityList     : getCityList,
        getAreaList     : getAreaList,
        getCityAreaList : getCityAreaList,

        setSelect : setSelect,

        init : init
    }

    // 获取省选择器
    function getProvinceSelect () {
        var
            me = this,
            selectorProvince = me.options.selectorProvince

        return $ ( selectorProvince )
    }

    // 获取城市选择器
    function getCitySelect () {
        var
            me = this,
            selectorProvince = me.options.selectorCity

        return $ ( selectorProvince )
    }

    // 获取地区选择器
    function getAreaSelect () {
        var
            me = this,
            selectorProvince = me.options.selectorArea

        return $ ( selectorProvince )
    }

    // 设置省份html
    function setProvinceHtml ( data, selected_id ) {
        data = data || []
        var
            me = this,
            html_str = []

        $.each ( data, function ( i, item ) {
            html_str.push ( '<option value="', item[ 'province_id' ], '"' );
            if ( selected_id === item[ 'province_id' ] ) {
                html_str.push ( ' selected' );
            }
            html_str.push ( '>', item[ 'province_name' ], '</option>' );
        } );

        html_str = html_str.join ( '' );

        var
            $ProvinceSelect = me.getProvinceSelect ()

        me.addSelectInner ( $ProvinceSelect, html_str )
    }

    // 设置城市html
    function setCityHtml ( data, selected_id ) {
        data = data || []
        var
            me = this,
            html_str = []

        $.each ( data, function ( i, item ) {
            html_str.push ( '<option value="', item[ 'city_id' ], '"' );
            if ( selected_id === item[ 'city_id' ] ) {
                html_str.push ( ' selected' );
            }
            html_str.push ( '>', item[ 'city_name' ], '</option>' );
        } );

        html_str = html_str.join ( '' );

        var
            $CitySelect = me.getCitySelect ()

        me.addSelectInner ( $CitySelect, html_str )
    }

    // 设置地区html
    function setAreaHtml ( data, selected_id ) {
        data = data || []
        var
            me = this,
            html_str = []

        $.each ( data, function ( i, item ) {
            html_str.push ( '<option value="', item[ 'area_id' ], '"' );
            if ( selected_id === item[ 'area_id' ] ) {
                html_str.push ( ' selected' );
            }
            html_str.push ( '>', item[ 'area_name' ], '</option>' );
        } );

        html_str = html_str.join ( '' );

        var
            $AreaSelect = me.getAreaSelect ()

        me.addSelectInner ( $AreaSelect, html_str )
    }

    // 添加省市地区select的内部html
    function addSelectInner ( $select, inner_html_str ) {
        if ( !($select && $select.length) ) {

            return
        }

        $select.html ( inner_html_str );
        if ( inner_html_str ) {
            $select.show ()
        }
        else {
            $select.hide ()
        }
    }

    // 获取省份列表
    function getProvinceList ( callback ) {
        var
            province_list = CacheProvinceList
        if ( province_list && province_list.length ) {
            $.isFunction ( callback ) && callback ()
        }
        else {
            var
                request_url = '/aj/doGetProvinceList'

            $.get ( request_url, function ( res ) {
                res = $.parseJSON ( res );

                if ( !res[ 'errno' ] ) {

                    var result = res[ 'result' ];
                    CacheProvinceList = result;

                    $.isFunction ( callback ) && callback ()
                }
                else {
                    // do nothing
                }
            } );
        }
    }

    // 获取城市列表
    function getCityList ( province_id, callback ) {
        if ( !province_id ) {
            return;
        }
        var
            me = this,
            city_list = CacheCityList[ province_id ]
        if ( city_list && city_list.length ) {
            if ( $.isFunction ( callback ) ) {
                // 获取区县列表
                if(city_list[ 0 ].length){
                    me.getAreaList ( city_list[ 0 ][ 'city_id' ], function ( area_list ) {
                        callback ( city_list, area_list );
                    } )
                }
            }
        }
        else {
            var
                request_url = '/aj/doGetCityList?province_id=' + province_id

            $.get ( request_url, function ( res ) {
                res = $.parseJSON ( res )

                if ( !res[ 'errno' ] ) {
                    CacheCityList[ province_id ] = res[ 'result' ]

                    if ( $.isFunction ( callback ) ) {
                        city_list = CacheCityList[ province_id ];

                        if ( city_list && city_list.length ) {

                            // 获取区县列表
                            if(city_list[ 0 ].length){
                                me.getAreaList ( city_list[ 0 ][ 'city_id' ], function ( area_list ) {
                                    callback ( city_list, area_list );
                                } )
                            }

                        }
                    }
                }
                else {
                    // do nothing
                }
            } );
        }
    }

    // 获取城市列表
    function getAreaList ( city_id, callback ) {
        if ( !city_id ) {
            return;
        }
        var
            me = this,
            area_list = CacheAreaList[ city_id ]
        if ( area_list && area_list.length ) {
            if ( $.isFunction ( callback ) ) {
                callback ( area_list );
            }
        }
        else {
            var
                request_url = '/aj/doGetAreaList?city_id=' + city_id

            $.get ( request_url, function ( res ) {
                res = $.parseJSON ( res );

                if ( !res[ 'errno' ] ) {

                    CacheAreaList[ city_id ] = res[ 'result' ];

                    if ( $.isFunction ( callback ) ) {
                        callback ( CacheAreaList[ city_id ] );
                    }
                }
                else {
                    // do nothing
                }
            } );
        }
    }

    // 获取城市、地区列表
    function getCityAreaList ( province_id, callback ) {
        if ( !province_id ) {
            return;
        }
        var
            me = this,
            city_list = CacheCityList[ province_id ]
        if ( city_list && city_list.length ) {

            if ( $.isFunction ( callback ) ) {
                callback ()
            }
        }
        else {
            var
                request_url = '/aj/doGetProvinceLinkage?province_id=' + province_id

            city_list = [];
            $.get ( request_url, function ( res ) {
                res = $.parseJSON ( res )

                if ( !res[ 'errno' ] ) {

                    var
                        result = res[ 'result' ]

                    $.each ( result[ 'city_list' ], function ( i, item ) {
                        city_list.push ( {
                            city_id   : item[ 'city_id' ],
                            city_name : item[ 'city_name' ]
                        } );

                        // 区县cache
                        CacheAreaList[ item[ 'city_id' ] ]
                            = (item[ 'area_list' ] && item[ 'area_list' ].length)
                            ? item[ 'area_list' ]
                            : []
                    } )
                    // 城市cache
                    CacheCityList[ province_id ] = city_list

                    if ( $.isFunction ( callback ) ) {
                        callback ()
                    }
                }
                else {
                    if ( $.isFunction ( callback ) ) {
                        callback ()
                    }
                }
            } )

        }
    }

    // 设置选中的省市区县
    function setSelect ( province, city, area ) {
        var
            me = this

        // 初始化获取省市区县列表数据
        me.getProvinceList ( function () {
            // 获取省份信息

            var
                province_list = getProvinceListByCache (),
                province_id = getProvinceIdByName ( province, province_list )

            // 根据默认省份获取不到省份id,那么将第一个省份当作默认省
            province_id = province_id || province_list[ 0 ][ 'province_id' ]

            // 设置省份html
            me.setProvinceHtml ( province_list, province_id )

            // 获取区县数据
            me.getCityAreaList ( province_id, function () {
                var
                    city_list = getCityListByCache ( province_id ),
                    // 默认选中的城市id
                    city_id = getCityIdByName ( city, city_list )

                city_id = city_id || city_list[ 0 ][ 'city_id' ]
                // 城市
                me.setCityHtml ( city_list, city_id )

                var area_list = getAreaListByCache ( city_id )

                if(area_list.length){
                    // 默认选中的区县id
                   var area_id = getAreaIdByName ( area, area_list )

                    area_id = area_id || area_list[ 0 ][ 'area_id' ]
                    // 区县
                    me.setAreaHtml ( area_list, area_id )
                }


            } )

        } )
    }

    function init () {
        var
            me = this,
            default_province = me.options.province || window.city_name || '北京',
            default_city = me.options.city || '',
            default_area = me.options.area || ''

        // 设置默认选中省份城市区县
        me.setSelect ( default_province, default_city, default_area )

        // 事件绑定

        // 切换省
        $ ( me.options.selectorProvince ).on ( 'change', function ( e ) {
            var
                $me = $ ( this ),
                province_id = $me.val ()

            me.getCityAreaList ( province_id, function () {

                var
                    city_list = getCityListByCache ( province_id ),
                    city_id = city_list[ 0 ][ 'city_id' ]
                // 城市
                me.setCityHtml ( city_list, city_id )

                var area_list = getAreaListByCache ( city_id )
                if(area_list.length){
                    var area_id = area_list[ 0 ][ 'area_id' ]
                    // 区县
                    me.setAreaHtml ( area_list, area_id )
                }else {
                    var
                        $AreaSelect = me.getAreaSelect ()
                    $AreaSelect.css('display','none')
                    $AreaSelect.children('option').remove()
                }

            } )

        } )

        // 切换城市
        $ ( me.options.selectorCity ).on ( 'change', function ( e ) {
            var
                $me = $ ( this ),
                city_id = $me.val ()

            me.getAreaList ( city_id, function ( area_list ) {

                var
                    area_list = getAreaListByCache ( city_id )
                if(area_list.length ){
                    var area_id = area_list[ 0 ][ 'area_id' ]
                    // 区县
                    me.setAreaHtml ( area_list, area_id )
                }else {
                    var
                        $AreaSelect = me.getAreaSelect ()
                    $AreaSelect.css('display','none')
                    $AreaSelect.children('option').remove()
                }

            } )

        } )

    }


    Bang.AddressSelect = function ( options ) {

        return new AddressSelect ( options )
    }


    //================= private ===================

    // cache中获取省份列表
    function getProvinceListByCache () {

        return CacheProvinceList
    }

    // cache中获取城市列表
    function getCityListByCache ( province_id ) {

        return CacheCityList[ province_id ]
    }

    // cache中获取区县列表
    function getAreaListByCache ( city_id ) {

        return CacheAreaList[ city_id ]
    }

    // 根据省份名称，获取省份id
    function getProvinceIdByName ( province_name, province_list ) {
        if ( !(province_name && $.isArray ( province_list )) ) {
            return
        }
        var
            province_id
        $.each ( province_list, function ( i, item ) {
            if ( province_name == item[ 'province_name' ] ) {
                province_id = item[ 'province_id' ]

                return false
            }
        } )

        return province_id
    }

    // 根据城市名称，获取城市id
    function getCityIdByName ( city_name, city_list ) {
        if ( !(city_name && $.isArray ( city_list )) ) {
            return;
        }
        var
            city_id
        $.each ( city_list, function ( i, item ) {
            if ( city_name == item[ 'city_name' ] ) {
                city_id = item[ 'city_id' ]

                return false
            }
        } )

        return city_id
    }

    // 根据城市名称，获取城市id
    function getAreaIdByName ( area_name, area_list ) {
        if ( !(area_name && $.isArray ( area_list )) ) {
            return;
        }
        var
            area_id
        $.each ( area_list, function ( i, item ) {
            if ( area_name == item[ 'area_name' ] ) {
                area_id = item[ 'area_id' ]

                return false
            }
        } )

        return area_id
    }


} ())


;/**import from `/resource/js/component/countdown.js` **/
// 倒计时
(function(){
    var Bang = window.Bang = window.Bang || {};

    Bang.countdown_desc = '剩余';
    Bang.startCountdown = startCountdown;

    /**
     * 拍卖倒计时（开始或者结束）
     * @param targettime 倒计时结束的目标时间（时间戳）
     * @param curtime 当前时间（时间戳）（会随着倒计时变化）
     * @param $target
     */
    function startCountdown(targettime, curtime, $target, callbacks){
        if(!targettime || !curtime || curtime>targettime){
            return ;
        }
        callbacks = callbacks || {};

        var duration = Math.floor( (targettime - curtime)/1000 ),// 时间间隔，精确到秒，用来计算倒计时
            client_duration = getClientDuration(targettime); // 当前客户端和结束时间的时间差（用来作为参考点修正倒计时误差）

        var fn_countdown = W('#JsCountdownTpl').html().trim().tmpl();

        // 倒计时ing
        typeof callbacks.start === 'function' && callbacks.start();

        function countdown(){
            if ( !($target&&$target.length) ) {
                return false
            }
            var d = Math.floor(duration/86400), // 天
                h = Math.floor((duration-d*86400)/3600), // 小时
                m = Math.floor((duration-d*86400-h*3600)/60), // 分钟
                s = duration - d*86400 - h*3600 - m*60; // 秒

            var desc_before = $target.attr('data-descbefore')||Bang.countdown_desc||'', // 前置文字说明
                desc_behind = $target.attr('data-descbehind')||'', // 后置文字说明
                day_txt    = $target.attr('data-daytxt') || '天 ',
                hour_txt   = $target.attr('data-hourtxt') || ':',
                minute_txt = $target.attr('data-minutetxt') || ':',
                second_txt = $target.attr('data-secondtxt') || '',
                hour_mode = !!$target.attr('data-hour-mode') // 小时模式

            if (hour_mode) {
                h = d * 24 + h
                d = 0
            }

            var html_str = fn_countdown({
                'day': d,
                'day_txt': day_txt,
                'hour': fix2Length(h),
                'hour_txt': hour_txt,
                'minute': fix2Length(m),
                'minute_txt': minute_txt,
                'second': fix2Length(s),
                'second_txt': second_txt,
                'desc_before': desc_before,
                'desc_behind': desc_behind
            });
            $target.html(html_str);

            // 倒计时ing
            typeof callbacks.process === 'function' && callbacks.process(curtime);

            duration = duration - 1;
            client_duration = client_duration - 1000;
            curtime = curtime - 1000;

            //duration = duration<1 ? 0 : duration;
            return true;
        }
        countdown();
        setTimeout(function(){
            var flag = countdown();
            if (!flag) {
                return ;
            }
            if(duration>-1){
                var next_time = getClientDuration(targettime) - client_duration;
                if (next_time<0) {
                    next_time = 0;
                }
                setTimeout(arguments.callee, next_time);
            } else {
                // 倒计时结束
                typeof callbacks.end === 'function' && callbacks.end();
            }
        }, 1000);
    }
    /**
     * 修复为2个字符长度，长度不足以前置0补齐;
     * @return {[type]} [description]
     */
    function fix2Length(str){
        str = str.toString();
        return str.length < 2 ? '0' + str : str;
    }
    /**
     * 获取当前客户端时间相对结束时间的时间间隔（精确到毫秒）
     * @returns {*|number}
     */
    function getClientDuration(targettime){
        return targettime - (new Date()).getTime();
    }

}());

;/**import from `/resource/js/page/front.huishou2.js` **/
//var _brandListCache = {"1000000":[[{"model_id":4,"model_alis":"苹果iPhone 5S","sub_arr":[20522,20250,19826,20503,20169,20450],"img_url":"http:\/\/p0.qhmsg.com\/t01d6cc12484802289f.jpg","rec_price":2550},{"model_id":2,"model_alis":"苹果iPhone 4S","sub_arr":[20700,14515,20699,20701],"img_url":"http:\/\/p0.qhmsg.com\/t01e302dbcd00e7a799.jpg","rec_price":835},{"model_id":3,"model_alis":"苹果iPhone 5","sub_arr":[17254,17596,20751],"img_url":"http:\/\/p7.qhmsg.com\/t011bc9e6b64f8339f5.jpg","rec_price":1650},{"model_id":6,"model_alis":"苹果iPhone 6","sub_arr":[20694,20696,20771,20698],"img_url":"http:\/\/p0.qhmsg.com\/t01068fe5e76aa7e910.jpg","rec_price":4500},{"model_id":"20229","model_alis":"小米M3","img_url":"http:\/\/p5.qhmsg.com\/t0162abdc2a51334cf5.jpg","rec_price":600},{"model_id":"20373","model_alis":"华为荣耀3C","img_url":"http:\/\/p0.qhmsg.com\/t01aa669fe6e41bfef8.jpg","rec_price":250},{"model_id":"17125","model_alis":"三星Galaxy S3","img_url":"http:\/\/p0.qhmsg.com\/t01c2395e39f110a70e.jpg","rec_price":500},{"model_id":14,"model_alis":"苹果iPad mini","sub_arr":[17346,17343],"img_url":"http:\/\/p3.qhmsg.com\/t01811d160457b44994.jpg","rec_price":1000}],[{"model_id":"20522","model_alis":"苹果iPhone 5S 水货","img_url":"http:\/\/p0.qhmsg.com\/t01d6cc12484802289f.jpg","pid":4},{"model_id":"20250","model_alis":"苹果iPhone 5S 移动4G (A1530)","img_url":"http:\/\/p4.qhmsg.com\/t015f4b45d64208feb4.jpg","pid":4},{"model_id":"19826","model_alis":"苹果iPhone 5S 联通版 (A1528)","img_url":"http:\/\/p6.qhmsg.com\/t01ddf19cbaa3a791b7.jpg","pid":4},{"model_id":"20503","model_alis":"苹果iPhone 5S 移动版 (A1518)","img_url":"http:\/\/p6.qhmsg.com\/t01ddf19cbaa3a791b7.jpg","pid":4},{"model_id":"20169","model_alis":"苹果iPhone 5S 电信版 (A1533)","img_url":"http:\/\/p0.qhmsg.com\/t0178461f7a5c781648.jpg","pid":4},{"model_id":"20450","model_alis":"苹果iPhone 5S 港版 (A1530)","img_url":"http:\/\/p0.qhmsg.com\/t01d6cc12484802289f.jpg","pid":4},{"model_id":"20700","model_alis":"苹果iphone 4s 国行","img_url":"http:\/\/p0.qhmsg.com\/t01e302dbcd00e7a799.jpg","pid":2},{"model_id":"14515","model_alis":"苹果iPhone 4S 电信版","img_url":"http:\/\/p4.qhmsg.com\/t0139c407fee8d937ac.jpg","pid":2},{"model_id":"20699","model_alis":"苹果iPhone 4s 港行","img_url":"http:\/\/p0.qhmsg.com\/t01e302dbcd00e7a799.jpg","pid":2},{"model_id":"20701","model_alis":"苹果iPhone 4s 水货 无锁版","img_url":"http:\/\/p0.qhmsg.com\/t01e302dbcd00e7a799.jpg","pid":2},{"model_id":"19827","model_alis":"苹果iPhone 5C","img_url":"http:\/\/p1.qhmsg.com\/t01cd4a2e326f55cd14.jpg","pid":5},{"model_id":"20752","model_alis":"苹果iPhone 5C 水货","img_url":"http:\/\/p1.qhmsg.com\/t01cd4a2e326f55cd14.jpg","pid":5},{"model_id":"20205","model_alis":"苹果iPhone 5C 电信版","img_url":"http:\/\/p1.qhmsg.com\/t01278e41519ab0e0d8.jpg","pid":5},{"model_id":"20722","model_alis":"苹果iPhone 5C 移动4G版","img_url":"http:\/\/p0.qhmsg.com\/t01d3dc50c4a1455e78.jpg","pid":5},{"model_id":"17254","model_alis":"苹果iPhone 5 联通版","img_url":"http:\/\/p7.qhmsg.com\/t011bc9e6b64f8339f5.jpg","pid":3},{"model_id":"17596","model_alis":"苹果iPhone 5 电信版","img_url":"http:\/\/p7.qhmsg.com\/t011bc9e6b64f8339f5.jpg","pid":3},{"model_id":"20751","model_alis":"苹果iPhone 5 水货","img_url":"http:\/\/p7.qhmsg.com\/t011bc9e6b64f8339f5.jpg","pid":3},{"model_id":"17346","model_alis":"苹果iPad mini（4G版）","img_url":"http:\/\/p3.qhmsg.com\/t01811d160457b44994.jpg","pid":14},{"model_id":"17343","model_alis":"苹果iPad mini（WiFi版）","img_url":"http:\/\/p6.qhmsg.com\/t01811d160457b44994.jpg","pid":14},{"model_id":"20546","model_alis":"小米红米Note 增强版 移动4G","img_url":"http:\/\/p0.qhmsg.com\/t016acb70aa1f0dbcb1.jpg","pid":20299},{"model_id":"20545","model_alis":"小米红米Note 增强版 联通4G","img_url":"http:\/\/p0.qhmsg.com\/t016acb70aa1f0dbcb1.jpg","pid":20299},{"model_id":"20544","model_alis":"小米红米Note 增强版 联通3G","img_url":"http:\/\/p0.qhmsg.com\/t016acb70aa1f0dbcb1.jpg","pid":20299},{"model_id":"20337","model_alis":"小米红米Note 增强版 移动3G","img_url":"http:\/\/p8.qhmsg.com\/t017220e1e0cb37a279.jpg","pid":20299},{"model_id":"20299","model_alis":"小米红米NOTE 标准版 移动3G","img_url":"http:\/\/p9.qhmsg.com\/t01533286d93c983245.jpg","pid":20299},{"model_id":"20442","model_alis":"小米红米Note 特别版","img_url":"http:\/\/p0.qhmsg.com\/t01f5b51bef8ef20167.jpg","pid":20299},{"model_id":"19870","model_alis":"小米M3 移动版","img_url":"http:\/\/p0.qhmsg.com\/t01d54915fc8064de57.jpg","pid":20229},{"model_id":"20267","model_alis":"小米M3 电信版","img_url":"http:\/\/p0.qhmsg.com\/t01b383545fe5f849cf.jpg","pid":20229},{"model_id":"20229","model_alis":"小米M3 联通版","img_url":"http:\/\/p5.qhmsg.com\/t0162abdc2a51334cf5.jpg","pid":20229},{"model_id":"20694","model_alis":"苹果iPhone 6 水货（全网通）","img_url":"http:\/\/p0.qhmsg.com\/t01068fe5e76aa7e910.jpg","pid":6},{"model_id":"20698","model_alis":"苹果iPhone 6 国行（A1586）三网通","img_url":"http:\/\/p0.qhmsg.com\/t01068fe5e76aa7e910.jpg","pid":6},{"model_id":"20696","model_alis":"苹果iPhone6 国行(A1589)移动定制版","img_url":"http:\/\/p0.qhmsg.com\/t0118c760fb150a3310.jpg","pid":6},{"model_id":"20771","model_alis":"苹果iPhone 6 港版","img_url":"http:\/\/p0.qhmsg.com\/t0118c760fb150a3310.jpg","pid":6},{"model_id":"20695","model_alis":"苹果iPhone 6 Plus 港行","img_url":"http:\/\/p0.qhmsg.com\/t0118c760fb150a3310.jpg","pid":6},{"model_id":"20779","model_alis":"苹果iPhone 6 Plus (A1593)移动定制版","img_url":"http:\/\/p0.qhmsg.com\/t0118c760fb150a3310.jpg","pid":6},{"model_id":"20693","model_alis":"苹果iPhone 6 Plus 水货(全网通)","img_url":"http:\/\/p0.qhmsg.com\/t0118c760fb150a3310.jpg","pid":6},{"model_id":"20697","model_alis":"苹果iPhone 6 Plus 国行(A1524)全网通","img_url":"http:\/\/p0.qhmsg.com\/t0118c760fb150a3310.jpg","pid":6},{"model_id":"20277","model_alis":"三星Galaxy S3 Neo+\/I9308i 移动版","img_url":"http:\/\/p9.qhmsg.com\/t01964a491c17b21727.jpg","pid":17125},{"model_id":"17125","model_alis":"三星Galaxy S3\/I9308 移动版","img_url":"http:\/\/p0.qhmsg.com\/t01c2395e39f110a70e.jpg","pid":17125},{"model_id":"15344","model_alis":"三星Galaxy S3\/I9300","img_url":"http:\/\/p6.qhmsg.com\/t01c12262a0a21b0bbb.jpg","pid":17125},{"model_id":"20373","model_alis":"华为荣耀3C\/H30-T10 移动版","img_url":"http:\/\/p0.qhmsg.com\/t01aa669fe6e41bfef8.jpg","pid":20373},{"model_id":"20140","model_alis":"华为荣耀3C\/H30-T00 移动版","img_url":"http:\/\/p0.qhmsg.com\/t01da0dca140e011c89.jpg","pid":20373},{"model_id":"20770","model_alis":"华为荣耀3C\/H30-L01M","img_url":"http:\/\/p0.qhmsg.com\/t01bfb9efe34044836a.jpg","pid":20373},{"model_id":"20469","model_alis":"华为荣耀3C\/H30-L02 联通TD-LTE版","img_url":"http:\/\/p0.qhmsg.com\/t0155ffd82889e6bdf2.jpg","pid":20373},{"model_id":"20269","model_alis":"华为荣耀3C\/H30-U10 联通版","img_url":"http:\/\/p4.qhmsg.com\/t014b58c12c13794b4e.jpg","pid":20373},{"model_id":"20470","model_alis":"华为荣耀3C\/H30-C00 电信版","img_url":"http:\/\/p0.qhmsg.com\/t0155ffd82889e6bdf2.jpg","pid":20373},{"model_id":"20453","model_alis":"华为荣耀3C\/H30-L01 移动TD-LTE版","img_url":"http:\/\/p0.qhmsg.com\/t01bfb9efe34044836a.jpg","pid":20373}]]};
window._inclient = window.location.href.queryUrl('inclient');
window._from = window.location.href.queryUrl('from');

window._isIE6 = !!window.ActiveXObject && !window.XMLHttpRequest;
// 品牌型号列表缓存
window._BrandListCache = {};
// 搜索缓存
window._SerachCache = {};

// 回收--其他
Dom.ready(function(){
    tcb.bindEvent(document.body, {
        // 担保交易
        '.js-360-danbao' : function(e){
            e.preventDefault();
            tcb.alert('','<div style="padding:10px;font-size:14px;"><h2 style="text-align:center; font-size:16px;margin-bottom:6px">360担保交易</h2><p>您寄出手机，回收款冻结至您的回收账户。360收到手机，立即打款给您。</p></div>',{
                width: 360,
                height: 150
            }, function(){return true});
        },
        // 获取更多评论(首页+评估结果页均用到)
        '.js-getmore-comment': function(e){
            e.preventDefault();

            var show_num = 8; // 每次显示的数量

            var wMe = W(this);

            var wLastShowTr = W('.comment-list .last-show'),
                wNextShowTr = wLastShowTr.nextSiblings('tr').filter(function(el, i){
                    return i<show_num;
                });

            wLastShowTr.removeClass('last-show');

            wLastShowTr = wNextShowTr.show().item(wNextShowTr.length-1).addClass('last-show');

            if (!wLastShowTr.nextSiblings('tr').length) {
                wMe.hide();
            }

            try{ W(document).fire('myresize');}catch(ex){ }	//resize page happen
            try{ W(document).fire('resize');}catch(ex){ }	//resize page happen
        }


    });

    //订单成功后显示提示信息-new
    function showDataNoticeNew(orderType, orderId, saler, tel){
        if (!W('#dataNoticeTpl_new').length) {
            return;
        }
        var fun = W('#dataNoticeTpl_new').html().tmpl();
        var html = fun({type:orderType, order_id:orderId||'', saler: saler||W('.order-sale-form .username').val()||'', tel: tel||W('.order-sale-form .mobile').val()||'' });
        tcb.alert('提示', html, { width:530, height: orderType=='offline'? 350:420}, function(){return true});
    }

    // 页面初始化
    function init(){

        //评估页到顶
        //setTimeout(function(){ try{!window.__notScrollInto && W('.tpl-pinggu .bread-path')[0].scrollIntoView(); }catch(ex){} }, 300);

        //评估结果页到顶
        setTimeout(function(){ try{!window.__notScrollInto && W('.tpl-pinggu_detail .phone-baseinfo-new')[0].scrollIntoView(); }catch(ex){} }, 300);

        var url_query = tcb.queryUrl(window.location.search);
        // 订单成功页面
        if(tcb.stripLastCharAt('/', window.location.pathname)=='/huishou/order_succ' && window.ORDER_SUCC_SALETYPE){
            showDataNoticeNew( window.ORDER_SUCC_SALETYPE, window.ORDER_SUCC_INFO['order_id'], window.ORDER_SUCC_INFO['ext']['account_holder'], window.ORDER_SUCC_INFO['tel']);
        }

    }
    init();

});


;/**import from `/resource/js/page/huishou/inc/search_suggest.js` **/
//搜索
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
            oWrap.style.top=oPos.offsetHeight + 0 + 'px';
            oWrap.style.left=oPos.offsetLeft - 0 +'px';
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
            var w=(me.oText.getAttribute('suggestWidth')-0 || oPos.offsetWidth) + 0 +"px"; //支持suggestWidth属性来设置suggest的宽度
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
    };

    window.suggest = function (data){
        var ar=[],
            menuData=data.result.suggest||[],
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

    Dom.ready(function(){

        if (W('#phoneBrandIpt').length) {
            //搜索suggest
            var oText = W('#phoneBrandIpt')[0],
                dataCache={};
            var cb=new ComboBox({oText:oText,
                onselectitem:function(){
                    var els = oText.form.elements;
                    for(var i =0;i<els.length;i++){
                        if(els[i].type=='submit') {
                            els[i].click();
                            setTimeout(function(){
                                oText.blur();
                            }, 100);
                            //W(cb.oWrap).hide();
                            return;
                        }
                    }
                },
                refreshData:function(){
                    var data = dataCache[oText.value];
                    if (data){
                        suggest(data);
                    }else {

                        //loadJs( BASE_ROOT +'/youpin/suggest?word='+encodeURIComponent(this.oText.value)+'&callback=window.suggest&t='+Math.random())
                        QW.Ajax.get('/huishou/aj_get_sj_suggest/?keyword=' + encodeURIComponent(this.oText.value), function(rs){
                            try{
                                rs = QW.JSON.parse(rs);

                                suggest(rs);
                            } catch (ex){}
                        });

                    }
                }
            });
            // 暂时注释，在分辨率低的显示器下，此处影响滚动条默认定位到顶部
            oText.focus();oText.blur();
        }
    });

})();

;/**import from `/resource/js/page/huishou/index.js` **/
(function(){
    // 热门机型
    if (window._HOT_MODELS && window._HOT_MODELS.length) {
        var HotModels = window._HOT_MODELS;

        var HotModelsCache = window._BrandListCache['999999'] = [[], []];
        HotModels.forEach(function(item, i){
            HotModelsCache[0].push({
                'img_url': item['img'],
                'model_alis': item['name'],
                'model_id': i,
                'sub_arr': ['placeholder'],// 随便加一个属性用来占位（这个属性木有其他用处），表示当前model还有子model
                'pid': 0,
                'rec_price': item['price']
            });

            var SubModels = item['sub_model'];
            if (SubModels && SubModels.length) {
                SubModels.forEach(function (sub_item) {
                    HotModelsCache[1].push({
                        'img_url': sub_item['img'],
                        'model_alis': sub_item['name'],
                        'model_id': sub_item['model_id'],
                        'pid': i
                    });
                });
            }
        });
    }
}());

// 回收--首页
Dom.ready(function(){
    // 绑定事件
    tcb.bindEvent(document.body, {
        // 空品牌，品牌占位块
        '.brand-box .brand-item-empty': function(e){
            e.preventDefault();
        },
        // 选择品牌
        '.brand-box .brand-item': {
            'click': function (e) {
                e.preventDefault();

                var wMe = W(this),
                    wBrandBox = wMe.ancestorNode ('.brand-box')
                // 收起更多
                if(wMe.hasClass('brand-item-up')) {
                    var wDefaultLast = wBrandBox.query('.brand-item-default-last');

                    wDefaultLast.nextSiblings('a').hide();
                    wDefaultLast.nextSiblings('.brand-item-more').show();
                    return
                }

                // 更多品牌
                if (wMe.hasClass('brand-item-more')) {
                    wMe.hide().siblings('a').show();
                }
                // 选择品牌
                else {
                    wMe.addClass('brand-item-curr').siblings('.brand-item-curr').removeClass('brand-item-curr');

                    var params = {
                        'bid': wMe.attr('data-bid'),
                        'pid': 0
                    };
                    var wModelWrap = wMe.ancestorNode('.hs-f-content-brand').one('.base-brand-model-box');
                    if(wBrandBox.hasClass('brand-box-mobile')){
                        params['category_id'] = '1'
                        showModelList(wModelWrap, params, false);
                    }else if(wBrandBox.hasClass('brand-box-notebook')){
                        params['category_id'] = '10'
                        getNotebookModelList(wModelWrap, params, false);
                    }
                }

                tcb.gotoTop.goPlace(W('.bd-content').getRect()['top']);

                try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
            }
        },
        //展示某品牌所有的型号
        '.brand-model-box .show-brand-all' : function(e){
            e.preventDefault();

            var wMe = W(this);
            var params = {
                'bid': wMe.attr('data-bid'),
                'pid': +wMe.attr('data-pid')||0,
                'step': +wMe.attr('data-step')||0,
                'category_id': +wMe.attr('data-category-id')||0
            };

            var wModelWrap = wMe.ancestorNode('.brand-model-box');
            if (params.category_id=='10'){
                getNotebookModelList(wModelWrap, params, true)
            } else {
                showModelList(wModelWrap, params, true);
            }

            try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
        },
        // 选择机型（有评估地址，直接跳到评估地址，否则进入子分类）
        '.brand-model-box .check-item': function(e){
            var wMe = W(this),
                m_id = wMe.attr('data-id');

            if(wMe.attr('href')=='#'|| m_id){
                e.preventDefault();

                //var hash = tcb.parseHash(window.location.hash);

                var params = {
                    'bid': wMe.attr('data-bid'),
                    'pid': +m_id || 0,
                    'step': +wMe.attr('data-step') || 0,
                    'category_id': +wMe.attr('data-category-id')||0
                };
                var wModelWrap = wMe.ancestorNode('.brand-model-box');
                if (params.category_id=='10'){
                    getNotebookModelList(wModelWrap, params, true)
                } else {
                    showModelList(wModelWrap, params, true);
                }

                // 热收机型
                if (wModelWrap.hasClass('hs-hot-model-list')){
                    wModelWrap.appendChild('<a class="check-item-back" data-bid="999999" href="#">返回</a>');
                } else {
                    tcb.gotoTop.goPlace(W('.bd-content').getRect()['top']);
                }
            }

            try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
        },
        // 热门机型返回
        '.hs-hot-model-list .check-item-back': function (e) {
            e.preventDefault();

            var wMe = W(this);

            var params = {
                'bid': wMe.attr('data-bid'),
                'pid': 0,
                'step': 0,
                'category_id' : '1'
            };
            var wModelWrap = wMe.ancestorNode('.brand-model-box');
            showModelList(wModelWrap, params, true);

            try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
        },
        // 搜索返回
        '.search-brand-model-box .check-item-back': function(e){
            e.preventDefault();

            var wMe = W(this),
                wRecycleCateTab = W ('.recycle-cate-tab')

            wMe.ancestorNode('.search-brand-model-box').hide();

            wRecycleCateTab.show();
            var wItemSelected = wRecycleCateTab.query('.item-selected'),
                cate_id = '1'
            if (wItemSelected&&wItemSelected.length){
                cate_id = wItemSelected.attr('data-cate-id')
            }

            if (cate_id=='1'){
                W('.brand-box-mobile').show()
            } else if(cate_id=='10'){
                W('.brand-box-notebook').show()
            }
            W ('.base-brand-model-box').show()

            tcb.gotoTop.goPlace(W('.bd-content').getRect()['top'])

            try{ W(document).fire('myresize');}catch(ex){}	//resize page happen

        },
        // 切换回收类别（1：手机；2：笔记本；3：家电；）
        '.recycle-cate-tab .item': function(e){
            e.preventDefault()

            var wMe = W(this)

            //if (wMe.hasClass('item-selected')){
            //    return
            //}
            wMe.addClass('item-selected').siblings('.item-selected').removeClass('item-selected')

            var cate_id = wMe.attr('data-cate-id')

            var
                // wModelWrap = wMe.ancestorNode ('.hs-f-content-brand').one ('.base-brand-model-box'),
                wBrandBox = W ('.brand-box'),
                wBrandBoxM = W ('.brand-box-mobile'),
                wBrandBoxPc = W ('.brand-box-notebook'),
                wBaseBrandModelBox = W ('.base-brand-model-box'),
                wSearchBrandModelBox = W ('.search-brand-model-box'),
                wBrandItemCurr, params

            wBrandBox.hide()
            wSearchBrandModelBox.hide()

            if(cate_id=='1'){
                // 手机
                wBrandBoxM.show()
                wBaseBrandModelBox.show()

                wBrandItemCurr = wBrandBoxM.query ('.brand-item-curr')
                if (wBrandItemCurr && wBrandItemCurr.length) {
                    params = {
                        'bid' : wBrandItemCurr.attr ('data-bid'),
                        'pid' : 0,
                        'step': 0,
                        'category_id': cate_id
                    }
                    showModelList (wBaseBrandModelBox, params, false)
                } else {
                    wBaseBrandModelBox.html('')

                    try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
                }
            } else if(cate_id=='10') {
                // 笔记本
                wBrandBoxPc.show ()
                wBaseBrandModelBox.show ()

                wBrandItemCurr = wBrandBoxPc.query ('.brand-item-curr')
                if (wBrandItemCurr && wBrandItemCurr.length) {
                    params = {
                        'bid' : wBrandItemCurr.attr ('data-bid'),
                        // 'bid' : 10,
                        'step': 0,
                        'category_id': cate_id
                    }
                    getNotebookModelList (wBaseBrandModelBox, params, false)
                } else {
                    wBaseBrandModelBox.html('')

                    try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
                }

            } else {
                // 白色家电
                wBrandBox.hide ()
                wBaseBrandModelBox.show ()

                getWhiteGoodsModelList(wBaseBrandModelBox)
            }
        }
    });

    // 手机型号搜索
    W('#brandSearchForm').on('submit', function(e){
        e.preventDefault();

        var wIpt = W('#phoneBrandIpt');

        var kw = wIpt.val().trim();
        if(kw.length>0){
            var models = window._SerachCache[kw];
            if (models) {
                var params = {
                    'bid': -1,
                    'pid': 0,
                    'step': 0
                };
                var wWrap = W('.search-brand-model-box');
                wWrap.show();
                renderModelList(wWrap, models, params, true);

                wWrap.appendChild('<a class="check-item-back" data-for="search" href="#">返回</a>');

                W('.brand-box').hide();
                W('.base-brand-model-box').hide();
                W('.recycle-cate-tab').hide();
                W('#phoneBrandIpt').blur();

                try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
            } else {
                QW.Ajax.get('/huishou/aj_get_sj_search/?keyword=' + encodeURI(kw) +( _inclient? '&inclient=1' : '' ) +( _from? '&from='+_from : '' ) , function(data){

                    data = QW.JSON.parse(data);

                    if(data.errno){
                        alert('抱歉，搜索失败，请稍后再试。'+data.errmsg);
                    }else{
                        models = data.result.data;
                        window._SerachCache[kw] = models;

                        var params = {
                            'bid': -1,
                            'pid': 0,
                            'step': 0
                        };
                        var wWrap = W('.search-brand-model-box');
                        wWrap.show();
                        renderModelList(wWrap, models, params, true);

                        wWrap.appendChild('<a class="check-item-back" data-for="search" href="#">返回</a>');

                        W('.brand-box').hide();
                        W('.base-brand-model-box').hide();
                        W('.recycle-cate-tab').hide();
                        W('#phoneBrandIpt').blur();
                    }

                    try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
                });
            }
        } else {
            wIpt.shine4Error();
        }

    });


    /**
     * @param params  目前包含3个参数：bid，品牌id，pid，父分类id，step，当前步骤
     * @param showall 是否显示全部项，默认不显示
     */
    /**
     * 显示手机型号列表
     *
     * @param wWrap   手机型号列表容器（必须参数）
     * @param params  目前包含3个参数：bid，品牌id，pid，父分类id，step，当前步骤
     * @param showall 是否显示全部项，默认不显示
     */
    function showModelList(wWrap, params, showall){
        var bid = params['bid'];

        if(window._BrandListCache[bid]){

            var models = window._BrandListCache[bid];
            renderModelList(wWrap, models, params, showall);
        }else{
            var request_url = tcb.setUrl2('/huishou/getModels', { 'id':bid })
            QW.Ajax.get(request_url , function(data){
                data = QW.JSON.parse(data);

                if(!data.errno){

                    var models = data.result.data;
                    window._BrandListCache[bid] = models;
                    renderModelList(wWrap, models, params, showall);
                }
            });
        }
    }
    /**
     * 输出型号列表
     *
     * @param wWrap 型号输出容器
     * @param models_arr 型号列表
     * @param params 目前包含3个参数：bid，品牌id，pid，父分类id，step，当前步骤
     * @param showall 是否显示全部项，默认不显示
     */
    function renderModelList(wWrap, models_arr, params, showall){
        wWrap = wWrap || W('.brand-model-box');
        var bid = params['bid'],
            pid = +params['pid'] || 0,
            step = +params['step'] || 0,
            category_id = +params['category_id'] || 0,
            models = models_arr[step],
            max_step = models_arr.length-1;

        var str = '';
        var SHORT_SHOW_NUM = 15;
        var max = showall? 99999 : SHORT_SHOW_NUM;

        if(!models || models.length==0){
            wWrap.html('<p style="padding:50px; text-align:center; font-size:14px;">暂无结果。</p>')
        }else{

            var count = 0
            for(var i=0; i<models.length; i++){
                var item = models[i];
                item.pid = item.pid || 0;

                // 参数的pid和数据的pid相等
                if(item.pid==pid){
                    count++
                    if (count > max) {
                        continue
                    }

                    if (step < max_step && (item.sub_arr && item.sub_arr.length)) {
                        // 非最后一步，并且拥有子项

                        str += '<a class="check-item" href="#" ' +
                        'title="' + item.model_alis + '" ' +
                        'data-bid="' + bid + '" ' +
                        'data-step="' + (step + 1) + '" ' +
                        'data-id="' + item.model_id + '" ' +
                        'data-name="' + item.model_alis + '" ' +
                        'data-category-id="' + item.category_id + '">' +
                        '<div class="img"><img src="' + item.img_url + '" height="60"></div>' +
                        '<span class="phone-name">' + item.model_alis + '</span>' +
                        (item.rec_price ? ('<span class="phone-recprice">热收价 ￥' + item.rec_price + '</span>') : '') + '</a>'
                    } else {

                        str += '<a class="check-item" href="'+tcb.setUrl2('/huishou/pinggu/', { 'model_id': item.model_id })+'" title="'+item.model_alis+'">' +
                        '<div class="img"><img src="'+item.img_url+'" height="60"></div>' +
                        '<span class="phone-name">'+item.model_alis+'</span></a>'
                    }
                }
            }

            if(!showall && count>SHORT_SHOW_NUM){
                str += '<a class="check-item c5b0 show-brand-all" href="#" data-bid="'+bid+'" data-step="'+step+'" data-pid="'+pid+'" data-category-id="'+category_id+'">全部&gt;</a>';
            }

            wWrap.html(str)
        }

        try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
    }

    // 触发默认的品牌型号选择
    function activeDefaultBrandModel(){
        var wBrandBox = W('.brand-box').filter(function(el){return W(el).isVisible()}).first(), // 品牌
            wModelBox;// 型号

        if( !(wBrandBox && wBrandBox.query('.brand-item').length) ){
            return false;
        }
        var wFireItem;

        var hashQuery = tcb.parseHash();
        if(hashQuery['brand']){
            wFireItem = wBrandBox.query('[data-bid="'+hashQuery['brand']+'"]');
        }
        wFireItem = wFireItem&&wFireItem.length ? wFireItem : null;//W('.brand-list .brand-item').first();

        // 有要触发的型号
        if (wFireItem) {
            if (!wFireItem.isVisible()) {
                wBrandBox.query('.brand-item').show();
                wBrandBox.query('.brand-item-more').hide();
            }

            wFireItem.fire('click');

            if(!hashQuery['pid']){
                return false;
            }
            wModelBox = W('.base-brand-model-box');

            var loop_count = 0;
            setTimeout(function(){
                loop_count++;
                var args = arguments;
                var wModelItem = wModelBox.query('[data-id="'+hashQuery['pid']+'"]');
                if(!wModelItem.length&&loop_count<500){
                    setTimeout(function(){
                        args.callee();
                    }, 10);
                } else {
                    wModelItem.length && wModelItem.fire('click');
                }
            }, 500);
        }
    }

    /**
     * 获取笔记本机型列表
     * @param wWrap
     * @param params
     * @param showall
     */
    function getNotebookModelList(wWrap, params, showall){
        var bid = params['bid' ],
            cache_key = 'notebook-'+bid

        if(window._BrandListCache[cache_key]){

            var models = window._BrandListCache[cache_key]

            renderModelList(wWrap, models, params, showall)

        }else{
            var request_url = tcb.setUrl2('/huishou/getModels', { category:10, 'id':bid })
            QW.Ajax.get(request_url , function(data){
                data = QW.JSON.parse(data)

                if(!data.errno){

                    var models = data.result.data

                    window._BrandListCache[cache_key] = models

                    renderModelList(wWrap, models, params, showall)
                }
            })
        }
    }
    // 获取家电机型列表
    function getWhiteGoodsModelList(wWrap) {
        var html_fn = W('#JsHSWhiteGoodsModelListTpl').html().trim().tmpl(),
            html_st = html_fn()
        wWrap.html(html_st)
    }

    function init() {
        if (W('#phoneBrandIpt').length){
            new PlaceHolder('#phoneBrandIpt');
        }
        // 触发默认的品牌型号选择
        var wBrandBox = W('.brand-box');
        if( wBrandBox && wBrandBox.query('.brand-item').length > 0 ){
            activeDefaultBrandModel();
        }

        //回收轮播图
        var $banners = $("#nav-banners");
        if($banners.find(".swiper-slide").length > 1) {
            new Swiper('.swiper-container', {
                speed: 500,
                autoplay: 5000,
                paginationClickable: true,
                pagination: '.swiper-pagination',
                autoplayDisableOnInteraction: false,
                simulateTouch: false,
                loop: true
            });
        }

        // 首页带有hsuser参数，弹出扫描二维码查看订单弹窗
        var
            pathname = window.location.pathname,
            url_query = window.location.search.queryUrl(),
            hsuser = url_query['hsuser'] || false;

            pathname = tcb.trim(pathname, '/');

        if (hsuser && pathname=='huishou'){
            W('.js-myorder-enter-qrcode-trigger').fire('click');
        }

        //限时回收倒计时
        if (window._END_TIME && window._NOW_TIME && $('#js-hot-model-countdown').length){
            Bang.startCountdown (window._END_TIME, window._NOW_TIME,$('#js-hot-model-countdown'))
        }

    }
    init();
});


;/**import from `/resource/js/page/huishou/inc/pinggu_options.js` **/
// 评估流程中评估项的处理
(function(){
    var $ModelSKUAttr = W('#ModelSKUAttr'),
        $ModelSpecialOptions = W('#ModelSpecialOptions');
    if ( !($ModelSKUAttr && $ModelSKUAttr.length) ) {
        return ;
    }

    // 获取型号sku选项
    function getModelSkuOptions(callback){
        var model_id = tcb.queryUrl(window.location.href, 'model_id');
        var request_url = '/huishou/doGetSkuOptions',
            params = {
                model_id: model_id || 6
            };

        QW.Ajax.get(request_url, params, function (res) {
            res = QW.JSON.parse(res);

            if ( !res['errno'] ) {

                // 处理型号sku属性数据
                handleModelSkuOptions(res['result']);

                typeof callback==='function' && callback();
            }
            else {
                alert(res['errmsg']);
            }

        });
    }
    // 获取型号sku确定后的专有评估选项
    function getModelSpecialOptions(callback){
        var model_id = tcb.queryUrl(window.location.href, 'model_id');
        var request_url = '/huishou/doGetPingguGroup',
            params = {
                model_id: model_id || 6
            };

        QW.Ajax.get(request_url, params, function (res) {
            res = QW.JSON.parse(res);

            if ( !res['errno'] ) {
                var group_data = res['result']
                if (!(group_data&&group_data.length)){
                    group_data = group_data['pinggu_group']
                }
                // 处理型号sku属性数据
                handleModelSpecialOptions(group_data);

                typeof callback==='function' && callback();

            }
            else {
                alert(res['errmsg']);
            }

        });
    }

    // 处理型号的sku数据，成为可用的格式
    function handleModelSkuOptions(sku_data){
        var sku_attr_map  = {} // sku属性组合到sku的唯一id的映射
            ,sku_attr_cate = [] // sku属性分类名称
            ,sku_attr_group_by_cate = [] // 根据每一个sku属性分类，组合sku属性
            ,sku_attr_group_by_cate_pushed_in = []

        var sku_data_list = sku_data['list']
            ,sku_data_map = sku_data['map']

        QW.ObjectH.map(sku_data_list, function (item_group, key) {
            var attr_ids = [];

            item_group.forEach(function(item, i, item_group){
                attr_ids.push(item['attr_valueid']);

                // 遍历第一个sku属性组的时候，将属性分类名称获取出来
                if (sku_attr_cate.length < item_group.length) {
                    sku_attr_cate.push({
                        options_cate_id : item['attr_id'],
                        options_cate_name : item['attr_name']
                    });
                }

                // sku属性所在的位置项不是数组，那么初始化设置为空数组，以备往里添加数据项
                if ( !(sku_attr_group_by_cate[i] instanceof Array) ){
                    sku_attr_group_by_cate[i] = [];
                }
                // 加到属性组内的属性，不再重复添加
                if ( tcb.inArray(item['attr_valueid'], sku_attr_group_by_cate_pushed_in) == -1 ){

                    sku_attr_group_by_cate_pushed_in.push(item['attr_valueid']);
                    sku_attr_group_by_cate[i].push({
                        option_id: item['attr_valueid'],
                        option_name: item['attr_valuename']
                    });
                }

            });

            // sku属性组合到sku的唯一id的映射
            var
                sku_attr_map_key = attr_ids.join(',')
                ,sku_attr_map_val = key

            sku_attr_map[sku_attr_map_key] = sku_attr_map_val;

        });

        // 遍历sku分类属性组,进行排序
        tcb.each(sku_attr_group_by_cate, function(i, group){
            var
                options_cate_id = sku_attr_cate[i]['options_cate_id'] // 分类id
                ,attr_sort = sku_data_map[options_cate_id] // 属性顺序

            var
                ext_index = 999

            group.sort(function(a, b){
                var
                    a_index = tcb.inArray(+a['option_id'], attr_sort)
                    ,b_index = tcb.inArray(+b['option_id'], attr_sort)

                a_index = a_index===-1 ? ext_index : a_index
                b_index = b_index===-1 ? ext_index : b_index

                // 扩展索引每次比较完成之后都+1,这样可以实现不在排序数组中的值,按顺序依次加到最后
                ext_index++

                // 比较当前属性id在排序map中的顺序,map中靠前的提到前边(即相减小于0)(注意点:id需要化为整数,保持和map中的类型一致)
                return a_index - b_index
            });
        });


        tcb.cache('sku_attr_map', sku_attr_map);
        tcb.cache('sku_attr_cate', sku_attr_cate);
        tcb.cache('sku_attr_group_by_cate', sku_attr_group_by_cate);
    }
    // 处理型号的专有评估选项，成为可用的格式
    function handleModelSpecialOptions(group_data){
        var combo_options = [], // 聚合评估选项
            combo_options_default = {}; // 聚合选项中被默认选择的选项

        var special_options_cate = [], // 专有评估选项分类名称、id
            special_options_group_list = []; // 专有评估选项组列表

        group_data.forEach(function (item, i) {
            if (item['pinggu_group_juhe']==1){
                // 聚合选项

                var options = item['pinggu_group_options'];
                if (options && options.length) {

                    options.forEach(function(options_item){
                        if (options_item['is_default']==1){
                            // 加入默认被选中的聚合组
                            var group_id = options_item['group_id'];

                            combo_options_default[ group_id ] = {
                                option_id: options_item['option_id'],
                                option_name: options_item['option_name']
                            };
                        } else {
                            // 其他没有被选中的聚合组
                            combo_options.push({
                                group_id: options_item['group_id'],
                                option_id: options_item['option_id'],
                                option_name: options_item['option_name']
                            });
                        }
                    });
                }

            }
            else {
                // 单独选项

                // 专有属性分类名称、id
                special_options_cate.push({
                    options_cate_id : item['pinggu_group_id'],
                    options_cate_name : item['pinggu_group_name']
                });

                var options = item['pinggu_group_options'],
                    options_format = [];
                if (options && options.length) {

                    options.forEach(function(options_item){

                        options_format.push({
                            option_id: options_item['option_id'],
                            option_name: options_item['option_name']
                        });
                    });
                }
                special_options_group_list.push(options_format);

            }

        });

        tcb.cache('combo_options', combo_options);
        tcb.cache('combo_options_default', combo_options_default);

        tcb.cache('special_options_cate', special_options_cate);
        tcb.cache('special_options_group_list', special_options_group_list);
    }

    // 输出sku属性选项
    function renderSkuOptions(sku_option_groups){

        var str = getRequiredChoiceOptionsHtml(sku_option_groups, true);

        $ModelSKUAttr.insertAdjacentHTML('beforeend', str);
    }
    // 输出型号专有评估选项
    function renderSpecialOptions(special_option_groups){

        var str = getRequiredChoiceOptionsHtml(special_option_groups, false);

        $ModelSpecialOptions.insertAdjacentHTML('beforeend', str);
    }
    // 输出聚合属性选项
    function renderComboOptions(combo_options, combo_options_default, col){

        var str = getComboOptionsHtml(combo_options, combo_options_default, col);

        $ModelSpecialOptions.insertAdjacentHTML('beforeend', str);
    }

    // 获取必选选项列表的html
    function getRequiredChoiceOptionsHtml(option_group_list, is_sku){
        // var pre_checked_sku = tcb.cache('pre_checked_sku')||['16'],
        //     pre_checked_special = tcb.cache('pre_checked_special')||['232']
        var _global = JSON.parse(tcb.queryUrl(window.location.search, '_global')||'{}')
        var pre_checked_sku = _global.sku||[],
            pre_checked_special = _global.special||[]

        var data = {
                option_group_list : option_group_list,
                is_sku            : is_sku || false,
                option_desc_ids   : window.Pinggu.getOptionDescIds (),
                pre_checked_sku   : pre_checked_sku,
                pre_checked_special : pre_checked_special
            },
            fn = W ('#JsHSPingguRequiredChoiceOptionsTpl').html ().trim ().tmpl ()

        return fn (data)
    }
    // 获取聚合属性选项的html
    function getComboOptionsHtml(combo_options, combo_options_default, col){
        var
            data = {
                combo_options         : combo_options,
                combo_options_default : combo_options_default,
                col                   : col || 5,
                option_desc_ids       : window.Pinggu.getOptionDescIds ()
            },
            fn = W ('#JsHSPingguMixChoiceOptionsTpl').html ().trim ().tmpl (),
            str = fn (data)

        return str
    }
    // 获取属性输出的列数
    function getOptionsColByCateId(attr_cate_id){
        var col = 2,
            col_arr = [1, 2, 3, 4, 5], // 列数数组
            col_map = {
                'combo': col_arr[3], // 聚合选项4列
                '2': col_arr[2], // 容量3列
                '4': col_arr[3], // 颜色4列
                '6': col_arr[1]  // 渠道2列
            };
        col = col_map[ attr_cate_id ] || col;

        return col;
    }

    // 获取下一个选项组
    function getNextStepObj($Cur) {
        var $Next;

        var $ModelSKUAttr = $Cur.ancestorNode('#ModelSKUAttr');
        if ($ModelSKUAttr && $ModelSKUAttr.length) {

            $Next = getNextSKUObj($Cur)

            if (!$Next) {
                // 在sku属性组中没有下一组了,那么在专有选项中来取

                $Next = W('#ModelSpecialOptions .phone-info-choice').first()
            }
        }
        else {
            // 当前选项在其他选项的block
            $Next = $Cur.nextSibling('.phone-info-choice');
        }

        return $Next;
    }

    /**
     * 获取下一个SKU属性组对象
     *
     * @param $Cur
     * @returns {*}
     */
    function getNextSKUObj($Cur) {
        // 当前选项在sku属性选项的block内
        var
            $ModelSKUAttr = $Cur.ancestorNode('#ModelSKUAttr')
            ,$Next = $Cur.nextSiblings('.phone-info-choice')

        if ( $Next&&$Next.length ) {
            $Next.removeNode();
        }

        var next_sku_attr_pos = $ModelSKUAttr.query('.phone-info-choice').length;

        // 输出指定位置sku属性选项
        var
            sku_attr_group_by_cate = tcb.cache('sku_attr_group_by_cate')
            ,sku_attr_cate = tcb.cache('sku_attr_cate')

        // $Cur本身为最后一组sku属性
        if ( !sku_attr_cate[next_sku_attr_pos] ) {
            return
        }

        var
            // 已经被选中的选项
            $CheckedOptions = $ModelSKUAttr.query('.check-item-on')
            // 选中选项的id组
            ,checked_attr_id = []

        $CheckedOptions.forEach(function(el, i){
            checked_attr_id.push(W(el).attr('data-select'));
        });
        checked_attr_id = checked_attr_id.join(',')+',';

        var sku_attr_map = tcb.cache('sku_attr_map'),
            sku_attr_map_id = QW.ObjectH.keys(sku_attr_map);

        // 下一个sku属性可用id
        var next_sku_attr_ids = [];
        sku_attr_map_id.forEach(function(id_str){
            if ( id_str.indexOf(checked_attr_id) === 0 ){

                var id_str_tmp = id_str.substring(checked_attr_id.length);

                id_str_tmp = id_str_tmp.split(',')[0];

                // 下一个sku属性id内不包含此id,那么将此id加入其中
                if ( tcb.inArray ( id_str_tmp, next_sku_attr_ids ) == -1 ) {
                    next_sku_attr_ids.push ( id_str_tmp );
                }
            }
        });

        // 过滤当前组可用的属性选项
        var group_list = sku_attr_group_by_cate[next_sku_attr_pos].filter(function(item){

            return tcb.inArray(item['option_id'], next_sku_attr_ids) !== -1;
        });
        var sku_option_groups = [
            {
                group_name: sku_attr_cate[next_sku_attr_pos]['options_cate_name'],
                group_list: group_list,
                col: getOptionsColByCateId(sku_attr_cate[next_sku_attr_pos]['options_cate_id'])
            }
        ];
        renderSkuOptions(sku_option_groups)

        // 下一组sku属性只有一个选项...那么..
        // 将唯一的选项选中,然后再继续取下一个..
        if ( next_sku_attr_ids.length === 1 ) {
            $Cur = $Cur.nextSibling('.phone-info-choice')

            $Cur.query('.check-item').addClass('check-item-on')

            return getNextSKUObj($Cur)
        } else {
            $Next = $Cur.nextSibling('.phone-info-choice')

            return $Next.hasClass('phone-info-choice-pre-checked') ? getNextSKUObj($Next) : $Next
        }

    }

    function renderAllPreCheckedSku($PrevSkuGroup) {
        if (!($PrevSkuGroup && $PrevSkuGroup.length && $PrevSkuGroup.hasClass('phone-info-choice-pre-checked'))) {
            return
        }

        renderAllPreCheckedSku(getNextSKUObj($PrevSkuGroup))
    }

    Dom.ready(function(){
        var
            // 表示是否有sku属性显示出来
            sku_show_flag = false

        // 获取sku属性选项并处理
        getModelSkuOptions(function(){
            // 输出sku属性选项第一组
            var
                sku_attr_group_by_cate = tcb.cache('sku_attr_group_by_cate')
                ,sku_attr_cate = tcb.cache('sku_attr_cate')
                ,sku_option_groups = []
                ,skip_flag = false

            // 遍历sku属性组,获取可输出的所有组合
            // 从最开始位置开始,可选属性数量为1的,都将其push到要输出的数组中,
            // 遇到属性数量大于1的,那么就从那个位置之后的都跳过~
            tcb.each(sku_attr_group_by_cate, function(i, group){
                if ( skip_flag ) {
                    return
                }
                var
                    col = getOptionsColByCateId(sku_attr_cate[i]['options_cate_id'])

                sku_option_groups.push({
                    group_name: sku_attr_cate[i]['options_cate_name'],
                    group_list: group,
                    col: col
                })

                if ( group.length > 1 ) {

                    skip_flag = true
                }

            })

            // 输出sku选项属性组
            renderSkuOptions(sku_option_groups)
            // 根据已经输出的Sku属性组,最后一组是已经被预选中,
            // 那么继续输出后边紧挨着的相连的预选中Sku评估项
            renderAllPreCheckedSku(W('#ModelSKUAttr .phone-info-choice').last())


            // 显示有多个选项的sku属性组,单个的直接隐藏不显示,并且将唯一选项设置为选中状态
            var
                $choice = $ModelSKUAttr.query('.phone-info-choice')

            $choice.forEach(function(el){
                var
                    $el = W(el)
                    ,$item = $el.query('.check-item')

                if ( $item.length > 1 ) {

                    $el.fadeIn()

                    sku_show_flag = true // 已有sku属性组显示出来,那么就不需要显示专有属性项了
                } else {
                    $item.addClass('check-item-on')
                }
            })


            // 获取专有属性选项并处理
            getModelSpecialOptions(function(){
                // 输出专有选项组
                var special_options_cate = tcb.cache('special_options_cate'),
                    special_options_group_list = tcb.cache('special_options_group_list'),
                    special_options_groups = [];
                special_options_cate.forEach(function(cate_item, i){
                    var options_col = getOptionsColByCateId(cate_item['options_cate_id']);

                    special_options_groups.push({
                        group_name: cate_item['options_cate_name'],
                        group_list: special_options_group_list[i],
                        col: options_col
                    });
                });
                renderSpecialOptions(special_options_groups);

                // 没有sku属性显示出来,直接显示第一个专有属性组(即:所有sku属性组都只有一个单独的选项,默认都被选中了)
                if ( !sku_show_flag ) {
                    W('#ModelSpecialOptions .phone-info-choice').first().fadeIn()
                }

                // 输出聚合属性选项
                var combo_options = tcb.cache('combo_options'),
                    combo_options_default = tcb.cache('combo_options_default'),
                    combo_col = getOptionsColByCateId('combo');
                renderComboOptions(combo_options, combo_options_default, combo_col);

            })

        })

    })

    window.Pinggu = window.Pinggu || {}

    tcb.mix(window.Pinggu, {
        renderSkuOptions: renderSkuOptions,
        getOptionsColByCateId: getOptionsColByCateId,
        getNextStepObj: getNextStepObj
    })

}())

;/**import from `/resource/js/page/huishou/inc/pinggu_options_desc.js` **/
!function () {

    // 获取有描述信息的选项id集合
    function getOptionDescIds () {

        return [ '6', '62', '66', '68', '70', '72', '78', '80', '246', '82', '22', '26', '40', '42'/*, '36', '108', '116'*/ ]
    }

    // 获取选项描述信息
    function getOptionDesc (option_id) {

        var descMap = {
            // 1个月以上
            '6'  : {
                img  : [ 'https://p.ssl.qhimg.com/t0134b483f8fde986fe.png' ],
                desc : [ 'iPhone手机可根据序列号或者IMEI号查询到保修情况，将序列号或IMEI号输入以下网址进行查询。<br>查询地址：<a href="https://selfsolve.apple.com/agreementWarrantyDynamic.do?locale=zh_CN" target="_blank">https://selfsolve.apple.com/agreementWarrantyDynamic.do?locale=zh_CN</a><br>如何查看iPhone手机的序列号或IMEI号？<br>在 “设置”>通用>关于本机”中查看序列号或IMEI号。' ]
            },
            // 全新手机
            '62' : {
                img  : [ 'https://p.ssl.qhimg.com/t01dbd8d82f6882dab7.png' ],
                desc : [ '仅仅指未拆开过包装的手机。' ]
            },
            // 外壳完好
            '66' : {
                img  : [ ],
                desc : [ '外观无任何磕伤，磨伤，划痕或瑕疵。' ]
            },
            // 外壳有划痕
            '68' : {
                img  : [ 'https://p2.ssl.qhimg.com/t0101c28965ecc81cf4.png' ],
                desc : [ '外壳边框或背板有明显划痕。' ]
            },
            // 外壳有磕碰或掉漆
            '70' : {
                img  : [ 'https://p3.ssl.qhimg.com/t0101a0ab22b9032d1c.png' ],
                desc : [ '边框或者背板有磕碰角或裂痕，或出现掉漆现象。' ]
            },
            // 机身变形或残裂
            '72' : {
                img  : [ 'https://p.ssl.qhimg.com/t0104b04fa105e9f7aa.png' ],
                desc : [ '机身的外壳有弯曲，变形或翘起，屏幕与外壳出现分离的现象。' ]
            },
            // 无划痕/无使用痕迹
            '78'  : {
                img  : [],
                desc : [ '手机未使用过或使用期间一直贴膜保护，屏幕在光照下无可见划痕或磨损。' ]
            },
            // 屏幕轻微划痕
            '80' : {
                img  : [ 'https://p3.ssl.qhimg.com/t0192cd49ac29dc86a0.png'],
                desc : [ /*'在不贴膜的情况下，屏幕有轻微划痕。'*/ ]
            },
            // 屏幕明显划痕
            '246' : {
                img  : [ 'https://p1.ssl.qhimg.com/t01175b34733385a942.png'],
                desc : []
            },
            // 屏幕碎裂
            '82' : {
                img  : [ 'https://p.ssl.qhimg.com/t016d990d7b726de7f8.png' ],
                desc : [ '屏幕有碰角、裂痕碎裂、假壳、后压屏。' ]
            },
            // 有坏点/亮点/色差
            '22' : {
                img  : [ 'https://p.ssl.qhimg.com/t01099af737252008e0.png' ],
                desc : [ '1.屏幕上不可修复的单一颜色点或是一块区域，比如屏幕出现白斑或其他颜色斑点等；<br>2.在全屏纯黑色或白色背景下，屏幕出现亮点或者坏点情况；<br>3. 在纯色背景下，出现屏幕色差情况，以蓝色纯色背景图为例，顶部有明显色差。' ]
            },
            // 触摸异常/显示异常/非原装屏
            '26' : {
                img  : [ 'https://p.ssl.qhimg.com/t01236188bc143ba0ba.png' ],
                desc : [ '屏幕出现触摸无反应，触摸失灵等情况；<br>液晶显示异常，屏幕出现漏液，错乱，严重老化等现象。' ]
            },
            // 修过小部件
            '40' : {
                img  : [ 'https://p.ssl.qhimg.com/t01d8876df825617cb9.png' ],
                desc : [ '手机后盖螺丝有拆过，除主板外，维修过手机屏幕，扬声器，尾插等其他小部件。' ]
            },
            //修过主板/改容量
            '42' : {
                img  : [],
                desc : [ '扩容、换壳、主板盖章/贴签、黑纸坏、盖板开、飞线、无IMEI/与实际不符、电池更换/松动/撬痕、维修尾插/扬声器、内部螺丝/零件尾插螺丝/排线盖板螺丝确实或无法打开。' ]
            }
            //// 有进水
            //'36'  : {
            //    img  : [ 'https://p.ssl.qhimg.com/t018dd4e3275a3acfe4.png' ],
            //    desc : [ '手机防潮标变色；<br>显示屏内有水珠或者水雾；<br>手机螺丝口，主板有生锈的痕迹等情况。' ]
            //},
            //// 官换机(系统型号N开头)
            //'108' : {
            //    img  : [ 'https://p.ssl.qhimg.com/t0191b6c76d49ec4733.png' ],
            //    desc : [ '在“设置->通用->关于本机”中的型号查看，型号以N开头为官换机。' ]
            //},
            //// 卡贴机/有网络锁
            //'116' : {
            //    img  : [],
            //    desc : [ '水货有锁手机不能接收国内的通讯信号，需要卡贴来把国内通讯信号转换为可以识别的信号，因此称为“卡贴机”。' ]
            //}
        };

        return descMap[ option_id ] || null
    }

    // 显示评估项描述信息
    function showOptionDesc(wOption, desc){
        var
            html_fn = W ('#JsHSAssessOptionDescTpl').html ().trim ().tmpl (),
            html_st = html_fn ({
                data : desc
            })

        var
            wDesc = W (html_st),
            wBody = W ('body')

        wDesc.appendTo (wBody[ 0 ])

        var
            rect_box = wOption.ancestorNode ('.phone-option-box').getRect (),
            rect_option = wOption.getRect (),
            rect_desc = wDesc.getRect ()

        var
            in_client = tcb.queryUrl(window.location.search, 'inclient')
        if (in_client){
            // 客户端内，由于限定高度（而且底部没有内容撑开），
            // 为了避免在评估项底部现实的时候无法显示完整，所以当评估项离顶部高度大于220px的时候换成在评估项顶部显示的方式，
            // 否则，还是在评估项底部显示

            var
                rect_body = wBody.getRect()

            wDesc.css({
                'left' : rect_option[ 'left' ]-rect_body['left']
            })

            if (rect_option[ 'top' ]>220){

                wDesc.css({
                    'bottom'  : rect_body['height']-rect_option[ 'top' ]-1
                })

            } else {
                wDesc.css({
                    'top'  : rect_option[ 'top' ] + rect_option[ 'height' ] - 1
                })
            }

        } else {
            // 普通浏览器内

            wDesc.css({
                'top'  : rect_option[ 'top' ] + rect_option[ 'height' ] - 1,
                'left' : rect_option[ 'left' ]
            })

            if (rect_option[ 'left' ] + rect_desc[ 'width' ] > rect_box[ 'left' ] + rect_box[ 'width' ]) {
                // 弹层宽度超出了最右边界，那么需要修正左对齐的位置，让其贴右边框对齐
                wDesc.css ({
                    'left' : rect_option[ 'left' ] - (rect_desc[ 'width' ] - rect_option[ 'width' ])
                })
            }
        }

    }

    // 关闭隐藏评估项描述信息
    function hideOptionDesc (wDesc) {
        wDesc = wDesc || W ('#AssessOptionDesc')

        if (wDesc && wDesc.length) {

            wDesc.removeNode ()
        }
    }

    Dom.ready (function () {

        tcb.bindEvent (document.body, {

            '#AssessOptionDesc' : {
                'mouseleave' : function (e) {
                    var
                        toElement = e.toElement || e.relatedTarget,
                        wToElement = W (toElement)

                    // 移开鼠标后的目标元素为空的时候，也隐藏弹层（一般情况不会出现没有toElement的情况，但是嵌入客户端的时候会存在这样的情况）
                    if (!(wToElement && wToElement.length)
                        || !(wToElement.hasClass ('icon-check-item-desc') || wToElement.ancestorNode ('.icon-check-item-desc').length)) {
                        hideOptionDesc ()
                    }
                }
            },

            '#PhoneOptions .check-item' : {
                'mousedown'  : function (e) {
                    //var
                    //    wTarget = W(e.target)

                    //if (!wTarget.hasClass('icon-show-desc')){

                        hideOptionDesc ()
                    //}
                },
                'mouseleave' : function (e) {
                    var
                        toElement = e.toElement || e.relatedTarget,
                        wToElement = W (toElement)

                    // 移开鼠标后的目标元素为空的时候，也隐藏弹层（一般情况不会出现没有toElement的情况，但是嵌入客户端的时候会存在这样的情况）
                    if ( !(wToElement && wToElement.length)
                        || !(wToElement.hasClass ('assess-option-desc') || wToElement.ancestorNode ('.assess-option-desc').length )) {
                        hideOptionDesc ()
                    }
                }
            },

            '#PhoneOptions .check-item .icon-show-desc' : {
                'mouseenter' : function (e) {
                    var
                        wMe = W (this),
                        wDesc = W ('#AssessOptionDesc')

                    if (wDesc && wDesc.length) {

                        //hideOptionDesc (wDesc)

                        return
                    }

                    var
                        wOption = wMe.ancestorNode ('.check-item'),
                        d_id = wOption.attr ('data-select'),
                        d_is_sku = wOption.attr ('data-is-sku'),
                        desc = getOptionDesc (d_id)

                    if (!desc || d_is_sku) {
                        return
                    }

                    // 显示评估项描述信息
                    showOptionDesc(wOption, desc)

                    //var
                    //    html_fn = W ('#JsHSAssessOptionDescTpl').html ().trim ().tmpl (),
                    //    html_st = html_fn ({
                    //        data : desc
                    //    })
                    //
                    //wDesc = W (html_st)
                    //
                    //wDesc.appendTo (W ('body')[ 0 ])
                    //
                    //var
                    //    rect_box = wOption.ancestorNode ('.phone-option-box').getRect (),
                    //    rect_option = wOption.getRect (),
                    //    rect_desc = wDesc.getRect ()
                    //
                    //wDesc.css ({
                    //    'top'  : rect_option[ 'top' ] + rect_option[ 'height' ] - 1,
                    //    'left' : rect_option[ 'left' ]
                    //})
                    //
                    //if (rect_option[ 'left' ] + rect_desc[ 'width' ] > rect_box[ 'left' ] + rect_box[ 'width' ]) {
                    //    // 弹层宽度超出了最右边界，那么需要修正左对齐的位置，让其贴右边框对齐
                    //    wDesc.css ({
                    //        'left' : rect_option[ 'left' ] - (rect_desc[ 'width' ] - rect_option[ 'width' ])
                    //    })
                    //}

                }

                //'mousedown'  : function (e) {
                //    hideOptionDesc ()
                //},
                //'mouseenter' : function (e) {
                //    hideOptionDesc ()
                //
                //    var
                //        wMe = W (this),
                //        d_id = wMe.attr ('data-select'),
                //        d_is_sku = wMe.attr ('data-is-sku'),
                //        desc = getOptionDesc (d_id)
                //
                //    if (!desc || d_is_sku) {
                //        return
                //    }
                //
                //    var
                //        html_fn = W ('#JsHSAssessOptionDescTpl').html ().trim ().tmpl (),
                //        html_st = html_fn ({
                //            data : desc
                //        })
                //
                //    var
                //        wDesc = W (html_st)
                //
                //    wDesc.appendTo (W ('body')[ 0 ])
                //
                //    var
                //        rect_box = wMe.ancestorNode ('.phone-option-box').getRect (),
                //        rect_option = wMe.getRect (),
                //        rect_desc = wDesc.getRect ()
                //
                //    wDesc.css ({
                //        'top'  : rect_option[ 'top' ] + rect_option[ 'height' ] - 1,
                //        'left' : rect_option[ 'left' ]
                //    })
                //
                //    if (rect_option[ 'left' ] + rect_desc[ 'width' ] > rect_box[ 'left' ] + rect_box[ 'width' ]) {
                //        // 弹层宽度超出了最右边界，那么需要修正左对齐的位置，让其贴右边框对齐
                //        wDesc.css ({
                //            'left' : rect_option[ 'left' ] - (rect_desc[ 'width' ] - rect_option[ 'width' ])
                //        })
                //    }
                //},
                //'mouseleave' : function (e) {
                //    hideOptionDesc ()
                //}
            }

        })

    })

    window.Pinggu = window.Pinggu || {}


    tcb.mix (window.Pinggu, {
        getOptionDescIds : getOptionDescIds
    })

} ()


;/**import from `/resource/js/page/huishou/pinggu.js` **/
// 回收--评估流程页
Dom.ready(function(){
    // 绑定事件
    tcb.bindEvent(document.body, {
        // 必选项
        '.phone-must-choice .check-item': {
            'click': function(e){
                e.preventDefault ();

                var
                    target = e.target,
                    wTarget = W(target),
                    wMe = W (this),
                    wChoice = wMe.ancestorNode ('.phone-info-choice')

                if (wChoice.hasClass('phone-info-choice-pre-checked') && !wMe.hasClass ('check-item-on')){
                    return
                }
                //if (wTarget.hasClass('icon-show-desc')){
                //
                //    return
                //}

                wMe.addClass ('check-item-on')
                    .siblings ('.check-item-on').removeClass ('check-item-on');

                wChoice.query ('.selected-item .item-txt').html (wMe.attr('data-name').trim ());
                wChoice.query ('.selected-item .item-title-txt').html (wMe.ancestorNode('.phone-info-choice').query('.tit-1').html ().trim ());

                //是否有锁 选择了有锁
                if(wTarget.attr('data-select') == '88'){
                    return
                    var attach_str = '<span class="marker">账号密码未解除，将会影响最终的回收报价哦。</span>'
                    wChoice.query ('.selected-item .item-txt').appendChild(attach_str)
                    setTimeout(function () {
                        wChoice.query ('.selected-item .item-txt .marker').addClass('show')
                    },500)
                    setTimeout(function () {
                        wChoice.query ('.selected-item .item-txt .marker').removeClass('show')
                    },3000)
                }
                // 评估到下一步
                goNextStep (wChoice);

                try { W (document).fire ('myresize');} catch (ex) {}
            }
        },

        // 如果在基础信息里，手机可用时，选择了描述项，则修改下一步按钮的文字
        '.phone-choice-base .check-item': function(e){
            e.preventDefault();

            if (W(this).hasClass('check-item-disabled')){
                return
            }

            if( W(this).hasClass('check-item-on') ){
                W(this).removeClass('check-item-on')
            }else{
                W(this).addClass('check-item-on')
            }

            var parent = W(this).parentNode('.phone-info-choice');
            parent.one('.go-next').html('下一步');

            //如果有同组选项（即 data-default 值完全一致），则去除其选中状态
            W(this).siblings('.check-item[data-default="'+ W(this).attr('data-default') +'"]').removeClass('check-item-on');

            try{ W(document).fire('myresize');}catch(ex){}
        },

        // 已经选中属性
        '.choice-selected': {
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.addClass('choice-hover')
                    .siblings('.choice-selected').removeClass('choice-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.removeClass('choice-hover');
            },
            'click': function(e){
                e.preventDefault();

                var wMe = W(this);

                var wItem = wMe.query('.selected-item');
                wItem.hide();

                wItem.siblings('div').show();

                wMe.removeClass('choice-selected').removeClass('choice-hover').css({
                    'height': 'auto'
                });

                try{ W(document).fire('myresize');}catch(ex){}
            }
        },

        //去评估
        '.go-evaluate': function(e){
            e.preventDefault();

            var wMe = W(this);

            // 禁用/提交ing
            if( wMe.hasClass('hsbtn-disabled') || wMe.hasClass('hsbtn-doing') ){
                return;
            }

            doEvaluate();
        }

    })

    /**
     * 下一步
     * @return {[type]} [description]
     */
    function goNextStep(wCur){
        var
            height_target = '50px',
            height_transition = '55px'

        setTimeout(function(){
            wCur = wCur || W('.choice-step-curr');

            // 根据选中的当前选项组，获取下一个选项组
            var wNext = window.Pinggu.getNextStepObj(wCur);

            var $ModelSKUAttr = wNext.ancestorNode('#ModelSKUAttr');

            // 显示非sku评估项，展示所有title
            if ( !($ModelSKUAttr&&$ModelSKUAttr.length) ) {
                W('.block-group-tit').show()
            }

            wCur.removeClass('choice-step-curr').addClass('choice-selected').animate({
                'opacity': 0.4,
                'height': height_target
            }, 200, function(){
                var wItem = wCur.query('.selected-item');
                wItem.siblings('div').hide();
                wItem.css({
                    'display': 'block',
                    'line-height': height_transition
                }).animate({
                    'line-height': height_target
                }, 200, function(){
                    try{
                        //wCur[0].scrollIntoView();
                    }catch(ex){}
                });

                wCur.animate({'opacity': 1}, 100);

                try{ W(document).fire('myresize');}catch(ex){}
            })

            wNext.addClass('choice-step-curr')

            if (wNext && !wNext.getRect()['height']) {
                wNext.slideDown(200, function(){
                    try{ W(document).fire('myresize');}catch(ex){}
                })
            }

            setEvaluateProgress();

            try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
        }, 100);
    }

    //评估数据
    function doEvaluate(){
        // sku属性组id
        var
            sku_group_id = getModelSKUGroupId(),
            // 型号专有评估项（不包括mix混合选项）
            specialOptions = getModelSpecialOptions(sku_group_id),
            // 型号混合专有评估项
            mixOptions = getModelMixOptions()

        if (! (sku_group_id&&specialOptions&&mixOptions)) {
            // 获取不到正确sku组id、专有评估项、混合专有评估项，直接返回
            return alert('请选择完整的评估项再提交估价');
        }

        var url_query = tcb.queryUrl (window.location.search);
        var params = {
            'from'   : window._from ? window._from : 'web',
            '_from'  : url_query[ '_from' ],
            'iframe' : url_query[ 'iframe' ],
            'self_enterprise' : url_query[ 'self_enterprise' ],

            'model_id'     : url_query[ 'model_id' ],
            'sku_group_id' : sku_group_id,
            'sub_options'  : mixOptions.join (',')+','+specialOptions.join(','),
            "baseinfo"     : '',
            'newproductid' : url_query[ 'newproductid' ]
        }
        if (window._inclient) {
            params[ 'inclient' ] = 1
        }

        setUiBtnEvaluating()

        //获取assess_key
        QW.Ajax.get('/huishou/doPinggu', params, function(res){

            res = QW.JSON.parse(res)

            // 验证成功
            if (res['errno'] == 0) {
                var data = res.result
                //跳转至结果页面

                window.location = tcb.setUrl2(url_query['newproductid'] ? '/huishou/cart' : '/huishou/pinggudetail/', {
                    assess_key: data.assess_key
                })
            } else {
                //评估价格为0
                if(res['errno'] == '155'){
                    window.location = tcb.setUrl2('/huishou/error', {});
                } else {
                    alert(res['errmsg']);
                }
            }
            setUiBtnEvaluateRest()
        })
    }

    // 设置正在执行评估的按钮状态
    function setUiBtnEvaluating() {
        W('.go-evaluate').removeClass('hsbtn-disabled')
                         .addClass('hsbtn-doing')
                         .html('<img src="https://p.ssl.qhimg.com/t01d621a8109b7524b5.gif" width="24"> 正在评估...')
    }

    // 恢复评估按钮的初始状态
    function setUiBtnEvaluateRest() {
        W('.go-evaluate').removeClass('hsbtn-disabled')
                         .removeClass('hsbtn-doing')
                         .html('立即估价')
    }

    // 型号sku组id
    function getModelSKUGroupId(){
        var group_id;

        var sku_ids = [];
        // 其他必选评估项
        W('#ModelSKUAttr .check-item-on').forEach(function(el, i){
            sku_ids.push( W(el).attr('data-select') );
        });

        sku_ids = sku_ids.join(',');

        var sku_attr_map = tcb.cache('sku_attr_map');
        group_id = sku_attr_map[sku_ids];

        if (!group_id) {
            var $not_selected =  W('#ModelSKUAttr .phone-info-choice').filter(function(el){
                return !W(el).query('.check-item-on').length;
            });

            var top_place = $not_selected.getRect()['top']-40;

            tcb.gotoTop.goPlace(top_place);
            setTimeout(function(){
                $not_selected.shine4Error();
            }, 300);
        }

        return group_id;
    }

    // 型号专有评估项（不包括mix混合选项）
    function getModelSpecialOptions(sku_group_id){
        var
            flag = true,
            checkedOptions = [],
            wSpecials = W('#ModelSpecialOptions .phone-must-choice')


        // 专有评估项
        wSpecials.forEach(function(el,i){
            var
                wEl = W(el),
                wChecked = wEl.query('.check-item-on')

            if ( wChecked&&wChecked.length){
                checkedOptions.push( wChecked.attr('data-select') )
            } else {
                if (sku_group_id&&flag) {
                    // sku属性选中正常，并且是第一个非选中的专有评估项组

                    var top_place = wEl.getRect()['top']-40

                    tcb.gotoTop.goPlace(top_place);
                }
                setTimeout(function(){
                    wEl.shine4Error()
                }, 300)

                flag = false
            }
        })

        return flag ? checkedOptions : flag
    }

    // 型号混合专有评估项
    function getModelMixOptions () {
        var checkedOptions = []

        // 有默认选项的基本选择项
        W ('.phone-choice-base .check-item').forEach (function (el, i) {
            var
                $el = W (el), default_id = $el.attr ('data-default') // 当前选项组的默认选中的id
                , $option_group = W ('.phone-choice-base .check-item[data-default="' + default_id + '"]') // 当前选项的<所有选项组>
                , $option_selected = $option_group.filter (function (el) { // 当前组<被选中的选项>
                    return W (el).hasClass ('check-item-on')
                })

            if ($option_selected.length) {
                // 选项组中,有显式选中的项

                checkedOptions.push ($option_selected.attr ('data-select'))
            } else {
                // 选项组中,无显式选中的项

                checkedOptions.push ($el.attr ('data-default'))
            }

        })

        // 上边的遍历方法可能产生重复项,去重
        checkedOptions = checkedOptions.unique ()

        return checkedOptions
    }

    // 设置评估进度
    function setEvaluateProgress(pct){
        if( W('.tpl-pinggu').length == 0){ return; }

        var
            percent = 0

        if(pct){
            percent = pct;
        }else{
            var
                max = getMaxStep(),
                index = 4

            // 遍历默认选项，找出所有的选中组累加
            W('.phone-must-choice').forEach(function(el,i){
                var
                    wCheckOn = W(el).query('.check-item-on')
                if (wCheckOn && wCheckOn.length){
                    index++
                }
            })

            percent = ( index/max * 100 ).toFixed(0);
            percent = percent >=100 ? 99 : percent; //不要100
        }

        W('#progressBar').css('width', percent+'%');
        W('#progressNum').html(percent);
    }

    // 获取当前评估的最大评估步骤
    function getMaxStep(){
        // 最大评估组数，初始值设置为3
        var
            max_step = 3

        // sku属性组数
        max_step += tcb.cache('sku_attr_cate').length

        // 专有属性组数
        max_step += tcb.cache('special_options_cate').length

        // 混合选项组算一组
        max_step += 1

        return max_step
    }

    // 滚动条滚动时
    function scrollTab(){
        // 滚动条事件
        var wBoundary = W('.tpl-pinggu');
        if (wBoundary.length) {
            var wNav = W('.pinggu-base-info-box'),
                wNavPlaceholder = W('.pinggu-base-info-box-placeholder'),
                boundary = wBoundary.xy()[1]-2;

            /**
             * 设置顶部tab的位置
             */
            function setTopPos() {
                var s_top = tcb.getScrollTop();

                // 滚动条滚动到tab的临界位置以下
                if (s_top > boundary) {
                    if (window._isIE6) {
                        wNav.css({
                            'position': 'absolute',
                            'top': s_top
                        });
                    } else {
                        wNav.css({
                            'position': 'fixed'
                        });
                    }
                    wNavPlaceholder.show();

                } else {
                    wNav.css({
                        'position': 'relative',
                        'top': 0
                    });
                    wNavPlaceholder.hide();
                }
            }
            W(window).on('scroll', setTopPos);
            W(window).on('load',  setTopPos);
            W(window).on('resize', setTopPos);
            //W(window).on('myresize', setTopPos);
        }
    }

    function init(){
        // 根据滚动条设置顶部位置
        scrollTab();

        // 设置初始评估进度
        setEvaluateProgress(19);

        setTimeout(function () {
            setEvaluateProgress()
        }, 1000)
    }

    init()

})


;/**import from `/resource/js/page/huishou/pinggu_detail.js` **/
window.__bankArea = {};
window.__bankArea.provinces = ["北京","上海","天津","重庆","河北","山西","内蒙","辽宁","吉林","黑龙江","江苏","浙江","安徽","福建","江西","山东","河南","湖北","湖南","广东","广西","海南","四川","贵州","云南","西藏","陕西","甘肃","宁夏","青海","新疆","香港","澳门","台湾"];
window.__bankArea.cities = [["东城","西城","朝阳","丰台","石景山","海淀","门头沟","房山","通州","顺义","昌平","大兴","平谷","怀柔","密云","延庆"],["黄浦","卢湾","徐汇","长宁","静安","普陀","闸北","虹口","杨浦","闵行","宝山","嘉定","浦东","金山","松江","青浦","南汇","奉贤","崇明"],["和平","东丽","河东","西青","河西","津南","南开","北辰","河北","武清","红挢","塘沽","汉沽","大港","宁河","静海","宝坻","蓟县"],["万州","涪陵","渝中","大渡口","江北","沙坪坝","九龙坡","南岸","北碚","万盛","双挢","渝北","巴南","黔江","长寿","綦江","潼南","铜梁","大足","荣昌","壁山","梁平","城口","丰都","垫江","武隆","忠县","开县","云阳","奉节","巫山","巫溪","石柱","秀山","酉阳","彭水","江津","合川","永川","南川"],["石家庄","邯郸","邢台","保定","张家口","承德","廊坊","唐山","秦皇岛","沧州","衡水"],["太原","大同","阳泉","长治","晋城","朔州","吕梁","忻州","晋中","临汾","运城"],["呼和浩特","鄂尔多斯","包头","乌海","赤峰","呼伦贝尔","阿拉善","哲里木","兴安","乌兰察布","锡林郭勒","巴彦淖尔","伊克昭"],["沈阳","大连","鞍山","抚顺","本溪","丹东","锦州","营口","阜新","辽阳","盘锦","铁岭","朝阳","葫芦岛"],["长春","吉林","四平","辽源","通化","白山","松原","白城","延边"],["哈尔滨","齐齐哈尔","牡丹江","佳木斯","大庆","绥化","鹤岗","鸡西","黑河","双鸭山","伊春","七台河","大兴安岭"],["南京","镇江","苏州","南通","扬州","盐城","徐州","连云港","常州","无锡","宿迁","泰州","淮安"],["杭州","宁波","温州","嘉兴","湖州","绍兴","金华","衢州","舟山","台州","丽水"],["合肥","芜湖","蚌埠","马鞍山","淮北","铜陵","安庆","黄山","滁州","宿州","池州","淮南","巢湖","阜阳","六安","宣城","亳州"],["福州","厦门","莆田","三明","泉州","漳州","南平","龙岩","宁德"],["南昌市","景德镇","九江","鹰潭","萍乡","新余","赣州","吉安","宜春","抚州","上饶"],["济南","青岛","淄博","枣庄","东营","烟台","潍坊","济宁","泰安","威海","日照","莱芜","临沂","德州","聊城","滨州","菏泽"],["郑州","开封","洛阳","平顶山","安阳","鹤壁","新乡","焦作","濮阳","许昌","漯河","三门峡","南阳","商丘","信阳","周口","驻马店","济源"],["武汉","宜昌","荆州","襄樊","黄石","荆门","黄冈","十堰","恩施","潜江","天门","仙桃","随州","咸宁","孝感","鄂州"],["长沙","常德","株洲","湘潭","衡阳","岳阳","邵阳","益阳","娄底","怀化","郴州","永州","湘西","张家界"],["广州","深圳","珠海","汕头","东莞","中山","佛山","韶关","江门","湛江","茂名","肇庆","惠州","梅州","汕尾","河源","阳江","清远","潮州","揭阳","云浮"],["南宁","柳州","桂林","梧州","北海","防城港","钦州","贵港","玉林","南宁地区","柳州地区","贺州","百色","河池"],["海口","三亚"],["成都","绵阳","德阳","自贡","攀枝花","广元","内江","乐山","南充","宜宾","广安","达川","雅安","眉山","甘孜","凉山","泸州","阿坝州","遂宁","巴中"],["贵阳","六盘水","遵义","安顺","铜仁","黔西南","毕节","黔东南","黔南"],["昆明","大理","曲靖","玉溪","昭通","楚雄","红河","文山","思茅","西双版纳","保山","德宏","丽江","怒江","迪庆","临沧"],["拉萨","日喀则","山南","林芝","昌都","阿里","那曲"],["西安","宝鸡","咸阳","铜川","渭南","延安","榆林","汉中","安康","商洛"],["兰州","嘉峪关","金昌","白银","天水","酒泉","张掖","武威","定西","陇南","平凉","庆阳","临夏","甘南"],["银川","石嘴山","吴忠","固原"],["西宁","海东","海南","海北","黄南","玉树","果洛","海西"],["乌鲁木齐","石河子","克拉玛依","伊犁","巴音郭勒","昌吉","克孜勒苏柯尔克孜","博尔塔拉","吐鲁番","哈密","喀什","和田","阿克苏"],["香港"],["澳门"],["台北","高雄","台中","台南","屏东","南投","云林","新竹","彰化","苗栗","嘉义","花莲","桃园","宜兰","基隆","台东","金门","马祖","澎湖"],["北美洲","南美洲","亚洲","非洲","欧洲","大洋洲","火星"]];


Dom.ready(function(){


    // 使用优惠码
    W('.use-promo-wrap').forEach(function(el, i){
        var wWrap = W(el);
        // 使用优惠码
        tcb.usePromo({
            'service_type': 2,
            'product_id': '',
            'price': 0,
            'request_params': {
                assess_key: tcb.queryUrl(window.location.search, 'assess_key')
            },
            'wWrap': wWrap,
            'succ': function(youhuiPrice, min_sale_price, wWrap){
                wWrap.query('.promoYZ').html('优惠码有效，卖出可多收'+youhuiPrice+'元').removeClass('promo-fail').addClass('promo-succ');
            },
            'fail': function(wWrap){

            }
        });
    });

    // for换新
    /*
    if( W('.pg-adding-top').length>0 && W('a[name="hx_sellinfo"]').length>0){
        var flagTop = W('a[name="hx_sellinfo"]').getRect().top - 120;

        W('.go-hx-btn').on('click', function(e){
            e.preventDefault();
            window.scrollTo(0, flagTop);
        });

        W(window).on('scroll', function(e){
            _showHXAddingBar();
        });
        W(window).on('load', function(e){
            _showHXAddingBar();
        });
        W(window).on('resize', function(e){
            _showHXAddingBar();
        });

        function _showHXAddingBar(){

            if( flagTop <= Dom.getDocRect().scrollY ){
                (W('.pg-adding-top').css('display')=='none') && W('.pg-adding-top').show();
            }else{
                (W('.pg-adding-top').css('display')!='none') && W('.pg-adding-top').hide();
            }
        }
    }*/

    if(AddrSuggest && typeof AddrSuggest=='function'){
        // 地址联想
        new AddrSuggest('[name="user_addr"]', {
            'showNum' : 6,
            'requireCity' : function(){ return W('.city-sel').html().trim(); }
        });
    }

    // 获取城市上门地区
    function getCityShangmenArea(city_name) {
        var ret = ''
        var offline_city = window._CACHE['offline_city'] || []
        tcb.each(offline_city, function (i, item) {
            if (city_name.indexOf(item['city']) > -1) {
                ret = item['tip']
            }
        })
        return ret
    }
    // 设置当前城市可用服务
    function setServiceType(huodong_show, show_offline){
        var wTabs = W('.type-select-tab .tab');

        W('.tips-shangmen-nonsupport').hide()

        // 当前城市没有支持的服务方式
        if (!(huodong_show && huodong_show.length)) {
            wTabs.removeClass('tab-selected').addClass('tab-disabled');
            W('.js-order-form-box').hide()
            W('.tips-shangmen-nonsupport').show()
            return
        }

        huodong_show = QW.ArrayH.filter(huodong_show, function(item){
            if (item!='999'){
                return true
            }
        })

        wTabs.forEach(function (el, i) {
            var wTab = W(el),
                type = parseInt(wTab.attr('data-type'), 10); // 1：上门，2：到店，3：邮寄，999：信用回收

            // //*********** 信用回收特别处理 *************
            // // 信用回收直接跳过不处理
            // if (type==999){
            //     return true
            // }
            // //*********** END信用回收特别处理 *************

            if (huodong_show.contains(type)) {
                if (type==1 && !show_offline){
                    wTab.removeClass('tab-selected').addClass('tab-disabled');
                } else {
                    wTab.removeClass('tab-selected').removeClass('tab-disabled');
                }
            } else {
                wTab.removeClass('tab-selected').addClass('tab-disabled');
            }
        });

        // 选中第一个可选的服务方式
        wTabs.filter(function(el){
            return !W(el).hasClass('tab-disabled');
        }).item(0).click();

        // 切换城市后更新图片验证码
        setTimeout(function(){
            // 更新验证码
            W('.vcode-img').fire('click')
        }, 1000)

    }
    // 设置当前城市可用服务（换新）
    function setServiceType4HX(huodong_show, show_offline){
        var wTabs = W('.type-select-tab .tab');
        wTabs.forEach(function (el, i) {
            var wTab = W(el),
                type = parseInt(wTab.attr('data-type'), 10);// 1：上门，2：到店，3：邮寄

            if (huodong_show.contains(type)) {
                if (type==1 && !show_offline){
                    wTab.removeClass('tab-selected')
                        .removeClass('tab-disabled')
                        .addClass('tab-notspt');
                } else {
                    wTab.removeClass('tab-selected')
                        .removeClass('tab-disabled')
                        .removeClass('tab-notspt');
                }
            } else {
                wTab.removeClass('tab-selected')
                    .removeClass('tab-notspt')
                    .addClass('tab-disabled');
            }
        });

        // 选中第一个可选的服务方式
        wTabs.filter(function(el){
            return !(W(el).hasClass('tab-disabled')||W(el).hasClass('tab-notspt'));
        }).item(0).click();
    }


    // 设置 到店 服务信息
    function setDaodianServiceTypeInfo(datas){
        var shop_list = datas['shop_list'] || []

        var shop_list_str = '',
            selected_shop_str = '',
            selected_shop_tel = '';
        tcb.each(shop_list, function(k, v){
            shop_list_str += '<label data-id="'+
                v['shop_id']+'" data-tel="'+
                v['shop_mobile']+'" data-addr="'+
                v['shop_name']+'（'+v['shop_addr']+'）"><input type="radio" name="shop_id" value="'+v['shop_id']+'"'+(k==0?' checked="checked"':'')+'>'+v['shop_name']+'（'+v['shop_addr']+'）</label>';
            if (k==0){
                selected_shop_str += v['shop_name']+'（'+v['shop_addr']+'）';
                selected_shop_tel = v['shop_mobile'];
            }
        });
        // 输出到店地址列表
        W('#DaoDianAddrList').html(shop_list_str);
        // 设置被选中的到店地址
        W('#HsDaodianAddr').html('下单后，请您带旧机到'+selected_shop_str+' ');
        // 设置被选中的到店电话
        W('#HsDaodianTel').html(selected_shop_tel).attr('href', 'tel:'+selected_shop_tel);
    }
    // 设置 上门 服务信息
    function setShangmenServiceTypeInfo(datas){
        // 设置上门范围区域
        var wShangmenArea = W('.dl-shangmen-area');
        if (wShangmenArea && wShangmenArea.length) {
            var area = getCityShangmenArea(datas['city_name']);

            if (area) {
                wShangmenArea.show().query('dd').html(datas['city_name']+'&nbsp;'+area);
            } else {
                wShangmenArea.hide().query('dd').html(datas['city_name']);
            }
        }

        // 设置上门客服热线
        W('#HsShangmenTel').html(datas['tel']).attr('href', 'tel:'+datas['tel']);
    }
    // 设置 邮寄 服务信息
    function setYoujiServiceTypeInfo(datas){

        // 设置邮寄客服热线
        W('#HsYouji1Tel,#HsYouji2Tel').html(datas['tel']).attr('href', 'tel:'+datas['tel']);
    }
    // 初始化城市切换相关
    function initCitySelect(selector) {
        var $selector = W(selector)
        if(!($selector && $selector.length)) return false;

        window._CACHE['cityPanel'] = Bang.AddressSelect2(selector, {
            container: '.bd-content',
            onShow: function (inst) {
                // 客户端中
                if (tcb.queryUrl(window.location.search, 'inclient')) {
                    var wSelector = W(selector),
                        rect = wSelector.getRect(),
                        wContent = W('.page-hs-client .bd-content'),
                        c_rect = wContent.getRect(),
                        scroll_top = W('.page-hs-client .bd-content')[0].scrollTop

                    inst.$dropdown.css({
                        'top': scroll_top + rect['height'] + rect['top'],
                        'left': rect['left'] - c_rect['left']
                    })
                }
            },
            onInit: function (region, inst) {
                inst.options.onConfirm(region, inst)
            },
            onConfirm: function (region, inst, noChange) {
                if (noChange) {
                    return
                }
                // 普通回收流程参数
                var hdid = '', // 活动id
                    assess_price = W('.p-b-money').attr('data-money') // 回收价格

                // 以旧换新流程参数
                if (window._CACHE['hx_flag']) {
                    hdid = window.__HD_ID
                    // 计算当前回收总价
                    assess_price = 0
                    W('.item-product-hs').forEach(function (el, i) {
                        assess_price += W(el).attr('data-price') - 0
                    })
                    assess_price = parseFloat(assess_price)
                }

                // 设置当前选择城市的服务方式
                var params = {
                    ad_province_code: region.provinceCode,
                    ad_city_code: region.cityCode,
                    ad_area_code: region.districtCode,
                    assess_price: assess_price,
                    self_enterprise: tcb.queryUrl(window.location.href, 'self_enterprise'),
                    model_id: window._CACHE['model_id'] || ''
                }
                /*活动id，在有此参数的时候才会作为参数请求*/
                if (hdid) {
                    params.hdid = hdid
                }
                var url = tcb.setUrl('/huishou/dogetshoppingtype', params)

                QW.Ajax.get(url, function (res) {
                    res = QW.JSON.parse(res)

                    if (!res['errno']) {
                        //上门回收是否填写收款信息 show_offline_payout
                        window.SHOW_OFFLINE_PAYOUT = res.result.show_offline_payout
                        if (window.SHOW_OFFLINE_PAYOUT) {
                            W('.isShowPayMethod').css('display', 'block')

                        } else {
                            W('.isShowPayMethod').css('display', 'none')
                        }
                        W(selector).siblings('.city-sel').html([region.province, region.city, region.district].join(' / '))
                        // 表单中所有城市设置为选择的城市
                        W('[name="city_name"]').val(region.city)
                        W('[name="ad_province_code"]').val(region.provinceCode)
                        W('[name="ad_city_code"]').val(region.cityCode)
                        W('[name="ad_area_code"]').val(region.districtCode)

                        var huodong_show = res['result']['huodong_show'], // 支持的服务方式
                            show_offline = res['result']['show_offline'], // 是否支持上门服务（作为支持服务方式的补充判断条件）
                            shop_list = res['result']['daodian'], // 到店店铺信息
                            tel = res['result']['def_post_info']['tel']//res['result']['tel'];

                        // 设置 上门 服务信息
                        setShangmenServiceTypeInfo({
                            'city_name': region.city,
                            'tel': tel
                        })
                        // 设置 邮寄 服务信息
                        setYoujiServiceTypeInfo({
                            'tel': tel
                        })
                        // 设置 到店 服务信息
                        setDaodianServiceTypeInfo({
                            'shop_list': shop_list
                        })

                        // 设置当前城市可用服务
                        if (window._CACHE['hx_flag']) {
                            setServiceType4HX(huodong_show, show_offline)
                        } else {
                            setServiceType(huodong_show, show_offline)
                        }

                        try { W(document).fire('myresize')} catch (ex) {}

                    } else {
                        alert('切换城市失败，请刷新页面重试')
                    }
                })
            }
        })
    }

    initCitySelect('.change-city-selector');

    var typeTipPanel;
    tcb.bindEvent(document.body, {
        // 切换回收方式
        '.type-select-tab .tab': function(e){
            e.preventDefault();

            var wMe  = W(this);

            if (wMe.hasClass('tab-disabled')) {
                return ;
            }

            // 【for换新】判断当前选择的是否为上门，且旧机总金额是否允许上门？
            var notspt = wMe.hasClass('tab-notspt');
            if(!window._CACHE['show_offline'] && notspt){
                var cart_cnt = W('.product-list .item').length,
                    show_tip = "亲，旧机抵扣价凑够200元，才能享受免费上门换新哦！",
                    btn_flag = (cart_cnt > 5) ? 1 : 0;

                var html_str = W('#jsHuishouShangmenTipsPanelTpl').html().trim().tmpl()({
                    'btn_flag': btn_flag,
                    'show_tip': show_tip
                });
                var options = {
                    className: 'hs-daodian-tips-panel-wrap'
                };
                typeTipPanel = tcb.panel('', html_str,options);

                return;
            }

            wMe.addClass('tab-selected').siblings('.tab-selected').removeClass('tab-selected');

            var wInfo = W('.js-order-form-box'),
                type = wMe.attr('data-type');

            wInfo.hide().filter('[data-type="'+type+'"]').show();

            // 【for换新】
            W('.hx-type-wrap').css({'height': 'auto'});

            // 上门
            if (type=='1'){
                W('.sm-tip').show();
                W('.yj-tip').hide();
            }
            // 邮寄
            else if (type=='3'){
                W('.sm-tip').hide();
                W('.yj-tip').show();
            }
            // 到店
            else {
                W('.sm-tip').hide();
                W('.yj-tip').hide();
            }

            var typeMap = {
                '1':'上门回收',
                '2':'到店回收',
                '3':'邮寄回收',
                '999':'信用回收'
            }
            tcb.statistic ([ '_trackEvent', 'pc回收', '回收类型', typeMap[type], '1', '' ])

            try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
        },
        //在不足200元弹层中，点击再抵扣一台旧机
        '.hs-daodian-tips-panel-wrap .btn-confirm':function(e){
            e.preventDefault();
            if(typeTipPanel){
                typeTipPanel.hide();
            }

            //判断购物车是否满了
            var cart_cnt = W('.product-list .item').length;
            if(cart_cnt <= 5){
                var url_query = tcb.queryUrl(window.location.href);
                var data_params = {
                    'newproductid' : url_query['newproductid'],
                    'from' : url_query['from']
                };
                window.location.href = tcb.setUrl('/huishou', data_params);
            }
        },
        //关闭订单不足200元不上门的弹层提示
        '.hs-daodian-tips-panel-wrap .btn-cancel':function(e){
            e.preventDefault();
            if(typeTipPanel){
                typeTipPanel.hide();
            }
        },
        // 切换联系快递的方式
        '.contact-express .label': function(e){
            e.preventDefault();

            var wMe = W(this),
                val = wMe.attr('data-val');

            wMe.addClass('label-checked').siblings('.label-checked').removeClass('label-checked');

            wMe.ancestorNode('.contact-express')
                .siblings('.order-sale-form').hide().filter('[data-pos="'+val+'"]').show();

            try{ W(document).fire('myresize');}catch(ex){ }	//resize page happen
        },
        // 选择到店店铺
        '#DaoDianAddrList [name="shop_id"]': function(e){
            var $me = W(this),
                $label = $me.ancestorNode('label');

            var selected_shop_tel = $label.attr('data-tel'),
                selected_shop_str = $label.attr('data-addr');

            // 设置被选中的到店地址
            W('#HsDaodianAddr').html('下单后，请您带旧机到'+selected_shop_str+' ');
            // 设置被选中的到店电话
            W('#HsDaodianTel').html(selected_shop_tel).attr('href', 'tel:'+selected_shop_tel);
        }
    });
});


// 回收--评估结果页
Dom.ready(function(){
    var ObjPanel;

    // 绑定事件
    tcb.bindEvent(document.body, {
        '.type-select-tab .tab' : function (e) {
            //为了解决上门服务包含挑选支付方式时，在上门点击支付宝，跳回邮寄时，页面错乱的问题
            e.preventDefault ()

            if(W('.pay-via-wechat').item(1).hasClass('pay-m-curr')){
                W('.other-info-box').hide()
            }else{
                W('.other-info-box').show()
            }
            //为了解决上门服务包含挑选支付方式时，选择微信支付，还能提交订单的问题
            if(window.SHOW_OFFLINE_PAYOUT){
                if(W('.pay-via-wechat').item(0).hasClass('pay-m-curr')){
                    W('.shangmen-other-info-box').hide()
                }else{
                    W('.shangmen-other-info-box').show()
                }
            }else{
                W('.shangmen-other-info-box').show()
            }

        },
        //手机号码输入
        'form .mobile' : {
            'keyup' : function(e){
                var $me = W(this),
                    mobile = $me.val().trim();

                if (!tcb.validMobileInput(mobile)) {
                    $me.val( mobile.replace(/\D/g, '') );
                }

                // 验证是否换新活动手机号
                validHuanxin10086Mobile($me);

                //W(this).val( W(this).val().replace(/\D/g, '') );
            },
            'change' : function(e){
                var $me = W(this),
                    mobile = $me.val().trim();

                if (!tcb.validMobileInput(mobile)) {
                    $me.val( mobile.replace(/\D/g, '') );
                }

                // 验证是否换新活动手机号
                validHuanxin10086Mobile($me);

                //W(this).val( W(this).val().replace(/\D/g, '') );
            }
        },
        //银行卡号
        'form .bank-num' : {
            'keyup' : function(e){
                W(this).val( W(this).val().replace(/\D/g, '') );
            },
            'change' : function(e){
                W(this).val( W(this).val().replace(/\D/g, '') );
            }
        },
        //刷新图片验证码
        '.vcode-img' : function(e){
            e.preventDefault ()

            var $me = W(this),
                $Form = $me.ancestorNode('form'),
                src = '/secode/?rands=' + Math.random ()

            W('.vcode-img').attr('src', src).attr ('data-out-date', '')

            var $pic_secode = $Form.query ('[name="pic_secode"]')
            $pic_secode.focus ().val ('')
        },
        // 开户人名
        '.order-sale-form-v2 [name="account_holder"]' :{
            'change' : function(e){
                var wMe = W(this),
                    wForm = wMe.ancestorNode('form'),
                    wName = wForm.one('[name="saler_name"]');

                var bkname = wMe.val().trim();
                var name   = wName.val().trim();
                if( bkname!='' && name==''){
                    wName.val( bkname );
                }
            }
        },
        // 支付宝真实姓名
        '.order-sale-form-v2 [name="alipay_name"]' :{
            'change' : function(e){
                var wMe = W(this),
                    wForm = wMe.ancestorNode('form'),
                    wName = wForm.one('[name="saler_name"]');

                var apliname =wMe.val().trim();
                var name     = wName.val().trim();
                if( apliname!='' && name==''){
                    wName.val( apliname );
                }
            }
        },
        // 切换收款方式
        '.pay-m-item' : function(e){
            e.preventDefault();

            var wMe = W(this);
            wMe.addClass('pay-m-curr').siblings('.pay-m-curr').removeClass('pay-m-curr');

            var wForm = wMe.ancestorNode('form'),
                rel = wMe.attr('data-rel');
            wForm.query('.pay-info-box').hide();
            wForm.query('.pay-info-box[data-for="'+rel+'"]').show();

            if (rel=='wechat'){
                W('.other-info-box').hide()
                //为了解决上门服务包含挑选支付方式时，选择微信支付，还能提交订单的问题
                if(window.SHOW_OFFLINE_PAYOUT){
                    W('.shangmen-other-info-box').hide()
                }



                if(window.__is_huiyi){
                    W('.type-select-tab [data-type="3"] .desc span').html('专享加价25% 顺丰包邮')
                }
                else if(__is_send_redpackage && __is_youji){
                    W('.type-select-tab [data-type="3"] .desc span').html('满'+__condition_of_package+'+'+__redpackage_money)
                }else if(__is_send_redpackage){
                    W('.type-select-tab [data-type="3"] .desc span').html('+送现金红包')
                }else {
                    W('.type-select-tab [data-type="3"] .desc span').html('顺丰免费上门（全国包邮）')
                }

                if(__is_send_redpackage && __is_youji){
                    //W('.concact-box .bottom-desc').html('今日下单并寄出，加送拼手气现金红包，'+__redpackage_money+'元起！')
                    W('.concact-box .bottom-desc').show()
                }else if(__is_youji){
                    //W('.concact-box .bottom-desc').html('今日下单并寄出，满'+__condition_of_package+'元额外加送'+__redpackage_money+'元现金！')
                    W('.concact-box .bottom-desc').show()
                }else if(__is_send_redpackage){
                    //W('.concact-box .bottom-desc').html('今日下单并寄出，加送拼手气现金红包！')
                    W('.concact-box .bottom-desc').show()
                }

            } else {
                W('.other-info-box').show()
                W('.shangmen-other-info-box').show()

                if(window.__is_huiyi){
                    W('.type-select-tab [data-type="3"] .desc span').html('专享加价25% 顺丰包邮')
                }
                else if(__is_send_redpackage){
                    W('.concact-box .bottom-desc').hide()
                    //W('.concact-box .bottom-desc').html('')
                    W('.type-select-tab [data-type="3"] .desc span').html('&nbsp;')
                }else {
                    if(__is_youji){
                        W('.concact-box .bottom-desc').show()
                        //W('.concact-box .bottom-desc').html('今日下单并寄出，满'+__condition_of_package+'元额外加送'+__redpackage_money+'元现金！')
                        // W('.type-select-tab [data-type="3"] .desc span').html('满500+50')
                    }else {
                        W('.concact-box .bottom-desc').hide()
                        //W('.concact-box .bottom-desc').html('')
                        W('.type-select-tab [data-type="3"] .desc span').html('&nbsp;')
                    }

                }
            }
        },
        '.order-sale-form .insurance-check' : function(e){
            var F = W(this).parentNode('.order-sale-form');
            var name = F.one('.username').val() || '';

            if( W(this).attr('checked') ){
                F.one('.insurance-i-box').show();
                if( F.one('.insurance-name').val() == '' && name!=''){
                    F.one('.insurance-name').val(name);
                }
            }else{
                F.one('.insurance-i-box').hide();
            }
        },
        //（保存估值）二维码同步内容到微信
        '#qrcodeUpdate' : function(e){
            e.preventDefault();

            tcb.panel('', '<div style="padding:20px"><h3 style="font-size:18px;text-align:center;">同步到微信，下次一键估值</h3><img class="hs-qrupdate-pic" src="https://p.ssl.qhimg.com/t017ee3be501e423c98.gif" width="190" style="margin:10px 20px;"/></div>', {
                width:270,
                height:280,
                className: 'panel panel-tom01 border8-panel pngfix'
            });

            var assess_key = $(this).attr('data-assesskey');

            QW.Ajax.get('/huishou/aj_save_pinggu/', {'assess_key':assess_key}, function(rs){
                rs = QW.JSON.parse(rs);
                if(!rs.errno){
                    W('.hs-qrupdate-pic').attr('src', rs.result);
                }else{
                    alert("抱歉，出错了。" + rs.errmsg);
                }
            });
        },
        // 关闭窗口/换新重新填写手机号
        '.dialog-close, .huanxin-no-right-tip-wrap .btn-change-mobile': function(e){
            e.preventDefault();

            if (ObjPanel && ObjPanel.hide) {
                ObjPanel.hide();
            }
        },
        // 切换回收详情页tab
        '.hs-forms-tab .hs-f-item': function(e){
            e.preventDefault();

            var wMe = W(this),
                rel = wMe.attr('data-rel');

            var scroll_val;
            // 嵌入客户端
            if (tcb.queryUrl(window.location.search, 'inclient')){
                var wContent = W('.page-hs-client .bd-content'),
                    rel_top = W('.hs-f-content-'+rel).xy()[1],
                    tab_height = W('.hs-forms-tab').getRect()['height']-2;

                scroll_val = wContent[0].scrollTop + rel_top - tab_height;

                W('.page-hs-client .bd-content')[0].scrollTop = scroll_val;
            } else {
                scroll_val = W('.hs-f-content-'+rel).xy()[1] - W('.hs-forms-tab').getRect()['height']-2;

                tcb.gotoTop.goPlace(scroll_val);

                //tcb.setScrollTop(scroll_val);
            }
        }
    });

    // 发送手机验证码（包含普通流程+换新流程）
    W('.js-hsbtn-vcode').on('click', function(e){
        e.preventDefault();

        var sendMCodeBtn = W(this),
            wForm = sendMCodeBtn.ancestorNode('form'),
            $BtnVCode = wForm.query('.vcode-img')

        if( sendMCodeBtn.hasClass('hsbtn-vcode-dis') ){
            return;
        }

        if ($BtnVCode.attr ('data-out-date')) {
            $BtnVCode.fire ('click')
        }

        if( !validGetSmsCode (wForm) ){
            return;
        }

        var $mobile = wForm.query ('[name="tel"]'),
            $pic_secode = wForm.query ('[name="pic_secode"]'),
            $sms_type = wForm.query ('[name="sms_type"]'),
            params = {
                'mobile'     : $mobile.val ().trim (),
                'pic_secode' : $pic_secode.val ().trim (),
                'sms_type'   : $sms_type.val ().trim ()
            }
        QW.Ajax.post('/aj/doSendSmscode/', params, function(data){
            data = QW.JSON.parse(data);

            if(data.errno){
                alert(data.errmsg);

                sendMCodeBtn.removeClass ('hsbtn-vcode-dis')
                $BtnVCode.fire ('click')
            }else{
                // 当前页面所有发送手机验证码的按钮都禁止点击，加入倒计时
                var wAllSendMCodeBtn = W('.js-hsbtn-vcode');
                wAllSendMCodeBtn.addClass('hsbtn-vcode-dis').val('60秒后再次发送');
                $BtnVCode.attr ('data-out-date', '1')

                tcb.distimeAnim(60, function(time){
                    if(time<=0){
                        wAllSendMCodeBtn.removeClass('hsbtn-vcode-dis').val('发送验证码');
                    }else{
                        wAllSendMCodeBtn.val( time + '秒后再次发送');
                    }
                });
            }
        });
    })
    // 验证获取手机短信验证码表单
    function validGetSmsCode (wForm) {
        if (!(wForm && wForm.length)) {
            return false
        }
        var flag = true

        var wMobile = wForm.query ('[name="tel"]'),
            mobile_val = wMobile.val ().trim()
        if (!tcb.validMobile (mobile_val)) {
            flag = false
            wMobile.shine4Error().focus();
        }

        var wPicSecode = wForm.query ('[name="pic_secode"]'),
            pic_secode_val = wPicSecode.val ().trim()
        if (!pic_secode_val) {
            wPicSecode.shine4Error()
            if (flag) {
                wPicSecode.focus ()
            }
            flag = false
        }

        return flag
    }
    // 回收表单提交
    W('.order-sale-form-v2').on('submit', function(e){
        e.preventDefault();

        // return
        var wForm = W(this),
            form_type = wForm.attr('data-type');

        // 不同的服务表单，做不同的验证
        switch (form_type) {
            case 'shangmen':
                // 验证上门表单
                if (!validShangmenForm(wForm)) {
                    return false;
                }
                break;
            case 'daodian':
                // 验证到店表单
                if (!validDaodianForm(wForm)) {
                    return false;
                }
                break;
            case 'youji1':
            case 'youji2':
                // 验证邮寄表单
                if (form_type=='youji1') {
                    // 同城帮帮忙联系快递
                    if (!validYoujiForm1(wForm)) {
                        return false;
                    }
                } else {
                    // 自行联系快递
                    if (!validYoujiForm2(wForm)) {
                        return false;
                    }
                }
                // 收款方式为银行
                if (wForm.one('.pay-m-curr').attr('data-rel')=='bank'){
                    // 设置银行支付通道信息（支付宝无此参数）
                    var bank_name = wForm.one('[name="bank_name"]').val(),
                        bank_area = wForm.one('[name="bank_area"]').val();
                    wForm.one('[name="pay_channel"]').val( bank_name +'|'+ bank_area );
                }
                break;
        }

        if(wForm.attr('submiting')=='1'){
            return;
        }
        wForm.attr('submiting', '1');

        QW.Ajax.post('/huishou/doSubmitOrder', wForm[0], function(rs){
            try{
                rs = QW.JSON.parse(rs);
                //成功
                if(rs.errno == 0){
                    var order_id = rs.result.parent_id,
                        redirect_url = tcb.setUrl2 ('/huishou/order_succ', {
                            'order_id' : order_id
                        })

                    if (form_type.indexOf ('youji') === 0) {
                        // 邮寄回收

                        YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {

                            var html_fn = $('#JsHSSchedulePickupPanelTpl').html().trim().tmpl(),
                                html_st = html_fn ({
                                    data : {
                                        province : '',
                                        city     : res['city_name'] || window.__CITY_NAME,
                                        area_list : res['area_list']||[],
                                        mobile   : res['default_mobile'],
                                        order_id : order_id,
                                        url : redirect_url
                                    }
                                })

                            var DialogObj = tcb.showDialog (html_st, {
                                    className : 'schedule-pickup-panel',
                                    withClose : false,
                                    middle    : true//,
                                    // onClose:function () {
                                    //     window.location.href = redirect_url
                                    // }
                                })

                            // 绑定预约取件相关事件
                            YuyueKuaidi.bindEventSchedulePickup (DialogObj.wrap, redirect_url)

                        })
                    } else {
                        // 其他回收（上门、补单等）

                        window.location.href = redirect_url
                    }

                }else{
                    alert("抱歉，出错了。" + rs.errmsg)
                }
            } catch (ex){
                alert("下单异常，请刷新页面重试")
            }
            wForm.attr('submiting', '')
        })
    })

    // 验证上门表单
    function validShangmenForm(wForm) {
        if (!(wForm && wForm.length)) {
            return false;
        }

        var mobile = wForm.one('[name="tel"]'), //手机号
            mcode  = wForm.one('[name="code"]'),// 短信验证码
            server_time   = wForm.one('[name="server_time"]'), // 上门时间
            addr   = wForm.one('[name="user_addr"]'), // 用户地址
            id_card= wForm.one('[name="id_card"]'), // 身份证（某些情况需要，非必需）
            agree_protocol = wForm.one('[name="agree_protocol"]');
        //上门支持多种支付方式
        if(window.SHOW_OFFLINE_PAYOUT){
            var alipay_id   = wForm.one('[name="alipay_id"]'), //支付宝账号id
                alipay_name = wForm.one('[name="alipay_name"]'), //支付宝账号name

                bank_name = wForm.one('[name="bank_name"]'), // 开户银行
                bank_area = wForm.one('[name="bank_area"]'), // 开户地区
                bank_num = wForm.one('[name="pay_account"]'), // 开户账号
                bank_user = wForm.one('[name="account_holder"]');// 开户人姓名


            // 收款方式为-支付宝
            if(wForm.one('.pay-m-curr').item(0).attr('data-rel') == 'alipay' ){

                // 设置pay_method为支付宝：alipay
                wForm.one('[name="pay_method"]').val( 'alipay' );
                // 支付宝账号
                if( alipay_id.val().trim().length == 0 ){
                    alipay_id.shine4Error().focus();
                    return false;
                }
                // 支付宝真实姓名
                if( alipay_name.val().trim().length == 0 ){
                    alipay_name.shine4Error().focus();
                    return false;
                }
            }
            else if(wForm.one('.pay-m-curr').item(0).attr('data-rel') == 'bank'){
                // 收款方式为银行\
                var sm_bank_name=bank_name.val(),
                    sm_bank_area=bank_area.val()
                    // 设置银行支付通道信息（支付宝无此参数）
                    wForm.one('[name="pay_channel"]').val( sm_bank_name +'|'+ sm_bank_area );

                // 设置pay_method为银行：bank
                wForm.one('[name="pay_method"]').val( 'bank' );

                // 银行
                if( bank_name.val() == -1){
                    bank_name.shine4Error().focus();
                    return false;
                }
                // 开户地区
                if( bank_area.val().trim().length == 0){
                    W('.city-selector').shine4Error();
                    return false;
                }
                // 开户账号
                if( bank_num.val().trim().length == 0 ){
                    bank_num.shine4Error().focus();
                    return false;
                }
                // 开户人名
                if( bank_user.val().trim().length == 0 ){
                    bank_user.shine4Error().focus();
                    return false;
                }
            }
        }

        //手机号
        if( !tcb.validMobile(mobile.val().trim()) ){
            mobile.shine4Error().focus();
            return false;
        }
        // 手机验证码
        if (mcode && mcode.length) {
            if( mcode.val().trim().length == 0 ){
                mcode.shine4Error().focus();
                return false;
            }
        }
        // 上门时间
        if( server_time.val().trim().length == 0 ){
            server_time.shine4Error().focus();
            return false;
        }
        // 用户地址
        if( addr.val().trim().length == 0 ){
            addr.shine4Error().focus();
            return false;
        }

        // 身份证（部分活动需要）
        if (id_card && id_card.length) {
            if( !tcb.validIDCard(id_card.val().trim()) ){
                id_card.shine4Error().focus();
                return false;
            }
        }

        // 回收常见问题
        if(agree_protocol&&agree_protocol.length){
            if(!agree_protocol.attr('checked')){
                agree_protocol.ancestorNode('label').shine4Error();
                return false;
            }
        }


        return true;
    }
    // 验证到店表单
    function validDaodianForm(wForm) {
        if (!(wForm && wForm.length)) {
            return false;
        }

        var mobile = wForm.one('[name="tel"]'), //手机号
            mcode  = wForm.one('[name="code"]'),// 短信验证码
            id_card= wForm.one('[name="id_card"]'), // 身份证（某些情况需要，非必需）
            agree_protocol = wForm.one('[name="agree_protocol"]');

        //手机号
        if( !tcb.validMobile(mobile.val().trim()) ){
            mobile.shine4Error().focus();
            return false;
        }
        // 手机验证码
        if (mcode && mcode.length) {
            if( mcode.val().trim().length == 0 ){
                mcode.shine4Error().focus();
                return false;
            }
        }

        // 身份证（部分活动需要）
        if (id_card && id_card.length) {
            if( !tcb.validIDCard(id_card.val().trim()) ){
                id_card.shine4Error().focus();
                return false;
            }
        }

        // 回收常见问题
        if(agree_protocol&&agree_protocol.length){
            if(!agree_protocol.attr('checked')){
                agree_protocol.ancestorNode('label').shine4Error();
                return false;
            }
        }

        return true;
    }
    // 验证邮寄表单(由360同城帮联系快递)
    function validYoujiForm1(wForm) {
        if (!(wForm && wForm.length)) {
            return false;
        }

        var mobile = wForm.one('[name="tel"]'), //手机号
            mcode  = wForm.one('[name="code"]'),// 短信验证码
            addr   = wForm.one('[name="user_addr"]'), // 用户地址
            express_time = wForm.one('[name="express_time"]'), // 上门取件时间

            alipay_id   = wForm.one('[name="alipay_id"]'), //支付宝账号id
            alipay_name = wForm.one('[name="alipay_name"]'), //支付宝账号name

            bank_name = wForm.one('[name="bank_name"]'), // 开户银行
            bank_area = wForm.one('[name="bank_area"]'), // 开户地区
            bank_num = wForm.one('[name="pay_account"]'), // 开户账号
            bank_user = wForm.one('[name="account_holder"]'),// 开户人姓名

            pic_secode = wForm.one('[name="pic_secode"]'), // 图形验证码

            id_card= wForm.one('[name="id_card"]'), // 身份证（某些情况需要，非必需）
            agree_protocol = wForm.one('[name="agree_protocol"]');

        //手机号
        if( !tcb.validMobile(mobile.val().trim()) ){
            mobile.shine4Error().focus();
            return false;
        }
        // 手机验证码
        if (mcode && mcode.length) {
            if( mcode.val().trim().length == 0 ){
                mcode.shine4Error().focus();
                return false;
            }
        }
        // 用户地址
        if( addr.val().trim().length == 0 ){
            addr.shine4Error().focus();
            return false;
        }
        // 上门取件时间
        if( express_time.val().trim().length == 0 ){
            express_time.shine4Error().focus();
            return false;
        }

        // 收款方式为-支付宝
        if( wForm.one('.pay-m-curr').attr('data-rel') == 'alipay' ){
            // 设置pay_method为支付宝：alipay
            wForm.one('[name="pay_method"]').val( 'alipay' );

            // 支付宝账号
            if( alipay_id.val().trim().length == 0 ){
                alipay_id.shine4Error().focus();
                return false;
            }
            // 支付宝真实姓名
            if( alipay_name.val().trim().length == 0 ){
                alipay_name.shine4Error().focus();
                return false;
            }
        }
        else{
            // 设置pay_method为银行：bank
            wForm.one('[name="pay_method"]').val( 'bank' );

            // 银行
            if( bank_name.val() == -1){
                bank_name.shine4Error().focus();
                return false;
            }
            // 开户地区
            if( bank_area.val().trim().length == 0){
                W('.city-selector').shine4Error();
                return false;
            }
            // 开户账号
            if( bank_num.val().trim().length == 0 ){
                bank_num.shine4Error().focus();
                return false;
            }
            // 开户人名
            if( bank_user.val().trim().length == 0 ){
                bank_user.shine4Error().focus();
                return false;
            }
        }

        // 图形验证码
        if(pic_secode.val().trim().length == 0){
            pic_secode.shine4Error().focus();
            return false;
        }
        // 身份证（部分活动需要）
        if (id_card && id_card.length) {
            if( !tcb.validIDCard(id_card.val().trim()) ){
                id_card.shine4Error().focus();
                return false;
            }
        }
        // 回收常见问题
        if(agree_protocol&&agree_protocol.length){
            if(!agree_protocol.attr('checked')){
                agree_protocol.ancestorNode('label').shine4Error();
                return false;
            }
        }

        return true;
    }
    // 验证邮寄表单(自行联系快递)
    function validYoujiForm2(wForm) {
        if (!(wForm && wForm.length)) {
            return false;
        }

        var alipay_id   = wForm.one('[name="alipay_id"]'), //支付宝账号id
            alipay_name = wForm.one('[name="alipay_name"]'), //支付宝账号name

            bank_name = wForm.one('[name="bank_name"]'), // 开户银行
            bank_area = wForm.one('[name="bank_area"]'), // 开户地区
            bank_num = wForm.one('[name="pay_account"]'), // 开户账号
            bank_user = wForm.one('[name="account_holder"]'),// 开户人姓名

            mobile = wForm.one('[name="tel"]'), //手机号
            mcode = wForm.one('[name="code"]'), // 短信验证码
            pic_secode = wForm.one('[name="pic_secode"]'), // 图形验证码

            id_card= wForm.one('[name="id_card"]'), // 身份证（某些情况需要，非必需）
            agree_protocol = wForm.one('[name="agree_protocol"]');

        // 收款方式为-支付宝
        if( wForm.one('.pay-m-curr').attr('data-rel') == 'alipay' ){
            // 设置pay_method为支付宝：alipay
            wForm.one('[name="pay_method"]').val( 'alipay' );

            // 支付宝账号
            if( alipay_id.val().trim().length == 0 ){
                alipay_id.shine4Error().focus();
                return false;
            }
            // 支付宝真实姓名
            if( alipay_name.val().trim().length == 0 ){
                alipay_name.shine4Error().focus();
                return false;
            }
        }
        else{
            // 设置pay_method为银行：bank
            wForm.one('[name="pay_method"]').val( 'bank' );

            // 银行
            if( bank_name.val() == -1){
                bank_name.shine4Error().focus();
                return false;
            }
            // 开户地区
            if( bank_area.val().trim().length == 0){
                W('.city-selector').shine4Error();
                return false;
            }
            // 开户账号
            if( bank_num.val().trim().length == 0 ){
                bank_num.shine4Error().focus();
                return false;
            }
            // 开户人名
            if( bank_user.val().trim().length == 0 ){
                bank_user.shine4Error().focus();
                return false;
            }
        }

        //手机号
        if( !tcb.validMobile(mobile.val().trim()) ){
            mobile.shine4Error().focus();
            return false;
        }
        // 短信验证码
        if(mcode.val().trim().length == 0){
            mcode.shine4Error().focus();
            return false;
        }
        // 图形验证码
        if(pic_secode.val().trim().length == 0){
            pic_secode.shine4Error().focus();
            return false;
        }
        // 身份证（部分活动需要）
        if (id_card && id_card.length) {
            if( !tcb.validIDCard(id_card.val().trim()) ){
                id_card.shine4Error().focus();
                return false;
            }
        }
        // 回收常见问题
        if(agree_protocol&&agree_protocol.length){
            if(!agree_protocol.attr('checked')){
                agree_protocol.ancestorNode('label').shine4Error();
                return false;
            }
        }

        return true;
    }

    // 验证是否活动内手机号
    function validHuanxin10086Mobile($mobile, callback) {
        var mobile = $mobile.val().trim();
        // 10086回收换新
        if (W('body').hasClass('page-hs-hx-10086')) {
            // 输入数字位数为11+，开始验证手机号
            if (mobile.length==11) {
                if (!tcb.validMobile(mobile)) {

                    $mobile.shine4Error();

                    typeof callback==='function' && callback();
                } else {
                    if (window.__HD_ID!='1') {
                        typeof callback==='function' && callback();

                    }
                }
            } else {
                $mobile.attr('data-not2g3g', '');
                $mobile.attr('data-novalid', '');

                typeof callback==='function' && callback();
            }
        } else {
            typeof callback==='function' && callback();
        }
    }

    // 滚动条滚动时
    function scrollTab(){
        // 滚动条事件
        var wBoundary = W('.hs-new-forms'),
            wNav = W('.hs-forms-tab');
        if (wBoundary.length && wNav.length) {
            var
                wNavPlaceholder = W('.hs-forms-tab-placeholder'),
                n_height = wNav.getRect()['height']-(-8),
                boundary = [wBoundary.xy()[1]-4];

            var top_fwcn = W('.hs-f-content-fwcn').xy()[1]-n_height,
                top_comment = W('.hs-f-content-comment').xy()[1]-n_height,
                top_yinsi = W('.hs-f-content-yinsi').xy()[1]-n_height,
                top_question = W('.hs-f-content-question').xy()[1]-n_height;

            boundary.push(top_fwcn, top_comment, top_yinsi, top_question);

            var wTabItem = W('.hs-forms-tab .hs-f-item');
            /**
             * 设置顶部tab的位置
             */
            function setTopPos() {
                var s_top = tcb.getScrollTop();

                // 滚动条滚动到tab的临界位置以下
                if (s_top > boundary[0]) {
                    if (window._isIE6) {
                        wNav.css({
                            'position': 'absolute',
                            'top': s_top - boundary[0]-3
                        });
                    } else {
                        wNav.css({
                            'position': 'fixed'
                        });
                    }
                    wNavPlaceholder.show();

                } else {
                    wNav.css({
                        'position': 'static'
                    });
                    wNavPlaceholder.hide();
                }

                if (s_top<boundary[1]){
                    wTabItem.item(0).addClass('hs-f-item-curr').siblings('.hs-f-item-curr').removeClass('hs-f-item-curr');
                } else if(s_top<boundary[2]) {
                    wTabItem.item(1).addClass('hs-f-item-curr').siblings('.hs-f-item-curr').removeClass('hs-f-item-curr');
                } else if(s_top<boundary[3]) {
                    wTabItem.item(2).addClass('hs-f-item-curr').siblings('.hs-f-item-curr').removeClass('hs-f-item-curr');
                } else if(s_top<boundary[4]) {
                    wTabItem.item(3).addClass('hs-f-item-curr').siblings('.hs-f-item-curr').removeClass('hs-f-item-curr');
                } else{
                    wTabItem.item(4).addClass('hs-f-item-curr').siblings('.hs-f-item-curr').removeClass('hs-f-item-curr');
                }
            }
            function setTopPos2(e) {
                var s_top = e.target.scrollTop;

                // 滚动条滚动到tab的临界位置以下
                if (s_top > boundary[0]) {
                    if (window._isIE6) {
                        wNav.css({
                            'position': 'absolute',
                            'top': s_top - boundary[0]-3
                        });
                    } else {
                        wNav.css({
                            'position': 'fixed'
                        });
                    }
                    wNavPlaceholder.show();

                } else {
                    wNav.css({
                        'position': 'static'
                    });
                    wNavPlaceholder.hide();
                }

                if (s_top<boundary[1]){
                    wTabItem.item(0).addClass('hs-f-item-curr').siblings('.hs-f-item-curr').removeClass('hs-f-item-curr');
                } else if(s_top<boundary[2]) {
                    wTabItem.item(1).addClass('hs-f-item-curr').siblings('.hs-f-item-curr').removeClass('hs-f-item-curr');
                } else if(s_top<boundary[3]) {
                    wTabItem.item(2).addClass('hs-f-item-curr').siblings('.hs-f-item-curr').removeClass('hs-f-item-curr');
                } else if(s_top<boundary[4]) {
                    wTabItem.item(3).addClass('hs-f-item-curr').siblings('.hs-f-item-curr').removeClass('hs-f-item-curr');
                } else{
                    wTabItem.item(4).addClass('hs-f-item-curr').siblings('.hs-f-item-curr').removeClass('hs-f-item-curr');
                }
            }

            if (tcb.queryUrl(window.location.search, 'inclient')){
                //W('.page-hs-client .bd-content').on('scroll', setTopPos2);
            } else {

                W(window).on('scroll', setTopPos);
                W(window).on('load', function(){
                    var top_fwcn = W('.hs-f-content-fwcn').xy()[1]-n_height,
                        top_comment = W('.hs-f-content-comment').xy()[1]-n_height,
                        top_yinsi = W('.hs-f-content-yinsi').xy()[1]-n_height,
                        top_question = W('.hs-f-content-question').xy()[1]-n_height;

                    boundary[1] = top_fwcn;
                    boundary[2] = top_comment;
                    boundary[3] = top_yinsi;
                    boundary[4] = top_question;

                    setTopPos();
                });
                W(window).on('resize', function(){
                    var top_fwcn = W('.hs-f-content-fwcn').xy()[1]-n_height,
                        top_comment = W('.hs-f-content-comment').xy()[1]-n_height,
                        top_yinsi = W('.hs-f-content-yinsi').xy()[1]-n_height,
                        top_question = W('.hs-f-content-question').xy()[1]-n_height;

                    boundary[1] = top_fwcn;
                    boundary[2] = top_comment;
                    boundary[3] = top_yinsi;
                    boundary[4] = top_question;

                    setTopPos();
                });

                W(window).on('myresize', function(){
                    var top_fwcn = W('.hs-f-content-fwcn').xy()[1]-n_height,
                        top_comment = W('.hs-f-content-comment').xy()[1]-n_height,
                        top_yinsi = W('.hs-f-content-yinsi').xy()[1]-n_height,
                        top_question = W('.hs-f-content-question').xy()[1]-n_height;

                    boundary[1] = top_fwcn;
                    boundary[2] = top_comment;
                    boundary[3] = top_yinsi;
                    boundary[4] = top_question;

                    setTopPos();
                });

            }
        }
    }

    function init(){
        // 初始化根据滚动条变化的tab事件
        scrollTab();

        // 初始化银行地区选择
        if(W('.pay-info-box').length){
            bankAreaSelector.init( '.pay-info-box', '.bank-province-selector', '.bank-city-selector', '.bank-area', __bankArea );
        }

        // 选择取件时间
        if(W('[name="express_time"]').length){
            new DateTime('[name="express_time"]', {
                dateList : DateTime.getDateList(1, 2),
                timeList : [
                    {'text':'10:00', 'value':'10:00'},
                    {'text':'11:00', 'value':'11:00'},
                    {'text':'12:00', 'value':'12:00'},
                    {'text':'13:00', 'value':'13:00'},
                    {'text':'14:00', 'value':'14:00'},
                    {'text':'15:00', 'value':'15:00'},
                    {'text':'16:00', 'value':'16:00'},
                    {'text':'17:00', 'value':'17:00'},
                    {'text':'18:00', 'value':'18:00'}],
                onSelect : function(e){ setTimeout(function(){ W('.ele4phtips[for="form1hour_time"]').hide(); },10); }
            });
        }

        // 预约上门回收时间
        if( W('.order-sale-form-v2 [name="server_time"]').length ){
            new PlaceHolder('.order-sale-form-v2 [name="server_time"]');

            window.__ShangmenDateTime = new DateTime ('.order-sale-form-v2 [name="server_time"]', {
                remote : '/aj/doGetValidDateByRecovery',
                onSelect : function (e) { }
            });
        }

    }
    init()
})

//下单成功页
Dom.ready(function(){
    tcb.bindEvent(document.body,{
        //下单成功页 查看解锁教程
        '.show-course': function (e) {
            e.preventDefault()
            var brand_id = $(this).attr('data-brand_id')
            var course_instance = showCourse(brand_id)
            course_instance.show()
        },
        '.show-yuyue-btn': function () {
            var order_id = tcb.queryUrl(window.location.href, 'order_id'),
                redirect_url = tcb.setUrl2 ('/huishou/order_succ', {
                    'order_id' : order_id
                })

            YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {

                var html_fn = $('#JsHSSchedulePickupPanelTpl').html().trim().tmpl(),
                    html_st = html_fn ({
                        data : {
                            province : '',
                            city     : res['city_name'] || window.__CITY_NAME,
                            area_list : res['area_list']||[],
                            mobile   : res['default_mobile'],
                            order_id : order_id,
                            url : redirect_url
                        }
                    })

                var DialogObj = tcb.showDialog (html_st, {
                        className : 'schedule-pickup-panel',
                        withClose : false,
                        middle    : true//,
                        // onClose:function () {
                        //     window.location.href = redirect_url
                        // }
                    })

                // 绑定预约取件相关事件
                YuyueKuaidi.bindEventSchedulePickup (DialogObj.wrap, redirect_url)

            })
        }
    })

    //查看解锁教程
    var showCourse = (function() {
        var instance = null
        function ShowCourse(brand_name) {
            this.brand_imgs = {
                '10':'https://p0.ssl.qhmsg.com/t015b5fd8c1a532d508.png',
                '0': 'https://p0.ssl.qhmsg.com/t0187b3e1aa9261d754.png',
                '20': 'https://p1.ssl.qhmsg.com/t01457cec6f52ae6f0b.png',
                '13': 'https://p2.ssl.qhmsg.com/t0121b9870a8614e5e9.png'
            }
            this.brand_img = this.brand_imgs[brand_name]

            this.init()
        }
        ShowCourse.getInstance = function (brand_name) {
            if(!instance){
                instance = new ShowCourse(brand_name)
            }
            return instance
        }
        ShowCourse.prototype = {
            constructor: ShowCourse,
            init: function () {
                this.creatEle()
                this.bindEvent()
            },
            creatEle: function () {
                var $course_wrap = $('<div class="course-wrap"></div>')
                var inner_str = '<div class="course-inner"> <i class="icon-close"></i><div class="img-wrap"><img src="'+this.brand_img+'" alt=""></div></div>'
                $course_wrap.html(inner_str)
                $(document.body).append($course_wrap)
            },
            bindEvent: function () {
                var self = this
                $('.icon-close').on('click',function (e) {
                    e.preventDefault()
                    self.hide()
                })
                $(window).on('keydown',function (e) {
                    if(e.keyCode ==27){
                        self.hide()
                    }
                })
            },
            show: function () {
                setTimeout(function () {
                    $('.course-wrap').css({'display':'block'})
                }, 1)
            },
            hide: function () {
                $('.course-wrap').css({'display':'none'})
            },

        }
        return ShowCourse.getInstance
    })()
});


// 银行地区选择
var bankAreaSelector = (function(){
    var _area,
        _wrapBox,
        _provenceBox, Wprovence,
        _cityBox, Wcity,
        _filed, Wfiled,
        wCurPayInfoBox = null;
    function init(wrapBox, provenceBox, cityBox, filed, area){
        _area = area;

        _wrapBox = wrapBox;
        _provenceBox = provenceBox;
        Wprovence = W(provenceBox);
        _cityBox = cityBox;
        Wcity = W(cityBox);
        _filed = filed;
        Wfiled = W(filed);

        wCurPayInfoBox = Wprovence.ancestorNode(_wrapBox);

        showProvences();
        bindEvent();
    }

    function bindEvent(){
        // 切换省
        Wprovence.on('change', function(e){
            var wMe = W(this);

            wCurPayInfoBox = wMe.ancestorNode(_wrapBox);

            var p_val = wMe.val();
            if( p_val >-1 ){
                showCitys(p_val);
            }
        });
        // 切换城市
        Wcity.on('change', function(e){
            var wMe = W(this);

            wCurPayInfoBox = wMe.ancestorNode(_wrapBox);

            setFiled();
        });
    }

    function showProvences(){
        var list = _area.provinces;
        var str = '<option value="-1">所在地区</option>';
        for(var i=0, n=list.length; i<n; i++){
            str += '<option value="'+i+'">'+list[i]+'</option>';
        }

        Wprovence.html( str );
    }
    // 显示城市
    function showCitys(pid){
        var list = _area.cities[pid];

        var str = '';
        for(var i=0, n=list.length; i<n; i++){
            str += '<option value="'+i+'">'+list[i]+'</option>';
        }

        wCurPayInfoBox.query(_cityBox).show().html( str );

        setFiled();
    }

    function setFiled(){
        var province = wCurPayInfoBox.query(_provenceBox).one('option[selected]').html(),
            city = wCurPayInfoBox.query(_cityBox).one('option[selected]').html();

        wCurPayInfoBox.query(_filed).val( province +'|'+ city );
    }

    return { init: init }
})();


;/**import from `/resource/js/page/huishou/hx_pinggu_detail.js` **/
// 以旧换新
Dom.ready(function(){
    if (!window._CACHE['hx_flag']) {
        return ;
    }
    // 事件绑定
    tcb.bindEvent(document.body, {
        // 修改需要换新的机器
        '.js-change-newproduct': function(e) {
            e.preventDefault();

            var NewProductList = window.NewProductList;

            if ( !(NewProductList && NewProductList.length) ) {
                return ;
            }

            var product_list = [];

            NewProductList.forEach(function(item){
                product_list.push({
                    'pid': item['show_info']['product_id'],
                    'name': item['show_info']['title'],
                    'img': item['show_info']['img_url_pc'],
                    'price': item['price_diff']
                });
            });

            var html_str = W('#JsHuishouHuanxinNewproductListTpl').html().trim().tmpl()({
                'product_list': product_list
            });

            var config = {
                //width:710,
                //height:510,
                withMask: true,
                //dragable: true,
                className: 'dialog-wrap dialog-wrap-newproduct'// border8-panel pngfix
            };
            ObjPanel = tcb.panel('', html_str, config);
        },
        // 立即换新
        '.js-liji-huanxin': function(e){
            e.preventDefault();

            var $me = W(this);

            var pid = $me.attr('data-id'),
                url_hash = $me.attr('href'),
                product_title = $me.attr('data-title'),
                img_name = $me.attr('data-img');

            if (!pid) {
                return ;
            }
            var request_url = tcb.setUrl('/youpin/product', {
                'product_id': pid,
                'ajax': '1'
            });
            QW.Ajax.get(request_url, function(res){
                res = QW.JSON.parse(res);

                var selectedAttr = res['result']['product_attr'],
                    AttrGroup = [],
                    AttrList = [],
                    show_price, real_price;

                var product_attr_hash = res['result']['attr_combine'],
                    product_attr_price_hash = res['result']['attr_combine_price'];
                QW.ObjectH.map(product_attr_hash, function(v, k){
                    product_attr_hash[k] = {
                        'product_id': v.split('product_id=')[1],
                        'show_price': product_attr_price_hash[k]['show_price'],
                        'real_price': product_attr_price_hash[k]['real_price']
                    };

                    AttrGroup.push(k.split(','));
                });
                CurProductAttrHash = product_attr_hash;
                show_price = product_attr_price_hash[selectedAttr.join(',')]['show_price'];
                real_price = product_attr_price_hash[selectedAttr.join(',')]['real_price'];

                var product_attr_storage,product_attr_color,
                    product_attr_net, product_attr_channel;
                res['result']['model_attr'].forEach(function(v, k){
                    var AttrList_sub = [];
                    if(v['name'].indexOf('网络')>-1){
                        v['name'] = '网络';
                    }
                    switch (v['name']){
                        // 颜色
                        case '颜色':
                            product_attr_color = {
                                'pos': k,
                                'attr': [],
                                'name': v['name']
                            };
                            var color_hash = {
                                '灰色': ['https://p.ssl.qhimg.com/t01ac5eb2a592100755.jpg', '深空灰'],
                                '黑色': ['https://p.ssl.qhimg.com/t01a02895aa5f484340.jpg', '黑色'],
                                '金色': ['https://p.ssl.qhimg.com/t01e09d5b06bf3e5b23.jpg', '金色'],
                                '银色': ['https://p.ssl.qhimg.com/t01ffbf2f745362ed37.jpg', '银色'],
                                '白色': ['https://p.ssl.qhimg.com/t01f87f5a81cf2c7cb6.jpg', '白色'],
                                '蓝色': ['https://p.ssl.qhimg.com/t0117c6bb967cc3c870.png', '蓝色'],
                                '绿色': ['https://p.ssl.qhimg.com/t01902e76cea14ead02.png', '绿色']
                            };
                            QW.ObjectH.map(v['attr'], function(vv, kk){
                                var color_img  = 'https://p.ssl.qhimg.com/t01ac5eb2a592100755.jpg',
                                    color_name = vv;

                                var color = color_hash[vv];
                                if (color) {
                                    color_img  = color[0];
                                    color_name = color[1];
                                }

                                product_attr_color['attr'].push({
                                    'val':kk,
                                    'txt': color_name,
                                    'color_img': color_img
                                });
                                AttrList_sub.push(kk);
                            });
                            break;
                        // 容量
                        case '容量':
                            product_attr_storage = {
                                'pos': k,
                                'attr': [],
                                'name': v['name']
                            };
                            QW.ObjectH.map(v['attr'], function(vv, kk){
                                vv = $.trim(vv.split('G')[0]);
                                product_attr_storage['attr'].push({
                                    'val':kk,
                                    'txt': vv
                                });
                                AttrList_sub.push(kk);
                            });
                            break;
                        // 网络
                        case '网络':
                            product_attr_net = {
                                'pos': k,
                                'attr': [],
                                'name': v['name']
                            };
                            QW.ObjectH.map(v['attr'], function(vv, kk){
                                product_attr_net['attr'].push({
                                    'val':kk,
                                    'txt': vv
                                });
                                AttrList_sub.push(kk);
                            });
                            break;
                        // 渠道
                        case '渠道':
                            product_attr_channel = {
                                'pos': k,
                                'attr': [],
                                'name': v['name']
                            };
                            QW.ObjectH.map(v['attr'], function(vv, kk){
                                product_attr_channel['attr'].push({
                                    'val':kk,
                                    'txt': vv
                                });
                                AttrList_sub.push(kk);
                            });
                            break;
                    }

                    AttrList.push(AttrList_sub);
                });

                var img = img_name ? img_name : 'https://p.ssl.qhimg.com/t01e90b98b2cb5640c3.jpg';

                var param_data = {
                    'img': img,
                    'url_hash': url_hash,
                    'product_id': pid,
                    'show_price': show_price,
                    'real_price': real_price,
                    'product_title': product_title,
                    'product_attr_storage':product_attr_storage,
                    'product_attr_color':product_attr_color,
                    'product_attr_net':product_attr_net,
                    'product_attr_channel':product_attr_channel
                };

                var content_html = W('#JsHuishouHuanxinProductSelectTpl').html().trim().tmpl()(param_data);

                var config = {
                    //width:710,
                    //height:510,
                    withMask: true,
                    //dragable: true,
                    className: 'dialog-wrap'// border8-panel pngfix
                };
                ObjPanel2 = tcb.panel('', content_html, config);

                //tcb.showDialog(content_html);
                //showPanel(param_data);

                setProductAttrUi(selectedAttr, AttrGroup, AttrList);
            });
        },
        // 选择商品属性
        '.product-attr .item a': function(e){
            e.preventDefault();

            var $me = W(this),
                $cnt = $me.ancestorNode('.cnt');

            //if ($me.hasClass('disabled')) {
            //    return ;
            //}

            $cnt.query('.item a').removeClass('cur');
            $me.addClass('cur');

            // 设置属性组合商品id
            setProductId();
        },
        // 去回收页面评估旧机，换新机
        '.goto-huanxinji-btn': function(e){
            e.preventDefault();

            var $me = W(this),
                pid = $me.attr('data-pid');

            if (!pid){
                tcb.errorBlink(W('.product-attr .item a'));
                return;
            }

            var redirect_url = tcb.setUrl(window.location.href, {
                'newproductid': pid
            }).replace(/%2C/ig, ',');

            window.location.href = redirect_url;
        },
        // 关闭弹层
        '.dialog-close': function(e){
            e.preventDefault();

            var wMe = W(this),
                wWrap = wMe.ancestorNode('.dialog-wrap-newproduct');
            // 关闭新机列表
            if (wWrap.length) {
                if (ObjPanel && ObjPanel.hide) {
                    ObjPanel.hide();
                }
                if (ObjPanel2 && ObjPanel2.hide) {
                    ObjPanel2.hide();
                }
            }
            else {
                if (ObjPanel2 && ObjPanel2.hide) {
                    ObjPanel2.hide();
                }
                if (ObjPanel3 && ObjPanel3.hide) {
                    ObjPanel3.hide();
                }
            }
        },
        // 换新重新填写手机号
        '.huanxin-no-right-tip-wrap .btn-change-mobile': function(e){
            e.preventDefault();

            if (ObjPanel2 && ObjPanel2.hide) {
                ObjPanel2.hide();
            }
            if (ObjPanel3 && ObjPanel3.hide) {
                ObjPanel3.hide();
            }
        },
        // 激活换新订单提交表单
        '.btn-active-huanxin-form': function(e){
            e.preventDefault();

            window.location.hash = '#suborder';

            tcb.gotoTop.goPlace(W('#doc-topbar').getRect()['height'])

            window._CACHE['cityPanel'].options.onConfirm(
                window._CACHE['cityPanel'].getSelectedData(),
                window._CACHE['cityPanel']
            )

            W('.hx-type-wrap').slideDown(200, function(){
                try{
                    setTimeout(function(){
                        W(document).fire('myresize');
                    }, 0);
                }catch(ex){}
            });
            W('.hx-detail-wrap').addClass('block-freeze-up');
            W('.change-newproduct').hide();
            W('.confirm-btn-line').hide();

        },
        // 换新旧机列表的鼠标事件
        '.hx-detail-wrap .item': {
            'mouseenter': function (e) {
                var wMe = W(this);

                if (wMe.hasClass('item-first')) {
                    return ;
                }
                wMe.addClass('item-cur');
            },
            'mouseleave': function (e) {
                var wMe = W(this);

                wMe.removeClass('item-cur');
            }
        },
        // 删除旧机
        '.hx-detail-wrap .btn-delete-item': function(e){
            e.preventDefault();

            var wMe = W(this),
                assess_key = wMe.attr('assess_key'),
                wItem = wMe.ancestorNode('.item');

            QW.Ajax.post('/huishou/doDelCart', {"assess_key" : assess_key}, function(res){
                res = QW.JSON.parse(res);

                if (!res['errno']) {
                    var wSib = wItem.siblings('.item');
                    if (wSib.length > 1) {
                        //动态计算新机 、旧机差额
                        var res_obj = res['result'];

                        var final_price = res_obj['new_machine_price'], // 新机最终价格（为正表示用户还需要支付的金额，负表示用户还可以额外得到的金额）
                            butie_price_samsung = W('.samsung-butie-line').attr('data-butie-price') || 0; // 三星活动商品补贴价格

                        final_price = final_price - butie_price_samsung;
                        var final_price_abs = Math.abs(final_price);

                        var str = '除了全新'
                                + res_obj['model_name']
                                + '外您还能获得：<span class="final-price" data-price="'
                                + final_price_abs + '">' + final_price_abs + '元</span>';
                        if (window.__HD_ID=='8'){
                            str = '除了'
                                + res_obj['model_name']
                                + '外您还能获得：<span class="final-price" data-price="'
                                + final_price_abs + '">' + final_price_abs + '元</span>';
                        }
                        if (final_price > 0) {
                            str = '换个新'
                                + res_obj['model_name'] + '仅需：<span class="final-price" data-price="'
                                + final_price_abs + '">' + final_price_abs + '元</span>';
                            if (window.__HD_ID=='8'){
                                str = '换个'
                                    + res_obj['model_name'] + '仅需：<span class="final-price" data-price="'
                                    + final_price_abs + '">' + final_price_abs + '元</span>';
                            }
                        }

                        window._CACHE['show_offline'] = res_obj['show_offline'];

                        // 判断当前是否显示允许上门，如果是的话，将上门form remove掉，同时选中下一tab
                        var type_data = W('.tab-selected').attr('data-type');
                        if (window._CACHE['show_offline'] == false && type_data == '0') {
                            W('#shangmenSaleForm1').removeNode();
                            W('.type-select-tab .tab').item(1).click();
                        }

                        W('.final-price-line .final-price-desc').html(str);
                        wItem.fadeOut(400, function () {
                            wItem.removeNode();
                            W('.btn-add-more').show();

                            try {
                                W(document).fire('myresize');
                            } catch (ex) {}
                        });
                    } else {
                        var url_query = tcb.queryUrl(window.location.search);
                        // 删除购物车无商品
                        if (window._CACHE['no_product']) {
                            window.location.href = tcb.setUrl('/huishou', {
                                'iframe': url_query['iframe']
                            });
                        } else {
                            window.location.href = tcb.setUrl('/youpin/product', {
                                'product_id': tcb.queryUrl(window.location.href, 'newproductid'),
                                'iframe': url_query['iframe']
                            });
                        }
                    }
                }

            });

        }

    });

    function init(){
        var hash = tcb.parseHash(window.location.hash);
        if (typeof hash['suborder'] !== 'undefined') {
            // 触发显示换新提交表单
            W('.btn-active-huanxin-form').fire('click');
        }

        // 预约上门回收时间
        if( W('#shangmenSaleForm1 [name="server_time"]').length ){
            new PlaceHolder('#shangmenSaleForm1 [name="server_time"]');

            window.__ShangmenDateTime = new DateTime('#shangmenSaleForm1 [name="server_time"]', {
                remote: '/aj/doGetValidDateByRecovery',

                onSelect : function(e){ }
            });
        }
    }
    init();


    // 上门维修表单
    W('#shangmenSaleForm1, #daodianSaleForm1, #youjiSaleForm1').on('submit', function(e){
        e.preventDefault();
        var wForm = W(this);

        var mobile = wForm.one('[name="tel"]'), // 手机号
            mcode  = wForm.one('[name="code"]'),// 验证码
            server_time   = wForm.one('[name="server_time"]'), // 上门时间
            addr   = wForm.one('[name="user_addr"]'), // 用户地址
            uname  = wForm.one('[name="user_name"]'), // 用户姓名（邮寄换新）
            id_card= wForm.one('[name="id_card"]'),
            agree_protocol = wForm.one('[name="agree_protocol"]'); // 用户协议

        mobile.attr('data-novalid', '');

        // 用户姓名
        if (uname && uname.length) {
            if( uname.val().trim().length == 0 ){
                uname.shine4Error().focus();
                return;
            }
        }

        //手机号
        if( mobile && mobile.length && !tcb.validMobile(mobile.val().trim()) ){
            mobile.shine4Error().focus();
            return;
        }

        // 手机验证码
        if (mcode && mcode.length) {
            if( mcode.val().trim().length == 0 ){
                mcode.shine4Error().focus();
                return;
            }
        }

        // 上门时间
        if (server_time && server_time.length) {
            if( server_time.val().trim().length == 0 ){
                server_time.shine4Error().focus();
                return;
            }
        }

        // 地址
        if( addr && addr.length && addr.val().trim().length == 0 ){
            addr.shine4Error().focus();
            return;
        }

        // 身份证（部分活动需要）
        if (id_card && id_card.length) {
            if( !tcb.validIDCard(id_card.val().trim()) ){
                id_card.shine4Error().focus();
                return;
            }
        }

        // 回收常见问题
        if(agree_protocol&&agree_protocol.length){
            if(!agree_protocol.attr('checked')){
                agree_protocol.ancestorNode('label').shine4Error();
                return;
            }
        }

        // 验证是否换新活动手机号
        validHuanxin10086Mobile(mobile, function () {

            if(wForm.attr('submiting')=='1'){
                return;
            }
            wForm.attr('submiting', '1');

            QW.Ajax.post('/huishou/doSubmitOrder', wForm[0], function(rs){
                rs = QW.JSON.parse(rs);
                //成功
                if(rs.errno == 0){
                    var parent_id   = rs.result.parent_id;
                    var url_query = tcb.queryUrl(window.location.search),
                        data_params = {
                            'order_id': parent_id,
                            'from':url_query['from'],
                            '_from': url_query['_from'],
                            'sale_type':url_query['sale_type'],
                            'inclient':url_query['inclient'],
                            'iframe'  : url_query['iframe']
                        };


                    // 换新活动专享，跳到发票信息页面
                    // if (wForm.query('[name="newproductid"]').val()) {
                    //     // 输入发票信息
                    //     var redireact_url = tcb.setUrl('/huishou/order_invoice', data_params);
                    // } else {
                    //     var redireact_url = tcb.setUrl('/huishou/order_succ', data_params);
                    // }
                    var redireact_url = tcb.setUrl('/huishou/order_succ', data_params);


                    //如果是邮寄订单帮叫快递  否则直接跳转
                    var type_data = W('.tab-selected').attr('data-type');

                    if(type_data == '3'){
                        var order_id = parent_id;
                        var redirect_url = redireact_url;
                        YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {

                            var
                                html_fn = $('#JsHSSchedulePickupPanelTpl').html().trim().tmpl(),
                                html_st = html_fn ({
                                    data : {
                                        province : '',
                                        city     : res['city_name'] || window.__CITY_NAME,
                                        area_list : res['area_list']||[],
                                        mobile   : res['default_mobile'],
                                        order_id : order_id,
                                        url : redirect_url
                                    }
                                })

                            var
                                DialogObj = tcb.showDialog (html_st, {
                                    className : 'schedule-pickup-panel',
                                    withClose : false,
                                    middle    : true,
                                    // onClose:function () {
                                    //     window.location.href = redirect_url
                                    // }
                                })

                            // 绑定预约取件相关事件
                            YuyueKuaidi.bindEventSchedulePickup (DialogObj.wrap, redirect_url)

                        })
                    }else {
                        window.location.href = redireact_url
                    }
                }else{
                    alert("抱歉，出错了。" + rs.errmsg);
                }
                wForm.attr('submiting', '');
            });
        });
    });

    var ObjPanel3;
    // 验证是否活动内手机号
    function validHuanxin10086Mobile($mobile, callback) {
        var mobile = $mobile.val().trim();

        // 回收换新
        if (W('body').hasClass('page-hs-hx-10086')) {
            // 输入数字位数为11+，开始验证手机号
            if (mobile.length==11) {
                if (!tcb.validMobile(mobile)) {

                    $mobile.shine4Error();

                    typeof callback==='function' && callback();
                } else {
                    if (window.__HD_ID!='1') {
                        typeof callback==='function' && callback();

                    }
                }
            } else {
                $mobile.attr('data-not2g3g', '');
                $mobile.attr('data-novalid', '');

                typeof callback==='function' && callback();
            }
        } else {
            typeof callback==='function' && callback();
        }
    }


    var CurProductAttrHash,
        ObjPanel, ObjPanel2, typeTipPanel;
    /**
     * 设置商品属性的ui状态
     * @param selectedAttr 当前选择商品属性
     * @param AttrGroup 所有可用属性组
     * @param AttrList 属性列表
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

        var wPCate = W('.product-attr-line');
        wPCate.forEach(function(el, i){
            var $line = $(el),
                pos = parseInt($line.attr('data-pos'), 10);
            W(el).query('.item a').forEach(function(el){
                var wItem = W(el),
                    attr_id = wItem.attr('data-attrid');
                wItem.removeClass('cur').removeClass('disabled').removeClass('disabled-hover');// 移除状态
                // 设置那些不能被选择的属性
                if (!SelectableAttr[pos].contains(attr_id)) {
                    wItem.addClass('disabled');
                } else {
                    wItem.removeClass('disabled');
                }

                if(attr_id === selectedAttr[pos]){
                    wItem.addClass('cur');
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

    // 设置商品id
    function setProductId(){
        var pid = '', attr = ['', '', '', ''];
        W('.product-attr-line').forEach(function(el, i){
            var $me = W(el),
                pos = parseInt($me.attr('data-pos'), 10),
                attrid = $me.query('.cur').attr('data-attrid');

            attr[pos] = attrid;
        });

        var $btn = W('.goto-huanxinji-btn'),
            attr_key = attr.join(','), show_price, real_price;
        show_price = CurProductAttrHash[attr_key]['show_price'];
        real_price = CurProductAttrHash[attr_key]['real_price'];

        W('.dialog-wrap .show-price').html('￥'+show_price);
        W('.dialog-wrap .real-price').html('京东价￥'+real_price);

        pid = CurProductAttrHash[attr_key]['product_id'];
        pid = pid?pid:'';
        $btn.attr('data-pid', pid);
    }

    // 激活城市区县选择
    function activeAreaSelect (OptDefault) {
        OptDefault = OptDefault || []
        var
            options = {
                // 实例化的时候自动执行init函数
                flagAutoInit     : true,
                selectorProvince : '[name="province"]',
                selectorCity     : '[name="city"]',
                selectorArea     : '[name="area"]',
                province         : OptDefault[ 0 ],
                city             : OptDefault[ 1 ],
                area             : OptDefault[ 2 ]
            }

        Bang.AddressSelect (options)
    }
    activeAreaSelect ()

});


;/**import from `/resource/js/page/huishou/hx_order_succ.js` **/
;(function () {
    $(function () {
        var $hs_hx = $('.page-hs-hx')
        if(!$hs_hx || !$hs_hx.length>0){ return }

        var href = window.location.href,
            query = tcb.queryUrl(href)


        function init() {
            __bindEvent()
        }
        init()

        function __bindEvent() {
            tcb.bindEvent(document,{
                '.js-trigger-show-yy': function (e) {
                    e.preventDefault()
                    var order_id = query['order_id']
                    var redirect_url = href;
                    YuyueKuaidi.getGuoGuoForm(order_id, redirect_url, function (res) {

                        var
                            html_fn = $('#JsHSSchedulePickupPanelTpl').html().trim().tmpl(),
                            html_st = html_fn ({
                                data : {
                                    province : '',
                                    city     : res['city_name'] || window.__CITY_NAME,
                                    area_list : res['area_list']||[],
                                    mobile   : res['default_mobile'],
                                    order_id : order_id,
                                    url : redirect_url
                                }
                            })

                        var
                            DialogObj = tcb.showDialog (html_st, {
                                className : 'schedule-pickup-panel',
                                withClose : false,
                                middle    : true,
                                // onClose:function () {
                                //     window.location.href = redirect_url
                                // }
                            })

                        // 绑定预约取件相关事件
                        YuyueKuaidi.bindEventSchedulePickup (DialogObj.wrap, redirect_url)

                    })
                }
            })
        }
    })
})()

;/**import from `/resource/js/page/huishou/inc/yuyue_kuaidi_panel.js` **/
// 预约快递面板
(function(){

    // 获取果果相关信息
    function getGuoGuoForm (order_id, redirect_url, callback) {
        if (!order_id) {
            return alert ('订单号不能为空')
        }

        QW.Ajax.get ('/huishou/doGetGuoguoForm/', { parent_id : order_id }, function (rs) {
            rs = QW.JSON.parse (rs);

            if (!rs.errno) {
                typeof callback === 'function' && callback (rs[ 'result' ])
            } else {
                window.location.href = redirect_url
                //alert ("抱歉，出错了。" + rs.errmsg);
            }
        })
    }
    // 绑定预约取件相关事件
    function bindEventSchedulePickup ($Target, redirect_url) {
        if (!($Target && $Target.length)) {
            return
        }
        var
            $time_trigger = $Target.query('[name="express_time_alias"]'),
            $address_trigger = $Target.query('[name="express_useraddr"]'),
            $form = $Target.query('form'),
            $btn = $Target.query('.btn-submit')

        // 选择上门取件时间
        new DateTime($time_trigger, {
            remote: '/huishou/doGetAbleExpressTimeTable',
            onSelect : function(e){ }
        })

        if(AddrSuggest && typeof AddrSuggest=='function'){
            // 地址联想
            new AddrSuggest($address_trigger, {
                'showNum' : 6,
                'requireCity' : function(){ return W('.city-sel').html().trim(); }
            })
        }

        // 预约上门取件表单
        $form.on('submit', function(e){
            e.preventDefault()

            if (formSchedulePickupBefore($form)===false){
                return
            }

            if (!formSchedulePickupValid($form)){
                return
            }

            var
                default_btn_text = $btn.val()

            $btn.addClass ('btn-disabled').val ('提交中...')

            if($form.attr('submiting')=='1'){
                return
            }
            $form.attr('submiting', '1')

            QW.Ajax.post($form.attr('action'), $form[0], function(rs){
                try{
                    $form.attr('submiting', '')

                    rs = QW.JSON.parse(rs)

                    //成功
                    if(rs.errno == 0){

                        if (!rs.result) {
                            $btn.removeClass ('btn-disabled').val (default_btn_text)
                        }

                        // 预约成功
                        __showSchedulePickupSuccess (redirect_url)

                    }else{
                        $btn.removeClass ('btn-disabled').val (default_btn_text)

                        // 预约失败
                        __showSchedulePickupFail (redirect_url)
                    }
                } catch (ex){

                    $btn.removeClass ('btn-disabled').val (default_btn_text)

                    // 预约失败
                    __showSchedulePickupFail (redirect_url)

                    $form.attr('submiting', '')
                }
            })
        })
    }

    function formSchedulePickupBefore($Form){
        var
            $express_time_alias = $Form.query ('[name="express_time_alias"]'),
            $express_time = $Form.query('[name="express_time"]')

        $express_time.val ('')
        if ($express_time_alias && $express_time_alias.val ()) {
            var
                date_time = $express_time_alias.val ()

            date_time = date_time.split ('-')
            if (date_time.length > 1) {
                date_time.pop ()
            }
            date_time = date_time.join ('-')

            $express_time.val (date_time)
        }
    }
    function formSchedulePickupValid($Form){
        var
            flag = true,
            $express_username = $Form.query ('[name="express_username"]'),
            $express_tel = $Form.query('[name="express_tel"]'),
            $express_area = $Form.query('[name="express_area"]'),
            $express_useraddr = $Form.query('[name="express_useraddr"]'),
            $express_time_alias = $Form.query('[name="express_time_alias"]')

        var
            $focus_el = null

        // 寄件人姓名
        if ($express_username && $express_username.length) {
            if (tcb.trim ($express_username.val ()).length == 0) {
                $express_username.shine4Error()
                $focus_el = $focus_el || $express_username
                flag = false
            }
        }

        // 手机号
        if (!tcb.validMobile ($express_tel.val ())) {
            $express_tel.shine4Error()
            $focus_el = $focus_el || $express_tel
            flag = false
        }

        // 区县
        if ($express_area && $express_area.length) {
            if (tcb.trim ($express_area.val ()).length == 0) {
                $express_area.shine4Error()
                $focus_el = $focus_el || $express_area
                flag = false
            }
        }

        // 详细地址
        if ($express_useraddr && $express_useraddr.length) {
            if (tcb.trim ($express_useraddr.val ()).length == 0) {
                $express_useraddr.shine4Error()
                $focus_el = $focus_el || $express_useraddr
                flag = false
            }
        }

        // 取件时间
        if ($express_time_alias && $express_time_alias.length) {
            if (tcb.trim ($express_time_alias.val ()).length == 0) {
                $express_time_alias.shine4Error()
                $focus_el = $focus_el || $express_time_alias
                flag = false
            }
        }

        setTimeout (function () {
            $focus_el && $focus_el.focus ()
        }, 500)

        return flag
    }
    function formSchedulePickupAfter(data, redirect_url){
        if (!data) {
            return
        }

        __showSchedulePickupSuccess (redirect_url)
    }
    // 显示预约取件成功
    function __showSchedulePickupSuccess (redirect_url) {

        var
            html_fn = W('#JsHSSchedulePickupSuccessPanelTpl').html ().trim().tmpl(),
            html_st = html_fn ({
                data : {
                    url : redirect_url
                }
            })

        tcb.closeDialog()

        tcb.showDialog (html_st, {
            className : 'schedule-pickup-success-panel',
            withClose : false,
            middle    : true
        })

    }
    // 显示预约取件失败
    function __showSchedulePickupFail (redirect_url) {

        var
            html_fn = W('#JsHSSchedulePickupFailPanelTpl').html ().trim().tmpl(),
            html_st = html_fn ({
                data : {
                    url : redirect_url
                }
            })

        tcb.closeDialog()

        tcb.showDialog (html_st, {
            className : 'schedule-pickup-fail-panel',
            withClose : false,
            middle    : true
        })

    }


    window.YuyueKuaidi = window.YuyueKuaidi || {}

    tcb.mix(window.YuyueKuaidi, {
        getGuoGuoForm: getGuoGuoForm,
        bindEventSchedulePickup:bindEventSchedulePickup
    })

}())
