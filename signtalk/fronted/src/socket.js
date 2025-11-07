// 立即执行的测试日志
console.log('=== socket.js 文件已加载 ===', new Date().toISOString())

import { rtcConfig } from './constants'
import { io } from 'socket.io-client'
import { SOCKET_ON_RTC, SOCKET_ON_SYS , SOCKET_EMIT } from './enum'
import openDataChannel from './dataChannel'

const initSocket = ({ username, room, remoteVideoRef, localStream, onRemoteStream }) => {
  console.log('=== initSocket 被调用 ===', { username, room, hasRemoteVideoRef: !!remoteVideoRef, hasLocalStream: !!localStream, hasOnRemoteStream: !!onRemoteStream })
  
  // 管理多个peer connections，key为remoteSocketId
  const peerConnections = new Map()
  // 管理每个peer的ICE候选队列
  const pendingIceCandidatesMap = new Map()
  
  // 保持向后兼容的单peer模式（如果没有onRemoteStream回调）
  let localPc = null
  const pendingIceCandidates = []
  
  // 将 localPc 暴露到全局作用域（用于调试）
  // 使用唯一的标识符，避免多个实例冲突
  const globalKey = `webRTC_${username}_${room}_${Date.now()}`
  window[globalKey] = { localPc: null, socket: null }
  
  // 生产（HTTPS + 反向代理）下，优先使用与当前页面同源，走 /rtc 路径由代理转发到 3333
  // 若显式提供了 VITE_SIGNAL_HOST/PORT，则按配置拼接（默认同页协议）
  const buildSignalUrl = () => {
    const pageProtocol = (window.location.protocol === 'https:') ? 'https' : 'http'
    const envHost = import.meta.env.VITE_SIGNAL_HOST
    const envPort = import.meta.env.VITE_SIGNAL_PORT
    if (envHost) {
      const port = envPort || (pageProtocol === 'https' ? '443' : '80')
      const omitDefault = (pageProtocol === 'https' && port === '443') || (pageProtocol === 'http' && port === '80')
      return omitDefault ? `${pageProtocol}://${envHost}` : `${pageProtocol}://${envHost}:${port}`
    }
    // 无显式配置：直接使用当前页面 origin（例如 https://signtalk.lan），并依赖 path:'/rtc' 反代
    return window.location.origin
  }
  const SIGNAL_URL = buildSignalUrl()
  console.log('连接信令服务器:', SIGNAL_URL, { path: '/rtc', username, room })
  
  // 如果已存在同名socket连接，先断开（防止重复连接）
  const existingSocketKey = `socket_${username}_${room}`
  if (window[existingSocketKey]) {
    const existingSocket = window[existingSocketKey]
    if (existingSocket.connected) {
      console.log('=== [Socket] 发现已存在的连接，先断开 ===', {
        username,
        room,
        existingSocketId: existingSocket.id,
        timestamp: new Date().toISOString()
      })
      // 强制断开，不自动重连
      existingSocket.disconnect(true)
    }
    // 清理引用
    delete window[existingSocketKey]
  }
  
  const socket = io(SIGNAL_URL, {
    path: '/rtc',
    query: { username, room },
    transports: ['websocket', 'polling'],
    reconnection: false, // 禁用自动重连，避免重复连接
    // 添加forceNew选项，确保创建新连接而不是复用旧连接
    forceNew: true
  })
  
  // 保存socket引用，便于后续清理
  window[existingSocketKey] = socket
  
  // 监听断开事件，清理引用
  socket.on('disconnect', () => {
    console.log('=== [Socket] 连接已断开，清理引用 ===', {
      username,
      room,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    })
    if (window[existingSocketKey] === socket) {
      delete window[existingSocketKey]
    }
  })
  
  // 监听socket连接状态
  socket.on('connect', () => {
    console.log('=== [Socket] 连接成功 ===', {
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      room: room,
      username: username
    })
  })
  
  socket.on('connect_error', (error) => {
    console.error('=== [Socket] 连接失败 ===', {
      error: error,
      message: error.message,
      type: error.type,
      description: error.description,
      context: error.context,
      timestamp: new Date().toISOString(),
      signalUrl: SIGNAL_URL,
      path: '/rtc'
    })
    
    // 如果是 HTTP 错误，提供更多诊断信息
    if (error.message && error.message.includes('502')) {
      console.error('=== [Socket] 502 Bad Gateway 错误诊断 ===', {
        message: '反向代理无法连接到后端服务器',
        possibleCauses: [
          'Node.js 服务器未运行',
          '服务器未监听在正确的端口 (3333)',
          '反向代理配置错误',
          '防火墙阻止了连接'
        ],
        checkSteps: [
          '1. 确认 Node.js 服务器正在运行 (检查端口 3333)',
          '2. 检查反向代理配置是否正确指向 localhost:3333',
          '3. 检查服务器控制台是否有启动日志',
          '4. 尝试直接访问 http://localhost:3333/rtc/ 测试服务器是否运行'
        ],
        timestamp: new Date().toISOString()
      })
    }
  })
  
  socket.on('disconnect', (reason) => {
    console.log('=== [Socket] 断开连接 ===', {
      reason: reason,
      timestamp: new Date().toISOString()
    })
  })
  
  socket.on('reconnect', (attemptNumber) => {
    console.log('=== [Socket] 重连成功 ===', {
      attemptNumber: attemptNumber,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    })
  })
  
  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('=== [Socket] 正在尝试重连 ===', {
      attemptNumber: attemptNumber,
      timestamp: new Date().toISOString()
    })
  })
  
  socket.on('reconnect_error', (error) => {
    console.error('=== [Socket] 重连失败 ===', {
      error: error,
      timestamp: new Date().toISOString()
    })
  })
  
  socket.on('reconnect_failed', () => {
    console.error('=== [Socket] 重连最终失败 ===', {
      timestamp: new Date().toISOString()
    })
  })
  
  console.log('=== [Socket] 开始连接信令服务器 ===', {
    url: SIGNAL_URL,
    path: '/rtc',
    username: username,
    room: room,
    timestamp: new Date().toISOString()
  })
  socket.connect()

  // 检查是否可以添加 ICE 候选（单peer模式）
  const canAddIceCandidate = (pc = localPc) => {
    if (!pc) return false
    // 必须有远程描述（这是添加 ICE 候选的必要条件）
    if (!pc.remoteDescription) return false
    // 连接不能处于 closed 状态
    if (pc.signalingState === 'closed') return false
    // 只要设置了远程描述且不是 closed 状态，就可以添加 ICE 候选
    return true
  }
  
  // 为特定远程用户创建peer connection
  const createPeerConnection = (remoteSocketId, remoteUsername) => {
    if (peerConnections.has(remoteSocketId)) {
      console.log('=== [WebRTC] Peer 已存在，跳过创建 ===', {
        remoteSocketId,
        remoteUsername,
        timestamp: new Date().toISOString()
      })
      return peerConnections.get(remoteSocketId)
    }
    
    console.log('=== [WebRTC] 为远程用户创建新的 RTCPeerConnection ===', {
      remoteSocketId,
      remoteUsername,
      config: rtcConfig,
      timestamp: new Date().toISOString()
    })
    
    const pc = new RTCPeerConnection(rtcConfig)
    
    // 初始化ICE候选队列
    if (!pendingIceCandidatesMap.has(remoteSocketId)) {
      pendingIceCandidatesMap.set(remoteSocketId, [])
    }
    
    // 添加本地轨道
    const tracks = localStream.getTracks()
    console.log('=== [WebRTC] 为远程用户添加本地轨道 ===', {
      remoteSocketId,
      remoteUsername,
      trackCount: tracks.length,
      timestamp: new Date().toISOString()
    })
    tracks.forEach(track => {
      pc.addTrack(track, localStream)
    })
    
    // 处理远程轨道
    pc.ontrack = (e) => {
      try {
        console.log('=== [WebRTC] 收到远程轨道事件 ===', {
          remoteSocketId,
          remoteUsername,
          track: e.track ? { 
            kind: e.track.kind, 
            id: e.track.id,
            enabled: e.track.enabled,
            readyState: e.track.readyState
          } : null,
          streams: e.streams ? e.streams.length : 0,
          timestamp: new Date().toISOString()
        })
        
        if (e.streams && e.streams[0]) {
          const stream = e.streams[0]
          // 如果有onRemoteStream回调，使用它；否则使用旧的remoteVideoRef（向后兼容）
          if (onRemoteStream && typeof onRemoteStream === 'function') {
            onRemoteStream(stream, remoteSocketId, remoteUsername)
          } else if (remoteVideoRef && remoteVideoRef.value) {
            const video = remoteVideoRef.value.$el
            if (video) {
              video.srcObject = stream
              video.play().catch(err => {
                if (err.name !== 'AbortError') {
                  console.warn('=== [WebRTC] 播放远程视频失败 ===', err)
                }
              })
              video.dispatchEvent(new CustomEvent('remoteStreamReady'))
            }
          }
        }
      } catch (error) {
        console.error('=== [WebRTC] 处理 ontrack 事件时发生错误 ===', {
          remoteSocketId,
          error: error.name,
          message: error.message,
          timestamp: new Date().toISOString()
        })
      }
    }
    
    // ICE候选处理
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('=== [WebRTC] 生成 ICE 候选 ===', {
          remoteSocketId,
          remoteUsername,
          candidate: event.candidate.candidate.substring(0, 80) + '...',
          timestamp: new Date().toISOString()
        })
        // 发送ICE候选时包含目标socketId
        socket.emit(SOCKET_ON_RTC.CANDIDATE, room, { 
          candidate: event.candidate,
          targetSocketId: remoteSocketId,
          senderSocketId: socket.id
        })
      }
    }
    
    // 连接状态监听
    pc.onconnectionstatechange = () => {
      console.log('=== [WebRTC] 连接状态变化 ===', {
        remoteSocketId,
        remoteUsername,
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState,
        timestamp: new Date().toISOString()
      })
      
      // 如果连接失败或关闭，清理资源
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        console.log('=== [WebRTC] 连接已关闭，清理资源 ===', {
          remoteSocketId,
          remoteUsername,
          timestamp: new Date().toISOString()
        })
        pc.close()
        peerConnections.delete(remoteSocketId)
        pendingIceCandidatesMap.delete(remoteSocketId)
      }
    }
    
    pc.oniceconnectionstatechange = () => {
      console.log('=== [WebRTC] ICE 连接状态变化 ===', {
        remoteSocketId,
        remoteUsername,
        iceConnectionState: pc.iceConnectionState,
        timestamp: new Date().toISOString()
      })
    }
    
    peerConnections.set(remoteSocketId, pc)
    return pc
  }

  // 处理待处理的 ICE 候选（单peer模式）
  const processPendingIceCandidates = async (pc = localPc, queue = pendingIceCandidates) => {
    if (!canAddIceCandidate(pc)) {
      console.log('=== [WebRTC] 无法添加 ICE 候选，跳过处理队列 ===', {
        queueLength: queue.length,
        timestamp: new Date().toISOString()
      })
      return
    }
    
    console.log('=== [WebRTC] 开始处理待处理的 ICE 候选 ===', {
      queueLength: queue.length,
      timestamp: new Date().toISOString()
    })
    
    while (queue.length > 0) {
      // 再次检查，因为可能在处理过程中状态改变
      if (!canAddIceCandidate(pc)) {
        console.log('=== [WebRTC] 状态改变，停止处理队列 ===', {
          remainingQueueLength: queue.length,
          timestamp: new Date().toISOString()
        })
        break
      }
      
      const candidate = queue.shift()
      try {
        await pc.addIceCandidate(candidate)
        console.log('=== [WebRTC] 待处理的 ICE 候选添加成功 ===', {
          remainingQueueLength: queue.length,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        // 如果是 InvalidStateError，可能是状态改变了，将候选放回队列
        if (error.name === 'InvalidStateError') {
          console.log('=== [WebRTC] InvalidStateError，将候选放回队列 ===', {
            timestamp: new Date().toISOString()
          })
          queue.unshift(candidate)
          break
        } else {
          console.warn('=== [WebRTC] 添加待处理的 ICE 候选失败 ===', {
            error: error.name,
            message: error.message,
            timestamp: new Date().toISOString()
          })
        }
      }
    }
    
    console.log('=== [WebRTC] 待处理的 ICE 候选处理完成 ===', {
      remainingQueueLength: queue.length,
      timestamp: new Date().toISOString()
    })
  }
  
  // 处理特定peer的待处理ICE候选
  const processPendingIceCandidatesForPeer = async (remoteSocketId) => {
    const pc = peerConnections.get(remoteSocketId)
    const queue = pendingIceCandidatesMap.get(remoteSocketId) || []
    if (pc) {
      await processPendingIceCandidates(pc, queue)
    }
  }

  // 只初始化一次peer，不在offer/answer/事件内重复new
  const ensurePeer = () => {
    if (localPc) {
      console.log('=== [WebRTC] Peer 已存在，跳过初始化 ===', {
        connectionState: localPc.connectionState,
        iceConnectionState: localPc.iceConnectionState,
        signalingState: localPc.signalingState,
        timestamp: new Date().toISOString()
      })
      return
    }
    console.log('=== [WebRTC] 创建新的 RTCPeerConnection ===', {
      config: rtcConfig,
      timestamp: new Date().toISOString()
    })
    localPc = new RTCPeerConnection(rtcConfig)
    
    // 暴露到全局作用域（用于调试）
    window[globalKey].localPc = localPc
    window[globalKey].socket = socket
    window['webRTC_debug'] = window[globalKey] // 使用固定键便于访问
    console.log('=== [WebRTC] RTCPeerConnection 已创建并暴露到全局 ===', {
      globalKey: globalKey,
      debugKey: 'webRTC_debug',
      localDescription: localPc.localDescription?.type || 'null',
      remoteDescription: localPc.remoteDescription?.type || 'null',
      signalingState: localPc.signalingState,
      timestamp: new Date().toISOString()
    })
    openDataChannel(localPc, username)
    
    // 添加本地轨道
    const tracks = localStream.getTracks()
    console.log('=== [WebRTC] 添加本地轨道 ===', {
      trackCount: tracks.length,
      tracks: tracks.map(t => ({ 
        kind: t.kind, 
        enabled: t.enabled,
        id: t.id,
        label: t.label,
        readyState: t.readyState
      })),
      timestamp: new Date().toISOString()
    })
    tracks.forEach(track => {
      localPc.addTrack(track, localStream)
      console.log('=== [WebRTC] 轨道已添加 ===', {
        trackId: track.id,
        kind: track.kind,
        enabled: track.enabled,
        timestamp: new Date().toISOString()
      })
    })
    localPc.ontrack = (e) => {
      try {
        console.log('=== [WebRTC] 收到远程轨道事件 ===', {
          track: e.track ? { 
            kind: e.track.kind, 
            id: e.track.id,
            enabled: e.track.enabled,
            readyState: e.track.readyState,
            label: e.track.label
          } : null,
          streams: e.streams ? e.streams.length : 0,
          remoteVideoRef: !!remoteVideoRef,
          remoteVideoRefValue: !!remoteVideoRef?.value,
          remoteVideoRefEl: !!(remoteVideoRef?.value?.$el),
          timestamp: new Date().toISOString()
        })
        
        const video = remoteVideoRef.value && remoteVideoRef.value.$el
        console.log('=== [WebRTC] 视频元素检查 ===', { 
          video: !!video, 
          videoType: video ? video.tagName : null,
          videoId: video ? video.id : null,
          videoClass: video ? video.className : null,
          timestamp: new Date().toISOString()
        })
        
        if (video && e.streams && e.streams[0]) {
          const stream = e.streams[0]
          console.log('=== [WebRTC] 设置远程视频流 ===', {
            streamId: stream.id,
            active: stream.active,
            tracks: stream.getTracks().map(t => ({ 
              kind: t.kind, 
              id: t.id, 
              enabled: t.enabled,
              readyState: t.readyState,
              label: t.label
            })),
            timestamp: new Date().toISOString()
          })
          video.srcObject = stream
          console.log('=== [WebRTC] 视频 srcObject 已设置 ===', {
            videoSrcObject: !!video.srcObject,
            videoReadyState: video.readyState,
            videoVideoWidth: video.videoWidth,
            videoVideoHeight: video.videoHeight,
            timestamp: new Date().toISOString()
          })
          
          // 确保视频自动播放
          const playVideo = () => {
            try {
              // 检查 srcObject 是否仍然是当前设置的流
              if (video.srcObject === stream) {
                console.log('=== [WebRTC] 尝试播放远程视频 ===', {
                  readyState: video.readyState,
                  videoWidth: video.videoWidth,
                  videoHeight: video.videoHeight,
                  timestamp: new Date().toISOString()
                })
                const playPromise = video.play()
                if (playPromise !== undefined) {
                  playPromise.then(() => {
                    console.log('=== [WebRTC] 远程视频播放成功 ===', {
                      paused: video.paused,
                      currentTime: video.currentTime,
                      timestamp: new Date().toISOString()
                    })
                  }).catch(error => {
                    // 忽略 AbortError，这通常发生在 srcObject 被改变时
                    if (error.name !== 'AbortError') {
                      console.warn('=== [WebRTC] 播放视频失败 ===', {
                        error: error.name,
                        message: error.message,
                        timestamp: new Date().toISOString()
                      })
                    }
                  })
                }
                // 触发自定义事件，通知组件远程视频流已建立
                console.log('=== [WebRTC] 触发 remoteStreamReady 事件 ===', {
                  timestamp: new Date().toISOString()
                })
                video.dispatchEvent(new CustomEvent('remoteStreamReady'))
              } else {
                console.warn('=== [WebRTC] 视频流已改变，跳过播放 ===', {
                  timestamp: new Date().toISOString()
                })
              }
            } catch (error) {
              console.error('=== [WebRTC] 处理 canplay 事件时发生错误 ===', {
                error: error.name,
                message: error.message,
                timestamp: new Date().toISOString()
              })
            }
          }
          
          // 如果视频已经可以播放，直接播放
          if (video.readyState >= 2) {
            console.log('=== [WebRTC] 视频已准备好，直接播放 ===', {
              readyState: video.readyState,
              timestamp: new Date().toISOString()
            })
            playVideo()
          } else {
            console.log('=== [WebRTC] 等待视频准备就绪 ===', {
              readyState: video.readyState,
              timestamp: new Date().toISOString()
            })
            // 使用 once 确保只触发一次
            const handleCanPlay = () => {
              console.log('=== [WebRTC] canplay 事件触发 ===', {
                timestamp: new Date().toISOString()
              })
              playVideo()
            }
            
            // 移除旧的监听器（如果有）
            video.removeEventListener('canplay', handleCanPlay)
            video.addEventListener('canplay', handleCanPlay, { once: true })
            
            // 也监听 loadedmetadata 事件
            const handleLoadedMetadata = () => {
              console.log('=== [WebRTC] loadedmetadata 事件触发 ===', {
                timestamp: new Date().toISOString()
              })
              playVideo()
            }
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
            video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
          }
        } else {
          console.warn('=== [WebRTC] 无法设置远程视频流 ===', { 
            video: !!video, 
            streams: e.streams ? e.streams.length : 0,
            timestamp: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error('=== [WebRTC] 处理 ontrack 事件时发生错误 ===', {
          error: error.name,
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        })
      }
    }
    
    // 添加连接状态监听
    localPc.onconnectionstatechange = () => {
      console.log('=== [WebRTC] 连接状态变化 ===', {
        connectionState: localPc.connectionState,
        iceConnectionState: localPc.iceConnectionState,
        signalingState: localPc.signalingState,
        timestamp: new Date().toISOString()
      })
    }
    
    localPc.oniceconnectionstatechange = () => {
      console.log('=== [WebRTC] ICE 连接状态变化 ===', {
        iceConnectionState: localPc.iceConnectionState,
        connectionState: localPc.connectionState,
        signalingState: localPc.signalingState,
        timestamp: new Date().toISOString()
      })
    }
    localPc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('=== [WebRTC] 生成 ICE 候选 ===', {
          candidate: event.candidate.candidate.substring(0, 80) + '...',
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          sdpMid: event.candidate.sdpMid,
          timestamp: new Date().toISOString()
        })
        socket.emit(SOCKET_ON_RTC.CANDIDATE, room, { candidate: event.candidate });
        console.log('=== [WebRTC] ICE 候选已发送 ===', {
          room: room,
          timestamp: new Date().toISOString()
        })
      } else {
        console.log('=== [WebRTC] 所有 ICE 候选已收集完成 ===', {
          timestamp: new Date().toISOString()
        })
      }
    }
    
    // 添加ICE收集完成监听
    localPc.onicegatheringstatechange = () => {
      console.log('=== [WebRTC] ICE 收集状态变化 ===', {
        iceGatheringState: localPc.iceGatheringState,
        timestamp: new Date().toISOString()
      })
    }
    
    // 添加信令状态变化监听
    localPc.onsignalingstatechange = () => {
      console.log('=== [WebRTC] 信令状态变化 ===', {
        signalingState: localPc.signalingState,
        localDescription: localPc.localDescription?.type || 'null',
        remoteDescription: localPc.remoteDescription?.type || 'null',
        timestamp: new Date().toISOString()
      })
    }
  }

  // sys_user_list 处理多用户连接
  socket.on(SOCKET_EMIT.SYS_USER_LIST, async (list) => {
    try {
      console.log('=== [Socket] 收到用户列表 ===', {
        list: list,
        listLength: list.length,
        currentUsername: username,
        currentSocketId: socket.id,
        hasOnRemoteStream: !!onRemoteStream,
        peerConnectionsSize: peerConnections.size,
        timestamp: new Date().toISOString()
      })
      
      // 找到当前用户在列表中的位置
      const currentUserIndex = list.findIndex(u => u.userId === socket.id || u.username === username)
      const otherUsers = list.filter((u, index) => index !== currentUserIndex)
      
      console.log('=== [Socket] 处理用户列表，找到其他用户 ===', {
        currentUserIndex,
        otherUsersCount: otherUsers.length,
        otherUsers: otherUsers.map(u => ({ userId: u.userId, username: u.username })),
        timestamp: new Date().toISOString()
      })
      
      // 如果只有一个用户或没有其他用户，清理所有连接
      if (otherUsers.length === 0) {
        console.log('=== [Socket] 没有其他用户，清理所有连接 ===', {
          timestamp: new Date().toISOString()
        })
        // 清理所有peer connections
        peerConnections.forEach((pc, remoteSocketId) => {
          pc.close()
          peerConnections.delete(remoteSocketId)
          pendingIceCandidatesMap.delete(remoteSocketId)
        })
        // 清理单peer模式
        if (localPc) {
          localPc.close()
          localPc = null
        }
        if (remoteVideoRef && remoteVideoRef.value) {
          const video = remoteVideoRef.value.$el
          if (video) {
            video.srcObject = null
          }
        }
        return
      }
      
      // 清理已离开的用户的连接
      const currentRemoteSocketIds = new Set(otherUsers.map(u => u.userId))
      peerConnections.forEach((pc, remoteSocketId) => {
        if (!currentRemoteSocketIds.has(remoteSocketId)) {
          console.log('=== [Socket] 用户已离开，清理连接 ===', {
            remoteSocketId,
            timestamp: new Date().toISOString()
          })
          pc.close()
          peerConnections.delete(remoteSocketId)
          pendingIceCandidatesMap.delete(remoteSocketId)
          // 如果有onRemoteStream回调，可以通知它清理视频
          if (onRemoteStream) {
            // 可以传递null stream来通知清理
            try {
              onRemoteStream(null, remoteSocketId, null)
            } catch (e) {
              console.warn('清理远程视频时出错:', e)
            }
          }
        }
      })
      
      // 为每个其他用户创建或保持连接（优先使用多peer模式）
      // 如果有onRemoteStream回调，强制使用多peer模式
      if (onRemoteStream || otherUsers.length > 1) {
        for (const otherUser of otherUsers) {
          const remoteSocketId = otherUser.userId
          const remoteUsername = otherUser.username
          
          // 如果连接已存在，跳过
          if (peerConnections.has(remoteSocketId)) {
            console.log('=== [Socket] 连接已存在，跳过 ===', {
              remoteSocketId,
              remoteUsername,
              timestamp: new Date().toISOString()
            })
            continue
          }
          
          // 创建新的peer connection
          const pc = createPeerConnection(remoteSocketId, remoteUsername)
          
          // 如果当前用户的socketId在字典序上小于远程用户，则创建offer
          // 这样可以确保只有一方创建offer，避免冲突
          if (socket.id < remoteSocketId) {
            console.log('=== [WebRTC] 创建 OFFER 给远程用户（多peer模式）===', {
              remoteSocketId,
              remoteUsername,
              currentSocketId: socket.id,
              timestamp: new Date().toISOString()
            })
            
            try {
              const offer = await pc.createOffer()
              await pc.setLocalDescription(offer)
              // 发送offer时包含目标socketId
              socket.emit(SOCKET_ON_RTC.OFFER, room, {
                offer: offer,
                targetSocketId: remoteSocketId,
                senderSocketId: socket.id,
                senderUsername: username
              })
              console.log('=== [WebRTC] OFFER 已发送（多peer模式）===', {
                remoteSocketId,
                remoteUsername,
                timestamp: new Date().toISOString()
              })
            } catch (error) {
              console.error('=== [WebRTC] 创建或发送 OFFER 失败 ===', {
                remoteSocketId,
                remoteUsername,
                error: error.name,
                message: error.message,
                timestamp: new Date().toISOString()
              })
            }
          } else {
            console.log('=== [Socket] 等待对方创建 OFFER ===', {
              remoteSocketId,
              remoteUsername,
              currentSocketId: socket.id,
              timestamp: new Date().toISOString()
            })
          }
        }
      }
      
      // 向后兼容：只有在没有onRemoteStream且没有创建任何多peer连接时才使用单peer模式
      // 注意：这个逻辑应该只在真正需要向后兼容时使用，不应该干扰多peer模式
      // 如果已经有peer连接，或者有onRemoteStream回调，就不应该使用单peer模式
      if (!onRemoteStream && peerConnections.size === 0 && list.length === 2 && username === list[1]?.username) {
        console.log('=== [WebRTC] 使用向后兼容的单peer模式创建 OFFER ===', {
          hasOnRemoteStream: !!onRemoteStream,
          peerConnectionsSize: peerConnections.size,
          timestamp: new Date().toISOString()
        })
        ensurePeer()
        const offer = await localPc.createOffer()
        await localPc.setLocalDescription(offer)
        socket.emit(SOCKET_ON_RTC.OFFER, room, offer)
      } else if (onRemoteStream && peerConnections.size === 0 && otherUsers.length > 0) {
        // 如果有onRemoteStream但没有创建peer连接，说明可能有问题，记录警告
        console.warn('=== [WebRTC] 警告：有onRemoteStream回调但没有创建任何peer连接 ===', {
          otherUsersCount: otherUsers.length,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('=== [Socket] 处理用户列表时发生错误 ===', {
        error: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    }
  });
  // 处理收到的OFFER（支持多peer模式）
  socket.on(SOCKET_ON_RTC.OFFER, async (data) => {
    try {
      // 支持新格式（包含targetSocketId）和旧格式（直接是offer对象）
      let offerData, senderSocketId, targetSocketId, senderUsername
      if (data && data.offer) {
        // 新格式：多peer模式
        offerData = data.offer
        senderSocketId = data.senderSocketId
        targetSocketId = data.targetSocketId
        senderUsername = data.senderUsername
      } else {
        // 旧格式：单peer模式（向后兼容）
        offerData = data
        senderSocketId = null
        targetSocketId = null
      }
      
      console.log('=== [WebRTC] 收到 OFFER ===', {
        senderSocketId,
        targetSocketId,
        senderUsername,
        offerType: offerData.type,
        sdp: offerData.sdp?.substring(0, 100) + '...',
        timestamp: new Date().toISOString()
      })
      
      // 如果是多peer模式
      if (senderSocketId && targetSocketId === socket.id) {
        // 确保peer connection存在
        let pc = peerConnections.get(senderSocketId)
        if (!pc) {
          console.log('=== [WebRTC] 为发送者创建peer connection ===', {
            senderSocketId,
            senderUsername,
            timestamp: new Date().toISOString()
          })
          pc = createPeerConnection(senderSocketId, senderUsername || '')
        }
        
        if (pc.signalingState !== 'stable') {
          console.log('=== [WebRTC] Signaling state 不是 stable，跳过 ===', {
            senderSocketId,
            signalingState: pc.signalingState,
            timestamp: new Date().toISOString()
          })
          return
        }
        
        await pc.setRemoteDescription(offerData)
        await processPendingIceCandidatesForPeer(senderSocketId)
        
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        
        // 发送answer时包含目标socketId
        socket.emit(SOCKET_ON_RTC.ANSWER, room, {
          answer: answer,
          targetSocketId: senderSocketId,
          senderSocketId: socket.id,
          senderUsername: username
        })
        
        console.log('=== [WebRTC] ANSWER 已发送 ===', {
          senderSocketId,
          timestamp: new Date().toISOString()
        })
      } else {
        // 向后兼容：单peer模式
        ensurePeer()
        if (localPc.signalingState !== 'stable') {
          console.log('=== [WebRTC] Signaling state 不是 stable，跳过 ===', {
            signalingState: localPc.signalingState,
            timestamp: new Date().toISOString()
          })
          return
        }
        
        await localPc.setRemoteDescription(offerData)
        await processPendingIceCandidates()
        const answer = await localPc.createAnswer()
        await localPc.setLocalDescription(answer)
        socket.emit(SOCKET_ON_RTC.ANSWER, room, answer)
      }
    } catch (error) {
      console.error('=== [WebRTC] 处理 OFFER 失败 ===', {
        error: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    }
  })
  socket.on(SOCKET_ON_RTC.ANSWER, async (data) => {
    try {
      // 支持新格式（包含targetSocketId）和旧格式（直接是answer对象）
      let answerData, senderSocketId, targetSocketId
      if (data && data.answer) {
        // 新格式：多peer模式
        answerData = data.answer
        senderSocketId = data.senderSocketId
        targetSocketId = data.targetSocketId
      } else {
        // 旧格式：单peer模式（向后兼容）
        answerData = data
        senderSocketId = null
        targetSocketId = null
      }
      
      console.log('=== [WebRTC] 收到 ANSWER ===', {
        senderSocketId,
        targetSocketId,
        answerType: answerData.type,
        sdp: answerData.sdp?.substring(0, 100) + '...',
        timestamp: new Date().toISOString()
      })
      
      // 如果是多peer模式
      if (senderSocketId && targetSocketId === socket.id) {
        const pc = peerConnections.get(senderSocketId)
        if (!pc) {
          console.warn('=== [WebRTC] 收到ANSWER但peer connection不存在 ===', {
            senderSocketId,
            timestamp: new Date().toISOString()
          })
          return
        }
        
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(answerData)
          await processPendingIceCandidatesForPeer(senderSocketId)
          console.log('=== [WebRTC] ANSWER 处理完成 ===', {
            senderSocketId,
            signalingState: pc.signalingState,
            timestamp: new Date().toISOString()
          })
        } else {
          console.log('=== [WebRTC] Signaling state 不是 have-local-offer，跳过 ===', {
            senderSocketId,
            signalingState: pc.signalingState,
            timestamp: new Date().toISOString()
          })
        }
      } else {
        // 向后兼容：单peer模式
        ensurePeer()
        if (localPc.signalingState === 'have-local-offer') {
          await localPc.setRemoteDescription(answerData)
          await processPendingIceCandidates()
        } else {
          console.log('=== [WebRTC] Signaling state 不是 have-local-offer，跳过 ===', {
            signalingState: localPc.signalingState,
            timestamp: new Date().toISOString()
          })
        }
      }
    } catch (error) {
      console.error('=== [WebRTC] 处理 ANSWER 失败 ===', {
        error: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    }
  })
  socket.on(SOCKET_ON_RTC.CANDIDATE, async (data) => {
    try {
      // 支持新格式（包含targetSocketId）和旧格式（直接是candidate对象）
      let candidateData, senderSocketId, targetSocketId
      if (data && data.candidate) {
        // 新格式：多peer模式
        candidateData = data.candidate
        senderSocketId = data.senderSocketId
        targetSocketId = data.targetSocketId
      } else if (data && data.candidate === undefined && data.senderSocketId) {
        // 可能是新格式但candidate在data对象中
        candidateData = data.candidate
        senderSocketId = data.senderSocketId
        targetSocketId = data.targetSocketId
      } else {
        // 旧格式：单peer模式（向后兼容）
        candidateData = data.candidate || data
        senderSocketId = null
        targetSocketId = null
      }
      
      if (!candidateData) {
        console.log('=== [WebRTC] 收到空的 ICE 候选 ===', {
          timestamp: new Date().toISOString()
        })
        return
      }
      
      console.log('=== [WebRTC] 收到 ICE 候选 ===', {
        senderSocketId,
        targetSocketId,
        candidate: candidateData.candidate ? candidateData.candidate.substring(0, 80) + '...' : 'null',
        timestamp: new Date().toISOString()
      })
      
      // 如果是多peer模式
      if (senderSocketId && targetSocketId === socket.id) {
        const pc = peerConnections.get(senderSocketId)
        if (!pc) {
          console.warn('=== [WebRTC] 收到ICE候选但peer connection不存在，加入队列 ===', {
            senderSocketId,
            timestamp: new Date().toISOString()
          })
          // 确保队列存在
          if (!pendingIceCandidatesMap.has(senderSocketId)) {
            pendingIceCandidatesMap.set(senderSocketId, [])
          }
          pendingIceCandidatesMap.get(senderSocketId).push(candidateData)
          return
        }
        
        const queue = pendingIceCandidatesMap.get(senderSocketId) || []
        
        if (canAddIceCandidate(pc)) {
          try {
            if (!canAddIceCandidate(pc)) {
              queue.push(candidateData)
              return
            }
            await pc.addIceCandidate(candidateData)
            console.log('=== [WebRTC] ICE 候选添加成功 ===', {
              senderSocketId,
              pendingQueueLength: queue.length,
              timestamp: new Date().toISOString()
            })
          } catch (error) {
            if (error.name === 'InvalidStateError') {
              queue.push(candidateData)
            } else {
              console.warn('=== [WebRTC] 添加 ICE 候选失败 ===', {
                senderSocketId,
                error: error.name,
                message: error.message,
                timestamp: new Date().toISOString()
              })
            }
          }
        } else {
          queue.push(candidateData)
        }
      } else {
        // 向后兼容：单peer模式
        ensurePeer()
        if (!canAddIceCandidate()) {
          pendingIceCandidates.push(candidateData)
          return
        }
        
        try {
          if (!canAddIceCandidate()) {
            pendingIceCandidates.push(candidateData)
            return
          }
          await localPc.addIceCandidate(candidateData)
        } catch (error) {
          if (error.name === 'InvalidStateError') {
            pendingIceCandidates.push(candidateData)
          } else {
            console.warn('=== [WebRTC] 添加 ICE 候选失败 ===', {
              error: error.name,
              message: error.message,
              timestamp: new Date().toISOString()
            })
          }
        }
      }
    } catch (error) {
      console.error('=== [WebRTC] 处理 ICE 候选时发生错误 ===', {
        error: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    }
  });
  socket.on('close', (error) => {
    console.log('=== [Socket] 收到 close 事件 ===', {
      error: error,
      timestamp: new Date().toISOString()
    })
    if (localPc) {
      console.log('=== [WebRTC] 关闭 PeerConnection ===', {
        connectionState: localPc.connectionState,
        timestamp: new Date().toISOString()
      })
      localPc.close();
      localPc = null;
      // 清理全局引用
      if (window[globalKey]) {
        window[globalKey].localPc = null
        window[globalKey].socket = null
      }
      if (window.webRTC_debug === window[globalKey]) {
        window.webRTC_debug = null
      }
    }
    const video = remoteVideoRef.value && remoteVideoRef.value.$el;
    if (video) {
      video.srcObject = null
      console.log('=== [WebRTC] 远程视频已清除 ===', {
        timestamp: new Date().toISOString()
      })
    }
  })
  return socket
}

// 全局诊断函数（用于调试）
window.diagnoseWebRTC = function() {
  console.log('=== WebRTC 诊断工具 ===\n');
  
  const debug = window.webRTC_debug;
  if (!debug) {
    console.log('❌ 未找到 WebRTC 调试对象');
    console.log('提示：确保已经初始化 Socket.IO 连接');
    return;
  }
  
  const pc = debug.localPc;
  const socket = debug.socket;
  
  if (!pc) {
    console.log('❌ RTCPeerConnection 未创建');
    console.log('提示：等待用户加入房间或创建 OFFER');
    return;
  }
  
  console.log('✅ 找到 RTCPeerConnection 对象\n');
  
  // 连接状态
  console.log('📊 连接状态：');
  console.log('  - connectionState:', pc.connectionState);
  console.log('  - iceConnectionState:', pc.iceConnectionState);
  console.log('  - signalingState:', pc.signalingState);
  console.log('');
  
  // 描述信息
  console.log('📝 描述信息：');
  console.log('  - localDescription:', pc.localDescription?.type || 'null');
  if (pc.localDescription) {
    console.log('    SDP 长度:', pc.localDescription.sdp.length);
  }
  console.log('  - remoteDescription:', pc.remoteDescription?.type || 'null');
  if (pc.remoteDescription) {
    console.log('    SDP 长度:', pc.remoteDescription.sdp.length);
  }
  console.log('');
  
  // 轨道信息
  const senders = pc.getSenders();
  const receivers = pc.getReceivers();
  console.log('🎥 轨道信息：');
  console.log('  - 发送器数量:', senders.length);
  senders.forEach((sender, i) => {
    const track = sender.track;
    console.log(`    发送器 ${i + 1}:`, {
      kind: track?.kind,
      enabled: track?.enabled,
      readyState: track?.readyState,
      id: track?.id
    });
  });
  console.log('  - 接收器数量:', receivers.length);
  receivers.forEach((receiver, i) => {
    const track = receiver.track;
    console.log(`    接收器 ${i + 1}:`, {
      kind: track?.kind,
      enabled: track?.enabled,
      readyState: track?.readyState,
      id: track?.id
    });
  });
  console.log('');
  
  // Socket.IO 状态
  if (socket) {
    console.log('🔌 Socket.IO 状态：');
    console.log('  - connected:', socket.connected);
    console.log('  - id:', socket.id);
    console.log('');
  }
  
  // 诊断建议
  console.log('💡 诊断建议：');
  if (pc.iceConnectionState === 'failed') {
    console.log('  ⚠️  ICE 连接失败，可能是 NAT/防火墙问题');
  } else if (pc.iceConnectionState === 'checking') {
    console.log('  ⏳ ICE 连接正在检查中...');
  } else if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
    console.log('  ✅ ICE 连接成功');
    if (receivers.length === 0) {
      console.log('  ⚠️  但没有收到远程轨道，可能是远程端没有发送轨道');
    }
  }
  
  if (!pc.remoteDescription) {
    console.log('  ⚠️  远程描述未设置，可能是 OFFER/ANSWER 交换失败');
  }
  
  if (pc.signalingState !== 'stable') {
    console.log('  ⏳ 信令状态:', pc.signalingState, '(正在交换中)');
  }
  
  console.log('\n=== 诊断完成 ===');
  console.log('提示：使用 window.webRTC_debug.localPc 访问 RTCPeerConnection 对象');
};

export default initSocket
