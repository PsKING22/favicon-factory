#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Running tests...');

let errors = 0;

function test(name, condition, message) {
  if (condition) {
    console.log(`✅ ${name}`);
  } else {
    console.log(`❌ ${name}: ${message}`);
    errors++;
  }
}

// Тестируем исходный файл
const sourceFile = 'index.html';
const sourceExists = fs.existsSync(sourceFile);
test('Source file exists', sourceExists, 'index.html not found');

if (sourceExists) {
  const html = fs.readFileSync(sourceFile, 'utf8');
  
  // Базовые HTML тесты
  test('Valid HTML5 doctype', html.includes('<!doctype html>'), 'Missing HTML5 doctype');
  test('Has charset meta', html.includes('charset='), 'Missing charset declaration');
  test('Has viewport meta', html.includes('viewport'), 'Missing viewport meta tag');
  
  // Тесты функциональности
  test('Drop zone exists', html.includes('id="drop"'), 'Missing drop zone element');
  test('File input exists', html.includes('type="file"'), 'Missing file input');
  test('Canvas exists', html.includes('id="cropCanvas"'), 'Missing crop canvas');
  test('Generate button exists', html.includes('id="generate"'), 'Missing generate button');
  
  // Тесты зависимостей
  test('JSZip dependency', html.includes('jszip'), 'Missing JSZip library');
  test('icojs dependency', html.includes('icojs') || html.includes('ico.min.js'), 'Missing icojs library');
  
  // Тесты JavaScript функций
  test('handleFile function', html.includes('function handleFile') || html.includes('handleFile='), 'Missing handleFile function');
  test('generateAll function', html.includes('function generateAll') || html.includes('generateAll='), 'Missing generateAll function');
  test('Drag & drop handlers', html.includes('dragenter') && html.includes('drop'), 'Missing drag & drop event handlers');
  
  // Тесты CSS
  test('Drop zone styles', html.includes('.drop{') || html.includes('.drop '), 'Missing drop zone styles');
  test('Responsive design', html.includes('grid') || html.includes('flex'), 'Missing responsive layout');
  
  // Тесты размеров фавиконок
  test('Default sizes defined', html.includes('DEFAULT_SIZES'), 'Missing default sizes array');
  test('Multiple icon sizes', html.includes('16') && html.includes('32') && html.includes('192'), 'Missing standard icon sizes');
  
  // Тесты форматов вывода
  test('ICO format support', html.includes('favicon.ico'), 'Missing ICO format support');
  test('Manifest support', html.includes('manifest'), 'Missing web manifest support');
  test('ZIP download', html.includes('JSZip') && html.includes('download'), 'Missing ZIP download functionality');
}

// Тестируем собранные файлы (если есть)
if (fs.existsSync('dist')) {
  const distFiles = fs.readdirSync('dist');
  test('Dist directory exists', true, '');
  test('Built files exist', distFiles.length > 0, 'No built files found');
  
  if (fs.existsSync('dist/index.html')) {
    const builtHtml = fs.readFileSync('dist/index.html', 'utf8');
    const originalSize = fs.statSync(sourceFile).size;
    const builtSize = fs.statSync('dist/index.html').size;
    
    test('Built file is smaller', builtSize < originalSize, `Built file is not minified (${builtSize} >= ${originalSize})`);
    test('Built file has content', builtSize > 1000, 'Built file is too small, might be corrupted');
  }
}

// Результаты
console.log('\n📊 Test Results:');
if (errors === 0) {
  console.log('🎉 All tests passed!');
  process.exit(0);
} else {
  console.log(`💥 ${errors} test(s) failed!`);
  process.exit(1);
}
