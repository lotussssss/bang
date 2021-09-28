/**
 * 店铺首页
 * @return {[type]} [description]
 */
(function(){
    var JuBaoPanel = null;
	tcb.bindEvent(document.body, {
		'.search-hot-word a':function(e){
			e.preventDefault();
			W(".search-hot-word").query('a').removeClass('curr');
			W(this).addClass('curr');
			W('.tcb-top-search input[name="stype"]').val( W(this).attr('data-type') );
			W('.ac_wrap').hide();

			var typeid = W(this).attr('data-type')||0;
            var defKeyword = ['上门安装调试路由器', '系统安装', '笔记本除尘清灰', '手机刷机', '打印机维修', '服务器检测' ];
            var ckey = defKeyword[typeid];
            W('#360tcb_so').val(ckey).attr('data-default', ckey);
		},
		/**
		 * 用户协议
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		'.agreement img' : function(e) {
			e.preventDefault();
			var panel = tcb.alert("360同城帮声明", W('#showUserProtocalTpl_dp').html(), {'width':695}, function(){
	                panel.hide();
	            });
		},
		/**
		 * 服务类型
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		'#itemServiceType a':function(e){
			e.preventDefault();
			var that = W(this);
			W("#itemServiceType li").forEach(function(item){
				W(item)[0].className = '';
			});
			that.parentNode('li').addClass('active');

			asynItemService(that.attr('data-type'),0,true);

		},
		/**
		 * 推荐商家
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		'#itemServiceTypeRecom a':function(e){
			e.preventDefault();
			var that = W(this);
			W("#itemServiceTypeRecom li").forEach(function(item){
				W(item)[0].className = '';
			});
			that.parentNode('li').addClass('active');

			asynItemServiceRecom(that.attr('data-type'));

		},
		/**
		 * 用户评论
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		'#userCommentType a':function(e){
			e.preventDefault();
			var that = W(this);
			W("#userCommentType li").forEach(function(item){
				W(item)[0].className = '';
			});
			that.parentNode('li').addClass('active');

			asynUserComment(that.attr('data-type'),0,true);

		},
		/**
		 * 搜索
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		'input.service':function(e){
			if(!W("#itemSearchKey").val()){
				W("#itemSearchKey").shine4Error().focus();
				return;
			}

			W('#shopSubMenu [data-rel="prd-list"]').fire('click');

			searchItemService(encodeURIComponent(W("#itemSearchKey").val()),0,true);

		},
		'#itemService li':{
			'mouseenter':function(e){
				//处理ie8下就可以了
				if(QW.Browser.ie<8){
					var e = window.event||e,
						target =e&& e.target;
					if(target&&target.tagName.toLowerCase()=="li"){
						W(target).addClass('hover');
					}
				}



			},
			'mouseleave':function(e){
				if(QW.Browser.ie<8){
					W("#itemService li").removeClass('hover');
				}
			}
		},
		'.go-itemservice':function(e){

			W("#itemServiceType").show();
			W("#searchResult").html('').hide();
			W("#itemServiceType li").removeClass('active');
			W("#itemServiceType").firstChild('li').addClass('active');
			asynItemService(W("#itemServiceType .active a").attr('data-type'),0,true);
		},
		'a.see-phone':function(e){
			e.preventDefault();
			//W("#detail").addClass('detail show');
			W(".xd-baozhang").show();
			W(this).hide();
			var tel = W(this).attr('data-tel');
			W('.contact strong').html(tel);
			new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpu" +( typeof(_inclient)!='undefined'&&_inclient ? '&inclient=1' : '' );
		},
		//客户端查看电话
		'strong.see-phone':function(e){
			e.preventDefault();
			var tel = W(this).attr('data-tel');
			W(this).html(tel+ (typeof(_inclient)!='undefined'?'':'<span style="color:#4BAC20;margin-left:10px;">联系我时，请说是在360同城帮上看到的，谢谢！</span>'));
			new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpu" +( typeof(_inclient)!='undefined'&&_inclient ? '&inclient=1' : '' );
		},
		//分享
		'#shareShop' : function(e){
			e.preventDefault();
			var _this = W(this);
			shopFunc.shareLink(_this, 'shop');
		},
		//发送到手机
		'#sendToPhone' : function(e){
			e.preventDefault();
			var _this = W(this);
			shopFunc.sendToPhone(_this, 'shop');
		},
		'.tab .more-fenlei' : function(e){
			e.preventDefault();
			if(W(this).one('.icon-infoarrow2').length>0){
				W(this).one('.icon-infoarrow2').replaceClass('icon-infoarrow2', 'icon-infoarrow-up')
				W(this).parentNode('.tab').css({
					'height' : 'auto'
				});
			}else{
				W(this).one('.icon-infoarrow-up').replaceClass('icon-infoarrow-up', 'icon-infoarrow2')
				W(this).parentNode('.tab').css({
					'height' : 38
				});
			}
		},
        // 显示认证相关信息
        '.rz-360': {
            'mouseenter': function(e){
                var wMe = W(this);

                var xy = wMe.xy(),
                    h_xy = wMe.parentNode('h3').xy();

                wMe.siblings('.cert').css({
                    'display': 'block',
                    'left': (xy[0]-h_xy[0]-10)+'px',
                    'top': (xy[1]-h_xy[1]-7)+'px'
                });
            }
        },
        '.cert-top, .cert-list': {
            'mouseenter': function(e){
                var wMe = W(this);

                var wCert = wMe.parentNode('.cert'),
                    xy = wCert.siblings('.rz-360').xy(),
                    h_xy = wCert.parentNode('h3').xy();
                wCert.css({
                    'display': 'block',
                    'left': (xy[0]-h_xy[0]-10)+'px',
                    'top': (xy[1]-h_xy[1]-7)+'px'
                });
            },
            'mouseleave': function(e){
                var wMe = W(this);
                if (!(W(e.relatedTarget).hasClass('cert-list') || W(e.relatedTarget).hasClass('cert-top'))) {
                    wMe.parentNode('.cert').hide();
                }
            }
        },
		// '.show-yzlist' : function(e){
		// 	e.preventDefault();
		// 	var cert = W(this).parentNode('.rz-360');
		// 	if( cert.hasClass('show-cert') ){
		// 		cert.removeClass('show-cert');
		// 	}else{
		// 		cert.addClass('show-cert');
		// 	}

		// },
		'.see-big-map': function(e){
			e.preventDefault();

			var el = W(this);

			new bigMap().show(el.attr('data-shopid'));
		},
		'.xd-baozhang .xdbz-close' : function(e){
			W(".xd-baozhang").hide();
		},
		//展开商品介绍
		'.service-item-list .link-desc-more' : function(e){
			e.preventDefault();
			W(this).parentNode('p').hide().siblings('.desc-more').show();
		},
		//收起商品介绍
		'.service-item-list .link-desc-mini' : function(e){
			e.preventDefault();
			W(this).parentNode('p').hide().siblings('.desc-mini').show();
		},
		// 激活举报表单
		'#JuBaoButton': function(e){
			e.preventDefault();

            var jubao_func = W('#JuBaoPanelTpl').html().trim().tmpl(),
                jubao_str = jubao_func();

            JuBaoPanel = tcb.panel('举报该信息', jubao_str, {
            	'wrapId': 'JuBaoPanel',
                'width': 577
            });
		},
		// 提交举报表单
		'.sub_jubao': function(e){
			var wJubaoid = W('[name="jubaoid"]').filter(':checked'),
				wProgram_desc = W('[name="program_desc"]'),
				wLink_phone = W('[name="link_phone"]');

            var program_desc = wProgram_desc.val(),
                link_phone = wLink_phone.val();
            // 验证jubaoid
            // 验证问题描述
            // 验证联系电话
			if (!validJubaoId(wJubaoid) || !validProgramDesc(wProgram_desc) || !validLinkPhone(wLink_phone)) {
                return ;
			}

			var params = {
				'jubaoid': wJubaoid.val(),
				'shopid': shop_id,
				'qid': host_qid,
				'program_desc': program_desc,
				'link_phone': link_phone
			};
			var request_url = base_url+'aj/jubaoshop/?'+QW.ObjectH.encodeURIJson(params);
			QW.loadJsonp(request_url, function(response){
                if (response['errno']==0) {
                    // JuBaoPanel.hide();

                    var jubao_func2 = W('#JuBaoPanel2Tpl').html().trim().tmpl(),
                    jubao_str2 = jubao_func2();

                    var JuBaoPanel2 = tcb.panel('举报该信息', jubao_str2, {
                        'wrapId': 'JuBaoPanel2',
                        'width': 268
                    });
                    JuBaoPanel2.on('beforehide', function(){
                        JuBaoPanel.hide();
                    });
               }
			});
		},
        // 举报描述
		'.program_desc': {
			'focus': function(e){
				var wMe = W(this);

                if (wMe.hasClass('unactived')) {
                    wMe.removeClass('unactived').val('');
                }
			},
            'blur': function(e){
                var wMe = W(this);

                if (wMe.val().trim()==='') {
                    wMe.addClass('unactived').val(wMe.attr('textholder'));
                }
            }
		},
        // 联系电话
        '.link_phone': {
            'focus': function(e){
                var wMe = W(this);

                if (wMe.hasClass('unactived')) {
                    wMe.removeClass('unactived').val('');
                }
            },
            'blur': function(e){
                var wMe = W(this);

                if (wMe.val().trim()==='') {
                    wMe.addClass('unactived').val(wMe.attr('textholder'));
                }
            }
        },
        // 客户端显示详细地图
        '.client-show-map': function(e){
            e.preventDefault();

			var el = W(this);

			new bigMap().show(el.attr('data-shopid'), true);
        },
        // 显示完整号码
        '#ClientShowBigMap .pop-window .tel a': function(e){
            e.preventDefault();

            var wMe = W(this),
                tel = wMe.attr('data-tel');

            wMe.siblings('.tel-num').html(tel);
            wMe.hide();
            wMe.siblings('.tel-tip').show();

            new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpu_map2&inclient=1";
        },
        // 显示完整的评论内容
        '.comment-content-more': function(e){
            e.preventDefault();

            var wMe = W(this),
                wP = wMe.parentNode('p');

            wP.html(wP.attr('title').encode4Html()).css({
                'height': 'auto'
            });
        },
        //快速预约表单
        '#fastYuyueForm' : {
        	'submit' : function(e){
        		e.preventDefault();
        		var w_this = W(this),
        			w_content = w_this.one('[name="content"]'),
        			w_mobile = w_this.one('[name="mobile"]');
        		if(w_content.val().trim()==''){
        			w_content.shine4Error();
        			return;
        		}

        		if(w_content.val().trim().length > 50){
        			w_content.shine4Error();
        			alert('您最多可以输入50个字');
        			return;
        		}

        		if(w_mobile.val().trim()=='' || w_mobile.val().length!=11){
        			w_mobile.shine4Error();
        			return;
        		}

        		QHPass.when.signIn(function(){
	        		QW.Ajax.post( '/aj/fen_xiang' , { 'mobile':w_mobile.val().trim(), 'msg' : w_content.val().trim(), 'shop_id': w_this.one('[name="shop_id"]').val(), 'act':'yuyue'}, function(data){
	        			data = JSON.parse(data);
	        			if( data.errno == 0 ){
	        				tcb.alert('提交成功', '<div style="padding:10px;font-size:13px;">您的预约已经提交成功~，稍后商家会联系您进行维修</div>', {width: 240, height:140}, function(){ return true});
	        			}else{
	        				tcb.alert('提交失败', '<div style="padding:10px;font-size:13px;">抱歉出错了，请您稍后再试。'+data.errmsg+'</div>', {width: 240, height:140}, function(){ return true});
	        			}
	        		});
        		});
        	}
        },
        '#fastYuyueForm [name="mobile"]' : {
        	'keyup' : function(e){
        		W(this).val( W(this).val().replace(/\D/g, '') );
        	}
        },

        '.go-yuyue-buy' : function(e){
            e.preventDefault();
            var shopid = W(this).attr('data-shopid'),
                productid = W(this).attr('data-productid');
            ( typeof(ComServiceYuyue)!='undefined') && ComServiceYuyue.show(shopid, productid);
        },
        '.js-talk-trigger' : function(e){
        	e.preventDefault();
        	try{
        		window.external.FolkStartConsult( W(this).attr('data-jid') );
        	}catch(ex){
        		alert("抱歉，出错了，请您更新或安装360安全卫士。");
        	}
        },
        '.js-service-trigger' : function(e){
        	e.preventDefault();
        	try{
        		window.external.FolkExpertDetail( W(this).attr('data-jid') );
        	}catch(ex){
        		alert("抱歉，出错了，请您更新或安装360安全卫士。");
        	}
        }
	});
    function validJubaoId(wObj){
        var flag = true;
        if (!wObj.length) {
            alert('请选择举报内容');
            flag = false;
        }
        return flag;
    }
    function validProgramDesc(wObj){
        var flag = true;
        if (wObj.hasClass('unactived')) {
            alert('请填写问题描述');
            flag = false;
        }
        return flag;
    }
    function validLinkPhone(wObj){
        var flag = true;
        if (wObj.hasClass('unactived')) {
            alert('请填写问题联系电话');
            flag = false;
        }
        else if (!tcb.validMobile(wObj.val())) {
            alert('手机号码填写不正确');
            flag = false;
        }
        return flag;
    }

    //是否显示维修分类后面的更多箭头
    function checkShowMoreFenlei(){
    	var box1 = W('#itemServiceType');
    	var list1 = box1.query('>li');
    	var moreBtn1 =  box1.siblings('.more-fenlei');
    	if( list1.last().getRect().top - list1.first().getRect().top > 10 ){
    		moreBtn1.show();
    	}else{
    		moreBtn1.hide();
    	}
    }
    /**
     * 根据中心点和半径换算查询范围
     * @param  {[type]} latLng [description]
     * @param  {[type]} radius [description]
     * @return {[type]}        [description]
     */
    function getBounds(latLng, radius){
        var latitude = latLng.lat-0;

        var longitude = latLng.lng-0;

        var degree = (24901 * 1609) / 360.0;

        var raidusMile = radius;

        var dpmLat = 1 / degree;

        var radiusLat = dpmLat * raidusMile;

        var minLat = latitude - radiusLat;

        var maxLat = latitude + radiusLat;

        var mpdLng = degree * Math.cos(latitude * (Math.PI / 180));

        var dpmLng = 1 / mpdLng;

        var radiusLng = dpmLng * raidusMile;

        var minLng = longitude - radiusLng;

        var maxLng = longitude + radiusLng;

        return [ [minLng, minLat ].join(',') , [maxLng, maxLat].join(',') ].join(';');
    }

	var dataListCache = {};
	/**
	 * 异步处理项目服务数据
	 * @param  {[type]} type [类型]
	 * @param  {[type]} pn   [分页]
	 * @return {[type]}      [description]
	 */
	function asynItemService(type,pn,flag,gdata){
		type = type|| "";
		pn = pn || 0;

		var html = "",
			item;

		var params = "pagesize=10&shop_id="+shop_id+"&service_id="+type+"&pn="+pn+"&_t=";

		if(dataListCache[params]||gdata){
			var _data = dataListCache[params]||gdata;
			flag && itemServicePager(Math.ceil(_data.page.page_count/10));
			var func = W('#itemServiceTpl').html().trim().tmpl();
			html = func(_data);
			W("#itemService").html(html);

			//缓存第一页数据
			if(gdata){ dataListCache[params] = gdata; }

			//滚动到列表内容顶部. 只在itemid参数传递时有效
			if(window.location.search.indexOf('itemid')>-1){
				try{
					W('a[name="dpsearch"]')[0].scrollIntoView(true);
					document.documentElement.scrollLeft=0;

						var firstDesc = W('.service-item-list .desc-mini').item(0);
						firstDesc.query('.link-desc-more').item(0).fire('click');

				}catch(ex){

				}
			}

			//显示搜索结果提示
			showSearchRsTip();
		}else{
			loadJsonp( BASE_ROOT +"dianpu/product?"+params,function(ret){
				if(ret.errno!==0){
					html = '<div class="li-nodata">暂无数据。</div>';
				}else{
					if(ret.page.page_count==0){
						html ='<div class="li-nodata">暂无数据。</div>';
					}else{
						dataListCache[params] = ret;
						flag && itemServicePager(Math.ceil(ret.page.page_count/10));
						var func = W('#itemServiceTpl').html().trim().tmpl();
						html = func(ret);
					}
				}

				W("#itemService").html(html);

				try{ W('a[name="dpsearch"]')[0].scrollIntoView(true); document.documentElement.scrollLeft=0;}catch(ex){}
			})
		}
	};

	/**
	 * 异步推荐商品
	 * @param  {[type]} type [类型]
	 * @param  {[type]} pn   [分页]
	 * @return {[type]}      [description]
	 */
	function asynItemServiceRecom(type,pn){
		type = type|| "";
		pn = pn || 0;

		var html = "",
			item,
			resShowBox = W("#itemServiceRecom");

		var params = "tuijian=1&pagesize=10&shop_id="+shop_id+"&service_id="+type+"&pn="+pn+"&_t=";

		if(dataListCache[params]){
			var _data = dataListCache[params]||gdata;

			var func = W('#itemServiceTpl').html().trim().tmpl();

			html = func(_data);

			resShowBox.html(html);

		}else{
			loadJsonp( BASE_ROOT +"dianpu/product?"+params,function(ret){
				if(ret.errno!==0){
					html = '<div class="li-nodata">暂无数据。</div>';
				}else{
					if(ret.page.page_count==0){
						html ='<div class="li-nodata">暂无数据。</div>';
					}else{
						dataListCache[params] = ret;

						var func = W('#itemServiceTpl').html().trim().tmpl();
						html = func(ret);
					}
				}

				resShowBox.html(html);

			})
		}
	};

	function searchItemService(word,pn,flag){
		// type = type|| "";
		pn = pn || 0;

		var html = "",
			item;

		loadJsonp(BASE_ROOT + "dianpu/search/?pagesize=4&shop_id="+shop_id+"&service_id=&keyword="+word+"&pn="+pn+"&_t="+Math.random(),function(ret){
			if(ret.errno!==0){
				html = '<div class="li-nodata">暂无数据。</div>';
			}else{

				if(flag){
					searchServicePager(Math.ceil(ret.page.page_count/10));
					W("#itemServiceType").hide();
					W("#searchResult").html('<li>共找到'+ret.page.page_count+'个与<span style="color:red;padding:0 3px">"'+W("#itemSearchKey").val().encode4Html()+'"</span>相关的产品 <span style="padding-left:10px;" class="go-itemservice">返回>></span></li>').show();
				}

				if(ret.length==0){
					html = '<div class="li-nodata">暂无数据。</div>';
				}else{
					var func = W('#itemServiceTpl').html().trim().tmpl();
					html = func(ret);

				}
			}

			W("#itemService").html(html);

		})



	};
	/**
	 * 异步处理用户评论数据
	 * @param  {[type]} type [服务类型]
	 * @param  {[type]} pn   [分页]
	 * @param  {[type]} flag [是否绘制分页组件]
	 * @return {[type]}      [description]
	 */
	function asynUserComment(type,pn,flag){
		type = type|| "";
		pn = pn || 0;
		flag = flag|| false;

		var html = "",
			item,
			pagesize = 10;

		var params =  "pagesize="+pagesize+"&shop_id="+shop_id+"&service_id="+type+"&pn="+pn+"&_s=";

		if(dataListCache[params]){

			var _data = dataListCache[params];
			flag&&userCommentPager(Math.ceil(_data.page.comm_total/_data.page.pagesize));
			var func = W('#userCommentTpl').html().trim().tmpl();
			html = func(_data);
			W("#userComment").html(html);

		}else{
			loadJsonp(BASE_ROOT +"dianpu/comments?"+ params,function(ret){
				var  data = ret.result;
				if(ret.errno!==0){
					html = '<div class="li-nodata">暂无数据。</div>';
				}else{

					!type && W("#comment_num").html(data.page.comm_total||'0');

					if(data.comm.length==0){
						html='<div class="li-nodata">暂无数据。</div>';
					}else{
                        // console.log(data)
                        if (data['comm'] && data['comm'].length) {
                            data['comm'].forEach(function(item){
                                item['order_id'] = item['order_id'].replace(/^(\d{9})\d+(\d{4})$/, '$1******$2');
                            });
                        }
						dataListCache[params] = data;
						flag&&userCommentPager(Math.ceil(data.page.comm_total/data.page.pagesize));
						var func = W('#userCommentTpl').html().trim().tmpl();
						html = func(data);
					}

				}

				W("#userComment").html(html);

			})

		}

	}

	/**
	 * 项目服务分页
	 * @return {[type]} [description]
	 */
	function itemServicePager(pagenum){
		if(pagenum==1){
			W('#itemServicePager .pages').html('');
			return;
		}
		var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
	    var pager = new Pager(W('#itemServicePager .pages'), pagenum, pn);

	    pager.on('pageChange', function(e) {
 			asynItemService(W("#itemServiceType .active a").attr('data-type'),e.pn);
	    });
	}
	/**
	 * 搜索结果分页
	 * @param  {[type]} pagenum [description]
	 * @return {[type]}         [description]
	 */
	function searchServicePager(pagenum){
		if(pagenum==1){
			W('#itemServicePager .pages').html('');
			return;
		}
		var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
	    var pager = new Pager(W('#itemServicePager .pages'), pagenum, pn);

	    pager.on('pageChange', function(e) {
 			searchItemService(encodeURIComponent(W("#itemSearchKey").val()),e.pn);
	    });
	}
	/**
	 * 用户评论分页
	 * @return {[type]} [description]
	 */
	function userCommentPager(pagenum){
		if(pagenum==1){
			W('#userCommentPager .pages').html('');
			return;
		}
		var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
	    var pager = new Pager(W('#userCommentPager .pages'), pagenum, pn);

	    pager.on('pageChange', function(e) {
	        asynUserComment(W("#userCommentType .active a").attr('data-type'),e.pn);
	    });
	}

	function showMiniMap(){
		//初始化地图
		var el = W('#shopMiniMap');
		var item = {
			lng : el.attr('data-lng'),
			lat : el.attr('data-lat')
		}
		try{
	        var center = new AMap.LngLat(item.lng, item.lat);
	        var map = new AMap.Map("shopMiniMap",{
	            view: new AMap.View2D({//创建地图二维视口
                   center : center,
                   zoom:11,
                   rotation:0
                })
	        });
	        var marker = new AMap.Marker({
	            id:"mapMarker",
	            position:new AMap.LngLat(item.lng, item.lat),
	            icon:{stc:"https://p.ssl.qhimg.com/t01647448c59c844934.png"}.stc,
	            offset:{x:-13,y:-36}
	        });
	        marker.setMap(map);
        }catch(e){}
	}

	/**
	 * 显示搜索结果提示
	 * @return {[type]} [description]
	 */
	function showSearchRsTip(){
		var retNum = W('#searchRsTipTpl').attr('data-retnum') -0 ;
		var nowpn = W('#itemServicePager span').length>0? W('#itemServicePager span').html()-1 : 0;
		if( retNum >0 && (!nowpn || nowpn==0) ){
			W('#itemService').insertAdjacentHTML( 'afterbegin', W('#searchRsTipTpl').html() );

			var wItem = W('#itemService li').item(retNum);
			if (wItem) {
				wItem.insertAdjacentHTML( 'beforebegin', W('#dianpuRsTipTpl').html() );
			}
		}
	}

    /**
     * 根据活动类型排序
     * @return {[type]} [description]
     */
    function sortProductByHuodongType(arr){
        var typeMap = {
            // 'huodong_luyouqi1': ['4', '3'],
            'huodong_qinghui': '2'
        };
        var from = tcb.html_encode(location.search.queryUrl('from')),
            type = typeMap[from];
        type = QW.ObjectH.isArray(type) ? type : [type];
        arr.forEach(function(o, i, me){
            if (type.contains(o.huodong_type)) {
                me.splice(i,1);
                me.unshift(o);
            }
        });
    }
	/**
	 * 入口
	 * @return {[type]} [description]
	 */
	function init(){
        sortProductByHuodongType(merdata['product']);
		//商品列表
		asynItemService('',0,true,merdata);
		//推荐的商品
		asynItemServiceRecom('');

		new PlaceHolder('#itemSearchKey');
		//itemServicePager(Math.ceil(service_count/4));
		asynUserComment('',0,true);
		showMiniMap();
		checkShowMoreFenlei();
	}

	init();


tcb.bindEvent(document.body, {
    // 最小化底部导航
    '.client-bottom-nav .close': function(e){
        e.preventDefault();

        QW.Cookie.set('CLIENT_BOTTOM_NAV_HIDDEN', '1', {'expires':30*24*3600*1000, 'domain':'.bang.360.cn', 'path':'/' });


        W('.client-bottom-nav').slideUp(400, function(){
            W('.client-bottom-nav-upbutton').show();
        });
    },
    // 联系我们
    '.client-bottom-nav .lianxiwomen': function(e){
        e.preventDefault();

        tcb.alert("联系我们", '<div style="padding:10px 20px;line-height:2; "><h3 style="font-size:14px; font-weight:bold;margin-bottom:8px">您可以通过以下方式联系我们：</h3><p>1. <a target="_blank" href=" http://bang.360.cn/resource/html/client_jump.html?link='+encodeURI('http://chat.5251.net/jsp_admin/client/chat_green.jsp?companyId=19024&style=41044&locate=cn')+'">在线咨询</a></p><p>2. <a target="_blank" href=" http://bang.360.cn/resource/html/client_jump.html?link='+encodeURI('http://chat.5251.net/jsp_admin/client/chat_green.jsp?companyId=19024&style=41044&locate=cn')+'">投诉及建议</a></p><p>3. 致电<strong style="color:#FF6A07; font-weight:bold">4000-399-360</strong></p><p>能为您服务是我们最大的幸福！</p></div>', { width: 400, height: 230 }, function(){ return true;});
    },
    // 恢复底部导航状态
    '.client-bottom-nav-upbutton': function(e){
        e.preventDefault();

        QW.Cookie.set('CLIENT_BOTTOM_NAV_HIDDEN', '', {'expires':30*24*3600*1000, 'domain':'.bang.360.cn', 'path':'/' });

        W('.client-bottom-nav-upbutton').hide();
        W('.client-bottom-nav').slideDown();
    }
});

function bindEvent(){
	W('#addrSearchForm').bind('submit', function(e){
		e.preventDefault();
		var _this = this;
		var ipt = W(this).one('[name="addr"]');
		var txt = ipt.val();
		if( txt =='' || txt == ipt.attr('data-default') ){
			/*ipt.focus();
			if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(ipt);*/
			ipt.val('');
			W(this).attr('action', base_url+'client/findshop'); //没有输入地址时跳转到区县筛选
			setTimeout( function(){ W(_this)[0].submit(); },100);
		}else{
			W(this).attr('action', base_url+'client/distance');
			setTimeout( function(){ W(_this)[0].submit(); },100);
		}
	});
}

function initSubMenu(){
	var offTop = W('#shopSubMenuHolder').getRect().top;
    //子菜单切换
    W('#shopSubMenu').delegate('.m-item', 'click', function(e){
    	e.preventDefault();
    	var w_this = W(this);
    	if(w_this.hasClass('curr')){
    		return false;
    	}

    	w_this.addClass('curr').siblings('.curr').removeClass('curr');
    	var rel = w_this.attr('data-rel');

    	if(rel == 'prd-list'){
    		W('.shop-section').show();
    		W('.shop-section[data-for="shop-recom"]').hide();
    	}else{
    		W('.shop-section').hide();
    		W('.shop-section[data-for="'+rel+'"]').show();

    		if(rel == 'shop-info'){
    			W('.shop-section[data-for="shop-recom"]').show();
    		}
    	}


    	var doc = (QW.Browser.firefox || QW.Browser.ie || /trident.*rv:/i.test(window.navigator.userAgent)) ? document.documentElement : document.body; //后面的正则为判断IE11及以上版本

    	doc.scrollTop = offTop;

    	try{
	    	var params = {
				cId : 'shop_sub_menu',
				c : monitor.util.getText( this ) //获取点击元素文本
			};

			//tcbMonitor.__log(params); //发送点击统计
		}catch(ex){}
    });

	W(window).on('load', function(e){
		fixedSubMenu();
	});
	W(window).on('resize', function(e){
		fixedSubMenu();
	});
	W(window).on('scroll', function(e){
		fixedSubMenu();
	});
}

function fixedSubMenu(){
	var subMenu = W('#shopSubMenu');
	var subMenuHolder = W('#shopSubMenuHolder');

	var y = Dom.getDocRect().scrollY;
	var offTop = subMenuHolder.getRect().top;

	if( !(QW.Browser.ie && QW.Browser.ie=="6.0") ){
		if( y < offTop ){
			if(subMenu.css('position') == 'fixed'){
				subMenu.css('position', 'absolute');
			}
		}else{
			if(subMenu.css('position') != 'fixed'){
				subMenu.css('position', 'fixed');
			}
		}
	}
}

function initAddrSearch(obj){
	new AddrSuggest(obj, {
		'showNum' : 6,
		'onSelect' : doAddrSearch,
		'requireCity' : function(){ return W('#citySelector .sel-city .sel-txt').html() || '' }
	});
}

function doAddrSearch(txt){
	W('#addrSearchForm').fire('submit');
}

//右侧IM聊天提示
var imHasLoadCheck;
function showTalkIMTip(){
	var talkOnIm = W('.talk-on-im');

	//如果在客户端中，或者商家不在线，就不进行处理直接返回。
	if( typeof(_inclient)!='undefined'&&_inclient || talkOnIm.length==0 ){
		return false;
	}

    W('body').delegate('.talk-on-im .ti-close', 'click', function(e){
    	e.preventDefault();
    	talkOnIm.hide();
    });
    W('body').delegate('.talk-on-im .ti-talk', 'click', function(e){
    	e.preventDefault();
    	talkOnIm.hide();
    });


    imHasLoadCheck = setInterval(function(){
    	if(QIM.tongbu){
    		var  qcookie = QIM.tongbu.getTongbuCookie();
    		var st = qcookie.st? qcookie.st.c | qcookie.st.t | qcookie.st.h : false;
    		if(!st){
    			talkOnIm.show();
    			W('.contacts-footer').on('click', function(e){
			    	e.preventDefault();
			    	talkOnIm.hide();
			    });
    		}
    		clearInterval(imHasLoadCheck);
    	}
    }, 500);
}

function campareVersion(dest, src){
	if( dest == src ){return true;}

	var destarr = dest.split(/\./g),
		srcarr = src.split(/\./g);

	var rs;

	for(var i=0, n=destarr.length; i<n; i++){
		if( destarr[i] - srcarr[i] > 0 ){
			return true;
		}else if( destarr[i] - srcarr[i] < 0 ){
			return false;
		}else{
			continue;
		}
	}

}

function showOnlineJishi(){
	var version = false,
		folkStartConsult = false,
		folkExpertDetail = false;

	try{
		version = window.external.GetDiagVersion(); //FUCK IT. I hate this API. It's so stupid and awful!
	}catch(ex){
		return false;
	}

	if( version ){
		if( campareVersion( version , '2.2.0.1033') ){ // THE FolkStartConsult starts at version 2.2.0.1033
			folkStartConsult = true;
		}

		if( campareVersion( version , '2.2.0.1034') ){ // THE FolkExpertDetail starts at version 2.2.0.1033
			folkExpertDetail = true;
		}
	}

	if( folkStartConsult && _inclient){

		loadJsonp( BASE_ROOT + 'aj/get_shop_shifu/?shop_id=' + W('#onlineJishi').attr('data-shopid'), function(data){

			if( !data || !data.result || !data.result.length){
				return;
			}

			var list = data.result;
			var str =[];
			str.push( '<table><tr>' );

			for(var i=0, n=list.length; i<n; i++){
				var item = list[i];

				str.push('<td class="online-js-item">');
				str.push('<div class="js-tx"><a href="#" class="js-talk-trigger" bk="jishi-talk1"  data-jid="',item.id,'"><img src="',item.avatar,'"></a></div>');
				str.push('<div class="js-info"><a class="js-name js-talk-trigger" bk="jishi-talk2" data-jid="',item.id,'" href="#">',item.name,'</a><p title="',item.dominant,'">擅长：',item.dominant.subByte(16,'...'),'</p><p>解决：',item.deal_count,'&nbsp;&nbsp;好评：',item.solve_rate,'%</p><p>',(item.new_state!='offline'?'<a href="#" class="js-online js-talk-trigger" data-jid="'+item.id+'">我要咨询</a>':''),(folkExpertDetail?'<a href="#" class="js-services js-service-trigger" data-jid="'+item.id+'">查看服务</a>':''),'</p></div>');
				str.push('</td>');

				if( i%3==2 ){
					str.push( '</tr><tr>' );
				}
			}
			str.push( '</tr></table>' );

			W('#onlineJishi').show().query('.js-list-box').html( str.join('') );
		} );
	}
}

Dom.ready(function(){
    // cookie控制客户端底部导航的显示
    if (QW.Cookie.get('CLIENT_BOTTOM_NAV_HIDDEN')) {
        W('.client-bottom-nav-upbutton').show();
    } else {
        W('.client-bottom-nav').show();
    }

    //im交谈提示
    showTalkIMTip();

    if(W('#addrSearchForm').length>0){ //只在有相关搜索框时才触发相应逻辑
        bindEvent();
        initAddrSearch('#addrSearchForm .addr-ipt');
        // 激活面板选择
        new bang.AreaSelect({
            //when initial, set the default addr.
            'data':{
                'areacode': window.location.search.queryUrl('area_id')||'',
                'areaname': window.location.search.queryUrl('areaname')||''
            },
            'urlhost' : 'http://bang.360.cn/',
            // 城市选择时触发
            'onCitySelect': function(data){
                //reset form data
                W('#addrSearchForm [name="cityname"]').val( data.cityname );
                W('#addrSearchForm [name="city"]').val( data.citycode );
                W('#addrSearchForm [name="areaname"]').val( '' );
                W('#addrSearchForm [name="area_id"]').val( '' );

                //set cookie.
                QW.Cookie.set('CITY_NAME', data.cityid+'|'+data.citycode+'|'+data.cityname,{'expires':30*24*3600*1000, 'domain':'.bang.360.cn', 'path':'/' });
                new Image().src = "/aj/qiehuan_city/?citycode=" + data.citycode;  //Do this make the browser city cookie change.

                //清空当前搜索项
                W('#addrSearchForm [name="addr"]').val('');
                //切换区县
                doAddrSearch();
            },
            // 区县选择时触发
            'onAreaSelect': function(data){
                //reset form data
                W('#addrSearchForm [name="cityname"]').val( data.cityname ||'' );
                W('#addrSearchForm [name="areaname"]').val( data.areaname ||'' );
                W('#addrSearchForm [name="area_id"]').val( data.areacode ||'' );

                //清空当前搜索项
                W('#addrSearchForm [name="addr"]').val('');
                //切换区县
                doAddrSearch();
            },
            // 商圈选择时触发
            'onQuanSelect': function(data){

            }
        });
    }

    if(W('#shopSubMenu').length>0){
    	initSubMenu();
	}

	showOnlineJishi();

    if (document.location.hash==='#viewphone') {
        W('.see-phone').click();
    }
    if (document.location.hash==='#viewcomment') {
        W('#shopSubMenu li').item(1).click();
    }
});
})();

function appendComment(obj,tip){
	if(obj&&obj.comment_id){
		return '<div class="rate-append break">'+
			'<strong>追加评论：</strong>'+(obj.comment_content.encode4Html()||tip) +
			'<i></i>'+
		'</div>';
	}else{
		return '';
	}
}

function tranceString(str, len, more){
	var len = len || 50;
	var more = more || '... <a href="#" bk="pd-desc-more" class="link-desc-more">展开</a>';
	var str = str.replace(/&nbsp;/ig,' ');
	if(str.length > len){
		return str.substr(0, len) + more;
	}else{
		return str;
	}
}

//清灰活动，高亮标题
function prdNameSpecDeal(ptitle){
	return ptitle.replace('【29.9元清灰活动】', '<span style="color:#f00;font-family:arial" class="cuxiao">【29.9元清灰活动】</span>')
				.replace('【路由器上门安装调试活动】', '<span style="color:#f00;font-family:arial" class="cuxiao">【路由器上门安装调试活动】</span>')
				.replace('【购路由器+上门调试安装】', '<span style="color:#f00;font-family:arial" class="cuxiao">【购路由器+上门调试安装】</span>')
				.replace('【系统安装活动】', '<span style="color:#f00;font-family:arial" class="cuxiao">【系统安装大优惠】</span>')
                .replace('【513XP裸奔日】', '<span style="color:#f00;font-family:arial" class="cuxiao">【513XP裸奔日】</span>')
                .replace('【519手机健康日】', '<span style="color:#f00;font-family:arial" class="cuxiao">【519手机健康日】</span>');
}
function hideMobile(tel){
    if(!tel) return '';
    return tel.replace(/(\d{3})(\d{4})(\d{4})/, "$1****$3").replace(/(\d+\-)?(\d+)\d{4}/, "$1$2****");
}
