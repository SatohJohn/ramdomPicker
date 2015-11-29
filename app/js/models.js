var randomPicker = (function(ns) {
	ns.model = {};

	ns.model.Division = function(data) {
		var self = this;
		this.name = data.name;
		this.primary = data.primary;
		this.children = data.children.map(function(val) {
			val.parent = self;
			return new ns.model.Team(val);
		});
	};
	ns.model.Team = function(data) {
		var self = this;
		this.name = data.name;
		this.parent = data.parent;
		this.primary = data.primary;
		this.children = data.children.map(function(val) {
			val.parent = self;
			return new ns.model.Member(val);
		});
	};
	ns.model.Member = function(data) {
		this.name = data.name;
		this.parent = data.parent;
		this.primary = data.primary;
		this.isAttend = data.isAttend;
		this.isExcluded = data.isExcluded;
	};
	ns.model.Winner = function(data) {
		this.memberName = data.memberName;
		this.teamName = data.teamName;
		this.divisionName = data.divisionName;
	};

	return ns;
})(randomPicker || {});
