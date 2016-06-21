'use strict';
app.service('notice', ['$interpolate', function ($interpolate) {
	var events ={
		"event:5300": "ntf_balanceinsufficient",
		"event:5301": "ntf_accountarrears",
		// "event:5302": "ntf_projectarrears",
		"event:5303": "ntf_arrearsstopservices",
		"event:5304": "ntf_arrearsresumeservices",
		// "event:5305": "ntf_accountnew",
		// "event:5306": "ntf_withdraw",
		"event:5307": "ntf_recharging",
		"event:5308": "ntf_appupgrade",
		// "event:5309": "ntf_pltupgrade",
		"event:5310": "ntf_remindrecharge",
		"event:5600": "ntf_userdailyreport",
		"event:5601": "ntf_usermonthlyreport",
		// "event:5602": "ntf_projectdailyreport",
		// "event:5603": "ntf_projectmonthlyreport",
		// "event:3400": "alt_deviceexception"
	},

	templates = {
		ntf_balanceinsufficient: {
			template: ""
		},
		ntf_balanceinsufficient: {
			template: ""
		},
		ntf_accountarrears: {
			template: ""
		},
		ntf_arrearsstopservices: {
			template: ""
		},
		ntf_arrearsresumeservices: {
			template: ""
		},
		ntf_recharging: {
			template: ""
		},
		ntf_appupgrade: {
			template: ""
		},
		ntf_remindrecharge: {
			template: ""
		},
		ntf_userdailyreport: {
			template: ""
		},
		ntf_usermonthlyreport: {
			template: ""
		}
	}

	this.parse (event, data) {
		var key = events['event:'+event.type],
			template = key && templates[key],
			exp = template && $interpolate(template);
		return exp(data);
	}
}]);
