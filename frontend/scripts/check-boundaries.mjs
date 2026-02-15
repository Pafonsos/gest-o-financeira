import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('src');
const FILE_EXT = ['.js', '.jsx', '.ts', '.tsx'];

const rules = [
  {
    from: '/components/clients/',
    forbidden: ['/hooks/', '/lib/supabaseClient'],
    message: 'clients components should not depend on hooks or supabase'
  },
  {
    from: '/components/modals/',
    forbidden: ['/hooks/', '/lib/supabaseClient'],
    message: 'modal components should not depend on hooks or supabase'
  },
  {
    from: '/utils/',
    forbidden: ['/components/', '/hooks/', '/contexts/', '/services/'],
    message: 'utils should stay pure'
  },
  {
    from: '/hooks/',
    forbidden: ['/components/'],
    message: 'hooks should not import components'
  }
];

const readFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readFiles(fullPath));
      continue;
    }

    if (FILE_EXT.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
};

const extractImports = (content) => {
  const importRegex = /from\s+['\"]([^'\"]+)['\"]|import\s*\(\s*['\"]([^'\"]+)['\"]\s*\)/g;
  const imports = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1] || match[2]);
  }
  return imports;
};

const toPosix = (value) => value.split(path.sep).join('/');

const files = readFiles(SRC_DIR);
const violations = [];

for (const file of files) {
  const relFile = toPosix(path.relative(process.cwd(), file));
  const content = fs.readFileSync(file, 'utf8');
  const imports = extractImports(content);

  for (const rule of rules) {
    if (!relFile.includes(rule.from)) continue;

    for (const imp of imports) {
      if (!imp.startsWith('.') && !imp.startsWith('@/')) continue;

      const resolved = imp.startsWith('@/')
        ? toPosix(path.resolve(SRC_DIR, imp.slice(2)))
        : toPosix(path.resolve(path.dirname(file), imp));

      const isForbidden = rule.forbidden.some((forbidden) => resolved.includes(forbidden));
      if (isForbidden) {
        violations.push(`${relFile}: ${rule.message} -> ${imp}`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error('\nBoundary check failed:\n');
  violations.forEach((line) => console.error(`- ${line}`));
  process.exit(1);
}

console.log('Boundary check passed.');