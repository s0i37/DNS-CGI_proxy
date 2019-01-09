var http = require('http')
var https = require('https')
var zlib = require('zlib')

const DNS_SUFFIX = '.s0i37.ga'

function replace_headers(headers, host)
{
	for(var header in headers)
	{
		if( typeof(headers[header]) == 'object' )
			headers[header] = replace_headers( headers[header], host )
		else if( typeof(headers[header]) == 'string' )
			headers[header] = headers[header].replace(new RegExp(host, 'g'), host+DNS_SUFFIX)
	}
	return headers
}

function replace_body(buffer, host)
{
	//console.log(buffer.toString())
	return new Buffer( buffer.toString('binary').replace(new RegExp(host, 'g'), host+DNS_SUFFIX), 'binary' )
}

function proxy(proto, port, request, response)
{
	var { method, headers, url } = request,
		chunks = []

	if(headers.host.indexOf(DNS_SUFFIX) == -1)
		throw '[!] outside request'
	headers.host = headers.host.replace(DNS_SUFFIX, '')

	req = proto.request( {
			host: headers.host,
			port: port,
			path: url,
			method: method,
			headers: headers
		}, function(res) {
			response.writeHead(res.statusCode, replace_headers(res.headers, headers.host) )
			if(res.headers['content-type'] == 'application/octet-stream')
			{
				res.on( "data", function(chunk) { response.write(chunk) } )
				res.on( "end", function() { response.end() } )
			}
			else
			{
				res.on( "data", function(chunk) { chunks.push(chunk) } )
				res.on( "end", function() {
					switch(res.headers['content-encoding'])
					{
						case 'gzip':
							zlib.gunzip(Buffer.concat(chunks), function(_, decompressed) {
								zlib.gzip( replace_body(decompressed, headers.host), function(_, compressed) {
									response.write(compressed)
									response.end()
								} )
							} )
							break
						case 'deflate':
							zlib.inflate(Buffer.concat(chunks), function(_, decompressed) {
								zlib.deflate( replace_body(decompressed, headers.host), function(_, compressed) {
									response.write(compressed)
									response.end()
								} )
							} )
							break
						default:
							response.write( replace_body(Buffer.concat(chunks), headers.host) )
							response.end()
							break
					}
				} )
			}
		} ).on("error", function(error){ response.writeHead(404); response.end() })
	req.end()
}

function http_handler(request, response)
{
	proxy(http, 80, request, response)
}

function https_handler(request, response)
{
	proxy(https, 443, request, response)
}

exports.http = http_handler
exports.https = https_handler