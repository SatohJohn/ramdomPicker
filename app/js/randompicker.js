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
			var r = {
				name: v.division,
				children: [{
					name: v.team,
					children: [{
						name: v.name,
						isExcluded: v.exclude,
						tableNumber: v.tableNumber
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
		}, result);
		return result;
	};

	ns.random = {
		effect: ns.effect,
		vm: {
			init: function() {
				m.request({
					method: 'GET',
					url: '/resource/entry.json'
				}).then(function(json) {
					var result = format(json);
					ns.random.vm.formattedResult = result.map(function(val) {
						return new ns.model.Division(val);
					});
					ns.random.vm.divisions = ns.random.vm.formattedResult;
					ns.random.vm.teams = _.flatten(_.pluck(ns.random.vm.divisions, 'children'));
					ns.random.vm.members = _.flatten(_.pluck(ns.random.vm.teams, 'children'));
					ns.random.vm.teams = _.map(ns.random.vm.members, function(v) { return v.parent; });
					ns.random.vm.divisions = _.map(ns.random.vm.members, function(v) { return v.parent.parent; });
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
			divisions: [],
			teams: [],
			members: [],
			_divisions: [],
			_teams: [],
			_members: [],
			detectedDivision: {},
			detectedTeam: {},
			detectedMember: {},
			stopAnimation: [false, false, false],
			tapCount: 3,
			isDetected: false,
			scrolling: false,
			cannotPushButton: false
		},
		controller: function() {
			ns.random.vm.init();
			var createDisplayedList = function(l) {
				return _.flatten([l, l, l, l, l, l]);
			};
			return {
				startRoulette: function() {
					ns.random.vm.stopAnimation = [false, false, false];
					ns.random.vm.tapCount = 3;

					ns.random.vm.isDetected = false;

					ns.random.vm.detectedDivision = {};
					ns.random.vm.detectedTeam = {};
					ns.random.vm.detectedMember = {};
					ns.random.vm.cannotPushButton = false;

					ns.random.vm.members = _.shuffle(ns.random.vm.members).filter(function(v) {
						v.unsetDetermination();
						return v.isCandidate();
					});
					ns.random.vm.teams = _.shuffle(ns.random.vm.teams).filter(function(v) {
						v.unsetDetermination();
						return v.isCandidate();
					});
					ns.random.vm.divisions = _.shuffle(ns.random.vm.divisions).filter(function(v) {
						v.unsetDetermination();
						return v.isCandidate();
					});

					ns.random.vm._divisions = createDisplayedList(ns.random.vm.divisions);
					ns.random.vm._teams = createDisplayedList(ns.random.vm.teams);
					ns.random.vm._members = createDisplayedList(ns.random.vm.members);

					// スロットの要素を一度作成しなければいけないので、一瞬待つ
					setTimeout(function() {
						$('div.content').toggleClass('detected', false);
						ns.effect.animateScroll($('#division > div'));
						ns.effect.animateScroll($('#team > div'));
						ns.effect.animateScroll($('#member > div'));
					}, 10);
					ns.random.vm.scrolling = true;
				},
				stopRoulette: function() {
					ns.random.vm.cannotPushButton = true;
					ns.random.vm.stopAnimation[0] = true;
					ns.random.vm.tapCount = 2;
				},
				isDetected: function() {
					return ns.random.vm.isDetected;
				},
				getWinner: function() {
					return ns.random.vm.winner;
				},
				winners: function() {
					return ns.random.vm.winners;
				},
				getDivisions: function() {
					return ns.random.vm._divisions;
				},
				getTeams: function() {
					return _.filter(ns.random.vm._teams, function(v) {
						if (ns.random.vm.detectedDivision.name == null) {
							return true;
						}
						return v.canRemain();
					});
				},
				getMembers: function() {
					return _.filter(ns.random.vm._members, function(v) {
						if (ns.random.vm.detectedTeam.name == null) {
							return true;
						}
						return v.canRemain();
					});
				},
				shiftStopMotionForDivision: function() {
					return ns.random.vm.stopAnimation[0];
				},
				shiftStopMotionForTeam: function() {
					return ns.random.vm.stopAnimation[1];
				},
				shiftStopMotionForMember: function() {
					return ns.random.vm.stopAnimation[2];
				},
				isFinished: function() {
					return ns.random.vm.isDetected;
				},
				isDetectedNumber: function(i) {
					return i == 2;
				},
				isPreDetectedNumber: function(i) {
					return i == 4;
				},
				isScrolling: function() {
					return ns.random.vm.scrolling;
				},
				cannotPushButton: function() {
					return ns.random.vm.cannotPushButton;
				}
			};
		},
		view: function(ctrl) {
			var constructDetectClass = function(i) {
				return (ctrl.isDetectedNumber(i) ? ' scroll-end' : '') + (ctrl.isPreDetectedNumber(i) ? ' pre-scroll-end' : '');
			};
			return [m('div', {
					style: ctrl.isFinished() ? 'display: none;' : '',
				}, [
					m('div', {
						id: 'container'
					}, [
						m('div', {
							id: 'division'
						}, [
							m('div', {
								className: 'wrap' + (ctrl.shiftStopMotionForDivision() ? '' : ' loop')
							}, ctrl.getDivisions().map(function(v, i) {
									return m('div', {
										className: 'content' + (' division_' + i) + constructDetectClass(i),
										key: i
									}, m('span', v.name));
								})),
						]),
						m('div', {
							id: 'team'
						}, [
							m('div', {
								className: 'wrap' + (ctrl.shiftStopMotionForTeam() ? '' : ' loop')
							}, ctrl.getTeams().map(function(v, i) {
									return m('div', {
										className: 'content' + constructDetectClass(i) + (' team_' + i),
										key: i
									}, m('span', v.name));
								})),
						]),
						m('div', {
							id: 'member'
						}, [
							m('div', {
								className: 'wrap' + (ctrl.shiftStopMotionForMember() ? '' : ' loop')
							}, ctrl.getMembers().map(function(v, i) {
									return m('div', {
										className: 'content' + constructDetectClass(i) + (' member_' + i),
										key: i
									}, m('span', v.name));
								}))
						])
					]),
					m('div', {
					}, [
						m('button', {
							className: 'btn btn-success btn-block btn-lg',
							disabled: ctrl.cannotPushButton() ? 'disabled' : '',
							onclick: function() {
								if (ctrl.cannotPushButton()) {
									return ;
								}
								if (ctrl.isScrolling()) {
									ctrl.stopRoulette();
								} else {
									ctrl.startRoulette();
								}
							},
						}, ctrl.isScrolling() ? 'ストップ' : 'ルーレットスタート'),
					])
				]),
				m('div', {
					style: ctrl.isFinished() ? '' : 'display: none;',
					className: 'detectedArea',
					onclick: ctrl.startRoulette,
					config: ns.effect.detect
				})
			];
		}
	};

	// スクロール完了時に呼ばれる
	ns.effect.scrollComplete = function($selected, isLast) {
		m.startComputation();
		var className = $selected.attr('class');
		var vm = ns.random.vm;
		switch(vm.tapCount) {
			case 2:
				vm.detectedDivision = vm._divisions[extractSelectedNumber('division', className)];
				vm.detectedDivision.toDetermination();
				// 次を止めるため
				setTimeout(function() {
					m.startComputation();
					ns.random.vm.stopAnimation[1] = true;
					ns.random.vm.tapCount = 1;
					m.endComputation();
				}, 1000);
				break;
			case 1:
				vm.detectedTeam = _.filter(vm._teams, function(v) {
					return v.canRemain();
				})[extractSelectedNumber('team', className)];
				vm.detectedTeam.toDetermination();
				// 次を止めるため
				setTimeout(function() {
					m.startComputation();
					ns.random.vm.stopAnimation[2] = true;
					ns.random.vm.tapCount = 0;
					m.endComputation();
				}, 1000);
				break;
			case 0:
				if (isLast == false && getRandomInt(0,100) % 2 == 1) {
					setTimeout(function() {
						m.startComputation();
						$selected.toggleClass('detected', false);
						ns.effect.animateScrollNext($('#member > div'));
						m.endComputation();
					}, 2000);
				} else {
					end($selected);
				}
				break;
		}
		m.endComputation();
	};

	var extractSelectedNumber = function(str, className) {
		var r = new RegExp(str + '_[0-9]+');
		return parseInt(_.first(r.exec(className)).substr((str + '_').length));
	};

	var end = function($selected) {
		var className = $selected.attr('class');
		var vm = ns.random.vm;
		vm.detectedMember = _.filter(vm._members, function(v) {
			return v.canRemain();
		})[extractSelectedNumber('member', className)];

		// 再度当選させないため、この人に印をつける
		vm.detectedMember.exclude();
		_.each(vm.members, function(v) {
			console.log(v);
			if (v.tableNumber == vm.detectedMember.tableNumber) {
				v.exclude();
			}
		});

		vm.detectedMember.toDetermination();
		// 次にすすめるために
		setTimeout(function() {
			m.startComputation();
			vm.isDetected = true;
			ns.random.vm.cannotPushButton = false;
			m.endComputation();
		}, 2000);
		ns.random.vm.scrolling = false;
	};

	return ns;

})(randomPicker || {});