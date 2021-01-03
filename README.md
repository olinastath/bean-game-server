# Bean Game
A digital version of the game Bohnanza built with Node.js and Phaser 3. 
Please don't sue me I just love your game so much. 

The repo originally contained both the server and client but has since been split up. This repo contains the server.

## Installation
On home directory, run `npm install`.

## Running the project
On home directory run `npm start`. The server is now running on http://localhost:2000.

### Dev Environment
To enable reconnection in case a socket drops, the server uses the user's IP address as the user ID. You can disable this for dev and testing purposes by adding the `--DEV_ENV` flag when running the server (i.e.: `npm run start --DEV_ENV`). This is also equivalent to running `npm run start-dev`.

### Trade alerts on mode
By default, trade alerts are disabled so players can trade cards faster. To enable trade alerts, add the flag `--TRADE_ALERTS_ON` when running the server (i.e.: `npm run start --TRADE_ALERTS_ON`). 

<br/>

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y225QO7)
