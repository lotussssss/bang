// 价格计算
(function(){
    var Bang = window.Bang = window.Bang || {};

    function getProductOriginPrice(){
        var me = this;

        var PriceObj = me.PriceObj;

        return PriceObj['origin_price'];
    }
    function setProductPriceInfo(prop, val, final_flag){
        var me = this;

        var PriceObj = me.PriceObj;

        if (val) {
            PriceObj[prop] = val;
        } else {
            if (typeof PriceObj[prop] !== 'undefined') {

                delete PriceObj[prop];
            }
        }

        return final_flag ? me.calculateProductPrice() : val;
    }
    function getProductPriceInfoByProp(prop){
        var me = this;

        var PriceObj = me.PriceObj;

        return PriceObj[prop] || 0;
    }
    function deleteProductPriceInfoByProp(prop){
        var me = this;

        me.setProductPriceInfo(prop);
    }
    function calculateProductPrice(){
        var me = this;

        var PriceObj = me.PriceObj,
            final_price = parseFloat(PriceObj['origin_price']) || 0;

        // 原价折扣
        if (PriceObj['origin_price_promo_per'] && PriceObj['origin_price_promo_per']>0 && PriceObj['origin_price_promo_per']<100) {
            final_price = tcb.formatMoney( final_price*PriceObj['origin_price_promo_per']/100, 0, -1);
        }

        // 累加计算价格，将原价和两个特殊折扣除开
        var except_prop = ['origin_price', 'origin_price_promo_per', 'final_price_promo_per'];
        for(var prop in PriceObj) {
            if (PriceObj.hasOwnProperty( prop )){
                // 累加except_prop以外的属性值
                if ( tcb.inArray(prop, except_prop) === -1 ){
                    final_price += parseFloat(PriceObj[prop]) || 0;
                }
            }
        }

        // 最终价格折扣
        if (PriceObj['final_price_promo_per'] && PriceObj['final_price_promo_per']>0 && PriceObj['final_price_promo_per']<100) {
            final_price = tcb.formatMoney( final_price*PriceObj['final_price_promo_per']/100, 1, -1);
        }

        return tcb.formatMoney(final_price, 2, 1);
    }


    function PriceCalculate(PriceObj){

        var me = this;

        me.PriceObj = PriceObj;

    }

    // 设置商品价格信息
    PriceCalculate.prototype.setProductPriceInfo = setProductPriceInfo;
    // 传入属性 获取 商品价格相关参数的值
    PriceCalculate.prototype.getProductPriceInfoByProp = getProductPriceInfoByProp;
    // 传入属性 删除 商品价格相关参数的值
    PriceCalculate.prototype.deleteProductPriceInfoByProp = deleteProductPriceInfoByProp;
    // 计算商品价格
    PriceCalculate.prototype.calculateProductPrice = calculateProductPrice;
    // 获取商品原始价格
    PriceCalculate.prototype.getProductOriginPrice = getProductOriginPrice;

    window.Bang.PriceCalculate = function(InputPriceObj){
        InputPriceObj = InputPriceObj || {};

        var PriceObj = tcb.mix({
            'origin_price': 0, // 原始价格
            'origin_price_promo_per': 0, // 原价折扣（88折等，不大于100，小于等于0则无效）
            'final_price_promo_per': 0 // 最终价格折扣（88折等，不大于100，小于等于0则无效）
        }, InputPriceObj, true);

        return new PriceCalculate(PriceObj);
    };
}());