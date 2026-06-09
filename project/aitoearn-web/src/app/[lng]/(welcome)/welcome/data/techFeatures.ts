/**
 * techFeatures.ts - AI 视频展示数据
 * 用于 TechFeaturesSection 展示 AI 生成的探店视频
 */

export interface AIVideoItem {
  id: string
  titleKey: string
  cover: string
  video: string
}

export const aiVideoShowcase: AIVideoItem[] = [
  {
    id: 'blacklock',
    titleKey: 'tech.video1.title',
    cover: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800',
    video: '/assets/promptGallery/video01.mp4',
  },
  {
    id: 'restaurant-discovery',
    titleKey: 'tech.video2.title',
    cover: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800',
    video: '/assets/promptGallery/video02.mp4',
  },
  {
    id: 'the-shed',
    titleKey: 'tech.video3.title',
    cover: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800',
    video: '/assets/promptGallery/video03.mp4',
  },
]
