(function($){
    var DateTime = function(el, config){
        var styleCss = '.ui-datetime { position: absolute; left: 0; z-index: 9000; margin: 0 auto; max-width: 1080px; min-width: 320px; background: #f8f8f8; box-shadow: 0 -.02rem .25rem #ccc; } .ui-datetime .dt-table { display: table; width: 100%; } .ui-datetime .date-box { width: 60%; display: table-cell } .ui-datetime .time-box { width: 40%; display: table-cell } .ui-datetime .date-item, .ui-datetime .time-item { display: block; text-align: center; white-space: nowrap; word-break: keep-all; cursor: pointer; margin: 0 5%; font-size: .12rem; height: .40rem; line-height: .40rem; color: #666; } .ui-datetime .date-curr, .ui-datetime .time-curr { color: #0b7; font-size: .14rem; } .ui-datetime .date-disabled { display: none; } .ui-datetime .time-disabled { display: none; background: #eee; color: #ccc; cursor: not-allowed; } .ui-datetime .date-tit, .ui-datetime .time-tit { font-size: .12rem; line-height: .36rem; text-align: center; background: #fff; border-bottom: 2px solid rgba(149, 192, 172, 0.3); color: #333; } .ui-datetime .icon-date { margin-right: .02rem; display: inline-block; vertical-align: middle; width: .24rem; height: .24rem; background: url(https://p.ssl.qhimg.com/t01fa50437b3f1ab3aa.jpg) no-repeat 0 -.03rem; background-size: .24rem; } .ui-datetime .icon-time { margin-right: .02rem; display: inline-block; vertical-align: middle; width: .24rem; height: .24rem; background: url(https://p.ssl.qhimg.com/t01fa50437b3f1ab3aa.jpg) no-repeat 0 -.32rem; background-size: .24rem; } .ui-datetime .item-select { height: 1.20rem; overflow: hidden; position: relative; } .ui-datetime .item-window { position: absolute; left: 0; top: 0; right: 0; bottom: 0; background: url("https://p.ssl.qhimg.com/t013ee84c60181f2d26.png") repeat-x 0 center; background-size: auto 100%; z-index: 10; } .ui-datetime .item-list { margin: .40rem 0; } .ui-datetime .i-w-line { display: block; height: 33%; margin: 0 .10rem; border-bottom: 1px solid rgba(208, 208, 208, 0.3); } .ui-datetime .ctrl-box { border-top: 1px solid rgba(208, 208, 208, 0.3); background: #fff } .ui-datetime .ctrl-item { display: inline-block; width: 50%; line-height: .4rem; font-size: .12rem; text-align: center; color: #778c82; } .ui-datetime .ctrl-item:active { background-color: #f8f8f8; } .ui-datetime .ctrl-item:first-child { box-shadow: -1px 0 0 rgba(208, 208, 208, 0.3) inset; }';

        this.box = null;
        this.el = null;
        this.conf = $.extend({
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
            onSelect : function(){ },
            noStyle : false
        }, config);

        this.init = function(el, config){
            el = $(el);
            this.el = el;

            if(el.attr('type') != 'text'){
                return;
            }

            if (!this.conf.noStyle){
                $('<style type="text/css"></style>').text(styleCss).appendTo('head');
            }

            var _this = this;
            _this.__create(function(wBox){

                el.on('focus', function(){
                    this.blur();

                    _this.show();
                });

                //$(document.body).on('click', function(e){
                //    if( e.target != _this.el[0] && e.target != _this.box[0] && !$.contains(_this.box[0], e.target) ){
                //        _this.hide();
                //    }
                //});

                wBox.delegate('.date-item', 'click', function(){
                    var $me = $(this);

                    $(this).addClass('date-curr').siblings('.date-curr').removeClass('date-curr');
                    wBox.find('.time-item').removeClass('time-disabled');

                    var today = DateTime.getDateList(0, 1)[0],
                        now = (new Date().getHours()),
                        $timelist = wBox.find('.time-item-list');

                    if (_this.conf.remote && _this.conf.remoteTime) {
                        var $cur = $timelist.find('.time-curr'),
                            cur_time = '';
                        if ($cur && $cur.length) {
                            cur_time = $cur.attr('data-value');
                        }
                        // 远程获取的数据
                        var timelist = _this.conf.remoteTime[$me.attr('data-value')];

                        $timelist.html( __genTimeHtml(timelist) );

                        $timelist.find('.time-item').each(function(){
                            var w_this = $(this);
                            if( w_this.attr('data-value') == cur_time ){
                                $timelist.find('.time-item').removeClass('time-curr');
                                w_this.addClass('time-curr');

                                var pnode = w_this.parents('.item-select'),
                                    unitH = pnode.height()/3;
                                var scrollY = $timelist.find('.time-item').filter(function(){return !$(this).hasClass('time-disabled');}).indexOf(w_this[0])*unitH;
                                $timelist.css('-webkit-transform', 'translateY(-'+scrollY+'px)');
                            }
                        });
                    }

                    if( $(this).attr('data-value') == today.value ){//如果选的是今天，就要禁止掉已经过期的时间点
                        wBox.find('.time-item').removeClass('time-curr');
                        wBox.find('.time-item').each(function(){
                            var w_this = $(this);
                            if( w_this.attr('data-value').split(':')[0]-0 <= now ){
                                w_this.addClass('time-disabled');
                            }
                        });

                        $timelist.animate({'translateY': 0 + 'px'}, 300, 'ease-out').data('scrollY',0);
                        wBox.find('.time-item').filter(function(){ if(!$(this).hasClass('time-disabled')) return $(this);  }).eq(0).trigger('click');
                    }

                    if( parseInt( _getTransY($timelist) ) == 0 ){
                        wBox.find('.time-item').filter(function(){ if(!$(this).hasClass('time-disabled')) return $(this);  }).eq(0).trigger('click');
                    }
                });

                wBox.delegate('.time-item', 'click', function(){
                    if( $(this).hasClass('time-disabled') ){
                        return false;
                    }

                    $(this).addClass('time-curr').siblings('.time-curr').removeClass('time-curr');
                    /*if( _this.box.find('.date-curr').length>0 ){
                     _this.select();
                     }*/
                });

                //touch start
                wBox.find('.item-window').on('touchstart', function(e) {
                    e.preventDefault();

                    var startY = e.touches[0].clientY;

                    var list = $(this).parents('.item-select').find('.item-list');

                    list.data('scrollY', parseInt( _getTransY(list)))
                        .data('startY', startY)
                        .data('isMove', 'yes')
                        .data('startTime', new Date().getTime());
                });

                //touch move
                wBox.find('.item-window').on('touchmove', function(e) {
                    e.preventDefault();

                    var list = $(this).parents('.item-select').find('.item-list');

                    if( list.data('isMove') != 'yes'){
                        return false;
                    }

                    var startY = list.data('startY'),
                        endY = e.touches[0].clientY,
                        detY = endY - startY;

                    _moveList(this, detY);

                }, {passive : false});

                //touch end
                wBox.find('.item-window').on('touchend', function(e) {
                    e.preventDefault();

                    var list = $(this).parents('.item-select').find('.item-list');

                    if( list.data('isMove') != 'yes'){
                        return false;
                    }

                    _moveEnd(this, (_getTransY(list)-list.data('scrollY') ), (new Date().getTime() - list.data('startTime') ));

                    list.data('scrollY', 0).data('startY', 0).data('isMove', '').data('startTime', 0);

                });

                //取消关闭
                wBox.delegate('.ctrl-cancle', 'click', function(){
                    _this.hide();
                });
                //确认选择
                wBox.delegate('.ctrl-ok', 'click', function(){
                    _this.select();
                });

                //默认选择第一项
                wBox.find('.date-item').filter(function(){ if(!$(this).hasClass('date-disabled')) return $(this);  }).eq(0).trigger('click');
                wBox.find('.time-item').filter(function(){ if(!$(this).hasClass('time-disabled')) return $(this);  }).eq(0).trigger('click');
            });

            function _moveList(obj, detY){
                var pnode = $(obj).parents('.item-select'),
                    unitH = pnode.height()/3,
                    list = pnode.find('.item-list'),
                    scrollY = parseInt(list.data('scrollY')||0),
                    children = list.find('.i-item').filter(function(){
                        if (pnode.hasClass('date-select')) {
                            // 日期
                            return !$(this).hasClass('date-disabled');
                        }
                        else if(pnode.hasClass('time-select')) {
                            // 时间
                            return !$(this).hasClass('time-disabled');
                        }
                    }),
                    maxTY = (children.length - 1) * unitH,
                    scrollY = (scrollY+detY);


                if(scrollY > 0 || scrollY< (0-maxTY)){
                    return;
                }

                //list.animate({'translateY': scrollY + 'px'}, 0);
                list.css('-webkit-transform', 'translateY('+scrollY+'px)');
                children.eq( Math.round(Math.abs(scrollY/unitH)) ).trigger('click');
            }

            function _moveEnd(obj, detY, detT){
                var pnode = $(obj).parents('.item-select'),
                    unitH = pnode.height()/3,
                    list = pnode.find('.item-list'),
                    children = list.find('.i-item').filter(function(){
                        if (pnode.hasClass('date-select')) {
                            // 日期
                            return !$(this).hasClass('date-disabled');
                        }
                        else if(pnode.hasClass('time-select')) {
                            // 时间
                            return !$(this).hasClass('time-disabled');
                        }
                    }),
                    maxTY = (children.length - 1) * unitH,
                    endTop = parseInt( _getTransY(list) );

                var lastTop =  (  Math.round(endTop / unitH) )*unitH;

                var ZN_NUM = 0.25;
                if( Math.abs(detY / detT)>ZN_NUM ){//惯性
                    var pastNum = ((detY / detT) / ZN_NUM);

                    var morePastY = Math.floor( pastNum * unitH );

                    lastTop += morePastY;

                    lastTop = Math.min(Math.max( 0-maxTY, lastTop), 0);

                    lastTop = (  Math.round(lastTop / unitH) )*unitH;

                    list.animate({'translateY': lastTop + 'px'}, 300-0+Math.ceil(Math.abs(pastNum))*100, 'ease-out');
                }else{
                    list.animate({'translateY': lastTop + 'px'}, 160, 'linear');
                }


                children.eq( Math.floor(Math.abs(lastTop/unitH)) ).trigger('click');
            }

            function _getTransY(obj){
                var trans = $(obj).css('transform') || $(obj).css('-webkit-transform') || $(obj)[0].style.webkitTransform;
                var transY = 0;
                if( trans.indexOf('translateY')>-1){
                    transY = trans.replace(/translateY\((\-?[\d\.]+)px\)/, function(m, n){ return n||0});
                }
                if(trans.indexOf('matrix')>-1){
                    transY = trans.replace(/matrix\(\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*(\-?[\d\.]+)\)/, function(m, n){ return n||0});
                }

                return transY;
            }
        };

        this.__create = function(callback){
            var me = this;
            var remote = me.conf.remote;
            if (remote) {

                me.getRemoteDateTime(function(remoteDateTime){
                    remoteDateTime = remoteDateTime || [];
                    var dateTimeHtml = __genDateTimeHtml(remoteDateTime, me.conf.remoteTime);
                    var date_str = dateTimeHtml[0],
                        time_str = dateTimeHtml[1];

                    var date_time_str = [];
                    date_time_str.push('<div class="ui-datetime"><div class="dt-table"><div class="date-box"><div class="date-tit"><span class="icon-date"> </span>日期</div>');
                    date_time_str.push('<div class="item-select date-select"><div class="item-window" data-for="date-select"><span class="i-w-line"></span><span class="i-w-line"></span></div><div class="item-list date-item-list">');
                    date_time_str.push(date_str);
                    date_time_str.push('</div></div>');
                    date_time_str.push('</div><div class="time-box"><div class="time-tit"><span class="icon-time"> </span>时间</div>');
                    date_time_str.push('<div class="item-select time-select"><div class="item-window" data-for="time-select"><span class="i-w-line"></span><span class="i-w-line"></span></div><div class="item-list time-item-list">');
                    date_time_str.push(time_str);
                    date_time_str.push('</div></div>');
                    date_time_str.push('</div></div><div class="ctrl-box"><span class="ctrl-item ctrl-cancle">取消</span><span class="ctrl-item ctrl-ok">确定</span></div></div>');
                    date_time_str = date_time_str.join('');
                    var wBox = $(date_time_str).appendTo($('body')).hide();
                    me.box = wBox;
                    if (typeof callback === 'function') {
                        callback(wBox)
                    }
                });
            } else {
                var dlist = this.conf.dateList;
                var tlist = this.conf.timeList;
                if( new Date().getTime() > Date.parse( dlist[0].value +' '+ tlist[tlist.length-1].value) ){
                    dlist.shift();
                }

                var dstr = '<div class="item-select date-select"><div class="item-window" data-for="date-select"><span class="i-w-line"></span><span class="i-w-line"></span></div><div class="item-list date-item-list">';
                for(var i=0, n=dlist.length; i<n; i++){
                    dstr += '<span class="i-item date-item '+(i==0? 'date-curr' : '')+'" data-value="'+dlist[i].value+'">'+dlist[i].text+'</span>';
                }
                dstr += '</div></div>';

                var tstr = '<div class="item-select time-select"><div class="item-window" data-for="time-select"><span class="i-w-line"></span><span class="i-w-line"></span></div><div class="item-list time-item-list">';
                for(var i=0, n=tlist.length; i<n; i++){
                    tstr += '<span class="i-item time-item '+(i==0? 'time-curr' : '')+'" data-value="'+tlist[i].value+'">'+tlist[i].text+'</span>';
                }
                tstr += '</div></div>';

                var wBox = $('<div class="ui-datetime"><div class="dt-table"><div class="date-box"><div class="date-tit"><span class="icon-date"> </span>日期</div>'+dstr+'</div><div class="time-box"><div class="time-tit"><span class="icon-time"> </span>时间</div>'+tstr+'</div></div><div class="ctrl-box"><span class="ctrl-item ctrl-cancle">取消</span><span class="ctrl-item ctrl-ok">确定</span></div></div>').appendTo($('body')).hide();
                me.box = wBox;
                if (typeof callback === 'function') {
                    callback(wBox)
                }
            }
        };

        // 生成date和time的html
        function __genDateTimeHtml(remoteDateTime, remoteTime) {
            remoteDateTime = remoteDateTime || []

            var date_str = '',
                time_str = '',
                date_curr = ''

            $.each(remoteDateTime, function(i, item){
                // 日期
                var
                    date = item[ 'date' ],
                    ext_class = ''

                if (date[ 'is_able' ]) {
                    if (!date_curr) {
                        ext_class += ' date-curr'
                        date_curr = date['value']
                    }
                } else {
                    ext_class += ' date-disabled'
                }
                date_str += '<span class="i-item date-item' + ext_class + '" data-value="' + date[ 'value' ] + '">' + date[ 'text' ] + '</span>'
                remoteTime[ date[ 'value' ] ] = item[ 'time' ]

                if (date_curr) {
                    // 时间
                    time_str = __genTimeHtml (remoteTime[ date_curr ])
                }
            })

            return [date_str, time_str];
        }
        // 生成time的html
        function __genTimeHtml(timelist) {
            timelist = timelist || [];
            var time_html = '';
            if (timelist.length){
                $.each(timelist, function(i, item){
                    time_html += '<span class="i-item time-item'+(i==0? ' time-curr' : '')+(item['is_able'] ? '' : ' time-disabled')+'" data-value="'+item['value']+'">'+item['text']+'</span>';
                });
            }

            return time_html;
        }
        // 重置远程请求url
        this.resetRemote = function(remote, reset_succ_callback){
            remote = remote || '';

            this.conf.remote = remote;

            this.resetBoxHtml(reset_succ_callback);
        };
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
                    wBox.find('.date-item-list').html(date_str);
                    wBox.find('.time-item-list').html(time_str);

                    typeof reset_succ_callback==='function' && reset_succ_callback(wBox, remoteDateTime);
                }

            });
        };
        // 获取远程日期、时间数据
        this.getRemoteDateTime = function(callback) {
            var me = this;
            var remote = me.conf.remote;

            $.get(remote, function(res){
                res = $.parseJSON(res);

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
            var val = this.box.find('.date-curr').attr('data-value') +' '+ this.box.find('.time-curr').attr('data-value');
            this.el.val( val );
            this.hide();
            if(typeof(this.conf.onSelect)=='function') this.conf.onSelect(val);
        };

        this.show = function(){
            //var elRect= this.el.offset();
            var box = this.box;

            // 判断是否有可选日期
            var $d_item = box.find('.date-item').filter(function(){return !$(this).hasClass('date-disabled')});
            if (!$d_item.length) {
                $.dialog.toast('抱歉，暂时没有可用日期');
                return ;
            }

            // 显示遮罩层
            showMask ()

            box.css({
                'position' : 'fixed',
                'left' : '0',
                'top' : '100%',
                'z-index' : tcb.zIndex (),
                'width' : '100%'
            }).show();

            //如果为android4.0以下系统，由于不支持部分CSS动画，需要特别处理
            if( $.os.android && !compareVersion($.os.version, "4.0") ){
                box.css({
                    'top' : 'auto',
                    'bottom' : 0
                });
                $.dialog.toast("抱歉，您的手机暂时无法进行时间选择", 1600);
            }else{
                box.animate({ 'translateY' : '1px' }, 10, function(){
                    box.hide();
                    setTimeout(function(){
                        box.show().animate({'translateY' : 0-box.height()+'px'}, 200, 'linear');
                    },30);
                });
            }

        };

        this.hide = function(){
            this.box.animate({'translateY' : 0}, 200, 'linear', function(){

                $(this).hide()

                hideMask ()
            });
        };

        this.init(el, config);

        function compareVersion(src, dest){
            return _version2Num(src) >= _version2Num(dest);

            function _version2Num(v){
                var arr = v.split(/\./);
                if( arr.length>2){
                    arr.length = 2;
                }else if(arr.length == 1){
                    arr[1]="0";
                }
                var vn = arr.join(".");
                vn -= 0;
                return vn;
            }
        }

        function showMask () {
            var
                $mask = $ ('#BottomSelectWrapMask')

            if (!($mask && $mask.length)) {

                var
                    mask_css = 'position:fixed;top:0;left:0;right:0;bottom:0;display: block;width: 100%;height: 100%;background:rgba(0, 0, 0, 0.2);',
                    mask_html = '<a id="BottomSelectWrapMask" href="#" style="' + mask_css + '"></a>'

                $mask = $ (mask_html).appendTo (document.body);

                $mask.on ('click', function (e) {
                    e.preventDefault ()

                })
            }

            $mask.css ({
                'z-index' : tcb.zIndex (),
                'display' : 'block'
            })
        }

        function hideMask () {
            var
                $mask = $ ('#BottomSelectWrapMask')

            if ($mask && $mask.length) {

                $mask.hide ()
            }
        }
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

    $.datetime = DateTime;
})(Zepto);
