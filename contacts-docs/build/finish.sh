#!/bin/bash
set -e
cd /home/user/Roselle
node contacts-docs/build/report.js >/dev/null
cd contacts-docs
rm -rf unpacked && unzip -q Contacts_CT1552_Project_Report.docx -d unpacked
python3 - << 'PY'
import re
p='unpacked/word/document.xml'
s=open(p,encoding='utf-8').read()
patch=lambda m: re.sub(r'(<w:(?:top|left|bottom|right)\b[^/>]*?)/>', r'\1 w:shadow="true"/>', m.group(0))
s2,n=re.subn(r'<w:pgBorders\b.*?</w:pgBorders>', patch, s, flags=re.S)
open(p,'w',encoding='utf-8').write(s2)
print('pgBorders patched:', n, '| shadow attrs:', s2.count('w:shadow="true"'))
PY
cd unpacked && rm -f ../Contacts_CT1552_Project_Report.docx && zip -Xrq ../Contacts_CT1552_Project_Report.docx .
cd ..
python3 /root/.claude/skills/synced/8fb9e915-b342-4a50-9035-bf79f53b30c1_98e87e5a-ea90-4bd2-b55b-2ae2e909e530/docx/scripts/office/validate.py Contacts_CT1552_Project_Report.docx 2>&1 | tail -2
rm -rf render && mkdir render && cd render
python3 /root/.claude/skills/synced/8fb9e915-b342-4a50-9035-bf79f53b30c1_98e87e5a-ea90-4bd2-b55b-2ae2e909e530/docx/scripts/office/soffice.py --headless --convert-to pdf ../Contacts_CT1552_Project_Report.docx >/dev/null 2>&1
pdftoppm -jpeg -r 70 Contacts_CT1552_Project_Report.pdf page
echo "pages: $(ls page-*.jpg | wc -l)"
