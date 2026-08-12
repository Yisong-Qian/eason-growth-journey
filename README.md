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

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```
