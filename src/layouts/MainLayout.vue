<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>
    <q-footer class="bg-white" bordered>
      <q-toolbar-title>
        <q-tabs
          class="text-grey-10"
          active-color="primary"
          indicator-color="transparent"
        >
          <q-route-tab icon="eva-home-outline" to="/" />
          <q-route-tab icon="eva-camera-outline" to="/camera" /> </q-tabs
      ></q-toolbar-title>
    </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: "MainLayout",
  data() {
    return {};
  }
};
</script>

<style lang="sass">
.q-tab__icon
  font-size: 30px;
</style>