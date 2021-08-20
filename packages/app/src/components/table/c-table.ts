import {
  defineComponent,
  h,
  ref,
  computed,
  toRefs,
  VNode,
  resolveComponent,
  onUnmounted,
  Fragment,
  watchEffect,
  watch
} from 'vue';
import IconDown from 'virtual:vite-icons/mdi/arrow-down';
import IconUp from 'virtual:vite-icons/mdi/arrow-up';

import { isDef } from '@/utils';
import { useIsMobile, usePagination } from './utils';
import CTableColumn from './c-table-column';
import CTablePage from './c-table-page.vue';

export default defineComponent({
  name: 'CTable',
  components: {
    IconDown,
    IconUp,
    CTablePage
  },
  props: {
    data: {
      type: Array,
      default: []
    },
    mobile: {
      type: Number,
      default: 768
    },
    defaultSort: {
      type: String
    },
    defaultSortOrder: {
      type: String,
      default: 'asc'
    },
    pageSize: {
      type: Number
    },
    mobilePageSize: {
      type: Number
    }
  },
  setup(props, { slots }) {
    const {
      data,
      defaultSort,
      defaultSortOrder,
      mobile,
      pageSize,
      mobilePageSize
    } = toRefs(props);

    const { isMobile, clean } = useIsMobile(mobile);
    onUnmounted(() => clean());

    const realPageSize = computed(() =>
      !isMobile.value ? pageSize.value : mobilePageSize.value ?? pageSize.value
    );

    const isPagination = computed(() => isDef(realPageSize.value));
    const { current, pageLength, L, R, nextPage, prePage, goPage } =
      usePagination(realPageSize, data);

    const sortField = ref(defaultSort.value);
    const sortOrder = ref<'asc' | 'desc'>(
      defaultSortOrder.value as 'asc' | 'desc'
    );

    const setSortField = (label: string) => {
      sortField.value = label;
      sortOrder.value = defaultSortOrder.value as 'asc' | 'desc';
    };
    const filpSortOrder = () => {
      if (sortOrder.value === 'desc') sortOrder.value = 'asc';
      else sortOrder.value = 'desc';
    };

    const filterColumn = (slots?: VNode[]) => {
      if (!slots) return [];
      const columns: VNode[] = [];
      for (const slot of slots) {
        if (slot.type === Fragment && Array.isArray(slot.children)) {
          for (const child of slot.children) {
            if (
              child !== null &&
              typeof child === 'object' &&
              !Array.isArray(child)
            ) {
              columns.push(child);
            }
          }
        } else {
          columns.push(slot);
        }
      }
      return columns.filter((column) => column.type === CTableColumn);
    };

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

    const slicedData = computed(() => sortedData.value.slice(L.value, R.value));

    const renderPage = () =>
      h(resolveComponent('c-table-page'), {
        current: current.value,
        first: 0,
        last: pageLength.value,
        pageSize: realPageSize.value,
        nextPage,
        prePage,
        goPage,
        pageView: !isMobile.value ? 5 : 3,
        isMobile: isMobile.value
      });

    const renderDestop = () => {
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
            slots.columns &&
              filterColumn(slots.columns({ row, index: index + L.value }))
          );
        });

      return h('div', {}, [
        h(
          'table',
          {
            class: [
              'table',
              'w-full',
              'border-separate',
              'table-auto',
              'rounded'
            ]
          },
          [
            h('thead', {}, h('tr', {}, renderHead())),
            h('tbody', {}, renderBody(slicedData.value))
          ]
        ),
        isPagination.value && renderPage()
      ]);
    };

    const renderMobile = () => {
      const renderBody = () => {
        return slicedData.value.map((row, index) => {
          const columns = filterColumn(
            slots.columns &&
              slots.columns({ row, index: index + L.value, mobile: true })
          );
          return h(
            'div',
            { class: ['box', 'p-0', 'my-4'] },
            columns.map((column) => {
              const customHeader =
                (column.props && column.props['mobile-header-class']) ?? [];
              return h(
                'div',
                {
                  class: [
                    'pl-3',
                    'border',
                    'flex',
                    'flex-shrink',
                    'justify-between',
                    'justify-items-stretch'
                  ]
                },
                [
                  h(
                    'div',
                    {
                      class: [
                        'py-2',
                        'font-600',
                        'text-left',
                        'flex',
                        'items-center',
                        ...customHeader
                      ]
                    },
                    column.props?.label
                  ),
                  h(column, { class: ['block'] })
                ]
              );
            })
          );
        });
      };

      return h('div', { class: ['mobile-table'] }, [
        renderBody(),
        isPagination.value && renderPage()
      ]);
    };

    return () => (!isMobile.value ? renderDestop() : renderMobile());
  }
});
