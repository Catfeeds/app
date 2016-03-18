angular.module('gugecc.services', ['ngResource'])
.constant('urls', {
    'api' : 'http://42.120.42.45:8085/api/',
    'devApi' : '/api/',
    'debug' : !Boolean(window.cordova)
})
.service('$api', ['$resource', 'urls', function ($resource, urls) {
    var fullUrl = function (url, bool) {
        var local = /(^http:\/\/)|(^https:\/\/)|(^\/)/.test(url);
        if (local) {
            return url;
        }else{
            return (!urls.debug ? urls.api : urls.devApi) + url + (bool ? '/:_api_action': '')
        }
    };

	var _apis = {
		 auth: ['auth', {
	        login: { method: 'POST' },
	        logout: { method: 'POST' }
	    }],
        account : ['account', {
            info : { method : 'POST'},
        }],
        business : [ 'business', {
            "monthlyusage" : { method : 'POST'},
            "userinfo" : { method : 'POST'},
            "monthlyaccountelectricusage" : { method : 'POST'},
            "monthlysensordetail" : {method: "POST"},
            "energyconsumptioncost" : {method: 'POST'},
            "energytimeline" : {method: 'POST'},
            "sensorusage" : {method: 'POST'},
            "channeldetail" : {method: 'POST'},
            "recentchargelog": {method: 'POST'},
            "fundflow": {method: 'POST'}, 
            "timequantumstatistic" : {method: 'POST'}
        }],
        sensor : [ 'sensor', {
            "info" : { method : 'POST'}
        }],
        log: ['log', {
            "charge" : {method: 'POST'}
        }],
        payment: ['payment', {
            'charge': {method: 'POST'},
            'channelinfo': {method: 'POST'}
        }],
        control: ['control', {
            'send': {method: 'POST'}
        }],
        channelaccount : ['channelaccount', {
            'info' : {method: 'POST'}
        }]
	};

    angular.forEach(_apis, function (item, name) {
        if (item instanceof Array) {

            var url = item[0],
                actions = item[1],
                paramDefaults = item[2],
                options = item[3];

            if (url) {

                actions = angular.forEach(angular.extend({
                    get: {
                        method: 'GET'
                    },
                    list: {
                        method: 'GET'
                    },
                    search: {
                        method: 'GET'
                    },
                    set: {
                        method: 'POST'
                    },
                    create: {
                        method: 'POST'
                    },
                    update: {
                        method: 'POST'
                    },
                    remove: {
                        method: 'POST'
                    },
                    delete: {
                        method: 'POST'
                    }
                }, actions), function (action, name) {
                    action = action || {};
                    if (action.url) {
                        action.url = fullUrl(action.url)
                    }
                    action.method = action.method || 'GET';
                    action.params = angular.extend(action.url ? {} : {
                        _api_action: name
                    }, action.params);
                });

                this[name] = $resource(fullUrl(url, true), paramDefaults, actions, options);
            }
        }
    }, this);
}])
.service('cookies', ['$cookies', function ($cookies) {
	var auth_keys = {
		user : '',
		token : ''
	}, prefix = '_ec_';

    this.get = function(key){
        if (this.expired()) {
            return null;
        }
        return localStorage[prefix + key];
    }
    this.setExpire = function(date){
        localStorage[prefix+'expire'] = date;
    }

    this.expired = function(){
        var stamp = localStorage[prefix+'expire'];
        if (!stamp) {
            return true;
        }
        return moment(stamp, 'X').isBefore(moment());
    }

	this.up = function(data, remember){
        var date = moment().add(1, 'M');
        this.setExpire(date.unix());

        Object.keys(auth_keys).map(function(item){
            localStorage[prefix + item] = data[item];

            $cookies.put(item, data[item], {
                expires : date._d
            });
        });
	}

	this.down = function(){
        Object.keys(auth_keys).map(function(item){
            delete localStorage[prefix + item];
        });
	}

	this.valid = function(){
		return (Boolean)(this.get('user') && this.get('token'));
	}
}])
.provider('encrypt', [function () {
    this.$get = function(){
        return function(user, token, data){
            if(_.isEmpty(data)){
                return null;
            }

            var v = moment();
            var vCode = Hash(v.unix());

            data['v'] = v.unix();
            data['t'] = token;

            var plainText = PlainText(data, vCode);
            console.log('PlainText: '+plainText);

            var sign = Hash(plainText);
            data['sign'] = sign;
            data['p'] = user;
            data = _.omit(data, 't');

            return data;
        }
    }
   

    var PlainText = function(data, vCode){
        var keyArray = [];
        _.map(data, function(v, k){
            keyArray.push(k);
        });

        keyArray.sort();

        var plainText = '';
        var kvArray = [];
        _.each(keyArray, function (key) {
            kvArray.push( key+'='+encodeURI(data[key]) );
        });
        plainText = kvArray.toString();
        plainText = plainText.replace(/,/g, '');
        plainText = vCode + plainText + vCode;

        return plainText;
    }

    var Hash = function(v){
        var hash = hex_sha1(v.toString());
        return hash;
    }
}]).factory('utils', [function () {
    return {
        bar : function(data, type){
            var res = {
                series : [],
                labels: [],
                data: [],
                total : 0
            },
            method = type == 'DAY' ? 'hour' : 'date';

            _.each(data, function(v, k){
                _.each(v, function(data, label){
                    var index = 0, val = parseFloat(data.toFixed(3));
                    res.series.indexOf(label) == -1 ? res.series.push(label) : index = res.series.indexOf(label);
                    !res.data[index] ? res.data[index] = [] : 1;
                    res.data[index].push(val);
                    res.total += val;
                });
                res.labels.push(moment(k/1000, 'X')[method]());

            }.bind(this))
            res.total = parseFloat(res.total.toFixed(3));
            return res;
        },
        duty : function(data){
            var res = {
                series : ['上班', '下班'],
                labels: [],
                data: [[], []]
            };

            _.each(data, function(v, k){
                res.labels.push(moment(k/1000, 'X').date());
                res.data[1].push(v.onDuty);
                res.data[0].push(v.offDuty);
            })
            console.log(res);
            return res;
        }
    };
}])
.factory('datePickerSettings', [function(){
    return function datePickerSettings(){
        return {
            titleLabel: '选择',
            todayLabel: '今天',
            closeLabel: '关闭',
            setLabel: '选取',
            setButtonType : 'button-calm',
            todayButtonType : 'button-positive',
            closeButtonType : 'button-assertive',
            inputDate: new Date(),
            weekDaysList: ["日", "一", "二", "三", "四", "五", "六"],
            monthList: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
            templateType: 'modal',
            showTodayButton: 'true',
            modalHeaderColor: 'bar-positive', 
            modalFooterColor: 'bar-positive', 
            closeOnSelect: true,
            dateFormat: 'MM-yyyy'
        }
    };
}])
.factory('$weather', ['$http', function ($http) {
    var apiUrl = 'http://www.baidu.com',
        location = null;

    weather.locate();

    weather = {
        update : function(){

        },
        locate: function(){

        }
    }

    return weather;
}]);
