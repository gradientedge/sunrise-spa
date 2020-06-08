/* eslint-disable no-shadow */
import productMixin from '@/mixins/productMixin';
import BasePrice from '../BasePrice/index.vue';
import InventoryAvailability from '../InventoryAvailability/index.vue';

export default {
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  components: {
    BasePrice,
    InventoryAvailability,
  },
  methods: {
    clicked() {
      // eslint-disable-next-line no-console
      console.log(this.matchingVariant.sku);
    },
  },
  mixins: [productMixin],
  computed: {
    matchingVariant() {
      // with query endpoint we cannot really determine
      return this.currentProduct.masterVariant || {};
    },
    hasMoreColors() {
      // with sunrise data it is not possible to determine
      return false;
    },
    hasInventory() {
      return this.currentProduct.masterVariant.availability;
    },
    hasDiscount() {
      return this.matchingVariant.price.discounted;
    },
    categories() {
      return this.product.categories.join(',');
    },
    hasImages() {
      return Array.isArray(this.matchingVariant.images) && this.matchingVariant.images.length > 0;
    },
  },
};
