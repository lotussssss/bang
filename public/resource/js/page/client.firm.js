var firmOrder = firmOrder || (function(){
	var dataListCache = {};

	function init(){
		bindEvent();

		initDoIt();
	}

	/**
	 * 购买结果确认弹窗
	 * @return {[type]} [description]
	 */
	function buyRsConfirm( params, callback ){
		var html = '<dl class="pay-tip clearfix"><dt><span class="tipsico"></span></dt><dd>请您在新打开的网上银行页面进行付款，付款完成前不要关闭该窗口。</dd><dd class="tip-error"></dd></dl>';
		var panel = tcb.panel("360安全支付", html, {
                wrapId: "payLayer",
                width: 400,
                btn: [{
                    txt: "已完成支付",
                    fn: function(){
                    	if(params){
	                        QW.Ajax.post('/aj/get_firmorder_status/', params, function(data){
	                        	var errBox = W(panel.oBody).one('.tip-error');
	                        	data = QW.JSON.parse(data);
	                        	if(data.errno == 0){ //支付成功
	                        		errBox.html('');
	                        		callback && typeof(callback)=='function' && callback();
	                        	}else{ // 支付失败
	                        		errBox.html('暂未收到您的款项，请确认付款后再点击。');
	                        	}
	                        });
		                }else{
		                	callback && typeof(callback)=='function' && callback();
		                }
                    }
                },{
                    txt: "支付遇到问题",
                    fn: function(){
                        location.reload();
                    }
                }]
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

	        W(selector).attr('data-citycode', city);
	        W(selector).one('.city-name').html( city_name );

	        try{ W('#saleComboForm [name="citycode"]').val(city); }catch(ex){}

	        //location.href ="http://" +location.host +"/at/?" + city;
	    });
	}

	//url='/mer_info/jifenmingxi/?flag=1&tab=0&pagesize=10&pn=#{pn}';
	function getAjaxData(showBox, url, pn, isCreatePager, isFamily){
		pn = pn || 0;
		var pagesize = 20;
		var reqUrl = url.replace(/(#\{pn\})/, pn).replace(/(#\{pagesize\})/, pagesize),
			reqParams = reqUrl.split('?')[1];
		showBox = W(showBox);

		if( dataListCache && dataListCache[ encodeURIComponent(reqParams) ] ){
			var c_data = dataListCache[ encodeURIComponent(reqParams) ];

			var func = isFamily ? W('#fmServiceCodeTpl').html().trim().tmpl() : W('#serviceCodeTpl').html().trim().tmpl();
			var html = func( c_data );
			showBox.html( html );

		}else{
			QW.Ajax.get(reqUrl, function(data){
				data = JSON.parse(data);

				var c_data = data.result;

				if(c_data.total == 0){
					showBox.html('<div style="text-align:center; font-size:14px; padding:10px;">暂无记录</div>');
				}else{
					var func = isFamily ? W('#fmServiceCodeTpl').html().trim().tmpl() : W('#serviceCodeTpl').html().trim().tmpl();
					var html = func( c_data );
					showBox.html( html );

					isCreatePager && showPager( Math.ceil( c_data.total/pagesize), W(showBox).siblings('.pagination') , function(c_pn){
						getAjaxData(showBox, url, c_pn);
					});

					dataListCache[ encodeURIComponent(reqParams) ] = c_data;
				}
			});
		}
	}

	/**
	 * 分页
	 * @return {[type]} [description]
	 */
	function showPager(pagenum, box, callback){

		box = W(box);

		if(pagenum==1){
			box.one('.pages').hide().html('');
			return;
		}

		box.one('.pages').show();

		var pn = 0;
	    var pager = new Pager(box.one('.pages'), pagenum, pn);

	    pager.on('pageChange', function(e) {
 			callback && callback(e.pn);
	    });
	}

	//申请上门服务
	function requestShangmenService(code){
		tcbShangmenService.show(code);
	}

	//客户端版本比较
	function campareVersion(dest, src){
		if( dest == src ){return true;}

		var destarr = dest.split(/\./g),
			srcarr = src.split(/\./g);

		var rs;

		for(var i=0, n=destarr.length; i<n; i++){
			if( destarr[i] - srcarr[i] > 0 ){
				return true;
			}else if( destarr[i] - srcarr[i] < 0 ){
				return false;
			}else{
				continue;
			}
		}

	}


	function bindEvent(){
		//申请远程服务
		W('body').delegate('.remote-service-trigger', 'click', function(e){
			e.preventDefault();
			var code = W(this).attr('data-code')||'';
			try{
				window.external.request_remote_service( code );
			}catch(ex){
				try{
					var jsobj;

				    if(QW.Browser.ie){
				        jsobj = W('#jishiieplugin')[0];
				    }else{
				        jsobj = W('#jishichromeplugin')[0];
				    }

				    try{
				    	var v = jsobj.GetVersion();
				    	var rs = campareVersion(v, "1.0.0.2");

				    	if(!rs){
				    		alert('请先安装专业工具。\n如已安装，请重启浏览器，重新打开本页面再点击。');
				        	window.open('http://jishi.360.cn/360ExpertPlugin.exe');
				    	}else if(jsobj.IsNeedUpdate()){
				    		alert('您需要下载最新版本的360安全卫士才能使用此功能。');
				    		window.open('http://down.360safe.com/inst.exe');
				    	}else{
				        	jsobj.RunClient('/locatefirm='+(code||'yes'));
				        }
				    }catch(ex){
				        alert('请先安装专业工具。\n如已安装，请重启浏览器，重新打开本页面再点击。');
				        window.open('http://jishi.360.cn/360ExpertPlugin.exe');

				    }
				}catch(ex){

				}
			}

		});

		//申请上门服务
		W('body').delegate('.shangmen-service-trigger', 'click', function(e){
			e.preventDefault();
			var code = W(this).attr('data-code')||'';
			try{
				requestShangmenService( code );
			}catch(ex){

			}

		});

		//tab1
		W('#taocanTypes').delegate('li', 'click', function(e) {
			if(W(this).hasClass('on')){return false;}
			W(this).siblings('.on').removeClass('on');
			W(this).addClass('on');
			var rel = W(this).attr('data-rel');
			W('.c-packet-item').hide();
			W('.c-packet-item[data-for="'+rel+'"]').show();
		});

		//tab2
		W('#introTab').delegate('li', 'click', function(e) {
			if(W(this).hasClass('on')){return false;}
			W(this).siblings('.on').removeClass('on');
			W(this).addClass('on');
			var rel = W(this).attr('data-rel');
			W('.i-packet-item').hide();
			W('.i-packet-item[data-for="'+rel+'"]').show();
			W('#introTab')[0].scrollIntoView();
		});

		//企业规模
		W('.comp-size-item').on('click', function(e){
			W(this).siblings('.prd-selected').removeClass('prd-selected');
			W(this).addClass('prd-selected');
			var rel = W(this).attr('data-rel');
			W('.taocan-item').hide();
			W('.taocan-item[data-for="'+rel+'"]').show();
		});

		//套餐单选
		W('.taocan-radio').on('click', function(e){
			var prices = W(this).attr('data-prices').split(/\|/g);
			W('.price-detail .sel-price-info').show();
			W('.price-detail .buy-error').hide();
			W('.price-detail .sel-price-info .price-orig').html( prices[0] );
			W('.price-detail .sel-price-info .price-real').html( prices[1] );
			W('.price-detail .sel-price-info .price-off').html( prices[2] );
		});

		//服务包选择
		W('.fuwubao-item').on('click', function(e){
			W(this).siblings('.prd-selected').removeClass('prd-selected');
			W(this).addClass('prd-selected');
			var rel = W(this).attr('data-rel');
			W('.buy-num-item').hide();
			W('.buy-num-item[data-for="'+rel+'"]').show();

			if( rel == 5){
				W('.shangmen-city').show();
			}else{
				W('.shangmen-city').hide();
			}
		});

		//服务包次数选择
		W('.buy-num-item').on('click', function(e){
			W(this).siblings('.prd-selected').removeClass('prd-selected');
			W(this).addClass('prd-selected');

			var prices = W(this).attr('data-prices').split(/\|/g);
			W('.price-detail-f .sel-price-info').show();
			W('.price-detail-f .buy-error').hide();
			W('.price-detail-f .sel-price-info .price-orig').html( prices[0] );
			W('.price-detail-f .sel-price-info .price-real').html( prices[1] );
			W('.price-detail-f .sel-price-info .price-off').html( prices[2] );
		});


		//第一步套餐购买
		W('#buySelTaocan').on('click', function(e){
			var checkedTaocan = W('.taocan-radio:checked');

			if( checkedTaocan.length==0 ){
				W('.price-detail .buy-error').show();
			}else{
				var url = '/firm/taocan_info/?';
				var params = checkedTaocan.attr('data-taocan');

				window.location.href = url  + 'tctype=1&' + params + (window.__inclient? '&inclient=1' : '');
			}
		});

		//第一步服务包购买
		W('#buySelFuwubao').on('click', function(e){
			var checkedFuwubao = W('.buy-num-item.prd-selected');

			if( checkedFuwubao.length==0 ){
				W('.price-detail-f .buy-error').show();
			}else{
				var url = '/firm/taocan_info/?';
				var params = checkedFuwubao.attr('data-taocan');

				window.location.href = url  + 'tctype=2&' + params + '&citycode=' + W('.city-trigger').attr('data-citycode') + (window.__inclient? '&inclient=1' : '');
			}
		});


		//选择城市
		selectCity( '.city-trigger' );

		//支付方式
		W('#saleComboForm').delegate('.pay-method', 'click', function(e){
			if(W(this).val() == 'wangyin'){
				W('#saleComboForm .bank-box').show();
			}else{
				W('#saleComboForm .bank-box').hide();
			}
		});

		//手机号码输入限制
		W('.wg3-tc-detail-sale-form [name="buyer_mobile"]').on('keyup', function(e){
			if( !/^\d+$/.test(W(this).val()) ){
				W(this).val( W(this).val().replace(/\D+/g, '') );
			}
		});

		//选择服务时长
		W('#taocanTimeSelector').on('change', function(e){
			var month = W(this).val(),
				unitPrice = W('#saleComboForm [name="unit_price"]').val(),
				totalPrice = (unitPrice * month).toFixed(2);

			W('#saleComboForm [name="taocan_price"]').val( totalPrice );
		});

		//提交订单
		W('#saleComboForm').on('submit', function(e){
			e.preventDefault();
			var tel = W(this).one('[name="buyer_mobile"]');
			if( tel.val().trim() == ''){
				tel.shine4Error();
				tel.focus();
				return false;
			}

			if( W('#firmSPCheck:checked').length ==0 ){
				var panel = tcb.alert('提示','<div style="padding:10px">您同意《奇虎360企业IT服务协议》后才能购买该产品</div>',{ width:320, height:120}, function(){ panel.hide();});
				return false;
			}

			var payMethod = W('#saleComboForm .pay-method:checked').val();

			W(this).one('[name="bank_code"]').val( (payMethod == 'wangyin'? W('#backSelector').val() : payMethod) );

			QW.Ajax.post(this, function(data){
				data = QW.JSON.parse(data);
				if(data.errno == 0){
					var orderId = data.result.order_id;

					var payUrl = BASE_ROOT + 'firm/subpay/?torder_id=' + orderId;
					var indexUrl = BASE_ROOT + (window.__inclient? 'firm/client':'firm/taocan');
					var detailUrl = BASE_ROOT + 'firm/detail/?torder_id=' + orderId;
					QW.Cookie.set('otel', tel.val(), {'path':'/', 'domain' : '.bang.360.cn'});

					if(window.__inclient){
						//打款支付页面
						window.open( payUrl );

						buyRsConfirm({'torder_id' : orderId} , function(){
							//打开订单完成详情页
							window.open( detailUrl );
							//回到首页
							window.location.replace(indexUrl);
						} );
					}else{//网页中，跳转到支付页，否则会被拦截
						window.location.href = payUrl;
					}

				}else{
					alert("抱歉，订单提交失败。" + data.errmsg);
				}
			});


			return false;
		});

		//修改企业信息
		W('.modify-com-info').on('click', function(e){
			e.preventDefault();
			W('#companyInfoSpan').hide();
			W('#companyInfoForm').show();
		});

		//取消修改企业信息
		W('.cancle-modify-com').on('click', function(e){
			e.preventDefault();
			W('#companyInfoSpan').show();
			W('#companyInfoForm').hide();
		});

		//修改商家信息
		W('#companyInfoForm').on('submit', function(e){
			e.preventDefault();
			var cname = W(this).one('[name="qiye_name"]'),
				caddr = W(this).one('[name="qiye_addr"]');

			if( cname.val().trim()=='' ){
				cname.shine4Error();
				cname.focus();
				return false;
			}

			if(caddr.val().trim()==''){
				caddr.shine4Error();
				caddr.focus();
				return false;
			}

			QW.Ajax.post(this, function(data){
				data = QW.JSON.parse(data);
				if(data.errno == 0){
					W('#companyInfoSpan .company-name-span').html( cname.val().encode4Html() );
					W('#companyInfoSpan .company-addr-span').html( caddr.val().encode4Html() );

					W('#companyInfoSpan').show();
					W('#companyInfoForm').hide();

					window.location.reload();
				}else{
					alert('抱歉，出错了。' + data.errmsg);
				}
			});
		});

		//同意企业服务协议。
		W('#firmServeProtocol').on('click', function(e){
			e.preventDefault();
			var panel = tcb.alert("奇虎360企业IT服务协议",
				'<iframe frameborder="0" style="width:680px;height:420px;" src="/resource/html/firmserviceprotocal.html"></iframe>',
				{'width':680, 'height':510},
				function(){ panel.hide(); }
            );
		});

		//领吗
		W('.torder-detail .get-new-code').on('click', function(e){
			e.preventDefault();
			var tid = W(this).attr('data-tid');
			QW.Ajax.post('/firm/aj_addservice_code/', { 'torder_id': tid}, function(data){
				data = QW.JSON.parse(data);
				if(data.errno){
					alert("抱歉，出错了。" + data.errmsg);
				}else{
					var wh = window.location.href;
					window.location.href = wh + ( wh.indexOf('?')>-1? '&seeorder=1':'?seeorder=1' ) + '#tokenshangmenlist';
				}
			});
		});

		/*===================家庭码================*/
		//发送家庭码给亲友
		W(document).delegate('.send-fm-service-code','click', function(e){
			e.preventDefault();
			var code = W(this).attr('data-code');
			var url = BASE_ROOT + "family?code=" + code;
			var panel = tcb.alert("发送服务码", '<div class="ui-send-fcode"><p>将下面的链接复制发送给您的家人，点击立享服务</p><textarea>'+url+'</textarea></div>', {
				width:360, height:200, btn_name:'关闭'  }, function(){return true;});

			var textarea = W(panel.oBody).one('textarea');
			textarea.on('mouseover', function(){
				setSelectRange( this, 0, this.value.length );
			});
		});

		//使用服务
		W(document).delegate('.remote-fm-service-trigger','click', function(e){
			e.preventDefault();

			var wMe = W(this);

			var eid = wMe.attr('data-eid'),
				mobile = wMe.attr('data-mobile');
			mobile = mobile ? mobile : '';

			var panel = tcb.alert('使用服务', '<div style="padding:10px;font-size:14px;text-align:center;color:#f60"><img src="https://p.ssl.qhimg.com/t01d621a8109b7524b5.gif" width="24"> 服务启动中，请稍后...</div>', {width:300, height:126,btn_name:'知道啦'}, function(){return true;});

			var consultdefwords = '用户为家庭卡VIP用户，手机号'+mobile;
			ExpertChat.checkAndStartFamily(eid, consultdefwords);

			//fater 5s, close the PANEL.
			setTimeout(function(){panel.hide();}, 5000);
		});

		// 调起客户端免费咨询
		W('.qy-mianfeizixun-btn').on('click', function(e){
			e.preventDefault();

			var eid = W(this).attr('data-eid');

			var panel = tcb.alert('使用服务', '<div style="padding:10px;font-size:14px;text-align:center;color:#f60"><img src="https://p.ssl.qhimg.com/t01d621a8109b7524b5.gif" width="24"> 服务启动中，请稍后...</div>', {width:300, height:126,btn_name:'知道啦'}, function(){return true;});
			//fater 5s, close the PANEL.
			setTimeout(function(){panel.hide();}, 5000);

			ExpertChat.checkAndStart(eid);
		});

		//启动购买定制服务
		W('.buy-diy-service').on('click', function(e){
			e.preventDefault();

			var content = W('#buyDiyTpl').html();
			var panel = tcb.panel("购买服务", content, { width:420, height:270 });

			// 提交定制服务
	        W(panel.oBody).one('.wg3-tc-detail-dingzhi-form').on('submit', function(e){
	            e.preventDefault();

	            var wMe = W(this);

	            // 支付代码
	            var wPCode = wMe.one('[name="buyer_paycode"]'),
	                pcode = wPCode.val().trim();
	            if(pcode==wPCode.attr('placeholder') || pcode == ''){
	                wPCode.shine4Error();
	                wPCode.focus();
	                return false;
	            }
	            var request_url = '/firm/aj_gettaocanid_bycode/?zkcode='+pcode;
	            QW.Ajax.post(request_url, function(data){
	                data = QW.JSON.parse(data);
	                // console.log(data);
	                if(data.errno == 0){
	                    var redirect_url = data.result;

	                    if(window.__inclient){
	                        redirect_url += '&inclient=1'
	                    }
	                    window.location.href = redirect_url;

	                }else{
	                    alert("抱歉，订单提交失败。" + data.errmsg);
	                }
	            });

	        });
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

	function initDoIt(){
		try{//首页自动触发
			W('#taocanTypes').query('li').first().fire('click');
			if( W('.comp-size-item.prd-selected').length==0 ){ W('.comp-size-item').first().fire('click'); }

			W('#introTab').query('li').first().fire('click');
			if( W('.fuwubao-item.prd-selected').length==0 ){ W('.fuwubao-item').first().fire('click'); }
		}catch(ex){}

		//是否不需要登录提交，出现登陆框
	    try{
	        if( W('#orderUserLR').length > 0){
	        	var goUrl = W('#orderUserLR').attr('data-next');
	            InnerLogin.show('orderUserLR', 'orderUserLogin', 'orderUserReg', {
	                'loginSucc' : function(){ window.location.href= goUrl; },
	                'regSucc' : function(){ window.location.href= goUrl; }
	            }, true);
	        }
	    }catch(ex){}


	    var torder_id = window.location.search.queryUrl('torder_id')||'';
	    torder_id = torder_id? ('&torder_id='+encodeURIComponent(torder_id)) : '';
	    //企业订单
	    if( W('#tokenRemoteList').length>0 ){
	    	var box = '#tokenRemoteList .tokens',
	    		url = '/firm/taocan_order?isajax=json&type=3&pagesize=#{pagesize}&pn=#{pn}' + torder_id;
	    	getAjaxData( box,  url, 0 , true );
	    }

	    if( W('#tokenShangmenList').length>0 ){
	    	var box = '#tokenShangmenList .tokens',
	    		url = '/firm/taocan_order?isajax=json&type=1&pagesize=#{pagesize}&pn=#{pn}' + torder_id;
	    	getAjaxData( box,  url, 0 , true );
	    }

	    //家庭订单
	    if( W('#fmTokenRemoteList').length>0 ){
	    	var box = '#fmTokenRemoteList .tokens',
	    		url = '/family/order?isajax=json&type=3&pagesize=#{pagesize}&pn=#{pn}' + torder_id;
	    	getAjaxData( box,  url, 0 , true , 'family');
	    }

	}

	return{
		init : init,
		buyRsConfirm : buyRsConfirm
	}
})();


var tcbShangmenService = tcbShangmenService || (function(){

	var yyPanel;

	function show( code ){

		createBox(code);

		initAddrComp();

		bindEvent();

	}

	function bindEvent(){
		W('#shangmenForm').on('submit', function(e){
			e.preventDefault();
			if( !checkForm(W('#shangmenForm')[0])){
				return false;
			}

			W('#fsyAddr_full').val( W('#fsyAddr_cityname').val() + ' ' + W('#fsyAddr_areaname').val() + ' ' +  W('#fsyAddr_detail').val());

			QW.Ajax.post( W('#shangmenForm')[0], function(data){
				data = QW.JSON.parse(data);
				if(data.errno == 0){
					alert('申请上门服务提交成功，客服会尽快联系您处理。');
					hide();
				}else{
					alert('抱歉，出错了。'+ data.errmsg);
				}
			} );

			return false;
		});


	}

	function checkForm(form){
		var ele = form.elements;
		for(var i=0, n=ele.length; i<n; i++){
			var el = ele[i];
			if(el.tagName.toLowerCase()=='input' || el.tagName.toLowerCase()=='textarea'){
				var datatype = el.getAttribute('datatype');
				if(!datatype){
					continue;
				}else{
					var pattern = datatype.replace('reg-','');
					var val = el.value;

					if ('string' == typeof pattern) {

						pattern.replace(/^\/(.*)\/([mig]*)$/g, function(a, b, c) {
							pattern = new RegExp(b, c || '');
						});
					}
					isOk = pattern.test(val);

					if(isOk){
						continue;
					}else{
						W(el).shine4Error().focus();
						return false;
					}
				}
			}
		}

		return true;
	}

	function createBox(code){
		var str = W('#firmShangmenYuyueTpl').html() || '';
		yyPanel = tcb.panel("企业服务-上门维修", str, {
			'width' : 354 ,
			'height' : 420 ,
			"withShadow": true,
			"wrapId" : "firmShangmenPanel",
			"className" : "panel panel-tom01 border8-panel pngfix"
		});

		try{ new PlaceHolder('#fsyCode');		}catch(ex){}
		try{ new PlaceHolder('#fsyTel');	}catch(ex){}
		try{ new PlaceHolder('#fsyAddr_detail'); }catch(ex){}
		try{ new PlaceHolder('#fsyProblem');	 }catch(ex){}

		if( code ){
			W('#fsyCode').val(code).focus();
		}
	}

	//初始化地址选择器
	function initAddrComp(){
		// 激活面板选择
        new bang.AreaSelect({
        	'wrap': '#shmCitySelector',
        	'hasquan' : false,
        	//when initial, set the default addr.
        	'data':{
	        	'areacode': window.location.search.queryUrl('area_id')||'',
	            'areaname': window.location.search.queryUrl('areaname')||''
            },
        	// 城市选择时触发
	        'onCitySelect': function(data){
	        	W('#fsyAddr_citycode').val(data.citycode);
	        	W('#fsyAddr_areaid').val('');

	        	W('#fsyAddr_cityname').val(data.cityname);
	        	W('#fsyAddr_areaname').val('');
	        },
	        // 区县选择时触发
	        'onAreaSelect': function(data){//console.log(data)
	        	W('#fsyAddr_citycode').val(data.citycode);
        		W('#fsyAddr_areaid').val(data.areacode);

        		W('#fsyAddr_cityname').val(data.cityname);
	        	W('#fsyAddr_areaname').val(data.areaname);
	        },
	        // 商圈选择时触发
	        'onQuanSelect': function(data){

	        }
        });
	}

	function hide(){
		yyPanel && yyPanel.hide();
	}

	return {
    	show : show
    }
})();

Dom.ready(function(){
	firmOrder.init();

        // 立即购买套餐
        W('.wg3-tc-detail-sale-form').on('submit', function(e){
            e.preventDefault();

            var wMe = W(this);

            // 手机
            var wTel = wMe.one('[name="buyer_mobile"]');
            if(wTel.val().trim()==wTel.attr('placeholder') || wTel.val().trim() == ''){
                wTel.shine4Error();
                wTel.focus();
                return false;
            }
            // 协议
            var wXieYi = wMe.one('.wg3-tc-detail-xieyi-checkbox:checked');
            if( wXieYi.length ==0 ){
            	var panel_tit  = '提示',
            		panel_cont = '<div style="padding:10px">您同意《奇虎360企业IT服务协议》后才能购买该产品</div>';
                var panel = tcb.alert(panel_tit, panel_cont, { width:320, height:120}, function(){ panel.hide();});
                return false;
            }

            var payMethod = wMe.one('.pay-method:checked').val();

            wMe.one('[name="bank_code"]').val( (payMethod == 'wangyin'? wMe.one('.bank-selector').val() : payMethod) );

            QW.Ajax.post(this, function(data){
                data = QW.JSON.parse(data);
                if(data.errno == 0){
                    var orderId = data.result.order_id;

                    var payUrl = BASE_ROOT + 'firm/subpay/?torder_id=' + orderId;
                    var indexUrl = BASE_ROOT + (window.__inclient? 'firm/client':'firm/taocan');
                    var detailUrl = BASE_ROOT + 'firm/detail/?torder_id=' + orderId;
                    QW.Cookie.set('otel', wTel.val(), {'path':'/', 'domain' : '.bang.360.cn'});

                    if(window.__inclient){
                        //打款支付页面
                        window.open( payUrl );

                        buyRsConfirm({'torder_id' : orderId} , function(){
                            //打开订单完成详情页
                            window.open( detailUrl );
                            //回到首页
                            window.location.replace(indexUrl);
                        } );
                    }else{//网页中，跳转到支付页，否则会被拦截
                        window.location.href = payUrl;
                    }

                }else{
                    alert("抱歉，订单提交失败。" + data.errmsg);
                }
            });

            return false;
        });
        // 定制服务（提交支付码）
        W('.wg3-tc-detail-dingzhi-form').on('submit', function(e){
            e.preventDefault();

            var wMe = W(this);

            // 支付代码
            var wPCode = wMe.one('[name="buyer_paycode"]'),
                pcode = wPCode.val().trim();
            if(pcode==wPCode.attr('placeholder') || pcode == ''){
                wPCode.shine4Error();
                wPCode.focus();
                return false;
            }
            var request_url = '/firm/aj_gettaocanid_bycode/?zkcode='+pcode;
            QW.Ajax.post(request_url, function(data){
                data = QW.JSON.parse(data);
                // console.log(data);return;
                if(data.errno == 0){
                    var redirect_url = data.result;

                    if(window.__inclient){
                        redirect_url += '&inclient=1'
                    }
                    window.location.href = redirect_url;

                }else{
                    alert("抱歉，订单提交失败。" + data.errmsg);
                }
            });

        });

		//新定制服务
		W('.wg3-dingzhi-form2').on('submit', function(e){
			e.preventDefault();

            var wMe = W(this);

            // 支付代码
            var wMobile = wMe.one('[name="buyer_mobile"]'),
            	wCode = wMe.one('[name="secode"]'),
                mobile = wMobile.val().trim(),
                secode = wCode.val().trim();
            if( !/^1\d{10}$/.test(mobile) ){
                wMobile.shine4Error();
                wMobile.focus();
                return false;
            }
            if( !secode || secode == wCode.attr('placeholder') ){
                wCode.shine4Error();
                wCode.focus();
                return false;
            }
            var request_url = '/firm/yuyue_sub/';
            QW.Ajax.post(request_url, this, function(data){
                data = QW.JSON.parse(data);
                // console.log(data);return;
                if(data.errno == 0){
                    W('.wg3-dz-cnt').hide();
                    W('.wg3-dz-succ').show();

                }else{
                    alert("抱歉，订单提交失败。" + data.errmsg);
                }
            });
		});

		//发送验证码
		W('#wg3DZSendCode').on('click', function(e){
			var wMe = W(this);

			if( wMe.hasClass('wg3-tc-btndisabled') ){return;}

			var wMobile = wMe.parentNode('form').one('[name="buyer_mobile"]'),
                mobile = wMobile.val().trim();

            if( !/^1\d{10}$/.test(mobile) ){
                wMobile.shine4Error();
                wMobile.focus();
                return false;
            }

            //QW.Ajax.post( '/aj/sendsecode/', {'mobile': mobile}, function(data){// [接口废弃]此处js已无处使用
            //	data = QW.JSON.parse(data);
            //	if(data.errcode == '1000'){
            //		wMe.addClass('wg3-tc-btndisabled').val('发送成功');
            //		setTimeout(function(){ wMe.removeClass('wg3-tc-btndisabled'); }, 60*1000);
            //	}else{
            //		alert('抱歉，发送失败，请稍后再试');
            //	}
            //
            //});
		});

		//使用服务码
		W('.user-service-code').on('click', function(e){
			e.preventDefault();
			var panel = tcb.confirm('服务代码', '<div style="padding:10px 20px"><h3 style="font-size:14px;line-height:2.2">请输入服务代码：</h3><input type="text" class="prompt-txt" style="width:98%; height:30px;line-height:30px;" /></div>', {
				width: 300,
				height:180
			}, function(){
				pcode = W(panel.oBody).one('.prompt-txt').val();
				panel.hide();
				if(pcode){
					var request_url = '/firm/aj_gettaocanid_bycode/?zkcode='+pcode;
					QW.Ajax.post(request_url, function(data){
			            data = QW.JSON.parse(data);
			            // console.log(data);return;
			            if(data.errno == 0){
			                var redirect_url = data.result;

			                if(window.__inclient){
			                    redirect_url += '&inclient=1'
			                }
			                window.location.href = redirect_url;

			            }else{
			                alert("抱歉，服务代码提交失败。" + data.errmsg);
			            }
			        });
				}
			});
		});


        tcb.bindEvent(document.body, {
            '.wg3-tc-detail-ipt': {
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
            },
            // 选择付费方式
            '.wg3-tc-detail-pay .pay-method': function(e){
                var wMe = W(this);

                if (wMe.val()=='wangyin') {
                    W('.bank-selector-wrap').show();
                } else {
                    W('.bank-selector-wrap').hide();
                }
            },
            //同意企业服务协议。
            '.wg3-tc-detail-xieyi-cont': function(e){
                e.preventDefault();

                var panel = tcb.alert("奇虎360企业IT服务协议",
                    '<iframe frameborder="0" style="width:680px;height:420px;" src="/resource/html/firmserviceprotocal.html"></iframe>',
                    {'width':680, 'height':510},
                    function(){ panel.hide(); }
                );
            },
            // 选择套餐
            '.wg3-tc-detail-service-type .wg3-taocan-service-type': function(e){
            	e.preventDefault();

            	var wMe = W(this);
            	if (wMe.hasClass('selected')) {
            		return;
            	}

                changeServiceType(wMe);

            	wMe.addClass('selected').siblings().removeClass('selected');
            }
        });

    function changeServiceType(wObj){
        var id = wObj.attr('data-id'),
            price = wObj.attr('data-price'),
            c_price = wObj.attr('data-cprice');

        W('.wg3-tc-detail-price').html(price+'元');
        W('.wg3-tc-detail-cprice').html('原价：'+c_price+'元');

        W('[name="taocan_id"]').val(id);
        W('[name="unit_price"]').val(price);
        W('[name="taocan_price"]').val(price);
    }

    /**
     * 购买结果确认弹窗
     * @return {[type]} [description]
     */
    function buyRsConfirm( params, callback ){
        var html = '<dl class="pay-tip clearfix"><dt><span class="tipsico"></span></dt><dd>请您在新打开的网上银行页面进行付款，付款完成前不要关闭该窗口。</dd><dd class="tip-error"></dd></dl>';
        var panel = tcb.panel("360安全支付", html, {
                wrapId: "payLayer",
                width: 400,
                btn: [{
                    txt: "已完成支付",
                    fn: function(){
                        if(params){
                            QW.Ajax.post('/aj/get_firmorder_status/', params, function(data){
                                var errBox = W(panel.oBody).one('.tip-error');
                                data = QW.JSON.parse(data);
                                if(data.errno == 0){ //支付成功
                                    errBox.html('');
                                    callback && typeof(callback)=='function' && callback();
                                }else{ // 支付失败
                                    errBox.html('暂未收到您的款项，请确认付款后再点击。');
                                }
                            });
                        }else{
                            callback && typeof(callback)=='function' && callback();
                        }
                    }
                },{
                    txt: "支付遇到问题",
                    fn: function(){
                        location.reload();
                    }
                }]
            });
        panel.on('afterhide', function(){
            location.reload();
        });
    }
});
