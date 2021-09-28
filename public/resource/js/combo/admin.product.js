;/**import from `/resource/js/component/valid.js` **/
/**	
 * @class Valid Valid form验证
 * @namespace QW
 * @singleton 
 */


(function() {
	var QW = window.QW,
		loadJs = QW.loadJs,
		mix = QW.ObjectH.mix,
		StringH = QW.StringH,
		trim = StringH.trim,
		tmpl = StringH.tmpl,
		dbc2sbc = StringH.dbc2sbc,
		byteLen = StringH.byteLen,
		evalExp = StringH.evalExp,
		formatDate = QW.DateH.format,
		NodeH = QW.NodeH,
		g = NodeH.g,
		query = NodeH.query,
		getValue = NodeH.getValue,
		getAttr2 = function(el, attr) {
			if(!el || !el.getAttribute) return '';
			return el[attr] || el.getAttribute(attr) || getJsAttr(el, attr);
		},
		createElement = QW.DomU.create,
		CustEvent = QW.CustEvent;

	var Valid = {
		VERSION: '0.0.1',
		EVENTS: 'hint,blur,pass,fail,beforecheckall,checkall,initall'.split(','),
		validPath: QW.PATH + 'components/valid/',
		REQ_ATTR: 'reqMsg',
		//默认的必须输入属性名称
		_curReqAttr: 'reqMsg' //当前必须输入属性名称(例如,对于"保存订单草稿"和"下订单"两个按钮,必须输入属性值可能不一样)
	};

	/* 
	* 从JsData中获取element对象的属性
	* @method	getJsAttr
	* @param	{HTMLElement} el 目标对象
	* @param	{string} attribute 属性名称
	* @return	{any}
	*/
	var getJsAttr = function(el, attribute) {
		var CheckRules = Valid.CheckRules;
		if (!CheckRules) return null;
		attribute = attribute.toLowerCase();
		el = g(el);
		var keys = []; //优先度:id>name>className>tagName
		if (el.id) keys.push('#' + el.id); //id
		if (el.name) keys.push('@' + el.name); //name
		keys = keys.concat(el.className.match(/\.[\w\-]+/g) || [], (el.tagName + '').toLowerCase()); //className>tagName
		for (var i = 0, len = keys.length; i < len; i++) {
			var key = keys[i];
			if ((key in CheckRules) && (attribute in CheckRules[key])) return CheckRules[key][attribute];
		}
		return null;
	};
	/**
	 * CheckRules 一个命名空间，用来存贮跟元素对应变量.
	 * @property	{Json} CheckRules 用来存贮跟元素对应的某些变量。
	 Valid.CheckRules={
	 'input':{datatype:'d'},
	 '#myid':{minValue:'2010-01-01'},
	 '@myname':{maxValue:'2011-01-01'},
	 '.myclass':{minValue:'2010-01-01'}
	 };
	 */
	CustEvent.createEvents(Valid, Valid.EVENTS);

	mix(Valid, {
		/** 
		 * 点亮元素
		 * @method hint
		 * @static
		 * @param {Element} el 表单元素 
		 * @return {void}
		 */
		hint: function(el) {
			Valid.fire(new CustEvent(el, 'hint')); //onhint
		},
		/** 
		 * 离开元素
		 * @method blur
		 * @static
		 * @param {Element} el 表单元素 
		 * @return {void}
		 */
		blur: function(el) {
			Valid.fire(new CustEvent(el, 'blur')); //onblur
		},
		/** 
		 * 元素通过验证
		 * @method pass
		 * @static
		 * @param {Element} el 表单元素 
		 * @return {void}
		 */
		pass: function(el) {
			Valid.fire(new CustEvent(el, 'pass')); //onpass
		},
		/** 
		 * 元素未通过验证
		 * @method fail
		 * @static
		 * @param {Element} el 表单元素 
		 * @param {string} errMsg 未通过提示信息 
		 * @param {boolean} needFocus 是否需要focus 
		 * @return {void}
		 */
		fail: function(el, errMsg, needFocus) {
			if (needFocus) Valid.focusFailEl(el);
			var ce = new CustEvent(el, 'fail');
			ce.errMsg = errMsg;

			//Jerry Qu修改。因为IE9下的focus触发是异步的
			setTimeout(function() {
				Valid.fire(ce); //onfail
			}, 0);
		},

		checkAll_stamp: 1,
		//checkAll的次数
		isChecking: false,
		//是否正在checkAll中
		/** 
		 * 验证一个表单的所有元素
		 * @method checkAll
		 * @static
		 * @param {Element} oForm 表单 
		 * @param {boolean} needFocus 是否需要focus 
		 * @param {json} opts其它参数，止前支持以下参数。
		 reqAttr: String,非空标识属性，默认值是Valid.REQATTR,即"reqMsg".
		 myValidator: Function,自己的验证函数，以处理非空验证与dataType验证无法处理的其它特殊验证。checkAll会对元素进行遍历，每个都会调用下myValidator(el)，如果该函数返回false，则表示该元素未通过验证 
		 * @return {boolean} 
		 */
		checkAll: function(oForm, needFocus, opts) {
			needFocus = (needFocus != false);
			var ce = new CustEvent(oForm, 'beforecheckall');
			ce.opts = opts || {};
			Valid.fire(ce); //onbeforecheckall
			Valid.isChecking = true;
			var els = oForm.elements,
				failEls = [];
			for (var i = 0, el; el = els[i++];) {
				if (el) {
					var nd_name = el.nodeName.toLowerCase();
					if (nd_name=='input' || nd_name=='textarea') {
						if (!getAttr2(el, "forceVld") && (el.disabled || el.readOnly || !el.offsetWidth)) continue;
						if (!Valid.check(el, false, opts)) failEls.push(el);
					}
				}
			}
			var isOk = !failEls.length;
			var ce2 = new CustEvent(oForm, 'checkall');
			ce2.result = isOk;
			ce2.failEls = failEls;
			Valid.fire(ce2); //oncheckall
			Valid.isChecking = false;
			Valid.checkAll_stamp++;
			if (!isOk && needFocus){
				window.setTimeout(function() {
					var el = null;
					for(var i=0,length=failEls.length;i<length;i++){
						if (W(failEls[i]).attr('type')!='hidden') {
							el = failEls[i];
							break;
						};
					}
					el && Valid.check(el, true, opts);
				}, 10);
			}
			return isOk;
		},

		/** 
		 * 验证一个表单元素
		 * @method check
		 * @static
		 * @param {Element} el 表单元素 
		 * @param {boolean} needFocus 是否需要focus 
		 * @param {json} opts其它参数，止前支持以下参数。
		 myValidator: Function,自己的验证函数，以处理非空验证与dataType验证无法处理的其它特殊验证。checkAll会对元素进行遍历，每个都会调用下myValidator(el)，如果该函数返回false，则表示该元素未通过验证 
		 * @return {boolean} 
		 */
		check: function(el, needFocus, opts) {
			if (!Validators.required(el) //非空验证
					|| getAttr2(el, "datatype") && !Validators.datatype(el) || (opts && opts.myValidator && !opts.myValidator(el)) //用户自定义验证
					) {
				if (needFocus) {
					Valid.focusFailEl(el);
					Valid.check(el, false, opts);
				}
				return false;
			}
			return true;
		},

		/** 
		 * 将验证结果渲染到页面
		 * @method renderResult
		 * @static
		 * @param {Element} el 表单元素 
		 * @param {boolean} result 是否通过验证 
		 * @param {string} errMsg 未通过验证时的提示信息 
		 * @param {boolean} needFocus 是否需要focus 
		 * @return {void} 
		 */
		renderResult: function(el, result, errMsg, needFocus) {
			if (result) Valid.pass(el);
			else Valid.fail(el, errMsg, needFocus);
		},

		/** 
		 * 焦点集中到未通过验证的Element上
		 * @static
		 * @method focusFailEl
		 * @param {Element} el 表单元素 
		 * @return {void} 
		 */
		focusFailEl: function(el) {
			var fEl = getAttr2(el, "focusEl");
			fEl = fEl && g(fEl) || el;
			try {
				fEl.focus();
				if (!fEl.tagName) return;
				if (QW.NodeW && QW.NodeW.shine4Error) QW.NodeW.shine4Error(fEl);
				fEl.select();
			} catch (e) {}
		},

		/** 
		 * 初始化验证，包括：监控元素的onfocus/onblur，以及日期后面添加日历按钮
		 * @method initAll
		 * @static
		 * @param {Element} container 容器HTMLElement 
		 * @return {void} 
		 */
		initAll: function(container) {
			if (!Valid._isInitialized) {
				Valid._isInitialized = true;
				if (document.addEventListener) { //非ie
					document.addEventListener('focus', function(e) {
						var el = e.target;
						if (el && ',INPUT,SELECT,TEXTAREA'.indexOf(',' + el.tagName) > -1) {
							Valid.hint(el);
						}
					}, true);
					document.addEventListener('blur', function(e) {
						var el = e.target;
						if (el && ',INPUT,SELECT,TEXTAREA'.indexOf(',' + el.tagName) > -1) {
							Valid.blur(el);
						}
					}, true);
					document.addEventListener('click', function(e) {
						var el = e.target;
						if (el.type == 'checkbox' || el.type == 'radio') {
							Valid.blur(el);
						}
					});
				} else {
					document.attachEvent('onfocusin', function(e) {
						Valid.hint(e.srcElement);
					});
					document.attachEvent('onfocusout', function(e) {
						Valid.blur(e.srcElement);
					});
				}
			}
			var els = query(container, "input");
			for (var i = 0; i < els.length; i++) {
				Valid.initEl(els[i]);
			}
			var ce = new CustEvent(container, 'initall');
			Valid.fire(ce); //oninitall

		},
		/** 
		 * 初始化验证，包括：监控元素的onfocus/onblur，以及日期后面添加日历按钮
		 * @method initEl
		 * @static
		 * @param {Element} container 容器HTMLElement 
		 * @return {void} 
		 */
		initEl: function(el) {
			var dataType = getAttr2(el, "datatype");
			if (dataType == "d" || dataType == "daterange") {//Date日期的后面会有日期按钮
				el.onclick = function(e) {
					Utils.pickDate(el);
				};
				el.autocomplete = 'off';
				//同城帮项目不要日历图标，点文本框就出日期选择浮层
				/*
				var nextEl = el.nextSibling;
				if (nextEl && nextEl.tagName == "IMG") return;
				var img = Utils.getCalendarImg().cloneNode(true);
				img.onclick = function(e) {
					Utils.pickDate(el);
				};
				el.parentNode.insertBefore(img, nextEl);
				*/
			}
		},

		/** 
		 * 将所有的错误验证信息清空。
		 * @method resetAll
		 * @static
		 * @param {Element} oForm FormHTMLElement 
		 * @return {void} 
		 */
		resetAll: function(oForm) {
			var els = oForm.elements;
			for (var i = 0, el; el = els[i++];) {
				Valid.pass(el);
			}
		}
	});


	/**
	 * @class Msgs 提示信息集合,另外提供一个得到提示信息的方法(即getMsg).
	 * @singleton
	 * @namespace QW.Valid
	 */

	var Msgs = Valid.Msgs = {
		n_integer: '请输入小于{$0}的正整数',
		n_format: '数字输入格式为"{$0}"',
		n_upper: '输入值太大，最大允许<strong>{$0}</strong>', //注意：{$0}表示允许值，{$1}表示实际值
		n_lower: '输入值太小，最小允许<strong>{$0}</strong>',
		nrange_from: '您输入的范围不合理',
		nrange_to: '您输入的范围不合理',
		n_useless_zero: '数字前面好像有多余的"0"',
		d_format: '日期输入格式为"YYYY-MM-DD"',
		d_upper: '日期太晚，最晚允许<strong>{$0}</strong>',
		d_lower: '日期太早，最早允许<strong>{$0}</strong>',
		daterange_from: '起始日期不能大于截止日期',
		daterange_to: '截止日期不能小于起始日期',
		daterange_larger_span: "时间跨度不得超过<strong>{$0}</strong>天",
		text_longer: '字数太多，最多允许<strong>{$0}</strong>字', //'{$1}字太多，最多允许<strong>{$0}</strong>字'
		text_shorter: '字数太少，最少允许<strong>{$0}</strong>字', //'{$1}字太少，最少允许<strong>{$0}</strong>字'
		bytetext_longer: '字数太多，最多允许<strong>{$0}</strong>字节', //'{$1}字节太多，最多允许<strong>{$0}</strong>字节'
		bytetext_shorter: '字数太少，最少允许<strong>{$0}</strong>字节', //'{$1}字节太少，最少允许<strong>{$0}</strong>字节'
		richtext_longer: '字数太多，最多允许<strong>{$0}</strong>字',
		richtext_shorter: '字数太少，最少允许<strong>{$0}</strong>字',
		_reconfirm: '两次输入不一致',
		_time: '请检查您输入的时间格式',
		_minute: '请检查您输入的时间格式',
		_email: '请检查您输入的Email格式',
		_mobilecode: '请检查您输入的手机号码',
		_phone: '请检查您输入的电话号码',
		_phonewithext: '请检查您输入的电话号码',
		_phonezone: '请检查您输入的电话区号',
		_phonecode: '请检查您输入的电话号码',
		_phoneext: '请检查您输入的电话分机号码',
		_zipcode: '请检查您输入的邮政编码',
		_idnumber: '请检查您输入的身份证号码，目前只支持15位或者18位',
		_bankcard: '请检查您输入的银行账号',
		_cnname: '请检查您输入的姓名',
		_vcode: '请检查您输入的验证码',
		_imgfile: '请检查您选择的图片文件路径，只支持jpg、jpeg、png、gif、tif、bmp格式',
		_regexp: '请检查您的输入',
		_magic: '请检查您的输入',
		_req_text: '请填写{$0}',
		_req_select: '请选择{$0}',
		_req_file: '请上传{$0}',
		_logicrequired: '{$0}输入不完整',
		/** 
		 * 根据msgKey获取提示信息。
		 * @method getMsg
		 * @static
		 * @param {Element} el 表单元素
		 * @param {string} msgKey msgKey.
		 * @return {string}  
		 */
		getMsg: function(el, msgKey) {
			return getAttr2(el, msgKey) || getAttr2(el, 'errmsg') || Msgs[msgKey] || msgKey;
		}
	};

	/**
	 * @class Utils 一些跟valid相关的函数.
	 * @class singleton
	 * @namespace QW.Valid
	 */

	var Utils = Valid.Utils = {
		/** 
		 * 获取日历按钮小图片。
		 * @method getCalendarImg
		 * @static
		 * @return {Element}  
		 */
		getCalendarImg: (function() {
			var calendarImg = null;
			return function() {
				return calendarImg = calendarImg || createElement('<img src="https://p.ssl.qhimg.com/t01afe970af5f13ae93.gif" align="absMiddle" class="calendar-hdl-img" style="cursor:pointer">');
			};
		}()),
		/** 
		 * 用日历浮动层来输入一个日期。
		 * @method pickDate
		 * @static
		 * @param {Element} el 表单元素
		 * @return {void}  
		 */
		pickDate: function(el) {
			if (QW.Calendar) {
				QW.Calendar.pickDate(el);
			} else {
				var calendarJsUrl = Valid.validPath + "calendar.js?v={version}"; //to get the calendarUrl Url.
				loadJs(calendarJsUrl, function() {
					QW.Calendar.pickDate(el);
				});
			}
		},
		/** 
		 * 对一个输入框设值。For IE: To keep Undo after change value.
		 * @method setTextValue
		 * @static
		 * @param {Element} el 表单元素
		 * @param {string} value value
		 * @return {void}  
		 */
		setTextValue: function(el, value) {// For IE: To keep Undo after change value.
			if (el.createTextRange) el.createTextRange().text = value;
			else el.value = value;
		},
		/** 
		 * trim一个输入框里的值.
		 * @method trimTextValue
		 * @static
		 * @param {Element} el 表单元素
		 * @return {void}  
		 */
		trimTextValue: function(el) {
			var s = trim(el.value);
			if (s != el.value) Utils.setTextValue(el, s);
		},
		/** 
		 * 把一个text的值里的全码字符转成半码字符
		 * @method dbc2sbcValue
		 * @static
		 * @param {Element} el 表单元素
		 * @return {void}  
		 */
		dbc2sbcValue: function(el) {
			var s = dbc2sbc(getValue(el));
			if (s != getValue(el)) Utils.setTextValue(el, s);
		},
		/** 
		 * datatype验证之,做的准备工作
		 * @method prepare4Vld
		 * @static
		 * @param {Element} el 表单元素
		 * @return {void}  
		 */
		prepare4Vld: function(el) {
			if (getAttr2(el,"ignoredbc")) Utils.dbc2sbcValue(el);
			if (el.type == "text" || el.type == "textarea") Utils.trimTextValue(el); //这个会导致如果用户想用空格排版的话，第一行的排版有误
		}
	};

	/**
	 * @class Validators 校验函数的集合.
	 * @singleton
	 * @namespace QW.Valid
	 */
	var Validators = Valid.Validators = {};
	mix(Validators, [{
		/** 
		 * 非空校验
		 * @method required
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		required: function(el, renderResult) {
			Utils.prepare4Vld(el);
			var reqAttr = Valid._curReqAttr || Valid.REQ_ATTR;
			var sReq = getAttr2(el, reqAttr);
			if (sReq) {//如果有reqMsg属性，则表示为非空
				var reqlogic = getAttr2(el, "reqlogic");
				if (reqlogic) {//非空逻辑验证
					return Validators.logicrequired(el, renderResult, reqlogic);
				} else {
					var isOk = false;
					var msgKey = "_req_text";
					if (el.tagName == "SELECT") {
						isOk = (el.value != "" || el.length < 2 || (el.length == 2 && el.options[1].value == ""));
						msgKey = "_req_select";
					} else if (el.type == "checkbox" || el.type == "radio") {
						var els = document.getElementsByName(el.name);
						for (var i = 0; i < els.length; i++) {
							if (isOk = els[i].checked) break;
						}
						msgKey = "_req_select";
					} else {
						isOk = (getValue(el) != "");
						if (el.type == "file") msgKey = "_req_file";
					}
					if (renderResult != false) Valid.renderResult(el, isOk, !isOk && sReq.indexOf(" ") == 0 ? sReq.substr(1) : tmpl(Msgs[msgKey], [sReq])); //潜规则：如果reqmsg是以空格开头，则尊重其内容
					return isOk;
				}

			}
			return true;
		},
		/** 
		 * 类型校验，校验一个元素的输入是否合法
		 * @method datatype
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} datatype 数据类型
		 * @return {boolean}  
		 */
		datatype: function(el, renderResult, datatype) {
			datatype = datatype || getAttr2(el, 'datatype');
			if (!datatype) {
				Valid.pass(el, renderResult);
				return true;
			}
			var dt = datatype.split('-')[0].toLowerCase(),
				pattern = datatype.substr(dt.length + 1),
				cb = Validators[dt];
			if (!cb) throw 'Unknown datatype: ' + datatype; //找不到对应的datatype，则抛异常
			return pattern ? cb(el, renderResult, pattern) : cb(el, renderResult);
		},
		/** 
		 * 数值校验
		 * @method n
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} pattern 数值格式，如'7','7.2'
		 * @return {boolean}  
		 */
		n: function(el, renderResult, pattern) {
			Utils.prepare4Vld(el);
			Utils.dbc2sbcValue(el);
			var val = getValue(el);
			var isOk = (val == "");
			var msg = null;

			if (!isOk) {
				var patternArr = (pattern || getAttr2(el, 'n-pattern') || '10').split('.');
				var len = patternArr[0] | 0 || 10,
					precision = patternArr[1] | 0;
				if (precision < 1) {
					if ((/\D/).test(val) || val.length > len) msg = tmpl(Msgs.getMsg(el, "n_integer"), [1 + new Array(len + 1).join("0")]);
				} else {
					var s = "^\\d{1,100}(\\.\\d{1," + precision + "})?$";
					if (!(new RegExp(s)).test(val)) msg = tmpl(Msgs.getMsg(el, "n_format"), [(new Array(len - precision + 1)).join("X") + "." + (new Array(precision + 1)).join("X")]);
				}
				if ((/^0\d/).test(val)) {
					val = val.replace(/^0+/g, '');
					W(el).val(val);
					//msg = Msgs.getMsg(el, "n_useless_zero");
				}
				if (!msg) {
					var maxV = getAttr2(el, "maxValue") || Math.pow(10, len-precision)-Math.pow(10, -precision);
					if (maxV && (parseFloat(val, 10) > maxV - 0)) {
						msg = tmpl(Msgs.getMsg(el, "n_upper"), [maxV, val]);
					}
					var minV = getAttr2(el, "minValue");
					if (minV && parseFloat(val, 10) < minV - 0) {
						msg = tmpl(Msgs.getMsg(el, "n_lower"), [minV, val]);
					}
				}
				if (msg) isOk = false;
				else isOk = true;
			}
			if (renderResult != false) Valid.renderResult(el, isOk, msg);
			return isOk;
		},

		/** 
		 * 数值范围校验
		 * @method nrange
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} pattern 数值格式，如'7','7.2'
		 * @return {boolean}  
		 */
		nrange: function(el, renderResult, pattern) {
			var isOk = Validators.n(el, renderResult, pattern);
			if (isOk) {
				var fromNEl = g(getAttr2(el, 'fromNEl'));
				var toNEl = g(getAttr2(el, 'toNEl'));
				if (fromNEl) {
					toNEl = el;
				} else if (toNEl) {
					fromNEl = el;
				} else { //默认在同一个容器里的两个input为一组起止时间
					var els = el.parentNode.getElementsByTagName("input");
					if (els[0] == el) {
						fromNEl = el;
						toNEl = els[1];
					} else {
						fromNEl = els[0];
						toNEl = el;
					}
				}
				var relEl = el == fromNEl ? toNEl : fromNEl;
				var isOk2 = Validators.n(relEl, renderResult, pattern);
				if (isOk2) {
					if (getValue(relEl) && getValue(el)) {
						if (getValue(fromNEl) * 1 > getValue(toNEl) * 1) {
							isOk = false;
							if (el == fromNEl) Valid.fail(fromNEl, Msgs.getMsg(fromNEl, "nrange_from"));
							if (el == toNEl) Valid.fail(toNEl, Msgs.getMsg(toNEl, "nrange_to"));
						}
					}
				}
			}
			return isOk;
		},


		/** 
		 * 日期校验
		 * @method d
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		d: function(el, renderResult) {
			Utils.prepare4Vld(el);
			Utils.dbc2sbcValue(el);
			var val = getValue(el);
			var isOk = (val == "");
			var msg = null;
			if (!isOk) {
				val = val.replace(/(^\D+)|(\D+$)/g, "").replace(/\D+/g, "/");
				if (!(/\D/).test(val)) {
					if (val.length == 8) val = val.substr(0, 4) + "/" + val.substr(4, 2) + "/" + val.substr(6, 2);
				}
				var tempD = new Date(val);
				if (!isNaN(tempD)) {
					var nStrs = val.split(/\D+/ig);
					if (nStrs.length == 3 && nStrs[0].length == 4 && nStrs[2].length < 3) { //日期格式只限制为YYYY/MM/DD,以下格式不合法：MM/DD/YYYY
						isOk = true;
						if (formatDate(tempD) != getValue(el)) {
							Utils.setTextValue(el, formatDate(tempD));
							val = getValue(el);
						}
					}
				}
				if (!isOk) {
					msg = Msgs.getMsg(el, "d_format");
				} else {
					var maxV = getAttr2(el,"maxValue") || "2049-12-31";
					if (tempD > new Date(maxV.replace(/\D+/g, "/"))) {
						isOk = false;
						msg = tmpl(Msgs.getMsg(el, "d_upper"), [maxV, val]);
					}
					var minV = getAttr2(el,"minValue") || "1900-01-01";
					if (tempD < new Date(minV.replace(/\D+/g, "/"))) {
						isOk = false;
						msg = tmpl(Msgs.getMsg(el, "d_lower"), [minV, val]);
					}
				}
			}
			if (renderResult != false) Valid.renderResult(el, isOk, msg);
			return isOk;
		},
		/** 
		 * 日期范围校验
		 * @method daterange
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		daterange: function(el, renderResult) {
			var isOk = Validators.d(el, renderResult);
			if (isOk) {
				var fromDateEl = g(getAttr2(el, 'fromDateEl'));
				var toDateEl = g(getAttr2(el, 'toDateEl'));
				if (fromDateEl) {
					toDateEl = el;
				} else if (toDateEl) {
					fromDateEl = el;
				} else { //默认在同一个容器里的两个input为一组起止时间
					var els = el.parentNode.getElementsByTagName("input");
					if (els[0] == el) {
						fromDateEl = el;
						toDateEl = els[1];
					} else {
						fromDateEl = els[0];
						toDateEl = el;
					}
				}
				var relEl = el == fromDateEl ? toDateEl : fromDateEl;
				var isOk2 = Validators.d(relEl, renderResult);
				if (isOk2) {
					if (getValue(relEl) && getValue(el)) {
						if (getValue(fromDateEl) > getValue(toDateEl)) {
							isOk = false;
							if (el == fromDateEl) Valid.fail(fromDateEl, Msgs.getMsg(fromDateEl, "daterange_from"));
							if (el == toDateEl) Valid.fail(toDateEl, Msgs.getMsg(toDateEl, "daterange_to"));
						}
						if (getValue(fromDateEl) && getValue(toDateEl)) {
							var maxDateSpan = getAttr2(fromDateEl, 'maxDateSpan') || getAttr2(toDateEl, 'maxDateSpan'); //时间跨度
							if (maxDateSpan && (new Date(getValue(toDateEl).replace(/-/g, '/')) - new Date(getValue(fromDateEl).replace(/-/g, '/'))) > (maxDateSpan - 1) * 24 * 3600000) {
								Valid.fail(el, tmpl(Msgs.getMsg(el, "daterange_larger_span"), [maxDateSpan]));
								isOk = false;
							}
						}

					}
				}
			}
			return isOk;
		},

		/** 
		 * 字符串长度校验
		 * @method _checkLength
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {function} getLengthFun 字符串长度计算函数
		 * @param {string} dataType 数据类型，如：text/bytetext/richtext
		 * @return {boolean}  
		 */
		_checkLength: function(el, renderResult, getLengthFun, dataType) {
			Utils.prepare4Vld(el);
			var val = getValue(el);
			var isOk = (val == "");
			var msg = null;
			if (!isOk) {
				var maxLen = (getAttr2(el, "maxLength") || 1024) | 0;
				var minLen = getAttr2(el, "minLength")  | 0;
				var curLen = getLengthFun(el);
				if (curLen > maxLen) {
					msg = tmpl(Msgs.getMsg(el, "text_longer") || Msgs[dataType + "_longer"], [maxLen, curLen]);
				} else if (curLen < minLen) {
					msg = tmpl(Msgs.getMsg(el, "text_shorter") || Msgs[dataType + "_shorter"], [minLen, curLen]);
				} else {
					isOk = true;
				}
			}
			if (renderResult != false) Valid.renderResult(el, isOk, msg);
			return isOk;
		},

		/** 
		 * 文本长度验证
		 * @method text
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		text: function(el, renderResult) {
			return Validators._checkLength(el || this, renderResult, function(a) {
				return getValue(a).length;
			}, "text");
		},

		/** 
		 * 字节长度验证
		 * @method bytetext
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		bytetext: function(el, renderResult) {
			return Validators._checkLength(el || this, renderResult, function(a) {
				return byteLen(getValue(a));
			}, "text");
		},

		/** 
		 * 富文本长度验证
		 * @method richtext
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		richtext: function(el, renderResult) {
			return Validators._checkLength(el || this, renderResult, function(a) {
				var s = getValue(a);
				if (getAttr2(a,"ignoreTag")) return s.replace(/<img[^>]*>/g, "a").replace(/<[^>]*>/g, "").length;
				else return s.length;
			}, "richtext");
		},
		/** 
		 * 身份证号码验证
		 * @method idnumber
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		idnumber: function(el, renderResult) {
			Utils.prepare4Vld(el);
			Utils.dbc2sbcValue(el);
			var val = getValue(el);
			var isOk = (val == "");
			if (!isOk) {
				if ((/^\d{15}$/).test(val)) {
					isOk = true; 
				} else if ((/^\d{17}[0-9xX]$/).test(val)) {
					var vs = "1,0,x,9,8,7,6,5,4,3,2".split(","),
						ps = "7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2".split(","),
						ss = val.toLowerCase().split(""),
						r = 0;
					for (var i = 0; i < 17; i++) {
						r += ps[i] * ss[i];
					}
					isOk = (vs[r % 11] == ss[17]);
				}
			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_idnumber"));
			return isOk;
		},
		/** 
		 * 中文姓名验证
		 * @method cnname
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		cnname: function(el, renderResult) {
			Utils.prepare4Vld(el);
			var val = getValue(el);
			var isOk = (val == "");
			if (!isOk) {
				isOk = byteLen(val) <= 32 && /^[\u4e00-\u9fa5a-zA-Z.\u3002\u2022]{2,32}$/.test(val);

			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_cnname"));
			return isOk;
		},

		/** 
		 * “再次输入”验证
		 * @method reconfirm
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		reconfirm: function(el, renderResult) {
			Utils.prepare4Vld(el);
			var oriEl = g(getAttr2(el, "reconfirmFor"));
			var isOk = (getValue(el) == getValue(oriEl));
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_reconfirm"));
			return isOk;
		},

		/** 
		 * 图片文件验证
		 * @method imgfile
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		imgfile: function(el, renderResult) {
			var val = getValue(el);
			var isOk = (val == "");
			if (!isOk) {
				var fExt = val.substring(val.lastIndexOf(".") + 1);
				isOk = (/^(jpg|jpeg|png|gif|tif|bmp)$/i).test(fExt);
			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_imgfile"));
			return isOk;
		},

		/** 
		 * 正则表达式验证
		 * @method reg
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		reg: function(el, renderResult, pattern, msg, ignoreDBC) {
			if (ignoreDBC) Utils.dbc2sbcValue(el);
			Utils.prepare4Vld(el);
			var val = getValue(el);
			var isOk = (val == "");
			if (!isOk) {
				msg = msg || "_regexp";
				pattern = pattern || getAttr2(el, "reg-pattern");
				if ('string' == typeof pattern) {
					pattern.replace(/^\/(.*)\/([mig]*)$/g, function(a, b, c) {
						pattern = new RegExp(b, c || '');
					});
				}
				isOk = pattern.test(val);
			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, msg));
			return isOk;
		},

		/** 
		 * 复合datatype验证
		 * @method magic
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} pattern 复合datatype表达式，如 "mobile || phone"
		 * @return {boolean}  
		 */
		magic: function(el, renderResult, pattern) {
			Utils.prepare4Vld(el);
			pattern = pattern || getAttr2(el, 'magic-pattern');
			var isOk = (getValue(el) == "" || !pattern);
			if (!isOk) {
				var opts = {
					el: el,
					Validators: Validators
				};
				var sJs = pattern.replace(/(\w+)/ig, 'opts.Validators.datatype(opts.el,false,"$1")'); //注意：如果是用户输入的dataType，这里有可能会注入。----to be fixed
				isOk = evalExp(sJs, opts);
			}
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, '_magic'));
			return isOk;
		},

		/** 
		 * 自定义datatype验证
		 * @method uv
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		uv: function(el, renderResult) {
			if (el.onblur && !el.onblur()) return false;
			return true;
		},
		/** 
		 * 简单非空验证
		 * @method notempty
		 * @static
		 * @param {Element} el 表单元素
		 * @return {boolean}  
		 */
		notempty: function(el) {
			Utils.prepare4Vld(el);
			return !!getValue(el);
		},
		/** 
		 * 复合required验证
		 * @method magic
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @param {string} reqlogic 复合required表达式
		 * @return {boolean}  
		 */
		logicrequired: function(el, renderResult, reqlogic) {
			el = el || this;
			reqlogic = reqlogic || getAttr2(el, "reqlogic");
			var reqAttr = Valid._curReqAttr || Valid.REQATTR,
				sReq = getAttr2(el, reqAttr),
				opts = {
					el: el,
					Validators: Validators
				},
				sJs = reqlogic.replace(/\$([\w\-]+)/ig, 'opts.Validators.notempty(NodeH.g("$1"))').replace(/this/ig, "opts.Validators.notempty(opts.el)"); //注意：如果是用户输入的dataType，这里有可能会注入。----to be fixed
			var isOk = evalExp(sJs, opts);
			if (renderResult != false) Valid.renderResult(el, isOk, !isOk && sReq.indexOf(" ") == 0 ? sReq.substr(1) : tmpl(Msgs["_logicrequired"], [sReq]));
			return !!isOk;
		}
	}, {
		/** 
		 * 时间验证
		 * @method magic
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		time: function(el, renderResult) {
			return Validators.reg(el, renderResult, /^(([0-1]\d)|(2[0-3])):[0-5]\d:[0-5]\d$/, "_time", true);
		},
		//时间
		/** 
		 * 时间验证
		 * @method minute
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		minute: function(el, renderResult) {
			return Validators.reg(el, renderResult, /^(([0-1]\d)|(2[0-3])):[0-5]\d$/, "_minute", true);
		},
		//分钟
		/** 
		 * 电子邮件
		 * @method email
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		email: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, "_email", true);
		},
		/** 
		 * 手机号
		 * @method mobilecode
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		mobilecode: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^(13|15|18|14)\d{9}$/, "_mobilecode", true);
		},
		/** 
		 * 含区号电话号码
		 * @method phone
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phone: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^0(10|2\d|[3-9]\d\d)[1-9]\d{6,7}$/, "_phone", true);
		},
		//不带分机的电话号
		/** 
		 * 含区号电话号码
		 * @method phone
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phonewithext: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^0(10|2\d|[3-9]\d\d)[1-9]\d{6,7}(-\d{1,7})?$/, "_phonewithext", true);
		},
		//带分机的电话号
		/** 
		 * 电话区号
		 * @method phonezone
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phonezone: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^0(10|2\d|[3-9]\d\d)$/, "_phonezone", true);
		},
		/** 
		 * 电话号码
		 * @method phonecode
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phonecode: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^[1-9]\d{6,7}$/, "_phonecode", true);
		},
		/** 
		 * 分机号
		 * @method phoneext
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		phoneext: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^\d{1,6}$/, "_phoneext", true);
		},
		/** 
		 * 邮编
		 * @method zipcode
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		zipcode: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^\d{6}$/, "_zipcode", true);
		},
		/** 
		 * 邮编
		 * @method vcode
		 * @static
		 * @param {Element} el 表单元素
		 * @param {boolean} renderResult 是否将结果展示
		 * @return {boolean}  
		 */
		vcode: function(el, renderResult) {
			return Validators.reg(el || this, renderResult, /^\w{4}$/, "_vcode", true);
		}
	}]);

	QW.provide('Valid', Valid);

}());




//----valid_youa.js
/**	
 * @class Valid Valid form验证
 * @namespace QW
 * @singleton 
 */
(function() {
	var Valid = QW.Valid,
		Validators = Valid.Validators,
		NodeH = QW.NodeH,
		g = NodeH.g,
		getAttr2 = function(el, attr) {
			if(!el || !el.getAttribute) return '';
			return el[attr] || el.getAttribute(attr);
		},
		addClass = NodeH.addClass,
		removeClass = NodeH.removeClass,
		replaceClass = NodeH.replaceClass,
		show = NodeH.show,
		hide = NodeH.hide,
		getValue = NodeH.getValue,
		createElement = function(tag, opts) {
			opts = opts || {};
			var el = document.createElement(tag);
			for (var i in opts) el[i] = opts[i];
			return el;
		};
	/*
	 * _getHintEl: 得到hintEl。焦点进入/离开时，toggleClass('hint-dark', 'hint'); 
	 */
	Valid._getHintEl = function(el) {
		var hintEl = getAttr2(el, "hintEl");
		return hintEl && g(hintEl);
	};
	/*
	 * _getPlaceHolderEl: 得到placeHolderEl，即placeHolder效果元素
	 */
	Valid._getPlaceHolderEl = function(el) {
		var hintEl = getAttr2(el, "placeHolderEl");
		return hintEl && g(hintEl);
	};
	/*
	 * _getEmEl: 得到提示em。查找规则：优先查找emEl属性，再次之查找四个nextSibling以内的em，再次之查找parentNode的四个nextSibling以内的em
	 */
	Valid._getEmEl = function(el) {
		var em = getAttr2(el, "emEl");
		if (em) return g(em);
		var refEls = [el, el.parentNode];
		for (var i = 0; i < 2; i++) {
			var tempEl = refEls[i];
			for (var j = 0; j < 5; j++) {
				tempEl = tempEl.nextSibling;
				if (!tempEl) break;
				if (tempEl.tagName == "EM") return tempEl;
			}
		}
		return null;
	};
	/*
	 * _getErrEmEl: 根据正确em,找到错误em,找不到就返回null.
	 */
	Valid._getErrEmEl = function(okEm, autoCreate) {
		var errEm = okEm.nextSibling;
		if (errEm) {
			if (errEm.tagName == "EM" || !errEm.tagName && (errEm = errEm.nextSibling) && errEm.tagName == "EM") return errEm;
		}
		if (!autoCreate) return null;
		errEm = createElement('em', {
			className: 'error'
		});
		okEm.parentNode.insertBefore(errEm, okEm.nextSibling);
		return errEm;
	};


	Valid.onhint = function(ce) {
		var el = ce.target;
		if (!el || 'INPUT,TEXTAREA,SELECT,BUTTON'.indexOf(el.tagName) == -1) return; //IE下，onfocusin会在div等元素触发 
		var hintEl = Valid._getHintEl(el),
			placeHolderEl = Valid._getPlaceHolderEl(el);
		hintEl && replaceClass(hintEl, 'hint-dark', 'hint');
		if (placeHolderEl) {
			clearTimeout(el.__placeholderTimer || 0);
			addClass(placeHolderEl, 'placeholder-dark');
		}
		if (!Validators.required(el, false) && !getValue(el)) return; //如果存在空提示，则进入焦点时不隐藏提示
		if (!Validators.datatype(el, false)) Validators.datatype(el, true); //只有不通过datatype验证时，才需要在焦点进入时验证
	};
	Valid.onblur = function(ce) {
		var el = ce.target;
		if (!el || 'INPUT,TEXTAREA,SELECT,BUTTON'.indexOf(el.tagName) == -1) return; //IE下，onfocusin会在div等元素触发 
		var hintEl = Valid._getHintEl(el),
			placeHolderEl = Valid._getPlaceHolderEl(el);
		hintEl && replaceClass(hintEl, 'hint', 'hint-dark');
		Validators.datatype(el, true); //离开时只作datatype校验
		if (placeHolderEl) {
			(getValue(el) ? addClass : removeClass)(placeHolderEl, 'placeholder-dark');
			clearTimeout(el.__placeholderTimer || 0);
			el.__placeholderTimer = setTimeout(function() { //在360浏览器下，autocomplete会先blur之后N百毫秒之后再change
				(getValue(el) ? addClass : removeClass)(placeHolderEl, 'placeholder-dark');
			}, 600);
		}
	};
	Valid.onpass = function(ce) {
		var el = ce.target,
			okEm = Valid._getEmEl(el);
		removeClass(el, "error");
		if (okEm) {
			if ((okEm.__vld_fail_stamp | 0) != Valid.checkAll_stamp)  {//需要render
				show(okEm);
				var errEmEl = Valid._getErrEmEl(okEm);
				errEmEl && hide(errEmEl);
			}
		}
	};
	Valid.onfail = function(ce) {
		var el = ce.target,
			errMsg = ce.errMsg;
		addClass(el, "error");
		el.__vld_errMsg = errMsg;
		var okEm = Valid._getEmEl(el);
		if (okEm) {
			if ((okEm.__vld_fail_stamp | 0) != Valid.checkAll_stamp) { //需要render
				hide(okEm);
				var errEm = Valid._getErrEmEl(okEm, true);
				errEm.innerHTML = errMsg;
				show(errEm);
			}
			if (Valid.isChecking) {
				okEm.__vld_fail_stamp = Valid.checkAll_stamp;
			}
		}
	};

	var placeHolder_idx = 10000;
	Valid.oninitall = function(ce) {
		setTimeout(function() { //稍稍延时一下
			if('placeholder' in document.createElement('input')){ //如果浏览器原生支持placeholder
				return ;
			}
			QW.NodeW('input,textarea', ce.target).forEach(function(el) {
				var placeholder = getAttr2(el,'placeholder'),
					placeHolderEl = Valid._getPlaceHolderEl(el);
				if (placeholder && !placeHolderEl) {
					var placeHolderElId = 'placeHolder-' + placeHolder_idx++;
					placeHolderEl = createElement('span', {
						id: placeHolderElId,
						innerHTML: placeholder,
						className: 'placeholder'
					});
					placeHolderEl.onclick = function() {
						try {
							el.focus();
						} catch (ex) {}
					};
					el.parentNode.insertBefore(placeHolderEl, el);
					el.setAttribute('placeHolderEl', placeHolderElId);
				}
				if (placeHolderEl) {
					if ((getValue(el) || '').trim() || el==document.activeElement) {
						addClass(placeHolderEl, 'placeholder-dark');
					} else {
						removeClass(placeHolderEl, 'placeholder-dark');
					}
				}
			});
		}, 10);
	};
	/**
	 *绑定电话区号/电话号码/分机号/手机号
	 * @method bindPhoneEls
	 * @param {Json} opts - 绑定group Json.目前支持以下属性
	 ids:['telN1','telN2','telN3']	//数组id，依次为:电话区号／电话号码／分机号，也可以有四个元素，第四个元素为手机号
	 reqMsgs:[' 请输入电话区号。','请输入电话号码。','',' 电话号码与手机至少填写一项。']		//----必须输入时的提示信息
	 * @return {void} 
	 */
	Valid.bindPhoneEls = function(opts) {
		var dataTypes = ['phonezone', 'phonecode', 'phoneext', 'mobilecode'],
			maxLengths = [4, 8, 4, 11],
			defaultReqMsgs = [' 请输入电话区号。', ' 请输入电话号码。', '', ' 电话号码与手机至少填写一项。'],
			reqMsgs = opts.reqMsgs || defaultReqMsgs,
			ids = opts.ids;
		for (var i = 0; i < ids.length; i++) {
			QW.NodeW.g(ids[i]).attr('reqMsg', reqMsgs[i] || defaultReqMsgs[i]).attr('dataType', dataTypes[i]).set('maxLength', maxLengths[i]);
		}
		g(ids[0]).setAttribute('reqlogic', '(!$' + ids[1] + ' && !$' + ids[2] + ') || $' + ids[0]);
		g(ids[1]).setAttribute('reqlogic', '(!$' + ids[0] + ' && !$' + ids[2] + ') || $' + ids[1]);
		if (ids.length == 4) {
			g(ids[3]).setAttribute('reqlogic', '$' + ids[0] + ' || $' + ids[1] + '|| $' + ids[2] + '|| $' + ids[3]);
		}
	};

	QW.DomU.ready(function() {
		Valid.initAll();
	});
}());


;/**import from `/resource/js/page/admin.product.js` **/
Dom.ready(function() {

    function getOneType(grade,id){
       
        var domTpl =W("#productClass, #productClass_edit, #productClass_1, #productClass_2, #productClass_3, #productClass_4, #productClass_5");//有哪个用哪个
        QW.Ajax.get('/mer_product/classify/?grade='+grade+'&rid='+ id,function(e){
            var ret = e.evalExp();
            if(parseInt(ret.errno, 10) == 0) {
                var func = domTpl.html().trim().tmpl();     
            }else{
                return alert(ret.errmsg);
            }
            W("#secondClass").query('.cate').removeClass('cate-arrow');
            if(ret.data.length!=0){
                html = func(ret);
                if(grade == 2 ){
                    W("#secondClass").html(html).show();
                    var me = W("#secondClass .cate li.curl"),
                        _id = me.attr('data-id'),
                        _grade = ~~me.attr('data-grade')+1;

                    getOneType(_grade,_id);

                }else if(grade==3){
                    W("#thirdClass").html(html).show();
                    W("#secondClass").query('.cate').replaceClass('cate-noarrow','cate-arrow');
                    W("#thirdClass").query('.cate').addClass('cate-noarrow');
                    W('.select_type').html(W(".select-bg .cate li.curl").getHtmlAll().join(' > '))
                    // W("#addProductType").val(W(".select-bg .cate li.curl").getAttrAll('data-id').join('_'))
                }
            }else{
                if(grade == 2 ){
                    W("#thirdClass").html('').hide();
                    W("#secondClass").html('').hide();
                }else if(grade==3){
                    W("#secondClass").query('.cate').replaceClass('cate-arrow','cate-noarrow');
                    W("#thirdClass").html('').hide();
                }

                W('.select_type').html(W(".select-bg .cate li.curl").getHtmlAll().join(' > '))
                // W("#addProductType").val(W(".select-bg .cate li.curl").getAttrAll('data-id').join('_'))
            }

            
        })
    }

    /**
     * 设置addProductType
     */
    function setProductType(){
        var wNavSelected = W('.bod-nav-selected'),
            wItem = wNavSelected.query('.bod-nav-selected-item'),
            selecttype = '';
        if (wItem.length) {
            selecttype = wItem.first().attr('selecttype');
        }
        if (selecttype) {
            W('#addProductType').val(selecttype);
            W('.select_type2').html(wNavSelected.query('.bod-nav-selected-item').first().query('.bod-nav-selected-item-txt').html());
            return true;
        } else {
            alert('请至少添加一个商品类目');
            return false;
        }
    }
    /**
     * 设置产品分类相关逻辑
     *     主要用于有分类和没有分类两种情况对价格的不同处理
     */
    function setProductAttr(){
        var data = null,
            dataCache = oProductAttrDataCache[W('#addProductType').val()];

        if(product_attr_content && product_class_ids){
            data = [];
            var selected_ids = [];

            var selecttype = W('.bod-nav-selected').query('.bod-nav-selected-item').first().attr('selecttype');
            selecttype.split('_').forEach(function(el){
                selected_ids.push(parseInt(el, 10));
            });

            var attr_id = false;
            // 遍历有分类的id，检测当前选中的分类是否在其中
            // console.log(product_class_ids)
            product_class_ids.forEach(function(el){
                if (selected_ids.contains(el)) {
                    attr_id = el;

                    return true;
                }
            });
            var selected_product_attr = null;
            // 包含分类
            if (attr_id) {
                var product_attr_content_info = product_attr_content[attr_id];
                // 只有一个属性
                if (QW.ObjectH.keys(product_attr_content_info).length==1) {
                    selected_product_attr = product_attr_content_info[1]['attr'];
                    if (dataCache && dataCache['cate']) {
                        var oCate = dataCache['cate'],
                            oPrice = dataCache['price'];
                        QW.ObjectH.map(selected_product_attr, function(v, k){
                            var checked = oCate.contains(k) ? true : false;
                            data.push({
                                'k': k,
                                'name': v,
                                'checked': checked,
                                'price': checked ? oPrice[k] : ''
                            });
                        });
                    } else {
                        QW.ObjectH.map(selected_product_attr, function(v, k){
                            data.push({
                                'k': k,
                                'name': v,
                                'checked': false,
                                'price': ''
                            });
                        });
                        data[0]['checked'] = true;
                    }

                    // 设置分类相关的html模板
                    setProductAttrTpl(data);
                }
                // 多个属性相互组合
                else if(QW.ObjectH.keys(product_attr_content_info).length>1) {
                    var dataList = [], ii=0;
                    QW.ObjectH.map(product_attr_content_info, function(v, k){
                        var attr_name = v['name'],
                            attr_cont = v['attr'];
                        dataList[ii] = {
                            'lkey': k,
                            'name': attr_name,
                            'attr': []
                        };
                        if (dataCache && dataCache['cate']) {
                            var selectedAttr = dataCache['cate'][k];
                        }
                        QW.ObjectH.map(attr_cont, function(vv, kk){
                            if (typeof selectedAttr!='undefined' && selectedAttr) {
                                if (selectedAttr[kk]) {
                                    dataList[ii]['attr'].push({
                                        'k': kk,
                                        'name': vv,
                                        'checked': true
                                    });
                                } else {
                                    dataList[ii]['attr'].push({
                                        'k': kk,
                                        'name': vv,
                                        'checked': false
                                    });
                                }
                            } else {
                                dataList[ii]['attr'].push({
                                    'k': kk,
                                    'name': vv,
                                    'checked': false
                                });
                            }
                        });
                        ii++;
                    });

                    setProductMultiAttrTpl(dataList);
                    return;
                }

            }
            // 不包含分类
            else {
                data = {
                    'price': dataCache ? dataCache['price'] : ''
                };
                setNonProductAttrTpl(data, selecttype);
            }
        } else {
            data = {
                'price': dataCache ? dataCache['price'] : ''
            };
            setNonProductAttrTpl(data, selecttype);
        }
    }
    /**
     * 设置产品属性数据缓存
     */
    var oProductAttrDataCache = {};
    function setProductAttrDataCache(){
        var wProductAttr = W('#ProductAttr');

        var classify = W('#addProductType').val();
        // 含有分类的商品
        if (wProductAttr.isVisible()) {

            var wMultiattrBlock = W('.product-multiattr-block');
            // 多属性组合
            if (wMultiattrBlock.length) {
                var oOld_ProductAttrDataCache = oProductAttrDataCache[classify];

                oProductAttrDataCache[classify] = {
                    'cate': {},
                    'price':[]
                };
                var oClassify = oProductAttrDataCache[classify]['cate'];

                var wMultiattrLine = W('.product-multiattr-line');
                wMultiattrLine.forEach(function(el){
                    var wMe = W(el);

                    oClassify[wMe.attr('data-lkey')] = {};

                    wMe.query('input').forEach(function(ipt){
                        var wIpt = W(ipt);
                        if (wIpt.attr('checked')) {
                            oClassify[wMe.attr('data-lkey')][wIpt.val()] = wIpt.attr('data-name');
                        }
                    });
                });

                var oPrice = oProductAttrDataCache[classify]['price'];
                var wPriceBlock = W('.product-multiattr-price-block');
                if (wPriceBlock.length) {
                    var wTr = wPriceBlock.query('tr');
                    wTr.forEach(function(r){
                        var wMe = W(r);

                        var wTd = wMe.query('td');
                        if (!wTd.length) {
                            return;
                        }
                        var attr_id = ''
                            group = [],
                            sel = {},
                            group_name = '';
                        var price = parseFloat(wTd.last().query('input').val());
                        if (price>0) {
                            wTd.forEach(function(d, i){
                                var wD = W(d);

                                if (!wD.hasClass('product-multiattr-price-td')) {
                                    group.push(wD.attr('data-id'));
                                    sel[i+1] = {
                                        'id': wD.attr('data-id'),
                                        'name': wD.html()
                                    };
                                    attr_id += wD.attr('data-id');
                                    group_name += wD.html()+' ';                                    
                                }
                            });

                            oPrice.push({
                                'attr_id': attr_id,
                                'attr_name': '',
                                'checked ': 0,
                                'price': price,
                                'attr_info': {
                                    'group': group,
                                    'sel': sel,
                                },
                                'group_name': group_name
                            })
                        }
                    });
                } else {
                    if (typeof oOld_ProductAttrDataCache!=='undefined') {
                        oProductAttrDataCache[classify]['price'] = oOld_ProductAttrDataCache['price'];
                    }
                }
            }
            // 单属性
            else {
                oProductAttrDataCache[classify] = {
                    'cate': [],
                    'price': {}
                };
                var oClassify = oProductAttrDataCache[classify];
                // 选中的分类
                var wChecked = wProductAttr.query('[checked]');
                wChecked.forEach(function(el, i){
                    oClassify['cate'].push(W(el).val());
                });
                // 分类的价格
                var wPrice = wProductAttr.query('[name="product_price[]"]');
                wPrice.forEach(function(el, i){
                    oClassify['price'][W(el).parentNode('tr').attr('data-id')] = W(el).val();
                });                
            }
        } else {
            oProductAttrDataCache[classify] = {
                'price': ''
            };
            // 价格
            oProductAttrDataCache[classify]['price'] = W('#NonProductAttr input').val();
        }
    }
    /**
     * 设置产品有分类时候的模板
     */
    function setProductAttrTpl(data){
        var params = {
            'product_attr': data
        };
        var pa_tpl_fun = W('#ProductAttrTpl').html().trim().tmpl(),
            pa_tpl_str = pa_tpl_fun(params);

        W('#ProductAttr').html(pa_tpl_str).show();
        W('#NonProductAttr').html('').hide();
    }

    /**
     * 设置产品多个分类
     * @param {[type]} dataList [description]
     */
    function setProductMultiAttrTpl(dataList){
        var params = {
            'dataList': dataList
        };

        var tpl_fun = W('#ProductMultiAttrTpl').html().trim().tmpl(),
            tpl_str = tpl_fun(params);

        W('#ProductAttr').html(tpl_str).show();
        W('#NonProductAttr').html('').hide();
    }
    /**
     * 设置商品属性组合的价格table
     * @param {[type]} data [description]
     */
    function setProductMultiAttrPriceTpl(data){
        var params = {
            'attrName': data['attrName'],
            'attrGroup': data['attrGroup']
        };

        var tpl_fun = W('#ProductMultiAttrPriceTpl').html().trim().tmpl(),
            tpl_str = tpl_fun(params);
        if (W('.product-multiattr-price-block').length) {
            W('.product-multiattr-price-block').removeNode();
        }
        W('#ProductAttr').insertAdjacentHTML('beforeend', tpl_str);
    }
    /**
     * 验证多属性组合的价格的合理性
     * @return {[type]} [description]
     */
    function validMultiAttrPrice(){
        var flag = false;
        var wAttrBlock = W('.product-multiattr-block'),
            wPriceBlock = W('.product-multiattr-price-block');
        if (wAttrBlock.length) {
            if (wPriceBlock.length) {
                var wPrice = wPriceBlock.query('[name="product_price[]"]');
                wPrice.forEach(function(el){
                    var wMe = W(el),
                        val = wMe.val();
                    val = val ? parseFloat(val) : 0;
                    wMe.siblings('[name="product_category[]"]').removeNode();
                    if (val>0) {
                        var attr_str = wMe.ancestorNode('td').siblings('td').map(function(el){
                            return W(el).attr('data-id');
                        }).join(',');

                        wMe.insertAdjacentHTML('afterend', '<input type="hidden" name="product_category[]" value="'+attr_str+'">');
                        flag = true;
                    } else {
                        wMe.val('').attr('disabled', 'disabled');
                    }
                });
            } else {
                var wProductAttr = W('#ProductAttr');
                if (wProductAttr.length) {
                    setScrollTop(wProductAttr.getRect()['top']);
                }
                tcb.alert('', '请确认选择并填写报价后，再提交', {'width':300, btn_name: '关闭',wrapId:"ErrorAlertPannel"}, function(){return true;});

                return flag;
            }
        } else {
            flag = true;
        }

        if (!flag) {
            var wProductAttr = W('#ProductAttr');
            if (wProductAttr.length) {
                setScrollTop(wProductAttr.getRect()['top']);
            }
            tcb.alert('', '请至少输入一组商品价格', {'width':300, btn_name: '关闭',wrapId:"ErrorAlertPannel"}, function(){
                if(wPrice && wPrice.length){
                    wPrice.forEach(function(el){
                        W(el).removeAttr('disabled');
                    });
                    wPrice.first().focus();
                }
                return true;
            });
        }

        return flag;
    }
    /**
     * 设置滚动条高度
     * @param {[type]} top_val [description]
     */
    function setScrollTop(top_val){
        top_val = top_val ? top_val : 0;
        if (typeof window.pageYOffset!=='undefined') {
            window.pageYOffset = top_val;
        }
        document.documentElement.scrollTop = top_val;
        document.body.scrollTop = top_val;
    }


    /**
     * 设置产品没有分类时候的模板
     */
    function setNonProductAttrTpl(data, selecttype){
        var params = {
            'product_attr': data,
            'is_eservice': selecttype=='285'? '1' : ''
        };
        var npa_tpl_fun = W('#NonProductAttrTpl').html().trim().tmpl(),
            npa_tpl_str = npa_tpl_fun(params);

        W('#ProductAttr').html('').hide();
        W('#NonProductAttr').html(npa_tpl_str).show();
        if (params['is_eservice']) {
            var wShangmenfei = W('#shangmenfei_wrap');
            if (wShangmenfei && wShangmenfei.length) {
                wShangmenfei.hide().query('input').val('');
            }
        }
    }
    /**
     * 设置上门维修费的显示状态
     */
    function setShangmenFeeStatus(){
        if(W('.shangmen_weixiu').attr('checked') && ( W('[name^="product_price"]').length ) ){
            W('#shangmenfei_wrap').show();
        }
    }
    
    tcb.bindEvent(document.body, {
        // 确认属性的选择
        '.product-multiattr-select-confirm-btn': function(e){
            e.preventDefault();

            var SelectedAttrName = [];
                SelectedAttr = [];

            var wAttrLine = W('.product-multiattr-line');

            var break_each_flag = false;
            wAttrLine.forEach(function(el){
                if (break_each_flag) {
                    return;
                }
                var non_checked = true;

                var wLine = W(el),
                    attrname = wLine.attr('data-attrname');
                SelectedAttrName.push(attrname);

                var SelectedAttrItem = [];
                wLine.query('input').forEach(function(inp){
                    var wInp = W(inp);
                    if(wInp.attr('checked')){
                        SelectedAttrItem.push({
                            'name': wInp.attr('data-name'),
                            'id': wInp.val()
                        });
                        non_checked = false;
                    }
                });
                SelectedAttr.push(SelectedAttrItem);
                if (non_checked) {
                    break_each_flag = true;
                    tcb.alert('', '请选择 ' + attrname, {'width':300, btn_name: '关闭',wrapId:"ErrorAlertPannel"}, function(){return true;});
                    return;
                }
            });
            if (break_each_flag) { return false;}

            var AttrGroup = [],
                CountArr = [],
                CountArr2 = [];
            SelectedAttr.reverse();
            var recommend_title = [];
            SelectedAttr.forEach(function(aAttr){
                var num = aAttr.length;
                if (CountArr[0]) {
                    num = num*CountArr[0];
                }
                CountArr.unshift(num);
                CountArr2.unshift(aAttr.length);

                recommend_title.push(aAttr.map(function(item){return item['name'];}).join('/'))
            });
            // recommend_title = recommend_title.join('、')+'内存';
            // tcb.alert('', '根据您选择的商品属性为您推荐以下商品名称：<br>' + recommend_title, {'width':300, btn_name: '确认',wrapId:"ErrorAlertPannel"}, function(){
            //     var wPName = W('[name="product_name"]');
            //     wPName.val(recommend_title);
            //     return true;
            // });

            SelectedAttr.reverse();
            CountArr.push(1);
            CountArr.shift();

            var i = 0,
                kk = 1;
            SelectedAttr.forEach(function(aAttr){
                if (i==0) {
                    aAttr.forEach(function(item){
                        for(var j=0; j<CountArr[0]; j++){
                            AttrGroup.push([item]);
                        }
                    });
                    CountArr.shift();
                } else {
                    var pos = 0;
                    kk = kk*CountArr2.shift();
                    for(var k=0; k<kk; k++){
                        aAttr.forEach(function(item){
                            for(var j=0; j<CountArr[0]; j++){
                                AttrGroup[pos].push(item);
                                pos++;
                            }
                        });
                    }
                    CountArr.shift();
                }
                i++;
            });

            // 价格cache
            var SelectedAttrPirceCache = null;
            var dataCache = oProductAttrDataCache[W('#addProductType').val()];
            if (dataCache && dataCache['price']) {
                SelectedAttrPirceCache = dataCache['price'];
            }
            // 属性组合白名单
            var whitelist = null;
            if (typeof product_attr_whitelist!=='undefined' && QW.ObjectH.isPlainObject(product_attr_whitelist)) {
                whitelist = product_attr_whitelist[W('#addProductType').val().split('_').pop()]
            }
            var White_AttrGroup = [];
            AttrGroup.forEach(function(item){
                // 遍历白名单，验证属性组合是否在白名单之中
                var in_white_flag = false;
                whitelist.forEach(function(witem){
                    // 当前属性组在白名单之内，则终止遍历
                    if (in_white_flag) {
                        return;
                    }
                    var attr_pos = 0;
                    var match_flag = true;
                    witem.split(',').forEach(function(attr_id){
                        if (!(item[attr_pos]['id'] == attr_id || attr_id==='*')) {
                            match_flag = false;
                        }
                        attr_pos++;
                    });
                    if (match_flag) {
                        in_white_flag = true;
                    }
                });
                // 若经上述验证，不在白名单之内，放弃当前item的处理，不加入White_AttrGroup
                if (!in_white_flag) {
                    return;
                }

                var combine_id = item.map(function(iSub){
                    return iSub['id'];
                }).join('');
                var ccc = false;
                if (SelectedAttrPirceCache) {
                    SelectedAttrPirceCache.forEach(function(pInfo){
                        if(pInfo['attr_id']==combine_id){
                            item.push(pInfo['price']);
                            ccc = true;
                        }
                    });                        
                }
                if (!ccc) {
                    item.push('');
                }
                White_AttrGroup.push(item);
            });

            // console.log(whitelist, AttrGroup, White_AttrGroup);

            setProductMultiAttrPriceTpl({
                'attrName': SelectedAttrName,
                'attrGroup': White_AttrGroup
            });
            W('.product-multiattr-block').slideUp();

        },
        // 重新选择属性组合
        '.product-multiattr-reselect-btn': function(e){
            e.preventDefault();

            setProductAttrDataCache();

            W('.product-multiattr-block').slideDown();
            W('.product-multiattr-price-block').removeNode();
        },
        // 选择商品分类
        'input[name="product_category[]"]': function(e){
            var wMe = W(this);

            var pos = wMe.previousSiblings(':checked').length;

            var p_k = wMe.val();
            var wTable = W('.product-attr-price');

            if (wMe.attr('checked')) {
                var p_name = wMe.nextSibling('span').html().trim();

                var wTr = wTable.query('tr'),
                    wLastTr = wTr.last(),
                    wLastTrClone = wLastTr.cloneNode(true),
                    wLastTrCloneTd = wLastTrClone.query('td');

                var params = {
                    'tr_data':{
                        'id': p_k,
                        'name': p_name
                    }
                };
                var tr_fn = W('#ProductAttrPriceTpl').html().trim().tmpl(),
                    tr_str = tr_fn(params);

                wTr.item(pos).insertSiblingAfter(tr_str);
            } else {
                if (wMe.siblings(':checked').length) {
                    wTable.query('tr[data-id="'+p_k+'"]').removeNode();
                } else {
                    alert('最少要选择1个分类');
                    e.preventDefault();
                }
            }
        },
        'div.btn-step':function(e){
            e.preventDefault();

            if (!setProductType()) {
                return ;
            }

            // 设置产品分类相关逻辑
            setProductAttr();

            setShangmenFeeStatus();

            W("#new_product_step1").hide();
            W("#new_product_step2").show();
            W('.new-product-step1').hide();
            W('.new-product-step2').show();
            W("#product_step").val(2);
        },
        'a.go-first':function(e){
        		e.preventDefault();
            setProductAttrDataCache();
            W("#new_product_step2").hide();
            W("#new_product_step1").show();
            W('.new-product-step2').hide();
            W('.new-product-step1').show();
        },
        'input.shangmen_weixiu':function(e){
            if(W(this).attr("checked")){
                // 如果可以书写商品价格才有价格面议项，否则隐藏
                if (W('[name^="product_price"]').length||W('.product-multiattr-block').length) {
                    W("#shangmenfei_wrap input").val('');
                    W("#shangmenfei_wrap").show();
                }
            }else{
                W("#shangmenfei_wrap").hide();
                W("#shangmenfei_wrap input").val(0);
            }
        },
        // 选择分类
        '.cate li':function(e){
            e.preventDefault();
            var me = W(this),
                id = me.attr('data-id'),
                grade = ~~me.attr('data-grade')+1;

            var html= '';

            me.ancestorNode('.cate').query('li').removeClass('curl');
            me.addClass('curl');

            if(grade>3){
                W('.select_type').html(W(".select-bg .cate li.curl").getHtmlAll().join(' > '));
                // W("#addProductType").val(W(".select-bg .cate li.curl").getAttrAll('data-id').join('_'))
                return;
            }
            getOneType(grade,id);
            
        },
        // 添加类目
        '.bod-nav-add': function(e){
            e.preventDefault();

            var wNavSelected = W('.bod-nav-selected');
            var wCurl = W(".select-bg .cate li.curl");
            var data_id = wCurl.getAttrAll('data-id').join('_');
            if (wNavSelected.isVisible()) {
                // 已经添加的类目数小于4个
                var wItem = wNavSelected.query('.bod-nav-selected-item');
                if(wItem.length<4){
                    if(!wItem.filter('[selecttype="'+data_id+'"]').length){
                        var selected_html = '<li class="bod-nav-selected-item" selecttype="'
                                + data_id + '">'
                                + '<span class="bod-nav-selected-item-txt">'
                                + wCurl.getHtmlAll().join(' > ')
                                + '</span><span class="bod-nav-selected-item-del">删除</span><span class="bod-nav-selected-item-top" style="display:none;">置顶</span></li>';
                        W('.bod-nav-selected-list').insertAdjacentHTML('beforeend', selected_html);
                        if (!W('.data-id-'+data_id).length) {
                            var inp_str = '<input type="hidden" name="classify_tag[]" class="data-id-'+data_id+'" value="'+data_id+'" >'
                                    + '<input type="hidden" name="classify_name[]" class="data-id-'+data_id+'" value="'+wCurl.getHtmlAll().join('_')+'" >';
                            W('#addProduct').insertAdjacentHTML('beforeend', inp_str);
                            W('#editProduct').insertAdjacentHTML('beforeend', inp_str);
                        }
                    }
                } else {
                    alert('最多只能添加4个类目！');
                }
            } else {
                wNavSelected.show();

                var selected_html = '<li class="bod-nav-selected-item" selecttype="'
                        + data_id + '">'
                        + '<span class="bod-nav-selected-item-txt">'
                        + wCurl.getHtmlAll().join(' > ')
                        + '</span><span class="bod-nav-selected-item-del">删除</span><span class="bod-nav-selected-item-top" style="display:none;">置顶</span></li>';
                W('.bod-nav-selected-list').insertAdjacentHTML('beforeend', selected_html);
                if (!W('.data-id-'+data_id).length) {
                    var inp_str = '<input type="hidden" name="classify_tag[]" class="data-id-'+data_id+'" value="'+data_id+'" >'
                            + '<input type="hidden" name="classify_name[]" class="data-id-'+data_id+'" value="'+wCurl.getHtmlAll().join('_')+'" >';
                    W('#addProduct').insertAdjacentHTML('beforeend', inp_str);
                    W('#editProduct').insertAdjacentHTML('beforeend', inp_str);
                }
            }
        },
        // 显示/隐藏“置顶”
        '.bod-nav-selected-item': {
            'mouseenter': function(e){
                var wMe = W(this);

                if (wMe.previousSibling('.bod-nav-selected-item').length) {
                    wMe.query('.bod-nav-selected-item-top').show();
                }
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.query('.bod-nav-selected-item-top').hide();
            }
        },
        // 删除类目
        '.bod-nav-selected-item-del': function(e){
            e.preventDefault();

            var wMe = W(this),
                wItem = wMe.parentNode('.bod-nav-selected-item');
            if (!wItem.siblings('.bod-nav-selected-item').length) {
                W('.bod-nav-selected').hide();
            }
            wItem.removeNode();
            W('.data-id-'+wItem.attr('selecttype')).removeNode();
        },
        // 置顶类目
        '.bod-nav-selected-item-top': function(e){
            e.preventDefault();

            var wMe = W(this),
                wItem = wMe.parentNode('.bod-nav-selected-item');

            wItem.previousSiblings('li').first().insertSiblingAfter(wItem);
            wItem.query('.bod-nav-selected-item-top').hide();
        },
        'input[type="text"]': {
            change: function(){
                window.onbeforeunload = function(){
                    return '离开后，填写的内容将会丢失';
                }
            }
        },
        '#addProduct a.btn-save1':function(e){
            e.preventDefault();
            if(!QW.Valid.checkAll(W('#addProduct')[0])){
                return false;
            }
            // 验证多属性组合价格填写的合法性
            if (!validMultiAttrPrice()) {
                return false;
            }

            W("#addProduct").attr("target","_self");
            document.addProduct.status.value = "display";
            W("#addProduct").attr("action","/mer_product/add");
            if( W('#productImgInput').val() == "" ){
                W('#prdfaceError').show();
                return false;
            }
            if(__descEditor){
                if( __descEditor.getContent() == "" ){
                    W('#ueditorError').show();
                    __descEditor.focus();
                    return false;
                }else{
                    W('#ueditorError').hide();
                }
            }

            Ajax.post(W('#addProduct')[0], function(e){
                try{
                    var ret = (e || "").evalExp();
                    if(parseInt(ret.errno, 10) != 0) {
                        return alert(ret.errmsg);
                    };
                    window.onbeforeunload = null;
                    var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">发布商品成功,3秒钟后刷新页面。</div>',
                        {
                            'width' : 410, 
                            'wrapId' : 'panelMessageTips'
                        }, function() {
                            panel.hide();
                    });
                    setTimeout(function(){
                         location.reload(true);
                    },3000);

                }catch(e){
                    alert("提交失败，请稍后重试");
                }
            })
        },
        '#addProduct a.btn-save2':function(e){
            e.preventDefault();
            if(!QW.Valid.checkAll(W('#addProduct')[0])){
                return false;
            }

            // 验证多属性组合价格填写的合法性
            if (!validMultiAttrPrice()) {
                return false;
            }

            W("#addProduct").attr("target","_self");
            W("#addProduct").attr("action","/mer_product/add");
            
            if( W('#productImgInput').val() == "" ){
                W('#prdfaceError').show();
                return false;
            }
            if(__descEditor){
                if( __descEditor.getContent() == "" ){
                    W('#ueditorError').show();
                    __descEditor.focus();
                    return false;
                }else{
                    W('#ueditorError').hide();
                }
            }
            document.addProduct.status.value = "off";
            Ajax.post(W('#addProduct')[0], function(e){
                try{
                    var ret = (e || "").evalExp();
                    if(parseInt(ret.errno, 10) != 0) {
                        return alert(ret.errmsg);
                    };
                    window.onbeforeunload = null;
                    var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">发布商品成功,3秒钟后刷新页面。</div>',
                        {
                            'width' : 410, 
                            'wrapId' : 'panelMessageTips'
                        }, function() {
                            panel.hide();
                    });
                    setTimeout(function(){
                         location.reload(true);
                    },3000);
                }catch(e){
                    alert("提交失败，请稍后重试");
                }
            })
        },
         '#addProduct a.btn-prew':function(e){
            e.preventDefault();
            if(!QW.Valid.checkAll(W('#addProduct')[0])){
                return false;
            }

            W("#addProduct").attr("target","_blank");
            if( W('#productImgInput').val() == "" ){
                W('#prdfaceError').show();
                return false;
            }
            if(__descEditor){
                if( __descEditor.getContent() == "" ){
                    W('#ueditorError').show();
                    __descEditor.focus();
                    return false;
                }else{
                    W('#ueditorError').hide();
                }
            }

            document.addProduct.status.value = "display";
            W("#addProduct").attr("action","/mer_product/preview");
            document.addProduct.submit();
            
        },
         '#editProduct a.btn-prew':function(e){
            e.preventDefault();
            if(!QW.Valid.checkAll(W('#editProduct')[0])){
                return false;
            }
            
            if( W('#productImgInput').val() == "" ){
                W('#prdfaceError').show();
                return false;
            }
            if(__descEditor){
                if( __descEditor.getContent() == "" ){
                    W('#ueditorError').show();
                    __descEditor.focus();
                    return false;
                }else{
                    W('#ueditorError').hide();
                }
            }

            W("#editProduct").attr("target","_blank");

            document.editProduct.status.value = "display";
            W("#editProduct").attr("action","/mer_product/preview");
            document.editProduct.submit();
            
        },
        '#editProduct a.btn-save1':function(e){
            e.preventDefault();
            if(!QW.Valid.checkAll(W('#editProduct')[0])){
                return false;
            }

            // 验证多属性组合价格填写的合法性
            if (!validMultiAttrPrice()) {
                return false;
            }

            if( W('#productImgInput').val() == "" ){
                W('#prdfaceError').show();
                return false;
            }
            if(__descEditor){
                if( __descEditor.getContent() == "" ){
                    W('#ueditorError').show();
                    __descEditor.focus();
                    return false;
                }else{
                    W('#ueditorError').hide();
                }
            }
            W("#editProduct").attr("action","/mer_product/edit");
            document.editProduct.status.value = "display";
            Ajax.post(W('#editProduct')[0], function(e){
                try{
                    var ret = (e || "").evalExp();
                    if(parseInt(ret.errno, 10) != 0) {
                        return alert(ret.errmsg);
                    };
                    window.onbeforeunload = null;
                    var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">修改商品成功,3秒钟后刷新页面。</div>',
                        {
                            'width' : 410, 
                            'wrapId' : 'panelMessageTips'
                        }, function() {
                            panel.hide();
                            location.href="/mer_product/search";
                    });
                    setTimeout(function(){
                          location.href="/mer_product/search";
                    },3000);
                   
                    
                }catch(e){
                    alert("提交失败，请稍后重试");
                }
            })
        },
        '#editProduct a.btn-save2':function(e){
            e.preventDefault();
            if(!QW.Valid.checkAll(W('#editProduct')[0])){
                return false;
            }
            if( W('#productImgInput').val() == "" ){
                W('#prdfaceError').show();
                return false;
            }
            if(__descEditor){
                if( __descEditor.getContent() == "" ){
                    W('#ueditorError').show();
                    __descEditor.focus();
                    return false;
                }else{
                    W('#ueditorError').hide();
                }
            }
            W("#editProduct").attr("action","/mer_product/edit");
            document.editProduct.status.value = "display";
            Ajax.post(W('#editProduct')[0], function(e){
                try{
                    var ret = (e || "").evalExp();
                    if(parseInt(ret.errno, 10) != 0) {
                        return alert(ret.errmsg);
                    };
                    window.onbeforeunload = null;
                    var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">修改商品成功,3秒钟后刷新页面。</div>',
                        {
                            'width' : 410, 
                            'wrapId' : 'panelMessageTips'
                        }, function() {
                            panel.hide();
                            location.href="/mer_product/search";
                    });
                    setTimeout(function(){
                          location.href="/mer_product/search";
                    },3000);
                   
                    
                }catch(e){
                    alert("提交失败，请稍后重试");
                }
            })
        },
        '.buy-max-num':{
            keyup:function(){
                var val = W(".buy-max-num").val()||"";
                if(val&& /^[0-9]*[1-9][0-9]*$/.test(val)){
                    val = val.substr(0,4);
                    if(val<1){
                        W(".buy-max-num").val(1)
                    }else if(val>1000){
                        W(".buy-max-num").val(1000)
                    } 
                }else{
                    if(val){
                        W(".buy-max-num").val(1)
                    }  
                }
            }
        }
    });    

    (function(){
        // 多商品属性，默认选择
        if (product_attr_list&&QW.ObjectH.isPlainObject(product_attr_list)) {
            var classify = W('#addProductType').val();
            oProductAttrDataCache[classify] = {
                'cate': product_attr_list,
                'price':product_attr_info
            };

            setProductAttr();
            W('.product-multiattr-select-confirm-btn').click();
        }
    }());

});

;/**import from `/resource/js/include/editorcrop.js` **/
Dom.ready(function(){
    var _click_id;
    var _cropPopup;
    W(".add-prd-face").bind('click', function(e){
    	_click_id = W(this).attr('id');
    	
        e.preventDefault();
        
        //弹框
        W('#prdfaceError').hide();
        var tpldom = W("#imageCropTpl, #imageCropTpl_edit, #imageCropTpl_apply, #imageCropTpl_applyedit, #imageCropTpl_1, #imageCropTpl_2, #imageCropTpl_3, #imageCropTpl_4, #imageCropTpl_5");
        _cropPopup = tcb.confirm("", tpldom.html(), { wrapId : "imgCropPop", width:750} , function(){  jsCropUI.submit(); } );  
        if(jQuery && !jQuery.fn.Jcrop){
                
            loadJs("/resource/other/jquery_plugin/jquery.Jcrop.min.js", function(){
            });
            loadCss("/resource/other/jquery_plugin/css/jquery.Jcrop.css");
        }

        return false;
    });
    //W(document).delegate("#cropOrgImg", "change", ); //IE not fire, so, use  onchage=xxx
    function __fileInputChange(){
        if( W(this).val() != "" ){
            W("#imgCropSubmitForm [name='callback']").val("parent.__cropOrigPicUpOk");
            W("#imgCropSubmitForm").submit();
            W('.img-crop-box .crop-img-loading').show();
        }
    }
    window.__fileInputChange = __fileInputChange;

    function __cropOrigPicUpOk(rs){
        if( rs.errno != 0 ){
            alert("抱歉，出错了。" + rs.errmsg);
        }else if( rs.errno == 0 ){
            var psrc = rs.picsrc;
            jsCropUI.init(rs);
            W('.img-crop-box .crop-img-loading').hide();
        }
    }

    window.__cropOrigPicUpOk = __cropOrigPicUpOk;    

    /**
     * 初始化编辑器
     * @return {[type]} [description]
     */
    function initEditor(){
        if( W('#ueditor').length > 0 ){
            var editor = new UE.ui.Editor();
            editor.render("ueditor");
            window.__descEditor = editor;  
        }      
    }

    /**
     * jquery裁剪插件使用
     * @return {[type]} [description]
     */
    window.jsCropUI = (function(){
        var __cropRange, __cropPic, __origWidth, __origHeight;
        var jcrop_api,
            boundx,
            boundy,
            previewBox,
            cropSizes = [300, 70 ,50];  

        function init(picdata){
            var src = picdata.picsrc;
            __cropPic = src;
            __origWidth = picdata.width;
            __origHeight = picdata.height;

            var smallsrc;
            if( __origWidth > __origHeight ){
                smallsrc = src.replace(/\/(\w+?)(\.\w+)$/i, "/edr/300__/$1$2");
            }else{
                smallsrc = src.replace(/\/(\w+?)(\.\w+)$/i, "/edr/_300_/$1$2");
            }

            var previewBox = $('.img-crop-box .crop-prevbox');

            $('.img-crop-box .crop-picbox').html("<img src='"+smallsrc+"'>");

            for(var i=0, n=cropSizes.length; i<n; i++){
                previewBox.find('.crop-prev-'+cropSizes[i]+' .img-preview').html('<img src="'+src+'">'); 
            }

            show($('.img-crop-box .crop-picbox img'),  previewBox);
        }            
        
        function show(target, pbox){
          previewBox = pbox;

          $(target).Jcrop({
            onChange: updatePreview,
            onSelect: updatePreview,
            aspectRatio: 1,
            keySupport: false /*如果设置为true，chrome下面会有页面跳动的bug*/
          },function(){
            
            jcrop_api = this;

            jcrop_api.animateTo([0,0,100,100]);

            // Use the API to get the real image size
            var bounds = this.getBounds();
            boundx = bounds[0];
            boundy = bounds[1];
            // Store the API in the jcrop_api variable
            jcrop_api = this;        
            
          });
        }

        function updatePreview(c)
        {
          if (parseInt(c.w) > 0)
          {  
            __cropRange = c;

            for(var i=0, n=cropSizes.length; i<n; i++){
              resizePreview( previewBox.find('.crop-prev-'+cropSizes[i]+' .img-preview') , c);  
            }
          }
        };

        function resizePreview(box , c){
          var $pcnt = box;
          $pimg = box.find('>img');
          var xsize = $pcnt.width();
          var ysize = $pcnt.height();
          var rx = xsize / c.w;
          var ry = ysize / c.h;

          $pimg.css({
            width: Math.round(rx * boundx) + 'px',
            height: Math.round(ry * boundy) + 'px',
            marginLeft: '-' + Math.round(rx * c.x) + 'px',
            marginTop: '-' + Math.round(ry * c.y) + 'px'
          });

        }

        function getCropResult(){
            try{
                var r_w = Math.round(__cropRange.w / boundx * __origWidth);
                var r_h = Math.round(__cropRange.h / boundy * __origHeight);
                var r_x = Math.round(__cropRange.x / boundx * __origWidth);
                var r_y = Math.round(__cropRange.y / boundy * __origHeight);

                return { 'pic' : __cropPic , 'crop':{ x:r_x ,y:r_y , w: r_w, h:r_h }};
            }catch(ex){
                return false;
            }
        }

        window.__cropDoneCallback = function(rs){
            $('#imgCropPop .panel-btn-ok').attr('disabled', false).html('确定');

            if(rs.errno == 0){
                _cropPopup.hide();
                var smallpic = rs.picsrc.replace(/(\w+\.\w+)$/i, 'edr/70__/$1');
                
                if( $('#'+_click_id).attr('data-previmg') ){

                    $($('#'+_click_id).attr('data-previmg')).attr('src', rs.picsrc);

                }else{
                    if($('#cropResultPic').length > 0){
                        $('#cropResultPic').attr('src', smallpic);
                    }else{
                        $('<img id="cropResultPic" width="70" height="70" class="crop-result-pic" src="'+smallpic+'">').insertAfter('#'+_click_id);
                    }
                }

                if( $('#'+_click_id).attr('data-input') ){
                    $(  $('#'+_click_id).attr('data-input') ).val( rs.picsrc );
                }else{
                    $('#productImgInput').val( rs.picsrc );
                }               
                
                $('#'+_click_id).html('重新编辑');
            }
        }
        function submit(){
            
            var rs = getCropResult();

            if(!rs){ return;}

            $('#cropCompleteForm [name="crop_pic"]').val( rs.pic );

            $('#cropCompleteForm [name="crop_x"]').val( rs.crop.x );
            $('#cropCompleteForm [name="crop_y"]').val( rs.crop.y );
            $('#cropCompleteForm [name="crop_width"]').val( rs.crop.w );
            $('#cropCompleteForm [name="crop_height"]').val( rs.crop.h );

            $('#cropCompleteForm [name="callback"]').val( "parent.__cropDoneCallback");

            $('#cropCompleteForm').submit();

            $('#imgCropPop .panel-btn-ok').attr('disabled', true).html('处理中...');
        }

        return { 
            init : init,
            getCropResult : getCropResult,
            submit : submit
        }
      })();

    initEditor();
});
