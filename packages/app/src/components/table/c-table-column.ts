import { defineComponent, toRefs, h } from 'vue';

export default defineComponent({
  name: 'CTableColumn',
  props: {
    label: String,
    width: {
      type: [Number, String]
    },
    align: String,
    center: {
      type: Boolean,
      default: false
    },
    sort: Function,
    mobileHeaderClass: {
      type: Array,
      default: []
    }
  },
  setup(props, { slots }) {
    const { align, center } = toRefs(props);
    const className = [
      'px-3',
      'py-2',
      align.value === 'center' || center.value
        ? 'text-center'
        : align.value === 'right'
        ? 'text-right'
        : 'text-left'
    ];
    return () =>
      h(
        'td',
        {
          class: className
        },
        slots.default && slots.default(props)
      );
  }
});
