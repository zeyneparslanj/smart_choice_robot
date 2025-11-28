import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // 👇 İŞTE EKLEMEN GEREKEN TEK KISIM BURASI 👇
      base: "/smart_choice_robot/", // <-- Buraya GitHub Repo ismini yaz (Başında ve sonunda / olsun)
      // 👆 ------------------------------------- 👆

      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Buradaki ayarlarını aynen korudum, Gemini çalışmaya devam edecek
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});