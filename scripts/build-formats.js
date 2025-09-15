#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔨 Building different formats...');

// Создаем папки
const distDir = 'dist';
const separatedDir = path.join(distDir, 'separated');
const minimalDir = path.join(distDir, 'minimal');

[distDir, separatedDir, minimalDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Читаем исходный файл
const sourceFile = 'index.html';
if (!fs.existsSync(sourceFile)) {
  console.error('❌ Source file not found:', sourceFile);
  process.exit(1);
}

const html = fs.readFileSync(sourceFile, 'utf8');

// 1. Standalone версия (уже есть в dist/index.html после минификации)
console.log('✅ Standalone version: dist/index.html');

// 2. Separated версия (CSS и JS в отдельных файлах)
const cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
const jsMatch = html.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/);

if (cssMatch) {
  fs.writeFileSync(path.join(separatedDir, 'styles.css'), cssMatch[1].trim());
}

if (jsMatch) {
  fs.writeFileSync(path.join(separatedDir, 'script.js'), jsMatch[1].trim());
}

// Создаем HTML с внешними ссылками
let separatedHtml = html
  .replace(/<style[^>]*>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="styles.css">')
  .replace(/<script(?![^>]*src)[^>]*>[\s\S]*?<\/script>/, '<script src="script.js"></script>');

fs.writeFileSync(path.join(separatedDir, 'index.html'), separatedHtml);
console.log('✅ Separated version: dist/separated/');

// 3. Minimal версия (только основные функции, без дополнительных размеров)
let minimalHtml = html
  .replace(/DEFAULT_SIZES=\[.*?\]/, 'DEFAULT_SIZES=[16,32,48,192]')
  .replace(/console\.log\([^)]*\);?/g, '')
  .replace(/console\.warn\([^)]*\);?/g, '')
  .replace(/console\.error\([^)]*\);?/g, '');

fs.writeFileSync(path.join(minimalDir, 'index.html'), minimalHtml);
console.log('✅ Minimal version: dist/minimal/');

// 4. Создаем README для каждой версии
const readmeContent = `# Favicon Factory Builds

## Версии

### Standalone (index.html)
- Полная версия в одном файле
- Включает все зависимости
- Готова к использованию

### Separated (/separated/)
- CSS и JavaScript в отдельных файлах
- Лучше для кэширования
- Требует веб-сервер

### Minimal (/minimal/)
- Только основные размеры фавиконок
- Уменьшенный размер файла
- Без отладочных сообщений

## Использование

1. Выберите подходящую версию
2. Загрузите файлы на ваш веб-сервер
3. Откройте index.html в браузере

## Требования

- Современный браузер с поддержкой ES6
- Для separated версии: веб-сервер (не file://)
`;

fs.writeFileSync(path.join(distDir, 'README.md'), readmeContent);
console.log('✅ README created');

console.log('🎉 Build completed successfully!');
console.log(`📊 Files created:`);
console.log(`   - dist/index.html (${(fs.statSync(path.join(distDir, 'index.html')).size / 1024).toFixed(1)}KB)`);
console.log(`   - dist/separated/ (3 files)`);
console.log(`   - dist/minimal/ (1 file)`);
