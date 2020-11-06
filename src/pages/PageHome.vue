<template>
  <q-page class="constrain q-pa-md">
    <!-- Allow Notifications banner -->
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div
        v-if="showNotificationsBanner && pushNotificationsSupported"
        class="banner-container bg-primary"
      >
        <div class="constrain">
          <q-banner class="bg-grey-4 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="eva-bell-outline" color="primary" />
            </template>
            Allow Notifications?
            <template v-slot:action>
              <q-btn
                class="q-px-sm"
                dense
                flat
                label="Yes"
                color="primary"
                @click="enableNotifications"
              />
              <q-btn
                class="q-px-sm"
                dense
                flat
                label="Later"
                color="primary"
                @click="showNotificationsBanner = false"
              />
              <q-btn
                class="q-px-sm"
                dense
                flat
                label="Never"
                color="primary"
                @click="neverShowNotificationsBanner"
              />
            </template>
          </q-banner>
        </div>
      </div>
    </transition>
    <!-- end Allow Notifications banner -->
    <div class="row q-col-gutter-lg">
      <!-- image posts -->
      <div class="col-12 col-md-8">
        <template v-if="!loadingPosts && posts.length > 0">
          <q-card
            v-for="(post, index) in posts"
            :key="post.id"
            class="card-post q-mb-md"
            :class="{ 'bg-red-1': post.offline }"
            flat
            bordered
          >
            <q-badge v-if="post.offline" color="red" class="absolute-top-right">
              Stored offline
            </q-badge>
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img
                    src="https://en.gravatar.com/userimage/193318394/1fdb9d1dc4c632a0d6ca5b8ecbf4afc0.jpeg"
                    alt="gravatar"
                  />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-bold">ahandlovits </q-item-label>
                <q-item-label caption>{{ post.location }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-img :src="post.imageUrl" />
            <div class="row justify-between items-center">
              <q-card-section>
                <div>{{ post.caption }}</div>
                <div class="text-caption text-grey">
                  {{ post.date | niceDate }}
                </div>
              </q-card-section>
              <q-btn
                class="q-mr-md"
                size="sm"
                round
                icon="eva-trash-2-outline"
                color="red"
                @click="deletePost(post.id, index)"
              >
                <q-tooltip>
                  Delete post
                </q-tooltip>
              </q-btn>
            </div>
          </q-card>
        </template>
        <template v-else-if="!loadingPosts && posts.length === 0">
          <h5 class="text-center text-grey">No posts yet.</h5>
        </template>
        <!-- loading skeleton -->
        <template v-else>
          <q-card flat bordered>
            <q-item>
              <q-item-section avatar>
                <q-skeleton type="QAvatar" animation="fade" size="40px" />
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <q-skeleton type="text" animation="fade" />
                </q-item-label>
                <q-item-label caption>
                  <q-skeleton type="text" animation="fade" />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-skeleton height="200px" square animation="fade" />

            <q-card-section>
              <q-skeleton type="text" class="text-subtitle2" animation="fade" />
              <q-skeleton
                type="text"
                width="50%"
                class="text-subtitle2"
                animation="fade"
              />
            </q-card-section>
          </q-card>
        </template>
        <!-- end loading skeleton -->
      </div>
      <!-- end image posts -->
      <!-- mini profile -->
      <div class="col-4 large-screen-only">
        <q-item class="fixed">
          <q-item-section avatar>
            <q-avatar size="48px">
              <img
                src="https://en.gravatar.com/userimage/193318394/1fdb9d1dc4c632a0d6ca5b8ecbf4afc0.jpeg"
                alt="gravatar"
              />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-bold">ahandlovits </q-item-label>
            <q-item-label caption>Alex Handlovits</q-item-label>
          </q-item-section>
        </q-item>
      </div>
      <!-- mini profile end -->
    </div>
  </q-page>
</template>

<script>
import { date } from "quasar";
import { openDB } from "idb";

export default {
  name: "PageHome",
  data() {
    return {
      posts: [],
      loadingPosts: false,
      showNotificationsBanner: false
    };
  },
  methods: {
    getPosts() {
      this.loadingPosts = true;
      this.$axios
        .get(`${this.$api}/posts`)
        .then(res => {
          this.posts = res.data;
          this.loadingPosts = false;
          if (!navigator.onLine) {
            this.getOfflinePosts();
          }
        })
        .catch(err => {
          this.$q.dialog({
            title: "Error",
            message: err.message
          });
          this.loadingPosts = false;
        });
    },
    getOfflinePosts() {
      openDB("workbox-background-sync").then(db => {
        db.getAll("requests")
          .then(reqs => {
            reqs.forEach(req => {
              if (req.queueName === "createPostQueue") {
                const offlinePost = new Request(
                  req.requestData.url,
                  req.requestData
                );
                offlinePost.formData().then(formData => {
                  let post = {};
                  post.id = formData.get("id");
                  post.caption = formData.get("caption");
                  post.location = formData.get("location");
                  post.date = parseInt(formData.get("date"));
                  post.offline = true;
                  // get image
                  let reader = new FileReader();
                  reader.readAsDataURL(formData.get("file"));
                  reader.onloadend = () => {
                    post.imageUrl = reader.result;
                    this.posts.unshift(post);
                  };
                });
              }
            });
          })
          .catch(err => {
            console.log("error accessing IndexedDB: ", err);
          });
      });
    },
    enableNotifications() {
      if (this.$pushNotificationsSupported) {
        console.log("");
      }
    },
    neverShowNotificationsBanner() {
      this.showNotificationsBanner = false;
      window.localStorage.setItem("neverShowNotificationsBanner", true);
    },
    async initNotificationsBanner() {
      const hideBanner = window.localStorage.getItem(
        "neverShowNotificationsBanner"
      );
      if (!hideBanner) {
        this.showNotificationsBanner = true;
      }
    },
    deletePost(id, index) {
      this.$axios
        .delete(`${this.$api}/posts/${id}`)
        .then(res => {
          console.log("res", res);
          if (res.status === 200) {
            this.$delete(this.posts, index);
            this.$q.notify({
              message: "Post deleted.",
              actions: [{ label: "Dismiss", color: "white" }]
            });
          } else {
            this.$q.notify({
              message: "Error status: " + res.status,
              color: "negative"
            });
          }
        })
        .catch(err => {
          console.log("error deleting: ", err);
          this.$q.notify({
            message: "Error",
            color: "negative"
          });
        });
    }
  },
  computed: {
    pushNotificationsSupported() {
      return this.$pushNotificationsSupported;
    }
  },
  filters: {
    niceDate(val) {
      return date.formatDate(val, "MMMM D h:mmA");
    }
  },
  mounted() {
    this.getPosts();
    // console.log("this.$serviceWorkerSupported", this.$serviceWorkerSupported);
    // console.log("$channel", this.$channel);
  },
  created() {
    this.initNotificationsBanner();
    this.$channel.onmessage = ev => {
      if (ev.data.msg === "offline-post-uploaded" && this.posts.length > 0) {
        const postCount = this.posts.filter(post => post.offline === true)
          .length;
        this.posts[postCount - 1].offline = false;
      }
    };
  }
};
</script>

<style lang="sass">
.card-post
  .q-badge
    border-top-left-radius: 0 !important
  .q-img
    min-height: 200px
</style>
