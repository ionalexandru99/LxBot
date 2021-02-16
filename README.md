# Tom Nook Bot
This project is a Discord bot that can post to a channel within a server to announce new deals for free games available for PlayStation Plus. The bot can also check the Nintendo eShop and PlayStation Store for deals on tracked games.

The project is currently being developed in the two branches as there is also a version that can be deployed to Heroku.

The application is built using JavaScript as the core language and [discord.js](https://discord.js.org/#/) for connecting with Discord services for basic bot functionality.

## Motivations
I decided to work on this project since I was looking to have a replacement for another bot that was forced through some changes because of Heroku. Rather than relying on compatability with the previous bot, which was more of an RSS bot, I started to work on this version to focus on my needs for deal tracking.

## Installation
- Clone the repository
- Install Node
- `npm install`

## Usage
- Create user and database using PostgreSQL
- Modify `config-example.json` with database user and pass and rename the file `config.json`
- `node index.js`

## Features
### Epic Games Free Games
Weekly games given away by the Epic Games Store can be posted. Free game checks are defaulted to 1700 on Thursdays.

<img src="https://i.imgur.com/uBsdN1D.png" width=400>

### PlayStation Plus Free Games
Monthly games given away for the PlayStation Plus membership can be posted using the official PlayStation Blog. Blog post checks are defaulted to every hour.

<img src="https://i.imgur.com/sofGBr0.png" width=400>

### Game Tracking
Use a number based menu to view, add, and remove tracked games. Games currently on sale are denoated with the `ON SALE` text.

<img src="https://i.imgur.com/v1YYeDh.png" width=500>

<img src="https://i.imgur.com/pOs3wJ4.png" width=400>

Game sales will also be posted when they are first detected being on sale.

<img src="https://i.imgur.com/ViHhh8E.png" width=400>

At the moment only titles from the PlayStation Store and the Nintendo eShop can be tracked. Price checks are defaulted to 1700 GMT daily.
\*_Feature still in development_

### Help Menu
<img src="https://i.imgur.com/yDKQjLj.png" width=500>

## Config
Here is an explanation of the various config variables required for the bot to work:
- `configIcon`: Icon for various setting menus
- `DATABASE_URL`: Heroku database URL (Only needed for a Heroku instance)
- `dbName`: Database name (Only needed for a local database)
- `dbUser`: Database user (Only needed for a local database)
- `dbPass`: Database user password (Only needed for a local database)
- `epicFreeURL`: URL that returns a JSON object with the Epic Games freebies
- `epicGameURL`: Base URL for an Epic Games product page
- `epicIcon`: Icon for an Epic Games post
- `epicStoreURL`: Base URL that returns a JSON object of an Epic Games product
- `eshopImageURL`: Base URL that returns a header image of a Nintendo product
- `eshopURL`: Base URL that returns a JSON object of a Nintendo product
- `prefix`: Prefix used for bot commands
- `psIcon`: Icon for a PlayStation Store post
- `psPlusIcon`: Icon for a PlayStation Plus post
- `psPlusURL`: RSS feed for the PlayStation Plus articles
- `psStoreURL`: Base URL that returns a JSON object of a PlayStation product
- `switchIcon`: Icon for a Nintendo eShop post
- `token`: Discord bot token


## Credits
- Epic Games Store: https://www.epicgames.com/store/
- Nintendo eShop: https://www.nintendo.com/games/buy-digital/
- PlayStation Store: https://store.playstation.com/

Images seen in the above demo screenshots are used only for demonstrational purposes and are not distributed in the source code. Any logos belong to their respective owners.

## License
To-do
