# cd into directory of this file
script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "${script_path}"

# cd into Hozon's root folder
echo "${script_path}"