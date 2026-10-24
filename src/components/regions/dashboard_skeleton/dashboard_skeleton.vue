<script>
export default {
  name: 'GlDashboardSkeleton',
  props: {
    /**
     * Number of cards to be shown
     */
    cards: {
      type: Number,
      required: false,
      default: 3,
    },
  },
};
</script>
<template>
  <div class="row dashboard-cards">
    <div v-for="index in cards" :key="index" class="col-12 col-md-6 col-xl-4 gl-px-3">
      <div class="gl-rounded-t-default gl-bg-status-neutral gl-py-6"></div>
      <div class="dashboard-card-body card-body gl-bg-gray-50">
        <div class="row">
          <div class="col-1 gl-self-center">
            <div class="gl-rounded-full gl-bg-status-neutral gl-p-5"></div>
          </div>

          <div class="col-10 col-sm-6 gl-self-center gl-pl-6">
            <div
              class="dashboard-card-skeleton-info gl-mb-3 gl-w-full gl-bg-status-neutral gl-py-3"
            ></div>
            <div class="dashboard-card-skeleton-info gl-w-full gl-bg-status-neutral gl-py-3"></div>
          </div>

          <div class="col-sm-5 gl-hidden gl-self-center @sm:gl-block">
            <div class="dashboard-card-skeleton-info gl-w-full gl-bg-status-neutral gl-py-3"></div>
          </div>
        </div>

        <div class="dashboard-card-footer gl-mt-5 gl-bg-status-neutral gl-py-5"></div>
      </div>
    </div>
  </div>
</template>
