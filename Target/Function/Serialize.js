var p = (c, f) => {
	let r = "";
	return (
		stringify(c, (t, e, i) => {
			if (!f.compress) {
				r += t;
				return;
			}
			if (e?.type !== "comment") {
				if (e?.type === "decl") {
					const s = e.prop + e.raws.between;
					r += t.replace(s, s.trim());
					return;
				}
				if (i === "start") {
					e.type === "rule" && e.selectors
						? (r += e.selectors.join(",") + "{")
						: (r += t.replace(/\s\{$/, "{"));
					return;
				}
				i === "end" &&
					t === "}" &&
					e?.raws?.semicolon &&
					(r = r.slice(0, -1)),
					(r += t.trim());
			}
		}),
		r
	);
};
export { p as default };
