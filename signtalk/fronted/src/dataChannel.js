let dataChannel
const sendMessage = (username) => {
  console.log('=== [DataChannel] sendMessage 被调用 ===', {
    username: username,
    timestamp: new Date().toISOString()
  })
  const button = document.querySelector('.data-channel__button')
  const input = document.querySelector('.data-channel__input')
  if (!button || !input) {
    console.warn('=== [DataChannel] 按钮或输入框未找到 ===', {
      hasButton: !!button,
      hasInput: !!input,
      timestamp: new Date().toISOString()
    })
    return
  }
  button.disabled = false
  button.onclick = () => {
    if (!input.value) {
      console.log('=== [DataChannel] 输入为空，跳过发送 ===', {
        timestamp: new Date().toISOString()
      })
      return
    }
    const message = `${username}: ${input.value}`
    console.log('=== [DataChannel] 发送消息 ===', {
      message: message,
      dataChannelReadyState: dataChannel?.readyState,
      timestamp: new Date().toISOString()
    })
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(message)
      console.log('=== [DataChannel] 消息已发送 ===', {
        timestamp: new Date().toISOString()
      })
    } else {
      console.warn('=== [DataChannel] 数据通道未打开，无法发送 ===', {
        readyState: dataChannel?.readyState,
        timestamp: new Date().toISOString()
      })
    }
    input.value = ''
    receiveMessage(message)
  }
  console.log('=== [DataChannel] 按钮点击事件已设置 ===', {
    timestamp: new Date().toISOString()
  })
}
const receiveMessage = (message) => {
  console.log('=== [DataChannel] 收到消息 ===', {
    message: message,
    timestamp: new Date().toISOString()
  })
  const output = document.querySelector('.data-channel__output')
  if (!output) {
    console.warn('=== [DataChannel] 输出框未找到 ===', {
      timestamp: new Date().toISOString()
    })
    return
  }
  output.scrollTop = output.scrollHeight //窗口总是显示最后的内容
  output.value = output.value + message + '\r'
  console.log('=== [DataChannel] 消息已显示 ===', {
    timestamp: new Date().toISOString()
  })
}
const openDataChannel = (localPc, username) => {
  console.log('=== [DataChannel] 创建数据通道 ===', {
    username: username,
    timestamp: new Date().toISOString()
  })
  dataChannel = localPc.createDataChannel('test')
  console.log('=== [DataChannel] 数据通道已创建 ===', {
    label: dataChannel.label,
    readyState: dataChannel.readyState,
    timestamp: new Date().toISOString()
  })
  
  // datachannel通道打开 开始发送消息
  dataChannel.onopen = () => {
    console.log('=== [DataChannel] 数据通道已打开 ===', {
      readyState: dataChannel.readyState,
      timestamp: new Date().toISOString()
    })
    sendMessage(username)
  }
  
  dataChannel.onclose = () => {
    console.log('=== [DataChannel] 数据通道已关闭 ===', {
      timestamp: new Date().toISOString()
    })
  }
  
  dataChannel.onerror = (error) => {
    console.error('=== [DataChannel] 数据通道错误 ===', {
      error: error,
      timestamp: new Date().toISOString()
    })
  }
  
  localPc.ondatachannel = (event) => {
    console.log('=== [DataChannel] 收到远程数据通道 ===', {
      label: event.channel.label,
      readyState: event.channel.readyState,
      timestamp: new Date().toISOString()
    })
    // 成功拿到 RTCDataChannel
    const remoteDataChannel = event.channel
    remoteDataChannel.onopen = () => {
      console.log('=== [DataChannel] 远程数据通道已打开 ===', {
        readyState: remoteDataChannel.readyState,
        timestamp: new Date().toISOString()
      })
    }
    remoteDataChannel.onclose = () => {
      console.log('=== [DataChannel] 远程数据通道已关闭 ===', {
        timestamp: new Date().toISOString()
      })
    }
    remoteDataChannel.onerror = (error) => {
      console.error('=== [DataChannel] 远程数据通道错误 ===', {
        error: error,
        timestamp: new Date().toISOString()
      })
    }
    remoteDataChannel.onmessage = (event) => {
      console.log('=== [DataChannel] 收到远程消息 ===', {
        data: event.data,
        timestamp: new Date().toISOString()
      })
      receiveMessage(event.data)
    }
  }
  console.log('=== [DataChannel] 数据通道监听器已设置 ===', {
    timestamp: new Date().toISOString()
  })
}

export default openDataChannel