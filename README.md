# NOTES-WA-DISCORD

whatsapp notes menggunakan database discord

## Install?

```
git clone https://github.com/risqikhoirul/notes-wa-discord.git
cd notes-wa-discord
npm i
```

## Get token?

```
node token <email> <password>
```

example:

```
node token risqi@gmail.id risqi123
```

## Configuration .env

edit file .env

```
# Token akun discord (bukan bot)
#(string)

TOKEN="your_TOKEN"

# discord.com/serverid/channelid
# id channel (string)

CHANNEL_ID="1071443851308449892"

# (integer)
# id server

SERVER_ID=1069583614938988574
```

## Usage?

```
npm start
```
