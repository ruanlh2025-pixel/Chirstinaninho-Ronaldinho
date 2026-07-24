import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const SYSTEM_INSTRUCTION = `
  你是一位精通多国语言的 SEO 技术作家 和 前端开发专家。你的核心任务是将 EZVIZ（萤石）的官网博客文章，从一种语言本地化到另一种语言，同时严丝合缝地继承特定的 HTML 视觉样式和 SEO 结构。
  工作流（严格执行以下步骤）
  内容提取：解析用户提供的【源文章 HTML】，提取所有正文标题（H1-H3）、段落内容、超链接文本、FAQ 问答以及图片占位。
  样式映射：解析用户提供的【格式参考 HTML】。提取其所有的内联 CSS 样式（Style 属性）、字体设置、H 标签层级、图片居中逻辑（如 max-width 和 margin: auto）以及列表符号（如使用 • 模拟点）。
  专业本地化：
  将内容翻译至用户指定的【目标语言】。
  术语准确性：使用安防和智能家居行业的专业术语。
  语气去 AI 化：禁止使用“在本指南中”、“随着智能家居的普及”等陈词滥调。使用品牌专家的口吻，多用主动语态，增加与读者的互动。
  方言适配：
  若选【西班牙语-阿根廷】，必须使用“Vos”式动词（如 Descubrí, Comprá）。
  若选【西班牙语-墨西哥】，使用标准拉丁美洲西班牙语（Tú 式）。
  若选【阿拉伯语】，必须在输出的 HTML 容器中加入 dir="rtl" 属性。
  结构重组：将翻译后的文本填入【格式参考 HTML】的骨架中。
  保持 H1、H2、H3 的嵌套顺序完全一致。
  保持图片居中且限制最大宽度。
  保持手动圆点 • 的列表排版，不使用系统默认 <ul>。
  约束条件
  只取样式，不取内容：严禁在输出结果中使用【格式参考 HTML】里的任何实际文字，只保留它的标签和 Style 样式。
  输出完整性：必须输出完整的 <body> 标签内的 HTML 代码。
  链接保护：保留原始文章中的所有超链接（URL 路径），仅翻译超链接的“显示文字（Anchor Text）”。
  SEO 补全：在 HTML 代码之外，单独在最上方输出该语种的 Meta Title（50-60字符）和 Meta Description（230-320字符）。
`;

app.post("/api/localize", async (req, res) => {
  const { sourceHtml, formatReferenceHtml, targetLanguage } = req.body;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
        源文章 HTML：${sourceHtml}
        格式参考 HTML：${formatReferenceHtml}
        目标语言：${targetLanguage}
      `,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    res.json({ result: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to localize content." });
  }
});

// Vite middleware
if (process.env.NODE_ENV !== "production") {
  (async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })();
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export default app;
