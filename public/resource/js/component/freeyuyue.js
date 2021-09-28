var FreeYuyue = FreeYuyue || (function(){
	var orderUrl = BASE_ROOT + "my_center/yuyueorder" + ( typeof(_inclient)!='undefined' && _inclient ? '?inclient=1' : '' );
	var fyPanel;

	function show(shopid, productid){
		var str =  W('#freeYuyueTpl').html() || '';
		fyPanel = tcb.panel("申请免费体验", str, {
			'width' : 470 ,
			'height' : 300 ,
			"withShadow": true,			
			"wrapId" : "freeServicePanel",
			"className" : "panel panel-tom01 border8-panel pngfix"	
		});

		try{ new PlaceHolder('#firmName');	}catch(ex){}
		try{ new PlaceHolder('#csrTel');	}catch(ex){}	

		initAddrComp();		

		bindEvent();	
	}


	function bindEvent(){

		W('#freeServicePanel .free-srv-yy-form').on('submit', function(e){
			e.preventDefault();
			checkFormAndSubmit( W(this) );
		});
	}

	//初始化地址选择器
	function initAddrComp(){
		// 激活面板选择
        new bang.AreaSelect({
        	'wrap': '#yyCitySelector',
        	'hasquan' : false,
        	//when initial, set the default addr.
        	'data':{
	        	'areacode': window.location.search.queryUrl('area_id')||'',
	            'areaname': window.location.search.queryUrl('areaname')||''
            },
        	// 城市选择时触发
	        'onCitySelect': function(data){
	        	 W('#freeServicePanel .free-srv-yy-form .user-city').val(data.cityname);
	        	 W('#freeServicePanel .free-srv-yy-form .user-quxian').val('');
	        	 W('#freeServicePanel .free-srv-yy-form .city-code').val(data.citycode);
	        },
	        // 区县选择时触发
	        'onAreaSelect': function(data){
	        	W('#freeServicePanel .free-srv-yy-form .user-city').val(data.cityname);
        		W('#freeServicePanel .free-srv-yy-form .user-quxian').val(data.areaname);
        		W('#freeServicePanel .free-srv-yy-form .city-code').val(data.citycode);
	        },
	        // 商圈选择时触发
	        'onQuanSelect': function(data){

	        }
        }); 
	}

	/**
	 * 验证表单并提交
	 * @param  {w} F form
	 * @return {[type]}   [description]
	 */
	function checkFormAndSubmit(F){
		var fls = F.query('textarea, input[type="text"]');
		for(var i=0, n=fls.length; i<n; i++){
			var item = fls.item(i);
			if( item.val().trim()=='' ){
				item.focus();
				item.shine4Error();
				return false;
			}
		}

		var tel = F.one('#csrTel');
		if( ! /^1\d{10}$/.test( tel.val().trim() ) ){
			tel.focus();
			tel.shine4Error();
			return false;
		}

		QW.Ajax.post(F.attr('action'), F[0], function(res){
			var data = JSON.parse(res);
			if(data.errno){
				alert('抱歉，出错了。'+data.errmsg);
			}else{//提交成功
				try{ fyPanel.hide(); }catch(ex){}
				tcb.alert("提交成功","<div style='padding:10px 30px;font-size:14px;font-family:微软雅黑;'><h2 style='font-size:22px; color:#367c3c;line-height:50px'><img src='https://p.ssl.qhimg.com/t019032b989ba615f57.png'>&nbsp;&nbsp;提交成功！</h2><div style='padding-left:60px'>稍后会有专人与您电话联系或短信通知，请您耐心等候</div></div>", { width:470, height:190} , function(){
					return true;
				});
			}
		});
	}


	return { 
		show : show
	}
})();
