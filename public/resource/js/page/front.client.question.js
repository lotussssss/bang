(function(){
	var __areaSel;
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
	        var cidtyid = e.cityid.trim();
	        
	        QW.Cookie.set('CITY_NAME',cidtyid+'|'+city+'|'+city_name,{'expires':30*24*3600*1000, 'domain':'.bang.360.cn', 'path':'/' });

	        //W(selector).one('.now-city').html( city_name );

	        location.href ="http://" +location.host +location.pathname + "?city=" + city;
	    });
	}

	function bindEvent(){
		/***这个不需要传递****W('.question-list .q-item').bind('click', function(e){
			e.preventDefault();
			var citycode = W('#citySelector .sel-city').attr('code');
			var link = W(this).attr('href') + '&city=' + citycode;
			window.location = link;
		});*/
		
		tcb.bindEvent(document.body, {		
			
		});

		//问题未输入进行是搜索时提示：
		W('#tcbTopSearch').bind('submit',function(e){
			e.preventDefault();
			var sword = W(this).one('[name="keyword"]'); 
			if( sword.val() =='' || sword.attr('data-default') == sword.val()){
				sword.focus().shine4Error();
				return false;
			}else{
				W(this)[0].submit();
			}
		});

		W('#addrSearchForm').bind('submit', function(e){
			e.preventDefault();
			var _this = this;
			var ipt = W(this).one('[name="addr"]');
			var txt = ipt.val();
			if( txt =='' || txt == ipt.attr('data-default') ){
				/*ipt.focus();
				if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(ipt);*/
				ipt.val('');
				W(this).attr('action', '/client/findshop'); //没有输入地址时跳转到区县筛选	
				setTimeout( function(){ W(_this)[0].submit(); },100);
			}else{
				W(this).attr('action', '/client/distance');
				setTimeout( function(){ W(_this)[0].submit(); },100);
			}
		});
	}

	function initAddrSearch(obj){
		new AddrSuggest(obj, {			
			'showNum' : 6,
			'onSelect' : doAddrSearch,
			'requireCity' : function(){ return W('#citySelector .sel-city .sel-txt').html() ||'' }
		});
	}

	function doAddrSearch(txt){
		W('#addrSearchForm').fire('submit');
	}

	//切换搜索框
	function initSwitchSearch(){
	    var switcher = W('#formSwitchTab');
	    switcher.delegate('.form-item', 'click', function(){
	    	if( W(this).hasClass('curr') ){
	    		return;
	    	}

	    	W(this).addClass('curr').siblings('.curr').removeClass('curr');

	        var form = W(this).attr('data-form');
	        
	        switcher.attr('data-curform', form);
	        W('#'+form).show().siblings('form').hide();
	        
	    });

	    var initSerchForm = switcher.attr('data-curform');
	    if( initSerchForm ){
	        try{ switcher.one('[data-form="'+initSerchForm+'"]').fire('click'); }catch(ex){}
	    }


	}

	//鲁大师访问时，设置cooke。
	function setLudashiCookie(){
		var cookieDomain = "." + window.location.hostname;
		var wls = window.location.href;
		if( wls.indexOf('?ludashi')>-1 ){
			var cookieVal = wls.queryUrl('ludashi') || 'v1';
			QW.Cookie.set('C_RUNIN_LDS', cookieVal, {'domain': cookieDomain, 'path':'/' });
		}
	}

	
	function init(){
		bindEvent();
		// 激活面板选择
        __areaSel = new bang.AreaSelect({
        	//don't show Shangquan
        	'hasquan' : false,
        	// 城市选择时触发
	        'onCitySelect': function(data){
	        	W('#addrSearchForm [name="cityname"]').val( data.cityname );
	        	W('#addrSearchForm [name="city"]').val( data.citycode );	        	
	        	W('#addrSearchForm [name="areaname"]').val( '' );
	        	W('#addrSearchForm [name="area_id"]').val( '' );
	        	
	        	new Image().src = "/aj/qiehuan_city/?citycode=" + data.citycode;  //Do this make the browser city cookie change.
	        },
	        // 区县选择时触发
	        'onAreaSelect': function(data){
	        	W('#addrSearchForm [name="cityname"]').val( data.cityname||'' );
	        	W('#addrSearchForm [name="areaname"]').val( data.areaname||'' );
	        	W('#addrSearchForm [name="area_id"]').val( data.areacode||'' );
	        },
	        // 商圈选择时触发
	        'onQuanSelect': function(data){
	        	
	        }
        });

		initAddrSearch('#addrSearchForm .addr-ipt');
		initSwitchSearch();

        if(typeof bang.Slider==='function'){
        	bang.Slider({
        		't1': 4000,
        		't2': 4000,
        		'wrap': '.client-slide-wrap'
        	});
        }

        setLudashiCookie();        
	}

	init();
})();