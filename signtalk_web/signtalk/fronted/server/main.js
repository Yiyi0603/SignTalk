import { SOCKET_EMIT, SOCKET_ON_SYS } from './enum.js'
import SocketRtc from './on.js'
import initApp from './config.js'

// 初始化应用
async function startServer() {
  let io = await initApp()
  // 按房间维护成员列表，避免不同房间/标签页相互影响
  const membersByRoom = new Map()

  // 监听连接
  const normalize = (str) => {
    const s = String(str || '').trim()
      .replace(/[\u3000]/g, ' ')
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    return s.toLowerCase()
  }

  io.on(SOCKET_ON_SYS.CONNECTION, (socket) => {
    const { query } = socket.handshake
    const username = normalize(query.username)
    const room = normalize(query.room)

    if (!room) {
      socket.disconnect()
      return
    }

    if (!membersByRoom.has(room)) membersByRoom.set(room, [])
    let members = membersByRoom.get(room)

    // 去重：若同名用户已存在，踢掉旧连接（避免一个人占两个名额）
    const sameNameSockets = members.filter(m => m.username === username).map(m => m.userId)
    if (sameNameSockets.length > 0) {
      members = members.filter(m => m.username !== username)
      sameNameSockets.forEach((sid) => {
        try { io.sockets.sockets.get(sid)?.disconnect(true) } catch (_) {}
      })
      membersByRoom.set(room, members)
      console.log(`${username} 重入，移除旧连接: 房间: ${room}`)
    }

    // 以“唯一用户名”计数限制两人
    const uniqueUserCount = new Set(members.map(m => m.username)).size
    if (uniqueUserCount >= 2) {
      console.log(`仅支持两人加入房间: ${room}`)
      socket.emit('room_full')
      socket.disconnect(true)
      return
    }

    // 记录成员（允许同名不同 socket 并存，由前端显示名区分）
    members.push({ userId: socket.id, username })

    socket.join(room)
    console.log(`join => room: ${room}, user: ${username}, socket: ${socket.id}`)
    // 轻微延迟后广播，避免并发加入时收到半套成员列表
    setTimeout(() => {
      const list = membersByRoom.get(room) || []
      console.log(`broadcast members => room: ${room}, members:`, list.map(m=>m.username))
      io.to(room).emit(SOCKET_EMIT.SYS_USER_LIST, list)
    }, 100)
    SocketRtc(socket)

    socket.on(SOCKET_ON_SYS.DISCONNECT, () => {
      console.log(`----${username}----(断开连接) 房间: ${room}`)
      const list = membersByRoom.get(room) || []
      const newList = list.filter(m => m.userId !== socket.id)
      if (newList.length === 0) {
        membersByRoom.delete(room)
      } else {
        membersByRoom.set(room, newList)
      }
      setTimeout(() => {
        const list = membersByRoom.get(room) || []
        console.log(`broadcast members(after disconnect) => room: ${room}, members:`, list.map(m=>m.username))
        io.to(room).emit(SOCKET_EMIT.SYS_USER_LIST, list)
      }, 50)
    })
  })
}

// 启动服务器
startServer().catch(console.error)
