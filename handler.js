import config from './config.js';

export default async function handleMessage(sock, msg) {
  if (!msg.message) return;

  const text = msg.message.conversation || '';
  const sender = msg.key.remoteJid;

  // Contoh command: !ping
  if (text === `${config.prefix}ping`) {
    await sock.sendMessage(sender, { text: '🏓 Pong!' });
  }

  // Tambahkan handler lain di sini
}
