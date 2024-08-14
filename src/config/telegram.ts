const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
import dotenv from 'dotenv';
dotenv.config();

const apiId = Number(process.env.apiId);
const apiHash = process.env.apiHash;

const tgClient = (sessionString: String) => {
  try {
    const session = new StringSession(sessionString);
    const tgClient = new TelegramClient(session, apiId, apiHash, {});
    return tgClient;
  } catch (error) {
    return error;
  }
};

const tgApi = Api;
export { tgClient, tgApi };
