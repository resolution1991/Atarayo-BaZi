<template>
  <view class="page">
    <view class="toolbar">
      <view class="search-box">
        <text class="search-icon">⌕</text>
        <input
          v-model="searchText"
          class="search-input"
          placeholder="请输入命主姓名"
          placeholder-class="placeholder"
        />
      </view>
      <button
        v-if="records.length"
        :class="['manage-button', manageMode ? 'active' : '']"
        @click="toggleManageMode"
      >
        {{ manageMode ? "完成" : "管理" }}
      </button>
    </view>

    <view class="filter-panel">
      <view class="filter-heading">
        <button :class="['show-all-button', !hasActiveFilters ? 'active' : '']" @click="clearFilters">
          显示全部
        </button>
        <text v-if="hasActiveFilters" class="filter-status">已启用筛选</text>
      </view>
      <view class="filter-row">
        <text class="filter-label">性别</text>
        <view class="filter-options">
          <button
            v-for="gender in genderOptions"
            :key="gender"
            :class="['filter-chip', selectedGender === gender ? 'active' : '']"
            @click="selectedGender = gender"
          >
            {{ gender }}
          </button>
        </view>
      </view>
      <view class="filter-row">
        <text class="filter-label">出生年月</text>
        <picker
          class="year-picker"
          mode="selector"
          :range="yearOptions"
          :value="selectedYearIndex"
          @change="handleYearChange"
        >
          <view :class="['picker-value', selectedYear ? 'active' : '']">
            {{ selectedYear || "所有年份" }}
            <text class="picker-arrow">⌄</text>
          </view>
        </picker>
      </view>
      <view class="filter-row zodiac-row">
        <text class="filter-label">属相</text>
        <scroll-view class="zodiac-scroll" scroll-x :show-scrollbar="false">
          <view class="zodiac-options">
            <button
              v-for="option in zodiacOptions"
              :key="option.branch"
              :class="['filter-chip', selectedZodiac === option.branch ? 'active' : '']"
              @click="selectedZodiac = option.branch"
            >
              {{ option.label }}
            </button>
          </view>
        </scroll-view>
      </view>
      <view v-if="manageMode && records.length" class="manage-filter-actions">
        <view class="clear-link-button" @click="confirmClear">清空全部记录</view>
      </view>
    </view>

    <view v-if="filteredRecords.length" class="list">
      <view
        v-for="record in filteredRecords"
        :key="record.id"
        :class="['record-row', manageMode ? 'managing' : '']"
      >
        <view class="record-main" @click="handleRecordClick(record.id)">
          <view class="name-line">
            <text class="name">{{ record.data.person.name }}</text>
            <text class="gender">{{ record.data.person.gender }}</text>
          </view>
          <text class="birth-date">{{ formatGregorian(record.data.person.birth_info.gregorian_date) }}</text>
        </view>

        <view class="record-chart">
          <view class="ganzhi-lines" @click="handleRecordClick(record.id)">
            <view class="ganzhi-line">
              <text
                v-for="(stem, index) in getStemItems(record)"
                :key="`stem-${index}`"
                :class="['ganzhi-symbol', getWuXingClass(stem.wu_xing, stem.symbol)]"
              >
                {{ stem.symbol }}
              </text>
            </view>
            <view class="ganzhi-line">
              <text
                v-for="(branch, index) in getBranchItems(record)"
                :key="`branch-${index}`"
                :class="['ganzhi-symbol', getWuXingClass(branch.wu_xing, branch.symbol)]"
              >
                {{ branch.symbol }}
              </text>
            </view>
          </view>
          <view class="row-actions">
            <view v-if="!manageMode" class="chart-badge" @click="handleRecordClick(record.id)">
              {{ getBadgeText(record) }}
            </view>
            <button class="row-delete-button" @click.stop.prevent="confirmDelete(record.id)">删除</button>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty">
      <text class="empty-title">{{ records.length ? "未找到匹配记录" : "暂无历史记录" }}</text>
      <text class="empty-desc">排盘完成后会自动保存在本机记录中。</text>
      <button class="empty-button" @click="createRecord">去排盘</button>
    </view>

    <view v-if="!manageMode" class="floating-add" @click="createRecord">+</view>

    <view class="bottom-nav">
      <view class="nav-item" @click="createRecord">
        <text class="nav-icon">◉</text>
        <text class="nav-text">排盘</text>
      </view>
      <view class="nav-item active">
        <text class="nav-icon">≡</text>
        <text class="nav-text">记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import type { Gender } from "../../core/types.ts";
import type { HistoryRecord } from "../../services/history.ts";
import { clearHistory, deleteHistoryRecord, readHistory } from "../../services/history.ts";

const records = ref<HistoryRecord[]>([]);
const searchText = ref("");
const manageMode = ref(false);
const selectedGender = ref<Gender | "">("");
const selectedYear = ref("");
const selectedZodiac = ref("");

const genderOptions: Gender[] = ["男", "女"];
const zodiacOptions = [
  { branch: "子", label: "鼠" },
  { branch: "丑", label: "牛" },
  { branch: "寅", label: "虎" },
  { branch: "卯", label: "兔" },
  { branch: "辰", label: "龙" },
  { branch: "巳", label: "蛇" },
  { branch: "午", label: "马" },
  { branch: "未", label: "羊" },
  { branch: "申", label: "猴" },
  { branch: "酉", label: "鸡" },
  { branch: "戌", label: "狗" },
  { branch: "亥", label: "猪" },
];

const availableYears = computed(() =>
  Array.from(
    new Set(
      records.value
        .map((record) => record.data.person.birth_info.gregorian_date.slice(0, 4))
        .filter((year) => /^\d{4}$/.test(year)),
    ),
  ).sort((a, b) => Number(b) - Number(a)),
);
const yearOptions = computed(() => ["所有年份", ...availableYears.value]);
const selectedYearIndex = computed(() => {
  const index = yearOptions.value.indexOf(selectedYear.value);
  return index >= 0 ? index : 0;
});
const hasActiveFilters = computed(
  () => Boolean(selectedGender.value || selectedYear.value || selectedZodiac.value),
);

const filteredRecords = computed(() => {
  const keyword = searchText.value.trim().toLowerCase();
  return records.value.filter((record) => {
    const info = record.data.person.birth_info;
    return (
      (!keyword || getSearchText(record).includes(keyword)) &&
      (!selectedGender.value || record.data.person.gender === selectedGender.value) &&
      (!selectedYear.value || info.gregorian_date.startsWith(`${selectedYear.value}-`)) &&
      (!selectedZodiac.value || info.year.earthly_branch.symbol === selectedZodiac.value)
    );
  });
});

onShow(() => {
  refreshRecords();
});

function refreshRecords() {
  records.value = readHistory();
}

function openRecord(id: string) {
  uni.navigateTo({ url: `/pages/chart/chart?id=${id}` });
}

function handleRecordClick(id: string) {
  if (manageMode.value) {
    return;
  }
  openRecord(id);
}

function createRecord() {
  uni.reLaunch({ url: "/pages/index/index" });
}

function toggleManageMode() {
  manageMode.value = !manageMode.value;
}

function clearFilters() {
  selectedGender.value = "";
  selectedYear.value = "";
  selectedZodiac.value = "";
}

function handleYearChange(event: { detail: { value: string | number } }) {
  const index = Number(event.detail.value);
  selectedYear.value = index > 0 ? yearOptions.value[index] ?? "" : "";
}

function confirmClear() {
  uni.showModal({
    title: "清空记录",
    content: "确认删除本机保存的全部排盘记录？",
    confirmText: "清空",
    confirmColor: "#c43131",
    success(result) {
      if (result.confirm) {
        clearHistory();
        refreshRecords();
        manageMode.value = false;
      }
    },
  });
}

function confirmDelete(id: string) {
  uni.showModal({
    title: "删除记录",
    content: "确认删除这条排盘记录？",
    confirmText: "删除",
    confirmColor: "#c43131",
    success(result) {
      if (result.confirm) {
        deleteHistoryRecord(id);
        refreshRecords();
        if (records.value.length === 0) {
          manageMode.value = false;
        }
      }
    },
  });
}

function getSearchText(record: HistoryRecord): string {
  const info = record.data.person.birth_info;
  return [
    record.data.person.name,
    record.data.person.gender,
    info.gregorian_date,
    info.lunar_date,
    getStemLine(record),
    getBranchLine(record),
  ]
    .join(" ")
    .toLowerCase();
}

function getStemLine(record: HistoryRecord): string {
  return getStemItems(record).map((stem) => stem.symbol).join("");
}

function getBranchLine(record: HistoryRecord): string {
  return getBranchItems(record).map((branch) => branch.symbol).join("");
}

function getStemItems(record: HistoryRecord) {
  const info = record.data.person.birth_info;
  return [info.year, info.month, info.day, info.hour].map((pillar) => pillar.heavenly_stem);
}

function getBranchItems(record: HistoryRecord) {
  const info = record.data.person.birth_info;
  return [info.year, info.month, info.day, info.hour].map((pillar) => pillar.earthly_branch);
}

function getWuXingClass(wuXing?: string, symbol?: string): string {
  const symbolWuXing: Record<string, string> = {
    甲: "木", 乙: "木", 寅: "木", 卯: "木",
    丙: "火", 丁: "火", 巳: "火", 午: "火",
    戊: "土", 己: "土", 辰: "土", 戌: "土", 丑: "土", 未: "土",
    庚: "金", 辛: "金", 申: "金", 酉: "金",
    壬: "水", 癸: "水", 子: "水", 亥: "水",
  };
  const classMap: Record<string, string> = {
    火: "wx-fire",
    木: "wx-wood",
    金: "wx-metal",
    水: "wx-water",
    土: "wx-earth",
  };
  return classMap[wuXing || symbolWuXing[symbol ?? ""]] || "";
}

function getBadgeText(record: HistoryRecord): string {
  return record.data.person.birth_info.day.earthly_branch.symbol;
}

function formatGregorian(dateText: string): string {
  const [year, month, day] = dateText.split("-").map((value) => Number(value));
  if (!year || !month || !day) {
    return `阳历${dateText}`;
  }
  return `阳历${year}年${month}月${day}日`;
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 20rpx 0 calc(132rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  gap: 16rpx;
  padding: 0 20rpx;
}

.search-box {
  display: flex;
  flex: 1;
  align-items: center;
  height: 70rpx;
  padding: 0 20rpx;
  border-radius: 6rpx;
  background: #f4f4f4;
  box-sizing: border-box;
}

.search-icon {
  margin-right: 12rpx;
  color: #d0d0d0;
  font-size: 34rpx;
}

.search-input {
  flex: 1;
  height: 70rpx;
  color: #111111;
  font-size: 30rpx;
  line-height: 70rpx;
}

.placeholder {
  color: #c6c6c6;
}

.manage-button {
  width: 116rpx;
  height: 70rpx;
  border-radius: 8rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.08);
  color: #666666;
  font-size: 28rpx;
  line-height: 70rpx;
}

.manage-button.active {
  color: #aa914f;
  font-weight: 600;
}

.category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 92rpx;
  padding: 0 28rpx;
  border-bottom: 2rpx solid #d7d7d7;
}

.category-tabs {
  display: flex;
  align-items: center;
  gap: 70rpx;
  height: 92rpx;
}

.category {
  height: 92rpx;
  color: #8f8f8f;
  font-size: 30rpx;
  line-height: 92rpx;
}

.category.active {
  border-bottom: 3rpx solid #aa914f;
  color: #aa914f;
}

.add-entry {
  color: #333333;
  font-size: 34rpx;
}

.clear-link-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52rpx;
  min-width: 124rpx;
  color: #c43131;
  font-size: 26rpx;
  line-height: 52rpx;
}

.list {
  background: #ffffff;
}

.record-row {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 136rpx;
  padding: 22rpx 28rpx;
  border-bottom: 1rpx solid #eeeeee;
  box-sizing: border-box;
}

.record-row.managing {
  background: #fffdf9;
}

.record-main {
  flex: 1;
  min-width: 0;
}

.name-line {
  display: flex;
  align-items: baseline;
  gap: 14rpx;
}

.name {
  overflow: hidden;
  color: #111111;
  font-size: 34rpx;
  font-weight: 600;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gender {
  color: #a7a7a7;
  font-size: 28rpx;
  line-height: 1.2;
}

.birth-date {
  display: block;
  margin-top: 14rpx;
  color: #b5b5b5;
  font-size: 28rpx;
  line-height: 1.2;
}

.record-chart {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-left: 18rpx;
}

.ganzhi-lines {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
  color: #ababab;
  font-size: 32rpx;
  line-height: 1.08;
  letter-spacing: 4rpx;
}

.chart-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58rpx;
  height: 58rpx;
  border: 2rpx solid #b39a55;
  border-radius: 50%;
  background: #0a0a0a;
  color: #d8bf78;
  font-size: 28rpx;
  font-weight: 700;
}

.row-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.row-delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 36rpx;
  margin: 0;
  padding: 0;
  border: 1rpx solid #e2b6b6;
  border-radius: 18rpx;
  background: #fff7f7;
  color: #c43131;
  font-size: 20rpx;
  line-height: 36rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 140rpx 40rpx 0;
  color: #999999;
  text-align: center;
}

.empty-title {
  color: #333333;
  font-size: 34rpx;
  font-weight: 600;
}

.empty-desc {
  margin-top: 14rpx;
  color: #a7a7a7;
  font-size: 26rpx;
  line-height: 1.5;
}

.empty-button {
  width: 220rpx;
  height: 76rpx;
  margin-top: 36rpx;
  border-radius: 8rpx;
  background: #000000;
  color: #ffffff;
  font-size: 30rpx;
  line-height: 76rpx;
}

.floating-add {
  position: fixed;
  right: 56rpx;
  bottom: calc(150rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: rgba(222, 181, 108, 0.72);
  color: #ffffff;
  font-size: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(170, 145, 79, 0.25);
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

/* Shared ink-and-paper redesign for the local chart archive. */
.page {
  min-height: 100vh;
  padding: 28rpx 20rpx calc(178rpx + env(safe-area-inset-bottom));
  background: var(--ink);
  box-sizing: border-box;
}

.toolbar {
  gap: 16rpx;
  padding: 0;
}

.search-box {
  height: 80rpx;
  padding: 0 22rpx;
  border: 1rpx solid rgba(222, 216, 202, 0.75);
  border-radius: 13rpx;
  background: var(--paper);
}

.search-icon {
  margin-right: 12rpx;
  color: var(--gold);
  font-size: 30rpx;
}

.search-input {
  height: 80rpx;
  color: var(--text);
  font-size: 27rpx;
  line-height: 80rpx;
}

.placeholder { color: #9e9c95; }

.manage-button {
  width: 132rpx;
  height: 80rpx;
  border: 1rpx solid rgba(182, 145, 85, 0.74);
  border-radius: 13rpx;
  background: transparent;
  box-shadow: none;
  color: #e4c88f;
  font-size: 25rpx;
  font-weight: 700;
  line-height: 80rpx;
}

.manage-button.active { border-color: var(--cinnabar); background: var(--cinnabar); color: #fffdf8; }

.filter-panel {
  margin-top: 18rpx;
  padding: 16rpx 18rpx 18rpx;
  border: 1rpx solid rgba(222, 216, 202, 0.24);
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.035);
}

.filter-heading,
.filter-row,
.manage-filter-actions {
  display: flex;
  align-items: center;
}

.filter-heading {
  justify-content: space-between;
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid rgba(222, 216, 202, 0.14);
}

.show-all-button,
.filter-chip {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 1rpx solid rgba(228, 200, 143, 0.42);
  background: transparent;
  color: rgba(247, 245, 239, 0.72);
  line-height: 1;
}

.show-all-button::after,
.filter-chip::after {
  border: 0;
}

.show-all-button {
  height: 52rpx;
  padding: 0 22rpx;
  border-radius: 26rpx;
  font-size: 23rpx;
  line-height: 50rpx;
}

.show-all-button.active,
.filter-chip.active {
  border-color: var(--gold);
  background: rgba(182, 145, 85, 0.18);
  color: #f6e7c6;
  font-weight: 700;
}

.filter-status {
  color: #ec9b8c;
  font-size: 21rpx;
}

.filter-row {
  min-height: 60rpx;
  padding-top: 9rpx;
}

.filter-label {
  flex: 0 0 110rpx;
  color: rgba(247, 245, 239, 0.58);
  font-size: 22rpx;
}

.filter-options,
.zodiac-options {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.filter-chip {
  width: 66rpx;
  height: 44rpx;
  border-radius: 22rpx;
  font-size: 21rpx;
  line-height: 42rpx;
}

.year-picker {
  display: block;
}

.picker-value {
  min-width: 166rpx;
  height: 44rpx;
  padding: 0 16rpx;
  border: 1rpx solid rgba(228, 200, 143, 0.42);
  border-radius: 22rpx;
  color: rgba(247, 245, 239, 0.72);
  font-size: 21rpx;
  line-height: 42rpx;
  text-align: center;
  box-sizing: border-box;
}

.picker-value.active {
  border-color: var(--gold);
  background: rgba(182, 145, 85, 0.18);
  color: #f6e7c6;
  font-weight: 700;
}

.picker-arrow {
  margin-left: 8rpx;
  color: var(--gold);
}

.zodiac-row {
  align-items: flex-start;
}

.zodiac-row .filter-label {
  padding-top: 11rpx;
}

.zodiac-scroll {
  min-width: 0;
  flex: 1;
  white-space: nowrap;
}

.zodiac-options {
  width: max-content;
  padding-right: 16rpx;
}

.manage-filter-actions {
  justify-content: flex-end;
  padding-top: 10rpx;
}

.clear-link-button {
  color: #ec9b8c;
  font-size: 22rpx;
}

.list {
  overflow: hidden;
  margin-top: 20rpx;
  border: 1rpx solid rgba(222, 216, 202, 0.76);
  border-radius: 18rpx;
  background: var(--paper);
  box-shadow: 0 16rpx 32rpx rgba(0, 0, 0, 0.14);
}

.record-row {
  min-height: 146rpx;
  padding: 24rpx 22rpx;
  border-bottom-color: var(--line-soft);
}

.record-row:last-child { border-bottom: 0; }
.record-row.managing { background: #fff9f1; }

.name-line { gap: 12rpx; }
.name { color: var(--text); font-size: 32rpx; font-weight: 700; }
.gender { color: var(--gold); font-size: 23rpx; }
.birth-date { margin-top: 10rpx; color: var(--muted); font-size: 22rpx; }

.record-chart { gap: 16rpx; margin-left: 12rpx; }
.ganzhi-lines { gap: 7rpx; color: #3c423e; font-size: 31rpx; font-weight: 700; letter-spacing: 0; }
.ganzhi-line { display: flex; align-items: center; gap: 5rpx; }
.ganzhi-symbol { min-width: 31rpx; line-height: 1.08; text-align: center; }
.chart-badge {
  width: 58rpx;
  height: 58rpx;
  border: 2rpx solid var(--gold);
  background: transparent;
  color: var(--cinnabar);
  font-size: 28rpx;
  box-shadow: inset 0 0 0 5rpx rgba(182, 145, 85, 0.08);
}

.row-actions { gap: 6rpx; }
.row-delete-button {
  display: none;
  width: 80rpx;
  height: 40rpx;
  border: 1rpx solid #d9988d;
  border-radius: 8rpx;
  background: #fff8f5;
  color: var(--cinnabar);
  font-size: 20rpx;
  line-height: 38rpx;
}

.record-row.managing .row-delete-button { display: flex; }

.empty { padding: 170rpx 40rpx 0; }
.empty-title { color: var(--paper); font-size: 34rpx; }
.empty-desc { color: rgba(247, 245, 239, 0.62); font-size: 25rpx; }
.empty-button { border-radius: 12rpx; background: var(--cinnabar); color: #fffdf8; box-shadow: 0 12rpx 20rpx rgba(0, 0, 0, 0.17); }

.floating-add {
  right: 40rpx;
  bottom: calc(150rpx + env(safe-area-inset-bottom));
  width: 100rpx;
  height: 100rpx;
  border: 3rpx solid var(--paper);
  background: var(--cinnabar);
  color: #fffdf8;
  font-size: 50rpx;
  font-weight: 300;
  box-shadow: 0 14rpx 24rpx rgba(0, 0, 0, 0.28);
}

.bottom-nav {
  height: 118rpx;
  border-top: 1rpx solid rgba(182, 145, 85, 0.24);
  background: var(--ink-deep);
}

.nav-item { gap: 10rpx; color: rgba(247, 245, 239, 0.65); }
.nav-item.active { position: relative; color: var(--gold); }
.nav-item.active::before { position: absolute; top: 0; width: 56rpx; height: 4rpx; border-radius: 99rpx; background: var(--cinnabar); content: ""; }
.nav-icon { font-size: 32rpx; }
.nav-text { font-size: 23rpx; font-weight: 600; }

.page .wx-fire { color: #d63b32; }
.page .wx-wood { color: #2f9e44; }
.page .wx-metal { color: #d7a928; }
.page .wx-water { color: #1f78d1; }
.page .wx-earth { color: #8a5c18; }
</style>
