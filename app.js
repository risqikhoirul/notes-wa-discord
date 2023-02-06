const DiscordDatabase = require("discord-cloud-database");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require("@adiwajshing/baileys");
const logger = require("pino")({ level: "silent" });
const { Boom } = require("@hapi/boom");
require("dotenv").config();
const discordDatabase = new DiscordDatabase(process.env.TOKEN, { DatabaseTest: process.env.CHANNEL_ID });

async function run() {
  const { state, saveCreds } = await useMultiFileAuthState("sessions");
  const client = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger,
  });

  //   connection
  client.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (new Boom(lastDisconnect.error).output?.statusCode === DisconnectReason.loggedOut) {
        client.logout();
        console.log("Logged out...");
      } else {
        run();
      }
    } else {
      console.log("BOT Running...");
    }
  });
  //   save creds
  client.ev.on("creds.update", saveCreds);

  //   message
  client.ev.on("messages.upsert", async (msg) => {
    try {
      if (!msg.messages) return;
      const m = msg.messages[0];
      if (m.key.fromMe) return;
      var from = m.key.remoteJid;
      let type = Object.keys(m.message)[0];

      const body =
        type === "conversation"
          ? m.message.conversation
          : type == "imageMessage"
          ? m.message.imageMessage.caption
          : type == "videoMessage"
          ? m.message.videoMessage.caption
          : type == "extendedTextMessage"
          ? m.message.extendedTextMessage.text
          : type == "buttonsResponseMessage"
          ? m.message.buttonsResponseMessage.selectedButtonId
          : type == "listResponseMessage"
          ? m.message.listResponseMessage.singleSelectReply.selectedRowId
          : type == "templateButtonReplyMessage"
          ? m.message.templateButtonReplyMessage.selectedId
          : type === "messageContextInfo"
          ? m.message.listResponseMessage.singleSelectReply.selectedRowId || m.message.buttonsResponseMessage.selectedButtonId || m.text
          : "";

      global.reply = async (text) => {
        await client.sendPresenceUpdate("composing", from);
        return client.sendMessage(from, { text }, { quoted: m });
      };

      //   auto reply
      if (body) {
        if (process.env.TOKEN == "your_TOKEN" || process.env.CHANNEL_ID == "1071443851308449892" || process.env.SERVER_ID == "1069583614938988574") return reply(`Harap setting configurasi dahulu pada file .env`);

        try {
          const result = await discordDatabase.insertOne(body, { name: "DatabaseTest" });
          // var result = await discordDatabase.uploadFile(fileBuffer, body, { name: "DatabaseTest" });
          // var result = await discordDatabase.insertOne(body, { name: "DatabaseTest" });
          const link = "https://discord.com/channels/" + process.env.SERVER_ID + result.id;
          const pesan = `Berhasil disampan ke database.\n\nID: ${result.id}\nJam: ${result.time}\nTanggal: ${result.date}`;
          const templateButtons = [
            {
              index: 1,
              urlButton: {
                displayText: "Lihat",
                url: link,
              },
            },
          ];

          const templateMessage = {
            text: pesan,

            templateButtons: templateButtons,
            viewOnce: true,
          };
          await delay(2000);
          return client.sendMessage(from, templateMessage);
        } catch (e) {
          console.log(e);
          await reply("Ups.. ada yang error nih :(");
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  //run end
}

// running bot
try {
  run();
} catch (e) {
  console.log(e);
}
