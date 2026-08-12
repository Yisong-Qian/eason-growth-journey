# 钱一颂｜经纬之间

个人成长轨迹网站，记录从杭州、汉诺威到慕尼黑，以及从自动化工程走向智能驾驶感知的探索。

预期公开网址：

<https://yisong-qian.github.io/eason-growth-journey/>

## 使用 GitHub Desktop 发布

1. 在 GitHub Desktop 中打开本地 `eason-growth-journey` 仓库。
2. 将本项目包里的全部文件复制到该仓库根目录；不要再套一层文件夹。
3. 在 GitHub Desktop 中填写提交说明，例如 `Publish personal growth website`，然后点击 **Commit to main**。
4. 如果仓库还没有发布到 GitHub，点击 **Publish repository**，取消勾选 **Keep this code private**；如果已经发布，点击 **Push origin**。
5. 在 GitHub 仓库网页打开 **Settings → Pages**，把 **Source** 设为 **GitHub Actions**。
6. 打开 **Actions**，等待 `Deploy to GitHub Pages` 显示绿色完成。首次部署通常需要几分钟。

完成后，网站会自动发布到上面的公开网址。以后每次从 GitHub Desktop 推送到 `main`，网站都会自动重新构建并更新。

## 内容后台

后台入口：

<https://yisong-qian.github.io/eason-growth-journey/admin/>

后台使用 [Pages CMS](https://app.pagescms.org/) 作为编辑界面，内容仍保存在 GitHub 仓库中，不需要单独维护数据库。

首次使用：

1. 打开后台入口，点击 **使用 GitHub 登录并编辑**。
2. 使用 `Yisong-Qian` 登录，并允许 Pages CMS 访问 `eason-growth-journey` 仓库。
3. 在 **网站内容** 中选择要编辑的区域，例如首页、成长时间线、项目经历或当前研究方向。
4. 修改文字，或在项目卡片中上传图片。
5. 点击保存。后台会提交内容修改，GitHub Pages 随后自动构建并更新网站。

图片会保存到 `public/uploads/`，内容文件位于 `src/content/`。如需回退误修改，可直接使用 GitHub 的提交历史恢复。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```
