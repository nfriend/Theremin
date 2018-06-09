(function () {
    "use strict";

    $(init);

    function init() {

        window.mode = "quantisized";

        $("body").keydown(function (e) {
            paused = true;
        });

        $(".range-selector").draggable({
            axis: "x",
            grid: [22.4375 * 7, 100],
            containment: ".mini-keyboard-container",
            stop: function () {
                recalculatefrequencyStepTranslation();
            },
            drag: function () {
                window.selectMainKeys();
            }
        });

        $(".keyboard-settings-container .expand-tab").click(function () {
            if ($(".keyboard-settings-container").hasClass("expanded")) {
                $(".setable-range-selector").css("display", "none");
            } else {
                setTimeout(function () {
                    $(".setable-range-selector").css("display", "inline");
                }, 500);
            }

            $(".keyboard-settings-container, .setable-range-selector-spacer").toggleClass("expanded");
        });

        $(".flip-trigger").click(function () {
            if (!$(".flip-card").hasClass("flipped")) {
                $(".front-container").css("-webkit-transform", "translateZ(-1px)");
            } else {
                setTimeout(function () {
                    $(".front-container").css("-webkit-transform", "");
                }, 1100);
            }

            $(".flip-card").toggleClass("flipped");

            if (window.mode === "quantisized") {
                window.mode = "continuous";
                setTimeout(computeContinuousRange, 1100);
            } else {
                window.mode = "quantisized";
            }
        });

        $(".setable-range-selector").resizable({
            grid: [22.4375, 100],
            axis: "x",
            handles: "w, e",
            containment: ".front-container .mini-keyboard-container",
            resize: function (event, ui) {
                var $this = $(this);
                var left = $this.position().left;
                var lastDifference = Number.MAX_VALUE;
                for (var i = 0; i < window.smallWhiteKeyPositions.length; i++) {
                    if (Math.abs(window.smallWhiteKeyPositions[i] + 9 - left) > lastDifference) {
                        $this.css("left", window.smallWhiteKeyPositions[i - 1] + 9 + "px");
                        break;
                    }
                    lastDifference = Math.abs(window.smallWhiteKeyPositions[i] - left);
                }

                var width = $this.width();
                $this.width(22.4375 * Math.round(width / 22.4375) - 2);

                if (Math.round(width / 22.4375) < 3) {
                    $(".setable-range-selector .drag-header").html("");
                } else if (Math.round(width / 22.4375) < 7) {
                    $(".setable-range-selector .drag-header").html("range");
                } else {
                    $(".setable-range-selector .drag-header").html("Select scale by range");
                }
            }
        }).draggable({
            axis: "x",
            grid: [22.4375, 100],
            containment: ".mini-keyboard-container"
        });

        $(".back-range-selector").resizable({
            grid: [22.4375, 100],
            axis: "x",
            handles: "w, e",
            containment: ".back-container .mini-keyboard-container",
            resize: function (event, ui) {
                var $this = $(this);
                var left = $this.position().left;
                var lastDifference = Number.MAX_VALUE;
                for (var i = 0; i < window.smallWhiteKeyPositions.length; i++) {
                    if (Math.abs(window.smallWhiteKeyPositions[i] + 9 - left) > lastDifference) {
                        $this.css("left", window.smallWhiteKeyPositions[i - 1] + 9 + "px");
                        break;
                    }
                    lastDifference = Math.abs(window.smallWhiteKeyPositions[i] - left);
                }

                var width = $this.width();
                $this.width(22.4375 * Math.round(width / 22.4375) - 2);

                if (Math.round(width / 22.4375) < 3) {
                    $(".back-range-selector .drag-header").html("");
                } else if (Math.round(width / 22.4375) < 7) {
                    $(".back-range-selector .drag-header").html("range");
                } else {
                    $(".back-range-selector .drag-header").html("Select range");
                }

                computeContinuousRange();
            }
        }).draggable({
            axis: "x",
            grid: [22.4375, 100],
            containment: ".back-container .mini-keyboard-container",
            drag: computeContinuousRange
        });

        $(".scale-note-select").change(function () {
            if ($(".scale-note-select option:selected").val() === "chromatic") {
                $(".scale-mode-select").prop("disabled", "disabled");
            } else {
                $(".scale-mode-select").prop("disabled", false);
            }
        })

        $(".select-by-scale-button").click(function () {
            var beginningKey = $(".scale-note-select option:selected").val();
            if (beginningKey === "chromatic") {
                window.selectScale(0, [true, true, true, true, true, true, true, true, true, true, true, true]);
                return;
            }

            if ($(".scale-note-select option:selected").val() !== "none" && $(".scale-mode-select option:selected").val() !== "none") {
                var pattern = [];
                switch ($(".scale-mode-select option:selected").val()) {
                    case "major":
                        pattern = [true, false, true, false, true, true, false, true, false, true, false, true];
                        break;
                    case "hminor":
                        pattern = [true, false, true, true, false, true, false, true, true, false, false, true];
                        break;
                    case "nminor":
                        pattern = [true, false, true, true, false, true, false, true, true, false, true, false];
                        break;
                    case "mminor":
                        pattern = [true, false, true, true, false, true, false, true, true, true, true, true];
                        break;
                    case "pentatonic":
                        pattern = [true, false, true, false, true, false, false, true, false, true, false, false];
                        break;
                    default:
                        pattern = [true, false, true, false, true, true, false, true, false, true, false, true];
                        break;
                }
                window.selectScale(parseInt(beginningKey, 10), pattern);
            }
        });

        $(".deselect-all-button").click(function () {
            $(".small-key").each(function () {
                $(this).removeClass("selected");
            });

            recalculatefrequencyStepTranslation();
            window.selectMainKeys(true);
        });

        $(".select-all-button").click(function () {
            $(".small-key").each(function () {
                if (!$(this).hasClass("selected") && $(this).css("visibility") !== "hidden") {
                    $(this).addClass("selected");
                }
            });

            recalculatefrequencyStepTranslation();
            window.selectMainKeys(true);
        });

        $("body").click(function (e) {
            var $target = $(e.target);
            if ($target.is(".front-container .key")) {
                var frequencyReference = parseFloat($target.attr("frequencyReference"), 10);
                var octaveReference = parseInt($target.attr("octaveReference"), 10) + 1;
                var octaveMultiplier = Math.floor($(".range-selector").position().left / (22.4375 * 7));
                var frequency = frequencyReference * Math.pow(2, (octaveReference + octaveMultiplier) - 1);

                if ($target.is(".front-container .selected")) {
                    $target.removeClass("selected");
                    $(".small-key[frequencyReference='" + frequency + "']").removeClass("selected");
                } else {
                    $target.addClass("selected");
                    $(".small-key[frequencyReference='" + frequency + "']").addClass("selected");
                }
                recalculatefrequencyStepTranslation();
            } else if ($target.is(".front-container .small-key")) {
                if ($target.is(".selected")) {
                    $target.removeClass("selected");
                } else {
                    $target.addClass("selected");
                }
                recalculatefrequencyStepTranslation();
                window.selectMainKeys(true);
            } else if ($target.is(".mode button")) {
                $target.addClass("btn-success");
                $(".mode button").not($target).removeClass("btn-success");
            }
        });

        $('#initialModal').modal({
            backdrop: 'static',
            keyboard: false
        });

        $('#show-demo-video').click(function () {
            window.location = 'http://youtu.be/J5wW4-yr6zY';
        });

        $('#let-me-play').click(function () {
            beginAudio();
        });

        generateKeyboard(3);

        var paused = false;

        function beginAudio() {

            var context = new AudioContext();
            var gainNodeMain = context.createGain();
            var gainNode1 = context.createGain();
            gainNode1.connect(gainNodeMain);
            gainNode1.gain.value = 1;
            var gainNode2 = context.createGain();
            gainNode2.connect(gainNodeMain);
            gainNode2.gain.value = 0;
            var gainNode3 = context.createGain();
            gainNode3.connect(gainNodeMain);
            gainNode3.gain.value = 0;
            var oscillators = getNewOscillators();
            var lastFrequency = 440;
            gainNodeMain.connect(context.destination);
            var vibratoAngle = 0;

            for (var i = 0; i < oscillators.length; i++) {
                oscillators[i].start(0);
            }

            var controllerOptions = {
                enableGestures: false
            }

            var json = JSON.stringify(Leap, function (key, value) {
                if (typeof value === 'function') {
                    return value.toString();
                } else {
                    return value;
                }
            });

            Leap.loop(controllerOptions, function (frame) {
                if (paused) {
                    if (oscillators !== null) {
                        for (var i = 0; i < oscillators.length; i++) {
                            oscillators[i].stop(0);
                        }

                    }
                    return;
                }

                if (frame.pointables.length === 0) {
                    if (oscillators) {
                        for (var i = 0; i < oscillators.length; i++) {
                            oscillators[i].stop(0);
                            oscillators[i].disconnect();
                        }

                        oscillators = null;
                    }
                    return;
                } else {
                    if (!oscillators) {
                        oscillators = getNewOscillators();
                        for (var i = 0; i < oscillators.length; i++) {
                            oscillators[i].start(0);
                        }
                    }
                }

                var hand1, hand2;
                var vibratoFactor = 0;
                var vibratoSpeed = 0;
                var vibrato = 0;

                if (frame.hands.length > 1) {
                    hand2 = frame.hands[1];
                    vibratoFactor = (Math.abs(hand2.palmPosition[1])) / 20;
                    vibratoSpeed = .95 - (Math.abs(hand2.palmPosition[2]) / 500);

                    vibrato = Math.sin(vibratoAngle);
                    vibratoAngle = (vibratoAngle + vibratoSpeed) % (Math.PI * 2);
                } else {

                }

                if (frame.hands.length > 0) {
                    hand1 = frame.hands[0];

                    var volume = hand1.palmPosition[2] / 300;
                    volume = volume > 1 ? 1 : volume;
                    volume = volume < 0 ? 0 : volume;
                    volume = 1 - volume;
                    gainNodeMain.gain.value = volume;

                    if (window.mode === "quantisized") {
                        var frequency = snapToScale(hand1.palmPosition[1]);
                    } else {
                        var frequency = translateToRange(hand1.palmPosition[1]);
                    }

                    var frequencyWithVibrato = frequency * ((100 + vibratoFactor * vibrato) / 100);

                    var toneDifference = hand1.palmNormal[0] / 15;
                    if (hand1.palmNormal >= 0) {
                        gainNode2.gain.value = 0;
                        gainNode1.gain.value = 1 - (toneDifference * 15);
                        gainNode3.gain.value = toneDifference;
                    } else {
                        gainNode3.gain.value = 0;
                        gainNode1.gain.value = 1 - (toneDifference * 10);
                        gainNode2.gain.value = toneDifference;
                    }


                    for (var i = 0; i < oscillators.length; i++) {
                        oscillators[i].frequency.value = frequencyWithVibrato;
                    }
                    lastFrequency = frequency;
                }
            });


            function getNewOscillators() {

                if (!lastFrequency) {
                    lastFrequency = 440;
                }

                var oscillator1 = context.createOscillator();
                oscillator1.connect(gainNode1);
                oscillator1.type = 0;
                oscillator1.frequency.value = lastFrequency;

                var oscillator2 = context.createOscillator();
                oscillator2.connect(gainNode2);
                oscillator2.type = 1;
                oscillator2.frequency.value = lastFrequency;

                var oscillator3 = context.createOscillator();
                oscillator3.connect(gainNode3);
                oscillator3.type = 2;
                oscillator3.frequency.value = lastFrequency;

                return [oscillator1, oscillator2, oscillator3];
            }

            function snapToScale(handPosition) {
                if (!window.frequencyStepTranslation || frequencyStepTranslation.length === 0) {
                    return handPosition * 2.5;
                }

                for (var i = 0; i < window.frequencyStepTranslation.length; i++) {
                    if (handPosition < window.frequencyStepTranslation[i][1]) {
                        return window.frequencyStepTranslation[i][0];
                    }
                }

                return window.frequencyStepTranslation[window.frequencyStepTranslation.length - 1][0];
            }

            function translateToRange(handPosition) {
                if (!window.continuousRange) {
                    return handPosition * 2.5;
                } else {
                    if (handPosition < 50) {
                        handPosition = 50;
                    }
                    if (handPosition > 500) {
                        handPosition = 500;
                    }


                    return ((handPosition - 50) / 450) * (window.continuousRange[1] - window.continuousRange[0]) + window.continuousRange[0];
                }

                return handPosition * 2.5;
            }

            window.selectMainKeys = function(overrideOptimization) {
                var octaveMultiplier = Math.floor($(".range-selector").position().left / (22.4375 * 7));
                if (!overrideOptimization) {
                    if (window.selectMainKeys.lastOctaveMultiplier !== undefined && window.selectMainKeys.lastOctaveMultiplier === octaveMultiplier) {
                        return;
                    }
                }

                window.selectMainKeys.lastOctaveMultiplier = octaveMultiplier;

                if (!window.frequencyStepTranslation || window.frequencyStepTranslation.length === 0) {
                    $(".key").removeClass("selected");
                    return;
                }

                $(".key").each(function () {
                    var $this = $(this);
                    var frequencyReference = parseFloat($this.attr("frequencyReference"), 10);
                    var octaveReference = parseInt($this.attr("octaveReference"), 10) + 1;
                    var frequency = frequencyReference * Math.pow(2, (octaveReference + octaveMultiplier) - 1);

                    var frequencyWasFound = false;
                    for (var i = 0; i < window.frequencyStepTranslation.length; i++) {
                        if (window.frequencyStepTranslation[i][0] === frequency) {
                            frequencyWasFound = true;
                            if (!$this.hasClass("selected")) {
                                $this.addClass("selected");
                            }
                        }
                    }

                    if (!frequencyWasFound) {
                        $this.removeClass("selected");
                    }
                });
            }

            window.selectScale = function(startingKey, pattern) {
                var keyPointer = (12 - startingKey) % 12;
                var whiteKeyToggle = true;
                var whiteIndex = 1;
                var blackIndex = 1;

                var startIndex = Math.round($(".setable-range-selector").position().left / 22.4375);
                var distance = Math.round($(".setable-range-selector").width() / 22.4375);

                if ($(".setable-range-selector").css("display") === "none") {
                    startIndex = 0;
                    distance = 1000;
                }

                for (var i = 0; i < 99; i++) {
                    if (whiteKeyToggle) {
                        var $this = $(".small-white-key-container .small-white-key:nth-child(" + whiteIndex + ")");
                        if (whiteIndex > startIndex + distance) {
                            $this.removeClass("selected");
                            keyPointer = (keyPointer + 1) % 12;
                            whiteIndex++;
                            whiteKeyToggle = !whiteKeyToggle;
                            continue;
                        }
                        if (whiteIndex > startIndex) {
                            if (pattern[keyPointer]) {
                                if (!$this.hasClass("selected")) {
                                    $this.addClass("selected");
                                }
                            } else {
                                $this.removeClass("selected");
                            }
                        } else {
                            $this.removeClass("selected");
                        }
                        keyPointer = (keyPointer + 1) % 12;
                        whiteIndex++;
                    } else {
                        var $this = $(".small-black-key-container .small-black-key:nth-child(" + blackIndex + ")");
                        if ($this.css("visibility") !== "hidden") {
                            if (whiteIndex > startIndex + distance) {
                                $this.removeClass("selected");
                                keyPointer = (keyPointer + 1) % 12;
                                blackIndex++;
                                whiteKeyToggle = !whiteKeyToggle;
                                continue;
                            }
                            if (whiteIndex > startIndex + 1) {
                                if (pattern[keyPointer]) {
                                    if (!$this.hasClass("selected")) {
                                        $this.addClass("selected");
                                    }
                                } else {
                                    $this.removeClass("selected");
                                }
                            } else {
                                $this.removeClass("selected");
                            }
                            keyPointer = (keyPointer + 1) % 12;
                        }
                        blackIndex++;
                    }

                    whiteKeyToggle = !whiteKeyToggle;
                }

                recalculatefrequencyStepTranslation();
                window.selectMainKeys(true);
            }
        }

        function recalculatefrequencyStepTranslation() {
            window.frequencyStepTranslation = [];

            var selectedFrequencies = [];

            $(".small-key").each(function (index) {
                var $this = $(this);
                if ($this.is(".selected")) {
                    selectedFrequencies.push(parseFloat($this.attr("frequencyReference"), 10));
                }
            });

            selectedFrequencies.sort(function (a, b) {
                return a - b;
            });

            var low = 50;
            var high = 500;
            for (var i = 0; i < selectedFrequencies.length; i++) {
                window.frequencyStepTranslation.push([selectedFrequencies[i], ((high - low) / selectedFrequencies.length) * (i + 1) + low]);
            }
        }

        function generateKeyboard(octaveCount) {
            $(".white-key-container, .black-key-container, .mini-keyboard-container, .setable-range-selector-spacer").css({
                width: octaveCount * 374 + "px",
                marginLeft: (octaveCount * -374) / 2 + "px"
            });

            $(".flip-trigger").css({
                marginLeft: (octaveCount * -374) / 2 - 32 + "px"
            });

            $(".flip-back-trigger").css({
                marginLeft: (octaveCount * -374) / 2 - 71 + "px"
            });

            $(".keyboard-settings-container").css({
                marginLeft: (octaveCount * -374) / 2 + 20 + "px"
            });

            var numberOfKeys = 7 * octaveCount + 1;

            var whiteNotes = [["C", 32.7032], ["D", 36.7081], ["E", 41.2034], ["F", 43.6535], ["G", 48.9994], ["A", 55.0000], ["B", 61.7354]];
            for (var i = 0; i < numberOfKeys; i++) {
                var octave = Math.floor(i / 7);
                octave = octave < 0 ? 0 : octave;
                $('.white-key-container').append("<div class='white-key key' octaveReference='" + octave + "' frequencyReference='" + whiteNotes[i % whiteNotes.length][1] + "'><p class='key-description'>" + whiteNotes[i % whiteNotes.length][0] + "</p></div>");
            }

            var blackNotes = [["C♯<br>D♭", 34.6478], ["D♯<br>E♭", 38.8909], null, ["F♯<br>G♭", 46.2493], ["G♯<br>A♭", 51.9131], ["A♯<br>B♭", 58.2705], null];
            for (var i = 0; i < numberOfKeys - 1; i++) {
                var octave = Math.floor(i / 7);
                //octave = octave < 0 ? 0 : octave;
                if (blackNotes[i % blackNotes.length] === null) {
                    $('.black-key-container').append("<div class='black-key key' octaveReference='' frequencyReference='' style='visibility:hidden'><p class='key-description'></p></div>");
                } else {
                    $('.black-key-container').append("<div class='black-key key' octaveReference='" + octave + "' frequencyReference='" + blackNotes[i % blackNotes.length][1] + "'><p class='key-description'>" + blackNotes[i % blackNotes.length][0] + "</p></div>");
                }
            }

            for (var i = 0; i < 50; i++) {
                $('.small-white-key-container').append("<div class='small-white-key small-key' frequencyReference='" + ((whiteNotes[i % whiteNotes.length][1]) * Math.pow(2, (Math.floor(i / 7)))) + "'></div>");
            }

            window.smallWhiteKeyPositions = [];
            for (var i = 1; i < 51; i++) {
                window.smallWhiteKeyPositions.push($(".small-white-key:nth-child(" + i + ")").position().left);
            }

            for (var i = 0; i < 49; i++) {
                if (i % 7 === 2 || i % 7 === 6) {
                    $('.small-black-key-container').append("<div class='small-black-key small-key' style='visibility: hidden' frequencyReference=''></div>");
                } else {
                    $('.small-black-key-container').append("<div class='small-black-key small-key' frequencyReference='" + ((blackNotes[i % blackNotes.length][1]) * Math.pow(2, (Math.floor(i / 7)))) + "'></div>");
                }
            }
        }

        function computeContinuousRange() {

            var startIndex = Math.round($(".back-range-selector").position().left / 22.4375);
            var distance = Math.round($(".back-range-selector").width() / 22.4375);

            var startFrequency = parseInt($(".back-container .small-white-key-container .small-white-key:nth-child(" + (startIndex + 1) + ")").attr("frequencyReference"), 10);
            var endFrequency = parseInt($(".back-container .small-white-key-container .small-white-key:nth-child(" + (startIndex + distance) + ")").attr("frequencyReference"), 10);

            window.continuousRange = [startFrequency, endFrequency];
        }

        function l(msg) {
            $("#log").html(msg + "\n")
        }

    }

})();

// from http://stackoverflow.com/a/2401861/1063392
navigator.sayswho = (function () {
    var ua = navigator.userAgent, tem,
    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR\/(\d+)/)
        if (tem != null) return 'Opera ' + tem[1];
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();

if (!(navigator.sayswho.indexOf('Chrome') != -1)) {
    window.location = 'unsupported-browser.html';
}