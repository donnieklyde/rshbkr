import urllib.request
import re

url = "https://drive.google.com/drive/folders/1ZpiEEoBDE1HG9xjyAeiyLd5-X4Zv5cqn?usp=sharing"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    matches = re.findall(r'\["([a-zA-Z0-9_-]{22,35})",.*?"([^"]+\.mp3)"', html, re.IGNORECASE)
    if not matches:
        # try escaped HTML format
        matches = re.findall(r'&quot;([a-zA-Z0-9_-]{22,35})&quot;.*?&quot;((?:(?!&quot;).)*?\.mp3)&quot;', html, re.IGNORECASE)
        
    unique_matches = {m[0]: m[1] for m in matches}
    for uid, name in unique_matches.items():
        print(f"ID: {uid} Name: {name}")
    with open("drive_html.txt", "w", encoding="utf-8") as f:
        f.write(html)
except Exception as e:
    print("Error:", e)
