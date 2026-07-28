<template>
  <view class="page">
    <view class="intro-card">
      <text class="eyebrow">APP内置规则</text>
      <text class="page-title">流派 / 规则说明</text>
      <text class="intro-text">
        这里记录当前版本实际采用的计算方法。不同命理流派可能有不同口径，页面结果均以本说明和当前程序实现为准。
      </text>
    </view>

    <view class="document-list">
      <view v-for="document in RULE_DOCUMENTS" :key="document.id" class="document-card">
        <button class="document-header" @click="toggleDocument(document.id)">
          <view class="document-heading">
            <text class="document-category">{{ document.category }}</text>
            <text class="document-title">{{ document.title }}</text>
            <text class="document-summary">{{ document.summary }}</text>
          </view>
          <view :class="['document-toggle', isExpanded(document.id) ? 'expanded' : '']">
            <view class="document-toggle-line document-toggle-line-left"></view>
            <view class="document-toggle-line document-toggle-line-right"></view>
          </view>
        </button>

        <view v-if="isExpanded(document.id)" class="document-body">
          <view v-for="section in document.sections" :key="document.id + '-' + section.title" class="document-section">
            <text class="section-title">{{ section.title }}</text>
            <text v-for="paragraph in section.paragraphs ?? []" :key="paragraph" class="section-paragraph">
              {{ paragraph }}
            </text>
            <view v-if="section.bullets?.length" class="bullet-list">
              <view v-for="bullet in section.bullets" :key="bullet" class="bullet-row">
                <text class="bullet-dot">•</text>
                <text class="bullet-text">{{ bullet }}</text>
              </view>
            </view>
            <view v-if="section.note" class="section-note">
              <text class="note-label">当前边界</text>
              <text class="note-text">{{ section.note }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="footer-note">
      <text>规则说明会随APP算法版本同步更新。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RULE_DOCUMENTS } from "../../data/rule-documents.ts";

const expandedDocumentIds = ref<Set<string>>(new Set([RULE_DOCUMENTS[0].id]));

function isExpanded(id: string): boolean {
  return expandedDocumentIds.value.has(id);
}

function toggleDocument(id: string): void {
  const nextIds = new Set(expandedDocumentIds.value);
  if (nextIds.has(id)) {
    nextIds.delete(id);
  } else {
    nextIds.add(id);
  }
  expandedDocumentIds.value = nextIds;
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 20rpx 48rpx;
  background: #f5f5f5;
  box-sizing: border-box;
}

.intro-card,
.document-card {
  border: 1rpx solid #dfd2b6;
  border-radius: 10rpx;
  background: #ffffff;
}

.intro-card {
  padding: 28rpx 28rpx 30rpx;
  border-top: 6rpx solid #b54535;
}

.eyebrow {
  display: block;
  color: #a78a46;
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.page-title {
  display: block;
  margin-top: 8rpx;
  color: #1d252a;
  font-size: 38rpx;
  font-weight: 800;
  line-height: 1.25;
}

.intro-text {
  display: block;
  margin-top: 16rpx;
  color: #666666;
  font-size: 25rpx;
  line-height: 1.7;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 20rpx;
}

.document-card {
  overflow: hidden;
}

.document-header {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 152rpx;
  margin: 0;
  padding: 22rpx 20rpx 22rpx 24rpx;
  border: 0;
  border-radius: 0;
  background: #ffffff;
  line-height: normal;
  text-align: left;
  box-sizing: border-box;
}

.document-header::after {
  border: 0;
}

.document-header:active {
  background: #fbf8f1;
}

.document-heading {
  flex: 1;
  min-width: 0;
}

.document-category {
  display: block;
  color: #a78a46;
  font-size: 20rpx;
  font-weight: 700;
}

.document-title {
  display: block;
  margin-top: 5rpx;
  color: #222222;
  font-size: 29rpx;
  font-weight: 800;
  line-height: 1.35;
}

.document-summary {
  display: block;
  margin-top: 9rpx;
  color: #777777;
  font-size: 22rpx;
  line-height: 1.5;
}

.document-toggle {
  position: relative;
  flex: 0 0 auto;
  width: 34rpx;
  height: 28rpx;
  margin-left: 18rpx;
}

.document-toggle-line {
  position: absolute;
  top: 12rpx;
  width: 20rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: #a78a46;
  transition: transform 0.2s ease;
}

.document-toggle-line-left {
  left: 0;
  transform: rotate(38deg);
  transform-origin: right center;
}

.document-toggle-line-right {
  right: 0;
  transform: rotate(-38deg);
  transform-origin: left center;
}

.document-toggle.expanded .document-toggle-line-left {
  transform: rotate(-38deg);
}

.document-toggle.expanded .document-toggle-line-right {
  transform: rotate(38deg);
}

.document-body {
  padding: 2rpx 26rpx 28rpx;
  border-top: 1rpx solid #eee6d7;
}

.document-section {
  padding-top: 26rpx;
}

.document-section + .document-section {
  margin-top: 24rpx;
  border-top: 1rpx dashed #e4dac7;
}

.section-title {
  display: block;
  padding-left: 14rpx;
  border-left: 5rpx solid #b54535;
  color: #262626;
  font-size: 27rpx;
  font-weight: 800;
  line-height: 1.4;
}

.section-paragraph {
  display: block;
  margin-top: 14rpx;
  color: #555555;
  font-size: 24rpx;
  line-height: 1.75;
}

.bullet-list {
  margin-top: 12rpx;
}

.bullet-row {
  display: flex;
  align-items: flex-start;
  margin-top: 8rpx;
}

.bullet-dot {
  flex: 0 0 24rpx;
  color: #a78a46;
  font-size: 25rpx;
  line-height: 1.7;
}

.bullet-text {
  flex: 1;
  color: #555555;
  font-size: 24rpx;
  line-height: 1.7;
}

.section-note {
  margin-top: 18rpx;
  padding: 18rpx 20rpx;
  border-radius: 8rpx;
  background: #f8f3e9;
}

.note-label {
  display: block;
  color: #9b7a31;
  font-size: 21rpx;
  font-weight: 800;
}

.note-text {
  display: block;
  margin-top: 8rpx;
  color: #655c4a;
  font-size: 23rpx;
  line-height: 1.65;
}

.footer-note {
  padding: 28rpx 16rpx 0;
  color: #999999;
  font-size: 21rpx;
  line-height: 1.5;
  text-align: center;
}
</style>
