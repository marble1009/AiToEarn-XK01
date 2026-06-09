$HostIP = "124.221.103.86"
$SSHKey = "C:\Users\Admin\.ssh\id_ed25519"
$LocalRoot = "C:\Users\Admin\Desktop\github\aiautoedit"

# All modified files relative to $LocalRoot
$Files = @(
    "fix-deployment.sh",
    "docker-compose.yml",
    "nginx/nginx.conf",
    "project/aitoearn-backend/apps/aitoearn-ai/src/app.module.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/config.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/common/index.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/draft-generation/draft-generation.service.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/material-adaptation/material-adaptation.service.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/ai/libs/openai/openai.service.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/ai/chat/chat.controller.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/ai/image/image.controller.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/ai/video/video.controller.ts",
    "project/aitoearn-backend/apps/aitoearn-server/Dockerfile",
    "project/aitoearn-backend/apps/aitoearn-server/src/core/credits/credits.controller.ts",
    "project/aitoearn-backend/apps/aitoearn-server/src/core/user/login.controller.ts",
    "project/aitoearn-backend/apps/aitoearn-server/src/core/user/login.dto.ts",
    "project/aitoearn-backend/apps/aitoearn-server/src/core/user/user.service.ts",
    "project/aitoearn-backend/libs/mongodb/src/repositories/index.ts",
    "project/aitoearn-backend/libs/mongodb/src/repositories/user.repository.ts",
    "project/aitoearn-backend/libs/mongodb/src/schemas/index.ts",
    "project/aitoearn-backend/scripts/build-docker.mjs",
    "project/aitoearn-backend/tsconfig.base.json",
    "project/aitoearn-web/Dockerfile",
    "project/aitoearn-web/pnpm-workspace.yaml",
    "project/aitoearn-web/src/api/auth.ts",
    "project/aitoearn-web/src/api/credits.ts",
    "project/aitoearn-web/src/api/types/auth.ts",
    "project/aitoearn-web/src/app/[lng]/ai-social/AiSocialPageContent.tsx",
    "project/aitoearn-web/src/app/[lng]/auth/login/components/LoginContent/index.tsx",
    "project/aitoearn-web/src/app/[lng]/auth/login/components/LoginContent/EmailLoginForm.tsx",
    "project/aitoearn-web/src/app/[lng]/auth/login/components/LoginContent/PhoneLoginForm.tsx",
    "project/aitoearn-web/src/app/globals.css",
    "project/aitoearn-web/src/app/i18n/locales/en/login.json",
    "project/aitoearn-web/src/app/i18n/locales/zh-CN/login.json",
    "project/aitoearn-web/src/app/layout/LoginDialog/index.tsx",
    "project/aitoearn-web/src/app/layout/MainContent/index.tsx",
    "project/aitoearn-web/src/app/layout/MobileNav/index.tsx",
    "project/aitoearn-web/src/components/ChannelManager/components/ConnectChannelList.tsx",
    "project/aitoearn-web/src/components/PublishDialog/compoents/PublishDatePicker/index.tsx",
    "project/aitoearn-web/src/components/SettingsModal/tabs/ProfileTab.tsx",
    "project/aitoearn-backend/apps/aitoearn-ai/src/common/guards/ai-quota.guard.ts",
    "project/aitoearn-backend/libs/mongodb/src/repositories/subscription-plan.repository.ts",
    "project/aitoearn-backend/libs/mongodb/src/repositories/user-subscription.repository.ts",
    "project/aitoearn-backend/libs/mongodb/src/schemas/subscription-plan.schema.ts",
    "project/aitoearn-backend/libs/mongodb/src/schemas/user-subscription.schema.ts",
    "project/aitoearn-backend/run_full_integration_test.js",
    "project/aitoearn-backend/run_real_minimax_video_test.js",
    "project/aitoearn-web/.npmrc",
    "project/aitoearn-web/src/app/[lng]/auth/login/components/LoginContent/PasswordLoginForm.tsx",
    "project/aitoearn-backend/libs/redis/src/redis.service.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/ai/image/image.service.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/ai/libs/grok/grok.service.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/config/config.js",
    "project/aitoearn-backend/apps/aitoearn-ai/config/local.config.js",
    "project/aitoearn-web/next.config.mjs",
    "project/aitoearn-web/src/app/[lng]/draft-box/components/AiBatchGenerateBar/index.tsx",
    "project/aitoearn-web/src/app/[lng]/draft-box/components/AiBatchGenerateBar/ToolBarInline/index.tsx",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/ai/video/openai/openai.dto.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/ai/video/openai/openai.service.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/ai/video/video.service.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/ai/video/video.vo.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/ai/video/grok/grok.service.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/ai/video/gemini/gemini.service.ts",
    "project/aitoearn-backend/apps/aitoearn-ai/src/core/ai/video/volcengine/volcengine.service.ts",
    "project/aitoearn-web/src/app/layout/routerData.tsx",
    "project/aitoearn-web/src/app/i18n/locales/zh-CN/route.json",
    "project/aitoearn-web/src/app/i18n/locales/en/route.json",
    "project/aitoearn-web/src/app/[lng]/hub/HubContent.tsx",
    "project/aitoearn-web/src/app/[lng]/ecommerce-studio/page.tsx",
    "project/aitoearn-web/src/app/[lng]/ecommerce-studio/EcommerceStudioCore.tsx",
    "project/aitoearn-web/src/app/i18n/locales/zh-CN/ecommerceStudio.json",
    "project/aitoearn-web/src/app/i18n/locales/en/ecommerceStudio.json",
    "project/aitoearn-web/src/app/[lng]/draft-box/components/MediaCard/index.tsx",
    "project/aitoearn-web/src/app/[lng]/draft-box/components/AllListSection/index.tsx",
    "project/aitoearn-web/src/app/[lng]/draft-box/components/MediaListSection/index.tsx",
    "project/aitoearn-web/src/app/[lng]/draft-box/components/ContentTabs/mediaTabStore.ts",
    "project/aitoearn-web/src/app/[lng]/draft-box/components/DraftContentModule/index.tsx",
    "project/aitoearn-web/src/app/[lng]/draft-box/components/DraftListSection.tsx",
    "project/aitoearn-web/src/app/[lng]/draft-box/components/DraftListToolbar/index.tsx",
    "project/aitoearn-web/src/app/[lng]/draft-box/components/BatchActionBar/index.tsx",
    "project/aitoearn-web/src/app/[lng]/draft-box/components/ConditionalDeleteDialog/index.tsx",
    "project/aitoearn-web/src/api/media.ts",
    "project/aitoearn-backend/apps/aitoearn-server/src/core/content/media.service.ts",
    "project/aitoearn-web/src/utils/oss.ts",
    "project/aitoearn-web/src/app/[lng]/draft-box/components/LazyImage.tsx",
    "project/aitoearn-web/src/app/[lng]/draft-box/components/DraftDetailDialog.tsx",
    "project/aitoearn-web/src/app/[lng]/draft-box/components/AiBatchGenerateBar/ImageStack/index.tsx",
    "project/aitoearn-web/src/app/[lng]/brand-promotion/planDetailStore.ts",
    "project/aitoearn-backend/apps/aitoearn-server/src/core/content/material.dto.ts",
    "project/aitoearn-backend/apps/aitoearn-server/src/core/content/common.ts",
    "project/aitoearn-web/src/api/material.ts"
)

Write-Host "========================================="
Write-Host "📦 Step 1: Archiving modified files locally..."
Write-Host "========================================="

# Create a temporary list of files to archive
$ListFile = Join-Path $LocalRoot "patch_files.txt"

# Dynamically find all files in the dist directory
$DistFiles = @()
$DistPath = Join-Path $LocalRoot "project/aitoearn-backend/dist"
if (Test-Path $DistPath) {
    $DistFiles = Get-ChildItem -Path $DistPath -Recurse -File | ForEach-Object {
        $_.FullName.Substring($LocalRoot.Length + 1).Replace('\', '/')
    }
}

$AllFiles = $Files + $DistFiles
[System.IO.File]::WriteAllText($ListFile, ($AllFiles -join "`n") + "`n")

$ArchiveFile = Join-Path $LocalRoot "patch.tar.gz"
if (Test-Path $ArchiveFile) { Remove-Item $ArchiveFile -Force }

# Run tar command to archive all files listed in the patch_files.txt
# Since we are on Windows PowerShell, we use standard tar.exe built into Windows 10/11
cd $LocalRoot
tar.exe -czf patch.tar.gz -T patch_files.txt

Remove-Item $ListFile -Force

if (!(Test-Path $ArchiveFile)) {
    Write-Error "❌ Failed to create patch.tar.gz"
    exit 1
}

Write-Host "✅ Archive created: patch.tar.gz ($( (Get-Item $ArchiveFile).Length / 1024 ) KB)"

Write-Host "========================================="
Write-Host "🚀 Step 2: Transferring archive to remote server..."
Write-Host "========================================="

$RemoteTarget = "ubuntu@$($HostIP):~/aitoearn/patch.tar.gz"
scp -i $SSHKey -o StrictHostKeyChecking=no $ArchiveFile $RemoteTarget

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ SCP file transfer failed"
    exit 1
}
Write-Host "✅ Archive successfully uploaded to remote server!"

Write-Host "========================================="
Write-Host "🔓 Step 3: Extracting archive on remote server..."
Write-Host "========================================="

ssh -i $SSHKey -o StrictHostKeyChecking=no ubuntu@$HostIP "cd ~/aitoearn && tar -xzf patch.tar.gz && rm patch.tar.gz"

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Remote extraction failed"
    exit 1
}
Write-Host "✅ Archive successfully extracted on remote server!"

# Clean up local archive
Remove-Item $ArchiveFile -Force

Write-Host "========================================="
Write-Host "🔄 Step 4: Running remote deploy fix script..."
Write-Host "========================================="

ssh -i $SSHKey -o StrictHostKeyChecking=no ubuntu@$HostIP "cd ~/aitoearn && chmod +x fix-deployment.sh && ./fix-deployment.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Remote redeployment failed"
    exit 1
}

Write-Host "========================================="
Write-Host "🎉 SUCCESS: All files deployed and services restarted!"
Write-Host "========================================="
