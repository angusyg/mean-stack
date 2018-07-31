Nean stack
==========

Nean stack application based on NeDB Express Angularjs Nodejs.

Backend
-------

A Nodejs Express server to expose REST API. Persistance is done using NeDB embedded database.

Features

  * Authentication: user database to store login/password
  * Security: Passport JWT strategy
  * REST API:
    * login endpoint: to log in users
    * logout endpoint: to log out users
    * logging endpoint: to log messages from frontend application
    * refresh endpoint: to refresh JWT access token
  * Error handling: ApiError and generic error
  * Logging: multi-stream logging and debug logging

Frontend
--------

An angularjs application including several modules to handle basic configuration and calling of REST API.

Features

  * Authentication: login modal and JWT authentication
  * API: api caller to discover and handle call to API endpoints (REST resource or not)
  * Configuration: global configuration of core module and submodules
  * i18n: internationalization
  * Routing: base routing
  * Logging: logging of client errors to server log
  * Services: helpers to use base64, exceptions ...

Install
-------

    $ npm install https://github.com/angusyg/nean-stack

Quick Start
-----------

After installation, a folder 'web' is created at root.
For development, to launch a server and watch files changes, use :

      $ gulp
or

      $ npm run dev
