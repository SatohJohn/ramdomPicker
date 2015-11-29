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
	};

	ns.random = {
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
					console.log(ns.random.vm.formattedResult);
					ns.random.vm.divisions = ns.random.vm.formattedResult;
					ns.random.vm.teams = _.flatten(_.pluck(ns.random.vm.divisions, 'children'));
					ns.random.vm.members = _.flatten(_.pluck(ns.random.vm.teams, 'children'));
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
			scroll: false
		},
		controller: function() {
			ns.random.vm.init();
			var createDisplayedList = function(l) {
				return _.flatten([l, l, l, l]);
			};
			return {
				startRoulette: function() {
					ns.random.vm.stopAnimation = [false, false, false];
					ns.random.vm.tapCount = 3;

					ns.random.vm.scroll = false;
					ns.random.vm.detectedDivision = {};
					ns.random.vm.detectedTeam = {};
					ns.random.vm.detectedMember = {};
					ns.random.vm.divisions = _.shuffle(ns.random.vm.divisions);
					ns.random.vm.teams = _.shuffle(ns.random.vm.teams);
					ns.random.vm.members = _.shuffle(ns.random.vm.members);
					ns.random.vm._divisions = createDisplayedList(ns.random.vm.divisions);
					ns.random.vm._teams = createDisplayedList(ns.random.vm.teams);
					ns.random.vm._members = createDisplayedList(ns.random.vm.members);
				},
				stopRoulette: function() {
					if (ns.random.vm.scroll == false && ns.random.vm.tapCount != 0) {
						ns.random.vm.stopAnimation[3 - ns.random.vm.tapCount] = true;
						ns.random.vm.tapCount--;
						ns.random.vm.scroll = true;
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
				},
				getDivisions: function() {
					return ns.random.vm._divisions;
				},
				getTeams: function() {
					return _.filter(ns.random.vm._teams, function(v) {
						if (ns.random.vm.detectedDivision.name == null) {
							return true;
						}
						return _.isEqual(v.parent.name, ns.random.vm.detectedDivision.name);
					});
				},
				getMembers: function() {
					return _.filter(ns.random.vm._members, function(v) {
						if (ns.random.vm.detectedTeam.name == null) {
							return true;
						}
						return _.isEqual(v.parent.parent.name, ns.random.vm.detectedDivision.name) && _.isEqual(v.parent.name, ns.random.vm.detectedTeam.name);
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
					return ns.random.vm.detectedDivision.name != null && ns.random.vm.detectedTeam.name != null && ns.random.vm.detectedMember.name != null && ns.random.vm.scroll == false;
				}
			};
		},
		view: function(ctrl) {
			return m('div', {
			}, [
				m('div', {
					id: 'container'
				}, [
					m('div', {
						className: 'detect-line',
						config: detectLine
					}),
					m('div', {
						id: 'division'
					}, [
						m('div', {
							className: 'wrap' + (ctrl.shiftStopMotionForDivision() ? '' : ' loop'),
							config: animateScroll
						}, ctrl.getDivisions().map(function(v, i) {
								return m('div', {
									className: 'content' + (i == 0 ? ' start' : '')
								}, m('span', v.name));
							})),
					]),
					m('div', {
						id: 'team'
					}, [
						m('div', {
							className: 'wrap' + (ctrl.shiftStopMotionForTeam() ? '' : ' loop'),
							config: animateScroll
						}, ctrl.getTeams().map(function(v, i) {
								return m('div', {
									className: 'content' + (i == 0 ? ' start' : '')
								}, m('span', v.name));
							})),
					]),
					m('div', {
						id: 'member'
					}, [
						m('div', {
							className: 'wrap' + (ctrl.shiftStopMotionForMember() ? '' : ' loop'),
							config: animateScroll
						}, ctrl.getMembers().map(function(v, i) {
								return m('div', {
									className: 'content' + (i == 0 ? ' start' : '')
								}, m('span', v.name));
							})),
					]),
				]),
				m('div', {}, [
					m('button', {
						onclick: ctrl.startRoulette
					}, 'ルーレットスタート'),
					m('button', {
						onclick: ctrl.stopRoulette
					}, '止める')
				]),
				m('div', {
					style: ctrl.isFinished() ? '' : 'display: none;',
					className: 'detected',
					config: detect
				})
			])
		}
	};

	var detect = function(element, isInitialized) {
		if (isInitialized) {
			return;
		}
		var renderer = new PIXI.WebGLRenderer($(element).width(), $(element).height(), {
			backgroundColor: 0xFFFFFF
		});
		$(element).append(renderer.view);
		var stage = new PIXI.Container();
		PIXI.loader.add('a', '/img/a1.gif').add('b', '/img/b1.gif').add('c', '/img/c1.gif').load(function (loader, resources) {
			var list = [
				new PIXI.Sprite(resources.a.texture),
				new PIXI.Sprite(resources.b.texture),
				new PIXI.Sprite(resources.c.texture)
			];
			list[0].position.x = 800;
			list[0].position.y = 50;
			list[1].position.x = 100;
			list[1].position.y = 400;
			list[2].position.x = 1000;
			list[2].position.y = 600;
			stage.addChild(list[0]);
			stage.addChild(list[1]);
			stage.addChild(list[2]);
			function animate() {
				requestAnimationFrame(animate);
				var time = new Date().getTime();
				list[0].position.x += Math.sin(time / 13 * (Math.PI / 180)) * 2;
				list[0].position.y += Math.sin(time / 5 * (Math.PI / 180)) * 2;

				list[1].position.x += Math.cos(time / 13 * (Math.PI / 180)) * 2;
				list[1].position.y += Math.cos(time / 5 * (Math.PI / 180)) * 2;

				list[2].position.x += Math.sin(time / 18 * (Math.PI / 180)) * 3;
				list[2].position.y += Math.sin(time / 5 * (Math.PI / 180)) * 2;
				renderer.render(stage);
			}
			animate();
		});
	};

	var detectLine = function(element, isInitialized) {
		if (isInitialized) {
			return;
		}
		var $e = $(element);
		$e.velocity({opacity: 0}, {
			duration: 700,
			loop: true
		})
	};

	var animateScroll = function(element, isInitialized) {
		var $e = $(element);
		if ($e.data('last') == true) {
			return ;
		}
		$e.data({
			'last': false
		});
		var scroll = function() {
			$e.scrollTop($e.children().length * 100);
			$e.find('.start').velocity('scroll', {
				container: $e,
				duration: 600,
				axis: 'y',
				complete: function(elements) {
					if ($e.hasClass('loop') == true) {
						scroll();
					} else if ($e.hasClass('loop') == false) {
						$e.data('last', true);
						last();
					}
				},
				easing: 'linear'
			});
		};
		var last = function() {
			$e.scrollTop($e.children().length * 100);
			$e.find('.start').velocity('scroll', {
				container: $e,
				duration: 1000,
				axis: 'y',
				complete: function(elements) {
					m.startComputation();
					switch(ns.random.vm.tapCount) {
						case 2:
							ns.random.vm.detectedDivision = ns.random.vm.divisions[1];
							break;
						case 1:
							ns.random.vm.detectedTeam = _.filter(ns.random.vm.teams, function(v) {
								return _.isEqual(v.parent.name, ns.random.vm.detectedDivision.name);
							})[1];
							break;
						case 0:
							ns.random.vm.detectedMember = _.filter(ns.random.vm.members, function(v) {
								return _.isEqual(v.parent.parent.name, ns.random.vm.detectedDivision.name) && _.isEqual(v.parent.name, ns.random.vm.detectedTeam.name);
							})[1];
							break;
					}
					ns.random.vm.scroll = false;
					m.endComputation();
				},
				loop: false,
				easing: 'ease-out'
			});
		}
		scroll();
	};

	return ns;

})(randomPicker || {});