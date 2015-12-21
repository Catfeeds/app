angular.module('gugecc.services', ['ngResource'])
.constant('urls', {
    'api' : 'http://cloudenergy.me',
    'devApi' : '',
    'debug' : !Boolean(window.cordova)
})
.service('$api', ['$resource', 'urls', function ($resource, urls) {
    var fullUrl = function (url, bool) {
        var local = /(^http:\/\/)|(^https:\/\/)|(^\/)/.test(url);
        if (local) {
            return url;
        }else{
            return (!urls.debug ? urls.api : urls.devApi + '/api/' + url) + (bool ? '/:_api_action' : '')
        }
    };

	var _apis = {
		 auth: ['auth', {
	        login: { method: 'POST' },
	        logout: { method: 'POST' }
	    }],
        account : ['account', {
            info : { method : 'POST'}
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
	};

	this.up = function(data){
        Object.keys(auth_keys).map(function(item){
            $cookies.put(item, data[item], {
                expire : ''
            });
        });
	}

	this.down = function(){
        Object.keys(auth_keys).map(function(item){
            $cookies.remove(item);
        });
	}

	this.valid = function(){
		return (Boolean)($cookies.get('user') && $cookies.get('token'));
	}
}]);
