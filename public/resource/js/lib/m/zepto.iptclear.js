(function($){
	$.fn.iptClear = function(plucss){		
		var me = $(this);

		if( this[0].tagName.toLowerCase() != 'input' ){
			return;
		}

		var ic = $('<span class="ui-ipt-clear"></span>').css({
			'display': 'none',
			'position' : 'absolute',			
			'top' : (me.height() - 20)/2,
			'right' : -2 ,
			'width': 20,
			'height': 20,
			'background': 'url(https://p.ssl.qhimg.com/t011e6c32277aa5fcfd.png) no-repeat center',
			'background-size' : '12px'
		}).on('click', function(){
			me.val('');
			ic.hide();
		});

		try{ ic.css(plucss); }catch(ex){}

		me.after( ic ).on('focus input keyup', function(){
			if(me.val().length > 0){
				ic.show();
			}
		}).on('blur', function(){
			if(me.val().length == 0){
				ic.hide();
			}
		});

		return me;
	}
})(Zepto);