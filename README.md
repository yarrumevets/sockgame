# 🏓 Sockgame (Websocket Game) - Pong

Real-time multiplayer web pong game POC that syncs game state server side.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Roadmap](#roadmap)
- [Installation](#installation)
- [Tech](#tech)
- [Setup](#setup)
- [Usage](#usage)
- [License](#license)
- [Media Sources](#media-sources)
- [Live Demo](#live-demo)

## Introduction

I built this little game to provide the foundation for an multiplayer online real-time web game.

## Tech

- Vanilla JS - This app was initially intended as a very minimalist POC for demonstrating integration with the Google Docs API.
- Node Express - A very simple express server with endpoints for downloading the document in the various file types.
- GoogleAPIs Node.js client - For authenticating and fetching the document in text and binary formats

## Features

This POC/boilerplate game can be used as a starting point for a web game that requires:

- Real-time - Frame-level accuracy
- Server-side source of truth - Game state and animation loop are controlled by the server
- Multi-player - Clients are added to a socket connection list
- Animation - Animation loop in canvas on the client
- Input - Capture keyboard key states

## Roadmap

Features I plan to include:

- Websocket client list queue on the side, indicating which clients are players
- End-game logic that resets the game
- A module that provides some basic collision-detection functions

## Installation

Step-by-step instructions on how to get the development environment running.

```bash
git clone https://github.com/yarrumevets/sockgame.git
cd sockgame
yarn
```

## Setup

(nothing required)

## Usage

```bash
node server.js
```

Go to `http://localhost:<PORT>` in your browser.

## License

Distributed under the MIT License. See the LICENSE file for more information.

## Media Sources

Google official icons: https://about.google/brand-resource-center/logos-list/

## Live Demo

&#128073; [Live Demo](https://yarrumevets.com/sockgame) &#128072;
