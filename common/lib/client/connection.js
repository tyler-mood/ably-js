var Connection = (function() {

	/* public constructor */
	function Connection(ably, options) {
		EventEmitter.call(this);
		this.ably = ably;
		this.connectionManager = new ConnectionManager(ably, options);
		this.state = this.connectionManager.state.state;
		this.key = undefined;
		this.id = undefined;
		this.serial = undefined;
		this.recoveryKey = undefined;
		this.errorReason = null;

		var self = this;
		this.connectionManager.on('connectionstate', function(stateChange) {
			var state = self.state = stateChange.current;
			Utils.nextTick(function() {
				self.emit(state, stateChange);
			});
		});
		this.connectionManager.on('error', function(error) {
			Utils.nextTick(function() {
				self.emit('error', error);
			});
		});
	}
	Utils.inherits(Connection, EventEmitter);

	Connection.prototype.whenState = function(state, listener) {
		EventEmitter.prototype.whenState.call(this, state, this.state, listener, new ConnectionStateChange(undefined, state));
	}

	Connection.prototype.connect = function() {
		Logger.logAction(Logger.LOG_MINOR, 'Connection.connect()', '');
		this.connectionManager.requestState({state: 'connecting'});
	};

	Connection.prototype.ping = function(callback) {
		Logger.logAction(Logger.LOG_MINOR, 'Connection.ping()', '');
		callback = callback || function() {};
		this.connectionManager.ping(null, callback);
	};

	Connection.prototype.close = function() {
		Logger.logAction(Logger.LOG_MINOR, 'Connection.close()', 'connectionKey = ' + this.key);
		this.connectionManager.requestState({state: 'closing'});
	};

	return Connection;
})();
