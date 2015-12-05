var randomPicker = (function(ns) {
	ns.model = {};

	ns.model.Division = function(data) {
		var self = this;
		this.name = data.name;
		this.primary = data.primary;
		this.determination = false;
		this.displayed = true;
		this.children = data.children.map(function(val) {
			val.parent = self;
			return new ns.model.Team(val);
		});
	};
	ns.model.Division.prototype.isCandidate = function() {
		// 誰か候補者だったら、候補である
		return _.some(this.children, function(v) { return v.isCandidate(); })
	};
	ns.model.Division.prototype.isDetected = function() {
		return this.determination;
	};
	ns.model.Division.prototype.toDetermination = function() {
		this.determination = true;
	};
	ns.model.Division.prototype.unsetDetermination = function() {
		this.determination = false;
	};
	ns.model.Division.prototype.canRemain = function() {
		return this.isDetected();
	};

	ns.model.Team = function(data) {
		var self = this;
		this.name = data.name;
		this.parent = data.parent;
		this.primary = data.primary;
		this.determination = false;
		this.children = data.children.map(function(val) {
			val.parent = self;
			return new ns.model.Member(val);
		});
	};
	ns.model.Team.prototype.isCandidate = function() {
		// 誰か候補者だったら、候補である
		return _.some(this.children, function(v) { return v.isCandidate(); })
	};
	ns.model.Team.prototype.isDetected = function() {
		return this.determination;
	};
	ns.model.Team.prototype.toDetermination = function() {
		this.determination = true;
	};
	ns.model.Team.prototype.unsetDetermination = function() {
		this.determination = false;
	};
	ns.model.Team.prototype.canRemain = function() {
		return this.parent.isDetected();
	};

	ns.model.Member = function(data) {
		this.name = data.name;
		this.parent = data.parent;
		this.primary = data.primary;
		this.determination = false;
		this.isExcluded = data.isExcluded == '○';
	};
	ns.model.Member.prototype.isCandidate = function() {
		return this.isExcluded == false;
	};
	ns.model.Member.prototype.isDetected = function() {
		return this.determination;
	};
	ns.model.Member.prototype.toDetermination = function() {
		this.determination = true;
	};
	ns.model.Member.prototype.unsetDetermination = function() {
		this.determination = false;
	};
	ns.model.Member.prototype.canRemain = function() {
		return this.parent.isDetected();
	};


	ns.model.Winner = function(data) {
		this.memberName = data.memberName;
		this.teamName = data.teamName;
		this.divisionName = data.divisionName;
	};

	return ns;
})(randomPicker || {});
