import assert from "node:assert/strict";
import { RULE_DOCUMENTS } from "../src/data/rule-documents.ts";

const expectedTitles = [
  "身强身弱-传统派规则",
  "身强身弱-学术派规则",
  "流年大运推算法",
  "格局-判别规则",
  "神煞-判别规则",
];

assert.deepEqual(
  RULE_DOCUMENTS.map((document) => document.title),
  expectedTitles,
  "首批规则说明文档应完整且顺序稳定",
);
assert.equal(new Set(RULE_DOCUMENTS.map((document) => document.id)).size, RULE_DOCUMENTS.length, "文档ID应唯一");

for (const document of RULE_DOCUMENTS) {
  assert(document.summary.trim().length > 20, `${document.title}: 摘要过短或为空`);
  assert(document.sections.length >= 3, `${document.title}: 应包含至少三个说明章节`);
  for (const section of document.sections) {
    assert(section.title.trim(), `${document.title}: 章节标题不能为空`);
    assert(
      Boolean(section.paragraphs?.length || section.bullets?.length),
      `${document.title}/${section.title}: 章节正文不能为空`,
    );
  }
}

console.log("Rule document tests passed: 5 documents");
