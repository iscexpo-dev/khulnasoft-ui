import { extend } from '../../../vue'
import {
  SLOT_NAME_EMPTY,
  SLOT_NAME_EMPTYFILTERED,
  SLOT_NAME_TABLE_BUSY
} from '../../../constants/slots'
import { htmlOrText } from '../../../utils/html'
import { isFunction } from '../../../utils/inspect'
import { safeVueInstance } from '../../../utils/safe-vue-instance'
import { BTr } from '../tr'
import { BTd } from '../td'

// --- Props ---

export const props = {
  emptyFilteredHtml: {
    type: String,
    required: false,
    default: undefined
  },
  emptyFilteredText: {
    type: String,
    required: false,
    default: 'There are no records matching your request'
  },
  emptyHtml: {
    type: String,
    required: false,
    default: undefined
  },
  emptyText: {
    type: String,
    required: false,
    default: 'There are no records to show'
  },
  showEmpty: {
    type: Boolean,
    required: false,
    default: false
  }
}

// --- Mixin ---

// @vue/component
export const emptyMixin = extend({
  props,
  methods: {
    renderEmpty() {
      const { computedItems: items, computedBusy } = safeVueInstance(this)
      const h = this.$createElement

      let $empty = h()
      if (
        this.showEmpty &&
        (!items || items.length === 0) &&
        !(computedBusy && this.hasNormalizedSlot(SLOT_NAME_TABLE_BUSY))
      ) {
        const {
          computedFields: fields,
          isFiltered,
          emptyText,
          emptyHtml,
          emptyFilteredText,
          emptyFilteredHtml,
          tbodyTrClass,
          tbodyTrAttr
        } = this

        $empty = this.normalizeSlot(isFiltered ? SLOT_NAME_EMPTYFILTERED : SLOT_NAME_EMPTY, {
          emptyFilteredHtml,
          emptyFilteredText,
          emptyHtml,
          emptyText,
          fields,
          // Not sure why this is included, as it will always be an empty array
          items
        })

        if (!$empty) {
          $empty = h('div', {
            class: ['gl-text-center', 'gl-my-3'],
            domProps: isFiltered
              ? htmlOrText(emptyFilteredHtml, emptyFilteredText)
              : htmlOrText(emptyHtml, emptyText)
          })
        }

        $empty = h(BTd, { props: { colspan: fields.length || null } }, [
          h(
            'div',
            {
              attrs: {
                role: 'alert',
                'aria-live': 'polite'
              }
            },
            [$empty]
          )
        ])

        $empty = h(
          BTr,
          {
            staticClass: 'b-table-empty-row',
            class: [
              isFunction(tbodyTrClass)
                ? /* istanbul ignore next */ tbodyTrClass(null, 'row-empty')
                : tbodyTrClass
            ],
            attrs: isFunction(tbodyTrAttr)
              ? /* istanbul ignore next */ tbodyTrAttr(null, 'row-empty')
              : tbodyTrAttr,
            key: isFiltered ? 'b-empty-filtered-row' : 'b-empty-row'
          },
          [$empty]
        )
      }

      return $empty
    }
  }
})
