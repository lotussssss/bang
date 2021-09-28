// 评估流程中评估项的处理
(function(){
    var $ModelSKUAttr = W('#ModelSKUAttr'),
        $ModelSpecialOptions = W('#ModelSpecialOptions');
    if ( !($ModelSKUAttr && $ModelSKUAttr.length) ) {
        return ;
    }

    // 获取型号sku选项
    function getModelSkuOptions(callback){
        var model_id = tcb.queryUrl(window.location.href, 'model_id');
        var request_url = '/huishou/doGetSkuOptions',
            params = {
                model_id: model_id || 6
            };

        QW.Ajax.get(request_url, params, function (res) {
            res = QW.JSON.parse(res);

            if ( !res['errno'] ) {

                // 处理型号sku属性数据
                handleModelSkuOptions(res['result']);

                typeof callback==='function' && callback();
            }
            else {
                alert(res['errmsg']);
            }

        });
    }
    // 获取型号sku确定后的专有评估选项
    function getModelSpecialOptions(callback){
        var model_id = tcb.queryUrl(window.location.href, 'model_id');
        var request_url = '/huishou/doGetPingguGroup',
            params = {
                model_id: model_id || 6
            };

        QW.Ajax.get(request_url, params, function (res) {
            res = QW.JSON.parse(res);

            if ( !res['errno'] ) {
                var group_data = res['result']
                if (!(group_data&&group_data.length)){
                    group_data = group_data['pinggu_group']
                }
                // 处理型号sku属性数据
                handleModelSpecialOptions(group_data);

                typeof callback==='function' && callback();

            }
            else {
                alert(res['errmsg']);
            }

        });
    }

    // 处理型号的sku数据，成为可用的格式
    function handleModelSkuOptions(sku_data){
        var sku_attr_map  = {} // sku属性组合到sku的唯一id的映射
            ,sku_attr_cate = [] // sku属性分类名称
            ,sku_attr_group_by_cate = [] // 根据每一个sku属性分类，组合sku属性
            ,sku_attr_group_by_cate_pushed_in = []

        var sku_data_list = sku_data['list']
            ,sku_data_map = sku_data['map']

        QW.ObjectH.map(sku_data_list, function (item_group, key) {
            var attr_ids = [];

            item_group.forEach(function(item, i, item_group){
                attr_ids.push(item['attr_valueid']);

                // 遍历第一个sku属性组的时候，将属性分类名称获取出来
                if (sku_attr_cate.length < item_group.length) {
                    sku_attr_cate.push({
                        options_cate_id : item['attr_id'],
                        options_cate_name : item['attr_name']
                    });
                }

                // sku属性所在的位置项不是数组，那么初始化设置为空数组，以备往里添加数据项
                if ( !(sku_attr_group_by_cate[i] instanceof Array) ){
                    sku_attr_group_by_cate[i] = [];
                }
                // 加到属性组内的属性，不再重复添加
                if ( tcb.inArray(item['attr_valueid'], sku_attr_group_by_cate_pushed_in) == -1 ){

                    sku_attr_group_by_cate_pushed_in.push(item['attr_valueid']);
                    sku_attr_group_by_cate[i].push({
                        option_id: item['attr_valueid'],
                        option_name: item['attr_valuename']
                    });
                }

            });

            // sku属性组合到sku的唯一id的映射
            var
                sku_attr_map_key = attr_ids.join(',')
                ,sku_attr_map_val = key

            sku_attr_map[sku_attr_map_key] = sku_attr_map_val;

        });

        // 遍历sku分类属性组,进行排序
        tcb.each(sku_attr_group_by_cate, function(i, group){
            var
                options_cate_id = sku_attr_cate[i]['options_cate_id'] // 分类id
                ,attr_sort = sku_data_map[options_cate_id] // 属性顺序

            var
                ext_index = 999

            group.sort(function(a, b){
                var
                    a_index = tcb.inArray(+a['option_id'], attr_sort)
                    ,b_index = tcb.inArray(+b['option_id'], attr_sort)

                a_index = a_index===-1 ? ext_index : a_index
                b_index = b_index===-1 ? ext_index : b_index

                // 扩展索引每次比较完成之后都+1,这样可以实现不在排序数组中的值,按顺序依次加到最后
                ext_index++

                // 比较当前属性id在排序map中的顺序,map中靠前的提到前边(即相减小于0)(注意点:id需要化为整数,保持和map中的类型一致)
                return a_index - b_index
            });
        });


        tcb.cache('sku_attr_map', sku_attr_map);
        tcb.cache('sku_attr_cate', sku_attr_cate);
        tcb.cache('sku_attr_group_by_cate', sku_attr_group_by_cate);
    }
    // 处理型号的专有评估选项，成为可用的格式
    function handleModelSpecialOptions(group_data){
        var combo_options = [], // 聚合评估选项
            combo_options_default = {}; // 聚合选项中被默认选择的选项

        var special_options_cate = [], // 专有评估选项分类名称、id
            special_options_group_list = []; // 专有评估选项组列表

        group_data.forEach(function (item, i) {
            if (item['pinggu_group_juhe']==1){
                // 聚合选项

                var options = item['pinggu_group_options'];
                if (options && options.length) {

                    options.forEach(function(options_item){
                        if (options_item['is_default']==1){
                            // 加入默认被选中的聚合组
                            var group_id = options_item['group_id'];

                            combo_options_default[ group_id ] = {
                                option_id: options_item['option_id'],
                                option_name: options_item['option_name']
                            };
                        } else {
                            // 其他没有被选中的聚合组
                            combo_options.push({
                                group_id: options_item['group_id'],
                                option_id: options_item['option_id'],
                                option_name: options_item['option_name']
                            });
                        }
                    });
                }

            }
            else {
                // 单独选项

                // 专有属性分类名称、id
                special_options_cate.push({
                    options_cate_id : item['pinggu_group_id'],
                    options_cate_name : item['pinggu_group_name']
                });

                var options = item['pinggu_group_options'],
                    options_format = [];
                if (options && options.length) {

                    options.forEach(function(options_item){

                        options_format.push({
                            option_id: options_item['option_id'],
                            option_name: options_item['option_name']
                        });
                    });
                }
                special_options_group_list.push(options_format);

            }

        });

        tcb.cache('combo_options', combo_options);
        tcb.cache('combo_options_default', combo_options_default);

        tcb.cache('special_options_cate', special_options_cate);
        tcb.cache('special_options_group_list', special_options_group_list);
    }

    // 输出sku属性选项
    function renderSkuOptions(sku_option_groups){

        var str = getRequiredChoiceOptionsHtml(sku_option_groups, true);

        $ModelSKUAttr.insertAdjacentHTML('beforeend', str);
    }
    // 输出型号专有评估选项
    function renderSpecialOptions(special_option_groups){

        var str = getRequiredChoiceOptionsHtml(special_option_groups, false);

        $ModelSpecialOptions.insertAdjacentHTML('beforeend', str);
    }
    // 输出聚合属性选项
    function renderComboOptions(combo_options, combo_options_default, col){

        var str = getComboOptionsHtml(combo_options, combo_options_default, col);

        $ModelSpecialOptions.insertAdjacentHTML('beforeend', str);
    }

    // 获取必选选项列表的html
    function getRequiredChoiceOptionsHtml(option_group_list, is_sku){
        // var pre_checked_sku = tcb.cache('pre_checked_sku')||['16'],
        //     pre_checked_special = tcb.cache('pre_checked_special')||['232']
        var _global = JSON.parse(tcb.queryUrl(window.location.search, '_global')||'{}')
        var pre_checked_sku = _global.sku||[],
            pre_checked_special = _global.special||[]

        var data = {
                option_group_list : option_group_list,
                is_sku            : is_sku || false,
                option_desc_ids   : window.Pinggu.getOptionDescIds (),
                pre_checked_sku   : pre_checked_sku,
                pre_checked_special : pre_checked_special
            },
            fn = W ('#JsHSPingguRequiredChoiceOptionsTpl').html ().trim ().tmpl ()

        return fn (data)
    }
    // 获取聚合属性选项的html
    function getComboOptionsHtml(combo_options, combo_options_default, col){
        var
            data = {
                combo_options         : combo_options,
                combo_options_default : combo_options_default,
                col                   : col || 5,
                option_desc_ids       : window.Pinggu.getOptionDescIds ()
            },
            fn = W ('#JsHSPingguMixChoiceOptionsTpl').html ().trim ().tmpl (),
            str = fn (data)

        return str
    }
    // 获取属性输出的列数
    function getOptionsColByCateId(attr_cate_id){
        var col = 2,
            col_arr = [1, 2, 3, 4, 5], // 列数数组
            col_map = {
                'combo': col_arr[3], // 聚合选项4列
                '2': col_arr[2], // 容量3列
                '4': col_arr[3], // 颜色4列
                '6': col_arr[1]  // 渠道2列
            };
        col = col_map[ attr_cate_id ] || col;

        return col;
    }

    // 获取下一个选项组
    function getNextStepObj($Cur) {
        var $Next;

        var $ModelSKUAttr = $Cur.ancestorNode('#ModelSKUAttr');
        if ($ModelSKUAttr && $ModelSKUAttr.length) {

            $Next = getNextSKUObj($Cur)

            if (!$Next) {
                // 在sku属性组中没有下一组了,那么在专有选项中来取

                $Next = W('#ModelSpecialOptions .phone-info-choice').first()
            }
        }
        else {
            // 当前选项在其他选项的block
            $Next = $Cur.nextSibling('.phone-info-choice');
        }

        return $Next;
    }

    /**
     * 获取下一个SKU属性组对象
     *
     * @param $Cur
     * @returns {*}
     */
    function getNextSKUObj($Cur) {
        // 当前选项在sku属性选项的block内
        var
            $ModelSKUAttr = $Cur.ancestorNode('#ModelSKUAttr')
            ,$Next = $Cur.nextSiblings('.phone-info-choice')

        if ( $Next&&$Next.length ) {
            $Next.removeNode();
        }

        var next_sku_attr_pos = $ModelSKUAttr.query('.phone-info-choice').length;

        // 输出指定位置sku属性选项
        var
            sku_attr_group_by_cate = tcb.cache('sku_attr_group_by_cate')
            ,sku_attr_cate = tcb.cache('sku_attr_cate')

        // $Cur本身为最后一组sku属性
        if ( !sku_attr_cate[next_sku_attr_pos] ) {
            return
        }

        var
            // 已经被选中的选项
            $CheckedOptions = $ModelSKUAttr.query('.check-item-on')
            // 选中选项的id组
            ,checked_attr_id = []

        $CheckedOptions.forEach(function(el, i){
            checked_attr_id.push(W(el).attr('data-select'));
        });
        checked_attr_id = checked_attr_id.join(',')+',';

        var sku_attr_map = tcb.cache('sku_attr_map'),
            sku_attr_map_id = QW.ObjectH.keys(sku_attr_map);

        // 下一个sku属性可用id
        var next_sku_attr_ids = [];
        sku_attr_map_id.forEach(function(id_str){
            if ( id_str.indexOf(checked_attr_id) === 0 ){

                var id_str_tmp = id_str.substring(checked_attr_id.length);

                id_str_tmp = id_str_tmp.split(',')[0];

                // 下一个sku属性id内不包含此id,那么将此id加入其中
                if ( tcb.inArray ( id_str_tmp, next_sku_attr_ids ) == -1 ) {
                    next_sku_attr_ids.push ( id_str_tmp );
                }
            }
        });

        // 过滤当前组可用的属性选项
        var group_list = sku_attr_group_by_cate[next_sku_attr_pos].filter(function(item){

            return tcb.inArray(item['option_id'], next_sku_attr_ids) !== -1;
        });
        var sku_option_groups = [
            {
                group_name: sku_attr_cate[next_sku_attr_pos]['options_cate_name'],
                group_list: group_list,
                col: getOptionsColByCateId(sku_attr_cate[next_sku_attr_pos]['options_cate_id'])
            }
        ];
        renderSkuOptions(sku_option_groups)

        // 下一组sku属性只有一个选项...那么..
        // 将唯一的选项选中,然后再继续取下一个..
        if ( next_sku_attr_ids.length === 1 ) {
            $Cur = $Cur.nextSibling('.phone-info-choice')

            $Cur.query('.check-item').addClass('check-item-on')

            return getNextSKUObj($Cur)
        } else {
            $Next = $Cur.nextSibling('.phone-info-choice')

            return $Next.hasClass('phone-info-choice-pre-checked') ? getNextSKUObj($Next) : $Next
        }

    }

    function renderAllPreCheckedSku($PrevSkuGroup) {
        if (!($PrevSkuGroup && $PrevSkuGroup.length && $PrevSkuGroup.hasClass('phone-info-choice-pre-checked'))) {
            return
        }

        renderAllPreCheckedSku(getNextSKUObj($PrevSkuGroup))
    }

    Dom.ready(function(){
        var
            // 表示是否有sku属性显示出来
            sku_show_flag = false

        // 获取sku属性选项并处理
        getModelSkuOptions(function(){
            // 输出sku属性选项第一组
            var
                sku_attr_group_by_cate = tcb.cache('sku_attr_group_by_cate')
                ,sku_attr_cate = tcb.cache('sku_attr_cate')
                ,sku_option_groups = []
                ,skip_flag = false

            // 遍历sku属性组,获取可输出的所有组合
            // 从最开始位置开始,可选属性数量为1的,都将其push到要输出的数组中,
            // 遇到属性数量大于1的,那么就从那个位置之后的都跳过~
            tcb.each(sku_attr_group_by_cate, function(i, group){
                if ( skip_flag ) {
                    return
                }
                var
                    col = getOptionsColByCateId(sku_attr_cate[i]['options_cate_id'])

                sku_option_groups.push({
                    group_name: sku_attr_cate[i]['options_cate_name'],
                    group_list: group,
                    col: col
                })

                if ( group.length > 1 ) {

                    skip_flag = true
                }

            })

            // 输出sku选项属性组
            renderSkuOptions(sku_option_groups)
            // 根据已经输出的Sku属性组,最后一组是已经被预选中,
            // 那么继续输出后边紧挨着的相连的预选中Sku评估项
            renderAllPreCheckedSku(W('#ModelSKUAttr .phone-info-choice').last())


            // 显示有多个选项的sku属性组,单个的直接隐藏不显示,并且将唯一选项设置为选中状态
            var
                $choice = $ModelSKUAttr.query('.phone-info-choice')

            $choice.forEach(function(el){
                var
                    $el = W(el)
                    ,$item = $el.query('.check-item')

                if ( $item.length > 1 ) {

                    $el.fadeIn()

                    sku_show_flag = true // 已有sku属性组显示出来,那么就不需要显示专有属性项了
                } else {
                    $item.addClass('check-item-on')
                }
            })


            // 获取专有属性选项并处理
            getModelSpecialOptions(function(){
                // 输出专有选项组
                var special_options_cate = tcb.cache('special_options_cate'),
                    special_options_group_list = tcb.cache('special_options_group_list'),
                    special_options_groups = [];
                special_options_cate.forEach(function(cate_item, i){
                    var options_col = getOptionsColByCateId(cate_item['options_cate_id']);

                    special_options_groups.push({
                        group_name: cate_item['options_cate_name'],
                        group_list: special_options_group_list[i],
                        col: options_col
                    });
                });
                renderSpecialOptions(special_options_groups);

                // 没有sku属性显示出来,直接显示第一个专有属性组(即:所有sku属性组都只有一个单独的选项,默认都被选中了)
                if ( !sku_show_flag ) {
                    W('#ModelSpecialOptions .phone-info-choice').first().fadeIn()
                }

                // 输出聚合属性选项
                var combo_options = tcb.cache('combo_options'),
                    combo_options_default = tcb.cache('combo_options_default'),
                    combo_col = getOptionsColByCateId('combo');
                renderComboOptions(combo_options, combo_options_default, combo_col);

            })

        })

    })

    window.Pinggu = window.Pinggu || {}

    tcb.mix(window.Pinggu, {
        renderSkuOptions: renderSkuOptions,
        getOptionsColByCateId: getOptionsColByCateId,
        getNextStepObj: getNextStepObj
    })

}())