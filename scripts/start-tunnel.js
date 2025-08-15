// Create LocalTunnel to expose http://localhost:8080 and write the URL to tmp/public_url.txt
const fs = require('fs');
const lt = require('localtunnel');

(async () => {
	try {
		const tunnel = await lt({ port: 8080 });
		const url = tunnel.url;
		fs.writeFileSync('/workspace/tmp/public_url.txt', url);
		console.log(`Public URL: ${url}`);
		tunnel.on('close', () => {
			console.log('Tunnel closed');
		});
	} catch (err) {
		console.error('Failed to start localtunnel:', err);
		process.exit(1);
	}
})();