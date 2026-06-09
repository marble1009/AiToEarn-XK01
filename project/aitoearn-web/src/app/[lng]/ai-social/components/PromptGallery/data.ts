/**
 * PromptGallery 静态资源数据
 * 功能：提供视频提示词画廊的封面图片和视频资源路径
 * 注意：提示词内容通过国际化翻译文件加载（promptGallery.json）
 */

/** 提示词画廊静态资源配置 */
export const promptGalleryAssets = [
  {
    title: '四川麻辣火锅深夜打卡 Vlog',
    cover: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800',
    video: '/assets/promptGallery/video01.mp4',
    materials: ['https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=200'],
    prompt: `制作一个8秒竖屏短视频（9:16），深夜探店四川麻辣火锅，特写镜头展现红油翻滚、肥牛下锅的诱人画面，搭配欢快动感背景音乐与深夜吃货专属文案。`,
  },
  {
    title: '国潮新茶饮芝芝莓莓新品探店',
    cover: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800',
    video: '/assets/promptGallery/video02.mp4',
    materials: ['https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=200'],
    prompt: `制作一个8秒竖屏小红书探店Vlog（9:16），展示喜茶新品“芝芝莓莓”，镜头捕捉阳光下粉嫩果肉与芝士拉丝特写，配音：“芝士控必冲！满口草莓果肉，太治愈了！”`,
  },
  {
    title: '老字号手作鲜虾云吞面美味安利',
    cover: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800',
    video: '/assets/promptGallery/video03.mp4',
    materials: ['https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=200'],
    prompt: `制作一个8秒竖屏抖音短视频（9:16），展现百年老字号手作鲜虾云吞面的制作过程与热气腾腾的饱满云吞，配音：“皮薄馅大，整颗大虾仁，这才是正宗广式云吞面！”`,
  },
]
