// 试用通用js
(function(){

    // 设置页面统计，
    // 统计规则：URL的pathname+query参数中的(product_id+from_page+partner_flag)
    function setStatistic(){
        var pathname = window.location.pathname,
            query = tcb.queryUrl(window.location.search),
            params = {}

        if (query['product_id']){
            params['product_id'] = query['product_id']
        }
        if (query['from_page']){
            params['from_page'] = query['from_page']
        }
        if (query['partner_flag']){
            params['partner_flag'] = query['partner_flag']
        }
        if (query['self_enterprise']){
            params['self_enterprise'] = query['self_enterprise']
        }

        var url = tcb.setUrl(pathname, params)

        tcb.statistic([ '_trackPageview', url])
    }
    setStatistic()
}());