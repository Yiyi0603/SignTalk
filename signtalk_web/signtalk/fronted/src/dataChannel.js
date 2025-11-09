let dataChannel
let messageHandlers = []
let pendingMessages = [] // 在通道未打开前缓存要发送的消息

const flushPending = () => {
  try {
    if (dataChannel && dataChannel.readyState === 'open' && pendingMessages.length) {
      pendingMessages.forEach((m) => {
        try { dataChannel.send(m) } catch (_) {}
      })
      pendingMessages = []
    }
  } catch (_) {}
}

const sendMessage = (username) => {
  const button = document.querySelector('.data-channel__button')
  const input = document.querySelector('.data-channel__input')
  button.disabled = false
  button.onclick = () => {
    if (!input.value) return
    const message = `${username}: ${input.value}`
    try {
      if (dataChannel && dataChannel.readyState === 'open') dataChannel.send(message)
      else pendingMessages.push(message)
    } catch (_) { pendingMessages.push(message) }
    input.value = ''
    receiveMessage(message)
  }
}
const receiveMessage = (message) => {
  const output = document.querySelector('.data-channel__output')
  output.scrollTop = output.scrollHeight //窗口总是显示最后的内容
  output.value = output.value + message + '\r'
  // 通知订阅者（用于字幕展示）
  try {
    messageHandlers.forEach((h) => {
      try { h(message) } catch (e) {}
    })
  } catch (e) {}
}
const openDataChannel = (localPc, username) => {
  // 仅创建一条用于业务的通道
  try {
    dataChannel = localPc.createDataChannel('subtitle')
  } catch (_) {}
  // 通道打开：绑定输入按钮、刷新缓存消息
  if (dataChannel) {
    dataChannel.onopen = () => { sendMessage(username); flushPending() }
    dataChannel.onmessage = (event) => receiveMessage(event.data)
  }
  // 对端创建并回调 ondatachannel 的场景
  localPc.ondatachannel = (event) => {
    dataChannel = event.channel
    dataChannel.onopen = () => { flushPending() }
    dataChannel.onmessage = (event) => receiveMessage(event.data)
  }
}
// 供业务侧发送识别字幕（会自动加上前缀）
export const sendSignSubtitle = (text) => {
  if (!text) return
  const payload = `SIGN_SUBTITLE:${text}`
  try {
    if (dataChannel && dataChannel.readyState === 'open') dataChannel.send(payload)
    else pendingMessages.push(payload)
  } catch (e) { pendingMessages.push(payload) }
}

// 业务侧注册接收回调，收到字幕事件时会回调
export const onDataMessage = (handler) => {
  if (typeof handler === 'function') messageHandlers.push(handler)
}

export default openDataChannel