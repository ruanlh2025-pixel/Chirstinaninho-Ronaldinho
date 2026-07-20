/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';

export default function App() {
  const [sourceHtml, setSourceHtml] = useState('');
  const [formatReferenceHtml, setFormatReferenceHtml] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('英语 (English)');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const languages = [
    '葡语 (Portuguese)', '英语 (English)', '泰语 (Thai)', '菲律宾语 (Filipino)', 
    '印尼语 (Indonesian)', '西班牙语-墨西哥 (Spanish Mexico)', '日语 (Japanese)', 
    '荷兰语 (Dutch)', '西班牙语-阿根廷 (Spanish Argentina)', '德语 (German)', 
    '马来语 (Malay)', '阿拉伯语 (Arabic)'
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await fetch('/api/localize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceHtml, formatReferenceHtml, targetLanguage }),
      });
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error(error);
      setResult('Error generating localization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">EZVIZ SEO Localizer</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">源文章 HTML</label>
          <textarea 
            className="w-full h-64 p-4 border border-gray-300 rounded-md"
            value={sourceHtml}
            onChange={(e) => setSourceHtml(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">格式参考 HTML</label>
          <textarea 
            className="w-full h-64 p-4 border border-gray-300 rounded-md"
            value={formatReferenceHtml}
            onChange={(e) => setFormatReferenceHtml(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">目标语言</label>
        <select 
          className="p-2 border border-gray-300 rounded-md"
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
        >
          {languages.map(lang => <option key={lang}>{lang}</option>)}
        </select>
        <button 
          className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Localization'}
        </button>
      </div>
      {result && (
        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-md">
          <h2 className="text-xl font-bold mb-4">Result:</h2>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}

