<template>
  <nav class="nav-container">
    <router-link to="/" class="nav-link">主页</router-link>
    <router-link to="/contact" class="nav-link">双向沟通</router-link>
    <router-link to="/learn" class="nav-link">手语学习</router-link>
  </nav>
</template>

<script setup>
const handlePaint = () => {
  // 添加你的点击逻辑
  console.log('Paint action triggered')
}
</script>

<style scoped>
.nav-container {
  position: fixed;
  top: 20px;
  right: 40px;
  display: flex;
  gap: 40px;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-size: 20px;
  font-weight: bold;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #42b983;
}

.nav-link.router-link-exact-active {
  color: #42b983;
}
</style>