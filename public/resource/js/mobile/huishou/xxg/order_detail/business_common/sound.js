// 声音逻辑
!function () {
    if (window.__PAGE !== 'xxg-order-detail-v2020') {
        return
    }

    window.XXG = window.XXG || {}
    window.XXG.BusinessCommon = tcb.mix(window.XXG.BusinessCommon || {}, {
        soundPlay: soundPlay,
        soundPlaySequence: soundPlaySequence,
        soundStop: soundStop
    })

    var __soundInstMap = {}
    var __soundInstPlaying = null
    var __soundInstPlayingTimeHandler = null

    // 播放声音
    function soundPlay(options) {
        var src = options.src
        var repeat = options.repeat || 1
        var interval = options.interval || 1000
        var callback = options.callback
        if (!src) {
            return
        }
        var count = 0
        var soundInst = initSoundInst(src, function () {
            count++
            if (count === repeat) {
                typeof callback === 'function' && callback()
            } else {
                __soundInstPlayingTimeHandler = setTimeout(function () {
                    soundInst.play()
                }, interval)
            }
        })
        soundInst.play()
    }

    // 停止播放声音
    function soundStop() {
        if (__soundInstPlayingTimeHandler) {
            clearTimeout(__soundInstPlayingTimeHandler)
        }
        if (__soundInstPlaying) {
            __soundInstPlaying.stop()
        }
    }

    // 顺序播放多个声音
    function soundPlaySequence(optionsQueue, callbackFinal) {
        !function executeFnQueue(optionsQueue, callbackFinal) {
            var options = optionsQueue.shift()
            var delay = options.delay || 0
            options.callback = optionsQueue.length
                ? function () {
                    __soundInstPlayingTimeHandler = setTimeout(function () {
                        executeFnQueue(optionsQueue)
                    }, delay)
                }
                : callbackFinal
            window.XXG.BusinessCommon.soundPlay(options)
        }(optionsQueue, callbackFinal)
    }

    function initSoundInst(src, callback) {
        var soundFile = src.join(',')
        var soundInst = __soundInstMap[soundFile]
        if (!soundInst) {
            var inst = new Howl({
                src: src,
                volume: 1,
                loop: false,
                preload: true,
                autoplay: false,
                mute: false
            })

            function onEnd() {
                var callback
                if (__soundInstPlaying) {
                    __soundInstPlaying.inst.off('end', onEnd)
                    callback = __soundInstPlaying.onEnd
                }
                __soundInstPlaying = null
                typeof callback === 'function' && callback()
            }

            function play() {
                var me = this
                me.inst.on('end', onEnd)
                me.inst.play()
                __soundInstPlaying = this
            }

            function stop() {
                var me = this
                var vol = me.inst.volume()
                me.inst.once('fade', function () {
                    __soundInstPlaying = null
                    me.inst.stop()
                    me.inst.volume(vol)
                })
                me.inst.fade(vol, 0, 100)
                me.inst.off('end', onEnd)
            }

            soundInst = __soundInstMap[soundFile] = {
                inst: inst,
                play: play,
                stop: stop,
                onEnd: callback
            }
        }
        soundInst.onEnd = callback

        return soundInst
    }

}()

