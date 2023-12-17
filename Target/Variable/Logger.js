var o = {
	Trace: (e) => {
		console.trace(e);
	},
	Debug: (e) => {
		console.debug(e);
	},
	Warn: (e) => {
		console.warn(chalk.yellow(e));
	},
	Error: (e) => {
		console.error(chalk.bold.red(e));
	},
	Info: (e) => {
		console.info(chalk.bold.blue(e));
	},
	Silent: () => ({}),
};
export { o as default };
