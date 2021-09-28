Dom.ready(function(){

    // 激活区县选择相关处理
    new bang.AreaSelect({
        'wrap': '#LiangpinTinfoCitySelector',
        'hasquan' : false,
        'data': data,
        // 城市选择时触发
        'onCitySelect': function(d){
            var cityname = d.cityname||'',
                citycode = d.citycode||'',
                areaname = d.areaname||'',
                areacode = d.areacode||'';
            wWrap.one('[name="yj_city_name"]').val(cityname);
            wWrap.one('[name="yj_city_code"]').val(citycode);
            wWrap.one('[name="yj_area_name"]').val(areaname);
            wWrap.one('[name="yj_area_id"]').val(areacode);
            wWrap.one('.addrinfo-cityarea').html(cityname+areaname);
        },
        // 区县选择时触发
        'onAreaSelect': function(d){
            var cityname = d.cityname||'',
                citycode = d.citycode||'',
                areaname = d.areaname||'',
                areacode = d.areacode||'';

            wWrap.one('[name="yj_city_name"]').val(cityname);
            wWrap.one('[name="yj_city_code"]').val(citycode);
            wWrap.one('[name="yj_area_name"]').val(areaname);
            wWrap.one('[name="yj_area_id"]').val(areacode);
            wWrap.one('.addrinfo-cityarea').html(cityname+areaname);
        }
    });

});