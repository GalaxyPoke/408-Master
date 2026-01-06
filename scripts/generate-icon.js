const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcon() {
  const svgPath = path.join(__dirname, '..', 'assets', 'icon.svg');
  const pngPath = path.join(__dirname, '..', 'assets', 'icon.png');
  const icoPath = path.join(__dirname, '..', 'assets', 'icon.ico');
  
  console.log('Converting SVG to PNG...');
  
  // SVG 转 PNG (256x256)
  await sharp(svgPath)
    .resize(256, 256)
    .png()
    .toFile(pngPath);
  
  console.log('PNG created:', pngPath);
  
  // 使用 sharp 直接生成多尺寸，然后手动创建 ICO
  // ICO 文件格式：头部 + 目录 + 图像数据
  const sizes = [16, 32, 48, 256];
  const images = [];
  
  for (const size of sizes) {
    const buffer = await sharp(svgPath)
      .resize(size, size)
      .png()
      .toBuffer();
    images.push({ size, buffer });
  }
  
  // 创建简单的 ICO 文件（使用 PNG 格式存储）
  const numImages = images.length;
  
  // ICO 头部 (6 bytes)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // 保留，必须为 0
  header.writeUInt16LE(1, 2);      // 类型：1 = ICO
  header.writeUInt16LE(numImages, 4); // 图像数量
  
  // 计算目录和数据偏移
  const directorySize = numImages * 16;
  let dataOffset = 6 + directorySize;
  
  // ICO 目录
  const directories = [];
  for (const img of images) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(img.size === 256 ? 0 : img.size, 0);  // 宽度 (0 = 256)
    dir.writeUInt8(img.size === 256 ? 0 : img.size, 1);  // 高度 (0 = 256)
    dir.writeUInt8(0, 2);           // 调色板颜色数
    dir.writeUInt8(0, 3);           // 保留
    dir.writeUInt16LE(1, 4);        // 颜色平面数
    dir.writeUInt16LE(32, 6);       // 每像素位数
    dir.writeUInt32LE(img.buffer.length, 8);  // 图像数据大小
    dir.writeUInt32LE(dataOffset, 12);        // 数据偏移
    directories.push(dir);
    dataOffset += img.buffer.length;
  }
  
  // 合并所有部分
  const ico = Buffer.concat([
    header,
    ...directories,
    ...images.map(img => img.buffer)
  ]);
  
  fs.writeFileSync(icoPath, ico);
  console.log('ICO created:', icoPath);
  console.log('Done!');
}

generateIcon().catch(console.error);
