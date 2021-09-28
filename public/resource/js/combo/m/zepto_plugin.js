;/**import from `/resource/js/lib/m/zepto.detect.js` **/
//     Zepto.js
//     (c) 2010-2014 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  function detect(ua){
    var os = this.os = {}, browser = this.browser = {},
      webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
      android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
      osx = !!ua.match(/\(Macintosh\; Intel /),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      wp = ua.match(/Windows Phone ([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
      bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
      rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
      playbook = ua.match(/PlayBook/),
      chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
      firefox = ua.match(/Firefox\/([\d.]+)/),
      ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
      webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
      safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/)

    // Todo: clean this up with a better OS/browser seperation:
    // - discern (more) between multiple browsers on android
    // - decide if kindle fire in silk mode is android or not
    // - Firefox on Android doesn't specify the Android version
    // - possibly devide in os, device and browser hashes

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null
    if (wp) os.wp = true, os.version = wp[1]
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (bb10) os.bb10 = true, os.version = bb10[2]
    if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
    if (playbook) browser.playbook = true
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
    if (chrome) browser.chrome = true, browser.version = chrome[1]
    if (firefox) browser.firefox = true, browser.version = firefox[1]
    if (ie) browser.ie = true, browser.version = ie[1]
    if (safari && (osx || os.ios)) {browser.safari = true; if (osx) browser.version = safari[1]}
    if (webview) browser.webview = true

    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
      (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)))
    os.phone  = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 ||
      (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
      (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))))
  }

  detect.call($, navigator.userAgent)
  // make available to unit tests
  $.__detect = detect

})(Zepto)


;/**import from `/resource/js/lib/m/zepto.touch.js` **/
//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var touch = {},
    touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
    longTapDelay = 750,
    gesture

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >=
      Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  function isPrimaryTouch(event){
    return (event.pointerType == 'touch' ||
      event.pointerType == event.MSPOINTER_TYPE_TOUCH)
      && event.isPrimary
  }

  function isPointerEventType(e, type){
    return (e.type == 'pointer'+type ||
      e.type.toLowerCase() == 'mspointer'+type)
  }

  $(document).ready(function(){
    var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType

    if ('MSGesture' in window) {
      gesture = new MSGesture()
      gesture.target = document.body
    }

    $(document)
      .bind('MSGestureEnd', function(e){
        var swipeDirectionFromVelocity =
          e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null
        if (swipeDirectionFromVelocity) {
          touch.el.trigger('swipe')
          touch.el.trigger('swipe'+ swipeDirectionFromVelocity)
        }
      })
      .on('touchstart MSPointerDown pointerdown', function(e){
        if((_isPointerType = isPointerEventType(e, 'down')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        if (e.touches && e.touches.length === 1 && touch.x2) {
          // Clear out touch movement data if we have it sticking around
          // This can occur if touchcancel doesn't fire due to preventDefault, etc.
          touch.x2 = undefined
          touch.y2 = undefined
        }
        now = Date.now()
        delta = now - (touch.last || now)
        touch.el = $('tagName' in firstTouch.target ?
          firstTouch.target : firstTouch.target.parentNode)
        touchTimeout && clearTimeout(touchTimeout)
        touch.x1 = firstTouch.pageX
        touch.y1 = firstTouch.pageY
        if (delta > 0 && delta <= 250) touch.isDoubleTap = true
        touch.last = now
        longTapTimeout = setTimeout(longTap, longTapDelay)
        // adds the current touch contact for IE gesture recognition
        if (gesture && _isPointerType) gesture.addPointer(e.pointerId)
      })
      .on('touchmove MSPointerMove pointermove', function(e){
        if((_isPointerType = isPointerEventType(e, 'move')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        cancelLongTap()
        touch.x2 = firstTouch.pageX
        touch.y2 = firstTouch.pageY

        deltaX += Math.abs(touch.x1 - touch.x2)
        deltaY += Math.abs(touch.y1 - touch.y2)
      })
      .on('touchend MSPointerUp pointerup', function(e){
        if((_isPointerType = isPointerEventType(e, 'up')) &&
          !isPrimaryTouch(e)) return
        cancelLongTap()

        // swipe
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
            (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

          swipeTimeout = setTimeout(function() {
            if (touch.el){
              touch.el.trigger('swipe')
              touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
            }
            touch = {}
          }, 0)

        // normal tap
        else if ('last' in touch)
          // don't fire tap when delta position changed by more than 30 pixels,
          // for instance when moving to a point and back to origin
          if (deltaX < 30 && deltaY < 30) {
            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function() {

              // trigger universal 'tap' with the option to cancelTouch()
              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
              var event = $.Event('tap')
              event.cancelTouch = cancelAll
              // [by paper] fix -> "TypeError: 'undefined' is not an object (evaluating 'touch.el.trigger'), when double tap
              if (touch.el) touch.el.trigger(event)

              // trigger double tap immediately
              if (touch.isDoubleTap) {
                if (touch.el) touch.el.trigger('doubleTap')
                touch = {}
              }

              // trigger single tap after 250ms of inactivity
              else {
                touchTimeout = setTimeout(function(){
                  touchTimeout = null
                  if (touch.el) touch.el.trigger('singleTap')
                  touch = {}
                }, 250)
              }
            }, 0)
          } else {
            touch = {}
          }
          deltaX = deltaY = 0

      })
      // when the browser window loses focus,
      // for example when a modal dialog is shown,
      // cancel all ongoing events
      .on('touchcancel MSPointerCancel pointercancel', cancelAll)

    // scrolling the window indicates intention of the user
    // to scroll, not tap or swipe, so cancel all ongoing events
    $(window).on('scroll', cancelAll)
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
    'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
    $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
  })
})(Zepto)


;/**import from `/resource/js/lib/m/zepto.cookie.min.js` **/
// Zepto.cookie plugin
// 
// Copyright (c) 2010, 2012 
// @author Klaus Hartl (stilbuero.de)
// @author Daniel Lacy (daniellacy.com)
// 
// Dual licensed under the MIT and GPL licenses:
// http://www.opensource.org/licenses/mit-license.php
// http://www.gnu.org/licenses/gpl.html
(function(a){a.extend(a.fn,{cookie:function(b,c,d){var e,f,g,h;if(arguments.length>1&&String(c)!=="[object Object]"){d=a.extend({},d);if(c===null||c===undefined)d.expires=-1;return typeof d.expires=="number"&&(e=d.expires*24*60*60*1e3,f=d.expires=new Date,f.setTime(f.getTime()+e)),c=String(c),document.cookie=[encodeURIComponent(b),"=",d.raw?c:encodeURIComponent(c),d.expires?"; expires="+d.expires.toUTCString():"",d.path?"; path="+d.path:"",d.domain?"; domain="+d.domain:"",d.secure?"; secure":""].join("")}return d=c||{},h=d.raw?function(a){return a}:decodeURIComponent,(g=(new RegExp("(?:^|; )"+encodeURIComponent(b)+"=([^;]*)")).exec(document.cookie))?h(g[1]):null}})})(Zepto);

;/**import from `/resource/js/lib/m/zepto.fx.js` **/
//     Zepto.js
//     (c) 2010-2014 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
    document = window.document, testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    transform,
    transitionProperty, transitionDuration, transitionTiming, transitionDelay,
    animationName, animationDuration, animationTiming, animationDelay,
    cssReset = {}

  function dasherize(str) { return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + vendor.toLowerCase() + '-'
      eventPrefix = event
      return false
    }
  })

  transform = prefix + 'transform'
  cssReset[transitionProperty = prefix + 'transition-property'] =
  cssReset[transitionDuration = prefix + 'transition-duration'] =
  cssReset[transitionDelay    = prefix + 'transition-delay'] =
  cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
  cssReset[animationName      = prefix + 'animation-name'] =
  cssReset[animationDuration  = prefix + 'animation-duration'] =
  cssReset[animationDelay     = prefix + 'animation-delay'] =
  cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    speeds: { _default: 400, fast: 200, slow: 600 },
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback, delay){
    if ($.isFunction(duration))
      callback = duration, ease = undefined, duration = undefined
    if ($.isFunction(ease))
      callback = ease, ease = undefined
    if ($.isPlainObject(duration))
      ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
    if (duration) duration = (typeof duration == 'number' ? duration :
                    ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
    if (delay) delay = parseFloat(delay) / 1000
    return this.anim(properties, duration, ease, callback, delay)
  }

  $.fn.anim = function(properties, duration, ease, callback, delay){
    var key, cssValues = {}, cssProperties, transforms = '',
        that = this, wrappedCallback, endEvent = $.fx.transitionEnd,
        fired = false

    if (duration === undefined) duration = $.fx.speeds._default / 1000
    if (delay === undefined) delay = 0
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssValues[animationName] = properties
      cssValues[animationDuration] = duration + 's'
      cssValues[animationDelay] = delay + 's'
      cssValues[animationTiming] = (ease || 'linear')
      endEvent = $.fx.animationEnd
    } else {
      cssProperties = []
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
        else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

      if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
      if (duration > 0 && typeof properties === 'object') {
        cssValues[transitionProperty] = cssProperties.join(', ')
        cssValues[transitionDuration] = duration + 's'
        cssValues[transitionDelay] = delay + 's'
        cssValues[transitionTiming] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, wrappedCallback)
      } else
        $(this).unbind(endEvent, wrappedCallback) // triggered by setTimeout

      fired = true
      $(this).css(cssReset)
      callback && callback.call(this)
    }
    if (duration > 0){
      this.bind(endEvent, wrappedCallback)
      // transitionEnd is not always firing on older Android phones
      // so make sure it gets fired
      setTimeout(function(){
        if (fired) return
        wrappedCallback.call(that)
      }, (duration * 1000) + 25)
    }

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft

    this.css(cssValues)

    if (duration <= 0) setTimeout(function() {
      that.each(function(){ wrappedCallback.call(this) })
    }, 0)

    return this
  }

  testEl = null
})(Zepto)


;/**import from `/resource/js/lib/m/zepto.bindevent.js` **/
(function($){
	$.bindEvent = function(el, configs){
        el = $(el);
        for(var name in configs){
            var value = configs[name];
            if (typeof value == 'function') {
                var obj = {};
                obj.click = value;
                value = obj;
            };
            for(var type in value){
                el.delegate(name, type, value[type]);
            }
        }
    }
})(Zepto);

;/**import from `/resource/js/lib/m/zepto.strformat.js` **/
/**
 * 对目标字符串进行格式化
 * @name $.strFormat
 * @function
 * @grammar $.strFormat(source, opts)
 * @param {string} source 目标字符串
 * @param {Object|string...} opts 提供相应数据的对象或多个字符串
 * @remark
 * 
opts参数为“Object”时，替换目标字符串中的#{property name}部分。<br>
opts为“string...”时，替换目标字符串中的#{0}、#{1}...部分。
		
 *             
 * @returns {string} 格式化后的字符串
 */
(function($){
    $.strFormat = function(source, opts){
        source = String(source);
        var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
        if(data.length){
            data = data.length == 1 ? 
                /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
                (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
                : data;
            return source.replace(/#\{(.+?)\}/g, function (match, key){
                var replacer = data[key];
                // chrome 下 typeof /a/ == 'function'
                if('[object Function]' == toString.call(replacer)){
                    replacer = replacer(key);
                }
                return ('undefined' == typeof replacer ? '' : replacer);
            });
        }
        return source;
    }
})(Zepto);


;/**import from `/resource/js/lib/m/zepto.loading.js` **/
(function($){
	$.loading = function(content){
		var loading = $('.loading-box');

		if(loading.length == 0){
			loading = $('<div class="loading-box"></div>').css({
				'position' : 'fixed',
				'top' : 0,
				'right' : 0,
				'bottom' : 0,
				'left' : 0,
				'z-index' : 999999,
				'background-color'  : 'rgba(0,0,0, 0.2)',
				'padding' : '40% 10%'
			}).append( $('<div class="loading-content"> '+(content ||'加载中...')+'</div>').css({
				'font-size' : 18,
				'text-align' : 'center',
				'border-radius' : '10px',
				'background-color' : 'rgba(0,0,0, 0.7)',
				'color' : '#fff',
				'padding' : '50px 0'
			}) ).appendTo('body');

			$('<div class="loading-anim"></div>').prependTo(loading.find('.loading-content')).css({
				'width' : 32,
				'height' : 32,
				'display' :'inline-block',
				'vertical-align' : 'middle',
				'background' : 'url(https://p.ssl.qhimg.com/t015f3d5ddf0e5a1b71.png) no-repeat center',
				'background-size' : '32px'
			});			
		}

		loading.find('.loading-anim').css({			
			'-webkit-transform' : 'rotate(0)',
			'transform' : 'rotate(0)'
		});

		setTimeout(function(){ loading.find('.loading-anim').animate( { 'rotate' : '360000deg' }, 1000*1400 ) }, 100);

		return loading;
	}
})(Zepto);

;/**import from `/resource/js/lib/m/zepto.tmpl.js` **/
/*简单前端模板，改写自QWrap*/
(function($) {
	var StringH = {
		tmpl: (function() {
			var tmplFuns={};
			var sArrName = "sArrCMX",
				sLeft = sArrName + '.push("';
			var tags = {
				'=': {
					tagG: '=',
					isBgn: 1,
					isEnd: 1,
					sBgn: '",$.StringH.encode4HtmlValue(',
					sEnd: '),"'
				},
				'js': {
					tagG: 'js',
					isBgn: 1,
					isEnd: 1,
					sBgn: '");',
					sEnd: ';' + sLeft
				},
				'js': {
					tagG: 'js',
					isBgn: 1,
					isEnd: 1,
					sBgn: '");',
					sEnd: ';' + sLeft
				},
				//任意js语句, 里面如果需要输出到模板，用print("aaa");
				'if': {
					tagG: 'if',
					isBgn: 1,
					rlt: 1,
					sBgn: '");if',
					sEnd: '{' + sLeft
				},
				//if语句，写法为{if($a>1)},需要自带括号
				'elseif': {
					tagG: 'if',
					cond: 1,
					rlt: 1,
					sBgn: '");} else if',
					sEnd: '{' + sLeft
				},
				//if语句，写法为{elseif($a>1)},需要自带括号
				'else': {
					tagG: 'if',
					cond: 1,
					rlt: 2,
					sEnd: '");}else{' + sLeft
				},
				//else语句，写法为{else}
				'/if': {
					tagG: 'if',
					isEnd: 1,
					sEnd: '");}' + sLeft
				},
				//endif语句，写法为{/if}
				'for': {
					tagG: 'for',
					isBgn: 1,
					rlt: 1,
					sBgn: '");for',
					sEnd: '{' + sLeft
				},
				//for语句，写法为{for(var i=0;i<1;i++)},需要自带括号
				'/for': {
					tagG: 'for',
					isEnd: 1,
					sEnd: '");}' + sLeft
				},
				//endfor语句，写法为{/for}
				'while': {
					tagG: 'while',
					isBgn: 1,
					rlt: 1,
					sBgn: '");while',
					sEnd: '{' + sLeft
				},
				//while语句,写法为{while(i-->0)},需要自带括号
				'/while': {
					tagG: 'while',
					isEnd: 1,
					sEnd: '");}' + sLeft
				} //endwhile语句, 写法为{/while}
			};
			return function(sTmpl, opts) {
				var fun  = tmplFuns[sTmpl];
				if (!fun) {
					var N = -1,
						NStat = []; //语句堆栈;
					var ss = [
						[/\{strip\}([\s\S]*?)\{\/strip\}/g, function(a, b) {
							return b.replace(/[\r\n]\s*\}/g, " }").replace(/[\r\n]\s*/g, "");
						}],
						[/\\/g, '\\\\'],
						[/"/g, '\\"'],
						[/\r/g, '\\r'],
						[/\n/g, '\\n'], //为js作转码.
						[
							/\{[\s\S]*?\S\}/g, //js里使用}时，前面要加空格。
							function(a) {
								a = a.substr(1, a.length - 2);
								for (var i = 0; i < ss2.length; i++) {a = a.replace(ss2[i][0], ss2[i][1]); }
								var tagName = a;
								if (/^(=|.\w+)/.test(tagName)) {tagName = RegExp.$1; }
								var tag = tags[tagName];
								if (tag) {
									if (tag.isBgn) {
										var stat = NStat[++N] = {
											tagG: tag.tagG,
											rlt: tag.rlt
										};
									}
									if (tag.isEnd) {
										if (N < 0) {throw new Error("Unexpected Tag: " + a); }
										stat = NStat[N--];
										if (stat.tagG != tag.tagG) {throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName); }
									} else if (!tag.isBgn) {
										if (N < 0) {throw new Error("Unexpected Tag:" + a); }
										stat = NStat[N];
										if (stat.tagG != tag.tagG) {throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName); }
										if (tag.cond && !(tag.cond & stat.rlt)) {throw new Error("Unexpected Tag: " + tagName); }
										stat.rlt = tag.rlt;
									}
									return (tag.sBgn || '') + a.substr(tagName.length) + (tag.sEnd || '');
								} else {
									return '",(' + a + '),"';
								}
							}
						]
					];
					var ss2 = [
						[/\\n/g, '\n'],
						[/\\r/g, '\r'],
						[/\\"/g, '"'],
						[/\\\\/g, '\\'],
						[/\$(\w+)/g, 'opts["$1"]'],
						[/print\(/g, sArrName + '.push(']
					];
					for (var i = 0; i < ss.length; i++) {
						sTmpl = sTmpl.replace(ss[i][0], ss[i][1]);
					}
					if (N >= 0) {throw new Error("Lose end Tag: " + NStat[N].tagG); }
					sTmpl = sTmpl.replace(/##7b/g,'{').replace(/##7d/g,'}').replace(/##23/g,'#'); //替换特殊符号{}#
					sTmpl = 'var ' + sArrName + '=[];' + sLeft + sTmpl + '");return ' + sArrName + '.join("");';
					//alert('转化结果\n'+sTmpl);
					tmplFuns[sTmpl] = fun = new Function('opts', sTmpl);
				}
				if (arguments.length > 1) {return fun(opts); }
				return fun;
			};
		}()),
		encode4Html: function(s) {
			var el = document.createElement('pre'); //这里要用pre，用div有时会丢失换行，例如：'a\r\n\r\nb'
			var text = document.createTextNode(s);
			el.appendChild(text);
			return el.innerHTML;
		},
		encode4HtmlValue: function(s) {
     		return StringH.encode4Html(s).replace(/"/g, "&quot;").replace(/'/g, "&#039;");
		}
	};

	$.StringH = StringH;
	$.tmpl = $.StringH.tmpl;
})(Zepto);


;/**import from `/resource/js/lib/m/zepto.queryurl.js` **/
(function($) {
	function queryUrl(url, key) {
		url = url.replace(/^[^?=]*\?/ig, '').split('#')[0];	//去除网址与hash信息
		var json = {};
		//考虑到key中可能有特殊符号如“[].”等，而[]却有是否被编码的可能，所以，牺牲效率以求严谨，就算传了key参数，也是全部解析url。
		url.replace(/(^|&)([^&=]+)=([^&]*)/g, function (a, b, key , value){
			//对url这样不可信的内容进行decode，可能会抛异常，try一下；另外为了得到最合适的结果，这里要分别try
			try {
				key = decodeURIComponent(key);
			} catch(e) {}
			try {
				value = decodeURIComponent(value);
			} catch(e) {}
			if (!(key in json)) {
				json[key] = /\[\]$/.test(key) ? [value] : value; //如果参数名以[]结尾，则当作数组
			}
			else if (json[key] instanceof Array) {
				json[key].push(value);
			}
			else {
				json[key] = [json[key], value];
			}
		});
		return key ? json[key] : json;
	}

	$.queryUrl = queryUrl;
})(Zepto);


;/**import from `/resource/js/lib/m/zepto.dialog.js` **/
;(function ($) {

    var Dialog = (function () {
        function showMask() {
            return setZIndex($('<div class="bang-ui-dialog"></div>').appendTo('body'))
        }

        function show(txt) {
            var $box = showMask()
            var $cntBox = $('<div class="dialog-content"><span class="close iconfont icon-close">x</span><div class="dialog-txt">' + txt + '</div></div>').appendTo($box)

            $cntBox.find('.close').on('click', function (e) {
                e.preventDefault()
                hide()
            })
            return $box
        }

        function showBox(cnt) {
            var $box = showMask()
            return $box.html(cnt)
        }

        function alert(txt, callback, options) {
            options = options || {}
            var $box = show('<div>' + txt + '</div>' +
                '<div class="btn-box btn-box-alert">' +
                '<input class="ui-btn" type="button" value="' + (options.btn || '确定') + '"/>' +
                '</div>')
            var $close = $box.find('.close')
            var $btn = $box.find('.btn-box .ui-btn')
            if (options.className) {
                $box.addClass(options.className)
            }
            if (options.lock) {
                $btn.addClass('ui-btn-disabled')
                var text = $btn.val()
                var duration = parseInt(options.lock, 10) || 3
                $btn.val(text + '（' + duration + 's）')
                setTimeout(function countdown() {
                    duration--
                    if (duration > 0) {
                        $btn.val(text + '（' + duration + 's）')
                        setTimeout(countdown, 1000)
                    } else {
                        $btn.removeClass('ui-btn-disabled').val(text)
                    }
                }, 1000)
            }
            $close.hide()
            $btn.on('click', function () {
                var $me = $(this)
                if ($me.hasClass('ui-btn-disabled')) {
                    return
                }
                if (typeof (callback) == 'function') {
                    (callback() !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            return $box
        }

        function confirm(txt, succCallback, failCallback, options) {
            options = options || {}
            var $box = show('<div>' + txt + '</div>' +
                '<div class="btn-box btn-box-confirm">' +
                '<input class="ui-btn ui-btn-fail" type="button" value="' + (options.textCancel || '取消') + '"/>' +
                '<input class="ui-btn ui-btn-succ" type="button" value="' + (options.textConfirm || '确定') + '"/></div>')
            var $close = $box.find('.close')
            var $btn = $box.find('.btn-box .ui-btn')
            var $btnCancel = $btn.filter('.ui-btn-fail')
            var $btnConfirm = $btn.filter('.ui-btn-succ')

            if (options.className) {
                $box.addClass(options.className)
            }
            if (options.lock) {
                $btnConfirm.addClass('ui-btn-disabled')
                var text = $btnConfirm.val()
                var duration = parseInt(options.lock, 10) || 3
                $btnConfirm.val(text + '（' + duration + 's）')
                setTimeout(function countdown() {
                    duration--
                    if (duration > 0) {
                        $btnConfirm.val(text + '（' + duration + 's）')
                        setTimeout(countdown, 1000)
                    } else {
                        $btnConfirm.removeClass('ui-btn-disabled').val(text)
                    }
                }, 1000)
            }
            $close.hide()

            $btnConfirm.on('click', function () {
                var $me = $(this)
                if ($me.hasClass('ui-btn-disabled')) {
                    return
                }

                if (typeof succCallback === 'function') {
                    (succCallback() !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            $btnCancel.on('click', function () {
                if (typeof failCallback === 'function') {
                    (failCallback() !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            return $box
        }

        function prompt(txt, succCallback, failCallback) {

            var $box = show('<div>' + txt + '</div><div class="ui-txt-input"><input type="text" /></div><div class="btn-box btn-box-prompt"><input class="ui-btn ui-btn-fail" type="button" value=" 取消 "  /><input class="ui-btn ui-btn-succ" type="button" value=" 确定 "  /></div>')
            $box.find('.close').hide()

            var btns = $box.find('.btn-box .ui-btn')

            var txtIpt = $box.find('.ui-txt-input input')

            btns.filter('.ui-btn-succ').on('click', function () {
                if (typeof (succCallback) == 'function') {
                    (succCallback(txtIpt.val() || '') !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            btns.filter('.ui-btn-fail').on('click', function () {
                if (typeof (failCallback) == 'function') {
                    (failCallback() !== false) && hide($box)
                } else {
                    hide($box)
                }
            })

            return $box
        }

        function toast(txt, time) {
            // 判断当前页面是否已存在 toast
            var $eleToast = $('body').find('.bang-ui-dialog-toast') || []
            if ($eleToast.length > 0) return

            var $box = setZIndex($('<div class="bang-ui-dialog-toast"><span>' + txt + '</span></div>').appendTo('body'))

            setTimeout(function () { $box.animate({'opacity': '0'}, 300, function () { $(this).remove() }) }, time || 1500)

            return $box
        }

        function popup(txt) {
            var $box = showMask()

            var popup = $('<div class="bang-ui-dialog-popup">' + txt + '</div>').appendTo($box)

            setTimeout(function () {
                popup.css({
                    '-webkit-transform': 'translateY(0)',
                    'transform': 'translateY(0)'
                })
            }, 50)

            $box.on('click', function (e) {
                popup.animate({'translateY': '100%'}, 300, function () {
                    try { $box.remove() } catch (ex) {}
                })
            })

            return $box
        }

        function hide($box) {
            if (!($box && $box.length)) {
                $box = $('.bang-ui-dialog')
            }
            $box.remove()
        }

        return {
            'show': show,
            'showBox': showBox,
            'hide': hide,
            'alert': alert,
            'confirm': confirm,
            'prompt': prompt,
            'toast': toast,
            'popup': popup
        }
    })()

    function setZIndex($el) {
        if (typeof tcb !== 'undefined' && tcb.zIndex) {
            $el.css({'z-index': tcb.zIndex()})
        }
        return $el
    }

    $.dialog = Dialog

})(Zepto)


;/**import from `/resource/js/lib/m/zepto.erroranimate.js` **/
(function ($) {
    function errorAnimate (obj) {
        obj = $ (obj)

        obj.each (function () {
            var
                me = this,
                orig_background_color = me.style.backgroundColor

            $ (me).css ('background-color', '#f00').animate ({ 'background-color' : '#fff' }, 1200, 'cubic-bezier(.28,.2,.51,1.15)', function () {
                me.style.backgroundColor = orig_background_color || ''
            })
        })
    }

    $.errorAnimate = errorAnimate
    $.fn.shine4Error = function () {
        $.errorAnimate (this)

        return $ (this)
    }
}) (Zepto);

;/**import from `/resource/js/lib/m/zepto.iptclear.js` **/
(function($){
	$.fn.iptClear = function(plucss){		
		var me = $(this);

		if( this[0].tagName.toLowerCase() != 'input' ){
			return;
		}

		var ic = $('<span class="ui-ipt-clear"></span>').css({
			'display': 'none',
			'position' : 'absolute',			
			'top' : (me.height() - 20)/2,
			'right' : -2 ,
			'width': 20,
			'height': 20,
			'background': 'url(https://p.ssl.qhimg.com/t011e6c32277aa5fcfd.png) no-repeat center',
			'background-size' : '12px'
		}).on('click', function(){
			me.val('');
			ic.hide();
		});

		try{ ic.css(plucss); }catch(ex){}

		me.after( ic ).on('focus input keyup', function(){
			if(me.val().length > 0){
				ic.show();
			}
		}).on('blur', function(){
			if(me.val().length == 0){
				ic.hide();
			}
		});

		return me;
	}
})(Zepto);

;/**import from `/resource/js/lib/m/zepto.scroll.js` **/
/* Author:
    Max Degterev @suprMax
*/

;(function($) {
  var DEFAULTS = {
    endY: $.os.android ? 1 : 0,
    duration: 200,
    updateRate: 15
  };

  var interpolate = function (source, target, shift) {
    return (source + (target - source) * shift);
  };

  var easing = function (pos) {
    return (-Math.cos(pos * Math.PI) / 2) + .5;
  };

  var scroll = function(settings) {
    var options = $.extend({}, DEFAULTS, settings);

    if (options.duration === 0) {
      window.scrollTo(0, options.endY);
      if (typeof options.callback === 'function') options.callback();
      return;
    }

    var startY = window.pageYOffset,
        startT = Date.now(),
        finishT = startT + options.duration;

    var animate = function() {
      var now = Date.now(),
          shift = (now > finishT) ? 1 : (now - startT) / options.duration;

      window.scrollTo(0, interpolate(startY, options.endY, easing(shift)));

      if (now < finishT) {
        setTimeout(animate, options.updateRate);
      }
      else {
        if (typeof options.callback === 'function') options.callback();
      }
    };

    animate();
  };

  var scrollNode = function(settings) {
    var options = $.extend({}, DEFAULTS, settings);

    if (options.duration === 0) {
      this.scrollTop = options.endY;
      if (typeof options.callback === 'function') options.callback();
      return;
    }

    var startY = this.scrollTop,
        startT = Date.now(),
        finishT = startT + options.duration,
        _this = this;

    var animate = function() {
      var now = Date.now(),
          shift = (now > finishT) ? 1 : (now - startT) / options.duration;

      _this.scrollTop = interpolate(startY, options.endY, easing(shift));

      if (now < finishT) {
        setTimeout(animate, options.updateRate);
      }
      else {
        if (typeof options.callback === 'function') options.callback();
      }
    };

    animate();
  };

  $.scrollTo = scroll;

  $.fn.scrollTo = function() {
    if (this.length) {
      var args = arguments;
      this.forEach(function(elem, index) {
        scrollNode.apply(elem, args);
      });
    }
  };
}(Zepto));


;/**import from `/resource/js/lib/m/zepto.datetime.js` **/
(function($){
    var DateTime = function(el, config){
        var styleCss = '.ui-datetime { position: absolute; left: 0; z-index: 9000; margin: 0 auto; max-width: 1080px; min-width: 320px; background: #f8f8f8; box-shadow: 0 -.02rem .25rem #ccc; } .ui-datetime .dt-table { display: table; width: 100%; } .ui-datetime .date-box { width: 60%; display: table-cell } .ui-datetime .time-box { width: 40%; display: table-cell } .ui-datetime .date-item, .ui-datetime .time-item { display: block; text-align: center; white-space: nowrap; word-break: keep-all; cursor: pointer; margin: 0 5%; font-size: .12rem; height: .40rem; line-height: .40rem; color: #666; } .ui-datetime .date-curr, .ui-datetime .time-curr { color: #0b7; font-size: .14rem; } .ui-datetime .date-disabled { display: none; } .ui-datetime .time-disabled { display: none; background: #eee; color: #ccc; cursor: not-allowed; } .ui-datetime .date-tit, .ui-datetime .time-tit { font-size: .12rem; line-height: .36rem; text-align: center; background: #fff; border-bottom: 2px solid rgba(149, 192, 172, 0.3); color: #333; } .ui-datetime .icon-date { margin-right: .02rem; display: inline-block; vertical-align: middle; width: .24rem; height: .24rem; background: url(https://p.ssl.qhimg.com/t01fa50437b3f1ab3aa.jpg) no-repeat 0 -.03rem; background-size: .24rem; } .ui-datetime .icon-time { margin-right: .02rem; display: inline-block; vertical-align: middle; width: .24rem; height: .24rem; background: url(https://p.ssl.qhimg.com/t01fa50437b3f1ab3aa.jpg) no-repeat 0 -.32rem; background-size: .24rem; } .ui-datetime .item-select { height: 1.20rem; overflow: hidden; position: relative; } .ui-datetime .item-window { position: absolute; left: 0; top: 0; right: 0; bottom: 0; background: url("https://p.ssl.qhimg.com/t013ee84c60181f2d26.png") repeat-x 0 center; background-size: auto 100%; z-index: 10; } .ui-datetime .item-list { margin: .40rem 0; } .ui-datetime .i-w-line { display: block; height: 33%; margin: 0 .10rem; border-bottom: 1px solid rgba(208, 208, 208, 0.3); } .ui-datetime .ctrl-box { border-top: 1px solid rgba(208, 208, 208, 0.3); background: #fff } .ui-datetime .ctrl-item { display: inline-block; width: 50%; line-height: .4rem; font-size: .12rem; text-align: center; color: #778c82; } .ui-datetime .ctrl-item:active { background-color: #f8f8f8; } .ui-datetime .ctrl-item:first-child { box-shadow: -1px 0 0 rgba(208, 208, 208, 0.3) inset; }';

        this.box = null;
        this.el = null;
        this.conf = $.extend({
            remote: '',
            remoteDateTime: [],
            dateList : [ {'text' : (new Date().getMonth()+1) +'-'+ (new Date().getDate()), 'value':(new Date().getMonth()+1) +'-'+ (new Date().getDate())} ],
            timeList : [{'text':'09:00', 'value':'09:00'},
                {'text':'10:00', 'value':'10:00'},
                {'text':'11:00', 'value':'11:00'},
                {'text':'12:00', 'value':'12:00'},
                {'text':'13:00', 'value':'13:00'},
                {'text':'14:00', 'value':'14:00'},
                {'text':'15:00', 'value':'15:00'},
                {'text':'16:00', 'value':'16:00'},
                {'text':'17:00', 'value':'17:00'},
                {'text':'18:00', 'value':'18:00'}],
            onSelect : function(){ },
            noStyle : false
        }, config);

        this.init = function(el, config){
            el = $(el);
            this.el = el;

            if(el.attr('type') != 'text'){
                return;
            }

            if (!this.conf.noStyle){
                $('<style type="text/css"></style>').text(styleCss).appendTo('head');
            }

            var _this = this;
            _this.__create(function(wBox){

                el.on('focus', function(){
                    this.blur();

                    _this.show();
                });

                //$(document.body).on('click', function(e){
                //    if( e.target != _this.el[0] && e.target != _this.box[0] && !$.contains(_this.box[0], e.target) ){
                //        _this.hide();
                //    }
                //});

                wBox.delegate('.date-item', 'click', function(){
                    var $me = $(this);

                    $(this).addClass('date-curr').siblings('.date-curr').removeClass('date-curr');
                    wBox.find('.time-item').removeClass('time-disabled');

                    var today = DateTime.getDateList(0, 1)[0],
                        now = (new Date().getHours()),
                        $timelist = wBox.find('.time-item-list');

                    if (_this.conf.remote && _this.conf.remoteTime) {
                        var $cur = $timelist.find('.time-curr'),
                            cur_time = '';
                        if ($cur && $cur.length) {
                            cur_time = $cur.attr('data-value');
                        }
                        // 远程获取的数据
                        var timelist = _this.conf.remoteTime[$me.attr('data-value')];

                        $timelist.html( __genTimeHtml(timelist) );

                        $timelist.find('.time-item').each(function(){
                            var w_this = $(this);
                            if( w_this.attr('data-value') == cur_time ){
                                $timelist.find('.time-item').removeClass('time-curr');
                                w_this.addClass('time-curr');

                                var pnode = w_this.parents('.item-select'),
                                    unitH = pnode.height()/3;
                                var scrollY = $timelist.find('.time-item').filter(function(){return !$(this).hasClass('time-disabled');}).indexOf(w_this[0])*unitH;
                                $timelist.css('-webkit-transform', 'translateY(-'+scrollY+'px)');
                            }
                        });
                    }

                    if( $(this).attr('data-value') == today.value ){//如果选的是今天，就要禁止掉已经过期的时间点
                        wBox.find('.time-item').removeClass('time-curr');
                        wBox.find('.time-item').each(function(){
                            var w_this = $(this);
                            if( w_this.attr('data-value').split(':')[0]-0 <= now ){
                                w_this.addClass('time-disabled');
                            }
                        });

                        $timelist.animate({'translateY': 0 + 'px'}, 300, 'ease-out').data('scrollY',0);
                        wBox.find('.time-item').filter(function(){ if(!$(this).hasClass('time-disabled')) return $(this);  }).eq(0).trigger('click');
                    }

                    if( parseInt( _getTransY($timelist) ) == 0 ){
                        wBox.find('.time-item').filter(function(){ if(!$(this).hasClass('time-disabled')) return $(this);  }).eq(0).trigger('click');
                    }
                });

                wBox.delegate('.time-item', 'click', function(){
                    if( $(this).hasClass('time-disabled') ){
                        return false;
                    }

                    $(this).addClass('time-curr').siblings('.time-curr').removeClass('time-curr');
                    /*if( _this.box.find('.date-curr').length>0 ){
                     _this.select();
                     }*/
                });

                //touch start
                wBox.find('.item-window').on('touchstart', function(e) {
                    e.preventDefault();

                    var startY = e.touches[0].clientY;

                    var list = $(this).parents('.item-select').find('.item-list');

                    list.data('scrollY', parseInt( _getTransY(list)))
                        .data('startY', startY)
                        .data('isMove', 'yes')
                        .data('startTime', new Date().getTime());
                });

                //touch move
                wBox.find('.item-window').on('touchmove', function(e) {
                    e.preventDefault();

                    var list = $(this).parents('.item-select').find('.item-list');

                    if( list.data('isMove') != 'yes'){
                        return false;
                    }

                    var startY = list.data('startY'),
                        endY = e.touches[0].clientY,
                        detY = endY - startY;

                    _moveList(this, detY);

                }, {passive : false});

                //touch end
                wBox.find('.item-window').on('touchend', function(e) {
                    e.preventDefault();

                    var list = $(this).parents('.item-select').find('.item-list');

                    if( list.data('isMove') != 'yes'){
                        return false;
                    }

                    _moveEnd(this, (_getTransY(list)-list.data('scrollY') ), (new Date().getTime() - list.data('startTime') ));

                    list.data('scrollY', 0).data('startY', 0).data('isMove', '').data('startTime', 0);

                });

                //取消关闭
                wBox.delegate('.ctrl-cancle', 'click', function(){
                    _this.hide();
                });
                //确认选择
                wBox.delegate('.ctrl-ok', 'click', function(){
                    _this.select();
                });

                //默认选择第一项
                wBox.find('.date-item').filter(function(){ if(!$(this).hasClass('date-disabled')) return $(this);  }).eq(0).trigger('click');
                wBox.find('.time-item').filter(function(){ if(!$(this).hasClass('time-disabled')) return $(this);  }).eq(0).trigger('click');
            });

            function _moveList(obj, detY){
                var pnode = $(obj).parents('.item-select'),
                    unitH = pnode.height()/3,
                    list = pnode.find('.item-list'),
                    scrollY = parseInt(list.data('scrollY')||0),
                    children = list.find('.i-item').filter(function(){
                        if (pnode.hasClass('date-select')) {
                            // 日期
                            return !$(this).hasClass('date-disabled');
                        }
                        else if(pnode.hasClass('time-select')) {
                            // 时间
                            return !$(this).hasClass('time-disabled');
                        }
                    }),
                    maxTY = (children.length - 1) * unitH,
                    scrollY = (scrollY+detY);


                if(scrollY > 0 || scrollY< (0-maxTY)){
                    return;
                }

                //list.animate({'translateY': scrollY + 'px'}, 0);
                list.css('-webkit-transform', 'translateY('+scrollY+'px)');
                children.eq( Math.round(Math.abs(scrollY/unitH)) ).trigger('click');
            }

            function _moveEnd(obj, detY, detT){
                var pnode = $(obj).parents('.item-select'),
                    unitH = pnode.height()/3,
                    list = pnode.find('.item-list'),
                    children = list.find('.i-item').filter(function(){
                        if (pnode.hasClass('date-select')) {
                            // 日期
                            return !$(this).hasClass('date-disabled');
                        }
                        else if(pnode.hasClass('time-select')) {
                            // 时间
                            return !$(this).hasClass('time-disabled');
                        }
                    }),
                    maxTY = (children.length - 1) * unitH,
                    endTop = parseInt( _getTransY(list) );

                var lastTop =  (  Math.round(endTop / unitH) )*unitH;

                var ZN_NUM = 0.25;
                if( Math.abs(detY / detT)>ZN_NUM ){//惯性
                    var pastNum = ((detY / detT) / ZN_NUM);

                    var morePastY = Math.floor( pastNum * unitH );

                    lastTop += morePastY;

                    lastTop = Math.min(Math.max( 0-maxTY, lastTop), 0);

                    lastTop = (  Math.round(lastTop / unitH) )*unitH;

                    list.animate({'translateY': lastTop + 'px'}, 300-0+Math.ceil(Math.abs(pastNum))*100, 'ease-out');
                }else{
                    list.animate({'translateY': lastTop + 'px'}, 160, 'linear');
                }


                children.eq( Math.floor(Math.abs(lastTop/unitH)) ).trigger('click');
            }

            function _getTransY(obj){
                var trans = $(obj).css('transform') || $(obj).css('-webkit-transform') || $(obj)[0].style.webkitTransform;
                var transY = 0;
                if( trans.indexOf('translateY')>-1){
                    transY = trans.replace(/translateY\((\-?[\d\.]+)px\)/, function(m, n){ return n||0});
                }
                if(trans.indexOf('matrix')>-1){
                    transY = trans.replace(/matrix\(\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*\-?[\d\.]+,\s*(\-?[\d\.]+)\)/, function(m, n){ return n||0});
                }

                return transY;
            }
        };

        this.__create = function(callback){
            var me = this;
            var remote = me.conf.remote;
            if (remote) {

                me.getRemoteDateTime(function(remoteDateTime){
                    remoteDateTime = remoteDateTime || [];
                    var dateTimeHtml = __genDateTimeHtml(remoteDateTime, me.conf.remoteTime);
                    var date_str = dateTimeHtml[0],
                        time_str = dateTimeHtml[1];

                    var date_time_str = [];
                    date_time_str.push('<div class="ui-datetime"><div class="dt-table"><div class="date-box"><div class="date-tit"><span class="icon-date"> </span>日期</div>');
                    date_time_str.push('<div class="item-select date-select"><div class="item-window" data-for="date-select"><span class="i-w-line"></span><span class="i-w-line"></span></div><div class="item-list date-item-list">');
                    date_time_str.push(date_str);
                    date_time_str.push('</div></div>');
                    date_time_str.push('</div><div class="time-box"><div class="time-tit"><span class="icon-time"> </span>时间</div>');
                    date_time_str.push('<div class="item-select time-select"><div class="item-window" data-for="time-select"><span class="i-w-line"></span><span class="i-w-line"></span></div><div class="item-list time-item-list">');
                    date_time_str.push(time_str);
                    date_time_str.push('</div></div>');
                    date_time_str.push('</div></div><div class="ctrl-box"><span class="ctrl-item ctrl-cancle">取消</span><span class="ctrl-item ctrl-ok">确定</span></div></div>');
                    date_time_str = date_time_str.join('');
                    var wBox = $(date_time_str).appendTo($('body')).hide();
                    me.box = wBox;
                    if (typeof callback === 'function') {
                        callback(wBox)
                    }
                });
            } else {
                var dlist = this.conf.dateList;
                var tlist = this.conf.timeList;
                if( new Date().getTime() > Date.parse( dlist[0].value +' '+ tlist[tlist.length-1].value) ){
                    dlist.shift();
                }

                var dstr = '<div class="item-select date-select"><div class="item-window" data-for="date-select"><span class="i-w-line"></span><span class="i-w-line"></span></div><div class="item-list date-item-list">';
                for(var i=0, n=dlist.length; i<n; i++){
                    dstr += '<span class="i-item date-item '+(i==0? 'date-curr' : '')+'" data-value="'+dlist[i].value+'">'+dlist[i].text+'</span>';
                }
                dstr += '</div></div>';

                var tstr = '<div class="item-select time-select"><div class="item-window" data-for="time-select"><span class="i-w-line"></span><span class="i-w-line"></span></div><div class="item-list time-item-list">';
                for(var i=0, n=tlist.length; i<n; i++){
                    tstr += '<span class="i-item time-item '+(i==0? 'time-curr' : '')+'" data-value="'+tlist[i].value+'">'+tlist[i].text+'</span>';
                }
                tstr += '</div></div>';

                var wBox = $('<div class="ui-datetime"><div class="dt-table"><div class="date-box"><div class="date-tit"><span class="icon-date"> </span>日期</div>'+dstr+'</div><div class="time-box"><div class="time-tit"><span class="icon-time"> </span>时间</div>'+tstr+'</div></div><div class="ctrl-box"><span class="ctrl-item ctrl-cancle">取消</span><span class="ctrl-item ctrl-ok">确定</span></div></div>').appendTo($('body')).hide();
                me.box = wBox;
                if (typeof callback === 'function') {
                    callback(wBox)
                }
            }
        };

        // 生成date和time的html
        function __genDateTimeHtml(remoteDateTime, remoteTime) {
            remoteDateTime = remoteDateTime || []

            var date_str = '',
                time_str = '',
                date_curr = ''

            $.each(remoteDateTime, function(i, item){
                // 日期
                var
                    date = item[ 'date' ],
                    ext_class = ''

                if (date[ 'is_able' ]) {
                    if (!date_curr) {
                        ext_class += ' date-curr'
                        date_curr = date['value']
                    }
                } else {
                    ext_class += ' date-disabled'
                }
                date_str += '<span class="i-item date-item' + ext_class + '" data-value="' + date[ 'value' ] + '">' + date[ 'text' ] + '</span>'
                remoteTime[ date[ 'value' ] ] = item[ 'time' ]

                if (date_curr) {
                    // 时间
                    time_str = __genTimeHtml (remoteTime[ date_curr ])
                }
            })

            return [date_str, time_str];
        }
        // 生成time的html
        function __genTimeHtml(timelist) {
            timelist = timelist || [];
            var time_html = '';
            if (timelist.length){
                $.each(timelist, function(i, item){
                    time_html += '<span class="i-item time-item'+(i==0? ' time-curr' : '')+(item['is_able'] ? '' : ' time-disabled')+'" data-value="'+item['value']+'">'+item['text']+'</span>';
                });
            }

            return time_html;
        }
        // 重置远程请求url
        this.resetRemote = function(remote, reset_succ_callback){
            remote = remote || '';

            this.conf.remote = remote;

            this.resetBoxHtml(reset_succ_callback);
        };
        // 重置box内的日期选择
        this.resetBoxHtml = function(reset_succ_callback){
            var me = this;

            me.getRemoteDateTime(function(remoteDateTime){
                remoteDateTime = remoteDateTime || [];
                var dateTimeHtml = __genDateTimeHtml(remoteDateTime, me.conf.remoteTime);
                var date_str = dateTimeHtml[0],
                    time_str = dateTimeHtml[1];

                var wBox = me.box;
                if (wBox && wBox.length) {
                    wBox.find('.date-item-list').html(date_str);
                    wBox.find('.time-item-list').html(time_str);

                    typeof reset_succ_callback==='function' && reset_succ_callback(wBox, remoteDateTime);
                }

            });
        };
        // 获取远程日期、时间数据
        this.getRemoteDateTime = function(callback) {
            var me = this;
            var remote = me.conf.remote;

            $.get(remote, function(res){
                res = $.parseJSON(res);

                if (!res['errno']) {
                    me.conf.remoteTime = {};
                    me.conf.remoteDateTime = res['result'];

                    if (typeof callback === 'function') {

                        callback(me.conf.remoteDateTime);
                    }
                } else {
                    // @do nothing
                }
            });
        };


        this.select = function(){
            var val = this.box.find('.date-curr').attr('data-value') +' '+ this.box.find('.time-curr').attr('data-value');
            this.el.val( val );
            this.hide();
            if(typeof(this.conf.onSelect)=='function') this.conf.onSelect(val);
        };

        this.show = function(){
            //var elRect= this.el.offset();
            var box = this.box;

            // 判断是否有可选日期
            var $d_item = box.find('.date-item').filter(function(){return !$(this).hasClass('date-disabled')});
            if (!$d_item.length) {
                $.dialog.toast('抱歉，暂时没有可用日期');
                return ;
            }

            // 显示遮罩层
            showMask ()

            box.css({
                'position' : 'fixed',
                'left' : '0',
                'top' : '100%',
                'z-index' : tcb.zIndex (),
                'width' : '100%'
            }).show();

            //如果为android4.0以下系统，由于不支持部分CSS动画，需要特别处理
            if( $.os.android && !compareVersion($.os.version, "4.0") ){
                box.css({
                    'top' : 'auto',
                    'bottom' : 0
                });
                $.dialog.toast("抱歉，您的手机暂时无法进行时间选择", 1600);
            }else{
                box.animate({ 'translateY' : '1px' }, 10, function(){
                    box.hide();
                    setTimeout(function(){
                        box.show().animate({'translateY' : 0-box.height()+'px'}, 200, 'linear');
                    },30);
                });
            }

        };

        this.hide = function(){
            this.box.animate({'translateY' : 0}, 200, 'linear', function(){

                $(this).hide()

                hideMask ()
            });
        };

        this.init(el, config);

        function compareVersion(src, dest){
            return _version2Num(src) >= _version2Num(dest);

            function _version2Num(v){
                var arr = v.split(/\./);
                if( arr.length>2){
                    arr.length = 2;
                }else if(arr.length == 1){
                    arr[1]="0";
                }
                var vn = arr.join(".");
                vn -= 0;
                return vn;
            }
        }

        function showMask () {
            var
                $mask = $ ('#BottomSelectWrapMask')

            if (!($mask && $mask.length)) {

                var
                    mask_css = 'position:fixed;top:0;left:0;right:0;bottom:0;display: block;width: 100%;height: 100%;background:rgba(0, 0, 0, 0.2);',
                    mask_html = '<a id="BottomSelectWrapMask" href="#" style="' + mask_css + '"></a>'

                $mask = $ (mask_html).appendTo (document.body);

                $mask.on ('click', function (e) {
                    e.preventDefault ()

                })
            }

            $mask.css ({
                'z-index' : tcb.zIndex (),
                'display' : 'block'
            })
        }

        function hideMask () {
            var
                $mask = $ ('#BottomSelectWrapMask')

            if ($mask && $mask.length) {

                $mask.hide ()
            }
        }
    };

    /**
     * 获取日期列表
     * @param  {int} from    从哪天开始，0为今天，1为明天，以此类推。
     * @param  {int} dateNum 要返回的天数
     * @return {[type]}         [description]
     */
    DateTime.getDateList = function(from, dateNum){
        var DAY_ARR = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        from = from || 0;
        dateNum = dateNum || 1;
        var dateArr = [];
        for(var i=0; i<dateNum; i++){
            var nextDay = new Date( new Date().getTime() + 1000*60*60*24*(from+i) );
            var month = nextDay.getMonth() + 1;
            var date = nextDay.getDate();
            var day = nextDay.getDay();
            var year = nextDay.getFullYear();
            var dtxt = year + '-' + (month<10 ? ('0'+month) : month)+'-'+( date<10? ('0' + date): date );
            var dayTxt = DAY_ARR[day];
            if( from+i  == 0 ){
                dayTxt = '今天';
            }else if(from+i==1){
                dayTxt = '明天';
            }else if(from+i==2){
                dayTxt = '后天';
            }

            dateArr.push(  { 'text': dayTxt+'　'+dtxt, 'value' : dtxt } );
        }

        return dateArr;
    };

    $.datetime = DateTime;
})(Zepto);


;/**import from `/resource/js/lib/m/zepto.slidetoggle.js` **/
(function ($) {

    /* SlideDown */
    $.fn.slideDown = function (duration) {

        // get the element position to restore it then
        var position = this.css('position');

        // show element if it is hidden
        this.show();

        // get naturally height, margin, padding
        var marginTop = this.css('margin-top');
        var marginBottom = this.css('margin-bottom');
        var paddingTop = this.css('padding-top');
        var paddingBottom = this.css('padding-bottom');
        var height = this.css('height');

        // place it so it displays as usually but hidden
        this.css({
            position: 'absolute',
            visibility: 'hidden'
        });

        // set initial css for animation
        this.css({
            position: position,
            visibility: 'visible',
            overflow: 'hidden',
            height: 0,
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0
        });

        // animate to gotten height, margin and padding
        this.animate({
            height: height,
            marginTop: marginTop,
            marginBottom: marginBottom,
            paddingTop: paddingTop,
            paddingBottom: paddingBottom
        }, duration);

    };

    /* SlideUp */
    $.fn.slideUp = function (duration) {

        // active the function only if the element is visible
        if (this.height() > 0) {

            var target = this;

            // get the element position to restore it then
            var position = target.css('position');

            // get the element height, margin and padding to restore them then
            var height = target.css('height');
            var marginTop = target.css('margin-top');
            var marginBottom = target.css('margin-bottom');
            var paddingTop = target.css('padding-top');
            var paddingBottom = target.css('padding-bottom');

            // set initial css for animation
            this.css({
                visibility: 'visible',
                overflow: 'hidden',
                height: height,
                marginTop: marginTop,
                marginBottom: marginBottom,
                paddingTop: paddingTop,
                paddingBottom: paddingBottom
            });

            // animate element height, margin and padding to zero
            target.animate({
                    height: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    paddingTop: 0,
                    paddingBottom: 0
                },
                {
                    // callback : restore the element position, height, margin and padding to original values
                    duration: duration,
                    queue: false,
                    complete: function(){
                        target.hide();
                        target.css({
                            visibility: 'visible',
                            overflow: 'hidden',
                            height: height,
                            marginTop: marginTop,
                            marginBottom: marginBottom,
                            paddingTop: paddingTop,
                            paddingBottom: paddingBottom
                        });
                    }
                });
        }
    };

    /* SlideToggle */
    $.fn.slideToggle = function (duration) {

        // if the element is hidden, slideDown !
        if (this.height() == 0) {
            this.slideDown(duration);
        }
        // if the element is visible, slideUp !
        else {
            this.slideUp(duration);
        }
    };

})(Zepto);

