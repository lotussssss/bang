/**
 * 同城帮相关的基础库(jquery版)
 * @return {[type]} [description]
 */
var tcb = function(){
    return {
        noop   : function () {},
        log : function () {
            if (window.console && typeof window.console.log=='function'){

                window.console.log.apply(console, Array.prototype.slice.call(arguments, 0))
            }
        },
        error : function () {
            if (window.console && typeof window.console.error=='function'){

                window.console.error.apply(console, Array.prototype.slice.call(arguments, 0))
            }
        },
        warn : function () {
            if (window.console && typeof window.console.warn=='function'){

                window.console.warn.apply(console, Array.prototype.slice.call(arguments, 0))
            }
        },
        // 全局的z-index
        zIndex:function(base_index){
            var
                key = 'KEY_GLOBAL_Z_INDEX',
                val = parseInt(base_index, 10) || parseInt(tcb.cache(key), 10) || 100001

            val++

            return tcb.cache(key, val)
        },
        // 将源对象的属性合入目标对象
        mix: function(dest, src, override){

            if (tcb.isArray(src)) {
                for (var i = 0, len = src.length; i < len; i++) {
                    tcb.mix(dest, src[i], override)
                }
                return dest
            }
            if (typeof override == 'function') {
                for (i in src) {
                    dest[i] = override(dest[i], src[i], i)
                }
            }
            else {
                for (i in src) {
                    //这里要加一个des[i]，是因为要照顾一些不可枚举的属性
                    if (override || !(dest[i] || (i in dest))) {
                        dest[i] = src[i]
                    }
                }
            }
            return dest
        },
        // 去除首尾空格
        trim: function(str){
            if (typeof $.trim==='function'){
                return $.trim(str);
            }
            // Support: Android<4.1, IE<9
            // Make sure we trim BOM and NBSP
            var rtrim =/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

            return str == null ?
                "" :
                ( str + "" ).replace( rtrim, "" );
        },
        inArray: function(val, arr){
            return $.inArray(val, arr)
        },
        isArray: function(arr){
            return $.isArray(arr)
        },
        each: function(arr, fn){
            return $.each(arr, fn)
        },
        // 事件绑定
        bindEvent: function(el, configs){
            el = $(el);
            for(var name in configs){
                if (configs.hasOwnProperty(name)) {
                    var value = configs[name];
                    if (typeof value == 'function') {
                        var obj = {};
                        obj.click = value;
                        value = obj;
                    }
                    for(var type in value){
                        if (value.hasOwnProperty(type)) {
                            el.delegate(name, type, value[type]);
                        }
                    }
                }
            }
        },
        //获取缩略图
        imgThumbUrl: function(url, width, height, ctype){
            width  = width ||100;
            height = height || 100;
            ctype  = ctype || 'dm';

            if(!url){
                return '';
            }

            if (!(url.indexOf('http://') == 0 || url.indexOf('https://') == 0)) {
                return '';
            }

            if(url.indexOf('/resource/')>-1){
                return url;
            }

            if(url.indexOf('/ss/30_105/')>-1){
                return url;
            }

            var a = document.createElement('a');
            a.href = url;

            //if( !/^\/\w+\.\w+$/.test( a.pathname) ){
            //    return url;
            //}

            try{
                return a.protocol + '//' + a.host + '/'+ctype+'/' + width + '_' + height + '_/ss/30_105/' + a.pathname.replace('/', '');
            }finally{
                a = null;
            }
        },
        // imgThumbUrl别名
        imgThumbUrl2: function(url, width, height, ctype){
            return this.imgThumbUrl(url, width, height, ctype)
        },
        // 验证邮箱
        validEmail: function(m){
            m = m || '';
            var flag = false;

            // aaaa@aaa.aa.555.com.cn
            // aaaa@555.com
            // a.a@555.com
            //var r_email = /^([a-zA-Z0-9][a-zA-Z0-9_\.\-]*)+@([a-zA-Z0-9][a-zA-Z0-9\-]*)(\.[a-zA-Z0-9][a-zA-Z0-9\-]*)*(\.[a-zA-Z]{2,4})+$/; // 判断是否为邮箱
            var r_email = /^\w+([-+.]\w+)*@\w+([-.]\w+)+$/i;
            m = tcb.trim(m);

            if (m&&r_email.test(m)) {
                flag = true;
            }

            return flag;
        },
        // 验证手机号
        validMobile: function(m){
            m = m || '';
            var flag = false;

            var r_mobile = /^1[3456789]\d{9}$/; // 判断是否为手机号
            m = tcb.trim(m);

            if (m&&r_mobile.test(m)) {
                flag = true;
            }

            return flag;
        },
        // 验证是否为手机号输入格式
        validMobileInput: function(m){
            m = m || '';
            var flag = false;

            var r_mobile = /^1[3456789]\d{0,9}$/; // 判断是否为手机号
            m = tcb.trim(m);

            if (m&&r_mobile.test(m)) {
                flag = true;
            }

            return flag;
        },
        // 解析url中的query
        queryUrl: function(url, key){
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
        },
        // 错误闪烁
        errorBlink: function($el, th){
            if (!($el && $el.length)) {
                return ;
            }
            window.ThList = window.ThList ? window.ThList : [];

            if (th) {
                clearInterval(th);
            }

            $el.addClass('errorblink');

            var c = 0, k = ThList.length;
            ThList[k] = setInterval(function(){
                if (c % 2) {
                    $el.removeClass('errorblink');
                } else {
                    $el.addClass('errorblink');
                }
                c = c +1;
                if(c > 9){
                    clearInterval(ThList[k]);
                    c = 0;
                }
            }, 180);

            return ThList[k];
        },
        // 清除错误闪烁
        clearErrorBlink: function(){
            var ThList = window.ThList = window.ThList ? window.ThList : [],
                len = ThList.length;

            for(var i=0; i<len; i++){
                clearInterval(ThList[i]);
            }

            window.ThList = [];
        },
        // 设置url，params个数不定
        setUrl: function(url, params){
            var rs = '',
                args = Array.prototype.slice.apply(arguments)

            url = args.shift()

            // 处理params
            tcb.each(args, function(i, param){
                if(typeof param==='string'){
                    try{
                        param = param.charAt(0)=='{' ? param : '{'+param+'}'
                        param = $.parseJSON(param)
                    }catch (ex){
                        param = {}
                    }
                    args[i] = param
                }
            })
            params = tcb.mix({}, args, true)

            if(typeof url=='string' && url){
                //if(typeof params==='string'){
                //    try{
                //        params = params.charAt(0)=='{' ? params : '{'+params+'}';
                //        params = $.parseJSON(params);
                //    }catch (ex){}
                //}

                if($.isPlainObject(params)){
                    var parse_url = tcb.queryUrl(url.split('#')[0]);
                    $.each(params, function(k, v){
                        if(v){
                            if(typeof v == 'object'){
                                // 数组，直接取最后一个作为参数值
                                if ($.isArray(v)) {
                                    parse_url[k] = v[v.length-1];
                                } else {
                                    $.each(v, function(kk, vv){
                                        parse_url[k][kk] = vv;
                                    });
                                }
                            } else {
                                parse_url[k] = v;
                            }
                        } else {
                            if(typeof parse_url[k]!=='undefined')
                                delete parse_url[k];
                        }
                    });

                    parse_url = $.param(parse_url);
                    var query_pos = url.indexOf('?'),
                        hash_pos  = url.indexOf('#');

                    var urlArr = ['', '', '']
                    if (parse_url) {
                        urlArr[1] = '?' + parse_url
                    }
                    if (query_pos > -1) {
                        if (hash_pos > -1) {
                            urlArr[2] = url.substring(hash_pos)
                            if (query_pos < hash_pos) {
                                urlArr[0] = url.substring(0, query_pos)
                            } else {
                                urlArr[0] = url.substring(0, hash_pos)
                            }
                        } else {
                            urlArr[0] = url.substring(0, query_pos)
                        }
                    } else if (hash_pos > -1) {
                        urlArr[0] = url.substring(0, hash_pos)
                        urlArr[2] = url.substring(hash_pos)
                    } else {
                        urlArr[0] = url
                    }
                    rs = urlArr.join('')
                } else {
                    rs = url;
                }
            }

            return rs;
        },
        // 根据url和参数params，重组URL
        // 若有window.__MUST_PASS_PARAMS参数，将此参数也加入URL之中
        // except表示要被干掉的参数，格式为 string 或者 array
        setUrl2 : function (url, params, except) {
            var rs = url

            if ($.isPlainObject (window.__MUST_PASS_PARAMS)) {
                rs = tcb.setUrl (rs, window.__MUST_PASS_PARAMS)
            }
            rs = tcb.setUrl (rs, params)

            if (except){
                var except_map = {}
                except = typeof except==='string' ? [except] : except
                if (except instanceof Array){
                    for (var i=0;i<except.length;i++){
                        if (typeof except[i]==='string'){
                            except_map [ except[i] ] = ''
                        }
                    }
                }
                rs = tcb.setUrl(rs, except_map)
            }

            return rs
        },
        // 获取一个开头不带#号的hash串
        getPureHash: function(hash){
            hash = hash || window.location.hash;
            // 过滤掉左边所有的#号
            for(var i= 0; i<hash.length;i++){
                if(hash.charAt(0)=='#'){
                    hash = hash.substring(1);
                } else {
                    break;
                }
            }
            return hash;
        },
        // 解析query串格式的hash串
        parseHash: function(pure_hash){
            var params = {};
            pure_hash = pure_hash ? tcb.getPureHash(pure_hash) : tcb.getPureHash(window.location.hash);

            // 选择服务
            pure_hash = pure_hash.split('&');
            if(pure_hash&&pure_hash.length){
                var v;
                for(var i= 0, l=pure_hash.length; i<l; i++){
                    v = pure_hash[i];
                    v = v.split('=');
                    if(v[0]){
                        params[v[0]] = typeof v[1]==='undefined' ? '' : v[1];
                    }
                }
            }
            return params;
        },
        // 设置元素文本无法被选择
        setUnselect: function(wDom){
            wDom = wDom ? $(wDom) : $(document.body);
            wDom.css({
                '-moz-user-select': 'none', // ff下起作用
                '-ms-user-select': 'none', // ie10以后起作用
                'user-select': 'none'
            });
            // 禁止文本选择（ie&chrome起作用）
            wDom.on('selectstart', function(e){
                e.preventDefault();
                return;
            });
        },
        //去除str结尾的char字符
        stripLastCharAt: function (char, str){
            (function(){
                if(str[str.length-1]===char){
                    str = str.substring(0, str.length-1);

                    arguments.callee(char, str);
                }
            }());

            return str;
        },
        // 格式化钱
        // money被格式化的金额
        // place保留小数点位数
        // flag多余位的舍入方式。flag>0向上舍入，flag<0向下舍入，flag==0四舍五入
        formatMoney: function(money, place, flag) {
            var ret = money;
            money = parseFloat(money)||0;
            flag = typeof flag==='undefined' ? 0 : flag;

            if (place!==0&&place!=='0') {
                place = parseInt(place, 10) || 2;
            }
            var num = Math.pow(10, place);

            if (!place && flag>0) {
                // 向上舍入
                ret = Math.ceil(money*num)/num;
            }
            else if (!place && flag<0) {
                //向下舍入
                ret = Math.floor(money*num)/num;
            }
            else {
                // 四舍五入
                ret = Math.round(money*num)/num;
            }

            return ret;
        },
        // 倒计时数秒
        distimeAnim: function(time, callback){
            if(time<=0 ){  return ;}
            var distimeAnimTimerHandler = tcb.cache('distimeAnimTimerHandler') || []

            distimeAnimTimerHandler[distimeAnimTimerHandler.length] = setInterval( function(){
                time --;
                callback && callback(time)
                if(time <=0 ){
                    var timerHandler = tcb.cache('distimeAnimTimerHandler').pop()
                    clearInterval(timerHandler)
                }
            }, 1000)

            tcb.cache('distimeAnimTimerHandler', distimeAnimTimerHandler)

            return distimeAnimTimerHandler[distimeAnimTimerHandler.length-1]
        },
        // 清除倒计时数秒
        clearDistimeAnim: function(timerHandler){
            if (!timerHandler){
                var distimeAnimTimerHandler = tcb.cache('distimeAnimTimerHandler')
                if (distimeAnimTimerHandler && distimeAnimTimerHandler.length){
                    timerHandler = distimeAnimTimerHandler.pop()

                    tcb.cache('distimeAnimTimerHandler', distimeAnimTimerHandler)
                }
            }

            timerHandler && clearInterval(timerHandler)
        },
        // 生成随机数
        genRandomNum: function(len) {
            len = len ? len : 6;

            var num = "";
            for (var i = 0; i < len; i++) {
                num += Math.floor(Math.random() * 10);
            }

            return num;
        },
        /**
         * 简易判断是否真实跳转的页面URL
         * @param url
         * @returns {boolean}
         */
        isRealUrl: function(url){

            // 空URL
            if(!url){
                return false;
            }
            // javascript:协议开头的URL
            if(url.indexOf('javascript:')==0){
                return false;
            }
            // tel:协议开头的URL
            if(url.indexOf('tel:')==0){
                return false;
            }
            // #开头的URL
            if(!url.split('#')[0]){
                return false;
            }

            return true;
        },
        // 图片加载完成回调
        imageOnload: function(img_src, callback){
            //var _imgObj = new Image();
            //// 图片加载完成，获取图片宽高
            //_imgObj.onload = function(){
            //    typeof callback === 'function' && callback(_imgObj);
            //};
            //_imgObj.src = img_src;
            var
                flag = false,
                _imgObj = new Image()

            // 图片加载完成，获取图片宽高
            _imgObj.onload = function(){
                if (flag){
                    return
                }

                flag = true

                typeof callback === 'function' && callback(_imgObj);
            }
            _imgObj.src = img_src


            // 此处补充加上setTimeout循环获取图片高宽，
            // 是为了避免有些图片比较大onload完成时间较长（或者某些当图片加载过了cache后不再onload），
            // 而图片的尺寸信息，在图片加载完成之前的某个时间点就可以获取到，这样就可以提前获取到图片的尺寸
            setTimeout(function(){
                if (flag){
                    return
                }
                // 获取到图片宽度～即认为图片已经加载完成
                if (_imgObj.width) {
                    flag = true

                    typeof callback === 'function' && callback(_imgObj);
                }
                else {
                    setTimeout(arguments.callee, 50);
                }
            }, 50)
        },
        // 根据图片地址，获取其宽高尺寸，然后执行回调函数;
        getImageSize: function(img_src, callback) {
            var has_got_size = false;
            var orig_width, orig_height;

            var _imgObj = new Image();
            // 图片加载完成，获取图片宽高
            _imgObj.onload = function(){
                if (has_got_size) {
                    return ;
                }
                // 获取图片的原始高宽;
                orig_width  = _imgObj.width;
                orig_height = _imgObj.height;
                if (orig_width) {
                    has_got_size = true;
                    typeof callback === 'function' && callback(orig_width, orig_height);
                }
            };
            _imgObj.src = img_src;

            // 此处补充加上setTimeout循环获取图片高宽，
            // 是为了避免有些图片比较大onload完成时间较长（或者某些当图片加载过了cache后不再onload），
            // 而图片的尺寸信息，在图片加载完成之前的某个时间点就可以获取到，这样就可以提前获取到图片的尺寸
            setTimeout(function(){
                if (has_got_size) {
                    return ;
                }
                // 获取图片的原始高宽;
                orig_width  = _imgObj.width;
                orig_height = _imgObj.height;
                if (orig_width) {
                    has_got_size = true;
                    typeof callback === 'function' && callback(orig_width, orig_height);
                }
                else {
                    setTimeout(arguments.callee, 50);
                }
            }, 50);
        },
        // 设置img元素到合适的尺寸
        setImgElSize: function(wImg, width, height) {
            if ( !(wImg && wImg.length)) {
                return ;
            }

            wImg.each(function(){
                var wEl = $(this),
                    src = wEl.attr('src');

                // 获取图片原始尺寸，然后根据原始宽高，设置元素等比宽高
                tcb.getImageSize(src, function(orig_width, orig_height){
                    var w_ratio = width/orig_width,
                        h_ratio = height/orig_height;

                    var n_width, n_height;
                    // 预设尺寸和原始尺寸宽度比，大于 高度比，
                    // 则表示预设尺寸宽度被拉伸，那么宽度应该设置为auto，高度设置为预设高度；
                    // 反之亦然；
                    if (w_ratio>h_ratio) {
                        //n_width = 'auto';
                        n_width  = orig_width*h_ratio;
                        n_height = height;
                    } else {
                        n_width  = width;
                        //n_height = 'auto';
                        n_height = orig_height*w_ratio;
                    }

                    wEl.css({
                        'width' : n_width,
                        'height': n_height
                    });

                });
            });
        },
        // 预加载图片
        preLoadImg: function(img_arr, delay) {
            img_arr = img_arr || [];
            if (typeof img_arr === 'string') {
                img_arr = [img_arr];
            }
            if ( !(img_arr instanceof Array) ) {
                img_arr = [img_arr.toString()];
            }

            delay = delay || 1; // 毫秒

            // 加载图片
            setTimeout(function(){
                for(var i=0; i<img_arr.length; i++) {
                    var img = new Image();
                    img.src = img_arr[i];
                }
            }, delay);
        },
        // 显示dialog弹窗
        showDialog: function(content, options){
            var
                classes = '',
                withClose = true,
                onClose = function(){}
            if (typeof options==='string') {
                classes = options;
                options = {
                    'className': classes,
                    'withClose': withClose,
                    'onClose': function(){}
                };
            } else {
                options = options || {};
                classes = (typeof options['className'] != 'undefined' && options['className']) ? options['className'] : classes;
                withClose = (typeof options['withClose'] != 'undefined') ? options['withClose'] : withClose;
                onClose = (typeof options['onClose'] == 'function') ? options['onClose'] : onClose;
            }
            var $mask = $('#DialogMask');
            if (!$mask.length) {
                $mask = $('<a class="dialog-mask" id="DialogMask"></a>');
                $mask.appendTo('body');

                if (withClose) {
                    $mask.on('click', function(e){
                        e.preventDefault();

                        tcb.closeDialog();

                        typeof onClose=='function' && onClose()
                    });
                }
            }
            $mask.css({
                'height': $('body').height()
            });
            var $wrap = $('#DialogWrap');
            if (!$wrap.length) {
                var wrap_str = '';
                if (withClose) {
                    wrap_str = '<div class="dialog-wrap" id="DialogWrap"><a href="#" class="dialog-close">&nbsp;</a><div class="dialog-inner"></div></div>';
                } else {
                    wrap_str = '<div class="dialog-wrap" id="DialogWrap"><div class="dialog-inner"></div></div>';
                }
                $wrap = $(wrap_str);
                $wrap.appendTo('body');

                $wrap.find('.dialog-close').on('click', function(e){
                    e.preventDefault();

                    tcb.closeDialog();

                    typeof onClose=='function' && onClose()
                });
            }
            $wrap.find('.dialog-inner').html(content);
            if (classes) {
                $wrap.addClass(classes);
            }

            var top_default = 30,
                top = top_default,
                left = 0;

            var $win = $(window),
                w_height = $win.height(),
                w_width = $win.width(),
                s_top = $win.scrollTop(),
                wrap_height = $wrap.height(),
                wrap_width = $wrap.width();

            if (wrap_height>w_height){
                top = s_top+top;
            } else {
                top = (w_height-wrap_height)/2
                top = top < top_default ? top_default : top
                top = s_top+top;
            }

            if (wrap_width<w_width){
                left = (w_width-wrap_width)/2;
            }

            $wrap.css({
                'position': 'absolute',
                'top': top,
                'left': left
            });

            return {
                mask: $mask,
                wrap: $wrap
            }
        },
        // 关闭dialog弹窗
        closeDialog: function($dialog){

            if ($dialog
                && $dialog.mask && $dialog.mask.length
                && $dialog.wrap && $dialog.wrap.length) {
                $dialog.mask.remove();
                $dialog.wrap.remove();
                return ;
            }

            $('#DialogMask').remove();
            $('.dialog-wrap').remove();
        },
        // 通用cache方法
        cache: function(key, val){
            window.__Cache = window.__Cache || {};

            if (typeof val !== 'undefined') {
                window.__Cache[key] = val;
            }

            return window.__Cache[key];
        },
        // 懒加载图片
        lazyLoadImg: function(options, $target) {
            if (typeof options==='number') {
                options = {
                    'delay': options
                }
            }
            options = options || {};

            options = $.extend({
                'delay': 1,
                'interval': 0 // 0:同时显示，其他时间表示实际时间间隔
            }, options);

            var delay = options['delay'] || 1, // 毫秒
                interval = options['interval'] || 0; // 图片加载顺序间隔

            var _time = 0;
            setTimeout(function(){

                var $img;
                if ($target && $target.length){
                    var $target_img = $target.filter(function(i){
                        return this.nodeType==1 && this.tagName.toLowerCase() === 'img';
                    });
                    if ($target_img && $target_img.length){
                        if ($target_img.length===$target.length){
                            $img = $target_img;
                        } else {
                            $img = $target.find('img').concat($target_img);
                        }
                    } else {
                        $img = $target.find('img');
                    }
                } else {
                    $img = $('img');
                }

                $img.each(function(i, el){
                    var $el = $(el),
                        src_holder = $el.attr('src'),
                        src = $el.attr('data-lazysrc');

                    if (tcb.isRealUrl(src) && src_holder!==src) {
                        if (interval) {
                            setTimeout(function(){

                                $el.css({
                                    'opacity': 0
                                });
                                $el.attr('src', src).removeAttr('data-lazysrc');
                                $el.animate({
                                    'opacity': 1
                                }, interval);

                            }, _time);

                            _time += interval;
                        } else {

                            $el.css({
                                'opacity': 0
                            });
                            $el.attr('src', src).removeAttr('data-lazysrc');
                            $el.animate({
                                'opacity': 1
                            }, 300);

                        }
                    }
                });

            }, delay);
        },
        // html编码
        html_encode: function(str){
            var s = "";
            if (str.length == 0) return "";
            s = str.replace(/&/g, "&amp;");
            s = s.replace(/</g, "&lt;");
            s = s.replace(/>/g, "&gt;");
            s = s.replace(/ /g, "&nbsp;");
            s = s.replace(/\'/g, "&#39;");
            s = s.replace(/\"/g, "&quot;");
            s = s.replace(/\n/g, "<br>");
            return s;
        },
        // html解码
        html_decode: function(str){
            var s = "";
            if (str.length == 0) return "";
            s = str.replace(/&amp;/g, "&");
            s = s.replace(/&lt;/g, "<");
            s = s.replace(/&gt;/g, ">");
            s = s.replace(/&nbsp;/g, " ");
            s = s.replace(/&#39;/g, "\'");
            s = s.replace(/&quot;/g, "\"");
            s = s.replace(/<br>/g, "\n");
            return s;
        },
        // 检查当前浏览器是否支持指定的css属性
        supportCss: (function() {
            var
                div = document.createElement('div'),
                vendors = 'Ms O Moz Webkit'.split(' '),
                len = vendors.length

            return function(prop) {
                if ( prop in div.style ) return true

                prop = prop.replace(/^[a-z]/, function(val) {
                    return val.toUpperCase();
                })

                while(len--) {
                    if ( vendors[len] + prop in div.style ) {
                        return true
                    }
                }
                return false
            }
        })(),

        // 统计api使用
        statistic: function(params){
            var
                api_list = [
                    '_trackPageview',
                    '_trackEvent',
                    '_setCustomVar',
                    '_setAccount',
                    '_setAutoPageView',
                    '_deleteCustomVar'
                ]

            params = params || []
            _czc = typeof _czc==='undefined' ? [] : _czc

            if ( tcb.inArray ( params[ 0 ], api_list ) > -1 ) {
                _czc.push ( params )
            }

        }


        // end
    };
}();
