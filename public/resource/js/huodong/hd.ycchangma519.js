//弹出窗口
var dialogWindow=
{	
		wrapId:null,
		ftype:0,
		InitWin:function(wrapId,ftype)
		{
			dialogWindow.wrapId=wrapId;	
			if(ftype) ftype=ftype;
			dialogWindow.ftype=ftype;
			dialogWindow.WinOpen();
		},
		WinOpen:function()
		{
			var _width = Dom.getDocRect().width;
			var _height =Dom.getDocRect().height;
			var _docWidth=W('#'+dialogWindow.wrapId).getRect().width;
			var _docHeight=W('#'+dialogWindow.wrapId).getRect().height;
			if(_docWidth < 1) _docWidth=478;
			if(dialogWindow.ftype=='suc')
			{
				_docWidth=730;	
			}
			if(_docHeight < 1) _docHeight=357;
			var boxTop	= (_height-_docHeight)/2;
			if(boxTop < 1)	boxTop=10;
			var boxLeft	= (_width-_docWidth)/2;
			if(QW.Browser.ie6)
			{
				var p = 'absolute';	
			}
			else
			{
				var p = 'fixed';
			}
			if(dialogWindow.ftype=='suc')
			{
				var p = 'absolute';		
			}
			W('#'+dialogWindow.wrapId).insertAdjacentHTML("afterend",'<div id="exposeMask" style="position:'+p+'; top:0px;left: 0px;filter:alpha(opacity=70);opacity:0.5;z-index:9998;width:'+_width+'px;height:'+_height+'px;background:#000;"></div>');
			W('#'+dialogWindow.wrapId).css({"position":""+p+"","z-index": "9999", "top":""+boxTop+"px","left":""+boxLeft+"px"}).show();		
		},
		fresh:function()
		{
			var _height =document.body.scrollHeight;
			var _width = Dom.getDocRect().width;
			W("#exposeMask").css({"height":""+_height+"px","width":""+_width+"px"});
		},
		WinClose:function(wrapId)
		{
			W("#"+wrapId).hide();
			W("#exposeMask").removeNode();
			W("#exposeMask").removeNode();
			W("#exposeMask").removeAttr("style");
			W("#exposeMask").removeNode();
			W("#exposeMask").hide();
		}
};
var DivArr=['reservation','robed','folksuccess','folkexpert','reservationSuccess'];
var Commstr={wait_verycode:0};
var ExpertCom={codeType:0,mobile:0,checkmobileCode:0,mobile_reg:0,code_reg:0,codestatus:0,qid:0,username:0,fuwuCode:0,seltype:'pc',hdenable:0,zjenabled:0,curdate:0,curhour:0,curminute:0,limittype:0,successtype:0,limitpc:0,limitmb:0,pcok:0,mbok:0};
ExpertCom.code_reg = /^\d{6}$/;
ExpertCom.Timer={dh:0,dm:0,ds:0,dhpc:0,dmpc:0,dspc:0,TimerId:0,TimerPC:0,TimerMB:0};
var CommCalc={Num_item:new Array(),NumberBar:0,h:29,initNumber:52981,waitTime:0,waitTimer1:0};
var USER_NUM=CommCalc.initNumber;
Dom.ready(function()
{
	
	
	W("#acDialogbox").hide();
	dialogWindow.WinClose("acDialogbox");
	W("div[js-name='winclose']").click(function()
	{
		dialogWindow.WinClose("acDialogbox");	
	});
	
	//点击手机认证专家
	W("#flok360,#bomchangma").click(function(event)
	{
		ExpertCom.codeType=2;
		ExpertCom.seltype='mb';
		ResetInputValue();
		W("#box-renzheng-hd").addClass("folk-tit-bg3");
		event.preventDefault(); 
		if(ExpertCom.mbok=='ok')
		{
			dialogWindow.InitWin("acDialogbox");
			W("div[js-name='winclose']").show();
			ShowDiffentDiv("reservation");
			SetDiffDiv(2);
		}
	});
	/*点击免费抢按钮*/
	W("#btnrobcode").click(function()
	{
		SubmitFormRobe();	
	});
	
	//手机验证码
	W("#validatecode").click(function()
	{
		var rel=W(this).attr("rel");
		if(rel==0)
		{
			SendExperMobileCode();
		}
	});
	W(".close").click(function()
	{
		W("#exposeMask").removeNode();
		W("#exposeMask").hide();
		W(".mask").removeNode();	
	});
	
	W("input[js-name='ftype']").click(function()
	{
		var sval=W(this).attr("js-data");
		ExpertCom.seltype=sval;
		CheckNowUseful();
	});
	
	W("input[js-name='prototol']").click(function()
	{
		var check=W(this).attr("checked");
		if(check)
		{
			W("#btnrobcode").removeAttr("disabled").removeClass("disabled");;
		}
		else
		{
			W("#btnrobcode").attr("disabled","disabled").addClass("disabled");	
		}	
	});
	W("#moreexpert").click(function(e)
	{
		e.preventDefault();
		Commstr.param="/tab=3";
		CheckPluginFunc(0);
	});
	W("#morefolk").click(function(e)
	{
		e.preventDefault();
		Commstr.param="/tab=3";
		CheckPluginFunc(0);
	});
	
	W(".acode").click(function(e)
	{
		e.preventDefault();
	});
	
	W("table").delegate("td","mouseover,mouseout",function(e)
	{
		var jsname=W(this).attr("jsname");
		var etype=W(this).attr("etype");
		var eid=W(this).attr("eid");
		
		if(jsname=='folk')
		{
			if(e.type=='mouseover')
			{
				
				W("#btn"+eid+"").show();
				W("#manyi"+eid+"").hide();
				W(this).addClass("hovertd");
				
			}
			else if(e.type=='mouseout')
			{
				
				W("#btn"+eid+"").hide();
				W("#manyi"+eid+"").show();
				W(this).removeClass("hovertd");	
			}
		}
	});
	
	W("table").delegate("a","click",function(e)
	{	
		var sid=W(this).attr("id");
		var rel=W(this).attr("rel");
		var etype=W(this).attr("etype");
		if(sid=='afuwuxieyi' || rel=='true')
		{
		}
		else if(etype=='folk')
		{
			e.preventDefault();
		}
		var sname=W(this).attr("name");
		var eid=W(this).attr("eid");
		if(sname=='btnpingjia')
		{
			Commstr.param="/folkproblem=0 /searchfolkpage="+eid+" /folkdetail="+eid+"";
			CheckPluginFunc(0);
		}
		else if(sname=='btnzixun')
		{
			Commstr.param="/folkproblem=0 /searchfolkpage="+eid+" /consultfolk="+eid+"";
			CheckPluginFunc(0);		
		}
	});

	CheckMobileFocusBlur();
	CheckValidateCodeFocusBlur();
	CheckNowUseful('pc');
	CheckNowUseful('mb');
	GetOnLineExpertList();
	Commstr.plugin.pluginTimer();
	CommCalc.InitCalcInstance();
});

//提交表单
var SubmitFormRobe=function()
{
		ExpertCom.mobile=W("#mobile").getValue();
		ExpertCom.checkmobileCode=W("#checkmobileCode").getValue();
		if(!CheckMobileTest(ExpertCom.mobile))
		{
			W("#mobile_errmsg").show().html("请输入正确的手机号");	
		}
		else if(!CheckMobileCode(ExpertCom.checkmobileCode))
		{
			W("#checkcode_errmsg").show().html("请输入正确的验证码");		
		}
		else if(ExpertCom.codestatus!='ok')
		{
			W("#btnrobcode").attr("disabled","disabled").addClass("disabled");
			W("#checkcode_errmsg").show().html("正在验证验证码...");
			CheckValidateCode();			
		}
		else
		{	
			W("#mobile_errmsg").hide();
			W("#checkcode_errmsg").hide();
			W("#datetime_errmsg").hide();
			if(ExpertCom.mbok=='ok' && ExpertCom.seltype=='mb')
			{
					W("#sucessfuwucode").html(ExpertCom.fuwuCode);
					W(".freefuwucode").html(ExpertCom.fuwuCode);
					W("#acDialogbox").hide();
					W("#exposeMask").hide();
					W("div[js-name='winclose']").show();
					DialogOnLineExpert('mb');
					ShowDiffentDiv("folksuccess");
					dialogWindow.WinClose("acDialogbox");
					dialogWindow.InitWin("acDialogbox",'suc');
			}	
		}	
}

//显示不成的层
var ShowDiffentDiv=function(param)
{
	W("div[js-name='showbox']").forEach(function(el,i)
	{
		var jsAttr=	W(el).getAttr("js-data");
		if(jsAttr==param)
		{
			W(el).show();
		}
		else
		{
			W(el).hide();	
		}
	});
}
//显示不同的标题和内容
var SetDiffDiv=function(ptype)
{
	if(ExpertCom.codeType==1)
	{
		W("#reservation-hd").show();
		W("#renzhengjia-hd").hide();
		W("#box-res-hd").show();
		W("#box-renzheng-hd").hide();
		W("#hd-select").html("请选择服务时间：");	
	}
	else
	{
		W("#hd-select").html("请选择服务：");	
		W("#reservation-hd").hide();
		W("#renzhengjia-hd").hide();
		W("#box-res-hd").hide();
		W("#box-renzheng-hd").show();	
	}		
}
//验证手机号
var CheckMobileTest=function(mobile)
{
	return tcb.validMobile(mobile)
}
//验证验证码
var CheckMobileCode=function(code)
{
	var ret=ExpertCom.code_reg.test(code);
	return ret;	
}
//发送验证码
var SendExperMobileCode=function()
{
	ExpertCom.mobile=W("#mobile").getValue();
	if(!CheckMobileTest(ExpertCom.mobile))
	{
			W("#mobile_errmsg").show().html("请输入正确的手机号");	
	}
	else
	{
		W("#validatecode").addClass("disable");
		
		if(Commstr.wait_verycode) clearInterval(Commstr.wait_verycode);
		Commstr.wait_verycode=setInterval(function()
		{
			var disnum=W("#validatecode").attr("disnum");
				disnum=disnum ? disnum : 0;
				W("#validatecode").attr("disnum",parseInt(disnum)-1);
				disnum=W("#validatecode").attr("disnum");
				if(parseInt(disnum)==0)
				{
						W("#validatecode").attr("disnum",180);
						W("#validatecode").attr("rel",0);
						W("#validatecode").removeClass("disable");
						W("#validatecode").html("重发验证码");
						if(Commstr.wait_verycode) clearInterval(Commstr.wait_verycode);
						Commstr.wait_verycode=0;
				}
				else
				{
						W("#validatecode").html("剩余 "+disnum+" 秒");
				}
		},1000);
		loadJsonp('http://open.jishi.360.cn/huodong/checkcode?mobile='+ExpertCom.mobile+'&cb=%callbackfun%&type='+ExpertCom.codeType+'&stype='+ExpertCom.seltype+'&t='+Math.random()+'', function(data){
				var response = Object.stringify(data);
				var retval=JSON.parse(response);
					if(retval['status']==='mbexists')
					{
						dialogWindow.InitWin("acDialogbox");
						ShowDiffentDiv("robed");	
					}
					if(retval['status']=='noExpire')
					{
						W("#mobile_errmsg").show().html("请您查看最近一次的手机验证码");
						
					}
					if(retval['status']=='mobileErr')
					{
						W("#mobile_errmsg").show().html("手机短信发送失败");
						if(Commstr.wait_verycode) clearInterval(Commstr.wait_verycode);
					}
					if(retval['status']=='limitation')
					{
						W("#mobile_errmsg").show().html("您的手机号今天已多次发送验证码，请您明天再试。");
	
					}
					if(retval['status']=='ok')
					{
						W("#mobile_errmsg").show().html("发送成功");
						W("#validatecode").attr("disabled","disabled");
						W("#validatecode").attr("rel",1);
					}
		});
	}
}

//验证验证码是否正确
var CheckValidateCode=function()
{
	ExpertCom.checkmobileCode=W("#checkmobileCode").getValue();
	ExpertCom.mobile=W("#mobile").getValue();
	if(!CheckMobileTest(ExpertCom.mobile))
	{
			W("#mobile_errmsg").show().html("请输入正确的手机号");	
	}
	else if(!CheckMobileCode(ExpertCom.checkmobileCode))
	{
		W("#checkcode_errmsg").show().html("请输入正确的验证码");		
	}
	else
	{
		if(ExpertCom.codeType==1)
		{
			var ftype='expert';	
		}
		else
		{
			var ftype=ExpertCom.seltype;		
		}
		loadJsonp('http://open.jishi.360.cn/huodong/verify?mobile='+ExpertCom.mobile+'&code='+ExpertCom.checkmobileCode+'&type='+ftype+'&cb=%callbackfun%&t='+Math.random()+'', function(data){
				var response = Object.stringify(data);
				var retval=JSON.parse(response);
					if(retval['status']=='ok')
					{
						ExpertCom.codestatus='ok';
						ExpertCom.fuwuCode	=retval['code'];
						W("#checkmobileCode").attr("disabled","disabled");
						W("#btnrobcode").removeAttr("disabled").removeClass("disabled");
						W("#checkcode_errmsg").show().html("验证码正确");
						SubmitFormRobe();
					}
					else if(retval['status']=='verifyErr')
					{
						W("#checkcode_errmsg").show().html("手机短信验证失败");
						W("#btnrobcode").removeAttr("disabled").removeClass("disabled");
					}
					else if(retval['status']=='limitation')
					{
						W("#checkcode_errmsg").show().html("您的手机号今天已多次发送验证码，请您明天再试。");	
						W("#btnrobcode").removeAttr("disabled").removeClass("disabled");
					}
					else if(retval['status']=='mbexists')
					{
						dialogWindow.InitWin("acDialogbox");
						ShowDiffentDiv("robed");	
					}
					else
					{
						W("#checkcode_errmsg").show().html("手机短信验证失败");
						W("#btnrobcode").removeAttr("disabled").removeClass("disabled");
					}
		});
	}
}


var CheckMobileFocusBlur=function()
{
	W("#mobile").blur(function()
	{
		var sval=W(this).val();
		if(sval=='')
		{
			W(this).val("每个用户限抢一次，请正确填写");	
			W("#mobile_errmsg").hide();
		}
		else if(!CheckMobileTest(sval))
		{
			W("#mobile_errmsg").show().html("请输入正确的手机号");			
		}
		else
		{
			W(this).addClass("font33");
			W("#mobile_errmsg").hide();		
		}
	});
	W("#mobile").focus(function()
	{
		W(this).addClass("font33");
		var sval=W(this).val();
		if(sval=='每个用户限抢一次，请正确填写')
		{
			W(this).show().val('');	
			W("#mobile_errmsg").hide();	
		}
		else if(sval=='')
		{
			W("#mobile_errmsg").hide();	
		}
	});
}
var CheckValidateCodeFocusBlur=function()
{
	W("#checkmobileCode").blur(function()
	{
		var sval=W(this).val();
		if(sval=='')
		{	
			W("#checkcode_errmsg").show().html('请输入验证码');
		}
		else if(!CheckMobileCode(sval))
		{
			W("#checkcode_errmsg").show().html("请输入正确的验证码");			
		}
		else
		{
			W("#checkcode_errmsg").hide();
					
		}
	});
	W("#checkmobileCode").focus(function()
	{
		var sval=W(this).val();
		if(sval=='')
		{
			W("#checkcode_errmsg").hide().html('请输入验证码');
			W(this).addClass("font33");
		}
	});
}

//检查是否可以抢码
var CheckNowUseful=function(ftype)
{
	if(ftype=='pc')
	{
	}
	else
	{
		loadJsonp('http://open.jishi.360.cn/huodong/checkuseful?type=mb&cb=%callbackfun%&t='+Math.random()+'', function(data)
			{
				var response = Object.stringify(data);
				var retval=JSON.parse(response);
				if(retval['date']=='20140524' || parseInt(retval['datetime']) >= 2014052400)
				{
					ExpertCom.hdenable='limitation';
					ExpertCom.limitmb="mb";
					OverOnTimeHuodong("mb");
					ExpertCom.zjenabled='limit';
						
				}
				else if(retval['status']==='ok')
				{
					ExpertCom.hdenable='ok';
					ExpertCom.mbok="ok";
					InitInstanceHudong("mb");
				}
				else
				{
					ExpertCom.hdenable='limitation';
					ExpertCom.limitmb="mb";
					OnTimeOverRobed("mb");
					dialogWindow.WinClose("acDialogbox");
					W("#TimerOutmb").show();
					RobeOnTime();
					ExpertCom.Timer.StartTime();				
				}		
		});		
		
			
	}
}


Commstr.plugin={
		ieobj:null,
		chromobj:null,
		version:0,
		isupdate:0,
		retval:0,
		pTime:0,
		pNum:0,
		wdExists:0,
		pluginTimer:function()
		{
			if(Commstr.plugin.pTime) clearInterval(Commstr.plugin.pTime);
			Commstr.plugin.pTime=setInterval(function(){
				Commstr.plugin.pNum+=1;	
				if(Commstr.plugin.exists() || Commstr.plugin.pNum > 50)
				{
					clearInterval(Commstr.plugin.pTime);
					Commstr.plugin.pNum=0;	
				}
			},200);
		},
		exists:function()
		{
			var retval=false;
			if(window.wdextcmd && typeof wdextcmd.CallDiagScanWithParam != 'unknown' && wdextcmd.CallDiagScanWithParam) 
			{
				retval=true;
				Commstr.plugin.wdExists=1;
				
			}
			else if(typeof external == 'object')
			{
				try{
					external.AppCmd(external.GetSID(window),"","wdroute","hasapp","dsdlg",function(i1,s1){
						if (i1==1) 
						{
							Commstr.plugin.retval=true;
							Commstr.plugin.wdExists=1;
						}
						else
						{
							Commstr.plugin.retval=false;
							Commstr.plugin.wdExists=0;	
						}	
					});
					retval=Commstr.plugin.retval;
					
				}
				catch(e)
				{
					retval=Commstr.plugin.pluginExists();
						
				}
			}
			else
			{
				retval=Commstr.plugin.pluginExists();	
			}
			return 	retval;	
		},
		pluginExists:function()
		{
			var retval=false;			
			try{
				Commstr.plugin.ieobj=document.getElementById("jishiieplugin");
				Commstr.plugin.version=Commstr.plugin.ieobj.GetVersion();
				retval=true;		
			}catch(e)
			{
				
				try{
					Commstr.plugin.chromobj=document.getElementById("jishichromeplugin");
					Commstr.plugin.version=Commstr.plugin.chromobj.GetVersion();
					var a=Commstr.plugin.chromobj.GetVersion();
					if(a)
					{
						retval=true;
					}
					else
					{
						retval=false;	
					}
				}catch(e)
				{
					retval=false;	
				}		
			}	
			return retval;
		},
		startClient:function(eid)
		{
			if(Commstr.param==0)
			{
				var extParam="/folkproblem=0 /searchfolkpage="+eid+" /consultfolk="+eid+"";;	
			}
			else if(eid==0)
			{
				var extParam=Commstr.param;	
			}
			else
			{
				var extParam=Commstr.param;	
			}
			if(window.wdextcmd && typeof wdextcmd.CallDiagScanWithParam != 'unknown' && wdextcmd.CallDiagScanWithParam) 
			{
				try
				{
					window.wdextcmd.CallDiagScanWithParam(""+extParam+"");
				}
				catch(e)
				{
					Commstr.plugin.pluginStart(extParam);	
				}
			}
			else if(typeof external == 'object')
			{
				try{
						external.AppCmd(external.GetSID(window),"","wdroute","hasapp","dsdlg",function(i1,s1)
						{
							if (i1 == 1) 
							{
								try{
										external.AppCmd(external.GetSID(window),"","wdroute","callapp->dsdlg",''+extParam+'', function(i1,s1){});
									}
									catch(ex)
									{
										Commstr.plugin.pluginStart(extParam);	
									}		
							}
							else
							{
								Commstr.plugin.pluginStart(extParam);	
							}	
						});
				}
				catch(e)
				{
					Commstr.plugin.pluginStart(extParam);	
				}	
			}
			else
			{
				Commstr.plugin.pluginStart(extParam);	
			}
		},
		pluginStart:function(eid)
		{
			try{
				if(!Commstr.plugin.ieobj)
					Commstr.plugin.ieobj=document.getElementById("jishiieplugin");
				Commstr.plugin.ieobj.RunClient(''+eid+'');			
			}catch(e)
			{
				try
				{
					Commstr.plugin.chromobj=document.getElementById("jishichromeplugin");
					Commstr.plugin.chromobj.RunClient(''+eid+'');	
				}catch(e)
				{
					
				}		
			}	
		},
		update:function()
		{
			try{
				if(!Commstr.plugin.ieobj)
					Commstr.plugin.ieobj=document.getElementById("jishiieplugin");
				Commstr.plugin.isupdate=Commstr.plugin.ieobj.IsNeedUpdate();		
			}catch(e)
			{
				try
				{
					Commstr.plugin.chromobj=document.getElementById("jishichromeplugin");
					Commstr.plugin.isupdate=Commstr.plugin.chromobj.IsNeedUpdate();		
				}catch(e)
				{
					Commstr.plugin.isupdate=0;	
				}		
			}
			return Commstr.plugin.isupdate;	
		}
	};

//如果插件存在就调起客户端
	function CheckPluginFunc(eid)
	{
	
		if(Commstr.plugin.wdExists)
		{
			Commstr.plugin.startClient(eid);
		}
		else if(Commstr.plugin.exists())
		{
			var version=Commstr.plugin.version.replace(/\./g,"");
			var update=Commstr.plugin.update();
			if(update)
			{
				alert('您需要安装360安全卫士');
				location.href='http://down.360safe.com/instbeta.exe';			
			}
			else if(version==1002)
			{
				Commstr.plugin.startClient(eid);
			}
			else
			{
				alert('您需要安装最新的专业工具。');
				location.href='http://jishi.360.cn/360ExpertPlugin.exe';		
			}
		}
		else 
		{
			alert('您需要安装最新的专业工具');
			location.href='http://jishi.360.cn/360ExpertPlugin.exe';		
		}
}
//拉取在线专家列表
var GetOnLineExpertList=function()
{
	loadJsonp('http://open.jishi.360.cn/huodong/getmobilelist?cb=%callbackfun%&t='+Math.random()+'', function(data)
	{
		var response = Object.stringify(data);
		var retval=JSON.parse(response);
		if(retval)
		{
			try{
			 
					var floklist=retval['folk'];
					var floklist=JSON.parse(floklist);
				 	var html='<table cellpadding="0" cellspacing="0" width="100%">';
					html+='<tr>';
				 	for(var j=0;j<floklist.length;j++)
					{
						var i=j;
						html+='<td>';
						html+='<div class="item-pic"><div class="item-pic-img"><img onerror="this.src=\'https://p.ssl.qhimg.com/t01134715c060cdb61f.png\'" src="http://opplat.jishi.360.cn/upload/engineer/70/'+floklist[i].technician_number+'.jpg" /></div></div>';
						html+='<div class="item-text">';
						html+='<div class="text-name"><em class="idle"></em>'+floklist[i].technician_name+'</div>';
						html+='<div class="text-info dominant">擅长：'+floklist[i].technician_competency+'</div>';
						html+='<div class="text-info">价格：<span class="text-infoh">50元/次</span> </div>';
						html+='<div class="text-info">满意度 '+floklist[i].technician_assess+'%</div>';
						html+='</div>';
						html+'</td>';
						if((parseInt(j)+1)%4==0)
						{
							 html+='</tr><tr>';
						}
					}
				 	html+='</table>';
					W("#onlinefolkexperlist").html(html);
			}
			catch(e)
			{
			}
		 
		}
	});
}

//取得当前的时分秒
var RobeOnTime=function()
{
	var time=new Date();
	var hour=time.toLocaleTimeString();
	var hour=hour.split(":");
	var h=hour[0];
	var m=hour[1];
	var s=hour[2];
	ExpertCom.Timer.dh=parseInt(h)+1;
	ExpertCom.Timer.dm=parseInt(59)-m;
	ExpertCom.Timer.ds=parseInt(60)-s;
}

var RobeOnTimePC=function()
{
	var time=new Date();
	var hour=time.toLocaleTimeString();
	var hour=hour.split(":");
	var h=hour[0];
	var m=hour[1];
	var s=hour[2];
	ExpertCom.Timer.dhpc=parseInt(h)+1;
	ExpertCom.Timer.dmpc=parseInt(59)-m;
	ExpertCom.Timer.dspc=parseInt(60)-s;
}
//定时器开始
ExpertCom.Timer.StartTime=function()
{
	if(ExpertCom.Timer.TimerId) clearInterval(ExpertCom.Timer.TimerId);
	ExpertCom.Timer.TimerId=setInterval(function()
	{
		ExpertCom.Timer.ds=parseInt(ExpertCom.Timer.ds)-1;
		if(ExpertCom.Timer.ds==0 && ExpertCom.Timer.dm > 0)
		{
			ExpertCom.Timer.dm=parseInt(ExpertCom.Timer.dm)-1;
			ExpertCom.Timer.ds=59;	
		}
		var m=ExpertCom.Timer.dm  < 10 ? "0"+ExpertCom.Timer.dm : ExpertCom.Timer.dm;
		var s=ExpertCom.Timer.ds < 10 ? "0"+ExpertCom.Timer.ds : ExpertCom.Timer.ds; 
		W("#timerHmb").html(m);
		W("#timerSmb").html(s);
		if(ExpertCom.Timer.dm==0 && ExpertCom.Timer.ds==0)
		{
			clearInterval(ExpertCom.Timer.TimerId);	
			ExpertCom.Timer.TimerId=0;
			location.reload();	
		}	
	},1000);
}


//定时器开始
ExpertCom.Timer.StartTimePC=function()
{
	if(ExpertCom.Timer.TimerPC) clearInterval(ExpertCom.Timer.TimerPC);
	ExpertCom.Timer.TimerPC=setInterval(function()
	{
		ExpertCom.Timer.dspc=parseInt(ExpertCom.Timer.dspc)-1;
		if(ExpertCom.Timer.dspc==0 && ExpertCom.Timer.dmpc > 0)
		{
			ExpertCom.Timer.dmpc=parseInt(ExpertCom.Timer.dmpc)-1;
			ExpertCom.Timer.dspc=59;	
		}
		var m=ExpertCom.Timer.dmpc  < 10 ? "0"+ExpertCom.Timer.dmpc : ExpertCom.Timer.dmpc;
		var s=ExpertCom.Timer.dspc < 10 ? "0"+ExpertCom.Timer.dspc : ExpertCom.Timer.dspc; 
		W("#timerHpc").html(m);
		W("#timerSpc").html(s);
		if(ExpertCom.Timer.dmpc==0 && ExpertCom.Timer.dspc==0)
		{
			clearInterval(ExpertCom.Timer.TimerPC);	
			ExpertCom.Timer.TimerPC=0;
			location.reload();	
		}	
	},1000);
}




var ResetInputValue=function()
{
	W("#mobile").val('每个用户限抢一次，请正确填写').removeClass("font33");
	W("#checkmobileCode").val('').removeAttr("disabled");
	W("#mobile_errmsg").hide();
	W("#checkcode_errmsg").hide();
	W("#datetime_errmsg").hide();
	W("#validatecode").attr("rel","0").html('发送验证码').removeClass("disable");
	if(Commstr.wait_verycode) clearInterval(Commstr.wait_verycode);
	W("#btnrobcode").removeAttr("disabled").removeClass("disabled");
}


var HuoDongOver=function()
{
	ExpertCom.hdenable='limitation';
	W("div[js-name='flok360']").removeClass("yellow").addClass("gray");
	W("#robnothing").html("已抢完");
	W("p[js-name='floktxt']").addClass("white");
				
	W("div[js-name='expert360']").removeClass("yellow").addClass("gray");
	W("p[js-name='expernoghting']").html("已抢完");
	W("p[js-name='experfuwu']").addClass("white");
				
	ExpertCom.zjenabled='limit';	
}

var OverOnTimeHuodong=function(ftype)
{
	if(ftype=='mb')
	{
		W("div[js-name='flok360']").show().removeClass("yellow").addClass("gray");
		W("#robnothing").html("已抢完");
		W("p[js-name='floktxt']").addClass("white");
		W("#docBottom").hide();
	}
	else
	{
		W("div[js-name='pcexpert360']").removeClass("yellow").addClass("gray");
		W("p[js-name='expernoghting']").html("已抢完");
		W("p[js-name='experfuwu']").addClass("white");	
	}	
}

var InitInstanceHudong=function(ftype)
{
	if(ftype=='mb')
	{
		W("div[js-name='flok360']").removeClass("mbflok").hide();	
		W("#robnothing").html("免费抢").removeClass("font16");
		W("p[js-name='floktxt']").removeClass("white");
	}
	
}

var OnTimeOverRobed=function(ftype)
{
	if(ftype=='mb')
	{
		W("div[js-name='flok360']").addClass("mbflok").show();
		W("#robnothing").html("本小时已抢完").addClass("font16");
		W("p[js-name='floktxt']").addClass("white");
		if( CommCalc.waitTime) clearInterval( CommCalc.waitTime);	
	}
}

/*抢成功弹出在线专家*/
var DialogOnLineExpert=function(ftype)
{
	loadJsonp('http://pay.jishi.360.cn/activity/engineerinfo?type='+ftype+'&cb=%callbackfun%&t='+Math.random()+'', function(data)
	{
				var response = Object.stringify(data);
				var floklist=JSON.parse(response);
				var html='<table cellpadding="0"  cellspacing="0" width="100%">';
					html+='<tr>';
				 	for(var j=0;j<floklist.length;j++)
					{
						var i=j;
						if(floklist[i].state==1)
						{
							var state='idle';	
						}
						else if(floklist[i].state==2)
						{
							var state='busy';	
						}
						else
						{
							var state='offline';
						}
						html+='<td jsname="folk" eid="'+floklist[i].technician_number+'">';
						html+='<div class="item-pic"><div class="item-pic-img"><img onerror="this.src=\'https://p.ssl.qhimg.com/t01134715c060cdb61f.png\'" src="http://opplat.jishi.360.cn/upload/engineer/70/'+floklist[i].technician_number+'.jpg" /></div></div>';
						html+='<div class="item-text">';
						html+='<div class="text-name"><em class="'+state+'"></em>'+floklist[i].technician_name+'</div>';
						html+='<div class="text-info dominant">擅长：'+floklist[i].technician_competency+'</div>';
						html+='<div class="text-info">价格：<span class="text-infoh">50元/次</span> </div>';
						html+='<div jsname="folk" etype="btn"   eid="'+floklist[i].technician_number+'" id="btn'+floklist[i].technician_number+'">';
						if(floklist[i].state!=3 && floklist[i].state!=0)
						{
							
							html+='<a class="btnbg_list zixunbtn" etype="folk" name="btnzixun" eid="'+floklist[i].technician_number+'" href="#">立即咨询</a>';
							html+='<a class="btnbg_list wypingjia" etype="folk" name="btnpingjia" eid="'+floklist[i].technician_number+'" href="#">网友评价</a>';		
						}
						else
						{
							html+='<a class="btnbg_list disabled" etype="folk" name="btndisabled" eid="'+floklist[i].technician_number+'" href="#">立即咨询</a>';	
							html+='<a class="btnbg_list wypingjia" etype="folk" name="btnpingjia" eid="'+floklist[i].technician_number+'" href="#">网友评价</a>';
							
						}
						html+='</div>';
						html+='<div style="display:none;" jsname="folk" etype="manyi" eid="'+floklist[i].technician_number+'" id="manyi'+floklist[i].technician_number+'" class="text-info">满意度 '+floklist[i].technician_assess+'%</div>';
						html+='</div>';
						html+'</td>';
						if((parseInt(j)+1)%3==0)
						{
							 html+='</tr><tr>';
						}
					}
				 	html+='</table>';
					W("#zhuanjiazaixian").html(html);
					if(floklist.length > 0)
					{
						if(ftype=='pc')
						{
							W("#zjlinetxtmb").hide();
							W("#zjlinetxtpc").show();
							dialogWindow.fresh();
						}
						else
						{
							W("#zjlinetxtmb").show();
							W("#zjlinetxtpc").hide();
							dialogWindow.fresh();	
						}
					}
				
					
	});	
	
}



CommCalc.InitCalcInstance=function()
{
	
	var htm=CommCalc.writeNumbox(CommCalc.NumberFomatc(CommCalc.initNumber));
	W("#solution-click-bar").html(htm);
	CommCalc.getAnimateNum();
	setInterval(CommCalc.GetRandNumber,3000);
    setInterval(CommCalc.changeClickNum, 4000);
    if( CommCalc.waitTime) clearInterval( CommCalc.waitTime);
    CommCalc.waitTime=setInterval(CommCalc.animateNum, 50);
   
}
CommCalc.GetRandNumber=function()
{
	 loadJsonp('http://open.jishi.360.cn/huodong/getnumber?cb=%callbackfun%&t='+Math.random()+'', function(data)
	{
		var response = Object.stringify(data);
		var retval=JSON.parse(response);
		if(retval['sum'])
		{
			CommCalc.initNumber=data['sum'];
			W("#solution-click-bar").attr("user-num",data['sum']);
		}
	});		
	
}
CommCalc.writeNumbox=function(num)
{
	var html = '', len = num.length;
	for( var i=0; i < len; i++ ){
	    var n = num.substr(i,1);
	    if( n == ',' ){
	        html += '<span class="num-doct"></span>';  
	    }else{
	        var n = parseInt(n)*CommCalc.h;
	        html += '<span class="num-item" style="background-position:0 -'+n+'px;" cur="'+n+'"></span>';  
	    }
	}
	return html;
}
CommCalc.NumberFomatc=function( num )
{
	if( !num )
		return '';
	num = num.toString();
	var resNum = '', doc=0;
	for( var i= num.length-1; i>=0; i-- ){
		resNum = (++doc%3==0&&i>0?',':'')+num.substr(i,1)+resNum;
	}
	return resNum;	
}
CommCalc.Random=function(lower, upper) 
{
	return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

CommCalc.initClickNum=function( num )
{
	num = num || 21606572;
	var D = new Date();
	num += (D.getHours()*3600+D.getMinutes()*60+D.getSeconds() );
	return num;
}
CommCalc.getAnimateNum=function()
{
	CommCalc.Num_item=new Array();
	 var num_c = document.getElementById('solution-click-bar').childNodes;
      for( var i in num_c )
      {
         if( num_c[i].className && num_c[i].className.indexOf('num-item') != -1 )
                CommCalc.Num_item.push(num_c[i]);
      }	
}

CommCalc.changeClickNum=function()
{
        // Random
        var h = CommCalc.h;
        var obj = document.getElementById('solution-click-bar'), num_cur = parseInt(obj.getAttribute('user-num')) || CommCalc.initNumber;
        if( !num_cur )
            num_cur = CommCalc.initClickNum(num_cur);
       // num = num_cur + CommCalc.Random(1, 3);
        num = num_cur;
        obj.setAttribute('user-num', num);
        var num_str = num.toString();
        if( num_str.length > CommCalc.Num_item.length ){
            document.getElementById('solution-click-bar').innerHTML = CommCalc.writeNumbox( CommCalc.NumberFomatc(num) );
            CommCalc.getAnimateNum();
        }
        num_cur = num_cur.toString();
        for( var i=num_str.length-1; i>=0; i-- )
        {
            var n = num_str.substr(i,1);
             CommCalc.Num_item[i].setAttribute('to',parseInt(n)*h+( i<=0 || num_cur.substr(i-1,1) == num_str.substr(i-1,1) ? 0 : 10*h ) );
        }
}
CommCalc.animateNum=function()
{
        var h = CommCalc.h;
        for( var i=CommCalc.Num_item.length-1; i>=0; i-- ){
            var tar = CommCalc.Num_item[i];
            if( !tar.getAttribute('to') )
                continue;

            var cur = parseInt(tar.getAttribute('cur')) || 0,
                to = parseInt(tar.getAttribute('to')) || 0,
                step = parseInt(tar.getAttribute('step')) || 0;
            if( cur == to )
                continue;
            if( Math.abs(to-cur) <= 2 || (to-cur < 0 && (to-(cur-10*h))<=2) ){
                cur = to;
                step = 0;
            }else {
                step = step || Math.abs( to-cur<0  ?  (to+10*h-cur)/20  :  (to-cur)/20 );
                cur += Math.floor( step );
                if( cur == to )
                    step = 0;
            }
            tar.setAttribute('cur', cur+'');
            tar.setAttribute('step',step);
            tar.style.backgroundPosition = '0 -'+cur+'px';
        }

}




