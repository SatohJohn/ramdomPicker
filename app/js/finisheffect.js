var randomPicker = (function(ns) {

	var stage = null;

	ns.effect = {
		detect: function(element, isInitialized) {
			if (isInitialized) {
				return ;
			}
			var width = $(document).width() -10;
			var height = $(document).height() -10;
			var renderer = new PIXI.WebGLRenderer(width, height, {
				backgroundColor: 0xFFFFFF
			});
			$(element).append(renderer.view);
			stage = new PIXI.Container();
			PIXI.loader.add('a', '/img/a1.gif').add('b', '/img/b1.gif').add('c', '/img/c1.gif').load(function (loader, resources) {
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
							detectAnimate($div.find('span'));
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
					detectAnimate($div.find('span'));
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
	
	var detectAnimate = function($e) {
		$e.find('span')
			.toggleClass('animated flash', true)
			.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
				$e.find('span').toggleClass('animated flash', false);
			});
	}

	return ns;

})(randomPicker || {});
