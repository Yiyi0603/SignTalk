import { SOCKET_ON_RTC } from './enum.js'
/**
 * rtc 监听
 * @param socket 初始后的socket
 */
export default function SocketRtc(socket) {
  // 接收到《接收者》发送candidate连接成功消息，转发给目标用户
  socket.on(SOCKET_ON_RTC.CANDIDATE, (room, data) => {
    // 支持新格式（包含targetSocketId）和旧格式（直接是candidate对象）
    let candidateData, targetSocketId, senderSocketId
    if (data && data.candidate) {
      // 新格式：多peer模式
      candidateData = data.candidate
      targetSocketId = data.targetSocketId
      senderSocketId = data.senderSocketId || socket.id
    } else {
      // 旧格式：单peer模式（向后兼容，广播给房间内其他人）
      candidateData = data.candidate || data
      targetSocketId = null
      senderSocketId = socket.id
    }
    
    // 安全地获取 candidate 字符串用于日志
    let candidateStr = 'null'
    if (candidateData) {
      if (typeof candidateData === 'string') {
        candidateStr = candidateData.substring(0, 80) + '...'
      } else if (candidateData.candidate && typeof candidateData.candidate === 'string') {
        candidateStr = candidateData.candidate.substring(0, 80) + '...'
      } else {
        candidateStr = JSON.stringify(candidateData).substring(0, 80) + '...'
      }
    }
    
    console.log('=== [Server] 收到 ICE 候选，转发 ===', {
      room: room,
      socketId: socket.id,
      senderSocketId: senderSocketId,
      targetSocketId: targetSocketId,
      candidate: candidateStr,
      timestamp: new Date().toISOString()
    })
    
    // 如果指定了目标socketId，只发送给目标；否则广播（向后兼容）
    if (targetSocketId) {
      socket.to(targetSocketId).emit(SOCKET_ON_RTC.CANDIDATE, {
        candidate: candidateData,
        senderSocketId: senderSocketId,
        targetSocketId: targetSocketId
      })
    } else {
      socket.to(room).emit(SOCKET_ON_RTC.CANDIDATE, {
        candidate: candidateData,
        senderSocketId: senderSocketId
      })
    }
    
    console.log('=== [Server] ICE 候选已转发 ===', {
      room: room,
      targetSocketId: targetSocketId || 'broadcast',
      timestamp: new Date().toISOString()
    })
  })
  
  // 接收到《发起者》发送offer，转发给目标用户
  socket.on(SOCKET_ON_RTC.OFFER, (room, data) => {
    // 支持新格式（包含targetSocketId）和旧格式（直接是offer对象）
    let offerData, targetSocketId, senderSocketId, senderUsername
    if (data && data.offer) {
      // 新格式：多peer模式
      offerData = data.offer
      targetSocketId = data.targetSocketId
      senderSocketId = data.senderSocketId || socket.id
      senderUsername = data.senderUsername
    } else {
      // 旧格式：单peer模式（向后兼容，广播给房间内其他人）
      offerData = data
      targetSocketId = null
      senderSocketId = socket.id
    }
    
    // 安全地获取 SDP 字符串用于日志
    let offerSdp = 'null'
    if (offerData?.sdp && typeof offerData.sdp === 'string') {
      offerSdp = offerData.sdp.substring(0, 100) + '...'
    }
    
    console.log('=== [Server] 收到 OFFER，转发 ===', {
      room: room,
      socketId: socket.id,
      senderSocketId: senderSocketId,
      targetSocketId: targetSocketId,
      senderUsername: senderUsername,
      offerType: offerData?.type,
      offerSdp: offerSdp,
      timestamp: new Date().toISOString()
    })
    
    // 如果指定了目标socketId，只发送给目标；否则广播（向后兼容）
    if (targetSocketId) {
      socket.to(targetSocketId).emit(SOCKET_ON_RTC.OFFER, {
        offer: offerData,
        senderSocketId: senderSocketId,
        targetSocketId: targetSocketId,
        senderUsername: senderUsername
      })
    } else {
      socket.to(room).emit(SOCKET_ON_RTC.OFFER, offerData)
    }
    
    console.log('=== [Server] OFFER 已转发 ===', {
      room: room,
      targetSocketId: targetSocketId || 'broadcast',
      timestamp: new Date().toISOString()
    })
  })
  
  // 接收到《接收者》发送answer，转发给目标用户
  socket.on(SOCKET_ON_RTC.ANSWER, (room, data) => {
    // 支持新格式（包含targetSocketId）和旧格式（直接是answer对象）
    let answerData, targetSocketId, senderSocketId, senderUsername
    if (data && data.answer) {
      // 新格式：多peer模式
      answerData = data.answer
      targetSocketId = data.targetSocketId
      senderSocketId = data.senderSocketId || socket.id
      senderUsername = data.senderUsername
    } else {
      // 旧格式：单peer模式（向后兼容，广播给房间内其他人）
      answerData = data
      targetSocketId = null
      senderSocketId = socket.id
    }
    
    // 安全地获取 SDP 字符串用于日志
    let answerSdp = 'null'
    if (answerData?.sdp && typeof answerData.sdp === 'string') {
      answerSdp = answerData.sdp.substring(0, 100) + '...'
    }
    
    console.log('=== [Server] 收到 ANSWER，转发 ===', {
      room: room,
      socketId: socket.id,
      senderSocketId: senderSocketId,
      targetSocketId: targetSocketId,
      senderUsername: senderUsername,
      answerType: answerData?.type,
      answerSdp: answerSdp,
      timestamp: new Date().toISOString()
    })
    
    // 如果指定了目标socketId，只发送给目标；否则广播（向后兼容）
    if (targetSocketId) {
      socket.to(targetSocketId).emit(SOCKET_ON_RTC.ANSWER, {
        answer: answerData,
        senderSocketId: senderSocketId,
        targetSocketId: targetSocketId,
        senderUsername: senderUsername
      })
    } else {
      socket.to(room).emit(SOCKET_ON_RTC.ANSWER, answerData)
    }
    
    console.log('=== [Server] ANSWER 已转发 ===', {
      room: room,
      targetSocketId: targetSocketId || 'broadcast',
      timestamp: new Date().toISOString()
    })
  })
}
