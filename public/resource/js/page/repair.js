Dom.ready(function(){
	tcb.bindEvent(document.body, {
		'#modelList .check-item' : function(e){
			e.preventDefault();
			W(this).addClass('check-item-curr').siblings('.check-item-curr').removeClass('check-item-curr');
			getRepairCost();
		},
		'#issueList .check-item' : function(e){
			e.preventDefault();
			W(this).addClass('check-item-curr').siblings('.check-item-curr').removeClass('check-item-curr');
			getRepairCost();
		},
		//手机号码输入
		'form .mobile' : {
			'keyup' : function(e){
				W(this).val( W(this).val().replace(/\D/g, '') );
			},
			'change' : function(e){
				W(this).val( W(this).val().replace(/\D/g, '') );
			}
		},
		'#buyRepairService' : function(e){
			e.preventDefault();

			if( W('#modelList .check-item-curr').length == 0){
				W('#modelList').shine4Error();
				return;
			}

			if( W('#issueList .check-item-curr').length == 0){
				W('#issueList').shine4Error();
				return;
			}

			var curModel = W('#modelList .check-item-curr'),
				curIssue = W('#issueList .check-item-curr'),
				modelId = curModel.attr('data-modelid'),
				modelName =curModel.html(),
				issueId = curIssue.attr('data-issueid'),
				issueDesc = curIssue.html();

			var tplFun = W('#repairFormTpl').html().tmpl();
			var formHtml = tplFun( { modelId:modelId, modelName:modelName, issueId:issueId, issueDesc:issueDesc, youhuitime : new Date((new Date().getTime() + 72*60*60*1000)) } );

			var panel = tcb.panel('填写信息', formHtml, { 
				'width':'750', 
				'height':'400',
				"withShadow": true,			
				"wrapId" : "comServicePanel",
				"className" : "panel panel-tom01 border8-panel pngfix"	
			});			
			
			var repairForm = W('#repairForm');
			initAddrComp( repairForm );

			//表单提交
			repairForm.on('submit', function(e){
				e.preventDefault();
				var user = repairForm.one('.user'),
					mobile = repairForm.one('.mobile'),
					yzcode = repairForm.one('.yzcode'),					
					address = repairForm.one('.address');

				var	city = repairForm.one('.user-city'),
					quxian = repairForm.one('.user-quxian'),
					citycode = repairForm.one('.user-citycode'),
					quxianid = repairForm.one('.user-quxianid'),
					citySelBox = repairForm.one('#jxCitySelector');
				
				if(user.val().trim()==''){
					user.shine4Error().focus();
					return false;
				}

				if(mobile.val().trim()==''){
					mobile.shine4Error().focus();
					return false;
				}

				if(yzcode.val().trim()==''){
					yzcode.shine4Error().focus();
					return false;
				}

				if(address.val().trim()==''){
					address.shine4Error().focus();
					return false;
				}
				
				if( city.val().trim()=='' || quxian.val().trim()=='' ){
					citySelBox.shine4Error();
					return false;
				}

				QW.Ajax.post( '/jixiu/sub_tinfo', repairForm[0], function(res){
					var res = QW.JSON.parse(res);
					if(res.errno){
						alert('抱歉，出错了，请稍后再试。' + res.errmsg);
					}else{
						W('.repair-form-content .r-f-section').hide();
						W('.repair-form-content .r-f-ok').show();
					}
				});
			});

			//发送验证码
			repairForm.delegate('.sendcode', 'click', function(e){				
				e.preventDefault();
				var mobile = repairForm.one('.mobile'),
					sendMCodeBtn = W(this);

				if(sendMCodeBtn.hasClass('btn-vcode-disabled')){
					return;
				}

				if( !/^\d{11}$/.test( mobile.val())){
					mobile.shine4Error().focus();
					return;
				}

				QW.Ajax.post('/aj/send_jxsecode', {'mobile' : mobile.val()}, function(res){
					var res = QW.JSON.parse(res);
					if(res.errno){
						alert('抱歉，出错了。'+res.errmsg);						
					}else{
						sendMCodeBtn.addClass('btn-vcode-disabled').val('60秒后再次发送');
						distimeAnim(60, function(time){
							if(time<=0){
								sendMCodeBtn.removeClass('btn-vcode-disabled').val('发送验证码');
							}else{
								sendMCodeBtn.val( time + '秒后再次发送');
							}
						});
					}
				} );
			});
		}
	});

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

	//初始化地址选择器
	function initAddrComp(boxObj){
		// 激活面板选择
        new bang.AreaSelect({
        	'wrap': '#jxCitySelector',
        	'hasquan' : false,        	
        	// 城市选择时触发
	        'onCitySelect': function(data){
	        	boxObj.one('.user-city').val(data.cityname);
	        	boxObj.one('.user-quxian').val('');
	        	boxObj.one('.user-citycode').val(data.citycode);
				boxObj.one('.user-quxianid').val('');
	        },
	        // 区县选择时触发
	        'onAreaSelect': function(data){	        	
	        	boxObj.one('.user-city').val(data.cityname);
        		boxObj.one('.user-quxian').val(data.areaname);
        		boxObj.one('.user-citycode').val(data.citycode);
				boxObj.one('.user-quxianid').val(data.areacode);
	        },
	        // 商圈选择时触发
	        'onQuanSelect': function(data){

	        }
        }); 
	}

	//获取维修价格
	function getRepairCost(){
		var model = W('#modelList .check-item-curr'),
			issue = W('#issueList .check-item-curr');

		if( model.length>0 && issue.length>0 ){
			QW.Ajax.get( '/Aj_jixiu/faultdetail?fault_id='+issue.attr('data-issueid')+'&pc_id='+model.attr('data-modelid'), function(res){
				var res = QW.JSON.parse(res);
				if(res.errno){

				}else{
					var repairItems = res.result;
					if(repairItems && repairItems.length>0){
						var repairFun = W('#repairItemTpl').html().tmpl();

						var rHtml = repairFun({ 'repairItems' : repairItems });

						W('#evaluateResult').html(rHtml);
					}else{
						W('#evaluateResult').html('');
					}
				}
			})
		}
	}
});