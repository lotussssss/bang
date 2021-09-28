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