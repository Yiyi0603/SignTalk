export const rtcConfig = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302"] },
    { urls: ["stun:stun1.l.google.com:19302"] },
    { urls: ["stun:stun2.l.google.com:19302"] },
    // 可选：如果自建 TURN 可用，添加以下（tcp/tls 有助于复杂网络环境）
    // { urls: ["turns:your.turn.server:5349"], username: "user", credential: "pass" },
    // { urls: ["turn:your.turn.server:3478?transport=tcp"], username: "user", credential: "pass" },
  ],
  iceTransportPolicy: 'all',
  bundlePolicy: 'balanced',
};