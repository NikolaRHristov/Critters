var u = (n) => {
	const d = t.indexOf(n);
	return t.reduce(
		(e, r, o) => (
			o >= d ? (e[r] = defaultLogger[r]) : (e[r] = defaultLogger.silent),
			e
		),
		{},
	);
};
const t = ["trace", "debug", "info", "warn", "error", "silent"];
export { t as LOG_LEVELS, u as default };
