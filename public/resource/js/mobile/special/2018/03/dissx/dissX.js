/**
 * covert canvas to image
 * and save the image file
 */

// ===========================================================
var UA = navigator.userAgent;
var isWx = UA.toLowerCase().match(/MicroMessenger/i) == 'micromessenger';
var phoneAssembly= {
    body:[
        {},
        {name:'标准机身',price:2988,solo:'经典圆角矩形，撞机率 +100 个性 -100'},
        {name:'圆弧机身',price:1988,solo:'魔镜魔镜告诉我，谁是世界上最美的人'},
        {name:'加长机身',price:5888,solo:'30年后的前瞻设计典范iPhone30预测版'},
        {name:'收腰机身',price:1888,solo:'创新的肥皂曲线设计，握感舒适充实'}
    ],
    color:[
        {name:'非酋黑',price:200,solo:'非洲天然阳光晒制而成，低调奢华'},
        {name:'原谅绿',price:-2000,solo:'集天地之绿气，熬制了这款春夏爆款绿色'},
        {name:'姨妈红',price:300,solo:'取自隔壁陈姨妈的老坛女儿红，醇厚甘美'},
        {name:'APEC蓝',price:500,solo:'色相取自地球上最蓝的天空，0雾霾'},
        {name:'奶奶灰',price:200,solo:'极致简约的纯净铝合金，你的时尚之选'},
        {name:'暖粉金',price:900,solo:'由珍贵粉色矿物打磨压制，温润柔美'},
        {name:'骄傲彩虹',price:2000,solo:'彩虹旗飘扬，勇敢做自己'}
    ],
    backCamera:[
        {name:'4000W',price:3000,solo:'加长摄像头，专治胖矮挫，轻松拥有2m大长腿'},
        {name:'瓦力双摄',price:1800,solo:'纯真双摄还原你最真实的自然美'},
        {name:'2000W',price:400,solo:'2万像素摄像头，重度磨皮+美颜'},
        {name:'1000W',price:200,solo:'古老埃及神秘力量打造，不老容颜触手可得'},
        {name:'“3X”后摄',price:2100,solo:'3000万像素X光摄像头拒绝虚假，拥抱真实'},
        {name:'3000W',price:1200,solo:'蕴含了自然世界的思考，照出大自然的轮回'},
        {name:'交通灯双摄',price:-2000,solo:'拍照时发射红绿光波，生成裸眼2D效果照片'},
        {name:'魔法阵单摄',price:-1000,solo:'源自中世纪女巫法阵，自带哥特风滤镜'}
    ],
    frontCamera:[
        {name:'侍女前摄',price:-1000,solo:'娘娘同款滤镜，叱咤后宫不是梦'},
        {name:'宫廷至尊版',price:200,solo:'采用全新Vface瘦脸科技，自拍拥有完美蛇精脸'},
        {name:'广角前摄',price:800,solo:'将广角镜头融入在前摄中，脸再大也能拍'},
        {name:'波浪前摄',price:300,solo:'水流磨砂打造的前摄面板，尽享丝滑自拍体验'},
        {name:'经典前摄',price:500,solo:'致敬Jony Ive国际范儿时尚齐刘海发型'},
        {name:'经典齐刘海',price:800,solo:'专为个性男孩女孩打造，斜拍打造完美侧颜'},
        {name:'不对称前摄',price:800,solo:'专为个性男孩女孩打造，斜拍打造完美侧颜'},
        {name:'3D前摄',price:110,solo:'运用新一代Face 3D技术，解锁误差近乎为0'},
        {name:'悬浮前摄',price:1000,solo:'使用时会在屏幕中随机出现，每天都有新惊喜'},
        {name:'黄金比例前摄',price:-2000,solo:'配备300万和700万像素双镜头，与3:7黄金比例'},
        {name:'“凝视I代”前摄',price:100,solo:'更易拍出斗鸡眼照片，获得红点设计大奖'},
        {name:'“凝视II代”前摄',price:700,solo:'享誉盛名的“凝视I代”摄像头升级版，自拍眼神更易对焦'},
        {name:'微前摄',price:1300,solo:'方寸之间集成1200万像素镜头，极简前置面板'}
    ]
};
var phonePrice = {
    body:2988,
    color:200,
    key:0,
    logo:0,
    frontCamera:0,
    backCamera:0,
    extra:0
};


function initEvent(){
    //进入组合页面
    $('#pageWelcome .btn-large').on('click',function(){
        $('#pageWelcome').hide();
        $('#pageIndex').show();
        location.hash = 'page=main';
    });
    $('#phoneBody').on('click','li',function(){
        var $this = $(this);
        var index = $this.attr('data-index')
        var item = phoneAssembly.body[index];
        phonePrice.body = item.price;
    });
    $('#phoneColor').on('click','li',function(){
        var $this = $(this);
        var index = $this.attr('data-index')
        var item = phoneAssembly.color[index];
        phonePrice.color = item.price;
    });

    $('#phoneFc').on('click','li',function(){
        var $this = $(this);
        var index = $this.attr('data-index')
        if(index == 0){
            phonePrice.frontCamera = 0;
            return;
        }
        var item = phoneAssembly.frontCamera[index];
        phonePrice.frontCamera = item.price;
    });
    $('#phoneBc').on('click','li',function(){
        var $this = $(this);
        var index = $this.attr('data-index')
        if(index == 0){
            phonePrice.backCamera = 0;
            return;
        }
        var item = phoneAssembly.backCamera[index];
        phonePrice.backCamera = item.price;
    });

    $('.confirm').on('click', function () {
        phonePrice = {
            body:2988,
            color:200,
            key:0,
            logo:0,
            frontCamera:0,
            backCamera:0,
            extra:0
        };
    })

}
function getXPrice(){
    var price = 0;
    for(var name in phonePrice){
        price += phonePrice[name];
    }
    return price;
}

function reRenderX(act){
    controller.render(JSON.parse(b64_to_utf8(act)))
    controller.publish();
    $('#pageWelcome').hide();
    $('#pageIndex').show();
    // 添加事件统计
    if(window.__is_sndissx){
        tcb.statistic ([ '_trackEvent', 'm', 'sn统计', 'dissx转发页面访问量', '1', '' ])
    }else{
        tcb.statistic ([ '_trackEvent', 'm', 'tcb统计', 'dissx转发页面访问量', '1', '' ])
    }
}

$(function(){
    initEvent();
    // var act = {0: "4", 1: "4", 2: "1", 3: "1"};
    if(getHashParam('page') == 'main'){
        $('#pageWelcome').hide();
        $('#pageIndex').show();
    }
    var act = getUrlParam('act');
    var pointGroups = getUrlParam('pointGroups');
    
    if(act && getHashParam('page') != 'index'){
        reRenderX(act);
        // if(pointGroups){
        //     var points = JSON.parse(b64_to_utf8(pointGroups))
        //     console.log(points)
        // }
    }else{

    }
});

function getHashParam(name){
    var result = getHash().match(new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"));
    return result != null ? result[2] : "";
}

function getHash(url) {
    var u = url || location.hash;
    return u ? u.replace(/.*#/,"") : "";
}

function getUrlParam(name,url){
    //参数：变量名，url为空则表从当前页面的url中取
    var u  = arguments[1] || window.location.search,
        reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"),
        r = u.substr(u.indexOf("\?")+1).match(reg);
    return r!=null?r[2]:"";
}

function getTop(price){
    var topMap = [
        [150000,15000000,99],
        [15000,150000,98],
        [9000,15000,97],
        [7000,9000,93,96],
        [5000,7000,90,93],
        [3000,5000,80,90],
        [1000,3000,50,66],
        [0,1000,0,50],
        [-100000,0,0]
    ];
    var percent = 0;
    for(var i =0;i<topMap.length;i++){
        var a = topMap[i];
        if(price>=a[0] && price<a[1]){
            if(!a[3]){
                percent = a[2]
            }else{
                percent = Math.round((price - a[0] )/(a[1]-a[0])*(a[3]-a[2]))+a[2]
            }
            break;
        }
    }
    return percent;
}

function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}
function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

