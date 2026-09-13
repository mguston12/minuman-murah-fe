import { createRouter, createWebHistory } from "vue-router";
import Cookies from "js-cookie";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomeView.vue"),
  },
  {
    path: "/product/:slug",
    name: "product-detail",
    component: () => import("../views/ProductDetailView.vue"),
  },
  {
    path: "/products",
    name: "products",
    component: () => import("../views/ProductListView.vue"),
  },
  {
    path: "/checkout",
    name: "checkout",
    component: () => import("../views/CheckoutView2.vue"),
    meta: { requiresAuth: true }, // Butuh login
  },
  {
    path: "/account",
    component: () => import("../layouts/AccountLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/account/profile" },
      {
        path: "profile",
        name: "account-profile",
        component: () => import("../views/account/ProfileView.vue"),
      },
      {
        path: "orders",
        name: "account-orders",
        component: () => import("../views/account/OrdersView.vue"),
      },
      {
        path: "address",
        name: "account-address",
        component: () => import("../views/account/AddressView.vue"),
      },
      {
        path: "wishlist",
        name: "account-wishlist",
        component: () => import("../views/account/WishlistView.vue"),
      },
      {
        path: "/account/orders/:id",
        name: "order-detail",
        component: () => import("../views/account/OrderDetailView.vue"),
      },
    ],
  },
  // --- AUTHENTICATION ROUTES ---
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue"),
    meta: { guestOnly: true }, // Hanya untuk pengguna yang belum login
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/Register.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () => import("../views/ForgotPassword.vue"),
    meta: { guestOnly: true },
  },
  // --- INFORMATIONAL & BLOG ROUTES ---
  {
    path: "/blog",
    name: "blog",
    component: () => import("../views/BlogView.vue"),
  },
  {
    path: "/blog/:slug",
    name: "blog-detail",
    component: () => import("../views/BlogDetailView.vue"),
  },
  {
    path: "/privacy-policy",
    name: "privacy-policy",
    component: () => import("../views/PrivacyPolicyView.vue"),
  },
  {
    path: "/terms-conditions",
    name: "terms-conditions",
    component: () => import("../views/TermsAndConditionsView.vue"),
  },
  {
    path: "/about-us",
    name: "about",
    component: () => import("../views/AboutView.vue"),
  },
  {
    path: "/verify-email",
    name: "verify-email",
    component: () => import("../views/VerifyEmailView.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// --- NAVIGATION GUARD ---
router.beforeEach((to, from, next) => {
  const token = Cookies.get("auth_token");

  if (to.meta.requiresAuth && !token) {
    next({ name: "login" });
  } else if (to.meta.guestOnly && token) {
    next({ name: "account" });
  } else {
    next();
  }
});

export default router;
