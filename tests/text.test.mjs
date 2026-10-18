import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../web/components/modules/media_types/media_text.js', import.meta.url), 'utf8');
const { renderText } = new Function('state', 'ensureTextAreaState', 'window', source
    .replace(/^import .*;\r?\n/gm, '')
    .replace(/export function /g, 'function ') + '\nreturn { renderText };'
)({ cards: [] }, () => {}, { location: { origin: 'https://localhost' } });

const render = (text, markdown = false, highlight = false) => renderText({
    id: 'text', textContent: text, textLoadState: 'ready',
    textPreviewMarkdown: markdown, textSyntaxHighlight: highlight,
}).match(/<div class="clab-text-body-content">([\s\S]*?)<\/div>\s*<\/div>\s*<div class="clab-text-toolbar">/)[1];

const visibleText = html => html.replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

test('highlighting preserves code, literals, comments and placeholder-like identifiers', () => {
    const text = 'class Item {}\nconst n = 42;\nconst enabled = true;\nconst url = "https://example.com/#class42";\n// return false\n/* 123 */\n__CLAB_TOKEN_0__ 中文😀';
    assert.equal(visibleText(render(text, false, true)), text);
    assert.match(render(text, false, true), /class="clab-text-token-number">42<\/span>/);
    assert.match(render(text, false, true), /class="clab-text-token-boolean">true<\/span>/);
});

test('highlighted HTML source is displayed literally', () => {
    const text = '<script>alert("hello")</script>\n<img src=x onerror="alert(42)">\na < b && c > d';
    const html = render(text, false, true);
    assert.equal(visibleText(html), text);
    assert.doesNotMatch(html, /<(script|img)\b/i);
});

test('Markdown inline code and links escape source exactly once', () => {
    for (const highlight of [false, true]) {
        const html = render('`a < b && c > d` [A&B](https://example.com/?a=1&b=2)', true, highlight);
        assert.equal(visibleText(html), 'a < b && c > d A&B');
        assert.match(html, /href="https:\/\/example.com\/\?a=1&amp;b=2"/);
        assert.doesNotMatch(html, /&amp;(lt|gt|amp);/);
    }
});

test('headings, paragraphs, lists and fences work without blank separators', () => {
    const html = render('# Title\nParagraph\n- one\n- two\n1. first\n2. second\n> quote\n```js\nconst n = 42;\n```\nAfter', true, true);
    assert.match(html, /<h1[^>]*>Title<\/h1><p[^>]*>Paragraph<\/p>/);
    assert.match(html, /<ul[^>]*><li>one<\/li><li>two<\/li><\/ul>/);
    assert.match(html, /<ol[^>]*><li>first<\/li><li>second<\/li><\/ol>/);
    assert.match(html, /<blockquote[^>]*>quote<\/blockquote>/);
    const code = html.match(/<pre class="clab-text-code-pre"><code>([\s\S]*?)<\/code><\/pre>/)[1];
    assert.equal(visibleText(code), 'const n = 42;\n');
    assert.match(html, /<p[^>]*>After<\/p>$/);
});

test('incomplete fences and literal token names remain readable', () => {
    const html = render('__CLAB_INLINE_CODE_0__ and `__CLAB_BLOCK_0__`\n```\n<incomplete>', true);
    assert.equal(visibleText(html), '__CLAB_INLINE_CODE_0__ and __CLAB_BLOCK_0__<incomplete>');
    assert.match(html, /<pre class="clab-text-code-pre"><code>&lt;incomplete&gt;<\/code>/);
});

test('Markdown links cannot introduce executable URLs or HTML attributes', () => {
    const html = render('[bad](javascript:alert) [good](https://example.com/"onmouseover="x)\n<script>alert(1)</script>', true);
    assert.doesNotMatch(html, /href="javascript:|<script\b|\sonmouseover="/i);
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

function previewFixture() {
    const source = readFileSync(new URL('../web/components/contextmenu/content/editor_logic.js', import.meta.url), 'utf8');
    const store = { activeAreaId: 'text', textEditorState: new Map() };
    const { createEditorLogic } = new Function('previewModalStore', 'externalEditorStore', source
        .replace(/import\s+[\s\S]*?\s+from\s+["'][^"']+["'];?/g, '')
        .replace(/export function /g, 'function ') + '\nreturn { createEditorLogic };'
    )(store, {});
    const area = { id: 'text', textSyntaxHighlight: true, textPreviewMarkdown: true };
    return { area, ...createEditorLogic({ state: { cards: [{ areas: [area] }] } }) };
}

test('reopening a cached preview respects display options changed on its module', () => {
    const { area, getPreviewTextState } = previewFixture();
    const entry = getPreviewTextState('first', '# Original\r\n');
    assert.equal(entry.syntaxHighlight, true);
    assert.equal(entry.previewMarkdown, true);
    area.textSyntaxHighlight = false;
    area.textPreviewMarkdown = false;
    const reopened = getPreviewTextState('first', '# Original\r\n');
    assert.equal(reopened.syntaxHighlight, false);
    assert.equal(reopened.previewMarkdown, false);
    assert.equal(reopened.text, '# Original\r\n');
    assert.equal(reopened.dirty, false);
});

test('preview refreshes preserve unsaved drafts independently for each history record', () => {
    const { area, getPreviewTextState } = previewFixture();
    const first = getPreviewTextState('first', 'First');
    first.text = 'Unsaved draft';
    first.dirty = true;
    area.textPreviewMarkdown = false;
    assert.equal(getPreviewTextState('second', 'Second').text, 'Second');
    const reopened = getPreviewTextState('first', 'First');
    assert.equal(reopened.text, 'Unsaved draft');
    assert.equal(reopened.lastLoadedText, 'First');
    assert.equal(reopened.dirty, true);
    assert.equal(reopened.previewMarkdown, false);
});
