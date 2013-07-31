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

Setting up your local clone
===========================

This repository is structured using git-flow. The `master` branch contains released code. The `develop` branch contains unreleased code, and features are developed inside `feature/name` branches. To set up your local repository, install the [git-flow] (https://github.com/nvie/gitflow) plugin, then, after cloning the repository run 

```bash
$ git flow init
No branches exist yet. Base branches must be created now.
Branch name for production releases: [master] 
Branch name for "next release" development: [develop] 

How to name your supporting branch prefixes?
Feature branches? [feature/] 
Release branches? [release/] 
Hotfix branches? [hotfix/] 
Support branches? [support/] 
Version tag prefix? [] 
```

To get your code committed to the main repository, send a pull request. Please only make a limited number of changes per pull request.
