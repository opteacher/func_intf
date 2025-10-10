<template>
  <FormItem
    :form="auth"
    :skey="opAry[2]"
    :mapper="opSubMapper"
    :fld-wid="24"
    @update:fprop="onFpropUpdate"
  >
    <template #addSFX>
      <a-button @click="onOperAllClick">{{ opAry[3] }}全部</a-button>
    </template>
    <template #itemLabel="{ item, index }: any">
      <b v-if="!item.prop && !item.value">可{{ opAry[3] }}所有记录</b>
      <a-space v-else>
        <a-tag>{{ index !== 0 ? getProp(relDict, item.relate) : '当' }}</a-tag>
        <a-typography-text strong>
          {{ bsOpMapper.lblDict[item.prop] }}
        </a-typography-text>
        <a-typography-text :type="item.compare === '==' ? 'success' : 'danger'">
          {{ getProp(cmpDict, item.compare) }}
        </a-typography-text>
        <a-typography-text type="secondary">{{ item.value }}</a-typography-text>
      </a-space>
    </template>
  </FormItem>
</template>

<script setup lang="ts">
import type STable from '@/types/sTable'
import Auth, { AuCond, type AuthInterface, cmpDict, relDict } from '@/types/stAuth'
import type StRcd from '@/types/stRecord'
import FormItem from '@lib/components/FormItem.vue'
import Mapper, { EdtLstMapper } from '@lib/types/mapper'
import { getProp, setProp } from '@lib/utils'
import { uniq } from 'lodash'
import { computed, reactive, type PropType } from 'vue'

const props = defineProps({
  auth: { type: Auth, required: true },
  stable: { type: Object as PropType<STable>, required: true },
  opAry: { type: Array as PropType<string[]>, required: true }
})
const emit = defineEmits(['update:auth'])
const bsOpMapper = reactive<EdtLstMapper>({
  type: 'EditList',
  lblProp: 'prop',
  lblDict: Object.fromEntries(
    Object.entries(props.stable.form).map(([value, { label }]) => [value, label])
  ),
  subProp: 'value',
  mapper: new Mapper({
    relate: {
      label: '关系符',
      type: 'Radio',
      style: 'button',
      options: Object.entries(relDict).map(([value, label]) => ({ label, value }))
    },
    prop: {
      label: '数据列',
      type: 'Select',
      options: Object.entries(props.stable.form).map(([value, { label }]) => ({ value, label })),
      onChange: (_record: any, to: any) => {
        // bsOpMapper.mapper['value'].options = uniq(
        //   (props.stable.fkRecords as StRcd[]).map(record => getProp(record.raw, to))
        // ).map(item => ({
        //   label: item,
        //   value: item
        // }))
      }
    },
    compare: {
      label: '比较符',
      type: 'Radio',
      style: 'button',
      options: Object.entries(cmpDict).map(([value, label]) => ({ label, value }))
    },
    value: {
      label: '对应值',
      type: 'SelOrIpt',
      mode: 'select'
    }
  }),
  newFun: () => ({ relate: '&&', prop: undefined, compare: '==', value: '' }),
  inline: false
} as EdtLstMapper)
const opSubMapper = computed(() =>
  Object.assign(
    {
      disabled: () => {
        const items = getProp(props.auth, props.opAry[2]) as AuCond[]
        const opAll = items.length && !items[0].prop && !items[0].value
        return opAll || getProp(props.auth, props.opAry[1])
      }
    },
    setProp(
      bsOpMapper,
      'mapper.relate.display',
      () => getProp(props.auth, props.opAry[2]).length !== 0,
      { selfChange: false }
    )
  )
)

function onFpropUpdate(auth: AuthInterface) {
  if (getProp(auth, props.opAry[2]).length === 1) {
    // 当只有一条条件的时候，关系符号设为或
    setProp(auth, props.opAry[2] + '[0].relate', '||')
  }
  emit('update:auth', setProp(props.auth, props.opAry[2], getProp(auth, props.opAry[2])))
}
function onOperAllClick() {
  setProp(props.auth, props.opAry[2], [new AuCond()])
}
</script>
