#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SDK_DIR="${ANDROID_HOME:-"$HOME/Library/Android/sdk"}"
BUILD_TOOLS_DIR="${ANDROID_BUILD_TOOLS:-"$SDK_DIR/build-tools/37.0.0"}"
PLATFORM_JAR="${ANDROID_PLATFORM_JAR:-"$SDK_DIR/platforms/android-36.1/android.jar"}"
JBR_HOME="${JBR_HOME:-"/Applications/Android Studio.app/Contents/jbr/Contents/Home"}"
export JAVA_HOME="$JBR_HOME"
export PATH="$JBR_HOME/bin:$PATH"

APP_ID="com.algernon.bazi"
VERSION_NAME="0.1.0"
VERSION_CODE="1"

SHELL_DIR="$ROOT_DIR/android-webview-shell"
H5_DIR="$ROOT_DIR/dist/build/h5"
OUT_DIR="$ROOT_DIR/dist/apk"
WORK_DIR="$OUT_DIR/work"
WWW_DIR="$WORK_DIR/assets/www"

AAPT2="$BUILD_TOOLS_DIR/aapt2"
D8="$BUILD_TOOLS_DIR/d8"
ZIPALIGN="$BUILD_TOOLS_DIR/zipalign"
APKSIGNER="$BUILD_TOOLS_DIR/apksigner"
JAVAC="$JBR_HOME/bin/javac"
KEYTOOL="$JBR_HOME/bin/keytool"

require_file() {
  if [ ! -f "$1" ]; then
    echo "Missing required file: $1" >&2
    exit 1
  fi
}

require_dir() {
  if [ ! -d "$1" ]; then
    echo "Missing required directory: $1" >&2
    exit 1
  fi
}

require_file "$AAPT2"
require_file "$D8"
require_file "$ZIPALIGN"
require_file "$APKSIGNER"
require_file "$JAVAC"
require_file "$KEYTOOL"
require_file "$PLATFORM_JAR"
require_dir "$H5_DIR"

rm -rf "$WORK_DIR"
mkdir -p "$WWW_DIR" "$WORK_DIR/compiled" "$WORK_DIR/gen" "$WORK_DIR/classes" "$WORK_DIR/dex" "$OUT_DIR"

cp -R "$H5_DIR/." "$WWW_DIR/"
perl -0pi -e 's/(href|src)="\/assets\//$1="assets\//g' "$WWW_DIR/index.html"

"$AAPT2" compile --dir "$SHELL_DIR/res" -o "$WORK_DIR/compiled/res.zip"

"$AAPT2" link \
  -o "$WORK_DIR/base.apk" \
  -I "$PLATFORM_JAR" \
  --manifest "$SHELL_DIR/AndroidManifest.xml" \
  -R "$WORK_DIR/compiled/res.zip" \
  --java "$WORK_DIR/gen" \
  --custom-package "$APP_ID" \
  --min-sdk-version 23 \
  --target-sdk-version 36 \
  --version-code "$VERSION_CODE" \
  --version-name "$VERSION_NAME" \
  --auto-add-overlay

JAVA_SOURCES=()
while IFS= read -r -d '' file; do
  JAVA_SOURCES+=("$file")
done < <(find "$SHELL_DIR/java" "$WORK_DIR/gen" -name "*.java" -print0)

"$JAVAC" \
  -source 8 \
  -target 8 \
  -bootclasspath "$PLATFORM_JAR" \
  -classpath "$PLATFORM_JAR" \
  -encoding UTF-8 \
  -d "$WORK_DIR/classes" \
  "${JAVA_SOURCES[@]}"

CLASS_FILES=()
while IFS= read -r -d '' file; do
  CLASS_FILES+=("$file")
done < <(find "$WORK_DIR/classes" -name "*.class" -print0)

"$D8" \
  --lib "$PLATFORM_JAR" \
  --min-api 23 \
  --output "$WORK_DIR/dex" \
  "${CLASS_FILES[@]}"

cp "$WORK_DIR/dex/classes.dex" "$WORK_DIR/classes.dex"
cp "$WORK_DIR/base.apk" "$WORK_DIR/unsigned-unaligned.apk"

(cd "$WORK_DIR" && zip -q -r "$WORK_DIR/unsigned-unaligned.apk" classes.dex assets)

"$ZIPALIGN" -f 4 "$WORK_DIR/unsigned-unaligned.apk" "$WORK_DIR/unsigned-aligned.apk"

KEYSTORE="$OUT_DIR/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
  "$KEYTOOL" -genkeypair \
    -keystore "$KEYSTORE" \
    -storepass android \
    -keypass android \
    -alias androiddebugkey \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US" >/dev/null
fi

APK_PATH="$OUT_DIR/bazi-mvp-0.1.0-debug.apk"
"$APKSIGNER" sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out "$APK_PATH" \
  "$WORK_DIR/unsigned-aligned.apk"

"$APKSIGNER" verify --verbose --print-certs "$APK_PATH"
echo "$APK_PATH"
