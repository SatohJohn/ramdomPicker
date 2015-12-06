var randomPicker = (function(ns) {

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
			var width = $(document).width() -10;
			var height = $(document).height() -10;
			var renderer = new PIXI.WebGLRenderer(width, height, {
				backgroundColor: 0xFFFFFF
			});
			$(element).append(renderer.view);
			var stage = new PIXI.Container();
			PIXI.loader.add('a', '/img/a1.gif').add('b', '/img/b1.gif').add('c', '/img/c1.gif').load(function (loader, resources) {
				var sprites = [
					new PIXI.Sprite(resources.a.texture),
					new PIXI.Sprite(resources.b.texture),
					new PIXI.Sprite(resources.c.texture)
				];
				sprites[0].position.x = 800;
				sprites[0].position.y = 50;
				sprites[1].position.x = 100;
				sprites[1].position.y = 400;
				sprites[2].position.x = 1000;
				sprites[2].position.y = 600;
				var word = '';  // 文字列を指定
				var fontSize = 60;
				var style = {font:'bold ' + fontSize + 'pt Arial', fill:'black'}; // 文字サイズや色など
				var texts = [
					new PIXI.Text(word, style),
					new PIXI.Text(word, style),
					new PIXI.Text(word, style)
				];
				texts[0].position.x = width / 4;
				texts[0].position.y = height / 2 - (fontSize + 40);
				texts[1].position.x = width / 4;
				texts[1].position.y = height / 2;
				texts[2].position.x = width / 4;
				texts[2].position.y = height / 2 + (fontSize + 40);
				stage.addChild(texts[0]);
				stage.addChild(texts[1]);
				stage.addChild(texts[2]);
				stage.addChild(sprites[0]);
				stage.addChild(sprites[1]);
				stage.addChild(sprites[2]);
				function animate() {
					requestAnimationFrame(animate);
					var time = new Date().getTime();
					sprites[0].position.x += Math.sin(time / 13 * (Math.PI / 180)) * 2;
					sprites[0].position.y += Math.sin(time / 5 * (Math.PI / 180)) * 2;

					sprites[1].position.x += Math.cos(time / 13 * (Math.PI / 180)) * 2;
					sprites[1].position.y += Math.cos(time / 7 * (Math.PI / 180)) * 2;

					sprites[2].position.x += Math.sin(time / 18 * (Math.PI / 180)) * 3;
					sprites[2].position.y += Math.sin(time / 6 * (Math.PI / 180)) * 2;

					texts[0].text = ns.random.vm.detectedDivision.name == null ? '' : ns.random.vm.detectedDivision.name;
					texts[1].text = ns.random.vm.detectedTeam.name == null ? '' : ns.random.vm.detectedTeam.name;
					texts[2].text = ns.random.vm.detectedMember.name == null ? '' : ns.random.vm.detectedMember.name + ' さん';
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
					duration: isLast ? 1000 : 600,
					axis: 'y',
					complete: function(elements) {
						if (isLast) {
							// 1/3でもう一回
//							if (getRandomInt(0, 2) % 2 == 1) {
//								ns.effect.scrollOneMore($e.find('.scroll-end + div'));
//							} else {
								$e.find('.scroll-end + div').toggleClass('detected', true);
								ns.effect.scrollComplete($e.find('.scroll-end + div'));
//							}
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
		scrollComplete: function(elements) {
			console.log('scroll finish');
		},
		scrollOneMore: function(elements) {
			console.log('scroll onemore');
		}
	}

	return ns;

})(randomPicker || {});
