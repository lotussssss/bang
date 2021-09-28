// 回收--评估流程页
Dom.ready(function(){
    // 绑定事件
    tcb.bindEvent(document.body, {
        // 必选项
        '.phone-must-choice .check-item': {
            'click': function(e){
                e.preventDefault ();

                var
                    target = e.target,
                    wTarget = W(target),
                    wMe = W (this),
                    wChoice = wMe.ancestorNode ('.phone-info-choice')

                if (wChoice.hasClass('phone-info-choice-pre-checked') && !wMe.hasClass ('check-item-on')){
                    return
                }
                //if (wTarget.hasClass('icon-show-desc')){
                //
                //    return
                //}

                wMe.addClass ('check-item-on')
                    .siblings ('.check-item-on').removeClass ('check-item-on');

                wChoice.query ('.selected-item .item-txt').html (wMe.attr('data-name').trim ());
                wChoice.query ('.selected-item .item-title-txt').html (wMe.ancestorNode('.phone-info-choice').query('.tit-1').html ().trim ());

                //是否有锁 选择了有锁
                if(wTarget.attr('data-select') == '88'){
                    return
                    var attach_str = '<span class="marker">账号密码未解除，将会影响最终的回收报价哦。</span>'
                    wChoice.query ('.selected-item .item-txt').appendChild(attach_str)
                    setTimeout(function () {
                        wChoice.query ('.selected-item .item-txt .marker').addClass('show')
                    },500)
                    setTimeout(function () {
                        wChoice.query ('.selected-item .item-txt .marker').removeClass('show')
                    },3000)
                }
                // 评估到下一步
                goNextStep (wChoice);

                try { W (document).fire ('myresize');} catch (ex) {}
            }
        },

        // 如果在基础信息里，手机可用时，选择了描述项，则修改下一步按钮的文字
        '.phone-choice-base .check-item': function(e){
            e.preventDefault();

            if (W(this).hasClass('check-item-disabled')){
                return
            }

            if( W(this).hasClass('check-item-on') ){
                W(this).removeClass('check-item-on')
            }else{
                W(this).addClass('check-item-on')
            }

            var parent = W(this).parentNode('.phone-info-choice');
            parent.one('.go-next').html('下一步');

            //如果有同组选项（即 data-default 值完全一致），则去除其选中状态
            W(this).siblings('.check-item[data-default="'+ W(this).attr('data-default') +'"]').removeClass('check-item-on');

            try{ W(document).fire('myresize');}catch(ex){}
        },

        // 已经选中属性
        '.choice-selected': {
            'mouseenter': function(e){
                var wMe = W(this);

                wMe.addClass('choice-hover')
                    .siblings('.choice-selected').removeClass('choice-hover');
            },
            'mouseleave': function(e){
                var wMe = W(this);

                wMe.removeClass('choice-hover');
            },
            'click': function(e){
                e.preventDefault();

                var wMe = W(this);

                var wItem = wMe.query('.selected-item');
                wItem.hide();

                wItem.siblings('div').show();

                wMe.removeClass('choice-selected').removeClass('choice-hover').css({
                    'height': 'auto'
                });

                try{ W(document).fire('myresize');}catch(ex){}
            }
        },

        //去评估
        '.go-evaluate': function(e){
            e.preventDefault();

            var wMe = W(this);

            // 禁用/提交ing
            if( wMe.hasClass('hsbtn-disabled') || wMe.hasClass('hsbtn-doing') ){
                return;
            }

            doEvaluate();
        }

    })

    /**
     * 下一步
     * @return {[type]} [description]
     */
    function goNextStep(wCur){
        var
            height_target = '50px',
            height_transition = '55px'

        setTimeout(function(){
            wCur = wCur || W('.choice-step-curr');

            // 根据选中的当前选项组，获取下一个选项组
            var wNext = window.Pinggu.getNextStepObj(wCur);

            var $ModelSKUAttr = wNext.ancestorNode('#ModelSKUAttr');

            // 显示非sku评估项，展示所有title
            if ( !($ModelSKUAttr&&$ModelSKUAttr.length) ) {
                W('.block-group-tit').show()
            }

            wCur.removeClass('choice-step-curr').addClass('choice-selected').animate({
                'opacity': 0.4,
                'height': height_target
            }, 200, function(){
                var wItem = wCur.query('.selected-item');
                wItem.siblings('div').hide();
                wItem.css({
                    'display': 'block',
                    'line-height': height_transition
                }).animate({
                    'line-height': height_target
                }, 200, function(){
                    try{
                        //wCur[0].scrollIntoView();
                    }catch(ex){}
                });

                wCur.animate({'opacity': 1}, 100);

                try{ W(document).fire('myresize');}catch(ex){}
            })

            wNext.addClass('choice-step-curr')

            if (wNext && !wNext.getRect()['height']) {
                wNext.slideDown(200, function(){
                    try{ W(document).fire('myresize');}catch(ex){}
                })
            }

            setEvaluateProgress();

            try{ W(document).fire('myresize');}catch(ex){}	//resize page happen
        }, 100);
    }

    //评估数据
    function doEvaluate(){
        // sku属性组id
        var
            sku_group_id = getModelSKUGroupId(),
            // 型号专有评估项（不包括mix混合选项）
            specialOptions = getModelSpecialOptions(sku_group_id),
            // 型号混合专有评估项
            mixOptions = getModelMixOptions()

        if (! (sku_group_id&&specialOptions&&mixOptions)) {
            // 获取不到正确sku组id、专有评估项、混合专有评估项，直接返回
            return alert('请选择完整的评估项再提交估价');
        }

        var url_query = tcb.queryUrl (window.location.search);
        var params = {
            'from'   : window._from ? window._from : 'web',
            '_from'  : url_query[ '_from' ],
            'iframe' : url_query[ 'iframe' ],
            'self_enterprise' : url_query[ 'self_enterprise' ],

            'model_id'     : url_query[ 'model_id' ],
            'sku_group_id' : sku_group_id,
            'sub_options'  : mixOptions.join (',')+','+specialOptions.join(','),
            "baseinfo"     : '',
            'newproductid' : url_query[ 'newproductid' ]
        }
        if (window._inclient) {
            params[ 'inclient' ] = 1
        }

        setUiBtnEvaluating()

        //获取assess_key
        QW.Ajax.get('/huishou/doPinggu', params, function(res){

            res = QW.JSON.parse(res)

            // 验证成功
            if (res['errno'] == 0) {
                var data = res.result
                //跳转至结果页面

                window.location = tcb.setUrl2(url_query['newproductid'] ? '/huishou/cart' : '/huishou/pinggudetail/', {
                    assess_key: data.assess_key
                })
            } else {
                //评估价格为0
                if(res['errno'] == '155'){
                    window.location = tcb.setUrl2('/huishou/error', {});
                } else {
                    alert(res['errmsg']);
                }
            }
            setUiBtnEvaluateRest()
        })
    }

    // 设置正在执行评估的按钮状态
    function setUiBtnEvaluating() {
        W('.go-evaluate').removeClass('hsbtn-disabled')
                         .addClass('hsbtn-doing')
                         .html('<img src="https://p.ssl.qhimg.com/t01d621a8109b7524b5.gif" width="24"> 正在评估...')
    }

    // 恢复评估按钮的初始状态
    function setUiBtnEvaluateRest() {
        W('.go-evaluate').removeClass('hsbtn-disabled')
                         .removeClass('hsbtn-doing')
                         .html('立即估价')
    }

    // 型号sku组id
    function getModelSKUGroupId(){
        var group_id;

        var sku_ids = [];
        // 其他必选评估项
        W('#ModelSKUAttr .check-item-on').forEach(function(el, i){
            sku_ids.push( W(el).attr('data-select') );
        });

        sku_ids = sku_ids.join(',');

        var sku_attr_map = tcb.cache('sku_attr_map');
        group_id = sku_attr_map[sku_ids];

        if (!group_id) {
            var $not_selected =  W('#ModelSKUAttr .phone-info-choice').filter(function(el){
                return !W(el).query('.check-item-on').length;
            });

            var top_place = $not_selected.getRect()['top']-40;

            tcb.gotoTop.goPlace(top_place);
            setTimeout(function(){
                $not_selected.shine4Error();
            }, 300);
        }

        return group_id;
    }

    // 型号专有评估项（不包括mix混合选项）
    function getModelSpecialOptions(sku_group_id){
        var
            flag = true,
            checkedOptions = [],
            wSpecials = W('#ModelSpecialOptions .phone-must-choice')


        // 专有评估项
        wSpecials.forEach(function(el,i){
            var
                wEl = W(el),
                wChecked = wEl.query('.check-item-on')

            if ( wChecked&&wChecked.length){
                checkedOptions.push( wChecked.attr('data-select') )
            } else {
                if (sku_group_id&&flag) {
                    // sku属性选中正常，并且是第一个非选中的专有评估项组

                    var top_place = wEl.getRect()['top']-40

                    tcb.gotoTop.goPlace(top_place);
                }
                setTimeout(function(){
                    wEl.shine4Error()
                }, 300)

                flag = false
            }
        })

        return flag ? checkedOptions : flag
    }

    // 型号混合专有评估项
    function getModelMixOptions () {
        var checkedOptions = []

        // 有默认选项的基本选择项
        W ('.phone-choice-base .check-item').forEach (function (el, i) {
            var
                $el = W (el), default_id = $el.attr ('data-default') // 当前选项组的默认选中的id
                , $option_group = W ('.phone-choice-base .check-item[data-default="' + default_id + '"]') // 当前选项的<所有选项组>
                , $option_selected = $option_group.filter (function (el) { // 当前组<被选中的选项>
                    return W (el).hasClass ('check-item-on')
                })

            if ($option_selected.length) {
                // 选项组中,有显式选中的项

                checkedOptions.push ($option_selected.attr ('data-select'))
            } else {
                // 选项组中,无显式选中的项

                checkedOptions.push ($el.attr ('data-default'))
            }

        })

        // 上边的遍历方法可能产生重复项,去重
        checkedOptions = checkedOptions.unique ()

        return checkedOptions
    }

    // 设置评估进度
    function setEvaluateProgress(pct){
        if( W('.tpl-pinggu').length == 0){ return; }

        var
            percent = 0

        if(pct){
            percent = pct;
        }else{
            var
                max = getMaxStep(),
                index = 4

            // 遍历默认选项，找出所有的选中组累加
            W('.phone-must-choice').forEach(function(el,i){
                var
                    wCheckOn = W(el).query('.check-item-on')
                if (wCheckOn && wCheckOn.length){
                    index++
                }
            })

            percent = ( index/max * 100 ).toFixed(0);
            percent = percent >=100 ? 99 : percent; //不要100
        }

        W('#progressBar').css('width', percent+'%');
        W('#progressNum').html(percent);
    }

    // 获取当前评估的最大评估步骤
    function getMaxStep(){
        // 最大评估组数，初始值设置为3
        var
            max_step = 3

        // sku属性组数
        max_step += tcb.cache('sku_attr_cate').length

        // 专有属性组数
        max_step += tcb.cache('special_options_cate').length

        // 混合选项组算一组
        max_step += 1

        return max_step
    }

    // 滚动条滚动时
    function scrollTab(){
        // 滚动条事件
        var wBoundary = W('.tpl-pinggu');
        if (wBoundary.length) {
            var wNav = W('.pinggu-base-info-box'),
                wNavPlaceholder = W('.pinggu-base-info-box-placeholder'),
                boundary = wBoundary.xy()[1]-2;

            /**
             * 设置顶部tab的位置
             */
            function setTopPos() {
                var s_top = tcb.getScrollTop();

                // 滚动条滚动到tab的临界位置以下
                if (s_top > boundary) {
                    if (window._isIE6) {
                        wNav.css({
                            'position': 'absolute',
                            'top': s_top
                        });
                    } else {
                        wNav.css({
                            'position': 'fixed'
                        });
                    }
                    wNavPlaceholder.show();

                } else {
                    wNav.css({
                        'position': 'relative',
                        'top': 0
                    });
                    wNavPlaceholder.hide();
                }
            }
            W(window).on('scroll', setTopPos);
            W(window).on('load',  setTopPos);
            W(window).on('resize', setTopPos);
            //W(window).on('myresize', setTopPos);
        }
    }

    function init(){
        // 根据滚动条设置顶部位置
        scrollTab();

        // 设置初始评估进度
        setEvaluateProgress(19);

        setTimeout(function () {
            setEvaluateProgress()
        }, 1000)
    }

    init()

})
