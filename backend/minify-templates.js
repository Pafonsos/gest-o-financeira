// ============================================
// SCRIPT PARA MINIFICAR TODOS OS TEMPLATES
// backend/minify-templates.js
// ============================================

const fs = require('fs');
const path = require('path');

function minifyHTML(html) {
  return html
    // Remove comentários HTML
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove espaços múltiplos
    .replace(/\s{2,}/g, ' ')
    // Remove quebras de linha e espaços entre tags
    .replace(/>\s+</g, '><')
    // Remove espaços no início e fim
    .trim();
}

const templatesDir = path.join(__dirname, 'templates');

console.log('\n🔧 MINIFICANDO TEMPLATES\n');
console.log('═'.repeat(60));

try {
  const files = fs.readdirSync(templatesDir);
  const htmlFiles = files.filter(f => f.endsWith('.html') || f.endsWith('.HTML'));
  
  if (htmlFiles.length === 0) {
    console.log('❌ Nenhum template encontrado!');
    process.exit(1);
  }
  
  let totalSaved = 0;
  
  htmlFiles.forEach(file => {
    const filePath = path.join(templatesDir, file);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(originalContent, 'utf8');
    
    // Minificar
    const minified = minifyHTML(originalContent);
    const minifiedSize = Buffer.byteLength(minified, 'utf8');
    
    // Calcular economia
    const saved = originalSize - minifiedSize;
    const savedPercent = ((saved / originalSize) * 100).toFixed(1);
    totalSaved += saved;
    
    // Criar backup
    const backupPath = filePath + '.backup';
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, originalContent);
      console.log(`📦 Backup criado: ${file}.backup`);
    }
    
    // Salvar versão minificada
    fs.writeFileSync(filePath, minified);
    
    console.log(`✅ ${file}`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Minificado: ${(minifiedSize / 1024).toFixed(2)} KB`);
    console.log(`   Economia: ${(saved / 1024).toFixed(2)} KB (${savedPercent}%)`);
    console.log('');
  });
  
  console.log('═'.repeat(60));
  console.log(`✅ CONCLUÍDO!`);
  console.log(`📊 Economia total: ${(totalSaved / 1024).toFixed(2)} KB\n`);
  
  console.log('💡 PRÓXIMOS PASSOS:');
  console.log('   1. Reinicie o backend: npm start');
  console.log('   2. Teste o envio de email');
  console.log('   3. Se algo der errado, restaure os backups\n');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}

// Função para restaurar backups (caso necessário)
function restoreBackups() {
  const files = fs.readdirSync(templatesDir);
  const backups = files.filter(f => f.endsWith('.backup'));
  
  backups.forEach(backup => {
    const originalFile = backup.replace('.backup', '');
    const backupPath = path.join(templatesDir, backup);
    const originalPath = path.join(templatesDir, originalFile);
    
    fs.copyFileSync(backupPath, originalPath);
    console.log(`✅ Restaurado: ${originalFile}`);
  });
  
  console.log('\n✅ Todos os backups foram restaurados!');
}

// Exportar funções
module.exports = { minifyHTML, restoreBackups };