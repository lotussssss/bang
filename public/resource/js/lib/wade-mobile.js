/**
 * 与客户端交互的基础API：简化IPU框架的 wade-mobile.js
 * 调用方式：
 * 1、先引入wade-mobile.js
 * 2、调用方法 示例
  ---扫码二维码(需要接收返回值)
    WadeMobile.scanQrCode(function(result){
        alert(result);
    },function(result){
        alert(result);
    });
  ---微信分享（不需要接收返回值）
    // 0 :分享好友; 1:分享朋友圈
    var shareType = "0";
    var params = {
        url:"网页url",
        title:"网页标题",
        desc:"网页描述"
    };
    WadeMobile.optionShare(params,shareType);
 */

	//终端类型,a为android,i为ios
	var deviceType = (function(){
		var sUserAgent = navigator.userAgent.toLowerCase();
		var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
		var bIsIphone = sUserAgent.match(/iphone os/i) == "iphone os";
		var bIsAndroid = sUserAgent.match(/android/i) == "android";
		var bIsWinphone = sUserAgent.match(/windows phone /i) == "windows phone " || sUserAgent.match(/windows phone os /i) == "windows phone os ";
		if(bIsAndroid){
			return "a";
		}else if(bIsIpad||bIsIphone){
			return "i";
		}else{
			return null;
		}
	})();
	if(!window["TerminalType"]){
		window["TerminalType"] = deviceType;
	}
	var terminalType = window["TerminalType"];

	WadeMobile = (function(){
        return{
        	isAndroid:function(){
        		return terminalType=='a';
        	},isIOS:function(){
        		return terminalType=='i';
        	},isWP:function(){
        		return terminalType=='w';
        	},isApp:function(){
        	    //判断是否是APP应用
				return terminalType!=null;
        	},
            
            //调用相机，返回图片路径
            callCamera:function(callback,err){
                 WadeMobile.callback.storageCallback("callCamera",callback);
                 execute("callCamera",[],err);
            },
            //选择图片，返回图片路径
            getPicture:function(callback,err){
                 WadeMobile.callback.storageCallback("getPicture",callback);
                 execute("getPicture",[],err);
            },
			//调用二维码
			scanQrCode:function(callback,err){
                 WadeMobile.callback.storageCallback("scanQrCode",callback);
				 execute("scanQrCode", [],err);
			},
			//返回上一页
            back:function(callback,err){
            	 execute("back", [],err);
            },
            //打开页面
            openPage:function(param,err){
                 execute("openPage", [param],err);
            }
		};
	})();

	//全局变量
	var callbackId = 0;
	var callbacks = {};//用来存放成功和失败的js回调函数
	var callbackDefine = {};//用来存放自定义的js回调函数
	var globalErrorKey = null;//全局错误关键字,定位错误

	/*绝大多数情况下,success回调函数是用不上的,有需要回调函数的时候异步方式传入取值*/
	var isAlert = true;//防止反复弹出alert
	var execute = function(action, args, error, success){
        args = stringify(args);
		if(terminalType=="a"){
			androidExecute(action, args, error, success);
		}else if(terminalType=="i"){
			iosExecute(action, args, error, success);
		}else{
            if(isAlert){
                isAlert = false
                alert(action+"无终端类型");
            }else{
                console.log(action+"无终端类型");
            }
        }
	};

	WadeMobile.execute = execute;

	var androidExecute = function(action, args, error, success){
		//执行android方法时，带入到android底层的key值为，回调方法实际的key值 + 用于在top上索引本iframe的WadeMobile的唯一标识。
		//在android底层，如果发现回调函数的key值包含这个特殊的串。那么将解析这个key。并且取出加回调函数key的后半部分，作为在top上索引本iframe相对应的WadeMobile对象的唯一依据。
		var tmpKey = action+callbackId++;
		if(window._WadeMobileSet_Key_ != undefined){
			tmpKey += window._WadeMobileSet_Key_;
		}
        var callbackKey = globalErrorKey = tmpKey;
        if (success || error) {
    		callbacks[callbackKey] = {success:success, error:error};
        }
        window.AIClient.exec(action, callbackKey, args);
        globalErrorKey = null;
	};

    var iosExecute = function(action, args, error, success){
        var callbackKey = globalErrorKey = action+callbackId++;
        if (success || error) {
            callbacks[callbackKey] = {success:success, error:error};
        }

        var WADE_SCHEME = "wade://";
        var url = WADE_SCHEME+action+"?param="+encodeURIComponent(args)+"&callback="+callbackKey;
        //一个动作请求客户端的最大数量，超过会造成请求覆盖
        var limitAction = 10;
        var ifrmName = "WADE_FRAME_"+(callbackId%limitAction);
        var ifrm = document.getElementById(ifrmName);
        if(!ifrm){
            var ifrm = document.createElement("iframe");
            ifrm.setAttribute("id",ifrmName);
            ifrm.setAttribute("width","0");
            ifrm.setAttribute("height","0");
            ifrm.setAttribute("border","0");
            ifrm.setAttribute("frameBorder","0");
            ifrm.setAttribute("name",ifrmName);
            document.body.appendChild(ifrm);
        }
        document.getElementById(ifrmName).contentWindow.location = encodeURIComponent(url);
        //document.getElementById(ifrmName).src = encodeURI(url);//无法处理&符号
        globalErrorKey = null;
	};


	WadeMobile.callback = (function(){
		return{
			success:function(callbackKey, message) {
				if(typeof message == "undefined"){
					return;
				}
			    if (callbacks[callbackKey]) {
	                if (callbacks[callbackKey].success) {
	                	if(typeof callbacks[callbackKey].success==="function"){
	                		var func = callbacks[callbackKey].success;
	                		func(message);
	                	}else{
	                		_eval(callbacks[callbackKey].success+"('"+message+"','"+callbackKey+"')");
	                	}
	                }
			        if (callbacks[callbackKey]) {
			            delete callbacks[callbackKey];
			        }
			    }
			},error:function(callbackKey, message, isEncode) {
				if(typeof message == "undefined"){
					return;
				}
        		if(isEncode){
        			message = decodeURIComponent(message);
        		}
			    if (callbacks[callbackKey]) {
		            if (callbacks[callbackKey].error) {
		                if(typeof callbacks[callbackKey].error==="function"){
		                	var func = callbacks[callbackKey].error;
		                	func(message);
	                	}else{
	                		_eval(callbacks[callbackKey].error+"('"+message+"','"+callbackKey+"')");
	                	}
		            }
			        if (callbacks[callbackKey]) {
			            delete callbacks[callbackKey];
			        }
			    }else{
			    	alert(message);
			    }
			},storageCallback:function(action,callback){
				var callbackKey = action+callbackId;
				if (callback) {
		            callbackDefine[callbackKey] = {callback:callback};
		        }
			},execCallback:function(callbackKey, data, isEncode){
				globalErrorKey = callbackKey;
				var callbackItem = callbackDefine[callbackKey];
				if (callbackItem) {
					data = data=="null"?null:data;
					if(data){
		        		if(isEncode){
		        			data = decodeURIComponent(data);
		        		}
		        	}
		            if (callbackItem.callback) {
		                if(typeof callbackItem.callback==="function"){
		                	var func = callbackItem.callback;
		                	func(data);
	                	}else{
	                		_eval(callbackItem.callback+"('"+data+"','"+callbackKey+"')");
	                	}
		            }
			        if (callbackItem) {
			            delete callbackDefine[callbackKey];
			        }
			    }
				globalErrorKey = null;
			}
		};
	})();

	/************公共方法**************/
	/**
	 * @param {String}  errorMessage   错误信息
	 * @param {String}  scriptURI      错误文件
	 * @param {Long}    lineNumber     错误行号
	 */
	window.onerror = function(errorMessage, scriptURI, lineNumber) {
		var msgArray = new Array();
		if (errorMessage)
			msgArray.push("错误信息:" + errorMessage);
		if (lineNumber)
			msgArray.push("错误行号:" + lineNumber);
		if (globalErrorKey)
			msgArray.push("错误关键字:" + globalErrorKey);
		if (scriptURI)
			msgArray.push("错误文件:" + scriptURI);
		var msg = msgArray.join("\t\n");

		alert(msg);
	};

	//动态执行js方法
	function _eval(code,action){
		var func = eval(code);
		if(typeof func==="function"){
			func();
		}
	}
	//格式转换方法
	function stringify(args) {
	    if (typeof JSON == "undefined") {
	        var s = "[";
	        for (var i=0; i<args.length; i++) {
	            if (i > 0) {
	                s = s + ",";
	            }
	            var type = typeof args[i];
	            if ((type == "number") || (type == "boolean")) {
	                s = s + args[i];
	            }
	            else if (args[i] instanceof Array) {
	            	s = s + "[" + args[i] + "]";
	            }
	            else if (args[i] instanceof Object) {
	            	var start = true;
	            	s = s + '{';
	            	for (var name in args[i]) {
	            		if (args[i][name] != null) {
		            		if (!start) {
		            			s = s + ',';
		            		}
		            		s = s + '"' + name + '":';
		            		var nameType = typeof args[i][name];
		            		if ((nameType == "number") || (nameType == "boolean")) {
		            			s = s + args[i][name];
		            		}
		            		else if ((typeof args[i][name]) == 'function') {
			           			// don't copy the functions
		            			s = s + '""';
		            		}
		            		else if (args[i][name] instanceof Object) {
		            			s = s + stringify(args[i][name]);
		            		}
		            		else {
		                        s = s + '"' + args[i][name] + '"';
		            		}
		                    start=false;
		                 }
	            	}
	            	s = s + '}';
	            }else {
	                var a = args[i].replace(/\\/g, '\\\\');
	                a = a.replace(/"/g, '\\"');
	                s = s + '"' + a + '"';
	            }
	        }
	        s = s + "]";
	        return s;
	    }else {
	        return JSON.stringify(args);
	    }
	};

    //让top对象上，保持有一个当前iframe里面的WadeMobile对象的引用。
    //注意：在iframe中，_WadeMobileSet_Key_+时间戳表示一个key，此key作为了在top对象上索引iframe中的WadeMobile的依据。
    //将保持引用的key值存入到当前ifame的window对象上。
    (function(){
        if(top != window){
            if(top.WadeMobileSet == undefined){
                top.WadeMobileSet = {};
            }
            for(var key in top.WadeMobileSet){
                if(top.WadeMobileSet[key] == undefined && key.indexOf("_WadeMobileSet_Key_") != -1){
                    delete top.WadeMobileSet[key];
                }
            }
            var key = "_WadeMobileSet_Key_" + new Date().getTime();
            window._WadeMobileSet_Key_ = key;
            console.log("In an iframe, window.WadeMobile object is referenced top.WadeMobileSet." + key);
            top.WadeMobileSet[key] = window.WadeMobile;
        }
    })();
