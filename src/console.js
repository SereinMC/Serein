import chalk from 'chalk';

const error = chalk.bold.red;
const gary = chalk.bold.whiteBright;
const magenta = chalk.bold.magenta;
const warning = chalk.hex('#FFA500');
const accept = chalk.bold.green;

function start(text) {
	console.log(chalk.bold.blue('[start] ') + text);
}

function done(text) {
	console.log(accept('[done] ') + text);
}

export { error, gary, magenta, warning, accept, start, done };
