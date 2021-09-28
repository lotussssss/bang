// 评估流程中评估项的处理
(function () {
    var $ModelSKUAttr = $('#ModelSKUAttr')
        ,$ModelSpecialOptions = $('#ModelSpecialOptions')
        ,$ModelBaseOptions = $('#ModelBaseOptions')
        ,$ModelEvaluateCity = $('#ModelEvaluateCity')
    if ( !($ModelSKUAttr && $ModelSKUAttr.length) ) {
        return ;
    }

    var
        //选项图片提示
        options_has_img_tip = ['80', '82', '68', '70'];

    // 获取型号sku选项
    function getModelSkuOptions(callback){
        var model_id = tcb.queryUrl(window.location.href, 'model_id');
        var request_url = '/huishou/doGetSkuOptions',
            params = {
                model_id: model_id || 6
            };

        $.get(request_url, params, function (res) {
            res = $.parseJSON(res);

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

        $.get(request_url, params, function (res) {
            res = $.parseJSON(res);

            if ( !res['errno'] ) {

                // 处理型号sku属性数据
                handleModelSpecialOptions(res['result']);

                typeof callback==='function' && callback();

            }
            else {
                alert(res['errmsg']);
            }

        });
    }


    // 处理型号的sku数据，成为可用的格式
    function handleModelSkuOptions(sku_data){
        var
            sku_attr_map  = {} // sku属性组合到sku的唯一id的映射
            ,sku_attr_cate = [] // sku属性分类名称
            ,sku_attr_group_by_cate = [] // 根据每一个sku属性分类，组合sku属性
            ,sku_attr_group_by_cate_pushed_in = []

        var
            sku_data_list = sku_data['list']
            ,sku_data_map = sku_data['map']

        // 遍历sku的id和属性组的k-v组合
        $.map(sku_data_list, function (item_group, key) {
            var attr_ids = [];

            // sku id的属性组合
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

            sku_attr_map[sku_attr_map_key] = sku_attr_map_val

        });

        // 遍历sku分类属性组,进行排序
        $.each(sku_attr_group_by_cate, function(i, group){
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

        $ModelSKUAttr.append(str);
    }
    // 输出型号专有评估选项
    function renderSpecialOptions(special_option_groups){

        var str = getRequiredChoiceOptionsHtml(special_option_groups, false);

        $ModelSpecialOptions.append(str);
    }
    // 输出聚合属性选项
    function renderComboOptions(combo_options, combo_options_default, col){

        var str = getComboOptionsHtml(combo_options, combo_options_default, col);

        $ModelBaseOptions.append(str);
    }
    // 输出型号专有评估选项
    function renderEvaluateCity(){

        var str = getEvaluateCityHtml();

        $ModelEvaluateCity.append(str);
    }



    // 获取必选选项列表的html
    function getRequiredChoiceOptionsHtml(option_group_list, is_sku){
        var
            data = {
                options_has_img_tip: options_has_img_tip,
                option_group_list: option_group_list,
                is_sku: is_sku || false
            };
        var
            fn  = $.tmpl( $.trim( $('#JsMRequiredChoiceOptionsTpl').html() ) )
            ,str = fn(data);

        return str;
    }
    // 获取聚合属性选项的html
    function getComboOptionsHtml(combo_options, combo_options_default, col){
        var
            data = {
                combo_options: combo_options,
                combo_options_default : combo_options_default,
                col: col || 5
            };
        var
            fn  = $.tmpl( $.trim( $('#JsMPhoneBaseChoiceTpl').html() ) )
            ,str = fn(data);

        return str;
    }
    // 获取城市选项的html
    function getEvaluateCityHtml(){
        var
            fn  = $.tmpl( $.trim( $('#JsMEvaluateCityListTpl').html() ) )
            ,str = fn();

        return str;
    }
    // 获取属性输出的列数
    function getOptionsColByCateId(attr_cate_id){
        var
            col = 1
            ,col_arr = [1, 2] // 列数数组
            ,col_map = {
                'combo': col_arr[1], // 容量5列
                '2': col_arr[0], // 容量3列
                '4': col_arr[0], // 颜色4列
                '6': col_arr[0]  // 渠道2列
            }
        col = col_map[ attr_cate_id ] || col;

        return col;
    }

    // 根据选中的sku属性选项,获取sku选项组
    function getSkuOptionGroups(key_checked_sku_options){

        var
            checked_options = tcb.cache(key_checked_sku_options) || []
            ,sku_attr_group_by_cate = tcb.cache('sku_attr_group_by_cate')
            ,sku_attr_cate         = tcb.cache('sku_attr_cate')
            ,sku_attr_map          = tcb.cache('sku_attr_map')
            ,sku_attr_map_id   = [] // 存在的sku属性组合
            ,sku_option_groups = [] // 可输出的sku属性组

        // 首先将第一组sku属性加到输出属性组中(第一组sku属性总是全量显示,并且必有)
        sku_option_groups.push({
            group_name: sku_attr_cate[0]['options_cate_name'],
            group_list: sku_attr_group_by_cate[0],
            col: getOptionsColByCateId(sku_attr_cate[0]['options_cate_id'])
        });

        // 第一个选项组只有一个选项,那么!默认把它选中!!选中!!选中!!
        if ( sku_attr_group_by_cate[0].length===1 ) {

            checked_options
                .splice(0, 1, sku_attr_group_by_cate[0][0]['option_id'])
        }

        // 遍历sku属性和id的k-v映射表,获取sku属性组合
        $.each(sku_attr_map, function(k, v){
            sku_attr_map_id.push(k);
        });

        var
            // 用来过滤的id(即:被选中的sku属性id)
            filtered_ids = [];
        // 遍历选中的sku属性(这个过程可能会直接修改到checked_options对象本身)
        $.each(checked_options, function(i, attr_id){
            // 遍历到sku属性组最后一个,那么没有下一个属性组,直接返回退出
            if ( i == sku_attr_group_by_cate.length-1) {
                return false
            }

            filtered_ids.push(attr_id)

            var
                next_sku_attr_ids = [] // 下一个sku属性可用id

            // 遍历sku属性组合,获取下一个sku属性可用id
            $.each(sku_attr_map_id, function(i, id_str){
                var
                    filtered_ids_str = filtered_ids.join(',')+',';

                if ( id_str.indexOf(filtered_ids_str) === 0 ){

                    var id_str_tmp = id_str.substring(filtered_ids_str.length);

                    //var id_str_tmp = id_str.split(filtered_ids_str);
                    //
                    //id_str_tmp = id_str_tmp[1] || id_str_tmp[0];

                    id_str_tmp = id_str_tmp.split(',')[0];

                    // 下一个sku属性id内不包含此id,那么将此id加入其中
                    if ( tcb.inArray ( id_str_tmp, next_sku_attr_ids ) == -1 ) {
                        next_sku_attr_ids.push ( id_str_tmp );
                    }
                }
            });

            var
                sku_group_pos = i + 1
                // 过滤当前组可用的属性选项
                ,group_list = sku_attr_group_by_cate[sku_group_pos].filter(function(item){

                    return tcb.inArray(item['option_id'], next_sku_attr_ids) > -1
                })

            // 下一个选项只有一个选项,那么!默认把它选中!!选中!!选中!!
            if ( next_sku_attr_ids.length===1 ) {
                checked_options.splice(sku_group_pos, 1, next_sku_attr_ids[0])
            }

            sku_option_groups.push({
                group_name: sku_attr_cate[sku_group_pos]['options_cate_name'],
                group_list: group_list,
                col: getOptionsColByCateId(sku_attr_cate[sku_group_pos]['options_cate_id'])
            })

        })

        // 重新设置被选中的sku属性项
        tcb.cache(key_checked_sku_options, checked_options)

        return sku_option_groups;
    }
    // 获取分组数量
    function getMixGroupCount(callback){
        var
            base_group_count = 1
            ,sku_attr_cate
            ,special_options_cate

        function dataLoaded(){
            sku_attr_cate = tcb.cache('sku_attr_cate')
            special_options_cate = tcb.cache('special_options_cate')
            if ( !(sku_attr_cate&&special_options_cate) ) {
                setTimeout(dataLoaded, 100);
            } else {
                var max_step = base_group_count+sku_attr_cate.length+special_options_cate.length;

                // 购物车中是否有城市
                if ( !window.__CITY_IN_CART ) {
                    max_step++;
                }

                typeof callback==='function' && callback(max_step);

                return;
            }
        }
        // 还没有获取到sku分组\或者专有评估项分组
        if ( !(sku_attr_cate&&special_options_cate) ){
            dataLoaded();
        }
    }

    window.Pinggu = {
        renderSkuOptions: renderSkuOptions,
        getSkuOptionGroups: getSkuOptionGroups,
        getOptionsColByCateId: getOptionsColByCateId,
        getMixGroupCount: getMixGroupCount
    };


    $(function(){
        // 获取sku属性选项并处理
        getModelSkuOptions(function(){
            // 输出sku属性选项第一组
            var
                sku_attr_group_by_cate = tcb.cache('sku_attr_group_by_cate')
                ,sku_attr_cate = tcb.cache('sku_attr_cate')
                ,col = getOptionsColByCateId(sku_attr_cate[0]['options_cate_id']);

            var
                sku_option_groups = [
                    {
                        group_name: sku_attr_cate[0]['options_cate_name'],
                        group_list: sku_attr_group_by_cate[0],
                        col: col
                    }
                ];
            renderSkuOptions(sku_option_groups);

        });

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

            // 输出聚合属性选项
            var combo_options = tcb.cache('combo_options'),
                combo_options_default = tcb.cache('combo_options_default'),
                combo_col = getOptionsColByCateId('combo');
            renderComboOptions(combo_options, combo_options_default, combo_col);

            // 购物车中是否有城市
            if ( !window.__CITY_IN_CART ) {
                // 输出城市列表
                renderEvaluateCity();
            }

        });
    });

}());