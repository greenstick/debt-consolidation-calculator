// The Closure Below Makes Sure That Our Interactive Is
// Protected From Any External JavaScript That May
// Have Polluted The Global Namespace. It Also Ensures
// Ours Does Not Pollute The Global Namespace Either

(function () {

	// Debouncing Function For Resizing - Makes Sure The Function
	// Passed to It Is Only Called Once Every Set Period
	var debounce = function (fn, delay, execute) {
		var timeout;
		return function () {
			var context = this, args = arguments;
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				timeout = null;
				if (!execute) fn.apply(context, args);
			}, delay);
			if (execute && !timeout) fn.apply(context, args);
		};
	};

	// Accepts Value, Decimal Place, and Whether '%' Should Be Appended or Not
	var percentify = function (val, dec, str) {
		var dec = dec || 0;
		return (val === null) ? null : (str === true) ? ((val * 100).toFixed(dec) + "%") : (val * 100).toFixed(dec);
	};

	// Remaps Given Value From One Range To A New Range
	var remapValue = function (x, l1, h1, l2, h2) {
		return l2 + (x - l1) * (h2 -l2) / (h1 - l1);
	};

	// Takes A Whole Number And Returns The Rounded Up Value
	var setRoundedMax = function (num) {
		var length 	= num.toString().length,
			integer = parseFloat(num).toFixed(0),
			mult 	= Math.pow(10, (length - 1)),
			round 	= Math.ceil(integer / mult) * mult;
		return round;
	};

/*

Interactive Constructor

This Constructor Function Sets Up The Interactive and 
Stores References to The HTML Elements We'll be Manipulating
Along With Other Vars For The Logic, Etc.
It's Instantiated Near The Bottom of This Script, Above
The Event Bindings.

*/

	var Interactive = function () {
		var I = this;
			I.currentHeight 	= 0,
			I.index 			= 0,
			I.wrapper 			= '#interactive-wrapper',
			I.next 				= '.next-button',
			I.prev 				= '.prev-button',
			I.container1 		= '.container1',
			I.container2 		= '.container2',
			I.container3 		= '.container3',
			I.slide 			= '.container1 .slide', // This Will Be A Sample Slide To Grab The Slide Dimensions From
			I.slides 			= '.container1, .container2, .container3',
			I.slideBody 		= '.cropbox, .container1 .slide, .container2 .slide, .container3 .titleslide, .container3 .dataslide',
			I.slideInput 		= '.inputs .input-body .input',
			I.graphElement 		= '.graph',
			I.toolTip 			= '.tool-tip',
			I.toolTipDiff 		= '.tool-tip .tool-tip-diff',
			I.toolTipInput 		= '.tool-tip .tool-tip-input',
			I.toolTipAvg 	 	= '.tool-tip .tool-tip-avg',
			I.numKeys 			= [48, 49, 50, 51, 52, 53, 54, 55, 56, 57], // An Array Of ASCII Number Key Codes
			I.editKeys 			= [8, 9, 37, 38, 39, 40, 127], // An Array Of ASCII Edit Key Codes (Arrows, Tabs, Backspace, Delete)
			I.valuesArray 		= ko.observableArray([]),
			I.average 			= {
				food 			: ko.observable(7044),
				health 			: ko.observable(3516),
				housing 		: ko.observable(17040),
				entertain 		: ko.observable(2592),
				clothing 		: ko.observable(1704),
				cash 			: ko.observable(1944),
				transport 		: ko.observable(9000),
				life 			: ko.observable(5568),
				total 			: ko.observable(48420)
			},
			I.ttDiff 			= ko.observable(''),
			I.ttInput 			= ko.observable(0),
			I.ttAvg 			= ko.observable(0),
			I.cssInput 			= ko.observable(0),
			I.cssAvg 			= ko.observable(0),

			// These Will Be Dynamically Generated in Our Init Function
			// And Will Hold Our Dimensions For Resizing
			I.height,
			I.width,
			I.ratio,

		// I'm Declaring The Knockout Observables And Computed
		// Observables Below. I'm Giving Each of Them an Initial
		// Value of 0 Because Otherwise The ko.computed Functions
		// Will Attempt to Evaluate A Bunch of 'undefined' Observables
		// And Get Angry. Calling Each Observable Function 
		// In The ko.computed i.e. I.groceries() Allows Us To Work
		// Directly With The Number In Question. To Make Sure We're
		// Actually Working With Numbers And Not Strings or Functions,
		// We Call The parseInt() Function On Each Observable.

		// All The Event Bindings For These Observables Are Going
		// To Be Done In The HTML Directly On The Elements In Question
		// Using Data Attributes.

			// Food
			I.groceries 		= ko.observable(0),
			I.restaurants 		= ko.observable(0),
			I.alcohol 			= ko.observable(0),
			I.foodTotal 		= ko.computed(function () {
				return parseInt(I.groceries()) + parseInt(I.restaurants()) + parseInt(I.alcohol());
			});

			// Housing
			I.rentMortgage 		= ko.observable(0),
			I.utilities 		= ko.observable(0),
			I.housingTotal 		= ko.computed(function () {
				return parseInt(I.rentMortgage()) + parseInt(I.utilities());
			});

			// Clothing
			I.clothes 			= ko.observable(0),
			I.shoes 			= ko.observable(0),
			I.clothingTotal 	= ko.computed(function () {
				return parseInt(I.clothes()) + parseInt(I.shoes());
			});

			// Transportation
			I.vehicle 			= ko.observable(0),
			I.vehicleInsurance 	= ko.observable(0),
			I.gas 				= ko.observable(0),
			I.publicTransport 	= ko.observable(0),
			I.transportTotal 	= ko.computed(function () {
				return parseInt(I.vehicle()) + parseInt(I.vehicleInsurance()) + parseInt(I.gas()) + parseInt(I.publicTransport());
			});

			// Healthcare
			I.healthInsurance 	= ko.observable(0),
			I.services 			= ko.observable(0),
			I.prescriptions 	= ko.observable(0),
			I.healthTotal 		= ko.computed(function () {
				return parseInt(I.healthInsurance()) + parseInt(I.services()) + parseInt(I.prescriptions());
			});

			// Entertainment
			I.events 			= ko.observable(0),
			I.pets 				= ko.observable(0),
			I.hobbies 			= ko.observable(0),
			I.entertainTotal 	= ko.computed(function () {
				return parseInt(I.events()) + parseInt(I.pets()) + parseInt(I.hobbies());
			});

			// Cash Contributions
			I.alimony 			= ko.observable(0),
			I.charitable 		= ko.observable(0),
			I.cashTotal 		= ko.computed(function () {
				return parseInt(I.alimony()) + parseInt(I.charitable());
			});

			// Insurance & Pension
			I.lifeInsurance 	= ko.observable(0),
			I.pension 			= ko.observable(0),
			I.lifeTotal 		= ko.computed(function () {
				return parseInt(I.lifeInsurance()) + parseInt(I.pension());
			});

	// Stepping Inputted Values Up To Annual Valus

			I.foodTotalAnn	 	= ko.computed(function () {
				var value = I.foodTotal() * 12;
				I.valuesArray.push(value);
				return value;
			});

			I.housingTotalAnn 	= ko.computed(function () {
				var value = I.housingTotal() * 12;
				I.valuesArray.push(value);
				return value;
			});

			I.clothingTotalAnn	= ko.computed(function () {
				var value = I.clothingTotal() * 12;
				I.valuesArray.push(value);
				return value;
			});

			I.transportTotalAnn = ko.computed(function () {
				var value = I.transportTotal() * 12;
				I.valuesArray.push(value);
				return value;
			});

			I.healthTotalAnn 	= ko.computed(function () {
				var value = I.healthTotal() * 12;
				I.valuesArray.push(value);
				return value;
			});

			I.entertainTotalAnn = ko.computed(function () {
				var value = I.entertainTotal() * 12;
				I.valuesArray.push(value);
				return value;
			});

			I.cashTotalAnn 		= ko.computed(function () {
				var value = I.cashTotal() * 12;
				I.valuesArray.push(value);
				return value;
			});

			I.lifeTotalAnn 		= ko.computed(function () {
				var value = I.lifeTotal() * 12;
				I.valuesArray.push(value);
				return value;
			});

	// Totals

			// Now Compute The Grand Total From The Subtotals
			I.totalExpenses 	= ko.computed(function () {
				var sum   = parseInt(I.foodTotal()) + parseInt(I.housingTotal()) + parseInt(I.clothingTotal()) + parseInt(I.transportTotal()) + parseInt(I.healthTotal()) + parseInt(I.entertainTotal()) + parseInt(I.cashTotal()) + parseInt(I.lifeTotal()),
					value = sum * 12;
				return value;
			});

			// Average Expenses
			I.avgExpenses 		= ko.observable(I.average.total());

	// The Below Calculations Are Performed To
	// Normalize The Individual User Inputted Values Across
	// A Static Range. Note That All The Following 
	// Values Will Be Computed Observables To Make
	// Sure That Updates To The Above Values Cascade 
	// Down The Logic Tree

			// Adds Average Values To Values Array Then
			// Returns The Highest Value Of All Inputs
			I.absoluteMax 		= ko.computed(function () {
				$.each(I.average, function (k, v) {
					I.valuesArray.push(v());
				});
				return Math.max.apply(null, I.valuesArray());
			});

			// Multiplies Absolute Max By 100
			I.absMaxPercent 	= ko.computed(function () {
				return percentify(I.absoluteMax(), 0, false);
			});

			// Sets The Absolute Max To A String And Grabs The
			// First Number In The String
			I.fString 			= ko.computed(function () {
				return String(I.absMaxPercent()).charAt(0);
			});

			// Converts Above First Number String Back To Number
			// Data Type
			I.fNumber 			= ko.computed(function () {
				return Number(I.fString());
			});

			// And Finally, Output The Rounded Maximum Value Of
			// The Domain, Which All The Values Will Be Mapped To
			I.roundedMax 		= ko.computed(function () {
				return (setRoundedMax(I.absMaxPercent()));
			});

	// Very Similar Calculations As Above Applied To The Total Values

			I.absoluteMaxTotal 	= ko.computed(function () {
				return Math.max(I.totalExpenses(), I.avgExpenses());
			});

			I.absMaxPerTotal 	= ko.computed(function () {
				return percentify(I.absoluteMaxTotal(), 0, false);
			});

			I.fStringTotal 		= ko.computed(function () {
				return String(I.absMaxPerTotal()).charAt(0);
			});

			I.fNumberTotal 		= ko.computed(function () {
				return Number(I.fStringTotal());
			});

			I.roundedMaxTotal 	= ko.computed(function () {
				return (setRoundedMax(I.absMaxPerTotal()));
			});

	// Now That We Have The Rounded Maximum Of All The 
	// Inputted Values, We Can Map Their Bar Lengths To
	// This Value
 			
 			// User Food Bar Length	
			I.foodTotalBar 		= ko.computed(function () {
				return parseFloat(remapValue((I.foodTotalAnn() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// Avg Food Bar Length
			I.foodAvgBar 		= ko.computed(function () {
				return parseFloat(remapValue((I.average.food() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// User Housing Bar Length
			I.housingTotalBar 	= ko.computed(function () {
				return parseFloat(remapValue((I.housingTotalAnn() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// Avg Housing Bar Length
			I.housingAvgBar 	= ko.computed(function () {
				return parseFloat(remapValue((I.average.housing() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// User Clothing Bar Length
			I.clothingTotalBar 	= ko.computed(function () {
				return parseFloat(remapValue((I.clothingTotalAnn() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// Avg Clothing Bar Length
			I.clothingAvgBar 	= ko.computed(function () {
				return parseFloat(remapValue((I.average.clothing() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// User Transport Bar Length
			I.transportTotalBar = ko.computed(function () {
				return parseFloat(remapValue((I.transportTotalAnn() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// Avg Transport Bar Length
			I.transportAvgBar 	= ko.computed(function () {
				return parseFloat(remapValue((I.average.transport() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// User Health Bar Length
			I.healthTotalBar	= ko.computed(function () {
				return parseFloat(remapValue((I.healthTotalAnn() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// Avg Health Bar Length
			I.healthAvgBar 		= ko.computed(function () {
				return parseFloat(remapValue((I.average.health() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// User Entertain Bar Total
			I.entertainTotalBar = ko.computed(function () {
				return parseFloat(remapValue((I.entertainTotalAnn() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// Avg Entertain Bar Total
			I.entertainAvgBar 	= ko.computed(function () {
				return parseFloat(remapValue((I.average.entertain() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// User Cash Bar Total
			I.cashTotalBar		= ko.computed(function () {
				return parseFloat(remapValue((I.cashTotalAnn() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// Avg Cash Bar Total
			I.cashAvgBar 		= ko.computed(function () {
				return parseFloat(remapValue((I.average.cash() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// User Life Bar Total
			I.lifeTotalBar		= ko.computed(function () {
				return parseFloat(remapValue((I.lifeTotalAnn() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

			// Avg Life Bar Total
			I.lifeAvgBar 		= ko.computed(function () {
				return parseFloat(remapValue((I.average.life() * 100), 0, I.roundedMax(), 0, 100).toFixed(2));
			});

		// Map Totals Bar Lengths

			// User Expenses Bar Total
			I.totalExpensesBar	= ko.computed(function () {
				return parseFloat(remapValue((I.totalExpenses() * 100), 0, I.roundedMaxTotal(), 0, 100).toFixed(2));
			});

			// Avg Expenses Bar Total
			I.avgExpensesBar 	= ko.computed(function () {
				return parseFloat(remapValue(I.avgExpenses() * 100, 0, I.roundedMaxTotal(), 0, 100).toFixed(2));
			});
	};

/*

Interactive Methods

The Following Are The Methods We'll Be Using to Do All The
Element Manipulations. Most Of These Will Be Triggered By 
Event Bindings.

An Important Thing to Know When Using Knockout & jQuery Together
Is That jQuery Event Bindings On An Object That Is Created By
Knockout Won't Work - Because They Are Dynamically Created And 
Don't Exist When jQuery's Event Bindings Are Initialized. Instead,
We'll Use Knockout's Event Bindings (Among A Variety of Other
Bindings) In the HTML.

These Methods Reference The Interactive Constructor Function Above
And Are Prototype Functions of The Interactive Object (Function). 
Thus, The Keyword 'This' Is Referencing The Interactive Object 
We Created Above. This Is Important Because, Once We Enter A
jQuery or Knockout Function, Referencing 'this' Will No Longer 
Reference The Interactive But The jQuery or Knockout Object Instead. 
To Get Around This, We Can Store A Reference To The Interactive Object;
In This Case I'm Using 'I' for Interactive.

*/

	// Because The Only Difference Between The Next Slide and 
	// Previous Slide Function Is Whether You Increment/Decrement
	// The currentHeight Variable, We Can Create One animateSlide
	// Function That Handles The Animation, and Let The Incrementing &
	// Decrementing Happen In The Event Bindings At The Bottom of This
	// Script Before They Call animateSlide()
	Interactive.prototype.animateSlide = function () {
		var I = this;
		$(I.container1).animate({top: I.currentHeight + "px"}, 500, false, "easeOut");
		$(I.container2).animate({top: I.currentHeight + "px"}, 700, false, "easeOut");
		$(I.container3).animate({top: I.currentHeight + "px"}, 700, false, "easeOut").promise().done(function () {
			$("#S-" + (I.index + 1) + " .input").first().focus();
			$("#S-" + (I.index + 1) + " .input").first().prev().addClass("selected");
		});
	};

	// Sets The Ratio As A Global In The Interactive Namespace,
	// This Ratio Will Be Used To Calculate The Height As We Resize
	// The Width.
	Interactive.prototype.setSlideDimensionsRatio = function () {
		var I  				= this;
			I.height 		= $(I.slide).height(),
			I.width 		= $(I.slide).width(),
			I.ratio 		= I.height / I.width;
	};

	// Calculates Slide Height Using Width & Ratio Then Applies Them.
	Interactive.prototype.setSlideHeight = function () {
		var I  				= this;
			I.width 		= $(I.slide).width();
			I.height 		= I.width * I.ratio;
			I.currentHeight = - I.height * I.index;
		// Apply Calculated Heights To Elements
		$(I.slideBody).height(I.height);
		$(I.slides).animate({top: I.currentHeight + "px"}, 0);
	};

	// Initialization Function - Basically A Macro That Will
	// Handle All The Setup When The Interactive Loads.
	Interactive.prototype.init = function () {
		this.setSlideDimensionsRatio();
		this.setSlideHeight();
	};

	// Next Slide
	Interactive.prototype.nextSlide = function () {
		var I = this;
		// Check If End Of Interactive Has Been Reached,
		// If Not, Decrement currentHeight Then Animate Slide
		if (I.index > 8) { $(I.next).fadeOut(); return; }
		I.index ++;
		$(I.next).fadeIn();
		$(I.prev).fadeIn();
		$(I.next).removeClass('dark');
		$(I.prev).removeClass('dark');
		I.currentHeight -= I.height;
		I.animateSlide();
		// Check Which Next Button Should Render
		if (I.index === 9) {
			$(I.next).addClass('dark');
			$(I.prev).addClass('dark')
		}
	};

	// Previous Slide
	Interactive.prototype.prevSlide = function () {
		var I = this;
		// Check If End Of Interactive Has Been Reached,
		// If Not, Increment currentHeight Then Animate Slide
		if (I.index < 1) { $(I.prev).fadeOut(); return; }
		I.index --;
		$(I.next).fadeIn();
		$(I.prev).fadeIn();
		$(I.next).removeClass('dark');
		$(I.prev).removeClass('dark');
		I.currentHeight += I.height;
		I.animateSlide();
		// Check Which Next Button Should Render
		if (I.index === 9) {
			$(I.next).addClass('dark');
			$(I.prev).addClass('dark')
		};
	};

	// Perform Calculations & Show Tool Tip
	Interactive.prototype.showToolTip = function (value1, value2, data, e) {
		var I = this,
			x = e.clientX - 24,
			y = e.clientY - 116,
			ratio = (value1 < value2) ? (- ((value1 / value2) - 1)) : (- (1 - (value1 / value2))),
			difference = (typeof ratio === 'string') ? "N/A" : (ratio * 100).toFixed(2);
			(value1 > value2) ? I.ttDiff('+' + numeral(difference).format('0,0') + '%') : (value1 < value2) ? I.ttDiff('-' + numeral(difference).format('0,0') + '%') : I.ttDiff(numeral(difference).format('0,0') + '%');
			if (value1 === 0) I.ttDiff("N/A");
			I.ttInput(numeral(value1).format('0,0'));
			I.ttAvg(numeral(value2).format('0,0'));
			I.cssInput(value1);
			I.cssAvg(value2);
		$(I.toolTip).css("top", y).css("left", x).stop().fadeIn();
	};

	// Hide Tool Tips
	Interactive.prototype.hideToolTip = function () {
		var I = this;
		$(I.toolTip).stop().fadeOut();
	};

/*

Instantiate Interactive Prototype

All The Code Below Will Reference This Specific Instance
Of the Interactive Object, Named 'interactive.'

*/

	var interactive = new Interactive();
		interactive.init();

/*

Non-Knockout Event Bindings

As Mentioned, These Event Bindings Reference Our Specific 'interactive' 
Instance of The Interactive Constructor we Instatiated Above.
In This Case, It Isn't Neccessary, but It Would Allow Us to 
Create More Interactives And Reference The Same Functions If We Had To
While Manipulating Them Independent of One Another. As A Personal 
Preference, I Also Like Breaking The Logic Up This Way Too--Main
Object, Methods, Instantiation of Instances, Event Bindings.

*/

	// Next Slide
	$(interactive.next).on("click", function () {
		interactive.nextSlide();
	});

	// Previous Slide
	$(interactive.prev).on("click", function () {
		interactive.prevSlide();
	});

	// Allows For Dynamic Resizing of Height
	$(window).on("resize", function (e) {
		debounce(interactive.setSlideHeight(), 250);
	});

	// Prevents Scrolling From Tabbing Of Interactive Body - KeyDown
	$(document).on("keydown", function (e) {
		if (($(e.target).hasClass('input') === false) || ($(e.target).hasClass('tab-end') === true)) {
			if (e.which === 9) {
				e.preventDefault();
				return false;
			}
		}
	});

	// Prevent Non-Numeric Input Into Calculator
	$(document).on("keydown", function (e) {
		var allowInput = false;
		// Is The Focused Element An Input?
		if (($(e.target).hasClass('input') === true)) {
			// Was A Number Key Pressed And Has The Input Limit Not Been Met?
			for (var i = 0; i < interactive.numKeys.length; i++) {
				if (e.which === interactive.numKeys[i] && e.target.innerHTML.length < 6) allowInput = true;
			}
			// Was An Edit Key Pressed
			for (var i = 0; i < interactive.editKeys.length; i++) {
				if (e.which === interactive.editKeys[i]) allowInput = true;
			}
			// If Above Conditions Are NOT Met, Prevent Key Input
			if (allowInput === false) return e.preventDefault();
			if ($(e.target).text() == 0) $(e.target).text('');
			$(e.target).removeClass('selected').addClass('active');
		}
	});

	// Prevents Scrolling From Tabbing Of Interactive Body - KeyUp
	$(document).on("keyup", function (e) {
		if (($(e.target).hasClass('input') === false) || ($(e.target).hasClass('tab-end') === true)) {
			if (e.which === 9) {
				e.preventDefault();
				return false;
			}
		}
	});

	// Make Cursor Blink On Input Focus
	$(interactive.slideInput).focus(function () {
		$(this).addClass('selected');
	});

	// Remove Cursor On Blur
	$(interactive.slideInput).blur(function () {
		if ($(this).text() == '') $(this).text(0);
		$(this).removeClass('selected active');
	});


/*

Knockout Custom Event Bindings

*/

	// Below Is A Custom Binding That Gives The Target Div
	// A contenteditable Attribute Then Detects Updates, etc.
	// This Is Required Because Values Inside Divs With A 
	// contenteditable Attribute Aren't Automatically Detected
	// By Knockout. In Addition To Helping Knockout Detect The
	// Value, I've Added In Unformat And Format Functions For 
	// Read And Write Operations, Respectively, That Are 
	// Performed On The Observable Value. This Takes Care Of The
	// Comma'd Number Errors We Were Getting Before. I Should 
	// Note That, For Speed, I'm Using Numeral.js, A Number
	// Formatting Library, To Handle The Numeric Formating.
	ko.bindingHandlers.editableText = {
	    init: function (element, valueAccessor) {
	    	$(element).attr('contenteditable', true);
	        $(element).on('blur', function() {
	            var observable = valueAccessor();
	            if ((typeof observable) == 'function') observable(numeral().unformat($(this).text()));
	        });
    	},
	    update: function (element, valueAccessor) {
	        var value = ko.utils.unwrapObservable(valueAccessor());
	        $(element).text(numeral(value).format('0,0'));
	    }
	};

	// This Is Essentially The Same Binding As Above. The Only 
	// Functionalities Missing Are The Read Functionality/Formating
	// And The contenteditable Attribute. 
	ko.bindingHandlers.commaNum = {
		init: function (element, valueAccessor) {
			value = ko.utils.unwrapObservable(valueAccessor());
			$(element).text(numeral(value).format('0,0'))
		},
		update: function (element, valueAccessor) {
			value = ko.utils.unwrapObservable(valueAccessor());
			$(element).text(numeral(value).format('0,0'))
		}
	};

/*

Apply Knockout Bindings

Usually I Apply Bindings On Initialization. I Ran Into An Issue With 
That Not Working Because The Above Custom Bindings Didn't Exist At 
That Point In The Script. So, In This Case, I'm Applying The KO
Bindings To The DOM At The Very End, Below. 

*/

		// Apply Knockout Bindings To interactive View Model & #interactive-wrapper
		// HTML Element
		ko.applyBindings(interactive, document.getElementById(interactive.wrapper));

}(jQuery, ko))