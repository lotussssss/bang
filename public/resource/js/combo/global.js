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


;/**import from `/resource/js/component/drag.js` **/
/*
	Copyright QWrap
	version: $version$ $release$ released
	author: JK
*/


(function() {

	var mix = QW.ObjectH.mix,
		lazyApply = QW.FunctionH.lazyApply,
		DomU = QW.DomU,
		createElement = DomU.createElement,
		NodeH = QW.NodeH,
		EventTargetH = QW.EventTargetH,
		on = EventTargetH.addEventListener,
		un = EventTargetH.removeEventListener,
		delegate = EventTargetH.delegate,
		ancestorNode = NodeH.ancestorNode,
		getCurrentStyle = NodeH.getCurrentStyle,
		setStyle = NodeH.setStyle,
		getRect = NodeH.getRect,
		setRect = NodeH.setRect,
		addClass = NodeH.addClass,
		removeClass = NodeH.removeClass,
		marginWidth = NodeH.marginWidth,
		EventH = QW.EventH,
		target = EventH.getTarget,
		preventDefault = EventH.preventDefault,
		pageX = EventH.getPageX,
		pageY = EventH.getPageY,
		CustEvent = QW.CustEvent;

	/**
	 * @class DragManager 是一个全局的拖动管理器。
	 * 每次只能有一个拖动在进行。
	 * 这个拖动的对象：oDrag。
	 * DragManager只对oDrag的三个Drag方法进调用，这三个方法是：
	 * ----dragstart
	 * ----drag
	 * ----dragend
	 * 程序员可以通过startDrag(e,oDrag)来委托DragManager开始管理一个拖动，直到有mouseup时，DragManager会终止对这个oDrag的管理。
	 * 本文件已实现三种oDrag,即：
	 * ----SimpleDrag，简单拖动个体对象。（SimpleResize是SimpleDrag的延伸）
	 * ----RectSelector，方框选择器
	 * ----LayoutDrag，布局拖动
	 */
	var DragManager = {
		isDragging: false,
		oDrag: null,	//当前被拖动的Drag对象。
		startDate: null,	//拖动开始时间
		startX: 0,	//拖动X坐标
		startY: 0,	//拖动Y坐标
		pageX: 0,	//pageX
		pageY: 0,	//pageY
		deltaX: 0,	//相对于起始，X的变化
		deltaY: 0,	//相对于起始，Y的变化
		deltaDeltaX: 0,	//相对于上一次mousemove，X的变化。（例如，本值大于0,表示鼠标在向右移）
		deltaDeltaY: 0,	//相对于上一次mousemove，Y的变化
		mouseDownTarget: null,	//mouseDown的对象
		startDrag: function(e, oDrag) {} //把一个Drag对象委托给DragManager管理。
	};

	(function() {
		var mouseD = function(e) {//mouseDown
			var obj = DragManager.oDrag;
			if(obj.fire('beforedragstart') === false) return;//JK: onbeforedragstart可以阻止拖动
			if (DragManager.isDragging || !obj) return;
			DragManager.isDragging = true;
			on(document, 'mousemove', mouseM);
			on(document, 'mouseup', mouseU);
			DragManager.startDate = new Date();
			DragManager.deltaX = DragManager.deltaY = DragManager.deltaDeltaX = DragManager.deltaDeltaY = 0;
			DragManager.startX = DragManager.pageX = pageX(e);
			DragManager.startY = DragManager.pageY = pageY(e);
			DragManager.mouseDownTarget = target(e);
			preventDefault(e);
			obj.dragstart(e); //调用Drag对象的dragstart方法
		};
		var mouseU = function(e) {//mouseUp
			var obj = DragManager.oDrag;
			if (!DragManager.isDragging || !obj) return;
			obj.dragend(e); //调用Drag对象的dragend方法
			DragManager.isDragging = false;
			DragManager.oDrag = null;
			un(document, 'mousemove', mouseM);
			un(document, 'mouseup', mouseU);
		};
		var mouseM = function(e) {//mouseMove
			var obj = DragManager.oDrag;
			if (!DragManager.isDragging || !obj) return;
			var x = pageX(e);
			var y = pageY(e);
			DragManager.deltaDeltaX = x - DragManager.pageX;
			DragManager.deltaDeltaY = y - DragManager.pageY;
			DragManager.pageX = x;
			DragManager.pageY = y;
			DragManager.deltaX = x - DragManager.startX;
			DragManager.deltaY = y - DragManager.startY;
			obj.drag(e); //调用Drag对象的drag方法
		};
		DragManager.startDrag = function(e, oDrag) {
			if (DragManager.isDragging) return false;
			DragManager.oDrag = oDrag;
			mouseD(e);
		};
	}());

	/**
	 * @class SimpleDrag 简单拖动
	 * @namespace QW
	 * @constructor
	 * @param {json} opts - 其它参数， 
		---目前只支持以下参数：
		{Element} oSrc 被拖动的节点对象
		{Element} oHdl 启动拖动事件的触发节点
		{Element} delegateContainer 代理拖动的容器。如果此属性为空，则为代理拖动。代理拖动情况下的oSrc与oHdl为即时获取。
		{string} oHdlSelector 代理拖动情况下，启动拖动事件的触发节点的selector
		{string} oSrcSelector 代理拖动情况下，通过oHdl找到oSrc。如果为空，则this.oSrc=this.oHdl；否则this.oSrc=ancestorNode(this.oHdl,selector)
		{Element} oProxy 拖动虚框节点
		{string} xAttr 拖动的x属性，默认为'left'
		{string} yAttr 拖动的y属性，默认为'top'
		{int} maxXAttr 最大x属性值
		{int} minXAttr 最小x属性值
		{int} maxYAttr 最大y属性值
		{int} minYAttr 最小y属性值
		{boolean} xFixed x属性固定，默认为false
		{boolean} yFixed x属性固定，默认为false
		{boolean} withProxy: false,
	 * @returns {SimpleDrag} 
	 */

	function SimpleDrag(opts) {
		mix(this, opts, 1);
		if (!this.lazyRender) this.render();
	}

	(function() {
		SimpleDrag.EVENTS = ['beforedragstart','dragstart', 'drag', 'dragend'];
		var $F = function(s) {
			return parseFloat(s) || 0;
		};
		SimpleDrag.prototype = {
			oSrc: null,
			oHdl: null,
			oProxy: null,
			xAttr: 'left',
			yAttr: 'top',
			className : 'proxy-dd',
			maxXAttr: null,
			minXAttr: null,
			maxYAttr: null,
			minYAttr: null,
			xFixed: false,
			yFixed: false,
			withProxy: false,
			getProxy: (function() {
				var proxy = null;
				return function() {
					var el = this.oProxy || proxy;
					if (!el) {
						el = createElement('div', {
							className: this.className
						});
						document.body.appendChild(el);
						el.style.display = 'none';
					}
					return this.oProxy = el;
				};
			}()),

			dragstart: function(e) {
				var me = this;
				if (me.oHdl.setCapture) me.oHdl.setCapture();
				me.startXAttr = $F(getCurrentStyle(me.oSrc, me.xAttr.replace(/^-/,'')));
				me.startYAttr = $F(getCurrentStyle(me.oSrc, me.yAttr.replace(/^-/,'')));
				if (me.withProxy) {
					var proxy = me.getProxy();
					var rect = getRect(me.oSrc);
					setRect(proxy, rect.left, rect.top, rect.width, rect.height, false);
					me.startXAttrProxy = $F(proxy.style[me.xAttr.replace(/^-/,'')]);
					me.startYAttrProxy = $F(proxy.style[me.yAttr.replace(/^-/,'')]);
					proxy.__deltaX = proxy.__deltaY = 0;
					lazyApply(
						function() {
							proxy.style.display = 'block';
						},
						null, 
						[], 
						20, 
						function() {
							if (me != DragManager.oDrag || proxy.style.display != 'none') return -1;
							if (DragManager.deltaX * DragManager.deltaX + DragManager.deltaY * DragManager.deltaY > 4 || (new Date() - DragManager.startDate) > 500) return 1;
							return 0;
						}
					);
				}
				me.fire('dragstart');
			},
			drag: function(e) {
				//修正delta. 
				var me = this,
					dirs = {
						X: 1,
						Y: 1
					};
				for (var i in dirs) {
					var iLow = i.toLowerCase();
					if (!me[iLow + 'Fixed']) {
						var delta = (me[iLow+'Attr'].indexOf('-') == 0 ? -1 : 1) * DragManager['delta' + i];
						if (me['max' + i + 'Attr'] != null) delta = Math.min(delta, me['max' + i + 'Attr'] - me['start' + i + 'Attr']);
						if (me['min' + i + 'Attr'] != null) delta = Math.max(delta, me['min' + i + 'Attr'] - me['start' + i + 'Attr']);
						if (me.withProxy) {
							try { //由于proxy带border,所以算出来的proxy宽度或高度有可能小于0，导致IE报错，所以try一下。
								setStyle(me.oProxy, me[iLow + 'Attr'], (me['start' + i + 'AttrProxy'] + delta) + 'px');
							} catch (ex) {}
							me.oProxy['__delta' + i] = delta;
						} else {
							setStyle(me.oSrc, me[iLow + 'Attr'].replace(/^-/,''), (me['start' + i + 'Attr'] + delta) + 'px');
						}
					}
				}
				me.fire('drag');
			},
			dragend: function(e) {
				var me = this;
				if (me.oHdl.releaseCapture) me.oHdl.releaseCapture();
				if (me.withProxy) {
					var proxy = me.oProxy;
					proxy.style.display = 'none';
					if (!me.xFixed) setStyle(me.oSrc, me.xAttr.replace(/^-/,''), (me.startXAttr + proxy.__deltaX) + 'px');
					if (!me.yFixed) setStyle(me.oSrc, me.yAttr.replace(/^-/,''), (me.startYAttr + proxy.__deltaY) + 'px');
				}
				me.fire('dragend');
			},
			render: function() {
				var me = this;
				if (me._rendered) return;
				CustEvent.createEvents(me, SimpleDrag.EVENTS);
				if (me.delegateContainer) {
					delegate(me.delegateContainer, me.oHdlSelector, 'mousedown', function(e) {
						me.oHdl = this;
						if(me.oSrcSelector){
							me.oSrc = ancestorNode(this, me.oSrcSelector);
						}
						else {
							me.oSrc = me.oHdl;
						}
						DragManager.startDrag(e && e.core || e, me);
					});
				}
				else {
					me.oHdl = me.oHdl || me.oSrc;
					on(me.oHdl, 'mousedown', function(e) {
						DragManager.startDrag(e, me);
					});
				}
				me._rendered = true;
			}
		};
	}());

	/**
	 * @class SimpleResize 简单大小调整
	 * @namespace QW
	 * @constructor
	 * @param {json} opts - 其它参数， 
		---参考SimpleDrap的相关参数，不同的是，以下四项的默认值有变化：
		{string} xAttr 拖动的x属性，默认为'width'
		{string} yAttr 拖动的y属性，默认为'height'
		{int} minXAttr 最小x属性值，默认为0
		{int} minYAttr 最小y属性值，默认为0
	 * @returns {SimpleResize} 
	 */
	function SimpleResize(opts) {
		SimpleDrag.call(this, opts);
	}

	(function() {
		SimpleResize.MENTOR_CLASS = SimpleDrag;
		SimpleResize.prototype = {
			xAttr: 'width',
			yAttr: 'height',
			minXAttr: 0,
			minYAttr: 0
		};
		mix(SimpleResize.prototype, SimpleDrag.prototype);
	}());


	/**
	 * @class RectSelector 方框选择器，用户需要在ondrag里处理真正的选择。
	 * @namespace QW
	 * @constructor
	 * @param {json} opts - 其它参数， 
		---目前只支持以下参数：
		{Element} oHdl 启动选择框的触发节点
		{Element} oProxy 拖动虚框节点，默认自动创建
		{string} blackSelectors4Start 启动选框的selector黑名单。
		{boolean} ignoreLeftButtonDrag 忽略右键拖框。
	 * @returns {RectSelector} 
	 */

	function RectSelector(opts) {
		mix(this, opts, 1);
		if (!this.lazyRender) this.render();
	}

	(function() {
		RectSelector.EVENTS = ['beforedragstart','dragstart', 'drag', 'dragend'];
		RectSelector.prototype = {
			oProxy: null,
			oHdl: null,
			className : 'proxy-rectselector',
			getProxy: (function() {
				var proxy = null;
				return function() {
					var el = this.oProxy || proxy;
					if (!el) {
						el = createElement('div', {
							className: this.className
						});
						document.body.appendChild(el);
						el.style.display = 'none';
					}
					return this.oProxy = el;
				};
			}()),
			dragstart: function(e) {
				this.oProxy = this.getProxy();

				//把代理出现的时间delay到第一次拖动时. by poker
				var me = this;
				lazyApply(
					function() {
						me.oProxy.style.display = 'block';
					},
					null,
					[],
					10,
					function() {
						if (me != DragManager.oDrag || me.oProxy.style.display != 'none') return -1;
						if (DragManager.deltaX * DragManager.deltaX + DragManager.deltaY * DragManager.deltaY > 2) return 1;
						return 0;
					}
				);

				if (this.oHdl.setCapture) this.oHdl.setCapture();
				setRect(this.oProxy, DragManager.startX, DragManager.startY, 1, 1);
				this.fire('dragstart');
			},
			drag: function(e) {
				setRect(this.oProxy, Math.min(DragManager.startX, DragManager.pageX), Math.min(DragManager.startY, DragManager.pageY), Math.abs(DragManager.deltaX), Math.abs(DragManager.deltaY));
				this.fire('drag');
			},
			dragend: function(e) {
				if (this.oHdl.releaseCapture) this.oHdl.releaseCapture();
				this.oProxy.style.display = 'none';
				this.fire('dragend');
			},
			render: function() {
				var me = this;
				if (me._rendered) return;
				CustEvent.createEvents(me, RectSelector.EVENTS);
				on(me.oHdl, 'mousedown', function(e) {
					if (me.ignoreLeftButtonDrag && (EventH.getEvent(e)||{}).button & 2) return ;
					if (me.blackSelectors4Start) {
						var el = target(e),
							pEls = [];
						while(el){
							if(el.tagName) pEls.push(el);
							el = el.parentNode;
						}
						if (QW.Selector.filter(pEls,me.blackSelectors4Start).length){
							return;
						}
						DragManager.startDrag(e, me);
					}
					else if (target(e) == me.oHdl) {
						DragManager.startDrag(e, me);
					}
				});
				me._rendered = true;
			}
		};
	}());


	/**
	 * @class LayoutDrag 布局拖动调整
	 * @namespace QW
	 * @constructor
	 * @param {json} opts - 其它参数， 
		---除了支持SimpleDrap的相关参数外，还支持支持以下参数：
		{boolean} isInline 是否是inline的模块，默认为false
		{array|collection} siblings “目的地”的参考位置对象，表示“目的地”是该对象的前面或后面
		{array|collection} containers “目的地”的容器对象，表示“目的地”是该对象里面。
	 * @returns {LayoutDrag} 
	 */
	function LayoutDrag(opts) {
		SimpleDrag.call(this, opts);
	}

	(function() {
		LayoutDrag.MENTOR_CLASS = SimpleDrag;
		LayoutDrag.prototype = {
			withProxy: true,
			isInline: false,
			//是否是inline的Layout.
			dragstart: function(e) {
				addClass(this.oSrc, 'dragingModule');
				SimpleDrag.prototype.dragstart.call(this, e);
			},
			dragend: function(e) {
				removeClass(this.oSrc, 'dragingModule');
				SimpleDrag.prototype.dragend.call(this, e);
			},
			/**
			 * adjustLayout(custEvent): 默认的调整模块位置函数，
			 */
			adjustLayout: function(custEvent) {
				var me = this,
					x = DragManager.pageX,
					y = DragManager.pageY,
					siblings = me.siblings,
					containers = me.containers,
					posAttr = me.isInline ? 'deltaDeltaX' : 'deltaDeltaY',
					rect;
				if (custEvent.type == 'dragstart') {
					if (me.__elAnim) { //如果有动画，则停止动画
						me.__elAnim.pause();
					}
				} else if (custEvent.type == 'drag') {
					if (containers || siblings) {
						var adjusted = false;
						//节约一点CPU
						rect = getRect(me.oSrc);
						var margins = marginWidth(me.oSrc);
						if (x >= rect.left - margins[3] && x <= rect.right + margins[1] && y >= rect.top - margins[0] && y <= rect.bottom + margins[2]) {
							return;
						}
						for (var i = 0; siblings != null && i < siblings.length; i++) {
							var obj = siblings[i];
							if (obj == me.oSrc) continue;
							rect = getRect(obj);
							margins = marginWidth(obj);
							if (x >= rect.left - margins[3] && x <= rect.right + margins[1] && y >= rect.top - margins[0] && y <= rect.bottom + margins[2]) {
								if (DragManager[posAttr] > 0) obj.parentNode.insertBefore(me.oSrc, obj.nextSibling);
								else if (DragManager[posAttr] < 0) obj.parentNode.insertBefore(me.oSrc, obj);
								adjusted = true;
								break;
							}
						}
						for (var i = 0; !adjusted && containers != null && i < containers.length; i++) {
							obj = containers[i];
							rect = getRect(obj);
							if (x > rect.left + 1 && x < rect.right - 1 && y > rect.top + 1 && y < rect.bottom - 1) {
								var refPosSibling = obj.firstChild, //寻找插入点
									lastRefSibling = null; //寻找最后一个参考元素
								while(refPosSibling){
									if(!refPosSibling.tagName){
										refPosSibling = refPosSibling.nextSibling;
									}
									else if(QW.ArrayH.contains(siblings,refPosSibling)) {
										lastRefSibling = refPosSibling;
										refPosSibling = refPosSibling.nextSibling;
									}
									else {
										break;
									}
								}
								if (lastRefSibling != me.oSrc) {
									obj.insertBefore(me.oSrc,refPosSibling);
									adjusted = true;
								}
								break;
							}
						}
						if (adjusted && me.oHdl.setCapture) me.oHdl.setCapture();
					}
				}
				if (custEvent.type == 'dragend') {
					if (me.needAnim && QW.ElAnim) {
						rect = getRect(me.oSrc);
						me.oProxy.style.display = 'block';
						var elAnim = new QW.ElAnim(me.oProxy, {
								width: {
									to: rect.width
								},
								height: {
									to: rect.height
								},
								left: {
									to: rect.left
								},
								top: {
									to: rect.top
								}
							}, 300);
						elAnim.on('end', function() {
							me.oProxy.style.display = 'none';
						});
						elAnim.play();
						me.oProxy.__elAnim = elAnim;
					}
				}
			},
			render: function() {
				var me = this;
				SimpleDrag.prototype.render.call(me);
				var adjustLayout = me.adjustLayout;
				if (adjustLayout) {
					me.on('dragstart', adjustLayout);
					me.on('drag', adjustLayout);
					me.on('dragend', adjustLayout);
				}
			}
		};
		mix(LayoutDrag.prototype, SimpleDrag.prototype);

	}());


	QW.provide({
		DragManager: DragManager,
		SimpleDrag: SimpleDrag,
		SimpleResize: SimpleResize,
		LayoutDrag: LayoutDrag,
		RectSelector: RectSelector
	});

}()); 


;/**import from `/resource/js/component/panel.js` **/
/*
 * @QWrap
 * @author: JK(JK_10000@yahoo.com.cn)
 * @create-date : 2008-10-27
 * @remark: 部分代码来自Baidu C2C,致谢
 */




(function() {


	var mix = QW.ObjectH.mix,
		remove = QW.ArrayH.remove,
		format = QW.StringH.format,
		ie6 = QW.Browser.ie6,
		DomU = QW.DomU,
		createElement = DomU.createElement,
		getDocRect = DomU.getDocRect,
		NodeH = QW.NodeH,
		on = QW.EventTargetH.addEventListener,
		un = QW.EventTargetH.removeEventListener,
		fire = NodeH.fire,
		hide = NodeH.hide,
		setStyle = NodeH.setStyle,
		getXY = NodeH.getXY,
		setCenter = function(el, w, h, x, y) {
			var rect = DomU.getDocRect();
			if (x == null) x = (rect.width - w) / 2 + rect.scrollX;
			x = Math.max(Math.min(x, rect.scrollX + rect.width - w), rect.scrollX);
			if (y == null) y = (rect.height - h) / 2 + rect.scrollY;
			y = Math.max(Math.min(y, rect.scrollY + rect.height - h), rect.scrollY);
			NodeH.setXY(el, x, y);
		},
		contains = NodeH.contains,
		removeNode = NodeH.removeNode,
		EventH = QW.EventH,
		target = EventH.getTarget,
		keyCode = EventH.getKeyCode,
		preventDefault = EventH.preventDefault,
		CustEvent = QW.CustEvent;


	/**
	 * IPanel: Panel的接口，其构造函数的参数为一个json对象。
	 QW.IPanel=function(opts){};
	 QW.IPanel.prototype={
	 oWrap:"el",
	 keyEsc:"bl",
	 withMask:"bl",
	 posCenter:"bl",
	 posAdjust:"bl",
	 isVisible:"bl",
	 render:function(){},
	 show:function(x, y, w, h, el){},//返回boolean，是否成功执行show
	 hide:function(){},//返回boolean，是否成功执行hide
	 dispose:function(){}
	 }
	 */

	/**
	 * PanelManager:Panel的管理器，它只对panel.oWrap与oMask进行显示隐藏的管理
	 */
	var PanelManager = {
		VERSION: "0.0.1"
	};

	(function() {

		var zIdx = 9999;
		var vPnls = [];
		var oMask, maskInterval = 0;

		function createMask() {
			var el = createElement("div", {
				className: "mask",
				tabIndex: -1,
				unselectable: "on"
			});
			if (ie6) {
				el.innerHTML = '<div unselectable="on"></div><iframe src="' + PanelManager.bgIframeSrc + '"></iframe>';
			}
			document.body.insertBefore(el, document.body.firstChild);
			return el;
		}

		function adjustMask() {
			var bd = oMask.offsetParent,
				de = document.documentElement,
				stl = oMask.style;
			if (parseInt(stl.top) != bd.scrollTop || parseInt(stl.left) != bd.scrollLeft) {
				stl.top = bd.scrollTop;
				stl.left = bd.scrollLeft;
			}
			if (de.clientHeight != oMask.offsetHeight) {
				stl.height = de.clientHeight;
			}
			if (de.clientWidth != oMask.offsetWidth) {
				stl.width = de.clientWidth;
			}
		}

		function refreshObserve(panel) { //更新或添加事件监控
		
			if (panel.keyEsc) {
				un(document, "keydown", PanelManager.keydownHdl);
				on(document, "keydown", PanelManager.keydownHdl);
			}
		}
		mix(PanelManager, {
			showPanel: function(panel, x, y, w, h, el) {
				if (panel._rendered) panel.render();
				remove(vPnls, panel);
				vPnls.push(panel);
				var style = panel.oWrap.style;
				if (panel.isVisible) {
					if (style.zIndex != zIdx) {
						style.zIndex = (zIdx += 2);
					}
				} else {
					style.zIndex = (zIdx += 2);
				}
				if (panel.withMask) {
					oMask = oMask || createMask();
					setStyle(oMask, {
						zIndex: zIdx - 1,
						display: "block"
					});
					if (ie6) {
						adjustMask(oMask);
						clearInterval(maskInterval);
						maskInterval = setInterval(adjustMask, 1000);
					}
				}
				//设宽/高
				if (w != null) {
					style.width = w + "px";
				}
				if (h != null) {
					style.height = h + "px";
				}
				//设位置
				if (panel.posCenter) {
					var wh = PanelManager.getWrapSize(panel); //得到实际大小
					setCenter(panel.oWrap, wh[0], wh[1], x, y);
				} else {
					x = x || 0;
					y = y || 0;
					if (el) {
						var xy = getXY(el);
						x += xy[0];
						y += xy[1];
					}
					if (panel.posAdjust) {//如果弹出框没有全部显示，则调整其位置
						var wh = PanelManager.getWrapSize(panel); //得到实际大小
						var rect = getDocRect();
						x = Math.min(x, rect.scrollX + rect.width - wh[0]);
						x = Math.max(x, rect.scrollX);
						y = Math.min(y, rect.scrollY + rect.height - wh[1]);
						y = Math.max(y, rect.scrollY);
					}
					style.left = x + "px";
					style.top = y + "px";
				}
				if ((panel.posAdjust || panel.posCenter) && vPnls.length > 1) {//避免两个panel重叠
				
					var prevPS = vPnls[vPnls.length - 2].oWrap.style;
					if (prevPS.top == style.top && prevPS.left == style.left) {
						style.top = (parseInt(style.top) + 10) + "px";
						style.left = (parseInt(style.left) + 10) + "px";
					}
				}
				style.display = "block";
				panel.isVisible = true;
				refreshObserve(panel);
			},
			hidePanel: function(panel) {
				hide(panel.oWrap);
				panel.isVisible = false;
				remove(vPnls, panel);
				var needMask = false;
				for (var i = vPnls.length - 1; i > -1; i--) {
					var pnl = vPnls[i];
					if (pnl.withMask) {
						needMask = true;
						oMask.style.zIndex = pnl.oWrap.style.zIndex - 1;
						break;
					}
				}
				if (!needMask && oMask) {
					hide(oMask);
					clearInterval(maskInterval);
				}
			},
			disposePanel: function(panel) {
				removeNode(panel.oWrap); //JK：IE6下会有内存泄漏。(对于有事件绑定的元素，被手动移除掉的话，有内存泄漏问题)
				//DomU.sendTrash(panel.oWrap)
				for (var i in panel) panel[i] = null;
				//if('function'==typeof CollectGarbage)CollectGarbage();
			},
			risePanel: function(panel) { //如果有多个panel可见，将当前panel提到最上层
			
				if (panel.isVisible) {
					var style = panel.oWrap.style;
					if (style.zIndex != zIdx) {
						style.zIndex = (zIdx += 2);
						remove(vPnls, panel);
						vPnls.push(panel);
						if (panel.withMask) {
							var sMask = oMask.style;
							sMask.zIndex = zIdx - 1;
						}
					}
				} else {
					alert("程序错误.");
					throw "错误：还没有打开panel呢.";
				}
			},

			keydownHdl: function(e) {//document onkeydown
				if (vPnls.length && keyCode(e) == 27) { //KEY_ESC:27
					var pnl = vPnls[vPnls.length - 1];
					if (pnl.keyEsc) {
						pnl.hide();
						preventDefault(e);
					}
				}
				if (!vPnls.length) un(document, "keydown", PanelManager.keydownHdl);
			},
			getWrapSize: function(panel, w, h) {
				var oWrap = panel.oWrap,
					style = oWrap.style;
				var oldS = [style.display, style.width, style.height];
				style.display = "block";
				if (w) style.width = w;
				if (h) style.height = h;
				var size = [oWrap.offsetWidth, oWrap.offsetHeight];
				style.display = oldS[0];
				if (oldS[1]) style.width = oldS[1];
				if (oldS[2]) style.height = oldS[2];
				return size;
			},
			bgIframeSrc: "about:blank" //'+QW.JSPATH+'util/panel/assets/Blank.html';//在必要的时候，例如https，要用Blank.html页面，以绕过安全检查
		});
	}());



	/** 
	 * BasePanel: 嵌镶板.
	 * @version: 0.0.1
	 */

	function BasePanel(opts) {
		mix(this, opts, 1);
		if (!this.lazyRender) this.render();
		return this;
	}

	(function() {
		BasePanel.EVENTS = ["beforeshow", "aftershow", "beforehide", "afterhide"];

		function setInner(el, sub) {
			sub = sub || "";
			if (sub.tagName) {
				el.innerHTML = "";
				el.appendChild(sub);
			} else {
				el.innerHTML = sub;
			}
		}

		BasePanel._elHtml = {
			content: '<div class="panel-content" remark="oContent"><div class="hd"></div><div class="bd"></div><div class="ft"></div></div>',
			closeHdl: '<span class="close"></span>',
			resizeHdl: '<span class="resize"><span></span></span>',
			corner1: '<span class="co1"><span></span></span>',
			corner2: '<span class="co2"><span></span></span>',
			cue: '<span class="cue"></span>',
			shadow: '<span class="sd"></span>',
			bgIframe: '<iframe class="panel-iframe" src="' + PanelManager.bgIframeSrc + '" FRAMEBORDER=0 height="100%"></iframe>'
		};


		BasePanel.prototype = {
			defaultClassName: "panel",
			//参数
			wrapId: "",
			className: "",
			title: "",
			header: "",
			body: "Panel Body",
			footer: "",
			withCorner: 0,
			withCue: 0,
			withShadow: 0,
			withClose: 0,
			withBgIframe: ie6,
			withMask: 0,

			dragable: 0,
			resizable: 0,
			keyEsc: 0,
			posCenter: 0,
			posAdjust: 0,

			//public属性
			isVisible: false,
			oWrap: null,
			oContent: null,
			oHeader: null,
			oBody: null,
			oFooter: null,
			oCloseHdl: null,
			oResizeHdl: null,
			oShadow: null,
			oCue: null,
			oCorner1: null,
			oCorner2: null,
			oBgIframe: null,

			/**
			 *render(): 初始化
			 *@return {void}: 
			 */
			render: function() {
				var me = this;
				if (me._rendered) return;

				//render panel structure
				{
					var oWrap = createElement("div", {
						className: me.defaultClassName + " " + (me.className || "")
					});
					oWrap.style.display = "none";
					me.oWrap = oWrap;
					if (me.wrapId) oWrap.id = me.wrapId;
					hide(oWrap);
					var elHtml = BasePanel._elHtml;
					var html = [
						elHtml.content, me.withClose ? elHtml.closeHdl : "", 
						me.resizable ? elHtml.resizeHdl : "", 
						me.withCorner ? (elHtml.corner1 + elHtml.corner2) : "", 
						me.withCue ? elHtml.cue : "", 
						me.withShadow ? elHtml.shadow : "", 
						(me.withBgIframe && ie6) ? elHtml.bgIframe : ""
					];
					oWrap.innerHTML = html.join("");
					var els = oWrap.childNodes;
					me.oContent = els[0];
					var i = 1;
					if (me.withClose) {
						me.oCloseHdl = els[i++];
					}
					if (me.resizable) {
						me.oResizeHdl = els[i++];
					}
					if (me.withCorner) {
						me.oCorner1 = els[i++];
						me.oCorner2 = els[i++];
					}
					if (me.withCue) {
						me.oCue = els[i++];
					}
					if (me.withShadow) {
						me.oShadow = els[i++];
					}
					if (me.withBgIframe && ie6) {
						me.oBgIframe = els[i++];
					}
					var els = me.oContent.childNodes;
					me.oHeader = els[0];
					me.oBody = els[1];
					me.oFooter = els[2];

					me.isVisible = false;
				}
				//render arguments
				{
					var header = (me.title && "<h3>" + me.title + "</h3>") || me.header;
					if (header) setInner(me.oHeader, header);
					if (me.body) setInner(me.oBody, me.body);
					if (me.footer) setInner(me.oFooter, me.footer);
				}
				//observe events
				{
					if (me.withClose) {
						on(me.oCloseHdl, "click", function() {
							me.hide();
						});
					}
					if (me.dragable) {
						me.initDrag();
					}
					if (me.resizable) {
						me.initResize();
					}
				}
				document.body.insertBefore(oWrap, document.body.firstChild);
				CustEvent.createEvents(me, BasePanel.EVENTS);
				me._rendered = true;
			},
			/**
			 *show(x, y, w, h, el): 显示一个panel
			 *@param {int} x: left，可以为空
			 *@param {int} y: top，可以为空
			 *@param {int} w: width，如果oWrap没有宽度，最好设一下这个宽度
			 *@param {int} h: height，可以为空
			 *@param {Element} el: 位置参考元素。
			 *@return {boolean}: 是否顺利show。（因为onbeforeshow有可能阻止了show）
			 */
			show: function(x, y, w, h, el) {
				if (this._rendered) this.render();
				if (this.fire('beforeshow') == false) return false;
				PanelManager.showPanel(this, x, y, w, h, el);
				this.fire('aftershow');
				return true;
			},
			/**
			 *hide(): 隐藏一个panel
			 *@return {boolean}: 是否顺利hide。（因为onbeforehide有可能阻止了hide）
			 */
			hide: function() {
				if (this.fire('beforehide') == false) return false;
				PanelManager.hidePanel(this);
				this.fire('afterhide');
				return true;
			},
			/**
			 *dispose(): 销毁一个panel
			 *@return {boolean}: 是否顺利dispose。（只有已隐藏的panel才能被销毁）
			 */
			dispose: function() {
				if (this.isVisible) return false;
				else PanelManager.disposePanel(this);
			},
			/**
			 *rise(): 提到顶层
			 *@return {void}: 
			 */
			rise: function() {
				PanelManager.risePanel(this);
			},
			/**
			 *initDrag(): 初始化拖动。有默认值
			 */
			initDrag: function() {
				var panel = this;
				var oDrag = new QW.SimpleDrag({
					oSrc: this.oWrap,
					oHdl: this.oHeader,
					minXAttr: 1,
					minYAttr: 1,
					withProxy: true
				});
				oDrag.on('dragstart', function() {
					panel.rise();
				});
				//this.oDrag=oDrag;//这一句会导致IE6下的内存泄漏
			},
			/**
			 *initResize(): 初始化拖动。有默认值
			 */
			initResize: function() {
				var panel = this;
				var oResize = new QW.SimpleResize({
					oSrc: this.oWrap,
					oHdl: this.oResizeHdl,
					minXAttr: 150,
					yFixed: true,
					withProxy: true
				});
				oResize.on('dragstart', function() {
					panel.rise();
				});
				//this.oResize=oResize;//这一句会导致IE6下的内存泄漏
			}
		}
	}());

	/**
	 * LayerPopup: 一种特别化了的BasePanel，以模拟window.pupup，
	 * 相对BasePanel多出一个参数：{Array} relatedEls: 关系对象，在其内的点击不会导致popup消失
	 */

	function LayerPopup(opts) {
		mix(this, opts, 1);
		if (!this.lazyRender) this.render();
		return this;
	}

	(function() {
		LayerPopup.MENTOR_CLASS = BasePanel;
		LayerPopup.prototype = {

			/**
			 * @public {HTMLElement||Array} relatedEls: 例外的element(s). 在其中的keydown/mousedown不会导致popup自动hide.
			 * @type {String|HTMLElement}
			 * @default {空字符串}
			 */
			posAdjust: 1,
			defaultClassName: "panel panel-popup",
			relatedEls: null,
			_refreshBlurHdl: function(keepObserving) {
				if (this._fnBlur) {
					un(document, "keydown", this._fnBlur);
					un(document, "keyup", this._fnBlur);
					un(document, "mousedown", this._fnBlur);
					if (keepObserving) {
						on(document, "keydown", this._fnBlur);
						on(document, "keyup", this._fnBlur);
						on(document, "mousedown", this._fnBlur);
					}
				}
			},
			show: function(x, y, w, h, el) {
				var me = this;
				if (me._rendered) me.render();
				me._fnBlur = me._fnBlur || function(e) {
					var el = target(e) || document.body; //JK:有时事件是由fireEvent触发，这时IE找不到target。所以加个“||”
					if (!me.oWrap) return;
					var relatedEls = me.relatedEls || [];
					relatedEls.push(me.oWrap);
					for (var i = 0; i < relatedEls.length; i++) {
						var elI = relatedEls[i];
						if (elI == el || contains(elI, el)) return;
					}
					me.hide();
				};
				if (me.fire('beforeshow') == false) return false;
				PanelManager.showPanel(me, x, y, w, h, el);
				me._refreshBlurHdl(true);
				me.fire('aftershow');
				return true;
			},
			hide: function() {
				if (this.fire('beforehide') == false) return false;
				PanelManager.hidePanel(this);
				this._refreshBlurHdl(false);
				this.fire('afterhide');
				return true;
			}
		};
		mix(LayerPopup.prototype, BasePanel.prototype);
	}());


	/**
	 * LayerDialog: 一种特别化了的BasePanel，以模拟window.showModalDialog，若有callback,需要监控onafterhide事件.
	 */

	function LayerDialog(opts) {
		mix(this, opts, 1);
		if (!this.lazyRender) this.render();
		return this;
	}
	(function() {
		LayerDialog.MENTOR_CLASS = BasePanel;
		LayerDialog.prototype = {
			defaultClassName: "panel panel-dialog",
			withMask: 1,
			withClose: 1,
			dragable: !!QW.SimpleDrag
		};
		mix(LayerDialog.prototype, BasePanel.prototype);
	}());

	/**
	 * @static QW.Panel: 集成一些方法，方便用户调用.
	 * @param {json} opts: 弹出框的参数，除了支持BasePanel的所有参数外，还支持：
	 {int} width:　弹出框宽度，默认为300
	 {height} height: 弹出框高度，不需默认值.
	 *QW.Panel.alert(msg,callback,opts);
	 *QW.Panel.confirm(msg,callback,opts);
	 *QW.Panel.prompt(msg,defaultValue,callback,opts);
	 *QW.Panel.msgbox(msg,callback,opts);
	 */
	var Panel = (function() {
		var bodyHtml = {
			alert: '<div class="panel-dialog-sys panel-alert cls"><div class="msg">{0}</div><div class="btn-ctn"><button>确定</button></div></div>',
			confirm: '<div class="panel-dialog-sys panel-confirm cls"><div class="msg">{0}</div><div class="btn-ctn"><button>确定</button><button>取消</button></div></div>',
			prompt: '<div class="panel-dialog-sys panel-prompt cls"><div class="msg">{0}</div><div class="ipt-ctn"><input type="text-input"></div><div class="btn-ctn"><button>确定</button><button>取消</button></div></div>',
			msgbox: '<div class="panel-dialog-sys panel-msgbox cls"><div class="msg">{0}</div><div class="btn-ctn"><button>是(Yes)</button><button>否(No)</button><button>取消</button></div></div>'
		};

		var Panel = {
			getSysDialog: function(type, msg, callback, opts) {
				opts = opts || {};
				mix(opts, {
					posCenter: 1,
					keyEsc: 1,
					title: "系统提示",
					dragable: !!QW.SimpleDrag,
					body: format(bodyHtml[type] || "error", msg) //JK:出现error表示参数传少了
				});
				var panel = new LayerDialog(opts);
				var btns = panel.oWrap.getElementsByTagName("button");
				panel.dialogButtons = btns;
				switch (type) {
				case "alert":
					on(btns[0], "click", function(e) {
						panel.hide();
					})
					break;
				case "confirm":
					on(btns[0], "click", function(e) {
						panel.returnValue = true;
						panel.hide();
					});
					on(btns[1], "click", function(e) {
						panel.hide();
					});
					panel.returnValue = false;
					break;
				case "prompt":
					var input = panel.oWrap.getElementsByTagName("input")[0];
					panel.dialogInput = input;
					on(input, "keydown", function(e) {
						if (keyCode(e) == EventH.KEY_ENTER) {
							setTimeout(function() {
								fire(btns[0], "click");
							}, 10);
						}
					}); //Opera下,如是立即隐藏,会触发隐藏后鼠标下的button的onclick事件.
					on(btns[0], "click", function(e) {
						panel.returnValue = input.value;
						panel.hide();
					});
					on(btns[1], "click", function(e) {
						panel.hide();
					});
					break;
				case "msgbox":
					on(btns[0], "click", function(e) {
						panel.returnValue = true;
						panel.hide();
					});
					on(btns[1], "click", function(e) {
						panel.returnValue = false;
						panel.hide();
					});
					on(btns[2], "click", function(e) {
						panel.hide();
					});
					break;
				}
				panel.on('aftershow', function() {
					var el = (input || btns[0]);
					try {
						el.focus();
						el.select();
					} catch (ex) {}
				});
				panel.on('afterhide', function() {
					try {
						callback && callback(this.returnValue);
					} finally {}
				});
				return panel;
			},
			_sysDialog: function(type, msg, defaultValue, callback, opts) {
				opts = opts || {};
				var dlg = QW.Panel.getSysDialog(type, msg, callback, opts);
				if (type == "prompt") dlg.dialogInput.value = defaultValue || "";
				dlg.show(null, null, opts.width || 300, opts.height)
				//dlg.on('afterhide',function(){dlg.dispose();});
			},
			alert: function(msg, callback, opts) {
				QW.Panel._sysDialog("alert", msg, null, callback, opts)
			},
			confirm: function(msg, callback, opts) {
				QW.Panel._sysDialog("confirm", msg, null, callback, opts)
			},
			prompt: function(msg, defaultValue, callback, opts) {
				QW.Panel._sysDialog("prompt", msg, defaultValue, callback, opts)
			},
			msgbox: function(msg, callback, opts) {
				QW.Panel._sysDialog("msgbox", msg, null, callback, opts)
			}
		};
		return Panel;
	}());

	QW.provide({
		PanelManager: PanelManager,
		BasePanel: BasePanel,
		LayerPopup: LayerPopup,
		LayerDialog: LayerDialog,
		Panel: Panel
	});

}());

;/**import from `/resource/js/component/cookie.js` **/
/*
	Copyright (c) Baidu Youa Wed QWrap
	version: $version$ $release$ released
	author: Jerry(屈光宇)、JK(部分修改)
*/


(function() {
	/**
	 * @class Cookie Cookie类
	 * @namespace QW
	 * @param {Json} options (Optional) Cookie参数配置，目前支持以下配置
	 *  {string} path 
	 *  {string} domain  
	 *  {int} expires
	 *  {string} secure 
	 */
	function Cookie(options) {
		Object.mix(this, options || {});
	}

	Cookie.prototype = {
		/**
		 * 存储
		 * @method set
		 * @param {string} key
		 * @param {string} value
		 * @return void
		 */
		set:function(key, value){
			var expires = this.expires;

			if(typeof(expires) == "number"){
				expires = new Date();
				expires.setTime(expires.getTime() + this.expires);
			}

			document.cookie =
				key + "=" + escape(value)
				+ (expires ? ";expires=" + expires.toGMTString() : "")
				+ (this.path ? ";path=" + this.path : "")
				+ (this.domain ? "; domain=" + this.domain : "")
				+ (this.secure ? "; secure" : "");
		},

		/**
		 * 读取
		 * @method get
		 * @param {string} key
		 * @return string
		 */
		get:function(key){
			var a, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
			if(a = document.cookie.match(reg)){
				return unescape(a[2]);
			}else{
				return "";
			}
		},
		
		/*
		 * 移除
		 * @method remove
		 * @param {string} key
		 * @return void
		 */
		remove:function(key){
			var old=this.expires;
			this.expires = new Date(0);
			this.set(key,"");
			this.expires=old;
		}
	};


	/**
	 * 存储
	 * @method set
	 * @static
	 * @param {string} key
	 * @param {string} value
	 * @param {Json} options (Optional) 更多cookie参数
	 * @return void
	 */
	Cookie.set=function(key,value,options){
		new Cookie(options).set(key,value);
	};

	/**
	 * 读取
	 * @method get
	 * @static
	 * @param {string} key
	 * @param {Json} options (Optional) 更多cookie参数
	 * @return string
	 */
	Cookie.get=function(key,options){
		return new Cookie(options).get(key);
	};

	/**
	 * 移除
	 * @method set
	 * @static
	 * @param {string} key
	 * @param {Json} options (Optional) 更多cookie参数
	 * @return void
	 */
	Cookie.remove=function(key,options){
		new Cookie(options).remove(key);
	};

	QW.provide('Cookie', Cookie);
}());

;/**import from `/resource/js/component/citypanel2.js` **/
(function() {
    var _CityData = null;

    // 获取城市数据
    function getCityData(callback){
        if (_CityData){
            var wCityList = W('#JsCityList');
            if ( !(wCityList && wCityList.length) ) {
                var city_list = W('#JsCityPanelTpl').html().trim().tmpl()({
                    '_id': 'JsCityList',
                    'hotcity': _CityData['hotcity'],
                    'letter': _CityData['letter'],
                    'citylist': _CityData['citylist']
                });
                wCityList = W(city_list).appendTo(W('body'));
            }

            typeof callback === 'function' && callback(wCityList);

        } else {
            QW.Ajax.get('/aj/getcitycode', function (res) {
                res = JSON.parse(res);

                if (!res['errno']) {
                    var result = res['result'];

                    var letter   = [],//QW.ObjectH.keys(result['citylist']);
                        citylist = [];
                    QW.ObjectH.map(result['citylist'], function (v, k) {
                        letter.push(k);
                        citylist.push(v);
                    });

                    _CityData = {
                        'hotcity': result['hotcity'],
                        'letter': letter,
                        'citylist': citylist
                    };

                    var wCityList = W('#JsCityList');
                    if ( !(wCityList && wCityList.length) ) {
                        var city_list = W('#JsCityPanelTpl').html().trim().tmpl()({
                            '_id': 'JsCityList',
                            'hotcity': _CityData['hotcity'],
                            'letter': _CityData['letter'],
                            'citylist': _CityData['citylist']
                        });
                        wCityList = W(city_list).appendTo(W('body'));
                    }

                    typeof callback === 'function' && callback(wCityList);
                }
            });
        }
    }

	function CityPanel() {
		this.init.apply(this, arguments);
	}

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

                            if( !flag && instance.container && (!instance.container[0] == e.target || !instance.container.contains(e.target)) ) {

                                instance.container.fadeOut(150);
                                instance.fire('close');
                            }
                        });
                    CityPanel.prototype._documentBind = true;
                }

                // 获取城市列表
                getCityData(function(wCityList){

                    instance.container = wCityList
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
                });

                instance.trigger = W(trigger).click(function(e) {
                    e.preventDefault();

                    var wTri = W(this);

                    var pos = wTri.getRect();
                    //是否关闭一直出现
                    if(wTri.attr('data-close')=='hide'){
                        instance.container.query('.city_close').hide();
                    }else{
                        instance.container.query('.city_close').show();
                    }
                    var fix_top = 1;
                    if (wTri.attr('x-offset')) {
                        instance.container
                            .css({'left' : pos.left - wTri.attr('x-offset'), 'top' : pos.height + pos.top + fix_top})
                            .fadeIn(150);
                    }
                    else if( wTri.attr('data-floatright') ){
                        instance.container
                            .css({'left' : pos.left - 380, 'top' : pos.height + pos.top + fix_top})
                            .fadeIn(150);
                    }else{
                        instance.container
                            .css({'left' : pos.left, 'top' : pos.height + pos.top + fix_top})
                            .fadeIn(150);
                    }

                    //修正IE7下相关bug。IE7，360IE模式下，父级还有position:fixed, 上面的pos.top的值获取不正确，需要修正。需要把posisiton为fixed的父级点传到data-parentfixed参数里。如data-parentfixed="#doc-menubar-fixed"
                    if( wTri.attr('data-parentfixed') ){
                        var pf = wTri.ancestorNode( wTri.attr('data-parentfixed') );
                        var poffsettop = wTri.attr('data-parenttop')-0 || 30;
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
                                city = this.getAttribute('data-citycode'),
                                cityid = this.getAttribute('data-cityid');
                            if(!name || !city) return;

                            instance.fire('selectCity', {'name' : name, 'city' : city, 'cityid': cityid});
                            instance.container.hide();
                        });
                });
                // 将trigger添加到所有的trigger列表里
                CityPanel.prototype._triggerList.push(instance.trigger);
			},
            _triggerList: [],
            _documentBind: false // 是否已经写过了document的事件绑定
		};
	})();

	QW.provide({'CityPanel' : CityPanel});
})();

;/**import from `/resource/js/page/global.js` **/
(function() {
	//qwrap116中无bind方法，这个原来是在passport的js中的，需要补上
	NodeW.prototype.bind=NodeW.prototype.on;

	function customPassport (){
		//ie6主页面设置了domain之后，表单往iframe提交，需要修改iframe的domain与主页面一致
		if(QW.Browser.ie6) {
			setTimeout(function() {
				try {
					if(W('.quc-ie6-iframe').length) {
						var ifr = W('.quc-ie6-iframe')[0];
						ifr.src = "javascript:void(function(d){d.open();d.domain='360.cn';d.close();}(document));"
					}
				} catch(e){}
			}, 10);
		}

	}

	//注册
	QHPass.init('pcw_tcb');

	//登录配置
    QHPass.setConfig("signIn", {
		types: ['quick', 'normal'],  //和 优品不一样，无手机登录
    	panelTitle: '欢迎登录360同城帮'
    });

	//注册配置
	QHPass.setConfig("signUp", {
		panelTitle : "欢迎注册360同城帮",
        hideUsername : true,
        hideNickname : true,
        hidePasswordAgain : true
    });

	//处理IE6、重绘结构等
    QHPass.events.one('afterShow.signUp  afterShow.signIn', customPassport);

    //登录、注册后默认处理
    QHPass.__loginDefaultFun = function(){ setTimeout(function(){ window.location.reload(true); }, 300) };

	tcb.bindEvent('.topbar', {
		'.user-login' : function(e) {
			e.preventDefault();

            var wMe = W(this);
            var redirect = wMe.attr('data-url');

		    QHPass.when.signIn( redirect? function(){ window.location.href=redirect; } : QHPass.__loginDefaultFun );
		},
		'.user-logout' : function(e) {
			QHPass.signOut( QHPass.__loginDefaultFun );
		},
		'.user-reg' : function(e) {
			e.preventDefault();

			QHPass.signUp( QHPass.__loginDefaultFun );
		},
		'.has-sub' : {
			'mouseenter' : function() {
				var me = W(this);
				me.addClass('hover');
				if(QW.Browser.ie6){
					me.query('.sub').css('width',me.getSize().width-2);
				}
			},
			'mouseleave' : function() {
				W(this).removeClass('hover');
			}
		}
	});

	var showAuditSuccessPanel = function() {
		var panel = tcb.alert('提示', '<div class="clearfix" style="height:120px"><div class="desc"><p>您好，您的开店申请已经通过审核，请不要重复申请。<br /><br /><a href="'+MER_BASE_INFO.shop_url+'">进入我的店铺</a></p></div></div>',
		    	{
		        	'width' : 410,
		        	'wrapId' : 'panelAuditFail'
		    	}, function() {
		    		panel.hide();
		    	});

		return panel;
	};

	var showAuditWaitPanel = function() {
		//var panel = tcb.alert('审核通知', '<div class="clearfix" style="height:120px"><div class="desc"><p>您的申请已经提交，我们将在10日内完成审核工作。<br /><br />审核结果将发送至您的手机：<span class="phone">' + MER_BASE_INFO.mobile + '</span><br /><a href="http://i.360.cn/security/modifyboundmobile" target="_blank">修改号码</a></p></div></div>',
		var panel = tcb.alert('审核通知', '<div class="clearfix" style="height:120px"><div class="desc"><p>我们正在加紧改进同城帮的网站和机制，商家申请临时停止。申请恢复后，我们将会在网页上公告。感谢您一如既往地关心同城帮。</p></div></div>',
			    {
			        'width' : 410,
			        'wrapId' : 'panelAuditInfo'
			    }, function() {
			    	panel.hide();
			    });

		return panel;
	};

	var showAuditFailPanel = function() {
		var panel = tcb.alert('审核通知', '<div class="clearfix" style="height:120px"><div class="desc"><p>您好，您的开店申请未通过审核，请及时查看并重新申请。</p></div></div>',
		    	{
		        	'width' : 410,
		        	'wrapId' : 'panelAuditFail'
		    	}, function() {
		    		location.href = BASE_ROOT + 'applyshop/';
		    		panel.hide();
		    	});

		return panel;
	};
	//go to top
	(function() {

	    var width = document.body.clientWidth||document.documentElement.clientWidth;
	    if(width-960>0){
			var o = {
				headH: 50,
				right:10,
				bottom: 42
			};
			tcb.gotoTop.init(o);
		}

		W(window).on('resize', function(){

			var _width = document.body.clientWidth||document.documentElement.clientWidth;
			if(_width>1000){
				W('.returnToTop').show();
				W('.returnToTop a').css({'right':10});
			}else{
				W('.returnToTop').hide();
			}
		});

	})();

	tcb.bindEvent('body', {
        //点击申请商家button，提示对应状态
        '.btn-apply-shop' : function(e) {
        	e.preventDefault();

        	var run = function() {
				if(!MER_BASE_INFO.user_type) {
					location.hash = 'applyshop';
					location.reload();
				}

				//普通用户，未申请过商家
				if(MER_BASE_INFO.user_type == 1 && !MER_BASE_INFO.status) {
					location.href = BASE_ROOT+ 'applyshop/';
				}

				//已经是商家
				if(MER_BASE_INFO.user_type == 2) {
					showAuditSuccessPanel();
					return;
				}

				var status = (MER_BASE_INFO.status||'').trim();

				if(status == 'wait') { //等待审核
					showAuditWaitPanel();
				} else if(status == 'unconfirmed') { //未通过
					showAuditFailPanel();
				}
        	};

        	QHPass.when.username( run );
		},
		'.icon-zan511' : function(e){
			e.preventDefault();
			var shopid = W(this).attr('data-shopid')||'';

			QW.Ajax.post('/aj/shop_zan/',{ 'enshopid' : shopid, 'act':'zan'  },function(){});

			DomU.insertCssText('#zan511Panel .panel-content{ background: url(https://p.ssl.qhimg.com/t01775c928c808b230b.png) no-repeat scroll 0 0; position: relative; } #zan511Panel .mobile-box{ position: absolute; width: 276px; height:32px;line-height:32px; left:100px; top:206px;  } #zan511Panel .mobile{width: 256px; height:32px;line-height:32px; padding:0 10px; border:0; background: transparent; position:absolute;} #zan511Panel .mobile-box .ele4phtips{position:absolute; left:0; top:0; margin-left:10px; color:#999;} #zan511Panel .submit{ position: absolute; background: url(https://p.ssl.qhimg.com/t01775c928c808b230b.png) no-repeat scroll 0 -331px; width: 127px; height:39px;  left:184px; top:262px; border:0;cursor: pointer;} #zan511Panel .submit:hover{opacity: :0.8;filter:alpha(opacity=80);} #zan511Panel .submit:active{opacity: :0.9;filter:alpha(opacity=90); }');
			var zanPanel = tcb.panel("企业服务-上门维修", '<form action="/aj/shop_zan/" method="post" class="zan-511-form"><input type="hidden" name="enshopid" value="'+shopid+'"><input type="hidden" name="act" value="mobile"><div class="mobile-box"><input class="mobile" maxlength="11" name="mobile" placeholder="请输入11位常用手机号码"></div><input type="submit" class="submit" value=""></form>', {
				'width' : 493 ,
				'height' : 327 ,
				"withShadow": true,
				"wrapId" : "zan511Panel",
				"className" : "panel panel-tom01 border8-panel pngfix"
			});

			try{
				new PlaceHolder('#zan511Panel .mobile');
			}catch(ex){}

			W('#zan511Panel .mobile').on('keyup', function(e){
				W(this).val( W(this).val().replace(/\D/g, '') );
			});

			W('#zan511Panel .zan-511-form').on('submit', function(e){
				var _form = this;
				e.preventDefault();
				var mo = W('#zan511Panel .mobile');
				if( mo.val().trim().length!=11 ){
					mo.shine4Error().focus();
					return false;
				}

				QW.Ajax.post(_form, function(data){
					data = QW.JSON.parse(data);
					if(data.errno==0){
						alert('提交成功，感谢您的参与');
						zanPanel.hide();
					}else{
						alert('抱歉，出错了。'+data.errmsg);
					}
				});
				return false;
			});
		},
        // 投诉建议
        '.doc-topbar-tousujianyi': function(e){
            e.preventDefault();

            var alert = tcb.alert('投诉建议', '<div style="padding:20px;">您好，如对我们的服务意见或建议，请发邮件至：<a href="mailto:kefu@bang.360.cn">kefu@bang.360.cn</a>（请留下您的订单号及电话，便于工作人员与您联系）详细说明。<br/>温馨提示：您也可以点”在线客服“会有工作人员在线为您服务。（点击在线客服弹出聊天窗口）</div>', {}, function(){alert.hide();});
        },
        // 显示“我的订单”入口qrcode
        '.js-myorder-enter-qrcode-trigger': function(e){
            e.preventDefault();

            var html_fn  = W('#JsMyorderEnterQrcodeTpl').html().trim().tmpl(),
                html_str = html_fn({});

            tcb.panel('', html_str, {
                'className': 'panel-tom01 myorder-enter-qrcode-wrap'
            });
        }
	});

	(function() {
		//首页未登录，点申请后会刷新页面，hash == '#apply'，这时候，帮用户点一下申请按钮
		if(location.hash == '#applyshop') {
			W('.btn-apply-shop').click();
			return;
		}

		var locationHref;
		try {
			locationHref = location.href;
		} catch(e) {
			locationHref = document.createElement( "a" );
			locationHref.href = "";
			locationHref = locationHref.href;
		}

		if(locationHref.indexOf('/applyshop') > -1 && locationHref.indexOf('/applyverify') == -1) {
			/*如果在审核页，判断下审核状态;
			*如果已经是商家或者等待审核中，出对应浮层。
			*/

			//已经是商家
			if(MER_BASE_INFO.user_type == 2) {
				var panel = showAuditSuccessPanel();
				panel.onbeforehide = function() {
					location.href = MER_BASE_INFO.shop_url || '/';
				};
				return;
			}

			var status = (MER_BASE_INFO.status||'').trim();

			if(status == 'wait') { //等待审核
				var panel = showAuditWaitPanel();
				panel.onbeforehide = function() {
					location.href = '/';
				};
			}
		} else {
			/*如果是未审核通过和审核中两种状态，出提示浮层。
			*关闭后记cookie，浏览器关闭前不再出浮层。
			*/
			if(MER_BASE_INFO.user_type == 2 || !MER_BASE_INFO.status) {
				return;
			}

			if(QW.Cookie.get('show_audit_panel')) {
				return;
			}

			if( window.location.href.indexOf('/client')>-1 || window.location.href.indexOf('inclient')>-1 ){ //如果是在客户端里，不出提示
				return;
			}

			var status = (MER_BASE_INFO.status||'').trim(),
				panel;

			if(status == 'wait') { //等待审核
				panel = showAuditWaitPanel();
			} else if(status == 'unconfirmed') { //未通过
				panel = showAuditFailPanel();
			}

			if(panel) {
				panel.onafterhide = function() {
					QW.Cookie.set('show_audit_panel', '1', {'path' : '/'});
				}
			}
		}
	})();

	/**
	 * 顶部搜索框处理
	 * @return {[type]} [description]
	 */
	function topSearchBox(){
		var CAN_DEFAULT_SEARCH = false;  //在点击搜索按钮时，是否允许进行默认填写的关键字的搜索。

		if(W('.tcb-top-search').length > 0){
			W('.tcb-top-search').on('submit', function(e){
				e.preventDefault();
				var keyword = W(this).one('input[name="keyword"]');

				if(!CAN_DEFAULT_SEARCH && ( keyword.val().trim().length == 0 || keyword.val().trim() == keyword.attr('data-default')) ){
					keyword.shine4Error().focus();
					return false;
				}else{
					W(this).submit();
					return true;
				}
			});
		}
	}

	//冻结搜索框完整版
    function fixedTopSubmenu(){
    	if( W('#docSubMenu').length>0 ){

	    	if( W('#docSubMenu-fixed').length==0 ){
	    		W('<div id="docSubMenu-fixed" class="doc-sub-menu-fixed"></div>').prependTo( W('body') );
	    		W('#docSubMenu').cloneNode(true).attr('id','').appendTo( W('#docSubMenu-fixed') );
	    	}

			function autoFixedTopMenu(){
				var tbH = W('#doc-topbar').getSize().height - 0 + W('#doc-menubar').getSize().height;
				var dST = document.documentElement.scrollTop || document.body.scrollTop;
				var dmH = W('#docSubMenu .menu-list').getSize().height;

				W('#docSubMenu-fixed').css('height', dmH);
				if( dST>= tbH ){//显示浮动菜单
					if( W('#docSubMenu-fixed').css('display') == 'none' ){
			            W('#docSubMenu-fixed').show();
			            W('#docSubMenu').css('visibility', 'hidden');
			        }
				}else{//隐藏浮动菜单
					if( W('#docSubMenu-fixed').css('display') != 'none' ){
			            W('#docSubMenu').css('visibility', 'visible');
			            W('#docSubMenu-fixed').hide();
	    			}
				}
			}

			W(window).on('scroll', autoFixedTopMenu);
			W(window).on('load', autoFixedTopMenu);
			W(window).on('resize', autoFixedTopMenu);
		}
    }

	topSearchBox();

	fixedTopSubmenu();
})();

Dom.ready(function() {
	try {
		if(typeof(QIM) !== 'undefined' && QIM && QIM.initialize){
			QIM.initialize();
		}
	} catch(e) {}

    /**
     * topbar选择切换城市
     * @return {[type]} [description]
     */
    function topbarSelectCity(selector){

        var wSelector = W(selector);

        if( !(wSelector &&wSelector.length) ) return false;

        var cityPanel = new CityPanel(selector);

        cityPanel.on('close', function(e) {});

        cityPanel.on('selectCity', function(e) {
            var city_code = e.city.trim(),
                city_id   = e.cityid.trim(),
                city_name = e.name.trim();

            wSelector.siblings('.topbar-city')
                .html(city_name)
                .attr('data-citycode', city_code)
                .attr('data-cityid', city_id);

            // 将选择城市写入cookie

            var request_url = tcb.setUrl('/aj/getcookiecity', {
                'citycode': city_code,
                'cityname': city_name
            });
            QW.loadJsonp(request_url, function(){
                window.location.reload();
            });
        });
    }
    topbarSelectCity(".topbar-citychange-trigger");

    // 处理右边浮层广告在小窗口中的显示效果
    function floatCardFixed(){
        var wFloatWrap2 = W('.js-float-card-fixed');
        if ( !(wFloatWrap2 && wFloatWrap2.length) ) {
            return ;
        }

        function setFloatCardFixed(e){
            var client_x = 0;
            if (window.innerWidth){
                client_x = window.innerWidth;
            }
            else if ((document.body) && (document.body.clientWidth)){
                client_x = document.body.clientWidth;
            }
            var wRightService = wFloatWrap2.query('.right-service');
            if (wRightService && wRightService.length) {
                var wRightService_width = wRightService.getRect()['width'];

                if (client_x<(1200+wRightService_width*2+2)){
                    wRightService.css({
                        'position': 'fixed',
                        'right': '1px'
                    });
                }else {
                    wRightService.css({
                        'position': '',
                        'right': ''
                    });
                }
            }
        }

        W(window).on('load', setFloatCardFixed);
        W(window).on('resize', setFloatCardFixed);
        setTimeout(setFloatCardFixed, 2000)
    }
    floatCardFixed();

    tcb.bindEvent(document.body, {
        // 底部加入同城帮
        '.js-btn-join-tcb': function(e){
            e.preventDefault();

            var html_str = W('#JSJoinTCBIntroTpl').html().trim().tmpl()();

            tcb.panel('加盟同城帮', html_str, {
                className: 'join-tcb-wrap-panel panel-tom01'
            });
        },
		// 新闻采访/跨界合作
		'.js-btn-interview': function(e){
			e.preventDefault();

			tcb.panel('新闻采访/跨界合作', '新闻采访/跨界合作及其他方面的商务合作，请将相关信息及联系人发到hanjuntao@bang.360.cn，我们会在三个工作日内与您联系，期待与您的合作！', {
				className: 'interview-wrap-panel panel-tom01'
			});
		},
		// 二手竞拍平台合作
		'.js-btn-b2b': function (e) {
			e.preventDefault()

			tcb.panel('同城帮B2B商家竞拍平台', '<p>同城帮B2B商家竞拍平台致力于为商家提供优质的二手机货源点击链接入驻，开启财富之旅<a href="http://business.bang.360.cn/" target="_blank">http://business.bang.360.cn/</a></p><p>关注【同城帮B2B平台】公众号实时了解平台动向，详询：13301122005（微信同号）</p><p style="text-align: center;"><img src="https://p1.ssl.qhimg.com/t015bef0a0cf9a3e2b4.png" alt=""></p>', {
				className: 'b2b-wrap-panel panel-tom01'
			})
		}
    })

    function loadSobotZhiChi(){
        if (window.NONE_ONLINE_SERVICE){
            return
        }
        setTimeout (function () {
            var
                protocol = 'https://',
                s = document.createElement ('script'),
                b = document.getElementsByTagName ('body')[0]

            s.type = 'text/javascript'
            s.async = true
            s.id = 'zhichiload'
            s.className = 'right-service-btn'
            s.src = protocol + 'www.sobot.com/chat/pc/pc.min.js?sysNum=741e6f02f6794194967e733576170632'

            b.appendChild (s)
        }, 0)
        tcb.bindEvent(document.body, {
            '.right-service-btn': function(e){
                e.preventDefault()
            }
        })
    }
    loadSobotZhiChi()
});

function showShopGrade( grade ){
    var icon = Math.min(Math.ceil(grade/5), 4);
    var icon_num = (grade-1)%5 + 1;
    var str = '';
    for(var i=0; i<icon_num; i++){
        str +='<span class="icon icon-dj icon-dj-'+icon+'"></span>';
    }
    return str;
}


;/**import from `/resource/js/include/shalou.js` **/
!function () {
    window.TCBAPI = window.TCBAPI || {}

    window.TCBAPI.shalouTest = function(){
        //alert('shalou invoke success!')
    }

    window.TCBAPI.shalouHotPlug = function(params){
        // do nothing
        alert(params?JSON.stringify(params):'没有传入任何参数')
    }
}()
