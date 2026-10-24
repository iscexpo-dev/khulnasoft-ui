import { extend } from '../../../vue'
import { identity } from '../../../utils/identity'
import { isBoolean } from '../../../utils/inspect'
import { safeVueInstance } from '../../../utils/safe-vue-instance'
import { toString } from '../../../utils/string'
import { attrsMixin } from '../../../mixins/attrs'

// Main `<table>` render mixin
// Includes all main table styling options

// --- Props ---

export const props = {
  bordered: {
    type: Boolean,
    required: false,
    default: false
  },
  borderless: {
    type: Boolean,
    required: false,
    default: false
  },
  captionTop: {
    type: Boolean,
    required: false,
    default: false
  },
  dark: {
    type: Boolean,
    required: false,
    default: false
  },
  fixed: {
    type: Boolean,
    required: false,
    default: false
  },
  hover: {
    type: Boolean,
    required: false,
    default: false
  },
  noBorderCollapse: {
    type: Boolean,
    required: false,
    default: false
  },
  outlined: {
    type: Boolean,
    required: false,
    default: false
  },
  responsive: {
    type: [Boolean, String],
    required: false,
    default: false
  },
  small: {
    type: Boolean,
    required: false,
    default: false
  },
  // If a string, it is assumed to be the table `max-height` value
  stickyHeader: {
    type: [Boolean, String],
    required: false,
    default: false
  },
  striped: {
    type: Boolean,
    required: false,
    default: false
  },
  tableClass: {
    type: [Array, Object, String],
    required: false,
    default: undefined
  },
  tableVariant: {
    type: String,
    required: false,
    default: undefined
  }
}

// --- Mixin ---

// @vue/component
export const tableRendererMixin = extend({
  mixins: [attrsMixin],
  provide() {
    return {
      getBvTable: () => this
    }
  },
  // Don't place attributes on root element automatically,
  // as table could be wrapped in responsive `<div>`
  inheritAttrs: false,
  props,
  computed: {
    isTableSimple() {
      return false
    },
    // Layout related computed props
    isResponsive() {
      const { responsive } = this
      return responsive === '' ? true : responsive
    },
    isStickyHeader() {
      let { stickyHeader } = this
      stickyHeader = stickyHeader === '' ? true : stickyHeader
      return this.isStacked ? false : stickyHeader
    },
    wrapperClasses() {
      const { isResponsive } = this
      return [
        this.isStickyHeader ? 'b-table-sticky-header' : '',
        isResponsive === true
          ? 'table-responsive'
          : isResponsive
            ? `table-responsive table-responsive-${this.responsive}`
            : ''
      ].filter(identity)
    },
    wrapperStyles() {
      const { isStickyHeader } = this
      return isStickyHeader && !isBoolean(isStickyHeader) ? { maxHeight: isStickyHeader } : {}
    },
    tableClasses() {
      let {
        hover,
        tableVariant,
        selectableTableClasses,
        stackedTableClasses,
        tableClass,
        computedBusy
      } = safeVueInstance(this)
      hover = this.isTableSimple ? hover : hover && this.computedItems.length > 0 && !computedBusy

      return [
        // User supplied classes
        tableClass,
        // Styling classes
        {
          'table-striped': this.striped,
          'table-hover': hover,
          'table-dark': this.dark,
          'table-bordered': this.bordered,
          'table-borderless': this.borderless,
          'table-sm': this.small,
          // The following are b-table custom styles
          'gl-border': this.outlined,
          'b-table-fixed': this.fixed,
          'b-table-caption-top': this.captionTop,
          'b-table-no-border-collapse': this.noBorderCollapse
        },
        tableVariant ? `${this.dark ? 'bg' : 'table'}-${tableVariant}` : '',
        // Stacked table classes
        stackedTableClasses,
        // Selectable classes
        selectableTableClasses
      ]
    },
    tableAttrs() {
      const {
        computedItems: items,
        filteredItems,
        computedFields: fields,
        selectableTableAttrs,
        computedBusy
      } = safeVueInstance(this)

      const ariaAttrs = this.isTableSimple
        ? {}
        : {
            'aria-busy': toString(computedBusy),
            'aria-colcount': toString(fields.length),
            // Preserve user supplied `aria-describedby`, if provided
            'aria-describedby':
              this.bvAttrs['aria-describedby'] || this.$refs.caption ? this.captionId : null
          }

      const rowCount =
        items && filteredItems && filteredItems.length > items.length
          ? toString(filteredItems.length)
          : null

      return {
        // We set `aria-rowcount` before merging in `$attrs`,
        // in case user has supplied their own
        'aria-rowcount': rowCount,
        // Merge in user supplied `$attrs` if any
        ...this.bvAttrs,
        // Now we can override any `$attrs` here
        id: this.safeId(),
        role: this.bvAttrs.role || 'table',
        ...ariaAttrs,
        ...selectableTableAttrs
      }
    }
  },
  render(h) {
    const {
      wrapperClasses,
      renderCaption,
      renderColgroup,
      renderThead,
      renderTbody,
      renderTfoot
    } = safeVueInstance(this)

    const $content = []
    if (this.isTableSimple) {
      $content.push(this.normalizeSlot())
    } else {
      // Build the `<caption>` (from caption mixin)
      $content.push(renderCaption ? renderCaption() : null)

      // Build the `<colgroup>`
      $content.push(renderColgroup ? renderColgroup() : null)

      // Build the `<thead>`
      $content.push(renderThead ? renderThead() : null)

      // Build the `<tbody>`
      $content.push(renderTbody ? renderTbody() : null)

      // Build the `<tfoot>`
      $content.push(renderTfoot ? renderTfoot() : null)
    }

    // Assemble `<table>`
    const $table = h(
      'table',
      {
        staticClass: 'table b-table',
        class: this.tableClasses,
        attrs: this.tableAttrs,
        key: 'b-table'
      },
      $content.filter(identity)
    )

    // Add responsive/sticky wrapper if needed and return table
    return wrapperClasses.length > 0
      ? h(
          'div',
          {
            class: wrapperClasses,
            style: this.wrapperStyles,
            key: 'wrap'
          },
          [$table]
        )
      : $table
  }
})
