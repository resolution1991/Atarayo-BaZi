<template>
  <view class="page">
    <view class="toolbar">
      <view class="search-box">
        <text class="search-icon">⌕</text>
        <input
          v-model="searchText"
          class="search-input"
          placeholder="请输入搜索的内容"
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

    <view class="category-row">
      <view class="category-tabs">
        <text class="category active">全部</text>
        <text class="add-entry" @click="createRecord">+</text>
      </view>
      <view v-if="manageMode && records.length" class="clear-link-button" @click="confirmClear">清空全部</view>
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
            <text>{{ getStemLine(record) }}</text>
            <text>{{ getBranchLine(record) }}</text>
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
import type { HistoryRecord } from "../../services/history.ts";
import { clearHistory, deleteHistoryRecord, readHistory } from "../../services/history.ts";

const records = ref<HistoryRecord[]>([]);
const searchText = ref("");
const manageMode = ref(false);

const filteredRecords = computed(() => {
  const keyword = searchText.value.trim().toLowerCase();
  if (!keyword) {
    return records.value;
  }
  return records.value.filter((record) => getSearchText(record).includes(keyword));
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
  const info = record.data.person.birth_info;
  return [info.year, info.month, info.day, info.hour].map((pillar) => pillar.heavenly_stem.symbol).join("");
}

function getBranchLine(record: HistoryRecord): string {
  const info = record.data.person.birth_info;
  return [info.year, info.month, info.day, info.hour].map((pillar) => pillar.earthly_branch.symbol).join("");
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
</style>
