const f = async (n, e, s) => {
	if (e === null) return (await import("./Walk.js")).default(n, s);
	[n.nodes, e.nodes] = (await import("./Split.js")).default(
		n.nodes,
		e.nodes,
		async (t, i, o, l) => {
			const a = l[i];
			return (
				(await import("./Nested.js")).default(t) && f(t, a, s),
				(t._other = a),
				(t.filterSelectors = filterSelectors),
				s(t) !== !1
			);
		},
	);
};
var r = f;
export { f as _Function, r as default };
