/* # jQuery.timeformat #
 * ## Version 1 ##
 * formats a time input on blur event
 * this is beta - logic could use a bit of reworking, 
 * and there is much room for efficiency tweaks.
 */
$(function () {
	var cnst = {
			events: {
				blur: "blur",
				change: "change"
			},
			regex: {
				"h:ia": /^([0-9]{1,2}):([0-9]{2})\s?([a-zA-Z]{1,2})/,
				"h:i": /(^[0-9]{1,2}):([0-9]{2})/,
				"hi": /^([0-9]{1,2})([0-9]{2})/,
				"ha": /^([0-9]{1,2})\s?([a-zA-Z]{1,2})/,
				"h": /^([0-9]{1,2})/
			},
			maxVals: {
				h: "24",
				i: "59"
			},
			minVals: {
				h: 1,
				i: 0
			},
			presets: {
				"now": function () {
					return (new Date).format("H:ia");
				},
				"random": randDate,
				"whatever": randDate,
				"dawn": "6:30am",
				"morning": "8:00am",
				"dusk": "5:00pm",
				"noon": "12:00pm",
				"afternoon": "2:00pm",
				"evening": "6:00pm",
				"night": "8:00pm",
				"late": "11:00pm"
			}
		},
		pluginName = "timeformat",
		Plugin;


	Plugin = function (el, opts) {
		/* constructor */
		this.$el = $(el);
		this.options = opts;

		this._name = pluginName;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			/* bind events */
			for (var event in cnst.events) {
				if (cnst.events.hasOwnProperty(event)) {
					var fn = cnst.events[event];

					this.$el.on(event, $.proxy(this[fn], this));
				}
			}
		},
		blur: function ( e ) {
			/* call format */
			this.date = this.format();
		},
		format: function () {
			/* format the time */
			var full = this.$el.val().trim() || "",
				time = {h: "0", i: "00", a: "am"},
				date = new Date(),
				newdate,
				split = [], f;

			if ( cnst.presets[full] ) {
				full = (typeof cnst.presets[full] == "function") ? cnst.presets[full]() : cnst.presets[full];
			}

			for (var format in cnst.regex) {
				if (cnst.regex.hasOwnProperty(format)) {
					var matches = full.match(cnst.regex[format]);

					if (matches && matches.length > split.length) {
						split = matches;
						f = format;
					}
				}
			}

			if (split.length > 0) {
				time = fromSplit(split, f);
				this.val = time.h + ":" + time.i + time.a;
				this.$el.val(this.val);
			} else {
				this.$el.val(this.val || "");
			}

			this.$el[0].time = time;

		},
		change: function () {
			if (this.$el.val() == "") {
				this.val = "";
			}
		}
	}

	function fromSplit(split, format) {
		var legends = {
				"h:ia": ["h", "i", "a"],
				"h:i": ["h", "i"],
				"hi": ["h", "i"],
				"ha": ["h", "a"],
				"h": ["h"]
			},
			legend = legends[format],
			list = split.slice(1),
			time = {h: 0, i: "00", a: "am"};

		console.log(legend, list, split);

		$(list).each(function (i, part) {
			console.log(arguments)
			var name = legend[i],
				max = cnst.maxVals[name],
				min = cnst.minVals[name],
				error = false;

			switch (name) {
				case "h":
				case "i":
					part = parseInt(part);
					if (isNaN(part)) {
						part = min;
					} else if (part > max || part < min) {
						part = (part > max) ? max : min;
					}
					part = (name == "i" && part < 10) ? "0" + part : part.toString();
					break;
				case "a":
					part = (!!~part.search("a")) ? "am" : "pm";
					break;
			}

			time[name] = part;
		});

		if (time.h > 12) {
			time.a = "pm";
			time.h = time.h-12;
		}
		time.H = time.a == "pm" ? time.h + 12 : time.h;

		return time;

	}

	/* just for fun */
	function randDate() {
		h = Math.floor(Math.random()*24).toString();
		i = Math.floor(Math.random()*59).toString();
		return h + i;
	}

	$.fn[pluginName] = function (opts) {

		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName);
				new Plugin( this, opts );
			}
		});
	}

})