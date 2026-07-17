<template>
  <view class="page">
    <view v-if="record && birthInfo" class="content">
      <view class="summary-card">
        <view class="summary-top">
          <view class="person-title">
            <input
              v-model="nameDraft"
              class="name name-input"
              placeholder="请输入姓名"
              placeholder-class="name-placeholder"
              @blur="saveInlineName"
              @confirm="saveInlineName"
            />
            <text class="gender">{{ record.data.person.gender }}</text>
          </view>
        </view>
        <text class="meta">公历 {{ birthInfo.gregorian_date }} {{ birthInfo.birth_time }}</text>
        <text class="meta">农历 {{ formattedLunarDate }}</text>
      </view>

      <view class="profile-card">
        <view class="day-master">
          <view :class="['day-master-token', getWuXingClass(dayMaster?.wu_xing)]">
            <text class="day-master-symbol">{{ dayMaster?.symbol || "-" }}</text>
            <text class="day-master-label">日主</text>
          </view>
          <view class="profile-copy">
            <text class="section-title">命局摘要</text>
            <text class="profile-line">日主：{{ dayMasterSummary }}</text>
            <text class="profile-line">身强身弱：{{ record.data.geju_analysis?.strength || "-" }}</text>
            <text class="profile-line">格局：{{ record.data.geju_analysis?.geju || "-" }}</text>
          </view>
        </view>
        <view class="summary-strip">
          <button class="summary-item summary-action" @click="openFortune">
            <text class="summary-action-text">流年大运</text>
          </button>
          <view class="summary-item summary-placeholder">
            <text class="summary-placeholder-text">功能建设中</text>
          </view>
        </view>
      </view>

      <view class="chart-table">
        <view class="cell label table-head"></view>
        <view v-for="pillar in pillars" :key="pillar.key" class="cell label table-head">{{ pillar.label }}</view>

        <view class="cell label row-head">主星</view>
        <view v-for="pillar in pillars" :key="pillar.key + '-star'" class="cell">
          {{ pillar.data.heavenly_stem.shi_shen || "-" }}
        </view>

        <view class="cell label row-head">天干</view>
        <view
          v-for="pillar in pillars"
          :key="pillar.key + '-stem'"
          :class="['cell', 'main', getWuXingClass(pillar.data.heavenly_stem.wu_xing)]"
        >
          {{ pillar.data.heavenly_stem.symbol }}
        </view>

        <view class="cell label row-head">地支</view>
        <view
          v-for="pillar in pillars"
          :key="pillar.key + '-branch'"
          :class="['cell', 'main', getWuXingClass(pillar.data.earthly_branch.wu_xing)]"
        >
          {{ pillar.data.earthly_branch.symbol }}
        </view>

        <view class="cell label row-head">藏干</view>
        <view v-for="pillar in pillars" :key="pillar.key + '-hidden'" class="cell small">
          <template v-if="pillar.data.earthly_branch.hidden_stems?.length">
            <text
              v-for="hidden in pillar.data.earthly_branch.hidden_stems"
              :key="pillar.key + '-hidden-' + hidden.symbol"
              class="cell-line"
            >
              {{ hidden.symbol }}
            </text>
          </template>
          <text v-else>-</text>
        </view>

        <view class="cell label row-head">副星</view>
        <view v-for="pillar in pillars" :key="pillar.key + '-secondary'" class="cell small">
          <template v-if="pillar.data.earthly_branch.hidden_stems?.length">
            <text
              v-for="(hidden, index) in pillar.data.earthly_branch.hidden_stems"
              :key="pillar.key + '-secondary-' + hidden.symbol + '-' + index"
              class="cell-line"
            >
              {{ hidden.shi_shen || "-" }}
            </text>
          </template>
          <text v-else>-</text>
        </view>

        <view class="cell label row-head">神煞</view>
        <view v-for="pillar in shenShaPillars" :key="pillar.key + '-shen-sha'" class="cell small shen-sha-cell">
          <template v-if="pillar.items.length">
            <button
              v-for="item in pillar.items"
              :key="pillar.key + '-shen-sha-' + item.name"
              class="shen-sha-chip"
              @click.stop="openShenSha(item.name)"
            >
              {{ item.name }}
            </button>
          </template>
          <text v-else>-</text>
        </view>
      </view>

      <view v-if="selectedShenShaDetail" class="modal-mask" @click="closeShenSha">
        <view class="shen-sha-modal" @click.stop>
          <view class="shen-sha-modal-head">
            <text class="shen-sha-modal-title">{{ selectedShenShaDetail.name }}</text>
            <button class="modal-close" @click="closeShenSha">×</button>
          </view>
          <scroll-view scroll-y class="shen-sha-modal-body">
            <text class="shen-sha-section-title">神煞释义</text>
            <text class="shen-sha-modal-text">{{ selectedShenShaDetail.summary }}</text>
            <text class="shen-sha-section-title">查法</text>
            <text class="shen-sha-modal-text">{{ selectedShenShaDetail.checkMethod }}</text>
            <text class="shen-sha-section-title">本盘落点</text>
            <text class="shen-sha-modal-text">{{ selectedShenShaDetail.occurrenceText }}</text>
            <text class="shen-sha-section-title">说明</text>
            <text class="shen-sha-modal-text">{{ selectedShenShaDetail.detail }}</text>
          </scroll-view>
        </view>
      </view>

      <view class="relation-card">
        <text class="section-title">八字作用关系速览</text>
        <view class="relation-board">
          <view class="relation-section">
            <view v-if="relationLines.stem.length" class="relation-line-list">
              <view v-for="line in relationLines.stem" :key="line.id" class="relation-line-row">
                <view :class="['relation-track', line.typeClass]" :style="line.trackStyle"></view>
                <text :class="['relation-line-label', line.typeClass]" :style="line.labelStyle">{{ line.label }}</text>
                <text
                  v-for="node in line.nodes"
                  :key="node.key"
                  :class="['relation-token', line.typeClass]"
                  :style="node.style"
                >
                  {{ node.symbol }}
                </text>
              </view>
            </view>
            <text v-else class="relation-empty">暂无天干关系</text>
          </view>

          <view class="relation-pillars">
            <view v-for="pillar in relationPillars" :key="pillar.key" class="relation-pillar">
              <text class="relation-pillar-label">{{ pillar.label }}</text>
              <text :class="['relation-pillar-symbol', pillar.stemClass]">{{ pillar.stem }}</text>
              <text :class="['relation-pillar-symbol', pillar.branchClass]">{{ pillar.branch }}</text>
            </view>
          </view>

          <view class="relation-section branch-relation-section">
            <view v-if="relationLines.branch.length" class="relation-line-list">
              <view v-for="line in relationLines.branch" :key="line.id" class="relation-line-row">
                <view :class="['relation-track', line.typeClass]" :style="line.trackStyle"></view>
                <text :class="['relation-line-label', line.typeClass]" :style="line.labelStyle">{{ line.label }}</text>
                <text
                  v-for="node in line.nodes"
                  :key="node.key"
                  :class="['relation-token', line.typeClass]"
                  :style="node.style"
                >
                  {{ node.symbol }}
                </text>
              </view>
            </view>
            <text v-else class="relation-empty">暂无地支关系</text>
          </view>
        </view>
      </view>

      <view class="distribution-card">
        <view class="section-head">
          <text class="section-title">五行分布</text>
          <text class="section-note">天干、地支、藏干逐项计入</text>
        </view>
        <view class="distribution-list">
          <view v-for="stat in wuXingStats" :key="stat.name" class="distribution-row">
            <text :class="['distribution-name', stat.textClass]">{{ stat.name }}</text>
            <view class="distribution-track">
              <view :class="['distribution-bar', stat.barClass]" :style="{ width: stat.percent + '%' }"></view>
            </view>
            <text class="distribution-count">{{ stat.count }}</text>
          </view>
        </view>
      </view>

      <view class="detail-card">
        <text class="section-title">四柱明细</text>
        <view v-for="pillar in pillarDetails" :key="pillar.key" class="pillar-detail">
          <view class="pillar-detail-head">
            <text class="pillar-detail-label">{{ pillar.label }}</text>
            <view class="pillar-ganzhi">
              <text :class="['pillar-ganzhi-symbol', pillar.stem.textClass]">{{ pillar.stem.symbol }}</text>
              <text :class="['pillar-ganzhi-symbol', pillar.branch.textClass]">{{ pillar.branch.symbol }}</text>
            </view>
          </view>
          <view class="pillar-meta-grid">
            <text>主星：{{ pillar.mainStar }}</text>
            <text>天干：{{ pillar.stem.meta }}</text>
            <text>地支：{{ pillar.branch.meta }}</text>
          </view>
          <view class="hidden-stems">
            <text class="hidden-label">藏干</text>
            <view class="hidden-chip-list">
              <view v-for="hidden in pillar.hiddenStems" :key="hidden.key" class="hidden-chip">
                <text :class="['hidden-symbol', hidden.textClass]">{{ hidden.symbol }}</text>
                <text class="hidden-meta">{{ hidden.meta }} · {{ hidden.shiShen }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="action-row">
        <button class="outline-button" @click="newChart">再排一次</button>
        <button class="primary-button" @click="openHistory">历史记录</button>
      </view>
    </view>

    <view v-else class="empty">
      <text class="empty-title">未找到命盘记录</text>
      <text class="empty-desc">这条记录可能已被删除，请返回重新排盘。</text>
      <button class="empty-button" @click="newChart">返回排盘</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { HistoryRecord } from "../../services/history.ts";
import type { WuXing } from "../../core/types.ts";
import { analyzeGanzhiRelations, type GanzhiRelation } from "../../core/relations.ts";
import { analyzeShenSha, getShenShaDefinition, type ShenShaHit } from "../../core/shen-sha.ts";
import { readHistory, updateHistoryRecordName } from "../../services/history.ts";

interface RelationLineView {
  id: string;
  label: string;
  typeClass: string;
  trackStyle: Record<string, string>;
  labelStyle: Record<string, string>;
  nodes: Array<{
    key: string;
    symbol: string;
    style: Record<string, string>;
  }>;
}

const record = ref<HistoryRecord | null>(null);
const nameDraft = ref("");
const selectedShenShaName = ref<string | null>(null);
const wuXingOrder: WuXing[] = ["木", "火", "土", "金", "水"];

onLoad((query) => {
  const id = query?.id;
  record.value = readHistory().find((item) => item.id === id) ?? null;
  nameDraft.value = record.value?.data.person.name ?? "";
});

const birthInfo = computed(() => record.value?.data.person.birth_info ?? null);
const pillars = computed(() => {
  const info = birthInfo.value;
  return info
    ? [
        { key: "year", label: "年柱", data: info.year },
        { key: "month", label: "月柱", data: info.month },
        { key: "day", label: "日柱", data: info.day },
        { key: "hour", label: "时柱", data: info.hour },
      ]
    : [];
});
const dayMaster = computed(() => birthInfo.value?.day.heavenly_stem ?? null);
const dayMasterSummary = computed(() => {
  const master = dayMaster.value;
  if (!master) {
    return "-";
  }
  return [master.symbol, master.yin_yang, master.wu_xing].filter(Boolean).join(" · ");
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
const wuXingStats = computed(() => {
  const counts: Record<WuXing, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  pillars.value.forEach((pillar) => {
    addWuXingCount(counts, pillar.data.heavenly_stem.wu_xing);
    addWuXingCount(counts, pillar.data.earthly_branch.wu_xing);
    pillar.data.earthly_branch.hidden_stems?.forEach((hiddenStem) => {
      addWuXingCount(counts, hiddenStem.wu_xing);
    });
  });

  const maxCount = Math.max(...wuXingOrder.map((item) => counts[item]), 1);
  return wuXingOrder.map((name) => ({
    name,
    count: counts[name],
    percent: counts[name] === 0 ? 0 : Math.max(12, Math.round((counts[name] / maxCount) * 100)),
    textClass: getWuXingClass(name),
    barClass: `${getWuXingClass(name)}-bg`,
  }));
});
const pillarDetails = computed(() =>
  pillars.value.map((pillar) => ({
    key: pillar.key,
    label: pillar.label,
    mainStar: pillar.data.heavenly_stem.shi_shen || "-",
    stem: {
      symbol: pillar.data.heavenly_stem.symbol,
      meta: formatElementMeta(pillar.data.heavenly_stem.yin_yang, pillar.data.heavenly_stem.wu_xing),
      textClass: getWuXingClass(pillar.data.heavenly_stem.wu_xing),
    },
    branch: {
      symbol: pillar.data.earthly_branch.symbol,
      meta: formatElementMeta(pillar.data.earthly_branch.yin_yang, pillar.data.earthly_branch.wu_xing),
      textClass: getWuXingClass(pillar.data.earthly_branch.wu_xing),
    },
    hiddenStems:
      pillar.data.earthly_branch.hidden_stems?.map((hiddenStem, index) => ({
        key: `${pillar.key}-${hiddenStem.symbol}-${index}`,
        symbol: hiddenStem.symbol,
        shiShen: hiddenStem.shi_shen || "-",
        meta: formatElementMeta(hiddenStem.yin_yang, hiddenStem.wu_xing),
        textClass: getWuXingClass(hiddenStem.wu_xing),
      })) ?? [],
  })),
);
const shenShaByPillar = computed(() => {
  const data = record.value?.data;
  return data
    ? analyzeShenSha(data)
    : {
        year: [],
        month: [],
        day: [],
        hour: [],
      };
});
const shenShaPillars = computed(() =>
  pillars.value.map((pillar) => ({
    key: pillar.key,
    label: pillar.label,
    items: shenShaByPillar.value[pillar.key],
  })),
);
const selectedShenShaDetail = computed(() => {
  const name = selectedShenShaName.value;
  if (!name) {
    return null;
  }

  const definition = getShenShaDefinition(name);
  if (!definition) {
    return null;
  }

  const occurrences = Object.values(shenShaByPillar.value)
    .flat()
    .filter((item) => item.name === name);
  return {
    ...definition,
    occurrenceText: formatShenShaOccurrences(occurrences),
  };
});
const relationPillars = computed(() =>
  pillars.value.map((pillar) => ({
    key: pillar.key,
    label: pillar.label,
    stem: pillar.data.heavenly_stem.symbol,
    branch: pillar.data.earthly_branch.symbol,
    stemClass: getWuXingClass(pillar.data.heavenly_stem.wu_xing),
    branchClass: getWuXingClass(pillar.data.earthly_branch.wu_xing),
  })),
);
const relationLines = computed(() => {
  const data = record.value?.data;
  if (!data) {
    return { stem: [] as RelationLineView[], branch: [] as RelationLineView[] };
  }

  const relations = analyzeGanzhiRelations(data);
  return {
    stem: toRelationLineViews(relations.filter((relation) => relation.layer === "stem")),
    branch: toRelationLineViews(relations.filter((relation) => relation.layer === "branch")),
  };
});

function openHistory() {
  uni.reLaunch({ url: "/pages/history/history" });
}

function openFortune() {
  if (!record.value) {
    return;
  }
  uni.navigateTo({ url: `/pages/fortune/fortune?id=${record.value.id}` });
}

function openShenSha(name: string) {
  selectedShenShaName.value = name;
}

function closeShenSha() {
  selectedShenShaName.value = null;
}

function newChart() {
  uni.reLaunch({ url: "/pages/index/index" });
}

function saveInlineName() {
  if (!record.value) {
    return;
  }

  const nextName = nameDraft.value.trim();
  if (!nextName) {
    nameDraft.value = record.value.data.person.name;
    uni.showToast({ title: "姓名不能为空", icon: "none" });
    return;
  }
  if (nextName === record.value.data.person.name) {
    nameDraft.value = nextName;
    return;
  }

  const updatedRecord = updateHistoryRecordName(record.value?.id ?? "", nextName);
  if (!updatedRecord) {
    nameDraft.value = record.value.data.person.name;
    uni.showToast({ title: "记录不存在", icon: "none" });
    return;
  }
  record.value = updatedRecord;
  nameDraft.value = updatedRecord.data.person.name;
  uni.showToast({ title: "已保存", icon: "success" });
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

function addWuXingCount(counts: Record<WuXing, number>, wuXing?: string): void {
  if (wuXingOrder.includes(wuXing as WuXing)) {
    counts[wuXing as WuXing] += 1;
  }
}

function formatElementMeta(yinYang?: string, wuXing?: string): string {
  return [yinYang, wuXing].filter(Boolean).join("") || "-";
}

function formatShenShaOccurrences(occurrences: ShenShaHit[]): string {
  if (!occurrences.length) {
    return "本盘未命中。";
  }

  return occurrences.map((item) => `${item.pillarLabel}：${item.basis}`).join("\n");
}

function toRelationLineViews(relations: GanzhiRelation[]): RelationLineView[] {
  return relations.map((relation) => {
    const indexes = relation.positionIndexes;
    const left = Math.min(...indexes);
    const right = Math.max(...indexes);
    const leftPercent = getRelationAnchorPercent(left);
    const rightPercent = getRelationAnchorPercent(right);
    const centerPercent = (leftPercent + rightPercent) / 2;

    return {
      id: relation.id,
      label: relation.label,
      typeClass: getRelationTypeClass(relation.type),
      trackStyle: {
        left: `${leftPercent}%`,
        width: `${Math.max(rightPercent - leftPercent, 0)}%`,
      },
      labelStyle: {
        left: `${centerPercent}%`,
      },
      nodes: relation.positions.map((position, index) => ({
        key: `${relation.id}-${position}-${index}`,
        symbol: relation.symbols[index],
        style: {
          left: `${getRelationAnchorPercent(relation.positionIndexes[index])}%`,
        },
      })),
    };
  });
}

function getRelationAnchorPercent(index: number): number {
  return 12.5 + index * 25;
}

function getRelationTypeClass(type: GanzhiRelation["type"]): string {
  const classMap: Record<GanzhiRelation["type"], string> = {
    合: "relation-harmony",
    半合: "relation-harmony",
    三合: "relation-harmony",
    三会: "relation-harmony",
    冲: "relation-clash",
    刑: "relation-punish",
    害: "relation-harm",
    破: "relation-break",
    克: "relation-overcome",
  };
  return classMap[type];
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
  gap: 20rpx;
}

.summary-card,
.profile-card,
.relation-card,
.distribution-card,
.detail-card {
  border: 1rpx solid #dfd2b6;
  border-radius: 8rpx;
  background: #ffffff;
}

.summary-card {
  padding: 26rpx 28rpx;
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 14rpx;
}

.person-title {
  display: flex;
  flex: 1;
  align-items: baseline;
  min-width: 0;
}

.name {
  overflow: hidden;
  flex: 0 1 auto;
  width: auto;
  max-width: 260rpx;
  height: 50rpx;
  min-height: 50rpx;
  padding: 0;
  color: #111111;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 50rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name-input {
  background: transparent;
}

.name-placeholder {
  color: #999999;
}

.gender {
  flex: 0 0 auto;
  margin-left: 12rpx;
  color: #aa914f;
  font-size: 28rpx;
}

.meta {
  display: block;
  color: #666666;
  font-size: 26rpx;
  line-height: 1.55;
}

.profile-card {
  padding: 22rpx 24rpx;
}

.day-master {
  display: flex;
  gap: 22rpx;
  align-items: center;
}

.day-master-token {
  display: flex;
  flex: 0 0 112rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 112rpx;
  border: 2rpx solid #dfd2b6;
  border-radius: 50%;
  background: #fbf8f1;
}

.day-master-symbol {
  font-size: 48rpx;
  font-weight: 800;
  line-height: 1;
}

.day-master-label {
  margin-top: 8rpx;
  color: #8c8c8c;
  font-size: 22rpx;
  line-height: 1;
}

.profile-copy {
  flex: 1;
  min-width: 0;
}

.profile-line {
  display: block;
  color: #555555;
  font-size: 26rpx;
  line-height: 1.55;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
  margin-top: 22rpx;
}

.summary-item {
  min-width: 0;
  min-height: 54rpx;
  padding: 8rpx 12rpx;
  border-radius: 6rpx;
  background: #f8f3e9;
  box-sizing: border-box;
  text-align: center;
}

.summary-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 54rpx;
  margin: 0;
  border: 0;
  background: #c43131;
  box-sizing: border-box;
  line-height: normal;
}

.summary-action:active {
  background: #a92525;
}

.summary-action::after {
  border: 0;
}

.summary-action-text {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.2;
}

.summary-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-placeholder-text {
  color: #8c8c8c;
  font-size: 22rpx;
  line-height: 1.2;
}

.summary-label,
.summary-value {
  display: block;
}

.summary-label {
  color: #8c8c8c;
  font-size: 22rpx;
  line-height: 1.2;
}

.summary-value {
  margin-top: 8rpx;
  color: #111111;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 1.2;
}

.chart-table {
  display: grid;
  overflow: hidden;
  grid-template-columns: 88rpx repeat(4, 1fr);
  border: 1rpx solid #dfd2b6;
  border-radius: 8rpx;
  background: #ffffff;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 72rpx;
  padding: 12rpx 8rpx;
  border-right: 1rpx solid #eadfca;
  border-bottom: 1rpx solid #eadfca;
  color: #333333;
  font-size: 24rpx;
  line-height: 1.35;
  text-align: center;
  box-sizing: border-box;
}

.label {
  color: #7c715f;
  background: #f6f0e4;
}

.table-head,
.row-head {
  font-weight: 700;
}

.main {
  font-size: 48rpx;
  font-weight: 700;
  line-height: 1.1;
}

.small {
  color: #666666;
  font-size: 22rpx;
}

.cell-line {
  display: block;
  line-height: 1.45;
}

.shen-sha-cell {
  justify-content: flex-start;
  min-height: 132rpx;
  padding: 14rpx 6rpx;
}

.shen-sha-chip {
  display: block;
  width: 100%;
  min-height: 34rpx;
  margin: 0;
  padding: 0 2rpx;
  border: 0;
  background: transparent;
  color: #9a8546;
  font-size: 23rpx;
  line-height: 34rpx;
  text-align: center;
}

.shen-sha-chip::after {
  border: 0;
}

.shen-sha-chip:active {
  color: #7d6425;
  background: #f8f3e9;
}

.modal-mask {
  position: fixed;
  z-index: 20;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 52rpx 42rpx;
  background: rgba(0, 0, 0, 0.55);
  box-sizing: border-box;
}

.shen-sha-modal {
  overflow: hidden;
  width: 100%;
  max-width: 680rpx;
  max-height: 82vh;
  border-radius: 18rpx;
  background: #ffffff;
}

.shen-sha-modal-head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  padding: 0 88rpx;
  border-bottom: 1rpx solid #eeeeee;
  box-sizing: border-box;
}

.shen-sha-modal-title {
  overflow: hidden;
  color: #111111;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-close {
  position: absolute;
  top: 0;
  right: 10rpx;
  width: 78rpx;
  height: 88rpx;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: #111111;
  font-size: 56rpx;
  font-weight: 300;
  line-height: 84rpx;
  text-align: center;
}

.modal-close::after {
  border: 0;
}

.shen-sha-modal-body {
  max-height: calc(82vh - 88rpx);
  padding: 28rpx 30rpx 34rpx;
  box-sizing: border-box;
}

.shen-sha-section-title {
  display: block;
  margin-top: 20rpx;
  color: #9a8546;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.35;
}

.shen-sha-section-title:first-child {
  margin-top: 0;
}

.shen-sha-modal-text {
  display: block;
  margin-top: 8rpx;
  color: #666666;
  font-size: 28rpx;
  line-height: 1.62;
  white-space: pre-line;
}

.relation-card,
.distribution-card,
.detail-card {
  padding: 22rpx 24rpx;
}

.relation-board {
  padding-top: 2rpx;
}

.relation-section {
  position: relative;
}

.relation-line-list {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.relation-line-row {
  position: relative;
  height: 58rpx;
}

.relation-track {
  position: absolute;
  top: 35rpx;
  height: 2rpx;
  background: #777777;
}

.relation-line-label {
  position: absolute;
  top: 0;
  min-width: 112rpx;
  color: #555555;
  font-size: 22rpx;
  line-height: 28rpx;
  text-align: center;
  transform: translateX(-50%);
  white-space: nowrap;
}

.relation-token {
  position: absolute;
  top: 19rpx;
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #777777;
  border-radius: 50%;
  background: #ffffff;
  color: #333333;
  font-size: 22rpx;
  font-weight: 600;
  line-height: 30rpx;
  text-align: center;
  transform: translateX(-50%);
  box-sizing: border-box;
}

.relation-line-label.relation-harmony,
.relation-token.relation-harmony {
  color: #2f7d48;
}

.relation-track.relation-harmony {
  background: #58a66d;
}

.relation-token.relation-harmony {
  border-color: #58a66d;
  background: #ffffff;
}

.relation-line-label.relation-clash,
.relation-token.relation-clash {
  color: #c43131;
}

.relation-track.relation-clash {
  background: #d45a54;
}

.relation-token.relation-clash {
  border-color: #d45a54;
  background: #ffffff;
}

.relation-line-label.relation-punish,
.relation-token.relation-punish {
  color: #8a5c18;
}

.relation-track.relation-punish {
  background: #a8792c;
}

.relation-token.relation-punish {
  border-color: #a8792c;
  background: #ffffff;
}

.relation-line-label.relation-harm,
.relation-token.relation-harm {
  color: #9a6418;
}

.relation-track.relation-harm {
  background: #c28a38;
}

.relation-token.relation-harm {
  border-color: #c28a38;
  background: #ffffff;
}

.relation-line-label.relation-break,
.relation-token.relation-break {
  color: #666666;
}

.relation-track.relation-break {
  background: #8a8a8a;
}

.relation-token.relation-break {
  border-color: #8a8a8a;
  background: #ffffff;
}

.relation-line-label.relation-overcome,
.relation-token.relation-overcome {
  color: #333333;
}

.relation-track.relation-overcome {
  background: #555555;
}

.relation-token.relation-overcome {
  border-color: #555555;
  background: #ffffff;
}

.relation-empty {
  display: block;
  height: 52rpx;
  color: #b0b0b0;
  font-size: 24rpx;
  line-height: 52rpx;
  text-align: center;
}

.relation-pillars {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10rpx;
  margin: 12rpx 0 10rpx;
  padding: 18rpx 0;
  border-top: 1rpx solid #eeeeee;
  border-bottom: 1rpx solid #eeeeee;
}

.relation-pillar {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
}

.relation-pillar-label {
  color: #9b9b9b;
  font-size: 24rpx;
  line-height: 1.2;
}

.relation-pillar-symbol {
  display: block;
  margin-top: 8rpx;
  font-size: 42rpx;
  font-weight: 700;
  line-height: 1;
}

.branch-relation-section {
  margin-top: 2rpx;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 18rpx;
}

.section-title {
  display: block;
  margin-bottom: 16rpx;
  color: #111111;
  font-size: 30rpx;
  font-weight: 600;
}

.section-note {
  color: #a6a6a6;
  font-size: 22rpx;
  line-height: 1.3;
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.distribution-row {
  display: grid;
  grid-template-columns: 42rpx 1fr 42rpx;
  gap: 14rpx;
  align-items: center;
}

.distribution-name {
  font-size: 26rpx;
  font-weight: 600;
}

.distribution-track {
  overflow: hidden;
  height: 16rpx;
  border-radius: 99rpx;
  background: #f1f1f1;
}

.distribution-bar {
  height: 16rpx;
  border-radius: 99rpx;
}

.distribution-count {
  color: #777777;
  font-size: 24rpx;
  text-align: right;
}

.pillar-detail {
  padding: 20rpx 0;
  border-top: 1rpx solid #eeeeee;
}

.pillar-detail:first-of-type {
  padding-top: 0;
  border-top: 0;
}

.pillar-detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pillar-detail-label {
  color: #806b32;
  font-size: 28rpx;
  font-weight: 600;
}

.pillar-ganzhi {
  display: flex;
  gap: 8rpx;
}

.pillar-ganzhi-symbol {
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1;
}

.pillar-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8rpx;
  margin-top: 16rpx;
  color: #666666;
  font-size: 24rpx;
  line-height: 1.35;
}

.hidden-stems {
  display: flex;
  gap: 14rpx;
  margin-top: 16rpx;
}

.hidden-label {
  flex: 0 0 56rpx;
  color: #999999;
  font-size: 24rpx;
  line-height: 44rpx;
}

.hidden-chip-list {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 10rpx;
}

.hidden-chip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-height: 44rpx;
  padding: 0 12rpx;
  border-radius: 6rpx;
  background: #f7f7f7;
}

.hidden-symbol {
  font-size: 26rpx;
  font-weight: 700;
}

.hidden-meta {
  color: #777777;
  font-size: 22rpx;
}

.action-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14rpx;
  margin-top: 4rpx;
}

.outline-button,
.primary-button {
  height: 82rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  line-height: 82rpx;
}

.outline-button {
  border: 1rpx solid #c43131;
  background: #ffffff;
  color: #c43131;
}

.primary-button {
  background: #c43131;
  color: #ffffff;
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

.wx-fire-bg {
  background: #d63b32;
}

.wx-wood-bg {
  background: #2f9e44;
}

.wx-metal-bg {
  background: #d7a928;
}

.wx-water-bg {
  background: #1f78d1;
}

.wx-earth-bg {
  background: #8a5c18;
}

/* Chart reading surface: a single paper sheet on ink, with the four pillars as the visual anchor. */
.page {
  min-height: 100vh;
  padding: 28rpx 20rpx 40rpx;
  background: var(--ink);
  box-sizing: border-box;
}

.content {
  overflow: hidden;
  gap: 0;
  border: 1rpx solid rgba(222, 216, 202, 0.82);
  border-radius: 22rpx;
  background: var(--paper);
  box-shadow: 0 20rpx 46rpx rgba(0, 0, 0, 0.23);
}

.summary-card,
.profile-card,
.relation-card,
.distribution-card,
.detail-card {
  border: 0;
  border-bottom: 1rpx solid var(--line);
  border-radius: 0;
  background: transparent;
}

.summary-card { padding: 30rpx 30rpx 26rpx; }
.summary-top { margin-bottom: 12rpx; }
.name { max-width: 340rpx; height: 58rpx; color: var(--text); font-size: 42rpx; line-height: 58rpx; }
.gender { color: var(--cinnabar); font-size: 25rpx; font-weight: 700; }
.meta { color: var(--muted); font-size: 24rpx; line-height: 1.65; }

.profile-card { padding: 26rpx 30rpx 28rpx; }
.day-master { gap: 22rpx; }
.day-master-token {
  flex-basis: 108rpx;
  width: 108rpx;
  height: 108rpx;
  border: 2rpx solid var(--gold);
  background: #fcfaf3;
  box-shadow: inset 0 0 0 6rpx rgba(182, 145, 85, 0.08);
}
.day-master-symbol { font-size: 51rpx; }
.day-master-label { color: var(--gold); font-size: 20rpx; }
.profile-line { color: #5e625c; font-size: 24rpx; line-height: 1.6; }
.section-title { position: relative; margin-bottom: 15rpx; padding-left: 14rpx; color: var(--text); font-size: 29rpx; font-weight: 700; }
.section-title::before { position: absolute; top: 6rpx; bottom: 6rpx; left: 0; width: 4rpx; border-radius: 99rpx; background: var(--gold); content: ""; }

.summary-strip { gap: 12rpx; margin-top: 20rpx; }
.summary-item { border: 1rpx solid var(--line); border-radius: 10rpx; background: #fcfaf3; }
.summary-action { min-height: 54rpx; border: 0; border-radius: 10rpx; background: var(--cinnabar); }
.summary-action:active { background: var(--cinnabar-deep); }
.summary-action-text { color: #fffdf8; font-size: 25rpx; letter-spacing: 1rpx; }
.summary-placeholder-text { color: var(--muted); font-size: 20rpx; }
.summary-label { color: var(--muted); font-size: 20rpx; }
.summary-value { color: var(--text); font-size: 29rpx; }

.chart-table {
  margin: 24rpx 20rpx;
  border-color: var(--line);
  border-radius: 13rpx;
  background: var(--paper-strong);
}

.cell {
  min-height: 72rpx;
  padding: 11rpx 6rpx;
  border-right-color: var(--line-soft);
  border-bottom-color: var(--line-soft);
  color: #4b4e49;
  font-size: 22rpx;
}

.label { color: #716b5d; background: #f1ede3; }
.table-head { color: var(--text); font-size: 23rpx; }
.row-head { color: var(--gold); font-size: 21rpx; }
.main { font-size: 46rpx; }
.cell.main.wx-fire { color: #d63b32; }
.cell.main.wx-wood { color: #2f9e44; }
.cell.main.wx-metal { color: #d7a928; }
.cell.main.wx-water { color: #1f78d1; }
.cell.main.wx-earth { color: #8a5c18; }
.small { color: #676b63; font-size: 20rpx; }
.shen-sha-cell { min-height: 124rpx; }
.shen-sha-chip { color: var(--gold); font-size: 20rpx; }
.shen-sha-chip:active { color: var(--cinnabar); background: #f5eee5; }

.relation-card,
.distribution-card,
.detail-card { padding: 26rpx 30rpx; }
.relation-board { padding-top: 0; }
.relation-line-list { gap: 6rpx; }
.relation-line-row { height: 58rpx; }
.relation-pillars { margin: 12rpx 0; padding: 16rpx 0; border-top-color: var(--line-soft); border-bottom-color: var(--line-soft); }
.relation-pillar-label { color: var(--muted); font-size: 22rpx; }
.relation-pillar-symbol { font-size: 39rpx; }
.relation-token { background: var(--paper-strong); }
.relation-empty { color: var(--muted); }
.section-note { color: var(--muted); font-size: 20rpx; }

.distribution-list { gap: 14rpx; }
.distribution-row { grid-template-columns: 42rpx 1fr 40rpx; }
.distribution-name { font-size: 24rpx; }
.distribution-track { height: 12rpx; background: #e8e4da; }
.distribution-bar { height: 12rpx; }
.distribution-count { color: var(--muted); font-size: 22rpx; }

.pillar-detail { padding: 22rpx 0; border-top-color: var(--line-soft); }
.pillar-detail-label { color: var(--gold); font-size: 27rpx; }
.pillar-ganzhi-symbol { font-size: 37rpx; }
.pillar-meta-grid { color: #62665e; font-size: 22rpx; }
.hidden-label { color: var(--muted); font-size: 22rpx; }
.hidden-chip { border: 1rpx solid var(--line-soft); border-radius: 8rpx; background: #fcfaf3; }
.hidden-meta { color: var(--muted); }

.action-row { gap: 12rpx; margin: 4rpx 30rpx 30rpx; }
.outline-button,
.primary-button { height: 82rpx; border-radius: 12rpx; font-size: 27rpx; line-height: 82rpx; }
.outline-button { border-color: var(--cinnabar); background: transparent; color: var(--cinnabar); }
.primary-button { background: var(--cinnabar); color: #fffdf8; }
.primary-button:active { background: var(--cinnabar-deep); }

.modal-mask { background: rgba(6, 16, 22, 0.72); }
.shen-sha-modal { border: 1rpx solid rgba(182, 145, 85, 0.58); border-radius: 18rpx; background: var(--paper); box-shadow: 0 24rpx 50rpx rgba(0, 0, 0, 0.28); }
.shen-sha-modal-head { border-bottom-color: var(--line); }
.shen-sha-modal-title { color: var(--text); font-size: 33rpx; }
.modal-close { color: var(--cinnabar); }
.shen-sha-section-title { color: var(--gold); font-size: 26rpx; }
.shen-sha-modal-text { color: #575c54; font-size: 25rpx; }

.empty { padding: 170rpx 40rpx 0; }
.empty-title { color: var(--paper); }
.empty-desc { color: rgba(247, 245, 239, 0.62); }
.empty-button { border-radius: 12rpx; background: var(--cinnabar); color: #fffdf8; }
</style>
