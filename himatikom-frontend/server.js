const https = require('https');
const fs = require('fs');
const path = require('path');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev });
const handle = app.getRequestHandler();

// Read SSL certificates
const options = {
  key: fs.readFileSync(path.join(__dirname, '.certs/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '.certs/cert.pem')),
};

app.prepare().then(() => {
  https.createServer(options, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, () => {
    console.log(`✓ HTTPS Server ready on https://${hostname}:${port}`);
    console.log(`✓ Visit: https://10.208.42.214:${port}`);
  });
});
