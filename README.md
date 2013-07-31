opensiddur-client
=================

Reference client for the @opensiddur server

Installation
============

 1. Clone the repository
 2. If you do not have a copy of [nginx] (http://nginx.org/en/docs/), install it according to the package directions.
 3. Copy `conf/nginx.conf.tmpl` to `conf/nginx.conf`
 4. Edit `conf/nginx.conf`. If you do not have an @opensiddur server installation, comment the line that begins `proxy_pass` that references `localhost` and uncomment the line that references `dev.jewishliturgy.org`
 5. Optional: Make any additional local configuration changes you want.

Running the app
===============

Run (you may need to be root and the working directory should be the clone!):
```bash
/path/to/clone/of/opensiddur-client$ nginx -c conf/nginx.conf -p /path/to/clone/of/opensiddur-client
```

Point a web browser to [http://localhost:5000] (http://localhost:5000).

