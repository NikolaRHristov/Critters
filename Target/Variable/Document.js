var t = {
	nodeType: {
		get() {
			return 9;
		},
	},
	contentType: {
		get() {
			return "text/html";
		},
	},
	nodeName: {
		get() {
			return "#document";
		},
	},
	documentElement: {
		get() {
			return this.children.find(
				(e) => String(e.tagName).toLowerCase() === "html",
			);
		},
	},
	head: {
		get() {
			return this.querySelector("head");
		},
	},
	body: {
		get() {
			return this.querySelector("body");
		},
	},
	createElement(e) {
		return new Element(e);
	},
	createTextNode(e) {
		return new Text(e);
	},
	exists(e) {
		return cachedQuerySelector(e, this);
	},
	querySelector(e) {
		return selectOne(e, this);
	},
	querySelectorAll(e) {
		return e === ":root" ? this : selectAll(e, this);
	},
};
export { t as default };
