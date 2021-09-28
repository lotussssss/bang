;/**import from `/resource/js/lib/tcb.js` **/
/**
 * 同城帮相关的基础库
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
            return QW.ObjectH.mix(dest, src, override);
        },
        // 返回指定项首次出现的索引
        inArray: function(val, arr){
            return arr.indexOf(val);
        },
        // 遍历数组/对象
        each: function(obj, fn){

            if (obj instanceof Array){
                // 在数组中的每个项上运行一个函数，并将全部结果作为数组返回。
                return QW.ArrayH.map(obj, function(v, i, obj){
                    return fn(i, v, obj);
                });
            }
            else if (obj instanceof Object){
                // 针对对象的每一个属性运行一个函数，并按属性名与返回值组成新的对象返回
                return QW.ObjectH.map(obj, function(v, k, obj){
                    return fn(k, v, obj);
                });
            }

        },
        bindEvent: function(el, configs){
            el = W(el);
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
        },
        confirm: function(title, content, options, callback){
            options = options || {};

            options['btn_submit_text'] = options['btn_submit_text']||'确认';
            options['btn_cancel_text'] = options['btn_cancel_text']||'取消';

            var options = ObjectH.mix(options, {
                    btn: [{
                        txt: options['btn_submit_text'],
                        fn: callback,
                        cls: "ok"
                    }, {
                        txt: options['btn_cancel_text'],
                        fn: function(){
                            return true;
                        }
                    }]
                }, true);
            return this.panel(title, content, options)
        },
        alert: function(title, content, options, callback){
            options = options || {};
            var options = ObjectH.mix(options, {
                    btn: [{
                        txt: options.btn_name || "确定",
                        fn: callback
                    }]
                }, true);
            return this.panel(title, content, options)
        },
        panel: function(title, content, options){
            options = options || {};
            var btn = options.btn || [];
            var div = W('<div class="btn-box"></div>');
            setTimeout(function(){div.addClass('btn-box-fixbug').css('width', div.parentNode('.ft').siblings('.bd').size().width )}, 10); //修正360兼容模式下的bug
            btn.forEach(function(item,i){
                var btn = W('<button class="panel-btn panel-btn-'+i+' panel-btn-'+(item.cls || "")+'" '+(item.id ? 'id="'+item.id+'"' : '' )+'>'+item.txt+'</button>').appendTo(div);
                btn.on('click', function(e){
                   var result = item.fn && item.fn.call(this, e);
                   if (result === true) {
                        panel.hide();
                   };
                })
            })
            var defaultOptions = {
                "wrapId": "BasePanel01",
                "className": "panel-tom01",
                "title": title,
                "header": "",
                "body": content,
                "footer": '',
                "withClose": true,
                "withCorner": true,
                "withCue": true,
                "withShadow": false,
                "withBgIframe": true,
                "keyEsc": true,
                "withMask": true,
                "dragable": false,
                "resizable": false,
                "posCenter": true,
                "posAdjust": true
            }
            options = ObjectH.mix(defaultOptions, options, true);
            var panel = new QW.BasePanel(options);
            panel.on("afterhide",function(){this.dispose();});
            panel.show(null, null, options.width, options.height);
            div.appendTo(W(panel.oFooter));
            if (options.event) {
                tcb.bindEvent(panel.oBody, options.event);
            };
            return panel;
        },
        //获取缩略图
        imgThumbUrl: function(url, width, height){
            url = url+'';
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
            try{
                return a.protocol + '//' + a.host + '/edr/' + width + '__' + height + '/ss/30_105/' + a.pathname.replace('/', '');
            }finally{
                a = null;
            }
        },
        imgThumbUrl2: function(url, width, height, ctype){
            width = width ||100;
            height = height || 100;
            ctype = ctype || 'dm';

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
        //显示认证v标识
        showIconV : function(mer_type, show_text){
            var rs = '';
            /*if(mer_type=='person'){
                rs +='<span class="icon icon-v-p" title="该个人已经过360同城帮的严格审核，确保提供专业优质的维修服务"></span>';
                if(show_text){
                    rs+='个人认证';
                }
            }else if(mer_type == 'enterprise'){
                rs += '<span class="icon icon-v" title="该企业已经过360同城帮的严格审核，确保提供专业优质的维修服务"></span>';
                if(show_text){
                    rs+='企业认证';
                }
            }*/

            if(mer_type == 40){
                if(show_text){
                    rs = '<span class="icon icon-v-ub pngfix" title="同城帮认证"></span>';
                }else{
                    rs = '<span class="icon icon-v-us pngfix" title="同城帮认证"></span>';
                }
            }

            return rs;
        },
        showShopGrade: function( grade ){
            var icon = Math.min(Math.ceil(grade/5), 4);
            var icon_num = (grade-1)%5 + 1;
            var str = '';
            for(var i=0; i<icon_num; i++){
                str +='<span class="icon icon-dj icon-dj-'+icon+'"></span>';
            }
            return str;
        },
        gotoTop : (function(){
            var isAnim = false,
                ElAnim = QW.ElAnim,
                createElement = DomU.createElement;
            // var doc = (QW.Browser.firefox || QW.Browser.ie || /trident.*rv:/i.test(window.navigator.userAgent)) ? document.documentElement : document.body; //后面的正则为判断IE11及以上版本
            var doc =  document.documentElement
            var opt = {
                ch: Dom.getDocRect().height,
                cw: Dom.getDocRect().width,
                mw : 0,
                mh : 0,
                headH : 10,
                right : 0,
                bottom: 0,
                el : 0,
                toTop : function(e){
                        e.preventDefault();
                        isAnim = true;
                        var anim = new ElAnim(doc, {
                                "scrollTop" : {
                                    to : 0
                            }
                        }, 500, QW.Easing.easeBothStrong);
                        anim.on('beforeplay',function(){opt.el.setStyle('visibility','hidden');});
                        anim.play();
                        anim.on('end',function(){
                            isAnim = false;
                        });
                }
            };

            function rTop(){
                if(isAnim)return;
                var h,w,x,timer,
                    pos = Dom.getDocRect(),
                    y = pos.scrollY;
                    if(y > opt.headH){
                        if(QW.Browser.ie6){
                            opt.el.setStyle('visibility','hidden');
                            x = Dom.getDocRect().scrollX;
                            h = y+(pos.height - opt.bottom - opt.mh);
                            w = opt.cw + x - opt.mw - opt.right;
                            opt.el.setXY(w,h);
                            if(timer) {
                                clearTimeout(timer);
                                timer = null;
                            }
                            timer = setTimeout(function() {
                                opt.el.setStyle('visibility','visible');
                            },500);
                            opt.el.on('click',function(){window.scrollTo(0,0);});

                        }//针对ie6的处理
                        else{
                            opt.el.setStyle('visibility','visible');
                        }
                    }
                    if(y == 0){
                        opt.el.setStyle('visibility','hidden');
                    }
            }
            function createHtml(){
                /**
                 *
                 *  创建返回到顶部的图标
                */
                var el = createElement('div',{
                    className:"returnToTop"
                });
                el.innerHTML = '<a data-text="go_to_top" href="#"  style="visibility:hidden"></a>';
                document.body.insertBefore(el,document.body.firstChild);
                return el;
            }
            function init(o){
            	  W('.returnToTop').removeNode();
                var el = createHtml();
                var that = opt;
                that.el = W(el).firstChild('a');
                that.mw = that.el.getRect().width;
                that.mh = that.el.getRect().height;
                QW.ObjectH.mix(opt,o,true);
                opt.el.css({'bottom':opt.bottom+'px','right':opt.right+'px'},1);
                W(window).on('scroll', rTop);
                W(window).on('resize', rTop);

                opt.el.on('click',opt.toTop);
            }
            //到达指定位置
            function goPlace(disTop){
                isAnim = true;
                var anim = new ElAnim(doc, {
                        "scrollTop" : {
                            to : disTop
                    }
                }, 300, QW.Easing.easeBothStrong);

                anim.play();
                anim.on('end',function(){
                    isAnim = false;
                });
            }
            return{
                init : init,
                rTop : rTop,
                goPlace : goPlace
            }
        })(),
        // 验证手机号
        validMobile: function(m){
            m = m || '';
            var flag = false;

            var r_mobile = /^1[3456789]\d{9}$/; // 判断是否为手机号
            m = m.trim();

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
            m = m.trim();

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
            if (!($el&&$el.length)) {
                return ;
            }
            window.ThList = window.ThList ? window.ThList : {};

            if (th) {
                clearInterval(th);
            }

            $el.addClass('errorblink');

            var c = 0, k = Math.random();
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
            window.ThList = window.ThList ? window.ThList : {};

            QW.ObjectH.map(window.ThList, function(v, k){
                clearInterval(v);
            });

            window.ThList = {};
        },
        // 设置url
        setUrl: function(url, params){
            var rs = '',
                args = Array.prototype.slice.apply(arguments)

            url = args.shift()

            // 处理params
            tcb.each(args, function(i, param){
                if(typeof param==='string'){
                    try{
                        param = param.charAt(0)=='{' ? param : '{'+param+'}'
                        param = JSON.parse(param)
                    }catch (ex){
                        param = {}
                    }
                    args[i] = param
                }
            })
            params = tcb.mix({}, args, true)

            if(typeof url=='string' && url){

                if(QW.ObjectH.isPlainObject(params)){
                    var parse_url = url.split('#')[0].queryUrl();
                    QW.ObjectH.map(params, function(v, k){
                        if(v){
                            if(typeof v == 'object'){
                                // 数组，直接取最后一个作为参数值
                                if (QW.ObjectH.isArray(v)) {
                                    parse_url[k] = v[v.length-1];
                                } else {
                                    QW.ObjectH.map(v, function(vv, kk){
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

                    parse_url = QW.ObjectH.encodeURIJson(parse_url);
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

            if (QW.ObjectH.isPlainObject (window.__MUST_PASS_PARAMS)) {
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
            pure_hash = pure_hash ? this.getPureHash(pure_hash) : this.getPureHash(window.location.hash);

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
            wDom = wDom ? W(wDom) : W(document.body);
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
        // 使用优惠码，相关事件和方法
        // options的参数：
        //      url,          验证URL
        //      service_type, 优惠码类型：
        //                        1：自营 ，
        //                        2：回收，
        //                        3：优品，
        //      price,        商品价格
        //      product_id,   商品id
        //      wWrap,        优惠码wrap
        //      succ,         验证优惠码成功后回调
        //      fail,         优惠码验证失败
        usePromo: function(input_options){
            var options = tcb.mix({
                'url': '/aj/doGetYouhuiAmount',
                'service_type': '',
                'price': 0,
                'product_id': '',
                'request_params': {},
                'wWrap': '.use-promo-wrap',
                'succ': function(){},
                'fail': function(){}
            }, input_options, true);

            options.request_params = options.request_params || {}

            var wWrap = W(options['wWrap'] || '.use-promo-wrap');
            if( !(wWrap&&wWrap.length) ){
                return;
            }

            var wUsePromoTrigger = wWrap.query('.use-promo'),
                wYouhuiCode      = wWrap.query('[name="youhui_code"]'),
                wYouhuiCodeSelect= wWrap.query('.promo-sel-list');

            if(wYouhuiCode && wYouhuiCode.length){
                wYouhuiCode.forEach(function(el, i){
                    var wEl = W(el);

                    var params = {
                        request_params : {
                            service_type : options['service_type'],
                            price: options['price']||0,
                            product_id: options['product_id']
                        },
                        succ: options['succ'],
                        fail: options['fail']
                    }
                    tcb.mix(params.request_params, options.request_params, true)
                    validPromoCode(wEl, params);
                });
            }

            // 使用优惠码
            wUsePromoTrigger.on('click', function(e){
                e.preventDefault();
                W(this).hide().siblings('.promo-box').show();
            });
            // 验证优惠码有效性
            wYouhuiCode.on('change', function(e){
                var wEl = W(this);

                var params = {
                    request_params : {
                        service_type : options['service_type'],
                        price: options['price']||0,
                        product_id: options['product_id']
                    },
                    succ: options['succ'],
                    fail: options['fail']
                }
                tcb.mix(params.request_params, options.request_params, true)
                validPromoCode(wEl, params);
            });
            // select选择优惠码
            wYouhuiCodeSelect.on('change', function(e){
                var wMe = W(this),
                    wYouhuiCode = wMe.siblings('[name="youhui_code"]'),
                    proCode = wMe.val();
                if(proCode && wYouhuiCode.val()!=proCode){
                    wYouhuiCode.val( proCode ).trigger('change');
                }
            });
            /**
             * 验证优惠码
             *
             * @param $obj      优惠码的input
             * @param options
             *          service_type : options['service_type'] // 使用优惠码的产品类型，1：自营 ，2：回收，3：优品
             *          price: options['price']||0,
             *          product_id: options['product_id'],
             *          succ: options['succ'],
             *          fail: options['fail']
             */
            function validPromoCode($obj, options){
                var code     = $obj.val(),/*优惠码*/
                    wCurWrap = $obj.ancestorNode('.use-promo-wrap');

                if(!code){
                    if(typeof options['fail']==='function') {
                        options['fail'](wCurWrap);
                    }
                    wCurWrap.query('.promoYZ').html('请输入优惠码').removeClass('promo-fail').removeClass('promo-succ');
                    return;
                }

                // service_type：1：自营 ，2：回收，3：优品
                var params = {
                    'youhui_code': code
                }
                tcb.mix(params, options.request_params, true)
                QW.Ajax.post(options['url']||'/aj/doGetYouhuiAmount', params, function(rs){
                    try{
                        rs = JSON.parse(rs);
                    }catch(ex){ rs = {errno: 'error'}; }

                    if( rs.errno ){
                        var errmsg = '抱歉，'+(rs.errmsg?rs.errmsg+'，':'')+'优惠码验证失败。';//rs.errmsg? '抱歉，'+rs.errmsg : '抱歉，优惠码验证失败。';
                        wCurWrap.query('.promoYZ').html(errmsg).removeClass('promo-succ').addClass('promo-fail');

                        if(typeof options['fail']==='function') {
                            options['fail'](wCurWrap);
                        }
                    }else{
                        var promo_amount = rs.result['promo_amount'] || 0, // 优惠价格
                            promo_per    = rs.result['promo_per'] || 0;    // 折扣量
                        // 折扣优先
                        if (promo_per) {
                            promo_amount = {
                                'promo_per': promo_per
                            }
                        }

                        var
                            min_sale_price = parseFloat(rs.result['full_cut']) || 0 // 最小折扣价

                        if(typeof options['succ']==='function'){
                            options['succ'](promo_amount, min_sale_price, wCurWrap);
                        }
                    }
                });
            }

            // 刷新优惠码验证
            function refreshPromoCode(){
                wYouhuiCode.trigger('change');
            }
            // 设置商品价格
            function setPrice(price){
                options['price'] = price;
            }
            // 设置商品id
            function setProductId(product_id){
                options['product_id'] = product_id;
            }

            return {
                oWrap: wWrap,
                setPrice: setPrice,                // 设置商品价格
                setProductId: setProductId,        // 设置商品id
                refreshPromoCode: refreshPromoCode // 刷新优惠码验证
            };
        },
        /**
         * 获取滚动条的高度
         * @return {[type]} [description]
         */
        getScrollTop: function(){
            var scrolltop = 0;

            if (window.pageYOffset) { //这一条滤去了大部分， 只留了IE678
                scrolltop = window.pageYOffset;
            } else if (document.body&&document.body.scrollTop) { //IE678 的quirk模式
                scrolltop = document.body.scrollTop;
            } else if (document.documentElement&&document.documentElement.scrollTop) { //IE678 的非quirk模式
                scrolltop = document.documentElement.scrollTop;
            }

            return scrolltop;
        },
        /**
         * 设置滚动条高度
         * @param {[type]} top_val [description]
         */
        setScrollTop: function(top_val) {
            top_val = top_val ? top_val : 0;
            //if (typeof window.pageYOffset !== 'undefined') {
            //    window.pageYOffset = top_val;
            //}
            //document.documentElement.scrollTop = top_val;
            //document.body.scrollTop = top_val;

            window.scrollTo(0, top_val);
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
        // 去除str首尾所有的char字符,char若被省略或为空,则去除空格
        trim: function(str, char){
            str = str == null ? '' : ( str + '' );

            if (!char) {
                // 确保去除 BOM 和 NBSP
                var reg_trim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
                return str.replace( reg_trim, '' );
            }

            var reg_trim_char = new RegExp('^['+char+']+|['+char+']+$', 'g');
            return str.replace( reg_trim_char, '' );
        },
        // 显示dialog弹窗
        showDialog: function(content, options){
            var
                classes = '',
                withClose = true,
                flag_middle = false,
                onClose = function(){}
            if (typeof options==='string') {
                classes = options
                options = {
                    'className': classes,
                    'withClose': withClose,
                    'middle': flag_middle,
                    'onClose': function(){}
                };
            } else {
                options = options || {};
                classes = (typeof options['className'] != 'undefined' && options['className']) ? options['className'] : classes;
                withClose = (typeof options['withClose'] != 'undefined') ? options['withClose'] : withClose;
                flag_middle = (typeof options['middle'] != 'undefined') ? options['middle'] : flag_middle;
                onClose = (typeof options['onClose'] == 'function') ? options['onClose'] : onClose;
            }
            var
                $doc = W(document.body),
                doc_rect = QW.DomU.getDocRect()

            var $mask = W('#DialogMask');
            if (!$mask.length) {
                $mask = W('<a class="dialog-mask" id="DialogMask"></a>');
                $mask.appendTo($doc);

                if (withClose) {
                    $mask.on('click', function(e){
                        e.preventDefault();

                        tcb.closeDialog();

                        typeof onClose=='function' && onClose()
                    })
                }
            }
            $mask.css({
                'height': doc_rect.scrollHeight,
                'z-index' : tcb.zIndex ()
            });
            var $wrap = W('#DialogWrap');
            if (!$wrap.length) {
                var wrap_str = '';
                if (withClose) {
                    wrap_str = '<div class="dialog-wrap" id="DialogWrap"><a href="#" class="dialog-close">&nbsp;</a><div class="dialog-inner"></div></div>';
                } else {
                    wrap_str = '<div class="dialog-wrap" id="DialogWrap"><div class="dialog-inner"></div></div>';
                }
                $wrap = W(wrap_str);
                $wrap.appendTo($doc);

                var
                    $close = $wrap.query('.dialog-close')
                if ($close && $close.length){

                    $close.on('click', function(e){
                        e.preventDefault();

                        tcb.closeDialog();

                        typeof onClose=='function' && onClose()
                    })
                }
            }
            $wrap.query('.dialog-inner').html(content);
            if (classes) {
                $wrap.addClass(classes)
            }

            if (flag_middle){
                // 垂直居中显示

                tcb.setElementMiddleScreen($wrap)
            } else {
                var
                    top = doc_rect.scrollY + 40

                $wrap.css({
                    'top': top
                })
            }
            $wrap.css({
                'z-index' : tcb.zIndex ()
            })

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
                $dialog.mask.removeNode();
                $dialog.wrap.removeNode();
                return ;
            }

            W('#DialogMask').removeNode();
            W('.dialog-wrap').removeNode();
        },
        // 设置元素居中显示
        setElementMiddleScreen: function(el){
            var
                $el = W(el),
                el_rect = $el.getRect(),
                h = el_rect.height,
                w = el_rect.width,

                doc_rect = QW.DomU.getDocRect(),
                win_h = doc_rect.height,
                win_w = doc_rect.width,
                s_top = doc_rect.scrollY

            var
                top = (win_h - h) / 2 + s_top,
                left = (win_w - w) / 2
            top = top > 10 ? top : 10
            left = left ? left : 0

            $el.css ({
                top  : top,
                //bottom  : top,
                left : left,
                right : left,
                height: h
            })

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
        // 校验身份证号码
        validIDCard : function(card) {
            var flag = true;

            //身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
            var reg = /(^\d{15}$)|(^\d{17}(\d|X)$)/;
            if(reg.test(card) === false) {
                flag = false;
            }

            return flag;
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
        // 加载地图
        loadMap: function(callback){

        },
        // 异步请求
        ajax: function(opts){

            var
                default_opts = {
                    "url"            : "",
                    "method"         : "get",
                    "async"          : true,
                    "user"           : "",
                    "pwd"            : "",
                    "data"           : {},
                    "useLock"        : false,
                    "timeout"        : "5000",
                    "requestHeaders" : {},
                    "onsucceed"      : function () {},
                    "ontimeout"      : function () {},
                    "onerror"        : function () {}
                }
            opts = tcb.mix (default_opts, opts, true)

            // url是form表单元素
            if (opts[ 'url' ] && opts[ 'url' ].tagName == 'FORM') {
                opts[ 'method' ] = opts[ 'method' ] || opts[ 'url' ].method
                opts[ 'data' ] = opts[ 'url' ]
                opts[ 'url' ] = opts[ 'url' ].action
            }
            var
                onsucceed = opts[ 'onsucceed' ],
                ontimeout = opts[ 'ontimeout' ],
                onerror = opts[ 'onerror' ]
            // 请求成功
            opts[ 'onsucceed' ] = function () {
                typeof onsucceed == 'function' && onsucceed.call (this, this.requester.responseText)
            }
            // 请求超时
            opts[ 'ontimeout' ] = function () {
                typeof ontimeout == 'function' && ontimeout.call (this)
            }
            // 请求失败
            opts[ 'onerror' ] = function () {
                typeof onerror == 'function' && onerror.call (this)
            }

            var
                ajaxObj = new QW.Ajax (opts)

            ajaxObj.send ()

            return ajaxObj
        },
        request: function(url, data, success_callback, error_callback, method){
            if (url.constructor == Object) {
                var
                    a = tcb.ajax(url)
            } else {
                if (typeof data == 'function') {
                    method = error_callback
                    error_callback = success_callback
                    success_callback = data

                    if (url && url.tagName == 'FORM') {
                        method = method || url.method
                        data = url
                        url = url.action
                    } else {
                        data = ''
                    }
                }

                a = tcb.ajax({
                    url: url,
                    method: method,
                    data: data,
                    onsucceed: function() {
                        success_callback.call(this, this.requester.responseText)
                    },
                    onerror: function(){

                        error_callback.call(this)
                    }
                })

            }

            return a;
        },
        // GET异步请求
        get: function(url, data, success_callback, error_callback){
            var
                args = [].slice.call(arguments, 0)
            args.push('get')

            return tcb.request.apply(null, args);
        },
        // POST异步请求
        post: function(url, data, success_callback, error_callback){
            var
                args = [].slice.call(arguments, 0)
            args.push('post')

            return tcb.request.apply(null, args)
        },
        // 通用cache方法
        cache: function(key, val){
            window.__Cache = window.__Cache || {};

            if (typeof val !== 'undefined') {
                window.__Cache[key] = val;
            }

            return window.__Cache[key];
        },

        // 图片加载完成回调
        imageOnload :function (img_src, callback){
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
        getImageSize : function (img_src, callback) {
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
        // wImg, 被设置的img元素
        // width, 目标宽度
        // height, 目标高度
        // flag 当图片宽高均小于目标宽高时，非强制设置目标宽高，按照图片原始尺寸显示
        setImgElSize : function (wImg, width, height, flag) {
            if ( !(wImg && wImg.length)) {
                return ;
            }

            flag = flag ? true : false;

            var me = this;

            wImg.forEach(function(el, i){
                var wEl = W(el),
                    src = wEl.attr('src');

                // 获取图片原始尺寸，然后根据原始宽高，设置元素等比宽高
                me.getImageSize(src, function(orig_width, orig_height){
                    var w_ratio = width/orig_width,
                        h_ratio = height/orig_height;

                    var n_width, n_height;
                    // 当图片宽高均小于目标宽高时，非强制设置目标宽高，按照图片原始尺寸显示
                    if (flag && orig_width<width && orig_height<height) {
                        n_width = orig_width;
                        n_height = orig_height;
                    } else {
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
        // 懒加载图片
        lazyLoadImg: function(options, $target) {
            if (typeof options==='number') {
                options = {
                    'delay': options
                }
            }
            options = options || {};

            options = tcb.mix({
                'delay': 1,
                'interval': 0 // 0:同时显示，其他时间表示实际时间间隔
            }, options, true);

            var delay = options['delay'] || 1, // 毫秒
                interval = options['interval'] || 0; // 图片加载顺序间隔

            var _time = 0;
            setTimeout(function(){

                var $img;
                if ($target && $target.length){
                    var $target_img = $target.filter(function(el){
                        return el.nodeType==1 && el.tagName.toLowerCase() === 'img';
                    });
                    if ($target_img && $target_img.length){
                        if ($target_img.length===$target.length){
                            $img = $target_img;
                        } else {
                            $img = $target.query('img').concat($target_img);
                        }
                    } else {
                        $img = $target.query('img');
                    }
                } else {
                    $img = W('img');
                }

                $img.forEach(function(el, i){
                    var $el = W(el),
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

    };
}();


;/**import from `/resource/js/component/citypanel.js` **/
(function() {
	function CityPanel() {
		this.init.apply(this, arguments);
	};

	CityPanel.prototype = (function() {
		return {
			init : function(trigger) {
				var instance = this;
				CustEvent.createEvents(this);

                if(!CityPanel.prototype._documentBind){
                	W(window).on('resize', function(e){
                		//窗口大小变化时重新触发
                		if(instance.container.css('display')!="none"){
	                		setTimeout(function(){
	                			try{ W(trigger).fire('click'); }catch(ex){}
	                		}, 100);
                		}
                	});
                    W(document).on('keydown', function(e) {
                        if(e.keyCode == 27) {
                            instance.container.hide();
                            instance.fire('close');
                        }
                    }).on('click', function(e) {
                            var flag = false;
                            CityPanel.prototype._triggerList.forEach(function(tri){
                                tri.forEach(function(el) {
                                    var trigger = W(el);

                                    if(trigger[0] == e.target || trigger.contains(e.target)) {
                                        flag = true;
                                    }
                                });
                            });

                            if( !flag && (!instance.container[0] == e.target || !instance.container.contains(e.target)) ) {

                                instance.container.fadeOut(150);
                                instance.fire('close');
                            }
                        });
                    CityPanel.prototype._documentBind = true;
                }

				this.container = W('#city_list')
					.delegate('.close', 'click', function(e) {
							e.preventDefault();

							instance.container.hide();
							instance.fire('close');
						})
					.delegate('.filter_bar a', 'click', function(e) {
							e.preventDefault();

							var el = W(this),
								letter = el.html().trim();

							if(el.hasClass('current')) return;

							instance.container.query('.filter_bar a').removeClass('current');
							instance.container.query('.city_wrap p').hide();
							el.addClass('current');
							instance.container.query('.city_wrap p.' + letter).show();
						});

				this.trigger = W(trigger).click(function(e) {
                    e.preventDefault();

                    var pos = W(this).getRect();
                    //是否关闭一直出现
                    if(W(this).attr('data-close')=='hide'){
                        W('#city_list .city_close').hide();
                    }else{
                        W('#city_list .city_close').show();
                    }
                    if (W(this).attr('x-offset')) {
                        instance.container
                        .css({'left' : pos.left - W(this).attr('x-offset'), 'top' : pos.height + pos.top + 5})
                        .fadeIn(150);
                    }
                    else if( W(this).attr('data-floatright') ){
                        instance.container
                        .css({'left' : pos.left - 380, 'top' : pos.height + pos.top + 5})
                        .fadeIn(150);
                    }else{
                        instance.container
                        .css({'left' : pos.left, 'top' : pos.height + pos.top + 5})
                        .fadeIn(150);
                    }

                    //修正IE7下相关bug。IE7，360IE模式下，父级还有position:fixed, 上面的pos.top的值获取不正确，需要修正。需要把posisiton为fixed的父级点传到data-parentfixed参数里。如data-parentfixed="#doc-menubar-fixed"
                    if( W(this).attr('data-parentfixed') ){
                        var pf =W(this).ancestorNode( W(this).attr('data-parentfixed') );
                        var poffsettop =  W(this).attr('data-parenttop')-0 || 30;
                        var scrTop = document.documentElement.scrollTop || document.body.scrollTop;

                        if( pf.length>0 && pf.css('position')=='fixed' &&  scrTop > 0 && pos.top<scrTop+ poffsettop  ){
                            instance.container.css('top',   pos.height + pos.top + 5 + scrTop);
                        }
                    }

                    instance.fire('onShow');

                    instance.container
                        .undelegate('p a')
                        .delegate('p a', 'click', function(e) {
                            e.preventDefault();

                            var name = this.innerHTML,
                                city = this.getAttribute('data-city'),
                                cityid = this.getAttribute('cityid');
                            if(!name || !city) return;

                            instance.fire('selectCity', {'name' : name, 'city' : city, 'cityid': cityid});
                            instance.container.hide();
                        });
                });
                // 将trigger添加到所有的trigger列表里
                CityPanel.prototype._triggerList.push(this.trigger);
			},
            _triggerList: [],
            _documentBind: false // 是否已经写过了document的事件绑定
		}
	})();

	QW.provide({'CityPanel' : CityPanel});
})();

;/**import from `/resource/js/include/yuyue.js` **/
tcb.Yuyue = (function(){
    var subscribe_obj = null; // 预约维修面板对象；

    tcb.bindEvent(document.body, { 

        // 激活区县的选择
        '#SubscribeWrap .select-area': function(e){
            e.preventDefault();
            var wMe = W(this);
            wMe.siblings('.area-select-pannel').fadeIn();
        },
        // 区县选择面板的相关点击操作
        '#SubscribeWrap .area-select-pannel': function(e){
            e.preventDefault();
            var wMe = W(this),
                target = e.target,
                wTarget = W(target);
            // 关闭区县选择列表
            if (wTarget.hasClass('close')) {
                wMe.hide();
            }
            // 选择区县
            if (wTarget[0].nodeName.toLowerCase()==='a') {
                var area_name = wTarget.html();
                W('#SubscribeWrap .select-area b').html(area_name);
                W('#SubscribeWrap [name="addr_area"]').val(area_name);
                wMe.hide();
                wMe.parentNode('div').siblings('.errmsg').css({'visibility':'hidden'});
            }
        },
        // 提交维修预约单
        '#SubscribeWrap .btnsubmit': {
            // 'click': function(e){
            //     e.preventDefault();
            // },
            'click': function(e){
                e.preventDefault();                
                var oSubscribeWrap = W('#SubscribeWrap'),
                    oCityCode = oSubscribeWrap.query('[name="sub_city_code"]'),  // 城市id
                    oAddrCity = oSubscribeWrap.query('[name="addr_city"]'),      // 城市
                    oAddrArea = oSubscribeWrap.query('[name="addr_area"]'),      // 区县
                    oAddrDetail = oSubscribeWrap.query('[name="addr_detail"]'),  // 详细地址
                    oDetail = oSubscribeWrap.query('[name="detail"]'),  // 问题描述
                    oDate = oSubscribeWrap.query('[name="date"]'),      // 期望服务日期
                    oType = oSubscribeWrap.query('[name="type"]'),      // 服务方式
                    //oPrice = oSubscribeWrap.query('[name="price"]'),    // 期望服务价格
                    oMobile = oSubscribeWrap.query('[name="mobile"]'),  // 手机
                    wCaptcha = oSubscribeWrap.query('[name="mobile_captcha"]'),  // 手机验证码
                    oAutoSms = oSubscribeWrap.query('[name="auto_sms"]'), // 自动发送到商家
                    error_flag = false,
                    date = oDate.val(),
                    type = oType.filter(':checked').val(),
                    price, addr_city, addr_area, addr_detail, detail, mobile,
                    wErrmsg_temp;

                wErrmsg_temp = oAddrCity.parentNode('div').siblings('.errmsg')
                if(!(addr_city = oAddrCity.val())){
                    wErrmsg_temp.html('请选择您的方位');
                    wErrmsg_temp.css({'visibility':'visible'});
                    error_flag = true;
                } else {
                    wErrmsg_temp.css({'visibility':'hidden'});
                    error_flag = false;
                }
                wErrmsg_temp = oAddrArea.parentNode('div').siblings('.errmsg');
                // 没有选择区县
                // if((addr_area=oAddrArea.val())==='选择区县'){
                if(!(addr_area=oAddrArea.val())){
                    if(!error_flag && oAddrArea.siblings('.sel-quxian').isVisible()){
                        wErrmsg_temp.html('请选择您的方位');
                        wErrmsg_temp.css({'visibility':'visible'});
                        error_flag = true;
                    }
                } else {
                    if(!error_flag){
                        wErrmsg_temp.css({'visibility':'hidden'});
                    }
                }
                // 没有选择商圈
                if(!(addr_detail=oAddrDetail.val())){
                    if(!error_flag && oAddrArea.siblings('.sel-shangquan').isVisible()){
                        wErrmsg_temp.html('请选择您的方位');
                        wErrmsg_temp.css({'visibility':'visible'});
                        error_flag = true;
                    }
                } else {
                    if(!error_flag){
                        wErrmsg_temp.css({'visibility':'hidden'});
                    }
                }
                /*if(!(addr_detail = oAddrDetail.val())){
                    if(!error_flag){
                        oAddrDetail.siblings('.errmsg').show().html('请填写您的方位信息');
                        error_flag = true;
                    }
                    oAddrDetail.focus();
                } else {
                    if(getLength(addr_detail)>22){
                        if(!error_flag){
                            oAddrDetail.siblings('.errmsg').show().html('详细地址要小于22个字符');
                            error_flag = true;
                        }
                        oAddrDetail.focus();
                    }
                    if(!error_flag){
                        oAddrDetail.siblings('.errmsg').hide().html('');
                    }
                }*/
                wErrmsg_temp = oDetail.siblings('.errmsg');
                detail = oDetail.val();
                if(!detail||detail==='请简要描述您的问题，如“我的电脑使用过程中频繁死机”'){
                    wErrmsg_temp.html('请填写您遇到的问题');
                    wErrmsg_temp.css({'visibility':'visible'});
                    if(!error_flag){
                        oDetail.val('');
                        oDetail.focus();
                    }
                    error_flag = true;
                } else {
                    if(getLength(detail)>150){
                        wErrmsg_temp.html('问题描述要小于150个字符');
                        wErrmsg_temp.css({'visibility':'visible'});
                        if(!error_flag){
                            oDetail.focus();
                        }
                        error_flag = true;
                    } else {
                        wErrmsg_temp.css({'visibility':'hidden'});
                    }
                }
                // 期望时间
                /*wErrmsg_temp = oDate.siblings('.errmsg');
                date = oDate.val();
                if (!date) {
                    wErrmsg_temp.html('请选择预约时间');
                    wErrmsg_temp.css({'visibility':'visible'});
                    error_flag = true;
                } else {
                    wErrmsg_temp.css({'visibility':'hidden'});
                }*/
                // 期望价格
                /*wErrmsg_temp = oPrice.siblings('.errmsg');
                price = oPrice.val();
                if (!price) {
                    wErrmsg_temp.html('请选择期望价格');
                    wErrmsg_temp.css({'visibility':'visible'});
                    error_flag = true;
                } else {
                    wErrmsg_temp.css({'visibility':'hidden'});
                }*/
                // 手机
                wErrmsg_temp = oMobile.siblings('.errmsg');
                mobile = oMobile.val();
                if (!mobile||mobile==='请正确填写您的号码') {
                    wErrmsg_temp.html('请填写您的号码');
                    wErrmsg_temp.css({'visibility':'visible'});
                    if(!error_flag){
                        oMobile.val('');
                        oMobile.focus();
                    }
                    error_flag = true;
                }
                else if(!tcb.validMobile(mobile)){
                    wErrmsg_temp.html('您输入的号码有误，请重新输入');
                    wErrmsg_temp.css({'visibility':'visible'});
                    if(!error_flag){
                        oMobile.focus();
                        oMobile[0].select();
                    }
                    error_flag = true;
                } else {
                    wErrmsg_temp.css({'visibility':'hidden'});
                }
                // 手机验证码(// 暂时忽略异步的回调)
                validCaptcha(wCaptcha, function(flag){
                    if (!error_flag) {
                        if (!flag) {
                            wCaptcha.focus();
                            wCaptcha[0].select();
                            error_flag = true;
                        }
                    }
                    if(error_flag){
                        return false;
                    }

                    var userAddress = addr_city+addr_area+addr_detail;
                    //逆地理编码查询回调
                    getLocationRange(userAddress, function(poi){
                        var auto_sms = oAutoSms.attr('checked') ? oAutoSms.val() : 0;

                        var request_url = '/yuyue/sub/',
                            postData = {
                                'sub_city_code': oCityCode.val()||'7',
                                'city': addr_city||"",
                                'area': addr_area||"",
                                'addr_detail': addr_detail||"",
                                'weixiu_desc': detail,
                                'qiwan_weixiu_date': date||"",
                                'server_method': type||"",
                                'qiwan_amount': price||"",
                                'mobile': mobile,
                                'secode': wCaptcha.val(),
                                'user_poi' : poi||'',
                                'auto_sms': auto_sms
                            };
                        QW.Ajax.post(request_url, postData, function(responseText){
                            try{
                                var response = QW.JSON.parse(responseText);
                                if(response['errno']){
                                    alert(response['errmsg']);
                                } else {
                                    W('#SubscribeWrap .mod-sucess-cont').show();
                                    if (auto_sms) {
                                        W('#SubscribeWrap .mod-sucess-cont').query('.auto_sms').show();
                                    } else {
                                        W('#SubscribeWrap .mod-sucess-cont').query('.not_auto_sms').show();
                                    }
                                    
                                    W('#SubscribeWrap .mod-sucess-cont').siblings('.mod-form-area').hide();
                                }
                            } catch (e){}
                        });
                    });
                    
                });
            }
        },
        // 故障描述框相关事件
        '#SubscribeWrap [name="detail"]': {
            'focus': function(e){
                var wMe = W(this),
                    detail = wMe.val();
                if (wMe.hasClass('color1')&&detail==='请简要描述您的问题，如“我的电脑使用过程中频繁死机”') {
                    wMe.val('');
                }
                wMe.removeClass('color1');
            },
            'blur': function(e){
                var oDetail = W(this),
                    detail = '',
                    wErrmsg = oDetail.siblings('.errmsg');

                if(!(detail = oDetail.val())){
                    oDetail.val('请简要描述您的问题，如“我的电脑使用过程中频繁死机”');
                    oDetail.addClass('color1');
                    wErrmsg.html('请填写您遇到的问题').css({'visibility':'visible'});
                } else {
                    if(getLength(detail)>150){
                        wErrmsg.html('故障描述要小于150个字符');
                        wErrmsg.css({'visibility':'visible'});
                    } else {
                        wErrmsg.css({'visibility':'hidden'});
                    }
                }
            }
        },
        // 验证手机号
        '#SubscribeWrap [name="mobile"]': {
            'focus': function(){
                var oMobile = W(this),
                    mobile = oMobile.val();
                if (oMobile.hasClass('color1')&&mobile==='请正确填写您的号码') {
                    oMobile.val('');
                }
                oMobile.removeClass('color1');
                oMobile.siblings('.errmsg').addClass('normalmsg').css('visibility', 'visible').html('验证码将以短信的形式发送到您的手机');
            },
            'blur': function(e){
                var oMobile = W(this);
                oMobile.siblings('.errmsg').removeClass('normalmsg');
                validMobile(oMobile);
            }
        },
        // 选择服务价格
        '#SubscribeWrap .price-list': function(e){
            var wMe = W(this),
                target = e.target,
                wTarget = W(target);
            if (target.nodeName.toLowerCase() === 'li') {
                wTarget.siblings().removeClass('actived');
                wTarget.addClass('actived');
                wMe.siblings('[name="price"]').val(wTarget.attr('value'));
                wMe.siblings('.errmsg').css({'visibility':'hidden'});
            }
        },
        // 选择日期
        '#SubscribeWrap .date-list': function(e){
            var wMe = W(this),
                target = e.target,
                wTarget = W(target);
            if (target.nodeName.toLowerCase() === 'li') {
                wTarget.siblings().removeClass('actived');
                wTarget.addClass('actived');
                wMe.siblings('[name="date"]').val( wTarget[0].getAttribute('value') );
                wMe.siblings('.errmsg').css({'visibility':'hidden'});
            }
        },
        // 验证码校验
        '#SubscribeWrap [name="mobile_captcha"]': {
            'focus': function(e){
                var wMe = W(this),
                    captcha = wMe.val();
                if (captcha==='请填写验证码') {
                    wMe.removeClass('color1').val('');
                    wMe.siblings('.errmsg').addClass('normalmsg').html('请查看手机短信').css('visibility', 'visible');
                }
            },
            'blur': function(e){
                var wMe = W(this);
                wMe.siblings('.errmsg').removeClass('normalmsg');
                validCaptcha(wMe);
            }
        },
        // 点击获取验证码
        '#SubscribeWrap .get-mobile_captcha': {
            'click': function(e){
                var wMe = W(this),
                    oMobile = wMe.siblings('[name="mobile"]'),
                    mobile = oMobile.val();
                
                if (validMobile(oMobile)) {
                    // 验证手机号格式的合法性&&可以发送
                    if (!wMe.hasClass('disabled')) {
                        wMe.addClass('disabled');
                        var txt = wMe.html(),
                            s = 60, h1, h2;
                        h1 = setTimeout(function(){
                            var arg = arguments;
                            wMe.html('剩余 '+s+' 秒');
                            if (s) {
                                s--;
                                h2 = setTimeout(function(){
                                    arg.callee();
                                }, 1000);
                            } else {
                                wMe.removeClass('disabled').html('重发验证码');
                            }
                        }, 10);
                        //var request_url = '/aj/sendsecode/',// [接口废弃]此处js是用的tpl已无Action引用
                        //    params = {
                        //        'mobile': mobile
                        //    };
                        //QW.Ajax.post(request_url, params, function(responseText){
                        //    try{
                        //        var response = QW.JSON.parse(responseText);
                        //        if (response['errcode']=='1000') {
                        //
                        //        } else {
                        //            clearTimeout(h1);
                        //            clearTimeout(h2);
                        //            wMe.removeClass('disabled').html('重发验证码');
                        //            wMe.siblings('.errmsg').removeClass('normalmsg').html(response['errmsg']).css('visibility','visible');
                        //        }
                        //    } catch(ex){}
                        //});
                    }
                } else {
                    oMobile.focus();
                }
            }
        },
        // 收不到验证码文字提示
        '#SubscribeWrap .mobile_captcha-tip': {
            'mouseenter': function(e){
                var wMe = W(this);
                wMe.siblings('.mobile_captcha-tip-block').show();
            },
            'mouseleave': function(e){
                var wMe = W(this);
                wMe.siblings('.mobile_captcha-tip-block').hide();
            }
        }
    });
    
    //初始化
    function init(){
        //直接在页面中显示，不需要处理浮层窗口等。
        var date_str = '',
            timestamp = (new Date()).getTime(),
            i = 0;
        while(i<3){
            if(i){
                timestamp += 86400000;
            }
            var oDate = new Date(timestamp);

            date_str += '<li value="'+(oDate.getFullYear())+'-'+(oDate.getMonth()+1)+'-'+oDate.getDate()+'">'+(oDate.getMonth()+1)+'月'+oDate.getDate()+'日</li>';

            i++;
        }
        var subscribe_func = W('#subscribeTpl').html().trim().tmpl(),
            subscribe_str = subscribe_func({"date":date_str});

        W('#SubscribeWrap').html( subscribe_str );
        // cur_cityname 为全局变量
        var city_name = cur_cityname;
        // W('#SubscribeWrap .select-city b').html(city_name);
        // W('#SubscribeWrap [name="addr_city"]').val(city_name);

        var city_code = cur_citycode,
            city_id = cur_cityid;
        W('#citySelector110 .sel-city').attr('code', city_code);
        W('#citySelector110 .sel-city .sel-txt').html(city_name).attr('data-code', city_code);
        W('#SubscribeWrap [name="addr_city"]').val(city_name);
        W('#SubscribeWrap [name="sub_city_code"]').val(city_id);
        // 激活面板选择
        new AreaSelect({
            'wrap': '#citySelector110',
            // 城市选择时触发
            'onCitySelect': function(data){
                W('#citySelector110 .sel-city').attr('code', data.citycode);
                W('#citySelector110 .sel-city .sel-txt').html(data.cityname).attr('data-code', data.citycode);
                W('#SubscribeWrap [name="sub_city_code"]').val(data.cityid);
                W('#SubscribeWrap [name="addr_city"]').val(data.cityname);
                W('#SubscribeWrap [name="addr_area"]').val('');
                W('#SubscribeWrap [name="addr_detail"]').val('');
            },
            // 区县选择时触发
            'onAreaSelect': function(data){
                if (typeof data.areaname!=='undefined') {
                    W('#SubscribeWrap [name="addr_area"]').val(data.areaname);
                } else {
                    W('#SubscribeWrap [name="addr_area"]').val('');
                }
                // 存在商圈
                if(W('#citySelector110 .sel-shangquan').isVisible()){
                    W('#SubscribeWrap [name="addr_detail"]').removeAttr('disabled').val('');
                } 
                else {//  不存在商圈
                    W('#SubscribeWrap [name="addr_detail"]').attr('disabled', 'disabled').val('');
                }
                
            },
            // 商圈选择时触发
            'onQuanSelect': function(data){
                if (typeof data.quanname!=='undefined') {
                    W('#SubscribeWrap [name="addr_detail"]').val(data.quanname);
                } else {
                    W('#SubscribeWrap [name="addr_detail"]').val('');
                }
            }
        });

        // // 根据当前的城市，获取当前的区县
        // // cur_citycode 为全局变量
        // getArea(cur_citycode);
        // // 选择城市
        // var cityPanel = new CityPanel('#SubscribeWrap .select-city');
        // cityPanel.on('selectCity', function(e) {
        //     var city = e.city.trim(),
        //         name = e.name.trim();

        //     var trigger = this.trigger;
        //     trigger.query('b').html(name);
        //     trigger.siblings('[name="addr_city"]').val(name);

        //     getArea(city, function(){
        //         trigger.siblings('[name="addr_area"]').val('');
        //         trigger.siblings('.select-area').query('b').html('选择区县')
        //     });
        // });
    }
    
    /**
     * 验证手机号的合法性
     * @param  {[type]} wMobile [description]
     * @return {[type]}         [description]
     */
    function validMobile(wMobile){
        var mobile  = wMobile.val(),
            wErrmsg = wMobile.siblings('.errmsg'),
            flag = false;
        if (!mobile||mobile==='请正确填写您的号码') {
            wErrmsg.html('请填写您的号码');
            wErrmsg.css({'visibility':'visible'});
            wMobile.val('请正确填写您的号码').addClass('color1');
            // wMobile.focus();
        }
        else if(!tcb.validMobile(mobile)){
            wErrmsg.html('您输入的号码有误，请重新输入');
            wErrmsg.css({'visibility':'visible'});
            wMobile.focus();
            wMobile[0].select();
        } else {
            flag = true;
            wErrmsg.css({'visibility':'hidden'});
        }
        return flag;
    }
    /**
     * 验证手机验证码
     * @param  {[type]} wCaptcha [description]
     * @return {[type]}          [description]
     */
    function validCaptcha(wCaptcha, callback){
        var captcha = wCaptcha.val(),
            captcha_reg = /^\d{6}$/,
            wErrmsg = wCaptcha.siblings('.errmsg');
        // 验证码为空
        if (!captcha) {
            wCaptcha.addClass('color1').val('请填写验证码');
            wErrmsg.html('验证码填写错误').css('visibility', 'visible');
            typeof callback === 'function' && callback(false);
        }
        // 验证码格式不对
        else if (!captcha_reg.test(captcha)){
            // wCaptcha.focus();
            // wCaptcha[0].select();
            wErrmsg.html('验证码填写错误').css('visibility', 'visible');
            typeof callback === 'function' && callback(false);
        }
        // 格式对了，校验是不是真实的..
        else {
            // 基本格式通过验证（请求服务器验证）
            var request_url = '/aj/cksecode/',
                params = {
                    'mobile': W('#SubscribeWrap [name="mobile"]').val(),
                    'secode': wCaptcha.val()
                };
            if (params.mobile==='请正确填写您的号码') {
                params.mobile = '';
            }
            wErrmsg.css('visibility', 'hidden');
            QW.Ajax.post(request_url, params, function(responseText){
                try{
                    var response = QW.JSON.parse(responseText);
                    if (response['errcode']=='1000') {
                        // do nothing
                        typeof callback === 'function' && callback(true);
                    } else {
                        wErrmsg.html(response['errmsg']||'&nbsp;').css('visibility', 'visible');
                        typeof callback === 'function' && callback(false);
                    }
                } catch(ex){typeof callback === 'function' && callback(false)}
            });
        }
    }

    /**
     * 获取城市的区县
     * @param  {[type]}   city     [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function getArea(city, callback){

        var request_url = '/aj/get_area/?citycode='+city;
        QW.Ajax.get(request_url, function(responseText){
            try{
                var area_list = QW.JSON.parse(responseText)['result'];

                var options_str = '';
                QW.ObjectH.map(area_list, function(v, k){
                    options_str += '<a href="javascript:;">'+v+'</a>';
                });
                W('#SubscribeWrap .area-select-pannel .area-select-list').html(options_str);

                var wArea= W('#SubscribeWrap .select-area');
                if (options_str) {
                    // W('#SubscribeWrap .area-select-pannel').fadeIn();
                    wArea.show();
                } else {
                    // W('#SubscribeWrap .area-select-pannel').hide();
                    wArea.hide();
                }

                typeof callback === 'function' && callback();
            } catch (e){typeof callback === 'function' && callback();}
        });
    }

    /**
     * 获取字符串长度;
     * @param str
     * @returns {number}
     */
    function  getLength(str) {
        var len = str.length; 
        var reLen = 0; 
        for (var i = 0; i<len; i++) {        
            if (str.charCodeAt(i)<27 || str.charCodeAt(i)>126){ 
                // 全角    
                reLen += 2; 
            }
            else {
                reLen++; 
            }
        }
        return Math.ceil(reLen/2);
    }

    /**
     * 根据用户的填写的位置，转换为坐标。
     * @param  {[type]} adrr [description]
     * @return {[type]}      [description]
     */
    function getLocationRange(addr, callback){

        var mapBox = W('<div id="geoMapBox"></div>').appendTo( W('body') ).hide();
        var _map = new AMap.Map("geoMapBox"); 
        // 加载地理编码插件 
        _map.plugin(["AMap.Geocoder"], function() {
            MGeocoder = new AMap.Geocoder({
                city : W('.area-box-sel').html() || '',
                radius: 1000,
                extensions: "all"
            });
            //返回地理编码结果
            AMap.event.addListener(MGeocoder, "complete", function(datas){
                var pos = null;
                if(datas && datas['resultNum'] > 0 ){
                    pos = {
                        'lng': datas['geocodes'][0]['location']['lng'],
                        'lat': datas['geocodes'][0]['location']['lat']
                    }                    
                }

                callback(pos ? getBounds(pos, 5000) : '');
            });
            //逆地理编码
            MGeocoder.getLocation(addr);
        });
    }

    /**
     * 根据中心点和半径换算查询范围
     * @param  {[type]} latLng 坐标对象{lng:经度,  lat:纬度 } //如北京， 116经度，38纬度
     * @param  {[type]} radius 半径，单位米
     * @return {[type]}        [description]
     */
    function getBounds(latLng, radius){
        var latitude = latLng.lat-0;

        var longitude = latLng.lng-0;

        var degree = (24901 * 1609) / 360.0;

        var raidusMile = radius;

        var dpmLat = 1 / degree;

        var radiusLat = dpmLat * raidusMile;

        var minLat = latitude - radiusLat;

        var maxLat = latitude + radiusLat;

        var mpdLng = degree * Math.cos(latitude * (Math.PI / 180));

        var dpmLng = 1 / mpdLng;

        var radiusLng = dpmLng * raidusMile;

        var minLng = longitude - radiusLng;

        var maxLng = longitude + radiusLng;

        return [ [minLng, minLat ].join(',') , [maxLng, maxLat].join(',') ].join(';');       
    }


/**
 * 区域选择
 * @param {[type]} options [description]
 */
function AreaSelect(options){
    var defaults = {
        'wrap': '#citySelector110',
        'autoinit': true,
        'onInit': function(){},
        // 城市选择时触发
        'onCitySelect': function(data){},
        // 区县选择时触发
        'onAreaSelect': function(data){},
        // 商圈选择时触发
        'onQuanSelect': function(data){}
    }
    options = options || {};
    options = QW.ObjectH.mix(defaults, options, true);

    var me = this;
    me.options = options; // 配置项
    me.data = {}; // 用于回调中的参数

    var fn = AreaSelect.prototype;
    if (typeof fn.eventBind === 'undefined') {

        /**
         * 设置data
         * @param {[type]} key  [description]
         * @param {[type]} val  [description]
         * @param {[type]} flag [description]
         */
        fn.setData = function(key, val, flag){
            var me = this;

            if (QW.ObjectH.isObject(key)) {
                flag = val;
                val = null;
            } 
            else if (QW.ObjectH.isString(key)) {
                key = {
                    key:val
                };
            } else {
                return;
            }

            if (flag) {
                me.data = key;
            } else{
                me.data = QW.ObjectH.mix(me.data, key, true);
            }
        }
        /**
         * 根据key删除data中的数据
         */
        fn.deleteData = function(key){
            var me = this;

            var data = me.data;
            if (QW.ObjectH.isArray(key)) {
                QW.ObjectH.map(key, function(v){
                    if(typeof data[v] !== 'undefined'){
                        delete data[v];
                    }
                });
            }
            if (QW.ObjectH.isString(key)) {
                if (typeof data[key] !== 'undefined') {
                    delete data[key];
                }
            }
        }
        /**
         * 获取区县信息
         * @param  {[type]} citycode [description]
         * @return {[type]}          [description]
         */
        fn.getArea = function(citycode){
            var me = this;
            var url = 'http://' + location.host +'/aj/get_area/?citycode='+citycode;

            // 移除商圈选择
            me._removeAreaTrigger();
            me._removeQuanTrigger();
            QW.Ajax.get(url, function(responseText){
                try{
                    var area_list = QW.JSON.parse(responseText)['result'];

                    var options_str = '';
                    if (QW.ObjectH.isObject(area_list)) {
                        QW.ObjectH.map(area_list, function(v, k){
                            options_str += '<a href="javascript:;" code="'+k+'">'+v+'</a>';
                        });
                    }

                    if (options_str) {
                        options_str = '<a href="javascript:;">全部区县</a>' + options_str;

                        var wAreaTrigger = me._getAreaTrigger();
                        wAreaTrigger.show();
                        wAreaTrigger.query('.select-list').html(options_str);
                    }
                } catch (e){}
            });
        }
        /**
         * 获取商圈信息
         * @param  {[type]} citycode [description]
         * @param  {[type]} areacode [description]
         * @return {[type]}          [description]
         */
        fn.getQuan = function(citycode, areacode){
            var me = this;
            var url = 'http://' + location.host +'/aj/get_areaquan/?citycode='+citycode+'&areacode='+areacode;

            // 移除商圈选择
            me._removeQuanTrigger();
            QW.Ajax.get(url, function(responseText){
                try{
                    var area_list = QW.JSON.parse(responseText)['result'];

                    var options_str = '';
                    if (QW.ObjectH.isObject(area_list)) {
                        QW.ObjectH.map(area_list, function(v, k){
                            options_str += '<a href="javascript:;" code="'+k+'">'+v+'</a>';
                        });
                    }

                    if (options_str) {
                        options_str = '<a href="javascript:;">全部商圈</a>' + options_str;

                        var wQuanTrigger = me._getQuanTrigger();
                        wQuanTrigger.show();
                        wQuanTrigger.query('.select-list').html(options_str);
                    }
                } catch (e){}
            });
        }
        /**
         * 获取组件的最外层的对象；
         * @return {[type]} [description]
         */
        fn.getWrap = function(){
            var me = this;
            if (me.wWrap) {
                return me.wWrap;
            }
            var wWrap = QW.ObjectH.isObject(me.options['wrap']) ? me.options['wrap'] : W(me.options['wrap']);

            return me.wWrap = wWrap;
        }
        /**
         * 获取城市触发器
         * @return {[type]} [description]
         */
        fn._getCityTrigger = function(){
            var me = this;
            if (me.wCityTrigger) {
                return me.wCityTrigger;
            }
            var wWrap = me.getWrap(),
                wCityTrigger = wWrap.query('.sel-city');

            return me.wCityTrigger = wCityTrigger;
        }
        /**
         * 获取区县触发器
         * @return {[type]} [description]
         */
        fn._getAreaTrigger = function(){
            var me = this;
            if (me.wAreaTrigger) {
                return me.wAreaTrigger;
            }
            var wWrap = me.getWrap(),
                wAreaTrigger = wWrap.query('.sel-quxian');
            if (!wAreaTrigger.length) {
                var tpl = W('#ClientAreaTpl').html().trim();
                wAreaTrigger = W(tpl);
                me.getWrap().appendChild(wAreaTrigger);
            }

            return me.wAreaTrigger = wAreaTrigger;
        }
        /**
         * 移除区县
         * @return {[type]} [description]
         */
        fn._removeAreaTrigger = function(){
            var me = this;

            var wAreaTrigger = me._getAreaTrigger();

            wAreaTrigger.removeNode();
            delete me.wAreaTrigger;
        }
        /**
         * 获取商圈触发器
         * @return {[type]} [description]
         */
        fn._getQuanTrigger = function(){
            var me = this;
            if (me.wQuanTrigger) {
                return me.wQuanTrigger;
            }
            var wWrap = me.getWrap(),
                wQuanTrigger = wWrap.query('.sel-shangquan');
            if (!wQuanTrigger.length) {
                var tpl = W('#ClientQuanTpl').html().trim();
                wQuanTrigger = W(tpl);
                me.getWrap().appendChild(wQuanTrigger);
            }

            return me.wQuanTrigger = wQuanTrigger;
        }
        /**
         * 移除商圈
         * @return {[type]} [description]
         */
        fn._removeQuanTrigger = function(){
            var me = this;

            var wQuanTrigger = me._getQuanTrigger();

            wQuanTrigger.removeNode();
            delete me.wQuanTrigger;
        }

        /**
         * 选择城市
         * @return {[type]} [description]
         */
        fn._selectCity = function(){
            var me = this;

            var wCityTrigger = me._getCityTrigger(),
                cityPanel = new CityPanel(wCityTrigger);

            cityPanel.on('selectCity', function(e) {
                var code = e.city.trim(),
                    name = e.name.trim(),
                    cityid = e.cityid.trim();

                wCityTrigger.attr('code', code);
                wCityTrigger.one('.sel-txt').html(name);

                // 选择城市的时候获取区县
                me.getArea(code);

                // 设置data
                me.setData({
                    'cityid': cityid,
                    'citycode': code,
                    'cityname': name
                }, true);
                var data = me.data;
                // 选择城市的时候调用此回调
                if(typeof me.options.onCitySelect === 'function'){
                    me.options.onCitySelect(data);
                }
            });
        }
        /**
         * 绑定事件
         * @return {[type]} [description]
         */
        fn.eventBind = function(){
            var me = this;
            var wWrap = me.getWrap();

            // 激活城市选择
            me._selectCity();
            // 外层对象上绑定事件
            wWrap.on('click', function(e){
                var wMe = W(this),
                    target = e.target,
                    wTarget = W(target);

                var wAreaTrigger = me._getAreaTrigger(),
                    wQuanTrigger = me._getQuanTrigger();
                // 激活区县选择
                if (wAreaTrigger.contains(target)||wAreaTrigger[0]===target) {
                    var wPanel = wAreaTrigger.query('.select-pannel');
                    wPanel.fadeIn(100);

                    // 关闭区县选择列表
                    if (wTarget.hasClass('close')) {
                        wPanel.hide();
                    }
                    // 选择区县
                    if (wTarget[0].nodeName.toLowerCase()==='a') {
                        var code = wTarget.attr('code'),
                            name = wTarget.html();
                        if (code) {
                            wAreaTrigger.attr('code', code);
                            wAreaTrigger.query('.sel-txt').html(name);
                            // 设置data
                            me.setData({
                                'areacode': code,
                                'areaname': name
                            });
                        } else {
                            wAreaTrigger.attr('code', '');
                            wAreaTrigger.query('.sel-txt').html('选择区县');
                            me.deleteData(['areacode', 'areaname']);
                        }

                        wPanel.hide();

                        // 删除商圈data
                        me.deleteData(['quancode', 'quanname']);
                        var data = me.data;
                        // 选择区县的时候获取商圈
                        me.getQuan(data['citycode'], code);
                        // 选择区县的时候调用此回调
                        if (typeof me.options.onAreaSelect === 'function') {
                            me.options.onAreaSelect(data);
                        }
                    }
                }
                // 激活商圈选择
                else if(wQuanTrigger.contains(target)||wQuanTrigger[0]===target){
                    var wPanel = wQuanTrigger.query('.select-pannel');
                    wPanel.fadeIn(100);

                    // 关闭商圈选择列表
                    if (wTarget.hasClass('close')) {
                        wPanel.hide();
                    }
                    // 选择商圈
                    if (wTarget[0].nodeName.toLowerCase()==='a') {
                        var code = wTarget.attr('code'),
                            name = wTarget.html();
                        if (code) {
                            wQuanTrigger.attr('code', code);
                            wQuanTrigger.query('.sel-txt').html(name);
                            // 设置data
                            me.setData({
                                'quancode': code,
                                'quanname': name
                            });
                        } else {
                            wQuanTrigger.attr('code', '');
                            wQuanTrigger.query('.sel-txt').html('选择商圈');
                            me.deleteData(['quancode', 'quanname']);
                        }

                        wPanel.hide();

                        var data = me.data;
                        // console.log(data)
                        // 选择商圈的时候调用此回调
                        if (typeof me.options.onQuanSelect === 'function') {
                            me.options.onQuanSelect(data);
                        }
                    }
                }
            });
            // body上的绑定事件，面板失去焦点的时候关闭面板
            W(document.body).on('click', function(e){
                var target = e.target,
                    wTarget = W(target);

                var wAreaTrigger = me._getAreaTrigger();
                if (!(wAreaTrigger.contains(target)||wAreaTrigger[0]===target)) {
                    wAreaTrigger.query('.select-pannel').hide();
                }

                var wQuanTrigger = me._getQuanTrigger();
                if (!(wQuanTrigger.contains(target)||wQuanTrigger[0]===target)) {
                    wQuanTrigger.query('.select-pannel').hide();
                }
            });
        }
        /**
         * 初始化调用
         * @return {[type]} [description]
         */
        fn.init = function(){
            var me = this;

            me.eventBind();

            var wCityTrigger = me._getCityTrigger(),
                code = wCityTrigger.attr('code'),
                name = wCityTrigger.query('.sel-txt').html();
            me.setData({
                'citycode': code,
                'cityname': name
            });
            me.getArea(code);
            if(typeof me.options.onInit === 'function'){
                me.options.onInit();
            }
        }
    }
    // 初始化
    me.options.autoinit && me.init();
}

    //入口
    return{
        init : init
    }
})();

//为其他页面提供调用接口
(function(){
    var subTip;
    var subscribe_obj = null;

    var appTip;

    var erweimaTip;

    //在主体内容右侧显示预约功能
    function showRightSubscribe(){

        subTip = W('.subscribe-service');
        if( subTip.length == 0 ){
            subTip = W('<div class="right-subscribe-service"><a href="#" bk="yuyue-float" class="ss-clickplace subscribe-service"></a><a href="#" class="ss-close"></a></div>').appendTo( W('body') );

            
            subTip.query('.ss-close').on('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                subTip.hide();            
            });
            // 二维码
            erweimaTip = W('<div class="right-erweima"></div>').appendTo( W('body') );

            //FML，very bad...
            appTip =  W('<div class="right-phoneapp-tip"><a target="_blank" href="http://hr.bang.360.cn/" bk="app-float" class="phoneapp-tip"></a></div>').appendTo( W('body') );       
            appTip.hide(); //！！！隐藏，暂时不要了。
            _autoRightYuyuePos();
        }

        try{
            subTip.bind('click', function(e){
                e.preventDefault();
                _showYuyue();
            });
        }catch(ex){}

        W('body').delegate('#SubscribeWrap .close-pop-btn', 'click', function(){
            if(subscribe_obj != null){
                subscribe_obj.close();
            }
        });

    }

    function _autoRightYuyuePos(){
            
        W(window).on('load', _autoPos);
        W(window).on('resize', _autoPos);

        _autoPos();
    }  

    function _autoPos(){
        try{ subTip.css('left', (Dom.getDocRect().width - W('.doc-bd').getRect().width)/2 + W('.doc-bd').getRect().width + 10);}catch(ex){}

        try{ appTip.css('left', (Dom.getDocRect().width - W('.doc-bd').getRect().width)/2 + W('.doc-bd').getRect().width + 10);}catch(ex){}

        try{ erweimaTip.css('left', (Dom.getDocRect().width - W('.doc-bd').getRect().width)/2 + W('.doc-bd').getRect().width + 10);}catch(ex){}
    }  

    
    var PanelManager = QW.PanelManager;
    /**
     * 预约维修服务面板
     * @constructor
     */
    function SubscribePanel(options){
        var me = this;

        me.wrapId = 'SubscribeWrap'; // 包裹器的id
        me.content = '';
        me._rendered = false;   // 自动输出
        me.withMask = true;     // 遮罩
        me.posCenter = true;    // 显示在中间
        me.posAdjust = true;
        me.keyEsc = true;
        me._reopen = false;     // 重新打开
        me.oWrap = null;

        QW.ObjectH.mix(me, options, 1);

        var fn = SubscribePanel.prototype;
        if(typeof me.open==='undefined'){

            fn.render = function(){
                var me = this;

                if(!W('#'+me.wrapId).length) {
                    var oWrap = QW.DomU.createElement("div");
                    oWrap.style.display = 'none';
                    oWrap.style.position = 'absolute';
                    me.oWrap = oWrap;
                    if (me.wrapId) oWrap.id = me.wrapId;

                    oWrap.innerHTML = me.content;

                    document.body.insertBefore(oWrap, document.body.firstChild);
                } else {
                    if(me._reopen){
                        me.oWrap.innerHTML = me.content;
                    }
                }
            }

            /**
             * 打开面板
             */
            fn.open = function(){
                var me = this;

                me._rendered = true;
                me._reopen = false;
                PanelManager.showPanel(me);
            }
            /**
             * 重新打开面板
             */
            fn.reopen = function(){
                var me = this;

                me._rendered = true;
                me._reopen = true;
                PanelManager.showPanel(me);
            }
            /**
             * 关闭面板
             */
            fn.close = function(){
                var me = this;

                PanelManager.hidePanel(me);
            }
            /**
             * 关闭面板,close的别名
             */
            fn.hide = function(){
                this.close();
            }
        }
    }

    window.showRightSubscribe = showRightSubscribe;

    //显示预约窗口
    function _showYuyue(){
        if(subscribe_obj === null){
            subscribe_obj = new SubscribePanel({
                content : '<div class="close-pop-btn pngfix" style="width:30px; height:30px;background:url(https://p.ssl.qhimg.com/t0192f1144bb7a81086.png) no-repeat scroll -1px 0;position:absolute;top:-3px; right:-8px;cursor:pointer;"></div><iframe src="'+BASE_ROOT+'yuyue?win=PanelManager" allowtransparency="true" frameborder="0" scrolling="no" width=585 height=508></iframe>'
            });

            subscribe_obj.open();
        }else{
            subscribe_obj.reopen();
        }
    }

    window.openYuyueWindow = _showYuyue;

})();

Dom.ready(function(){
    if(typeof(__inYuyuePage)=="undefined" || !__inYuyuePage){//不在预约frame中时触发。
        showRightSubscribe();
    }
});
