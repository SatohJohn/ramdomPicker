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
				children: [{
					name: v.team,
					children: [{
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

			var res2 = _.find(res1.children, function(v) {
				return v.name == _.first(r.children).name;
			});
			if (res2 == null) {
				res1.children.push(_.first(r.children));
				return;
			}

			var res3 = _.find(res2.children, function(v) {
				return v.name == _.first(_.first(r.children).children).name;
			});
			if (res3 == null) {
				res2.children.push(_.first(_.first(r.children).children));
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
				ns.random.vm.preWinner = new ns.model.Winner({
					memberName: '',
					teamName: '',
					divisionName: ''
				});
				ns.random.vm.rouletteTime(ns.random.vm.initRouletteTime);
			},
			rouletteTime: m.prop(0),
			initRouletteTime: 100,
			roulettePerTime: 300,
			selected: [{
				name: '',
				teams: []
			}, {
				name: '',
				members: []
			}, {
				name: ''
			}],
			tapCount: 0,
			isDetected: false
		},
		controller: function() {
			ns.random.vm.init();
			var randomPicker = function(i) {
				i = i || 3;
				var selected = ns.random.vm.selected;
				switch (i) {
					case 3:
						var result = getRandomInt(0, ns.random.vm.divisions.length - 1);
						selected[0] = ns.random.vm.divisions[Math.min(ns.random.vm.divisions.length - 1, result)];

						result = getRandomInt(0, selected[0].children.length - 1);
						selected[1] = selected[0].children[Math.min(selected[0].children.length - 1, result)];

						result = getRandomInt(0, selected[1].children.length - 1);
						selected[2] = selected[1].children[Math.min(selected[1].children.length - 1, result)];
						break;
					case 2:
						var result = getRandomInt(0, selected[0].children.length - 1);
						selected[1] = selected[0].children[Math.min(selected[0].children.length - 1, result)];

						result = getRandomInt(0, selected[1].children.length - 1);
						selected[2] = selected[1].children[Math.min(selected[1].children.length - 1, result)];
						break;
					case 1:
						var result = getRandomInt(0, selected[1].children.length - 1);
						selected[2] = selected[1].children[Math.min(selected[1].children.length - 1, result)];
						break;
					default:
						break;
				}

				return new ns.model.Winner({
					memberName: selected[2].name,
					teamName: selected[1].name,
					divisionName: selected[0].name
				});
			};

			var pick = function() {
				m.startComputation();
				ns.random.vm.winner = randomPicker(ns.random.vm.tapCount);
				m.endComputation();
			}

			return {
				startRoulette: function() {
					ns.random.vm.rouletteTime(ns.random.vm.initRouletteTime);
					ns.random.vm.isDetected = false;
					ns.random.vm.tapCount = 3;
					var f = function() {
						if (ns.random.vm.tapCount != 0) {
							setTimeout(function() {
								pick();
								f();
							}, ns.random.vm.rouletteTime());
						}
					};
					f();
				},
				stopRoulette: function() {
					if (ns.random.vm.tapCount != 0) {
						ns.random.vm.tapCount--;
						ns.random.vm.rouletteTime(ns.random.vm.roulettePerTime * (4 - ns.random.vm.tapCount));
						if (ns.random.vm.tapCount == 0) {
							// アニメーションさせる
							_.delay(function() {
								ns.random.vm.isDetected = true;
							}, 500);
//							ns.random.vm.randomPicker();
						}
					}
				},
				isDetected: function() {
					return ns.random.vm.isDetected;
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
				]),
				m('div', {
					className: ctrl.isDetected() == false ? 'detected' : '',
					config: detect
				})
			])
		}
	};

	var detect = function(element, isInitialized) {
		if (isInitialized) {
			return;
		}
		var paper = new Raphael(element);
		var c = paper.circle(50, 50, 40);
		c.attr({
			fill: '#f00',
			stroke: '#f00',
			strokeWidth: 0
		});
	};

	return ns;

})(randomPicker || {});