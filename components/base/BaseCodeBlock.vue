<script setup lang="ts">
defineProps<{
  code: string
}>()
</script>

<template>
  <pre class="theme-atom-one-dark">
              <code
class="hljs rounded-xl code-block"
              v-html="code"
/>
            </pre>
</template>

<style scoped>
:deep(.code-block *) {
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>
