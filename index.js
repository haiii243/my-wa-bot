import { makeWASocket, useMultiFileAuthState, delay } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import inquirer from 'inquirer';
import config from './config.js';
import handleMessage from './handler.js';

// Pilih metode login
const { loginMethod } = await inquirer.prompt({
  type: 'list',
  name: 'loginMethod',
  message: 'Pilih metode login:',
  choices: [
    { name: 'QR Code (WhatsApp Web)', value: 'qr' },
    { name: 'Pairing Code (WhatsApp Mobile)', value: 'pairing' }
  ]
});

// Initialize socket
const { state, saveCreds } = await useMultiFileAuthState("auth");
const sock = makeWASocket({
  auth: state,
  printQRInTerminal: false, // Kita handle manual
});

// Simpan session
sock.ev.on('creds.update', saveCreds);

// Handle QR Code
if (loginMethod === 'qr') {
  sock.ev.on('connection.update', ({ qr }) => {
    if (qr) {
      console.log(chalk.yellow('\nScan QR ini di WhatsApp:'));
      qrcode.generate(qr, { small: true });
    }
  });
} 

// Handle Pairing Code
else if (loginMethod === 'pairing') {
  sock.ev.on('connection.update', ({ phoneCode }) => {
    if (phoneCode) {
      console.log(chalk.blue(`\nPairing Code: ${phoneCode}`));
      console.log('Buka WhatsApp Mobile > Linked Devices > Link a Device');
    }
  });
}

// Bot connected
sock.ev.on('connection.update', ({ connection }) => {
  if (connection === 'open') {
    console.log(chalk.green(`\nBot ${config.botName} berhasil terhubung!`));
  }
});

// Handle pesan masuk
sock.ev.on('messages.upsert', ({ messages }) => {
  handleMessage(sock, messages[0]);
});

// Jaga agar bot tetap hidup
while (true) await delay(1000);
