/**
 * 首页逻辑
 */
(function(){
    var __lngLat = {};

	var hoverHandler = null;
	//是否在二级子页面
	var IS_SUBAREA_PAGE = window.location.search.indexOf('target=blank') > -1 ? true : false;

    var cur_point = [0, 0]; // 当前的鼠标点
    var critical_point = [0, 0]; // 临界位置鼠标点
    var cc = 0; // 用于mousemove的计数器
    var t111; // 延时handler

	tcb.bindEvent(document.body, { 
		'.search-hot-word a':function(e){            
			e.preventDefault();            
			W(".search-hot-word").query('a').removeClass('curr');
			W(this).addClass('curr');
			W('.tcb-top-search input[name="stype"]').val(  W(this).attr('data-type') );
			W('.ac_wrap').hide();

            /*var typeid = W(this).attr('data-type')||0;
            var defKeyword = ['上门安装调试路由器', '系统安装', '笔记本除尘清灰', '手机刷机', '打印机维修', '服务器检测' ];
            var ckey = defKeyword[typeid];
            W('#360tcb_so').val(ckey).attr('data-default', ckey);*/
		},
		'.ba-info  a.ba-close':function(e){
			e.preventDefault();
			W('.ba-info').hide();
		},
		/****目前不要了---- '#feedback_show':function(e){
			e.preventDefault();
			if(W(this).hasClass('tit-show')){
				W(this).replaceClass('tit-show','tit-hide');
				W('#wentifankui').animate({'right':'0px','width':'40px'})
			}else{
				W("#fdTips").show();
				W("#fed_err_msg").html('还可以输入<span class="pipstxt"><i>120</i></span>个字')
				W(this).replaceClass('tit-hide','tit-show');
				W('#wentifankui').animate({'right':'0px','width':'476px'});
			}

		},*/
		'#feedback_send':function(){
			var textval = W("#fedbacktxt").val().replace(/\r\f\n\t/,'');
	    	var number = Math.floor((240 - textval.byteLen())/2);
	    	if(number<0||!textval){
	    		W("#fedbacktxt").shine4Error().focus();
	    		return;

	    	}
			var url = 'http://logs.helpton.com/webclient/bang_feedback.html?'+
				+ 'datetime='+new Date().getTime()+'&txt=' +encodeURIComponent(W("#fedbacktxt").val());
			
			var img = new Image(),
		        key = '360tcbfankui_log_' + Math.floor(Math.random() *
		              2147483648).toString(36);
	
		    window[key] = img;
		 
		    img.onload = img.onerror = img.onabort = function() {

		      img.onload = img.onerror = img.onabort = null;
		 
		      window[key] = null;

		      img = null;
		    };
		 
		    img.src = url;

		    W("#feedback_result").show();
		    W("#fedbacktxt").val('');
		    setTimeout(function(){
		    	W('#feedback_show').replaceClass('tit-show','tit-hide');
				W('#wentifankui').animate({'right':'-440px'})
				W("#feedback_result").hide();
			},2000)

		},
		//按照服务类型切换
		'.area-wrap .tab-2 a':function(e){
			e.preventDefault();
			W('.area-wrap  .tab-2 li').removeClass('active');
			W(this).ancestorNode('li').addClass('active');
			
			//切换查询的函数
			asynMerRepair(0,true);
			
		},
		//类型，按成交量，好评数切换
		'.repair-info .sort-type li a':function(e){
			e.preventDefault();
			W('.repair-info .sort-type li').removeClass('active');
			W(this).ancestorNode('li').addClass('active');
			//切换查询的函数
			asynMerRepair(0,true);
			
		},
		//在线，非在线切换
		'.repair-info .filter-check input':function(e){
			//切换查询的函数 在线状态
			asynMerRepair(0,true);
		},
		//商家好评类型切换
		'.positive-comments .tab-2 a':function(e){
			e.preventDefault();
			W('.positive-comments .tab-2 li').removeClass('active');
			W(this).ancestorNode('li').addClass('active');
			//切换查询的函数  商家好评
			asynMerComment(cur_citycode,W(this).attr('data-type'),0,true);
		},
		//点击城市
		'.dl-area-wrap .has-first a':function(e){
			e.preventDefault();

			var lists = W(".area-list .has-sub").query('.item-hd');
			lists.forEach(function(item,i){
				W(item).removeClass('curr');
			})

			W(this).addClass('curr');
			W("#detailTag").attr('data-curcode','')
				.html('')
			//切换查询的函数
			asynMerRepair(0,true);

		},
		//列表模式
		'a.btn-mode-list':function(e){
			e.preventDefault();
			// W(this).hide();
			// W("a.btn-mode-map").show();
			// W('#mode_list').show();
			// W('#mode_map').hide();
			asynMerRepair(0,true);
		},
		//地图模式
		'a.btn-mode-map':function(e){
			e.preventDefault();
			// W(this).hide();
			// W("a.btn-mode-list").show();
			// W('#mode_list').hide();
			// W('#mode_map').show();
			showMap(0, true,true);
		},
		//选择城市区县
		'.area-list-mini .item>a':function(e){
			/*e.preventDefault();

			W(this).parentNode('.area-list').query('.curr').removeClass('curr');
			W(this).addClass('curr');

			W('.sub-area-list .currsub').removeClass('currsub');
			//cleanAddrSearch();
			//切换查询的函数
			asynMerRepair(0,true);*/
		},
		//选择商圈后的结果
		'.sub-area-list a.shangquan':function(e){
			e.preventDefault();

			W(this).parentNode('.sub-area-list').query('.currsub').removeClass('currsub');
			W(this).addClass('currsub');

			cleanAddrSearch();
			//切换查询的函数
			asynMerRepair(0,true);
		},
		'.location-list .item-quxian':function(e){
			e.preventDefault();
			var target = e.target;
			W('.location-list .item-quxian').removeClass('curr');
			W(this).addClass('curr');
			
			W("#detailTag")
				.attr('data-curcode',W(this).attr('data-code'));

			W(this).parentNode('.location-list').hide();
			W(this).parentNode('.location-select').one('.now-location').html( W(this).one('span').html() );

			//切换查询的函数
			asynMerRepair(0,true);
		},
		'.location-select':{
			'mouseenter': function(e){
				W(this).one('.location-list').css('top', W(this).getSize().height - 2).show();
			},
			'mouseleave' : function(e){
				W(this).one('.location-list').hide();
			}
		},		
        // 分类列表的交互
        '.cate-wrap':{
            'mousemove': function(e){
                // 当前的鼠标位置
                cur_point = [e.pageX, e.pageY];

                var wMe = W(this);

                var target = e.target,
                    wTarget = W(target);
                var wTop = wTarget.parentNode('.cate-top');
                // 鼠标放在顶级分类上边
                if(wTop.length){
                    var wSub = wTop.nextSibling('.cate-sub'),
                        wLis = wTop.query('>li');

                    // var is_in = true;
                    var is_in = isInnerArea(critical_point, cur_point, wSub);
                    if (!is_in) {

                        // 目标元素为li元素本身
                        var wLi = target.nodeName.toLowerCase()==='li' 
                                ? wTarget
                                : wTarget.parentNode('li');

                        activeCateSelected(wLi, wLis, wSub, wTop, wMe);
                    }

                } else {
                    var wTitle = wTarget.hasClass('cate-title') ? wTarget : wTarget.parentNode('.cate-title');
                    // 鼠标放在分类标题上
                    if (wTitle.length) {
                        var wSpan = wTitle.query('span');
                        if(wSpan.length){
                            wSpan.removeClass('icon-arrow-down').addClass('icon-arrow-up');
                        }
                        wTop = wTitle.siblings('.cate-top');
                        wTop.show();
                    }
                }

            },
            'mouseover': function(e){
                // 移入元素的临界点
                critical_point = [e.pageX, e.pageY];
                var wMe = W(this);

                var target = e.target,
                    wTarget = W(target);
                var wTop = wTarget.parentNode('.cate-top');

                clearTimeout(t111);
                // 鼠标放在顶级分类上边
                if(wTop.length){
                    var wSub = wTop.nextSibling('.cate-sub'),
                        wLis = wTop.query('>li');

                    t111 = setTimeout(function(){

                        // 目标元素为li元素本身
                        var wLi = target.nodeName.toLowerCase()==='li' 
                                ? wTarget
                                : wTarget.parentNode('li');

                        activeCateSelected(wLi, wLis, wSub, wTop, wMe);
                    }, 300);

                }

            },
            'mouseleave': function(e){
                var wMe = W(this),
                	wSub = wMe.query('.cate-sub'),
                    wTop = wMe.query('.cate-top');

                clearTimeout(t111);

                wSub.animate({'width':'0px'}, 100, function(){
                    wSub.hide();
                	var wLis = wMe.query('.cate-top li');
	                wLis.removeClass('green');
                    // 在arae-page页面隐藏
                    if (wTop.hasClass('area-page-flag')) {
                        wTop.hide();
                        var wSpan = wMe.query('.cate-title span');
                        wSpan.length && wSpan.removeClass('icon-arrow-up').addClass('icon-arrow-down');
                    }
                });
            }
        },
        // 获取更多区县列表
        '.area-list-more':{
            'mouseenter': function(e){
                var wMe = W(this),
                    wUl = wMe.query('ul');
                if (!wUl.length) { return false;}

                wUl.show();
                wMe.query('.more-txt span').removeClass('icon-arrow-down').addClass('icon-arrow-up');
            },
            'mouseleave': function(e){
                var wMe = W(this),
                    wUl = wMe.query('ul');
                if (!wUl.length) { return false;}
                wUl.hide();
                wMe.query('.more-txt span').removeClass('icon-arrow-up').addClass('icon-arrow-down');
            }
        },
        // 大家都在问-换一换
        '.top-ask-change': function(e){
            var wMe = W(this),
                pos = parseInt(wMe.attr('pos'), 10);
            var oTopAsk = oTopAskList[pos],
                top_ask_list = '';
            if (QW.ObjectH.isObject(oTopAsk)) {
                oTopAsk.forEach(function(item, i){
                    if (item['url']) {
                        top_ask_list += '<a class="tip'+(i+1)+'" href="'+item['url']+'" target="_blank" style="color:'
                                     +  item['border']+';border:solid 1px '+item['border']+';background-color:'+item['bg']+';">'+item['name']+'</a>';

                    } else {
                        top_ask_list += '<a class="tip'+(i+1)+'" href="/search/?ie=utf-8&f=tcb&from=index_ask&keyword='
                                     +  encodeURIComponent(item['name'])+'" target="_blank" style="color:'
                                     +  item['border']+';border:solid 1px '+item['border']+';background-color:'+item['bg']+';">'+item['name']+'</a>';
                    }
                });
                var wList = wMe.siblings('.list');
                wList.html(top_ask_list);
                wList.query('a').forEach(function(el, i){
                    W(el).animate({'left': oTopAsk[i]['pos'][0], 'top': oTopAsk[i]['pos'][1]}, 1000, function(){}, QW.Easing.bounceOut);
                });
                pos++;
                if (pos===3) {
                    pos = 0;
                }
                wMe.attr('pos', pos);
            }
        },
        // 切换品牌维修店logo
        '.pinpai-logo-tab li': {
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.addClass('pinpai-logo-tab-cur').siblings('li').removeClass('pinpai-logo-tab-cur');
                W('.'+wMe.attr('target-block')).show().siblings('div').hide();
            }
        },
        //更多品牌
        '.logo-ctr-more' : function(e){
            e.preventDefault();
            if( W('.pinpai-logo-content1').css('display') !='none'){
                W('.pinpai-logo-content1-full').show();
            }else if( W('.pinpai-logo-content2').css('display') !='none'){
                W('.pinpai-logo-content2-full').show();
            }
        },
        //收起更多品牌
        '.logo-ctr-less' : function(e){
            e.preventDefault();

            W('.pinpai-logo-content1-full').hide();
            W('.pinpai-logo-content2-full').hide();
        }
	});
/**
 * 判断是否在区域之中
 * @param  {[type]}  critical_point 临界点
 * @param  {[type]}  cur_point      当前鼠标位置
 * @param  {[type]}  wSub           [description]
 * @return {Boolean}                [description]
 */
function isInnerArea(critical_point, cur_point, wSub){
    var flag = false;

    var rect = wSub.getRect(),
        sub_x = rect.left, // 子菜单框左顶点x
        sub_y = rect.top,  // 子菜单框左顶点y
        sub_h  = rect.height, // 子菜单框高度
        cr_x = critical_point[0], // 临界点x
        cr_y = critical_point[1], // 临界点y
        cu_x = cur_point[0], // 当前点x
        cu_y = cur_point[1]; // 当前点y

    var w = sub_x - cr_x; // 临界点到子菜单的距离

    // 鼠标在临界点的右边、或者重合 开始计算
    if (cr_x <= cu_x) {
        // 在临界点之上
        if (cr_y<cu_y) {
            if( !((cu_x-cr_x)/(cu_y-cr_y) < w/(sub_y+sub_h-cr_y)) ){
                flag = true;
            }
        }
        // 在临界点之下
        else if(cr_y>cu_y) {
            if ( !((cu_x-cr_x)/(cr_y-cu_y) < w/(cr_y-sub_y)) ) {
                flag = true;
            }
        }
        else {
            flag = true;
        }
    }

    return flag;
}
/**
 * 激活分类条的选择
 * @param  {[type]} wLi  [description]
 * @param  {[type]} wLis [description]
 * @param  {[type]} wSub [description]
 * @param  {[type]} wTop [description]
 * @param  {[type]} wMe  [description]
 * @return {[type]}      [description]
 */
function activeCateSelected(wLi, wLis, wSub, wTop, wMe){

    wLis.removeClass('green');
    wLi.addClass('green');
    
    var pos = 0; // 鼠标放置的cate位置
    wLis.forEach(function(el, i){
        // 获取鼠标放置的LI的位置
        if(el===W(wLi)[0]){
            pos = i;
        }
    });

    var wSubUl = wSub.query('>ul');
    wSubUl.hide();
    if (wSubUl.item(pos)) {
        wSubUl.item(pos).show();
        wSub.show();

        var top = 0, height = 0;
        var wLi_offset  = wLi.getRect(),
            wTop_offset = wTop.getRect(),
            wMe_offset  = wMe.getRect();
        var h1, h2, h3, h4;
        h1 = wLi_offset['top'] - wTop_offset['top'];
        h2 = wLi_offset['height']*2;
        if(h1>=h2){
            h3  = wLi_offset['top'] - wMe_offset['top'];
            top = h3 - h2 - 2;
        }

        var doc_scroll_top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        if (doc_scroll_top>34) {
            top = (doc_scroll_top - 34)>top ? (doc_scroll_top - 34) : top;
        }
        height = wMe_offset['height'] - top - 42;

        wSub.css({
            'width' : '420px',
            'height': height+'px',
            'top'   : top+'px'
        });
    }
}


    // 大家都在问-换一换的数据
    var oTopAskList = [
            [
                {
                    'name': '电脑没声音，检测维修',
                    'border': '#004305',
                    'bg': '#f9ffef',
                    'pos': ['0px', '0px']
                },
                {
                    'name': '系统安装',
                    'border': '#801e2a',
                    'bg': '#F9E3E5',
                    'pos': ['145px', '0']
                },                
                {
                    'name': '显示器花屏、暗屏、黑屏维修',
                    'border': '#8b4620',
                    'bg': '#FAE6DC',
                    'pos': ['220px', '0']
                },
                {
                    'name': '29.9元笔记本除尘清洁',
                    'border': '#536200',
                    'bg': '#F1F6D8',
                    'pos': ['400px', '0'],
                    'url': '/huodong/qinghui/?fromvisit=index'
                },
                {
                    'name': '电脑自动关机，无法开机',
                    'border': '#015e08',
                    'bg': '#EEFBE7',
                    'pos': ['0', '40px']
                },
                {
                    'name': '数据硬盘丢失，文件恢复',
                    'border': '#3b3b3b',
                    'bg': '#F1F1F1',
                    'pos': ['170px', '40px']
                },
                {
                    'name': 'usb无法识别',
                    'border': '#805603',
                    'bg': '#F7EEDC',
                    'pos': ['354px', '40px']
                },
                {
                    'name': '硬盘坏道修复',
                    'border': '#395f7a',
                    'bg': '#E1EDF6',
                    'pos': ['443px', '40px']
                }
            ],
            [
                {
                    'name': '手机密码忘了怎么解锁',
                    'border': '#19631f',
                    'bg': '#E7F2D5',
                    'pos': ['0', '0']
                },
                {
                    'name': '键盘失灵',
                    'border': '#801e2a',
                    'bg': '#F9E3E5',
                    'pos': ['140px', '0']
                },
                {
                    'name': '手机数据恢复',
                    'border': '#902e3a',
                    'bg': '#F9E3E5',
                    'pos': ['210px', '0']
                },            
                {
                    'name': '电脑温度高，除尘清灰',
                    'border': '#536200',
                    'bg': '#F1F6D8',
                    'pos': ['306px', '0']
                },
                {
                    'name': '运行很慢',
                    'border': '#8b4620',
                    'bg': '#FAE6DC',
                    'pos': ['450px', '0']
                },
                {
                    'name': '玩游戏卡',
                    'border': '#015e08',
                    'bg': '#EEFBE7',
                    'pos': ['0', '40px']
                },
                {
                    'name': '经常蓝屏',
                    'border': '#805603',
                    'bg': '#F7EEDC',
                    'pos': ['100px', '40px']
                },
                {
                    'name': '驱动安装',
                    'border': '#395f7a',
                    'bg': '#E1EDF6',
                    'pos': ['200px', '40px']
                },
                {
                    'name': '电脑系统故障远程维修',
                    'border': '#395c8a',
                    'bg': '#E1EDF6',
                    'pos': ['300px', '40px']
                }, 
                {
                    'name': '风扇噪音大',
                    'border': '#03623f',
                    'bg': '#E3FDF4',
                    'pos': ['450px', '40px']
                }
            ],
            [
                {
                    'name': '打印机无法打印',
                    'border': '#8b4620',
                    'bg': '#FAE6DC',
                    'pos': ['0', '0']
                },
                {
                    'name': '系统不好用',
                    'border': '#805603',
                    'bg': '#F7EEDC',
                    'pos': ['108px', '0']
                },
                {
                    'name': '显示花屏',
                    'border': '#19631f',
                    'bg': '#E7F2D5',
                    'pos': ['188px', '0']
                },
                {
                    'name': '死机重启',
                    'border': '#801e2a',
                    'bg': '#F9E3E5',
                    'pos': ['260px', '0']
                },
                {
                    'name': '硬盘文件误删',
                    'border': '#692faa',
                    'bg': '#E1EDF6',
                    'pos': ['340px', '0']
                },
                {
                    'name': '手机越狱',
                    'border': '#598f8a',
                    'bg': '#E1EDF6',
                    'pos': ['450px', '0']
                },                
                {
                    'name': '软件报错',
                    'border': '#536200',
                    'bg': '#F1F6D8',
                    'pos': ['0', '40px']
                },
                {
                    'name': '频繁死机',
                    'border': '#3b3b3b',
                    'bg': '#F1F1F1',
                    'pos': ['70px', '40px']
                },
                {
                    'name': '风扇清理',
                    'border': '#015e08',
                    'bg': '#EEFBE7',
                    'pos': ['140px', '40px']
                },
                {
                    'name': 'SD卡数据恢复',
                    'border': '#395f7a',
                    'bg': '#E1EDF6',
                    'pos': ['300px', '40px']
                }
                ,
                {
                    'name': '网页打不开',
                    'border': '#398f7a',
                    'bg': '#E1EDF6',
                    'pos': ['210px', '40px']
                }                                
                ,
                {
                    'name': '手机刷机root',
                    'border': '#493f9a',
                    'bg': '#E1EDF6',
                    'pos': ['420px', '40px']
                }
            ]
        ];

	var dataListCache = {};

	/**
	 * 获得商家进行过滤的参数
	 */
	function getMerSelectParam(){

		var area_id = W('.area-list .curr').attr('data-code') || 0;
		var quan_id = W('.sub-area-list .currsub').attr('data-code') || 0;

		return {
			'city_id':cur_citycode,
			'area_id':area_id,
			'quan_id':quan_id,
			'service_id':W(".area-wrap .tab-2 li.active a").attr('data-type'),
			'type_id':W(".repair-info .sort-type li.active a").attr('data-type'),
			'online':W(".repair-info #cb_1")[0].checked? 'on':'off',
            'cuxiao':W(".repair-info #cb_2")[0].checked? 'on':'off',
            'is_bzj':W(".repair-info #cb_3")[0].checked? '1':'0',
			'tag':tag,
			'pagesize':15,
            'lng' : __lngLat? __lngLat.lng : '',
            'lat' : __lngLat? __lngLat.lat : ''
		}

	}
	function modifyUrl(){
		var s_id = W(".area-wrap .tab-2 .active a").attr('data-type');

		W("#merRepairWrap .figure-h a").forEach(function(item){
			var _href = W(item).attr('href');
			if (s_id == undefined)
			{
				s_id = '';
			}
            if (_href.indexOf('/c/help')===-1) {
                W(item).attr('href',_href+"&service_id="+s_id);
            } else {
                W(item).attr('href',_href);
            }
		})
	}

	/**
	 * 商家维修信息
	 * @param  {[type]} pn   [description]
	 * @param  {[type]} flag [description]
	 * @return {[type]}      [description]
	 */
	function asynMerRepair(pn,flag,gdata){
		var	html = '',
			pageSize =15 ;
		var param = getMerSelectParam();
			param['pn'] = pn;
			
		//将推荐提示隐藏还原
		W("#recommendTips").hide();

		if(dataListCache[Object.encodeURIJson(param)]||gdata){
			var _data = dataListCache[Object.encodeURIJson(param)]||gdata;
            _data['shop_data'].forEach(function(el){
                if (el['shop_ico'].indexOf('pinpailogo')==-1) {
                    el['shop_ico'] = tcb.imgThumbUrl(el['shop_ico'], 140, 140);
                }
            });
			var func = W("#merRepairTplIndex").html().trim().tmpl();
			html = func(_data);
			W('#merRepairWrap').html(html);
			if(_data.recommend_dianpu){
				W("#recommendTips").show();
			}
			//优化内容，去店铺页url修改
			modifyUrl();
			duiqi();
			flag && merRepairPager(Math.ceil(_data.page_count/pageSize));

            //赋值给全局变量，给地图使用
            window.__currListData = _data;

            //区县页面右侧地图
            try{ W('#shopMiniMap').length>0 && _showMiniMap( ); }catch(ex){}
		}else{
			QW.Ajax.get('/at/shop?'+ Object.encodeURIJson(param),function(e){
				var ret = e.evalExp();
				if(parseInt(ret.errno)!==0){
					html =  '<li class="no-data-merrepair">抱歉，暂时没有找到符合您要求的店铺</li>';
				}else{
					if(ret.shop_data.length==0){
						html =  '<li class="no-data-merrepair">抱歉，暂时没有找到符合您要求的店铺</li>';
					}else{
                        ret['shop_data'].forEach(function(el){
                            if (el['shop_ico'].indexOf('pinpailogo')==-1) {
                                el['shop_ico'] = tcb.imgThumbUrl(el['shop_ico'], 140, 140);
                            }
                        });
						dataListCache[Object.encodeURIJson(param)] = ret;
						var func = W("#merRepairTplIndex").html().trim().tmpl();
						html = func(ret);
					}
				}
				if(ret.recommend_dianpu){
					W("#recommendTips").show();
				}

				W('#merRepairWrap').html(html);
				_showSearchTip();
				//优化内容，去店铺页url修改
				modifyUrl();
				duiqi();
				flag && merRepairPager(Math.ceil(ret.page_count/pageSize));

                //赋值给全局变量，给地图使用
                window.__currListData = ret;

                //区县页面右侧地图
                try{ W('#shopMiniMap').length>0 && _showMiniMap( ); }catch(ex){}
			});
		}
		
	}
	/**
	 * 异步获取商家好评信息
	 * @param  {[type]} addr [description]
	 * @param  {[type]} type [description]
	 * @param  {[type]} pn   [description]
	 * @return {[type]}      [description]
	 */
	function asynMerComment(cur_citycode,type,pn,flag){
		//不在显示评论
		if( true || IS_SUBAREA_PAGE ){
			return;
		}

		pn 	 = pn||0;
		type = type|| '';
		var html = '',
			pagesize = 4;
		var params = 'service_id='+type+'&city_id='+cur_citycode+'&pn='+pn+'&pagesize=4';
		
		if(dataListCache[params]){
			var _data = dataListCache[params];
			var func = W("#merCommentTpl").html().trim().tmpl();
			html = func(_data);
			W('#merCommentWrap').html(html);
			if(_data.total>3){
				W("#merCommentAndTop").show();
			}
			flag && merCommentPager(Math.ceil(_data.total/pagesize));
		}else{
			QW.Ajax.get('/at/comment?'+ params ,function(e){
				var ret = e.evalExp(),
					data = ret.result;
				if(parseInt(ret.errno)!==0){
					html =   '<li class="li-nodata ">抱歉，暂时没有找到符合您要求的好评</li>';
				}else{
					if(data.total==0){
						html =   '<li class="li-nodata">抱歉，暂时没有找到符合您要求的好评</li>';
					}else{
                        if (data['list'] && data['list'].length) {
                            data['list'].forEach(function(item){
                                item['order_id'] = item['order_id'].replace(/^(\d{9})\d+(\d{4})$/, '$1******$2');
                            });
                        }
						dataListCache[params] = data;
						var func = W("#merCommentTpl").html().trim().tmpl();
						html = func(data);
					}

				}
				if(data.total>3){
					W("#merCommentAndTop").show();
				}
				W('#merCommentWrap').html(html);
				flag && merCommentPager(Math.ceil(data.total/pagesize));
			});	
			
		}
		
		
		
	}

	function duiqi(){
        return ;
        //目前不用了。。如果长时间不用了，就删除。 20140410 by sv
		if(IS_SUBAREA_PAGE){//2级区县页面
            var wInfoBd = W('#js-repair-info .bd'),
                wRankBd = W('#js-shop-rank .bd');
            if (wInfoBd.length && wRankBd.length) {
                //reset
                wInfoBd.css({height:'auto'})
                wRankBd.css({height:'auto'})

                var _right_top = W('.subarea-map').getSize().height + parseInt( W('.subarea-map').css('margin-bottom') ),
                    _height = wInfoBd.getSize().height,
                    _height_right = _right_top + wRankBd.getSize().height ;

                if(_height>_height_right){
                    wRankBd.css({height:_height-18 - _right_top,overflow:'hidden'})
                }else{
                    wInfoBd.css({height:_height_right,overflow:'hidden'})
                }
            }
		}else{
			//reset
            var wInfoBd = W('#js-repair-info .bd'),
                wRankBd = W('#js-shop-rank .bd');
            if (wInfoBd.length && wRankBd.length) {
                wInfoBd.css({height:'auto'})
                wRankBd.css({height:'auto'})

                var _height =wInfoBd.getSize().height,
                    _height_right = wRankBd.getSize().height;

                if(_height>_height_right){
                    wRankBd.css({height:_height-18,overflow:'hidden'})
                }else{
                    wInfoBd.css({height:_height_right,overflow:'hidden'})
                }
            }
		}

	}
	/**
	 * 商家维修分页
	 * @return {[type]} [description]
	 */
	function merRepairPager(pagenum, id, callback){



		var id = id || 'merRepairPager';
		if(pagenum==1){
			W('#'+id+' .pages').hide().html('');
			duiqi();
			return;
		}

		W('#'+id+' .pages').show();
		duiqi();

		var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
	    var pager = new Pager(W('#'+id+' .pages'), pagenum, pn);

	    pager.on('pageChange', function(e) {
	    	callback = callback || asynMerRepair;
 			callback(e.pn,false,false);
 			if(id != "merRepairMapPager"){
 				window.scrollTo(0, W('.repair-info').getXY()[1]-102);
 			}
 			
	    });
	}
	/**
	 * 商家好评分页
	 * @return {[type]} [description]
	 */
	function merCommentPager(pagenum){
		if(pagenum==1){
			W('#merCommentPager .pages').html('');
			return;
		}
		var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
	    var pager = new Pager(W('#merCommentPager .pages'), pagenum, pn);

	    pager.on('pageChange', function(e) {
	    	var type =W(".positive-comments li.active a").attr('data-type');
 			asynMerComment(cur_citycode,type,e.pn,false);
 			window.scrollTo(0, W('.positive-comments').getXY()[1]);
	    });
	}

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

	        W(selector).ancestorNodes('.subtit').firstChild('strong').html( city_name );

            var redirect_url = "http://" +location.host +"/at/?" + city,
                query_params = location.search.queryUrl();
            if (query_params['target']==='blank') {
                redirect_url += '&target=blank';
            }
	        location.href = redirect_url;
	    });
	}

	/**
	 * 对商圈结果进行排序
	 * @param  {[type]} result [description]
	 * @return {[type]}        [description]
	 */
	function sortResult(result) {
        var results = [];
        for(var id in result) {
            var name = result[id];
            results.push({id : parseInt(id, 10), name : name});
        }

        results.sort(function(o1, o2) {
            if(o1.id > o2.id) {
                return 1;
            } else if(o1.id < o2.id) {
                return -1;
            } else {
                return 0;
            }
        });

        return results;
    };


    function createBigMap(p_flag){
        //如果是分页，那么就不用再去创建了。
        if(p_flag){
            var panel = tcb.alert("地图模式", W("#mode_mapTpl").html(), {'width':688, btn_name: '关闭',wrapId:"panel-modeMapindex"}, function(){
                map = null;
                return true;
            });
        }
        //reset
        try{map.destroy()}catch(ex){}
        document.getElementById("mode_map_container").innerHTML = "";

        map = new AMap.Map("mode_map_container",{
            view: new AMap.View2D({//创建地图二维视口
               zoom:11,
               rotation:0
            })
        }); 
        map.plugin(["AMap.ToolBar","AMap.OverView","AMap.Scale"],function(){
            var overview = new AMap.OverView();
            map.addControl(overview);
            var toolbar = new AMap.ToolBar(-100,0);
            toolbar.autoPosition=false;
            map.addControl(toolbar);
            var scale = new AMap.Scale();
            map.addControl(scale);
        });
        W(document.body).delegate('#panel-modeMapindex span.close', 'click', function(e){
            try{
                e.preventDefault();
                map.clearInfoWindow();
                map = null;
            }catch(e){

            }
            
        })

        W(document.body).delegate('.mode-map a.close', 'click', function(e){    
            e.preventDefault();
            map.clearInfoWindow();

        })
        

        //点击在线聊天时关闭弹出层
        W(document.body).delegate('.qim-go-talk', 'click', function(){
            panel.hide();
            map = null;
        });

        return map;
    }
    /**
     * 显示大地图，仅在网站首页生效，一次显示300数据
     * @param  {[type]} pn     [description]
     * @param  {[type]} flag   [description]
     * @param  {[type]} p_flag [description]
     * @return {[type]}        [description]
     */
    function showMap(pn, flag,p_flag){

    	var map = createBigMap(p_flag);

		var param = getMerSelectParam();
		var pageSize = window.location.search.indexOf('target=blank')>-1? 15 : 300;  //首页300，二级页15
			param.pagesize = pageSize;
			param['pn'] = pn | 0;

		QW.Ajax.get('/at/shop?'+ Object.encodeURIJson(param),function(e){
			var ret = e.evalExp(),
				data = ret.shop_data;
			if(parseInt(ret.errno)!==0){
				return alert("获取数据异常，请重试")
			}else{
				data.forEach(function(item, i){
					if( !item.map_longitude || !item.map_latitude){ return false; }
					var marker = new AMap.Marker({
			            id:"mapMarker"+i,
			            position:new AMap.LngLat(item.map_longitude, item.map_latitude), 
			            icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
			            offset:{x:-13,y:-36} 
			        });
			        marker.setMap(map);

			        var infoWindow = new AMap.InfoWindow({
						isCustom: true,
						autoMove: true,
						offset:new AMap.Pixel(70,-280),
						content:W('#indexMapInfoTpl').html().tmpl({
							shop_name: item.shop_name,
							addr: item.addr_detail,
							service_tags: item.main.subByte(40, '...'), //item.service_tags.subByte(40,'...'),
							qid: item.qid,
							shop_addr: item.shop_addr,
							online_txt: item.is_online == "on" ? "立即咨询" : "离线留言"
						}),
						size: new AMap.Size(349, 204)
					});
					if(item.recommend==1){
						//W("#maprecommendTips").show();
					}
					AMap.event.addListener(marker, "click", function(){
                        //try{ tcbMonitor.__log({cid:'map-marker-click',ch:''}); }catch(ex){}
						infoWindow.open(map, marker.getPosition())
					})
					if(i == 0){
						//infoWindow.open(map, marker.getPosition());
						map.setCenter(new AMap.LngLat(item.map_longitude, item.map_latitude))
					}
				})
			}
			if(ret.recommend_dianpu){
				//W("#maprecommendTips").show();
				W("#merRepairMapPager").hide();
			}
			flag && merRepairPager(Math.ceil(ret.page_count/pageSize), 'merRepairMapPager', showMap);
		});
    }

    //根据搜索的结果显示地图数据
    function showMapByRs(data){
        var data = data || (window.__currListData && window.__currListData.shop_data );

        var map = createBigMap(true);

        data.forEach(function(item, i){
            //if (i) {return};
            var marker = new AMap.Marker({
                id:"mapMarker"+i,
                position:new AMap.LngLat(item.map_longitude, item.map_latitude), 
                icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
                offset:{x:-13,y:-36} 
            });
            map.addOverlays(marker);

            var infoWindow = new AMap.InfoWindow({
                isCustom: true,
                autoMove: true,
                offset:new AMap.Pixel(-100,-300),
                content:W('#indexMapInfoTpl').html().tmpl({
                    shop_name: item.shop_name,
                    addr: item.addr_detail,
                    service_tags: item.main.subByte(40, '...'), //item.service_tags.subByte(40,'...'),
                    qid: item.qid,
                    shop_addr: item.shop_addr,
                    online_txt: item.is_online == "on" ? "立即咨询" : "离线留言"
                }),
                size: new AMap.Size(349, 204)
            });
            if(item.recommend==1){
                //W("#maprecommendTips").show();
            }
            AMap.event.addListener(marker, "click", function(){
                //try{ tcbMonitor.__log({cid:'map-marker-click',ch:''}); }catch(ex){}
                infoWindow.open(map, marker.getPosition())
            })
            if(i == 0){
                //infoWindow.open(map, marker.getPosition());
                map.setCenter(new AMap.LngLat(item.map_longitude, item.map_latitude))
            }
        });
    }


    function feedbackCountNumber(){

    	W("#fedbacktxt").on('keyup,paste',function(){

    		if(W(this).val()){
    			W("#fdTips").hide();
    		}else{
    			W("#fdTips").show();
    		}
    		var textval = W("#fedbacktxt").val().replace(/\r\f\n\t/,'');
	    	var number = Math.floor((240 - textval.byteLen())/2);

	    	if(number>=0){
	    		W("#fed_err_msg").html('还可以输入<span class="pipstxt"><i>'+number+'</i></span>个字')
	    	}else{
	    		W("#fed_err_msg").html('您已经超过<span class="pipstxt"><i style="color:red">'+(~number)+'</i></span>个字')
	    	}
    	})

    	W("#fdTips").click(function(){
    		W("#fedbacktxt").focus();
    	})


    }

    function talkProAutoHeight(){
    	
    }

    //冻结搜索框完整版
    function fixedToSearchBox(){
        return false;

        /*=========================目前不要了 2014.07.18===========================*/

    	if( W('#doc-menubar .tcb-top-search').length>0 ){
	    	
			function autoFixedTopSearch(){
				var tbH = W('#doc-topbar').getSize().height;
				var dST = document.documentElement.scrollTop || document.body.scrollTop;
				var dmH = W('#doc-menubar').getSize().height;
				
				W('#doc-menubar-fixed').css('height', dmH);
				if( dST>= tbH ){
					if( W('#doc-menubar-fixed').css('display') == 'none' ){
			        	//把搜索框区域浮动条中
			        	W('#doc-menubar').query('>.in').appendTo( W('#doc-menubar-fixed').html('') );
			        	W('.hd-search-info form input[name="_isfix"]').val(1);
			            W('#doc-menubar-fixed').show();
			            W('#doc-menubar').css('visibility', 'hidden');			            
			            W(".search-click-here").hide();
			        }
				}else{
					if( W('#doc-menubar-fixed').css('display') != 'none' ){
			        	//将搜索框区域放回去
			        	W('#doc-menubar').appendChild(W('#doc-menubar-fixed').query('>.in'));
			        	W('.hd-search-info form input[name="_isfix"]').val(0);
			            W('#doc-menubar').css('visibility', 'visible');
			            W('#doc-menubar-fixed').hide(); 
			            W(".search-click-here").show();
	    			}
				}
			}

			W(window).on('scroll', autoFixedTopSearch);
			W(window).on('onload', autoFixedTopSearch);
			W(window).on('resize', autoFixedTopSearch);
		}
    }

    //首页搜索结果提示
    function indexSearchTip(){

    	if(window.location.search.length > 1){
    		_showSearchTip();
		}
		
    }

    function _showSearchTip(){
		var tip = W('.index-search-tip');

		if( W('#merRepairWrap').one('li').attr('id') != "recommendTips" && W('#merRepairWrap .no-data-merrepair').length ==0){//第一个li不是提示信息，说明有数据
			tip.show();	
			tip.one('.stip-img').attr('src', tip.one('.stip-img').attr('src') ); //为了让gif重新闪烁，重置src
		}else{//无数据，隐藏
			tip.hide();
		}

		duiqi();
	}

	/**
	 * 城市切换后，显示提醒小人
	 * @return {[type]} [description]
	 */
	function cityChangedNotice(){
		if(window.location.href.indexOf('/at/') > -1 && document.referrer.indexOf( BASE_ROOT )>-1){
			W('.hd-area-info .citychange-notice').show();
			W('.hd-area-info .citychange-notice img').attr('src', W('.hd-area-info .citychange-notice img').attr('src'));
			setTimeout( function(){
				W('.hd-area-info .citychange-notice').hide();
			}, 4200);
		}
	}

	//右侧问卷
	function showWenJuan(){
	    var wjTip;

	    wjTip = W('<a href="http://www.diaochapai.com/survey744508" target="_blank" class="index-right-wenjuan"></a>').appendTo( W('body') );
	        
	    _autoTipPos();

	    function _autoTipPos(){
	        
	        W(window).on('load', _autoPos);
	        W(window).on('resize', _autoPos);

	        _autoPos();
	    }  

	    function _autoPos(){
	        wjTip.css('left', (Dom.getDocRect().width - W('.doc-bd').getRect().width)/2 + W('.doc-bd').getRect().width + 9);
	    }  
	}

    /**
     * 入口
     * @return {[type]} [description]
     */
    function init(){

    	//点击其他地方，商圈消失
		W(document).click(function(e) {
			var target = e.target;
			if(W(target)&&W(target).hasClass('item-hd')){
				return;
			}
			W('.area-list li').removeClass('hover');
		})

		//选择城市，刷新页面
		selectCity('.citypanel_trigger');

		IS_SUBAREA_PAGE ? asynMerRepair(0,true) : asynMerRepair(0,true,merdata);
		asynMerComment(cur_citycode,'','',true);
		feedbackCountNumber();
		fixedToSearchBox();
		indexSearchTip();
		talkProAutoHeight();
		//cityChangedNotice();
		//不要了///showWenJuan();
    }

    init();

    /**
     * 大家都在问的小块块的移动动画
     * @return {[type]}
     */
    function askTipsAnimate(){
        var pos_arr = [];
        oTopAskList[0].forEach(function(item, i){
            pos_arr.push(item['pos']);
        });
        // var pos_arr = [
        //     ['15px', '3px'],
        //     ['196px', '-2px'],
        //     ['345px', '5px'],
        //     ['445px', '-7px'],
        //     ['600px', '-2px'],
        //     ['30px', '39px'],
        //     ['140px', '40px'],
        //     ['314px', '45px'],
        //     ['465px', '33px'],
        //     ['540px', '41px']
        // ];
        var wTips = W('.top-ask .list a');
        wTips.forEach(function(el, i){
            var wMe = W(el);
            wMe.animate({'left': pos_arr[i][0], 'top': pos_arr[i][1]}, 1000, function(){}, QW.Easing.bounceOut);
        });

    }
    /**
     * 添加顶部子分类
     */
    function addSubCate(){
        var subData = [
            // 组装机、一体机、品牌机
            [
                {
                    'title':'主机', 
                    'data' :[[
                                {'title':'频繁死机','url':'','classes': ''},
                                {'title':'自动重启','url':'','classes': ''},
                                {'title':'开机报警','url':'','classes': ''},
                                {'title':'经常蓝屏','url':'','classes': ''},
                                {'title':'温度高噪音大','url':'','classes': 'gr-font'}
                            ], 
                            [
                                {'title':'接口不能用','url':'','classes': ''},
                                {'title':'电脑自动关机','url':'','classes': ''},
                                {'title':'键盘失灵','url':'','classes': ''},
                                {'title':'USB无法识别','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'显示器', 
                    'data' :[[
                                {'title':'显示花屏','url':'','classes': 'gr-font'},
                                {'title':'显示器自动黑屏','url':'','classes': ''},
                                {'title':'显示蓝屏','url':'','classes': 'gr-font'},
                                {'title':'开机不亮','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'系统', 
                    'data' :[[
                                {'title':'运行慢','url':'','classes': 'gr-font'},
                                {'title':'网页打不开','url':'','classes': ''},
                                {'title':'不能上网','url':'','classes': ''},
                                {'title':'系统报错','url':'','classes': ''},
                                {'title':'系统安装 ','url':'','classes': ''}//,
                                // {'title':'驱动安装 ','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'软件', 
                    'data' :[[
                                {'title':'玩游戏卡','url':'','classes': ''},
                                {'title':'软件安装','url':'','classes': ''},
                                {'title':'软件无法下载','url':'','classes': ''},
                                {'title':'软件报错','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'清洁保养', 
                    'data' :[[
                                {'title':'笔记本保养','url':'','classes': ''},
                                {'title':'台式机保养','url':'','classes': ''},
                                {'title':'电脑温度高','url':'','classes': ''},
                                {'title':'风扇噪音大','url':'','classes': ''}
                            ],[
                                {'title':'风扇清理','url':'','classes': ''},
                                {'title':'上散热硅脂','url':'','classes': ''},
                                {'title':'电脑散热保养','url':'','classes': ''},
                                {'title':'笔记本除尘清洁','url':'','classes': 'gr-font'}
                            ]]
                },
                {
                    'title':'其他', 
                    'data' :[[
                                {'title':'电脑没声音','url':'','classes': ''},
                                {'title':'不能打字','url':'','classes': ''},
                                {'title':'一体机维修','url':'','classes': ''},
                                // {'title':'u盘无法格式化','url':'','classes': ''},
                                {'title':'文件丢失','url':'','classes': ''}
                            ]]
                }
            ],
            // 笔记本电脑、上网本
            /*[
                {
                    'title':'主机', 
                    'data' :[[
                                {'title':'频繁死机','url':'','classes': ''},
                                {'title':'开机不亮','url':'','classes': ''},
                                {'title':'自动重启','url':'','classes': ''},
                                {'title':'开机报警','url':'','classes': ''},
                                {'title':'经常蓝屏','url':'','classes': ''}
                            ], 
                            [
                                {'title':'温度高噪音大','url':'','classes': ''},
                                {'title':'接口不能用','url':'','classes': ''},
                                {'title':'键盘失灵','url':'','classes': ''},
                                {'title':'usb无法识别','url':'','classes': 'gr-font'}
                            ]]
                },
                {
                    'title':'显示屏', 
                    'data' :[[
                                {'title':'显示花屏','url':'','classes': ''},
                                {'title':'显示器自动黑屏','url':'','classes': ''},
                                {'title':'显示蓝屏','url':'','classes': 'gr-font'}
                            ]]
                },
                {
                    'title':'系统', 
                    'data' :[[
                                {'title':'文件丢失','url':'','classes': ''},
                                {'title':'网页打不开','url':'','classes': ''},
                                {'title':'运行很慢','url':'','classes': ''},
                                {'title':'不能上网','url':'','classes': ''},
                                {'title':'软件报错','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'其他', 
                    'data' :[[
                                {'title':'没有声音','url':'','classes': ''},
                                {'title':'不能打字','url':'','classes': ''},
                                {'title':'上门安装调试路由器','url':'/huodong/luyouqi/?fromvisit=cate','classes': 'gr-font'}
                            ]]
                }
            ],*/
            // 手机、平板电脑、pad
            [
                {
                    'title':'设备', 
                    'data' :[[
                                {'title':'无法开机','url':'','classes': ''},
                                {'title':'手机解锁','url':'','classes': ''},
                                {'title':'手机进水','url':'','classes': ''},
                                {'title':'wifi不能用','url':'','classes': ''},
                                {'title':'没声音','url':'','classes': ''}
                            ], 
                            [
                                {'title':'屏幕碎了','url':'','classes': ''},
                                {'title':'死机重启','url':'','classes': ''},
                                {'title':'平板电脑维修','url':'','classes': ''},
                                {'title':'pad维修','url':'','classes': 'gr-font'}
                            ]]
                },
                {
                    'title':'系统', 
                    'data' :[[
                                {'title':'手机越狱','url':'','classes': 'gr-font'},
                                {'title':'刷机root','url':'','classes': ''},
                                {'title':'系统不好用','url':'','classes': ''},                                
                                {'title':'软件安装','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'其他',
                    'data' :[[
                                {'title':'手机数据丢失','url':'','classes': ''}
                            ]]
                }
            ],
            // 系统安装、软件异常
            /*[
                {
                    'title':'系统', 
                    'data' :[[
                                {'title':'系统安装','url':'','classes': ''},
                                {'title':'系统报错','url':'','classes': ''},
                                {'title':'驱动安装','url':'','classes': ''},
                                {'title':'玩游戏卡','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'软件', 
                    'data' :[[
                                {'title':'软件安装','url':'','classes': ''},
                                {'title':'软件无法下载','url':'','classes': ''},
                                {'title':'软件报错','url':'','classes': ''}
                            ]]
                // },
                // {
                //     'title':'路由器',
                //     'data':[[
                //                 {'title':'上门安装调试', 'url':'','classes': 'gr-font'}
                //            ]]
                }
            ],*/
            // 数据丢失、文件误删
            /*[
                {
                    'title':'主机数据', 
                    'data' :[[
                                {'title':'硬盘修复工具','url':'','classes': ''},
                                {'title':'硬盘坏道修复','url':'','classes': 'gr-font'},
                                {'title':'硬盘数据丢失','url':'','classes': ''},
                                {'title':'回收站数据恢复','url':'','classes': ''}
                            ], 
                            [
                                {'title':'硬盘文件误删','url':'','classes': 'gr-font'}
                            ]]
                },
                {
                    'title':'外设数据', 
                    'data' :[[
                                {'title':'U盘数据恢复','url':'','classes': ''},
                                {'title':'手机平板数据丢失','url':'','classes': ''},
                                {'title':'SD卡数据恢复','url':'','classes': 'gr-font'},
                                {'title':'数据库恢复','url':'','classes': ''}
                            ]]
                }
            ],*/
            // 打印机、投影仪、扫描仪
            [
                {
                    'title':'数据丢失', 
                    'data' :[[
                                {'title':'误删除','url':'','classes': 'gr-font'},
                                {'title':'硬盘修复工具','url':'','classes': ''},
                                {'title':'硬盘坏道修复','url':'','classes': ''},
                                {'title':'硬盘数据丢失','url':'','classes': ''},
                                {'title':'U盘数据恢复','url':'','classes': ''}
                            ], 
                            [
                                {'title':'回收站数据恢复','url':'','classes': ''},
                                {'title':'手机平板数据丢失','url':'','classes': ''},
                                {'title':'SD卡数据恢复','url':'','classes': 'gr-font'},
                                {'title':'数据库恢复','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'办公外设', 
                    'data' :[[
                                {'title':'打印机维修','url':'','classes': 'gr-font'},
                                {'title':'不能打印','url':'','classes': ''},
                                {'title':'惠普打印机','url':'','classes': ''},
                                {'title':'佳能打印机','url':'','classes': ''},
                                {'title':'卡纸','url':'','classes': ''}
                            ], 
                            [
                                {'title':'打印机不能共享','url':'','classes': ''},
                                {'title':'打印机无法打印','url':'','classes': ''},
                                {'title':'检测不到打印机','url':'','classes': ''}
                            ], 
                            [
                                {'title':'打印机复印机加粉','url':'','classes': ''},
                                {'title':'投影仪维修','url':'','classes': ''},
                                {'title':'扫描仪维修','url':'','classes': ''}
                            ]]
                },
                {
                    'title':'服务器检修', 
                    'data' :[[
                                {'title':'服务器维护','url':'','classes': ''},
                                {'title':'服务器数据异常','url':'','classes': ''},
                                {'title':'服务器不能工作','url':'','classes': ''},
                                {'title':'服务器检测','url':'','classes': 'gr-font'}
                            ]]
                },
                {
                    'title':'其他', 
                    'data' :[[
                                {'title':'路由器调试','url':'','classes': ''},
                                {'title':'键盘失灵','url':'','classes': ''}
                            ]]
                }
            ]/*,
            // 电脑温度高、除尘清洁
            [
                {
                    'title':'电脑清洁', 
                    'data' :[[
                                {'title':'笔记本保养','url':'','classes': ''},
                                {'title':'台式机保养','url':'','classes': ''},
                                {'title':'电脑温度高','url':'','classes': ''},
                                {'title':'风扇噪音大','url':'','classes': ''}
                            ],
                            [
                                {'title':'29.9元笔记本除尘清洁','url':'','classes': 'gr-font'},
                            ]]
                },
                {
                    'title':'设备保养', 
                    'data' :[[
                                {'title':'风扇清理','url':'','classes': ''},
                                {'title':'上散热硅脂','url':'','classes': ''},
                                {'title':'电脑散热保养','url':'','classes': ''}
                            ]]
                }
            ],
            // 服务器检修
            [
                {
                    'title':'服务器', 
                    'data' :[[
                                {'title':'服务器维护','url':'','classes': ''},
                                {'title':'服务器数据异常','url':'','classes': ''},
                                {'title':'服务器不能工作','url':'','classes': ''},
                                {'title':'服务器检测','url':'','classes': 'gr-font'}
                            ]]
                }
            ]*/

        ];
        var wSub = W('.cate-sub'),
            li_str = [];
        // 遍历问题分类的详细信息
        subData.forEach(function(data){
            li_str.push('<ul style="display:none;">');
            data.forEach(function(o){
                li_str.push('<li class="clearfix"><h3>',o.title,'</h3><div class="cate-sub-cnt">');
                o.data.forEach(function(list){
                    // li_str.push('<p>');
                    list.forEach(function(item){
                    	if (item['url']) {
                    		li_str.push('<a bk="cate-sub" target="_blank" href="',item['url'],'"',(item['classes']?' class="'+item['classes']+'"':''),'>',item['title'],'</a><wbr>');
                    	} else {
                    		li_str.push('<a bk="cate-sub" target="_blank" href="/search/?ie=utf-8&f=tcb&from=index_cate&keyword=',encodeURIComponent(item['title']),'"',(item['classes']?' class="'+item['classes']+'"':''),'>',item['title'],'</a><wbr>');
                    	}
                    });
                    // li_str.push('</p>');
                });
                li_str.push('</div></li>');
            });
            li_str.push('</ul>');
        });
        li_str = li_str.join('');
        wSub.html(li_str);
    }
    /**
     * 初始化轮播广告
     * @return {[type]} [description]
     */
    function initSlider(){
        var wSlideWrap = W('.slide-wrap'),
            wA = wSlideWrap.query('.slide-main a');
        var liHtml = '';
        wA.forEach(function(el, i){ liHtml += '<li class="pngfix '+(i==0? 'cur' : '')+'">'+i+'</li>'; });
        W('.slide-nav').html(liHtml);
        var wLis = wSlideWrap.query('.slide-nav li');
        wSlideWrap
            .on('mouseover', function(e){
                var target = e.target;
                if (target.nodeName.toLowerCase()==='li') {
                    var wTarget = W(target),
                        pos = 0;
                    // 鼠标停留在非当前幻灯的nav上，那么需要切换到相应的幻灯~
                    if(!wTarget.hasClass('cur')){
                        wLis.removeClass('cur');
                        wLis.forEach(function(el, i, wL){
                            if (el===target) {
                                pos = i;
                                wL.item(i).addClass('cur');
                            }
                        });
                        wA.hide();
                        wA.item(pos) && wA.item(pos).show();
                    }
                }
                clearTimeout(h1);
                clearTimeout(h2);
            })
            .on('mouseout', function(){
                autoSlide();
            });
        var h1, h2,
            t1 = 8000,
            t2 = 5000;
        /**
         * 自动切换
         * @return {[type]} [description]
         */
        function autoSlide(){
            h1 = setTimeout(function(){
                var wCur = wLis.filter('.cur'),
                    pos = 0;

                wLis.forEach(function(el, i){
                    if (el===W(wCur)[0]) {
                        pos = i;
                    }
                });
                wLis.removeClass('cur');
                pos++;
                if (pos>=wLis.length) {
                    pos = 0;
                }
                wLis.item(pos) && wLis.item(pos).addClass('cur');
                wA.hide();
                wA.item(pos) && wA.item(pos).show();
                if (h1) {
                    var arg = arguments,
                        t = pos===0 ? t1 : t2; // cur在第一个位置的时候用t1作为延时，否则用t2
                    h2 = setTimeout(function(){
                        arg.callee();
                    }, t);
                }
            }, t1);            
        }
        autoSlide();
    }

    function showRightMap(){
    	var wel = W('#shopMiniMap');
    	if( wel.length == 0 ){ return }

    	W('#viewBigMap').on('click', function(e){
    		e.preventDefault();
            var isSecondPage = window.location.search.indexOf('target=blank')>-1;            
    		showMapByRs(  );
            if(isSecondPage){ W('#merRepairMapPager').css({'height':0, 'visibility':'hidden'}); } //在二级页面隐藏翻页。
    	});

    	//这里不调用地图显示，显示策略在列表数据回调中触发
        //_showMiniMap();

    }

    var rightMap;
    function _showMiniMap( data ){
        var data = data || (window.__currListData && window.__currListData.shop_data );
		//初始化地图
		var el = W('#shopMiniMap');
		//reset
        try{ rightMap.destroy()}catch(ex){}
		W("#shopMiniMap").html('');

		rightMap = new AMap.Map("#shopMiniMap",{
            view: new AMap.View2D({//创建地图二维视口
               zoom:11,
               rotation:0
            })
        }); 

		data.forEach(function(item, i){
            //if (i) {return};
            var marker = new AMap.Marker({
                id:"mapMarker"+i,
                position:new AMap.LngLat(item.map_longitude, item.map_latitude), 
                icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
                offset:{x:-13,y:-36} 
            });
            rightMap.addOverlays(marker);

            if(i == 0){
                //infoWindow.open(map, marker.getPosition());
                rightMap.setCenter(new AMap.LngLat(item.map_longitude, item.map_latitude))
            }
        });

	}

    /**
     * 初始化查看更多地区
     * @return {[type]} [description]
     */
    function initMoreArea(){
        var wMore = W('.area-list-more'),
            wUl = wMore.query('ul');
        if (!wUl.length) { return false;}
        if (!wUl.query('li').length) {
            var wItem = wMore.siblings('.area-list').query('li'),
                wFirstItem = wItem.first();
            if (!wFirstItem) {return false;}
            wItem.forEach(function(el, i){
                var wCur = W(el);
                if ((wCur.xy()[1] - wFirstItem.xy()[1])>10) {
                    wCur.appendTo(wUl);
                }
            });
            // 没有任何区域添加到wUl中，那么就将wUl移除掉
            if (!wUl.query('li').length) {
                wUl.removeNode();
                wMore.css('visibility', 'hidden');
            }
        }
    }

    //绑定位置搜索框
    function initAddrSearch(obj){
        W('#addrSearchForm').bind('submit', function(e){
            e.preventDefault();
            var _this = this;
            var ipt = W(this).one('[name="addr"]');
            var txt = ipt.val();
            if( txt =='' || txt == ipt.attr('data-default') ){
                ipt.focus();
                if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(ipt);
            }else{
                getGeoPoi(txt, searchByPoi);
            }
        });

        W('#addrSearchForm').one('[name="addr"]').on('focus', function(){ W('.addr-search-err').hide(); });

        new AddrSuggest(obj, {
            'showNum' : 6,
            'onSelect' : function(txt){ getGeoPoi(txt, searchByPoi); },
            'requireCity' : function(){ return W('.area-box-sel').html() || '' }
        });
    }

    function searchByPoi(poi){
        if(poi == null){
            W('.addr-search-err').show();
        }else{
            W('.addr-search-err').hide();
            __lngLat = poi;
            cleanCitySel();
            asynMerRepair(0,true);
        }
    }

    //获取poi
	function getGeoPoi(addr, callback){
        var mapBox = W('<div id="geoMapBox"></div>').appendTo( W('body') ).hide();
        var _map = new AMap.Map("geoMapBox"); 
        // 加载地理编码插件 
        _map.plugin(["AMap.Geocoder"], function() {
            MGeocoder = new AMap.Geocoder({
                city : W('.area-box-sel').html() || '',
                radius: 1000,
                extensions: "all"
            });
            //返回地理编码结果
            AMap.event.addListener(MGeocoder, "complete", function(datas){
                var pos = null;
                if(datas && datas['resultNum'] > 0 ){
                    pos = {
                        'lng': datas['geocodes'][0]['location']['lng'],
                        'lat': datas['geocodes'][0]['location']['lat']
                    }                    
                }

                callback(pos);
            });
            //逆地理编码
            MGeocoder.getLocation(addr);
        });
	}

    //清楚位置搜索状态
    function cleanAddrSearch(){
        __lngLat = null;
        W('#addrSearchForm .addr-ipt').val('');
    }

    //清除城市区县商圈选择状态
    function cleanCitySel(){
        W('.area-list .item-hd').removeClass('curr').first().addClass('curr');
        W('.sub-area-list .currsub').removeClass('currsub');
    }

    /**
     * 下方的slide
     * @return {[type]} [description]
     */
    function topBotSlider(){
        var box = W('.top-slide-bot');
        if(!box.length){ return ;}

        var itemNum = box.query('.s-b-list li').length,
            itemWid = box.query('.s-b-list li').item(0).getRect().width,
            boxWid = 3*itemWid,
            innerBox = box.one('.slide-bot-inner'),
            iList = box.one('.s-b-list');

        iList.css('width',  itemNum*itemWid );
        //innerBox.css('width',  boxWid-1 );

        box.delegate('.s-btn-prev', 'click', function(e){
            e.preventDefault();
            var sleft = innerBox[0].scrollLeft;
            innerBox.animate({scrollLeft :  sleft- boxWid }, 500, function(){}, QW.Easing.easeBoth);
        });

        box.delegate('.s-btn-next', 'click', function(e){
            e.preventDefault();
            var sleft = innerBox[0].scrollLeft;
            innerBox.animate({scrollLeft : sleft + boxWid }, 500, function(){}, QW.Easing.easeBoth);
        });
    }

    Dom.ready(function(){
        // 执行大家都在问的动画
        setTimeout( function(){ W('.top-ask-change').fire('click') }, 10);
        // 添加顶部子分类
        addSubCate();
        // 初始化轮播广告
        initSlider();
        topBotSlider();

        //区县页面右侧地图
        showRightMap();

        // 初始化查看更多区县功能
        initMoreArea();        

        //位置搜索过滤
        initAddrSearch('#addrSearchForm .addr-ipt'); 
    });
})();

function showShopGrade( grade ){
    var icon = Math.min(Math.ceil(grade/5), 4);
    var icon_num = (grade-1)%5 + 1;
    var str = '';
    for(var i=0; i<icon_num; i++){
        str +='<span class="icon icon-dj icon-dj-'+icon+'"></span>';
    }
    return str;
}
