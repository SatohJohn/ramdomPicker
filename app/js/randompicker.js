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
			rouletteIds: [null, null, null],
			rouletteTime: m.prop(100),
			selected: [{
				name: '',
				teams: []
			}, {
				name: '',
				members: []
			}, {
				name: ''
			}]
		},
		controller: function() {
			ns.random.vm.init();
			var randomPicker = function(i) {
				var selected = ns.random.vm.selected;
				switch (i) {
					case 0:
						var result = getRandomInt(0, ns.random.vm.divisions.length - 1);
						selected[i] = ns.random.vm.divisions[Math.min(ns.random.vm.divisions.length - 1, result)];
						break;
					case 1:
						var result = getRandomInt(0, selected[i - 1].teams.length - 1);
						selected[i] = selected[i - 1].teams[Math.min(selected[i - 1].teams.length - 1, result)];
						break;
					case 2:
						var result = getRandomInt(0, selected[i - 1].members.length - 1);
						selected[i] = selected[i - 1].members[Math.min(selected[i - 1].members.length - 1, result)];
						break;
				}

				return new ns.model.Winner({
					memberName: selected[2].name,
					teamName: selected[1].name,
					divisionName: selected[0].name
				});
			};
			var stop = function(id) {
				if (id == null) {
					console.log('ルーレットは止まっている!（はず）');
					return;
				}
				clearInterval(id);
			};
			return {
				startRoulette: function() {
					var l = _.compact(ns.random.vm.rouletteIds);
					if (l.length != 0) {
						console.log('ルーレットはまだ動いている!（はず）');
						return;
					}
					ns.random.vm.rouletteIds = _.map(ns.random.vm.rouletteIds, function(v, i) {
						return setInterval(function() {
							m.startComputation();
							ns.random.vm.winner = randomPicker(i);
							m.endComputation();
						}, ns.random.vm.rouletteTime());
					});
				},
				stopRoulette: function() {
					var id = _.detect(ns.random.vm.rouletteIds, function(v) {
						return v != null;
					});
					console.log(id);
					stop(id);
					ns.random.vm.rouletteIds[_.indexOf(ns.random.vm.rouletteIds, id)] = null;
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
				m('div', {
					id: 'container'
				}, [
					m('div', {
						id: 'division'
					}, [
						m('p', {
						}, '部署名'),
						ctrl.getWinner().divisionName
					]),
					m('div', {
						id: 'team'
					}, [
						m('p', {
						}, 'チーム名'),
						ctrl.getWinner().teamName
					]),
					m('div', {
						id: 'member'
					}, [
						m('p', {
						}, '名前'),
						ctrl.getWinner().memberName
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