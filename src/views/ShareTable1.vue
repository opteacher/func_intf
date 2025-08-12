<script setup lang="ts">
import FlexDivider from '@lib/components/FlexDivider.vue'
import { TinyEmitter } from 'tiny-emitter'
import { computed, createVNode, nextTick, onMounted, reactive, ref } from 'vue'
import EditableTable from '@lib/components/EditableTable.vue'
import api from '@/api'
import STable, { avaCmpTypes, extraDict } from '@/types/sTable'
import Mapper, { newObjByMapper, BaseMapper, mapTypeTemps } from '@lib/types/mapper'
import Column from '@lib/types/column'
import FormDialog from '@lib/components/FormDialog.vue'
import { compoOpns, Cond, type CompoType } from '@lib/types'
import { getProp, newOne, pickOrIgnore, replaceObjProps, setProp } from '@lib/utils'
import { EditOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'

const layout = reactive({
  rgtEmitter: new TinyEmitter(),
  lftEmitter: new TinyEmitter(),
  leftWid: 200,
  rightWid: 200
})
const stableRef = ref()
const shareTable = reactive({
  seled: new STable(),
  tables: [] as STable[],
  emitter: new TinyEmitter(),
  mapper: new Mapper({
    name: {
      type: 'Input',
      label: '表格名称',
      rules: [{ required: true, message: '请输入表格名称' }]
    },
    path: {
      type: 'Cascader',
      label: '存储目录'
    },
    edtMod: {
      type: 'Radio',
      label: '表单类型',
      options: [
        { label: '直接修改', value: 'direct' },
        { label: '表单修改', value: 'form' }
      ]
    },
    usrAuth: {
      type: 'Switch',
      label: '用户授权',
      chkLabels: ['不需要', '需要']
    },
    usrReg: {
      type: 'Switch',
      label: '用户注册',
      placeholder: '允许用户自己注册',
      chkLabels: ['不允许', '允许'],
      disabled: [Cond.create('usrAuth', '!=', true)]
    }
  }),
  createDir: {
    visible: false,
    value: ''
  },
  height: 0
})
const emitter = new TinyEmitter()
const columns = computed(() =>
  Object.entries(shareTable.seled.form).map(([key, value]) =>
    setProp(new Column(value.label, key), 'mapper', value)
  )
)
const mapper = computed(() => new Mapper(shareTable.seled.form))
const addColumn = reactive({
  mapper: new Mapper({
    demo: {
      type: 'FormGroup',
      label: '演示',
      canFold: false
    },
    label: {
      type: 'Input',
      label: '列名',
      placeholder: '请输入列名（中文）',
      rules: [{ required: true, message: '必须填写列名！' }],
      onChange: onAddColChange
    },
    key: {
      type: 'Input',
      label: '唯一标识',
      placeholder: '输入标识（英文）',
      rules: [{ required: true, message: '必须填写标识！' }],
      onChange: onAddColChange
    },
    type: {
      type: 'Select',
      label: '类型',
      placeholder: '选择类型',
      options: compoOpns.filter(opn => avaCmpTypes.includes(opn.value)),
      rules: [{ required: true, message: '必须选择填入类型！' }],
      onChange: (record: any, ctype: CompoType) => {
        const tmpMapper = getProp(extraDict, ctype) || {}
        const fixMapper = Object.entries(tmpMapper).map(([key, val]) => [
          key,
          setProp(val, 'onChange', onAddColChange)
        ])
        addColumn.emitter.emit('update:mprop', {
          'extra.items': new Mapper(Object.fromEntries(fixMapper))
        })
        addColumn.emitter.emit('update:dprop', extPropsOfType(ctype))
        nextTick(() => onAddColChange(record))
      }
    },
    placeholder: {
      type: 'Input',
      label: '提示',
      placeholder: '输入表单框中提示',
      onChange: onAddColChange
    },
    'rules[0].required': {
      type: 'Switch',
      label: '必填/必选',
      onChange: onAddColChange
    },
    desc: {
      type: 'Textarea',
      label: '补充说明',
      placeholder: '输入补充说明',
      onChange: onAddColChange
    },
    extra: {
      type: 'FormGroup',
      label: '额外参数',
      canFold: false,
      display: [Cond.create('type', '!=', undefined)]
    }
  }),
  emitter: new TinyEmitter()
})

onMounted(async () => {
  shareTable.tables = await api.shareTable.stable.all()
  if (shareTable.tables.length) {
    STable.copy(shareTable.tables[0], shareTable.seled)
  }
})

function onMouseUp() {
  layout.rgtEmitter.emit('mouseup')
  layout.lftEmitter.emit('mouseup')
}
function onMouseMove(e: MouseEvent) {
  layout.rgtEmitter.emit('mousemove', e)
  layout.lftEmitter.emit('mousemove', e)
}
function onStableTabEdit(tblKey: string, action: string) {
  if (action === 'add') {
    shareTable.emitter.emit('update:visible', true)
  } else {
    Modal.confirm({
      title: '确定删除该表？',
      icon: createVNode(ExclamationCircleOutlined),
      content: '删除表的同时，数据和成员也将丢失！请再三确认！',
      onOk() {
        console.log('OK')
      }
    })
  }
}
function onStableSelect(tblKey: string) {
  STable.copy(
    shareTable.tables.find(tbl => tbl.key === tblKey),
    shareTable.seled
  )
}
function onEdtColClick(column: any) {
  addColumn.emitter.emit('update:mprop', {
    'extra.items': new Mapper(getProp(extraDict, column.mapper.type) || {})
  })
  addColumn.emitter.emit('update:visible', {
    show: true,
    object: column.mapper
  })
}
function extPropsOfType(type: CompoType) {
  return pickOrIgnore(mapTypeTemps[type](), Object.keys(new BaseMapper()))
}
function onAddColChange(record: any) {
  addColumn.emitter.emit('update:mprop', {
    'demo.items': new Mapper({ $: record })
  })
}
function onAddPathClick() {
  if (shareTable.createDir.visible) {
    shareTable.emitter.emit('update:mprop', {
      'path.options': [
        {
          label: shareTable.createDir.value,
          value: shareTable.createDir.value
        }
      ]
    })
    shareTable.createDir.visible = false
  } else {
    shareTable.createDir.visible = true
  }
}
function onDataRefresh() {
  nextTick(() => {
    shareTable.height = (stableRef.value[0].tableRef.table.$el as HTMLElement).clientHeight
  })
}
function newColumn() {
  return replaceObjProps(newOne(BaseMapper), {
    rules: [{ required: true, message: '必须输入或选择有效项！' }]
  })
}
function onAddColSubmit(form: any, callback: Function) {
  console.log(form)
  callback()
}
function addColDemoChange(show: boolean) {
  addColumn.emitter.emit('update:mprop', { 'demo.display': show })
}
</script>

<template>
  <a-layout class="h-full" @mouseup="onMouseUp" @mousemove="onMouseMove">
    <a-layout-sider theme="light" :width="layout.leftWid">Sider</a-layout-sider>
    <FlexDivider
      orientation="vertical"
      v-model:wid-hgt="layout.leftWid"
      :emitter="layout.lftEmitter"
      ctrl-side="left"
    />
    <a-layout-content class="px-2">
      <a-tabs
        class="h-full"
        v-model:activeKey="shareTable.seled.key"
        type="editable-card"
        @change="onStableSelect"
        @edit="onStableTabEdit"
      >
        <a-tab-pane
          v-for="stable in shareTable.tables"
          :key="stable.key"
          :tab="stable.name"
          class="flex"
        >
          <EditableTable
            class="flex-1"
            ref="stableRef"
            :edit-mode="stable.edtMod"
            :emitter="emitter"
            :api="api.shareTable.data(stable.key)"
            :mapper="mapper"
            :columns="columns"
            :addable="true"
            :editable="true"
            :delable="true"
            :new-fun="() => newObjByMapper(mapper)"
            @refresh="onDataRefresh"
          >
            <template v-for="col in columns" #[`${col.key}HD`]="{ column }: any">
              <a-button class="p-0 border-0" type="link" @click="() => onEdtColClick(column)">
                <template #icon><EditOutlined /></template>
                {{ column.title }}
              </a-button>
            </template>
          </EditableTable>
          <a-button
            class="bg-[#fafafa] hover:bg-[#00000010] rounded-s-none"
            type="text"
            :style="{ height: shareTable.height + 'px' }"
            @click="() => addColumn.emitter.emit('update:visible', true)"
          >
            <template #icon><PlusOutlined /></template>
          </a-button>
        </a-tab-pane>
      </a-tabs>
      <FormDialog
        title="添加列"
        :mapper="addColumn.mapper"
        :emitter="addColumn.emitter"
        :new-fun="newColumn"
        :ign-props="['$']"
        @update:visible="() => addColumn.emitter.emit('update:mprop', { 'demo.items': {} })"
        @before-submit="() => addColDemoChange(false)"
        @submit="onAddColSubmit"
      />
      <FormDialog title="添加表" :mapper="shareTable.mapper" :emitter="shareTable.emitter">
        <template #path="{ formState }: any">
          <div class="flex space-x-2">
            <a-cascader
              class="flex-[3]"
              :options="shareTable.mapper.path.options"
              :placeholder="shareTable.mapper.path.placeholder || '请选择'"
              :value="formState.path"
              change-on-select
              @change="(newVal: any) => (formState.path = newVal)"
            />
            <a-input
              v-if="shareTable.createDir.visible"
              class="flex-1"
              placeholder="输入创建的目录"
              v-model:value="shareTable.createDir.value"
            />
            <a-button type="primary" :ghost="!shareTable.createDir.visible" @click="onAddPathClick">
              创建目录
            </a-button>
            <a-button
              v-if="shareTable.createDir.visible"
              @click="() => (shareTable.createDir.visible = false)"
            >
              取消
            </a-button>
          </div>
        </template>
      </FormDialog>
    </a-layout-content>
    <FlexDivider
      orientation="vertical"
      v-model:wid-hgt="layout.rightWid"
      :emitter="layout.rgtEmitter"
      ctrl-side="right"
    />
    <a-layout-sider theme="light" :width="layout.rightWid">Sider</a-layout-sider>
  </a-layout>
</template>
