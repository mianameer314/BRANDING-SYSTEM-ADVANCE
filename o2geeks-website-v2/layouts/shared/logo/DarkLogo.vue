
<script setup lang="ts">
import darkPrimaryLogo from '/images/logos/DarkLogo2.svg';
</script>
<template>
    <div class="logo lh-normal">
        <NuxtLink to="/">
            <img :src="darkPrimaryLogo" alt="home" />
        </NuxtLink>
    </div>
</template>