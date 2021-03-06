var http = require("http")
var https = require('https')
var fs = require('fs');

var certificate = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
}

const LISTEN = "0.0.0.0"

function start(proxy)
{
	http.createServer( function(request, response) {
		try
		{
			proxy.http(request, response)
		}
		catch(e)
		{
			console.error(e)
			response.writeHead(404, {'Content-Type': 'text/html'})
			response.end("not found")
		}
	} ).listen( 80, LISTEN )

	https.createServer( certificate, function(request, response) {
		try
		{
			proxy.https(request, response)
		}
		catch(e)
		{
			console.error(e)
			response.writeHead(404, {'Content-Type': 'text/html'})
			response.end("not found")
		}
	} ).listen( 443, LISTEN )
}

exports.start = start
