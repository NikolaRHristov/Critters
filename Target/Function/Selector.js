var l = (s) => {
	if ((void 0)._other) {
		const [t, e] = splitFilter(
			(void 0).selectors,
			(void 0)._other.selectors,
			s,
		);
		((void 0).selectors = t), ((void 0)._other.selectors = e);
	} else (void 0).selectors = (void 0).selectors.filter(s);
};
export { l as default };
