
	(function(){
        document.domain = "360.cn";
		function init_load()
		{
			var len = W(".p-service li").length;			
			if (len == 1)
			{
				W(".p-service li").item(0).fire('click');
			}
		}
		
        var fix_position_top;
		function fixPosition(element){

			fix_position_top = element.getXY()[1];
	        W(window).on('scroll', function() {
	            var scrolls = document.body.scrollTop||document.documentElement.scrollTop;
	            if (scrolls > fix_position_top) {
	                if (window.XMLHttpRequest) {
	                    element.css({
	                        'position': 'fixed',
	                        'z-index':10000,
	                        'top': 0
	                    }); 
	                    element.addClass("nav-fixed");
	                      
	                } else {
	                    element.css({
	                    	'position': 'absolute',
	                    	'z-index':10000,
	                        'top': scrolls
	                    }); 
	                    element.addClass("nav-fixed");   
	                }
	                W("#imShow").show();
	            }else {
	                element.css({
	                    position: 'absolute',
	                    top: fix_position_top
	                });   
	               element.removeClass("nav-fixed"); 
	                W("#imShow").hide();
	            }                       
	        });
		}
        function resetFixPositionTop(wEl){
            fix_position_top = wEl.getXY()[1];
        }

		fixPosition(W('.tit-container'));


		var dataListCache = {};
		//获得用户评价
		function asynUserComment(pn,flag){
			//type = type|| "";
			pn = pn || 0;
			flag = flag|| false;

			var html = "",
				item;
			
			var params =  "pagesize=10&shop_id="+shop_id+"&pn="+pn+"&itemid="+product_id+"&product_id="+product_idd;

			var domTpl = W('#userCommentDetailTpl').length  ? W('#userCommentDetailTpl') :W('#userCommentDetailTpl2')

			if(dataListCache[params]){

				var _data = dataListCache[params];
				flag&&userCommentPager(Math.ceil(_data.page.comm_total/_data.page.pagesize));
				var func = domTpl.html().trim().tmpl();
				html = func(_data);
				W("#userComment").html(html);

			}else{
				loadJsonp(BASE_ROOT + "ajproduct/getitem_pingjia/?"+ params,function(ret){
					if(parseInt(ret.errno,10)!==0){
						html = '<div class="li-nodata">该商品暂无评价。</div>';
					}else{
						
						if(ret.result.length==0){
							html='<div class="li-nodata">该商品暂无评价。</div>';
						}else{
	                        if (ret['result'] && ret['result'].length) {
	                            ret['result'].forEach(function(item){
	                                item['order_id'] = item['order_id'].replace(/^(\d{9})\d+(\d{4})$/, '$1******$2');
	                            });
	                        }

							dataListCache[params] = ret;
							flag&&userCommentPager(Math.ceil(ret.page.comm_total/ret.page.pagesize));
							var func = domTpl.html().trim().tmpl();
							html = func(ret);
						}

					}

					W("#userComment").html(html);

				})

			}	
			
		}
		function userCommentPager(pagenum){
			if(pagenum==1){
				W('#userCommentPager .pages').html('');
				return;
			}
			var pn = parseInt(location.hash.replace('#', '').queryUrl('pn'), 10) || 0;
		    var pager = new Pager(W('#userCommentPager .pages'), pagenum, pn);

		    pager.on('pageChange', function(e) {
		        asynUserComment(e.pn);
		    });
		}

		function showShopDetail(){
			var content = W('#shopInfoTpl').html().trim().tmpl();
			content = content({});

			var config = {
				"withMask": true,
				"posCenter": true,
				"className":"shopinfo-box", 
				"header": '<a href="#" class="close-pop-btn pngfix">关闭</a>',
                "body": content
			}

			var panel = new QW.BasePanel(config);

            panel.show(null, null);

            W(panel.oHeader).one('.close-pop-btn').on('click', function(e){
            	e.preventDefault();
            	panel.hide();
            });
		}

		var shopinfoTimer = null;
		function showShopDetailFloat(show, rect){			
			var box = W('.shopinfo-box-float');
			if( !box.length ){
				var content = W('#shopInfoTpl').html().trim().tmpl();
				content = content({});

				box = W('<div class="shopinfo-box-float"></div>').addClass('shopinfo-box').appendTo(　W('body') ).html( content );

				box.on('mouseenter', function(e){
					showShopDetailFloat(true);
				});

				box.on('mouseleave', function(e){
					showShopDetailFloat(false);
				});
			}

			if(show){
				if( shopinfoTimer ){ clearTimeout( shopinfoTimer ); shopinfoTimer=null; }

				box.show();

				if(rect){
					box.css({
						'left' : rect.left - 200,
						'top' :  rect.top +20
					});
				}
			}else{
				var timer = setTimeout( function(){box.hide();}, 300);
				shopinfoTimer = timer;				
			}

		}
		
		asynUserComment(0,true);

        var PriceCache = {
            'price': [],
            'm_price': []
        };
		tcb.bindEvent(document.body,{
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
			'.agreement a' : function(e) {
				e.preventDefault();
				var panel = tcb.alert("360同城帮用户服务协议", W('#showUserProtocalTpl').html(), {'width':695}, function(){
		                panel.hide();
		            });
			},
			'.btn-offline':function(e){
				e.preventDefault();
			},

			'#buy_number':{
	            'keyup':function(){
	                var val = W("#buy_number").val()||"";
	                if(val&& /^[0-9]*[1-9][0-9]*$/.test(val)){
	                	val = val.substr(0,4);
	                    if(val<1){
	                    		W("#numberTips").show().fadeOut(2000);
	                        W("#buy_number").val(1)
	                        
	                    }else if(val>1000){
	                    	 W("#numberTips").show().fadeOut(2000);
	                    	 W("#buy_number").val(1000)
	                    	
	                    }
	                    
	                }else{
	                    if(val){
	                    	 W("#numberTips").show().fadeOut(2000);
	                        W("#buy_number").val(1)
	                       
	                    }  
	                }
	                
	            }
	        },
			'.mod-buy-number .ico_add':function(e){
				e.preventDefault(); 
				if(W("#buy_number").val()>999){
					W("#numberTips").show().fadeOut(2000);
					W("#buy_number").val(1000)
				}else{
					W("#buy_number").val(~~W("#buy_number").val()+1)
				}
				
			},
			'.mod-buy-number .ico_sub':function(e){
				e.preventDefault();
				if(W("#buy_number").val()>1){
					W("#buy_number").val(~~W("#buy_number").val()-1)
				}
				
			},
            // 选择服务方式
			'.p-service ul li':function(e){
				e.preventDefault();
				var me  = W(this);
				clearInterval(timer);
				W('.p-service').query('li').removeClass('blinkbg');

				me.ancestorNode('ul').query('li').removeClass('cur');
				me.addClass('cur');

                // 设置服务方式
                W('[name="o_server_method"]').val(me.query('em').attr('data-type'));

                // 多属性分类下，此cache有效
                if (PriceCache['price'].length) {
                    // 设置商品价格
                    setProductPrice(PriceCache['price'], PriceCache['m_price']);
                    W(".service-p-msg-info").hide();
                    return;
                }

				var price = parseFloat(W("#product_price_o").val());
                if (price>=0) {
                    price = price*100;
                    var fee = W('.p-service .cur').query('em').html()*100;
                    var all_money = (price +fee)/100 + '';
                    if(/^\d*\.\d$/.test(all_money)){
                        all_money = all_money +"0";
                    }else if(/^\d*$/.test(all_money)){
                        all_money = all_money +".00";
                    }
                    W("#product_price").html(all_money);
                }
				W(".service-p-msg-info").hide();
			},
            // 选择分类
            '.p-cate ul li':function(e){
                e.preventDefault();
                var me  = W(this);

                var kk = me.ancestorNode('ul').siblings('label').html();
                if (timerList && timerList[kk]) {
                    clearInterval(timerList[kk]);
                }

                var wCurCate = me.ancestorNode('.p-cate');
                // 多属性（分类）
                if(product_attr_info&&product_attr_info.length){
                    // 不能被选择状态~
                    if (me.hasClass('disabled-selected')) {
                        return;
                    }
                    var selectedAttr = [];
                    // 点击已被选中状态的li
                    if (me.hasClass('cur')) {
                        me.removeClass('cur');
                    } 
                    // 点击没有被选中的li
                    else {
                        me.ancestorNode('ul').query('li').removeClass('blinkbg').removeClass('cur');
                        me.addClass('cur');
                    }
                    var wPCate = W('.p-cate');
                    wPCate.forEach(function(el, i){
                        var wItem = W(el),
                            wCur = wItem.query('.cur');
                        if (wCur.length) {
                            selectedAttr[i] = wCur.attr('attr-id');
                        } else {
                            selectedAttr[i] = [];
                            wItem.query('li').forEach(function(l){
                                selectedAttr[i].push(W(l).attr('attr-id'));
                            });
                        }
                    });
                    setProductAttrUi(selectedAttr, AttrGroup, AttrList);
                    var attrGroup2 = [],
                        AttrGroup_itemstr = AttrGroup.map(function(item){return item.join('');});
                    arrCombinedSequence(selectedAttr).forEach(function(a){
                        a = a.join('');
                        if (AttrGroup_itemstr.contains(a)) {
                            attrGroup2.push(a);
                        }
                    });

                    var price_arr = [],
                        m_price_arr = [];
                    product_attr_info.forEach(function(item){
                        if(attrGroup2.contains(item['attr_id'])){
                            price_arr.push(item['price']);
                            m_price_arr.push(item['m_price']);
                        }
                    });
                    PriceCache['price'] = price_arr;
                    PriceCache['m_price'] = m_price_arr;

                    // 设置商品价格
                    setProductPrice(price_arr, m_price_arr);
                    W(".cate-p-msg-info").hide();
                    return;
                }

                var wLis = me.ancestorNode('ul').query('li');
                wLis.removeClass('blinkbg').removeClass('cur');
                me.addClass('cur');

                var n_price = parseFloat(wLis.filter('.cur').attr('attr-price'));
                if (n_price>=0) {
                    W("#product_price_o").val(n_price);
                    n_price = n_price*100;
                    var wCurService = W(".p-service .cur"),
                        fee = 0;
                    if (wCurService && wCurService.length) {
                        fee = wCurService.query('em').html()*100;
                    }
                    var all_money = (n_price + fee)/100 + '';
                    if(/^\d*\.\d$/.test(all_money)){
                        all_money = all_money +"0";
                    }else if(/^\d*$/.test(all_money)){
                        all_money = all_money +".00";
                    }
                    W("#product_price").html(all_money);
                }
                W(".cate-p-msg-info").hide();
            },            
			'#p-tab-list li':function(e){
				e.preventDefault();
				var me  = W(this),
					id = me.attr('data-id');
				me.ancestorNode('ul').query('li').removeClass('curr');
				me.addClass('curr');
				W('.tab-wrap').hide();
				W("#"+id).show();

			},
			'a.see-phone':function(e){
				e.preventDefault();
				//W("#detail").addClass('detail show');
				W(this).siblings(".xd-baozhang-tip").show();
				W(this).hide();
				var tel = W(this).attr('data-tel');
				W('.contact strong').html(tel);
				new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=product" +( typeof(_inclient)!='undefined'&&_inclient ? '&inclient=1' : '' );
			},
			//分享
			'#shareShop' : function(e){
				e.preventDefault();	
				var _this = W(this);
				shopFunc.shareLink(_this, 'product');
			},
			//发送到手机
			'#sendToPhone' : function(e){
				e.preventDefault();	
				var _this = W(this);
				shopFunc.sendToPhone(_this, 'product');
			},
			'#viewBigMap': function(e){
				e.preventDefault();

				new bigMap().show(W(this).attr('data-shopid'), window._inclient? true : false);

			},
			'.show-real-mobile' : function(e){
				e.preventDefault();
				var tel = W(this).attr('data-tel');
				W(this).siblings('.mobile-box').html( tel + '&nbsp;&nbsp;<span href="#" class="buy-pay-offline">免费登记预约信息，服务遇问题360同城帮先赔</span>' ).addClass('real-tel').addClass('pngfix').attr('title', W(this).attr('title'));
				W(this).hide();
				new Image().src=BASE_ROOT+"aj/gshopmo/?shopid="+shop_id+"&mobile="+tel+"&from=dianpudetail";
			},
			'.show-shop-info' : function(e){
				e.preventDefault();
				showShopDetail();
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
            '.hot-sale .pre-page' : function(e){
            	e.preventDefault();
            	var bst = W('.hot-sale .sale-prd')[0].scrollTop;
            	var stepDs = W('.hot-sale .sale-prd').getRect().height;
            	if(bst> 0){
            		W('.hot-sale .sale-prd').animate({ scrollTop: bst-stepDs }, 300);
            	}
            },
            '.hot-sale .next-page' : function(e){
            	e.preventDefault();

            	var bst = W('.hot-sale .sale-prd')[0].scrollTop;
            	var stepDs = W('.hot-sale .sale-prd').getRect().height;
            	if(1){
            		W('.hot-sale .sale-prd').animate({ scrollTop: bst+stepDs }, 300);
            	}
            },
            '.dp-more-info' : {
            	'mouseenter' : function(e){
            		var w_this = W(this);
            		showShopDetailFloat(true, w_this.getRect() );
            	},
            	'mouseleave' : function(e){
            		showShopDetailFloat(false);
            	}
            },
            '.product-memory-more-attr': function(e){
                e.preventDefault();

                W('.p-cate').show();
                W(this).hide();

                // 重新设置下边商品详情tab的位置
                W('.tit-container').css({
                    'position': 'static'
                });
                resetFixPositionTop(W('.tit-container'));
            },
            // 切换服务方式
            '.p-buy-info2-nav-li': function(e){
                e.preventDefault();

                var wMe = W(this);

                if (wMe.hasClass('disabled')) {
                    return ;
                }
                wMe.addClass('selected').siblings().removeClass('selected');

                W('.p-buy-info2-cont li').hide().item(wMe.attr('data-index')).show();
            },
            // 选择支付方式
            '.pay-method': function(e){
                var wMe = W(this);

                if (wMe.val()=='wangyin') {
                    W('.bank-selector-wrap').show();
                } else {
                    W('.bank-selector-wrap').hide();
                }
            },
            // 切换
            '.p-buy-info3-nav li': function(e){
                e.preventDefault();

                var wMe  = W(this);

                if (wMe.hasClass('disabled-selected')) {
                    return;
                }

                var kk = wMe.ancestorNode('ul').siblings('label').html();
                if (timerList && timerList[kk]) {
                    clearInterval(timerList[kk]);
                }

                var wLis = wMe.ancestorNode('ul').query('li');
                wLis.removeClass('blinkbg').removeClass('cur');
                wMe.addClass('cur');

                var ind = wMe.attr('data-index');
                if (ind=='0') {
                    W('.p-buy-info2-cont-buy-form').hide();
                    W('.p-buy-info2-cont-pay-form').show();
                    W('.p-buy-info3-item1-desc').show();
                    W('.p-buy-info3-item2-desc').hide();
                } else {
                    W('.p-buy-info2-cont-pay-form').hide();
                    W('.p-buy-info2-cont-buy-form').show();
                    W('.p-buy-info3-item1-desc').hide();
                    W('.p-buy-info3-item2-desc').show();
                }

            },
            '.p-buy-info2-cont-ipt': {
                'focus': function(e){
                    var wMe = W(this),
                        val = wMe.val().trim(),
                        def_text = wMe.attr('placeholder');

                    wMe.removeClass('default-text');

                    if (val==def_text) {
                        wMe.val('');
                    }
                },
                'blur': function(e){
                    var wMe = W(this),
                        val = wMe.val().trim(),
                        def_text = wMe.attr('placeholder');

                    if (!val || val==def_text) {
                        wMe.addClass('default-text').val(def_text);
                    }
                }
            }
		});
        // 提交订单
        W('.p-buy-info2-cont-pay-form, .p-buy-info2-cont-buy-form').on('submit', function(e){
            e.preventDefault();
            var flag = true;
            var wMe = W(this);

            // 服务方式
            var wServerMethod = wMe.query('[name="o_server_method"]'),
                server_method = wServerMethod.val();
            if (!server_method) {
                W(".service-p-msg-info").show();
                var wS = W('.p-service'),
                    list = wS.query('li');
                list.addClass('blinkbg');

                var n = 0;

                var kk = wS.query('label').html();
                if (timerList[kk]) {
                    clearInterval(timerList[wS.query('label').html()]);
                }
                timerList[kk] = setInterval(function(){
                    n %2 ? list.removeClass('blinkbg'):list.addClass('blinkbg');
                    n = n +1;
                    if(n> 9){
                        clearInterval(timerList[kk]);
                        n = 0;
                    }
                    
                },180);
                flag = false;
            }
            // 价格
            var price = W('#product_price').html().trim();
            wMe.query('[name="o_summoney"]').val(parseInt(price)>0 ? price : 0);

            // 银行代码
            var wPayMethod = wMe.query('.pay-method:checked');
            if (wPayMethod.length) {
                var pay_method = wPayMethod.val();
                wMe.query('[name="bank_code"]').val(pay_method == 'wangyin' ? wMe.one('.bank-selector').val() : pay_method);
            }

            // 设置商品属性id
            var attr_id = W('.p-cate').map(function(el, i){
                var wP = W(el),
                    wCur = wP.query('.cur');
                if (wCur.length) {
                    return wCur.attr('attr-id');
                } else {
                    var list2 = wP.query('li');
                    list2.addClass('blinkbg');

                    var n2 = 0;

                    var kk = wP.query('label').html();
                    if (timerList[kk]) {
                        clearInterval(timerList[wP.query('label').html()]);
                    }
                    timerList[kk] = setInterval(function(){
                        n2 %2 ? list2.removeClass('blinkbg'):list2.addClass('blinkbg');
                        n2 = n2 +1;
                        if(n2> 9){
                            clearInterval(timerList[kk]);
                            n2 = 0;
                        }
                    },180);

                    flag = false;
                }
            }).join('');
            if (attr_id) {
                wMe.query('[name="attrid"]').val(attr_id);
            }

            // 手机
            var wTel = wMe.one('[name="buyer_mobile"]');
            if(wTel.val().trim()==wTel.attr('placeholder') || wTel.val().trim() == '' || !tcb.validMobile(wTel.val())){
                wTel.shine4Error();
                wTel.focus();
                return false;
            }

            if (flag) {
                // if (window._inclient && wMe.one('[name="pay_method"]').val()==1) {
                //     var url = attr_id 
                //             ? BASE_ROOT + "torder/info/?itemid="+W('#PProducrId').val()+"&from=details_product&num="+W('#buy_number').val() +"&met="+ server_method + '&paymode=' + wMe.one('[name="pay_method"]').val() + '&attrid=' + attr_id 
                //             : BASE_ROOT + "torder/info/?itemid="+W('#PProducrId').val()+"&from=details_product&num="+W('#buy_number').val() +"&met="+ server_method + '&paymode=' + wMe.one('[name="pay_method"]').val() ;
                //     location.href= url + '&inclient=1' + ( QW.Cookie.get('C_RUNIN_LDS')==1? '&inludashi=1' : '');
                // } else {
                    QW.Ajax.post(this, function(data){
                        data = QW.JSON.parse(data);
                        if (data['errno']==0) {
                            var order_id = data.result;

                            //如果是手机支付，不跳转
                            if(pay_method == 'mobile'){
                                var qrCodeSrc = BASE_ROOT + 'torder/qrcode/?order_id=' + order_id;
                                tcb.alert("手机支付宝",'<div style="padding:10px;"><h2 style="font-weight:bold; text-align:center">请用手机扫描下面的二维码进行支付</h2><div style="text-align:center"><img style="background:url(https://p.ssl.qhimg.com/t017ee3be501e423c98.gif) no-repeat center" width="220" height="220" src="'+qrCodeSrc+'"></div></div>', {
                                    width:300,
                                    height:350
                                }, function(){return true});

                                return; 
                            }
                            
                            //如果是微信支付，不跳转
                            if(pay_method == 'WXPAY_JS'){
                                var qrCodeSrc = BASE_ROOT + 'torder/qrcode/?order_id=' + order_id;
                                tcb.alert("微信支付",'<div style="padding:10px;"><h2 style="font-weight:bold; text-align:center">请用手机扫描下面的二维码进行支付</h2><div style="text-align:center"><img style="background:url(https://p.ssl.qhimg.com/t017ee3be501e423c98.gif) no-repeat center" width="220" height="220" src="'+qrCodeSrc+'&type=weixin"></div></div>', {
                                    width:300,
                                    height:350
                                }, function(){return true});

                                return; 
                            }

                            // 客户端在线支付
                            if (window._inclient && wMe.one('[name="pay_method"]').val()==1) {
                                window.open(document.payForm.action + '?order_id=' + order_id);

                                //弹开付款页面，打开未付款订单页
                                window.location.href = BASE_ROOT + 'torder/detail/?order_id=' + order_id + '&inclient=1#waitpay';

                                return;
                            }

                            document.payForm.order_id.value = order_id;
                            document.payForm.submit();
                        } else {
                            alert(data['errmsg']);
                        }
                    });
                // }
            }

        });
        
        /**
         * 设置商品价格
         * @param {[type]} price_arr   [平台售价]
         * @param {[type]} m_price_arr [门店价]
         */
        function setProductPrice(price_arr, m_price_arr){
            var max_price = parseFloat(Math.max.apply(null, price_arr)),
                min_price = parseFloat(Math.min.apply(null, price_arr)),
                m_max_price =  parseFloat(Math.max.apply(null, m_price_arr)),
                m_min_price =  parseFloat(Math.min.apply(null, m_price_arr));

            // 服务方式中附加的服务费
            var wCurService = W(".p-service .cur"),
                fee = 0;
            if (wCurService && wCurService.length) {
                fee = wCurService.query('em').html()*100;
            }

            W("#product_price_o").val(max_price);

            var price = '',
                m_price = '';
            // 单一价格
            if (max_price==min_price) {
                max_price = (max_price*100 + fee)/100 + '';
                m_max_price = (m_max_price*100 + fee)/100 + '';
                if(/^\d*\.\d$/.test(max_price)){
                    max_price   = max_price +"0";
                    m_max_price = m_max_price+"0";
                }else if(/^\d*$/.test(max_price)){
                    max_price   = max_price +".00";
                    m_max_price = m_max_price+".00";
                }
                price = max_price;
                m_price = m_max_price;
            }
            // 价格区间
            else {
                max_price = (max_price*100 + fee)/100 + '';
                min_price = (min_price*100 + fee)/100 + '';
                m_max_price = (m_max_price*100 + fee)/100 + '';
                m_min_price = (m_min_price*100 + fee)/100 + '';
                if(/^\d*\.\d$/.test(max_price)){
                    max_price   = max_price +"0";
                    min_price   = min_price +"0";
                    m_max_price = m_max_price+"0";
                    m_min_price = m_min_price+"0";
                }else if(/^\d*$/.test(max_price)){
                    max_price   = max_price +".00";
                    min_price   = min_price +".00";
                    m_max_price = m_max_price+".00";
                    m_min_price = m_min_price+".00";
                }
                price = min_price + '-' + max_price;
                m_price = m_min_price + '-' + m_max_price;
            }
            W("#product_price").html(price);
            W('.price-orig del').html('¥'+m_price);
        }

        /**
         * 设置商品属性的ui状态
         * @param {[type]} selectedAttr [description]
         */
        function setProductAttrUi(selectedAttr, AttrGroup, AttrList){
            var SelectableAttr = [],
                AttrGroup_itemstr = AttrGroup.map(function(item){return item.join('');});

            var selectedAttr2 = arrCombinedSequence(selectedAttr);
            AttrList.forEach(function(item, i){
                SelectableAttr[i] = [];

                item.forEach(function(item2, i2){
                    selectedAttr2.forEach(function(sitem){
                        var temp_arr = [];

                        temp_arr = temp_arr.concat(sitem.slice(0, i), item2, sitem.slice(i+1));

                        if (AttrGroup_itemstr.contains(temp_arr.join('')) && !SelectableAttr[i].contains(item2)) {
                            SelectableAttr[i].push(item2);
                        }
                    });
                });
            });

            var wPCate = W('.p-cate');
            wPCate.forEach(function(el, i){
                W(el).query('li').forEach(function(eli){
                    var wLi = W(eli),
                        attr_id = wLi.attr('attr-id');
                    // 设置那些不能被选择的属性
                    if (!SelectableAttr[i].contains(attr_id)) {
                        wLi.addClass('disabled-selected');
                    } else {
                        wLi.removeClass('disabled-selected');
                    }

                    if(attr_id === selectedAttr[i]){
                        wLi.addClass('cur');
                    }
                });
            });
        }
        /**
         * 将数组转换成组合序列
         * @param  {[type]} TwoDimArr [description]
         * @return {[type]}              [description]
         */
        function arrCombinedSequence(TwoDimArr){
            var ConvertedArr = [], // 转换后的二维数组
                cc = 1; // 转换后的二维数组的数组长度

            var TwoDimArr_safe = TwoDimArr.map(function(arr){
                return (arr instanceof Array) ? arr : [arr];
            });
            TwoDimArr_safe.forEach(function(arr){
                cc = cc*arr.length;
            });

            var kk = 1;
            TwoDimArr_safe.forEach(function(arr, i){
                var len = arr.length;
                cc = cc/len;
                if (i==0) {
                    arr.forEach(function(item){
                        for(var j=0; j<cc; j++){
                            ConvertedArr.push([item]);
                        }
                    });
                } else {
                    var pos = 0;
                    for(var k=0; k<kk; k++){
                        arr.forEach(function(item){
                            for(var j=0; j<cc; j++){
                                ConvertedArr[pos].push(item);
                                pos++;
                            }
                        });
                    }
                }
                kk = kk*len;
            });

            return ConvertedArr;
        }

        Dom.ready(function(){
            init_load();

            // 此条件在多属性选择情况下有效
            if(product_attr_info&&product_attr_info.length){
                var AttrGroup = product_attr_info.map(function(item){
                    return item['attr_info']['group'];
                });
                var AttrList = [];
                QW.ObjectH.map(product_attr_list, function(item){
                    AttrList.push(QW.ObjectH.keys(item['attr']));
                });

                window.AttrGroup = AttrGroup;
                window.AttrList = AttrList;

                var attr_index = recommend_attr ? parseInt(recommend_attr) : 0;
                attr_index = attr_index ? attr_index : 0;
                if (product_attr_info[attr_index]['attr_info']) {
                    var selectedAttr = product_attr_info[attr_index]['attr_info']['group'];

                    setProductAttrUi(selectedAttr, AttrGroup, AttrList);
                
                    PriceCache['price'] = [product_attr_info[attr_index]['price']];
                    PriceCache['m_price'] = [product_attr_info[attr_index]['m_price']];
                }
            }

        });
	}());
