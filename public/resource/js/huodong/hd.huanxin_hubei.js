$(function(){
    var ShopList = [
        [ "武汉公司（包含武汉周边城市）",
          [ [ "中山店",
              "江汉区解放大道557号中山广场" ],
            [ "唐家墩",
              "江汉区发展大道299号顶琇晶城1-4楼" ],
            [ "菱角湖",
              "江汉区新华下路169号菱湖上品苏宁电器" ],
            [ "光谷店",
              "洪山区光谷特一号光谷资本大厦负一楼" ],
            [ "中南店",
              "武昌区中南路中建广场B座1-3楼" ],
            [ "徐东店",
              "武昌区友谊大道508号万利广场负一楼" ],
            [ "南湖店",
              "武昌区南湖花园南湖都会B座1-3楼" ],
            [ "青山店",
              "青山区红钢城街道沿港路3号" ],
            [ "三角路",
              "武昌区特一号水岸国际大厦1-2楼" ],
            [ "宜家店",
              "硚口区长宜路1号荟聚中心四楼" ],
            [ "百步亭",
              "江岸区后湖大道268号新生活摩尔城" ],
            [ "大街店",
              "江夏大道中央大街大厦1-2楼" ],
            [ "江夏店",
              "江夏区纸坊街道纸坊新兴街296号" ],
            [ "沌口店",
              "汉阳开发区宁康路58号湘隆时代商业中心一楼" ],
            [ "阳逻店",
              "新洲区阳逻街平江路南东港中心城1-2楼（阳逻客运站旁）" ],
            [ "盘龙城",
              "巨龙大道157号空港中心城负一层（盘龙大道和巨龙大道交汇处）" ],
            [ "黄陂店",
              "黄陂区前川大道民安街32号" ],
            [ "黄石店",
              "黄石港区黄石大道678号新百百货二楼" ],
            [ "天门店",
              "天门市城区西湖路银座帝景湾CB负一层" ],
            [ "鄂州店",
              "鄂城区文星大道19号明堂市场二楼" ],
            [ "黄冈店",
              "黄州区赤壁街道八一路17号" ],
            [ "黄梅店",
              "黄梅县建陶路正街鑫城二期" ],
            [ "红安店",
              "城关镇沿河大道盛地沃尔玛广场" ],
            [ "嘉鱼店",
              "鱼岳镇东岳路二乔广场" ],
            [ "孝感店",
              "孝感市交通西路258号全洲国际商城" ],
            [ "咸宁店",
              "咸宁市温泉街道53号" ],
            [ "随州店",
              "曾都区西城街道解放路97号1-2楼" ],
            [ "武穴店",
              "武穴街道广济大道龙潭国际商贸城1期1栋1-101号" ],
            [ "通城店",
              "咸宁市通城县隽水镇解放西路9号" ],
            [ "阳新店",
              "阳新光谷广场负一楼（兴国大道与阳新大道交汇处）" ],
            [ "新洲店",
              "新洲区衡州大道100号" ] ]
        ],
        [ "宜昌公司",
          [ [ "宜昌CBD店",
              "宜昌市西陵区夷陵大道56号大洋百货负一楼" ],
            [ "宜昌万佳店",
              "宜昌市西陵区东山大道99号万佳幸福花园负一楼" ],
            [ "宜昌夷兴大道店",
              "宜昌市夷陵区夷兴大道94号国贸超市负一楼" ],
            [ "宜昌当阳店",
              "当阳市新玉阳路盛泰广场A1区1楼" ],
            [ "宜昌枝江店",
              "枝江市迎宾大道妙尚广场负一楼" ],
            [ "宜昌宜都店",
              "宜都市杨守敬大道与红东公路交汇处国际商贸城" ],
            [ "宜昌秭归店",
              "秭归长宁大道金城广场6号楼一楼" ] ]
        ],
        [ "荆门公司",
          [ [ "荆门星球广场店",
              "掇刀区虎牙关大道星球路18号星球商业中心" ],
            [ "荆门沙洋店",
              "沙洋县荷花南路金水湾步行街4号楼" ],
            [ "荆门京山店",
              "京山县京源大道101号花生贸购物广场" ],
            [ "荆门钟祥店",
              "钟祥市王府大道18号燕兴数码广场" ] ]
        ],
        [ "荆州公司",
          [ [ "荆州万达云店",
              "荆州市北京西路万达广场中庭2楼" ],
            [ "荆州北京路店",
              "荆州沙市区北京中路288号" ],
            [ "荆州石首店",
              "荆州石首市建设路奔马商业街37号" ],
            [ "荆州监利店",
              "容城镇容城大道90号容城天骄一楼（肯德基旁）" ],
            [ "荆州洪湖店",
              "洪湖市购物公园3号门(一桥桥头)" ],
            [ "荆州绿地店",
              "荆州市荆州区庄王大道18号绿地之窗A区" ] ]
        ],
        [ "襄阳公司",
          [ [ "襄阳丹江路店",
              "丹江路7号" ],
            [ "襄阳长虹路店",
              "长虹路与人民路交叉口（城市映像）" ],
            [ "襄阳怡谷店",
              "县府街怡谷大酒店" ],
            [ "襄阳北京路店",
              "老河口北京路1号" ],
            [ "枣阳万象城店",
              "枣阳沙河二路万象城" ],
            [ "襄阳天元四季城店",
              "襄阳市樊城区大庆路与人民路交叉路口" ] ]
        ]

    ];
    
    if(ShopList) {
        var html_str = $.tmpl($.trim($ ('#JsSuningHubeiShopListTpl').html())) ({
            'shopList' : ShopList
        });
        $ ('.block-shop-list').html(html_str);
    }
});
