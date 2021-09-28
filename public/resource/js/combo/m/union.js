;/**import from `/resource/js/lib/m/mobileSelect.js` **/
/*!
 * mobileSelect.js
 * (c) 2017-present onlyhom
 * Released under the MIT License.
 */

(function() {
	function getClass(dom,string) {
		return dom.getElementsByClassName(string);
	}
	//构造器
	function MobileSelect(config) {
		this.mobileSelect;
		this.wheelsData = config.wheels;
		this.jsonType =  false;
		this.cascadeJsonData = [];
		this.displayJson = []; 
		this.curValue = null;
		this.curIndexArr = [];
		this.cascade = false;
		this.startY;
		this.moveEndY;
		this.moveY;
		this.oldMoveY;
		this.offset = 0;
		this.offsetSum = 0;
		this.oversizeBorder;
		this.curDistance = [];
		this.clickStatus = false;
		this.isPC = true;
		this.init(config);
	}
	MobileSelect.prototype = {
		constructor: MobileSelect,
		init: function(config){
			var _this = this; 
			_this.keyMap = config.keyMap ? config.keyMap : {id:'id', value:'value', childs:'childs'};
			_this.checkDataType();
			_this.renderWheels(_this.wheelsData, config.cancelBtnText, config.ensureBtnText);
			_this.trigger = document.querySelector(config.trigger);
			if(!_this.trigger){
				console.error('mobileSelect has been successfully installed, but no trigger found on your page.');
				return false;
			}
			_this.wheel = getClass(_this.mobileSelect,'wheel');
			_this.slider = getClass(_this.mobileSelect,'selectContainer'); 
			_this.wheels = _this.mobileSelect.querySelector('.wheels');
			_this.liHeight = _this.mobileSelect.querySelector('li').offsetHeight;
			_this.ensureBtn = _this.mobileSelect.querySelector('.ensure');
			_this.cancelBtn = _this.mobileSelect.querySelector('.cancel');
			_this.grayLayer = _this.mobileSelect.querySelector('.grayLayer');
			_this.popUp = _this.mobileSelect.querySelector('.content');
			_this.callback = config.callback ? config.callback : function(){};
			_this.cancel = config.cancel ? config.cancel : function(){};
			_this.transitionEnd = config.transitionEnd ? config.transitionEnd : function(){};
			_this.initPosition = config.position ? config.position : [];
			_this.titleText = config.title ? config.title : '';
			_this.connector = config.connector ? config.connector : ' ';
			_this.triggerDisplayData = !(typeof(config.triggerDisplayData)=='undefined') ? config.triggerDisplayData : true;
			_this.trigger.style.cursor='pointer';
			_this.setStyle(config);
			_this.setTitle(_this.titleText);
			_this.checkIsPC();
			_this.checkCascade();
			if (_this.cascade) {
				_this.initCascade();
			}
			//定位 初始位置
			if(_this.initPosition.length < _this.slider.length){
				var diff = _this.slider.length - _this.initPosition.length;
				for(var i=0; i<diff; i++){
					_this.initPosition.push(0);
				}
			}

			_this.setCurDistance(_this.initPosition);
			_this.addListenerAll();

			//按钮监听
			_this.cancelBtn.addEventListener('click',function(){
				_this.mobileSelect.classList.remove('mobileSelect-show');
				_this.cancel(_this.curIndexArr, _this.curValue);
		    });

		    _this.ensureBtn.addEventListener('click',function(){
				_this.mobileSelect.classList.remove('mobileSelect-show');
				var tempValue ='';
		    	for(var i=0; i<_this.wheel.length; i++){
		    		i==_this.wheel.length-1 ? tempValue += _this.getInnerHtml(i) : tempValue += _this.getInnerHtml(i) + _this.connector;
		    	}
		    	if(_this.triggerDisplayData){
		    		_this.trigger.innerHTML = tempValue;
		    	}
		    	_this.curIndexArr = _this.getIndexArr();
		    	_this.curValue = _this.getCurValue();
		    	_this.callback(_this.curIndexArr, _this.curValue);
		    });

		    _this.trigger.addEventListener('click',function(){
		    	_this.mobileSelect.classList.add('mobileSelect-show');
		    });
		    _this.grayLayer.addEventListener('click',function(){
		    	_this.mobileSelect.classList.remove('mobileSelect-show');
		    });
		    _this.popUp.addEventListener('click',function(){
		    	event.stopPropagation(); 
		    });

			_this.fixRowStyle(); //修正列数
		},

		setTitle: function(string){
			var _this = this;
			_this.titleText = string;
			_this.mobileSelect.querySelector('.title').innerHTML = _this.titleText;
		},

		setStyle: function(config){
			var _this = this;
			if(config.ensureBtnColor){
				_this.ensureBtn.style.color = config.ensureBtnColor;
			}
			if(config.cancelBtnColor){
				_this.cancelBtn.style.color = config.cancelBtnColor;
			}
			if(config.titleColor){
				_this.title = _this.mobileSelect.querySelector('.title');
				_this.title.style.color = config.titleColor;
			}
			if(config.textColor){
				_this.panel = _this.mobileSelect.querySelector('.panel');
				_this.panel.style.color = config.textColor;
			}
			if(config.titleBgColor){
				_this.btnBar = _this.mobileSelect.querySelector('.btnBar');
				_this.btnBar.style.backgroundColor = config.titleBgColor;
			}
			if(config.bgColor){
				_this.panel = _this.mobileSelect.querySelector('.panel');
				_this.shadowMask = _this.mobileSelect.querySelector('.shadowMask');
				_this.panel.style.backgroundColor = config.bgColor;
				_this.shadowMask.style.background = 'linear-gradient(to bottom, '+ config.bgColor + ', rgba(255, 255, 255, 0), '+ config.bgColor + ')';
			}
		},

		checkIsPC: function(){
			var _this = this;
		    var sUserAgent = navigator.userAgent.toLowerCase();
		    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
		    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
		    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
		    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
		    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
		    var bIsAndroid = sUserAgent.match(/android/i) == "android";
		    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
		    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
		    if ((bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM)) {
		        _this.isPC = false;
		    }
		},

		show: function(){
		    this.mobileSelect.classList.add('mobileSelect-show');	
		},

		renderWheels: function(wheelsData, cancelBtnText, ensureBtnText){
			var _this = this;
			var cancelText = cancelBtnText ? cancelBtnText : '取消';
			var ensureText = ensureBtnText ? ensureBtnText : '确认';
			_this.mobileSelect = document.createElement("div");
			_this.mobileSelect.className = "mobileSelect";
			_this.mobileSelect.innerHTML = 
		    	'<div class="grayLayer"></div>'+
		        '<div class="content">'+
		            '<div class="btnBar">'+
		                '<div class="fixWidth">'+
		                    '<div class="cancel">'+ cancelText +'</div>'+
		                    '<div class="title"></div>'+
		                    '<div class="ensure">'+ ensureText +'</div>'+
		                '</div>'+
		            '</div>'+
		            '<div class="panel">'+
		                '<div class="fixWidth">'+
		                	'<div class="wheels">'+
			                '</div>'+
		                    '<div class="selectLine"></div>'+
		                    '<div class="shadowMask"></div>'+
		                '</div>'+
		            '</div>'+
		        '</div>';
		    document.body.appendChild(_this.mobileSelect);

			//根据数据长度来渲染

			var tempHTML='';
			for(var i=0; i<wheelsData.length; i++){ 
			//列
				tempHTML += '<div class="wheel"><ul class="selectContainer">';
				if(_this.jsonType){
					for(var j=0; j<wheelsData[i].data.length; j++){ 
					//行
						tempHTML += '<li data-id="'+wheelsData[i].data[j][_this.keyMap.id]+'">'+wheelsData[i].data[j][_this.keyMap.value]+'</li>';
					}
				}else{
					for(var j=0; j<wheelsData[i].data.length; j++){ 
					//行
						tempHTML += '<li>'+wheelsData[i].data[j]+'</li>';
					}
				}
				tempHTML += '</ul></div>';
			}
			_this.mobileSelect.querySelector('.wheels').innerHTML = tempHTML;
		},

		addListenerAll: function(){
			var _this = this;
			for(var i=0; i<_this.slider.length; i++){
				//手势监听
				(function (i) {
					_this.addListenerWheel(_this.wheel[i], i);
					_this.addListenerLi(i);
				})(i);
			}
		},

		addListenerWheel: function(theWheel, index){
			var _this = this;
			theWheel.addEventListener('touchstart', function () {
				_this.touch(event, this.firstChild, index);
			},false);
			theWheel.addEventListener('touchend', function () {
				_this.touch(event, this.firstChild, index);
			},false);
			theWheel.addEventListener('touchmove', function () {
				_this.touch(event, this.firstChild, index);
			},false);

			if(_this.isPC){
				//如果是PC端则再增加拖拽监听 方便调试
				theWheel.addEventListener('mousedown', function () {
					_this.dragClick(event, this.firstChild, index);
				},false);
				theWheel.addEventListener('mousemove', function () {
					_this.dragClick(event, this.firstChild, index);
				},false);
				theWheel.addEventListener('mouseup', function () {
					_this.dragClick(event, this.firstChild, index);
				},true); 
			}
		},

		addListenerLi:function(sliderIndex){
			var _this = this;
			var curWheelLi = _this.slider[sliderIndex].getElementsByTagName('li');
			for(var j=0; j<curWheelLi.length;j++){
				(function (j) {
					curWheelLi[j].addEventListener('click',function(){
						_this.singleClick(this, j, sliderIndex);
					},false);
				})(j);
			}
		},

		checkDataType: function(){ 
			var _this = this;
			if(typeof(_this.wheelsData[0].data[0])=='object'){
				_this.jsonType = true;
			}
		},

		checkCascade: function(){
			var _this = this;
			if(_this.jsonType){ 
				var node = _this.wheelsData[0].data;
				for(var i=0; i<node.length; i++){
					if(_this.keyMap.childs in node[i] && node[i][_this.keyMap.childs].length > 0){
						_this.cascade = true;
						_this.cascadeJsonData = _this.wheelsData[0].data;
						break;
					}
				}
			}else{
				_this.cascade = false;
			}
		},

		generateArrData: function (targetArr) {
			var tempArr = [];
			var keyMap_id = this.keyMap.id;
			var keyMap_value = this.keyMap.value;
			for(var i=0; i<targetArr.length; i++){
				var tempObj = {}; 
				tempObj[keyMap_id] = targetArr[i][this.keyMap.id];
				tempObj[keyMap_value] = targetArr[i][this.keyMap.value];
				tempArr.push(tempObj);	
			}
			return tempArr;
		},

		initCascade: function(){
			var _this = this;
			_this.displayJson.push(_this.generateArrData(_this.cascadeJsonData));
			if(_this.initPosition.length>0){
				_this.initDeepCount = 0;
				_this.initCheckArrDeep(_this.cascadeJsonData[_this.initPosition[0]]);
			}else{
				_this.checkArrDeep(_this.cascadeJsonData[0]);
			}
			_this.reRenderWheels();
		},

		initCheckArrDeep: function (parent) {
			var _this = this;
			if(parent){
				if (_this.keyMap.childs in parent && parent[_this.keyMap.childs].length > 0) {
					_this.displayJson.push(_this.generateArrData(parent[_this.keyMap.childs])); 
					_this.initDeepCount++;
					var nextNode = parent[_this.keyMap.childs][_this.initPosition[_this.initDeepCount]];
					if(nextNode){
						_this.initCheckArrDeep(nextNode);
					}else{
						_this.checkArrDeep(parent[_this.keyMap.childs][0]);
					}
				}
			}
		},

		checkArrDeep: function (parent) { 
			//检测子节点深度  修改 displayJson
			var _this = this;
			if(parent){
				if (_this.keyMap.childs in parent && parent[_this.keyMap.childs].length > 0) {
					_this.displayJson.push(_this.generateArrData(parent[_this.keyMap.childs])); //生成子节点数组
					_this.checkArrDeep(parent[_this.keyMap.childs][0]);//检测下一个子节点
				}
			}
		},

		checkRange: function(index, posIndexArr){
			var _this = this;
			var deleteNum = _this.displayJson.length-1-index;
			for(var i=0; i<deleteNum; i++){
				_this.displayJson.pop(); //修改 displayJson
			}
			var resultNode;
			for (var i = 0; i <= index; i++){
				if (i == 0)
					resultNode = _this.cascadeJsonData[posIndexArr[0]];
				else {
					resultNode = resultNode[_this.keyMap.childs][posIndexArr[i]];
				}
			}
			_this.checkArrDeep(resultNode);
			//console.log(_this.displayJson);
			_this.reRenderWheels();
			_this.fixRowStyle();
			_this.setCurDistance(_this.resetPosition(index, posIndexArr));
		},

		resetPosition: function(index, posIndexArr){
			var _this = this;
			var tempPosArr = posIndexArr;
			var tempCount;
			if(_this.slider.length > posIndexArr.length){ 
				tempCount = _this.slider.length - posIndexArr.length;
				for(var i=0; i<tempCount; i++){  
					tempPosArr.push(0);
				}
			}else if(_this.slider.length < posIndexArr.length){
				tempCount = posIndexArr.length - _this.slider.length;
				for(var i=0; i<tempCount; i++){
					tempPosArr.pop();
				}	
			}
			for(var i=index+1; i< tempPosArr.length; i++){
				tempPosArr[i] = 0;
			} 
			return tempPosArr;
		},

		reRenderWheels: function(){
			var _this = this;
			//删除多余的wheel
			if(_this.wheel.length > _this.displayJson.length){
				var count = _this.wheel.length - _this.displayJson.length;
				for(var i=0; i<count; i++){
					_this.wheels.removeChild(_this.wheel[_this.wheel.length-1]);
				}
			}
			for(var i=0; i<_this.displayJson.length; i++){ 
			//列
				(function (i) {
					var tempHTML='';
					if(_this.wheel[i]){
						//console.log('插入Li');
						for(var j=0; j<_this.displayJson[i].length; j++){ 
						//行
							tempHTML += '<li data-id="'+_this.displayJson[i][j][_this.keyMap.id]+'">'+_this.displayJson[i][j][_this.keyMap.value]+'</li>';
						}
						_this.slider[i].innerHTML = tempHTML;

					}else{
						var tempWheel = document.createElement("div");
						tempWheel.className = "wheel";
						tempHTML = '<ul class="selectContainer">';
						for(var j=0; j<_this.displayJson[i].length; j++){ 
						//行
							tempHTML += '<li data-id="'+_this.displayJson[i][j][_this.keyMap.id]+'">'+_this.displayJson[i][j][_this.keyMap.value]+'</li>';
						}
						tempHTML += '</ul>';
						tempWheel.innerHTML = tempHTML;

						_this.addListenerWheel(tempWheel, i);
				    	_this.wheels.appendChild(tempWheel); 
					}
					_this.addListenerLi(i);
				})(i);
			}
		},

		updateWheels:function(data){
			var _this = this;
			if(_this.cascade){
				_this.cascadeJsonData = data;
				_this.displayJson = [];
				_this.initCascade();
				if(_this.initPosition.length < _this.slider.length){
					var diff = _this.slider.length - _this.initPosition.length;
					for(var i=0; i<diff; i++){
						_this.initPosition.push(0);
					}
				}
				_this.setCurDistance(_this.initPosition);
				_this.fixRowStyle();
			}
		},

		updateWheel: function(sliderIndex, data){
			var _this = this;
			var tempHTML='';
	    	if(_this.cascade){
	    		console.error('级联格式不支持updateWheel(),请使用updateWheels()更新整个数据源');
				return false;
	    	}
	    	else if(_this.jsonType){
				for(var j=0; j<data.length; j++){
					tempHTML += '<li data-id="'+data[j][_this.keyMap.id]+'">'+data[j][_this.keyMap.value]+'</li>';
				}
				_this.wheelsData[sliderIndex] = {data: data};
	    	}else{
				for(var j=0; j<data.length; j++){
					tempHTML += '<li>'+data[j]+'</li>';
				}
				_this.wheelsData[sliderIndex] = data;
	    	}
			_this.slider[sliderIndex].innerHTML = tempHTML;
			_this.addListenerLi(sliderIndex);
		},

		fixRowStyle: function(){
			var _this = this;
			var width = (100/_this.wheel.length).toFixed(2);
			for(var i=0; i<_this.wheel.length; i++){
				_this.wheel[i].style.width = width+'%';
			}
		},

	    getIndex: function(distance){
	        return Math.round((2*this.liHeight-distance)/this.liHeight);
	    },

	    getIndexArr: function(){
	    	var _this = this;
	    	var temp = [];
	    	for(var i=0; i<_this.curDistance.length; i++){
	    		temp.push(_this.getIndex(_this.curDistance[i]));
	    	}
	    	return temp;
	    },

	    getCurValue: function(){
	    	var _this = this;
	    	var temp = [];
	    	var positionArr = _this.getIndexArr();
	    	if(_this.cascade){
		    	for(var i=0; i<_this.wheel.length; i++){
		    		temp.push(_this.displayJson[i][positionArr[i]]);
		    	}
	    	}
	    	else if(_this.jsonType){
		    	for(var i=0; i<_this.curDistance.length; i++){
		    		temp.push(_this.wheelsData[i].data[_this.getIndex(_this.curDistance[i])]);
		    	}
	    	}else{
		    	for(var i=0; i<_this.curDistance.length; i++){
		    		temp.push(_this.getInnerHtml(i));
		    	}
	    	}
	    	return temp;
	    },

	    getValue: function(){
	    	return this.curValue;
	    },

	    calcDistance: function(index){
			return 2*this.liHeight-index*this.liHeight;
	    },

	    setCurDistance: function(indexArr){
	    	var _this = this;
	    	var temp = [];
	    	for(var i=0; i<_this.slider.length; i++){
	    		temp.push(_this.calcDistance(indexArr[i]));
	    		_this.movePosition(_this.slider[i],temp[i]);
	    	}
	    	_this.curDistance = temp;
	    },

	    fixPosition: function(distance){
	        return -(this.getIndex(distance)-2)*this.liHeight;
	    },

	    movePosition: function(theSlider, distance){
	        theSlider.style.webkitTransform = 'translate3d(0,' + distance + 'px, 0)';
	        theSlider.style.transform = 'translate3d(0,' + distance + 'px, 0)';
	    },

	    locatePosition: function(index, posIndex){
	    	this.curDistance[index] = this.calcDistance(posIndex);
	    	this.movePosition(this.slider[index],this.curDistance[index]);
	    },

	    updateCurDistance: function(theSlider, index){
	        this.curDistance[index] = parseInt(theSlider.style.transform.split(',')[1]);
	    },

	    getDistance:function(theSlider){
	    	return parseInt(theSlider.style.transform.split(',')[1]);
	    },

	    getInnerHtml: function(sliderIndex){
	    	var _this = this;
	    	var index = _this.getIndex(_this.curDistance[sliderIndex]);
	    	return _this.slider[sliderIndex].getElementsByTagName('li')[index].innerHTML;
	    },

	    touch: function(event, theSlider, index){
	    	var _this = this;
	    	event = event || window.event;
	    	switch(event.type){
	    		case "touchstart":
			        _this.startY = event.touches[0].clientY;
			        _this.oldMoveY = _this.startY;
	    			break;

	    		case "touchend":

			        _this.moveEndY = event.changedTouches[0].clientY;
			        _this.offsetSum = _this.moveEndY - _this.startY;

					//修正位置
			        _this.updateCurDistance(theSlider, index);
			        _this.curDistance[index] = _this.fixPosition(_this.curDistance[index]);
			        _this.movePosition(theSlider, _this.curDistance[index]);
			        _this.oversizeBorder = -(theSlider.getElementsByTagName('li').length-3)*_this.liHeight; 


			        //反弹
			        if(_this.curDistance[index] + _this.offsetSum > 2*_this.liHeight){
			            _this.curDistance[index] = 2*_this.liHeight;
			            setTimeout(function(){
			                _this.movePosition(theSlider, _this.curDistance[index]);
			            }, 100);

			        }else if(_this.curDistance[index] + _this.offsetSum < _this.oversizeBorder){
			            _this.curDistance[index] = _this.oversizeBorder;
			            setTimeout(function(){
			                _this.movePosition(theSlider, _this.curDistance[index]);
			            }, 100);
			        }


			        _this.transitionEnd(_this.getIndexArr(),_this.getCurValue());

			        if(_this.cascade){
				        var tempPosArr = _this.getIndexArr();
				        tempPosArr[index] = _this.getIndex(_this.curDistance[index]);
			        	_this.checkRange(index, tempPosArr);
			        }

	    			break;

	    		case "touchmove":
			        event.preventDefault();
			        _this.moveY = event.touches[0].clientY;
			        _this.offset = _this.moveY - _this.oldMoveY;

			        _this.updateCurDistance(theSlider, index);
			        _this.curDistance[index] = _this.curDistance[index] + _this.offset;
			        _this.movePosition(theSlider, _this.curDistance[index]);
			        _this.oldMoveY = _this.moveY;
	    			break;
	    	}
	    },

	    dragClick: function(event, theSlider, index){
	    	var _this = this;
	    	event = event || window.event;
	    	switch(event.type){
	    		case "mousedown":
			        _this.startY = event.clientY;
			        _this.oldMoveY = _this.startY;
			        _this.clickStatus = true;
	    			break;

	    		case "mouseup":

			        _this.moveEndY = event.clientY;
			        _this.offsetSum = _this.moveEndY - _this.startY;

					//修正位置
			        _this.updateCurDistance(theSlider, index);
			        _this.curDistance[index] = _this.fixPosition(_this.curDistance[index]);
			        _this.movePosition(theSlider, _this.curDistance[index]);
			        _this.oversizeBorder = -(theSlider.getElementsByTagName('li').length-3)*_this.liHeight; 


			        //反弹
			        if(_this.curDistance[index] + _this.offsetSum > 2*_this.liHeight){
			            _this.curDistance[index] = 2*_this.liHeight;
			            setTimeout(function(){
			                _this.movePosition(theSlider, _this.curDistance[index]);
			            }, 100);

			        }else if(_this.curDistance[index] + _this.offsetSum < _this.oversizeBorder){
			            _this.curDistance[index] = _this.oversizeBorder;
			            setTimeout(function(){
			                _this.movePosition(theSlider, _this.curDistance[index]);
			            }, 100);
			        }

			        _this.clickStatus = false;
			        _this.transitionEnd(_this.getIndexArr(),_this.getCurValue());
			        if(_this.cascade){
				        var tempPosArr = _this.getIndexArr();
				        tempPosArr[index] = _this.getIndex(_this.curDistance[index]);
			        	_this.checkRange(index, tempPosArr);
			        }
	    			break;

	    		case "mousemove":
			        event.preventDefault();
			        if(_this.clickStatus){
				        _this.moveY = event.clientY;
				        _this.offset = _this.moveY - _this.oldMoveY;
				        _this.updateCurDistance(theSlider, index);
				        _this.curDistance[index] = _this.curDistance[index] + _this.offset;
				        _this.movePosition(theSlider, _this.curDistance[index]);
				        _this.oldMoveY = _this.moveY;
			        }
	    			break;
	    	}
	    },

	    singleClick: function(theLi, index, sliderIndex){
	    	var _this = this;
	        if(_this.cascade){
		        var tempPosArr = _this.getIndexArr();
		        tempPosArr[sliderIndex] = index;
	        	_this.checkRange(sliderIndex, tempPosArr);

	        }else{
		        _this.curDistance[sliderIndex] = (2-index)*_this.liHeight;
		        _this.movePosition(theLi.parentNode, _this.curDistance[sliderIndex]);
	        }
	    }

	};

	if (typeof exports == "object") {
		module.exports = MobileSelect;
	} else if (typeof define == "function" && define.amd) {
		define([], function () {
			return MobileSelect;
		})
	} else {
		window.MobileSelect = MobileSelect;
	}
})();


;/**import from `/resource/js/lib/qrcode.js` **/
/**
 * @fileoverview
 * - Using the 'QRCode for Javascript library'
 * - Fixed dataset of 'QRCode for Javascript library' for support full-spec.
 * - this library has no dependencies.
 * 
 * @author davidshimjs
 * @see <a href="http://www.d-project.com/" target="_blank">http://www.d-project.com/</a>
 * @see <a href="http://jeromeetienne.github.com/jquery-qrcode/" target="_blank">http://jeromeetienne.github.com/jquery-qrcode/</a>
 */
var QRCode;

(function () {
	//---------------------------------------------------------------------
	// QRCode for JavaScript
	//
	// Copyright (c) 2009 Kazuhiko Arase
	//
	// URL: http://www.d-project.com/
	//
	// Licensed under the MIT license:
	//   http://www.opensource.org/licenses/mit-license.php
	//
	// The word "QR Code" is registered trademark of 
	// DENSO WAVE INCORPORATED
	//   http://www.denso-wave.com/qrcode/faqpatent-e.html
	//
	//---------------------------------------------------------------------
	function QR8bitByte(data) {
		this.mode = QRMode.MODE_8BIT_BYTE;
		this.data = data;
		this.parsedData = [];

		// Added to support UTF-8 Characters
		for (var i = 0, l = this.data.length; i < l; i++) {
			var byteArray = [];
			var code = this.data.charCodeAt(i);

			if (code > 0x10000) {
				byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
				byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
				byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
				byteArray[3] = 0x80 | (code & 0x3F);
			} else if (code > 0x800) {
				byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
				byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
				byteArray[2] = 0x80 | (code & 0x3F);
			} else if (code > 0x80) {
				byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
				byteArray[1] = 0x80 | (code & 0x3F);
			} else {
				byteArray[0] = code;
			}

			this.parsedData.push(byteArray);
		}

		this.parsedData = Array.prototype.concat.apply([], this.parsedData);

		if (this.parsedData.length != this.data.length) {
			this.parsedData.unshift(191);
			this.parsedData.unshift(187);
			this.parsedData.unshift(239);
		}
	}

	QR8bitByte.prototype = {
		getLength: function (buffer) {
			return this.parsedData.length;
		},
		write: function (buffer) {
			for (var i = 0, l = this.parsedData.length; i < l; i++) {
				buffer.put(this.parsedData[i], 8);
			}
		}
	};

	function QRCodeModel(typeNumber, errorCorrectLevel) {
		this.typeNumber = typeNumber;
		this.errorCorrectLevel = errorCorrectLevel;
		this.modules = null;
		this.moduleCount = 0;
		this.dataCache = null;
		this.dataList = [];
	}

	QRCodeModel.prototype={addData:function(data){var newData=new QR8bitByte(data);this.dataList.push(newData);this.dataCache=null;},isDark:function(row,col){if(row<0||this.moduleCount<=row||col<0||this.moduleCount<=col){throw new Error(row+","+col);}
	return this.modules[row][col];},getModuleCount:function(){return this.moduleCount;},make:function(){this.makeImpl(false,this.getBestMaskPattern());},makeImpl:function(test,maskPattern){this.moduleCount=this.typeNumber*4+17;this.modules=new Array(this.moduleCount);for(var row=0;row<this.moduleCount;row++){this.modules[row]=new Array(this.moduleCount);for(var col=0;col<this.moduleCount;col++){this.modules[row][col]=null;}}
	this.setupPositionProbePattern(0,0);this.setupPositionProbePattern(this.moduleCount-7,0);this.setupPositionProbePattern(0,this.moduleCount-7);this.setupPositionAdjustPattern();this.setupTimingPattern();this.setupTypeInfo(test,maskPattern);if(this.typeNumber>=7){this.setupTypeNumber(test);}
	if(this.dataCache==null){this.dataCache=QRCodeModel.createData(this.typeNumber,this.errorCorrectLevel,this.dataList);}
	this.mapData(this.dataCache,maskPattern);},setupPositionProbePattern:function(row,col){for(var r=-1;r<=7;r++){if(row+r<=-1||this.moduleCount<=row+r)continue;for(var c=-1;c<=7;c++){if(col+c<=-1||this.moduleCount<=col+c)continue;if((0<=r&&r<=6&&(c==0||c==6))||(0<=c&&c<=6&&(r==0||r==6))||(2<=r&&r<=4&&2<=c&&c<=4)){this.modules[row+r][col+c]=true;}else{this.modules[row+r][col+c]=false;}}}},getBestMaskPattern:function(){var minLostPoint=0;var pattern=0;for(var i=0;i<8;i++){this.makeImpl(true,i);var lostPoint=QRUtil.getLostPoint(this);if(i==0||minLostPoint>lostPoint){minLostPoint=lostPoint;pattern=i;}}
	return pattern;},createMovieClip:function(target_mc,instance_name,depth){var qr_mc=target_mc.createEmptyMovieClip(instance_name,depth);var cs=1;this.make();for(var row=0;row<this.modules.length;row++){var y=row*cs;for(var col=0;col<this.modules[row].length;col++){var x=col*cs;var dark=this.modules[row][col];if(dark){qr_mc.beginFill(0,100);qr_mc.moveTo(x,y);qr_mc.lineTo(x+cs,y);qr_mc.lineTo(x+cs,y+cs);qr_mc.lineTo(x,y+cs);qr_mc.endFill();}}}
	return qr_mc;},setupTimingPattern:function(){for(var r=8;r<this.moduleCount-8;r++){if(this.modules[r][6]!=null){continue;}
	this.modules[r][6]=(r%2==0);}
	for(var c=8;c<this.moduleCount-8;c++){if(this.modules[6][c]!=null){continue;}
	this.modules[6][c]=(c%2==0);}},setupPositionAdjustPattern:function(){var pos=QRUtil.getPatternPosition(this.typeNumber);for(var i=0;i<pos.length;i++){for(var j=0;j<pos.length;j++){var row=pos[i];var col=pos[j];if(this.modules[row][col]!=null){continue;}
	for(var r=-2;r<=2;r++){for(var c=-2;c<=2;c++){if(r==-2||r==2||c==-2||c==2||(r==0&&c==0)){this.modules[row+r][col+c]=true;}else{this.modules[row+r][col+c]=false;}}}}}},setupTypeNumber:function(test){var bits=QRUtil.getBCHTypeNumber(this.typeNumber);for(var i=0;i<18;i++){var mod=(!test&&((bits>>i)&1)==1);this.modules[Math.floor(i/3)][i%3+this.moduleCount-8-3]=mod;}
	for(var i=0;i<18;i++){var mod=(!test&&((bits>>i)&1)==1);this.modules[i%3+this.moduleCount-8-3][Math.floor(i/3)]=mod;}},setupTypeInfo:function(test,maskPattern){var data=(this.errorCorrectLevel<<3)|maskPattern;var bits=QRUtil.getBCHTypeInfo(data);for(var i=0;i<15;i++){var mod=(!test&&((bits>>i)&1)==1);if(i<6){this.modules[i][8]=mod;}else if(i<8){this.modules[i+1][8]=mod;}else{this.modules[this.moduleCount-15+i][8]=mod;}}
	for(var i=0;i<15;i++){var mod=(!test&&((bits>>i)&1)==1);if(i<8){this.modules[8][this.moduleCount-i-1]=mod;}else if(i<9){this.modules[8][15-i-1+1]=mod;}else{this.modules[8][15-i-1]=mod;}}
	this.modules[this.moduleCount-8][8]=(!test);},mapData:function(data,maskPattern){var inc=-1;var row=this.moduleCount-1;var bitIndex=7;var byteIndex=0;for(var col=this.moduleCount-1;col>0;col-=2){if(col==6)col--;while(true){for(var c=0;c<2;c++){if(this.modules[row][col-c]==null){var dark=false;if(byteIndex<data.length){dark=(((data[byteIndex]>>>bitIndex)&1)==1);}
	var mask=QRUtil.getMask(maskPattern,row,col-c);if(mask){dark=!dark;}
	this.modules[row][col-c]=dark;bitIndex--;if(bitIndex==-1){byteIndex++;bitIndex=7;}}}
	row+=inc;if(row<0||this.moduleCount<=row){row-=inc;inc=-inc;break;}}}}};QRCodeModel.PAD0=0xEC;QRCodeModel.PAD1=0x11;QRCodeModel.createData=function(typeNumber,errorCorrectLevel,dataList){var rsBlocks=QRRSBlock.getRSBlocks(typeNumber,errorCorrectLevel);var buffer=new QRBitBuffer();for(var i=0;i<dataList.length;i++){var data=dataList[i];buffer.put(data.mode,4);buffer.put(data.getLength(),QRUtil.getLengthInBits(data.mode,typeNumber));data.write(buffer);}
	var totalDataCount=0;for(var i=0;i<rsBlocks.length;i++){totalDataCount+=rsBlocks[i].dataCount;}
	if(buffer.getLengthInBits()>totalDataCount*8){throw new Error("code length overflow. ("
	+buffer.getLengthInBits()
	+">"
	+totalDataCount*8
	+")");}
	if(buffer.getLengthInBits()+4<=totalDataCount*8){buffer.put(0,4);}
	while(buffer.getLengthInBits()%8!=0){buffer.putBit(false);}
	while(true){if(buffer.getLengthInBits()>=totalDataCount*8){break;}
	buffer.put(QRCodeModel.PAD0,8);if(buffer.getLengthInBits()>=totalDataCount*8){break;}
	buffer.put(QRCodeModel.PAD1,8);}
	return QRCodeModel.createBytes(buffer,rsBlocks);};QRCodeModel.createBytes=function(buffer,rsBlocks){var offset=0;var maxDcCount=0;var maxEcCount=0;var dcdata=new Array(rsBlocks.length);var ecdata=new Array(rsBlocks.length);for(var r=0;r<rsBlocks.length;r++){var dcCount=rsBlocks[r].dataCount;var ecCount=rsBlocks[r].totalCount-dcCount;maxDcCount=Math.max(maxDcCount,dcCount);maxEcCount=Math.max(maxEcCount,ecCount);dcdata[r]=new Array(dcCount);for(var i=0;i<dcdata[r].length;i++){dcdata[r][i]=0xff&buffer.buffer[i+offset];}
	offset+=dcCount;var rsPoly=QRUtil.getErrorCorrectPolynomial(ecCount);var rawPoly=new QRPolynomial(dcdata[r],rsPoly.getLength()-1);var modPoly=rawPoly.mod(rsPoly);ecdata[r]=new Array(rsPoly.getLength()-1);for(var i=0;i<ecdata[r].length;i++){var modIndex=i+modPoly.getLength()-ecdata[r].length;ecdata[r][i]=(modIndex>=0)?modPoly.get(modIndex):0;}}
	var totalCodeCount=0;for(var i=0;i<rsBlocks.length;i++){totalCodeCount+=rsBlocks[i].totalCount;}
	var data=new Array(totalCodeCount);var index=0;for(var i=0;i<maxDcCount;i++){for(var r=0;r<rsBlocks.length;r++){if(i<dcdata[r].length){data[index++]=dcdata[r][i];}}}
	for(var i=0;i<maxEcCount;i++){for(var r=0;r<rsBlocks.length;r++){if(i<ecdata[r].length){data[index++]=ecdata[r][i];}}}
	return data;};var QRMode={MODE_NUMBER:1<<0,MODE_ALPHA_NUM:1<<1,MODE_8BIT_BYTE:1<<2,MODE_KANJI:1<<3};var QRErrorCorrectLevel={L:1,M:0,Q:3,H:2};var QRMaskPattern={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};var QRUtil={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:(1<<10)|(1<<8)|(1<<5)|(1<<4)|(1<<2)|(1<<1)|(1<<0),G18:(1<<12)|(1<<11)|(1<<10)|(1<<9)|(1<<8)|(1<<5)|(1<<2)|(1<<0),G15_MASK:(1<<14)|(1<<12)|(1<<10)|(1<<4)|(1<<1),getBCHTypeInfo:function(data){var d=data<<10;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)>=0){d^=(QRUtil.G15<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)));}
	return((data<<10)|d)^QRUtil.G15_MASK;},getBCHTypeNumber:function(data){var d=data<<12;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)>=0){d^=(QRUtil.G18<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)));}
	return(data<<12)|d;},getBCHDigit:function(data){var digit=0;while(data!=0){digit++;data>>>=1;}
	return digit;},getPatternPosition:function(typeNumber){return QRUtil.PATTERN_POSITION_TABLE[typeNumber-1];},getMask:function(maskPattern,i,j){switch(maskPattern){case QRMaskPattern.PATTERN000:return(i+j)%2==0;case QRMaskPattern.PATTERN001:return i%2==0;case QRMaskPattern.PATTERN010:return j%3==0;case QRMaskPattern.PATTERN011:return(i+j)%3==0;case QRMaskPattern.PATTERN100:return(Math.floor(i/2)+Math.floor(j/3))%2==0;case QRMaskPattern.PATTERN101:return(i*j)%2+(i*j)%3==0;case QRMaskPattern.PATTERN110:return((i*j)%2+(i*j)%3)%2==0;case QRMaskPattern.PATTERN111:return((i*j)%3+(i+j)%2)%2==0;default:throw new Error("bad maskPattern:"+maskPattern);}},getErrorCorrectPolynomial:function(errorCorrectLength){var a=new QRPolynomial([1],0);for(var i=0;i<errorCorrectLength;i++){a=a.multiply(new QRPolynomial([1,QRMath.gexp(i)],0));}
	return a;},getLengthInBits:function(mode,type){if(1<=type&&type<10){switch(mode){case QRMode.MODE_NUMBER:return 10;case QRMode.MODE_ALPHA_NUM:return 9;case QRMode.MODE_8BIT_BYTE:return 8;case QRMode.MODE_KANJI:return 8;default:throw new Error("mode:"+mode);}}else if(type<27){switch(mode){case QRMode.MODE_NUMBER:return 12;case QRMode.MODE_ALPHA_NUM:return 11;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 10;default:throw new Error("mode:"+mode);}}else if(type<41){switch(mode){case QRMode.MODE_NUMBER:return 14;case QRMode.MODE_ALPHA_NUM:return 13;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 12;default:throw new Error("mode:"+mode);}}else{throw new Error("type:"+type);}},getLostPoint:function(qrCode){var moduleCount=qrCode.getModuleCount();var lostPoint=0;for(var row=0;row<moduleCount;row++){for(var col=0;col<moduleCount;col++){var sameCount=0;var dark=qrCode.isDark(row,col);for(var r=-1;r<=1;r++){if(row+r<0||moduleCount<=row+r){continue;}
	for(var c=-1;c<=1;c++){if(col+c<0||moduleCount<=col+c){continue;}
	if(r==0&&c==0){continue;}
	if(dark==qrCode.isDark(row+r,col+c)){sameCount++;}}}
	if(sameCount>5){lostPoint+=(3+sameCount-5);}}}
	for(var row=0;row<moduleCount-1;row++){for(var col=0;col<moduleCount-1;col++){var count=0;if(qrCode.isDark(row,col))count++;if(qrCode.isDark(row+1,col))count++;if(qrCode.isDark(row,col+1))count++;if(qrCode.isDark(row+1,col+1))count++;if(count==0||count==4){lostPoint+=3;}}}
	for(var row=0;row<moduleCount;row++){for(var col=0;col<moduleCount-6;col++){if(qrCode.isDark(row,col)&&!qrCode.isDark(row,col+1)&&qrCode.isDark(row,col+2)&&qrCode.isDark(row,col+3)&&qrCode.isDark(row,col+4)&&!qrCode.isDark(row,col+5)&&qrCode.isDark(row,col+6)){lostPoint+=40;}}}
	for(var col=0;col<moduleCount;col++){for(var row=0;row<moduleCount-6;row++){if(qrCode.isDark(row,col)&&!qrCode.isDark(row+1,col)&&qrCode.isDark(row+2,col)&&qrCode.isDark(row+3,col)&&qrCode.isDark(row+4,col)&&!qrCode.isDark(row+5,col)&&qrCode.isDark(row+6,col)){lostPoint+=40;}}}
	var darkCount=0;for(var col=0;col<moduleCount;col++){for(var row=0;row<moduleCount;row++){if(qrCode.isDark(row,col)){darkCount++;}}}
	var ratio=Math.abs(100*darkCount/moduleCount/moduleCount-50)/5;lostPoint+=ratio*10;return lostPoint;}};var QRMath={glog:function(n){if(n<1){throw new Error("glog("+n+")");}
	return QRMath.LOG_TABLE[n];},gexp:function(n){while(n<0){n+=255;}
	while(n>=256){n-=255;}
	return QRMath.EXP_TABLE[n];},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)};for(var i=0;i<8;i++){QRMath.EXP_TABLE[i]=1<<i;}
	for(var i=8;i<256;i++){QRMath.EXP_TABLE[i]=QRMath.EXP_TABLE[i-4]^QRMath.EXP_TABLE[i-5]^QRMath.EXP_TABLE[i-6]^QRMath.EXP_TABLE[i-8];}
	for(var i=0;i<255;i++){QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]]=i;}
	function QRPolynomial(num,shift){if(num.length==undefined){throw new Error(num.length+"/"+shift);}
	var offset=0;while(offset<num.length&&num[offset]==0){offset++;}
	this.num=new Array(num.length-offset+shift);for(var i=0;i<num.length-offset;i++){this.num[i]=num[i+offset];}}
	QRPolynomial.prototype={get:function(index){return this.num[index];},getLength:function(){return this.num.length;},multiply:function(e){var num=new Array(this.getLength()+e.getLength()-1);for(var i=0;i<this.getLength();i++){for(var j=0;j<e.getLength();j++){num[i+j]^=QRMath.gexp(QRMath.glog(this.get(i))+QRMath.glog(e.get(j)));}}
	return new QRPolynomial(num,0);},mod:function(e){if(this.getLength()-e.getLength()<0){return this;}
	var ratio=QRMath.glog(this.get(0))-QRMath.glog(e.get(0));var num=new Array(this.getLength());for(var i=0;i<this.getLength();i++){num[i]=this.get(i);}
	for(var i=0;i<e.getLength();i++){num[i]^=QRMath.gexp(QRMath.glog(e.get(i))+ratio);}
	return new QRPolynomial(num,0).mod(e);}};function QRRSBlock(totalCount,dataCount){this.totalCount=totalCount;this.dataCount=dataCount;}
	QRRSBlock.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]];QRRSBlock.getRSBlocks=function(typeNumber,errorCorrectLevel){var rsBlock=QRRSBlock.getRsBlockTable(typeNumber,errorCorrectLevel);if(rsBlock==undefined){throw new Error("bad rs block @ typeNumber:"+typeNumber+"/errorCorrectLevel:"+errorCorrectLevel);}
	var length=rsBlock.length/3;var list=[];for(var i=0;i<length;i++){var count=rsBlock[i*3+0];var totalCount=rsBlock[i*3+1];var dataCount=rsBlock[i*3+2];for(var j=0;j<count;j++){list.push(new QRRSBlock(totalCount,dataCount));}}
	return list;};QRRSBlock.getRsBlockTable=function(typeNumber,errorCorrectLevel){switch(errorCorrectLevel){case QRErrorCorrectLevel.L:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+0];case QRErrorCorrectLevel.M:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+1];case QRErrorCorrectLevel.Q:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+2];case QRErrorCorrectLevel.H:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+3];default:return undefined;}};function QRBitBuffer(){this.buffer=[];this.length=0;}
	QRBitBuffer.prototype={get:function(index){var bufIndex=Math.floor(index/8);return((this.buffer[bufIndex]>>>(7-index%8))&1)==1;},put:function(num,length){for(var i=0;i<length;i++){this.putBit(((num>>>(length-i-1))&1)==1);}},getLengthInBits:function(){return this.length;},putBit:function(bit){var bufIndex=Math.floor(this.length/8);if(this.buffer.length<=bufIndex){this.buffer.push(0);}
	if(bit){this.buffer[bufIndex]|=(0x80>>>(this.length%8));}
	this.length++;}};var QRCodeLimitLength=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]];
	
	function _isSupportCanvas() {
		return typeof CanvasRenderingContext2D != "undefined";
	}
	
	// android 2.x doesn't support Data-URI spec
	function _getAndroid() {
		var android = false;
		var sAgent = navigator.userAgent;
		
		if (/android/i.test(sAgent)) { // android
			android = true;
			var aMat = sAgent.toString().match(/android ([0-9]\.[0-9])/i);
			
			if (aMat && aMat[1]) {
				android = parseFloat(aMat[1]);
			}
		}
		
		return android;
	}
	
	var svgDrawer = (function() {

		var Drawing = function (el, htOption) {
			this._el = el;
			this._htOption = htOption;
		};

		Drawing.prototype.draw = function (oQRCode) {
			var _htOption = this._htOption;
			var _el = this._el;
			var nCount = oQRCode.getModuleCount();
			var nWidth = Math.floor(_htOption.width / nCount);
			var nHeight = Math.floor(_htOption.height / nCount);

			this.clear();

			function makeSVG(tag, attrs) {
				var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
				for (var k in attrs)
					if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
				return el;
			}

			var svg = makeSVG("svg" , {'viewBox': '0 0 ' + String(nCount) + " " + String(nCount), 'width': '100%', 'height': '100%', 'fill': _htOption.colorLight});
			svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
			_el.appendChild(svg);

			svg.appendChild(makeSVG("rect", {"fill": _htOption.colorLight, "width": "100%", "height": "100%"}));
			svg.appendChild(makeSVG("rect", {"fill": _htOption.colorDark, "width": "1", "height": "1", "id": "template"}));

			for (var row = 0; row < nCount; row++) {
				for (var col = 0; col < nCount; col++) {
					if (oQRCode.isDark(row, col)) {
						var child = makeSVG("use", {"x": String(col), "y": String(row)});
						child.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#template")
						svg.appendChild(child);
					}
				}
			}
		};
		Drawing.prototype.clear = function () {
			while (this._el.hasChildNodes())
				this._el.removeChild(this._el.lastChild);
		};
		return Drawing;
	})();

	var useSVG = document.documentElement.tagName.toLowerCase() === "svg";

	// Drawing in DOM by using Table tag
	var Drawing = useSVG ? svgDrawer : !_isSupportCanvas() ? (function () {
		var Drawing = function (el, htOption) {
			this._el = el;
			this._htOption = htOption;
		};
			
		/**
		 * Draw the QRCode
		 * 
		 * @param {QRCode} oQRCode
		 */
		Drawing.prototype.draw = function (oQRCode) {
            var _htOption = this._htOption;
            var _el = this._el;
			var nCount = oQRCode.getModuleCount();
			var nWidth = Math.floor(_htOption.width / nCount);
			var nHeight = Math.floor(_htOption.height / nCount);
			var aHTML = ['<table style="border:0;border-collapse:collapse;">'];
			
			for (var row = 0; row < nCount; row++) {
				aHTML.push('<tr>');
				
				for (var col = 0; col < nCount; col++) {
					aHTML.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + nWidth + 'px;height:' + nHeight + 'px;background-color:' + (oQRCode.isDark(row, col) ? _htOption.colorDark : _htOption.colorLight) + ';"></td>');
				}
				
				aHTML.push('</tr>');
			}
			
			aHTML.push('</table>');
			_el.innerHTML = aHTML.join('');
			
			// Fix the margin values as real size.
			var elTable = _el.childNodes[0];
			var nLeftMarginTable = (_htOption.width - elTable.offsetWidth) / 2;
			var nTopMarginTable = (_htOption.height - elTable.offsetHeight) / 2;
			
			if (nLeftMarginTable > 0 && nTopMarginTable > 0) {
				elTable.style.margin = nTopMarginTable + "px " + nLeftMarginTable + "px";	
			}
		};
		
		/**
		 * Clear the QRCode
		 */
		Drawing.prototype.clear = function () {
			this._el.innerHTML = '';
		};
		
		return Drawing;
	})() : (function () { // Drawing in Canvas
		function _onMakeImage() {
			this._elImage.src = this._elCanvas.toDataURL("image/png");
			this._elImage.style.display = "block";
			this._elCanvas.style.display = "none";			
		}
		
		// Android 2.1 bug workaround
		// http://code.google.com/p/android/issues/detail?id=5141
		if (this._android && this._android <= 2.1) {
	    	var factor = 1 / window.devicePixelRatio;
	        var drawImage = CanvasRenderingContext2D.prototype.drawImage; 
	    	CanvasRenderingContext2D.prototype.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
	    		if (("nodeName" in image) && /img/i.test(image.nodeName)) {
		        	for (var i = arguments.length - 1; i >= 1; i--) {
		            	arguments[i] = arguments[i] * factor;
		        	}
	    		} else if (typeof dw == "undefined") {
	    			arguments[1] *= factor;
	    			arguments[2] *= factor;
	    			arguments[3] *= factor;
	    			arguments[4] *= factor;
	    		}
	    		
	        	drawImage.apply(this, arguments); 
	    	};
		}
		
		/**
		 * Check whether the user's browser supports Data URI or not
		 * 
		 * @private
		 * @param {Function} fSuccess Occurs if it supports Data URI
		 * @param {Function} fFail Occurs if it doesn't support Data URI
		 */
		function _safeSetDataURI(fSuccess, fFail) {
            var self = this;
            self._fFail = fFail;
            self._fSuccess = fSuccess;

            // Check it just once
            if (self._bSupportDataURI === null) {
                var el = document.createElement("img");
                var fOnError = function() {
                    self._bSupportDataURI = false;

                    if (self._fFail) {
                        self._fFail.call(self);
                    }
                };
                var fOnSuccess = function() {
                    self._bSupportDataURI = true;

                    if (self._fSuccess) {
                        self._fSuccess.call(self);
                    }
                };

                el.onabort = fOnError;
                el.onerror = fOnError;
                el.onload = fOnSuccess;
                el.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="; // the Image contains 1px data.
                return;
            } else if (self._bSupportDataURI === true && self._fSuccess) {
                self._fSuccess.call(self);
            } else if (self._bSupportDataURI === false && self._fFail) {
                self._fFail.call(self);
            }
		};
		
		/**
		 * Drawing QRCode by using canvas
		 * 
		 * @constructor
		 * @param {HTMLElement} el
		 * @param {Object} htOption QRCode Options 
		 */
		var Drawing = function (el, htOption) {
    		this._bIsPainted = false;
    		this._android = _getAndroid();
		
			this._htOption = htOption;
			this._elCanvas = document.createElement("canvas");
			this._elCanvas.width = htOption.width;
			this._elCanvas.height = htOption.height;
			el.appendChild(this._elCanvas);
			this._el = el;
			this._oContext = this._elCanvas.getContext("2d");
			this._bIsPainted = false;
			this._elImage = document.createElement("img");
			this._elImage.alt = "Scan me!";
			this._elImage.style.display = "none";
			this._el.appendChild(this._elImage);
			this._bSupportDataURI = null;
		};
			
		/**
		 * Draw the QRCode
		 * 
		 * @param {QRCode} oQRCode 
		 */
		Drawing.prototype.draw = function (oQRCode) {
            var _elImage = this._elImage;
            var _oContext = this._oContext;
            var _htOption = this._htOption;
            
			var nCount = oQRCode.getModuleCount();
			var nWidth = _htOption.width / nCount;
			var nHeight = _htOption.height / nCount;
			var nRoundedWidth = Math.round(nWidth);
			var nRoundedHeight = Math.round(nHeight);

			_elImage.style.display = "none";
			this.clear();
			
			for (var row = 0; row < nCount; row++) {
				for (var col = 0; col < nCount; col++) {
					var bIsDark = oQRCode.isDark(row, col);
					var nLeft = col * nWidth;
					var nTop = row * nHeight;
					_oContext.strokeStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
					_oContext.lineWidth = 1;
					_oContext.fillStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;					
					_oContext.fillRect(nLeft, nTop, nWidth, nHeight);
					
					// 안티 앨리어싱 방지 처리
					_oContext.strokeRect(
						Math.floor(nLeft) + 0.5,
						Math.floor(nTop) + 0.5,
						nRoundedWidth,
						nRoundedHeight
					);
					
					_oContext.strokeRect(
						Math.ceil(nLeft) - 0.5,
						Math.ceil(nTop) - 0.5,
						nRoundedWidth,
						nRoundedHeight
					);
				}
			}
			
			this._bIsPainted = true;
		};
			
		/**
		 * Make the image from Canvas if the browser supports Data URI.
		 */
		Drawing.prototype.makeImage = function () {
			if (this._bIsPainted) {
				_safeSetDataURI.call(this, _onMakeImage);
			}
		};
			
		/**
		 * Return whether the QRCode is painted or not
		 * 
		 * @return {Boolean}
		 */
		Drawing.prototype.isPainted = function () {
			return this._bIsPainted;
		};
		
		/**
		 * Clear the QRCode
		 */
		Drawing.prototype.clear = function () {
			this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);
			this._bIsPainted = false;
		};
		
		/**
		 * @private
		 * @param {Number} nNumber
		 */
		Drawing.prototype.round = function (nNumber) {
			if (!nNumber) {
				return nNumber;
			}
			
			return Math.floor(nNumber * 1000) / 1000;
		};
		
		return Drawing;
	})();
	
	/**
	 * Get the type by string length
	 * 
	 * @private
	 * @param {String} sText
	 * @param {Number} nCorrectLevel
	 * @return {Number} type
	 */
	function _getTypeNumber(sText, nCorrectLevel) {			
		var nType = 1;
		var length = _getUTF8Length(sText);
		
		for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
			var nLimit = 0;
			
			switch (nCorrectLevel) {
				case QRErrorCorrectLevel.L :
					nLimit = QRCodeLimitLength[i][0];
					break;
				case QRErrorCorrectLevel.M :
					nLimit = QRCodeLimitLength[i][1];
					break;
				case QRErrorCorrectLevel.Q :
					nLimit = QRCodeLimitLength[i][2];
					break;
				case QRErrorCorrectLevel.H :
					nLimit = QRCodeLimitLength[i][3];
					break;
			}
			
			if (length <= nLimit) {
				break;
			} else {
				nType++;
			}
		}
		
		if (nType > QRCodeLimitLength.length) {
			throw new Error("Too long data");
		}
		
		return nType;
	}

	function _getUTF8Length(sText) {
		var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
		return replacedText.length + (replacedText.length != sText ? 3 : 0);
	}
	
	/**
	 * @class QRCode
	 * @constructor
	 * @example 
	 * new QRCode(document.getElementById("test"), "http://jindo.dev.naver.com/collie");
	 *
	 * @example
	 * var oQRCode = new QRCode("test", {
	 *    text : "http://naver.com",
	 *    width : 128,
	 *    height : 128
	 * });
	 * 
	 * oQRCode.clear(); // Clear the QRCode.
	 * oQRCode.makeCode("http://map.naver.com"); // Re-create the QRCode.
	 *
	 * @param {HTMLElement|String} el target element or 'id' attribute of element.
	 * @param {Object|String} vOption
	 * @param {String} vOption.text QRCode link data
	 * @param {Number} [vOption.width=256]
	 * @param {Number} [vOption.height=256]
	 * @param {String} [vOption.colorDark="#000000"]
	 * @param {String} [vOption.colorLight="#ffffff"]
	 * @param {QRCode.CorrectLevel} [vOption.correctLevel=QRCode.CorrectLevel.H] [L|M|Q|H] 
	 */
	QRCode = function (el, vOption) {
		this._htOption = {
			width : 256, 
			height : 256,
			typeNumber : 4,
			colorDark : "#000000",
			colorLight : "#ffffff",
			correctLevel : QRErrorCorrectLevel.H
		};
		
		if (typeof vOption === 'string') {
			vOption	= {
				text : vOption
			};
		}
		
		// Overwrites options
		if (vOption) {
			for (var i in vOption) {
				this._htOption[i] = vOption[i];
			}
		}
		
		if (typeof el == "string") {
			el = document.getElementById(el);
		}

		if (this._htOption.useSVG) {
			Drawing = svgDrawer;
		}
		
		this._android = _getAndroid();
		this._el = el;
		this._oQRCode = null;
		this._oDrawing = new Drawing(this._el, this._htOption);
		
		if (this._htOption.text) {
			this.makeCode(this._htOption.text);	
		}
	};
	
	/**
	 * Make the QRCode
	 * 
	 * @param {String} sText link data
	 */
	QRCode.prototype.makeCode = function (sText) {
		this._oQRCode = new QRCodeModel(_getTypeNumber(sText, this._htOption.correctLevel), this._htOption.correctLevel);
		this._oQRCode.addData(sText);
		this._oQRCode.make();
		this._el.title = sText;
		this._oDrawing.draw(this._oQRCode);			
		this.makeImage();
	};
	
	/**
	 * Make the Image from Canvas element
	 * - It occurs automatically
	 * - Android below 3 doesn't support Data-URI spec.
	 * 
	 * @private
	 */
	QRCode.prototype.makeImage = function () {
		if (typeof this._oDrawing.makeImage == "function" && (!this._android || this._android >= 3)) {
			this._oDrawing.makeImage();
		}
	};
	
	/**
	 * Clear the QRCode
	 */
	QRCode.prototype.clear = function () {
		this._oDrawing.clear();
	};
	
	/**
	 * @name QRCode.CorrectLevel
	 */
	QRCode.CorrectLevel = QRErrorCorrectLevel;
})();


;/**import from `/resource/js/mobile/union/login.js` **/
// 优品联盟登录页
$(function () {
    if (window.__PAGE != 'login') {
        return
    }
    var
        $LoginForm = $('#loginForm'),
        $BtnGetCode = $LoginForm.find('.btn-get-sms-code'),
        $BtnVcodeImg = $LoginForm.find('.vcode-img')

    var from_flag = $.queryUrl(window.location.href)['from_flag']
    if(from_flag == 'register_succ'){
        $.dialog.toast('注册成功，请登录')
    }

    // 登录
    $LoginForm.on('submit', function (e) {
        e.preventDefault();
        // var destUrl = "{%$destUrl%}";
        var destUrl = $.queryUrl(window.location.search, 'destUrl') || '/union/productList'
        destUrl = decodeURIComponent(destUrl)

        if (!validSubmitForm($LoginForm)) {
            return
        }

        $.post($(this).attr('action'), $(this).serialize(), function (rs) {
            rs = JSON.parse(rs);

            if (rs.errno) {
                $.dialog.alert('抱歉，登录错误。' + rs.errmsg);
            } else {
                $.dialog.toast('登录成功~');
                if(rs.result.bank_info){
                    window.location.href = destUrl
                }else{
                    window.location.href = '/union/userCenter#add-bank-info'
                }
            }
        })
    })

    // 获取短信验证码
    $BtnGetCode.on('click', function (e) {
        e.preventDefault()
        var $me = $(this);

        if ($me.hasClass('waiting')) {
            return;
        }

        if ($BtnVcodeImg.attr('data-out-date')) {
            $BtnVcodeImg.trigger('click')
        }

        if (!validGetSmSCode($LoginForm)) {
            return
        }

        var $mobile = $LoginForm.find('[name="mobile"]'),
            $pic_secode = $LoginForm.find('[name="pic_secode"]'),
            $sms_type = $LoginForm.find('[name="sms_type"]'),

            mobile = $.trim($mobile.val()),
            pic_secode = $.trim($pic_secode.val()),
            sms_type = $.trim($sms_type.val())

        $me.addClass('waiting')

        var params = {
            'mobile': mobile,
            'pic_secode': pic_secode,
            'sms_type': sms_type
        }
        $.post('/aj/doSendSmscode', params, function (rs) {
            try {
                rs = JSON.parse(rs);
                if (rs.errno) {
                    $.dialog.toast(rs.errmsg)

                    $me.removeClass('waiting')

                    $BtnVcodeImg.trigger('click')

                } else {
                    $.dialog.toast('验证码发送成功，请注意查收');

                    $BtnVcodeImg.attr('data-out-date', '1')

                    tcb.distimeAnim(60, function (time) {
                        if (time > 0) {
                            $me.html('等待' + time + '秒');
                        } else {
                            $me.html('获取验证码');
                            $me.removeClass('waiting');
                        }
                    })
                }
            } catch (ex) {
                $me.removeClass('waiting');
                alert("抱歉，数据错误，请稍后再试");
            }
        });
    })

    //刷新图片验证码
    $BtnVcodeImg.on('click', function (e) {
        var src = '/secode/?rands=' + Math.random();
        $BtnVcodeImg.attr('src', src)

        $BtnVcodeImg.attr('data-out-date', '')

        var $pic_secode = $LoginForm.find('[name="pic_secode"]')
        $pic_secode.focus().val('')
    })

    // 验证登录表单
    function validSubmitForm($Form) {
        var
            flag = true

        if (!($Form && $Form.length)) {
            flag = false
        } else {

            var $mobile = $Form.find('[name="mobile"]'),
                $pic_secode = $Form.find('[name="pic_secode"]'),
                $secode = $Form.find('[name="code"]'),

                mobile = $.trim($mobile.val()),
                pic_secode = $.trim($pic_secode.val()),
                secode = $.trim($secode.val())

            var
                $focus_el = null,
                err_msg = ''

            // 验证手机号
            if (!mobile) {
                $.errorAnimate ($mobile)
                $focus_el = $focus_el || $mobile
                err_msg = '手机号码不能为空'
            }
            else if (!tcb.validMobile (mobile)) {
                $.errorAnimate ($mobile)
                $focus_el = $focus_el || $mobile
                err_msg = err_msg ||'手机号码格式错误'
            }

            // 验证图片验证码
            if (!pic_secode) {
                $.errorAnimate ($pic_secode)
                $focus_el = $focus_el || $pic_secode
                err_msg = err_msg || '图片验证码不能为空'
            }

            // 验证短信验证码
            if (!secode) {
                $.errorAnimate ($secode)
                $focus_el = $focus_el || $secode
                err_msg = err_msg || '短信验证码不能为空'
            }

            if (err_msg) {
                flag = false

                setTimeout (function () {
                    $focus_el && $focus_el.focus ()
                }, 500)

                $.dialog.toast (err_msg)
            }
        }

        return flag
    }

    function validGetSmSCode($Form) {
        var $mobile = $Form.find('[name="mobile"]'),
            $pic_secode = $Form.find('[name="pic_secode"]'),

            mobile = $.trim($mobile.val()),
            pic_secode = $.trim($pic_secode.val()),
            $focus_el = null,
            valid_flag = true

        if (!tcb.validMobile(mobile)) {
            $.errorAnimate($mobile)
            $focus_el = $focus_el || $mobile
        }
        if (!pic_secode) {
            $.errorAnimate($pic_secode)
            $focus_el = $focus_el || $pic_secode
        }

        if ($focus_el) {
            valid_flag = false

            setTimeout (function () {
                $focus_el && $focus_el.focus ()
            }, 500)
        }

        return valid_flag
    }
});

;/**import from `/resource/js/mobile/union/fenqi_page.js` **/
;(function () {
    if (window.__PAGE != 'fenqi-page') {
        return
    }
    
    var $price_input = $('.price-input'),
        $payment3 = $('.payment3'),//3期
        $payment6 = $('.payment6'),//6期
        $payment12 = $('.payment12'),//12期
        $pay_amount = $('.pay_amount'),//最低分期总额
        $pay_rate = $('.pay_rate')//手续费

    var _product_weikuan= __productInfo['product_weikuan']//尾款
    var _product_id = __productInfo['product_id']

    function init(){

        if(__productInfo['user_price'] || __productInfo['user_price'].length){
            $price_input.val(__productInfo['user_price']['price'])
            calculatePrice(__productInfo['user_price']['price'],function(res){
                changeRentPhontPrice(res)
            })
        }

        tcb.bindEvent(document.body,{
            '.price-btn':function(e){
                e.preventDefault()

                setProductPrice()
            },
            '.ewm-btn': function(e){
                e.preventDefault()
                var memo = $("#memo").val();
                var query_str = 'userid='+__userInfo['userid']+'&id='+_product_id
                window.location.href = '/union/fenqiQrcode?'+ query_str + "&memo=" + memo
            },
            '.price-input':{
                'blur':function (e) {
                    setProductPrice()
                }
            }
        })
    }
    init()

    function changeRentPhontPrice(price_obj){
        var payment = price_obj.payment,//分期价格数组
            pay_rate = price_obj.pay_rate,//手续费数组
            pay_amount = price_obj.pay_amount//分期总价数组

        $payment3.text(payment[0])
        $payment6.text(payment[1])
        $payment12.text(payment[2])
        $pay_amount.text(pay_amount[0])
        $pay_rate.text(pay_rate[0])

    }

    
    function getProductInfo(product_id, callback) {
        $.get('/union/getProductInfo',{id:product_id},function(res){
            res = JSON.parse(res)
            if(!res.errno){
                typeof callback=='function' && callback(res.result)
            }else{
                $.dialog.toast(res.errmsg, 2000)
            }
        })
    }

    function setProductPrice(){
        //首先提交给服务器 返回成功后 调用计算接口
        var price_input = $price_input.val()
        if(price_input<=0){ $.dialog.toast('请正确设置价格')}
        if(price_input < _product_weikuan){
            $.dialog.toast('价格已远低于成本')
            return
        }
        sendPriceToserver(price_input, function () {
            calculatePrice(price_input,function(res){
                changeRentPhontPrice(res)
                $.dialog.toast('价格设置成功')
            })
        })
    }

    function sendPriceToserver(price,callback){
        var params ={
            price:price,
            product_id:_product_id
        }
        $.post('/union/setUserPrice',params,function (res) {
            res = JSON.parse(res)
            if(!res.errno){
                typeof callback=='function' && callback(res.result)
            }else{
                $.dialog.toast(res.errmsg, 2000)
            }
        })
    }

    function calculatePrice(amount,callback){

        $.post('/union/doGetHuabeiFeeInfo',{amount:amount},function (res) {
            res= JSON.parse(res)
            if(!res.errno){
                typeof callback=='function' && callback(res.result)
            }else{
                $.dialog.toast(res.errmsg, 2000)
            }
        })
    }

})()

;/**import from `/resource/js/mobile/union/product_list.js` **/
;(function () {

    if (window.__PAGE != 'product-list') {
        return
    }

    var $productListWrap = $('.product-wrap')
    var _state = {
        page:1,
        is_loading: false,
        is_nomore: false
    }

    $(window).on('scroll load', function(e){
        if( $(window).scrollTop() + $(window).height() + 200 > $('body')[0].scrollHeight  ){
            getProductList(_state.page,function(res){
                renderProductList(res.data,$productListWrap)
            })
        }
    });

    tcb.bindEvent(document.body,{
        '.btn-show-bug-dialog': function(e){
            e.preventDefault ()

            var $me = $(this)

            var html_fn = $.tmpl (tcb.trim ($ ('#JsMUnionOrderConfirmShipTpl').html ())),
                html_st = html_fn ({
                    order_id : $me.attr('data-order-id') || ''
                })

            var dialogInst = tcb.showDialog(html_st, {
                className : 'dialog-order-confirm-ship',
                middle : true
            })

            bindFormConfirmShipSubmit(dialogInst['wrap'].find('form'))
        }
    })

    function bindFormConfirmShipSubmit($Form){
        if (!($Form && $Form.length)) {
            return tcb.error ('$Form不能少')
        }

        $Form.on ('submit', function (e) {
            e.preventDefault ()

            var $me = $ (this)
            if (!validFormConfirmShip ($me)) {
                return
            }

            $.ajax ({
                type     : $me.attr ('method'),
                url      : $me.attr ('action'),
                data     : $me.serialize (),
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {
                    if (res[ 'errno' ]) {
                        return $.dialog.toast (res[ 'errmsg' ], 2000)
                    }

                    window.location.href = window.location.href
                },
                error    : function (err) {
                    $.dialog.toast (err, 2000)
                }
            })
        })
    }

    function validFormConfirmShip ($Form) {
        var flag = true,
            $focus = null

        var $imei = $Form.find ('[name="imei"]'),
            $customphone = $Form.find ('[name="customphone"]'),
            $price = $Form.find ('[name="price"]')

        if (!tcb.trim ($imei.val ())) {
            flag = false
            $focus = $focus || $imei
            $imei.shine4Error ()
        }
        if (!tcb.validMobile (tcb.trim ($customphone.val ()))) {
            flag = false
            $focus = $focus || $customphone
            $customphone.shine4Error ()
        }
        if ($price && $price.length && !tcb.trim ($price.val ())) {
            flag = false
            $focus = $focus || $price
            $price.shine4Error ()
        }

        if ($focus && $focus.length) {
            setTimeout (function () {
                $focus.focus ()
            }, 300)
        }

        return flag
    }

    function getProductList(page,callback){
        if(_state.is_loading || _state.is_nomore) { return }
        _state.is_loading = true
        doShowLoading()
        $.get('/union/getProductList',{page:page},function (res) {
            res = JSON.parse(res)
            if(!res.errno){
                if(res.result.last_page <= _state.page){
                    _state.is_nomore = true
                    doShowNomore()
                }
                typeof callback && callback(res.result)
                _state.page++
                _state.is_loading = false
                // removeLoading()
            }else{
                $.dialog.toast(res.errmsg,2000)
            }
        })
    }
    function renderProductList(source_data, $target){
        var html_fn = $.tmpl($.trim($('#JsProductItem').html()))
        var html_str = html_fn({
            list: source_data
        })
        $target.append(html_str)
    }

    //显示加载ing的html
    function doShowLoading($target) {
        var
            $Loading = $('#ProductLoading')

        if ($Loading && $Loading.length){

            return
        }
        var
            img_html = '<img class="product-loading-img" src="data:image/gif;base64,R0lGODlhIAAgALMAAP///7Ozs/v7+9bW1uHh4fLy8rq6uoGBgTQ0NAEBARsbG8TExJeXl/39/VRUVAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFBQAAACwAAAAAIAAgAAAE5xDISSlLrOrNp0pKNRCdFhxVolJLEJQUoSgOpSYT4RowNSsvyW1icA16k8MMMRkCBjskBTFDAZyuAEkqCfxIQ2hgQRFvAQEEIjNxVDW6XNE4YagRjuBCwe60smQUDnd4Rz1ZAQZnFAGDd0hihh12CEE9kjAEVlycXIg7BAsMB6SlnJ87paqbSKiKoqusnbMdmDC2tXQlkUhziYtyWTxIfy6BE8WJt5YEvpJivxNaGmLHT0VnOgGYf0dZXS7APdpB309RnHOG5gDqXGLDaC457D1zZ/V/nmOM82XiHQjYKhKP1oZmADdEAAAh+QQFBQAAACwAAAAAGAAXAAAEchDISasKNeuJFKoHs4mUYlJIkmjIV54Soypsa0wmLSnqoTEtBw52mG0AjhYpBxioEqRNy8V0qFzNw+GGwlJki4lBqx1IBgjMkRIghwjrzcDti2/Gh7D9qN774wQGAYOEfwCChIV/gYmDho+QkZKTR3p7EQAh+QQFBQAAACwBAAAAHQAOAAAEchDISWdANesNHHJZwE2DUSEo5SjKKB2HOKGYFLD1CB/DnEoIlkti2PlyuKGEATMBaAACSyGbEDYD4zN1YIEmh0SCQQgYehNmTNNaKsQJXmBuuEYPi9ECAU/UFnNzeUp9VBQEBoFOLmFxWHNoQw6RWEocEQAh+QQFBQAAACwHAAAAGQARAAAEaRDICdZZNOvNDsvfBhBDdpwZgohBgE3nQaki0AYEjEqOGmqDlkEnAzBUjhrA0CoBYhLVSkm4SaAAWkahCFAWTU0A4RxzFWJnzXFWJJWb9pTihRu5dvghl+/7NQmBggo/fYKHCX8AiAmEEQAh+QQFBQAAACwOAAAAEgAYAAAEZXCwAaq9ODAMDOUAI17McYDhWA3mCYpb1RooXBktmsbt944BU6zCQCBQiwPB4jAihiCK86irTB20qvWp7Xq/FYV4TNWNz4oqWoEIgL0HX/eQSLi69boCikTkE2VVDAp5d1p0CW4RACH5BAUFAAAALA4AAAASAB4AAASAkBgCqr3YBIMXvkEIMsxXhcFFpiZqBaTXisBClibgAnd+ijYGq2I4HAamwXBgNHJ8BEbzgPNNjz7LwpnFDLvgLGJMdnw/5DRCrHaE3xbKm6FQwOt1xDnpwCvcJgcJMgEIeCYOCQlrF4YmBIoJVV2CCXZvCooHbwGRcAiKcmFUJhEAIfkEBQUAAAAsDwABABEAHwAABHsQyAkGoRivELInnOFlBjeM1BCiFBdcbMUtKQdTN0CUJru5NJQrYMh5VIFTTKJcOj2HqJQRhEqvqGuU+uw6AwgEwxkOO55lxIihoDjKY8pBoThPxmpAYi+hKzoeewkTdHkZghMIdCOIhIuHfBMOjxiNLR4KCW1ODAlxSxEAIfkEBQUAAAAsCAAOABgAEgAABGwQyEkrCDgbYvvMoOF5ILaNaIoGKroch9hacD3MFMHUBzMHiBtgwJMBFolDB4GoGGBCACKRcAAUWAmzOWJQExysQsJgWj0KqvKalTiYPhp1LBFTtp10Is6mT5gdVFx1bRN8FTsVCAqDOB9+KhEAIfkEBQUAAAAsAgASAB0ADgAABHgQyEmrBePS4bQdQZBdR5IcHmWEgUFQgWKaKbWwwSIhc4LonsXhBSCsQoOSScGQDJiWwOHQnAxWBIYJNXEoFCiEWDI9jCzESey7GwMM5doEwW4jJoypQQ743u1WcTV0CgFzbhJ5XClfHYd/EwZnHoYVDgiOfHKQNREAIfkEBQUAAAAsAAAPABkAEQAABGeQqUQruDjrW3vaYCZ5X2ie6EkcKaooTAsi7ytnTq046BBsNcTvItz4AotMwKZBIC6H6CVAJaCcT0CUBTgaTg5nTCu9GKiDEMPJg5YBBOpwlnVzLwtqyKnZagZWahoMB2M3GgsHSRsRACH5BAUFAAAALAEACAARABgAAARcMKR0gL34npkUyyCAcAmyhBijkGi2UW02VHFt33iu7yiDIDaD4/erEYGDlu/nuBAOJ9Dvc2EcDgFAYIuaXS3bbOh6MIC5IAP5Eh5fk2exC4tpgwZyiyFgvhEMBBEAIfkEBQUAAAAsAAACAA4AHQAABHMQyAnYoViSlFDGXBJ808Ep5KRwV8qEg+pRCOeoioKMwJK0Ekcu54h9AoghKgXIMZgAApQZcCCu2Ax2O6NUud2pmJcyHA4L0uDM/ljYDCnGfGakJQE5YH0wUBYBAUYfBIFkHwaBgxkDgX5lgXpHAXcpBIsRADs=">'
            ,loading_html = '<div class="product-loading" id="ProductLoading">'+img_html+'<span class="product-loading-txt">加载中...</span></div>'

        $target = $target || $('body')

        $target.append(loading_html)
    }

    // 移除商品加载ing的html
    function removeLoading(){
        var
            $Loading = $('#ProductLoading')

        if ($Loading && $Loading.length){

            $Loading.remove()
        }
    }


    function doShowNomore($target) {
        var
            $Loading = $('#ProductLoading')
        $Loading.html('没有更多商品了...')
    }

})()

;/**import from `/resource/js/mobile/union/rent_page.js` **/
;(function () {

    if (window.__PAGE != 'rent-page') {
        return
    }

    var
        $price_input = $('.price-input'),
        $total_zu_mount = $('.total-zu-mount'),//总租金
        $day_fee = $('.day-fee'),//日租金
        $qi_fee = $('.qi-fee'),//期租金
        $price_set_wrap = $('.price-set-wrap'),
        $qrcode=$('.qrcode')

    var _product_weikuan= __productInfo['product_weikuan']//尾款
    var _product_id = __productInfo['product_id']

    function init(){
        if(__productInfo['user_price'] || __productInfo['user_price'].length){
            $price_input.val(__productInfo['user_price']['price'])
            calculatePrice(__productInfo['user_price']['price'],function(res){
                changeRentPhontPrice(res)
            })
        }

        tcb.bindEvent(document.body,{
            '.price-btn':function(e){
                e.preventDefault()
                setProductPrice()
            },
            '.ewm-btn': function(e){
                e.preventDefault()
                var memo = $("#memo").val();
                var qr_url = 'http://bang.360.cn/union/buy?userid='+__userInfo['userid']+'&id='+_product_id+'&type=1&memo='+encodeURIComponent(memo)
                makeQrcode(qr_url)

                $(this).hide()
                $price_set_wrap.hide()
                $('.qrcode-wrap').show()
            },
            '.price-input':{
                'blur':function (e) {
                    setProductPrice()
                }
            }
        })
    }
    init()

    function changeRentPhontPrice(price_obj){
        var period_amount = price_obj.period_amount,//每期租金
            period_count = price_obj.period_count,//租期
            total_amount = price_obj.total_rent //总价
        $total_zu_mount .text(total_amount)
        $day_fee.text((period_amount/25).toFixed(2))
        $qi_fee.text(period_amount)
    }

    function makeQrcode(value){
        return new QRCode(document.getElementById("qrcode"), {
            text: value,
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    }
    
    function getProductInfo(product_id, callback) {
        $.get('/union/getProductInfo',{id:product_id},function(res){
            res = JSON.parse(res)
            if(!res.errno){
                typeof callback=='function' && callback(res.result)
            }else{
                $.dialog.toast(res.errmsg, 2000)
            }
        })
    }

    function setProductPrice(){
        //首先提交给服务器 返回成功后 调用计算接口
        var price_input = $price_input.val()
        if(price_input<=0){ $.dialog.toast('请正确设置价格')}
        if(price_input < _product_weikuan){
            $.dialog.toast('价格不可小于押金')
            return
        }
        sendPriceToserver(price_input, function () {
            calculatePrice(price_input,function(res){
                changeRentPhontPrice(res)
                $.dialog.toast('价格设置成功')
            })
        })
    }

    function sendPriceToserver(price,callback){
        var params ={
            price:price,
            product_id:_product_id
        }
        $.post('/union/setUserPrice',params,function (res) {
            res = JSON.parse(res)
            if(!res.errno){
                typeof callback=='function' && callback(res.result)
            }else{
                $.dialog.toast(res.errmsg, 2000)
            }
        })
    }

    function calculatePrice(amount,callback){
        var params={
            amount:amount,
            weikuan:_product_weikuan,
            pid:_product_id,
        }
        $.post('/union/doGetLebaifenFeeInfo',params,function (res) {
            res= JSON.parse(res)
            if(!res.errno){
                typeof callback=='function' && callback(res.result)
            }else{
                $.dialog.toast(res.errmsg, 2000)
            }
        })
    }

})()

;/**import from `/resource/js/mobile/union/user_center.js` **/
// 用户中心
!function () {
    if (window.__PAGE != 'user-center') {
        return
    }

    $ (function () {
        var swipeSection = window.Bang.SwipeSection

        function init(){
            bindEvent ();
        }

        function bindEvent () {
            var $win = tcb.getWin ()

            $win.on ('hashchange load', function (e) {
                var pureHash = tcb.getPureHash ()

                if (pureHash == 'add-bank-info') {
                    showAddBankInfoPanel ()
                } else {
                    swipeSection.backLeftSwipeSection ()
                }
            })

            tcb.bindEvent({
                '.row-fragment-tab .tab-item': function(e){
                    e.preventDefault ()

                    var $me = $ (this)
                    if ($me.hasClass ('selected')) {
                        return
                    }

                    $me.addClass ('selected').siblings ('.selected').removeClass ('selected')

                    var formId = $me.attr('data-for')

                    $('#'+formId).show().siblings('form').hide()
                }
            })


        }

        function showAddBankInfoPanel () {
            var $swipe = swipeSection.getSwipeSection ('.section-add-bank-info')

            var html_fn = $.tmpl (tcb.trim ($ ('#JsMUnionAddBankInfoPanelTpl').html ())),
                html_st = html_fn ()

            $swipe.find ('.swipe-section-inner').html (html_st)

            swipeSection.doLeftSwipeSection (0, function () {})

            bindFormEvent ($swipe.find ('form'))
        }

        function bindFormEvent ($Form) {
            if (!($Form && $Form.length)) {
                return tcb.error ('$Form不能少')
            }

            $Form.on ('submit', function (e) {
                e.preventDefault ()

                var $me = $ (this),
                    id = $me.attr ('id')

                if (id == 'FormForAlipay' && !validFormAlipay ($me)) {
                    return
                } else if (id == 'FormForBank' && !validFormBank ($me)) {
                    return
                }

                $.ajax ({
                    type     : $me.attr ('method'),
                    url      : $me.attr ('action'),
                    data     : $me.serialize (),
                    dataType : 'json',
                    timeout  : 5000,
                    success  : function (res) {
                        if (res[ 'errno' ]) {
                            return $.dialog.toast (res[ 'errmsg' ], 2000)
                        }

                        // window.history.go (-1)
                        setTimeout (function () {
                            window.location.href = '/union/userCenter'
                        }, 600)
                    },
                    error    : function (err) {
                        $.dialog.toast (err, 2000)
                    }
                })
            })

            var $triggerBank = $Form.find('.btn-trigger-select-bank'),
                $triggerProvinceCity = $Form.find('.btn-trigger-select-province-city')

            initSelectBank($triggerBank, $Form)
            initSelectProvinceCity($triggerProvinceCity, $Form)
        }

        function initSelectBank($trigger, $Form){
            var pickerData =[
                { id : 1, name : '招商银行' },
                { id : 2, name : '中国工商银行' },
                { id : 3, name : '中国建设银行' },
                { id : 4, name : '中国农业银行' },
                { id : 5, name : '中国银行' },
                { id : 6, name : '交通银行' },
                { id : 7, name : '中国民生银行' },
                { id : 8, name : '平安银行' },
                { id : 9, name : '中信银行' },
                { id : 10, name : '华夏银行' },
                { id : 11, name : '兴业银行' },
                { id : 12, name : '中国邮政储蓄银行' },
                { id : 13, name : '中国光大银行' },
                { id : 14, name : '上海银行' },
                { id : 15, name : '北京银行' },
                { id : 16, name : '渤海银行' },
                { id : 17, name : '宁波银行' }
            ]
            Bang.Picker({
                // 实例化的时候自动执行init函数
                flagAutoInit     : true,
                // 触发器
                selectorTrigger  : $trigger,

                col: 1,
                data: [pickerData],
                dataPos: [0],

                // 回调函数(确认/取消)
                callbackConfirm : function(inst){
                    var data = inst.options.data || [],
                        dataPos = inst.options.dataPos || [],
                        selectedData = data[ 0 ][ dataPos[ 0 ] ]

                    $trigger.html(selectedData.name)
                    $Form.find('[name="bank_name"]').val(selectedData.name)
                },
                callbackCancel  : null
            })
        }

        function initSelectProvinceCity ($trigger, $Form) {
            var $province = $Form.find ('[name="bank_province"]'),
                $city = $Form.find ('[name="bank_city"]'),
                options = {
                    // 实例化的时候自动执行init函数
                    flagAutoInit     : true,
                    selectorTrigger  : $trigger,
                    province         : $province.html(),
                    city             : $city.html(),
                    area             : '',
                    show_area        : false,
                    callback_cancel  : null,
                    callback_confirm : function (region) {
                        region = region || {}

                        var province_city = []
                        region[ 'province' ] && province_city.push (region[ 'province' ])
                        region[ 'city' ] && province_city.push (region[ 'city' ])

                        $trigger.html(province_city.join(' '))
                        $province.val (province_city[0])
                        $city.val (province_city[1])
                    }
                }

            // 初始化省/市/区县选择器
            Bang.AddressSelect (options)
        }

        function validFormAlipay($Form){
            var flag = true,
                $focus = null

            var $bank_user_name = $Form.find('[name="bank_user_name"]'),
                $bank_user_number = $Form.find('[name="bank_user_number"]')

            if (!tcb.trim($bank_user_name.val())){
                flag = false
                $focus = $focus || $bank_user_name
                $bank_user_name.shine4Error()
            }
            if (!tcb.trim($bank_user_number.val())){
                flag = false
                $focus = $focus || $bank_user_number
                $bank_user_number.shine4Error()
            }

            if ($focus && $focus.length){
                setTimeout(function(){
                    $focus.focus()
                }, 300)
            }

            return flag
        }
        function validFormBank($Form){
            var flag = true,
                $focus = null

            var $bank_user_name = $Form.find('[name="bank_user_name"]'),
                $bank_user_number = $Form.find('[name="bank_user_number"]'),
                $bank_name = $Form.find('[name="bank_name"]'),
                $bank_name_trigger = $Form.find('.btn-trigger-select-bank'),
                $bank_province = $Form.find('[name="bank_province"]'),
                $bank_city = $Form.find('[name="bank_city"]'),
                $bank_province_city_trigger = $Form.find('.btn-trigger-select-province-city')

            if (!tcb.trim($bank_user_name.val())){
                flag = false
                $focus = $focus || $bank_user_name
                $bank_user_name.shine4Error()
            }
            if (!tcb.trim($bank_user_number.val())){
                flag = false
                $focus = $focus || $bank_user_number
                $bank_user_number.shine4Error()
            }
            if (!tcb.trim($bank_name.val())){
                flag = false
                $focus = $focus || $bank_name_trigger
                $bank_name_trigger.shine4Error()
            }
            if (!(tcb.trim($bank_province.val())&&tcb.trim($bank_city.val()))){
                flag = false
                $focus = $focus || $bank_province_city_trigger
                $bank_province_city_trigger.shine4Error()
            }

            if ($focus && $focus.length){
                setTimeout(function(){
                    $focus.focus()
                }, 300)
            }

            return flag
        }

        init()

    })
} ()

;/**import from `/resource/js/mobile/union/register.js` **/
//地区Map
;(function(){
    var R = tcb.getRoot()
    R.CITY_DATA = [
        {"name":"北京市", "sub":[
            {"name":"北京市", "sub":[
                {"name":"东城区"},
                {"name":"西城区"},
                {"name":"朝阳区"},
                {"name":"丰台区"},
                {"name":"石景山区"},
                {"name":"海淀区"},
                {"name":"门头沟区"},
                {"name":"房山区"},
                {"name":"通州区"},
                {"name":"顺义区"},
                {"name":"昌平区"},
                {"name":"大兴区"},
                {"name":"怀柔区"},
                {"name":"平谷区"},
                {"name":"密云县"},
                {"name":"延庆县"}
            ]}
        ]},
        {"name":"天津市", "sub":[
            {"name":"天津市", "sub":[
                {"name":"和平区"},
                {"name":"河东区"},
                {"name":"河西区"},
                {"name":"南开区"},
                {"name":"河北区"},
                {"name":"红桥区"},
                {"name":"东丽区"},
                {"name":"西青区"},
                {"name":"津南区"},
                {"name":"北辰区"},
                {"name":"武清区"},
                {"name":"宝坻区"},
                {"name":"滨海新区"},
                {"name":"宁河县"},
                {"name":"静海县"},
                {"name":"蓟县"}
            ]}
        ]},
        {"name":"河北省", "sub":[
            {"name":"石家庄市", "sub":[
                {"name":"长安区"},
                {"name":"桥东区"},
                {"name":"桥西区"},
                {"name":"新华区"},
                {"name":"井陉矿区"},
                {"name":"裕华区"},
                {"name":"井陉县"},
                {"name":"正定县"},
                {"name":"栾城县"},
                {"name":"行唐县"},
                {"name":"灵寿县"},
                {"name":"高邑县"},
                {"name":"深泽县"},
                {"name":"赞皇县"},
                {"name":"无极县"},
                {"name":"平山县"},
                {"name":"元氏县"},
                {"name":"赵县"},
                {"name":"辛集市"},
                {"name":"藁城市"},
                {"name":"晋州市"},
                {"name":"新乐市"},
                {"name":"鹿泉市"}
            ]},
            {"name":"唐山市", "sub":[
                {"name":"路南区"},
                {"name":"路北区"},
                {"name":"古冶区"},
                {"name":"开平区"},
                {"name":"丰南区"},
                {"name":"丰润区"},
                {"name":"滦县"},
                {"name":"滦南县"},
                {"name":"乐亭县"},
                {"name":"迁西县"},
                {"name":"玉田县"},
                {"name":"唐海县"},
                {"name":"遵化市"},
                {"name":"迁安市"}
            ]},
            {"name":"秦皇岛市", "sub":[
                {"name":"海港区"},
                {"name":"山海关区"},
                {"name":"北戴河区"},
                {"name":"青龙满族自治县"},
                {"name":"昌黎县"},
                {"name":"抚宁县"},
                {"name":"卢龙县"}
            ]},
            {"name":"邯郸市", "sub":[
                {"name":"邯山区"},
                {"name":"丛台区"},
                {"name":"复兴区"},
                {"name":"峰峰矿区"},
                {"name":"邯郸县"},
                {"name":"临漳县"},
                {"name":"成安县"},
                {"name":"大名县"},
                {"name":"涉县"},
                {"name":"磁县"},
                {"name":"肥乡县"},
                {"name":"永年县"},
                {"name":"邱县"},
                {"name":"鸡泽县"},
                {"name":"广平县"},
                {"name":"馆陶县"},
                {"name":"魏县"},
                {"name":"曲周县"},
                {"name":"武安市"}
            ]},
            {"name":"邢台市", "sub":[
                {"name":"桥东区"},
                {"name":"桥西区"},
                {"name":"邢台县"},
                {"name":"临城县"},
                {"name":"内丘县"},
                {"name":"柏乡县"},
                {"name":"隆尧县"},
                {"name":"任县"},
                {"name":"南和县"},
                {"name":"宁晋县"},
                {"name":"巨鹿县"},
                {"name":"新河县"},
                {"name":"广宗县"},
                {"name":"平乡县"},
                {"name":"威县"},
                {"name":"清河县"},
                {"name":"临西县"},
                {"name":"南宫市"},
                {"name":"沙河市"}
            ]},
            {"name":"保定市", "sub":[
                {"name":"新市区"},
                {"name":"北市区"},
                {"name":"南市区"},
                {"name":"满城县"},
                {"name":"清苑县"},
                {"name":"涞水县"},
                {"name":"阜平县"},
                {"name":"徐水县"},
                {"name":"定兴县"},
                {"name":"唐县"},
                {"name":"高阳县"},
                {"name":"容城县"},
                {"name":"涞源县"},
                {"name":"望都县"},
                {"name":"安新县"},
                {"name":"易县"},
                {"name":"曲阳县"},
                {"name":"蠡县"},
                {"name":"顺平县"},
                {"name":"博野县"},
                {"name":"雄县"},
                {"name":"涿州市"},
                {"name":"定州市"},
                {"name":"安国市"},
                {"name":"高碑店市"}
            ]},
            {"name":"张家口市", "sub":[
                {"name":"桥东区"},
                {"name":"桥西区"},
                {"name":"宣化区"},
                {"name":"下花园区"},
                {"name":"宣化县"},
                {"name":"张北县"},
                {"name":"康保县"},
                {"name":"沽源县"},
                {"name":"尚义县"},
                {"name":"蔚县"},
                {"name":"阳原县"},
                {"name":"怀安县"},
                {"name":"万全县"},
                {"name":"怀来县"},
                {"name":"涿鹿县"},
                {"name":"赤城县"},
                {"name":"崇礼县"}
            ]},
            {"name":"承德市", "sub":[
                {"name":"双桥区"},
                {"name":"双滦区"},
                {"name":"鹰手营子矿区"},
                {"name":"承德县"},
                {"name":"兴隆县"},
                {"name":"平泉县"},
                {"name":"滦平县"},
                {"name":"隆化县"},
                {"name":"丰宁满族自治县"},
                {"name":"宽城满族自治县"},
                {"name":"围场满族蒙古族自治县"}
            ]},
            {"name":"沧州市", "sub":[
                {"name":"新华区"},
                {"name":"运河区"},
                {"name":"沧县"},
                {"name":"青县"},
                {"name":"东光县"},
                {"name":"海兴县"},
                {"name":"盐山县"},
                {"name":"肃宁县"},
                {"name":"南皮县"},
                {"name":"吴桥县"},
                {"name":"献县"},
                {"name":"孟村回族自治县"},
                {"name":"泊头市"},
                {"name":"任丘市"},
                {"name":"黄骅市"},
                {"name":"河间市"}
            ]},
            {"name":"廊坊市", "sub":[
                {"name":"安次区"},
                {"name":"广阳区"},
                {"name":"固安县"},
                {"name":"永清县"},
                {"name":"香河县"},
                {"name":"大城县"},
                {"name":"文安县"},
                {"name":"大厂回族自治县"},
                {"name":"霸州市"},
                {"name":"三河市"}
            ]},
            {"name":"衡水市", "sub":[
                {"name":"桃城区"},
                {"name":"枣强县"},
                {"name":"武邑县"},
                {"name":"武强县"},
                {"name":"饶阳县"},
                {"name":"安平县"},
                {"name":"故城县"},
                {"name":"景县"},
                {"name":"阜城县"},
                {"name":"冀州市"},
                {"name":"深州市"}
            ]}
        ]},
        {"name":"山西省", "sub":[
            {"name":"太原市", "sub":[
                {"name":"小店区"},
                {"name":"迎泽区"},
                {"name":"杏花岭区"},
                {"name":"尖草坪区"},
                {"name":"万柏林区"},
                {"name":"晋源区"},
                {"name":"清徐县"},
                {"name":"阳曲县"},
                {"name":"娄烦县"},
                {"name":"古交市"}
            ]},
            {"name":"大同市", "sub":[
                {"name":"城区"},
                {"name":"矿区"},
                {"name":"南郊区"},
                {"name":"新荣区"},
                {"name":"阳高县"},
                {"name":"天镇县"},
                {"name":"广灵县"},
                {"name":"灵丘县"},
                {"name":"浑源县"},
                {"name":"左云县"},
                {"name":"大同县"}
            ]},
            {"name":"阳泉市", "sub":[
                {"name":"城区"},
                {"name":"矿区"},
                {"name":"郊区"},
                {"name":"平定县"},
                {"name":"盂县"}
            ]},
            {"name":"长治市", "sub":[
                {"name":"城区"},
                {"name":"郊区"},
                {"name":"长治县"},
                {"name":"襄垣县"},
                {"name":"屯留县"},
                {"name":"平顺县"},
                {"name":"黎城县"},
                {"name":"壶关县"},
                {"name":"长子县"},
                {"name":"武乡县"},
                {"name":"沁县"},
                {"name":"沁源县"},
                {"name":"潞城市"}
            ]},
            {"name":"晋城市", "sub":[
                {"name":"城区"},
                {"name":"沁水县"},
                {"name":"阳城县"},
                {"name":"陵川县"},
                {"name":"泽州县"},
                {"name":"高平市"}
            ]},
            {"name":"朔州市", "sub":[
                {"name":"朔城区"},
                {"name":"平鲁区"},
                {"name":"山阴县"},
                {"name":"应县"},
                {"name":"右玉县"},
                {"name":"怀仁县"}
            ]},
            {"name":"晋中市", "sub":[
                {"name":"榆次区"},
                {"name":"榆社县"},
                {"name":"左权县"},
                {"name":"和顺县"},
                {"name":"昔阳县"},
                {"name":"寿阳县"},
                {"name":"太谷县"},
                {"name":"祁县"},
                {"name":"平遥县"},
                {"name":"灵石县"},
                {"name":"介休市"}
            ]},
            {"name":"运城市", "sub":[
                {"name":"盐湖区"},
                {"name":"临猗县"},
                {"name":"万荣县"},
                {"name":"闻喜县"},
                {"name":"稷山县"},
                {"name":"新绛县"},
                {"name":"绛县"},
                {"name":"垣曲县"},
                {"name":"夏县"},
                {"name":"平陆县"},
                {"name":"芮城县"},
                {"name":"永济市"},
                {"name":"河津市"}
            ]},
            {"name":"忻州市", "sub":[
                {"name":"忻府区"},
                {"name":"定襄县"},
                {"name":"五台县"},
                {"name":"代县"},
                {"name":"繁峙县"},
                {"name":"宁武县"},
                {"name":"静乐县"},
                {"name":"神池县"},
                {"name":"五寨县"},
                {"name":"岢岚县"},
                {"name":"河曲县"},
                {"name":"保德县"},
                {"name":"偏关县"},
                {"name":"原平市"}
            ]},
            {"name":"临汾市", "sub":[
                {"name":"尧都区"},
                {"name":"曲沃县"},
                {"name":"翼城县"},
                {"name":"襄汾县"},
                {"name":"洪洞县"},
                {"name":"古县"},
                {"name":"安泽县"},
                {"name":"浮山县"},
                {"name":"吉县"},
                {"name":"乡宁县"},
                {"name":"大宁县"},
                {"name":"隰县"},
                {"name":"永和县"},
                {"name":"蒲县"},
                {"name":"汾西县"},
                {"name":"侯马市"},
                {"name":"霍州市"}
            ]},
            {"name":"吕梁市", "sub":[
                {"name":"离石区"},
                {"name":"文水县"},
                {"name":"交城县"},
                {"name":"兴县"},
                {"name":"临县"},
                {"name":"柳林县"},
                {"name":"石楼县"},
                {"name":"岚县"},
                {"name":"方山县"},
                {"name":"中阳县"},
                {"name":"交口县"},
                {"name":"孝义市"},
                {"name":"汾阳市"}
            ]}
        ]},
        {"name":"内蒙古自治区", "sub":[
            {"name":"呼和浩特市", "sub":[
                {"name":"新城区"},
                {"name":"回民区"},
                {"name":"玉泉区"},
                {"name":"赛罕区"},
                {"name":"土默特左旗"},
                {"name":"托克托县"},
                {"name":"和林格尔县"},
                {"name":"清水河县"},
                {"name":"武川县"}
            ]},
            {"name":"包头市", "sub":[
                {"name":"东河区"},
                {"name":"昆都仑区"},
                {"name":"青山区"},
                {"name":"石拐区"},
                {"name":"白云鄂博矿区"},
                {"name":"九原区"},
                {"name":"土默特右旗"},
                {"name":"固阳县"},
                {"name":"达尔罕茂明安联合旗"}
            ]},
            {"name":"乌海市", "sub":[
                {"name":"海勃湾区"},
                {"name":"海南区"},
                {"name":"乌达区"}
            ]},
            {"name":"赤峰市", "sub":[
                {"name":"红山区"},
                {"name":"元宝山区"},
                {"name":"松山区"},
                {"name":"阿鲁科尔沁旗"},
                {"name":"巴林左旗"},
                {"name":"巴林右旗"},
                {"name":"林西县"},
                {"name":"克什克腾旗"},
                {"name":"翁牛特旗"},
                {"name":"喀喇沁旗"},
                {"name":"宁城县"},
                {"name":"敖汉旗"}
            ]},
            {"name":"通辽市", "sub":[
                {"name":"科尔沁区"},
                {"name":"科尔沁左翼中旗"},
                {"name":"科尔沁左翼后旗"},
                {"name":"开鲁县"},
                {"name":"库伦旗"},
                {"name":"奈曼旗"},
                {"name":"扎鲁特旗"},
                {"name":"霍林郭勒市"}
            ]},
            {"name":"鄂尔多斯市", "sub":[
                {"name":"东胜区"},
                {"name":"达拉特旗"},
                {"name":"准格尔旗"},
                {"name":"鄂托克前旗"},
                {"name":"鄂托克旗"},
                {"name":"杭锦旗"},
                {"name":"乌审旗"},
                {"name":"伊金霍洛旗"}
            ]},
            {"name":"呼伦贝尔市", "sub":[
                {"name":"海拉尔区"},
                {"name":"阿荣旗"},
                {"name":"莫力达瓦达斡尔族自治旗"},
                {"name":"鄂伦春自治旗"},
                {"name":"鄂温克族自治旗"},
                {"name":"陈巴尔虎旗"},
                {"name":"新巴尔虎左旗"},
                {"name":"新巴尔虎右旗"},
                {"name":"满洲里市"},
                {"name":"牙克石市"},
                {"name":"扎兰屯市"},
                {"name":"额尔古纳市"},
                {"name":"根河市"}
            ]},
            {"name":"巴彦淖尔市", "sub":[
                {"name":"临河区"},
                {"name":"五原县"},
                {"name":"磴口县"},
                {"name":"乌拉特前旗"},
                {"name":"乌拉特中旗"},
                {"name":"乌拉特后旗"},
                {"name":"杭锦后旗"}
            ]},
            {"name":"乌兰察布市", "sub":[
                {"name":"集宁区"},
                {"name":"卓资县"},
                {"name":"化德县"},
                {"name":"商都县"},
                {"name":"兴和县"},
                {"name":"凉城县"},
                {"name":"察哈尔右翼前旗"},
                {"name":"察哈尔右翼中旗"},
                {"name":"察哈尔右翼后旗"},
                {"name":"四子王旗"},
                {"name":"丰镇市"}
            ]},
            {"name":"兴安盟", "sub":[
                {"name":"乌兰浩特市"},
                {"name":"阿尔山市"},
                {"name":"科尔沁右翼前旗"},
                {"name":"科尔沁右翼中旗"},
                {"name":"扎赉特旗"},
                {"name":"突泉县"}
            ]},
            {"name":"锡林郭勒盟", "sub":[
                {"name":"二连浩特市"},
                {"name":"锡林浩特市"},
                {"name":"阿巴嘎旗"},
                {"name":"苏尼特左旗"},
                {"name":"苏尼特右旗"},
                {"name":"东乌珠穆沁旗"},
                {"name":"西乌珠穆沁旗"},
                {"name":"太仆寺旗"},
                {"name":"镶黄旗"},
                {"name":"正镶白旗"},
                {"name":"正蓝旗"},
                {"name":"多伦县"}
            ]},
            {"name":"阿拉善盟", "sub":[
                {"name":"阿拉善左旗"},
                {"name":"阿拉善右旗"},
                {"name":"额济纳旗"}
            ]}
        ]},
        {"name":"辽宁省", "sub":[
            {"name":"沈阳市", "sub":[
                {"name":"和平区"},
                {"name":"沈河区"},
                {"name":"大东区"},
                {"name":"皇姑区"},
                {"name":"铁西区"},
                {"name":"苏家屯区"},
                {"name":"东陵区"},
                {"name":"沈北新区"},
                {"name":"于洪区"},
                {"name":"辽中县"},
                {"name":"康平县"},
                {"name":"法库县"},
                {"name":"新民市"}
            ]},
            {"name":"大连市", "sub":[
                {"name":"中山区"},
                {"name":"西岗区"},
                {"name":"沙河口区"},
                {"name":"甘井子区"},
                {"name":"旅顺口区"},
                {"name":"金州区"},
                {"name":"长海县"},
                {"name":"瓦房店市"},
                {"name":"普兰店市"},
                {"name":"庄河市"}
            ]},
            {"name":"鞍山市", "sub":[
                {"name":"铁东区"},
                {"name":"铁西区"},
                {"name":"立山区"},
                {"name":"千山区"},
                {"name":"台安县"},
                {"name":"岫岩满族自治县"},
                {"name":"海城市"}
            ]},
            {"name":"抚顺市", "sub":[
                {"name":"新抚区"},
                {"name":"东洲区"},
                {"name":"望花区"},
                {"name":"顺城区"},
                {"name":"抚顺县"},
                {"name":"新宾满族自治县"},
                {"name":"清原满族自治县"}
            ]},
            {"name":"本溪市", "sub":[
                {"name":"平山区"},
                {"name":"溪湖区"},
                {"name":"明山区"},
                {"name":"南芬区"},
                {"name":"本溪满族自治县"},
                {"name":"桓仁满族自治县"}
            ]},
            {"name":"丹东市", "sub":[
                {"name":"元宝区"},
                {"name":"振兴区"},
                {"name":"振安区"},
                {"name":"宽甸满族自治县"},
                {"name":"东港市"},
                {"name":"凤城市"}
            ]},
            {"name":"锦州市", "sub":[
                {"name":"古塔区"},
                {"name":"凌河区"},
                {"name":"太和区"},
                {"name":"黑山县"},
                {"name":"义县"},
                {"name":"凌海市"},
                {"name":"北镇市"}
            ]},
            {"name":"营口市", "sub":[
                {"name":"站前区"},
                {"name":"西市区"},
                {"name":"鲅鱼圈区"},
                {"name":"老边区"},
                {"name":"盖州市"},
                {"name":"大石桥市"}
            ]},
            {"name":"阜新市", "sub":[
                {"name":"海州区"},
                {"name":"新邱区"},
                {"name":"太平区"},
                {"name":"清河门区"},
                {"name":"细河区"},
                {"name":"阜新蒙古族自治县"},
                {"name":"彰武县"}
            ]},
            {"name":"辽阳市", "sub":[
                {"name":"白塔区"},
                {"name":"文圣区"},
                {"name":"宏伟区"},
                {"name":"弓长岭区"},
                {"name":"太子河区"},
                {"name":"辽阳县"},
                {"name":"灯塔市"}
            ]},
            {"name":"盘锦市", "sub":[
                {"name":"双台子区"},
                {"name":"兴隆台区"},
                {"name":"大洼县"},
                {"name":"盘山县"}
            ]},
            {"name":"铁岭市", "sub":[
                {"name":"银州区"},
                {"name":"清河区"},
                {"name":"铁岭县"},
                {"name":"西丰县"},
                {"name":"昌图县"},
                {"name":"调兵山市"},
                {"name":"开原市"}
            ]},
            {"name":"朝阳市", "sub":[
                {"name":"双塔区"},
                {"name":"龙城区"},
                {"name":"朝阳县"},
                {"name":"建平县"},
                {"name":"喀喇沁左翼蒙古族自治县"},
                {"name":"北票市"},
                {"name":"凌源市"}
            ]},
            {"name":"葫芦岛市", "sub":[
                {"name":"连山区"},
                {"name":"龙港区"},
                {"name":"南票区"},
                {"name":"绥中县"},
                {"name":"建昌县"},
                {"name":"兴城市"}
            ]}
        ]},
        {"name":"吉林省", "sub":[
            {"name":"长春市", "sub":[
                {"name":"南关区"},
                {"name":"宽城区"},
                {"name":"朝阳区"},
                {"name":"二道区"},
                {"name":"绿园区"},
                {"name":"双阳区"},
                {"name":"农安县"},
                {"name":"九台市"},
                {"name":"榆树市"},
                {"name":"德惠市"}
            ]},
            {"name":"吉林市", "sub":[
                {"name":"昌邑区"},
                {"name":"龙潭区"},
                {"name":"船营区"},
                {"name":"丰满区"},
                {"name":"永吉县"},
                {"name":"蛟河市"},
                {"name":"桦甸市"},
                {"name":"舒兰市"},
                {"name":"磐石市"}
            ]},
            {"name":"四平市", "sub":[
                {"name":"铁西区"},
                {"name":"铁东区"},
                {"name":"梨树县"},
                {"name":"伊通满族自治县"},
                {"name":"公主岭市"},
                {"name":"双辽市"}
            ]},
            {"name":"辽源市", "sub":[
                {"name":"龙山区"},
                {"name":"西安区"},
                {"name":"东丰县"},
                {"name":"东辽县"}
            ]},
            {"name":"通化市", "sub":[
                {"name":"东昌区"},
                {"name":"二道江区"},
                {"name":"通化县"},
                {"name":"辉南县"},
                {"name":"柳河县"},
                {"name":"梅河口市"},
                {"name":"集安市"}
            ]},
            {"name":"白山市", "sub":[
                {"name":"八道江区"},
                {"name":"江源区"},
                {"name":"抚松县"},
                {"name":"靖宇县"},
                {"name":"长白朝鲜族自治县"},
                {"name":"临江市"}
            ]},
            {"name":"松原市", "sub":[
                {"name":"宁江区"},
                {"name":"前郭尔罗斯蒙古族自治县"},
                {"name":"长岭县"},
                {"name":"乾安县"},
                {"name":"扶余县"}
            ]},
            {"name":"白城市", "sub":[
                {"name":"洮北区"},
                {"name":"镇赉县"},
                {"name":"通榆县"},
                {"name":"洮南市"},
                {"name":"大安市"}
            ]},
            {"name":"延边朝鲜族自治州", "sub":[
                {"name":"延吉市"},
                {"name":"图们市"},
                {"name":"敦化市"},
                {"name":"珲春市"},
                {"name":"龙井市"},
                {"name":"和龙市"},
                {"name":"汪清县"},
                {"name":"安图县"}
            ]}
        ]},
        {"name":"黑龙江省", "sub":[
            {"name":"哈尔滨市", "sub":[
                {"name":"道里区"},
                {"name":"南岗区"},
                {"name":"道外区"},
                {"name":"平房区"},
                {"name":"松北区"},
                {"name":"香坊区"},
                {"name":"呼兰区"},
                {"name":"阿城区"},
                {"name":"依兰县"},
                {"name":"方正县"},
                {"name":"宾县"},
                {"name":"巴彦县"},
                {"name":"木兰县"},
                {"name":"通河县"},
                {"name":"延寿县"},
                {"name":"双城市"},
                {"name":"尚志市"},
                {"name":"五常市"}
            ]},
            {"name":"齐齐哈尔市", "sub":[
                {"name":"龙沙区"},
                {"name":"建华区"},
                {"name":"铁锋区"},
                {"name":"昂昂溪区"},
                {"name":"富拉尔基区"},
                {"name":"碾子山区"},
                {"name":"梅里斯达斡尔族区"},
                {"name":"龙江县"},
                {"name":"依安县"},
                {"name":"泰来县"},
                {"name":"甘南县"},
                {"name":"富裕县"},
                {"name":"克山县"},
                {"name":"克东县"},
                {"name":"拜泉县"},
                {"name":"讷河市"}
            ]},
            {"name":"鸡西市", "sub":[
                {"name":"鸡冠区"},
                {"name":"恒山区"},
                {"name":"滴道区"},
                {"name":"梨树区"},
                {"name":"城子河区"},
                {"name":"麻山区"},
                {"name":"鸡东县"},
                {"name":"虎林市"},
                {"name":"密山市"}
            ]},
            {"name":"鹤岗市", "sub":[
                {"name":"向阳区"},
                {"name":"工农区"},
                {"name":"南山区"},
                {"name":"兴安区"},
                {"name":"东山区"},
                {"name":"兴山区"},
                {"name":"萝北县"},
                {"name":"绥滨县"}
            ]},
            {"name":"双鸭山市", "sub":[
                {"name":"尖山区"},
                {"name":"岭东区"},
                {"name":"四方台区"},
                {"name":"宝山区"},
                {"name":"集贤县"},
                {"name":"友谊县"},
                {"name":"宝清县"},
                {"name":"饶河县"}
            ]},
            {"name":"大庆市", "sub":[
                {"name":"萨尔图区"},
                {"name":"龙凤区"},
                {"name":"让胡路区"},
                {"name":"红岗区"},
                {"name":"大同区"},
                {"name":"肇州县"},
                {"name":"肇源县"},
                {"name":"林甸县"},
                {"name":"杜尔伯特蒙古族自治县"}
            ]},
            {"name":"伊春市", "sub":[
                {"name":"伊春区"},
                {"name":"南岔区"},
                {"name":"友好区"},
                {"name":"西林区"},
                {"name":"翠峦区"},
                {"name":"新青区"},
                {"name":"美溪区"},
                {"name":"金山屯区"},
                {"name":"五营区"},
                {"name":"乌马河区"},
                {"name":"汤旺河区"},
                {"name":"带岭区"},
                {"name":"乌伊岭区"},
                {"name":"红星区"},
                {"name":"上甘岭区"},
                {"name":"嘉荫县"},
                {"name":"铁力市"}
            ]},
            {"name":"佳木斯市", "sub":[
                {"name":"向阳区"},
                {"name":"前进区"},
                {"name":"东风区"},
                {"name":"郊区"},
                {"name":"桦南县"},
                {"name":"桦川县"},
                {"name":"汤原县"},
                {"name":"抚远县"},
                {"name":"同江市"},
                {"name":"富锦市"}
            ]},
            {"name":"七台河市", "sub":[
                {"name":"新兴区"},
                {"name":"桃山区"},
                {"name":"茄子河区"},
                {"name":"勃利县"}
            ]},
            {"name":"牡丹江市", "sub":[
                {"name":"东安区"},
                {"name":"阳明区"},
                {"name":"爱民区"},
                {"name":"西安区"},
                {"name":"东宁县"},
                {"name":"林口县"},
                {"name":"绥芬河市"},
                {"name":"海林市"},
                {"name":"宁安市"},
                {"name":"穆棱市"}
            ]},
            {"name":"黑河市", "sub":[
                {"name":"爱辉区"},
                {"name":"嫩江县"},
                {"name":"逊克县"},
                {"name":"孙吴县"},
                {"name":"北安市"},
                {"name":"五大连池市"}
            ]},
            {"name":"绥化市", "sub":[
                {"name":"北林区"},
                {"name":"望奎县"},
                {"name":"兰西县"},
                {"name":"青冈县"},
                {"name":"庆安县"},
                {"name":"明水县"},
                {"name":"绥棱县"},
                {"name":"安达市"},
                {"name":"肇东市"},
                {"name":"海伦市"}
            ]},
            {"name":"大兴安岭地区", "sub":[
                {"name":"加格达奇区"},
                {"name":"松岭区"},
                {"name":"新林区"},
                {"name":"呼中区"},
                {"name":"呼玛县"},
                {"name":"塔河县"},
                {"name":"漠河县"}
            ]}
        ]},
        {"name":"上海市", "sub":[
            {"name":"上海市", "sub":[
                {"name":"黄浦区"},
                {"name":"卢湾区"},
                {"name":"徐汇区"},
                {"name":"长宁区"},
                {"name":"静安区"},
                {"name":"普陀区"},
                {"name":"闸北区"},
                {"name":"虹口区"},
                {"name":"杨浦区"},
                {"name":"闵行区"},
                {"name":"宝山区"},
                {"name":"嘉定区"},
                {"name":"浦东新区"},
                {"name":"金山区"},
                {"name":"松江区"},
                {"name":"青浦区"},
                {"name":"奉贤区"},
                {"name":"崇明区"}
            ]}
        ]},
        {"name":"江苏省", "sub":[
            {"name":"南京市", "sub":[
                {"name":"玄武区"},
                {"name":"白下区"},
                {"name":"秦淮区"},
                {"name":"建邺区"},
                {"name":"鼓楼区"},
                {"name":"下关区"},
                {"name":"浦口区"},
                {"name":"栖霞区"},
                {"name":"雨花台区"},
                {"name":"江宁区"},
                {"name":"六合区"},
                {"name":"溧水县"},
                {"name":"高淳县"}
            ]},
            {"name":"无锡市", "sub":[
                {"name":"崇安区"},
                {"name":"南长区"},
                {"name":"北塘区"},
                {"name":"锡山区"},
                {"name":"惠山区"},
                {"name":"滨湖区"},
                {"name":"江阴市"},
                {"name":"宜兴市"}
            ]},
            {"name":"徐州市", "sub":[
                {"name":"鼓楼区"},
                {"name":"云龙区"},
                {"name":"贾汪区"},
                {"name":"泉山区"},
                {"name":"铜山区"},
                {"name":"丰县"},
                {"name":"沛县"},
                {"name":"睢宁县"},
                {"name":"新沂市"},
                {"name":"邳州市"}
            ]},
            {"name":"常州市", "sub":[
                {"name":"天宁区"},
                {"name":"钟楼区"},
                {"name":"戚墅堰区"},
                {"name":"新北区"},
                {"name":"武进区"},
                {"name":"溧阳市"},
                {"name":"金坛市"}
            ]},
            {"name":"苏州市", "sub":[
                {"name":"沧浪区"},
                {"name":"平江区"},
                {"name":"金阊区"},
                {"name":"虎丘区"},
                {"name":"吴中区"},
                {"name":"相城区"},
                {"name":"常熟市"},
                {"name":"张家港市"},
                {"name":"昆山市"},
                {"name":"吴江市"},
                {"name":"太仓市"}
            ]},
            {"name":"南通市", "sub":[
                {"name":"崇川区"},
                {"name":"港闸区"},
                {"name":"通州区"},
                {"name":"海安县"},
                {"name":"如东县"},
                {"name":"启东市"},
                {"name":"如皋市"},
                {"name":"海门市"}
            ]},
            {"name":"连云港市", "sub":[
                {"name":"连云区"},
                {"name":"新浦区"},
                {"name":"海州区"},
                {"name":"赣榆县"},
                {"name":"东海县"},
                {"name":"灌云县"},
                {"name":"灌南县"}
            ]},
            {"name":"淮安市", "sub":[
                {"name":"清河区"},
                {"name":"楚州区"},
                {"name":"淮阴区"},
                {"name":"清浦区"},
                {"name":"涟水县"},
                {"name":"洪泽县"},
                {"name":"盱眙县"},
                {"name":"金湖县"}
            ]},
            {"name":"盐城市", "sub":[
                {"name":"亭湖区"},
                {"name":"盐都区"},
                {"name":"响水县"},
                {"name":"滨海县"},
                {"name":"阜宁县"},
                {"name":"射阳县"},
                {"name":"建湖县"},
                {"name":"东台市"},
                {"name":"大丰市"}
            ]},
            {"name":"扬州市", "sub":[
                {"name":"广陵区"},
                {"name":"邗江区"},
                {"name":"维扬区"},
                {"name":"宝应县"},
                {"name":"仪征市"},
                {"name":"高邮市"},
                {"name":"江都市"}
            ]},
            {"name":"镇江市", "sub":[
                {"name":"京口区"},
                {"name":"润州区"},
                {"name":"丹徒区"},
                {"name":"丹阳市"},
                {"name":"扬中市"},
                {"name":"句容市"}
            ]},
            {"name":"泰州市", "sub":[
                {"name":"海陵区"},
                {"name":"高港区"},
                {"name":"兴化市"},
                {"name":"靖江市"},
                {"name":"泰兴市"},
                {"name":"姜堰市"}
            ]},
            {"name":"宿迁市", "sub":[
                {"name":"宿城区"},
                {"name":"宿豫区"},
                {"name":"沭阳县"},
                {"name":"泗阳县"},
                {"name":"泗洪县"}
            ]}
        ]},
        {"name":"浙江省", "sub":[
            {"name":"杭州市", "sub":[
                {"name":"上城区"},
                {"name":"下城区"},
                {"name":"江干区"},
                {"name":"拱墅区"},
                {"name":"西湖区"},
                {"name":"滨江区"},
                {"name":"萧山区"},
                {"name":"余杭区"},
                {"name":"桐庐县"},
                {"name":"淳安县"},
                {"name":"建德市"},
                {"name":"富阳市"},
                {"name":"临安市"}
            ]},
            {"name":"宁波市", "sub":[
                {"name":"海曙区"},
                {"name":"江东区"},
                {"name":"江北区"},
                {"name":"北仑区"},
                {"name":"镇海区"},
                {"name":"鄞州区"},
                {"name":"象山县"},
                {"name":"宁海县"},
                {"name":"余姚市"},
                {"name":"慈溪市"},
                {"name":"奉化市"}
            ]},
            {"name":"温州市", "sub":[
                {"name":"鹿城区"},
                {"name":"龙湾区"},
                {"name":"瓯海区"},
                {"name":"洞头县"},
                {"name":"永嘉县"},
                {"name":"平阳县"},
                {"name":"苍南县"},
                {"name":"文成县"},
                {"name":"泰顺县"},
                {"name":"瑞安市"},
                {"name":"乐清市"}
            ]},
            {"name":"嘉兴市", "sub":[
                {"name":"南湖区"},
                {"name":"秀洲区"},
                {"name":"嘉善县"},
                {"name":"海盐县"},
                {"name":"海宁市"},
                {"name":"平湖市"},
                {"name":"桐乡市"}
            ]},
            {"name":"湖州市", "sub":[
                {"name":"吴兴区"},
                {"name":"南浔区"},
                {"name":"德清县"},
                {"name":"长兴县"},
                {"name":"安吉县"}
            ]},
            {"name":"绍兴市", "sub":[
                {"name":"越城区"},
                {"name":"绍兴县"},
                {"name":"新昌县"},
                {"name":"诸暨市"},
                {"name":"上虞市"},
                {"name":"嵊州市"}
            ]},
            {"name":"金华市", "sub":[
                {"name":"婺城区"},
                {"name":"金东区"},
                {"name":"武义县"},
                {"name":"浦江县"},
                {"name":"磐安县"},
                {"name":"兰溪市"},
                {"name":"义乌市"},
                {"name":"东阳市"},
                {"name":"永康市"}
            ]},
            {"name":"衢州市", "sub":[
                {"name":"柯城区"},
                {"name":"衢江区"},
                {"name":"常山县"},
                {"name":"开化县"},
                {"name":"龙游县"},
                {"name":"江山市"}
            ]},
            {"name":"舟山市", "sub":[
                {"name":"定海区"},
                {"name":"普陀区"},
                {"name":"岱山县"},
                {"name":"嵊泗县"}
            ]},
            {"name":"台州市", "sub":[
                {"name":"椒江区"},
                {"name":"黄岩区"},
                {"name":"路桥区"},
                {"name":"玉环县"},
                {"name":"三门县"},
                {"name":"天台县"},
                {"name":"仙居县"},
                {"name":"温岭市"},
                {"name":"临海市"}
            ]},
            {"name":"丽水市", "sub":[
                {"name":"莲都区"},
                {"name":"青田县"},
                {"name":"缙云县"},
                {"name":"遂昌县"},
                {"name":"松阳县"},
                {"name":"云和县"},
                {"name":"庆元县"},
                {"name":"景宁畲族自治县"},
                {"name":"龙泉市"}
            ]}
        ]},
        {"name":"安徽省", "sub":[
            {"name":"合肥市", "sub":[
                {"name":"瑶海区"},
                {"name":"庐阳区"},
                {"name":"蜀山区"},
                {"name":"包河区"},
                {"name":"长丰县"},
                {"name":"肥东县"},
                {"name":"肥西县"}
            ]},
            {"name":"芜湖市", "sub":[
                {"name":"镜湖区"},
                {"name":"弋江区"},
                {"name":"鸠江区"},
                {"name":"三山区"},
                {"name":"芜湖县"},
                {"name":"繁昌县"},
                {"name":"南陵县"}
            ]},
            {"name":"蚌埠市", "sub":[
                {"name":"龙子湖区"},
                {"name":"蚌山区"},
                {"name":"禹会区"},
                {"name":"淮上区"},
                {"name":"怀远县"},
                {"name":"五河县"},
                {"name":"固镇县"}
            ]},
            {"name":"淮南市", "sub":[
                {"name":"大通区"},
                {"name":"田家庵区"},
                {"name":"谢家集区"},
                {"name":"八公山区"},
                {"name":"潘集区"},
                {"name":"凤台县"}
            ]},
            {"name":"马鞍山市", "sub":[
                {"name":"金家庄区"},
                {"name":"花山区"},
                {"name":"雨山区"},
                {"name":"当涂县"}
            ]},
            {"name":"淮北市", "sub":[
                {"name":"杜集区"},
                {"name":"相山区"},
                {"name":"烈山区"},
                {"name":"濉溪县"}
            ]},
            {"name":"铜陵市", "sub":[
                {"name":"铜官山区"},
                {"name":"狮子山区"},
                {"name":"郊区"},
                {"name":"铜陵县"}
            ]},
            {"name":"安庆市", "sub":[
                {"name":"迎江区"},
                {"name":"大观区"},
                {"name":"宜秀区"},
                {"name":"怀宁县"},
                {"name":"枞阳县"},
                {"name":"潜山县"},
                {"name":"太湖县"},
                {"name":"宿松县"},
                {"name":"望江县"},
                {"name":"岳西县"},
                {"name":"桐城市"}
            ]},
            {"name":"黄山市", "sub":[
                {"name":"屯溪区"},
                {"name":"黄山区"},
                {"name":"徽州区"},
                {"name":"歙县"},
                {"name":"休宁县"},
                {"name":"黟县"},
                {"name":"祁门县"}
            ]},
            {"name":"滁州市", "sub":[
                {"name":"琅琊区"},
                {"name":"南谯区"},
                {"name":"来安县"},
                {"name":"全椒县"},
                {"name":"定远县"},
                {"name":"凤阳县"},
                {"name":"天长市"},
                {"name":"明光市"}
            ]},
            {"name":"阜阳市", "sub":[
                {"name":"颍州区"},
                {"name":"颍东区"},
                {"name":"颍泉区"},
                {"name":"临泉县"},
                {"name":"太和县"},
                {"name":"阜南县"},
                {"name":"颍上县"},
                {"name":"界首市"}
            ]},
            {"name":"宿州市", "sub":[
                {"name":"埇桥区"},
                {"name":"砀山县"},
                {"name":"萧县"},
                {"name":"灵璧县"},
                {"name":"泗县"}
            ]},
            {"name":"巢湖市", "sub":[
                {"name":"居巢区"},
                {"name":"庐江县"},
                {"name":"无为县"},
                {"name":"含山县"},
                {"name":"和县"}
            ]},
            {"name":"六安市", "sub":[
                {"name":"金安区"},
                {"name":"裕安区"},
                {"name":"寿县"},
                {"name":"霍邱县"},
                {"name":"舒城县"},
                {"name":"金寨县"},
                {"name":"霍山县"}
            ]},
            {"name":"亳州市", "sub":[
                {"name":"谯城区"},
                {"name":"涡阳县"},
                {"name":"蒙城县"},
                {"name":"利辛县"}
            ]},
            {"name":"池州市", "sub":[
                {"name":"贵池区"},
                {"name":"东至县"},
                {"name":"石台县"},
                {"name":"青阳县"}
            ]},
            {"name":"宣城市", "sub":[
                {"name":"宣州区"},
                {"name":"郎溪县"},
                {"name":"广德县"},
                {"name":"泾县"},
                {"name":"绩溪县"},
                {"name":"旌德县"},
                {"name":"宁国市"}
            ]}
        ]},
        {"name":"福建省", "sub":[
            {"name":"福州市", "sub":[
                {"name":"鼓楼区"},
                {"name":"台江区"},
                {"name":"仓山区"},
                {"name":"马尾区"},
                {"name":"晋安区"},
                {"name":"闽侯县"},
                {"name":"连江县"},
                {"name":"罗源县"},
                {"name":"闽清县"},
                {"name":"永泰县"},
                {"name":"平潭县"},
                {"name":"福清市"},
                {"name":"长乐市"}
            ]},
            {"name":"厦门市", "sub":[
                {"name":"思明区"},
                {"name":"海沧区"},
                {"name":"湖里区"},
                {"name":"集美区"},
                {"name":"同安区"},
                {"name":"翔安区"}
            ]},
            {"name":"莆田市", "sub":[
                {"name":"城厢区"},
                {"name":"涵江区"},
                {"name":"荔城区"},
                {"name":"秀屿区"},
                {"name":"仙游县"}
            ]},
            {"name":"三明市", "sub":[
                {"name":"梅列区"},
                {"name":"三元区"},
                {"name":"明溪县"},
                {"name":"清流县"},
                {"name":"宁化县"},
                {"name":"大田县"},
                {"name":"尤溪县"},
                {"name":"沙县"},
                {"name":"将乐县"},
                {"name":"泰宁县"},
                {"name":"建宁县"},
                {"name":"永安市"}
            ]},
            {"name":"泉州市", "sub":[
                {"name":"鲤城区"},
                {"name":"丰泽区"},
                {"name":"洛江区"},
                {"name":"泉港区"},
                {"name":"惠安县"},
                {"name":"安溪县"},
                {"name":"永春县"},
                {"name":"德化县"},
                {"name":"金门县"},
                {"name":"石狮市"},
                {"name":"晋江市"},
                {"name":"南安市"}
            ]},
            {"name":"漳州市", "sub":[
                {"name":"芗城区"},
                {"name":"龙文区"},
                {"name":"云霄县"},
                {"name":"漳浦县"},
                {"name":"诏安县"},
                {"name":"长泰县"},
                {"name":"东山县"},
                {"name":"南靖县"},
                {"name":"平和县"},
                {"name":"华安县"},
                {"name":"龙海市"}
            ]},
            {"name":"南平市", "sub":[
                {"name":"延平区"},
                {"name":"顺昌县"},
                {"name":"浦城县"},
                {"name":"光泽县"},
                {"name":"松溪县"},
                {"name":"政和县"},
                {"name":"邵武市"},
                {"name":"武夷山市"},
                {"name":"建瓯市"},
                {"name":"建阳市"}
            ]},
            {"name":"龙岩市", "sub":[
                {"name":"新罗区"},
                {"name":"长汀县"},
                {"name":"永定县"},
                {"name":"上杭县"},
                {"name":"武平县"},
                {"name":"连城县"},
                {"name":"漳平市"}
            ]},
            {"name":"宁德市", "sub":[
                {"name":"蕉城区"},
                {"name":"霞浦县"},
                {"name":"古田县"},
                {"name":"屏南县"},
                {"name":"寿宁县"},
                {"name":"周宁县"},
                {"name":"柘荣县"},
                {"name":"福安市"},
                {"name":"福鼎市"}
            ]}
        ]},
        {"name":"江西省", "sub":[
            {"name":"南昌市", "sub":[
                {"name":"东湖区"},
                {"name":"西湖区"},
                {"name":"青云谱区"},
                {"name":"湾里区"},
                {"name":"青山湖区"},
                {"name":"南昌县"},
                {"name":"新建县"},
                {"name":"安义县"},
                {"name":"进贤县"}
            ]},
            {"name":"景德镇市", "sub":[
                {"name":"昌江区"},
                {"name":"珠山区"},
                {"name":"浮梁县"},
                {"name":"乐平市"}
            ]},
            {"name":"萍乡市", "sub":[
                {"name":"安源区"},
                {"name":"湘东区"},
                {"name":"莲花县"},
                {"name":"上栗县"},
                {"name":"芦溪县"}
            ]},
            {"name":"九江市", "sub":[
                {"name":"庐山区"},
                {"name":"浔阳区"},
                {"name":"九江县"},
                {"name":"武宁县"},
                {"name":"修水县"},
                {"name":"永修县"},
                {"name":"德安县"},
                {"name":"星子县"},
                {"name":"都昌县"},
                {"name":"湖口县"},
                {"name":"彭泽县"},
                {"name":"瑞昌市"},
                {"name":"共青城市"}
            ]},
            {"name":"新余市", "sub":[
                {"name":"渝水区"},
                {"name":"分宜县"}
            ]},
            {"name":"鹰潭市", "sub":[
                {"name":"月湖区"},
                {"name":"余江县"},
                {"name":"贵溪市"}
            ]},
            {"name":"赣州市", "sub":[
                {"name":"章贡区"},
                {"name":"赣县"},
                {"name":"信丰县"},
                {"name":"大余县"},
                {"name":"上犹县"},
                {"name":"崇义县"},
                {"name":"安远县"},
                {"name":"龙南县"},
                {"name":"定南县"},
                {"name":"全南县"},
                {"name":"宁都县"},
                {"name":"于都县"},
                {"name":"兴国县"},
                {"name":"会昌县"},
                {"name":"寻乌县"},
                {"name":"石城县"},
                {"name":"瑞金市"},
                {"name":"南康市"}
            ]},
            {"name":"吉安市", "sub":[
                {"name":"吉州区"},
                {"name":"青原区"},
                {"name":"吉安县"},
                {"name":"吉水县"},
                {"name":"峡江县"},
                {"name":"新干县"},
                {"name":"永丰县"},
                {"name":"泰和县"},
                {"name":"遂川县"},
                {"name":"万安县"},
                {"name":"安福县"},
                {"name":"永新县"},
                {"name":"井冈山市"}
            ]},
            {"name":"宜春市", "sub":[
                {"name":"袁州区"},
                {"name":"奉新县"},
                {"name":"万载县"},
                {"name":"上高县"},
                {"name":"宜丰县"},
                {"name":"靖安县"},
                {"name":"铜鼓县"},
                {"name":"丰城市"},
                {"name":"樟树市"},
                {"name":"高安市"}
            ]},
            {"name":"抚州市", "sub":[
                {"name":"临川区"},
                {"name":"南城县"},
                {"name":"黎川县"},
                {"name":"南丰县"},
                {"name":"崇仁县"},
                {"name":"乐安县"},
                {"name":"宜黄县"},
                {"name":"金溪县"},
                {"name":"资溪县"},
                {"name":"东乡县"},
                {"name":"广昌县"}
            ]},
            {"name":"上饶市", "sub":[
                {"name":"信州区"},
                {"name":"上饶县"},
                {"name":"广丰县"},
                {"name":"玉山县"},
                {"name":"铅山县"},
                {"name":"横峰县"},
                {"name":"弋阳县"},
                {"name":"余干县"},
                {"name":"鄱阳县"},
                {"name":"万年县"},
                {"name":"婺源县"},
                {"name":"德兴市"}
            ]}
        ]},
        {"name":"山东省", "sub":[
            {"name":"济南市", "sub":[
                {"name":"历下区"},
                {"name":"市中区"},
                {"name":"槐荫区"},
                {"name":"天桥区"},
                {"name":"历城区"},
                {"name":"长清区"},
                {"name":"平阴县"},
                {"name":"济阳县"},
                {"name":"商河县"},
                {"name":"章丘市"}
            ]},
            {"name":"青岛市", "sub":[
                {"name":"市南区"},
                {"name":"市北区"},
                {"name":"四方区"},
                {"name":"黄岛区"},
                {"name":"崂山区"},
                {"name":"李沧区"},
                {"name":"城阳区"},
                {"name":"胶州市"},
                {"name":"即墨市"},
                {"name":"平度市"},
                {"name":"胶南市"},
                {"name":"莱西市"}
            ]},
            {"name":"淄博市", "sub":[
                {"name":"淄川区"},
                {"name":"张店区"},
                {"name":"博山区"},
                {"name":"临淄区"},
                {"name":"周村区"},
                {"name":"桓台县"},
                {"name":"高青县"},
                {"name":"沂源县"}
            ]},
            {"name":"枣庄市", "sub":[
                {"name":"市中区"},
                {"name":"薛城区"},
                {"name":"峄城区"},
                {"name":"台儿庄区"},
                {"name":"山亭区"},
                {"name":"滕州市"}
            ]},
            {"name":"东营市", "sub":[
                {"name":"东营区"},
                {"name":"河口区"},
                {"name":"垦利县"},
                {"name":"利津县"},
                {"name":"广饶县"}
            ]},
            {"name":"烟台市", "sub":[
                {"name":"芝罘区"},
                {"name":"福山区"},
                {"name":"牟平区"},
                {"name":"莱山区"},
                {"name":"长岛县"},
                {"name":"龙口市"},
                {"name":"莱阳市"},
                {"name":"莱州市"},
                {"name":"蓬莱市"},
                {"name":"招远市"},
                {"name":"栖霞市"},
                {"name":"海阳市"}
            ]},
            {"name":"潍坊市", "sub":[
                {"name":"潍城区"},
                {"name":"寒亭区"},
                {"name":"坊子区"},
                {"name":"奎文区"},
                {"name":"临朐县"},
                {"name":"昌乐县"},
                {"name":"青州市"},
                {"name":"诸城市"},
                {"name":"寿光市"},
                {"name":"安丘市"},
                {"name":"高密市"},
                {"name":"昌邑市"}
            ]},
            {"name":"济宁市", "sub":[
                {"name":"市中区"},
                {"name":"任城区"},
                {"name":"微山县"},
                {"name":"鱼台县"},
                {"name":"金乡县"},
                {"name":"嘉祥县"},
                {"name":"汶上县"},
                {"name":"泗水县"},
                {"name":"梁山县"},
                {"name":"曲阜市"},
                {"name":"兖州市"},
                {"name":"邹城市"}
            ]},
            {"name":"泰安市", "sub":[
                {"name":"泰山区"},
                {"name":"岱岳区"},
                {"name":"宁阳县"},
                {"name":"东平县"},
                {"name":"新泰市"},
                {"name":"肥城市"}
            ]},
            {"name":"威海市", "sub":[
                {"name":"环翠区"},
                {"name":"文登市"},
                {"name":"荣成市"},
                {"name":"乳山市"}
            ]},
            {"name":"日照市", "sub":[
                {"name":"东港区"},
                {"name":"岚山区"},
                {"name":"五莲县"},
                {"name":"莒县"}
            ]},
            {"name":"莱芜市", "sub":[
                {"name":"莱城区"},
                {"name":"钢城区"}
            ]},
            {"name":"临沂市", "sub":[
                {"name":"兰山区"},
                {"name":"罗庄区"},
                {"name":"河东区"},
                {"name":"沂南县"},
                {"name":"郯城县"},
                {"name":"沂水县"},
                {"name":"苍山县"},
                {"name":"费县"},
                {"name":"平邑县"},
                {"name":"莒南县"},
                {"name":"蒙阴县"},
                {"name":"临沭县"}
            ]},
            {"name":"德州市", "sub":[
                {"name":"德城区"},
                {"name":"陵县"},
                {"name":"宁津县"},
                {"name":"庆云县"},
                {"name":"临邑县"},
                {"name":"齐河县"},
                {"name":"平原县"},
                {"name":"夏津县"},
                {"name":"武城县"},
                {"name":"乐陵市"},
                {"name":"禹城市"}
            ]},
            {"name":"聊城市", "sub":[
                {"name":"东昌府区"},
                {"name":"阳谷县"},
                {"name":"莘县"},
                {"name":"茌平县"},
                {"name":"东阿县"},
                {"name":"冠县"},
                {"name":"高唐县"},
                {"name":"临清市"}
            ]},
            {"name":"滨州市", "sub":[
                {"name":"滨城区"},
                {"name":"惠民县"},
                {"name":"阳信县"},
                {"name":"无棣县"},
                {"name":"沾化县"},
                {"name":"博兴县"},
                {"name":"邹平县"}
            ]},
            {"name":"菏泽市", "sub":[
                {"name":"牡丹区"},
                {"name":"曹县"},
                {"name":"单县"},
                {"name":"成武县"},
                {"name":"巨野县"},
                {"name":"郓城县"},
                {"name":"鄄城县"},
                {"name":"定陶县"},
                {"name":"东明县"}
            ]}
        ]},
        {"name":"河南省", "sub":[
            {"name":"郑州市", "sub":[
                {"name":"中原区"},
                {"name":"二七区"},
                {"name":"管城回族区"},
                {"name":"金水区"},
                {"name":"上街区"},
                {"name":"惠济区"},
                {"name":"中牟县"},
                {"name":"巩义市"},
                {"name":"荥阳市"},
                {"name":"新密市"},
                {"name":"新郑市"},
                {"name":"登封市"}
            ]},
            {"name":"开封市", "sub":[
                {"name":"龙亭区"},
                {"name":"顺河回族区"},
                {"name":"鼓楼区"},
                {"name":"禹王台区"},
                {"name":"金明区"},
                {"name":"杞县"},
                {"name":"通许县"},
                {"name":"尉氏县"},
                {"name":"开封县"},
                {"name":"兰考县"}
            ]},
            {"name":"洛阳市", "sub":[
                {"name":"老城区"},
                {"name":"西工区"},
                {"name":"瀍河回族区"},
                {"name":"涧西区"},
                {"name":"吉利区"},
                {"name":"洛龙区"},
                {"name":"孟津县"},
                {"name":"新安县"},
                {"name":"栾川县"},
                {"name":"嵩县"},
                {"name":"汝阳县"},
                {"name":"宜阳县"},
                {"name":"洛宁县"},
                {"name":"伊川县"},
                {"name":"偃师市"}
            ]},
            {"name":"平顶山市", "sub":[
                {"name":"新华区"},
                {"name":"卫东区"},
                {"name":"石龙区"},
                {"name":"湛河区"},
                {"name":"宝丰县"},
                {"name":"叶县"},
                {"name":"鲁山县"},
                {"name":"郏县"},
                {"name":"舞钢市"},
                {"name":"汝州市"}
            ]},
            {"name":"安阳市", "sub":[
                {"name":"文峰区"},
                {"name":"北关区"},
                {"name":"殷都区"},
                {"name":"龙安区"},
                {"name":"安阳县"},
                {"name":"汤阴县"},
                {"name":"滑县"},
                {"name":"内黄县"},
                {"name":"林州市"}
            ]},
            {"name":"鹤壁市", "sub":[
                {"name":"鹤山区"},
                {"name":"山城区"},
                {"name":"淇滨区"},
                {"name":"浚县"},
                {"name":"淇县"}
            ]},
            {"name":"新乡市", "sub":[
                {"name":"红旗区"},
                {"name":"卫滨区"},
                {"name":"凤泉区"},
                {"name":"牧野区"},
                {"name":"新乡县"},
                {"name":"获嘉县"},
                {"name":"原阳县"},
                {"name":"延津县"},
                {"name":"封丘县"},
                {"name":"长垣县"},
                {"name":"卫辉市"},
                {"name":"辉县市"}
            ]},
            {"name":"焦作市", "sub":[
                {"name":"解放区"},
                {"name":"中站区"},
                {"name":"马村区"},
                {"name":"山阳区"},
                {"name":"修武县"},
                {"name":"博爱县"},
                {"name":"武陟县"},
                {"name":"温县"},
                {"name":"沁阳市"},
                {"name":"孟州市"}
            ]},
            {"name":"濮阳市", "sub":[
                {"name":"华龙区"},
                {"name":"清丰县"},
                {"name":"南乐县"},
                {"name":"范县"},
                {"name":"台前县"},
                {"name":"濮阳县"}
            ]},
            {"name":"许昌市", "sub":[
                {"name":"魏都区"},
                {"name":"许昌县"},
                {"name":"鄢陵县"},
                {"name":"襄城县"},
                {"name":"禹州市"},
                {"name":"长葛市"}
            ]},
            {"name":"漯河市", "sub":[
                {"name":"源汇区"},
                {"name":"郾城区"},
                {"name":"召陵区"},
                {"name":"舞阳县"},
                {"name":"临颍县"}
            ]},
            {"name":"三门峡市", "sub":[
                {"name":"湖滨区"},
                {"name":"渑池县"},
                {"name":"陕县"},
                {"name":"卢氏县"},
                {"name":"义马市"},
                {"name":"灵宝市"}
            ]},
            {"name":"南阳市", "sub":[
                {"name":"宛城区"},
                {"name":"卧龙区"},
                {"name":"南召县"},
                {"name":"方城县"},
                {"name":"西峡县"},
                {"name":"镇平县"},
                {"name":"内乡县"},
                {"name":"淅川县"},
                {"name":"社旗县"},
                {"name":"唐河县"},
                {"name":"新野县"},
                {"name":"桐柏县"},
                {"name":"邓州市"}
            ]},
            {"name":"商丘市", "sub":[
                {"name":"梁园区"},
                {"name":"睢阳区"},
                {"name":"民权县"},
                {"name":"睢县"},
                {"name":"宁陵县"},
                {"name":"柘城县"},
                {"name":"虞城县"},
                {"name":"夏邑县"},
                {"name":"永城市"}
            ]},
            {"name":"信阳市", "sub":[
                {"name":"浉河区"},
                {"name":"平桥区"},
                {"name":"罗山县"},
                {"name":"光山县"},
                {"name":"新县"},
                {"name":"商城县"},
                {"name":"固始县"},
                {"name":"潢川县"},
                {"name":"淮滨县"},
                {"name":"息县"}
            ]},
            {"name":"周口市", "sub":[
                {"name":"川汇区"},
                {"name":"扶沟县"},
                {"name":"西华县"},
                {"name":"商水县"},
                {"name":"沈丘县"},
                {"name":"郸城县"},
                {"name":"淮阳县"},
                {"name":"太康县"},
                {"name":"鹿邑县"},
                {"name":"项城市"}
            ]},
            {"name":"驻马店市", "sub":[
                {"name":"驿城区"},
                {"name":"西平县"},
                {"name":"上蔡县"},
                {"name":"平舆县"},
                {"name":"正阳县"},
                {"name":"确山县"},
                {"name":"泌阳县"},
                {"name":"汝南县"},
                {"name":"遂平县"},
                {"name":"新蔡县"}
            ]},
            {"name":"省直辖县级行政区划", "sub":[
                {"name":"济源市"}
            ]}
        ]},
        {"name":"湖北省", "sub":[
            {"name":"武汉市", "sub":[
                {"name":"江岸区"},
                {"name":"江汉区"},
                {"name":"硚口区"},
                {"name":"汉阳区"},
                {"name":"武昌区"},
                {"name":"青山区"},
                {"name":"洪山区"},
                {"name":"东西湖区"},
                {"name":"汉南区"},
                {"name":"蔡甸区"},
                {"name":"江夏区"},
                {"name":"黄陂区"},
                {"name":"新洲区"}
            ]},
            {"name":"黄石市", "sub":[
                {"name":"黄石港区"},
                {"name":"西塞山区"},
                {"name":"下陆区"},
                {"name":"铁山区"},
                {"name":"阳新县"},
                {"name":"大冶市"}
            ]},
            {"name":"十堰市", "sub":[
                {"name":"茅箭区"},
                {"name":"张湾区"},
                {"name":"郧县"},
                {"name":"郧西县"},
                {"name":"竹山县"},
                {"name":"竹溪县"},
                {"name":"房县"},
                {"name":"丹江口市"}
            ]},
            {"name":"宜昌市", "sub":[
                {"name":"西陵区"},
                {"name":"伍家岗区"},
                {"name":"点军区"},
                {"name":"猇亭区"},
                {"name":"夷陵区"},
                {"name":"远安县"},
                {"name":"兴山县"},
                {"name":"秭归县"},
                {"name":"长阳土家族自治县"},
                {"name":"五峰土家族自治县"},
                {"name":"宜都市"},
                {"name":"当阳市"},
                {"name":"枝江市"}
            ]},
            {"name":"襄樊市", "sub":[
                {"name":"襄城区"},
                {"name":"樊城区"},
                {"name":"襄阳区"},
                {"name":"南漳县"},
                {"name":"谷城县"},
                {"name":"保康县"},
                {"name":"老河口市"},
                {"name":"枣阳市"},
                {"name":"宜城市"}
            ]},
            {"name":"鄂州市", "sub":[
                {"name":"梁子湖区"},
                {"name":"华容区"},
                {"name":"鄂城区"}
            ]},
            {"name":"荆门市", "sub":[
                {"name":"东宝区"},
                {"name":"掇刀区"},
                {"name":"京山县"},
                {"name":"沙洋县"},
                {"name":"钟祥市"}
            ]},
            {"name":"孝感市", "sub":[
                {"name":"孝南区"},
                {"name":"孝昌县"},
                {"name":"大悟县"},
                {"name":"云梦县"},
                {"name":"应城市"},
                {"name":"安陆市"},
                {"name":"汉川市"}
            ]},
            {"name":"荆州市", "sub":[
                {"name":"沙市区"},
                {"name":"荆州区"},
                {"name":"公安县"},
                {"name":"监利县"},
                {"name":"江陵县"},
                {"name":"石首市"},
                {"name":"洪湖市"},
                {"name":"松滋市"}
            ]},
            {"name":"黄冈市", "sub":[
                {"name":"黄州区"},
                {"name":"团风县"},
                {"name":"红安县"},
                {"name":"罗田县"},
                {"name":"英山县"},
                {"name":"浠水县"},
                {"name":"蕲春县"},
                {"name":"黄梅县"},
                {"name":"麻城市"},
                {"name":"武穴市"}
            ]},
            {"name":"咸宁市", "sub":[
                {"name":"咸安区"},
                {"name":"嘉鱼县"},
                {"name":"通城县"},
                {"name":"崇阳县"},
                {"name":"通山县"},
                {"name":"赤壁市"}
            ]},
            {"name":"随州市", "sub":[
                {"name":"曾都区"},
                {"name":"随县"},
                {"name":"广水市"}
            ]},
            {"name":"恩施土家族苗族自治州", "sub":[
                {"name":"恩施市"},
                {"name":"利川市"},
                {"name":"建始县"},
                {"name":"巴东县"},
                {"name":"宣恩县"},
                {"name":"咸丰县"},
                {"name":"来凤县"},
                {"name":"鹤峰县"}
            ]},
            {"name":"省直辖县级行政区划", "sub":[
                {"name":"仙桃市"},
                {"name":"潜江市"},
                {"name":"天门市"},
                {"name":"神农架林区"}
            ]}
        ]},
        {"name":"湖南省", "sub":[
            {"name":"长沙市", "sub":[
                {"name":"芙蓉区"},
                {"name":"天心区"},
                {"name":"岳麓区"},
                {"name":"开福区"},
                {"name":"雨花区"},
                {"name":"长沙县"},
                {"name":"望城县"},
                {"name":"宁乡县"},
                {"name":"浏阳市"}
            ]},
            {"name":"株洲市", "sub":[
                {"name":"荷塘区"},
                {"name":"芦淞区"},
                {"name":"石峰区"},
                {"name":"天元区"},
                {"name":"株洲县"},
                {"name":"攸县"},
                {"name":"茶陵县"},
                {"name":"炎陵县"},
                {"name":"醴陵市"}
            ]},
            {"name":"湘潭市", "sub":[
                {"name":"雨湖区"},
                {"name":"岳塘区"},
                {"name":"湘潭县"},
                {"name":"湘乡市"},
                {"name":"韶山市"}
            ]},
            {"name":"衡阳市", "sub":[
                {"name":"珠晖区"},
                {"name":"雁峰区"},
                {"name":"石鼓区"},
                {"name":"蒸湘区"},
                {"name":"南岳区"},
                {"name":"衡阳县"},
                {"name":"衡南县"},
                {"name":"衡山县"},
                {"name":"衡东县"},
                {"name":"祁东县"},
                {"name":"耒阳市"},
                {"name":"常宁市"}
            ]},
            {"name":"邵阳市", "sub":[
                {"name":"双清区"},
                {"name":"大祥区"},
                {"name":"北塔区"},
                {"name":"邵东县"},
                {"name":"新邵县"},
                {"name":"邵阳县"},
                {"name":"隆回县"},
                {"name":"洞口县"},
                {"name":"绥宁县"},
                {"name":"新宁县"},
                {"name":"城步苗族自治县"},
                {"name":"武冈市"}
            ]},
            {"name":"岳阳市", "sub":[
                {"name":"岳阳楼区"},
                {"name":"云溪区"},
                {"name":"君山区"},
                {"name":"岳阳县"},
                {"name":"华容县"},
                {"name":"湘阴县"},
                {"name":"平江县"},
                {"name":"汨罗市"},
                {"name":"临湘市"}
            ]},
            {"name":"常德市", "sub":[
                {"name":"武陵区"},
                {"name":"鼎城区"},
                {"name":"安乡县"},
                {"name":"汉寿县"},
                {"name":"澧县"},
                {"name":"临澧县"},
                {"name":"桃源县"},
                {"name":"石门县"},
                {"name":"津市市"}
            ]},
            {"name":"张家界市", "sub":[
                {"name":"永定区"},
                {"name":"武陵源区"},
                {"name":"慈利县"},
                {"name":"桑植县"}
            ]},
            {"name":"益阳市", "sub":[
                {"name":"资阳区"},
                {"name":"赫山区"},
                {"name":"南县"},
                {"name":"桃江县"},
                {"name":"安化县"},
                {"name":"沅江市"}
            ]},
            {"name":"郴州市", "sub":[
                {"name":"北湖区"},
                {"name":"苏仙区"},
                {"name":"桂阳县"},
                {"name":"宜章县"},
                {"name":"永兴县"},
                {"name":"嘉禾县"},
                {"name":"临武县"},
                {"name":"汝城县"},
                {"name":"桂东县"},
                {"name":"安仁县"},
                {"name":"资兴市"}
            ]},
            {"name":"永州市", "sub":[
                {"name":"零陵区"},
                {"name":"冷水滩区"},
                {"name":"祁阳县"},
                {"name":"东安县"},
                {"name":"双牌县"},
                {"name":"道县"},
                {"name":"江永县"},
                {"name":"宁远县"},
                {"name":"蓝山县"},
                {"name":"新田县"},
                {"name":"江华瑶族自治县"}
            ]},
            {"name":"怀化市", "sub":[
                {"name":"鹤城区"},
                {"name":"中方县"},
                {"name":"沅陵县"},
                {"name":"辰溪县"},
                {"name":"溆浦县"},
                {"name":"会同县"},
                {"name":"麻阳苗族自治县"},
                {"name":"新晃侗族自治县"},
                {"name":"芷江侗族自治县"},
                {"name":"靖州苗族侗族自治县"},
                {"name":"通道侗族自治县"},
                {"name":"洪江市"}
            ]},
            {"name":"娄底市", "sub":[
                {"name":"娄星区"},
                {"name":"双峰县"},
                {"name":"新化县"},
                {"name":"冷水江市"},
                {"name":"涟源市"}
            ]},
            {"name":"湘西土家族苗族自治州", "sub":[
                {"name":"吉首市"},
                {"name":"泸溪县"},
                {"name":"凤凰县"},
                {"name":"花垣县"},
                {"name":"保靖县"},
                {"name":"古丈县"},
                {"name":"永顺县"},
                {"name":"龙山县"}
            ]}
        ]},
        {"name":"广东省", "sub":[
            {"name":"广州市", "sub":[
                {"name":"荔湾区"},
                {"name":"越秀区"},
                {"name":"海珠区"},
                {"name":"天河区"},
                {"name":"白云区"},
                {"name":"黄埔区"},
                {"name":"番禺区"},
                {"name":"花都区"},
                {"name":"南沙区"},
                {"name":"萝岗区"},
                {"name":"增城市"},
                {"name":"从化市"}
            ]},
            {"name":"韶关市", "sub":[
                {"name":"武江区"},
                {"name":"浈江区"},
                {"name":"曲江区"},
                {"name":"始兴县"},
                {"name":"仁化县"},
                {"name":"翁源县"},
                {"name":"乳源瑶族自治县"},
                {"name":"新丰县"},
                {"name":"乐昌市"},
                {"name":"南雄市"}
            ]},
            {"name":"深圳市", "sub":[
                {"name":"罗湖区"},
                {"name":"福田区"},
                {"name":"南山区"},
                {"name":"宝安区"},
                {"name":"龙岗区"},
                {"name":"盐田区"}
            ]},
            {"name":"珠海市", "sub":[
                {"name":"香洲区"},
                {"name":"斗门区"},
                {"name":"金湾区"}
            ]},
            {"name":"汕头市", "sub":[
                {"name":"龙湖区"},
                {"name":"金平区"},
                {"name":"濠江区"},
                {"name":"潮阳区"},
                {"name":"潮南区"},
                {"name":"澄海区"},
                {"name":"南澳县"}
            ]},
            {"name":"佛山市", "sub":[
                {"name":"禅城区"},
                {"name":"南海区"},
                {"name":"顺德区"},
                {"name":"三水区"},
                {"name":"高明区"}
            ]},
            {"name":"江门市", "sub":[
                {"name":"蓬江区"},
                {"name":"江海区"},
                {"name":"新会区"},
                {"name":"台山市"},
                {"name":"开平市"},
                {"name":"鹤山市"},
                {"name":"恩平市"}
            ]},
            {"name":"湛江市", "sub":[
                {"name":"赤坎区"},
                {"name":"霞山区"},
                {"name":"坡头区"},
                {"name":"麻章区"},
                {"name":"遂溪县"},
                {"name":"徐闻县"},
                {"name":"廉江市"},
                {"name":"雷州市"},
                {"name":"吴川市"}
            ]},
            {"name":"茂名市", "sub":[
                {"name":"茂南区"},
                {"name":"茂港区"},
                {"name":"电白县"},
                {"name":"高州市"},
                {"name":"化州市"},
                {"name":"信宜市"}
            ]},
            {"name":"肇庆市", "sub":[
                {"name":"端州区"},
                {"name":"鼎湖区"},
                {"name":"广宁县"},
                {"name":"怀集县"},
                {"name":"封开县"},
                {"name":"德庆县"},
                {"name":"高要市"},
                {"name":"四会市"}
            ]},
            {"name":"惠州市", "sub":[
                {"name":"惠城区"},
                {"name":"惠阳区"},
                {"name":"博罗县"},
                {"name":"惠东县"},
                {"name":"龙门县"}
            ]},
            {"name":"梅州市", "sub":[
                {"name":"梅江区"},
                {"name":"梅县"},
                {"name":"大埔县"},
                {"name":"丰顺县"},
                {"name":"五华县"},
                {"name":"平远县"},
                {"name":"蕉岭县"},
                {"name":"兴宁市"}
            ]},
            {"name":"汕尾市", "sub":[
                {"name":"城区"},
                {"name":"海丰县"},
                {"name":"陆河县"},
                {"name":"陆丰市"}
            ]},
            {"name":"河源市", "sub":[
                {"name":"源城区"},
                {"name":"紫金县"},
                {"name":"龙川县"},
                {"name":"连平县"},
                {"name":"和平县"},
                {"name":"东源县"}
            ]},
            {"name":"阳江市", "sub":[
                {"name":"江城区"},
                {"name":"阳西县"},
                {"name":"阳东县"},
                {"name":"阳春市"}
            ]},
            {"name":"清远市", "sub":[
                {"name":"清城区"},
                {"name":"佛冈县"},
                {"name":"阳山县"},
                {"name":"连山壮族瑶族自治县"},
                {"name":"连南瑶族自治县"},
                {"name":"清新县"},
                {"name":"英德市"},
                {"name":"连州市"}
            ]},
            {"name":"东莞市", "sub":[
                {"name":"市辖区"}
            ]},
            {"name":"中山市", "sub":[
                {"name":"市辖区"}
            ]},
            {"name":"潮州市", "sub":[
                {"name":"湘桥区"},
                {"name":"潮安县"},
                {"name":"饶平县"}
            ]},
            {"name":"揭阳市", "sub":[
                {"name":"榕城区"},
                {"name":"揭东县"},
                {"name":"揭西县"},
                {"name":"惠来县"},
                {"name":"普宁市"}
            ]},
            {"name":"云浮市", "sub":[
                {"name":"云城区"},
                {"name":"新兴县"},
                {"name":"郁南县"},
                {"name":"云安县"},
                {"name":"罗定市"}
            ]}
        ]},
        {"name":"广西壮族自治区", "sub":[
            {"name":"南宁市", "sub":[
                {"name":"兴宁区"},
                {"name":"青秀区"},
                {"name":"江南区"},
                {"name":"西乡塘区"},
                {"name":"良庆区"},
                {"name":"邕宁区"},
                {"name":"武鸣县"},
                {"name":"隆安县"},
                {"name":"马山县"},
                {"name":"上林县"},
                {"name":"宾阳县"},
                {"name":"横县"}
            ]},
            {"name":"柳州市", "sub":[
                {"name":"城中区"},
                {"name":"鱼峰区"},
                {"name":"柳南区"},
                {"name":"柳北区"},
                {"name":"柳江县"},
                {"name":"柳城县"},
                {"name":"鹿寨县"},
                {"name":"融安县"},
                {"name":"融水苗族自治县"},
                {"name":"三江侗族自治县"}
            ]},
            {"name":"桂林市", "sub":[
                {"name":"秀峰区"},
                {"name":"叠彩区"},
                {"name":"象山区"},
                {"name":"七星区"},
                {"name":"雁山区"},
                {"name":"阳朔县"},
                {"name":"临桂县"},
                {"name":"灵川县"},
                {"name":"全州县"},
                {"name":"兴安县"},
                {"name":"永福县"},
                {"name":"灌阳县"},
                {"name":"龙胜各族自治县"},
                {"name":"资源县"},
                {"name":"平乐县"},
                {"name":"荔蒲县"},
                {"name":"恭城瑶族自治县"}
            ]},
            {"name":"梧州市", "sub":[
                {"name":"万秀区"},
                {"name":"蝶山区"},
                {"name":"长洲区"},
                {"name":"苍梧县"},
                {"name":"藤县"},
                {"name":"蒙山县"},
                {"name":"岑溪市"}
            ]},
            {"name":"北海市", "sub":[
                {"name":"海城区"},
                {"name":"银海区"},
                {"name":"铁山港区"},
                {"name":"合浦县"}
            ]},
            {"name":"防城港市", "sub":[
                {"name":"港口区"},
                {"name":"防城区"},
                {"name":"上思县"},
                {"name":"东兴市"}
            ]},
            {"name":"钦州市", "sub":[
                {"name":"钦南区"},
                {"name":"钦北区"},
                {"name":"灵山县"},
                {"name":"浦北县"}
            ]},
            {"name":"贵港市", "sub":[
                {"name":"港北区"},
                {"name":"港南区"},
                {"name":"覃塘区"},
                {"name":"平南县"},
                {"name":"桂平市"}
            ]},
            {"name":"玉林市", "sub":[
                {"name":"玉州区"},
                {"name":"容县"},
                {"name":"陆川县"},
                {"name":"博白县"},
                {"name":"兴业县"},
                {"name":"北流市"}
            ]},
            {"name":"百色市", "sub":[
                {"name":"右江区"},
                {"name":"田阳县"},
                {"name":"田东县"},
                {"name":"平果县"},
                {"name":"德保县"},
                {"name":"靖西县"},
                {"name":"那坡县"},
                {"name":"凌云县"},
                {"name":"乐业县"},
                {"name":"田林县"},
                {"name":"西林县"},
                {"name":"隆林各族自治县"}
            ]},
            {"name":"贺州市", "sub":[
                {"name":"八步区"},
                {"name":"平桂管理区"},
                {"name":"昭平县"},
                {"name":"钟山县"},
                {"name":"富川瑶族自治县"}
            ]},
            {"name":"河池市", "sub":[
                {"name":"金城江区"},
                {"name":"南丹县"},
                {"name":"天峨县"},
                {"name":"凤山县"},
                {"name":"东兰县"},
                {"name":"罗城仫佬族自治县"},
                {"name":"环江毛南族自治县"},
                {"name":"巴马瑶族自治县"},
                {"name":"都安瑶族自治县"},
                {"name":"大化瑶族自治县"},
                {"name":"宜州市"}
            ]},
            {"name":"来宾市", "sub":[
                {"name":"兴宾区"},
                {"name":"忻城县"},
                {"name":"象州县"},
                {"name":"武宣县"},
                {"name":"金秀瑶族自治县"},
                {"name":"合山市"}
            ]},
            {"name":"崇左市", "sub":[
                {"name":"江洲区"},
                {"name":"扶绥县"},
                {"name":"宁明县"},
                {"name":"龙州县"},
                {"name":"大新县"},
                {"name":"天等县"},
                {"name":"凭祥市"}
            ]}
        ]},
        {"name":"海南省", "sub":[
            {"name":"海口市", "sub":[
                {"name":"秀英区"},
                {"name":"龙华区"},
                {"name":"琼山区"},
                {"name":"美兰区"}
            ]},
            {"name":"三亚市", "sub":[
                {"name":"市辖区"}
            ]},
            {"name":"省直辖县级行政区划", "sub":[
                {"name":"五指山市"},
                {"name":"琼海市"},
                {"name":"儋州市"},
                {"name":"文昌市"},
                {"name":"万宁市"},
                {"name":"东方市"},
                {"name":"定安县"},
                {"name":"屯昌县"},
                {"name":"澄迈县"},
                {"name":"临高县"},
                {"name":"白沙黎族自治县"},
                {"name":"昌江黎族自治县"},
                {"name":"乐东黎族自治县"},
                {"name":"陵水黎族自治县"},
                {"name":"保亭黎族苗族自治县"},
                {"name":"琼中黎族苗族自治县"},
                {"name":"西沙群岛"},
                {"name":"南沙群岛"},
                {"name":"中沙群岛的岛礁及其海域"}
            ]}
        ]},
        {"name":"重庆市", "sub":[
            {"name":"重庆市", "sub":[
                {"name":"万州区"},
                {"name":"涪陵区"},
                {"name":"渝中区"},
                {"name":"大渡口区"},
                {"name":"江北区"},
                {"name":"沙坪坝区"},
                {"name":"九龙坡区"},
                {"name":"南岸区"},
                {"name":"北碚区"},
                {"name":"万盛区"},
                {"name":"双桥区"},
                {"name":"渝北区"},
                {"name":"巴南区"},
                {"name":"黔江区"},
                {"name":"长寿区"},
                {"name":"江津区"},
                {"name":"合川区"},
                {"name":"永川区"},
                {"name":"南川区"},
                {"name":"綦江县"},
                {"name":"潼南县"},
                {"name":"铜梁县"},
                {"name":"大足县"},
                {"name":"荣昌县"},
                {"name":"璧山县"},
                {"name":"梁平县"},
                {"name":"城口县"},
                {"name":"丰都县"},
                {"name":"垫江县"},
                {"name":"武隆县"},
                {"name":"忠县"},
                {"name":"开县"},
                {"name":"云阳县"},
                {"name":"奉节县"},
                {"name":"巫山县"},
                {"name":"巫溪县"},
                {"name":"石柱土家族自治县"},
                {"name":"秀山土家族苗族自治县"},
                {"name":"酉阳土家族苗族自治县"},
                {"name":"彭水苗族土家族自治县"}
            ]}
        ]},
        {"name":"四川省", "sub":[
            {"name":"成都市", "sub":[
                {"name":"锦江区"},
                {"name":"青羊区"},
                {"name":"金牛区"},
                {"name":"武侯区"},
                {"name":"成华区"},
                {"name":"龙泉驿区"},
                {"name":"青白江区"},
                {"name":"新都区"},
                {"name":"温江区"},
                {"name":"金堂县"},
                {"name":"双流县"},
                {"name":"郫县"},
                {"name":"大邑县"},
                {"name":"蒲江县"},
                {"name":"新津县"},
                {"name":"都江堰市"},
                {"name":"彭州市"},
                {"name":"邛崃市"},
                {"name":"崇州市"}
            ]},
            {"name":"自贡市", "sub":[
                {"name":"自流井区"},
                {"name":"贡井区"},
                {"name":"大安区"},
                {"name":"沿滩区"},
                {"name":"荣县"},
                {"name":"富顺县"}
            ]},
            {"name":"攀枝花市", "sub":[
                {"name":"东区"},
                {"name":"西区"},
                {"name":"仁和区"},
                {"name":"米易县"},
                {"name":"盐边县"}
            ]},
            {"name":"泸州市", "sub":[
                {"name":"江阳区"},
                {"name":"纳溪区"},
                {"name":"龙马潭区"},
                {"name":"泸县"},
                {"name":"合江县"},
                {"name":"叙永县"},
                {"name":"古蔺县"}
            ]},
            {"name":"德阳市", "sub":[
                {"name":"旌阳区"},
                {"name":"中江县"},
                {"name":"罗江县"},
                {"name":"广汉市"},
                {"name":"什邡市"},
                {"name":"绵竹市"}
            ]},
            {"name":"绵阳市", "sub":[
                {"name":"涪城区"},
                {"name":"游仙区"},
                {"name":"三台县"},
                {"name":"盐亭县"},
                {"name":"安县"},
                {"name":"梓潼县"},
                {"name":"北川羌族自治县"},
                {"name":"平武县"},
                {"name":"江油市"}
            ]},
            {"name":"广元市", "sub":[
                {"name":"利州区"},
                {"name":"元坝区"},
                {"name":"朝天区"},
                {"name":"旺苍县"},
                {"name":"青川县"},
                {"name":"剑阁县"},
                {"name":"苍溪县"}
            ]},
            {"name":"遂宁市", "sub":[
                {"name":"船山区"},
                {"name":"安居区"},
                {"name":"蓬溪县"},
                {"name":"射洪县"},
                {"name":"大英县"}
            ]},
            {"name":"内江市", "sub":[
                {"name":"市中区"},
                {"name":"东兴区"},
                {"name":"威远县"},
                {"name":"资中县"},
                {"name":"隆昌县"}
            ]},
            {"name":"乐山市", "sub":[
                {"name":"市中区"},
                {"name":"沙湾区"},
                {"name":"五通桥区"},
                {"name":"金口河区"},
                {"name":"犍为县"},
                {"name":"井研县"},
                {"name":"夹江县"},
                {"name":"沐川县"},
                {"name":"峨边彝族自治县"},
                {"name":"马边彝族自治县"},
                {"name":"峨眉山市"}
            ]},
            {"name":"南充市", "sub":[
                {"name":"顺庆区"},
                {"name":"高坪区"},
                {"name":"嘉陵区"},
                {"name":"南部县"},
                {"name":"营山县"},
                {"name":"蓬安县"},
                {"name":"仪陇县"},
                {"name":"西充县"},
                {"name":"阆中市"}
            ]},
            {"name":"眉山市", "sub":[
                {"name":"东坡区"},
                {"name":"仁寿县"},
                {"name":"彭山县"},
                {"name":"洪雅县"},
                {"name":"丹棱县"},
                {"name":"青神县"}
            ]},
            {"name":"宜宾市", "sub":[
                {"name":"翠屏区"},
                {"name":"宜宾县"},
                {"name":"南溪县"},
                {"name":"江安县"},
                {"name":"长宁县"},
                {"name":"高县"},
                {"name":"珙县"},
                {"name":"筠连县"},
                {"name":"兴文县"},
                {"name":"屏山县"}
            ]},
            {"name":"广安市", "sub":[
                {"name":"广安区"},
                {"name":"岳池县"},
                {"name":"武胜县"},
                {"name":"邻水县"},
                {"name":"华蓥市"}
            ]},
            {"name":"达州市", "sub":[
                {"name":"通川区"},
                {"name":"达县"},
                {"name":"宣汉县"},
                {"name":"开江县"},
                {"name":"大竹县"},
                {"name":"渠县"},
                {"name":"万源市"}
            ]},
            {"name":"雅安市", "sub":[
                {"name":"雨城区"},
                {"name":"名山县"},
                {"name":"荥经县"},
                {"name":"汉源县"},
                {"name":"石棉县"},
                {"name":"天全县"},
                {"name":"芦山县"},
                {"name":"宝兴县"}
            ]},
            {"name":"巴中市", "sub":[
                {"name":"巴州区"},
                {"name":"通江县"},
                {"name":"南江县"},
                {"name":"平昌县"}
            ]},
            {"name":"资阳市", "sub":[
                {"name":"雁江区"},
                {"name":"安岳县"},
                {"name":"乐至县"},
                {"name":"简阳市"}
            ]},
            {"name":"阿坝藏族羌族自治州", "sub":[
                {"name":"汶川县"},
                {"name":"理县"},
                {"name":"茂县"},
                {"name":"松潘县"},
                {"name":"九寨沟县"},
                {"name":"金川县"},
                {"name":"小金县"},
                {"name":"黑水县"},
                {"name":"马尔康县"},
                {"name":"壤塘县"},
                {"name":"阿坝县"},
                {"name":"若尔盖县"},
                {"name":"红原县"}
            ]},
            {"name":"甘孜藏族自治州", "sub":[
                {"name":"康定县"},
                {"name":"泸定县"},
                {"name":"丹巴县"},
                {"name":"九龙县"},
                {"name":"雅江县"},
                {"name":"道孚县"},
                {"name":"炉霍县"},
                {"name":"甘孜县"},
                {"name":"新龙县"},
                {"name":"德格县"},
                {"name":"白玉县"},
                {"name":"石渠县"},
                {"name":"色达县"},
                {"name":"理塘县"},
                {"name":"巴塘县"},
                {"name":"乡城县"},
                {"name":"稻城县"},
                {"name":"得荣县"}
            ]},
            {"name":"凉山彝族自治州", "sub":[
                {"name":"西昌市"},
                {"name":"木里藏族自治县"},
                {"name":"盐源县"},
                {"name":"德昌县"},
                {"name":"会理县"},
                {"name":"会东县"},
                {"name":"宁南县"},
                {"name":"普格县"},
                {"name":"布拖县"},
                {"name":"金阳县"},
                {"name":"昭觉县"},
                {"name":"喜德县"},
                {"name":"冕宁县"},
                {"name":"越西县"},
                {"name":"甘洛县"},
                {"name":"美姑县"},
                {"name":"雷波县"}
            ]}
        ]},
        {"name":"贵州省", "sub":[
            {"name":"贵阳市", "sub":[
                {"name":"南明区"},
                {"name":"云岩区"},
                {"name":"花溪区"},
                {"name":"乌当区"},
                {"name":"白云区"},
                {"name":"小河区"},
                {"name":"开阳县"},
                {"name":"息烽县"},
                {"name":"修文县"},
                {"name":"清镇市"}
            ]},
            {"name":"六盘水市", "sub":[
                {"name":"钟山区"},
                {"name":"六枝特区"},
                {"name":"水城县"},
                {"name":"盘县"}
            ]},
            {"name":"遵义市", "sub":[
                {"name":"红花岗区"},
                {"name":"汇川区"},
                {"name":"遵义县"},
                {"name":"桐梓县"},
                {"name":"绥阳县"},
                {"name":"正安县"},
                {"name":"道真仡佬族苗族自治县"},
                {"name":"务川仡佬族苗族自治县"},
                {"name":"凤冈县"},
                {"name":"湄潭县"},
                {"name":"余庆县"},
                {"name":"习水县"},
                {"name":"赤水市"},
                {"name":"仁怀市"}
            ]},
            {"name":"安顺市", "sub":[
                {"name":"西秀区"},
                {"name":"平坝县"},
                {"name":"普定县"},
                {"name":"镇宁布依族苗族自治县"},
                {"name":"关岭布依族苗族自治县"},
                {"name":"紫云苗族布依族自治县"}
            ]},
            {"name":"铜仁地区", "sub":[
                {"name":"铜仁市"},
                {"name":"江口县"},
                {"name":"玉屏侗族自治县"},
                {"name":"石阡县"},
                {"name":"思南县"},
                {"name":"印江土家族苗族自治县"},
                {"name":"德江县"},
                {"name":"沿河土家族自治县"},
                {"name":"松桃苗族自治县"},
                {"name":"万山特区"}
            ]},
            {"name":"黔西南布依族苗族自治州", "sub":[
                {"name":"兴义市"},
                {"name":"兴仁县"},
                {"name":"普安县"},
                {"name":"晴隆县"},
                {"name":"贞丰县"},
                {"name":"望谟县"},
                {"name":"册亨县"},
                {"name":"安龙县"}
            ]},
            {"name":"毕节地区", "sub":[
                {"name":"毕节市"},
                {"name":"大方县"},
                {"name":"黔西县"},
                {"name":"金沙县"},
                {"name":"织金县"},
                {"name":"纳雍县"},
                {"name":"威宁彝族回族苗族自治县"},
                {"name":"赫章县"}
            ]},
            {"name":"黔东南苗族侗族自治州", "sub":[
                {"name":"凯里市"},
                {"name":"黄平县"},
                {"name":"施秉县"},
                {"name":"三穗县"},
                {"name":"镇远县"},
                {"name":"岑巩县"},
                {"name":"天柱县"},
                {"name":"锦屏县"},
                {"name":"剑河县"},
                {"name":"台江县"},
                {"name":"黎平县"},
                {"name":"榕江县"},
                {"name":"从江县"},
                {"name":"雷山县"},
                {"name":"麻江县"},
                {"name":"丹寨县"}
            ]},
            {"name":"黔南布依族苗族自治州", "sub":[
                {"name":"都匀市"},
                {"name":"福泉市"},
                {"name":"荔波县"},
                {"name":"贵定县"},
                {"name":"瓮安县"},
                {"name":"独山县"},
                {"name":"平塘县"},
                {"name":"罗甸县"},
                {"name":"长顺县"},
                {"name":"龙里县"},
                {"name":"惠水县"},
                {"name":"三都水族自治县"}
            ]}
        ]},
        {"name":"云南省", "sub":[
            {"name":"昆明市", "sub":[
                {"name":"五华区"},
                {"name":"盘龙区"},
                {"name":"官渡区"},
                {"name":"西山区"},
                {"name":"东川区"},
                {"name":"呈贡县"},
                {"name":"晋宁县"},
                {"name":"富民县"},
                {"name":"宜良县"},
                {"name":"石林彝族自治县"},
                {"name":"嵩明县"},
                {"name":"禄劝彝族苗族自治县"},
                {"name":"寻甸回族彝族自治县"},
                {"name":"安宁市"}
            ]},
            {"name":"曲靖市", "sub":[
                {"name":"麒麟区"},
                {"name":"马龙县"},
                {"name":"陆良县"},
                {"name":"师宗县"},
                {"name":"罗平县"},
                {"name":"富源县"},
                {"name":"会泽县"},
                {"name":"沾益县"},
                {"name":"宣威市"}
            ]},
            {"name":"玉溪市", "sub":[
                {"name":"红塔区"},
                {"name":"江川县"},
                {"name":"澄江县"},
                {"name":"通海县"},
                {"name":"华宁县"},
                {"name":"易门县"},
                {"name":"峨山彝族自治县"},
                {"name":"新平彝族傣族自治县"},
                {"name":"元江哈尼族彝族傣族自治县"}
            ]},
            {"name":"保山市", "sub":[
                {"name":"隆阳区"},
                {"name":"施甸县"},
                {"name":"腾冲县"},
                {"name":"龙陵县"},
                {"name":"昌宁县"}
            ]},
            {"name":"昭通市", "sub":[
                {"name":"昭阳区"},
                {"name":"鲁甸县"},
                {"name":"巧家县"},
                {"name":"盐津县"},
                {"name":"大关县"},
                {"name":"永善县"},
                {"name":"绥江县"},
                {"name":"镇雄县"},
                {"name":"彝良县"},
                {"name":"威信县"},
                {"name":"水富县"}
            ]},
            {"name":"丽江市", "sub":[
                {"name":"古城区"},
                {"name":"玉龙纳西族自治县"},
                {"name":"永胜县"},
                {"name":"华坪县"},
                {"name":"宁蒗彝族自治县"}
            ]},
            {"name":"普洱市", "sub":[
                {"name":"思茅区"},
                {"name":"宁洱哈尼族彝族自治县"},
                {"name":"墨江哈尼族自治县"},
                {"name":"景东彝族自治县"},
                {"name":"景谷傣族彝族自治县"},
                {"name":"镇沅彝族哈尼族拉祜族自治县"},
                {"name":"江城哈尼族彝族自治县"},
                {"name":"孟连傣族拉祜族佤族自治县"},
                {"name":"澜沧拉祜族自治县"},
                {"name":"西盟佤族自治县"}
            ]},
            {"name":"临沧市", "sub":[
                {"name":"临翔区"},
                {"name":"凤庆县"},
                {"name":"云县"},
                {"name":"永德县"},
                {"name":"镇康县"},
                {"name":"双江拉祜族佤族布朗族傣族自治县"},
                {"name":"耿马傣族佤族自治县"},
                {"name":"沧源佤族自治县"}
            ]},
            {"name":"楚雄彝族自治州", "sub":[
                {"name":"楚雄市"},
                {"name":"双柏县"},
                {"name":"牟定县"},
                {"name":"南华县"},
                {"name":"姚安县"},
                {"name":"大姚县"},
                {"name":"永仁县"},
                {"name":"元谋县"},
                {"name":"武定县"},
                {"name":"禄丰县"}
            ]},
            {"name":"红河哈尼族彝族自治州", "sub":[
                {"name":"个旧市"},
                {"name":"开远市"},
                {"name":"蒙自市"},
                {"name":"屏边苗族自治县"},
                {"name":"建水县"},
                {"name":"石屏县"},
                {"name":"弥勒县"},
                {"name":"泸西县"},
                {"name":"元阳县"},
                {"name":"红河县"},
                {"name":"金平苗族瑶族傣族自治县"},
                {"name":"绿春县"},
                {"name":"河口瑶族自治县"}
            ]},
            {"name":"文山壮族苗族自治州", "sub":[
                {"name":"文山县"},
                {"name":"砚山县"},
                {"name":"西畴县"},
                {"name":"麻栗坡县"},
                {"name":"马关县"},
                {"name":"丘北县"},
                {"name":"广南县"},
                {"name":"富宁县"}
            ]},
            {"name":"西双版纳傣族自治州", "sub":[
                {"name":"景洪市"},
                {"name":"勐海县"},
                {"name":"勐腊县"}
            ]},
            {"name":"大理白族自治州", "sub":[
                {"name":"大理市"},
                {"name":"漾濞彝族自治县"},
                {"name":"祥云县"},
                {"name":"宾川县"},
                {"name":"弥渡县"},
                {"name":"南涧彝族自治县"},
                {"name":"巍山彝族回族自治县"},
                {"name":"永平县"},
                {"name":"云龙县"},
                {"name":"洱源县"},
                {"name":"剑川县"},
                {"name":"鹤庆县"}
            ]},
            {"name":"德宏傣族景颇族自治州", "sub":[
                {"name":"瑞丽市"},
                {"name":"芒市"},
                {"name":"梁河县"},
                {"name":"盈江县"},
                {"name":"陇川县"}
            ]},
            {"name":"怒江傈僳族自治州", "sub":[
                {"name":"泸水县"},
                {"name":"福贡县"},
                {"name":"贡山独龙族怒族自治县"},
                {"name":"兰坪白族普米族自治县"}
            ]},
            {"name":"迪庆藏族自治州", "sub":[
                {"name":"香格里拉县"},
                {"name":"德钦县"},
                {"name":"维西傈僳族自治县"}
            ]}
        ]},
        {"name":"西藏自治区", "sub":[
            {"name":"拉萨市", "sub":[
                {"name":"城关区"},
                {"name":"林周县"},
                {"name":"当雄县"},
                {"name":"尼木县"},
                {"name":"曲水县"},
                {"name":"堆龙德庆县"},
                {"name":"达孜县"},
                {"name":"墨竹工卡县"}
            ]},
            {"name":"昌都地区", "sub":[
                {"name":"昌都县"},
                {"name":"江达县"},
                {"name":"贡觉县"},
                {"name":"类乌齐县"},
                {"name":"丁青县"},
                {"name":"察雅县"},
                {"name":"八宿县"},
                {"name":"左贡县"},
                {"name":"芒康县"},
                {"name":"洛隆县"},
                {"name":"边坝县"}
            ]},
            {"name":"山南地区", "sub":[
                {"name":"乃东县"},
                {"name":"扎囊县"},
                {"name":"贡嘎县"},
                {"name":"桑日县"},
                {"name":"琼结县"},
                {"name":"曲松县"},
                {"name":"措美县"},
                {"name":"洛扎县"},
                {"name":"加查县"},
                {"name":"隆子县"},
                {"name":"错那县"},
                {"name":"浪卡子县"}
            ]},
            {"name":"日喀则地区", "sub":[
                {"name":"日喀则市"},
                {"name":"南木林县"},
                {"name":"江孜县"},
                {"name":"定日县"},
                {"name":"萨迦县"},
                {"name":"拉孜县"},
                {"name":"昂仁县"},
                {"name":"谢通门县"},
                {"name":"白朗县"},
                {"name":"仁布县"},
                {"name":"康马县"},
                {"name":"定结县"},
                {"name":"仲巴县"},
                {"name":"亚东县"},
                {"name":"吉隆县"},
                {"name":"聂拉木县"},
                {"name":"萨嘎县"},
                {"name":"岗巴县"}
            ]},
            {"name":"那曲地区", "sub":[
                {"name":"那曲县"},
                {"name":"嘉黎县"},
                {"name":"比如县"},
                {"name":"聂荣县"},
                {"name":"安多县"},
                {"name":"申扎县"},
                {"name":"索县"},
                {"name":"班戈县"},
                {"name":"巴青县"},
                {"name":"尼玛县"}
            ]},
            {"name":"阿里地区", "sub":[
                {"name":"普兰县"},
                {"name":"札达县"},
                {"name":"噶尔县"},
                {"name":"日土县"},
                {"name":"革吉县"},
                {"name":"改则县"},
                {"name":"措勤县"}
            ]},
            {"name":"林芝地区", "sub":[
                {"name":"林芝县"},
                {"name":"工布江达县"},
                {"name":"米林县"},
                {"name":"墨脱县"},
                {"name":"波密县"},
                {"name":"察隅县"},
                {"name":"朗县"}
            ]}
        ]},
        {"name":"陕西省", "sub":[
            {"name":"西安市", "sub":[
                {"name":"新城区"},
                {"name":"碑林区"},
                {"name":"莲湖区"},
                {"name":"灞桥区"},
                {"name":"未央区"},
                {"name":"雁塔区"},
                {"name":"阎良区"},
                {"name":"临潼区"},
                {"name":"长安区"},
                {"name":"蓝田县"},
                {"name":"周至县"},
                {"name":"户县"},
                {"name":"高陵县"}
            ]},
            {"name":"铜川市", "sub":[
                {"name":"王益区"},
                {"name":"印台区"},
                {"name":"耀州区"},
                {"name":"宜君县"}
            ]},
            {"name":"宝鸡市", "sub":[
                {"name":"渭滨区"},
                {"name":"金台区"},
                {"name":"陈仓区"},
                {"name":"凤翔县"},
                {"name":"岐山县"},
                {"name":"扶风县"},
                {"name":"眉县"},
                {"name":"陇县"},
                {"name":"千阳县"},
                {"name":"麟游县"},
                {"name":"凤县"},
                {"name":"太白县"}
            ]},
            {"name":"咸阳市", "sub":[
                {"name":"秦都区"},
                {"name":"杨陵区"},
                {"name":"渭城区"},
                {"name":"三原县"},
                {"name":"泾阳县"},
                {"name":"乾县"},
                {"name":"礼泉县"},
                {"name":"永寿县"},
                {"name":"彬县"},
                {"name":"长武县"},
                {"name":"旬邑县"},
                {"name":"淳化县"},
                {"name":"武功县"},
                {"name":"兴平市"}
            ]},
            {"name":"渭南市", "sub":[
                {"name":"临渭区"},
                {"name":"华县"},
                {"name":"潼关县"},
                {"name":"大荔县"},
                {"name":"合阳县"},
                {"name":"澄城县"},
                {"name":"蒲城县"},
                {"name":"白水县"},
                {"name":"富平县"},
                {"name":"韩城市"},
                {"name":"华阴市"}
            ]},
            {"name":"延安市", "sub":[
                {"name":"宝塔区"},
                {"name":"延长县"},
                {"name":"延川县"},
                {"name":"子长县"},
                {"name":"安塞县"},
                {"name":"志丹县"},
                {"name":"吴起县"},
                {"name":"甘泉县"},
                {"name":"富县"},
                {"name":"洛川县"},
                {"name":"宜川县"},
                {"name":"黄龙县"},
                {"name":"黄陵县"}
            ]},
            {"name":"汉中市", "sub":[
                {"name":"汉台区"},
                {"name":"南郑县"},
                {"name":"城固县"},
                {"name":"洋县"},
                {"name":"西乡县"},
                {"name":"勉县"},
                {"name":"宁强县"},
                {"name":"略阳县"},
                {"name":"镇巴县"},
                {"name":"留坝县"},
                {"name":"佛坪县"}
            ]},
            {"name":"榆林市", "sub":[
                {"name":"榆阳区"},
                {"name":"神木县"},
                {"name":"府谷县"},
                {"name":"横山县"},
                {"name":"靖边县"},
                {"name":"定边县"},
                {"name":"绥德县"},
                {"name":"米脂县"},
                {"name":"佳县"},
                {"name":"吴堡县"},
                {"name":"清涧县"},
                {"name":"子洲县"}
            ]},
            {"name":"安康市", "sub":[
                {"name":"汉滨区"},
                {"name":"汉阴县"},
                {"name":"石泉县"},
                {"name":"宁陕县"},
                {"name":"紫阳县"},
                {"name":"岚皋县"},
                {"name":"平利县"},
                {"name":"镇坪县"},
                {"name":"旬阳县"},
                {"name":"白河县"}
            ]},
            {"name":"商洛市", "sub":[
                {"name":"商州区"},
                {"name":"洛南县"},
                {"name":"丹凤县"},
                {"name":"商南县"},
                {"name":"山阳县"},
                {"name":"镇安县"},
                {"name":"柞水县"}
            ]}
        ]},
        {"name":"甘肃省", "sub":[
            {"name":"兰州市", "sub":[
                {"name":"城关区"},
                {"name":"七里河区"},
                {"name":"西固区"},
                {"name":"安宁区"},
                {"name":"红古区"},
                {"name":"永登县"},
                {"name":"皋兰县"},
                {"name":"榆中县"}
            ]},
            {"name":"嘉峪关市", "sub":[
                {"name":"市辖区"}
            ]},
            {"name":"金昌市", "sub":[
                {"name":"金川区"},
                {"name":"永昌县"}
            ]},
            {"name":"白银市", "sub":[
                {"name":"白银区"},
                {"name":"平川区"},
                {"name":"靖远县"},
                {"name":"会宁县"},
                {"name":"景泰县"}
            ]},
            {"name":"天水市", "sub":[
                {"name":"秦州区"},
                {"name":"麦积区"},
                {"name":"清水县"},
                {"name":"秦安县"},
                {"name":"甘谷县"},
                {"name":"武山县"},
                {"name":"张家川回族自治县"}
            ]},
            {"name":"武威市", "sub":[
                {"name":"凉州区"},
                {"name":"民勤县"},
                {"name":"古浪县"},
                {"name":"天祝藏族自治县"}
            ]},
            {"name":"张掖市", "sub":[
                {"name":"甘州区"},
                {"name":"肃南裕固族自治县"},
                {"name":"民乐县"},
                {"name":"临泽县"},
                {"name":"高台县"},
                {"name":"山丹县"}
            ]},
            {"name":"平凉市", "sub":[
                {"name":"崆峒区"},
                {"name":"泾川县"},
                {"name":"灵台县"},
                {"name":"崇信县"},
                {"name":"华亭县"},
                {"name":"庄浪县"},
                {"name":"静宁县"}
            ]},
            {"name":"酒泉市", "sub":[
                {"name":"肃州区"},
                {"name":"金塔县"},
                {"name":"瓜州县"},
                {"name":"肃北蒙古族自治县"},
                {"name":"阿克塞哈萨克族自治县"},
                {"name":"玉门市"},
                {"name":"敦煌市"}
            ]},
            {"name":"庆阳市", "sub":[
                {"name":"西峰区"},
                {"name":"庆城县"},
                {"name":"环县"},
                {"name":"华池县"},
                {"name":"合水县"},
                {"name":"正宁县"},
                {"name":"宁县"},
                {"name":"镇原县"}
            ]},
            {"name":"定西市", "sub":[
                {"name":"安定区"},
                {"name":"通渭县"},
                {"name":"陇西县"},
                {"name":"渭源县"},
                {"name":"临洮县"},
                {"name":"漳县"},
                {"name":"岷县"}
            ]},
            {"name":"陇南市", "sub":[
                {"name":"武都区"},
                {"name":"成县"},
                {"name":"文县"},
                {"name":"宕昌县"},
                {"name":"康县"},
                {"name":"西和县"},
                {"name":"礼县"},
                {"name":"徽县"},
                {"name":"两当县"}
            ]},
            {"name":"临夏回族自治州", "sub":[
                {"name":"临夏市"},
                {"name":"临夏县"},
                {"name":"康乐县"},
                {"name":"永靖县"},
                {"name":"广河县"},
                {"name":"和政县"},
                {"name":"东乡族自治县"},
                {"name":"积石山保安族东乡族撒拉族自治县"}
            ]},
            {"name":"甘南藏族自治州", "sub":[
                {"name":"合作市"},
                {"name":"临潭县"},
                {"name":"卓尼县"},
                {"name":"舟曲县"},
                {"name":"迭部县"},
                {"name":"玛曲县"},
                {"name":"碌曲县"},
                {"name":"夏河县"}
            ]}
        ]},
        {"name":"青海省", "sub":[
            {"name":"西宁市", "sub":[
                {"name":"城东区"},
                {"name":"城中区"},
                {"name":"城西区"},
                {"name":"城北区"},
                {"name":"大通回族土族自治县"},
                {"name":"湟中县"},
                {"name":"湟源县"}
            ]},
            {"name":"海东地区", "sub":[
                {"name":"平安县"},
                {"name":"民和回族土族自治县"},
                {"name":"乐都县"},
                {"name":"互助土族自治县"},
                {"name":"化隆回族自治县"},
                {"name":"循化撒拉族自治县"}
            ]},
            {"name":"海北藏族自治州", "sub":[
                {"name":"门源回族自治县"},
                {"name":"祁连县"},
                {"name":"海晏县"},
                {"name":"刚察县"}
            ]},
            {"name":"黄南藏族自治州", "sub":[
                {"name":"同仁县"},
                {"name":"尖扎县"},
                {"name":"泽库县"},
                {"name":"河南蒙古族自治县"}
            ]},
            {"name":"海南藏族自治州", "sub":[
                {"name":"共和县"},
                {"name":"同德县"},
                {"name":"贵德县"},
                {"name":"兴海县"},
                {"name":"贵南县"}
            ]},
            {"name":"果洛藏族自治州", "sub":[
                {"name":"玛沁县"},
                {"name":"班玛县"},
                {"name":"甘德县"},
                {"name":"达日县"},
                {"name":"久治县"},
                {"name":"玛多县"}
            ]},
            {"name":"玉树藏族自治州", "sub":[
                {"name":"玉树县"},
                {"name":"杂多县"},
                {"name":"称多县"},
                {"name":"治多县"},
                {"name":"囊谦县"},
                {"name":"曲麻莱县"}
            ]},
            {"name":"海西蒙古族藏族自治州", "sub":[
                {"name":"格尔木市"},
                {"name":"德令哈市"},
                {"name":"乌兰县"},
                {"name":"都兰县"},
                {"name":"天峻县"}
            ]}
        ]},
        {"name":"宁夏回族自治区", "sub":[
            {"name":"银川市", "sub":[
                {"name":"兴庆区"},
                {"name":"西夏区"},
                {"name":"金凤区"},
                {"name":"永宁县"},
                {"name":"贺兰县"},
                {"name":"灵武市"}
            ]},
            {"name":"石嘴山市", "sub":[
                {"name":"大武口区"},
                {"name":"惠农区"},
                {"name":"平罗县"}
            ]},
            {"name":"吴忠市", "sub":[
                {"name":"利通区"},
                {"name":"红寺堡区"},
                {"name":"盐池县"},
                {"name":"同心县"},
                {"name":"青铜峡市"}
            ]},
            {"name":"固原市", "sub":[
                {"name":"原州区"},
                {"name":"西吉县"},
                {"name":"隆德县"},
                {"name":"泾源县"},
                {"name":"彭阳县"}
            ]},
            {"name":"中卫市", "sub":[
                {"name":"沙坡头区"},
                {"name":"中宁县"},
                {"name":"海原县"}
            ]}
        ]},
        {"name":"新疆维吾尔自治区", "sub":[
            {"name":"乌鲁木齐市", "sub":[
                {"name":"天山区"},
                {"name":"沙依巴克区"},
                {"name":"新市区"},
                {"name":"水磨沟区"},
                {"name":"头屯河区"},
                {"name":"达坂城区"},
                {"name":"米东区"},
                {"name":"乌鲁木齐县"}
            ]},
            {"name":"克拉玛依市", "sub":[
                {"name":"独山子区"},
                {"name":"克拉玛依区"},
                {"name":"白碱滩区"},
                {"name":"乌尔禾区"}
            ]},
            {"name":"吐鲁番地区", "sub":[
                {"name":"吐鲁番市"},
                {"name":"鄯善县"},
                {"name":"托克逊县"}
            ]},
            {"name":"哈密地区", "sub":[
                {"name":"哈密市"},
                {"name":"巴里坤哈萨克自治县"},
                {"name":"伊吾县"}
            ]},
            {"name":"昌吉回族自治州", "sub":[
                {"name":"昌吉市"},
                {"name":"阜康市"},
                {"name":"呼图壁县"},
                {"name":"玛纳斯县"},
                {"name":"奇台县"},
                {"name":"吉木萨尔县"},
                {"name":"木垒哈萨克自治县"}
            ]},
            {"name":"博尔塔拉蒙古自治州", "sub":[
                {"name":"博乐市"},
                {"name":"精河县"},
                {"name":"温泉县"}
            ]},
            {"name":"巴音郭楞蒙古自治州", "sub":[
                {"name":"库尔勒市"},
                {"name":"轮台县"},
                {"name":"尉犁县"},
                {"name":"若羌县"},
                {"name":"且末县"},
                {"name":"焉耆回族自治县"},
                {"name":"和静县"},
                {"name":"和硕县"},
                {"name":"博湖县"}
            ]},
            {"name":"阿克苏地区", "sub":[
                {"name":"阿克苏市"},
                {"name":"温宿县"},
                {"name":"库车县"},
                {"name":"沙雅县"},
                {"name":"新和县"},
                {"name":"拜城县"},
                {"name":"乌什县"},
                {"name":"阿瓦提县"},
                {"name":"柯坪县"}
            ]},
            {"name":"克孜勒苏柯尔克孜自治州", "sub":[
                {"name":"阿图什市"},
                {"name":"阿克陶县"},
                {"name":"阿合奇县"},
                {"name":"乌恰县"}
            ]},
            {"name":"喀什地区", "sub":[
                {"name":"喀什市"},
                {"name":"疏附县"},
                {"name":"疏勒县"},
                {"name":"英吉沙县"},
                {"name":"泽普县"},
                {"name":"莎车县"},
                {"name":"叶城县"},
                {"name":"麦盖提县"},
                {"name":"岳普湖县"},
                {"name":"伽师县"},
                {"name":"巴楚县"},
                {"name":"塔什库尔干塔吉克自治县"}
            ]},
            {"name":"和田地区", "sub":[
                {"name":"和田市"},
                {"name":"和田县"},
                {"name":"墨玉县"},
                {"name":"皮山县"},
                {"name":"洛浦县"},
                {"name":"策勒县"},
                {"name":"于田县"},
                {"name":"民丰县"}
            ]},
            {"name":"伊犁哈萨克自治州", "sub":[
                {"name":"伊宁市"},
                {"name":"奎屯市"},
                {"name":"伊宁县"},
                {"name":"察布查尔锡伯自治县"},
                {"name":"霍城县"},
                {"name":"巩留县"},
                {"name":"新源县"},
                {"name":"昭苏县"},
                {"name":"特克斯县"},
                {"name":"尼勒克县"}
            ]},
            {"name":"塔城地区", "sub":[
                {"name":"塔城市"},
                {"name":"乌苏市"},
                {"name":"额敏县"},
                {"name":"沙湾县"},
                {"name":"托里县"},
                {"name":"裕民县"},
                {"name":"和布克赛尔蒙古自治县"}
            ]},
            {"name":"阿勒泰地区", "sub":[
                {"name":"阿勒泰市"},
                {"name":"布尔津县"},
                {"name":"富蕴县"},
                {"name":"福海县"},
                {"name":"哈巴河县"},
                {"name":"青河县"},
                {"name":"吉木乃县"}
            ]},
            {"name":"自治区直辖县级行政区划", "sub":[
                {"name":"石河子市"},
                {"name":"阿拉尔市"},
                {"name":"图木舒克市"},
                {"name":"五家渠市"}
            ]}
        ]}
    ];
})()

//验证表单
;(function () {
    //验证规则
    var ValidateRule = {
        //不能为空
        isRequired: function ($el) {
            var val = $.trim($el.val())
            if(!val){
                $.errorAnimate ($el)
                return false
            }
            return true
        },
        //身份证号
        isCardNo: function ($el) {
            var val = $el.val()
            var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
            if(reg.test(val) === false) {
                $.errorAnimate ($el)
                return false;
            }
            return true
        },
        //纯数字
        isPureNum: function ($el) {
            var val = $.trim($el.val())
            var reg = /^[0-9]+$/
            if(reg.test(val) === false){
                $.errorAnimate ($el)
                return false;
            }
            return true
        },
        //手机号
        isPhoneNum: function ($el) {
            var val = $.trim($el.val())
            var reg = /^1[3456789]\d{9}$/
            if(reg.test(val) === false){
                $.errorAnimate ($el)
                return false;
            }
            return true
        }
    }
    //验证方法
    var Validator = function(){
        this.cacheFn=[]
        this.flag = true
    }
    Validator.prototype.add = function ($el, rule) {
        if(!rule) return;
        this.cacheFn.push(function () {
            return ValidateRule[rule]($el)
        })
    }
    Validator.prototype.validate = function () {
        var self = this
        if(this.cacheFn.length == 0) return

        this.cacheFn.forEach(function (fn) {
            if(!fn.apply(self)){
                self.flag = false
            }
        })

        return this.flag
    }

    var Union = window.Union = window.Union || {}

    Union.Validator = Validator

})()

//优品联盟商户注册
;(function(){

    if (window.__PAGE != 'register') {
        return
    }

    // 获取用户信息页
    if(!$('.page-union-register') || !$('.page-union-register').length){ return}

    var $win = tcb.getWin(),
        R = tcb.getRoot(),
        Union = window.Union || {}

    var $name = $('[name="truename"]'),//店长姓名
        $shopname = $('[name="shopname"]'),//门店名称
        $buyer_mobile = $('[name="mobile"]'),//手机号
        $vcode = $('[name="vcode"]'),//图片验证码
        $pcode = $('[name="pcode"]'),//手机验证码
        $province = $('[name="province"]'),//省
        $city = $('[name="city"]'),//市
        $area = $('[name="area"]'),//区
        $address = $('[name="address"]')//详细地址

    function init() {
        bindEvent()
    }
    init()

    //绑定事件
    function bindEvent(){
        new MobileSelect({
            trigger: '.user-address',
            title: '家庭住址',
            wheels: [
                {data:R.CITY_DATA}
            ],
            keyMap: {
                value: 'name',
                childs :'sub'
            },
            position:[0], //Initialize positioning
            callback: function(index, data){
                $province.val(data[0]['name'])
                $city.val(data[1]['name'])
                $area.val(data[2]['name'])
            }
        });

        tcb.bindEvent('#mainbody',{
            '.js-do-register': function(e){
                e.preventDefault();
                if(valideForm()){
                    var params ={
                        mobile:$buyer_mobile.val(),
                        code:$pcode.val(),
                        truename:$name.val(),
                        shopname:$shopname.val(),
                        address:$address.val(),
                        province:$province.val(),
                        city:$city.val(),
                        area:$area.val(),
                    }
                    renderUserInfo(params,'/union/reg',function(res){
                        if(!res.errno){
                            window.location.href = '/union/login?from_flag=register_succ'
                        }else{
                            $.dialog.toast (res[ 'errmsg' ], 2000)
                        }
                    })
                }
            },
            //刷新图片验证码
            '.vcode-img': function (e) {
                var $this = $(this),
                    $vcode_item = $this.closest('.vcode-item'),
                    $vcode_input = $vcode_item.find('.input-vcode'),
                    src = '/secode/?rands=' + Math.random ()

                $this.attr('src', src)
                $vcode_input.focus()
            },
            //获取手机验证码
            '.js-trigger-get-pcode':function (e) {
                e.preventDefault()

                var $this = $(this)
                if($this.hasClass('disabled')) return;

                var validInst = new Union.Validator
                validInst.add($buyer_mobile, 'isPhoneNum')
                validInst.add($vcode, 'isRequired')
                var valid_res = validInst.validate()

                if(valid_res){
                    var params = {
                        mobile: $buyer_mobile.val(),
                        pic_secode: $vcode.val(),
                        sms_type: 51
                    }
                    getPhoneCode(params,function () {
                        $this.addClass ('disabled').html ('发送成功')
                        setTimeout(function(){

                            $this.html ('60秒后再次发送')

                            tcb.distimeAnim (60, function (time) {
                                if (time <= 0) {
                                    $this.removeClass ('disabled').html ('发送验证码')
                                } else {
                                    $this.html (time + '秒后再次发送')
                                }
                            })

                        }, 1000)
                    })
                }

            }
        })
    }

    //获取短信验证码
    function getPhoneCode (params, callback, error) {
        $.ajax ({
            type     : 'POST',
            url      : '/aj/doSendSmscode/',
            data     : params,
            dataType : 'json',
            timeout  : 5000,
            success  : function (res) {

                if (res[ 'errno' ]) {
                    return $.dialog.toast (res[ 'errmsg' ], 2000)
                }
                typeof callback === 'function' && callback (res[ 'result' ])
            },
            error    : function () {
                typeof error === 'function' && error ()
            }
        })
    }

    //提交用户信息
    function renderUserInfo(params, url, callback, error) {
        $.ajax({
            type: 'POST',
            url: url,
            data: params,
            dataType: 'json',
            success: function (res) {

                typeof callback == 'function' && callback(res)
            },
            error: function () {
                typeof error == 'function'  && error()
            }
        })
    }

    function valideForm() {
        //验证数据
        var validInst = new Union.Validator
        validInst.add($name, 'isRequired')
        validInst.add($shopname, 'isRequired')
        validInst.add($buyer_mobile, 'isRequired')
        validInst.add($province , 'isRequired')
        validInst.add($city , 'isRequired')
        validInst.add($area , 'isRequired')
        validInst.add($address , 'isRequired')
        validInst.add($pcode , 'isRequired')
        return validInst.validate()
    }


}());


;/**import from `/resource/js/mobile/union/order_list.js` **/
// 订单列表
!function () {
    if (window.__PAGE != 'order-list') {
        return
    }

    $ (function () {
        var $win = tcb.getWin (),
            $body = $ ('body'),
            $FormSearchOrder = $ ('#FormSearchOrder'),
            $OrderList = $ ('.block-order-list'),
            __Cache = tcb.cache (window.__PAGE, {
                page    : 1,
                orderid : '',
                mobile  : '',
                type    : 1,

                maxPage       : 0,
                is_loading    : false,
                is_end        : false,
                is_force_load : true
            })

        function init () {
            bindEvent ()
        }

        function bindEvent () {
            $win.on ('scroll load', tcb.runDelay (function (e) {
                var cacheData = tcb.cache (window.__PAGE)

                var // 补偿值
                    fix_padding = 120,
                    // 加载更多的临界值[滚动条位置+窗口高度+补偿值]
                    loading_threshold = $win.scrollTop () + $win.height () + fix_padding

                if (loading_threshold < $body[ 0 ].scrollHeight && !cacheData[ 'is_force_load' ]) {
                    return
                }

                cacheData[ 'is_force_load' ] = false

                if (cacheData[ 'is_loading' ] || cacheData[ 'is_end' ]) {
                    return
                }
                cacheData[ 'is_loading' ] = true
                addProductLoadingHtml ($OrderList)
                getOrderList ({
                    page    : cacheData[ 'page' ],
                    orderid : cacheData[ 'orderid' ],
                    mobile  : cacheData[ 'mobile' ],
                    type    : cacheData[ 'type' ]
                }, function (ajaxData) {
                    cacheData[ 'is_loading' ] = false

                    if (!__Cache[ 'maxPage' ]) {
                        __Cache[ 'maxPage' ] = Math.ceil (ajaxData[ 'total' ] / ajaxData[ 'per_page' ])
                    }
                    __Cache[ 'page' ] = cacheData[ 'page' ] + 1

                    if (__Cache[ 'page' ] > __Cache[ 'maxPage' ] || !__Cache[ 'maxPage' ]) {
                        __Cache[ 'is_end' ] = true
                        addProductNoMoreHtml ($OrderList)
                    }

                    removeProductLoadingHtml ($OrderList)
                })

            }, 150, 300))

            $FormSearchOrder.on ('submit', function (e) {
                e.preventDefault ()

                var $input = $FormSearchOrder.find ('[name="keyword"]'),
                    keyword = tcb.trim ($input.val ())
                //if ($input && !tcb.trim($input.val())){
                //    return $input.shine4Error()
                //}

                // 重置数据
                __restCacheData ()

                if (tcb.validMobile (keyword)) {
                    __Cache[ 'orderid' ] = ''
                    __Cache[ 'mobile' ] = keyword
                } else {
                    __Cache[ 'orderid' ] = keyword
                    __Cache[ 'mobile' ] = ''
                }

                $win.trigger ('load')
            })

            var $Input = $FormSearchOrder.find('input'),
                $X = $FormSearchOrder.find('.icon-circle-solid-error')
            $Input.on('change input', function(e){
                var $me = $(this),
                    val = $me.val()

                if (val){
                    $X.show()
                } else {
                    $X.hide()
                }
            })
            $X.on('click', function(e){
                e.preventDefault()

                $Input.val('')
                $X.hide()

                var cacheData = tcb.cache (window.__PAGE)

                if (cacheData[ 'orderid' ] || cacheData[ 'mobile' ]) {
                    // 重置数据
                    __restCacheData ()

                    __Cache[ 'orderid' ] = ''
                    __Cache[ 'mobile' ] = ''

                    $win.trigger ('load')
                }
            })

            tcb.bindEvent ({
                '.row-fragment-tab .tab-item' : function (e) {
                    e.preventDefault ()

                    var $me = $ (this)
                    if ($me.hasClass ('selected') || __Cache[ 'is_loading' ]) {
                        return
                    }

                    $me.addClass ('selected').siblings ('.selected').removeClass ('selected')

                    // 重置数据
                    __restCacheData ()

                    __Cache[ 'type' ] = $me.attr ('data-type')

                    if (__Cache[ 'type' ]=='1'){
                        $('.block-search .col-12-8').css({
                            'width': '100%'
                        })
                        $('.block-search .col-12-4').css({
                            'display': 'none'
                        })
                    } else {
                        $('.block-search .col-12-8').css({
                            'width': '66.6666666666666666%'
                        })
                        $('.block-search .col-12-4').css({
                            'display': 'block'
                        })
                    }

                    $win.trigger ('load')
                },

                '.btn-trigger-confirm, .btn-trigger-offline-replacement-order': function(e){
                    e.preventDefault ()

                    var $me = $(this)

                    var html_fn = $.tmpl (tcb.trim ($ ('#JsMUnionOrderConfirmShipTpl').html ())),
                        html_st = html_fn ({
                            order_id : $me.attr('data-order-id') || ''
                        })

                    var dialogInst = tcb.showDialog(html_st, {
                        className : 'dialog-order-confirm-ship',
                        middle : true
                    })

                    bindFormConfirmShipSubmit(dialogInst['wrap'].find('form'))
                }
            })
        }

        function getOrderList (params, callback) {
            params = params || {}
            $.ajax ({
                type     : 'GET',
                url      : '/union/getOrderList',
                data     : params,
                dataType : 'json',
                timeout  : 5000,
                success  : function (res) {

                    if (res[ 'errno' ]) {
                        return $.dialog.toast (res[ 'errmsg' ], 2000)
                    }

                    var result = res.result,
                        renderData = {
                            type : params['type']||'1',
                            OrderList       : result.data,
                            OrderStatusDesc : result.order_status_desc
                        }
                    renderOrderList (renderData, $OrderList, params.page > 1 ? true : false)

                    $.isFunction (callback) && callback (result)
                },
                error    : function () {
                    $.dialog.toast ('系统错误，请刷新页面重试', 2000)
                }
            })
        }

        function renderOrderList (renderData, $target, is_append) {
            if (!($target && $target.length)) {
                return tcb.error ('$target不能为空')
            }
            var html_fn = $.tmpl (tcb.trim ($ ('#JsMUnionOrderListItemTpl').html ())),
                html_st = html_fn (renderData)

            if (is_append) {
                return $target.append (html_st)
            }
            return $target.html (html_st)
        }

        // 添加商品加载ing的html显示
        function addProductLoadingHtml ($target, is_prev) {
            $target = $target || $ ('body')
            var direction_class = is_prev ? 'list-loading-prev' : 'list-loading-next'

            var $Loading = $target.find ('.' + direction_class)
            if ($Loading && $Loading.length) {
                return $Loading
            }
            var
                img_html = '<img class="list-loading-img" src="https://p.ssl.qhimg.com/t01ba5f7e8ffb25ce89.gif">', loading_html = '<div class="list-loading ' + direction_class + '">' + img_html + '<span class="list-loading-txt">加载中...</span></div>'

            return is_prev ? $ (loading_html).prependTo ($target) : $ (loading_html).appendTo ($target)
        }

        // 移除商品加载ing的html
        function removeProductLoadingHtml ($target, is_prev) {
            $target = $target || $ ('body')
            var direction_class = is_prev ? 'list-loading-prev' : 'list-loading-next'

            var $Loading = $target.find ('.' + direction_class)
            if ($Loading && $Loading.length) {
                $Loading.remove ()
            }
        }

        // 添加商品 没有更多 的html显示
        function addProductNoMoreHtml ($target) {
            $target = $target || $ ('body')

            var $NoMore = $target.find ('.row-product-no-more')

            if ($NoMore && $NoMore.length) {
                return
            }
            var no_more_html = '<div style="padding: .12rem 0;color: #999;text-align: center;">抱歉。这里没有找到更多商品了~ </div>'

            $target.append (no_more_html)
        }

        function __restCacheData () {
            __Cache[ 'page' ] = 1
            __Cache[ 'maxPage' ] = 0
            __Cache[ 'is_loading' ] = false
            __Cache[ 'is_end' ] = false
            __Cache[ 'is_force_load' ] = true
        }

        function bindFormConfirmShipSubmit($Form){
            if (!($Form && $Form.length)) {
                return tcb.error ('$Form不能少')
            }

            $Form.on ('submit', function (e) {
                e.preventDefault ()

                var $me = $ (this)
                if (!validFormConfirmShip ($me)) {
                    return
                }

                $.ajax ({
                    type     : $me.attr ('method'),
                    url      : $me.attr ('action'),
                    data     : $me.serialize (),
                    dataType : 'json',
                    timeout  : 5000,
                    success  : function (res) {
                        if (res[ 'errno' ]) {
                            return $.dialog.toast (res[ 'errmsg' ], 2000)
                        }

                        window.location.href = window.location.href
                    },
                    error    : function (err) {
                        $.dialog.toast (err, 2000)
                    }
                })
            })
        }

        function validFormConfirmShip ($Form) {
            var flag = true,
                $focus = null

            var $imei = $Form.find ('[name="imei"]'),
                $customphone = $Form.find ('[name="customphone"]'),
                $price = $Form.find ('[name="price"]')

            if (!tcb.trim ($imei.val ())) {
                flag = false
                $focus = $focus || $imei
                $imei.shine4Error ()
            }
            if (!tcb.validMobile (tcb.trim ($customphone.val ()))) {
                flag = false
                $focus = $focus || $customphone
                $customphone.shine4Error ()
            }
            if ($price && $price.length && !tcb.trim ($price.val ())) {
                flag = false
                $focus = $focus || $price
                $price.shine4Error ()
            }

            if ($focus && $focus.length) {
                setTimeout (function () {
                    $focus.focus ()
                }, 300)
            }

            return flag
        }

        init ()
    })
} ()
