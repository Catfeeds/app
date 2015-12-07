angular.module('gugecc.services', ['ngResource'])
.service('$api', ['$resource', function ($resource) {
    var fullUrl = function (url, bool) {
        return (/(^http:\/\/)|(^https:\/\/)|(^\/)/.test(url) ? url : (location.protocol + '//' + location.host + '/api/' + url)) + (bool ? '/:_api_action' : '')
    };

	var _apis = {
		 auth: ['auth', {
	        login: { method: 'POST' },
	        logout: { method: 'POST' }
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
	var keys = {
		user : '',
		token : ''
	};

	this.up = function(data){

	}

	this.down = function(){

	}

	this.valid = function(){
		return $cookies.get('user') && $cookies.get('token');
	}
}]);
