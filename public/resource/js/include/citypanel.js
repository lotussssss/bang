/**
 * 
 */
Dom.ready(function() {
    if(!W('#citypanel_trigger').length) return false;
    
    var cityPanel = new CityPanel('#citypanel_trigger');

    cityPanel.on('close', function(e) {
        //alert('close panel');
    });

    var selArea = W('#sel_area'),
        selAreaQuan = W('#sel_areaquan'),

        txtCity = W('#city'),
        txtCityCode = W('#city_code'),

        txtArea = W('#area'),
        txtAreaCode = W('#area_code'),

        txtAreaQuan = W('#areaquan'),
        txtAreaQuanCode = W('#areaquan_code');

    var city;

    var sortResult = function(result) {
        var results = [];
        for(var id in result) {
            var name = result[id];
            results.push({id : parseInt(id, 10), name : name});
        }

        results.sort(function(o1, o2) {
            if(o1.id > o2.id) {
                return 1;
            } else if(o1.id < o2.id) {
                return -1;
            } else {
                return 0;
            }
        });

        return results;
    };

    selAreaQuan.on('change', function(e) {
        var val = this.value.split(':'),
            city_name = val[0],
            city_id = val[1] | 0;

            txtAreaQuan.val(city_name);
            txtAreaQuanCode.val(city_id);
    });

    selArea.on('change', function(e) {
        var val = this.value.split(':'),
            city_name = val[0],
            city_id = val[1] | 0;

        txtArea.val(city_name);
        txtAreaCode.val(city_id);

        txtAreaQuan.val('');
        txtAreaQuanCode.val('');

        if(selAreaQuan.length == 0) { return;}  //后面的逻辑不要了

        selAreaQuan.hide();

        var default_name, default_id;
        if(selAreaQuan.attr('data-default')) {
            var arr = selAreaQuan.attr('data-default').split(':');
            default_name = arr[0];
            default_id = arr[1];
        }

        Ajax.get('/aj/get_areaquan/?citycode=' + city + '&areacode=' + city_id, function(e) {
            var ret = e.evalExp();
            if(parseInt(ret.errno, 10) != 0) {
                alert(ret.errmsg);
                return;
            }

            selAreaQuan[0].options.length = 0;

            if(ret.result) {
                var results = sortResult(ret.result);

                for(var i = 0; i < results.length; i++) {
                    var result = results[i],
                        id = result.id,
                        name = result.name,
                        option = new Option(name, name + ':' + id);

                    if(name == default_name && id == default_id) {
                        option.selected = true;
                    }

                    selAreaQuan[0].options.add(option);
                }
            }

            if(selAreaQuan.query('option').length > 0) {
                selAreaQuan.show().fire('change');
            } else {
                selAreaQuan.hide();
            }
        });
    });

    cityPanel.on('selectCity', function(e) {
        city = e.city.trim();

        var city_name = e.name.trim();

        W('#citypanel_trigger').html('<b>' + city_name + '</b>');

        txtCity.val(city_name);
        txtCityCode.val(city);

        Valid.check(txtCity[0]);

        txtArea.val('');
        txtAreaCode.val('');
        selArea.hide();

        txtAreaQuan.val('');
        txtAreaQuanCode.val('');
        selAreaQuan.hide();

        var default_name, default_id;
        if(selArea.attr('data-default')) {
            var arr = selArea.attr('data-default').split(':');
            default_name = arr[0];
            default_id = arr[1];
        }

        Ajax.get('/aj/get_area/?citycode=' + city, function(e) {
            var ret = e.evalExp();
            if(parseInt(ret.errno, 10) != 0) {
                alert(ret.errmsg);
                return;
            }

            selArea[0].options.length = 0;

            if(ret.result) {
                var results = sortResult(ret.result);

                for(var i = 0; i < results.length; i++) {
                    var result = results[i],
                        id = result.id,
                        name = result.name,
                        option = new Option(name, name + ':' + id);

                    if(name == default_name && id == default_id) {
                        option.selected = true;
                    }

                    selArea[0].options.add(option);
                }
            }

            if(selArea.query('option').length > 0) {
                selArea.show().fire('change');
            } else {
                selArea.hide();
            }
        });
    });

    if(txtAreaQuan.val() != '' && txtAreaQuanCode.val() != '') {
        if(selAreaQuan.length > 0) { 
            selAreaQuan.attr('data-default', txtAreaQuan.val() + ':' + txtAreaQuanCode.val());
        }
    }

    if(txtArea.val() != '' && txtAreaCode.val() != '') {
        selArea.attr('data-default', txtArea.val() + ':' + txtAreaCode.val());
    }

    if(txtCity.val() != '' && txtCityCode.val() != '') {
        cityPanel.fire('selectCity', {'name' : txtCity.val(), 'city' : txtCityCode.val()});
    }

    
    cityPanel.on('selectCity', function(e) {
        var city_name = e.name.trim() || "";    
        W('#citypanel_trigger').attr('data-city', city_name);  

        W('#cityAreaBox').html(  city_name + '&nbsp;' );  
    });

    selArea.on('change', function(e){
        var val = this.value.split(':'),
            city_name = val[0],
            prc = txtCity.val();

        W('#cityAreaBox').html(  prc + '&nbsp;' + city_name + '&nbsp;' );
    });
}); 
