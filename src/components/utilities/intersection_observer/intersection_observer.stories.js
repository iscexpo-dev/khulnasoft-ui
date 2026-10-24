import GlIntersectionObserver from './intersection_observer.vue';

const components = {
  GlIntersectionObserver,
};

const commonData = () => ({
  isInView: false,
});

const commonMethods = {
  appear() {
    this.isInView = true;
  },
  disappear() {
    this.isInView = false;
  },
};

const generateItems = (startingId = 0) => {
  const items = Array.from(Array(20).keys());
  return items.map((index) => {
    const id = index + startingId + 1;

    return {
      id,
      title: `Item ${id}`,
    };
  });
};

export const Default = () => ({
  components,
  data: commonData,
  methods: commonMethods,
  computed: {
    visibility() {
      return this.isInView ? 'The observer is in view' : 'The observer is not in view';
    },
  },
  template: `
    <div style="height: 200px; overflow-y: scroll;">
      <h1>{{ visibility }}</h1>
      <p>This one is a hard one to demonstrate as it's invisible by nature.</p>
      <p>Underneath this block of text is an invisible component, <code>&lt;gl-observer /&gt;</code> that has the power to tell the vue app when it's visible, and when it's not.</p>
      <p><strong>{{ visibility }}</strong>  at the moment but if you scroll and arrange your window just right, this can be changed and will be reflected in the title.</p>
      <p :class="{'gl-text-green-600': isInView }">To make it even more clear, this line of text will be green when the element scrolls into view.</p>
      <p>This line appears just before the observer.</p>
      <gl-intersection-observer
        @appear="appear"
        @disappear="disappear"
      />
      <p>This line appears just after the observer.</p>
    </div>
  `,
});

export const BigTable = () => ({
  components,
  data() {
    return {
      values: Array(100)
        .fill(1)
        .map(() => Array(10).fill(0)),
    };
  },
  methods: {
    update(row, col, { intersectionRatio }) {
      this.$set(this.values[row], col, intersectionRatio);
    },
    disappear(row, col) {
      this.values[row][col] = 0;
    },
  },
  template: `
    <div style="height: 600px; overflow-y: scroll;">
      <table>
        <tr v-for="(cols, row) in values" :key="row">
          <td v-for="(value, col) in cols" :key="row + '_' + col">
            <gl-intersection-observer @update="update(row, col, $event)">
              <span :style="{ display: 'inline-block', width: '50px' }">{{ value.toString().substr(0, 3) }}</span>
            </gl-intersection-observer>
          </td>
        </tr>
      </table>
    </div>
    `,
});

export const LazyLoadedImage = () => ({
  components,
  data: commonData,
  methods: commonMethods,
  computed: {
    imageUrl() {
      // If the image is in view, return the high res one. If not return nothing, or a low res one
      return this.isInView
        ? '../../img/khulnasoft-summit-south-africa.jpg'
        : '../../img/khulnasoft-summit-south-africa-min.jpg';
    },
  },
  template: `
    <div>
      <p>The image below will load a low-res version until it appears on the poage, then it will switch out for a higher res version.</p>
      <p>It's also set up to switch back to the low res version when it disappears off the page. This is not what you would usually do for lazily loaded images, but it helps to demonstrate the effect in this example.</p>
      <gl-intersection-observer
        @appear="appear"
        @disappear="disappear"
      >
        <img :src="imageUrl" style="max-width: 100%; height: auto;"/>
      </gl-intersection-observer>
    </div>
  `,
});

export const InfiniteScrolling = () => ({
  components,
  data: () => ({
    items: generateItems(),
  }),
  computed: {
    lastItemId() {
      return this.items[this.items.length - 1].id;
    },
    endOfList() {
      return this.lastItemId >= 1000;
    },
  },
  methods: {
    fetchMoreItems() {
      if (!this.endOfList) {
        this.items.push(...generateItems(this.lastItemId));
      }
    },
  },
  template: `
    <div>
      <h2>Infinitely scrollable list</h2>
      <p>This data will procedurally generate 1000 items, 20 at a time</p>
      <ul>
        <li v-for="item in items" :key="item.id">{{ item.title }}</li>
      </ul>
      <gl-intersection-observer v-if="!endOfList" @appear="fetchMoreItems">
        <button @click="fetchMoreItems">Fetch more items</button>
      </gl-intersection-observer>
    </div>
`,
});

export default {
  title: 'utilities/intersection-observer',
  component: GlIntersectionObserver,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/utility-intersection-observer) for usage and implementation details.',
      },
    },
  },
  tags: ['skip-visual-test'],
};
