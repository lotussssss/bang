(function($){
	$.loading = function(content){
		var loading = $('.loading-box');

		if(loading.length == 0){
			loading = $('<div class="loading-box"></div>').css({
				'position' : 'fixed',
				'top' : 0,
				'right' : 0,
				'bottom' : 0,
				'left' : 0,
				'z-index' : 999999,
				'background-color'  : 'rgba(0,0,0, 0.2)',
				'padding' : '40% 10%'
			}).append( $('<div class="loading-content"> '+(content ||'加载中...')+'</div>').css({
				'font-size' : 18,
				'text-align' : 'center',
				'border-radius' : '10px',
				'background-color' : 'rgba(0,0,0, 0.7)',
				'color' : '#fff',
				'padding' : '50px 0'
			}) ).appendTo('body');

			$('<div class="loading-anim"></div>').prependTo(loading.find('.loading-content')).css({
				'width' : 32,
				'height' : 32,
				'display' :'inline-block',
				'vertical-align' : 'middle',
				'background' : 'url(https://p.ssl.qhimg.com/t015f3d5ddf0e5a1b71.png) no-repeat center',
				'background-size' : '32px'
			});			
		}

		loading.find('.loading-anim').css({			
			'-webkit-transform' : 'rotate(0)',
			'transform' : 'rotate(0)'
		});

		setTimeout(function(){ loading.find('.loading-anim').animate( { 'rotate' : '360000deg' }, 1000*1400 ) }, 100);

		return loading;
	}
})(Zepto);