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


