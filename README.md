# WonderQ
A very simple queue service POC.

## Before starting

Make sure you have already installed:

- [npm](https://www.npmjs.com/) >= v6.14.8
- [NodeJS](https://nodejs.org/) >= v14.15.0

## Installation

Clone this repo.

Then, install dependencies:

```
npm i
```

## Build the app

Compile:

```
npm run build
```

## Run the app

Then, start the app:

```
npm start
```

Enjoy at http://localhost:3002/

## For development

Start the app without compiling by using:

```
npm run start:dev
```

Run tests

```
npm run test
```

### For getting this production ready
To scale this for production we should do some stuff:
- A different storage implementation that 'in-memory' must be used. Data could be get very big and that will affect memory of the server, that also has to be involved in processing data. A more efficient storage like a Redis server or even a relational DB may be used. Also, if we scale this over new instances and a load balancer in front of them, there should be a way of sharing data between these instances.
- Request should implement some kind of paginating or data limit, since responses could get really huge. Handling that amount of messages can be painful for any component.
- Nowadays, we have a two parameters: 'consId' (consumer ID) and 'prodId' (producer ID). Those parameters are only for identifying the consumers and producers and how they interact with the conditions and limitations. In production, those two should probably look more like a token, key or some kind of unique signature that identifies internally a previously registered producer/consumer.
- In terms of implementation, now only one queue is global to the application. We may want to have different queues, that could be easily extended.
- A rate limiter must be implemented to prevent unnecessary processing under attempts to turn down this component intentionally. A rate limiter can be implemented easily by using a Redis server.
- For setting up this into a production ready environment, this may also implement a dockerfile for using containerization. This dockerfile should include install modules, build, copy - only - runtime files and starting the application for production.
