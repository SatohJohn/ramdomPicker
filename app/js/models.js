var randomPicker = (function(ns) {
	ns.model = {};

	ns.model.Division = function(data) {
		this.name = data.name;
		this.teams = data.teams.map(function(val) {
			return new ns.model.Team(val);
		});
	};
	ns.model.Team = function(data) {
		this.name = data.name;
		this.members = data.members.map(function(val) {
			return new ns.model.Member(val);
		});
	};
	ns.model.Member = function(data) {
		this.name = data.name;
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
