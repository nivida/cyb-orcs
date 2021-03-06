define(['basic/button', 'basic/entity', 'basic/image', 'basic/morph', 'basic/rect', 'basic/text', 'config/fonts', 'core/graphic', 'definition/colors', 'definition/easing', 'geo/v2', 'geo/rect'],
	function(Button, Entity, ImageEntity, Morph, RectEntity, TextEntity, font, g, Colors, Easing, V2, Rect) {

	g.add('img/UI_tooltip.png');
	g.add('img/cancel.png');

	function Tooltip(parent, colors, buildmenu) {
		var width = 849;
		var height = 167;
		var close_b_size = 64;

		Entity.call(this, new V2(parent.size.x / 2 - width / 2, parent.size.y), new V2(width, height));

		this.extra_sp = 10;
		this.line_sp = 10;
		this.margin = 10;
		this.line_length = 90;

		var y = this.margin * 2;
		this.title = new TextEntity(new V2( this.margin, y ), '', font.large);
		y += font.large.size + this.extra_sp + this.line_sp;
		this.text  = new TextEntity(new V2( this.margin, y ), '', font.default);
		y += font.default.size + this.line_sp;
		this.text2 = new TextEntity(new V2( this.margin, y ), '', font.default);
		y += font.default.size + this.line_sp;
		this.text3 = new TextEntity(new V2( this.margin, y ), '', font.default);

		var self = this;
		var close = Button.create(new V2(this.size.x - close_b_size - this.margin, this.margin), function() {
			self.close();
		});
		//close.rect(close_b_size, close_b_size, new Colors(null, null, '#5c5c5c', '#5c5c5c'));
		close.img('img/cancel.png');

		this.add( new ImageEntity(Zero(), 'img/UI_tooltip.png') );
		this.add( this.title );
		this.add( this.text );
		this.add( this.text2 );
		this.add( this.text3 );
		this.add( close );

		this.clickable = false;
		this.buildmenu = buildmenu;
	}

	Tooltip.prototype = new Entity();

	Tooltip.prototype.moveIn = function(room) {
		this.add( new Morph( { position: { y: this.parent.size.y - this.size.y } }, 500, Easing.INOUTCUBIC, this.moveInFinished ) );
		this.title.text = room.name;
		if (room.desc.length > this.line_length) {
			for (var i = 0; i < this.line_length; i++) {
				if (room.desc.charAt(this.line_length - i) == ' ')
					break;
			}
			if (room.desc.length > this.line_length * 2) {
				for (var j = 0; j < this.line_length * 2; j++) {
					if (room.desc.charAt(this.line_length * 2 - j) == ' ')
						break;
				}
				this.text.text  = room.desc.substr(0, this.line_length - i);
				this.text2.text = room.desc.substr(this.line_length + 1 - i, this.line_length - j);
				this.text3.text = room.desc.substr(this.line_length * 2 + 1 - j, room.desc.length);
			} else {
				this.text.text  = room.desc.substr(0, this.line_length - i);
				this.text2.text = room.desc.substr(this.line_length + 1 - i, room.desc.length);
			}
		} else {
			this.text.text = room.desc;
		}
	};

	Tooltip.prototype.moveInFinished = function(self) {
		self.clickable = true;
	};

	Tooltip.prototype.canClose = function() {
		return this.clickable;
	}

	Tooltip.prototype.close = function() {
		this.clickable = false;

		this.buildmenu.abortBuild();
		this.add( new Morph( { position: { y: this.parent.size.y } }, 500, Easing.INOUTCUBIC, this.moveOutFinished ) );
	};

	Tooltip.prototype.moveOutFinished = function(self) {
		self.parent.remove( self );
		self.parent.add( self.buildmenu );
		self.buildmenu.moveIn();
		self.text.text = '';
		self.text2.text = '';
		self.text3.text = '';
	};

	return Tooltip;
});