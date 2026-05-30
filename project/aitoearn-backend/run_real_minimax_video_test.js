const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MOCK_USER_ID = '60c72b2f9b1d8a2c88888888';
const S3_ENDPOINT = 'http://127.0.0.1:9000';
const S3_BUCKET = 'aitoearn';

// 真实 MiniMax 中国版 API 密钥及视频模型配置
const MINIMAX_API_KEY = 'sk-cp-r3IWPmKXUM9NAJ6EFfi3kAd8W_I0Vlj9JS39kfgSoOmnDgBpxkf9HBrleRAzUcD5L8eAtNv6ZgQXe1iwBx83mDWkt7kXwC-j6vQNtSgts6Ep7AnklEq1lz8';
// 中国国内版专属域名 (minimaxi.com，带 i 域名)
const BASE_URL = 'https://api.minimaxi.com';
const VIDEO_MODEL = 'MiniMax-Hailuo-2.3'; // 官方推荐的高级视频生成模型

// 延时等待函数
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('==================================================');
  console.log('🚀 开始执行 AuraString - MiniMax 真实 AI 视频合成全流程测试...');
  console.log('==================================================\n');

  // ==================== 1. 向 MiniMax 中国版发起 AI 视频生成任务 ====================
  let taskId = '';
  try {
    console.log('🔄 步骤 1/5: 正在向 MiniMax 官方国内 API 提交视频合成任务请求...');
    console.log(`- 🎬 采用模型: ${VIDEO_MODEL}`);
    console.log('- 💡 提示词: "A stylish cyber-punk city under golden sunset, slow camera tracking shot [pan], 1080P, cinematic lighting"');

    const payload = {
      model: VIDEO_MODEL,
      prompt: 'A stylish cyber-punk city under golden sunset, slow camera tracking shot [pan], 1080P, cinematic lighting'
    };

    const response = await fetch(`${BASE_URL}/v1/video_generation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data && data.task_id) {
      taskId = data.task_id;
      console.log(`✅ 步骤 1/5 成功！视频生成任务已成功创建，任务 ID (Task ID): ${taskId}\n`);
    } else {
      throw new Error(`创建任务失败: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error('❌ 步骤 1/5 失败：创建 MiniMax 视频生成任务失败：', error.message);
    process.exit(1);
  }

  // ==================== 2. 轮询视频生成状态 ====================
  let fileId = '';
  try {
    console.log('🔄 步骤 2/5: 正在轮询 MiniMax 国内云端 GPU 算力集群渲染状态...');
    console.log('*(由于 AI 视频渲染需要时间，通常需要 20 秒左右，请耐心等待)*\n');

    let isFinished = false;
    let attempts = 0;
    
    while (!isFinished && attempts < 40) {
      attempts++;
      await sleep(8000); // 每隔 8 秒查询一次

      const queryUrl = `${BASE_URL}/v1/query/video_generation?task_id=${taskId}`;
      const response = await fetch(queryUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MINIMAX_API_KEY}`
        }
      });

      const data = await response.json();
      const status = data.status;
      
      console.log(`⏳ [第 ${attempts} 次查询] 当前渲染状态: "${status}" ...`);

      if (status === 'Success') {
        fileId = data.file_id;
        isFinished = true;
        console.log(`\n🎉 恭喜！云端视频生成成功！`);
        console.log(`✅ 步骤 2/5 成功！获取到视频文件 ID (File ID): ${fileId}\n`);
      } else if (status === 'Fail') {
        throw new Error(`云端渲染失败，MiniMax 返回错误状态！`);
      }
    }

    if (!fileId) {
      throw new Error('轮询超时，视频生成未能在规定时间内完成。');
    }
  } catch (error) {
    console.error('❌ 步骤 2/5 失败：轮询视频生成任务状态失败：', error.message);
    process.exit(1);
  }

  // ==================== 3. 获取视频下载 URL ====================
  let downloadUrl = '';
  try {
    console.log('🔄 步骤 3/5: 正在通过 File ID 获取生成的真实 AI 视频下载链接...');

    const retrieveUrl = `${BASE_URL}/v1/files/retrieve?file_id=${fileId}`;
    const response = await fetch(retrieveUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MINIMAX_API_KEY}`
      }
    });

    const data = await response.json();
    if (data && data.file && data.file.download_url) {
      downloadUrl = data.file.download_url;
      console.log(`✅ 步骤 3/5 成功！获取到专属临时下载链接：${downloadUrl}\n`);
    } else {
      throw new Error(`获取下载地址失败: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error('❌ 步骤 3/5 失败：获取下载 URL 失败：', error.message);
    process.exit(1);
  }

  // ==================== 4. 下载并流式上传至本地 S3 ====================
  const videoFileName = `video_minimax_${Date.now()}.mp4`;
  const s3VideoPath = `ai/videos/${MOCK_USER_ID}/${videoFileName}`;
  const s3PutUrl = `${S3_ENDPOINT}/${S3_BUCKET}/${s3VideoPath}`;
  
  let videoBuffer;
  try {
    console.log('🔄 步骤 4/5: 正在下载真正的 AI 视频并流式上传到本地端口 9000 对象存储...');

    const videoResponse = await fetch(downloadUrl);
    if (videoResponse.ok) {
      const arrayBuffer = await videoResponse.arrayBuffer();
      videoBuffer = Buffer.from(arrayBuffer);
      console.log(`📥 成功下载 AI 视频实体，大小: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    } else {
      throw new Error(`下载真实视频流失败，HTTP 状态码: ${videoResponse.status}`);
    }

    // 发起 HTTP PUT 向本地 S3 模拟写入
    const uploadRes = await fetch(s3PutUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4'
      },
      body: videoBuffer
    });

    if (uploadRes.status === 200) {
      console.log(`✅ 步骤 4/5 成功！真实的 AI 生成视频已成功转存到本地对象存储中。`);
      console.log(`💾 本地存储绝对路径: C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch\\s3-bucket\\${s3VideoPath.replace(/\//g, '\\')}`);
      console.log(`🔗 视频点播播放链接: ${s3PutUrl}\n`);
    } else {
      throw new Error(`S3 上传响应状态码: ${uploadRes.status}`);
    }
  } catch (error) {
    console.error('❌ 步骤 4/5 失败：转存到本地 S3 存储失败：', error.message);
    process.exit(1);
  }

  // ==================== 5. 写入 MongoDB 副本集持久化状态 ====================
  try {
    console.log('🔄 步骤 5/5: 正在将生成的真实 AI 视频记录保存进 MongoDB，并扣减积分额度...');

    const client = new MongoClient('mongodb://127.0.0.1:27018/?directConnection=true');
    await client.connect();
    const db = client.db('aitoearn');
    
    // 写入真实 AI 视频生成记录到素材库
    const mockMaterialId = new ObjectId();
    await db.collection('material').insertOne({
      _id: mockMaterialId,
      userId: MOCK_USER_ID,
      title: 'MiniMax 真实 AI 生成视频',
      content: 'A stylish cyber-punk city under golden sunset, slow camera tracking shot [pan]',
      videoUrl: s3PutUrl,
      status: 1, // 已成功就绪
      type: 'video',
      size: videoBuffer.length,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // 扣除积分 200 (代表高级 AI 视频消耗)
    await db.collection('creditsBalance').updateOne(
      { userId: MOCK_USER_ID },
      { $inc: { balance: -200 } }
    );

    const balanceDoc = await db.collection('creditsBalance').findOne({ userId: MOCK_USER_ID });
    console.log(`✅ 步骤 5/5 成功！本地 MongoDB 已持久化，账户当前扣费余额为：${balanceDoc.balance} 💰\n`);
    
    await client.close();
  } catch (error) {
    console.error('❌ 步骤 5/5 失败：MongoDB 写入失败：', error.message);
    process.exit(1);
  }

  console.log('==================================================');
  console.log('🎉 终极真实 AI 视频合成集成测试完美成功！结果报告：');
  console.log('==================================================\n');
  console.log('🎬 【视频资源与本地落盘详情】：');
  console.log(`- 🎬 视频文件大小: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- 📂 本地物理落盘路径: C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch\\s3-bucket\\${s3VideoPath.replace(/\//g, '\\')}`);
  console.log(`- 🌐 本网流式播放链接: ${s3PutUrl} *(可直接在网页或浏览器内秒开播放！)*`);
  console.log('\n==================================================');
  console.log('✨ 恭喜！本地全链路真视频生成测试圆满跑通，无一花水！');
  console.log('==================================================');
}

run();
