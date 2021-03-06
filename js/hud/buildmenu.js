define(['basic/button', 'basic/entity', 'basic/image', 'basic/morph', 'basic/rect', 'config/screen', 'core/graphic', 'core/sound', 'definition/colors', 'definition/easing', 'definition/layout', 'geo/v2', 'geo/rect', 'hud/tooltip', 'basic/text', 'config/fonts'],
	function(Button, Entity, ImageEntity, Morph, RectEntity, screen, g, s, Colors, Easing, Layout, V2, Rect, Tooltip, TextEntity, font) {

	g.add('img/UI.png');
	for (var room in rooms) {
		g.add(rooms[room].pic);
	}
	s.add('snd/room.ogg');

	function getTotalPrice(layout, room) {
		var roomCosts = 0;

		layout.each(function(){
			roomCosts += rooms[room].cost;
		});

		return roomCosts;
	}

	function BuildMenu(parent, cursor, roomDefinitions, playScene) {
		this.cursor = cursor;
		this.b_size = 90;
		this.b_top = 59;
		this.b_left = 56
		this.b_spacing = 38;
		this.b_colors = new Colors('#3c3c3c', '#3c3c3c', '#9c9c9c', '#9c9c9c');
		this.roomDefinitions = roomDefinitions;
		this.playScene = playScene;

		var my_width = 935;
		var my_height = 179;
		var my_x = parent.size.x / 2 - my_width / 2;

		Entity.call(this, new V2(my_x, parent.size.y), new V2(my_width, my_height));
		this.clickable = false;

		// background
		this.add( new ImageEntity(Zero(), 'img/UI.png') );
		// icon
		//this.add( new ImageEntity(Zero(), 'img/hud/hammer.png') );

		// room shape preview
		this.layout = this.getRandomShape();

		var self = this;
		var i = 0;

		this.prices = {};

		for (var room in rooms)
			(function(room) {
				var room_def = rooms[room];
				if (room_def.nobuild) return;

				var button_x = self.b_left + (self.b_size + self.b_spacing) * i;
				var button = Button.create(new V2(button_x, self.b_top), function() {
					self.roomClicked(room);
				});
				button.img(room_def.pic);

				var actualRoomPrice = getTotalPrice(self.layout, room);
				var fontStyle = actualRoomPrice > self.playScene.money ? font.red : font.white;
				var text = new TextEntity(new V2(button_x, self.b_top), actualRoomPrice, fontStyle);

				self.prices[room] = text;

				self.add(button);
				self.add(text);
				i++;
			})(room);

		// building tooltip
		this.tooltip = new Tooltip(parent, new Colors('#9c9c9c', '#9c9c9c'), this);
	}

	BuildMenu.prototype = new Entity();

	BuildMenu.prototype.init = function() {
		this.add(new Morph( { position: { y: this.parent.size.y - this.size.y } }, 1800, Easing.INOUTCUBIC, this.moveInFinished ) );
	};

	BuildMenu.prototype.onUpdate = function(delta) {
		for(var r in this.prices)
			this.prices[r].font = this.prices[r].text > this.playScene.money ? font.red : font.white;
	};

	BuildMenu.prototype.postDraw = function(ctx) {
		var self = this;
		var pos = new V2(748, 64);

		var max_x = 0;
		var max_y = 0;
		this.layout.each(function(x,y) {
			if (x > max_x)
				max_x = x;
			if (y > max_y)
				max_y = y;
		});
		if (max_x == 0)
			pos.x += 40;
		if (max_x == 1)
			pos.x += 20;
		if (max_y == 0)
			pos.y += 20;
		this.layout.each(function(x,y){
				ctx.fillStyle = '#f6d51a';
				ctx.strokeStyle = '#000000';
				ctx.fillRect((pos.x + x*40)|0, (pos.y + y*40)|0, 40, 40);
				ctx.strokeRect((pos.x + x*40)|0, (pos.y + y*40)|0, 40, 40);
			});
	};

	BuildMenu.prototype.roomClicked = function(room) {
		if (!this.clickable) return;

		var actualRoomPrice = getTotalPrice(this.layout, room, this.roomDefinitions);
		if(actualRoomPrice <= this.playScene.money) {
			this.clickedRoom = rooms[room];
			this.add( new Morph( { position: { y: this.parent.size.y } }, 500, Easing.INOUTCUBIC, this.moveOutFinished ) );
			this.clickable = false;

			this.cursor.selectRoom(this.layout.shape, rooms[room]);
		}
	};

	BuildMenu.prototype.allowBuild = function() {
		if(!this.tooltip.canClose()) return false;
		return true;
	};

	BuildMenu.prototype.built = function() {
		this.tooltip.close()
		this.layout = this.getRandomShape();
		s.play('snd/room.ogg');
	};

	BuildMenu.prototype.abortBuild = function() {
		this.cursor.deselectRoom();
	};

	BuildMenu.prototype.getRandomShape = function() {
		var layout = new Layout(shapes[Math.floor(Math.random()*(shapes.length-1))]);

		for(var r in this.prices) {
			var price = getTotalPrice(layout, r);
			this.prices[r].text = price;
		}

		return layout;
	};

	BuildMenu.prototype.moveIn = function() {
		this.add( new Morph( { position: { y: this.parent.size.y - this.size.y } }, 500, Easing.INOUTCUBIC, this.moveInFinished ) );
	};

	BuildMenu.prototype.moveInFinished = function(self) {
		self.clickable = true;
	};

	BuildMenu.prototype.moveOutFinished = function(self) {
		self.parent.remove( self );
		self.parent.add( self.tooltip );
		self.tooltip.moveIn( self.clickedRoom );
	};

	return BuildMenu;
});
