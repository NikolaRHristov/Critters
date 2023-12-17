var n = (t, r) => {
	const s = selectorParser(t);
	for (const a of s)
		if (a.length === 1) {
			const e = a[0];
			if (e.type === "attribute" && e.name === "class")
				return classCache.has(e.value);
			if (e.type === "attribute" && e.name === "id")
				return idCache.has(e.value);
		}
	return !!selectOne(t, r);
};
export { n as default };
