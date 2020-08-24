#!/bin/bash

BLACK="\033[0;30m"
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
MAGENTA="\033[0;35m"
CYAN="\033[0;36m"
DEFAULT="\033[0;37m"
DARK_GRAY="\033[1;30m"
FG_RED="\033[1;31m"
FG_GREEN="\033[1;32m"
FG_YELLOW="\033[1;33m"
FG_BLUE="\033[1;34m"
FG_MAGENTA="\033[1;35m"
FG_CYAN="\033[1;36m"
FG_WHITE="\033[1;37m"

_success () {
  echo -e "${FG_GREEN}✔ ${FG_WHITE}${1}${DEFAULT}"
}

_info () {
  echo -e "${FG_CYAN}i ${FG_WHITE}${1}${DEFAULT}"
}

# unzip
# if dpkg --get-selections | grep -q "^unzip[[:space:]]*install$" >/dev/null; then
#   _success "unzip installed"
# else
#   _info "installing unzip"
#   sudo apt install unzip
# fi

# tar
if dpkg --get-selections | grep -q "^tar[[:space:]]*install$" >/dev/null; then
  _success "tar installed"
else
  _info "installing tar"
  sudo apt install tar
fi

# curl
if dpkg --get-selections | grep -q "^curl[[:space:]]*install$" >/dev/null; then
  _success "curl installed"
else
  _info "installing curl"
  sudo apt install curl
fi

script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "${script_path}"
mkdir -p bin

# FFmpeg
if [ -f bin/ffmpeg ]; then
  _success "Found FFmpeg binary"
else
  _info "Downloading ffmpeg ..."
  cd bin
  curl -s -o "ffmpeg.tar.xz" "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz"
  tar -xf "ffmpeg.tar.xz"
  rm "ffmpeg.tar.xz"

  _info "Moving ffmpeg binary to bin/ ..."
  cd */.
  mv ffmpeg ../

  _info "Cleaning up ..."
  rm -rf *
  cd ..
  rmdir *
  chmod 700 ffmpeg
  cd ..
  _success "Installed FFmpeg"
fi

# youtube-dl
if [ -f bin/youtube-dl ]; then
  _success "Found youtube-dl binary"
else
  _info "Downloading youtube-dl ..."
  cd bin
  curl -s -L "https://yt-dl.org/downloads/latest/youtube-dl" -o "youtube-dl"

  chmod a+rx youtube-dl
  cd ..
  _success "Installed youtube-dl"
fi

# Rclone
# if [ -f bin/rclone ]; then
#   _success "Found Rclone binary"
# else
#   _info "Downloading rclone ..."
#   cd bin
#   curl -s -o "rclone.zip" "https://downloads.rclone.org/rclone-current-linux-amd64.zip"
#   unzip -qq rclone.zip
#   rm rclone.zip

#   _info "Moving rclone binary to bin/ ..."
#   cd */.
#   mv rclone ../
  
#   _info "Cleaning up ..."
#   rm -rf *
#   cd ..
#   rmdir *
#   chmod 700 rclone
#   cd ..
#   _success "Installed rclone"
# fi

# Rclone config
# if [ -f conf/rclone.conf ]; then
#   _success "Found rclone.conf"
# else
#   _info "Configuring rclone ..."
#   bin/rclone config --config conf/rclone.conf
# fi

# node_modules
if [ -d node_modules ]; then
  _success "Found node modules/"
else
  _info "Installing node modules"
  npm i
fi
