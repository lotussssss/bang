/*出错提示*/
function errorAnimate( obj ){
    obj = $(obj);
    var obgc = obj.css('background-color');

    obj.css('background-color', '#f00').animate({'background-color' : '#fff'}, 1200, 'cubic-bezier(.28,.2,.51,1.15)', function(){
        obj.css('background-color', obgc)
    });
}

var DateTime = function(el, config){
	var styleCss = '.ui-datetime{position:absolute;z-index:9000;left:0;width:260px;background:#f8f8f8; display:table;box-shadow:0 -2px 3px #bbb;}.ui-datetime .date-box{border-bottom:1px dotted #ccc; width:60%;display:table-cell}.ui-datetime .time-box{width:40%;display:table-cell}.ui-datetime .date-item,.ui-datetime .time-item{display:block;text-align:center;border-bottom:1px solid #ddd;white-space:nowrap;word-break:keep-all;cursor:pointer; margin:0 5%;font-size:14px; height:34px;line-height:34px; color:#666;}.ui-datetime .date-curr{color:#77C817;font-weight:bold;}.ui-datetime .time-curr{color:#77C817;font-weight:bold;}.ui-datetime .time-disabled{background:#eee; color:#ccc;cursor:not-allowed;}.ui-datetime .date-tit,.ui-datetime .time-tit{font-size:16px; line-height:40px; text-align:center;font-weight:bold;}';	

	this.box = null;
	this.el = null;
	this.conf = $.extend({ 
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
	}, config);

	this.init = function(el, config){
		el = $(el);
		this.el = el;

		if(el.attr('type') != 'text'){
			return;
		}

		$('<style type="text/css"></style>').text(styleCss).appendTo('head');

		this.box = this.__create();
		var _this = this;

		el.on('focus', function(){
			_this.show();
		});		

		$(document.body).on('click', function(e){
			if( e.target != _this.el[0] && e.target != _this.box[0] && !$.contains(_this.box[0], e.target) ){
				_this.hide();
			}
		});

		this.box.delegate('.date-item', 'click', function(){			
			$(this).addClass('date-curr').siblings('.date-curr').removeClass('date-curr');
			_this.box.find('.time-item').removeClass('time-curr').removeClass('time-disabled');

			var today = DateTime.getDateList(0, 1)[0],
				now = (new Date().getHours());

			if( $(this).attr('data-value') == today.value ){//如果选的是今天，就要禁止掉已经过期的时间点
				_this.box.find('.time-item').each(function(){
					var w_this = $(this);
					if( w_this.attr('data-value').split(':')[0]-0 <= now ){
						w_this.addClass('time-disabled');
					}
				});
			}
		});

		this.box.delegate('.time-item', 'click', function(){
			if( $(this).hasClass('time-disabled') ){
				return false;
			}

			$(this).addClass('time-curr').siblings('.time-curr').removeClass('time-curr');
			if( _this.box.find('.date-curr').length>0 ){
				_this.select();
			}
		});
	}

	this.__create = function(){
		var dstr = '';
		var dlist = this.conf.dateList;
		for(var i=0, n=dlist.length; i<n; i++){			
			dstr += '<span class="date-item '+(n===1? 'date-curr' : '')+'" data-value="'+dlist[i].value+'">'+dlist[i].text+'</span>';
		}

		var tstr = '';
		var tlist = this.conf.timeList;
		for(var i=0, n=tlist.length; i<n; i++){
			tstr += '<span class="time-item" data-value="'+tlist[i].value+'">'+tlist[i].text+'</span>';
		}

		return $('<div class="ui-datetime"><div class="date-box"><div class="date-tit">日期</div>'+dstr+'</div><div class="time-box"><div class="time-tit">时间</div>'+tstr+'</div></div>').appendTo($('body')).hide();
	}

	this.select = function(){
		var val = this.box.find('.date-curr').attr('data-value') +' '+ this.box.find('.time-curr').attr('data-value');
		this.el.val( val );
		this.hide();
		if(typeof(this.conf.onSelect)=='function') this.conf.onSelect(val);
	}

	this.show = function(){
		var elRect= this.el.offset();
		var box = this.box;
		box.css({
			'position' : 'fixed',
			'left' : '0',
			'top' : '100%',
			'z-index' : 99999,
			'width' : '100%'
		}).show();

		box.animate({ 'translateY' : '1px' }, 10, function(){
			box.hide();
			setTimeout(function(){
				box.show().animate({'translateY' : 0-box.height()+'px'}, 200, 'linear');
			},30);			
		});

	}

	this.hide = function(){
		this.box.animate({'translateY' : 0}, 200, 'linear', function(){
			$(this).hide();
		});
	}

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
}

var Dialog = (function(txt){
	function showMask(){
		return $('<div class="ui-dialog"></div>').appendTo('body').css({
			'position' : 'fixed',
			'top' : 0,
			'right' : 0,
			'bottom' : 0,
			'left' : 0,
			'z-index' : 10000,
			'background' : 'rgba(0,0,0, 0.7)',
			'font-size' : '14px'
		});
	}

	function show(txt){
		var box = showMask();
		var cntBox = $('<div class="dialog-content"><span class="close">x</span><div class="dialog-txt">'+txt+'</div></div>').appendTo(box).css({
			'position' : 'absolute',
			'left' : '10%',
			'right' : '10%',
			'top' : '20%',
			'min-height' : '160px',
			'max-height' : '600px',
			'background' : 'url(https://p.ssl.qhimg.com/t0112d6649a275a40cf.jpg) repeat 0 0',
			'border-radius' : '10px',
			'padding' : '20px',
			'color' : '#666',
			'line-height' : '1.8'
		});

		cntBox.find('.close').css({
			'position' : 'absolute',
			'top' : '-10px',
			'right' : '-10px',
			'width' : '20px',
			'height' : '20px',
			'line-height' : '20px',
			'border-radius' : '50%',
			'border' : '1px solid #ccc',
			'background' : 'url(https://p.ssl.qhimg.com/t0112d6649a275a40cf.jpg) repeat 0 0',
			'font-size' : '16px',
			'text-align' : 'center',
			'font-family' : 'arial',
			'color' : '#999'
		}).on('click', hide);

		return box;
	}

	function showBox(cnt){
		var box = showMask();
		return box.html(cnt);
	}

	function hide(){
		$('.ui-dialog').remove();
	}

	return{
		'show' : show,
		'showBox' : showBox,
		'hide' : hide
	}
})();
