(function () {
	function init () {
		// 初始化极光推送 和 显示键盘 accessorybar
	    window.plugins.jPushPlugin.init();
	    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

	    // 获取 registerId;
		getRegistrationID();
	}

	function getRegistrationID () {
        window.plugins.jPushPlugin.getRegistrationID(onGetRegistradionID);
	}

	var onGetRegistradionID = function (data) {
		try {
            console.log("JPushPlugin:registrationID is " + data);
            if (data.length == 0) {
                var t1 = window.setTimeout(getRegistrationID, 10000);
            }else{
            	// setup tag within tag
            	setupPushTags();
            }
        }
        catch (exception) {
            console.log(exception);
        }
	}

	function setupPushTags (){
		app.run(['$rootScope', function($rootScope){
			$rootScope.$watch('_me', function(n, o){
				var tags = [];
				tags.push('user:'+_me.uid);
				tags.push('project:'+_me.project);
				window.plugins.jPushPlugin.setTags(tags);
			})
		}])
	}

	document.addEventListener('deviceready', function() {
	    try {
	    	init();
	    } catch(e) {
	    	// statements
	    	console.log(e);
	    }
	}, false);
})(); 

