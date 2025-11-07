import { SOCKET_EMIT, SOCKET_ON_SYS } from './enum.js'
import SocketRtc from './on.js'
import initApp, { getApp } from './config.js'
// 初始化应用
let io = initApp()
const app = getApp()
// 按房间管理用户列表，解决跨房间用户管理混乱的问题
let roomMembers = new Map()
// 配置房间最大人数（可根据需要调整）
const MAX_ROOM_MEMBERS = 10

// 清理无效连接的工具函数
const cleanupInvalidConnections = (io) => {
  console.log('=== [Server] 开始清理无效连接 ===', {
    totalRooms: roomMembers.size,
    timestamp: new Date().toISOString()
  })
  
  let cleanedCount = 0
  const roomsBeforeCleanup = roomMembers.size
  
  roomMembers.forEach((members, room) => {
    console.log('=== [Server] 检查房间 ===', {
      room: room,
      membersCount: members.length,
      members: members.map(m => ({ username: m.username, userId: m.userId })),
      timestamp: new Date().toISOString()
    })
    
    const validMembers = members.filter(member => {
      const socket = io.sockets.sockets.get(member.userId)
      const isValid = socket && socket.connected
      
      if (!isValid) {
        console.log('=== [Server] 发现无效连接，清理 ===', {
          room: room,
          userId: member.userId,
          username: member.username,
          socketExists: !!socket,
          socketConnected: socket?.connected,
          timestamp: new Date().toISOString()
        })
        cleanedCount++
        return false
      }
      return true
    })
    
    if (validMembers.length === 0) {
      roomMembers.delete(room)
      console.log('=== [Server] 房间已清空，删除房间 ===', {
        room: room,
        timestamp: new Date().toISOString()
      })
    } else if (validMembers.length < members.length) {
      roomMembers.set(room, validMembers)
      // 通知房间内剩余用户更新列表
      io.to(room).emit(SOCKET_EMIT.SYS_USER_LIST, validMembers)
      console.log('=== [Server] 房间成员已更新 ===', {
        room: room,
        remainingMembers: validMembers.length,
        timestamp: new Date().toISOString()
      })
    }
  })
  
  console.log('=== [Server] 清理完成 ===', {
    cleanedCount: cleanedCount,
    remainingRooms: roomMembers.size,
    timestamp: new Date().toISOString()
  })
  
  return cleanedCount
}

// 定期清理无效连接（每30秒检查一次）
setInterval(() => {
  cleanupInvalidConnections(io)
}, 30000)

// 导出清理函数供外部调用
export const clearAllRooms = () => {
  console.log('=== [Server] 手动清空所有房间 ===', {
    timestamp: new Date().toISOString()
  })
  roomMembers.clear()
  return true
}

// 导出获取房间信息的函数
export const getRoomInfo = () => {
  const info = {}
  roomMembers.forEach((members, room) => {
    info[room] = members.map(m => ({ username: m.username, userId: m.userId }))
  })
  return info
}

// 添加HTTP接口用于管理和清理房间
if (app) {
  // 获取所有房间信息
  app.get('/api/rooms', (req, res) => {
    const info = getRoomInfo()
    res.json({
      success: true,
      rooms: info,
      totalRooms: Object.keys(info).length,
      timestamp: new Date().toISOString()
    })
  })
  
  // 清空所有房间
  app.post('/api/rooms/clear', (req, res) => {
    const cleared = clearAllRooms()
    res.json({
      success: true,
      message: '所有房间已清空',
      timestamp: new Date().toISOString()
    })
  })
  
  // 手动触发清理无效连接
  app.post('/api/rooms/cleanup', (req, res) => {
    const cleanedCount = cleanupInvalidConnections(io)
    res.json({
      success: true,
      cleanedCount: cleanedCount,
      message: `已清理 ${cleanedCount} 个无效连接`,
      timestamp: new Date().toISOString()
    })
  })
  
  console.log('=== [Server] HTTP API 接口已注册 ===', {
    endpoints: ['GET /api/rooms', 'POST /api/rooms/clear', 'POST /api/rooms/cleanup'],
    timestamp: new Date().toISOString()
  })
}

// 监听连接
io.on(SOCKET_ON_SYS.CONNECTION, (socket) => {
  const { query } = socket.handshake
  // 获取socket连接参数 username和room
  const username = query.username
  const room = query.room
  
  console.log('=== [Server] 新用户连接 ===', {
    socketId: socket.id,
    username: username,
    room: room,
    timestamp: new Date().toISOString()
  })
  
  // 初始化房间成员列表（如果不存在）
  if (!roomMembers.has(room)) {
    roomMembers.set(room, [])
    console.log('=== [Server] 创建新房间 ===', {
      room: room,
      existingRooms: Array.from(roomMembers.keys()),
      timestamp: new Date().toISOString()
    })
  } else {
    console.log('=== [Server] 房间已存在 ===', {
      room: room,
      currentMembers: roomMembers.get(room).map(m => ({ username: m.username, userId: m.userId })),
      timestamp: new Date().toISOString()
    })
  }
  
  const members = roomMembers.get(room)
  
  // 检查同一用户名在同一房间是否已有连接（防止同一用户多个标签页）
  const existingUserIndex = members.findIndex(m => m.username === username)
  let oldSocketToDisconnect = null
  let oldSocketId = null
  
  if (existingUserIndex !== -1) {
    const existingUser = members[existingUserIndex]
    const existingSocket = io.sockets.sockets.get(existingUser.userId)
    oldSocketId = existingUser.userId
    oldSocketToDisconnect = existingSocket
    
    console.log('=== [Server] 发现同一用户已有连接，准备替换 ===', {
      username: username,
      room: room,
      oldSocketId: existingUser.userId,
      newSocketId: socket.id,
      oldSocketConnected: existingSocket?.connected,
      timestamp: new Date().toISOString()
    })
    
    // 先标记旧socket，稍后断开（先添加新连接，再断开旧连接）
    // 从成员列表中移除旧连接（新连接会立即添加）
    members.splice(existingUserIndex, 1)
  }
  
  // 检查是否已存在相同的socketId（防止重复添加）
  const existingSocketIndex = members.findIndex(m => m.userId === socket.id)
  if (existingSocketIndex !== -1) {
    console.log('=== [Server] 发现重复socketId，移除旧记录 ===', {
      socketId: socket.id,
      username: username,
      room: room,
      timestamp: new Date().toISOString()
    })
    members.splice(existingSocketIndex, 1)
  }
  
  // 检查房间是否已满（在清理重复连接后重新检查）
  if (members.length >= MAX_ROOM_MEMBERS) {
    console.log('=== [Server] 房间已满，拒绝连接 ===', {
      room: room,
      currentMembers: members.length,
      maxMembers: MAX_ROOM_MEMBERS,
      username: username,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    })
    socket.emit('error', { message: `房间已满，最多支持${MAX_ROOM_MEMBERS}人加入` })
    socket.disconnect(true)
    return
  }
  
  // 检查该socketId是否在其他房间中，如果是，先清理旧房间
  roomMembers.forEach((otherMembers, otherRoom) => {
    if (otherRoom !== room) {
      const indexInOtherRoom = otherMembers.findIndex(m => m.userId === socket.id)
      if (indexInOtherRoom !== -1) {
        console.log('=== [Server] 发现socket在其他房间，清理旧房间 ===', {
          socketId: socket.id,
          oldRoom: otherRoom,
          newRoom: room,
          timestamp: new Date().toISOString()
        })
        otherMembers.splice(indexInOtherRoom, 1)
        
        // 如果旧房间为空，删除房间
        if (otherMembers.length === 0) {
          roomMembers.delete(otherRoom)
        } else {
          // 通知旧房间更新列表
          io.to(otherRoom).emit(SOCKET_EMIT.SYS_USER_LIST, otherMembers)
        }
      }
    }
  })
  
  // 检查该用户名是否在其他房间中（防止同一用户多个标签页在不同房间）
  roomMembers.forEach((otherMembers, otherRoom) => {
    if (otherRoom !== room) {
      const userIndexInOtherRoom = otherMembers.findIndex(m => m.username === username)
      if (userIndexInOtherRoom !== -1) {
        const otherUser = otherMembers[userIndexInOtherRoom]
        const otherSocket = io.sockets.sockets.get(otherUser.userId)
        
        console.log('=== [Server] 发现同一用户在其他房间，断开旧连接 ===', {
          username: username,
          oldRoom: otherRoom,
          newRoom: room,
          oldSocketId: otherUser.userId,
          timestamp: new Date().toISOString()
        })
        
        // 断开旧连接
        if (otherSocket && otherSocket.connected) {
          otherSocket.emit('error', { message: '检测到新连接，断开旧连接' })
          otherSocket.disconnect(true)
        }
        
        // 从旧房间移除
        otherMembers.splice(userIndexInOtherRoom, 1)
        
        // 如果旧房间为空，删除房间
        if (otherMembers.length === 0) {
          roomMembers.delete(otherRoom)
        } else {
          // 通知旧房间更新列表
          io.to(otherRoom).emit(SOCKET_EMIT.SYS_USER_LIST, otherMembers)
        }
      }
    }
  })
  
  // 再次检查是否已存在相同的socketId（防止重复添加）
  const finalCheckIndex = members.findIndex(m => m.userId === socket.id)
  if (finalCheckIndex !== -1) {
    console.log('=== [Server] 最终检查：发现重复socketId，移除 ===', {
      socketId: socket.id,
      username: username,
      room: room,
      timestamp: new Date().toISOString()
    })
    members.splice(finalCheckIndex, 1)
  }
  
  // 连接管理
  let user = { userId: socket.id, username }
  members.push(user)
  console.log('=== [Server] 用户已加入房间 ===', {
    room: room,
    username: username,
    socketId: socket.id,
    totalMembers: members.length,
    members: members.map(m => ({ username: m.username, userId: m.userId })),
    timestamp: new Date().toISOString()
  })
  
  // 房间管理 - 先离开所有房间，再加入新房间（防止重复加入）
  socket.rooms.forEach(roomName => {
    if (roomName !== socket.id) { // socket.id 是默认房间，不需要离开
      socket.leave(roomName)
      console.log('=== [Server] Socket 离开旧房间 ===', {
        oldRoom: roomName,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      })
    }
  })
  
  socket.join(room)
  console.log('=== [Server] Socket 已加入房间 ===', {
    room: room,
    socketId: socket.id,
    timestamp: new Date().toISOString()
  })
  
  // 每次连接向房间发送用户列表
  console.log('=== [Server] 发送用户列表 ===', {
    room: room,
    members: members.map(m => ({ username: m.username, userId: m.userId })),
    timestamp: new Date().toISOString()
  })
  io.to(room).emit(SOCKET_EMIT.SYS_USER_LIST, members)
  
  // 如果有旧连接需要断开，现在断开（新连接已经添加，不会导致房间清空）
  if (oldSocketToDisconnect && oldSocketToDisconnect.connected) {
    console.log('=== [Server] 断开旧连接（新连接已添加）===', {
      username: username,
      room: room,
      oldSocketId: oldSocketId,
      newSocketId: socket.id,
      timestamp: new Date().toISOString()
    })
    // 标记这是替换连接，DISCONNECT事件中不会再次移除（因为新连接已经添加）
    oldSocketToDisconnect.data = oldSocketToDisconnect.data || {}
    oldSocketToDisconnect.data.isReplaced = true
    oldSocketToDisconnect.data.replacementSocketId = socket.id
    oldSocketToDisconnect.emit('error', { message: '检测到新连接，断开旧连接' })
    oldSocketToDisconnect.disconnect(true)
  }
  
  // 管理rtc的监听事件
  SocketRtc(socket)
  
  // 断开连接了
  socket.on(SOCKET_ON_SYS.DISCONNECT, () => {
    console.log('=== [Server] 用户断开连接 ===', {
      username: username,
      socketId: socket.id,
      room: room,
      isReplaced: socket.data?.isReplaced,
      replacementSocketId: socket.data?.replacementSocketId,
      timestamp: new Date().toISOString()
    })
    
    // 如果这是被替换的连接，新连接已经添加，不需要再次移除
    if (socket.data?.isReplaced) {
      console.log('=== [Server] 这是被替换的连接，跳过移除（新连接已添加）===', {
        username: username,
        socketId: socket.id,
        replacementSocketId: socket.data.replacementSocketId,
        room: room,
        timestamp: new Date().toISOString()
      })
      return
    }
    
    // 从房间成员列表中移除
    const roomMembersList = roomMembers.get(room)
    if (roomMembersList) {
      const index = roomMembersList.findIndex(m => m.userId === user.userId)
      if (index !== -1) {
        roomMembersList.splice(index, 1)
        console.log('=== [Server] 用户已从房间移除 ===', {
          username: username,
          socketId: socket.id,
          room: room,
          remainingMembers: roomMembersList.length,
          timestamp: new Date().toISOString()
        })
      }
      
      // 如果房间为空，清理房间数据
      if (roomMembersList.length === 0) {
        roomMembers.delete(room)
        console.log('=== [Server] 房间已清空，删除房间 ===', {
          room: room,
          timestamp: new Date().toISOString()
        })
      } else {
        // 向房间发送更新后的用户列表
        console.log('=== [Server] 发送更新后的用户列表 ===', {
          room: room,
          remainingMembers: roomMembersList.map(m => ({ username: m.username, userId: m.userId })),
          timestamp: new Date().toISOString()
        })
        io.to(room).emit(SOCKET_EMIT.SYS_USER_LIST, roomMembersList)
      }
    }
  })
})
