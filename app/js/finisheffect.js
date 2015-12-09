var randomPicker = (function(ns) {

	var stage = null;
	var width = null;
	var height = null;

	/**
	 * Returns a random integer between min (inclusive) and max (inclusive)
	 * Using Math.round() will give you a non-uniform distribution!
	 */
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	ns.effect = {
		detect: function(element, isInitialized) {
			if (isInitialized) {
				return ;
			}
			width = $(document).width() -10;
			height = $(document).height() -10;
			var renderer = new PIXI.WebGLRenderer(width, height, {
				backgroundColor: 0xFFFFFF
			});
			$(element).append(renderer.view);
			stage = new PIXI.Container();
			PIXI.loader
				.add('a', '/img/a1.gif').add('b', '/img/b1.gif').add('c', '/img/c1.gif')
				.add('p1', '/img/p1.png').add('p2', '/img/p2.png').add('p3', '/img/p3.png').add('p4', '/img/p4.png').add('p5', '/img/p5.png').add('p6', '/img/p6.png').add('p7', '/img/p7.png')
				.load(function (loader, resources) {
				var paperNum = 700;
				var papers = [];
				for (var i = 0; i < paperNum; i++) {
					papers.push(new Paper(resources['p' + (i % 7 + 1)].texture.clone()));
				}
				var angels = [
					new Angel(resources.a.texture, 0),
					new Angel(resources.b.texture, 1),
					new Angel(resources.c.texture, 2)
				];

				var word = '';  // 文字列を指定
				var fontSize = 80;
				var margin = 60;
				var style = {font:'bold ' + fontSize + 'pt Arial', fill:'black'}; // 文字サイズや色など
				var texts = [
					new PIXI.Text(word, style),
					new PIXI.Text(word, style),
					new PIXI.Text(word, style),
					new PIXI.Text(word, style)
				];
				texts[0].position.x = texts[1].position.x = texts[2].position.x = texts[3].position.x = width / 3;
				texts[0].position.y = height / 2 - (fontSize + margin) * 2;
				texts[1].position.y = height / 2 - (fontSize + margin) * 1;
				texts[2].position.y = height / 2;
				texts[3].position.y = height / 2 + (fontSize + margin) * 1;
				stage.addChild(texts[0]);
				stage.addChild(texts[1]);
				stage.addChild(texts[2]);
				function animate() {
					requestAnimationFrame(animate);
					var time = new Date().getTime();
					_.each(angels, function (v) {
						v.move(time);
					});
					_.each(papers, function(v) {
						v.move(time);
					});

					texts[0].text = ns.random.vm.detectedDivision.name == null ? '' : ns.random.vm.detectedDivision.name;
					texts[1].text = ns.random.vm.detectedTeam.name == null ? '' : ns.random.vm.detectedTeam.name;
					texts[2].text = ns.random.vm.detectedMember.name == null ? '' : ns.random.vm.detectedMember.name + ' さん';
					texts[3].text = ns.random.vm.detectedMember.name == null ? '' : ns.random.vm.detectedMember.tableNumber + ' テーブル';
					renderer.render(stage);
				}
				animate();
			});
		},
		detectLine: function(element, isInitialized) {
			if (isInitialized) {
				return;
			}
			var $e = $(element);
			$e.velocity({opacity: 0}, {
				duration: 700,
				loop: true
			})
		},
		animateScroll: function($e) {
			var $e = $e;
			var scroll = function(isLast) {
				$e.scrollTop($e.children().length * 100);
				$e.find('.scroll-end').velocity('scroll', {
					container: $e,
					duration: isLast ? 2000 : 1500,
					axis: 'y',
					complete: function(elements) {
						if (isLast) {
							var $div = $e.find('.scroll-end + div');
							$div.toggleClass('detected', true);
							detectAnimate($div);
							ns.effect.scrollComplete($div, false);
							return ;
						}
						if ($e.hasClass('loop') == true) {
							scroll(false);
						} else if ($e.hasClass('loop') == false) {
							scroll(true);
						}
					},
					loop: false,
					easing: isLast ? 'ease-out' : 'linear'
				});
			};
			scroll(false);
		},
		animateScrollTo: function($e, selector) {
			var $e = $e;
			$e.find(selector).velocity('scroll', {
				container: $e,
				duration: 4000,
				axis: 'y',
				complete: function(elements) {
					var $div = $e.find(selector + ' + div');
					$div.toggleClass('detected', true);
					detectAnimate($div);
					ns.effect.scrollComplete($div, true);
				},
				loop: false,
				easing: 'linear'
			});
		},
		scrollComplete: function(elements) {
			console.log('scroll finish');
		}
	};
	
	var Angel = function(texture, pattern) {
		this.texture = new PIXI.Sprite(texture);
		var positions = [
			{x: 1000, y: 50},
			{x: 100, y: 400},
			{x: 1000, y: 600}
		];
		var self = this;
		this.texture.position.x = positions[pattern].x;
		this.texture.position.y = positions[pattern].y;
		this.pattern = pattern;
		stage.addChild(this.texture);
	};
	Angel.prototype.move = function(time) {
		var self = this;
		if (this.pattern % 3 == 0) {
			self.texture.position.x += Math.sin(time / 13 * (Math.PI / 180)) * 2;
			self.texture.position.y += Math.sin(time / 5 * (Math.PI / 180)) * 2;
		} else if (this.pattern % 3 == 1) {
			self.texture.position.x += Math.cos(time / 13 * (Math.PI / 180)) * 2;
			self.texture.position.y += Math.cos(time / 7 * (Math.PI / 180)) * 2;
		} else if (this.pattern % 3 == 2) {
			self.texture.position.x += Math.sin(time / 18 * (Math.PI / 180)) * 3;
			self.texture.position.y += Math.sin(time / 6 * (Math.PI / 180)) * 2;
		}
	};

	var Paper = function(texture, options) {
		this.texture = new PIXI.Sprite(texture);
		this.texture.position.x = getRandomInt(0, width);
		this.texture.position.y = getRandomInt(0, height);
		this.texture.scale.x = this.texture.scale.y = Math.random() / 4.0;
		this.texture.rotation = Math.sin(Math.random() * (Math.PI / 180)) / 10.0;
		this.velocity = this.createVelocity();
		stage.addChild(this.texture);
	};
	Paper.prototype.createVelocity = function() {
		return {
			x: (Math.random() - 0.5) * 0.5,
			y: (Math.random() + 1.0) * 2.0,
			rot: Math.sin((Math.PI / 180)) / (Math.random() * 10.0)
		}
	};
	Paper.prototype.move = function(time) {
		this.texture.position.x += Math.sin(time * (Math.PI / 30))/ 2.0 + this.velocity.x;
		this.texture.position.y += Math.sin(time * (Math.PI / 30))/ 2.0 + this.velocity.y;
		this.texture.rotation += this.velocity.rot;
		if (this.texture.position.y > height) {
			this.texture.position.x = getRandomInt(0, width);
			this.texture.position.y = -10;
			this.velocity = this.createVelocity();
		}
	}

	var detectAnimate = function($e) {
		$e.find('span')
			.toggleClass('animated flash', true)
			.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
				$e.find('span').toggleClass('animated flash', false);
			});
	}

	return ns;

})(randomPicker || {});
