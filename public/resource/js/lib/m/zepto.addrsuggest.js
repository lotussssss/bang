(function($){
    function AddrSuggest( obj, conf){
        if($( obj ).length==0){ return null; }
        conf = conf || {};

        this.obj = $( obj );
        this.data = null;
        this.suglist = null;
        this.defsug = null;
        this.showNum = conf.showNum || 10; //sug列表项数量
        this.onSelect = conf.onSelect || null; //选中某项时的回调
        this.requireCity = conf.requireCity || function() { return '';}  //当前城市获取回调
        this.noDefSug = conf.noDefSug || false;  //是否不显示默认提示？
        this.zIndex = conf.zIndex||999;

        this._cacheData = {};

        var mapObj;
        var _this = this;

        this.init = function(){
            var _this = this;
            if( !(AMap && AMap.Map) ){
                setTimeout(function(){ _this.init() }, 300);
                return false;
            }

            var _tmpdiv = "aMapContainer" + Math.ceil(Math.random()*10000);
            $('<div id="'+_tmpdiv+'"></div>').appendTo( 'body' ).hide();

            mapObj = new AMap.Map( _tmpdiv );

            this.createDropList();
            this.createDefSug();

            this.showDefaultTxt();

            this.bindEvent();
        }

        this.bindEvent = function(){
            var _obj = this.obj;        
            var deftxt = _obj.attr('data-default')||'';

            _obj.on('focus', function(){
                _this.resetSugListPos(_this.suglist);       
                _this.resetSugListPos(_this.defsug);

                if( deftxt == _obj.val() ){
                    _obj.val('');
                    if(!_this.noDefSug){
                        _this.defsug.show();
                    }
                }else if(_obj.val().length>0){
                    _this.fetchSug( _obj.val() );
                    _this.defsug.hide();
                }
                _obj.removeClass('default');
            });

            _obj.on('blur', function(){
                if( _obj.val()=='' &&  deftxt){
                    _obj.val( deftxt );
                }
                if (_obj.val()===deftxt){
                    _obj.addClass('default')
                }
                setTimeout(function(){ _this.suglist.hide(); } ,160);
                _this.defsug.hide();
            });

            _obj.on('keyup', function(e){
                if(e.keyCode == 38){
                    _this.selectItem(-1);
                }else if(e.keyCode == 40){
                    _this.selectItem(1);
                }else if(e.keyCode == 13){              
                    var nowsel = _this.suglist.one('.on');
                    if( nowsel.length>0 ){                  
                        nowsel.trigger('click');
                    }
                }else{
                    if( _obj.val()!='' && _obj.val()!= deftxt ){
                        _this.fetchSug( _obj.val() );
                        _this.defsug.hide();
                    }else{
                        _this.suglist.hide();

                        if(!_this.noDefSug){
                            _this.defsug.show();
                        }
                    }
                }
            }); 

            _obj.on('input', function(e){
                if(e.keyCode == 38){
                    _this.selectItem(-1);
                }else if(e.keyCode == 40){
                    _this.selectItem(1);
                }else if(e.keyCode == 13){              
                    var nowsel = _this.suglist.one('.on');
                    if( nowsel.length>0 ){                  
                        nowsel.trigger('click');
                    }
                }else{
                    if( _obj.val()!='' && _obj.val()!= deftxt ){
                        _this.fetchSug( _obj.val() );
                        _this.defsug.hide();
                    }else{
                        _this.suglist.hide();

                        if(!_this.noDefSug){
                            _this.defsug.show();
                        }
                    }
                }
            }); 

            _obj.on('keypress', function(e){
                if(e.keyCode == 13){ //如果当前有选中项，就阻止默认表单提交事件。（在keyup事件中处理具体选中流程）
                    var nowsel = _this.suglist.one('.on');
                    if( nowsel.length>0 ){
                        e.preventDefault();
                    }
                }
            });     

            _this.suglist.delegate('.ui-addrsug-sugitem', 'click', function(e){
                var name = $(this).attr('data-name');
                var wholename = $(this).attr('data-whole');
                _obj.val( wholename );
                if(_this.suglist && _this.suglist.css('display')!='none'){
                    _this.suglist.hide();
                }
                if(_this.onSelect){
                    _this.onSelect(wholename);
                }
            });
        }

        this.showDefaultTxt = function(){
            var _obj = this.obj;        
            var deftxt = _obj.attr('data-default')||'';
            if( _obj.val()=='' &&  deftxt){
                _obj.val( deftxt );
            }           
            _obj.addClass('default');
        }

        this.fetchSug = function(txt){
            try{
                var cData = _this._cacheData[ encodeURIComponent(txt) ];
                if(cData){
                    _this.gotData(cData);
                }else{
                    //加载输入提示插件  
                    mapObj.plugin(["AMap.Autocomplete"], function() {
                        var autoOptions = {
                            city: _this.requireCity() //城市，默认全国  
                        };  
                        var auto = new AMap.Autocomplete(autoOptions);  
                        //查询成功时返回查询结果  
                        AMap.event.addListener(auto,"complete", function(data){ 
                            _this._cacheData[ encodeURIComponent(txt) ]=data; 
                            _this.gotData(data)
                        });  
                        auto.search(txt); 
                    });
                }
            }catch(ex){//Something wrong was here, but I can't find it out. So, Try-Catch it.

            }
        }

        this.gotData = function(data){      
            if(data && data.tips){
                _this.render( data.tips );
            }else{
                _this.suglist.hide();
            }
        }

        this.createDropList = function(){
            var suglist = $('<div class="ui-addrsug-suglist">').appendTo( 'body' ).hide().css({
                'z-index' : this.zIndex
            });;        

            this.suglist = suglist;

            this.resetSugListPos(suglist);
        }

        this.resetSugListPos = function( suglist ){
            var _obj = this.obj,
                offset = _obj.offset(),
                width  = _obj.width(),
                height = _obj.height();
            var setWidth = this.obj.attr('data-sugwidth')-0;

            suglist.css({
                'position' : 'absolute',
                'z-index' : this.zIndex,
                'width' :  setWidth || width,
                'left' : offset.left,
                'top' : offset.top + height + 2
            });
        }

        this.render = function( data ){
            if(data && data.length > 0){
                var str = '';
                for( var i=0, n=Math.min( data.length, this.showNum ); i<n; i++ ){
                    var item = data[i];
                    str += '<div class="ui-addrsug-sugitem" data-name="'+item.name+'" data-whole="'+item.district+item.name+'"><b>'+item.name+'</b><span>'+item.district+'</span></div>';
                }
                this.suglist.show().html( str );
            }else{
                this.suglist.hide();
            }
        }

        this.selectItem = function(direc){
            var now = this.suglist.one('.on');          
            if(!direc || direc==1){         
                if(now.length == 0){
                    this.suglist.find('.ui-addrsug-sugitem:first-child').addClass('on');
                }else{
                    now.removeClass('on');
                    var next = now.next('.ui-addrsug-sugitem');             
                    next.length > 0 ? next.addClass('on') : this.suglist.find('.ui-addrsug-sugitem:first-child').addClass('on');    
                }
            }else{
                if(now.length == 0){
                    this.suglist.find('.ui-addrsug-sugitem:last-child').addClass('on');
                }else{
                    now.removeClass('on');
                    var prev = now.prev('.ui-addrsug-sugitem');
                    prev.length > 0 ? prev.addClass('on') : this.suglist.find('.ui-addrsug-sugitem:last-child').addClass('on');             
                }
            }
        }

        /**
         * 默认提示
         * @return {[type]} [description]
         */
        this.createDefSug = function(){
            var txt = "可以搜索您所在的小区、写字楼或标志性建筑";
            var suglist = $('<div class="ui-addrsug-defsug">').appendTo( 'body' ).hide().css({
                'z-index' : this.zIndex-1
            });

            $('<div class="ui-addrsug-defitem"></div>').html(txt).appendTo(suglist);

            this.defsug = suglist;

            this.resetSugListPos(suglist);
        }

        this.init();
    }

    $.AddrSuggest = function(obj, conf){
        return new AddrSuggest(obj, conf);
    }
}(Zepto));
