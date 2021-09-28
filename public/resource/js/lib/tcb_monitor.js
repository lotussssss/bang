var tcbMonitor = (function(){
	function modifyMonitor(){
		//改写c参数获取办法，直接从class或者id等规则获得
		var monitor_real_getText = monitor.util.getText;//将原有方法备份，以便恢复
		monitor.util.getText = function(el) {
			var text = '';
			text = __getStatKey(el);

			//如果递归等级小于3级或者class不够2个就继续寻找父级。包含id或者bk值，直接返回。
			while( text.indexOf('#')==-1 && text.indexOf(':bk_')==-1 && ( text.replace(/[^\>]/g,'').length<2 || text.replace(/[^\.]/g,'').length<2 ) && el.parentNode && el.parentNode!=document.documentElement ){
				el = el.parentNode;
				text = __getStatKey(el) + '>' + text;				 
			}

			return text;
		};

		function __getStatKey(el){
			var tg = el.tagName,
				cln = el.className.replace(/(^\s+)|(\s+$)/g, '').replace(/\s+/ig, '.'),
				id = el.id,
				bk = el.getAttribute('bk');

			var tjkey = '';

			if(id){
				tjkey = tg + '#' +id;
			}else if(bk){
				tjkey = tg + ':bk_' +bk;
			}else if(cln){
				tjkey = tg + '.' +cln;
			}else{
				tjkey = tg;
			}

			return tjkey;
		}

		//如果没有设置u参数，则自动添加
		var monitor_real_getLocation = monitor.util.getLocation;
		monitor.util.getLocation = function(el){
			var wlocation = monitor_real_getLocation();

			if( /^\d+\./.test(window.location.host) ){
				wlocation = 'http://'+window.location.host.replace(/\d+\./,'') + '/dianpu' + window.location.pathname;
			}else{
				wlocation = 'http://'+window.location.host + window.location.pathname;
			}

			var isinclient = window.location.href.match(/inclient=(\d+)/i);
			if( isinclient ){
				wlocation += '_inclient_' + isinclient[1] ;
			}

			return wlocation;
		}

	}

	/**
	 * 开启统计
	 * @return {[type]} [description]
	 */
	function startMonitor(){
		if(!window.monitor || window.__donotMonitor){ return false; }

		//修改统计日志服务器
		window.monitor.setConf({
			//UV、PV
			trackUrl: "http://bang.360.cn/ajtj/tjs/",
			//点击
			clickUrl: "http://bang.360.cn/ajtj/tjc/",
			//加载时间
			wpoUrl: "http://bang.360.cn/ajtj/tjp/"
		});

		monitor.setProject('360_tongchengbang').getTrack().getClickAndKeydown();
	    //表示唯一身份
		monitor.log({cid:'',ch:'trans_rate_tag'}, 'click'); 

		modifyMonitor();
	}

	/**
	 * 直接发送统计
	 * @param  {[type]} params [description]
	 * @return {[type]}        [description]
	 */
	function __log(params){
		monitor.log(params, 'click'); //发送点击统计
	}

	/**
	 * 手动发送统计
	 * @param  {[type]} obj [description]
	 * @return {[type]}     [description]
	 */
	function logUnit(obj){
		if(window.QW){
			obj = W(obj);
		}else if( window.Zepto || window.jQuery ){
			obj = $(obj);
		}else{
			try{ console.d('只能在Qwrap、Zepto、jQuery下运行此方法') }catch(ex){}
			return;
		}

		obj.on('mousedown', function(e){
			var target = this;
			var params = {
				cId : monitor.util.getContainerId(target), //获取点击区域ID
				c : monitor.util.getText(target) //获取点击元素文本
			};

			monitor.log(params, 'click'); //发送点击统计
		});
		
				
	}

	/**
	 * 对某个区域所以的点击进行统计
	 * @param  {selector} group  区域的标示
	 * @param  {String} subEle 要统计的子元素类型选择器，如果为空，则统计所有子元素的点击
	 * @return {[type]}        [description]
	 */
	function logGroup(group, subEle){
		if(window.QW){
			group = W(group);
		}else if( window.Zepto || window.jQuery ){
			group = $(group);
		}else{
			try{ console.d('只能在Qwrap、Zepto、jQuery下运行此方法') }catch(ex){}
			return;
		}

		if( subEle && typeof(subEle)=='string' ){
			group.delegate(subEle, 'mousedown', function(e){
				var target = e.target;
				log(target);
			});
		}else{
			group.on('mousedown', function(e){
				var target = e.target;
				log(target);
			});
		}		
	}

	return{
		start : startMonitor,
		__log : __log,
		logGroup : logGroup,
		logUnit : logUnit
	}
})();

try{
	tcbMonitor.start();
}catch(ex){
	setTimeout( function(){ tcbMonitor.start(); }, 500);
}