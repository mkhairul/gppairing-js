function Deferred() {
	// update 062115 for typeof
	if (typeof(Promise) != 'undefined' && Promise.defer) {
		//need import of Promise.jsm for example: Cu.import('resource:/gree/modules/Promise.jsm');
		return Promise.defer();
	} else if (typeof(PromiseUtils) != 'undefined'  && PromiseUtils.defer) {
		//need import of PromiseUtils.jsm for example: Cu.import('resource:/gree/modules/PromiseUtils.jsm');
		return PromiseUtils.defer();
	} else {
		/* A method to resolve the associated Promise with the value passed.
		 * If the promise is already settled it does nothing.
		 *
		 * @param {anything} value : This value is used to resolve the promise
		 * If the value is a Promise then the associated promise assumes the state
		 * of Promise passed as value.
		 */
		this.resolve = null;

		/* A method to reject the assocaited Promise with the value passed.
		 * If the promise is already settled it does nothing.
		 *
		 * @param {anything} reason: The reason for the rejection of the Promise.
		 * Generally its an Error object. If however a Promise is passed, then the Promise
		 * itself will be the reason for rejection no matter the state of the Promise.
		 */
		this.reject = null;

		/* A newly created Pomise object.
		 * Initially in pending state.
		 */
		this.promise = new Promise(function(resolve, reject) {
			this.resolve = resolve;
			this.reject = reject;
		}.bind(this));
		Object.freeze(this);
	}
}

var pairings = (function(){
	
	var url = '';
	var event = '';
	
	return {
		setUrl: function(str){
			url = str;
		},
		eventPairings: function(str){
			var deferred = new Deferred();
			var promise = deferred.promise;
			event = str;
			$.get(url + 'pairings/' + event, function(data){
				// Sort the data
				data.sort(function(a,b){
					if(parseInt(a.match(/\d+/)[0]) > parseInt(b.match(/\d+/)[0]))
					{
						return 1;
					}
					if(parseInt(b.match(/\d+/)[0]) > parseInt(a.match(/\d+/)[0]))
					{
						return -1;
					}
					return 0;
				})
			
				deferred.resolve(data);
			})
			.fail(function(){
				console.log('fail to retrieve pairings for event');
			});
			return promise;
		},
		setEvent: function(str){
			event = str;
			return this;
		},
		getPairing: function(str){
			var deferred = new Deferred();
			var promise = deferred.promise;
			$.get(url + 'pairings/file/' + event + '/' + str, function(data){
				deferred.resolve(data);
			})
			.fail(function(){
				console.log('fail to retrieve ' + str + ' pairings for event: ' + event);
			});
			return promise;
		},
		downloadPairing: function(str){
			var deferred = new Deferred();
			var promise = deferred.promise;
			$.get(url + 'pairings/file/download/' + event + '/' + str, function(data){
				deferred.resolve(data);
			})
			.fail(function(){
				console.log('fail to retrieve ' + str + ' pairings for event: ' + event);
			});
			return promise;
		},
		createHtmlList: function(selector, filenames){
			var self = this;
			var deferred = new Deferred();
			var promise = deferred.promise;
			var list = $('<ul/>');
			$(selector).html('LOADING..');
			
			$.each(filenames, function(index, file){
				var row = $('<li/>').html($('<a/>').attr('href', url + 'pairings/file/download/' + event + '/' + file).html(file));
				$(list).append(row);
			});
			$(selector).html(list);
			
			var generateLink = function(index){
				if(index === filenames.length){
					promise.resolve();
				}else{
					self.getPairing(filenames[index]).then(function(data){
						var row = $('<li/>').html($('<a/>').attr('href', data.link).html(filenames[index]));
						$(list).append(row);
						generateLink(index+1);
					});
				}
				return promise;
			};
			/*
			generateLink(0).then(function(){
				$(selector).html(list);
			});
			*/
		}
	}
}());