<script setup>
import {RouterView} from 'vue-router'
</script>

<template>
  <v-app class="mx-auto">
    <header>
      <!--    <nav>-->
      <!--      <RouterLink to='/'>Home</RouterLink>-->
      <!--      <RouterLink to='/about'>About</RouterLink>-->
      <!--    </nav>-->
    </header>
    <main>
      <RouterView/>
    </main>
    <v-footer>
      <v-row>
        <v-col class="text-center">{{ new Date().getFullYear() }} — <strong>Jason Talon</strong></v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>
