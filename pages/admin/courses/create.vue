<script lang="ts" setup>
// import FormCourse from '~/components/admin/course/FormCourse.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})
</script>

<template>
  <div class="create-course p-8">
    <FormCourse />
  </div>
</template>
