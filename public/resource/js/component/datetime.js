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