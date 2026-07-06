<template>
  <view class="page">
    <view class="form-card">
      <view class="name-line">
        <input
          v-model="form.name"
          class="name-input"
          placeholder="请输入姓名"
          placeholder-class="placeholder"
        />
      </view>

      <view class="control-row">
        <view class="gender-segment">
          <view
            v-for="gender in genderOptions"
            :key="gender"
            :class="['segment-item', form.gender === gender ? 'active' : '']"
            @click="form.gender = gender"
          >
            {{ gender }}
          </view>
        </view>
        <view class="calendar-segment">
          <view
            v-for="option in calendarOptions"
            :key="option.value"
            :class="['calendar-option', calendarMode === option.value ? 'active' : '']"
            @click="setCalendarMode(option.value)"
          >
            {{ option.label }}
          </view>
        </view>
      </view>

      <view v-if="calendarMode === 'solar'" class="datetime-line">
        <picker mode="date" :value="date" @change="onDateChange">
          <view class="datetime-value">{{ date }}</view>
        </picker>
        <picker mode="time" :value="time" @change="onTimeChange">
          <view class="datetime-value">{{ time }}</view>
        </picker>
      </view>

      <view v-else class="datetime-line lunar-line">
        <picker mode="selector" :range="lunarYearOptions" :value="lunarYearIndex" @change="onLunarYearChange">
          <view class="datetime-value lunar-year-value">{{ formatLunarYear(lunarYear) }}年</view>
        </picker>
        <picker mode="selector" :range="lunarMonthOptions" :value="lunarMonth - 1" @change="onLunarMonthChange">
          <view class="datetime-value">{{ formatLunarMonth(lunarMonth) }}</view>
        </picker>
        <picker mode="selector" :range="lunarDayOptions" :value="lunarDay - 1" @change="onLunarDayChange">
          <view class="datetime-value">{{ formatLunarDay(lunarDay) }}</view>
        </picker>
        <picker mode="time" :value="time" @change="onTimeChange">
          <view class="datetime-value">{{ time }}</view>
        </picker>
      </view>

      <view v-if="calendarMode === 'lunar' && lunarDateMatches.length > 1" class="leap-row">
        <text>本月存在闰月，请确认：</text>
        <view class="leap-options">
          <text
            v-for="(match, index) in lunarDateMatches"
            :key="match"
            :class="['leap-option', lunarMatchIndex === index ? 'active' : '']"
            @click="lunarMatchIndex = index"
          >
            {{ index === 0 ? "前月" : "后月" }}
          </text>
        </view>
      </view>

      <view class="rule-line">
        <text>排盘口径：{{ calendarMode === "solar" ? "公历" : "农历" }}出生时间 · 北京时间</text>
        <text v-if="calendarMode === 'lunar' && resolvedGregorianDate">换算公历：{{ resolvedGregorianDate }} {{ time }}</text>
      </view>

      <view v-if="previewData" class="preview">
        <view class="clock-face">
          <view class="clock-hand hour-hand"></view>
          <view class="clock-hand minute-hand"></view>
          <view class="clock-dot"></view>
        </view>
        <view class="preview-body">
          <view class="pillar-row">
            <text
              v-for="pillar in previewPillars"
              :key="pillar.heavenly_stem.symbol + pillar.earthly_branch.symbol + '-stem'"
              :class="['pillar-symbol', getWuXingClass(pillar.heavenly_stem.wu_xing)]"
            >
              {{ pillar.heavenly_stem.symbol }}
            </text>
          </view>
          <view class="pillar-row">
            <text
              v-for="pillar in previewPillars"
              :key="pillar.heavenly_stem.symbol + pillar.earthly_branch.symbol + '-branch'"
              :class="['pillar-symbol', getWuXingClass(pillar.earthly_branch.wu_xing)]"
            >
              {{ pillar.earthly_branch.symbol }}
            </text>
          </view>
          <text class="preview-meta">农历：{{ previewData.person.birth_info.lunar_date }}</text>
          <text class="preview-meta">公历：{{ currentGregorianDate }} {{ time }}</text>
        </view>
      </view>

      <view v-else class="preview-error">
        <text>{{ previewErrorText }}</text>
      </view>
    </view>

    <button class="primary-button" @click="generateChart">开始排盘</button>

    <view class="bottom-nav">
      <view class="nav-item active">
        <text class="nav-icon">◉</text>
        <text class="nav-text">排盘</text>
      </view>
      <view class="nav-item" @click="openHistory">
        <text class="nav-icon">≡</text>
        <text class="nav-text">记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { calculateBazi } from "../../core/calculate.ts";
import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from "../../core/rules.ts";
import type { Gender, Pillar } from "../../core/types.ts";
import { findGregorianDatesByLunar, LUNAR_CALENDAR } from "../../data/lunar-calendar.ts";
import { saveHistory } from "../../services/history.ts";

const genderOptions: Gender[] = ["男", "女"];
const calendarOptions = [
  { label: "公历", value: "solar" },
  { label: "农历", value: "lunar" },
] as const;
type CalendarMode = (typeof calendarOptions)[number]["value"];

const date = ref("1990-01-01");
const time = ref("00:00");
const calendarMode = ref<CalendarMode>("solar");
const lunarYears = Array.from({ length: 200 }, (_, index) => String(1900 + index));
const lunarMonthOptions = Array.from({ length: 12 }, (_, index) => formatLunarMonth(index + 1));
const lunarDayOptions = Array.from({ length: 30 }, (_, index) => formatLunarDay(index + 1));
const zodiacByBranch: Record<string, string> = {
  子: "鼠",
  丑: "牛",
  寅: "虎",
  卯: "兔",
  辰: "龙",
  巳: "蛇",
  午: "马",
  未: "羊",
  申: "猴",
  酉: "鸡",
  戌: "狗",
  亥: "猪",
};
const lunarYear = ref(1990);
const lunarMonth = ref(1);
const lunarDay = ref(1);
const lunarMatchIndex = ref(0);
const form = reactive({
  name: "",
  gender: "男" as Gender,
});

const lunarYearOptions = computed(() => lunarYears.map((year) => `${formatLunarYear(Number(year))}年`));
const lunarYearIndex = computed(() => Math.max(0, lunarYears.indexOf(String(lunarYear.value))));
const lunarDateMatches = computed(() =>
  findGregorianDatesByLunar(lunarYear.value, lunarMonth.value, lunarDay.value),
);
const resolvedGregorianDate = computed(() => {
  if (calendarMode.value === "solar") {
    return date.value;
  }
  return lunarDateMatches.value[lunarMatchIndex.value] ?? "";
});
const currentGregorianDate = computed(() => resolvedGregorianDate.value || date.value);
const previewErrorText = computed(() => {
  if (calendarMode.value === "lunar" && !resolvedGregorianDate.value) {
    return "当前农历日期无对应公历日期，请调整年月日";
  }
  return "当前日期暂不在历法数据范围内";
});

const previewData = computed(() => {
  try {
    return calculateCurrentChart();
  } catch {
    return null;
  }
});

const previewPillars = computed<Pillar[]>(() => {
  const info = previewData.value?.person.birth_info;
  return info ? [info.year, info.month, info.day, info.hour] : [];
});

function onDateChange(event: { detail: { value: string } }) {
  date.value = event.detail.value;
  syncLunarFromGregorian();
}

function onTimeChange(event: { detail: { value: string } }) {
  time.value = event.detail.value;
}

function onLunarYearChange(event: { detail: { value: number | string } }) {
  lunarYear.value = Number(lunarYears[Number(event.detail.value)]);
  resetLunarMatch();
}

function onLunarMonthChange(event: { detail: { value: number | string } }) {
  lunarMonth.value = Number(event.detail.value) + 1;
  resetLunarMatch();
}

function onLunarDayChange(event: { detail: { value: number | string } }) {
  lunarDay.value = Number(event.detail.value) + 1;
  resetLunarMatch();
}

function setCalendarMode(mode: CalendarMode) {
  if (calendarMode.value === mode) {
    return;
  }
  if (mode === "lunar") {
    syncLunarFromGregorian();
  } else if (resolvedGregorianDate.value) {
    date.value = resolvedGregorianDate.value;
  }
  calendarMode.value = mode;
}

function resetLunarMatch() {
  lunarMatchIndex.value = 0;
}

function syncLunarFromGregorian() {
  const entry = LUNAR_CALENDAR.get(date.value);
  if (!entry) {
    return;
  }
  lunarYear.value = entry.lunar_year;
  lunarMonth.value = entry.lunar_month;
  lunarDay.value = entry.lunar_day;
  const matches = findGregorianDatesByLunar(entry.lunar_year, entry.lunar_month, entry.lunar_day);
  lunarMatchIndex.value = Math.max(0, matches.indexOf(date.value));
}

function formatLunarYear(year: number): string {
  const ganzhi = getYearGanzhi(year);
  const zodiac = zodiacByBranch[ganzhi[1]] ?? "";
  return `${year}（${ganzhi}-${zodiac}）`;
}

function getYearGanzhi(year: number): string {
  const stem = HEAVENLY_STEMS[positiveModulo(year - 4, HEAVENLY_STEMS.length)];
  const branch = EARTHLY_BRANCHES[positiveModulo(year - 4, EARTHLY_BRANCHES.length)];
  return `${stem}${branch}`;
}

function formatLunarMonth(month: number): string {
  const names = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"];
  return names[month - 1] ?? `${month}月`;
}

function formatLunarDay(day: number): string {
  const dayNames = [
    "初一",
    "初二",
    "初三",
    "初四",
    "初五",
    "初六",
    "初七",
    "初八",
    "初九",
    "初十",
    "十一",
    "十二",
    "十三",
    "十四",
    "十五",
    "十六",
    "十七",
    "十八",
    "十九",
    "二十",
    "廿一",
    "廿二",
    "廿三",
    "廿四",
    "廿五",
    "廿六",
    "廿七",
    "廿八",
    "廿九",
    "三十",
  ];
  return dayNames[day - 1] ? `${dayNames[day - 1]}日` : `${day}日`;
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function calculateCurrentChart() {
  const gregorianDate = resolvedGregorianDate.value;
  if (!gregorianDate) {
    throw new Error(previewErrorText.value);
  }
  return calculateBazi(
    {
      name: form.name.trim() || "未命名",
      gender: form.gender,
      birth_datetime: `${gregorianDate}-${time.value.replace(/:/g, "-")}`,
    },
    LUNAR_CALENDAR,
  );
}

function generateChart() {
  try {
    const record = saveHistory(calculateCurrentChart());
    uni.navigateTo({
      url: `/pages/chart/chart?id=${record.id}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    uni.showToast({ title: message, icon: "none" });
  }
}

function openHistory() {
  uni.reLaunch({ url: "/pages/history/history" });
}

function getWuXingClass(wuXing?: string): string {
  const classMap: Record<string, string> = {
    火: "wx-fire",
    木: "wx-wood",
    金: "wx-metal",
    水: "wx-water",
    土: "wx-earth",
  };
  return wuXing ? classMap[wuXing] || "" : "";
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 28rpx 24rpx calc(144rpx + env(safe-area-inset-bottom));
  background: #f5f5f5;
  box-sizing: border-box;
}

.form-card {
  padding: 48rpx 40rpx 42rpx;
  border-radius: 8rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 22rpx rgba(0, 0, 0, 0.035);
}

.name-line {
  border-bottom: 2rpx solid #8d8d8d;
}

.name-input {
  height: 76rpx;
  color: #111111;
  font-size: 32rpx;
  line-height: 76rpx;
}

.placeholder {
  color: #9b9b9b;
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24rpx;
}

.gender-segment {
  display: flex;
  overflow: hidden;
  width: 204rpx;
  border: 2rpx solid #aa914f;
  border-radius: 12rpx;
}

.segment-item {
  flex: 1;
  height: 56rpx;
  color: #666666;
  font-size: 30rpx;
  line-height: 56rpx;
  text-align: center;
}

.segment-item.active {
  background: #aa914f;
  color: #ffffff;
  font-weight: 600;
}

.calendar-segment {
  display: flex;
  overflow: hidden;
  width: 210rpx;
  height: 56rpx;
  border: 2rpx solid #aa914f;
  border-radius: 12rpx;
}

.calendar-option {
  flex: 1;
  color: #aa914f;
  font-size: 28rpx;
  line-height: 56rpx;
  text-align: center;
}

.calendar-option.active {
  background: #aa914f;
  color: #ffffff;
  font-weight: 600;
}

.datetime-line {
  display: flex;
  gap: 18rpx;
  margin-top: 30rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #8d8d8d;
}

.lunar-line {
  flex-wrap: wrap;
  gap: 14rpx 18rpx;
}

.datetime-value {
  color: #333333;
  font-size: 32rpx;
  line-height: 48rpx;
}

.lunar-year-value {
  font-size: 30rpx;
}

.leap-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-top: 18rpx;
  color: #8f8f8f;
  font-size: 24rpx;
  line-height: 1.35;
}

.leap-options {
  display: flex;
  overflow: hidden;
  flex: 0 0 auto;
  border: 1rpx solid #d8c590;
  border-radius: 8rpx;
}

.leap-option {
  min-width: 72rpx;
  padding: 8rpx 12rpx;
  color: #aa914f;
  text-align: center;
}

.leap-option.active {
  background: #aa914f;
  color: #ffffff;
}

.rule-line {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 22rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #8d8d8d;
  color: #7e7e7e;
  font-size: 28rpx;
  line-height: 1.4;
}

.preview {
  display: flex;
  align-items: center;
  gap: 34rpx;
  margin-top: 32rpx;
}

.clock-face {
  position: relative;
  flex: 0 0 132rpx;
  width: 132rpx;
  height: 132rpx;
  border: 2rpx solid #e1e1e1;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 58%, #f7f7f7 59%);
  box-shadow: 0 8rpx 18rpx rgba(0, 0, 0, 0.08);
}

.clock-hand {
  position: absolute;
  left: 50%;
  top: 50%;
  height: 2rpx;
  background: #222222;
  transform-origin: left center;
}

.hour-hand {
  width: 38rpx;
  transform: rotate(192deg);
}

.minute-hand {
  width: 56rpx;
  transform: rotate(14deg);
}

.clock-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8rpx;
  height: 8rpx;
  margin: -4rpx 0 0 -4rpx;
  border-radius: 50%;
  background: #d63b32;
}

.preview-body {
  flex: 1;
  min-width: 0;
}

.pillar-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  column-gap: 20rpx;
  max-width: 300rpx;
}

.pillar-symbol {
  color: #9a9a9a;
  font-size: 40rpx;
  font-weight: 500;
  line-height: 1.15;
  text-align: center;
}

.preview-meta {
  display: block;
  margin-top: 12rpx;
  color: #9a9a9a;
  font-size: 24rpx;
  line-height: 1.35;
}

.preview-error {
  margin-top: 34rpx;
  color: #9a9a9a;
  font-size: 26rpx;
}

.primary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 94rpx;
  margin-top: 28rpx;
  border-radius: 8rpx;
  background: #000000;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 500;
  line-height: 94rpx;
}

.bottom-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  height: 108rpx;
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1rpx solid #dddddd;
  background: #ffffff;
  z-index: 20;
}

.nav-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  color: #999999;
}

.nav-item.active {
  color: #aa914f;
}

.nav-icon {
  font-size: 34rpx;
  line-height: 1;
}

.nav-text {
  font-size: 26rpx;
  line-height: 1;
}

.wx-fire {
  color: #d63b32;
}

.wx-wood {
  color: #2f9e44;
}

.wx-metal {
  color: #d7a928;
}

.wx-water {
  color: #1f78d1;
}

.wx-earth {
  color: #8a5c18;
}
</style>
