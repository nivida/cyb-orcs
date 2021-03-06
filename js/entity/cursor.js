define(['basic/entity', 'config/config', 'definition/layout', 'geo/v2'], function (Entity, config, Layout, V2) {
	var size = config.size;

	function Cursor(map) {
		Entity.call(this, map.position, map.size);
		this.layout = null;
		this.map = map;
		this.offset = Zero();
		this.touch = Zero();
	}

	Cursor.prototype = new Entity();

	Cursor.prototype.draw = function (ctx) {
		var self = this;
		if (self.layout) {
			var pos = self.map.getPos(self.map.relativeMouse()).add(this.offset);
			if (this.touch.x != 0 || this.touch.y != 0)
				pos = self.touch;
			var allred = !self.map.isConnected(pos, self.layout);
			self.layout.eachRel(pos, function (x, y) {
				ctx.fillStyle = self.map.get(x, y) || allred ? 'rgba(255,55,55,0.5)' : 'rgba(255,255,255,0.5)';
				ctx.fillRect(x * size.tile.x, y * size.tile.y, size.tile.x, size.tile.y);
			});
		}
	};

	Cursor.prototype.onClick = function (pos, touch) {
		if (this.layout) {
			var p = this.map.getPos(pos).add(this.offset);
			var self = this;
			if (touch) {
				if (!this.touch.equal(p)) {
					this.touch = p;
					return true;
				}
			}
			var possible = true;

			this.layout.eachRel(p, function (x, y) {
				if (self.map.get(x, y)) possible = false;
			});
			if (possible)
				possible = self.map.isConnected(p, this.layout);

			if (!possible) return true;
			if (!this.build_menu.allowBuild()) return true;
			this.map.addRoom(p, this.layout, this.type);
			this.layout = null;
			this.offset = Zero();
			this.touch = Zero();
			this.build_menu.built()
			return true;
		}
	};

	Cursor.prototype.setBuildMenu = function(menu) {
		this.build_menu = menu;
	};

	Cursor.prototype.selectRoom = function (layout, type) {
		this.layout = new Layout(layout);
		this.type = type;
		this.offset.x = layout.cursorOffset[0];
		this.offset.y = layout.cursorOffset[1];
		return this.layout;
	};

	Cursor.prototype.deselectRoom = function () {
		this.layout = null;
		this.type = null;
		this.offset = Zero();
		this.touch = Zero();
	};

	return Cursor;
});
