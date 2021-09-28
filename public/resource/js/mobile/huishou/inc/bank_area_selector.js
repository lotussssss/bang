/**
 * 银行所在地选择
 * @return {[type]} [description]
 */
!function(){
    function bankAreaSelector(provenceBox, cityBox, filed, area){
        var
            me = this

        me.init(provenceBox, cityBox, filed, area)
    }

    function init(provenceBox, cityBox, filed, area){
        this._area = area;
        this.Wprovence = $(provenceBox);
        this.Wcity = $(cityBox);
        this.Wfiled = $(filed);

        this.showProvince()
        this.bindEvent()
    }

    function bindEvent(){
        var
            me = this

        me.Wprovence.on('change', function(e){
            var
                pval = $(this).val()
            if( pval >-1 ){

                me.showCity(pval)

            }
        })

        me.Wcity.on('change', function(e){
            me.setFiled()
        })
    }

    function showProvince(){
        var
            me = this,
            list = me._area.provinces,
            str = '<option value="-1">请选择银行所在地</option>'

        for(var i=0, n=list.length; i<n; i++){
            str += '<option value="'+i+'">'+list[i]+'</option>'
        }

        me.Wprovence.html( str )
    }

    function showCity(pid){
        var
            me = this,
            list = me._area.cities[pid]

        var str = ''
        for(var i=0, n=list.length; i<n; i++){
            str += '<option value="'+i+'">'+list[i]+'</option>'
        }

        me.Wcity.show().html( str )

        me.setFiled()
    }

    function setFiled(){
        var
            me = this,
            province_city = me.Wprovence.find('option[value="'+me.Wprovence.val()+'"]').html()
                + '|'
                + me.Wcity.find('option[value="'+me.Wcity.val()+'"]').html()

        me.Wfiled.val(province_city)
    }

    bankAreaSelector.prototype = {
        constructor : bankAreaSelector,
        init : init,
        bindEvent : bindEvent,
        showProvince : showProvince,
        showCity : showCity,
        setFiled : setFiled
    }

    window.bankAreaSelector = bankAreaSelector
}()