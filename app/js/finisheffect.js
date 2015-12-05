var randomPicker = (function(ns) {

	ns.random = ns.random || {};

	ns.random.effect = {
		detect: function(element, isInitialized) {
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
							ns.random.effect.scrollComplete($e.find('.scroll-end + div'));
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
		}
	}

	return ns;

})(randomPicker || {});
