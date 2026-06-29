// A single markdown document exercising every supported syntax / component.
// Shared by the HTML-adapter structural test and the cross-adapter parity test.
//
// String.raw keeps LaTeX backslashes (\(, \frac, \\, ...) literal — a plain
// template literal would interpret \f, \( etc. as escape sequences and corrupt
// the math. The document contains no backticks and no ${...}, so String.raw is
// safe here.
export const fullSyntaxMarkdown = String.raw`# H1：基礎語法總覽
## H2：二階
### H3：三階
#### H4：四階
##### H5：五階
###### H6：六階

---
## 一、行內文字格式
**粗體** 與 *斜體* 與 ***粗斜體*** 與 ~~刪除線~~。

---
## 二、清單
無序：
- 蘋果
- 香蕉
  - 香蕉皮
  - 香蕉肉
    - 更深一層
- 櫻桃

有序：
1. 第一
2. 第二
   1. 巢狀
   2. 巢狀
3. 第三

---
## 三、表格
| 左對齊 | 置中  | 右對齊 |
| :----- | :---: | -----: |
| a      |   b   |      c |
| 蘋果   | 香蕉  |   櫻桃 |

---
## 四、連結
標準連結
[標準連結](https://example.com)

外部連結開新分頁
@[Coseeing](https://coseeing.org)

外部連結帶 title
[Coseeing 首頁][[官方網站]](https://coseeing.org)

外部連結開新分頁＋title
@[Coseeing 文件][[Read the docs]](https://docs.coseeing.org)

---

## 五、圖片
基本圖片：
![貓咪 alt](https://s.yimg.com/cv/apiv2/ysun01/cat.jpg)

圖片帶連結：
![貓咪縮圖](https://s.yimg.com/cv/apiv2/ysun01/cat.jpg)((https://example.com/cat))

圖片帶顯示說明：
![貓咪 alt][[點圖看完整貓咪]](https://s.yimg.com/cv/apiv2/ysun01/cat.jpg)

圖片帶顯示說明＋連結：
![貓咪 alt][[點圖跳轉]](https://s.yimg.com/cv/apiv2/ysun01/cat.jpg)((https://example.com/cat))

---
## 六、Iframe
一般 iframe：
@![Example 嵌入頁](https://example.com)

YouTube embed URL：
@![YouTube embed 範例](https://www.youtube.com/embed/dQw4w9WgXcQ)

YouTube watch URL（會自動轉成 embed）：
@![YouTube watch 範例](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

> CodePen embed：
@![CodePen 範例](https://codepen.io/team/codepen/embed/PNaGbb)

---
## 七、數學：LaTeX（bracket 分隔符）
行內 LaTeX：圓面積公式為 \( A = \pi r^{2} \)，畢氏定理 \( a^{2} + b^{2} = c^{2} \)。

積分： \( \int_{0}^{\infty} e^{-x^{2}} \, dx = \frac{\sqrt{\pi}}{2} \)

矩陣：
\( \begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix} \)
分數與根號： \( \frac{-b \pm \sqrt{b^{2} - 4ac}}{2a} \)

---
## 八、混合測試
這是一段更長的混合測試文字，包含多種行內元素的組合運用。在學術寫作中，**關鍵術語**通常需要以粗體呈現，而*外文詞彙*或*書名*則習慣以斜體標示。當我們引用外部資源時，可以這樣連結到 @[MDN Web Docs](https://developer.mozilla.org) 或是 @[W3C](https://www.w3.org) 等權威網站。

接著測試**粗斜體混用**：***這段文字同時是粗體與斜體***，用於強調特別重要的內容。例如 **useState** 這個 React Hook，可以同時表達語法與重要性。

更複雜的情境：當一個句子裡同時出現**粗體連結**透過 @[Access8Math](https://access8math.com) 引用，以及*斜體中包含程式碼*的混合，還有外部資源 @[GitHub Repository](https://github.com) 與 @[npm Package](https://npmjs.com) 並列時，渲染器需要正確處理巢狀語意。

最後一段測試特殊符號與標點：引號「中文引號」與 "English quotes"、破折號 —— 這裡是破折號、省略號 ⋯⋯ 以及全形與半形混排。
`;
