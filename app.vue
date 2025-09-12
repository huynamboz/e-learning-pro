<script setup lang="ts"></script>

<template>
  <a-config-provider :theme="{ token: { colorPrimary: '#49ba61' }, hashed: false }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </a-config-provider>
</template>
