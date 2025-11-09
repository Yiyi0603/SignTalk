#!/usr/bin/env node
/**
 * 生成自签名SSL证书用于开发环境
 * 用于支持HTTPS视频通话功能
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
  // 优先使用环境变量（可手动指定机器的局域网IP）
  if (process.env.LOCAL_IP) return process.env.LOCAL_IP;
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const i of ifaces[name]) {
      if (i.family === 'IPv4' && !i.internal) {
        // 选第一个非内网回环地址
        return i.address;
      }
    }
  }
  return '127.0.0.1';
}

function generateCertificates() {
  try {
    // 创建证书目录
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true });
      console.log('✅ 创建证书目录:', certsDir);
    }

    const localIp = getLocalIp();
    console.log('📡 检测到本机局域网IP:', localIp);

    // 始终重新生成，确保包含正确的 SAN（可根据需要改为仅首次生成）
    try {
      if (fs.existsSync(keyPath)) fs.unlinkSync(keyPath);
      if (fs.existsSync(certPath)) fs.unlinkSync(certPath);
    } catch (_) {}

    console.log('🔐 生成自签名SSL证书...');
    
    // 生成 openssl 配置，包含 SAN（支持 IP 与 localhost）
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
    console.log('');
    console.log('⚠️  注意: 这是自签名证书，请将证书加入受信任根证书（建议使用 mkcert 进行本机信任）');
    console.log('💡 若从电脑B通过 IP 访问，请在电脑B上信任该证书或导入根证书');
    
  } catch (error) {
    console.error('❌ 证书生成失败:', error.message);
    console.log('');
    console.log('🔧 手动生成证书的方法:');
    console.log('1. 安装OpenSSL: https://slproweb.com/products/Win32OpenSSL.html');
    console.log('2. 运行以下命令:');
    console.log(`   openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=CN/ST=Beijing/L=Beijing/O=SignTalk/OU=Development/CN=localhost"`);
    console.log('');
    console.log('💡 或者直接使用HTTP模式（视频通话功能可能受限）');
  }
}

// 检查OpenSSL是否可用
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
    console.log('❌ OpenSSL未安装');
    console.log('');
    console.log('📥 安装OpenSSL:');
    console.log('1. 下载: https://slproweb.com/products/Win32OpenSSL.html');
    console.log('2. 安装后重新运行此脚本');
    console.log('');
    console.log('💡 或者直接使用HTTP模式启动服务器');
  }
}

module.exports = { generateCertificates, checkOpenSSL };



