# c3-flo [![Build Status](https://travis-ci.org/c-base/c3-flo.svg?branch=master)](https://travis-ci.org/c-base/c3-flo) [![Docker Hub](https://img.shields.io/docker/pulls/cbase/c3-flo.svg)](https://hub.docker.com/r/cbase/c3-flo/)

[MsgFlo](https://msgflo.org) setup for rewiring the [c-base space station](https://c-base.org/) at [35C3](https://events.ccc.de/category/congress/35c3/).

This is a simplified version of the full [c-flo setup](https://github.com/c-base/c-flo) we use for IoT at the space station. This setup has all hardware and local network requirements removed, making it portable for taking to events.

## Features

* Support for JavaScript components
* Support for CoffeeScript components
* Support for Python 3 components
* docker-compose runnable environment

## Running with docker-compose

* Ensure you have a running Docker daemon
* Start the project with `docker-compose up`

## Editing in Flowhub

Everything is set up so that you can edit the project in [Flowhub](https://flowhub.io)

Once you've installed and started the service either locally or with Docker, open Flowhub with:

<http://app.flowhub.io#runtime/endpoint?protocol%3Dwebsocket%26address%3Dws%3A%2F%2Flocalhost%3A3569>

Use Flowhub's [GitHub synchronization](https://docs.flowhub.io/github-integration/) feature to push your graph and component changes to this repository.

## Test automation

* Enable your local fork in [Travis CI](https://travis-ci.org/)
* Tests are written in [fbp-spec format](https://github.com/flowbased/fbp-spec) and located in `spec/` folder
* You can run tests locally with `npm test` (note: you'll have to do `npm install` for this even when running with Docker)
