#!/bin/bash
# AIMake 品牌资源生成脚本
# 从 SVG 源文件生成所有需要的图标和图片格式

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 目录设置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ASSETS_DIR="$PROJECT_ROOT/landing/assets/images"
SVG_LOGO="$ASSETS_DIR/logo.svg"
SVG_FAVICON="$ASSETS_DIR/favicon.svg"
SVG_OG="$ASSETS_DIR/og-image-template.svg"

echo -e "${GREEN}🎨 AIMake 品牌资源生成器${NC}"
echo "================================"

# 检查依赖
check_dependencies() {
    echo -e "${YELLOW}检查依赖...${NC}"

    if ! command -v inkscape &> /dev/null; then
        echo -e "${RED}❌ 未找到 Inkscape${NC}"
        echo ""
        echo "请安装 Inkscape:"
        echo "  macOS:   brew install inkscape"
        echo "  Ubuntu:  sudo apt-get install inkscape"
        echo "  Windows: https://inkscape.org/release/"
        echo ""
        echo "或者使用在线工具:"
        echo "  https://realfavicongenerator.net/"
        exit 1
    fi

    if ! command -v convert &> /dev/null; then
        echo -e "${YELLOW}⚠️  未找到 ImageMagick (可选)${NC}"
        echo "生成 .ico 文件需要 ImageMagick"
        echo "  macOS: brew install imagemagick"
    fi

    echo -e "${GREEN}✅ 依赖检查完成${NC}"
    echo ""
}

# 生成 Favicon PNG 文件
generate_favicons() {
    echo -e "${YELLOW}生成 Favicon...${NC}"

    sizes=(16 32 192)

    for size in "${sizes[@]}"; do
        output="$ASSETS_DIR/favicon-${size}x${size}.png"
        echo "  → favicon-${size}x${size}.png"

        inkscape "$SVG_FAVICON" \
            --export-type=png \
            --export-filename="$output" \
            --export-width=$size \
            --export-height=$size \
            > /dev/null 2>&1
    done

    echo -e "${GREEN}✅ Favicon PNG 生成完成${NC}"
    echo ""
}

# 生成 Apple Touch Icon
generate_apple_icon() {
    echo -e "${YELLOW}生成 Apple Touch Icon...${NC}"

    output="$ASSETS_DIR/apple-touch-icon.png"
    echo "  → apple-touch-icon.png (180x180)"

    inkscape "$SVG_FAVICON" \
        --export-type=png \
        --export-filename="$output" \
        --export-width=180 \
        --export-height=180 \
        > /dev/null 2>&1

    echo -e "${GREEN}✅ Apple Touch Icon 生成完成${NC}"
    echo ""
}

# 生成 PWA Icons
generate_pwa_icons() {
    echo -e "${YELLOW}生成 PWA Icons...${NC}"

    sizes=(192 512)

    for size in "${sizes[@]}"; do
        output="$ASSETS_DIR/icon-${size}x${size}.png"
        echo "  → icon-${size}x${size}.png"

        inkscape "$SVG_FAVICON" \
            --export-type=png \
            --export-filename="$output" \
            --export-width=$size \
            --export-height=$size \
            > /dev/null 2>&1
    done

    echo -e "${GREEN}✅ PWA Icons 生成完成${NC}"
    echo ""
}

# 生成 OG Image
generate_og_image() {
    echo -e "${YELLOW}生成 OG Image...${NC}"

    output="$ASSETS_DIR/og-image.png"
    echo "  → og-image.png (1200x630)"

    inkscape "$SVG_OG" \
        --export-type=png \
        --export-filename="$output" \
        --export-width=1200 \
        --export-height=630 \
        > /dev/null 2>&1

    echo -e "${GREEN}✅ OG Image 生成完成${NC}"
    echo ""
}

# 生成 favicon.ico（需要 ImageMagick）
generate_favicon_ico() {
    if ! command -v convert &> /dev/null; then
        echo -e "${YELLOW}⚠️  跳过 favicon.ico 生成 (需要 ImageMagick)${NC}"
        echo ""
        return
    fi

    echo -e "${YELLOW}生成 favicon.ico...${NC}"

    # 使用 16x16 和 32x32 合并为 .ico
    convert "$ASSETS_DIR/favicon-16x16.png" \
            "$ASSETS_DIR/favicon-32x32.png" \
            "$ASSETS_DIR/favicon.ico"

    echo "  → favicon.ico"
    echo -e "${GREEN}✅ favicon.ico 生成完成${NC}"
    echo ""
}

# 显示生成的文件列表
show_results() {
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}✨ 所有资源生成完成！${NC}"
    echo ""
    echo "生成的文件:"
    echo ""

    files=(
        "favicon-16x16.png"
        "favicon-32x32.png"
        "favicon-192x192.png"
        "apple-touch-icon.png"
        "icon-192x192.png"
        "icon-512x512.png"
        "og-image.png"
        "favicon.ico"
    )

    for file in "${files[@]}"; do
        filepath="$ASSETS_DIR/$file"
        if [ -f "$filepath" ]; then
            size=$(du -h "$filepath" | cut -f1)
            echo -e "  ${GREEN}✓${NC} $file ($size)"
        else
            echo -e "  ${RED}✗${NC} $file (未生成)"
        fi
    done

    echo ""
    echo -e "${YELLOW}下一步:${NC}"
    echo "  1. 检查生成的图片质量"
    echo "  2. 更新 landing/index.html 中的图标引用"
    echo "  3. 提交到 Git"
    echo ""
}

# 主函数
main() {
    check_dependencies
    generate_favicons
    generate_apple_icon
    generate_pwa_icons
    generate_og_image
    generate_favicon_ico
    show_results
}

# 运行
main
