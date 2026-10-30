const assert = require("assert");
const { addFurigana } = require("./furigana");

const CASES = [
  ["東京は日本の首都です。", "東京[とうきょう]は日本[にほん]の首都[しゅと]です。"],
  ["会議は予定どおり行った。", "会議[かいぎ]は予定[よてい]どおり行[おこな]った。"],
  ["映画を見に行った。", "映画[えいが]を見[み]に行[い]った。"],
  ["一日中、家で本を読みました。", "一日中[いちにちじゅう]、家[いえ]で本[ほん]を読[よ]みました。"],
  ["スタジオジブリの映画を映画館で見る。", "スタジオジブリの映画[えいが]を映画館[えいがかん]で見[み]る。"],
  ["ひらがなとカタカナだけ。", "ひらがなとカタカナだけ。"],
  ["", ""],
];

(async () => {
  for (const [input, expected] of CASES) {
    const got = await addFurigana(input);
    assert.strictEqual(got, expected, `\n  input:    ${input}\n  expected: ${expected}\n  got:      ${got}`);
    console.log("ok  " + got);
  }
  console.log("all tests passed");
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
