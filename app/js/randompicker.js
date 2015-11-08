var randomPicker = (function(ns) {

	/**
	 * Returns a random integer between min (inclusive) and max (inclusive)
	 * Using Math.round() will give you a non-uniform distribution!
	 */
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var format = function(json) {
		var result = [];
		_.map(json, function(v) {
			if (v.attend == '×') {
				return ;
			}
			var r = {
				name: v.division,
				teams: [{
					name: v.team,
					members: [{
						name: v.name,
						isExcluded: v.exclude
					}]
				}]
			};
			var res1 = _.find(this, function(v) {
				return v.name == r.name;
			});
			if (res1 == null) {
				this.push(r);
				return ;
			}

			var res2 = _.find(res1.teams, function(v) {
				return v.name == _.first(r.teams).name;
			});
			if (res2 == null) {
				res1.teams.push(_.first(r.teams));
				return;
			}

			var res3 = _.find(res2.members, function(v) {
				return v.name == _.first(_.first(r.teams).members).name;
			});
			if (res3 == null) {
				res2.members.push(_.first(_.first(r.teams).members));
				return;
			}
			console.log('同じ事業部に同じチームの同じ名前の人いるで！');
		}, result);
		return result;
	}

	ns.random = {
		vm: {
			init: function() {
				m.request({
					method: 'GET',
					url: '/resource/entry.json'
				}).then(function(json) {
					var result = format(json);
					ns.random.vm.divisions = result.map(function(val) {
						return new ns.model.Division(val);
					});
				});
				ns.random.vm.winner = new ns.model.Winner({
					memberName: '',
					teamName: '',
					divisionName: ''
				});
				ns.random.vm.winners = [];
			},
			rouletteId: m.prop(null),
			rouletteTime: m.prop(100),
		},
		controller: function() {
			ns.random.vm.init();
			var randomPicker = function() {
				var divisionNum = getRandomInt(0, ns.random.vm.divisions.length - 1);
				var selectedDivision = ns.random.vm.divisions[Math.min(ns.random.vm.divisions.length - 1, divisionNum)];

				var teamNum = getRandomInt(0, selectedDivision.teams.length - 1);
				var selectedTeam = selectedDivision.teams[Math.min(selectedDivision.teams.length - 1, teamNum)];

				var memberNum = getRandomInt(0, selectedTeam.members.length - 1);
				var selectedMember = selectedTeam.members[Math.min(selectedTeam.members.length - 1, memberNum)];
				return new ns.model.Winner({
					memberName: selectedMember.name,
					teamName: selectedTeam.name,
					divisionName: selectedDivision.name
				});
			};
			return {
				startRoulette: function() {
					var id = ns.random.vm.rouletteId();
					if (id != null) {
						alert('ルーレットはもう動いている!（はず）');
						return;
					}
					id = setInterval(function() {
						m.startComputation();
//						ns.random.vm.winners = [
//							randomPicker(),
//							randomPicker(),
//							randomPicker()];
						ns.random.vm.winner = randomPicker();
						m.endComputation();
					}, ns.random.vm.rouletteTime());
					ns.random.vm.rouletteId(id);
				},
				stopRoulette: function() {
					var id = ns.random.vm.rouletteId();
					if (id == null) {
						alert('ルーレットは止まっている!（はず）');
						return;
					}
					clearInterval(id);
					ns.random.vm.rouletteId(null);
				},
				getWinner: function() {
					return ns.random.vm.winner;
				},
				winners: function() {
					return ns.random.vm.winners;
				}
			};
		},
		view: function(ctrl) {
			return m('div', {
			}, [
				m('h2', {
				}, 'タイトル'),
				m('table', {
				}, [
					m('thead', {}, [
						m('tr', {}, [
							m('th', {
							}, '部署名'),
							m('th', {
							}, 'チーム名'),
							m('th', {
							}, '名前')
						])
					]),
					m('tbody', {
					}, [
						ctrl.winners().map(function(winner) {
							return m('tr', {
							}, [
								m('td', {
								}, winner.divisionName),
								m('td', {
								}, winner.teamName),
								m('td', {
								}, winner.memberName)
							]);
						}),
						m('tr', {
						}, [
							m('td', {
							}, ctrl.getWinner().divisionName),
							m('td', {
							}, ctrl.getWinner().teamName),
							m('td', {
							}, ctrl.getWinner().memberName)
						])
					])
				]),
				m('div', {}, [
					m('button', {
						onclick: ctrl.startRoulette
					}, 'ルーレットスタート'),
					m('button', {
						onclick: ctrl.stopRoulette
					}, '止める'),
					m('input', {
						type: 'number',
						value: ns.random.vm.rouletteTime(),
						onchange: m.withAttr('value', ns.random.vm.rouletteTime),
						onkeyup: m.withAttr('value', ns.random.vm.rouletteTime)
					})
				])
			])
		}
	};

	return ns;

})(randomPicker || {});