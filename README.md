### create and delegate own dns-zone

visit www.dot.tk

### enable wildcard dns

append in /etc/bind/db.yourzone.tk your dns server IP:

`*	IN	A	1.2.3.4`

### creating certificate

`openssl genrsa -out keys.pem 2048`

`openssl req -new -x509 -key keys.pem -out cert.pem`

### tor (optional)

`tor`

### running

`node index.js`

### usage

just open any URL like http://www.somesite.org.yourzone.tk or http://somethingsite.onion.yourzone.tk

