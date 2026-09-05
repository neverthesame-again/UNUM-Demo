import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getPrdFilePath() {
  const candidateDirs = [
    path.resolve(__dirname, 'PRD'),
    path.resolve(__dirname, 'public', 'PRD')
  ];
  for (const dir of candidateDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => !f.startsWith('.') && !f.startsWith('~') && f !== 'README.md');
      const docx = files.find(f => f.endsWith('.docx'));
      if (docx) return path.join(dir, docx);
      const anyFile = files[0];
      if (anyFile) return path.join(dir, anyFile);
    }
  }
  return null;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-prd-download',
      configureServer(server) {
        const handleDownload = (req, res, next) => {
          const filePath = getPrdFilePath();
          if (filePath && fs.existsSync(filePath)) {
            const fileName = path.basename(filePath);
            const stat = fs.statSync(filePath);
            res.writeHead(200, {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'Content-Length': stat.size,
              'Content-Disposition': `attachment; filename="${fileName}"`
            });
            fs.createReadStream(filePath).pipe(res);
            return;
          }
          next();
        };

        server.middlewares.use('/api/prd/download', handleDownload);
        server.middlewares.use('/PRD/download', handleDownload);
        server.middlewares.use('/PRD/Product_Requirement_Document.docx', handleDownload);
        server.middlewares.use('/PRD/Product_Requirement_Document_PRD.docx', handleDownload);
      }
    }
  ],
  server: {
    proxy: {
      // GuideWell automation agents
      '/api/automation-agents': {
        target: 'https://mnnb9bbkgu.ap-south-1.awsapprunner.com',
        changeOrigin: true,
      },
    },
  },
})

