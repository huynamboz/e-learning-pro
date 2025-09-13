<script setup lang="ts">
import { FilterOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { ref } from 'vue'

interface SortOption {
  value: string
  label: string
}

interface Props {
  searchQuery?: string
  sortBy?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  sortBy: 'relevance',
})

const emit = defineEmits<{
  searchChange: [query: string]
  sortChange: [sortBy: string]
  filterClick: []
}>()

const searchValue = ref(props.searchQuery)
const selectedSort = ref(props.sortBy)

const sortOptions: SortOption[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'alphabetical', label: 'A-Z' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
]

function handleSearchChange() {
  emit('searchChange', searchValue.value)
}

function handleSortChange(value: string) {
  emit('sortChange', value)
}

function handleFilterClick() {
  emit('filterClick')
}
</script>

<template>
  <div class="flex justify-between items-center gap-10 w-full">
    <div class="flex-none w-[300px]">
      <a-input
        v-model:value="searchValue"
        placeholder="Search User"
        class="h-10 rounded-lg border border-gray-300 text-sm text-gray-600 placeholder:text-gray-600"
        @input="handleSearchChange"
      >
        <template #prefix>
          <SearchOutlined class="text-gray-600 text-base" />
        </template>
      </a-input>
    </div>

    <div class="flex justify-end items-center gap-6 flex-1">
      <div class="flex items-center gap-[15px]">
        <span class="text-base font-normal text-gray-900 leading-[1.6]">Sort By</span>
        <a-select
          v-model:value="selectedSort"
          class="min-w-[120px] h-10"
          @change="handleSortChange"
        >
          <a-select-option
            v-for="option in sortOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </a-select-option>
        </a-select>
      </div>

      <a-button
        class="h-10 px-4 border border-gray-900 rounded-lg bg-white text-gray-900 text-sm font-medium flex items-center gap-1.5 hover:border-gray-600 hover:bg-gray-50 hover:text-gray-600"
        @click="handleFilterClick"
      >
        <template #icon>
          <FilterOutlined class="text-base" />
        </template>
        Filter
      </a-button>
    </div>
  </div>
</template>

<style scoped>
 .ant-btn-default {
  height: 40px !important;
  border: 1px solid #0f172a !important;
  border-radius: 8px !important;
  display: flex !important;
  align-items: center !important;
}
.ant-btn-default:hover {
  border-color: #475569 !important;
  background-color: #f8fafc !important;
  color: #475569 !important;
}
</style>
