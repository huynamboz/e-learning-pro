<script setup lang="ts">
import { addDays, formatDate, VueCal } from 'vue-cal'
import 'vue-cal/style'
// import '@/assets/css/custom.css'

interface CalendarEvent {
  start: string
  end: string
  title: string
  class?: string
  content?: string
  background?: boolean
  deletable?: boolean
  resizable?: boolean
  schedule?: number
}

interface DemoExample {
  events: CalendarEvent[]
}
const ready: Ref<boolean> = ref(false)

const data: Ref<DemoExample> = ref({
  editable: false,
  events: [],
})

const selectedDate: Ref<Date> = ref(new Date())
const viewDate: Ref<Date> = ref(new Date())

// Get the Monday of the real time current week.
const previousFirstDayOfWeek = computed((): Date => {
  return new Date(new Date().setDate(new Date().getDate() - (new Date().getDay() + 6) % 7))
})

const monday: string = formatDate(previousFirstDayOfWeek.value)
const tuesday: string = formatDate(addDays(previousFirstDayOfWeek.value, 1))
const thursday: string = formatDate(addDays(previousFirstDayOfWeek.value, 3))
const friday: string = formatDate(addDays(previousFirstDayOfWeek.value, 4))

data.value.events.push(
  {
    start: `${monday} 08:30`,
    end: `${monday} 14:30`,
    title: 'Health Checkup',
    resizable: false,
    schedule: 1,
  },
  {
    start: `${tuesday} 08:00`,
    end: `${tuesday} 10:00`,
    title: 'Eye Surgery',
    resizable: false,
    schedule: 2,
  },
  {
    start: `${thursday} 09:00`,
    end: `${thursday} 11:30`,
    title: 'Follow Up',
    resizable: false,
    schedule: 1,
  },
  {
    start: `${friday} 16:30`,
    end: `${friday} 18:30`,
    title: 'Eye Surgery',
    resizable: false,
    schedule: 2,
  },
)

onMounted(() => {
  setTimeout(() => {
    ready.value = true
  }, 400)
})
</script>

<template>
  <div class="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-2 h-full max-h-[calc(100vh-100px)] px-4 lg:px-8 pt-2">
    <!-- Date picker and upcoming events - stack on mobile -->
    <div class="flex flex-col gap-2.5 p-4 lg:p-8 border border-[#E2E8F0] shadow-[0px_4px_20px_3px_#0000000A] h-fit justify-center rounded-[12px]">
      <VueCal
        v-model:selected-date="selectedDate"
        class="w-full custom-theme date-picker"
        date-picker
        view="month"
        :view-date="viewDate"
        :views-bar="false"
        style="height: 225px"
        @update:selected-date="viewDate = $event"
      />
      <div class="text-base lg:text-[18px] font-semibold pb-2.5 border-b border-[#E4E4E7]">
        Upcoming event <span class="text-[#DC2626]">(1)</span>
      </div>
      <div class="grid text-xs">
        <b>Lop hoc T5 - T6</b>
        <span>At: <b class="text-[#15803D]">08:30 - 14:30</b></span>
        <span class="break-all">Link: Https://zoom.vn/a1231-sdfsdf</span>
      </div>
    </div>

    <!-- Main calendar -->
    <VueCal
      v-model:selected-date="selectedDate"
      v-model:view-date="viewDate"
      class="w-full !h-full custom-theme calendar min-h-[500px]"
      :time-from="7 * 60"
      :time-step="60"
      :time-to="17 * 60"
      :time-cell-height="72"
      :events="data.events"
    />
  </div>
</template>

<style>
/* Global Vue-cal theme customization - must be unscoped */
.vuecal.custom-theme {
  --vuecal-primary-color: #fff;
  --vuecal-secondary-color: #fff;
  --vuecal-base-color: #000;
  --vuecal-contrast-color: #fff;
}
.vuecal__header {
    color: var(--vuecal-base-color) !important;
}

.vuecal__event {
    color: var(--vuecal-base-color) !important;
    border-color: var(--vuecal-primary-color) !important;
}

.vuecal__today-btn {
    color: var(--vuecal-base-color) !important;
}
.vuecal--default-theme .vuecal__event {
  background-color: #0EA5E91A;
  padding: 6px;
  border-radius: 4px;
}
.calendar .vuecal__views-bar .vuecal__view-button {
  background: transparent;
  color: #71717A;
  border-radius: 8px;
}
.calendar .vuecal__views-bar .vuecal__view-button--active {
  background: #DC2626;
  color: #fff;
}
.calendar .vuecal__transition-wrap {
  display: none;
}
.vuecal__header {
  border: 1px solid #E4E4E7;
  border-bottom: none;
}
.date-picker.vuecal--default-theme.vuecal--date-picker.vuecal--light .vuecal__cell--today:before {
    background-color: #615bffc2;
}
.date-picker.vuecal--default-theme.vuecal--light .vuecal__cell--selected:before {
    background-color: #605BFF;
}
.date-picker.vuecal--default-theme.vuecal--date-picker .vuecal__cell-date {
  font-weight: 500;
}
.date-picker .vuecal__cell--selected,
.date-picker.vuecal--default-theme.vuecal--date-picker.vuecal--light .vuecal__cell--today {
  color: #fff;
}
.date-picker .vuecal__cell:hover.vuecal__cell:before {
  background-color: #605BFF;
}
.date-picker .vuecal__cell:hover {
  color: #fff;
  cursor: pointer;
}
.calendar .vuecal__title-bar button {
  background-color: #F4F4F5;
  height: 28px;
  border-radius: 6px;
}
.calendar .vuecal__nav--today {
  margin-left: 3px;
}

.vuecal__event {
  position: relative;
  overflow: hidden;
}

.vuecal__event .vuecal__event-title, .calendar .vuecal__event-time {
  font-size: 14px;
  color: #0369A1;
}
.vuecal__event .vuecal__event-time {
  font-weight: 600;
  margin-top: 4px;
}
.vuecal__event::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background-color: #0EA5E9;
}
</style>
