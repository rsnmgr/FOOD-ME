import os from 'os';

export const getServerLocalIP = (req, res) => {
  const interfaces = os.networkInterfaces();
  let localIP = 'Not found';

  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        localIP = alias.address;
        break;
      }
    }
  }

  res.json({ localIP });
};
