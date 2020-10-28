<template>
  <q-layout view="lHh Lpr lFf">
    <q-header bordered class="bg-white text-grey-10">
      <q-toolbar class="constrain">
        <q-btn
          icon="eva-camera-outline"
          size="18px"
          flat
          round
          dense
          to="/camera"
          class="large-screen-only q-mr-sm"
        ></q-btn>
        <q-separator spaced vertical class="large-screen-only" />
        <q-toolbar-title class="text-grand-hotel text-bold">
          Quasagram
        </q-toolbar-title>
        <q-btn
          icon="eva-home-outline"
          size="18px"
          flat
          round
          dense
          to="/"
          class="large-screen-only"
        ></q-btn>
      </q-toolbar>
    </q-header>
    <q-footer class="bg-white small-screen-only" bordered>
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

    <q-page-container class="bg-grey-1">
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
.q-toolbar
  @media (min-width: $breakpoint-sm-min)
    height: 77px

.q-toolbar__title
  @media (max-width: $breakpoint-xs-max)
    text-align: center
  font-size: 30px

.q-tab__icon
  font-size: 30px
</style>
