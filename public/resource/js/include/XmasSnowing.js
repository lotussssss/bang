(function(){
    var Bang = window.Bang = window.Bang || {};

    function XmasSnowing(SnowingContainerId) {
        this.snowID			= 1;
        this.types          = ['snow-type-1', 'snow-type-2'];
        this.sizes			= ['', 'snow-size-xxs', 'snow-size-xs', 'snow-size-s', 'snow-size-m', 'snow-size-l', 'snow-size-xl', 'snow-size-xxl'];
        this.speeds			= ['', 'snow-speed-s', 'snow-speed-m', 'snow-speed-f'];
        this.opacities 		= ['', 'snow-opacity-faint', 'snow-opacity-light', 'snow-opacity-dark'];
        this.delays			= ['', 'snow-delay-1', 'snow-delay-2', 'snow-delay-3', 'snow-delay-4', 'snow-delay-5', 'snow-delay-6'];
        this.SnowingContainer = typeof SnowingContainerId === 'string'
            ? document.getElementById(SnowingContainerId)
            : SnowingContainerId;
    }

    // 生成从from到to的随机数
    XmasSnowing.prototype.randomFromTo = function(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    };

    // 查找指定名称的keyframe
    // from: http://blog.joelambert.co.uk/2011/09/07/accessing-modifying-css3-animations-with-javascript/
    XmasSnowing.prototype.findKeyframeAnimation = function(a) {
        var ss = document.styleSheets;
        for (var i = ss.length - 1; i >= 0; i--) {
            try {
                var s = ss[i],
                    rs = s.cssRules ? s.cssRules :
                        s.rules ? s.rules :
                            [];

                for (var j = rs.length - 1; j >= 0; j--) {
                    if ((rs[j].type === window.CSSRule.WEBKIT_KEYFRAMES_RULE || rs[j].type === window.CSSRule.MOZ_KEYFRAMES_RULE) && rs[j].name == a){
                        return rs[j];
                    }
                }
            }
            catch(e) { /* Trying to interrogate a stylesheet from another domain will throw a security error */ }
        }
        return null;
    };

    // 更新snowfalling keyframe的高度
    XmasSnowing.prototype.updateKeyframeHeight = function() {
        if (keyframes = this.findKeyframeAnimation("snowfalling")) {

            var height = this.SnowingContainer.offsetHeight;

            var newRule = '';
            if (keyframes.cssText.match(new RegExp('webkit'))) {
                newRule = "100% { -webkit-transform: translate3d(0,"+height+"px,0) rotate(360deg); }";
            } else if (keyframes.cssText.match(new RegExp('moz'))) {
                newRule = "-moz-transform: translate(0,"+height+"px) rotate(360deg);";
            } else{
                newRule = "100% { transform: translate3d(0,"+height+"px,0) rotate(360deg);}";
            }
            if (keyframes.insertRule) {
                keyframes.insertRule(newRule);
            } else {
                keyframes.appendRule(newRule);
            }
        }
    };

    // 创造雪花
    // moreSnow作为create的别名，用来添加更多的雪花
    XmasSnowing.prototype.create = XmasSnowing.prototype.moreSnow = function(snowflakeCount) {
        var i = 0;
        this.updateKeyframeHeight();
        while (i < snowflakeCount) {
            var snowflake	= document.createElement('i');
            var type        = this.types[this.randomFromTo(0, this.types.length-1)];
            var size 		= this.sizes[this.randomFromTo(0, this.sizes.length-1)];
            var speed		= this.speeds[this.randomFromTo(0, this.speeds.length-1)];
            var opacity 	= this.opacities[this.randomFromTo(0, this.opacities.length-1)];
            var delay		= this.delays[this.randomFromTo(0, this.delays.length-1)];
            snowflake.setAttribute('id', 'snowId'+this.snowID);
            snowflake.setAttribute('class', type+' '+size+' '+speed+' '+opacity+' '+delay);
            snowflake.setAttribute('style','left: '+this.randomFromTo(0, 100)+'%;');
            this.SnowingContainer.appendChild(snowflake);
            i++;
            this.snowID++;
        }
    };

    // 删除指定数量雪花
    XmasSnowing.prototype.lessSnow = function(snowflakeCount) {
        if (this.SnowingContainer.childNodes.length > snowflakeCount) {
            var snowRemoveCount = 0;
            while (snowRemoveCount < snowflakeCount) {
                this.SnowingContainer.removeChild(this.SnowingContainer.lastChild);
                snowRemoveCount++;
            }
        }
    };

    Bang.XmasSnowing = XmasSnowing;
}());