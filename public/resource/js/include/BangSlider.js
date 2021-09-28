(function(){
    window.bang = window.bang || {};

    /**
     * 初始化轮播广告
     * @return {[type]} [description]
     */
    function Slider(options){
        var defaults = {
            't1': 8000,
            't2': 5000,
            'auto': true,
            'wrap': '.slide-wrap'
        };
        options = options || {};
        options = QW.ObjectH.mix(defaults, options, true);

        var me = this;
        me.options = options;
        me.wWrap = W(me.options['wrap']);
        var wWrap = me.wWrap;
        me.wA   = wWrap.query('.slide-main a');
        me.wLis = wWrap.query('.slide-nav li');
        me.t1 = me.options['t1'];
        me.t2 = me.options['t2'];

        var fn = Slider.prototype;
        if (typeof me.eventBind === 'undefined') {
            /**
             * 事件绑定
             * @return {[type]} [description]
             */
            fn.eventBind = function(){
                var me = this;

                var wA = me.wA,
                    wLis = me.wLis;
                me.wWrap.one('.slide-nav')
                    .on('mouseover', function(e){
                        var target = e.target;
                        if (target.nodeName.toLowerCase()==='img') {
                            var wTarget = W(target).parentNode('li'),
                                pos = 0;
                            // 鼠标停留在非当前幻灯的nav上，那么需要切换到相应的幻灯~
                            if(!wTarget.hasClass('cur')){
                                wLis.removeClass('cur');
                                wLis.forEach(function(el, i, wL){
                                    if (el===target.parentNode) {
                                        pos = i;
                                        wL.item(i).addClass('cur');
                                    }
                                });
                                wA.hide();
                                wA.item(pos) && wA.item(pos).show();
                            }
                        }
                        // 暂停
                        me.pauseSlide();
                    })
                    .on('mouseout', function(){
                        me.autoSlide();
                    });                
            };

            /**
             * 自动切换
             * @return {[type]} [description]
             */
            fn.autoSlide = function(){
                var me = this;

                var wA = me.wA,
                    wLis = me.wLis;
                me.h1 = setTimeout(function(){
                    var wCur = wLis.filter('.cur'),
                        pos = 0;

                    wLis.forEach(function(el, i){
                        if (el===W(wCur)[0]) {
                            pos = i;
                        }
                    });
                    wLis.removeClass('cur');
                    pos++;
                    if (pos>=wLis.length) {
                        pos = 0;
                    }
                    wLis.item(pos) && wLis.item(pos).addClass('cur');
                    wA.hide();
                    wA.item(pos) && wA.item(pos).show();
                    if (me.h1) {
                        var arg = arguments,
                            t = pos===0 ? me.t1 : me.t2; // cur在第一个位置的时候用t1作为延时，否则用t2
                        me.h2 = setTimeout(function(){
                            arg.callee();
                        }, t);
                    }
                }, me.t1);
            };
            /**
             * 暂停滑动
             * @return {[type]} [description]
             */
            fn.pauseSlide = function(){
                var me = this;

                clearTimeout(me.h1);
                clearTimeout(me.h2);
            };

        }

        me.eventBind();
        me.options.auto && me.autoSlide();
    }

    bang.Slider = function(options){
        return new Slider(options);
    };
}());