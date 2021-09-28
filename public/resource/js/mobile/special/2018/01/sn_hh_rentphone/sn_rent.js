$(function () {
    // console.log(__MODEL_LIST)
    var _STATE = {
        all_brand:getAllBrand(__MODEL_LIST),
        all_model:getAllModel(__MODEL_LIST),
        brand_select_init:null,
        model_select_init:null,
        select_data: {
            brand_id:-1,
            model_id:0
        }
    }

    function initPage(){
        initBrandSelect(_STATE.all_brand)
        initModelSelect(_STATE.all_model)

        var s_brand_id = getSelectedData('brand_id')
        var s_model_id = getSelectedData('model_id')
        var productList = getProductByBrandAndModelId(s_brand_id,s_model_id)
        // renderProductList(productList)
        // setTimeout(function(){
        //     $('.js-products-container').show()
        // }, 60)
    }
    initPage()


    //初始化brandselect
    function initBrandSelect(brandList){
        var $tirgger = $('.js-select-brand')
        _STATE['brand_select_init']=initSelect($tirgger,brandList,function(selectedData){
            var brand_id = selectedData['id']
            console.log(brand_id)
            setSelectedBrandId(brand_id)
            setSelectedModelId(0)
            var model_list = getModelByBrandId(_STATE['all_model'],brand_id)
            var model_select_init = getModelSelectInit()
            if(model_select_init){
                var model_select_trigger = model_select_init.options.selectorTrigger
                $(model_select_trigger).html('全部机型')
                model_select_init.options.data[0]=model_list
                model_select_init.render()
            }
            var s_model_id = getSelectedData('model_id')
            var productList = getProductByBrandAndModelId(brand_id,s_model_id)
            renderProductList(productList)
        })
    }
    //初始化modelselect
    function initModelSelect(){
        var $tirgger = $('.js-select-model')
        _STATE['model_select_init']=initSelect($tirgger,_STATE['all_model'],function(selectedData){
            var model_id = selectedData['id']
            setSelectedModelId(model_id)
            var s_brand_id = getSelectedData('brand_id')
            var productList = getProductByBrandAndModelId(s_brand_id,model_id)
            renderProductList(productList)
        })
    }

    //初始化select
    function initSelect($trigger,pickerData,callback){
        return Bang.Picker({
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
                typeof callback === 'function' && callback(selectedData,inst)
            },
            callbackCancel  : null
        })
    }
    //根据brandId和modelid筛选list
    function getProductByBrandAndModelId(brand_id, model_id){
        var new_product_list
        if(model_id===0 && brand_id===-1){
            return __MODEL_LIST
        } else if(model_id===0){
            new_product_list= __MODEL_LIST.filter(function(item){
                if(item.brand_id === brand_id){
                    return item
                }
            })
        }else if(brand_id===-1){
            new_product_list= __MODEL_LIST.filter(function(item){
                if(item.model_id === model_id){
                    return item
                }
            })
        }else{
            new_product_list= __MODEL_LIST.filter(function(item){
                if(item.brand_id === brand_id && item.model_id === model_id){
                    return item
                }
            })
        }
        return new_product_list
    }
    //展示list
    function renderProductList(product_list){
        var $target = $('.js-products-container')
        if(!product_list || product_list.length===0) return
        var
            html_fn = $.tmpl( tcb.trim( $('#JsProductTmpl').html() )),
            html_str = html_fn({
                list : product_list
            })
        $target.html(html_str)
    }
    //筛选出所有品牌
    function getAllBrand(list){
        if(!list) return []
        if(list.length<=1) return list
        var new_arr = [{id: -1, name: '全部品牌'}]
        for(var i=0; i<list.length; i++){
            var flag = true
            for(var j=0; j<new_arr.length; j++){
                if(new_arr[j]['id'] == list[i]['brand_id']){
                    flag=false
                    continue
                }
            }
            if(flag){
                new_arr.push({
                    id: list[i]['brand_id'],
                    name: list[i]['brand_name']
                })
            }
        }
        return new_arr
    }
    //筛选出所有机型
    function getAllModel(list){
        if(!list || list.length === 0) return []
        var new_arr = [{id: 0, name: '全部型号',brand_id: -1}]
        for(var i=0; i<list.length; i++){
            var flag = true
            for(var j=0; j<new_arr.length; j++){
                if(new_arr[j]['id'] == list[i]['model_id']){
                    flag=false
                    continue
                }
            }
            if(flag){
                new_arr.push({
                    id: list[i]['model_id'],
                    name: list[i]['model_name']+' '+ list[i]['model_desc'],
                    brand_id: list[i]['brand_id']
                })
            }
        }
        return new_arr
    }
    //根据brandid获取机型
    function getModelByBrandId(list, brand_id){
        if(brand_id===-1){
            return list
        }else{
            var new_list =  list.filter(function(item){
                if(item.brand_id === brand_id){
                    return {
                        id:item.model_id,
                        name: item.model_name + ' '+item.model_desc,
                        brand_id: item.brand_id
                    }
                }
            })
            new_list.unshift({id: 0, name: '全部型号',brand_id: 0})
            return new_list
        }
    }
    //设置选中的brandid
    function setSelectedBrandId(id){
        return _STATE['select_data']['brand_id'] = id
    }
    //设置选中的modelid
    function setSelectedModelId(id){
        return _STATE['select_data']['model_id'] = id
    }
    //获取选中的brandid或modelid
    function getSelectedData(key){
        return key ?_STATE['select_data'][key]: _STATE['select_data']
    }
    //获取机型select实例
    function getModelSelectInit(){
        return _STATE['model_select_init']
    }
});