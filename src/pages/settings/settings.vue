<template>
  <view class="page">
    <view class="intro-card">
      <text class="intro-title">排盘设置</text>
      <text class="intro-copy">设置只影响之后新建或手动重排的命盘，历史记录仍使用创建时保存的口径。</text>
    </view>

    <view class="section-card">
      <text class="section-title">日期边界</text>
      <view class="setting-row">
        <view class="setting-copy">
          <text class="setting-label">换日口径</text>
          <text class="setting-note">决定 23:00—23:59 的日柱归属</text>
        </view>
        <view class="segmented">
          <button :class="['segment', draft.dayBoundary === 'zi-begin' ? 'active' : '']" @click="draft.dayBoundary = 'zi-begin'">23点</button>
          <button :class="['segment', draft.dayBoundary === 'midnight' ? 'active' : '']" @click="draft.dayBoundary = 'midnight'">0点</button>
        </view>
      </view>
      <view class="setting-row">
        <view class="setting-copy">
          <text class="setting-label">子时口径</text>
          <text class="setting-note">拆分后，晚子时时干按换日前日干</text>
        </view>
        <view class="segmented">
          <button :class="['segment', draft.ziHourMode === 'unified' ? 'active' : '']" @click="draft.ziHourMode = 'unified'">统一</button>
          <button :class="['segment', draft.ziHourMode === 'split' ? 'active' : '']" @click="draft.ziHourMode = 'split'">早晚</button>
        </view>
      </view>
    </view>

    <view class="section-card">
      <text class="section-title">年份边界</text>
      <view class="setting-row">
        <view class="setting-copy">
          <text class="setting-label">年柱</text>
          <text class="setting-note">决定出生年的干支边界</text>
        </view>
        <view class="segmented">
          <button :class="['segment', draft.yearBoundary === 'lunar-new-year' ? 'active' : '']" @click="draft.yearBoundary = 'lunar-new-year'">正月初一</button>
          <button :class="['segment', draft.yearBoundary === 'lichun' ? 'active' : '']" @click="draft.yearBoundary = 'lichun'">立春</button>
        </view>
      </view>
      <view class="setting-row">
        <view class="setting-copy">
          <text class="setting-label">生肖</text>
          <text class="setting-note">可与年柱边界独立设置</text>
        </view>
        <view class="segmented">
          <button :class="['segment', draft.zodiacBoundary === 'lunar-new-year' ? 'active' : '']" @click="draft.zodiacBoundary = 'lunar-new-year'">农历年</button>
          <button :class="['segment', draft.zodiacBoundary === 'lichun' ? 'active' : '']" @click="draft.zodiacBoundary = 'lichun'">立春</button>
        </view>
      </view>
    </view>

    <view class="section-card">
      <text class="section-title">显示与流派</text>
      <view class="setting-row">
        <view class="setting-copy">
          <text class="setting-label">四柱顺序</text>
          <text class="setting-note">只改变展示，不改变内部计算</text>
        </view>
        <view class="segmented">
          <button :class="['segment', draft.pillarDisplayOrder === 'year-to-hour' ? 'active' : '']" @click="draft.pillarDisplayOrder = 'year-to-hour'">年月日时</button>
          <button :class="['segment', draft.pillarDisplayOrder === 'hour-to-year' ? 'active' : '']" @click="draft.pillarDisplayOrder = 'hour-to-year'">时日月年</button>
        </view>
      </view>
      <view class="setting-row">
        <view class="setting-copy">
          <text class="setting-label">默认身强流派</text>
          <text class="setting-note">命盘页仍可临时切换查看</text>
        </view>
        <view class="segmented">
          <button :class="['segment', draft.defaultStrengthSchool === 'traditional' ? 'active' : '']" @click="draft.defaultStrengthSchool = 'traditional'">传统派</button>
          <button :class="['segment', draft.defaultStrengthSchool === 'academic' ? 'active' : '']" @click="draft.defaultStrengthSchool = 'academic'">学术派</button>
        </view>
      </view>
    </view>

    <view class="section-card">
      <text class="section-title">规则集</text>
      <view class="setting-row">
        <view class="setting-copy">
          <text class="setting-label">神煞规则</text>
          <text class="setting-note">规则集 legacy-v1</text>
        </view>
        <switch :checked="draft.shenSha.enabled" color="#aa914f" @change="draft.shenSha.enabled = $event.detail.value" />
      </view>
      <view class="setting-row">
        <view class="setting-copy">
          <text class="setting-label">干支关系</text>
          <text class="setting-note">规则集 legacy-v1</text>
        </view>
        <switch :checked="draft.relations.enabled" color="#aa914f" @change="draft.relations.enabled = $event.detail.value" />
      </view>
    </view>

    <view class="environment-card">
      <text class="section-title">当前计算环境</text>
      <text>应用版本：{{ APP_VERSION }}</text>
      <text>计算引擎：{{ ENGINE_VERSION }}</text>
      <text>节气数据：{{ SOLAR_TERM_DATA_VERSION }}</text>
      <text>时间口径：北京时间（固定 UTC+08:00）</text>
      <text>节气精度：分钟级离线数据</text>
    </view>

    <view class="actions">
      <button class="secondary-button" @click="resetDraft">恢复推荐设置</button>
      <button class="primary-button" @click="saveDraft">保存设置</button>
    </view>

    <view class="bottom-nav">
      <view class="nav-item" @click="openChart">
        <text class="nav-icon">◉</text>
        <text class="nav-text">排盘</text>
      </view>
      <view class="nav-item" @click="openHistory">
        <text class="nav-icon">≡</text>
        <text class="nav-text">记录</text>
      </view>
      <view class="nav-item active">
        <text class="nav-icon">⚙</text>
        <text class="nav-text">设置</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { onShow } from "@dcloudio/uni-app";
import {
  APP_VERSION,
  ENGINE_VERSION,
  SOLAR_TERM_DATA_VERSION,
  cloneCalculationSettings,
  type CalculationSettings,
} from "../../core/calculation-profile.ts";
import {
  getDefaultCalculationSettings,
  readCalculationSettings,
  saveCalculationSettings,
} from "../../services/settings.ts";

const draft = reactive<CalculationSettings>(getDefaultCalculationSettings());

onShow(() => {
  Object.assign(draft, cloneCalculationSettings(readCalculationSettings()));
});

function saveDraft() {
  const saved = saveCalculationSettings(draft);
  Object.assign(draft, cloneCalculationSettings(saved));
  uni.showToast({ title: "排盘设置已保存", icon: "success" });
}

function resetDraft() {
  Object.assign(draft, getDefaultCalculationSettings());
  uni.showToast({ title: "已恢复推荐值，保存后生效", icon: "none" });
}

function openChart() {
  uni.reLaunch({ url: "/pages/index/index" });
}

function openHistory() {
  uni.reLaunch({ url: "/pages/history/history" });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx calc(150rpx + env(safe-area-inset-bottom));
  background: #f3f4f2;
  box-sizing: border-box;
}

.intro-card,
.section-card,
.environment-card {
  margin-bottom: 20rpx;
  padding: 28rpx;
  border: 1rpx solid rgba(170, 145, 79, 0.18);
  border-radius: 18rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(18, 33, 42, 0.05);
}

.intro-title {
  display: block;
  color: #12212a;
  font-size: 40rpx;
  font-weight: 700;
}

.intro-copy {
  display: block;
  margin-top: 12rpx;
  color: #6d736f;
  font-size: 25rpx;
  line-height: 1.6;
}

.section-title {
  display: block;
  margin-bottom: 12rpx;
  color: #8b7438;
  font-size: 28rpx;
  font-weight: 700;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  min-height: 108rpx;
  border-top: 1rpx solid #eceeea;
}

.section-title + .setting-row {
  border-top: 0;
}

.setting-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6rpx;
}

.setting-label {
  color: #202724;
  font-size: 28rpx;
  font-weight: 600;
}

.setting-note {
  color: #8b908d;
  font-size: 21rpx;
}

.segmented {
  display: flex;
  padding: 4rpx;
  border-radius: 10rpx;
  background: #eef0ed;
}

.segment {
  min-width: 92rpx;
  height: 56rpx;
  padding: 0 14rpx;
  border-radius: 8rpx;
  background: transparent;
  color: #6c726e;
  font-size: 23rpx;
  line-height: 56rpx;
}

.segment.active {
  background: #ffffff;
  box-shadow: 0 3rpx 10rpx rgba(18, 33, 42, 0.1);
  color: #8b7438;
  font-weight: 700;
}

.environment-card {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  color: #666d69;
  font-size: 23rpx;
}

.actions {
  display: flex;
  gap: 18rpx;
  margin-top: 28rpx;
}

.primary-button,
.secondary-button {
  flex: 1;
  height: 82rpx;
  border-radius: 12rpx;
  font-size: 27rpx;
  line-height: 82rpx;
}

.primary-button {
  background: #12212a;
  color: #f6e8bc;
}

.secondary-button {
  border: 1rpx solid #aa914f;
  background: #ffffff;
  color: #8b7438;
}

.bottom-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  height: calc(112rpx + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: #12212a;
  box-sizing: border-box;
}

.nav-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  color: rgba(247, 245, 239, 0.62);
}

.nav-item.active {
  color: #e2c978;
}

.nav-icon { font-size: 30rpx; }
.nav-text { font-size: 22rpx; }
</style>
