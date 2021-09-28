/**
 * usage : 
 * var timer = new Timer(el, (new Date('2013/01/01 00:00:00')).getTime(), '2012/05/01 10:11:11');
 * timer.on('timeout', function() {
 * 		alert('时间到');
 * });
 */
 
(function() {
	function Timer() {
		this.init.apply(this, arguments);
	};

	Timer.prototype = (function() {
		var formatTime = function(ms) {
			var s = parseInt(ms / 1000, 10),
				r = s;

			var day = parseInt(s / (3600 * 24), 10);
			r -= day * 3600 * 24;

			var hour = parseInt(r / 3600, 10);
			r -= hour * 3600;

			var minute = parseInt(r / 60, 10);
			r -= minute * 60;

			return [day, '天', hour, '小时', minute, '分钟', r, '秒'].join('');
		};

		return {
			init : function(el, startTime, endTime, prefix) {
				endTime = endTime.replace(/-/g, '/');

				this.deltaTime = startTime - (+ new Date);
				this.endTime = (new Date(endTime)).getTime();
				this.el = W(el);

				this.prefix = prefix;

				CustEvent.createEvents(this);
				this.start();
			},

			start : function() {
				var instance = this,
					id,
					tick = function() {
						var endTime = instance.endTime,
							now = (+ new Date) + instance.deltaTime;
						if(now >= endTime) {
							clearInterval(id);

							instance.fire('timeout');
						} else {
							instance.el.html((instance.prefix || '') + formatTime(endTime - now));
						}
					};

				if(!id) {
					tick();
					id = setInterval(tick, 1000);
				}
			}
		}
	})();

	QW.provide({'Timer' : Timer});
})();