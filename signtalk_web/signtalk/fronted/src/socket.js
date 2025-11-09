import { rtcConfig } from './constants'
import { io } from 'socket.io-client'
import { SOCKET_ON_RTC, SOCKET_ON_SYS , SOCKET_EMIT } from './enum'
import openDataChannel from './dataChannel'
import { getSocketUrl } from './config/api'

// 开始接听rtc协议连接
const initSocket = ({ username, room, remoteVideoRef, localStream }) => {
  let localPc
  // 连接server 携带username和room
  const socket = io(getSocketUrl(), {
    path: '/rtc',
    query: { username, room },
    transports: ['websocket'],
  }).connect()

  // 当有人加入房间时（仅第一位发起者发送 offer）
  let offerSent = false
  socket.on(SOCKET_EMIT.SYS_USER_LIST, async (res) => {
    console.log('[日志] 房间在线成员变更:', res.map(m=>`${m.username||''}(${m.userId})`))
    if (res.length < 2) {
      let video = remoteVideoRef.value.$el
      video.srcObject = null
      offerSent = false
      return
    }
    // 选择 userId 字典序最小的作为发起者（更稳妥）
    const initiatorId = res.map(m=>m.userId).sort()[0]
    console.log('[日志] 选举发起者:', initiatorId, '当前:', socket.id)
    if (!offerSent && socket.id === initiatorId) {
      offerSent = true
      await sendOffer()
    }
    setTimeout(async () => {
      if (!localPc || localPc.signalingState === 'stable') {
        if (!offerSent && socket.id === initiatorId) {
          console.log('[日志] 兜底触发，重试发送 offer')
          offerSent = true
          await sendOffer()
        }
      }
    }, 1500)
  })

  socket.on('close', (error) => {
    console.log(error)
  })

  // 接收offer创建answer转发
  socket.on(SOCKET_ON_RTC.OFFER, async (offer) => {
    console.log('[日志] 接收到offer', offer)
    if (!localPc || localPc.signalingState === 'stable') {
      await sendAnswer(offer)
    }
  })
  // 接收answer
  socket.on(SOCKET_ON_RTC.ANSWER, async (answer) => {
    console.log('[日志] 接收到answer', answer)
    if (localPc && localPc.signalingState === 'have-local-offer') {
      await localPc.setRemoteDescription(answer)
    }
  })
  // candidate回调
  socket.on(SOCKET_ON_RTC.CANDIDATE, async ({ pc, candidate }) => {
    console.log(`[日志] 接收到${pc}candidate`, candidate)
    // 添加ice
    await localPc.addIceCandidate(candidate)
  })

  const attachRemoteTrackHandler = (pc) => {
    if (!remoteVideoRef.value) {
      console.log('[日志] remoteVideoRef 未定义，无法绑定远端流');
      return;
    }
    const video = remoteVideoRef.value.$el;
    if (!video) {
      console.log('[日志] remoteVideoRef.value.$el 未找到');
      return;
    }
    pc.ontrack = (e) => {
      const [remoteStream] = e.streams;
      if (remoteStream) {
        console.log('[日志] 收到远端流，正在设置到 video');
        video.srcObject = remoteStream;
        if (typeof video.play === 'function') {
          const ready = () => video.play().catch((err)=>{ console.log('video.play() 异常', err?.message) });
          if (video.readyState >= 2) ready(); else video.onloadedmetadata = ready;
        }
      } else {
        console.log('[日志] ontrack 触发但未获得远端流');
      }
    };
  }

  const sendOffer = async () => {
    // 初始化当前视频
    localPc = new RTCPeerConnection(rtcConfig)
    openDataChannel(localPc, username)
    attachRemoteTrackHandler(localPc)
    // 添加RTC流
    localStream.getTracks().forEach((track) => {
      localPc.addTrack(track, localStream)
    })
    // 给当前RTC流设置监听事件(协议完成回调)
    localPc.onicecandidate = (event) => {
      console.log('[日志] localPc: candidate', event.candidate, event)
      // 回调时，将自己candidate发给对方，对方可以直接addIceCandidate(candidate)添加可以获取流
      if (event.candidate)
        socket.emit(SOCKET_ON_RTC.CANDIDATE, room, {
          pc: 'local',
          candidate: event.candidate,
        })
    }

    // 发起方：创建offer(成功将offer的设置当前流，并发送给接收方)
    let offer = await localPc.createOffer()
    // 建立连接，此时就会触发onicecandidate，然后注册ontrack
    await localPc.setLocalDescription(offer)
    console.log('[日志] 发送offer', offer)
    socket.emit(SOCKET_ON_RTC.OFFER, room, offer)
  }
  const sendAnswer = async (offer) => {
    localPc = new RTCPeerConnection(rtcConfig)
    openDataChannel(localPc, username)
    attachRemoteTrackHandler(localPc)
    // 添加RTC流
    localStream.getTracks().forEach((track) => {
      localPc.addTrack(track, localStream)
    })
    // 给当前RTC流设置监听事件(协议完成回调)
    localPc.onicecandidate = (event) => {
      console.log('[日志] localPc: candidate', event.candidate, event)
      // 回调时，将自己candidate发给对方，对方可以直接addIceCandidate(candidate)添加可以获取流
      if (event.candidate)
        socket.emit(SOCKET_ON_RTC.CANDIDATE, room, {
          pc: 'remote',
          candidate: event.candidate,
        })
    }
    await localPc.setRemoteDescription(offer)
    const answer = await localPc.createAnswer()
    await localPc.setLocalDescription(answer)
    console.log('[日志] 发送answer', answer)
    socket.emit(SOCKET_ON_RTC.ANSWER, room, answer)
  }

  return socket
}

export default initSocket




