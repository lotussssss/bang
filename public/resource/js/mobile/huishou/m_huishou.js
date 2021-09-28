/**
 * 执行入口
 * @return {[type]} [description]
 */
$(function(){

	var _fromso = queryUrl(window.location.href, 'from')||''; //是否有来源

	var _brandListCache = {};

	var _shopListCache = {};

    var SwipeSection = window.Bang.SwipeSection;


    $.bindEvent(document.body, {
		// 以旧换新，删除旧机
		'.product-item-old-del': function(e){
			e.preventDefault();

			var wMe = $(this),
				assess_key = wMe.attr('assess_key'),
				wItem = wMe.closest('.product-item-old');

			$.post('/huishou/doDelCart', {"assess_key" : assess_key}, function(res){
				res = JSON.parse(res);
				if (!res['errno']) {
					var wSib = wItem.siblings('.product-item-old');
					var url_query = $.queryUrl(window.location.search);

					//如果购物车中还有机器
					if (wSib.length > 0) {
						//if (url_query['assess_key']) {
						//	window.location.href = tcb.setUrl('/m/pinggu_shop', {
						//		'newproductid': url_query['newproductid'],
						//		'from': url_query['from'],
						//		'from_hdhx': url_query['from_hdhx']
						//	});
						//	return;
						//}

                        wItem.css({
                            'height': wItem.height()
                        });
						wItem.animate({
                            'opacity': 0,
                            'height': '0px'
                        }, 400, function () {
							wItem.remove();
							$('.btn-add-more').show();
						});
						var res_obj = eval(res['result']);

						//三星以旧换新补贴
						var samsung_butie_price = $('.samsung-butie').attr('data-butie-price');
						res_obj.new_machine_price -= samsung_butie_price||0;

						var str = '换个新' + res_obj.model_name + '仅需：<span class="final-price" data-price="' + res_obj.new_machine_price + '">' + res_obj.new_machine_price + '元</span>';
                        if (window.__HD_ID=='8'){
                            str = '换个' + res_obj.model_name + '仅需：<span class="final-price" data-price="' + res_obj.new_machine_price + '">' + res_obj.new_machine_price + '元</span>';
                        }
						if (res_obj.new_machine_price<0) {
							str = '除了全新' + res_obj.model_name + '外您还能获得： <span class="final-price" data-price="' + Math.abs(res_obj.new_machine_price) + '">' + Math.abs(res_obj.new_machine_price) + '元 ';
                            if (window.__HD_ID=='8'){
                                str = '除了' + res_obj.model_name + '外您还能获得： <span class="final-price" data-price="' + Math.abs(res_obj.new_machine_price) + '">' + Math.abs(res_obj.new_machine_price) + '元 ';
                            }
						}
						$('.final-price-desc').html(str);

						//判断当前是否显示允许上门，且订单金额不足200，如果是的话，将上门form remove掉，同时选中下一单选框
						//var check_sale_type = $('[name="sale_type"]').filter(function(){
						//	return $(this).attr('checked')=='checked';
						//});
						var check_sale_type = $('.hs-type-check-label-checked');

						ShowOffline = res_obj.show_offline;
						if(check_sale_type.attr('data-val') == 'shangmen'){
							$($('.hs-order-form-box').get(1)).find('.hs-type-check-label').click();
						}
					}
					else {
                        var m_host = window.__MHOST;

						if (url_query['newproductid']) {
                            var hx_params = {
                                'product_id': url_query['newproductid'],
                                'from_hdhx': url_query['from_hdhx']
                            };
							window.location.href = tcb.setUrl( tcb.setUrl(m_host+'/youpin/product', hx_params), window.__MUST_PASS_PARAMS||{} );
						} else {
							window.location.href = tcb.setUrl( m_host+'/m/hs', window.__MUST_PASS_PARAMS||{} );
						}
					}
				}

			});

		},
		//展示某品牌前14型号
		'.brand-list .check-item' : function(e){
			//e.preventDefault();
			//do nothing
		},
		////展示某品牌所有的型号
		//'.show-brand-all' : function(e){
		//	e.preventDefault();
        //
		//	var bid = $(this).attr('data-bid');
        //
		//	showModelList(bid, true);
		//},
		//退出搜索
		'.quit-search': function(e){
			e.preventDefault();
			$('.brand-lbox').show();
			$('.search-rs-tit').hide();
			$('.brand-lbox .brand-item-curr').fire('click');
		},


		'.shop-list-box .btn-sale' : function(e){

		},
		//手机号码输入
		'form .mobile' : {
			//'keyup' : function(e){
			//	$(this).val( $(this).val().replace(/\D/g, '') );
			//},
			'keyup change' : function(e){
                var $me = $(this),
                    mobile = $.trim( $me.val() );

                if (!tcb.validMobileInput(mobile)) {
                    $me.val( mobile.replace(/\D/g, '') );
                }

                // 验证是否换新活动手机号
                validHuanxin10086Mobile($me);

			}
		},
        // 换新重新填写手机号
        '.huanxin-no-right-tip-wrap .btn-change-mobile': function(e){
            e.preventDefault();

            tcb.closeDialog();
        },
		//银行卡号
		'form .bank-num' : {
			'keyup' : function(e){
				$(this).val( $(this).val().replace(/\D/g, '') );
			},
			'change' : function(e){
				$(this).val( $(this).val().replace(/\D/g, '') );
			}
		},
		//刷新图片验证码
		'#vcodePic' : function(e){
			var src = '/secode/?rands=' + Math.random();
			$(this).attr('src', src);
		},
		//自动将用户名复制到银行开户人姓名
		'#youjiSaleForm .username' :{
			'change' : function(e){
				var name = $.trim($(this).val());
				var bkname = $.trim( $('#youjiSaleForm .bank-user').val());
				var alipayname = $.trim( $('#youjiSaleForm .alipay-name').val());
				if( name!='' && bkname==''){
					$('#youjiSaleForm .bank-user').val( name );
				}

				if( name!='' && alipayname==''){
					$('#youjiSaleForm .alipay-name').val( name );
				}
			}
		},
		//查看上门回收商家
		'.sale-type-list .hs-shangmen' : function(e){
			/*e.preventDefault();
			if( $(this).hasClass('hs-s-disabled') ){
				return;
			}
			$('#shangmenShopList').toggle();
			mHuishou.scrollIntoView(this);*/
		},
		//查看邮寄回收商家
		'.sale-type-list .hs-youji' : function(e){
			/*e.preventDefault();
			if( $(this).hasClass('hs-s-disabled') ){
				return;
			}
			$('#youjiShopList').toggle();
			mHuishou.scrollIntoView(this);*/
		},
		//提交表单按钮
		'#submitOrderForm': function(e){
			e.preventDefault();

			// 判断是不是需要选择回收类型（上门、邮寄、到店换新）
			//var $checklabel = $('.hs-type-check-label');
			//if($checklabel&&$checklabel.length){
			//	var no_type_checked = true;
            //
			//	$checklabel.find('[type="radio"]').each(function(i, el){
			//		if($(el).prop('checked')){
			//			no_type_checked = false;
			//		}
			//	});
            //
			//	if(no_type_checked){
			//		$(window).scrollTop(999);
			//		errorAnimate($checklabel);
			//		return ;
			//	}
			//}
			var $checkedlabel = $('.hs-type-check-label-checked');
			if ( !($checkedlabel&&$checkedlabel.length) ) {
				var $checklabel = $('.hs-type-check-label');
				$(window).scrollTop(999);
				errorAnimate($checklabel);
				return ;
			}

			var $shangmenSaleForm = $('#shangmenSaleForm'),
				$youjiSaleForm = $('#youjiSaleForm'),
				$youjiSaleForm2= $('#youjiSaleForm2'),
                $daodianSaleForm = $('#daodianSaleForm'),
				$daodianBudanSaleForm = $('#daodianBudanSaleForm');
			// 上门
			if($shangmenSaleForm && $shangmenSaleForm.length && $shangmenSaleForm.height()){
				$shangmenSaleForm.trigger('submit');
			}
			// 邮寄
			if($youjiSaleForm && $youjiSaleForm.length && $youjiSaleForm.height()){
				$youjiSaleForm.trigger('submit');
			}
			if($youjiSaleForm2 && $youjiSaleForm2.length && $youjiSaleForm2.height()){
				$youjiSaleForm2.trigger('submit');
			}
            // 到店
            if($daodianSaleForm && $daodianSaleForm.length && $daodianSaleForm.height()){
                $daodianSaleForm.trigger('submit');
            }
			// 到店补单
			if($daodianBudanSaleForm && $daodianBudanSaleForm.length && $daodianBudanSaleForm.height()){
				$daodianBudanSaleForm.trigger('submit');
			}
        },
		//
		'.hs-daodian-tips-panel-wrap .btn-cancel': function(e){
			e.preventDefault();

			tcb.closeDialog();
		},
		//
		'.hs-daodian-tips-panel-wrap .btn-confirm': function(e){
			e.preventDefault();
			tcb.closeDialog();
			//判断当前购物车是否已经满了
			var cart_cnt   =  $('.hs-huanxin-top .product-item').length;
			if(cart_cnt <= 5){
				var data_params = {
					'newproductid' : $('.product-item-new').attr('data-val')
				};
				window.location.href = tcb.setUrl( tcb.setUrl('/m/hs', data_params), window.__MUST_PASS_PARAMS||{} );
			}
		},
		//点击右上角 关闭 按钮
		'.page-close' : function(e){
			e.preventDefault();
            try{ recycleApp.closeActivity(); }catch(ex){//优先尝试调用app接口关闭 - 电脑技师
            	try{//优先尝试调用app接口关闭 - 同城帮
            		myApp.closeWin();
            	}catch(ex){
					if(_fromso&&_fromso =='so'){
						window.location.href = 'http://m.so.com/';
					}else{
						//window.location.href = tcb.setUrl('/m/hs', {'from':queryUrl(window.location.href,'from'),'path':queryUrl(window.location.href,'path'),'hs_from_tob':queryUrl(window.location.href,'hs_from_tob'),'wechat_xxg':queryUrl(window.location.href,'wechat_xxg')});

						goHomePage();
					}
				}
            }
		},
		//重新评估
		'.page-restart' : function(e){
			e.preventDefault();

			//window.location.href = tcb.setUrl('/m/hs', {'from':queryUrl(window.location.href,'from'),'path':queryUrl(window.location.href,'path'),'hs_from_tob':queryUrl(window.location.href,'hs_from_tob'),'wechat_xxg':queryUrl(window.location.href,'wechat_xxg')});

			goHomePage();
		},
		//自动滚动页面到可见位置
		'.order-sale-form .ipt-txt' : function(){
			var $_this = $(this);
			setTimeout(function(){
				var stop = $_this.offset().top - $('#hsheader').height() - 20;
				$(window).scrollTop(stop);
			},100);
		},
		'#youjiNext' : function(e){
			var username = $('#youjiSaleForm').find('.username'),
				mobile = $('#youjiSaleForm').find('.mobile');

			if( $.trim(username.val()).length == 0 ){
				errorAnimate( username.focus() );
				e.preventDefault();
				return;
			}

			if( $.trim(mobile.val()).length != 11 ){
				errorAnimate( mobile.focus() );
				e.preventDefault();
				return;
			}

			//tcbMonitor.__log({cId : (_fromso?('one_'+_fromso) :'') +'m_hs_youji_1'});
		},
		'.share-to-wechat' : function(e){
			e.preventDefault();
			var box = Dialog.showBox("<img src='https://p.ssl.qhimg.com/t0193a9da3c860fbf01.png' width='100%'>");
			box.on('click', function(){
				Dialog.hide();
			});
		},
		// 到某个地方去
		'.go-somewhere-unkown': {
			'touchstart': function(e){
				e.preventDefault();
				window.go_somewhere_unkown = 0;
				var threshold = window.go_somewhere_unkown_threshold = 3000;
				setTimeout(function(){
					window.go_somewhere_unkown = threshold;
				}, threshold);
			},
			'touchend': function(e){
				e.preventDefault();
				//if(window.go_somewhere_unkown==window.go_somewhere_unkown_threshold){
					var $me = $(this);
					window.location.href = tcb.setUrl( $me.attr('data-url'), window.__MUST_PASS_PARAMS||{} );
				//}
			}
		},
		'.wx-save-pg' : function(e){
			e.preventDefault();

			Dialog.show('<div style=""><h3 style="font-size:16px;text-align:center;font-weight:normal">长按二维码，同步到微信，<wbr>下次一键估值</h3><img class="hs-qrupdate-pic" src="https://p.ssl.qhimg.com/t017ee3be501e423c98.gif" width="100%" style=""/></div>');

			var assess_key = $(this).attr('data-assesskey');

			$.get('/huishou/aj_save_pinggu/', {'assess_key':assess_key}, function(rs){
				rs = JSON.parse(rs);
				if(!rs.errno){
					$('.hs-qrupdate-pic').attr('src', rs.result);
				}else{
					alert("抱歉，出错了。" + rs.errmsg);
				}
			});
		},
        // 添加运单号
        '.add-express-no': function(e){
            e.preventDefault();
            e.stopPropagation();
            var $me = $(this);

            var $panel = $('#MHuishouAddExpressNoPanel');
            if (!$panel.length) {
                var tmpl_str = $.tmpl($.trim($('#JsMHuishouAddExpressNoPanelTpl').html()))({
                    'order_id': $me.attr('data-orderid')
                });
                $panel = $(tmpl_str);
                $panel.css({
                    'top': $(window).scrollTop()+60
                });
                $panel.appendTo('body');

                var $panel_mask = $('<div class="m-huishou-add-express-no-mask"></div>');
                $panel_mask.appendTo('body');

                // 关闭物流信息填写
                $panel
                    .find('.close')
                    .add($panel_mask)
                    .on('click', function(e){
                        e.preventDefault();

                        $panel_mask.remove();
                        $panel.remove();
                    });
                // 提交物流信息
                $panel
                    .find('form')
                    .on('submit', function(e){
                        e.preventDefault();

                        var $form = $(this);

                        var $ep_nm = $form.find('[name="express_name"]'),
                            $ep_id = $form.find('[name="express_id"]'),
                            flag = true;

                        if (!$ep_nm.val()) {
                            $.errorAnimate($ep_nm.focus());
                            flag = false;
                        }
                        if (!$ep_id.val()) {
                            $.errorAnimate($ep_id);
                            if(flag){
                                $ep_id.focus();
                            }
                            flag = false;
                        }
                        if (!flag) {
                            return;
                        }

                        $.post($form.attr('action'), $form.serialize(), function(res){
                            res = $.parseJSON(res);

                            if (!res['errno']) {
                                $me.parent().html('邮寄中');

                                $panel_mask.remove();
                                $panel.remove();
                            } else {
                                alert(res['errmsg']);
                            }
                        });
                    });
            }

            $panel.show();
            $panel_mask.show();
        },

		//预约快递
		 '.show-yuyue-kuaidi':function (e) {
			 e.preventDefault()
			 var
				 order_id = $(this).attr('data-orderid'),

				 redirect_url = window.location.href

			 // 普通邮寄回收

			 YuyueKuaidi.getGuoGuoForm (order_id, redirect_url, function (res) {

				 var
					 html_fn = $.tmpl (tcb.trim ($ ('#JsMHSSchedulePickupPanelTpl').html ())),
					 html_st = html_fn ({
						 data : {
							 province : window.__Province['name'],
							 city     : window.__City['name'],
							 area_list : res['area_list']||[],
							 mobile   : res['default_mobile'],
							 order_id : order_id,
							 url : redirect_url
						 }
					 })

				 var
					 DialogObj = tcb.showDialog (html_st, {
						 className : 'schedule-pickup-panel',
						 withClose : false,
						 middle    : true,
						 onClose:function () {
							 window.location.href = redirect_url
						 }
					 })

				 // 绑定预约取件相关事件
				 YuyueKuaidi.bindEventSchedulePickup (DialogObj.wrap, redirect_url)

			 })
		 },

        //修改快递上门时间
        '.show-xiugai-kuaidi':function (e) {
            e.preventDefault()
            var
                order_id = $(this).attr('data-orderid'),

                redirect_url = window.location.href

            // 普通邮寄回收

            YuyueKuaidi.getGuoGuoForm (order_id, redirect_url, function (res) {

                var
                    html_fn = $.tmpl (tcb.trim ($ ('#JsMHSSchedulePickupPanelTpl').html ())),
                    html_st = html_fn ({
                        data : {
                            // province : window.__Province['name'],
                            // city     : window.__City['name'],
                            // area_list : res['area_list']||[],
                            // mobile   : 111111111,
                            order_id : order_id,
                            url : redirect_url
                        }
                    })
				//
                var
                    DialogObj = tcb.showDialog (html_st, {
                        className : 'schedule-pickup-panel',
                        withClose : false,
                        middle    : true,
                        onClose:function () {
                            window.location.href = redirect_url
                        }
                    })
				 var userName = $('.form-schedule-pickup input[name="express_username"]'),
					 userTel = $('.form-schedule-pickup input[name="express_tel"]'),
					 userRegion = $('.form-schedule-pickup input[name="express_useraddr"]'),
					 userTime = $('.form-schedule-pickup input[name="express_time_alias"]'),
					 regionWrap = $('.form-schedule-pickup .region-wrap'),
					 btnWrap = $('.form-schedule-pickup .kuaidi-btn-wrap'),
					 changeTimeForm = $('.form-schedule-pickup')
				regionWrap.hide()
				btnWrap.css('margin-top','.4rem')
				changeTimeForm.attr( 'action' ,'/huishou/doUpdateExpressTime')
				userName.val(res.express_username).attr({ readonly: 'true' })
				userTel.val(res.express_tel).attr({ readonly: 'true' })
				userRegion.val(res.user_addr).attr({ readonly: 'true' })
				userTime.val(res.express_time)

				//
                 // 绑定预约取件相关事件
                YuyueKuaidi.bindEventSchedulePickup (DialogObj.wrap, redirect_url)

            })
        },

        '.js-360-danbao' : function(e){
        	e.preventDefault();
        	$.dialog.alert('<h2 style="text-align:center">360担保交易</h2><p>您寄出手机，回收款冻结至您的回收账户。360收到手机，立即打款给您。</p>');
        },
		// 工程师订单操作
		'.btn-parent-order-act': function(e){
			e.preventDefault();

			var $me = $(this),
				act = $me.attr('data-act'),
				parent_id = $me.attr('data-id'),
				now_status = $me.attr('data-status'),
				next_status= $me.attr('next-status');


			if ($me.hasClass('btn-disabled')) {
				return ;
			}

			var txt = $me.html();
			$me.addClass('btn-disabled').html('处理中...');

			var request_url = tcb.setUrl('/m/aj_xxg_parent_status', {
				'parent_id': parent_id,
				'now_status': now_status,
				'next_status': next_status
			});

			$.getJSON(request_url, function(res){
				if (!res.errno) {
					window.location.reload();
				} else {
					alert(res.errmsg);
					$me.removeClass('btn-disabled').html(txt);
				}
			});
		},
        // 工程师订单操作
        '.btn-order-act': function(e){
            e.preventDefault();

            var $me = $(this),
                act = $me.attr('data-act'),
                order_id = $me.attr('data-id'),
                status = $me.attr('data-status');

            if ($me.hasClass('btn-disabled')) {
                return ;
            }

            if (act=='quxiao'){
				var params_data = {
						'order_id' : order_id
					},
                	html = $.tmpl( $.trim($('#XxgCancelOrderTpl').html()) )(params_data);
                var dialog = tcb.showDialog(html);

                xxgCancelOrderForm(dialog.wrap.find('form'));

                return;
            }

			if(act == 'wancheng'){
				var txt = $me.html();
				$me.addClass('btn-disabled').html('处理中...');

				var request_url = tcb.setUrl('/m/aj_wancheng_order', {
					'order_id': order_id,
					'status': status
				});

				$.getJSON(request_url, function(res){
                    if (!res.errno) {
                        var msg = '<p style="font-size: 20px;">确定服务完成</p><br/><p style="color: #FF0202">';
                        switch (HUISHOU_PARTNER_TYPE) {
                            case 2:
                                msg = '旧机款将发放至用户下单的易付宝或银行卡账户.';
                                break;
                            case 3:
                                msg = '旧机款将以"支付宝红包"形式,发放至用户下单的支付宝账户.';
                                break;
                        }
                        msg += '由于近期价格波动较大,回收完成后,请尽快将手机邮寄给同城帮对应地址!</p>';
                        $.dialog.alert(msg, function () {
                            window.location.reload();
                        });
					} else {
						alert(res.errmsg);
						$me.removeClass('btn-disabled').html(txt);
					}
				});
			} else {
				var txt = $me.html();
				$me.addClass('btn-disabled').html('处理中...');

				var request_url = tcb.setUrl('/m/aj_xxg_status', {
					'order_id': order_id,
					'status': status
				});


				$.getJSON(request_url, function(res){
					if (!res.errno) {
						window.location.reload();
					} else {
						alert(res.errmsg);
						$me.removeClass('btn-disabled').html(txt);
			}
				});
			}
        },
        // 显示完整的上门地址弹窗
        '.btn-show-more-shangmen-addr': function(e){
            e.preventDefault();
            e.stopPropagation();

            var $me = $(this);

            $.dialog.alert('<p>'+$me.html()+'</p>');

            return false;
        },
        // 修改需要换新的机器
        '.js-change-newproduct': function(e) {
            e.preventDefault();

            var NewProductList = window.NewProductList;

            if ( !(NewProductList && NewProductList.length) ) {
                return ;
            }

            var product_list = [];
            $.each(NewProductList, function (i, item) {
                product_list.push({
                    'pid': item['show_info']['product_id'],
                    'name': item['show_info']['title'],
                    'img': item['show_info']['img_url_m'],
                    'price': item['price_diff']
                });
            });

            var html_str = $.tmpl($.trim( $('#JsHuanxinNewproductListTpl').html() ))({
                'product_list': product_list
            });
            tcb.showDialog(html_str);
        },
        // 立即换新
        '.js-liji-huanxin': function(e){
            e.preventDefault();

            var $me = $(this);

            var pid = $me.attr('data-id'),
                url_hash = $me.attr('href'),
                product_title = $me.attr('data-title'),
                img_name = $me.attr('data-img');

            if (!pid) {
                return ;
            }
            var request_url = tcb.setUrl('/youpin/product', {
                'product_id': pid,
                'ajax': '1'
            });
            $.getJSON(request_url, function(res){
                var selectedAttr = res['result']['product_attr'],
                    AttrGroup = [],
                    AttrList = [],
                    show_price, real_price;

                var product_attr_hash = res['result']['attr_combine'],
                    product_attr_price_hash = res['result']['attr_combine_price'];
                $.each(product_attr_hash, function(k,v){
                    product_attr_hash[k] = {
                        'product_id': v.split('product_id=')[1],
                        'show_price': product_attr_price_hash[k]['show_price'],
                        'real_price': product_attr_price_hash[k]['real_price']
                    };

                    AttrGroup.push(k.split(','));
                });
                CurProductAttrHash = product_attr_hash;
                show_price = product_attr_price_hash[selectedAttr.join(',')]['show_price'];
                real_price = product_attr_price_hash[selectedAttr.join(',')]['real_price'];

                var product_attr_storage,product_attr_color,
                    product_attr_net, product_attr_channel;
                $.each(res['result']['model_attr'], function(k, v){
                    var AttrList_sub = [];
                    switch (v['name']){
                        // 颜色
                        case '颜色':
                            product_attr_color = {
                                'pos': k,
                                'attr': [],
                                'name': v['name']
                            };
                            var color_hash = {
                                '灰色': ['https://p.ssl.qhimg.com/t01b7a462b8b1dd22a7.png', '深空灰'],
                                '黑色': ['https://p.ssl.qhimg.com/t01cfdd766e6ad4ba75.png', '黑色'],
                                '金色': ['https://p.ssl.qhimg.com/t015aff832d43be7134.png', '金色'],
                                '银色': ['https://p.ssl.qhimg.com/t0182ce4f7ce773b011.png', '银色'],
                                '白色': ['https://p.ssl.qhimg.com/t015e06ece9297f590a.png', '白色'],
                                '粉色': ['https://p.ssl.qhimg.com/t014b734b4dbb07b1cc.png', '粉色'],
                                '蓝色': ['https://p.ssl.qhimg.com/t0117c6bb967cc3c870.png', '蓝色'],
                                '绿色': ['https://p.ssl.qhimg.com/t01902e76cea14ead02.png', '绿色']
                            };
                            $.each(v['attr'], function(kk, vv){
                                var color_img  = 'https://p.ssl.qhimg.com/t015aff832d43be7134.png',
                                    color_name = vv;

                                var color = color_hash[vv];
                                if (color) {
                                    color_img  = color[0];
                                    color_name = color[1];
                                }

                                product_attr_color['attr'].push({
                                    'val':kk,
                                    'txt': color_name,
                                    'color_img': color_img
                                });
                                AttrList_sub.push(kk);
                            });
                            break;
                        // 容量
                        case '容量':
                            product_attr_storage = {
                                'pos': k,
                                'attr': [],
                                'name': v['name']
                            };
                            $.each(v['attr'], function(kk, vv){
                                vv = $.trim(vv.split('G')[0]);
                                product_attr_storage['attr'].push({
                                    'val':kk,
                                    'txt': vv
                                });
                                AttrList_sub.push(kk);
                            });
                            break;
                        // 网络
                        case '网络':
                            product_attr_net = {
                                'pos': k,
                                'attr': [],
                                'name': v['name']
                            };
                            $.each(v['attr'], function(kk, vv){
                                product_attr_net['attr'].push({
                                    'val':kk,
                                    'txt': vv
                                });
                                AttrList_sub.push(kk);
                            });
                            break;
                        // 渠道
                        case '渠道':
                            product_attr_channel = {
                                'pos': k,
                                'attr': [],
                                'name': v['name']
                            };
                            $.each(v['attr'], function(kk, vv){
                                product_attr_channel['attr'].push({
                                    'val':kk,
                                    'txt': vv
                                });
                                AttrList_sub.push(kk);
                            });
                            break;
                    }

                    AttrList.push(AttrList_sub);
                });

                var img = img_name ? img_name : 'https://p.ssl.qhimg.com/t01e6226d691579c643.png';

                var param_data = {
                    'img': img,
                    'url_hash': url_hash,
                    'product_id': pid,
                    'show_price': show_price,
                    'real_price': real_price,
                    'product_title': product_title,
                    'product_attr_storage':product_attr_storage,
                    'product_attr_color':product_attr_color,
                    'product_attr_net':product_attr_net,
                    'product_attr_channel':product_attr_channel
                };
                var content_html = $.tmpl($('#JsMHuanxinProductSelectChangeTpl').html())(param_data);
                tcb.showDialog(content_html);
                //showPanel(param_data);

                setProductAttrUi(selectedAttr, AttrGroup, AttrList);
            });
        },
        // 选择商品属性
        '.product-attr .item a': function(e){
            e.preventDefault();

            var $me = $(this),
                $cnt = $me.closest('.cnt');

            //if ($me.hasClass('disabled')) {
            //    return ;
            //}

            $cnt.find('.item a').removeClass('cur');
            $me.addClass('cur');

            // 设置属性组合商品id
            setProductId();
        },
        // 去回收页面评估旧机，换新机
        '.goto-huanxinji-btn': function(e){
            e.preventDefault();

            var $me = $(this),
                url_hash = $me.attr('href'),
                pid = $me.attr('data-pid');

            if (!pid){
                tcb.errorBlink($('.product-attr .item a'));
                return;
            }

            var url_query = $.queryUrl(window.location.search);
            var redirect_url = tcb.setUrl(window.location.href, {
                    'newproductid': pid
                });
            redirect_url = tcb.setUrl(redirect_url, window.__MUST_PASS_PARAMS||{}).replace(/%2C/ig, ',');
            window.location.href = redirect_url;
        },
        // 到店回收，选择门店
        '.daodian-addr-select-trigger': function(e){
            e.preventDefault();

            if ( tcb.cache('daodian-addr-select-section') ) {

                tcb.cache('daodian-addr-select-section', null);
                return ;
            }

            var param_data = {
                shop_list: window.__DaoDianShopList || []
            };
            var html_str = $.tmpl($('#JsMHuiShouDaoDianShopListTpl').html())(param_data);

            var $swipe = SwipeSection.getSwipeSection('.daodian-addr-select-section');
            tcb.cache('daodian-addr-select-section', $swipe);
            SwipeSection.fillSwipeSection(html_str);
            $swipe.show();
            setTimeout(function(){
                SwipeSection.doLeftSwipeSection(20, function(){});
            }, 0);

        },
        // 选择到店地址
        '.daodian-addr-select-section .daodian-shop-item': function(e){
            e.preventDefault();

            var $me = $(this),
                shop_id = $me.attr('data-id'),
                shop_price = $me.attr('data-price'),
                shop_tel = $me.attr('data-tel');

            $('.daodian-addr-select-trigger').html($me.html()).removeClass('default');
            $('[name="shop_id"]').val(shop_id);
            //var daodian_fare = shop_price ? '报销'+shop_price+'元路费' : '';
            //$('#DaodianFare').html(daodian_fare);

            var daodian_addr = '<span class="hs-daodian-addr">下单后，请您带旧机到'+$me.find('.s-name').html()+'（'+$me.find('.s-addr').html()+'）';
            //if (shop_price){
            //    daodian_addr += '，交易成功补贴'+shop_price+'元！'
            //}
            daodian_addr += '</span>';
            if (shop_tel) {
                daodian_addr += '<br> 360客服电话：<span style="color:#2e74d3" href="tel:'+shop_tel+'">'+shop_tel+'</span>';
            }
            $('#DaodianAddrTips').html(daodian_addr);

            SwipeSection.backLeftSwipeSection();
            // 清除到店地址选择section的cache
            if ( tcb.cache('daodian-addr-select-section') ) {

                tcb.cache('daodian-addr-select-section', null);
            }
        }
    });

    // document上绑定全局事件代理
    $(document).on('mousedown', function(e){
        var target = e.target,
            $target = $(target);

        var $for_check_item = $('.for-check-item');
        if ($for_check_item && $for_check_item.length && !$target.hasClass('imgs-tip-icon')) {
            $for_check_item.hide();
            $('.imgs-tip-icon-zoom-hide').removeClass('imgs-tip-icon-zoom-hide');
        }

        // 隐藏SwipeSection
        if (SwipeSection && SwipeSection.getLastSwipeSection) {
            var $lastSection = SwipeSection.getLastSwipeSection();
            if ( $lastSection && $lastSection.length && !$lastSection.find(target).length ){
                SwipeSection.backLeftSwipeSection();
                // 清除到店地址选择section的cache
                if ( tcb.cache('daodian-addr-select-section') ) {

                    tcb.cache('daodian-addr-select-section', null);
                }
            }
        }

    });

	// 选择服务方式，上门/邮寄
	$('.hs-type-check-label').on('click', function(e){
		e.preventDefault();

		var $target = $(e.target),
			$me = $(this),
			$next = $me.next();

		// 点击详细上门地址
		if ($target.hasClass('btn-show-more-shangmen-addr')) {
			return;
		}

		// 当前服务表单已经显示，则不执行后续操作
		if($next.height()){
			return ;
		}

		//判断是否为活动，还是单纯的回收
		var huodong_id = HuishouMerInfo.huodong_id;
		if(huodong_id != 0){
			//判断当前选择是否为“上门”
			if($me.attr('data-val') == 'shangmen' && !ShowOffline){
				var cart_cnt   =  $('.hs-huanxin-top .product-item').length,
					show_tip   = "亲，旧机抵扣价凑够200元，才能享受免费门换新哦！",
					btn_flag   = (cart_cnt > 5) ? 1 :0;

				var html_str = $.tmpl( $.trim($('#jsMHuishouShangmenTipsPanelTpl').html()) )({
					'btn_flag': btn_flag,
					'show_tip': show_tip
				});

				typeTipPanel = tcb.showDialog(html_str, 'hs-daodian-tips-panel-wrap');
				return;
			}
		}

		$('.hs-type-check-label').removeClass('hs-type-check-label-checked');
		$me.addClass('hs-type-check-label-checked');

		// 隐藏另一个回收方式
		$me.closest('.hs-order-form-box').siblings('.hs-order-form-box').find('.hs-type-check-label').next().hide();

		$next.show().animate({
			'opacity': 0,
			'translateY': '-'+$me.height()+'px'
		}, 0, function(){
			$next.animate({'opacity': 1,'translateY': '0'}, 400, 'ease-in', function(){
				setTimeout(function(){
					var $first = $next.find('[type="text"],[type="tel"]').first();
					var header_h = 0;//$('#hsheader').height();

					var scroll_duration = 300;
					$.scrollTo({
						endY: $me.offset()['top']-header_h-8,
						duration: scroll_duration,
						callback: function() {}
					});

					//$(window).scrollTop($me.offset()['top']-header_h-8);
					$first.focus();
				}, 100);
			});
		});
	});

    //选择星星
    $('.star-group-ready .star-item').on('click', function(e){
        e.preventDefault();
        var curIndex = $(this).index();
        $('.star-group-ready .star-item').each(function(){
            if( $(this).index() <= curIndex){
                $(this).addClass('star-item-on');
            }else{
                $(this).removeClass('star-item-on');
            }
        });

        $('.cmt-score').val( curIndex -0 +1 );
    });
    //提交评价
    $('#cmtForm').on('submit', function(e){
        e.preventDefault();
        var content = $(this).find('textarea.cmt-cnt');
        var score = $(this).find('.cmt-score').val();
        var $_F = $(this);
        if( $('.star-group-ready .star-item-on').length <= 0){
            $.errorAnimate( $('.cmt-star-box') );
            return false;
        }

        //if( content.val().length < 1 || content.val().length>255 ){
        //    $.errorAnimate( content.focus() );
        //    return false;
        //}

        $.post( $(this).attr('action'), $(this).serialize(), function(rs){
            rs = JSON.parse(rs);
            if(rs.errno){
                $.dialog.alert('抱歉，出错了。请稍后再试。' + rs.errmsg);
            }else{
                $.dialog.alert('评价成功~', function(){
                    window.location.href = tcb.setUrl(window.location.href, {
                        'comment_succ': '1'
                    });
                });
            }
        } );
    });


    // 修修哥编辑订单信息表单
    function xxgCancelOrderForm($form, before_submit, after_submit){
        $form.on('submit', function(e){
            e.preventDefault();

            var $form = $(this);

            // 订单提交前执行
            if (typeof before_submit!=='function') {
                before_submit = function($form, callback){
                    typeof callback==='function' && callback();
                };
            }
            // 订单提交后执行
            if (typeof after_submit!=='function') {
                after_submit = function(){return true;};
            }

            before_submit($form, function(){
                var $xxg_memo = $form.find('[name="xxg_memo"]');
                if ($xxg_memo && $xxg_memo.length) {
                    if (!$.trim($xxg_memo.val()).length) {
                        $.errorAnimate($xxg_memo);

                        return;
                    }
                }

                $.post($form.attr('action'), $form.serialize(), function(res){
                    res = $.parseJSON(res);

                    // 表单提交后执行，返回true继续执行默认行为，false不执行后续操作
                    if (after_submit(res)) {
                        if (!res.errno) {
                            window.location.reload();
                        } else {
                            alert(res.errmsg);
                        }
                    }
                });

            });
        });
    }


    var CurProductAttrHash;
    /**
     * 设置商品属性的ui状态
     * @param selectedAttr 当前选择商品属性
     * @param AttrGroup 所有可用属性组
     * @param AttrList 属性列表
     */
    function setProductAttrUi(selectedAttr, AttrGroup, AttrList){
        var SelectableAttr = [],
            AttrGroup_itemstr = $.map(AttrGroup, function (item) {
                return item.join('');
            });

        var selectedAttr2 = arrCombinedSequence(selectedAttr);
        $.each(AttrList, function(i, item){
            SelectableAttr[i] = [];

            $.each(item, function(i2, item2){
                $.each(selectedAttr2, function(si, sitem){
                    var temp_arr = [];

                    temp_arr = temp_arr.concat(sitem.slice(0, i), item2, sitem.slice(i+1));

                    if (tcb.arrContains(AttrGroup_itemstr, temp_arr.join('')) && !tcb.arrContains(SelectableAttr[i],item2)) {
                        SelectableAttr[i].push(item2);
                    }
                });
            });
        });
        // console.log(AttrGroup);

        var wPCate = $('.product-attr-line');
        wPCate.forEach(function(el, i){
            var $line = $(el),
                pos = parseInt($line.attr('data-pos'), 10);
            $(el).find('.item a').forEach(function(el){
                var wItem = $(el),
                    attr_id = wItem.attr('data-attrid');
                wItem.removeClass('cur').removeClass('disabled').removeClass('disabled-hover');// 移除状态
                // 设置那些不能被选择的属性
                if (!tcb.arrContains(SelectableAttr[pos], attr_id)) {
                    wItem.addClass('disabled');
                } else {
                    wItem.removeClass('disabled');
                }

                if(attr_id === selectedAttr[pos]){
                    wItem.addClass('cur');
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
            TwoDimArr_safe = [],
            cc = 1; // 转换后的二维数组的数组长度

        $.each(TwoDimArr, function(i, arr){
            TwoDimArr_safe.push((arr instanceof Array) ? arr : [arr]);
        });

        $.each(TwoDimArr_safe, function(i, arr){
            cc = cc*arr.length;
        });

        var kk = 1;
        $.each(TwoDimArr_safe, function(i, arr){
            var len = arr.length;
            cc = cc/len;
            if (i==0) {
                $.each(arr, function(x, item){
                    for(var j=0; j<cc; j++){
                        ConvertedArr.push([item]);
                    }
                });
            } else {
                var pos = 0;
                for(var k=0; k<kk; k++){
                    $.each(arr, function(x, item){
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

    // 设置商品id
    function setProductId(){
        var pid = '', attr = ['', '', '', ''];
        $('.product-attr-line').each(function(i, el){
            var $me = $(el),
                pos = parseInt($me.attr('data-pos'), 10),
                attrid = $me.find('.cur').attr('data-attrid');

            attr[pos] = attrid;
        });

        var $btn = $('.goto-huanxinji-btn'),
            attr_key = attr.join(','), show_price, real_price;
        show_price = CurProductAttrHash[attr_key]['show_price'];
        real_price = CurProductAttrHash[attr_key]['real_price'];

        $('.dialog-wrap .show-price').html('￥'+show_price);
        $('.dialog-wrap .real-price').html('京东价￥'+real_price);

        pid = CurProductAttrHash[attr_key]['product_id'];
        pid = pid?pid:'';
        $btn.attr('data-pid', pid);
    }


    // 验证是否活动内手机号
    function validHuanxin10086Mobile($mobile, callback) {
        var mobile = $.trim( $mobile.val() );
        // 10086回收换新
        if ($('body').hasClass('m-huishou-huanxin')) {
            // 输入数字位数为11+，开始验证手机号
            if (mobile.length==11) {
                if (!tcb.validMobile(mobile)) {
                    $.errorAnimate($mobile.focus());

                    typeof callback==='function' && callback();
                } else {
                    if (window.__HD_ID!='1') {
                        typeof callback==='function' && callback();

                    }
                }
            } else {
                $mobile.attr('data-not2g3g', '');
                $mobile.attr('data-novalid', '');

                typeof callback==='function' && callback();
            }
        } else {
            typeof callback==='function' && callback();
        }
    }

	if($.AddrSuggest && typeof $.AddrSuggest=='function'){
		// 地址联想
		$.AddrSuggest('#shangmenSaleForm .addr',{
			'showNum' : 6,
			'requireCity' : function(){return window.__CITY_NAME;}
		});
	}

	// 回到评估首页
	function goHomePage(){
		var step_pos = getEvaluateStepPos();
		if(step_pos){
			window.history.go(1-step_pos);
		} else {
            var url_query = $.queryUrl(window.location.search);

            var r_params = {
                'from': url_query['from'],
                '_from': url_query['_from'],
                'path': url_query['path'],
                'hs_from_tob': url_query['hs_from_tob'],
                'wechat_xxg': url_query['wechat_xxg'],
                'newproductid': url_query['newproductid']
            };
			window.location.href = tcb.setUrl( tcb.setUrl('/m/hs', r_params), window.__MUST_PASS_PARAMS||{} );
		}
	}
	// 设置评估步骤位置
	function setEvaluateStepPos(pos){
		var init_pos = 1;
		if(typeof $.fn.cookie==='function'){
			var prev_pos = getEvaluateStepPos();
			if(prev_pos!==null){
				//pos-prev_pos为1，前进；为-1，后退；为0表示刷新页面；
				if(Math.abs(pos-prev_pos)===1||pos-prev_pos===0){
					$.fn.cookie('HS_EVALUATE_STEP_POS', pos, {path:'/', expires:10});
				} else {
					$.fn.cookie('HS_EVALUATE_STEP_POS', '', {path:'/', expires:0});
				}
			} else {
				if(pos===init_pos){
					$.fn.cookie('HS_EVALUATE_STEP_POS', pos, {path:'/', expires:10});
				} else {
					$.fn.cookie('HS_EVALUATE_STEP_POS', '', {path:'/', expires:0});
				}
			}
		}
	}
	// 获取评估步骤位置
	// HS_EVALUATE_STEP_POS为空或者没有设置，返回null，否则返回其值的int类型
	function getEvaluateStepPos(){
		var ret = null;
		if(typeof $.fn.cookie==='function'){
			ret = $.fn.cookie('HS_EVALUATE_STEP_POS');
			ret = ret ? ret : null;
			ret = ret ? parseInt(ret, 10) : ret;
		}

		return ret;
	}
	// 记录进入回收评估首页
	function setMainpagePingguStepPos(){
		// 回收首页 & hash中不包含brand串
		if(window.location.href.split('?')[0].indexOf('360.cn/m/hs')!==-1
			&& tcb.getPureHash(window.location.hash).indexOf('brand')==-1){

            setEvaluateStepPos(1);
		}
	}
	setMainpagePingguStepPos();

	if(typeof(myApp)!='undefined' || typeof(recycleApp)!='undefined'){ $('.page-close').css('visibility','visible'); }

	$('#youjiSaleForm .pay-m-item').on('click', function(e){
		e.preventDefault();
		$('#youjiSaleForm .pay-m-curr').removeClass('pay-m-curr');
		$(this).addClass('pay-m-curr');
		var rel = $(this).attr('data-rel');
		$('.pay-info-box').hide();
		$('.pay-info-box[data-for="'+rel+'"]').show();
	});

	//手机型号搜索
	$('#brandSearchForm').on('submit', function(e){
		e.preventDefault();
		var kw = $.trim( $('#phoneBrandIpt').val());
		if(kw.length>0){
			$.get('/huishou/aj_get_sj_search/?keyword=' + encodeURI(kw) + '&mobile=1' , function(data){
				data = JSON.parse(data);
				if(data.errno){
					alert('抱歉，搜索失败，请稍后再试。'+data.errmsg);
				}else{

					$('#brandBox').hide();
					$('#modelListBox').show();
					$(window).scrollTop(0)

					mHuishou.showPageBack();
					mHuishou.setPageTitle( "搜索“" + kw.replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g, '&gt;') + "”" );
					mHuishou.setBackEvent(function(e){
						e.preventDefault();

						$('#brandBox').show();
						$('#modelListBox').hide();
						mHuishou.setPageTitle('360二手机回收');
						mHuishou.hidePageBack();
					});

					var models = data.result.data,
                        params = {
                            'bid': 0, // 品牌id
                            'step': 0, // 当前步骤
                            'pid': '' // 父分类id
                        };
					renderModelList(models, params, true);
				}
			});
		}else{
			 $('#phoneBrandIpt').focus();
		}
	});

	/**
	 * 显示品牌列表
	 * @param params 目前包含3个参数：bid，品牌id，pid，父分类id，step，当前步骤
	 * @param showall 是否显示全部项，默认不显示
	 */
	function showModelList( params, showall){
		var bid = params['bid'];

		if(_brandListCache[bid]){

			var models = _brandListCache[bid];
			renderModelList(models, params, showall);

		}else{
			startModelLoading();
			$.get('/huishou/getModels/?id='+bid + '&mobile=1&fromget=m' , function(data){
				data = JSON.parse(data);

				if(!data.errno){

					var models = data.result.data;
					_brandListCache[bid] = models;
					renderModelList(models, params, showall);
				}
			});
		}
	}

	/**
	 * 输出模型列表
	 * @param models_arr
	 * @param params 目前包含3个参数：bid，品牌id，pid，父分类id，step，当前步骤
	 * @param showall
	 */
	function renderModelList(models_arr, params, showall){
		params['step'] = params['step'] || 0;
		var bid = params['bid'],
			pid = params['pid']||0,
			models = models_arr[params['step']],
			max_step = models_arr.length-1;

		var str = '';
		var SHORT_SHOW_NUM = 15;
		var max = showall? 99999 : SHORT_SHOW_NUM;

		if(!models || models.length==0){
			$('#modelListBox').html('<p style="padding:50px; text-align:center; font-size:14px;position:relative;">暂无结果。 <a href="#" class="close-no-result">关闭</a></p>');

			$('#modelListBox .close-no-result').on('click', function(e){
				e.preventDefault();

				$('#brandBox').show();
				$('#modelListBox').hide();
				$('#phoneBrandIpt').focus();
			});
		}else{
			var search_arr = $.queryUrl(window.location.search),
				open_id = search_arr['open_id'],
				youhui_code = search_arr['youhui_code'];
			//for(var i=0,n=Math.min(models.length, max); i<n; i++){
			for(var i=0,n=models.length; i<n; i++){
				var item = models[i];
				item.pid = item.pid || 0;

				// 参数的pid和数据的pid相等
				if(item.pid==pid){
					if(max_step==params['step']){
                        var pinggu_params = {
                            'model_id':item.model_id,
                            'open_id':open_id,
                            'youhui_code':youhui_code,
                            'prev_step': (+params['step']+2),
                            'iframe': search_arr['iframe']
                        };
						str += '<a class="check-item" href="'+tcb.setUrl('/m/pinggu/', pinggu_params)+'" data-model-id="'
                            +item.model_id+'" title="'+item.model_alis+'"><span class="phone-name">'+item.model_alis+'</span></a>';
					} else {
                        if ( !(item.sub_arr && item.sub_arr.length) ) {
                            var pinggu_params = {
                                'model_id':item.model_id,
                                'open_id':open_id,
                                'youhui_code':youhui_code,
                                'prev_step': (+params['step']+2),
                                'iframe': search_arr['iframe']
                            };
                            str += '<a class="check-item" href="'+tcb.setUrl('/m/pinggu/', pinggu_params)+'" data-model-id="'
                                +item.model_id+'" title="'+item.model_alis+'"><span class="phone-name">'+item.model_alis+'</span></a>';
                        } else {
                            str += '<a class="check-item" href="#" title="'+item.model_alis+'" data-id="'+item.model_id+'"><span class="phone-name">'+item.model_alis+'</span></a>';
                        }
					}
				}
			}
			if(!showall && models.length>SHORT_SHOW_NUM){
				str += '<a class="check-item c5b0 show-brand-all green" href="#" data-bid="'+bid+'">全部</a>';
			}

			// $('#modelListBox a').off();
			$('#modelListBox').html(str);
            // 型号选择绑定事件
			$('#modelListBox a').on('click', function(e){
				var $m = $(this),
                    model_id = $m.attr('data-model-id');

                // 存在model-id,先清除model-id对应的sessionStorage
                if ( model_id ) {
                    clearEvaluateStorage(model_id);
                }

				if($m.attr('href')=='#'||$m.attr('data-id')){
					e.preventDefault();

					var hash = tcb.parseHash(window.location.hash);

					window.location.hash = 'brand='+hash['brand']+'&pid='+$m.attr('data-id')+'&step='+((+hash['step']||0)+1);
				}
			});

            if (window.Bang360 && (typeof window.Bang360.resizeIframeHeight=='function')) {
                window.Bang360.resizeIframeHeight();
            }
		}
	}
	// 开始加载型号数据
	function startModelLoading(){
		$('#modelListBox').html('<div class="model-loading"></div>');
	}
    /**
     * 清除指定型号的sessionStorage
     * @param model_id
     */
    function clearEvaluateStorage(model_id) {
        var
            key_checked_options_storage = 'EVALUATE_CHECKED_OPTIONS_STORAGE_' + model_id          // 备份存储--选中的非sku评估项
            ,key_checked_sku_options_storage = 'EVALUATE_CHECKED_SKU_OPTIONS_STORAGE_' + model_id // 备份存储--选中的sku评估项

        sessionStorage.removeItem(key_checked_options_storage);
        sessionStorage.removeItem(key_checked_sku_options_storage);
    }


	//上门维修表单
	$('#shangmenSaleForm, #daodianSaleForm, #youjiSaleForm2').on('submit', function(e){
		e.preventDefault();

		var $me = $(this);
		var mobile = $me.find('.mobile'),
            uname = $me.find('[name="user_name"]'),
            mcode = $me.find('.mcode'),
			addr = $me.find('.addr'),
			id_card = $me.find('[name="id_card"]'),
			agree_protocol_shangmen = $me.find('[name="agree_protocol"]');

        mobile.attr('data-novalid', '');


        if (uname && uname.length) {
            if( $.trim(uname.val()).length == 0 ){
                errorAnimate( uname.focus() );
                return;
            }
        }

        if( !tcb.validMobile(mobile.val()) ){
            errorAnimate( mobile.focus() );
            return;
        }

        if (mcode && mcode.length) {
            if( $.trim(mcode.val()).length == 0 ){
                errorAnimate( mcode.focus() );
                return;
            }
        }

        if (addr && addr.length) {
            if( $.trim(addr.val()).length == 0 ){
                errorAnimate( addr.focus() );
                return;
            }
        }

        //验证身份证号码
        if (id_card && id_card.length) {
            if( !tcb.validIDCard($.trim(id_card.val())) ){
                errorAnimate( id_card.focus() );
                return;
            }
        }

        // 回收常见问题
        if(agree_protocol_shangmen&&agree_protocol_shangmen.length){
            if(!agree_protocol_shangmen.prop('checked')){
                errorAnimate(agree_protocol_shangmen.closest('label'));
                return;
            }
        }
        // 验证是否换新活动手机号
        validHuanxin10086Mobile(mobile, function () {

            $('#submitOrderForm').addClass('btn-submit-dis').val('提交中...');

            var query_url = $.queryUrl(window.location.href),
                request_url = tcb.setUrl( $me.attr('action'), {'from': query_url['from'], '_from': query_url['_from'], 'path': query_url['path'], 'hs_from_tob': query_url['hs_from_tob'], 'wechat_xxg': query_url['wechat_xxg']});
            $.post(request_url, $me.serialize(), function(data){

                $('#submitOrderForm').removeClass('btn-submit-dis').val('立即卖出');
                data = JSON.parse(data);
                if(data.errno){
                    alert("抱歉，出错了。" + data.errmsg);
                }else{
                    var redirect_params = {
                        'order_id': data.result.parent_id,
                        'from': query_url['from'],
                        '_from': query_url['_from']
                    };
                    // 10086活动专享
                    if ($('[name="newproductid"]').val()) {
                        window.location.href = tcb.setUrl( tcb.setUrl('/m/hs_user_invoice/', redirect_params), window.__MUST_PASS_PARAMS||{} );
                    } else {
                        window.location.href = tcb.setUrl( tcb.setUrl('/m/order_succ/', redirect_params), window.__MUST_PASS_PARAMS||{} );
                    }
                }
            });

        });


	});

	//上门维修表单
	$('#daodianBudanSaleForm').on('submit', function(e){
		e.preventDefault();

		var $me = $(this);
		var mobile = $me.find('.mobile'),
			uname = $me.find('[name="user_name"]'),
			mcode = $me.find('.mcode'),
			addr = $me.find('.addr'),
			id_card = $me.find('[name="id_card"]'),
			agree_protocol_shangmen = $me.find('[name="agree_protocol"]');

		mobile.attr('data-novalid', '');

		if (uname && uname.length) {
			if( $.trim(uname.val()).length == 0 ){
				errorAnimate( uname.focus() );
				return;
			}
		}

		if( !tcb.validMobile(mobile.val()) ){
			errorAnimate( mobile.focus() );
			return;
		}

		if (mcode && mcode.length) {
			if( $.trim(mcode.val()).length == 0 ){
				errorAnimate( mcode.focus() );
				return;
			}
		}
		if (addr && addr.length) {
			if( $.trim(addr.val()).length == 0 ){
				errorAnimate( addr.focus() );
				return;
			}
		}
		if($(this).find('.pay-channel')){
			$(this).find('.pay-channel').val( $me.find('.bank-selector').val() +'|'+ $me.find('.bank-area').val() );
		}

		// 验证是否换新活动手机号
		validHuanxin10086Mobile(mobile, function () {

			$('#submitOrderForm').addClass('btn-submit-dis').val('提交中...');

			var query_url = $.queryUrl(window.location.href),
				request_url = tcb.setUrl( $me.attr('action'), {'from': query_url['from'], '_from': query_url['_from'], 'path': query_url['path'], 'hs_from_tob': query_url['hs_from_tob'], 'wechat_xxg': query_url['wechat_xxg']});
			$.post(request_url, $me.serialize(), function(data){

				$('#submitOrderForm').removeClass('btn-submit-dis').val('立即卖出');
				data = JSON.parse(data);
				if(data.errno){
					alert("抱歉，出错了。" + data.errmsg);
				}else{
					var redirect_params = {
						'order_id': data.result.parent_id,
						'from': query_url['from'],
						'_from': query_url['_from']
					};
					// 10086活动专享
					if ($('[name="newproductid"]').val()) {
						window.location.href = tcb.setUrl( tcb.setUrl('/m/hs_user_invoice/', redirect_params), window.__MUST_PASS_PARAMS||{} );
					} else {
						window.location.href = tcb.setUrl( tcb.setUrl('/m/order_succ/', redirect_params), window.__MUST_PASS_PARAMS||{} );
					}
				}
			});

		});
	});

	//手机验证码(上门、到店)
	$('#shangmenSaleForm .sendMCode, #daodianSaleForm .sendMCode').on('click', function(e){

		var sendMCodeBtn = $(this);

		if( sendMCodeBtn.hasClass('hsbtn-vcode-dis') ){
			return;
		}

        var $form = sendMCodeBtn.closest('form');

		var mobile = $form.find('.mobile');

		if( !tcb.validMobile(mobile.val()) ){
			errorAnimate( mobile.focus() );
            alert('手机格式错误');
            return;
		}

		//$.post('/aj/send_hssecode/', {'mobile' : mobile.val()}, function(data){// [接口废弃]此处js已无处使用
		//	data = JSON.parse(data);
        //
		//	if(data.errno){
		//		alert( data.errmsg );
		//	}else{
		//		sendMCodeBtn.addClass('hsbtn-vcode-dis').val('60秒后再次发送');
		//		distimeAnim(60, function(time){
		//			if(time<=0){
		//				sendMCodeBtn.removeClass('hsbtn-vcode-dis').val('发送验证码');
		//			}else{
		//				sendMCodeBtn.val( time + '秒后再次发送');
		//			}
		//		});
		//	}
		//});
	});

	//邮寄门维修表单
	$('#youjiSaleForm').on('submit', function(e){
		e.preventDefault();

		var $me = $(this),
			username = $me.find('.username'),
			mobile = $me.find('.mobile'),
			bankNum = $me.find('.bank-num'),
			id_card = $me.find('[name="id_card"]'),
			bankUser = $me.find('.bank-user'),
			bankName = $me.find('.bank-selector'),
			bankArea = $me.find('.bank-area'),
			secode = $me.find('.secode'),
			alipay = $me.find('.alipay-id'),
			alipayName = $me.find('.alipay-name'),
			agree_protocol_youji = $me.find('[name="agree_protocol"]');
		// 用户名
		if( $.trim(username.val()).length == 0 ){
			errorAnimate( username.focus() );
			return;
		}
		// 手机号
		if( $.trim(mobile.val()).length != 11 ){
			errorAnimate( mobile.focus() );
			return;
		}
		//验证身份证号码
		if (id_card && id_card.length) {
			if( !tcb.validIDCard($.trim(id_card.val())) ){
				errorAnimate( id_card.focus() );
				return;
			}
		}
		if( $(this).find('.pay-m-curr').attr('data-rel') == 'alipay' ){
			// 支付宝
			$(this).find('.pay-method').val( 'alipay' );

			if( $.trim(alipay.val()).length == 0 ){
				errorAnimate( alipay.focus() );
				return;
			}
			if( $.trim(alipayName.val()).length == 0 ){
				errorAnimate( alipayName.focus() );
				return;
			}
		}else{
			// 银行卡
			$(this).find('.pay-method').val( 'bank' );

			if( $.trim(bankNum.val()).length == 0 ){
				errorAnimate( bankNum.focus() );
				return;
			}

			if( $.trim(bankUser.val()).length == 0 ){
				errorAnimate( bankUser.focus() );
				return;
			}

			if( bankName.val() == -1){
				errorAnimate( bankName.focus() );
				return;
			}

			if( $.trim(bankArea.val()).length == 0){
				errorAnimate( $('.city-selector'));
				return;
			}
		}

		// 回收常见问题
		if(agree_protocol_youji&&agree_protocol_youji.length){
			if(!agree_protocol_youji.prop('checked')){
				errorAnimate(agree_protocol_youji.closest('label'));
				return;
			}
		}

		/*if($.trim(secode.val()).length == 0){
			errorAnimate( secode.focus() );
			return;
		}*/

		$(this).find('.pay-channel').val( bankName.val() +'|'+ bankArea.val() );

		$('#submitOrderForm').addClass('btn-submit-dis').val('提交中...');

        var query_url = $.queryUrl(window.location.href),
            request_url = tcb.setUrl( $me.attr('action'), {'from': query_url['from'], '_from': query_url['_from'], 'path': query_url['path'], 'hs_from_tob': query_url['hs_from_tob'], 'wechat_xxg': query_url['wechat_xxg']});

        //console.log($(this).serialize());//return;
		$.post(request_url, $(this).serialize(),  function(data){
			$('#submitOrderForm').removeClass('btn-submit-dis').val('立即卖出');
			data = JSON.parse(data);
			if(data.errno){
				alert("抱歉，出错了。" + data.errmsg);
			}else{
                var redirect_params = {
                    'order_id': data.result.parent_id,
                    'from': query_url['from'],
                    '_from': query_url['_from']
                };
                // 10086活动专享
                if ($('[name="newproductid"]').val()) {
                    window.location.href = tcb.setUrl( tcb.setUrl('/m/hs_user_invoice/', redirect_params), window.__MUST_PASS_PARAMS||{} );
                } else {
                    window.location.href = tcb.setUrl( tcb.setUrl('/m/order_succ/', redirect_params), window.__MUST_PASS_PARAMS||{} );
                }
			}
		});
	});



    //订单查询手机验证码
	$('#myOrderFormXXG #sendMCodeXXG').on('click', function(e){

		var sendMCodeBtn = $(this);

		if( sendMCodeBtn.hasClass('hsbtn-vcode-dis') ){
			return;
		}

		var mobile = $('#myOrderFormXXG .mobile');

        var $Form = sendMCodeBtn.closest('form')

        if( !__validGetSmsCode ($Form) ){
			errorAnimate( mobile.focus() );
			return;
		}

		sendMCodeBtn.addClass('hsbtn-vcode-dis');

        var
            $mobile = $Form.find ('[name="tel"]'),
            $pic_secode = $Form.find ('[name="pic_secode"]'),
            $sms_type = $Form.find ('[name="sms_type"]'),
            url = '/aj/doSendSmscode',
            params = {
                'mobile'     : $mobile.val ().trim (),
                'pic_secode' : $pic_secode.val ().trim (),
                'sms_type'   : $sms_type.val ().trim ()
            }
		$.post(url, params, function(data){
			data = JSON.parse(data);

			if(data.errno){
				sendMCodeBtn.removeClass('hsbtn-vcode-dis');
				alert( data.errmsg);
                $('#myOrderFormXXG .vcode-img').click()
			}else{
				sendMCodeBtn.val('60秒后再次发送');
				distimeAnim(60, function(time){
					if(time<=0){
						sendMCodeBtn.removeClass('hsbtn-vcode-dis').val('发送验证码');
					}else{
						sendMCodeBtn.val( time + '秒后再次发送');
					}
				});
			}
		});
	});

    //订单查询手机验证码
    $('#myOrderFormXXG #sendMCodeXXGBUDAN').on('click', function(e){

        var sendMCodeBtn = $(this);

        if( sendMCodeBtn.hasClass('hsbtn-vcode-dis') ){
            return;
        }

        var $Form = sendMCodeBtn.closest('form')

        // if( !__validGetSmsCode ($Form) ){
        //     return
        // }

        sendMCodeBtn.addClass('hsbtn-vcode-dis');

        var
            $mobile = $Form.find ('[name="tel"]'),
            $pic_secode = $Form.find ('[name="pic_secode"]'),
            $sms_type = $Form.find ('[name="sms_type"]'),
            url = '/aj/doSendXXGSmsCode',
            params = {
                'mobile'     : $mobile.val ().trim (),
                'pic_secode' : $pic_secode.val ().trim (),
                'sms_type'   : $sms_type.val ().trim ()
            }


        $.post(url, params, function(data){
            data = JSON.parse(data);

            if(data.errno){
                sendMCodeBtn.removeClass('hsbtn-vcode-dis');
                alert( data.errmsg);
                $('#myOrderFormXXG .vcode-img').click()
            }else{
                sendMCodeBtn.val('60秒后再次发送');
                distimeAnim(60, function(time){
                    if(time<=0){
                        sendMCodeBtn.removeClass('hsbtn-vcode-dis').val('发送验证码');
                    }else{
                        sendMCodeBtn.val( time + '秒后再次发送');
                    }
                });
            }
        });
    });

    // 验证获取手机短信验证码表单
    function __validGetSmsCode ($Form) {
        if (!($Form && $Form.length)) {
            return false
        }
        var flag = true

        var wMobile = $Form.find ('[name="tel"]'),
            mobile_val = wMobile.val ().trim()
        if (!tcb.validMobile (mobile_val)) {
            flag = false
            wMobile.shine4Error().focus();
        }

        var wPicSecode = $Form.find ('[name="pic_secode"]'),
            pic_secode_val = wPicSecode.val ().trim()
        if (!pic_secode_val) {
            wPicSecode.shine4Error()
            if (flag) {
                wPicSecode.focus ()
            }
            flag = false
        }

        return flag
    }

	// 图片验证码刷新
	$('#myOrderFormXXG .vcode-img').on('click', function(e){
		var src = '/secode/?rands=' + Math.random();
		$(this).attr('src', src);

        $(this).closest('form').find('[name="pic_secode"]').val('')
        $(this).closest('form').find('[name="pic_secode"]').focus()
	});


	/*出错提示*/
	function errorAnimate( obj ){
        obj = $(obj);
        var obgc = obj.css('background-color');

        obj.css('background-color', '#f00').animate({'background-color' : '#fff'}, 1200, 'cubic-bezier(.28,.2,.51,1.15)', function(){
            obj.css('background-color', obgc)
        });
    }

	//品牌选择改变
	function brandChange(){
		if( !$('body').hasClass('tpl-hsindex') ){
			return ;
		}

		$(window).on('hashchange load', function(e){
			var hash = tcb.parseHash(window.location.hash);

			if(hash['brand']){
				var params = {
					'bid': hash['brand'], // 品牌id
					'step': hash['step']||0, // 当前步骤
					'pid': hash['pid']||'' // 父分类id
				};
				showModelList(params, true);

				$('#brandBox').hide();
				$('#modelListBox').show();
				$('#hsfooter').hide();
				$(window).scrollTop(0);
				// 设置选择型号页步骤
                setEvaluateStepPos(+params['step']+2);
			}else{
				$('#brandBox').show();
				$('#modelListBox').hide();
				$('#hsfooter').show();
				// 设置首页评估步骤
				setMainpagePingguStepPos();
			}

		});
	}

	//邮寄回收步骤
	function youjiStepChange(){
		if( !$('body').hasClass('tpl-sub_order') || $('#youjiSaleForm').length==0 ){
			return ;
		}

		$(window).on('hashchange load', function(e){
			var youjiReg = window.location.hash.match(/youji(\d+)/);

			if(youjiReg){
				var youjistep = youjiReg[1] ;
				$('#youjiNext').hide();
				$('#hsInfoBox').hide();
				$('#submitOrderForm').show();

			}else{
				var youjistep = 0;
				$('#youjiNext').show();
				$('#hsInfoBox').show();
				$('#submitOrderForm').hide();

			}

			$('.youji-step').hide();
			$('.youji-step'+youjistep).show();

		});
	}


	/**
	 * 异步获取城市上门商家
	 * @param  {[type]} city [description]
	 * @return {[type]}      [description]
	 */
	function ajaxGetShop(){

		if( !($('body').hasClass('tpl-pinggu_shop') || $('body').hasClass('tpl-pinggu_shop_ziying')) ){
			return ;
		}

		$.loading().show();

		if(window.HuishouMerInfo){
			_dealShopData({
				'errno': 0,
				'result': window.HuishouMerInfo
			});
		}

		// 根据商家数据处理相应信息
		function _dealShopData(data){
			$.loading().hide();

			data = typeof data==='string' ? JSON.parse(data) : data;

			//判断回收方式是否支持上门、到店、邮寄；如果机器不收，在前一接口doPinggu时，就应该跳转至错误页面
			var server_type = data.result.server_type;// 1=>上门 2=>到店 3=>邮寄
			var huodong_id  = data.result.huodong_id;
			//单独的回收
			if(huodong_id == 0){
				_showPriceGird(data.result.aver_fudong);
				$('.hs-s-price').html('￥'+data.result.data['online'][0]['assess_price']);
				$('#huishouMoneySection').attr('data-price', data.result.data['online'][0]['assess_price']).html(data.result.data['online'][0]['assess_price']);
				setHSSPrice( data.result.data['online'][0]['assess_price'] );

				//根据server_type显示支持方式 ：邮寄 or 上门

			}

		}
		//设置回收商价格
		function setHSSPrice(price){
			var RAND_PRICE=Math.ceil(((new Date().getTime())/(7*24*3600*1000))%(Math.ceil(price*0.15)));

			$('.phone-hs-table .price[data-prel="p0"]').html('￥' + (price));
			$('.phone-hs-table .price[data-prel="p1"]').html('￥' + (Math.ceil(price*0.85)-0+RAND_PRICE));
			$('.phone-hs-table .price[data-prel="p2"]').html('￥' + (Math.ceil(price*0.8)-0+RAND_PRICE));
			$('.phone-hs-table .price[data-prel="p3"]').html('￥' + (Math.ceil(price*0.5)-0+RAND_PRICE));


            var HG_PRICE = 4688-price,
                PRESENT_TXT = '赠以旧换新专享码';
            if (HG_PRICE>0) {
                PRESENT_TXT = '<span>+'+HG_PRICE+'元</span> 可换购全新iPhone6';
            }
            $('.hs-huanxinji').html(PRESENT_TXT);

            //价格趋势
            $('.price-grid .grid-prc-0').html( Math.ceil(price*1.05)+RAND_PRICE );
            $('.price-grid .grid-prc-1').html( Math.ceil(price*0.85)+RAND_PRICE );
            $('.price-grid .grid-prc-2').html( Math.ceil(price*0.65)+RAND_PRICE );

            $('.price-grid .gird-pg').html( Math.ceil(price*0.29+RAND_PRICE) + '元' );
		}
		//无结果
		function _showNoResult(){
			$('#noRltTip').show().siblings('.price-show-gird').hide();
			$('#noRltStart').show();
		}

		function _showPriceGird(pdata){
			if(!pdata){return;}
			var __priceGirdData = {
				x : [  ],
				y : [  ],
				data : [  ]
			}

			for(var p in pdata ){
				__priceGirdData.x.push( p + '月' );
				__priceGirdData.data.push( pdata[p]['aver']  );
			}

			//计算y坐标组
			var _tmpStep = ( Math.max.apply(null, __priceGirdData.data) - Math.min.apply(null, __priceGirdData.data) ) / 5;
			for(var i=1; ; i++){
				var curNum = i*10;
				if( _tmpStep < curNum ){
					_tmpStep = curNum;
					break;
				}

				if( i> 500){
					break;
				}
			}
			var _tmpStart = Math.floor( Math.min.apply(null, __priceGirdData.data) / 10 ) * 10;
			for(var i=0; i<6; i++){
				__priceGirdData.y.push( _tmpStart + i* _tmpStep);
			}

			if($('#girdCanvas').length>0) priceGird.init('#girdCanvas',__priceGirdData);
		}
	}

    //倒计时动画
	function distimeAnim(time, callback){
		if(time<=0 ){  return ;}
		var timer = setInterval( function(){
			time --;
			callback && callback(time);
			if(time <=0 ){
				clearInterval(timer);
			}
		}, 1000);
	}

	function queryUrl(e,t){e=e.replace(/^[^?=]*\?/ig,"").split("#")[0];var n={};return e.replace(/(^|&)([^&=]+)=([^&]*)/g,function(e,t,r,i){try{r=decodeURIComponent(r)}catch(s){}try{i=decodeURIComponent(i)}catch(s){}r in n?n[r]instanceof Array?n[r].push(i):n[r]=[n[r],i]:n[r]=/\[\]$/.test(r)?[i]:i}),t?n[t]:n}


	//为从移动端 onebox页面进入的用户的链接追加from=so参数
	function modifyUrlForSo(){
		if( _fromso ){
			$('body').delegate('a', 'mousedown', function(e){
				var $_this = $(this);
				var _url = $_this.attr('href'),
					_nodeal = $_this.attr('data-nodeal'),
					_except = $_this.attr('data-except');
				_except = _except ?  _except.split('|') : '';

				if(tcb.isRealUrl(_url)&&!_nodeal){
                    var query_params = queryUrl(window.location.href);
					var params = {
                        'from': query_params['from'],
                        '_from': query_params['_from'],
                        'path': query_params['path'],
                        'hs_from_tob': query_params['hs_from_tob'],
                        'wechat_xxg': query_params['wechat_xxg'],
                        'newproductid': query_params['newproductid']
                    };

					$.each(params, function(k, v){
						$.each(_except, function(i, e){
							if(e==k){
								params[k] = '';
							}
						});
					});
					$_this.attr('href', tcb.setUrl(_url, params));
				}
			});
		}
	}

    // 为可跳转a标签的url带上当前url的指定query参数
    function modifyUrlFromQuery(){
        $('body').delegate('a', 'mousedown', function(e){
            var $_this = $(this);
            var _url = $_this.attr('href'),
                _nodeal = $_this.attr('data-nodeal'),
                _except = $_this.attr('data-except'); // 跳过不需要的参数

            // url为真实url，并且没有表示为不需要处理。。那么统一搞一下
            if(tcb.isRealUrl(_url)&&!_nodeal){
                var query_params = queryUrl(window.location.href);
                var params = {
                    'from': query_params['from'],
                    '_from': query_params['_from'],
                    'path': query_params['path'],
                    'hs_from_tob': query_params['hs_from_tob'],
                    'wechat_xxg': query_params['wechat_xxg'],
                    //'open_id':query_params['open_id'],
                    //'youhui_code':query_params['youhui_code'],
                    'newproductid': query_params['newproductid']
                };

                _except = _except ?  _except.split('|') : '';
                $.each(params, function(k, v){
                    $.each(_except, function(i, e){
                        if(e==k){
                            params[k] = '';
                        }
                    });
                    if (!params[k]) {
                        delete params[k];
                    }
                });

                _url = tcb.setUrl(tcb.setUrl(_url, params), window.__MUST_PASS_PARAMS||{});
                $_this.attr('href', _url);
            } else {
                _url = tcb.setUrl(_url, window.__MUST_PASS_PARAMS||{});
                $_this.attr('href', _url);
            }
        });
    }

	//显示分享弹窗
	function showSharePop(priceRange){
		if (typeof WeixinJSBridge == "undefined" && window.navigator.userAgent.indexOf('MicroMessenger')==-1){
			return;
		}

		$('.share-to-wechat').show();
		return;

		priceRange += "";
		var maxPrice = priceRange.split('~');
		maxPrice = maxPrice[maxPrice.length-1] - 0;

		$('.pinggu-tip .share-rs').show();

		if( document.referrer.indexOf('/m/pinggu') > -1 ){
			var box ;
			if(maxPrice > 2000){
				box = Dialog.showBox('<div class="wx-share-pic wx-share-pic-2000"><span class="wx-share-btn share-to-wechat"></span></div>');
				_modifyTit('添些钱可以买肾6了！人生，不考公务员也挺好~');
			}else if(maxPrice > 1000){
				box = Dialog.showBox('<div class="wx-share-pic wx-share-pic-1000"><span class="wx-share-btn share-to-wechat"></span></div>');
				_modifyTit('我想这笔钱可以来一场说走就走的旅行了~');
			}else if(maxPrice > 500){
				box = Dialog.showBox('<div class="wx-share-pic wx-share-pic-500"><span class="wx-share-btn share-to-wechat"></span></div>');
				_modifyTit('借这个机会改善下生活，买辆单车or换台电视');
			}else if(maxPrice > 100){
				box = Dialog.showBox('<div class="wx-share-pic wx-share-pic-100"><span class="wx-share-btn share-to-wechat"></span></div>');
				_modifyTit('用这笔钱请朋友吃顿大餐，没准还能送你个手机！');
			}else{
				box = Dialog.showBox('<div class="wx-share-pic wx-share-pic-5"><span class="wx-share-btn share-to-wechat"></span></div>');
				_modifyTit('这笔钱就当给新手机充话费了，一分钱也是钱~');
			}

			box.on('click', function(){
				Dialog.hide();
			});
		}

		function _modifyTit(txt){
			var oldTit = document.title;
			document.title = '360手机回收 - ' + txt + ' - ' + oldTit;
		}

	}

	/**
	 * 估价提示动画
	 */
	function gujiaTipAnimate(){
		var $tip = $('.hs-bottom-gujia-tip'),
			$list = $('.hs-bottom-gujia-tip-list');
		if(!($tip&&$tip.length&&$list&&$list.length)){
			return;
		}
		var tipoffset = $tip.offset(),
			listoffset = $list.offset();

		var tran_y = listoffset['top']-tipoffset['top']-tipoffset['height'],
			margin = listoffset['height']+tran_y;
		if(margin<tipoffset['height']){
			$list.prepend($list.find('p').last()).animate({'translateY': '0'},0,function(){
				listoffset = $list.offset();

				tran_y = listoffset['top']-tipoffset['top']-tipoffset['height'];

				$list.animate({'translateY': tran_y+'px'},300,'ease-in-out',function(){
					setTimeout(gujiaTipAnimate, 2000);
				});
			});
		} else {
			$list.animate({'translateY': tran_y+'px'},300,'ease-in-out',function(){
				setTimeout(gujiaTipAnimate, 2000);
			});
		}
	}
	// 显示手机常见问题页面
	$('.view-agree-protocol').on('click', function(e){
		e.preventDefault();

		var $body = $(document.body);

		var html_fn = $.tmpl($.trim($('#HuishouProtocolTpl').html())),
			html_str = html_fn();

		$body.addClass('ohidden');
		Dialog.showBox(html_str);

		$('.huishou-protocol-panel-wrap .close-btn').on('click', function(e){
			e.preventDefault();

			$body.removeClass('ohidden');
			Dialog.hide();
		});
	});

    // 图片滑动+查看大图
    (function(){
        var $slideWrap = $('.slide-shower-wrap');
        if(!$slideWrap.length){
            return ;
        }

        var $sitem = $slideWrap.find('.s-item');
        if(!$sitem.length){
            return;
        }

        var $nav = $slideWrap.find('.slide-nav'),
            $nitem;
        if($nav.length){
            $nitem= $nav.children();

            if(!$nitem.length){
                var nav_item_str = '';
                for(var i=0; i<$sitem.length; i++){
                    nav_item_str += i==0?'<span class="cur"></span>':'<span></span>';
                }
                $nitem = $(nav_item_str).appendTo($nav);
            }
        }
        // 滑动item数大于1个才有滑动效果
        if($sitem.length>1){
            $sitem.removeClass('s-item-hide');
            // 初始化slide滑动
            var objSwipe = Swipe($slideWrap[0], {
                startSlide: 0,
                speed: 400,
                auto: $slideWrap.attr('data-auto')||0,
                continuous: true,
                disableScroll: false,
                stopPropagation: false,
                callback: function(index, element) {
                    if($nitem && $nitem.length){
                        if($nitem.length<3&&this.continuous){
                            $nitem.removeClass('cur').eq(index%$nitem.length).addClass('cur');
                        } else {
                            $nitem.removeClass('cur').eq(index).addClass('cur');
                        }
                    }
                },
                transitionEnd: function(index, element) {   }
            });
        } else {
            $nav.length && $nav.hide();
        }

        // 事件绑定
        tcb.bindEvent({
            // 查看大图
            '.show-bigger-img img': {
                'click': function(e){
                    var $me = $(this),
                        $img = $me.closest('.slide-shower').find('img'),
                        bigger_url = $me.attr('data-big');

                    var $mask = $('.show-bigger-img-mask'),
                        $close = $('.show-bigger-img-close');
                    if(!$mask.length){
                        $mask = $('<div class="show-bigger-img-mask"></div>').appendTo($(document.body));
                        // 关闭大图查看
                        $mask.on('click', function(e){
                            e.preventDefault();

                            closeShowBiggerImg();
                        });
                    }
                    if(!$close.length){
                        $close = $('<span class="show-bigger-img-close iconfont">&#xe604;</span>').appendTo($(document.body));
                        // 关闭大图查看
                        $close.on('click', function(e){
                            e.preventDefault();

                            closeShowBiggerImg();
                        });
                    }

                    var $wrap = $('.show-bigger-img-wrap');
                    if(!$wrap.length){
                        $wrap = $('<div class="show-bigger-img-wrap"></div>').appendTo($(document.body));
                        // 关闭大图查看
                        $wrap.on('click', function(e){
                            e.preventDefault();

                            closeShowBiggerImg();
                        });
                    }
                    var pos = 0,
                        str = '<div class="big-img-shower clearfix">';
                    $img.each(function(i){
                        var url = $(this).attr('data-big');
                        if(url==bigger_url){
                            pos = i;
                        }
                        str += '<div class="s-item'+(url==bigger_url? '' : ' s-item-hide')+'"><img src="'+url+'" /></div>';
                    });
                    str += '</div>';
                    $wrap.html('<div class="show-bigger-img-wrap-inner">'+str+'</div>');

                    var $biggerSlideWrap = $wrap.find('.show-bigger-img-wrap-inner'),
                        $biggerSitem = $biggerSlideWrap.find('.s-item');
                    if($biggerSitem.length>1){
                        $biggerSitem.removeClass('s-item-hide');
                        // 初始化 大图 slide滑动
                        Swipe($biggerSlideWrap[0], {
                            startSlide: pos,
                            auto: 0,
                            continuous: true,
                            disableScroll: true,
                            stopPropagation: false,
                            callback: function(index, element) { },
                            transitionEnd: function(index, element) { }
                        });
                    }

                }
            }
        });

        function closeShowBiggerImg(){
            $('.show-bigger-img-mask').off().remove();
            $('.show-bigger-img-close').off().remove();
            $('.show-bigger-img-wrap').off().remove();
        }
    }());

    function init(){
        // 根据当前url的query，a标签跳转前修改href属性，让其携带指定的参数
        modifyUrlFromQuery();

        //页面初始化时对所有input做初始化
        PlaceHolder.init();

		if( $('#youjiSaleForm').length>0 ){ new bankAreaSelector( '#provenceSelect', '#citySelect', '#youjiSaleForm .bank-area', __bankArea ); }
		if( $('#daodianBudanSaleForm').length>0 ){ new bankAreaSelector( '#provenceSelect', '#citySelect', '#daodianBudanSaleForm .bank-area', __bankArea ); }
		if($('#girdCanvas').length>0 && window.__priceGirdData){
			priceGird.init('#girdCanvas', window.__priceGirdData);
		}
		// 品牌切换
		brandChange();

		// 评估结果页(设置从首页到当前位置的步骤，作为回退使用)
		if(window.location.href.indexOf('360.cn/m/pinggu_shop')!==-1){
			var referrer = document.referrer,
				stepNum = queryUrl(window.location.href, 'prevstep');
			stepNum = +stepNum || 0;
			// 使用referrer确保评估结果页是从评估页面一步一步走过来的，而不是直接输入或者从其他页面分享过来的
			if(stepNum&&referrer.indexOf('360.cn/m/pinggu')!==-1){
                setEvaluateStepPos(stepNum+1);
			} else {
                setEvaluateStepPos(0);
			}
		}

		// youjiStepChange(); //邮寄信息，两步合成一步
		ajaxGetShop();

		gujiaTipAnimate();

        // 使用优惠码
        $('.use-promo-wrap').forEach(function(el, i){
            var wWrap = $(el);
            // 使用优惠码
            tcb.usePromo({
                'service_type': 2,
                'product_id': '',
                'price': $('#huishouMoneySection').attr('data-price'),
                'wWrap': wWrap,
                'succ': function(youhuiPrice, min_sale_price, wWrap){
                    wWrap.find('.promoYZ').html('优惠码有效，卖出可多收'+youhuiPrice+'元').removeClass('promo-fail').addClass('promo-succ');
                },
                'fail': function(wWrap){

                }
            });
        });

        // 订单列表，查看订单详情
        $('.myorder-list').on('click', function(e){
            var target = e.target,
                $me = $(this);

            if(target.nodeName.toLocaleLowerCase()=='a'){
                return;
            }

            var params = {
                'order_id': $me.attr('data-id')
            };
            window.location.href = tcb.setUrl( tcb.setUrl('/m/hs_user_order', params), window.__MUST_PASS_PARAMS||{} );
        });

		// 订单列表，查看订单详情
		$('.myorder-list-xxg').on('click', function(e){
			var target = e.target,
				$me = $(this);

			if(target.nodeName.toLocaleLowerCase()=='a'){
				return;
			}

            var url = '/m/hs_xxg_order',
                params = {
                    'order_id': $me.attr('data-id')
                },
                filter = tcb.queryUrl(window.location.search, 'filter')

            if (filter == 'diff') {
                url = '/m/hsXXGThirdPingguNotEqualOrderDetail'
            }
            window.location.href = tcb.setUrl(tcb.setUrl(url, params), window.__MUST_PASS_PARAMS || {});
		});
        // 订单列表，查看订单详情
        $('.myorder-third-pinggu-list-xxg').on('click', function(e){
            var target = e.target,
                $me = $(this);

            if(target.nodeName.toLocaleLowerCase()=='a'){
                return;
            }

            var params = {
                'order_id': $me.attr('data-id')
            };
            window.location.href = tcb.setUrl( tcb.setUrl('/m/hsXXGThirdPingguNotEqualOrderDetail', params), window.__MUST_PASS_PARAMS||{} );
        });
	}

	init();

    // 轮播图懒加载
    tcb.lazyLoadImg(100, $('.slide-shower-wrap'))
});
