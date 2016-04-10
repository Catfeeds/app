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
            console.log("JPushPlugin:registrationID is " + data, data.length == 0);
            localStorage.appRegistered = true;
            app.setupPushTags();

            if (data.length == 0) {
                // var t1 = window.setTimeout(getRegistrationID, 10000);
            }
        }
        catch (exception) {
            console.log(exception);
        }
	}

	app.setupPushTags = function(){
		if (!localStorage.appRegistered || !localStorage.appLoaded ) {
			return;
		}
		if (!window.plugins && !window.plugins.jPushPlugin) {
			return;
		}

		var tags = [], me = app.setupPushTags._me;
		tags.push('user_'+me.uid);
		tags.push('project_'+me.project);
		window.plugins.jPushPlugin.setTags(tags);
		delete localStorage.appRegistered && delete localStorage.appLoaded ;
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

