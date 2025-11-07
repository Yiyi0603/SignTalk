import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Learn from '../views/Learn.vue'
import Contact from '../views/Contact.vue'
import WordList from '../components/WordList.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/contact', name: 'Contact', component: Contact },
  {
    path: '/learn',
    name: 'Learn',
    component: Learn,
    children: [
        {
          path: '',
          name: 'word-list',
          component: WordList
        },
        {
          path: 'words/:id',  // 实际路径为 /learn/words/:id
          name: 'word-detail',
          component: () => import('../views/WordDetail.vue')
        }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router