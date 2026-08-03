<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from "@iconify/vue";
const show = ref(false)

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const onScroll = () => {
  show.value = window.scrollY > 300
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>
<template>
  <Transition name="fade">
    <v-btn
      v-if="show"
      icon
      color="primary"
      size="large"
      class="scroll-to-top"
      @click="scrollToTop"
    >
      
      <Icon icon="ic:round-arrow-upward" height="25"/>
    </v-btn>
  </Transition>
</template>
