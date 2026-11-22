#!/usr/bin/env python3
"""Adds studyChapters and studyTopics to every certification in data/certifications.json,
counted from its complete study guide. Run from the project root:

    python3 tools/build_study_stats.py
"""
import json, pathlib
from bs4 import BeautifulSoup

ROOT = pathlib.Path(__file__).resolve().parent.parent
GUIDE_FILES = {
    "ad0-e207": "Complete_Study_Guide_AD0-E207.html",
    "ad0-e408": "Complete_Study_Guide_AD0-E408.html",
    "ad0-e409": "Complete_Study_Guide_AD0-E409.html",
    "ad0-e607": "Complete_Study_Guide_AD0-E607.html",
    "ad0-e605": "Complete_Study_Guide_AD0-E605.html",
    "ad0-e606": "Complete_Study_Guide_AD0-E606.html",
}
SKIP = {"start", "quiz", "check", "sources", "exam", "pitfalls", "plan", "labs"}

def count(filename):
    soup = BeautifulSoup((ROOT / filename).read_text(encoding="utf8"), "html.parser")
    subject = soup.select_one("section.subject")
    if subject is not None:  # guides organised as subject > part > h4
        parts = [p for p in subject.select(":scope > section.part")
                 if not (p.select_one(".kind") and p.select_one(".kind").get_text(strip=True) == "Practice")]
        topics = sum(len(p.select("h4")) for p in parts)
        return len(parts), topics
    sections = [s for s in soup.select("main section[id]") if s["id"] not in SKIP and s.find("h2")]
    topics = sum(len(s.select("h3")) for s in sections)
    return len(sections), topics

def main():
    path = ROOT / "data" / "certifications.json"
    certs = json.loads(path.read_text(encoding="utf8"))
    for cert in certs:
        chapters, topics = count(GUIDE_FILES[cert["id"]])
        cert["studyChapters"], cert["studyTopics"] = chapters, topics
        print(f'{cert["code"]}: {chapters} chapters, {topics} topics')
    path.write_text(json.dumps(certs, ensure_ascii=False, indent=2), encoding="utf8")

if __name__ == "__main__":
    main()
