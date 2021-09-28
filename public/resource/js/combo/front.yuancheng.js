;/**import from `/resource/js/page/front.yuancheng.js` **/
/**
 * 民间专家首页
 */
Dom.ready(function() {
var Commstr={param:0,tablist:['shangjiainfo','chengjiaojilu','introducecont','userpinglun']};
Commstr.localurl=location.href;

/*找他服务按钮*/
W("#findtafuwu").click(function(e)
{
	e.preventDefault();
	var eid=W(this).getAttr("eid");
	var state=W(this).getAttr("jsoff");
	if(state=='OFFLINE')
	{
	
		showplugdiv('offoneline');
		dialogWindow.InitWin("dialogplugin");	
	}
	else if(Commstr.plugin.exists())
	{
		Commstr.param="/folkproblem=0 /searchfolkpage="+eid+" /consultfolk="+eid+"";	
		CheckPluginFunc(eid)	
	}
	else
	{	
		showplugdiv('install');
		dialogWindow.InitWin("dialogplugin");
	}
	
});
W(".bd-box-close").click(function(e)
{
	e.preventDefault();
	var wid=W(this).getAttr("wid");
	dialogWindow.WinClose(""+wid+"");
	location.reload();		
});

W("a[name='btnplug']").click(function(e)
	{
		e.preventDefault();
		var rel=W(this).getAttr("rel");
		if(rel=='down')
		{
			W("#DownJishiPlug").empty().append("<iframe src=\"http://jishi.360.cn/360ExpertPlugin.exe\" width=0 height=0></iframe>");
			showplugdiv('installed');
		}
		else if(rel=='insted')
		{
			Commstr.Cookie.set("install","jishi");
			location.reload();
		}
		else if(rel=='installok')
		{
			var eid=W("#findtafuwu").getAttr("eid");
			var state=W("#findtafuwu").getAttr("jsoff");
			if(state=='OFFLINE')
			{
			
				showplugdiv('offoneline');
				dialogWindow.InitWin("dialogplugin");	
			}
			else
			{
				CheckPluginFunc(""+eid+"");	
			}
		}
		else if(rel=='findother')
		{
			Commstr.param="/folkproblem=0 /searchfolkpage=电脑问题";
			CheckPluginFunc("0");
			
		}
	});


/*tab切换区域*/
W('a[name="atab"]').click(function(e)
{
	e.preventDefault();
	var jstab=W(this).getAttr("js-data");
	for(var t in Commstr.tablist)
	{
		var curtab=Commstr.tablist[t];
		W('div[js-attr="tabdiv"]').forEach(function(el,i)
		{
			var curid=W(el).getAttr("id");
			if(curid!=jstab)
			{
				W(el).css("display","none");
					
			}
			else
			{
				W(el).css("display","block");	
			}
		});
	}
	W('a[name="atab"]').forEach(function(el,i)
	{
		var curtab=W(el).getAttr("js-data");
		if(curtab!=jstab)
		{
			W(el).removeClass("curl");
			W(el).parentNode("li").removeClass("curl");
		}
		else
		{
			W(el).addClass("curl");
			W(el).parentNode("li").addClass("curl");	
		}	
	});	
	
});
/*评论切换*/
W("input[name='pinlun']").click(function()
{
		var rel=W(this).getAttr("state");
		if(rel==0)
		{
			W('div[js-name="pinlun"]').forEach(function(el,i)
			{
				W(el).css("display","block");
			});	
		}
		else
		{
			W('div[js-name="pinlun"]').forEach(function(el,i)
			{
				if(W(el).getAttr("grade")==rel)
				{
					W(el).css("display","block");
				}
				else
				{
					W(el).css("display","none");
				}
			});			
	}
});
//设置评论数
SetPingNumber();
function SetPingNumber()
{
		var hao=0;
		var cha=0;
		W('div[js-name="pinlun"]').forEach(function(el,i)
		{
			if(W(el).attr("grade")==1)
			{
				hao++;
			}
			else
			{
				cha++;
			}
		});
		W("#numhaoping").setHtml(hao);
		W("#numchaping").setHtml(cha);		
}

	//如果插件存在就调起客户端
	function CheckPluginFunc(eid)
	{
	
		if(Commstr.plugin.wdExists)
		{
			Commstr.plugin.startClient(eid);
			dialogWindow.WinClose("dialogplugin");		
		}
		else if(Commstr.plugin.exists())
		{
			var version=Commstr.plugin.version.replace(/\./g,"");
			var update=Commstr.plugin.update();
			if(update)
			{
				showplugdiv('instsafe');
				dialogWindow.InitWin("dialogplugin");
				Commstr.plugin.startClient(eid);
				if(Commstr.safetime) clearTimeout(Commstr.safetime);
				Commstr.safetime=setTimeout(function(){location.reload();},120000);
			}
			else if(version==1002)
			{
				Commstr.plugin.startClient(eid);
				dialogWindow.WinClose("dialogplugin");		
			}
			else if(version==1001)
			{
				showplugdiv('install');
				dialogWindow.InitWin("dialogplugin");
				$("#plugnewname").text("您需要安装最新的专业工具！");
			}
			else
			{
				showplugdiv('install');
				dialogWindow.InitWin("dialogplugin");			
			}
		}
		else 
		{
			showplugdiv('install');
			dialogWindow.InitWin("dialogplugin");
		}
	}

function showplugdiv(rel)
{
	W(".plugdia").forEach(function(el,i)
	{
		if(W(el).getAttr("rel")==rel)
		{
			W(el).show();	
		}
		else
		{
			W(el).hide();	
		}
	});	
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
	//弹出窗口
	var dialogWindow=
	{	
		wrapId:null,
		InitWin:function(wrapId)
		{
			dialogWindow.wrapId=wrapId;	
			dialogWindow.WinOpen();
		},
		WinOpen:function()
		{
			var size = W(document.body).getSize();
			var wsize = W(document.body).getSize();
			var docH	= size.height;
			var docW	= size.width;
			var dsize	= W('#'+dialogWindow.wrapId).getSize();
			var boxH	= 1000;
			var boxW	= 327/2;
			var boxTop	= 300;
			var boxLeft	= wsize.width/2 - boxW;
			var p = 'fixed';
			W('#'+dialogWindow.wrapId).insertAdjacentHTML("afterend",'<div id="exposeMask" style="position:fixed; top:0px;left: 0px;filter:alpha(opacity=70);opacity:0.5;z-index:9998;width:'+docW+'px;height:'+docH+'px;background:#000;"></div>');
			W('#'+dialogWindow.wrapId).css({"position":""+p+"","z-index": "9999", "top":""+boxTop+"px","left":""+boxLeft+"px"}).show();		
		},
		WinClose:function(wrapId)
		{
			W("#"+wrapId).hide();
			W("#exposeMask").hide();
			W("#exposeMask").removeNode();
			W("#exposeMask").removeNode();	
		}
	};
	Commstr.plugin.pluginTimer();	

	Commstr.Cookie = {	
		/*得到cookie的值*/
		get: function(key) {
			var tmp =  document.cookie.match((new RegExp(key +'=[a-zA-Z0-9.()=|%/]+($|;)','g')));
			if(!tmp || !tmp[0]) return null;
			else return unescape(tmp[0].substring(key.length+1,tmp[0].length).replace(';','')) || null;
		},	
		/** 设置cookie
		参数 (键名 值 过期时间 路径 域名,ssh)
		 */
		set: function(key, value, ttl, path, domain, secure) {
			if(ttl==undefined)
			{
				ttl=800;
				var expires=Commstr.Cookie.hoursToExpireDate(ttl);
			}
			else
			{
				var expires=ttl;	
			}
			var cookie = [	key+'='+    escape(value),
							'expires='+expires,
							'path='+    ((!path   || path=='')  ? '/' : path),
							'domain='+  ((!domain || domain=='')?  window.location.hostname : domain)
					  ];
			//if(ttl==undefined)	ttl=2500;
			//if (ttl)         cookie.push(Comm.Cookie.hoursToExpireDate(ttl));
			//if (secure)      cookie.push('secure');
			return document.cookie = cookie.join('; ');
		},
		/* 清除cookie(键名 路径 域名)*/
		unset: function(key, path, domain) {
			path   = (!path   || typeof path   != 'string') ? '' : path;
			domain = (!domain || typeof domain != 'string') ? '' : domain;
			if (Commstr.Cookie.get(key)) Commstr.Cookie.set(key, '', 'Mon, 26 Jul 1997 05:00:00 GMT', path, domain);
		},

		/** 设置过期时间*/
		hoursToExpireDate: function(ttl) {
			if (parseInt(ttl) == 'NaN' ) return '';
			else {
				var now = new Date();
				now.setTime(now.getTime() + (parseInt(ttl) * 60 * 60 * 1000));
				return now.toGMTString();			
			}
		},
		//删除所有 cookies
		clear : function (){
			var keys=document.cookie.match(/[^ =;]+(?=\=)/g);
			if (keys) {
				for (var i = keys.length; i--;){			
					Commstr.Cookie.unset( keys[i] );					
				}
			}
		} 
		
	};
	
	var instok=Commstr.Cookie.get("install");
	if(instok=='jishi')
	{
		if(Commstr.plugin.exists())
		{
			showplugdiv('installok');
			dialogWindow.InitWin("dialogplugin");
		}
		Commstr.Cookie.unset("install");	
	}
});


