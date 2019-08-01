const fs = require('fs');
const dir = fs.readdirSync('./');
const arr = [];
let count = 0;
function hex2rgb(hex) {
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[1] + hex[1];
	}
	const num = parseInt(hex, 16);
	const red = num >> 16;
	const green = (num >> 8) & 255;
	const blue = num & 255;
	return red + ', ' + green + ', ' + blue;
}
dir.forEach((theme) => {
	const fPath = `./${theme}/jquery-ui.theme.min.css`;

	const exists = fs.existsSync(fPath);
	console.log(exists, fPath)
	if (!exists) {
		return;
	}
	const stat = fs.statSync(fPath);
	if (!stat.isFile()) {
		return
	}
	count++;
	let color = '';
	let file = fs.readFileSync(fPath, 'utf8');
	let index = file.indexOf('.ui-widget.ui-widget-content');
	if (index === -1) { console.log('error'); }
	file = file.substring(index + 1);
	let match = file.match(/border:1px solid #([^};\s]+)/);
	color += `\n  --ui-widget-ui-widget-content-border-color: ${hex2rgb(match[1])};`;
	file = file.substring(match.index);
	['widget-content', 'widget-header', 'state-default', 'state-hover', 
		'state-active', 'state-highlight', 'state-error'].forEach((key) => {
		index = file.indexOf(`.ui-${key}`);
		if (index === -1) { console.log('error', key); }
		file = file.substring(index + 1);
		match = file.match(/border:1px solid #([^};\s]+)/);
		color += `\n  --ui-${key}-border-color: ${hex2rgb(match[1])};`
		match = file.match(/background:#([^};\s]+)/);
		color += `\n  --ui-${key}-background-color: ${hex2rgb(match[1])};`
		match = file.match(/color:#([^};\s]+)/);
		color += `\n  --ui-${key}-color: ${hex2rgb(match[1])};`;
	});
	index = file.indexOf(`.ui-widget-overlay`);
	if (index === -1) { console.log('error', 'overlay'); }
	file = file.substring(index + 1);
	match = file.match(/background:#([^};\s]+)/);
	color += `\n  --ui-widget-overlay-background-color: ${hex2rgb(match[1])};`;
	index = file.indexOf(`.ui-widget-shadow`);
	if (index === -1) { console.log('error', 'shadow'); }
	file = file.substring(index + 1);
	match = file.match(/box-shadow:.+#([^};\s]+)/);
	color += `\n  --ui-widget-shadow-color: ${hex2rgb(match[1])};`;
	file = fs.readFileSync(fPath, 'utf8');
	// file = `* \{\n${color}\n\}\n\n ${file}`;
	file = `[theme=${theme}] \{\n${color}\n\}\n\n ${file.substring(file.indexOf('/*!') - 2)}`;
	fs.writeFileSync(fPath, file, 'utf8');
	arr.push(color);
});
arr.forEach((item) => {
	//console.log('\n\n');
	//console.log(item);
});
console.log(count);
if (count !== 25) {
	console.log('lack theme !!!!', count);
}