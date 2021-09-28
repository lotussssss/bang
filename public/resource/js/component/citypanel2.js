(function() {
    var _CityData = null;

    // 获取城市数据
    function getCityData(callback){
        if (_CityData){
            var wCityList = W('#JsCityList');
            if ( !(wCityList && wCityList.length) ) {
                var city_list = W('#JsCityPanelTpl').html().trim().tmpl()({
                    '_id': 'JsCityList',
                    'hotcity': _CityData['hotcity'],
                    'letter': _CityData['letter'],
                    'citylist': _CityData['citylist']
                });
                wCityList = W(city_list).appendTo(W('body'));
            }

            typeof callback === 'function' && callback(wCityList);

        } else {
            QW.Ajax.get('/aj/getcitycode', function (res) {
                res = JSON.parse(res);

                if (!res['errno']) {
                    var result = res['result'];

                    var letter   = [],//QW.ObjectH.keys(result['citylist']);
                        citylist = [];
                    QW.ObjectH.map(result['citylist'], function (v, k) {
                        letter.push(k);
                        citylist.push(v);
                    });

                    _CityData = {
                        'hotcity': result['hotcity'],
                        'letter': letter,
                        'citylist': citylist
                    };

                    var wCityList = W('#JsCityList');
                    if ( !(wCityList && wCityList.length) ) {
                        var city_list = W('#JsCityPanelTpl').html().trim().tmpl()({
                            '_id': 'JsCityList',
                            'hotcity': _CityData['hotcity'],
                            'letter': _CityData['letter'],
                            'citylist': _CityData['citylist']
                        });
                        wCityList = W(city_list).appendTo(W('body'));
                    }

                    typeof callback === 'function' && callback(wCityList);
                }
            });
        }
    }

	function CityPanel() {
		this.init.apply(this, arguments);
	}

	CityPanel.prototype = (function() {
		return {
			init : function(trigger) {
				var instance = this;
				CustEvent.createEvents(this);

                if(!CityPanel.prototype._documentBind){
                	W(window).on('resize', function(e){
                		//窗口大小变化时重新触发
                		if(instance.container.css('display')!="none"){
	                		setTimeout(function(){
	                			try{ W(trigger).fire('click'); }catch(ex){}
	                		}, 100);
                		}
                	});
                    W(document).on('keydown', function(e) {
                        if(e.keyCode == 27) {
                            instance.container.hide();
                            instance.fire('close');
                        }
                    }).on('click', function(e) {
                            var flag = false;
                            CityPanel.prototype._triggerList.forEach(function(tri){
                                tri.forEach(function(el) {
                                    var trigger = W(el);

                                    if(trigger[0] == e.target || trigger.contains(e.target)) {
                                        flag = true;
                                    }
                                });
                            });

                            if( !flag && instance.container && (!instance.container[0] == e.target || !instance.container.contains(e.target)) ) {

                                instance.container.fadeOut(150);
                                instance.fire('close');
                            }
                        });
                    CityPanel.prototype._documentBind = true;
                }

                // 获取城市列表
                getCityData(function(wCityList){

                    instance.container = wCityList
                        .delegate('.close', 'click', function(e) {
                            e.preventDefault();

                            instance.container.hide();
                            instance.fire('close');
                        })
                        .delegate('.filter_bar a', 'click', function(e) {
                            e.preventDefault();

                            var el = W(this),
                                letter = el.html().trim();

                            if(el.hasClass('current')) return;

                            instance.container.query('.filter_bar a').removeClass('current');
                            instance.container.query('.city_wrap p').hide();
                            el.addClass('current');
                            instance.container.query('.city_wrap p.' + letter).show();
                        });
                });

                instance.trigger = W(trigger).click(function(e) {
                    e.preventDefault();

                    var wTri = W(this);

                    var pos = wTri.getRect();
                    //是否关闭一直出现
                    if(wTri.attr('data-close')=='hide'){
                        instance.container.query('.city_close').hide();
                    }else{
                        instance.container.query('.city_close').show();
                    }
                    var fix_top = 1;
                    if (wTri.attr('x-offset')) {
                        instance.container
                            .css({'left' : pos.left - wTri.attr('x-offset'), 'top' : pos.height + pos.top + fix_top})
                            .fadeIn(150);
                    }
                    else if( wTri.attr('data-floatright') ){
                        instance.container
                            .css({'left' : pos.left - 380, 'top' : pos.height + pos.top + fix_top})
                            .fadeIn(150);
                    }else{
                        instance.container
                            .css({'left' : pos.left, 'top' : pos.height + pos.top + fix_top})
                            .fadeIn(150);
                    }

                    //修正IE7下相关bug。IE7，360IE模式下，父级还有position:fixed, 上面的pos.top的值获取不正确，需要修正。需要把posisiton为fixed的父级点传到data-parentfixed参数里。如data-parentfixed="#doc-menubar-fixed"
                    if( wTri.attr('data-parentfixed') ){
                        var pf = wTri.ancestorNode( wTri.attr('data-parentfixed') );
                        var poffsettop = wTri.attr('data-parenttop')-0 || 30;
                        var scrTop = document.documentElement.scrollTop || document.body.scrollTop;

                        if( pf.length>0 && pf.css('position')=='fixed' &&  scrTop > 0 && pos.top<scrTop+ poffsettop  ){
                            instance.container.css('top',   pos.height + pos.top + 5 + scrTop);
                        }
                    }

                    instance.fire('onShow');

                    instance.container
                        .undelegate('p a')
                        .delegate('p a', 'click', function(e) {
                            e.preventDefault();

                            var name = this.innerHTML,
                                city = this.getAttribute('data-citycode'),
                                cityid = this.getAttribute('data-cityid');
                            if(!name || !city) return;

                            instance.fire('selectCity', {'name' : name, 'city' : city, 'cityid': cityid});
                            instance.container.hide();
                        });
                });
                // 将trigger添加到所有的trigger列表里
                CityPanel.prototype._triggerList.push(instance.trigger);
			},
            _triggerList: [],
            _documentBind: false // 是否已经写过了document的事件绑定
		};
	})();

	QW.provide({'CityPanel' : CityPanel});
})();