// 回收评估过程
$(function(){
    if ( !$('.tpl-pinggu').length ){
        return ;
    }

    var
        Pinggu = window.Pinggu

        // 获取url query参数
        ,_url_query = tcb.queryUrl(window.location.search) // 当前页面的query hash
        ,_model_id = _url_query['model_id'] // 型号id
        ,_new_product_id = _url_query['newproductid'] // 新机id
        ,_from = _url_query['from'] || '' // 是否有来源
        ,_from2 = _url_query['_from'] // 来源2
        ,_path = _url_query['path']
        ,_hs_from_tob = _url_query['hs_from_tob']
        ,_wechat_xxg = _url_query['wechat_xxg'] // 来自微信羞羞哥
        ,_open_id = _url_query['open_id'] // open id
        ,_youhui_code = _url_query['youhui_code'] // 优惠码
        ,_iframe = _url_query['iframe'] // 是否嵌入iframe

        ,$ModelBaseOptions = $('#ModelBaseOptions') // 聚合的基本评估项
        ,$ModelSKUAttr     = $('#ModelSKUAttr')     // 型号的sku属性组
        ,$ModelSpecialOptions = $('#ModelSpecialOptions') // 型号专属的评估项
        ,key_checked_options = 'EVALUATE_CHECKED_OPTIONS_' + _model_id         // 选中的非sku评估项
        ,key_checked_sku_options = 'EVALUATE_CHECKED_SKU_OPTIONS_' + _model_id // 选中的sku评估项
        ,key_checked_options_storage = 'EVALUATE_CHECKED_OPTIONS_STORAGE_' + _model_id         // 备份存储--选中的非sku评估项
        ,key_checked_sku_options_storage = 'EVALUATE_CHECKED_SKU_OPTIONS_STORAGE_' + _model_id // 备份存储--选中的sku评估项

    /**
     * 设置评估进度
     */
    function setEvaluateProgress(){
        var
            //hash = tcb.parseHash(window.location.hash)
            //,
            percent // 进度百分比
            ,$choice = $('#PhoneOptions .phone-info-choice')
            ,evaluate_step = $choice.indexOf( $('.choice-step-curr')[0] ) //+hash['step'] || 0 // 评估进度
            ,evaluate_max_step = tcb.cache('EVALUATE_MAX_STEP')  // 评估最大步数

        // 将当前步骤和最大步骤都+3(这个值是品牌型号选择的步骤,虽然不是所以品牌都是3,但是此处统一设置为3),提高初始百分比值
        evaluate_step = evaluate_step+3;
        evaluate_max_step = evaluate_max_step+3;

        // 设置进度条
        percent = ( (evaluate_step + 1)/evaluate_max_step * 100 ).toFixed(0) || 0;
        percent = percent >=100 ? 99 : percent; //不要100
        $('#progressBar').css('width', percent+'%');
        $('#progressNum').html(percent);

        // 当前进度评估标题
        var tit = $('.choice-step-curr .tit-1').html();
        mHuishou.setPageTitle(tit);

        //try{tcbMonitor.__log({cId : (_from?('one_'+_from+'_') :'') +'m_hs_progress_' + percent+'%'});} catch (ex){}
    }
    /**
     * 设置当前的评估状态
     * @param evaluate_step
     */
    function setEvaluateStatus(evaluate_step){
        evaluate_step = evaluate_step || 0;

        // 设置非sku评估项评估状态
        setNotSKUEvaluateStatus();

        // 设置sku属性评估项评估状态
        setSKUEvaluateStatus();

        // 设置显示指定索引位置的评估组
        var
            $choice = $('#PhoneOptions .phone-info-choice')

        $choice.removeClass('choice-step-curr')

        $.each($choice, function(i, el){
            var
                $el = $(el)
                ,$item = $el.find('.check-item')


            // 当前选项组只有一个选项,那么就跳过!!跳过!!跳过!!当前组...同时将实际评估步骤+1,
            if( $item.length===1 ) {
                evaluate_step++;
            }

            // 当评估组的索引i,终于和评估步骤相等的时候,退出循环,并且将当前评估组显示出来
            if ( i === evaluate_step ) {

                $el.addClass('choice-step-curr')

                return false
            }
        })

    }

    /**
     * 设置非sku评估项评估状态
     */
    function setNotSKUEvaluateStatus(){
        var
            checked_options = tcb.cache(key_checked_options) // 当前选择的非sku评估组合
            ,checked_options_handled = []

        // 遍历当前非sku评估组合,把每个评估项id独立添加到一个新数组中,已被使用
        $.each(checked_options, function(i, item){
            item = item ? item : [];
            if (typeof item === 'string') {
                item = item.split(',');
            }

            $.each(item, function(ii, sub_item){

                checked_options_handled.push(sub_item);
            });
        });

        // 页面中已经输出的所有评估选项[非sku选项,不包括城市]...
        var
            $Options = $( $ModelBaseOptions.find('.check-item').concat($ModelSpecialOptions.find('.check-item')) );

        // 遍历所有选项,设置选项的选中状态
        $Options.each(function(i, el){
            var
                $el = $(el)
                ,data_id = $el.attr('data-select');

            $el.removeClass('check-item-on');
            if ( tcb.inArray(data_id, checked_options_handled) > -1 ) {
                $el.addClass('check-item-on');
            }
        });

    }

    /**
     * 设置sku属性评估项评估状态
     */
    function setSKUEvaluateStatus(){
        var
            // 根据选择的sku属性,获取可输出的sku属性组(同时处理选中的)
            sku_options_group = Pinggu.getSkuOptionGroups(key_checked_sku_options)
            // sku属性组
            ,checked_sku_options = tcb.cache(key_checked_sku_options)


        $ModelSKUAttr.html('')
        Pinggu.renderSkuOptions(sku_options_group)

        var
            $SKUOptions = $ModelSKUAttr.find('.check-item')

        // 遍历所有选项,设置选项的选中状态
        $SKUOptions.each(function(i, el){
            var
                $el = $(el)
                ,data_id = $el.attr('data-select');

            $el.removeClass('check-item-on');
            if ( tcb.inArray(data_id, checked_sku_options) > -1 ) {
                $el.addClass('check-item-on');
            }
        });
    }

    var
        storage_arr_delimiter  = '||' // storage中，数组和数组之间的分隔符
    /**
     * 存储选中的评估项(存储评估进度,不包含城市选择)
     * @param options [选项id,[互斥的其他id]]
     * @param is_sku  是否sku属性
     */
    function storageEvaluateChecked(options, is_sku){
        var
            checked_options // 缓存中--选中的选项
            ,checked_options_storage // 备份存储中--选中的选项
            ,option_checked = options[0] // 选中的选项(string)
            ,option_except  = options[1] // 其他非选中选项(array||undefined)
            ,option_except_pos = -1

        if (is_sku) {
            // sku属性
            checked_options = tcb.cache(key_checked_sku_options);
            checked_options_storage = sessionStorage.getItem(key_checked_sku_options_storage) || '';

            // 第一步: 遍历非选中的选项,确认存在于已选中的选项中的位置,不存在则为-1
            $.each(option_except, function(i, except_id){
                var
                    except_id_pos = tcb.inArray( except_id, checked_options )
                if ( except_id_pos > -1 ) {
                    option_except_pos = except_id_pos;
                }
            });

            // 第二步: 根据非选中的选项的位置option_except_pos,
            // 确定将checked加入cache中的方式,然后将checked加入其中
            if ( option_except_pos === -1 ) {
                // 非选中的选项不存在于checked之中....

                // 再判断选中的选项在不在checked之中,在其中就不做处理,
                // 否则直接将选项push进checked数组
                if ( tcb.inArray(option_checked, checked_options) === -1 ) {
                    checked_options.push(option_checked);
                }
            } else {
                // 非选中的选项存在于checked之中...

                // 从option_except_pos位置开始,干掉所有后边的数据,
                // 然后再将checked push到其中
                checked_options.splice(option_except_pos);
                checked_options.push(option_checked);
            }

            // 根据最新的checked_options,更新cache
            tcb.cache(key_checked_sku_options, checked_options);

            // 第三步: 确定新的checked_options和checked_options_storage的关系,判断是否更新checked_options_storage
            checked_options = checked_options.join(',');
            if ( checked_options_storage.indexOf(checked_options) === 0 ) {

                var
                    split_right = checked_options_storage.split(checked_options)[1]
                // storage中当前checked_options字符串右侧的字符串不为空,并且第一个字符不是逗号(,)那么将checked_options更新storage
                if ( split_right && split_right.charAt(0)!==',' ) {
                    checked_options_storage = checked_options;
                    sessionStorage.setItem(key_checked_sku_options_storage, checked_options_storage);
                }
            } else {
                // 完全无法匹配,直接更新storage

                checked_options_storage = checked_options;
                sessionStorage.setItem(key_checked_sku_options_storage, checked_options_storage);
            }

        } else {
            // 非sku属性
            checked_options = tcb.cache(key_checked_options);
            checked_options_storage = sessionStorage.getItem(key_checked_options_storage) || '';

            if ( option_checked.split(',').length > 1 && !option_except) {
                // 选中选项的长度大于1,那么表示聚合的基本选项

                // 选项值不相等,那么直接用新的选中选项组替换
                if (checked_options[0] != option_checked) {
                    checked_options[0] = option_checked;
                }
            } else {
                // 非聚合的选项,checked选项为单个的选项id

                var
                    checked_options_special = checked_options[1];

                // 第一步: 遍历非选中的选项,确认存在于已选中的选项中的位置,不存在则为-1
                $.each(option_except, function(i, except_id){
                    var
                        except_id_pos = tcb.inArray( except_id, checked_options_special )
                    if ( except_id_pos > -1 ) {
                        option_except_pos = except_id_pos;
                    }
                });

                // 第二步: 根据非选中的选项的位置option_except_pos,
                // 确定将checked加入cache中的方式,然后将checked加入其中
                if ( option_except_pos === -1 ) {
                    // 非选中的选项不存在于checked之中....

                    // 再判断选中的选项在不在checked之中,在其中就不做处理,
                    // 否则直接将选项push进checked数组
                    if ( tcb.inArray(option_checked, checked_options_special) === -1 ) {
                        checked_options_special.push(option_checked);
                    }
                } else {
                    // 非选中的选项存在于checked之中...

                    // 在option_except_pos位置直接替换掉
                    checked_options_special.splice(option_except_pos, 1, option_checked);
                }
            }

            // 根据最新的checked_options,更新cache
            tcb.cache(key_checked_options, checked_options);

            // 第三步: 确定新的checked_options和checked_options_storage的关系,判断是否更新checked_options_storage
            checked_options = checked_options[0]+storage_arr_delimiter+checked_options[1].join(',');
            if ( checked_options_storage.indexOf(checked_options) === 0 ) {

                var
                    split_right = checked_options_storage.split(checked_options)[1]
                // storage中当前checked_options字符串右侧的字符串不为空,并且第一个字符不是逗号(,)那么将checked_options更新storage
                if ( split_right && split_right.charAt(0)!==',' ) {
                    checked_options_storage = checked_options;
                    sessionStorage.setItem(key_checked_options_storage, checked_options_storage);
                }
            } else {
                // 完全无法匹配,直接更新storage

                checked_options_storage = checked_options;
                sessionStorage.setItem(key_checked_options_storage, checked_options_storage);
            }

        }
    }

    /**
     * 评估下一步
     * @param $Current 评估组
     * @param options  评估项id
     * @param is_sku   是否sku属性
     */
    function goNextStep($Current, options, is_sku){
        if ( !($Current && $Current.length) ){
            return;
        }
        // 防止点击过快
        if ( !!$Current.hasClass('flag-clicking') ) {
            return ;
        }
        // 加锁定状态
        $Current.addClass('flag-clicking');

        var
            hash = tcb.parseHash(window.location.hash)
            ,step = +hash['step'] || 0 // 当前步骤
            ,step_next = step + 1      // 下一步

        // 进入下一步之前,存储当前选中评估项到cache中
        storageEvaluateChecked(options, is_sku);

        setTimeout(function(){

            // 判断是否到最后一个评估步骤
            if ( !isLastStep( step ) ){

                window.location.hash = 'step='+step_next;

            } else {
                // 最后一个评估组,执行评估,跳到评估结果页

                // 购物车中有城市,则直接执行评估,否则只选中城市,然后点击<评估按钮>才执行评估
                if ( window.__CITY_IN_CART ) {
                    doEvaluate();
                }
            }

            $Current.removeClass('flag-clicking');
        }, 300);
    }

    /**
     * 判断当前是否已经到了评估最后一步
     */
    function isLastStep(step){
        var
            flag_last = true
            //,max_step = tcb.cache('EVALUATE_MAX_STEP') // 评估最大步骤
            ,$choice = $('#PhoneOptions .phone-info-choice')
            ,max_pos = $choice.length
            ,cur_pos = $choice.indexOf($('.choice-step-curr')[0])

        // 小于\等于 当前位置的选项组,直接跳过~不用处理
        while ( cur_pos < max_pos ) {

            cur_pos++

            if ( $choice.eq(cur_pos).find('.check-item').length > 1 ) {
                flag_last = false

                break
            }
        }

        return flag_last
    }

    /**
     * 评估数据
     */
    function doEvaluate(){
        var
            sku_group_id = getModelSKUGroupId() // sku属性组id

        if (!sku_group_id) {
            // 获取不到正确sku组id，直接返回
            return ;
        }

        var
            phoneStatus = getModelSpecialOptions() // 专有评估项id
            ,city = getEvaluateCity()
            // 评估参数
            ,params = {
                'sub_options' : phoneStatus.join(',')
                ,'sku_group_id': sku_group_id
                ,'model_id' : _model_id
            }
        // 如果有新机，则传递新机信息，进行评估
        if(_new_product_id){
            params['newproductid'] = _new_product_id
        }
        // 评估城市
        if ( city ) {
            params['city'] = city
        }

        $.loading().show();

        setTimeout(function(){
            var
                url_query = tcb.queryUrl(window.location.search);

            // 获取当前的step数字，评估也用于计算评估流程的总步骤
            var
                hash = tcb.parseHash(window.location.hash)
                ,stepNum = +hash['step'] || 0

            stepNum += 1 + (+url_query['prev_step'] || 3);

            //获取assess_key
            $.post('/huishou/doPinggu', $.param(params), function(res){
                res = $.parseJSON(res);

                if ( res['errno'] == 0 ) {
                    // 评估成功
                    var
                        data = res.result
                        ,detail_params = {
                            'from':         _from
                            ,'_from':       _from2
                            ,'path':        _path
                            ,'hs_from_tob': _hs_from_tob
                            ,'wechat_xxg':  _wechat_xxg
                            ,'open_id':     _open_id
                            ,'youhui_code': _youhui_code
                            ,'prevstep':    stepNum
                            ,'newproductid':_new_product_id
                            ,'iframe':      _iframe
                            ,'assess_key':  data['assess_key'] // 评估结果key
                        }

                    window.location = tcb.setUrl( tcb.setUrl("/m/pinggu_shop/", detail_params), window.__MUST_PASS_PARAMS||{} );
                } else {
                    // 评估失败

                    if ( res['errno'] == '155' ) {
                        // 评估价格为0
                        var
                            query_params = {
                                'from': _from
                                ,'newproductid' : _new_product_id
                            }
                        window.location = tcb.setUrl( tcb.setUrl('/m/error',query_params), window.__MUST_PASS_PARAMS||{} );
                    } else {
                        // 其他评估失败错误

                        alert(res['errmsg']);
                    }
                }

                $.loading().hide();
            });

        },100);
    }

    // 型号sku组id
    function getModelSKUGroupId(){
        var group_id;

        var sku_ids = [];
        // 其他必选评估项
        $('#ModelSKUAttr .check-item-on').forEach(function(el, i){
            sku_ids.push( $(el).attr('data-select') );
        });

        sku_ids = sku_ids.join(',');

        var sku_attr_map = tcb.cache('sku_attr_map');
        group_id = sku_attr_map[sku_ids];

        // 获取不到sku id
        if (!group_id) {
            $.dialog.toast('机器基本信息不完整，请重新选择');
        }

        return group_id;
    }
    /**
     * 型号专有评估项
     * @returns {Array}
     */
    function getModelSpecialOptions(){
        var phoneStatus = getModelBaseOptions() || [];

        // 其他必选评估项
        $('#ModelSpecialOptions .phone-must-choice .check-item-on').forEach(function(el, i){
            phoneStatus.push( $(el).attr('data-select') );
        });

        return phoneStatus;
    }
    /**
     * 型号基本评估项
     * @returns {Array}
     */
    function getModelBaseOptions(){
        var
            option_checked = [] // 被选中的选项

        // 有默认选项的基本选择项
        $('.phone-choice-base .check-item').forEach(function(el, i){
            var
                $el = $(el)
                ,default_id = $el.attr('data-default') // 当前选项组的默认选中的id
                ,$option_group    = $('.phone-choice-base .check-item[data-default="'+ default_id +'"]') // 当前选项的<所有选项组>
                ,$option_selected = $option_group.filter(function(){ // 当前组<被选中的选项>
                    return $(this).hasClass('check-item-on')
                })

            if ( $option_selected.length ) {
                // 选项组中,有显式选中的项

                option_checked.push( $option_selected.attr('data-select') )
            } else {
                // 选项组中,无显式选中的项

                option_checked.push( $el.attr('data-default') )
            }

        })

        // 上边的遍历方法可能产生重复项,去重
        option_checked = numUnique(option_checked)

        return option_checked;
    }
    /**
     * 获取评估城市
     * @returns {string}
     */
    function getEvaluateCity() {
        var
            city = ''
            ,$city = $('#ModelEvaluateCity .check-item-on')

        if ( $city && $city.length ) {
            city = $city.attr('data-city');
        }

        return city;
    }
    /**
     * 数组去重
     * @param arr
     * @returns {Array}
     */
    function numUnique(arr){
        var ret = [];
        for(var i=0, n=arr.length; i<n; i++){
            var _has = false;
            for(var j=ret.length-1; j>=0; j--){
                if( ret[j] === arr[i] ){
                    _has = true;
                    break;
                }
            }

            if(!_has){
                ret.push( arr[i] );
            }
        }

        return ret;
    }


    /**
     * 显示选项的详细信息
     * @param $target
     * @param $option
     */
    function showOptionDetail($target, $option){
        var
            me_offset = $option.offset()
            ,d_id = $option.attr('data-select');

        var $cur = $('.for-check-item-o'+d_id);
        if ($cur && $cur.height()) {
            $cur.hide();
            $target.removeClass('imgs-tip-icon-zoom-hide');
        } else {
            $cur.show();
            $cur.css({
                'width': me_offset['width'],
                'top': me_offset['top']+me_offset['height']-0+2
            });
            $target.addClass('imgs-tip-icon-zoom-hide');
        }
    }
    /**
     * 从备份的评估数据中恢复到当前的评估之中
     */
    function recoverEvaluate() {
        var
            checked_options_storage = sessionStorage.getItem(key_checked_options_storage) || ''          // 选中的普通评估属性
            ,checked_sku_options_storage = sessionStorage.getItem(key_checked_sku_options_storage) || '' // 选中的sku属性

        if (checked_options_storage) {
            checked_options_storage = checked_options_storage.split(storage_arr_delimiter);
            checked_options_storage[1] = checked_options_storage[1] ?
                checked_options_storage[1].split(',') :
                []
        } else {
            checked_options_storage = ['', []]
        }
        checked_sku_options_storage = checked_sku_options_storage ? checked_sku_options_storage.split(',') : []

        tcb.cache(key_checked_options, checked_options_storage)
        tcb.cache(key_checked_sku_options, checked_sku_options_storage)
    }
    /**
     * 设置评估步骤位置
     * @param pos
     */
    function setEvaluateStepPos(pos){
        var init_pos = 1;
        if(typeof $.fn.cookie==='function'){
            var prev_pos = getEvaluateStepPos();
            if(prev_pos!==null){
                //pos-prev_pos为1，前进；为-1，后退；为0表示刷新页面；
                if(Math.abs(pos-prev_pos)===1||pos-prev_pos===0){
                    $.fn.cookie('HS_EVALUATE_STEP_POS', pos, {path:'/', expires:10});
                } else {
                    $.fn.cookie('HS_EVALUATE_STEP_POS', '', {path:'/', expires:0});
                }
            } else {
                if(pos===init_pos){
                    $.fn.cookie('HS_EVALUATE_STEP_POS', pos, {path:'/', expires:10});
                } else {
                    $.fn.cookie('HS_EVALUATE_STEP_POS', '', {path:'/', expires:0});
                }
            }
        }
    }
    // 获取评估步骤位置
    // HS_EVALUATE_STEP_POS为空或者没有设置，返回null，否则返回其值的int类型
    function getEvaluateStepPos(){
        var ret = null;
        if(typeof $.fn.cookie==='function'){
            ret = $.fn.cookie('HS_EVALUATE_STEP_POS');
            ret = ret ? ret : null;
            ret = ret ? parseInt(ret, 10) : ret;
        }

        return ret;
    }

    /**
     * 评估基本事件绑定
     */
    function bindEvent(){
        var
            $win = $(window)

        $.bindEvent(document.body, {
            // 基础信息，item的check状态切换
            '.phone-choice-base .check-item' : function(e){
                e.preventDefault();

                var
                    $me = $(this)
                    ,$parent = $me.parents('.phone-info-choice')

                $me.toggleClass('check-item-on');
                $parent.find('.go-next').html('下一步');

                // 如果有同组选项（即 data-default 值完全一致），则去除其选中状态
                $parent.find('.check-item[data-default="'+ $me.attr('data-default') +'"]')
                    .filter(function(){
                        return $(this).attr('data-select')!= $me.attr('data-select')
                    })
                    .removeClass('check-item-on');
            },
            // 基础信息，下一步
            '.phone-choice-base .go-next' : function(e){
                e.preventDefault();

                var $me = $(this)
                    ,$choice = $me.closest('.phone-info-choice')
                    ,options = [getModelBaseOptions().join(',')];

                // 进行下一步
                goNextStep($choice, options, false);
            },
            // 必选项，选择
            '.phone-must-choice .check-item' : function(e){
                e.preventDefault();

                var
                    $me = $(this)
                    ,$target = $(e.target);

                // 查看选项详细图
                if ($target.hasClass('imgs-tip-icon')) {
                    showOptionDetail($target, $me);
                    return;
                }

                var
                    $choice = $me.closest('.phone-info-choice')
                    ,$items = $choice.find('.check-item')
                    ,option_id = $me.attr('data-select')
                    ,$options_except = $items.filter(function(){
                        return $(this).attr('data-select') != option_id;
                    })
                    ,options_except = []
                    ,is_sku = $choice.closest('#ModelSKUAttr').length ? true : false

                // 遍历非选中的选项,将其id加入非选中的选项id队列中
                $options_except.each(function(i, el){
                    options_except.push( $(el).attr('data-select') );
                });

                // 移除其他选项选中状态,将当前选中的对象设为选中状态
                $items.removeClass('check-item-on');
                $me.addClass('check-item-on');

                // 进行下一步
                goNextStep($choice, [option_id, options_except], is_sku);
            },
            // 选择城市
            '.phone-choice-chengshi .check-item' : function (e) {
                e.preventDefault();

                var
                    $me = $(this)
                    ,$items = $('.phone-choice-chengshi .check-item')

                $items.removeClass('check-item-on')
                $me.addClass('check-item-on');

            },
            // 点击立即估价按钮
            '.phone-info-choice .go-evaluate' : function(e){
                e.preventDefault();

                var
                    $me = $(this)

                if( !!$me.hasClass('btn-disabled') ){
                    return;
                }

                doEvaluate();
            },
            // 更多城市
            '.phone-info-choice .more-city-link':function(e){
                e.preventDefault();
                var
                    $me = $(this)
                    ,$LetterNavi = $('#LetterNavi')

                $me.hide().siblings('.hide').removeClass('hide')

                // 没有城市字母索引
                if( !( $LetterNavi&&$LetterNavi.length ) ){
                    var
                        ln_str = '<ul class="letter-navi" id="LetterNavi">';
                    $me.siblings('.list-cell-tit').each(function(){
                        var
                            $tit = $(this)
                        ln_str += '<li>'+$tit.html()+'</li>';
                    });
                    ln_str += '</ul>';

                    $LetterNavi = $(ln_str);
                    $LetterNavi.appendTo('body');

                    window.$LetterNavi = $LetterNavi;
                    window.$LetterNaviLi = $LetterNavi.find('li');
                    window.$LetterTitle = $('.phone-choice-chengshi .list-cell-tit');
                }

                // 触发自定义的myresize事件
                $(document).trigger('myresize');
            },
            // 切换字母，定位不同字母开头的城市
            '#LetterNavi': {
                'tap': function(e){
                    var target = e.target,
                        $target = $(target);
                    if(target.nodeName.toLowerCase()=='li'){
                        $target.addClass('active');
                        setTimeout(function(){
                            $target.removeClass('active');
                        }, 200);

                        var $selected_letter = $('.phone-choice-chengshi .list-cell-tit').filter(function(){
                            return $(this).attr('data-val')===$.trim($target.html());
                        });

                        var fixed = 0 //$('#hsheader').height();
                        $(window).scrollTop($selected_letter.offset()['top']-fixed);
                    }
                },
                'touchmove': function(e){
                    e.preventDefault();

                    var target = e.target,
                        $target = $(target);

                    if(target.nodeName.toLowerCase()=='li'){
                        var h = window.LetterNaviLiHeight;
                        if(!h){
                            window.LetterNaviLiHeight = h = $target.height();
                        }

                        var range = e.touches[0].clientY-$target.offset()['top']+$(window).scrollTop(),
                            relative_pos = Math.floor(range/h),
                            c_index = $target.index()+relative_pos;

                        if(c_index<0){
                            return ;
                        }
                        var $cur = window.$LetterNaviLi.eq(c_index);

                        var $selected_letter = window.$LetterTitle.filter(function(){
                            return $(this).attr('data-val')===$.trim($cur.html());
                        });

                        var fixed = 0 // $('#hsheader').height();
                        if($selected_letter.offset()&&$selected_letter.offset()['top']){
                            $(window).scrollTop($selected_letter.offset()['top']-fixed);
                        }
                    }
                }
            }

        });

        // 根据hash设置评估步骤
        function setEvaluateStepByHash(){
            var max_step = tcb.cache('EVALUATE_MAX_STEP');
            if ( !max_step ) {
                setTimeout(setEvaluateStepByHash, 100);
            } else {

                var
                    query = $.queryUrl(window.location.search)
                    ,hash  = tcb.parseHash(window.location.hash)

                    ,evaluate_step = +hash['step'] || 0 // 当前的评估步骤
                    ,prev_step     = +query['prev_step'] || 3 // 评估前的步骤(选择品牌型号等)

                // 设置评估步骤
                setEvaluateStepPos(prev_step + evaluate_step + 1);

                // 设置当前评估状态
                setEvaluateStatus(evaluate_step);

                // 设置评估进度
                setEvaluateProgress();

                // 触发自定义的myresize事件
                $(document).trigger('myresize');
            }
        }
        // 评估步骤变化
        $win.on('hashchange', function(e){

            // 根据当前的hash状态设置评估步骤
            setEvaluateStepByHash();
        });
        // 评估步骤变化
        $win.on('load', function(e){
            // 从storage中恢复选中评估项到cache中
            recoverEvaluate();

            // 根据当前的hash状态设置评估步骤
            setEvaluateStepByHash();
        });

    }

    // 页面内容初始化
    function init(){
        // 获取总的评估步数[同时确保评估信息加载完毕]
        Pinggu.getMixGroupCount(function(max_step){
            // 设置评估最大步骤
            tcb.cache('EVALUATE_MAX_STEP', max_step);

            // 设置评估进度
            setEvaluateProgress();
        });

        // 评估基本事件绑定
        bindEvent();
    }
    init();
});
