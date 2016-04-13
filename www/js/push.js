(function () {
	
	function init () {
		// 初始化极光推送 和 显示键盘 accessorybar
	    window.plugins.jPushPlugin.init();
	    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
	}

	document.addEventListener('deviceready', init);

	var onOpenNotification = function (event) {
        try {
            var alertContent;
            if (device.platform == "Android") {
                alertContent = window.plugins.jPushPlugin.openNotification.alert;
            } else {
                alertContent = event.aps.alert;
            }
        }
        catch (exception) {
            console.log("JPushPlugin:onOpenNotification" + exception);
        }
    };

    var onReceiveNotification = function (event) {
        try {
            var alertContent;
            if (device.platform == "Android") {
                alertContent = window.plugins.jPushPlugin.receiveNotification.alert;
            } else {
                alertContent = event.aps.alert;
            }
        }
        catch (exception) {
            console.log(exception)
        }
    };
    var onReceiveMessage = function (event) {
        try {

            var message;
            if (device.platform == "Android") {
                message = window.plugins.jPushPlugin.receiveMessage.message;
            } else {
                message = event.content;
            }
            //var extras = window.plugins.jPushPlugin.extras
        }
        catch (exception) {
            console.log("JPushPlugin:onReceiveMessage-->" + exception);
        }
    };

    app.service('push', ['cookies', '$q', '$timeout', '$state', 
    	function(cookies, $q, $timeout, $state){

    	function regTags (me) {
    		var tags = [];
			tags.push('user_'+me.uid);
			tags.push('project_'+me.project);
			window.plugins.jPushPlugin.setTags(tags);
			console.log('register tags: ', tags);
    	} 

    	this.register = function(me){
    		this.account = me;
	    	// 获取 registerId;
			document.addEventListener('deviceready', this.getID.bind(this));

		 //    document.addEventListener("jpush.receiveNotification", onReceiveNotification, false);
		 //    document.addEventListener("jpush.receiveMessage", onReceiveMessage, false);
    	}

    	this.getID = function getID () {
    		function onID (data){
				if (data.length == 0) {

				}
	    		regTags(this.account);
    		}
        	window.plugins.jPushPlugin.getRegistrationID(onID.bind(this));
    	}

    	this.onOpen = function(){
			document.addEventListener("jpush.openNotification", function(event){
				var msg = '', action = '';
				if (device.platform == "Android") {
	                msg = window.plugins.jPushPlugin.receiveNotification.alert;
	                action = window.plugins.jPushPlugin.receiveNotification.action;
	            } else {
	                msg = event.aps.alert;
    				action = event.action;
	            }

				console.log(event,
					msg,
					action,
					$state
				);
			}, false);
    	}

    	this.onReceive = function(){

    	}
    }]);
})(); 

