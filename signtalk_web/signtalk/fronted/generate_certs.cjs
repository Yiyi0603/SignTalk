#!/usr/bin/env node
/**
 * 生成自签名SSL证书用于开发环境（CommonJS 版本）
 * 适用于 package.json 中设置了 "type":"module" 的工程
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const certsDir = path.join(__dirname, 'src', 'certs');
const keyPath = path.join(certsDir, 'localhost-key.pem');
const certPath = path.join(certsDir, 'localhost-cert.pem');
const opensslCfgPath = path.join(certsDir, 'openssl.cnf');

function getLocalIp() {
  if (process.env.LOCAL_IP) return process.env.LOCAL_IP;
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const i of ifaces[name]) {
      if (i.family === 'IPv4' && !i.internal) {
        return i.address;
      }
    }
  }
  return '127.0.0.1';
}

function generateCertificates() {
  try {
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true });
      console.log('✅ 创建证书目录:', certsDir);
    }

    const localIp = getLocalIp();
    console.log('📡 检测到本机局域网IP:', localIp);

    try {
      if (fs.existsSync(keyPath)) fs.unlinkSync(keyPath);
      if (fs.existsSync(certPath)) fs.unlinkSync(certPath);
    } catch (_) {}

    console.log('🔐 生成自签名SSL证书...');

    const cfg = `
[ req ]
default_bits       = 4096
distinguished_name = req_distinguished_name
req_extensions     = v3_req
prompt             = no

[ req_distinguished_name ]
C  = CN
ST = Beijing
L  = Beijing
O  = SignTalk
OU = Development
CN = localhost

[ v3_req ]
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = localhost
IP.1  = ${localIp}
`;
    fs.writeFileSync(opensslCfgPath, cfg);

    const command = `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -config "${opensslCfgPath}"`;
    execSync(command, { stdio: 'inherit' });

    console.log('✅ SSL证书生成成功!');
    console.log('📁 证书位置:');
    console.log('   - 私钥:', keyPath);
    console.log('   - 证书:', certPath);
    console.log('⚠️  自签名证书需在浏览器信任');
  } catch (error) {
    console.error('❌ 证书生成失败:', error.message);
    console.log('若未安装 OpenSSL，请先安装后重试');
  }
}

function checkOpenSSL() {
  try {
    execSync('openssl version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

if (require.main === module) {
  console.log('🔍 检查OpenSSL...');
  if (checkOpenSSL()) {
    console.log('✅ OpenSSL已安装');
    generateCertificates();
  } else {
    console.log('❌ OpenSSL未安装，无法自动生成证书');
  }
}

module.exports = { generateCertificates, checkOpenSSL };




