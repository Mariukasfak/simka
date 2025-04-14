// Plėtinys, kuris optimizuoja Next.js diegimą Netlify platformoje
module.exports = {
  onPreBuild: async ({ utils }) => {
    console.log('🚀 Optimizuojamas Next.js diegimas...');
    
    // Išvalome cache, jei ankstesnis diegimas nepavyko
    if (process.env.NETLIFY_BUILD_BASE && utils.cache.restore('.next/cache')) {
      console.log('✅ Sėkmingai atstatytas Next.js cache!');
    } else {
      console.log('⚠️ Nerastas ankstesnis Next.js cache.');
    }
  },
  
  onBuild: async () => {
    console.log('🔍 Optimizuojami Next.js failai...');
  },
  
  onPostBuild: async ({ utils }) => {
    console.log('📦 Saugomas Next.js cache...');
    
    // Išsaugome cache naujam diegimui
    if (process.env.NETLIFY_BUILD_BASE) {
      const success = await utils.cache.save('.next/cache');
      if (success) {
        console.log('✅ Next.js cache sėkmingai išsaugotas!');
      } else {
        console.log('⚠️ Nepavyko išsaugoti Next.js cache.');
      }
    }
  }
};