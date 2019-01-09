### create and delegate own dns-zone

visit www.dot.tk

### enable wildcard dns

append in /etc/bind/db.yourzone.tk your dns server IP:

`*	IN	A	1.2.3.4`

### running

`node index.js`

### usage

just open any URL like www.somesite.org.yourzone.tk

