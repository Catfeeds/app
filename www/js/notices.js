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
			title: "余额不足提醒",
			template: "截至{{time | timestamp:'YYYY年M月d日 HH:mm'}}你的账户当前可用余额已不足100元, 为了不影响你的正常运营，请及时充值。"
		},
		ntf_accountarrears: {
			title: "账户欠费提醒",
			template: "截至{{time | timestamp:'YYYY年M月d日 HH:mm'}}你的账户已欠费{{amount}}元, 为避免系统自动停止服务而影响你的正常运营，请及时充值。"
		},
		ntf_arrearsstopservices: {
			title: "欠费停止服务通知",
			template: "由于你的欠费金额超过{{amount}}元，系统已于{{time | timestamp:'YYYY年M月d日 HH:mm'}}自动停止服务,为了你的正常运营，请及时充值。"
		},
		ntf_arrearsresumeservices: {
			template: ""
		},
		ntf_recharging: {
			title: "充值成功提醒",
			template: "{{time | timestamp:'YYYY年M月d日 HH:mm'}}你的账户成功充值{{amount}}元，目前您的账户余额为{{balance}}元。"
		},
		ntf_appupgrade: {
			template: ""
		},
		ntf_remindrecharge: {
			title: "费用催缴",
			template: "物业人工提醒截至{{time | timestamp:'YYYY年M月d日 HH:mm'}}你的账户已欠费{{amount}}元，为避免系统自动停止服务而影响你的正常运营，请及时充值。"
		},
		ntf_userdailyreport: {
			title: "扣费成功提醒",
			template: "系统自动从的账户中扣除{{category | bill}}。截至{{time | timestamp:'YYYY年M月d日 HH:mm'}},你的账户余额为{{balance}}。"
		},
		ntf_usermonthlyreport: {
			title: "月度账单提醒",
			template: "{{time | timestamp 'YYYY年M月'}}你的消费总额为{{amount}}, 其中{{category | bill}}。截至{{time | timestamp:'YYYY年M月d日 HH:mm'}},你的账户余额为{{balance}}。"
		}
	}

	this.title = function(event){
		var key = events['event:'+event];
		return key && templates[key].title;
	}

	this.all = function () {
	   	var data = localStorage._cloud_msg || '[]';
        return JSON.parse(data);
	}

	this.save = function(data){
	   	var loc = localStorage._cloud_msg || '[]',
	   		events = JSON.parse(loc);

	   	events.unshift(JSON.parse(data.param));
	   	localStorage._cloud_msg = JSON.stringify(events);
	}

	this.parse = function (event, data) {
		var key = events['event:'+event],
			template = key && templates[key].template,
			exp = template && $interpolate(template);

		return {
			template: exp(data)
		};
	}
}]);
