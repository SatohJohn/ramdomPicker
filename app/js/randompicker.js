var randomPicker = (function(ns) {

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
				ns.random.vm.rouletteTime(ns.random.vm.initRouletteTime);
				ns.random.vm.detectionSequence = (function() {
					var sequenceNumber = 3;
					return {
						init: function() {
							sequenceNumber = 3;
						},
						next: function() {
							setTimeout(function() {
								m.startComputation();
								sequenceNumber--;
								m.endComputation();
							}, 1000);
						},
						isStopDivisionScroll: function() {
							return sequenceNumber <= 2;
						},
						isStopTeamScroll: function() {
							return sequenceNumber <= 1;
						},
						isStopMemberScroll: function() {
							return sequenceNumber <= 0;
						},
						stroke: function() {
							arguments[2 - sequenceNumber]();
						}
					};
				})();
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
			isDetected: false,
			scrolling: false,
			gameCount: 0,
			toFake: function() {
				if (ns.random.vm.gameCount - 1 < 0 || ns.random.vm.gameCount - 1 > 5) {
					console.log('game Count : ', ns.random.vm.gameCount);
					alert('ゲーム終了！');
					return ;
				}
				return arguments[ns.random.vm.gameCount - 1]();
			}
		},
		controller: function() {
			ns.random.vm.init();
			return {
				startRoulette: function() {
					restartRoulette();
				},
				isDetected: function() {
					return ns.random.vm.isDetected;
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
					return ns.random.vm.detectionSequence.isStopDivisionScroll();
				},
				shiftStopMotionForTeam: function() {
					return ns.random.vm.detectionSequence.isStopTeamScroll();
				},
				shiftStopMotionForMember: function() {
					return ns.random.vm.detectionSequence.isStopMemberScroll();
				},
				isFinished: function() {
					return ns.random.vm.isDetected;
				},
				isDetectedNumber: function(i) {
					return ns.random.vm.toFake(
						function() { return i == 2; },
						function() { return i == 2; },
						function() { return i == 2; },
						function() { return i == 2; },
						function() { return i == 2; },
						function() { return i == 2; }
					);
				},
				isDetectedNumberToFake: function(i) {
					return ns.random.vm.toFake(
						function() { return false; },
						function() { return false; },
						function() { return i == 3; },
						function() { return i == 5; },
						function() { return false; },
						function() { return i == 4; }
					);
				},
				isScrolling: function() {
					return ns.random.vm.scrolling;
				},
				stopRoulette: function() {}
			};
		},
		view: function(ctrl) {
			var constructDetectClass = function(i) {
				return (ctrl.isDetectedNumber(i) ? ' scroll-end' : '') + (ctrl.isDetectedNumberToFake(i) ? ' pre-scroll-end' : '');
			};
			var createContent = function(v, name, i) {
				return m('div', {
					className: 'content' + constructDetectClass(i) + (' ' + name + '_' + i),
					key: i
				}, m('span', v.name));
			};
			return [m('div', {
					style: ctrl.isFinished() ? 'display: none;' : '',
					onclick: ctrl.isScrolling() ? ctrl.stopRoulette : ctrl.startRoulette
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
									return createContent(v, 'division', i);
								})),
						]),
						m('div', {
							id: 'team'
						}, [
							m('div', {
								className: 'wrap' + (ctrl.shiftStopMotionForTeam() ? '' : ' loop')
							}, ctrl.getTeams().map(function(v, i) {
									return createContent(v, 'team', i);
								})),
						]),
						m('div', {
							id: 'member'
						}, [
							m('div', {
								className: 'wrap' + (ctrl.shiftStopMotionForMember() ? '' : ' loop')
							}, ctrl.getMembers().map(function(v, i) {
									return createContent(v, 'member', i);
								}))
						])
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
		vm.detectionSequence.stroke(function() {
			vm.detectedDivision = vm._divisions[extractSelectedNumber('division', className)];
			vm.detectedDivision.toDetermination();
			ns.random.vm.detectionSequence.next();
		}, function() {
			vm.detectedTeam = _.filter(vm._teams, function(v) {
				return v.canRemain();
			})[extractSelectedNumber('team', className)];
			vm.detectedTeam.toDetermination();
			ns.random.vm.detectionSequence.next();
		}, function() {
			if (isLast == true) {
				end($selected);
			} else {
				extra($selected);
			}
		});
		m.endComputation();
	};
	
	
	// エクストラステージ
	var extra = function($selected) {
		ns.random.vm.toFake(
			function() { end($selected); }, function() { end($selected); },
			function() {
				// １個ずらし
				setTimeout(function() {
					$selected.toggleClass('detected', false);
					ns.effect.animateScrollTo($('#member > div'), '.pre-scroll-end');
				}, 2000);
			},
			function() {
				setTimeout(function() {
					$selected.toggleClass('detected', false);
					ns.effect.animateScrollTo($('#member > div'), '.pre-scroll-end');
				}, 2000);
			},
			function() {
				// もう一度回す
				setTimeout(function() {
					m.startComputation();
					restartRoulette();
					m.endComputation();
				}, 5000);
			},
			function() {
				setTimeout(function() {
					m.startComputation();
					$selected.toggleClass('detected', false);
					ns.effect.animateScrollTo($('#member > div'), '.pre-scroll-end');
					m.endComputation();
				}, 2000);
			}
		);
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
			m.endComputation();
		}, 2000);
		ns.random.vm.scrolling = false;
	};
	
	var restartRoulette = function() {
		ns.random.vm.isDetected = false;

		ns.random.vm.detectedDivision = {};
		ns.random.vm.detectedTeam = {};
		ns.random.vm.detectedMember = {};

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

		var createDisplayedList = function(l) {
			return _.flatten([l, l, l, l, l, l]);
		};
		ns.random.vm._divisions = createDisplayedList(ns.random.vm.divisions);
		ns.random.vm._teams = createDisplayedList(ns.random.vm.teams);
		ns.random.vm._members = createDisplayedList(ns.random.vm.members);

		ns.random.vm.gameCount++;

		// スロットの要素を一度作成しなければいけないので、一瞬待つ
		setTimeout(function() {
			$('div.content').toggleClass('detected', false);
			ns.effect.animateScroll($('#division > div'));
			ns.effect.animateScroll($('#team > div'));
			ns.effect.animateScroll($('#member > div'));
		}, 10);
		ns.random.vm.detectionSequence.init();
		ns.random.vm.scrolling = true;
		
		setTimeout(ns.random.vm.detectionSequence.next, 3000);
	};

	return ns;

})(randomPicker || {});