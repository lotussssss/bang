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


;/**import from `/resource/js/page/liangpin_mer.product.js` **/
Dom.ready(function() {

    /**
     * 设置产品属性数据缓存
     */
    var oProductAttrDataCache = {};
    function setProductAttrDataCache(){
        var wProductAttr = W('#ProductAttr');

        var classify = W('[name="model_id"]').val();
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
                                    'sel': sel
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

        } else {
            oProductAttrDataCache[classify] = {
                'price': ''
            };
            // 价格
            oProductAttrDataCache[classify]['price'] = W('#NonProductAttr input').val();
        }
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
        var tpl_fun = W('#LiangpinProductMultiAttrPriceTpl'+tpl_sign).html().trim().tmpl(),
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
                var wPrice = wPriceBlock.query('[name="price[]"]');
                wPrice.forEach(function(el){
                    var wMe = W(el),
                        val = wMe.val();
                    val = val ? parseFloat(val) : 0;
                    wMe.siblings('[name="attr_val_id[]"]').removeNode();
                    if (val>=0) {
                        flag = true;
                    }
                    var attr_str = wMe.ancestorNode('td').siblings('.p-attr').map(function(el){
                        return W(el).attr('data-id');
                    }).join(',');
                    wMe.insertAdjacentHTML('afterend', '<input type="hidden" name="attr_val_id[]" value="'+attr_str+'">');
                });
            } else {
                var wProductAttr = W('#ProductAttr');
                if (wProductAttr.length) {
                    setScrollTop(wProductAttr.getRect()['top']);
                }
                tcb.alert('', '请确认选择商品属性并填写报价后，再提交', {'width':300, btn_name: '关闭',wrapId:"ErrorAlertPannel"}, function(){return true;});

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


    /**** 选择商品属性，并且填写报价 ****/
    // 遍历价格属性列表行，所有属性全部选择，返回选择后的数据，否则返回false；
    function eachPriceAttrLine(wAttrLine){
        if (!(wAttrLine && wAttrLine.length)) {
            return false;
        }
        var flag = true,
            SelectedAttrName = [],
            SelectedAttr = []; // SelectedAttrName 和 SelectedAttr 生成后是一一对应的关系；
        wAttrLine.forEach(function(el){
            if (!flag) {return; }
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
                flag = false;
                tcb.alert('', '请选择 ' + attrname, {'width':300, btn_name: '关闭',wrapId:"ErrorAlertPannel"}, function(){return true;});
                return;
            }
        });

        return flag ? [SelectedAttrName, SelectedAttr] : flag;
    }
    // 生成已选择属性的组合，返回属性组，或者false
    function generateAttrGroup(SelectedAttr){
        if (!(SelectedAttr && SelectedAttr.length)) {
            return false;
        }
        var AttrGroup = [],
            CountArr  = [],
            CountArr2 = [];
        SelectedAttr.reverse();
        SelectedAttr.forEach(function(aAttr){
            var num = aAttr.length;
            if (CountArr[0]) {
                num = num*CountArr[0];
            }
            CountArr.unshift(num);
            CountArr2.unshift(aAttr.length);
        });
        SelectedAttr.reverse();
        CountArr.push(1);
        CountArr.shift();

        var i = 0, kk = 1;
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

        return AttrGroup;
    }
    // 设置属性组的price stock cache
    function setAttrGroupCacheData(AttrGroup){
        // 价格cache
        var dataCache = oProductAttrDataCache[W('[name="model_id"]').val()];
        var SelectedAttrPirceCache = dataCache ? dataCache : null;

        AttrGroup.forEach(function(item){
            var flag = false;
            if (SelectedAttrPirceCache) {
                var combine_id = item.map(function(iSub){return iSub['id'];}).join(',');
                QW.ObjectH.map(SelectedAttrPirceCache, function(v, k){
                    if (combine_id===k) {
                        item.push(v['price']?v['price']:'');
                        if(add_type=='huanxin'){
                            item.push(v['real_price']?v['real_price']:'');
                        }
                        item.push(v['stock_nums']?v['stock_nums']:0);
                        item.push(v['online']?v['online']:'1');
                        if(add_type=='guanhuan'){
                            item.push(v['flash_price'] ? v['flash_price'] : '0');
                            item.push(v['flash_start_time_time']);
                            item.push(v['flash_end_time_time']);
                            item.push(v['huodong_type']);
                            item.push(v['imei']);
                        }
                        flag = true;
                    }
                });
            }
            if (!flag) {
                item.push('');
                if(add_type=='huanxin'){
                    item.push('');
                }
                item.push(0);
                item.push('1');
                if(add_type=='guanhuan'){
                    item.push(0);
                    item.push(0);
                    item.push(0);
                    item.push(0);
                    item.push('');
                }
            }
        });
    }
    // 验证产品表单
    function validProductForm(wForm){
        var flag = true;
        // 表单验证 start
        if(!QW.Valid.checkAll(wForm[0])){
            flag = false;
        }
        // 验证多属性组合价格填写的合法性
        if (!validMultiAttrPrice()) {
            flag = false;
        }
        // 售后服务
        if(window.__PService){
            if( window.__PService.getContent() == "" ){
                W('#PServiceError').show();
                window.__PService.focus();
                flag = false;
            }else{
                W('#PServiceError').hide();
            }
        }
        // 实拍描述
        /*
        if(window.__PDescribe){
            if( window.__PDescribe.getContent() == "" ){
                W('#PDescribeError').show();
                window.__PDescribe.focus();
                flag = false;
            }else{
                W('#PDescribeError').hide();
            }
        }
        */

        // 表单验证 end
        return flag;
    }
    // 异步获取型号下的属性(目前只用于添加商品时)
    function ajaxSetModelAttr(model_id, callback){
        if (!model_id) {
            return;
        }
        var request_url = '/liangpin_mer/aj_model_attr?model_id='+model_id;
        QW.Ajax.get(request_url, function(res){
            res = JSON.parse(res);

            if (!res['errno']) {
                var datas = {
                    'attr_price': res['result']['price']
                };
                var tmpl_fn  = W('#LiangpinProductMultiAttrTpl'+tpl_sign).html().tmpl(),
                    tmpl_str = tmpl_fn(datas);
                W('#ProductAttr').html(tmpl_str);

                if (res['result']['no_price']) {
                    datas = {
                        'attr_no_price': res['result']['no_price']
                    };
                    tmpl_fn  = W('#LiangpinProductScreenTpl'+tpl_sign).html().tmpl();
                    tmpl_str = tmpl_fn(datas);
                    if (W('#ProductScreen').length) {
                        W('#ProductScreen').html(tmpl_str);
                    }
                }
                if(QW.ObjectH.isFunction(callback)){
                    callback(res);
                }
            } else {

            }
        });
    }
    // 设置填写IMEI号或者SN号
    function setIMEIAndSNAttr(imei){
        var params = {
            'imei': imei
        };
        var tpl_fun = W('#IMEIAndSNAttrTpl').html().trim().tmpl(),
            tpl_str = tpl_fun(params);

        var wLine = W('#IMEIAndSNAttr');
        wLine.html(tpl_str);
    }
    // 设置填写商品描述(质检结论)
    function setProductDesc(chengse_desc){
        chengse_desc = chengse_desc.trim();
        if (chengse_desc) {
            chengse_desc = chengse_desc=='全新' ? chengse_desc : chengse_desc+'新';
        }
        var params  = {
            'chengse_desc' : chengse_desc
        };
        var tpl_fun = W('#ProductDescTpl').html().trim().tmpl(),
            tpl_str = tpl_fun(params);
        var wLine = W('#ProductDesc');
        wLine.html(tpl_str);
    }
    //默认填写商品描述(质检结论)
    setProductDesc('');

    /******* 事件绑定 *******/
    tcb.bindEvent(document.body, {
        // 确认属性的选择
        '.product-multiattr-select-confirm-btn': function(e){
            e.preventDefault();


            var wAttrLine = W('.product-multiattr-line'),
                AttrArr = eachPriceAttrLine(wAttrLine);

            if (!AttrArr) { return false;}

            var SelectedAttrName = AttrArr[0],
                SelectedAttr     = AttrArr[1];

            var AttrGroup = generateAttrGroup(SelectedAttr);

            setAttrGroupCacheData(AttrGroup);

            setProductMultiAttrPriceTpl({
                'attrName' : SelectedAttrName,
                'attrGroup': AttrGroup
            });
            W('.product-multiattr-block').slideUp();
        },
        // 重新选择属性组合
        '.product-multiattr-reselect-btn': function(e){
            e.preventDefault();

            // setProductAttrDataCache();

            W('.product-multiattr-block').slideDown();
            W('.product-multiattr-price-block').removeNode();
        },
        // 编辑商品 下一步
        'div.btn-step':function(e){
            e.preventDefault();

            // 设置产品分类相关逻辑
            // setProductAttr();
            // 设置型号相关信息
            var wCurBrand = W('#ProductBrand .curl'),
                wCurModel = W('#ProductModel .curl');

            var data_id = wCurModel.attr('data-id');
            //如果是优品
            if(add_type == 'liangpin')
            {
                 ret = confirm('即将添加优品机!');
                 if(ret == false)
                 {
                     return ret;
                 }
            	 ajaxSetModelAttr(data_id, function(){
                     // 默认设置填写IMEI号
                     setIMEIAndSNAttr(1);
                 });

                 W('#BrandModelNav').html(wCurBrand.html()+' > '+wCurModel.html());
                 W('#ProductTitlePrev').html(wCurBrand.html()+' '+wCurModel.html());
                 W('[name="model_id"]').val(data_id);

                 // 商品编辑 步骤状态
                 W("#new_product_step1").hide();
                 W("#new_product_step2").show();
                 W('.new-product-step1').hide();
                 W('.new-product-step2').show();
                 W("#product_step").val(2);
            }
            else
            {//如果是官换

                 if(add_type=='guanhuan')
                 {
                     wCurChengse = W('#ProductChengse .curl');

                     var chengse = wCurChengse.attr('data-id');
                     var chengseText = wCurChengse.html();
                     ret = confirm('即将添加官换机!');
                 }
                 else
                 {
                     ret = confirm('即将添加换新机!');
                 }

                 if(ret == false)
                 {
                     return ret;
                 }
                if(add_type=='guanhuan'){
                    gurl = '/liangpin_mer/aj_ck_add_model?model_id='+data_id+'&add_type='+add_type+'&chengse='+chengse;
                }else{
                    gurl = '/liangpin_mer/aj_ck_add_model?model_id='+data_id+'&add_type='+add_type;
                }

            	 Ajax.get(gurl, function(res){
                     res = JSON.parse(res);

                     if (!res['errno']) {
                         ajaxSetModelAttr(data_id);

                         W('#BrandModelNav').html(wCurBrand.html()+' > '+wCurModel.html());
                         W('#ProductTitlePrev').html(wCurBrand.html()+' '+wCurModel.html());
                         W('[name="model_id"]').val(data_id);

                         // 商品编辑 步骤状态
                         W("#new_product_step1").hide();
                         W("#new_product_step2").show();
                         W('.new-product-step1').hide();
                         W('.new-product-step2').show();
                         W("#product_step").val(2);
                         if(add_type=='guanhuan' && chengse>0){
                             $("#chengse").val(chengse);
                             $("#chengseSet").html(chengseText);
                             //$("#chengseSet").attr("disabled",true);
                         }

                     }
                     else if(res['errno']=='3') {
                         if(add_type=='guanhuan'){
                             eurl = '/liangpin_mer/edit_product?model_id='+data_id+'&add_type='+add_type+'&chengse='+chengse;
                         }else{
                             eurl = '/liangpin_mer/edit_product?model_id='+data_id+'&add_type='+add_type;
                         }
                         if (confirm('您已经发布过同型号商品，是否重新编辑？')) {
                             location.href = eurl;
                         }
                     } else {
                         alert(res['errmsg']);
                     }
                 });
            }
        },
        // 返回品牌型号的选择
        'a.go-first':function(e){
    		e.preventDefault();

            // setProductAttrDataCache();
            W("#new_product_step2").hide();
            W("#new_product_step1").show();
            W('.new-product-step2').hide();
            W('.new-product-step1').show();
        },
        // 选择分类
        '.cate li':function(e){
            e.preventDefault();

            var me = W(this);

            me.siblings('li').removeClass('curl');
            me.addClass('curl');

            var brand_model = window.brand_model;
            if (me.ancestorNode('#ProductBrand').length) {
                var model_str = '';
                brand_model[me.attr('data-id')].forEach(function(arr, i){
                    model_str += '<li data-id="'+arr.model_id+'" class="'+(i==0 ? 'curl' : '')+'">'+arr.model_name+'</li>';
                });
                W('#ProductModel').html(model_str);
            }
        },
        'input[type="text"]': {
            change: function(){
                window.onbeforeunload = function(){
                    return '离开后，填写的内容将会丢失';
                }
            }
        },
        // 添加商品，保存上架
        '#addProduct a.btn-save1':function(e){
            e.preventDefault();
            var wMe = W(this)
            if(wMe.attr('disabled')){
                alert('您已点击过一次,再忍忍,实在忍不了,请刷新页面!')
                return;
            } else {
                wMe.attr('disabled', 'disabled');
            }

            var wAddProduct = W("#addProduct");

            // 表单验证
            if (!validProductForm(wAddProduct)) {
                wMe.removeAttr('disabled');
                return false;
            }

            document.addProduct.onsale.value = "1"; // 设置上架发布
            wAddProduct.attr("target","_self");
            wAddProduct.attr("action","/liangpin_mer/aj_sub_product/");

            Ajax.post(document.addProduct, function(e){
                try{
                    var ret = (e || "").evalExp();
                    if(parseInt(ret.errno, 10) != 0) {
                        wMe.removeAttr('disabled');
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
                        location.replace("/liangpin_mer/add_product/?add_type=guanhuan");
                    },3000);

                }catch(e){
                    W('#addProduct a.btn-save1').removeAttr('disabled');
                    alert("提交失败，请稍后重试");
                }
            });
        },
        // 添加商品，保存下架
        '#addProduct a.btn-save2':function(e){
            e.preventDefault();
            var wMe = W(this)
            if(wMe.attr('disabled')){
                alert('您已点击过一次,再忍忍,实在忍不了,请刷新页面!')
                return;
            } else {
                wMe.attr('disabled', 'disabled');
            }

            var wAddProduct = W("#addProduct");

            // 表单验证
            if (!validProductForm(wAddProduct)) {
                wMe.removeAttr('disabled');
                return false;
            }

            document.addProduct.onsale.value = "2"; // 设置下架发布
            wAddProduct.attr("target","_self");
            wAddProduct.attr("action","/liangpin_mer/aj_sub_product/");

            Ajax.post(W('#addProduct')[0], function(e){
                try{
                    var ret = (e || "").evalExp();
                    if(parseInt(ret.errno, 10) != 0) {
                        wMe.removeAttr('disabled');
                        return alert(ret.errmsg);
                    };
                    window.onbeforeunload = null;
                   if(add_type == 'liangpin'){
                       window.open('/liangpin_mer/printBarCode/?product_id=' + ret.result.product_id);
                   }
                    var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">发布商品成功,3秒钟后刷新页面。</div>',
                        {
                            'width' : 410,
                            'wrapId' : 'panelMessageTips'
                        }, function() {
                            panel.hide();
                    });
                    setTimeout(function(){
                        location.replace("/liangpin_mer/add_product/?add_type=liangpin");
                    },3000);
                }catch(e){
                    W('#addProduct a.btn-save2').removeAttr('disabled');
                    alert("提交失败，请稍后重试");
                }
            });
        },
        // 编辑商品，保存上架
        '#editProduct a.btn-save1':function(e){
            e.preventDefault();
            var wMe = W(this)
            if(wMe.attr('disabled')){
                alert('您已点击过一次,再忍忍,实在忍不了,请刷新页面!')
                return;
            } else {
                wMe.attr('disabled', 'disabled');
            }
            var wEditProduct = W("#editProduct");

            if(add_type == 'liangpin'){
                var user_input = $('.user_input_price').val(),
                    wh_id = $(this).attr('data-wh-id');
                function compareProductPrice(user_input,wh_id) {

                    $.get('/liangpin_mer/doGetPurchasePrice',{
                        'wh_id' : wh_id
                    },function (res) {
                        res = JSON.parse(res)
                        if(!res.errno){
                            if(user_input-0 < res.result){
                                var user_confirm = confirm('当前定价低于入库价，是否确定要修改价格？')
                                if(user_confirm){
                                    alreadyFunction()
                                }
                            }else{
                                alreadyFunction()
                            }
                        }else{
                            wMe.removeAttr('disabled');
                            alert(res.errmsg)
                        }
                    })
                }
                compareProductPrice(user_input,wh_id);
            } else {
                alreadyFunction();
            }

            function alreadyFunction() {
                // 表单验证
                if (!validProductForm(wEditProduct)) {
                    wMe.removeAttr('disabled');
                    return false;
                }

                document.editProduct.onsale.value = "1"; // 设置上架发布
                if( add_type == 'liangpin' ){
                    wEditProduct.attr("action","/liangpin_mer/aj_edit_product_liangpin/");
                }
                else{
                    wEditProduct.attr("action","/liangpin_mer/aj_edit_product/");
                }

                Ajax.post(wEditProduct[0], function(e){
                    try{
                        var ret = (e || "").evalExp();
                        if(parseInt(ret.errno, 10) != 0) {
                            wMe.removeAttr('disabled');
                            return alert(ret.errmsg);
                        }
                        window.onbeforeunload = null;
                        var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">修改商品成功,3秒钟后刷新页面。</div>',
                            {
                                'width' : 410,
                                'wrapId' : 'panelMessageTips'
                            }, function() {
                                panel.hide();

                                if(add_type == 'liangpin'){
                                    location.href="/liangpin_mer/product_list_liangpin";
                                }
                                else{
                                    location.href="/liangpin_mer/product_list";
                                }
                            });
                        setTimeout(function(){
                            if(add_type == 'liangpin'){
                                location.href="/liangpin_mer/product_list_liangpin";
                            }
                            else{
                                location.href="/liangpin_mer/product_list";
                            }
                        },3000);


                    }catch(e){
                        alert("提交失败，请稍后重试");
                    }
                });
            }


        },
        // 编辑商品，保存下架
        '#editProduct a.btn-save2':function(e){
            e.preventDefault();
            var wMe = W(this)
            if(wMe.attr('disabled')){
                alert('您已点击过一次,再忍忍,实在忍不了,请刷新页面!')
                return;
            } else {
                wMe.attr('disabled', 'disabled');
            }

            var wEditProduct = W("#editProduct");

            // 表单验证
            if (!validProductForm(wEditProduct)) {
                wMe.removeAttr('disabled');
                return false;
            }

            document.editProduct.onsale.value = "2"; // 设置下架发布
            if( add_type == 'liangpin' ){
            	wEditProduct.attr("action","/liangpin_mer/aj_edit_product_liangpin/");
            }
            else{
            	wEditProduct.attr("action","/liangpin_mer/aj_edit_product/");
            }
            Ajax.post(wEditProduct[0], function(e){
                try{
                    var ret = (e || "").evalExp();
                    if(parseInt(ret.errno, 10) != 0) {
                        wMe.removeAttr('disabled');
                        return alert(ret.errmsg);
                    };
                    window.onbeforeunload = null;
                    if(add_type == 'liangpin'){
                        window.open('/liangpin_mer/printBarCode/?product_id=' + ret.result.product_id);
                    }
                    var panel =tcb.alert('', '<div class="clearfix" style="padding:30px;font-size:14px">修改商品成功,3秒钟后刷新页面。</div>',
                        {
                            'width' : 410,
                            'wrapId' : 'panelMessageTips'
                        }, function() {
                            panel.hide();
                            if(add_type == 'liangpin'){
                            	location.href="/liangpin_mer/product_list_liangpin";
                            }
                            else{
                            	location.href="/liangpin_mer/product_list";
                            }
                    });
                    setTimeout(function(){
                          if(add_type == 'liangpin'){
                          	location.href="/liangpin_mer/product_list_liangpin";
                          }
                          else{
                          	location.href="/liangpin_mer/product_list";
                          }
                    },3000);


                }catch(e){
                    alert("提交失败，请稍后重试");
                }
            });
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
        },
        // 删除上传图片
        '.mer-pack-imglist .del,.mer-head-imglist .del': function(e){
            e.preventDefault();

            var wMe = W(this);

            wMe.siblings('span').html('');
            wMe.siblings('input').val('');
            wMe.ancestorNode('li').addClass('no-img');
        },
        // 设置上下架状态
        '.set-product-multiattr-online': function(e){
            e.preventDefault();

            var wMe = W(this),
                wIpt = wMe.siblings('input');

            if(wIpt.val()=='1'){
                wIpt.val('2');
                wMe.html('下架');
            } else {
                wIpt.val('1');
                wMe.html('上架');
            }
        },
        //
        '.set-product-flash-status': function(e){
            e.preventDefault();
            var wMe = W(this),
                wIpt = wMe.siblings('input');

            if(wIpt.val()=='0'){
                wIpt.val('250');
                wMe.html('秒杀开启');
            } else {
                wIpt.val('0');
                wMe.html('秒杀关闭');
            }
        },
        // 价格交互
        '[name="price[]"], [name="stock_nums[]"]': {
            'blur': function(e){
                var wMe = W(this);

                var wTr = wMe.ancestorNode('tr'),
                    wPriceTd = wTr.query('.product-multiattr-price-td'),
                    wStockTd = wTr.query('.product-multiattr-stock-td'),
                    wOnlineTd = wTr.query('.product-multiattr-online-td');
                // 价格 和 库存 都大于零
                if (parseFloat(wPriceTd.query('input').val())>0 && parseFloat(wStockTd.query('input').val())>0) {
                    wOnlineTd.query('[name="online[]"]').val('1');
                    wOnlineTd.query('.set-product-multiattr-online').show().html('上架');
                } else {
                    wOnlineTd.query('.set-product-multiattr-online').hide();
                }
            }
        },
        // 为了实现，选择wifi或者3g，切换填写序列号和IMEI号
        '.product-multiattr-line [type="radio"]': function(e){
            var wMe = W(this);

            var wLine = wMe.ancestorNode('.product-multiattr-line'),
                wRadio = wLine.query('[type="radio"]');
            // 行内是否有wifi属性
            var wWifiRadio = wRadio.filter(function(el){
                return W(el).val()==='114'
            });
            if(wWifiRadio && wWifiRadio.length){
                var imei = 1;
                // 选wifi
                if(wMe.val()==='114'){
                    imei = '';
                }
                setIMEIAndSNAttr(imei);
            }
        },
        '#firstClass .search-box': {
            'keyup': function (e) {
                var target_txt = $(this).val()
                var item_all = $('#ProductBrand li')
                searchByKeyWord(item_all,target_txt)
            }
        },
        '#secondClass .search-box': {
            'keyup': function (e) {
                var target_txt = $(this).val()
                var item_all = $('#ProductModel li')
                searchByKeyWord(item_all,target_txt)
            }
        },
        '#chengseClass .search-box': {
            'keyup': function (e) {
                var target_txt = $(this).val()
                var item_all = $('#ProductChengse li')
                searchByKeyWord(item_all,target_txt)
            }
        }
    });
    
    //模糊搜索
    function searchByKeyWord(target_ele,target_word) {
        for(var i=0; i<target_ele.length; i++){
            var $item = $(target_ele[i])

            if(target_word.toUpperCase() == ''){
                $item.show()
            }else{
                if($item.text().toUpperCase().indexOf(target_word.toUpperCase())>-1){
                    $item.show()
                }else {
                    $item.hide()
                }
            }
        }
    }

    // 编辑商品时 默认选择属性和价格
    (function(){
        var attr_price = window.attr_price,
            attr_selected = [],
            attr_price_cache = {};

        if (attr_price&&QW.ObjectH.isPlainObject(attr_price)) {

            // 设置 attr_selected 和 attr_price_cache
            QW.ObjectH.map(attr_price, function(v, k){
                v['attr'].forEach(function(vv, kk){
                    vv = parseInt(vv, 10);

                    if (typeof attr_selected[kk]=='undefined') {
                        attr_selected[kk] = [];
                    }
                    if(attr_selected[kk].indexOf(vv)==-1){
                        attr_selected[kk].push(vv);
                    }
                });

                attr_price_cache[v['attr'].join(',')] = {
                    'price': v['price'],
                    'stock_nums': v['stock_nums'],
                    'online': v['online']
                };
                if(add_type=='huanxin')
                {
                    attr_price_cache[v['attr'].join(',')] = {
                        'price': v['price'],
                        'real_price': v['real_price'],
                        'stock_nums': v['stock_nums'],
                        'online': v['online']
                    };
                }

                if(v['flash_price']){
                    // 如果有秒杀价
                    attr_price_cache[v['attr'].join(',')]['flash_price'] = v['flash_price']
                }
                attr_price_cache[v['attr'].join(',')]['flash_start_time_time'] = v['flash_start_time_time'];
                attr_price_cache[v['attr'].join(',')]['flash_end_time_time']   = v['flash_end_time_time'];
                attr_price_cache[v['attr'].join(',')]['huodong_type']          = v['huodong_type'];
                attr_price_cache[v['attr'].join(',')]['imei']                  = v['imei'];

            });
            // 设置被选择的属性
            oProductAttrDataCache['attr_selected'] = attr_selected;
            // 设置属性价格cache
            oProductAttrDataCache[W('[name="model_id"]').val()] = attr_price_cache;

            // 遍历多属性行节点
            W('.product-multiattr-line').forEach(function(el, i){
                var wInp = W(el).query('input');

                wInp.forEach(function(inp){
                    var wMe = W(inp);

                    if(attr_selected[i].indexOf(parseInt(wMe.val(), 10))!==-1){
                        wMe.attr('checked', 'checked');
                    }
                });
            });

            W('.product-multiattr-select-confirm-btn').click();
        }
    }());

    // 上传包装图片
    (function(){
        var wCurImgItem = null;
        // 回调函数
        var upHandler = {
            // 上传文件加入队列
            fileQueued: function(file){
                // try {
                //     console.log('fileQueued');
                //     console.log(file);
                // } catch (ex) {
                //     this.debug(ex);
                // }
            },
            // 上传队列错误
            fileQueueError: function(file, errorCode, message){
                try {
                    // console.log('fileQueueError');
                    // console.log(file, errorCode, message);

                    switch (errorCode) {
                        case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                            alert("一次只能上传" + (message > 1 ? message : 1) + "个文件");
                            this.debug("一次只能上传" + (message > 1 ? message : 1) + "个文件");
                            break;
                        case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                            alert("文件过大!，请上传小于"+ this.settings.file_size_limit+"的文件");
                            this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                            // alert('不能上传 0 字节的文件');
                            alert('您上传的文件太小，无法上传');
                            this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                            alert('非法的文件格式');
                            this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        default:
                            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                    }
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 文件选择框
            fileDialogComplete: function(numFilesSelected, numFilesQueued){
                try {
                    // console.log('fileDialogComplete');
                    // console.log(numFilesSelected, numFilesQueued);

                    // 加入队列中的文件数 大于0，才执行上传操作
                    if (numFilesQueued) {
                        // 自动开始上传;
                        this.startUpload();
                    }
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 开始上传
            uploadStart: function(file){
                try {
                    // console.log('uploadStart');
                    // console.log(file);

                    wCurImgItem = W('.mer-pack-imglist .no-img').first();
                    if (wCurImgItem) {
                        wCurImgItem.query('span').html('<img src="https://p.ssl.qhimg.com/t012736d21e3607dab3.gif">');
                    } else {
                        // 没有上传位置了，那么清出队列，以免占了位置
                        var stats = this.getStats();
                        while (stats['files_queued'] > 0) {
                            this.cancelUpload();
                            stats = this.getStats();
                        }
                        alert('只能上传'+W('.mer-pack-imglist li').length+'张图片');
                        return false;
                    }
                }
                catch (ex) {}
            },
            // 上传中~
            uploadProgress: function(file, bytesLoaded, bytesTotal){
                // try {
                //     console.log('uploadProgress');
                //     console.log(file, bytesLoaded, bytesTotal);

                //     // var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
                // } catch (ex) {
                //     this.debug(ex);
                // }
            },
            // 上传异常
            uploadError: function(file, errorCode, message){
                try {
                    // console.log('uploadError');
                    // console.log(file, errorCode, message);

                    switch (errorCode) {
                        case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                            this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                            this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                            this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                            this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                            this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                            this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                            this.debug("Error Code: File Cancelled, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                            this.debug("Error Code: Upload Stopped, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        default:
                            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                    }
                } catch (ex) {
                    this.debug(ex);
                }
                return ;
            },
            // 上传成功
            uploadSuccess: function(file, serverData){
                try {
                    // console.log('uploadSuccess');
                    // console.log(file, serverData);

                    serverData = QW.JSON.parse(serverData);
                    if(serverData['errno'] == 0 && wCurImgItem){
                        wCurImgItem.removeClass('no-img')
                            .query('span').html('<img src="'+serverData['picsrc']+'" style="width:100%;height:100%;">');

                        wCurImgItem.query('input').val(serverData['picsrc']);
                    } else{
                        wCurImgItem.query('span').html('');
                        alert('上传失败，请重新尝试');
                    }
                    wCurImgItem = null;
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 上传完成
            uploadComplete: function(file){
                // console.log('uploadComplete');
                // console.log(file);
                var stats = this.getStats();
                if (stats['files_queued']>0){
                    this.startUpload();
                }
            },
            // 队列完成
            queueComplete: function(numFilesUploaded){
                // console.log('queueComplete');
                // console.log(numFilesUploaded);
            }
        };
        // 上传配置
        var upOptions = {
            flash_url : '/resource/swf/swfupload2.5.fix.swf',
            upload_url: '/liangpin_mer/uploadimg/',
            file_post_name: "filedata",
            post_params: {
                'T': window.T||'',
                'Q': window.Q||''
            },
            file_size_limit : "20 MB",
            file_types : "*.jpg;*.jpeg;*.gif;*.png",
            file_types_description : "Image Files",
            file_upload_limit : 100,
            file_queue_limit : 5,
            // debug: true,
            // 上传按钮设置
            button_image_url: "http://",
            button_width: "103",
            button_height: "31",
            button_placeholder_id: "AddPackImgs",
            button_text: "<span class=\"textcolor\">立即上传</span>",
            button_text_style: ".textcolor{color:#666666;}",
            button_text_top_padding: 6,
            button_text_left_padding: 40,
            button_cursor: SWFUpload.CURSOR.HAND,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            prevent_swf_caching: false,
            // 上传回调函数
            file_queued_handler          : upHandler.fileQueued,
            file_queue_error_handler     : upHandler.fileQueueError,
            file_dialog_complete_handler : upHandler.fileDialogComplete,
            upload_start_handler         : upHandler.uploadStart,
            upload_progress_handler      : upHandler.uploadProgress,
            upload_error_handler         : upHandler.uploadError,
            upload_success_handler       : upHandler.uploadSuccess,
            upload_complete_handler      : upHandler.uploadComplete,
            queue_complete_handler       : upHandler.queueComplete // Queue plugin event
        };
        if (W('#AddPackImgs').length) {
            var SWFUploadInst  = new SWFUpload(upOptions);//构造一个上传实例；
        }
    }());

    (function(){
        var wCurImgItem = null;
        // 回调函数
        var upHandler = {
            // 上传文件加入队列
            fileQueued: function(file){
            },
            // 上传队列错误
            fileQueueError: function(file, errorCode, message){
                try {
                    // console.log('fileQueueError');
                    // console.log(file, errorCode, message);

                    switch (errorCode) {
                        case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                            alert("一次只能上传" + (message > 1 ? message : 1) + "个文件");
                            this.debug("一次只能上传" + (message > 1 ? message : 1) + "个文件");
                            break;
                        case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                            alert("文件过大!，请上传小于"+ this.settings.file_size_limit+"的文件");
                            this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                            // alert('不能上传 0 字节的文件');
                            alert('您上传的文件太小，无法上传');
                            this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                            alert('非法的文件格式');
                            this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        default:
                            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                    }
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 文件选择框
            fileDialogComplete: function(numFilesSelected, numFilesQueued){
                try {
                    // console.log('fileDialogComplete');
                    // console.log(numFilesSelected, numFilesQueued);

                    // 加入队列中的文件数 大于0，才执行上传操作
                    if (numFilesQueued) {
                        // 自动开始上传;
                        this.startUpload();
                    }
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 开始上传
            uploadStart: function(file){
                try {
                    wCurImgItem = W('.mer-content-imglist .no-img').first();
                    if (wCurImgItem) {
                        wCurImgItem.query('span').html('<img src="https://p.ssl.qhimg.com/t012736d21e3607dab3.gif">');
                    } else {
                        // 没有上传位置了，那么清出队列，以免占了位置
                        var stats = this.getStats();
                        while (stats['files_queued'] > 0) {
                            this.cancelUpload();
                            stats = this.getStats();
                        }
                        alert('只能上传'+W('.mer-content-imglist li').length+'张图片');
                        return false;
                    }
                }
                catch (ex) {}
            },
            // 上传中~
            uploadProgress: function(file, bytesLoaded, bytesTotal){
            },
            // 上传异常
            uploadError: function(file, errorCode, message){
                try {
                    switch (errorCode) {
                        case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                            this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                            this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                            this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                            this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                            this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                            this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                            this.debug("Error Code: File Cancelled, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                            this.debug("Error Code: Upload Stopped, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        default:
                            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                    }
                } catch (ex) {
                    this.debug(ex);
                }
                return ;
            },
            // 上传成功
            uploadSuccess: function(file, serverData){
                try {
                    // console.log('uploadSuccess');
                    // console.log(file, serverData);

                    serverData = QW.JSON.parse(serverData);
                    if(serverData['errno'] == 0 && wCurImgItem){
                        wCurImgItem.removeClass('no-img')
                            .query('span').html('<img src="'+serverData['picsrc']+'" style="width:100%;height:100%;">');

                        wCurImgItem.query('input').val(serverData['picsrc']);
                    } else{
                        wCurImgItem.query('span').html('');
                        alert('上传失败，请重新尝试');
                    }
                    wCurImgItem = null;
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 上传完成
            uploadComplete: function(file){
                // console.log('uploadComplete');
                // console.log(file);
                var stats = this.getStats();
                if (stats['files_queued']>0){
                    this.startUpload();
                }
            },
            // 队列完成
            queueComplete: function(numFilesUploaded){
                // console.log('queueComplete');
                // console.log(numFilesUploaded);
            }
        };
        // 上传配置
        var upOptions = {
            flash_url : '/resource/swf/swfupload2.5.fix.swf',
            upload_url: '/liangpin_mer/uploadimg/',
            file_post_name: "filedata",
            post_params: {
                'T': window.T||'',
                'Q': window.Q||''
            },
            file_size_limit : "20 MB",
            file_types : "*.jpg;*.jpeg;*.gif;*.png",
            file_types_description : "Image Files",
            file_upload_limit : 100,
            file_queue_limit : 5,
            // debug: true,
            // 上传按钮设置
            button_image_url: "http://",
            button_width: "103",
            button_height: "31",
            button_placeholder_id: "AddContentImgs",
            button_text: "<span class=\"textcolor\">立即上传</span>",
            button_text_style: ".textcolor{color:#666666;}",
            button_text_top_padding: 6,
            button_text_left_padding: 40,
            button_cursor: SWFUpload.CURSOR.HAND,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            prevent_swf_caching: false,
            // 上传回调函数
            file_queued_handler          : upHandler.fileQueued,
            file_queue_error_handler     : upHandler.fileQueueError,
            file_dialog_complete_handler : upHandler.fileDialogComplete,
            upload_start_handler         : upHandler.uploadStart,
            upload_progress_handler      : upHandler.uploadProgress,
            upload_error_handler         : upHandler.uploadError,
            upload_success_handler       : upHandler.uploadSuccess,
            upload_complete_handler      : upHandler.uploadComplete,
            queue_complete_handler       : upHandler.queueComplete // Queue plugin event
        };
        if (W('#AddContentImgs').length) {
            var SWFUploadInst  = new SWFUpload(upOptions);//构造一个上传实例；
        }
    }());

    // 上传商品头图
    (function(){
        var wCurImgItem = null;
        // 回调函数
        var upHandler = {
            // 上传文件加入队列
            fileQueued: function(file){
                // try {
                //     console.log('fileQueued');
                //     console.log(file);
                // } catch (ex) {
                //     this.debug(ex);
                // }
            },
            // 上传队列错误
            fileQueueError: function(file, errorCode, message){
                try {
                //    console.log('fileQueueError');
                //    console.log(file, errorCode, message);

                    switch (errorCode) {
                        case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                            alert("一次只能上传" + (message > 1 ? message : 1) + "个文件");
                            this.debug("一次只能上传" + (message > 1 ? message : 1) + "个文件");
                            break;
                        case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                            alert("文件过大!，请上传小于"+ this.settings.file_size_limit+"的文件");
                            this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                            // alert('不能上传 0 字节的文件');
                            alert('您上传的文件太小，无法上传');
                            this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                            alert('非法的文件格式');
                            this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        default:
                            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                    }
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 文件选择框
            fileDialogComplete: function(numFilesSelected, numFilesQueued){
                try {
                    // console.log('fileDialogComplete');
                    //console.log(numFilesSelected, numFilesQueued);

                    // 加入队列中的文件数 大于0，才执行上传操作
                    if (numFilesQueued) {
                        // 自动开始上传;
                        this.startUpload();
                    }
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 开始上传
            uploadStart: function(file){
                try {
                    // console.log('uploadStart');
                    // console.log(file);

                    wCurImgItem = W('.mer-head-imglist .no-img').first();
                    if (wCurImgItem) {
                        wCurImgItem.query('span').html('<img src="https://p.ssl.qhimg.com/t012736d21e3607dab3.gif">');
                    } else {
                        // 没有上传位置了，那么清出队列，以免占了位置
                        var stats = this.getStats();
                        while (stats['files_queued'] > 0) {
                            this.cancelUpload();
                            stats = this.getStats();
                        }
                        alert('只能上传'+W('.mer-head-imglist li').length+'张图片');
                        return false;
                    }
                }
                catch (ex) {}
            },
            // 上传中~
            uploadProgress: function(file, bytesLoaded, bytesTotal){
                // try {
                //     console.log('uploadProgress');
                //     console.log(file, bytesLoaded, bytesTotal);

                //     // var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
                // } catch (ex) {
                //     this.debug(ex);
                // }
            },
            // 上传异常
            uploadError: function(file, errorCode, message){
                try {
                    // console.log('uploadError');
                    // console.log(file, errorCode, message);

                    switch (errorCode) {
                        case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                            this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                            this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                            this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                            this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                            this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                            this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                            this.debug("Error Code: File Cancelled, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                            this.debug("Error Code: Upload Stopped, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                        default:
                            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                            break;
                    }
                } catch (ex) {
                    this.debug(ex);
                }
                return ;
            },
            // 上传成功
            uploadSuccess: function(file, serverData){
                try {
                    // console.log('uploadSuccess');
                    // console.log(file, serverData);

                    serverData = QW.JSON.parse(serverData);
                    if(serverData['errno'] == 0 && wCurImgItem){
                        wCurImgItem.removeClass('no-img')
                            .query('span').html('<img src="'+serverData['picsrc']+'" style="width:100%;height:100%;">');

                        wCurImgItem.query('input').val(serverData['picsrc']);
                    } else{
                        wCurImgItem.query('span').html('');
                        alert('上传失败，请重新尝试');
                    }
                    wCurImgItem = null;
                } catch (ex) {
                    this.debug(ex);
                }
            },
            // 上传完成
            uploadComplete: function(file){
                //console.log('uploadComplete');
                //console.log(file);
                var stats = this.getStats();
                if (stats['files_queued']>0){
                    this.startUpload();
                }
            },
            // 队列完成
            queueComplete: function(numFilesUploaded){
                //console.log('queueComplete');
                //console.log(numFilesUploaded);
            }
        };
        // 上传配置
        var upOptions = {
            flash_url : '/resource/swf/swfupload2.5.fix.swf',
            upload_url: '/liangpin_mer/uploadimg/',
            file_post_name: "filedata",
            post_params: {
                'T': window.T||'',
                'Q': window.Q||''
            },
            file_size_limit : "20 MB",
            file_types : "*.jpg;*.jpeg;*.gif;*.png",
            file_types_description : "Image Files",
            file_upload_limit : 100,
            file_queue_limit : 9,
            //debug: true,
            // 上传按钮设置
            button_image_url: "http://",
            button_width: "103",
            button_height: "31",
            button_placeholder_id: "AddHeadImgs",
            button_text: "<span class=\"textcolor\">立即上传</span>",
            button_text_style: ".textcolor{color:#666666;}",
            button_text_top_padding: 6,
            button_text_left_padding: 40,
            button_cursor: SWFUpload.CURSOR.HAND,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            prevent_swf_caching: false,
            // 上传回调函数
            file_queued_handler          : upHandler.fileQueued,
            file_queue_error_handler     : upHandler.fileQueueError,
            file_dialog_complete_handler : upHandler.fileDialogComplete,
            upload_start_handler         : upHandler.uploadStart,
            upload_progress_handler      : upHandler.uploadProgress,
            upload_error_handler         : upHandler.uploadError,
            upload_success_handler       : upHandler.uploadSuccess,
            upload_complete_handler      : upHandler.uploadComplete,
            queue_complete_handler       : upHandler.queueComplete // Queue plugin event
        };
        if (W('#AddHeadImgs').length) {
            var SWFUploadInst  = new SWFUpload(upOptions);//构造一个上传实例；
        }
    }());

    /**
     * 初始化编辑器
     * @return {[type]} [description]
     */
    function initEditor(){
        if( W('#PService').length > 0 ){
            var editor1 = new UE.ui.Editor();
            editor1.render('PService');
            window.__PService = editor1;
        }
        /*//实拍描述计划于2015-11-24删除 yfl
        if( W('#PDescribe').length > 0 ){
            var editor2 = new UE.ui.Editor();
            editor2.render('PDescribe');
            window.__PDescribe = editor2;
        }
        */
    }
    initEditor();

    /**
     *添加类型页面切换器
     * @return {[type]} [description]
     */
    function initProductType(){
    	W('#product_type_guanhuan').on('click',function(e){
    		location.href = '/liangpin_mer/add_product/?add_type=guanhuan';
    	});

        W('#product_type_liangpin').on('click',function(e){
        	location.href = '/liangpin_mer/add_product/?add_type=liangpin';
    	});

        W('#product_type_huanxin').on('click',function(e){
            location.href = '/liangpin_mer/add_product/?add_type=huanxin';
        });
    }
    initProductType();


    //选择成色信息
    W('[name="chengse"]').on('change', function(e){
        var wMe = W(this),
            wOptions = wMe.query('option');

        var wOptionSelected = wOptions.filter(function(el){
            return W(el).attr('selected');
        });

        var chengse_desc = wOptionSelected.html();
        setProductDesc(chengse_desc);
        return;
    });

});
