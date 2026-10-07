import re, sys
src = open(sys.argv[1], encoding='utf-8').read()
js = re.search(r'<script>(.*?)</script>', src, re.S).group(1)
open(sys.argv[2], 'w', encoding='utf-8').write(js)
