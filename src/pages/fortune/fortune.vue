<template>
  <view class="page">
    <view v-if="record && timeline && selectedDaYun && selectedLiuNian" class="content">
      <view class="profile-banner">
        <view class="profile-token">
          <text class="profile-zodiac">{{ zodiacText }}</text>
          <text class="profile-age">{{ selectedLiuNian.age }}岁</text>
        </view>
        <view class="profile-meta">
          <text>公历 {{ birthInfo?.gregorian_date }} {{ birthInfo?.birth_time }}</text>
          <text>农历 {{ formattedLunarDate }}</text>
        </view>
      </view>

      <view class="fortune-table-card">
        <view class="fortune-grid">
          <view class="fortune-cell row-label">日期</view>
          <view class="fortune-cell column-head active-column">
            <text>流年</text>
            <text class="column-year">{{ selectedLiuNian.year }}</text>
          </view>
          <view class="fortune-cell column-head active-column">
            <text>大运</text>
            <text class="column-year">{{ selectedDaYun.startYear }}</text>
          </view>
          <view v-for="pillar in pillarColumns" :key="pillar.key" class="fortune-cell column-head">
            {{ pillar.label }}
          </view>

          <view class="fortune-cell row-label">主星</view>
          <view class="fortune-cell">{{ selectedLiuNian.stem.shiShen }}</view>
          <view class="fortune-cell">{{ selectedDaYun.stem?.shiShen || "-" }}</view>
          <view v-for="pillar in pillarColumns" :key="pillar.key + '-star'" class="fortune-cell">
            {{ pillar.mainStar }}
          </view>

          <view class="fortune-cell row-label">天干</view>
          <view :class="['fortune-cell', 'main-symbol', getWuXingClass(selectedLiuNian.stem.wuXing)]">
            {{ selectedLiuNian.stem.symbol }}
          </view>
          <view :class="['fortune-cell', 'main-symbol', getWuXingClass(selectedDaYun.stem?.wuXing)]">
            {{ selectedDaYun.stem?.symbol || "-" }}
          </view>
          <view
            v-for="pillar in pillarColumns"
            :key="pillar.key + '-stem'"
            :class="['fortune-cell', 'main-symbol', pillar.stemClass]"
          >
            {{ pillar.stem }}
          </view>

          <view class="fortune-cell row-label">地支</view>
          <view :class="['fortune-cell', 'main-symbol', getWuXingClass(selectedLiuNian.branch.wuXing)]">
            {{ selectedLiuNian.branch.symbol }}
          </view>
          <view :class="['fortune-cell', 'main-symbol', getWuXingClass(selectedDaYun.branch?.wuXing)]">
            {{ selectedDaYun.branch?.symbol || "-" }}
          </view>
          <view
            v-for="pillar in pillarColumns"
            :key="pillar.key + '-branch'"
            :class="['fortune-cell', 'main-symbol', pillar.branchClass]"
          >
            {{ pillar.branch }}
          </view>
        </view>

        <view class="hidden-grid">
          <view class="hidden-label">藏干</view>
          <view class="hidden-column">
            <text
              v-for="hidden in selectedLiuNian.branch.hiddenStems"
              :key="'ln-hidden-' + hidden.symbol"
              :class="['hidden-line', getWuXingClass(hidden.wu_xing)]"
            >
              {{ hidden.symbol }}<text class="hidden-shishen">{{ hidden.shi_shen }}</text>
            </text>
          </view>
          <view class="hidden-column">
            <text
              v-for="hidden in selectedDaYun.branch?.hiddenStems || []"
              :key="'dy-hidden-' + hidden.symbol"
              :class="['hidden-line', getWuXingClass(hidden.wu_xing)]"
            >
              {{ hidden.symbol }}<text class="hidden-shishen">{{ hidden.shi_shen }}</text>
            </text>
          </view>
          <view v-for="pillar in pillarColumns" :key="pillar.key + '-hidden'" class="hidden-column">
            <text
              v-for="hidden in pillar.hiddenStems"
              :key="pillar.key + '-hidden-' + hidden.symbol"
              :class="['hidden-line', hidden.textClass]"
            >
              {{ hidden.symbol }}<text class="hidden-shishen">{{ hidden.shiShen }}</text>
            </text>
          </view>
        </view>
      </view>

      <view class="start-card">
        <text>起运：出生后{{ startText }}起运</text>
        <text>方向：{{ timeline.start.isForward ? "顺行" : "逆行" }} · 节点：{{ timeline.start.sourceJie.name }} 至 {{ timeline.start.targetJie.name }}</text>
        <text class="precision-note">当前按本地日级节令数据估算，后续可替换分钟级节气表。</text>
      </view>

      <view class="timeline-card">
        <view class="timeline-row-title">大运</view>
        <scroll-view scroll-x class="timeline-scroll">
          <view class="timeline-list">
            <view
              v-for="(dayun, index) in timeline.daYun"
              :key="dayun.index + '-' + dayun.startYear"
              :class="['fortune-period', selectedDaYunListIndex === index ? 'active' : '']"
              @click="selectDaYun(index)"
            >
              <text class="period-year">{{ dayun.startYear }}</text>
              <text class="period-age">{{ dayun.startAge }}岁</text>
              <text v-if="dayun.ganZhi" :class="['period-stem', getWuXingClass(dayun.stem?.wuXing)]">{{ dayun.stem?.symbol }}</text>
              <text v-if="dayun.ganZhi" :class="['period-branch', getWuXingClass(dayun.branch?.wuXing)]">{{ dayun.branch?.symbol }}</text>
              <text v-else class="period-small">小运</text>
              <text class="period-star">{{ dayun.stem?.shiShen || "" }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="timeline-card">
        <view class="timeline-row-title">流年</view>
        <scroll-view scroll-x class="timeline-scroll">
          <view class="timeline-list">
            <view
              v-for="(liunian, index) in selectedDaYun.liuNian"
              :key="liunian.year"
              :class="['fortune-period', selectedLiuNianIndex === index ? 'active' : '']"
              @click="selectLiuNian(index)"
            >
              <text class="period-year">{{ liunian.year }}</text>
              <text :class="['period-stem', getWuXingClass(liunian.stem.wuXing)]">{{ liunian.stem.symbol }}</text>
              <text :class="['period-branch', getWuXingClass(liunian.branch.wuXing)]">{{ liunian.branch.symbol }}</text>
              <text class="period-star">{{ liunian.stem.shiShen }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="timeline-card">
        <view class="timeline-row-title">流月</view>
        <scroll-view scroll-x class="timeline-scroll">
          <view class="timeline-list month-list">
            <view v-for="liuyue in selectedLiuNian.liuYue" :key="liuyue.index" class="fortune-period month-period">
              <text class="period-year">{{ liuyue.term }}</text>
              <text class="period-age">{{ liuyue.date }}</text>
              <text :class="['period-stem', getWuXingClass(liuyue.stem.wuXing)]">{{ liuyue.stem.symbol }}</text>
              <text :class="['period-branch', getWuXingClass(liuyue.branch.wuXing)]">{{ liuyue.branch.symbol }}</text>
              <text class="period-star">{{ liuyue.stem.shiShen }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <view v-else class="empty">
      <text class="empty-title">未找到命盘记录</text>
      <text class="empty-desc">请返回命盘页重新进入流年大运。</text>
      <button class="empty-button" @click="goBack">返回</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { buildLuckTimeline, type DaYunItem, type LiuNianItem } from "../../core/luck.ts";
import type { HistoryRecord } from "../../services/history.ts";
import { readHistory } from "../../services/history.ts";

const record = ref<HistoryRecord | null>(null);
const selectedDaYunListIndex = ref(0);
const selectedLiuNianIndex = ref(0);

onLoad((query) => {
  const id = query?.id;
  record.value = readHistory().find((item) => item.id === id) ?? null;
  initializeSelection();
});

const birthInfo = computed(() => record.value?.data.person.birth_info ?? null);
const timeline = computed(() => (record.value ? buildLuckTimeline(record.value.data) : null));
const selectedDaYun = computed<DaYunItem | null>(() => timeline.value?.daYun[selectedDaYunListIndex.value] ?? null);
const selectedLiuNian = computed<LiuNianItem | null>(() => selectedDaYun.value?.liuNian[selectedLiuNianIndex.value] ?? null);
const zodiacText = computed(() => {
  const branch = birthInfo.value?.year.earthly_branch.symbol;
  return branch ? `属${zodiacByBranch[branch] ?? branch}` : "-";
});
const startText = computed(() => {
  const start = timeline.value?.start;
  if (!start) {
    return "-";
  }
  return `${start.startYear}年${start.startMonth}月${start.startDay}天${start.startHour}时`;
});
const formattedLunarDate = computed(() => {
  const info = birthInfo.value;
  if (!info) {
    return "-";
  }

  const parsed = parseLunarDate(info.lunar_date);
  if (!parsed) {
    return info.lunar_date;
  }

  const yearGanzhi = `${info.year.heavenly_stem.symbol}${info.year.earthly_branch.symbol}`;
  const zodiac = zodiacByBranch[info.year.earthly_branch.symbol] ?? "";
  const yearText = zodiac ? `${parsed.year}（${yearGanzhi}-${zodiac}）年` : `${parsed.year}（${yearGanzhi}）年`;
  return `${yearText} ${formatLunarMonth(parsed.month)} ${formatLunarDay(parsed.day)}`;
});
const pillarColumns = computed(() => {
  const info = birthInfo.value;
  if (!info) {
    return [];
  }
  return [
    { key: "year", label: "年柱", data: info.year },
    { key: "month", label: "月柱", data: info.month },
    { key: "day", label: "日柱", data: info.day },
    { key: "hour", label: "时柱", data: info.hour },
  ].map((pillar) => ({
    key: pillar.key,
    label: pillar.label,
    mainStar: pillar.data.heavenly_stem.shi_shen || "-",
    stem: pillar.data.heavenly_stem.symbol,
    branch: pillar.data.earthly_branch.symbol,
    stemClass: getWuXingClass(pillar.data.heavenly_stem.wu_xing),
    branchClass: getWuXingClass(pillar.data.earthly_branch.wu_xing),
    hiddenStems:
      pillar.data.earthly_branch.hidden_stems?.map((hidden, index) => ({
        key: `${pillar.key}-${hidden.symbol}-${index}`,
        symbol: hidden.symbol,
        shiShen: hidden.shi_shen || "-",
        textClass: getWuXingClass(hidden.wu_xing),
      })) ?? [],
  }));
});

function initializeSelection() {
  if (!record.value) {
    return;
  }

  const nextTimeline = buildLuckTimeline(record.value.data);
  const currentYear = new Date().getFullYear();
  const daYunIndex = nextTimeline.daYun.findIndex((item) => currentYear >= item.startYear && currentYear <= item.endYear);
  selectedDaYunListIndex.value = daYunIndex >= 0 ? daYunIndex : Math.min(1, nextTimeline.daYun.length - 1);
  const daYun = nextTimeline.daYun[selectedDaYunListIndex.value];
  const liuNianIndex = daYun?.liuNian.findIndex((item) => item.year === currentYear) ?? -1;
  selectedLiuNianIndex.value = liuNianIndex >= 0 ? liuNianIndex : 0;
}

function selectDaYun(index: number) {
  selectedDaYunListIndex.value = index;
  const daYun = timeline.value?.daYun[index];
  const currentYear = new Date().getFullYear();
  const liuNianIndex = daYun?.liuNian.findIndex((item) => item.year === currentYear) ?? -1;
  selectedLiuNianIndex.value = liuNianIndex >= 0 ? liuNianIndex : 0;
}

function selectLiuNian(index: number) {
  selectedLiuNianIndex.value = index;
}

function goBack() {
  uni.navigateBack();
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

function parseLunarDate(value: string): { year: number; month: number; day: number } | null {
  const match = value.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  if (!match) {
    return null;
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
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
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 20rpx 40rpx;
  background: #f5f5f5;
  box-sizing: border-box;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.profile-banner,
.fortune-table-card,
.start-card,
.timeline-card {
  border: 1rpx solid #dfd2b6;
  border-radius: 8rpx;
  background: #ffffff;
}

.profile-banner {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 28rpx;
}

.profile-token {
  display: flex;
  flex: 0 0 96rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border: 2rpx solid #aa914f;
  border-radius: 50%;
  background: #fbf8f1;
}

.profile-zodiac {
  color: #111111;
  font-size: 23rpx;
  font-weight: 700;
  line-height: 1.2;
}

.profile-age {
  margin-top: 4rpx;
  color: #806b32;
  font-size: 22rpx;
  line-height: 1.2;
}

.profile-meta {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 8rpx;
  color: #555555;
  font-size: 25rpx;
  line-height: 1.35;
}

.fortune-table-card {
  overflow: hidden;
}

.fortune-grid {
  display: grid;
  grid-template-columns: 80rpx repeat(6, minmax(86rpx, 1fr));
  border-bottom: 1rpx solid #eeeeee;
}

.fortune-cell {
  display: flex;
  min-height: 70rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rpx 6rpx;
  border-right: 1rpx solid #eeeeee;
  border-bottom: 1rpx solid #eeeeee;
  color: #333333;
  font-size: 24rpx;
  line-height: 1.25;
  text-align: center;
  box-sizing: border-box;
}

.row-label {
  color: #8c8c8c;
  background: #f8f3e9;
  font-weight: 600;
}

.column-head {
  color: #777777;
  background: #fbf8f1;
  font-weight: 600;
}

.active-column {
  background: #fff8e8;
  color: #806b32;
}

.column-year {
  margin-top: 4rpx;
  color: #999999;
  font-size: 20rpx;
  font-weight: 400;
}

.main-symbol {
  font-size: 42rpx;
  font-weight: 800;
  line-height: 1.1;
}

.hidden-grid {
  display: grid;
  grid-template-columns: 80rpx repeat(6, minmax(86rpx, 1fr));
  min-height: 96rpx;
}

.hidden-label,
.hidden-column {
  padding: 14rpx 6rpx;
  border-right: 1rpx solid #eeeeee;
  box-sizing: border-box;
}

.hidden-label {
  color: #8c8c8c;
  background: #f8f3e9;
  font-size: 24rpx;
  font-weight: 600;
  text-align: center;
}

.hidden-column {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  align-items: center;
}

.hidden-line {
  display: block;
  font-size: 23rpx;
  font-weight: 700;
  line-height: 1.2;
}

.hidden-shishen {
  margin-left: 4rpx;
  color: #666666;
  font-weight: 400;
}

.start-card {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 20rpx 24rpx;
  color: #555555;
  font-size: 24rpx;
  line-height: 1.35;
}

.precision-note {
  color: #999999;
  font-size: 22rpx;
}

.timeline-card {
  display: grid;
  grid-template-columns: 72rpx minmax(0, 1fr);
  overflow: hidden;
}

.timeline-row-title {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1rpx solid #eeeeee;
  background: #f8f3e9;
  color: #806b32;
  font-size: 28rpx;
  font-weight: 700;
  text-align: center;
}

.timeline-scroll {
  width: 100%;
  white-space: nowrap;
}

.timeline-list {
  display: inline-flex;
  min-width: 100%;
}

.fortune-period {
  display: flex;
  width: 106rpx;
  min-height: 154rpx;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 8rpx;
  border-right: 1rpx solid #eeeeee;
  background: #ffffff;
  text-align: center;
  box-sizing: border-box;
}

.fortune-period.active {
  background: #f2eadb;
}

.period-year {
  color: #666666;
  font-size: 22rpx;
  line-height: 1.2;
}

.period-age {
  margin-top: 2rpx;
  color: #999999;
  font-size: 20rpx;
  line-height: 1.2;
}

.period-stem,
.period-branch {
  display: block;
  margin-top: 6rpx;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 1;
}

.period-small {
  margin-top: 14rpx;
  color: #111111;
  font-size: 32rpx;
  font-weight: 700;
}

.period-star {
  margin-top: 6rpx;
  color: #c43131;
  font-size: 20rpx;
  line-height: 1.1;
}

.month-list .fortune-period {
  width: 112rpx;
}

.month-period {
  min-height: 176rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 140rpx 40rpx 0;
  text-align: center;
}

.empty-title {
  color: #111111;
  font-size: 34rpx;
  font-weight: 600;
}

.empty-desc {
  margin-top: 14rpx;
  color: #999999;
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
