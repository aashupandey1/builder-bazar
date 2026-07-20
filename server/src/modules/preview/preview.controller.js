const templateRepository = require('../template/template.repository');

module.exports.share = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    let item = null;
    if (type === 'template') {
      item = await templateRepository.findById(id);
    }
    if (!item) return res.status(404).send('Content not found');

    const isVideo = /\.(mp4|mov)$/i.test(item.file_url);
    const clientUrl = process.env.CLIENT_URL;
    const shareUrl = `${process.env.SERVER_BASE_URL}/share/${type}/${id}`;
    const title = item.title || 'Builder Bazar Marketing Studio';
    const description = item.subtitle || 'Check out this template';
    const image = item.thumbnail_url || (!isVideo ? item.file_url : '');

    res.send(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
${image ? `<meta property="og:image" content="${image}" />` : ''}
<meta property="og:url" content="${shareUrl}" />
${isVideo ? `<meta property="og:video" content="${item.file_url}" />` : ''}
<meta name="twitter:card" content="${isVideo ? 'player' : 'summary_large_image'}" />
<style>
  body{margin:0;font-family:sans-serif;background:#111;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px;box-sizing:border-box}
  video,img{max-width:100%;max-height:70vh;border-radius:12px}
  h1{font-size:18px;margin:16px 0 4px;text-align:center}
  p{color:#aaa;margin:0 0 16px}
  a.btn{background:#6c4bff;color:#fff;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:600}
</style>
</head>
<body>
${isVideo
  ? `<video src="${item.file_url}" controls autoplay muted playsinline></video>`
  : `<img src="${item.file_url}" alt="${title}" />`}
<h1>${title}</h1>
<p>${description}</p>
<a class="btn" href="${clientUrl}" target="_blank" rel="noopener noreferrer">Open in Builder Bazar</a>
</body>
</html>`);
  } catch (err) {
    next(err);
  }
};