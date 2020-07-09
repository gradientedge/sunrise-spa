import gql from 'graphql-tag';
import AttributeSelect from '../AttributeSelect/index.vue';

export default {
  components: { AttributeSelect },
  props: {
    sku: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    product: null,
    attributeTranslation: null,
  }),
  methods: {
    groupValuesByAttribute(acc, currentItem) {
      const key = currentItem.name;
      if (!acc[key]) {
        acc[key] = {
          name: currentItem.name,
          values: [],
        };
      }
      acc[key].values.push(currentItem.value || currentItem.label);
      return acc;
    },
  },
  computed: {
    attributes() {
      const { allVariants } = this.product.masterData.staged || this.product.masterData.current;
      return allVariants.map(
        ({ attributesRaw }) => attributesRaw.map(
          ({ attributeDefinition: { name, label }, value }) => ({
            name, label, value: typeof value === 'object' ? value.label : value,
          }),
        ),
      ).flat()
        .reduce(this.groupValuesByAttribute, {});
    },
    selected() {
      return this.variantCombinations
        .find(variant => variant.sku === this.sku);
    },
    variantCombinations() {
      const p = this.product.masterData.staged || this.product.masterData.current;
      return p.allVariants
        .map(({ sku, attributesRaw }) => ({
          sku,
          ...Object.fromEntries(
            attributesRaw.map(
              ({ attributeDefinition: { name }, value }) => [
                name, typeof value === 'object' ? value.label : value,
              ],
            ),
          ),
        }));
    },
  },
  apollo: {
    product: {
      query: gql`
        query VariantSelector( $sku: String!, $preview: Boolean!,$locale:Locale!) {
          product(sku: $sku) {
            id
            masterData {
              current @skip(if: $preview) {
                allVariants {
                  sku
                  attributesRaw {
                    attributeDefinition {
                      name
                      label(locale:$locale)
                    }
                    value
                  }
                }
                variant(sku: $sku) {
                  attributes {
                    ...on DB_AccessoiresProductType {
                      Farbe {
                        key
                        
                        name
                      }
                    }
                  }
                }
              }
              
              staged @include(if: $preview) {
                allVariants {
                  sku
                  attributesRaw {
                    attributeDefinition {
                      name
                      label(locale:$locale)
                    }
                    value
                  }
                }
                variant(sku: $sku) {
                  attributes {
                    ...on DB_AccessoiresProductType {
                      Farbe {
                        key
                        
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
      variables() {
        return {
          locale: this.$i18n.locale,
          sku: this.sku,
          preview: this.$route.query.preview === 'true' || false,
        };
      },
    },
    attributeName: {
      query: gql`
        query Translation($locale: Locale!, $type:String!) {
          productType(key:$type) {
            attributeDefinitions(limit:50) {
              results {
                name
                label(locale:$locale)
              }
            }
          }
        }`,
      manual: true,
      result({ data, loading }) {
        if (!loading) {
          this.attributeTranslation = data.productType.attributeDefinitions.results.reduce(
            (result, item) => result.set(item.name, item.label), new Map(),
          );
        }
      },
      variables() {
        return {
          locale: this.$i18n.locale,
          type: 'DBAccessoires',
        };
      },
    },
  },
};
