opensiddur-client
=================

Reference client for the @opensiddur server

Installation
============

 1. Clone the repository
 2. If you do not have a copy of [nginx] (http://nginx.org/en/docs/), install it according to the package directions. You need version 1.4 or later.
 3. Copy `conf/nginx-dev.conf.tmpl` to `conf/nginx-dev.conf`
 4. Edit `conf/nginx-dev.conf`. Make local configuration changes. The most important lines are:
     * `root /home/efeinstein/src/opensiddur-client;`: must be changed to point to your source directory
     * `listen 5000` :  the port to listen on 
     * `server_name localhost` : the server name
 5. Optional: Make any additional local configuration changes you want.

Running the app
===============

Link the nginx.conf file to the nginx sites-enabled directory (`/etc/nginx/sites-enabled`, on Ubuntu, for example) and restart nginx.

Point a web browser to <http://localhost:5000> (or the server_name:port you specified in your nginx.conf).

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
