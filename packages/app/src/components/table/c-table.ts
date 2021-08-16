import {
  defineComponent,
  h,
  ref,
  computed,
  toRefs,
  VNode,
  resolveComponent
} from 'vue';
import IconDown from 'virtual:vite-icons/mdi/arrow-down';
import IconUp from 'virtual:vite-icons/mdi/arrow-up';

import CTableColumn from './c-table-column';
import { isDef } from '@/utils';

export default defineComponent({
  name: 'CTable',
  components: {
    IconDown,
    IconUp
  },
  props: {
    data: {
      type: Array,
      default: []
    },
    defaultSort: {
      type: String
    },
    defaultSortOrder: {
      type: String,
      default: 'asc'
    }
  },
  setup(props, { slots }) {
    const { data, defaultSort, defaultSortOrder } = toRefs(props);

    const sortField = ref(defaultSort.value);
    const sortOrder = ref<'asc' | 'desc'>(
      defaultSortOrder.value as 'asc' | 'desc'
    );

    const setSortField = (label: string) => (sortField.value = label);
    const filpSortOrder = () => {
      if (sortOrder.value === 'desc') sortOrder.value = 'asc';
      else sortOrder.value = 'desc';
    };

    const filterColumn = (slots?: VNode[]) =>
      slots ? slots.filter((slot) => slot.type === CTableColumn) : [];

    const columns = filterColumn(slots.columns ? slots.columns({}) : []);

    const sortedData = computed(() => {
      const sorted = (data: any[]) => {
        if (isDef(sortField.value)) {
          for (const slot of columns) {
            const label = slot.props?.label ?? '';
            if (label === sortField.value) {
              const arr = data.sort(slot.props?.sort);
              return sortOrder.value === 'desc' ? arr.reverse() : arr;
            }
          }
          return data;
        } else {
          return data;
        }
      };
      return sorted(data.value);
    });

    return () => {
      const renderHead = () =>
        columns.map((column) => {
          const hasSort = isDef(column.props?.sort);
          const isActiveSort =
            hasSort && (column.props?.label ?? '') === sortField.value;

          const style = {
            width: column.props?.width,
            borderWidth: '0 0 2px 0'
          };

          const align =
            column.props?.align === 'center' ||
            (isDef(column.props?.center) && column.props?.center !== false)
              ? 'justify-center'
              : column.props?.align === 'right'
              ? 'justify-end'
              : 'justify-start';

          const className = [
            'select-none',
            'font-600',
            'px-3',
            'py-2',
            'border-solid',
            !isActiveSort ? 'border-[#dbdbdb]' : 'border-[#7a7a7a]',
            hasSort ? 'cursor-pointer' : null,
            hasSort ? 'hover:border-[#7a7a7a]' : null
          ];

          return h(
            'th',
            { style, class: className },
            h(
              'div',
              {
                class: ['flex', 'items-center', align],
                onClick: hasSort
                  ? () => {
                      if (isActiveSort) {
                        filpSortOrder();
                      } else {
                        setSortField(column.props?.label ?? '');
                      }
                    }
                  : undefined
              },
              [
                hasSort
                  ? h(
                      sortOrder.value === 'desc'
                        ? resolveComponent('icon-down')
                        : resolveComponent('icon-up'),
                      {
                        class: [!isActiveSort && 'text-transparent']
                      }
                    )
                  : '',
                h('span', {}, column.props?.label)
              ]
            )
          );
        });

      const renderBody = (data: any[]) =>
        data.map((row, index) => {
          return h(
            'tr',
            {},
            slots.columns && filterColumn(slots.columns({ row, index }))
          );
        });

      return h(
        'table',
        {
          class: ['table', 'w-full', 'border-separate', 'table-auto', 'rounded']
        },
        [
          h('thead', {}, h('tr', {}, renderHead())),
          h('tbody', {}, renderBody(sortedData.value)),
          h('tfoot', {}, [])
        ]
      );
    };
  }
});
