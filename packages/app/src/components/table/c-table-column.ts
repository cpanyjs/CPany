import { defineComponent, toRefs, h } from 'vue';

export default defineComponent({
  name: 'CTableColumn',
  props: {
    label: String,
    width: {
      type: [Number, String]
    },
    align: String
  },
  setup(props, { slots }) {
    const { align } = toRefs(props);
    const style = {
      borderWidth: '0 0 1px 0'
    };
    const className = [
      'px-3',
      'py-2',
      'border-solid',
      'border-[#dbdbdb]',
      align.value === 'center'
        ? 'text-center'
        : align.value === 'right'
        ? 'text-right'
        : 'text-left'
    ];
    return () =>
      h(
        'td',
        {
          style,
          class: className
        },
        slots.default && slots.default(props)
      );
  }
});
